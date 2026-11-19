-- Rekryteringstesterna v4 (docs/plan-tester-v4-bygg.md avsnitt 2.3).
--
-- plan_start: dagen Plan inför provet startade. Banan och "dag N av M"
-- räknas härifrån, aldrig från första nivåkollen (felet "dag 38 av 45").
-- skapad_at sätts vid registreringen och uppdaterad_at flyttas av varje
-- ändring, så ingen av dem duger. PUT /api/traning/plan sätter plan_start
-- när mitt_test eller provdatum ändras.
--
-- dagsmal: frivilligt dagsmål, 1 till 3 test om dagen.
--
-- Skrivs bara av servern (service role), samma spärr som resten av
-- test_planer (20261011100000_test_planer.sql). Additiv: två nya kolumner
-- som får vara null, ett villkor på den nya kolumnen och en ifyllning av
-- plan_start för befintliga planer. Inga befintliga värden ändras.

alter table public.test_planer
  add column if not exists plan_start date null,
  add column if not exists dagsmal smallint null;

alter table public.test_planer drop constraint if exists test_planer_dagsmal_check;
alter table public.test_planer
  add constraint test_planer_dagsmal_check check (dagsmal is null or dagsmal between 1 and 3);

comment on column public.test_planer.plan_start is
  'Dagen Plan inför provet startade: sätts när mitt_test eller provdatum ändras. Banan och "dag N av M" räknas härifrån, aldrig från första nivåkollen.';
comment on column public.test_planer.dagsmal is
  'Frivilligt dagsmål, 1 till 3 test om dagen. Null = inget dagsmål.';

-- Bästa gissning för befintliga planer: senaste ändringen av planen.
update public.test_planer
   set plan_start = (uppdaterad_at at time zone 'Europe/Stockholm')::date
 where plan_start is null and (provdatum is not null or mitt_test is not null);

-- Rollback:
--   alter table public.test_planer drop constraint test_planer_dagsmal_check;
--   alter table public.test_planer drop column dagsmal;
--   alter table public.test_planer drop column plan_start;
