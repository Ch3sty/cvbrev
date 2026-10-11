# Granskning av parti 01: matriser "svår plus", verbalt och numeriskt

Datum 2026-10-11. Granskare: testansvarig. Underlag: `docs/qa/svarare-fragor/` (40 PNG, `index.html`, kontrollutdata, läsbarhetsprov), `src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json`, `src/lib/verbalTestV2/kandidater/parti-01.json`, `src/lib/numericalTestV2/kandidater/parti-01.json`, `scripts/lib/matris/{recept-plus,generera,kontroll,kor-generator}.mjs`. Geometrikontrollen finns inte på main, så G1 till G12 är bedömda med ögat; G5-måtten för strålarna (P5) ska mätas när skriptet finns.

Ingenting i det här dokumentet ändrar någon bank. Det är beslut och listor.

---

## 0. Kort sammanfattning

| Del | Godkända | Ändras eller ersätts | Stryks |
|---|---|---|---|
| Matriser P1 (8) | 0 | 8 ersätts av nytt recept P1' | 0 |
| Matriser P2 (8) | 8 | 0 | 0 |
| Matriser P3 (8) | 8 (med p_prior 0,45, se 2.3) | 0 | 0 |
| Matriser P4 (8) | 4 | 4 ersätts med nya löpnummer | 0 |
| Matriser P5 (8) | 8 | 0 | 0 |
| **Matriser totalt (40)** | **28** | **12** | 0 |
| Verbalt (8 texter, 32 påståenden) | 7 texter | 1 text (va-07, påstående 3) plus ordval i två förklaringar | 0 |
| Numeriskt (8 underlag, 32 frågor) | 5 tabeller, 2 stapeldiagram med villkor | 1 linjediagram (na-04) väntar på renderaren | 0 |

Partiet kan gå in i expertnivån efter rättelserna, med två förbehåll: geometrikontrollen ska köras på matriserna när den finns, och befordran kräver den separata beställningen med `EXPERT_PLUS` och `BANK_VERSION = 3` (beställningen 1.3, noten om befordran).

Två fynd väger tyngre än partiet självt och står först.

---

## 1. Två fynd som ändrar bilden

### 1.1 Min beställning hade tre fel, och Opus avvikelser är rätt

1. **P1 som jag beställde den är omöjlig.** Två ortogonala latinska kvadrater av ordning 3 bildar tillsammans med raderna och kolumnerna de fyra parallellklasserna i det affina planet med nio punkter. Huvuddiagonalen (0,0), (1,1), (2,2) är en linje i det planet, alltså konstant i exakt en av de två kvadraterna. En grå diagonal blir därmed alltid en funktion av formen eller av symbolen. Kravet "A och B har var för sig minst två olika värden på diagonalen" kan inte uppfyllas. Opus gjorde om P1 till form i latinsk kvadrat, symbol i schackmönster och grå diagonal, vilket är det närmaste som går. Men den varianten har en egen svaghet (2.1).
2. **Plus-kravet på tre regler kan P4 och P5 aldrig nå** med min egen räkning (överlagring plus vridning är två). Att `plusKrav` släpper igenom `overlagring-vriden` som eget fall är den enda rimliga läsningen. Banddefinitionen skrivs om: minst tre regler, eller överlagring med vridning.
3. **Dubblettnyckeln (mekanism, A, B upp till permutation) är för hård.** Det finns bara två latinska kvadrater av ordning 3 upp till omdöpning av värdena (vänster- och högerförskjutning). Med en schackfas i två lägen ger det högst fyra olika nycklar per mekanism, aldrig åtta. Den mjuka nyckeln (mönstret per dimension plus värdemängden) är rätt. Tillägg: inom en mekanism ska minst två olika strukturnycklar förekomma (förskjutning, schackfas, spetsens läge), annars varieras bara startläget. P1 i partiet har åtta frågor med exakt samma struktur, P3 likaså; P2 har fem vänster och tre höger.

### 1.2 Bankens frågor slutar där de börjar: facit är övre vänstra rutan i 159 av 252 valbara frågor

