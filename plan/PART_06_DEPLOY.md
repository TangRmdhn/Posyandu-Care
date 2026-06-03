# Posyandu-Care Implementation Plan
## PART 06 — Deployment & Go Live Checklist

---

## 1. Pre-Deployment Checklist

Before pushing to production, verify every item below:

### 1.1 Code Quality

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] All Zod validation schemas match the SRS VR (Validation Rules) definitions
- [ ] No hardcoded API keys, passwords, or secrets anywhere in the codebase
- [ ] `.env.local` is in `.gitignore` and never committed

### 1.2 Database

- [ ] All 7 tables created successfully in Supabase
- [ ] All RLS policies applied and tested
- [ ] The `handle_new_user` trigger fires correctly on signup
- [ ] The `handle_new_reservasi` trigger increments `no_antrean` and `kuota_terisi` correctly
- [ ] Seed data (Jadwal) is inserted for demo purposes
- [ ] Storage bucket `child-photos` created with correct policies
- [ ] TypeScript types generated with `supabase gen types`

### 1.3 Authentication & Roles

- [ ] Parent (Ortu) registration flow works end-to-end
- [ ] Login redirects each role to the correct dashboard:
  - `ortu` → `/ortu`
  - `kader` → `/kader`
  - `bidan` → `/bidan`
- [ ] Middleware blocks unauthenticated users from protected routes
- [ ] Middleware prevents role cross-access (e.g., Ortu cannot access `/kader/*`)
- [ ] Supabase redirect URLs are configured (see Part 02, Section 9.3)

### 1.4 Features

- [ ] Ortu: can register account and child biodata
- [ ] Ortu: can view available schedules and create reservation
- [ ] Ortu: receives queue number on successful reservation
- [ ] Kader: can see today's queue list
- [ ] Kader: can input anthropometry data and see calculated Z-Score/status
- [ ] Bidan: can filter patients by nutritional status
- [ ] Bidan: can input medical advice and click "Validasi & Kirim"
- [ ] Ortu: can see medical advice from Bidan on child health page

### 1.5 Environment Variables

- [ ] All three env vars set in Vercel Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

---

## 2. Supabase Production Configuration

### 2.1 Auth Settings

Go to **Supabase Dashboard > Authentication > Providers > Email**:

| Setting | Value |
|---------|-------|
| Enable Email provider | ON |
| Confirm email | OFF (for easy demo — turn ON for real production) |
| Minimum password length | 8 |

### 2.2 URL Configuration

Go to **Supabase Dashboard > Authentication > URL Configuration**:

```
Site URL: https://posyandu-care.vercel.app

Redirect URLs (add both):
  https://posyandu-care.vercel.app/**
  http://localhost:3000/**
```

### 2.3 Create Kader and Bidan Accounts (Manual)

Since Kader and Bidan are staff accounts (not self-registered), create them manually:

**Option A — Supabase Dashboard (easiest for demo):**
1. Go to **Authentication > Users > Add User**
2. Enter email and password
3. After creation, go to **Table Editor > profiles**
4. Find the user's row and update `role` to `kader` or `bidan`
5. In **Authentication > Users**, click the user, then under **App Metadata**, add:
   ```json
   { "role": "kader" }
   ```

**Option B — SQL (for batch creation):**
```sql
-- After creating the user via Supabase Auth dashboard,
-- manually update their role in app_metadata using the admin function
-- (requires service_role key — run in Supabase SQL Editor)

-- This function updates app_metadata for a given user
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users
select auth.admin_update_user_by_id(
  'USER_ID_HERE'::uuid,
  '{"app_metadata": {"role": "kader"}}'::jsonb
);
```

> **Note:** The `app_metadata` field is what the middleware reads for role-based routing. Make sure it is set correctly for all staff accounts.

---

## 3. Vercel Deployment Steps

### 3.1 First-Time Deployment

```bash
# Make sure you are on the main branch with all changes committed
git status
git add .
git commit -m "feat: complete posyandu-care implementation"
git push origin main
```

Vercel automatically triggers a deployment on every push to `main`.

### 3.2 Verify Build Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Under **Deployments**, click the latest deployment
4. Check **Build Logs** for any errors
5. A successful build shows: `✓ Compiled successfully`

### 3.3 Environment Variables in Vercel

1. Go to **Project > Settings > Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development** environments:

| Variable | Environments |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview (never expose in browser) |
| `NEXT_PUBLIC_APP_URL` | Production only → `https://posyandu-care.vercel.app` |

---

## 4. Post-Deployment Smoke Tests

