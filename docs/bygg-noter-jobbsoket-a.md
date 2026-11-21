# Byggnoter: Jobbsöket omgång 1, etapp 2A (byggare A)

Översikt och Matchade jobb. Gren `feat/jobbsoket-a`, arbetskopia `cvbrev-qa-b`, 2026-11-21.

## Vad som byggdes

### Översikt (`/dashboard`)

- `src/app/dashboard/(oversikt)/page.tsx` (flyttad från `src/app/dashboard/page.tsx`, samma rutt): landningsregeln är oförändrad, sedan `hamtaJobbsokOversikt` på servern och `OversiktVy`. `loading.tsx` i samma mapp ritar kitets skelett (vägg och panel).
- `src/components/jobb3/oversikt/OversiktVy.tsx`: tre lägen.
  - **Main** (även "inget att göra" och "CV men inga sökta tjänster"): väggen ur `attGora.vagg` med banan (`JobbsokBana`), veckans mål (kompakt på telefon, bricka med "Ändra" på dator), primärknappen ur första handlingen. Att göra nu i `LyftPanel` (tomt läge när inget finns), nya träffar i egen Suspense-gräns (`NyaTraffar.tsx`, `hamtaToppTraffar`), Sökta tjänster (högst fyra rader, `tjansterKort`), Mer i Jobbsöket (Bli upptäckt, Jobbcoachen, Din arbetsstil när personlighetsprofilen finns, Rekryteringstester med nivån ur korsreferensen).
  - **Ny** (`attGora.lage === 'utan_cv'`): skissen Oversikt-ny.
  - **Träning** (träningsfokus): hälsningen i väggen, träningens nästa steg i panelen med primärknappen, CV-länken, Mer i Jobbsöket.
- Klientöar: `VeckansMalAndra.tsx` (arket Ändra veckans mål, PUT `/api/jobbsok/veckans-mal`, sedan `router.refresh()`), `TraningsKnapp.tsx` (mätpunkterna `next_action_shown`/`next_action_clicked`), `KorsKlick.tsx` (`korsreferens_klick`), `(oversikt)/OversiktKlient.tsx` (köpkvittot med omläsningen och aktivitetsloggen, nedgraderingsnotisen, `activation_state`).
- Rena funktioner: `src/components/jobb3/oversikt/oversikt.ts` (banans props, raderna, Att göra nu på telefon, träffrubriken), `traning.ts` (träningens text och länk, samma ord som förra Nästa handling), `(oversikt)/startvy.ts` (dagens regler för startvyn; valet i registreringen läses bara där, kriterium 14 i `villkor.test.tsx`).
- "Logga sökt tjänst": glasknappen i väggen och sist på sidan på telefon (inte `FastFot`) länkar till **`/dashboard/sokta-tjanster?logga=1`** (`soktaHref({ logga: 'sokt' })`). **Byggare B läser parametern och öppnar arket.**
- Borttaget (bara i mitt område): `DashboardHem`, `DashboardHero`, `NastaHandling`, `JobbsokGolv`, `SnabbAtgarder`, `ProvaOcksa`. Kvar och använda: `PurchaseConfirmation`, `QuotaNudgeRow`, `ProfilKomplettering`, `HemHuvud` (hälsningen).

### Matchade jobb (`/dashboard/jobbmatchning`)

