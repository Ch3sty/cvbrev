# Granskning av konceptet Formkurvan

Datum 2026-10-10. Granskare: testansvarig. Granskat: `docs/design/koncept-testvy-2026-10-10.html` mot `docs/design/brief-testvy-2026-10-10.md`, mot koden (`src/lib/tests/sessionGate.ts`, `src/lib/quota/quotaService.ts`, `src/lib/plans/plans.ts`, `src/app/api/logicTestV4/`, `src/lib/logicTestV7/`) och mot hur testträning fungerar. Filen är inte ändrad. Ägaren beslutar om pris, paket och vad som ingår gratis; här står min rekommendation.

## 1. Vad som håller

- Grundidén är rätt och hela vägen genomförd: datumet som rubrik, Dagens pass som enda bläckyta inom första skärmhöjden, kurvan som bevis, de sju modulerna i fast ordning. Alla tio tillstånd finns ritade för mobil, inget visar streck, "0 %" eller en tom graf.
- Grep-listan ger noll träffar: inga em-dash i text, ingen Sparkles, inga lucide-ikoner i navet, inga gradienter, procent bara i CSS. Högst tre orange per skärm hålls och räknas synligt per ram.
- Spelmomenten är vuxna: serien som ord och luckor, milstolpar som prickar, nivåförflyttningen i resultatets tre tal, inget poängsystem. Personlighetstestet står utanför allt detta i varje ram, med meningen att det inte finns rätta svar.
- "Samma format som" används konsekvent, inga logotyper, och konceptet flaggar själv att Matrigmas 35 på 40 min är tredjepartsuppgift.
- Resultatet efter passet (2a) är den bästa skärmen: rubriken säger vad som hände, tidsprofilen med provets linje gör tempot begripligt, och "I morgon: samma familj en nivå upp" ger skälet att komma tillbaka utan att be om det.
- Växlaren i navet är korrekt tolkad, och korsreferenserna som rader är rätt.

## 2. De fyra medvetna avvikelserna

1. **Ingen scen i Träningen, kurvan är bilden.** Godkänns. Regeln är en bild per vy, och en bild som bär data slår en som pryder. Villkor: tillståndet Ny (1a) har då ingen bild alls, och det är den första skärm varje ny användare ser. Där ska kurvans ram ändå finnas så fort ett datum är satt: tidslinjen från i dag till provdagen med de planerade ommätningarna som ihåliga märken och meningen "Din första punkt kommer efter mätningen" inuti ramen. Det är inte en tom graf, det är planen, och det är den som ska få henne att trycka på Mät min nivå.
2. **Kurvan på papper, inte på bläck.** Godkänns utan villkor. Handlingen är bläckytan, kurvan får andas, och kontrasten orange på papper är bättre än orange på svart.
3. **Genomgångsraderna förutsätter ett fält per distraktor.** Godkänns som målbild, med två krav. Bygget måste rendera raden utan meningen "Du valde alternativet som ..." tills fältet finns, så inget påhittas. Och fältet är billigare än briefen antydde: generatorerna (`gen-advanced-pool.mjs`, `gen-expert-pool.mjs`) bygger distraktorerna som near-miss där exakt en dimension ändras, så vilken dimension som gick fel är känd vid genereringen och kan skrivas ut maskinellt ("bara roterar, fyllningen byter inte"). Det blir ett fält `misstag` per alternativ i V7-bankerna, jag äger innehållet, valideringskedjan körs som vanligt.
4. **Axeltexten 11 px i SVG.** Godkänns på mobil (320-enheters viewBox i 343 px bredd ger knappt 12 px renderat). Problemet är datorn: samma SVG skalas till kolumnbredden, så texten blir 17 px och prickarna växer. Krav till bygget: axeltexten ska rendera 11 till 12 px vid både 343 och cirka 520 px bredd, alltså antingen två viewBoxar eller etiketterna i HTML utanför SVG:n. Aria-label som läser ut talen behålls.

## 3. Motsägelsen om gratisnivån

