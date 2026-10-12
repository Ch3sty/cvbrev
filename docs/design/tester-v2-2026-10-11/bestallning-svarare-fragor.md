# Beställning: verktygen för svårare frågor (matriser "svår plus", distraktorkontroll, mätt svårighet, verbalt och numeriskt skrivformat, första partiet)

Datum 2026-10-11. Beställare: testansvarig. Mottagare: en Opus-implementatör på branch `feat/svarare-fragor` (worktree `.claude/worktrees/svarare-fragor`). Underlag: `riktlinjer.md` avsnitt 2 och 2.5, `granskning-figurer.md` (G1 till G12), minnet `reference_matrix_test_system.md`, koden i `scripts/lib/matris/` (`generera.mjs`, `recept.mjs`, `kontroll.mjs`, `tolka.mjs`, `misstag.mjs`, `celler.mjs`, `kor-generator.mjs`), `scripts/validate-v7-questions.mjs`, `scripts/v7-parallel-check.mjs`, `scripts/v7-facit-check.mjs`, `scripts/render-matris-granskning.tsx`, `src/lib/traning/{svarighet,flaggor,bank.server,passgenerator,motor.server}.ts`, migreringen `20261011101000_testmotorn.sql`, bankerna i `src/lib/verbalTestV2/` och `src/lib/numericalTestV2/`.

Ingen fråga ur det här arbetet går in i någon skarp bank. Allt landar i kandidatfiler som testansvarig granskar.

## 0. Vad datan visar, vad jag gissar, och vad som inte får röras

Data (små volymer): medianen är 13 till 14 rätt av 15 på alla tre matrisnivåer, expert skiljer sig inte från grund. Expertbanken har prior 4 (antar 40 procent rätt) på 40 av 62 frågor i 3c, men mätningen säger närmare 90 procent. Verbalt och numeriskt saknar p-värden helt.

Gissning: expert är inte svår för att varje fråga bara kräver att man läser av en eller två sekvenser. Att vrida en pil 135 grader i stället för 45 gör inte frågan svårare, den gör den långsammare. Svårighet kommer av att flera regler måste hållas i huvudet samtidigt och av att de felaktiga svaren ser rätt ut på nästan alla sätt. Det är det bandet "svår plus" ska göra, och kalibreringen ska sedan säga om vi hade rätt.

Två fynd under förarbetet som ändrar beställningen:

1. **Tre latinska kvadrater av ordning 3 kan inte vara tre regler.** Två latinska kvadrater av ordning 3 ger antingen 3 eller 9 kombinationer av (värde A, värde B) över de nio rutorna, aldrig något däremellan, och bland alla 220 tripplar av kvadrater har minst ett par bara 3 kombinationer. Det betyder att en av de tre egenskaperna alltid är en omdöpning av en annan. Jag kontrollerade de fyra befintliga `v7e-3c-lfler-01` till `-04` ("Form, symbol och fyllning"): i alla fyra är ett par 3 av 9 (bas och fyllning i tre av dem, symbol och fyllning i den fjärde). De är tvåregelsfrågor med prior 4. De rörs inte nu (beslut 15.6: priorer sätts inte om för hand), men kalibreringen får visa det, och kravet på oberoende nedan (1.2) hindrar att det händer igen.
2. **Två rörelser i läsordning är alltid beroende av varandra över nio rutor.** En sekvens med period 8 (pil, prick på åtta lägen) bestämmer rutans plats i läsordningen, och allt annat som följer läsordningen blir då en funktion av den. Period 4 och 2 delar varandra. Det gör att "två rörelser med olika steglängd" (riktlinjerna 2.2 punkt 4) inte kan bli två oberoende regler i V7:s primitiver, och att "antal som ändras plus ett per kolumn" (punkt 5) är en parallell regel som V7-regel 1 förbjuder (granskning-figurer 2.1 säger samma sak). Punkt 4 och 5 utgår ur det här partiet. De kräver en ny sammansatt primitiv (G12) och beslutas separat.

Slutsatsen är principiell: **svår plus byggs av rutnätskopplade regler** (latinsk kvadrat, diagonal, schackmönster, överlagring), aldrig av fler läsordningssekvenser.

Får inte röras i den här beställningen:

- `src/lib/logicTestV7/renderers.v7.tsx` och `layered.v7.tsx` (en annan Opus gör renderarfixen och `scripts/v7-geometri-check.mjs` i en annan worktree). Geometrikontrollen dupliceras inte; den körs på kandidaterna när den finns på main (avsnitt 5).
- De sex skarpa bankerna `questionBank*.v7.json`. Inget id, inget rutnät, ingen text.
- Alla V7-regler i `reference_matrix_test_system.md`: inga parallella rader, synlig referensram, inga glyfer, symmetrifilter, högst fyra streck, varierade alternativ, variera regeln, sex alternativ.
- `uppdatera_fraga_statistik` och `slutfor_traningssession` i prod. Migreringen i avsnitt 3 skrivs och körs på Supabase-branch; prod bara efter ägarens ja (`reference_prod_migreringar_sakerhet`).

Ordregler i allt som skrivs: svenska, inga tankstreck, inga engelska gränssnittsord i regel- och misstagstexter.

---

## 1. Verktyg 1: generator för bandet "svår plus"

### 1.1 Definition av bandet

En fråga i bandet "svår plus" uppfyller allt detta:

- **Minst tre regler att hålla i huvudet**, räknat som antal dimensioner med en icke konstant regel i tolkningen (`tolka.mjs`, `t.regel` med `regel !== 'konstant'`), där regeln `overlagring-vriden` (ny, 1.3) räknas som två (operationen och vridningen).
- **Minst en regel är kopplad över hela rutnätet**: `latin`, `diagonal` eller `overlagring`/`overlagring-vriden`. Ingen regel är parallell (`kontroll.mjs` regel 1 gäller oförändrad).
- **Reglerna är oberoende av varandra**: för varje par av aktiva dimensioner X och Y gäller, med facit isatt, att antalet olika kombinationer (x, y) över de nio rutorna är större än antalet olika x-värden och större än antalet olika y-värden. Ingen dimension är alltså en funktion av en annan. (Det är detta som fäller tre latinska kvadrater.)
- **Distraktorerna stämmer på allt utom en regel**: minst tre av fem (avsnitt 2).
- En primitiv per cell (G12), sex alternativ, inga tomma figurer (G11), max fyra streck, ingen glyf.

Fältet i banken: `band: "plus"`, `difficulty: 4`, `p_prior: 0.3` (nivå 1 + 9 × 0,7 = 7,3, alltså under taket 7,5 i `flaggor.ts`, så passgeneratorn kan välja frågan som "över nivån" redan nu). `mekanism: "P1"` till `"P5"` enligt 1.2. `validate-v7-questions.mjs` ska acceptera `band` (bara värdet `"plus"`) och `mekanism` (sträng) som frivilliga fält.

