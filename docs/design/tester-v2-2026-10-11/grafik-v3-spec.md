# Grafik v3: figurspråket i matriserna

Datum 2026-10-12. Författare: art-director, med fullt mandat från ägaren ("snygga, snabbladdade frågor, proffsigt och påkostat, inget utrymme för feltolkningar"). Mottagare: Opus B (bygger), testansvarig (granskar mot G1 till G12), Opus A (generatorn ska bara välja kombinationer som klarar kontrollen nedan). Underlag: `plan-facit-genvag.md` avsnitt 4 (F1 till F12), `granskning-figurer.md` (G1 till G12), `skiss.html`, `riktlinjer.md` 5.1, `renderers.v7.tsx`, `geometri.json`, `v7-geometri-check.mjs`, `PassFraga.tsx`, `QuestionGridV7.tsx`, `AnswerOptionsV7.tsx`, `globals.css` (`.matrisyta`).

Sidan `grafik-v3.html` i samma katalog visar tretton riktiga bankfrågor, före och efter, ljust och mörkt, 360 och 1280. "Efter" är renderad ur samma celldata med en prototyp av renderaren som följer den här specen, inte ritad för hand. Varje mått nedan har körts genom en kopia av `v7-geometri-check.mjs` med de nya värdena: grönt på alla 252 valbara frågor och alla 720 lägen, och triangel med kryss, som i dag är spärrad som kombination, klarar G1 med 5,4 enheters fritt.

Ordregel: enheten är viewBox-enheter (0 till 100 per cell) om inget annat sägs. "Bläck" är `--ink-1`, "papper" är `--papper`, "ram-grått" är `--ink-3`, "koppar" är `--koppar` och "koppar-bläck" är `--koppar-ink`. Inga tankstreck i något som visas för kandidaten.

---

## 0. Beslutet i tre meningar

**Bläck på papper, referens i grått.** Allt som bär information (former, fyllningar, symboler, pilar, streck, sektorer) ritas i bläck med en enda konturbredd, 3. Allt som bara hjälper ögat att läsa läge (tomma rutor i blocken, orbitalens bana, luckans ram) ritas i ram-grått med en tunn linje, 2,5. Alla figurer har samma yttermått, 58 till 64, och fyller 80 procent av sin ruta både i matrisen och i svaret, så att ett alternativ ser ut exakt som det skulle se ut i luckan.

Det är tre regler, inte tolv. F1 till F12 i planen följer ur dem (tabellen i avsnitt 11).

---

## 1. Rutnätet, rutan och skalan

| Mått | 360 (Pixel 7) | 1280 | Regel |
|---|---|---|---|
| Frågekolumn | 328 px (16 px marginal) | 420 px (max-width) | Matris och alternativ delar kolumn |
| Matriskort | kolumnen; ram 1 px `--kant`, radie 16, inre luft 10 px, `--lyft` | samma | Som `PassFraga.Matris` i dag |
| Rutnät | 3 × 3, 1 px hårlinjer `--kant` mellan rutorna (`gap: 1px`, bakgrund `--kant`), inga egna ramar per ruta | samma | Raven-konvention, en matris, inte nio kort |
| Ruta | 102 px kvadrat | 133 px | `aspect-ratio: 1` |
| Figurens svg | 80 % av rutan = 82 px (luft 10 % per sida) | 106 px | **ändring**: i dag 72 % i passet, 76 % i klassiska testet |
| Pixel per enhet | 0,82 | 1,06 | `skala360.rutnat` = `skala360.alternativ` = 0,82 |
| Figurinnehåll [14, 86] | 59 px | 76 px | G5 kräver 56 |
| Alternativ | tre i bredd, 102 px kvadrat, luft 10 px mellan | 133 px | **ändring**: i dag två i bredd på mobil i klassiska testet |
| Figurens svg i alternativet | 80 % = 82 px | 106 px | **ändring**: i dag 62 % i passet, 76 % i klassiska testet |
| Figurinnehåll i alternativet | 59 px | 76 px | G5 kräver 48 |

Skalan är en: matris och alternativ har samma rutstorlek och samma luft, därför ser figuren likadan ut på båda ställena. Det tar bort en tolkningsrisk (i dag är alternativet 24 procent mindre än rutan i passet) och gör att `v7-geometri-check` bara behöver en skala, 0,82, för G5.

`QuestionGridV7` och `AnswerOptionsV7` (klassiska testet) byter till `PassFraga`-strukturen: ett kort, hårlinjer, tre i bredd, 80 procent. Höjdfällan i `reference_matrix_test_system` gäller: luckans ruta har samma svg-i-full-storlek-mekanism som fyllda rutor.

