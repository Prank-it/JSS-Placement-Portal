// src/pages/Index.tsx
import { useState, useMemo, useCallback } from "react";
import { Search, X, Building2, ArrowUpDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { CompanyCard } from "@/components/shared/CompanyCard";
import { useCompanies } from "@/lib/companyApi";
import { matchCategory, type CompanySummary } from "@/lib/companyData";

const CATEGORY_FILTERS = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

type SortOption = "default" | "name-asc" | "name-desc" | "growth-desc";

const CATEGORY_STYLES: Record<
  string,
  { active: string; inactive: string; dot: string }
> = {
  All: {
    active: "bg-[#334155] text-white border-[#334155]",
    inactive: "bg-white text-[#334155] border-[#E5E7EB] hover:bg-gray-50",
    dot: "",
  },
  "Super Dream": {
    active: "bg-[#7c3aed] text-white border-[#7c3aed]",
    inactive: "bg-white text-[#7c3aed] border-[#7c3aed]/30 hover:bg-purple-50",
    dot: "bg-[#7c3aed]",
  },
  Dream: {
    active: "bg-[#2563eb] text-white border-[#2563eb]",
    inactive: "bg-white text-[#2563eb] border-[#2563eb]/30 hover:bg-blue-50",
    dot: "bg-[#2563eb]",
  },
  Standard: {
    active: "bg-[#16a34a] text-white border-[#16a34a]",
    inactive: "bg-white text-[#16a34a] border-[#16a34a]/30 hover:bg-green-50",
    dot: "bg-[#16a34a]",
  },
  Regular: {
    active: "bg-[#d97706] text-white border-[#d97706]",
    inactive: "bg-white text-[#d97706] border-[#d97706]/30 hover:bg-orange-50",
    dot: "bg-[#d97706]",
  },
};

// Skeleton card (used for both loading and initial state)
function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded bg-gray-100" />
        <div className="w-16 h-5 rounded-full bg-gray-100" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/5" />
      </div>
    </div>
  );
}

export default function Index() {
  const [searchRaw, setSearchRaw] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const search = useDebounce(searchRaw, 200);

  // ── Supabase data ──────────────────────────────────────────────────────────
  const { data: allCompanies = [], isLoading, isError, error, refetch } = useCompanies();

  const filtered = useMemo(() => {
    let result: CompanySummary[] = allCompanies;

    // Category filter using robust normalization/matching
    if (activeFilter !== "All") {
      result = result.filter((c) => matchCategory(c.company_type, activeFilter));
    }

    // Search filter across name, short_name, headquarters, category, and company_type
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.short_name.toLowerCase().includes(q) ||
          c.headquarters_address.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.company_type.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "growth-desc") {
      result = [...result].sort((a, b) => {
        const gA = parseFloat(a.yoy_growth_rate.replace(/[^0-9.-]/g, "")) || 0;
        const gB = parseFloat(b.yoy_growth_rate.replace(/[^0-9.-]/g, "")) || 0;
        return gB - gA;
      });
    }

    return result;
  }, [allCompanies, search, activeFilter, sortBy]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: allCompanies.length };
    for (const cat of ["Super Dream", "Dream", "Standard", "Regular"]) {
      map[cat] = allCompanies.filter((c) => matchCategory(c.company_type, cat)).length;
    }
    return map;
  }, [allCompanies]);

  const handleReset = useCallback(() => {
    setSearchRaw("");
    setActiveFilter("All");
    setSortBy("default");
  }, []);

  const hasActiveFilters = activeFilter !== "All" || searchRaw.trim().length > 0 || sortBy !== "default";

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Hero / Header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Wordmark + pill */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold px-2.5 py-0.5 border border-[#2563EB]/20">
                JSS · INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            JSS University Companies Research &amp; Placement Analytics Portal
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Your strategic edge for campus placements
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              placeholder="Search companies, sectors, locations..."
              className="w-full h-10 pl-9 pr-9 rounded-md border border-input bg-white text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 placeholder:text-muted-foreground"
            />
            {searchRaw && (
              <button
                onClick={() => setSearchRaw("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {CATEGORY_FILTERS.map((cat) => {
              const style = CATEGORY_STYLES[cat];
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold flex-shrink-0 transition-colors ${
                    isActive ? style.active : style.inactive
                  }`}
                >
                  {cat !== "All" && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-white" : style.dot
                      }`}
                    />
                  )}
                  {cat}
                  <span className={`ml-0.5 ${isActive ? "opacity-80" : "opacity-60"}`}>
                    ({counts[cat] ?? 0})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs border border-border rounded-md px-2.5 py-1 bg-white text-[#334155] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="default">Default Order</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="growth-desc">YoY Growth (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto pt-2.5 mt-2.5 border-t border-border/60 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span>Filtered by:</span>
            {activeFilter !== "All" && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs">
                Category: <strong>{activeFilter}</strong>
                <button
                  onClick={() => setActiveFilter("All")}
                  className="hover:text-red-600 transition-colors ml-0.5"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchRaw.trim() && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs">
                Search: <strong>&ldquo;{searchRaw}&rdquo;</strong>
                <button
                  onClick={() => setSearchRaw("")}
                  className="hover:text-red-600 transition-colors ml-0.5"
                  title="Remove search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== "default" && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs">
                Sorted: <strong>{sortBy === "name-asc" ? "A–Z" : sortBy === "name-desc" ? "Z–A" : "YoY Growth"}</strong>
                <button
                  onClick={() => setSortBy("default")}
                  className="hover:text-red-600 transition-colors ml-0.5"
                  title="Reset sort"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-[#2563EB] hover:underline ml-auto font-medium"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* ── Loading state ── */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
              Could not load companies
            </h3>
            <p className="text-sm text-muted-foreground mb-1 max-w-sm">
              {error?.message ?? "An unknown error occurred."}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Make sure <code className="bg-secondary px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
              <code className="bg-secondary px-1 rounded">VITE_SUPABASE_ANON_KEY</code> are set in{" "}
              <code className="bg-secondary px-1 rounded">.env</code>.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty / no-match state ── */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
              No companies found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Company grid ── */}
        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Showing {filtered.length} of {allCompanies.length} companies
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((company) => (
                <CompanyCard key={company.company_id} company={company} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