Det här är data, räknat på de sex skarpa bankerna (pensionerade undantagna), inte en gissning.

| Nivå | Valbara | Facit identiskt med rutan uppe till vänster | Andel |
|---|---|---|---|
| Grund | 89 | 60 | 67 % |
| Avancerad | 80 | 45 | 56 % |
| Expert | 83 | 54 | 65 % |
| Totalt | 252 | 159 | 63 % |

Orsaken är strukturell. Alla rörelser i läsordning (vridning, mönsterrotation, vandring, två rörelser, rotation med byte, antal som ändras) går i steg om 45 grader eller i perioder som delar 8. Efter åtta steg är figuren tillbaka där den började, och ruta 9 är ruta 1. Oberoendeflaggorna i 1.3 är samma sak sedd från ett annat håll: en andra sekvens med period 2 eller 4 följer med på köpet.

Per familj: monsterrotation 43 av 43, vridning 23 av 23, vandring 21 av 21, två rörelser 21 av 21, rotation med byte 20 av 20, antal som ändras 13 av 14 har facit lika med rutan uppe till vänster. Latin-familjerna har facit lika med någon annan synlig ruta (det är ofrånkomligt i en 3×3 med tre värden). Överlagring, spegling och latin-flera är de enda familjerna utan kopior.

Det är inte en avslöjande "tell" i den enkla meningen att facit skulle vara det enda alternativet som finns i rutnätet: i alla 198 frågor med kopia finns minst en distraktor som också är en kopia av en synlig ruta. Men att svaret är just rutan uppe till vänster i två av tre frågor, på alla tre nivåerna, är en genväg som inte kräver att man förstår regeln. På expert är 53 av 83 frågor sådana cykler (mönsterrotation 24, två rörelser 11, rotation med byte 7, vridning 4, vandring 4, antal 3), och 40 av dem har prior 4.

Gissning: få kandidater formulerar genvägen medvetet, men cykeln känns sluten, och det räcker för att expert ska mätas som grund. Det stämmer med medianen 13 till 14 av 15 på alla nivåer och med köparen som tog 14 av 15 på sju minuter. Hypotesen prövas i kalibreringen: rapporten får en strukturflagga `facit_ruta0` per fråga (avsnitt 6), och om p inte skiljer sig mellan flaggade och oflaggade frågor har jag fel.

Partiet "svår plus" har noll kopior i 40 av 40 frågor (distraktorkontrollen, kolumnen kopior). Det är det starkaste argumentet för hela bandet, oavsett hur svåra enskilda mekanismer visar sig vara.

---

## 2. Matriser: 40 frågor

Kontrollkedjan är grön för alla 40 (validate, parallel, facit, distraktor med plus-krav). Alla regeltexter och misstagstexter är svenska, hela meningar, utan tankstreck. Facit är entydigt i alla 40: för P1 till P3 finns bara en tolkning, för P4 och P5 passar exakt ett par (operation, vridning) på de två kompletta raderna eller kolumnerna (räknat separat, alla 16).

Gemensamt för alla kort: familjeetiketten i huvudet lyder "Form och antal, en gång var per rad" (`familjer.json`, latin-flera). Den är fel för P1 till P3, som inte har något antal. Om etiketten visas i genomgången behöver latin-flera ett nytt namn innan plus-frågor går in. Textbeslut, ingen kodändring här.

### 2.1 P1, form i latinsk kvadrat, symbol i schack, grå diagonal: 0 av 8 godkända, alla ersätts

Facit är rätt och entydigt i alla åtta, distraktorerna bryter exakt en regel var i tre av fem, grafiken är ren (G1, G2, G5, G10 med ögat). Men konstruktionen bär en genväg: ett schackmönster i läsordning är konstant på huvuddiagonalen (rutorna 0, 4 och 8 är alla jämna). I alla åtta frågorna har de två synliga grå rutorna samma symbol som facit. Den som ser "diagonalen är grå med plus" har symbol och fyllning utan att läsa schackmönstret. Kvar är formen, en latinsk kvadrat med tre värden. Det är dagens expertnivå, inte plus. Oberoendekontrollen släpper igenom det (3 kombinationer mot 2 och 2) eftersom kravet är rätt formulerat men för svagt för tvåvärdiga regler: med två tvåvärdiga regler finns högst fyra kombinationer, och facits kombination finns alltid i en synlig ruta.

