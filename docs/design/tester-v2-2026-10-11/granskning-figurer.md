# Granskning av figurerna i Testerna v2

Testansvarig, 2026-10-11. Underlag: `docs/design/tester-v2-2026-10-11/skiss.html` (artefakten "Testerna v2"), `src/lib/logicTestV7/renderers.v7.tsx`, `scripts/validate-v7-questions.mjs`, `scripts/lib/matris/kontroll.mjs` och alla sex bankerna (270 frågor, 252 valbara). Geometrin är räknad, inte bedömd på ögonmått, och de två tveksamma fallen är renderade till PNG i samma storlek som på en 360-mobil.

Ägarens iakttagelse stämmer. I figurserien når strecket in i punkten i två av tio figurer, och punkten ligger an mot ramens hörn i alla tio. Dessutom har serien ett innehållsfel: de två rörelserna går i takt, så det är en regel förklädd till två, och facit är en kopia av figur 2.

---

## 1. Grafiska regler för figurer

Gäller matriser, figurserier och alla kommande visuella testtyper. Enheten är V7:s viewBox (0 till 100 per cell). Skissen ritar i viewBox 40; multiplicera med 2,5 för att jämföra. På en 360-mobil ritas en matrisruta i 84 px (0,84 px per enhet) och ett alternativ i minst 56 px.

| Nr | Regel | Mått | Automatisk kontroll |
|---|---|---|---|
| G1 | **Separata element får aldrig tangera.** Avståndet mellan två elements målade kanter (konturbredd och runda ändar inräknade) är minst 4 enheter (3,4 px på 360, ungefär en millimeter). | gap ≥ 4 | Ja. Analytisk avståndsberäkning per primitiv: punkt till sträcka, cirkel till cirkel, rektangel till rektangel. Renderarens konstanter (radier, konturbredd, positioner) läses ur en delad geometrifil så att kontrollen och ritningen inte kan glida isär. |
| G2 | **Element får aldrig tangera ramen.** Allt målat ligger innanför [14, 86]. Referensramar (streckad cirkel, baslinje) får gå ut till [10, 90]. | marginal ≥ 14 | Ja. Bounding box per element inklusive kontur. |
| G3 | **Ett roterande streck når aldrig ett fast element i något läge.** För ett centrerat streck med halvlängd h och ett fast element på avståndet d från centrum med radie r: h ≤ d − r − (konturbredd streck + kontur element)/2 − 4. Kontrolleras i alla rotationslägen familjen använder, inte bara de som visas. | se formel | Ja. Rotera strecket genom alla 8 lägen (45-gradersmultipler) och räkna G1 mot varje fast element. |
| G4 | **Vad som är ett element ska synas.** Ett litet element intill ett stort får inte läsas som en del av det: ingen sträcka får sluta inom 6 enheter från ett annat elements centrum, och ett element som står "på" en referensram ska ha sitt centrum på ramen (avvikelse 0), aldrig bredvid den. | ändpunkt ≥ 6 från centrum | Ja. Samma avståndsräkning som G1 plus en kontroll av centrum mot ramradien. |
| G5 | **Minsta storlek på 360 px.** Figurens innehåll (inte cellen) minst 56 px i rutnätet och 48 px i alternativen. Minsta kontur 2 px, minsta avstånd 3 px, minsta prick 6 px i diameter, minsta skillnad mellan två längder (kort/lång pil) 10 px. | se mått | Ja. Räknas ur viewBox-måtten gånger pixelskalan för 360 (rutnät 0,84, alternativ 0,56 vid tre i bredd med figuren i 80 procent av rutan). Enhetstest på renderarens konstanter. |
| G6 | **Rotationssymmetri.** Ett element som vrids ska ha minst 4 distinkta lägen i familjens stegmängd (period p, steg k: p / sgd(p, k) ≥ 4). Ett bart streck har period 2 av 8 och får bara vridas 45 grader, aldrig 90. Ett element som inte vrids får vara symmetriskt. | ≥ 4 lägen | Ja. Finns delvis (`kontroll.mjs`: tile-symmetri och "synliga lägen"); utöka till ray, sectorwheel, lattice, orbital och figurserier. |
| G7 | **Två rörelser får inte gå i takt.** Om två element rör sig i samma figur får avbildningen läge A → läge B inte vara en bijektion över de visade figurerna. Annars är det en regel, och distraktorerna faller på vilken som helst av dem. | | Ja. Tabellera (lägeA, lägeB) per visad ruta; om varje A ger exakt ett B och tvärtom: fel. |
| G8 | **Speglingssymmetri.** Källrutan i ett speglingssteg får inte vara invariant under axeln (då syns ingen spegling). Rutor i en kedja (rad eller kolumn) får inte vara identiska. | | Ja. Finns för rader i `kontroll.mjs`; lägg till kolumnkedjor och axelinvarians (lodrät, vågrät, båda diagonalerna). |
| G9 | **Figurserier: inget i raden får återkomma.** Facit får inte vara identiskt med någon visad figur, och ingen distraktor heller. Hela figurens period (minsta gemensamma multipel av elementens perioder) ska vara minst 6 vid fem visade figurer. | period ≥ 6 | Ja. Kanonisk nyckel per figur som i `validate-v7-questions.mjs`. |
| G10 | **Kontrast.** Informationsbärande kontur och fyllning minst 4,5:1 mot cellens bakgrund, referensramar minst 3:1. Grå fyllning har alltid mörk kontur (finns redan i renderaren). I mörkt läge förblir cellerna ljusa (beslut 15.10). | WCAG 1.4.11 | Ja. Enhetstest som räknar kontrastkvot på renderarens färgkonstanter. |
| G11 | **Tomma figurer bara som distraktor, aldrig i rutnätet, högst en per fråga, aldrig på expert.** En figur utan element är alltid eliminerbar och gör sex alternativ till fem. | | Ja. Räkna element per alternativ. |
| G12 | **Sammansatta celler.** Två primitiver i samma cell (form och räknestreck, punkt och streck) är en ny primitiv med egen renderare och egna G1 till G4-mått, aldrig två lager som råkar hamna bredvid varandra. Bankerna har i dag inga lagerceller (0 av 270), och det ska vara ett aktivt beslut att införa dem. | | Ja. Valideringen felar på arrayceller tills en primitiv är godkänd. |

