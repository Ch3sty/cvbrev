# Testvideon: spec för motion och ljud (2026-10-12)

Art-director till ägaren (godkänner), testansvarig (granskar mot briefen), svensk-ux-copywriter (slutkoll på raderna) och den som bygger animation och ljud i kod. Innehållet följer `video-tester-brief-2026-10-12.md` och ägarens beslut samma dag om musik och ljudeffekter komponerade i kod. Storyboarden med alla stillbilder: `video-tester-storyboard-2026-10-12.html`. Skärmdumpar: `docs/qa/video-tester/`.

Master 1920 × 1080, 30,0 s, 30 bilder/s. Säkerhetszon 4:5 (864 × 1080, x 528 till 1392). Musik och ljud renderas offline på samma tidslinje som animationen. Videon fungerar ljudlös: texten bär allt.

---

## 1. Koncept: Bladet och tråden

Hela filmen utspelar sig på ett enda provblad som ligger på bordet. Bladet byter aldrig plats, bara innehåll, så ögat vet alltid var det ska titta. En orange tråd, vår Tråd, följer med från kallelsens markerade dag till den sista knappen och visar i varje scen var du är: bredvid rubriken när uppgiften byggs, runt det rätta svaret när det markeras, som bladets överkant när något är klart.

### Fem grepp som gör rörelsen proffsig

1. **Två konstanter.** Bladet står på samma plats (x 568 till 1352, överkant y 264) i alla sex scener och tråden är den enda orange ytan i varje bild. När allt annat byts hålls blicken av två saker som inte gör det.
2. **Element som blir nästa element.** Kalenderdagens orange ruta sträcks till tråden (3,5 till 4,0 s). Matrisen från scen 2a återkommer liten i genomgången (17,25 s). De fem punkterna i personlighetsskalan glider ut och blir fem staplar (25,25 till 26,0 s). Innehållet byts som i produkten: nästa fråga glider upp och ut, resultatet kommer med bekräftelsens linje (`.confirm-panel`: tråden löper längs överkanten till 100 procent och stannar).
3. **En kurva, tre tider.** Allt som flyttar sig använder ease-out `cubic-bezier(0.2, 0.7, 0.2, 1)`: 200 ms för små saker (chips, punkter, trådflytt), 400 ms för bladets innehåll (nästa fråga, lyftet), 600 ms för scrollar och morfar. Fades är 300 ms linjära. Pilens vridning är filmens enda ease-in-out, 180 ms, för att den ska kännas mekanisk. Ingen fjäder, ingen överskjutning, ingen skalning.
4. **Lugnt på rutnätet.** Varje klipp ligger på slag 1 eller 3 (hela sekunder). Ett nytt element var 1 till 1,5 s, utom när något byggs (matrisen, tabellen): då är bygget ett element med inre rytm på åttondelar eller sextondelar. Varje textrad står minst 2,5 s, tonar in och ut på 300 ms, rör sig aldrig i sidled.
5. **Ett hårt klipp.** Till provläget på 22,0 s. Allt annat glider eller tonar. Därför känns provet som ett prov.

Tråden som bärare av rörelsen är hämtad ur designsystemet (`docs/designsystem.md` avsnitt 5 och 8): aktiv rad, bekräftelse, laddning. Den som använt produkten känner igen den.

---

## 2. Tokens för videon

Produkten som den är live i dag: Tråden v2.1. Inte Träningens rum (indigo och koppar i `tester-lyft-2026-10-11/` ligger på brancher som inte är mergade). 1 px i produkten är 2 px i videon, så bladet läses som en telefonbred vy i 2x.

| Roll | Värde | Var i videon |
|---|---|---|
| Bordet (mark) | `#EDE8DF` | Bakgrund i alla bilder |
| Bladet (panel) | `#FFFFFF` | Provbladet, radie 24, kant 2 px `#DBD2C4` |
| Mjuk yta (insunken) | `#ECE6DC` | Sökta celler i tabellen, chippen Test, etiketten Fel, stapelspår |
| Hårlinje (kant) | `#DBD2C4` | Rutnät i matrisen, radavskiljare |
| Knappkant (kant-stark) | `#C4B9A8` | Sekundära knappar, tomma provrutor |
| ink-1 | `#1C1917` | Rubriker, tal, pilar, primärknapp, gjorda provrutor |
| ink-2 | `#57534E` | Textstycket i verbalt, staplarna i profilen |
| ink-3 | `#6B645E` | Metadata, etiketter, underraden |
| Tråden (accent) | `#D9480F` | En yta per bild. Aldrig text, aldrig bakgrund |

