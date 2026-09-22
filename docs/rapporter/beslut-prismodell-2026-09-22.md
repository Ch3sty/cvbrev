# Beslutsunderlag: prismodell för tester och mallar

Kort sammanfattning. Full rapport med tabeller och diagram: `beslut-prismodell-2026-09-22.pdf`, källa `beslut-prismodell-2026-09-22.html`.

Skriven 22 september 2026 på ägarens fråga: *"Vad gör användarna? De verkar mest vara ute efter mallar och tester. Men är våra tester så bra, är de i paritet med stora konkurrenter? Skulle man kunna lägga mallar och tester bakom en liten paywall?"*

Mätfönster: **konton skapade de senaste 30 dagarna (23 augusti till 22 september)**, jämfört med **31 till 90 dagar** där det hjälper. Priser ändras aldrig utan ägarens beslut. Det här är underlaget, inte beslutet.

## Läs det här först

**Ägarens egen testning är borträknad.** Alla siffror nedan exkluderar super_admin-kontot och två testkonton (`test@test.se`, `karlsson@test.se`). Det spelar stor roll, särskilt för just de två funktioner frågan gäller:

| Tabell (90 dagar) | Rader totalt | Varav egna konton | Andel bort |
|---|---:|---:|---:|
| `formatted_cv_downloads` | 51 | 22 | **43 %** |
| `logic_test_v4_sessions` | 148 | 37 | **25 %** |
| `job_applications` | 14 | 13 | **93 %** |
| `cv_analysis_jobs` | 46 | 14 | 30 % |
| `personality_test_sessions` | 11 | 6 | 55 % |
| `letters` | 42 | 4 | 10 % |
| `cv_texts` | 58 | 3 | 5 % |
| `ai_conversations` | 1 | 1 | 100 % |
| `job_matchings_cache` | 6 | 0 | 0 % |
| `profiles` | 96 | 1 | 1 % |

Mallnedladdningarna är alltså inte 51 utan 29 på 90 dagar. En enda mall, `disk-plus`, stod för 12 nedladdningar av en person: ägaren. "Mallar är vår näst största funktion" håller inte efter den här rensningen.

Talen är små. 57 nya konton på 30 dagar, noll betalningar. En enskild persons beteende flyttar varje andel med två till fyra procentenheter. Behandla riktningarna som riktning, inte som signifikans. Det som är säkert oavsett urvalsstorlek är de tekniska konstaterandena: en kodväg som aldrig anropas, en percentil som räknas mot fel population, en paywall som inte finns.

## Fem slutsatser

1. **Ägaren har rätt om testerna, men fel om mallarna.** Tester är den största enskilda ingången och den enda funktionen som får folk att komma tillbaka. Mallar är, efter att ägarens egna 22 nedladdningar räknats bort, en liten funktion: 18 nedladdningar av 7 personer på 30 dagar.
2. **Tester är vår enda retentionsmotor.** Av 47 aktiva konton de senaste 30 dagarna gjorde 23 bara tester, och 8 av dem kom tillbaka en annan dag. De 17 som bara använde AI-funktionerna (brev, analys, matchning) gav 1 återkommande. Testanvändaren är den enda som har en anledning att komma igen i morgon.
3. **Vi tar redan noll betalt för testerna, och det är inte ett medvetet beslut.** 13 av 14 tester är helt gratis i koden. Bara `personlighet-avancerad` har `requiresPremium: true`. Dagskvoten är en slutförd session per `test_type` och dygn, men med 13 typer betyder det 13 tester om dagen. Ingen användare har någonsin slagit i den spärren.
4. **Testerna är nära format-paritet men saknar tre saker som gör dem trovärdiga.** Ingen nedräkningsklocka utom i det verbala testet, ingen adaptiv svårighet, och percentilen jämför mot våra egna användare, inte mot en normgrupp. Se avsnitt 3.
5. **Den dyraste läckan är inte priset, den är en kodväg som aldrig körs.** 23 personer gjorde det anonyma femfrågorsprovet och såg registreringsgrinden. Noll av dem har någonsin kopplat sitt provresultat till ett konto. `claimPendingTestSession()` anropas bara från e-postregistreringsformuläret, aldrig från Google-inloggningens callback, och de flesta nya konton kommer via Google.

