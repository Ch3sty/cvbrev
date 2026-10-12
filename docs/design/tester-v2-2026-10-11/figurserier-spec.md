# Figurserier: raden, figurerna och valet

Datum 2026-10-12. Författare: art-director, med ägarens mandat ("snygga, snabbladdade frågor, proffsigt och påkostat, designen får inte lämna utrymme för feltolkningar"). Tillägg till `grafik-v3-spec.md`; avsnitt 12 där ersätts av det här dokumentet. Mottagare: Opus B (bygger renderare och vyer), testansvarig (beställningen till generatorn i `bestallning-omgang2.md` lutar sig mot måtten här), Opus A (generatorn väljer bara kombinationer som klarar S1 till S10 nedan). Underlag: `grafik-v3-spec.md`, `granskning-figurer.md` (G1 till G12 och avsnitt 4), `riktlinjer.md` 3.1, `skiss.html` skiss 6 (underkänd figur), Aon scales ix och SHL Verify G+ induktiv som format.

Sidan `figurserier.html` i samma katalog visar sex riktiga uppgifter, båda varianterna och alla tre nivåerna, före och efter svar, ljust och mörkt, 360 och 1280. Allt är renderat ur celldata med grafik v3:s renderare plus en prototyp av den nya primitiven, inte ritat för hand. Zonkontrollen i sidans sista avsnitt är räknad ur samma json som renderaren läser.

Enheten är viewBox-enheter (0 till 100 per cell) om inget annat sägs. Pixel per enhet på 360 är 0,82, som i matrisen. Inga tankstreck i något som visas för kandidaten.

---

## 0. Beslutet i tre meningar

**Remsa, inte rutnät.** Raden är fem figurer och en lucka (eller sex figurer i "bryter mönstret") i en remsa med hårlinjer bara mellan figurer som står bredvid varandra; på 360 bryts remsan i två med luft emellan, på dator står alla sex på en rad, och luckan är alltid sist. Figurerna har exakt matrisens figurspråk och mått, och det som är nytt är en enda sammansatt primitiv, **duo**: ett ytterelement och ett kärnelement i koncentriska zoner, så att avståndet mellan dem är detsamma i alla lägen, alla vinklar och alla fyllningar. Valet ritas alltid innanför rutan, aldrig som något som ändrar storlek, så att ingen figur flyttar sig när kandidaten trycker.

---

## 1. Raden: remsa, inte rutnät

Skissens figur fick underkänt för att den satte en egen ram i cellen och lät elementen nå varandra. Det här bygger i stället på matrisens kort: cellen är ramen.

| Mått | 360 (Pixel 7) | 1280 | Regel |
|---|---|---|---|
| Frågekolumn | 328 px (16 px marginal) | **640 px** (`max-width`) | Ändring mot matrisens 420: sex rutor på samma skala kräver 640 |
| Kort | kolumnen; ram 1 px `--kant`, radie 16, inre luft 10 px, `--lyft` | samma | Som `PassFraga.Matris` |
| Rutor per remsa | **3** (två remsor) | **6** (en remsa) | `.serie` är ett css-rutnät, `grid-template-columns` byter vid kolumnbredd 640 |
| Luft mellan remsorna | **8 px** (`row-gap`) | ingen (en remsa) | Ingen hårlinje mellan remsorna |
| Hårlinje | 1 px `--kant` som `border-left` på varje ruta utom den första i remsan | samma | Inte `gap` med bakgrund: då skulle luften mellan remsorna bli grå |
| Ruta | 102 px kvadrat (101,3 i praktiken) | 102 px | `aspect-ratio: 1`; samma som matrisen |
| Figurens svg | 80 % = 82 px | 82 px | 0,82 px per enhet på båda |
| Lucka | sist i andra remsan (nere till höger) | sist i remsan | Samma plats som matrisens lucka |

**En markup.** Servern renderar alltid sex rutor i ett `.serie`-rutnät; css ger tre kolumner på mobil och sex på dator. Hårlinjen är rutans vänsterkant (`.ruta{border-left:1px solid var(--kant)}`, `.ruta:nth-child(3n+1){border-left:0}` på mobil, bara `:first-child` utan kant på dator). Inget skript, inget layoutskift, och figuren har exakt samma pixelstorlek på mobil och dator.

