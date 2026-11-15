# Granskning av säljytorna ur testperspektivet

Testansvarig, 2026-11-15. Underlag: inventering.md i samma mapp, verifierad mot koden på main be2c78a1 (testConfig.ts, gratisniva.ts, tillgang.ts, sessionGate.ts, quotaService.ts, nivakoll/niva.ts, ovningsprov/format.ts, traning/tempo.ts). Inga kodändringar är gjorda. Det här är beslut, inte alternativ. Copywritern finslipar orden, men fakta och ordning nedan ligger fast.

## 0. Vad koden faktiskt ger (verifierat)

Utbudet
- 29 testkonfigurationer i 9 testtyper: 8 kognitiva (logiktest/matris, figurserier, deduktiv slutledning, talserier, spatial förmåga, ordförråd, verbalt resonemang, numeriskt) och personlighet. Varje kognitiv typ har tre nivåer: grund, avancerad, expert.
- Provläge med hård tidsgräns och automatisk inlämning: logik 25 min, verbalt 40 min, numeriskt 40 min (examMinutes). Övningsprov i leverantörens format: Matrigma klassisk (35 uppgifter, 40 min) och adaptiv (12 på 12 min), Alva Logic (20, 40 min, adaptiv), SHL Verify (18 på 25 min), Aon scales ix (figurserier), SHL deduktivt (12 på 18 min), I-provet halvt och helt med sex deltester. Formuleringen är alltid "samma format som", aldrig "samma test".
- Facit och förklaring efter varje fråga på alla nivåer. Genomgång av det man gjort är alltid öppen (genomgangGratis true).

Gratis utan konto
- Fem frågor per typ i artiklarna och på /verktyg/rekryteringstester/prova, I-provet sex uppgifter, personlighet 20 påståenden. I ArtikelProv visas facit först när provet hämtats till ett gratiskonto; på /prova visas rätt och fel direkt.

Gratis med konto
- Grundnivån i varje testtyp (requiresFeature saknas på alla grund-slugar). En slutförd session per typ och dygn (DAILY_LIMIT_TEST_SESSIONS = 1, svensk midnatt). Påbörjade men oavslutade sessioner räknas inte.
- Nivåkollen: den första är gratis per typ, finns för matris, figurserier, deduktivt, verbalt och numeriskt (NIVAKOLL_KINDS + matrislogik-matning). Talserier, spatial och ordförråd har ingen Nivåkoll, där är grundnivåns test nivåtestet.
- Ett grundpass i matrislogik samma dag som Nivåkollen (grundpassVarjeDag false). Från dag 1 kräver passen Premium.
- Personlighetstestet med 50 påståenden.

Premium (tests_above_base, test_daily_pass, test_exam_mode, test_history)
- Avancerad och expert i alla typer, dagens pass varje dag, riktade pass och extrapass, ny Nivåkoll var sjunde dag, hela kurvan, övningsprov mot klockan i leverantörens format, I-provets övningsprov, fördjupade personlighetstestet 120 påståenden. Premium passerar dagskvoten helt (checkDailyTestQuota svarar allowed med tests_above_base), så "utan dagstak" är sant. "Obegränsat" är fortfarande förbjudet ord.

## 1. Hur testerbjudandet ska beskrivas för den som aldrig hört ordet Nivåkollen

Beslut: Nivåkollen nämns inte i reklam före registrering. Det är ett produktnamn på ett steg inne i träningen, inte ett erbjudande. En besökare som läser "Nivåkollen i testerna" förstår varken att vi har tester att öva på, hur många, eller vad hon får. Ägarens spontana läsning är rätt.

Det som säljer, i den här ordningen:
1. Bredden: åtta testtyper, var och en i tre nivåer. Det är det ingen konkurrent på svenska har, och det är det besökaren letar efter när hon landar på en testartikel.
2. Realismen: övningsprov mot klockan i samma format som Matrigma, Alva Logic, SHL Verify, Aon scales och I-provet. Namnen får stå i löptext, aldrig som logotyper och aldrig så att det låter som samarbete.
3. Lärandet: facit och förklaring till varje fråga, inte bara rätt eller fel.
4. Att det är gratis att börja: grundnivån i alla åtta typerna med konto, fem frågor utan.

