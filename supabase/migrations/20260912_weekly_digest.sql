-- Veckosammanfattning (weekly_digest) och profilvisningar för Bli upptäckt.
-- Plan: docs/plan-inloggat-omdesign.md, våg 1 punkt 11 och våg 3 punkt 24.
-- Applicerad mot produktion 2026-09-12 via Supabase MCP
-- (apply_migration: weekly_digest_och_profilvisningar).
--
-- Två saker som hänger ihop av en anledning: båda ger användaren
-- observerbar återkoppling på arbete hon redan lagt ned. Mailet berättar vad
-- som hänt med ansökningarna, visningsräknaren att kandidatprofilen faktiskt
-- ses av någon.

-- ============================================================
-- 1. Avregistrering som bara gäller veckomailet
-- ============================================================
-- quota_emails_opt_out stänger allt icke-transaktionellt. Den som vill
-- behålla kvotpåminnelser men slippa veckobrevet ska inte behöva välja.
alter table public.profiles
  add column if not exists weekly_digest_opt_out boolean not null default false;

comment on column public.profiles.weekly_digest_opt_out is
  'Avregistrering som bara gäller weekly_digest. quota_emails_opt_out stänger fortfarande allt icke-transaktionellt.';

-- ============================================================
-- 2. Profilvisningar i kandidatpoolen
-- ============================================================
-- En rad per gång en godkänd rekryterare öppnar en kandidats detaljprofil.
-- Kandidaten ska kunna se ATT hon setts, aldrig AV VEM: recruiter_user_id
-- lagras för avdubbling och missbruksspårning men lämnar aldrig servern mot
-- kandidatsidan.
create table if not exists public.candidate_profile_views (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references auth.users(id) on delete cascade,
  recruiter_user_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

comment on table public.candidate_profile_views is
  'En rad per rekryterarvisning av en kandidatprofil. Kandidaten ser antal, aldrig identitet.';

-- Uppslaget kandidatsidan gör: antal visningar för en kandidat sedan ett datum.
create index if not exists idx_candidate_profile_views_candidate
  on public.candidate_profile_views (candidate_user_id, viewed_at desc);

-- Avdubblingen i loggningen slår mot detta par.
create index if not exists idx_candidate_profile_views_pair
  on public.candidate_profile_views (candidate_user_id, recruiter_user_id, viewed_at desc);

alter table public.candidate_profile_views enable row level security;

-- Kandidaten läser sina egna visningar. Ingen policy för insert, update eller
-- delete: skrivningen sker med service role från serverrutten, aldrig från
-- klienten. Rekryterare har ingen läsrätt alls här.
drop policy if exists "candidate reads own profile views" on public.candidate_profile_views;
create policy "candidate reads own profile views"
  on public.candidate_profile_views
  for select
  using (auth.uid() = candidate_user_id);
