# Testvideon: spec för motion och ljud (2026-10-13)

Art-director till ägaren (godkänner), testansvarig (granskar mot briefen), svensk-ux-copywriter (slutkoll på raderna) och den som bygger animation och ljud i kod. Ersätter `video-tester-spec-2026-10-12.md`. Innehållet följer `video-tester-brief-2026-10-13.md` och ägarens beslut 2026-10-13 (rummen får visas, scen 3 och 4 ritas om, testnamnen och dimensionerna följer produkten, provdatum som dagar till provet, musik och ljud syntetiserade i kod). Storyboarden med alla stillbilder: `video-tester-storyboard-2026-10-13.html` (publiceras som artefakt; typsnitten är inbäddade, inga externa resurser).

Master 1920 × 1080, 30,0 s, 30 bilder/s. Säkerhetszon 4:5 (864 × 1080, x 528 till 1392). Musik och ljud renderas offline på samma tidslinje som animationen. Videon fungerar ljudlös: texten bär allt.

**Ändrat sedan 12 oktober, i korthet.** Tokens enligt produkten på `main` (koppar i stället för Trådens orange, Träningens indigovägg i scen 3 och 4). Scen 1 är 3,0 s och scen 3 är 5,0 s; scen 4 har 4,0 s för hemvyn. Scen 2 ritas som passet med tidsraden. Scen 3 är passets resultat och genomgången med Regelpanelen. Scen 4 är hemvyn (nivå, kurva, provdag, dagens pass) och övningsprovet. Nya textrader i scen 3a och 4. Tråden är produktens egna kopparytor i följd. Ljudkartan har två nya ljud (ringen fylls, nivåsteg), räknaren är borta, lyftet sker i två steg. Tempo och tonart oförändrade.

---

## 1. Koncept: Bladet och tråden

Hela filmen utspelar sig på ett enda blad som ligger på bordet: telefonens vy i dubbel skala. Bladet byter aldrig plats, bara innehåll, så ögat vet alltid var det ska titta. En koppartråd följer med från kallelsens markerade dag till den sista knappen och visar i varje scen var du är. Tråden är inte längre en ritad linje bredvid rubriken utan produktens egna kopparytor i tur och ordning: tidsraden som fylls medan uppgiften löser sig, kopparkanten runt rätt svar, dagsringen som fylls när passet är klart, nivåskalans punkt, kurvans linje fram till provdagen, och knapparna.

### Fem grepp som gör rörelsen proffsig

1. **Två konstanter.** Bladet står på samma plats (x 568 till 1352, överkant y 264) i alla scener och tråden är den koppar som bär blicken. Där innehållet fortsätter går bladet ut ur bild nedtill, som på telefonen (scen 2b, 2c, 3, 4); där innehållet är kort har bladet en bottenkant (scen 1, 2a, 5, 6).
2. **Element som blir nästa element.** Kalenderdagens kopparruta sträcks till tidsraden (2,5 till 3,0 s). Kopparkanten på rätt svar blir dagsringen som fylls (13,0 till 13,8). Nivåskalans punkt blir kurvans sista punkt (18,9). Matrisen från scen 2a återkommer liten i genomgången (16,0). De fem punkterna i personlighetsskalan glider ut och blir fem staplar (25,25 till 26,0). Innehållet byts som i produkten: nästa fråga glider upp och ut, resultatet avslöjas i fyra steg, vyn rullar inuti bladet.
3. **En kurva, tre tider.** Allt som flyttar sig använder ease-out `cubic-bezier(0.2, 0.7, 0.2, 1)`: 200 ms för små saker (punkter, kanter, chips), 400 ms för bladets innehåll (nästa fråga), 600 ms för rullningar och morfar. Fades är 300 ms linjära. Där designsystemets avsnitt 8 har en tid gäller den: byte av rum 240 ms, kurvans linje 700 ms från 200, ytan 500 från 500, ny punkt 240 från 900, dagsringen 500 från 300, resultatets fyra steg 260 ms från 120, 420, 720 och 1020, rätt figur i luckan 150 ms. Pilens vridning är filmens enda ease-in-out, 180 ms, för att den ska kännas mekanisk. Ingen fjäder, ingen överskjutning, ingen skalning.
4. **Lugnt på rutnätet.** Varje klipp ligger på slag 1 eller 3 (hela sekunder). Ett nytt element var 1 till 1,5 s, utom när något byggs (matrisen, tabellen, kurvan): då är bygget ett element med inre rytm på åttondelar eller sextondelar. Varje textrad står minst 2,5 s, tonar in och ut på 300 ms, rör sig aldrig i sidled.
5. **Ett hårt klipp.** Till övningsprovet på 22,0 s. Allt annat glider eller tonar. Därför känns provet som ett prov.

---

## 2. Tokens för videon

Produkten som den är på `main`: publikt v2 på landningssidan (`:root:has(.pub-sida)` i `globals.css`, `publikt.css`) och Träningens rum i det inloggade (`[data-rum="tran"]`, `docs/designsystem.md` avsnitt 2 och 5). 1 px i produkten är 2 px i videon, så bladet läses som en telefonbred vy i 2x (392 px). Ren koppar bär aldrig text: kopparfärgad text är koppar-ink på papper och koppar-ljus på väggen.

