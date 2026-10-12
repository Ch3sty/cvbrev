# Plan: facit-genvägen i matrisbanken och bank_version 3

Datum 2026-10-12. Författare: testansvarig. Mottagare: ägaren (beslutet), saas-lead (ordning och omfattning), art-director (avsnitt 4), Opus-agenterna A och B (avsnitt 2, 3 och 5). Underlag: de sex bankerna i `src/lib/logicTestV7/` (270 frågor, 252 valbara), `scripts/lib/matris/{celler,tolka,kontroll,generera,recept,recept-plus,distraktorer}.mjs`, `scripts/v7-geometri-check.mjs` i worktreen efter-lyftet, `src/lib/logicTestV7/{selectQuestions,selectProv,fragor.server,blanda}.*`, `src/lib/traning/{bank.server,passgenerator,flaggor,gratisniva}.ts`, `granskning-parti-01.md`, `granskning-figurer.md`, `bestallning-svarare-fragor.md` (1.3 och 3.4), spec-rummen avsnitt 15. Räkningarna i avsnitt 1 och 3 är gjorda med egna läsande skript på bankerna i den här worktreen i dag. Ingen bank, ingen kod är ändrad av det här dokumentet.

Ordregel: facit heter facit i koden och i det här dokumentet; i gränssnittet heter det rätt svar. "Ruta 0" är rutan uppe till vänster (index 0 i läsordning), "ruta 4" är mittrutan.

---

## 0. Beslutet i korthet

1. **Orsaken är strukturell, inte ett generatorfel som kan rättas i efterhand.** Alla rörelser i läsordning går i cykler vars period delar 8, så ruta 9 är alltid ruta 1. Det går inte att transformera bort: permutera rader, spegla, byta riktning eller flytta startläget ger samma slutning. Transformation av befintliga frågor (alternativ a) är därför inte ett alternativ för de 129 frågor där det är regeln själv som sluter cykeln; för de 20 där det är en slump i en latinsk kvadrat eller spegling finns en transformation, men den ändrar rutnätet och kräver därmed ändå nytt id.
2. **Beslut: alternativ (b), generera om med nya recept och spärrar, som bank_version 3.** Alla 149 frågor med facit lika ruta 0 får `pensionerad_fran: 3` och ersätts en för en på samma nivå och i samma familj (med två undantag på expert, 2.5). I samma version går de 40 plus-frågorna in som `EXPERT_PLUS`, de 9 G7-brotten och de 15 tomma alternativen försvinner, och läsordningen ("läs rutorna som en lång rad") försvinner som regel från avancerad och expert och blir radvis även på grund. Det är också ett realismlyft: Matrigma, Raven och Alva bygger regler längs rader och kolumner, inte som en orm genom rutnätet.
3. **Sessioner med bank_version 1 och 2 rörs inte.** Poolen för version 2 fryses uttryckligen (fält `fran_version` och `pensionerad_fran`), så att resultatsidor och percentil för gamla sessioner är oförändrade. Ett snapshot-test låser urvalet för version 2.
4. **Spärrar som gör att det inte händer igen** (avsnitt 3): sju kontroller i `kontroll.mjs` och `distraktorer.mjs` som körs i `bygg()` och i `v7-facit-check`, plus två bankkvoter (andel per facitruta, andel enradsfrågor per nivå). Räknat på dagens bank fäller de 149, 189, 81, 59 och 20 frågor i respektive mått; på version 3 ska de ge noll fel.
5. **Grafiken** snyggas till i samma svep, men bara i renderaren och `geometri.json` (bankerna rörs inte). Art-director ritar en före/efter-sida som ägaren godkänner före bygget (avsnitt 4).
6. **Tid:** två Opus-agenter, A (bank, generator, version) och B (grafik), tre till fyra arbetsdagar inklusive min granskning av alla nya frågor. bank_version 3 kan gå ut i slutet av vecka 42 om parti 02 på expert går lika fort som parti 01.

---

## 1. Orsaken i detalj

### 1.1 Rättelse av siffrorna i granskning-parti-01

Granskningen 2026-10-11 skrev 159 av 252 (expert 54, avancerad 45). Räknat i dag med två oberoende jämförelser (råcellen med `stable`, och per dimension med `dimsFor`, som ger identiskt utfall på alla 252) är det **149 av 252 (59 procent)**. Grund stämde, expert och avancerad var för högt räknade. Jag vet inte vad som gick fel i den förra räkningen (troligen räknades pensionerade frågor med på två nivåer); det ändrar inte slutsatsen, men talen nedan är de som gäller.

| Nivå | Valbara | Facit = ruta 0 | Andel | Facit = någon synlig ruta | Facit = ruta 4 (mitten) | Prior 4 med facit = ruta 0 |
|---|---|---|---|---|---|---|
| Grund | 89 | 60 | 67 % | 75 | 43 | 0 av 0 |
| Avancerad | 80 | 43 | 54 % | 60 | 31 | 0 av 5 |
| Expert | 83 | 46 | 55 % | 54 | 27 | 33 av 40 |
| Totalt | 252 | 149 | 59 % | 189 | 101 | 33 av 45 |

Facits plats bland de åtta synliga rutorna, när facit är en kopia (grund / avancerad / expert): ruta 0: 60 / 43 / 46, ruta 1: 14 / 10 / 4, ruta 2: 1 / 1 / 2, ruta 3: 14 / 11 / 5, ruta 4: 43 / 31 / 27, ruta 6: 0 / 3 / 0, rutorna 5 och 7: aldrig. Kopiorna ligger alltså i det övre vänstra 2×2-blocket, med ruta 0 som den vanligaste på alla nivåer. Det är exakt det ägaren pekar på: "svaret är en viss ruta".

### 1.2 Varför cykler i läsordning alltid ger facit = ruta 0

Rutorna läses som en rad om nio: ruta 0 till ruta 8, där ruta 8 är luckan. En rörelse i läsordning med steget k i en cykel med n lägen ger ruta i = start + i·k (mod n). Ruta 8 = start + 8k. Alla lägen i V7 har n som delar 8:

- vinkel (pil), satellit (orbital), strålar och sektorer: n = 8, steg om 45 grader;
- 2×2-rutans läge och 3×3-blockets vridning: n = 4;
- växlingar (spets, längd, mittpunkt, stående/liggande): n = 2;
- antal som ökar eller minskar och börjar om: 1, 2, 3, 4, period 4.

Eftersom n delar 8 är 8k ≡ 0 (mod n) för varje k, så ruta 8 = ruta 0, alltid, oberoende av startläge, riktning och steg. Är k jämnt vid n = 8, eller n = 4, är dessutom 4k ≡ 0, så ruta 4 (mitten) är också lika med facit, och rutorna bildar par (0 = 4, 1 = 5, 2 = 6, 3 = 7). Det förklarar de 101 mittkopiorna och att "vanligaste figuren" pekar på facit i 81 frågor.

Växande steg ("kumulativ", 45, 90, 135 grader) räddar inte: summan 1 + 2 + ... + 8 = 36 ≡ 4 (mod 8), så ruta 8 står mitt emot ruta 0, men ruta 7 har offset 28 ≡ 4, så facit blir rutan till vänster om luckan, vilket regel 2 förbjuder. Vid n = 4 blir ruta 8 = ruta 7 = ruta 0. Därför har 3c-recepten ingen kumulativ variant, och de få frysta med "walk" i namnet är vanliga cykler.

