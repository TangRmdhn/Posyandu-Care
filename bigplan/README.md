# Posyandu-Care — Big Plan to Production

> **Goal:** Take Posyandu-Care from "it works on a demo" to a system a real Posyandu (community child-health post) can rely on every month, for every kind of user — parents on cheap phones with bad signal, volunteer cadres (often older, non-technical), and midwives accountable to the Puskesmas.

This folder is the master plan. It audits the current build honestly, then lays out **what to change, why, in what order**, with concrete tickets and acceptance criteria.

---

## How to read this

Read in order if you're new. Jump by topic if you're executing.

| # | File | What it covers |
|---|------|----------------|
| — | `README.md` | This index + executive summary |
| 00 | `00_ASSESSMENT.md` | Honest audit of the current build. What works, what's broken, severity matrix. |
| 01 | `01_ROADMAP.md` | Phased plan (P0 blockers → P3 nice-to-have), milestones, sequencing, effort. |
| 02 | `02_DATA_INTEGRITY_ZSCORE.md` | The #1 correctness problem: real WHO Z-scores, growth curves (KMS), immunization schedule. |
| 03 | `03_SECURITY_PRIVACY.md` | Fix every Supabase advisor finding, harden RLS/auth/storage, child-data privacy (UU PDP), consent, audit log. |
| 04 | `04_DATABASE_EVOLUTION.md` | Schema migrations: new tables, indexes, soft-delete, RLS rewrite, admin role. |
| 05 | `05_FEATURES_BY_ROLE.md` | Feature backlog for Ortu / Kader / Bidan + a new Admin role. |
| 06 | `06_UX_ACCESSIBILITY.md` | Responsive desktop layout, accessibility for elderly/low-literacy users, design system, PWA/offline. |
| 07 | `07_NOTIFICATIONS_REPORTING.md` | Schedule reminders (WhatsApp/email), report export to Puskesmas, analytics dashboards. |
| 08 | `08_ENGINEERING_QUALITY.md` | Tests, CI/CD, error handling, monitoring, performance, code refactor. |
| 09 | `09_DEPLOYMENT_OPS.md` | Production deploy, env management, backups, scaling past free tier, runbook, go-live checklist. |
| 10 | `10_BACKLOG_TICKETS.md` | Flat, actionable ticket list with IDs, estimates, acceptance criteria. |

---

## Executive summary

**Current state:** the happy path works. A parent can register, add a child, book a slot; a cadre can take measurements; a midwife sees flagged cases and adds advice. Auth and role routing function. The UI matches the mockups.

**But it is not production-ready, and not yet useful for a real Posyandu.** Three classes of problem:

### 1. It can give wrong medical answers (highest priority)
The nutritional-status engine (`src/lib/zscore.ts`) is a stub. It uses a **single hardcoded median/standard-deviation pair regardless of the child's age**. WHO Z-scores require age- and sex-specific reference tables (LMS method). A 6-month-old and a 4-year-old are scored against the same numbers today. That means **"Gizi Baik / Stunting / Gizi Buruk" labels can be flatly wrong** — and those labels drive midwife referrals. The growth chart shows hardcoded dummy curves, not the child's real data against WHO percentiles. This must be fixed before any real use. See `02`.

### 2. It is not safe for children's health data
Supabase advisors flag, among others:
- The public `child-photos` bucket lets anyone **list every child's photo**.
- `kader`, `bidan_desa`, `laporan` have RLS enabled but **no policies** — staff lookups silently fail or behave unpredictably.
- Helper functions are anon-callable and have mutable `search_path`.
- Leaked-password protection is off.
- No consent capture, no audit trail on who viewed/edited sensitive records — required thinking for Indonesia's PDP law (UU 27/2022) on minors' data. See `03`.

### 3. It is missing features a real Posyandu needs, and excludes some users
- **No immunization tracking** — the single most common reason a parent visits a Posyandu. Not in the schema at all.
- **No way to create schedules in-app** — `jadwal` rows must be inserted by hand in SQL. There is no Admin role/UI.
- **Mobile-only layout** (`max-w-md`) — a midwife or admin on a laptop gets a phone-width column.
- **Dead photo upload**, **unused server action**, **no reservation cancel/reschedule**, **hardcoded education content**, **no report export to Puskesmas**, **no reminders**, **no tests/monitoring**. See `05`–`08`.

### The plan in one line
Fix correctness and safety first (Z-scores + security/privacy), then fill the real-world feature gaps (immunization, admin/scheduling, reporting, reminders), then make it usable for everyone (responsive, accessible, offline-tolerant), backed by engineering hygiene (tests, CI, monitoring) and a real ops/deploy story.

---

## Guiding principles

1. **Correctness before features.** A health tool that lies is worse than no tool. Z-scores and growth curves get fixed first.
2. **Least privilege by default.** Every table denies, then explicitly allows. Children's data never leaks across families.
3. **Design for the weakest device and the least technical user.** Old Android, 3G, a 55-year-old volunteer cadre. If it works for them, it works for everyone.
4. **Offline-tolerant.** Posyandu sessions happen in community halls with patchy signal. Measurement entry should survive a dropped connection.
5. **Auditable.** Health data edits are logged. Reports to the Puskesmas are reproducible.
6. **Stay cheap, but stop pretending free is free forever.** Free tier is fine for a pilot; `09` documents the real cost cliff and the migration path.

---

## Suggested execution order (TL;DR)

```
P0 (blockers, ~before any real pilot)
  ├─ Real WHO Z-score engine + real growth curves        → 02
  ├─ Security/privacy fixes (advisors, RLS, bucket, auth) → 03
  └─ Data integrity (photo upload, dedupe logic, consent) → 03,04,05

P1 (makes it actually useful)
  ├─ Immunization tracking                                → 02,04,05
  ├─ Admin role + schedule management UI                  → 04,05
  ├─ Reservation cancel/reschedule + quota integrity      → 04,05
  └─ Report export to Puskesmas (PDF/CSV)                 → 07

P2 (useful for ALL users)
  ├─ Responsive desktop + accessibility                   → 06
  ├─ Reminders (WhatsApp/email)                           → 07
  ├─ Real education content + admin-managed articles      → 05,07
  └─ PWA / offline measurement entry                      → 06

P3 (hardening + scale)
  ├─ Tests + CI + monitoring + error boundaries           → 08
  ├─ Analytics dashboards                                 → 07
  └─ Ops runbook, backups, scale plan                     → 09
```

See `01_ROADMAP.md` for the detailed, sequenced version.