| Roll | Värde | Var i videon |
|---|---|---|
| Bordet (mark) | `#EDE8DF` | Bakgrund i alla bilder |
| Bladet (panel, papper) | `#FFFFFF` | Bladet, radie 24, kant 2 px `#DBD2C4`; papperskortet, det lyfta kortet |
| Insunken | `#E4DED3` | Luckan, tidsradens spår, sökta celler i tabellen, chippen Test, stapelspår |
| Hårlinje (kant) | `#DBD2C4` | Rutnätet i matrisen, radavskiljare, alternativens kant, klockringens spår |
| Kant-stark | `#C4B9A8` | Totalt-linjen i tabellen, skalans linje i scen 5 |
| ink-1 | `#1C1917` | Rubriker, figurer, valt svar (kant), aktuellt segment |
| ink-2 | `#57534E` | Brödtext i tabellen, staplarna i profilen, klockringen |
| ink-3 | `#6B645E` | Metadata, tidsradens tal, luckans ram och frågetecken, bokstäverna A till F |
| Koppar (accent) | `#E07A2F` | Tråden: tidsrad, kopparkant, kopparpunkt, dagsring, nivåskalans punkt, kurvans linje, kalenderdagen, knapparnas toning. Aldrig text |
| Koppar-ink | `#A8491A` | Rätt figur i luckan, bokstaven på rätt svar, eyebrow "Dagens pass" på papper |
| Koppar-djup | `#C4621F` | Knappens mörka ände, nivåskalans fyllning (toning till koppar-ljus) |
| Koppar-text | `#1A1206` | Text på kopparknappen och på kalenderdagen |
| Koppar-mjuk | `#FBE3D0` | Yttre ring när valt alternativ är rätt (används inte i de ritade bilderna, finns för rörelsen) |
| Koppar-ljus | `#F4B98A` | Kopparfärgad text på väggen ("Passet klart", "Nu 5,6", "+0,2"), mätningens punktkant |
| Träningens vägg | `#2B3470` → `#1B2246` (48 %) → `#121737`, 168 grader | Bladets överdel i scen 3 och 4, radie 0 0 28 28 (56 i videon) |
| Vägg-ink / mjuk / svag | `#F5F6FC` / `#AEB4DA` / `#6F78B0` | Text på väggen i tre nivåer, planradens ihåliga märken |
| Vägg-kant, glas | `rgba(255,255,255,.12)`, `.05` | Dagsradens kort, lägesradens spår, rutlinjer i kurvan, avataren |
| Ljus | `#93A0EC` | Siktebandet och "Mål 6,5" |
| Ton / ton-ink | `#DFE3F6` / `#3B4790` | Regelpanelen, besvarade segment i stapeln |

Ingen annan kulör. Inget rött, inget grönt. Toningar bara där produkten har dem: väggen, kopparknappen, nivåskalans fyllning, kurvans yta. Skugga bara där produkten har den: papperskortet med matrisen och det lyfta kortet (`shadow-lyft`).

**Typsnitt.** Schibsted Grotesk (rubriker, tal, display) och Inter (allt annat), de självhostade variabelsnitten i `src/assets/fonts/`. I storyboarden inbäddade som data-URI med bara de vikter som används deklarerade (Inter 400 till 700, Schibsted 500 till 800).

| Roll | Snitt | Storlek i 1920 × 1080 | Position |
|---|---|---|---|
| Rubrikrad | Schibsted Grotesk 800, -0.02em | 48/56 px, ink-1 | Vänsterställd vid bladets kant x 568, första baslinjen y 164 |
| Underrad | Inter 500 | 30 px, ink-3 | x 568, baslinje y 220, direkt under rubriken |
| Avslutsrad | Schibsted Grotesk 800, -0.02em | 48 px, ink-1, centrerad | Inuti bladet |
| Ordmärke | Schibsted Grotesk 700 | 36 px, ink-1, centrerad | `jobbcoach.ai`, utan logotypens platta |
| Väggens rubrik | Schibsted Grotesk 800, -0.025em | 56/62 px (resultatet), 68 px (hemvyn), vägg-ink | `text-h1-liten` och `text-h1` i 2x |
| Tal | Schibsted Grotesk 700, -0.02em, tabulära | 56 px (de tre talen), 44 px (dagsraden), 28 px (klockringen) | Decimalkomma överallt |
| Eyebrow | Inter 600, 0.08em, versaler | 24 px (12 i produkten) | Koppar-ljus på väggen, koppar-ink eller ink-3 på papper |
| Gränssnitt i bladet | Inter 400/500/600 | 22 till 30 px (11 till 15 i produkten) | Topprad 28/24, tidsradens tal 22, tabell 26, text 26, påstående och fråga Schibsted 700 34 till 36, knappar 26 till 30 |
| Kopparknappen (inloggat) | Inter 600 | 30 px, koppar-text, höjd 96, radie 24 | `.knapp-primar`: toning `#E8863B` → koppar → koppar-djup |
| Pub-knappen (scen 6) | Inter 700 | 32 px, koppar-text, höjd 104, pillerform | `.pub-knapp`: koppar → koppar-djup, 2 px ljuskant upptill |

**Mått.** Bladets inneryta x 600 till 1320 (720 bred, innerkant 32 som produktens `px-4`). Tidsraden 8 px som bladets överkant, talen 22 px under. Toppraden 112 px. Matrisen i papperskortet: kort med radie 32, kant 2, innerkant 20, hårlinjer 2 px; celler 112 i scen 2a, 68 i genomgången, 76 i provet; figuren fyller 80 procent av cellen (`FIGUR_LUFT`), luckan hela cellen. Alternativen kvadratiska, samma cellmått, radie 24, mellanrum 16 (12 i genomgången), bokstaven 22 px uppe till vänster, kopparkanten 4 px, kopparpunkten 20 px uppe till höger, nedtonade i 38 procent. Pilen ritas som i `renderers.v7.tsx` med `geometri.json`: skaft 76 till 24 (kort 68 till 32), spets 9, roterad kring 50/50. Pricken i provets uppgift: bana r 26 streckad, mittpunkt r 5, satellit r 6.

---

## 3. Scen för scen

Scengränser på musikens rutnät (se avsnitt 4). Bildruta = sekund × 30.

| Scen | Tid | Bildrutor | Briefen |
|---|---|---|---|
| 1 Kallelsen | 0,0 till 3,0 | 0 till 89 | 0 till 3 |
| 2a Logiktest | 3,0 till 7,0 | 90 till 209 | 3 till 7 |
| 2b Verbalt resonemang | 7,0 till 10,0 | 210 till 299 | 7 till 10 |
| 2c Numeriskt test | 10,0 till 13,0 | 300 till 389 | 10 till 13 |
| 3 Passets resultat och genomgången | 13,0 till 18,0 | 390 till 539 | 13 till 18 |
| 4a Nivån fram till provdagen, dagens pass | 18,0 till 22,0 | 540 till 659 | 18 till 22 |
| 4b Övningsprovet | 22,0 till 24,0 | 660 till 719 | 22 till 24 |
| 5 Personlighetstest | 24,0 till 27,0 | 720 till 809 | 24 till 27 |
| 6 Avslut | 27,0 till 30,0 | 810 till 899 | 27 till 30 |

Textraderna är briefens, ordagrant. Tider nedan.

### Scen 1: Kallelsen (0,0 till 3,0 s)

