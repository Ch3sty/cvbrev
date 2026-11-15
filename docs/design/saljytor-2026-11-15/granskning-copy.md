# Granskning av säljytorna ur copy- och säljperspektiv, 2026-11-15

Underlag: inventering.md (samma mapp). Allt nedan är kontrollerat mot källfilerna på main be2c78a1. Där inventeringen och koden skiljer sig står koden. Ingen kod är ändrad; det här är beställningen till den som bygger.

Huvudfynd i fem rader:

1. Ägaren har rätt. Ordet "Nivåkollen" står på 23 publika ställen innan läsaren någonsin sett produkten, och ingenstans i reklamen framgår att vi har åtta kognitiva testtyper plus personlighetstest. Vi säljer vår bredaste tillgång med det smalaste ordet.
2. Gratisnivån beskrivs i fyra kodkällor och på minst sex sätt i löptext. Startsidans FAQ (Startsidan.tsx:126) är redan nästan rätt: "grundnivån i varje testtyp och personlighetstestet". Den formuleringen bör bli normen, inte "Nivåkollen och första passet".
3. Tre faktafel: "alla 19 tester" (29), "Ett brev om dagen och en CV-analys var tredje dag" (ExempelCTABand), "samma fyra typer" (paket-copy.ts:257, det finns åtta kognitiva).
4. Regelbrott: "obegränsat" i en betalvägg, tio API-kvotmeddelanden, plans.ts och OG-bilden; mittpunkter i fem publika rader; "Fråga jobbcoachen" med litet j på fem ställen; "Skapa mitt brev" utan "personliga".
5. Stavfelet "Läs klart. gör sedan." skapas av koden: reklam-copy.ts:271 har "Läs klart, gör sedan." och ArtikelReklam.tsx:413 kör `.replace(', ', '. ')` utan att versalisera.

---

## 1. GratisKortet (A1)

Fil: src/components/artiklar/reklam/reklam-copy.ts:253-266. Visas sist i generic-artiklar och på plats 4 i /artiklar. Sidokolumnvarianten (SidoPaketKort 'gratis') visar bara de tre första raderna, så ordningen avgör vad desktopläsaren ser.

### Diagnos av sista raden

"Nivåkollen i testerna med genomgång, och ett första träningspass"

Tre problem. Läsaren vet inte vad Nivåkollen är. "Ett första träningspass" låter som en enda omgång, alltså mindre än det vi ger (grundnivån i varje testtyp, varje dag). Och raden står sist, trots att ägarens regel sedan 2026-10-12 (plans.ts:88-90) är att testerna står först där verktyg räknas upp. Kortet säljer alltså det bredaste vi har med det minsta ordet, på sämsta platsen.

### Förslag A (rekommenderas): fem rader, testerna först

Eyebrow: "Utan att betala" (behåll)
Rubrik: "Vill du prova innan du läser vidare?" (behåll, ägaren gillar kortet)

Rader:
1. "Grundnivån i alla åtta testtyperna och personlighetstestet, med förklaring efter varje fråga"
2. "Tre CV-mallar och en nedladdning"
3. "En CV-analys med poängen och det tyngsta fyndet"
4. "Ett personligt brev var sjunde dag, att läsa på skärmen"
5. "Tre matchade jobb och tio frågor till Jobbcoachen"

Knapp: "Skapa konto gratis" (behåll). Länk: "Se vad som ingår i Premium" (behåll).

Varför det fungerar: rad 1 säger bredden (åtta typer), djupet (förklaring efter varje fråga) och att personlighetstestet ingår, utan ett enda internt ord. Sidokolumnen får tester, mallar och analys, de tre starkaste.

Sanningskontroll: grundnivån i varje testtyp är gratis med konto (en slutförd per typ och dygn, API-rutternas QUOTA_MESSAGE och inventering C), genomgången är alltid öppen (hem-copy.ts:119, pass-copy.ts:437), personlighetstestet med 50 påståenden är gratis (priser/page.tsx:157). Åtta kognitiva typer verifierade i verktyg/rekryteringstester/page.tsx TESTTYPER.

Teknisk anmärkning till bygget: talet åtta ska inte hårdkodas. Lägg ett `ANTAL_TESTTYPER` i src/components/publikt/testtal (där TESTTAL redan bor) och läs det med `Ord()` som kortet redan gör för mallar och jobb.

### Förslag B: sex rader, personlighetstestet på egen rad

Om kortet tål sex rader (kontrollera på 360 px) ger två testrader mer sälj:
1. "Grundnivån i alla åtta testtyperna, från matrislogik till talserier, med förklaring efter varje fråga"
2. "Personlighetstestet med 50 påståenden, och hur en rekryterare läser profilen"
3 till 6 som i A.

"Hur en rekryterare läser profilen" är gratis enligt personlighetsprov-copy.ts:43 och hem-copy.ts:293.

### Rubriken, om ägaren vill vässa den

Nuvarande rubrik frågar utan att säga vad. Alternativ som säger det: "Det mesta här kan du prova utan att betala". Inte nödvändigt; rubriken är inte problemet.

---

## 2. Kanonisk formulering för gratisnivån

En källa i koden, flera läsare. Förslag: en ny modul `src/lib/plans/gratis-copy.ts` som exporterar listan och meningarna nedan, och som GRATIS_KORT, FREE_HIGHLIGHTS (priser-data.ts:31), STEG3.forslag.*.gratis, KONTO_GRATIS, GRATIS.delar (paket-copy.ts:177) och Startsidans FAQ läser ifrån. Då glider de aldrig isär igen.

