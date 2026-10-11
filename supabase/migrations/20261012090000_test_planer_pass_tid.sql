-- Tidpunkten för passet (riktlinjer-tester-v2 4.2 och ägarbeslutet
-- 2026-10-11 om mejlen): efter Nivåkollen väljer hon Morgon, Lunch eller
-- Kväll med ett tryck. Valet styr påminnelsemejlet pass_dag2 (07:00, 11:30
-- eller 18:00 svensk tid) och står i Min plan.
--
-- Skrivs bara av servern (/api/traning/pass-tid med service role), samma
-- spärr som resten av test_planer (20261011100000_test_planer.sql): RLS,
-- ingen skrivpolicy och triggern traning_skydda_skrivning.
--
-- Additiv. Kör på Supabase-branch först; prod bara efter ägarens ja.

alter table public.test_planer
  add column if not exists pass_tid text null;

alter table public.test_planer
  drop constraint if exists test_planer_pass_tid_check;

alter table public.test_planer
  add constraint test_planer_pass_tid_check
    check (pass_tid is null or pass_tid in ('morgon', 'lunch', 'kvall'));

comment on column public.test_planer.pass_tid is
  'Vald tidpunkt för passet: morgon (07:00), lunch (11:30) eller kvall (18:00), svensk tid. Null: inget val, ingen påminnelse.';

-- Rollback:
--   alter table public.test_planer drop constraint test_planer_pass_tid_check;
--   alter table public.test_planer drop column pass_tid;
