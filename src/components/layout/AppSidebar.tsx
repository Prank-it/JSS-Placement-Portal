// src/components/layout/AppSidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Brain, Building2, ChevronLeft } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { CompanyLogo } from "@/components/shared/CompanyLogo";

const NAV_ITEMS = [
  {
    label: "Company Intelligence",
    path: "/company/intelligence",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Skill Intelligence",
    path: "/company/skills",
    icon: <Brain className="w-4 h-4" />,
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function AppSidebar({ collapsed = false, onCollapse }: AppSidebarProps) {
  const { selected } = useCompany();
  const navigate = useNavigate();

  return (
    <aside
      className={`flex flex-col h-full bg-[#F8FAFC] border-r border-[#E5E7EB] transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[#E5E7EB]">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-xs text-[#334155] truncate leading-none">
                JSS
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                Intelligence Hub
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )}
        {onCollapse && !collapsed && (
          <button
            onClick={onCollapse}
            className="p-1 rounded hover:bg-secondary text-muted-foreground flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#334155] hover:bg-secondary hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Selected company info */}
      {selected && !collapsed && (
        <div className="px-2 py-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-white border border-border">
            <CompanyLogo
              name={selected.companyName}
              logoUrl={selected.logoUrl}
              size={28}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {selected.companyName}
              </p>
              <p className="text-[10px] text-muted-foreground">Selected</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer: All Companies */}
      <div className="px-2 pb-3">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "All Companies" : undefined}
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>All Companies</span>}
        </button>
      </div>
    </aside>
  );
}
