# Omgång 3, spår E: granskning av bryter mönstret och parti 2

Datum 2026-10-12. Granskare: testansvarig. Underlag: `ATT-GRANSKA.md`, de 56 PNG i `bryter-grund/`, `bryter-avancerad/`, `parti2-grund/`, `parti2-avancerad/`, kandidatfilerna i `src/lib/figurserierV1/kandidater/`, `scripts/lib/serie/sparrar-bryter.mjs`, beställningen A1 och A2, granskning 01 till 03. Facit räknat för hand på alla 32 bryter (regeln prövad på alla sex figurer, för B4 med alla åtta vridningar av spegelbilden) och på alla 24 härnäst (steg, cykler, båda serierna i F5). Beslutet står i `beslut.json` med bara `godkanda` och `strukna`; "ändra" finns inte i den här omgången, så det som behöver ett ingrepp står som struket med skälet, och får komma tillbaka med samma id när ingreppet är gjort.

## 1. Utfall

| Del | Granskade | Ja | Nej | Golv | Når golvet |
|---|---|---|---|---|---|
| Bryter grund (B1, B2) | 16 | 14 | 2 | 12 | ja |
| Bryter avancerad (B3, B4) | 16 | 16 | 0 | 12 | ja |
| Parti 2 grund (F1, F2) | 8 | 7 | 1 | 28 totalt i härnäst, redan nått | ja |
| Parti 2 avancerad (F4, F5) | 16 | 13 | 3 | 28 totalt i härnäst, redan nått | ja |

**Golven nås. Bryter mönstret kan befordras på båda nivåerna, figurpassets bryter-uppgift och övningsprovets hälft kan lanseras.** Efter befordran: bryter 14 + 16, härnäst grund 43, härnäst avancerad 43.

Facit: rätt i alla 56. Inga nålar, en kantprick per duo-figur utom i B1:s kantprick-variant (avsnitt 3), inga tomma figurer, inga tankstreck. Geometrin stämmer med bilderna.

## 2. Opus tolkningar

1. **BM1 och regler som håller för alla sex: godkänd.** En regel som alla sex uppfyller pekar inte ut någon. Det är rätt läsning, och den enda som gör B4 möjlig.
2. **BM4 i B4 som närmaste granne (högst två lägen): godkänd.** Spegelbilden har inga fria egenskaper; det BM4 ska skydda mot är att brytaren ser ut som ett annat mönster. Närmaste granne gör det. Att BM4 i B2 och B3 också gäller regelns egenskaper var för sig är bättre än beställningen: bara kombinationen bryter.
3. **3×3-blocket utelämnat i B4: godkänd**, med ett tillägg som Opus inte drog: samma skäl fäller "bara olika vridna" i B1 med block (avsnitt 3).
4. BM3 i B3 på pricken och pilen var för sig: godkänd.
5. Kvoten per primitiv, antal två till fyra i B1, "svarta sektorer" och "svarta rutor" som enhet: godkänt.

## 3. Bryter grund (B1, B2)

### B1 Antal

| Id | Primitiv | Facit | Bedömning |
|---|---|---|---|
| fsb-g-antal-01 | strålar 3, brytare 4 | E | ja; de fem är äkta vridningar av tre intilliggande streck |
| fsb-g-antal-02 | sektorer 3, brytare 2 | E | ja |
| fsb-g-antal-03 | block 4, brytare 5 | A | **nej, texten.** Blocket har fyra vridningar, så fem figurer kan inte vara "bara olika vridna": 201, 15, 294 och 480 är fyra vridningar av ett L, 75 (C) är spegelbilden. Facit är entydigt på antalet (bara A har fem rutor), men regeltexten och fem misstagstexter påstår en vridning som inte finns. |
| fsb-g-antal-04 | duo kant 4 prickar, brytare 3 | F | ja, se nedan |
| fsb-g-antal-05 | strålar 4, brytare 3 | B | ja |
| fsb-g-antal-06 | sektorer 2, brytare 1 | F | ja; en svart sektor mot två syns |
| fsb-g-antal-07 | block 3, brytare 4 | C | **nej, texten.** De fem är tre raka treor och två hörn, inte samma mönster vridet. Facit entydigt på antalet. |
| fsb-g-antal-08 | duo kant 3 prickar, brytare 2 | B | ja, se nedan |

