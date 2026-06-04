# 04 — Database Evolution

Schema and policy changes needed for correctness, the new features, and the advisor fixes. All changes ship as **Supabase migrations** (the project already uses migrations: `init_schema`, `rls_policies`, `get_my_role_from_profiles`). Never hand-edit production; add ordered migration files and regenerate `database.types.ts`.

---

## 1. New tables

### 1.1 `imunisasi_jenis` — vaccine reference (data-driven schedule)
```sql
create table public.imunisasi_jenis (
  id              uuid primary key default gen_random_uuid(),
  kode            text unique not null,         -- 'HB0','BCG','DPT1',...
  nama            text not null,
  dosis_ke        integer not null default 1,
  usia_bulan_min  integer not null,             -- recommended earliest age (months)
  usia_bulan_rekomendasi integer not null,      -- recommended age
  interval_hari_min integer,                     -- min gap from previous dose
  urutan          integer not null,             -- display order
  aktif           boolean not null default true,
  created_at      timestamptz default now()
);
```

### 1.2 `imunisasi_anak` — per-child immunization records
```sql
create table public.imunisasi_anak (
  id              uuid primary key default gen_random_uuid(),
  id_anak         uuid not null references public.anak(id) on delete cascade,
  id_jenis        uuid not null references public.imunisasi_jenis(id),
  tgl_pemberian   date not null,
  id_pemberi      uuid references auth.users(id),   -- kader/bidan who recorded
  batch_lot       text,
  catatan         text,
  created_at      timestamptz default now(),
  unique (id_anak, id_jenis)                        -- one record per vaccine-dose per child
);
create index on public.imunisasi_anak (id_anak);
create index on public.imunisasi_anak (id_jenis);
```
"Next due" is derived in app code from `anak.tgl_lahir` + `imunisasi_jenis.usia_bulan_rekomendasi` minus what exists in `imunisasi_anak`.

### 1.3 `artikel` — admin-managed education content (replaces hardcoded stubs)
```sql
create table public.artikel (
  id          uuid primary key default gen_random_uuid(),
  judul       text not null,
  slug        text unique not null,
  ringkasan   text,
  konten      text not null,            -- markdown
  kategori    text,                     -- 'gizi','imunisasi','stunting',...
  gambar_url  text,
  published   boolean not null default false,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index on public.artikel (published, kategori);
```

### 1.4 `audit_log` — accountability for sensitive data
```sql
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_role  text,
  action      text not null,            -- 'insert'|'update'|'delete'|'view'
  entity      text not null,            -- 'pemeriksaan'|'anak'|'imunisasi_anak'|...
  entity_id   uuid,
  diff        jsonb,                    -- changed fields
  created_at  timestamptz default now()
);
create index on public.audit_log (entity, entity_id);
create index on public.audit_log (created_at);
```
Populate from server actions/handlers (preferred — has user context) and/or table triggers for writes.

### 1.5 `consent` — parental consent records
```sql
create table public.consent (
  id            uuid primary key default gen_random_uuid(),
  id_ortu       uuid not null references public.profiles(id) on delete cascade,
  id_anak       uuid references public.anak(id) on delete cascade,
  notice_version text not null,
  granted       boolean not null,
  granted_at    timestamptz default now()
);
```

---

## 2. Changes to existing tables

### 2.1 `profiles` — add `admin` role
```sql
alter table public.profiles
  drop constraint if exists profiles_role_check,
  add constraint profiles_role_check check (role in ('ortu','kader','bidan','admin'));
```
Update `app_metadata.role` allowed values and middleware (`05`) accordingly.

### 2.2 `pemeriksaan` — per-indicator status + length/height flag + soft state
The single `status_gizi` is ambiguous (`02` recommends per-indicator labels). Add:
```sql
alter table public.pemeriksaan
  add column status_bb_u   text,
  add column status_tb_u   text,
  add column status_bb_tb  text,
  add column ukuran_panjang_telentang boolean,   -- true=length(lying), false=height(standing)
  add column updated_at     timestamptz default now(),
  add column updated_by     uuid references auth.users(id);
```
Keep `status_gizi` as the worst-case headline for list views (or derive in app).

