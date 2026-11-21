-- Matchade jobb: en kompakt sammanfattning av senaste körningen (Jobbsöket
-- omgång 1, etapp 2A, rättningsrundan).
--
-- job_matchings_cache.jobs är hela körningen, upp till 600 annonser och
-- 3,3 MB jsonb. Att läsa den tog 1,5 till 6,6 s per sidladdning (mätt
-- 2026-11-21 mot dev-servern), och Översikt, Matchade jobb och sidomenyn
-- läste den eller räknade i den (matchningar_nya()). Sammanfattningen har
-- bara de bästa träffarna (högst 25, efter preferenserna och grundfiltren)
-- och deras publiceringsdagar.
--
-- En rad per konto: senaste sammanfattningen. Nyckeln mot en ny sökning är
-- cv_id, filter_hash, prefs_nyckel och korning_at (koden använder aldrig en
-- sammanfattning som är äldre än körningen i job_matchings_cache).
--
-- Bara tillägg: en ny tabell. Inga ändrade villkor, ingen SECURITY DEFINER,
-- ingen drop, ingen revoke. Går att köra flera gånger. Koden fungerar utan
-- tabellen (då läses hela körningen som förut).
--
-- RLS: ägaren läser sin rad. Ingen skrivpolicy: raden skrivs bara av servern
-- (sidans laddare och /api/jobbmatchning/sammanfattning) med admin-klienten
-- efter att sessionen kontrollerats (regeln från 2026-10-10).
--
-- Rollback (först när koden som läser den är backad):
--   drop table if exists public.job_matching_summaries;

create table if not exists public.job_matching_summaries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cv_id uuid,
  filter_hash text not null default '',
  -- Sökprofilen och CV:ts inläsning som sammanfattningen räknades med.
  prefs_nyckel text not null default '',
  -- När körningen gjordes (sökningen, inte sammanfattningen).
  korning_at timestamptz not null,
  -- Annonser körningen läste.
  ads_read integer not null default 0 check (ads_read >= 0),
  -- Antalet bästa träffar (högst 25).
  antal_basta smallint not null default 0 check (antal_basta between 0 and 100),
  -- Publiceringstiderna för de bästa träffarna, för "N nya" (små, läses av sidomenyn).
  publicerade jsonb not null default '[]'::jsonb,
  -- De bästa träffarna, hela annonserna i rangordning.
  jobs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.job_matching_summaries is
  'Matchade jobb (Jobbsöket omgång 1): de bästa träffarna ur senaste körningen i job_matchings_cache, så att sidorna slipper läsa hela körningen.';

alter table public.job_matching_summaries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'job_matching_summaries'
      and policyname = 'job_matching_summaries_agaren_laser'
  ) then
    create policy job_matching_summaries_agaren_laser on public.job_matching_summaries
      for select using ((user_id = (select auth.uid())) or public.is_admin());
  end if;
end
$$;
