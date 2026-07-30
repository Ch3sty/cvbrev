-- Statistik v2: räkna "nådde intervju/erbjudande" från händelsehistoriken i stället
-- för current_status (en ansökan med avslag efter intervju ska räknas som intervjuad),
-- och exponera utfallsklasser (byOutcome) som tratt/Sankey byggs från.
-- Applicerad mot produktion 2026-07-29 via Supabase MCP (apply_migration: sokta_tjanster_stats_v2).
create or replace function public.get_job_application_stats(
  p_user_id uuid,
  p_since date default null,
  p_until date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  with scoped as (
    select
      ja.id, ja.applied_at, ja.current_status, ja.application_channel,
      exists (
        select 1 from public.job_application_events e
        where e.application_id = ja.id
          and e.event_type in ('interview_invited','interview_completed','trial_work_completed')
      ) as reached_interview,
      exists (
        select 1 from public.job_application_events e
        where e.application_id = ja.id
          and e.event_type in ('offer_received','accepted','declined')
      ) as reached_offer,
      exists (
        select 1 from public.job_application_events e
        where e.application_id = ja.id
          and e.event_type not in ('applied','no_response')
      ) as got_response
    from public.job_applications ja
    where ja.user_id = p_user_id
      and (p_since is null or ja.applied_at >= p_since)
      and (p_until is null or ja.applied_at <= p_until)
  ),
  classified as (
    select *,
      case
        when current_status = 'accepted' then 'accepted'
        when current_status = 'declined' then 'declined'
        when current_status = 'offer_received' then 'offer_pending'
        when current_status = 'rejected' and reached_interview then 'rejected_after_interview'
        when current_status = 'rejected' then 'rejected_no_interview'
        when reached_interview then 'in_interview'
        else 'awaiting'
      end as outcome
    from scoped
  ),
  monthly as (
    select date_trunc('month', applied_at)::date as month, count(*) as applications
    from scoped group by 1 order by 1
  ),
  weekly as (
    select date_trunc('week', applied_at)::date as week, count(*) as applications
    from scoped group by 1 order by 1
  ),
  channels as (
    select application_channel, count(*) as applications
    from scoped group by 1
  ),
  outcomes as (
    select outcome, count(*) as applications
    from classified group by 1
  )
  select jsonb_build_object(
    'totalApplications', (select count(*) from scoped),
    'respondedCount', (select count(*) from scoped where got_response),
    'interviewedCount', (select count(*) from scoped where reached_interview),
    'offerCount', (select count(*) from scoped where reached_offer),
    'acceptedCount', (select count(*) from scoped where current_status = 'accepted'),
    'byOutcome', (select coalesce(jsonb_agg(jsonb_build_object('outcome', outcome, 'applications', applications)), '[]'::jsonb) from outcomes),
    'byMonth', (select coalesce(jsonb_agg(jsonb_build_object('month', month, 'applications', applications) order by month), '[]'::jsonb) from monthly),
    'byWeek', (select coalesce(jsonb_agg(jsonb_build_object('week', week, 'applications', applications) order by week), '[]'::jsonb) from weekly),
    'byChannel', (select coalesce(jsonb_agg(jsonb_build_object('channel', application_channel, 'applications', applications)), '[]'::jsonb) from channels)
  ) into v_result;

  return v_result;
end;
$$;
