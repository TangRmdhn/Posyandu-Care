# 10 — Backlog: Actionable Tickets

Flat, ID'd list mapping the whole plan to executable work. Format: `ID — title (Phase, Effort) [doc]`. Effort: S ≤1d · M 2–4d · L 1–2w. Each has an acceptance check.

> Use these as issue titles. They're ordered roughly by execution priority within each phase.

---

## Phase 0 — Correctness & Safety (blockers)

**ZS-1 — Real WHO LMS Z-score engine** (P0, L) [02]
Bundle WHO LMS tables (boys/girls × BB/U, TB/U or PB/U, BB/TB or BB/PB, optional IMT/U). Implement `zFromLMS` + extreme-tail clamp + length/height switch at 24m. Replace `src/lib/zscore.ts` internals; keep `calculateNutritionalStatus` signature.
✅ Test cases match WHO Anthro ±0.01; CI runs them.

**ZS-2 — Kemenkes classification** (P0, S) [02]
Per-indicator status labels per Permenkes 2/2020 cutoffs. Centralized status module (labels+colors+cutoffs).
✅ Labels match the cutoff table; UI imports from one source.

**ZS-3 — Real growth charts** (P0, M) [02]
`valueFromZ` to reconstruct −3/−2/median/+2/+3 bands; plot child's real points; indicator toggle; a11y labels.
✅ Chart shows real bands + real child points, switchable indicator.

**SEC-1 — Lock down child-photos bucket** (P0, S) [03]
Make bucket private; per-owner paths; signed-URL/route access; drop broad listing policy.
✅ `public_bucket_allows_listing` cleared; non-owner can't list/read.

**SEC-2 — RLS policies for kader/bidan_desa/laporan** (P0, S) [03,04]
Add least-privilege policies.
✅ `rls_enabled_no_policy` cleared; staff profile + laporan reads work.

**SEC-3 — Function search_path + revoke RPC execute** (P0, S) [03]
Pin `search_path=''`; revoke `execute` on trigger funcs from anon/authenticated; review `get_my_role`.
✅ Both function advisor findings cleared.

**SEC-4 — Auth hardening** (P0, S) [03]
Enable leaked-password protection + email verification + password policy.
✅ `auth_leaked_password_protection` cleared; new signups verify email.

**SEC-5 — Authenticate/rate-limit API routes** (P0, S) [03,08]
Auth `/api/zscore` (or remove); add rate limiting to reservasi/pemeriksaan/auth.
✅ No unauthenticated mutating/compute endpoints; rate limits enforced.

**INT-1 — Single validated write path** (P0, M) [03,05,08]
Route child registration through `registerAnak` server action; remove raw client insert; pattern for all mutations.
✅ No client-side `.insert/.update`; all writes Zod-validated server-side.

**INT-2 — Working photo upload** (P0, S) [05]
Upload to private bucket → set `foto_url`; EXIF strip + type/size validation. (Or hide UI until built.)
✅ A child photo uploads, displays via authorized URL, EXIF removed.

**PERF-1 — RLS initplan + permissive policy cleanup** (P0, S) [04]
Wrap `auth.uid()`/`get_my_role()` in `(select ...)`; consolidate duplicate SELECT policies.
✅ `auth_rls_initplan` + `multiple_permissive_policies` cleared.

**PERF-2 — Index all FKs + hot paths** (P0, S) [04]
Add covering indexes per `04 §4`.
✅ `unindexed_foreign_keys` cleared; queue/dedupe queries use indexes.

---

## Phase 1 — Make it useful

**IMM-1 — Immunization schema + reference** (P1, M) [02,04]
`imunisasi_jenis` + `imunisasi_anak` + RLS + seed Kemenkes/IDAI schedule.
✅ Tables live, seeded, RLS-protected.

**IMM-2 — Record + view immunizations** (P1, M) [05]
Cadre records due vaccines; parent sees done/upcoming/overdue; "next due" logic.
✅ Cadre records a vaccine; parent sees updated card with correct due dates.

**ADM-1 — Admin role + routing** (P1, M) [04,05]
Add `admin` to role check + middleware `/admin`; admin layout.
✅ Admin logs in, lands on `/admin`, others can't access it.

**ADM-2 — Schedule management UI** (P1, M) [05]
CRUD `jadwal` (create/edit/close, quota, location, recurring).
✅ Admin opens next month's session without SQL.

**ADM-3 — User management** (P1, M) [05]
Server-side admin endpoint to set `app_metadata.role` + create kader/bidan rows; deactivate users.
✅ Admin onboards a new kader end-to-end in-app.

**RES-1 — Cancel/reschedule + quota integrity** (P1, M) [04,05]
`cancelled` status; quota decrement trigger; parent cancel/reschedule UI.
✅ Cancelling frees a slot (kuota_terisi correct); tested.

