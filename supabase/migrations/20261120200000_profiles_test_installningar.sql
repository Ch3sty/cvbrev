-- Träna-inställningen per konto (docs/plan-testflode-2026-11-20.md, beslut 3
-- och "Lagring av Träna-inställningen"): kryssrutan "Förklaring efter varje
-- svar" på Träna-startskärmen. {"forklaring_efter_svar": true|false}.
--
-- Additiv och nullbar: null betyder standardläget (på). Skrivs bara av
-- /api/traning/installningar med service role, villkorat på id. Ingen
-- personuppgift, en gränssnittsinställning. RLS på profiles rörs inte.
--
-- Backning: alter table public.profiles drop column if exists test_installningar;

alter table public.profiles add column if not exists test_installningar jsonb;

comment on column public.profiles.test_installningar is
  'Testflödets inställningar (Träna): {"forklaring_efter_svar": boolean}. Null = standard. Skrivs av /api/traning/installningar.';
