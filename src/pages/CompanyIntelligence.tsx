// src/pages/CompanyIntelligence.tsx
import { useEffect, useRef, useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Star, RefreshCcw, Building2 } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useCompanyProfile } from "@/lib/companyApi";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import type { IntelligenceField } from "@/data/intelligenceData";

// --- Helpers ---

function isNullish(val: string | string[]): boolean {
  if (Array.isArray(val)) return val.length === 0;
  const v = String(val).trim().toLowerCase();
  return !v || ["na", "n/a", "none", "-", "null", "undefined", ""].includes(v);
}

function isUrl(val: string): boolean {
  return val.startsWith("http://") || val.startsWith("https://");
}

function isVideoUrl(val: string): boolean {
  return val.includes("youtube") || val.includes("youtu.be") || val.includes("vimeo");
}

function isRatingStr(label: string): boolean {
  return label.toLowerCase().includes("rating");
}

function RatingStars({ val }: { val: string }) {
  const num = parseFloat(val);
  if (isNaN(num)) return <span className="text-sm text-foreground">{val}</span>;
  const max = val.includes("/5") ? 5 : val.includes("/10") ? 10 : 5;
  const pct = (num / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex">
        <div className="flex gap-0.5 text-gray-200">
          {Array.from({ length: max > 5 ? 5 : max }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5" fill="currentColor" />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 text-yellow-400 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: max > 5 ? 5 : max }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" />
          ))}
        </div>
      </div>
      <span className="text-sm font-medium text-foreground">{val}</span>
    </div>
  );
}

function renderValue(field: IntelligenceField) {
  const { label, value, type } = field;

  if (isNullish(value)) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-xs px-2 py-0.5">
        Not Available
      </span>
    );
  }

  // List rendering
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs px-2.5 py-0.5 border border-[#2563EB]/20"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  const strVal = String(value);

  // Rating
  if (type === "rating" || isRatingStr(label)) {
    if (isNullish(strVal)) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-xs px-2 py-0.5">
          Not Available
        </span>
      );
    }
    return <RatingStars val={strVal} />;
  }

  // Video URL
  if (type === "video" || (type !== "text" && isVideoUrl(strVal))) {
    return (
      <a
        href={strVal}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline"
      >
        Watch Video <ExternalLink className="w-3.5 h-3.5" />
      </a>
    );
  }

  // URL
  if (type === "url" || (type !== "text" && isUrl(strVal))) {
    return (
      <a
        href={strVal}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline break-all"
      >
        {strVal} <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      </a>
    );
  }

  // Paragraph
  if (type === "paragraph") {
    return <p className="text-sm text-foreground leading-relaxed">{strVal}</p>;
  }

  // Auto-detect semicolons or commas → pill list
  if (strVal.includes(";") || (strVal.includes(",") && strVal.split(",").length > 2)) {
    const items = strVal.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-secondary text-foreground text-xs px-2.5 py-0.5"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-foreground">{strVal}</span>;
}

// Memoized section card — identical to Phase 1
const SectionCard = memo(function SectionCard({
  section,
}: {
  section: ReturnType<typeof buildIntelligenceSections>[number];
}) {
  return (
    <div id={`section-${section.id}`} className="border border-border rounded-lg bg-white overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#F8FAFC]">
        <span className="text-[#2563EB]">{section.icon}</span>
        <h2 className="font-heading font-semibold text-sm text-foreground">
          {section.title}
        </h2>
        <span className="ml-auto inline-flex items-center rounded-full bg-secondary text-muted-foreground text-xs px-2 py-0.5">
          {section.fields.length} fields
        </span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-border">
        {section.fields.map((field, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-start gap-1.5 px-4 py-3"
          >
            <span className="text-xs font-medium text-muted-foreground sm:w-1/3 sm:flex-shrink-0 pt-0.5">
              {field.label}
            </span>
            <div className="sm:w-2/3">{renderValue(field)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Section skeleton for loading state
function SectionSkeleton() {
  return (
    <div className="border border-border rounded-lg bg-white overflow-hidden animate-pulse">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#F8FAFC]">
        <div className="w-4 h-4 rounded bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyIntelligence() {
  const navigate = useNavigate();
  const { selected } = useCompany();
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Guard: navigate home if no company selected
  useEffect(() => {
    if (!selected) {
      navigate("/");
    }
  }, [selected, navigate]);

  // ── Supabase: fetch full profile ──────────────────────────────────────────
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanyProfile(selected?.companyId ?? null);

  // Build sections from Supabase data (or empty skeleton while loading)
  const sections = buildIntelligenceSections(profile);

  // Scroll-spy: detect which section is in view
  useEffect(() => {
    if (isLoading || !profile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            const idx = sections.findIndex((s) => s.id === id);
            if (idx !== -1) {
              setActiveTab(idx);
              tabRefs.current[idx]?.scrollIntoView({
                block: "nearest",
                inline: "center",
                behavior: "smooth",
              });
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, isLoading, profile]);

  const scrollToSection = useCallback(
    (idx: number) => {
      isScrollingRef.current = true;
      setActiveTab(idx);
      const el = document.getElementById(`section-${sections[idx].id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [sections]
  );

  if (!selected) return null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky top info bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-5xl">
          {/* Left: logo + name + sector */}
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              name={selected.companyName}
              logoUrl={selected.logoUrl}
              size={40}
            />
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-base text-foreground truncate">
                {selected.companyName}
              </h1>
              {profile?.category && (
                <span className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-0.5 mt-0.5 border border-[#2563EB]/20">
                  {profile.category}
                </span>
              )}
            </div>
          </div>

          {/* Right: website + linkedin */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {profile?.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium border border-border rounded-md px-2.5 py-1.5 text-[#334155] hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}
            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium border border-border rounded-md px-2.5 py-1.5 text-[#334155] hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sticky tab bar — only shown when data is available */}
      {!isLoading && !isError && (
        <div className="sticky top-[65px] z-10 bg-white border-b border-border">
          <div
            ref={tabsRef}
            className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2"
          >
            {sections.map((section, idx) => (
              <button
                key={section.id}
                ref={(el) => { tabRefs.current[idx] = el; }}
                onClick={() => scrollToSection(idx)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                  activeTab === idx
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="flex-1 px-4 py-6 max-w-5xl w-full mx-auto space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SectionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {isError && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
          <RefreshCcw className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
            Could not load company data
          </h3>
          <p className="text-sm text-muted-foreground mb-1 max-w-sm">
            {error?.message ?? "An unknown error occurred."}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Check that your Supabase credentials are set in{" "}
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

      {/* ── Intelligence sections ── */}
      {!isLoading && !isError && profile && (
        <div className="flex-1 px-4 py-6 max-w-5xl w-full mx-auto space-y-4">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* ── No profile found ── */}
      {!isLoading && !isError && !profile && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
            No intelligence data found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Detailed profile information is not available for this company.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      )}
    </div>
  );
}
