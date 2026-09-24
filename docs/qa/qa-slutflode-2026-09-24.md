# QA: slutligt flödestest före push, 2026-09-24

Allt som byggts i dag, genomgånget som nya användare: registreringstratten, Kom igång per val, menyn, profilsidan och paketköpen. Underlag: `docs/qa/qa-registrering-2026-09-24.md`, spec `docs/design/profil-registrering-spec-2026-09-24.md` (QA-stegen), `docs/qa/qa-kop-testlage-2026-09-24.md` och `docs/qa/qa-rod-trad-prov-2026-09-24.md`.

## Körning

- Lokalt produktionsbygge i Stripes **testläge**: `.env.test.local` inläst i processen för både `next build` och `next start` (NEXT_PUBLIC bakas in), `NEXT_DIST_DIR=.next-slut`, `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`, port 3471, `NEXT_PUBLIC_SITE_URL=http://localhost:3471`, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` tom (ingen mätning), `RESEND_API_KEY` ogiltig (inga riktiga mejl; kvittots ämne syns i `email_schedule.last_error`). Tre byggen: ett före körningen och två efter rättelserna nedan.
- Webhook: `scripts/stripe-testlage-webhook.mjs` mot `/api/stripe/webhooks` med signatur. 87 event postade, alla 200.
- Riktig Chrome (puppeteer-core, vanlig user agent), Pixel 7 (412 × 915, touch) och desktop 1280 × 800, ny inkognitokontext per genomgång.
- Skript: `scripts/qa-slutflode.mjs` (hjälpare), `scripts/qa-slutflode-vagar.mjs` (vägarna), `scripts/qa-slutflode-kor.mjs` (körning, `SCRATCH=<tmp> node scripts/qa-slutflode-kor.mjs <väg> [vy]`), `scripts/qa-slutflode-callback-mal.ts` (Google-callbackens mål), `scripts/qa-slutflode-stada.mjs` (städningen).
- Skärmdumpar: `docs/qa/slutflode/v<väg>-<steg>.png`. Alla kontroller med data: `docs/qa/slutflode/resultat.jsonl`.
- Riktiga Gemini-anrop: tre intervjubedömningar och två brevutkast.

## Väg × steg × utfall

| Väg | Steg | Utfall | Dump |
|---|---|---|---|
| 1 CV, Pixel 7 | Headerns Skapa konto, steg 1, välj Skriva CV | OK | `v1-01` |
| 1 | Steg 2 med "Du börjar med att skriva CV", konto med lösenord | OK | `v1-02` |
| 1 | Steg 3 visar CV-paketet, "Köp CV-paketet, 79 kr i veckan" och "Börja gratis" lika stora | OK | `v1-03` |
| 1 | Börja gratis landar i CV-byggaren (`/dashboard/skapa-cv?steg=1`) | OK | `v1-04` |
| 1 | Kom igång-arket med CV-listan | OK, kontrollerat på Google-kontot med samma val (väg 7): Analysera ditt CV, Välj en CV-mall, Skriv ett personligt brev, Se tre matchade jobb, Matrislogik, Intervjuprovet, "Det du valde" och "Gratis i de andra delarna", ingen uppladdningsbricka. Skriptets första försök på konto 1 klickade fel element | `v7-7-cv-komigang` |
| 1 | Hemskärmen | OK "Börja med ditt CV, Anna", Kom igång 0 av 6 | `v1-06` |
| 1 | Låst mall (Aurora) på CV-mallar, betalväggen "Mallen ingår i CV-paketet, 79 kr i veckan", knappen "Köp CV-paketet, 79 kr i veckan" | OK | `v1-07`, `v1-08` |
| 1 | Köp-knappen till köpsteget | OK men två extra steg: kontot har ett sparat spår, så knappen öppnar produktvalet (ett andra ark med de tre paketen), sedan spårvalet med "Fortsätt med CV-paketet", sedan köpsteget. Se iakttagelse 1 | `v1-09`, `v1-09b`, `v1-10-kopsteg` |
| 1 | Stripe-kassa med 4242 | OK "Abonnera på CV-paketet, 79,00 kr per vecka" | `v1-10-stripe-kassa` |
| 1 | Webhook, profilen | OK scope cv, active, `paket_started_at` satt | |
| 1 | Returskärmen | OK "Du har CV-paketet. Allt är öppet nu." | `v1-11` |
| 1 | Sidomenyn | OK "Du har CV-paketet / Förnyas 1 oktober, 79 kr" | `v1-12` |
| 1 | Kvittomejl | OK `receipt_evt_…`, ämne "Kvitto: CV-paketet, 79 kr" | |
| 2 Tester, desktop | Testsidans "Starta gratis test" går till `/register?borja=tester` | OK | |
| 2 | Steg 1 hoppas över, steg 2 "Du börjar med rekryteringstesterna" | OK | `v2-01` |
| 2 | Steg 3 Träningspaketet, "Köp Träningspaketet, 79 kr i veckan" | OK | `v2-02` |
| 2 | Köpsteget (`?paket=test_week&steg=kop`), samtycke, kassa 79 kr/vecka, webhook scope tester | OK | `v2-04-*`, `v2-05` |
| 2 | Testhubben öppen | OK "Du har Träningspaketet", ingen betalvägg | `v2-06` |
| 2 | Inför intervjun utan kvot | OK "Utan tak i Träningspaketet", ingen kvotrad | `v2-07` |
| 2 | Kom igång med brickan Intervjuprovet | OK "Kom igång med Träningspaketet, 0 av 9", "Intervjuprovet, utan tak" | `v2-09` |
| 2 | Hemskärmen med träningsfokus, menyn | OK | `v2-08`, `v2-10` |
| 3 Intervju, Pixel 7 | Header, välj Förbereda intervjun, konto, steg 3 (Träningspaketet), Börja gratis | OK landar på `/dashboard/intervju` | `v3-01` till `v3-04` |
| 3 | Kom igång intervju-listan | OK i ordning: Intervjuprovet, Personlighetstestet, Matrislogik, Analysera ditt CV, Skriv ett personligt brev, Se tre matchade jobb | `v3-05` |
| 3 | Hemskärmen med träningsfokus för gratis | OK "Du valde intervjun, så vi börjar med träningen.", Nästa handling "Öva på Berätta om dig själv", "Vill du börja med CV:t i stället?" | `v3-06` |
| 3 | Första intervjuprovet | OK 200, landar på `/dashboard/intervju/{token}` med bedömningen | `v3-07`, `v3-08` |
| 3 | Andra provet samma dygn | OK 429 och kvotraden med länken "Se Träningspaketet, 79 kr i veckan" (kommatecken tillagt i raden, R3) | `v3-10` |
| 3 | Köp från kvotraden | OK spårvalet med Träningspaketet förvalt, köpsteget, kassa, webhook scope tester | `v3-11`, `v3-12-*` |
| 3 | Kvotraden borta | OK hubben "Utan tak", nytt prov öppet utan kvotrad | `v3-13`, `v3-14` |
| 4 Jobb, desktop | Header, välj Hitta jobb att söka, konto | OK | `v4-01`, `v4-02` |
| 4 | Steg 3 Hela paketet: ink-kort, "Eller Dagspasset 49 kr, månad 149 kr, kvartal 299 kr" i prisraden, "Köp Hela paketet, 99 kr i veckan" | OK | `v4-03` |
| 4 | Köp, kassa 99 kr/vecka, webhook scope allt | OK | `v4-04-*`, `v4-05` |
| 4 | Allt öppet: CV-mallar, analys, tester, intervju, Jobbcoachen, matchning | OK, inga köp- eller låsrader. Skriptet flaggade testhubbens beskrivning "Alla nivåer ingår i Träningspaketet och Hela paketet", som inte är en spärr | `v4-06-*` |
| 4 | Sidomenyn "Du har Hela paketet" | OK "Förnyas 1 oktober, 99 kr" | `v4-07` |
| 4 | Uppsägning: vår enkät, erbjudandet "Kör analysen först", Avsluta ändå, kundportalen, Säg upp | OK | `v4-08` till `v4-12` |
| 4 | "Gäller till ..., förnyas inte" | OK menyn "Gäller till 1 oktober, förnyas inte", sidan "Hela paketet, uppsagt. Gäller till 1 oktober, förnyas inte" | `v4-13` |
| 4 | Ångra via kundportalen | OK flaggan false, "Förnyas 1 oktober, 99 kr". Konsolfel "Failed to fetch RSC payload for /api/stripe/create-portal-session" (rättat, R4, och omkört: Kvitton öppnar portalen utan fel) | `v4-14`, `v4-15`, `v4-16` |
| 5 Hoppa över, Pixel 7 | Header, Hoppa över, steg 2 utan valrad, konto | OK | `v5-01`, `v5-02` |
| 5 | Spårvalet utan förval | OK inget kort valt, "Fortsätt med CV-paketet" och "Börja gratis i stället" | `v5-03` |
| 5 | Börja gratis till hemskärmen i allmänt läge | OK, men via en fråga till: "Börja gratis i stället" ger gratisfrågan "Vad vill du börja med?" med "Jag vet inte än", sedan "Till hemskärmen". Hemskärmen "Börja med ditt CV, Eva", ingen "Du valde"-rad, intent och spår null. Se iakttagelse 2 | `v5-03b`, `v5-04` |
| 5 | Prissidan utloggad, Dagspasset | OK. Knappen heter "Börja med Dagspasset, 49 kr, ett dygn" (längden Dag i Hela paketets kort); någon knapp "Köp Dagspasset" finns inte på prissidan | `v5-05` |
| 5 | `/register?paket=all_day`, ingen tratt, konto, köpsteget direkt | OK | `v5-06`, `v5-07-kopsteg` |
| 5 | Kassan och köpet | OK "Dagspasset 49,00 kr", samtycket "engångsköp på 49 kr, inget dras igen", grant 1 dag scope allt | `v5-07-stripe-kassa` |
| 5 | Returskärm, meny, Kom igång | OK "Du har Dagspasset. Hela jobbsöket är öppet i ett dygn.", menyn "Du har Dagspasset / Gäller till 13:51", "Kom igång med Dagspasset, 0 av 12" | `v5-08` till `v5-10` |
| 5 | Kvittot | OK "Kvitto: Dagspasset, 49 kr" | |
| 5 | Utgång: `premium_until` och grantet en timme bakåt per id, cron-frågan kontrollerad (träffade bara QA-kontot), `/api/cron/expire-premiums` lokalt | OK 200, expired 1, tier free, menyn "Du är på gratisnivån / Tre paket, från 49 kr" | `v5-11` |
| 6 Smakprov | Intervjuprovet anonymt i `/artiklar/styrkor-svagheter-intervju`, spärr, Skapa konto | OK ingen tratt, ett steg ("Skapa konto och läs hela återkopplingen"), landar på `/dashboard/intervju/{token}` med hela återkopplingen | `v6-intervju-*` |
| 6 | Personlighetsprovet på `/verktyg/personlighetstest` | OK landar på `/dashboard/intervju/profil/{token}`, "Din profil, hela tolkningen" | `v6-personlighet-*` |
| 6 | Logiktestprovet på `/verktyg/rekryteringstester/prova` | Kontot skapas och landar på `/dashboard/tester`, men **resultatet syns inte** där. Se bugg K1 | `v6-logik-*` |
| 6 | Brevutkast från `/skapa-brev/start` (riktigt Gemini-anrop) | **FEL vid första körningen: landningen gav 404.** Rättat (R1), omkört: landar på `/dashboard/mina-brev/{id}` med hela brevet | `v6-brev-*` |
| 7 Google, simulerad | Ingång 1 (header, CV), Pixel 7: den riktiga Google-knappen skriver `jc_signup` {intent cv, entry header} före hoppet (anropet till Supabase authorize stoppat), callbackens mål `/dashboard/valkommen`, konto som callbacken skapar det, post-signup 200, valkommen läser cookien: steg 3 med CV-paketet, Börja gratis till CV-byggaren, intent och spår cv, cookien rensad efteråt | OK | `v7-7-cv-*` |
| 7 | Ingång 6 (intervjuprovets spärr), desktop: cookien {entry smakprov, smakprov intervju + token}, mål `/dashboard/valkommen`, hämtkedjan landar på `/dashboard/intervju/{token}`, provet `claimed_by` kontot | OK | `v7-7-intervju-landning` |
| 7 | Riktig Google | **Ej testat.** Måste klicktestas efter deploy med ett riktigt Google-konto | |
| 8 Profil, konto 1, Pixel 7 och desktop | Profil och Prenumeration som två rader under Konto | OK båda vyerna | `v8-*-01-meny` |
| 8 | Hoppa till (cv, personliga-brev, jobbsok, konto), statusraden "Ort saknas i ditt CV", ort ifylld, raden borta | OK båda | `v8-*-02-profil` |
| 8 | Foto 3,96 MB (3000 × 2250 JPEG) | OK förminskat till 81 kB i lagringen, syns i ramen; desktop också i CV-huvudets förhandsvisning | `v8-*-03-foto` |
| 8 | Ta bort, ladda upp igen | OK båda | `v8-*-04` |
| 8 | Förvald ton Kreativ, brevhuvudets två växlar bara i Personliga brev | OK båda | `v8-*-05` |
| 8 | Konto-raderna: Mejl från oss och Radera mitt konto öppnar ark (radering aldrig bekräftad) | OK båda | `v8-*-06-*` |
| 8 | Skriv nytt brev: tonen Kreativ förvald, länken "Ändra förvald ton" till `/dashboard/profil#personliga-brev` | OK båda | `v8-*-07-tonsteget` |
| 8 | Länken landar på #personliga-brev | Pixel 7 OK (rubriken 215 px). **Desktop FEL: sidan stod kvar överst (rubriken på 1 351 px).** Rättat (R2), omkört: 219 px | `v8-desktop-08` (före rättelsen) |
| 8 | Prenumerationssidan: rätt paket, knappar utan klippt text på desktop | OK "Du har CV-paketet / Förnyas 1 oktober, 79 kr", inga klippta knappar | `v8-*-09` |
| 8 | Tonsteget för ett gratiskonto efter rättelsen: "Ingår när du har ett paket", "Automatiskt tonval ingår i alla tre paketen. Se CV-paketet, 79 kr i veckan", inget "Premium" | OK | `v8-desktop-10` |
| 9 Fel | Nekat kort 4000 0000 0000 0002 | OK "Ditt kreditkort nekades…", kvar i kassan, tier free, inget scope, prenumerationen incomplete | `v9-kort-nekat` |
| 9 | Befintlig e-post i steg 2 | OK "Det finns redan ett konto med den adressen" med Logga in till `/login?borja=cv` | `v9-finns-redan` |
| 9 | För kort lösenord | OK "Lösenordet måste vara minst 8 tecken.", inget konto skapat | `v9-kort-losenord` |
| 9 | Byte CV-paketet till Träningspaketet och tillbaka från prenumerationssidan | OK 200 sidbyte båda vägarna, "Du har nu Träningspaketet" och "Du har nu CV-paketet", scope följer | `v9-byte-*` |
| 9 | Nedgradering från Hela paketet | OK "Nedgradering sker vid nästa förnyelse. Säg upp Hela paketet i kundportalen…", scope kvar allt | `v9-nedgradering-besked` |
| 10 | Menyn för konto 1, 2 och 4 (desktop och Pixel 7) | OK samma rader i samma ordning. Det enda som skiljer: paketraden överst, antalet vid Mina CV (konto 1 har ett CV) och uppsäljraden längst ned ("Vill du ha testerna också?" respektive "CV-delen", ingen för Hela paketet) | `v10-*` |
| 10 | Talstreck i renderad text och i HTML-svaren, 12 publika sidor och 14 inloggade sidor för två konton plus Kom igång-arket | **FEL vid första körningen:** "ATS-säker [talstreck] inga clip-paths…" på `/dashboard/cv-mallar`. Rättat (R5), omkört: 0 träffar i text och i HTML | |

