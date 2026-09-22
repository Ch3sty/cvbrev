-- Paket och onboarding, slapp 1. docs/plan-paket-och-onboarding.md avsnitt 5.
--
-- Tre delar:
--   1. profiles.premium_scope: vilket paket prenumerationen ger. Null ar
--      gratis. Speglar prenumerationen, aldrig ett engangskop.
--   2. premium_grants.scope: engangskopen bar sitt eget scope och sin egen
--      sluttid, sa att Allt-dagen ovanpa en sparprenumeration kan hojas till
--      allt for dygnet och falla tillbaka till sparet efterat.
--   3. Sex kolumner i admin_daily_metrics, en per paket, sa att adminen kan
--      visa aktiva och normaliserad MRR per paket.
--
-- Hela filen ar idempotent: kolumnerna kan redan finnas i den fjarranslutna
-- databasen.

-- ---------------------------------------------------------------------------
-- 1. profiles.premium_scope
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists premium_scope text;

alter table public.profiles
  drop constraint if exists profiles_premium_scope_check;

alter table public.profiles
  add constraint profiles_premium_scope_check
  check (premium_scope is null or premium_scope in ('cv', 'tester', 'allt'));

comment on column public.profiles.premium_scope is
  'Paketet prenumerationen ger: cv, tester eller allt. Null ar gratis. Befintlig premium utan scope lases som allt.';

-- Backfyllnad: ingen befintlig kund far mindre an i dag.
update public.profiles
set premium_scope = 'allt'
where premium_scope is null
  and (subscription_tier = 'premium' or premium_until > now());

-- ---------------------------------------------------------------------------
-- 2. premium_grants.scope
-- ---------------------------------------------------------------------------

alter table public.premium_grants
  add column if not exists scope text not null default 'allt';

alter table public.premium_grants
  drop constraint if exists premium_grants_scope_check;

alter table public.premium_grants
  add constraint premium_grants_scope_check
  check (scope in ('cv', 'tester', 'allt'));

comment on column public.premium_grants.scope is
  'Scope for engangskopet. Allt-dagen och admins "ge premium" ar alltid allt. Egen sluttid i premium_until_after gor att nedtrappningen vet vad som galler efterat.';

-- ---------------------------------------------------------------------------
-- 3. Aktiva per paket i admin_daily_metrics
-- ---------------------------------------------------------------------------

alter table public.admin_daily_metrics
  add column if not exists active_cv_week integer,
  add column if not exists active_test_week integer,
  add column if not exists active_all_day integer,
  add column if not exists active_all_week integer,
  add column if not exists active_all_month integer,
  add column if not exists active_all_quarter integer;

comment on column public.admin_daily_metrics.active_all_day is
  'Giltiga engangsgrants med scope allt, alltsa Allt-dagen. De ovriga fem raknas pa Stripe-prenumerationernas price-id.';
