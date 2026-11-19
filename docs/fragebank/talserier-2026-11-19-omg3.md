# Talserier omgång 3: 100 nya uppgifter (bankversion 4)

Datum 2026-11-19. Samma arbetssätt som omgång 2 (`talserier-2026-11-19-omg2.md`), med önskemålen från granskningen av omgång 2 (`talserier-2026-11-19-omg2-granskning.md`) inbyggda. Uppgifterna ligger i bankerna med `fran_version: 4`, men **versionen är inte påslagen**: `TALSERIE_VERSION` är fortfarande 3, så ingen session drar de nya raderna förrän de är granskade och aktiverade. Inget pensioneras i den här omgången, så version 1 till 3 drar exakt samma urval som förut.

## Antal per nivå

| Nivå | Nya | Pool i version 3 | Pool i version 4 |
|---|---|---|---|
| Grund | 34 | 138 | 172 |
| Avancerad | 33 | 135 | 168 |
| Expert | 33 | 133 | 166 |

## Vad granskningen bad om och vad vi gjorde

**Grund väger över mot geometrisk.** 14 av 34 nya grundrader är geometriska, mot 4 växelvis. Geometrisk går från 5 till 19 i grundpoolen, växelvis från 48 till 52. Taket 400 står kvar. Under det taket ryms ingen ny rad med samma kvot hela vägen (gånger 2, gånger 3 och hälften är fulla enligt TS8, och 243 → 1 fick inte fyra typade fel nära facit). Den nya regeltypen är därför två räknesätt som turas om, alla tal heltal under 400:

- gånger 2 och gånger 3 (1 2 6 12 36 → 72)
- gånger 3 och delat med 2 eller 4, gånger 2 eller 4 och delat med 3, gånger 5 och delat med 2 (64 32 96 48 144 72 → 216)

Regeltexten skriver ut båda: "Två räknesätt turas om: delat med 2, sedan gånger 3, och så vidare." Bågarna visar ×3 och ÷2. Fyra nya typade fel: fel räknesätt i turordningen, båda räknesätten i samma steg, multiplicerade där serien delar, och rätt räknesätt men fel tal (delat med 3 i stället för 2).

**Gånger 1,5 på avancerad.** En ren serie med gånger 1,5 går inte på avancerad: åtta tal i följd kräver att starttalet är delbart med 128, och då hamnar raden över 500. Gånger 1,5 kommer därför in på två sätt:

- varvad: ena delserien går gånger 1,5 (fyra tal, till exempel 32, 48, 72, 108), den andra plus eller minus (8 rader, ts-a-varv-38 till 45)
- ×k + c: gånger 1,5 turas om med ett tillägg, till exempel "minus 4, sedan gånger 1,5" (5 rader: ts-a-affin-39, 40, 43, 44, 46)

Talen skrivs med decimalkomma ("gånger 1,5", bågen ×1,5), och verifieraren läser det.

**Tredje ordningen på expert.** 9 rader (ts-e-andra-37 till 45), alla med sex visade tal och alltså fem visade steg, och regeltexten listar alla fem. Villkoret "inget alternativ som stämmer med en enklare läsning" är nu en spärr, V9 i verifieraren, för tredje ordningen från bankversion 4: inget alternativ får vara samma steg som sist (båda luckorna), steget ändrat lika mycket som sist, eller rätt första tal följt av någon av de två läsningarna. Generatorn tar bort de typerna innan alternativen väljs. Exempel: ts-e-andra-45 har stegen +6, +10, +13, +15, +16 och facit 202/217. "Samma steg som sist" ger 202/218, och 218 finns inte bland alternativen.

**Taket 400 på grund står kvar.** Ingen ändring.

## Fördelning