Ordet publikt för det Nivåkollen gör: "nivåtest" eller "ett test som visar var du ligger". Det ordet funkar för alla åtta typer, även de tre som inte har någon Nivåkoll. Inne i produkten, i registreringens testspår (där nästa steg förklarar den) och i betalväggarna fortsätter Nivåkollen heta Nivåkollen. På /verktyg/rekryteringstester får namnet nämnas en gång, med förklaring i samma mening ("nivåtestet, vi kallar det Nivåkollen"), eftersom den sidan är landningen för SEO-trafiken och leder in i produkten.

Konsekvens för knapptexter: "Gör Nivåkollen i deduktivt" blir "Gör nivåtestet i deduktivt". Landningen heter Nivåkollen, och det är ett kort steg att förstå att nivåtestet och Nivåkollen är samma sak.

## 2. En formulering av gratisdelen i testerna

Kärnfakta som alla ytor bygger på:

"Grundnivån i alla åtta testtyperna, med facit och förklaring till varje fråga, och personlighetstestet med 50 påståenden. Fem frågor direkt, utan konto."

Regler:
- "Alla åtta testtyperna" är kärnan. Det är sant (grund-slugarna är fria) och det är det som säger "vi har en massa tester att öva på".
- Dagsgränsen (en per typ och dygn) nämns inte i reklamen. Den regeln finns redan i reklam-copy.ts och ska gälla. Gränsen visas när den slår till, i test-tak-väggen. Att inte nämna den är ingen lögn, att säga "utan tak" vore det.
- "Ett första träningspass" försvinner ur all publik copy. Det gäller en typ, en dag, och ingen utanför produkten förstår vad ett pass är. Det hör hemma i testrummet och i registreringens testspår.
- Nivåkollen försvinner ur gratisraderna publikt (se avsnitt 1). Inne i produkten säger vi "Nivåkollen en gång, gratis" som nu.
- Personlighetstestet står med där raden får plats, eftersom det är det enda i hela utbudet som är helt utan tak gratis och många testartiklar handlar om det.

Kort form för en punktrad: "Grundnivån i åtta rekryteringstester, med facit och förklaring". Kortaste form för en etikett: "Åtta testtyper, gratis att börja".

## 3. Vad Premium-raden ska säga om tester

Kärnfakta:

"Alla nivåer i alla åtta testtyperna, pass varje dag på din nivå, övningsprov mot klockan i samma format som Matrigma, Alva, SHL, Aon och I-provet, och det fördjupade personlighetstestet med 120 påståenden."

Regler:
- Räkna aldrig tester ("19 tester", "29 tester"). Talet ändras varje gång vi lägger till en nivå och säger inget för besökaren. Räkna typer och nivåer: "åtta testtyper, tre nivåer var".
- Nämn aldrig bara tre typer ("logik, verbalt och numeriskt"). Det var sant i september, nu är det en tredjedel av utbudet.
- Tidsangivelsen "25 till 40 minuter" tas bort ur Premium-raderna. Den täcker bara de tre provlägena i testConfig; Matrigma adaptiv är 12 minuter och SHL deduktivt 18. Säg "på samma tid som ditt test" eller "med automatisk inlämning när tiden är ute". Vill copywritern ha ett tal ska det läsas ur format.ts per yta, inte stå fast.
- "Övningsprov" används bara när vi menar provläget mot klockan. Grundnivån är inte ett övningsprov.
- Leverantörsnamnen får stå i Premium-raden på testytorna (ProvKort, SlutKort test, SidoPaketKort test, /verktyg/rekryteringstester, prissidan). På generiska ytor (GratisKort, startsidans PremiumBlock, ListaSlutKort) räcker "övningsprov i samma format som de stora testleverantörerna".

## 4. Yta för yta, prioriterat efter trafik

Prioritet 1 är testartiklarna (största trafikkällan), prioritet 2 GratisKortet (generic-artiklar och /artiklar), prioritet 3 /verktyg/rekryteringstester, prioritet 4 startsidan och /priser, prioritet 5 registreringen, prioritet 6 inloggat.

### Prioritet 1: testartiklarna (A2)

ProvKort (INLINE_PROVA, test-klustret). ÄNDRA. Rubriken "Vilken figur hör hemma i den tomma rutan?" och expertfrågan behålls, den fungerar. Sista meningen "Nivåkollen och första passet gratis med konto" byts mot "Grundnivån i alla åtta testtyperna gratis med konto". Knappen "Prova fem frågor" behålls. Länken "Se alla tester och nivåer" behålls, den gav kontona enligt analysen 2026-11-08. Paketraden byts från "Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet" till Premium-formuleringen i avsnitt 3 med leverantörsnamn.

