# Säljytorna efter frågebanken, genomgång 2026-11-19

Säljansvarig för rekryteringstesterna. Bara undersökning, ingen kod är ändrad. Underlaget är docs/lage-2026-11-19.md, besluten om säljytorna (2026-11-15), Black Week-beslutet och koden på main i dag.

## Topp 5

1. **Vår starkaste nyhet syns inte någonstans.** Ingen säljyta säger hur stor banken är eller hur nivån räknas. Vi har nu 3 533 aktiva uppgifter, och nivån räknas bara på uppgifter man inte sett de senaste 30 dagarna. Det ska visas som bild (ett stort tal och åtta staplar) på testväggen i PaywallCard, i Black Week-mejlet och i kortet "Premium tar bort taket" på testsidan. Allt det ska vara klart före frysen 23 november.
2. **"Flera veckor utan samma uppgift" kan vi inte lova.** Karensen är en vecka (KARENS_V4), och när de osedda uppgifterna tar slut väljer motorn den uppgift som setts längst tillbaka. Ett tal som håller är "över 3 000". Löftet som håller är "nivån räknas bara på uppgifter du inte sett den senaste månaden".
3. **Nio mot åtta.** Hem räknar personlighetstestet som en testtyp och visar "Nio tester, alla öppna" och "9 testtyper, 3 mätta". /priser och artiklarnas sidokolumn har den synliga raden "Grundnivån i alla nio". Allt ska följa beslutet "åtta testtyperna och personlighetstestet".
4. **Två texter i Play-butiken stämmer inte längre.** "Premium låser upp alla testtyper" är fel, eftersom grundnivån i alla testtyper är gratis. "Dagens grundpass är gratis" har varit fel sedan v4, där det bara gäller dag 0 och därefter ett grundnivåtest om dagen. Ordet "pass" togs dessutom bort ur appen i dag.
5. **Vi undersäljer Premium med "ett pass om dagen".** TypProvKort (fem provkort i testklustret) och båda kampanjmejlen säger att Premium ger "ett träningspass om dagen". Premium har inget tak för träning. Det är den formulering som kostar mest just under Black Week.

---

## Underlag: vad banken faktiskt rymmer

Räknat i dag ur de aktiva versionerna (poolFor med DEDUKTIV_VERSION 5, SERIE_VERSION 5, TALSERIE_VERSION 4, SPATIAL_VERSION 5, ORD_VERSION 4, TRANINGSVERSION 7 för matris och passPool för verbalt och numeriskt). Pensionerade uppgifter räknas inte.

| Testtyp | Grund | Avancerad | Expert | Summa |
|---|---|---|---|---|
| Matrislogik (träningsbanken) | 167 | 175 | 157 | 499 |
| Deduktiv slutledning | 132 | 121 | 101 | 354 |
| Figurserier | 120 | 144 | 122 | 386 |
| Talserier | 171 | 168 | 166 | 505 |
| Spatial förmåga | 195 | 195 | 186 | 576 |
| Ordförråd | 197 | 205 | 155 | 557 |
| Verbalt (påståenden, 44 + 48 texter) | 176 | 192 | | 368 |
| Numeriskt (frågor, 36 + 36 underlag) | 144 | 144 | | 288 |
| **Totalt** | | | | **3 533** |

**Karens och mätning, som koden gör i dag:**

- *Urvalet* (pass-urval.ts, pass-figur.ts, passgenerator.ts): uppgifter som inte setts de senaste 7 dagarna dras först. Finns inga sådana kvar tas den som setts längst tillbaka. Det finns alltså ingen spärr som garanterar en vecka. Det är en prioritering.
- *Mätningen* (settInomFonstret, nivakoll/motor.server.ts, nivaEfterTraning): en uppgift som setts inom 30 dagar räknas inte mot nivån. **Det här är en regel som håller**, och den går att sälja.
- *Hur länge det räcker:* med en träning om dagen per testtyp på en nivå dröjer det innan något kommer tillbaka: matris cirka 17 till 19 dagar (9 uppgifter per pass), deduktivt och figurserier cirka 25 till 36 dagar (4 per pass), talserier, spatial och ordförråd cirka 26 till 33 dagar (6 per pass), verbalt och numeriskt 36 till 48 dagar (en text per pass). Den som tränar flera gånger om dagen, eller gör nivåtester ur samma pool, kommer fram fortare. "Flera veckor" stämmer för den som tränar normalt men kan inte stå som löfte.

