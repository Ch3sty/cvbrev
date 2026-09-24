# QA: röd tråd för proven, 2026-09-24

Spec: `docs/design/rod-trad-prov-spec-2026-09-24.md`. Design: `docs/design/rod-trad-prov-2026-09-24.html`.
Produktionsbygge (`NEXT_DIST_DIR=.next-prov`, `next start -p 8300`), headless Chrome med Pixel 7
(412 × 915, DPR 2) och desktop 1280 × 800, ny inkognitokontext per genomgång. Webbläsaridentiteten
överstyrd (userAgentData) så att PostHog inte sorterar bort sessionen som bot.
Skärmdumpar: `docs/qa/rod-trad-prov/`.

## 1. Kedjan, steg för steg

| Steg | Förväntat | Faktiskt | Dump |
|---|---|---|---|
| 1 | Provet i artikeln efter "Så tolkas svaren" | OK, rubrik p, inbjudan med påstående 1 | `pixel7-01-inbjudan.png` |
| 2 | Påstående 2, framstegslinje, ingress borta | OK | `pixel7-02-pastaende-2.png` |
| 3 | Omladdning vid påstående 11 fortsätter på 11 med samma ordning | OK, samma citat efter omladdning. Panelhöjd 348 px på påstående 2, 6 och 11 (inbjudan 482 med rubrik och ingress) | `pixel7-03-omladdning-p11.png` |
| 4 | Föregående påstående visar 10 med valet markerat | OK, "Stämmer inte alls" markerad | `pixel7-04-foregaende-p10.png` |
| 5 | Räkningen, sedan resultat och spärr | OK, svar under en sekund | `pixel7-05a-laddar.png`, `pixel7-05b-resultat-och-sparr.png`, `desktop-05-resultat-och-sparr.png` |
| 6 | Nätverkssvaret utan låsta fält | OK: inga `reverse`, `dimension`, `scores` eller kravprofiler | `natverkssvar-personlighetsprov.json` |
| 7 | Gör om, jämn profil | OK: "en jämn profil utan utslag" | `pixel7-07a-gor-om.png`, `pixel7-07b-jamn-profil.png` |
| 8 | Fjärde provet samma IP: 429, statusraden, skalan dold, kontoknappen | OK: 200, 200, 200, 429 | `pixel7-08-kvot-429.png` |
| 9 | Registrering med lösenord landar på tolkningssidan | OK: `/dashboard/intervju/profil/{token}`, tio omvända påståenden, konsekvens 4 av 5, raden claimad med `expires_at` null | `pixel7-09-tolkningssidan.png` |
| 10 | Annan användares token | OK: 404 | `pixel7-10-annan-anvandare-404.png` |
| 11 | Intervjuprovet inloggat landar på `[token]` med ny eyebrow, knapp och statusrad; "Öppna" till hubben | OK | `pixel7-11-token-sidan.png` |
| 12 | Hubben gratis, dagens prov gjort, smakprovsprofil | OK: lasIgen i bläck ("Nästa prov öppnar i morgon"), raden, kvotraden i läget slut, profilpanelen i smakprovsläget | `pixel7-12-hubben-gratis.png` |
| 13 | Sidomenyn: Inför intervjun med Nyhet och tråden | OK | `pixel7-13-sidomenyn.png` |
| 14 | Nytt prov: steg 1 med förvalt rekommenderat kort, steg 2 ger 429 med länken till Träningspaketet, foten dold | OK | `pixel7-14a-nytt-prov-steg1.png`, `pixel7-14b-nytt-prov-429.png` |
| 15 | Köp Träningspaketet med Stripes testkort | Ej gjort: `.env.local` har live-nycklar. Paketet simulerades på QA-kontot (profiles.premium_scope tester, premium_until +7 d, per id) | |
| 16 | Hubben med Träningspaketet: ingen kvotrad, "Utan tak i Träningspaketet" | OK | `pixel7-16-hubben-traningspaketet.png`, `desktop-16-hubben-traningspaketet.png` |
| 16b | Två nya prov (Berätta om dig själv, Ett misstag) | Ej gjort: körningen nekades av behörighetsspärren i sessionen. Flödet i sig är prövat i steg 14 (steg 1, steg 2, bedömning via API) | |
| 17 | Grundtestet klart, panelen i läget riktig profil | Ej gjort, samma skäl som 16b. Läget är renderat i koden (ProfilPanel) men inte klicktestat | |
| 18 | Hemskärmen: interview-rewrite efter prov på nivå 2 äldre än 24 h, "Senare" ger nästa steg | OK: provets `created_at` flyttat 25 h per token, kontot gavs ett CV och ett brev (per id) för hemskärmens läge C. "Senare" gav personality-full. Aktiviteten visar "Du övade på frågan om styrkor och svagheter, 2 av 5." och "Du gjorde personlighetsprovet." | `pixel7-18a-hem-interview-rewrite.png`, `pixel7-18b-hem-efter-senare.png`, `pixel7-18c-hubben-kvot-kvar.png` |
| 19 | Reduced motion | OK: framstegslinjen och reglaget har `transition-property: none` (duration står kvar men utan effekt), laddningstråden står stilla via globals.css | `pixel7-19a-reduced-motion-byte.png`, `pixel7-19b-reduced-motion-laddar.png` |
| 20 | Tab-runda, fokusring i accent | OK: reglaget en radiogrupp, pil höger flyttar val, fokus `2px solid rgb(217, 72, 15)` offset -6px; Enter går vidare; Skift+Tab från reglaget når "Föregående påstående"; kontoknappen och "Gör om provet"; på hubben Nytt intervjuprov → bläckknappen → Välj en annan fråga → Öppna → profilpanelens länkar, alla med accentring | `desktop-20a` till `desktop-20f` |
| 20b | Kom igång för Träningspaketet visar "Intervjuprovet, utan tak" och kvitterar efter ett prov | OK | `desktop-20e-kom-igang.png` |
| 21 | Skärmläsare | TalkBack/NVDA fanns inte i miljön. Tillgänglighetsträdet för resultatet sparat: `a11y-resultat.json` (segmentraderna "n av 5", platshållarraderna dolda, sr-meningen med) | |
| 22 | PostHog | Inga händelser från localhost i PostHog de senaste tre timmarna (HogQL mot `$current_url like '%localhost:8300%'` gav 0 rader), inte heller från den överstyrda identiteten. Händelserna är kodgranskade, se avsnitt 3 | |
| 23 | SEO-diff och prestanda | Se avsnitt 2 | |

