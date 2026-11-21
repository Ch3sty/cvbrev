-- Jobbsöket, omgång 1 (BYGGSPEC avsnitt 3, ägarens beslut 2026-11-21).
--
-- Bara tillägg: två nya tabeller, två nullbara kolumner på
-- job_application_events och en nullbar kolumn på profiles. Inga ändrade
-- check-villkor på befintliga kolumner, inga nya SECURITY DEFINER-funktioner,
-- ingen drop och ingen revoke. Går att köra flera gånger.
--
--   job_saved_ads                     Ska sökas (F3). Egen tabell, inte en
--                                     status på job_applications, så att raderna
--                                     aldrig räknas i statistik, rapport eller
--                                     delningslänk.
--   job_application_followups         Följde upp (F5). Egen tabell, inte en
--                                     händelsetyp: triggern gör senaste
--                                     händelsen till status, och en uppföljning
--                                     är ingen status.
--   job_application_events.interview_at, interview_place   Intervjuns tid och plats (F6).
--   profiles.weekly_application_goal  Veckans mål (F4), 1 till 10, null = förvalet 3.
--                                     Sökprofilen ligger som jsonb i
--                                     profiles.job_preferences (ingen egen
--                                     tabell), så målet ligger bredvid den.
--                                     profiles_skydda_kolumner räknar upp sina
--                                     skyddade kolumner med namn; den här finns
--                                     inte i listan och går att skriva med
--                                     användarens session.
--
-- RLS: ägaren läser sina rader i de nya tabellerna. Ingen skrivpolicy: de
-- skrivs bara av API-rutterna (/api/jobbsok/*) med admin-klienten efter att
-- sessionen kontrollerats (regeln från 2026-10-10). De nya kolumnerna på
-- befintliga tabeller följer de policyer som redan finns.
--
-- Rollback (först när koden som läser dem är backad):
--   alter table public.profiles drop column if exists weekly_application_goal;
--   alter table public.job_application_events drop column if exists interview_place;
--   alter table public.job_application_events drop column if exists interview_at;
--   drop table if exists public.job_application_followups;
--   drop table if exists public.job_saved_ads;

-- ============================================================
-- 1. Ska sökas
-- ============================================================
create table if not exists public.job_saved_ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  job_title text not null check (char_length(job_title) between 1 and 200),
  company text not null check (char_length(company) between 1 and 200),
  location text check (location is null or char_length(location) <= 200),
  job_ad_url text check (job_ad_url is null or char_length(job_ad_url) <= 2048),
  -- Sista ansökningsdag. Null när annonsen inte säger någon.
  last_application_date date,

  -- 'match' = sparad från en träff i Matchade jobb, 'egen' = inskriven i arket.
  source text not null default 'egen' check (source in ('match', 'egen')),
  -- Arbetsförmedlingens annons-id när raden kommer från en träff.
  af_ad_id text check (af_ad_id is null or char_length(af_ad_id) <= 100),
  -- Matchgraden när raden sparades (ögonblicksbild, räknas aldrig om).
  match_score smallint check (match_score is null or match_score between 0 and 100),
  note text check (note is null or char_length(note) <= 2000),

  -- Sätts när raden blivit en sökt tjänst; raden döljs då. Tas den sökta
  -- tjänsten bort kommer raden tillbaka under Ska sökas.
  application_id uuid references public.job_applications(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.job_saved_ads is
  'Jobbsöket F3, Ska sökas: sparade annonser med sista ansökningsdag. Räknas aldrig i statistik, rapport eller delningslänk. Skrivs bara av servern.';

create unique index if not exists job_saved_ads_user_af_ad_unik
  on public.job_saved_ads (user_id, af_ad_id)
  where af_ad_id is not null;

create index if not exists idx_job_saved_ads_user_oppna
  on public.job_saved_ads (user_id, last_application_date)
  where application_id is null;

create index if not exists idx_job_saved_ads_application_id
  on public.job_saved_ads (application_id)
  where application_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_job_saved_ads_updated_at'
      and tgrelid = 'public.job_saved_ads'::regclass
  ) then
    create trigger update_job_saved_ads_updated_at
      before update on public.job_saved_ads
      for each row execute function public.update_updated_at_column();
  end if;
end
$$;

alter table public.job_saved_ads enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_saved_ads'
      and policyname = 'job_saved_ads_agaren_laser'
  ) then
    create policy job_saved_ads_agaren_laser on public.job_saved_ads
      for select using ((user_id = (select auth.uid())) or public.is_admin());
  end if;
end
$$;

-- ============================================================
-- 2. Följde upp
-- ============================================================
create table if not exists public.job_application_followups (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Utkastet som användaren senast sparade. Null på en uppföljning som
  -- loggats utan utkast ("Jag har redan skickat det").
  subject text check (subject is null or char_length(subject) <= 200),
  body text check (body is null or char_length(body) <= 4000),
  -- "Skriv om kortare", högst tre gånger per utkast.
  rewrites smallint not null default 0 check (rewrites between 0 and 3),

  -- Null tills användaren säger att mejlet är skickat.
  sent_at date,
  sent_via text check (sent_via is null or sent_via in ('epost', 'kopierat', 'eget')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint job_application_followups_skickad_hel
    check ((sent_at is null) = (sent_via is null))
);

comment on table public.job_application_followups is
  'Jobbsöket F5: uppföljningsmejl per sökt tjänst. En rad per uppföljning; sent_at null = utkast som inte skickats. Visas som "Följde upp" bland händelserna. Skrivs bara av servern.';

-- Högst ett oskickat utkast per sökt tjänst.
create unique index if not exists job_application_followups_ett_utkast
  on public.job_application_followups (application_id)
  where sent_at is null;

create index if not exists idx_job_application_followups_user_created
  on public.job_application_followups (user_id, created_at desc);

create index if not exists idx_job_application_followups_application
  on public.job_application_followups (application_id, sent_at);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_job_application_followups_updated_at'
      and tgrelid = 'public.job_application_followups'::regclass
  ) then
    create trigger update_job_application_followups_updated_at
      before update on public.job_application_followups
      for each row execute function public.update_updated_at_column();
  end if;
end
$$;

alter table public.job_application_followups enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_application_followups'
      and policyname = 'job_application_followups_agaren_laser'
  ) then
    create policy job_application_followups_agaren_laser on public.job_application_followups
      for select using ((user_id = (select auth.uid())) or public.is_admin());
  end if;
end
$$;

-- ============================================================
-- 3. Intervjuns tid och plats
-- ============================================================
alter table public.job_application_events
  add column if not exists interview_at timestamptz,
  add column if not exists interview_place text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'job_application_events_interview_place_langd'
  ) then
    alter table public.job_application_events
      add constraint job_application_events_interview_place_langd
      check (interview_place is null or char_length(interview_place) <= 200);
  end if;
end
$$;

comment on column public.job_application_events.interview_at is
  'Jobbsöket F6: intervjuns tid (bara meningsfull på interview_invited). 00:00 svensk tid betyder att bara datumet är satt.';
comment on column public.job_application_events.interview_place is
  'Jobbsöket F6: intervjuns plats, högst 200 tecken.';

-- ============================================================
-- 4. Veckans mål
-- ============================================================
alter table public.profiles
  add column if not exists weekly_application_goal smallint;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_weekly_application_goal_check'
  ) then
    alter table public.profiles
      add constraint profiles_weekly_application_goal_check
      check (weekly_application_goal is null or weekly_application_goal between 1 and 10);
  end if;
end
$$;

comment on column public.profiles.weekly_application_goal is
  'Jobbsöket F4: veckans mål, antal sökta tjänster per vecka (måndag till söndag, svensk tid). Null = förvalet 3.';