## Buggar

### Rättade här

- **R1, hög. Brevutkastet landade på en 404.** `/api/public/letter-draft/claim` svarade `redirect: /dashboard/skapa-brev/{id}`, en sida som inte finns; brevet sparas under `/dashboard/mina-brev/{id}`. Alla som skapat konto från ett anonymt brevutkast har landat på Nexts engelska 404 sedan rutten skrevs (0af5c92a), brevet låg ändå i Mina brev. Nu `/dashboard/mina-brev/{id}` på båda ställena i rutten. Verifierat i Chrome efter nytt bygge.
- **R2, medel. "Ändra förvald ton" landade överst på desktop.** Klientnavigeringen från brevflödet till `/dashboard/profil#personliga-brev` scrollade innan sektionen fanns. `ProfilClient.tsx` scrollar nu till ankaret en gång vid mount, bara om rubriken inte redan syns. Direktladdning och Hoppa till är opåverkade. Verifierat: rubriken på 219 px efter 1,5 s.
- **R3, låg (copy).** Kvotraden i intervjuprovet: "…och med Träningspaketet, 79 kr i veckan övar du utan gräns" fick kommat efter priset (`intervjuprov-copy.ts`).
- **R4, låg.** Prenumerationssidans rader Byt kort, Kvitton och Ångra uppsägningen var `next/link` mot API-rutten `/api/stripe/create-portal-session`. Klienten hämtade RSC från rutten, loggade felet och skapade en extra portalsession innan den föll tillbaka på vanlig navigering. Nu vanliga `<a>`. Verifierat: Kvitton öppnar portalen utan konsolfel.
- **R5, låg (copy).** 32 talstreck i mallarnas beskrivningar och styrkor (`src/lib/cv/simple-templates.ts`), som syns i mallvalet. Ersatta med kommatecken; två rader om ornament skrevs om. Talstrecken inne i mallarnas CV-utskrift (generatorerna, datumintervall och språknivå) är typografi i själva CV:t och är orörda.
- **R6, låg (copy).** Registreringens smakprovsläge sa "Svaret och bedömningen sparas på kontot" också för brevutkastet och CV-starten. De har nu egna rader: "Brevet sparas på kontot. Du landar på det direkt." och "Det du skrivit sparas på kontot. Du fortsätter där du slutade." (`registrering-copy.ts`, `RegisterKontoSteg.tsx`).
- **Uppdraget: brevflödets tonsteg.** "Ingår i Premium" blev "Ingår när du har ett paket" (samma sträng som profilen), och "Automatiskt tonval ingår i Premium. Se vad Premium kostar" blev "Automatiskt tonval ingår i alla tre paketen. Se CV-paketet, 79 kr i veckan" via `paketMedPris('cv_week')` (`TonalityLanguageStep.tsx`).