Verktygssidan: `pixel7-verktygssidan.png`, `desktop-verktygssidan.png`.
API: anonymt POST med `question: 'konflikt'` gav 400 `question_not_public` (kontrollerat med curl mot bygget).

## 2. SEO och prestanda

SEO-diff (`scripts/seo-diff-artiklar.ts`, baslinje tagen på ett orört bygge av `fb19785f` i en egen worktree):
`seo-fore.json`, `seo-efter.json`, `seo-diff.md`. På båda artiklarna, prissidan och
rekryteringstester-sidan: h1, h2/h3, title, description och canonical oförändrade, FAQ och HowTo
oförändrade. Skriptet flaggar tre saker, alla väntade: `wordCount` i BlogPosting på artiklarna
(3232 → 3233 och 2056 → 2066, stycket som specen skriver om) och OG-bildens hash på
/verktyg/rekryteringstester (sidans innehåll ändrat). Ny innehållslänk till /verktyg/personlighetstest
på alla fyra sidorna. Intervjuartiklarna oförändrade.

`scripts/perf-publikt.ts`, Pixel 7, 3 körningar:

| Sida | LCP före | LCP efter | CLS före | CLS efter |
|---|---|---|---|---|
| /artiklar/personlighetstest-jobb-guide | 772 | 764 | 0 | 0 |
| /artiklar/map-test-personlighetstest | 748 | 756 | 0 | 0 |
| /verktyg/rekryteringstester | 544 | 568 | 0 | 0 |
| /verktyg/personlighetstest | ny | 528 | ny | 0 |

