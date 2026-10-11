# Att granska: bank_version 3, kandidaterna och parti 02

Datum 2026-10-12. Från Opus A till testansvarig. Inget av det här ligger i en skarp bank. `BANK_VERSION` är fortfarande 2 och V3-filerna är tomma. Befordran görs med en beslutsfil när granskningen är klar (sist i dokumentet).

## 1. Var allt ligger

| Vad | Granskningssida | Kandidatfil |
|---|---|---|
| Grund, 88 nya | `grund-v3-parti-01/index.html` (88 PNG) | `src/lib/logicTestV7/kandidater/grund-v3-parti-01.v7.json` |
| Avancerad, 68 nya | `avancerad-v3-parti-01/index.html` (68 PNG) | `.../avancerad-v3-parti-01.v7.json` |
| Expert, 24 nya (P6, P8, tre överlagringar, en spegling) | `expert-v3-parti-01/index.html` (24 PNG) | `.../expert-v3-parti-01.v7.json` |
| Plus parti 02: P1', P2 och P3 omkörda | `expert-plus-parti-02/index.html` (24 PNG) | `.../expert-plus-parti-02.v7.json` |
| Plus parti 01, som referens (P4 och P5 går vidare) | `expert-plus-parti-01/index.html` | `.../expert-plus-parti-01.v7.json` |
| Verbalt parti 02: 8 avancerad och 12 grund | `verbalt-parti-02.html` | `src/lib/verbalTestV2/kandidater/parti-02.json`, `parti-02-grund.json` |
| Numeriskt parti 02: 8 avancerad och 8 grund | `numeriskt-parti-02.html` | `src/lib/numericalTestV2/kandidater/parti-02.json`, `parti-02-grund.json` |

Varje matriskort visar mallen och p_prior i metan. Plus-korten har dessutom distraktorraden: vilken regel varje alternativ bryter.

## 2. Volymen mot målen

| Nivå | Kvar efter pensioneringen | Nya | Summa | Mål |
|---|---|---|---|---|
| Grund | 25 | 88 | 113 | 113 |
| Avancerad | 35 | 68 | 103 | 103 |
| Expert | 35 | 24 + 24 (parti 02) + 16 (P4, P5 ur parti 01) | 99 | 99 |

Pensioneras (`pensionerad_fran: 3`, kvar och valbara i version 2): 157 frågor, varav grund 64, avancerad 45 och expert 48. Det är 149 med facit lika ruta 0 och 8 uppräknade. Planen räknar 9 uppräknade, men `v7a-3c-lform-03` har också facit på ruta 0 och står därför i båda listorna.

## 3. Kontrollerna

Alla kontroller är gröna på kandidatfilerna:

- validate
- parallel
- facit med S1 till S9
- distraktor `--krav=v3` och `--krav=plus`
- geometri G1 till G12
- S8 och S10 per recept

Jag har också gjort en provbefordran med alla kandidater och `BANK_VERSION = 3` och sedan återställt den. Hela kedjan var grön, liksom hela vitest. Tabellen "facit per ruta" gav då:

| Nivå | Ruta 0 | Ruta 1 | Ruta 3 | Ruta 4 | Enrad |
|---|---|---|---|---|---|
| Grund | 8 % | 18 % | 18 % | 8 % | 49 % (upplysning) |
| Avancerad | 3 % | 12 % | 13 % | 5 % | 17 % (tak 40 %) |
| Expert | 0 % | 4 % | 4 % | 1 % | 1 % |

Kopior av ruta 0 och ruta 4 finns bara i latin-form och latin-antal med `diag: 'konstant'`.

## 4. Det jag vill att du tittar på först

1. **Plus parti 01: P1', P2 och P3 klarar inte S6.** I alla 24 är facit majoriteten i varje egenskap, så fyra av fem distraktorer kan strykas genom att räkna värden. Sju av dem (p1-10, -12, -15, p2-02, -04, -05, -08) har dessutom triangel med kryss, som geometrikontrollen spärrar (G1, 1,92 enheters fritt). Jag har därför byggt om dem som parti 02 med nya löpnummer:
   - p1-17 till -24
   - p2-09 till -16
   - p3-09 till -16

   Rutnäten är nya. Distraktorerna är balanserade så att varje värde förekommer minst två gånger, och triangel och kryss väljs aldrig tillsammans. Beslut: godkänns parti 02 i stället för de 24 i parti 01?
2. **P3 kan inte få högerförskjutning.** Med den är riktningen konstant på diagonalen, och då är spetsen en funktion av riktningen (oberoendet fäller den). Alla åtta har vänsterförskjutning och står i ett undantag från S8, precis som i parti 01.
3. **P7 är inte byggd.** Antal, startläge och vridning i en och samma strålmängd går inte att tolka per egenskap. Tolkningen ser strålarna som en mängd, så den kan inte skilja antalet från startläget. Det kräver en tolkning av sammansatta mängder (G12-frågan i beställningen). Volymen tas i stället av P8, som har 16 frågor i stället för 8.
4. **P6 har 4 frågor, inte 8.** Två former i två riktningar på balanslinjen ger bara två strukturer. Gånger två sidor blir det fyra olika utseenden (S10). Varianten med fyllning på diagonalen fälls av oberoendet, eftersom ett av två ortogonala lägen alltid är konstant på diagonalen. Fyllningen går därför i schackmönster. Är P6 tre läsningar, eller två latinska kvadrater med ett schackmönster (samma styrka som P2)?
5. **P8, dubbel överlagring.** Distraktorerna är mest ett element för mycket eller för lite, plus union och snitt där misstagstexten finns. Är frågan plus, eller bara expert?
6. **Avvikelser från tabellen i planen 2.5.** Följande går inte att bygga, och jag har ersatt dem:
   - 2×2 i M1 och M3: en fyrcykel i ett 3×3 ger alltid kopior eller speglingar.
   - Mönsterrotation med antal i latinsk kvadrat, och strålar eller sektorer med antal i latinsk kvadrat: en mängd kan inte både vridas och byta antal i tolkningen.
   - Två fyllningar i 2×2 med en prick i latinsk kvadrat: krockar i rutorna.

   Ersättarna:
   - mer orbital (M1 och M2 med diagonal eller schack)
   - M1 på sektorhjul och 3×3-block
   - M3 på balanslinjen
   - en enda 2×2 med prick i latinsk kvadrat (v7a-v3-vand-11).

