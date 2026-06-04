-- Advisor cleanup after the main migrations:
-- (a) revoke EXECUTE from `public` on trigger functions (the implicit PUBLIC
--     grant is why anon/authenticated could still call them); keep get_my_role
--     executable by `authenticated` because RLS evaluation calls it.
-- (b) index the 5 new foreign-key columns.
-- (c) split `FOR ALL` admin policies into INSERT/UPDATE/DELETE so each table has
--     a single permissive SELECT policy (clears multiple_permissive_policies).

-- (a) function EXECUTE grants
revoke execute on function public.handle_new_user()       from public, anon, authenticated;
revoke execute on function public.handle_new_reservasi()  from public, anon, authenticated;
revoke execute on function public.handle_reservasi_quota() from public, anon, authenticated;
revoke execute on function public.get_my_role()           from public, anon;
grant  execute on function public.get_my_role()           to authenticated;

-- (b) FK indexes
create index if not exists idx_artikel_created_by      on public.artikel (created_by);
create index if not exists idx_consent_id_anak         on public.consent (id_anak);
create index if not exists idx_imunisasi_anak_pemberi  on public.imunisasi_anak (id_pemberi);
create index if not exists idx_jadwal_created_by       on public.jadwal (created_by);
create index if not exists idx_pemeriksaan_updated_by  on public.pemeriksaan (updated_by);

-- (c) split FOR ALL → IUD
-- kader
drop policy if exists "kader_admin_manage" on public.kader;
create policy "kader_admin_insert" on public.kader for insert
  with check ((select public.get_my_role()) = 'admin');
create policy "kader_admin_update" on public.kader for update
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
create policy "kader_admin_delete" on public.kader for delete
  using ((select public.get_my_role()) = 'admin');

-- bidan_desa
drop policy if exists "bidan_admin_manage" on public.bidan_desa;
create policy "bidan_admin_insert" on public.bidan_desa for insert
  with check ((select public.get_my_role()) = 'admin');
create policy "bidan_admin_update" on public.bidan_desa for update
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
create policy "bidan_admin_delete" on public.bidan_desa for delete
  using ((select public.get_my_role()) = 'admin');

-- artikel
drop policy if exists "artikel_admin_manage" on public.artikel;
create policy "artikel_admin_insert" on public.artikel for insert
  with check ((select public.get_my_role()) = 'admin');
create policy "artikel_admin_update" on public.artikel for update
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
create policy "artikel_admin_delete" on public.artikel for delete
  using ((select public.get_my_role()) = 'admin');

-- imunisasi_jenis
drop policy if exists "imunisasi_jenis_admin" on public.imunisasi_jenis;
create policy "imunisasi_jenis_admin_insert" on public.imunisasi_jenis for insert
  with check ((select public.get_my_role()) = 'admin');
create policy "imunisasi_jenis_admin_update" on public.imunisasi_jenis for update
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');
create policy "imunisasi_jenis_admin_delete" on public.imunisasi_jenis for delete
  using ((select public.get_my_role()) = 'admin');

-- jadwal
drop policy if exists "jadwal_staff_manage" on public.jadwal;
create policy "jadwal_staff_insert" on public.jadwal for insert
  with check ((select public.get_my_role()) in ('admin','bidan'));
create policy "jadwal_staff_update" on public.jadwal for update
  using ((select public.get_my_role()) in ('admin','bidan'))
  with check ((select public.get_my_role()) in ('admin','bidan'));
create policy "jadwal_staff_delete" on public.jadwal for delete
  using ((select public.get_my_role()) in ('admin','bidan'));

-- consent (merge owner+staff SELECT into one; owner IUD separately)
drop policy if exists "consent_owner_all"  on public.consent;
drop policy if exists "consent_staff_read" on public.consent;
create policy "consent_select" on public.consent for select using (
  id_ortu = (select auth.uid())
  or (select public.get_my_role()) in ('bidan','admin')
);
create policy "consent_owner_insert" on public.consent for insert
  with check (id_ortu = (select auth.uid()));
create policy "consent_owner_update" on public.consent for update
  using (id_ortu = (select auth.uid()))
  with check (id_ortu = (select auth.uid()));
create policy "consent_owner_delete" on public.consent for delete
  using (id_ortu = (select auth.uid()));