### 1.2 Recepttyperna i parti 1 (40 frågor)

Alla fem bygger på befintliga primitiver i `types.v7.ts` och befintliga renderare. Familjen sätts av `familjFor` (ändring i 1.3).

**P1 Grundform och symbol i latinska kvadrater, fyllning på diagonalen** (8 frågor). Cell `stack`. `base` följer latinsk kvadrat A, `symbol` följer latinsk kvadrat B med A och B ortogonala (9 kombinationer; eftersom bara 3 eller 9 är möjliga räcker det att kräva 9). `baseFill` är `gray` på huvuddiagonalen (rutorna (0,0), (1,1), (2,2)) och `none` överallt annars. Krav: A och B har var för sig minst två olika värden på diagonalen, annars är fyllningen en funktion av formen (oberoendekravet fäller det maskinellt, men generatorn ska välja rätt från början). Baser ur `['circle','square','triangle','diamond']` (tre av fyra), symboler ur `['plus','minus','dot','cross','ring']` (tre av fem), varierat per fråga. Familj `latin-flera`. Regeltext: "Varje rad och varje kolumn har exakt en {bas1}, en {bas2} och en {bas3}, och exakt en med {sym1}, en med {sym2} och en med {sym3}. Formen och symbolen följer var sin ordning. Figurerna på diagonalen från övre vänstra hörnet till nedre högra är grå, de andra ofyllda."

**P2 Grundform och symbol i latinska kvadrater, fyllning i schackmönster** (8 frågor). Som P1, men `baseFill` växlar `none`/`gray` i läsordning med period 2 (schackmönster: rad 1 a b a, rad 2 b a b, rad 3 a b a). Startvärdet slumpas. Facit (ruta 8) har samma fyllning som ruta 0, 2, 4 och 6. Regeltext: "... Fyllningen växlar mellan ofylld och grå som ett schackmönster: varannan ruta i läsordning."

**P3 Pilens riktning i latinsk kvadrat, längden i schackmönster, spetsen på diagonalen** (8 frågor). Cell `vector`. `angle` tar tre värden ur de åtta 45-gradersmultiplerna, inga två med 180 graders skillnad (så att "motsatt riktning" inte finns i rutnätet), och följer en latinsk kvadrat. `length` växlar `long`/`short` i schackmönster. `head` är `open` på huvuddiagonalen och `filled` annars (eller omvänt, slumpat per fråga). Kravet att vinkeln inte är konstant på diagonalen som i P1. Familj `latin-flera`. Regeltext: "Varje rad och varje kolumn har pilen i var och en av de tre riktningarna exakt en gång. Längden växlar mellan lång och kort som ett schackmönster. Spetsen är öppen på diagonalen från övre vänstra hörnet till nedre högra, annars fylld."

**P4 Sektorhjul: överlagring och vridning** (8 frågor). Cell `sectorwheel`. Per rad (axel `kolumn`) eller per kolumn (axel `rad`): den tredje rutan är `op(första, andra)` vriden `k` steg om 45 grader, `op ∈ {xor, 'diff-ab'}`, `k ∈ {1, 3, 5, 7}` (udda multipler så att vridningen alltid syns; 2, 4 och 6 kan vara osynliga på symmetriska mängder). Mängderna a och b har 2 till 3 sektorer ur `SEKTORMONSTER` (asymmetriska), c har minst 1 och högst 5 sektorer. Alla tre rader eller kolumner använder samma op och samma k. Familj `overlagring`. Regeltext: "Den tredje rutan i varje rad visar det som finns i bara en av den första och den andra (det gemensamma försvinner), vridet {k × 45} grader {medurs|moturs}." Riktningen: k = 1 och 3 skrivs medurs (45 respektive 135 grader), k = 7 och 5 skrivs moturs (45 respektive 135 grader).

**P5 Streck från mitten: överlagring och vridning** (8 frågor). Som P4 med cell `ray`, mängder ur `STRALMONSTER`, 2 till 3 streck i a och b, c med 1 till 4 streck (G6: aldrig fler än fyra, läsbarhet).

Fördelning av varianter inom P4 och P5: op xor 5, diff-ab 3; axel kolumn 5, rad 3; k varierat så att ingen kombination (op, axel, k) förekommer mer än två gånger i partiet. Kvalitetsregel 8 (variera regeln) är det här.

### 1.3 Kodändringar

Allt nytt ligger i `scripts/lib/matris/` bredvid det som finns, med samma stil (kommenterade moduler, svenska namn).

**`tolka.mjs`**

- Ny regel `overlagring-vriden` för mängddimensioner med `n = 8` (`stralar`, `sektorer`): för båda axlarna, varje `op` i `OPS` och varje `k` i 1 till 7, kontrollera att `rotera(dim, franMangd(op(a,b)), k)` ger tredje rutan i de två fullständiga raderna eller kolumnerna. Lägg till fyndet med `pred` för rad eller kolumn 3 och `info: { op, axel, k }`. Lägg `'overlagring-vriden'` direkt efter `'overlagring'` i `ORDNING`. Ingen ändring för `tile` eller `lattice` (90-gradersvridningar är inte beställda).
- `familjFor`: när minst två aktiva regler finns och någon av dem är `latin`, är familjen `latin-flera`, oavsett om de övriga är `periodisk` eller `diagonal`. `overlagring-vriden` ger `overlagring`. Övrig logik oförändrad. Bevis att inget ändrats för de sex bankerna: `node scripts/v7-facit-check.mjs` grönt efteråt (den jämför `family` i banken mot `familjFor`).

**`misstag.mjs`**

