// src/contexts/CompanyContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { SEED_COMPANIES } from "@/data/seedCompanies";

const LS_KEY = "selected-company";

interface SelectedCompany {
  companyId: number;
  companyName: string;
  logoUrl: string;
}

interface CompanyContextValue {
  selected: SelectedCompany | null;
  setSelected: (c: SelectedCompany) => void;
  clearSelected: () => void;
}

const CompanyContext = createContext<CompanyContextValue>({
  selected: null,
  setSelected: () => {},
  clearSelected: () => {},
});

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelectedState] = useState<SelectedCompany | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed: SelectedCompany = JSON.parse(raw);
      if (parsed && typeof parsed.companyId === "number" && parsed.companyName) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage whenever selection changes
  useEffect(() => {
    if (selected) {
      localStorage.setItem(LS_KEY, JSON.stringify(selected));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [selected]);

  const setSelected = useCallback((c: SelectedCompany) => {
    localStorage.setItem(LS_KEY, JSON.stringify(c));
    setSelectedState(c);
  }, []);

  const clearSelected = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setSelectedState(null);
  }, []);

  return (
    <CompanyContext.Provider value={{ selected, setSelected, clearSelected }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
