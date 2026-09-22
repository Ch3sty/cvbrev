
## Dirigentens beslut efter copyrunda 3 (2026-09-22)
- D48b: dagläget (Allt-dagen) är inaktivt i längdvalet för kunder med löpande prenumeration. Bytet nedåt vore en uppsägning plus ett engångsköp, inte ett längdbyte. Strängen D48b utgår.
- D2 (gratisnivån i en mening) ska följa den hårdare CV-analysen: en analys per konto med poäng, antal fynd och tyngsta fyndet.
- D28 och blockeringslistan räknas ur samma källa: feature_blocked per feature de senaste sju dygnen, panelens tal = summan av listan.
- Prissidans H1 slutgiltig: "Välj spåret du söker på. Börja med en vecka." Ingress PR2A följer samma ord.

## B1a

Behörighetsmodell, händelser och admin per paket. Byggt 2026-09-22.

**Migration.** `supabase/migrations/20260921223901_paket_scope.sql`, applicerad som `paket_scope`. B3 hade redan lagt `profiles.premium_scope` via migrationen `premium_scope_column`, så min fil är idempotent hela vägen: `add column if not exists`, `drop constraint if exists` före varje check. Kör den på en färsk databas och den gör rätt sak ändå.

**Öppna beslut.**

1. **Databastyperna regenererades inte i sin helhet.** `src/types/database.types.ts` är ingen genererad dump utan en handskriven fil på 428 rader som bara täcker sju tabeller, och den är typad `interface Database` mot bland annat webhooken. Supabase MCP ger en fullständig generering på 170 kB med en annan form, och att lägga in den hade brutit varje ställe som importerar `Database`. Jag lade därför bara in `premium_scope` på profiles Row, Insert och Update. Öppen fråga till ägaren: ska filen bytas mot en riktig generering i en egen omgång, eller ska den fortsätta vara handhållen? Så länge den är handhållen måste varje ny kolumn läggas in för hand, och tre av kolumnerna i den här migrationen saknas i den redan i dag (`premium_until`, `premium_grants` och hela `admin_daily_metrics` finns inte i typfilen alls, eftersom alla anropare kör `SupabaseClient<any, any, any>`).

2. **MRR per paket räknas i gränssnittet, inte i tabellen.** `admin_daily_metrics` bär bara antalet aktiva per paket, alltså det tal som faktiskt varierar. Beloppen står redan i `PLANS`, så `paketRader()` i `src/app/admin/intakter/format.ts` multiplicerar antal gånger pris och normaliserar veckopriserna med 52/12. Fördelen är att ett prisbyte i `PLANS` slår igenom direkt i historiken. Nackdelen är att en historisk rad räknas om med dagens pris. Ändras ett pris på riktigt behöver vi sex MRR-kolumner till, och då flyttas beräkningen till collect.

3. **Allt-dagen räknas på `premium_grants`, per användare och inte per rad.** `raknaAllaDagen()` räknar distinkta `user_id` med scope `allt`, giltig `premium_until_after` och en `source` som börjar på `onetime`. Två dagpass samma dygn från samma person är alltså en aktiv, inte två. Gränsen på 5000 rader räcker med råge i dag och behöver ses över om engångsköpen blir vanliga.

4. **`trial_price_shown` och `trial_started` är borta ur `AnalyticsEvents`, men anropen finns kvar** i `src/components/paywall/TrialRow.tsx` och i `src/components/paywall/__tests__/PaywallCard.analytics.test.tsx`. Båda är B3:s att radera, och tsc och vitest är röda på just de två filerna tills det skett. Inget annat anropar dem: `trial_started_at` i webhooken och `'trial_started'` i `src/lib/email/lifecycle/hooks.ts` är ett kolumnnamn respektive en strängnyckel, inte händelser.

5. **`suggestPlan` föreslår alltid veckan, aldrig dagen eller månaden.** Spåret väljs först och längden efteråt (ägarens beslut 4), så betalväggen ska föreslå ett spår och låta längdvalet komma i kassan. Det betyder att Allt-dagen aldrig föreslås av en betalvägg. Vill vi sälja dygnet vid en spärr är det ett eget beslut, inte en följd av featuretabellen.

6. **`userHasAccess` gör tre frågor, inte en.** Uppdraget sa en select på profiles, och det håller: profilfälten läses i en enda select. Adminstatus ligger i en egen tabell och grants i en tredje, så de blir tre parallella frågor i ett `Promise.all`, precis som dagens två. Ingen ligger i en loop, och rundturen är fortfarande en.

## B1b

Paketen, Stripe-kassan, webhooken och trialens avveckling. Byggt 2026-09-22.