Dessutom har alla åtta samma struktur (vänsterförskjutning, schackfas med facit i fas med ruta 0, grå diagonal). Det är åtta startlägen, inte åtta regler.

| Id | Beslut |
|---|---|
| v7e-plus-p1-01 till -08 | Stryks och ersätts av receptet P1' med löpnummer 09 till 16 |

**P1' (nytt recept):** cell `stack`. Form följer latinsk kvadrat A, fyllning (ofylld, grå, svart) följer latinsk kvadrat B ortogonal mot A, symbol växlar mellan två symboler i schackmönster. Renderaren stöder svart fyllning med vit symbol (`renderers.v7.tsx` rad 250). Det ger samma styrka som P2 (3 + 3 + 2) med en annan visuell signatur (tre fyllningar i stället för tre symboler). Krav: minst tre av åtta med högerförskjutning i A, schackfasen slumpad, symboler ur `plus, minus, dot, cross` (ring på svart botten är för lik dot). Distraktorerna som i P2.

### 2.2 P2, form och symbol i latinska kvadrater, fyllning i schack: 8 av 8 godkända

Den starkaste latin-mekanismen i partiet: två ortogonala kvadrater (9 kombinationer av form och symbol i alla åtta) plus schack, fyra nära missar av fem, inga kopior, variation i förskjutning (03, 06 och 08 har högerförskjutning). Grafiken är ren; ring och prick skiljer sig tydligt även i grå ruta. Kontrollerat för hand: p2-01 (kvadrat, prick, ofylld = A) och p2-03 (cirkel, prick, grå = A).

| Id | Beslut |
|---|---|
| v7e-plus-p2-01 till -08 | Godkända |

### 2.3 P3, pilens riktning i latinsk kvadrat, längd i schack, spets på diagonalen: 8 av 8 godkända med sänkt prior

Samma diagonalgenväg som P1: i alla åtta har de två synliga pilarna på diagonalen samma längd som facit, så spets och längd följer med diagonalen. Kvar är riktningen (tre värden, latinsk). Vektorn har ingen tredje egenskap med tre värden, så P3 kan inte byggas som 3 + 3 + 2. Jag behåller P3 ändå: pilarna är en egen visuell familj, frågorna är kopiefria, facit entydigt, distraktorerna håller (kort och lång pil skiljer sig tydligt, öppen och fylld spets likaså), och kalibreringen får avgöra. Priorn sätts till 0,45 i stället för 0,30 (nivå 1 + 9 × 0,55 = 5,95, fortfarande expert) så att passgeneratorn inte lovar mer än frågan håller. Fältet `band: "plus"` står kvar; rapportens rad "plus som inte höll" fångar dem om p > 0,55.

Alla åtta har vänsterförskjutning. Vid nästa parti ska P3 ha minst tre med högerförskjutning (kravet i 1.1 punkt 3).

| Id | Beslut |
|---|---|
| v7e-plus-p3-01 till -08 | Godkända, `p_prior` ändras till 0,45 |

### 2.4 P4, sektorhjul med överlagring och vridning: 4 av 8 godkända

Mekanismen är genuint svår: operationen och vridningen måste hittas tillsammans, och ingen enklare regel passar. Sektorhjulet är en referensram, så 135 grader går att läsa. Distraktorerna testar vridningen tre gånger och operationen två gånger. Två brister:

- **over-01 och over-02:** i facitraden är de två mängderna disjunkta (a = {4,6,7}, b = {2,3} respektive a = {0,7}, b = {1,4,5}). Då är "det som finns i bara en" samma sak som "allt", och operationen testas inte i svaret, bara i de andra raderna. Kravet för alla xor-recept: facitlinjens a och b ska ha minst ett gemensamt element. Detsamma för skillnad: a och b ska dela minst ett element (annars är a minus b lika med a). De övriga 14 uppfyller det redan.
- **over-06 och over-08:** facit har en enda sektor. Fyra av sex alternativ är då en ensam sektor i olika lägen, och frågan blir "vilken sektor", inte "vilken regel". Krav: facit har minst två element (sektorhjul och strålar).