---

## 2. Linjer

| Namn | Bredd | Ändar | Används av |
|---|---|---|---|
| `kontur.sw` | **3** (2,46 px på 360, 3,2 px på 1280) | `round` cap och join | Grundformernas kontur, månghörning, pilens skaft och öppna spets, strålar, räknestreck, sektorhjulets ytterring, balanslinjen, former på balanslinjen, orbitalens mittpunkt, **alla symboler** (plus, minus, kryss, ring) inklusive krysset i 2×2, fyllda och grå rutors kontur i 2×2 |
| `kontur.swThin` | **2,5** (2,05 px) | `round` | Ringarnas kontur, sektorlinjerna i hjulet, balanslinjens avdelare, pilspetsens kontur när spetsen är fylld |
| `kontur.ram` | **2,5** (2,05 px) | `round` | Tomma rutors ram i 3×3 och 2×2, orbitalens bana, luckans ram |
| Ringarnas skiljelinje | **2,5** i papper | | Mellan två ringar, som i dag |

Ingen linje under 2,5. Dagens 2 (1,68 px) försvinner, så G5-raden "tunn kontur" blir en vanlig rad i kontrollen i stället för en upplysning. Ingen linje över 3; "tyngre bläck" vann inte: det som gör figurerna tyngre i efter-spalten är storleken (F7) och att referensen blivit grå, inte tjockare linjer.

Alla streck ritas med `shape-rendering="geometricPrecision"` (finns) och aldrig med `vector-effect`.

---

## 3. Färger

Renderaren fortsätter att skriva fasta hexvärden som `.matrisyta` i `globals.css` mappar till tokens. Det är den mekanism som finns och som klarar både mörkt läge och koppar i luckan; `<use>` får inte införas, eftersom attributselektorerna inte når in i en `<use>`-skuggträd (avsnitt 9).

| Roll | Hex i svg | Mappas till | Ljust | Mörkt (Tester) | Kontrast ljust / mörkt mot papper |
|---|---|---|---|---|---|
| Bläck (kontur, svart fyllning) | `#020617` | `--m-ink` = `--ink-1` | `#1A1A1F` | `#F3F2F7` | 17,3 / 15,3 |
| Grå fyllning | `#CBD5E1` | `--m-gra` = `--kant-stark` | `#C9C6BF` | `#3B4470` | 1,7 / 1,8, därför alltid bläckkontur (bläck på grå 10,2 / 8,4) |
| Papper (ringarnas fält, vit symbol på svart) | `#FFFFFF` | `--m-vit` = `--papper` | `#FFFFFF` | `#171B2E` | symbol på svart 17,3 / 15,3 |
| **Ram-grått (ny)** | `#64748B` | `--m-ram` = `--ink-3` | `#65656E` | `#9391A1` | 5,8 / 5,5 (krav 3:1 som referensram) |
| Rätt svar i luckan | | `.ratt-fylld`: `--m-ink` = `--koppar-ink`, `--m-gra` = `--koppar-mjuk`, `--m-ram` = `--koppar` | `#A8491A` | `#F2A368` | 5,8 / 8,3 |

Två ändringar mot i dag:

1. **Ram-grått är en egen roll.** Nytt fält `farger.ram: "#64748B"` i `geometri.json` (samma värde som `orbitalBana` i dag, som behålls som alias), och två nya rader i `globals.css`: `.matrisyta [fill="#64748B"] { fill: var(--m-ram) }` och `.matrisyta [stroke="#64748B"] { stroke: var(--m-ram) }`, med `--m-ram: var(--ink-3)` på `.matrisyta` och `--m-ram: var(--koppar)` i `.ratt-fylld`. Kontrollen G10 räknar då ram-grått som (`--ink-3`, `--papper`) per tema i stället för `#64748B` mot varje papper. Varför ink-3 och inte en ljusare grå: ink-3 finns redan, klarar 4,5:1 i båda lägena (så den fungerar även där den bär information, som orbitalens bana i vandringsfrågorna), och skillnaden mot bläck är ändå tydlig (5,8 mot 17,3).
2. **Rätt svar i luckan ritas i koppar-bläck, inte i koppar.** Koppar `#E07A2F` är 3,0:1 på vitt: bra som ram och punkt (gränssnittskomponent, krav 3:1), för svagt som figur (information, krav 4,5:1). Koppar-bläck är systemets kopparton för text och klarar 5,8 / 8,3. Alternativets ram och punkt står kvar i koppar, så "rätt svar i koppar" gäller fortfarande; det är bara figuren i luckan som får bläcktonen.

