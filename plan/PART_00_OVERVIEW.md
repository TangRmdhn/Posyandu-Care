# Posyandu-Care Implementation Plan
## PART 00 — Overview, Tech Stack & Zero-Cost Strategy

> **Project:** Web-Based Maternal and Child Health Monitoring Information System "Posyandu-Care"
> **Author:** Daniel Requel (123240134)
> **Course:** Software Engineering — Class IF-F, UPN "Veteran" Yogyakarta

---

## 1. Document Index

| Part | Title | File |
|------|-------|------|
| 00 | Overview, Tech Stack & Zero-Cost Strategy | `PART_00_OVERVIEW.md` |
| 01 | Database — Supabase Schema, ERD & RLS Policies | `PART_01_DATABASE.md` |
| 02 | Project Setup — Repo, Supabase, Vercel CI/CD | `PART_02_PROJECT_SETUP.md` |
| 03 | Backend — API Routes, Server Actions & Business Logic | `PART_03_BACKEND.md` |
| 04 | Frontend — UI/UX Component Implementation | `PART_04_FRONTEND.md` |
| 05 | Feature Implementation by Role | `PART_05_FEATURES.md` |
| 06 | Deployment & Go Live Checklist | `PART_06_DEPLOY.md` |

---

## 2. Tech Stack (100% Free, Zero Cost)

### Core Framework

| Layer | Technology | Reason | Cost |
|-------|-----------|--------|------|
| Frontend Framework | **Next.js 14** (App Router) | SSR/SSG built-in, Vercel-native, full-stack in one repo | Free |
| Language | **TypeScript** | Type safety, pairs perfectly with Supabase generated types | Free |
| Styling | **Tailwind CSS** | Utility-first, easy to match the SRS mockup color specs | Free |
| UI Components | **shadcn/ui** | Copy-paste components, no vendor lock-in, Tailwind-based | Free |
| Charts | **Recharts** | KIA growth charts, React-native, lightweight | Free |
| Form Handling | **React Hook Form + Zod** | Client-side validation matching VR rules in the SRS | Free |
| Icons | **Lucide React** | Ships with shadcn/ui | Free |

### Backend & Database

| Layer | Technology | Reason | Cost |
|-------|-----------|--------|------|
| Database | **Supabase PostgreSQL** | Free tier: 500MB DB, 2 active projects | Free |
| Authentication | **Supabase Auth** | Built-in email+password auth, role metadata support | Free |
| File Storage | **Supabase Storage** | Free tier: 1GB for child profile photos | Free |
| Realtime | **Supabase Realtime** | Optional: live queue updates for Kader dashboard | Free |
| Client SDK | **Supabase JS v2** | Official typed client, pairs with generated DB types | Free |
| API Layer | **Next.js Route Handlers** | `/app/api/*` — server-side logic without extra cost | Free |

### Hosting & DevOps

| Layer | Technology | Reason | Cost |
|-------|-----------|--------|------|
| Hosting | **Vercel** | Hobby plan: unlimited deploys, 100GB bandwidth/month | Free |
| Repository | **GitLab** (already exists) or GitHub | Auto CI/CD pipeline to Vercel on push | Free |
| Secrets Management | Vercel Dashboard env vars | Secure environment variable storage | Free |

---

