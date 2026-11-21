-- =============================================================================
-- cv_analysis_jobs: result läses och tabellen skrivs bara av servern
-- 2026-11-21
-- =============================================================================
--
-- Varför: kolumnen result bär hela CV-analysen med alla förslagstexter.
-- Servern filtrerar vad gratisnivån får se (analysForKlient och
-- gateAnalysisResult i src/lib/cv/poang), men med Supabase-standardens
-- tabellrättigheter och SELECT-policyn "Users can view own jobs" kunde en
-- inloggad användare läsa result direkt via PostgREST med sin egen JWT och
-- den publika nyckeln, förbi betalspärren. INSERT-policyn lät henne dessutom
-- lägga in egna jobbrader.
--
-- Repots regel: känsliga kolumner och tabeller skrivs och läses bara av
-- servern. Efter den här migreringen:
--   * anon har inga rättigheter alls på tabellen.
--   * authenticated får SELECT på alla kolumner utom result, och bara på
--     egna rader (RLS-policyn "Users can view own jobs" står kvar). Status,
--     räkningar och kvoten (usage_counted) går att läsa som förut.
--   * authenticated får inte INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES
--     eller TRIGGER. INSERT-policyn tas bort.
--   * service_role (servern och edge-funktionen) har kvar allt.
--   * dashboard_summering() (security invoker, körs med användarens JWT)
--     läste result->atsFriendliness->>score. Värdet används inte av appen
--     sedan poängmodellen (src/lib/dashboard/getSummary.ts räknar poängen
--     själv), och med kolumnspärren skulle hela funktionen falla. Fältet
--     senaste_poang finns kvar i svaret men är alltid null.
--
-- Releaseordning: koden som läser result med service role ska vara live
-- FÖRE den här migreringen (gren fix/analysjobb-las). Koden fungerar både
-- före och efter.
--
-- Migreringen är idempotent: den kan köras flera gånger.
-- =============================================================================

begin;

-- 1. Rättigheterna på tabellen ------------------------------------------------

-- Allt bort för anon och authenticated, sedan läsning tillbaka kolumn för
-- kolumn för authenticated. Kolumnrättigheter: en ny kolumn i tabellen blir
-- inte läsbar för användaren förrän den läggs till här uttryckligen.
revoke all on table public.cv_analysis_jobs from anon;
revoke all on table public.cv_analysis_jobs from authenticated;
-- REVOKE ALL på tabellen tar inte bort tidigare kolumnrättigheter, så de
-- dras in uttryckligen (gör omkörningen ren).
revoke all (id, user_id, cv_id, status, result, error, created_at, updated_at,
            completed_at, usage_counted, display_name, completion_handled)
  on table public.cv_analysis_jobs from anon, authenticated;

grant select (id, user_id, cv_id, status, error, created_at, updated_at,
              completed_at, usage_counted, display_name, completion_handled)
  on table public.cv_analysis_jobs to authenticated;

grant all on table public.cv_analysis_jobs to service_role;

-- 2. Policyerna ---------------------------------------------------------------

-- Jobbraden skapas av servern med service role (src/lib/cv/background-jobs.ts,
-- /api/cv/save-improved-analysis). Användaren skapar inga rader själv.
drop policy if exists "Users can create own jobs" on public.cv_analysis_jobs;

-- Står kvar oförändrade: "Users can view own jobs" (SELECT, egna rader),
-- "Service role can update jobs" och "admins_read_all_cv_analysis_jobs"
-- (adminens läsning utan result; adminsidorna läser med service role).

-- 3. dashboard_summering() utan result ----------------------------------------

create or replace function public.dashboard_summering()
 returns jsonb
 language sql
 stable
 set search_path to 'public'
as $function$
  with u as (select auth.uid() as id)
  select case when (select id from u) is null then null else jsonb_build_object(
    'letters', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'title', l.title, 'company', l.company, 'job_title', l.job_title,
        'created_at', l.created_at, 'is_saved', l.is_saved
      ) order by l.created_at desc)
      from letters l where l.user_id = (select id from u)
    ), '[]'::jsonb),
    'cv', coalesce((
      select jsonb_agg(jsonb_build_object('file_name', c.file_name, 'updated_at', c.updated_at)
        order by c.updated_at desc nulls last)
      from cv_texts c where c.user_id = (select id from u)
    ), '[]'::jsonb),
    'profile', (select to_jsonb(p) from profiles p where p.id = (select id from u)),
    'applications', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.applied_at desc, a.created_at desc)
      from job_applications a where a.user_id = (select id from u)
    ), '[]'::jsonb),
    'analysis_count', (select count(*) from cv_analysis_jobs j where j.user_id = (select id from u) and j.status = 'completed'),
    'linkedin_count', (select count(*) from linkedin_optimizations o where o.user_id = (select id from u)),
    'download_count', (select count(*) from formatted_cv_downloads d where d.user_id = (select id from u)),
    'match_count', (select count(*) from job_matchings_cache m where m.user_id = (select id from u)),
    'grants', coalesce((
      select jsonb_agg(jsonb_build_object('scope', g.scope, 'premium_until_after', g.premium_until_after))
      from premium_grants g where g.user_id = (select id from u) and g.premium_until_after > now()
    ), '[]'::jsonb),
    'candidate_visibility', (select cp.visibility from candidate_profiles cp where cp.user_id = (select id from u) limit 1),
    'conversation_count', (select count(*) from ai_conversations ac where ac.user_id = (select id from u)),
    'chat_count', (select count(*) from ai_messages am where am.user_id = (select id from u) and am.role = 'user'),
    'tests', coalesce((
      select jsonb_agg(jsonb_build_object('test_type', t.test_type, 'score', t.score))
      from logic_test_v4_sessions t where t.user_id = (select id from u) and t.completed_at is not null
    ), '[]'::jsonb),
    'personality_count', (select count(*) from personality_test_sessions ps where ps.user_id = (select id from u) and ps.completed_at is not null),
    -- Läste förr result->atsFriendliness->>score. Används inte av appen och
    -- går inte att läsa med användarens JWT sedan 2026-11-21.
    'senaste_poang', null::text,
    'ar_admin', exists (select 1 from admin_users au where au.id = (select id from u) and au.role = 'super_admin')
  ) end
