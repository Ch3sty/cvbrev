# Säljgranskning av SEO-planen för testklustret, omgång 2 (14 november 2026)

Säljansvarig (inlånad från Begone), 2026-11-14. Granskar `docs/plan-seo-tester-omgang2-2026-11-14.md` ur en enda fråga: blir trafiken konton och köp? Produkterna är Premium 149 kr i månaden och Dagspasset 49 kr, och under Black Week 99 kr (23 till 29 nov) och 49 kr (30 nov) första månaden för konton som aldrig haft Premium. Saas-lead granskar prioritering och affärsvärde parallellt (`docs/beslut-seo-tester-omgang2-saas-lead-2026-11-14.md`). Ingen kod är ändrad och inget är publicerat. Priser beslutar bara ägaren.

**Underlag:**
- SEO-planen omgång 2 och min förra granskning `docs/beslut-seo-nya-tester-salj-2026-11-10.md`.
- PostHog, projekt 148688, hämtat 14 nov: `article_viewed`, `article_cta_clicked`, `sample_started`, `sample_completed`, `signup_gate_shown`, `signup_completed`, `mitt_test_valt`, `provdatum_satt`, `betalvagg_visad`, `paywall_cta_clicked`, `subscription_paid`. Fönster 17 okt till 14 nov (28 dagar) och 10 till 14 nov (sedan kedjan gick live).
- Supabase, hämtat 14 nov: `profiles.acquisition_source`, köp (`subscription_id` eller `premium_until` satt), `test_planer.mitt_test`, `mitt_test_variant` och `provdatum`. Ägaren och testkontona undantagna med `admin_undantagna_konton()`.
- Kampanjkoden `src/lib/kampanj/kampanj.ts`, kampanjraden i den publika layouten, prisraderna i `TypProvKort.tsx`, `ArtikelReklam.tsx` och `ProvTypSida.tsx`.

**Läsanvisning:** "Mätt" betyder avläst i PostHog eller Supabase i dag. "Hypotes" betyder en bedömning med ett datum då den prövas. Fönstret sedan 10 nov är fyra och en halv dag. Alla tal därifrån är tidiga signaler, inte nivåer. PostHog underskattar konton (samtyckesbannern), så konton och köp räknas i Supabase.

---

## Tratten i dag

**Hela testtratten, mätt i PostHog (unika personer):**

| Vecka (mån) | Provstart | Slutfört | Kontosteget visat | Konton totalt | Köp |
|---|---|---|---|---|---|
| 12 okt | 82 | 60 | 62 | 12 | 0 |
| 19 okt | 78 | 59 | 62 | 12 | 2 |
| 26 okt | 76 | 59 | 63 | 14 | 0 |
| 2 nov | 93 | 74 | 76 | 17 | 3 |
| 9 nov (t.o.m. lör 14) | 103 | 83 | 85 | 21 | 1 |

**Sedan 10 nov, mätt:**
- 74 personer såg kontosteget efter provet. 14 konton har källan `smakprov:<slug>` i Supabase. Det är **19 procent**, samma som P2:s 18. Det nya kontosteget har inte flyttat talet än, men fönstret är kort.
- 25 nya konton (Supabase). 16 konton har `mitt_test` satt, varav 13 från artikeln.
- 1 köp (10 nov, från analysen, inte från en testartikel).

**28 dagar, mätt i Supabase:** 79 nya konton, 5 av dem har köpt. Köp per nytt konto 6 procent, inom P2:s 3 till 8.

**Per testartikel sedan 10 nov, mätt:**

| Sida | Läsare (PostHog) | Klick på provet | Konton (Supabase) | Datum satt | Köp |
|---|---|---|---|---|---|
| alva-labs-logiktest | 29 | 18 | 4 (6 med `mitt_test=alva` sedan 9 nov) | 0 | 1 (konto från 9 nov) |
| matrigma-test | 28 | 22 | 3 | 0 | 0 |
| logiska-tester | 17 | 12 | 2 | 0 | 0 |
| map-test-personlighetstest | 11 | 8 | 3 | 0 | 0 |
| arbetspsykologiska-tester | 10 | 7 | 0 | 0 | 0 |
| i-prov | 7 | 5 | 2 | **2 av 2** (polis och officer, 5 och 6 dagar kvar) | 0 (ett klick på köpknappen) |
| aon-cut-e-test | 4 | 2 | 2 | 0 | 0 |
| numeriskt-test-guide, verbalt-test-guide | 1 och 1 | 1 | 0 | 0 | 0 |

