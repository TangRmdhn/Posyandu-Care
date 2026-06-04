-- PERF-2: cover all foreign keys and the hot query paths.
-- Clears unindexed_foreign_keys; speeds the bidan queue + kader queue + NIK dedupe.

create index if not exists idx_anak_id_ortu        on public.anak (id_ortu);
create index if not exists idx_reservasi_id_ortu    on public.reservasi (id_ortu);
create index if not exists idx_reservasi_id_jadwal  on public.reservasi (id_jadwal);
create index if not exists idx_reservasi_id_anak    on public.reservasi (id_anak);
create index if not exists idx_pemeriksaan_id_anak      on public.pemeriksaan (id_anak);
create index if not exists idx_pemeriksaan_id_reservasi on public.pemeriksaan (id_reservasi);
create index if not exists idx_pemeriksaan_id_kader     on public.pemeriksaan (id_kader);
create index if not exists idx_pemeriksaan_id_bidan     on public.pemeriksaan (id_bidan);
create index if not exists idx_laporan_id_jadwal    on public.laporan (id_jadwal);
create index if not exists idx_laporan_generated_by on public.laporan (generated_by);

-- hot paths
create index if not exists idx_pemeriksaan_queue
  on public.pemeriksaan (is_validated, created_at desc);          -- bidan validation queue
create index if not exists idx_reservasi_queue
  on public.reservasi (id_jadwal, status, no_antrean);            -- kader session queue
create index if not exists idx_anak_nik on public.anak (nik);      -- dedupe lookups
