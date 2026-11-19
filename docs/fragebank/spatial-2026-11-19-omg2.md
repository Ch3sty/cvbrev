# Spatial förmåga, omgång 2: 100 nya uppgifter (bankversion 4)

Datum 2026-11-19. Uppgifterna ligger sist i bankfilerna med `fran_version: 4` och är **inte aktiva**. `SPATIAL_VERSION` är fortfarande 3. Arbetssättet är detsamma som i omgång 1 (`spatial-2026-11-19.md`, commit 1c1c3061), med anmärkningarna från granskningen (`spatial-2026-11-19-granskning.md`) inbyggda.

## Antal per nivå och form

| Nivå | A brickfigur | B vikning uppvikt | C tärning | D vikning ihopvikt | Nya | Pool v3 | Pool v4 |
|---|---|---|---|---|---|---|---|
| Grund | 9 | 8 | 8 | 9 | 34 | 129 | 163 |
| Avancerad | 8 | 8 | 8 | 9 | 33 | 129 | 162 |
| Expert | 8 | 8 (alla med klipp) | 8 | 9 | 33 | 129 | 162 |

Svårighet och `p_prior` sätts som i omgång 1. Taken är desamma: A högst 4, 3 och 3 per fri form på nivån, C ingen referens två gånger på nivån, D ingen uppsättning distraktortyper i mer än hälften (grund) eller en tredjedel (avancerad, expert).

## Kopiespärren mot alla banker och nivåer

Granskningen hittade vridna dubbletter inom en nivå. Nu fäller spärren också kopior **mellan nivåerna**, och den ser fler kopior i form C.

- **Nyckeln** (`kanoniskNyckel` i `scripts/spatial-verifiera.mjs`) är samma uppgift oavsett startvridning:
  - A: referensen och facit under kvadratens åtta symmetrier, samma avbildning på båda. Samma fria form med samma vridning, bara i en annan startvridning, ger samma nyckel. Ramens storlek räknas inte, så en figur i 3×3 och samma figur i 4×4 är samma uppgift.
  - B och D: de ritade vikningarna (linje, vikriktning), hålen och klippen under kvadratens åtta symmetrier.
  - C, **nytt**: tärningen ritas alltid från samma hörn, men hörnet kan vridas i sig självt. Ett tredjedels varv runt hörnets diagonal flyttar ovansidan till vänster, vänster till höger och höger till ovansidan, och en spegling byter vänster mot höger. Nyckeln tar referensen och facit under de sex avbildningarna (`HORN`), där riktade symboler (pil, triangel) följer med i 3D.
- **Regeln** (`dubbletter`): ett par där någon uppgift har `fran_version` 4 eller senare är alltid fel, på vilken nivå som helst, och grund B är inte undantagen. Äldre par bedöms som i omgång 1 (fel bara på samma nivå med omgång 1:s nyckel och version 3, utom grund B). Alla andra äldre par blir varningar. Verifieraren skriver en rad per kopia.
- **Generatorn** (`scripts/gen-spatial-v4.mjs`) avvisar en kandidat vars nyckel finns bland alla 387 befintliga uppgifter, artiklarnas 49 och de nya som redan tagits. Den fällde 135 kandidater som kopior (104 av dem på grund A).
- **Prövad**: `version4.test.ts` bygger kopior och ser att de fälls. En grunduppgift flyttad till avancerad fälls, liksom en brickuppgift där referens och alternativ vridits ett kvarts varv och en tärning med hörnet vridet ett tredjedels varv. Alla 120 tärningsuppgifter har avbildats med hörnets sex avbildningar. Varje avbildad uppgift klarar verifieraren och får samma nyckel, så avbildningen ritar verkligen samma tärning.

**Äldre kopior som spärren nu hittar** (bara varningar, inga rader ändrade): 13 par mellan nivåerna, alla grund mot avancerad (12 i A, där båda nivåerna har sex rutor utan markering, och sp-a-c-19 mot sp-g-c-27), och ett par inom grund C som bara skiljer sig i hörnets vridning (sp-g-c-15 mot sp-g-c-01). Det är ett beslut för testansvarig om de ska pensioneras med `pensionerad_fran`.

## Nya vikningsformer i form B

Grund B var uttömd. Avancerad B visade sig vara nästan lika uttömd: med den nya spärren gav 60 000 försök inte en enda ny uppgift i den gamla formen. Båda nivåerna har därför nya varianter (`VARIANTER_B` i `scripts/lib/spatial/vikning.mjs`). Byggaren är oförändrad när ingen variant anges.

| Nivå | Variant | Antal | Vad det är |
|---|---|---|---|
| Grund | `diagonal` | 2 | Halv vikning längs en av huvuddiagonalerna, ett hål. Granskningens beslut. |
| Grund | `remsa` | 2 | En rutbred kant viks in, ett hål i den dubbla remsan. |
| Grund | `tva_hal` | 4 | Halv vikning längs en mittlinje, två hål stansas, fyra hål i facit. |
| Avancerad | `remsa_forst` | 4 | Första vikningen är en remsa, den andra som förut. |
| Avancerad | `tva_hal` | 4 | Två vikningar som förut, två hål, fyra till åtta hål i facit. |

- **Diagonal och hålet**: hålet får aldrig ligga i en ruta som diagonalen delar. Det fäller SP-B1 i spärrarna och "går genom en ruta som en viklinje delar" i verifieraren. Ett test lägger hålet på diagonalen och ser att båda fäller. Diagonalvikningen ger bara två uppgifter som inte är kopior av varandra (hålets två lägen som inte är symmetriska kring den andra diagonalen), och remsan också två, så de är uttömda.
- **SP-B2** räknar nu antal stansade hål: grund och avancerad 1 eller 2, expert 1. Facits antal hål skalas med antalet stansade hål. Frågan säger "två hål stansas" och misstagstexten för det stansade arket säger "de två hålen".
- **Varning som tillåts**: på grund B är "fel axel" alltid facit vridet i planet (arket ligger still och viklinjen är ritad, så det är fel). Generatorn tillåter den varningen bara på grund, som i omgång 1. Den nya är sp-g-b-35.

