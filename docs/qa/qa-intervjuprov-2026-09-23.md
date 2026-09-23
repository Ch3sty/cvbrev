# QA: intervjuprovet, 2026-09-23

Bygge enligt `docs/design/intervjuprov-spec-2026-09-23.md` och designen i
`docs/design/intervjuprov-2026-09-23.html`, med ägarens beslut 2026-09-23
(se avsnittet Avvikelser). QA på produktionsbygge (`NEXT_DIST_DIR=.next-intervju`,
`next start -p 8317`), Chrome via puppeteer-core. Skärmdumpar i `docs/qa/intervjuprov/`,
stegloggen i `docs/qa/intervjuprov/logg.json`.

## 1. Bedömningen på tio riktiga svar

`scripts/qa-intervjuprov-bedomning.ts`, modell `gemini-3.5-flash`, temperatur 0,3,
`thinkingBudget: 0`, schema i `src/lib/intervju/bedomning.ts`. Fullständigt utfall
(mening, works, missing, punkter, omskrivet svar, tokens, kostnad) i
`docs/qa/qa-intervjuprov-bedomning-2026-09-23.json`.

| Svar | Fråga | Tecken | Förväntat | Nivå | Mening (summary) |
|---|---|---|---|---|---|
| bra-1 | styrkor | 649 | 4 till 5 | 5 Övertygande | Styrkan bevisas med tydliga siffror och svagheten har en konkret handlingsplan. |
| bra-2 | star | 655 | 4 till 5 | 5 Övertygande | Initiativet visas med tydliga siffror och ett konkret resultat för verksamheten. |
| medel-1 | styrkor | 245 | 3 | 3 Godkänt | Styrkan har ett bevis, men svagheten stannar vid en bekännelse. |
| medel-2 | star | 384 | 3 | 3 Godkänt | Initiativet är tydligt beskrivet men vi får inte veta vad förändringen faktiskt gav. |
| medel-3 | styrkor | 333 | 2 till 3 | 3 Godkänt | Styrkan har en bra grund men svagheten saknar ett konkret exempel. |
| medel-4 | star | 360 | 3 | 3 Godkänt | Handlingen försvinner i ett gemensamt vi och det konkreta resultatet saknas. |
| dalig-1 | styrkor | 311 | 1 till 2 | 2 Tunt | Styrkorna radas upp utan bevis och svagheten är en klassisk klyscha utan plan. |
| dalig-2 | star | 288 | 1 till 2 | 2 Tunt | Påståenden om din initiativförmåga saknar en verklig situation som bevisar egenskaperna. |
| irrelevant | star | 258 | 422 | relevant=false | (ingen nivå, ingen rad sparas) |
| for-kort | styrkor | 79 | 400 | too_short | (stoppas före modellen) |

Skalan skiljer bra från dåligt: 5 och 5, fyra gånger 3, 2 och 2. Svaret i vi-form
(medel-4) får `missingKind: jag-formen`, lagersvaret utan utfall (medel-2)
`resultatet`, delegeringssvaret utan plan (medel-1) `planen`. STAR-svaren får alltid
fyra punkter Situation, Uppgift, Handling, Resultat.

Promptjusteringar mellan körningarna (nivåerna var redan rätt i första körningen):

1. Körning 1: summary var 25 till 30 ord och började med "Vi hör en kandidat ...";
   works och missing började med "Det som fungerar är ..." och upprepade rubriken;
   det dåliga styrkesvaret fick ett påhittat exempel ("nytt affärssystem") i omskrivningen.
2. Körning 2 (efter justering): summary högst 14 ord med designfilens två meningar som
   förebild, works och missing börjar direkt med saken i du-form, omskrivningen blir en
   mall med hakparenteser när exemplet saknas. Det starka svaret fick bara två punkter.
3. Körning 3 (slutlig, tabellen ovan): "minst fyra punkter även när svaret är starkt".

Kvarstående svaghet: omskrivningen hittar ibland på detaljer i ett svar som redan har
ett exempel (QA-kontot B fick "Chefen köpte idén direkt ... införde det på hela lagret").
Promptens regel står kvar; nästa steg är att mäta andelen på fler svar och vid behov
slå på thinking.