- `src/components/jobb3/jobb/MatchadeJobb.tsx` ersätter `JobbmatchningClient`. Tillståndet och funktionen är dagens (Byt CV med automatisk inläsning, Rätta, Så söker vi åt dig, Filter, omsökning via `match-jobs`, påfyllningen till 600, sessionStorage-sparningen, suddningen via `/api/jobs/redact`, `matchningar-sedda`, mätpunkterna `match_page_viewed`, `match_search_run`, `match_viewed`, `match_letter_started`, `match_applied`, `match_preferences_saved`, hemskärmsfrågan).
- Väggen: "25 jobb passar dig, fyra är nya" (gratis: "tre är öppna"), ögonbrynet med lästa annonser, Ditt CV och Så söker vi åt dig som glasrutor (dator) och länkrader (telefon).
- Listan och annonsen i `LyftPanel delad={432}`: annonsen bredvid från 1280 px; under det egen vy (Mobil-jobb-annons) med tillbakalänk, kortet med skälen, annonsens text och `FastFot` med Skriv brev, Spara och Sökt. Vald annons i adressen `?annons=<id>`, bytt med `history.pushState` (servern läser inte om körningen vid klick). Dold träff: `?annons=dold-<n>`.
- Annonsen (`AnnonsVy.tsx`, `annons.ts`): sista ansökningsdag (piller, koppar inom sju dagar), "Därför passar du" med kompetenserna en och en ur `kompetenserEnOchEn` (saknad bara med kravprofil), Skriv brev (primär, dagens prefill), Spara till Ska sökas (POST `/api/jobbsok/ska-sokas` med `sparadFranAnnons`), Markera som sökt (POST `/api/applications` med `af_ad_id`), faktarutor, annonsens text, krav och meriterande, kontaktperson.
- Gratisnivån: tre öppna, fem dolda rader med bara ringen, betalväggen i `SparrRam` med dagens `PaywallCard variant="jobbtraffar"` (bredvid listan när en dold rad är vald; i listan på telefon).
- Arken (`MatchArk.tsx`) i kitets `Ark`, med dagens fält (`JobPreferencesFields`, `JobFilterPanel`).
- Sorteringen Relevans, Nyast, Sista ansökningsdag ordnar listan (samma 25 träffar).
- Lägen: laddar CV, sökningen laddar (skelett i panelen), inte sökt än (primärknappen "Hitta jobb som passar"), inget passade, fel, utan CV, läsfel, annonsen finns inte (telefon).
- Serverladdare `src/app/dashboard/jobbmatchning/senasteKorning.ts`: senaste körningen ur `job_matchings_cache` för det aktiva CV:t, rankad med samma kedja som klienten. Premium får de 60 bästa; gratis bara de tre öppna plus en färdig suddning (de dolda annonsernas text hamnar aldrig i HTML). `getJobbmatchningData` läser också `matchningar_sedda_at` (för "Ny") och `job_saved_ads` (sparad eller sökt per annons).
- `?annons=<id>&skriv=1` öppnar brevet direkt (Översiktens "Skriv brev" på ett träffkort).
- `data/filter-standard.ts`: `JobFilters`, `DEFAULT_FILTERS`, `countActiveFilters` flyttade ut ur `JobFilterPanel` ('use client') så att servern kan använda dem; panelen exporterar dem vidare.
- Borttaget: `JobbmatchningClient`, `JobDetailModal`, `MatchRow`, `RedactedJobCard`, `JobMatchingOnboarding`, `JobSearchLoader`. `loading.tsx` ritar kitets skelett.

### F1

Ingen ändring i `src/components/rum/**` eller `src/lib/rum/**` behövdes: kitets `JobbVagg` ritar de fyra flikarna (Översikt, Jobb, Sökta, Intervju) på telefon och dator, så Inför intervjun nås från varje Jobbsök-sida. Dörrnavet och sidomenyn är orörda.

## Ändringar i motorn (rättat fel)

- `hamtaToppTraffar` (`src/lib/jobbsok/server.ts`) rankade alla 600 annonser utan preferenserna och grundfiltren. Översikt visade då andra träffar än Matchade jobb (jobb i Simrishamn och Motala för ett CV i Umeå, som listan gallrar bort med 100 km-gränsen). Nu samma kedja som listan: `applyClientFilters(applyPreferences(jobs, prefs), DEFAULT_FILTERS, false)` före `rankMatches`.
- Kitet är orört.

## Egna beslut

1. **Senaste körningen läses på servern** för Matchade jobb. Utan den kunde en länk från Översikt till en vald annons inte visa något, och sidan började alltid i "Vi har inte letat än". Gratisnivån får bara de tre öppna annonserna i svaret och suddningen räknas inte om på klienten förrän en ny sökning körs.
2. **Tillstånd B** (CV men inget brev) får Main-vyn: väggen säger "Sök tre tjänster till" och leder till Matchade jobb, där Skriv brev är primär. Förra hemmets kort "Nästa steg: brevet", Snabbåtgärder och Prova också är borta. `activation_state` mäts som förut.
3. **Nästa handling** (useNextBestAction) är ersatt av Att göra nu. Uppföljning och rapporten finns i motorns regler; intervjuomskrivningen och funktionstipset finns inte längre på Översikt (Inför intervjun och Mer i Jobbsöket bär dem).
4. **CV-uppladdningen** sker på `/dashboard/profil/cv` (motorns `CV_HREF`), inte i rutan på hemmet som förut.
5. "Din arbetsstil" visas i Mer i Jobbsöket när personlighetsprofilen finns (`summering.intervju.harProfil`).
6. "N nya jobb som passar dig" räknar `matchningarNya` ur summeringen; länken heter "Alla träffar" utan tal (laddaren ger inte antalet).
7. "Senast sökt för N minuter sedan. Sök igen" står under sorteringen (dagens omsökning; skissen ritar ingen).
8. Mobilens annonsfot har ikonknappar utan synlig text under (kitets `IkonKnapp`, etiketten är aria-label).
9. Telefonens ingress i väggen är datorns (skissen har en kortare variant för Förbered intervjun).

