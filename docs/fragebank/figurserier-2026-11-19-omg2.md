# Figurserier: parti 4, omgång 2 (2026-11-19)

**Läge: aktiverat som `SERIE_VERSION` 4, inte committat.** 98 uppgifter med `fran_version: 4` ligger i `src/lib/figurserierV1/bankParti4{Grund,Avancerad,Expert}.json`: de 77 som testansvarig godkände (docs/fragebank/figurserier-2026-11-19-omg2-granskning.md) och 21 ersättare. Kandidaterna står kvar i `kandidater/parti4-*.json`, som appen aldrig importerar. Avsnittet "Efter granskningen" längst ned beskriver vad som ändrades. Avsnitten före det beskriver partiet som det lämnades till granskning, med 102 kandidater.

## Antal per nivå

| Nivå | Aktiva | Mallar | Härnäst-poolen före | Med parti 4 |
|---|---|---|---|---|
| Grund | 33 | F1 18, F2 2, F3 13 | 83 | 116 |
| Avancerad | 41 | F4 30, F5 11 | 85 | 126 |
| Expert | 24 | F7 10, F8 14 | 52 | 76 |

Före granskningen: grund 33, avancerad 45 (F4 34), expert 24.

Grund blev mindre än en tredjedel. Följdspärren gör att lägesföljder inom samma familj tar slut: F1 och F3 har 32 följder per familj, och de flesta finns redan. Avancerad har plats för fler, eftersom två regler ger fler följder.

## Granskningen av parti 3 följs

- **Följdspärren (punkt 5).** Generatorn avvisar varje kandidat som delar lägesföljd, vriden växelvis följd eller antalsföljd med något i bankerna eller parti 3, inom nivå och familj. Verifieraren ger fel på det för alla ogranskade, alltså hela parti 4: 0 fel. Generatorn kontrollerar nu också F2-nyckeln (primitiv, riktning och startantal en gång per nivå).
- **Expert mindre enformig (punkt 7).**
  - Den nya mallen **F8 "Två rörelser"** (expert, p_prior 0,38, svårighet 4) har två regler utan tretakt. Den ena delen tar växande steg, den andra ett kvartsvarv eller en växling.
  - Två rörelser som båda har fem olika lägen går alltid i takt (FS3), så den ena tar kvartsvarv.
  - I F7 går antal före tretakten, och pilen och orbitalen i tretakt står utanför.
  - Resultat: 5 av 24 i tretakt (parti 3: 15 av 22). Familjerna är växande steg 8, flera 5, antal 5, växelvis 5 och fyllning 1.
- **F6** kan fortfarande inte byggas med dagens spärrar (S6 på expert). F8 tar dess plats.

## Ny figur: prickbågen

`dotsorbit` fanns redan i renderaren och i geometrikontrollen, men användes inte i serien. Nu är den primitiven `prickar`: två till sju prickar i följd på en osynlig cirkel, med samma modell som strålarna (start och antal). Minst två prickar, eftersom en ensam prick läses som orbitalens.

Den är tillagd i `celler-serie.mjs`, regeltexterna i `misstag-serie.mjs` ("Prickarna går två steg moturs runt mitten", "En prick till läggs till medurs"), S15 och FS6 i `sparrar.mjs`, och avkodningen i verifieraren. Den används i 13 uppgifter: F1, F2, F3, F4, F5 och F7.

Renderingen är oförändrad. Skärmbilder i 360-mått finns i scratchpad, utanför git. Prickbågen och F8 har kontrollerats för hand.

Övriga nya varianter:

- duo med bana och form (pricken vandrar)
- duo med bana där bara pilen vrids
- duo med kantprick och symbol, och duo med pil, med växande steg
- duo med bana och symbol, och duo med kantprick och form, med cykel
- formen i mitten som växlar fyllning
- grundformen med symbol och fyllning
- 3×3-kanten och prickbågen växelvis med antal

## Verifiering

`node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts` gav 0 fel på 324 uppgifter. Körningen tog med alla banker och de tre kandidatfilerna för parti 4. Den omfattar:

- egen regeltolkning
- rendering
- unika id
- följdspärren
- `validate-figurserier`
- `v7-facit-check --serie`
- `v7-distraktor-check --serie`
- `v7-geometri-check --serie`

Bryter-kedjan (`--bryter`) är också utan fel. tsc ger inga fel i mina filer. Felen som finns ligger i `src/components/tester-v4/`, som ett annat arbete håller på med. Vitest för figurserierV1, figurpasset, serievyerna, Nivåkollen och övningsprovet: 71 av 71.

## Ändrade filer

- `scripts/gen-figurserier-parti4.mjs` (ny)
- `scripts/lib/serie/recept-serie.mjs` (F8, `parti: 4`)
- `scripts/gen-figurserier.mjs` (hoppar över mallar med `parti`)
- `scripts/lib/serie/celler-serie.mjs`, `misstag-serie.mjs`, `sparrar.mjs` (prickbågen)
- `scripts/validate-figurserier.mjs` (`fran_version` 4)
- `scripts/figurserier-verifiera.ts` (prickbågen, parti 4 som ogranskat)

