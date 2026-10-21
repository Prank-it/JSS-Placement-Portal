// src/components/shared/CompanyCard.tsx
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import { useCompany } from "@/contexts/CompanyContext";
import type { CompanySummary } from "@/lib/companyData";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Super Dream": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Dream: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Standard: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Regular: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

function isNullish(val: string): boolean {
  const v = val.trim().toLowerCase();
  return !v || ["na", "n/a", "none", "-", "null", "undefined", "not available"].includes(v);
}

interface CompanyCardProps {
  company: CompanySummary;
}

export const CompanyCard = memo(function CompanyCard({ company }: CompanyCardProps) {
  const navigate = useNavigate();
  const { setSelected } = useCompany();

  const typeStyle =
    CATEGORY_STYLES[company.company_type] ?? CATEGORY_STYLES["Standard"];

  const isGrowthNegative =
    company.yoy_growth_rate?.startsWith("-");

  const handleClick = () => {
    const selectedData = {
      companyId: company.company_id,
      companyName: company.name,
      logoUrl: company.logo_url,
    };
    localStorage.setItem("selected-company", JSON.stringify(selectedData));
    setSelected(selectedData);
    navigate("/company/intelligence");
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white border border-border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
    >
      {/* Header: Logo + type badge */}
      <div className="flex items-start justify-between gap-2">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logo_url}
          size={44}
        />
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
        >
          {company.company_type}
        </span>
      </div>

      {/* Company name */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-foreground leading-tight line-clamp-1">
          {company.name}
        </h3>
        {company.short_name && company.short_name !== company.name && (
          <p className="text-xs text-muted-foreground mt-0.5">{company.short_name}</p>
        )}
      </div>

      {/* Meta rows */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {isNullish(company.headquarters_address) ? (
            <span className="italic">not publicly available</span>
          ) : (
            <span className="truncate">{company.headquarters_address}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          {isNullish(company.employee_size) ? (
            <span className="italic">not publicly available</span>
          ) : (
            <span className="truncate">{company.employee_size}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isGrowthNegative ? (
            <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />
          )}
          {isNullish(company.yoy_growth_rate) ? (
            <span className="italic text-muted-foreground">not publicly available</span>
          ) : (
            <span className={isGrowthNegative ? "text-red-500" : "text-green-600"}>
              {company.yoy_growth_rate} YoY
            </span>
          )}
        </div>
      </div>

      {/* Footer arrow */}
      <div className="flex justify-end mt-auto pt-1">
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
});
