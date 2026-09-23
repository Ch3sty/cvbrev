# Röd tråd för proven: överlämning till bygget

Design: `docs/design/rod-trad-prov-2026-09-24.html` (godkänns av ägaren före bygge).
Förebilder: intervjuprovet (`docs/design/intervjuprov-spec-2026-09-23.md`, koden under
`src/components/artiklar/intervjuprov/`, `src/lib/intervju/`, `src/app/api/public/intervjuprov/`,
`src/app/dashboard/intervju/[token]/`) och testprovet (`src/app/(public)/verktyg/rekryteringstester/prova/ProvaFlow.tsx`).
Datum: 2026-09-24. Bygg med Opus 5.5. Inget i `src/` är ändrat av designen.

Läs intervjuprov-specen först: allt som inte sägs annorlunda här görs som där (tokens, spärrkortets
markup, claim-kedjan, SEO-spärrlistan, QA-formen).

## 0. Fynd som styr bygget

Det finns redan en personlighetstestmotor. Använd den, bygg ingen ny:

| Vad | Var |
|---|---|
| Banker: 50 påståenden (grund), 120 (fördjupad) | `src/lib/personalityTest/itemsGrund.ts`, `itemsAvancerad.ts` |
| Poängräkning 0 till 100 per faktor, omvända påståenden | `src/lib/personalityTest/scoring.ts` (`computeScores`, `isComplete`) |
| Faktornamn, band (låg < 40, hög ≥ 70), texter per band, intervjutips | `src/lib/personalityTest/insights.ts` (`DIMENSION_META`, `bandFor`, `DIMENSION_TEXTS`, `interviewTips`) |
| Sessioner och profil | tabellerna `personality_test_sessions`, `user_personality_profile` (trigger fyller profilen vid slutförd session, `supabase/migrations/20260511_personality_tests.sql`) |
| Inloggade testsidor | `/dashboard/tester/personlighet-grund` (gratis, `checkTestSessionAccess`), `personlighet-avancerad` (`tests_above_base`) via `PersonalityHubPage` |
| Rapport i du-form, arketyper | `/dashboard/arbetsstil`, `src/lib/recruiter/workStyle.ts` (`deriveWorkStyle`, `deriveCandidateOwnReport`) |
| Hubbens profilrad | `src/app/dashboard/tester/components/PersonalityResultCard.tsx`, `getHubData.ts` (`personality.grund/avancerad`) |

Smakprovet (Del A) är tjugo egna påståenden som poängsätts med samma `computeScores`. Det skriver
aldrig till `personality_test_sessions` eller `user_personality_profile`: tjugo påståenden får inte
bli den profil Bli upptäckt visar rekryterare. Tråden inloggad (Del B) går till det befintliga
grundtestet och det fördjupade.

`docs/plan-content-2026-q4.md` rad 143 säger att motorn saknas. Rätta raden i samma commit.

## 1. Vad som byggs

**Del A, personlighetsprovet.** En panel `Personlighetsprov` i artiklarna
`personlighetstest-jobb-guide` och `map-test-personlighetstest`, och samma panel som huvudinnehåll på
en ny sida `/verktyg/personlighetstest`. Tjugo påståenden, ett i taget på samma yta, femgradig
skala, profil direkt (bandord och en mening per faktor i rekryterarens perspektiv), spärr före
tolkningen (sex kravprofiler, intervjupunkter, omvända påståenden och konsekvens). Ren beräkning,
ingen modell, statisk tolkningstext.

**Del B, Inför intervjun.** Ny sida `/dashboard/intervju` med Nästa handling i bläck, listan
"Dina intervjuprov", kvoten som statusrad, panelen "Din personlighetsprofil". Ett tvåstegsflöde
`/dashboard/intervju/ny` för nytt prov med sju frågor (två publika, fem bara inloggad). En
tolkningssida `/dashboard/intervju/profil/[token]` för smakprovet efter claim. Menyrad under Träna,
två nya steg i hemskärmens Nästa handling, meningar i "Det här har du gjort", en bricka i Kom igång
för Testveckan och Allt.

## 2. Filer

### Nya