## Förklaringen på expert C

Granskningen bad att förklaringen på expert C skulle lära ut metoden. De åtta nya expert-tärningarna får en förklaring från `forklaringGrannar` i `kub.mjs`, till exempel sp-e-c-34:

> Bara pilen syns på båda tärningarna. På den första pekar pilen bort från triangeln. I rätt alternativ har pricken tagit triangelns plats runt hörnet, och pricken är sidan mittemot triangeln. Pilen pekar därför mot pricken.

Texten räknas ur kuben och orienteringen. Generatorn tar inte med en uppgift där sidan som tar grannens plats inte står i samma ordning runt hörnet. Testet räknar sedan om "mot" och "bort från" ur det som ritas (verifierarens 3D-riktning per sida) och jämför med texten, i båda tärningarna. De äldre expert-tärningarna har kvar sin text.

## Verifieringen

- `node scripts/spatial-verifiera.mjs`: **487 uppgifter, 0 fel, 85 varningar.** Varningarna är 18 om alternativ (de 17 kända och sp-g-b-35) och 67 äldre kopiepar (53 från omgång 1 och de 14 ovan). Med `--version 4`: 100 uppgifter, 0 fel, 1 varning (sp-g-b-35).
- `node scripts/validate-spatial.mjs`: klarar spärrarna, och facits plats är under 40 procent per bank.
- `node scripts/spatial-geometri-check.mjs`: geometrin håller i riktig SVG i alla tre bankerna (högst 60 noder och 6 183 byte per uppgift).
- `node scripts/artikel-steg2-check.mjs`: artiklarnas 49 uppgifter klarar spärrarna och finns inte i bankerna.
- vitest (`--exclude ".claude/**"`): `src/lib/spatialV1` (`sparrar`, `version3`, nya `version4`), `src/lib/tester/steg2`, `TestBredd.test.tsx`, `grundkvot.test.ts` och `hintar.test.ts` är gröna, 93 test.
- `npx tsc --noEmit -p .`: 0 fel.
- **Skärmbilder** med appens ritare i 360-layouten (`scripts/lib/spatial/granskning-html.tsx` och puppeteer), 25 uppgifter, en bild per uppgift, i sessionens scratchpad `spatial-omg2/` utanför git. Alla åtta nya grund B, fyra avancerad B (båda varianterna), fyra expert C, en A och en D per nivå, en C på grund och avancerad och en expert B. Vi har räknat igenom facit för hand på sp-g-b-33, -34, -37, -40, sp-a-b-34, -35, sp-g-a-34, sp-a-c-33 och sp-e-c-33 och tittat på bilderna. Figurerna ritas rätt, facit stämmer och inget annat alternativ ser rätt ut. Resten av de 100 är kontrollerade av verifieraren men inte tittade på en och en; testansvarigs granskning bör ta kontaktkartor över alla, som i omgång 1. Halvtalsvikningen i sp-a-b-34 och -35, där linjen går genom en rutmitt, finns redan i banken (sp-a-b-04, -05, -20).

Diffen mot bankerna är bara tillagda rader. Inga rader från version 1 till 3 är ändrade.

## Aktivering

Gör det i samma commit när testansvarig har granskat omgången:

1. `SPATIAL_VERSION = 4` i `src/lib/spatialV1/select.ts`, med en rad om bankversion 4 i kommentaren ovanför. `perFormFor(4)` ger samma fördelning som version 2 och 3 (4 A, 3 B, 4 C, 4 D). Startade sessioner behåller sin `spatial_version` och sitt urval.
2. I `src/lib/spatialV1/__tests__/version4.test.ts`: `expect(SPATIAL_VERSION).toBe(3)` blir 4. I `version3.test.ts`: `expect(SPATIAL_VERSION).toBe(3)` blir `toBeGreaterThanOrEqual(3)`.
3. Kör `node scripts/spatial-verifiera.mjs`, `npx vitest run src/lib/spatialV1 src/lib/tester/steg2 --exclude ".claude/**"` och `npx tsc --noEmit -p .`.
4. Kör aldrig `scripts/gen-spatial.mjs` igen på bankerna. Den skriver om en form från början och tar bort version 3 och 4. Fler uppgifter läggs till med ett skript i stil med `gen-spatial-v4.mjs` och `fran_version: 5`. Kopior bland version 4 byts ut med `node scripts/gen-spatial-v4.mjs --ersatt`.

## Id

Grund
- A: sp-g-a-34 till sp-g-a-42 (9)
- B: sp-g-b-33 till sp-g-b-40 (8: diagonal -37, -40; remsa -34, -38; två hål -33, -35, -36, -39)
- C: sp-g-c-33 till sp-g-c-40 (8)
- D: sp-g-d-34 till sp-g-d-42 (9)

Avancerad
- A: sp-a-a-33 till sp-a-a-40 (8)
- B: sp-a-b-33 till sp-a-b-40 (8: remsa först -33, -34, -36, -40; två hål -35, -37, -38, -39)
- C: sp-a-c-33 till sp-a-c-40 (8)
- D: sp-a-d-34 till sp-a-d-42 (9)

Expert
- A: sp-e-a-33 till sp-e-a-40 (8)
- B: sp-e-b-33 till sp-e-b-40 (8, alla med klipp)
- C: sp-e-c-33 till sp-e-c-40 (8, förklaring med grannar)
- D: sp-e-d-34 till sp-e-d-42 (9)