Den kommer ur min brief, inte ur konceptet. Briefens tillståndstabell (avsnitt 4, raden Gratis) säger att passet dag 2 leder till betalväggen; briefens avsnitt 7 säger "ett pass per dag på grundnivå" ingår gratis, oförändrat mot dagens kvot (`DAILY_LIMIT_TEST_SESSIONS = 1` i `quotaService.ts`, grundnivån fri i `sessionGate.ts`). Art-director har ritat båda. Jag tar ansvar för felet och rättar briefen.

**Rekommendation: avsnitt 7 ska gälla.** Ett pass om dagen på grundnivå är gratis, varje dag. Skälen:
- Måttet vi mest behöver flytta är dag 2-återkomsten (2 av 37). En rytm som låses dag 2 är ingen rytm, det är en provperiod, och den ger ingen vana att sälja in sig i.
- Grundnivån är SEO-landningen och kostar oss ingenting. Kvoten finns redan i koden.
- Betalväggen blir ärligare och starkare: den som mätt till nivå 5 eller 6 får grundpass som ligger under hennes nivå. Lätta uppgifter rätt är svagt bevis och flyttar nivån lite eller inte alls, vilket är sant mätmässigt. Raden "Grundpassen flyttar sällan nivån när du redan är över 4. Passen på din nivå ingår i Hela paketet" är ett säljargument som håller för en rekryterare.
- Det som kostar är då: pass på din nivå, riktade pass, ommätning var sjunde dag, historiken i kurvan, provläget och generalrepetitionen. Persona A köper för generalrepetitionen, persona B för passen på sin nivå. Ingen av dem köper för grundpass.

Konsekvens för konceptet: 1f ritas om. Bläckytan säger "Dagens pass, grundnivå" med en vit knapp som startar, och under linjen raden "Passet på din nivå, 5, riktat mot rotation med fyllningsbyte, ingår i Hela paketet, 149 kr i månaden" som textlänk till arket. Kurvan i 1f får då punkter för grundpassen, men gråa platser för ommätningarna. Raden i 4a står kvar som den är.

Om ägaren i stället vill ha briefens tabellrad (låst dag 2) ska 4a:s sista rad strykas och säljtexten i 1f stå kvar. Det är ägarens paketbeslut; min rekommendation är ovan.

## 4. Paketnamnen

"Hela paketet, 149 kr i månaden" i arket är rätt. `PLANS.name` för `all_month` är `HELA_PAKETET`, namnet följs av pris och period, verbet är Köp, Dagspasset står först i betalväggen enligt designsystemet. "Allt-månaden" i ägarbeslutet och i min brief är arbetsnamnet från 24 september och ska inte stå i gränssnittet. Jag rättar briefen.

Tre fel i samma ark och ram:
- "Allt till midnatt" under Dagspasset är fel. Dagspasset är 24 timmar från köpet (`grantDays: 1`, "Gäller i 24 timmar" i plans.ts). Ska vara "Allt i 24 timmar".
- Knappen i 1f "Lås upp passen, 149 kr i månaden" ska heta "Köp Hela paketet, 149 kr i månaden", samma som arket. Paketknappar har namn, pris och verbet Köp.
- Låschipen "Hela paketet" på Provdagen-raden är i sig tillåten (samma mönster som sidomenyns gråa val), men den säger inte vad raden ger. "Ingår i Hela paketet" läses bättre och är lika kort.

## 5. Nivåskalan 1 till 10

Går den att räkna fram? Ja, i tre steg, och delvis redan i dag.
- Underlaget finns: varje svar lagras med `questionId`, `selectedIndex`, rätt och `time_spent` (`/api/logicTestV4/answer`). P-värden per fråga räknade jag i briefen ur samma data.
- Skattningen: varje fråga får en uppmätt svårighet ur p-värdet (lagras i banken och uppdateras). Nivån efter en mätning är ett svårighetsviktat mått på vad hon klarar, mappat monotont till 1 till 10. Ett pass uppdaterar nivån som ett glidande medel med tak 0,5. Det är inte riktig IRT och behöver inte vara det med våra volymer; det ska vara stabilt och förklarbart.
- Taket 0,5 per pass är rätt idé av fel skäl: med nio frågor är ett passets egen upplösning en nionde-del, så decimalen är en utjämnad skattning, inte en mätning. Ommätningen (12 adaptiva frågor) sätter en punkt med större vikt, vilket konceptet redan visar som större prick. Säg det i den fulla kurvans förklaring: "Pass flyttar nivån lite i taget, ommätningar mer."

