# Beslut: mejlreglerna och raderingen av ett konto

Saas-lead, 2026-11-22. Ägarens besked samma dag: "Ta detta med saas lead och copyagenten. Om frågan är när något ska byggas så ska allt implementeras direkt." Och om raderingen: "Vi ska ju värna om användarna och deras data ... om någon vill ta bort all sin data när man raderar kontot så borde det göras." "Eller kan vi ha kvar datan anonymt så man kan dra slutsatser om varför de avslutat kontot?"

Kontrollerat i `C:\Users\chris\cvbrev-publikt3` på `c8697aec` (grenen `design/publikt-omgang3`), mot produktionsdatabasen, Stripe (live) och PostHog med läsfrågor. Inget är skrivet i produktionen, inget mejl är skickat och inget är schemalagt.

Lydelserna är skrivna av copywritern (agenten `svensk-ux-copywriter`) och granskade av saas-lead. Där saas-lead har ändrat eller lagt till står det vid texten. Vi är eniga om allt som står här; copywriterns invändningar och hur de avgjordes står i Del 4.

Så läser byggaren filen:
- Avsnittet "Till ägaren för godkännande" förs in först när ägaren sagt ja till exakt lydelse. Allt annat är byggorder och byggs direkt.
- Varje punkt har fil, läget i dag (kontrollerat i dag, inte ur äldre dokument), vad som ändras, lydelserna ordagrant och testerna som ska finnas.
- Tal i texter läses ur konstanten som namnges, aldrig för hand.
- Inget i den här filen ändrar priser, kvoter eller gränser.

---

## Till ägaren för godkännande

Integritetspolicyn, avsnittet "7. Datalagring". Tre saker blir sanna när bygget i Del 2 är ute: allt som går att knyta till dig tas bort när du raderar kontot, också i vår användningsstatistik; det som blir kvar hos leverantörerna står utskrivet; och en rad statistik utan något som pekar ut dig sparas om varje avslut. Samtidigt försvinner motsägelsen mellan första och tredje stycket ("en rimlig tid därefter" mot "allt tas bort").

Ny ordning i avsnittet: nytt första stycke, andra stycket som i dag, nytt tredje stycke, nytt stycke om leverantörerna, nytt stycke om avslutsstatistiken, fjärde stycket med en ändrad mening. Datumet "senast uppdaterad" sätts om.

Förs in tidigast samma dag som raderingen i Del 2 är driftsatt, aldrig före.

| | I dag | Ny lydelse |
|---|---|---|
| **Första stycket** | Vi lagrar din kontoinformation och prenumerationsstatus (via Stripe kund-ID) så länge ditt konto är aktivt hos oss, och en rimlig tid därefter för administrativa ändamål eller om det krävs enligt lag. | Vi lagrar dina uppgifter så länge du har ett konto hos oss. Det gäller din kontoinformation, din prenumerationsstatus (via kund-ID från Stripe) och det du skapar och sparar i Tjänsten. När du raderar kontot tar vi bort det och allt som hör till det. Vad som då blir kvar, och varför, står längre ned i det här avsnittet. |
| **Andra stycket** | Dina uppladdade CV-filer (original och textversion) samt dina sparade personliga brev lagras hos Supabase och är kopplade till ditt konto. Du kan när som helst radera enskilda filer och brev via ditt konto. | Oförändrat. |
| **Tredje stycket** | När du raderar ditt konto under Inställningar tar vi bort kontot och all data som hör till det: profilen, CV-texter, personliga brev, testresultat, samtal med Jobbcoachen, sparade intervju- och personlighetssvar och mejlloggen i databasen, samt uppladdade CV-filer, bilagor och profilfoto i vår lagring. Har du en pågående prenumeration avslutas den i samma stund. Två saker blir kvar. Kvitton och betalningsunderlag finns hos vår betalleverantör Stripe i sju år, eftersom bokföringslagen kräver det. Dessutom sparar vi tekniska säkerhetsloggar som inte går att koppla till dig: de innehåller varken e-postadress, namn eller IP-adress. | När du raderar ditt konto, under Inställningar eller i appen Testklar, tar vi bort kontot och allt som går att knyta till dig: profilen, CV-texter och uppladdade CV-filer, personliga brev, testresultat, sökta tjänster, samtal med Jobbcoachen, sparade intervju- och personlighetssvar, bilagor, profilfoto och vår logg över mejl vi har skickat till dig, med tillhörande händelser. I användningsstatistiken hos PostHog tar vi bort dig och dina händelser. PostHog rensar händelser i omgångar, så det kan ta upp till en vecka innan de är borta. Har du en prenumeration på Jobbcoach Premium som du har köpt på webben avslutas den i samma stund, så att inget mer dras. En prenumeration som du har köpt i Google Play avslutas inte av raderingen. Den säger du upp i Google Play. |
| **Nytt stycke: det som blir kvar** | (finns inte; i dag står i tredje stycket att säkerhetsloggarna saknar e-postadress och IP-adress, vilket inte stämmer för leverantörernas loggar) | Några uppgifter blir kvar hos våra leverantörer och i vår säkerhetslogg. Har du betalat hos oss finns ditt namn, den e-postadress du betalade med, kvitton och betalningsunderlag kvar hos vår betalleverantör Stripe. Bokföringslagen kräver att vi sparar det underlaget i sju år. Hos Resend, som skickar våra mejl, finns kopior av de mejl vi har skickat till dig, med din e-postadress och mejlets innehåll. Hos Supabase finns tekniska inloggningsloggar med e-postadress och IP-adress. Resend och Supabase sparar sina loggar under den tid som följer av deras villkor, och vi kan inte radera dem i förväg. Har du köpt Premium i appen via Google Play finns köpet kvar hos Google och hos RevenueCat, som hanterar köpen i appen, under ett id som inte längre leder till något konto hos oss.* I vår egen säkerhetslogg tar vi bort IP-adress och webbläsare. Händelsen och tidpunkten står kvar, utan koppling till ditt konto. |
| **Nytt stycke: avslutsstatistiken** | (finns inte) | När ett konto raderas sparar vi en rad statistik om avslutet, för att förstå varför människor slutar och kunna göra Tjänsten bättre. Raden innehåller vilket kvartal kontot raderades, hur gammalt kontot var, om det hade Jobbcoach Premium vid avslutet och om det någon gång har betalat, hur många CV, personliga brev, genomförda test och sökta tjänster som fanns, hur länge sedan kontot senast användes, om raderingen gjordes på webben eller i appen, och en anledning om du har valt en. Kontots ålder, antalen och tiden sedan senaste aktivitet anges bara i intervall, aldrig som exakta tal. Raden innehåller aldrig något id, ingen e-postadress, ingen IP-adress, inget exakt datum och ingen fritext. Att ange en anledning är frivilligt. Du väljer i så fall ett av sex färdiga alternativ, och raderingen fungerar likadant om du låter bli. |
| **Fjärde stycket, en mening** | ... Vi sparar inte din IP-adress, bara en envägskodad version som används för att begränsa antalet prov per dygn. | ... I intervjuprovet sparar vi inte din IP-adress, bara en envägskodad version som används för att begränsa antalet prov per dygn. (Resten av stycket oförändrat.) |

\* Meningen om Google Play och RevenueCat är saas-leads tillägg och är inte läst av copywritern. RevenueCat nämns inte någon annanstans i policyn i dag; det hör till juristens genomgång av underleverantörerna.

Varför vi skriver "en rad statistik utan något som pekar ut dig" och inte ordet "anonym": när mycket få konton raderas under ett kvartal, och ett av dem betalade, går raden i teorin att para ihop med uppsägningen hos Stripe. Därför sparar vi bara kvartal och intervall, visar statistiken i adminen först när minst fem konton har raderats, och aldrig rad för rad. Det är sant att raden inte innehåller något som pekar ut dig; att den är anonym i lagens mening kan vi inte lova när talen är så små.