INLINE.test (syns aldrig). TA BORT ur koden eller låt den ärva ProvKortets text. Den säger "Matrislogik, verbalt och numeriskt", tre av åtta typer, och ligger och väntar på att någon ska råka använda den.

TypProvKort, fem varianter. BEHÅLL strukturen, den är redan rätt tänkt: typens eget nivåtest först, Premium efteråt.
- deduktiv: "Börja med Nivåkollen i deduktivt" blir "Börja med nivåtestet i deduktivt. Det är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt." Knappen "Gör nivåtestet i deduktivt". Paketraden behålls.
- talserie, spatial, ordforrad: BEHÅLL. Talen (femton på tolv minuter, tjugo ord på åtta minuter) stämmer mot steg2Nivaer. "Gör nivåtestet i ..." är rätt ord och ska bli normen.
- iprov: BEHÅLL. Sant och tydligt.
- Alla fem: lägg till en rad som säger att de övriga typerna också finns, till exempel "Ett av åtta test hos oss" i etiketten eller som sekundär länk till /verktyg/rekryteringstester. Den som landar på talserier vet inte att vi har logik och verbalt också.

TESTKORT_INTERVJU (MDX, en artikel). BEHÅLL. "Logiktest och personlighetstest ingår ofta i samma process" är sant och säljer rätt sak till intervjuläsaren.

SidoPaketKort test (desktop). ÄNDRA texten "Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i Premium." till "Fem frågor gratis här. Grundnivån i åtta testtyper gratis med konto. Alla nivåer och övningsprov mot klockan ingår i Premium." Rubriken "Träna med klockan på innan kallelsen kommer" behålls.

SlutKort test (PremiumBlock efter brödtexten). ÄNDRA raderna. Rubriken "Alla nivåer. Klockan på." behålls.
- Rad 1 "Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar" blir "Åtta testtyper i grund, avancerad och expert, med förklaring till varje svar".
- Rad 2 "Övningsprov på 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren" blir "Övningsprov mot klockan i samma format som Matrigma, Alva, SHL, Aon och I-provet, med automatisk inlämning när tiden är ute".
- Rad 3 "Fördjupade personlighetstestet, 120 påståenden" behålls.
- Rad 4 "Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen" behålls.
- TEST_RAD som används i allt-kortet och ListaSlutKort: "Alla rekryteringstester, övningsprov och personlighetstestet" blir "Åtta rekryteringstester i tre nivåer, övningsprov och personlighetstestet". Samma ändring i HELA_PAKETET_RADER i plans.ts, rad 1.

ArtikelProv (16 artiklar). ÄNDRA premiumraden "Premium, 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis." till "... när du sedan vill träna på din nivå varje dag. Först grundnivån, gratis." Övrig text behålls. Observera att facit här kräver konto medan /prova visar facit direkt; båda är sanna per yta, men ProvKortets "rätt och fel direkt" får bara stå där knappen leder till /prova, aldrig i ArtikelProv.

Hjälteknapp och StickyMobileCTA test "Prova fem frågor gratis". BEHÅLL.

### Prioritet 2: GratisKortet (A1)

ÄNDRA. Eyebrow "Utan att betala" och rubriken "Vill du prova innan du läser vidare?" behålls, de är bra. Sista raden "Nivåkollen i testerna med genomgång, och ett första träningspass" byts mot "Grundnivån i åtta rekryteringstester, med facit och förklaring". Raden flyttas först i listan. Skäl: testerna står för 90 procent av spårvalen och alla köp, och SidoPaketKort 'gratis' visar bara de tre första raderna, så i dag ser desktopläsaren inte ens att testerna finns. Övriga fyra rader behålls i nuvarande ordning efter testraden. Länken "Se vad som ingår i Premium" behålls.

### Prioritet 3: /verktyg/rekryteringstester (A6)

Hjälte "Fem frågor gratis här och Nivåkollen gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje pass." ÄNDRA till "Fem frågor gratis här, grundnivån i alla åtta testtyperna gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt." Ordet "pass" bort, det är produktspråk. Talraden "Nivåkollen / och första passet gratis med konto" blir "Åtta / testtyper, grundnivån gratis med konto".