**Var köpen sker, mätt (sex köp på 28 dagar):** prissidan (2), testnivå (1), testtak (1), kvot (1), analysen (1). Inget köp har skett direkt efter ett smakprov. Väggen som säljer står inne i produkten, när kontot har övat och slår i en nivå eller ett tak.

Fyra saker i datan styr granskningen:
1. **Alva är redan säljsidan.** Flest läsare, flest konton med ett valt test och klustrets enda köp från en testartikel.
2. **I-prov ger få besökare men de mest köpbenägna.** Två av två I-prov-konton satte ett provdatum direkt, med fem och sex dagar kvar. Det är förra granskningens hypotes, nu med de första två fallen.
3. **Matrigma har högst klickandel till provet** (22 klick på 28 läsare) och står i den här planen bara som U8 i vecka 50.
4. **Kontosteget är oförändrat på 19 procent.** Varje ny sida i planen passerar det steget. Det är fortfarande den största enskilda hävstången för konton, större än någon sida i planen.

---

## 1. Slutsatsen i korthet

1. **Säljsidan i den här omgången är U11, inte en ny sida.** alva-labs-logiktest har köpbenägen trafik i dag, `mitt_test=alva` fungerar och sidan har gett ett köp. U11 och U17 först, som planen säger, är rätt. Men U11 är för viktig för planens omprövningsregel 9 feb. Om titelbytet kostar klick ska det backas inom två veckor, inte efter tre månader (avsnitt 2).
2. **Av de nya sidorna når N9 och N8:s I-provsgrupp köpbenägna besökare. N7 och N10 ger mest konton och trafik.** Den som söker "arbetspsykologiska tester skatteverket" har en inbjudan. Den som söker "stanineskala" har oftast redan gjort sitt test eller är förälder. Jag föreslår att **N9 går före N8** om ägaren säger ja till N9, och att N8 får en köpväg för den som ska göra om testet.
3. **Köpmålen i planen är rimliga som hypoteser men för små för att styra något före 9 mar.** Planen räknar 1 till 2 köp från alla nya sidor till 9 mar. Det är ärligt. Intäkten i planen kommer från U11 och från att I-prov-sidan får fler besökare (U13), inte från N7 till N11.
4. **Black Week kan inte få trafik från de nya sidorna.** N7 publiceras mitt i kampanjen och rankar inte på en vecka. Det enda SEO-arbete som kan ge kampanjköp är U11 och U17, och bara om de är publicerade och indexeringsbegärda senast onsdag 18 nov. Kampanjen ska inte in i någon title, description, H1, snabbsvar eller FAQ (avsnitt 4).
5. **Kampanjen förorenar köpmåtten.** Baslinjen 18 dec (20 nov till 17 dec) innehåller Black Week och Cyber Monday. Köp per konto blir högre än normalt i det fönstret. Kampanjköp ska räknas för sig, annars bedöms sidorna 9 mar mot en uppblåst baslinje.

Rekommendationen i en mening: kör U11 och U17 senast 18 nov med en snabb backningsregel för Alva, låt N9 gå före N8, och räkna kampanjköp för sig från 23 nov.

---

## 2. Granskning per sida

"Köpnärhet" är min bedömning. Hög betyder att besökaren har ett datum eller en inbjudan, låg att hen läser för att förstå eller redan har gjort testet.

