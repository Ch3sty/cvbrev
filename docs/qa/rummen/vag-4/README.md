# Rummen, våg 4: klicktest och mätning

Datum 2026-10-11. Branch `design/rummen-4` (från `design/rummen-klar` a1de6d1a). Bygget: `NEXT_DIST_DIR=.next-v4 npx next build`, produktionsserver på port 5244. Skriptet: `scripts/qa-rummen-4.mjs` (byggt ur `qa-rummen-1b.mjs`).

## Konton

Tre konton `qa-rummen-4-*@jobbcoach-qa.test`, skapade och raderade med id (räknat före delete, aldrig tidsfönster):

- **gratis**: inget CV, registreringens val CV (`onboarding_intent = 'cv'`), för landningen.
- **hela**: Premium via `premium_grants` (scope allt, 30 dagar), ett CV och inget brev (Jobbsökets hem i läge B).
- **mycket**: Premium, fyra CV, en slutförd CV-analys (poäng 72, fynden +9, +7, +5, +2), fem brev (ett mot en annons med kraven Scrum, Agile, SQL, Azure, Git och DevOps), fem sökta tjänster i olika lägen (kallad till intervju, intervju gjord, tyst i 16 dagar, inget svar, nyss sökt), nio testsessioner.

Kontrollerat i efterhand: inga rader kvar för något av kontona (auth, profiles, letters, cv_texts, job_applications, cv_analysis_jobs, logic_test_v4_sessions, user_activities). Testsessionerna går inte att radera direkt (skrivspärren), de försvinner med kontot.

## Resultat

| Del | Resultat |
|---|---|
| vyer | 212 skärmdumpar (mycket 29 routes, gratis och hela 12 routes, Pixel 7 och 1280, ljust och mörkt). 0 anmärkningar: topprad, dörrnav eller sidomeny i bild, h1 i bild, rätt `data-rum` och statusfält, ingen horisontell scroll, body rullar inte, högst en kopparknapp per vy, inga vita ytor i mörkt läge, ingen text under 3:1, inga konsolfel, inga 4xx/5xx. |
| ssr | 7 av 7: `data-rum` och `theme-color` rätt i serverns HTML utan JavaScript. |
| dörrar | 17 kontroller, Pixel 7 och 360 px, ljust och mörkt: navet 72 px, alla etiketter på en rad, inget klippt. |
| sidomeny | 1280, alla rum: rätt grupp, kopparlinjen på aktiv undersida. |
| tema | Utseende: Mörkt, Ljust, Följer systemet. |
| landning | Gratiskontot: `/dashboard` utan referens och från `/login` landar i CV-rummet (valet CV); med referens inne i appen och via dörren till Jobbsöket står `/dashboard` kvar. 4 av 4. |
| spara | "Spara som sökt tjänst" i brevvyn: nätverksfel på POST visar "Det gick inte att spara" och aldrig "ligger redan i Sökta tjänster" (Pixel 7 och 1280); lyckat POST ger exakt en rad i `job_applications` med brevets id. Se `resultat-spara.json` (omkörning med nya konton). |

I helkörningens `resultat.json` står det lyckade sparandet som "rader 0". Under körningen försvann kontonas profiler och rader innan skriptet raderade dem (raderingen hittade 0 rader för gratis och mycket), alltså städades de av något annat under tiden. Omkörningen av delen `spara` med nya konton gav 1 rad och ok.

Inte klicktestat hela vägen: en riktig CV-uppladdning (den går genom AI-tolkningen) och en riktig brevgenerering. Uppladdningsytan och brevvyn är fotograferade, och flödets knapp "Klar" leder nu till `/dashboard/mina-brev/<id>?klart=1`, men själva genereringen kördes inte.

## Prestanda

`scripts/perf-inloggat.ts`, Pixel 7, 3x CPU, LTE, median av tre, kontot med mest data (som tidigare omgångar). Skriptet besöker nu varje route med en referens inne i appen, annars hade `/dashboard` landat i kontots senaste rum. Hela tabellen i `perf.json`.

- CLS 0,001 eller 0 på alla 39 routes (under skriptets brusgräns 0,002).
- 35 av 39 inom budget i första helkörningen. De fyra: `dashboard` 3724 ms och `profil` 1372 ms (de två första routes i körningen, kallstart), `bli-upptackt` 1824 ms och `tester prov` 2024 ms (1 procent över, våg 2 och 3b:s vy).
- Omkörda var för sig, tre körningar: `dashboard` 708 ms (budget 1000), `profil` 844 ms (1000), `bli-upptackt` 1320 ms (1500). Alla inom budget.

## Grindar

- `tsc` grönt, `vitest` 101 filer och 1184 tester gröna (nya: `src/lib/rum/__tests__/jobbsok.test.ts`, `cvRum.test.ts`, `src/lib/letters/__tests__/kravIAnnonsen.test.ts`).
- `next build` med `NEXT_DIST_DIR=.next-v4` grönt.
- `node scripts/grep-rummen.mjs --vag 4 --noll` ger exit 0. Testrummets kataloger redovisas för sig (de byggs om av våg 2 och 3b): 80 aliasträffar, 21 lucide-filer, 24 fetstil, 12 linear-gradient, 8 rounded-3xl, 1 bg-gradient, 1 em-dash, 1 InkPanel/PageHeader/MarginPlate.
- `node scripts/kontrast-rummen.mjs`: inga avvikelser.

## Skärmdumpar

- `vyer/<konto>-<pixel7|desktop>-<ljust|morkt>-<route>.png`
- `landning/`, `spara/`, `dorrar/`, `sidomeny/`, `tema/`