Utanför det här beslutet och kvar hos ägaren och en jurist: personuppgiftsansvarig och organisationsnummer, rättslig grund per ändamål, överföring till land utanför EU (Google, Stripe, Resend), att Google Tag Manager och Google Analytics laddas på sajten men inte nämns i policyn, och avsnitt 2 och 4 som säger att Stripe bara får "t.ex. kund-ID" fast Stripe har namn och e-postadress.

---

## Del 1. Mejlreglerna

### 1a. Förnyelsemejlet går också till den som stängt av påminnelser

**Beslut:** Mejlet "Jobbcoach Premium förnyas i morgon, 149 kr" är ett besked om en dragning på kundens kort, inte marknadsföring. Det går till varje betalande med en förnyelse inom 36 timmar, också till den som har stängt av påminnelser. Kom igång-mejlet går fortfarande inte till den som stängt av.

**Läget i dag:** `src/lib/email/lifecycle/runner.ts:428` hoppar över hela profilen när `quota_emails_opt_out` är sann, innan förnyelsen kontrolleras (rad 440-447). Mallen `paketFornyasMejl` (`templates/komigang.ts:374-376`) är redan `transactional: true`, och runnerns egen kontroll (`runner.ts:100-104`) släpper redan igenom transaktionella mejl. Det är bara urvalet som stoppar. I produktionen har 2 av 10 betalande stängt av påminnelser och får i dag inget förnyelsemejl.

**Ändring:** i `scheduleKomIgangMejl` flyttas raden `if (profile.quota_emails_opt_out === true) { result.skipped += 1; continue; }` från rad 428 till direkt efter förnyelseblocket (efter `continue` på rad 446, före kontrollen av köpdagen på rad 449). Kommentaren ovanför blir: `// Avregistrerade får förnyelsebeskedet (transaktionellt, beslut-mejl-och-radering 1a) men inget Kom igång-mejl.`

**Texter:** inga nya. Mejlets lydelse är oförändrad.

**Följd:** raden på /priser om att vi mejlar dagen före förnyelsen (saasleads konverteringspunkt K6) är sann för alla betalande från den här deployen och får föras in.

**Tester** (`src/lib/email/lifecycle/__tests__/komigang-urval.test.ts`, ny, med `fakeSupabase.ts`):
1. Betalande med `quota_emails_opt_out: true` och `current_period_end` om 20 timmar får en rad `paket_fornyas_<datum>`.
2. Samma profil med förnyelse om fem dagar får ingen rad alls (ingen `komigang_`).
3. Samma profil utan avregistrering och förnyelse om fem dagar får `komigang_<datum>` som i dag.
4. Uppsagd (`cancel_at_period_end: true`) med avregistrering får ingenting.

### 1b. Påminnelser om kvoter som aldrig kommer tillbaka

**Beslut:** "Påminn mig" finns bara för kvoter som faktiskt kommer tillbaka: veckans personliga brev och dagens test. Rutten vägrar allt annat.

**Läget i dag:** `quota-back.ts` har redan bara `letter_generation` i `FEATURE_COPY` (M20 och M21 är införda). Men `src/app/api/quota/remind/route.ts:13-17` tar fortfarande emot vilken `feature` som helst och sparar den. I gränssnittet skickas i dag bara `letter_generation` (`BrevSparr.tsx:247`) och `test:<typ>` (`PaywallCard.tsx:304` från testerna och matristräningen); `cv_bygg` skickas aldrig (`PaywallCard.tsx:355, 457`). I `quota_reminders` ligger 11 rader, alla skickade: 7 `cv_analysis`, 3 `letter_generation`, 1 `test:matrislogik`. Inga väntande.

**Ändring:**
1. `src/lib/email/quota-back.ts`, ny ren export överst:
   ```ts
   /** Kvoter som kommer tillbaka av sig själva: veckans brev och dagens test. */
   export function arAterkommandeKvot(feature: string): boolean {
     return feature === 'letter_generation' || /^test:[a-z0-9-]{1,48}$/.test(feature);
   }
   /** Featuren i behörigheten som gör kvoten obegränsad (quotaService rad 163 och 400). */
   export function kvotensFeature(feature: string): 'letter_download' | 'tests_above_base' | null {
     if (feature === 'letter_generation') return 'letter_download';
     if (/^test:[a-z0-9-]{1,48}$/.test(feature)) return 'tests_above_base';
     return null;
   }
   ```
2. `route.ts`, efter kontrollen på rad 15-17: `if (!arAterkommandeKvot(feature)) return NextResponse.json({ error: 'feature_utan_aterkomst' }, { status: 400 });`. Raden `feature: feature.slice(0, 64)` står.
3. `copyFor` i `quota-back.ts`: villkoret `feature.includes('prov')` tas bort (alla testnycklar börjar med `test:`), och `DEFAULT_COPY` står kvar som skydd för gamla rader.
4. Kommentaren i `route.ts:7-10` får en mening: bara veckans brev och dagens test tas emot.

**Texter:** inga användaren ser. Knappen "Påminn mig" visas redan bara för de två kvoterna.

**Tester** (`src/lib/email/__tests__/quota-back.test.ts`, utökas, och `src/app/api/quota/remind/__tests__/route.test.ts`, ny):
1. `arAterkommandeKvot`: sant för `letter_generation`, `test:matris`, `test:matrislogik-pass`; falskt för `cv_analysis`, `chat_message`, `cv_bygg`, `test:`, `test:../x`.
2. Rutten svarar 400 `feature_utan_aterkomst` för `cv_analysis` och skriver ingen rad.
3. Rutten svarar 200 och skriver en rad för `test:matris`.

### 1c. Kampanjen "Vi ändrar gratisnivån" pensioneras

**Beslut:** Mejlet beskriver en ändring som redan är gjord och kan aldrig bli sant igen. Det tas bort helt, mall och register, så att varken en admin-rutt eller en handskriven rad i `email_schedule` kan skicka det.

**Läget i dag:** admin-rutten `/api/admin/email/campaign-gratisniva` som filhuvudet nämner finns inte längre (ingen fil under `src/app/api/admin/email/` utom `campaign` och `kampanj`). Mallen ligger däremot kvar i registret (`src/lib/email/lifecycle/registry.ts:14, 39, 77`), så en rad med `email_type = 'campaign_gratisniva_andras'` i `email_schedule` skulle skickas av morgonkörningen. Mejlet har aldrig gått (0 rader i `email_schedule` och `email_log`).

**Ändring:**
1. Radera `src/lib/email/lifecycle/templates/campaign-gratisniva.ts`.
2. `registry.ts`: ta bort importen (rad 14), posten `gratisnivaAndras` (rad 39) och `GRATISNIVA_EMAIL_TYPE` ur exporten (rad 77). Filhuvudet får en mening: `Kampanjen "Vi ändrar gratisnivån" är pensionerad 2026-11-22 (beslut-mejl-och-radering 1c); en kvarglömd rad avbryts som unknown_email_type.`
3. `src/lib/plans/gratis-copy.ts:63-64`: ta bort `GRATIS_TESTRAD` (bara mejlet läste den), och vakten i `src/lib/plans/__tests__/gratis-copy.test.ts:20, 53`.
4. Testerna som renderar mejlet: ta bort blocken i `src/lib/email/lifecycle/__tests__/agarpunkter-mejl.test.ts` (import rad 11, testet kring rad 60) och `qa-live-mejl.test.ts` (import rad 11, testet kring rad 103).
5. `src/app/admin/mejl/format.ts`: lämna eventuell namnmappning för historiken orörd.

**Test:** `registry.test.ts` (ny eller i befintlig fil): `resolveLifecycleEmail('campaign_gratisniva_andras')` ger `null`.

### 1d. Kvotpåminnelsen hoppar över på behörigheten, inte på `subscription_tier`

**Beslut:** Den som har en behörighet som gör kvoten obegränsad (prenumeration, Dagspasset, köp i appen, admintilldelning) får ingen "nu kan du skriva igen"-påminnelse. Samma fråga som kvoten själv ställer.