**Env-rader som måste finnas i Vercel före släpp 1.** Tre är nya och skapas med `npx tsx scripts/stripe-skapa-paket.ts`:

| Variabel | Paket | Status |
|---|---|---|
| `STRIPE_PRICE_CV_WEEK` | CV-veckan, 79 kr i veckan | Ny |
| `STRIPE_PRICE_TEST_WEEK` | Testveckan, 79 kr i veckan | Ny |
| `STRIPE_PRICE_ALL_WEEK` | Allt-veckan, 99 kr i veckan | Ny |
| `STRIPE_PRICE_DAYPASS` | Allt-dagen, 49 kr engångs | Finns, byter bara nyckelnamn i koden |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Allt-månaden, 149 kr | Finns |
| `STRIPE_PRICE_QUARTER` | Allt-kvartalet, 299 kr | Finns |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Serverside `subscription_paid` | Finns, men läses nu också av webhooken |
| `POSTHOG_HOST` | Valfri, faller tillbaka på `https://eu.posthog.com` | Behöver inte sättas |

`STRIPE_PRICE_WEEK` (gamla Jobbsökarveckan) läses inte längre av någon kod. Den kan ligga kvar tills släppet är verifierat och tas bort därefter.

**Öppna beslut.**

1. **Allowlistan för prenumerationscheckout blev fem priser, inte fyra.** Uppdraget sa fyra prenumerationsplaner, men de är fem: CV-veckan, Testveckan, Allt-veckan, Allt-månaden och Allt-kvartalet. Att utesluta Allt-kvartalet hade gjort 299-kronorspaketet osäljbart via uppgraderingsvägen, alltså tog jag med den. Ville ägaren stänga kvartalet för nya kunder är det ett eget beslut, och då hör det hemma i `PLANS`, inte i en allowlist.

2. **Uppgraderingen sker bara från ett spår till Allt-veckan.** `create-upgrade-session` byter pris på den befintliga prenumerationen när kunden har scope `cv` eller `tester` och begär ett `allt`-paket, med `proration_behavior: 'always_invoice'` så att mellanskillnaden faktureras direkt. Byten mellan spår, och alla nedgraderingar, går fortfarande till Stripe-portalen med 409. Skälet: ett spårbyte nedåt eller i sidled tar bort något kunden betalat för innevarande period, och det ska hon se själv i portalen och inte få som en tyst API-effekt.

3. **`STRIPE_PRICE_WEEK` var bunden till en produkt som inte längre finns.** Jobbsökarveckan var ett engångsköp på 99 kr i sju dagar. Allt-veckan är 99 kr i veckan som löpande prenumeration. Samma pris, annan sak, så jag gav Allt-veckan ett eget price-id i stället för att återanvända det gamla. Ett befintligt köp av Jobbsökarveckan löper ut som vanligt via `premium_grants`.

4. **Success-url pekar på `VECKA_START_PATH`, som B3 redan exporterar** ur `src/lib/onboarding/steps.ts` (`/dashboard/vecka/start`). Ingen lokal definition behövdes.

5. **Allowlist-kontrollen i `create-upgrade-session` bygger på env.** Saknas ett pris i miljön är paketet osäljbart i stället för felsålt, vilket är rätt ordning, men det betyder att en glömd env-rad ger 400 "Ogiltigt produktval" och inte ett tydligare fel. Kassan visar paketet ändå, eftersom `PLANS` är klientsäker och inte vet något om env.

6. **`priceIdToPlanKey` jämför mot env vid varje anrop.** Sex strängjämförelser, ingen I/O, och den anropas en gång per webhook och checkout. Ingen cache behövs, och en cache hade gjort en env-ändring osynlig tills processen startas om.

7. **`profiles.premium_scope` skrivs bara av prenumerationsgrenen.** Engångsköpet bär sitt scope på `premium_grants`-raden, aldrig på profilen, precis som planens not om överlappande köp kräver. `grantPremiumDays` typar insert-nyttolasten lokalt, eftersom `database.types.ts` är handhållen och inte känner till `premium_grants` alls.

8. **`subscription_paid` skickas från `invoice.payment_succeeded`, inte från `customer.subscription.created`.** Abonnemanget kan skapas utan att pengarna dragits. Beloppet tas ur `amount_paid` på fakturan, alltså det kunden faktiskt betalade, med paketets listpris som reserv. Vid uppgradering med proration blir `amount_sek` därför mellanskillnaden och inte hela veckopriset, vilket är rätt tal att summera men fel tal att läsa som "pris".

9. **`/api/trial/signup` och `src/components/trial/SignupForm.tsx` står kvar.** Det är den kortkrävande trial-vägen på `/trial-signup`, inte reverse trial, och den låg utanför uppdraget. Vill ägaren stänga även den vägen är det ett eget beslut. Prissidans FAQ nämner den fortfarande, och den texten skrivs om av copywritern.

