# Talserier: 100 nya uppgifter (bankversion 2)

Datum 2026-11-19. Granskad av testansvarig samma dag (`talserier-2026-11-19-granskning.md`, godkänd med villkor). Villkoren är åtgärdade och version 2 är påslagen, se "Efter granskningen".

## Antal per nivå

| Nivå | Nya | Pool i version 1 | Pool i version 2 |
|---|---|---|---|
| Grund | 34 | 72 | 106 |
| Avancerad | 33 | 72 | 105 |
| Expert | 33 | 72 | 103 (två pensionerade) |

Proportionerna följer dagens bank, som har lika många uppgifter på varje nivå.

## Regelfamiljer

Varje nivå har fyra av de åtta familjerna (`NIVAER` i `scripts/lib/talserie/generera.mjs`), och de nya uppgifterna är jämnt fördelade inom nivån.

| Nivå | Familj | Nya | Olika regler bland de nya |
|---|---|---|---|
| Grund | aritmetisk | 11 | 10 |
| Grund | andra ordningen (växande steg) | 11 | 9 |
| Grund | växelvis | 12 | 12 |
| Grund | geometrisk | 0 | |
| Avancerad | växelvis | 8 | 8 |
| Avancerad | varvad | 8 | 8 |
| Avancerad | geometrisk differens | 8 | 4 |
| Avancerad | ×k + c | 9 | 9 |
| Expert | andra ordningen med negativa tal | 8 | 8 |
| Expert | varvad, en delserie geometrisk | 8 | 7 |
| Expert | ×k + c | 9 | 9 |
| Expert | summa av två föregående | 8 | 4 |

**Geometrisk på grund får inga nya.** TS8 tillåter samma regel högst två gånger per nivå. ×2 finns redan två gånger, ×3 ryms bara med starttalet 1 (redan använt) under taket 400, och raderna med "hälften" eller "en tredjedel" ger inte fyra olika typade distraktorer som klarar TS3. Familjen står kvar på tre uppgifter, som i dag.

**Nya regler i stället för nya starttal.** Flera familjer hade redan fyllt sina regler i version 1, så omgången vidgar regelrymden inom samma familj:

- aritmetisk på grund: steget 10, 14, 16, −10, −13, −14 och −15
- andra ordningen på grund: startsteg upp till 8 och ökning upp till 4
- geometrisk differens på avancerad: negativt startsteg (−1 till −4, steget dubblas), med högt starttal så att raden håller sig över −50
- summa på expert: summan plus eller minus 4 och 5
- varvad och ×k + c: några fler steg och tillägg (till exempel ×(−3) på expert)

Svårighet, `p_prior`, misstagstexter och bågar räknas exakt som i version 1.

## Verifieringen

1. **Oberoende verifierare**, `scripts/talserier-verifiera.mjs` (ny, delar ingen kod med generatorn eller lösaren). Den räknar fram raden ur familj och `params` och kontrollerar att de visade talen stämmer, att exakt ett alternativ är facit och att det står på `correctAnswer`. Den prövar sedan ett eget bibliotek av enkla regler mot de visade talen: konstant differens, konstant kvot, polynom av grad två, växlande differens (period två och tre), varvade delserier, Fibonaccilik med tillägg, tribonacci, ×k + c, geometrisk differens, p × förra + q × förrförra, växlande operationer och jämnt växande kvot. Ingen regel som passar raden får ge ett annat svar, och ingen distraktor får följa en sådan regel. Polynom av grad tre som pekar ut en distraktor ger en varning. Till sist kontrolleras talens rimlighet (heltal, nivåns gräns, högst fyra tecken, olika och sorterade alternativ, inget alternativ är ett visat tal), att bågarna i genomgången stämmer med raden och att regeltexten nämner regelns tal.
   Efter granskningen också **V7, förskjutna dubbletter**: en ny rad får inte dela fyra eller fler tal i följd (facit inräknat) med någon annan rad på någon nivå, pensionerade och identiska rader inräknade. Par som bara består av version 1 ger en varning.
   Först körd på de 216 befintliga uppgifterna: 0 fel, 0 varningar (före V7). Prövad på förstörda kopior (fel facit, ändrat visat tal, fel båge, tal utanför gränsen): alla fångades.
