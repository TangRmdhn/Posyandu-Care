# 03 — Security & Privacy

This system stores **minors' health data**: NIK, birth date, address (RT/RW), photos, growth and medical records. That raises the bar. This doc fixes every live Supabase advisor finding and adds the privacy controls a real deployment needs (Indonesia's PDP law, UU 27/2022).

---

## 1. Fix the live advisor findings

These are pulled from the project's actual Supabase advisors. Treat as a checklist.

### 1.1 Critical — children's photos publicly listable
**Finding:** `public_bucket_allows_listing` — bucket `child-photos` has a broad SELECT policy ("Public read for child photos") allowing clients to **list all files**.

**Fix:**
- Make the bucket **private**. Serve images via **signed URLs** generated server-side (short TTL), or via a Next.js route that checks the requester may see that child.
- Store objects under a per-owner path: `child-photos/{id_ortu}/{id_anak}.jpg`.
- Replace the broad SELECT policy with one scoped to ownership/role:
```sql
-- read: parent owns the child, or staff
create policy "read child photo by owner or staff"
on storage.objects for select
using (
  bucket_id = 'child-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.get_my_role() in ('kader','bidan','admin')
  )
);
-- write: parent into their own folder
create policy "parent uploads own child photo"
on storage.objects for insert
with check (
  bucket_id = 'child-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
```

### 1.2 Critical — RLS enabled, no policies (`kader`, `bidan_desa`, `laporan`)
**Finding:** `rls_enabled_no_policy`. These tables are effectively unreadable by app clients, silently breaking staff profile reads and report lookups.

**Fix:** add least-privilege policies (full SQL in `04`). Sketch:
- `kader` / `bidan_desa`: a user reads their own row; staff/admin read all; only admin (or service role) writes.
- `laporan`: bidan/admin read; bidan/admin insert.

### 1.3 High — mutable function `search_path`
**Finding:** `function_search_path_mutable` on `handle_new_user`, `handle_new_reservasi`, `get_my_role`.

**Fix:** pin the search path on each:
```sql
alter function public.handle_new_user()      set search_path = '';
alter function public.handle_new_reservasi()  set search_path = '';
alter function public.get_my_role()           set search_path = '';
```
(Reference fully-qualified names inside, e.g. `public.profiles`, `pg_catalog`.)

### 1.4 High — SECURITY DEFINER functions callable by anon/authenticated
**Finding:** `anon_security_definer_function_executable` + `authenticated_..._executable` on `get_my_role`, `handle_new_user`, `handle_new_reservasi`. They're reachable via `/rest/v1/rpc/*`.

**Fix:** trigger functions should never be RPC-exposed. Revoke execute:
```sql
revoke execute on function public.handle_new_user()     from anon, authenticated;
revoke execute on function public.handle_new_reservasi() from anon, authenticated;
-- get_my_role is used inside RLS; keep it but make it SECURITY DEFINER + stable + pinned path,
-- and revoke direct RPC execute from anon (authenticated may keep it only if RLS needs it):
revoke execute on function public.get_my_role() from anon;
```
> Note: `get_my_role` was migrated to read from `profiles` (migration `get_my_role_from_profiles`). Confirm it no longer depends on JWT `app_metadata` and that it's `stable`. Prefer reading the role from the JWT claim where possible to avoid a table read per RLS check (see performance, `04`).

### 1.5 High — leaked-password protection off
**Finding:** `auth_leaked_password_protection` disabled.

**Fix:** enable HaveIBeenPwned check in Supabase Auth settings; set a minimum password policy. Also enable **email confirmation** (verify before first login) and consider OTP for parents who struggle with passwords.

### 1.6 Performance findings (also a hardening concern)
- `auth_rls_initplan`: rewrite every policy `auth.uid()` → `(select auth.uid())` and `get_my_role()` → `(select public.get_my_role())`. Prevents per-row re-evaluation.
- `multiple_permissive_policies`: consolidate the stacked SELECT policies on `anak`, `pemeriksaan`, `profiles`, `reservasi` into one policy per role/action using `OR`.
- `unindexed_foreign_keys`: add covering indexes (see `04`).

