# Upplevelsebrief: den nya inloggade vyn med testerna i centrum

Datum 2026-10-10. Författare: testansvarig. Mottagare: art-director (visuellt koncept), mobile-ux-designer, saas-lead, ägaren. Ändrar ingen kod.

Underlag: ägarens beslut 2026-10-10 (minnet project_testfokus_2026_10_10), saas-leads analys `docs/rapporter/analys-utveckling-2026-10-10.md`, egna frågor mot `logic_test_v4_sessions` med ägarens och testkontona undantagna via `admin_undantagna_konton()`, koden i `src/app/dashboard/tester/`, `src/components/tests/`, `src/app/dashboard/(oversikt)/`, `src/lib/access/features.ts`, `src/lib/plans/plans.ts`, `src/lib/onboarding/komigang.ts`, samt konkurrentbevakning via webben (verifierat mot leverantörernas egna sidor där det anges, annars bedömning).

**Rättad 2026-10-10 kväll efter ägarens reaktion på konceptet Formkurvan.** Ingången (3.1), gratisraden (avsnitt 4) och paketnamnen (avsnitt 7) är ändrade nedan. Mallen i avsnitt 4 (en bläckyta, en scen, Trådens färgregler) gäller inte längre för Träningen: runda 2 ritas efter uppdraget i `docs/design/granskning-formkurvan-2026-10-10.md`, avsnitt 13, där Träningen får vara ett eget, mer påkostat rum. Funktionskraven i den här briefen står kvar.

Grundtes: köparna gick inte för att produkten var dålig, utan för att den tog slut. Tre nivåer om 15 frågor är klara på en kvart, nivåerna skiljer inte åt, och det finns inget skäl att komma tillbaka i morgon. Den nya vyn ska ge ett mål (provdatumet), en mätning (nivån), en rytm (dagens pass) och ett bevis (kurvan). Det är det användaren betalar en månad för.

## 0. Vad datan visar, 12 september till 10 oktober

| Mått | Värde | Källa |
|---|---|---|
| Startade logiktest grund, slutförda, unika konton | 58, 53, 45 | logic_test_v4_sessions |
| Snittpoäng grund, mediantid | 13,0 av 15, 4 min 56 s | samma |
| Grund med minst 13 rätt | 37 av 53 | samma |
| Avancerad slutförda, snitt | 7, 14,4 av 15 | samma |
| Expert slutförda, snitt | 5, 13,4 av 15 | samma |
| Alla tider: median grund, avancerad, expert | 13, 14, 14 av 15 | 125, 29 och 20 sessioner |
| Svåraste grundfrågorna (v7g-q25, q28) | 64 procent rätt | per fråga, minst 8 svar |
| Svåraste expertfrågan (v7e-b3) | 55 procent rätt, median 65 s | samma |
| Verbalt grund startade, slutförda, mediantid | 19, 10, 22 min | samma |
| Numeriskt grund startade, slutförda, mediantid | 10, 2, 45 min | samma, felet utreds separat |
| Konton med testaktivitet en dag, två dagar, tre eller fler | 42, 7, 2 (av 51) | svensk tid |
| Dag 2-återkomst (saas-lead) | 2 av 37 | analysen |

Slutsatser ur datan, inte gissning:
1. Nivåerna skiljer inte åt. Medianen är 13 till 14 av 15 på alla tre. Expert är inte expert. En nivåmätning kan inte byggas på dagens nivåetiketter; den måste bygga på frågornas uppmätta svårighet (p-värdena ovan finns redan att räkna på).
2. Grundtestet är klart på fem minuter och 70 procent når 13 eller mer. Ögonblicket efter är rätt ögonblick för provdatum och plan, inte för "nästa nivå".
3. Numeriskt och verbalt är långa (22 och 45 minuter) och tappar hälften eller mer på vägen. Ett pass på tio minuter måste alltså vara en egen form, inte ett helt test.
4. Nio av 51 kom tillbaka en andra dag. Det finns ingen rytm alls i dag.

Gissning, inte data: vi vet inte vilka leverantörer eller datum användarna har framför sig. Artikeltrafiken (alva-labs-logiktest, map-test-personlighetstest, matrigma) säger att Alva och Assessio dominerar, men ingen har frågat användaren.

## 1. Vem användaren är och varför hon kommer

Tre personas ur datan. Namnen är påhittade, beteendet är inte.

**A. "Provet om två dagar", Sara, 29.** Kallad till Alva Logic eller Matrigma i en traineeprocess. Hittade artikeln via Google, gjorde smakprovet med fem frågor, registrerade sig på kvällen. Gör grundtestet på fem minuter med 13 av 15 och vill veta en sak: är jag redo, och var tappar jag? Hon har två kvällar. Hon vill ha en nivå, en genomgång av det hon missade, och en generalrepetition i samma format som leverantören. Hon köper om vi svarar på frågan "räcker det här?". Hon är datans vanligaste konto (42 av 51 aktiva en enda dag) och båda veckoköparna.