Mått som utgår från skissen: ruta 28 enheter av 40 med punkt r 3 i hörnen och kontur 2,5. Hörnpunkten ligger 11,3 enheter från centrum. Enligt G3 får ett centrerat streck då ha halvlängd högst 3,8 (längd 7,6 av 40, alltså 19 procent av rutan). Det är för kort för att en 45-gradersvridning ska läsas. Slutsatsen är inte "kortare streck" utan "annan konstruktion", se avsnitt 4.

---

## 2. Granskning av exempelfrågorna i skissen

### 2.1 Matris i övningsprovet och passet (skiss 2 Matrigma, skiss 4 före och efter svar, datorramen)

Samma fråga på fyra ställen. Rutnät: cirkel 1, kvadrat 2, triangel 3 / kvadrat 1, triangel 2, cirkel 3 / triangel 1, cirkel 2, ?. Alternativ A kvadrat 2, B triangel 3, C kvadrat 3, D cirkel 3, E kvadrat 1, F triangel 1. Facit C.

- Entydigt rätt svar: ja. Formen är en latinsk kvadrat, antalet streck är 1, 2, 3 per kolumn. Bara C uppfyller båda.
- Distraktorer: bra. A och E fel antal, B och D fel form, F fel i båda. Near-miss enligt regel 7.
- Svårighet: **fel för etiketten.** "Antalet streck följer kolumnen" är en parallell regel (kolumn bestämmer antal), som V7-regel 1 förbjuder på alla nivåer, och skissen kallar frågan "Avancerad, två regler". Det är en grundfråga med en regel som räknas, och en som läses av.
- Misstagstexten: **fel.** "Formen avgörs av raden, antalet av kolumnen" beskriver inte regeln (formen är en latinsk kvadrat, inte radbestämd) och motsäger regeltexten ovanför.
- Grafik: form och streck har 4,5 enheters mellanrum av 40 (G1 klarat). Strecken är 6 enheter höga (10,5 px på 360): klarar G5 nätt och jämnt. Form plus räknestreck är en ny sammansatt primitiv (G12) som inte finns i V7.