`npx tsc --noEmit` rent, vitest 76 filer och 925 test gröna, produktionsbygget gick igenom efter rättelserna.

### Kvarstående

- **K1, medel. Logiktestprovet lovar svaren men visar dem inte.** Rättat samma dag, se "Sista punkterna" nedan. Registreringen säger "Skapa konto och se alla svar med förklaring". Efter kontot kör valkommen-sidan `/api/public/test-session/claim`, som bara loggar aktiviteten `test_completed` och svarar `redirect: /dashboard/tester`. Hubben visar "Börja här, Logiktestet på grundnivå, Starta första testet"; provets svar och förklaringar syns ingenstans. Reproduktion: `/verktyg/rekryteringstester/prova`, svara på fem frågor, Skapa konto, konto med lösenord, landar på `/dashboard/tester` (`v6-logik-landning.png`). Åtgärd: en resultatsida för det hämtade provet (svaren ur `anon_test_sessions` och `questionsForToken`), eller ändra löftet i `SMAKPROV.test` och spärren.
- **K2, låg (copy, större än en småsak).** Rättat samma dag, se "Sista punkterna" nedan. "Premium" står kvar i ett tjugotal användarsträngar, bland annat i CV-byggarens steg 7 som väg 1 landar i ("Mallen kräver Premium", "Se Premium", mallbrickan "Premium", spärrorsaken "Mallen kräver Premium. Välj en annan mall eller spara utan PDF."), brevflödets mallsteg ("Den här mallen ingår i Premium."), `PurchaseConfirmation.tsx` ("Tack. Premium är aktiverat."), `CVSelectionStep.tsx`, `CvCard.tsx`, LinkedIn-optimeraren och prenumerationssidans "Premium aktivt". Grep: `grep -rn "Premium" src/app/dashboard src/components --include=*.tsx`. Inte ändrat här.
- **K3, låg.** React-fel #418 (hydrering) loggades en gång på brevutkastets landning före R1, alltså på 404-sidan. Efter rättelsen inget fel.