| Nivå | Familj | Nya | Olika regler | Vad som är nytt |
|---|---|---|---|---|
| Grund | geometrisk | 14 | 9 | två räknesätt som turas om (se ovan) |
| Grund | aritmetisk | 8 | 8 | steg som ingen rad i bankerna har haft: 10, 16, 17, 18, −15, −17, −18, −19 |
| Grund | andra ordningen | 8 | 8 | steget växer med 4 eller 5, eller krymper med 3 |
| Grund | växelvis | 4 | 4 | tre steg som turas om, nya stegföljder |
| Avancerad | varvad | 8 | 8 | en delserie gånger 1,5 |
| Avancerad | ×k + c | 10 | 9 | gånger 1,5 i tur med ett tillägg (5), gånger 2, 3 och −2 i tur med nya tillägg (5) |
| Avancerad | geometrisk differens | 4 | 4 | steget halveras och byter tecken (−64, +32, −16 ...), och halvering från 192 |
| Avancerad | andra ordningen | 6 | 6 | vanlig andra ordningen: steget ändras lika mycket varje gång (växer eller krymper med 5 till 7) |
| Avancerad | växelvis | 5 | 5 | tre steg som turas om, nya stegföljder |
| Expert | andra ordningen | 9 | 9 | tredje ordningen med V9 |
| Expert | varvad | 8 | 8 | två geometriska delserier (×2 mot ×(−3), ×(−2) mot ×3 ...) eller en geometrisk mot en aritmetisk |
| Expert | ×k + c | 9 | 9 | två räknesätt som turas om, gånger −2, −3 och 3 med nya tillägg |
| Expert | summa | 7 | 5 | summan plus 7, 9, 10, 11 eller minus 10 |

Steget som dubblas och byter tecken (+3, −6, +12 ...) togs inte med i geometrisk differens: det är samma regel som gånger −2 plus c, som redan står i banken som ×k + c, och V8 fäller den därför nästan alltid.

Svårighet och `p_prior` räknas som i omgång 2. Tillägg: två räknesätt i tur på grund ett steg högre svårighet och −0,08 (svårighet 2, `p_prior` 0,73), gånger 1,5 i varvad −0,02 och i ×k + c −0,01 (i stället för +0,02 som andra räknesätt i tur), steget som byter tecken −0,03, tredje ordningen som förut (svårighet 4, `p_prior` 0,30). Statistiken får avgöra.

Facits plats i den sorterade listan i version 4-poolen (TS10, högst 35 procent): grund 27, 32, 46, 41, 26 av 172; avancerad 33, 35, 35, 35, 30 av 168; expert 35, 33, 34, 34, 30 av 166.

## Verifieringen

1. **Generatorn** `scripts/gen-talserier-v4.mjs` lägger bara till sist i bankerna, vägrar köra när version 4 finns och tar bara en uppgift som klarar TS1 till TS10, verifieraren utan fel och varningar, V7 (fyra tal i följd), V8 (samma stegföljd med annat startvärde, alla nivåer, även samma nivå), V9, "inget upprepat tal" och närhetskravet på grund (alla alternativ inom två gånger radens största steg från facit).
2. **Generatorbiblioteket** `scripts/lib/talserie/generera.mjs` har de nya varianterna (två kvoter i tur, steget som byter tecken, decimalkomma) och åtta nya misstagstexter. Talet efter luckorna behöver inte längre vara ett heltal; då faller bara distraktorn "ett steg för långt" bort. Alla 416 gamla uppgifter byggs om identiskt (rad, bågar, regelnyckel).
3. **Den oberoende verifieraren** `scripts/talserier-verifiera.mjs` räknar två kvoter i tur ur `params` med egen kod, läser bågen ×1,5 och decimalkomma i regeltexten, kontrollerar att regeltexten för steget som byter tecken säger det, och har den nya spärren V9. Lösaren (TS1) behövde ingen ändring: två kvoter i tur fångas av regeln för två operationer i tur.
4. **Körningar efter tillägget:**
   - `node scripts/talserier-verifiera.mjs`: 516 uppgifter, 0 fel, 0 varningar (V7: tio par i version 1 åtgärdade genom pensionering, som förut)
   - `node scripts/talserier-verifiera.mjs --version 4`: 100 uppgifter, 0 fel, 0 varningar
   - `node scripts/validate-talserier.mjs`: klarar TS1 till TS10
   - `node scripts/artikel-steg2-check.mjs`: artiklarnas 49 uppgifter klarar spärrarna och finns inte i bankerna
   - vitest (`--exclude ".claude/**"`): `src/lib/talserierV1/__tests__/` (spärrarna, `version2`, `version3` och nya `version4.test.ts`), `src/lib/tester/steg2/__tests__/`, `steg2-niva.test.ts`, `traningsmejl.test.ts`, `TestBredd.test.tsx`, `TypMenyPanel.test.tsx` och `grundkvot.test.ts`, 130 tester gröna
   - `npx tsc --noEmit -p .`: inga fel
   - Provaktivering (TALSERIE_VERSION 4 tillfälligt, sedan tillbaka): samma körning ger bara felet i versionspinnen `version 3 är påslagen`, alltså det som steg 2 nedan flyttar.