**Läget i dag:** `src/app/api/cron/pricing-sync/route.ts:301-310` läser `subscription_tier` och hoppar bara över `'premium'`. Kvoten i `quotaService.ts` frågar `userHasAccess(..., 'letter_download')` (rad 400) och `userHasAccess(..., 'tests_above_base')` (rad 163, 201), som också räknar `premium_grants` och admin.

**Ändring** i rad 301-310:
```ts
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('email, quota_emails_opt_out')
  .eq('id', reminder.user_id)
  .single();
const feature = kvotensFeature(reminder.feature);
// Gamla rader för kvoter som inte kommer tillbaka (cv_analysis) markeras som
// hanterade utan mejl. Behörigheten frågas som kvoten själv frågar.
const obegransad = feature ? await userHasAccess(supabaseAdmin as any, reminder.user_id, feature) : true;
if (!profile?.email || profile.quota_emails_opt_out || obegransad) {
```
Importer: `kvotensFeature` ur `@/lib/email/quota-back`, `userHasAccess` ur `@/lib/supabase/premiumAccess`. Kommentaren på rad 307-309 skrivs om till samma innebörd.

**Texter:** inga.

**Tester** (`src/app/api/cron/pricing-sync/__tests__/kvotpaminnelse.test.ts`, ny, eller som ren funktion om byggaren bryter ut loopen till `src/lib/email/kvotPaminnelse.ts`, vilket rekommenderas):
1. Gratiskonto med väntande `letter_generation` får mejlet.
2. Konto med `subscription_tier: 'free'` men en giltig rad i `premium_grants` (Dagspasset) får inget mejl, raden markeras `sent_at`.
3. Rad med `feature: 'cv_analysis'` skickas aldrig och markeras `sent_at`.

### 1e. Mejlet om Jobbsöket

**Beslut:**
- **Urval:** konton med e-postadress som (1) inte är undantagna (`admin_undantagna_konton()`: admin och testadresser), (2) inte har stängt av mejl (`quota_emails_opt_out` inte sann), (3) inte har stängt av erbjudanden och tips (`erbjudanden_mejl` inte falsk), (4) aldrig har loggat en sökt tjänst (ingen rad i `job_applications`), (5) har varit aktiva de senaste 90 dagarna räknat från utskicksdagen (`last_active`), (6) vars adress aldrig har studsat eller anmält skräppost (ingen `bounced` eller `complained` i `email_events` på adressen), och (7) inte redan fått mejlet (`email_log`). Både gratis och betalande. I dag ger det **213 konton**; talet ändras fram till utskicket.
- Varför inte bara konton med CV eller brev (62 i dag): den som tränar inför ett rekryteringstest har sökt ett jobb och blivit kallad. Det är precis den som ska logga tjänsten, och Sökta tjänster har statusen "Kallad till test".
- Varför `erbjudanden_mejl`: valet heter "Erbjudanden och tips på mejl" och lovar mejl om "sådant som gör jobbsöket lättare". Det här är ett sådant mejl, och avregistreringen i foten stänger samma val.
- **Föreslagen utskicksdag:** onsdag 2 december 2026, i morgonkörningen kl. 07.00. Det är efter Black Week (23 november) och Cyber Monday (30 november) och dagen efter CV som Word-fil (1 december), så de tre mejlen inte krockar och mätningen av varje mejl går att skilja åt. Avläsningen 5 och 19 december i `beslut-jobbsoket-2026-11-21.md` hinner med. Datumet antecknas i tidslinjen när det går.
- **Schemaläggningssätt:** samma som kampanjmejlen för Black Week: datumet står i koden, morgonkörningen skickar på dagen, admin-rutten har test, förhandsvisning och manuellt reservutskick bara på dagen. Byggaren bygger allt med datumet satt till `null` (av).

**Hur ägaren sätter igång det** (inte i den här omgången):
1. Läs förhandsvisningen i adminen: Mejl, kortet "Mejlet om Jobbsöket", "Förhandsvisa". Skicka ett test till dig själv med "Skicka test till mig".
2. Säg ja till dagen. Då ändras en rad: `JOBBSOKET_UTSKICK.dag` i `src/lib/email/jobbsoketUtskick.ts` från `null` till `'2026-12-02'`, committas och pushas senast tisdag 1 december. Morgonkörningen 2 december kl. 07.00 skickar.
3. Faller morgonkörningen: kortet i adminen visar "Kvar att skicka", och knappen "Skicka nu" fungerar bara på utskicksdagen.

**Filer:**

1. `src/lib/email/lifecycle/templates/campaign-jobbsoket.ts` (ny). Ren funktion `genereraJobbsoketMejl({ userId, fullName, harBrev })` som returnerar `{ subject, preheader, html }` med `renderLayout` ur `layout.ts`:
   - `type`: `JOBBSOKET_MEJL_TYP` = `'campaign:jobbsoket-2026-12'` (admin visar den som "Kampanj: jobbsoket-2026-12" utan ändring i `format.ts`).
   - `body`: `heading(J3) + paragraph(J4.1) + paragraph(J4.2 [+ ' ' + J5 om harBrev]) + paragraph(J4.3)`. Hälsningen är `Hej ${förnamn},` eller `Hej,` (med komma, `firstName` ur `layout.ts`), och stycke 1 fortsätter med gemen.
   - `ctaLabel`: J6 utan brev, J7 med brev.
   - `ctaUrl`: utan brev `soktaHref({ logga: 'sokt', fran: 'mejl-jobbsoket' })`, med brev `soktaHref({ fran: 'mejl-jobbsoket' })` (då visas kortet med breven i Sökta tjänster). `soktaHref` ur `src/lib/jobbsok/adress.ts`. `withUtm` i layouten lägger på utm.
   - `footNote`: J8.
   - `unsubscribe`: `{ url: avregistreraErbjudandenUrl(userId), label: J10, consentLine: J9 }` (`avregistreraErbjudandenUrl` ur `src/lib/email/campaign-kampanj.ts`).
   - "tolv" läses ur `NO_RESPONSE_NUDGE_DAYS` via `talOrdTill20` (`src/app/(public)/verktyg/sokta-tjanster/sokta-tjanster-data.ts:20`, flytta funktionen till `src/components/publikt/talord.ts` om importen från en sida känns fel).
2. `src/lib/email/jobbsoketUtskick.ts` (ny), efter mönstret i `kampanjUtskick.ts`:
   ```ts
   export const JOBBSOKET_UTSKICK: { nyckel: 'jobbsoket-2026-12'; dag: string | null } = {
     nyckel: 'jobbsoket-2026-12',
     // Ägarens ja krävs. Sätt till '2026-12-02' (saas-leads förslag) när ägaren sagt ja.
     dag: null,
   };
   export function arUtskicksdag(nu: Date): boolean  // svenskDag(nu) === dag, false när dag är null
   export async function jobbsoketMottagare(admin, nu): Promise<{ kvar: Array<{ id; email; full_name; harBrev }>; redan: number }>
   export async function skickaJobbsoket(admin, mottagare): Promise<UtskickResultat>
   ```
   - Urvalet är exakt de sju villkoren ovan. Undantagen läses med `hamtaUndantag` (`src/lib/admin/undantag.ts`). Studsar: en läsning av `email_events` med `event_type in ('bounced','complained')`, mottagaren läst som `payload->'to'->>0` eller `payload->>'to'`, jämförd med gemener. `harBrev`: minst en rad i `letters` med `is_saved = true` (samma fråga som kortet i Sökta tjänster, `src/lib/jobbsok/server.ts:433-436`).
   - Utskicket: `resend.batch.send` i omgångar om 100 med 700 ms paus, `headers: kampanjHuvuden(id)` (List-Unsubscribe mot erbjudandena), en rad per mottagare i `email_log` med `email_type: 'campaign:jobbsoket-2026-12'`, `feature: 'jobbsoket'`. Faller en omgång loggas den inte, så nästa körning tar den igen. Samma avsändare som kampanjen.