## Del 1: vad användarna faktiskt gör

### Vad kontot gör först, och vad det gör sist

Per konto skapat de senaste 30 dagarna, med aktivitet sammanställd ur alla elva sanningskällor.

| Första funktionen | Konton | Återkom en annan dag |
|---|---:|---:|
| CV-uppladdning | 24 | 2 |
| Logiktest | 21 | 7 |
| Mallnedladdning | 2 | 0 |

| Sista funktionen innan de slutade återkomma | Konton | Återkom | Timmar efter registrering |
|---|---:|---:|---:|
| Logiktest | 21 | 7 | 35,7 |
| Brev | 7 | 1 | 1,8 |
| CV-analys | 6 | 0 | 4,1 |
| Mallnedladdning | 6 | 0 | 2,5 |
| CV-uppladdning | 4 | 0 | 0,1 |
| Personlighetstest | 2 | 1 | 8,3 |
| Jobbmatchning | 1 | 0 | 0,3 |

Tabellen säger något viktigt. Alla andra funktioner är slutstationer som nås inom några timmar av registreringen och sedan aldrig mer. Testen är den enda där den sista aktiviteten i snitt ligger **35,7 timmar** efter registreringen, alltså minst en återkomst. Brevet, analysen och mallen är engångsärenden: användaren kom för att lösa en uppgift, löste den, och försvann.

### Grupper: bara tester, bara mallar, eller både och

| Grupp | Konton 30 d | Återkom | Konton 31-90 d | Återkom |
|---|---:|---:|---:|---:|
| Bara tester | **23** | **8 (35 %)** | 11 | 0 |
| Bara AI-funktioner | 17 | 1 (6 %) | 18 | 2 |
| Bara mallar | 3 | 0 | 2 | 0 |
| Bara CV-uppladdning | 3 | 0 | 1 | 0 |
| AI plus test | 1 | 0 | 0 | 0 |

Ingen enda användare hamnade i gruppen "test plus mall". Det är inte samma människor. Den som kommer för ett test kommer inte för en mall, och tvärtom. Att paketera dem som ett gemensamt erbjudande vore att uppfinna ett samband datan inte visar.

Snittet är 1,77 funktioner per aktivt konto. Folk kommer för en sak.

### Anonyma prov utan konto

`anon_test_sessions` har 32 rader, alla från de senaste 9 dagarna (provet fick trafik när artikel-CTA:erna började leverera). 29 har ett ifyllt `score`, alltså slutförda.

PostHog för samma period bekräftar och förfinar:

| Steg | Antal | Personer |
|---|---:|---:|
| `sample_started` (kind = test) | 35 | 24 |
| `sample_completed` (kind = test) | 32 | 23 |
| `signup_gate_shown` (kind = test) | 32 | 23 |
| `signup_started` | 26 | 25 |
| `signup_completed` | 9 | 9 |
| **`draft_claimed` (kind = test)** | **0** | **0** |
| `test_completed` med `anonymous_origin` | **0** | **0** |

Provet fungerar som konverteringsyta: 23 av 24 som börjar slutför, och alla 23 ser grinden. Men **noll** provresultat har någonsin följt med in i ett konto. Orsaken är belagd i koden: `claimPendingTestSession()` i `src/lib/letters/claim-draft-client.ts` anropas från exakt ett ställe, `src/components/auth/register-form.tsx` rad 161. Google-inloggningens callback, `src/app/auth/callback/route.ts`, gör ingen sådan koppling. Av 30 dagars nya konton med trial kom 11 via `oauth_signup_trial` och 10 via `signup_trial`, så ungefär hälften tappar sitt resultat redan av den anledningen. Att `signup_started` 26 bara ger `signup_completed` 9 är den andra halvan av läckan.

### Vad det kostar oss

| Funktion | Volym 30 d | Personer | AI-kostnad 30 d |
|---|---:|---:|---:|
| Logiktestsessioner | 82 | 24 | **0 kr** |
| Mallnedladdningar | 18 | 7 | **0 kr** |
| Personlighetstest | 3 | 3 | **0 kr** |
| CV-analyser | 21 | 13 | 0,21 kr |
| Brev | 17 | 13 | 0,28 kr |