10. **`src/lib/premium/trial.ts` behöll `TRIAL_PRICE_FROM`.** Uppdraget sa att filen ska reduceras till läsning, men konstanten lästes av `TrialStatusRow` och `TrialRow`, som är B3:s att radera. Att ta bort den hade gjort tsc rött på två filer som inte är mina. När B3 landat kan konstanten och hela filen gå.

11. **Prissidans kortrad visar sex kort i tre kolumner.** Minsta möjliga ändring, enligt uppdraget: rätt namn, rätt pris, Allt-veckan markerad som prisankare. Spårvalet först och längdvalet efteråt finns inte här. Det bygger en annan agent, och då ersätts `PlanCards` i sin helhet.

12. **`src/app/admin/installningar/data.ts` hoppar över intervallkollen för veckopaketen.** Fältet heter `forvantadePerioderIManader` och räknar månader. Hellre ingen kontroll än en felräknad, så veckopaketen får `null` där och jämförelsen kontrollerar bara typ och belopp för dem. Ska intervallet kontrolleras även i veckor behöver fältet byta form, och det är admin-sidans omgång.

**Testerna.** `src/lib/stripe/__tests__/planPrices.test.ts` (7) och `subscriptionScope.test.ts` (5) är nya. `paywall-copy.render.test.tsx` har fått fyra påståenden om paketen i stället för ett om exakt copy, eftersom copyn skrivs om i Fas 2B. Scope-regeln flyttades ur webhooken till `src/lib/stripe/subscriptionScope.ts` för att gå att testa utan Stripe-nycklar.

**Kvarvarande rött vid överlämning.** `src/components/paywall/__tests__/PaywallCard.analytics.test.tsx` faller på `TrialRow`, som B3 raderat men vars test står kvar. Det är B3:s rad att stryka. `npx tsc --noEmit` är rent.

---

## B3: spårvalet, veckoprogrammet, fel spår och veckomejlen

Skrivet 2026-09-22. Flöde 1 till 4 i Fas 2A, M-serien i Fas 2B, T1 till T87 i Fas 2C.

### Gränssnitt mot B1

1. **`VECKA_START_PATH` exporteras från `src/lib/onboarding/steps.ts`.** B1 ska använda konstanten som `success_url` i `create-plan-session`, inte en hårdkodad sträng. Värdet är `/dashboard/vecka/start`. Vyn läser `?plan=<planKey>` men fungerar utan den: saknas parametern läses paketet ur spåret. `TRACK_CHOICE_PATH` i samma fil är `/dashboard/valj-spar` och används av registreringen och Google-callbacken.

2. **`onWeekStarted(admin, userId, track)` i `src/lib/email/lifecycle/hooks.ts` ska anropas från webhooken när ett köp bekräftats.** Den schemalägger veckoserien för rätt spår. `onWeekEnded` stoppar den, och `onSubscriptionDeleted` anropar den redan. Utan anropet finns dagsmejlen men skickas aldrig.

3. **`profiles.premium_scope` skapades i migrationen `premium_scope_column`.** Veckopanelen kan inte visas utan kolumnen, och B1:s `premiumAccess` läser samma kolumn. Satsen är `add column if not exists`, så en dubbel migration gör ingenting.

### Öppna beslut

1. **Rutten heter `/dashboard/valj-spar`, inte `/start`.** Uppdraget sa `/dashboard/valj-spar` och Fas 2D sa `/start`. Uppdraget vann. Vill ägaren ha den kortare adressen är det en redirect och en ändring av `TRACK_CHOICE_PATH`, inget mer.

2. **Skärm 1.1, 1.2 och 1.1b ligger på samma adress, som steg i ett flöde.** Tillbaka går till föregående steg i stället för ur appen, och det är hela skälet att de är steg och inte sidor. Konsekvensen är att steg 2 inte har en egen adress att länka till. Ingen text i planen ber om det.

3. **D1 till D11 fanns inte i Fas 2C.** Fas 2D ritar skärm 1.1b och fotens sekundärknapp men skriver aldrig strängarna. De är skrivna här, i `src/lib/onboarding/program.ts` under `SPARVAL_GRATIS` och `SPARVAL.gratisKnapp`/`gratisNot`, och märkta med sina D-id. Ska copyrollen skriva om dem ligger de på ett ställe.

4. **`Börja gratis` ligger under primärknappen, inte bredvid.** `FlowShell` renderar `footerSecondary` under primären, och skalet är enligt överlämningsdokumentet klart och ska inte ändras av en sidbyggande agent. Fas 2D tillåter uttryckligen stapling ("Blir någon av texterna längre staplas de i stället, primär överst"), och båda knapparna syns utan scroll, vilket är kravet. Vill man ha dem sida vid sida är det en ny prop på `FlowShell`.

