# Granskning: deduktiv slutledning, omgång 2, bankversion 4 (2026-11-19)

Testansvarig. Alla 100 nya uppgifter lösta för hand, verifieraren och validatorn körda på nytt. Bankerna och skripten är inte ändrade.

- `node scripts/deduktiv-verifiera.mjs`: 311 av 311 bevisade (112 grund, 116 avancerad, 83 expert), 0 nästan-dubbletter med version 4, 12 kända par bland äldre.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gröna.
- Inga tankstreck (lång eller kort) i någon av de 100 uppgifterna, lösningstexterna inräknade.

**Beslut: inte godkänt för aktivering än.** Facit stämmer i alla 100, men fyra premisskedjor har tolkningsluckor eller ovan svenska, och åtta schemapussel är nästan-dubbletter på lösningsgångens nivå. Verifierarens nyckel fångar bara pussel som blir identiska efter namnbyte och spegling; den släpper igenom pussel med samma villkorstyper och samma lösningsgång där bara en fast plats eller en "inte på plats" har flyttats. Det är samma sorts likhet som omgång 1 fällde (punkt 5 och 6). Övriga 88 uppgifter godkänns som de står.

## Åtgärd före aktivering

### Texträttelser, grund D1

| # | Id | Fynd | Rättelse |
|---|---|---|---|
| 1 | dd-g-d1-59 | Språk. Alternativ C "Alla av vårens lån beslutas av kreditkommittén" är inte idiomatiskt. | "Alla vårens lån beslutas av kreditkommittén." |
| 2 | dd-g-d1-73 | Tolkningslucka, samma slag som dd-g-d1-51 i omgång 1. Premiss 2 gäller "uppdrag som granskas av en revisor"; att ett bokslut är ett uppdrag sägs inte. | Premiss 2: "Inget som granskas av en revisor sköts av en praktikant." |
| 3 | dd-g-d1-75 | Tolkningslucka i tid. "Alla djur som ska opereras fastar från kvällen före" säger inte när operationen är. Sigge kan få frukost i dag och opereras om en vecka; då följer inte facit. | Premiss 1: "Alla djur som ska opereras i morgon fastar från i kväll." Premiss 2: "Inga djur som fastar får kvällsmat." Premiss 3: "Katten Sigge får kvällsmat i kväll." Facit A: "Katten Sigge ska inte opereras i morgon." C: "Katten Sigge fastar från i kväll." Misstagstexten för C följer med. |
| 4 | dd-g-d1-81 | Liten tolkningslucka. Premiss 1 gäller "skador", premiss 2 och facit gäller "ärenden". | Premiss 1: "Alla ärenden om skador på vattenledningar besiktas på plats." |

### Nästan-dubbletter, byts ut

Villkorstyperna nedan är räknade per pussel (fast plats, före, samma dag, inte på plats). "Samma lösningsgång" betyder att stegen kommer i samma ordning och av samma skäl.

| # | Id | Nästan-dubblett av | Gemensam lösningsgång |
|---|---|---|---|
| 5 | dd-a-d2-112 | dd-a-d2-89 | Fast på plats 5 som går före en annan, så den andra hamnar på 6. Paret som går samma dag får inte plats på tisdagen och hamnar på måndagen; "inte på plats" och ett före ordnar måndagen. |
| 6 | dd-a-d2-114 | dd-a-d2-111 | Paret som går samma dag har en fast medlem på måndagen, den andra medlemmens föregångare fyller måndagen. Tisdagen: "Hanna står inte på plats 4" och Hanna före en annan ger Hanna på 5. Villkoret står ordagrant i båda. |
| 7 | dd-a-d2-115 | dd-a-d2-113 | Fast på tisdagen, samma dag och ett före fyller tisdagen; en kedja om tre fyller måndagen. Båda frågar efter plats 1. |
| 8 | dd-a-d2-116 | dd-a-d2-73 (v3) | Kedja om tre där den första och den sista går samma dag, så alla tre går samma dag; den fasta platsen stänger ena dagen; "inte på plats" ordnar den andra. dd-a-d2-73 är samma pussel med dagarna bytta. |
| 9 | dd-a-d2-117 | dd-a-d2-73, dd-a-d2-116 | Som 8, fast på plats 2. |
| 10 | dd-a-d2-119 | dd-a-d2-73, dd-a-d2-117 | Som 8, fast på plats 2 också här; bara "inte på plats" flyttar från 1 till 3. |
| 11 | dd-e-d3-71 | dd-e-d3-59 (v3) | Antagandet fäster partnern i ett samma dag-par, paret ordnas av sitt före, två "inte på plats" på en fri person tvingar henne till den lediga platsen på andra dagen, det andra före-paret fyller resten. 71 är 59 speglad med "inte på plats" flyttad ett steg. |
| 12 | dd-e-d3-77 | dd-e-d3-14 (v1) | Tre personer knutna samma dag med två samma dag-villkor; antagandet stänger ena dagen så trion går den andra; "inte på plats" och ett före ordnar trion; det fristående före-paret fyller resten. |