**Gratisregeln sedan v4:** ett grundnivåtest om dagen i valfri testtyp, och Nivåkollen en gång per testtyp. Dag 0-grundpasset finns kvar i appen och räknas in i dagens kvot. Träning är Premium. Premium har inget tak för träning.

---

## 1. Ytor med svaga eller felaktiga argument

### PaywallCard och paywall-copy (src/components/paywall/paywall-copy.ts)

- **testniva** (det är den v4 öppnar från Tester, med platserna dag2, ommatning och testniva): "Premium ger alla åtta testtyperna på alla nivåer, träning varje dag, övningsprov mot klockan och det fördjupade personlighetstestet." Texten är sann men säger inget nytt. "Träning varje dag" låter som en kvot, inte som att taket är borta. Banken nämns inte.
- **testniva, sekundärknappen "Kör grundnivån igen":** om dagens grundnivåtest redan är gjort leder den rakt in i kvotspärren. Byggaren bör kontrollera det mot grundKvarIdag.
- **test-tak:** "Dagens omgång är gjord" är ett gammalt ord. Hem säger "Dagens grundnivåtest är gjort". Väggen används bara från TestHubPage (äldre vy), så den har låg prioritet.
- **PaywallCard rad 350:** aria-texten "Nio testtyper" säger emot beslutet, men den syns inte. Låg prioritet.

### /priser (src/app/(public)/priser/page.tsx)

- Rad 171: den synliga texten "Grundnivån i alla nio" på testplattan säger emot beslutet.
- Funktionskortet för tester (paket-copy.ts rad 226) räknar upp typerna men säger varken något om bredden inom varje typ eller om banken.
- Stegen säger "Följ din utveckling, pass för pass" och "Session för session". Ordet "pass" är borta ur appen och de inloggade vyerna.
- HELA_PAKETET_RADER (plans.ts rad 94): "Åtta testtyper i tre nivåer ..." stämmer. Banken saknas.

### Testsidan /verktyg/rekryteringstester (page.tsx)

- Kortet "Premium tar bort taket" (rad 644): priset är statiskt, "149 kr i månaden". Under Black Week ser en besökare som aldrig haft Premium 149 kr här och 99 kr i PremiumBlock längre ned på samma sida.
- Typkorten (rad 73 till 140) och guidelänken (rad 233) beskriver spatial förmåga som "vridna figurer, pappersvikning och tärningar". Kroppar, snitt och spegling i två linjer saknas. Deduktivt beskrivs som "villkor i text" och nämner varken logiska pussel eller sanningssägare och lögnare. Figurserier och matris nämner inte klockor, grupper eller streckfigurer.
- Hjältens tal "12 min per pass" använder ordet "pass".
- I FAQ:t "Är testerna gratis?" saknas regeln om ett grundnivåtest om dagen. Texten är inte fel, men den som läser den räknar med alla åtta samma dag.

### Reklamkorten i artiklarna (src/components/artiklar/reklam/)

- **TypProvKort.tsx** (deduktiv, talserie, spatial, ordförråd och I-prov): paketraden säger "... ett träningspass om dagen ... ingår i Premium". **Det stämmer inte**, eftersom Premium har obegränsad träning, och det undersäljer.
- **reklam-copy.ts rad 260:** den synliga bildtexten under Nio-raden, "Grundnivån gratis i alla nio", säger emot beslutet.
- **SLUT.test** ("Alla nivåer. Klockan på."): raderna stämmer men har ingen bank och ingen mätregel.
- Rubriken på spatialkortet, "Vridna figurer, pappersvikning och tärningar", kan stå kvar eftersom kortet hör till I-provsklustret och I-provets deltest filtrerar bort kropparna.