over-08 har dessutom två alternativ som distraktorkontrollen kallar "bryter inget" (B och F). Det är inte ett fel i facit (facit är entydigt mot de två kompletta kolumnerna) utan ett rapportfel: kontrollen räknar operation och vridning var för sig mot facitlinjen, och ett alternativ kan satisfiera båda med olika partner. Samma sak i over-15 (C). Kontrollen ska skriva "bryter op eller vrid (dubbel diagnos)" i stället för "bryter inget", och misstagstexten för sådana alternativ ska nämna båda felen. Ingen av de godkända frågorna har problemet i en grad som fäller dem.

| Id | Beslut |
|---|---|
| v7e-plus-over-01 | Ersätts (nytt löpnummer, krav på gemensamt element i facitlinjen) |
| v7e-plus-over-02 | Ersätts (samma) |
| v7e-plus-over-03 | Godkänd |
| v7e-plus-over-04 | Godkänd |
| v7e-plus-over-05 | Godkänd |
| v7e-plus-over-06 | Ersätts (nytt löpnummer, facit minst två sektorer) |
| v7e-plus-over-07 | Godkänd |
| v7e-plus-over-08 | Ersätts (samma) |

### 2.5 P5, streck från mitten med överlagring och vridning: 8 av 8 godkända

Alla åtta har gemensamt element i facitlinjen och minst två streck i facit. Facit entydigt. Vad som är ett eller två streck syns: två motsatta streck läses som en linje genom mittpunkten, vilket är konventionen i den befintliga strålfamiljen. Grafiska förbehåll till geometrikontrollen: strålfigurerna i rutnätet är de minsta i partiet (uppskattningsvis 55 till 60 px på 360, G5 kräver 56), och referensramen är bara mittpunkten (ingen ring), vilket V7:s regel 3 godtar för strålar sedan tidigare.

over-11 F ("ett streck saknas") och over-15 C ("vrider åt fel håll") har dubbel diagnos enligt 2.4; godkända ändå.

| Id | Beslut |
|---|---|
| v7e-plus-over-09 till -16 | Godkända |

### 2.6 Ändringar i generatorn inför omkörningen

1. Nytt recept P1' enligt 2.1, löpnummer 09 till 16. P1 01 till 08 tas bort ur `recept-plus.mjs`.
2. P3: `p_prior: 0.45` i receptet.
3. P4: nya löpnummer för de fyra ersatta (over-17 till over-20 med samma varianttabell: xor kolumn 1, xor kolumn 3, diff-ab kolumn 7, diff-ab rad 5), plus två nya krav i `overlagringVriden`: facitlinjens a och b delar minst ett element; facit har minst två element.
4. Strukturvariation: generatorn felar om alla åtta i en mekanism har samma strukturnyckel.
5. Distraktorkontrollen: "bryter inget" ersätts av "dubbel diagnos: op eller vrid"; misstagstexten för sådana alternativ nämner båda felen.
6. Band-definitionen i beställningen 1.1 skrivs om: minst tre regler, eller överlagring med vridning.
7. Ny kontroll för alla kandidater (inte bara plus): facit får inte vara identiskt med rutan uppe till vänster. Facit identiskt med någon annan synlig ruta tillåts bara när minst två distraktorer också är kopior av synliga rutor.

---

## 3. Verbalt parti 01: 7 av 8 texter godkända

Texterna håller nivån: två ståndpunkter med egna skäl, svensk sakprosa, svenska facktermer (upphandling, remiss, taxa, driftbudget, vårdgaranti). 181 till 202 ord. 11 av 32 påståenden är "går inte att avgöra" (34 procent). Läsbarhetsprovet på Pixel 7-bredd är rent: texten i en ram, påståendena under, tre knappar per påstående.

