// src/test/categoryFilter.test.ts
import { describe, it, expect } from "vitest";
import {
  normalizePlacementCategory,
  classifyPlacementCategory,
  matchCategory,
  normalizeCompanySummary,
  PLACEMENT_CATEGORIES,
  type CompanySummary,
  type PlacementCategory,
} from "@/lib/companyData";
import { SEED_COMPANIES } from "@/data/seedCompanies";

describe("Category Normalization & Classification Tests", () => {
  describe("1. normalizePlacementCategory", () => {
    it("handles exact canonical placement categories", () => {
      expect(normalizePlacementCategory("Super Dream")).toBe("Super Dream");
      expect(normalizePlacementCategory("Dream")).toBe("Dream");
      expect(normalizePlacementCategory("Standard")).toBe("Standard");
      expect(normalizePlacementCategory("Regular")).toBe("Regular");
    });

    it("handles case insensitivity", () => {
      expect(normalizePlacementCategory("super dream")).toBe("Super Dream");
      expect(normalizePlacementCategory("SUPER DREAM")).toBe("Super Dream");
      expect(normalizePlacementCategory("dream")).toBe("Dream");
      expect(normalizePlacementCategory("DREAM")).toBe("Dream");
      expect(normalizePlacementCategory("standard")).toBe("Standard");
      expect(normalizePlacementCategory("regular")).toBe("Regular");
    });

    it("handles whitespace, hyphens, and aliases", () => {
      expect(normalizePlacementCategory("  super-dream  ")).toBe("Super Dream");
      expect(normalizePlacementCategory("super_dream")).toBe("Super Dream");
      expect(normalizePlacementCategory("Super Dream Companies")).toBe("Super Dream");
      expect(normalizePlacementCategory("Dream Company")).toBe("Dream");
      expect(normalizePlacementCategory("Tier 1")).toBe("Super Dream");
      expect(normalizePlacementCategory("Tier-1")).toBe("Super Dream");
      expect(normalizePlacementCategory("Tier 2")).toBe("Dream");
      expect(normalizePlacementCategory("Tier 3")).toBe("Standard");
    });

    it("returns null for unknown or invalid inputs", () => {
      expect(normalizePlacementCategory(null)).toBeNull();
      expect(normalizePlacementCategory(undefined)).toBeNull();
      expect(normalizePlacementCategory("")).toBeNull();
      expect(normalizePlacementCategory("unknown-tier")).toBeNull();
      expect(normalizePlacementCategory(123)).toBeNull();
    });
  });

  describe("2. classifyPlacementCategory (Canonical mapping)", () => {
    it("classifies FAANG / Big Tech as Super Dream", () => {
      expect(classifyPlacementCategory("Google LLC", "Technology", "Google")).toBe("Super Dream");
      expect(classifyPlacementCategory("Microsoft Corporation", "Software", "Microsoft")).toBe("Super Dream");
      expect(classifyPlacementCategory("Amazon.com, Inc.", "E-commerce", "Amazon")).toBe("Super Dream");
      expect(classifyPlacementCategory("Apple Inc.", "Hardware", "Apple")).toBe("Super Dream");
    });

    it("classifies Global Capability Centers & Top Tier as Dream", () => {
      expect(classifyPlacementCategory("Accenture plc", "IT Services", "Accenture")).toBe("Dream");
      expect(classifyPlacementCategory("Dell Technologies", "Hardware", "Dell")).toBe("Dream");
      expect(classifyPlacementCategory("SAP Labs", "Software", "SAP")).toBe("Dream");
      expect(classifyPlacementCategory("Oracle India", "Database", "Oracle")).toBe("Dream");
    });

    it("classifies Mass IT / Consulting as Regular", () => {
      expect(classifyPlacementCategory("Tata Consultancy Services", "IT Services", "TCS")).toBe("Regular");
      expect(classifyPlacementCategory("Infosys Limited", "IT Services", "Infosys")).toBe("Regular");
      expect(classifyPlacementCategory("Wipro Limited", "IT Services", "Wipro")).toBe("Regular");
      expect(classifyPlacementCategory("Cognizant Technology Solutions", "Consulting", "Cognizant")).toBe("Regular");
      expect(classifyPlacementCategory("Capgemini", "IT Consulting", "Capgemini")).toBe("Regular");
      expect(classifyPlacementCategory("HCL Technologies", "IT Services", "HCLTech")).toBe("Regular");
    });

    it("defaults standard enterprises and software companies to Standard", () => {
      expect(classifyPlacementCategory("Acme Software Corp", "Software", "Acme")).toBe("Standard");
      expect(classifyPlacementCategory("General Cloud Tools", "Cloud Services", "GCT")).toBe("Standard");
    });
  });

  describe("3. matchCategory Filter Matching", () => {
    it("matches 'All' to any category", () => {
      expect(matchCategory("Super Dream", "All")).toBe(true);
      expect(matchCategory("Dream", "All")).toBe(true);
      expect(matchCategory("Standard", "All")).toBe(true);
      expect(matchCategory("Regular", "All")).toBe(true);
      expect(matchCategory("Unknown", "All")).toBe(true);
      expect(matchCategory("", "All")).toBe(true);
    });

    it("matches category case-insensitively and with hyphenation", () => {
      expect(matchCategory("Super Dream", "Super Dream")).toBe(true);
      expect(matchCategory("Super Dream", "super-dream")).toBe(true);
      expect(matchCategory("Super Dream", "SUPER DREAM")).toBe(true);
      expect(matchCategory("Dream", "dream")).toBe(true);
      expect(matchCategory("Standard", "STANDARD")).toBe(true);
      expect(matchCategory("Regular", "regular")).toBe(true);
    });

    it("rejects non-matching categories", () => {
      expect(matchCategory("Super Dream", "Dream")).toBe(false);
      expect(matchCategory("Dream", "Super Dream")).toBe(false);
      expect(matchCategory("Standard", "Regular")).toBe(false);
      expect(matchCategory("Regular", "Standard")).toBe(false);
    });
  });

  describe("4. normalizeCompanySummary Category Resolution", () => {
    it("uses explicit company_type in short_json when provided", () => {
      const summary = normalizeCompanySummary(999, {
        name: "Test Co",
        company_type: "Super Dream",
      });
      expect(summary.company_type).toBe("Super Dream");
    });

    it("normalizes hyphenated or messy explicit company_type", () => {
      const summary = normalizeCompanySummary(998, {
        name: "Test Co",
        company_type: "super-dream",
      });
      expect(summary.company_type).toBe("Super Dream");
    });

    it("falls back to placement_category / tier if present", () => {
      const summary = normalizeCompanySummary(997, {
        name: "Test Co",
        tier: "Tier 1",
      });
      expect(summary.company_type).toBe("Super Dream");
    });

    it("applies deterministic canonical classification when company_type is omitted", () => {
      const summaryGoogle = normalizeCompanySummary(101, {
        name: "Google LLC",
        category: "Enterprise",
      });
      expect(summaryGoogle.company_type).toBe("Super Dream");

      const summaryTCS = normalizeCompanySummary(102, {
        name: "Tata Consultancy Services",
        category: "IT Services",
      });
      expect(summaryTCS.company_type).toBe("Regular");
    });
  });
});