Två varningar som ska in i briefen och i exemplen:
- Skalan är okalibrerad i toppen. Medianen är 13 till 14 av 15 på alla tre nivåer; vi har inte frågor som skiljer nivå 8 från 10. Milstolpen "nivå 8" och exempelvärden över 7,5 ska inte visas förrän banken har mätbart svårare frågor. Konceptets 7,1 och 7,2 går an.
- Exemplen lovar för mycket. +1,0 på fyra pass och +2,1 på två veckor är överkanten för flytande resonemang. Vinsten av träning är främst igenkänning, strategi och tempo. Rita 5,0 till 6,4 på två veckor och låt en punkt dippa. Och nivån måste kunna sjunka utan rött: tillståndet "Nivån står kvar" och "6,2 till 6,0" i 2a är inte ritat och måste ritas.

Siffrorna i 1b går inte ihop: fyra punkter inklusive mätningen, "4 pass gjorda" och "Fem dagar i rad" med dagens pass kvar. Ägaren läser dem bokstavligt, så de ska stämma: mätning plus tre pass är "3 pass gjorda, fyra dagar i rad".

## 6. Tempot "38 s per fråga, provet ger 68"

68 är rätt räknat (40 min på 35 uppgifter) men fel sak att visa som huvudtal, av tre skäl.
- Budgeten beror på formatet hon valt: klassisk Matrigma 68 s, Alva Logic 120 s per uppgift, SHL Verify 90 s, Aon scales ix 15 s, adaptiv Matrigma har ingen fast budget per uppgift. "Vet inte" och "Annat" måste få en standard (vårt eget provläge: 18 på 25 min, 83 s), och det tillståndet är inte ritat.
- Ett snitt över ett pass med 60/20/20 i svårighet domineras av de lätta frågorna. 31 s mot 68 i 1c får henne att se dubbelt så snabb ut som hon behöver vara, vilket tar bort skälet att träna tempo. Och i ett prov med total tid, som klassisk Matrigma, får man lägga två minuter på en svår uppgift om man tar igen det på lätta.
- Raden "Rätt men långsam: speglingar, 66 s, provet ger 68" motsäger sig själv: 66 är under budget.

Rätt sätt: huvudtalet under kurvan är antal över budget, "2 av 9 över provets tid", och snittet står som undertext. Tidsprofilen i 2a med den streckade linjen är redan rätt bild, bygg vidare på den. "Långsam" definieras som över budget, eller över 1,5 gånger medianen för frågans svårighet när formatet saknar budget per uppgift. Tempot ska också mätas på frågor nära hennes nivå, inte på de säkra. Och passet måste visa den lugna tidsraden per fråga som briefen kräver, annars är tempot inget hon kan påverka under passet.

## 7. Räcker gamification-dosen?

Ärligt svar: hemvyn är rätt och vuxen, men konceptet är ritat där användaren tillbringar tjugo sekunder om dagen, inte där hon tillbringar tio minuter. Ägarens krav på mer polish och engagemang avgörs i passet, i mätningens resultat och i vad kurvan siktar på. Där är konceptet tyst.

