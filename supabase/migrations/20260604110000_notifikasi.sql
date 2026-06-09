-- NOT-1: in-app notifications (session + immunization reminders).
create table if not exists public.notifikasi (
  id         uuid primary key default gen_random_uuid(),
  id_ortu    uuid not null references public.profiles(id) on delete cascade,
  judul      text not null,
  pesan      text not null,
  tipe       text not null check (tipe in ('sesi','imunisasi','hasil','umum')),
  dibaca     boolean not null default false,
  dedupe_key text unique,
  created_at timestamptz default now()
);
create index if not exists idx_notifikasi_ortu on public.notifikasi (id_ortu, created_at desc);

alter table public.notifikasi enable row level security;

-- owner reads + marks read; inserts happen via the cron (service role), no client insert policy.
create policy "notifikasi_owner_select" on public.notifikasi for select
  using (id_ortu = (select auth.uid()));
create policy "notifikasi_owner_update" on public.notifikasi for update
  using (id_ortu = (select auth.uid()))
  with check (id_ortu = (select auth.uid()));
