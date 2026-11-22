-- S-1, beslut-agarpunkter 2026-11-22 (docs/publikt-omgang3/beslut-agarpunkter.md).
--
-- REDAN KÖRD I PRODUKTION 2026-11-22 (ägarens ja, via Management API).
-- Filen är exakt det som kördes och ligger här för historiken. Kör den inte igen.
-- Kontrollerat efter körningen: ägaren ser sina egna filer, ett annat konto
-- ser 0, utan inloggning 0.
--
-- Hinken cvs (privat) hade två policyer som släppte in alla inloggade:
-- "Allow storage access to all authenticated users" och "Authenticated users
-- can access cvs bucket". Ägarpolicyerna jämförde första mappen med
-- användarens id, men filerna ligger under users/<id>/, så de träffade aldrig.
-- Efter den här filen når ett konto bara sin egen mapp users/<id>/ i cvs.
--
-- Koden är genomgången mot reglerna (docs/publikt-omgang3/bygg/logg-agarpunkter.md):
-- varje väg i cvs som rutterna skriver ligger under users/<id>/
-- (src/lib/lagring/sokvagar.ts). Hinken profile-photos rörs inte här, se
-- 20261122190000_profile_photos_egen_mapp.sql (inte körd).

begin;
drop policy if exists "Allow storage access to all authenticated users" on storage.objects;
drop policy if exists "Authenticated users can access cvs bucket" on storage.objects;
drop policy if exists "Allow users to view own files" on storage.objects;
drop policy if exists "Allow users to update own files" on storage.objects;
drop policy if exists "Allow users to delete own files" on storage.objects;
drop policy if exists "Allow users to upload own files" on storage.objects;

create policy "cvs: egen mapp, läsa" on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, ladda upp" on storage.objects for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, ändra" on storage.objects for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, radera" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
commit;