### Listan (fem rader, samma ordning överallt)

1. Grundnivån i alla åtta testtyperna och personlighetstestet, med förklaring efter varje fråga
2. Tre CV-mallar och en nedladdning
3. En CV-analys med poängen och det tyngsta fyndet
4. Ett personligt brev var sjunde dag, att läsa på skärmen
5. Tre matchade jobb och tio frågor till Jobbcoachen

### Meningen, lång form (prissidan, FAQ)

"Utan att betala gör du grundnivån i alla åtta testtyperna och personlighetstestet med 50 påståenden, får tre CV-mallar och en nedladdning, en CV-analys med poängen och det tyngsta fyndet, ett personligt brev var sjunde dag att läsa på skärmen, tre matchade jobb och tio frågor till Jobbcoachen. Inget kort behövs."

### Meningen, kort form (startsida, fotnoter, en rad)

"Grundnivån i alla tester, tre CV-mallar, en CV-analys, ett personligt brev var sjunde dag, tre matchade jobb och tio frågor till Jobbcoachen ingår utan att betala."

### Testraden (provkort, testsidan, sidokolumn test)

"Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto."

Ersätter alla varianter av "Nivåkollen och första passet gratis med konto".

### Ordval som gäller överallt

| Internt ord | Publikt (före konto) | Inloggat |
|---|---|---|
| Nivåkollen | "grundnivån" eller "nivåtestet" (TypProvKort säger redan "Gör nivåtestet i talserier") | Behåll namnet, men första gången med förklaring: "Nivåkollen, åtta minuter som visar var du står" |
| första passet, pass varje dag | "ett träningspass om dagen" | "dagens pass" går, rummet lär ut ordet |
| kurvan, hela kurvan | "din utveckling över tid" | Behåll där kurvan syns på skärmen |
| Månaden täcker hela vägen | används inte publikt | "Premium täcker hela vägen" ("Månaden" betyder ingenting för den som inte köpt) |
| brevet | alltid "personliga brevet" | samma |
| obegränsat | "utan tak" | samma |
| ett i veckan | "var sjunde dag" (koden räknar rullande sju dagar, LETTER_WINDOW_DAYS) | samma |

---

## 3. Yta för yta

Status: behåll, ändra, ta bort. "Före" och "efter" är ordagranna.

### A. Publikt

#### A1 GratisKort

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A1-rad5 | reklam-copy.ts:261 | Nivåkollen i testerna med genomgång, och ett första träningspass | Grundnivån i alla åtta testtyperna och personlighetstestet, med förklaring efter varje fråga | Se avsnitt 1. Flyttas till rad 1. | Ändra |
| A1-rad2 | reklam-copy.ts:258 | En CV-analys med poäng och tyngsta fyndet | En CV-analys med poängen och det tyngsta fyndet | Bestämd form, samma lydelse som FREE_HIGHLIGHTS | Ändra |
| A1-ordning | reklam-copy.ts:256-262 | mallar, analys, brev, jobb, tester | tester, mallar, analys, brev, jobb | Ägarens regel: testerna först (plans.ts:88). Sidokolumnen visar tre första. | Ändra |
| A1-rubrik, knapp, länk | reklam-copy.ts:254-265 | | | Fungerar | Behåll |

#### A2 InlineKort (eyebrow "Verktyget")

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-mallar | reklam-copy.ts:74-80 | | | Konkret, gratis före pris | Behåll |
| A2-analys | reklam-copy.ts:81-87 | | | | Behåll |
| A2-brev | reklam-copy.ts:88-94 | | | "personligt brev" skrivet rätt, "utan tak" rätt | Behåll |
| A2-coach | reklam-copy.ts:95-101 | | | | Behåll |
| A2-raknare, lankrad | reklam-copy.ts:134-151 | | | | Behåll |
| A2-INLINE.test text | reklam-copy.ts:69 | Matrislogik, verbalt och numeriskt med facit och förklaring till varje fråga. Fem frågor gratis här. Nivåkollen och första passet gratis med konto. | Åtta testtyper, från matrislogik till talserier, med facit och förklaring till varje fråga. Fem frågor gratis här. Grundnivån i alla typerna gratis med konto. | Räknar tre typer av åtta; internt ord. Texten syns aldrig (testklustret får ProvKort) men paketraden används. | Ändra |
| A2-INLINE.test paketrad | reklam-copy.ts:72 | Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, övningsprov mot klockan och det fördjupade personlighetstestet ingår i Premium, 149 kr i månaden. | "Alla nivåer" är dubbelt när grundnivån är gratis; "det" framför adjektiv i bestämd form i löptext | Ändra |

#### A2 ProvKort och TestKort

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-ProvKort text | reklam-copy.ts:111 | Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning. Fem frågor gratis här, rätt och fel direkt. Nivåkollen och första passet gratis med konto. | Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning. Fem frågor gratis här, rätt och fel direkt. Facit och grundnivån i alla åtta testtyperna gratis med konto. | Internt ord bort; bredden in; "facit" är det kontot faktiskt öppnar (PROVA.bladFot) | Ändra |
| A2-ProvKort knapp, länk, eyebrow, rubrik | reklam-copy.ts:109-119 | | | "Prova fem frågor" och "Se alla tester och nivåer" är bra | Behåll |
| A2-TestKort intervju | reklam-copy.ts:127-131 | | | Ingen jargong, rätt löfte | Behåll |