| Fil | Innehåll |
|---|---|
| `src/lib/personlighet/smakprov-pastaenden.ts` | Klientsäker: `SMAKPROV_PASTAENDEN: ReadonlyArray<{ id: SmakprovId; text: string }>` (tjugo, ur designfilens tabell) och `SKALA: ReadonlyArray<{ value: 1..5; label: string }>`. Inget om faktor eller omvändning. |
| `src/lib/personlighet/smakprov-facit.ts` | Serverbara (importeras aldrig av klientkod, lägg `import 'server-only'` överst): `SMAKPROV_ITEMS: PersonalityItem[]` med `dimension` och `reverse` för de tjugo, byggda på typen ur `personalityTest/types.ts` så `computeScores` tar dem direkt. `blandaOrdning(token)`: seedad Fisher–Yates (samma som `selectQuestions.v7.ts`) med regeln att två påståenden med samma faktor aldrig står intill varandra. |
| `src/lib/personlighet/smakprov-tolkning.ts` | Klientsäker, ren data och rena funktioner: `FAKTORER` (ordning och visningsnamn, Stabilitet = 100 − neuroticism), `bandOrd(band)`, `LASNING: Record<Faktor, Record<Band, string>>` (femton meningar ur copytabellen), `profilMening(scores)`, `KRAVPROFILER` (sex, regler ur designfilen), `kravUtfall(scores, krav)`, `intervjuPunkter(scores)` (fem, en per faktor, byggda av `DIMENSION_TEXTS[dim][band].workContext` plus `LASNING`), `konsekvens(answers)` (antal faktorer där de två raka och de två omvända svaren pekar åt samma håll efter vändning, tolerans ett steg). |
| `src/lib/personlighet/smakprov-rad.ts` | Som `src/lib/intervju/rad.ts`: `SmakprovRad`, `arTillganglig`, `hamtaEllerGorAnsprak(admin, token, userId)`, `cleanupExpiredSmakprov(admin)`. |
| `src/components/artiklar/personlighetsprov/Personlighetsprov.tsx` | Klientkomponenten, alla tillstånd. `'use client'`. |
| `src/components/artiklar/personlighetsprov/personlighetsprov-copy.ts` | Alla strängar ur copytabellen, avsnitt "Personlighetsprovet (publikt)" och "Sidan /verktyg/personlighetstest". |
| `src/app/(public)/verktyg/personlighetstest/page.tsx` | `VerktygsSida` som de nio andra verktygssidorna, med `<Personlighetsprov slug="verktyg/personlighetstest" />` som första block efter sidhuvudet. Metadata ur copytabellen. Sitemap och intern länkning, se avsnitt 9. |
| `src/app/api/public/personlighetsprov/route.ts` | POST: validering, IP-kvot, poäng, lagring, synligt svar. Avsnitt 5. |
| `src/app/api/public/personlighetsprov/claim/route.ts` | POST `{ token }`, som intervjuprovets claim. |
| `src/app/dashboard/intervju/page.tsx` | Serverkomponent: läser `getInforIntervjunData`, renderar sidan. `export const dynamic = 'force-dynamic'`. |
| `src/app/dashboard/intervju/getInforIntervjunData.ts` | En serverhämtning, avsnitt 3. |
| `src/app/dashboard/intervju/InforIntervjunClient.tsx` | Den lilla klientdelen: Nästa handling (InkPanel) med avfärdning, `feature_blocked` när kvotraden visas i läget slut. Allt annat renderas på servern. |
| `src/app/dashboard/intervju/components/ProvRad.tsx` | En rad i listan. |
| `src/app/dashboard/intervju/components/ProfilPanel.tsx` | Panelen "Din personlighetsprofil" i tre lägen: smakprov, grund/fördjupad, ingen. |
| `src/app/dashboard/intervju/infor-intervjun-copy.ts` | Strängarna ur copytabellen, avsnitt "Inför intervjun (inloggat)". |
| `src/app/dashboard/intervju/ny/page.tsx` + `NyttProvFlow.tsx` | FlowShell i två steg, avsnitt 3. |
| `src/app/dashboard/intervju/profil/[token]/page.tsx` | Serverrenderad tolkningssida för smakprovet. |
| `src/app/dashboard/intervju/loading.tsx` | `LoadingSkeleton variant="card"` under PageHeader-skelett, samma min-höjd som sidan. |
| `supabase/migrations/<datum>_personlighetsprov.sql` | Tabellen `anon_personality_samples` och ändrad check på `anon_interview_samples.question`, avsnitt 6. |

### Ändrade

