-- Jobbsöket omgång 2, 9 B: händelsetypen test_invited (kallad till test).
-- Bara tillägg: de två villkoren som listar tillåtna värden får ett tionde.
-- Ingen kolumn, ingen funktion och ingen rad ändras. Går att köra flera gånger.
--
-- Rollback (först när ingen rad har test_invited och koden som skriver den är backad):
--   alter table public.job_application_events
--     drop constraint if exists job_application_events_event_type_check;
--   alter table public.job_application_events
--     add constraint job_application_events_event_type_check
--     check (event_type = any (array[
--       'applied','no_response','rejected','interview_invited','interview_completed',
--       'trial_work_completed','offer_received','accepted','declined'
--     ]));
--   alter table public.job_applications
--     drop constraint if exists job_applications_current_status_check;
--   alter table public.job_applications
--     add constraint job_applications_current_status_check
--     check (current_status is null or current_status = any (array[
--       'applied','no_response','rejected','interview_invited','interview_completed',
--       'trial_work_completed','offer_received','accepted','declined'
--     ]));

begin;

alter table public.job_application_events
  drop constraint if exists job_application_events_event_type_check;
alter table public.job_application_events
  add constraint job_application_events_event_type_check
  check (event_type = any (array[
    'applied','no_response','rejected','test_invited','interview_invited','interview_completed',
    'trial_work_completed','offer_received','accepted','declined'
  ]));

alter table public.job_applications
  drop constraint if exists job_applications_current_status_check;
alter table public.job_applications
  add constraint job_applications_current_status_check
  check (current_status is null or current_status = any (array[
    'applied','no_response','rejected','test_invited','interview_invited','interview_completed',
    'trial_work_completed','offer_received','accepted','declined'
  ]));

commit;