Testerna är statiska JSON-frågebanker och kostar ingenting per körning. Mallarna genereras deterministiskt i `src/lib/cv/templates/` utan AI-anrop och kostar heller ingenting. Hela vår AI-kostnad för 30 dagar är **under 50 öre**, med Gemini-priserna. `ai_usage_costs` loggar bara `cv_analysis`; brevens kostnad står i `letters.ai_cost`.

**Slutsatsen för prissättningen:** vi ska inte ta betalt för tester och mallar för att de kostar oss pengar. De kostar oss ingenting. Om vi tar betalt är det för att de är värda något för användaren, och det är ett helt annat argument som kräver att produkten faktiskt håller.

## Del 2: håller testerna mot konkurrenterna

### Vad vi har

Fjorton tester enligt `src/app/dashboard/tester/testConfig.ts`. Tretton är gratis.

| Test | Frågor | Minuter | Premium |
|---|---:|---:|---|
| Logik grund / avancerad / expert | 15 / 15 / 15 | 20 / 25 / 30 | nej |
| Logikprov (blandat) | 18 | 25 | nej |
| Verbalt grund / avancerad / expert | 48 / 48 / 32 | 25 / 30 / 35 | nej |
| Verbalt prov | 48 | 40 | nej |
| Numeriskt grund / avancerad / expert | 24 / 24 / 32 | 25 / 35 / 35 | nej |
| Numeriskt prov | 36 | 40 | nej |
| Personlighet grund | 50 | 10 | nej |
| Personlighet avancerad | 120 | 25 | **ja** |

Frågebankerna: matrislogik V7 har tre banker om 28 frågor vardera (grund, blandad, expert) plus äldre V4/V5/V6 om 15 var. Verbalt har 24 passager med 96 påståenden i V1 och V2, 12 passager med 48 frågor i expert. Numeriskt har 12 passager med 48 frågor per nivå. Personlighet har 50 respektive 120 items över fem Big Five-dimensioner.

Kvaliteten i matrisbanken är på riktigt: V7 är en lagermotor (`frame`, `texture`, `subgrid`, `figure`, `decor`) med en distraktordoktrin där varje felalternativ kodar ett namngivet feltänk, och ett valideringsskript som underkänner frågor med för avlägsna distraktorer. Det är samma konstruktionsprincip som de professionella matristesten använder.

### Ärlig paritetsbedömning

*Konkurrentfakta i detta avsnitt är sammanställda separat och redovisas med källor i PDF-versionen. Bedömningen nedan vilar på vad vi kan belägga i vår egen kod plus publikt beskrivna format.*

| Testtyp | Format-paritet | Vad som saknas |
|---|---|---|
| Matrislogik | **Ja** | Tidspress och adaptivitet, se nedan |
| Verbalt resonemang | **Ja** | Enda testet med nedräkning; formatet påstående/sant/falskt/går ej att avgöra är rätt |
| Numeriskt resonemang | **Delvis** | Rätt format (tabell/diagram plus flervalsfråga), men ingen klocka och för få passager för att undvika upprepning |
| Personlighet | **Nej** | Likert 1-5 utan forced choice, råpoäng utan normgrupp, ingen social-desirability-kontroll |

**De tre verkliga bristerna:**

1. **Ingen tidspress utom i verbalen.** Jag sökte igenom `src/components/tests/` efter nedräkning: bara `VerbalTestHeader.tsx` har `timeRemaining`. Matrisproven, numeriska testen och personlighetstesten har noll timer-logik. Minutsiffran i `testConfig` är en text i ett infokort, inte en spärr. Det är den enskilt största skillnaden mot ett skarpt prov, där tidspressen *är* svårigheten. Matrigma i sin klassiska form ger 12 minuter för hela provet, och det är just klockan som gör det svårt.
2. **Ingen adaptiv svårighet.** Vi slumpar frågor ur en pool med fast svårighet per nivå. De stora leverantörerna använder item-bankning där nästa fråga väljs efter hur det gick på förra. Det påverkar både upplevelsen och möjligheten att mäta rättvist.
3. **Percentilen jämför mot fel population.** `src/app/dashboard/tester/[slug]/getResultsData.ts` räknar percentilen som andelen av *våra egna slutförda sessioner på samma test_type* som fick lägre poäng, och döljer siffran under 25 sessioner. Texten i `PercentileCard.tsx` säger korrekt "Jämfört med N slutförda test på samma nivå", vilket är ärligt. Men det är inte en normgrupp. Fem av tretton testtyper klarar 25-gränsen i dag; resten visar ingen percentil alls.