#### A2 TypProvKort (MDX i fem artiklar)

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-Typ-deduktiv text | TypProvKort.tsx:45 | Börja med Nivåkollen i deduktivt. Den är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt. | Börja med nivåtestet i deduktivt. Det är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt. | Samma ord som de fyra andra typkorten ("nivåtestet") | Ändra |
| A2-Typ-deduktiv knapp | TypProvKort.tsx:46 | Gör Nivåkollen i deduktivt | Gör nivåtestet i deduktivt | Samma | Ändra |
| A2-Typ-deduktiv paketrad | TypProvKort.tsx:49 | Pass varje dag, avancerad och expert och övningsprovet mot klockan ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, ett träningspass om dagen och övningsprovet mot klockan ingår i Premium, 149 kr i månaden. | Dubbelt "och"; "pass" oförklarat | Ändra |
| A2-Typ-talserie paketrad | TypProvKort.tsx:58 | Avancerad och expert, pass varje dag och I-provets övningsprov ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, ett träningspass om dagen och I-provets övningsprov ingår i Premium, 149 kr i månaden. | "pass" oförklarat | Ändra |
| A2-Typ-spatial paketrad | TypProvKort.tsx:67 | (samma som talserie) | (samma som talserie) | | Ändra |
| A2-Typ-ordforrad paketrad | TypProvKort.tsx:76 | (samma som talserie) | (samma som talserie) | | Ändra |
| A2-Typ-iprov paketrad | TypProvKort.tsx:85 | Halva och hela I-provets övningsprov, alla nivåer och pass varje dag ingår i Premium, 149 kr i månaden. | Halva och hela I-provets övningsprov, avancerad och expertnivå och ett träningspass om dagen ingår i Premium, 149 kr i månaden. | | Ändra |
| A2-Typ texter talserie, spatial, ordforrad, iprov | TypProvKort.tsx:54-82 | | | Konkreta tal (femton talserier på tolv minuter), gratis före pris. Bästa korten i inventeringen. | Behåll |

#### A2 SidoPaketKort (desktop)

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-Sido-test gratisrad | reklam-copy.ts:170 | Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i Premium. | Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto. Resten ingår i Premium. | Testraden, avsnitt 2 | Ändra |
| A2-Sido-cv gratisrad | reklam-copy.ts:178 | Tre mallar och ett personligt brev var sjunde dag är gratis. | | Rätt | Behåll |
| A2-Sido text (PLAN.beskrivning) | plans.ts | CV, personliga brev, tester, jobbmatchning och Jobbcoachen | Tester, CV, personliga brev, jobbmatchning och Jobbcoachen | Testerna först (ägarens regel). Lågt prioriterat, raden läses på flera ytor. | Ändra, låg prio |
| A2-Sido rubriker | reklam-copy.ts:166, 174, 182 | | | | Behåll |

#### A2 SlutKort

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-Slut-test rad 1 | reklam-copy.ts:210 | Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar | Alla åtta testtyperna i grund, avancerad och expert, med förklaring till varje svar | Räknar tre av åtta | Ändra |
| A2-Slut-test rad 3 | reklam-copy.ts:212 | Fördjupade personlighetstestet, 120 påståenden | Det fördjupade personlighetstestet, 120 påståenden | Bestämd form | Ändra |
| A2-Slut-test rubrik, rad 2, rad 4 | reklam-copy.ts:208-213 | | | "Alla nivåer. Klockan på." är bra | Behåll |
| A2-Slut-cv | reklam-copy.ts:220-234 | | | | Behåll |
| A2-Slut-allt | reklam-copy.ts:235-249 | | | | Behåll |

#### A2 ListaSlutKort

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-Lista rubrik | reklam-copy.ts:271 och ArtikelReklam.tsx:413 | "Läs klart, gör sedan." som koden gör om till "Läs klart. gör sedan." | Sätt rubriken till "Läs klart. Gör sedan." i reklam-copy.ts och ta bort `.replace(', ', '. ')` i ArtikelReklam.tsx:413 | Stavfelet skapas i komponenten, inte i copyn | Ändra |
| A2-Lista text, länk | reklam-copy.ts:272, ArtikelReklam.tsx:422 | | | | Behåll |

#### A2 Hjälteknapp, StickyMobileCTA, exempelsidor

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-Sticky letter | StickyMobileCTA (letter) | Skapa mitt brev | Skriv mitt personliga brev | Husregel: aldrig bara "brev"; samma verb som inlinekortet | Ändra |
| A2-Sticky exempel brev | exempelsidor | Skapa mitt brev som {yrke} | Skriv personligt brev som {yrke} | Samma, kortare för mobil | Ändra |
| A2-Sticky övriga | | Träna intervjufrågor, Prova fem frågor gratis, Välj en mall, Använd denna mall som {yrke} | | | Behåll |

