# Talserier omgång 2: 100 nya uppgifter (bankversion 3)

Datum 2026-11-19. Samma arbetssätt som omgång 1 (`talserier-2026-11-19.md`) och med granskningens fynd inbyggda i generatorn (`talserier-2026-11-19-granskning.md`). Uppgifterna ligger i bankerna med `fran_version: 3`, men **versionen är inte påslagen**: `TALSERIE_VERSION` är fortfarande 2, så ingen session drar de nya raderna förrän de är granskade och aktiverade.

## Antal per nivå

| Nivå | Nya | Pool i version 2 | Pool i version 3 |
|---|---|---|---|
| Grund | 34 | 106 | 138 (två pensionerade) |
| Avancerad | 33 | 105 | 135 (tre pensionerade) |
| Expert | 33 | 103 | 133 (tre pensionerade) |

## Ny variation

Omgång 1 fyllde de flesta reglerna i de gamla familjerna (TS8 tillåter samma regel högst två gånger per nivå). Den här omgången lägger därför till nya regeltyper inom de åtta familjerna, så att namnen i "Var du tappar" (`src/lib/tester/steg2/namn.ts`) fortfarande stämmer och ingen kod utanför talseriebanken behöver ändras.

| Nivå | Familj | Nya | Olika regler | Ny regeltyp |
|---|---|---|---|---|
| Grund | växelvis | 14 | 14 | tre steg som turas om (−2, +3, +9, och sedan samma tre igen) |
| Grund | andra ordningen | 11 | 8 | krympande steg (+16, +14, +12 ...) |
| Grund | aritmetisk | 7 | 7 | steg som inte redan fanns två gånger (3, 9, 14, −4, −12, −13, −16) |
| Grund | geometrisk | 2 | 1 | hälften av det förra, med typade fel som håller sig nära facit |
| Avancerad | växelvis | 7 | 7 | tre steg som turas om, större tal |
| Avancerad | varvad | 7 | 7 | båda delserierna åt samma håll |
| Avancerad | geometrisk differens | 6 | 4 | steget halveras för varje tal (+128, +64, +32 ...) |
| Avancerad | ×k + c | 7 | 7 | två räknesätt turas om (gånger 2, sedan minus 9) |
| Avancerad | andra ordningen | 6 | 5 | differensserie av andra ordningen: skillnaden mellan stegen växer jämnt (stegen +1, +3, +6, +10) |
| Expert | andra ordningen | 9 | 9 | samma som avancerad men med negativa tal och krympande skillnad |
| Expert | varvad | 8 | 8 | två geometriska delserier med olika kvot (till exempel ×3 och ×(−3)) eller kvoten −2 mot en aritmetisk |
| Expert | ×k + c | 9 | 9 | två räknesätt turas om, även gånger −2, −3 och 4 |
| Expert | summa | 7 | 5 | summan plus eller minus 6, 7 och 8 |

Andra ordningen är ny på avancerad (förut bara grund och expert). Alla rader med tre steg som turas om eller med växande skillnad mellan stegen visar sex tal, så att regeln syns mer än en gång. Regeltexterna skriver ut stegen, till exempel "Stegen är +1, +3, +6, +10 och så vidare. Skillnaden mellan två steg växer med 1 varje gång (+2, +3, +4)." och "Två räknesätt turas om: plus 7, sedan gånger 2, och så vidare."

Svårighet och `p_prior` räknas som i omgång 1, plus ett tillägg för de svårare regeltyperna: tre steg i tur och tredje ordningen får ett steg högre svårighet (högst 4) och lägre `p_prior` (−0,05 och −0,06), halveringen på grund likaså. Statistiken får avgöra.

## Granskningens fynd, inbyggda