3. `src/app/api/cron/pricing-sync/route.ts`: nytt steg direkt efter steg 0 (rad 88), bara i morgonslotten: `if (isMorningSlot && arUtskicksdag(now)) { const { kvar } = await jobbsoketMottagare(supabaseAdmin, now); results.jobbsoketmejl = await skickaJobbsoket(supabaseAdmin, kvar); }` i try/catch som steg 0. Lägg `jobbsoketmejl: null` i `results`.
4. `src/app/api/admin/email/jobbsoket/route.ts` (ny), `requireSuperAdmin` överallt:
   - `GET` utan parametrar: `{ dag, kvar, skickade, senasteTest }`.
   - `GET ?forhandsvisa=1&brev=0|1`: mejlets HTML renderad för den inloggade admin (namnet ur profilen), `Content-Type: text/html; charset=utf-8`, `Cache-Control: no-store`. Inget skickas.
   - `POST { mode: 'test' }`: mejlet till admins egen adress med ämnet `[TEST] ` först, loggat som `campaign_test` med `feature: 'jobbsoket'`, som `kampanj/route.ts:51-72`.
   - `POST { mode: 'send', confirm: true }`: 409 om `!arUtskicksdag(new Date())`, annars samma utskick som cronen.
5. `src/app/admin/mejl/page.tsx`: ny `SectionCard` med rubriken `Mejlet om Jobbsöket` direkt under "Köpmejl". Innehåll (adminens egna texter, inte användartext):
   - Tre `MetricCard`: `Utskicksdag` (värdet `tidKort` av dagen kl. 07.00, eller `Inte satt`), `Kvar att skicka` (antal), `Skickade` (antal).
   - En rad: `Urval: konton utan sökt tjänst, aktiva senaste 90 dagarna, som inte stängt av tips på mejl. Dagen sätts i src/lib/email/jobbsoketUtskick.ts.`
   - Länkarna `Förhandsvisa` och `Förhandsvisa med brev` (nytt fönster mot GET-rutten) och knappen `Skicka test till mig` i en liten klientkomponent `src/app/admin/mejl/JobbsoketKort.tsx` som visar `Skickat till <adress>.` eller `Testet gick inte att skicka.`
   - Datan läses på servern med `jobbsoketMottagare` (en läsning per sidvisning, som kampanjrutten).

**Lydelser** (copywritern, granskade):

| Id | Var | Text |
|---|---|---|
| J1 | Ämnesrad | Fick du svar på jobbet du sökte senast? |
| J2 | Preheader | Logga det i Sökta tjänster, så säger vi till när det är dags att följa upp. |
| J3 | Rubrik (h1) | Logga jobbet du sökte senast |
| J4.1 | Stycke 1, efter hälsningen | en ansökan är lätt att tappa bort när den väl är skickad. Vilken dag gick den iväg, vad hette tjänsten, och har arbetsgivaren hört av sig sedan dess? |
| J4.2 | Stycke 2 | Logga jobbet du sökte senast i Sökta tjänster. Du fyller i tjänst, arbetsgivare och datum. Datumet väljer du själv, så en ansökan du skickade för ett tag sedan går lika bra. Det är gratis för alla med konto. |
| J5 | Sist i stycke 2, bara med brev | Jobb som du har skrivit personligt brev till hos oss behöver du inte fylla i för hand. I Sökta tjänster föreslår vi att lägga in dem, med ett tryck. |
| J4.3 | Stycke 3 ("tolv" ur konstanten) | Sedan håller vi räkningen åt dig. Har det varit tyst i tolv dagar föreslår vi ett uppföljningsmejl och skriver ett utkast. Du ändrar det du vill och skickar själv, från din egen adress. |
| J6 | Knapp utan brev | Logga sökt tjänst |
| J7 | Knapp med brev | Logga mina sökta tjänster |
| J8 | Fotnot | Ingen annan användare, rekryterare eller arbetsgivare ser dina sökta tjänster, och vi skickar aldrig något till en arbetsgivare. |
| J9 | Foten, varför | Du får det här mejlet för att du har ett konto på jobbcoach.ai och inte har stängt av erbjudanden och tips på mejl. |
| J10 | Foten, länk | Stäng av erbjudanden och tips på mejl |

Belägg: gratis att logga, tolv tysta dagar, utkastet som användaren skickar själv, att ingen annan ser tjänsterna, och kortet för breven står alla i `sokta-tjanster-data.ts:56-93` och `Backfill.tsx:97-131`. Arket "Logga sökt tjänst" öppnas av `?logga=1` (`adress.ts:52-53`). Det första utkastet är gratis för alla mottagare, eftersom ingen av dem har en sökt tjänst.

**Mätning:** sidvisningar med `fran=mejl-jobbsoket` och utm `campaign:jobbsoket-2026-12`; öppningar och klick i adminens Mejl per mall; första rad i `job_applications` bland mottagarna fram till 19 december (beslut-jobbsoket, stoppregeln).

**Tester** (`src/lib/email/__tests__/jobbsoket.test.ts`, ny):
1. Mejlet utan brev: ämnet är J1, knappen J6 och länken innehåller `logga=1` och `fran=mejl-jobbsoket`; J5 saknas.
2. Mejlet med brev: J5 och J7 finns, länken saknar `logga=`.
3. Foten innehåller J9, J10 och länken till `/api/email/avregistrera-erbjudanden`; ingen text `mailet`, ingen `—`, ingen emoji.
4. "tolv" följer `NO_RESPONSE_NUDGE_DAYS` (sätt konstanten till 14 i ett mockat test och se "fjorton").
5. Urvalet med `fakeSupabase`: var och en av de sju spärrarna stoppar sin profil; en profil som klarar alla kommer med; `harBrev` sätts bara av sparat brev.
6. `arUtskicksdag` är falsk när `dag` är `null` och sann bara på den svenska kalenderdagen.
7. Admin-rutten: `POST send` ger 409 när dagen inte är i dag; `GET ?forhandsvisa=1` ger HTML och skickar inget (Resend-mocken anropas inte).

---

## Del 2. Radering av konto

### 2a. Vad raderingen når i dag, tabell för tabell

Varje tabell i `public` med en kolumn för användar-id eller e-post, läst ur `pg_constraint` i produktionen. "Kaskad" betyder att raden försvinner när auth-användaren tas bort.