Vad som saknas, i ordning, utan att bryta en enda regel:
1. **Ett sikte på kurvan.** Linjen går uppåt mot ett lodrätt streck och inget mer. Utan mål finns ingen spänning dag för dag. Låt henne sätta en siktnivå ("Sikte: nivå 7 före 24 oktober", vårt förslag ur formatet, ändringsbart) som ritas som ett vågrätt streckat band fram till provlinjen. Varje dag syns avståndet. Det är det starkaste enskilda greppet, det går att förklara för en rekryterare, och det får aldrig formuleras som vad arbetsgivaren kräver.
2. **Planen som synlig struktur för alla, inte bara i betalväggen.** De gråa dagplatserna i 1f är det bästa i konceptet och används bara som spärr. Rita framtida dagar som ihåliga märken längs kurvans botten för alla, med vilodagarna som luckor och ommätningarna markerade. Serien blir då något man fyller, inte ett ord i huvudet.
3. **Passet självt.** Fråga, svar valt, rätt eller fel med regeln, nästa, sista frågan till resultatet. Inte en ram ritad. Här sitter polishen: hur regeln avslöjas, hur tidsraden går, hur fråga nio glider över i de tre talen. Måste ritas före bygge.
4. **Nivåmätningens resultat.** Briefens betalvägg nummer ett och det ögonblick båda veckoköparna köpte i. Konceptet beskriver den i text men ritar bara arket från provläget. Måste ritas: nivå, tempo, två familjer, planen till datumet med dag 2 och framåt gråa.
5. **Milstolpens kvitto och ommätningsdagen.** Beskrivna, inte ritade. Ommätningen var sjunde dag kan vara veckans ritual ("Söndag: ommätning, 8 minuter") med före och efter i samma ram.
6. **Rörelsen ska vara en händelse, inte en vana.** Kurvan som ritar sig vid varje entré blir tapet på en vecka. Rita den när en ny punkt tillkommit sedan sist, annars står den stilla. Dagens prick som fylls när passet sparats är rätt dos.

Med 1 och 2 på hemvyn och 3 och 4 ritade är dosen tillräcklig för ägarens krav. Det som inte ska läggas till: poäng, ligor, märken, ljud, konfetti, nedräkning som räknar.

## 8. Växlingen för den som inte är här för tester

Läget fungerar som idé: navet säger alltid var man är, Jobbsöket är oförändrat i innehåll, och den som registrerade sig för CV landar i Jobbsöket enligt briefens öppna fråga 1. Tre saker brister.
- **Ordet "Träningen" i navet** förutsätter att man vet vad man tränar. För en CV-användare är första navplatsen ett frågetecken. "Testträning" ryms på samma plats och säger vad det är; "Träningen" kan stå kvar som rubrik inne i läget. Ska avgöras av copywritern och helst provas på någon som aldrig gjort ett test.
- **Korsreferensraden i Jobbsöket** ("Nivå 6 i matrislogik, 14 dagar till Matrigma") finns bara för den som har en nivå. Tillståndet för den som aldrig mätt är inte ritat och måste bli: "Har du ett rekryteringstest på gång? Mät din nivå, 8 minuter." Det är dessutom vår enda väg in i testerna för CV-spåret.
- **Sökta tjänster förlorar sin navplats.** Trackern är gratis för alla och var skälet många öppnade appen. Att den är Jobbsökets första modul räcker troligen, men det ska mätas (öppningar av trackern före och efter).

## 9. Övrigt som ska rättas före nästa runda

- 1b: "Fem dagar i rad" vid ett pass kvar, "4 pass gjorda" vid tre pass. Räkna om.
- 1f: "En dag i rad" är ingen serie. Visa serien från två dagar.
- 2a: "Passet i morgon ligger klart klockan 06" lovar en tidpunkt vi inte har en mekanism för. Skriv "I morgon: samma familj en nivå upp" utan klockslag tills push eller schemaläggning är beslutat.
- Matrigma-formatet: leverantören kör i dag främst adaptivt (cirka 12 min) enligt briefens bevakning. Inställningen behöver "klassisk, adaptiv, vet inte" för Matrigma, annars repeterar hon fel format.
- Inställningen för test och datum: en rad som säger att leverantörsnamnen är deras varumärken och att vi inte samarbetar med dem.
- Tillståndet Inför provdagen för gratisanvändare är inte ritat: generalrepetitionen är låst, och det är där Dagspasset ska säljas med raden "Provet är i morgon? Dagspasset räcker."
- Datorn är ritad för ett tillstånd per läge. Räcker för konceptet, men Ny, Gratis dag 2 och Provdagen behöver dator före bygge.

## 10. Mina svar på de sex besluten i avsnitt 6

