# saas-lead: data, återkomst och köp för smala val (2026-11-18)

## 1. Vad datan säger

Underlag: `test_planer` och `logic_test_v4_sessions` i Supabase, PostHog 10 dagar bakåt. Ägarens och testkontona är undantagna via `admin_undantagna_konton()`. Valet "Mitt test" gick live 9 november, så de flesta planer är under tio dagar gamla. Appen Testklar har inga mätbara användare än (inga händelser från appen i PostHog, tabellen `app_enheter` finns inte i produktion). Allt nedan gäller alltså webben.

**Fördelning, 36 planer:**

| Grupp | Planer | Varav |
|---|---|---|
| Smalt (ett deltest, figurmatriser) | 29 (81 %) | Matrigma 14, Alva 11, äldre planer utan leverantör 3, Annat med ett kryss 1 |
| Brett (3 till 4 deltester) | 5 (14 %) | I-provet 3, Aon 2 |
| Bara personlighet | 2 | |

De två gamla Alva-planerna med två testtyper räknas som smala, eftersom `deltesterForPlan` ger dem bara figurmatriser. Ingen har i dag valt "Annat" med många kryss; ägarens skärmdump med sju pass är inte en vanlig användares vy. 14 av 18 val i `mitt_test_valt` kommer från en artikel (Matrigma- och Alva-artiklarna sätter valet åt dem). Smalt är alltså standardfallet, inte undantaget, och det kommer från SEO.

**Aktivitet efter att planen skapades:**

| | Smalt (29) | Brett (5) |
|---|---|---|
| Gjorde minst ett pass | 14 (48 %) | 2 (40 %) |
| Pass per aktiv användare | 2,8 | 2,0 |
| Återkom dag 2 till 7 (planer minst 7 dagar gamla) | 2 av 15 | 0 av 4 |
| Köpte | 3 (alla Hela paketet, månad) | 0 |

**Slutsats:** det finns ingen mätbar skillnad i återkomst mellan smalt och brett. Båda tappar efter dag 1. Med 5 breda planer går det inte att säga något om breda; skillnaden ligger helt inom bruset. Ägarens iakttagelse kan inte bekräftas med beteende, men den behöver inte det: problemet är strukturellt.

Två saker väger tyngre än jämförelsen:

1. **Alla tre köpare är smala figurmatris-användare.** Det smala valet är vårt betalande segment. Två av dem har inte varit aktiva sedan dag 1 eller 2 (en sedan 26 oktober, en sedan 12 november) och betalar 149 kr i månaden. Den tredje köpte samma dag som sitt provdatum. Risken är uppsägning vid första förnyelsen, inte bara låg köpvilja.
2. **Gratisnivån gör smalt tunnare än brett.** Nivåkollen är gratis per deltest (`kortFor` i `vyer.ts`, `gratisniva.ts`). Ett brett val ger upp till sju gratis nivåkoller och sju rader i Utveckling. Ett smalt val ger en nivåkoll och ett grundpass dag 0, sedan bara låsta rader. Den smala gratisanvändaren har bokstavligen ingenting nytt att göra dag 2.

Bara 6 av 36 planer har ett provdatum. Utan datum finns ingen nedräkning, ingen "dag X av Y" och ingen anledning att komma tillbaka i morgon.

**Datakvalitet:** `pass_klart` visar 36 personer i PostHog mot 20 användare med avslutade pass i databasen; serverhändelserna verkar inte knytas till samma person som klienten. Varken `pass_klart` eller `paywall_shown` bär `mitt_test` eller antalet deltester, så jämförelsen ovan går bara att göra i SQL.

## 2. Vad en smal användare behöver se

Löftet de köper är "bli bättre på just mitt test före provdagen". Då ska djupet finnas inom testet, inte i fler testtyper.

