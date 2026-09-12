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

## 3. Verifiering

`npx tsc --noEmit` rent. `npx vitest run` 40 tester gröna. `next build` lyckas.

### Uppmätt i webbläsaren

Chrome mot lokal produktionsbuild (`next start`), inloggad med riktigt konto, Pixel 7-emulering, 3x CPU-strypning, LTE-nät (70 ms latens). Median av tre körningar.

| Sida | LCP före | LCP efter | CLS före | CLS efter | Förfrågningar före | efter |
|---|---:|---:|---:|---:|---:|---:|
| /dashboard | 2 116 ms | **1 968 ms** | 0,165 | **0,122** | 127 | **105** |
| /dashboard/sokta-tjanster | 2 248 ms | **1 860 ms** | 0,122 | 0,122 | 94 | **81** |
| /dashboard/profil | 3 712 ms | **2 172 ms** | 0,122 | 0,122 | 101 | **85** |
| /dashboard/skapa-brev | 4 136 ms | 4 336 ms | 0,122 | 0,122 | 121 | 104 |

Störst effekt på /dashboard/profil: 41 procent snabbare. /dashboard/skapa-brev förbättrades inte, den har en egen tung kedja som inte omfattas av det här arbetet.

### Bundle per route

Summan av alla klientchunkar som routen refererar, okomprimerat.

| Route | Före | Efter |
|---|---:|---:|
| /dashboard | 728 kB | 726 kB |
| /dashboard/sokta-tjanster | 939 kB | **508 kB** |
| /dashboard/profil | 544 kB | 545 kB |
| /dashboard/skapa-brev | 993 kB | 994 kB |

Ansökningssidan minskade 46 procent tack vare att recharts lyftes ut. Dashboarden står stilla i kB trots att framer-motion mer än halverades där (204 till 86 kB), eftersom koden flyttade mellan chunkar snarare än försvann. Den återstående framer-motion-användningen ligger i `dialog.tsx` och `progress.tsx`, som delas med resten av appen.

### Begränsningar i mätningen

- Jämförelsen gjordes genom att bygga och mäta `main` och `perf/inloggat` var för sig på samma maskin, med samma konto och samma emulering. Ett första försök att mäta baseline gav nollvärden eftersom baseline-layouten returnerar `null` tills AuthContext hydrerat, och den planterade sessionscookien inte hann hydrera. Siffrorna i tabellen kommer från körningar där renderat innehåll verifierades (textlängd över noll på varje sida).
- En mellanliggande mätning kördes mot en inaktuell serverinstans som låg kvar på porten och gav kraschande sidor. Den kastades. Slutmätningen gjordes mot en ren server på ny port.
- Tre körningar per sida ger median, inte p75. PostHog-siffrorna i avsnitt 1 är p75 från riktiga användare och är därför inte direkt jämförbara med tabellen ovan.

## 4. Kvar att göra

| Åtgärd | Förväntad effekt |
|---|---|
| OnboardingContext: sju realtidskanaler och sex count-frågor vid varje sidladdning | Störst kvarvarande post |
| /dashboard/skapa-brev: egen kedja, förbättrades inte här | 4,3 sekunder är fortfarande långt från målet |
| Serverrendera dashboardens första vy | Layouten returnerar fortfarande `null` tills AuthContext hydrerat |
| framer-motion ur `dialog.tsx` och `progress.tsx` | Sista 86 kB |
| CLS 0,122 ligger fortfarande över Googles gräns på 0,1 | Skelett som matchar slutlayouten exakt |

Målet en sekund till riktigt innehåll är alltså inte nått. Dashboarden ligger på 1,97 sekunder mot 2,12 före. Den återstående vägen går via serverrendering och OnboardingContext, inte via fler klientoptimeringar.