Tid och kostnad: 3,5 till 4,8 s per bedömning, cirka 1 350 tokens in och 650 ut,
0,0073 till 0,0090 USD per bedömning. Vid dygnstaket 50 anonyma prov: cirka 0,45 USD,
ungefär 4,50 kr per dag. Specens uppskattning (under en krona vid 100) var för låg.

## 2. Webbläsar-QA (spec avsnitt 9)

Styrkor på Pixel 7 (412 × 915, DPR 2) och STAR på desktop (1280 × 800), sedan omvänt i
kortform. Ny inkognitokontext per genomgång. Varje anonym genomgång fick en egen
`x-forwarded-for`, så att IP-kvoten (ett per IP och dygn) kunde provas avsiktligt.

| Steg | Förväntat | Utfall | Dump |
|---|---|---|---|
| 1 | Provet med rubriken före och efter | OK, båda artiklarna på båda enheterna | `pixel7-styrkor-01-inbjudan.png`, `desktop-star-01-inbjudan.png`, `pixel7-star-01-inbjudan.png`, `desktop-styrkor-01-inbjudan.png` |
| 2 | Tomt fält: felkant och hjälptext | OK, inget nätverksanrop, fokus i fältet | `pixel7-styrkor-02-tomt.png`, `desktop-star-02-tomt.png` |
| 3 | 80 tecken: felkant, `fel.kort`, "80 av 1 200", fokus, inget anrop | OK efter rättning (se Avvikelser, fynd 1). Kanten `rgb(185, 28, 28)` = `--fel` | `pixel7-styrkor-03-for-kort.png`, `desktop-star-03-for-kort.png` |
| 4 | Exempelsvaret, räknare, tipsrad | OK, chips för STAR, meningen för styrkor | `pixel7-styrkor-04-exempelsvar.png`, `desktop-star-04-exempelsvar.png` |
| 5 | Laddningen inom 2 s | OK, fånget efter 350 ms | `pixel7-styrkor-05-laddar.png`, `desktop-star-05-laddar.png` |
| 6 | Nivå, mening, punkter, låsta block, spärr | OK på 5,4 och 8,1 s (krav under 15 s). Kontoknappen pekar på `/register?intervju={token}`, token i sessionStorage | `pixel7-styrkor-06-resultat.png`, `desktop-star-06-resultat.png` |
| 7 | Svaret utan låsta fält | OK: inga `full`, `improvedAnswer`, `improvedWhy`, `points` | `pixel7-styrkor-07-natverkssvar.png` (+ `.json`), `desktop-star-07-natverkssvar.png` |
| 8 | "Skriv om och bedöm igen": texten kvar | OK, fokus i fältet | `pixel7-styrkor-08-skriv-om.png` |
| 9 | Frågan om svarstid: 422 och felraden | OK, texten kvar i fältet | `pixel7-styrkor-09-irrelevant.png` |
| 10 | Registrering med lösenord till `/dashboard/intervju/{token}` med hela återkopplingen | OK på båda enheterna. h1 "Ditt intervjusvar, bedömt", STAR-delarna, omskrivningen med markerade hakparenteser, knappen till Jobbcoachen | `pixel7-styrkor-10-dashboard-hel.png`, `desktop-star-10-dashboard-hel.png`, `pixel7-styrkor-10a-registrering.png` |
| 10b | Misslyckat claim: spårvalet utan felruta | OK: ett redan hämtat token gav 404 från claim och landning på `/dashboard/valj-spar` utan felruta (felsökningskörning) | (ingen dump) |
| 11 | Annan användares token: 404 | Sidan visar 404 och inget av B:s innehåll, robots noindex. HTTP-status är 200, se fynd 2 | `desktop-star-11-annan-anvandare-404.png` |
| 12 | Andra provet från samma IP: 429, statusraden, fältet dolt, kontoknappen | OK: prov 1 200, prov 2 429 `rate_limited`, knappen till `/register` | `pixel7-styrkor-12-kvot-429.png` |
| 13 | Reduced motion: laddningen står stilla | OK: två bilder med 700 ms mellanrum skiljer sig i 149 kanalvärden med högst 11 av 255 (kantutjämning, ingen rörelse; tråden står vid vänsterkanten) | `desktop-styrkor-13-reduced-motion-a.png`, `-b.png` |
| 14 | Tab-ordning och fokusring i accent | OK: fält, knapp, kontoknapp, "Skriv om och bedöm igen", alla `rgb(217, 72, 15)` 2 px | `desktop-star-14a` till `14d` |
| 15 | PostHog-händelserna | OK (se nedan) | eventlistan nedan |
| Inloggad kvot | Gratiskonto: prov 1 går igenom, prov 2 ger kvotraden | OK: 200 med `href` till dashboarden, sedan 429 `quota_exceeded`, `nextResetAt` 2026-09-23T22:00Z (midnatt Stockholm) | `desktop-star-16-inloggad-resultat.png`, `desktop-star-17-inloggad-kvot.png` |

