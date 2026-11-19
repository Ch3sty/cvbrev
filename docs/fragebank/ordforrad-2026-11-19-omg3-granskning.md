# Granskning: ordförråd omgång 3, version 4 (102 uppgifter)

Testansvarig, 2026-11-19. Underlag: `docs/fragebank/ordforrad-2026-11-19-omg3.md`, de 102 raderna med `fran_version: 4` i `src/lib/ordforradV1/bank*.json`, kandidaterna i `kandidater/hand-2026-11-19-omg3.json` (facit, distraktorer och exempel stämmer rad för rad med bankfilerna), granskningen av omgång 2 som standard, SO och SAOL via svenska.se:s sök-API (byggets cache plus egna uppslag för ett fyrtiotal ord: alla 15 Wiktionary-belägg, alla flaggade facit och den nya distraktorn nedan) och `scripts/ordforrad-verifiera.mjs --natet --fran 4`, körd själv. Bankfiler och skript är inte ändrade.

## Beslut

**Godkänt med villkor.** 101 av 102 facit är rätt betydelse i exemplet och belagda. Ett facit vilar på en betydelse som SO och SAOL inte har (inhibera). Inget uppslagsord och inget facit finns redan i banken som uppslagsord eller facit, och inga dubbletter inom omgången. Inga tankstreck och inga norvagismer ("i tillägg", "i forhold") i facittexter, misstagstexter eller exempel. Inga laddade eller stereotypa distraktorer. Formkontrollen på expert håller: bara attrahera och repellera delar led, och alla fyra distraktorer är också verb på -era.

28 id ska rättas före aktivering: ett facit (inhibera, med nytt exempel och en ny distraktor), fyra exempel (signifikant även med ny facittext), åtta facittexter till och 18 misstagstexter på 16 id som förklarar ordet med sig självt (inhibera står i båda tabellerna). Ingen uppgift behöver strykas, så id-numren står kvar.

## Rätta före aktivering: facit, exempel och facittexter

