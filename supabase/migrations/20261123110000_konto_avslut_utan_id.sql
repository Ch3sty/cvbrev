-- Avslutsstatistiken utan radnummer (ägarens ja 2026-11-22).
--
-- Policyn säger att raden "aldrig innehåller något id". Tabellen hade ett
-- slumpat radnummer (primärnyckel) som inte pekade på kontot men som strängt
-- taget var ett id. Ingen kod läser eller skriver kolumnen: skrivningen i
-- raderaKonto.server.ts anger aldrig id, och läsningen i
-- src/app/admin/anvandare/avslut.ts sorterar på de lästa kolumnerna.
--
-- KÖRD i produktionen 2026-11-22, efter att koden som inte sorterar på id
-- var driftsatt (ed28142d). Kontrollerat: kolumnen är borta, RLS på, adminens
-- läsning går igenom, och en rad går att skriva utan id (prövat i en
-- transaktion som rullades tillbaka). Tabellen hade noll rader.

alter table public.konto_avslut drop column if exists id;

notify pgrst, 'reload schema';