**Förklaringar per fråga** finns redan där det spelar mest roll: verbala påståenden har `explanation`, numeriska frågor har `explanation`. Matrisfrågorna har `rule` och `title` men inget `explanation`-fält, så genomgången efter ett logiktest visar regeln men inte resonemanget. Det är ett halvt steg från att vara klart.

### Vad som krävs för att få säga "träna på samma format som Matrigma och SHL"

Utan att ljuga behöver tre saker vara på plats:

1. **En riktig klocka på alla prov-lägen**, serverstyrd så den inte går att kringgå, med samma tidspress per fråga som förlagan. Det är det som gör påståendet sant.
2. **Percentil mot en deklarerad referensgrupp**, med gruppen namngiven i gränssnittet. Så länge den räknas mot våra användare ska texten säga just det, vilket den gör i dag. Vi ska aldrig kalla det en normgrupp.
3. **Formuleringen själv.** Vi får säga "samma format som" när formatet stämmer, alltså matriser med ett saknat element, verbala påståenden med tre svarsalternativ, numeriska tabellfrågor under tid. Vi får aldrig säga "samma test som", "förutsäger ditt Matrigma-resultat", eller använda leverantörernas varumärken som om de vore våra. Dagens copy i `ArticleClusterCTA.tsx` ("Öva på matrislogik, verbalt och numeriskt resonemang med facit och förklaringar") är sann redan i dag och bör inte skärpas förrän klockan finns.

Personlighetstestet ska inte marknadsföras som MAP-likt alls. `src/lib/personalityTest/scoring.ts` är själv ärlig i en kodkommentar: *"detta är råscores, inte normaliserade mot en befolkning"*. Behåll den hållningen i copyn.

## Del 3: prismodell, tre alternativ mot nuläget

**Nuläget:** reverse trial fem dagar med allt, sedan gratisnivå med kvoter. Resultatet efter elva dagar: 20 av 57 nya konton fick trial, noll betalningar, `premium_grants` tom, inga Stripe-sessioner sedan 9 september. Effektanalysen 21 september fastslog grundorsaken: en användare med aktiv Premium möter aldrig en betalvägg, så den yta som ska sälja finns inte under de fem dagar då personen faktiskt är engagerad.

Utgångstal för räkningen: 20 nya konton per vecka, cirka 465 sessioner per vecka, 25 anonyma prov per vecka, 0 betalningar.

### Alternativ A: behåll trialen men undanta tester över nivå 1 och premiummallarna

Trialen ger fortfarande brev, analys och matchning, men nivå 2 och 3 av varje test samt de 30 premiummallarna ligger utanför. Då finns något kvar att köpa när trialen tar slut.

| | Bedömning |
|---|---|
| Registrering | Oförändrad. Grinden ligger kvar där den ligger. |
| Aktivering | Något lägre. Testanvändaren möter en spärr på nivå 2, vilket är precis där dagens data visar att engagemanget sitter. |
| Betalningar | 0 till 1 per vecka. Betalväggen får äntligen en publik: med 23 testkonton i veckan och en spärr vid nivå 2 borde 10 till 15 se ett pris. |
| Intäkt | 0 till 150 kr per vecka vid dagspass 49 kr. |
| Risk | Vi spärrar den enda funktion som ger retention, vid exakt den punkt där användaren är som mest engagerad. Vi kan tappa de 8 återkommande testkontona per månad. |
| Bygge | 6 till 10 agenttimmar. `requiresPremium` finns redan i `testConfig`, gaten sitter serverside. Mallarna har redan `tier`. |
| Mät efter två veckor | `paywall_shown` per yta, andel testkonton som når nivå 2, dag 2-återkomst för testgruppen. |

### Alternativ B: ingen reverse trial, priset syns från dag ett, dagspass 49 kr