| Id | Problem | Rättelse |
|---|---|---|
| of-e-s-121 inhibera, hämma | SO inhibera: "förklara inställd". SAOL: "ställa in, annullera". Ingen av dem har betydelsen hämma, som bara finns i Wiktionary och synonymer.se och är lånad från engelskans inhibit. Den som kan ordet på svenska letar efter "ställa in" och hittar det inte. Distraktorn **frysa** kan dessutom läsas som "frysa ett ärende", alltså skjuta upp. | Facit **annullera** (står i SAOL:s definition av inhibera, finns inte i banken). Nytt exempel: "Arrangören inhiberade konserten med kort varsel." Handskriven facittext: "ställa in eller förklara ogiltig". Byt frysa mot **inventera** (SO verb, inte i banken). Misstagstext: "Inventera betyder gå igenom och förteckna det som finns." Analysera: se misstagstabellen. |
| of-e-s-99 signifikant, betydelsefull | Exemplet "en signifikant skillnad mellan grupperna" i en studie är den statistiska betydelsen (SO: "som knappast kan bero av slumpen", SAOL: "säkerställd, inte slumpmässig"). Där betyder signifikant just inte betydelsefull, och det är ett känt missförstånd. Facittexten "som har stor betydelse" förklarar betydelsefull med sig självt. | Nytt exempel i SAOL:s första betydelse: "Hon spelade en signifikant roll i förhandlingarna." Handskriven facittext: "som har stor vikt eller verkan". |
| of-e-s-114 kontradiktion, motsägelse | Facittexten "yttrande som bestrider tidigare yttrande" är SO motsägelse 1. Belägget (SO kontradiktion SYN motsägelse 2) och exemplet (två uttalanden som inte går ihop) gäller motsägelse 2. | Handskriven: "det att två påståenden inte kan vara sanna samtidigt". |
| of-a-m-82 ihålig, massiv | Facittexten "tung och kompakt" är SO massiv 1. Motsatsen till ihålig är massiv 2 (SO ihålig MOTSATS massiv 2). | Handskriven efter SO massiv 2: "helt igenom av samma material, utan hålrum". |
| of-a-m-87 allmän, enskild | "Allmän badplats" är SO:s underbetydelse "offentlig, samhälls-", som har motsatsen privat. Enskild är motsats till allmän 1 ("som omfattar alla i viss grupp"), och "en enskild badplats" säger ingen. Samma fel som underordnad i omgång 2. | Nytt exempel: "Kommunen ska ta hänsyn till allmänna intressen." Facittexten står kvar. |
| of-e-m-29 sekundär, huvudsaklig | "Priset var en huvudsaklig fråga för kunderna" är inte idiomatiskt. Paret håller (se Wiktionary-avsnittet), exemplet gör det inte. | Nytt exempel: "Exporten är företagets sekundära inkomstkälla." (huvudsakliga inkomstkälla är naturligt). |
| of-e-s-113 alternera, omväxla | "Alternerar om att leda mötena" blandar ihop alternera med turas om. "Omväxlar om att" går inte att säga. | Nytt exempel: "Regn och sol alternerade under hela veckan." Facittexten står kvar. |
| of-e-s-98 adekvat, träffande | Facittexten är SO:s text för träffande om ordvändningar ("som mycket väl (och målande) uttrycker ..."). Ett adekvat svar är inte målande. | Handskriven: "precis rätt för det som efterfrågas". |
| of-a-s-99 beakta, uppmärksamma | Facittexten "inrikta (sin) uppmärksamhet mot" förklarar ordet med sig självt. | Handskriven: "lägga märke till och ta hänsyn till". |
| of-a-s-109 rationell, förnuftig | "Präglad av förnuft" förklarar ordet med sig självt. | Handskriven: "klok och genomtänkt". |
| of-e-s-103 animositet, fiendskap | "Det att två parter är fiender till varandra" förklarar ordet med sig självt. | Handskriven: "stark ovilja och motsättning mellan två parter". |
| of-e-s-106 perception, varseblivning | "Det att bli varse något" förklarar ordet med sig självt. SO:s text fortsätter "med sinnenas hjälp", och det är den delen som förklarar. | Handskriven: "det att uppfatta något med sinnena". |
| of-a-s-102 tvist, dispyt | "Livlig diskussion" är avkortad. En livlig diskussion kan vara vänlig, en tvist är det inte. | SO dispyt i sin helhet: "livlig diskussion där parterna envist hävdar sina argument". |

## Rätta före aktivering: misstagstexter

Omgångsdokumentet säger att texter av typen "Nyfikenhet betyder det att vara nyfiken" är omskrivna. 18 finns kvar, och flera är samma typ som fluktuera och extrapolera i omgång 2. Texter där förklaringsordet är ett grundord alla kan (smärtsam "som medför smärta", rostig "angripen av rost", prickig, kryddig, kommunal) står kvar.

| Id | Nu | Rättelse |
|---|---|---|
| of-g-s-103 | Irritera betyder orsaka irritation hos. | Irritera betyder reta upp eller göra otålig. |
| of-g-s-104 | Tålmodig betyder som har tålamod. | Tålmodig betyder som kan vänta länge utan att bli otålig. |
| of-g-m-83 | Vinglig betyder som vinglar. | Vinglig betyder som står ostadigt och svajar. |
| of-a-s-104 | Grossist betyder person som bedriver grosshandel. | Grossist betyder företag som köper varor i stora partier och säljer dem vidare till butiker. |
| of-a-s-111 | Leverera betyder fullgöra leverans av. | Leverera betyder lämna över en vara till den som har köpt den. |
| of-a-m-83 | Mogna betyder bland annat bli mogen. | Mogna betyder bli färdig att äta eller skörda. |
| of-a-m-89, of-a-m-90 | Lyckad betyder som lyckats väl. | Lyckad betyder som blev så bra som man hade tänkt sig. |
| of-e-s-109 | Ansvarig betyder som har ansvar. Missnöjd betyder som känner missnöje. | Ansvarig betyder som ska se till att något blir gjort och står för följderna. Missnöjd betyder som tycker att något inte är tillräckligt bra. |
| of-e-s-111 | Entusiastisk betyder som känner entusiasm. | Entusiastisk betyder som visar stor iver och glädje inför något. |
| of-e-s-115 | Finansiär betyder person eller institution som finansierar något. Beställare betyder person eller organisation som beställer något. | Finansiär betyder person eller institution som står för pengarna till något. Beställare betyder person eller organisation som ger någon i uppdrag att leverera eller utföra något. |
| of-e-s-121 | Analysera betyder bland annat göra analys av. | Analysera betyder undersöka något noga genom att dela upp det i delar. |
| of-e-m-25 | Påminnelse betyder något som påminner om något. | Påminnelse betyder meddelande som får någon att komma ihåg något. |
| of-e-m-26 | Oxidera betyder utsätta för oxidation. | Oxidera betyder få ett ämne att reagera med syre, som när järn rostar. |
| of-e-m-27 | Avvikande betyder som klart avviker. | Avvikande betyder som tydligt skiljer sig från det vanliga. |
| of-e-m-28 | Kunnig betyder som har (stort) kunnande. | Kunnig betyder som vet och kan mycket inom något område. |

