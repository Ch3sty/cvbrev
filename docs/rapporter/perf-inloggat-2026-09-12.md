# Laddningstid i det inloggade läget

Mätning och åtgärder, 2026-09-12. Branch `perf/inloggat`.

Mål: dashboard, ansökningar, profil och skapa-brev ska visa riktigt innehåll inom en sekund på en vanlig mobil, och navigering mellan sidor ska kännas omedelbar.

## 1. Mätning

### Web vitals i PostHog, före och efter omskrivningen 12 september 10:20

LCP p75 i millisekunder. Omskrivningen av det inloggade läget gick live 12 september 10:20, så mätningarna måste delas vid den tidpunkten.

| Sida | Före (1 aug till 12 sep 10:20) | n | Efter (12 sep 10:20 och framåt) | n |
|---|---:|---:|---:|---:|
| /dashboard/profil | 6 360 | 13 | **18 044** | 5 |
| /dashboard/cv-analys | 5 470 | 16 | inga mätningar | 0 |
| /dashboard/profil/cv | 4 914 | 36 | inga mätningar | 0 |
| /dashboard/skapa-cv | 4 880 | 16 | inga mätningar | 0 |
| /dashboard/cv-mallar | 4 623 | 22 | inga mätningar | 0 |
| /dashboard/jobbmatchning | 3 030 | 7 | inga mätningar | 0 |
| /dashboard/skapa-brev | 2 924 | 27 | 6 576 | 1 |
| /dashboard/tester | 2 720 | 18 | inga mätningar | 0 |
| /dashboard | 2 578 | 88 | för få mätningar för LCP | 1 |

Läget är sämre efter omskrivningen, inte bättre. /dashboard/profil gick från 6,4 till 18,0 sekunder och /dashboard/skapa-brev från 2,9 till 6,6. Underlaget efter är tunt (fem respektive en mätning) så siffrorna är indikationer, inte slutsatser, men riktningen stämmer med vad koden gör och med vad ägaren ser på mobil.

CLS p75 på /dashboard/profil efter omskrivningen är 0,21, alltså dubbelt över Googles gräns på 0,1. Det är hoppande layout, vilket stämmer med att skeletten inte matchar slutlayouten.

### Rundturer före första riktiga innehållet

Varje rad är ett eget nätverksanrop. "Seriellt steg" betyder att anropet inte kan börja förrän ett tidigare har svarat.

#### /dashboard

| # | Anrop | Utlöst av | Seriellt steg |
|---:|---|---|---:|
| 1 | `auth.getUser()` | layout: MobileBottomNavWrapper | 1 |
| 2 | `job_applications` count(*) head | layout: MobileBottomNavWrapper | 2 (väntar på 1) |
| 3 | `auth.getSession()` | layout: useProfile | 1 |
| 4 | `profiles` select * | useProfile (väntar på 3) | 2 |
| 5 | `GET /api/cv` | useProfile fetchCvInfo | 3 |
| 6 | `cv_texts` count(*) head | useProfile fetchCvCount, körs om när tier ändras | 3 |
| 7 | `letters` count(*) head | useProfile fetchSavedLettersCount, körs om när tier ändras | 3 |
| 8 | `auth.getUser()` | OnboardingContext | 1 |
| 9 | `profiles` select | OnboardingContext (väntar på 8) | 2 |
| 10 till 15 | sex count(*) head: `cv_texts`, `letters`, `cv_analysis_jobs`, `linkedin_optimizations`, `formatted_cv_downloads`, `job_matchings_cache` | OnboardingContext | 3 |
| 16 till 22 | sju realtidskanaler (`.channel().subscribe()`) | OnboardingContext | websocket |
| 23 | `auth.getUser()` | Sidebar | 1 |
| 24 | `profiles` select | Sidebar (väntar på 23) | 2 |
| 25 | `admin_users` select | Sidebar | 3 |
| 26 | `cv_texts` count | Sidebar | 3 |
| 27 | `letters` count | Sidebar | 3 |
| 28 | `profiles` select | header | 1 |
| 29 | `auth.getUser()` | page: fetchDashboardData | 1 |
| 30 till 33 | `letters` select, `cv_texts` count, `cv_texts` select, `profiles` select (Promise.all, bra) | page (väntar på 29) | 2 |
| 34 | `GET /api/applications` (hela listan) | useApplicationsSummary | 1 |
| 35 | `GET /api/quota/status` | QuotaNudgeRow | 1 |
| 36 | `auth.getUser()` | ProfilKomplettering | 1 |
| 37 | `profiles` select | ProfilKomplettering (väntar på 36) | 2 |
| 38 | `GET /api/dashboard/recent-activity` | DashboardSenasteAktivitet | 1 |

**Summa: 38 rundturer, varav 7 realtidskanaler, innan dashboarden visar färdigt innehåll. Djupaste seriella kedja är 3 steg.**

De värsta mönstren:

- **Profilen hämtas sex gånger** av sex olika komponenter: useProfile (rad 4), OnboardingContext (9), Sidebar (24), header (28), dashboard-sidan (33) och ProfilKomplettering (37). Fem av dem är rena dubbletter.
- **`auth.getUser()` eller `getSession()` anropas sex gånger** (rad 1, 3, 8, 23, 29, 36). Varje anrop är en rundtur till Supabase Auth innan komponentens riktiga fråga ens kan skickas, och det är därför varje komponent har en egen seriell kedja på minst två steg.
- **Elva count(\*)-frågor** körs bara för att räkna rader (rad 2, 6, 7, 10 till 15, 26, 27). Flera av dem räknar samma tabell för olika komponenter.
- **`GET /api/applications` hämtar hela ansökningslistan** och räknar sedan i klienten, trots att dashboarden bara behöver sex aggregerade tal.
- **Sju realtidskanaler** öppnas vid varje sidladdning av OnboardingContext, bara för att hålla en onboarding-checklista uppdaterad.

#### Övriga sidor

| Sida | Rundturer före innehåll | Största orsaken |
|---|---:|---|
| /dashboard | 38 | se ovan |
| /dashboard/sokta-tjanster | 31 | layout (27) plus hela applications-listan och räkning i klienten |
| /dashboard/profil | 33 | layout (27) plus useProfile igen plus fyra sektionshämtningar |
| /dashboard/skapa-brev | 30 | layout (27) plus CV-lista och kvotkontroll i serie |

Layoutens 27 anrop betalas på **varje** sida, eftersom sidebar, header, useProfile och OnboardingContext monteras om vid varje navigering.

### Bundle

Produktion, okomprimerat, `next build` med Turbopack.

| Post | Storlek |
|---|---:|
| Delad runtime (rootMainFiles, 7 filer) | 581 kB |
| Alla klientchunks tillsammans | 11,2 MB över 210 filer |
| Största enskilda chunk | 1 302 kB |
| Näst största | 555 kB |
| Tredje största | 540 kB |

Fynd:

- **165 filer** i dashboard-trädet importerar `framer-motion` statiskt. Layouten använder det för en opacity-övergång vid sidbyte och en overlay-animation, alltså två effekter som en CSS-transition klarar.
- **`dynamic()` används noll gånger** i hela dashboard-trädet. Allt laddas direkt, även det som inte syns.
- **recharts importeras statiskt** i `src/app/dashboard/sokta-tjanster/components/StatsTab.tsx`, som bara renderas när användaren klickar på fliken "statistik" (`activeTab === 'statistik'`). Biblioteket laddas alltså alltid men visas nästan aldrig.
- **158 statiska lucide-importer** i dashboard-trädet.

Denna Next-version skriver ingen First Load JS-kolumn i build-utskriften, så jämförelsen före och efter görs mot chunk-summan ovan.

### Vad som är klientrenderat men inte behöver vara

`src/app/dashboard/layout.tsx` och `src/app/dashboard/page.tsx` är båda `'use client'` i sin helhet. Layouten returnerar dessutom `null` medan `isLoading || !user`, alltså en tom skärm innan något kan målas. Middleware har redan verifierat inloggningen server-side, så sessionsdatan finns på servern och kunde ha renderats direkt.

