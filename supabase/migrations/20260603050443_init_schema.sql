create extension if not exists "uuid-ossp";

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('ortu', 'kader', 'bidan')),
  nama        text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, nama, email)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'role', 'ortu'),
    coalesce(new.raw_user_meta_data->>'nama', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.kader (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama_kader  text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);

create table public.bidan_desa (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama_bidan  text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);

create table public.anak (
  id              uuid primary key default uuid_generate_v4(),
  id_ortu         uuid not null references public.profiles(id) on delete cascade,
  nama_anak       text not null,
  nik             text unique not null,
  tgl_lahir       date not null,
  tempat_lahir    text not null,
  jenis_kelamin   text not null check (jenis_kelamin in ('L', 'P')),
  rt              text not null,
  rw              text not null,
  foto_url        text,
  created_at      timestamptz default now()
);

create table public.jadwal (
  id                uuid primary key default uuid_generate_v4(),
  tgl_pelaksanaan   date not null,
  jam               time not null,
  lokasi            text not null,
  kuota             integer not null default 30,
  kuota_terisi      integer not null default 0,
  created_at        timestamptz default now(),
  constraint kuota_check check (kuota_terisi <= kuota)
);

create table public.reservasi (
  id            uuid primary key default uuid_generate_v4(),
  id_ortu       uuid not null references public.profiles(id) on delete cascade,
  id_anak       uuid not null references public.anak(id) on delete cascade,
  id_jadwal     uuid not null references public.jadwal(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'reviewed', 'verified', 'rejected')),
  no_antrean    integer,
  created_at    timestamptz default now(),
  unique (id_anak, id_jadwal)
);

create or replace function public.handle_new_reservasi()
returns trigger as $$
declare
  next_no integer;
begin
  select coalesce(max(no_antrean), 0) + 1
    into next_no
    from public.reservasi
   where id_jadwal = new.id_jadwal;
  new.no_antrean := next_no;
  update public.jadwal
     set kuota_terisi = kuota_terisi + 1
   where id = new.id_jadwal;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_reservasi_created
  before insert on public.reservasi
  for each row execute procedure public.handle_new_reservasi();

create table public.pemeriksaan (
  id                        uuid primary key default uuid_generate_v4(),
  id_anak                   uuid not null references public.anak(id) on delete cascade,
  id_reservasi              uuid references public.reservasi(id),
  id_kader                  uuid references public.kader(id),
  id_bidan                  uuid references public.bidan_desa(id),
  tgl_pemeriksaan           date not null default current_date,
  berat_badan               numeric(5,2),
  tinggi_badan              numeric(5,2),
  lingkar_kepala            numeric(5,2),
  lingkar_lengan_atas       numeric(5,2),
  status_gizi               text check (status_gizi in (
                              'Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting',
                              'Resiko Tinggi', 'Belum Diperiksa'
                            )),
  zscore_bb_u               numeric(5,2),
  zscore_tb_u               numeric(5,2),
  zscore_bb_tb              numeric(5,2),
  saran_medis               text,
  pemberian_bantuan_medis   text,
  is_validated              boolean default false,
  validated_at              timestamptz,
  created_at                timestamptz default now()
);

create table public.laporan (
  id              uuid primary key default uuid_generate_v4(),
  tgl_generasi    timestamptz default now(),
  id_jadwal       uuid references public.jadwal(id),
  generated_by    uuid references public.bidan_desa(id),
  summary_json    jsonb
);