Mörkt läge: figurerna följer papperet (bläck ljust på mörkt papper), som `.matrisyta` gör i dag och som `grafik-v3.html` visar. Planens F12 ("cellerna ljusa") beskriver inte dagens kod och ska strykas; `grafik-v3.html` i mörkt läge är facit.

---

## 4. Formerna, exakta mått

Alla mått i `geometri.json`. Nominellt yttermått (utan kontur) ska ligga i **[58, 64]** (ny regel `regler.yttermatt`, avsnitt 10). Allt målat ligger i [14, 86] (G2), referensramar får gå till [10, 90].

### 4.1 Grundform med symbol (`stack`)

| Del | Mått | Not |
|---|---|---|
| Cirkel | r 30, kontur 3 | yttermått 60 |
| Kvadrat | x 20, y 20, sida 60, rx 4 | yttermått 60 |
| Triangel | (50, 18), (82, 80), (18, 80), join round | bredd 64, höjd 62 |
| Romb | (50, 18), (82, 50), (50, 82), (18, 50) | yttermått 64 |
| Symbolens centrum | cirkel, kvadrat, romb (50, 50); **triangel (50, 59)** | F4: triangelns tyngdpunkt är y 59,3; incentrum y 59,5; vi tar 59 |
| Plus | två streck 20 långa genom centrum, kontur 3 | F3 (i dag 16) |
| Minus | ett streck 20, kontur 3 | |
| Kryss | två diagonaler från (−7, −7) till (7, 7) och (−7, 7) till (7, −7), kontur 3 | 20 i diagonal, 14 i sida |
| Prick | r 5 | F3 (i dag 4); 8,2 px på 360 |
| Ring | r 7, kontur **3** (inte tunn) | F3 (i dag r 6, kontur 2) |
| Fyllning | ofylld: papper + bläckkontur; grå: `--m-gra` + bläckkontur; svart: bläck utan kontur, symbolen i papper | som i dag |

Fritt mellan symbol och bas (kontrollens G1, minst 4): plus i romb 4,1; kryss i triangel 5,4; plus i triangel 5,9; allt annat över 7. Symbolerna skrivs i `geometri.json` som offset från symbolens centrum, inte som absoluta koordinater, så att triangelns förskjutning är en siffra.

### 4.2 Månghörning (`poly`)

Radie **31** (i dag 30), kontur 3, start klockan 12, rotation runt (50, 50). Yttermått 62 i höjd för åttahörningen, 59 för femhörningen. Fyllning som grundform.

### 4.3 Pil (`vector`)

| Del | Lång | Kort |
|---|---|---|
| Spets, svans | y 24 till 76 (52) | y 32 till 68 (36) |
| Skaft | kontur 3, round cap, slutar 2 enheter under spetsen | samma |
| Spets | halvbredd 9, höjd 11; fylld: bläck med kontur 2,5; öppen: två streck i 3 | samma |

Skillnad lång mot kort 16 enheter = 13,1 px (G5 kräver 10). Åtta vinklar via `rotate` runt (50, 50).

### 4.4 Streck från mitten (`ray`)

Mittpunkt r **5** (i dag 4), strecklängd **30** från centrum (i dag 28), kontur 3, round cap. Yttermått 60. Två motsatta streck läses som en linje genom mitten; mittpunkten är det som gör dem till två (F6).

### 4.5 Räknestreck (`tally`)

Längd **48**, mellanrum **8** (i dag 44 och 7), kontur 3, round cap, centrerade; högst fyra (regel 6). Fritt mellan två streck 5 enheter = 4,1 px. Liggande = gruppen roterad 90 grader.

### 4.6 Ringar (`ring`)

Radier: en ring 31; två ringar 31 och 20; tre ringar 31, 23, 15. Kontur 2,5, skiljelinje 2,5 i papper (`--m-vit`) strax utanför den inre ringens kontur, som i dag. Varje ring är ett eget fält: ofylld = papper, grå = `--m-gra`, svart = bläck.

### 4.7 Prick runt en cirkel (`orbital`)

| Del | Mått |
|---|---|
| Bana | r 26, **prickad**: bredd 2,5, `stroke-dasharray="0 4.54"`, `stroke-linecap="round"` (36 prickar jämnt runt), ram-grått |
| Mittpunkt | r **5** (i dag 6); fylld i bläck eller ofylld med kontur 3 |
| Satellit | r **6** (i dag 5), bläck, centrum exakt på banan (G4) |

