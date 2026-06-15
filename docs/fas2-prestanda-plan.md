# Fas 2 — Snabbare app för användaren (navigering & laddning)

## Kontext

Appen har ~228 användare men känns trög vid navigering och sidladdning. Målet med Fas 2 är **upplevd snabbhet** för det en inloggad användare möter dagligen (dashboard, sidomeny, profil, mina CV, skapa brev, jobbmatchning). AI-funktionernas körtid rör vi INTE — de får ta sin tid. Bygger vidare på branch `fas1-aktivering`.

Alla siffror nedan är verifierade mot kodbasen/node_modules, inte gissningar.

## Verifierade fynd

| Fynd | Status |
|---|---|
| `chart.js` (6,2 MB) + `react-chartjs-2` | **Döda deps** — importeras i 0 filer. Säkra att ta bort. |
| `recharts` (5,2 MB) | Används i 14 filer, **alla admin-only** (`src/app/admin/*`, `src/components/admin/*`). Påverkar inte vanliga användare. Lämnas. |
| Dashboard-layouten | `'use client'` → tvingar alla 230 dashboard-undersidor till client-rendering |
| Skeletons | Finns inbäddade i 12 sidkomponenter (`animate-pulse`) och fungerar bra. Men **0 route-nivå `loading.tsx`** → en kort blank glipa innan målsidans JS laddats, *innan* in-page-skeletonen hinner visas. |
| Dashboard-sidans data | 7 sekventiella Supabase-anrop + 1 fetch (waterfall, ~1,5-2 s väntan) |
| Maskot-SVG-filer | 28 st (~11 MB). Notiser/toasts använder REDAN inline-SVG (`ToastIllustration`), inte maskotfilerna. Filerna används bara av: en testsida + betalflödet (`PaymentProcessing`). |
| Profil/CV-data | Hämtas 2-3 ggr per sida (useProfile + useCvQuota + cv-store) |

## Ändringar (lågrisk först, layout-refactor sist & riskmärkt)

### Steg 1 — Ta bort död kod (noll risk)
- Avinstallera `chart.js` + `react-chartjs-2` ur package.json (0 importer). Verifiera att admin-sidornas recharts-grafer fortfarande bygger.

### Steg 2 — Parallellisera dashboard-datahämtning (stor effekt, låg risk)
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) (`fetchDashboardData`, ~rad 66-225): wrappa de oberoende Supabase-anropen (letters, cv_texts count, profiles, global_user_stats, user_daily_xp, xp_history) + `/api/rewards/status` i `Promise.all`. 7 sekventiella → 1 parallell omgång. Förväntad: -0,6 till -1,2 s.
- Samma mönster i [src/hooks/use-profile.ts](src/hooks/use-profile.ts) (`fetchProfile`, ~rad 346-452): de sekventiella queries som inte beror på varandra → `Promise.all`.

### Steg 3 — Route-nivå loading.tsx (liten men billig upplevd vinst, låg risk)
OBS: in-page-skeletons finns redan i 12 sidkomponenter och fungerar. Det som saknas är route-nivå `loading.tsx`, som Next.js visar OMEDELBART vid klick — innan målsidans JS laddats, dvs den tar bort den första blanka glipan innan den inbäddade skeletonen hinner monteras. Mindre vinst än de inbäddade skeletonsen, men billig.
- Lägg `loading.tsx` i de mest besökta route-segmenten: `dashboard/`, `dashboard/profil/`, `dashboard/mina-brev/`, `dashboard/skapa-brev/`, `dashboard/jobbmatchning/`. Återanvänd befintliga skeleton-mönster (t.ex. `HeroSkeleton`/`BodySkeleton` i [cv/page.tsx](src/app/dashboard/profil/cv/page.tsx)).