## Iakttagelser

1. **Betalväggens köpknapp tar tre steg till kassan när spåret är sparat.** Rättat, se "Sista punkterna". "Köp CV-paketet, 79 kr i veckan" på en låst mall öppnar produktvalet ("Välj paketet som passar", alla tre paketen), sedan spårvalet, sedan köpsteget. Kommentaren i `PaywallCard.tsx` säger att det är avsiktligt, men knappen har redan namngett paketet. Förslag: gå direkt till `?paket=cv_week&steg=kop`.
2. **Hoppa över frågar samma sak igen.** Rättat, se "Sista punkterna". Den som hoppar över steg 1 möter spårvalet och sedan gratisfrågan "Vad vill du börja med?", det vill säga tre val innan hemskärmen.
3. Returskärmen efter kassan visar "Du är på gratisnivån" i menyn tills webhooken landat (känt sedan köptestet).
4. På steg 3 för jobbvalet visar sidomenyns Kom igång "0 av 5" (listan utan val) och efter Börja gratis "0 av 6".
5. Alla tolv registreringar med lösenord (Pixel 7 och desktop) gick igenom vid första försöket; felet från köptestet, där formuläret stod kvar utan anrop, kom inte tillbaka.

## Städning

Allt skapat sparades med id när det skapades (`$SCRATCH/qa-slut-konton.json`) och raderades per id med `scripts/qa-slutflode-stada.mjs --kor` (loggen `docs/qa/slutflode/stadning-kord.json`, torrkörningen `stadning-torrkorning.json`). Webbservern och webhook-relät stoppades först, så att Stripes raderingsevent inte skrev tillbaka något.

