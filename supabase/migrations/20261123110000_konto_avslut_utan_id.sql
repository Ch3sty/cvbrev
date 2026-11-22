-- Avslutsstatistiken utan radnummer (ägarens ja 2026-11-22).
--
-- Policyn säger att raden "aldrig innehåller något id". Tabellen hade ett
-- slumpat radnummer (primärnyckel) som inte pekade på kontot men som strängt
-- taget var ett id. Ingen kod läser eller skriver kolumnen: skrivningen i
-- raderaKonto.server.ts anger aldrig id, och läsningen i
-- src/app/admin/anvandare/avslut.ts sorterar på de lästa kolumnerna.
--
-- KÖRS FÖRST NÄR koden som inte längre sorterar på id är driftsatt.

alter table public.konto_avslut drop column if exists id;

notify pgrst, 'reload schema';