Yttermått 64 (satellitens ytterkant 50 ± 32). Prickad i stället för streckad: banan ska vara en referens och inte en kedja av streck som konkurrerar med satelliten; på 360 är prickarna 2 px och mellanrummet 3,7 px.

### 4.8 3×3-block (`tile`)

| Del | Mått |
|---|---|
| Ruta | 18, rx 2,5, nio rutor |
| Luft mellan rutor | **4** (i dag 2), start 19 |
| Tom ruta | ingen fyllning, ram **2,5 i ram-grått** |
| Fylld ruta | bläck med bläckkontur 2,5, så målad yta blir lika stor som den tomma rutans ram |

Yttermått 62 (17,8 till 82,2 målat). Det är F2-beslutet: **ljus ram runt tomma rutor, inte inget rutnät**. Utan ram skulle "en svart ruta i hörnet" inte gå att skilja från "en svart ruta nära hörnet", och regel 3 (synlig referensram) gäller. Luften 4 (3,3 px) gör att två fyllda grannrutor inte smälter ihop, vilket avancerad M2 behöver för "antal svarta rutor i latinsk kvadrat".

### 4.9 2×2-rutor (`lattice`)

| Del | Mått |
|---|---|
| Ruta | 28, rx 3, luft 4, start 20 |
| Tom ruta | ram 2,5 i ram-grått |
| Svart ruta | bläck, bläckkontur 2,5 |
| Grå ruta | `--m-gra`, bläckkontur 2,5 |
| Prick | r **5** i bläck, centrerad i rutan (i dag 4) |
| Kryss | två diagonaler med insats 8 från rutans kanter, kontur **3** (i dag 2), round cap |

Yttermått 60. Kryss finns inte i någon bank i dag; måttet står så att generatorn kan använda det utan nytt beslut.

### 4.10 Sektorhjul (`sectorwheel`)

Radie **31** (i dag 32), ytterring kontur 3, fyra diametrar i 2,5 i bläck ritade ovanpå sektorerna, fyllda sektorer i bläck utan kontur. Yttermått 62 nominellt, 65 målat. Diametrarna står kvar i bläck (inte ram-grått): där en svart sektor möter en tom ska gränsen vara samma linje hela vägen in till mitten.

### 4.11 Former kring en linje (`balanceline`)

Som efter granskningen 2026-10-11, med F8: linje y 50 från x 12 till 88 i 3 (referensram, får gå till 10); avdelare x 38,5 och 61,5 från y 47 till 53 i 2,5; former halvbredd 8 på x 27, 50, 73 och y 31 eller 69, kontur 3; kvadraten får rx 2; cirkel grå eller ofylld som i dag. Fritt mellan grannar 4,0 enheter.

### 4.12 Glyfer och lösa prickar (`glyph`, `dotsorbit`)

Finns i typerna men i ingen bank (regel 4 förbjuder glyfer, 15.8 förbjuder prickar utan ram). Måtten står kvar oförändrade i `geometri.json` så att inget bryts; renderas aldrig.

---

## 5. Luckan

Luckan är rutan nere till höger, alltid. Före svaret:

| Del | Mått |
|---|---|
| Rutans bakgrund | `--papper-2` (insjunken), till skillnad från de åtta andra rutorna i `--papper` |
| Ram | rect [16, 84], rx 8, bredd 2, `stroke-dasharray="5 4"`, ram-grått |
| Frågetecken | bana `M 38 40 A 12 12 0 1 1 55 51 Q 50 55 50 62`, bredd 5, round cap och join, ram-grått; prick (50, 73) r 3,2 | 
| Aldrig | text, typsnitt, koppar |

Frågetecknet ritas som bana så att det ser likadant ut på alla plattformar, inte väntar på typsnitt och inte kan ge layoutskift. Koppar används inte före svaret: koppar betyder "rätt svar" och ska bara betyda det. Det ersätter både dagens kopparstreckade ram i passet och "?"-texten i klassiska testet; båda vyerna får den här.

Efter svaret (bara passet): ramen och frågetecknet försvinner, rutan blir `--papper`, och rätt figur ritas i rutan med `.ratt-fylld` (koppar-bläck, avsnitt 3), samma 80 procent som de andra rutorna. Ingen animation utöver 150 ms opacitet på figuren; `prefers-reduced-motion` tar bort den.

---

## 6. Svarsalternativen

Sex kort, tre i bredd, kvadratiska, radie 12, ram 1 px `--kant`, bakgrund `--papper`, minsta träffyta 102 px (krav 44). Bokstaven A till F uppe till vänster: 11 px, vikt 600, `--ink-3`, 8 px från vänster och 6 px från toppen. Figuren i 80 procent, centrerad; bokstaven ligger i luften utanför [14, 86] och kan inte kollidera med figuren (figurens hörn börjar 21 px in på 360).