| Fil | Ändring |
|---|---|
| `src/components/artiklar/intervjuprov/fragor.ts` | `FragaId` blir sju: `'beratta' \| 'styrkor' \| 'varfor_vi' \| 'varfor_jobbet' \| 'star' \| 'konflikt' \| 'misstag'`. Nya fält per fråga: `kort` (listans namn), `beskrivning` (ChoiceCard), `publik: boolean` (bara `styrkor` och `star`), `starChips: boolean` (`star`, `konflikt`). `promptFokus` för de fem nya skrivs i samma form som de två befintliga; rekryterarens perspektiv per fråga står i designfilens copytabell under `fraga.*`. `PUBLIKA_FRAGOR` exporteras. |
| `src/components/artiklar/intervjuprov/intervjuprov-copy.ts` | `fel.kort` får en gren per `starChips`, inte per id. `sida.eyebrow` blir "Inför intervjun", `sida.beskrivning` "Hela återkopplingen och ditt svar omskrivet. Vi sparar det i ditt konto." (beslut 2), `sida.knapp` "Öva på nästa fråga", nya `sida.rad` och `sida.radLank`. |
| `src/components/artiklar/intervjuprov/Intervjuprov.tsx` | Ny valfri prop `laege?: 'artikel' \| 'flode'`. I `flode` renderas panelen utan `aside`-ramen och utan eyebrow/rubrik/fotnot (FlowShell äger ramen), bedömningsknappen ersätts av en `onBedom`-ref som FlowShells fot anropar, och vid resultat anropas `onResultat(href)` i stället för att spärrkortet ritas. Artikelläget är oförändrat. |
| `src/lib/intervju/bedomning.ts` | Oförändrad logik; `FRAGOR[fraga].promptFokus` täcker nya frågor. `star`-regeln "exakt fyra punkter" gäller `starChips`. |
| `src/app/api/public/intervjuprov/route.ts` | Anonym begäran med `question` som inte är `publik` ger 400 `{ error: 'question_not_public' }`. Inloggad får alla sju. |
| `src/app/dashboard/intervju/[token]/page.tsx` | Eyebrow, beskrivning, primärknapp (till `/dashboard/intervju/ny`) och sist en `StatusRow tone="positive" showDot` med `sida.rad` och länken "Öppna" till `/dashboard/intervju`. Ingen annan ändring. |
| `src/lib/letters/claim-draft-client.ts` | `storePendingPersonlighet(token)`, `claimPendingPersonlighet()` med nyckel `jc_pending_personlighet` och URL-parametern `personlighet`, samma mönster som intervju. |
| `src/components/auth/register-form.tsx` rad 179 | `\|\| (await claimPendingPersonlighet())` sist i kedjan. |
| `src/lib/analytics/events.ts` | `'personality'` i `kind`-unionen för `sample_started`, `sample_completed`, `signup_gate_shown`, `draft_claimed`. Nya: `interview_hub_viewed`, `interview_practice_started`, `interview_practice_completed`, `next_action_shown`. Avsnitt 4. |
| `src/components/dashboard/Sidebar.tsx` | Under Träna, mellan Rekryteringstester och Jobbcoachen: `SidebarLink href="/dashboard/intervju" label="Inför intervjun" icon={IkonIntervju} badge={<span className="text-steg text-accent-ink">Nyhet</span>}`. Badgen tas bort 2026-10-22 (skriv datumet i en kommentar). Aldrig grå: sidan ingår i alla nivåer. |
| `src/components/illustrations/Ikoner.tsx` | `IkonIntervju`: två pratbubblor, 24 px, stroke 1,75, samma konventioner som filens övriga. Motivet i designfilen (sidomenyn). |
| `src/lib/dashboard/getSummary.ts` | Nytt fält `intervju: { antalProv: number; senaste: { token, question, level, missingKind, createdAt } \| null; smakprovToken: string \| null; harProfil: boolean }`. Två frågor till i samma parallella omgång. |
| `src/hooks/useNextBestAction.ts` + `src/app/dashboard/(oversikt)/NastaHandling.tsx` | Två nya `kind` efter `af-report`, före `feature`: `interview-rewrite` (senaste provet nivå ≤ 3, äldre än 24 h, inget nyare prov på samma fråga, inte avfärdad) och `personality-full` (smakprov finns, ingen profil, inte avfärdad). Avfärdning sju dagar i localStorage som uppföljningen. Copy ur tabellen `hem.nasta.*`. Scen `IlluScenIntervju` (finns i `PriserScener.tsx`). |
| `src/lib/dashboard/aktivitet.ts` | Två nya meningstyper ur `anon_interview_samples` (claimed_by = user, `relevant` sant) och `anon_personality_samples` (claimed_by = user): copy `hem.aktivitet.*`. |
| `src/lib/onboarding/komigang.ts` | Ny bricka `intervjuprov` i listorna `tester` och `allt` (efter `personlighet`), texter ur copytabellen `komigang.intervju`. `komigang-server.ts`: `markeraBricka(userId, 'intervjuprov')` i intervjuprovets route när en inloggad rad sparas. `harledProvade`: räknar `anon_interview_samples` med `user_id`. |
| `src/app/api/cron/pricing-sync/route.ts` | I 00:00-slotten, bredvid `cleanupExpiredIntervjuprov`: `cleanupExpiredSmakprov`. Aldrig ett tredje cron-jobb. |
| `src/app/(public)/artiklar/[slug]/page.tsx` ~rad 392 | `Personlighetsprov: (p) => <Personlighetsprov {...p} slug={slug} />`. |
| `content/artiklar/personlighetstest-jobb-guide.mdx` | `<Personlighetsprov />` efter stycket som slutar "...underlag till samtalet snarare än ett färdigt beslut." (i avsnittet `### Så tolkas svaren`), före stycket "Vill du testa svarsskalan på riktigt...". Det stycket skrivs om: länken går till `/verktyg/personlighetstest` och texten blir "Provet ovan är tjugo påståenden. Vill du göra hela testet med femtio och spara profilen finns det i kontot, gratis." Hubbtrimningen av MAP-stycket (plan-content) rörs inte här. |
| `content/artiklar/map-test-personlighetstest.mdx` | `<Personlighetsprov />` efter stycket "Lägg märke till två saker..." i `## Exempel på påståenden i MAP-stil`, före `## Hur svarar man på MAP-testet?`. I `## Går det att göra MAP-testet gratis?` byts länken "personlighetstest på två nivåer i våra rekryteringstester" till `/verktyg/personlighetstest`. |
| `src/app/(public)/verktyg/rekryteringstester/page.tsx` | Blocket "Personlighetsprofil": `lank.href` från `/register` till `/verktyg/personlighetstest`, text "Gör personlighetsprovet, tjugo påståenden utan konto". |
| `src/app/sitemap.ts` (eller motsvarande) | `/verktyg/personlighetstest`. |
| `docs/plan-content-2026-q4.md` rad 143 | Rätta påståendet om motorn. |

## 3. Komponent-API och sidor

### `Personlighetsprov`

```tsx
interface PersonlighetsprovProps {
  /** Artikelns slug eller 'verktyg/personlighetstest', för eventen och source_page. */
  slug?: string
}
```

Rot: `<aside className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-labelledby={rubrikId}>`.
Rubriken `<p>` i display 22/28, aldrig h2/h3 (även på verktygssidan: sidans h1 är sidmallens).

Tillstånd `type Phase = 'inbjudan' | 'svarar' | 'laddar' | 'resultat'` plus `fel` och `kvot`:

| Tillstånd | Vad som visas |
|---|---|
| inbjudan | eyebrow, rubrik, ingress, stegrad "Påstående 1 av 20 · Inga rätt eller fel", påstående 1, instruktionsrad, skalan, fotnot. Serverrenderas med samma markup. |
| svarar | från första svaret: ingress och rubrik fälls bort, framstegslinjen (2 px accent i panelens överkant, `width = n/20`) tänds, stegrad, påstående n, skalan, raden "Föregående påstående" (textlänk) och "Svar sparas i panelen". |
| laddar | stegrad "20 av 20 · Klart", `LoadingSkeleton variant="writing" label="Vi räknar ihop din profil" meta="Tar en sekund."`. |
| resultat | eyebrow "Din profil" (fokus, `tabIndex={-1}`), `profilMening` i `text-varde`, fem faktorer (namn, bandord, femsegmentsmätare `aria-hidden`, läsning), tre låsta block med platshållarrader (6, 5, 3), sr-only-mening, spärrkortet under panelen. |
| fel | `FlowError` under stegraden, svaren kvar. |
| kvot | rubriken, `StatusRow tone="neutral" showDot wrap` med kvottexten, kontoknappen, villkorsraden. Skalan dold. |

