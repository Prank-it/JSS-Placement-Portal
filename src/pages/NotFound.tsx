// src/pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h1 className="font-heading font-bold text-4xl text-foreground mb-2">404</h1>
        <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist. It may have been moved or
          deleted.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </button>
      </div>
    </div>
  );
}