| Läge | Ram | Bokstav | Mer | Aria |
|---|---|---|---|---|
| Vilande | 1 px `--kant` | `--ink-3` | | "Svarsalternativ B" |
| Tryckt (`:active`) | | | bakgrund `--papper-2` | |
| Valt, inte skickat | 1 px `--ink-1` + inset 1 px `--ink-1` (2 px bläck) | `--ink-1` | | `aria-checked="true"`, ", ditt svar" |
| Efter svar: rätt | 1 px `--koppar` + inset 1 px `--koppar` | `--koppar-ink` | kopparpunkt 10 px uppe till höger | ", rätt svar" |
| Efter svar: valt och rätt | som rätt, plus yttre ring 3 px `--koppar-mjuk` | | punkt | ", ditt svar, rätt svar" |
| Efter svar: valt och fel | som valt (2 px bläck) | `--ink-1` | ingen punkt | ", ditt svar" |
| Efter svar: övriga | 1 px `--kant` | | `opacity: .38` | |

Inget läge skiljs bara med färg: rätt har punkten (form), valt har den tjocka ramen (vikt), nedtonade har opaciteten, och allt står i aria-texten. Aldrig rött, aldrig dolda, aldrig omsorterade, aldrig en bock inne i figuren (dagens `AnswerOptionsV7` har en bock som ersätter bokstaven; den försvinner, bokstaven står alltid kvar så att "jag valde C" går att säga).

---

## 7. 360 och 1280

Samma svg, samma proportioner; bara pixel per enhet skiljer (0,82 mot 1,06). Inget mått i figurerna är skrivet i pixel. På 1280 ligger frågekolumnen på 420 px med regelpanel eller klocka bredvid enligt skissen; matrisen växer aldrig över 420, för över 1,1 px per enhet blir 3-linjen 3,5 px och figurerna börjar se grova ut. Under 320 px bredd (sällsynt) tillåts figuren krympa med kolumnen; G5 gäller för 360.

---

## 8. Tillgänglighet

- Kontrast: alla informationsbärande linjer och fyllningar minst 4,5:1 mot papper i båda lägena (tabellen i avsnitt 3; lägst är ink-3 i mörkt på papper-2, 5,1). Referensramar minst 3:1 (koppar på vitt är exakt 3,0).
- Inget skiljs bara med färg: grå fyllning har alltid bläckkontur (grå mot ofylld skiljs av fyllningen, grå mot svart av konturen som syns på grå och saknas på svart), rätt svar har punkt och text, luckan har ram och frågetecken.
- Matrisen har `role="img"` med en aria-text som säger att det är åtta figurer och en lucka; alternativen är `role="radiogroup"` med `role="radio"`, `aria-checked` och bokstaven i aria-texten. Figurernas svg är `aria-hidden`.
- Träffytor 102 px på 360. Fokusstil: samma som valt (2 px bläck) plus `outline: 2px solid var(--koppar); outline-offset: 2px` vid `:focus-visible`.
- Rörelse: bara opacitet 150 ms vid svar; inget vid val.

---

## 9. Prestanda

| Krav | Mått | Hur det mäts |
|---|---|---|
| Inline svg, inga bilder, inga typsnitt i figurerna | 0 `<img>`, 0 `<text>`, 0 `url(` i matrisytan | enhetstest på renderarens utdata |
| Inga filter, skuggor, masker, gradienter i figurerna | 0 `<filter>`, `<mask>`, `<clipPath>`, `<linearGradient>`; ingen `filter:` i `.matrisyta` | samma test |
| Inget `<use>`/`<symbol>` | 0 | attributmappningen i `.matrisyta` når inte in i `<use>`; vinsten vore liten (varje figur är unik) och hydreringen blir enklare utan |
| Noder per fråga (8 rutor + 6 alternativ, inklusive svg-elementen) | **högst 160** svg-noder; uppmätt 32 (månghörning) till 144 (3×3-block) | räknas i `render-matris-granskning.tsx` och skrivs i index.html |
| Bytes per fråga, svg-markup | **högst 18 kB** okomprimerat; uppmätt 5,6 till 16,3 | samma |
| Layoutskift | CLS 0: alla rutor `aspect-ratio: 1`, svg `width/height: 100%`, inga typsnitt att vänta på i figurerna | `scripts/perf-inloggat.ts` på passet och klassiska testet |
| Första figuren | serverrenderad i html (passet är det redan); ingen klientberoende färg | |
| Färgbyte vid svar | bara css-variabler på `.ratt-fylld` och klasser på alternativen, ingen omrendering av svg | |