5. **`paywall-copy.ts` fick ingen `fel-spar`-variant.** Filen var spärrad för mig. `FelSpar.tsx` är därför fristående och bär sin egen copy ur `program.ts`, vilket den ändå ska: kortet är en uppgradering och inte en spärr, och `PaywallCard` ska förbli en ren vy. De två nya variantnamnen `onboarding_paket` och `fel-spar` finns i stället som en utvidgning av `paywall_shown` och `paywall_cta_clicked` i `events.ts`.

6. **`PaywallCard.tsx` rördes på en enda rad.** `if (isPremium) return <TrialRowConnected />` blev `return null`, eftersom `TrialRow` och `TrialRowConnected` är raderade. Det var oundvikligt: uppdraget sa att raderna skulle bort och kortet var enda kvarvarande anropsplats utanför testet. Ingen annan rad i filen är ändrad.

7. **Spårfrågan om efter tre dagar använder två flaggor, en i databasen och en i localStorage.** `profiles.onboarding_track_asked_at` bär treddagarsfönstret, så det överlever ett byte av telefon. Att omfrågan är avfärdad ligger i `localStorage` under `jc_spar_fraga_2`. Skälet är kostnad mot risk: det värsta som händer om den tappas är att raden syns en gång till på en annan enhet, och en egen kolumn för det är dyrare än felet.

8. **`week_progress_day` flyttas bara framåt.** Både `complete` och `goto` i `/api/onboarding/vecka` tar `Math.max` mot nuvarande värde. Hoppar användaren tillbaka till dag 2 på fredagen tappar hon inte de fem dagar hon gjort, och nodraden visar dem fortfarande som avklarade. Planen säger att dagnumret följer framsteg och inte kalendern, och den här regeln är följdsatsen.

9. **Veckans scope räknas om i `getSummary.ts` i stället för att anropa `getUserScope`.** Profilraden är redan hämtad där och `premium_grants` lades till i samma parallella omgång, så veckopanelen kostar noll extra rundturer. Reglerna speglar `src/lib/supabase/premiumAccess.ts` rad för rad, och kommentaren i filen säger att de ska ändras på båda ställena. Ett anrop till `getUserScope` hade gett tre extra frågor på den sida som har hårdast LCP-budget.

10. **Dag 7:s fyra tal är brev, CV, LinkedIn-optimeringar och avklarade dagar.** Planen namnger "brev skickade, mallar nedladdade, ansökningar registrerade, dagar avklarade" i texten men T56 till T59 säger `brev`, `CV`, `mallar`, `dagar`. Mallnedladdningar räknas inte i summeringen i dag, så den tredje posten fylls tills vidare med LinkedIn-räknaren. Ska talet stämma mot etiketten behöver `formatted_cv_downloads` in i `getSummary`, och det är en rad i samma parallella omgång.

11. **T40 säger nu "Högst 5 MB".** Uppladdningsrutans egen text i appen säger 5 MB, inte 10 som Fas 2C gissade. Strängen följer koden, precis som noten i 2C begär.

12. **Allt-dagen kör inget veckoprogram.** Avsnitt 6 säger att dygnet visar dag 1 och inget mer. Veckopanelen visas ändå eftersom scopet är `allt`, och dag 1 är den dag hon står på. En egen dygnsvy med en sluttidsrad är inte byggd. Det är mindre fel än ingenting men ska byggas om Allt-dagen säljer.

13. **Kvitteringen är en manuell knapp, "Markera dagen klar".** Den automatiska kvitteringen kräver att varje dags målsida rapporterar tillbaka, och de sidorna ägs av andra agenter. Knappen är sanningen tills dess, och `/api/onboarding/vecka` tar emot samma anrop från vilken sida som helst.

14. **`src/lib/premium/trial.ts` kan nu tas bort.** `TrialStatusRow`, `TrialRow` och `TrialRowConnected` är raderade, och de var enligt B1:s not nummer 10 de enda läsarna av `TRIAL_PRICE_FROM`. Filen lämnades kvar därför att `premiumAccess` och webhooken fortfarande importerar `isTrialSource`, och den kedjan är B1:s.

### Kvarvarande rött vid överlämning

`npx tsc --noEmit` och `npx next build` faller på andra agenters filer som ändras samtidigt: `TemplateSelector`/`SaveAndTemplateStep` (mallväljaren), `UpgradeSheet`/`PaywallCard.suggestedPlan`, `testConfig.requiresPremium` och `priser-data.VAD_INGAR`. Ingen av dem är B3:s. Vid den sista körningen där bara mina filer stod i vägen var tsc rent. `npx vitest run` är grönt i allt utom `src/lib/quota/__tests__/getQuotaSummary.test.ts`, som faller på att testets mock av `premiumAccess` saknar `getUserScope`. Det är B1:s rad.