1. **Navet eller läget.** Navet. Fyra platser: Testträning (eller Träningen, se avsnitt 8), Jobbsöket, Skapa, Profil. Växlaren i toppraden med eget bottennav per läge behöver inte ritas ut; den döljer läget och gör navet tvetydigt.
2. **Rubriken är ett datum.** Ja. "14 dagar till Matrigma" är hela produkten i fem ord. Hälsningen stannar i Jobbsöket. Utan datum: "Träningen" med raden "Sätt ett datum så räknar vi bakåt", aldrig som spärr.
3. **Kurvan på papper.** Ja. Med sikte och dagsrad enligt avsnitt 7, annars är den en linje mot ett streck.
4. **Leverantörsnamnen.** Ja till namn i inställningen, hemvyns rubrik, provraden och arket, bara antal och tid i provets egen skärm. Lägg till varumärkesraden i inställningen.
5. **Serien med vilodag.** Ja, exakt som ritad: ord i huvudet, luckor i kurvan, paus två dagar före provet, "Serien börjar om i dag" och inget mer. Visa den från två dagar.
6. **Frågan efter provet.** Ja, med villkoren: frivillig, raderbar, syns en gång och efter sju dagar vid "vet inte än", lagras som ett fält på provdatumsposten och tas bort när posten tas bort, används bara för att styra nästa rad och för mätpunkten `efter_provet_svar`. Aldrig i Bli upptäckt eller mot rekryterare.

## 11. Vad jag ändrar i briefen

- Avsnitt 4, raden Gratis: "Ett pass om dagen på grundnivå gratis varje dag. Passet på din nivå, riktade pass, ommätning, historik och provläge ingår i Hela paketet." (efter ägarens beslut)
- Avsnitt 7: "Allt-månaden" ersätts med "Hela paketet, 149 kr i månaden" överallt.
- Avsnitt 5, Nivå: lägg till att skalan är okalibrerad över 7,5 tills banken har svårare frågor, att nivån kan sjunka och visas neutralt, och siktnivån som valfritt mål.
- Avsnitt 5, Tempo: huvudtal "antal över provets tid", snitt som undertext, standardbudget för "Vet inte", mätning på frågor nära nivån.
- Avsnitt 3 och 4: passet, nivåmätningens resultat, milstolpens kvitto och ommätningsdagen som egna skärmar att rita.
- Avsnitt 8: fältet `misstag` per alternativ genereras av generatorerna, inte för hand.

## 12. Ägarens reaktion, och den väger tyngst

Ägaren har sett konceptet och sagt två saker.

**"Kommer användarna förstå Matrigma osv? Alla kanske inte har blivit testade innan."** Rätt invändning, och den träffar både briefen och konceptet. Vi byggde ingången på leverantörsnamn för att artikeltrafiken söker på dem, men den som kommer från registreringen eller från en CV-artikel har ofta bara ett mejl med "ett test ingår i processen". Ingången görs om, se avsnitt 13.

**"Designen är i mångt och mycket samma sak, svart, vitt, beige, inte så mycket custom svgs. Den känns platt, inte så professionell eller premium. Har test-agenten och art-director verkligen enats om detta?"** Ärligt svar: nej, vi har inte enats. Min brief låste konceptet till Tråden v2.1 (en bläckyta, en scen, inga nya färger, inga gradienter, högst tre orange) och art-director ritade lojalt inom den ramen och lade till moduler och funktion. Resultatet är en korrekt dashboard, inte ett rum man vill vara i. Det är mitt ansvar att briefen inte gav utrymme, och det är art-directors och mitt gemensamma uppdrag att göra om det. Allt i avsnitt 1 till 11 står kvar som funktionskrav; avsnitt 13 är runda 2.

## 13. Uppdrag till art-director, runda 2: Träningen som eget rum

Från testansvarig, efter ägarens reaktion 2026-10-10. Ersätter briefens avsnitt 4 (mall) och de delar av avsnitt 5 som handlar om utseende. Funktionskraven i briefen och rättelserna i den här granskningen gäller.

### Vad som ändras i ramen