### Steg 4 — Deduplicera datahämtning (medel effekt, låg-medel risk)
- [src/app/dashboard/skapa-brev/page.tsx](src/app/dashboard/skapa-brev/page.tsx): CV-datan hämtas via `useCVStore` + `useCvQuota` + `useProfile` (2-3 ggr). Konsolidera till en källa (cv-store) och läs count därifrån.
- Lätt seger: säkerställ att sidomenyns `<Link>` (redan next/link) får prefetcha skapa-brev/mina-brev så CV-listan är varm vid navigering.

### Steg 5 — Trimma onödigt klient-arbete (låg risk)
- [src/components/dashboard/LiveActivityIndicator.tsx](src/components/dashboard/LiveActivityIndicator.tsx): två `setInterval` (20s + 30s) med simulerad aktivitet körs på dashboard. Utvärdera att ta bort/sänka frekvensen — ren CPU/batteri-vinst utan funktionsförlust.
- [src/components/dashboard/Sidebar.tsx](src/components/dashboard/Sidebar.tsx): realtidsprenumerationerna lyssnar på alla user-events; debounca count-refresh så snabba bursts inte ger re-render-storm.

### Steg 6 — Sluta använda maskoten helt (enligt beslut)
- **Ersätt** betalflödets 4 maskot-bilder i [src/components/trial/PaymentProcessing.tsx](src/components/trial/PaymentProcessing.tsx) (`mascotStages` + error-bilden) med **nya custom inline-SVG:er** i samma stil som toast-illustrationerna ([src/components/ui/toast/illustrations/index.tsx](src/components/ui/toast/illustrations/index.tsx): `viewBox 0 0 64 64`, delad orange→röd→pink gradient, `FC<IllProps>`). Skapa kontextpassande motiv för verifierar/aktiverar/slutför/fel-stegen. Tar bort `next/image`-laddningen av externa SVG-filer.
- **Radera** testsidan `src/app/test-mascot-notifications/` och alla 28 filer i `public/images/maskot/` (när inga referenser kvarstår). Ta bort `successWithMascot`/`successWithMascotAndActivity`-API:t i [notificationcontext.tsx](src/context/notificationcontext.tsx) bara om inga anropare finns kvar — annars peka dem mot scenario-baserade toasts (de 11 anroparna skickar redan scenario-keys, så detta bör vara rent).
- Verifiera: betalflödet animerar fint med nya SVG:er, inga 404 på `/images/maskot/*`, notiser oförändrade.

### Steg 7 (RISKMÄRKT, eget steg) — Server-rendera dashboard-layouten
**Detta är den största potentiella vinsten (-0,5 till -1 s) men också den största risken.** Tas separat och verifieras isolerat; kan hoppas utan att Steg 1-6 påverkas.
- [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx): ta bort `'use client'`, flytta auth-checken till middleware/server, och isolera de delar som genuint behöver klient (sidebar-animation, providers) till egna client-komponenter. Konsekvens: undersidor slutar tvingas till client bara pga layouten.
- Kräver noggrann test av: auth-redirect, onboarding-provider, mobilmeny, att ingen sida tappar interaktivitet.

## Vad som INTE rörs
- AI-funktionernas körtid (brev, analys, chatt, matchning).
- Admin-sidorna och recharts.
- `location` och övrig Fas 1-funktionalitet.

## Verifiering
- `npx tsc --noEmit` + `npm run build` grönt efter varje steg.
- Mät före/efter: Lighthouse mobil på dashboard (FCP, TTI), och klocka navigering dashboard→profil→mina-brev (känns blank skärm borta?).
- Klicka igenom: dashboard, profil (spara), mina brev, skapa brev, jobbmatchning, betalflöde (nya SVG:er), en notis (oförändrad).
- Bekräfta admin-grafer fortfarande fungerar efter chart.js-borttagning.
- Bekräfta inga 404 mot `/images/maskot/*` i nätverksfliken.

## Leverans
Allt på branch `fas1-aktivering`, pushas till GitHub. Ingen merge till main. Steg 7 committas separat så det kan granskas/återställas oberoende.