PostHog (steg 15), egen genomgång 21:58 med vanlig Chrome-identitet, desktop, STAR:

```
sample_started     kind=interview cluster=interview question=star slug=kompetensbaserad-intervju-star-metoden
sample_completed   kind=interview cluster=interview question=star slug=... level=3 duration_ms=5307
signup_gate_shown  kind=interview cluster=interview question=star slug=...
signup_started     cluster=interview source_page=/artiklar/kompetensbaserad-intervju-star-metoden
signup_completed   method=password
draft_claimed      kind=interview
```

Headless Chrome skickar inga händelser alls: posthog-js sorterar bort webbläsaren som bot
på `userAgentData` (HeadlessChrome), så genomgångarna ovan syns inte i PostHog.
Kontrollen gjordes därför med överstyrd webbläsaridentitet. Testkontona heter `qa-...`
och markeras `is_internal` redan vid identify (`arTestEpost`), så de hålls utanför
adminens siffror även utan rad i `admin_undantagna_konton`. Kontona är raderade.

## 3. SEO-diff och prestanda

`npx tsx scripts/seo-diff-artiklar.ts` på 47 sidor, före (orört bygge av `6bfde976`) och
efter: `docs/qa/seo-diff/intervjuprov-fore.json`, `intervjuprov-efter.json`,
`diff-intervjuprov.md`. 45 sidor oförändrade. På de två artiklarna är h1, h2/h3,
title, description, canonical, interna länkar, FAQPage- och HowTo-schemat
oförändrade. Enda skillnaden, och skälet till att grinden fäller: `wordCount` i
BlogPosting (styrkor 5423 till 5421, STAR 2036 till 2039). Talet räknas ur rå MDX,
och komponenttaggen ersätter kommentaren på styrkor och läggs till på STAR.

`scripts/perf-publikt.ts`, Pixel 7 (3x strypning, LTE, median av 5) och desktop (median av 3):

| Sida | LCP före | LCP efter | CLS före/efter | JS före | JS efter |
|---|---|---|---|---|---|
| styrkor, mobil | 764 ms | 816 ms | 0 / 0 | 273 kB / 19 filer | 282 kB / 20 filer |
| STAR, mobil | 744 ms | 696 ms | 0 / 0 | 273 kB / 19 | 282 kB / 20 |
| styrkor, desktop | 196 ms | 204 ms | 0 / 0 | | 299 kB / 23 |
| STAR, desktop | 192 ms | 212 ms | 0 / 0 | | 299 kB / 23 |

Budgeten 1 500 ms håller med god marginal, CLS 0 före och efter interaktion (panelen
serverrenderas i tillstånd a; ingressen fälls bort först vid användarens eget tecken).
Provets kod laddas via `next/dynamic` i `mdx-klient.tsx` och följer bara med på de två
artiklarna (+9 kB).

## 4. Fynd och rättningar

1. **Felkanten försvann när fältet hade fokus** (steg 3, första körningen: kanten var
   ink-1). `focus:border-ink-1` vann över `border-fel`. Rättat: fokuskanten sätts bara
   när fältet inte har fel. Omkört, OK.