**B. "Söker brett, vill bli vass", Jonas, 41.** Byter bransch, tre processer igång, vet att tester kommer men inte när. Vill träna tio minuter om dagen i några veckor och se att det ger effekt. Han använder också brev och jobbmatchning, men testerna är det han öppnar appen för. Han är Hela paketets månadskund, och den enda personan som ger löpande intäkt. Han finns i datan som de 9 som kom tillbaka en andra dag (i snitt 2,9 slutförda test) och som månadskunderna som förnyat 30 september, 2 och 9 oktober.

**C. "Svag på siffror", Amina, 34.** Kallad till SHL Verify eller Aons scales med numeriskt och verbalt. Logik går bra, siffrorna är problemet. Hon startar det numeriska testet, det tar 45 minuter, och hon lämnar det (8 av 10 lämnade). Hon behöver korta pass per deluppgift (läsa av tabell, procentförändring, andel) och förklaring per fråga. Hon är den persona dagens produkt sviker mest, och felet i det numeriska testet utreds separat.

Alla tre kommer i samma ärende: ett rekryteringstest hos en namngiven leverantör inom några dagar till några veckor. Ingen kommer för "tester" i allmänhet.

## 2. Konkurrensbilden

Verifierat mot leverantörernas sidor där inget annat anges. Prisuppgifter för JobTestPrep och Practice Aptitude Tests kommer ur andrahandskällor och ska kontrolleras innan de används utåt.

| Aktör | Vad kandidaten får | Format och realism | Förklaring per fråga | Progression, pass, provdatum | Svenska | Mobil |
|---|---|---|---|---|---|---|
| Alva Labs | Ingen övningsmiljö utanför en skarp process. Logic: adaptivt, 20 matriser, 2 min per uppgift, cirka 15 till 20 min, kan pausas. Resultat visas efteråt men inte mot rollprofilen. | Leverantörens eget | Nej | Nej | Troligen (bedömning) | Okänt |
| SHL | Ett fåtal gratis exempelfrågor (SHL Direct) för att vänja sig vid gränssnittet. Verify Interactive G+: adaptivt, 24 frågor, 36 min, interaktivt format. | Leverantörens eget | Bara på exempelfrågorna | Nej | Nej (bedömning) | Verify beskrivs som mobilvänligt (bedömning) |
| Aon, cut-e | Egna PDF:er med 5 till 8 övningsuppgifter per testtyp. scales ix: 20 uppgifter på 5 min. Numeriskt: 37 uppgifter på 12 min. Återkopplingsrapport går till arbetsgivaren. | Leverantörens eget | I PDF:en, i efterhand | Nej | Nej | Dåligt, PDF |
| Assessio, Matrigma | Ingen egen övningsmiljö för kandidater. Adaptiv Matrigma cirka 12 min; klassisk 35 uppgifter på 40 min (siffrorna ur tredjepartskälla). Resultat 0 till 10 (c-score) till arbetsgivaren. | Leverantörens eget | Nej | Nej | Ja, svenskt bolag | Okänt |
| JobTestPrep | Betalda frågebanker per leverantör (Matrigma, SHL, cut-e). Licens 3 till 7 dagar, 7 till 30 dagar, 1 till 3 månader. Matrigma-paket cirka 79, 89, 99 USD (andrahandskälla). | Efterliknar leverantörsformat | Ja | Nej, statiska banker med tidsbegränsad åtkomst | Delvis (jobbtestprep.se för vissa paket) | Okänt |
| Practice Aptitude Tests | Gratis: ett test per format med lösningar. Pro: alla 317 paket, resultatpanel. Pris cirka 29 GBP per månad eller 39 GBP per år (motstridiga andrahandsuppgifter). | Generiskt | Ja, alla frågor | Enkel resultatpanel, ingen kurva, inga pass | Nej | Okänt |
| Svenska aktörer: Test The Talent, SquidFactor, IQTesta | Övningspaket på svenska mot Matrigma, GIA, SHL med flera. SquidFactor har klassisk och adaptiv Matrigma. IQTesta gratis matristräning. | Efterliknar leverantörsformat | Varierar | Inte undersökt | Ja | Inte undersökt |