**Läsriktningen utan text.** Tre saker säger "en rad som brutits", inte "ett rutnät": (1) hårlinjer finns bara mellan figurer i samma remsa, aldrig mellan remsorna, så remsorna läses som två rader av en mening; (2) luckan står sist, nere till höger, där ögat landar efter två vänster-till-höger-svep; (3) remsorna är lika breda och vänsterställda, utan egen ram, så ingen av dem kan läsas som en egen fråga. Frågeraden ovanför kortet ("Vilken figur kommer härnäst?") är gränssnittstext och hör inte till figuren. Varför inte sex i bredd på 360: rutan blir 54 px och figurinnehållet 31 px, långt under G5:s 56. Varför inte två remsor på dator: det finns plats för en, och en rad är det format Aon och SHL visar.

---

## 2. Cellen och skalan

Exakt matrisens: bläck 3, tunn linje och ram 2,5, allt målat innanför [14, 86] (G2), referens till [10, 90], nominellt yttermått i [58, 64] (V1), figuren i 80 procent av rutan och av alternativet. Färgroller och mappning som avsnitt 3 i `grafik-v3-spec.md` (`.matrisyta`, `--m-ram`, `.ratt-fylld` i koppar-bläck). Inget nytt här, och det är poängen: en figur ur en matris och en figur ur en serie ska inte gå att skilja åt.

Pixel på 360 (0,82 per enhet) för det som är nytt i duo: pil 26 enheter = 21,3 px lång, spets 16 bred = 13,1 px; kärncirkel 22 = 18,0 px; kärnkvadrat 20 = 16,4 px; romb 26 = 21,3 px spets till spets; kantprick 10 = 8,2 px (G5 kräver 8); satellit 12 = 9,8 px. Fritt mellan kärna och ytterelement minst 5,5 enheter = 4,5 px (G5 kräver 3).

---

## 3. Figurerna

Två klasser. Klass A är matrisens primitiver, oförändrade. Klass B är duo, den enda sammansatta primitiven, och den enda som får ha två element i en cell (G12).

### 3.1 Klass A: en primitiv per cell, oförändrade mått

Får förekomma i serien, med de rörelser som ger minst sex distinkta lägen ensamma eller i kombination:

| Primitiv | Rörelse | Lägen | Ensam i en grundfråga? | Not |
|---|---|---|---|---|
| Pil (`vector`) | vridning 45 grader (steg 1 eller 3) | 8 | ja | 90-graderssteg ger 4 lägen: bara i kombination |
| Pil | längd kort/lång, spets öppen/fylld | 2 + 2 | nej | bara som andra eller tredje regel |
| Månghörning (`poly`) | antal hörn 3 till 8 | 6 | ja | monoton räkning, period 6 exakt |
| Månghörning | vridning 45 grader | 8 för 3, 5 och 7 hörn | ja (3, 5, 7) | kvadrat 2, sexhörning 4, åttahörning 1: aldrig ensam |
| Månghörning | fyllning tom/grå/svart | 3 | nej | |
| Grundform (`stack`) | bas (4), symbol (5), fyllning (3) | 4, 5, 3 | nej | två av dem i otakt ger 12 till 20 |
| Streck från mitten (`ray`) | antal streck 1 till 8 medurs | 8 | ja | växande antal; vridning av en fast uppsättning bara om den saknar symmetri |
| Sektorhjul (`sectorwheel`) | vridning av ett osymmetriskt mönster 45 grader | 8 | ja | mönster med 180-graderssymmetri har 4: bara i kombination |
| Sektorhjul | antal fyllda sektorer 1 till 8, sammanhängande | 8 | ja | |
| 3×3-block (`tile`) | antal fyllda rutor 1 till 9 längs en bana | 9 | ja | |
| 3×3-block | en ruta vandrar runt kanten | 8 | ja | |
| 3×3-block | vridning 90 grader | 4 | nej | |
| Prick runt en cirkel (`orbital`) | satelliten vandrar (steg 1 eller 3) | 8 | ja | mittpunkt fylld/ofylld bara som andra regel |

