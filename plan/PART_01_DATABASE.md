# Posyandu-Care Implementation Plan
## PART 01 — Database: Supabase Schema, ERD & RLS Policies

---

## 1. Overview

The database is hosted on **Supabase PostgreSQL**. All schema design is derived directly from the ERD and Data Model defined in the SRS (Section 5). There are **7 core tables**, all with Row Level Security (RLS) enabled to enforce role-based data access at the database level.

---

## 2. Entity Overview

| Table | Corresponds To | Description |
|-------|---------------|-------------|
| `profiles` | ORANG TUA + auth bridge | Extends Supabase Auth users with role & personal data |
| `kader` | KADER | Cadre personnel data |
| `bidan_desa` | BIDAN DESA | Village midwife data |
| `anak` | ANAK | Child biodata linked to a parent |
| `jadwal` | JADWAL | Immunization schedule slots with quota |
| `reservasi` | RESERVASI | Parent's slot booking for a specific jadwal |
| `pemeriksaan` | PEMERIKSAAN | Examination record: anthropometry + medical advice |

---

## 3. Full SQL Schema

Run the following SQL in the **Supabase SQL Editor** (`Dashboard > SQL Editor > New Query`).

### 3.1 Enable UUID Extension

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";
```

### 3.2 Profiles Table (Parent / Auth Bridge)

```sql
-- Extends Supabase auth.users
-- Role: 'ortu' | 'kader' | 'bidan'
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('ortu', 'kader', 'bidan')),
  nama        text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);

-- Auto-create profile row on new user signup
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
```

### 3.3 Kader Table

```sql
create table public.kader (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama_kader  text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);
```

### 3.4 Bidan Desa Table

```sql
create table public.bidan_desa (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama_bidan  text not null,
  email       text not null,
  no_hp       text,
  created_at  timestamptz default now()
);
```

### 3.5 Anak (Child) Table

```sql
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
```

### 3.6 Jadwal (Schedule) Table

```sql
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
```

### 3.7 Reservasi Table

```sql
create table public.reservasi (
  id            uuid primary key default uuid_generate_v4(),
  id_ortu       uuid not null references public.profiles(id) on delete cascade,
  id_anak       uuid not null references public.anak(id) on delete cascade,
  id_jadwal     uuid not null references public.jadwal(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending', 'reviewed', 'verified', 'rejected')),
  no_antrean    integer,
  created_at    timestamptz default now(),

  -- One child can only have one reservation per schedule
  unique (id_anak, id_jadwal)
);

-- Auto-increment queue number and update kuota_terisi on new reservation
create or replace function public.handle_new_reservasi()
returns trigger as $$
declare
  next_no integer;
begin
  -- Get next queue number for this jadwal
  select coalesce(max(no_antrean), 0) + 1
    into next_no
    from public.reservasi
   where id_jadwal = new.id_jadwal;

  new.no_antrean := next_no;

  -- Increment filled quota
  update public.jadwal
     set kuota_terisi = kuota_terisi + 1
   where id = new.id_jadwal;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_reservasi_created
  before insert on public.reservasi
  for each row execute procedure public.handle_new_reservasi();
```

### 3.8 Pemeriksaan (Examination) Table

```sql
create table public.pemeriksaan (
  id                        uuid primary key default uuid_generate_v4(),
  id_anak                   uuid not null references public.anak(id) on delete cascade,
  id_reservasi              uuid references public.reservasi(id),
  id_kader                  uuid references public.kader(id),
  id_bidan                  uuid references public.bidan_desa(id),
  tgl_pemeriksaan           date not null default current_date,

  -- Anthropometry fields (input by Kader)
  berat_badan               numeric(5,2),   -- kg
  tinggi_badan              numeric(5,2),   -- cm
  lingkar_kepala            numeric(5,2),   -- cm
  lingkar_lengan_atas       numeric(5,2),   -- cm

  -- Auto-calculated nutritional status
  status_gizi               text check (status_gizi in (
                              'Gizi Baik', 'Gizi Kurang', 'Gizi Buruk', 'Stunting',
                              'Resiko Tinggi', 'Belum Diperiksa'
                            )),
  zscore_bb_u               numeric(5,2),   -- Weight-for-Age Z-score
  zscore_tb_u               numeric(5,2),   -- Height-for-Age Z-score
  zscore_bb_tb              numeric(5,2),   -- Weight-for-Height Z-score

  -- Medical input by Bidan
  saran_medis               text,
  pemberian_bantuan_medis   text,           -- Obat/Vitamin/Vaksin description
  is_validated              boolean default false,
  validated_at              timestamptz,

  created_at                timestamptz default now()
);
```

### 3.9 Laporan (Report) Table

```sql
create table public.laporan (
  id              uuid primary key default uuid_generate_v4(),
  tgl_generasi    timestamptz default now(),
  id_jadwal       uuid references public.jadwal(id),
  generated_by    uuid references public.bidan_desa(id),
  summary_json    jsonb   -- Stores aggregate stats: total anak, gizi breakdown, etc.
);
```

---

## 4. Row Level Security (RLS) Policies

Enable RLS on all tables, then add policies to restrict access by role.

### 4.1 Enable RLS

```sql
alter table public.profiles       enable row level security;
alter table public.kader          enable row level security;
alter table public.bidan_desa     enable row level security;
alter table public.anak           enable row level security;
alter table public.jadwal         enable row level security;
alter table public.reservasi      enable row level security;
alter table public.pemeriksaan    enable row level security;
alter table public.laporan        enable row level security;
```

### 4.2 Helper Function — Get Current User Role

```sql
-- Reusable function to get role from JWT metadata
create or replace function public.get_my_role()
returns text as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'anon'
  );