Var vi slår dem:
1. **Målet.** Ingen av dem frågar vilket test och när. Hela vår vy byggs runt provdatumet. Det är skillnaden mellan en frågebank och ett program.
2. **Rytmen.** Ingen har dagliga pass på tio minuter nära din nivå. Alla säljer åtkomst till en bank man betar av på en kväll, precis det våra köpare gjorde.
3. **Diagnosen.** Vi kan säga var du tappar (mönsterfamilj, tempo) och ge riktade pass. Konkurrenterna ger rätt eller fel plus en lösning.
4. **Svenskt och mobilt.** De internationella är engelska och PDF-tunga. De svenska är små. Ingen har en svensk, mobil, inloggad träningsmiljö med kurva.
5. **Helheten efter provet.** Brev, intervju, Jobbcoachen och matchning finns ett klick bort. Ingen konkurrent har nästa steg.

Var de slår oss i dag: fler frågor (JobTestPrep och Practice Aptitude Tests har hundratals paket mot våra 84 matrisfrågor, 12 numeriska och 24 verbala passager) och leverantörsspecifika format (vi har ett provläge per testtyp, inte per leverantör). De svenska aktörerna behöver en egen djupdykning i pris och mobil innan vi påstår något om dem.

## 3. Upplevelsen steg för steg

Skrivet som det ska kännas, med primär handling per steg. "Samma format som", aldrig "samma test".

**3.1 Första inloggningen efter registreringen.** Hon kommer från smakprovet i artikeln (fem frågor) eller från registreringen med valet "tester". Dagens flöde (valkommen, hämtkedjan, `/dashboard/tester/prov/[token]`) behålls men landar i träningsläget. Första skärmen är tre korta frågor i vanligt språk, inte en hubb, eftersom många aldrig har gjort ett rekryteringstest och inte vet vad leverantörerna heter. 1. "Vad ska du testas på?" med val som har egen illustration: Figurer och mönster, Siffror och tabeller, Ord och text, Personlighet, Vet inte (flera val tillåtna; styr testtyp och plan). 2. "Vet du vem som gör testet?" Frivillig, med ledtråden "Namnet står ofta i kallelsen, i länkens avsändare eller i rekryterarens mejl. Till exempel Assessio eller Matrigma, Alva Labs, SHL, Aon eller cut-e." Val: de fyra formaten, Annat, Vet inte; styr bara provformatet, Vet inte ger vårt eget provläge. 3. "När är provet?" med Hoppa över synligt. Rubriker och rader ska fungera utan leverantör: "14 dagar till logiktestet" när typen är känd, "14 dagar till provet" när inget är känt, och provraden "Vårt provläge: 18 uppgifter, 25 minuter. Vet du leverantören så byter vi format." Full tabell i granskningen avsnitt 13. Smakprovets fem frågor står som första punkt i kurvan. Primär handling: "Mät min nivå, cirka 8 minuter".

**3.2 Att sätta provdatum.** Går att göra när som helst från huvudet i träningsläget. Datum och leverantör ger tre saker direkt: dagar kvar i rubriken, ett provläge i leverantörens format (tid per fråga, antal, adaptivt eller fast) och en plan: nivåmätning i dag, pass varje dag, generalrepetition dagen före, vila på provdagen. Utan datum visas samma vy med "Sätt ett datum så räknar vi bakåt" som rad under huvudet, aldrig som spärr.

**3.3 Nivåmätningen.** Ersätter "grundtestet" som första handling. Cirka 12 matrisfrågor på 8 minuter, dragna över hela svårighetsspannet med de uppmätta p-värdena, svårare efter rätt svar (enkel adaptivitet i tre band räcker). Ingen förklaring under tiden. Resultatet är en nivå på en skala 1 till 10 (vår egen, inte leverantörens), ett tempo (sekunder per fråga mot provets budget) och "var du tappar": de två mönsterfamiljer med lägst andel rätt och de frågor som var rätt men långsamma. Därefter planen till datumet. Gratis att göra en gång; ommätning var sjunde dag ingår i paketet.

**3.4 Dagens pass.** Tio minuter, 8 till 10 frågor för matriser (median 20 till 30 sekunder på lätta, 55 till 65 på svåra i datan), 4 frågor på en passage för numeriskt, en passage för verbalt. Sammansättning: 60 procent nära nivån, 20 procent under (säkra), 20 procent över (sträck). Ett pass har ett tema som sägs i klartext ("Rotation i sektorhjul, nivå 6"). Under passet syns fråga x av y och en lugn tidsrad, ingen poäng. Primär handling i hemvyn är alltid "Starta dagens pass" tills det är gjort.

**3.5 Resultatet efter ett pass.** En skärm, tre tal: rätt av antal, nivåförflyttning (+0,2 eller "oförändrad"), tempo. Sedan genomgången fråga för fråga med regeln (finns i matrisbanken), förklaring (finns i numerisk och verbal bank) och vad distraktorn hon valde "stämde på" (saknas, se avsnitt 8). Sist: "I morgon: samma familj en nivå upp" eller "I morgon: ny familj". Sekundär handling: "Ett pass till" (betalande) eller "Visa kurvan".

