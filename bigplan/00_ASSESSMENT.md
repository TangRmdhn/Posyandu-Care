# 00 — Current State Assessment

An honest audit of what exists today (commit `a1ec1c4`), grounded in the actual code and live Supabase advisors.

---

## 1. What works today (keep it)

- **Auth + role routing.** Login/register, middleware role guard (`src/middleware.ts`), role fallback to `profiles.role` when `app_metadata.role` is missing. Three roles wired end-to-end.
- **Core happy path per role:**
  - *Ortu:* register → add child → book a slot → see dashboard.
  - *Kader:* see today's queue → open a reservation → submit anthropometry.
  - *Bidan:* filter flagged cases → add medical advice → validate.
- **Sensible stack.** Next.js 14 App Router, Supabase (Postgres + Auth + Storage), Recharts, Zod, RHF. Typed DB (`src/types/database.types.ts`).
- **DB foundations.** 8 tables, FKs, a quota trigger (`handle_new_reservasi`), a profile-creation trigger (`handle_new_user`), unique constraints (NIK, one reservation per child per schedule), a quota check constraint.
- **UI matches the mockups.** Clean mobile cards, bottom nav, status color coding.

This is a solid skeleton. The plan builds on it, not over it.

---

## 2. Critical problems (block real use)

### C1 — Nutritional status / Z-score is medically invalid
`src/lib/zscore.ts`:
```ts
// TODO: Replace with actual WHO reference table lookup based on ageInMonths + sex
const ref = {
  bb_u: { median: jenis_kelamin === 'L' ? 9.6 : 8.9, sd: 1.1 },
  ...
}
```
- One median/SD per sex, **ignoring age entirely**. `getAgeInMonths()` is computed but never used in the lookup.
- A 3-month-old and a 5-year-old are compared against the same ~9.6 kg median.
- `classifyNutritionalStatus` then labels "Gizi Buruk / Stunting / Gizi Baik" from those bogus scores. These labels drive **midwife referral decisions**.
- **Impact:** the system's central health output is wrong. This is the #1 fix.

### C2 — Growth chart shows fake data
`src/components/ortu/GrowthChart.tsx` plots `beratAnak`, `normal`, `trenNaik` — but `normal`/`trenNaik` are dummy lines, not WHO percentile bands, and the component is fed static data. Parents see a chart that doesn't represent their child against any real standard.

### C3 — Child photos are publicly listable
Supabase security advisor: the public `child-photos` bucket has a broad SELECT policy that **allows listing every file in the bucket**. Combined with predictable paths, that is a children's-PII exposure. (And the upload doesn't even work — see C4 — so the bucket is a liability with no benefit yet.)

### C4 — Photo upload is dead code
`ortu/anak/register/page.tsx` renders a file input (`name="foto"`) but **never reads it, never uploads to Storage, never sets `foto_url`**. Every child's `foto_url` is null. UI implies a feature that doesn't exist.

### C5 — RLS enabled with no policies on 3 tables
Advisor `rls_enabled_no_policy`: `public.kader`, `public.bidan_desa`, `public.laporan` have RLS on but **zero policies**. Effect: any join/select against them returns nothing for non-service clients. This silently breaks:
- Kader/Bidan profile pages that read `kader`/`bidan_desa`.
- `laporan.generated_by` lookups.
- Any future feature reading staff records.

---

## 3. High-severity problems

### H1 — Security advisor warnings
- `function_search_path_mutable` on `handle_new_user`, `handle_new_reservasi`, `get_my_role` — should set `search_path = ''` / `pg_catalog`.
- `anon_security_definer_function_executable` + `authenticated_..._executable` — these SECURITY DEFINER functions are callable via `/rest/v1/rpc/*` by anyone. `EXECUTE` should be revoked from `anon`/`authenticated`.
- `auth_leaked_password_protection` disabled — turn on HaveIBeenPwned check.