$function$;

-- Samma rättigheter som förut (create or replace behåller dem, men
-- uttryckligen för säkerhets skull).
revoke all on function public.dashboard_summering() from public, anon;
grant execute on function public.dashboard_summering() to authenticated, service_role;

commit;

-- Kontroll efter körning (bara läsning):
--   select grantee, privilege_type from information_schema.role_table_grants
--    where table_schema = 'public' and table_name = 'cv_analysis_jobs' order by 1, 2;
--     -> bara service_role (och postgres) på tabellnivå
--   select grantee, column_name from information_schema.column_privileges
--    where table_schema = 'public' and table_name = 'cv_analysis_jobs'
--      and grantee = 'authenticated' order by 2;
--     -> elva kolumner, inte result
--   select policyname, cmd from pg_policies where tablename = 'cv_analysis_jobs';
--     -> tre policyer, ingen INSERT
--   node scripts/verifiera-analysjobb-sparr.mjs

-- =============================================================================
-- Backa
-- =============================================================================
-- Återställer exakt läget före migreringen (Supabase-standardens rättigheter,
-- INSERT-policyn och dashboard_summering() med senaste_poang ur result).
-- Koden på grenen fix/analysjobb-las fungerar även efter en backning.
--
-- begin;
--
-- revoke all (id, user_id, cv_id, status, result, error, created_at, updated_at,
--             completed_at, usage_counted, display_name, completion_handled)
--   on table public.cv_analysis_jobs from anon, authenticated;
-- grant all on table public.cv_analysis_jobs to anon;
-- grant all on table public.cv_analysis_jobs to authenticated;
--
-- drop policy if exists "Users can create own jobs" on public.cv_analysis_jobs;
-- create policy "Users can create own jobs" on public.cv_analysis_jobs
--   for insert to authenticated with check (auth.uid() = user_id);
--
-- create or replace function public.dashboard_summering()
--  returns jsonb
--  language sql
--  stable
--  set search_path to 'public'
-- as $function$
--   with u as (select auth.uid() as id)
--   select case when (select id from u) is null then null else jsonb_build_object(
--     'letters', coalesce((
--       select jsonb_agg(jsonb_build_object(
--         'id', l.id, 'title', l.title, 'company', l.company, 'job_title', l.job_title,
--         'created_at', l.created_at, 'is_saved', l.is_saved
--       ) order by l.created_at desc)
--       from letters l where l.user_id = (select id from u)
--     ), '[]'::jsonb),
--     'cv', coalesce((
--       select jsonb_agg(jsonb_build_object('file_name', c.file_name, 'updated_at', c.updated_at)
--         order by c.updated_at desc nulls last)
--       from cv_texts c where c.user_id = (select id from u)
--     ), '[]'::jsonb),
--     'profile', (select to_jsonb(p) from profiles p where p.id = (select id from u)),
--     'applications', coalesce((
--       select jsonb_agg(to_jsonb(a) order by a.applied_at desc, a.created_at desc)
--       from job_applications a where a.user_id = (select id from u)
--     ), '[]'::jsonb),
--     'analysis_count', (select count(*) from cv_analysis_jobs j where j.user_id = (select id from u) and j.status = 'completed'),
--     'linkedin_count', (select count(*) from linkedin_optimizations o where o.user_id = (select id from u)),
--     'download_count', (select count(*) from formatted_cv_downloads d where d.user_id = (select id from u)),
--     'match_count', (select count(*) from job_matchings_cache m where m.user_id = (select id from u)),
--     'grants', coalesce((
--       select jsonb_agg(jsonb_build_object('scope', g.scope, 'premium_until_after', g.premium_until_after))
--       from premium_grants g where g.user_id = (select id from u) and g.premium_until_after > now()
--     ), '[]'::jsonb),
--     'candidate_visibility', (select cp.visibility from candidate_profiles cp where cp.user_id = (select id from u) limit 1),
--     'conversation_count', (select count(*) from ai_conversations ac where ac.user_id = (select id from u)),
--     'chat_count', (select count(*) from ai_messages am where am.user_id = (select id from u) and am.role = 'user'),
--     'tests', coalesce((
--       select jsonb_agg(jsonb_build_object('test_type', t.test_type, 'score', t.score))
--       from logic_test_v4_sessions t where t.user_id = (select id from u) and t.completed_at is not null
--     ), '[]'::jsonb),
--     'personality_count', (select count(*) from personality_test_sessions ps where ps.user_id = (select id from u) and ps.completed_at is not null),
--     'senaste_poang', (
--       select j.result->'atsFriendliness'->>'score' from cv_analysis_jobs j
--       where j.user_id = (select id from u) and j.status = 'completed'
--       order by j.completed_at desc nulls last limit 1
--     ),
--     'ar_admin', exists (select 1 from admin_users au where au.id = (select id from u) and au.role = 'super_admin')
--   ) end
-- $function$;
--
-- commit;