## Aktivering, efter granskning

1. I `src/lib/talserierV1/select.ts`: byt `export const TALSERIE_VERSION = 3;` mot `export const TALSERIE_VERSION = 4;`. Nya nivåtest får `talserie_version: 4` i meta, startade sessioner behåller sin version och sitt urval. Pass och I-prov drar ur `poolFor(niva)` och får de nya raderna direkt.
2. Flytta versionspinnen från `version3.test.ts` till `version4.test.ts`:
   - I `src/lib/talserierV1/__tests__/version3.test.ts`, ta bort
     ```ts
       it('version 3 är påslagen', () => {
         expect(TALSERIE_VERSION).toBe(3)
       })
     ```
     och ta bort `TALSERIE_VERSION` ur importen: `import { valjTalserier, poolFor, allaTalserier, MAX_PER_FAMILJ } from '../select'`.
   - I `src/lib/talserierV1/__tests__/version4.test.ts`, byt importen mot `import { valjTalserier, poolFor, allaTalserier, MAX_PER_FAMILJ, TALSERIE_VERSION } from '../select'` och lägg först i `describe`:
     ```ts
       it('version 4 är påslagen', () => {
         expect(TALSERIE_VERSION).toBe(4)
       })
     ```
   Inget annat test låser konstanten.
3. Kör inte `gen-talserier.mjs`, `gen-talserier-v2.mjs`, `gen-talserier-v3.mjs` eller `gen-talserier-v4.mjs` igen (den första skriver om bankerna från början, de andra vägrar). Fler uppgifter läggs till med `fran_version: 5`.

Om granskningen vill byta enstaka rader görs det före aktiveringen, som i `scripts/talserier-v3-granskning.mjs`: samma id och familj, nya parametrar, aldrig visade, och kör V7, V8 och V9 igen efter bytet.

## Att titta på i granskningen

- **Namnet i "Var du tappar".** Geometrisk heter "Gånger samma tal" i `src/lib/tester/steg2/namn.ts`. För två räknesätt i tur stämmer det inte ordagrant. Namnfilen ligger utanför talseriebanken och är inte ändrad; byt till exempel till "Gånger och delat" om testansvarig vill.
- **Gånger 4 och delat med 4 på grund** (ts-g-geom-06, 07, 11, 13, 19). Tal som 320 → 80 → 240 är huvudräkning, men inget tal går över 400. Om det känns som räknefärdighet mer än mönster kan de bytas mot gånger 2 och 3.
- **Regeltexterna i version 3.** Åtta rader med tredje ordningen från omgång 2 (ts-a-andra-02 till 04 och 06, ts-e-andra-28 till 31 och 33 till 36) listar fyra steg, inte fem. Granskningen bad bara om ändring i ts-a-andra-01 och 05, så de är orörda; generatorn skriver fem steg för alla nya rader.

## Id

Grund
- geometrisk: ts-g-geom-06 till ts-g-geom-19 (14)
- aritmetisk: ts-g-arit-42 till ts-g-arit-49 (8)
- andra ordningen: ts-g-andra-46 till ts-g-andra-53 (8)
- växelvis: ts-g-vaxel-50 till ts-g-vaxel-53 (4)

Avancerad
- varvad: ts-a-varv-38 till ts-a-varv-45 (8)
- ×k + c: ts-a-affin-38 till ts-a-affin-47 (10)
- geometrisk differens: ts-a-geod-23 till ts-a-geod-26 (4)
- andra ordningen: ts-a-andra-07 till ts-a-andra-12 (6)
- växelvis: ts-a-vaxel-37 till ts-a-vaxel-41 (5)