**Ändras.** Byt till en fråga där båda dimensionerna är latinska kvadrater (som Alva-exemplet nedan) så att "två regler" stämmer, eller byt etikett till "Grund, en regel". Misstagstexten skrivs om: "Du valde triangeln, men den står redan i nedersta raden och i tredje kolumnen. Kvadraten saknas där." Streckens höjd ökas till 8 av 40.

### 2.2 Matris i Alva-provet (skiss 2, uppgift 7 av 20)

Rutnät: triangel 2, cirkel 3, kvadrat 1 / cirkel 1, kvadrat 2, triangel 3 / kvadrat 3, triangel 1, ?. Facit A (cirkel 2).

- Entydigt: ja. Form och antal är båda latinska kvadrater, inget parallellt. Bara cirkel 2 uppfyller båda.
- Distraktorer: B cirkel 1 och E cirkel 3 (fel antal), C kvadrat 2 och D triangel 2 (fel form), F triangel 3 (båda). Bra.
- Svårighet: rätt för en adaptiv fråga mitt i provet.
- Grafik: som 2.1.

**Godkänd** med ett byte som inte rör frågan: metaraden "svårare efter rätt svar" **stryks**. Den är återkoppling under provet (beslut 4 säger ingen) och avslöjar att uppgift 6 var rätt. Skriv i stället på startarket: "Provet anpassar sig efter dina svar."

### 2.3 Verbalt (skiss 2 och skiss 4)

Text om avfallstaxan. Påstående: "Alla hushåll får en högre total avgift med den nya taxan." Rätt: Går inte att avgöra.

- Entydigt: ja. Grundavgiften sänks för den som sorterar, den rörliga höjs; totalen för ett enskilt hushåll står inte i texten. "Falskt" kräver en motsägelse, och "Sant" kräver att alla hushåll täcks. Förklaringen i skiss 4 säger precis det.
- Svårighet: rätt för avancerad (kvantorn "alla" plus ett "går inte att avgöra", enligt riktlinjerna 2.2).
- Texten är 68 ord. Avancerad ska ha 180 till 220 ord med två ståndpunkter. Som illustration duger den, men den får inte in i banken som den är.

**Godkänd** som skiss. Till banken: förläng till avancerad längd.

### 2.4 Numeriskt (skiss 2)

Tabell omsättning per region, kvartal 3: Nord 45, Syd 39, Väst 35, Öst 24, summa 143. Fråga: Västs andel. Facit B 24 % (35/143 = 24,48 %).

- Entydigt: ja, men med marginal på 0,02 procentenheter från att avrundas till 25. En kandidat som räknar 24,5 och avrundar uppåt hittar inget alternativ. **Ändras:** välj siffror så att rätt andel inte ligger nära en halv (till exempel Väst 34 ger 23,9 %).
- Distraktorer: A 22 % är Väst i kvartal 1 (fel kolumn), C 27 % är Syd i kvartal 3 (fel rad), D 31 % är Nord i kvartal 3 (fel rad). "Rätt räknat på fel siffra", som riktlinjerna kräver. Bra. Notera att Väst i kvartal 2 också ger 24 %, så den som läser fel kolumn får ändå rätt. Lös det med siffervalet ovan.
- Svårighet: ett räknesteg, rätt för grund eller tidig avancerad. Fråga 2 av 4 i övningsprovet på vårt format: rimligt.

