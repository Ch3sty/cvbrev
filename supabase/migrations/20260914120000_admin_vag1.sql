-- Ny admin, vag 1. docs/plan-admin.md avsnitt 5.2 och 5.3.
--
-- Tre delar:
--   1. Fyra nya tabeller for adminens historik och drift. Alla far RLS pa och
--      noll policies, alltsa service role och ingen annan.
--   2. Vyn admin_user_rows, sa att anvandarlistan blir en fraga i stallet for
--      sex.
--   3. Stanger de sju befintliga admin-vyerna. I dag har authenticated select
--      pa dem, vilket betyder att vilken inloggad anvandare som helst kunnat
--      lasa kandidatpoolen och retentionskohorterna. Tva av vyerna
--      (admin_activity_daily, admin_activity_by_function) hade dessutom
--      insert, update och delete for bade anon och authenticated.

-- ---------------------------------------------------------------------------
-- 1. Nya tabeller
-- ---------------------------------------------------------------------------

-- En rad per dag. Fylls av cronen i midnattsslotten samt on-demand.
-- Talen ar nullbara med flit: en dag utan svar fran GSC ska sta som null,
-- aldrig som noll, eftersom en nolla ser ut som ett ras.
create table if not exists public.admin_daily_metrics (
  dag date primary key,
  mrr_ore bigint,
  revenue_ore bigint,
  new_paying int,
  churned int,
  active_subs int,
  trialing_subs int,
  failed_payments int,
  new_accounts int,
  active_users int,
  gsc_clicks int,
  gsc_impressions int,
  gsc_ctr numeric,
  gsc_position numeric,
  emails_sent int,
  emails_opened int,
  ai_cost_sek numeric,
  uppdaterad timestamptz not null default now()
);

-- Topprader per dag och dimension, for Trafik.
create table if not exists public.admin_gsc_daily (
  dag date not null,
  dimension text not null,
  nyckel text not null,
  clicks int,
  impressions int,
  ctr numeric,
  position numeric,
  primary key (dag, dimension, nyckel)
);

create index if not exists admin_gsc_daily_dag_dim_idx
  on public.admin_gsc_daily (dag desc, dimension);

-- Tratten per vecka och kalla, for Funnel. vecka ar mandagen.
create table if not exists public.admin_funnel_weekly (
  vecka date not null,
  kalla text not null default 'alla',
  steg text not null,
  antal int not null,
  primary key (vecka, kalla, steg)
);

-- Fel och drifthandelser.
create table if not exists public.admin_error_log (
  id uuid primary key default gen_random_uuid(),
  kalla text not null,
  rutt text,
  meddelande text not null,
  antal int not null default 1,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_error_log_created_idx
  on public.admin_error_log (created_at desc);

-- RLS pa, noll policies. Utan policy kommer varken anon eller authenticated
-- at en rad, medan service role gar forbi RLS helt. Samma form som email_log,
-- email_events, email_schedule och cancel_intents redan har.
alter table public.admin_daily_metrics enable row level security;
alter table public.admin_gsc_daily     enable row level security;
alter table public.admin_funnel_weekly enable row level security;
alter table public.admin_error_log     enable row level security;

-- Balte utover hangslen: ta bort de tabellrattigheter som default-privilegier
-- delar ut till anon och authenticated i public-schemat.
revoke all on public.admin_daily_metrics from anon, authenticated;
revoke all on public.admin_gsc_daily     from anon, authenticated;
revoke all on public.admin_funnel_weekly from anon, authenticated;
revoke all on public.admin_error_log     from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Vyn admin_user_rows
-- ---------------------------------------------------------------------------

-- En rad per profil med raknarna anvandarlistan behover. Ingen
-- security_definer: vyn kors med anroparens rattigheter, och eftersom bara
-- service role har select pa den nas den bara darifran.
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
  coalesce(l.antal, 0)::int  as letter_count,
  coalesce(c.antal, 0)::int  as cv_count,
  coalesce(a.antal, 0)::int  as application_count,
  coalesce(an.antal, 0)::int as analysis_count,
  ua.senast_aktiv            as last_activity_at
from public.profiles p
left join (
  select user_id, count(*) as antal from public.letters group by user_id
) l on l.user_id = p.id
left join (
  select user_id, count(*) as antal from public.cv_texts group by user_id
) c on c.user_id = p.id
left join (
  select user_id, count(*) as antal from public.job_applications group by user_id
) a on a.user_id = p.id
left join (
  select user_id, count(*) as antal from public.cv_analysis_jobs group by user_id
) an on an.user_id = p.id
left join (
  select user_id, max(created_at) as senast_aktiv
  from public.user_activities group by user_id
) ua on ua.user_id = p.id;

revoke all on public.admin_user_rows from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Stang de befintliga admin-vyerna
-- ---------------------------------------------------------------------------

revoke all on public.admin_candidate_pool        from anon, authenticated;
revoke all on public.admin_candidate_interests   from anon, authenticated;
revoke all on public.admin_test_stats            from anon, authenticated;
revoke all on public.admin_retention_cohorts     from anon, authenticated;
revoke all on public.admin_activity_feed         from anon, authenticated;
revoke all on public.admin_activity_daily        from anon, authenticated;
revoke all on public.admin_activity_by_function  from anon, authenticated;