De två kvantorfacit som Opus bad om:

- **va-01, påstående 3** ("aldrig" mot textens "sällan"): **falskt är rätt.** "Sällan" förutsätter att det ibland sker, så "aldrig" motsägs. Det är den vedertagna läsningen i den här typen av test och den som en rekryterare skulle gå på. Godkänt.
- **va-07, påstående 3** ("alltid" mot textens "kanske"): **"går inte att avgöra" är försvarbart men ligger i tvistezonen.** "Kanske" varken bekräftar eller motsäger "alltid", så facit är logiskt rätt, men många kandidater kommer att välja falskt eftersom "kanske" känns som motsatsen till "alltid", och de kommer att ha en poäng i att texten inte påstår att det någonsin sker. Kvantorpåståenden ska vara antingen tydligt falska (texten ger ett motexempel) eller tydligt oavgörbara (texten säger inget om frekvensen). Byt påstående: "I samtliga kommuner räknas föreningsstödet ut efter antalet medlemmar", facit falskt. Texten säger "vanligast är att", vilket förutsätter andra sätt, och nämner sedan projektstödet. Andelen oavgörbara blir då 10 av 32 (31 procent), inom ramen.

| Id | Beslut | Anteckning |
|---|---|---|
| va-01-hemtjanstens-schema | Godkänd | Påstående 2 är närmare direkt än slutledning (texten säger nästan samma sak), men facit är rätt. |
| va-02-kommunal-upphandling | Godkänd | |
| va-03-distansarbete-kontorsyta | Godkänd, ordval | Påstående 1: "mindre än hälften" bör bli "högst hälften" (texten säger "sällan över hälften", vilket tillåter exakt hälften). |
| va-04-kollektivtrafikens-taxor | Godkänd | |
| va-05-kompetensutveckling-arbetstid | Godkänd | |
| va-06-aterbruk-byggmaterial | Godkänd | |
| va-07-foreningsstod | Ändras | Påstående 3 byts enligt ovan. |
| va-08-vardkoer-remisser | Godkänd | |

Gemensamt: förklaringarna till de oavgörbara påståendena slutar sju gånger med samma formulering ("så sant och falskt går inte att välja"). Variera i minst hälften; genomgången läser det här högt för kandidaten och ska inte låta maskinell. Ingen förklaring är fel i sak.

Nivå: de direkta påståendena är lätta, slutledningarna lagom, kvantorerna och de utanförliggande är det som skiljer. Prior 0,6 är en rimlig gissning för avancerad med tidspress.

---

## 4. Numeriskt parti 01: 5 tabeller godkända, 2 stapeldiagram med villkor, 1 linjediagram väntar

Alla 32 facit är kontrollräknade för hand och stämmer med stegen. Distraktorerna är räknade (fel rad, fel kolumn, steg saknas, fel enhet, fel bas, fel operation) och skiljer sig med minst en visningsenhet. Avrundningen håller sig från halvan. Svensk talform i tabeller och alternativ. Enhetsbyten och oanvända rader finns i alla åtta. Läsbarhetsprovet visar tabellen i egen ram som rullar i sidled; kolumnrubriken klipps utan någon markering av att det finns mer till höger, vilket är en sak för designrundan, inte för partiet.

Två renderarberoenden som inte tillhör partiet men avgör om diagrammen är rättvisa:

- **Stapeldiagrammet** skriver värdet ovanför stapeln som `{d.value}{unit}`, alltså "18.5%" med punkt och utan mellanslag (`BarChart.tsx` rad 143). Alternativen säger "18,5 %". Värdet ska skrivas i svensk form. Liten renderarändring, beställs separat; na-03 och na-07 är godkända under det villkoret.
- **Linjediagrammet** skriver inga värden vid punkterna (`LineChart.tsx` rad 181 till 188), bara en axel. na-04 kräver att kandidaten läser 398, 281, 224 och 373 MWh exakt, vilket inte går mot en axel. na-04 går inte in förrän linjediagrammet skriver värdet vid varje punkt. Underlaget i sig är bra och behålls.