## 5. Per mall: vad du ska kontrollera

Kontrollera minst tre frågor per recept för hand: facit mot regeln, distraktorerna mot misstagstexterna, och på expert att ingen enradsgenväg finns.

- **M1 linjär och fri** (pil, strålar, orbital, sektorhjul, block): är regeltexten begriplig utan ordet läsordning? Formuleringarna är "för varje steg åt höger i raden", "varje rad börjar 90 grader medurs jämfört med raden ovanför" och "varje rad har sitt eget startläge". M1 är enradsfrågor av konstruktion, och det är avsikten på grund.
- **M2** (pil eller orbital radvis, med spets, längd eller mittpunkt på diagonalen eller i schack):
  - Diagonalen är det som gör frågan till två regler.
  - Schack längs en rad är en vanlig växling, så frågorna med bara schack är enradsfrågor. Det gäller rotation med byte, 4 på grund och 5 på avancerad.
- **M2-pil-tre** (avancerad 6): riktning radvis, längd i schack och spets på diagonalen. Det är tre regler, men samma diagonalgenväg som P3 för spets och längd.
- **M4** (avancerad 8): mittraden vrider sig åt andra hållet. Stämmer misstagstexten "har vridit sig åt samma håll som i mittraden"?
- **M3 på balanslinjen** (grund 4, avancerad 4): kvadraten och cirkeln flyttar med olika steg och går aldrig i takt (G7). Ser det ut som två oberoende bilder?
- **Antal egen riktning**: rad 1 och 3 räknar upp, mittraden ner. Avancerad har strecken stående på diagonalen.
- **Latin-form och latin-antal**: hälften med `diag: 'olika'` (facit på ruta 1 och 3), hälften `konstant` (ruta 0 och 4), så att S1b håller. Utanför-värden förekommer bara i par. En ensam avvikare kan strykas utan att regeln lästs (S6).
- **Överlagring, spegling och latin-flera**: samma byggare som 3c, nya seeds.

Blindtestet ur planen 5.3: tio nya grundfrågor mot tio av dagens. Facit är aldrig en kopia av en synlig ruta utanför latin-antal och latin-form, så genvägen ska vara borta.

## 6. Verbalt och numeriskt parti 02

Granska tillsammans med parti 01.

- **Verbalt avancerad:**
  - Kvantorerna är antingen tydligt falska, med ett motexempel i texten, eller tydligt oavgörbara, där texten säger att det saknas uppgift.
  - 12 av 32 påståenden går inte att avgöra.
- **Verbalt grund:** ett påstående per text går inte att avgöra.
- **Numeriskt:**
  - Alla facit och distraktorer är räknade av validatorn.
  - Linjediagrammen förutsätter värdena vid punkterna, som finns på main.

## 7. Vad renderaren måste kunna (till Opus B)

Inget nytt. P6 använder balanslinjens kvadrat med `fill: 'gray'` eller `'none'`, som renderaren redan stöder. Den ska fortsätta läsas från `item.fill` i grafik-v3, och geometrikontrollen ska mäta den grå kvadraten som i dag. P8 använder strålar med upp till fyra streck och sektorhjul med upp till fem sektorer.

## 8. Fortfarande öppet

- **Admin:** kolumnen "Rapporter" och måttet "upprepade per vecka" (tillägget 2.3) är inte byggda. Det finns ingen sida för frågestatistik i admin att lägga dem i.
- **Rapportknappen** finns under regeln i passet och i genomgången. Den finns inte på de klassiska testens resultatsidor.
- **Migreringarna** `20261012100000_fraga_kalibrering.sql` och `20261012110000_fraga_rapporter.sql` är inte körda. De körs bara med ägarens ja.

## 9. Så går befordran till

1. Skriv beslutsfilen `docs/qa/bank-v3/beslut.json` med `{ "godkanda": ["v7g-v3-vrid-01", ...] }`. Ta med P4 och P5 ur parti 01 som ska in.
2. Strukna frågor får sitt recept med nytt löpnummer i `recept-v3.mjs` eller `recept-plus.mjs`. Kör sedan `node scripts/gen-bank-v3.mjs` och granska de nya.
3. Kör `node scripts/befordra-bank-v3.mjs --beslut=docs/qa/bank-v3/beslut.json --sla-pa`. Skriptet skriver V3-filerna, sätter P4 och P5 till p_prior 0,35 och sätter `BANK_VERSION = 3`.
4. Kör hela kedjan, vitest och build, och därefter klicktestet enligt planen 5.4.