### 2.3 `anak` — soft delete (for DSAR / mistaken entries)
```sql
alter table public.anak add column deleted_at timestamptz;
-- queries filter `deleted_at is null`; RLS unchanged
```

### 2.4 `jadwal` — admin management + lifecycle
```sql
alter table public.jadwal
  add column status text not null default 'open'
    check (status in ('open','closed','done','cancelled')),
  add column created_by uuid references auth.users(id),
  add column catatan text;
```

### 2.5 `reservasi` — cancel/reschedule with quota integrity
The current `handle_new_reservasi` trigger increments `kuota_terisi` on insert, but **nothing decrements it on cancel/delete**. Fix:
```sql
-- decrement quota when a reservation leaves 'pending'/'reviewed' active state
create or replace function public.handle_reservasi_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE') then
    update public.jadwal set kuota_terisi = greatest(kuota_terisi - 1, 0)
      where id = old.id_jadwal;
    return old;
  elsif (tg_op = 'UPDATE') then
    if (new.status = 'cancelled' and old.status <> 'cancelled') then
      update public.jadwal set kuota_terisi = greatest(kuota_terisi - 1, 0)
        where id = old.id_jadwal;
    elsif (old.status = 'cancelled' and new.status <> 'cancelled') then
      update public.jadwal set kuota_terisi = kuota_terisi + 1
        where id = new.id_jadwal;
    end if;
    return new;
  end if;
  return null;
end;
$$;

create trigger on_reservasi_quota
  after update or delete on public.reservasi
  for each row execute function public.handle_reservasi_quota();
```
Also extend the status check to include `'cancelled'` (already allowed: `pending|reviewed|verified|rejected` — add `cancelled`). Reschedule = cancel + create (or update `id_jadwal` and let the trigger rebalance both schedules; if updating `id_jadwal`, handle both old and new in the function).

---

## 3. Fix RLS (correctness + performance)

### 3.1 Add policies to the no-policy tables
```sql
-- kader
create policy "kader read own or staff/admin"
  on public.kader for select
  using ( id = (select auth.uid())
          or (select public.get_my_role()) in ('bidan','admin') );
create policy "admin manage kader"
  on public.kader for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- bidan_desa: analogous
create policy "bidan read own or admin"
  on public.bidan_desa for select
  using ( id = (select auth.uid())
          or (select public.get_my_role()) = 'admin' );
create policy "admin manage bidan"
  on public.bidan_desa for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- laporan
create policy "staff read laporan"
  on public.laporan for select
  using ((select public.get_my_role()) in ('bidan','admin'));
create policy "bidan/admin write laporan"
  on public.laporan for insert
  with check ((select public.get_my_role()) in ('bidan','admin'));
```

### 3.2 Rewrite existing policies to fix `auth_rls_initplan`
Wrap every `auth.uid()` and `get_my_role()` in a scalar subquery so it's evaluated once, not per row:
```sql
-- example: anak select, consolidated (also fixes multiple_permissive_policies)
drop policy if exists "Ortu can view own children" on public.anak;
drop policy if exists "Staff can view all children" on public.anak;
create policy "anak select: owner or staff"
  on public.anak for select
  using (
    ((select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid()))
    or (select public.get_my_role()) in ('kader','bidan','admin')
  );
```
Apply the same consolidation pattern to `profiles`, `pemeriksaan`, `reservasi` (one SELECT policy per table covering all roles via OR). This removes both the per-row re-eval and the duplicate-policy warnings.

