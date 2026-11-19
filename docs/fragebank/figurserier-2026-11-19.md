# Figurserier: parti 3 (2026-11-19)

100 nya härnäst-uppgifter i `src/lib/figurserierV1/bankParti3{Grund,Avancerad,Expert}.json`, `fran_version: 3`. Ingenting i de befintliga bankerna är ändrat.

## Efter granskningen

Testansvarig godkände med villkor (`figurserier-2026-11-19-granskning.md`). 95 uppgifter står kvar oförändrade. De fem som ströks är ersatta med `node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti3.mjs --ersatt`, med samma mall och facit på samma plats:

| Struken | Ersättare | Nu |
|---|---|---|
| fs-a-antal-14 | fs-a-antal-14 | Månghörningen ökar från 3 till 8 hörn (fs-a-antal-10 minskar). |
| fs-g-vax-13 | fs-g-vax-13 | Pricken runt cirkeln, ny lägesföljd (ett, två, tre steg moturs). |
| fs-g-vax-17 | fs-g-vax-17 | Duo med bana och symbol, ny lägesföljd. |
| fs-a-flera-13 | fs-a-flera-13 | Pricken ett steg moturs längs kanten, pilen 90 grader moturs. Pilföljden finns inte i banken. |
| fs-e-vaxl-24 | fs-e-antal-14 (nytt id) | F7 med sektorhjul: växelvis vridning och antalet minskar med en. Expert har nu 15 växelvisa i tretakt och 7 med antal. |

Id:t fs-e-vaxl-24 finns inte längre. Det kan bara ha visats lokalt, eftersom SERIE_VERSION 3 aldrig har gått till prod.

**Följdspärren (punkt 5).** `foljdNycklar` i `scripts/lib/serie/struktur.mjs` räknar ut tre slags nycklar per uppgift, alla inom nivå och familj:

- varje rörlig lägesdimension som sex absoluta lägen, oavsett primitiv;
- växelvisa steg räknade från första läget, så att en vriden rad räknas som samma;
- rörligt antal (streck, sektorer, rutor, hörn) per primitiv.

Generatorn avvisar en ny uppgift som delar en nyckel med något i bankerna. Verifieraren ger fel när en ogranskad uppgift delar en nyckel med någon annan. Par där båda redan är granskade (version 1 och 2 samt de 95) visas som upplysning, i dag 48 par. Ett prov med de fem strukna fångade alla fyra fynden i granskningen. Växande och lika steg räknas inte vridna. Där är den vridna följden bara stegets storlek, med fyra möjligheter per riktning, så den nyckeln skulle stänga mallen.

**fs-g-vand-11** står kvar. Validatorn kräver p_prior per mall (F1 0,78), så statistiken får avgöra (granskningen, alternativ ett).

**Expert.** F6 går inte att bygga med dagens spärrar (se nedan). Med befintliga mallar minskade tretakten genom att fs-e-vaxl-24 blev en F7 med antal.

## Antal per nivå

| Nivå | Nya | Mallar | Härnäst-poolen före | Efter |
|---|---|---|---|---|
| Grund | 39 | F1 25, F3 14 | 44 (36 + parti 2 8) | 83 |
| Avancerad | 39 | F4 25, F5 14 | 46 (30 + parti 2 16) | 85 |
| Expert | 22 | F7 22 | 30 (32, två pensionerade) | 52 |

Proportionerna (39/39/22) följer härnäst-poolen i dag (37/38/25 procent). p_prior och svårighet står per mall som tidigare.

Två mallar fick inga nya, av skäl som spärrarna avgör:

- **F2 (antal på grund):** varje kombination av primitiv, riktning och startantal finns redan på nivån (F2-nyckeln i `validate-figurserier.mjs`).
- **F6 (tre regler på expert):** utan konstant kräver spärrarna en nära miss per regel och två distraktorer som bryter alla regler. S6 på expert tvingar då de två att bli lika i varje egenskap. Ingen ny F6 klarar alla spärrar. Bankens F6 godkändes innan spärrarna skärptes.

## I appen

`select.ts`: `SERIE_VERSION` är 3. Nya sessioner av nivåtesten drar ur nivåns bank (utan de pensionerade) plus parti 3. Sessioner med version 1 och 2 drar exakt som förut, och testet i `figurpass.test.ts` bevakar det. Figurpasset, övningsprovet och Nivåkollen läser `harnastPool`, som nu tar med parti 3. Rättningen (`allaFragor`, `allaFigurFragor`) hittar alla versioner. `types.ts`: `fran_version` kan vara 3.

## Regelfamiljer

| Nivå | Familjer |
|---|---|
| Grund | vandring 13, vridning 12, växande steg 14 |
| Avancerad | växelvis 14, antal 8, flera 7, vridning 4, vandring 2, fyllning 2, växande steg 2 |
| Expert | växelvis 15, antal 7 |

## Nya figurer i serien

Renderaren är oförändrad. Alla nya figurer är primitiver som renderaren, spärrarna och geometrikontrollen redan täckte, men som serien inte använt i mallen förut:

- **Månghörningen** (3 till 8 hörn, fyllning) på avancerad: hörnen minskar eller ökar med ett, och fyllningen går i en ordning (`poly-horn-fyllning`). Fyllningen heter "Fyllningen" i regeltexten, som hos grundformen.
- **Duo med kantprick och symbol** på grund (pricken vandrar, symbolen står still) och avancerad (symbolen går i en ordning).
- **Duo med bana och pil** på grund (pricken vandrar) och avancerad (pricken vandrar och pilen vrids).
- **Duo där bara pilen i mitten vrids** på grund (`duo-kant-pil-vrid`), med rubriken "Pilen i mitten".
- **Sektorhjulet och 3×3-kanten med växande steg** och **duo med bana och symbol med växande steg** på grund.
- **3×3-kanten med kvartsvarv och antal** på avancerad.
- **3×3-kanten, strålarna och duo med bana och symbol växelvis** på avancerad.
- **Duo med bana och symbol** och **duo med kantprick och form** i otakt på expert, plus F7 med antal (sektorhjul och strålar), där regeltexten har copywriterns mening från omgång 3.

## Verifiering

`node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts` kör på alla åtta härnäst-banker (222 uppgifter):

1. **Egen regeltolkning**, fristående från `scripts/lib/serie`: per egenskap ett bibliotek av enkla regler (konstant, lika steg, växande steg, varannan, period 2 till 4, andra och fjärde lika, spegling, stegen växlar). Exakt ett alternativ får följa någon kombination av reglerna, och det ska vara facit. Ingen distraktor kan alltså motiveras av en enkel alternativ regel.
2. **Rendering** med appens renderare: varje figur ger en svg med ritade element utan NaN. Alternativen och de visade figurerna ger elva olika bilder.
3. **Banken**: unika id över alla figurbanker (bryter inräknade), ingen rad två gånger, inga tankstreck, `fran_version` 3 bara i parti 3.
4. **Kedjan**: `validate-figurserier`, `v7-facit-check --serie`, `v7-distraktor-check --serie` och `v7-geometri-check --serie` (G1 till G12, S1 till S5, V11, V12).

Resultat efter ersättningen: 0 fel i alla steg, följdspärren inräknad (48 kända par bland granskade, upplysning). Verifieraren kördes först på de 122 befintliga uppgifterna, som gick igenom utan fel. Ett mutationsprov med flyttat facit, ett dubblerat alternativ och ett dubblerat id fångades.

Generatorn `scripts/gen-figurserier-parti3.mjs` (en mall per process, sedan `--sammanfoga`) använder bankens `bygg()` med alla spärrar och sorterar bort rader och lägesrader som redan finns i någon bank eller kandidatfil. Den sorterar också bort uppgifter över V11-gränsen. Delresultaten ligger i `kandidater/parti3/`.

Övrigt: `npx tsc --noEmit -p .` är grönt. Vitest för figurserierV1, figurpasset, serievyerna, nivåkollen, övningsprovet och logicTestV7 är grönt, med ett undantag: `kandidater.test.ts` faller redan utan ändringarna här (`for-rekryterare/page.tsx` importerar `./components/kandidater`). Granskningsbilder av ett urval (en per ny variant) har ritats i 360-mått och kontrollerats för hand. De ligger utanför git.

## Id-lista

**Grund F1:** fs-g-vand-08, fs-g-vand-09, fs-g-vrid-15, fs-g-vrid-16, fs-g-vand-10, fs-g-vrid-17, fs-g-vrid-18, fs-g-vand-11, fs-g-vand-12, fs-g-vand-13, fs-g-vrid-19, fs-g-vrid-20, fs-g-vand-14, fs-g-vrid-21, fs-g-vrid-22, fs-g-vand-15, fs-g-vand-16, fs-g-vand-17, fs-g-vrid-23, fs-g-vrid-24, fs-g-vand-18, fs-g-vrid-25, fs-g-vrid-26, fs-g-vand-19, fs-g-vand-20

**Grund F3:** fs-g-vax-09 till fs-g-vax-22

**Avancerad F4:** fs-a-antal-10, fs-a-flera-07, fs-a-flera-08, fs-a-antal-11, fs-a-vrid-07, fs-a-vrid-08, fs-a-vand-04, fs-a-antal-12, fs-a-antal-13, fs-a-fyll-04, fs-a-flera-09, fs-a-flera-10, fs-a-vax-05, fs-a-vax-06, fs-a-antal-14, fs-a-flera-11, fs-a-flera-12, fs-a-antal-15, fs-a-vrid-09, fs-a-vrid-10, fs-a-vand-05, fs-a-antal-16, fs-a-antal-17, fs-a-fyll-05, fs-a-flera-13

**Avancerad F5:** fs-a-vaxl-17 till fs-a-vaxl-30

**Expert F7:** fs-e-vaxl-11 till fs-e-vaxl-26 utom fs-e-vaxl-24 (15) och fs-e-antal-08 till fs-e-antal-14 (7)