Run these tests manually after deploying to production:

### 4.1 Auth Flow

```
1. Visit https://posyandu-care.vercel.app
   EXPECT: Redirect to /login

2. Register as Orang Tua
   EXPECT: Redirect to /ortu/anak/register

3. Complete child biodata
   EXPECT: Redirect to /ortu dashboard

4. Log out, then log in as Kader (manually created account)
   EXPECT: Redirect to /kader dashboard

5. Try visiting /ortu while logged in as Kader
   EXPECT: Redirect back to /kader
```

### 4.2 Reservation Flow

```
1. Log in as Orang Tua
2. Navigate to Jadwal tab
3. Select an available schedule
   EXPECT: See confirmation page with queue number

4. Try selecting a full schedule (kuota_terisi = kuota)
   EXPECT: Button is disabled, shows "Penuh"
```

### 4.3 Examination Flow

```
1. Log in as Kader
2. View today's queue list
3. Select a child from the queue
4. Enter anthropometry values:
   - Berat Badan: 9.5 (valid)
   - Tinggi Badan: 75 (valid)
5. Click "Simpan Data"
   EXPECT: Success, redirect to Kader dashboard
   EXPECT: Pemeriksaan record created with Z-Score and status_gizi

6. Test validation: enter Berat Badan: 0.1 (below minimum)
   EXPECT: Error message "Weight seems too low — please verify"
```

### 4.4 Medical Advice Flow

```
1. Log in as Bidan Desa
2. View dashboard — see list of unvalidated examinations
3. Use filter chips: click "Malnutrisi"
   EXPECT: Only shows children with Gizi Buruk/Gizi Kurang

4. Click "Buat Tindakan" on a patient
5. Enter medical advice text (at least 10 characters)
6. Click "Validasi & Kirim"
   EXPECT: Success, redirect to Bidan dashboard
   EXPECT: is_validated = true in pemeriksaan table

7. Log in as the Orang Tua
   EXPECT: Medical advice visible on child health detail page
```

---

## 5. Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Login redirects to `/login` in a loop | `app_metadata.role` not set | Set role in Supabase Auth > Users > App Metadata |
| "Error: Row not found" on child page | RLS policy blocking access | Check `profiles` RLS — user ID must match `id_ortu` |
| Reservation fails silently | Quota trigger not working | Re-run the `handle_new_reservasi` trigger SQL |
| Vercel build fails: `Cannot find module` | Missing dependency | Run `npm install` and push again |
| Types error after schema change | Stale generated types | Re-run `supabase gen types typescript ...` |
| Supabase project paused | Free tier auto-pause | Log in to Supabase dashboard and click "Resume" |
| Photos not loading | Storage policy missing | Re-apply the storage RLS policies from Part 01 |

---

## 6. Monitoring & Maintenance (Free)

| Tool | What to Monitor | Access |
|------|----------------|--------|
| Vercel Dashboard | Build status, function errors, bandwidth usage | vercel.com/dashboard |
| Supabase Dashboard | DB usage, auth users, storage quota | supabase.com/dashboard |
| Supabase Logs | API errors, slow queries | Dashboard > Logs |
| Vercel Logs | Runtime errors from Route Handlers | Project > Functions > Logs |

### Keeping the Supabase Project Active

Supabase free tier pauses projects after 1 week of inactivity. To prevent this:

**Option A:** Enable the "Prevent project from pausing" toggle in:
`Dashboard > Project Settings > General > Pause Project`

**Option B:** Set a simple cron-style keepalive by visiting the app URL at least once a week.

---

## 7. Final Deliverable Summary

After completing all parts, the delivered system includes:

| Component | Status |
|-----------|--------|
| Next.js 14 App Router project | Ready to push |
| Supabase PostgreSQL schema (7 tables) | SQL ready in Part 01 |
| Row Level Security policies | SQL ready in Part 01 |
| Auth system with 3 roles | Implemented in Part 02-03 |
| WHO Z-Score nutritional calculation | Implemented in Part 03 |
| API Route Handlers (auth, reservasi, pemeriksaan, zscore) | Implemented in Part 03 |
| All UI components matching SRS mockups | Implemented in Part 04 |
| All 5 Functional Requirements (FR-01 to FR-05) | Implemented in Part 05 |
| Vercel deployment pipeline | Configured in Part 02 |
| Zero cost, fully functional | Confirmed |

**Live URL format:** `https://posyandu-care.vercel.app`
**Repository:** `https://gitlab.com/daniel24-png-group/rpl_2026`