| Tabell och kolumn | Koppling | Når raderingen den i dag? | Beslut |
|---|---|---|---|
| active_cv_for_matching, ai_conversations, ai_document_chunks, ai_documents, ai_messages, app_enheter, cancel_intents, candidate_interests (båda sidor), candidate_profile_views (båda), candidate_profiles, completed_courses, cv_analysis_jobs, cv_texts, daily_usage_stats, discount_codes, email_confirmations, email_schedule, fraga_rapporter, global_user_stats, interest_messages, interest_thread_reads, job_application_followups, job_application_share_links, job_applications, job_matching_summaries, job_matchings_cache, job_saved_ads, learning_progress_entries, letters, linkedin_optimizations, logic_test_v4_sessions, login_tokens, monthly_guest_allowances, notifications, personality_test_sessions, premium_extensions, quota_reminders, recruiter_profiles, recruiter_projects, recruiter_saved_searches, revenue_tracking, test_milstolpar, test_nivapunkter, test_planer, usage_log, user_achievements, user_course_enrollments, user_daily_xp, user_gamification_stats, user_global_achievements, user_milestone_rewards, user_personality_profile, user_predictions, user_premium_trials, user_reward_claims, user_ui_preferences, weekly_guest_allowances, xp_history, anon_test_sessions.claimed_by, recruiter_candidate_notes.recruiter_user_id, recruiter_share_links.recruiter_user_id | auth.users, kaskad | Ja | Inget ändras |
| ai_usage_costs, competence_analysis_jobs, formatted_cv_downloads, learning_plans, learning_progress, premium_grants, user_activities, cv_texts, letters | profiles, kaskad (profilen kaskaderar från auth.users) | Ja | Inget ändras |
| profiles (email, contact_email) | raden själv | Ja | Inget ändras |
| email_log.user_id, recipient | auth.users, SET NULL | Ja, raderas i `rensaLosaRader` | Inget ändras |
| public_letter_drafts.claimed_by | SET NULL | Ja, raderas | Inget ändras |
| anon_interview_samples.user_id, claimed_by | SET NULL | Ja, raderas | Inget ändras |
| anon_personality_samples.user_id, claimed_by | SET NULL | Ja, raderas | Inget ändras |
| guest_invitations.guest_user_id | SET NULL | Ja, raderas där kontot är gästen | Inget ändras |
| guest_invitations.inviter_id, guest_email | ingen FK på inviter_id | Nej: en inbjudan som kontot skickat ligger kvar med gästens adress | Raderas på `inviter_id` (ny rad i `LOSA_RADER`) |
| audit_logs.user_id | SET NULL | Tvättas: IP, webbläsare, metadata och värden nollas | Inget ändras |
| email_events (payload.to, payload.subject) | ingen | Delvis: raderas på kontots nuvarande adresser, inte på adresser kontot haft tidigare | Adresserna utökas, se 2c punkt 2 |
| improved_cvs.user_id | **ingen FK** | **Nej** (0 rader i dag) | Raderas på `user_id` |
| recruiter_candidate_notes.candidate_user_id | **ingen FK** | **Nej**: rekryterarens anteckning om kandidaten blir kvar | Raderas på `candidate_user_id` |
| recruiter_project_candidates.candidate_user_id | **ingen FK** | **Nej** | Raderas på `candidate_user_id` |
| recruiter_share_links.candidate_user_id | **ingen FK** | **Nej** | Raderas på `candidate_user_id` |
| api_metrics.user_id | SET NULL | Nej (0 rader i dag) | Raderas på `user_id` |
| admin_actions.target_user_id, metadata | SET NULL | Nej: metadata kan bära adressen | `metadata` nollas på `target_user_id` före raderingen |
| system_alerts.acknowledged_by, resolved_by; recruiter_profiles.approved_by; admin_actions.admin_id | admins id | Rör administratörer, inte kunder | Inget ändras |
| admin_daily_metrics (emails_sent, emails_opened) | inga personuppgifter | Inte tillämpligt | Inget ändras |

Lagringshinkar: `cvs` (privat, 354 filer) och `profile-photos` (publik, 2 filer) har alla filer under `users/<id>/` och raderas rekursivt (`raderaKonto.server.ts:94-112`). `ai-documents` är tom och används inte av någon kod. Inga filer ligger kvar efter redan raderade konton (läst i dag: 0).

Utanför databasen:
- **PostHog:** personen (id och e-postadress, `PostHogProvider.tsx:70-73`) och händelserna raderas inte i dag. Ändras, se 2c punkt 4.
- **Stripe:** kunden (namn, e-post, `metadata.supabaseUUID`), sparat kort, avslutade prenumerationer, kassasessioner (med `metadata.email` och samtyckets tidsstämpel), fakturor, kvitton och betalningar ligger kvar. **Beslut: ligger kvar.** Bokföringslagen kräver underlaget; kunden raderas inte, eftersom kvitton, återbetalningar och adminens köpliggare läser genom kunden. Prenumerationen avslutas direkt (`raderaKonto.server.ts:48-54`), utan återbetalning. Policyn säger det i stycket om det som blir kvar.
- **Resend:** varje skickat mejl, med adress och innehåll, ligger i Resends logg under deras lagringstid. API:t har ingen radering av skickade mejl. Vi lägger inga kontakter i Resend (inga anrop till `contacts` eller `audiences`). Policyn säger det.
- **Supabase Auth:** `auth.users` tas bort av `deleteUser`; `auth.audit_log_entries` är tom. Plattformens egna inloggningsloggar (e-post och IP) ligger hos Supabase under deras lagringstid. Policyn säger det.
- **RevenueCat och Google Play:** köp i appen ligger hos Google och hos RevenueCat under kontots id (`src/components/mobilapp/skal-kop.ts:38-39`), utan e-postadress. Id:t leder inte till något efter raderingen. Ligger kvar; policyn nämner det (saas-leads tillägg).
- **Google Analytics via Tag Manager** (`src/app/layout.tsx:157-194`): får inget konto-id och går inte att koppla till ett konto. Inget att radera.
- **Vercels loggar:** några `console.log` skriver adresser (till exempel `pricing-sync/route.ts:132`). Byggaren tar bort adresserna ur loggraderna i de filer som rörs här och skriver id i stället; resten tas i en egen genomgång.

### 2b. Det anonyma avslutet: beslut

**Fälten** (en rad per raderat konto, skrivs bara när kontot själv raderas på webben eller i appen, aldrig när admin raderar, aldrig för undantagna konton):

| Kolumn | Värden | Hur det räknas |
|---|---|---|
| `kvartal` | första dagen i kvartalet, `2026-10-01` | svensk tid vid raderingen |
| `kalla` | `webb`, `app` | vilken rutt som anropades |
| `kontots_alder` | `under_1_dag`, `1_7_dagar`, `8_30_dagar`, `31_90_dagar`, `91_365_dagar`, `over_1_ar` | `profiles.created_at` |
| `hade_premium` | sant eller falskt | `userHasAccess(admin, id, 'any')` före raderingen |
| `har_betalat` | sant eller falskt | `harBetalat(profil)` ur `src/lib/kampanj/kampanj.ts:205` eller `premium_source = 'play'` |
| `antal_cv` | `0`, `1`, `2_5`, `6_plus` | rader i `cv_texts` |
| `antal_brev` | `0`, `1`, `2_5`, `6_plus` | rader i `letters` |
| `antal_test` | `0`, `1_5`, `6_20`, `21_plus` | `logic_test_v4_sessions` och `personality_test_sessions` med `completed_at`, samma källor som adminens `tests_completed` (`collect.ts:1074-1102`) |
| `antal_sokta` | `0`, `1`, `2_5`, `6_plus` | rader i `job_applications` |
| `dagar_sedan_aktivitet` | `under_1`, `1_7`, `8_30`, `31_90`, `over_90`, `okant` | `profiles.last_active`, `okant` när den saknas |
| `anledning` | `fick_jobb`, `soker_inte`, `for_dyrt`, `annan_tjanst`, `fungerade_inte`, `integritet`, eller null | användarens val, frivilligt |

Kvartal i stället för månad, och utan registreringsvalet som ägarens riktning föreslog: med tio betalande och några få raderingar per månad är det kombinationen av tid och fält som kan peka ut en person. Registreringsvalet ställs dessutom inte längre som en egen fråga (sedan 2026-11-08) och finns på 70 av 544 konton, så det säger lite. Plan vid avslut blir sant eller falskt (`hade_premium`): med en enda produkt till salu är det samma information, och färre värden ger större grupper.

Ingen kolumn för tid. Primärnyckeln är ett slumpat uuid, aldrig ett löpnummer, så ordningen mellan raderna inte går att läsa ut.

**Anledningen:** raderingsflödet frågar, frivilligt och med ett tryck, före bekräftelsefältet. Sex val, inget förvalt, ett andra tryck tar bort valet. Ingen fritext. Avbokningsflödet för prenumerationen (`cancel_intents`) står kvar som det är.

### 2c. Byggorder för raderingen

