# Testansvarig: granskning av testinnehållet A1 till A5

Datum: 2026-11-14
Gren: feat/seo-tester-omgang2 (commit 6fa632d4 till 36b920a5)
Granskat mot: gratisniva.ts, tempo.ts (PROVFORMAT), mittTest.ts, ArtikelProv.tsx, provkalla.ts, prova/page.tsx, sessionGate.ts, steg2/iprov.ts, och källorna i källraderna (hämtade i dag).

## Sammanfattning

| Sida | Utlåtande |
|---|---|
| A1 alva-labs-logiktest | GODKÄND |
| A2 numeriskt-test-guide, verbalt-test-guide | GODKÄND |
| A3 logiktest-tips | UNDERKÄND (två rättelser) |
| A4 stanine-testresultat | GODKÄND |
| A5 i-prov | UNDERKÄND (en rättelse) |

Inga leverantörslogotyper och inga formuleringar om samarbete på någon av sidorna. "Samma test" förekommer bara om forskningen (identiska testversioner) och om normgruppen, aldrig om vårt prov. Ingen sida ger eller antyder en stanine från vårt prov, och stanine-sidan säger uttryckligen varför. Det stämmer med produkten: I-provets övningsprov visar antal rätt per deltest och meningen om skalan (steg2/iprov.ts, IprovFlode.tsx).

## A1 alva-labs-logiktest: GODKÄND

- Banden 1 till 3, 4 till 7 och 8 till 10 står ordagrant i Alvas guide om återkoppling. "De allra flesta hamnar mellan 4 och 7" och "mer eller mindre strängt beroende på rollen" står i artikeln "What if I'm not happy". "5 och 6 vanligast", "över 9 eller under 2 ganska ovanligt" och de breda percentilintervallen står i tolkningsguiden. Poängexemplet slutar på 9 som det står.
- Omtestet: 24 månader, samma e-postadress, automatisk delning en gång till, konton slås inte ihop, Alvas support kan inte nollställa, företaget tappar resultatet i alla tjänster och det går inte att ångra, tekniska problem och betydligt ändrade omständigheter, "sällan mer än ett steg". Allt stämmer mot de fyra hjälpartiklarna.
- Tipsen: 30 sekunders varning, aldrig diagonalt, obesvarad räknas som fel, paus med förbehåll. Allt stämmer mot "How Alva's Logic Test Works".
- Löftet "Övningsprovet i Alvas format, 20 uppgifter med två minuter var, ingår i Premium" stämmer med PROVFORMAT.alva (20, 120 s per uppgift, verifierad) och provlageGratis: false.
- Länken `?fran=alva-labs-logiktest&mitt_test=alva` fungerar: slugen klarar SLUG-regexen och `alva` är ett giltigt MittTest. Matrisprovet är fem frågor utan konto.

## A2 numeriskt-test-guide och verbalt-test-guide: GODKÄND

- "Prova fem uppgifter direkt på sidan" stämmer: båda sidorna har `<ArtikelProv>` (numerisk, verbal), provet har fem uppgifter (prov-typer.ts) och rutan säger "fortsätter provet med fyra till".
- Beskrivningarnas exempel finns i brödtexten ("Ett exempel, uträknat steg för steg" och "Ett exempel med alla tre svaren"). Inget löfte om svar utan konto.

## A3 logiktest-tips: UNDERKÄND

Siffrorna stämmer: Hausknecht m.fl. 2007 (50 studier, 107 urval, 134 436 deltagare, 0,26 standardavvikelser, större effekt med vägledning och med identiskt test), Scharfen m.fl. 2018 (122 studier, 153 185 deltagare, vinsten planar ut efter tredje tillfället). 0,26 standardavvikelser motsvarar ungefär ett halvt stanine-steg (ett steg är 0,5 standardavvikelser), så den omräkningen stämmer också. Matrigmas 12 och 40 minuter, Alvas 20 gånger två minuter, Aons minuspoäng och SHL Verify G+ stämmer med PROVFORMAT och med våra leverantörssidor. Två saker måste rättas:

1. **Premium-löftet stämmer inte för alla test i tabellen.** Rad 87: "Övningsprovet med testets antal uppgifter och tider ingår i Premium."
   Det gäller Alva och Matrigma, och för SHL bara figurdelen. Den som väljer Aon för logik får vårt eget format, 18 uppgifter på 25 minuter (EGET_AON i tempo.ts). Aons eget format finns bara under Figurserier. För I-provet är antalet uppgifter och tiderna våra egna, eftersom Plikt- och prövningsverket inte publicerar dem (steg2/iprov.ts).
   **Rättelse:** "Övningsprovet i samma format som ditt test, så långt formatet är känt, ingår i Premium."

2. **Forskningen sträcks för långt i fråga om "samma format".** Rad 50: "Övningseffekten är störst när du övar på samma format som testet, det visar forskningen längre ner."
   Studierna visar att effekten är störst när personen får **samma test** igen, och att den beror på hur lika testversionerna är. De säger inget om att öva på ett annat företags uppgifter i samma format. Meningen lånar alltså effekten av samma test till vår övning i samma format. Det är just den gränsen vi aldrig får sudda ut. Rad 101 säger det rätt ("när testet är detsamma eller nästan detsamma").
   **Rättelse:** "Forskningen längre ner visar att övningseffekten blir större ju mer övningen liknar det riktiga testet. Därför är detta det första du gör."
   Snabbsvaret (rad 44) håller som det står eftersom det skriver "när testet var detsamma". Följ gärna samma linje där.

Anmärkning, behöver inte rättas: länkarna och provrutan (`<ArtikelProv typ="matris" />`) fungerar, och det finns inga löften om gratis utöver smakprovet och kontot.