Efter rättelserna: kör `bygg-v4.mjs --torr`, kontrollera att alla 102 går igenom med oförändrade id, sedan skarpt, och sedan verifieraren med `--natet --fran 4`. Bygget prövar annullera och inventera mot alla fyra källor. Faller annullera på belägget, använd **avlysa** (SO: "förklara inställd", samma text som SO inhibera; SAOL: "ställa in"; inte i banken) med samma exempel.

## De 15 facit som bara har stöd i Wiktionary och synonymer.se

**14 godkända, ett rättas (inhibera, se ovan).** För nästan alla finns stöd i SO eller SAOL som byggets tolkning inte fångar, eftersom beläggen står i definitionstext eller i två steg:

* **prognos och förutsägelse:** SO prognos börjar "förutsägelse om kommande utveckling eller förlopp", SAOL "vetenskapligt grundad förutsägelse". I praktiken direkt SO-belagt; bygget missar det för att definitionen är lång.
* **ambiguitet och tvetydighet:** SAOL ambiguitet "flertydighet", SO har jämför mångtydighet. Tvetydighet är det vardagliga ordet för samma sak.
* **omfatta och inbegripa:** SO omfatta 1 har jämför innefatta, SAOL omfatta "innefatta", SAOL inbegripa "innefatta". Två steg genom innefatta i båda ordböckerna.
* **försynt och framfusig:** SAOL framfusig "oförsynt, påträngande". Nästan direkt belagt.
* **nomadisk och bofast:** SO bofast "särskilt i motsats dels till nomader". Belagt i SO:s definition.
* **högtidlig och vardaglig:** SO vardaglig "inte särskilt anmärkningsvärd, högtidlig eller dylikt". Belagt i SO:s definition.
* **gäst och värd:** SO värd "person som tar hand om inbjudna gäster". Belagt i SO:s definition.
* **expert och lekman:** SAOL lekman "person som inte är fackman", och SO expert har SYN fackman. Två steg.
* **succé och fiasko:** SO:s definitioner speglar varandra ("mycket stor framgång hos publik" mot "fullständigt misslyckande ofta när det gäller att fånga publikintresse").
* **sekundär och huvudsaklig:** svagast av dem. SO sekundär har jämför primär, SAOL "andrahands; underordnad", SO huvudsaklig "som utgör den viktigaste delen". Primär är det vanliga motsatsordet men finns inte bland alternativen, så inget konkurrerar. Godkänt med det nya exemplet ovan.
* **hemma och borta, söder och norr, vit och svart, kortvarig och långvarig:** självklara par där SO bara saknar MOTSATS-hänvisningen. Vit och svart står i ett exempel om en skjorta, och distraktorerna är färger och mönster, så ingen laddning.
* **inhibera och hämma:** underkänt. Här säger SO och SAOL emot källorna i stället för att bara sakna uppgiften. Regeln vi tar med oss: ett Wiktionary-belägg räcker bara när SO och SAOL inte har en annan betydelse för samma ord.

## Övriga punkter