**Får inte förekomma i serien:** räknestreck (högst 4 lägen), ringar (fyllningarna läses inte som en rörelse), 2×2-rutor (fyra lägen), former kring en linje (ingen naturlig rörelse), glyfer och lösa prickar (förbjudna sedan tidigare). Grå fyllning i klass A är tillåten som i matrisen (yttermått 60 och mer).

### 3.2 Klass B: duo, ett ytterelement och ett kärnelement

**Zonregeln (S1).** Kärnan ritas helt inom målad radie **14,5** från (50, 50). Ytterelementets målade innerkant ligger aldrig närmare centrum än **20**. Zonerna är koncentriska, så fritt är minst **5,5 enheter (4,5 px) i varje läge**, oavsett vinkel, stopp eller fyllning. Det är det som gör att G1 och G3 inte behöver räknas per fråga: de är sanna per konstruktion. Kontrollen räknar ändå (avsnitt 11), ur samma json som renderaren.

Kärnelement (målad radie räknad med kontur 3 och runda ändar):

| Kärna | Mått | Målad radie | Rörelse | Lägen |
|---|---|---|---|---|
| **Pil** | skaft y 63 till 39 i 3, spets vid y 37, två streck i 3 från spetsen till (42, 47) och (58, 47); `rotate(v, 50, 50)` | 14,5 | vridning 45 grader (steg 1, 2 eller 3) | 8 (4 vid steg 2) |
| **Form: cirkel** | r 11, kontur 3 | 12,5 (svart 11) | form (cirkel, kvadrat, romb) | 3 |
| **Form: kvadrat** | x 40, y 40, sida 20, rx 3 | 14,4 (svart 12,9) | fyllning tom/svart | 2 |
| **Form: romb** | (50, 37), (63, 50), (50, 63), (37, 50), round join | 14,5 (svart 13) | | |
| **Symbol** | plus, minus, kryss, prick r 5, ring r 7, exakt som grundformens symboler (`stack.plus` med flera) på (50, 50) | 11,5 / 11,5 / 11,4 / 5 / 8,5 | symbol byts | 2 till 5 |

Kärnan fylls **tom eller svart, aldrig grå**: grå på en 18 px kärna skiljer sig för lite från tom (1,7:1 mot papper), och i mörkt läge ännu mindre. Pilen i duo har alltid öppen spets (fylld spets med kontur 2,5 ger otydlig målad kant på 21 px).

Ytterelement:

| Ytter | Mått | Innerkant från centrum | Ytterst | Rörelse | Lägen |
|---|---|---|---|---|---|
| **Kant** | prick r 5 i bläck på kvadraten [23, 77]: åtta stopp medurs från klockan 12: (50, 23), (77, 23), (77, 50), (77, 77), (50, 77), (23, 77), (23, 50), (23, 23) | hörn 33,2; sidmitt 22 | 32 (nominellt yttermått 64) | pricken vandrar (steg 1 eller 3); antal prickar 1 till 6 i följd från ett fast stopp | 8; 6 |
| **Orbital** | bana r 26 i ram-grått 2,5 prickad, satellit r 6 i bläck: exakt matrisens orbital utan mittpunkt | satellit 20; bana 24,75 | 32 (64) | satelliten vandrar (steg 1 eller 3) | 8 |

Två kantprickar i följd (sidmitt till hörn) har 17 enheter fritt. G2-marginal: kantprick och satellit når till 82, bana till 77,25.

**Tillåtna duo-kombinationer:** varje ytter med varje kärna (2 × 3). **Förbjudet:** kant och orbital i samma cell (satelliten på ett diagonalläge och en hörnprick har 2,6 fritt), två kärnor, kärna utan ytter (då är det klass A), ytter utan kärna (orbital utan kärna är klass A:s orbital med ofylld mittpunkt; kant utan kärna finns inte: den skulle bara ha period 8 i en för gles figur).

Duo är med avsikt lättare i bläck än en klass A-figur (två små element i stället för ett stort). Det är inte en brist: luften mellan dem är det som gör att "pricken och pilen" aldrig läses som "en nål med knopp", vilket var ägarens fynd i skissen.

---

## 4. Rörelser, perioder och takt

Från G6, G7 och G9, uttryckta som generatorregler för serien:

| Nr | Regel | Följd |
|---|---|---|
| R1 | Hela figurens period (minsta gemensamma multipel av de rörliga elementens perioder) är minst 6 vid fem visade figurer (G9) | En ensam rörelse i en grundfråga måste ha period 6 eller mer: pil 45 grader, kantvandring, orbital, sektorantal, 3×3-antal, månghörning 3 till 8 hörn. Fyllning (2 eller 3), form (3), 90-gradersvridning (4) och hörnprick i fyra hörn (4) är aldrig ensamma |
| R2 | Ett vridet element har minst 4 distinkta lägen i familjens stegmängd (G6) | Pil steg 1, 2, 3 av 8; aldrig steg 4. Kvadrat, sexhörning, åttahörning vrids aldrig |
| R3 | Två rörelser får inte gå i takt (G7): avbildningen läge A → läge B över de visade figurerna får inte vara en bijektion | Två element med samma period och samma steg går alltid i takt: förbjudet. Använd olika perioder (8 och 4, 8 och 3, 3 och 2) eller olika steg i samma period (1 och 2, 1 och 3) |
| R4 | Facit och varje distraktor skiljer sig från varje visad figur (G9) | Kanonisk nyckel per figur som i `validate-v7-questions.mjs` |
| R5 | Varje distraktor skiljer sig från facit i minst en egenskap som syns på 360 | Tillåtna skillnader: ett stopp eller 45 grader, en form, tom mot svart, ett antal, kort mot lång, öppen mot fylld. Aldrig 22,5 grader, aldrig grå mot tom i en kärna, aldrig en skillnad som bara finns i referensramen |
| R6 | Nivåerna | Grund: en rörelse. Avancerad: två rörelser i otakt. Expert: tre, varav minst en med period 8 och steg 3 eller en monoton räkning. Nivån beskrivs som "en regel", "två regler", "tre regler" i gränssnittet, aldrig "lätt" |

Exemplen i `figurserier.html` följer R1 till R6; noterna per uppgift visar perioderna och varför paren inte går i takt.

---

## 5. Luckan

Exakt matrisens `LuckaV7` (avsnitt 5 i `grafik-v3-spec.md`): rutan i `--papper-2`, streckad ram-grå ram [16, 84] i 2, frågetecken som bana i ram-grått, aldrig text, aldrig koppar. I serien får luckan dessutom `border-radius: 0 4px 4px 0` så att det insjunkna fältet slutar mjukt mot kortets kant; på mobil är det sista rutan i andra remsan, på dator sista rutan i raden. Efter svaret: ramen och frågetecknet försvinner, rutan blir `--papper`, facit ritas i `.ratt-fylld` (koppar-bläck) i samma 80 procent. Ingen rörelse utöver 150 ms opacitet.

---

## 6. Alternativen

Sex alternativ, samma kort och lägen som matrisens avsnitt 6 (bokstav uppe till vänster, valt i 2 px bläck, rätt i koppar med punkt, övriga 38 procent, aldrig omsorterade, bokstaven står alltid kvar).

| Mått | 360 | 1280 |
|---|---|---|
| I bredd | **3** (två rader) | **6** (en rad, rakt under figurerna) |
| Kort | 102 px, luft 10 px | **100 px, luft 8 px** (6 × 100 + 5 × 8 = 640) |
| Figur | 80 % = 82 px | 80 px (0,80 per enhet; 2 procent mindre än i raden, under vad ögat ser, G5 48 px klaras med 57,6) |

På dator ligger alternativ A rakt under figur 1 och alternativ F rakt under luckan, så ögat kan jämföra lodrätt. Alternativen skiljs från raden av att de är egna kort med luft och bokstäver; raden är ett kort med hårlinjer. Det är samma skillnad som matrisen använder.

---

## 7. "Vilken bryter mönstret"

Sex figurer, ingen lucka, inga alternativ: figurerna är själva alternativen. Samma kort och remsor som "härnäst" (3 + 3 på 360, 6 på dator).

**Två former**, båda med frågan "Vilken figur bryter mönstret?" i frågeraden:

- **Regelform** (grund, avancerad): fem figurer delar en regel (en relation i figuren, ett antal, ett sammanhang), en bryter den, ordningen spelar ingen roll. Aons format. Exempel 4 och 5 på sidan.
- **Serieform** (avancerad, expert): fem figurer bildar en serie i läsordning, en är instoppad. SHL:s format. Exempel 6. Generatorn kontrollerar att bara ett borttag ger en ren serie (S9).

