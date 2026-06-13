alter table public.profiles       enable row level security;
alter table public.kader          enable row level security;
alter table public.bidan_desa     enable row level security;
alter table public.anak           enable row level security;
alter table public.jadwal         enable row level security;
alter table public.reservasi      enable row level security;
alter table public.pemeriksaan    enable row level security;
alter table public.laporan        enable row level security;

create or replace function public.get_my_role()
returns text as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'anon'
  );
$$ language sql stable;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Staff can view all ortu profiles"
  on public.profiles for select using (public.get_my_role() in ('kader', 'bidan'));

create policy "Ortu can view own children"
  on public.anak for select
  using (public.get_my_role() = 'ortu' and id_ortu = auth.uid());
create policy "Ortu can insert children"
  on public.anak for insert
  with check (public.get_my_role() = 'ortu' and id_ortu = auth.uid());
create policy "Staff can view all children"
  on public.anak for select using (public.get_my_role() in ('kader', 'bidan'));

create policy "Authenticated users can view schedules"
  on public.jadwal for select using (auth.role() = 'authenticated');

create policy "Ortu can view own reservasi"
  on public.reservasi for select
  using (public.get_my_role() = 'ortu' and id_ortu = auth.uid());
create policy "Ortu can create reservasi"
  on public.reservasi for insert
  with check (public.get_my_role() = 'ortu' and id_ortu = auth.uid());
create policy "Kader can view all reservasi"
  on public.reservasi for select using (public.get_my_role() = 'kader');
create policy "Kader can update reservasi status"
  on public.reservasi for update using (public.get_my_role() = 'kader');
create policy "Bidan can view all reservasi"
  on public.reservasi for select using (public.get_my_role() = 'bidan');

create policy "Ortu can view own children pemeriksaan"
  on public.pemeriksaan for select
  using (public.get_my_role() = 'ortu' and id_anak in (
    select id from public.anak where id_ortu = auth.uid()
  ));
create policy "Kader can insert pemeriksaan"
  on public.pemeriksaan for insert with check (public.get_my_role() = 'kader');
create policy "Kader can view all pemeriksaan"
  on public.pemeriksaan for select using (public.get_my_role() = 'kader');
create policy "Bidan can view all pemeriksaan"
  on public.pemeriksaan for select using (public.get_my_role() = 'bidan');
create policy "Bidan can update pemeriksaan"
  on public.pemeriksaan for update using (public.get_my_role() = 'bidan');

insert into public.jadwal (tgl_pelaksanaan, jam, lokasi, kuota) values
  (current_date + interval '3 days', '08:00', 'Posyandu Mawar RW 04', 30),
  (current_date + interval '3 days', '10:00', 'Posyandu Mawar RW 04', 20),
  (current_date + interval '10 days', '08:00', 'Posyandu Melati RW 07', 25),
  (current_date + interval '10 days', '10:00', 'Posyandu Melati RW 07', 15);
