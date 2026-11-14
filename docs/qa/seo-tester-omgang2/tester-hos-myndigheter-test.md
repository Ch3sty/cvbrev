UNDERKÄND

Testansvarigs granskning av content/artiklar/tester-hos-myndigheter.mdx, 2026-11-14. Alla citat och påståenden är kontrollerade mot skribentens källtexter (scratchpad/myn och ar2025u.txt) och mot koden. Det är fem fel, och alla går att rätta i texten utan ny research. Resten håller: citaten från Skatteverket, Kronofogden, Försäkringskassan, Arbetsförmedlingen, Säkerhetspolisen och Kustbevakningen är ordagranna, Adda-stycket följer ägarens villkor, och länkarna och gratis/Premium-texten stämmer mot koden.

## Fel

**1. Rad 30 (snabbsvaret) och rad 163: påståendet att ingen sida namnger en leverantör är fel.**
Text: "Ingen av myndigheternas sidor som vi läst namnger testleverantören." och "Ingen av de nio myndighetssidorna vi läst namnger en testleverantör."
Arbetsförmedlingens sida, som vi själva citerar och länkar (Vår rekryteringsprocess), namnger under Överföring av personuppgifter en leverantör av testverktyg. Påståendet går alltså att motbevisa med vår egen källa. Leverantören ska inte namnges i artikeln, enligt ägarens villkor.
Rättelse rad 30: "Myndigheternas sidor säger inte vilket test du får i en viss rekrytering. Det står oftast i inbjudan, och det är där du tar reda på vilket test du ska öva inför."
Rättelse rad 163: "Ingen av de nio myndighetssidorna säger vilket test du får i en viss rekrytering. Varför vet vi inte, men det spelar mindre roll än man tror." (Resten av stycket kan stå kvar.)
FAQ:n ("Det står nästan aldrig på myndigheternas egna sidor") är redan korrekt och kan stå kvar.

**2. Rad 149: Tullverket-citatet är inte ordagrant.**
Text: Där gör du enligt Tullverket "först ett databaserat begåvningstest"
Källan: "Hos Plikt- och prövningsverket får du först göra ett databaserat begåvningstest."
Rättelse: Där får du enligt Tullverket "först göra ett databaserat begåvningstest", blir sedan intervjuad av en psykolog ...

**3. Rad 153 och rad 145: kedjan årsredovisning, uppdragsgivare och I-provet antyder det ägaren har förbjudit.**
Text rad 153: "Samma årsredovisning säger att I-prov 2025 används vid mönstringen och i prövningarna för myndighetens urvalsuppdrag." Meningen står direkt efter Tullverket och Kustbevakningen och före länken till I-provet. Läsaren drar då slutsatsen att Tullverket och Kustbevakningen använder I-provet. Ingen förstahandskälla säger det. Årsredovisningen (avsnitt 3.2.2.2.2, 3.2.2.2.3 och 7.2) säger bara att psykologiska tester gjordes för dem och att I-prov 2025 används i "prövningar till myndighetens urvalsuppdrag". Den säger inte vilka uppdrag som räknas dit.
Rättelse: stryk meningen. Behåll: "Vilket test en viss uppdragsgivare får står varken i årsredovisningen eller hos Tullverket och Kustbevakningen. Det står i kallelsen. Nämner din kallelse I-provet har vi ..."
Text rad 145: "Vilket test som ingår säger inte årsredovisningen". Årsredovisningen kallar Säkerhetspolisens prövning "inskrivningsprov", och det är samma ord som I-provets namn kommer ifrån, så meningen går att ifrågasätta åt båda hållen.
Rättelse: "Vad provet består av beskriver varken årsredovisningen eller Säkerhetspolisens sida." Skriv inte ut att Säkerhetspolisen använder I-provet.

**4. Rad 189: "nästan alla" stämmer inte med tabellen.**
Text: "Det är de två saker som nästan alla myndigheter i tabellen ovan nämner."
Bara fem av nio nämner både problemlösning eller begåvning och personlighet: Skatteverket, Kronofogden, Försäkringskassan, Arbetsförmedlingen och Säkerhetspolisen. Migrationsverket skriver bara "tester". Tullverket och Kustbevakningen nämner begåvningstest men inte personlighet, och Kriminalvården nämner inget test.
Rättelse: "Det är de två saker som de flesta myndigheterna i tabellen nämner."

**5. Rad 30 i snabbsvaret, följdfel av fel 1.**
Meningen "Namnet står oftast i inbjudan" bygger på påståendet i fel 1. Använd rättelsen under fel 1. Den täcker båda meningarna.

## Kontrollerat och godkänt

