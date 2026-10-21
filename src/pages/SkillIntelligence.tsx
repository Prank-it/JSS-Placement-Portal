// src/pages/SkillIntelligence.tsx
import { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Lock, RefreshCcw } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useCompanySkills, type DashboardSkillWithTopics, type TopicLevel } from "@/lib/companyApi";
import { CompanyLogo } from "@/components/shared/CompanyLogo";

// ---- Bloom configuration ----
const BLOOM_CONFIG = {
  CU: {
    label: "Remember",
    code: "CU",
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    progressColor: "bg-blue-500",
  },
  AP: {
    label: "Understand",
    code: "AP",
    color: "#22c55e",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    progressColor: "bg-green-500",
  },
  AS: {
    label: "Apply",
    code: "AS",
    color: "#eab308",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    progressColor: "bg-yellow-500",
  },
  EV: {
    label: "Analyze",
    code: "EV",
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    progressColor: "bg-red-500",
  },
  CR: {
    label: "Evaluate",
    code: "CR",
    color: "#a855f7",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    progressColor: "bg-purple-500",
  },
} as const;

const CRITICALITY_CONFIG = {
  Critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  Important: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Baseline: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

// ---- SkillCard ----
// topics are now passed as a prop (from Supabase via useCompanySkills),
// so the card no longer depends on the SKILL_TOPICS module at all.
const SkillCard = memo(function SkillCard({
  skill,
  rank,
}: {
  skill: DashboardSkillWithTopics;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const bloom = BLOOM_CONFIG[skill.bloom_level];
  const crit = CRITICALITY_CONFIG[skill.criticality];
  const pct = (skill.required_level / 10) * 100;

  // Topics now come directly from the skill object (from Supabase).
  const topics: TopicLevel[] = skill.topics;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
        </div>

        {/* Skill info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              {skill.skill_set_name}
            </h3>
            <div className="flex items-center gap-1.5">
              {/* Bloom badge */}
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${bloom.bg} ${bloom.text} ${bloom.border}`}
              >
                {skill.bloom_level}
              </span>
              {/* Criticality badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${crit.bg} ${crit.text} ${crit.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${crit.dot}`} />
                {skill.criticality}
              </span>
            </div>
          </div>

          {/* Score + progress */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${bloom.progressColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground flex-shrink-0">
              {skill.required_level}/10
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {skill.required_proficiency}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{skill.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary border-t border-border transition-colors"
      >
        <span>10-Level Roadmap</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Roadmap levels */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {topics.map((level) => {
            const isLocked = level.level_number > skill.required_level;
            const isCurrent = level.level_number === skill.required_level;
            const isPassed = level.level_number < skill.required_level;

            return (
              <div
                key={level.level_number}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  isLocked ? "opacity-50" : ""
                } ${isCurrent ? "bg-[#EFF6FF]" : isPassed ? "bg-green-50/50" : ""}`}
              >
                {/* Level indicator */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? `${bloom.bg} ${bloom.text}`
                      : isPassed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {level.level_number}
                </div>

                {/* Topic text */}
                <span
                  className={`text-xs flex-1 ${
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isPassed
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  {level.topic}
                </span>

                {/* Lock icon if beyond target */}
                {isLocked && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Beyond scope</span>
                  </div>
                )}

                {/* Current marker */}
                {isCurrent && (
                  <span
                    className={`flex-shrink-0 text-[10px] font-semibold ${bloom.text} px-1.5 py-0.5 rounded ${bloom.bg}`}
                  >
                    Target
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// ---- Skeleton card for loading state ----
function SkillSkeleton() {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-1.5 bg-gray-100 rounded-full w-full mt-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ---- Page ----
export default function SkillIntelligence() {
  const navigate = useNavigate();
  const { selected } = useCompany();

  useEffect(() => {
    if (!selected) {
      navigate("/");
    }
  }, [selected, navigate]);

  // ── Supabase: fetch skill data ─────────────────────────────────────────────
  const {
    data: skills = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanySkills(selected?.companyId ?? null);

  if (!selected) return null;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <CompanyLogo
            name={selected.companyName}
            logoUrl={selected.logoUrl}
            size={36}
          />
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">
              {selected.companyName} Skill Intelligence
            </h1>
            <p className="text-xs text-muted-foreground">
              Skill requirements and 10-level learning roadmaps
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Bloom legend */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Bloom Taxonomy Levels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(BLOOM_CONFIG) as Array<keyof typeof BLOOM_CONFIG>).map(
              (key) => {
                const cfg = BLOOM_CONFIG[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 border ${cfg.bg} ${cfg.border}`}
                  >
                    <span className={`font-bold text-xs ${cfg.text}`}>
                      {cfg.code}
                    </span>
                    <span className="text-xs text-gray-600">{cfg.label}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Criticality legend */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Criticality Levels
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(
              Object.keys(CRITICALITY_CONFIG) as Array<
                keyof typeof CRITICALITY_CONFIG
              >
            ).map((key) => {
              const cfg = CRITICALITY_CONFIG[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 border ${cfg.bg} ${cfg.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${cfg.text}`}>{key}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Required Skills
            </h2>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RefreshCcw className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-heading font-semibold text-base text-foreground mb-1">
              Could not load skill data
            </h3>
            <p className="text-sm text-muted-foreground mb-1 max-w-sm">
              {error?.message ?? "An unknown error occurred."}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Check your Supabase credentials in{" "}
              <code className="bg-secondary px-1 rounded">.env</code>.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* ── Skill cards ── */}
        {!isLoading && !isError && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Required Skills ({skills.length})
            </h2>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <SkillCard key={skill.skill_set_id} skill={skill} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