## A4 stanine-testresultat: GODKÄND

- Stanine-tabellen stämmer med normalfördelningen. Andelarna 4, 7, 12, 17, 20, 17, 12, 7 och 4 procent ger de kumulativa gränserna 4, 11, 23, 40, 60, 77, 89 och 96. "Drygt hälften på 4 till 6" (54 procent) och "var femte från 5 till 6" (20 procent) stämmer.
- C-skalan har 11 steg med medelvärde 5 och standardavvikelse 2. Sten har medelvärde 5,5 och standardavvikelse 2. Båda stämmer, och det gör också "C 6 nästan samma plats som stanine 6".
- Kraven 3, 4, 4 och 6 och citatet stämmer ordagrant mot Polistidningen, med källan "Polismyndigheten och Plikt- och prövningsverket". Riksrevisionens "från en fyra till en trea" 2016 stämmer. Det gör också den uppdaterade normeringsgruppen (Pliktverket) och polisens spärrtid 12 månader och giltighetstid 24 månader (polisen.se). Produktens kravtext (steg2/iprov.ts) säger samma sak.
- Ingen stanine från vårt prov, och meningen "visar därför antal rätt per deltest" stämmer med produkten.
- Länkarna `?typ=iprov&mitt_test=iprov&fran=stanine-testresultat` och `?fran=stanine-testresultat` fungerar. Valet iprov ger provdatumfrågan efter kontot (fragaProvdatumEfterKonto). "Alla sex deltester i provets ordning ingår i Premium" stämmer, eftersom provet kräver test_exam_mode.
- Anmärkning, behöver inte rättas: "Vilken nivå som krävs bestämmer den myndighet som använder provet, inte Plikt- och prövningsverket" (rad 106) står inte ordagrant i någon av källorna. Det följer av Polistidningens "Polismyndigheten har bestämt". Skriv gärna "Enligt Polistidningen har Polismyndigheten bestämt nivån för polisutbildningen" om ni vill ha full täckning.

## A5 i-prov: UNDERKÄND

Ändringarna i snabbsvaret och i FAQ håller. Kustbevakningen är struken, Tullverkets aspirantutbildning är belagd av Polistidningen och "andra myndigheter" är belagt av årsredovisningen. "Prövningens innehåll inte ska komma till allmän kännedom" står på Pliktverkets sida om medicinsk och psykologisk prövning, som finns i källraden. Två övningsuppgifter i var och en av sex kategorier stämmer mot "Testa I-provet". "Smakprovet har en uppgift per deltest i provets ordning och är gratis utan konto" stämmer med ArtikelProv (sex uppgifter, iprov-texten). Avsnittet "Är I-provet ett IQ-test?" stämmer: Riksrevisionen skriver "verbala, spatiala och logiska förmåga" och Polistidningen använder inte ordet IQ. Grundnivån gratis med konto stämmer med sessionGate (grundnivån per testtyp är fri). En sak måste rättas:

1. **Kustbevakningen sägs skriva något som deras sida inte innehåller.** Rad 240: "Kustbevakningen skriver själv att de psykologiska testerna för den som vill bli kustbevakare består av begåvningstest och psykologintervju, och att testerna görs hos Plikt- och prövningsverket."
   Kustbevakningens sida om antagningskrav nämner inte Plikt- och prövningsverket alls. Där står bara att "De psykologiska testerna består av begåvningstest samt psykologintervju". Årsredovisningen nämner Kustbevakningen bara för personal till den nationella bordningsgruppen, inte för kustbevakare i allmänhet. Meningen säger alltså indirekt att den som söker till Kustbevakningen gör I-provet, och det är precis det som commit-meddelandet säger saknar förstahandskälla.
   **Rättelse:** "Kustbevakningen skriver själv att de psykologiska testerna för den som vill bli kustbevakare består av begåvningstest och psykologintervju, men inte vilket begåvningstest det är eller var det görs."

## Utanför A1 till A5, till saas-lead

`MITT_TEST_KORT.iprov.rad` i src/lib/traning/mittTest.ts säger "I-provet. Även mönstring, Tullverket, Kustbevakningen". Det är samma påstående som A5 stryker i artikeln. Föreslagen text: "I-provet. Även mönstring och Tullverket." Det är en produktändring och ingår inte i den här grenen.

## Omgång 2 (2026-11-14, ocommittat i arbetskopian)

Granskat bara rättelserna och de nya länkarna.

| Sida | Utlåtande |
|---|---|
| A3 logiktest-tips | GODKÄND |
| A5 i-prov | GODKÄND |

- **A3 rad 50 och rad 87:** båda rättelserna står ordagrant som föreslaget. Den nya länken "gör provet" (`?fran=logiktest-tips`) fungerar.
- **A3 tabellen:** `mitt_test=alva`, `matrigma`, `shl`, `aon` och `iprov` är giltiga val i mittTest.ts, `fran=logiktest-tips` klarar SLUG-regexen och `typ=iprov` är en giltig provtyp. Valet följer med till kontot via provkalla. Texten "Öva med X som ditt test" lovar formatet för träningen, inte att smakprovet är leverantörens test, och det håller.
- **A5:** Kustbevakningsmeningen är ersatt som föreslaget. Smakprovslänken `?typ=iprov&mitt_test=iprov&fran=i-prov` fungerar, och "en uppgift ur varje deltest, i provets ordning" stämmer med provrutans text och med de sex uppgifterna.
- **Förslag, inget krav:** för Aon kan länken bära `&typ=figurserie`, eftersom Aon scales ix är figurserier och Aons format i produkten ligger under Figurserier. Utan den landar besökaren i matrisprovet, vilket också är rimligt men ligger längre från Aon.