### Registreringen (src/components/registrering/registrering-copy.ts)

- Steg 3 tester, rad 234: "Träningspass på din nivå varje dag ingår i Premium". Ordet är "pass" och formuleringen låter som ett tak.
- Steg 3 listar "Alla nivåer i alla åtta testtyperna" och övningsprov. Det är den bästa platsen för banken i flödet, och den används inte.
- Steg 1-kortet säger "Åtta testtyper och personlighetstestet". Det är rätt.

### Play-butiken (mobilapp/butik/butikstexter.md)

- **Fel:** "Premium låser upp alla testtyper". Grundnivån är gratis i alla testtyper. Det Premium öppnar är nivåerna och träningen.
- **Fel sedan v4:** "Nivåkollen och dagens grundpass är gratis". Grundpasset är gratis bara dag 0. Efter det gäller ett grundnivåtest om dagen.
- Under "VAD DU FÅR" står "Ett pass om dagen, cirka tio minuter, på din nivå" i samma lista som gratisraden, så det ser ut att vara gratis. Ordet "pass" togs bort ur appen i dag (d8e7d30b).
- Den korta beskrivningen räknar upp fem saker men inte figurserier eller deduktivt.
- Telefonbild 1, "Ett pass om dagen, fram till provet", har samma ordproblem. Den är en bild och kan vänta.
- Black Week gäller inte i appen (kupongerna finns bara i Stripe, och appen har ingen Stripe-länk). Butikstexten ska alltså inte nämna 99 kr.

### Hem, inloggat (src/components/tester-v4/hem/)

- hemData.ts rad 28: antalTesttyper lägger till personligheten (+1). Därför står det "Nio tester, alla öppna" och "Nio tester, grundnivån gratis" (copy.ts rad 97 och 98), "9 testtyper, 3 mätta, alla öppna" och "9 testtyper" på mobilen (rad 63 till 66). Det bryter två beslut: vi räknar testtyper och aldrig tester, och personlighetstestet räknas för sig. Siffran blir dessutom inkonsekvent, eftersom "mätta" bara kan bli 8 av 9.

### Black Week-mejlen (src/lib/email/campaign-kampanj.ts)

- Black Week: "Vill du ha struktur lägger vi upp ett pass om dagen fram till ditt provdatum." Cyber Monday: "få ett pass om dagen". Båda låter som ett tak, båda använder ordet "pass" och ingen av dem nämner banken. Mejlen går ut från koden morgonen den 23 november, så ändringen måste vara på main före frysen.

---

## 2. Nya säljargument och var de gör mest nytta

| Argument | Belägg | Form | Bäst här |
|---|---|---|---|
| **Över 3 000 uppgifter i åtta testtyper** | 3 533 aktiva i dag | Ett stort tal, "3 000+", med etiketten "uppgifter", och åtta tunna staplar i Nio-glyfernas färger. Talen per typ visas inte på ytan. | Testväggen i PaywallCard, kortet "Premium tar bort taket", testplattan på /priser, steg 3 i registreringen |
| **Nivån räknas bara på uppgifter du inte sett den senaste månaden** | settInomFonstret, 30 dagar | En mening, inget tal behövs. "Nivån visar vad du kan, inte vad du minns." | Testväggen, Tester-gratisraden, Play-butiken, FAQ |
| **Fler sorters uppgifter i varje testtyp** | Klocka, kroppar, snitt och spegling, sanningssägare och lögnare, tabellpussel, syllogismer, grupper och streckfigurer | Exempelbilder, alltså skärmbilder av en riktig uppgift. Ingen lista i löptext. | Typkorten på testsidan, Play-bilderna (efter frysen) |
| **Träna så ofta du vill** | Inget tak för Premium i koden | Ord, ersätter "ett pass om dagen" | TypProvKort, mejlen, registreringen, Play |

**Regler för talet:**