Två rörelser i läsordning (familjen två rörelser, rotation med byte) hjälper inte heller: båda går med index i, så båda sluter sig efter åtta steg, och de går dessutom i takt (G7). Oberoendeflaggorna i granskning-parti-01 avsnitt 6 och G7-brotten är samma fenomen.

### 1.3 Varför även latinska kvadrater och speglingar hamnar på ruta 0

En latinsk kvadrat av ordning 3 har varje värde en gång per rad och kolumn. Värdet i luckan (2,2) står alltså också i rad 0 och rad 1, i kolumn 0 och kolumn 1: antingen i rutorna (0,0) och (1,1), alltså ruta 0 och ruta 4, eller i (0,1) och (1,0), alltså ruta 1 och ruta 3. Det finns inget tredje fall. Av de tolv kvadraterna har sex konstant huvuddiagonal (facit = ruta 0 = ruta 4) och sex har det inte (facit = ruta 1 = ruta 3). Generatorn väljer bland alla tolv, så ungefär hälften av latin-antal och latin-form landar på ruta 0: 6 av 17 och 10 av 27. I latin-flera (två ortogonala kvadrater) är alla nio kombinationer olika, så facit är aldrig en kopia (0 av 22).

Spegling (3 av 18) och överlagring (1 av 26) är slump: det speglade eller överlagrade mönstret råkar bli samma som rutan uppe till vänster. De fäller inte familjen, bara de frågorna.

### 1.4 Familjerna, antal per nivå

Valbara / facit = ruta 0, per nivå (grund, avancerad, expert) och totalt.

| Familj | Grund | Avancerad | Expert | Totalt | Karaktär |
|---|---|---|---|---|---|
| monsterrotation | 7 / 7 | 12 / 12 | 24 / 24 | 43 / 43 | strukturell, cykel |
| vridning | 12 / 12 | 7 / 7 | 4 / 4 | 23 / 23 | strukturell, cykel |
| vandring | 12 / 12 | 5 / 5 | 4 / 4 | 21 / 21 | strukturell, cykel |
| rotation-med-byte | 6 / 6 | 7 / 7 | 7 / 7 | 20 / 20 | strukturell, cykel |
| tva-rorelser | 4 / 4 | 6 / 4 | 11 / 3 | 21 / 11 | 2×2-vandrarna strukturell; balanslinjen när sidbytet går i läsordning |
| antal-andras | 5 / 5 | 4 / 3 | 5 / 3 | 14 / 11 | sekvensen strukturell (period 4); summan aldrig |
| latin-form | 15 / 6 | 10 / 3 | 2 / 1 | 27 / 10 | konstant diagonal, hälften av kvadraterna |
| latin-antal | 10 / 5 | 4 / 1 | 3 / 0 | 17 / 6 | samma |
| spegling | 4 / 2 | 7 / 1 | 7 / 0 | 18 / 3 | slump |
| overlagring | 7 / 1 | 11 / 0 | 8 / 0 | 26 / 1 | slump |
| latin-flera | 7 / 0 | 7 / 0 | 8 / 0 | 22 / 0 | aldrig kopia |
| **Summa** | **89 / 60** | **80 / 43** | **83 / 46** | **252 / 149** | |

Strukturella (regeln själv sluter cykeln): 107 i de fyra rena rörelsefamiljerna, 11 i två rörelser, 11 i antal som ändras, summa **129**. Slump eller halvslump (latin, spegling, överlagring): **20**.

På expert är 33 av de 40 frågorna med prior 4 (antagen andel rätt 40 procent) sådana cykler. Det är fortfarande min bästa förklaring till medianen 13 till 14 av 15 på expert. Hypotesen prövas i kalibreringsrapporten med flaggan `facit_ruta0` (granskning-parti-01 avsnitt 6 punkt 2); de pensionerade frågornas svarsdata ligger kvar i `fraga_statistik` och `fraga_kalibrering_vy` på sina id, så prövningen går att göra även efter version 3.

### 1.5 Fler genvägar som räkningen hittade, utöver ruta 0

Räknat på de 252 valbara (grund / avancerad / expert):

- **Facit är den vanligaste figuren bland de åtta synliga** (när någon figur förekommer minst två gånger): 31 / 25 / 25. Följer av paren i 1.2. För latinska kvadrater är det omvända sant: facit är den minst vanliga (två av åtta), vilket är själva lösningsmetoden ("vilken saknas") och inte en brist.
- **Enradsgenväg, strikt**: facit följer av rad 3 ensam (rotation: 2·ruta 7 − ruta 6; växling: tillbaka till ruta 6; inget annat vetande): 24 / 19 / 16. Alla i rörelsefamiljerna. På expert ska det vara noll.
- **Facit udda**: facit är ensamt om sitt värde i någon dimension medan minst två distraktorer delar värde där ("den som sticker ut är svaret"): 9 / 9 / 2.
- **Eliminerbar distraktor**: en distraktor är ensam om sitt värde i en dimension där facit delar värde med någon annan (den kan strykas utan att regeln lästs): finns i 53 / 40 / 36 frågor, 419 alternativ totalt, 119 frågor med minst två sådana. Det är de "utanför"-distraktorerna (fjärde formen, svart fyllning när ingen är svart, prick i stället för plus) som latin-form och latin-antal lägger till för att fylla sex alternativ. De gör sex alternativ till fyra.
- **Tomma alternativ** (G11): geometrikontrollen räknar 15 i 15 frågor (2 på expert). Min bredare räkning, som också tar orbital utan prick, ger 21 i 21 frågor. Båda måtten går till noll i version 3 eftersom G11 blir ett fel i `bygg()`.
- **G7, två rörelser i takt**: 9 frågor enligt `v7-geometri-check` (`G7_KANDA`): `v7g-3c-tva-01`, `-02`, `-04`, `v7a-3c-tva-01`, `-02`, `v7e-3c-tva-01`, `-02`, `-04`, `v7e-b2`. Alla utom `v7e-3c-tva-04` och `v7e-b2` har också facit = ruta 0.

---

## 2. Alternativen och beslutet

### 2.1 (a) Transformera befintliga frågor: nej, det går inte för 129 och ger nytt id för alla

Jag har prövat varje transformation mot matematiken i 1.2:

| Transformation | Rörelse i läsordning (129) | Latin, spegling, överlagring (20) |
|---|---|---|
| Permutera rader eller kolumner | Förstör regeln: läsordningen är själva regeln | Latin bevaras. Byt rad 0 och rad 1 så flyttar kopian från ruta 0 till ruta 3. Rutnätet ändras |
| Flytta luckan från nedre högra | Luckan på plats i ger facit = ruta i−8 eller i+8, alltid en annan synlig ruta i cykeln | Tekniskt möjligt, men bryter formatet (2.6) |
| Spegla eller rotera hela matrisen | Samma cykel i annan ordning: ruta 8 = ruta 0 fortfarande | Bevaras, rutnätet ändras |
| Byta cykelriktning | 8·(−k) ≡ 0 också | Ej tillämpligt |
| Byta startläge | Ruta 8 = ruta 0 oavsett start | Ej tillämpligt |
| Växande steg | Facit = rutan till vänster (regel 2) | Ej tillämpligt |