**Stripe testläge:** 6 testkunder raderade (konto 1, 2, 3, 4, Dagspasset och kortfelet), 4 aktiva prenumerationer avslutade (verifierat `canceled`), kortfelets prenumeration `incomplete_expired` efter att dess öppna kassa gått ut. Första körningen raderade fem kunder och stannade på kortfelskunden (en prenumeration med öppen kassa går inte att avsluta); den gjordes klart för hand i rätt ordning och skriptet kassar nu ut först. Produkter, priser och portalkonfiguration ligger kvar.

**Supabase (produktion), 14 konton**, räknat före och raderat med `user_id in (…)`:

| Tabell | Före | Raderade | Kvar |
|---|---|---|---|
| user_activities | 342 | 342 | 0 |
| email_schedule | 33 | 33 | 0 |
| email_confirmations | 12 | 12 | 0 |
| monthly_guest_allowances | 5 | 5 | 0 |
| cv_texts | 2 | 2 | 0 |
| letters | 2 | 2 | 0 |
| ai_usage_costs | 1 | 1 | 0 |
| cancel_intents | 1 | 1 | 0 |
| premium_grants | 1 | 1 | 0 |
| anon_interview_samples (user_id, inloggat prov) | 1 | 1 | 0 |
| profiles (id) | 14 | 14 | 0 |
| auth.users (auth admin, sist) | 14 | 14 | 0 |