#### A2 Inbäddade prov

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A2-ArtikelProv text | ArtikelProv.tsx:26-29 | | | Sant och begripligt | Behåll |
| A2-ArtikelProv premiumrad | registrering-copy.ts:342 (KONTO_PANEL.premiumRad) | , 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis. | , 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först grundnivån, gratis. | Internt ord i publik yta | Ändra |
| A2-KontoPanel rad 3 | registrering-copy.ts:336 | Nivåkollen, {n} minuter, räknar in de här svaren | Nivåkollen, {n} minuter: visar var du står och räknar in de här svaren | Första mötet med namnet; förklara det i samma andetag | Ändra |
| A2-Intervjuprov villkor | intervjuprov-copy.ts:82 | Inget kreditkort · Avsluta när du vill | Inget kreditkort. Avsluta när du vill. | Mittpunkt | Ändra |
| A2-Personlighetsprov villkor | personlighetsprov-copy.ts:45 | Inget kreditkort · Avsluta när du vill | Inget kreditkort. Avsluta när du vill. | Mittpunkt | Ändra |
| A2-StartMallval | cv-mallar/start/StartMallval.tsx:116 | Inget kreditkort · Avsluta när du vill | Inget kreditkort. Avsluta när du vill. | Mittpunkt | Ändra |
| A2-StartFlow brev | skapa-brev/start/StartFlow.tsx:317 | Inget kreditkort · Avsluta när du vill | Inget kreditkort. Avsluta när du vill. | Mittpunkt (CVAnalysMini.tsx:137 har redan rätt form) | Ändra |

#### A3 Kampanjraden

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A3-banner BW, CM | kampanj.ts:78, 99 | | | Pris efter namnet, tydlig deadline | Behåll |
| A3-knappar | kampanj.ts:82-84, 103-105 | Köp Premium, 99 kr första månaden | | Verbet Köp, pris efter | Behåll |
| A3-kortText BW | kampanj.ts:81 | Övningsprov med tid och ett pass om dagen fram till provet. Sedan 149 kr i månaden. Till och med söndag. | Övningsprov mot klockan och ett träningspass om dagen fram till provet. Sedan 149 kr i månaden. Till och med söndag. | Oanvänd (D4) men om kortet byggs: "pass" oförklarat, "mot klockan" är husets ord | Ändra om den tas i bruk |
| A3-prisFotnot | kampanj.ts:85, 106 | | | | Behåll |

#### A4 Startsidan

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A4-Tester knappNot | Startsidan.tsx:232 | Nivåkollen, första passet och personlighetstestet gratis | Grundnivån i alla åtta testtyperna och personlighetstestet gratis | Bredden in, internt ord ut | Ändra |
| A4-Tester text | Startsidan.tsx:230 | ... Nivåkollen visar var du står, dagens pass tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. ... | ... Ett nivåtest visar var du står, ett kort pass om dagen tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. ... | Meningen förklarar sig själv men "dagens pass" förutsätter att man känner rummet | Ändra |
| A4-Brev | Startsidan.tsx:43 | Första brevet gratis, sedan ett i veckan | Första personliga brevet gratis, sedan ett var sjunde dag | Husregel "personliga brev"; koden räknar sju rullande dagar | Ändra |
| A4-CV-analys, Jobbmatchning, Coach | Startsidan.tsx:257 m.fl. | Poängen och tyngsta fyndet gratis / Tre träffar gratis / Tio frågor gratis | | | Behåll |
| A4-PremiumBlock | Startsidan.tsx:360 | Alla verktyg utan tak. Mindre än en lunch i månaden, säg upp med ett klick. | | | Behåll |
| A4-FAQ | Startsidan.tsx:126 | Gratisnivån kräver inget kort: grundnivån i varje testtyp och personlighetstestet, 3 CV-mallar och en nedladdning, en CV-analys med poäng och tyngsta fyndet, första personliga brevet och sedan ett i veckan, 3 matchade jobb och 10 frågor till Jobbcoachen. ... | Gratisnivån kräver inget kort: grundnivån i alla åtta testtyperna och personlighetstestet, 3 CV-mallar och en nedladdning, en CV-analys med poängen och det tyngsta fyndet, ett personligt brev var sjunde dag, 3 matchade jobb och 10 frågor till Jobbcoachen. ... | Redan den bästa formuleringen på sajten; blir mall för den kanoniska. Läs från gratis-copy. | Ändra, liten |

