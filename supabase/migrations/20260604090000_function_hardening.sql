-- SEC-3 / SEC-4 (partial): harden SECURITY DEFINER functions.
-- Pins search_path='' on every function and revokes RPC EXECUTE where safe.
-- Clears: function_search_path_mutable (x3),
--         anon/authenticated_security_definer_function_executable for the two
--         trigger functions. get_my_role keeps EXECUTE for `authenticated`
--         because RLS policy evaluation calls it (revoking would break RLS).

-- get_my_role: reads the caller's role from profiles. Fully-qualify everything
-- because search_path is now empty.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid())),
    'anon'
  );
$$;

-- handle_new_user: trigger on auth.users insert → seed public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

-- handle_new_reservasi: trigger on reservasi insert → queue no. + occupy quota.
create or replace function public.handle_new_reservasi()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

-- Trigger functions are never meant to be called via PostgREST RPC; triggers
-- fire regardless of EXECUTE grants, so revoking is safe.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_new_reservasi() from anon, authenticated;

-- get_my_role: stop anonymous RPC; keep `authenticated` (RLS needs it).
revoke execute on function public.get_my_role() from anon;
