# Kontrakt: kalibreringsfrågan och svarsdatan

Datum 2026-10-11. Gäller omgång 1 (mekanismen för kalibreringsfrågan) och beställningen "svarare frågor" (hur datan samlas och läses). Samma text står som kommentar i `src/lib/traning/motor.server.ts` ovanför bygget av `statistik`.

## Sessionen

- `meta.kalibrering = { q_id: string, index: number }` när ett pass eller ett övningsprov har en kalibreringsfråga. `index` är frågans plats i sessionen.
- Kalibreringsfrågan står inte i `meta.fragor` (passets ordinarie urval) och aldrig i `meta.upprepade`.

## Svarsraden

- Samma form som övriga svar i `answers`: `q_id, selected, visat, correct, time_spent, tiden_ute`, plus `kalibrering: true`.

## Vid avslut

- Kalibreringssvaret ingår **inte** i `nivaSvar`, tempot eller familjerna.
- Det ingår **alltid** i `p_statistik` när sessionen är blandad, med `typ: 'kalibrering'`.
- Ordinarie svar får `typ` = `meta.typ` (`matning`, `pass`, `riktat`, `ommatning`, `general`).
- Svar på frågor i `meta.upprepade` skickas fortfarande inte.

## I databasen

- `uppdatera_fraga_statistik` räknar `typ` i den nya kolumnen `fraga_statistik.per_typ` (migreringen `supabase/migrations/20261012090000_fraga_kalibrering.sql`). Saknas `typ` räknas svaret som `okand`.
- `fraga_kalibrering_vy` läser råsvaren ur `logic_test_v4_sessions`: bara blandade, avslutade sessioner, undantagna konton borta, "Vet inte" borta, upprepade borta. Typen per rad är `kalibrering` när raden har `kalibrering: true`, annars `meta.typ`, annars `klassisk` (nivåtesten utan `meta.typ`).
- `fraga_statistik` förblir motorns källa för p (`pForFraga`, 30 svar). Vyn är kalibreringens sanning och underlaget för flyttar (`scripts/kalibrering-rapport.mjs`). För frågor utan kalibreringssvar ska vyns `svar` och `ratt` vara lika med `fraga_statistik.antal` och `.ratt`; en avvikelse är ett fel i kontraktet.

## Namn som inte får dubbleras

- Händelsen `kalibreringsfraga_svarad` med `fraga_id` är omgång 1:s.

## Status

Migreringen är skriven, inte körd. `uppdatera_fraga_statistik` i prod är oförändrad tills ägaren säger ja.