| # | Sida | Vem kommer | Köpnärhet | Ger den konton? | Ger den köp? | Min bedömning |
|---|---|---|---|---|---|---|
| U11 | alva-labs-logiktest | Två grupper. Före testet ("alva logiktest öva", 363 visn pos 7,0) med inbjudan. Efter testet ("resultat 7", "bra resultat") | Hög före testet, låg efter | Ja, mätt: flest konton i klustret | Ja, mätt: ett köp. Hypotes 5 procent per konto | **Säljsidan.** Gör först. Se villkoren nedan |
| U17 | numeriskt-test-guide, verbalt-test-guide | Ofta inbjudan (SHL, Aon, Talogy) | Medel | Lite. Mätt: 1 och 1 läsare på fyra dagar | Litet. Hypotes 3 procent | Ja, för att den är billig (S) och 461 visningar ger noll klick. Ingen intäkt att räkna med före 9 mar |
| N7 | logiktest-tips | Har ett test framför sig, vet ofta inte vilket | Medel till hög | Ja | Ja, om sidan bär övningseffekten vidare till "Mitt test" | Bra sida. Snabbsvaret är planens starkaste säljargument (nedan). Kontomaskin först, köp genom valet av test |
| N8 | stanine-testresultat | I-provsgruppen före provet, alla som fått ett resultat, skolgruppen | Hög för I-provsgruppen, låg för övriga | Ja, för I-provsgruppen | Litet utom I-prov | Mest trafik. Behöver en köpväg för den som ska göra om testet. Låt N9 gå före |
| N9 | tester-hos-myndigheter | Har en inbjudan från en myndighet | **Hög** | Ja | Ja, hypotes 5 procent | Planens köpnärmaste nya sida. Föreslår att den går före N8, om ägaren godtar risken |
| N10 | logiskt-test-figurer | Söker en förklaring, en del övar | Låg till medel | Ja, 267 visningar ligger redan på sida 1 | Litet, hypotes 2 procent | Trafik och konton. Rätt att den väntar till efter 7 dec |
| N11 | cubiks-logiks-test | Inbjudan från Talogy | Hög | Ja | Ja, men vi har inget Cubiks-prov | Rätt i januari. Valet "Annat" tappar avsikten, se avsnitt 3 |
| U12 | personlighetstest-jobb-guide | Har fått ett personlighetstest | Låg | Ja, mätt: map-test gav 3 konton på fyra dagar | Nej, ingen vägg i personlighetsprovet | Gör den för konton. Inget köpmål |
| U13 | i-prov | Har ett datum | **Högst** | Ja, mätt: 2 konton av 7 läsare | Ja, hypotes 10 procent | Den viktigaste länken i planen för intäkt. Ligger i vecka 50 på grund av avläsningen 7 dec, och det godtar jag |
| U14 till U16, U18 | Länkar | | | Indirekt | Indirekt | SEO:s. Räkna klicken till N9 och i-prov, de är köpvägarna |
| U8 utökad | matrigma-test | Inbjudan, kort horisont | Hög | Ja, mätt: 22 provklick på 28 läsare | Ja | Ingen ändring före 7 dec, men se sälj-tillägg 3 |

### U11, villkor från sälj

1. **"öva" före "resultat" i seoTitle.** Båda förslagen i planen gör det. Huvudfrågorna med köpavsikt är "alva logiktest öva" och "alva labs test gratis". Resultatfrågorna kommer från dem som redan gjort testet och köper sällan. SEO väljer formulering, sälj vill bara att övningen står först.
2. **Provet ovanför resultattabellen.** Tabellen 1 till 10 drar resultatsökare. De ska passera provet på vägen ned, inte tvärtom.
3. **"Kan man göra om Alva Labs logiktest?" är en köpväg.** Svaret hämtas ur Alvas hjälpcenter. Om arbetsgivaren tillåter ett nytt försök, eller om nästa ansökan kommer med samma test, är det precis då övning i Alvas format är värd något. Avsnittet ska sluta med provet och valet Alva, inte med en länk till N7.
4. **Snabb backningsregel.** Planen backar titeln 9 feb om positionen inte förbättrats. För klustrets säljsida är det för långsamt. Mitt förslag: om klicken på alva-labs-logiktest de första 14 dagarna efter publiceringen ligger mer än 30 procent under de 14 dagarna före, med jämförbart antal visningar, går titeln tillbaka direkt. Talet är en hypotes om vad som är brus, inte ett uppmätt tröskelvärde. SEO avgör om 14 dagar räcker för att se det.

### N7, sälj-tillägg

Snabbsvaret säger att övning höjer resultatet måttligt, och mer med vägledning och med **samma testform** (Hausknecht m.fl. 2007). Det är hela säljargumentet för Premium i en mening: övningsprov i ditt tests format. Sidan ska därför gå från snabbsvaret till "ta reda på vilket test det är" till valet "Mitt test är …" utan omväg. Copy formulerar, och ingenting får lova en viss höjning för en enskild person.

### N8, sälj-tillägg

- **Köpvägen för den som har gjort testet.** Avsnittet "Om det gick dåligt" (spärrtider, omtest) är N8:s enda köpväg utanför I-prov. Den som ska göra om ett test har ett nytt datum. Föreslå att provdatumskärmen tar emot det datumet. Ingen ny funktion, bara att texten leder dit.
- **Skolgruppen ut tidigt,** som planen säger. Jag håller med.
- **I-provets smakprov högt** är rätt för I-provsgruppen. Men den gruppen hittar i dag i-prov direkt. Mät hur många från N8 som väljer I-prov. Under 20 procent av N8:s konton betyder att N8 är en trafiksida och ska bedömas så.