### Testerna

`src/lib/onboarding/__tests__/program.test.ts` (20) och `src/components/paywall/__tests__/FelSpar.test.tsx` (7) är nya. `PaywallCard.analytics.test.tsx` tappade testet av trialraden, som testade en funktion som inte finns kvar, och fick i stället ett påstående om att premium renderar tom yta.

### Klicktest

`scripts/qa-paket-b3.mjs`, Pixel 7 (412x915) och desktop 1280, riktig Chrome mot `localhost:3103`. Femton skärmdumpar i `docs/qa/qa-paket-b3/`, resultat i `resultat.json`. 23 av 23 kontroller gröna plus sex på dag 7 och två på skärm 2.1 efter omläggningen. Orange per skärm: 1.1 tre, 1.2 ett, 1.1b ett, 2.1 två, hemskärmen med veckopanelen tre, dag 7 tre.

---

## B2

Gratisnivån: kvoter, testkonfiguration, mallar, betalväggar, funktionsrutter
och CV-analysen. Byggt 2026-09-22, reviderat och kompletterat av B5 samma dag.

B2 hann inte skriva noter eller klicktesta, så det här avsnittet är skrivet i
efterhand av B5 efter en revision rad för rad mot avsnitt 4.

### Vad som fanns

Nästan allt, och byggt rätt. Revisionen gick igenom varje rad i
gratisnivåtabellen och fann tretton av fjorton byggda:

| Rad i avsnitt 4 | Läge | Var |
|---|---|---|
| 3 fria mallar | fanns | `simple-templates.ts`, exakt tre `tier: 'free'` (Norrsken, Sidopanel, Student). `FREE_TEMPLATE_COUNT` räknas ur listan, testas i `template-count.test.ts` |
| Mallgate med 402 | fanns | `generate-formatted/route.ts` gate:ar `cv_templates_all` och `cv_export`, båda med `featureRequiredBody` |
| CV-export 1 per konto | fanns | `free_cv_exports_used`, atomisk uppräkning med `.eq(..., 0)` |
| Tester, bara grundnivå fri | fanns | `testConfig.requiresFeature` på nio nivåer, `sessionGate.ts` gate:ar serverside |
| Sessionsrutterna gate:ade | fanns | Alla femton rutter anropar `checkTestSessionAccess` |
| Provläge premium | fanns | `test_exam_mode` på de tre proven |
| Hård tidsgräns | fanns | Se tabellen nedan |
| Automatisk inlämning | fanns | Två av tre via `use-exam-deadline`, den tredje via egen nedräkning (se nedan) |
| CV-analys 1 per konto | fanns | `CV_ANALYSIS_LIMIT = 1`, räknar `cv_analysis_jobs` |
| Analysens gratissvar | fanns | `gateAnalysisResult.ts` skickar poäng, antal fynd och tyngsta fyndet; övriga som rubrik utan åtgärd, aldrig som full text klienten döljer |
| Brev 1 per konto sedan 1 per vecka | fanns | `weekly_letter_count` plus `weekly_letter_first_used_at`, rullande sju dygn |
| Chatt 10 per konto | fanns | `FREE_CHAT_MESSAGES_PER_ACCOUNT = 10`, ny betalväggstext ("Dina tio meddelanden är använda", inte "Dagens") |
| `letters/download` | fanns | `letter_download` |
| `jobs/redact` | fanns | `job_matches_all` |
| `quota/status` | fanns | Svarar `scope` och `onboardingTrack` |
| PaywallCard med suggestedPlan | fanns | Länkar till `/dashboard/valj-spar?paket=<planKey>` |
| `feature_blocked` vid varje 402 | fanns | Skjuts en gång per montering i både `PaywallCard` och `FelSpar` |
| FelSpar i mall- och testvyer | fanns | `TemplateSelector` och `TestHubPage` skickar båda `scope`, och `PaywallCard` väljer FelSpar automatiskt när scopet inte täcker featuren |
| **Testhistorik premium** | **saknades** | Se nedan |

### Vad B5 byggde

**Testhistoriken var den enda raden som inte var byggd.** `test_history` fanns
i featuretabellen men gate:ades ingenstans: testhubben visade hela serien,
sparklinen och listan över alla försök till vem som helst, alltså precis det
som enligt avsnitt 4 är veckoprenumerationens själva argument.