- `textFor` får fallet `'overlagring-vriden'` i `textOverlagringVriden(q, t, R, F, regel)`. Ordning på kontrollerna, första träff vinner:
  1. F = op(a,b) utan vridning: "Lägger ihop rätt, men mönstret ska också vridas {k × 45} grader {medurs|moturs}."
  2. F = rot(op(a,b), −k): "Vrider åt fel håll."
  3. F = rot(op(a,b), k + 4): "Vrider rätt håll men ett halvt varv för långt." (bara när k + 4 inte är samma läge som k, alltid sant för udda k)
  4. F = rot(op'(a,b), k) för en annan operation op': "Vridningen stämmer, men " följt av den befintliga texten ur `textOverlagring` för op' mot op, med liten begynnelsebokstav (till exempel "Vridningen stämmer, men tar med det som finns i båda. Det gemensamma ska bort.").
  5. F = rot(a, k) eller rot(b, k): "Vrider bara {den första|den andra} rutan. De två ska först läggas ihop."
  6. Annars `textMangd` (ett streck eller en sektor för mycket eller för lite).
- `rattNamn` för `overlagring-vriden`: null (prefixet "stämmer, men" hanteras i punkt 4).

**`kontroll.mjs`**

- Ny kontroll i strikt läge, för alla frågor: **oberoende**. Med facit isatt, för varje par av dimensioner med icke konstant regel: räkna kombinationerna; är antalet lika med antalet olika värden i någon av de två dimensionerna, fel: `"{id}: {dimX} är en funktion av {dimY}"`. Undantag: dimensioner som `tolka` läser ur samma mängd i två vyer (ring vy 1, lattice vy 1) jämförs inte med sig själva. Körs på de sex bankerna som **upplysning** (de är frysta; beslut 15.6), som **fel** på allt med `band: "plus"`. Förväntat utfall på bankerna: `v7e-3c-lfler-01` till `-04` flaggas, inga andra latin-flera. Rapportera utfallet i leveransen; rör inte bankerna.
- Ny kontroll bara för `band: "plus"`: antal aktiva regler (med `overlagring-vriden` räknad som två) ≥ 3, minst en av `latin`, `diagonal`, `overlagring`, `overlagring-vriden`.
- Övriga kontroller oförändrade.

**`generera.mjs`**

- Byggare `latinTrippelStack(r, p)` (P1 med `p.fyll = 'diagonal'`, P2 med `p.fyll = 'schack'`), `latinTrippelPil(r, p)` (P3), `overlagringVriden(r, p)` (P4 med `p.format = 'sektor'`, P5 med `p.format = 'ray'`). Samma kontrakt som de befintliga: `{ family, title, rule, grid, facit, kandidater }`.
- Kandidatdistraktorer, i den här ordningen (så att "alla utom en" kommer först):
  - P1 till P3: för varje aktiv dimension d, facit med d satt till vart och ett av de andra värdena d kan ta i rutnätet (ger 2 + 2 + 1 kandidater som är rätt på två av tre regler). Därefter kandidater med två fel. Aldrig en kopia av en synlig ruta (den stämmer på för lite).
  - P4 och P5: op(a,b) ovriden, rot(op(a,b), −k), rot(op(a,b), k+4), rot(op'(a,b), k) för varje op' ≠ op, rot(a,k), rot(b,k), c med ett element till eller ett borttaget. Tomma mängder och fulla mängder filtreras som i dag.
- `bygg()` oförändrad i gränssnittet. Den väljer fem distraktorer som i dag (olika misstagstexter först) men för recept med `band: 'plus'` ska valet uppfylla distraktorkravet i avsnitt 2 innan `kontrollera` körs; annars nytt försök. Höj taket från 60 till 200 försök för plus-recept.

**`recept-plus.mjs`** (ny)

- `PLUS`: 40 recept, id `v7e-plus-{p1|p2|p3|over}-NN` (P4 och P5 delar prefixet `over` med format i receptet, löpnummer 01 till 16). Fält: `id, familj, byggare, p, difficulty: 4, band: 'plus', mekanism, p_prior: 0.3`.
- `UT = 'src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json'`.

**`kor-generator.mjs`**

- `genereraKandidater(recept, ut)`: som `genereraNiva` men utan id-lås (kandidatfilen får skrivas om tills den är godkänd) och med dubblettkontroll mot **alla** rutnät i de sex bankerna och i alla filer under `kandidater/`. Nyckeln är `stable(grid)` som i dag. Dessutom en mjukare dubblettkontroll för plus: två kandidater i samma parti får inte ha samma (mekanism, latinsk kvadrat A, latinsk kvadrat B) upp till permutation av värdena, annars är det samma fråga med andra former. Det räknas genom att ersätta värdena med ordningstal efter första förekomst och jämföra.

**`scripts/gen-expert-plus.mjs`** (ny): `node scripts/gen-expert-plus.mjs` kör `genereraKandidater(PLUS, UT)` och skriver ut antal per mekanism och antal försök per fråga.

**Kandidatkatalogen** `src/lib/logicTestV7/kandidater/`: ingenting i `src/` får importera därifrån. Nytt vitest `src/lib/logicTestV7/__tests__/kandidater.test.ts` läser alla filer under `src/` och felar på en importsökväg som innehåller `/kandidater/`. Samma test täcker `src/lib/verbalTestV2/kandidater/` och `src/lib/numericalTestV2/kandidater/` (avsnitt 4).

**Not för den senare befordran** (inte i den här beställningen, men verktygen ska inte göra den omöjlig): de klassiska nivåtesten drar sitt urval med Fisher-Yates över poolen (`selectFromPool`), så en större expertpool ändrar urvalet för pågående sessioner med `bank_version: 2`. Godkända plus-frågor går därför in som en egen export `EXPERT_PLUS` som ingår i `TRANINGSBANK` direkt (passen sparar sitt urval i meta) och i `poolFor('expert', 3)` med `BANK_VERSION = 3` för nya klassiska sessioner. Version 1 och 2 rörs inte.

### 1.4 Acceptanskriterier, verktyg 1

- `node scripts/gen-expert-plus.mjs` skriver 40 frågor till kandidatfilen, 8 per mekanism, utan fel, på under två minuter.
- Varje fråga: `band: "plus"`, `difficulty: 4`, `p_prior: 0.3`, `mekanism`, `family`, `misstag` med text på alla fem distraktorer (ingen `misstagGranskas`).
- `node scripts/validate-v7-questions.mjs <kandidatfil>` grönt. `node scripts/v7-parallel-check.mjs <kandidatfil>` grönt. `node scripts/v7-facit-check.mjs <kandidatfil>` grönt (facit entydigt, inga tvetydiga, family och misstag i takt med generatorn, strikt kontroll utan fel inklusive oberoende och plus-kraven).
- `node scripts/v7-facit-check.mjs` utan argument (alla sex banker) grönt, med exakt de fyra `lfler-01` till `-04` som nya upplysningar under oberoende och ingen annan förändring i utdata jämfört med före ändringen (spara utdata före och efter i `docs/qa/tester-v2/svar-plus-01/facit-check-fore.txt` och `-efter.txt`).
- Ingen kandidat har samma rutnät som någon fråga i de sex bankerna, och ingen (mekanism, A, B)-dubblett i partiet.
- Vitest: `kandidater.test.ts` grönt; nya enhetstester för `overlagring-vriden` i `tolka` (en konstruerad fråga per op och k = 1 och 7, båda axlarna: regeln hittas, pred stämmer, ingen tvetydighet) och för oberoendekontrollen (en konstruerad fråga med två latinska kvadrater med 3 kombinationer fälls, en med 9 godkänns).
- `npx tsc --noEmit` och `npm run test:run` gröna.

---

## 2. Verktyg 2: `scripts/v7-distraktor-check.mjs`

### 2.1 Vad som räknas

Kör: `node scripts/v7-distraktor-check.mjs <fil.json> [--krav=plus]`. Utan flagga: rapport och exit 0. Med `--krav=plus`: fel enligt 2.2 och exit 1. Används också inifrån `bygg()` för plus-recept (samma funktion exporterad från `scripts/lib/matris/distraktorer.mjs`, skriptet är ett tunt skal).

För varje fråga, ur `tolka(q)`:

- **Regellista R**: en post per dimension med icke konstant regel. En `overlagring-vriden` ger två poster: `op` och `vrid`.
- **Uppfylld** för ett alternativ S och en post:
  - vanlig dimension d: `vKey(värdet i S för d) === vKey(t.pred[d])`.
  - `op`: det finns ett k' i 0 till 7 så att S:s mängd = rot(op(a,b), k') (rätt operation, vilken vridning som helst).
  - `vrid`: det finns en operation op' i `OPS` så att S:s mängd = rot(op'(a,b), k) (rätt vridning, vilken operation som helst).