**Ändras** (siffrorna), annars godkänd.

### 2.5 Figurserien (skiss 6, "Dagens pass, Figurserier, grund, uppgift 3")

Raden: punkt uppe vänster, streck lodrätt / punkt uppe höger, streck 45 / punkt nere höger, streck vågrätt / punkt nere vänster, streck 135 / punkt uppe vänster, streck lodrätt / ?. Facit B (punkt uppe höger, streck 45).

Innehåll:
- Entydigt: ja, B är den enda figur som följer båda rörelserna.
- **De två rörelserna går i takt (G7).** Punkten har period 4 (fyra hörn) och det bara strecket period 4 (180-graderssymmetri i 45-graderssteg), och de är i fas: uppe vänster hör alltid ihop med lodrätt, uppe höger med 45, och så vidare. Den som bara följer punkten får strecket gratis. Det är en regel, och alla distraktorer utom F faller på att de bryter kopplingen. Etiketten "grund" är rätt, men bildtexten "punkten vandrar medurs, linjen vrids 45 grader" lovar två.
- **Facit är en kopia av figur 2 (G9).** Hela figuren har period 4, så figur 5 = figur 1 och det sökta = figur 2. Uppgiften kan lösas genom att hitta kopian, utan att se någon regel.
- Distraktor F är figur 3 i raden: eliminerbar direkt.
- Distraktorerna A, C, D, E: en dimension fel var (A strecket ett steg för långt, C punkten står kvar, D ett steg bakåt i båda, E punkten ett steg bakåt med rätt streck): rätt tänkt.

Grafik (räknat i viewBox 40, punkt r 3, streck 2,5 med runda ändar):
- **g-4 (figur 4 i raden) och g-x2 (alternativ C): strecket når in i punkten med 4,1 enheter.** Streckets ände vid (13, 27) respektive (13, 13) ligger 1,4 enheter från punktens centrum. Figuren läses som en nål med knopp, inte som streck och punkt. Det är ägarens fynd, och det är två figurer, inte en.
- **Alla tio figurer: punkten ligger an mot ramens hörn.** Punktens kant ligger 1,75 enheter från ramens inre kant på raksträckan men överlappar den rundade hörnbågen (rx 5) med 0,7 enheter. G2 fallerar överallt.
- Lodrätt och vågrätt streck mot punkt: 2,5 enheters mellanrum (G1 kräver 4 enheter av 100, alltså 1,6 av 40: klarat, men snålt).
- Alternativen i tre spalter med figuren i 58 procent av rutan ger ett innehåll på 40 px på 360: fallerar G5 (48 px).

**Ritas om** enligt avsnitt 4. Den visade frågan stryks som exempel och ersätts.

### 2.6 Miniatyrerna i genomgången (skiss 3)

"Uppgift 14 latinsk kvadrat", "Uppgift 21 överlagring med vridning", "Uppgift 23", "Uppgift 27": miniatyrer av rutnät, inte frågor. Strecken i "uppgift 21" är 12 av 24 enheter i sin ruta med 6 enheters marginal: fint. Inga anmärkningar. Men två av de fyra miniatyrerna upprepar samma mönster (14 och 27 är samma rutnät); art-director bör variera.

---

## 3. Stickprov mot V7-bankerna

270 frågor, 252 valbara, inga lagerceller (varje cell är en primitiv). Kollisioner kan därför bara uppstå inuti en primitiv, och det är där de finns.

