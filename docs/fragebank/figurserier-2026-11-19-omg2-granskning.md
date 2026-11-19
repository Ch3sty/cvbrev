# Granskning: figurserier, parti 4 (omgång 2, 2026-11-19)

Testansvarig. Alla 102 kandidater lästa (rad, alternativ, regeltext, misstag) och ritade med appens renderare (`cellSvg`) i 17 ark via headless Chrome, alla 102 sedda. Verifieraren körd två gånger: på de tre kandidatfilerna (102 uppgifter, 0 fel, kedjan grön) och på alla banker plus parti 4 (324 uppgifter, 0 fel, 48 kända par bland redan granskade). Dessutom tre egna kontroller som verifieraren inte gör: samma regel med samma konstanter under samma primitiv på nivån oavsett startläge, samma lägesföljd över familjegränser, och F8 ställd mot F4. Filerna är orörda.

**Beslut: godkänt med villkor.** 23 uppgifter stryks eller byts ut (punkt 1 och 2). Övriga 79 godkänns: regeln är entydig, ingen distraktor följer en enkel alternativ regel, figurerna är tydliga, texterna håller.

## Byts ut eller stryks

| # | Id | Problem | Rättelse |
|---|---|---|---|
| 1 | fs-e-vax-07, fs-e-vax-11, fs-e-vax-06, fs-e-vax-10, fs-e-fyll-07 | F8 på fel nivå. vax-07 och vax-11 (orbital: pricken med växande steg, mittpunkten växlar) har exakt samma recept som F4 fs-a-vax-02/04/06/08/10/11 på avancerad med p 0,55. vax-06 och vax-10 (pilen med växande vridning, längden växlar) är F4 fs-a-vax-05/07/09 med längd i stället för spets. fyll-07 (pricken på banan med växande steg, fyllningen växlar) är fs-a-vax-08 i duo-kläder. Samma uppgift kan inte vara p 0,55 på avancerad och p 0,38 på expert. | Stryk de fem och ta bort varianterna `pil-vaxande-langd`, `orbital-vaxande-mitt-expert` och `duo-orbital-form-vaxande-fyll` ur F8. Ersätt med duo-varianter där den andra regeln är en trecykel (symbol eller form), till exempel duo-orbital-symbol och duo-kant-form med växande steg på pricken. En tvåväxling eller ett kvartsvarv som andra regel är F4:s andra regel, inte experts. |
| 2 | Grund: fs-g-vrid-32, fs-g-vand-23, fs-g-vand-24, fs-g-vrid-28, fs-g-vand-28, fs-g-vax-26, fs-g-vax-32, fs-g-vax-33. Avancerad: fs-a-vrid-11, fs-a-vrid-13, fs-a-vrid-15, fs-a-vand-06, fs-a-vand-08, fs-a-vand-09, fs-a-vax-09, fs-a-vax-10, fs-a-vax-11, fs-a-antal-19 | Kopior med nytt startläge. Var och en har samma primitiv, samma rörliga regler och samma konstanter som en uppgift som redan ligger i banken på nivån; bara startläget skiljer, så raden är den gamla raden vriden. Exempel: fs-g-vrid-32 är fs-g-vrid-01 (pilen 45 grader medurs, kort, fylld spets) startad två lägen senare; fs-a-vrid-11 är fs-a-vrid-05 (135 grader medurs, kort och lång växlar, öppen spets); fs-g-vax-32 blir tredje exemplaret av "pricken moturs med växande steg, fylld mittpunkt" (fs-g-vax-08, fs-g-vax-13); fs-a-antal-19 tredje exemplaret av fs-a-antal-05/09. För den som gör testet är det samma uppgift, och den tillför bara vikt i poolen. Fullständig parning: vrid-32=vrid-01, vand-23=vand-03, vand-24=vand-06, vrid-28=vrid-12, vand-28=vand-11, vax-26=vax-12, vax-32=vax-08/13, vax-33=vax-06/14; a-vrid-11=a-vrid-05, a-vrid-13=a-vrid-09, a-vrid-15=a-vrid-03, a-vand-06=a-vand-03, a-vand-08=a-vand-01/05, a-vand-09=a-vand-02, a-vax-09=a-vax-05, a-vax-10=a-vax-02, a-vax-11=a-vax-04, a-antal-19=a-antal-05/09. | Byt ut mot uppgifter med en regelnyckel som inte finns på nivån: `nivå | primitiv | rörliga regler utan s0 och s1 | konstanter` (cykelns värden sorterade, så att fasen inte räknas). Lägg nyckeln som spärr i generatorn och som fel i verifieraren för ogranskade uppgifter. Tar följdspärren slut på grund för F1 och F3 får ersättarna komma i andra familjer (prickbågen, duo med form, 3×3-kanten) eller mallar, och hellre färre uppgifter än kopior. |

Punkt 2 är en skarpare linje än förra granskningen, som prövade följden men inte regeln med konstanter. Parti 3 tog in några sådana par (fs-g-vand-10 mot vand-01, fs-g-vax-14 mot vax-06, fs-a-vand-05 mot vand-01); de står kvar. Från parti 4 gäller nyckeln.

## F8 "Två rörelser"