Per token: `anon_interview_samples` 2, `anon_personality_samples` 1, `anon_test_sessions` 1, `public_letter_drafts` 2, alla raderade.

`public_rate_limits` för localhost-nyckeln (ip_hash d6e118b9…, fönster 2026-09-24): före testet fanns bara `anon_test` med 2. Efter testet fanns `anon_interview` 1, `anon_personality` 1, `anon_test` 3 och `letter_draft` 2. De tre nya raderna raderade och `anon_test` satt tillbaka till 2. Mitt i väg 7 raderades också vår egen `anon_interview`-rad från väg 6 (count 1), eftersom anonyma intervjuprov har ett per IP och dygn.

**Lagringen:** 4 sökvägar under `profile-photos/users/<konto 1>/` begärda, 1 fil låg kvar och raderades (de andra var redan borttagna med Ta bort i testet). 0 foton kvar.

**Kontroll efteråt:** 0 profiler och 0 auth-användare för id:na, 0 `qa-slut-`-användare i auth, 0 rader i någon tabell med `user_id`, 0 foton.

QA-kontonas id: 1 f9d541a0-a9ee-471e-9971-158983f932bb, 2 c9df485a-e63f-4290-a784-c16254d71575, 3 63c36aa8-49af-406d-8ea1-99e05173f6f2, 4 579c6581-79a2-4a1b-8bb8-1579c1ecef90, 5 3f35e8ab-7e52-4fdb-9c64-de6ed52ad89e, 5-dag 546d8991-9868-4921-99a0-43c9f0ba7797, 6-intervju 16a8171f-ef02-457f-891c-85d4556f05a6, 6-personlighet 35ab95a9-4ab6-44b3-b994-44644ed3b609, 6-logik 5ad9023f-37cb-4b89-8da6-64eef9703cb2, 6-brev 51136fc2-ed8b-4a06-9a39-a1a41f7080d4, 6-brev2 f0311f81-e87e-4e92-8d94-de2df53c77d1, 7-cv 06a9f961-086a-4334-a17f-a5c2f09f04d3, 7-intervju d8c9cad0-61ac-4aeb-85e1-6e7522a193c7, 9-kort 43e73491-1062-48a2-ab42-2861f8f534b8.

Byggkatalogen `.next-slut` borttagen, tsconfig-raderna som bygget lade till återställda. `.env.test.local` ligger kvar lokalt och är gitignorerad.

## Sista punkterna: K1, K2 och iakttagelse 1 och 2 (eftermiddag)

Samma miljö som ovan: `.env.test.local` i processen för `next build` och `next start`, `NEXT_DIST_DIR=.next-sist`, `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`, port 3481, PostHog av, ogiltig Resend-nyckel, relät `scripts/stripe-testlage-webhook.mjs`. Riktig Chrome på Pixel 7. Skript: `scripts/qa-slutflode-sist.mjs <logik|hoppa|mall|kop>` på hjälparna i `scripts/qa-slutflode.mjs`. Skärmdumpar `docs/qa/slutflode/sist-*.png`, kontrollerna i `sist-resultat.jsonl`. Två byggen (det andra efter rättelsen av statusraden i steg 7).