### 3.3 RLS for new tables
```sql
alter table public.imunisasi_jenis enable row level security;
alter table public.imunisasi_anak  enable row level security;
alter table public.artikel         enable row level security;
alter table public.audit_log       enable row level security;
alter table public.consent         enable row level security;

-- imunisasi_jenis: everyone authenticated reads; admin writes
create policy "read vaccine ref" on public.imunisasi_jenis for select
  using ((select auth.role()) = 'authenticated');
create policy "admin writes vaccine ref" on public.imunisasi_jenis for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- imunisasi_anak: parent sees own child's; staff read/write all
create policy "imun read" on public.imunisasi_anak for select
  using (
    (select public.get_my_role()) in ('kader','bidan','admin')
    or id_anak in (select id from public.anak where id_ortu = (select auth.uid()))
  );
create policy "staff record imun" on public.imunisasi_anak for insert
  with check ((select public.get_my_role()) in ('kader','bidan','admin'));

-- artikel: public reads published; admin manages
create policy "read published artikel" on public.artikel for select
  using (published or (select public.get_my_role()) = 'admin');
create policy "admin manage artikel" on public.artikel for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- audit_log: admin/bidan read; inserts via SECURITY DEFINER server context only (no client policy)
create policy "admin read audit" on public.audit_log for select
  using ((select public.get_my_role()) in ('admin','bidan'));

-- consent: parent manages own; staff/admin read
create policy "consent owner" on public.consent for all
  using (id_ortu = (select auth.uid()))
  with check (id_ortu = (select auth.uid()));
create policy "consent staff read" on public.consent for select
  using ((select public.get_my_role()) in ('bidan','admin'));
```

---

## 4. Indexes (fix `unindexed_foreign_keys` + query hot paths)
```sql
create index on public.anak (id_ortu);
create index on public.reservasi (id_ortu);
create index on public.reservasi (id_jadwal);
create index on public.pemeriksaan (id_anak);
create index on public.pemeriksaan (id_reservasi);
create index on public.pemeriksaan (id_kader);
create index on public.pemeriksaan (id_bidan);
create index on public.laporan (id_jadwal);
create index on public.laporan (generated_by);
-- hot paths:
create index on public.pemeriksaan (is_validated, created_at desc);   -- bidan queue
create index on public.reservasi (id_jadwal, status, no_antrean);     -- kader queue
create index on public.anak (nik);                                    -- dedupe lookups
```

---

## 5. `get_my_role()` — decide JWT vs table read
Migration `get_my_role_from_profiles` made it read `profiles`. That's a table read on **every RLS check** — costly at scale. Options:
- **Preferred:** put `role` into the JWT `app_metadata` reliably at signup (fix the root cause of the original login loop), and read it from the claim in `get_my_role()` — no table read.
- **Acceptable interim:** keep the profiles read but mark the function `stable` and pin `search_path` so it's at least cached within a statement and not a security hole.
Document the choice; revisit when user count grows.

---

## 6. Migration & types workflow
1. Write each change as a new timestamped migration (`supabase/migrations/*.sql`).
2. Apply to a **branch/staging** project first; run `get_advisors` after each DDL batch.
3. Regenerate types: `supabase gen types typescript ... > src/types/database.types.ts`.
4. Backfill: existing `pemeriksaan` rows get recomputed Z-scores/status once the real engine (`02`) lands — write a one-off backfill script (server-side, using the new engine).
5. Seed `imunisasi_jenis` and a few `artikel` rows.

---

## 7. Acceptance criteria
- [ ] All new tables created with RLS + least-privilege policies.
- [ ] `kader`/`bidan_desa`/`laporan` no longer flagged `rls_enabled_no_policy`.
- [ ] `auth_rls_initplan` and `multiple_permissive_policies` warnings cleared.
- [ ] All FKs indexed; queue/queue/dedupe hot paths indexed.
- [ ] Cancelling a reservation decrements `kuota_terisi` correctly (tested).
- [ ] `database.types.ts` regenerated; app compiles against it.