- **Text.** 0,5 till 3,0 s: `Kallad till ett rekryteringstest?` (två rader, 48 px).
- 0,0 till 0,5: bladet tonar in på bordet, y 264 till 760. Ingen förflyttning.
- 0,5 till 1,1: kalenderraden (Oktober, Mån 26 till Sön 1) glider in från höger, 48 px, ease-out 600 ms.
- 1,0: dagen 30 (Fre) fylls koppar med mörk text (koppar-text), 200 ms. Det är bildens kopparyta.
- 1,5: chippen `Test` i insunken landar under dagen med 8 px glid uppåt, 200 ms. `Kl. 09.00` i ink-3 tonar in samtidigt.
- 2,5 till 3,0: övergång. Bladets innehåll glider upp 40 px och tonar ut (400 ms). Kopparrutan sträcks till en 8 px liggande linje som lägger sig som bladets överkant: tidsraden i scen 2. Rubriken tonar ut 2,5.

### Scen 2a: Logiktest (3,0 till 7,0 s)

- **Text.** 3,0 till 7,0: `Logiktest`. 3,5 till 13,0 (underraden, ligger kvar genom hela scen 2, direkt under rubriken): `Samma format som det riktiga testet`.
- 3,0: tidsraden ligger som bladets överkant (insunken spår, kopparfyllning från vänster) och fylls långsamt mot provets tid: 56 procent vid 6,0. Under raden `0:38` till vänster och `provets tid 1:08` till höger (22 px, ink-3, tabulära). Raden räknar aldrig ner och byter aldrig färg.
- 3,0 till 3,5: papperskortet med rutnätet 3 × 3 (cell 112, centrerat, kortets överkant y 340) ritas med stroke-dashoffset från övre vänstra hörnet. Luckan nere till höger är insjunken med streckad ram (ink-3, `5 4`) och frågetecken från första bildrutan.
- 3,5: pilen föds i ruta 1, 0 grader, lång, fylld spets (ur `v7g-q3-vector-rotation`).
- 3,75, 4,0, 4,25, 4,5, 4,75, 5,0, 5,25: pilen hoppar till nästa ruta (åttondelar). I varje hopp glider den en cell (ease-out 200 ms) och vrider sig 45 grader medurs (ease-in-out 180 ms) och lämnar en kopia kvar: 0, 45, 90 / 135, 180, 225 / 270, 315.
- 5,25 till 5,875: sex svarsalternativ A till F (112 × 112, radie 24, kant hårlinje, bokstaven uppe till vänster) landar ett per sextondel med 12 px glid uppåt, i tre kolumner. Ordning i videon: A 45 lång fylld, B 0 kort fylld, C 180 lång fylld / D 0 lång öppen spets, **E 0 lång fylld (rätt)**, F 315 lång fylld.
- 6,0: svaret. Tidsraden stannar. E får kopparkant (4 px) och kopparpunkt (20 px uppe till höger), bokstaven E i koppar-ink; A, B, C, D, F tonas till 38 procent (150 ms). Samtidigt ritas rätt figur i luckan i koppar-ink på papper (150 ms, produktens `.ratt-fylld`). Inget valt alternativ i den här scenen.
- 6,5 till 7,0: hålls. **Affischbilden** (poster) tas vid 6,5 s, bildruta 195.

### Scen 2b: Verbalt resonemang (7,0 till 10,0 s)

- **Text.** 7,0 till 10,0: `Verbalt resonemang`. Underraden ligger kvar.
- 7,0 till 7,3: matrisen och alternativen glider upp 40 px och tonar ut. Tidsraden börjar om från noll (`0:24` vid 9,5, `provets tid 1:00`). Bladet fortsätter under bildkanten.
- 7,0 till 7,4: texten i sin ram (radie 24, kant hårlinje, rubriken `Sommaranställningar` 32 px Schibsted 600) tonar in rad för rad, fem rader, 80 ms mellan: "Många företag tycker att det är förmånligt att anställa studenter över sommaren. Den ordinarie personalen vill ofta ta ut semester under denna period. [...] Företagen betalar studenterna utifrån en fast skala utan de vanliga rättigheterna, såsom betald semester och sjuklön."
- 7,75: etiketten `PÅSTÅENDE 2 AV 4` och påståendet (36 px Schibsted 700, två rader) landar: "Studenter har samma rätt till betald semester som den ordinarie personalen när de sommarjobbar."
- 8,0, 8,125, 8,25: `Sant`, `Falskt`, `Går inte att avgöra` landar (tre lika breda knappar, höjd 104, radie 24, 26 px 600).
- 8,75: Falskt får kopparkant och kopparpunkt, de två andra tonas till 38 procent. Hålls till 10,0.

### Scen 2c: Numeriskt test (10,0 till 13,0 s)

- **Text.** 10,0 till 13,0: `Numeriskt test`. Underraden till 13,0.
- 10,0: nästa fråga, samma glid som 7,0. Tidsraden börjar om: `0:41` vid 10,0, `0:42` vid 11,0, `0:43` vid 12,0, `provets tid 1:15`. Underlagets rubrik `Försäljningsanalys per produktkategori` (32 px) och `Räknare tillåten` (24 px ink-3, raden under, högerställd) tonar in.
- 10,0 till 10,4: tabellen i sin ram (`Försäljning 2024 per kategori (MSEK)` som rubrik, kolumnrubriker i versaler 22 px, 56 px per rad) glider in rad för rad från vänster (sex rader, 70 ms mellan, 24 px). Decimalkomma. Sista raden Totalt i 600 med en kant-stark-linje ovanför.
- 10,5: etiketten `FRÅGA 4 AV 4` och frågan (34 px Schibsted 700, två rader) landar: "Hur stor andel utgjorde Sport av total årsförsäljning?"
- 10,75 till 11,125: fyra alternativ som rader A till D (höjd 96, radie 24) landar: Cirka 12 %, **Cirka 15 %**, Cirka 18 %, Cirka 22 %. De två nedersta ligger under bildkanten.
- 11,5: cellerna Sport/Totalt (26,0) och Totalt/Totalt (170,0) får mjuk yta (insunken, radie 8), 200 ms. Inte koppar.
- 11,75 till 12,15: vyn glider upp 400 px inuti bladet (ease-out 400 ms) så att alla fyra alternativ står i bild; tidsraden ligger kvar överst, raderna Sport och Totalt med de sökta cellerna står kvar under den. Samma rullning som på telefonen.
- 12,25: Cirka 15 % får kopparkant och kopparpunkt, bokstaven B i koppar-ink, de tre andra tonas till 38 procent. Hålls till 13,0.

