# Posyandu-Care — Operations Runbook

Operational procedures for running the system. See `bigplan/09_DEPLOYMENT_OPS.md`
for the full deployment/ops plan.

## Environments & secrets
- Vercel project hosts the app; Supabase project ref `leemynhujnwjugsivtyb`.
- Required env vars (set per environment in Vercel):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_`)
  - `CRON_SECRET` (protects `/api/cron/reminders`)
- Never commit `.env.local`. Rotate any key ever shared in chat/screenshots.

## Common tasks

### Add a kader or bidan
1. Have them register normally (creates an `ortu` account).
2. Admin → `/admin/pengguna` → enter their email + name + role → "Tetapkan Peran".
   This sets `app_metadata.role`, syncs `profiles.role`, and creates the staff row.

### Open a session
- Admin/bidan → `/admin/jadwal` → fill date/time/location/quota → "Tambah Jadwal".
- Change lifecycle with the per-row buttons (Buka/Tutup/Selesai/Batal).

### Fix a stuck reservation / wrong quota
- `kuota_terisi` is maintained by triggers (`handle_new_reservasi` on insert,
  `handle_reservasi_quota` on cancel/delete). If it drifts, recompute:
  ```sql
  update public.jadwal j set kuota_terisi = (
    select count(*) from public.reservasi r
    where r.id_jadwal = j.id and r.status <> 'cancelled'
  );
  ```

### Re-run the reminder cron manually
- `GET /api/cron/reminders` with header `Authorization: Bearer <CRON_SECRET>`.
- Idempotent (dedupe_key) — safe to re-run; returns `{ candidates, inserted }`.

### Regenerate DB types after a migration
- `supabase gen types typescript --project-id leemynhujnwjugsivtyb > src/types/database.types.ts`
  (or via the MCP `generate_typescript_types`). Then `npm run typecheck`.

### Check security/performance after DDL
- Run Supabase advisors (`get_advisors security|performance`). Expect only the
  documented residuals (see `supabase/migrations/README.md`).

## Backups & restore
- Be on a Supabase plan with daily backups + PITR before public rollout
  (free tier is insufficient). **Test a restore before go-live** — an untested
  backup is not a backup.

## Manual config not done by code (do before production)
- Supabase → Auth: enable **leaked-password protection** + **email confirmation**
  (SEC-4 in `bigplan/03`).
- Verify the seeded `imunisasi_jenis` schedule against the current Permenkes/IDAI.
- Wire a monitoring provider (Sentry) + uptime + cron-health alert (OBS-1).
- WhatsApp/email reminder channels need a provider account (`bigplan/07`).

## On-call
- Who receives Sentry/uptime/cron-failure alerts: _TBD — assign before rollout._
