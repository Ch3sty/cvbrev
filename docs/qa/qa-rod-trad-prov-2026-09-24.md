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