Skalan: `<div role="radiogroup" aria-label="Hur väl stämmer påståendet">` med fem `<button role="radio" aria-checked>`,
`min-h-11 w-full` i `grid gap-2`, `sm:grid-cols-5`. Valt: `border-ink-1 shadow-val` plus bock i ink-1 (mobil).
Tangentbord: pil upp/ned (mobil) och vänster/höger flyttar fokus och val inom gruppen, mellanslag eller
Enter bekräftar och går vidare. Ett tryck går vidare efter 160 ms. Räknaren `aria-live="polite"`.
Fokus flyttas till påståendet (`tabIndex={-1}`) vid varje byte.

Höjd: `.pastaende` har `min-h-[52px]` (två rader 20/26) på mobil och `min-h-[56px]` på desktop, så panelen inte
ändrar höjd mellan påstående 1 och 20. Påståenden längre än två rader på 380 px bredd får inte finnas (kontrollera
de tjugo i QA steg 3).

Ordning: klienten begär ingen ordning från servern. Komponenten skapar `token = crypto.randomUUID()` vid första
svaret, blandar med `blandaOrdning(token)` (funktionen ligger i facit-filen men är ren; exportera den i stället
från `smakprov-pastaenden.ts` så klienten kan använda den utan att facit följer med). Svaren och token sparas i
sessionStorage under `jc_smakprov_{token}` vid varje val och rensas vid resultat. Vid montering med sparad
session återupptas provet på rätt påstående.

Spärrkortet: intervjuprovets markup ordagrant (`IlluBlurGate`, rubrik, text, `Skapa konto gratis` med
`ArrowRight`, villkorsrad, textlänk "Gör om provet" som nollställer till inbjudan). `data-cta="personlighetsprov-gate"`,
länk `/register?personlighet={token}`, `storePendingPersonlighet(token)` vid resultat.
Inloggad besökare: `href` i svaret, kortet visar `inloggad.*` med länken "Se hela tolkningen".

### `/dashboard/intervju` (Inför intervjun)

Serverrenderad, `max-w-3xl`, `space-y-4 sm:space-y-6`. Ordning:

1. `PageHeader eyebrow="Träna" title="Inför intervjun" description={...} action={<Link href="/dashboard/intervju/ny">Nytt intervjuprov</Link>}`.
   Beskrivningen får tillägget "Utan tak i Testveckan." eller "Utan tak i Allt." när `interview_unlimited` finns.
2. Nästa handling: `InkPanel` (vyns enda bläckyta) via `InforIntervjunClient`. Rangordning på den här sidan:
   (1) `omskrivning` om senaste provet har nivå ≤ 3 och kvot finns, (2) `nyFraga` första frågan i `FRAGOR`-ordning som inte gjorts,
   (3) `helaTestet` om smakprov finns utan riktig profil, (4) `lasIgen` när kvoten är slut och inget annat gäller
   (rubriken från omskrivningen med tillägget "Nästa prov öppnar i morgon.", knappen "Läs återkopplingen igen").
   Inga prov alls: `forstaGang`. Sekundär textlänk "Välj en annan fråga" till `/dashboard/intervju/ny`.
   Scen `IlluScenIntervju`. Ingen avfärdning här (det är sidans egen rekommendation, inte hemskärmens).
3. Sektionsetikett "Dina intervjuprov" (`text-sm font-medium text-ink-3`), sedan `<ul className="divide-y divide-kant border-y border-kant">`
   med en `ProvRad` per prov (max 20, nyast först): talet i `font-display text-[22px] font-extrabold` + "av 5" i `text-meta`,
   frågans `kort`, underrad `{levelLabel} · {I dag|I går|d månad} · omskrivet med {missingKind}`, textlänk "Öppna" till
   `/dashboard/intervju/{token}` (`min-h-11`). Tomt: `EmptyState bare={false} title="Inga prov än" description={...}` utan action
   (primärknappen finns i sidhuvudet). Illustration: `IlluTomMapp` duger tills en egen pratbubbla finns i `TradenScener`.
4. Kvotraden, bara utan `interview_unlimited`: `StatusRow tone="neutral" showDot wrap action={<Link href={PREMIUM_HREF + '?paket=test_week'}>Se Testveckan</Link>}`
   med `kvot.kvar` eller `kvot.slut`. `feature_blocked` loggas en gång per sidvisning i läget slut.
   Kontrollera att prissidan tar `?paket=` (annars den parameter köpvägen redan använder för förvalt paket, se `docs/bygg-noter-paket.md`).
5. Sektionsetikett "Din personlighetsprofil", `ProfilPanel` i tre lägen:
   - riktig profil (`user_personality_profile` finns): kortrubrik = arketypens titel ur `deriveWorkStyle(domains, facets).archetype.title`,
     meta `Grundtestet, 50 påståenden · {datum}` eller `Fördjupade testet, 120 påståenden · {datum}` (datum = senaste slutförda session),
     fem rader med tal och 2 px-linje (exakt `PersonalityProfileCard`-mönstret, men femte raden heter Stabilitet och visar 100 − neuroticism),
     länkar: "Hela analysen" (`/dashboard/tester/personlighet-{grund|avancerad}/test/{sessionId}/results`), "Din arbetsstil" (`/dashboard/arbetsstil`),
     och "Fördjupade testet, 120 påståenden" (`/dashboard/tester/personlighet-avancerad`) om grund, annars ingen tredje. Utan `tests_above_base`
     är tredje länken i stället metatext "Fördjupade testet ingår i Testveckan" (ingen länk, ingen betalvägg här).
   - bara smakprov: kortrubrik `profil.smakprov.rubrik`, meta `Smakprovet, 20 påståenden · {datum}`, fem rader med bandord och femsegmentsmätare,
     länkar "Hela tolkningen" (`/dashboard/intervju/profil/{token}`) och "Gör hela testet, 50 påståenden" (`/dashboard/tester/personlighet-grund`).
   - ingen: kortrubrik "Ingen profil än", meta-texten, länk "Gör personlighetstestet" till grundtestet. Aldrig till smakprovet.

