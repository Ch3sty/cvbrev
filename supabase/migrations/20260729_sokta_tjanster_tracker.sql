-- Sökta tjänster: jobbansöknings-tracker
-- Applicerad mot produktion 2026-07-29 via Supabase MCP (apply_migration: sokta_tjanster_tracker).
-- Händelseloggen (job_application_events) är sanningskällan för status;
-- job_applications.current_status är en cache som underhålls av trigger.

-- ============================================================
-- 1. job_applications
-- ============================================================
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  job_title text not null check (char_length(job_title) between 1 and 200),
  company text not null check (char_length(company) between 1 and 200),
  location text check (char_length(location) <= 200),

  -- ad = annonserat jobb, unsolicited = spontanansökan, network = via kontakt.
  -- Mappar mot sektionerna i AF:s aktivitetsrapport (Af 00331).
  application_channel text not null default 'ad'
    check (application_channel = any (array['ad','unsolicited','network'])),
  job_ad_url text check (char_length(job_ad_url) <= 2048),

  letter_id uuid references public.letters(id) on delete set null,
  cv_id uuid references public.cv_texts(id) on delete set null,

  notes text check (char_length(notes) <= 4000),
  applied_at date not null default current_date,

  current_status text
    check (current_status is null or current_status = any (array[
      'applied','no_response','rejected','interview_invited','interview_completed',
      'trial_work_completed','offer_received','accepted','declined'
    ])),
  status_updated_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.job_applications is
  'Sökta tjänster: en ansökan per rad. current_status cachar senaste händelsen i job_application_events.';

create index idx_job_applications_user_applied_at
  on public.job_applications (user_id, applied_at desc);
create index idx_job_applications_user_status
  on public.job_applications (user_id, current_status);
create index idx_job_applications_letter_id
  on public.job_applications (letter_id) where letter_id is not null;
create index idx_job_applications_cv_id
  on public.job_applications (cv_id) where cv_id is not null;

create trigger update_job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 2. job_application_events
-- ============================================================
create table public.job_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,

  event_type text not null check (event_type = any (array[
    'applied','no_response','rejected','interview_invited','interview_completed',
    'trial_work_completed','offer_received','accepted','declined'
  ])),
  interview_round smallint check (interview_round between 1 and 10),
  note text check (char_length(note) <= 2000),

  occurred_at date not null default current_date,
  created_at timestamptz not null default now(),

  constraint job_application_events_round_only_on_interview
    check (event_type in ('interview_invited','interview_completed') or interview_round is null)
);

comment on table public.job_application_events is
  'Händelsehistorik per ansökan. Rader kan läggas till/ändras/raderas; current_status räknas om av trigger.';

create index idx_job_application_events_application_id
  on public.job_application_events (application_id, occurred_at, created_at);
create index idx_job_application_events_type
  on public.job_application_events (event_type);

create or replace function public.sync_job_application_current_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application_id uuid := coalesce(new.application_id, old.application_id);
  v_latest record;
begin
  select event_type into v_latest
  from public.job_application_events
  where application_id = v_application_id
  order by occurred_at desc, created_at desc
  limit 1;

  update public.job_applications
  set current_status = v_latest.event_type,
      status_updated_at = case when v_latest.event_type is not null then now() end
  where id = v_application_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_sync_job_application_current_status
  after insert or update or delete on public.job_application_events
  for each row execute function public.sync_job_application_current_status();

-- ============================================================
-- 3. RLS
-- ============================================================
alter table public.job_applications enable row level security;

create policy job_applications_select_policy on public.job_applications
  for select using ((user_id = (select auth.uid())) or is_admin());
create policy job_applications_insert_policy on public.job_applications
  for insert with check ((user_id = (select auth.uid())) or is_admin());
create policy job_applications_update_policy on public.job_applications
  for update using ((user_id = (select auth.uid())) or is_admin())
  with check ((user_id = (select auth.uid())) or is_admin());
create policy job_applications_delete_policy on public.job_applications
  for delete using ((user_id = (select auth.uid())) or is_admin());

alter table public.job_application_events enable row level security;