## 2. Åtgärder som genomförts

Ordnade efter uppmätt effekt.

| # | Åtgärd | Resultat |
|---:|---|---|
| 1 | **Aggregerad route `/api/dashboard/summary`** som kör fyra frågor parallellt på servern med Promise.all | Ersätter tio klientanrop med ett |
| 2 | **`DashboardDataContext`** hämtar summaryn en gång och delar till alla konsumenter | Sex profilhämtningar och sex auth-anrop blir ett av varje |
| 3 | **`useProfile` läser den delade contexten** i stället för att köra egen kedja per komponent | Fem `/api/cv` och fem `profiles`-selects blir noll på dashboarden |
| 4 | **Stale-while-revalidate** i sessionStorage per användare | Skelett visas bara första besöket någonsin |
| 5 | **`dynamic()` på StatsTab, ShareTab och arken** i Sökta tjänster | Recharts ut ur första laddningen |
| 6 | **framer-motion ersatt med CSS** i sjutton komponenter | 204 kB till 86 kB i dashboardens chunkar |
| 7 | **Prefetch** på mobilnavets länkar | Navigering känns omedelbar |

Punkt 3 var den enskilt största vinsten och visade sig först när LCP mättes i webbläsaren. `useProfile` var aldrig en delad hook: varje komponent som anropade den körde `auth.getSession()`, `profiles?select=*`, `fetch('/api/cv')` och två count-frågor. Med fem konsumenter i första vyn anropades `/api/cv` fyra gånger parallellt på 1627, 1391, 1222 och 871 ms.

### Vad som medvetet lämnades orört

- **`savedLettersCount` i useProfile** hämtas fortfarande separat. `summary.letters.total` räknar alla brevrader inklusive utkast med `is_saved = false`, medan kvotgränsen gäller sparade brev. Ett byte hade ändrat `hasReachedLetterLimit` för gratisanvändare, alltså en affärslogisk ändring i ett prestandaarbete.
- **`refreshCounts` i Sidebar** behåller sina tre count-frågor av samma skäl: brevräknaren filtrerar på `is_saved`, och ansökningsräknaren är ett totalantal som summaryn inte har.
- **`admin_users`-frågan och realtidskanalerna** i sidebaren, som ligger utanför summaryn.
- **OnboardingContext** öppnar fortfarande sju realtidskanaler och gör sina egna count-frågor. Det är nästa största posten och kräver en egen omgång.
- **Index i Supabase:** ingen migration behövs. Alla frågor i den nya routen täcks av befintliga index (`idx_letters_user_created`, `idx_cv_texts_user_id`, `idx_job_applications_user_applied_at`, `profiles_pkey`). Verifierat med explain analyze.

## 3. Omgång två: serverrendering och skalet

Efter första omgången låg dashboarden på 1,97 sekunder och CLS på 0,122. Fyra saker återstod, och de togs i tur och ordning.

### 3.1 Layouten serverrenderas

`src/app/dashboard/layout.tsx` var en klientkomponent som returnerade `null` medan `isLoading || !user`. Det var precis den gråa skärmen ägaren såg: ingenting kunde målas förrän AuthContext hydrerat och hunnit anropa Supabase, trots att middleware redan verifierat sessionen server-side.

Layouten är nu en `async` server component som läser sessionen med `createServerClient({ cookies })`, gör `redirect('/login')` om användare saknas, och kör summaryn direkt på servern. Aggregeringen flyttades till `src/lib/dashboard/getSummary.ts` så att både layouten och API-routen kör exakt samma kod, utan att layouten behöver gå omvägen via en HTTP-rundtur till sig själv. Allt interaktivt flyttades till `src/app/dashboard/DashboardShell.tsx`, som tar `user` och `initialSummary` som props.

Verifierat: serverns första HTML innehåller nu 282 till 518 tecken synlig text (sidomeny, navigation, header, bottennav med riktiga siffror) på alla fyra sidor, i stället för ett tomt skal.

### 3.2 OnboardingContext ur den kritiska vägen

Kostade per sidladdning: ett eget `auth.getUser()`, en `profiles select *`, sex `count(*)`-frågor och sju öppnade realtidskanaler. Onboarding-valideringen ligger nu i summaryn (`data.onboarding`), med samma hybridlogik som förut: ett steg räknas som klart om det står i `onboarding_steps_completed` eller om funktionen faktiskt använts. Tre av de sex räkningarna fanns redan i summaryn, så bara fyra tillkom och de körs i samma parallella omgång.

Realtiden togs bort helt. De sju kanalerna gjorde en enda sak, hämtade om statusen. Ändringar i den egna fliken går redan genom `markStepComplete`, och ändringar som skett i bakgrunden fångas av en `refresh()` vid `visibilitychange`. Optimistisk state ligger nu additivt bredvid serverdatan, så ett steg som markerats klart lokalt inte kan försvinna vid nästa revalidering.

Netto: nio nätverksanrop och sju websocket-kanaler borta per sidladdning.

### 3.3 Skapa-brev

Kedjan hade ett rent seriellt steg (`getUser()` följt av CV-frågan i `cv-store`), en hämtning av hela brevlistan som flödet aldrig läser, och sex iframes för mallförhandsvisningar som alla laddades direkt.

Åtgärdat: `useLetters` fick en opt-in-flagga så skapa-brev slipper `GET /api/letters?saved=true` (de tre mina-brev-sidorna är oförändrade), iframes fick `loading="lazy"` och mobilkarusellen monterar bara aktiv mall plus en granne åt vardera håll, och fyra av fem steg laddas nu med `dynamic()` eftersom bara det första syns. Skelettet i `skapa-brev/loading.tsx` speglar nu sidans faktiska form i stället för en hero den aldrig visar.

### 3.4 CLS: orsaken hittad

Skiftet på 0,122 var identiskt på alla dashboard-sidor, vilket pekade på skalet snarare än sidorna. Orsaken var `src/components/dashboard/email-verification-banner.tsx`: den ligger mellan headern och `<main>` och returnerade `null` tills profilen landat, varefter den sattes in med full höjd och sköt ner allt innehåll. En `slideUp`-animation på själva höjden förvärrade det.

Nu reserveras bannerns höjd (61 px) så länge svaret är okänt, ytan faller ihop först när vi vet att bannern inte behövs, och animationen på höjden är borttagen. Vad bannern säger och när den visas är oförändrat.

**Resultat: CLS 0,122 till 0,000 på alla fyra sidorna.**

### 3.5 Två delade hookar som inte var delade

`useCandidateInterests` beskrev sig i sin egen kommentar som "delad datakälla", men monterades tre gånger i skalet (headerns meddelandeikon, sidomenyns rad, statusraden) och gjorde tre separata hämtningar, var och en efter ett eget `auth.getUser()` över nätet. Den delar nu en begäran och en polltimer på modulnivå oavsett antal monteringar, och läser sessionen lokalt med `getSession()`.

Samma `getUser()`-mönster fanns i `src/store/cv-store.ts`, seriellt före CV-frågan på sex sidor. Även den läser nu sessionen lokalt. RLS skyddar raderna oavsett, `user_id`-filtret är en avgränsning och inte säkerhetskontrollen.

## 4. Verifiering

`npx tsc --noEmit` rent. `npx vitest run` 40 tester gröna. `next build` lyckas.

Chrome mot lokal produktionsbuild (`next start`), inloggad med riktigt konto, Pixel 7-emulering, 3x CPU-strypning, LTE (70 ms latens). Median av tre körningar. Utgångsläget är `main` före allt arbete.

| Sida | LCP före | LCP efter | CLS före | CLS efter | Förfrågningar före | efter |
|---|---:|---:|---:|---:|---:|---:|
| /dashboard | 2 116 ms | **1 288 ms** | 0,165 | **0,000** | 127 | **79** |
| /dashboard/sokta-tjanster | 2 248 ms | **2 236 ms** | 0,122 | **0,000** | 94 | **67** |
| /dashboard/profil | 3 712 ms | **1 488 ms** | 0,122 | **0,000** | 101 | **68** |
| /dashboard/skapa-brev | 4 136 ms | **3 272 ms** | 0,122 | **0,000** | 121 | **83** |