ProvaKort "Gör ett prov direkt, utan konto". Punkten "Samma frågebank som i det skarpa testet" TA BORT, den är osann: vi har en egen bank, det skarpa testet är leverantörens. Ersätt med "Samma uppgiftstyp som i de skarpa testen". Övriga två punkter behålls.

Steget "Välj test: Plocka matrislogik, verbalt eller numeriskt. Med ett gratiskonto gör du Nivåkollen med genomgång och ett första träningspass." ÄNDRA till "Välj bland åtta testtyper. Grundnivån i varje typ är gratis med konto, med genomgång av varje fråga."

H2 "Åtta testtyper, alla gratis att börja" BEHÅLL, det är modellen för alla andra ytor. Ingressen under (rad 486) är redan rätt, här får Nivåkollen nämnas en gång med förklaring.

Metadata-description (rad 310) "Fem frågor utan konto, Nivåkollen och ett första träningspass med gratiskonto, utan kortuppgift" ÄNDRA till "Fem frågor utan konto, grundnivån i åtta testtyper med gratiskonto, utan kortuppgift". Det här är den rad Google visar; den säljer i dag ingenting.

PremiumBlock (rad 730) "Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Alla nivåer, övningsprov och din historik ingår i Premium." ÄNDRA mellanmeningen till "Grundnivån i åtta testtyper gratis med konto."

FAQ-svaret (rad 102) "Med ett gratiskonto gör du Nivåkollen med full genomgång och ett första träningspass" ÄNDRA till "Med ett gratiskonto gör du grundnivån i alla åtta testtyperna med full genomgång". Resten av svaret behålls. I-prov-svaret (rad 98) BEHÅLL, det är exakt.

### Prioritet 4: startsidan och /priser (A4, A5)

Startsidan, stationen Tester. ÄNDRA. Texten "Samma format som de stora testleverantörerna använder. Nivåkollen visar var du står, dagens pass tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. ..." byts i mitten till "Ett nivåtest visar var du står, passen tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet." Lägg "Åtta testtyper i tre nivåer" först i texten. knappNot "Nivåkollen, första passet och personlighetstestet gratis" blir "Grundnivån i åtta testtyper och personlighetstestet gratis". FAQ-svaret "grundnivån i varje testtyp och personlighetstestet" BEHÅLL, det är redan rätt.

/priser gratiskortet "Utan att betala får du Nivåkollen i testerna med full genomgång och ett första träningspass samma dag, personlighetstestet med 50 påståenden, 3 CV-mallar ..." ÄNDRA inledningen till "Utan att betala får du grundnivån i alla åtta rekryteringstesterna med facit och förklaring, personlighetstestet med 50 påståenden, ...". Talraden "1 Nivåkollen" blir "8 testtyper på grundnivå". FREE_HIGHLIGHTS rad 37 och GRATIS_RAD rad 41 och FAQ rad 210 får samma byte: "Nivåkollen i testerna" blir "grundnivån i rekryteringstesterna".

/priser Tester-stationen. ÄNDRA. gratisRad "Ingår i Premium. Gratis: Nivåkollen med genomgång, ett första träningspass och personlighetstestet med 50 påståenden." blir "Gratis: grundnivån i alla åtta testtyperna med genomgång och personlighetstestet med 50 påståenden. Resten ingår i Premium." Stegen: "Nivåkollen på grundnivå visar var du står per typ" blir "Grundnivån visar var du står i varje typ". Steg 2 "Träna på avancerad och expertnivå i din svagaste typ" BEHÅLL.

paket-copy.ts rad 257, FEL. "samma fyra typer som de stora urvalstesten använder: matrislogik, verbalt resonemang, numeriskt och personlighet, i tre nivåer från grund till expert. I övningsprovet går klockan på riktigt, 25 till 40 minuter ..." ÄNDRA till "åtta testtyper i tre nivåer från grund till expert: logik, figurserier, deduktiv slutledning, talserier, spatial förmåga, ordförråd, verbalt och numeriskt, plus personlighetstestet. I övningsprovet går klockan på riktigt i samma format som Matrigma, Alva, SHL, Aon och I-provet, och provet lämnas in automatiskt när tiden är ute." sub "Nivåkollen med genomgång och ett första träningspass" blir "grundnivån i alla åtta testtyperna med genomgång".

