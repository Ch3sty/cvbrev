-- Undantagna konton: agarens adminkonto och testkonton raknas aldrig i
-- adminens tal (docs/design/spec-admin-tydlighet-2026-09-22.html, princip 6,
-- och agarens tillagg 2026-09-22: "mitt adminkonto ska undantas ur all data,
-- allt fran inlogg till korningar av funktioner och nedladdningar").
--
-- En sanning: funktionen admin_undantagna_konton() returnerar varje konto
-- som ska bort. Alla adminvyer nedan laser den, och src/lib/admin/undantag.ts
-- laser samma funktion for insamlingen i collect.ts. Monstren star bara har
-- och i undantag.ts (UNDANTAG_EPOST_MONSTER), och testet i
-- src/lib/admin/__tests__/undantag.test.ts haller dem lika.
--
-- Regeln:
--   admin  varje rad i admin_users
--   test   e-post som slutar pa .test, innehaller jobbcoach-qa eller borjar
--          med qa-
--
-- gomer@gomer.se ar INTE ett testkonto (agarens beslut 2026-09-22) och
-- fangas inte av nagot monster.
--
-- Hela filen ar idempotent.

create or replace function public.admin_undantagna_konton()
returns table (user_id uuid, email text, skal text)
language sql
stable
security definer
set search_path = public, auth
as $$
  with kandidater as (
    select a.id as user_id, 'admin'::text as skal
    from public.admin_users a
    union all
    select u.id, 'test'::text
    from auth.users u
    where lower(coalesce(u.email, '')) like any (array['%.test', '%jobbcoach-qa%', 'qa-%'])
    union all
    select p.id, 'test'::text
    from public.profiles p
    where lower(coalesce(p.email, '')) like any (array['%.test', '%jobbcoach-qa%', 'qa-%'])
  )
  select distinct on (k.user_id)
    k.user_id,
    coalesce(u.email::text, p.email::text) as email,
    k.skal
  from kandidater k
  left join auth.users u on u.id = k.user_id
  left join public.profiles p on p.id = k.user_id
  order by k.user_id, (k.skal = 'admin') desc;
$$;

comment on function public.admin_undantagna_konton() is
  'Konton som adminen aldrig raknar: alla i admin_users (skal admin) och e-post som matchar %.test, %jobbcoach-qa%, qa-% (skal test). En sanning for vyerna och src/lib/admin/undantag.ts.';

revoke all on function public.admin_undantagna_konton() from public;
revoke all on function public.admin_undantagna_konton() from anon, authenticated;
grant execute on function public.admin_undantagna_konton() to service_role;

-- ---------------------------------------------------------------------------
-- admin_user_rows: alla konton finns kvar, men varje rad bar sitt undantag.
-- Anvandare-listan visar dem i filtret "Admin och test" och raknar dem
-- aldrig i totaler. Kolumnen laggs sist sa att create or replace fungerar.
-- ---------------------------------------------------------------------------

create or replace view public.admin_user_rows as
select
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  p.last_active,
  p.subscription_tier,
  p.subscription_status,
  p.premium_until,
  p.premium_source,
  p.acquisition_source,
  p.stripe_customer_id,
  p.first_cv_uploaded_at,
  p.first_letter_created_at,
  p.first_cv_analyzed_at,
  coalesce(l.antal, 0::bigint)::integer as letter_count,
  coalesce(c.antal, 0::bigint)::integer as cv_count,
  coalesce(a.antal, 0::bigint)::integer as application_count,
  coalesce(an.antal, 0::bigint)::integer as analysis_count,
  ua.senast_aktiv as last_activity_at,
  und.skal as undantag,
  p.premium_scope
from public.profiles p
left join (select letters.user_id, count(*) as antal from public.letters group by letters.user_id) l on l.user_id = p.id
left join (select cv_texts.user_id, count(*) as antal from public.cv_texts group by cv_texts.user_id) c on c.user_id = p.id
left join (select job_applications.user_id, count(*) as antal from public.job_applications group by job_applications.user_id) a on a.user_id = p.id
left join (select cv_analysis_jobs.user_id, count(*) as antal from public.cv_analysis_jobs group by cv_analysis_jobs.user_id) an on an.user_id = p.id
left join (select user_activities.user_id, max(user_activities.created_at) as senast_aktiv from public.user_activities group by user_activities.user_id) ua on ua.user_id = p.id
left join public.admin_undantagna_konton() und on und.user_id = p.id;

-- ---------------------------------------------------------------------------
-- Aktivitetsflodet och allt som bygger pa det: undantagna konton bort.
-- admin_activity_daily och admin_activity_by_function laser flodet och
-- arver darmed filtret.
-- ---------------------------------------------------------------------------

create or replace view public.admin_activity_feed
with (security_invoker = true) as
select feed.user_id, feed.email, feed.full_name, feed.funktion, feed.detalj, feed.slutford, feed.tidpunkt
from (
  select l.user_id, p.email, p.full_name, 'Logiktest'::text as funktion, l.test_type as detalj,
         (l.completed_at is not null) as slutford, coalesce(l.completed_at, l.started_at) as tidpunkt
  from public.logic_test_v4_sessions l join public.profiles p on p.id = l.user_id
  union all
  select pt.user_id, p.email, p.full_name, 'Personlighetstest'::text, pt.test_type,
         (pt.completed_at is not null), coalesce(pt.completed_at, pt.started_at)
  from public.personality_test_sessions pt join public.profiles p on p.id = pt.user_id
  union all
  select c.user_id, p.email, p.full_name, 'Jobbcoach'::text, coalesce(c.topic, c.title), true, c.created_at
  from public.ai_conversations c join public.profiles p on p.id = c.user_id
  union all
  select cj.user_id, p.email, p.full_name, 'CV-analys'::text, cj.display_name,
         (cj.status = 'completed'::text), coalesce(cj.completed_at, cj.created_at)
  from public.cv_analysis_jobs cj join public.profiles p on p.id = cj.user_id
  union all
  select le.user_id, p.email, p.full_name, 'Brev'::text, le.job_title, true, le.created_at
  from public.letters le join public.profiles p on p.id = le.user_id
  union all
  select d.user_id, p.email, p.full_name, 'CV-mall'::text, d.template_id, true, d.downloaded_at
  from public.formatted_cv_downloads d join public.profiles p on p.id = d.user_id
  union all
  select lo.user_id, p.email, p.full_name, 'LinkedIn-opt'::text, null::text, true, lo.created_at
  from public.linkedin_optimizations lo join public.profiles p on p.id = lo.user_id
) feed
where not exists (select 1 from public.admin_undantagna_konton() und where und.user_id = feed.user_id);

create or replace view public.admin_test_stats
with (security_invoker = true) as
select 'logik'::text as kategori, s.test_type,
       count(*) as started,
       count(*) filter (where s.completed_at is not null) as completed,
       count(distinct s.user_id) as unique_users,
       max(s.started_at) as last_started
from public.logic_test_v4_sessions s
where not exists (select 1 from public.admin_undantagna_konton() und where und.user_id = s.user_id)
group by s.test_type
union all
select 'personlighet'::text as kategori, ps.test_type,
       count(*) as started,
       count(*) filter (where ps.completed_at is not null) as completed,
       count(distinct ps.user_id) as unique_users,
       max(ps.started_at) as last_started
from public.personality_test_sessions ps
where not exists (select 1 from public.admin_undantagna_konton() und where und.user_id = ps.user_id)
group by ps.test_type;

create or replace view public.admin_retention_cohorts
with (security_invoker = true) as
with undantagna as (
  select user_id from public.admin_undantagna_konton()
), kohort as (
  select profiles.id, date_trunc('month'::text, profiles.created_at) as kohortmanad
  from public.profiles
  where profiles.id not in (select user_id from undantagna)
), kohortstorlek as (
  select kohort.kohortmanad, count(*) as storlek from kohort group by kohort.kohortmanad
), aktivitet as (
  select distinct user_activities.user_id, date_trunc('month'::text, user_activities.created_at) as aktivmanad
  from public.user_activities
  where user_activities.user_id not in (select user_id from undantagna)
)
select k.kohortmanad,
       ks.storlek as kohortstorlek,
       (((extract(year from a.aktivmanad) - extract(year from k.kohortmanad)) * 12::numeric)
         + (extract(month from a.aktivmanad) - extract(month from k.kohortmanad)))::integer as manad_offset,
       count(distinct a.user_id) as aktiva
from kohort k
join kohortstorlek ks on ks.kohortmanad = k.kohortmanad
join aktivitet a on a.user_id = k.id and a.aktivmanad >= k.kohortmanad
group by k.kohortmanad, ks.storlek,
         ((((extract(year from a.aktivmanad) - extract(year from k.kohortmanad)) * 12::numeric)
         + (extract(month from a.aktivmanad) - extract(month from k.kohortmanad))))::integer;

create or replace view public.admin_candidate_pool
with (security_invoker = true) as
select cp.user_id, p.email, p.full_name, cp.visibility, cp.show_personality, cp.show_full_workstyle,
       cp.availability, cp.workplace, cp.extent, cp.employment_types, cp.regions, cp.drivers_license,
       cp.salary_min, cp.salary_max, cp.pitch, cp.context_tags, cp.consent_given_at, cp.consent_version,
       cp.created_at, cp.updated_at,
       coalesce(i.totalt, 0::bigint) as intressen_totalt,
       coalesce(i.accepterade, 0::bigint) as intressen_accepterade,
       coalesce(i.avbojda, 0::bigint) as intressen_avbojda,
       coalesce(i.vantande, 0::bigint) as intressen_vantande,
       i.senaste_intresse
from public.candidate_profiles cp
join public.profiles p on p.id = cp.user_id
left join lateral (
  select count(*) as totalt,
         count(*) filter (where ci.status = 'accepted'::text) as accepterade,
         count(*) filter (where ci.status = 'declined'::text) as avbojda,
         count(*) filter (where ci.status = 'pending'::text) as vantande,
         max(ci.created_at) as senaste_intresse
  from public.candidate_interests ci
  where ci.candidate_user_id = cp.user_id
) i on true
where not exists (select 1 from public.admin_undantagna_konton() und where und.user_id = cp.user_id);

create or replace view public.admin_candidate_interests
with (security_invoker = true) as
select ci.id, ci.created_at, ci.responded_at, ci.status, ci.candidate_user_id, ci.recruiter_user_id,
       rp.company_name as rekryterare_foretag,
       rp.contact_name as rekryterare_namn,
       pr.email as rekryterare_epost,
       pc.email as kandidat_epost,
       cp.visibility as kandidat_lage
from public.candidate_interests ci
left join public.recruiter_profiles rp on rp.user_id = ci.recruiter_user_id
left join public.profiles pr on pr.id = ci.recruiter_user_id
left join public.profiles pc on pc.id = ci.candidate_user_id
left join public.candidate_profiles cp on cp.user_id = ci.candidate_user_id
where not exists (
  select 1 from public.admin_undantagna_konton() und
  where und.user_id = ci.candidate_user_id or und.user_id = ci.recruiter_user_id
);

-- Vyerna ar bara till for service role (skyddet ligger i grants sedan
-- 20260914210839). create or replace behaller grants, men vi skriver dem
-- anda sa att filen star pa egna ben.
revoke all on public.admin_user_rows, public.admin_activity_feed, public.admin_test_stats,
  public.admin_retention_cohorts, public.admin_candidate_pool, public.admin_candidate_interests
  from anon, authenticated;
grant select on public.admin_user_rows, public.admin_activity_feed, public.admin_test_stats,
  public.admin_retention_cohorts, public.admin_candidate_pool, public.admin_candidate_interests
  to service_role;