## 3. System Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                     VERCEL (Hosting)                       │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │            Next.js 14 Application                │    │
│   │                                                  │    │
│   │   /app/(auth)/login                              │    │
│   │   /app/(auth)/register                           │    │
│   │   /app/ortu/*      → Parent dashboard            │    │
│   │   /app/kader/*     → Cadre dashboard             │    │
│   │   /app/bidan/*     → Midwife dashboard           │    │
│   │   /app/api/*       → Route Handlers (API)        │    │
│   └──────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
                           │
               HTTPS / Supabase JS Client
                           │
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE (BaaS)                         │
│                                                            │
│  ┌─────────────────┐   ┌─────────────────┐               │
│  │   PostgreSQL    │   │      Auth       │               │
│  │   (Database)    │   │   (Sessions +   │               │
│  │                 │   │  Role Metadata) │               │
│  └─────────────────┘   └─────────────────┘               │
│  ┌─────────────────┐   ┌─────────────────┐               │
│  │    Storage      │   │  Row Level      │               │
│  │  (Child Photos) │   │  Security (RLS) │               │
│  └─────────────────┘   └─────────────────┘               │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Role & Routing Strategy

Three roles defined in the SRS, enforced via Next.js middleware:

| Role | Route Prefix | Access Scope |
|------|-------------|--------------|
| Orang Tua (Parent) | `/ortu/*` | Dashboard, reservation, child health data & KIA chart |
| Kader (Cadre) | `/kader/*` | Queue list, anthropometry input, child biodata |
| Bidan Desa (Midwife) | `/bidan/*` | Data filter, medical notes, validation & advice |

`/middleware.ts` will:
1. Verify active Supabase Auth session on every protected route
2. Read `user_role` from the user's JWT `app_metadata`
3. Redirect unauthenticated users to `/login`
4. Redirect authenticated users to their role-specific dashboard if they land on the wrong prefix

---

## 5. Free Tier Limits — Supabase

| Resource | Free Tier Limit | Estimated Usage |
|----------|----------------|----------------|
| Database Storage | 500 MB | ~50 MB (small posyandu scale) |
| Auth Users | 50,000 MAU | More than sufficient |
| File Storage | 1 GB | ~200 MB (child avatar photos) |
| Bandwidth | 5 GB/month | Sufficient for academic demo |
| Realtime Connections | 200 concurrent | Sufficient |

> **Note:** Supabase free tier pauses inactive projects after 1 week of no activity. Simply click "Resume" in the Supabase dashboard, or enable the auto-resume setting to prevent this.

---

## 6. Free Tier Limits — Vercel

| Resource | Hobby Plan Limit | Estimated Usage |
|----------|-----------------|----------------|
| Deployments | Unlimited | Sufficient |
| Bandwidth | 100 GB/month | More than sufficient |
| Serverless Function Duration | 100 GB-Hrs/month | Sufficient |
| Build Minutes | 6,000 min/month | Sufficient |
| Custom Domain | 1 free `.vercel.app` domain | Use default subdomain |

---

## 7. Project Folder Structure

```
posyandu-care/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Shared layout with bottom nav
│   │   ├── ortu/
│   │   │   ├── page.tsx                # Parent home dashboard
│   │   │   ├── anak/
│   │   │   │   ├── register/page.tsx   # Child biodata registration
│   │   │   │   └── [id]/page.tsx       # Child health detail & KIA chart
│   │   │   └── reservasi/
│   │   │       ├── page.tsx            # Schedule selection
│   │   │       └── success/page.tsx    # Reservation confirmation card
│   │   ├── kader/
│   │   │   ├── page.tsx                # Cadre home dashboard
│   │   │   ├── antrean/page.tsx        # Today's queue list
│   │   │   ├── pemeriksaan/
│   │   │   │   └── [reservasiId]/
│   │   │   │       └── page.tsx        # Anthropometry input form
│   │   │   └── anak/
│   │   │       └── [id]/page.tsx       # Child biodata viewer
│   │   └── bidan/
│   │       ├── page.tsx                # Midwife home dashboard
│   │       ├── anak/
│   │       │   └── [id]/page.tsx       # Detail + medical advice form
│   │       └── laporan/page.tsx        # Report & data filter
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── reservasi/
│   │   │   └── route.ts
│   │   ├── pemeriksaan/
│   │   │   └── route.ts
│   │   └── zscore/
│   │       └── route.ts                # WHO Z-Score calculation endpoint
│   ├── layout.tsx                      # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                             # shadcn/ui generated components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── ortu/
│   │   ├── ChildProfileCard.tsx
│   │   ├── ScheduleListCard.tsx
│   │   ├── ReservationSuccessCard.tsx
│   │   ├── HealthStatsCard.tsx
│   │   └── GrowthChart.tsx
│   ├── kader/
│   │   ├── PatientQueueList.tsx
│   │   ├── ExaminationForm.tsx
│   │   └── ChildBiodataCard.tsx
│   ├── bidan/
│   │   ├── PatientRiskCard.tsx
│   │   ├── AlertFilterChip.tsx
│   │   └── MedicalAdviceForm.tsx
│   └── shared/
│       ├── BottomNavBar.tsx
│       ├── AppHeader.tsx
│       └── RoleBadge.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser-side Supabase client
│   │   ├── server.ts                   # Server-side client (RSC + Route Handlers)
│   │   └── middleware.ts               # Auth session helper for middleware
│   ├── zscore.ts                       # WHO Z-Score algorithm (BB/U, TB/U, BB/TB)
│   ├── validations/
│   │   ├── auth.schema.ts
│   │   ├── anak.schema.ts
│   │   ├── reservasi.schema.ts
│   │   └── pemeriksaan.schema.ts
│   └── utils.ts
│
├── middleware.ts                       # Global role-based route protection
├── types/
│   └── database.types.ts               # Auto-generated from Supabase CLI
├── public/
│   └── logo.svg
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 8. Development Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Part 02 — Setup | Repo init, Supabase project, Vercel link, env config | 1-2 hours |
| Part 01 — Database | SQL schema, seed data, RLS policies, type generation | 2-3 hours |
| Auth & Middleware | Login, register flows, role-based redirect middleware | 2-3 hours |
| Part 05 — Ortu | Dashboard, child registration, reservations, KIA chart | 4-6 hours |
| Part 05 — Kader | Queue dashboard, anthropometry input form, Z-Score display | 3-4 hours |
| Part 05 — Bidan | Risk filter dashboard, medical advice form, validation flow | 3-4 hours |
| Part 06 — Deploy | Final env vars, production deploy, smoke testing | 1-2 hours |
| Polish | Responsive fixes, loading states, error boundaries | 2-3 hours |
| **Total** | | **~18-27 hours** |
