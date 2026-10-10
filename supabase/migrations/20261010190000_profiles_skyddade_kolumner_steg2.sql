-- Spärr mot självbetjänad premium i public.profiles, steg 2.
--
-- KÖRS FÖRST NÄR branchen fix/profiles-premium-spärr ÄR DEPLOYAD.
-- Där skriver checkout-rutterna stripe_customer_id och brev-, LinkedIn- och
-- CV-analysrutterna kvoträknarna med admin-klienten. Körs den före deployen
-- sparas inga nya Stripe-kund-id:n (webhooken hittar då inte köparen) och
-- gratiskvoterna slutar räknas upp.
--
-- Skillnad mot steg 1:
--   * stripe_customer_id spärras helt (även NULL -> värde).
--   * Kvoträknarna och deras fönster läggs till: weekly_letter_count,
--     weekly_letter_first_used_at, weekly_letter_reset_at,
--     weekly_analysis_count, weekly_linkedin_count,
--     weekly_linkedin_first_used_at, weekly_linkedin_reset_at.
--     Annars kan en gratisanvändare nollställa sin egen kvot via PostgREST.
--
-- Rollback till steg 1: kör om funktionsdefinitionen i
-- 20261010180000_profiles_skyddade_kolumner.sql.

create or replace function public.profiles_skydda_kolumner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  skyddade constant text[] := array[
    -- Prenumeration, premium och betalning
    'subscription_tier', 'subscription_status', 'subscription_id',
    'stripe_customer_id', 'price_id', 'current_period_end',
    'premium_until', 'premium_source', 'premium_scope',
    'paket_started_at', 'cancel_at_period_end', 'angerratt_samtycke_at',
    -- Kvoter och deras fönster
    'weekly_letter_count', 'weekly_letter_first_used_at', 'weekly_letter_reset_at',
    'last_count_reset', 'next_reset_date', 'daily_letter_count', 'last_daily_reset',
    'weekly_analysis_count', 'weekly_analysis_first_used_at', 'weekly_analysis_reset_at',
    'last_analysis_reset',
    'weekly_competence_analysis_count', 'weekly_competence_first_used_at',
    'weekly_competence_reset_at', 'last_competence_analysis_reset',
    'weekly_linkedin_count', 'weekly_linkedin_first_used_at', 'weekly_linkedin_reset_at',
    'free_cv_exports_used', 'guest_invitations_remaining',
    -- Konto, attribution och livscykel
    'email', 'email_verified_at', 'created_at', 'acquisition_source',
    'trial_reminder_sent_at'
  ];
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
  'Avvisar ändringar av prenumerations-, premium-, kvot- och kontokolumner i profiles från anon/authenticated utom för admin. Steg 2, se migrationen 20261010190000_profiles_skyddade_kolumner_steg2.';