- **Nära miss**: ett alternativ som uppfyller exakt |R| − 1 poster.
- **Träff**: uppfyller alla poster (ska bara facit göra; annars är det redan ett fel i facitkontrollen).
- **Tomt**: uppfyller 0 poster när |R| ≥ 2.
- **Kopia**: alternativet är identiskt med en synlig ruta i rutnätet.

Per fråga skrivs en rad: id, |R|, antal nära miss, vilka poster de bryter, antal tomma, antal kopior. Längst ner en fördelning per bank (hur många frågor har 0, 1, 2, 3, 4, 5 nära miss). Det är upplysningen för de sex bankerna och grunden för att senare bedöma om de gamla distraktorerna duger.

### 2.2 Fel som stoppar (bara med `--krav=plus`)

1. Färre än tre nära miss bland de fem distraktorerna.
2. De nära missarna bryter inte varje post i R minst en gång (när |R| ≥ 3 ska alla tre regler brytas av någon; när |R| = 2 båda). Annars testas en regel aldrig.
3. Något alternativ är tomt (0 poster rätt) när |R| ≥ 2. Slumpdistraktorer finns inte i plus.
4. Fler än en kopia av en synlig ruta.
5. Två distraktorer bryter samma post på samma sätt (samma felaktiga värde i samma dimension) utan att skilja sig i något annat. (De är redan olika som helhet eftersom alternativen är unika, men två nära missar som båda sätter `base: 'triangle'` och är rätt i allt annat är omöjligt; kontrollen finns för att fånga ett generatorfel.)
6. Något alternativ är en tom figur (G11): ray utan streck, sektorhjul utan sektor, orbital utan prick när rutnätet har prick. På expert aldrig.

### 2.3 Acceptanskriterier, verktyg 2

- Skriptet går igenom alla sex banker utan att krascha och skriver fördelningen. Spara utdata i `docs/qa/tester-v2/svar-plus-01/distraktor-check-banker.txt`.
- Med `--krav=plus` på kandidatfilen: grönt för alla 40.
- Fixturer i `scripts/lib/matris/__fixtures__/` (eller inline i ett vitest): en plus-fråga som klarar, och en per felpunkt 1 till 6 som fälls med rätt text. Vitest `scripts/__tests__/distraktor-check.test.ts` (eller i `src/lib/logicTestV7/__tests__/` om vitest-konfigurationen kräver det) grönt.
- Skriptet tas in i valideringskedjan i `reference_matrix_test_system.md`-andan: dokumentera i filhuvudet att kedjan nu är validate, parallel, facit, distraktor, geometri (när den finns).

---

## 3. Verktyg 3: mätt svårighet och kalibreringsdata

Omgång 1 (annan Opus) bygger själva mekanismen: en kalibreringsfråga per pass och övningsprov för Premium, vald bland de minst besvarade med färre än 30 svar, slumpad plats, räknas i genomgången men inte i nivån eller tempot (riktlinjerna 2.4). Den här beställningen gäller hur svarsdatan samlas och läses.

### 3.1 Datakontrakt mot omgång 1

Skriv det här som en kort kontraktskommentar i `src/lib/traning/motor.server.ts` ovanför `statistik`-bygget och i `docs/design/tester-v2-2026-10-11/kontrakt-kalibrering.md` (en sida), så att omgång 1 bygger mot det:

- Sessionens meta: `meta.kalibrering = { q_id: string, index: number }` när passet eller övningsprovet har en kalibreringsfråga. Frågan står inte i `meta.fragor` (passets ordinarie urval) och aldrig i `meta.upprepade`.
- Svarsraden för kalibreringsfrågan i `answers` har samma form som övriga (`q_id, selected, visat, correct, time_spent, tiden_ute`) plus `kalibrering: true`.
- Vid avslut: kalibreringssvaret ingår **inte** i `nivaSvar`, tempot eller familjerna, men ingår **alltid** i `p_statistik` när sessionen är blandad, med `typ: 'kalibrering'`. Ordinarie svar får `typ` = `meta.typ` (`matning | pass | riktat | ommatning | general`). Svar på frågor i `meta.upprepade` skickas fortfarande inte.
- `uppdatera_fraga_statistik` räknar `typ` i en ny kolumn (3.2). Saknas `typ` räknas det som `'okand'`.
- Händelsen `kalibreringsfraga_svarad` med `fraga_id` (riktlinjerna 2.4) är omgång 1:s; nämns här bara så att namnet inte dubbleras.

### 3.2 Migrering `supabase/migrations/20261012090000_fraga_kalibrering.sql`

Additiv. Körs på Supabase-branch i testplanen. **Körs inte i prod utan ägarens ja**; skriv det i filhuvudet som i `20261011101000_testmotorn.sql`.

1. `alter table public.fraga_statistik add column if not exists per_typ jsonb not null default '{}'::jsonb;` Kommentar: antal svar per typ (`matning, pass, riktat, ommatning, general, kalibrering, klassisk, okand`).
2. `create or replace function public.uppdatera_fraga_statistik(p_svar jsonb, p_user uuid)`: samma kropp som i dag plus `per_typ = f.per_typ || jsonb_build_object(typ, coalesce((f.per_typ ->> typ)::int, 0) + 1)` där `typ := coalesce(e ->> 'typ', 'okand')`. Rättigheterna oförändrade (bara service_role).
3. Vy `public.fraga_kalibrering_vy`, ingen policy, `revoke all ... from anon, authenticated`, `grant select ... to service_role`. Den läser **råsvaren** ur `logic_test_v4_sessions`, så att vi kan räkna olika konton och skilja sammanhang, vilket `fraga_statistik` inte kan:

```sql
create or replace view public.fraga_kalibrering_vy as
with s as (
  select id, user_id, test_type, meta, answers
    from public.logic_test_v4_sessions
   where completed_at is not null
     and coalesce((meta ->> 'alternativ_blandade')::boolean, false)
     and user_id not in (select user_id from public.admin_undantagna_konton())
),
rader as (
  select s.id as session_id, s.user_id,
         a ->> 'q_id' as fraga_id,
         case
           when coalesce((a ->> 'kalibrering')::boolean, false) then 'kalibrering'
           when s.meta ->> 'typ' is not null then s.meta ->> 'typ'
           else 'klassisk'
         end as typ,
         (a ->> 'correct')::boolean as correct,
         greatest(0, coalesce((a ->> 'time_spent')::int, 0)) as tid_s
    from s, jsonb_array_elements(case when jsonb_typeof(s.answers) = 'array' then s.answers else '[]'::jsonb end) a
   where (a ->> 'q_id') is not null
     and (a ->> 'selected') is not null and (a ->> 'selected')::int >= 0
     and not (coalesce(s.meta -> 'upprepade', '[]'::jsonb) ? (a ->> 'q_id'))
)
select fraga_id,
       count(*)::int as svar,
       count(distinct user_id)::int as konton,
       sum(case when correct then 1 else 0 end)::int as ratt,
       round(avg(case when correct then 1 else 0 end)::numeric, 3) as p,
       round(avg(case when typ <> 'general' and correct then 1 else 0 end)::numeric, 3) as p_lugn,
       percentile_cont(0.5) within group (order by tid_s) as tid_median_s,
       jsonb_object_agg(typ, n) as per_typ
  from (
    select fraga_id, user_id, typ, correct, tid_s,
           count(*) over (partition by fraga_id, typ) as n
      from rader
  ) x
 group by fraga_id;
```

Implementatören får skriva om SQL:en så att den kör, men innehållet står: bara blandade avslutade sessioner, undantagna konton borta, "Vet inte" (selected −1) borta, upprepade borta, `typ` per rad, antal olika konton, p totalt, p utan övningsprov (`p_lugn`, provets tidspress sänker p och ska inte blandas in i nivån för lugna pass), medianen av svarstiden, antal per typ. Dubbletter per fråga och session finns inte (`unikaSvar` och `spara_testsvar_server` garanterar ett svar per nyckel).

4. Rollback-rader längst ner som i övriga migreringar.

`fraga_statistik` förblir motorns källa för p (`pForFraga`, 30 svar). Vyn är kalibreringens sanning och det som beslutar flyttar. De två ska stämma på `antal` och `ratt` för frågor utan kalibreringssvar före migreringen; avvikelser är ett fel i kontraktet.

### 3.3 Rapportskriptet `scripts/kalibrering-rapport.mjs`

Kör: `node scripts/kalibrering-rapport.mjs [--ut=docs/qa/tester-v2/kalibrering/<datum>.json] [--min-svar=30] [--min-konton=20]`. Läser `.env.local` som `scripts/qa-matris-blandning-konton.mjs` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, Jobbcoach-projektet, aldrig Begone). Läser vyn och alla bankfiler (sex skarpa plus `kandidater/*.v7.json`).

Per fråga: `id, fil, family, difficulty, p_prior_bank` (fältet `p_prior` eller `PRIOR_P[difficulty]` ur `svarighet.ts`, importera inte TS; kopiera tabellen med en kommentar om var den bor), `svar, konton, ratt, p, p_lugn, tid_median_s, per_typ`, och tre flaggor:

- `kalibrerad`: `svar ≥ 30` och `konton ≥ 20`. Motorn byter till uppmätt p vid 30 svar oavsett konton (det är så koden står); kontokravet är kalibreringens eget, för att en person som gör samma fråga var trettionde dag inte ska kalibrera den.
- `prior_fel`: `kalibrerad` och `|p − p_prior_bank| > 0,25` (riktlinjerna 2.4).
- `fel_niva`: `kalibrerad` och p utanför filens band: grund p ≥ 0,56 (nivå ≤ 5), avancerad 0,33 ≤ p ≤ 0,72 (nivå 3,5 till 7), expert p ≤ 0,50 (nivå ≥ 5,5), plus p ≤ 0,35 (nivå ≥ 6,85). Banden överlappar med avsikt: en fråga är inte på fel nivå för att den ligger i gränslandet.

Sammanfattning till stdout: antal kalibrerade per fil, median p per fil (bara kalibrerade), antal `prior_fel`, antal `fel_niva` med id-lista, och raden för `BANK_KALIBRERAD_OVER_7_5`: antal valbara frågor med `kalibrerad` och `p ≤ 0,278` (nivå ≥ 7,5). Flaggan i `flaggor.ts` sätts av testansvarig när det talet är minst 20 och de 20 kommer ur minst två familjer; skriptet säger "uppfyllt" eller "inte uppfyllt, n av 20".

Skriptet skriver aldrig till databasen och aldrig till bankerna.

### 3.4 När en fråga flyttas

Frågor flyttas aldrig mellan filer: sessioner med `bank_version 1` och `2` härleder sitt urval ur filens innehåll och ordning. Regeln för en fråga med `fel_niva`:

1. Testansvarig beslutar efter rapporten (ingen automatik).
2. Frågan får `pensionerad: true` i sin fil (som i avsnitt 15 i spec-rummen). Den ligger kvar för gamla sessioner.
3. Samma rutnät, alternativ, regel och misstag läggs som ny post med id `{målprefix}-flytt-{gammalt id}` (till exempel `v7a-flytt-v7g-3c-vrid-03`) i målnivåns kandidatfil, med `difficulty` ur det uppmätta p (p ≥ 0,78 → 1, ≥ 0,63 → 2, ≥ 0,48 → 3, annars 4) och `p_prior` = uppmätt p avrundat till två decimaler. Den går sedan samma väg som alla kandidater (validering, granskning, befordran med ny bankversion). `v7-facit-check` tillåter samma rutnät två gånger bara när den ena är pensionerad; så är det redan.
4. Statistiken följer inte med: det nya id:t börjar på noll. Rapportskriptet visar det gamla id:ts p som `p_arv` på den nya raden (slå upp via namnmönstret) så att det inte går förlorat.

Plus-frågor som efter kalibrering har p > 0,55 har inte lyckats vara svåra. De pensioneras inte för det, men `band` tas bort vid nästa generatorkörning och rapporten listar dem under "plus som inte höll".

### 3.5 Acceptanskriterier, verktyg 3