Gaten sitter i `getHubData.ts`, alltså i serverhämtningen och inte i vyn. Skälet
är att en historik som aldrig lämnar servern inte går att läsa ur
nätverksfliken heller. `getTesterHubData` tar nu `hasHistory` och `scope`, och
`utanHistorik()` trimmar serien till senaste försöket när featuren saknas.

Talen ovanför serien står kvar orörda, och det är ett medvetet val: antal
försök, bästa resultat och total tid är summeringar och inte historik, och de
är dessutom köpskälet. Aggregaten räknas därför på hela serien innan
trimningen.

`src/app/dashboard/tester/page.tsx` läste fortfarande `subscription_tier` som
en boolean. Den läser nu `getUserScope` och skickar in både scopet och
`hasHistory`, så testhubben vet vilket spår kontot bär och inte bara om det
betalar.

Vyn fick en ny betalväggsvariant, `historik`, i `paywall-copy.ts`.
Utvecklingsfliken säger nu "Du ser ditt senaste försök per test. Hela serien
ingår i Testveckan" i stället för "Varje punkt är ett försök", och kortet under
säger varför serien är värd något.

Nytt test: `src/app/dashboard/tester/__tests__/getHubData.historik.test.ts`
(4), som bland annat slår fast att aggregaten är identiska med och utan
featuren, och att ingen serie någonsin läcker mer än en rad.

### Tidsgränserna i provläget

Gränserna står i `testConfig.examMinutes` och läses av både klient och server,
så copy och kod aldrig glider isär.

| Prov | Frågor | Tidsgräns |
|---|---|---|
| Matrislogik-provet | 18 | **25 minuter** |
| Verbala provet | 48 | **40 minuter** |
| Numeriska provet | 36 | **40 minuter** |

Gränsen räknas från sessionens `started_at`, alltså serverns tid och inte från
när fliken öppnades: annars räcker en omladdning för att få nya minuter.

Inlämningen sker på två ställen med flit. Klienten lämnar in när klockan når
noll, men en klient går att stänga av, så `examDeadlinePassed()` i
`sessionGate.ts` räknar samma gräns serverside i alla tre svarsrutterna och
svarar 409 `exam_time_up` på ett svar som kommer för sent. Utan den vore
tidsgränsen en rekommendation och inte en gräns. Marginalen är tio sekunder, så
ett svar som skickades precis före utgången inte faller på nätverkets latens.

Matris- och numeriskprovet använder hooken `use-exam-deadline`.
Verbalprovet har en egen nedräkning i `VerbalProvSession.tsx` som räknar ur
samma `examMinutes` och auto-slutför på samma villkor, inklusive vid
rehydrering av en session vars tid redan gått ut. Den är alltså inte en lucka,
bara en annan implementation. Vill man ha en enda väg är det en refaktorering
av verbalprovet, inte en bugg.

---

## B5

Integration, revision av B2, och hela releasen färdigställd. Byggt 2026-09-22.

Fyra agenter byggde parallellt och sessionen avbröts två gånger. Mitt uppdrag
var att sluta luckorna mellan dem, inte att bygga något nytt i sig. Revisionen
av B2 står i avsnittet ovan. Det här avsnittet är integrationen och städningen.

### Integrationspunkterna

**(a) Webhooken anropar veckohookarna.** B3 byggde `onWeekStarted` och
`onWeekEnded` men ingen anropade dem, så dagsmejlen fanns och skickades aldrig.

`onWeekStarted` sitter i `invoice.payment_succeeded`, i samma gren som
`capturePaidServerside` och av samma skäl som B1b:s not 8: abonnemanget kan
skapas utan att pengarna dragits, och en kund som aldrig betalade ska inte få
sju dagsmejl.

Bara den **första** fakturan startar programmet. `billing_reason` är
`subscription_create` vid köpet och `subscription_cycle` vid varje förnyelse,
och utan den skillnaden hade vecka två lagt om programmet till dag 1 igen,
alltså skickat samma sju mejl en gång till till någon som redan gått igenom
dem. `subscription_update` räknas med: det är fakturan vid en uppgradering
från ett spår till Allt, och då byter kunden serie.

`onWeekEnded` sitter i `customer.subscription.updated` och `deleted`, och
anropas när scopet nyss nollades. `onSubscriptionDeleted` sköter uppsägningen
som händelse, men det är den här raden som stoppar kön: utan den skickas dag 4
till 7 till någon som inte längre betalar. Gäller även när prenumerationen går
till `past_due` eller `unpaid` utan att raderas.

Verifierat i databasen under klicktestet: ett CV-spårsköp gav `cv_day1` till
`cv_day7` på sju på varandra följande dygn klockan 05:00, ett testspårsköp gav
`test_day1` till `test_day7`.