Och även där en transformation finns gäller: **ett incheckat id får aldrig byta innehåll** (`kor-generator.mjs`, bank3c.test). Sessioner med bank_version 1 och 2 ritar sin genomgång ur filens innehåll; ändrar vi rutnätet under samma id får en kandidat som svarade i går se en annan fråga på sin resultatsida i dag. Varje ändrad fråga är därför en ny fråga med nytt id, och den gamla pensioneras. Då finns ingen skillnad mot alternativ (b) utom att (b) dessutom får nya spärrar och bättre recept. `fraga_statistik` är knuten till id: den gamla frågans historik stannar på det gamla id:t (och är användbar för hypotesprövningen), den nya börjar på noll, precis som flyttregeln 3.4 i beställningen redan säger.

### 2.2 (b) Generera om med generatorn och nya spärrar: ja

Det är så banken byggdes (3c, 186 frågor på en körning) och det är det enda sättet att få spärrarna in i källan i stället för i efterhandskontrollen. Vad som är nytt mot 3c: tre nya byggmallar (2.4), en ny regel i tolkningen (`rad-steg`), spärrarna i avsnitt 3 inne i `bygg()`, och recept per nivå och familj som ersätter de pensionerade en för en.

### 2.3 (c) Pensionera utan ersättare: nej, utom två familjer på expert

Gratisnivån och planens pass behöver minst 80 valbara per nivå hela tiden (`BANK_RACKER_MINST_PER_NIVA`, 30 dagars pass om 9 plus nivåkoller plus övningsprov om 35 med återanvändning efter 30 dagar). 89 − 60 = 29, 80 − 43 = 37, 83 − 46 = 37: utan ersättare faller alla tre nivåer under gränsen, och mätningen (12 frågor i mellanbandet) skulle dra ur ett tiotal frågor. Pensionering utan ersättare är därför bara möjlig där familjen inte hör hemma på nivån: på expert tas de rena rörelsefamiljerna (vridning, vandring, rotation med byte, hela mönstret vrider sig) bort som egna frågor, eftersom expert ska vara "tre regler" (riktlinjerna 2.3) och en ren rörelse aldrig är det. Volymen ersätts av plus-bandet och ett parti 02 (2.5).

### 2.4 De tre byggmallarna som ersätter läsordningen

Alla tre bygger regeln längs rader och kolumner, så som leverantörernas matriser gör. Ordet "läs rutorna som en lång rad" försvinner ur alla nya regeltexter.

**M1 Radvis rörelse.** Ruta (r, c) = T^(k·c)(P_r): inom varje rad tar figuren k steg per kolumn; P_r är radens startfigur. Två varianter:
- *M1 linjär*: P_r = T^(d·r)(P_0), alltså varje ny rad börjar d steg längre fram. Facit = start + 2d + 2k. Tillåtna (d, k) är de där facit inte är lika någon synlig ruta: för n = 8 kräver det d ≠ 0, k ≠ 0, d ≠ 4, k ≠ 4, d + k ∉ {0, 4, 8}, d + 2k ≢ 0, 2d + k ≢ 0 (mod 8). Exempel som klarar: (d, k) = (1, 1), (2, 1), (1, 2), (5, 1), (1, 5). Läsordningen är specialfallet d = 3k och är uteslutet. För n = 4 (2×2-läge, 3×3-blockets vridning) finns **ingen** tillåten kombination: i ett 3×3 över en fyrcykel är facit alltid en kopia. Där används bara M1 fri.
- *M1 fri*: P_0, P_1, P_2 väljs fritt så att ingen är en vridning av en annan (3×3-block: tre olika mönster ur `TILEMONSTER`; 2×2: tre olika rutmönster; pil, orbital, strålar: startlägen s_r så att facit s_2 + 2k inte finns bland {s_r + k·c}). Regeltext: "Blocket roterar 90 grader medurs för varje steg åt höger i raden. Varje rad har sitt eget block."

Facit följer ur rad 3 ensam i M1 (enradsgenvägen). Det är acceptabelt på grund, där en regel ska räcka, och det är så Matrigmas lätta uppgifter fungerar. På avancerad får högst 40 procent av frågorna vara enradsfrågor, på expert ingen (spärr S4).

**M2 Radvis rörelse plus en rutnätskopplad regel.** M1 på en dimension, och på en annan dimension en regel som inte går att läsa ur rad 3 ensam: latinsk kvadrat på en tredelad egenskap (antal streck 2/3/4, fyllning, symbol, antal ringar, prickens läge), diagonal, eller en kolumnvis rörelse på ett annat element (M3). Schackmönster räknas inte som rutnätskopplad här, eftersom det längs en rad är en vanlig växling.

**M3 Två element, två riktningar.** Element A rör sig radvis (M1 linjär, (d, k)), element B rör sig kolumnvis (värde = t + m·r + e·c med (m, e) ≠ (d, k) och e ≠ 0, m ≠ 0). Då beror båda på både rad och kolumn (regel 1 om "kolumn bestämmer" bryts inte), och de går inte i takt (G7) eftersom paren (A, B) över de åtta rutorna är åtta olika. Ersätter 2×2-vandrarna och balanslinjens läsordnade sidbyte.

Latin-antal och latin-form behåller sin byggare men får receptparametern `diag: 'olika' | 'konstant'` som växlar i receptlistan, så att hälften av frågorna har facit på ruta 1 och 3 och hälften på ruta 0 och 4 (spärr S1b i stället för förbud, se 3.2). Antal-andras bygger på summan (`antalSumma`) och på "varje rad har sin egen riktning" (rad 1 ökar, rad 2 minskar, rad 3 ökar) i stället för period 4 i läsordning.

### 2.5 Exakt vad som görs per nivå och familj

"Pensioneras" = `pensionerad_fran: 3`. "Nya" = antal nya frågor i `questionBank<Nivå>V3.v7.json` med `fran_version: 3`. Nivåerna ska efter version 3 ha minst 80 valbara var; målet är grund 93, avancerad 83, expert 93.

**Grund (pensioneras 60 + 4 med tomt alternativ som inte redan faller: `v7g-q26-orbital-fill-latin`, `v7g-3c-lform-07`, `v7g-3c-over-01`, `v7g-3c-over-04`; nya 68)**

