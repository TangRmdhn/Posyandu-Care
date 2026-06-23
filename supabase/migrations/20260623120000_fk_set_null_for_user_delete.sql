-- Allow an admin to delete a staff/auth user without wiping medical history.
-- These actor/metadata columns are all nullable; their FKs defaulted to NO ACTION
-- (RESTRICT), so deleting a user who had validated/created any row failed with
-- "Database error deleting user". Switch them to ON DELETE SET NULL: deleting the
-- user just unlinks the actor and keeps the underlying record.

alter table public.laporan drop constraint laporan_generated_by_fkey,
  add constraint laporan_generated_by_fkey foreign key (generated_by)
    references public.bidan_desa(id) on delete set null;

alter table public.pemeriksaan drop constraint pemeriksaan_id_bidan_fkey,
  add constraint pemeriksaan_id_bidan_fkey foreign key (id_bidan)
    references public.bidan_desa(id) on delete set null;

alter table public.pemeriksaan drop constraint pemeriksaan_id_kader_fkey,
  add constraint pemeriksaan_id_kader_fkey foreign key (id_kader)
    references public.kader(id) on delete set null;

alter table public.pemeriksaan drop constraint pemeriksaan_updated_by_fkey,
  add constraint pemeriksaan_updated_by_fkey foreign key (updated_by)
    references auth.users(id) on delete set null;

alter table public.artikel drop constraint artikel_created_by_fkey,
  add constraint artikel_created_by_fkey foreign key (created_by)
    references auth.users(id) on delete set null;

alter table public.imunisasi_anak drop constraint imunisasi_anak_id_pemberi_fkey,
  add constraint imunisasi_anak_id_pemberi_fkey foreign key (id_pemberi)
    references auth.users(id) on delete set null;

alter table public.jadwal drop constraint jadwal_created_by_fkey,
  add constraint jadwal_created_by_fkey foreign key (created_by)
    references auth.users(id) on delete set null;