**1. Migreringen** `supabase/migrations/20261123090000_konto_avslut.sql` (ny). Körs av byggaren mot produktionen först när ägaren gett sitt ja till migreringar, enligt den stående regeln.
```sql
-- Anonym avslutsstatistik och kön för radering i PostHog
-- (docs/beslut-mejl-och-radering-2026-11-22.md, Del 2).
-- Båda tabellerna nås bara med servernyckeln: RLS på, inga policyer,
-- och rättigheterna tagna från anon och authenticated.

create table public.konto_avslut (
  id uuid primary key default gen_random_uuid(),
  kvartal date not null check (kvartal = date_trunc('quarter', kvartal)::date),
  kalla text not null check (kalla in ('webb', 'app')),
  kontots_alder text not null check (kontots_alder in ('under_1_dag', '1_7_dagar', '8_30_dagar', '31_90_dagar', '91_365_dagar', 'over_1_ar')),
  hade_premium boolean not null,
  har_betalat boolean not null,
  antal_cv text not null check (antal_cv in ('0', '1', '2_5', '6_plus')),
  antal_brev text not null check (antal_brev in ('0', '1', '2_5', '6_plus')),
  antal_test text not null check (antal_test in ('0', '1_5', '6_20', '21_plus')),
  antal_sokta text not null check (antal_sokta in ('0', '1', '2_5', '6_plus')),
  dagar_sedan_aktivitet text not null check (dagar_sedan_aktivitet in ('under_1', '1_7', '8_30', '31_90', 'over_90', 'okant')),
  anledning text check (anledning in ('fick_jobb', 'soker_inte', 'for_dyrt', 'annan_tjanst', 'fungerade_inte', 'integritet'))
);

comment on table public.konto_avslut is
  'En rad per konto som raderats av användaren själv. Inget id, ingen e-post, ingen IP, ingen tid utöver kvartal. Läses bara aggregerat i /admin/anvandare.';

alter table public.konto_avslut enable row level security;
revoke all on table public.konto_avslut from anon, authenticated;
grant select, insert on table public.konto_avslut to service_role;

create table public.posthog_raderingar (
  distinct_id uuid primary key,
  forsok integer not null default 0,
  senaste_fel text
);

comment on table public.posthog_raderingar is
  'Konton som raderats men där PostHog inte svarade. Raden tas bort när PostHog bekräftat raderingen. Bara id, ingen e-post.';

alter table public.posthog_raderingar enable row level security;
revoke all on table public.posthog_raderingar from anon, authenticated;
grant select, insert, update, delete on table public.posthog_raderingar to service_role;
```
Kontroll efter körning (läsfråga): `select relrowsecurity from pg_class where relname in ('konto_avslut','posthog_raderingar')` ger två `true`, och `select grantee, privilege_type from information_schema.role_table_grants where table_name in ('konto_avslut','posthog_raderingar')` visar inga rader för `anon` eller `authenticated`.

**2. `src/lib/konto/raderaKonto.server.ts`**
- `LOSA_RADER` (rad 118-126) får sex rader till: `{ tabell: 'guest_invitations', kolumn: 'inviter_id' }`, `{ tabell: 'improved_cvs', kolumn: 'user_id' }`, `{ tabell: 'recruiter_candidate_notes', kolumn: 'candidate_user_id' }`, `{ tabell: 'recruiter_project_candidates', kolumn: 'candidate_user_id' }`, `{ tabell: 'recruiter_share_links', kolumn: 'candidate_user_id' }`, `{ tabell: 'api_metrics', kolumn: 'user_id' }`.
- I `rensaLosaRader`, efter tvätten av `audit_logs` (rad 189-193): `admin_actions` får `metadata: null` där `target_user_id = userId`. Tillåter kolumnen `description` null sätts den också till null.
- `kontotsAdresser` (rad 153-170) läser också `profiles.contact_email` och alla distinkta `email_log.recipient` där `user_id = userId`, så att mejlhändelser till en adress kontot haft före ett byte också raderas. Ett fel i en läsning ger färre adresser, aldrig ett avbrott (som i dag). Läsningen sker före raderingen av `email_log`.
- Ny parameter: `raderaKonto(admin, userId, opts?: { kalla: 'webb' | 'app'; anledning?: string | null })`. Utan `opts` (adminens radering) skrivs ingen avslutsrad.
- Före Stripe (efter rad 206): `const avslut = opts ? await lasAvslut(admin, userId, opts).catch(() => null) : null`. Ett fel i läsningen stoppar aldrig raderingen.
- Efter lyckad `deleteUser` (efter rad 237):
  ```ts
  if (avslut) {
    const { error: e } = await admin.from('konto_avslut').insert(avslut)
    if (e) console.error('[raderaKonto] avslut', e.message)
  }
  await raderaIPosthog(admin, userId)
  ```
  Båda körs bara när kontot faktiskt är raderat, så att ett nytt försök efter ett fel aldrig ger två rader. Ingen av dem kan ge `ok: false`.
- Filhuvudet (rad 12-37) får punkt 5 och 6: avslutsraden och PostHog.

**3. `src/lib/konto/avslut.ts`** (ny, ren och testbar) och `src/lib/konto/avslut.server.ts` (ny):
- Rena: `kvartalFor(nu: Date): string`, `alderIntervall(dagar: number)`, `antalIntervall(n)`, `testIntervall(n)`, `aktivitetIntervall(lastActive: string | null, nu: Date)`, `lasAnledning(v: unknown): Anledning | null` (bara de sex nycklarna, annat blir null), och `ANLEDNINGAR` med nycklar och etiketter (R8) i ordning. Gränserna exakt som i tabellen i 2b, dagar räknade som hela dygn.
- Server: `lasAvslut(admin, userId, opts)` läser profilen (`created_at, last_active, email, subscription_id, subscription_status, paket_started_at, premium_source`), fyra antal med `count: 'exact', head: true`, `userHasAccess(admin, userId, 'any')`, och returnerar `null` när kontot är undantaget (`arTestEpost(email)` eller en rad i `admin_users`).

**4. `src/lib/konto/posthogRadering.server.ts`** (ny):
- `raderaIPosthog(admin, userId)`: anropar PostHogs API `POST {POSTHOG_HOST}/api/projects/{POSTHOG_PROJECT_ID}/persons/bulk_delete/` med `{ distinct_ids: [userId], delete_events: true }` och nyckeln `POSTHOG_RADERA_NYCKEL`, med 5 sekunders gräns. Byggaren kontrollerar ändpunkten och fältnamnen mot PostHogs API-dokumentation innan den skrivs. Svarar PostHog inte med 2xx, eller saknas nyckeln, läggs id:t i `posthog_raderingar` (`upsert`, `ignoreDuplicates`). Kastar aldrig.
- `korPosthogRaderingar(admin)`: tar upp till 100 rader, ett anrop med alla id, tar bort raderna vid 2xx, annars `forsok + 1` och `senaste_fel`. När en rad når `forsok = 5` skrivs ett fel med `loggaAdminFel` (syns under Drift), med antalet rader men utan id.
- `pricing-sync/route.ts`, midnattsslotten (efter steg 2c, rad 277): `results.posthogRadering = await korPosthogRaderingar(supabaseAdmin)` i try/catch.
- Adminens radering (`src/app/api/admin/users/[id]/route.ts:201` och `bulk/route.ts:78`) anropar `raderaIPosthog` efter `deleteUser`, så att också testkonton försvinner ur PostHog. De skriver ingen avslutsrad.
- **Ägaren:** skapa en personlig API-nyckel i PostHog (EU) med bara behörigheten `person: write` för projekt 148688, och lägg den i Vercel som `POSTHOG_RADERA_NYCKEL` (Production). Utan den köas varje radering och kön syns under Drift. Den nuvarande nyckeln (`POSTHOG_PERSONAL_API_KEY`) har bara läsrätt på personer och ska inte få skrivrätt.

**5. Rutterna**
- `src/app/api/konto/radera/route.ts`: `DELETE(request)` läser `const kropp = await request.json().catch(() => ({}))` och anropar `raderaKonto(a.admin, a.userId, { kalla: 'webb', anledning: lasAnledning(kropp?.anledning) })`.
- `src/app/api/app/konto/route.ts`: samma med `kalla: 'app'`.