### H2 — Performance advisor warnings (matter as data grows)
- `unindexed_foreign_keys` on `anak.id_ortu`, `pemeriksaan.*` (4 FKs), `reservasi.*` (2 FKs), `laporan.*` (2 FKs).
- `auth_rls_initplan` — policies call `auth.uid()` per row instead of `(select auth.uid())`; rewrite all of them.
- `multiple_permissive_policies` — `anak`, `pemeriksaan`, `profiles`, `reservasi` each have several permissive SELECT policies for the same role; consolidate.

### H3 — No immunization tracking
The schema has no `imunisasi` concept. Immunization (imunisasi dasar lengkap) is *the* headline Posyandu activity. A parent cannot see "what shot is next," a cadre cannot record one, a midwife cannot report coverage. Major functional gap.

### H4 — No way to manage schedules in-app
`jadwal` is populated only by seed SQL. Plan docs literally say "managed via admin or direct SQL." There is **no Admin role and no schedule-management UI**. A real Posyandu coordinator cannot open next month's session without a developer. Blocks self-service operation.

### H5 — Duplicated, inconsistent write paths
`registerAnak` server action (`src/app/actions/anak.actions.ts`) exists and validates with Zod — but the register page **bypasses it** and does a raw client-side insert with ad-hoc validation. Two sources of truth, only one validated properly. Same risk pattern elsewhere (client does `supabase.from(...).insert` directly under RLS).

---

## 4. Medium-severity problems

| ID | Problem | Where |
|----|---------|-------|
| M1 | Mobile-only layout (`max-w-md mx-auto`) — desktop users get a phone-width column | `src/app/(dashboard)/layout.tsx` |
| M2 | Education content hardcoded (3 string stubs, no detail pages, no source) | `ortu/edukasi/page.tsx` |
| M3 | No reservation cancel/reschedule; cancelling can't roll back `kuota_terisi` | reservasi flow |
| M4 | No report export (PDF/CSV) for the Puskesmas; `laporan` table unused by UI | `bidan/laporan/page.tsx` |
| M5 | No reminders/notifications for upcoming sessions | — |
| M6 | Bidan dashboard fetches client-side with no pagination/search; grows unbounded | `bidan/page.tsx` |
| M7 | Kader can't edit a measurement after submit; no per-child growth history view for staff | pemeriksaan flow |
| M8 | No password reset / email verification / account management flows | auth |
| M9 | `next.config.mjs` empty — no image domains, no security headers, no PWA | `next.config.mjs` |
| M10 | No empty/error/loading states in several pages; errors surfaced as raw strings | multiple |

---

## 5. Engineering-hygiene gaps

- **No tests at all** (unit/integration/e2e). The Z-score fix especially needs tests against WHO reference values.
- **No CI** beyond Vercel build. No lint/typecheck gate, no test gate.
- **No error monitoring** (Sentry/Logflare) and no structured logging.
- **No error boundaries / not-found / global-error** pages.
- **No rate limiting** on API routes (`/api/reservasi`, `/api/pemeriksaan`, `/api/zscore`). `/api/zscore` is unauthenticated.
- **Validation drift** — Zod schemas exist but aren't applied uniformly (see H5).
- **No accessibility pass** — emoji as icons, color-only status, unlabeled inputs in places, no focus management.
- **Indonesian-only** — acceptable for the audience, but copy/strings are inline, not centralized; no large-text mode for elderly users.

---

## 6. Severity matrix

| Severity | Items | Theme |
|----------|-------|-------|
| 🔴 Critical (P0) | C1, C2, C3, C4, C5 | Wrong medical output + children's-data safety |
| 🟠 High (P0/P1) | H1, H2, H3, H4, H5 | Security warnings, missing core features, write-path integrity |
| 🟡 Medium (P1/P2) | M1–M10 | Usability for all users, real-world workflow gaps |
| ⚪ Hygiene (P2/P3) | tests, CI, monitoring, a11y, headers | Reliability + maintainability |

---

## 7. Verdict

The build is a **good demo and a bad production system** — which is normal at this stage. The path to production is not a rewrite; it's:
1. Make the medical output correct (`02`).
2. Make children's data safe (`03`).
3. Add the features a Posyandu actually runs on (`04`, `05`, `07`).
4. Make it usable for every user and device (`06`).
5. Make it reliable and operable (`08`, `09`).

The rest of this folder details each.
