// src/components/layout/AppLayout.tsx
import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Menu, ChevronRight, Home } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { useCompany } from "@/contexts/CompanyContext";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { selected } = useCompany();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#FFFFFF] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — mobile slide-in, desktop persistent */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto lg:flex
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-border bg-white flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            <button
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {selected && (
              <>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-xs">
                  {selected.companyName}
                </span>
              </>
            )}

            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <NavLink
              to="/company/intelligence"
              className={({ isActive }) =>
                `${isActive ? "text-[#2563EB] font-medium" : "hover:text-foreground"} transition-colors hidden sm:inline`
              }
            >
              Intelligence
            </NavLink>
          </nav>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