| Familj | Pensioneras | Nya | Recept |
|---|---|---|---|
| vridning | 12 | 12 | M1: pil 7 (k 1, 2, 3 i båda riktningarna; fyra linjära, tre fria), strålar 5 (mönster ur `STRALMONSTER` utan rotationssymmetri; tre linjära, två fria) |
| vandring | 12 | 12 | M1: orbital 7 (k 1, 2, 3; fyra linjära, tre fria), 2×2-ruta 5 (M1 fri; kopior oundvikliga vid n = 4, så S2 kräver minst två distraktorer som också är kopior, och S1b styr platsen) |
| monsterrotation | 7 | 7 | M1 fri: 3×3-block 3 (tre olika mönster per fråga, k = 1 i båda riktningarna), sektorhjul 2 (M1 linjär, n = 8), 2×2 med två fyllningar 2 (M1 fri) |
| rotation-med-byte | 6 | 6 | M2: pil radvis (M1) och spets eller längd som växlar per kolumn inom raden med radvis fas (fas_r så att facit inte kopierar), 4; orbital radvis och mittpunkt som växlar, 2 |
| tva-rorelser | 4 | 4 | M3: 2×2 med svart ruta radvis och prick kolumnvis, 2; balanslinje med kvadrat radvis och cirkel kolumnvis, sida fast, 2 |
| antal-andras | 5 | 5 | `antalSumma` 2 (stående, liggande), "egen riktning per rad" 3 (streck 2, sektorer 1) |
| latin-form | 6 | 7 | samma byggare, `diag: 'olika'` på alla nya så att familjen på nivån blir hälften och hälften; ersätter också lform-07 |
| latin-antal | 5 | 5 | samma byggare, `diag: 'olika'` på alla nya |
| spegling | 2 | 2 | samma byggare, ny seed, S1 som fel |
| overlagring | 1 | 3 | samma byggare, ny seed, S1 och G11 som fel; ersätter också over-01 och over-04 |
| latin-flera | 0 | 1 | samma byggare, ny seed |
| orbital-latin (q26) | 1 | 1 | ingår i latin-form ovan (orbital-lage), räknas där |

**Avancerad (pensioneras 43 + 3 med tomt alternativ eller G7 som inte redan faller: `v7a-3c-lform-03`, `v7a-3c-over-04`, `v7a-3c-tva-05` (balanslinje med sidbyte i läsordning, facit på ruta 4); nya 46). Alla nya har två regler.**

| Familj | Pensioneras | Nya | Recept |
|---|---|---|---|
| monsterrotation | 12 | 10 | M2: sektorhjul radvis (M1 linjär) och antal sektorer i latinsk kvadrat per rad och kolumn (tre mönster med 2, 3, 4 sektorer som vrids), 4; 3×3-block radvis (M1 fri) och antal svarta rutor i latinsk kvadrat (3, 4, 5), 3; 2×2 med två fyllningar radvis och fyllningstyp i latinsk kvadrat (svart, grå, prick), 3 |
| vridning | 7 | 7 | M2: pil radvis och spets på diagonalen (P3-varianten utan längd), 3; strålar radvis och antal streck i latinsk kvadrat (2, 3, 4), 4 |
| rotation-med-byte | 7 | 7 | M2: pil radvis, längd växlar inom raden, spets på diagonalen, 4; orbital radvis, mittpunkt i latinsk kvadrat över tre lägen (fylld, ofylld, fylld med ring finns inte: använd fylld, ofylld och ingen prick förbjudet; alltså fylld/ofylld växlar och läget följer M1 linjär med d ≠ 3k), 3 |
| vandring | 5 | 5 | M2: orbital radvis (M1 linjär) och mittpunkt växlar per kolumn med radvis fas, 3; 2×2-ruta radvis (M1 fri) och rutans fyllning i latinsk kvadrat (svart, grå, prick), 2 |
| tva-rorelser | 4 | 6 | M3: 2×2 två element i två riktningar, 3; balanslinje kvadrat radvis och cirkel kolumnvis med sida i schack för den ena, 3; ersätter också tva-05 |
| antal-andras | 3 | 3 | `antalSumma` med riktning som växlar per rad, 1; "egen riktning per rad" med streckens riktning i latinsk kvadrat, 2 |
| latin-form | 3 | 4 | samma byggare, `diag: 'olika'`; ersätter också lform-03 |
| latin-antal | 1 | 1 | samma byggare, `diag: 'olika'` |
| spegling | 1 | 1 | samma byggare, ny seed |
| overlagring | 0 | 2 | samma byggare, ny seed, G11 som fel; ersätter over-04 och fyller volymen |

**Expert (pensioneras 46 + 2: `v7e-3c-over-07` (tomt alternativ), `v7e-b2` (G7); `v7e-3c-tva-04` har G7 men också ruta 0 och ingår i de 46; nya 56). Expert byggs av plus-bandet, överlagring, spegling, latin-flera och två nya plus-mekanismer.**