`scripts/perf-inloggat.ts --filter =intervju` (hubben lagd i routelistan): LCP 916 ms (budget 1 500),
CLS 0,001, 0 klientrundturer. Utskrifterna: `perf-publikt-fore.txt`, `perf-publikt-efter.txt`,
`perf-inloggat-hubben.txt`.

## 3. Fynd och rättningar under QA

1. Kvotraden i intervjuprovet (inloggad, 429): länken "Se Träningspaketet, 79 kr i veckan" i radens
   högerkant klämde texten till en smal spalt på 412 px. Länken står nu under raden, i artikeln och i
   flödet. På hubben står den under raden på mobil och i raden från sm.
2. "Föregående påstående" nåddes inte med Skift+Tab från reglaget (den låg efter reglaget i DOM:en).
   Den står nu före reglaget i DOM:en och ritas under det (flexkolumn med `order-last`).
3. Proxyn hade gett 404 på `/dashboard/intervju/ny` (matchade som token). Undantagen `ny` och
   `profil`, och tolkningssidan har egen 404-kontroll i proxyn.

## 4. Testdata och städning

Allt skapat sparades per id och raderades per id:

- 6 rader i `anon_personality_samples` (token 87aab669…, fd290376…, f6fabe28…, f1970e9a…, 5ee05596…, 958d9983…), räknat före 6, raderat 6.
- 1 rad i `anon_interview_samples` (21f2817c…), räknat 1, raderat 1.
- 1 rad i `cv_texts` (4828552f…) och 1 i `letters` (eb124851…), raderade.
- `public_rate_limits`: nyckeln (ip_hash d6e118b9…, `anon_personality`, fönster 2026-09-24) raderad två gånger, count 3 båda gångerna.
- 56 rader i `user_activities` och 1 i `ai_usage_costs` för de två QA-kontona, raderade per user_id.
- QA-kontona `qa-rodtrad-a-1790209804636@jobbcoach.ai` (40fefe68…) och `qa-rodtrad-b-1790209812081@jobbcoach.ai` (2d257a57…) raderade ur `auth.users`; profilerna följde med (0 kvar).
- Inga personlighetssessioner skapades. Tabellen `admin_undantagna_konton` finns inte i databasen; kontona är `qa-`-adresser och raderade.

## Produktion 2026-09-24

Mot https://www.jobbcoach.ai efter deployen, i riktig Chrome (inte headless) via puppeteer-core,
ny inkognitokontext per genomgång. Pixel 7 (412 × 915, DPR 2, Android-Chromes user agent) och
desktop 1280 × 800. Cookiebannern besvarad i förväg (den styr bara GTM, inte PostHog) så att
dumparna blir rena. Dumpar: `docs/qa/rod-trad-prov/prod-*.png`. Ingen kod ändrad.