2. **Generatorn**, `scripts/gen-talserier-v2.mjs`, bygger med samma byggstenar som `gen-talserier.mjs` och tar bara med en uppgift som klarar TS1 till TS10, verifieraren utan fel och varningar, inte har en rad som redan finns i någon bank eller i artiklarnas uppgifter, och inte gör en regel vanligare än två gånger på nivån. Den lägger bara till sist i bankerna och vägrar köra om version 2 redan finns.
3. **Körningar efter tillägget**:
   - `node scripts/talserier-verifiera.mjs`: 316 uppgifter, 0 fel, en varning (V7: tio kända förskjutna eller identiska par inom version 1)
   - `node scripts/validate-talserier.mjs`: klarar TS1 till TS10
   - `node scripts/artikel-steg2-check.mjs`: inga talseriefel; ett fel gäller spatial (`sp-art-u1-vik`), som en annan agent arbetar med
   - vitest: `src/lib/talserierV1/__tests__/` (spärrarna och nya `version2.test.ts`), `src/lib/tester/steg2/__tests__/`, `traningsmejl.test.ts` och `TestBredd.test.tsx`, 173 tester gröna
   - `npx tsc --noEmit -p .`: inga fel utanför `src/components/tester-v4/`, som hör till annat pågående arbete

Facits plats i den sorterade listan i version 2-poolen (TS10, högst 35 procent): grund 19, 14, 28, 29, 16 av 106; avancerad 18, 22, 22, 22, 21 av 105; expert 20, 19, 21, 22, 21 av 103.

## Efter granskningen

Åtgärderna gjordes med `scripts/talserier-v2-granskning.mjs` (en gång, före aktiveringen; de nya raderna hade aldrig visats).

1. **Förskjutna dubbletter bytta.** Samma id och familj, nya parametrar, kontrollerade mot V7:
   - ts-a-affin-24: nu −3, −2, 0, 4, 12, 28 (facit 60 och 124)
   - ts-a-affin-29: nu −6, −3, 3, 15, 39, 87 (facit 183 och 375)
   - ts-g-vaxel-32: nu 5, 4, 10, 9, 15 (facit 14)
   - ts-e-affin-21: nu −1, 8, −10, 26, −46, 98 (facit −190 och 386)
   - gränsfallen ts-g-andra-24 (nu 5, 6, 11, 20, 33, 50, facit 71) och ts-g-vaxel-26 (nu 26, 22, 31, 27, 36, facit 32)
2. **Pensionerade:** ts-e-affin-11 och ts-e-affin-08 har `pensionerad_fran: 2`. De finns kvar i banken, så sessioner med version 1 drar och rättar dem som förut och genomgångar av gamla resultat fungerar.
3. **Distraktorer på grund.** Ett alternativ räknas som avlägset när det ligger mer än två gånger radens största steg från facit. Ersättarna på grund byggdes med bara närliggande fel. Bland övriga nya rader på grund fick ts-g-vaxel-35 ett närmare alternativ (65 blev 54). Nio växelvisa rader (ts-g-vaxel-24, 25, 27 till 31, 33, 34) står kvar: generatorns typade fel för växelvis är bara fyra till fem per rad, så det finns inget närmare att byta till utan en ny feltyp med misstagstext i `scripts/lib/talserie/generera.mjs`. Det hör till nästa omgång, liksom de förskjutna paren i version 1 och de geometriska på grund.
4. **Regeltexter i version 2:** geometrisk differens med negativt steg säger "Steget dubblas för varje tal (−3, −6, −12 och så vidare).", och ×k + c med negativt k säger till exempel "Multiplicera det förra med −2 och dra bort 8." Texterna i version 1 är orörda.
5. **Aktiverat:** `TALSERIE_VERSION = 2` i `src/lib/talserierV1/select.ts`. Nya nivåtest får `talserie_version: 2` i meta, startade sessioner behåller version 1 och sitt urval. Pass och I-prov drar ur `poolFor(niva)` och sparar id, så de får de nya direkt. `version2.test.ts` kontrollerar version 1-poolen (72 per nivå), pensioneringen, V7 och att konstanten är 2. Inga andra tester behövde ändras.

Kör inte `scripts/gen-talserier.mjs` igen: den skriver om bankerna från början och skulle ta bort version 2. `gen-talserier-v2.mjs` vägrar köra när version 2 finns. Fler uppgifter läggs till med `fran_version: 3`.

## Id

Grund
- aritmetisk: ts-g-arit-24 till ts-g-arit-34 (11)
- andra ordningen: ts-g-andra-24 till ts-g-andra-34 (11)
- växelvis: ts-g-vaxel-24 till ts-g-vaxel-35 (12)

Avancerad
- växelvis: ts-a-vaxel-22 till ts-a-vaxel-29 (8)
- varvad: ts-a-varv-23 till ts-a-varv-30 (8)
- geometrisk differens: ts-a-geod-09 till ts-a-geod-16 (8)
- ×k + c: ts-a-affin-22 till ts-a-affin-30 (9)

Expert
- andra ordningen: ts-e-andra-20 till ts-e-andra-27 (8)
- varvad: ts-e-varv-21 till ts-e-varv-28 (8)
- ×k + c: ts-e-affin-20 till ts-e-affin-28 (9)
- summa: ts-e-summa-15 till ts-e-summa-22 (8)

Numreringen fortsätter där version 1 slutar i varje familj, så inget id har använts tidigare.