## Id-lista

**Grund F1:** fs-g-vand-21, fs-g-vand-22, fs-g-vrid-27, fs-g-vrid-28, fs-g-vand-23, fs-g-vrid-29, fs-g-vrid-30, fs-g-vand-24, fs-g-vand-25, fs-g-vand-26, fs-g-vrid-31, fs-g-vrid-32, fs-g-vand-27, fs-g-vrid-33, fs-g-vrid-34, fs-g-vand-28, fs-g-vand-29, fs-g-vand-30

**Grund F2:** fs-g-antal-18, fs-g-antal-19

**Grund F3:** fs-g-vax-23 till fs-g-vax-35

**Avancerad F4:** fs-a-antal-18, fs-a-flera-14, fs-a-flera-15, fs-a-fyll-06, fs-a-vrid-11, fs-a-vrid-12, fs-a-vand-06, fs-a-antal-19, fs-a-fyll-07, fs-a-flera-16, fs-a-flera-17, fs-a-vax-07, fs-a-vax-08, fs-a-antal-20, fs-a-flera-18, fs-a-flera-19, fs-a-fyll-08, fs-a-vrid-13, fs-a-vrid-14, fs-a-vand-07, fs-a-fyll-09, fs-a-flera-20, fs-a-flera-21, fs-a-vax-09, fs-a-vax-10, fs-a-flera-22, fs-a-flera-23, fs-a-vrid-15, fs-a-vand-08, fs-a-fyll-10, fs-a-flera-24, fs-a-vax-11, fs-a-flera-25, fs-a-vand-09

**Avancerad F5:** fs-a-vaxl-31 till fs-a-vaxl-41

**Expert F7:** fs-e-antal-15, fs-e-antal-16, fs-e-vaxl-27, fs-e-vaxl-28, fs-e-antal-17, fs-e-antal-18, fs-e-vaxl-29, fs-e-vaxl-30, fs-e-antal-19, fs-e-vaxl-31

**Expert F8:** fs-e-flera-07, fs-e-flera-08, fs-e-vax-04, fs-e-vax-05, fs-e-fyll-07, fs-e-vax-06, fs-e-vax-07, fs-e-flera-09, fs-e-flera-10, fs-e-vax-08, fs-e-vax-09, fs-e-vax-10, fs-e-vax-11, fs-e-flera-11

## Efter granskningen (2026-11-19)

Testansvarig godkände 79 av 102 med villkor. Så här följdes villkoren.

### Punkt 1: F8 på rätt nivå

- fs-e-vax-06, fs-e-vax-07, fs-e-vax-10, fs-e-vax-11 och fs-e-fyll-07 är strukna. Varianterna `pil-vaxande-langd`, `orbital-vaxande-mitt-expert` och `duo-orbital-form-vaxande-fyll` är borttagna ur F8 i `recept-serie.mjs`.
- Fem ersättare där pricken tar växande steg och den andra regeln är en trecykel i mitten: fs-e-vax-12 och fs-e-vax-14 (pricken på banan, symbolen), fs-e-vax-13 (pricken längs kanten, symbolen), fs-e-flera-12 (pricken längs kanten, formen) och fs-e-flera-13 (pricken på banan, formen).
- Alla 14 i F8 står på p_prior 0,45 och svårighet 3. Mallen är en; den kan delas i två när statistiken finns.
- Alla F8 är duo, eftersom bara duon har två delar som rör sig. Med två primitivgrupper räcker inte taket ⌈14/3⌉ = 5, så mallen har `grupptak: 7`, som generatorn och `validate-figurserier` läser. Nu är sju med kantprick och sju med orbital.

### Punkt 2: regelnyckeln