#### A5 /priser

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A5-H1, ingress | paket-copy.ts:155-163 | | | | Behåll |
| A5-Gratiskort text | paket-copy.ts:177-195 (GRATIS.delar) och priser/page.tsx:156-160 | Utan att betala får du Nivåkollen i testerna med full genomgång och ett första träningspass samma dag, personlighetstestet med 50 påståenden, 3 CV-mallar ... | Kanoniska meningen, lång form (avsnitt 2), med fetningar på "grundnivån i alla åtta testtyperna", "personlighetstestet", "3 CV-mallar", "en CV-analys", "ett personligt brev", "tre matchade jobb", "tio frågor" | Två kopior av samma text (paket-copy och page.tsx) som redan skiljer sig; en källa | Ändra |
| A5-Talrad | priser/page.tsx:68 | { tal: 1, text: 'Nivåkollen' } | { tal: 8, text: 'testtyper på grundnivå' } | "1 Nivåkollen" säger ingenting; "8 testtyper" är kortets starkaste tal | Ändra |
| A5-Tester gratisRad | priser/page.tsx:200 | Ingår i Premium. Gratis: Nivåkollen med genomgång, ett första träningspass och personlighetstestet med 50 påståenden. | Ingår i Premium. Gratis: grundnivån i alla åtta testtyperna med genomgång, och personlighetstestet med 50 påståenden. | | Ändra |
| A5-Tester sub | paket-copy.ts:256 | Ingår i Premium. Gratis: Nivåkollen med genomgång och ett första träningspass. | Ingår i Premium. Gratis: grundnivån i alla åtta testtyperna, med genomgång. | | Ändra |
| A5-Tester text | paket-copy.ts:257 | ... Här lär du dig mönstren i samma fyra typer som de stora urvalstesten använder: matrislogik, verbalt resonemang, numeriskt och personlighet, i tre nivåer från grund till expert. ... och kurvan visar när du är redo. | ... Här lär du dig mönstren i de typer de stora urvalstesten använder: matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang, talserier, spatial förmåga och ordförråd, i tre nivåer från grund till expert, plus personlighetstestet. ... och din utveckling dag för dag visar när du är redo. | Faktafel "fyra typer"; "kurvan" oförklarad publikt | Ändra |
| A5-Tester steg 1 | paket-copy.ts:259 och page.tsx:209 | Nivåkollen på grundnivå visar var du står per typ. | Grundnivån visar var du står i varje typ. | | Ändra |
| A5-Tester steg 4 | paket-copy.ts:262 | Följ kurvan, session för session. | Följ din utveckling, pass för pass. | "session" är ett engelskt gränssnittsord | Ändra |
| A5-Tabell rad 1 | priser-data.ts:82-85 | label "Nivåkollen och första passet", sub "matrislogik, verbalt, numeriskt", free "En gång, med genomgång", premium "Pass varje dag, utan tak" | label "Grundnivån", sub "alla åtta testtyperna och personlighetstestet", free "Ingår, med genomgång", premium "Ingår, plus ett pass om dagen på din nivå" | Raden efter heter redan "Avancerad och expertnivå", så den här ska bara säga grundnivån | Ändra |
| A5-Tabell rad "Din utveckling" | priser-data.ts:110-113 | sub "alla sessioner i en kurva" | sub "alla pass i en kurva" | "session" | Ändra |
| A5-Tabell övriga rader | priser-data.ts | | | Ord i stället för prickar, bra | Behåll |
| A5-FAQ borja-gratis | priser-data.ts:210 | ... Där ser du hur CV-analysen, de personliga breven och Nivåkollen i testerna fungerar, ... | ... Där ser du hur CV-analysen, de personliga breven och grundnivån i testerna fungerar, ... | | Ändra |
| A5-FAQ övriga | priser-data.ts:199-216 | | | | Behåll |
| A5-GRATIS_RAD | priser-data.ts:41 | 3 mallar, en CV-analys, ett personligt brev och Nivåkollen i testerna ingår utan att betala. | Kanoniska meningen, kort form | | Ändra |
| A5-FREE_HIGHLIGHTS | priser-data.ts:31-38 | sex rader, sista "Nivåkollen i testerna med genomgång, och ett första träningspass" | Kanoniska listan, fem rader | Läs från gratis-copy | Ändra |
| A5-SPARVAL fotnot | paket-copy.ts:350 | Gratis: 3 mallar, en analys, ett personligt brev, Nivåkollen i testerna | Gratis: 3 mallar, en analys, ett personligt brev, grundnivån i testerna | | Ändra |
| A5-PAKET_PUNKTER test_week | paket-copy.ts:564 | Fyra testtyper, grundnivå till expert | Alla testtyper, grundnivå till expert | Osålt paket, syns bara för befintliga kunder, men fel | Ändra, låg prio |

#### A6 Verktygssidor

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A6-Tester hjälte fet | rekryteringstester/page.tsx:393 | Fem frågor gratis här och Nivåkollen gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje pass. | Fem frågor gratis här, grundnivån i alla åtta testtyperna gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje test. | Testraden; "pass" oförklarat i hjälten | Ändra |
| A6-Tester hjälte ingress | page.tsx:392 | Matrislogik, verbalt och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder, och talserier, spatial förmåga och ordförråd inför I-provet. | Matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang i samma format som SHL, Aon och Assessio använder, och talserier, spatial förmåga och ordförråd inför I-provet. | Två typer saknas; Cut-e heter Aon i resten av sidan | Ändra |
| A6-Tester hjälte tal 1 | page.tsx:397 | { tal: 'Nivåkollen', text: 'och första passet gratis med konto' } | { tal: '8 testtyper', text: 'gratis på grundnivå med konto' } | | Ändra |
| A6-Tester ProvaKort punkt 2 | page.tsx:419 | Samma frågebank som i det skarpa testet | Samma typ av frågor som i de skarpa testen | Osant i bokstavlig mening och strider mot vår egen varumärkesrad (hem-copy.ts:420: "tränar i samma format, inte med deras uppgifter"); PROVA.intro säger redan "Samma typ av frågor" | Ändra |
| A6-Tester STEG 1 | page.tsx:49 | Plocka matrislogik, verbalt eller numeriskt. Med ett gratiskonto gör du Nivåkollen med genomgång och ett första träningspass. | Välj bland åtta testtyper, från matrislogik till talserier. Grundnivån i varje typ är gratis med konto, med genomgång efteråt. | Står också i HowTo-schemat; samma text på båda ställen | Ändra |
| A6-Tester H2 testtyper | page.tsx:484 | Åtta testtyper, alla gratis att börja | | Bäst på sidan | Behåll |
| A6-Tester ingress testtyper | page.tsx:486-488 | Med ett gratiskonto gör du grundnivån i varje testtyp, Nivåkollen med full genomgång och ett första träningspass samma dag, och resultatet är ditt. ... | Med ett gratiskonto gör du grundnivån i varje testtyp, med full genomgång efteråt, och resultatet är ditt. ... | Grundnivån täcker redan Nivåkollen och passet; det är tre namn på samma sak | Ändra |
| A6-Tester PremiumBlock | page.tsx:730 | Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Alla nivåer, övningsprov och din historik ingår i Premium. | Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto. Avancerad och expertnivå, övningsprov mot klockan och din utveckling över tid ingår i Premium. | | Ändra |
| A6-Tester schema offers | page.tsx:310 | Fem frågor utan konto, Nivåkollen och ett första träningspass med gratiskonto, utan kortuppgift | Fem frågor utan konto, grundnivån i alla testtyper med gratiskonto, utan kortuppgift | Visas i Google | Ändra |
| A6-Tester schema featureList | page.tsx:313 | ... obegränsat antal försök med Jobbcoach Premium | ... träning utan tak med Jobbcoach Premium | Husregel | Ändra |
| A6-Brev punkt | personligt-brev/page.tsx:221 | Första brevet gratis, sedan ett nytt i veckan | Första personliga brevet gratis, sedan ett var sjunde dag | Husregel | Ändra |
| A6-Brev schema | personligt-brev/page.tsx:107 | Första brevet gratis, sedan ett i veckan. Ingen kortuppgift | Första personliga brevet gratis, sedan ett var sjunde dag. Ingen kortuppgift | | Ändra |
| A6-Brev meta | personligt-brev/layout.tsx:7, 14, 24 | Första brevet gratis | Första personliga brevet gratis | Metadata; kontrollera längd mot SEO-standarden (description 110-158) innan ändring | Ändra, låg prio |
| A6-Övriga PremiumBlock | jobbmatchning, cv-analys, cv-mallar, jobbcoachen, linkedin, bli-upptackt, personlighetstest | | | Ej granskade ordagrant i den här omgången; inventeringen listar dem bara som "respektive text". Gå igenom med samma lista i nästa svep. | Ej bedömd |