Regel 4 (aldrig fyra ytor i samma vikt i följd): bläckyta, lista på mark, statusrad, panel. Håller i alla lägen.

### `/dashboard/intervju/ny` (Nytt intervjuprov)

`FlowShell title="Nytt intervjuprov" totalSteps={2}`, URL-steg `?steg=fraga|svar` som övriga flöden, bottennav dolt av skalet.

Steg 1: eyebrow "Välj fråga", `text-fraga` "Vilken fråga vill du öva på?", `role="radiogroup"` med sju `ChoiceCard`:
rekommenderad = första i `FRAGOR`-ordning utan prov, annars lägsta bästa nivå; `variant="featured"` med `MarginPlate` och
`eyebrow="Rekommenderas"`, övriga `plain` med naken ikon 24 (ikoner ur `Ikoner.tsx` eller lucide i 24/1,75; välj befintliga, rita inga nya).
`description` = frågans `beskrivning`, `meta` = "Inte gjord än" eller "Gjord {n gånger} · bäst {n} av 5". Fot: "Fortsätt".
Förvalt `?fraga=` i URL:en (från Nästa handling) markerar kortet direkt.

Steg 2: `<Intervjuprov fraga={vald} laege="flode" slug="dashboard/intervju/ny" onResultat={(href) => router.push(href)} />`
med FlowShells fot "Bedöm mitt svar" (`primaryBusy` under laddning, `busyLabel="Vi läser ditt svar"`). Kvot 429 renderas som i artikeln
(statusraden med "Se Testveckan"), foten döljs. Resultatet: `router.push('/dashboard/intervju/' + token)` (routen svarar redan med `href` för inloggade).
`interview_practice_started` vid första tecknet, `interview_practice_completed` vid resultat.

### `/dashboard/intervju/profil/[token]`

Serverrenderad som `[token]/page.tsx` för intervju: `hamtaEllerGorAnsprak` med admin-klienten, 404 för annan användare eller utgången rad.
`PageHeader eyebrow="Inför intervjun" title="Din profil, hela tolkningen" description={...}`. Sektioner (paneler, max tre i följd, sedan lista):

1. Profilen: `profilMening`, fem faktorer med bandord, mätare och läsning (samma som provets resultat).
2. "Så läses din profil mot sex vanliga kravprofiler": `<table>` tre kolumner (Kravprofil, Väger tungt, Din profil) där tredje kolumnen är `kravUtfall`.
   På mobil radbryts tabellen till en lista per kravprofil (`sm:table`, annars `grid`). Aldrig procent.
3. "Det du kan säga på intervjun, faktor för faktor": `<ol>` fem punkter med rubrik (faktor och bandord) och två meningar.
4. "De tio påståendena som var omvända": lista på mark (`divide-y`) med påståendet och "Du svarade: {skalans etikett}", sedan meningen `profilsida.konsekvens`.
5. Primärknapp "Gör hela testet, 50 påståenden" (`/dashboard/tester/personlighet-grund`), textlänk "Till Inför intervjun".

Enda stället smakprovets facit visas.

## 4. Händelser

Alla via `capture()`; `cluster: 'test'` på personlighetsprovets och `'interview'` på intervjuprovets.

| Händelse | När | Egenskaper |
|---|---|---|
| `sample_started` | första svaret i personlighetsprovet | `kind: 'personality'`, `slug` |
| `sample_completed` | resultatet renderas | `kind: 'personality'`, `slug`, `duration_ms` |
| `signup_gate_shown` | direkt efter, om inte inloggad | `kind: 'personality'`, `slug` |
| `signup_started` | klick på kontoknappen | `source_page: '/artiklar/' + slug` eller `'/verktyg/personlighetstest'` |
| `draft_claimed` | lyckat claim | `kind: 'personality'` |
| `interview_hub_viewed` | `/dashboard/intervju` monterad | `prov_count`, `has_profile: 'none' \| 'sample' \| 'full'`, `scope`, `next_action` |
| `interview_practice_started` | första tecknet i steg 2 | `question`, `surface: 'dashboard'` |
| `interview_practice_completed` | resultat i steg 2 | `question`, `level`, `surface: 'dashboard'` |
| `feature_blocked` | kvotraden i läget slut visas | `feature: 'interview_unlimited'`, `scope`, `surface: 'infor-intervjun'` |
| `next_action_shown` | InkPanel på hubben eller hemskärmen renderas | `kind`, `surface: 'infor-intervjun' \| 'hem'` |

Intervjuprovets befintliga event får `question` ur den utökade unionen. Inga `data-cta-position` på panelerna.
`/admin/tratt`: `personality` som eget kluster i sample-tratten, om tratten filtrerar på `kind`.

## 5. API

### POST `/api/public/personlighetsprov`

Begäran: `{ token: string (uuid, klientens), answers: Array<{ id: SmakprovId; value: 1|2|3|4|5 }>, slug?: string }`.