- **Delarna inom testet.** Figurmatriser har mönsterfamiljer (`familjer.ts`) och riktade pass per familj finns redan bakom betalväggen. I dag syns de bara som två rader under "Var du tappar". En Alva-användare ska se sitt test uppdelat: familjerna som rader i Utveckling, var och en med sin nivå eller "inte tränad än", och riktade pass per familj under "Fler pass i dag". Då har det smala valet lika många rader som det breda, och raderna är sanna.
- **En väg till provdagen.** Kurvan med en punkt ser tom ut för att den saknar framtid. Med provdatum kan kurvan visa passdagarna fram till provet som tomma punkter. Utan provdatum: fråga efter det direkt i valet, inte senare i inställningarna.
- **Tempo som egen utvecklingslinje.** Tempo mot provets tid finns för senaste passet. Som trend över passen blir det en andra kurva som rör sig snabbare än nivån och ger känslan av utveckling redan dag 2 eller 3.
- **Det som ofta kommer i samma rekrytering.** Alva Labs och Assessio har båda personlighetstest bredvid logiktestet. En rad "Ofta i samma rekrytering" visar det utan att ändra Mitt test. Det breddar utan att späda ut valet. Formuleringen ska granskas mot källor innan den skrivs.
- **Låst djup som syns.** Familjeraderna med lås gör betalväggen konkret: gratis ser vilka delar de inte tränat, inte bara ordet Premium.

Var det känns tunt i dag: Utveckling (en rad, en punkt), Idag efter dag 0 för gratis (allt låst), och Tester-fliken där "Fler" visar andra testtyper i stället för djupet i det egna.

## 3. Prioriterade förslag

| # | Förslag | Effekt | Insats |
|---|---|---|---|
| 1 | Mönsterfamiljerna som rader i Utveckling och som riktade pass i "Fler pass i dag" för figurmatriser (låsta för gratis). Samma mönster för övriga deltester när de har familjer. | Störst på både återkomst och köp: djup för 81 % av planerna, betalväggen får innehåll | M |
| 2 | Provdatum i valet ("När är provet?" med Vet inte), även när valet kommer från en artikel | Nedräkning och dagsplan för fler än 6 av 36 | S |
| 3 | Kurvan visar vägen till provet (kommande passdagar) och tempot som egen linje | Utveckling ser levande ut från dag 1 | S till M |
| 4 | Påminnelse för betalande som inte gjort dagens pass (appens push när appen är ute, annars dagsmejl). Utskick till befintliga användare kräver ägarens ja | Skyddar de tre betalande och förnyelsen | M |
| 5 | Raden "Ofta i samma rekrytering" för Alva och Matrigma | Fler pass per användare, korsförsäljning inom paketet | S |
| 6 | Mätning: `mitt_test` och `antal_deltester` på `pass_klart`, `traning_hem_visad` och `paywall_shown`; rätta personkopplingen för serverhändelserna | Gör avläsningen möjlig utan SQL | S |
| 7 | Rätta de två felen (nedan) | Trovärdighet inför provet | S |

Gratisnivån ändras inte (ägarens beslut 2026-10-11). Förslag 1 ger smala gratisanvändare mer att se, inte mer att göra gratis.

**Avläsning:** återkomst dag 2 till 7 och köp per grupp fyra veckor efter driftsättning. Räkna med att n förblir litet; mät även pass per vecka för betalande.

## Felen från skärmdumparna

- **"dag 38 av 45" och kurvan från 11 oktober:** `UtvecklingVy.tsx` rad 94 till 97 räknar från `s.start`, alltså första nivåkollen för figurmatriser, inte från planen eller det senaste provdatumet. Kontot har mätt sig 11 oktober och provet är 25 november. Räkningen är tekniskt korrekt men läses som fel. Förslag: räkna från när provdatumet sattes, eller skriv "X dagar kvar".
- **Märket Provdagen nått före provet:** `milstolpar.ts` rad 158 sätter `provdagen` när dagens datum passerat provdatumet, och milstolpar sparas permanent. Har kontot haft ett tidigare provdatum som passerat och sedan flyttat det, ligger märket kvar. Rimligen ska märket gälla det aktuella provdatumet eller nollställas när datumet flyttas framåt. Verifiera mot kontots rader i `test_milstolpar`.
