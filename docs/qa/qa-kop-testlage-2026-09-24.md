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