---

## 2. Application-layer security

### 2.1 Single validated write path (kills a class of bugs)
Today the register page does a **raw client-side insert** bypassing the `registerAnak` server action and its Zod schema. Under RLS that's not a data-leak, but it's an integrity and consistency hole.
- All mutations go through **server actions or authenticated route handlers** that validate with the existing Zod schemas.
- Client components call those; they don't `insert/update` directly.
- Benefit: one place for validation, auditing, and authorization checks.

### 2.2 Authorize every API route + rate-limit
- `/api/zscore` is currently **unauthenticated** — require a session (or delete it; the server computes Z internally anyway).
- Add rate limiting on `/api/reservasi`, `/api/pemeriksaan`, auth endpoints (e.g. Upstash Redis sliding window, or Vercel’s built-in protections / BotID). Prevents quota-grabbing and brute force.
- Re-check role server-side in each handler (don't trust the middleware alone). `api/pemeriksaan` already checks `app_metadata.role` — make that consistent and also tolerate the `profiles.role` fallback used elsewhere.

### 2.3 Security headers + config
`next.config.mjs` is empty. Add:
- `Content-Security-Policy` (allow Supabase + self), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Permissions-Policy`.
- `images.remotePatterns` for the Supabase storage domain (needed once photos work).

### 2.4 Input & file hardening
- Validate uploaded images server-side: type allowlist (jpeg/png/webp), size cap, re-encode/strip EXIF (EXIF can carry GPS — a privacy leak for kids' photos).
- Enforce NIK format/uniqueness server-side (today it's checked client-side and in the action — keep only the server check authoritative).

### 2.5 Session & auth UX
- Email verification before first login; password reset flow (missing today).
- Session expiry handling: refresh/clear gracefully; the recent "ortu login loop" fix shows this area is fragile — add a test.
- Consider per-role MFA for bidan/admin (they see all children).

---

## 3. Privacy & compliance (UU PDP 27/2022 — minors' health data)

Children's health data is sensitive personal data under Indonesian law. Even for a pilot, design these in:

### 3.1 Consent
- Capture **parental consent** at child registration: what data is collected, why, who can see it (cadre, midwife, Puskesmas), retention. Store consent record + timestamp + version of the notice.
- Provide a plain-language privacy notice page (Indonesian).

### 3.2 Data minimization & access
- Only collect what's needed. Question whether full NIK is required, or whether a hashed/partial form suffices for dedupe (full NIK is high-value PII).
- RLS already scopes parents to their own children — verify no join leaks (the `kader`/`bidan_desa` missing-policy bug shows joins can misbehave).
- Mask sensitive fields in lists (e.g. show partial NIK).

### 3.3 Audit trail
- Add an `audit_log` table (see `04`): who read/wrote which child's sensitive record, when. At minimum log writes to `pemeriksaan`, `imunisasi_anak`, `anak`, and bidan validations.
- Surface "last edited by / at" on medical records. Supports accountability for referral decisions.

### 3.4 Retention & rights
- Define a retention policy (children's records often kept for years for growth history — document it, don't keep forever by accident).
- Support data-subject requests: a parent can export or request deletion of their child's data (soft-delete + scheduled purge — see `04`).

### 3.5 Secrets & access control
- Never commit `.env.local` (already in rules). Rotate Supabase keys if they were ever shared.
- The **service-role key must never reach the client**. Audit that it's only used in server contexts.
- Restrict who has Supabase dashboard / Vercel project access; use least privilege for team members.

---

## 4. Acceptance criteria

- [ ] `get_advisors(security)` returns no Critical/High findings (the INFO `rls_enabled_no_policy` resolved; WARN items fixed).
- [ ] `child-photos` is private; images only reachable via authorized signed URL/route; EXIF stripped.
- [ ] All mutations go through validated server actions/handlers; `/api/zscore` authenticated or removed.
- [ ] Security headers present; leaked-password + email verification on.
- [ ] Consent captured at registration; audit log records sensitive writes; soft-delete + export available.
- [ ] A written privacy notice (Indonesian) is linked from registration and the footer.