Ersättarna i 5 till 10 ska ha en kombination av villkorstyper som inte redan finns i turordningen på avancerad (se fråga 2), och fördelningen måste/vem ska hållas: 112, 117 och 119 är måste-frågor, 114, 115 och 116 vem-frågor. Ersättaren för dd-e-d3-77 ska behålla familjen samma grupp, eftersom 77 är den enda i omgången.

Uppgifterna i version 4 har aldrig dragits av någon session, så de kan få nytt innehåll under samma id.

## Godkända

Alla 100 löstes för hand och facit är det enda svaret i varje. Utöver punkterna ovan godkänns:

- **Grund D1:** dd-g-d1-55 till 58, 60 till 72, 74, 76 till 80, 82 till 84. Trettio olika miljöer, vardagliga och neutrala. Svårigheten passar grund.
- **Grund D2:** dd-g-d2-26 till 33. Alla har en enda lösning. Svårigheten är rimlig för p_prior 0,62. Den fjärde personen eller pärmen nämns bara i alternativen (Ida i 27, lila i 26, Frida i 32), som i version 3.
- **Avancerad:** dd-a-d2-83 till 111, 113 och 118.
- **Expert:** dd-e-d3-65 till 70, 72 till 76, 78 till 89. Stickprov på dubbel negation (79 E, 85 A, 89 E: "omöjligt att X inte står bredvid Y") håller och passar expert.

Anmärkningar till godkända, inget hinder:

- **dd-a-d2-110** är den lättaste på avancerad: dagarna spelar ingen roll, det är en ren kedja om fyra. Frågestatistiken avgör om p_prior 0,55 håller.
- **dd-a-d2-94 och dd-a-d2-98** liknar varandra (mitten fast, en granne direkt till vänster, "inte bredvid" skickar en till kanten) men har olika villkorstyper. De får stå kvar.
- **dd-a-d2-113** har samma tisdag som dd-a-d2-63 men en annan måndag. Den får stå kvar när 115 byts ut.
- **Misstagstexterna i vem-frågorna** pekar ibland på ett villkor som bara är ett av flera som bryts (90 B, 109 D). Det är samma anmärkning som punkt 9 i omgång 1.

## Fråga 1: de 12 kända paren på avancerad

**Ja, pensionera en uppgift i varje par från version 4.** Det lämnar version 1 till 3 orörda: `poolFor(niva, 3)` filtrerar på `pensionerad_fran <= version`, så sessioner med version 3 drar ur samma pool som i dag, och `allaFragor()` hittar uppgifterna för rättning och resultatsidor. Inget id byter innehåll.

Skälet: med 12 frågor ur 104 får en session båda uppgifterna i ett visst par i drygt 1 procent av fallen. Med tio par blir det runt var tionde session. Dessutom får den som tränar flera pass samma pussel i ny form, vilket ger en inlärningseffekt.

Vi behåller den äldre uppgiften i varje par, eftersom den har mest svarsstatistik. Pensioneras från version 4 (alla dd-a-d2):

| Pensioneras | Behålls | Kommentar |
|---|---|---|
| 32 | 29 | 32 är den lagade kopian av 04 |
| 53 | 09 | |
| 63 | 43 | 14 är redan pensionerad |
| 68 | 19 | |
| 50 och 82 | 23 | 23, 50 och 82 är samma pussel |
| 61 | 27 | |
| 78 | 58 | båda version 3; den nyare går |
| 71 | 69 | |