| Familj | Pensioneras | Nya | Recept |
|---|---|---|---|
| monsterrotation | 24 | 0 | Tas bort som egen familj på expert (2.3). Rörelse finns kvar i P4, P5 (överlagring vriden) och P6 |
| vridning | 4 | 0 | Samma |
| vandring | 4 | 0 | Samma |
| rotation-med-byte | 7 | 0 | Samma |
| latin-flera (plus P1', P2, P3) | 0 | 24 | parti 01 efter rättelserna i granskning-parti-01 2.6: P1' 8 (form latin, fyllning latin ortogonal, symbol schack), P2 8, P3 8 (`p_prior` 0,45) |
| overlagring (plus P4, P5) | 1 (over-07) | 17 | parti 01: P4 8 (over-03, -04, -05, -07 och de fyra ersättarna over-17 till -20), P5 8 (over-09 till -16); plus 1 vanlig överlagring som ersätter over-07 |
| tva-rorelser (plus P6, ny mekanism) | 3 + 1 (b2) | 8 | **P6**: M3 i balanslinjen och 2×2 där A går radvis med steg 1 och B kolumnvis med steg 2, och sidan (balanslinje) eller fyllningen (2×2) följer en latinsk kvadrat: tre regler. Riktlinjerna 2.2 mekanism 4 |
| antal-andras (plus P7, ny mekanism) | 3 | 7 | **P7, byggs på strålar**: antalet streck ökar med ett per kolumn inom raden (2, 3, 4 i rad med start 2; raderna skiljer sig i startläge), det första streckets läge följer en latinsk kvadrat över tre av de åtta lägena, och hela mönstret vrids d steg per rad (M1 linjär på läget). Tre regler i en primitiv. Räknestreck på en grundform går inte (G12), och räknestreckens riktning har bara två värden, därför strålar. Riktlinjerna 2.2 mekanism 5 |
| latin-form | 1 | 0 | Tas bort på expert (en regel) |
| spegling | 0 | 0 | De 7 står |
| latin-antal | 0 | 0 | De 3 står |

Expert efter version 3: 83 − 48 + 56 = 91 valbara, varav 40 plus. Familjer på expert: latin-flera, overlagring, spegling, latin-antal, tva-rorelser, antal-andras (sex familjer). Testet "alla familjer finns i varje nivå" ändras till "alla elva finns i grund och avancerad, minst sex på expert" (riktade pass och "var du tappar" läser `TRANINGSBANK` över alla nivåer, så en familj utan expertfrågor fungerar: den riktas med avancerade frågor nära nivån).

Opus skriver recepten för P6 och P7; jag godkänner receptlistan (`recept-v3.mjs` och `recept-plus.mjs` parti 02) som text innan generatorn körs.

### 2.6 Vad leverantörerna gör, och vad jag vet

- **Matrigma (Assessio)**: 3×3-matriser, luckan nere till höger, sex svarsalternativ, reglerna går längs rader och kolumner (progression, "tre av varje", kombination av två rutor). Det är jag säker på för den klassiska versionen; den adaptiva har samma uppgiftstyp. Jag har inte sett något Matrigma-exempel som läser rutorna som en orm genom rutnätet.
- **Raven (APM, SPM)**: samma konvention, luckan nere till höger, åtta alternativ i APM. Reglerna är radvisa med kolumnkonsekvens.
- **Alva Logic**: 3×3 med luckan nere till höger, såvitt jag vet sex alternativ. Osäker på antalet alternativ.
- **SHL Verify induktiv**: blandar "nästa figur i serien" med matriser; luckans plats varierar i serieformatet, inte i matrisen. Osäker på detaljer.
- **Aon scales ix / cut-e**: figurserier och "vilken avviker", inte 3×3. Ej tillämpligt här.

Slutsats: luckan stannar nere till höger (det är också vad hela V7-kedjan antar: `POS`, `kontroll.mjs` "tomrummet ska vara sist", renderaren, misstagstexterna). Att flytta luckan skulle kosta en omskrivning av tolkningen och ge ett format kandidaten inte möter. Att gå från läsordning till radvisa regler är däremot ett steg närmare leverantörerna, inte bort från dem.

### 2.7 Vad som händer med historik, statistik och percentil

- `fraga_statistik` och `fraga_kalibrering_vy` är knutna till id. De 149 pensionerade behåller sina rader. Nya id börjar på noll och får p ur `p_prior` eller prior tills 30 svar finns. Kalibreringsfrågan i varje pass (riktlinjerna 2.4) väljer bland de minst besvarade, så de nya frågorna kalibreras först. Det är rätt ordning.
- Gamla sessioner (version 1 och 2) ritar sin genomgång ur `HELA_BANKEN` och `hittaTraningsfraga`, som inkluderar pensionerade. Oförändrat.
- Percentilen räknas per `bank_version` (`medBankversion`, `percentilUnderlag.ts`) och börjar om vid 25 sessioner på version 3. Under de första veckorna visas ingen percentil på klassiska test. Det är känt och accepterat sedan version 2; "bästa resultat" på korten påverkas inte.
- Passen sparar sitt urval i `meta.fragor`, så ett pågående pass med en pensionerad fråga fortsätter som vanligt.

---

## 3. Spärrar som gör att det aldrig händer igen

Alla kontroller nedan skrivs som funktioner i `scripts/lib/matris/kontroll.mjs` (per fråga) och `scripts/lib/matris/distraktorer.mjs` (alternativen), och anropas på tre ställen: inne i `bygg()` (ett underkänt försök slängs och byggaren försöker igen), i `v7-facit-check.mjs` (fel för alla frågor med `fran_version` ≥ 3 och för kandidater; upplysning för frysta och 3c som är kvar) och i `v7-distraktor-check.mjs` (S5, S6). Bankkvoterna (S1b, S4b) räknas i `v7-facit-check.mjs` över varje nivås pool för version 3. "Lika" betyder alltid lika per dimension (`dimsFor`, `vKey`), inte råcellen, så att ordningsskillnader i listor inte döljer en kopia.

| Nr | Namn | Definition | Fel för | Dagens bank (g / a / e) |
|---|---|---|---|---|
| S1 | `facit_ruta0` | Facit är lika ruta (0,0) i alla dimensioner | alla familjer utom latin-antal och latin-form | 60 / 43 / 46 |
| S1b | `facitruta_kvot` | Bankkvot per nivå: andelen valbara frågor där facit är lika ruta i får vara högst 20 % för varje i i 0..7, och högst 10 % för ruta 0 | version 3-poolen per nivå | ruta 0: 67 / 54 / 55 %; ruta 4: 48 / 39 / 33 % |
| S2 | `facit_kopia` | Facit är lika någon synlig ruta: tillåtet bara om minst två distraktorer också är lika någon synlig ruta, och aldrig rutan ovanför eller till vänster (finns) | alla nya | 189 frågor med kopia, varav de med färre än två distraktorkopior räknas vid bygget |
| S3 | `vanligast` | Facit är lika den figur som förekommer flest gånger bland de åtta synliga, när maxantalet är minst 2 | alla familjer utom latin-antal och latin-form (där facit är den minst vanliga, upplysning) | 31 / 25 / 25 |
| S4 | `enrad` | Ur rad 3 ensam, per dimension: rotation ger 2·v7 − v6 (mod n), mängd ger samma vridning som v6 → v7, kategori ger v7 om v6 = v7 annars v6. Stämmer exakt ett alternativ på allt och är det facit: enradsfråga | expert och band plus: fel. Avancerad: bankkvot S4b högst 40 %. Grund: upplysning | 24 / 19 / 16 |
| S5 | `facit_udda` | Facit är ensamt om sitt värde i någon dimension medan minst två distraktorer delar värde i samma dimension | alla nya | 9 / 9 / 2 |
| S6 | `eliminerbar` | En distraktor är ensam om sitt värde i en dimension där facit delar värde med minst en annan. Högst en sådan per fråga på grund och avancerad, ingen på expert och plus | alla nya | 53 / 40 / 36 frågor, 48 / 38 / 33 med minst två |
| S7 | `takt` (G7) och `tomt` (G11) | Som i `v7-geometri-check.mjs`; `G7_KANDA` och `G11_KANDA` töms när frågorna pensioneras, och geometrikontrollens per-fråga-funktion exporteras och anropas i `bygg()` | alla nya | 9 och 15 |
| S8 | `struktur` | Inom en mekanism eller ett recept med minst fyra frågor ska minst två strukturnycklar (`strukturNyckel`) förekomma (granskning-parti-01 1.1 punkt 3) | per receptkörning | P1 och P3 i parti 01 hade en |
| S9 | `lasordning` | Regeltexten innehåller inte "som en lång rad" och tolkningen bär ingen dimension på `rot-steg`, `rot-kumulativ`, `periodisk` eller `antal-steg` i läsordning | avancerad och expert, nya; grund: upplysning | 141 frågor bärs av läsordning |

Förtydliganden:

- **S1 och latin.** För latin-antal och latin-form är ruta 0 eller ruta 1 oundvikligt (1.3). Där gäller S1b i stället: receptlistan växlar `diag`, så att varje nivå får ungefär lika många på {0, 4} som på {1, 3}, och kvoten 20 procent per ruta håller eftersom familjerna är 25 av 93 på grund och färre på de andra. S2 är automatiskt uppfylld i latin-form och latin-antal (de två andra värdena är kopior), men S6 fäller dagens "utanför"-distraktorer, så de byggarna får en ny distraktorordning: först de två andra värdena, sedan facits värde med en ändring i en dimension som delas med minst en annan distraktor (två distraktorer med svart fyllning, inte en), sist utanför-värden och bara om ingen annan går.
- **S4 och radvisa recept.** M1 är enradsfrågor av konstruktion. Det är avsikten på grund och orsaken till kvoten på avancerad. På expert räcker inte M1, M2 utan en latinsk eller kolumnvis regel klarar inte S4, och plus-bandet klarar S4 redan (räknat på parti 01: 0 av 40 enradsfrågor).
- **S9 och grund.** Grund får behålla ett fåtal rena läsordningsfrågor bara om de klarar S1, vilket de inte kan (1.2). I praktiken försvinner läsordningen från alla nivåer; S9 står som upplysning på grund för att ingen ska bygga tillbaka den av misstag utan att det syns i utdata.
- **tolka.mjs** får regeln `rad-steg`: för en dimension med `typ: 'rot'`, steget k är detsamma mellan kolumn 0 → 1 och 1 → 2 i rad 0 och rad 1, och mellan kolumn 0 → 1 i rad 2; förutsägelse rotera(ruta (2,1), k). Läsordningen `rot-steg` är ett specialfall (starterna s, s + 3k, s + 6k) och ger samma förutsägelse, så ingen gammal fråga blir tvetydig. `familjFor` behandlar `rad-steg` som `RORELSE_REGLER`. `misstag.mjs` använder `textRotation` för `rad-steg` (texterna "har inte vridit sig sista steget", "ett steg för långt", "åt fel håll" stämmer eftersom ruta (2,0) och (2,1) är referenserna). Kolumnvis rörelse (M3:s B) tolkas som `rad-steg` på transponerat rutnät: `tolka` prövar båda orienteringarna och väljer den som ger en regel; regeln får `info.axel`.
- **Enhetstester** (vitest, `src/lib/logicTestV7/__tests__/kontroll-sparrar.test.ts`): en konstruerad fråga per spärr som fälls med rätt text, och en som klarar; en läsordningsfråga ur dagens bank som fälls av S1 och S9; en M1-fråga med (d, k) = (1, 1) som klarar S1 och S2 och flaggas av S4; en latin-form med konstant diagonal som klarar S1 (undantaget) men räknas i S1b.
- **Förväntat utfall på version 3-poolen**: S1 0, S3 0, S5 0, S6 0 (expert) och högst 1 per fråga (grund, avancerad), S7 0, S9 0 på avancerad och expert; S1b högst 20 % per ruta (prognos grund: ruta 0 ≈ 13 %, ruta 1 ≈ 13 %, ruta 4 ≈ 13 %, ruta 3 ≈ 13 %, resten 0); S4 0 på expert, ≤ 40 % på avancerad. `v7-facit-check.mjs` skriver tabellen "facit per ruta" per nivå och version i sin sammanfattning, så att ägaren kan se den utan att läsa koden.

---

## 4. Grafiken

Alla mått nedan är viewBox-enheter (0 till 100 per cell); på en 360-mobil är en matrisruta 84 px (0,84 px per enhet) och ett alternativ 56 px. Källan är `src/lib/logicTestV7/geometri.json` (finns i worktreen efter-lyftet, läses av renderaren och geometrikontrollen), så varje ändring görs där, en gång. Bankerna rörs inte av något i det här avsnittet. `v7-geometri-check.mjs` ska vara grönt på alla banker efter varje ändring.

### 4.1 Vad som ska förbättras (testansvarigs iakttagelser mot G1 till G12)

| Nr | Vad | I dag | Förslag | Varför |
|---|---|---|---|---|
| F1 | Tunn kontur | `swThin` 2 = 1,68 px på 360, under G5:s 2 px (geometrikontrollen skriver det som upplysning) | `swThin` 2,4 (2,0 px) för rutnätsramar (2×2, 3×3), sektorlinjer, ringkonturer, pilspetsens kontur, symbolen ring | Hårlinjer försvinner på billiga skärmar; ringarnas vita skiljelinje (2 enheter) är redan ett gränsfall |
| F2 | Rutnätens ramar | Varje tom ruta i 2×2 och 3×3 har egen mörk ram i full kontrast | Tomma rutor får ljusare ram (samma grå som orbitalens bana, 4,76:1) eller bara ett yttre rutnät; fyllda rutor behåller mörk kontur | Mönstret ska synas, inte rutnätet; i dag konkurrerar 9 ramar med 3 fyllda rutor |
| F3 | Symbolerna på grundformen | plus 16 brett, prick r 4, ring r 6, kryss 14, på en bas som är 56 | plus och kryss 20, prick r 5, ring r 7 med `sw`, inte `swThin` | Prick och ring är svåra att skilja i ett alternativ på 56 px; symbolen är informationsbärande och ska inte vara mindre än pilspetsen (9) |
| F4 | Symbolens läge i triangel och romb | centrerad på (50, 50); triangelns tyngdpunkt ligger på y ≈ 58 | symbolen på tyngdpunkten för triangel (y 58) och på (50, 50) för romb | I dag sitter plus högt i triangeln och ser felplacerat ut |
| F5 | Orbital | mittpunkt r 6, satellit r 5, bana `#94A3B8` (2,5:1) | satellit r 6, mittpunkt r 5; bana `#64748B` (4,76:1, redan i geometri.json på efter-lyftet) | Det som rör sig ska väga tyngst; ramen ska klara 3:1 |
| F6 | Strålar | mittpunkt r 4, längd 28; två motsatta streck läses som en linje genom mitten (konvention) | mittpunkt r 5; längden står; konventionen står | Mittpunkten binder strecken; något större gör "två streck" tydligare än "en linje" |
| F7 | Storlekarnas harmoni | månghörning r 30 (60 brett), grundform 56, 3×3-block 58, 2×2 64, sektorhjul 64, orbital 62, strålar 56, pil 56 lång | alla figurers yttermått i [58, 64], det vill säga grundform 60, strålar 30 lång, pil 24 till 76 lång och 32 till 68 kort | Blandade primitiver i samma rutnät ser i dag olika stora ut; G2 (inom 14 till 86) klaras fortfarande |
| F8 | Balanslinjen | halvbredd 8, former på y 31 och 69, avdelare 47 till 53 (rättat efter granskning-figurer) | behålls; linjen får `sw` 3 och avdelarna 2,4 | Inget mer än F1 |
| F9 | Räknestreck | längd 44, mellanrum 7 | längd 48, mellanrum 8 | Fyller cellen jämnt med övriga primitiver (F7); G1 klaras (6,7 px fritt) |
| F10 | Grå fyllning | `#CBD5E1` med mörk kontur | behålls | Kontrasten är löst med konturen; ingen ändring |
| F11 | Ringar | radier 30/22/14, vit skiljelinje 2 | radier 31/23/15 och skiljelinje 2,4 | F1 och F7 |
| F12 | Mörkt läge | cellerna ljusa (beslut 15.10), orbitalens bana på de sex papperstonerna 3,5:1 eller bättre | behålls | Redan kontrollerat i geometrikontrollen |

Inget i tabellen ändrar vad en figur betyder, bara hur stor och hur tydlig den är. G1 till G6 räknas om av geometrikontrollen när `geometri.json` ändras; F3 kan slå mot G1 i stack (triangel med kryss har redan 1,92 enheters fritt och är spärrad som kombination), så F3 och F4 ska verifieras i kontrollen innan de låses.

### 4.2 Vad som går till art-director för visuellt beslut

Art-director beslutar (med stöd av mig, enligt `feedback_beslut_fable_bygg_opus`), ägaren godkänner i artefakt:

1. F2, rutnätens ramar: ljus ram, inget rutnät alls runt tomma rutor, eller dagens. Det här är det enda som ändrar figurernas karaktär.
2. F7, storlekarnas harmoni: ett gemensamt yttermått, och om alternativen ska visa figuren i 80 procent av rutan (granskning-figurer 4.5) eller 85.
3. F1 och F3 som helhet: tyngre eller lika tunn linje. Riktlinjernas "bläck på papper, rätt svar i koppar" (5.1) gäller; frågan är hur tungt bläcket är.
4. Frågetecknets cell och alternativens bokstäver: oförändrade från rummets skisser, bekräftas bara.

**Före/efter-sida: ja.** Art-director gör en artefakt med sju frågor ur dagens bank, en per primitivgrupp (pil, strålar eller sektorhjul, 3×3-block, 2×2, grundform med symbol, ringar, orbital, balanslinje; alltså åtta om sektorhjul och strålar visas var för sig), renderade med dagens `geometri.json` och med förslaget, sida vid sida, på Pixel 7-bredd och 1280, ljust och mörkt. Figurerna renderas med riktiga renderaren (`scripts/render-matris-granskning.tsx` med ett `--geometri=<fil>`-argument som Opus B lägger till), inte ritade för hand, så att det ägaren godkänner är exakt det som byggs. Ägaren godkänner före Opus B rör renderaren. Det tar art-director en halv dag och sparar en runda.

### 4.3 Till byggaren (Opus B)

- `geometri.json`: nya värden enligt godkänd före/efter-sida. `renderers.v7.tsx` läser allt ur `geometri.ts` (ingen hårdkodad siffra kvar; i dag ligger till exempel `RING_GAP`, `radii`, `headSize` och lattice-positionerna i renderaren).
- `v7-geometri-check.mjs` grönt på alla banker (272 frågor efter version 3 plus de 40 plus). G5-raden om tunn kontur ska inte längre vara en upplysning.
- Omrendering av alla valbara frågor i version 3 till `docs/qa/tester-v3/render/` (PNG per fråga, 360-skala) med `render-matris-granskning.tsx --fil` och `pdf-to-png.mjs`. Jag granskar okulärt (5.3).
- Riktig webbläsartest enligt `feedback_riktig_webblasartest`: ett pass och ett klassiskt test på Pixel 7 och 1280, ljust och mörkt, skärmdump per figurgrupp.

---

## 5. Ordning och omfattning

### 5.1 Två Opus-agenter, en granskare, en art-director

**Opus A: bank, generator, version.** En agent, eftersom tolkningen, byggarna, spärrarna och versionsmekaniken hänger ihop. Levererar i tre steg:

A1. *Spärrar och tolkning* (dag 1): S1 till S9 i `kontroll.mjs`, `distraktorer.mjs` och `v7-facit-check.mjs` (med bankkvoterna och tabellen "facit per ruta"); `rad-steg` i `tolka.mjs` och `misstag.mjs`; enhetstesterna i 3; `v7-facit-check.mjs` på dagens bank ska ge exakt de upplysningar räkningen i 1.5 och 3 förutsäger (149 S1, 81 S3, 59 S4, 20 S5, 129 frågor S6, 141 S9) och fortfarande noll fel. Spara utdata i `docs/qa/tester-v3/facit-check-fore.txt`.

A2. *Versionsmekanik* (dag 1 till 2):
- Fält i bankerna: `fran_version` (saknas = 1 för de 84 frysta, 2 för 3c; sätts uttryckligen till 3 på alla nya), `pensionerad_fran` (3 på listan i 2.5). `pensionerad: true` står kvar med dagens betydelse (borta från version 2 och framåt).
- `selectQuestions.v7.ts`: `valbarI(q, v)` = inte `pensionerad`, (`fran_version` ?? 1) ≤ v, (`pensionerad_fran` ?? ∞) > v. `poolFor(niva, 1)` oförändrad (de 28 råa). `poolFor(niva, 2)` = `ALLA_<nivå>.filter(valbarI(·, 2))`, vilket ger exakt dagens 89 / 80 / 83 i samma ordning. `poolFor(niva, 3)` = `valbarI(·, 3)`. `BANK_VERSION = 3`, `BankVersion = 1 | 2 | 3`, `bankVersion(meta)` läser 3. Nya filer `questionBank{Grund,Avancerad,Expert}V3.v7.json` och `questionBankExpertPlus.v7.json` läggs sist i `ALLA_*`; `EXPERT_PLUS` exporteras enligt beställningen 1.3.
- `TRANINGSBANK` = `valbarI(·, BANK_VERSION)`. `HELA_BANKEN`, `hittaTraningsfraga`, `BANK_FOR_RUTT` (v4 får grund V3, expert V3 och plus; v6 får avancerad V3; prov får alla) inkluderar de nya filerna. `selectProv.v7.ts`, `anon-session.ts` (smakprovet), `prov-rad.ts`, `percentilUnderlag.ts` och `percentile/route.ts` hanterar version 3 (`eq('meta->>bank_version', '3')`).
- Tester: `bank3c.test.ts` kompletteras med (i) snapshot av version 2-urvalet: de första fem fråge-id:na för 20 fasta sessions-id på varje nivå och i provet, tagna *före* ändringen och incheckade som fixtur; (ii) "valbara version 2: 89 / 80 / 83" står kvar; (iii) "valbara version 3: minst 80 per nivå"; (iv) "alla elva familjer i grund och avancerad, minst sex på expert"; (v) "ingen fråga i version 3-poolen utanför latin-antal och latin-form har facit lika ruta 0"; (vi) `TRANINGSBANK` innehåller ingen fråga med `pensionerad_fran` ≤ 3.
- `flaggor.ts`: `BANK_RACKER_30_DAGAR` räknas mot version 3-poolen.

A3. *Recept och generering* (dag 2): `recept-v3.mjs` med listan i 2.5 (jag godkänner listan som text innan körning, samma dag); byggarna M1, M2, M3, `antalEgenRiktning`, parametern `diag`; `recept-plus.mjs` parti 02 med P6 och P7 (16 recept) och omkörningen av parti 01 enligt granskning-parti-01 2.6. Allt skrivs till `src/lib/logicTestV7/kandidater/` (`grund-v3-parti-01`, `avancerad-v3-parti-01`, `expert-v3-parti-01`, `expert-plus-parti-01` omkörd, `expert-plus-parti-02`), hela kedjan grön (validate, parallel, facit med S1 till S9 som fel, distraktor, geometri), renderingar till `docs/qa/tester-v3/kandidater/` per fil med `--fil`.

A4. *Befordran* (efter min granskning, dag 3 till 4): godkända kandidater in i V3-filerna och plus-filen med `fran_version: 3`, `pensionerad_fran: 3` på listan, `BANK_VERSION = 3`, alla tester gröna, `tsc`, build, klicktest (5.4). `reference_matrix_test_system.md` och `docs/tester/matris-familjer.md` uppdateras med versionsfälten, spärrarna och den nya tabellen per nivå och familj.

**Opus B: grafik.** Startar när ägaren godkänt före/efter-sidan. Beror på att `v7-geometri-check.mjs`, `geometri.json` och `geometri.ts` från worktreen efter-lyftet (omgång 1) ligger på main; i dag gör de inte det (`git log main -- scripts/v7-geometri-check.mjs` är tomt). Ordning: efter-lyftet går in på main först, sedan B. B:s leverans är 4.3.

**Art-director:** före/efter-sidan (4.2), en halv dag, parallellt med A1.

**Jag (testansvarig):** godkänner receptlistan (A3) som text; granskar alla kandidater (5.3); granskar före/efter-sidan mot G1 till G12 innan den går till ägaren; skriver `granskning-v3.md` i samma form som granskning-parti-01.

### 5.2 Vad som händer med G7-brotten och de tomma alternativen

I samma svep, inget separat:

- De 9 G7-brotten: 7 har facit = ruta 0 och pensioneras av S1; `v7e-3c-tva-04` och `v7e-b2` pensioneras uttryckligen (listan i 2.5). Ersättarna byggs med M3 (två riktningar), som inte kan gå i takt. `G7_KANDA` töms; G7 blir ett fel för alla valbara frågor.
- De 15 tomma alternativen (21 i min bredare räkning): 13 (eller 19) sitter i frågor som pensioneras av S1; de övriga (`v7g-q26`, `v7g-3c-lform-07`, `v7g-3c-over-01`, `-04`, `v7-q15-tile-xor`, `v7a-3c-lform-03`, `v7a-3c-over-04`, `v7e-3c-over-07`) pensioneras uttryckligen och ersätts av samma recept med ny seed, utom `v7-q15-tile-xor` (fryst avancerad, överlagring tile) som behålls: den har ett tomt alternativ med en skriven misstagstext (15.11) och ingen annan brist; G11 blir ett fel för frågor med `fran_version` ≥ 3 och en upplysning för frysta. `G11_KANDA` töms.
- `bygg()` anropar geometrikontrollens per-fråga-funktion, så inget av detta kan uppstå i en ny fråga.

### 5.3 Min granskning av kandidaterna

Samma form som granskning-parti-01: alla renderingar på skärm, per recept minst tre frågor noggrant (facit för hand mot regeln, distraktorerna mot misstagstexterna, enradsgenvägen för hand på expert), alla genom kedjan. Beslut per fråga: godkänd, ersätts (nytt löpnummer), stryks. Särskilt: att M1-regeltexterna är begripliga utan ordet läsordning ("för varje steg åt höger i raden", "varje rad börjar ... längre fram", "varje rad har sitt eget block"), att M3 inte ser ut som två oberoende bilder, och att P6 och P7 verkligen kräver tre läsningar. Jag lägger också ut tio av de nya grundfrågorna och tio av dagens till en snabb egen blindtest (vilken ruta är facit utan att läsa regeln) för att se att genvägen är borta; det är ingen användardata, bara en kontroll av att spärrarna gör vad de ska.

### 5.4 Klicktest före "klart"

Enligt `feedback_riktig_webblasartest`, Pixel 7 och 1280, ljust och mörkt, skärmdump per steg:

1. Ny gratisanvändare: smakprov (5 frågor ur version 3, ingen med facit = ruta 0), Nivåkollen, grundpasset dag 0, genomgången visar regel och misstag för M1-frågor.
2. Premium: klassiskt expert med 15 frågor ur version 3 (minst fem ur plus), provet 6 + 6 + 6, ett pass med kalibreringsfråga, ett riktat pass på "Figuren vrider sig" (som nu bara har grund- och avancerade frågor).
3. En befintlig session med bank_version 2 (fixtur i testdata): resultatsidan visar samma frågor som före ändringen; percentilraden oförändrad.
4. Admin: frågestatistiken listar de pensionerade med sina gamla tal.

### 5.5 När det kan gå ut

| Dag | Vem | Vad |
|---|---|---|
| 1 | Opus A, art-director | A1 spärrar och tolkning; före/efter-sidan |
| 1 | Jag, ägaren | Receptlistan godkänd; före/efter godkänd |
| 2 | Opus A, Opus B | A2 version, A3 generering och renderingar; B grafik (efter att efter-lyftet ligger på main) |
| 3 | Jag | Granskning av kandidaterna, `granskning-v3.md` |
| 3 till 4 | Opus A | Strykningar och ersättare, A4 befordran, klicktest |
| 4 | saas-lead, ägaren | Deploy. Nya klassiska sessioner får `bank_version: 3` |

Risken i tidsplanen är P6 och P7: nya mekanismer brukar behöva en runda. Går de inte igenom på dag 3 går version 3 ut med plus parti 01 (40) och de övriga, och expert hamnar på 83 − 48 + 41 + 4 = 80 (med fyra extra överlagring eller spegling som fyllnad från samma byggare), vilket är gränsen. Parti 02 följer i version 3.1 utan ny bankversion (plus-frågor går in i `EXPERT_PLUS` och `TRANINGSBANK` direkt; klassiska test behöver ny version bara när poolen ändras, så parti 02 får `fran_version: 4` och väntar på nästa klassiska version, eller så ges `poolFor('expert', 3)` en frusen lista i stället för ett filter. Jag föredrar det senare: `poolFor` läser `fran_version` ≤ v, och parti 02 får `fran_version: 3` bara om det hinner med i samma deploy, annars 4).

---

## 6. Acceptanskriterier för bank_version 3

1. `v7-facit-check.mjs` på alla banker: 0 fel; tabellen "facit per ruta" per nivå i version 3 visar högst 20 % för varje ruta och högst 10 % för ruta 0; S4 0 på expert och ≤ 40 % på avancerad; S9 0 på avancerad och expert.
2. `v7-distraktor-check.mjs --krav=plus` grönt på alla plus; S5 0 och S6 ≤ 1 per fråga (0 på expert) på alla frågor med `fran_version` 3.
3. `v7-geometri-check.mjs` grönt utan kända brott (G7_KANDA och G11_KANDA tomma) och utan G5-upplysningen om tunn kontur.
4. `valbarI(·, 2)` ger 89 / 80 / 83 i samma ordning som i dag; snapshot-testet för version 2-urvalet grönt.
5. Version 3: minst 80 valbara per nivå (mål 93 / 83 / 91); alla elva familjer i grund och avancerad; minst sex på expert; minst 40 frågor med `band: 'plus'`.
6. Ingen regeltext i version 3 innehåller "som en lång rad" eller tankstreck; varje ny fråga har `family`, `difficulty`, `p_prior` där byggaren kan gradera, `misstag` för alla fem distraktorer.
7. `npx tsc --noEmit`, `npm run test:run`, build: gröna. Klicktest 5.4 dokumenterat i `docs/qa/tester-v3/`.
8. `granskning-v3.md` skriven av mig med beslut per fråga, och `reference_matrix_test_system.md` uppdaterad.

---

## 7. Vad som är data och vad som är bedömning

Data: alla tal i avsnitt 1 och 3 (räknade i dag på bankerna), G7- och G11-listorna (geometrikontrollen), att de 40 plus-frågorna har 0 kopior och 0 enradsfrågor.

Bedömning: att genvägen förklarar medianen 13 till 14 av 15 på expert (prövas med `facit_ruta0` i kalibreringsrapporten; den kan avfärdas), att M1 på grund är lagom lätt och att M2 på avancerad landar runt p 0,55 (kalibreringen avgör; `p_prior` sätts av byggaren som i 3c), att leverantörerna inte använder läsordning (säker för Matrigma och Raven, osäker för Alva och SHL), och tidsplanen för P6 och P7.