**3.6 Veckan och provdagen.** Kurvan visar nivå per dag med provdatumet som lodrät markering. Var sjunde dag en ommätning på 8 minuter som sätter en ny punkt med större prick. Två dagar före provet byter hemvyn tillstånd: dagens pass ersätts av generalrepetitionen i leverantörens format (antal, tid, adaptivt, inga förklaringar förrän efteråt), och raden under säger "Dagen före: generalrepetition. Provdagen: tre uppvärmningsfrågor, inget mer." Provdagen visar bara uppvärmningen och en lugn rad om praktiska saker (tyst rum, dator, inte mobil om leverantören kräver det). Inga pass, ingen serie som bryts.

**3.7 Efter provet.** Dagen efter datumet frågar huvudet en gång: "Hur gick det?" med tre svar: gick vidare, vet inte än, gick inte vidare. Svaret styr nästa rad. Gick vidare: "Nästa steg är ofta intervju" och Inför intervjun blir primär handling, brev och Jobbcoachen i raden under; jobbsöksläget föreslås. Vet inte än: passen fortsätter i lägre takt, frågan återkommer efter sju dagar. Gick inte vidare: "Sätt nästa datum" och nivån står kvar. Här tar resten av Jobbcoachen över, och vyn säger det i en mening, inte med en kampanj.

## 4. Hemvyn för träningsläget

Mall: en display-rubrik, en scen, en bläckyta (InkPanel) per vy, högst tre ytor i samma vikt, tal bär mening via Fordelning (designsystem v2.1). Sidan serverrenderas med riktiga tal i första HTML, LCP under 1,5 s på Pixel 7.

Moduler i ordning, med siffror och skäl:

| # | Modul | Innehåll | Siffror | Varför här |
|---|---|---|---|---|
| 1 | Huvud | Display-rubrik med datumet som kontext: "17 dagar till Matrigma". Utan datum: "Träningen". Sammanhangsrad: nivå, serie, dagens pass kvar eller gjort. | Dagar kvar, Nivå (heltal), Serie (dagar) | Målet först. Allt annat läses mot det. |
| 2 | Dagens pass (bläckytan) | Tema, längd, nivå. En knapp. Efter passet: dagens tre tal och "Visa genomgången". | 10 min, 9 frågor, nivå 6 | Enda primära handlingen. Den ska gå att trycka på utan att läsa. |
| 3 | Kurvan | Nivå per dag, ommätningar som större prickar, provdatum som lodrät linje, målband. Under: tre tal. | Nivå (en decimal), Tempo (s per fråga mot provets budget), Pass gjorda | Beviset på att det rör sig. Ersätter procent per test, som slår i taket. |
| 4 | Var du tappar | Två rader: mönsterfamilj, andel rätt, "Riktat pass". En tredje rad för tempo om rätt men långsam. | 3 av 7, 48 s | Diagnosen är det konkurrenterna saknar och det betalande får. |
| 5 | Provdagen | Rad med leverantör, format i en mening ("samma format som Matrigma: 35 uppgifter, 40 minuter"), generalrepetition låst tills två dagar före, eller "Gör en nu" för betalande. | Antal, minuter | Realismen. Låst med datum synligt, så värdet syns innan köpet. |
| 6 | Fler tester | Rader, inte paneler: Verbalt, Numeriskt, Personlighetstest. Status per rad: nivå, "ej mätt", "profil klar 3 okt". | Nivå per typ | Bredden utan att stjäla fokus. Personligheten har ingen nivå, bara datum. |
| 7 | Resten av jobbsöket | En rad: "3 sökta tjänster, 1 intervju, 2 brev. Till jobbsöket." | Tre antal | Ägarens krav att allt annat syns. En rad, inte ett kort. |

Siffror som aldrig visas i hemvyn: procent per test som huvudtal, poäng, XP, rankning, percentil under 25 sessioner (regeln finns redan), "bästa resultat" (uppmuntrar engångsförsök).

Tillstånd:

| Tillstånd | Huvud | Bläckytan | Kurvan | Övrigt |
|---|---|---|---|---|
| Ny, ingen mätning | "Vilket test, och när?" | "Mät min nivå, cirka 8 minuter" | Ersätts av en mening: "Din första punkt kommer efter mätningen." Ingen tom graf. | Datum och leverantör som rad ovanför bläckytan. Modul 4 och 5 döljs. Modul 6 och 7 visas. |
| Mitt i träningen | "17 dagar till Matrigma" | Dagens pass, eller efter passet dagens tal | Full | Alla moduler. |
| Inför provdagen (2 dagar eller mindre) | "I övermorgon: Matrigma" | Generalrepetitionen i leverantörens format | Full, med målbandet markerat | Modul 4 blir "Repetera svagheten" (ett kort pass). Serien pausas synligt: "Serien räknas inte de här dagarna." |
| Provdagen | "I dag: Matrigma" | "Tre uppvärmningsfrågor, 2 minuter" | Dold | Lugn rad med praktiska råd. Inga andra handlingar. |
| Efter provet | "Hur gick det?" med tre val | Efter svar: Inför intervjun, nästa datum, eller fortsätt | Full, provdatumet markerat som passerat | Modul 7 lyfts till andra plats vid "gick vidare". |
| Gratis | Samma som betalande | Nivåmätningen gratis en gång. Ett pass om dagen på grundnivå gratis, varje dag (dagens kvot). Passet på din nivå visas med tema och nivå under linjen som textlänk till arket: "ingår i Hela paketet, 149 kr i månaden". Rekommendation i granskningen avsnitt 3, ägaren beslutar. | Punkter för grundpassen, ommätningarna som gråa platser med datum | Modul 4 visar familjerna men inte riktade pass. Modul 5 visar formatet men låst. |
| Betalande | Samma | Allt | Full | Ommätning var sjunde dag, riktade pass, provläge när som helst. |
| Tomt (inga test alls, inget datum) | "Träningen" | "Mät min nivå" | Mening | Samma som Ny. Aldrig ett streck eller "0". |
| Laddar | Skelett med samma höjd som tillståndet som kommer (ny eller full), `.loading-thread`, CLS 0 | | | Serverrenderat, så det ska sällan synas. |
| Fel | Huvudet renderas ändå ur serverdata | "Passet gick inte att hämta. Försök igen." med knapp | Mening | Aldrig en tom sida, aldrig en teknisk text. |

Inner sidor som vyn länkar till: passet (helskärm, FlowShell, dolt bottennav), genomgången, kurvan i full storlek (alla tester, alla ommätningar), provläget, inställningar för datum och leverantör.

## 5. Spelmomenten, vuxet

Regeln: allt som räknas ska gå att förklara för en rekryterare utan att skämmas. Inget som inte har med förmågan att göra.

**Nivå.** Skala 1 till 10, en decimal i kurvan, heltal i huvudet. Räknas ur frågornas uppmätta svårighet, inte ur nivåetiketterna. Rör sig högst 0,5 per pass så den inte fladdrar. Visas med ett ord om vad den betyder i provets termer, utan löften: "Nivå 7: du klarar de flesta uppgifter i klassisk Matrigma-tid." Vi säger aldrig percentil hos leverantören, vi har inte underlag.

**Serie.** Dagar i följd med ett slutfört pass, svensk midnatt. En frizon per vecka som inte bryter serien, sagd i klartext ("En vilodag i veckan ingår"). Serien pausas automatiskt två dagar före provet och på provdagen. Visas som ett tal med ordet "dagar", aldrig eld, aldrig larm vid brott. Bryts den säger raden "Serien börjar om i dag" och inget mer.

**Milstolpar.** Punkter på kurvan, inte märken. Fem stycken: första mätningen, första veckan (sju pass), nivå 5 och nivå 8, generalrepetitionen klar, provdagen. En milstolpe visas som en större prick med etikett när den nås och ett lugnt kvitto i hemvyn samma dag. Ingen konfetti, ingen ljud, ingen delning.

**Kurva.** Den egentliga belöningen. Nivå per dag, målband vid provets nivå om vi vågar sätta ett (annars bara datumet), ommätningar tydligare än pass. Alltid med datum på axeln.

**Tempo.** Sekunder per fråga mot provets budget, som ett andra tal. Snabbare utan fler fel är framsteg och ska synas.

Räknas aldrig: poäng, XP, rankning mot andra, "bästa resultat", antal försök, badges för inloggning. Personlighetstestet spelifieras aldrig: ingen nivå, ingen kurva, ingen serie, inget "gör om för bättre". Det visas som "Profil klar 3 oktober" med länk till profilen, och texten säger att det inte finns rätt svar.

## 6. Växlingen mellan träningsläget och allt annat

Två lägen med var sin hemskärm: **Träningen** (det här dokumentet) och **Jobbsöket** (dagens Mitt jobbsök, oförändrat i innehåll: sökta tjänster, CV, brev, Inför intervjun, Jobbcoachen, jobbmatchningen, Bli upptäckt).