Träningen får vara ett eget, mer påkostat rum. Den får bryta mot Trådens regler om inga nya färger, inga gradienter och inga märken där brottet ger en premiumkänsla. Den ska fortfarande kännas som samma produkt (samma typsnitt, radier, knapphöjder, nav, samma svenska) och vara vuxen. Jobbsöket förblir Tråden. Övergången mellan rummen ska kännas som att gå från kontoret till gymmet i samma byggnad, inte som att byta app.

### Ingången, i vanligt språk

Första frågan handlar om vad hon ska göra, inte vem som gör det.

1. "Vad ska du testas på?" med val som ser ut som det de är, varje val med egen illustration: Figurer och mönster, Siffror och tabeller, Ord och text, Personlighet, Vet inte. Flera val tillåtna. Det styr testtyp och planen.
2. "Vet du vem som gör testet?" Frivillig. Ledtråd under: "Namnet står ofta i kallelsen, i länkens avsändare eller i rekryterarens mejl. Till exempel Assessio eller Matrigma, Alva Labs, SHL, Aon eller cut-e." Val: de fyra formaten, Annat, Vet inte. Det styr bara provformatet, och "Vet inte" ger vårt eget provläge.
3. "När är provet?" med Hoppa över synligt.

Rubriker när leverantören är okänd, så att inget tillstånd kräver ett namn:

| Tillstånd | Med leverantör | Utan leverantör, typ känd | Utan både |
|---|---|---|---|
| Mitt i träningen | 14 dagar till Matrigma | 14 dagar till logiktestet | 14 dagar till provet |
| Inför provdagen | I övermorgon: Matrigma | I övermorgon: logiktestet | I övermorgon: provet |
| Provdagen | I dag: Matrigma | I dag: logiktestet | I dag: provet |
| Efter provet | Hur gick Matrigma? | Hur gick logiktestet? | Hur gick provet? |
| Provdagen-raden | Samma format som Matrigma: 35 uppgifter, 40 minuter | Vårt provläge: 18 uppgifter, 25 minuter. Vet du leverantören så byter vi format. | samma |
| Utan datum | Träningen, med raden "Sätt ett datum så räknar vi bakåt" | samma | samma |

Typerna i rubrik: logiktestet, siffertestet, texttestet. Personlighetstestet får aldrig en nedräkning med träningston; dess rad säger "Personlighetstest den 24 oktober. Inga rätta svar, men det hjälper att veta hur det tolkas."

### Mer egna SVG:er

- **Testtyperna som egna symboler**, ritade för oss: ett rutnät med en saknad cell, en tabell som blir en stapel, textrader med ett markerat ord, ett spektrum för personlighet. De används i ingången, i Fler tester, i passets topp och i kurvans små multiplar. Samma linjevikt och hörn överallt, så de läses som en familj.
- **Kurvan med djup och karaktär.** Yta under linjen med toning, dagens punkt med lyster, siktbandet fram till provlinjen, ommätningar som tyngre märken, framtida dagar som ihåliga märken, vilodagar som luckor. Ska fungera i mörkt och ljust läge och ritas serverrenderad.
- **Nivåvisningen** som ett eget instrument, inte ett tal i en lista: en skala 1 till 10 med din punkt och ditt sikte, läsbar på två sekunder, med ett ord om vad nivån betyder i provets termer.
- **Milstolpar som känns värda att nå.** Fem stycken (första mätningen, första veckan, nivå 5, generalrepetitionen, provdagen). Ett märke får vara ett märke: graverat, mattt, i en färg, aldrig tecknat, aldrig en samling att scrolla i. Kvittot är en egen lugn skärm med märket, datumet och en mening om vad det betyder.
- **Provdagen som ett ögonblick.** En egen skärm: datumet stort, uppvärmningen, de praktiska råden, kurvan vilar. Inget räknar, inget blinkar. Den ska kännas som morgonen före en tävling.

### Referenser, och vad vi tar därifrån

