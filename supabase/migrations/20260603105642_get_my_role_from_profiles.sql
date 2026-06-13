-- Read role from profiles (set by handle_new_user trigger at signup) instead of
-- JWT app_metadata, which self-registered ortu users never have set.
-- SECURITY DEFINER bypasses profiles RLS to avoid recursion.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'anon'
  );
$$;