**Rekommendation: växlaren i navigationen.**
- Mobil: bottennavet får fyra slots: Träningen, Jobbsöket, Skapa, Profil. De två första är hemskärmarna. Läget är alltså aldrig dolt; man ser alltid var man är och det andra är ett tryck bort. "Ansökningar" flyttar in i Jobbsökets hemskärm (det är dess första modul redan i dag).
- Dator: sidomenyn får två tunga rader överst, Träningen och Jobbsöket, och grupperna under följer läget: i Träningen visas Träna-gruppen (Dagens pass, Kurvan, Alla tester, Provläget, Inför intervjun) först, därefter resten i lättare vikt under rubriken "Jobbsöket"; i Jobbsöket tvärtom. Ingenting göms, ordningen byter.
- `/dashboard` renderar det ihågkomna läget. Valet sparas på servern (`profiles`, ett fält), första värdet sätts av registreringens val (tester och intervju ger Träningen, övriga Jobbsöket) och av ett satt provdatum (ger Träningen). Djuplänkar påverkas inte.
- Allt annat syns inifrån Träningen via modul 7 (en rad med tre antal) och via Skapa-arket, som är oförändrat.

**Alternativ: flik på sidan.** En segmentkontroll överst på hemskärmen, "Träningen | Jobbsöket", bottennav och sidomeny som i dag. Billigare att bygga och ändrar inte navigationen, men växlaren syns bara på hemskärmen och navet fortsätter säga Hem och Ansökningar, vilket drar mot jobbsöket. Väljs bara om navbytet bedöms för dyrt i den här omgången.

Krav oavsett val: växlingen tar under 100 ms (båda hemskärmarna hämtas i samma summering), valet kommer ihåg sig över enheter, och ingen betalvägg ligger på växlingen.

## 7. Betalväggen i flödet

Paket enligt ägarens beslut: Hela paketet, 149 kr i månaden, löpande, och Dagspasset, 49 kr, engångs i 24 timmar. "Allt-månaden" var arbetsnamnet i beslutet och står aldrig i gränssnittet; namnen kommer ur `PLANS.name` och skrivs med pris efter namnet och verbet Köp. Veckopaketen tas bort. Priser och namn ändras bara av ägaren.

Vad de ger i träningsläget:
- **Hela paketet, 149 kr i månaden.** Hela vägen till provdagen: dagliga pass, riktade pass, ommätning var sjunde dag, kurvan och historiken, provläge i leverantörens format när som helst, alla nivåer i alla testtyper, fördjupade personlighetstestet, intervjuprovet utan dagskvot, plus resten (brev, matchning, Jobbcoachen, Bli upptäckt). Säljs alltid med datumet: "17 dagar kvar. Månaden täcker hela vägen."
- **Dagspasset, 49 kr.** Ett dygn med allt. I träningsläget betyder det generalrepetitionen: provläge i leverantörens format, obegränsade pass det dygnet och genomgångar. Säljs till persona A dagen före provet, och till den som inte vill prenumerera. Vyn ska säga rakt ut när det räcker: "Provet är i morgon? Dagspasset räcker."

Gratisnivån, oförändrad i princip: nivåmätningen en gång, ett pass per dag på grundnivå (dagens kvot på en session per testtyp och dygn, `DAILY_LIMIT_TEST_SESSIONS`), personlighetstestet grund, senaste resultatet men inte historiken (`test_history`), inga nivåer över grund (`tests_above_base`), inget provläge (`test_exam_mode`).

Var väggen sitter, i ordning efter hur ofta den möts:
1. **Efter nivåmätningen.** Resultatet visas helt (nivå, var du tappar, planen till datumet). Planens pass från dag 2 är gråa med lås och paketets namn, i samma stil som sidomenyns gråa val. Knappen i planen öppnar `GraValSheet` med datumet i texten. Detta ersätter dagens "nästa nivå"-rad som enda puff.
2. **Dagens pass dag 2 och framåt** på gratisnivån: bläckytan visar temat och nivån men knappen säger "Lås upp passen, 149 kr i månaden" och under den "Eller Dagspasset, 49 kr". Vi visar alltså vad hon missar, inte bara att något är låst.
3. **Riktade pass** i modul 4 och **provläget** i modul 5: grått val med lås, som i dag.
4. **Kurvan** på gratisnivån: en punkt och gråa platser med datum, med raden "Hela kurvan ingår i månaden."

Aldrig: spärr på att se sitt eget resultat eller sin genomgång, spärr på växlingen, spärr på att sätta datum, nedräkning som skrämmer. Högst en bläckyta och högst tre orange per skärm gäller även med betalväggen.

## 8. Vad testmotorn måste leverera