- Skriv "över 3 000", inte 3 533. Banken ändras när uppgifter pensioneras, och avrundat nedåt till närmaste 500 håller talet ändå.
- Talet ska komma ur en konstant som räknas fram från poolerna, och ett vitest ska vakta att det håller, på samma sätt som ANTAL_TESTTYPER. Bankerna är serverkod, så konstanten räknas vid bygget och skrivs in som ett tal. Den importeras inte i klientens JavaScript.
- Lova aldrig "aldrig samma uppgift", "inte samma på flera veckor" eller "ny uppgift varje gång". Karensen är en vecka, och vid slutet av poolen kommer det äldst sedda tillbaka. Verbalt och numeriskt har minst antal underlag (36 till 48 per nivå), och där skulle ett sådant löfte brytas först.
- Ägarens exempel, skrivet om så att det håller: **"Över 3 000 uppgifter. Nivån räknas bara på dem du inte sett den senaste månaden."**

**Mest nytta inför Black Week:** testväggen i PaywallCard och mejlet. 7 av 9 köp går via testvägen, och mejlet når alla gratiskonton som kan få 99 kr. Därefter kommer kortet "Premium tar bort taket" på testsidan och TypProvKort, eftersom /prova och testklustret är de största ytorna.

---

## 3. Prioritering

Frysen gäller komponenter från 23 till 30 november, och mejlet skickas från koden den 23. Allt i "Före 23 november" ska alltså vara på main senast söndag 22 november, efter QA i riktig webbläsare enligt reglerna.

### Före 23 november

| # | Yta och fil | I dag | Förslag |
|---|---|---|---|
| F1 | Black Week-mejlet, campaign-kampanj.ts, stycke 2 | "Vill du ha struktur lägger vi upp ett pass om dagen fram till ditt provdatum." | "Vill du ha struktur lägger vi upp träningen fram till ditt provdatum. Du tränar på din nivå så ofta du vill, i över 3 000 uppgifter, och nivån räknas bara på det du inte redan sett." |
| F2 | Cyber Monday-mejlet, stycke 2 | "Gör övningsprovet med tid, se var du tappar poäng och få ett pass om dagen tills det är dags på riktigt." | "Gör övningsprovet med tid, se var du tappar poäng och träna på din nivå tills det är dags på riktigt." |
| F3 | PaywallCard testniva, brödtext | "Premium ger alla åtta testtyperna på alla nivåer, träning varje dag, övningsprov mot klockan och det fördjupade personlighetstestet." | "Avancerad och expert i alla åtta testtyperna, övningsprov mot klockan och det fördjupade personlighetstestet. Nivån räknas bara på uppgifter du inte sett den senaste månaden." Talet "3 000+" visas som bild i Nio-blocket ovanför, inte i texten. |
| F4 | PaywallCard testniva, sekundärknapp | "Kör grundnivån igen" | Står kvar när grundKvarIdag är större än 0. Annars "Se vad som ingår". |
| F5 | TypProvKort.tsx, paketraden i alla fem | "Avancerad och expertnivå, ett träningspass om dagen och övningsprovet mot klockan ingår i Premium, 149 kr i månaden." | "Avancerad och expertnivå, träning så ofta du vill och övningsprovet mot klockan ingår i Premium, 149 kr i månaden." För I-provet: "Halva och hela I-provets övningsprov, avancerad och expertnivå och träning så ofta du vill ingår i ..." |
| F6 | Hem, hemData.ts och copy.ts | "Nio tester, alla öppna" och "9 testtyper, 3 mätta, alla öppna" | antalTesttyper räknar bara de synliga typerna (8). Rubrik: "Åtta testtyper och personlighetstestet". Navrad: "Åtta testtyper, 3 mätta". Mobil: "Åtta testtyper". |
| F7 | /priser rad 171 och reklam-copy.ts rad 260 | "Grundnivån i alla nio" och "Grundnivån gratis i alla nio" | "Åtta testtyper och personlighetstestet". Bilden visar fortfarande nio. aria-texterna "Nio testtyper" byts samtidigt till "Åtta testtyper och personlighetstestet". |
| F8 | Testsidan, kortet "Premium tar bort taket" | "Alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och hela din resultathistorik, 149 kr i månaden." | "Alla nivåer i över 3 000 uppgifter, övningsprov mot klockan, det fördjupade personlighetstestet och hela din historik." Priset läses via KampanjVarianter så att det följer Black Week, som PremiumBlock redan gör. |
| F9 | Play-butiken, butikstexter.md, avsnittet PREMIUM och "VAD DU FÅR" | "Nivåkollen och dagens grundpass är gratis. Premium låser upp alla testtyper, passen på din nivå ..." | "Nivåkollen är gratis och ger dig din nivå på åtta minuter. Sedan gör du ett grundnivåtest om dagen gratis, i valfri testtyp. Premium öppnar avancerad och expert i alla testtyper, träning på din nivå så ofta du vill, övningsproven och hela kurvan. Vi har över 3 000 uppgifter, och nivån räknas bara på dem du inte sett den senaste månaden." Punkten om pass byts till "Tio minuter om dagen på din nivå räcker långt." Det är ingen komponent, men ägaren lägger in texten i Play Console. Den fullständiga beskrivningen ska fortfarande hålla sig under 4 000 tecken. |