Expert
- andra ordningen: ts-e-andra-37 till ts-e-andra-45 (9)
- varvad: ts-e-varv-37 till ts-e-varv-44 (8)
- ×k + c: ts-e-affin-38 till ts-e-affin-46 (9)
- summa: ts-e-summa-30 till ts-e-summa-36 (7)

Numreringen fortsätter där version 3 slutar i varje familj, så inget id har använts tidigare.

## Efter granskningen

Testansvarig godkände med villkor (`talserier-2026-11-19-omg3-granskning.md`). Åtgärderna gjordes med `scripts/talserier-v4-granskning.mjs`, en gång och före aktiveringen:

1. **V8 jämför kvoter.** För geometriska rader jämför verifieraren nu också kvotföljden i raden med facit (exakta bråk). Fyra kvoter i följd gemensamma fäller paret, oavsett skala och fas, när minst en rad är från bankversion 4. Före bytet fällde den de elva par granskaren hittade. En rad som pensioneras från samma version som den kom med finns aldrig i någon pool och räknas inte.
2. **Åtta geometriska grundrader** fick ett eget räknesättspar (samma id och familj, fem visade tal):
   - ts-g-geom-09: 125 250 50 100 20 → 40 (gånger 2, sedan delat med 5)
   - ts-g-geom-16: 1 2 10 20 100 → 200 (gånger 2, sedan gånger 5)
   - ts-g-geom-18: 216 108 36 18 6 → 3 (delat med 2, sedan delat med 3)
   - ts-g-geom-17: 27 135 45 225 75 → 375 (gånger 5, sedan delat med 3; samma par som förslaget, annan start)
   - ts-g-geom-15: 125 25 75 15 45 → 9 (delat med 5, sedan gånger 3; samma par som förslaget, annan fas)
   - ts-g-geom-13: 1 2 8 16 64 → 128 (gånger 2, sedan gånger 4). Förslaget gånger 5 och delat med 4 fick bara två typade fel nära facit.
   - ts-g-geom-11: 256 64 32 8 4 → 1 (delat med 4, sedan delat med 2). Förslaget gånger 4 och delat med 5 fick bara två typade fel.
   - ts-g-geom-19 pensioneras (`pensionerad_fran: 4`). Förslaget delat med 2 och 5 fick bara två typade fel, och inget annat par under 400 som ingen rad redan har klarar spärrarna.
   Grund har därmed 13 geometriska rader i version 4, alla med olika par.
3. **ts-e-andra-43** är nu 191 204 215 221 219 206 → 179 och 135: stegen +13, +11, +6, −2, −13 och skillnaden minskar med 3 (−2, −5, −8, −11). Ingen annan rad i andra eller tredje ordningen delar fyra skillnader i följd med den, och V9 håller.
4. **Misstagstexten** för "ändrade steget för mycket" säger nu "Skillnaden mellan stegen ändras lika mycket varje gång." i ts-e-andra-33, 39, 40 och 44, och mallen i generatorn är ändrad så att texten stämmer åt båda hållen.
5. **De tolv regeltexterna** från omgång 2 listar alla fem steg, ord för ord enligt granskningen. Skriptet kontrollerar att varje text är exakt vad generatorn skriver ur raden; rad, facit och regelnyckel är orörda.
6. **Familjenamnet** i `src/lib/tester/steg2/namn.ts` är nu "Gånger och delat". Ingen kod eller test i `src` pinnar den gamla texten (grep).

Nya antal i version 4: grund 33, avancerad 33, expert 33 (99 nya; ts-g-geom-19 ligger kvar i banken men är pensionerad och har aldrig visats). Poolerna i version 4: grund 171, avancerad 168, expert 166.

Körningar efter åtgärderna: verifieraren 516 uppgifter, 0 fel, 0 varningar (och 100, 0, 0 med `--version 4`), `validate-talserier.mjs` klarar TS1 till TS10, `artikel-steg2-check.mjs` grönt, vitest 132 tester gröna, tsc utan fel. Aktiveringen görs enligt "Aktivering, efter granskning" ovan; testraden i `version4.test.ts` är fortfarande utan versionspinne tills konstanten ändras.