Om testansvarig vill skilja formerna åt för kandidaten är det ett ord i frågeraden, inte något i grafiken.

**Bokstav betyder valbar.** Rutorna i "bryter" har A till F uppe till vänster (11 px, 600, `--ink-3`, 8 px från vänster, 6 px från toppen, samma som alternativen). Raden i "härnäst" har inga bokstäver. Bokstaven ligger i rutans luft: figurens närmaste målade kant (kantprick i hörnet) börjar 24,8 px från rutans kant på 360, bokstaven slutar vid 16 px i sidled och 22 px i höjd.

**Val utan att något flyttar sig.** Rutan är `role="radio"` med träffyta 102 px. Alla lägen ritas med `box-shadow: inset`, som ligger innanför rutans kant och inte påverkar hårlinjer, rutstorlek eller figur:

| Läge | Ritning | Bokstav | Aria |
|---|---|---|---|
| Vilande | hårlinje till vänster, inget mer | `--ink-3` | "Figur B" |
| Tryckt (`:active`) | bakgrund `--papper-2` | | |
| Valt, inte skickat | `inset 0 0 0 2px var(--ink-1)` | `--ink-1` | `aria-checked="true"`, ", ditt svar" |
| Efter svar: den som bryter | `inset 0 0 0 2px var(--koppar)` + kopparpunkt 10 px uppe till höger (8 px från kanterna) | `--koppar-ink` | ", den som bryter mönstret" |
| Efter svar: valt och rätt | `inset 0 0 0 2px var(--koppar), inset 0 0 0 5px var(--koppar-mjuk)` + punkt | `--koppar-ink` | ", ditt svar, den som bryter mönstret" |
| Efter svar: valt och fel | som valt (2 px bläck) | `--ink-1` | ", ditt svar" |
| Efter svar: övriga | **oförändrade, ingen nedtoning** | | |
| Fokus (`:focus-visible`) | `inset 0 0 0 2px var(--ink-1), inset 0 0 0 4px var(--koppar)` | | |

Ingen nedtoning i raden efter svar: raden är det förklaringen pekar på ("fem av figurerna delar regeln"), och tonar man ned fem av sex försvinner regeln. I "härnäst" tonas alternativen ned som i matrisen, för där bär raden regeln och alternativen är gissningarna.

---

## 8. Genomgången

Samma panel som passets regelpanel (skiss 4): regeln och misstaget ordagrant ur bankens `rule` och `misstag`, knappen Nästa. Ingenting ritas ovanpå figurerna, inga pilar mellan rutorna, inga markeringar av "steget": regeln sägs med ord, facit visas med koppar.

- **Härnäst:** luckan fylls med facit i koppar-bläck, valt alternativ i bläckram, rätt i kopparram med punkt, övriga 38 procent. Panelen under alternativen.
- **Bryter:** den som bryter får kopparram och punkt i raden, kandidatens val får bläckram, övriga står kvar. Panelen under kortet.
- "Vet inte, visa regeln" i foten före svaret som i matrisen; efter det visas genomgången utan valt alternativ.
- Rörelse: 150 ms opacitet på facit i luckan och på panelen; inget annat; `prefers-reduced-motion` tar bort det.

Miniatyrerna i resultatets genomgångslista (skiss 3) ritar raden som en remsa med sex rutor i 24 px, luckan i `--papper-2`; aldrig två rader i en miniatyr.

---

## 9. Tillgänglighet

- Kontrast och "inget skiljs bara med färg" som matrisen (avsnitt 8 i `grafik-v3-spec.md`); i duo finns ingen grå fyllning, så den regeln har inget nytt fall.
- Raden i "härnäst": `role="img"`, aria-text "Raden med fem figurer och en lucka sist". Raden i "bryter": `role="radiogroup"` med `role="radio"` per ruta och bokstaven i aria-texten. Figurernas svg `aria-hidden`.
- Träffytor 102 px på 360, 100 px alternativ på dator. Tangentbord: piltangenter mellan rutorna i radiogruppen, mellanslag väljer, Enter skickar.
- Fokusstil enligt tabellen i avsnitt 7; i alternativen som matrisen.