Gratisnivån ser priset direkt. Tester nivå 1 och 11 gratismallar är fria. Resten bakom dagspasset, positionerat som "träna inför testet i morgon".

| | Bedömning |
|---|---|
| Registrering | Risk för fall på 10 till 20 procent. Men registreringen är redan trasig av andra skäl: 26 `signup_started` ger 9 `signup_completed`. |
| Aktivering | Lägre andel som provar allt, högre andel som förstår vad produkten kostar. |
| Betalningar | 1 till 3 per vecka. Dagspasset har rätt psykologi för testkunden: någon som har ett prov på tisdag betalar 49 kr på måndag utan att tveka. |
| Intäkt | 50 till 150 kr per vecka, men med en återkommande logik eftersom provdatum återkommer. |
| Risk | Störst av de tre. Vi tar bort det enda vi vet fungerar (trialen når nu 19 av 20 konton) innan vi vet om paywallen säljer. SEO-trafiken landar på artiklar om tester och mallar och en för tidig spärr kan sänka registreringarna. |
| Bygge | 12 till 18 agenttimmar. Trialen ska bort ur registreringsflödet, gratisnivån behöver en egen prisyta, all copy om "fem dagar Premium" i artikel-CTA:er och prissida ska skrivas om. |
| Mät efter två veckor | Registreringar per vecka mot 20, `pricing_viewed`, `paywall_shown` till `paywall_cta_clicked`, kassabesök. |

### Alternativ C: Testpaket 79 kr och Mallpaket 49 kr vid sidan av Premium

Två fristående engångsköp. Testpaketet ger alla tester på alla nivåer i 30 dagar; mallpaketet alla 42 mallar.

| | Bedömning |
|---|---|
| Registrering | Oförändrad. Inget tas bort från gratisnivån. |
| Aktivering | Oförändrad eller något högre, eftersom erbjudandet är begripligt. |
| Betalningar | 0 till 1 per vecka för testpaketet. **Mallpaketet: nära noll.** Med 7 personer i månaden som laddar ner en mall finns ingen köpargrupp. |
| Intäkt | 0 till 80 kr per vecka. |
| Risk | Prisstegen har redan fyra nivåer som sålt noll enheter. Att lägga till två produkter till gör valet svårare, inte lättare. Och ett engångsköp som inte förnyas bygger ingen MRR. |
| Bygge | 14 till 20 agenttimmar plus två nya Stripe-produkter, som bara ägaren får skapa. |
| Mät efter två veckor | Köp per produkt. Med de här volymerna är två veckor för kort för att skilja noll från noll. |

### Rekommendation: A, men med en spärr som är flyttad och en förutsättning som måste byggas först

**Rekommenderat alternativ är A, i en modifierad form, och ingenting av det bör rullas ut förrän det anonyma provets kopplingsbugg är lagad.**

Motiveringen i tre meningar: testerna är den enda funktion som får folk att återvända, så de får inte spärras vid den punkt där engagemanget uppstår, men de tål en spärr längre in, vid expertnivå och prov-läge, där användaren redan har bevisat att hon bryr sig. Alternativ B river det enda som bevisligen fungerar innan vi vet om en betalvägg säljer, och alternativ C bygger en produkt kring mallarna, som efter borträkning av ägarens egen testning har sju användare i månaden. Och viktigast: vi har i dag noll betalningar inte för att priset är fel utan för att 23 personer i veckan gör vårt test, ser registreringsgrinden, och sedan tappar sitt resultat på vägen in, vilket är en bugg och inte en prisfråga.

**Konkret form på A:**

- Nivå 1 och 2 av alla tester förblir gratis. Expertnivån och de tre prov-lägena kräver Premium eller dagspass.
- Prov-läget är rätt yta att ta betalt för, eftersom det är där tidspressen och "skarpt läge" ligger, alltså det som liknar det användaren faktiskt ska igenom.
- De 12 gratismallarna ligger kvar gratis. Premiummallarna är redan bakom Premium och behöver ingen ändring.
- Trialen behålls, men priset ska synas under den, vilket redan är påbörjat efter 21 september.

Förutsättningen som måste byggas först är punkt 1 nedan. Att spärra något innan konverteringsvägen in fungerar är att sätta en kassa vid en dörr ingen kommer igenom.

