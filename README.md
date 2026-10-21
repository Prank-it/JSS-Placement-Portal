# JSS University Placement Intelligence Hub

> **Phase 2 — Supabase connected. Paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env`, then `npm run dev`.**

## What is this?

**JSS University Companies Research & Placement Analytics Portal** (a.k.a. **JSS Placement Intelligence Hub**) is a mobile-first React SPA for campus placement research.

| Phase | Status | Data Source |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Hardcoded `src/data/seedCompanies.ts` (kept as documented fallback) |
| Phase 2 | ✅ Complete | Supabase `public.company_json` + 4 skill tables |

---

## Phase 2 — Supabase Setup (only manual step required)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
   ```
3. Install dependencies and start:
   ```bash
   npm install && npm run dev
   ```

> Use the **anon** (public) key — never the `service_role` key. The app is read-only and fully public (no auth).

---

| Phase | Status | Data Source |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Hardcoded `src/data/seedCompanies.ts` |
| Phase 2 | 🔜 Planned | Supabase (same JSON shapes, one-file swap) |

---

## Key Facts

- **College:** JSS University
- **Fully public portal** — no login, no auth, every route is accessible by any visitor
- **No Supabase client** — Phase 1 uses seed data only
- **No college logo file** in `public/` — hero uses text-only wordmark
- **No CTC / Stipend / Selection Ratio** fields displayed anywhere

---

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18+ |
| Vite | 6+ |
| TypeScript | 5+ |
| Tailwind CSS | v3 |
| React Router | v6 |
| TanStack Query | v5 |
| Framer Motion | latest |
| Recharts | latest |
| Lucide React | latest |
| Sonner | latest |

---

## Routes

| Route | Behavior |
|-------|---------|
| `/` | Company grid (Index) |
| `/company` | Redirects → `/company/intelligence` |
| `/company/intelligence` | Company Intelligence (22 sections) |
| `/company/skills` | Skill Intelligence (12 skills, 10-level roadmaps) |
| `*` | 404 Not Found (only for unmatched URLs) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run smoke tests
npm run test

# Build for production
npm run build
```

## Environment Variables (Phase 1)

```env
# Optional: Logo.dev API key for company logos
VITE_LOGO_DEV_PUBLISHABLE_KEY=your_key_here
```

> **DO NOT** add `VITE_SUPABASE_*` env vars — Phase 1 has no Supabase.

---

## Phase 2 Migration Path

The data layer is designed for a **one-file swap**. In `src/lib/companyData.ts`:

- `normalizeCompanySummary(company_id, short_json)` → accepts same JSON shape as Supabase `companies.short_json` JSONB column
- `normalizeCompanyProfile(company_id, full_json, short_json)` → accepts same JSON shape as Supabase `companies.full_json` JSONB column
- `normalizeDashboardSkills(skill_levels[])` → accepts same JSON shape as Supabase `skill_levels` table rows

In Phase 2, replace the seed imports in pages with React Query hooks that call Supabase — the normalizers consume the same shapes.

---

## Project Structure

```
src/
├── App.tsx                     # Providers + Routes
├── main.tsx                    # Entry point
├── index.css                   # Design tokens + Tailwind
├── contexts/
│   └── CompanyContext.tsx      # Selected company → localStorage
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Sidebar + Outlet + breadcrumbs
│   │   └── AppSidebar.tsx      # Collapsible sidebar
│   ├── shared/
│   │   ├── CompanyCard.tsx     # Grid card
│   │   └── CompanyLogo.tsx     # Logo.dev → URL → initials fallback
│   └── ui/                     # shadcn-compatible components
├── data/
│   ├── seedCompanies.ts        # Accenture seed data
│   ├── skillTopics.ts          # 10-level roadmaps for 12 skills
│   └── intelligenceData.tsx    # 22 intelligence section schemas
├── hooks/
│   └── useDebounce.ts
├── lib/
│   ├── utils.ts                # cn()
│   └── companyData.ts          # Normalizers + TypeScript interfaces
├── pages/
│   ├── Index.tsx               # / — company grid
│   ├── CompanyIntelligence.tsx # /company/intelligence
│   ├── SkillIntelligence.tsx   # /company/skills
│   └── NotFound.tsx            # 404
└── test/
    ├── setup.ts
    └── smoke.test.tsx
```

---

## Design Tokens

| Token | Value |
|-------|-------|
| Super Dream | `#7c3aed` |
| Dream | `#2563eb` |
| Standard | `#16a34a` |
| Regular | `#d97706` |
| Sidebar BG | `#F8FAFC` |
| Active nav | `#2563EB` on `#EFF6FF` |
