# Fas 1 — Implementationsplan (för godkännande)

Branch: `fas1-aktivering`. Inget är ändrat ännu. Denna plan är reviderad efter att jag läst den faktiska koden.

## Vad datan ändrade i prioriteringen

En extra koll visade att **bara 5 av 228 konton är overifierade** — e-postväggen är alltså INTE den stora läckan jag antog i den övergripande planen (den blockerar i praktiken nästan ingen idag; confirmation verkar redan vara mjuk). De 27 "loggade aldrig in" har andra orsaker.

Den verkliga hävstången är därför, i prioritetsordning:
1. **Aha-moment vid CV-upload** — fångar både de som tvekar att ladda upp OCH de 39/87 som laddar upp men sen försvinner.
2. **Auto-claim av belöningen** — 39 hoppade av onboardingen, många innan de ens nådde den manuella "hämta belöning"-knappen.
3. **Funktionell verify-email-sida** — liten insats, fixar återvändsgränden för de få som hamnar där.
4. **goal_role-inkonsistensen** — städ-fix.

## Byggstenar som redan finns (återanvänds, inget nybygge)

- `/api/cv/upload` returnerar hela CV-raden i `complete`-payloaden → vi har `id` + `cv_text` direkt efter upload. Triggar redan `update_onboarding_progress`.
- `analyzeCvBasic()` i `src/lib/openai/cv-analysis.ts` — **synkron, snabb** (Gemini `fast`-modell efter migreringen), returnerar `{ summary, identifiedStrengths, improvementAreas, keywords, scores }`. Detta är motorn för aha-momentet.
- `OnboardingContext` — har redan `onboardingCompleted`, `rewardClaimed` och realtidsprenumeration på feature-tabellerna.
- `OnboardingReward` + `/api/onboarding/claim-reward` — claim-logiken finns, behöver bara auto-triggas.
- `OnboardingNextStep` — visas redan på CV-sidan efter upload.

---

## Ändring 1 — Aha-moment direkt efter CV-upload (störst effekt)

**Mål:** I sekunden CV:t är parsat ska användaren se konkret värde inline, inte bara en "nästa steg"-länk.

**Ny endpoint:** `src/app/api/cv/quick-score/route.ts`
- Tar `cvId`, hämtar `cv_text` (RLS skyddar), kör `analyzeCvBasic()`, returnerar score + topp-3 styrkor + topp-3 förbättringar.
- Synkront svar (~3-5s med `fast`-modellen), ingen bakgrundsjobb-komplexitet.
- Spårar kostnad via befintlig `trackAIUsage` (feature: CV_ANALYSIS).

**Ny komponent:** `src/components/cv/QuickScoreReveal.tsx`
- Tar emot score-resultatet, animerar fram en score-mätare (0-100) + 3 styrkor + 3 förbättringar.
- Tydlig nästa-CTA: "Skapa ditt första brev från detta CV →" (länkar till `/dashboard/skapa-brev`).
- Återanvänder befintlig design (samma orange gradient-språk som `OnboardingHero`).

**Ändring i** `src/app/dashboard/profil/cv/page.tsx`:
- `handleUpload` fångar redan `success`. Jag ändrar så `uploadCV` exponerar CV-id:t från `complete`-payloaden (liten ändring i `use-profile.ts`: returnera `cvData` i stället för bara `true`, eller en parallell callback).
- Efter lyckad upload av **första** CV:t: anropa `quick-score` och rendera `QuickScoreReveal` inline ovanför CV-listan. För andra/senare uppladdningar behålls nuvarande beteende.

**Avgränsning:** Detta ersätter INTE den fullständiga CV-analysen (steg 3). Det är en snabb försmak som ger omedelbar payoff och leder vidare.

---

## Ändring 2 — Auto-claim av onboarding-belöningen

**Mål:** Ta bort den manuella "hämta belöning"-knappen som friktion. Belöningen ska kännas som en automatisk firande, inte ännu en uppgift.

**Ändring i** `src/components/dashboard/OnboardingReward.tsx`:
- Lägg en `useEffect` som auto-anropar `handleClaim()` en gång när komponenten visas (dvs. när `onboardingCompleted && !rewardClaimed`).
- Behåll knappen som fallback om auto-claim fitar (nätverksfel), men i normalfallet körs den automatiskt och visar firande-tillståndet direkt.
- `claim-reward`-routen är redan idempotent (returnerar "already claimed") så dubbletter är ofarliga.

**Ändring i** `src/components/dashboard/OnboardingNextStep.tsx`:
- Sista steget (`analyze_cv`) pekar idag på "Hämta belöning → /dashboard/kom-igang". Ändras till att spegla att belöningen redan hämtats automatiskt (firande-copy i stället för CTA-knapp).

---

## Ändring 3 — Funktionell verify-email-sida

**Mål:** Gör återvändsgränden till en väg framåt för de få som hamnar där.

**Ändring i** `src/app/auth/verify-email/page.tsx`:
- Lägg en "Skicka verifieringsmejl igen"-knapp (anropar befintlig `/api/auth/send-confirmation`).
- Lägg en discret "Fortsätt till appen"-länk till `/dashboard` (eftersom confirmation är mjuk — användaren kan jobba och verifiera senare).
- Behåll som landningssida; ingen ändring i register-flödet (eftersom väggen i praktiken inte blockerar).

**Inget** stängs av i Supabase auth-inställningarna i denna fas — risken är onödig när bara 5 konton påverkas. Kan omprövas senare om datan ändras.

---

## Ändring 4 — goal_role-inkonsistensen

**Mål:** Chatten läser `profile.goal_role` som inte finns → alltid "Ej angivet".

**Beslut som behöver din input (se fråga nedan):** lägga till fältet eller ta bort läsningen.
- **Alternativ A (rekommenderas):** Lägg till `goal_role` (text) som kolumn + ett fält i profil-sektionen (`PersonalDetailsSection.tsx`). Ger chatten OCH jobbmatchningen bättre kontext. Kräver en liten DB-migration.
- **Alternativ B:** Ta bort `goal_role` ur `chat/route.ts` (rad ~146, ~186). Noll DB-ändring, men tappar en möjlig personaliseringssignal.

---

## Verifiering innan merge

- Bygg: `npm run build` grönt.
- Lokalt som ny användare: signup → ladda upp CV → se QuickScoreReveal → klicka vidare till brev → analys → se att belöningen auto-claimas.
- Bekräfta att andra-gångs-uppladdning inte triggar aha-vyn (bara första).
- Verify-email: testa "skicka igen" + "fortsätt till appen".
- Kostnadsspårning: en rad i `ai_usage_costs` per quick-score.

## Vad jag INTE gör i Fas 1

- Ingen bundle-bantning, bildoptimering eller DB-hygien (det är Fas 2-3).
- Ingen omskrivning av onboardingens sekventiella låsning — jag gör steg 2-3 mjukare via auto-claim men river inte upp hela flödet i denna fas.

## Leverans

Allt på branch `fas1-aktivering`, pushas till GitHub som testbransch (ingen merge till main). Du får länk + en kort sammanfattning att granska.