Det blir nio id. 04 och 14 är redan pensionerade, så efter detta finns inga kända par kvar i version 4. Pool avancerad i version 4: 67 minus 9 plus 37, alltså 95.

Det kräver en liten kodändring, som görs samtidigt med aktiveringen: `pensionerad_fran?: 2 | 4` i `types.ts`, validatorn (`validate-deduktiv.mjs` rad 72) ska tillåta 2 eller 4, och antalen i `version4.test.ts` ändras. Verifieraren klarar det redan.

## Fråga 2: före och efter, 11 av 37

**Inte godtagbart som det står.** Problemet är mindre andelen än att uppgifterna liknar varandra. Turordningen på avancerad har i hela banken bara tre kombinationer av villkorstyper, och alla elva nya hamnar i dem:

| Villkorstyper | Aktiva v1 till 3 | Nya v4 |
|---|---|---|
| fast, före, före, samma dag, inte på plats | 43, 63, 73 | 89, 111, 112, 114, 116, 117, 119 |
| fast, före ×3, samma dag | 09, 29, 32, 39, 53, 58, 78 | 113, 115, 118 |
| fast, före ×4 | 19, 48, 68 | 110 |

Inom grupperna upprepar sex av de nya en lösningsgång (punkt 5 till 10). Med 24 av 104 i pusselformen och 12 frågor per session kommer en kandidat att se samma lösningsgång två gånger i ett och samma test.

Efter utbytena och pensioneringarna har omgången 5 före och efter-uppgifter (89, 110, 111, 113, 118), och poolen 13 av 95 plus de ersättare som läggs i turordningen. Det är godtagbart. Turordningen får gärna stå för temat i ersättarna, så att temana förblir jämna, om de har en kombination som saknas i tabellen: två par som går samma dag, två fasta platser, eller "inte på plats" på två olika personer. Taket på 7 av 37 bör gälla också för före och efter.

Förslag till omgång 3: verifieraren bör också jämföra en lösare nyckel, där villkorstyperna och hur villkoren hänger ihop räknas men inte de exakta platserna. Låt den varna, inte fälla, och låt testansvarig avgöra. Den hade hittat punkt 5 till 12.

## Aktivering, när rättelserna är gjorda

Stegen i `deduktiv-2026-11-19-omg2.md` gäller (`DEDUKTIV_VERSION = 4`, `version4.test.ts` och `version3.test.ts`). Lägg till pensioneringen enligt fråga 1. Kör verifieraren och validatorn igen. Ersättarna i punkt 5 till 12 granskas av testansvarig innan versionen höjs.

Aktivering: nej, rätta dd-g-d1-59, 73, 75 och 81, byt ut dd-a-d2-112, 114, 115, 116, 117 och 119 samt dd-e-d3-71 och 77, och pensionera dd-a-d2-32, 50, 53, 61, 63, 68, 71, 78 och 82 från version 4

## Omgranskning

Testansvarig, samma dag. De fyra rättade och de åtta nya uppgifterna är lösta för hand, och de 14 varningsparen med version 4 är lösta och jämförda steg för steg. Bankerna och skripten är inte ändrade.

- `node scripts/deduktiv-verifiera.mjs`: 311 av 311 bevisade, 0 nästan-dubbletter med version 4, 0 kända par bland äldre. Lös nyckel: 22 varningar, 14 med version 4.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gröna.
- `npx vitest run src/lib/deduktivV1`: 51 av 51 gröna.
- Pensioneringen stämmer: dd-a-d2-32, 50, 53, 61, 63, 68, 71, 78 och 82 har `pensionerad_fran: 4`, och typerna och validatorn tillåter 2 eller 4.
- Inga tankstreck (långa eller korta) i någon uppgift i version 4.

### De fyra texträttelserna