### Scen 3: Passets resultat och genomgången (13,0 till 18,0 s)

- **Text.** 13,0 till 15,5: `Rätt, fel och nivå direkt`. 15,5 till 18,0: `Och regeln bakom varje fråga`.
- 13,0: lyftet, steg 1. Bladet byts till resultatet (`PassResultatVy`) och får Träningens indigovägg som överdel (byte av rum 240 ms; väggen 264 till 926 med radie 56 nedtill). Toppraden `Dagens pass sparat` och `9 / 9` i vägg-ink. Underraden tonar ut.
- 13,12 (s1): dagsringen (128 px) och eyebrow `PASSET KLART` i koppar-ljus, rubriken `7 av 9 rätt. Nivån steg till 5,6.` (56/62 px, två rader). Ringen fylls 13,3 till 13,8 (500 ms från 300, designsystemets `fyll`), bocken tonar in sist. Kopparkanten från 12,25 glider in i ringen: tråden.
- 13,42 (s2): nivåskalan (720 bred, viewBox 380 × 56 skalad) och de tre talen. Skalan: spår i vägg-kant, fyllning i kopparens toning till 5,6, tio streck (1, 5, 10 större), ringen "från 5,4" i vägg-mjuk, målet 6,5 som triangel i ljus, din punkt r 13 koppar med väggens kant. Etiketten `Nu 5,6` i koppar-ljus ovanför, axeln `1`, `från 5,4`, `10`. 13,5: punkten glider 5,4 till 5,6 (200 ms ease-out). De tre talen (56 px Schibsted 700): `7 av 9` rätt, `+0,2` nivå, från 5,4 (koppar-ljus), `1 av 9` över provets tid.
- 13,72 (s3): målraden `Mål till provet: nivå 6,5` (28 px 500, vägg-ink).
- 14,02 (s4): det lyfta tempokortet glider upp över väggens kant (-60 px överlapp, radie 32, `shadow-lyft`): eyebrow `TEMPO`, `Fråga 4 tog över provets tid` (36 px Schibsted 700), `Snitt 41 s, provet ger 68. Gå igenom den först.` (28 px ink-2) och nio staplar med provets tid som streckad linje; fråga 4 i ink-3, de andra i ink-2 55 procent.
- 15,5 till 16,0: vyn glider upp (ease-out 500 ms) och genomgången byts in. Inga uppräknade tal någonstans: talen står stilla när de kommer.
- 16,0: genomgången (`GenomgangVy`): toppraden `Genomgången`, `Fråga 4 av 9, Figuren vrider sig`, `1 / 2`. Matrisen från 2a i liten storlek (cell 68) och de sex alternativen (68, mellanrum 12) i samma ordning landar som en bild. Det valda A (45 grader) i bläckkant 4 px, det rätta E i kopparkant med kopparpunkt, de fyra andra i 38 procent. Inget rött.
- 16,25: rätt figur ritas i luckan i koppar-ink (150 ms).
- 16,5: Regelpanelen (ton, radie 28, innerkant 32/24) glider upp 300 ms (produktens rullning till foten): `REGELN` i ton-ink 24 px 600, `Inte den här, 52 s` till höger i ink-3, regeln 36/46 Schibsted 700 i ink-1: "Pilen vrider sig 45 grader medurs för varje ruta."
- 17,0: `DITT MISSTAG` i ink-3 och misstaget 26 px ink-1 tonar in: "Pilen har vridit sig ett steg för långt." Står till 18,0.

### Scen 4a: Nivån fram till provdagen och dagens pass (18,0 till 22,0 s)

- **Text.** 18,0 till 21,5: `Din nivå fram till provdagen`. 21,5 till 24,0: `Och övningsprov mot klockan`.
- 18,0: hemvyn (`Hemvy` ram 1b) byts in på taktens etta. Väggen står kvar från resultatet (samma indigo, inget rumsbyte). Toppraden: lägesraden `Min plan` (fylld i papper, ink-1) / `Alla tester` (vägg-ink) som segmentkontroll 400 × 88 med radie 44, avataren som glasring till höger. Rubriken `14 dagar till provet` (68 px Schibsted 800, vägg-ink) landar 18,0.
- 18,25: dagsraden (glaskort 440 × 120, radie 32): ringen för dagens pass (80 px, kvar: streckad kopparring `3 4`), talet `5,6` (44 px tabulärt) och `din nivå, började på 5,0` (24 px vägg-mjuk).
- 18,0: kurvrubriken `DIN NIVÅ, DAG FÖR DAG` (24 px vägg-mjuk, versaler) och länken `Hela kurvan` (26 px vägg-ink, understruken) tonar in med rubriken.
- 18,2 till 18,9: kurvan (720 bred, viewBox 380 × 170 skalad): rutlinjerna 5, 6, 7 i vägg-kant står; linjen (koppar 2,25 px i produkten, 4,3 i videon) ritas från mätningen 13 okt 5,0 via 5,2 och 5,4 till 5,6 (700 ms, ease-out). Det är tråden.
- 18,5 till 19,0: ytan under linjen (kurvans toning koppar 38 procent till 0) tonar in.
- 18,9 till 19,15: den nya punkten (r 8,5 koppar med väggens kant, lyster r 30) tänds. Mätningens punkt r 10 med koppar-ljus kant, `start` under.
- 19,0: siktebandet (ljus 10 procent, 6 px, streckad linje) med `Mål 6,5` och provlinjen (vägg-mjuk 1,5 px, lodrät vid 30 okt) med `Prov` tonar in. Planraden under kurvan: gjorda dagar fyllda koppar, i dag streckad kopparring, kommande ihåliga i vägg-svag, nivåkoller (20 och 27 okt) tjockare i vägg-mjuk, övningsprovet (28 okt) som ihålig kvadrat, söndagar prickade, provdagen tom. Axeln `16 okt` och `30 okt` (22 px vägg-mjuk).
- 20,0: vyn glider upp 360 px inuti bladet (ease-out 600 ms). Rubriken och dagsraden går ur bild, kurvans nedre del med planraden och axeln står kvar överst. Det lyfta kortet `DAGENS PASS` (eyebrow koppar-ink), `Figuren vrider sig` (44 px Schibsted 700), `Nio uppgifter på din nivå, cirka tio minuter. Vi förklarar varje svar.` (28 px ink-2, två rader) och kopparknappen `Starta dagens pass` (`.knapp-primar`, 96 hög, radie 24) står helt i bild från 20,6. Två kopparytor (kurvans linje och knappen), som produkten ritar det.
- 21,5: andra textraden tonar in medan den första tonar ut. Hålls till 22,0.