#### A7 Övrigt publikt

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A7-Funktioner | FunktionerSida.tsx:243-246 | | | | Behåll |
| A7-Kalkylator knapp | KalkylatorSida.tsx:102 | Fråga jobbcoachen | Fråga Jobbcoachen | Husregel versalt | Ändra |
| A7-Räkna ut knapp | rakna-ut/page.tsx:272 | Fråga jobbcoachen | Fråga Jobbcoachen | Samma | Ändra |
| A7-Kalkylator text | KalkylatorSida.tsx:96-98 | ... 10 meddelanden är gratis på ditt konto. Jobbcoachen, så mycket du vill, ingår i Premium, 149 kr i månaden. | | Eyebrow över säger redan "Ingår i Premium, 149 kr i månaden"; priset står två gånger på kortet. Stryk sista meningens pris: "Jobbcoachen, så mycket du vill, ingår i Premium." | Ändra, liten |
| A7-Exempel CTA text | ExempelCTABand.tsx:40-42 | Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Ett brev om dagen och en CV-analys var tredje dag, helt gratis. | Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Tre CV-mallar, en CV-analys och ett personligt brev var sjunde dag, utan att betala. | Faktafel: brevet är ett per sju dagar och analysen en per konto | Ändra |
| A7-Exempel knapp 2 | ExempelCTABand.tsx:66 | Skapa brev gratis | Skapa personligt brev gratis | Husregel | Ändra |
| A7-Exempel villkorsrad | ExempelCTABand.tsx:70-76 | Ingen kortuppgift · Ingen bindningstid · GDPR, data i EU | Ingen kortuppgift. Ingen bindningstid. Data i EU. | Mittpunkter | Ändra |
| A7-Exempel komponenten | ExempelCTABand.tsx | | | Orange-till-rosa gradient och Lucide-ikoner från den gamla designen; enda säljytan utanför v2-linjen. Bör byggas om som PremiumBlock, inte bara skrivas om. Designfråga till art-director. | Ta bort, ersätt |

#### A8 Registreringen

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| A8-STEG1 tester kort | registrering-copy.ts:47 | Matrislogik, verbalt, numeriskt och personlighet, med förklaring efter varje fråga. | Åtta testtyper och personlighetstestet, med förklaring efter varje fråga. | Räknar fyra av nio | Ändra |
| A8-KONTO_GRATIS rad 1 | registrering-copy.ts:351 | namn "Nivåkollen", text "Var du står i rekryteringstesterna, med genomgång av varje fråga." | namn "Rekryteringstesterna", text "Grundnivån i alla åtta typerna, med genomgång av varje fråga." | Besökaren står på /register utan att ha sett produkten | Ändra |
| A8-KONTO_GRATIS rad 2, 3, premium | registrering-copy.ts:352-355 | | | | Behåll |
| A8-STEG3 tester under | registrering-copy.ts:232 | Nivåkollen och ett grundpass samma dag är gratis med kontot. Passen på din nivå varje dag ingår i Premium. | Grundnivån i alla testtyper är gratis med kontot. Träningspass på din nivå varje dag ingår i Premium. | | Ändra |
| A8-STEG3 tester rad 1 | registrering-copy.ts:235 | Alla nivåer i matrislogik, verbalt och numeriskt. | Alla nivåer i alla åtta testtyperna. | | Ändra |
| A8-STEG3 tester gratis | registrering-copy.ts:240 | Nivåkollen med genomgång av varje fråga / Ett grundpass samma dag som Nivåkollen / Personlighetstestet med 50 påståenden | Grundnivån i alla åtta testtyperna / Genomgång av varje fråga / Personlighetstestet med 50 påståenden | Läses också av STEG3_TESTER.gratis | Ändra |
| A8-STEG3 intervju kortRubrik | registrering-copy.ts:245 | Var förberedd på testdagen | Var förberedd på intervjun | Kopierad rubrik från testvalet | Ändra |
| A8-STEG3_TESTER under | registrering-copy.ts:283 | Du väljer test och provdatum, sedan gör du Nivåkollen. Den tar cirka 8 minuter och visar din nivå, med genomgång av varje fråga. | Du väljer test och provdatum, sedan gör du Nivåkollen: ett kort test på cirka 8 minuter som visar din nivå, med genomgång av varje fråga. | Här introduceras namnet rätt: en gång, med förklaring. Behåll namnet eftersom knappen i rummet heter "Kolla min nivå". | Ändra, liten |
| A8-PROVA, SMAKPROV, STEG2 | registrering-copy.ts | | | Rena, korta, sanna | Behåll |