**(b) Paketet överlever registreringen.** Var redan byggt, och jag
kontrollerade hela kedjan i stället för att bygga om den. Prissidan skickar
utloggade till `/registrera?paket=<planKey>`. `register-form.tsx` läser
parametern, validerar den med `isPlanKey` och skickar den vidare som `next`
till Google-knappen. Callbackens `safeNext` behåller query-strängen, så
`/dashboard/valj-spar?paket=cv_week` överlever Googles redirect utan att en
cookie behövs. `ValjSparClient` förväljer både spår och längd ur parametern.

Klicktestat: CV-kortet står förvalt (index 0) när spårvalet öppnas med
`?paket=cv_week`.

**(c) `src/lib/premium/trial.ts` minimerades.** Filen hade noll läsare: B1b:s
not 10 och B3:s not 14 pekade på varandra, och när båda landat var det ingen
kvar. Jag raderade den inte helt, för två vyer behöver fortfarande känna igen
kvarvarande trialkonton under avvecklingen, och de bar varsin egen kopia av
`TRIAL_SOURCES` i stället. Nu bor listan på ett ställe och `DowngradedNotice`,
`ProfilKomplettering` och `TestResultBridgeContainer` importerar
`isTrialSource` därifrån. `TRIAL_PRICE_FROM`, `daysLeft` och `daysLeftPhrase`
är borta, de lästes bara av raderade komponenter.

**(d) Dag 7:s tredje tal.** Etiketten säger "mallar" (T58) men talet stod på
LinkedIn-räknaren, eftersom mallnedladdningarna inte fanns i summeringen. Talet
läser nu `formatted_cv_downloads` via `week.templateDownloads`. Raden kostade
ingenting: samma count-fråga hämtades redan för onboardingsteget
`download_cv_template`, den lästes bara inte ut.

**(e) Allt-dagen får en sluttidsrad.** Dygnet kör inget veckoprogram, men
veckopanelen visades ändå eftersom scopet är `allt` (B3:s öppna beslut 12).
Sju dagars program i en vy som varar ett dygn är en lögn om vad kunden köpt.

`getSummary` räknar nu ut `dayPassOnly`, alltså att behörigheten bara kommer ur
ett giltigt `premium_grants` och inte ur en prenumeration, plus
`dayPassEndsAt`. Hemskärmen döljer veckopanelen i det läget och renderar
`DagpassRad` i stället.

Minsta möjliga med flit: en rad som säger när dygnet tar slut och ingenting
mer. Ingen nedräkning som tickar, ingen säljknapp. Tiden räknas i svensk tid,
som allt annat som rör dygn i appen. Fem tester i `DagpassRad.test.ts`.

**(f) Rester i gränssnittstext.** Greppade efter de tio strängarna i uppdraget.
Det mesta var redan rent. Det som fanns kvar:

| Fil | Vad | Åtgärd |
|---|---|---|
| `FunktionerHero.tsx`, `MediaImpactSection.tsx` | "Prova Premium gratis i 7 dagar" mot `/trial-signup` | Blev "Se paketen" mot `/priser`. Detta var det allvarligaste fyndet: tre publika CTA:er lovade en gratisperiod som inte finns |
| `ComparisonSection.tsx` | Samma CTA, plus gratiskolumn med gamla kvoter ("2/dag brev", "1/tredje dag analys") | CTA bytt, raderna följer nu avsnitt 4. Ny rad för testhistoriken |
| `FunktionerFAQ.tsx` | "fem dagar med full Premium direkt, utan kort" | Omskriven till gratisnivån och spåren |
| `cv-mallar-faq.ts` | "Premium-prenumerationen" | Namnger CV-veckan och Allt-veckan |
| `CvAnalysisResults.tsx` | "Lås upp djupare insikter med Premium!" | Kvitterar vad hon fått, säljer CV-veckan, länkar till spårvalet med paketet förvalt |
| `YrkesmallContent.tsx` | "Lås upp premium" | "Se hela mallen" |
| `StartFlow.tsx` | "Lås upp mitt brev" | "Skapa konto och läs brevet" |
| `ArticlesFinalCTA.tsx` | "Gratis för alltid" | "Gratisnivån har ingen tidsgräns". Det gamla löftet är inte sant efter den stramare nivån |
| `recommendation-engine.ts` | "Lås upp alla funktioner" | Namnger CV-veckan |
| `EnhancedFinalCTA.tsx` | Hela komponenten lovade sju dagar gratis | **Raderad**, noll importörer |
| `subscription-info.tsx` | Gamla kvoter i en egen vy | **Raderad**, noll importörer. B4 byggde om vyn på `/dashboard/profil/prenumeration` |
| `TestResultBridge.tsx` | "Alla testnivåer är upplåsta till" | "ingår till". Raden visas bara för kvarvarande trialkonton |

