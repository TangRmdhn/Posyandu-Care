# 01 — Roadmap

Phased, sequenced plan. Each phase has an **exit criterion** — don't move on until it's met. Effort is rough (1 dev): S = ≤1 day, M = 2–4 days, L = 1–2 weeks.

---

## Phase 0 — Make it correct and safe (BLOCKERS)

> Nothing below this line ships to a real Posyandu until Phase 0 is done. The system currently produces medical labels that can be wrong and exposes children's data.

| # | Work | Doc | Effort |
|---|------|-----|--------|
| P0-1 | Replace stub Z-score with real WHO LMS engine (age+sex tables, BB/U, TB/U, BB/TB, BB/PB) + unit tests against WHO reference values | 02 | L |
| P0-2 | Real growth chart: child's measurements vs WHO percentile bands (−3/−2/median/+2/+3) | 02 | M |
| P0-3 | Lock down `child-photos` bucket (drop broad listing policy; per-family path; signed URLs) | 03 | S |
| P0-4 | Add RLS policies to `kader`, `bidan_desa`, `laporan` (least privilege) | 03,04 | S |
| P0-5 | Fix function `search_path`; revoke `EXECUTE` on helper funcs from anon/authenticated | 03 | S |
| P0-6 | Enable leaked-password protection; require email verification | 03 | S |
| P0-7 | Make photo upload actually work (Storage upload → `foto_url`) **or** remove the UI until built | 05 | S |
| P0-8 | Single validated write path: route child registration through the server action; stop raw client inserts | 05,08 | M |
| P0-9 | Authenticate + rate-limit `/api/zscore` (and all API routes) | 03,08 | S |

**Exit criterion:** Z-scores match WHO reference values within tolerance (tested); no Critical/High security advisor findings remain; every write goes through a validated path; no children's data is publicly listable.

---

## Phase 1 — Make it actually useful for a Posyandu

| # | Work | Doc | Effort |
|---|------|-----|--------|
| P1-1 | **Immunization tracking**: `imunisasi_jenis` + `imunisasi_anak` tables, IDAI/Kemenkes schedule, "next due" logic, cadre record + parent view | 02,04,05 | L |
| P1-2 | **Admin role** + middleware/route prefix `/admin`; manage jadwal, users, education content | 04,05 | M |
| P1-3 | **Schedule management UI** (create/edit/close `jadwal`, set quota, recurring sessions) | 05 | M |
| P1-4 | **Reservation cancel/reschedule** + correct `kuota_terisi` rollback via trigger | 04,05 | M |
| P1-5 | **Report export** to Puskesmas (per-session + monthly: PDF + CSV; coverage, status-gizi breakdown, stunting count) | 07 | M |
| P1-6 | Per-child longitudinal view for staff (full measurement + immunization history) | 05 | M |
| P1-7 | Kader edit/correct a measurement (with audit) before validation | 05,03 | S |

**Exit criterion:** A coordinator can open next month's session, parents can manage their bookings, cadres can record immunizations, and a midwife can export a report the Puskesmas accepts — all without touching SQL.

---

## Phase 2 — Useful for ALL users and devices

| # | Work | Doc | Effort |
|---|------|-----|--------|
| P2-1 | Responsive layout: real desktop view for kader/bidan/admin (tables, multi-column); keep mobile-first for ortu/kader-in-field | 06 | M |
| P2-2 | Accessibility pass: labels, focus, contrast, non-emoji icons, keyboard nav, screen-reader copy; **large-text / high-contrast mode** for elderly users | 06 | M |
| P2-3 | Reminders: WhatsApp (or email fallback) for upcoming session + immunization due | 07 | M |
| P2-4 | Real education content, admin-managed, with categories + detail pages | 05,07 | M |
| P2-5 | PWA + offline measurement entry (queue locally, sync on reconnect) | 06 | L |
| P2-6 | Search + pagination + filters on staff dashboards | 05,06 | S |
| P2-7 | Account self-service: password reset, change phone, parent edits child biodata | 05 | S |

**Exit criterion:** A midwife on a laptop, a 55-year-old cadre on a budget phone in a hall with 2 bars of signal, and a parent who only reads large text can all complete their core task.

---

## Phase 3 — Reliable and operable

| # | Work | Doc | Effort |
|---|------|-----|--------|
| P3-1 | Test suite: unit (Z-score, validators, utils), integration (API routes + RLS), e2e (Playwright happy paths per role) | 08 | L |
| P3-2 | CI: typecheck + lint + test gate before deploy; preview deploys per PR | 08 | S |
| P3-3 | Error monitoring (Sentry) + structured logging + uptime check | 08 | S |
| P3-4 | Error boundaries, `not-found`, `global-error`, friendly offline page | 06,08 | S |
| P3-5 | Analytics dashboards (trends: stunting rate over time, coverage %, attendance) | 07 | M |
| P3-6 | Ops: backups, restore drill, scale-past-free-tier plan, runbook, go-live checklist | 09 | M |
| P3-7 | Data privacy: consent capture, audit-log review, retention policy, DSAR handling | 03 | M |

**Exit criterion:** A failure pages someone, data can be restored, every release is gated by tests, and there's a written runbook.

---

## Dependency graph (what blocks what)

```
P0-1 Z-score ──► P0-2 growth chart ──► P2-5 offline (needs deterministic local calc)
P0-4 RLS ───────► P1-1 immunization RLS, P1-2 admin RLS
P1-2 admin ─────► P1-3 schedules, P2-4 education CMS
P0-8 write path ► everything that writes (do early; cheap to retrofit later = expensive)
P1-1 immunization ► P1-5 reports (coverage), P2-3 reminders (due dates)
P3-1 tests ─────► safe to do P2/P3 refactors without regressions
```

**Do P0-8 (single write path) early.** It's structural; retrofitting validation after more features pile on is far more expensive.

---

## Milestones (suggested)

- **M1 — "Trustworthy" (end of Phase 0):** correct Z-scores, safe data. Internal pilot with 1 Posyandu, supervised.
- **M2 — "Self-service" (end of Phase 1):** immunization + admin + reports. Pilot runs a full monthly cycle without dev help.
- **M3 — "Inclusive" (end of Phase 2):** works for all users/devices, reminders live. Roll out to 3–5 Posyandu.
- **M4 — "Production" (end of Phase 3):** monitored, tested, backed up, documented. General availability.

---

## Effort rollup (very rough, 1 dev)

| Phase | Sum |
|-------|-----|
| P0 | ~3 weeks |
| P1 | ~4 weeks |
| P2 | ~4 weeks |
| P3 | ~3 weeks |
| **Total** | **~3.5 months** to M4 (faster with 2 devs splitting frontend/backend) |

Cut scope by stopping at M2 for a limited pilot, or M3 for a broader rollout, deferring P3 hardening — but never ship before M1.
