-- Provets testtyp på det anonyma provet och dess utfall (spec-prov-fler-typer
-- avsnitt 5, saas-leads slutliga beslut 5 den 10 november 2026).
--
-- Provet utan konto får fler typer än matrislogik (figurserier, verbalt,
-- numeriskt, deduktivt, spatial förmåga, talserier, ordförråd och I-prov-
-- provet). Varje prov och varje utfall bär typen, så att typernas
-- fördelningar aldrig blandas med matrisens i percentilraden.
--
-- Bara additiv: en kolumn per tabell med standardvärdet 'matris'. Befintliga
-- rader får standardvärdet, inga rader skrivs om, ingen backfyllning, inga
-- villkor eller rättigheter ändras. RLS och rättigheterna på tabellerna står
-- kvar som förut (anon_test_sessions och prov_utfall skrivs bara av servern).
--
-- Inget villkor på värdena: typerna styrs av servern (api/public/test-session),
-- och ett villkor hade krävt drop och återskapande när en ny typ tillkommer.

alter table public.anon_test_sessions
  add column if not exists test_kind text not null default 'matris';

alter table public.prov_utfall
  add column if not exists test_kind text not null default 'matris';

create index if not exists prov_utfall_test_kind_idx on public.prov_utfall (test_kind);

comment on column public.anon_test_sessions.test_kind is
  'Provets typ: matris (standard), figurserie, verbal, numerisk, deduktiv, spatial, talserie, ordforrad, iprov. Sätts av servern vid start.';
comment on column public.prov_utfall.test_kind is
  'Provets typ, samma värden som anon_test_sessions.test_kind. Percentilen läses per typ.';

-- Återställning (kräver ägarens ja i manuellt läge, tar bort data):
--   alter table public.prov_utfall ... och anon_test_sessions ... ta bort kolumnen test_kind.