| Id | Facit | Bedömning |
|---|---|---|
| dd-g-d1-59 | A, enda | Godkänd. C lyder nu "Alla vårens lån beslutas av kreditkommittén." |
| dd-g-d1-73 | C, enda | Premisserna godkända, luckan är stängd. Lösningstexten slutar "Alltså sköts inte Solrosens bokslut av en." Det är ovan svenska; skriv "av en praktikant". |
| dd-g-d1-75 | A, enda | Godkänd. Tiden är låst till i kväll och i morgon, och misstagstexten för C följer med. |
| dd-g-d1-81 | C, enda | Premisserna godkända. Lösningstexten säger "Alla ärenden om vattenskador besiktas på plats" och "gäller ärendet ingen vattenledning". Den citerar premiss 1 fel och tar tillbaka glappet som rättelsen stängde, eftersom en vattenskada inte behöver vara en skada på en vattenledning. Skriv "Alla ärenden om skador på vattenledningar besiktas på plats. Alltså gäller ärendet inte en skada på en vattenledning." |

### De åtta ersättarna

Facit är det enda giltiga svaret i alla åtta. Villkoren har inga tolkningsluckor, och svenskan är naturlig.

| Id | Lösning | Bedömning |
|---|---|---|
| dd-a-d2-112 | Kim, Nils, Disa, Pia, Olga, Cilla. Facit E. | **Godkänd.** Två fasta platser, samma dag och ett före ordnar måndagen, "inte på plats 6" ordnar tisdagen. Ny kombination. |
| dd-a-d2-114 | Tom, Anna, Åsa, Mats, Erik, Dan. Facit B. | **Byts ut.** Två platser är låsta och en kedja om fyra fyller resten i ordning. Det är samma lösningsgång som dd-a-d2-110 (Isak på 5 och Anna på 6 låsta, en kedja om fyra fyller 1 till 4), och båda är vem-frågor. Dagarna används inte. Uppgiften är dessutom ett enda steg, lika lätt som 110, som redan är den lättaste på avancerad. |
| dd-a-d2-115 | Erik, Cilla, Karin, Isak, Ulf, Filip. Facit C. | **Godkänd.** Öppningen är densamma som i 110 (fast på 5, ett före till 6), men "Karin står inte på plats 4" ger ett eget steg. Att svaret är den sjätte personen, som bara finns i alternativen, har förebilder (63, 79, 81, 98, 107). |
| dd-a-d2-116 | Vera, Åsa, Sara, Eva, Ida. Facit D. | **Byts ut.** Kombinationen (fast, direkt till vänster, två någonstans till vänster) finns redan i dd-a-d2-06 och dd-a-d2-64, med samma lösningsgång: en fast plats i ena änden, sedan fyller en kedja resten i ordning. Ett enda steg. Uppdraget var en kombination som inte redan finns. |
| dd-a-d2-117 | Frida, Nils, Maja, Gun, Kim, Ulla. Facit E. | **Godkänd.** Slutet liknar 112 ("inte på plats 6" och den sjätte personen på 6), men måndagen ordnas av två före mot en fast plats i stället för av samma dag. Andra villkorstyper. |
| dd-a-d2-119 | Pia, Gun, Olle, Anna, Åsa, Isak. Facit B. | **Godkänd.** Tre kedjesteg från två fasta platser, och samma dag placerar Anna. Ny kombination. |
| dd-e-d3-71 | Åsa, Olle, Sven, Frida, Tom, Maja. Facit B. | **Godkänd.** Måndagen har bara plats 2 kvar, så samma dag-paret och Maja går på tisdagen, och två "inte på plats" på olika personer ordnar dem. Annan gång än 59 och 41. Passar expert. |
| dd-e-d3-77 | Alva, Olle, Eva, Ulf, Jenny, Dan. Facit C. | **Lösningstexten rättas.** Pusslet är godkänt och passar expert. Texten säger "Kvar för Eva: plats 3 eller 6", men plats 4 är också kvar i det läget (Eva står inte på 2, Alva och Jenny står på 1 och 5). Plats 4 faller av samma skäl som 6. Skriv "Kvar för Eva: plats 3, 4 eller 6. Står Eva på plats 4 eller 6 måste Olle gå på tisdagen, och då finns ingen plats kvar för Ulf efter honom. Alltså står Eva på plats 3." |

### De 14 varningsparen i version 4

Måttstocken är densamma som i första granskningen. Samma villkorstyper och samma steg i samma ordning av samma skäl, där bara en fast plats eller en "inte på plats" har flyttats, är en nästan-dubblett.

