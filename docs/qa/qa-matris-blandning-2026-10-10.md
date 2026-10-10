# Klicktest: blandade svarsalternativ i matrislogiken

Branch `fix/matris-blanda-alternativ`, 2026-10-10. Riktig Chrome (puppeteer-core mot systemets Chrome), Pixel 7 och desktop, skärmdump per steg i `docs/qa/matris-blandning/`. Rådata i `docs/qa/matris-blandning/resultat.jsonl` och `fore-migreringen/resultat.jsonl`.

## Förutsättning: migreringen är inte körd

`meta`-kolumnen (migreringen `20261010200000_alternativ_blandade.sql`) finns inte i produktionsdatabasen, och den får inte köras av agenten. Därför kördes två servrar mot samma databas:

- **A, blandad väg:** `next dev` med `QA_BLANDA_ALLA_SESSIONER=1`, som behandlar varje session som om flaggan vore satt. Variabeln verkar bara när `NODE_ENV=development` och kan inte slås på i ett produktionsbygge.
- **B, före migreringen:** produktionsbygget (`.next-m`, `next start`) utan variabeln. Visar hur koden beter sig om den deployas före migreringen, och hur gamla sessioner visas.

Skriptet räknar själv fram var rätt svar ska stå ur sessionId (samma urval och samma blandning som appen, `scripts/lib/blanda-alternativ.mjs`), klickar där och kontrollerar mot servern och databasen. Om vyn inte visat den blandade ordningen hade klicken gett fel.

Efter migreringen bör samma körning göras om mot ett produktionsbygge utan variabeln: `node scripts/qa-matris-blandning.mjs test grund pixel7 a` och så vidare.

## Resultat, server A (blandad)

| Körning | Rätt svar per fråga (position) | Omladdning | Databasen | Poäng | Genomgången |
|---|---|---|---|---|---|
| grund, desktop, konto A | FDEFACBCFADAFDA | samma fråga 4, samma ordning, fråga 1 kvar på F | selected = original, visat = klick | 14 av 15 | fråga 1 Rätt (F), fråga 4 Fel: ditt A, rätt F |
| grund, Pixel 7, konto B | FCABACAEAECEEFD | samma, fråga 1 kvar på F | ok | 14 av 15 | fråga 4: ditt C, rätt B |
| expert, Pixel 7, konto B | AEEDDDADCFEBDAF | samma, fråga 1 kvar på A | ok | 14 av 15 | fråga 4: ditt E, rätt D |
| expert, desktop, konto A | ECEBBEBBFAEBAAE | samma, fråga 1 kvar på E | ok | 14 av 15 | fråga 4: ditt C, rätt B |
| smakprov anonymt, Pixel 7 | FEAAC | | answers [0,0,0,3,1] = originalindex för klicken FEABD | 3 av 5 | |
| smakprov anonymt, desktop | BFFBB | | answers [0,0,0,1,3] för klicken BFFCC | 3 av 5 | |

Ordningen skiljer sig mellan kontona. Grundsessionerna för konto A och B delade åtta frågor och expertsessionerna nio; i alla sjutton var rutorna desamma men ordningen olika (jämfört med avtryck av varje ruta).

Inga konsolfel, inga 4xx/5xx.

## Resultat, server B (produktionsbygge, före migreringen)

- **Gammal avslutad session** (skapad i det gamla formatet, utan meta och utan `visat`, 10 rätt på A och 5 fel på B): resultatsidan visar fråga 1 Rätt, rätt svar A, och fråga 11 Fel, ditt svar B, rätt svar A. Desktop och Pixel 7.
- **Gammal pågående session** (C och E sparade): öppnas på fråga 3, fråga 1 står kvar på C och fråga 2 på E. Ett nytt svar lagras i bankens ordning (selected = visat = 0, rätt).
- **Ny session före migreringen:** servern loggar att kolumnen saknas och skapar sessionen oblandad. Rätt svar står på A i alla 15 frågor, som före fixen; omladdning, poäng (14 av 15) och genomgång stämmer. Testet går alltså inte sönder om koden deployas före migreringen, men det blandar inte heller.

## Städning

Två konton (`qa-matris-a-2026-10-10@jobbcoach-qa.test`, `qa-matris-b-…`) och två anonyma prov. Raderat via user_id och token, räknat före delete: logic_test_v4_sessions 5 + 5, user_activities 36 + 34, premium_grants 1 + 1, profiles 1 + 1, anon_test_sessions 2. Kontroll efteråt: 0 användare, 0 prov kvar. Raderna i public_rate_limits för den lokala IP-adressen (scope anon_test) ligger kvar och går ut av sig själva.