### B. Inloggat

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| B1-Kampanj, e-postbanner, InstallPrompt | Kampanj.tsx, email-verification-banner.tsx:90, InstallPrompt.tsx:102 | | | | Behåll |
| B2-mall | paywall-copy.ts:257-263 | | | | Behåll |
| B2-testniva body | paywall-copy.ts:269 | Premium ger alla 19 tester, alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga. | Premium ger alla nivåer i alla testtyper, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga. | Faktafel (29 tester). Inget hårdkodat tal alls: det ändras varje gång en typ läggs till. | Ändra |
| B2-testniva rubrik kurva | paywall-copy.ts:193 | Hela kurvan ingår i Premium | Hela din utveckling ingår i Premium | Användaren har sett kurvan, men rubriken säljer bättre med vad den ger | Ändra, låg prio |
| B2-test-tak body | paywall-copy.ts:361 | Premium ger alla nivåer, övningsprov och obegränsat antal försök. | Premium ger alla nivåer, övningsprov och försök utan tak. | Husregel | Ändra |
| B2-GRATISRADER.tester | paywall-copy.ts:96 | Nivåkollen och ett grundpass samma dag ingår | Grundnivån ingår, i alla testtyper | Oanvänd (D4) men ska stämma om den tas i bruk | Ändra |
| B2-analys, nedladdning, cv-export, jobbtraffar, linkedin, bli-upptackt, chatt, historik, kvot, cv-antal, af-rapport, nedgraderad | paywall-copy.ts | | | Kvitterar vad hon fått innan de säljer. Bra betalväggar. | Behåll |
| B2-API kvotmeddelanden | api/deduktiv, logicTestV4, verbalTestV2, figurserier, numericalTestV2, verbalTestV1, logicTestV6, numericalTestExpert, numericalTest, verbalTestExpert, steg2/[kind] (session/route.ts) | Du har redan gjort det här testet i dag. Ny chans i morgon, eller köp Premium för obegränsat. | Du har redan gjort det här testet i dag. Ny chans i morgon, eller köp Premium och träna utan tak. | Husregel, tio filer med samma sträng; flytta till en konstant | Ändra |
| B2-plans.ts osålda highlights | plans.ts:116, 135 | Full CV-analys, obegränsat antal omkörningar / Alla testnivåer, obegränsat antal försök | Full CV-analys, omkörningar utan tak / Alla testnivåer, försök utan tak | Syns på kontosidan för befintliga kunder | Ändra, låg prio |
| B2-introduktion | dashboard/introduktion/page.tsx:47 | Med Premium: obegränsat antal CV | Med Premium: CV utan tak | Husregel | Ändra |
| B2-OG verktyg | verktyg/opengraph-image.tsx:19 | Träna obegränsat | Träna utan tak | Husregel, publik bild | Ändra |
| B3-HEM.tomt.rad | hem-copy.ts:52 | Börja med Nivåkollen. Vet du när provet är, så lägger vi upp planen fram till dagen. | Börja med Nivåkollen, åtta minuter som visar var du står. Vet du när provet är, så lägger vi upp planen fram till dagen. | Första raden i rummet för en ny användare; namnet förklaras en gång | Ändra |
| B3-Grå dagar | hem-copy.ts:63, 187 | Grå dagar ingår i Premium. | | Står intill kurvan där grå dagar syns | Behåll |
| B3-Imorgon provText | pass-copy.ts:421 | ... Månaden täcker hela vägen: passen, nivåkollerna och övningsproven de sista dagarna. | ... Premium täcker hela vägen: passen, nivåkollerna och övningsproven de sista dagarna. | "Månaden" är internt för någon som inte köpt | Ändra |
| B3-Imorgon utanDatumText | pass-copy.ts:423 | Månaden täcker passen varje dag, nya nivåkoller och övningsproven i samma format som ditt test. | Premium täcker passen varje dag, nya nivåkoller och övningsproven i samma format som ditt test. | Samma | Ändra |
| B3-Planens betalvägg rubrik | pass-copy.ts:338 | {n} dagar kvar. Månaden täcker hela vägen. | {n} dagar kvar. Premium täcker hela vägen. | Samma | Ändra |
| B3-Planens betalvägg text | pass-copy.ts:341-343 | | | "samma format som" rätt använt, konkret lista | Behåll |
| B3-TesterHub GRATIS_RAD | TesterHubClient.tsx:105 | Gratis att prova: nivåkollen en gång med genomgång och ett första träningspass samma dag. Resten ingår i Jobbcoach Premium, 149 kr i månaden. | Gratis: grundnivån i alla testtyper med genomgång, och Nivåkollen som visar var du står. Resten ingår i Jobbcoach Premium, 149 kr i månaden. | Katalogen visar alla typer; raden ska säga att de är gratis. Gement "nivåkollen" mot versalt överallt annars. | Ändra |
| B3-Prov utan konto, resultat | | Nästa steg: Nivåkollen / Kolla min nivå, cirka {n} min | | Knappen förklarar namnet | Behåll |
| B3-Övriga rader i rummet | hem-copy.ts, pass-copy.ts | | | Rummets eget språk, lärs in på plats | Behåll |
| B4-KopVy rader | KopVy.tsx:141-143 | Ett pass om dagen nära din nivå, extrapass på det du tappar / Ny nivåkoll varje vecka och hela kurvan / Övningsprov i samma format som ... | | Appen är testrummet; orden är inlärda där | Behåll |
| B4-PremiumGateModal, LockedWorkStylePreview | | | | Hittades inte på sökorden i inventeringen; ej verifierade | Ej bedömd |
| B4-ProvaOcksa | registrering-copy.ts:419-432 | | | "Grundnivån ingår gratis" är rätt ord | Behåll |