Ingen annan kulör. Inget rött, inget grönt, ingen gradient, ingen skugga.

**Typsnitt.** Schibsted Grotesk (`--font-display`) och Inter, samma som sidan laddar.

| Roll | Snitt | Storlek i 1920 × 1080 | Position |
|---|---|---|---|
| Rubrikrad | Schibsted Grotesk 800, -0.025em | 48/56 px, ink-1 | Vänsterställd x 592, första baslinjen y 164. Tråden som 6 px stapel vid x 568 när den står vid rubriken |
| Underrad | Inter 500 | 30 px, ink-3 | x 592, baslinje y 1036 |
| Avslutsrad | Schibsted Grotesk 800 | 48 px, ink-1, centrerad | Inuti bladet |
| Ordmärke | Schibsted Grotesk 700 | 36 px, ink-1, centrerad | `jobbcoach.ai`, utan logotypens orange J-platta (den hade blivit en andra orange yta) |
| Stora tal | Schibsted Grotesk 800, tabulära | 120 px | 12 och 80 i resultatet |
| Gränssnitt i bladet | Inter 400/500/600 | 24 till 32 px (12 till 16 i produkten) | Tabell 26, text 27, fråga 30 600, etiketter 22 versaler 0.06em |
| Knappar | Inter 500 | 28 px, höjd 88, radie 16 | Primär: ink-1 med vit text. Sekundär: panel med kant-stark |

**Mått.** Bladets inneryta x 608 till 1312 (704 bred, padding 40). Tråden 6 px. Ringen runt ett svar 6 px accent, 3 px utanför rutan, radie rutans plus 3. Matrisen 3 × 128 i scen 2a, 3 × 80 i genomgången. Pilen ritas som i `renderers.v7.tsx`: skaft från (50, 78) till (50, 24), spets 9, roterad kring (50, 50), skalad till cellen.

---

## 3. Scen för scen

Scengränser justerade till musikens rutnät (se avsnitt 4). Bildruta = sekund × 30.

| Scen | Tid | Bildrutor | Briefen |
|---|---|---|---|
| 1 Kallelsen | 0,0 till 4,0 | 0 till 119 | 0 till 4 |
| 2a Logiktest | 4,0 till 8,0 | 120 till 239 | 4 till 7,3 |
| 2b Verbalt resonemang | 8,0 till 11,0 | 240 till 329 | 7,3 till 10,6 |
| 2c Numeriskt test | 11,0 till 14,0 | 330 till 419 | 10,6 till 14 |
| 3 Resultat och genomgång | 14,0 till 20,0 | 420 till 599 | 14 till 20 |
| 4 Nivåer och provläge | 20,0 till 24,0 | 600 till 719 | 20 till 24,5 |
| 5 Personlighetstest | 24,0 till 27,0 | 720 till 809 | 24,5 till 27,5 |
| 6 Avslut | 27,0 till 30,0 | 810 till 899 | 27,5 till 30 |

Textraderna är briefens, ordagrant. Tider nedan.

### Scen 1: Kallelsen (0,0 till 4,0 s)

- **Text.** 0,5 till 3,5 s: `Kallad till ett rekryteringstest?` (två rader, 48 px).
- 0,0 till 0,5: bladet tonar in på bordet, y 264 till 760. Ingen förflyttning.
- 0,5 till 1,1: kalenderraden (Oktober, Mån 12 till Sön 18) glider in från höger, 48 px, ease-out 600 ms.
- 1,25: dagen 15 (Tor) fylls orange, 200 ms. Det är bildens accentyta.
- 1,75: chippen `Test` i insunken landar under dagen med 8 px glid uppåt, 200 ms. `Kl. 09.00` i ink-3 tonar in samtidigt.
- 3,5 till 4,0: övergång. Bladets innehåll glider upp 40 px och tonar ut (400 ms). Den orange rutan sträcks till en 6 px stående linje som glider till x 568 vid rubrikens plats: tråden. Rubriken tonar ut 3,5.

### Scen 2a: Logiktest (4,0 till 8,0 s)