**Balanslinjen (15 valbara frågor), fel i renderaren, inte i banken.** Formerna har halvbredd 11 på positionerna 28, 50 och 72, så två grannformer på samma sida möts kant mot kant vid x 39 eller 61 och konturerna (bredd 3) överlappar 3 enheter. **10 frågor** visar sådana grannar: `v7e-b1`, `v7e-b2`, `v7g-3c-tva-03`, `v7a-3c-tva-03`, `v7a-3c-tva-05`, `v7a-3c-tva-06`, `v7e-3c-tva-03`, `v7e-3c-tva-04`, `v7e-3c-tva-05`, `v7e-3c-tva-06`. Renderat på 360: kvadrat och cirkel smälter ihop till en figur. Dessutom står de två avdelarna (x 39 och 61, y 45 till 55) exakt på formernas kanter och tangerar formernas över- eller underkant i **alla 15 frågor**. Åtgärd i `renderers.v7.tsx`: halvbredd 8, formerna på y 31 och 69, avdelarna y 47 till 53. Det ger 3 enheters fritt mellan grannar och 2,5 mot avdelarna. Banken rörs inte.

**Rotationssymmetri: 1 gränsfall, godkänt.** `v7g-q16-ray-rotate-walk` vrider två motsatta streck 45 grader; figuren har 180-graderssymmetri och därmed 4 distinkta lägen av 8. Klarar G6 (≥ 4) men inte mer. Övriga 68 frågor i vridningsfamiljerna har full period.

**Spegling: 0 fynd.** 18 speglingsfrågor, inget steg där källrutan är invariant under axeln, inga identiska rutor i någon kedja.

**Tomma distraktorer: 15 alternativ i 14 frågor** (G11), alla med misstagstext av typen "rutan saknas". Två ligger på expert: `v7e-3c-vand-03` och `v7e-3c-over-07`. Inga tomma figurer i något rutnät. Byts vid nästa generatorkörning, inte för hand.

**Orbitalens ram: kontrast 2,5:1.** Den streckade banan är `#94A3B8` på vitt. Den är referensramen som gör vandringen läsbar och ska upp till minst 3:1 (`#64748B` ger 4,6:1). Gäller 22 frågor.

**Övrigt, godkänt:** tally har 4 enheters fritt mellan pinnarna (3,4 px), kort och lång pil skiljer 16 enheter (13 px), orbitalens satellit har 15 enheters fritt till mittpunkten, ringarnas vita skiljelinje är 2 enheter (1,7 px, gränsfall men vit på svart och dubbelt så bred på DPR 2). Tile, lattice och sektorhjul är rutnät av avsikt och undantas från G1.

---

## 4. Till art-director

1. **Figurserien ritas om med V7:s primitiver, inte med en ny ruta-punkt-streck.** Två konstruktioner som klarar G1 till G9:
   - *Pil i stället för streck.* Vektorn (`vector`, kort längd 40, spets 9) har period 8. Punkten vandrar i hörnen av innehållsytan ((22, 22), (78, 22), (78, 78), (22, 78), avstånd 39,6 från centrum, radie 5). Pilen vrids 45 grader per figur, punkten flyttar ett hörn. G3: halvlängd 20 ≤ 39,6 − 5 − 2,5 − 4 = 28. Perioder 8 och 4, i otakt, hela figuren period 8: figur 5 upprepar inget, facit är ny.
   - *Orbital.* Punkten på den streckade cirkelns åtta lägen (period 8), ett bart streck i mitten med halvlängd 12 som vrids 45 grader (period 4, inte i fas om punkten går ett steg och strecket ett). Ramen finns redan och är godkänd sedan 15.8.
   I båda fallen: ingen egen fyrkantig ram inne i cellen, cellen är ramen, som i matriserna.
2. **Matrisexemplet i skiss 2, 4 och datorramen** byts till Alva-exemplets rutnät (två latinska kvadrater) eller märks "Grund, en regel". Misstagstexten enligt 2.1. Räknestrecken 8 av 40 höga.
3. **"Svårare efter rätt svar" stryks** ur Alva-ramen; meningen flyttar till startarket.
4. **Numeriska siffror** så att rätt andel inte ligger på ,5.
5. **Alternativen tre i bredd** kräver att figuren fyller 80 procent av rutan, annars faller G5 på 360. Visa det i skissen.
6. **Miniatyrerna i genomgången** ska vara fyra olika mönster.