| Id | Beslut | Anteckning |
|---|---|---|
| na-01-kommunbudget | Godkänd | Fråga 3 (jämn fördelning över 12 månader) är enstegsfrågan. |
| na-02-lagersvinn | Godkänd | Bästa underlaget: definitionen av svinn i inledningen gör tre steg naturliga. |
| na-03-personalomsattning | Godkänd med villkor | Svensk talform i stapeletiketterna. IT saknar medelantal med avsikt. |
| na-04-elforbrukning | Ändras (väntar) | Går in när linjediagrammet visar värden. Alternativt görs det om till tabell, men diagramläsning är värd att ha kvar. |
| na-05-biljettintakter | Godkänd | Fråga 1 (tkr delat med tusental resor ger kr) är ett bra enhetsresonemang. Fråga 3: 2,3 mot 2,4 är minsta tillåtna avstånd, godkänt. |
| na-06-byggkostnader | Godkänd | Fråga 3 antar annan takt än prognoskolumnen; frågan säger det uttryckligen. |
| na-07-atervinning | Godkänd med villkor | Som na-03. |
| na-08-sjukfranvaro | Godkänd | Fråga 4 (genomsnittligt antal frånvarande per dag) är rätt tolkad. |

Nivå: två till tre steg med enhetsbyte, i samma anda som SHL Verify och Aon scales. Prior saknas i filen; sätt 0,55 för avancerad tills kalibreringen säger annat.

---

## 5. Ställningstagande till Opus tre avvikelser

1. **P1 omgjord.** Rätt att avvika, min konstruktion var omöjlig (1.1). Men den nya varianten har diagonalgenvägen och ersätts av P1' (2.1).
2. **Mjukare dubblettnyckel, P4 och P5 genom `plusKrav` som eget fall.** Rätt i båda delarna (1.1 punkt 2 och 3). Tillägget om strukturvariation läggs till.
3. **Oberoendekontrollen flaggar 49 frågor i skarpa banken.** Rätt utfall, och flaggorna är bara symtomet. Se avsnitt 6.

---

## 6. Oberoendeflaggorna i skarpa banken: vad de betyder och vad som görs

55 flaggor på 49 frågor. De faller i fem grupper.

| Grupp | Frågor | Vad flaggan betyder |
|---|---|---|
| A. Mönsterrotation (lattice) | v7g-3c-rot-01, -02; v7a-3c-rot-07; v7e-3c-rot-05 | Artefakt. Kvadranterna i ett roterande mönster är en dimension, inte fyra. Kontrollen ska undanta lattice- och tile-rotation (behandla mönstret som en dimension). |
| B. Rotation med byte | v7g-q28; v7g-3c-byte-01 till -05; v7a-3c-byte-01 till -07; v7e-3c-byte-01 till -07 | Andra regeln (spets, längd, mittpunkt) har period 2 eller 4 och följer med vridningen över nio rutor. Enregelsfrågor med tvåregelsprior. |
| C. Två rörelser | v7g-3c-tva-01, -02, -04; v7a-3c-tva-01 till -05; v7e-3c-tva-01 till -07; v7e-b1, -b2, -b6 | De två rörelserna går i takt (G7). Enregelsfrågor. |
| D. Antal som ändras | v7a-3c-antal-01; v7e-3c-antal-01, -05 | Riktningen följer antalet. Enregelsfrågor. |
| E. Latin-flera med fyllning | v7e-3c-lfler-01 till -04 | Tvåregelsfrågor (väntat, beställningen avsnitt 0). |

Alla i grupp A till D är dessutom slutna cykler med facit lika med rutan uppe till vänster (1.2). Det är det som spelar roll för nivåindelningen, inte flaggan i sig.

**Vad det betyder för nivåindelningen i dag:** expert består till två tredjedelar av frågor som en kandidat kan lösa utan att hitta regeln. De 40 frågorna med prior 4 i expert 3c antar 40 procent rätt; strukturen säger att de flesta av dem mäts som grund. Avancerad har samma problem i mindre grad (56 procent). Det förklarar bättre än något annat varför nivåerna inte skiljer sig åt i datan.