- `regelNyckel` i `scripts/lib/serie/struktur.mjs` består av primitiven, varje rörlig regel utan startläge (s0, s1), konstanterna och cykelns värden sorterade. Lägesstegen räknas modulo 8.
- Generatorn avvisar en kandidat vars nyckel finns i någon bank eller bland de kvarvarande i parti 4, på vilken nivå som helst. Verifieraren ger fel när en ogranskad fråga från parti 4 eller senare delar nyckel med någon annan. Äldre par är upplysning, 33 i dag.
- Nyckeln fäller alla arton i granskningens lista. Den fäller också **fs-a-flera-17**, som är fs-a-flera-02 med samma formordning startad senare, och **fs-a-fyll-10**, som är fs-a-fyll-05 med samma ordning på grundform och fyllning. De stod inte i granskningens lista men är samma sorts kopia, så de är också utbytta. Fyra andra godkända delar sorterad nyckel med något (fs-a-fyll-07, fs-a-fyll-09, fs-a-flera-21, fs-a-flera-23). Deras cykel går i en annan ordning, så de står kvar som godkända.
- Ersättarna kommer från `gen-figurserier-parti4.mjs --ersatt`. Den stryker de 25 och genererar nya med alla spärrar. Godkända uppgifter rörs inte, och strukna id används inte igen.
  - **F1, fem:** fs-g-vand-31 och 34 (pricken längs kanten, symbolen stilla), fs-g-vand-32 och 35 (pricken längs kanten, formen stilla) och fs-g-vand-33 (prickbågen). Blocket som vandrar (punkt 5) och de två duovarianterna från punkt 3 är inte med, och två ersättare får inte dela rörelse.
  - **F3, tre:** fs-g-vax-36 (pilen), fs-g-vax-37 (orbitalen) och fs-g-vax-38 (strecken). Det var de tre följder som fanns kvar i familjen.
  - **F4, åtta av tolv:** fs-a-flera-26, fs-a-vrid-16, 17 och 18, fs-a-fyll-11, fs-a-vax-12 och fs-a-antal-21 och 22. Pilen och orbitalen har nästan inga regelnycklar kvar, så parti 3:s varianter fick vara med: månghörningen, grundform med form och symbol, 3×3-kanten och duo med pil. Spärrarna tog slut efter åtta, och granskningen ville hellre ha färre uppgifter än kopior. Avancerad har därför 41 i stället för 45.

### Ritat och sett

Alla 21 ersättare är ritade med `cellSvg` i headless Chrome och sedda en och en. Varje bild visar raden, luckan och sex alternativ i 92 pixlar, med facit markerat. Bilderna ligger i scratchpad, utanför git. Facit följer regeltexten i alla 21, och ingen distraktor ser ut som facit. I fs-a-antal-21 och 22 skiljer sig alternativen bara i vilken kantruta som är vit. Det syns tydligt, och antalet och läget är reglerna i raden.

### Aktiveringen

- `scripts/befordra-figurserier-parti4.mjs` skriver `bankParti4*.json` och filtrerar på de 77 godkända och de 21 ersättarna. `befordra-figurserier.mjs` användes inte. Inga andra bankfiler är ändrade. De godkända uppgifterna har samma id, rad och facit som i granskningen; bara p_prior och svårighet i F8 är nya.
- `select.ts`: `SERIE_VERSION = 4`, `SerieVersion` 1 till 4, och `serieVersion` läser 4. `poolFor` lägger till parti 4 från version 4, och `allaFragor` tar med parti 4, så att rättningen, `hittaSerieFraga` och `FIGUR_PER_ID` hittar dem.
- `types.ts`: `fran_version: 1 | 2 | 3 | 4`.
- Verifieraren: parti 4 i `HARNAST`, krav på `fran_version` 4 i `bankParti4*`, `GODKANDA_PARTI4` (77 id) och regelnyckeln.
- `figurpass.test.ts`: `SERIE_VERSION` 4 och härnäst-poolerna 116, 126 och 76. `poolFor(n, 4)` ska vara `poolFor(n, 3)` plus parti 4, och ett nytt test kontrollerar att varje fråga i parti 4 rättas rätt.
- Pågående sessioner behåller sitt urval: versionen skrivs vid start, och saknad version läses som 1. Percentilen för nivåtesten delas inte per bankversion. De gamla mallarna har samma priors, men F8 är ny och står på 0,45. Det bör stå i changelogen.

### Verifiering efter aktiveringen

- `node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts` på alla härnäst-banker: 320 uppgifter, 0 fel. 48 kända följdpar och 33 kända regelnyckelpar bland granskade eller äldre uppgifter är upplysning.
- Kedjan är grön: `validate-figurserier`, `v7-facit-check`, `v7-distraktor-check` och `v7-geometri-check` med `--serie`. Bryter-kedjan är också utan fel, och `validate-figurserier` utan argument ger 0 fel.
- Mot de ursprungliga 102 kandidaterna ger verifieraren 22 regelnyckelfel: de arton, flera-17, fyll-10 och vax-07 och vax-11 mot F4.
- tsc: 0 fel. Vitest för figurserierV1, figurpasset och testerna i `src/lib/tester`, Nivåkollen, övningsprovet, serievyn och `kandidater.test.ts`: 179 av 179.

### Ändrade filer i omgången

- `scripts/lib/serie/struktur.mjs` (`regelNyckel`)
- `scripts/lib/serie/recept-serie.mjs` (F8)
- `scripts/gen-figurserier-parti4.mjs` (regelnyckeln, `--ersatt`)
- `scripts/validate-figurserier.mjs` (`grupptak`)
- `scripts/figurserier-verifiera.ts` (parti 4, regelnyckeln)
- `scripts/befordra-figurserier-parti4.mjs` (ny)
- `src/lib/figurserierV1/bankParti4Grund.json`, `bankParti4Avancerad.json` och `bankParti4Expert.json` (nya)
- `src/lib/figurserierV1/kandidater/parti4-*.json` och `kandidater/parti4/F*.json`
- `src/lib/figurserierV1/select.ts` och `types.ts`
- `src/lib/tester/__tests__/figurpass.test.ts`