| Steg | Förväntat | Faktiskt | Dump |
|---|---|---|---|
| 1 | QA-konto via registreringen, Träningspaketet simulerat | OK: `qa-prov-2026-09-24@jobbcoach.ai` registrerat med lösenord (säkerhetskontrollen passerade), landade på `/dashboard/valj-spar`. Id `2f7a8e5c-7924-4d6a-9429-4850ef4cdca1`. Profilen fick `subscription_tier` premium, `premium_scope` tester, `premium_until` och `current_period_end` +7 d, `subscription_status` active, `premium_source` stripe, `onboarding_track` tester (per id, Management API med jobbcoach-token) | `prod-pixel7-01a-registrering.png`, `prod-pixel7-01b-efter-registrering.png` |
| 16b | Två prov samma dag med Träningspaketet: ingen kvotrad, ingen 429, båda i listan med nivå | OK: "Varför ska vi anställa just dig?" (287 tecken) gav 200 och nivå 4, "Varför söker du det här jobbet?" (297 tecken) gav 200 och nivå 4, riktiga Gemini-bedömningar på cirka tio sekunder. Resultatsidan med eyebrow, svaret, bedömningen, fyra punkter och omskrivet svar. Hubben: "Utan tak i Träningspaketet", ingen kvotrad, båda raderna med "4 av 5", "Starkt · I dag" och Öppna. Nästa handling bytte från Börja här till nyFraga ("Berätta om dig själv") | `prod-pixel7-16b-0-hubben-fore.png`, `prod-pixel7-16b-{1,2}{a,b,c,d}-*.png`, `prod-pixel7-16b-3-hubben-tva-prov.png`, `prod-desktop-16b-hubben-tva-prov.png` |
| 17 | Grundtestet klart, panelen i läget riktig profil med arketyp, tal och tre länkar | OK: 50 påståenden, `complete` gav 200 (O 63, C 63, E 63, A 50, N 50). Panelen: "Strukturerad analytiker", "Grundtestet, 50 påståenden · 24 september", fem faktorer med tal och staplar, länkarna Hela analysen (`/dashboard/tester/personlighet-grund/test/{id}/results`), Din arbetsstil och Fördjupade testet, 120 påståenden. PostHog: `has_profile` gick från none till full | `prod-pixel7-17a` till `17f`, `prod-desktop-17e-hubben-riktig-profil.png` |
| 17, hem | Nästa handling på hemskärmen | Visas inte, enligt design: kontot saknar CV och hemskärmen är i läge A ("Börja med ditt CV, Qa", uppladdningen). Nästa handling finns bara i läge C. Kom igång visar 2 av 9 provade. Se fynd 3 | `prod-pixel7-17g-hem-nasta-handling.png`, `prod-pixel7-17h-hem-hela.png`, `prod-desktop-17g-hem-nasta-handling.png` |
| Anonymt | Personlighetsprovet på verktygssidan till spärren | OK: 20 påståenden, 200 från `/api/public/personlighetsprov`, profil med mening och fem faktorrader, spärren "Skapa konto gratis" med `?personlighet={token}`. Token 28e4c733-1c5c-4abd-b67f-377ba82a7d11 | `prod-pixel7-a1` till `a3b`, `prod-desktop-a3-personlighetsprov.png` |
| Anonymt | Intervjuprovet i artikeln till spärren | OK: styrkor, 303 tecken, 200 och nivå 4, spärren "Se hela återkopplingen och ditt svar omskrivet" med `?intervju={token}`. Token ad6c81ad-5a80-4b9a-a3bd-2db9b46629fb. Inte registrerat | `prod-pixel7-a4` till `a6b` |
| 22 | PostHog | Se nedan | |
| Live | Title, description, sajtkarta, `/ny`, annan token | Title 58 tecken, description 141 tecken, canonical rätt. `/sitemap.xml` innehåller `/verktyg/personlighetstest`. `/dashboard/intervju/ny` inloggad: 200. `/dashboard/intervju/{token}` för ett prov som en annan användare äger: 404 | `prod-pixel7-k1-ny-inloggad.png`, `prod-pixel7-k2-annan-token-404.png` |

### PostHog (steg 22)

HogQL mot de tre identiteterna i körningen (QA-kontot, dess anonyma id före registreringen och den
anonyma sessionen), 07:26 till 07:45 svensk tid. Alla kom in:

- `signup_started` och `signup_completed`: `method: password`.
- `interview_hub_viewed` (9): `scope: tester`, `prov_count` 0, 1, 2, `has_profile` none och efter grundtestet full, `next_action` forstaGang och sedan nyFraga. Varje följs av `next_action_shown` med `surface: infor-intervjun`.
- `interview_practice_started` och `interview_practice_completed` (2 + 2): `surface: dashboard`, `question` varfor_vi och varfor_jobbet, `level` 4.
- `sample_started`, `sample_completed`, `signup_gate_shown` med `kind: personality`, `cluster: test`, `slug: verktyg/personlighetstest`, `duration_ms` 11043 på completed.
- `sample_started`, `sample_completed`, `signup_gate_shown` med `kind: interview`, `cluster: interview`, `question: styrkor`, `slug: styrkor-svagheter-intervju`, `level` 4 och `duration_ms` 9595 på completed.
- `feature_blocked` kom inte, vilket stämmer: Träningspaketet har inget tak och den anonyma sessionen nådde ingen kvot.

### Fynd i produktion

1. **Kvottext till betalande (copy).** Träningspaketet, noll prov, `/dashboard/intervju`: bläckytan
   "Börja här" slutar med "Ett prov om dagen ingår." och den tomma listan säger "Ett prov om dagen
   ingår gratis.", medan ingressen ovanför säger "Utan tak i Träningspaketet". Orsak:
   `src/app/dashboard/intervju/page.tsx` rad 54 lägger till `NASTA.forstaGang.kvot` när `kvotKvar` är
   sann utan att titta på `utanTak`, och `TOM.text` (rad 157) har ingen variant för betalande.
   Dump: `prod-pixel7-16b-0-hubben-fore.png`. Inte rättat (ingen kod i den här omgången).
2. **Grundtestet tappar läget vid omladdning (fanns före deployen).** `TestSessionView` startar med tomma
   svar och påstående 1 efter omladdning, fast servern har kvar svaren (här 48 av 50). Den som laddar om
   måste svara på alla 50 igen innan Lämna in går att trycka på. Samma sak om ett snabbt tryck landar
   medan svaret sparas: två av 50 tryck i första varvet hamnade på samma påstående.
3. **Hemskärmen efter prov och grundtest utan CV.** Enligt design (läge A) men värt ett beslut: den som
   köpt Träningspaketet och bara övat möts av "Börja med ditt CV" utan Nästa handling.
4. **404 för annan användares token** är Next.js standardsida på engelska ("This page could not be
   found."), utan skal eller väg tillbaka. Rätt status, men inte i Trådens stil.

### Städning i produktion

Allt skapat sparades per id eller token och raderades med samma villkor som räkningen:

| Tabell | Villkor | Räknat | Raderat |
|---|---|---|---|
| anon_interview_samples | token in (4c1d40d3…, c2d52821…, ad6c81ad…) | 3 | 3 |
| anon_personality_samples | token = 28e4c733… | 1 | 1 |
| user_personality_profile | user_id = QA-kontot (radens nyckel) | 1 | 1 |
| personality_test_sessions | id = 5b92ca09-8fa9-40a7-ac3e-3cdfa00c5d53 | 1 | 1 |
| user_activities | id in (64 id) | 64 | 64 |
| ai_usage_costs | id in (e37571f6…, fa6b6f55…) | 2 | 2 |
| email_schedule | id in (2bbd8ae4…, cd5617f2…) | 2 | 2 |
| email_confirmations | id = 765f04cd… | 1 | 1 |
| monthly_guest_allowances | id = f5f4fe04… | 1 | 1 |
| public_rate_limits | ip_hash 25b66935…, fönster 2026-09-24, scope anon_personality och anon_interview (count 1 vardera, bara våra prov) | 2 | 2 |

Raden för samma ip_hash med fönster 2026-09-23 lämnades orörd. QA-kontot raderades sist via auth admin
med id `2f7a8e5c-7924-4d6a-9429-4850ef4cdca1`; profiles följde med. Kontroll efteråt: 0 rader för id:t i
auth.users, profiles och alla bastabeller i public med en användarkolumn. Bekräftelsemejlet till
QA-adressen gick iväg vid registreringen.