1. Validera: `token` uuid, exakt tjugo svar, alla id i banken, inga dubbletter, värden 1 till 5. Annars 400 `{ error: 'invalid' }`.
2. Idempotens: finns raden med `token` redan, svara 200 med samma synliga svar (så "Försök igen" efter nätverksfel aldrig ger dubbletter).
3. Kvot, bara anonym: `checkIpRateLimit(admin, ip, 'anon_personality', 3)`, vid nej 429 `{ error: 'rate_limited', message: copy.kvot.ip, registerHref: '/register' }`.
   Ingen dygnsbudget (ingen modell). Inloggad: ingen kvot (ren beräkning), men raden får `user_id` och `claimed_by`.
4. `computeScores(SMAKPROV_ITEMS, answers)`. Spara raden: `answers`, `scores`, `ip_hash`, `user_id`, `claimed_by`, `source_slug`, `expires_at` sju dagar.
5. Svara 200:

```json
{
  "token": "uuid",
  "mening": "Det rekryteraren lägger märke till först: hög samvetsgrannhet och låg utåtriktning.",
  "faktorer": [
    { "key": "conscientiousness", "namn": "Samvetsgrannhet", "band": "high", "bandOrd": "Hög", "segment": 5, "lasning": "Rekryteraren ser ..." }
  ],
  "lockedCounts": { "krav": 6, "intervju": 5, "omvanda": 3 },
  "expiresAt": "2026-10-01T12:00:00Z",
  "href": "/dashboard/intervju/profil/uuid"   // bara inloggad
}
```

`segment` = `min(5, max(1, ceil(score / 20)))`. Inga råpoäng, ingen `reverse`, inga kravprofiler i svaret. `faktorer` sorterade på avvikelse från 50, störst först.

### POST `/api/public/personlighetsprov/claim`

Som intervjuprovets claim: inloggad, raden på token, `claimed_by is null` eller samma användare, `expires_at > now()`, sätter `claimed_by`,
`logActivityServer(user.id, 'personality_sample_claimed', ...)`, svarar `{ redirect: '/dashboard/intervju/profil/' + token }`.

### `getInforIntervjunData(supabase, admin, userId)`

Parallellt: (a) `anon_interview_samples` där `claimed_by = userId` eller `user_id = userId`, `relevant` sant (om kolumnen finns, annars alla),
`order created_at desc limit 20`, kolumner `token, question, level, missing_kind, created_at`; (b) `anon_personality_samples` där `claimed_by = userId`,
nyaste, `token, scores, created_at`; (c) `user_personality_profile` för användaren plus senaste slutförda `personality_test_sessions` (`id, test_type, completed_at`);
(d) `checkDailyInterviewQuota(admin, userId)`; (e) scope ur profilen (samma som layouten redan läser, återanvänd summeringen om den finns i servertid).
Tabellerna `anon_*` har RLS utan policies: läs dem med admin-klienten efter egen `claimed_by`/`user_id`-kontroll.

## 6. Lagring, kvot, paket

Tabell:

```sql
create table if not exists public.anon_personality_samples (
  token uuid primary key,
  answers jsonb not null,
  scores jsonb not null,
  ip_hash text not null,
  source_slug text,
  user_id uuid references auth.users (id) on delete set null,
  claimed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists anon_personality_samples_expires_idx on public.anon_personality_samples (expires_at);
create index if not exists anon_personality_samples_claimed_idx on public.anon_personality_samples (claimed_by, created_at);
alter table public.anon_personality_samples enable row level security;

alter table public.anon_interview_samples drop constraint if exists anon_interview_samples_question_check;
alter table public.anon_interview_samples add constraint anon_interview_samples_question_check
  check (question in ('beratta','styrkor','varfor_vi','varfor_jobbet','star','konflikt','misstag'));
```

Kontrollera constraint-namnet i Supabase före migreringen (`select conname from pg_constraint where conrelid = 'public.anon_interview_samples'::regclass`).

Livslängd (beslut 2, rekommendation): vid claim sätts `expires_at` till `null` på både intervju- och personlighetsrader, och rensningen
raderar bara `expires_at < now()`. Då lever "Dina intervjuprov" så länge kontot finns. Görs det inte, visar listan bara sju dagar och
raden i `[token]/page.tsx` "Sparas till {datum}" står kvar.

Kvoter:

| Vem | Intervjuprov | Personlighetsprov | Hela personlighetstestet |
|---|---|---|---|
| Anonym | 1 per IP och dygn (befintligt) | 3 per IP och dygn, scope `anon_personality` | kräver konto |
| Gratis | 1 per dygn, `checkDailyInterviewQuota` (befintligt) | ingen kvot, men visas inte inloggad (länkarna går till hela testet) | grund 1 per dygn (befintligt), fördjupat kräver `tests_above_base` |
| Testveckan, Allt | utan tak (`interview_unlimited`) | som ovan | grund och fördjupat utan tak, arbetsstilsrapport |

Paketet syns på tre ställen och inga fler: sidhuvudets underrad ("Utan tak i Testveckan"), kvotradens textlänk, och profilpanelens metatext om det
fördjupade testet. Ingen betalvägg, ingen bläckyta som säljer, inga lås på sidan. Kom igång-brickan `intervjuprov` läggs i Testveckans och Allts listor.

## 7. Städregel för byggagenten

Produktionsdatabas. Testdata raderas bara per id eller token:
`delete from anon_interview_samples where token = '...'`, `delete from anon_personality_samples where token = '...'`,
`delete from personality_test_sessions where id = '...'`. Aldrig `where created_at > ...`, aldrig `where ip_hash = ...`, aldrig per scope,
aldrig `truncate`. Testkonton tas ur mätdata via `admin_undantagna_konton` som förut. Rate-limit-rader för egen IP nollas per `key`, inte per scope.