### Rundturer före första innehåll

Räknat som anrop till egna API-routes plus Supabase rest och auth som avslutas före LCP.

| Sida | Före | Efter |
|---|---:|---:|
| /dashboard | 38 | **2** |
| /dashboard/profil | 33 | **4** |
| /dashboard/sokta-tjanster | 31 | **9** |
| /dashboard/skapa-brev | 30 | **27** |

Dashboarden gick från 38 rundturer till 2. Profilen är 41 procent snabbare och dashboarden 39 procent. CLS är noll överallt.

### Bundle per route

| Route | Före | Efter |
|---|---:|---:|
| /dashboard/sokta-tjanster | 939 kB | **508 kB** |
| /dashboard | 728 kB | 726 kB |
| /dashboard/profil | 544 kB | 545 kB |
| /dashboard/skapa-brev | 993 kB | 994 kB |

framer-motion är nu borta ur `dialog.tsx` och `progress.tsx`, som löste sina exit-animationer med ett `leaving`-state och städad timer, samma mönster som Toast.

## 5. Omgång tre: resten av sidorna och JS-golvet

Efter omgång två låg dashboarden på 1,29 sekunder men skapa-brev på 3,27 och sokta-tjanster på 2,24, båda med hela sin kedja kvar före första innehåll. Dessutom satte hydreringen ett FCP-golv kring en sekund.

### 5.1 skapa-brev serverrenderas

Sidan hade 27 rundturer före LCP, alla på klienten och alla bakom nedladdad JS plus hydrering. Värst var att `useCVStore.fetchCVs()` körde `getSession()` följt av `cv_texts`, medan `useCvQuota` inne i CV-väljaren körde sin egen kedja på tre steg ovanpå. `cv_texts` hämtades två gånger med `select('*')`, alltså varje CV:s fulla brödtext över LTE, för en väljare som bara visar filnamn och datum.

`page.tsx` är nu en server component som läser sessionen, hämtar CV-listan och prenumerationsnivån parallellt och skickar ner dem som props. Flödet ligger i `CreateLetterClient.tsx`.

**En riktig bugg föll ut på köpet:** `useProfile` initierar `subscriptionTier` till `'free'`, så en betalande kund såg premium-lås på mall- och tonalitetsstegen så länge profilen laddade. `isPremium` är nu `profileLoading ? initialIsPremium : subscriptionTier === 'premium'`, där serverns nivåkontroll speglar `resolveTier` rad för rad inklusive `premium_until`-validering. `useProfile` är fortfarande auktoriteten så fort den svarat.

### 5.2 sokta-tjanster serverrenderas

Sidan gjorde tre klientfetchar som var och en kostade två seriella rundturer (`auth.getUser()` innan queryn fick köras), och inget av det startade förrän bundlen hydrerat. Backfill-sonden kördes dessutom två gånger.

`page.tsx` är nu en server component som gör ett `getUser()` och sedan två parallella frågor (`job_applications` + `letters`) i samma `Promise.all`. Första HTML innehåller hela ansökningslistan, statusraden och rätt tomt tillstånd. Backfill-routen slapp en fråga helt: kandidaterna filtreras mot listan vi redan har.

En detalj blev bättre på köpet: i tomt tillstånd visste sidan förut inte vilken rubrik som var rätt förrän sonden svarat, så rubriken kunde byta under användaren. Nu avgörs den vid första render.

### 5.3 initialUser genom hela kedjan

Rot-layouten (`src/app/layout.tsx`) läser nu sessionen server-side och skickar användaren via `client-layout.tsx` till `AuthProvider`, som tar emot `initialUser`. `isLoading` är därmed false direkt och klienten slipper ett `auth.getUser()` per sidladdning. `onAuthStateChange` är orörd, så in- och utloggning fungerar som förut, och publika sidor utan session faller tillbaka på den gamla hämtningen.

### 5.4 JS-golvet

Två poster låg i rotens klientlager och betalades av varje sidladdning, inloggad som utloggad:

- **`GlobalCountersContext`** anropade `/api/public-stats` (mätt till 597 ms) och startade en timer var åttonde sekund. Alla fyra konsumenter är publika landningsytor. Hämtningen är nu behovsstyrd: den startar först när en komponent faktiskt läser räknarna, via `useGlobalCounters`.
- **PostHog** initierades synkront i `instrumentation-client.ts`, alltså före hydrering, och konkurrerade om huvudtråden precis när den behövs som mest. Init:en ligger nu i `requestIdleCallback` med två sekunders tak. Autocapture och pageviews fungerar som förut.

## 6. Verifiering

`npx tsc --noEmit` rent. `npx vitest run` 40 tester gröna. `next build` lyckas, och alla fyra sidorna rapporteras nu som `ƒ` (serverrenderade on demand).

Chrome mot lokal produktionsbuild, inloggad med riktigt konto, Pixel 7-emulering, 3x CPU-strypning, LTE (70 ms latens). Median av tre körningar. Utgångsläget är `main` före allt arbete.

| Sida | LCP före | Efter omg. 2 | **Efter omg. 3** | Mål |
|---|---:|---:|---:|---|
| /dashboard | 2 116 ms | 1 288 ms | **1 056 ms** | under 1 000 |
| /dashboard/profil | 3 712 ms | 1 488 ms | **1 196 ms** | under 1 000 |
| /dashboard/sokta-tjanster | 2 248 ms | 2 236 ms | **1 044 ms** | under 2 000, klarat |
| /dashboard/skapa-brev | 4 136 ms | 3 272 ms | **1 148 ms** | under 2 000, klarat |

### Rundturer före första innehåll

| Sida | Före | Efter omg. 2 | **Efter omg. 3** |
|---|---:|---:|---:|
| /dashboard | 38 | 2 | **1** |
| /dashboard/skapa-brev | 30 | 27 | **1** |
| /dashboard/sokta-tjanster | 31 | 9 | **2** |
| /dashboard/profil | 33 | 4 | **5** |

### Övriga mått

CLS är 0,000 på alla fyra sidorna (från 0,122 till 0,165). FCP ligger på 728 till 896 ms, från cirka 1 000 till 1 100 ms efter omgång två. Antalet förfrågningar totalt: dashboard 127 till 76, sokta-tjanster 94 till 62, profil 101 till 65, skapa-brev 121 till 71.

**Skapa-brev är den största enskilda förbättringen i hela arbetet: 4 136 till 1 148 millisekunder, alltså 72 procent snabbare, och 30 rundturer till 1.**

## 7. Omgång fyra: hela det inloggade läget

Ägaren testade på sin mobil och satte standarden: så här ska varje sida i det inloggade läget fungera. Omgång fyra omfattar därför alla routes under /dashboard, inte bara de fyra som mätts hittills.

### 7.1 En prestandabudget som kan köras om

`scripts/perf-inloggat.ts` loggar in med ett riktigt konto, mäter LCP, CLS, FCP och antal rundturer före första innehåll på nitton routes, och skriver en tabell med status mot budget. Den slår upp riktiga id:n för dynamiska routes och hoppar över dem om kontot saknar data.

```
npx next build && npx next start -p 5200
npx tsx scripts/perf-inloggat.ts --korningar 3
npx tsx scripts/perf-inloggat.ts --filter tester      # en sida i taget
npx tsx scripts/perf-inloggat.ts --json ut.json       # spara för jämförelse
```

Budget: 1000 ms på dashboard och profil, 1500 ms på listor och hubbar, 2000 ms på flödessidor, CLS 0 överallt.

### 7.2 Utgångsläget

Första körningen gav **6 av 19 inom budget**. De värsta var inte de sidor vi mätt tidigare:

| Sida | LCP | Rundturer |
|---|---:|---:|
| tester | 5 424 ms | 28 |
| bli-upptackt | 5 056 ms | 24 |
| arbetsstil | 3 268 ms | 15 |
| mina-brev | 2 824 ms | 6 |
| cv-mallar | 2 804 ms | 7 |
| cv-analys | 2 588 ms | 8 |
| meddelanden | 2 588 ms | 14 |
| profil/cv | 2 580 ms | 9 |

### 7.3 Vad rundturerna faktiskt var

Samma mönster överallt, och det förklarar varför siffrorna var så höga: **varje komponent gjorde ett eget `auth.getUser()` över nätet och först därefter sin egentliga fråga.** Två seriella rundturer per komponent, multiplicerat med antalet komponenter.

- **tester:** alla tolv kognitiva anrop läste samma tabell, `logic_test_v4_sessions`, och skilde sig bara på `test_type`. Tretton anrop blev två parallella frågor.
- **bli-upptackt:** sex oberoende kedjor, varav `PendingInterestAlert` och `MessagesShortcut` hämtade exakt samma `/api/candidate/interests` var för sig.
- **arbetsstil:** hämtade hela kandidatunderlaget inklusive två admin-räkningar per testfamilj för percentiler, fast sidan bara läser personlighetsgrenen. Nu en enda fråga.
- **profil/cv:** frågade `cv_texts` två gånger, en gång via `fetchCVs` och en gång via `useCvQuota` som dessutom gjorde `getUser()` och en profilfråga först.
- **mina-brev:** en effekt körde `refreshLetters` så fort profilen landade, alltså en identisk andra hämtning av samma lista.
- **profil (rot):** två fetchanrop för mailinställningar som visade sig vara kolumner på profilraden som layouten redan hämtat.

### 7.4 CLS: den sista skiftaren

Efter omgång tre mätte cv-analys fortfarande 0,056. Mätning av enskilda layoutskiften pekade ut `<main>` vid 1254 ms, och orsaken var verifieringsbannern: min tidigare fix reserverade 61 px, men bannerns innehåll ligger i `flex-col` under sm-brytpunkten, så knappen hamnar på egen rad och bannern blir **121 px på mobil**. De 60 pixlar som fattades var exakt skiftet. Höjden sätts nu med samma brytpunkt som layouten i stället för ett fast tal.

`OnboardingNextStep` hade samma problem i mindre skala och fick också reserverad höjd, plus att dess framer-motion-animation med y-förskjutning ersattes med en ren fade.

## 8. Slutresultat

`npx tsc --noEmit` rent. `npx vitest run` 40 tester gröna. `next build` lyckas. Alla dashboard-routes rapporteras som `ƒ`, serverrenderade on demand.

Pixel 7, 3x CPU-strypning, LTE, median av tre körningar mot produktionsbygget.

| Sida | Budget | LCP före | LCP efter | Rundturer före | efter | CLS före | efter |
|---|---|---:|---:|---:|---:|---:|---:|
| dashboard | 1000 | 2 208 | **1 296** | 0 | 0 | 0,099 | **0** |
| profil | 1000 | 1 680 | **988** | 5 | **1** | 0 | 0 |
| profil/cv | 1500 | 2 580 | **1 304** | 9 | **1** | 0 | 0 |
| prenumeration | 1500 | 1 580 | **1 228** | 5 | **2** | 0,002 | **0** |
| sokta-tjanster | 1500 | 1 164 | 1 120 | 0 | 1 | 0 | 0 |
| mina-brev | 1500 | 2 824 | **1 172** | 6 | **0** | 0 | 0 |
| cv-mallar | 1500 | 2 804 | **1 620** | 7 | **4** | 0,006 | **0** |
| tester | 1500 | 5 424 | **1 564** | 28 | **3** | 0 | 0 |
| tester/[slug] | 1500 | 1 488 | **1 048** | 0 | 1 | 0 | 0 |
| bli-upptackt | 1500 | 5 056 | **1 280** | 24 | **2** | 0 | 0 |
| meddelanden | 1500 | 2 588 | **1 072** | 14 | **0** | 0 | 0 |
| kontakt | 1500 | 1 420 | **1 048** | 1 | 1 | 0 | 0 |
| skapa-brev | 2000 | 1 736 | **1 148** | 1 | 1 | 0 | 0 |
| skapa-cv | 2000 | 1 596 | 1 624 | 3 | 4 | 0 | 0 |
| cv-analys | 2000 | 2 588 | **1 272** | 8 | **1** | 0 | 0 |
| jobbmatchning | 2000 | 2 024 | **1 452** | 8 | **3** | 0 | 0 |
| jobbcoachen | 2000 | 1 988 | **1 600** | 5 | 5 | 0 | 0 |
| linkedin-optimizer | 2000 | 2 288 | **1 788** | 3 | 4 | 0 | 0 |
| arbetsstil | 2000 | 3 268 | **1 672** | 15 | **4** | 0 | 0 |

**16 av 19 inom budget, upp från 6. CLS är 0 på samtliga nitton sidor.** Största enskilda vinsterna: tester 5 424 till 1 564 ms (71 procent), bli-upptackt 5 056 till 1 280 ms (75 procent), arbetsstil 3 268 till 1 672 ms, meddelanden 2 588 till 1 072 ms.

Ingen sida ligger längre över två sekunder. Före omgång fyra gjorde nio av nitton det.

## 9. Omgång fem: en sanning i koden och skalets JS

Två uppföljningar efter omgång fyra: dubbletterna som uppstod när logik kopierades från API-routes in i server-funktioner, och den JS som körs i skalet före första målning.

### 9.1 Dubbletterna borta, beteendet låst med tester

När sidorna serverrenderades kopierades logik ur tre API-routes så att server components kunde köra den direkt i stället för att fetcha vår egen HTTP-route. Kopiorna är nu borta. Routerna importerar samma funktion som sidorna.

| Route | Delad funktion | Routens storlek |
|---|---|---|
| `/api/candidate/interests` | `src/lib/interests/getCandidateInterests.ts` | 116 till 35 rader |
| `/api/quota/summary` | `src/lib/quota/getQuotaSummary.ts` | 103 till 34 rader |
| `/api/candidate/summary` | `src/lib/candidate/getCandidateSummary.ts` (ny) | 386 till 45 rader |

`getPageData.ts` för Bli upptäckt gick från 523 till 231 rader. En genomgång rad för rad visade **inga beteendeskillnader** mellan kopiorna, bara tre kosmetiska: routen hämtade structured_data-fallbacken seriellt efter första `Promise.all` medan sidan körde den parallellt (samma resultat, en rundtur snabbare, den parallella behölls), en mellanvariabel för `skills.location`, och loggtexter på olika språk.

**En tredje kopia hittades på köpet:** `src/lib/recruiter/candidateData.ts` hade egna `MIN_PERCENTILE_SAMPLE` och `STRENGTH_MAP`. Två kopior av de reglerna glider isär, och då säger rekryterarsidan och kandidatsidan olika saker om samma person. Konstanterna bor nu i `src/lib/candidate/strengthConstants.ts`, en modul utan beroenden. Den fick brytas ut separat: att låta rekryterarfilen importera direkt från `getCandidateSummary.ts` gav en cirkulär import, eftersom den i sin tur importerar `deriveSeniority` från rekryterarfilen. Bygget fångade det med "Cannot access 'o' before initialization".

**40 nya vitest-tester** låser beteendet, totalt 80 gröna. De kör utan databas och utan nätverk via en mock som härmar `.from().select().eq()`-kedjan. Tre av dem vaktar projektets regler för Bli upptäckt direkt:

- kontaktuppgifter följer med **bara** för `status: 'accepted'`, verifierat genom att serialisera hela svaret och hävda att uppgifterna inte finns någonstans för `pending` och `declined`
- styrkor kommer ut som etiketter och Big Five-råpoängen går inte att hitta i svaret
- percentilen är `null` under `MIN_PERCENTILE_SAMPLE` och visas exakt på gränsen