| Par | Bedömning | Skäl |
|---|---|---|
| dd-g-d2-12 och 33 | Står kvar | 12 löses direkt (inte bredvid den fasta), 33 kräver ett fall på Erik. Olika graf. |
| dd-g-d2-15 och 29 | Står kvar | I 15 hänger bredvid på den fasta pärmen, i 29 tvingas ett fritt par in på 1 och 2 av platsbrist. Med fyra platser och tre villkor är typutrymmet litet. |
| dd-g-d2-25 och 27 | Står kvar | 25 löses direkt, 27 kräver ett fall på Viktor. |
| dd-a-d2-09 och 113 | **113 byts ut** | Fast på tisdagen, samma dag och ett före fyller tisdagen, en kedja om tre fyller måndagen. Det är ordagrant punkt 7, som fällde förra 115. |
| dd-a-d2-39 och 113 | Som ovan | 39 är samma gång med dagarna bytta. |
| dd-a-d2-41 och 99 | Står kvar | I 41 hänger "inte bredvid" på kedjans första, i 99 på en fristående pärm, och direktparet tvingas till 4 och 5 av ett annat skäl. |
| dd-a-d2-43 och 111 | **111 byts ut** | Fast på måndagen, samma dag och ett före fyller måndagen; ett före och "inte på plats" ordnar tisdagen med den sjätte personen kvar. Samma gång som punkt 5 och 6. Första granskningen godkände 111, och det rättas här. |
| dd-a-d2-45 och 100 | **100 byts ut** | Fast på plats 3, direktparet tvingas till 1 och 2 av ett vänster om, "inte på plats" ordnar 4 och 5 med den sjätte personen. Samma villkorstyper, samma steg, båda måste-frågor. |
| dd-a-d2-56 och 88 | Står kvar | Samma typer, men "inte på plats" och vänster om sitter på olika roller (56 på parets första, 88 på tredje personen), så parets lägen faller av olika skäl. |
| dd-a-d2-79 och 101 | **101 byts ut** | Fast i ena änden, direktparet har tre lägen, "inte på plats" på parets högra medlem stryker ett och bredvid på samma medlem stryker ett till. Förskjutet ett steg är det samma pussel; båda är vem-frågor och lösningstexterna har samma steg. |
| dd-a-d2-86 och 87 | Står kvar | Båda avgörs av ett fall på plats 2 eller 4, men graferna skiljer sig med en kant och 87 har en fri person. Olika teman och frågeformer. |
| dd-e-d3-36 och 66 | Står kvar | Samma dag-paret stängs ute från tisdagen av olika skäl (36: Sven måste efter, 66: platsbrist), och "inte på plats" ordnar olika dagar. |
| dd-e-d3-47 och 70 | **70 byts ut** | Antagandet, samma dag och "inte på plats" låser partnern på plats 3; en kedja om tre med "inte på plats" på en ände fyller resten; den sjätte personen tar platsen som blir över. Samma gång som punkt 11. |
| dd-e-d3-50 och 67 | **67 byts ut** | Antagandet och en fast plats; mitten i en kedja om tre har två lägen och "inte på plats" väljer; ett andra "inte på plats" ordnar sista paret med den sjätte personen. Samma typer, samma steg. |

Sex av fjorton par fäller den nyare uppgiften, alla av samma slag som punkt 5 till 12. Fyra av dem (111, 113, 67 och 70) godkändes i första granskningen, som bara jämförde mot exakt nyckel och mot de pussel som byttes ut. Den lösa nyckeln gör alltså sitt jobb.

### Krav på de nya ersättarna

- 111, 113 och 114 är vem-frågor i turordningen, 100 en måste-fråga i rad, 101 en vem-fråga med pärmar och 116 en vem-fråga i rad. Behåll frågeform och tema så att fördelningen står.
- Ingen av dem får lösas med "lås platser, en kedja fyller resten". Använd det som saknas: två samma dag-par i samma pussel, "inte på plats" på två olika personer i turordningen, eller inte bredvid tillsammans med bredvid i rad.
- dd-e-d3-67 och 70 behåller familjen utesluten plats men inte gången "antagandet låser partnern, kedjan fyller resten".
- Verifieraren ska inte varna, varken med exakt eller lös nyckel, för någon av de nya.
- Lösningstexterna i dd-g-d1-73, dd-g-d1-81 och dd-e-d3-77 rättas enligt tabellerna ovan. Facit och alternativ ändras inte.

