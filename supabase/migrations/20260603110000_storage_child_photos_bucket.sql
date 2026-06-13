-- Create the child-photos storage bucket. Originally provisioned via the
-- Supabase Dashboard, so a fresh project (db push only) never had it and the
-- later lockdown migration (20260604090600) updated 0 rows. Idempotent.
insert into storage.buckets (id, name, public)
values ('child-photos', 'child-photos', false)
on conflict (id) do nothing;
