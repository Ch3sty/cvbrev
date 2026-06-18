# Omdesign: Tester-hubben (`/dashboard/tester`)

Mål: (1) göra tydligt att "Matrislogik" = **Logiktest** (det folk söker), (2) bygga en
riktig **utvecklingsvy** (statistik/historik), (3) tydligare särskilja testtyperna,
(4) byt "Personlighetsprofil" → **Personlighetstest** med tydligare copy.

Hubben får två flikar: **Tester** och **Din utveckling**.

---

## 1. Namn & copy (tydlighet)

**Logiktest istället för Matrislogik**
- Kortets titel blir `Logiktest`. "Matrislogik" flyttas till en undertext/method-rad
  (`Mönsterigenkänning · matriser`) så söktermen syns men metoden inte tappas.
- Kategoripill `Logik` behålls.
- `EmptyTestsCallout`: "Matrislogik Grund" → "Logiktest (Grund)". Ta samtidigt bort
  Sparkles-ikonen (användaren avskyr den) — byt mot t.ex. `Target`/ingen ikon.

**Personlighetstest istället för Personlighetsprofil**
- Titel `Personlighetstest`. Undertext: *"Se vad dina svar säger rekryteraren – och
  lär känna dig själv bättre."* (utan em-dash i löptext; tankstreck här blir vanligt
  bindestreck i copy: "Se vad dina svar säger rekryteraren, och lär känna dig själv bättre.")

**Hero-copy**
- Behåll hero men nämn att biblioteket täcker logik, språk, siffror och personlighet,
  så rubriksättningen matchar den nya grupperingen.

## 2. Gruppering per testtyp (särskilja testtyperna)

Idag: en platt grid med 8 kort. Nytt: korten grupperas i fyra block med egen rubrik:

- **Logiktest** (Grund / Avancerad / Expert)
- **Verbalt resonemang** (Grund / Avancerad)
- **Numeriskt test** (Grund / Avancerad)
- **Personlighetstest** (Grund / Avancerad)

Varje grupp får en liten rubrik + en mening om vad testet mäter. Levels visas som
varianter (befintliga `LevelPill`) inom gruppen — så de tre matris-korten läses som
"samma test, tre nivåer" istället för tre olika produkter.

Ny komponent: `TestGroup.tsx` (rubrik + beskrivning + grid av kort). `page.tsx`
itererar grupperat istället för platt.

## 3. Två flikar på hubben

Lättviktig tab-bar (knappar med `useState`, ingen router-ändring) under hero:

- **Tester** — stats-kort + grupperade testkort (i princip dagens innehåll, omstrukturerat).
- **Din utveckling** — ny utvecklingsvy (se nedan). Visas tom-state om inga försök.

## 4. Utvecklingsvy ("Din utveckling")

**Dataproblem att lösa först:** `useAllTestStats` hämtar sessionerna men kastar bort
per-försök-historiken (summerar bara). För trendgrafer behövs råförsöken.

- Utöka `PerTestStats` med `history: { score, percentage, completedAt, timeSpent }[]`
  (sorterad äldst→nyast). Ingen nätverksförändring — datan finns redan i svaret som
  redan hämtas. Samma för personlighet (attempts-lista).
- Befintliga konsumenter rör jag inte (lägger bara till fält).

**Komponenter:**
- `DevelopmentView.tsx` — container för fliken.
- `TestProgressCard.tsx` — per test (de som har ≥1 försök):
  - Senaste vs. bästa (poäng + %), antal försök, total tid, datum för senaste.
  - **Sparkline** (hand-rollad SVG, orange gradient) som visar % per försök över tid.
    Liten, läsbar, matchar premium-stilen. Ingen recharts för detta.
  - Trend-indikator (senaste vs. snittet av tidigare): "+18%" grön / "−5%" neutral.
  - "Visa alla försök" fäller ut full lista (återanvänder radmönstret från
    `PreviousResultsCard` — samma utseende som dagens historik per test).
- Personlighetstest: eget kort utan poäng (har ingen score) — visar antal profiler,
  senaste datum, länk till profilen.
- Tom-state om inga försök alls (egen, utan Sparkles).

**Procent korrekt per testtyp:** återanvänd `TEST_TOTAL_QUESTIONS`-mappningen som redan
finns i hooken (15 för matris, 48 verbal, 24 numerisk) så %-talen blir rätt.

## 5. Filer

**Nya:**
- `components/TesterTabs.tsx` — tab-bar.
- `components/TestGroup.tsx` — grupp-rubrik + grid.
- `components/DevelopmentView.tsx` — fliken "Din utveckling".
- `components/TestProgressCard.tsx` — per-test utvecklingskort + sparkline.
- `components/Sparkline.tsx` — liten återanvändbar SVG-trendlinje.

**Ändras:**
- `tester/page.tsx` — flikar, gruppering, ny datastruktur, ny copy.
- `components/TestCard.tsx` — titel "Logiktest" + method-undertext.
- `components/PersonalityTestCard.tsx` — "Personlighetstest" + ny undertext.
- `components/EmptyTestsCallout.tsx` — copy + ta bort Sparkles.
- `components/TesterHubHero.tsx` — copy som matchar nya grupperingen.
- `hooks/use-all-test-stats.ts` — lägg till `history[]` i `PerTestStats`.
- `hooks/use-personality-test-stats.ts` — lägg till försökslista per nivå.

## 6. Verifiering

- `npm run build` (eller `npx tsc --noEmit`) — typecheck av nya fält/komponenter.
- Okulär granskning mot riktig data (mitt konto har 48 slutförda matris, 13 verbala,
  12 numeriska — bra för att se trendgrafen med verklig spridning).
- Mobil-först: kontrollera att flikar + sparkline + grupperna håller på liten skärm.
- Inga DB-ändringar, inga API-ändringar — ren frontend.

## Öppna frågor (löser under bygget, ingen blockerare)
- Sparkline: hand-rollad SVG (mitt förslag) vs. recharts. Default: SVG.
- Behåll dagens stats-kort överst på "Tester"-fliken (ja, men det kompletteras nu av
  utvecklingsfliken så det blir ingen dubbel-info).
