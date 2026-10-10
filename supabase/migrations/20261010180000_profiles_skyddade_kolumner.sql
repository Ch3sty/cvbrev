-- Spärr mot självbetjänad premium i public.profiles, steg 1 (2026-10-10).
--
-- Problemet: rollen authenticated hade UPDATE-rätt på alla kolumner och
-- RLS-policyerna lät användaren uppdatera sin egen rad. Via PostgREST och
-- anon-nyckeln kunde en inloggad användare alltså sätta subscription_tier,
-- premium_until, premium_scope, stripe_customer_id med flera på sig själv,
-- och AFTER-triggrarna delade sedan ut kvoter. anon hade full tabellrätt.
--
-- Spärren: en BEFORE INSERT/UPDATE-trigger som avvisar ändringar av de
-- skyddade kolumnerna när den verkställande rollen (current_user) är anon
-- eller authenticated och anroparen inte är admin (public.is_admin()).
-- current_user används i stället för auth.role(): inne i en SECURITY
-- DEFINER-funktion (handle_new_user, komigang_markera m.fl.) är current_user
-- funktionens ägare, så de fungerar som förut, medan auth.role() fortfarande
-- skulle säga authenticated. service_role (admin-klienten, Stripe-webhooken,
-- cronjobben, edge-funktionerna) och postgres berörs inte.
--
-- Två steg, eftersom koden i produktion fram till nästa deploy skriver två
-- saker med användarens session:
--   * stripe_customer_id första gången en kund skapas i checkout-rutterna.
--     Webhooken hittar användaren via den kolumnen, så en spärr före deployen
--     skulle ge betalande kunder utan premium. Steg 1 tillåter därför bara
--     NULL -> värde, aldrig byte eller rensning.
--   * kvoträknarna (weekly_letter_*, weekly_linkedin_*, weekly_analysis_count).
--     De lämnas utanför steg 1 och spärras i steg 2.
-- Steg 2 (20261010190000_profiles_skyddade_kolumner_steg2.sql) körs först när
-- branchen fix/profiles-premium-spärr är deployad, där skrivningarna gjorts
-- med admin-klienten.
--
-- Rollback:
--   drop trigger if exists profiles_skydda_kolumner on public.profiles;
--   drop function if exists public.profiles_skydda_kolumner();
--   grant insert, update, delete on public.profiles to anon;
--   grant truncate, references, trigger on public.profiles to anon, authenticated;

create or replace function public.profiles_skydda_kolumner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  -- Kolumner som bara servern (service_role) eller en admin får ändra.
  skyddade constant text[] := array[
    -- Prenumeration, premium och betalning
    'subscription_tier', 'subscription_status', 'subscription_id',
    'stripe_customer_id', 'price_id', 'current_period_end',
    'premium_until', 'premium_source', 'premium_scope',
    'paket_started_at', 'cancel_at_period_end', 'angerratt_samtycke_at',
    -- Kvoter som ingen klient skriver i dag
    'last_count_reset', 'next_reset_date', 'daily_letter_count', 'last_daily_reset',
    'weekly_analysis_first_used_at', 'weekly_analysis_reset_at', 'last_analysis_reset',
    'weekly_competence_analysis_count', 'weekly_competence_first_used_at',
    'weekly_competence_reset_at', 'last_competence_analysis_reset',
    'free_cv_exports_used', 'guest_invitations_remaining',
    -- Konto, attribution och livscykel
    'email', 'email_verified_at', 'created_at', 'acquisition_source',
    'trial_reminder_sent_at'
  ];
  -- Värden en klient får skicka vid INSERT (kolumnens standardvärde).
  -- Kolumner med tidsstandard (now(), current_date) hoppas över vid INSERT.
  standard constant jsonb := jsonb_build_object(
    'subscription_tier', 'free',
    'cancel_at_period_end', false,
    'weekly_letter_count', 0,
    'daily_letter_count', 0,
    'weekly_analysis_count', 0,
    'weekly_competence_analysis_count', 0,
    'weekly_linkedin_count', 0,
    'free_cv_exports_used', 0,
    'guest_invitations_remaining', 0
  );
  ny jsonb;
  gammal jsonb;
  kol text;
  andrade text[] := '{}';
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  ny := to_jsonb(new);

  if tg_op = 'UPDATE' then
    gammal := to_jsonb(old);
    foreach kol in array skyddade loop
      continue when ny -> kol is not distinct from gammal -> kol;
      -- Steg 1: checkout-rutterna i produktion sparar kund-id:t med
      -- användarens session. Bara NULL -> värde släpps igenom.
      continue when kol = 'stripe_customer_id' and gammal -> kol = 'null'::jsonb;
      andrade := andrade || kol;
    end loop;
  else
    foreach kol in array skyddade loop
      continue when kol in ('created_at', 'last_count_reset', 'last_daily_reset');
      continue when ny -> kol = 'null'::jsonb;
      continue when standard ? kol and ny -> kol = standard -> kol;
      continue when kol = 'email' and ny ->> kol = (auth.jwt() ->> 'email');
      andrade := andrade || kol;
    end loop;
  end if;

  if cardinality(andrade) = 0 then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  raise exception 'Kolumnerna % i profiles kan bara ändras av servern', array_to_string(andrade, ', ')
    using errcode = '42501',
          hint = 'Prenumeration, kvoter och kontouppgifter skrivs av servern med service role.';
end;
$$;

comment on function public.profiles_skydda_kolumner() is
  'Avvisar ändringar av prenumerations-, premium-, kvot- och kontokolumner i profiles från anon/authenticated utom för admin. Steg 1, se migrationen 20261010180000_profiles_skyddade_kolumner.';

revoke all on function public.profiles_skydda_kolumner() from public, anon, authenticated;

drop trigger if exists profiles_skydda_kolumner on public.profiles;
create trigger profiles_skydda_kolumner
  before insert or update on public.profiles
  for each row execute function public.profiles_skydda_kolumner();

-- anon har ingen legitim skrivväg till profiles: registreringen skapar raden
-- i handle_new_user (SECURITY DEFINER) eller auth/callback (service role).
revoke insert, update, delete on public.profiles from anon;

-- TRUNCATE går förbi RLS och används aldrig av klienter.
revoke truncate, references, trigger on public.profiles from anon, authenticated;
