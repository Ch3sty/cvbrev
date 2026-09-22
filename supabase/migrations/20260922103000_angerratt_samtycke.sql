-- Angerrattssamtycket, docs/plan-paket-och-onboarding.md avsnitt 8.
--
-- Undantaget fran angerratten pa fjorton dagar galler bara om kundens
-- uttryckliga samtycke till att tjansten paborjas direkt ar dokumenterat.
-- Kryssrutan i kassan ar darfor inte klientstate: den foljer med kopet till
-- Stripe som metadata, och webhooken skriver tidsstampeln har nar kopet ar
-- bekraftat. Kolumnen ar sanningen vi kan visa upp vid en tvist.
--
-- Null betyder att kontot aldrig lamnat ett samtycke, alltsa ocksa varje
-- konto som kopte fore den har raden. Filen ar idempotent.

alter table public.profiles
  add column if not exists angerratt_samtycke_at timestamptz;

comment on column public.profiles.angerratt_samtycke_at is
  'Tidpunkt da kunden kryssade i angerrattssamtycket vid kop. Null = inget samtycke lamnat. Sjalva texten ligger pa Stripe-sessionens metadata (angerratt_samtycke_text).';