**Blocket i B1 (antal-03, antal-07).** Samma argument som Opus använde för att ta blocket ur B4: ett 3×3-mönster har fyra äkta vridningar, inte fem. Blocket ska stå kvar i B1, för olika former med samma antal är en bra störning på grund, men texten ska inte påstå vridning. Regeltext för block: "Fem av figurerna har {antal} svarta rutor. Den som bryter har {antal_brytare}." Misstag: "Den här följer regeln: {antal} svarta rutor." Copywritern bekräftar formen, Opus E kör texten på de två, samma id, jag läser om texten. Ingen ny generering.

**Flera kantprickar i B1 (antal-04, antal-08).** F2 i granskning 01 gällde en vandring: "första pricken" i en båge går inte att peka ut utan ram. Här räknas prickarna bara, och fyra eller tre intilliggande kantlägen läses som en grupp som vrider sig. De ser ut som tärningsmönster, som Opus skrev, men uppgiften är att räkna, och symbolen i mitten delas av brytaren och minst en till (BM4). Godkända. Bevakas i klicktestet och i p-värdet: om de två ligger markant under B1:s 0,75 byts kantprick ut mot strålar i nästa omgång.

### B2 Samband

Alla åtta godkända. Kontrollerat per fråga: brytarens form finns hos minst två av de fem och brytarens fyllning hos minst två, så bara kombinationen bryter; den fria dimensionen (symbol, prickläge, satellitläge) har minst tre värden bland de fem; symbolen eller läget ger ingen konkurrerande regel (prövat: ingen symbol följer formen eller fyllningen i någon av de tre grundform-frågorna). Prick på svart cirkel (fyll-01 E, fyll-04 E) och ring på svart cirkel (fyll-07 F) ritas vita och syns.

Svaghet, inte fällande: i fyll-02 bär bara två svarta romber regeln "romben är svart" mot brytarens tomma romb, två mot en. Det räcker för entydighet men är den tunnaste fördelningen i omgången. Generatorn bör kräva minst två följare av varje form bland de fem, vilket alla åtta redan har.

Opus fråga om "symbolen spelar ingen roll": regeltexten säger vad regeln är, och det räcker. Den som letar efter en symbolregel hittar ingen och går vidare. Ingen text behövs.

## 4. Bryter avancerad (B3, B4)

### B3 Relation i duo

Alla tio godkända. Per fråga: pilen pekar mot pricken i fem (vinkel = läge × 45), brytaren pekar 90 eller 180 grader fel, brytarens läge och vinkel finns var för sig hos någon av de fem, fem olika lägen bland de fem. Kantprick på hörn med pil 45 grader mot hörnet (flera-01 B, flera-03 B, flera-05 D) pekar tydligt: pilen sitter mitt i cellen och pricken i hörnet, linjen går genom pricken.

Svaghet att bevaka: i 180-gradersfallen (flera-02, 03, 04, 05, 10) ligger pricken på pilens linje men bakom pilen. Den som läser regeln som "pilen och pricken ligger på en linje" ser ingen brytare alls, och måste byta till riktning. Det är entydigt, men de fem kan vara svårare än 90-gradersfallen; syns det i p-värdena är det inte ett fel utan två svårighetsgrader i samma mall.

### B4 Vridet mönster

| Id | Mönster (fem) | Brytare | Närmaste granne | Bedömning |
|---|---|---|---|---|
| fsb-a-vrid-01 | sektorer {0,4,6,7}: tre i rad plus en med lucka ett | C {0,2,6,7} = spegel vriden 6 | A, två lägen | ja |
| fsb-a-vrid-02 | strålar {0,1,2,4}: tre i rad plus en med lucka ett | F {3,5,6,7} = spegel vriden 7 | E, två lägen | ja |
| fsb-a-vrid-03 | sektorer {0,1,6}: par plus en med lucka ett | D {0,2,7} = spegel | B, två lägen | ja |
| fsb-a-vrid-04 | strålar {1,3,4,5}: tre i rad plus en med lucka ett | E {0,1,2,4} = spegel vriden 5 | B, två lägen | ja |
| fsb-a-vrid-05 | sektorer {1,2,5}: par plus en med lucka två mot tre | A {0,4,7} = spegel vriden 7 | C, två lägen | ja; den svåraste, luckan två mot tre måste räknas |
| fsb-a-vrid-06 | strålar {0,5,7}: par plus en med lucka ett | B {0,5,6} = spegel vriden 5 | A, två lägen | ja |

Alla sex: de fem är åtta-vridningar av ett mönster, brytaren är spegelbilden och ingen vridning av spegelbilden träffar mönstret, inget mönster har spegelsymmetri. Entydigt och facit rätt.