**Vad som görs, i ordning:**

1. **Nu: ingenting flyttas, ingenting pensioneras.** Beslut 15.6 står (priorer sätts inte om för hand), bankerna är frysta för bank_version 2, och flytt sker bara via kalibreringsregeln 3.4. Grupp E lämnas helt.
2. **Kalibreringsrapporten får två strukturflaggor per fråga:** `facit_ruta0` (facit identiskt med rutan uppe till vänster) och `oberoende` (flaggad av kontrollen). Sammanfattningen skriver median-p för flaggade mot oflaggade per nivå. Det är testet av hypotesen i 1.2. Tillägg till beställningens avsnitt 3.3, en kväll för Opus.
3. **Oberoendekontrollen får undantaget för grupp A** så att rapporten inte bullrar.
4. **Planen för bank_version 3 (separat beställning, efter kalibreringens första avläsning eller när minst 40 plus-frågor är godkända, det som kommer först):** expert byggs av plus-bandet, överlagring, spegling och latin-flera; de 53 läsordningscyklerna på expert (grupp B, C, D samt vridning och vandring) får `pensionerad: true` i samma version. De flyttas inte ner för hand: har de kalibrerats med p ≥ 0,56 går de in i grund som `v7g-flytt-...` enligt 3.4, annars försvinner de. Avancerad får samma behandling i en senare version. Grund behåller sina cykler: där är "figuren kommer tillbaka" en rimlig första insikt.
5. **Generatorregel från och med nu** (2.6 punkt 7): facit får inte vara rutan uppe till vänster. För läsordningsfamiljer på avancerad och expert betyder det att rörelsen måste kombineras med en rutnätskopplad regel (som plus gör) eller gå en väg som inte sluter sig efter åtta steg. Rena läsordningsrörelser genereras bara för grund.

Kort lista för ägaren: 49 flaggade frågor, 0 flyttas nu, 0 pensioneras nu, 4 (grupp A) avflaggas i kontrollen, 45 följs i kalibreringen, 53 expertfrågor står på pensionslistan för bank_version 3.

---

## 7. Sammanfattning per mönster och parti

| Parti | Mönster | Godkända | Åtgärd |
|---|---|---|---|
| Matris 01 | P1 | 0 av 8 | Ersätts av P1' (09 till 16) |
| Matris 01 | P2 | 8 av 8 | |
| Matris 01 | P3 | 8 av 8 | p_prior 0,45 |
| Matris 01 | P4 | 4 av 8 | over-01, -02, -06, -08 ersätts (17 till 20) |
| Matris 01 | P5 | 8 av 8 | |
| Verbalt 01 | 8 texter | 7 av 8 | va-07 påstående 3 byts; ordval i va-03; variera förklaringarna |
| Numeriskt 01 | 5 tabeller | 5 av 5 | |
| Numeriskt 01 | 2 stapeldiagram | 2 av 2 | Villkor: svensk talform i stapeletiketterna |
| Numeriskt 01 | 1 linjediagram | 0 av 1 | Väntar på värden vid punkterna |

**Kan partiet gå in i expertnivån efter rättelserna?** Ja för matriserna: 28 godkända nu, 12 ersättare efter omkörning med kraven i 2.6, och geometrikontrollen på alla 40 när skriptet finns. Befordran sker som `EXPERT_PLUS` i `BANK_VERSION = 3`, inte in i befintlig pool. Ja för verbalt efter va-07. Ja för sju av åtta numeriska underlag; na-04 efter renderaren. Det jag inte vet är hur svåra P2 och P3 faktiskt är; P4 och P5 är det band jag tror mest på. Kalibreringen avgör, och rapportens rad "plus som inte höll" är dit jag tittar först.

Nästa beställning till Opus: omkörningen enligt 2.6, flaggorna i 3.3 enligt avsnitt 6 punkt 2 och 3, va-07 och förklaringsvariationen, samt de två små renderarändringarna för diagrammen (separat, eftersom renderarna ägs av en annan worktree).