| Behov | Finns i dag | Saknas |
|---|---|---|
| Sessioner med poäng, tid, svar per fråga (q_id, valt, rätt, tid) | Ja, `logic_test_v4_sessions.answers` (matris och prov), egna tabeller för verbalt, numeriskt, personlighet | Ett gemensamt läsbart lager per konto över alla typer (getHubData gör det för hubben, kan byggas ut) |
| Frågebanker | Matris 28 per nivå, 84 totalt (V7) plus V5-rester. Numeriskt 12 passager grund, verbalt 24 passager. Prov drar ur alla nivåer. | Volym. 30 dagars pass om 9 frågor är 270 matrisfrågor; banken tar slut efter nio dagar. Minst 250 kalibrerade matrisfrågor behövs, och numeriskt och verbalt behöver passform (en passage, fyra frågor). |
| Svårighet per fråga | `difficulty` 1 till 4 satt för hand; p-värden går att räkna ur svaren (gjort ovan) | Uppmätt svårighet lagrad per fråga och uppdaterad, så nivån och passurvalet kan bygga på den. Nivåerna skiljer inte åt i dag. |
| Regel och förklaring per fråga | Matris: `rule` per fråga. Numeriskt och verbalt: `explanation` per fråga. Visas i genomgången. | Feltyp: vad den valda distraktorn stämde på (matris saknar det helt). Behöver ett fält per alternativ eller per fråga i banken. |
| Mönsterfamilj per fråga | Härleds ur id med reguljära uttryck i `MatrixQuestionReview`, namngivna kategorier bara för avancerad | Ett riktigt fält `family` i banken, samma taxonomi i alla tre nivåer, så "var du tappar" och riktade pass kan dra på det |
| Nivåskattning 1 till 10 | Nej. Procent per test och percentil från 25 sessioner | En enkel skattning ur rätt och fel viktat med svårighet, uppdaterad per pass, med tak på 0,5 per pass. Tempo som eget mått mot provets budget. |
| Provdatum och leverantör | Nej. Registreringen sparar bara valet (cv, brev, tester, intervju, jobb) | Ett fält eller en tabell per konto: leverantör, datum, testtyper, utfall efteråt. Driver huvudet, planen, provläget och betalväggens text. |
| Dagens pass | Nej. Bara hela test (15, 32 eller 48 frågor) och prov | En passtyp (`test_type` pass) med sammansättning 60/20/20 runt nivån, tema per dag, 10 minuter, och en resultatsida med tre tal. Riktade pass per familj. |
| Nivåmätning | Nej. Grundtestet med 15 frågor används som mätning | 12 frågor över hela spannet med tre svårighetsband, adaptivt mellan banden, utan förklaringar under tiden. Gratis en gång, ommätning var sjunde dag. |
| Provläge per leverantörsformat | Ett provläge per testtyp med fast tid (matris 18 frågor på 25 min, verbalt 48 på 40, numeriskt 36 på 40) | Format per leverantör: antal, total tid eller tid per fråga, adaptivt eller fast. Faktauppgifter från bevakningen: Alva Logic 20 uppgifter, 2 min per uppgift; Matrigma adaptiv cirka 12 min, klassisk 35 på 40 min (tredjepartskälla, verifiera); SHL Verify G+ 24 frågor på 36 min; Aon scales ix 20 på 5 min, numeriskt 37 på 12 min. Formuleras alltid "samma format som". |
| Serie och milstolpar | Nej. Streak togs bort 2026-09-12 med skäl | Räknas ur slutförda pass per dag i svensk tid, med en frizon per vecka och paus runt provdagen. Behöver inte lagras, kan räknas. Milstolpar räknas ur samma data. |
| Kurva | Sparkline per test i procent, bara med `test_history` | Nivå per dag över alla typer, ommätningar och milstolpar markerade, provdatum som linje. Serverrenderad som SVG. |
| Efter provet | Nej | Frågan "Hur gick det?" en gång, svaret lagrat, och en styrning till nästa datum eller till jobbsöket |
| Läge (Träningen eller Jobbsöket) | Nej | Ett fält på profilen, första värde ur registreringens val eller satt datum |
| Numeriska testet | Slutförs av 1 av 9 | Felet utreds på branch fix/kontaktepost-numeriskt. Passformen (en passage, fyra frågor) minskar också risken. |
| Mätning | PostHog och aktivitetsloggen finns | Händelserna i avsnitt 9 |

Hårda regler som gäller allt nytt innehåll: kvalitetsreglerna för matrisfrågor i minnet reference_matrix_test_system (kopplade mönster, ingen parallellitet, synlig referensram, inga glyfer, varierade alternativ, variera regeln). Valideringskedjan körs före varje ny bank. Nya frågor byggs programmatiskt med generatorerna.

## 9. Acceptanskriterier och mätpunkter