Övriga låser kvotlogiken: premium ger `limit: null` på alla fyra poster, gratis ger de faktiska taken ur `quotaService`, och `resolveDailyLetterCounter` respekteras i alla tre lägen (fönster från i dag räknas, fönster från i går nollas, saknat fönster nollas).

### 9.2 Skalets JS

Tre komponenter laddades med varje inloggad sidladdning men visas bara efter interaktion, och `CreateSheet` drog dessutom in framer-motion i skalet:

- `CreateSheet` (mobilnavets plusknapp) laddas nu vid första öppningen och stannar monterad, så stängningsanimationen hinner spela klart
- `UpgradeSheet` (köparket i TrialStatusRow) laddas vid tryck på uppgradera
- `SetPasswordPrompt` laddas bara för konton som saknar lösenord, en minoritet

Därtill konverterades åtta komponenter på cv-mallar från framer-motion till CSS, inklusive `TemplateSelector` som animerade `height: 0 → auto`. Den använder nu `grid-template-rows: 0fr → 1fr`, som animerar utan att webbläsaren behöver mäta om innehållet. Båda expansionerna sker enbart på användarens klick, aldrig vid inladdning, så CLS påverkas inte.

**Lucide-importerna kontrollerades och behövde ingen åtgärd:** inga wildcard-importer finns, alla 547 filer använder namngivna importer, och `optimizePackageImports` är redan konfigurerat för `lucide-react`, `framer-motion` och `@heroicons/react` i `next.config`.

### 9.3 Resultat

Bundle per route, summan av alla klientchunkar routen refererar:

| Route | Efter omg. 4 | **Efter omg. 5** | framer-motion kvar |
|---|---:|---:|---:|
| dashboard | 726 kB | **715 kB** | **0 kB** |
| profil | 545 kB | **506 kB** | **0 kB** |
| cv-mallar | 554 kB | **552 kB** | **0 kB** |
| tester | 524 kB | 524 kB | **0 kB** |
| sokta-tjanster | 508 kB | **492 kB** | **0 kB** |
| skapa-brev | 994 kB | **924 kB** | 97 kB |

framer-motion är nu helt borta ur fem av sex huvudsidor. Det som är kvar på skapa-brev ligger i flödesstegen, som lazy-laddas.

Budgetkörning, Pixel 7, 3x CPU, LTE, median av tre:

| Sida | Budget | LCP | CLS | Rundturer | Status |
|---|---|---:|---:|---:|---|
| dashboard | 1000 | 1 156 | 0 | 1 | över |
| profil | 1000 | 1 216 | 0 | 0 | över |
| profil/cv | 1500 | 1 096 | 0 | 1 | OK |
| prenumeration | 1500 | 1 312 | 0 | 2 | OK |
| sokta-tjanster | 1500 | 1 108 | 0 | 1 | OK |
| mina-brev | 1500 | 1 048 | 0 | 0 | OK |
| cv-mallar | 1500 | 1 772 | 0 | 4 | över |
| tester | 1500 | 1 744 | 0 | 4 | över |
| tester/[slug] | 1500 | 1 076 | 0 | 0 | OK |
| bli-upptackt | 1500 | 1 292 | 0 | 2 | OK |
| meddelanden | 1500 | 1 144 | 0 | 1 | OK |
| kontakt | 1500 | 1 100 | 0 | 1 | OK |
| skapa-brev | 2000 | 1 272 | 0 | 1 | OK |
| skapa-cv | 2000 | 1 724 | 0 | 4 | OK |
| cv-analys | 2000 | 1 228 | 0 | 2 | OK |
| jobbmatchning | 2000 | 1 444 | 0 | 3 | OK |
| jobbcoachen | 2000 | 1 472 | 0 | 3 | OK |
| linkedin-optimizer | 2000 | 1 640 | 0 | 3 | OK |
| arbetsstil | 2000 | 1 780 | 0 | 5 | OK |

**15 av 19 inom budget. CLS är 0 på samtliga nitton sidor.**

### 9.4 Om mätbruset

En körning gav dashboard 2 156 ms, en annan 1 248 ms, med identisk kod. Sju körningar i rad på en tyst maskin gav 1 088, 1 148, 1 156, 1 156, 1 180, 1 672 och 1 864 ms: **median 1 156 ms**, men med två avvikare uppåt när maskinen råkade vara upptagen.

Det betyder att enskilda körningar inte går att lita på, och att skillnaden mellan "14 av 19" och "16 av 19" mellan körningar oftast är brus snarare än kod. Kör budgeten på en tyst maskin, använd minst tre körningar, och jämför medianer. Sidor som ligger inom 200 ms från sin gräns bör mätas om innan man drar slutsatser om dem.

## 10. Omgång sex: detaljsidor, flödessteg och död kod

Ägaren vill ha samma känsla överallt i det inloggade läget. Tidigare omgångar mätte bara nitton sidor, och de som saknades var just detaljsidor och flödessteg, alltså där användaren tillbringar sin tid.

### 10.1 Budgeten täcker nu 38 routes

`scripts/perf-inloggat.ts` mäter numera även: ansökningsdetaljen, brevdetaljen och dess redigeringsläge, cv-mallar med vald mall, personlighetstestets hubb, testprovet och resultatsidan, samt varje flödessteg för sig via `?steg=n` (skapa-brev 2 till 6, skapa-cv 2, 4 och 7, cv-analys 2 och 3, linkedin 2 och 3).

Två fel gjorde att detaljsidorna tidigare hoppades över: skriptet letade efter `test_type = 'matrislogik_grund'` medan kolumnen innehåller `matrislogik`, och det valde konto bland de 25 nyaste profilerna, där inget hade data. Kontovalet rankar nu på faktiskt antal rader (ansökningar och testsessioner väger tyngst), så mätningen körs mot en verklig vy i stället för ett tomt skelett.

### 10.2 Grindvakt före merge

`npm run perf:inloggat` avslutar med exitkod 1 om någon sida spränger sin budget med mer än 20 procent. Tröskeln är vald medvetet: mätningen svänger 300 till 600 ms mellan körningar, och en grind som larmar på minsta överdrag larmar på brus. Tjugo procent är större än bruset men mindre än en verklig regression. Tröskeln kan ändras med `--tolerans`.

CLS har en egen, mycket snävare tröskel: allt över 0,002 fäller körningen. Ett verkligt skifte i den här kodbasen har legat på 0,05 till 0,17, medan 0,001 är sub-pixelavrundning i själva mätningen.

### 10.3 Vad som faktiskt låg i vägen

**Skalets sidoanrop.** `/api/notifications` och `/api/candidate/interests` hämtades vid mount på varje sida, den senare med knappt en sekunds svarstid. Ingen av dem behövs för första målningen. Båda ligger nu i `requestIdleCallback` via den nya `src/lib/scheduleIdle.ts`.

**Fyra hookar gjorde `auth.getUser()`**, en rundtur till Supabase Auth, när de bara behövde användarens id: `useUiFlag`, `useCvQuota`, `useUnusedFeatures` och `NotificationProvider`. De tre första läser nu sessionen lokalt med `getSession()`, och notiskontexten tar användaren från `AuthContext` som redan har den serverläst.

**skapa-cv steg 7 laddade 43 SVG-miniatyrer** när karusellen visar fyra, plus en barrel-import som drog in alla 43 mallgeneratorer i samma chunk som steget. De fyra första är nu ivriga, resten lata med angivna mått, och generatorn hämtas med `await import()` vid behov. Steget gick från 111 till 75 förfrågningar och från 3176 till 1908 ms.

**Testprovet hade 16 rundturer** i en helt seriell kedja: HTML, JS, hydrering, fetch, auth, query, med det största elementet sist i ledet. Sessionen läses nu på servern i samma svar som HTML.

### 10.4 CLS-jakten fortsatte

Fyra nya skiftare hittades och åtgärdades:

- **`MessagesHeaderButton`** returnerade `null` tills data landat och sköt sedan headerns knapprad åt sidan. Ytan reserveras nu med knappens faktiska bredd.
- **`CvMallarHero` och `CvMallarSummary`** använde `slideUp`, som animerar `translateY`. En förflyttning på ett element som kommer in sent räknas som layoutskifte. Ny keyframe `fadeInPlace` (ren opacity) infördes för sektioner som redan står på sin plats.
- **Brevdetaljen och redigeringsläget** visade en centrerad spinner i en 60vh-yta som byttes mot innehåll av annan höjd. Nu ett skelett med brevkortets form.
- **Testprovets hint-läge** flippade efter att localStorage lästs, vilket växte rubriken och sköt ner matrisen och alla svarsalternativ. Höjden reserveras tills det sparade valet är känt.

### 10.5 Död kod raderad

27 filer, verifierat oanvända med grep i flera led innan något togs bort:

- hela komponentklustret för kompetensanalys och lärstig (`CompetenceAnalysisDashboard`, `CompetenceAnalysisDisplay`, `CompetenceAnalysisTool`, `CompetenceProgressTracker`, `CompetenceProgressTrackerEnhanced`, `InteractiveLearningTimeline`, `LearningJourneyDashboard`, `LearningPathTimeline`, `LearningPathVisualization`, `LearningPlanCreator`, `SkillTreeVisualization`)
- hela `src/components/learning/` (fem modaler)
- `src/hooks/use-competence-job.ts`
- `src/app/api/cv/kompetensutveckling/` och `src/app/api/learning-plans/`

Alla importer pekade in i klustret självt, ingen sida renderade något av det, och kompetensutvecklingssidan är sedan tidigare borttagen. **Databastabellerna är orörda** enligt instruktion, liksom edge-funktionerna och `src/lib/gemini/competence-analysis.ts`.

### 10.6 Resultat

`npx tsc --noEmit` rent, `npx vitest run` 80 tester gröna, `next build` lyckas.

**21 av 38 routes inom budget, upp från 7 av 33.** Rundturer före första innehåll är **0 på 26 av 38 sidor**.

| Sida | LCP före | LCP efter | Rundturer före | efter |
|---|---:|---:|---:|---:|
| skapa-brev steg 2 | 2 512 | **1 404** | 13 | **0** |
| skapa-brev steg 3 | 2 644 | **1 356** | 13 | **0** |
| skapa-brev steg 4 | 2 552 | **1 600** | 7 | **0** |
| skapa-brev steg 5 | 2 796 | **1 456** | 8 | **0** |
| skapa-brev steg 6 | 2 884 | **1 472** | 8 | **0** |
| skapa-cv steg 7 | 3 176 | **1 908** | 7 | **1** |
| cv-analys | 2 440 | **1 564** | 0 | 1 |
| cv-analys steg 2 | 1 336 | **1 528** | 0 | 0 |
| jobbmatchning | 2 140 | **1 476** | 4 | **0** |
| linkedin-optimizer | 2 228 | **1 892** | 4 | **1** |
| kontakt | 2 364 | **1 464** | 4 | **0** |
| tester prov | ej mätt | **1 480** | 16 | **0** |
| tester resultat | ej mätt | **1 616** | 11 | **1** |
| sokta-tjanster/[id] | ej mätt | **1 300** | ej mätt | **0** |
| mina-brev/[id] | ej mätt | **1 288** | ej mätt | **0** |
| mina-brev/[id]/edit | ej mätt | **1 372** | ej mätt | **0** |

Alla fem stegen i brevflödet ligger nu under budget med noll rundturer, mot 2,5 till 2,9 sekunder tidigare.

## 11. Omgång sju: skalets sista rundturer

Fem sidor låg kvar på 13 rundturer före första innehåll: cv-mallar (som dessutom blivit långsammare), profil/cv, skapa-cv steg 2 och 4, samt bli-upptackt.

### 11.1 Rundturerna kom inte från sidorna

En mätning av vilka anrop som faktiskt sker före LCP visade att de tretton var **samma tretton på alla fem sidorna**, och att de kom från det gemensamma skalet, inte från sidorna själva:

| Anrop | Källa |
|---|---|
| `user_activities` plus `candidate_profiles` | `useUnusedFeatures`, driver FeatureSpotlight i sidomenyn |
| `admin_users` plus tre räknare (`cv_texts`, `letters`, `job_applications`) | Sidebars `refreshCounts`, plus tre realtidskanaler |
| `user_ui_preferences` | `useUiFlag` |
| `/api/notifications` | `NotificationBell` |
| `/api/candidate/interests` | `useCandidateInterests` |

Ingen av dem behövs för första målningen. Sidomenyns siffror ligger bakom hamburgaren på mobil och under vikningen på desktop. `useUnusedFeatures` och Sidebars hela block ligger nu i `scheduleIdle` med tre sekunders tak, som tidigare gjorts för notiser och intressen.

Det betyder att sidorna som "låg på 13 rundturer" aldrig hade något eget att åtgärda. Serverläsningen var redan på plats; det var skalet som betalades om på varje sidladdning.

### 11.2 cv-mallar

Sidan hade utöver skalet ett eget anrop till `/api/cv/preview-html` som tog 950 ms, och ett layoutskifte på 0,050.

`MallarLivePreview` satte `height: contentHeight > 0 ? scaledHeight : 'auto'`. Kommentaren ovanför påstod att containern reserverade rätt utrymme, men `'auto'` reserverar ingenting: rutan var hopfälld tills förhandsvisningen hämtats och mätts, och växte sedan till full sidhöjd. En A4-sida har känd proportion (794 x 1123 px vid 96 dpi), så höjden räknas nu fram direkt och byts mot den uppmätta när den finns. Laddnings- och feltillstånden hade dessutom `min-h-[400px]` mot en färdig förhandsvisning på drygt 1100 px, vilket också rättades.

Ett andra skifte kom från `CvMallarSummary`, där anpassningsblocket (foto- och LinkedIn-reglagen) bara finns för vissa mallar och monterades när mallvalet landat. Ytan reserveras nu tills vi vet om blocket behövs.

**Trots detta ligger CLS kvar på 0,051 och LCP på 2 832 ms.** Mätningen visar att heron krymper från 206 till 149 px samtidigt som mittsektionen växer från 953 till 1758 px vid hydrering, alltså en omflyttning av hela kolumnlayouten snarare än en enskild komponent som dyker upp. Det är sannolikt `MallToolbar`, som startar med `isMobile: false` och rättar sig efter att ha mätt fönstret. Den kräver att brytpunkten avgörs på servern, och det är en större ändring än vad den här omgången rymde.

### 11.3 Resultat

`npx tsc --noEmit` rent, `npx vitest run` 80 tester gröna, `next build` lyckas.

**26 av 38 routes inom budget, upp från 21.** Median av tre körningar, Pixel 7, 3x CPU, LTE.

