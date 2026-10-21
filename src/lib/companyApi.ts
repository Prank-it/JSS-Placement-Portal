// src/lib/companyApi.ts
//
// Phase 2 data-access layer.
// Three React Query hooks that read from Supabase and pipe rows through
// the same normalizers already used in Phase 1, so the UI is unchanged.
//
// Tables used:
//   company data  → public.company_json          (short_json / full_json JSONB)
//   skill data    → public.company_skill_levels  (join to three master tables)
//                   public.skill_set_master
//                   public.proficiency_levels
//                   public.skill_set_topics
//
// No other tables are queried.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
import {
  normalizeCompanySummary,
  normalizeCompanyProfile,
  normalizeDashboardSkills,
  type CompanySummary,
  type CompanyProfile,
  type DashboardSkill,
} from "./companyData";

// ─── Types matching Supabase row shapes ──────────────────────────────────────

interface CompanyJsonRow {
  company_id: number;
  short_json: Record<string, unknown>;
  full_json?: Record<string, unknown>;
}

interface SkillLevelRow {
  company_id: number;
  skill_set_id: number;
  required_level: number;
  required_proficiency_level_id: number;
}

interface SkillSetMasterRow {
  skill_set_id: number;
  skill_set_name: string;
  short_name: string | null;
}

interface ProficiencyLevelRow {
  proficiency_level_id: number;
  proficiency_name: string;
  proficiency_code: string | null;
}

interface SkillSetTopicRow {
  skill_set_id: number;
  level_number: number;
  topics: string;
}

// The shape SkillCard reads via SKILL_TOPICS.find(…).levels
export interface TopicLevel {
  level_number: number;
  topic: string;
}

// Extended DashboardSkill that also carries the 10-level roadmap
export interface DashboardSkillWithTopics extends DashboardSkill {
  topics: TopicLevel[];
}

// ─── Query key factory ───────────────────────────────────────────────────────

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  profile: (id: number) => [...companyKeys.all, "profile", id] as const,
  skills: (id: number) => [...companyKeys.all, "skills", id] as const,
};

// ─── Hook: useCompanies ──────────────────────────────────────────────────────
//
// SELECT company_id, short_json FROM company_json
// Returns CompanySummary[] — identical shape to what Index.tsx renders.

export function useCompanies() {
  return useQuery<CompanySummary[], Error>({
    queryKey: companyKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_json")
        .select("company_id, short_json")
        .order("company_id", { ascending: true });

      if (error) throw new Error(error.message);
      if (!data) return [];

      return (data as CompanyJsonRow[]).map((row) =>
        normalizeCompanySummary(row.company_id, row.short_json)
      );
    },
  });
}

// ─── Hook: useCompanyProfile ─────────────────────────────────────────────────
//
// SELECT company_id, short_json, full_json
// FROM company_json
// WHERE company_id = :id
// Returns CompanyProfile | null — identical shape to what CompanyIntelligence renders.

export function useCompanyProfile(id: number | null) {
  return useQuery<CompanyProfile | null, Error>({
    queryKey: companyKeys.profile(id ?? 0),
    enabled: id !== null && id > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_json")
        .select("company_id, short_json, full_json")
        .eq("company_id", id!)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) return null;

      const row = data as CompanyJsonRow;
      return normalizeCompanyProfile(
        row.company_id,
        (row.full_json ?? {}) as Record<string, unknown>,
        row.short_json as Record<string, unknown>
      );
    },
  });
}

// ─── Hook: useCompanySkills ──────────────────────────────────────────────────
//
// Queries four tables and assembles the data that SkillIntelligence needs:
//   1. company_skill_levels  — the required level per skill for this company
//   2. skill_set_master      — maps skill_set_id → skill_set_name
//   3. proficiency_levels    — maps proficiency_level_id → proficiency_name
//   4. skill_set_topics      — 10-level topic strings per skill
//
// Returns DashboardSkillWithTopics[] sorted desc by required_level.

export function useCompanySkills(companyId: number | null) {
  return useQuery<DashboardSkillWithTopics[], Error>({
    queryKey: companyKeys.skills(companyId ?? 0),
    enabled: companyId !== null && companyId > 0,
    queryFn: async () => {
      // 1. Fetch the four tables in parallel (all reads, no joins in Supabase).
      const [levelsRes, mastersRes, proficiencyRes, topicsRes] =
        await Promise.all([
          supabase
            .from("company_skill_levels")
            .select("company_id, skill_set_id, required_level, required_proficiency_level_id")
            .eq("company_id", companyId!),

          supabase
            .from("skill_set_master")
            .select("skill_set_id, skill_set_name, short_name"),

          supabase
            .from("proficiency_levels")
            .select("proficiency_level_id, proficiency_name, proficiency_code"),

          supabase
            .from("skill_set_topics")
            .select("skill_set_id, level_number, topics"),
        ]);

      // Surface any Supabase errors.
      if (levelsRes.error) throw new Error(`company_skill_levels: ${levelsRes.error.message}`);
      if (mastersRes.error) throw new Error(`skill_set_master: ${mastersRes.error.message}`);
      if (proficiencyRes.error) throw new Error(`proficiency_levels: ${proficiencyRes.error.message}`);
      if (topicsRes.error) throw new Error(`skill_set_topics: ${topicsRes.error.message}`);

      const levels = (levelsRes.data ?? []) as SkillLevelRow[];
      const masters = (mastersRes.data ?? []) as SkillSetMasterRow[];
      const proficiencies = (proficiencyRes.data ?? []) as ProficiencyLevelRow[];
      const topicRows = (topicsRes.data ?? []) as SkillSetTopicRow[];

      // 2. Build lookup maps for O(1) access.
      const masterMap = new Map<number, SkillSetMasterRow>(
        masters.map((m) => [m.skill_set_id, m])
      );
      const proficiencyMap = new Map<number, ProficiencyLevelRow>(
        proficiencies.map((p) => [p.proficiency_level_id, p])
      );

      // Topics per skill_set_id: level_number → topic string.
      const topicsMap = new Map<number, TopicLevel[]>();
      for (const row of topicRows) {
        const existing = topicsMap.get(row.skill_set_id) ?? [];
        existing.push({ level_number: row.level_number, topic: row.topics });
        topicsMap.set(row.skill_set_id, existing);
      }
      // Sort each skill's topic levels in ascending order.
      for (const [id, levels] of topicsMap) {
        topicsMap.set(
          id,
          levels.sort((a, b) => a.level_number - b.level_number)
        );
      }

      // 3. Assemble the row shape normalizeDashboardSkills expects.
      const assembled = levels
        .map((row) => {
          const master = masterMap.get(row.skill_set_id);
          const proficiency = proficiencyMap.get(row.required_proficiency_level_id);

          if (!master) return null; // skip unknown skill_set_ids

          return {
            skill_set_id: row.skill_set_id,
            skill_set_name: master.skill_set_name,
            required_level: row.required_level,
            required_proficiency: proficiency?.proficiency_name ?? String(row.required_proficiency_level_id),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      // 4. Run through the existing normalizer to get bloom_level, criticality, difficulty.
      const normalized = normalizeDashboardSkills(assembled);

      // 5. Attach topics and sort descending by required_level.
      return normalized
        .map((skill) => ({
          ...skill,
          topics: topicsMap.get(skill.skill_set_id) ?? [],
        }))
        .sort((a, b) => b.required_level - a.required_level);
    },
  });
}