### Vad som byggts

- **K1, logiktestprovets landning.** Ny sida `/dashboard/tester/prov/[token]`: resultatet (antal rätt av fem), genomgången fråga för fråga med Rätt, Fel eller Hoppad, ditt svar, rätt svar och regeln som förklaring, alla öppna från start. Genomgången är testernas egen `MatrixQuestionReview` (nya props `fragor`, `utanTid`, `allaOppna`), så förklaringstexterna är desamma som i dashboardens logiktest. Vägen vidare: "Gör grundnivån" och, bara för gratiskonton, "Se Träningspaketet, 79 kr i veckan" till köpsteget. Claim-rutten gör anspråk och svarar `redirect: /dashboard/tester/prov/{token}`; aktiviteten loggas bara vid första hämtningen. `anon_test_sessions` fick `claimed_by` (on delete cascade), `claimed_at` och nullbar `expires_at` (migrering `20260924200000_testprov_claim.sql`, körd i produktion): en hämtad rad är permanent som intervju- och personlighetsprovens. Ett hämtat prov går inte att rätta om. Annan användares token, utgånget eller okänt ger 404 med rätt status (proxyn skriver om till `/dashboard/tester/prov/saknas` i dashboardens skal). Logik i `src/lib/tests/prov-rad.ts`, strängar i `src/app/dashboard/tester/prov/prov-copy.ts`.
- **Iakttagelse 1, köpet i ett steg.** `kopstegHref(plan)` i `src/lib/onboarding/steps.ts`. Betalväggens knapp (`PaywallCard`) går direkt till `?paket=<key>&steg=kop` också med sparat spår; produktvalet öppnas bara när knappen saknar paket. Samma sak för produktvalets kort (`UpgradeSheet`), prissidan inloggad, `/kassa`, prenumerationssidans köp, CV-analysens "Köp CV-paketet", `TRANINGSPAKET_HREF` (intervjuprovets kvotrad och hubben) och steg 3 i registreringen. `/dashboard/valj-spar` öppnar köpsteget när ett paket står i adressen; spårvalet visas bara utan paket.
- **Iakttagelse 2, frågan högst en gång.** Valkommen skickar den som hoppade över steg 1 till `/dashboard/valj-spar?hoppat=1`, och där går "Börja gratis i stället" utan valt kort direkt till hemskärmen (spåret sparas som null).
- **K2, Premium.** Användarsträngarna i dashboarden, API-svaren, komponenterna, de publika sidorna, villkoren och integritetspolicyn, mallbeskrivningarna och 69 rubriker "Premium-mallen X" i yrkesmallarna. Ersättningarna ligger i `PAKETRADER` i `src/components/paywall/paywall-copy.ts`: knappar "Köp CV-paketet, 79 kr i veckan" (via `paketMedPris`), etiketter "Ingår när du har ett paket", små brickor på mallar och typsnitt "CV-paketet" (via `paketNamn`). CV-byggarens steg 7: brickan "CV-paketet", statusraden "Ingår när du har ett paket" med "Köp CV-paketet, 79 kr i veckan" till köpsteget, spärrorsaken "Mallen ingår i CV-paketet, 79 kr i veckan. Välj en annan mall eller spara utan PDF.". PurchaseConfirmation: "Tack. Du har CV-paketet." (och "är aktivt" i stället för "är aktiv"). Testet i `src/lib/plans/__tests__/paketnamn.test.ts` faller nu på ordet Premium i kod utanför kommentarer; identifierare (`isPremium`, `PremiumGate`), gemena värden (`'premium'`, `premium_*`) och markerade testfiler släpps igenom, och i yrkesmallarnas branschtexter (Premium-restauranger, Premium-CAD) fångas bara produktnamnet.

### Väg × steg × utfall