* **Facit och distraktorer.** Utöver ovanstående hittade jag ingen distraktor som kan läsas som synonym eller motsats till ord eller facit, inte heller i en bibetydelse. Prövat särskilt: höjd vid avstånd, rostig och blank vid vass, färdig vid ledig, kostnadsfri och grund vid allmän, sorglig vid högtidlig, ärftlig vid dominant och fysisk, luktfri och giftfri vid mild, utdragen och trång vid stel, isolerad vid nomadisk, obestämd vid singular, klimat vid latitud. Inget av dem håller som motsats eller synonym.
* **Exempel i sak.** Uppsala (59,86 grader) och Oslo (59,91) ligger på samma breddgrad, Hamlet är en tragedi, magneter attraherar järn, ett dominant anlag räcker från en förälder och ett recessivt märks bara från båda, eteriska oljor är flyktiga, fyra är jämnt. Rätt.
* **Nivåer.** Banden håller. Skribentens flaggor för åkomma, förfärlig, sträv, trubbig och slak på grund godtas: alla är vanliga vuxenord och uppgifterna går att lösa genom uteslutning. Sannerligen (84 538) och alltjämt (97 835) ligger också under grundbandet men är lättare än åkomma. Mild och stel på expert godtas med samma motivering som skribenten ger (gräll och otvungen prövas).
* **Dubbletter.** Inget uppslagsord eller facit i version 4 finns som uppslagsord eller facit i version 1 till 3. Ett 40-tal distraktorer är uppslagsord eller facit i andra uppgifter, som i tidigare omgångar, och ingen av dem står i en uppgift där den krockar.

## Anmärkningar (inte blockerande)

* **Lätta för nivån.** Singular och plural, prognos och fackman på expert samt ihålig på avancerad är lättare än nivån. Inget är fel. Läs av andel rätt efter 30 dagar; över 90 procent på expert betyder flytta ned.
* **Motsatspar bland distraktorerna.** Stadig och vinglig (of-g-m-83), positiv och negativ (of-g-m-89), ofarlig och livshotande (of-e-s-108). Ingen av dem är motsats till ord eller facit, men den som letar motsatsord ser ett par och kan tveka. Undvik i nästa omgång.
* **Slak (of-g-m-86).** Facittexten "mjuk och böjlig (och utan stadga)" är SO:s text utan slutet "om något som normalt är spänt". Den passar en lina sämre. Byt om bygget ändå körs: "som hänger löst och inte är sträckt".
* **Hemma (of-g-m-79).** Alla fyra distraktorer är adverb som inte anger plats (kanske, precis, ofta, nästan), så borta är enda platsordet. Godtas på grund.
* **Hållning (of-a-s-107).** "Inställning eller förhållningssätt till något" innehåller hållning i förhållningssätt. Gränsfall, godtas.

## Verifieringen

`node scripts/ordforrad-verifiera.mjs --natet --fran 4`: version 4 har 102 uppgifter (grund 18 och 16, avancerad 18 och 16, expert 24 och 10), inte aktiverad, ORD_VERSION är 3. "Uppslag från version 4: 0 fel." Banken klarar V1 till V9. De fem anmärkningarna om falska vänner gäller version 1 och är kända sedan tidigare; version 4 ger inga.

Egna kontroller: dubbletter mot version 1 till 3 och inom omgången (inga), tankstreck och norvagismer (inga), bankraderna mot kandidatfilen (facit, distraktorer och exempel identiska för alla 102), facit- och misstagstexter som återanvänder ordets stam (fynden står i tabellerna ovan).

## Godkända utan anmärkning

Alla id som inte står i de två tabellerna under "Rätta före aktivering" är godkända: 74 av 102.

## Är aktiveringen säker?

Samma mekanik som version 3, och skribentens steg 2 till 5 i omgångsdokumentet stämmer. Antalen i det föreslagna `version4.test.ts`-blocket ändras inte av rättelserna, eftersom ingen uppgift stryks. Glöm inte changelogen: percentilen blandar version 1 till 4.

Aktivering: nej, rätta de 28 id:na i tabellerna ovan (facit för inhibera, fyra exempel, nio facittexter och 18 misstagstexter) och kör bygget och verifieraren igen.