Anmärkningar, inget hinder: 112 och 117 slutar på samma sätt, och 115 öppnar som 110. De får stå kvar.

Aktivering: nej, rätta dd-a-d2-100, 101, 111, 113, 114 och 116 samt dd-e-d3-67 och 70 (nya uppgifter med samma id), och lösningstexterna i dd-g-d1-73, dd-g-d1-81 och dd-e-d3-77

## Tredje granskningen

Testansvarig, samma dag. Bankerna och skripten är inte ändrade.

- `node scripts/deduktiv-verifiera.mjs`: 308 av 308 bevisade (112 grund, 113 avancerad, 83 expert), 0 nästan-dubbletter med version 4. Lös nyckel: 83 varningar, 38 med version 4.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gröna.
- Inga tankstreck i bankerna.
- dd-a-d2-111, 113 och 114 är borta ur banken.

### De fem ersättarna

| Id | Lösning | Bedömning |
|---|---|---|
| dd-a-d2-100 | Frida, Åsa, Tove, Gustav, Disa. Facit C. | **Godkänd.** Åsa kan inte stå bredvid Gustav på 4, så hon står på 1 eller 2. På 1 får Frida ingen plats före Tove, alltså står Åsa på 2. Tre steg, rätt nivå. Kombinationen finns i 84, men där är gången en annan (bredvid den fasta, inte bredvid sorterar 3 och 5). |
| dd-a-d2-101 | grön, blå, vit, lila, röd. Facit D. | **Godkänd.** Grön står på 1 eller 3. På 3 måste vit och lila ligga på 4 och 5, och då ligger vit bredvid grön. Sedan kan inte röd ligga bredvid vit. Fem villkor och ett fall, rätt nivå. Kombinationen är ny. |
| dd-a-d2-116 | Bo, Karin, Sara, Olga, Jenny. Facit D. | **Godkänd.** Sara måste stå på 3 eller tidigare, och Bo måste få plats bredvid Karin, så paret står på 2 och 3. Jenny hamnar på 5 eftersom hon inte får stå bredvid Sara. Ett fall, ingen fast plats. Kombinationen är ny i rad. |
| dd-e-d3-67 | Filip, Erik, Leo, Ulla, Olga, Hanna. Facit C. | **Godkänd.** Ulla och Hanna måste gå efter Erik och hamnar på tisdagen, Olga följer Hanna dit, och två "inte på plats" låser henne på 5. Typerna liknar 76, men där låser de två "inte på plats" en person i ett före-par och platsbrist skickar samma dag-paret till måndagen. Olika roller, samma regel som för 56 och 88. Passar expert. |
| dd-e-d3-70 | Ida, Mats, Gun, Erik, Bea, Alva. Facit A. | **Stryks.** Facit är entydigt, men gången är samma som i dd-e-d3-50: efter antagandet och den fasta platsen har före-gruppen två platser på tisdagen och ett "inte på plats" väljer, sedan ordnar ett andra "inte på plats" måndagens sista par med den sjätte personen. Samma typer (fast, två före, två inte på plats). Det var skälet att fälla förra 67. Den lösa nyckeln varnar inte för paret. |

### De tre lösningstexterna

Alla tre är godkända. dd-g-d1-73 slutar nu "av en praktikant", dd-g-d1-81 citerar premiss 1 rätt, och dd-e-d3-77 räknar upp plats 3, 4 och 6 och förklarar varför 4 och 6 faller.

### De 38 varningarna med version 4

Samma måttstock som tidigare. Samma villkorstyper och samma steg i samma ordning av samma skäl är en nästan-dubblett. Samma byggstenar i andra roller eller i annan ordning får stå kvar.

**Samma lösningsgång, stryks (6):**