Prisjämförelsen (priser-data.ts TESTER). ÄNDRA första raden "Nivåkollen och första passet / matrislogik, verbalt, numeriskt / En gång, med genomgång / Pass varje dag, utan tak" till "Grundnivån / alla åtta testtyperna / Ingår, med genomgång / Ingår". Ny rad därunder: "Pass varje dag på din nivå / Nej / Ingår". Raden "Övningsprov mot klockan / samma format och tid som ditt test" BEHÅLL. Personlighetsraden BEHÅLL.

### Prioritet 5: registreringen (A8, B4)

KONTO_GRATIS (rad 351) "Nivåkollen: Var du står i rekryteringstesterna, med genomgång av varje fråga." ÄNDRA till namn "Rekryteringstesterna", text "Grundnivån i åtta testtyper, med facit och förklaring till varje fråga." Det här är före spårvalet, besökaren kan ha kommit från en CV-artikel.

Spårvalet tester (rad 47) "Matrislogik, verbalt, numeriskt och personlighet, med förklaring efter varje fråga." FEL, ÄNDRA till "Åtta testtyper i tre nivåer och personlighetstestet, med förklaring efter varje fråga."

Testspårets paketkort (rad 225 till 240). BEHÅLL Nivåkollen i "under" och i gratislistan, eftersom nästa steg (rad 283) förklarar den och användaren faktiskt ska göra den härnäst. ÄNDRA raden "Alla nivåer i matrislogik, verbalt och numeriskt" till "Alla nivåer i alla åtta testtyperna". ÄNDRA "Övningsprov mot klockan, 25 till 40 minuter" till "Övningsprov mot klockan i samma format som ditt test". Lägg till "Grundnivån i alla åtta testtyperna" först i gratislistan.

ForslagSteg (rad 245), FEL. Intervjuspårets kortRubrik "Var förberedd på testdagen" är kopierad från testspåret. Ändra till något i stil med "Var förberedd i intervjun". Copywritern sätter orden.

ProvaOcksa "Klarar du logiktestet? ... Grundnivån ingår gratis." BEHÅLL, det är rätt ord redan.

### Prioritet 6: inloggat (B2, B3, B4)

PaywallCard testniva. ÄNDRA body "Premium ger alla 19 tester, alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga." till "Premium ger alla åtta testtyperna på alla nivåer, pass varje dag, övningsprov mot klockan och det fördjupade personlighetstestet." Förklaringen till varje fråga är gratis redan (genomgangGratis) och ska inte säljas som Premium. Rubriken "Avancerad nivå ingår i Premium" och testrumsrubrikerna BEHÅLL. Secondary "Kör grundnivån igen" BEHÅLL men observera att den bara stämmer om dagens grundsession inte är gjord; annars möts hon av test-tak. Acceptabelt.

PaywallCard test-tak. ÄNDRA body "Premium ger alla nivåer, övningsprov och obegränsat antal försök." till "Premium ger alla nivåer, övningsprov mot klockan och pass varje dag utan dagstak." Sant enligt checkDailyTestQuota. Rubriken "Dagens omgång är gjord" och "Kom tillbaka i morgon" BEHÅLL. Det här är enda stället dagsgränsen får nämnas, och här ska den nämnas.

Testrummet (hem-copy, pass-copy). BEHÅLL allt. Här är Nivåkollen rätt ord, användaren står i den. "Nivåkollen är gratis, med eller utan Premium", "Första nivåkollen är gratis. Nästa ingår i Premium", planens betalvägg och ImorgonKort stämmer mot gratisniva.ts. Planens vägg "Ett pass om dagen på din nivå, extrapass på det du tappar, ny nivåkoll varje vecka, hela kurvan och övningsprov i samma format som {X}" är den bästa Premium-beskrivningen vi har; den borde vara förebild för de publika raderna.

TesterHubClient GRATIS_RAD "Gratis att prova: nivåkollen en gång med genomgång och ett första träningspass samma dag." ÄNDRA till "Gratis: grundnivån i varje testtyp, Nivåkollen en gång med genomgång och ett pass samma dag. Resten ingår i Jobbcoach Premium, 149 kr i månaden." Hubben är där hon väljer typ, och raden säger i dag inte att alla åtta grundnivåer är öppna.