describe("End-to-End Filtering, Search, and Counting Logic", () => {
  // Generate a mock dataset representing companies across all tiers
  const mockCompanies: CompanySummary[] = [
    normalizeCompanySummary(1, { name: "Google LLC", category: "Technology", headquarters_address: "Mountain View, CA" }),
    normalizeCompanySummary(2, { name: "Microsoft", category: "Software", headquarters_address: "Redmond, WA" }),
    normalizeCompanySummary(3, { name: "Accenture plc", category: "Consulting", headquarters_address: "Dublin, Ireland" }),
    normalizeCompanySummary(4, { name: "JPMorgan Chase", category: "Finance", headquarters_address: "New York, NY" }),
    normalizeCompanySummary(5, { name: "Zeta Tech Labs", category: "Software", headquarters_address: "Bangalore, India" }),
    normalizeCompanySummary(6, { name: "Acme SaaS", category: "Cloud", headquarters_address: "Austin, TX" }),
    normalizeCompanySummary(7, { name: "Tata Consultancy Services", category: "IT Services", headquarters_address: "Mumbai, India" }),
    normalizeCompanySummary(8, { name: "Infosys Limited", category: "IT Services", headquarters_address: "Bangalore, India" }),
  ];

  it("All Companies returns the complete dataset (all 8 mock companies)", () => {
    const all = mockCompanies.filter((c) => matchCategory(c.company_type, "All"));
    expect(all).toHaveLength(8);
  });

  it("each individual category returns its matching subset and only its matching subset", () => {
    const superDream = mockCompanies.filter((c) => matchCategory(c.company_type, "Super Dream"));
    const dream = mockCompanies.filter((c) => matchCategory(c.company_type, "Dream"));
    const standard = mockCompanies.filter((c) => matchCategory(c.company_type, "Standard"));
    const regular = mockCompanies.filter((c) => matchCategory(c.company_type, "Regular"));

    expect(superDream.length).toBeGreaterThan(0);
    expect(dream.length).toBeGreaterThan(0);
    expect(standard.length).toBeGreaterThan(0);
    expect(regular.length).toBeGreaterThan(0);

    // Verify mutually exclusive categorization
    for (const c of superDream) expect(c.company_type).toBe("Super Dream");
    for (const c of dream) expect(c.company_type).toBe("Dream");
    for (const c of standard) expect(c.company_type).toBe("Standard");
    for (const c of regular) expect(c.company_type).toBe("Regular");
  });

  it("the sum of all 4 category counts matches the total count with zero unassigned", () => {
    const counts: Record<string, number> = { All: mockCompanies.length };
    for (const cat of PLACEMENT_CATEGORIES) {
      counts[cat] = mockCompanies.filter((c) => matchCategory(c.company_type, cat)).length;
    }

    const sum = counts["Super Dream"] + counts["Dream"] + counts["Standard"] + counts["Regular"];
    expect(sum).toBe(mockCompanies.length);
    expect(counts["All"]).toBe(mockCompanies.length);
  });

  it("Search and category filters work together correctly", () => {
    // Filter by "Regular" + search "Bangalore" -> Should find Infosys, but not TCS (Mumbai)
    const categoryFiltered = mockCompanies.filter((c) => matchCategory(c.company_type, "Regular"));
    const combinedFiltered = categoryFiltered.filter((c) =>
      c.name.toLowerCase().includes("bangalore") ||
      c.headquarters_address.toLowerCase().includes("bangalore")
    );

    expect(combinedFiltered).toHaveLength(1);
    expect(combinedFiltered[0].name).toBe("Infosys Limited");
  });

  it("Returning to 'All' restores the complete company list", () => {
    let activeFilter = "Super Dream";
    let list = mockCompanies.filter((c) => matchCategory(c.company_type, activeFilter));
    expect(list.length).toBe(3); // Google, Microsoft, JPMorgan

    // Switch back to "All"
    activeFilter = "All";
    list = mockCompanies.filter((c) => matchCategory(c.company_type, activeFilter));
    expect(list.length).toBe(8);
  });

  it("Handles edge cases: missing fields, special characters, and empty search", () => {
    // Missing fields in short_json
    const emptyRow = normalizeCompanySummary(999, {});
    expect(emptyRow.name).toBe("Company 999");
    expect(emptyRow.company_type).toBe("Standard"); // default fallback

    // Special characters in query
    const query = "@#$%^&*()";
    const result = mockCompanies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    expect(result).toHaveLength(0);

    // Empty search query matches everything
    const emptyQuery = "   ";
    const emptyResult = mockCompanies.filter((c) =>
      emptyQuery.trim() ? c.name.toLowerCase().includes(emptyQuery.trim().toLowerCase()) : true
    );
    expect(emptyResult).toHaveLength(8);
  });

  it("Ensures seed company Accenture is normalized to Dream with zero forbidden fields", () => {
    const seed = SEED_COMPANIES[0];
    const summary = normalizeCompanySummary(seed.company_id, seed.short_json as Record<string, unknown>);
    expect(summary.company_type).toBe("Dream");
    expect(summary.company_id).toBe(1);

    // Forbidden metrics check
    const serialized = JSON.stringify(summary).toLowerCase();
    expect(serialized).not.toContain("ctc");
    expect(serialized).not.toContain("stipend");
    expect(serialized).not.toContain("selection_ratio");
  });
});