### Scen 4b: Övningsprovet (22,0 till 24,0 s)

- 22,0: **hårt klipp**, filmens enda. Hela provbladet står färdigt i första bildrutan (`LogikProvFraga` i `PassShell`): toppraden `Övningsprov`, `Vårt format`, klockringen uppe till höger (96 px, spår i hårlinje, båge i ink-2 som töms medurs, talet `5` i Schibsted 700 28 px); segmentstapeln (18 segment, 10 px höga, 4 px mellan, sjutton i ton-ink och den sista i ink-1) med `uppgift 18` under; matrisen `Pricken vandrar runt cirkeln` ur `v7g-q6-orbital-walk` (cell 76) med luckan; sex alternativ (76, mellanrum 16) där C står i bläckkant som valt, inget facit; foten fast nederst (146 px, kant hårlinje ovanför): länken `Föregående` och kopparknappen `Lämna in`.
- 23,0: minuten byter. Bågen töms ett steg (från 5/25 till 4/25 av varvet) och talet går från 5 till 4, 200 ms. Ingen koppar på klockan (den kommer först de två sista minuterna i produkten), inget blinkar, inget blir rött.
- 22,0 till 24,0: inget annat rör sig. Ingen regel, inget facit under provet.

### Scen 5: Personlighetstest (24,0 till 27,0 s)

- **Text.** 24,5 till 27,0: `Personlighetsprofil. Inga rätta svar.` (två rader).
- 24,0: klipp på ettan. Bladet y 264 till 640 med bottenkant. Eyebrow `PERSONLIGHETSTEST` (ink-3), påståendet ur `g-23` "Jag är noggrann med detaljer." (40 px Schibsted 700) och skalan tonar in 24,0 till 24,4: en linje i kant-stark med fem ringar (r 18, ink-1-kontur 3 px), ändetiketterna `Stämmer inte alls` och `Stämmer perfekt` i ink-3.
- 25,0: punkt 4 fylls koppar, radien 18 till 24 på 160 ms. Inget rätt, inget fel.
- 25,25 till 26,0: morf. De fem ringarna glider till vänster och ner till fem staplars startpunkter (x 930, raderna y 376 till 680), ändetiketterna tonar ut, dimensionsnamnen tonar in i ink-2 (24 px): Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet (produktens `DIMENSION_META`). Kopparpunkten tonar ut i morfen: profilen har ingen koppar. Bladet växer till y 760. Eyebrow `DIN PROFIL`.
- 26,0 till 26,75: staplarna (spår insunken 24 px, fyllning ink-2, radie 12) växer med samma hastighet och stannar en i taget: Känslomässig särbarhet 38 procent på 26,25, Utåtriktning 45 på 26,375, Öppenhet 62 på 26,5, Vänlighet 70 på 26,625, Samvetsgrannhet 78 på 26,75. Inga tal, inga band, samma ton på alla.

### Scen 6: Avslut (27,0 till 30,0 s)

- **Text.** 27,5 till 30,0: `Träna nu. Kom förberedd sen.` 28,0 till 30,0 (knapp): `Starta gratis test`. 28,5 till 30,0 (ordmärke): `jobbcoach.ai`.
- 27,0 till 27,4: bladet blir rent. Innehållet tonar ut, bladet tar sin sluthöjd (y 264 till 880) med bottenkant. Ingen tråd kvar: knappen blir bildens enda koppar.
- 27,5: avslutsraden tonar in, centrerad i bladet (48 px Schibsted 800).
- 28,0: knappen landar på taktens etta, 8 px glid uppåt, 400 × 104, pillerform, koppar till koppar-djup, text koppar-text Inter 700 32 px, 2 px ljuskant upptill (`.pub-knapp`). Samma form och ordalydelse som landningssidans primärknapp.
- 28,5: ordmärket tonar in (36 px Schibsted 700).
- 29,0 till 30,0: bilden står helt stilla. Sista bildrutan (899) är identisk med 29,0 så att loopen börjar rent.

---

## 4. Ljudkartan och musiken

### Tempo, tonart, rutnät

**120 BPM i halvtidskänsla, 4/4, 15 takter om 2,0 s, D-dur.** Oförändrat från 12 oktober. Den hörda pulsen är 60 slag i minuten (bas och filtkick på slag 1 och 3, en gång i sekunden); plock och klick ligger på ett rutnät om 0,5 s (åttondelar) och 0,125 s (sextondelar). Varje klipp i filmen ligger på ett starkt slag (slag 1 eller 3, alltså hela sekunder), tidsradens tal i scen 2c och klockringen i scen 4 tickar exakt på slag. Taktens etta vid 0, 2, 4 ... 28 s.

Nytt: scen 2 börjar på 3,0 (slag 3 i takt 2) och resultatet på 13,0 (slag 3 i takt 7). Lyftet sker därför i två steg: bas och filtkick kommer in på 13,0 som upptakt, paden går upp en oktav och filtret öppnar på ettan 14,0 när de tre talen står. Det låter som en andning in i lyftet, inte som ett missat slag. Hemvyn på 18,0, det hårda klippet 22,0, personligheten 24,0, avslutet 27,0, knappen 28,0 och slutslaget 29,0 ligger kvar som förut.

### Lager (allt syntetiserat)