F3 och F8 kräver det nya bildelementet för talet. Hinns det inte före söndag går texterna i F3 och F8 ut utan talet ("Nivån räknas bara på ...") och bilden kommer efter frysen. Talet ska inte stå i löptext på väggen.

### Efter frysen (från 1 december)

| # | Yta | Förslag |
|---|---|---|
| E1 | Bildelementet "Banken" (stort tal och åtta staplar) och konstanten ANTAL_UPPGIFTER med vitest | Skissas av art-director och godkänns i en artefakt. Används sedan på /priser (testplattan), i steg 3 av registreringen och i SLUT.test. |
| E2 | Testsidans typkort och guidelänk för spatial | "Rumsuppfattning: vridna och speglade figurer, pappersvikning, tärningar och kroppar sedda från olika håll. Tre av de sex deltesterna i I-provet bygger på förmågan." Kör SEO-diffen, eftersom schemat på rad 314 räknar upp samma saker. |
| E3 | Testsidans typkort för deduktivt | "Villkor i text och en fråga om vad som måste gälla, från om och så till logiska pussel med sanningssägare och lögnare. Övningsprovet har samma antal uppgifter och samma tid som SHL Verify deduktiv." |
| E4 | Registreringens steg 3, rad 234 | "Grundnivån i alla testtyper är gratis med kontot. Att träna på din nivå så ofta du vill ingår i Premium." |
| E5 | FAQ "Är testerna gratis?" och den långa meningen på /priser | Lägg till "ett grundnivåtest om dagen, i valfri testtyp". Saas-lead avgör om den kanoniska GRATIS_TESTRAD ska få samma tillägg. Läs först av kvot_slut_visad från v4-veckan. |
| E6 | Ordet "pass" på publika ytor (testsidans hjälte "per pass", "Rapport efter varje pass", "pass för pass" på /priser och i FAQ) | Byts till "test" eller "omgång" i ett svep med SEO-diffen. |
| E7 | Play-bilderna 1 och 3 samt den korta beskrivningen | Den korta beskrivningen: "Öva rekryteringstest: matriser, figurserier, deduktivt, numeriskt och I-provet" (80 tecken, kontrolleras med node-skriptet). Bild 1 tas om med de nya uppgiftstyperna och utan "pass". |
| E8 | Tester-gratisraden (lib/tester/v4/copy.ts GRATISRAD) | Raden "Proven ligger på avancerad nivå" har inget belägg i koden eller i facit. Antingen beläggs den eller så byts den mot mätregeln. |

### Det som står sig

Kanoniska gratis-copy.ts, ANTAL_TESTTYPER (8), steg 1 i registreringen ("Åtta testtyper och personlighetstestet") och HELA_PAKETET_RADER. Alla åtta typer har expertnivå i testConfig, så "i tre nivåer" stämmer.
