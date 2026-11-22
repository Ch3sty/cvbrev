-- Kandidatens id mot rekryterare (Bli upptäckt, rättningsomgången 2026-11-22).
--
-- KÖRD i produktionen 2026-11-22 (ägarens besked samma dag). Kontrollerat
-- efteråt: 8 profiler, 8 olika id, inget lika med kontots, och koden i
-- candidateAccess.ts läser kolumnen genom PostgREST.
--
-- Rekryterarportalen pekade ut kandidater med kontots id (auth-användarens
-- uuid) i poolens kort, i detaljsvaret och i adressen
-- /rekryterare/kandidat/<id>. Kolumnen nedan är en slumpad uuid utan koppling
-- till kontot. Koden (src/lib/recruiter/candidateAccess.ts) känner själv av
-- när kolumnen finns, inom fem minuter, och använder den då överallt mot
-- rekryteraren. Gamla adresser med kontots id ger då 404.
--
-- En volatil default fylls i per rad när kolumnen läggs till, så befintliga
-- profiler får var sitt id direkt.

alter table public.candidate_profiles
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists candidate_profiles_public_id_key
  on public.candidate_profiles (public_id);

-- PostgREST läser om schemat så att kolumnen syns för API:t direkt.
notify pgrst, 'reload schema';