## Avvikelser från skissen

- Bli upptäckt-raden säger dagens text (synlig eller inte), inte "12 rekryterare har sett din profil" och "1 väntar": summeringen har inte de talen.
- Skissens rad bredvid primärknappen ("Vi börjar med frågan du fick 2 av 5 på") är bara "En kvart räcker." (motorns text bär resten i Att göra nu-kortet).
- Ögonbrynet "Sedan du tittade i tisdags" över träffarna: datumet för förra besöket finns inte i laddaren; raden säger antalet lästa annonser och när körningen gjordes.
- Profilkompletteringen och kvotraden (dagens komponenter) står under Sökta tjänster i sin gamla form.

## Testdata (`scratchpad/jobbsok/bygg/a/testdata.json`)

Påhittat CV ("Sara Testsson", ekonomiassistent i Umeå) uppladdat via `/api/cv/upload` på båda QA-kontona, inläst med `parse-cv-for-matching` och matchat med `match-jobs`. Gratis `cv_texts` a4a254fc-cc7a-4699-9cfa-1df1790125f9, Premium 4ce9c942-4dc3-42a3-9795-65447d8fb24b. Körningarna ligger i `job_matchings_cache` (en rad per konto, nyckel user_id + cv_id + filter_hash ''). Premiumkontots körning sparades först vid tredje försöket (se nedan); den sista kördes genom sidans knapp.

## Det som inte fungerar eller inte är prövat

- **`match-jobs` sparar ibland inte körningen**: upsert av 600 annonser (3,3 MB jsonb) fick `canceling statement due to statement timeout` två gånger för Premium-kontot (postgres-loggen 11:33:31). Funktionen loggar ändå "Cached matching". Gammalt fel i edge-funktionen, inte rört. Följd: Översikt visar "Vi har inte letat än" och Matchade jobb börjar utan träffar tills en körning faktiskt sparats.
- **Prestanda**: Matchade jobb läser hela körningen (3,3 MB) på servern; dev-servern renderade sidan på 5–6 s. Samma läsning gör `hamtaToppTraffar` på Översikt (i egen Suspense-gräns). Ska mätas i slutkontrollen; kandidat för en smalare lagring av körningen.
- Översiktens lägen **Ny** (utan CV och utan sökta tjänster) och **Träning** är inte sedda mot ett riktigt konto: båda QA-kontona har sökta tjänster. Koden följer kitets exempelvägg; `startvy` är enhetstestad.
- En sporadisk "1 Issue" i Nexts utvecklingsruta på telefonbredd syntes i tre av tolv skärmbilder och gick inte att framkalla igen; inget fel i konsolen eller dev-loggen.
- "Spara till Ska sökas", "Markera som sökt" och arken Byt CV, Rätta, Filter och Så söker vi åt dig är inte klickprövade i webbläsaren (bara Ändra veckans mål).
- Mörkt läge är bara sett på Översikt (telefon).

## Skärmbilder (`scratchpad/jobbsok/bygg/a/`)

`oversikt-1440-premium.png`, `oversikt-412-premium.png`, `oversikt-1440-gratis.png`, `oversikt-412-gratis-mork.png`, `ark-mal-1440-premium.png`, `jobb-1440-premium.png`, `jobb-1440-premium-laddar.png`, `jobb-1440-premium-intesokt.png`, `jobb-412-premium.png`, `jobb-1440-gratis.png`, `jobb-1440-gratis-dold.png`, `jobb-412-gratis.png`, `jobb-412-gratis-annons.png`.

## Hur man backar

`git revert` på etappens commit. Översikten går tillbaka till `DashboardHem` och Matchade jobb till `JobbmatchningClient`; ingen migrering hör till etappen. Testdatan (två CV och två körningar) kan stå kvar eller raderas per id ovan.