**6. Webbens raderingsark**
- `src/app/dashboard/installningar/components/useKontoHandlingar.ts`:
  - Ta bort `logUserActivity(... 'registered', 'Användaren raderade sitt konto', { email ... })` med väntan (rad 34-45). Raden försvinner ändå med kontot och fördröjer raderingen upp till tre sekunder.
  - `handleDeleteAccount(anledning: Anledning | null)` skickar `body: JSON.stringify({ anledning })` med `Content-Type: application/json`.
  - Returnera `harStripePrenumeration` (`subscription_status` är `active`, `trialing` eller `past_due`) och `harPlayPrenumeration` (`premium_source === 'play'` och `premium_until` i framtiden) i stället för `harPaket` (rad 74). Läs dem ur profilen som hooken redan har; saknas fälten i `useProfile` läses de i serverkomponenten för Inställningar och skickas ned.
  - Bekräftelsen (rad 67) blir R9a, eller R9b när kontot hade en Stripe-prenumeration.
- `src/app/dashboard/profil/profil-copy.ts:123`: `raderaText` blir R1.
- `src/app/dashboard/installningar/components/KontoSection.tsx`, funktionen `RaderaKonto` (rad 234-311):
  - Rad 263: R2. Rad 264-273: listan R3, sedan R4 (bara `harStripePrenumeration`) och R4b (bara `harPlayPrenumeration`) som en egen rad i `font-medium text-ink-1`. Den gamla raden "Ditt paket sägs inte upp automatiskt ..." tas bort; den är osann (`raderaKonto.server.ts:48-54` avslutar prenumerationen).
  - Under listan: R5 som `text-meta text-ink-3` med länken R5-länk till `/integritetspolicy#datalagring`.
  - Ny grupp före bekräftelsefältet: `fieldset` med `legend` R6 och hjälptexten R7, sex chips (R8) i `flex flex-wrap gap-2`, varje chip `role="radio"`-lik knapp med `aria-pressed`, minst 44 px hög, `rounded-xl` max, border i stället för skugga, valt läge med `border-ink-1`. Ett andra tryck på valt chip avmarkerar. Inget förval. Chips ur `ANLEDNINGAR` i `src/lib/konto/avslut.ts`.
  - `radera()` skickar valet till `onDeleteAccount(anledning)`.
- `KontoSectionProps` får `harStripePrenumeration` och `harPlayPrenumeration` i stället för `harPaket`; `InstallningarClient.tsx:40` följer med.

**7. Appens raderingsark** `src/components/mobilapp/KontoHandlingar.tsx`
- Ta bort `logUserActivity(... 'registered' ...)` i `raderaKonto` (rad 21-28).
- Rad 96: R11. Rad 107-109: R10, och under den R10b med länken till `/integritetspolicy#datalagring`.
- Frågan R6, R7 och chipsen R8 före fältet "Skriv RADERA för att bekräfta", i appens egna klasser (`tk-*`), samma beteende som på webben. `fetch('/api/app/konto', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anledning }) })`.

**8. Adminen: avsluten på /admin/anvandare**
- `src/lib/admin/tomt.ts`, `MATSTART`: ny nyckel `avslut` med deploytiden (ISO), kommentar `Avslutsstatistiken (konto_avslut) skrivs från deploy.`
- `src/app/admin/anvandare/avslut.ts` (ny): `hamtaAvslut(admin)` läser alla rader i `konto_avslut` (tabellen är liten; paginera med `range` om den passerar 1 000, PostgREST kapar tyst) och räknar ihop.
- `src/app/admin/anvandare/page.tsx`: ny `SectionCard` sist med rubriken `Raderade konton`. Innehåll (adminens egna texter):
  - Inga rader: `{nollSedan('raderade konton', MATSTART.avslut)}.`
  - Färre än fem: `MetricCard` `Raderade konton` med antalet och `sedan {tidKort(MATSTART.avslut)}`, och raden `Fördelningen visas när fem konton har raderats, så att ingen enskild rad går att känna igen.`
  - Fem eller fler: samma kort, en rad per kvartal (`2026 kvartal 4: 3`) och fem små tabeller med antal och andel: `Anledning` (de sex etiketterna ur `ANLEDNINGAR` plus `Ingen anledning vald`), `Kontots ålder`, `Premium` (`Hade Premium vid avslutet`, `Har betalat någon gång`), `Senast aktiv`, `Användning` (andel med minst ett CV, minst ett brev, minst ett test, minst en sökt tjänst). Inga diagram (färre än sju punkter, diagramregeln i `AdminChart`), aldrig en lista med rader, aldrig korstabeller.
  - Serverrenderat som resten av sidan.

**9. Tester**
- `src/lib/konto/__tests__/avslut.test.ts` (ny): varje intervallgräns (0, 1, 7, 8, 30, 31, 90, 91, 365, 366 dagar; 0, 1, 2, 5, 6 antal; 0, 1, 5, 6, 20, 21 test), `kvartalFor` över årsskiftet och i svensk tid (31 december 23.30 UTC är 1 januari i Sverige), `lasAnledning` släpper bara de sex nycklarna.
- `src/lib/konto/__tests__/raderaKonto.test.ts` (utökas):
  1. Med `opts` skrivs exakt en rad i `konto_avslut`, efter `deleteUser`, och raden har inga andra nycklar än migreringens kolumner (ingen `user_id`, `email`, `created_at`).
  2. När `deleteUser` misslyckas skrivs ingen avslutsrad och PostHog anropas inte.
  3. Utan `opts` (admin) skrivs ingen rad.
  4. Testkonto (`qa-…`) skriver ingen rad.
  5. De sex nya raderna i `LOSA_RADER` raderas på rätt kolumn; `admin_actions` tvättas.
  6. `email_events` raderas också på en adress som bara finns i `email_log.recipient` och på `contact_email`.
  7. PostHog svarar 500: id:t hamnar i `posthog_raderingar`, raderingen svarar `ok: true`.
- `src/lib/konto/__tests__/posthogRadering.test.ts` (ny): 2xx tar bort köraden; fel räknar upp `forsok`; vid fem försök anropas `loggaAdminFel` utan id i texten; utan nyckel köas allt.
- `src/app/dashboard/installningar/components/__tests__/radera-ark.test.tsx` (ny): chipsen växlar, ett andra tryck avmarkerar, valet skickas i `DELETE`-kroppen, R4 syns bara med Stripe-prenumeration och R4b bara med Play, den gamla meningen "sägs inte upp automatiskt" finns inte.
- Grep-test i samma fil: inga `—` och inga emoji i R1 till R11.
- Klicktest i riktig webbläsare (Pixel 7 och 1440 bredd) med ett eget testkonto: radera med vald anledning och utan, kontrollera en ny rad i `konto_avslut` (läsfråga, räkna före och efter), att kontot är borta och att PostHog-personen är borta eller köad. Testkontot är `qa-…` och skriver därför ingen avslutsrad: för klicktestet sätts undantaget av med en miljövariabel som bara läses utanför produktionen (`AVSLUT_TESTA_UNDANTAG=1`, `VERCEL_ENV !== 'production'`), och raden som skrevs raderas efteråt på sitt id.

**Lydelser för raderingen** (copywritern, granskade):