**BID-1 — Paginated, searchable case list** (P1, M) [05]
Server-side list with filters (status/area/date) + pagination.
✅ Bidan dashboard scales; no unbounded client fetch.

**BID-2 — Per-child clinical view** (P1, M) [05]
Full growth curves + measurement + immunization history for staff.
✅ Bidan sees longitudinal data + raw measurements + last-edited-by.

**BID-3 — Structured referral** (P1, S) [05]
"Rujuk Puskesmas" with reason + status, not free text.
✅ Referral is queryable/reportable.

**REP-1 — Report export to Puskesmas** (P1, M) [07]
Per-session + monthly, PDF + CSV; persist to `laporan`.
✅ Exports use corrected status; Puskesmas-acceptable format.

**KAD-1 — Edit/correct measurement (audited)** (P1, S) [05,03]
Cadre corrects pre-validation; change logged.
✅ Correction works; audit_log records it.

**PRIV-1 — Consent + audit log** (P1, M) [03,04]
`consent` capture at registration; `audit_log` on sensitive writes; soft-delete + export.
✅ Consent stored; sensitive writes audited; parent can export/delete.

---

## Phase 2 — Useful for ALL users

**UX-1 — Responsive desktop for staff** (P2, M) [06]
Sidebar + tables for bidan/admin on `lg+`; keep mobile-first for ortu/kader.
✅ Laptop bidan gets a real layout, not a phone column.

**UX-2 — Accessibility pass** (P2, M) [06]
Labels, focus, contrast, lucide icons (no emoji), keyboard nav, friendly errors.
✅ Lighthouse a11y ≥95; screen-reader pass on core journeys.

**UX-3 — Large-text/high-contrast mode** (P2, S) [06]
Persisted inclusive mode for elderly/low-vision users.
✅ Toggle scales text/contrast; persists.

**UX-4 — Design system (shadcn + tokens)** (P2, M) [06,08]
Adopt shadcn primitives; remove inline styles; shared StatusBadge/EmptyState/etc.
✅ No inline `style={{}}` magic numbers; reused components.

**OFF-1 — PWA + offline measurement entry** (P2, L) [06]
Installable PWA; IndexedDB outbox; sync on reconnect; offline Z-score (local engine).
✅ Cadre records offline; entries sync; status shown immediately.

**NOT-1 — Reminders (in-app/email first)** (P2, M) [07]
Scheduled job; session + immunization reminders; idempotent; opt-out.
✅ Parents get reminders; no double-sends; can opt out.

**NOT-2 — WhatsApp channel** (P2, M) [07]
Provider integration + approved templates.
✅ WA reminders deliver via approved templates.

**EDU-1 — Education CMS + content** (P2, M) [04,05,07]
`artikel` CRUD (admin), categories, detail pages, contextual surfacing on flagged results.
✅ Admin publishes an article; parent reads it; flagged result links relevant content.

**ACC-1 — Account self-service** (P2, S) [05]
Password reset, change phone/email, edit child biodata.
✅ Parent resets password + edits a child without support.

---

## Phase 3 — Reliable & operable

**QA-1 — Test suite** (P3, L) [08]
Unit (engine/validators/quota) + integration (API+RLS isolation) + e2e (per-role happy path).
✅ Suites pass in CI; RLS cross-family isolation tested.

**QA-2 — CI gate** (P3, S) [08]
PR gate: typecheck+lint+test+build; advisors post-migration; preview deploys.
✅ Red CI blocks merge/deploy.

**OBS-1 — Monitoring** (P3, S) [08]
Sentry + structured logging + uptime + cron-health + web vitals.
✅ Errors captured; failed cron alerts.

**OBS-2 — Error boundaries & friendly errors** (P3, S) [06,08]
`error/not-found/global-error/offline` pages; no raw DB errors to users.
✅ All failure modes show friendly Indonesian copy.

**RPT-2 — Analytics dashboards** (P3, M) [07]
Trends: stunting rate over time, coverage %, attendance.
✅ Staff dashboard shows trend charts over real aggregates.

**OPS-1 — Backups + restore drill + runbook** (P3, M) [09]
Daily backups/PITR; tested restore; runbook; on-call.
✅ Restore tested; runbook in repo.

**OPS-2 — Cost/scale plan** (P3, S) [09]
Document free-tier cliff; budget Supabase Pro before rollout; region choice.
✅ Written, agreed cost plan before public launch.

---

## Quick map: advisor finding → ticket
| Advisor finding | Ticket |
|---|---|
| public_bucket_allows_listing | SEC-1 |
| rls_enabled_no_policy (kader/bidan_desa/laporan) | SEC-2 |
| function_search_path_mutable | SEC-3 |
| anon/authenticated_security_definer_function_executable | SEC-3 |
| auth_leaked_password_protection | SEC-4 |
| auth_rls_initplan | PERF-1 |
| multiple_permissive_policies | PERF-1 |
| unindexed_foreign_keys | PERF-2 |