create policy job_application_events_select_policy on public.job_application_events
  for select using (exists (
    select 1 from public.job_applications ja
    where ja.id = job_application_events.application_id
      and (ja.user_id = (select auth.uid()) or is_admin())
  ));
create policy job_application_events_insert_policy on public.job_application_events
  for insert with check (exists (
    select 1 from public.job_applications ja
    where ja.id = job_application_events.application_id
      and (ja.user_id = (select auth.uid()) or is_admin())
  ));
create policy job_application_events_update_policy on public.job_application_events
  for update using (exists (
    select 1 from public.job_applications ja
    where ja.id = job_application_events.application_id
      and (ja.user_id = (select auth.uid()) or is_admin())
  )) with check (exists (
    select 1 from public.job_applications ja
    where ja.id = job_application_events.application_id
      and (ja.user_id = (select auth.uid()) or is_admin())
  ));
create policy job_application_events_delete_policy on public.job_application_events
  for delete using (exists (
    select 1 from public.job_applications ja
    where ja.id = job_application_events.application_id
      and (ja.user_id = (select auth.uid()) or is_admin())
  ));

-- ============================================================
-- 4. job_application_share_links (mönster: recruiter_share_links)
-- ============================================================
create table public.job_application_share_links (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  show_company_names boolean not null default true,
  show_channel_breakdown boolean not null default true,
  show_monthly_trend boolean not null default true,
  show_notes boolean not null default false,

  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,

  constraint job_application_share_links_token_length
    check (char_length(token) between 16 and 64)
);

comment on table public.job_application_share_links is
  'Read-only-delningslänkar för sökstatistik. Skrivs endast via service-role i API-route.';

create index idx_job_application_share_links_user_id
  on public.job_application_share_links (user_id);
create index idx_job_application_share_links_active
  on public.job_application_share_links (expires_at) where revoked_at is null;

alter table public.job_application_share_links enable row level security;

-- Endast ägar-SELECT; all skrivning via service-role (som recruiter_share_links).
create policy job_application_share_links_owner_read
  on public.job_application_share_links
  for select using (user_id = (select auth.uid()));

-- ============================================================
-- 5. Statistik-RPC (endast service_role; tar godtycklig user_id)
-- ============================================================
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
    select ja.id, ja.applied_at, ja.current_status, ja.application_channel
    from public.job_applications ja
    where ja.user_id = p_user_id
      and (p_since is null or ja.applied_at >= p_since)
      and (p_until is null or ja.applied_at <= p_until)
  ),
  monthly as (
    select date_trunc('month', applied_at)::date as month, count(*) as applications
    from scoped
    group by 1
    order by 1
  ),
  weekly as (
    select date_trunc('week', applied_at)::date as week, count(*) as applications
    from scoped
    group by 1
    order by 1
  ),
  channels as (
    select application_channel, count(*) as applications
    from scoped
    group by 1
  )
  select jsonb_build_object(
    'totalApplications', (select count(*) from scoped),
    'respondedCount', (select count(*) from scoped
      where current_status is not null and current_status not in ('applied','no_response')),
    'interviewedCount', (select count(*) from scoped where current_status in
      ('interview_invited','interview_completed','trial_work_completed','offer_received','accepted','declined')),
    'offerCount', (select count(*) from scoped where current_status in ('offer_received','accepted','declined')),
    'acceptedCount', (select count(*) from scoped where current_status = 'accepted'),
    'byMonth', (select coalesce(jsonb_agg(jsonb_build_object('month', month, 'applications', applications) order by month), '[]'::jsonb) from monthly),
    'byWeek', (select coalesce(jsonb_agg(jsonb_build_object('week', week, 'applications', applications) order by week), '[]'::jsonb) from weekly),
    'byChannel', (select coalesce(jsonb_agg(jsonb_build_object('channel', application_channel, 'applications', applications)), '[]'::jsonb) from channels)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_job_application_stats(uuid, date, date) from public;
revoke all on function public.get_job_application_stats(uuid, date, date) from anon, authenticated;
grant execute on function public.get_job_application_stats(uuid, date, date) to service_role;
