// src/App.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy pages
const Index = lazy(() => import("@/pages/Index"));
const CompanyIntelligence = lazy(() => import("@/pages/CompanyIntelligence"));
const SkillIntelligence = lazy(() => import("@/pages/SkillIntelligence"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// QueryClient config per spec
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min
      gcTime: 10 * 60 * 1000,        // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <CompanyProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Index />} />

              {/* Company section */}
              <Route path="/company" element={<AppLayout />}>
                <Route index element={<Navigate to="intelligence" replace />} />
                <Route path="intelligence" element={<CompanyIntelligence />} />
                <Route path="skills" element={<SkillIntelligence />} />
              </Route>

              {/* 404 — only for genuinely unmatched URLs */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CompanyProvider>
    </QueryClientProvider>
  );
}
