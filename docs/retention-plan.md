# Plan: Förbättra retention & UX för jobbcoach.ai

## Kontext

Appen har ~228 registrerade men användningen dör tidigt. En dataanalys mot Supabase (2026-06-13) visar att problemet **inte** är att folk tröttnar efter några dagar, utan att de flesta aldrig kommer igång alls. Målet med denna plan är att täppa aktiveringsläckan först (störst effekt), sedan göra appen snabbare och mer responsiv, och slutligen städa databasen.

## Datagrund (verifierad mot produktion)

| Mätpunkt | Värde | Slutsats |
|---|---|---|
| Skapade aldrig ett dokument | 137 / 228 (60%) | Huvudläckan |
| Aktiva bara en dag | 104 (46%) | Tappas första besöket |
| Registrerade men loggade aldrig in | 27 (12%) | Verify-email-väggen |
| Slutförde onboarding (3 steg) | 14 (6%) | Onboardingen för tung |
| Startade onboarding men hoppade över | 39 | Sekventiell, ingen tidig payoff |
| Laddade upp CV → men gjorde sen **inget** | 39 / 87 (45%) | CV-upload saknar omedelbart värde |
| Aktiva senaste 7 dagarna | 6 | — |

**Två distinkta läckor:**
1. 60% laddar aldrig upp ett CV (CV är navet för nästan all funktionalitet).
2. Av de som gör det får 45% ingen omedelbar payoff och stannar inte.

Aha-momentet måste därför sitta **direkt på CV-uppladdningen**: i samma sekund CV:t är parsat ska användaren se konkret värde (snabb score/analys), inte skickas vidare till en tom nästa-sida. Detta adresserar båda läckorna samtidigt — det gör uppladdningen mer lockande OCH belönar den som laddar upp.

## Befintliga byggstenar att återanvända (inte bygga nytt)

- `src/components/cv/analysis/CVAnalysisModal.tsx` — har redan `onComplete(result)`-callback.
- `src/components/cv/InlineCVUpload.tsx` — `onSuccess(cvId)`-callback, kan bäddas in i onboarding-hero.
- `src/components/cv/cv-uploader.tsx` — `onSuccess`-hook.
- `src/contexts/OnboardingContext.tsx` — har redan hybrid-validering (DB-flagga ELLER faktisk feature-användning).
- `src/app/api/onboarding/claim-reward/route.ts` — reward-logiken finns, behöver bara auto-triggas.

---

## Fas 1 — Stoppa aktiveringsläckan (störst effekt på de 60%)

### 1.1 Ta bort den blockerande e-postväggen
**Beslut: släpp in användaren direkt, verifiera mjukt i bakgrunden.**

- `src/components/auth/register-form.tsx` (rad ~130–141): efter signup, dirigera till `/dashboard` direkt i stället för `/auth/verify-email` när session finns. För CV-appar är spam-risken låg och aktiveringsvinsten hög.
- Lägg en icke-blockerande banner i dashboard-layouten för overifierade konton: "Bekräfta din e-post för att spara dina dokument permanent" + **"Skicka igen"-knapp** (saknas helt idag).
- `src/app/auth/verify-email/page.tsx`: behåll som landningssida för dem som klickar mejllänken, men gör den funktionell (auto-redirect till dashboard när verifierad, fungerande skicka-igen).
- Supabase: bekräfta att `Confirm email` inte hårt blockerar inloggning på auth-nivå (Auth settings). Om den gör det, justeras flödet så session skapas direkt.

### 1.2 Aha-moment direkt vid CV-uppladdning
**Mål: CV-upload → omedelbart synligt värde, ingen tom mellansida.**

- Onboarding-steg 1 ändras från "ladda upp CV och navigera vidare" till "ladda upp CV → få direkt en gratis snabb-score + topp-3 förbättringar i samma vy".
- Återanvänd `InlineCVUpload` (inbäddad i `OnboardingHero.tsx`) + trigga en lättviktig analys via befintlig CV-analys (Gemini `fast`-modell) direkt på `onSuccess`.
- Visa resultatet inline med en tydlig nästa-CTA ("Skapa ditt första brev från detta CV →"). Detta fångar de 39 som idag laddar upp och sen försvinner.
- `src/app/dashboard/profil/cv/page.tsx` (rad ~330): idag pushas användaren till `cv-mallar` efter upload. Utvärdera om den redirecten ska bytas mot analys-payoff för förstagångsanvändare.