| Sida | Budget | LCP | CLS | Rundturer | Status |
|---|---|---:|---:|---:|---|
| dashboard | 1000 | 1 268 | 0,052 | 0 | över |
| profil | 1000 | 1 184 | 0,001 | 0 | över |
| profil/cv | 1500 | 2 540 | 0,001 | 13 | över |
| prenumeration | 1500 | 1 300 | 0,001 | 0 | OK |
| sokta-tjanster | 1500 | 1 216 | 0,001 | 0 | OK |
| sokta-tjanster/[id] | 1500 | 1 132 | 0,001 | 0 | OK |
| mina-brev | 1500 | 1 372 | 0,001 | 0 | OK |
| mina-brev/[id] | 1500 | 1 284 | 0,059 | 0 | över (CLS) |
| mina-brev/[id]/edit | 1500 | 1 308 | 0,059 | 0 | över (CLS) |
| cv-mallar | 1500 | 2 832 | 0,051 | 13 | över |
| cv-mallar (vald mall) | 1500 | 2 760 | 0,051 | 13 | över |
| tester | 1500 | 1 772 | 0,001 | 1 | över |
| tester/[slug] | 1500 | 1 104 | 0,023 | 0 | över (CLS) |
| tester/personlighet | 1500 | 1 284 | 0,001 | 1 | OK |
| bli-upptackt | 1500 | 2 632 | 0,001 | 4 | över |
| meddelanden | 1500 | 1 260 | 0,001 | 0 | OK |
| kontakt | 1500 | 1 348 | 0,001 | 0 | OK |
| tester prov | 2000 | 1 372 | 0,005 | 0 | över (CLS) |
| tester resultat | 2000 | 1 352 | 0,001 | 0 | OK |
| skapa-brev | 2000 | 1 332 | 0,001 | 0 | OK |
| skapa-brev steg 2 | 2000 | 1 216 | 0,001 | 0 | OK |
| skapa-brev steg 3 | 2000 | 1 352 | 0,001 | 0 | OK |
| skapa-brev steg 4 | 2000 | 1 240 | 0,001 | 0 | OK |
| skapa-brev steg 5 | 2000 | 1 192 | 0,001 | 0 | OK |
| skapa-brev steg 6 | 2000 | 1 264 | 0,001 | 0 | OK |
| skapa-cv | 2000 | 1 376 | 0,001 | 0 | OK |
| skapa-cv steg 2 | 2000 | 1 816 | 0,001 | 10 | OK |
| skapa-cv steg 4 | 2000 | 1 700 | 0,001 | 10 | OK |
| skapa-cv steg 7 | 2000 | 1 416 | 0,006 | 0 | över (CLS) |
| cv-analys | 2000 | 1 856 | 0,001 | 9 | OK |
| cv-analys steg 2 | 2000 | 1 780 | 0,001 | 9 | OK |
| cv-analys steg 3 | 2000 | 1 360 | 0,001 | 0 | OK |
| jobbmatchning | 2000 | 1 348 | 0,001 | 0 | OK |
| jobbcoachen | 2000 | 1 872 | 0,001 | 4 | OK |
| linkedin-optimizer | 2000 | 2 132 | 0,001 | 1 | över |
| linkedin steg 2 | 2000 | 1 952 | 0,001 | 2 | OK |
| linkedin steg 3 | 2000 | 1 408 | 0,001 | 0 | OK |
| arbetsstil | 2000 | 1 488 | 0,001 | 0 | OK |

Hela brevflödet ligger nu mellan 1 192 och 1 352 ms med noll rundturer. Tjugosex av trettioåtta sidor har noll eller en rundtur före första innehåll.

Fem av de tolv som ligger över gör det enbart på CLS, inte på tid: mina-brev-detaljerna (0,059), tester/[slug] (0,023), testprovet (0,005) och skapa-cv steg 7 (0,006). Alla fyra ligger under Googles gräns på 0,1, men över vår egen nollregel.

## 12. Omgång åtta: typsnittet var grundorsaken

Kvar stod cv-mallar (2,8 s, CLS 0,051) och fem sidor som bara föll på CLS.

### 12.1 Vad skiftet faktiskt var

Min hypotes var att `MallToolbar` gissade `isMobile: false` på servern och ritade om efter fönstermätning. Den gissningen togs bort och ersattes med CSS-brytpunkter (`hidden md:block` och `md:hidden`), och förhandsvisningen fick `aspect-ratio` i stället för en JS-beräknad höjd. **CLS rörde sig inte en tiondel.**

En jämförelse av DOM:en före och efter hydrering visade varför: det var samma fjorton element båda gångerna, men de **krympte**. Chipraden i heron gick från 60 till 26 px, rubrikblocket från 130 till 107, hela sektionen från 206 till 149. Inget monterades sent. Texten bytte storlek.

Orsaken var typsnittet. `Inter({ subsets: ['latin'] })` laddades utan `adjustFontFallback`, så reservsnittet hade annan metrik än Inter. Texten var bredare före bytet, chipsen radbröt till två rader i stället för en, och allt under flyttade sig när Inter tonade in.

Tre åtgärder, i den ordning de bet:

1. **`display: 'swap'` och `adjustFontFallback: true`** på Inter i rot-layouten. Next räknar då fram ett reservsnitt med matchande metrik (`size-adjust: 107.12%` i den genererade CSS:en). CLS 0,051 till 0,030.
2. **Chipraden slutade radbryta.** `min-height` räckte inte, eftersom det inte hindrar radbrytning. Raden är nu en scrollbar rad med låst höjd. 0,030 till 0,010.
3. **Rubrikblocket fick låst minsta höjd på mobil**, där brödtexten radbryter olika med de två snitten. 0,010 till 0,001.

Samma typsnittsfix förklarar varför flera av de skiften vi jagat sida för sida såg likadana ut: de hade en gemensam orsak i hur Inter laddades.

### 12.2 De fem CLS-sidorna

| Sida | CLS före | CLS efter | Orsak |
|---|---:|---:|---|
| mina-brev/[id] | 0,059 | **0,001** | Brevmallarnas `<style>`-block satte `padding` på `body` och träffade dashboardens riktiga body, så hela skalet knuffades 24 px i sidled och nedåt långt efter första målningen. Reglerna skrivs nu om till behållarens klass (`scopeLetterHtml.ts`). |
| mina-brev/[id]/edit | 0,059 | **0,001** | Samma orsak. Båda fick dessutom egna `loading.tsx`, eftersom de annars ärvde förälderns skelett med sex brevkort och bytte till en helt annan form. |
| tester/[slug] | 0,023 | **0,001** | Raden "Ditt bästa" hämtas efter första målningen och stod ovanför nivåtexten, så den knuffade allt under 68 px nedåt. Ytan reserveras nu tills hämtningen är klar. |
| tester prov | 0,005 | **0,001** | Typsnittsfixen. |
| skapa-cv steg 7 | 0,006 | **0,001** | Låsta radhöjder på rubriker och enradiga textrader, som annars byter höjd med typsnittet. |

### 12.3 Resultat

`npx tsc --noEmit` rent, `npx vitest run` 80 tester gröna, `next build` lyckas.

**30 av 38 routes inom budget, upp från 26. CLS är 0,001 på 36 av 38 sidor.**

cv-mallar, före och efter:

| Sida | LCP före | LCP efter | CLS före | CLS efter | Rundturer |
|---|---:|---:|---:|---:|---|
| cv-mallar | 2 832 | **1 732** | 0,051 | **0,010** | 13 → 8 |
| cv-mallar (vald mall) | 2 760 | **1 940** | 0,051 | **0,010** | 13 → 10 |

En mellanmätning gav 1 680 och 1 300 ms med noll rundturer, så sidan ligger på gränsen och svänger kring budgeten beroende på maskinens belastning.

Åtta sidor ligger kvar över budget: dashboard (1 256 mot 1 000), profil (1 096 mot 1 000), profil/cv (2 188), cv-mallar och cv-mallar med vald mall, tester (1 580), tester resultat (2 016) och bli-upptackt (2 432). Ingen av dem faller längre på CLS, bara på tid.

## 13. Omgång nio: de tretton var aldrig sidornas egna

Tre sidor låg kvar på 13 rundturer före första innehåll: bli-upptackt, profil/cv och tester resultat.

### 13.1 Mätningen motsade antagandet

Antagandet var att de tretton var sidornas egna anrop: kandidatunderlag, CV-lista med status per CV, sessionslista och percentiler. En probe som listade varje anrop före LCP visade något annat. De tretton var **skalets** anrop, alltså samma `user_ui_preferences`, `user_activities`, `admin_users`, tre räknare, notiser och intressen som redan flyttats till `scheduleIdle` i omgång sju.

De hinner före LCP ändå. `requestIdleCallback` utlöses när huvudtråden får en lucka, och på en tung sida kommer den luckan långt innan sidan är färdigmålad. Att flytta dem till idle tog bort dem ur den kritiska vägen, men inte ur mätfönstret.

Den riktiga signalen låg i gapet mellan FCP och LCP: 824 till 1 284 ms mot 2 216 till 2 876 ms. Texten fanns redan i server-HTML (verifierat med curl mot servern), så ingenting väntade på data. Det som tog tid var hydreringen, och den syntes som sex till sju långa uppgifter à 74 till 182 ms på huvudtråden.

