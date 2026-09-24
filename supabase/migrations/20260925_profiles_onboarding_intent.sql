-- Registreringstrattens val (docs/design/profil-registrering-spec-2026-09-24.md, Del B).
--
-- Vad användaren valde att börja med i steg 1. Finare än onboarding_track,
-- som styr paket. Skrivs bara av /api/onboarding/track med serverklienten;
-- läses av valkommen-sidan, Kom igång och hemskärmens ordning, aldrig av
-- menyn eller behörigheterna (saas-leads villkor 1).

alter table public.profiles
  add column if not exists onboarding_intent text
  check (onboarding_intent in ('cv','brev','tester','intervju','jobb'));

comment on column public.profiles.onboarding_intent is
  'Vad användaren valde att börja med i registreringstratten. Finare än onboarding_track, som styr paket.';