Målen ligger med marginal: en fråga är i storleksordningen 10 kB svg, och den tyngsta familjen (3×3-block, 14 figurer × 9 rektanglar) är 144 noder.

---

## 10. Mätbara regler till `v7-geometri-check.mjs` och testerna

Allt nedan läses ur `geometri.json`. Nya nycklar: `regler.yttermatt: [58, 64]`, `kontur.ram`, `farger.ram`, `stack.symbolCentrum`, `lattice.symbolSw`, `orbital.banaLinecap`, `lucka`, `skala360.alternativ` = 0,82, `g5.minPrickPx` = 8.

| Nr | Regel | Mått | Kontroll |
|---|---|---|---|
| V1 | Nominellt yttermått per primitiv i [58, 64] | stack 60/60/64/64, poly 62, vector lång 52 + spets (undantag: linjeformer räknas på längsta axeln, min 52), ray 60, tally 48 (undantag, linjegrupp), ring 62, orbital 64, tile 62, lattice 60, sectorwheel 62, balanceline 76 (ram) | ny rad i kontrollen: bounding box utan kontur per primitiv i grundläge; undantag listas i `regler.yttermattUndantag` |
| V2 | Ingen linje under 2,5 | `kontur.swThin`, `kontur.ram`, `ring.skiljelinje`, `orbital.banaSw`, `lucka.sw` (2 är tillåtet för luckan, som är gränssnitt, inte figur) | G5: raden "tunn kontur" blir vanlig rad med krav ≥ 2 px på 0,82 |
| V3 | Symbolerna i grundformen klarar G1 på alla fyra baser | fritt ≥ 4: plus i romb 4,1, kryss i triangel 5,4 | `allaKombinationer()` ska ge noll upplysningar; triangel + kryss stryks ur generatorns spärrlista |
| V4 | Symbolens centrum per bas | `stack.symbolCentrum[bas]`, symbolerna som offset | kontrollens `element()` läser offset, som i prototypen |
| V5 | Ram-grått finns bara på referens | element med `stroke`/`fill` = `farger.ram` ska ha `ram: true` i `element()`; tomma rutor i tile/lattice är `ram` | enhetstest: rendera varje primitiv i alla fyllningar, kolla att `#64748B` bara sitter på bana, tomma rutor och luckan |
| V6 | Målad yta tom ruta = fylld ruta i block | tile/lattice: tom ruta (ram 2,5) och fylld ruta (kontur 2,5) har samma bounding box | enhetstest på två renderade rutor |
| V7 | Orbitalens prickar jämna | 2π·26 / 4,54 = 36,0 ± 0,05 | enhetstest på `banaStreck` mot `banaR` |
| V8 | Kontrast per tema | ink-1, ink-3, koppar-ink mot papper och papper-2 ≥ 4,5; koppar mot papper ≥ 3; i varje rum och läge i `globals.css` | G10 läser tokens per `[data-rum]` och tema i stället för `#64748B` mot papper |
| V9 | Skala | `skala360.rutnat` = `skala360.alternativ`; 100 × skala ≥ 80 px | G5 |
| V10 | Luckan utan text | `LuckaV7` innehåller inget `<text>`; frågetecknets bana och prick ur `geometri.json.lucka` | enhetstest |
| V11 | Noder och bytes | ≤ 160 svg-noder och ≤ 18 kB per fråga över alla valbara frågor | `render-matris-granskning.tsx` skriver max per bank; test felar över gränsen |
| V12 | Inga förbjudna svg-element | 0 `<text>`, `<image>`, `<use>`, `<filter>`, `<mask>`, `<clipPath>`, gradienter i renderarnas utdata | enhetstest över alla valbara frågor |

G1 till G12 står oförändrade. G6-gränsfallen (25 frågor med precis 4 lägen) och G7-, G11-listorna hör till Opus A.

---

## 11. Före → efter: de tolv punkterna

