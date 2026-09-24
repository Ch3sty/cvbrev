# Köptest i Stripes testläge, 2026-09-24

Alla sex paketen köpta på riktigt i Stripes testläge (sandlåda) mot ett lokalt produktionsbygge, i riktig Chrome via puppeteer-core med vanlig user agent, Pixel 7 och desktop. Kortet 4242 4242 4242 4242 i Stripes hostade kassa. Live-nycklarna rördes inte. Supabase är produktionsdatabasen; allt som skapades är raderat per id (se Städning).

Skärmdumpar: `docs/qa/kop-testlage/` (namn `<paket>-<vy>-<steg>.png`, steg a till h enligt tabellen nedan).

## Uppsättning

- `scripts/stripe-testlage-setup.ts` skapar idempotent sex produkter och sex priser i testläget, letar först på `product.metadata.planKey`. Namn och nicknames som live: CV-paketet 79 kr/vecka, Träningspaketet 79 kr/vecka, Dagspasset 49 kr engång (`dag`), Hela paketet 99 kr/vecka, 149 kr/månad, 299 kr/3 månader (`kvartal`). SEK, `tax_behavior: inclusive`, metadata `planKey` och `scope`. Andra körningen skapade ingenting (verifierat). Skriptet skapar också en standardkonfiguration för kundportalen i testläget, som `create-portal-session` kräver.
- Prisid:na, testnycklarna och en lokalt genererad `STRIPE_WEBHOOK_SECRET` skrivs till `.env.test.local` under samma variabelnamn som live (`STRIPE_PRICE_CV_WEEK`, `STRIPE_PRICE_TEST_WEEK`, `STRIPE_PRICE_DAYPASS`, `STRIPE_PRICE_ALL_WEEK`, `NEXT_PUBLIC_STRIPE_PRICE_ID`, `STRIPE_PRICE_QUARTER`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`). Filen täcks av `.env*.local` i `.gitignore` (kontrollerat med `git check-ignore`).
- Next läser inte `.env.test.local` vid `next build`/`next start` (bara när `NODE_ENV=test`), och `NEXT_PUBLIC_` bakas in vid bygget. Vägen som fungerar: läs in filen i processens miljö och kör både `next build` och `next start -p 3461` med `NEXT_DIST_DIR=.next-stripe`. En processvariabel vinner över `.env.local` (`@next/env` kollar `hasOwnProperty`). Samma process fick `NEXT_PUBLIC_SITE_URL=http://localhost:3461` (kassans returadress), `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=` (ingen mätning från testbygget till produktionens PostHog), `RESEND_API_KEY` ogiltig (inga riktiga mejl till QA-adresserna) och `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` (utan den faller bygget på Google Fonts bakom TLS-proxyn).

## Webhook-vägen

Stripe CLI, cloudflared och ngrok finns inte installerade. Vägen blev därför simulering: `scripts/stripe-testlage-webhook.mjs` hämtar nya event med `events.list` varannan sekund, äldst först, och postar dem till `http://localhost:3461/api/stripe/webhooks` med en signatur från `stripe.webhooks.generateTestHeaderString` och samma hemlighet som bygget startades med. Rutten verifierar alltså signaturen precis som i produktion (en felaktig signatur gav 400). 99 event postades under testet, alla fick 200.

Viktig iakttagelse: eventen i testläget renderas i API-version `2025-08-27.basil`. Se bugg 1.

## Paket × steg

a prissidan utloggad · b registrering, spårval, köpsteg med samtycke · c betalning · d webhookens avtryck · e hemskärm och Kom igång · f sidomenyn · g det paketet låser upp · h betalvägg för det som inte ingår

| Paket (vy för köpet) | a | b | c | d | e | f | g | h |
|---|---|---|---|---|---|---|---|---|
| CV-paketet (Pixel 7) | OK "Börja med CV-paketet, 79 kr i veckan" | OK förvalt kort, "Fortsätt med CV-paketet, 79 kr i veckan", knappen spärrad tills samtycke | OK "Abonnera på CV-paketet 79,00 kr per vecka" | OK scope cv, tier premium, status active, samtycke skrivet. paket_started_at tomt (bugg 1) | OK "Kom igång med CV-paketet, 0 av 8", ingen Intervjuprovet-bricka | OK "Du har CV-paketet / Förnyas 1 oktober, 79 kr" | OK 41 mallar, analys (kräver CV först) | OK intervju "Ett prov per dygn … Se Träningspaketet, 79 kr i veckan", tester "Träningspaketet, 79 kr i veckan", avancerat personlighetstest "Skaffa Träningspaketet, 79 kr i veckan", menyn "Hela paketet kostar 20 kr till i veckan" |
| Träningspaketet (desktop) | OK "Börja med Träningspaketet, 79 kr i veckan" | OK | OK | OK scope tester. paket_started_at tomt | OK Kom igång 0 av 9 med brickan "Intervjuprovet, utan tak" | OK, men namnet klipps på desktop (bugg 7) | OK intervju "Utan tak i Träningspaketet", alla nivåer, fördjupade personlighetstestet öppet | OK mallar "3 mallar ingår. Alla 41 finns i CV-paketet, 79 kr i veckan", knapparna "Byt till CV-paketet, 79 kr i veckan" och "Eller Hela paketet för 20 kr till i veckan". Knapparna ger ingen respons (bugg 3) |
| Dagspasset (Pixel 7) | OK "Börja med Dagspasset, 49 kr, ett dygn" | FEL spårvalets knapp sa "Fortsätt med Hela paketet, 99 kr i veckan" (rättad, R1). Köpsteget rätt: "Dagspasset, från nu", 49 kr engångs, "Gäller till fredag 08:28", samtycke "engångsköp på 49 kr, inget dras igen" | OK "Dagspasset 49,00 kr", Betala | OK premium_grants 1 dag scope allt, premium_until +24 h, ingen prenumeration, paket_started_at skrivet | OK Kom igång med Hela paketet, 0 av 12, Intervjuprovet ingår. Returskärmen säger "Du har Hela paketet" (bugg 9) | OK "Du har Dagspasset / Gäller till 08:29", ingen förnyelse | OK allt öppet | ingen betalvägg, som väntat |
| Hela paketet vecka (desktop) | OK "Börja med Hela paketet, 99 kr i veckan" | OK | OK "99,00 kr vecka" | OK scope allt. paket_started_at tomt | OK 0 av 12, Intervjuprovet | OK "Förnyas 1 oktober, 99 kr" | OK Jobbcoachen, matchning, intervju utan tak, alla nivåer | ingen |
| Hela paketet månad (Pixel 7) | OK "Börja med Hela paketet, 149 kr i månaden" | FEL spårvalets knapp "99 kr i veckan" (rättad). Köpsteget "149 kr i månaden, var trettionde dag, nästa 24 oktober" (bugg 8) | OK "149,00 kr per månad" | OK scope allt, price månad. paket_started_at tomt | OK 0 av 12 | FEL "Förnyas 24 oktober, 99 kr" (bugg 2) | OK | ingen |
| Hela paketet kvartal (desktop) | OK "Börja med Hela paketet, 299 kr per kvartal" | FEL spårvalets knapp "99 kr i veckan" (rättad). Samtycke "299 kr var tredje månad" | OK "299,00 kr, 3 månad" | OK scope allt, current_period_end 24 december | OK 0 av 12, Intervjuprovet | FEL "Förnyas 24 december, 99 kr" (bugg 2) | OK | ingen |

Andra vyn (hemskärm, Kom igång, meny) kördes för alla sex: CV och Träningspaketet på båda, Dagspasset desktop, Hela vecka/kvartal Pixel 7, Hela månad även full genomgång på Pixel 7. Rättelsen av spårvalets knapp verifierades efter nytt bygge i Chrome: `?paket=all_day` Pixel 7 "Fortsätt med Dagspasset, 49 kr, ett dygn", `all_month` desktop "… 149 kr i månaden", `all_quarter` Pixel 7 "… 299 kr per kvartal" (`rattelse-sparval-*.png`).

Kvittomejlets ämne, renderat ur mallen för alla sex: "Kvitto: CV-paketet, 79 kr", "Kvitto: Träningspaketet, 79 kr", "Kvitto: Dagspasset, 49 kr", "Kvitto: Hela paketet, en vecka, 99 kr", "Kvitto: Hela paketet, en månad, 149 kr", "Kvitto: Hela paketet, ett kvartal, 299 kr". Ämnet följer regeln. Men mejlet skickas aldrig (bugg 4).

## Livscykel

| Fall | Utfall |
|---|---|
| Uppsägning, CV-paketet (desktop) | OK Vår enkät: "Jag använder det inte" sparad i cancel_intents (reason anvander_inte, completed_cancel true), erbjudandet "Kör analysen först" visas, "Avsluta ändå" öppnar kundportalen, "Säg upp abonnemang" sätter cancel_at_period_end. FEL efteråt: menyn och prenumerationssidan säger fortfarande "Förnyas 1 oktober, 79 kr" (bugg 5). offer_shown skrivs inte när erbjudandet bara visas (bugg 10) |
| Byte Träningspaketet till Hela paketet (desktop) | OK i Stripe: samma prenumeration får priset för Hela paketet vecka, mellanskillnaden 19,97 kr fakturerad och betald, en enda prenumeration hos kunden, profilen scope allt. Ett andra köp via kassan stoppas med 409 "Du har redan en aktiv prenumeration". FEL i gränssnittet (bugg 3) |
| Dagspassets utgång | OK premium_until och grantets premium_until_after satta en timme bakåt per id; före körningen kontrollerades att cron-frågan bara träffade QA-kontot. `/api/cron/expire-premiums` lokalt: 200, expired 1, tier free. Hemskärmen och menyn efteråt: "Du är på gratisnivån / Tre paket, från 49 kr" |
| Misslyckat kort 4000 0000 0000 0002 (desktop) | OK Stripe visar "Ditt kreditkort nekades. Försök betala med ett bankkort istället.", kunden stannar i kassan, profilen tier free och inget scope, menyn "Du är på gratisnivån". Prenumerationen blir `incomplete`, som spärren inte räknar som levande, så ett nytt försök går igenom |

## Buggar

Ingen av dem ligger i filerna som den andra agenten arbetade med, utom där det sägs.

1. **Webhooken läser fakturor i det gamla formatet (hög, bör kontrolleras mot live).** `invoice.payment_succeeded` och `invoice.payment_failed` letar prenumerationen i `invoice.subscription`. I API-version basil (2025-08-27) ligger den i `invoice.parent.subscription_details.subscription`, och testlägets event kommer i den versionen. Följd i testet: grenen hoppas över med "Missing data", så `paket_started_at` skrevs aldrig för någon av de fem prenumerationerna, `subscription_paid` mäts inte och hjälpredans kö rensas inte; vid misslyckad betalning skickas inte `payment_failed`-mejlet. Profilen blir ändå rätt, eftersom `customer.subscription.*` bär samma data. Reproduktion: köp ett veckopaket i testläget, läs `profiles.paket_started_at` (null) och eventets `api_version`. Om live-webhookens endpoint står på basil eller senare gäller samma sak i produktion; PostHog har ingen `subscription_paid` från servern (`$lib = jobbcoach-server`) de senaste 60 dagarna, vilket stämmer med det men inte bevisar det. Åtgärd: läs `eventData.subscription ?? eventData.parent?.subscription_details?.subscription` i webhookrutten, och kontrollera endpointens API-version i Stripe.
2. **Sidomenyn visar fel belopp för Hela paketet månad och kvartal (medel).** "Förnyas 24 oktober, 99 kr" och "Förnyas 24 december, 99 kr". `harPaket()` gissar längden ur `premium_until`, men webhooken nollar `premium_until` för prenumerationer, så gissningen blir alltid vecka. Samma funktion används i `getSummary.ts` (menyn), `cv-mallar/page.tsx`, `tester/page.tsx`, `profil/prenumeration/page.tsx` och mejlrunnern. Åtgärd: slå upp paketet med `priceIdToPlanKey(profiles.price_id)` och fall tillbaka på `current_period_end`. Rörde inte `getSummary.ts`, den låg i den andra agentens ändringar.
3. **Uppgraderings- och bytesknapparna ger ingen respons (medel).** På CV-mallarna för Träningspaketet: "Eller Hela paketet för 20 kr till i veckan" byter paket på servern (200 `{ upgraded: true }`) men klienten väntar på `json.url`, så sidan står kvar med "Du har Träningspaketet" tills man laddar om. "Byt till CV-paketet, 79 kr i veckan" får 409 "Du har redan en aktiv prenumeration" och klienten säger ingenting alls. Samma mönster i `FelSpar.tsx`. Reproduktion: Träningspaketet, `/dashboard/cv-mallar`, tryck någon av knapparna. Åtgärd: hantera `upgraded` (kvittens och `router.refresh()`) och 409 (skicka till kundportalen eller visa texten).
4. **Kvittomejlet skickas aldrig (medel).** Mallen `receipt` finns i registret, men inget anropar `sendLifecycleNow(…, 'receipt')` eller schemalägger den. Köpsteget lovar "Kvitto på mejl". Ämnesraden i mallen följer regeln. Åtgärd: skicka kvittot från `invoice.payment_succeeded` (subscription_create och subscription_update) och från Dagspassets `checkout.session.completed`, med `planKey`, `amount`, `periodStart`, `periodEnd` i metadata. Mallens brödtext rättad här, se nedan.
5. **Uppsagt paket ser ut att förnyas (medel).** Efter uppsägning i portalen står "Förnyas 1 oktober, 79 kr" kvar i menyn, och prenumerationssidan visar inget uppsagt läge. `cancel_at_period_end` lagras inte på profilen och läses bara av `subscription-details`-rutten, som ingen komponent använder. Åtgärd: spara flaggan i webhooken och visa "Uppsagt, gäller till 1 oktober".
6. **React-fel #185 en gång (låg, ej återskapat).** Under köpflödet för Hela paketet månad på Pixel 7 loggades "Minified React error #185" (maximal uppdateringsdjup). Samma konto och vy genom alla sju ytor efteråt gav inget fel, så felet uppstod i registrering, spårval, köpsteg eller returskärmen. Värt en körning i dev-läge.
7. **Menyhuvudet klipps på desktop (låg).** "Du har Träningsp…" och "Förnyas 1 oktober, 79…" vid 1280 px, eftersom "Vad ingår?" tar plats i samma rad. Hela paketet får plats.
8. **Månaden beskrivs som "var trettionde dag" (låg, beslut).** Köpsteget, samtyckestexten och flera ytor säger att månaden förnyas var trettionde dag och räknar nästa dragning som +30 dagar. Stripe drar samma datum varje kalendermånad, så datumet blir fel vid månader med 31 dagar och texten stämmer inte med dragningen. Samtyckestexten är juridisk och formuleringen finns på sex ställen, så den är inte ändrad här.
9. **Dagspassets returskärm säger "Du har Hela paketet" (låg).** Menyn säger "Du har Dagspasset, gäller till 08:29". Returskärmen (`komigang.ts`) väljer text ur scopet.
10. **offer_shown skrivs inte (låg).** Uppsägningsflödet visar erbjudandet i steg 2 men sparar bara `offer_shown` när det accepteras, så adminen kan inte räkna hur många som såg det.

Iakttagelser utan buggstatus: returskärmen efter kassan visar ibland "Du är på gratisnivån" i menyn i någon sekund, eftersom webhooken ännu inte landat; i testet förstärkt av relät som pollar varannan sekund. `/api/cron/expire-premiums` står inte i `vercel.json` (nedtrappningen i produktion görs i `pricing-sync`, som också skickar `onetime_expired`); körs den fristående skickas inget sådant mejl. `fetchSavedLettersCount Error` loggas i konsolen på CV-mallarna och hemskärmen för nya konton. "Failed to send confirmation email" i bannern beror på den avsiktligt ogiltiga Resend-nyckeln i testbygget.

## Rättat här (S)

- `src/components/pricing/paket-copy.ts`, `src/app/dashboard/valj-spar/ValjSparClient.tsx`: spårvalets primärknapp tar den förvalda längden, så `?paket=all_day|all_month|all_quarter` ger "Fortsätt med Dagspasset, 49 kr, ett dygn", "… 149 kr i månaden", "… 299 kr per kvartal" i stället för "99 kr i veckan". Test tillagt i `paket-copy.test.ts`. Verifierat i Chrome efter nytt bygge.
- `src/lib/email/lifecycle/templates/vecka.ts`: kvittots brödtext sa "förnyas sedan var sjunde dag" för alla paket. Nu "varje månad" för månaden, "var tredje månad" för kvartalet, och för Dagspasset "förnyas inte, inget mer dras" utan raden "Nästa dragning" och med knappen "Till Mitt jobbsök" i stället för "Säg upp".

## Städning

Stripe testläge: 7 testkunder raderade (sex köpkonton och kortfelskontot), 6 prenumerationer avslutade (verifierat `canceled`), 1 öppen checkout-session utgången. Produkterna, priserna och portalkonfigurationen ligger kvar för framtida tester.

Supabase (produktion), räknat före och raderat per id med `id in (…)`:

| Tabell | Före | Raderade | Kvar |
|---|---|---|---|
| user_activities | 216 | 216 | 0 |
| email_schedule | 14 | 14 | 0 |
| email_confirmations | 7 | 7 | 0 |
| monthly_guest_allowances | 6 | 6 | 0 |
| premium_grants | 1 | 1 | 0 |
| cancel_intents | 1 | 1 | 0 |
| email_log | 0 | 0 | 0 |
| profiles | 7 | 7 | 0 |
| auth.users (auth admin, sist) | 7 | 7 | 0 |

Kontrollfråga efteråt över alla tabeller med `user_id`: inga rader kvar, inga `qa-kop-`-användare i auth. Ett av kontona fick adressen `qa-kop-hela-manad-2026-09-24@jobboach.ai` (ett tecken tappades vid inmatningen på Pixel 7); id:t spårades och kontot raderades som de andra.

QA-kontonas id: cv 182ea3b6-588f-4cef-ae3f-6d8b0db35d6a, traning ca78d9be-78d7-4fbc-9b5b-74eac06ff906, dagspass f69247b3-d381-4a6d-972e-cff737148c19, hela-vecka d0164fb8-612e-4041-84ec-d28b86d735fa, hela-manad 7af8c84d-8692-4652-afc0-71fa1cff34b6, hela-kvartal 5cc4974a-9af1-497c-9d2f-e1198a173944, kortfel 013dc391-474b-47ae-ad3b-0f79a7f23a16.

Byggkatalogen `.next-stripe` borttagen, tsconfig-raderna som bygget lade till återställda, `.env.test.local` ligger kvar lokalt och är gitignorerad.

## Köra om

```
npx tsx scripts/stripe-testlage-setup.ts
# bygg och starta med .env.test.local i processen, NEXT_DIST_DIR=.next-stripe, port 3461
node scripts/stripe-testlage-webhook.mjs
SCRATCH=<tmp> node scripts/qa-kop-testlage.mjs kop cv pixel7
SCRATCH=<tmp> node scripts/qa-kop-testlage.mjs byte desktop
SCRATCH=<tmp> node scripts/qa-kop-testlage.mjs uppsagning cv desktop
SCRATCH=<tmp> node scripts/qa-kop-testlage.mjs kortfel desktop
```

## Rättelser och omkörning, 2026-09-24 (förmiddag)

Buggarna 1 till 5, 7 och 9 ovan är rättade. Omkörningen gjordes mot ett nytt produktionsbygge i testläget (`NEXT_DIST_DIR=.next-stripe2`, samma miljö som ovan: `.env.test.local` i processen, PostHog av, ogiltig Resend-nyckel), med relät `scripts/stripe-testlage-webhook.mjs` och i riktig Chrome på Pixel 7 om inget annat sägs. Skärmdumpar: `docs/qa/kop-testlage/fix-*.png`. Kontona hette `qa-kop-<paket>-fix-2026-09-24@jobbcoach.ai` (`TAGG` och `PREFIX` i skriptet, nytt läge `angra`). 65 event postades, alla fick 200.

### Live-endpointen (läst med live-nyckeln, bara läsning)

`webhookEndpoints.list()`: en endpoint, `https://www.jobbcoach.ai/api/stripe/webhooks`, status enabled, 72 eventtyper, skapad 2025-09-22, **`api_version: 2025-08-27.basil`**. Kontots standardversion (svarshuvudet `Stripe-Version` när anropet inte anger någon) är också `2025-08-27.basil`. De fyra senaste `invoice.payment_succeeded` i live (31 augusti till 9 september) saknar `invoice.subscription` och har `parent`. Live drabbas alltså i dag och har gjort det sedan endpointen skapades: `paket_started_at` skrivs aldrig för prenumerationer, `subscription_paid` och `renewal_succeeded` mäts aldrig från servern, hjälpredans kö rensas inte vid köp, och mejlet om misslyckad betalning har aldrig gått ut. Rättelsen verkar från deploy. Redan betalande kunder saknar `paket_started_at` tills en backfyllning görs.

### Per bugg

**1, hög. Fakturans prenumeration.** Orsak: rutten läste `invoice.subscription`, som inte finns i basil. Rättelse: `invoiceSubscriptionId()` läser `parent.subscription_details.subscription` och det gamla fältet. Samma hjälpfil läser `payment_intent`, `charge`, radens pris och period i båda formaten, och `subscriptionPeriodEnd()` läser periodens slut på roten (acacia) eller på raden (basil). Genomgång mot basil: av de flyttade fälten läser rutten prenumerationen, fakturaradens period och prenumerationens `current_period_end`; `checkout.session` och `customer.subscription.*` använder bara fält som inte flyttat. SDK:n är låst till acacia, så rutternas egna `retrieve`-anrop får det gamla formatet, men periodens slut läses nu robust ifall låsningen ändras. `payment_failed` skickas inte längre för den första fakturan (kortet nekat i kassan, kunden ser felet där och prenumerationen blir incomplete) och bara en gång per event. Filer: `src/lib/stripe/invoiceFields.ts`, `src/app/api/stripe/webhooks/route.ts`, `src/lib/email/lifecycle/hooks.ts`. Verifierat: 13 enhetstest med båda payloadformerna (basil-fakturan hämtad ur testläget). Omkörning: `paket_started_at` satt för Träningspaketet (07:18:28), Hela paketet månad (07:20:23) och Dagspasset (07:21:34). Kortfelet gav `invoice.payment_failed` med 200 och inget mejl i kön.

**2, medel. Belopp i menyn.** Orsak: `harPaket()` gissade längden ur `premium_until`, som webhooken nollar för prenumerationer. Rättelse: paketet slås upp ur `profiles.price_id` med `priceIdToPlanKey`, bara när prenumerationen lever (active, trialing, past_due, unpaid) och priset ger samma scope. Gissningen står kvar för engångsköp och manuell premium. Alla fem anropare skickar prisid och status. Filer: `src/lib/plans/harPaket.ts`, `src/lib/dashboard/getSummary.ts`, `cv-mallar/page.tsx`, `tester/page.tsx`, `profil/prenumeration/page.tsx`, `src/lib/email/lifecycle/runner.ts`. Verifierat: 15 enhetstest, ett per prenumerationsnyckel plus reserverna. Menyn för Hela paketet månad: "Förnyas 24 oktober, 149 kr" (`fix-hela-manad-pixel7-f-meny.png`). Prenumerationssidans statusrad har nu datum ("Hela paketet, förnyas 24 oktober"); den läste tidigare det nollade `premium_until`.

**3, medel. Bytesknapparna.** Orsak: knapparna väntade på `json.url`, men rutten svarar `{ upgraded: true }` utan url vid bytet och 409 vid sidledes byte. Rättelse: `bytPaket()` skiljer på bytt, kassa, redan och fel. Bytt: raden "Du har nu Hela paketet" och `router.refresh()` (i arket först när det stängs, annars försvinner arket med bekräftelsen). 409: raden "Du har redan ett paket som löper. Byt paket från prenumerationssidan." med länken Till prenumerationen. Rutten skriver också scope och prisid på profilen direkt vid bytet, så omladdningen visar det nya paketet innan webhooken kommit. Samma rättelse i testhubbens fot för CV-paketet. Filer: `src/lib/stripe/bytPaketKlient.ts`, `src/components/paywall/PaketBytesRad.tsx`, `FelSpar.tsx`, `CvMallarClient.tsx`, `TesterHubClient.tsx`, `create-upgrade-session/route.ts`, strängarna i `paket-copy.ts` (`PAKETBYTE`). Verifierat: två nya komponenttest i `FelSpar.test.tsx`. Omkörning, Träningspaketet på `/dashboard/cv-mallar`: "Byt till CV-paketet" gav 409 och raden med länken (`fix-byte-pixel7-1b-byt-till-cv.png`), "Eller Hela paketet för 20 kr till i veckan" gav 200 och "Du har nu Hela paketet" (`fix-byte-pixel7-2-efter-klick.png`), profilen fick scope allt och nytt prisid, menyn "Du har Hela paketet / Förnyas 1 oktober, 99 kr". Ett andra köp via kassan ger fortfarande 409.

**4, medel. Kvittot.** Orsak: ingen anropade mallen `receipt`. Rättelse: webhooken skickar kvittot vid Dagspassets `checkout.session.completed` och vid prenumerationens första faktura (`billing_reason` subscription_create), aldrig vid förnyelse eller prisbyte (planen avsnitt 8 kräver kvitto vid köpet). Idempotent per Stripe-event: raden `receipt_<event.id>` läggs i `email_schedule` först, unique-indexet stoppar en andra, och bara den som skapade raden skickar. Misslyckas sändningen står ämnet i `last_error`, och morgonkörningen försöker igen, högst tre gånger. Filer: `hooks.ts` (`sendOncePerStripeEvent`, `onPaymentReceipt`), `runner.ts` (`sendScheduledRowNow`), `registry.ts` (suffixet `_evt_`), webhookrutten. Verifierat: 8 test för ämnet och registret, 2 för idempotensen. Omkörning, `email_schedule.last_error` med den ogiltiga nyckeln: "resend: API key is invalid | ämne: Kvitto: Träningspaketet, 79 kr", "… Kvitto: Hela paketet, en månad, 149 kr" och "… Kvitto: Dagspasset, 49 kr", med planKey, belopp och period i metadata (24 september till 24 oktober för månaden). Uppgraderingen gav inget kvitto.

**5, medel. Uppsagt paket.** Orsak: `cancel_at_period_end` sparades inte. Rättelse: ny kolumn `profiles.cancel_at_period_end` (migration `20260924150000_profiles_cancel_at_period_end.sql`, applicerad på Jobbcoach-projektet, bara en kolumn med standardvärde false). Webhooken sätter den vid varje prenumerationsevent, även när portalen använder `cancel_at`. Menyn: "Gäller till 24 oktober, förnyas inte". Prenumerationssidan: "Hela paketet, uppsagt. Gäller till 24 oktober, förnyas inte", och raden Säg upp byts mot Ångra uppsägningen, som öppnar kundportalen. Portalen har redan "Säg inte upp abonnemang", så ingen egen ångra-rutt behövdes. Förnyelsepåminnelsen hoppas över för ett uppsagt paket. Filer: migrationen, webhookrutten, `paket-rader.ts`, `getSummary.ts`, `DashboardDataContext.tsx`, `PrenumerationClient.tsx`, `prenumeration/page.tsx`, `runner.ts`, `paket-copy.ts`. Verifierat: enhetstest för menyhuvudet. Omkörning, Hela paketet månad: vår enkät, portalen, "Säg upp abonnemang", profilen `cancel_at_period_end = true`, prenumerationssidan och menyn enligt ovan (`fix-uppsagning-hela-manad-pixel7-8b-prenumeration-uppsagd.png`, `-9-meny.png`). Ångra: Ångra uppsägningen, portalen, Säg inte upp abonnemang, flaggan tillbaka till false och menyn "Förnyas 24 oktober, 149 kr" (`fix-angra-*`).

**7, låg. Menyhuvudet.** Namnet och underraden kapades med `truncate`. Nu radbryts de, och Vad ingår? står kvar uppe till höger, i sidomenyn och i profilmenyn (`Sidebar.tsx`, `ProfileMenu.tsx`). Desktop 1280 px med den längsta raden: "Gäller till 24 oktober, förnyas inte" på två rader utan kapning (`fix-hela-manad-desktop-f-meny.png`).

**9, låg. Dagspassets returskärm.** Välkomstskärmen valde text ur scopet. Nu får Dagspasset (`plan=all_day` i returadressen) egen rubrik via `paketNamn('all_day')` (`komigang.ts`, `vecka/start/page.tsx`, `VeckaStartClient.tsx`). Test, och omkörningen: "Du har Dagspasset. Hela jobbsöket är öppet i ett dygn.", menyn "Du har Dagspasset / Gäller till 09:21".

`npx tsc --noEmit` rent (utom `.next/dev/types`), vitest 71 filer och 861 test gröna, produktionsbygget gick igenom.

### Kvar

- Sidledes byte mellan CV-paketet och Träningspaketet går fortfarande inte i appen. Prenumerationssidans "Byt till CV-paketet" går till samma rutt och får samma 409. Kundportalens konfiguration måste tillåta prisbyte, eller så byggs ett schemalagt byte vid nästa förnyelse.
- Befintliga betalande kunder i live saknar `paket_started_at`. Kan backfyllas ur Stripe (första fakturans datum per prenumeration).
- Kom igång-arket säger "Kom igång med Hela paketet" för Dagspasset; bara returskärmen är rättad.
- Buggarna 6 (React-fel #185), 8 (var trettionde dag) och 10 (offer_shown) är orörda.
- Klart i eftermiddagens omgång: sidbytet, backfyllningen, Kom igång för Dagspasset och bugg 8. Se avsnittet Sidbyte, backfyllning och texter nedan.
- En registrering på Pixel 7 stannade kvar på formuläret utan att signup-anropet gick iväg (första försöket, inget konto skapades). Nästa försök med samma steg gick igenom. Inte återskapat.

### Städning, omkörningen

Stripe testläge: 4 testkunder raderade (Träningspaketet, Hela paketet månad, Dagspasset, kortfel), 3 prenumerationer avslutade (verifierat `canceled`), 1 öppen checkout-session utgången. Produkter, priser och portalkonfiguration ligger kvar.

Supabase (produktion), räknat före och raderat per id (6 konton: de fyra köpkontona och två sonderingskonton från felsökningen av registreringen):

| Tabell | Före | Raderade | Kvar |
|---|---|---|---|
| user_activities | 92 | 92 | 0 |
| email_schedule | 15 | 15 | 0 |
| email_confirmations | 6 | 6 | 0 |
| monthly_guest_allowances | 3 | 3 | 0 |
| premium_grants | 1 | 1 | 0 |
| cancel_intents | 1 | 1 | 0 |
| email_log | 0 | 0 | 0 |
| profiles | 6 | 6 | 0 |
| auth.users (auth admin, sist) | 6 | 6 | 0 |

Kontrollfrågan över alla tabeller med `user_id` gav noll rader, och inga `qa-kop-`-användare finns kvar i auth. Dagspasskontot fick adressen `…@jobboach.ai` (samma tappade tecken som förra gången) och raderades per id. Id: traning 5473b0bf-600c-4585-b34d-522b026c431f, hela-manad 39ed6b0a-6769-453d-988e-205de341ea37, dagspass 0f7f9ec7-3d54-4899-9ac3-c179fb23ade7, kortfel df3b36ea-8a05-4672-abb6-720b378e2908, sondering 9323fe2f-8c8d-440b-b593-d13c82ab94ad och 1c10b0d0-29cb-42fc-a616-f4856a3e720e.

Byggkatalogen `.next-stripe2` borttagen, tsconfig-raderna återställda.

## Sidbyte, backfyllning och texter, 2026-09-24 (eftermiddag)

Fyra av punkterna under Kvar ovan. Byggt och klicktestat mot ett nytt produktionsbygge i testläget (`NEXT_DIST_DIR=.next-byte`, `.env.test.local` i processen, PostHog av, ogiltig Resend-nyckel), relät `scripts/stripe-testlage-webhook.mjs`, riktig Chrome med Pixel 7. Skärmdumpar `docs/qa/kop-testlage/byte-*.png`. 29 event postades, alla fick 200. Nya lägen i `scripts/qa-kop-testlage.mjs`: `sidbyte`, `nedgradering`, `samtycke`, och `KOP_FULL=0`.

### 1. Sidbyte mellan CV-paketet och Träningspaketet

Orsak: `create-upgrade-session` släppte bara igenom spår till Hela paketet; allt annat blev 409. Rättelse: `valjByte()` (`src/lib/stripe/paketByte.ts`) avgör vad bytet blir, och rutten gör det:

| Från, till | Utfall |
|---|---|
| CV-paketet eller Träningspaketet till Hela paketet | uppgradering som förut, `always_invoice`, mellanskillnaden direkt |
| CV-paketet och Träningspaketet sinsemellan | sidbyte: `subscriptions.update` med nytt pris och `proration_behavior: 'none'`, gäller direkt, ingen faktura, dragningsdagen står kvar, en uppsägning står kvar |
| Hela paketet till ett spår | 409 med `vidFornyelse`, beskedet "Nedgradering sker vid nästa förnyelse. Säg upp Hela paketet i kundportalen, så gäller det perioden ut, och välj sedan det nya paketet." och länken Till kundportalen |
| Hela paketet till en annan längd | samma, "Byte av längd sker vid nästa förnyelse" |
| Samma paket, okänt pris | 409 som förut |

Planen (PR11) beskrev spårbytet som "säg upp och köp det andra", men dubblettspärren stoppar ett nytt köp så länge perioden löper, så den vägen fungerade inte. Appen har inget stöd för subscription schedules och kundportalen tillåter inte prisbyte, därför bara besked och portal för nedgraderingen. Rutten skriver `premium_scope`, `price_id`, `subscription_tier` och (vid sidbyte) `onboarding_track` på profilen direkt; paketet läses ur `price_id`. Klienten (`bytPaket`, `PaketBytesRad`) har utfallet `vidFornyelse`; prenumerationssidan använder samma rad och rullar fram den. Prissidans FAQ säger nu att spårbytet sker direkt. Enhetstest: `src/lib/stripe/__tests__/paketByte.test.ts` (7).

Klicktest, Pixel 7, kontot `qa-kop-traning-byte-2026-09-24@jobbcoach.ai`:

| Steg | Utfall |
|---|---|
| Köp Träningspaketet | OK, 79 kr, faktura `subscription_create`, kvittot i kön (ämnet i `last_error`) |
| CV-mallarnas betalvägg, "Byt till CV-paketet" | 200 `{ upgraded: true, byte: 'sidbyte' }`, raden "Du har nu CV-paketet" (`byte-sidbyte-pixel7-2-du-har-nu-cv.png`) |
| Stripe efter bytet | en prenumeration, pris `cv_week`, metadata `cv_week`/`cv`, periodens slut 1 oktober oförändrat, en faktura (79 kr), inga väntande fakturarader |
| Profil och meny | scope cv, price_id för CV-paketet, spår cv; menyn "Du har CV-paketet / Förnyas 1 oktober, 79 kr" |
| Testhubbens betalvägg, "Byt till Träningspaketet" (samma dag) | 200, "Du har nu Träningspaketet"; Stripe: samma prenumeration, pris `test_week`, fortfarande en faktura; menyn "Du har Träningspaketet" |
| Prenumerationssidan | CV-paketets kort: "Byt till CV-paketet, 79 kr i veckan", fotnot "Byts direkt, samma pris och samma dragningsdag" |
| Nedgradering, efter uppgradering till Hela paketet (20 kr) | "Byt till CV-paketet … vid nästa förnyelse" gav 409 och raden med beskedet och Till kundportalen, scope kvar allt, priset orört (`byte-sidbyte-pixel7-8-nedgradering-besked.png`) |
| Kvitton | ett enda, vid köpet. Sidbytena och uppgraderingen gav inget |

Uppdraget sa "byt till CV-paketet från betalväggen på testhubben", men Träningspaketet har ingen betalvägg på testhubben (allt där ingår). Bytet till CV-paketet gjordes därför från CV-mallarnas betalvägg och bytet tillbaka från testhubbens betalvägg, som CV-paketet har.

### 2. Backfyllning av paket_started_at i live

`scripts/backfill-paket-started-at.ts` listar levande och de senaste 90 dagarnas avslutade prenumerationer med live-nyckeln (bara läsning), tar första betalda fakturans datum (`status_transitions.paid_at`), kontrollerar fakturans prenumeration med `invoiceSubscriptionId`, matchar profilen på `subscription_id` och sedan `stripe_customer_id`, och skriver `paket_started_at` med villkoret `paket_started_at is null` i samma UPDATE. Supabase nås via Management API med `SUPABASE_TOKEN_JOBBCOACH`, och skriptet kontrollerar att projektet är `dbvbnbkvadvlhjhomibg`. Torrkörning först, sedan skarpt:

| E-post | Kund | Prenumeration | Status | planKey | Första betalda fakturan |
|---|---|---|---|---|---|
| ma***@g***.com | cus_VEKKZ0NojWYsmo | sub_1UDrgWPWMWdjmTDjoVL2cbsj | canceled | all_month | 2026-09-09 20:01 UTC |
| jo***@g***.com | cus_V2vy7yfKwpbfXA | sub_1U2qAePWMWdjmTDjqE0JKj6w | canceled | all_month | 2026-08-10 10:11 UTC |
| en***@l***.se | cus_Up3kUkBn5HWsaD | sub_1TpPffPWMWdjmTDjV8d8oNn1 | canceled | all_month | 2026-07-04 09:15 UTC |
| ir***@g***.com | cus_UcqdCf89t1NAlC | sub_1TmAYcPWMWdjmTDjyv5z3K9c | active | all_month | 2026-06-25 10:30 UTC |
| lo***@g***.com | cus_UlU6SsPUwDTX72 | sub_1Tlx8vPWMWdjmTDjRa1Rhcxl | canceled | all_month | 2026-06-24 20:11 UTC |
| sa***@g***.com | cus_Udoa8dXg3LwwJo | sub_1TeWz0PWMWdjmTDj0GaEq7Wj | canceled | all_month | 2026-06-04 08:50 UTC |
| st***@g***.com | cus_U4lcvJPEmYgjGO | sub_1T6c65PWMWdjmTDjubYCm15u | active | all_month | 2026-03-02 19:25 UTC |
| to***@g***.com | cus_U3sYjGXJGMOXUU | sub_1T5kqiPWMWdjmTDjTkI0QITH | canceled | all_month | 2026-02-28 10:34 UTC |
| kh***@c***.se | cus_TfCdQfUIqFxwjM | sub_1ShsFbPWMWdjmTDjNwjIwgZi | active | all_month | 2025-12-24 13:37 UTC |

Tio prenumerationer i Stripe, nio profiler (en profil hade två prenumerationer; den som står i `profiles.subscription_id` vann). Skrivna 9, kontrolläsningen 9 av 9, och en ny räkning i databasen gav 9 profiler med `paket_started_at`. Ingen annan kolumn rördes. Skrivningen är avsiktlig och städas inte bort.

### 3. Texter

**Kom igång för Dagspasset.** Arket och raden sa "Kom igång med Hela paketet". Läget bär nu `dagspass` (summeringens planKey `all_day`), rubriken tar `paketNamn('all_day')` och arket får raden "Hela jobbsöket är öppet i ett dygn. Ta CV:t först, så har resten ett uppdaterat CV att arbeta med." Samma namn i Kom igång-mejlet. Klicktest efter köp av Dagspasset på Pixel 7: "Kom igång med Dagspasset, 0 av 12" med dygnsraden (`byte-dagspass-pixel7-e2-komigang.png`), menyn "Du har Dagspasset / Gäller till 10:04".

**Var trettionde dag (bugg 8).** Stripe drar månaden samma kalenderdatum och kvartalet var tredje månad (live- och testpriserna lästa: 149 kr `1 month`, 299 kr `3 month`, alla sex beloppen stämmer med PLANS). Ändrat: prisraden på Hela paketets kort, köpstegets förnyelserad, samtycket, kontosidans punkter och intervallrad, onboardingens paketrader (även kvartalets "var nittionde dag") och kvittot ("dras sedan varje månad på samma datum", nästa dragning är fakturaradens periodslut, alltså Stripes). `nastaDragningEfter()` i `plans.ts` räknar nästa dragning som Stripe (UTC, månadens sista dag när datumet saknas) och ersätter +30 och +90 dagar på köpsteget och i förnyelsepåminnelsens periodstart. Samtycket bär nu belopp och datum, och `create-plan-session` lägger exakt den texten i sessionens metadata; tidigare låg där en äldre, kortare mening som kunden aldrig såg. Klicktest, köpsteget för Hela paketet månad på Pixel 7: "Förnyas: varje månad på samma datum, nästa 24 oktober" och samtycket "… 149 kr dras varje månad på samma datum, nästa gång 24 oktober, tills jag säger upp prenumerationen." (`byte-samtycke-all_month-pixel7.png`). Enhetstest: `manad-dragning.test.ts` (11), Kom igång (2), uppdaterade samtyckestest.

`npx tsc --noEmit` rent (utom `.next/dev/types`), vitest 73 filer och 881 test gröna, produktionsbygget gick igenom (två gånger, det andra efter att prenumerationssidans rad fick rulla fram).

### Kvar efter det här

- Buggarna 6 (React-fel #185) och 10 (offer_shown) är orörda.
- Nedgradering och längdbyte schemaläggs inte; kunden säger upp i portalen och väljer nytt paket när perioden gått ut. Ett riktigt schemalagt byte kräver subscription schedules eller att portalen tillåter prisbyte.
- Kom igång-brickan heter "Fråga jobbcoachen" med litet j (befintlig sträng, inte ändrad här).
- Registreringen på Pixel 7 stannade på formuläret vid första försöket även den här gången (inget konto skapades); andra försöket gick igenom.

### Städning

Stripe testläge: 2 testkunder raderade (Träningspaketet, Dagspasset), 1 prenumeration avslutad (verifierat `canceled`), inga öppna checkout-sessioner. Supabase (produktion), räknat före och raderat per id med `id in (…)`, kontona 60d19467-f514-4d27-863b-2fdd4dc881bc (traning) och 65f3fcf5-ed03-4a9b-b7f3-febba6e3def6 (dagspass):

| Tabell | Före | Raderade | Kvar |
|---|---|---|---|
| user_activities | 46 | 46 | 0 |
| email_schedule | 6 | 6 | 0 |
| email_confirmations | 2 | 2 | 0 |
| monthly_guest_allowances | 2 | 2 | 0 |
| premium_grants | 1 | 1 | 0 |
| profiles | 2 | 2 | 0 |
| auth.users (auth admin, sist) | 2 | 2 | 0 |

Kontrollfrågan över alla tabeller med `user_id` gav noll rader. Byggkatalogen `.next-byte` borttagen, tsconfig-raderna återställda.
