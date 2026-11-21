-- =============================================================================
-- job_matchings_cache: tabellen skrivs bara av servern
-- 2026-11-21
-- =============================================================================
--
-- Varför: med Supabase-standardens tabellrättigheter och policyn
-- "Users can manage their own job matchings cache" (ALL) kunde en inloggad
-- användare skapa, ändra och radera sina egna cacherader direkt via PostgREST.
-- Raderna räknas i översikten, i Kom igång och i adminens tratt, och
-- edge-funktionen match-jobs svarar ur cachen i en timme, så en egen rad
-- styrde både siffror och vad matchningen visade.
--
-- Ingen kod i webbappen skriver i tabellen med användarens session: bara
-- edge-funktionerna match-jobs och match-jobs-v2 skriver, med service role.
--
-- Efter den här migreringen:
--   * anon har inga rättigheter alls på tabellen.
--   * authenticated får bara SELECT, och bara på egna rader (policyn
--     "Users can read own job matching cache" står kvar). Sidorna som läser
--     senaste körningen och dashboard_summering() fungerar som förut.
--   * service_role har kvar allt.
--
-- Läsningen av egna rader stängs inte: jobben i cachen är samma jobb som
-- match-jobs redan lämnar till webbläsaren, så det finns inget att skydda där.
--
-- Migreringen är idempotent: den kan köras flera gånger.
-- =============================================================================

begin;

revoke all on table public.job_matchings_cache from anon;
revoke all on table public.job_matchings_cache from authenticated;
grant select on table public.job_matchings_cache to authenticated;
grant all on table public.job_matchings_cache to service_role;

drop policy if exists "Users can manage their own job matchings cache" on public.job_matchings_cache;

-- Kolumnen som utlösaren set_job_matchings_cache_updated_at skriver i fanns
-- inte, så varje UPDATE föll med 42703 (record "new" has no field
-- "updated_at"). match-jobs sparar med upsert och kontrollerar inte felet:
-- den som redan hade en rad fick aldrig cachen förnyad, och varje sökning
-- blev en full körning på 80 till 100 sekunder. Bara ett tillägg.
alter table public.job_matchings_cache
  add column if not exists updated_at timestamptz not null default now();

-- Står kvar oförändrade: "Users can read own job matching cache" (SELECT,
-- egna rader) och "Service role can manage job matching cache".

commit;

-- Kontroll efter körning (bara läsning):
--   select grantee, privilege_type from information_schema.role_table_grants
--    where table_schema = 'public' and table_name = 'job_matchings_cache' order by 1, 2;
--     -> authenticated: bara SELECT; anon: inget
--   select policyname, cmd from pg_policies where tablename = 'job_matchings_cache';
--     -> två policyer, ingen ALL för användaren

-- =============================================================================
-- Backa
-- =============================================================================
-- begin;
-- grant all on table public.job_matchings_cache to anon;
-- grant all on table public.job_matchings_cache to authenticated;
-- drop policy if exists "Users can manage their own job matchings cache" on public.job_matchings_cache;
-- create policy "Users can manage their own job matchings cache" on public.job_matchings_cache
--   for all to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- commit;
-- (Kolumnen updated_at får stå kvar: utan den faller varje uppdatering.)