nivakoll/copy.ts betalvaggRad "Den första Nivåkollen i varje test är gratis." BEHÅLL, exakt mot koden.

Mobilappens köpvy "Ett pass om dagen nära din nivå, extrapass på det du tappar". BEHÅLL. Onboarding "Ett pass om dagen, ny nivåkoll var sjunde dag" BEHÅLL.

Livscykelmejlet campaign-gratisniva (rad 49) "Rekryteringstester: en nivåkoll med genomgång och ett första träningspass" ÄNDRA till standardraden i avsnitt 2. Mejlet går till personer som inte köpt; det ska sälja bredden.

Kampanjraderna (A3, B1). BEHÅLL. De säljer pris, inte innehåll, och "Se erbjudandet" leder till /priser som rättas ovan.

## 5. Fel att rätta, samlat

1. "alla 19 tester" i paywall-copy.ts rad 269. Koden har 29 konfigurationer. Rätta genom att sluta räkna tester: "alla åtta testtyperna på alla nivåer".
2. "samma fyra typer ... matrislogik, verbalt resonemang, numeriskt och personlighet" i paket-copy.ts rad 257. Det finns åtta kognitiva typer plus personlighet.
3. Tre-typs-listan "matrislogik, verbalt och numeriskt" i reklam-copy.ts INLINE.test och SLUT.test rad 1, registrering-copy.ts rad 47 och rad 235, rekryteringstestsidans steg "Välj test", prisjämförelsens sub-rad. Alla till "åtta testtyper".
4. "Samma frågebank som i det skarpa testet" på /verktyg/rekryteringstester rad 419. Osant. "Samma uppgiftstyp som i de skarpa testen".
5. "obegränsat antal försök" i test-tak-väggen. Förbjudet ord; "pass varje dag utan dagstak".
6. "Övningsprov på 25 till 40 minuter" i SLUT.test, paket-copy.ts och registrering-copy.ts. Täcker bara tre provlägen; Matrigma adaptiv är 12 minuter, SHL deduktivt 18. Ta bort talet eller läs det ur format.ts per yta.
7. "förklaring till varje fråga" som Premium-argument i testniva-väggen. Förklaringen är gratis. Sälj inte det som redan ingår.
8. ForslagSteg intervjuspårets kortRubrik "Var förberedd på testdagen" (kopierad). Ny rubrik om intervjun.
9. "Nivåkollen i testerna med genomgång, och ett första träningspass" i GratisKort, priser-data FREE_HIGHLIGHTS och priser-sidans gratiskort: ersätts med grundnivåraden (avsnitt 2) och flyttas först i GratisKort.
10. Metadata-description på /verktyg/rekryteringstester säljer Nivåkollen till Google. Byt till grundnivån i åtta testtyper.
11. Konsekvens mellan ProvKort "rätt och fel direkt" (leder till /prova, sant) och ArtikelProv "visas när provet är hämtat till ett gratiskonto" (sant för det inbäddade provet). Ingen av dem är fel, men "rätt och fel direkt" får aldrig sitta på en yta som leder till ArtikelProvet.
12. Prisjämförelsen saknar raden "Pass varje dag" som egen rad och klumpar den med Nivåkollen; den säger också "matrislogik, verbalt, numeriskt" om första raden. Rätta enligt avsnitt 4.

## 6. Till copywritern och saas-lead

- Alla publika testrader ska kunna kontrolleras mot tre tal: åtta typer, tre nivåer, 50 respektive 120 påståenden. Inget annat tal i reklamen.
- Leverantörsnamnen Matrigma, Alva Logic, SHL Verify, Aon scales och I-provet får stå i löptext på testytor, alltid efter "samma format som". Inget "samma test", inga logotyper.
- Hållbarheten: "åtta testtyper" ändras när steg 4 i testplanen lägger till typer. Lägg talet som en konstant (antal kognitiva kinds ur KIND_LABEL minus personlighet) så att copyn följer koden, på samma sätt som TEMPLATE_COUNT.
- Rubrikerna på de bästa korten (ProvKortets expertfråga, "Alla nivåer. Klockan på.", "Träna med klockan på innan kallelsen kommer") är redan rätt. Problemet har hela tiden suttit i gratisraderna och i treklövern "logik, verbalt, numeriskt", inte i rubrikerna.
