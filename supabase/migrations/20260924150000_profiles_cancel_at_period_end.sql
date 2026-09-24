-- Uppsagt paket (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 5).
--
-- Stripe håller prenumerationen aktiv till periodens slut efter en
-- uppsägning, med cancel_at_period_end = true. Flaggan fanns bara hos Stripe,
-- så menyn och prenumerationssidan sa "Förnyas 1 oktober" om ett paket som
-- inte skulle förnyas. Webhooken speglar nu flaggan hit vid varje
-- customer.subscription.*-event.
--
-- Bara en ny kolumn med standardvärde. Inget tas bort.

alter table public.profiles
  add column if not exists cancel_at_period_end boolean not null default false;

comment on column public.profiles.cancel_at_period_end is
  'Speglar Stripes subscription.cancel_at_period_end. Sann när paketet är uppsagt men gäller till current_period_end.';
