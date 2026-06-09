-- BID-3: structured referral on a pemeriksaan (replaces free-text "rujuk").
alter table public.pemeriksaan
  add column if not exists rujukan boolean not null default false,
  add column if not exists rujukan_alasan text,
  add column if not exists rujukan_status text not null default 'none'
    check (rujukan_status in ('none','pending','done'));

create index if not exists idx_pemeriksaan_rujukan
  on public.pemeriksaan (rujukan, rujukan_status)
  where rujukan = true;