Svaghet, inte fällande: tre av sex (vrid-01, 02, 04) är samma mönsterklass, tre i rad plus en med lucka ett, och två till (vrid-03, 06) är par plus en med lucka ett. Radunikhet håller (olika figurer), men den som gör figurpasset i två veckor möter samma form fyra gånger. Nästa B4-omgång ska variera klassen: lucka två, två par med olika luckor, fyra av åtta utan symmetri.

## 5. Parti 2 härnäst

### Grund (F1, F2)

| Id | Rad | Facit | Bedömning |
|---|---|---|---|
| fs-g-vrid-12 | pil 135, 270, 45, 180, 315 | A 90 | ja; B och C rena (225, 0) |
| fs-g-vand-07 | satellit 6, 5, 4, 3, 2 | D 1 | ja; A och B rena |
| fs-g-vrid-13 | strålar start 4, 7, 2, 5, 0 | C [3,4,5] | ja; A och B rena |
| fs-g-vrid-14 | sektorer start 5, 0, 3, 6, 1 | B [4,5] | ja; A och C rena |
| fs-g-antal-14 | strålar från 7, två till sex | D sju | ja; B rätt antal fel plats |
| fs-g-antal-15 | sektorer från 7, sex ned till två | A en | ja; C rätt antal fel plats |
| fs-g-antal-16 | kantrutor från 2, två till sex | F sju | ja; B ringen vriden |
| fs-g-antal-17 | strålar från 5, två till sex | E sju | **nej.** Samma regel, samma riktning och samma antal som antal-14, bara starten skiljer. Det är fasen, inte regeln, som varierar, samma skäl som fs-e-fyll-06 och fs-e-flera-04. Ersättaren växer moturs eller tar en annan primitiv. |

### Avancerad (F4, F5)

| Id | Facit | Nära missar | Bedömning |
|---|---|---|---|
| fs-a-vrid-05 | E 90 lång öppen | C längd, D vinkel | ja |
| fs-a-vrid-06 | B 270 lång öppen | C spets, D vinkel | ja |
| fs-a-vand-03 | A läge 0 ofylld | B läge, C mitt | ja |
| fs-a-antal-08 | C [1,2] | B antal, F riktning | ja; alla tre läsningarna av gruppens läge ger samma facit |
| fs-a-antal-09 | B [3] | F antal, A läge | ja |
| fs-a-fyll-03 | F cirkel ring svart | B fyllning, C form | ja; ringen syns på svart |
| fs-a-flera-05 | D läge 4, pil 135 | A pil, F läge | ja; hörnprickar läsbara |
| fs-a-flera-06 | C läge 0 kvadrat | A läge, F form | ja |
| fs-a-vax-03 | D 90 kort öppen | C vinkel, F spets | ja; B är "ett steg till" med 225 |
| fs-a-vax-04 | E läge 2 ofylld | A, B läge, C mitt | ja |
| fs-a-vaxl-11 | C 225 | | **nej, F9 nedan** |
| fs-a-vaxl-12 | B läge 3 | | **nej, F9 nedan** |
| fs-a-vaxl-13 | F läge 3, pil 90 | A, D läge, E pil | **nej, F9 nedan** |
| fs-a-vaxl-14 | E [2,3,4] | A, B start | ja; B är fällan "fortsätter första serien" |
| fs-a-vaxl-15 | A 225 | B, C vinkel | ja; C är fällan |
| fs-a-vaxl-16 | D läge 6 | A, B läge | ja; B är fällan |

**F9. Den andra serien behövs inte.** I vaxl-11, 12 och 13 ger första serien (figur ett, tre, fem) förlängd ett steg exakt samma figur som facit: 270, 135, 0 ger 225 i vaxl-11; 4, 1, 6 ger 3 i vaxl-12; 2, 5, 0 ger 3 i vaxl-13. Den som struntar i växlingen och förlänger den serie hon först ser får rätt. Fällan "Fortsätter serien i den första, tredje och femte figuren", som bär F5 i vaxl-14 till 16 och i alla tio i banken (kontrollerat: ingen av fs-a-vaxl-01 till 10 har sammanfallet), finns inte att bygga. Regeln som ger F5 sin nivå är alltså överflödig, samma princip som F5 i granskning 01 och flera-05/06 i granskning 03. Stryks; ersättare med samma id får ny rad.

