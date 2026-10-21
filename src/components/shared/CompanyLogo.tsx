// src/components/shared/CompanyLogo.tsx
import { useState } from "react";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string;
  domain?: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function CompanyLogo({
  name,
  logoUrl,
  domain,
  size = 40,
  className = "",
}: CompanyLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(() => {
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;
    if (logoDevKey && domain) {
      return `https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size * 2}&format=png`;
    }
    return logoUrl || null;
  });
  const [failed, setFailed] = useState(false);

  if (!failed && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={`rounded object-contain ${className}`}
        style={{ width: size, height: size, minWidth: size }}
        onError={() => {
          // Try fallback to logoUrl if Logo.dev fails
          if (imgSrc !== logoUrl && logoUrl) {
            setImgSrc(logoUrl);
          } else {
            setFailed(true);
          }
        }}
      />
    );
  }

  // Initial-letter fallback
  const initials = getInitials(name);
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`flex items-center justify-center rounded font-bold font-heading ${colors[colorIdx]} ${className}`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.35 }}
      aria-label={`${name} logo`}
    >
      {initials}
    </div>
  );
}