## Del 4: tre saker att göra oavsett prismodell

### 1. Laga det anonyma provets koppling till kontot

23 personer i veckan slutför provet och ser grinden, noll tar med sig resultatet in. `claimPendingTestSession()` anropas bara från e-postformuläret. Lägg anropet i OAuth-callbacken också, och låt landningen efter registrering visa facit och förklaringar direkt. Det är den enda åtgärden i hela underlaget som kan flytta registreringar inom två veckor.

**Insats:** S, 2 till 4 agenttimmar. **Mät:** `draft_claimed` med kind test, från 0 till över 10 i veckan.

### 2. En klocka på prov-lägena och percentil som säger vad den jämför med

Prov-lägena ska ha en serverstyrd nedräkning. Det är det enda som gör "träna på samma format" till ett sant påstående, och det är samtidigt det som gör prov-läget värt att ta betalt för i alternativ A. Samtidigt: behåll dagens ärliga percentiltext, och visa den inte alls där underlaget är under 25 sessioner, vilket koden redan gör rätt.

**Insats:** M, 8 till 12 agenttimmar. **Mät:** andel påbörjade prov som slutförs, och om tidspressen sänker slutförandegraden för mycket.

### 3. Låt testartiklarna leda till provet, inte till hubben

`/artiklar/logiska-tester` är vår största enskilda sida med 62 klick på 30 dagar. Test-klustrets CTA i `src/components/artiklar/ArticleClusterCTA.tsx` pekar på `/verktyg/rekryteringstester`, som fick 19 klick. Det anonyma provet, den yta som bevisligen konverterar 23 av 24 som börjar, länkas från exakt en sida i hela produkten. Peka test-klustrets CTA direkt på `/verktyg/rekryteringstester/prova`.

**Insats:** S, 1 till 2 agenttimmar plus copy. **Mät:** `sample_started` med kind test, från 35 till över 80 i månaden.

Förklaringar per matrisfråga är en fjärde kandidat: verbalt och numeriskt har redan `explanation` per fråga, matrisbanken har bara `rule`. Det är M i insats eftersom 84 frågor behöver skrivas, och det kan vänta tills punkt 1 till 3 är mätta.

## Behöver ägarens beslut

- **Vilket alternativ.** Rekommendationen är A i modifierad form: expertnivå och prov bakom betalvägg, nivå 1 och 2 gratis, trialen kvar.
- **Ordningen.** Jag föreslår att ingen betalvägg flyttas förrän åtgärd 1 i del 4 är live och mätt i två veckor. Annars vet vi inte om ett utfall beror på priset eller på buggen.
- **Inga prisändringar föreslås.** Dagspasset 49 kr räcker för alternativ A. Alternativ C hade krävt två nya Stripe-produkter, vilket bara ägaren skapar, och rekommenderas inte.
- **Mallarna bör lämnas ifred.** Med sju verkliga användare i månaden finns inget att prissätta. Frågan bör ställas om igen när volymen bär den.

## Datakvalitet

| Vad vi inte ser | Varför | Vad som krävs |
|---|---|---|
| Om en paywall på tester sänker registreringar | Ingen sådan paywall har funnits | Kräver att alternativ A körs och mäts |
| Attribution från artikel till konto | `acquisition_source` var null till 21 sep, proxyn kördes aldrig | Konton skapade efter 21 sep 22:00 |
| Anonyma prov före 13 september | `anon_test_sessions` har bara 9 dagars data | Tidsserien börjar 14 sep |
| Percentil för 8 av 13 testtyper | Under 25 slutförda sessioner, koden döljer korrekt | Volym |
| Om testkvoten någonsin binder | Ingen användare har slagit i den | Spärren är i praktiken inaktiv med 13 test_type |
| Betalningsvilja för testpaket | Noll betalningar av något slag sedan 9 september | Kräver en betalvägg med publik |

Exkluderingslistan är kontrollerad mot `admin_users` och `auth.users` 22 september. Tabellnamn och kolumner är kontrollerade mot `information_schema`. Kodpåståenden är kontrollerade mot filerna i repot, med fil och rad angivna där de spelar roll.
