-- Profilvisningar: kandidaten ska kunna räkna sina visningar, aldrig se vem.
--
-- KÖRD i produktionen 2026-11-22 (ägarens ja samma kväll). Kontrollerat som
-- rollen authenticated: räkningen på id går igenom, kolumnen
-- recruiter_user_id nekas (42501), anon läser ingenting, servern skriver.
--
-- Fyndet (konsekvensbedömningen 2026-11-22, bekräftat mot databasen samma
-- dag): rollerna anon och authenticated hade full rätt på tabellen, och
-- RLS-regeln "candidate reads own profile views" släpper igenom kandidatens
-- egna rader. Kolumnen recruiter_user_id gick därför att läsa med
-- kandidatens egen nyckel, tvärt emot regeln i src/lib/recruiter/profileViews.ts
-- (kandidaten ser antal, aldrig vem). Tabellen hade noll rader.
--
-- Efter migreringen:
--   - authenticated läser bara id, candidate_user_id och viewed_at (det
--     räkningarna i src/lib/jobbsok/server.ts och profileViews.ts använder),
--     och fortfarande bara egna rader genom RLS,
--   - anon läser ingenting,
--   - ingen av dem skriver (skrivningen görs med servernyckeln).

revoke all on table public.candidate_profile_views from anon, authenticated;
grant select (id, candidate_user_id, viewed_at) on public.candidate_profile_views to authenticated;

notify pgrst, 'reload schema';
