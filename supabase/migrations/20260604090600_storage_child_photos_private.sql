-- SEC-1: lock down the child-photos bucket.
-- Today it is public with a broad SELECT policy ("Public read for child photos")
-- that lets any client LIST every child's photo. Make it private and scope access
-- to the owning parent (path = child-photos/{id_ortu}/...) or staff.
-- Clears public_bucket_allows_listing.

update storage.buckets set public = false where id = 'child-photos';

drop policy if exists "Public read for child photos" on storage.objects;

-- read: parent owns the folder, or staff/admin
create policy "child_photos_read_owner_or_staff"
  on storage.objects for select
  using (
    bucket_id = 'child-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.get_my_role()) in ('kader','bidan','admin')
    )
  );

-- write: parent uploads only into their own folder
create policy "child_photos_insert_owner"
  on storage.objects for insert
  with check (
    bucket_id = 'child-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- update/delete: owner only
create policy "child_photos_modify_owner"
  on storage.objects for update
  using (
    bucket_id = 'child-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "child_photos_delete_owner"
  on storage.objects for delete
  using (
    bucket_id = 'child-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