| Del | Steg | Utfall | Dump |
|---|---|---|---|
| K1 | `/verktyg/rekryteringstester/prova` anonymt, fem svar, spärren "Skapa konto och se svaren" | OK | `sist-logik-1-sparr` |
| K1 | Registreringen lovar "Skapa konto och se alla svar med förklaring", konto med lösenord | OK | `sist-logik-2-register` |
| K1 | Landar på `/dashboard/tester/prov/{token}` | OK "1 rätt av 5", Rätt, Fel, Fel, Fel, Fel, fem regler öppna, "Gör grundnivån" och "Se Träningspaketet, 79 kr i veckan" (till `?paket=test_week&steg=kop`), inga talstreck, inget Premium, inga konsolfel | `sist-logik-3-resultat` |
| K1 | Omladdning | OK samma resultat | |
| K1 | Ett annat konto öppnar samma token | OK status 404, "Det här provet finns inte" i dashboardens skal | `sist-logik-4-annans-prov-404` |
| 2 | Konto med valet CV, Börja gratis (spåret cv sparat), låst mall Aurora, betalväggen | OK "Köp CV-paketet, 79 kr i veckan" | `sist-kop-1-betalvagg` |
| 2 | Köp-knappen | OK, **ett steg**: direkt till `/dashboard/valj-spar?paket=cv_week&steg=kop`, "Steg 2 av 2", inget produktval och inget spårval | `sist-kop-2-kopsteg-direkt` |
| 2 | Samtycke, kassa med 4242, webhook | OK "Abonnera på CV-paketet, 79,00 kr per vecka", profilen scope cv och active, returskärmen "Du har CV-paketet. Allt är öppet nu." | `sist-kop-3-*`, `sist-kop-4-retur` |
| 3 | Header, Hoppa över, konto | OK landar på `/dashboard/valj-spar?hoppat=1` | `sist-hoppa-1-steg2`, `sist-hoppa-2-sparval` |
| 3 | Börja gratis i stället | OK, **direkt till hemskärmen**, ingen "Vad vill du börja med?" | `sist-hoppa-3-hem` |
| K2 | CV-byggarens steg 7 med låst mall (`?steg=7&mall=disk-plus`), gratiskonto | Första bygget: brickorna "CV-paketet" och knappen rätt, men statusraden visade den långa meningen avkortad ("Den här mallen ..."). Rättat: raden säger "Ingår när du har ett paket" och bryter rad, meningen ligger i aria-label. Omkört: OK, inget Premium, Köp-länken till `?paket=cv_week&steg=kop` | `sist-mall-1-steg7-last`, `sist-mall-2-steg7-helsida` |

`npx tsc --noEmit` rent (utom `.next/dev/types`), vitest 79 filer gröna med de nya testerna: `src/lib/tests/__tests__/prov-rad.test.ts` (claim-landningen, null och därmed 404 för annans token, genomgången), `src/components/paywall/__tests__/kopvag.test.tsx` (köpvägen i ett steg, också med sparat spår), `src/app/dashboard/valj-spar/__tests__/hoppat.test.tsx` (frågan högst en gång, köpsteget vid paket i adressen) och Premium-grepet i `paketnamn.test.ts`.

### Kvar efter den här omgången

- Gemena "premium-varianten", "premium-mall" och "premium-kontor" står kvar i omkring 97 rader i de publika yrkesmallarnas brödtext (`yrkesmall-content.ts`). Uppdraget gällde "Premium"; de gemena är SEO-text och behöver en egen copyrunda.
- Logiktestprovet utan konto visar redan frågans regel under varje fråga medan man svarar (`ProvaFlow.tsx`). Regeln är samma text som förklaringen på resultatsidan, så det kontot låser upp är i praktiken rätt svar och vilka som var fel. Förslag: dölj regeln i provet, som dashboardens ledtrådsläge gör.

### Städning (sista punkterna)

Webbservern och relät stoppades först. `scripts/qa-slutflode-stada.mjs` per id med `STADLOGG=sist-stadning` (loggarna `docs/qa/slutflode/sist-stadning-torrkorning.json` och `sist-stadning-kord.json`; skriptet fick prefixet så att förmiddagens loggar ligger kvar).

**Stripe testläge:** 1 testkund (köpkontot), prenumerationen avslutad (verifierat `canceled`), kunden raderad. Ingen öppen kassa fanns.

**Supabase (produktion), 3 konton**, räknat före och raderat med `user_id in (…)`: user_activities 29, email_schedule 7, email_confirmations 3, monthly_guest_allowances 1, profiles (id) 3, auth.users 3. Per token: `anon_test_sessions` 1. `public_rate_limits` för localhost-nyckeln: `anon_test` 3 före, tillbaka till 2. Kontroll efteråt: 0 profiler och 0 auth-användare för id:na, 0 `qa-slut-`-användare i auth, 0 rader med `user_id`, 0 foton.

QA-kontonas id: sist-logik cb315402-e0be-4a2b-8c06-9e1b45514db0, sist-hoppa 75a132bc-1e4c-42b2-bbd2-a89ff5b51410, sist-kop 5b954c03-35e5-4a45-bbef-1ca6918e0c33.

Byggkatalogen `.next-sist` borttagen, tsconfig-raderna som bygget lade till återställda.