## 8. Acceptanskriterier

1. Båda artiklarna och `/verktyg/personlighetstest` visar provet på angiven plats, Pixel 7 och desktop, i Trådens tokens. Inga `neutral-*`, `orange-*` eller hex.
2. SEO-diff (`scripts/seo-diff-artiklar.ts`) på båda artiklarna före och efter: noll ändrade h1/h2/h3, title, description, canonical, FAQ-schema. Provet bidrar inga rubriker.
3. Alla tjugo påståenden ryms på två rader vid 380 px innehållsbredd i display 20/26; panelens höjd är identisk från påstående 1 till 20 (mät `offsetHeight` i DevTools på tre påståenden).
4. Ett fullt prov ger resultat inom 2 sekunder. Nätverkssvaret innehåller inte `reverse`, `dimension`, råpoäng eller kravprofiler.
5. Fjärde provet från samma IP samma dygn: 429, statusraden, skalan dold, kontoknappen.
6. Omladdning mitt i provet (påstående 11) fortsätter på påstående 11 med samma ordning.
7. "Skapa konto gratis" leder till `/register?personlighet={token}`; efter registrering (lösenord och Google) landar användaren på `/dashboard/intervju/profil/{token}` med hela tolkningen, `draft_claimed` med `kind: 'personality'` loggas. Annan användares token ger 404.
8. Tolkningssidan visar exakt tio omvända påståenden och ett konsekvensmått mellan 0 och 5.
9. `/dashboard/intervju`: gratiskonto med ett prov gjort i dag visar kvotraden i läget slut och loggar `feature_blocked`; samma konto dagen efter visar läget kvar; Testveckan-konto visar ingen rad och "Utan tak i Testveckan" i sidhuvudet.
10. Nästa handling på hubben följer rangordningen i avsnitt 3 i alla fyra fallen (verifiera med fyra konton eller genom att ändra data per token).
11. Nytt prov: steg 1 förvalt rekommenderat kort, Fortsätt spärrad utan val med `primaryBlockedReason="Välj en fråga först"`, steg 2 bedömer och landar på `/dashboard/intervju/{token}`. Anonymt POST med `question: 'konflikt'` ger 400.
12. `[token]`-sidan: eyebrow "Inför intervjun", knappen "Öva på nästa fråga" leder till `/dashboard/intervju/ny`, den positiva statusraden sist.
13. Sidomenyn: "Inför intervjun" under Träna med Nyhet, aktiv rad med tråden på `/dashboard/intervju*`. Mobilens bottennav oförändrat.
14. Hemskärmen: efter ett prov på nivå 3 som är över 24 h gammalt visas `interview-rewrite` som Nästa handling; "Senare" avfärdar i sju dagar; aktiviteten visar meningen med länken "Skriv om".
15. Orange per skärm: provet högst 2, hubben desktop högst 3, hubben mobil högst 1. En bläckyta per vy.
16. Tangentbord: skalan som radiogrupp, "Föregående påstående" nås med Skift+Tab, fokusringen accent. Skärmläsare (TalkBack/NVDA): påståendebyte läses, resultatet läses, platshållarrader hoppas.
17. `prefers-reduced-motion`: framstegslinjen och laddningstråden står stilla.
18. CLS 0 på båda artiklarna och verktygssidan före, under och efter provet (`scripts/perf-publikt.ts`). Hubben: LCP under 1,5 s på Pixel 7 (`scripts/perf-inloggat.ts`), ingen klientrundtur efter mount utom eventen.
19. Cron 00:00: utgångna rader i `anon_personality_samples` raderas; claimade rader (`expires_at null`) rörs aldrig.
20. Kom igång för ett Testveckan-konto visar brickan "Intervjuprovet, utan tak" och kvitterar den efter ett prov.

## 9. QA i riktig webbläsare (före "klart")

Bygg och kör som intervjuprov-specen: `npx next build && npx next start -p 8300`. Chrome med Pixel 7-emulering (412 × 915, DPR 2) och desktop 1280 × 800.
Ny inkognitosession per genomgång. Skärmdumpar till `docs/qa/qa-rod-trad-prov/`, namn `pixel7-{steg}-{namn}.png` och `desktop-{steg}-{namn}.png`.
Avvikelser i `docs/qa/qa-rod-trad-prov-<datum>.md` med steg, förväntat, faktiskt, och rättas innan något kallas klart.

Hela kedjan anonym till betalande, i den här ordningen, på Pixel 7, sedan i kortform på desktop:

1. Öppna `/artiklar/personlighetstest-jobb-guide`, scrolla till provet. Dump: första läget med rubriken före och efter synlig.
2. Tryck "Stämmer helt" på påstående 1. Dump: påstående 2, framstegslinjen, ingress borta.
3. Svara till påstående 11, ladda om sidan. Dump: påstående 11 med samma ordning.
4. Tryck "Föregående påstående". Dump: påstående 10 med valet markerat.
5. Svara klart. Dump under räkningen (fånga inom en sekund), sedan resultatet: hela panelen och spärren i en bild.
6. DevTools: nätverkssvaret. Dump: inga låsta fält.
7. "Gör om provet". Dump: inbjudan igen. Gör provet en gång till med bara "Varken eller". Dump: den jämna profilens mening.
8. Ny inkognito: fyra prov. Dump: statusraden vid 429.
9. Tillbaka till det första provet (token i sessionStorage), "Skapa konto gratis", registrera med lösenord. Dump: landningen på tolkningssidan, alla fyra sektioner.
10. Logga ut, logga in med annat konto, öppna samma URL. Dump: 404.
11. Som det nya kontot: gå till `/artiklar/styrkor-svagheter-intervju`, gör intervjuprovet. Dump: landningen på `[token]` med den nya eyebrown, knappen och statusraden. Tryck "Öppna" i raden.
12. `/dashboard/intervju`: Dump: hela sidan (fullPage) i läget gratis, dagens prov gjort, smakprovsprofil. Kontrollera `feature_blocked` i PostHog.
13. Sidomenyn (hamburgaren på mobil): Dump: Inför intervjun med Nyhet och tråden.
14. "Nytt intervjuprov": Dump steg 1 (rekommenderat kort), välj "Berätta om dig själv", Fortsätt. Steg 2: klistra in ett svar på 300 tecken, Bedöm. Dump: 429 (kvoten är slut i dag) med "Se Testveckan".
15. Tryck "Se Testveckan", köp Testveckan med Stripes testkort. Dump: kvittot på hemskärmen.
16. Tillbaka till `/dashboard/intervju`: Dump: ingen kvotrad, "Utan tak i Testveckan". Gör nytt prov på "Berätta om dig själv" och ett till på "Ett misstag". Dump: listan med tre prov.
17. Profilpanelen: tryck "Gör hela testet, 50 påståenden", gör grundtestet klart. Tillbaka: Dump: panelen i läget riktig profil med arketyp, tal och tre länkar.
18. Hemskärmen dagen efter (eller flytta `created_at` på en rad per token bakåt 25 h): Dump: Nästa handling `interview-rewrite`, aktivitetsmeningen. Tryck "Senare". Dump: nästa i rankningen.
19. Reduced motion på: Dump under räkningen och under ett påståendebyte.
20. Tab-runda på desktop: skalans fem alternativ, "Föregående påstående", kontoknappen, "Gör om provet"; på hubben: Nytt intervjuprov, bläckytans knapp och länk, "Öppna", "Se Testveckan", profilpanelens länkar. Dump av varje fokusring.
21. TalkBack (eller NVDA på desktop): påstående 1 till 3 och resultatet. Anteckna vad som läses.
22. PostHog: `sample_started/completed`, `signup_gate_shown` (`kind: 'personality'`), `signup_started`, `signup_completed`, `draft_claimed`, `interview_hub_viewed`, `interview_practice_*`, `feature_blocked`, `subscription_paid`. Dump av eventlistan. Sedan: testkontot in i `admin_undantagna_konton`, testraderna raderade per token (avsnitt 7), prenumerationen avslutad i Stripe test.
23. SEO-diff och `perf-publikt.ts` på båda artiklarna och verktygssidan, `perf-inloggat.ts` på hubben. Bifoga utskrifterna.

## 10. Ordning: vad byggs först

Fyra vågor, en agent i taget, QA-steg efter varje våg i stället för allt sist.

1. **Inför intervjun, kärnan.** `fragor.ts` (sju frågor), migreringen (check-constraint), route-spärren för anonyma, `getInforIntervjunData`, sidan, `ProvRad`, `ProfilPanel` (alla tre lägen), `ny/` med `Intervjuprov laege="flode"`, ändringarna på `[token]`-sidan, sidomenyn med ikonen, copyfilen, eventen. Beslut 2 om livslängd genomförs här. QA steg 11 till 16 med befintliga intervjuprov.
2. **Personlighetsprovet.** Datafilerna, komponenten, API och claim, claim-kedjan i register-form, tolkningssidan, tabellen, cron-städningen. Montering på `/verktyg/personlighetstest` först (egen sida, lätt att QA:a), sedan i de två artiklarna med SEO-diff. QA steg 1 till 10, 17.
3. **Tråden utanför sidan.** `getSummary`-fälten, Nästa handling på hemskärmen, aktivitetsmeningarna, Kom igång-brickan, länkarna från rekryteringstester-sidan och artiklarna. QA steg 18 till 20.
4. **Mätning och städning.** Tratten i admin, PostHog-kontroll, perf-mätning, QA-rapporten, plan-content-raden, testdata bort per token.

## 11. Öppna beslut för ägaren

1. **Sidans namn och adress.** Förslag: "Inför intervjun" på `/dashboard/intervju`. Alternativ "Intervjuträning". Namnet styr menyetikett, eyebrow, brickan och tre copysträngar.
2. **Livslängd efter claim.** Förslag: claimade rader (intervju och personlighet) blir permanenta (`expires_at null`). Annars är "Dina intervjuprov" en sjudagarslista och landningssidans "Sparas till" står kvar.
3. **Stabilitet som femte faktor.** Förslag: visa "Stabilitet" (100 − särbarhet) i allt nytt och i hubbens profilpanel, medan de befintliga resultatsidorna behåller "Känslomässig särbarhet" tills de ses över. Alternativ: motorns namn överallt.
4. **Landningen efter intervjuprovets claim.** Förslag: `[token]`-sidan kvar som landning (beslut 1 i förra specen) med ny knapp "Öva på nästa fråga" och statusraden mot hubben. Alternativ: landa direkt på hubben med provet överst.
5. **Frågorna.** De fem nya lydelserna och deras ordning i `FRAGOR` (rekommendationen tar första ogjorda i den ordningen). Ska "Berätta om dig själv" stå först?
6. **Kravprofilerna.** Sex namn och regler i designfilen. Ska någon bytas (till exempel "Skola och utbildning" i stället för "Lager, produktion och drift")?
7. **Prissidans förval.** Textlänken "Se Testveckan" ska landa med Testveckan förvald; bekräfta parameternamnet i köpvägen.
8. **Nyhet-etiketten.** Fyra veckor från release, som Sökta tjänster. Datum skrivs i koden.
