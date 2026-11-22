-- Profilfoton, hinken profile-photos (beslut-agarpunkter 2026-11-22, S-1 närliggande).
--
-- INTE KÖRD. Ägarens beslut. Ändrar inget i hur appen fungerar i dag.
--
-- Vad som gäller i dag (genomgången i docs/publikt-omgang3/bygg/logg-agarpunkter.md):
-- - Hinken är publik: den som har en fils adress öppnar fotot utan inloggning.
--   Adressen innehåller kontots id och går inte att gissa.
-- - Uppladdning, byte och radering går genom src/app/api/profile/photo/upload
--   och /delete med service role, som går förbi reglerna. Ingen kod i appen
--   anropar hinken med användarens nyckel. Därför fungerar profilfotot oavsett
--   vilka regler hinken har, också efter att ägarreglerna ("Allow users to ...
--   own files", som jämförde första mappen med id:t och aldrig träffade
--   users/<id>/) togs bort i 20261122180000_cvs_egen_mapp.sql.
-- - Kontoraderingen tar bort users/<id>/ i hinken med service role.
--
-- Blocket nedan ger användarens nyckel samma gräns som i cvs: bara den egna
-- mappen users/<id>/. Det behövs först om någon kod börjar skriva eller lista
-- hinken med användarens nyckel. Det gör inte hinken privat; att göra den
-- privat med signerade adresser är en kodändring och ägarens beslut (policylistan punkt 7).
-- Befintliga regler på hinken (okända namn i koden) tas inte bort här: läs dem
-- först med select policyname from pg_policies where tablename = 'objects'.

-- ---- profile-photos: egen mapp (eget block) ----
drop policy if exists "profile-photos: egen mapp, läsa" on storage.objects;
drop policy if exists "profile-photos: egen mapp, ladda upp" on storage.objects;
drop policy if exists "profile-photos: egen mapp, ändra" on storage.objects;
drop policy if exists "profile-photos: egen mapp, radera" on storage.objects;

create policy "profile-photos: egen mapp, läsa" on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "profile-photos: egen mapp, ladda upp" on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "profile-photos: egen mapp, ändra" on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "profile-photos: egen mapp, radera" on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
-- ---- slut på blocket ----
