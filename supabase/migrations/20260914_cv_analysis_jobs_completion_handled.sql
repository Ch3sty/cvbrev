-- Aktiveringsmatningen: milstolpar, aktivitetslogg och onboarding-rpc kordes
-- bakom "!usage_counted", men usage_counted satts redan till true vid
-- jobbskapande i createBackgroundJob. Grenen var darfor dod och
-- profiles.first_cv_analyzed_at sattes aldrig.
--
-- Ny, egen idempotensflagga for slutforandehanteringen. usage_counted ror vi
-- inte: den styr fortfarande kvot och rollback.
alter table public.cv_analysis_jobs
  add column if not exists completion_handled boolean not null default false;

comment on column public.cv_analysis_jobs.completion_handled is
  'Satt till true nar slutforandet hanterats (first_cv_analyzed_at, aktivitetslogg, onboarding). Skild fran usage_counted som styr kvot.';

-- Backfill: redan slutforda jobb ska inte utlosa retroaktiva aktivitetsrader.
update public.cv_analysis_jobs
set completion_handled = true
where status = 'completed';

-- Backfill av milstolpen fran aldsta slutforda jobb per anvandare.
update public.profiles p
set first_cv_analyzed_at = j.first_completed
from (
  select user_id, min(coalesce(completed_at, created_at)) as first_completed
  from public.cv_analysis_jobs
  where status = 'completed'
  group by user_id
) j
where p.id = j.user_id
  and p.first_cv_analyzed_at is null;