- Migreringen kör på en Supabase-branch utan fel, och `fraga_kalibrering_vy` ger samma `svar` och `ratt` som `fraga_statistik.antal` och `.ratt` för alla frågor i branchens testdata (seedat enligt testplanen) utom där rader har `kalibrering: true` eller `typ`, som bara vyn ser.
- `revoke`/`grant` enligt mönstret: `select` på vyn för anon eller authenticated ska ge rättighetsfel i ett test via anon-klient.
- `node scripts/kalibrering-rapport.mjs` mot branchen skriver JSON och sammanfattning; mot en tom vy skriver det "inga kalibrerade frågor" och exit 0, aldrig streck eller NaN.
- Kontraktet i `kontrakt-kalibrering.md` och kommentaren i `motor.server.ts` finns och säger samma sak.
- `uppdatera_fraga_statistik` i prod är oförändrad tills ägaren säger ja; leveransen säger det uttryckligen.

---

## 4. Verktyg 4: skrivformat och validering för verbalt och numeriskt

Inga generatorer. Opus skriver innehållet efter ett format, ett skript validerar, testansvarig granskar. Formatet matchar de befintliga bankerna (`verbalTestV2/questionBank.json` för verbalt avancerad, `numericalTestV2/questionBank.json` för numeriskt avancerad) med nya **frivilliga** fält, så att en godkänd text eller ett godkänt underlag kan läggas in utan konvertering.

### 4.1 Verbalt avancerad: schema och regler

Schemafil `scripts/schema/verbal-text.schema.json` (JSON Schema, dokumentation; valideringen skrivs för hand i skriptet, inga nya beroenden). En text:

```json
{
  "id": "va-01-hemtjanstens-schema",
  "title": "Hemtjänstens schema",
  "difficulty": 2,
  "topic": "Arbetsliv",
  "text": "180 till 220 ord ...",
  "statements": [
    { "text": "...", "correctAnswer": "cannot_say", "typ": "kvantor", "explanation": "..." }
  ],
  "kalla": "skriven 2026-10-12, parti 01",
  "p_prior": 0.6
}
```

Krav som `scripts/validate-verbal-bank.mjs <fil> [--niva=avancerad]` kontrollerar. Fel (exit 1) om inte annat sägs:

1. Fälten `id, title, difficulty, topic, text, statements` finns; `statements` har exakt 4; `correctAnswer ∈ {true, false, cannot_say}`; `explanation` finns och har minst 15 ord. `typ ∈ {direkt, slutledning, kvantor, utanfor}` frivilligt men rekommenderat (används av granskningen, inte av appen).
2. Id unikt i filen och mot `verbalTestV1`, `verbalTestV2` och `verbalTestExpert`; mönster `^va-\d{2}-[a-z0-9-]+$` för avancerad.
3. Textlängd 180 till 220 ord för `--niva=avancerad` (ord = mellanslagsseparerade). Grund rörs inte (riktlinjerna).
4. Minst ett `cannot_say`, minst ett `true`, minst ett `false` per text. Över filen 30 till 40 procent `cannot_say` (riktlinjerna: en tredjedel i avancerad; dagens V2 har 18 av 96, 19 procent).
5. Minst ett påstående per text med `typ: "kvantor"`, och ett kvantorpåstående ska innehålla något av `alla, ingen, inga, aldrig, alltid, varje, samtliga, enbart, bara` och ha facit `false` eller `cannot_say`, utom när samma ord står i texten (då varning, inte fel).
6. Två ståndpunkter: texten innehåller minst ett av `men, däremot, samtidigt, å andra sidan, kritiker, invänder, menar i stället, dock, trots`. Varning, inte fel, om inget finns.
7. Inget påstående återger texten ordagrant: ingen följd av 8 ord i påståendet förekommer i texten i samma ordning. Fel.
8. Påståendet högst 25 ord. Inga siffror i påståendet som inte finns i texten (annars är det ett räknetest). Varning.
9. Inga tankstreck någonstans (samma teckenkontroll som `TANKSTRECK` i `validate-v7-questions.mjs`, långt och kort tankstreck), inga engelska ord i gränssnittsfält (kontroll mot en kort lista: `passage, statement, true, false` i `title`/`text`/`statements[].text`, inte i `correctAnswer`). Dagens V1/V2 har titlar av typen "PASSAGE 1, tankstreck, Digitalt lärande"; kör skriptet på de befintliga bankerna och rapportera träffarna som upplysning, rör dem inte.
10. `explanation` nämner vad i texten som avgör: innehåller ordet `texten` eller `står` eller citerar minst 4 ord i följd ur texten. Varning.
11. `topic` ur en fast lista: `Arbetsliv, Samhälle, Hälsa, Miljö, Ekonomi, Teknik, Utbildning, Kultur`. Fel annars.

### 4.2 Numeriskt avancerad: schema och regler

Schemafil `scripts/schema/numerisk-underlag.schema.json`. Ett underlag följer `numericalTestV2` `Passage` (`id, title, type, topic, difficulty, contextText, dataTable | chartData, questions[4]`), med nya frivilliga fält som gör facit maskinellt kontrollerbart:

```json
{
  "id": "na-01-kommunbudget",
  "title": "Kommunens driftbudget",
  "type": "table",
  "topic": "Offentlig ekonomi",
  "difficulty": 2,
  "contextText": "...",
  "dataTable": { "headers": ["Förvaltning", "2024 (mkr)", "2025 (mkr)", "Förändring"], "rows": [["Skola", "1 240", "1 302", "..."]], "caption": "..." },
  "ovanvant": ["rad Kultur", "kolumn Förändring"],
  "enhetsbyte": "tkr till mkr",
  "questions": [
    {
      "id": "na-01-q01", "passageId": "na-01-kommunbudget", "questionNumber": 1,
      "questionText": "...", "difficulty": 2,
      "options": [
        { "id": "a", "text": "4,8 %", "isCorrect": false, "misstag": { "typ": "fel_rad", "uttryck": "(1302-1240)/1302*100", "varde": 4.76 } },
        { "id": "b", "text": "5,0 %", "isCorrect": true },
        { "id": "c", "text": "6,2 %", "isCorrect": false, "misstag": { "typ": "fel_kolumn", "uttryck": "...", "varde": 6.2 } },
        { "id": "d", "text": "2,5 %", "isCorrect": false, "misstag": { "typ": "steg_saknas", "uttryck": "...", "varde": 2.5 } }
      ],
      "correctAnswerId": "b",
      "berakning": {
        "steg": [
          { "text": "Ökningen i mkr", "uttryck": "1302 - 1240", "varde": 62 },
          { "text": "Andel av 2024", "uttryck": "62 / 1240 * 100", "varde": 5.0 }
        ],
        "visning": "5,0 %",
        "precision": 1
      },
      "explanation": "..."
    }
  ]
}
```