| Lager | Klang | Nivå | När |
|---|---|---|---|
| Pad | Två avstämda trianglar (±6 cent), lågpass 900 Hz, 600 ms attack, 1,2 s release, fyrklangs-voicing utan grundton i basregistret | -18 dB | Hela filmen. Öppnar till 1,6 kHz och går upp en oktav på 14,0. Stängs ned till 600 Hz på 22,0, öppnar till 1,2 kHz på 24,0 |
| Plock | Triangel, 2 ms attack, 350 ms exponentiell klang, lågpass 2,5 kHz. Nylonsträng eller trä | -14 dB | Melodin. Skalan i 2a, sparsamt i 1, 2b, 5, och slutackordet |
| Bas | Sinus + 10 procent triangel, en oktav under grundtonen | -12 dB | Slag 1 och 3 från 13,0 till 22,0. Bara ettan på 22,0 (E2). Mjukt på 24,0, 25,0, 26,0, 27,0. Tungt på 28,0 och 29,0 |
| Filtkick | Sinus 110 till 50 Hz på 60 ms, 150 ms klang. Ett dovt slag, ingen trumma | -16 dB | Slag 1 och 3 från 13,0 till 22,0. Tyst 22,0 till 28,0. 28,0 och 29,0 |
| Rim | Brusknäpp 15 ms, bandpass 2,4 kHz | -26 dB | Slag 2 och 4 (halva sekunder) från 3,5 till 21,5. Tyst 22,0 till 30,0 |
| Klocktick | Klick 6 ms, bandpass 4 kHz, panorerat lätt åt höger (där klockringen sitter) | -22 dB | 11,0, 12,0 (tidsradens tal), 23,0 (klockringen). 10,0 och 13,0 täcks av klippen |
| Reverb | Kort plåt 1,2 s | -24 dB send | Bara pad och markeringsklang. Allt annat torrt |

### Ljudeffekter (en-shots)