De nio som står kvar (fs-e-flera-07 till 11, fs-e-vax-04, 05, 08, 09) godkänns med ändrade värden. De är pricken med växande steg plus pilen i kvartsvarv; det är F3 (grund, p 0,65) plus F4:s andra regel. F7 är F5 (0,5) plus en trecykel och ligger på 0,35. Med samma faktor hamnar F8 på ungefär 0,45. fs-e-flera-11 är bokstavligen fs-g-vax-17 (grund) med en pil i mitten som vrids 90 grader. Expert behöver variationen, så mallen får stå, men med **p_prior 0,45 och svårighet 3**, inte 0,38 och 4. När de fem ersättarna med trecykel är inne och statistiken finns kan mallen delas i två om det behövs.

Två rörliga lägen med fem olika värden går i takt (FS3), så en riktigt svår F8 kräver att den andra regeln är något annat än ett läge: trecykel på symbol eller form, eller två serier på pilen (F5). Det är vägen om F8 ska bli expert på riktigt.

## Prickbågen

Godkänd. 143 celler, alla sammanhängande bågar om två till sju prickar, inga tomma, inga hela ringar. Två och tre prickar läses som en figur som vandrar runt en osynlig mitt; sex och sju läses som en ring med en lucka, och luckans läge syns i 92 pixlar och tydligt i appens storlek (fs-g-antal-18 F, fs-a-antal-20 C mot D). Den skiljer sig från orbitalen, som har ring och mittpunkt. Regeltexterna "Prickarna går två steg moturs runt mitten" och "En prick till läggs till medurs" fungerar fast mitten inte ritas. F7 med prickbågen (antal-15, antal-17) är tunga men expert.

## Anmärkningar, inget hinder

3. **Samma nya primitiv två gånger i partiet.** fs-g-vrid-27 och fs-g-vrid-31 (pilen i mitten 135 grader moturs, pricken stilla) har samma rörelse, vrid-31 är vrid-27 startad ett steg tidigare; pricken sitter på olika plats. fs-g-vand-26 och fs-g-vand-30 (pricken ett steg medurs runt banan) skiljer bara i formen i mitten. Klarar regelnyckeln, men två av arton F1 på samma nya variant är i mesta laget.
4. **Samma lägesföljd över familjegräns.** fs-g-vrid-32 (pilen) och fs-g-vand-05 (orbitalen) går 5, 6, 7, 0, 1, 2; på avancerad delar fs-a-vrid-12, fs-a-vand-01, fs-a-flera-04 och fs-a-flera-09 följden 1 till 6. Konventionen tolererar det; vrid-32 går ändå ut på punkt 2.
5. **fs-g-vand-28** (tre svarta rutor tre steg längs kanten) har samma läsproblem som fs-g-vand-11 i förra granskningen: det ser ut som att en figur byter form. Går ut på punkt 2 som kopia av vand-11, så ingen ersättare på den varianten.
6. **F2 fs-g-antal-19** (sektorhjulet, en till) är tredje "en sektor till" på grund (antal-02, antal-08) med annat startläge. F2-nyckeln räknar startläget, och bågen växer från olika håll, så den står. Inte fler på den varianten.
7. **Renderingen.** Inga NaN, inga sammanfallande alternativ. fs-a-vrid-12 A och D (vänsterpil, kort respektive lång, öppen) ser nästan lika ut i 92 pixlar men skiljer tydligt i appens storlek och längden är en regel i raden. Duo med kantprick saknar ram som förut.

## Aktiveringen

Gör som för parti 3 (ec76bb9c), i en egen commit med bara figurseriefiler; arbetskopian har många orelaterade ändringar.

1. **Bankfiler.** Skriv de godkända till `bankParti4Grund.json`, `bankParti4Avancerad.json`, `bankParti4Expert.json` med ett eget skript som filtrerar på godkända id. Använd inte `scripts/befordra-figurserier.mjs`: det skriver över `bankGrund/Avancerad/Expert.json` med kandidatkatalogens filer och skulle radera version 1.
2. **select.ts.** `SERIE_VERSION = 4`, `SerieVersion = 1 | 2 | 3 | 4`, `serieVersion(meta)` returnerar 4 för 4, `poolFor` lägger till parti 4 när `version >= 4`, och `allaFragor` tar med parti 4. Det sista är det farliga: `rattaSerieSvar`, `hittaSerieFraga` och `FIGUR_PER_ID` läser `allaFragor`; saknas parti 4 där rättas varje svar på en parti 4-fråga som fel. `harnastPool` följer `SERIE_VERSION` av sig själv.
3. **types.ts.** `fran_version: 1 | 2 | 3 | 4`.
4. **Verifieraren.** Parti 4 in i `HARNAST`, fran_version 4 krävs i `bankParti4*`, och de godkända id:na i en `GODKANDA_PARTI4` så att följdpar bland granskade blir upplysning. Lägg till regelnyckeln (punkt 2).
5. **Tester.** `figurpass.test.ts` låser `SERIE_VERSION` till 3 och poolerna till 83 och 85; uppdatera till 4 och de nya talen, och spegla version 3-fallet för version 4 (`poolFor(n, 4)` är `poolFor(n, 3)` plus parti 4). `kandidater.test.ts` ser till att inget under `src/` importerar kandidatkatalogen; nya bankfiler ligger utanför den.
6. **Pågående sessioner** behåller sitt urval: versionen skrivs vid start (`SERIE_META`) och saknad version läses som 1. Figurpass, övningsprov och Nivåkoll sparar id och slår upp dem med `allaFigurFragor`. Percentilen för nivåtesten delas inte per bankversion, som förut; samma priors på de gamla mallarna, F8 ny, så det bör stå i changelogen.
7. **Kör** verifieraren på alla banker, `validate-figurserier`, tsc och vitest för figurserierV1, figurpasset, Nivåkollen och övningsprovet innan push.
