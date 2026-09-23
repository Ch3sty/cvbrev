-- Dashboard-summeringen i en rundtur (docs/bygg-noter-paket.md, Efterarbete: avgjort).
--
-- src/lib/dashboard/getSummary.ts körde femton frågor parallellt mot PostgREST
-- på varje sidladdning i inloggat läge. Parallellt, men femton HTTP-anrop med
-- var sin anslutning och var sin RLS-kontroll: summeringen tog ungefär två
-- rundturer i stället för en. Funktionen nedan returnerar exakt samma rader
-- och räkningar som de femton frågorna, i ett JSON-objekt, och aggregeringen
-- ligger kvar i TypeScript oförändrad.
--
-- security invoker: frågorna körs som användaren, så RLS gäller precis som
-- förut. Användaren tas ur auth.uid(), aldrig ur en parameter, så ingen kan be
-- om någon annans summering (inte heller en admin, vars policyer annars
-- släpper igenom andras rader).

create or replace function public.dashboard_summering()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
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
    'senaste_poang', (
      select j.result->'atsFriendliness'->>'score' from cv_analysis_jobs j
      where j.user_id = (select id from u) and j.status = 'completed'
      order by j.completed_at desc nulls last limit 1
    ),
    'ar_admin', exists (select 1 from admin_users au where au.id = (select id from u) and au.role = 'super_admin')
  ) end
$$;

revoke all on function public.dashboard_summering() from public, anon;
grant execute on function public.dashboard_summering() to authenticated;