### Övrigt som dök upp

| Id | Fil | Före | Efter | Motivering | Status |
|---|---|---|---|---|---|
| X1-Kom igång | useUnusedFeatures.ts:65, komigang.ts:303 | Fråga jobbcoachen | Fråga Jobbcoachen | Husregel, inloggat | Ändra |
| X2-Mejl | email/lifecycle/templates/komigang.ts:210 | Fråga jobbcoachen om lön, intervju eller avtal. | Fråga Jobbcoachen om lön, intervju eller avtal. | Husregel, ämnesrad | Ändra |
| X3-Livscykelmejl | campaign-gratisniva.ts, campaign-kampanj.ts | | | Ej inventerade (D5). Gratisnivåmejlet beskriver sannolikt gratisnivån på ett sjunde sätt; läs mot den kanoniska listan. | Ej bedömd |
| X4-Oanvända komponenter | D3-listan | | | Tolv komponenter med gammal copy som ingen läser. Ta bort ur koden så att ingen råkar återanvända texterna. | Ta bort |

---

## 4. Samlat: regelbrott och fel

Faktafel
- "alla 19 tester" (paywall-copy.ts:269). Rätt är 29, men skriv inget tal.
- "samma fyra typer" (paket-copy.ts:257). Åtta kognitiva plus personlighet.
- "Ett brev om dagen och en CV-analys var tredje dag" (ExempelCTABand.tsx:41). Ett personligt brev per sju dagar, en analys per konto.
- "Samma frågebank som i det skarpa testet" (rekryteringstester/page.tsx:419). Vi tränar i samma format, inte med leverantörernas uppgifter.
- Tre eller fyra testtyper räknas upp där det finns åtta: reklam-copy.ts:69 och :210, registrering-copy.ts:47 och :235, rekryteringstester/page.tsx:49 och :392, priser-data.ts:83, paket-copy.ts:564.

"obegränsat"
- paywall-copy.ts:361, tio API-rutter (session/route.ts), plans.ts:116 och :135, dashboard/introduktion/page.tsx:47, verktyg/opengraph-image.tsx:19, rekryteringstester/page.tsx:313 (schema).

Mittpunkter som separator, publikt
- intervjuprov-copy.ts:82, personlighetsprov-copy.ts:45, StartMallval.tsx:116, StartFlow.tsx:317, ExempelCTABand.tsx:72 och :74. (Rekryterarsidorna och admin har fler, utanför den här granskningen.)

"Jobbcoachen" med litet j
- KalkylatorSida.tsx:102, rakna-ut/page.tsx:272, useUnusedFeatures.ts:65, komigang.ts:303, email komigang.ts:210.

"brev" utan "personliga"
- StickyMobileCTA letter "Skapa mitt brev", exempelsidornas "Skapa mitt brev som {yrke}", Startsidan.tsx:43, personligt-brev/page.tsx:107 och :221, personligt-brev/layout.tsx:7, :14, :24, ExempelCTABand.tsx:66.

Stavfel
- "Läs klart. gör sedan." skapas i ArtikelReklam.tsx:413 av `.replace(', ', '. ')`.

Kopierad rubrik
- registrering-copy.ts:245 "Var förberedd på testdagen" på intervjuvalet.

Grammatik
- "Fördjupade personlighetstestet" i löptext utan "det" (reklam-copy.ts:72). I listrader går det an.
- "En CV-analys med poäng och tyngsta fyndet" (reklam-copy.ts:258): bestämd form, "poängen och det tyngsta fyndet".

---

## 5. Ordning för bygget

1. Skapa gratis-copy.ts med listan och tre meningar ur avsnitt 2, läs den från GRATIS_KORT, FREE_HIGHLIGHTS, GRATIS.delar, STEG3-gratislistorna, KONTO_GRATIS och Startsidans FAQ. Lägg ANTAL_TESTTYPER i testtal.
2. Rätta faktafelen och "obegränsat" (avsnitt 4). Det är sanningskravet, före all stil.
3. Byt "Nivåkollen" mot "grundnivån" eller "nivåtestet" på de publika ytorna i tabellerna A2, A4, A5, A6, A8. Behåll namnet inloggat, med förklaring vid första mötet (hem-copy.ts:52, STEG3_TESTER.under, KONTO_PANEL rad 3).
4. Mittpunkter, versalt Jobbcoachen, "personliga brev", stavfelet.
5. ExempelCTABand byggs om som PremiumBlock (designfråga).
6. Kör reklam-copy.test.ts; den fångar redan "obegränsat" i reklamkorten. Utöka testet med "Nivåkollen" för publika copykällor och med "·" så att regeln håller framåt.