$$ language sql stable;
```

### 4.3 Profiles Policies

```sql
-- Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Kader and Bidan can read all ortu profiles (to look up parent info)
create policy "Staff can view all ortu profiles"
  on public.profiles for select
  using (public.get_my_role() in ('kader', 'bidan'));
```

### 4.4 Anak Policies

```sql
-- Ortu: can only see their own children
create policy "Ortu can view own children"
  on public.anak for select
  using (
    public.get_my_role() = 'ortu'
    and id_ortu = auth.uid()
  );

create policy "Ortu can insert children"
  on public.anak for insert
  with check (
    public.get_my_role() = 'ortu'
    and id_ortu = auth.uid()
  );

-- Kader and Bidan: can read all children
create policy "Staff can view all children"
  on public.anak for select
  using (public.get_my_role() in ('kader', 'bidan'));
```

### 4.5 Jadwal Policies

```sql
-- Anyone authenticated can view schedules
create policy "Authenticated users can view schedules"
  on public.jadwal for select
  using (auth.role() = 'authenticated');

-- Only service role can insert/update jadwal (managed via admin or direct SQL)
```

### 4.6 Reservasi Policies

```sql
-- Ortu: can only see their own reservations
create policy "Ortu can view own reservasi"
  on public.reservasi for select
  using (
    public.get_my_role() = 'ortu'
    and id_ortu = auth.uid()
  );

create policy "Ortu can create reservasi"
  on public.reservasi for insert
  with check (
    public.get_my_role() = 'ortu'
    and id_ortu = auth.uid()
  );

-- Kader: can view all reservasi (for queue management)
create policy "Kader can view all reservasi"
  on public.reservasi for select
  using (public.get_my_role() = 'kader');

create policy "Kader can update reservasi status"
  on public.reservasi for update
  using (public.get_my_role() = 'kader');

-- Bidan: can view all reservasi
create policy "Bidan can view all reservasi"
  on public.reservasi for select
  using (public.get_my_role() = 'bidan');
```

### 4.7 Pemeriksaan Policies

```sql
-- Ortu: can view pemeriksaan for their own children only
create policy "Ortu can view own children pemeriksaan"
  on public.pemeriksaan for select
  using (
    public.get_my_role() = 'ortu'
    and id_anak in (
      select id from public.anak where id_ortu = auth.uid()
    )
  );

-- Kader: can insert and view all pemeriksaan
create policy "Kader can insert pemeriksaan"
  on public.pemeriksaan for insert
  with check (public.get_my_role() = 'kader');

create policy "Kader can view all pemeriksaan"
  on public.pemeriksaan for select
  using (public.get_my_role() = 'kader');

-- Bidan: can view all and update (to add medical advice)
create policy "Bidan can view all pemeriksaan"
  on public.pemeriksaan for select
  using (public.get_my_role() = 'bidan');

create policy "Bidan can update pemeriksaan (medical advice)"
  on public.pemeriksaan for update
  using (public.get_my_role() = 'bidan');
```

---

## 5. Seed Data (Dev & Demo)

Run this after schema creation to populate test data.

```sql
-- Seed: Jadwal (upcoming immunization schedules)
insert into public.jadwal (tgl_pelaksanaan, jam, lokasi, kuota) values
  (current_date + interval '3 days', '08:00', 'Posyandu Mawar RW 04', 30),
  (current_date + interval '3 days', '10:00', 'Posyandu Mawar RW 04', 20),
  (current_date + interval '10 days', '08:00', 'Posyandu Melati RW 07', 25),
  (current_date + interval '10 days', '10:00', 'Posyandu Melati RW 07', 15);
```

> **Note:** User accounts (Ortu, Kader, Bidan) are created through the app's registration flow or the Supabase Auth dashboard. Set `role` in `app_metadata` via Supabase Auth admin panel or via a server-side admin function.

---

## 6. Supabase Type Generation

After the schema is set up, generate TypeScript types for the entire project:

```bash
# Install Supabase CLI first (one-time)
npm install -g supabase

# Login
supabase login

# Generate types from your project
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

This gives you full type safety across all queries:

```typescript
// Example: typed query
import { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

const { data, error } = await supabase
  .from('anak')
  .select('*, pemeriksaan(*)')
  .eq('id_ortu', userId)

// `data` is fully typed as Database['public']['Tables']['anak']['Row'][]
```

---

## 7. Storage Bucket Setup

In the Supabase dashboard, go to **Storage > New Bucket**:

| Bucket Name | Public | Purpose |
|------------|--------|---------|
| `child-photos` | Yes | Child avatar/profile photos |

Then set storage policy to allow authenticated users to upload to their own folder:

```sql
-- Allow authenticated users to upload photos
create policy "Authenticated users can upload child photos"
  on storage.objects for insert
  with check (
    bucket_id = 'child-photos'
    and auth.role() = 'authenticated'
  );

-- Allow public read (photos are displayed in UI)
create policy "Public read for child photos"
  on storage.objects for select
  using (bucket_id = 'child-photos');
```

---

## 8. Table Relationship Summary

```
auth.users (Supabase managed)
    │
    ├── profiles (1:1)         → role: ortu | kader | bidan
    ├── kader (1:1)
    └── bidan_desa (1:1)

profiles (ortu)
    └── anak (1:N)
            └── pemeriksaan (1:N)
                    ├── linked to kader (M:1)
                    ├── linked to bidan_desa (M:1)
                    └── linked to reservasi (1:1)

jadwal (1:N)
    └── reservasi (M:1)
            ├── linked to profiles/ortu (M:1)
            └── linked to anak (M:1)
```