- **Förskjutna dubbletter (punkt 1 till 4 och 6).** Generatorn tar bara en rad som inte delar fyra tal i följd (facit inräknat) med någon annan rad i bankerna, pensionerade inräknade, eller i artiklarnas uppgifter (V7). Fem kandidater på grund och en på avancerad föll på det.
- **Version 1-paren (punkt 6) pensioneras från version 3:** ts-e-affin-16 (kopia av ts-a-affin-02), ts-a-affin-08 (av ts-a-affin-03), ts-a-affin-06 (av ts-a-geod-04), ts-e-affin-14 (av ts-a-affin-11), ts-a-affin-16 (av ts-a-affin-13), ts-e-affin-06 (av ts-e-affin-01), ts-g-andra-09 (av ts-g-andra-07) och ts-g-vaxel-09 (av ts-g-vaxel-08). De har `pensionerad_fran: 3`, så version 1 och 2 drar dem som förut. Därmed har verifieraren inga kända par kvar.
- **Distraktorer nära facit på grund (punkt 7).** Varje alternativ på grund ligger inom två gånger radens största steg från facit. En kandidat som inte fick fyra sådana typade fel ströks.
- **Upprepade tal (punkt 11).** Ingen ny rad visar samma tal två gånger.
- **Regeltexter (punkt 10).** Halveringen säger "Steget halveras för varje tal", växande steg skrivs ut med stegen i stället för "gånger större".
- **Geometrisk på grund (punkt 12).** Halveringen fick två nya typade fel (dra bort en fjärdedel, dela med åtta), så två rader med "hälften" ryms. En tredjedel och en och en halv gånger går inte under taket 400 med heltal hela vägen; att höja taket är ett beslut för testansvarig.

## Verifieringen

1. **Lösaren** (`scripts/lib/talserie/losare.mjs`, spärr TS1) har två nya regler: tre steg som turas om och polynom av grad tre. Hela banken, version 1 och 2 inräknade, och artiklarnas 49 uppgifter klarar fortfarande TS1 med de nya reglerna.
2. **Den oberoende verifieraren** (`scripts/talserier-verifiera.mjs`) räknar de nya regeltyperna ur `params` med egen kod, prövar polynom av grad tre som en fullvärdig alternativ regel (förut bara en varning), läser bågen ×(−2) och kontrollerar att regeltexten nämner stegen. V7 räknar ett par i version 1 som åtgärdat när ena raden är pensionerad.
3. **Generatorn** `scripts/gen-talserier-v3.mjs` lägger bara till sist i bankerna, vägrar köra när version 3 finns och tar bara en uppgift som klarar TS1 till TS10, verifieraren utan fel och varningar, V7, närhetskravet på grund och "inget upprepat tal". `scripts/lib/talserie/generera.mjs` har de nya varianterna och nio nya misstagstexter; alla 316 gamla uppgifter byggs om identiskt (rad, bågar, regelnyckel, regeltext i version 1).
4. **Körningar efter tillägget:**
   - `node scripts/talserier-verifiera.mjs`: 416 uppgifter, 0 fel, 0 varningar (V7: tio par i version 1 åtgärdade genom pensionering)
   - `node scripts/talserier-verifiera.mjs --version 3`: 100 uppgifter, 0 fel, 0 varningar
   - `node scripts/validate-talserier.mjs`: klarar TS1 till TS10
   - `node scripts/artikel-steg2-check.mjs`: artiklarnas 49 uppgifter klarar spärrarna
   - vitest (`--exclude ".claude/**"`): `src/lib/talserierV1/__tests__/` (spärrarna, `version2.test.ts` och nya `version3.test.ts`), `src/lib/tester/steg2/__tests__/`, `steg2-niva.test.ts`, `traningsmejl.test.ts`, `TestBredd.test.tsx`, `TypMenyPanel.test.tsx` och `grundkvot.test.ts`, 120 tester gröna
   - `npx tsc --noEmit -p .`: inga fel i talseriefilerna

Facits plats i den sorterade listan i version 3-poolen (TS10, högst 35 procent): grund 22, 26, 37, 33, 20 av 138; avancerad 25, 29, 30, 27, 24 av 135; expert 28, 26, 27, 27, 25 av 133.

## Aktivering, efter granskning