- **Text.** 4,0 till 8,0: `Logiktest` med tråden vid x 568. 4,5 till 14,0 (underraden, ligger kvar genom hela scen 2): `Samma format som det riktiga testet`.
- 4,0 till 4,5: rutnätet 3 × 3 (cell 128, centrerat, överkant y 304) ritas med stroke-dashoffset från övre vänstra hörnet.
- 4,5: pilen föds i ruta 1, 0 grader, lång, fylld spets (ur `v7g-q3-vector-rotation`).
- 4,75, 5,0, 5,25, 5,5, 5,75, 6,0, 6,25: pilen hoppar till nästa ruta (åttondelar). I varje hopp glider den 128 px (ease-out 200 ms) och vrider sig 45 grader medurs (ease-in-out 180 ms) och lämnar en kopia kvar: 0, 45, 90 / 135, 180, 225 / 270, 315. På 6,25 får nionde rutan sin streckade ram (ink-3, 8 6).
- 6,25 till 6,875: sex svarsalternativ (128 × 96, radie 16, kant-stark) landar ett per sextondel med 12 px glid uppåt. Ordning i videon: 45 lång fylld, 0 kort fylld, 180 lång fylld / 0 lång öppen spets, **0 lång fylld (rätt)**, 315 lång fylld.
- 7,0 till 7,25: tråden lämnar rubriken, löper ned längs bladets vänsterkant (som en linje som dras) och fram till det rätta alternativet.
- 7,25 till 7,5: ringen ritas runt alternativet (stroke-dashoffset, 300 ms). Inget annat rör sig.
- 7,5 till 8,0: hålls. **Affischbilden** (poster) tas vid 7,5 s, bildruta 225.

### Scen 2b: Verbalt resonemang (8,0 till 11,0 s)

- **Text.** 8,0 till 11,0: `Verbalt resonemang`. Underraden ligger kvar.
- 8,0 till 8,3: matrisen och alternativen glider upp 40 px och tonar ut. Tråden glider tillbaka till rubriken samtidigt (ringen öppnar sig till en linje).
- 8,0 till 8,5: textstycket ur `v1-p01-summer-employment` tonar in rad för rad, sex rader, 80 ms mellan: "Många företag tycker att det är förmånligt att anställa studenter över sommaren. Den ordinarie personalen vill ofta ta ut semester under denna period. [...] Företagen betalar studenterna utifrån en fast skala utan de vanliga rättigheterna, såsom betald semester och sjuklön."
- 8,75: etiketten PÅSTÅENDE och påståendet landar: "Studenter har samma rätt till betald semester som den ordinarie personalen när de sommarjobbar."
- 9,0, 9,125, 9,25: `Sant`, `Falskt`, `Kan ej avgöras` landar (tre lika breda sekundära knappar, höjd 88).
- 9,5 till 9,75: tråden till Falskt. 9,75 till 10,0: ringen sluts. Hålls till 11,0.

### Scen 2c: Numeriskt test (11,0 till 14,0 s)

- **Text.** 11,0 till 14,0: `Numeriskt test`. Underraden till 14,0.
- 11,0: nästa fråga, samma glid som 8,0. Klockan uppe till höger (ring 16 px med två visare + `0:41` tabulärt) tonar in. Klockan räknar **uppåt**: `0:42` på 12,0, `0:43` på 13,0.
- 11,0 till 11,4: tabellen `Försäljning 2024 per kategori (MSEK)` ur `num-p01` glider in rad för rad från vänster (sex rader, 70 ms mellan, 24 px). Decimalkomma. Kolumner Kategori, Q1 till Q4, Totalt. Sista raden Totalt i 600 med en kant-stark-linje ovanför.
- 11,5: frågan landar: "Hur stor andel utgjorde Sport av total årsförsäljning?"
- 11,75 till 12,125: fyra alternativ 2 × 2 (höjd 64) landar: Cirka 12 %, **Cirka 15 %**, Cirka 18 %, Cirka 22 %.
- 12,5: cellerna Sport/Totalt (26,0) och Totalt/Totalt (170,0) får mjuk yta (insunken, radie 8), 200 ms. Inte orange.
- 13,0 till 13,25: tråden till Cirka 15 %. 13,25 till 13,5: ringen sluts. Hålls till 14,0.

### Scen 3: Resultat och genomgång (14,0 till 20,0 s)

