-- Adminvyerna las med service role, som inte har nagon JWT. is_admin() blir
-- darfor alltid false och vyerna gav noll rader utan felmeddelande.
-- Innehall-sidans kandidatpool var tom av den anledningen, och Funnel raknade
-- om kohorterna i TypeScript for att komma runt det.
--
-- Villkoret behovs inte som skydd: alla atta admin_*-vyer ar redan revoke:ade
-- for anon och authenticated och har bara grants till service_role (verifierat
-- mot information_schema.role_table_grants i samma omgang). Behorigheten ligger
-- i grants, dar den hor hemma, inte i en where-sats som tyst raderar resultatet
-- for den enda roll som far lasa vyn.
--
-- security_invoker satts pa var vy sa att underliggande RLS utvarderas som den
-- anropande rollen, inte som agaren.

create or replace view public.admin_activity_feed
with (security_invoker = true) as
 select feed.user_id, feed.email, feed.full_name, feed.funktion, feed.detalj,
        feed.slutford, feed.tidpunkt
 from (
   select l.user_id, p.email, p.full_name, 'Logiktest'::text as funktion,
          l.test_type as detalj, (l.completed_at is not null) as slutford,
          coalesce(l.completed_at, l.started_at) as tidpunkt
     from logic_test_v4_sessions l join profiles p on p.id = l.user_id
   union all
   select pt.user_id, p.email, p.full_name, 'Personlighetstest'::text,
          pt.test_type, (pt.completed_at is not null),
          coalesce(pt.completed_at, pt.started_at)
     from personality_test_sessions pt join profiles p on p.id = pt.user_id
   union all
   select c.user_id, p.email, p.full_name, 'Jobbcoach'::text,
          coalesce(c.topic, c.title), true, c.created_at
     from ai_conversations c join profiles p on p.id = c.user_id
   union all
   select cj.user_id, p.email, p.full_name, 'CV-analys'::text,
          cj.display_name, (cj.status = 'completed'::text),
          coalesce(cj.completed_at, cj.created_at)
     from cv_analysis_jobs cj join profiles p on p.id = cj.user_id
   union all
   select le.user_id, p.email, p.full_name, 'Brev'::text, le.job_title, true,
          le.created_at
     from letters le join profiles p on p.id = le.user_id
   union all
   select d.user_id, p.email, p.full_name, 'CV-mall'::text, d.template_id, true,
          d.downloaded_at
     from formatted_cv_downloads d join profiles p on p.id = d.user_id
   union all
   select lo.user_id, p.email, p.full_name, 'LinkedIn-opt'::text, null::text,
          true, lo.created_at
     from linkedin_optimizations lo join profiles p on p.id = lo.user_id
 ) feed;

create or replace view public.admin_candidate_interests
with (security_invoker = true) as
 select ci.id, ci.created_at, ci.responded_at, ci.status, ci.candidate_user_id,
        ci.recruiter_user_id, rp.company_name as rekryterare_foretag,
        rp.contact_name as rekryterare_namn, pr.email as rekryterare_epost,
        pc.email as kandidat_epost, cp.visibility as kandidat_lage
   from candidate_interests ci
   left join recruiter_profiles rp on rp.user_id = ci.recruiter_user_id
   left join profiles pr on pr.id = ci.recruiter_user_id
   left join profiles pc on pc.id = ci.candidate_user_id
   left join candidate_profiles cp on cp.user_id = ci.candidate_user_id;

create or replace view public.admin_candidate_pool
with (security_invoker = true) as
 select cp.user_id, p.email, p.full_name, cp.visibility, cp.show_personality,
        cp.show_full_workstyle, cp.availability, cp.workplace, cp.extent,
        cp.employment_types, cp.regions, cp.drivers_license, cp.salary_min,
        cp.salary_max, cp.pitch, cp.context_tags, cp.consent_given_at,
        cp.consent_version, cp.created_at, cp.updated_at,
        coalesce(i.totalt, 0::bigint) as intressen_totalt,
        coalesce(i.accepterade, 0::bigint) as intressen_accepterade,
        coalesce(i.avbojda, 0::bigint) as intressen_avbojda,
        coalesce(i.vantande, 0::bigint) as intressen_vantande,
        i.senaste_intresse
   from candidate_profiles cp
   join profiles p on p.id = cp.user_id
   left join lateral (
     select count(*) as totalt,
            count(*) filter (where ci.status = 'accepted') as accepterade,
            count(*) filter (where ci.status = 'declined') as avbojda,
            count(*) filter (where ci.status = 'pending') as vantande,
            max(ci.created_at) as senaste_intresse
       from candidate_interests ci
      where ci.candidate_user_id = cp.user_id
   ) i on true;

create or replace view public.admin_retention_cohorts
with (security_invoker = true) as
 with kohort as (
   select profiles.id, date_trunc('month', profiles.created_at) as kohortmanad
     from profiles
 ), kohortstorlek as (
   select kohort.kohortmanad, count(*) as storlek from kohort
    group by kohort.kohortmanad
 ), aktivitet as (
   select distinct user_activities.user_id,
          date_trunc('month', user_activities.created_at) as aktivmanad
     from user_activities
 )
 select k.kohortmanad, ks.storlek as kohortstorlek,
        (((extract(year from a.aktivmanad) - extract(year from k.kohortmanad)) * 12::numeric)
          + (extract(month from a.aktivmanad) - extract(month from k.kohortmanad)))::integer
          as manad_offset,
        count(distinct a.user_id) as aktiva
   from kohort k
   join kohortstorlek ks on ks.kohortmanad = k.kohortmanad
   join aktivitet a on a.user_id = k.id and a.aktivmanad >= k.kohortmanad
  group by k.kohortmanad, ks.storlek, 3;

create or replace view public.admin_test_stats
with (security_invoker = true) as
 select 'logik'::text as kategori, s.test_type, count(*) as started,
        count(*) filter (where s.completed_at is not null) as completed,
        count(distinct s.user_id) as unique_users,
        max(s.started_at) as last_started
   from logic_test_v4_sessions s group by s.test_type
 union all
 select 'personlighet'::text, ps.test_type, count(*),
        count(*) filter (where ps.completed_at is not null),
        count(distinct ps.user_id), max(ps.started_at)
   from personality_test_sessions ps group by ps.test_type;

-- De tva harledda vyerna sitter ovanpa admin_activity_feed och behover samma
-- invoker-installning for att inte fanga agarens rattigheter.
alter view public.admin_activity_daily set (security_invoker = true);
alter view public.admin_activity_by_function set (security_invoker = true);

-- Aterstall stangningen. create or replace bevarar grants, men alter view och
-- nya vyer far default-privilegier, sa vi upprepar den uttryckligen.
revoke all on public.admin_activity_feed, public.admin_activity_daily,
  public.admin_activity_by_function, public.admin_candidate_interests,
  public.admin_candidate_pool, public.admin_retention_cohorts,
  public.admin_test_stats from anon, authenticated;
grant select on public.admin_activity_feed, public.admin_activity_daily,
  public.admin_activity_by_function, public.admin_candidate_interests,
  public.admin_candidate_pool, public.admin_retention_cohorts,
  public.admin_test_stats to service_role;