| Nr | Före | Efter | Beslut |
|---|---|---|---|
| F1 | `swThin` 2 (1,68 px) | 2,5 (2,05 px); ny roll `kontur.ram` 2,5 | som planen, 2,5 i stället för 2,4 för att klara 2 px på den ärliga skalan 0,82 |
| F2 | nio bläckramar per block | tomma rutor i ram-grått 2,5, fyllda i bläck, luft 4 | **ljus ram** (inte "inget rutnät"): referensen måste finnas, regel 3 |
| F3 | plus 16, kryss 14, prick r 4, ring r 6 i 2 | plus och minus 20, kryss 20 i diagonal, prick r 5, ring r 7 i 3 | som planen; alla symboler i 3 |
| F4 | symbol på (50, 50) | triangel (50, 59), övriga (50, 50); offset i geometri.json | som planen |
| F5 | mitt r 6, satellit r 5, bana streckad `#94A3B8`/`#64748B` | satellit r 6, mitt r 5, bana prickad 2,5 i ram-grått (ink-3) | som planen, plus prickad |
| F6 | mittpunkt r 4, längd 28 | r 5, längd 30 | som planen (längden 30 för F7) |
| F7 | 56 till 64 blandat | alla i [58, 64]: grundform 60/64, poly 62, ray 60, pil 52/36, tile 62, lattice 60, hjul 62, orbital 64, ring 62 | ett fönster, ny regel V1; figuren i **80 procent** av rutan och alternativet (granskning 4.5 kräver minst 80) |
| F8 | halvbredd 8, y 31/69, avdelare 47 till 53 | samma; linje 3, avdelare 2,5, kvadrat rx 2 | som planen |
| F9 | längd 44, mellanrum 7 | 48 och 8 | som planen |
| F10 | `#CBD5E1` med bläckkontur | samma, mappas till kant-stark | behålls |
| F11 | 30/22/14, skiljelinje 2 | 31/23/15 (tre), 31/20 (två), 31 (en), skiljelinje 2,5, kontur 2,5 | som planen |
| F12 | "cellerna ljusa i mörkt läge" | figurerna följer papperet: bläck ljust på mörkt papper, som `.matrisyta` gör i dag | F12 rättas: det är kodens beteende och det godkända i `grafik-v3.html` |

Utöver de tolv: luckan (avsnitt 5), en skala i matris och svar (avsnitt 1), tre i bredd även i klassiska testet, rätt svar i luckan i koppar-bläck (avsnitt 3), bokstaven står alltid kvar i alternativet (avsnitt 6).

---

## 12. Figurserier, omgång 2

Samma figurspråk, inga nya primitiver. Fem figurer och en lucka i ett kort med hårlinjer mellan rutorna, som matrisen. Sex i bredd går inte på 360: rutan blir 54 px, figuren 43 px och innehållet 31 px, långt under G5:s 56. Därför **tre figurer per rad, två rader**, rutan 102 px, samma skala som matrisen, luckan sist i andra raden. Två rader även på 1280 (sex rutor i 420 px blir 70 px, innehåll 40 px), så att skalan är densamma som i matrisen. Alternativen som i matrisen. Konstruktionerna ur granskning-figurer avsnitt 4 (pil plus prick i hörnen, eller orbital med streck) ritas med måtten här; ingen egen fyrkantig ram inne i cellen. G9 (period ≥ 6) och V1 till V12 gäller.

---

## 13. Till Opus B, i ordning

1. `geometri.json`: värdena i avsnitt 4, 5 och 10 (prototypens fil `geometri-v3.json` i art-directors scratchpad har exakt dessa värden; strukturen är samma som i dag plus de nya nycklarna). `geometri.ts` får typerna.
2. `renderers.v7.tsx`: symbolerna som offset från `symbolCentrum`; tomma rutor i tile/lattice i `farger.ram` med `kontur.ram`, fyllda med bläckkontur; orbitalens bana prickad med round cap; ring r 7 i `sw`; kryss i lattice i `lattice.symbolSw`; ingen hårdkodad siffra kvar (`RING_GAP`, `radii`, `headSize`, lattice-positionerna läses ur `geometri.ts`).
3. `globals.css`: `--m-ram` och de två mappningsraderna; `.ratt-fylld` byter `--m-ink` till `--koppar-ink` och sätter `--m-ram: var(--koppar)`.
4. Ny `LuckaV7` (svg utan text) som `PassFraga`, `QuestionGridV7` och `MatrisMiniatyr` använder; `QuestionGridV7` och `AnswerOptionsV7` får `PassFraga`-strukturen och 80 procent; bocken i `AnswerOptionsV7` tas bort, bokstaven står kvar; lägena enligt avsnitt 6.
5. `v7-geometri-check.mjs`: V1 till V12 enligt avsnitt 10; grönt på alla banker utan upplysningen om tunn kontur; `allaKombinationer()` utan fynd.
6. `render-matris-granskning.tsx`: `--geometri=<fil>` och räkning av noder och bytes per fråga; omrendering av alla valbara frågor till `docs/qa/tester-v3/render/`.
7. Riktig webbläsartest enligt `feedback_riktig_webblasartest`: pass och klassiskt test, Pixel 7 och 1280, ljust och mörkt, skärmdump per figurgrupp, jämförd mot `grafik-v3.html`.