- Matrisprovet: `<ArtikelProv typ="matris" />` ger en uppgift plus "fyra till" (ArtikelProv.tsx, provAntal 5). Att texten säger "fem uppgifter" stämmer.
- Gratis och Premium på rad 195 stämmer mot gratisniva.ts: nivåmätningen är gratis en gång, grundpasset bara dag 0, och daglig träning, ommätning och provläget kräver Premium. Även "Annat eller vet inte" får ett övningsprov med tidtagning (Ingang.tsx, ovningsprovRad, logikformat). "Annat eller vet inte" och kryssfrågan "Vad ska du testas på?" finns i mittTest.ts.
- Länkarna fungerar. `?fran=tester-hos-myndigheter&mitt_test=annat` ger matrisprovet (utan typ blir det matris), och mitt_test=annat är ett giltigt val som sparas i provkällan. `?typ=iprov&mitt_test=iprov&fran=...` ger I-prov-smakprovet: aliaset iprov finns och IPROV_PROV_KLART är true. Slugen klarar SLUG-regexen.
- Allmänna testpåståenden: att matriser ofta ingår i problemlösningstester, att test är adaptiva och "känns svåra mot slutet", och att Hausknecht m.fl. 2007 bygger på 50 studier med måttlig effekt och större effekt med vägledning stämmer med logiktest-tips.mdx. "Samma test" används aldrig, och I-provet beskrivs med "i I-provets format".
- Adda följer ägarens villkor: tilldelade leverantörer i delområde 1, avtalsperioden 2026-06-22 till 2030-06-21, avropsberättigad kommun, region eller bolag (avropsvägledningen s. 2) och "ett företag inom SKR" (sidfoten i vägledningen). Texten säger uttryckligen att avtalet inte säger vem som köper.
- Säkerhetsskyddslagen: 3 kap. 14 § (registerkontroll vid säkerhetsklass) och 18 § (samtycke) stämmer.
- Källänkarna svarar med 200, utom Skatteverket och Kronofogden (tidsgräns under lördagens underhåll), Tullverket (botskydd, 403) och Säkerhetspolisen (botskydd). Skribentens källtexter från samma dag täcker dem. Kustbevakningens gamla adress med /om-grundutbildningen/ leder till den adress vi citerar.

## Förslag (inte krav)

- Rad 179: "den görs innan du anställs" kommer från 3 kap. 3 § och inte från 14 eller 18 §. Skriv "3 kap. 3, 14 och 18 §§" i källraden.
- Rad 179: Säkerhetspolisen placerar alla anställda i säkerhetsklass, inte "en del tjänster". Lägg gärna till "(hos Säkerhetspolisen alla)".
- Rad 97: "kommer aldrig till ett samtal" bör bli "kommer aldrig till intervjun". Skatteverket och Migrationsverket kan ringa upp för en kort telefonintervju i samma skede.
- Rad 139: Säkerhetspolisens sida skriver "Personlighetstester/arbetspsykologiska tester". Behåll snedstrecket så att listan återger sidan exakt.
- Rad 153: "med sex deltester på stanineskalan" blir tydligare som "med sex deltester och resultat på stanineskalan".
- Rad 175: "avtalet riktar sig till kommuner, regioner och bolag" är en tolkning av vägledningen. Säkrare: "Avropsvägledningen talar om kommuner, regioner och bolag, så avtalet säger ingenting om de statliga myndigheterna i den här artikeln."
- FAQ "Vilket testföretag" ("oftast i inbjudan") och rad 165 ("ofta") säger olika saker. Välj "ofta" på båda ställena, eftersom vi inte kan belägga "oftast".
- Utanför artikeln, men länken leder dit: MITT_TEST_KORT.iprov i src/lib/traning/mittTest.ts har raden "I-provet. Även mönstring, Tullverket, Kustbevakningen". Den bryter mot samma villkor om ingen förstahandskälla säger det. i-prov.mdx säger också att Tullverkets aspirantutbildning använder I-provet, med Polistidningen som källa och inte en myndighet. Båda bör granskas separat.

## Omgång 2

GODKÄND

Omgranskat 2026-11-14 mot samma källtexter. Alla fem felen är rättade:

1. Rad 30 och rad 163 säger nu att sidorna inte säger vilket test du får ("Myndigheternas sidor säger inte vilket test du får i en viss rekrytering.", "Ingen av de nio myndighetssidorna säger vilket test du får i en viss rekrytering."). Det stämmer mot alla nio källor, och ingen leverantör namnges för någon myndighet.
2. Rad 149: "först göra ett databaserat begåvningstest" är ordagrant enligt Tullverkets sida.
3. Rad 153: meningen om I-prov 2025 och urvalsuppdragen är struken. Kvar står bara att Plikt- och prövningsverket gjorde psykologiska tester för tullaspiranter och bordningsgruppen, och att testet står i kallelsen. I-provslänken är villkorad ("Nämner din kallelse I-provet") och säger inte att Tullverket eller Kustbevakningen använder det. Rad 145: "Vad provet består av beskriver varken årsredovisningen eller Säkerhetspolisens sida." håller.
4. Rad 189: "de flesta myndigheter i tabellen" stämmer (fem av nio nämner både problemlösning och personlighet).
5. Snabbsvaret: följdfelet är borta, och "ofta" används nu både där, på rad 165 och i FAQ:n.

Förslagen är också införda och stämmer: källraden "3 kap. 3, 14 och 18 §§", "(hos Säkerhetspolisen alla)" på rad 179, "kommer aldrig till intervjun" på rad 97, snedstrecket på rad 139 som på Säkerhetspolisens sida, "sex deltester och resultat på stanineskalan" och "avropsvägledningen talar om kommuner, regioner och bolag" på rad 175. Inga talstreck, inget "samma test", Adda-stycket följer ägarens villkor, och rad 195 stämmer fortfarande mot gratisniva.ts (nivåmätning en gång och grundpass bara dag 0, resten Premium).

Kvar utanför artikeln (inget krav för publicering): kortraden "I-provet. Även mönstring, Tullverket, Kustbevakningen" i src/lib/traning/mittTest.ts rad 188 visas i testvalet i Ingang.tsx och i appens Onboarding.tsx för alla användare. Den bryter mot ägarens villkor och bör rättas separat, till exempel till "I-provet. Även mönstring".