---

## 10. Prestanda

Uppmätt ur `figurserier.html` (figurmarkup per uppgift, utan frågerad och panel):

| Uppgift | SVG-noder | kB |
|---|---|---|
| Härnäst grund, pil | 68 | 5,9 |
| Härnäst avancerad, duo kant + pil | 70 | 5,9 |
| Härnäst expert, duo orbital + form | 48 | 5,9 |
| Bryter grund, duo | 36 | 3,2 |
| Bryter avancerad, sektorhjul | 54 | 5,6 |
| Bryter expert, duo | 24 | 3,2 |
| Tyngsta tänkbara härnäst: 3×3-block i alla elva figurer | 114 | 13,3 |

| Krav | Mål | Hur det mäts |
|---|---|---|
| Noder per härnäst-fråga (11 figurer + lucka) | **högst 120** | `render-matris-granskning.tsx` räknar per bank, test felar över gränsen |
| Bytes per härnäst-fråga | **högst 14 kB** okomprimerat | samma |
| Noder och bytes per bryter-fråga (6 figurer) | **högst 70 noder, 8 kB** | samma |
| Inline svg, inga bilder, inga typsnitt, inga filter, masker, gradienter, `<use>` eller `<text>` | 0 | V12 |
| Layoutskift | CLS 0: `aspect-ratio: 1`, en markup för båda bredderna, inget skript för layouten | `scripts/perf-inloggat.ts` på passet |
| Första figuren | serverrenderad, ingen klientberoende färg | |
| Färgbyte vid svar och val | bara klasser och css-variabler, ingen omrendering av svg | |

Målen är lägre än matrisens (160 noder, 18 kB) för att serien har färre figurer; den tyngsta familjen ligger på 114 och 13,3.

---

## 11. Mätbara regler till `v7-geometri-check.mjs` och testerna

Läses ur `geometri.json` nyckeln `serie` (bilagan). V1 till V12 gäller oförändrade.

| Nr | Regel | Kontroll |
|---|---|---|
| S1 | Zonregeln: varje kärnas målade radie ≤ `serie.zon.karnaMax` (14,5); varje ytterelements målade innerkant ≥ `serie.zon.ytterMin` (20); skillnaden ≥ `regler.minGap` (4) | räknas analytiskt per kärna och ytter ur json, som i prototypens `zonkontroll()`; tabellen i `figurserier.html` är utdata |
| S2 | Duo har exakt ett ytter och en kärna; kant och orbital aldrig i samma cell | valideringen felar på annat |
| S3 | Kärnan fylls aldrig grå; pilen i duo har alltid öppen spets | enhetstest på renderarens utdata: ingen `#CBD5E1` i en duo-cell |
| S4 | Kantprick och satellit når högst till 82 (G2), nominellt yttermått 64 (V1) | bounding box per ytter |
| S5 | Raden har 6 rutor i "härnäst" (5 + lucka) och 6 i "bryter"; luckan är sist | validering per fråga |
| S6 | Period: hela figurens period ≥ 6 (G9), varje vridet element ≥ 4 lägen (G6) | kanonisk nyckel och periodberäkning per element |
| S7 | Takt: inget par rörliga element bildar en bijektion över de visade figurerna (G7) | tabellera (lägeA, lägeB) |
| S8 | Ingen figur återkommer: facit och alla distraktorer skiljer sig från varje visad figur; i "bryter" är alla sex olika | kanonisk nyckel |
| S9 | Serieform: exakt ett borttag ger en ren serie; regelform: den som bryter skiljer sig från alla andra och regeln håller för de fem | generatorns kontroll, körs i valideringen |
| S10 | Markup: en `.serie` med sex `.ruta`, `border-left` som hårlinje, inga `.remsa`-omslag; "bryter"-rutor har bokstav och `role="radio"`, "härnäst"-rutor har ingen bokstav | enhetstest på vyernas utdata |

---

## 12. Ändring mot `grafik-v3-spec.md` avsnitt 12