| Stryks | Samma gång som | Gemensam lösningsgång |
|---|---|---|
| dd-g-d2-30 | dd-g-d2-19, 20 | En fast plats i ena änden, sedan fyller en kedja om tre resten i ordning. |
| dd-a-d2-92 | dd-a-d2-06, 07, 64 | En fast plats, sedan fyller en kedja om fyra resten i ordning. Samma skäl som för förra 114 och 116. |
| dd-a-d2-107 | dd-a-d2-98 | Båda har den fasta på plats 3. Ett direktpar fyller ena sidan, inte bredvid den fasta skickar en person till andra änden, och den sjätte personen tar platsen som blir över. 107 speglad är 98 med en annan kant till paret. Båda är vem-frågor. |
| dd-a-d2-110 | dd-a-d2-19, 48 | Låsta platser och kedjor som fyller resten i ordning. Den var redan den lättaste på avancerad. |
| dd-a-d2-118 | dd-a-d2-29, 58 | En trio som binds av samma dag ryms bara på den ena dagen, och det som är kvar fyller den andra. |
| dd-e-d3-71 | dd-e-d3-41 | Antagandet och den fasta platsen lämnar en enda plats på måndagen, så samma dag-paret går på tisdagen, och två "inte på plats" ordnar tisdagen. Jag godkände 71 i omgranskningen; vid en närmare jämförelse med 41 är stegen desamma. |

**Står kvar, eller försvinner med strykningarna (övriga varningar):**

| Varning | Skäl |
|---|---|
| dd-g-d2-12 och 33, 15 och 29, 25 och 27 | Som i omgranskningen: en löses direkt, den andra kräver ett fall eller platsbrist. |
| dd-g-d2-19 och 31, 20 och 31, 30 och 31 | 31 har två skilda delar (direktpar mot den fasta, ett fristående vänster om), inte en kedja. |
| dd-g-d2-28 och 32 | I 28 har paret två lägen och inte bredvid stryker ett; i 32 sitter den fasta i paret och inte bredvid ordnar resten. |
| dd-a-d2-01 och 98, 01 och 107, 11 och 98, 11 och 107, 57 och 98, 57 och 107 | 01 och 57 löses genom att den femte personen tvingas till kanten först; i 11 ordnar vänster om och inte bredvid ett fritt par. Annan gång än 98. Paren med 107 försvinner när 107 stryks. |
| dd-a-d2-06, 07, 33, 64 och 77 mot 92 | Försvinner när 92 stryks. 33 har en bakåtkedja från en fast plats i mitten och är ingen kedja som fyller resten. |
| dd-a-d2-09, 29, 39 och 58 mot 118; 19 och 48 mot 110 | Försvinner när 118 och 110 stryks. |
| dd-a-d2-27 och 96 | 27 har en direktkedja om tre med en fri pärm, 96 två skilda direktpar. Båda löses med ett fall, men grafen och skälen skiljer sig. |
| dd-a-d2-37, 45, 51 och 80 mot 103 | I 103 avgör "inte på plats" var direktparet står och vänster om ordnar plats 1 och 5. I 37 och 45 sitter "inte på plats" på en tredje person, och i 51 och 80 är direktpartnern låst av den fasta platsen. Gruppen är tät (sex aktiva med samma typer), men ingen har samma steg. |
| dd-a-d2-41 och 99, 56 och 88, 86 och 87 | Som i omgranskningen. |
| dd-e-d3-26 och 80 | 26 skickar svart till kanten med ett fall; i 80 stänger två inte bredvid plats 2 för två personer på en gång. Olika steg. |
| dd-e-d3-36 och 66 | Som i omgranskningen. |

Efter strykningarna gäller detta för version 4:
- grund D2 har 7 nya uppgifter
- avancerad har 30 nya och en pool på 88
- expert har 23 nya och en pool på 68

Antalen i `version4.test.ts` och i `deduktiv-2026-11-19-omg2.md` ändras med strykningarna. Avancerad tappar två måste-frågor (92, 118) och två vem-frågor (107, 110), så balansen står. Familjen utesluten plats på expert går ner till 3 av 23, vilket är godtagbart. Kör verifieraren och validatorn en sista gång efter strykningarna. Ingen ny granskning behövs, eftersom inget nytt innehåll tillkommer.

Stryks ur version 4: dd-g-d2-30, dd-a-d2-92, dd-a-d2-107, dd-a-d2-110, dd-a-d2-118, dd-e-d3-70, dd-e-d3-71

Aktivering: ja efter strykningarna
