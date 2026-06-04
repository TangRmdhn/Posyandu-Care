-- PERF-1: consolidate stacked SELECT policies into one per table and wrap every
-- auth.uid()/auth.role()/get_my_role() in a scalar subquery so it is evaluated
-- once per statement, not once per row. Also grants the new 'admin' role the
-- staff visibility it needs, and lets parents update (cancel) their own
-- reservations. Behaviour-preserving for existing roles.
-- Clears auth_rls_initplan + multiple_permissive_policies.

-- ---- anak ----
drop policy if exists "Ortu can view own children"  on public.anak;
drop policy if exists "Staff can view all children"  on public.anak;
drop policy if exists "Ortu can insert children"     on public.anak;
create policy "anak_select" on public.anak for select using (
  ((select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid()))
  or (select public.get_my_role()) in ('kader','bidan','admin')
);
create policy "anak_insert_ortu" on public.anak for insert with check (
  (select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid())
);

-- ---- pemeriksaan ----
drop policy if exists "Bidan can view all pemeriksaan"           on public.pemeriksaan;
drop policy if exists "Kader can view all pemeriksaan"           on public.pemeriksaan;
drop policy if exists "Ortu can view own children pemeriksaan"   on public.pemeriksaan;
drop policy if exists "Kader can insert pemeriksaan"             on public.pemeriksaan;
drop policy if exists "Bidan can update pemeriksaan"             on public.pemeriksaan;
create policy "pemeriksaan_select" on public.pemeriksaan for select using (
  (select public.get_my_role()) in ('kader','bidan','admin')
  or (
    (select public.get_my_role()) = 'ortu'
    and id_anak in (select id from public.anak where id_ortu = (select auth.uid()))
  )
);
create policy "pemeriksaan_insert_kader" on public.pemeriksaan for insert with check (
  (select public.get_my_role()) = 'kader'
);
create policy "pemeriksaan_update_staff" on public.pemeriksaan for update using (
  (select public.get_my_role()) in ('bidan','admin')
);

-- ---- profiles ----
drop policy if exists "Users can view own profile"        on public.profiles;
drop policy if exists "Staff can view all ortu profiles"  on public.profiles;
drop policy if exists "Users can update own profile"      on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  (select auth.uid()) = id
  or (select public.get_my_role()) in ('kader','bidan','admin')
);
create policy "profiles_update_own" on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---- reservasi ----
drop policy if exists "Bidan can view all reservasi"        on public.reservasi;
drop policy if exists "Kader can view all reservasi"        on public.reservasi;
drop policy if exists "Ortu can view own reservasi"         on public.reservasi;
drop policy if exists "Ortu can create reservasi"           on public.reservasi;
drop policy if exists "Kader can update reservasi status"   on public.reservasi;
create policy "reservasi_select" on public.reservasi for select using (
  (select public.get_my_role()) in ('kader','bidan','admin')
  or ((select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid()))
);
create policy "reservasi_insert_ortu" on public.reservasi for insert with check (
  (select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid())
);
create policy "reservasi_update" on public.reservasi for update
  using (
    (select public.get_my_role()) in ('kader','bidan','admin')
    or ((select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid()))
  )
  with check (
    (select public.get_my_role()) in ('kader','bidan','admin')
    or ((select public.get_my_role()) = 'ortu' and id_ortu = (select auth.uid()))
  );

-- ---- jadwal ----
drop policy if exists "Authenticated users can view schedules" on public.jadwal;
create policy "jadwal_select" on public.jadwal for select
  using ((select auth.role()) = 'authenticated');
create policy "jadwal_staff_manage" on public.jadwal for all
  using ((select public.get_my_role()) in ('admin','bidan'))
  with check ((select public.get_my_role()) in ('admin','bidan'));