- **Text.** 14,0 till 17,0: `Rätt och fel direkt`. 17,0 till 20,0: `Och regeln bakom varje fråga`.
- 14,0 till 14,4: lyftet. Tråden lämnar ringen, löper längs bladets överkant från vänster till höger (0 till 100 procent, 400 ms) och stannar som bladets 6 px överkant. Innehållet byts samtidigt till resultatet (underraden tonar ut på 14,0).
- 14,25 till 15,25: `12` och `80` räknas upp i åtta steg på sextondelar: 0, 2, 3, 5, 6, 8, 9, 11, 12 och 0, 10, 20 ... 80. Tabulära siffror. `av 15` och `procent` står stilla i ink-3 från 14,25. Etiketten DIN POÄNG ovanför.
- 15,5: `Tid` `6:48` och `Per fråga` `27 sek` tonar in under en hårlinje. Under dem skymtar `Fråga för fråga` med raderna Fråga 7 Rätt, Fråga 8 Rätt, Fråga 9 Fel, Fråga 10 Rätt.
- 16,5 till 17,0: vyn scrollar inuti bladet 520 px nedåt (ease-out 500 ms) till genomgången.
- 17,0: raden `Fråga 9` med etiketten `Fel` (chip i insunken, inte röd) landar.
- 17,25: matrisen från 2a i liten storlek (cell 80) till vänster och de sex alternativen (128 × 80) till höger landar som en bild. Det valda alternativet (45 grader) tonas till 45 procent opacitet. Inget rött.
- 17,75 till 18,0: tråden lämnar överkanten, löper ned och ringar det rätta alternativet.
- 18,0 till 20,0: regelmeningen tonar in och står: "Pilen vrider sig 45 grader medurs för varje ruta." (28 px, ink-2). Fråga 10 Rätt under.

### Scen 4: Nivåer och provläge (20,0 till 24,0 s)

- **Text.** 20,0 till 22,5: `Tre nivåer, grund till expert`. 21,5 till 24,0: `Och provläge mot klockan`. Två rader i bild 21,5 till 22,5, filmens max.
- 20,0: klipp på taktens etta. Bladet tar sin korta form (överkant kvar på y 264, underkanten animeras till y 520 på 300 ms). Etiketten `Logiktest` och tre lika breda sekundära knappar `Grund`, `Avancerad`, `Expert` landar 20,0, 20,125, 20,25.
- 20,25: tråden som 6 px linje under Grund (bredd knappen minus 48). Glider till Avancerad 20,75 och till Expert 21,5, 200 ms ease-out. Position, inte val: inga ink-kanter byts.
- 22,0: **hårt klipp**, filmens enda. Hela provbladet står färdigt i första bildrutan: `Logikprov` och klockan `24:59` i huvudet, tio rutor (56 px, tre fyllda i ink-1, den fjärde orange som här är du, sex tomma med kant-stark), en matris med cirkel, kvadrat och triangel i latinsk kvadrat och streckad nionde ruta (cell 88), sex små alternativ, och `Lämna in` som primärknapp i full bredd längst ner.
- 23,0: klockan `24:58`. Den enda klockan i filmen som räknar **ner**. Ingenting blinkar, ingenting blir rött.
- 22,0 till 24,0: inget annat rör sig. Inga förklaringar under provet.

### Scen 5: Personlighetstest (24,0 till 27,0 s)

- **Text.** 24,5 till 27,0: `Personlighetsprofil. Inga rätta svar.` (två rader).
- 24,0: klipp på ettan. Bladet y 264 till 640. `Personlighetstest`, påståendet ur `g-23` "Jag är noggrann med detaljer." (40 px 600) och skalan tonar in 24,0 till 24,4: en linje i kant-stark med fem ringar (r 18, ink-1-kontur), ändetiketterna `Stämmer inte alls` och `Stämmer perfekt` i ink-3.
- 25,0: punkt 4 fylls orange, radien 18 till 24 på 160 ms. Inget rätt, inget fel.
- 25,25 till 26,0: morf. De fem ringarna glider till vänster och ner till fem staplars startpunkter (x 956, raderna y 376 till 664), ändetiketterna tonar ut, dimensionsnamnen tonar in i ink-2: Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet (produktens namn, `DIMENSION_META`). Den orange punkten glider upp och blir bladets 6 px överkant: profilen är klar. Bladet växer till y 760. Etiketten `Din profil`.
- 26,0 till 26,75: staplarna (spår insunken 24 px, fyllning ink-2) växer med samma hastighet och stannar en i taget: Känslomässig särbarhet 38 procent på 26,25, Utåtriktning 45 på 26,375, Öppenhet 62 på 26,5, Vänlighet 70 på 26,625, Samvetsgrannhet 78 på 26,75. Inga tal, inga band, samma ton på alla.

### Scen 6: Avslut (27,0 till 30,0 s)

- **Text.** 27,5 till 30,0: `Träna nu. Kom förberedd sen.` 28,0 till 30,0 (knapp): `Starta gratis test`. 28,5 till 30,0 (ordmärke): `jobbcoach.ai`.
- 27,0 till 27,4: bladet blir rent. Innehållet tonar ut, bladet tar sin sluthöjd (y 264 till 880), tråden ligger kvar som överkant.
- 27,5: avslutsraden tonar in, centrerad i bladet (48 px).
- 28,0: knappen landar på taktens etta, 8 px glid uppåt, 400 bred, ink-1. Samma form och ordalydelse som landningssidans primärknapp.
- 28,5: ordmärket tonar in.
- 29,0 till 30,0: bilden står helt stilla. Sista bildrutan (899) är identisk med 29,0 så att loopen börjar rent.