### N9, sälj-tillägg

- Faktarutan om att vi saknar koppling och inte vet testet står kvar. Den är en förtroendesignal, inte en säljnackdel.
- Köpvägen "Annat" tappar avsikten. Se avsnitt 3, punkt 3.

---

## 3. Köpväg och vägg

### 3.1 Planens kedja

Kedjan i planens avsnitt 4 (artikel, prov, konto, "Mitt test", provdatum, vägg, köp) finns i produkten och fungerar, mätt: 13 konton fick `mitt_test` från artikeln på fyra dagar och båda I-prov-kontona hamnade på provdatumskärmen. Det förra granskningen begärde är byggt. Tre saker är fel eller saknas.

1. **Väggen står inte där planen tror.** Planen skriver "efter provet" för de flesta sidor. Inget av de sex köpen på 28 dagar skedde efter ett smakprov. Köpen sker när kontot har övat och slår i testnivån, taket eller kvoten, eller på prissidan. Planens kolumn "Var Premium står" ska därför läsas som var Premium **nämns**. Väggen som säljer är:
   - för Alva, Matrigma, SHL och Aon: övningsprovet i leverantörens format och nivåerna över grund,
   - för I-prov: övningsprovet med tid per deltest,
   - för N7, N9 och N10 utan valt test: avancerad nivå och pass från dag två.
   Det är rätt så. Nämn Premium efter provet, sälj i produkten.
2. **Kontosteget är flaskhalsen, inte sidorna.** 19 procent av dem som ser kontosteget skapar konto (mätt), mål 30. Planens kontomål (6 till 9 feb, 15 till 9 mar från de nya sidorna) bygger på dagens tratt. Lyfter kontosteget till 30 procent ger samma trafik över 50 procent fler konton. Det hör inte till SEO-planen, men ägaren ska veta att det väger tyngre än ordningen mellan N7 och N10.
3. **"Annat" i "Mitt test" för myndigheter och Cubiks.** Planen vill vänta med ett nytt val till 9 feb. Jag godtar det, med ett villkor: kontot ska bära källan (`smakprov:tester-hos-myndigheter`, `smakprov:cubiks-logiks-test`) så att köpen kan läsas per sida även när valet är "Annat". Det gör kedjan redan i dag, mätt i `acquisition_source`. Inget att bygga.

### 3.2 I-prov och korta horisonter

Båda I-prov-kontona har provet 17 och 18 nov, mätt. De har fem och sex dagar på sig och provet är **före** Black Week. Det säger två saker:
- I-prov-köparen väntar inte på en kampanj. Hen köper nu eller inte alls.
- Med fem dagar kvar är en månad mer än hen behöver. Dagspasset passar horisonten bättre. Hypotes: konton med färre än sju dagar kvar väljer Dagspasset oftare än månaden. Prövas genom att läsa vald plan mot `dagar_kvar` från 23 nov. Vad som visas för vem är en produkt- och prisfråga för ägaren, inte för SEO-planen.

### 3.3 Vilken sida är säljsidan

| Plats | Sida | Varför |
|---|---|---|
| 1 | alva-labs-logiktest (U11) | Mest köpbenägen trafik i volym, mätt köp, valet följer med |
| 2 | i-prov (U13) | Högst köpnärhet per besökare, mätt datum satt i 2 av 2 konton |
| 3 | matrigma-test (U8) | Högst klickandel till provet, inbjudan i hand |
| 4 | N9 | Inbjudan i hand, ingen konkurrent med samma sanningsprofil |
| 5 | N7 | Navet för förberedelse, bär övningseffekten till valet av test |
| 6 | N8, N10, U12, U17 | Konton och trafik |

---

## 4. Black Week 23 till 30 november

**Vad SEO kan och inte kan göra för kampanjen:**
- **U11 och U17 är de enda åtgärderna som hinner påverka kampanjen.** Publiceras de måndag 16 till onsdag 18 nov och ägaren begär indexering samma dag, kan nya utdrag synas när kampanjen börjar. Det är inom planens vecka 47 och bryter ingen regel. Mitt förslag: tidigast möjliga dag i vecka 47, inte sist.
- **N7 i vecka 48 ger inga kampanjköp.** En ny sida rankar inte på sju dagar. Publiceringen ska inte flyttas för kampanjens skull, åt något håll.
- **Inga kampanjord i metadata eller sidtext.** Inte "Black Week", "rabatt", "99 kr" eller "49 kr" i seoTitle, description, H1, snabbsvar, FAQ eller schema. Utdragen lever kvar i Google efter 30 nov, FAQ-svar med fel pris är ett felaktigt påstående, och priser beslutar bara ägaren. Kampanjen syns redan på alla publika sidor genom kampanjraden i layouten, som väljer variant före första målningen utan att ändra den cachade HTML:en. Det räcker.
- **Inga ändringar på U11 mellan 23 och 30 nov.** Då går det inte att skilja effekten av titeln från effekten av kampanjen på konton och köp.