Spärr för generatorn (alla nivåer, F5 och F7): första seriens förlängning till luckan får inte sammanfalla med facit. Med ke, ko och åtta lägen är det villkoret s0 + 3·ke ≠ s1 + 2·ko mod 8.

Mindre: vaxl-12 tar bara en av två rena (läge 7 saknas), i strid med "rena först" från granskning 01. Faller med F9, men regeln gäller ersättaren.

## 6. Vad generatorn och texterna ska ändra

1. **B1 block:** regel- och misstagstext utan vridning (avsnitt 3). Text, samma id, de två kommer tillbaka.
2. **F5 och F7:** spärren i F9. `v7-facit-check --serie` ska fälla vaxl-11, 12 och 13 i nuvarande skick.
3. **F2:** samma regel med samma riktning och antal får inte förekomma två gånger per nivå med bara annan start; antal-17 ersätts.
4. **B4 nästa omgång:** variera mönsterklassen.
5. **Rena först** i F5 (granskning 01, punkt 6) står kvar som krav och kontrolleras i ersättarna.
6. Familjernas korttexter (copy 1.5): ja till bytet, efter befordran.

## 7. Beslut per id

Godkända (50): fsb-g-antal-01, 02, 04, 05, 06, 08; fsb-g-fyll-01 till 08; fsb-a-flera-01 till 10; fsb-a-vrid-01 till 06; fs-g-vrid-12, 13, 14; fs-g-vand-07; fs-g-antal-14, 15, 16; fs-a-vrid-05, 06; fs-a-vand-03; fs-a-antal-08, 09; fs-a-fyll-03; fs-a-flera-05, 06; fs-a-vax-03, 04; fs-a-vaxl-14, 15, 16.

Strukna (6): fsb-g-antal-03 och 07 (texten påstår vridning som blocket inte kan ge, tillbaka med samma id efter textbytet), fs-g-antal-17 (samma regel som antal-14, bara starten skiljer), fs-a-vaxl-11, 12, 13 (första serien förlängd ger facit, F9).

## 8. Data mot bedömning

Data: facit, vridningar, speglingar, lägen, serier och vilka egenskaper brytaren delar med de fem är räknade ur kandidatfilerna och stämda mot bilderna; sammanfallet i F9 är räknat i alla sexton F5 (sex nya, tio i banken). Bedömning: att en falsk regeltext fäller på grund (kandidaten lär sig av texten), att tärningsmönstret i B1 kant är läsbart när uppgiften är att räkna, att en överflödig växling är fel nivå (F9), och att samma regel med annan start är en upprepning. Prövbart i klicktestet: antal-04 och 08 mot övriga B1, 180-gradersfallen i B3 mot 90-gradersfallen, och B4:s lösningsgrad mot p_prior 0,48.

## 9. Tillägg 2026-10-12 (ATT-GRANSKA-tillagg, `beslut-tillagg.json`)

Textbytet i B1 håller: antal-03 (A har fem, de fem har fyra) och antal-07 (C har fyra, de fem har tre) stämmer mot rutorna och säger inget om vridning. Godkända.

Ersättarna: fs-g-antal-17 (kanten nedåt från sex, en ruta i taget medurs, E med en ruta) är entydig och är inte antal-14 med annan start. Godkänd. fs-a-vaxl-11 (facit 270, fällan B 315), vaxl-12 (facit sydväst, fällan A öst) och vaxl-13 (facit nordväst med pil 135, fällan A syd) har alla första seriens förlängning som ren distraktor och minst två rena. Godkända. Villkor i vaxl-12: C står i sydost, två steg bortom facit med regeltextens eget steg, så misstaget ska säga två steg, inte ett. Bara text.

F9 mot banken: fs-e-vrid-02 och fs-e-antal-04 är lösbara på fel sätt. I vrid-02 ger 45, 270, 135 förlängd 0 grader, som är facit, och längd och spets löper över hela raden, så B nås utan växlingen. I antal-04 ger start 2, 4, 6 förlängd 0, som är facit, och antalet löper över raden; den enda växlande dimensionen sammanfaller. Samma princip som avsnitt 5: regeln som ger nivån prövas aldrig. Strukna, ersättare med samma id. Expert går från 32 till 30 mot golvet 28, så ingen lucka i provet under tiden.

Data: vinklar, startlägen och facit är räknade ur bankExpert.json och kandidatfilerna; vaxl-12 kontrollerad mot SVG-koordinaterna. Bedömning: att en överflödig växling är fel nivå även när andra regler bär facit.