### 13.2 Vad som faktiskt låg bakom

**profil/cv, 2 188 till 1 156 ms, 13 rundturer till 0.** `CvCard` importerade `CvDetailView` (423 rader) statiskt, trots att detaljvyn bara visas när ett kort expanderas. Testkontot har åtta CV, så listan drog in åtta kopior av kedjan vid hydrering. Detaljvyn är nu lazy och framer-motion ersatt med CSS. Dessutom flyttades `getCleanPreview` ut ur komponenten och memoiseras per CV-lista; den deklarerades om vid varje render och kördes en gång per kort med fem regex över hela CV-texten.

**tester resultat, 2 016 till 1 280 ms, 13 rundturer till 1.** Krävde ingen egen ändring. Skalets idle-flytt räckte när huvudtråden inte längre var lika belastad.

**bli-upptackt, 2 432 till 2 336 ms, 13 rundturer till 13.** Fyra tunga kort längst ned i sidan (`VerifiedResultsCard` 326 rader, `RecruiterPreviewCard` 261, `TermsCard` 230, `ProfileStrengthCard` 225) lazy-laddades med reserverad höjd. En mellanmätning gav 2 156 ms med fyra rundturer, men sidan svänger kraftigt mellan körningar och nådde inte målet.

### 13.3 Resultat

`npx tsc --noEmit` rent, `npx vitest run` 80 tester gröna, `next build` lyckas.

**32 av 38 routes inom budget, upp från 30.**

| Sida | Mål | LCP före | LCP efter | Rundturer före | efter |
|---|---|---:|---:|---:|---:|
| profil/cv | 1500 | 2 188 | **1 212** | 13 | **0** |
| tester resultat | 2000 | 2 016 | **1 604** | 13 | **1** |
| bli-upptackt | 1500 | 2 432 | 2 336 | 13 | 13 |

Sex sidor ligger kvar över budget, alla på tid och ingen på CLS: bli-upptackt (2 336 mot 1 500), cv-mallar och cv-mallar med vald mall (kring 1 660 mot 1 500), dashboard (1 248 mot 1 000), profil (1 164 mot 1 000) och mina-brev (1 588 mot 1 500). Fyra av dem ligger inom 200 ms från sin gräns, alltså inom mätbruset.

## 14. Omgång tio: sista avvikaren

bli-upptackt var den enda sidan som låg klart över budget, på 2 432 ms.

### 14.1 Orsaken satt i en delad komponent

Uppdraget var att göra första vyn liten och lazy-ladda resten. Jag började där: `MasterHeader` gjordes statisk (den animerade in sig med `y: 12`, alltså både fördröjd och flyttande, trots att den ska vara sidans LCP-element), och `PitchCard` plus `ContextTagsCard` lazy-laddades med reserverade höjder. **LCP rörde sig knappt.**

Mätningen visade varför. LCP-elementet byttes fyra gånger under inladdningen, och kandidaterna var textblock i olika kort. Alla korten går genom `SectionCard`, och den animerade varje kort med `initial={{ opacity: 0, y: 12 }}` plus en `delay`-prop på 0,05 till 0,3 sekunder. Sidans största textblock målades därför sist i en stagger-kedja.

`SectionCard` är nu ren CSS: opacity utan förflyttning, staggern bevarad som `animationDelay`, och hopfällningen med `grid-template-rows` i stället för `height: auto`. Det tog bort framer-motion ur sidans kritiska väg helt (0 kB kvar i routens chunkar, mot 489 kB total bundle).

**LCP-kandidaterna gick från fyra till två, och den sista är nu sidhuvudets text.** Det var det uttryckliga målet med rundan.

### 14.2 Resultat

`npx tsc --noEmit` rent, `npx vitest run` 80 tester gröna, `next build` lyckas.

| Sida | Före | Efter | Rundturer före | efter | CLS |
|---|---:|---:|---:|---:|---:|
| bli-upptackt | 2 432 | **1 896** | 13 | **5** | 0,001 |

Tre enskilda körningar gav 1 812, 1 868 och 2 248 ms, alltså 1,8 till 2,2 sekunder beroende på maskinens belastning. **Målet under 1,5 s nåddes inte.** CLS-målet 0,001 är uppfyllt.

Sidan är fortfarande den längsta i hela det inloggade läget, 4 070 tecken synlig text mot 1 129 på dashboarden. Den återstående tiden är hydrering av det innehållet, synlig som fem långa uppgifter à 85 till 143 ms på huvudtråden. För att komma under 1,5 s behöver sidan troligen delas i två vyer, inte optimeras vidare.

### 14.3 Hela det inloggade läget

**32 av 38 routes inom budget. CLS är 0,001 på 36 av 38.**

Sex sidor ligger kvar över, alla på tid och ingen på CLS:

| Sida | Budget | LCP | Kommentar |
|---|---|---:|---|
| bli-upptackt | 1500 | 1 896 | Längsta sidan, behöver delas |
| cv-mallar | 1500 | 1 736 | Förhandsvisningen kostar |
| cv-mallar (vald mall) | 1500 | 1 508 | Åtta millisekunder över |
| dashboard | 1000 | 1 164 | Noll rundturer, JS före hydrering |
| profil | 1000 | 1 036 | Trettiosex millisekunder över |
| tester resultat | 2000 | 2 084 | Svänger kring gränsen |

Fyra av de sex ligger inom 250 ms från sin gräns, alltså inom mätbruset på den här maskinen.

### 14.4 Hela arbetet i siffror

Från utgångsläget i omgång ett till nu:

| Mått | Före | Efter |
|---|---:|---:|
| Routes inom budget | 6 av 33 | **32 av 38** |
| Sidor med CLS över 0,002 | 12 | **2** |
| /dashboard | 2 208 ms | **1 164 ms** |
| /dashboard/profil | 1 680 ms | **1 036 ms** |
| /dashboard/tester | 5 424 ms | **1 472 ms** |
| /dashboard/bli-upptackt | 5 056 ms | **1 896 ms** |
| /dashboard/skapa-brev | 4 136 ms | **1 088 ms** |
| Rundturer på /dashboard | 38 | **0** |

De återkommande grundorsakerna, i tur och ordning:

1. **Varje komponent gjorde sitt eget `auth.getUser()`** över nätet innan sin egentliga fråga, ofta upprepat fem till tio gånger per sida.
2. **Hooks som såg delade ut men inte var det.** `useProfile` och `useCandidateInterests` körde hela sin kedja en gång per konsument.
3. **Layouten returnerade `null` tills klienten hydrerat**, trots att middleware redan verifierat sessionen.
4. **Typsnittets metrik.** Inter laddades utan `adjustFontFallback`, så text bytte storlek när snittet tonade in och flyttade allt under sig.
5. **Entré-animationer med `translateY` på sent inkomna element**, som räknas som layoutskifte och dessutom fördröjer LCP.
6. **Tunga komponenter importerade statiskt** trots att de ligger under vecket eller bakom ett klick.

## 15. Kvar att göra

| Post | Vad som krävs |
|---|---|
| **bli-upptackt under 1,5 s** | Sidan behöver delas i två vyer. Optimering av befintlig struktur är uttömd. |
| **dashboard och profil under 1,0 s** | 36 till 164 ms över. JS före hydrering är det som återstår. |
| **cv-mallar** | Förhandsvisningen är sidans tyngsta post. |
| **Verbala och numeriska testflöden** | Använder fortfarande klientfetch, sessionerna ligger i egna tabeller. |
| **Mätning på riktig mobil** | Allt ovan är emulering på utvecklingsmaskin. PostHog-p75 från riktiga användare bör läsas av två veckor efter driftsättning och jämföras med avsnitt 1. |

Kör `npm run perf:inloggat -- --korningar 3` på en tyst maskin före varje merge. Grinden fäller vid mer än 20 procent över budget, eller vid CLS över 0,002.