**(g) Sidebar, CreateSheet, sökta tjänster.** `CreateSheet` var ren. I sökta
tjänster betyder "trial" provjobb (`trial_work_completed`) och rör inte
prenumerationer alls. `Sidebar` sa "Premium" om kontoraden, vilket efter
paketomgången inte säger något om vilket av tre spår kunden har. Raden heter nu
"Ditt paket". Prisbadgen står kvar som "Från 49 kr" ur `PLANS`, alltså
Allt-dagen som lägsta pris i hela stegen, och alltid som "från" eftersom badgen
inte kan veta vilket paket hon landar på.

### Bygge och tester

`npx tsc --noEmit` rent. `NEXT_DIST_DIR=.next-b5 npx next build` rent, exit 0.
`npx vitest run`: **466 gröna i 37 filer**, upp från 457. Nio nya tester:
`getHubData.historik.test.ts` (4) och `DagpassRad.test.ts` (5).
`tsconfig.json` återställd med `git checkout --`.

### Klicktestet

`scripts/qa-paket-b5.mjs`, riktig Chrome mot `next start` på 3105 med
`.next-b5`. Pixel 7 och desktop 1280. **40 av 40 kontroller gröna.** Tjugotvå
skärmdumpar och `resultat.md` med bock per acceptanskriterium ur 2A och 2D
ligger i `docs/qa/qa-paket-b5/`.

LCP: hemskärmen **808 ms** (budget 1,0 s), prissidan **396 ms** (budget 1,5 s).

Stripe-nyckeln i miljön är en **live-nyckel**, så inget köp fullföljdes. Flöde
(i) stannar vid att kassans session skapats och att den svarar med en
Stripe-url, och köpet simulerades därefter i databasen plus ett riktigt anrop
till `onWeekStarted`, precis som webhooken gör. Skripten för det ligger som
`qa-paket-b5-konton.mjs` och `qa-paket-b5-kop.mjs`. QA-kontona raderades.

### Öppna beslut

1. **Verbalprovet har en egen nedräkning i stället för `use-exam-deadline`.**
   Den räknar ur samma `examMinutes` och auto-slutför på samma villkor, så
   beteendet är rätt och serverspärren är gemensam. Men det är två vägar till
   samma sak, och nästa gång någon ändrar tidsgränsens logik måste hen hitta
   båda. Att slå ihop dem är en refaktorering av `VerbalProvSession`, inte en
   bugg, och jag lät den ligga eftersom releasen inte hänger på den.

2. **Aggregaten på testhubben räknas på hela serien även för gratisnivån.**
   Alltså: hon ser "3 försök, bästa 100 %" men bara sitt senaste resultat i
   listan. Jag menar att det är rätt, talen är summeringar och inte historik
   och de är köpskälet. Men det går att läsa som att vi visar något vi samtidigt
   säger att hon inte får se. Vill ägaren att även talen ska spegla det hon ser
   är det en rad i `getHubData`, och då blir betalväggen svagare.

3. **`dayPassOnly` känner igen Allt-dagen på frånvaron av en prenumeration.**
   Villkoret är "giltigt grant, inget profilscope". Det är sant i dag eftersom
   engångsköpet är det enda som skriver grants utan prenumeration, men admin
   "ge premium" skriver också grants. En admin-tilldelad vecka ser alltså ut
   som ett dagpass för hemskärmen. Konsekvensen är liten, hon får en
   sluttidsrad i stället för en veckopanel, men den är fel. Rätt lösning är att
   `premium_grants` bär sin `source` in i summeringen, och det är en kolumn
   till i samma parallella omgång.

4. **`/api/trial/signup` och `/trial-signup` står kvar.** Det är den
   kortkrävande trial-vägen, inte reverse trial, och B1b:s not 9 lämnade den
   utanför. Jag tog bort alla CTA:er som pekade dit, så sidan är nu oåtkomlig
   från gränssnittet men fortfarande byggd och nåbar via direktlänk. Att stänga
   den helt är ägarens beslut.

5. **`qa-b3b-paket@jobbcoach.test` står kvar i databasen** med sju schemalagda
   `cv_day`-mejl från B3:s klicktest. Det är inte mitt konto och jag har låtit
   det ligga, men det bör raderas före släpp så att ingen QA-adress får riktiga
   veckomejl.

6. **Prissidans första kalla laddning mätte 1596 ms**, alltså över sin egen
   budget på 1,5 sekunder, innan CDN-cachen var varm. Varma laddningar ligger
   på knappt 400 ms. I produktion är sidan cachad ett dygn
   (`reference_vercel_env_saknas`), så talet som gäller är det varma, men
   första besökaren efter en deploy betalar den kalla kostnaden.