Krav som `scripts/validate-numerisk-bank.mjs <fil> [--niva=avancerad]` kontrollerar:

1. Struktur som ovan; exakt 4 frågor per underlag, exakt 4 alternativ per fråga, exakt ett `isCorrect: true` som matchar `correctAnswerId`. Id-mönster `^na-\d{2}-[a-z0-9-]+$` och `^na-\d{2}-q0[1-4]$`; unika mot `numericalTest`, `numericalTestV2`, `numericalTestExpert`.
2. **Räknekontroll.** Varje `uttryck` räknas med en liten egen utvärderare (tal med punkt eller komma, `+ - * / ^ ( )`, inget annat; ingen `eval`). Varje stegs `varde` ska stämma inom 0,5 procent. Sista stegets `varde` avrundat till `precision` ska vara talet i det rätta alternativets text (parsa svensk form: mellanslag som tusentalsavgränsare, komma som decimaltecken, enhet efter). Fel annars.
3. **Avrundningsmarginal.** Sista stegets `varde` i visningsenheten får inte ligga närmare än 0,1 från en halv (till exempel 24,48 fälls, 23,78 godkänns). Granskning-figurer 2.4.
4. **Siffrorna kommer ur underlaget.** Varje tal i ett `uttryck` med minst två siffror ska finnas i `dataTable`, `chartData` eller `contextText` (efter normalisering av tusentalsmellanslag och decimaltecken) eller vara ett tidigare stegs `varde`. Fel annars: då räknar frågan på något kandidaten inte ser.
5. **Distraktorer.** Varje fel alternativ har `misstag` med `typ ∈ {fel_rad, fel_kolumn, steg_saknas, fel_enhet, fel_operation, avrundning, fel_bas}`, `uttryck` som räknas och `varde` som avrundat till `precision` är alternativets tal. Alternativens tal är olika och skiljer sig med minst 3 procent relativt eller minst en visningsenhet. Fel annars. Det är "rätt räknat på fel siffra", maskinellt.
6. **Antal steg.** `--niva=avancerad`: 2 eller 3 steg i `berakning.steg` på minst 3 av 4 frågor (en fråga per underlag får vara ett steg, som inläsning). Expert: 3 eller fler på minst 2 av 4 (inte beställt nu).
7. **Oanvänt.** `ovanvant` har minst en post, och inget tal ur den raden eller kolumnen förekommer i något `uttryck` i underlaget. Fel.
8. **Enhetsbyte.** `enhetsbyte` finns och båda enheterna förekommer i `questionText` eller `contextText` i minst en fråga. Fel om fältet saknas för avancerad.
9. **Svensk talform** i `dataTable.rows`, `options[].text` och `contextText`: komma som decimaltecken, mellanslag som tusentalsavgränsare, mellanslag före enhet (`24 %`, `3,2 mkr`, `1 240 tkr`). Fel vid punkt-decimaler i nytt innehåll. Dagens banker använder punkt; kör skriptet på dem och rapportera som upplysning, rör dem inte.
10. "Cirka" i alternativtexten bara när `precision` är lägre än räkneresultatets, annars inte. Varning.
11. Inga tankstreck, inga engelska ord i text.
12. `type ∈ {table, graph}` för det här partiet (`word_problem`, `series`, `conversion` är inte beställda). `chartData` följer `ChartData` i `numericalTestV2/types.ts`; `graph` kräver `chartData`, `table` kräver `dataTable`.

### 4.3 Så skriver Opus första partiet

Två filer, inte importerade av något:

- `src/lib/verbalTestV2/kandidater/parti-01.json`: **8 texter, avancerad**, 32 påståenden, 10 till 12 `cannot_say`. Ämnen, ett per text: hemtjänstens schemaläggning, kommunal upphandling, distansarbete och kontorsyta, kollektivtrafikens taxor, kompetensutveckling på arbetstid, återvinning av byggmaterial, föreningsstöd, vårdköer och remisser. Varje text har två ståndpunkter med egna skäl, 180 till 220 ord, svensk sakprosa utan jargong. Påståendena: ett `direkt` (står i texten), ett `slutledning` (följer av två meningar), ett `kvantor` (byter alla mot många, ofta mot alltid, och liknande), ett `utanfor` (rimligt men inte avgörbart ur texten). Förklaringen säger vilken mening som avgör och varför det tredje svaret inte går att välja. Svenska facktermer (upphandling, remiss, taxa, driftbudget), inga engelska ord.
- `src/lib/numericalTestV2/kandidater/parti-01.json`: **8 underlag, avancerad**, 5 tabeller och 3 diagram (två stapel, ett linje), 32 frågor. Ämnen: kommunal driftbudget, lagersaldo och svinn, personalomsättning per avdelning, elförbrukning per kvartal, biljettintäkter per linje, byggprojektets kostnader mot plan, återvinningsgrad per fraktion, sjukfrånvaro per månad. Varje underlag har minst en oanvänd rad eller kolumn, ett enhetsbyte (tkr till mkr, kvartal till år, procent till antal), och frågor med 2 till 3 steg. Distraktorerna är alltid räknade: fel rad, fel kolumn, ett steg för lite, glömt enhetsbytet, fel bas för procent. Avrundningen håller sig från halvan. Alla tal i svensk form.

Arbetsgång för Opus: skriv, kör valideringsskriptet, rätta tills grönt, lämna till testansvarig. Testansvarig granskar varje text och underlag (entydighet, nivå, ton) och antecknar beslut per id i `docs/qa/tester-v2/verbalt-numeriskt-01/granskning.md` (testansvarigs fil, inte Opus). Inget går in i skarpa banker i den här omgången; befordran (lägga in i `questionBank.json`, uppdatera `PASSAGES_PER_SESSION`-beroende tester) beställs separat.

### 4.4 Acceptanskriterier, verktyg 4

- Båda skripten kör på de befintliga bankerna och skriver upplysningar (tankstreck i titlar, punkt-decimaler, cannot_say-andel 19 procent) utan att krascha, exit 0 utan `--niva`.
- Fixturer: för varje numrerad regel i 4.1 och 4.2 en minimal fil som fälls med rätt felrad, och en fil som klarar allt. Vitest för utvärderaren (`1 240 / 143 * 100`, komma och punkt, potens, parenteser, division med noll ger fel).
- Partifilerna finns, är gröna med `--niva=avancerad`, och `kandidater.test.ts` bevisar att inget i `src/` importerar dem.
- `npx tsc --noEmit` grönt (JSON-filer under `kandidater/` ska inte dras in av `resolveJsonModule` via någon import).

---

## 5. Verktyg 5: första produktionspartiet, 40 matrisfrågor "svår plus"

### 5.1 Körning