| Id | Var | Text |
|---|---|---|
| R1 | Under länken "Radera mitt konto" | Kontot och allt i det tas bort och går inte att få tillbaka |
| R2 | Rubrik över listan | Det här tas bort |
| R3 | Listan | Kontot, profilen och profilfotot / CV, CV-filer och personliga brev / Testresultat, sökta tjänster och samtal med Jobbcoachen / Sparade intervju- och personlighetssvar, vår logg över mejl till dig och din användningsstatistik |
| R4 | Bara med prenumeration via webben | Din prenumeration på Premium avslutas i samma stund, så inget mer dras. |
| R4b | Bara med prenumeration via Google Play | Din prenumeration i Google Play avslutas inte av raderingen. Säg upp den i Google Play. |
| R5 | Under listan | Har du betalat hos oss finns kvitton och betalningsunderlag kvar hos Stripe, eftersom bokföringslagen kräver det. Vi sparar också en rad statistik om avslutet, utan något som pekar ut dig. |
| R5-länk | Efter R5 | Så hanterar vi dina uppgifter |
| R6 | Frågan | Vill du säga varför du slutar? |
| R7 | Hjälptext | Frivilligt. Svaret sparas som statistik utan koppling till dig. Tryck igen för att ångra valet. |
| R8 | Chips, i ordning | `fick_jobb` Har fått jobb / `soker_inte` Söker inte jobb längre / `for_dyrt` För dyrt / `annan_tjanst` Använder en annan tjänst / `fungerade_inte` Gjorde inte det jag behövde / `integritet` Vill ta bort mina uppgifter |
| R9a | Bekräftelse, utan prenumeration | Ditt konto är raderat. Tack för att du använde Jobbcoach.ai, och lycka till framöver. |
| R9b | Bekräftelse, med prenumeration via webben | Ditt konto är raderat och din prenumeration är avslutad. Inget mer dras. Tack för att du använde Jobbcoach.ai. |
| R10 | Appens ark, ersätter rad 108 | Hela kontot raderas: nivå, träning och resultat här i appen, och allt du har gjort på jobbcoach.ai med samma konto. Det går inte att få tillbaka. Har du Premium köpt på jobbcoach.ai avslutas prenumerationen direkt. En prenumeration köpt i Google Play avslutas inte av raderingen. Den säger du upp i Google Play. |
| R10b | Appens ark, under R10, med länk | Vi sparar en rad statistik om avslutet, utan något som pekar ut dig. Vad som blir kvar hos våra leverantörer står i integritetspolicyn. |
| R11 | Appens rad, undertext | Kontot och allt i det tas bort |

Bekräftelsefälten ("Skriv radera mitt konto för att bekräfta", "Radera permanent", "Avbryt" på webben; "Skriv RADERA för att bekräfta", "Radera kontot", "Avbryt" i appen) står.

Belägg: raderingen av filer, rader, Stripe och auth (`raderaKonto.server.ts`), sökta tjänster och samtal kaskaderar (tabellen i 2a), intervju- och personlighetssvar raderas på kontot (`LOSA_RADER`), PostHog efter punkt 4, Play avslutas inte (`api/app/konto/route.ts:8-9`).

### 2d. Rester från konton som redan är raderade

Räknat i dag med läsfrågor. Inget av det här raderas förrän ägaren sagt ja till antalen.

| Var | Antal | Villkor |
|---|---|---|
| `email_events` | **239 rader** till 228 adresser (220 av adresserna är testkonton, 8 ser ut som riktiga personer) | se SQL nedan |
| PostHog | **413 personer** med e-postadress och **4 918 händelser** | personer vars distinct_id är ett uuid av version 4 som inte finns i `auth.users` och som har egenskapen `email`; ingen av dem är sammanslagen med ett befintligt konto (kontrollerat: 0) |
| Stripe | 6 kunder utan konto | **ligger kvar** (bokföringslagen) |
| `email_log`, `audit_logs`, `api_metrics`, `admin_actions`, `improved_cvs`, rekryterartabellerna, `guest_invitations`, de anonyma proven, `public_letter_drafts`, lagringshinkarna | 0 | inget att göra |

Villkoret för `email_events` (raderar händelser till adresser som inte hör till något konto i dag, utom våra egna):
```sql
-- Räkna först, ska ge 239 (eller färre om konton tillkommit):
select count(*) from public.email_events e
where lower(coalesce(e.payload->'to'->>0, e.payload->>'to')) not in (
        select lower(email) from auth.users where email is not null
        union select lower(email) from public.profiles where email is not null
        union select lower(contact_email) from public.profiles where contact_email is not null)
  and lower(coalesce(e.payload->'to'->>0, e.payload->>'to')) not like '%@jobbcoach.ai';

-- Sedan, med ägarens ja, samma villkor:
delete from public.email_events e
where lower(coalesce(e.payload->'to'->>0, e.payload->>'to')) not in (
        select lower(email) from auth.users where email is not null
        union select lower(email) from public.profiles where email is not null
        union select lower(contact_email) from public.profiles where contact_email is not null)
  and lower(coalesce(e.payload->'to'->>0, e.payload->>'to')) not like '%@jobbcoach.ai';
```
Adminens mejlstatistik för de raderade utskicken (öppningar och klick) minskar med det här; det är rätt, de kontona finns inte.

PostHog: byggaren skriver `scripts/radera-posthog-rester.ts`, som läser alla distinct_id av version 4 ur PostHog (HogQL mot `person_distinct_ids`), tar bort dem som finns i `auth.users`, tar bort personer som också har ett id som finns i `auth.users`, behåller bara personer med `email`, skriver antalet och stannar. Med flaggan `--kor` (bara efter ägarens ja, med `POSTHOG_RADERA_NYCKEL`) anropas `bulk_delete` med `delete_events: true` i omgångar om högst 1 000.

---

## Del 3. Ordningen

1. Del 1a till 1d och 1c, en push. Inga användartexter.
2. Del 1e byggs med `dag: null`. Förhandsvisning och test går att köra i adminen efter deploy.
3. Del 2: migreringen (ägarens ja till migreringen), sedan koden, klicktestet och en push.
4. Ägaren: PostHog-nyckeln i Vercel, ja till policyns lydelse (förs in samma dag som Del 2 är ute eller senare), ja till resterna i 2d, ja till utskicksdagen för Jobbsöket.

Grindar före push: tsc, berörda vitest och full vitest en gång, bygget en gång, klicktestet av raderingen på Pixel 7 och 1440. Mejlen ligger utanför SEO-grinden; policyn är publik men ändras inte i den här omgången.

---

## Del 4. Det copywritern invände och hur det avgjordes, och det som inte gick att avgöra här

Copywriterns invändningar:
1. **Raden kan gå att knyta till en person när raderingarna är få.** Håller med. Avgjort: kvartal, inget registreringsval, `hade_premium` som sant eller falskt, ingen tidskolumn, slumpat id, adminen visar fördelningar först vid fem rader och aldrig rad för rad. Policyn säger "utan något som pekar ut dig", inte "anonym".
2. **Play-prenumeranten på webben.** Håller med: R4b läggs till och visas bara för `premium_source = 'play'` med giltig tid.
3. **Appens radering tar hela kontot.** Stämmer med koden: samma `raderaKonto`. R10 och R11 står.
4. **Statistikraden skrivs för alla.** Håller med: R5 och R10b säger det.
5. **En rad om betald tid som går förlorad.** Inte med: raderingen säger inget om återbetalning, och en mening om förlorad tid utan något om ångerrätten skapar fler frågor än den löser. Tas upp om supporten får frågor.
6. **J5 ska följa kortets villkor.** Håller med: `harBrev` läses som kortet läser (`letters`, `is_saved = true`); mottagarna har inga sökta tjänster, så inga brev är redan kopplade.
7. **J1 förutsätter att mottagaren har sökt jobb.** Inte med: den som tränar inför ett rekryteringstest har sökt och blivit kallad. Urvalet står kvar på 213.
8. **Avsnitt 2 och 4 i policyn skaver mot stycket om leverantörerna.** Håller med, men det är juristens genomgång; står i avsnittet till ägaren.
9. **"Det val du gjorde när du registrerade dig" är vagt.** Löst genom att fältet ströks ur raden och ur policytexten.
10. **"Så länge du har ett konto" förutsätter att vilande konton aldrig rensas.** Det stämmer i dag: ingen kod rensar vilande konton. En gräns för vilande konton är ägarens fråga och tas med IMY-frågan.

Inte avgjort här (ägaren):
- **Lagringstiderna hos Resend och Supabase.** Policyn säger "under den tid som följer av deras villkor". Vill ägaren ha antal dagar slår ägaren upp dem för sina planer, och copywritern för in talen.
- **Stripe-kunder efter sju år.** Ingen kod raderar en Stripe-kund. Ska kunder vars konto raderats tas bort när underlaget inte längre behöver sparas är det ett eget beslut, tidigast 2033.
- **Profilfotohinken är publik** (beslut-agarpunkter, policylistan punkt 7) och berörs inte av raderingen, som redan tar bort fotot.
- **Google Tag Manager och Google Analytics** laddas men nämns inte i policyn. Juristens.