**Vad kampanjen kan göra för SEO-sidorna:**
- Konton från Alva, Matrigma och I-prov som skapas 23 till 30 nov möter kampanjen i inloggat läge (kampanjraden i dashboarden). Det är den vägen kampanjen når SEO-trafiken.
- **Mejlet når inte de nya kontona.** Mejlvalet är nytt sedan 13 nov. Konton som skapas efter det får kampanjmejl bara om de kryssat i rutan. Konton från U11 i vecka 47 når alltså kampanjen genom produkten, inte genom mejlet. Det är ägarens beslut och rätt, men det ska inte räknas in som en synergi.
- **Prisraden i artiklarna.** Provkorten (`TypProvKort`), sidokortet (`ArtikelReklam`) och provsidan (`ProvTypSida`) visar grundpriset, 149 kr i månaden, medan kampanjraden överst visar kampanjpriset. Kassan tar rätt pris, så ingen betalar fel. Men besökaren ser två priser på samma sida. Det ska kontrolleras i kampanjens klicktest (`scripts/qa-kampanj.mjs`) före 23 nov. Om prisraderna ska följa kampanjen är det en fråga för den som byggde kampanjen och för ägaren, inte för SEO-planen.

**Mätning under kampanjen:**
- Kampanjköp (kupong `black-week-2026` eller `cyber-monday-2026`) räknas för sig, per `acquisition_source.kalla` och `mitt_test`.
- Baslinjen 18 dec (20 nov till 17 dec) redovisas i två varianter för köp: med och utan kampanjköp. Köpmålen 9 mar bedöms mot varianten utan.
- Andel kampanjköpare som fortfarande betalar efter första dragningen (23 och 30 dec) läses per källa. Det säger om Alva-köparen är en engångsköpare inför ett test eller en kund.

---

## 5. Mätning

Planens 7.1 är rätt i allt väsentligt. Fyra rättelser utifrån det jag såg i datan i dag:

1. **`mitt_test_valt` räknar bara valet i ingången, inte valet från artikeln.** Mätt: fyra händelser sedan 10 nov, men 16 konton med `mitt_test` i `test_planer`. Valet per sida läses i Supabase (`test_planer.mitt_test` mot `acquisition_source.kalla`), inte i PostHog.
2. **`subscription_paid` saknar källa och val.** Händelsen har `plan`, `plats` och belopp. Köp per sida kopplas därför i Supabase via kontot. Det fungerar, men den som läser 9 mar ska veta att PostHog ensam inte räcker.
3. **`sample_started` saknar `test_kind`.** `sample_completed` och `signup_gate_shown` har det. Provstart per typ (I-provets smakprov mot matrisen) går därför bara att läsa via sidans adress. Det är litet, men N8 med två prov på samma sida behöver det.
4. **Klicken går till `/prova` från toppknappen, inte till det inbäddade provet.** Mätt sedan 10 nov: 71 provstarter på `/prova`, under tio i inbäddade prov. N7 till N10 planeras med inbäddat prov efter snabbsvaret. Det är rätt för SEO (uppgift 1 i HTML), men köpvägen går i praktiken genom toppknappen. Mät båda per sida (`article_cta_clicked` med `position` hero eller inline) och flytta inte toppknappen.

**Köpmål per sida, hypoteser.** Jag tar planens tabell i avsnitt 4 med en ändring: N9 till 5 procent och N8 utanför I-prov till 2 procent står, men köpmålen bedöms bara på konton utanför kampanjveckan.

