# Bank_version 3 för matrisfrågorna: förberedelse, inte påslagen

Datum 2026-10-12. Underlag: granskningen av parti 01 (avsnitt 6 punkt 4 och avsnitt 7), beställningen "svarare frågor" (1.3, noten om befordran).

**Status:** förberedd. `BANK_VERSION` i `src/lib/logicTestV7/selectQuestions.v7.ts` är fortfarande 2, ingen bankfil är ändrad och ingen fråga är pensionerad. Det här dokumentet och listan är underlaget för den separata beställningen som slår på versionen.

## 1. Pensionslistan: 53 expertfrågor

Listan räknas fram av `node scripts/bank-version-3.mjs` och ligger i `bank-version-3-pensioneras.json` bredvid det här dokumentet. `node scripts/bank-version-3.mjs --kontroll` felar om bankerna har ändrats så att listan inte längre stämmer.

Regeln: valbara frågor i de två expertbankerna som är rena rörelser i läsordning (`lasordningsCykel` i `scripts/lib/matris/kontroll.mjs`). Det betyder att varje aktiv regel går i läsordning, eller att familjen är vridning, vandring, mönsterrotation, rotation med byte, två rörelser eller antal som ändras utan summa. Två rörelser på balanslinjen tolkas som latinska kvadrater men är vandringar i läsordning med period 6, därför räknas familjen.

| Familj | Antal | Id |
|---|---|---|
| Mönsterrotation | 24 | v7e-w1 till v7e-w11, v7e-t1, v7e-t4, v7e-t6, v7e-t7, v7e-t8, v7e-t10, v7e-t11, v7e-3c-rot-01 till -06 |
| Två rörelser | 11 | v7e-b1, v7e-b2, v7e-b6, v7e-3c-tva-01 till -08 |
| Rotation med byte | 7 | v7e-3c-byte-01 till -07 |
| Vridning | 4 | v7e-3c-vrid-01 till -04 |
| Vandring | 4 | v7e-3c-vand-01 till -04 |
| Antal som ändras | 3 | v7e-3c-antal-01, -04, -05 |
| **Totalt** | **53** | |

Kvar på expert efter pensioneringen: 30 av 83 valbara (latinska kvadrater 13, överlagring 8, spegling 7, antal som summa 2). Med de 40 plus-frågorna i parti 01 blir expertpoolen 70.

Om antalet: granskningens tabell i 1.2 räknar 54 expertfrågor med facit lika med rutan uppe till vänster. Med exakt jämförelse av cellen är det 46 (grund 60, avancerad 43, expert 46, totalt 149 av 252). Skillnaden ligger troligen i två rörelser på balanslinjen, där rörelsen har period 6 och facit är lika med ruta 3, inte ruta 1; de är cykler men inte genvägen till rutan uppe till vänster. Av de 53 på listan har 45 facit identiskt med rutan uppe till vänster.

## 2. Varför inte `pensionerad: true` i bankfilerna

`pensionerad: true` tar bort frågan ur `VALBARA_EXPERT`, och det är version 2:s pool. Ett klassiskt test räknar om sitt urval ur sessionens id och poolens storlek (Fisher-Yates i `selectFromPool`). Krymper poolen byter alla pågående och avslutade version 2-sessioner frågor på resultatsidan. Pensioneringen måste därför vara knuten till version 3:

- antingen en lista i koden, `PENSIONERAS_V3` (id:n ur JSON-filen), som bara `poolFor(niva, 3)` läser,
- eller ett nytt fält i bankfilen, `pensionerad_fran: 3`, som `arValbar` inte läser.

Rekommendation: listan i koden. Bankfilerna förblir orörda och samma lista används av kontrollskriptet.

## 3. Vad som krävs för att slå på version 3

I den här ordningen, i en egen beställning:

1. **Godkända plus-frågor i en skarp fil.** `src/lib/logicTestV7/questionBankExpertPlus.v7.json` med de godkända frågorna ur kandidatfilen (inget i `src/` får importera ur `kandidater/`). Export `EXPERT_PLUS` i `selectQuestions.v7.ts`.
2. **`selectQuestions.v7.ts`:** `BankVersion = 1 | 2 | 3`; `bankVersion(meta)` läser 3; `poolFor('expert', 3)` = `VALBARA_EXPERT` utan `PENSIONERAS_V3`, plus `EXPERT_PLUS`; grund och avancerad som version 2 tills vidare (avancerad får samma behandling i en senare version). Version 1 och 2 rörs inte. Först därefter `BANK_VERSION = 3`.
3. **Percentilen per version:** `medBankversion` i `fragor.server.ts` och `percentilUnderlag.ts` jämför i dag `=== 2` och annars `is null`. Version 3 måste få egen gren (`eq('meta->>bank_version', '3')`), annars blandas version 3 med version 1. Percentilen börjar om på version 3 (minst 25 sessioner).
4. **Övriga ställen som läser versionen:** `src/app/api/logicTestV4/percentile/route.ts`, `src/app/api/public/test-session/route.ts`, `src/app/api/public/test-session/claim/route.ts`, `src/app/dashboard/tester/prov/[token]/page.tsx`, `src/components/traning/utveckling/data.server.ts` (egen jämförelse per version), `src/lib/logicTestV7/selectProv.v7.ts`.
5. **Passen:** `TRANINGSBANK` i `src/lib/traning/bank.server.ts` drar ur `ALLA_*` utan pensionerade. Passen sparar sitt urval i meta, så listan kan gälla passen från samma dag som version 3 slås på. `hittaTraningsfraga` ska fortsatt hitta alla 53 (gamla sessioner visar dem).
6. **Flytt till grund (kalibreringsregeln 3.4):** en fråga på listan som är kalibrerad med p ≥ 0,56 kopieras till grunds kandidatfil som `v7g-flytt-<gammalt id>` och börjar om på noll; annars försvinner den. Rapporten (`scripts/kalibrering-rapport.mjs`) visar p för de 53 och flaggan `facit_ruta0`.
7. **Tester:** poolstorlekar för version 1 och 2 oförändrade (ögonblicksbild), version 3:s expertpool = 30 + antalet godkända plus-frågor, inga id ur listan i version 3:s pool, ingen kandidatimport.

## 4. När

Granskningen säger: efter kalibreringens första avläsning eller när minst 40 plus-frågor är godkända, det som kommer först. Parti 01 har 40 frågor efter omkörningen (28 godkända, 12 ersättare som väntar på testansvarigs granskning och geometrikontrollen). Beslutet att slå på är testansvarigs och ägarens.
