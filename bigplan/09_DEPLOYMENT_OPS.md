# 09 — Deployment & Operations

How to run this for real: environments, secrets, backups, the free-tier cost cliff, and a go-live checklist. The original `PART_06` covers a basic Vercel deploy; this is the production-grade version.

---

## 1. Environments

Today there's effectively one Supabase project and one Vercel project. For a health system you want at least:

| Env | Purpose | Supabase | Vercel |
|-----|---------|----------|--------|
| **Local** | dev | `supabase start` (local stack) | `next dev` |
| **Preview** | per-PR QA | Supabase **branch** (or shared staging) | Vercel preview deploy |
| **Staging** | pre-prod, real-ish data, run advisors | dedicated project/branch | Vercel staging |
| **Production** | live | dedicated project | Vercel production |

- Apply migrations to staging first, run `get_advisors`, then promote.
- Use Supabase **branching** for previews if on a plan that supports it; otherwise a shared staging project.

---

## 2. Secrets & configuration

- Manage env vars per environment in Vercel (Production/Preview/Development scopes). Use `vercel env pull` for local.
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_`), notification provider keys, Sentry DSN.
- **Audit that the service-role key is only referenced in server code** (`03`).
- Never commit `.env.local` (project rule). Rotate any key that was ever shared in chat/screenshots.
- `vercel.json` is minimal (`framework: nextjs`) — add cron definitions here (or `vercel.ts`) for reminders/reports (`07`).

---

## 3. Database operations

- **Backups:** Supabase free tier has limited/no PITR. For production, be on a plan with **daily backups + point-in-time recovery**, or run a scheduled `pg_dump` to off-site storage. Children's health records must be recoverable.
- **Restore drill:** actually test a restore before go-live. An untested backup is a hope, not a backup.
- **Migrations:** forward-only, reviewed, applied via CI to staging then prod. Keep `supabase/migrations` in git (it already tracks 3).
- **Backfill** existing `pemeriksaan` rows with corrected Z-scores once `02` lands (one-off server script using the real engine).
- **Seed**: `imunisasi_jenis`, sample `artikel`, demo accounts for each role.

---

## 4. The free-tier cost cliff (be honest about it)

The plan markets "100% free." That's fine for a pilot but has real limits for production:

| Concern | Free-tier reality | Production need |
|---------|-------------------|-----------------|
| Supabase project pausing | pauses after ~1 week inactivity | a live Posyandu app can't pause — needs a paid plan or keep-alive |
| Backups / PITR | minimal on free | daily + PITR (paid) |
| DB size / bandwidth | 500MB / limited egress | fine early; photos + history grow — monitor |
| Vercel functions | generous but capped | fine; watch cron + report-gen duration |
| WhatsApp messaging | not free | per-message cost + business account (`07`) |
| Email | free tiers exist (Resend etc.) | fine at small scale |
| Custom domain | `.vercel.app` free | a real Posyandu should have its own domain + the trust that brings |

**Recommendation:** pilot on free, but **budget for the Supabase Pro plan (~$25/mo) before public rollout** for backups, no pausing, and headroom. Document this so it's not a surprise.

---

## 5. Scaling & limits to watch
- Photos in Storage grow fastest — set size caps + re-encode (`03`); monitor bucket size.
- `pemeriksaan`/`imunisasi_anak` grow monthly per child — indexes (`04`) keep queries fast; paginate staff views (`05`).
- RLS `get_my_role()` table-read per check — revisit JWT-claim approach as users grow (`04`).
- Region: pick a Supabase region close to users (Singapore for Indonesia) to cut latency.

---

## 6. Operability
- **Runbook** (a doc in the repo): how to add a kader/bidan, open a session, fix a stuck reservation, re-run a failed reminder cron, restore from backup, rotate keys.
- **On-call/contact:** who gets the Sentry/uptime alerts.
- **Status comms:** a way to tell Posyandu staff if the system is down on a session morning (their busiest moment).
- **Data requests:** documented process for parental export/delete (`03`).

---

## 7. Go-live checklist (gate before any real Posyandu uses it)

**Correctness**
- [ ] WHO Z-scores tested against reference values; growth charts show real bands (`02`).
- [ ] Existing records backfilled with corrected status.

**Security/Privacy**
- [ ] `get_advisors(security)` clean of Critical/High; RLS policies on all tables.
- [ ] `child-photos` private; EXIF stripped; signed-URL access only (`03`).
- [ ] Leaked-password + email verification on; service-role key server-only.
- [ ] Consent captured at registration; privacy notice published; audit log live.

**Functionality**
- [ ] Admin can open a session + assign staff in-app (`05`).
- [ ] Immunization recording + parent view work (`02`,`05`).
- [ ] Reservation cancel/reschedule with correct quota (`04`).
- [ ] Report export to Puskesmas (PDF+CSV) works (`07`).

**Quality/Ops**
- [ ] CI gating typecheck/lint/test/build; advisors checked post-migration (`08`).
- [ ] Sentry + uptime + cron-health alerts live (`08`).
- [ ] Backups configured **and a restore tested**.
- [ ] Responsive + a11y pass; PWA installs; offline entry works for kader (`06`).
- [ ] Runbook written; on-call assigned; pilot Posyandu briefed.

**Rollout**
- [ ] Supervised pilot with 1 Posyandu for a full monthly cycle (M1→M2) before wider rollout.
