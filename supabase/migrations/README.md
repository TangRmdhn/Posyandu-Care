# Supabase migrations

Forward-only, ordered. Apply on a branch/staging project first, run
`get_advisors` after each batch, then promote (see `bigplan/09`).

| Order | File | Plan ticket | Effect |
|------|------|-------------|--------|
| 0a | `20260603050443_init_schema.sql` | base | extension `uuid-ossp`; base tables (`profiles`, `kader`, `bidan_desa`, `anak`, `jadwal`, `reservasi`, `pemeriksaan`, `laporan`); `handle_new_user` + `handle_new_reservasi` triggers |
| 0b | `20260603050516_rls_policies.sql` | base | enable RLS on base tables; initial `get_my_role` (JWT-based); per-role policies; seed `jadwal` sample rows |
| 0c | `20260603105642_get_my_role_from_profiles.sql` | base | `get_my_role` reads role from `profiles` (SECURITY DEFINER) instead of JWT app_metadata |
| 0d | `20260603110000_storage_child_photos_bucket.sql` | base | create `child-photos` storage bucket (idempotent); so the later lockdown migration has a bucket to harden |
| 1 | `20260604090000_function_hardening.sql` | SEC-3 | pin `search_path=''` on the 3 functions; revoke RPC execute (trigger fns from anon+authenticated, `get_my_role` from anon) |
| 2 | `20260604090100_schema_evolution.sql` | ADM-1, RES-1, ADM-2, PRIV, ZS-2 | `admin` role; `cancelled` status + quota-decrement trigger; jadwal lifecycle; anak soft-delete; per-indicator status columns |
| 3 | `20260604090200_rls_missing_tables.sql` | SEC-2 | RLS policies for `kader` / `bidan_desa` / `laporan` |
| 4 | `20260604090300_rls_consolidate.sql` | PERF-1 | one SELECT policy per table, all auth calls wrapped in `(select …)`; admin visibility; parent can cancel own reservation |
| 5 | `20260604090400_new_tables.sql` | IMM-1, EDU, PRIV-1 | `imunisasi_jenis` (+seed), `imunisasi_anak`, `artikel`, `audit_log`, `consent` + RLS |
| 6 | `20260604090500_indexes.sql` | PERF-2 | cover all FKs + queue/dedupe hot paths |
| 7 | `20260604090600_storage_child_photos_private.sql` | SEC-1 | make `child-photos` private; owner/staff-scoped object policies |

## After applying
- Regenerate types: `supabase gen types typescript … > src/types/database.types.ts`.
- Re-run `get_advisors(security)` and `get_advisors(performance)` — expect the
  matching findings cleared.

## NOT covered by SQL (do in Supabase Dashboard → Authentication)
These are Auth config, not schema — **SEC-4**:
- Enable **leaked-password protection** (HaveIBeenPwned).
- Require **email confirmation** before first login; set a password policy.

## Known residual finding (intentional)
- `authenticated_security_definer_function_executable` for `public.get_my_role`
  remains: RLS policy evaluation calls it, so `authenticated` must keep EXECUTE.
  It only returns the caller's own role. Documented, accepted.

## Seed caveat
`imunisasi_jenis` is seeded with a reasonable Indonesian primary schedule but
**must be verified against the current Permenkes / IDAI schedule** before
production. It is admin-editable (data-driven) by design.