---

## 4. Ljudkartan och musiken

### Tempo, tonart, rutnät

**120 BPM i halvtidskänsla, 4/4, 15 takter om 2,0 s, D-dur.** Den hörda pulsen är 60 slag i minuten (bas och filtkick på slag 1 och 3, en gång i sekunden); plock och klick ligger på ett rutnät om 0,5 s (åttondelar) och 0,125 s (sextondelar). Det ger tre saker: varje klipp i filmen ligger på ett starkt slag (slag 1 eller 3, alltså hela sekunder), klockorna i scen 2c och 4 tickar exakt på slag, och talen räknas upp på sextondelar. Taktens etta vid 0, 2, 4 ... 28 s.

Briefen föreslog 100 till 110 BPM. Vid 100 BPM slutar 30 s mitt i en takt (12,5 takter) och vid 96 BPM börjar varannan uppgift i scen 2 på ett svagt slag. 120 i halvtid är lugnare att lyssna på än 100 i fulltid, eftersom pulsen man känner är 60.

### Lager (allt syntetiserat)

| Lager | Klang | Nivå | När |
|---|---|---|---|
| Pad | Två avstämda trianglar (±6 cent), lågpass 900 Hz, 600 ms attack, 1,2 s release, fyrklangs-voicing utan grundton i basregistret | -18 dB | Hela filmen. Öppnar till 1,6 kHz och går upp en oktav på 14,0. Stängs ned till 600 Hz på 22,0, öppnar till 1,2 kHz på 24,0 |
| Plock | Triangel, 2 ms attack, 350 ms exponentiell klang, lågpass 2,5 kHz. Nylonsträng eller trä | -14 dB | Melodin. Skalan i 2a, sparsamt i 2b, 5, och slutackordet |
| Bas | Sinus + 10 procent triangel, en oktav under grundtonen | -12 dB | Slag 1 och 3 från 14,0 till 22,0. Bara ettan på 22,0 (E2). Mjukt på 24,0, 25,0, 26,0, 27,0. Tungt på 28,0 och 29,0 |
| Filtkick | Sinus 110 till 50 Hz på 60 ms, 150 ms klang. Ett dovt slag, ingen trumma | -16 dB | Slag 1 och 3 från 14,0 till 22,0. Tyst 22,0 till 28,0. 28,0 och 29,0 |
| Rim | Brusknäpp 15 ms, bandpass 2,4 kHz | -26 dB | Slag 2 och 4 (halva sekunder) från 4,5 till 21,5. Tyst 22,0 till 30,0 |
| Klocktick | Klick 6 ms, bandpass 4 kHz, panorerat lätt åt höger (där klockan sitter) | -22 dB | 12,0, 13,0 (klockan upp), 23,0 (klockan ner). 14,0 och 24,0 täcks av klippen |
| Reverb | Kort plåt 1,2 s | -24 dB send | Bara pad och markeringsklang. Allt annat torrt |

### Ljudeffekter (en-shots)