| Namn | Klang | Nivå | Används för |
|---|---|---|---|
| Glid | Lågpassat rosa brus 250 till 750 ms, filtret rör sig (faller vid in-glid, stiger vid ut-glid, rullning och morf) | -28 dB | Rader som glider in, nästa fråga, rullning inuti bladet, morf, bladet blir rent |
| Träklick, lågt | Triangel 60 ms, 400 till 300 Hz, lågpass 3 kHz | -20 dB | Svarsalternativ, knappar, kort som landar, dagsraden: saker som landar tungt |
| Träklick, högt | Triangel 60 ms, 900 till 600 Hz | -20 dB (-30 dB när det står "knappt hörbart") | Chip, påstående, fråga, rubrik på väggen, Regelpanelen, ordmärke |
| Vridning | Bandpassat brus 40 ms som stiger 1,2 till 2,2 kHz | -30 dB | Pilens åtta hopp, lagt ovanpå plockets ton |
| Trådflytt | Brus-zip 150 ms, 300 till 1 200 Hz | -28 dB | Nivåskalans punkt 13,5 |
| Ringen fylls | Samma zip, 500 ms | -26 dB | Dagsringen 13,3 till 13,8 |
| Tråden löper | Samma zip, 700 ms | -26 dB | Kurvans linje 18,2 till 18,9 |
| Markering | Två sinustoner D5 (587 Hz) och A5 (880 Hz), 8 ms attack, 700 ms klang, lågpass mjuk. Mjuk marimba | -18 dB, aldrig mer | Rätt svar markeras: 6,0, 8,75, 12,25, 16,25. Samma ljud alla fyra gånger. Ingen fanfar, inget ackord |
| Nivåsteg | Markeringen en helton upp: E5 (659 Hz) och B5 (988 Hz), samma kuvert | -18 dB | Nivåskalans punkt glider till 5,6 på 13,5. Den enda transponerade markeringen i filmen |
| Dab | Triangel 80 ms, 300 till 200 Hz | -32 dB (-30 på 18,9 och 25,0) | Mjuk yta på celler (11,5), kurvans nya punkt (18,9), punkten på skalan (25,0) |
| Knapp | Lågt träklick samtidigt med bas och filtkick | | 28,0. Ett thock, inget klick |
| Slutackord | Plockat Dmaj9 (D3 A3 C#4 E4 F#4) + bas D2 + filtkick, alla andra lager släpps | -10 dB | 29,0. Klingar 0,9 s av egen kraft, portas hårt 29,9 |

Räknaren från 12 oktober är borta: talen räknas inte upp, resultatet avslöjas i fyra steg som i produkten. Text har inget ljud. Bara gränssnittet låter. Inga felljud, ingen fanfar, ingen konfetti.

### Cue sheet

| Tid (s) | Bildruta | I bild | Ljud eller musikhändelse | Karaktär |
|---|---|---|---|---|
| 0,00 | 0 | Bladet tonar in på bordet | Pad Dmaj9 börjar svälla | Ensam i mixen, 600 ms attack |
| 0,50 | 15 | Kalenderraden glider in från höger | Glid | Filtret faller 1,8 kHz till 400 Hz |
| 1,00 | 30 | Dagen 30 fylls koppar | Träklick, lågt | |
| 1,50 | 45 | Chippen Test landar | Träklick, högt | |
| 2,00 | 60 | Stilla, rubriken står | Plock A4 | Första melodinoten |
| 2,50 | 75 | Innehållet glider ut, kopparrutan sträcks till tidsraden | Glid + plock F#4 | Stigande filter |
| 3,00 | 90 | Klipp till Logiktest, rutnätet ritas, tidsraden börjar fyllas | Ackordbyte Dmaj7 på slag 3, rim börjar 3,5 | |
| 3,50 | 105 | Pilen föds i ruta 1 (0 grader) | Plock D4 + vridning | |
| 3,75 | 113 | Hopp till ruta 2, 45 grader | Plock E4 + vridning | Åttondelar, en ton per hopp |
| 4,00 | 120 | Ruta 3, 90 grader | Plock F#4 + vridning | Taktens etta mitt i skalan |
| 4,25 | 128 | Ruta 4, 135 grader | Plock G4 + vridning | |
| 4,50 | 135 | Ruta 5, 180 grader | Plock A4 + vridning | |
| 4,75 | 143 | Ruta 6, 225 grader | Plock B4 + vridning | |
| 5,00 | 150 | Ruta 7, 270 grader | Plock C#5 + vridning, ackordbyte Bm7 | Ackordet byter under skalans sjunde ton |
| 5,25 | 158 | Ruta 8, 315 grader | Plock D5 + vridning | Skalan landar på oktaven |
| 5,25 till 5,875 | 158 till 176 | Sex alternativ landar, ett per sextondel | Träklick, lågt, x6 | Lika starka, som brickor på ett bord |
| 6,00 | 180 | Svaret: tidsraden stannar, kopparkant på E, rätt figur i luckan | Markering | Taktens etta |
| 7,00 | 210 | Nästa fråga, texten i sin ram rad för rad, tidsraden om | Glid + ackordbyte Gmaj7 | |
| 7,75 | 233 | Påståendet landar | Träklick, högt | |
| 8,00 till 8,25 | 240 till 248 | Sant, Falskt, Går inte att avgöra landar | Träklick, lågt, x3 | Stigande 300, 340, 380 Hz |
| 8,75 | 263 | Falskt får kopparkant | Markering | Identiskt med 6,0 |
| 10,00 | 300 | Nästa fråga, tabellen glider in rad för rad, tidsraden 0:41 | Glid + fem låga klick (sextondelar) + ackordbyte Em9 | |
| 10,50 | 315 | Frågan landar | Träklick, högt | |
| 10,75 till 11,125 | 323 till 334 | Fyra alternativ landar | Träklick, lågt, x4 | |
| 11,00 | 330 | Tidsradens tal 0:42 | Klocktick + ackordbyte Asus4 | Tick på hela sekunder, rim på halva: tick-tack |
| 11,50 | 345 | Sport/Totalt och Totalt/Totalt får mjuk yta | Dab | Mycket svagt |
| 11,75 | 353 | Vyn glider upp inuti bladet | Glid, 400 ms | Filtret följer rullningen uppåt |
| 12,00 | 360 | Tidsradens tal 0:43 | Klocktick + A(add9) | Dominanten spänner mot lyftet |
| 12,25 | 368 | Cirka 15 % får kopparkant | Markering | |
| 13,00 | 390 | Lyftet steg 1: resultatet byts in, väggen kommer | Bas D2 + filtkick in på slag 3, Dmaj7 | Upptakt till ettan |
| 13,30 | 399 | Dagsringen fylls (till 13,8) | Ringen fylls | Zip 500 ms |
| 13,50 | 405 | Nivåskalans punkt glider 5,4 till 5,6, +0,2 | Trådflytt + nivåsteg | Markeringen en helton upp |
| 14,00 | 420 | Lyftet steg 2: de tre talen och målraden står | Paden en oktav upp, filtret öppnar, Dmaj7 hög voicing + högt klick | Höjning, ingen drop |
| 14,50 | 435 | Tempokortet glider upp över väggens kant | Träklick, lågt | |
| 15,50 | 465 | Vyn glider upp till genomgången | Glid, 500 ms | |
| 16,00 | 480 | Genomgången: lilla matrisen och sex alternativ landar | Träklick, lågt + ackordbyte Bm7, bas B2 | Ett klick, det är en bild som landar |
| 16,25 | 488 | Rätt figur ritas i luckan i koppar-ink | Markering | |
| 16,50 | 495 | Regelpanelen glider upp | Glid 300 ms + träklick, högt | |
| 17,00 | 510 | Ditt misstag tonar in | (inget ljud) | Text har inget ljud |
| 18,00 | 540 | Hemvyn: rubriken 14 dagar till provet | Ackordbyte Gmaj9, bas G2 + träklick, högt | |
| 18,20 | 546 | Kurvans linje ritas (till 18,9) | Tråden löper | Zip 700 ms, lika lång som linjen |
| 18,25 | 548 | Dagsraden landar | Träklick, lågt | |
| 18,90 | 567 | Den nya punkten tänds | Dab | -30 dB |
| 19,00 | 570 | Provlinjen och Prov tonar in | Träklick, högt | Knappt hörbart, -30 dB |
| 20,00 | 600 | Vyn glider upp, Dagens pass med kopparknappen | Glid 600 ms + träklick, lågt + ackordbyte A(add9), bas A2 | Dominanten pekar framåt |
| 21,50 | 645 | Andra textraden tonar in | (inget ljud) | |
| 22,00 | 660 | Hårt klipp till övningsprovet: klockringen 5, segmentstapeln, Lämna in | Allt tystnar utom paden (Em9, filtret ned till 600 Hz) och en bas E2 på ettan | Tomt och spänt |
| 23,00 | 690 | Minuten byter: ringen töms ett steg, talet 4 | Klocktick | Ensamt i mixen |
| 24,00 | 720 | Klipp: påståendet och skalan tonar in | Gmaj7, paden öppnar, plock G4 B4, bas G2 mjuk | Varmt, utan kick och rim |
| 24,50 | 735 | Rubriken tonar in | (inget ljud) | |
| 25,00 | 750 | Punkten på steg 4 fylls | Dab, bas G2 | |
| 25,25 | 758 | Morf: punkterna blir staplarnas start (till 26,0) | Glid, 750 ms | Stigande filter 400 Hz till 1,6 kHz |
| 26,00 | 780 | Staplarna börjar växa | Ackordbyte Em9, bas E2 | |
| 26,25 till 26,75 | 788 till 803 | Staplarna stannar en i taget | Träklick, högt, x5, -30 dB | I stapelordning: kortast först |
| 27,00 | 810 | Bladet blir rent | Glid + ackordbyte A(add9), bas A2 | Dominanten förbereder slutet |
| 27,50 | 825 | Avslutsraden tonar in | (inget ljud) | |
| 28,00 | 840 | Knappen Starta gratis test landar | Knapp: lågt träklick + bas D2 + filtkick + Dmaj9 | Taktens etta, filmens tyngsta slag |
| 28,50 | 855 | Ordmärket jobbcoach.ai tonar in | Träklick, högt, -30 dB | Knappt hörbart |
| 29,00 | 870 | Slutslaget. Bilden står stilla till 30,0 | Slutackord Dmaj9, allt annat släpps | Klingar 0,9 s, portas 29,9. Tystnad 29,9 till 30,0 så loopen börjar rent |

### Musiken takt för takt

| Takt | Tid | Scen | Ackord | Lager och händelser |
|---|---|---|---|---|
| 1 | 0 till 2 | 1 | Dmaj9 | Pad ensam, sväller från tystnad |
| 2 | 2 till 4 | 1, 2a | Dmaj9 → Dmaj7 (3,0) | Plock A4 (2,0). Glid 2,5 + F#4. Klipp på slag 3. Rim från 3,5. Plock D4 E4 |
| 3 | 4 till 6 | 2a | Dmaj7 → Bm7 (5,0) | Plock F#4 G4 A4 B4 C#5 D5 på åttondelar. Sex låga klick 5,25 till 5,875 |
| 4 | 6 till 8 | 2a, 2b | Bm7 → Gmaj7 (7,0) | Markering 6,0 på ettan. Glid 7,0. Påstående 7,75 |
| 5 | 8 till 10 | 2b | Gmaj7 | Tre låga klick 8,0. Plock B4 (8,5). Markering 8,75. Plock D5 (9,5) |
| 6 | 10 till 12 | 2c | Em9 → Asus4 (11,0) | Glid + fem klick 10,0. Fråga 10,5. Fyra klick. Tick 11,0. Dab 11,5. Glid 11,75 |
| 7 | 12 till 14 | 2c, 3 | A(add9) → Dmaj7 (13,0) | Tick 12,0. Markering 12,25. Lyftet steg 1 på slag 3: bas och kick in. Ringen fylls 13,3. Nivåsteg 13,5 |
| 8 | 14 till 16 | 3 | Dmaj7, hög voicing | Lyftet steg 2 på ettan: paden en oktav upp, filtret till 1,6 kHz. Klick 14,0, 14,5. Glid 15,5 |
| 9 | 16 till 18 | 3 | Bm7 | Bas B2. Klick 16,0. Markering 16,25. Glid + klick 16,5 |
| 10 | 18 till 20 | 4a | Gmaj9 | Bas G2. Klick 18,0 och 18,25. Tråden löper 18,2 till 18,9. Dab 18,9. Klick 19,0 |
| 11 | 20 till 22 | 4a | A(add9) | Bas A2. Glid + klick 20,0. Rim och kick fortsätter till 21,5 |
| 12 | 22 till 24 | 4b | Em9 | Hårt klipp. Bara pad (filtret ned) och bas E2 på ettan. Klocktick 23,0 ensamt |
| 13 | 24 till 26 | 5 | Gmaj7 | Paden öppnar. Plock G4 B4. Bas mjuk på 1 och 3. Ingen kick, inget rim. Dab 25,0. Glid 25,25 |
| 14 | 26 till 28 | 5, 6 | Em9 → A(add9) (27,0) | Fem tick när staplarna stannar. Glid 27,0 |
| 15 | 28 till 30 | 6 | Dmaj9 | Knappen på ettan: bas + kick + lågt klick. 28,5 klick. 29,0 slutackord, allt släpps, portas 29,9. Tystnad till 30,0 |

Energikurvan: scen 1 pad ensam, scen 2 plock och rim (rörelse), scen 3 lyftet i två steg (bas och kick, sedan paden upp), scen 4a samma tills provet tunnar ut allt, scen 5 varmt och mjukt utan slag, scen 6 två slag och punkt. Målnivå -16 LUFS integrerat, true peak -1 dBTP, för den sociala exporten. Sidans version är ljudlös.

---

## 5. Avvikelser från briefen och ägarens beslut

**Scentider.** Kallelsen 3,0 s (var 4,0) och resultatet 5,0 s (var 6,0): sekunderna går till scen 4, där kurvan (linjen 700 ms, ytan, punkten) och det lyfta kortet behöver 4,0 s. Allt från 22,0 s ligger kvar som förut.

**Lyftet i två steg** eftersom resultatet börjar på slag 3 (13,0): bas och filtkick som upptakt, paden en oktav upp på ettan 14,0.

**Samma fråga två gånger.** Pilen som vrider sig visas i scen 2a (rätt svar avslöjat, inget valt) och i genomgången som fråga 4 med ett fel val (A). Samma uppgift för igenkänningens skull; vill ägaren ha två olika byts 2a till "Pricken vandrar runt cirkeln", som nu ligger i provet.

**Två kopparytor i bild** i scen 4a efter rullningen (kurvans linje och knappen) och i scen 2 efter svaret (kopparkant, kopparpunkt och figuren i luckan hör ihop som en markering). Produkten ritar det så.

**Minuten byter på 23,0.** Klockringen uppdateras per minut i produkten; i filmen går den från 5 till 4 efter en sekund så att man ser att den töms. Ringen visar aldrig sekunder.

**Underraden under rubriken** i scen 2 (baslinje 220) i stället för längst ner: bladet går ut ur bild nedtill i 2b och 2c.

**Att ta ställning till.**

1. Slutslaget på 29,0 s som klingar till 29,9, eller på 29,5 med kortare klang. Jag föredrar 29,0.
2. Ljudknappen på sidan (saas-lead). Storyboarden är skriven så att texten bär allt.
3. Textraden i scen 3a: "Rätt, fel och nivå direkt" (mitt förslag) eller "Resultat och nivå direkt". Copywritern avgör.
4. Textraden i scen 4a: "Din nivå fram till provdagen" bär ledet i den enda saken; alternativet är produktens kurvarubrik "Din nivå, dag för dag", som saknar provdagen.
5. Personlighetsprofilen: produktens `BigFiveChart` ritar staplarna i en orange till röd toning med gula band och tal, utanför designsystemet. Videon följer briefen (samma ton, inga tal, inga band). Resultatsidan bör ritas om på Rummens linje innan videon publiceras (briefen 7.6).
6. Briefens fynd 7.1 till 7.3 (dimensionsnamnen, "Kan ej avgöras" i den gamla testvyn, decimalpunkten i banken) kvarstår och bör vara rättade när videon publiceras.

**Acceptans mot briefen, egen koll.** Alla textrader ordagrant, högst sex ord, minst 2,5 s, högst två samtidigt (scen 2 med underraden; 21,5 till 22,0 där raderna byter). Uppgifterna ur bankerna, lösbara i stillbild (den numeriska i bilden före rullningen). Tidsraden i scen 2 fylls och räknar upp, klockringen i scen 4 töms i minuter, inga andra klockor. Resultat- och nivåtalen bara som gränssnitt. Personlighetsscenen utan tal och utan färgskillnad. Nivån, kurvan, provdatum och dagens pass som produkten ritar dem. Grep på storyboarden: inga tankstreck, inga engelska gränssnittsord, inga belopp, inga leverantörsnamn, inga paketnamn. Slutbilden har landningssidans knapptext. Ljudlös begriplighet testas med en person som inte läst briefen när animationen finns.
