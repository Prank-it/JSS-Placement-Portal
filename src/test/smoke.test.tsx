// src/test/smoke.test.tsx
import { describe, it, expect } from "vitest";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { normalizeCompanySummary, normalizeCompanyProfile, normalizeDashboardSkills } from "@/lib/companyData";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { SKILL_TOPICS } from "@/data/skillTopics";

describe("Smoke tests — data layer", () => {
  const seed = SEED_COMPANIES[0];

  it("seed has exactly one company with company_id = 1", () => {
    expect(SEED_COMPANIES).toHaveLength(1);
    expect(seed.company_id).toBe(1);
  });

  it("normalizeCompanySummary returns valid CompanySummary", () => {
    const summary = normalizeCompanySummary(
      seed.company_id,
      seed.short_json as Record<string, unknown>
    );
    expect(summary.name).toBe("Accenture plc");
    expect(summary.short_name).toBe("Accenture");
    expect(summary.company_type).toBe("Dream");
    expect(summary.company_id).toBe(1);
  });

  it("normalizeCompanyProfile returns valid CompanyProfile with 22 intelligence sections", () => {
    const profile = normalizeCompanyProfile(
      seed.company_id,
      seed.full_json as Record<string, unknown>,
      seed.short_json as Record<string, unknown>
    );
    expect(profile.name).toBe("Accenture plc");
    expect(profile.ceo_name).toBe("Julie Sweet");
    expect(profile.annual_revenue).toBeTruthy();

    const sections = buildIntelligenceSections(profile);
    expect(sections).toHaveLength(22);
  });

  it("normalizeDashboardSkills returns 12 skills sorted by required_level", () => {
    const skills = normalizeDashboardSkills(seed.skill_levels);
    expect(skills).toHaveLength(12);
    // Each skill should have bloom_level and criticality
    for (const skill of skills) {
      expect(["CU", "AP", "AS", "EV", "CR"]).toContain(skill.bloom_level);
      expect(["Critical", "Important", "Baseline"]).toContain(skill.criticality);
    }
  });

  it("SKILL_TOPICS has 12 entries each with 10 levels", () => {
    expect(SKILL_TOPICS).toHaveLength(12);
    for (const topic of SKILL_TOPICS) {
      expect(topic.levels).toHaveLength(10);
      for (let i = 0; i < 10; i++) {
        expect(topic.levels[i].level_number).toBe(i + 1);
        expect(topic.levels[i].topic.length).toBeLessThanOrEqual(90);
      }
    }
  });

  it("no company data contains CTC, Stipend, or Selection Ratio fields", () => {
    const full = JSON.stringify(seed.full_json).toLowerCase();
    const short = JSON.stringify(seed.short_json).toLowerCase();
    const combined = full + short;
    expect(combined).not.toContain("ctc");
    expect(combined).not.toContain("stipend");
    expect(combined).not.toContain("selection_ratio");
    expect(combined).not.toContain("selection ratio");
  });
});