Avsnitt 12 sade "två rader även på 1280". Det ersätts: en remsa på dator i en 640 px kolumn, för att rutan då kan vara 102 px som på mobilen och figuren identisk på båda. Två rader på dator skulle ha varit matrisens kolumn på 420 med 70 px rutor, under G5. Allt annat i avsnitt 12 står kvar (samma figurspråk, luckan sist, alternativen som matrisen, G9 och V1 till V12).

---

## 13. Till Opus B, i ordning

1. `geometri.json`: nyckeln `serie` ur bilagan; `geometri.ts` får typerna. Inga ändringar i befintliga nycklar.
2. `renderers.v7.tsx`: primitiven `duo` enligt prototypen `renderers.serie.tsx` i art-directors scratchpad (`figurserier/`): kantens åtta stopp, orbitalens bana och satellit ur `orbital`, pilen, formerna och symbolerna ur `serie.duo`. Symbolerna återanvänder `stack`-måtten.
3. `v7-geometri-check.mjs`: S1 till S4 och S6 till S9 enligt avsnitt 11, plus S5 och S10 som enhetstester på vyn.
4. Ny vy `SerieFraga` med `.serie`-rutnätet (avsnitt 1), `LuckaV7` sist, alternativen i matrisens komponent med sex i bredd vid 640, och "bryter"-läget där rutorna är radioknappar (avsnitt 7). Frågekolumnen 640 på dator bara för figurserier.
5. Genomgången enligt avsnitt 8, miniatyren som en remsa.
6. `render-matris-granskning.tsx`: figurserier med noder och bytes per fråga, gränserna i avsnitt 10.
7. Riktig webbläsartest enligt `feedback_riktig_webblasartest`: pass och övningsprov, Pixel 7 och 1280, ljust och mörkt, båda varianterna, före och efter svar, jämfört mot `figurserier.html`.

---

## 14. Vad som är verifierat och vad som är bedömning

Verifierat: zonerna (största kärna 14,5, minsta innerkant 20, fritt 5,5 enheter = 4,51 px, kantgrannar 17, G2-marginal 18) räknade ur `geometri-serie.json` av prototypens `zonkontroll()`; nod- och bytestalen i avsnitt 10 ur bygget; sex uppgifter kontrollerade för hand mot R1 till R5 (perioder, takt, inga kopior) med resultatet i noterna på sidan; utseendet renderat med Chrome på 360 och 1280, ljust och mörkt, före och efter svar.

Bedömning: att 640 px är rätt kolumn på dator (580 ger 92 px rutor, fortfarande över G5, men då skiljer sig figuren från mobilens); att 8 px luft mellan remsorna räcker för att skilja remsa från rutnät (12 skulle sära dem mer än kortets inre luft och se ut som två kort); att serieformen hör hemma i "bryter" alls (den är SHL:s format och ger expert ett ärligt "tre regler", men är svårare att förklara i panelen än regelformen; testansvarig avgör om den tas med i omgång 2). Alla tre kan ändras med en siffra eller ett strukna avsnitt.

---

## Bilaga: nyckeln `serie` i geometri.json

```json
"serie": {
  "rad": {"figurer":5,"cellerBryter":6,"perRemsa360":3,"perRemsa1280":6,"remsluft":8,"kolumn1280":640,"altLuft360":10,"altLuft1280":8},
  "zon": {"karnaMax":14.5,"ytterMin":20,"minGap":4},
  "duo": {
    "kant": {"ram":[23,77],"stopp":8,"prickR":5,"maxAntal":6},
    "orbital": {"banaR":26,"satellitR":6,"banaSw":2.5,"banaStreck":"0 4.54"},
    "pil": {"svans":63,"skaftSlut":39,"spets":37,"huvudHalv":8,"huvudHojd":10},
    "form": {"cirkelR":11,"kvadrat":{"x":40,"y":40,"sida":20,"rx":3},"romb":[[50,37],[63,50],[50,63],[37,50]],"fyllning":["none","black"]},
    "symbol": {"plus":[[-10,0,10,0],[0,-10,0,10]],"minus":[[-10,0,10,0]],"kryss":[[-7,-7,7,7],[-7,7,7,-7]],"prickR":5,"ringR":7}
  },
  "bryter": {"bokstav":{"px":11,"vikt":600,"left":8,"top":6},"valRam":2,"rattRam":2,"valdRattInre":5,"punkt":{"px":10,"right":8,"top":8}}
}
```