2. **404 för annan användares token ges med HTTP 200.** Innehållet är 404-sidan med
   `noindex` och inget av svaret läcker, men `src/app/dashboard/loading.tsx` gör att
   dashboardsidorna strömmar, och statusen är skickad när `notFound()` körs. Gäller alla
   dashboardsidor. Inte rättat: kräver att laddningsgränsen flyttas för hela dashboarden.
3. **Samtyckesrutan täcker "Skapa konto" på mobil** (`#rcc-confirm-button` ligger över
   knappen tills den tryckts bort). Befintligt beteende, utanför bygget. QA trycker bort
   rutan först, som en besökare.
4. **Mobilens klistrade knapprad ("Träna intervjufrågor") täcker spärrkortets underkant**
   när kortet står längst ner på skärmen. Befintligt beteende. Kortet går att scrolla
   fram; värt att se över om raden ska döljas medan provet syns.
5. **Omskrivningen hittar ibland på detaljer**, se avsnitt 1.

## 5. Avvikelser från specen och varför

- Anonym kvot 1 per IP och dygn och dygnstak 50 (specen: 3 och 100). Ägarens beslut.
  Kvottexten "Du har gjort dagens intervjuprov ..." enligt beslutet.
- Kvot för inloggade med egen feature `interview_unlimited` (Testveckan och Allt), inte
  `chat_unlimited`. Ägarens beslut 5.
- Kvotfunktionen anropas med admin-klienten: tabellen har RLS utan policies, och en
  användarklient hade räknat noll rader och släppt igenom allt.
- Irrelevant text från inloggade sparas som en rad markerad irrelevant (`full.irrelevant`)
  så att den räknas mot dagskvoten (beslut 9). Anonyma räknas redan av IP-spärren och får
  ingen rad. Dashboardsidan ger 404 på raden. Grenen är inte provad i webbläsaren.
- Inloggade som gör provet får raden kopplad direkt (`claimed_by`) och ett kort med
  "Se hela återkopplingen" till dashboarden i stället för spärren. Copyn för det kortet och
  för inloggad kvot ("Du har gjort dagens intervjuprov. Nästa öppnar i morgon, och med
  Testveckan övar du utan gräns." + "Se Testveckan") finns inte i designfilen och är
  skriven här.
- Dashboardsidan heter `/dashboard/intervju/[token]` (specen: `[id]`), ägarens beslut 1.
  Den gör själv anspråk på en ohämtad rad, så att Google-registreringen fungerar:
  `register-form` skickar `next=/dashboard/intervju/{token}` till Google när
  `?intervju=` finns. Google-vägen är inte provad i webbläsaren.
- `full` är ett reserverat ord i Postgres och är citerat i migrationen.
- Rensningen av utgångna svar ligger i cronens midnattsslot (ägarens instruktion). Befintlig
  rensning av brevutkast och testsessioner ligger kvar i morgonslotten, orörd.
- Kostnaden loggas i `ai_usage_costs` för inloggade. Tabellen kräver `user_id`, så anonyma
  bedömningar loggas i funktionsloggen med tokens och USD.
- `admin/tratt/funnel-data.ts` är oförändrad: tratten filtrerar inte på `kind`.
- Integritetspolicyn beskrev inte brevutkasten. Stycket om intervjuprovet står i
  avsnitt 7 Datalagring, och datumet är uppdaterat.
- Provet placeras på styrkor-artikeln där kommentaren `{/* intervjuprov: placeras här */}`
  stod (före "Därför frågar intervjuaren ..."), inte före "Så väljer du rätt ...".
- Svaret raderas efter sju dagar också när det hämtats till ett konto (beslut 7).

## 6. Testdata

Åtta QA-konton (`qa-intervju-*@jobbcoach.ai`), alla rader i `anon_interview_samples`,
`public_rate_limits` och `public_generation_budget` för scope `anon_interview`, samt
kontonas `user_activities` och `ai_usage_costs` är raderade. Anonyma händelser från
genomgången 21:58 ligger kvar i PostHog.
