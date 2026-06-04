-- Schema evolution: admin role, reservation lifecycle + quota integrity,
-- jadwal lifecycle, anak soft-delete, per-indicator nutrition status columns.
-- All additive; no data is dropped.

-- 1. profiles: add 'admin' role
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('ortu','kader','bidan','admin'));

-- 2. reservasi: allow 'cancelled'
alter table public.reservasi
  drop constraint if exists reservasi_status_check;
alter table public.reservasi
  add constraint reservasi_status_check
  check (status in ('pending','reviewed','verified','rejected','cancelled'));

-- 2b. quota integrity: decrement kuota_terisi when a reservation is cancelled or
--     deleted, and re-increment if it leaves cancelled. (Insert is handled by the
--     existing handle_new_reservasi trigger.)
create or replace function public.handle_reservasi_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE') then
    if (old.status <> 'cancelled') then
      update public.jadwal set kuota_terisi = greatest(kuota_terisi - 1, 0)
        where id = old.id_jadwal;
    end if;
    return old;
  elsif (tg_op = 'UPDATE') then
    if (new.status = 'cancelled' and old.status <> 'cancelled') then
      update public.jadwal set kuota_terisi = greatest(kuota_terisi - 1, 0)
        where id = old.id_jadwal;
    elsif (old.status = 'cancelled' and new.status <> 'cancelled') then
      update public.jadwal set kuota_terisi = kuota_terisi + 1
        where id = new.id_jadwal;
    end if;
    return new;
  end if;
  return null;
end;
$$;
revoke execute on function public.handle_reservasi_quota() from anon, authenticated;

drop trigger if exists on_reservasi_quota on public.reservasi;
create trigger on_reservasi_quota
  after update or delete on public.reservasi
  for each row execute function public.handle_reservasi_quota();

-- 3. jadwal: lifecycle + management metadata
alter table public.jadwal
  add column if not exists status text not null default 'open'
    check (status in ('open','closed','done','cancelled')),
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists catatan text;

-- 4. anak: soft delete (for DSAR / mistaken entries). Queries filter deleted_at is null.
alter table public.anak
  add column if not exists deleted_at timestamptz;

-- 5. pemeriksaan: per-indicator status + length/height flag + edit audit fields
alter table public.pemeriksaan
  add column if not exists status_bb_u  text,
  add column if not exists status_tb_u  text,
  add column if not exists status_bb_tb text,
  add column if not exists ukuran_panjang_telentang boolean,  -- true=length(lying), false=height(standing)
  add column if not exists updated_at timestamptz default now(),
  add column if not exists updated_by uuid references auth.users(id);