---

## 14. Vad som är verifierat och vad som är bedömning

Verifierat: alla mått i avsnitt 4 genom en kopia av `v7-geometri-check.mjs` med `geometri-v3.json` (G1 till G5 och G10 gröna på 252 valbara frågor, 3 780 celler, 720 lägen; triangel + kryss 5,4 fritt; plus i romb 4,1); kontrastvärdena i avsnitt 3 räknade med WCAG-formeln; nod- och bytestalen i avsnitt 9 ur `grafik-v3.html`; utseendet i `grafik-v3.html` renderat med Chrome på 360 och 1280, ljust och mörkt.

Bedömning: att ram-grått i ink-3 är rätt ton (en ljusare grå skulle ge en lugnare matris men kräver en ny token och faller under 4,5:1 där banan bär information); att 80 procent är rätt fyllnad (granskningen kräver minst 80, mer än 85 ger för lite luft mot hårlinjerna); att prickad bana slår streckad. Alla tre syns i `grafik-v3.html` och kan ändras med en siffra var.

---

## Bilaga: geometri.json i v3

Exakt de värden prototypen renderade med (glyph utelämnad, oförändrad). Opus B kopierar in dem i `src/lib/logicTestV7/geometri.json`.

```json
{
  "_om": "Grafik v3, art-directors förslag 2026-10-12. Samma struktur som geometri.json plus fälten farger.ram, kontur.ram, stack.symbolCentrum, lattice.symbolSw, tile/lattice utan egen ram per tom ruta. Enhet: viewBox 0 till 100 per cell.",
  "regler": {"inre":[14,86],"ram":[10,90],"minGap":4,"minAndpunktTillCentrum":6,"minLagen":4,"minPeriodFigurserie":6,"yttermatt":[58,64]},
  "skala360": {"rutnat":0.82,"alternativ":0.82},
  "skala1280": {"rutnat":1.05,"alternativ":1.05},
  "g5": {"minFigurRutnatPx":56,"minFigurAlternativPx":48,"minKonturPx":2,"minAvstandPx":3,"minPrickPx":8,"minLangdskillnadPx":10},
  "g10": {"information":4.5,"referensram":3},
  "farger": {"bakgrund":"#FFFFFF","stroke":"#020617","fillBlack":"#020617","fillGray":"#CBD5E1","vit":"#FFFFFF","ram":"#64748B","orbitalBana":"#64748B"},
  "kontur": {"sw":3,"swThin":2.5,"ram":2.5},
  "orbital": {"banaR":26,"banaSw":2.5,"banaStreck":"0 4.54","banaLinecap":"round","mittR":5,"satellitR":6},
  "stack": {"cirkelR":30,"kvadrat":{"x":20,"y":20,"bredd":60,"rx":4},"triangel":[[50,18],[82,80],[18,80]],"romb":[[50,18],[82,50],[50,82],[18,50]],"symbolCentrum":{"circle":[50,50],"square":[50,50],"triangle":[50,59],"diamond":[50,50]},"plus":[[-10,0,10,0],[0,-10,0,10]],"minus":[[-10,0,10,0]],"kryss":[[-7,-7,7,7],[-7,7,7,-7]],"prickR":5,"ringR":7},
  "lattice": {"ruta":28,"gap":4,"start":20,"rx":3,"prickR":5,"kryssInsats":8,"symbolSw":3},
  "ray": {"mittR":5,"langd":30},
  "tally": {"langd":48,"gap":8,"diagonalUtstick":4},
  "ring": {"radier":{"1":[31],"2":[31,20],"3":[31,23,15]},"skiljelinje":2.5},
  "vector": {"lang":{"spets":24,"svans":76},"kort":{"spets":32,"svans":68},"huvud":9},
  "poly": {"radie":31},
  "tile": {"ruta":18,"gap":4,"start":19,"rx":2.5},
  "sectorwheel": {"radie":31},
  "dotsorbit": {"banaR":30,"prickR":6},
  "balanceline": {"linjeY":50,"linjeX":[12,88],"xs":[27,50,73],"ovanY":31,"underY":69,"halvbredd":8,"avdelareX":[38.5,61.5],"avdelareY":[47,53]},
  "lucka": {"ram":[16,84],"rx":8,"sw":2,"streck":"5 4","fragetecken":"M 38 40 A 12 12 0 1 1 55 51 Q 50 55 50 62","frageteckenSw":5,"prick":[50,73,3.2]}
}
```