1. Sätt `TALSERIE_VERSION = 3` i `src/lib/talserierV1/select.ts`. Nya nivåtest får `talserie_version: 3` i meta, startade sessioner behåller sin version och sitt urval. Pass och I-prov drar ur `poolFor(niva)` och får de nya raderna direkt.
2. Flytta påståendet `expect(TALSERIE_VERSION).toBe(2)` i `version2.test.ts` till `version3.test.ts` som `toBe(3)`. Inget annat test låser konstanten.
3. Kör inte `gen-talserier.mjs` eller `gen-talserier-v2.mjs` igen (den första skriver om bankerna från början, den andra vägrar). Fler uppgifter läggs till med `fran_version: 4`.

Om granskningen vill byta enstaka rader görs det före aktiveringen, på samma sätt som `scripts/talserier-v2-granskning.mjs` gjorde i omgång 1 (samma id och familj, nya parametrar, aldrig visade).

## Id

Grund
- växelvis: ts-g-vaxel-36 till ts-g-vaxel-49 (14)
- andra ordningen: ts-g-andra-35 till ts-g-andra-45 (11)
- aritmetisk: ts-g-arit-35 till ts-g-arit-41 (7)
- geometrisk: ts-g-geom-04 och ts-g-geom-05 (2)

Avancerad
- växelvis: ts-a-vaxel-30 till ts-a-vaxel-36 (7)
- varvad: ts-a-varv-31 till ts-a-varv-37 (7)
- geometrisk differens: ts-a-geod-17 till ts-a-geod-22 (6)
- ×k + c: ts-a-affin-31 till ts-a-affin-37 (7)
- andra ordningen: ts-a-andra-01 till ts-a-andra-06 (6)

Expert
- andra ordningen: ts-e-andra-28 till ts-e-andra-36 (9)
- varvad: ts-e-varv-29 till ts-e-varv-36 (8)
- ×k + c: ts-e-affin-29 till ts-e-affin-37 (9)
- summa: ts-e-summa-23 till ts-e-summa-29 (7)

Numreringen fortsätter där version 2 slutar i varje familj, så inget id har använts tidigare.

## Efter granskningen

Testansvarig godkände med villkor (`talserier-2026-11-19-omg2-granskning.md`). Åtgärderna gjordes med `scripts/talserier-v3-granskning.mjs`, en gång och före aktiveringen:

1. **ts-e-andra-32** hade samma stegföljd som ts-a-andra-02 (raden minus 84). Samma id och familj, nya parametrar: nu −64, −74, −87, −102, −118, −134 (facit −149 och −162), stegen −10, −13, −15, −16, −16 och skillnaden växer med 1. Inget tal upprepas, facit inräknat, och "konstant −16" (−150 och −166) finns inte bland alternativen.
2. **Regeltexterna i ts-a-andra-01 och ts-a-andra-05** listar alla fem visade steg: "Stegen är +2, +2, +4, +8, +14 och så vidare." och "Stegen är +1, +1, +2, +4, +7 och så vidare." Generatorn skriver fem steg för tredje ordningen från och med nu.
3. **Ny spärr V8, samma stegföljd.** Verifieraren (`sammaStegPar`, `harSammaSteg`) fäller en rad från bankversion 3 eller senare som delar fyra eller fler steg i följd med någon annan rad, oavsett startvärde, på alla nivåer och i alla banker, även samma nivå. Generatorn `gen-talserier-v3.mjs` och granskningsskriptet använder samma kontroll. De par testansvarig redan godkänt (granskningen punkt 4 och 5, 26 par) står i `GODKANDA_STEGPAR` och rörs inte; nya par får inte läggas till där.

Körningar efter åtgärderna: verifieraren 416 uppgifter, 0 fel, 0 varningar (och 100, 0, 0 med `--version 3`), `validate-talserier.mjs` klarar TS1 till TS10, `artikel-steg2-check.mjs` grönt, vitest 121 tester gröna, tsc utan fel i talseriefilerna.

Aktiveringen (`TALSERIE_VERSION = 3` och versionspinnen flyttad från `version2.test.ts` till `version3.test.ts`) är inte gjord i den här arbetskopian; se "Aktivering, efter granskning" ovan.
