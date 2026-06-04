-- SEC-2: add least-privilege RLS policies to the three tables that have RLS
-- enabled but NO policies (kader, bidan_desa, laporan). Until now these were
-- silently unreadable by app clients. Clears rls_enabled_no_policy (x3).

-- kader: a user reads their own row; bidan/admin read all; admin manages.
create policy "kader_select_own_or_staff" on public.kader for select
  using (
    id = (select auth.uid())
    or (select public.get_my_role()) in ('bidan','admin')
  );
create policy "kader_admin_manage" on public.kader for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- bidan_desa: own row; admin reads all; admin manages.
create policy "bidan_select_own_or_admin" on public.bidan_desa for select
  using (
    id = (select auth.uid())
    or (select public.get_my_role()) = 'admin'
  );
create policy "bidan_admin_manage" on public.bidan_desa for all
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- laporan: bidan/admin read and write.
create policy "laporan_staff_select" on public.laporan for select
  using ((select public.get_my_role()) in ('bidan','admin'));
create policy "laporan_staff_write" on public.laporan for insert
  with check ((select public.get_my_role()) in ('bidan','admin'));
create policy "laporan_staff_update" on public.laporan for update
  using ((select public.get_my_role()) in ('bidan','admin'));