| Sida | Konton 28 d (9 mar) | Köp per konto (hypotes) | Köp 28 d (9 mar) | Ändra om |
|---|---|---|---|---|
| U11 alva | 1,5 gånger dagens takt, läses mot 14 dagar före publiceringen | 5 procent | 1 till 2 | Klicken faller mer än 30 procent på 14 dagar: titeln tillbaka |
| U13 i-prov | 5 | 10 procent | 1 | Under hälften av I-prov-kontona sätter datum: provdatumskärmen ses över |
| N7 | 5 | 5 procent | 0 till 1 | Under 40 procent av kontona väljer ett test: vägen till valet ses över |
| N8 | 4 | 10 procent I-prov, 2 övriga | 0 till 1 | Under 20 procent väljer I-prov: trafiksida, inget köpmål |
| N9 | 3 | 5 procent | 0 till 1 | Som planen, under 50 visningar till 9 feb |
| N10 | 3 | 2 procent | 0 | Inget köpmål |

Summan är 3 till 6 köp på 28 dagar till 9 mar, varav hälften från U11 och U13. Det är små tal, och det ska sägas: planen bygger en mätbar kedja och flyttar intäkten mest genom två befintliga sidor.

---

## 6. Där sälj och SEO-planen skiljer sig

| Fråga | SEO-planen | Sälj | Vem avgör |
|---|---|---|---|
| Ordningen N8 och N9 | N8 och N9 samma vecka (49) | N9 först om ägaren godtar risken, annars som planen | Ägaren med saas-lead |
| Backning av U11 | 9 feb, om positionen inte förbättrats | Inom 14 dagar om klicken faller mer än 30 procent | SEO föreslår fönster, ägaren beslutar |
| U11:s innehållsordning | Resultattabell, göra om, tips, FAQ | Provet ovanför tabellen, "göra om" slutar med provet och valet Alva | Copy och SEO, sälj stöder vilken ordning som helst som håller provet högt |
| N8:s köpväg | I-provets smakprov | Plus omtestdatum till provdatumskärmen från "Om det gick dåligt" | Copy formulerar |
| Kampanjen i metadata och sidtext | Nämns inte | Uttryckligen förbjudet, och inga ändringar på U11 under kampanjveckan | Överens i sak, ska skrivas in i planen |
| Köpmåttens baslinje | 20 nov till 17 dec | Kampanjköp räknas för sig | Saas-lead |

Allt annat stöder jag: U11 och U17 först, N7 i vecka 48, N10 efter 7 dec, N11 i januari, inga sidor för allmänt IQ-test eller mensa, ingen sida per myndighet, ingen ändring på sidor under avläsning före 7 dec, julregeln.

Planen har prövats här ur SEO:s och copys perspektiv bara så långt att inget av mina tillägg rör title, H1, URL eller ordval. Titelformuleringen i U11 och orden i N7 och N8 är deras.

---

## 7. Vad ägaren beslutar

1. **Ordningen:** U11 och U17 tidigast möjliga dag i vecka 47, med indexeringsbegäran samma dag. N9 före N8 om N9 får ett ja.
2. **N9 över huvud taget** (planens punkt 2). Sälj säger ja: det är planens köpnärmaste nya sida.
3. **Backningsregeln för U11:** 30 procent färre klick på 14 dagar, eller planens regel 9 feb.
4. **Inga kampanjord i metadata, snabbsvar, FAQ eller schema, och inga ändringar på U11 23 till 30 nov.**
5. **Kampanjköp räknas för sig** i baslinjen och vid avläsningen 9 mar.
6. **Prisraderna i artiklarna under kampanjen** (149 kr i korten, kampanjpriset i raden överst): låta stå eller följa kampanjen. Kontrolleras i kampanjens klicktest före 23 nov.
7. **Dagspasset för korta horisonter:** om konton med färre än sju dagar till provet ska mötas av Dagspasset före månaden. Pris och erbjudande är ägarens. Sälj föreslår att först läsa vald plan mot dagar kvar från 23 nov.
8. **Kontosteget** (19 procent, mål 30) som nästa konverteringsarbete, före fler nya sidor. Hör inte till SEO-planen men väger mer än den.

## 8. Vad som bör prövas i data

- **Köper konton med provdatum oftare?** Mätt i dag: 5 konton med datum, 0 köp. 17 utan datum, 2 köp. För få för att säga något, och de två I-prov-kontona har provet 17 och 18 nov. Läses om 7 dec.
- **Köper Alva-konton oftare än andra testkonton?** 1 köp av 6 hittills. Läses 7 dec och 18 dec, utan kampanjköp.
- **Var i kontosteget faller besökaren?** 74 såg steget sedan 10 nov, 14 skapade konto. Läses per `test_kind` och källa fyra veckor efter driftsättningen, alltså 8 dec.
- **Väljer I-prov-konton Dagspasset när horisonten är kort?** Från 23 nov, vald plan mot `dagar_kvar`.