```
node scripts/gen-expert-plus.mjs
node scripts/validate-v7-questions.mjs src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json
node scripts/v7-parallel-check.mjs      src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json
node scripts/v7-facit-check.mjs         src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json
node scripts/v7-distraktor-check.mjs    src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json --krav=plus
node scripts/v7-geometri-check.mjs      src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json   (när skriptet finns på main; annars står "geometri ej kontrollerad" i leveransen)
npx tsx scripts/render-matris-granskning.tsx docs/qa/tester-v2/svar-plus-01 --fil=src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json
```

### 5.2 Granskningssidan

`render-matris-granskning.tsx` får flaggan `--fil=<sökväg>`: renderar **alla** frågor i filen, i filens ordning, i stället för urvalet per familj. Övrigt oförändrat (appens renderare via `SvgLayeredCell`, 380 px rutnät, alternativ två i bredd, Pixel 7-skala, PNG per fråga plus `index.html`). Tillägg i kortet för frågor med `band`: en rad under metan med `mekanism`, antalet regler (|R|) och distraktorkontrollens resultat per alternativ i formen "A bryter: symbol", "D bryter: op", "F: kopia av ruta 5", hämtat från samma funktion som skriptet i avsnitt 2 (importera från `scripts/lib/matris/distraktorer.mjs`). Så kan jag se figur, regel, misstag och vad varje distraktor testar på en skärm.

Filnamn för PNG: `{mekanism}-{id}.png`. Katalogen `docs/qa/tester-v2/svar-plus-01/` innehåller efter körningen: 40 PNG, `index.html`, `facit-check-fore.txt`, `facit-check-efter.txt`, `distraktor-check-banker.txt`, `distraktor-check-plus.txt`, och `geometri-check.txt` eller en rad om att skriptet saknas.

### 5.3 Vad som händer sedan

Testansvarig granskar alla 40 i `index.html` och PNG:erna och skriver beslut per id (godkänd, ändras, stryks) i `docs/qa/tester-v2/svar-plus-01/granskning.md`. Frågor som stryks får sitt recept bytt (annan slump via nytt löpnummer, inte samma id med nytt innehåll) och partiet körs om. Ingenting in i de skarpa bankerna, ingen ändring i `selectQuestions.v7.ts`, `bank.server.ts` eller `fragor.server.ts` i den här beställningen.

### 5.4 Acceptanskriterier, verktyg 5

- 40 frågor, 8 per mekanism, alla gröna i hela kedjan (geometri när den finns).
- `index.html` öppnas i webbläsare och visar 40 kort med figur, regel, misstag per alternativ och distraktorraden. Skärmdump av tre kort (ett P1, ett P3, ett P4) i leveransen.
- Ingen fråga har en kopia av en synlig ruta bland alternativen mer än en gång; inga tomma figurer.
- Alla regeltexter och misstagstexter på svenska, hela meningar, punkt, utan tankstreck och utan ordet "lätt".

---

## 6. Testplan

Kort och i den här ordningen. Allt körs i worktreen; inget mot prod.

1. **Enhetstester (vitest)**: `overlagring-vriden` i `tolka` (båda axlar, op xor och diff-ab, k = 1 och 7, ingen tvetydighet, pred rätt); oberoendekontrollen (3 av 9 fälls, 9 av 9 godkänns, latin plus schackmönster godkänns); `familjFor` oförändrad för alla frågor i de sex bankerna (snapshot av id → family före och efter); distraktorkontrollens sex felpunkter på fixturer; verbal- och numeriskvalidatorernas regler på fixturer; den aritmetiska utvärderaren; `kandidater.test.ts`.
2. **Valideringskedjan på de sex bankerna** före och efter ändringarna: identisk utdata utom de fyra `lfler`-upplysningarna. Sparas som i 1.4.
3. **Generatorn**: kör två gånger, kandidatfilen ska bli byte-identisk (deterministisk seed per id och försök). Kör med ett fejkat upptaget rutnät (lägg in en kandidats grid i en temporär kopia av en bank) och se att frågan byter försök och rutnät.
4. **Granskningssidan**: öppna `index.html`, kontrollera att 40 kort finns, att varje kort har distraktorraden, att PNG-filerna är 40 och att det kopparmarkerade alternativet i varje kort stämmer med `correctAnswer`.
5. **Supabase-branch**: kör migreringen; seeda tre sessioner för ett testkonto (ett pass med `meta.kalibrering` och en svarsrad med `kalibrering: true`, ett övningsprov `typ: general`, ett klassiskt expert-test utan `meta.typ`), plus en session för ett konto i `admin_undantagna_konton`. Kontrollera: vyn visar tre typer (`kalibrering`, `general`, `klassisk`) och inte det undantagna kontot; `p_lugn` räknar bort `general`; `uppdatera_fraga_statistik` med `typ` fyller `per_typ`; anon-klienten får rättighetsfel på vyn. Kör `kalibrering-rapport.mjs` mot branchen och mot en tom vy. Ta bort branchen efteråt. Radera bara egna rader med id (`feedback_testdata_stadning`).
6. **Verbalt och numeriskt**: validera partifilerna, välj två texter och två underlag och läs dem i appens befintliga komponenter genom en tillfällig lokal import i en testsida som inte checkas in (eller en fristående renderingsfil i scratch-katalogen, som `render-matris-granskning.tsx` fast för text och tabell), skärmdump på Pixel 7-bredd av tabellen som rullar i sin egen ram. Det är en läsbarhetskontroll, inte ett bygge av passformen.
7. **tsc, lint, vitest** gröna. Ingen ändring i `renderers.v7.tsx`, `layered.v7.tsx`, de sex bankerna eller någon prod-migrering (git diff ska visa det).

## 7. Ordning och leverans

Bygg i den här ordningen, en commit per steg med svensk commit-text:

1. `tolka` (ny regel, familj), `kontroll` (oberoende, plus-krav), `misstag` (texter), tester. Kör kedjan på bankerna och spara före/efter.
2. `distraktorer.mjs` plus skriptet och fixturerna.
3. Byggarna, `recept-plus.mjs`, kandidatläget i `kor-generator`, `gen-expert-plus.mjs`, `kandidater.test.ts`. Generera partiet.
4. Granskningssidans `--fil` och distraktorraden. Rendera.
5. Verbal- och numeriskvalidatorerna med scheman och fixturer. Skriv partierna. Validera.
6. Kalibreringskontraktet, migreringen, rapportskriptet. Branch-test.

Leveransen till testansvarig är ett kort meddelande med: sökvägar till kandidatfilerna och granskningskatalogen, utfallet av valideringskedjan på bankerna (de fyra `lfler`-upplysningarna och inget annat), om geometrikontrollen kördes, och en rad om att prod är orörd. Inga rapportfiler utöver dem som listas här.
