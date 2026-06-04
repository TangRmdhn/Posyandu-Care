-- New tables: immunization (reference + per-child), education content, audit log,
-- and parental consent. Each gets RLS with least-privilege policies.

-- 1. imunisasi_jenis — vaccine reference (data-driven schedule, admin-editable)
create table if not exists public.imunisasi_jenis (
  id                     uuid primary key default gen_random_uuid(),
  kode                   text unique not null,
  nama                   text not null,
  dosis_ke               integer not null default 1,
  usia_bulan_min         integer not null,
  usia_bulan_rekomendasi integer not null,
  interval_hari_min      integer,
  urutan                 integer not null,
  aktif                  boolean not null default true,
  created_at             timestamptz default now()
);

-- 2. imunisasi_anak — per-child immunization records
create table if not exists public.imunisasi_anak (
  id            uuid primary key default gen_random_uuid(),
  id_anak       uuid not null references public.anak(id) on delete cascade,
  id_jenis      uuid not null references public.imunisasi_jenis(id),
  tgl_pemberian date not null,
  id_pemberi    uuid references auth.users(id),
  batch_lot     text,
  catatan       text,
  created_at    timestamptz default now(),
  unique (id_anak, id_jenis)
);
create index if not exists idx_imunisasi_anak_anak  on public.imunisasi_anak (id_anak);
create index if not exists idx_imunisasi_anak_jenis on public.imunisasi_anak (id_jenis);

-- 3. artikel — admin-managed education content
create table if not exists public.artikel (
  id         uuid primary key default gen_random_uuid(),
  judul      text not null,
  slug       text unique not null,
  ringkasan  text,
  konten     text not null,
  kategori   text,
  gambar_url text,
  published  boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_artikel_published_kategori on public.artikel (published, kategori);

-- 4. audit_log — accountability for sensitive data (written from server context)
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  actor_role text,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  diff       jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_entity  on public.audit_log (entity, entity_id);
create index if not exists idx_audit_created  on public.audit_log (created_at);

-- 5. consent — parental consent records
create table if not exists public.consent (
  id             uuid primary key default gen_random_uuid(),
  id_ortu        uuid not null references public.profiles(id) on delete cascade,
  id_anak        uuid references public.anak(id) on delete cascade,
  notice_version text not null,
  granted        boolean not null,
  granted_at     timestamptz default now()
);
create index if not exists idx_consent_ortu on public.consent (id_ortu);

-- ---- RLS ----
alter table public.imunisasi_jenis enable row level security;
alter table public.imunisasi_anak  enable row level security;
alter table public.artikel         enable row level security;
alter table public.audit_log       enable row level security;
alter table public.consent         enable row level security;

-- imunisasi_jenis: any authenticated user reads; admin writes.
create policy "imunisasi_jenis_read" on public.imunisasi_jenis for select
  using ((select auth.role()) = 'authenticated');
create policy "imunisasi_jenis_admin" on public.imunisasi_jenis for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- imunisasi_anak: parent sees own child's; staff read; staff record.
create policy "imunisasi_anak_select" on public.imunisasi_anak for select using (
  (select public.get_my_role()) in ('kader','bidan','admin')
  or id_anak in (select id from public.anak where id_ortu = (select auth.uid()))
);
create policy "imunisasi_anak_insert_staff" on public.imunisasi_anak for insert
  with check ((select public.get_my_role()) in ('kader','bidan','admin'));
create policy "imunisasi_anak_update_staff" on public.imunisasi_anak for update
  using ((select public.get_my_role()) in ('kader','bidan','admin'));

-- artikel: anyone reads published; admin manages all.
create policy "artikel_read_published" on public.artikel for select
  using (published or (select public.get_my_role()) = 'admin');
create policy "artikel_admin_manage" on public.artikel for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- audit_log: admin/bidan read; inserts happen via server (service role), no client insert policy.
create policy "audit_log_staff_read" on public.audit_log for select
  using ((select public.get_my_role()) in ('admin','bidan'));

-- consent: parent manages own; staff/admin read.
create policy "consent_owner_all" on public.consent for all
  using (id_ortu = (select auth.uid()))
  with check (id_ortu = (select auth.uid()));
create policy "consent_staff_read" on public.consent for select
  using ((select public.get_my_role()) in ('bidan','admin'));

-- ---- Seed: Indonesian primary immunization schedule (data-driven) ----
-- NOTE: VERIFY against the current Permenkes / IDAI schedule before production.
-- Kept editable by admin; this is a reasonable starting set, not authoritative.
insert into public.imunisasi_jenis (kode, nama, dosis_ke, usia_bulan_min, usia_bulan_rekomendasi, interval_hari_min, urutan, aktif) values
  ('HB0',    'Hepatitis B (HB-0)',          1, 0, 0,  null, 1,  true),
  ('BCG',    'BCG',                         1, 0, 1,  null, 2,  true),
  ('OPV0',   'Polio tetes (OPV-0)',         1, 0, 1,  null, 3,  true),
  ('DPTHBHIB1','DPT-HB-Hib 1',              1, 2, 2,  null, 4,  true),
  ('OPV1',   'Polio tetes (OPV-1)',         2, 2, 2,  28,   5,  true),
  ('PCV1',   'PCV 1',                       1, 2, 2,  null, 6,  true),
  ('RV1',    'Rotavirus 1',                 1, 2, 2,  null, 7,  true),
  ('DPTHBHIB2','DPT-HB-Hib 2',              2, 3, 3,  28,   8,  true),
  ('OPV2',   'Polio tetes (OPV-2)',         3, 3, 3,  28,   9,  true),
  ('PCV2',   'PCV 2',                       2, 3, 3,  28,   10, true),
  ('RV2',    'Rotavirus 2',                 2, 3, 3,  28,   11, true),
  ('DPTHBHIB3','DPT-HB-Hib 3',              3, 4, 4,  28,   12, true),
  ('OPV3',   'Polio tetes (OPV-3)',         4, 4, 4,  28,   13, true),
  ('IPV1',   'Polio suntik (IPV-1)',        1, 4, 4,  null, 14, true),
  ('RV3',    'Rotavirus 3',                 3, 4, 4,  28,   15, true),
  ('MR9',    'Campak-Rubella (MR)',         1, 9, 9,  null, 16, true),
  ('IPV2',   'Polio suntik (IPV-2)',        2, 9, 9,  null, 17, true),
  ('DPTHBHIB4','DPT-HB-Hib lanjutan',       4, 18, 18, null, 18, true),
  ('MR18',   'Campak-Rubella (MR) lanjutan', 2, 18, 18, null, 19, true)
on conflict (kode) do nothing;