- **Oura.** Tas: det lugna mörka rummet, data med djup, en sammansatt dagsbild ("form" ur nivå, tempo och serie) och morgonens korta läge. Tas inte: poängen 0 till 100 som huvudtal, vi har en nivå och ett sikte.
- **Whoop.** Tas: tonen av en tränare som säger vad du ska göra i dag och varför, planen framåt, veckoöversikten. Tas inte: medlemsgemenskapen och jämförelser med andra.
- **Strava.** Tas: träningsloggen som kalender, kurvan över form över tid, den lilla kartan som vyns bild (hos oss kurvan). Tas inte: kudos, segment, allt socialt.
- **Apple Fitness.** Tas: ringen som fylls när dagens pass är gjort (vår dagspunkt), trendpilar per mått, utmärkelsernas tyngd och material. Tas inte: tre ringar, röda och gröna rop, delning.
- **Duolingo, det senare och vuxnare formspråket.** Tas: en tydlig dagsenhet, vägen fram till målet, lektionsslutet som iscensatt avslöjande i steg, serien med frysdag (vår vilodag). Tas inte: maskoten, XP, ligor, ädelstenar, liv, de skrikiga färgerna, notispress.

### Gamification, högre dos än i runda 1

Allt ska gå att förklara för en rekryterare. Dosen höjs med:
- siktnivå på kurvan och avståndet till den varje dag
- dagsringen som fylls när passet sparats, veckoöversikten med sju celler
- planen synlig: pass, ommätningar, generalrepetition, provdag, gjorda ifyllda
- ommätningen som veckans ritual med före och efter
- milstolpar med egen skärm och märke
- ett formord ("stigande", "stabil", "vilar") ur de senaste sju dagarna
- passets slut som avslöjande i steg: rätt av antal, nivån, tempot, i morgon

Aldrig: konfetti, ljud, poäng, XP, ligor, maskot, "bästa resultat", rankning, rött på en missad fråga, nedräkning som räknar. Personlighetstestet står utanför allt.

### Känslan av att avancera

Varje dag ska lämna ett spår som syns nästa dag. Dagsringen fylld, punkten på kurvan, avståndet till siktet mindre, formordet uppdaterat, nästa milstolpe närmare. Nivåvisningen ska visa var hon kom ifrån (mätningens punkt som svag markering) och var hon är, så förflyttningen är synlig i instrumentet självt och inte bara i kurvan. När nivån sjunker visas det lika lugnt, med ett ord om varför ("tre svåra i rad, det händer") och utan rött.

### Funktionskraven från granskningen som ingår i runda 2

1. Gratisnivån enligt avsnitt 3: ett pass om dagen på grundnivå gratis, passet på din nivå i Hela paketet, 1f ritas om (om ägaren inte beslutar annat).
2. Passet ritas från fråga till resultat: fråga x av y, den lugna tidsraden, svaret valt, regeln och misstaget avslöjas, nästa fråga, övergången från sista frågan till de tre talen.
3. Nivåmätningens resultat med planen till datumet och dag 2 och framåt markerade som Hela paketet.
4. Milstolpens kvitto som egen skärm, ommätningsdagen med före och efter, och tillståndet att nivån sjönk.
5. Kurvan med sikte och dagsrad för alla, rörelse bara när en ny punkt tillkommit.
6. Tempot som "antal över provets tid" med snittet som undertext, standardbudget när formatet är okänt.
7. Paketnamnen och Dagspassets 24 timmar enligt avsnitt 4, exempeltalen enligt avsnitt 5 och 9, korsreferensraden i Jobbsöket för den som aldrig mätt, navordet enligt avsnitt 8.

### Leverans och acceptans

- Ramar för Pixel 7 och dator, mörkt och ljust: ingången (tre steg), hemvyn i alla tio tillstånd, passet (fråga, svar, regel, sista fråga), passets resultat, nivåmätningens resultat med planen, milstolpens kvitto, provdagen, efter provet, arket. Jobbsöket ritas inte om.
- Nya tokens dokumenterade med namn och kontrast, SVG:erna inline och serverrenderade, inga bitmappar, LCP under 1,5 s på Pixel 7, CLS 0.
- Exempeltalen ska gå ihop (avsnitt 5 och 9) och inga nivåer över 7,5 i exempel.
- Grep-listan: aldrig em-dash, aldrig Sparkles, inga engelska gränssnittsord, "samma format som", inga logotyper.
- Designen godkänns av ägaren i artefakt före bygge, som förut.