Acceptanskriterier för art-directors koncept och för bygget:
1. Hemvyn i träningsläget har en primär handling synlig utan att scrolla, högst tre ytor i samma vikt, inga lucide-ikoner för navigation, aldrig Sparkles, aldrig em-dash. Träningen får egna tokens, toningar och märken enligt runda 2-uppdraget (granskningen avsnitt 13), dokumenterade med namn och kontrast; Jobbsöket följer Tråden som förut. Grep-listan i designsystemet avsnitt 10 ger noll träffar på em-dash, Sparkles och engelska gränssnittsord.
2. Alla sju moduler och alla tio tillstånd i avsnitt 4 är ritade för Pixel 7 och dator. Inget tillstånd visar ett streck, "0 %" eller en tom graf.
3. Provdatum och leverantör går att sätta, ändra och ta bort på tre tryck från hemvyn. Hoppa över syns i första skärmen.
4. Nivåmätningen tar under tio minuter för medianen och ger nivå, tempo och två familjer där hon tappar.
5. Dagens pass startar med ett tryck från hemvyn, tar under tolv minuter för medianen, och resultatet visar tre tal och en genomgång med regel och förklaring per fråga.
6. Kurvan visar nivå per dag med datum, ommätningar och provdatum, och renderas i första HTML.
7. Växlingen mellan lägena är synlig på varje skärm, tar under 100 ms, och valet kommer ihåg sig på servern.
8. Betalväggen sitter på de fyra ställena i avsnitt 7, alltid med datumet i texten när det finns, och aldrig på resultat, genomgång, datum eller växling.
9. Personlighetstestet visas utan nivå, serie eller kurva, med texten att det inte finns rätta svar.
10. Serien har en frizon per vecka och pausas automatiskt två dagar före provet. Bruten serie ger en neutral rad.
11. Inga leverantörslogotyper. Varje provläge säger "samma format som" och anger antal och tid.
12. LCP under 1,5 s på Pixel 7 över LTE för hemvyn, CLS 0, mätt med `scripts/perf-inloggat.ts`. Klicktestat i riktig webbläsare som ny användare, med skärmdump per steg, innan något kallas klart.
13. Alla texter på svenska med svenska facktermer, vi-form, inga engelska gränssnittsord.

Mätpunkter (PostHog, med ägarens och testkontona undantagna), med mål att läsas av fyra veckor efter släpp:

| Händelse | Mått | I dag | Mål |
|---|---|---|---|
| provdatum_satt | andel nya testregistrerade som sätter datum | 0 (finns inte) | 50 procent |
| nivamatning_klar | andel som slutför mätningen efter start | 61 procent slutför grundtestet | 80 procent |
| pass_klart | pass per vecka per betalande | finns inte | minst 4 |
| aktivitet dag 2 | andel testregistrerade aktiva dagen efter | 2 av 37 (saas-lead), 9 av 51 någon andra dag | 40 procent av dem med datum, 25 procent totalt |
| betalvagg_visad, kop | andel som når väggen efter mätningen och andel som köper | 2 köp av 53 grundtest | 60 procent når, 10 procent köper |
| uppsagning inom ett dygn | andel nya betalande som säger upp första dygnet | 2 av 2 veckoköp | under 1 av 4 |
| generalrepetition_klar | andel med datum som gör den dagen före | finns inte | 60 procent |
| efter_provet_svar | andel som svarar på "Hur gick det?" | finns inte | 50 procent |
| lage_vaxlat | växlingar per konto och vecka, och andel som använder båda lägena | finns inte | läses, inget mål |
| Serie 7 dagar | andel betalande som når sju dagar i följd | finns inte | 30 procent |

Volymerna är små (3 till 4 nya konton per dag). Avläsningen ska ange antal, inte bara procent.

## 10. Öppna frågor till ägaren

1. Ska Träningen vara standardläge för alla nya konton, eller bara för dem som valde tester eller intervju vid registreringen och för dem med satt datum? Mitt förslag: det senare, så att CV-spåret inte landar i en vy om prov.
2. Innehållsbudgeten. Dagliga pass kräver minst 250 kalibrerade matrisfrågor plus passformat för numeriskt och verbalt. Det är veckor av generatorarbete och validering. Ska det gå före den visuella vyn, parallellt, eller ska vyn släppas med färre pass per vecka tills banken räcker?
3. Dagspasset i träningsläget: ska vi sälja det uttryckligen som "dagen före provet" (generalrepetitionen) eller hålla det som ett generellt dygn? Namnet och priset är ditt; frågan gäller bara hur vyn pratar om det.
4. Frågan efter provet ("Hur gick det?"): får vi fråga, lagra svaret och använda det i mätningen? Det är känslig information om en rekryteringsprocess och ska i så fall vara frivillig och raderbar.
5. Leverantörsformat: hur långt får vi gå i att efterlikna Matrigma, Alva Logic, SHL Verify och Aon scales (antal, tid, adaptivitet) under rubriken "samma format som"? Jag föreslår antal och tid men inga namn i själva provvyn, bara i inställningen.