## 5. Till byggaren

Nytt skript `scripts/v7-geometri-check.mjs` i valideringskedjan, samma körsätt som `v7-facit-check.mjs`, körs på alla banker och felar vid:

1. G1 och G2: analytiskt avstånd mellan målade kanter per primitiv, marginal mot [14, 86]. Renderarens mått flyttas till `src/lib/logicTestV7/geometri.ts` och importeras av både renderare och skript.
2. G3: för varje roterande streck och varje fast element, alla 8 lägen.
3. G6: distinkta lägen ≥ 4 för ray, sectorwheel, lattice, orbital, tile (tile finns i `kontroll.mjs`, flytta hit).
4. G7: bijektionstest mellan två rörliga elements lägen över de visade rutorna.
5. G8: kolumnkedjor och axelinvarians i spegling (raderna finns redan).
6. G9: figurserier, kanonisk nyckel mot alla visade figurer, period ≥ 6.
7. G10: enhetstest på färgkonstanter (kontrastkvot), inklusive orbitalens `#94A3B8` som ska bli `#64748B`.
8. G11: tomma alternativ högst ett per fråga och inga på expert.
9. G12: arrayceller felar tills en sammansatt primitiv är godkänd.

Renderaren: balanslinjens mått (halvbredd 8, y 31 och 69, avdelare 47 till 53) och orbitalens ramfärg. Båda är rena renderarändringar, bankerna och facit rörs inte, men G1-skriptet ska gå grönt på alla 270 frågor efteråt. Visuell kontroll med `scripts/pdf-to-png.mjs` på de tio balanslinjefrågorna före push.

---

## 6. De nio besluten i "Det här ber vi dig godkänna"

Ägaren säger ja om agenterna håller med. Mitt ställningstagande ur testinnehållets och testträningens perspektiv.

1. **Det enhetliga kortet.** Håller med, med en ändring: nivåerna beskrivs som "en regel", "två regler", "tre regler" i segmenten (riktlinjerna 2.3), vilket skissen gör i figurseriekortet men inte konsekvent i de andra. Ordet "lätt" får inte förekomma.
2. **Orden.** Håller med.
3. **Provraden säljer formatet även låst.** Håller med. Villkor som redan gäller: "samma format som", aldrig "samma test", inga logotyper, och leverantörens tal (antal, minuter) står bara när bevakningen har verifierat dem. Aons "20 på 5 minuter" är inte verifierat i riktlinjernas tabell och ska stå som "vårt format" tills det är det.
4. **Övningsprovets ram.** Håller med, med en ändring: metaraden "svårare efter rätt svar" i Alva-ramen stryks, den är återkoppling under provet och avslöjar föregående svar. Startarket får meningen i stället.
5. **Egna formaten.** Håller med. Talen kommer ur konfigurationen, och `testConfig.totals.test.ts` följer med.
6. **Övningsprovets resultat.** Håller med. "Aldrig percentil" gäller övningsprovet; percentilen på nivåtesten (från 25 sessioner) är ett annat ställe och står kvar.
7. **Passets regelpanel.** Håller med, med en ändring: texterna kommer ur `rule` och `misstag`, och exempelfrågans misstagstext är fel (2.1). Det ska synas i skissen att panelen bär bankens text ordagrant, så att ingen skriver om den i bygget.
8. **Dag 1-slutet.** Håller med. Tidpunkten på de tre klockorna styr påminnelsen per mejl; push är inte beslutat och ska inte antydas.
9. **Figurserier som riktning.** Håller med om riktningen (raden, eget kort, Aon dit), men **inte om figuren**: den ritas om enligt avsnitt 4 innan skiss 6 visas för någon, och exempelfrågan byts. G1 till G12 blir en del av generatorn från dag ett i omgång 2, inte en efterkontroll.
