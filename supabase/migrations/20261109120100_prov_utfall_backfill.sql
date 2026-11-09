-- Backfill av prov_utfall från de avslutade proven i anon_test_sessions
-- (plan-efter-analys punkt 30).
--
-- Idempotent: spara_prov_utfall() skriver bara prov som saknar
-- meta.utfall_sparat och sätter flaggan i samma transaktion. Den kan köras
-- igen, till exempel efter deployen för prov som rättades mellan
-- migreringen och att koden gick live, utan att något räknas två gånger.
-- Ägaren och testkontona undantas av funktionen.

select count(*) filter (where sparad) as nya_rader
from (
  select public.spara_prov_utfall(token) as sparad
  from public.anon_test_sessions
  where score is not null
  order by created_at
) t;