### 1.3 Gör onboardingen lättare och självbelönande
- `src/app/dashboard/kom-igang/page.tsx` + `OnboardingContext.tsx`: behåll de tre stegen men gör steg 2–3 till "rekommenderade nästa steg" snarare än en låst sekvens som måste klaras för någon payoff.
- `src/app/api/onboarding/claim-reward/route.ts`: **auto-claima** belöningen när sista steget är klart i stället för manuell knapp (39 hoppade av innan de ens nådde knappen). Visa en firande toast i stället.

### 1.4 Fixa goal_role-inkonsistensen (liten men städar)
- `src/app/api/jobbcoachen/chat/route.ts` (rad ~146, ~186) läser `profile.goal_role` som inte finns som kolumn → alltid "Ej angivet". Antingen lägg till fältet i profil-onboarding (ger chatten + matchning bättre kontext) eller ta bort läsningen. Rekommendation: lägg till det, eftersom målroll förbättrar både matchning och brevkvalitet.

---

## Fas 2 — Snabbhet & känsla

### 2.1 Dashboard: parallellisera + skeletons
- `src/app/dashboard/page.tsx` (rad ~66–225): 7–8 sekventiella Supabase-anrop + en separat `fetch('/api/rewards/status')` körs i serie bakom en blank spinner. Wrappa i `Promise.all`, lägg skeleton-skärmar så något ritas direkt, och lazy-loada 28-dagars XP-historiken (visas inte på mobil ändå).

### 2.2 Bundle-bantning (verifierat)
- **Ta bort `chart.js` + `react-chartjs-2` helt** — importeras i 0 filer, ni använder `recharts` (14 filer). Ren dead weight (~6 MB i node_modules, motsvarande JS i bundlen).
- **Radera oanvända maskot-SVG:er** (~8,7 MB i `public/images/maskot/`) — bekräftat av användaren att de inte används. Behåll bara de som faktiskt renderas.
- Konvertera tunga PNG:er till WebP: `public/cvbrev.png` (908 KB) och artikel-bilderna (~3,8 MB), använd `next/image` med rätt `sizes`.

### 2.3 Tracking: fixa last_active
- `profiles.last_active` uppdateras aldrig (1 av 228 rader satt) → ni är blinda för drop-off och kan inte win-backa. Sätt den vid varje inloggning/dashboard-load (en `update` i en server action eller middleware, billigt). Detta är förutsättningen för framtida win-back-mejl.

### 2.4 (Valfritt) Tunga publika exempel-sidor
- `cv-exempel/[yrke]` (~20k rader) och `personligt-brev-exempel/[yrke]` (~10k rader) är `use client` men statisk data. Konvertera till server components + `generateStaticParams` för snabbare FCP och bättre SEO. Större insats — egen sprint.

---

## Fas 3 — Databas-hygien (osynlig men brett snabbare + säkerhet)

Supabase performance-advisors: **433 WARN-lints**, dominerat av:
- **310 multiple_permissive_policies** — flera överlappande RLS-policys per tabell/roll utvärderas alla vid varje query. Konsolidera till en policy per operation.
- **121 auth_rls_initplan** — `auth.uid()` körs per rad i stället för en gång. Wrappa i subquery: `(select auth.uid())`. Stor och bred prestandavinst, ren SQL.
- **73 unused_index** + **12 unindexed_foreign_keys** + **2 duplicate_index** — droppa oanvända, lägg saknade FK-index.

### 3.1 Säkerhet (kritiskt, separat från ovan)
- `public.enriched_occupations` och `public.enriched_jobs` har **RLS helt avstängt** → exponerade för vem som helst med anon-nyckeln. Aktivera RLS med rätt policys (dessa verkar vara referensdata, så en read-only policy för authenticated räcker troligen). SQL tas fram och presenteras innan körning — aktivera inte RLS utan policy (blockerar all åtkomst).

---

## Verifiering

- **Fas 1:** Testa hela signup→CV-upload→aha→brev-flödet lokalt som ny användare. Mät i Supabase efter utrullning: andel som laddar upp CV inom 10 min, och andel CV-uppladdare som går vidare (idag 55%).
- **Fas 2:** Lighthouse mobil före/efter (FCP, TTI, bundle-storlek). Verifiera att `chart.js`-borttagning inte bryter någon graf (`npm run build` + visuell koll av admin/statistik-sidor).
- **Fas 3:** Kör `get_advisors` igen efter migrationerna och bekräfta att WARN-antalet sjunker. Verifiera att RLS-ändringarna inte bryter någon befintlig query (testa varje berörd sida inloggad).

## Föreslagen ordning

Fas 1 ger störst retention-effekt och tas först. Fas 3 (särskilt 3.1 säkerhet + auth_rls_initplan) kan köras parallellt eftersom det är ren SQL utan UI-risk. Fas 2.4 är en egen sprint.