| Namn | Klang | Nivå | Används för |
|---|---|---|---|
| Glid | Lågpassat rosa brus 250 till 750 ms, filtret rör sig (faller vid in-glid, stiger vid ut-glid och morf) | -28 dB | Rader som glider in, nästa fråga, scroll, morf, bladet blir rent |
| Träklick, lågt | Triangel 60 ms, 400 till 300 Hz, lågpass 3 kHz | -20 dB | Svarsalternativ, knappar, provrutor, nivåer: saker som landar tungt |
| Träklick, högt | Triangel 60 ms, 900 till 600 Hz | -20 dB (-30 dB när det står "knappt hörbart") | Chip, påstående, fråga, rad, Tid/Per fråga, ordmärke |
| Vridning | Bandpassat brus 40 ms som stiger 1,2 till 2,2 kHz | -30 dB | Pilens åtta hopp, lagt ovanpå plockets ton |
| Trådflytt | Brus-zip 150 ms (120 ms mellan nivåerna), 300 till 1 200 Hz | -28 dB | Varje gång tråden flyttar sig |
| Tråden löper | Samma zip, 400 ms | -26 dB | Lyftet 14,0 |
| Markering | Två sinustoner D5 (587 Hz) och A5 (880 Hz), 8 ms attack, 700 ms klang, lågpass mjuk. Mjuk marimba | -18 dB, aldrig mer | Rätt svar ringas: 7,25, 9,75, 13,25, 17,75. Samma ljud alla fyra gånger. Ingen fanfar, inget ackord |
| Räknare | Åtta blipp 20 ms på sextondelar, 500 till 900 Hz stigande, avslutas med högt träklick | -24 dB | 12 och 80 räknas upp |
| Dab | Triangel 80 ms, 300 till 200 Hz | -32 dB | Mjuk yta på celler (12,5), punkten på skalan (25,0, något starkare) |
| Knapp | Lågt träklick samtidigt med bas och filtkick | | 28,0. Ett thock, inget klick |
| Slutackord | Plockat Dmaj9 (D3 A3 C#4 E4 F#4) + bas D2 + filtkick, alla andra lager släpps | -10 dB | 29,0. Klingar 0,9 s av egen kraft, portas hårt 29,9 |

Text har inget ljud. Bara gränssnittet låter. Inga felljud (inget fel visas med ljud), ingen fanfar, ingen konfetti.

### Cue sheet

| Tid (s) | Bildruta | I bild | Ljud eller musikhändelse | Karaktär |
|---|---|---|---|---|
| 0,00 | 0 | Bladet tonar in på bordet | Pad Dmaj9 börjar svälla | Ensam i mixen, 600 ms attack |
| 0,50 | 15 | Kalenderraden glider in från höger | Glid | Filtret faller 1,8 kHz till 400 Hz |
| 1,25 | 38 | Dagen 15 fylls orange | Träklick, lågt | |
| 1,75 | 53 | Chippen Test landar | Träklick, högt | |
| 2,50 | 75 | Stilla, rubriken står | Plock A4 | Första melodinoten |
| 3,50 | 105 | Innehållet glider ut, orange ruta sträcks till tråden | Glid + plock F#4 | Stigande filter |
| 4,00 | 120 | Klipp till Logiktest, rutnätet ritas | Ackordbyte Dmaj7, rim börjar på 2 och 4 | |
| 4,50 | 135 | Pilen föds i ruta 1 (0 grader) | Plock D4 + vridning | |
| 4,75 | 143 | Hopp till ruta 2, 45 grader | Plock E4 + vridning | Åttondelar, en ton per hopp |
| 5,00 | 150 | Ruta 3, 90 grader | Plock F#4 + vridning | |
| 5,25 | 158 | Ruta 4, 135 grader | Plock G4 + vridning | |
| 5,50 | 165 | Ruta 5, 180 grader | Plock A4 + vridning | |
| 5,75 | 173 | Ruta 6, 225 grader | Plock B4 + vridning | |
| 6,00 | 180 | Ruta 7, 270 grader | Plock C#5 + vridning, ackordbyte Bm7 | Skalan går över taktstrecket |
| 6,25 | 188 | Ruta 8, 315 grader. Nionde rutan får streckad ram | Plock D5 + vridning | Skalan landar på oktaven |
| 6,25 till 6,875 | 188 till 206 | Sex alternativ landar, ett per sextondel | Träklick, lågt, x6 | Lika starka, som brickor på ett bord |
| 7,00 | 210 | Tråden löper från rubriken till rätt svar | Trådflytt | |
| 7,25 | 218 | Ringen sluts runt pilen 0 grader | Markering | |
| 8,00 | 240 | Nästa fråga, textstycket ritas rad för rad | Glid + ackordbyte Gmaj7 | |
| 8,75 | 263 | Påståendet landar | Träklick, högt | |
| 9,00 till 9,25 | 270 till 278 | Sant, Falskt, Kan ej avgöras landar | Träklick, lågt, x3 | Stigande 300, 340, 380 Hz |
| 9,50 | 285 | Tråden till Falskt | Trådflytt | |
| 9,75 | 293 | Ringen sluts runt Falskt | Markering | Identiskt med 7,25 |
| 11,00 | 330 | Nästa fråga, tabellen glider in rad för rad, klockan 0:41 | Glid + fem låga klick (sextondelar) + ackordbyte Em9 | |
| 11,50 | 345 | Frågan landar | Träklick, högt | |
| 11,75 till 12,125 | 353 till 364 | Fyra alternativ landar | Träklick, lågt, x4 | |
| 12,00 | 360 | Klockan 0:42 | Klocktick + ackordbyte Asus4 | Tick på hela sekunder, rim på halva: tick-tack |
| 12,50 | 375 | Sport/Totalt och Totalt/Totalt får mjuk yta | Dab | Mycket svagt |
| 13,00 | 390 | Klockan 0:43. Tråden till Cirka 15 % | Klocktick + trådflytt + A(add9) | Dominanten spänner mot lyftet |
| 13,25 | 398 | Ringen sluts runt Cirka 15 % | Markering | |
| 14,00 | 420 | Lyftet: tråden löper längs överkanten, resultatet byts in | Tråden löper + bas D2 + filtkick, paden en oktav upp, filtret öppnar, Dmaj7 | Höjning, ingen drop |
| 14,25 till 15,25 | 428 till 458 | 12 och 80 räknas upp i åtta steg | Räknare | Avslutas med högt träklick |
| 15,50 | 465 | Tid och Per fråga tonar in | Träklick, högt | |
| 16,00 | 480 | | Ackordbyte Gmaj9, bas G2 | |
| 16,50 | 495 | Vyn scrollar ned till Fråga för fråga | Glid, 500 ms | Filtret följer scrollen nedåt |
| 17,00 | 510 | Raden Fråga 9, Fel landar | Träklick, högt | |
| 17,25 | 518 | Lilla matrisen och sex alternativ landar | Träklick, lågt | Ett klick, det är en bild som landar |
| 17,75 | 533 | Tråden lämnar överkanten och ringar rätt alternativ | Trådflytt + markering | |
| 18,00 | 540 | Regelmeningen tonar in | Ackordbyte Bm7, bas B2 | Text har inget ljud |
| 19,00 | 570 | | Ackordbyte A(add9), bas A2 | |
| 20,00 | 600 | Klipp: Grund, Avancerad, Expert landar (20,0, 20,125, 20,25) | Träklick, lågt, x3 + Dmaj7, bas D2 | |
| 20,75 | 623 | Tråden glider till Avancerad | Trådflytt, 120 ms | |
| 21,50 | 645 | Tråden glider till Expert | Trådflytt | |
| 22,00 | 660 | Hårt klipp till provbladet: 24:59, tio rutor, Lämna in | Allt tystnar utom paden (Em9, filtret ned till 600 Hz) och en bas E2 på ettan | Tomt och spänt |
| 23,00 | 690 | Klockan 24:58 | Klocktick | Ensamt i mixen |
| 24,00 | 720 | Klipp: påståendet och skalan tonar in | Gmaj7, paden öppnar, plock G4 B4, bas G2 mjuk | Varmt, utan kick och rim |
| 24,50 | 735 | Rubriken tonar in | (inget ljud) | |
| 25,00 | 750 | Punkten på steg 4 fylls | Dab, lågt, bas G2 | |
| 25,25 | 758 | Morf: punkterna blir staplarnas start, orange punkt blir överkant (till 26,0) | Glid, 750 ms | Stigande filter 400 Hz till 1,6 kHz |
| 26,00 | 780 | Staplarna börjar växa | Ackordbyte Em9, bas E2 | |
| 26,25 till 26,75 | 788 till 803 | Staplarna stannar en i taget (26,25, 26,375, 26,5, 26,625, 26,75) | Träklick, högt, x5, -30 dB | I stapelordning: kortast först |
| 27,00 | 810 | Bladet blir rent | Glid + ackordbyte A(add9), bas A2 | Dominanten förbereder slutet |
| 27,50 | 825 | Avslutsraden tonar in | (inget ljud) | |
| 28,00 | 840 | Knappen Starta gratis test landar | Knapp: lågt träklick + bas D2 + filtkick + Dmaj9 | Taktens etta, filmens tyngsta slag |
| 28,50 | 855 | Ordmärket jobbcoach.ai tonar in | Träklick, högt, -30 dB | Knappt hörbart |
| 29,00 | 870 | Slutslaget. Bilden står stilla till 30,0 | Slutackord Dmaj9, allt annat släpps | Klingar 0,9 s, portas 29,9. Tystnad 29,9 till 30,0 så loopen börjar rent |

### Musiken takt för takt

| Takt | Tid | Scen | Ackord | Lager och händelser |
|---|---|---|---|---|
| 1 | 0 till 2 | 1 | Dmaj9 | Pad ensam, sväller från tystnad |
| 2 | 2 till 4 | 1 | Dmaj9 | Pad. Plock A4 (2,5), F#4 (3,5). Glid 3,5 |
| 3 | 4 till 6 | 2a | Dmaj7 | Rim börjar. Plock D4 E4 F#4 G4 A4 B4 på åttondelar från 4,5 |
| 4 | 6 till 8 | 2a | Bm7 | Plock C#5 D5. Sex låga klick. Markering 7,25 |
| 5 | 8 till 10 | 2b | Gmaj7 | Plock B4 (8,5), D5 (9,5). Markering 9,75 |
| 6 | 10 till 12 | 2b, 2c | Gmaj7 → Em9 (11,0) | Klipp på slag 3. Fem låga klick. Klocktick 12,0 landar på nästa etta |
| 7 | 12 till 14 | 2c | Asus4 → A(add9) (13,0) | Dominanten spänner. Tick på hela, rim på halva. Markering 13,25 |
| 8 | 14 till 16 | 3 | Dmaj7, hög voicing | Lyftet: bas och filtkick på 1 och 3, paden en oktav upp, filtret till 1,6 kHz. Räknare |
| 9 | 16 till 18 | 3 | Gmaj9 | Bas G2. Glid 16,5. Klick 17,0 och 17,25. Trådflytt + markering 17,75 |
| 10 | 18 till 20 | 3 | Bm7 → A(add9) (19,0) | Bas B2, A2. Rim och kick fortsätter |
| 11 | 20 till 22 | 4 | Dmaj7 | Bas D2. Tre låga klick. Trådflytt 20,75 och 21,5 |
| 12 | 22 till 24 | 4 | Em9 | Hårt klipp. Bara pad (filtret ned) och bas E2 på ettan. Klocktick 23,0 ensamt |
| 13 | 24 till 26 | 5 | Gmaj7 | Paden öppnar. Plock G4 B4. Bas mjuk på 1 och 3. Ingen kick, inget rim. Dab 25,0. Glid 25,25 |
| 14 | 26 till 28 | 5, 6 | Em9 → A(add9) (27,0) | Fem tick när staplarna stannar. Glid 27,0 |
| 15 | 28 till 30 | 6 | Dmaj9 | Knappen på ettan: bas + kick + lågt klick. 28,5 klick. 29,0 slutackord, allt släpps, portas 29,9. Tystnad till 30,0 |

Energikurvan: scen 1 pad ensam, scen 2 plock och rim (rörelse), scen 3 lyftet (bas, kick, paden upp), scen 4 samma tills provet tunnar ut allt, scen 5 varmt och mjukt utan slag, scen 6 två slag och punkt. Målnivå -16 LUFS integrerat, true peak -1 dBTP, för den sociala exporten. Sidans version är ljudlös.

---

## 5. Avvikelser från briefen och ägarens beslut

**Scentider flyttade till rutnätet.** Logiktest 4,0 s (briefen 3,3): pilens åtta hopp behöver tiden och det är affischbilden. Verbalt och numeriskt 3,0 s var (3,3 och 3,4). Nivåer och provläge 20 till 24 (24,5), personlighet 24 till 27, avslut 27 till 30. Textraderna står kvar på briefens tider där det går (avslutsraden 27,5, knappen 28,0, ordmärket 28,5). Vill ägaren ge numeriskt 4,0 s tas sekunden från resultatet (14 till 19), allt annat ligger kvar.

**Tempot** 120 BPM i halvtidskänsla i stället för 100 till 110, av skälen i avsnitt 4.

**Att ta ställning till.**

1. Slutslaget på 29,0 s som klingar till 29,9, eller på 29,5 med kortare klang. Jag föredrar 29,0: bilden står redan stilla och slaget blir en punkt.
2. Ljudknappen på sidan (saas-lead). Storyboarden är skriven så att texten bär allt.
3. Knappen i slutet: Starta gratis test (landningssidans), eller Prova fem frågor om saas-lead vill peka på smakprovet (briefen 7.5).
4. Briefens fynd 7.1 till 7.4 (dimensionsnamnen, Kan ej avgöras, decimalkomma i banken, Träningspaketet och 79 kr på sidan) står kvar och bör vara rättade på sidan när videon publiceras.
5. Provbladets fråga i scen 4 visar en annan matris (cirkel, kvadrat, triangel) än scen 2a, för att provet inte ska se ut som en repris. Byts enkelt till pilarna.

**Acceptans mot briefen, egen koll.** Alla textrader ordagrant, högst sex ord, minst 2,5 s, högst två samtidigt (21,5 till 22,5 och scen 2 med underraden). Uppgifterna ur bankerna, lösbara i stillbild. Klockan i 2c räknar upp, i scen 4 ner, inga andra klockor. Resultattalen bara som gränssnitt. Personlighetsscenen utan tal och utan färgskillnad. Grep på storyboarden: inga tankstreck, inga engelska gränssnittsord, inga belopp, inga leverantörsnamn. Slutbilden har landningssidans knapptext. Ljudlös begriplighet (punkt 8) testas med en person som inte läst briefen när animationen finns.
