# Rummen våg 2: ingången, provdatumet och hemvyn i Rekryteringstester

Datum 2026-10-11. Branch `design/rummen-2` (från `design/rummen-klar` a1de6d1a). Byggt av Opus 5.5 enligt `docs/design/spec-rummen-2026-10-10.md` (avsnitt 0, 6 våg 2, 7, 9, 12 till 18) och konceptet `koncept-testvy-2026-10-10.html`.

**Status: byggt, typkontrollerat, testat med vitest och PGlite och klicktestat i riktig Chrome mot förhandsvisningen (fixturdata). Inte klicktestat mot riktig testdata**, eftersom migreringarna `20261011100000_test_planer.sql` och `20261011101000_testmotorn.sql` inte är körda i prod. Mot prod-databasen står hemvyn i felet (X1) och sparandet i ingången säger "Det gick inte att spara". E2E-skriptet `scripts/qa-rummen-vag2-prod.mjs` körs efter att ägaren kört migreringarna.

## Vad som är byggt

| Del | Filer |
|---|---|
| Hemvyn som modell (alla tillstånd, rubriktabellen, gratisnivån 17.2) | `src/lib/traning/hemvy.ts`, `rubrik.ts`, `hem-copy.ts`, `rutter.ts` |
| Serverhämtningen, en parallell omgång | `src/lib/traning/getTraningSummary.ts`, `src/lib/dashboard/summaryForRequest.ts` (layouten och sidan delar summeringen via `cache()`) |
| Motorns status utökad | `motor.server.ts`: `start`, `dagensTema`, `senastePass`, `behorighet` i `Traningsstatus` |
| Hemvyn | `src/app/dashboard/tester/page.tsx`, `src/components/traning/Hemvy.tsx`, `HemKlient.tsx`, `loading.tsx` (L1) |
| Kurvan | `src/components/traning/Kurva.tsx` (mobil 380 och dator 840, hem och full, `Planbild` för 1a) |
| Nivåskalan (provdagen) | `src/components/traning/Nivaskala.tsx`: ägs av våg 3b, byggd efter specens gränssnitt så att 3b:s fil ersätter den |
| Ingången E1, E2, E3, E3-P | `src/app/dashboard/tester/installningar/`, `src/components/traning/Ingang.tsx` |
| Hela kurvan F1 | `src/app/dashboard/tester/kurvan/`, `src/components/traning/Helkurva.tsx`, `src/lib/traning/kurvan-copy.ts` |
| Alla tester | `src/app/dashboard/tester/alla/` (den gamla hubben, rubriken "Alla tester") |
| Sidomenyn | Dagens pass, Kurvan, Alla tester, Provläget, Test och datum |
| Förhandsvisningen | `/dashboard/tester/forhandsvisning?tillstand=<T1, 1a till 1i, 1p, X1, L1, W1 till W4>` och `&sida=kurvan`; bara med `NODE_ENV=development` eller `TRANING_FORHANDSVISNING=1` |
| Mätpunkter | `ingang_steg`, `provdatum_satt`, `provdatum_hoppat_over`, `traning_hem_visad`, `efter_provet_svar`, och `rum_oppnat` med `intent` |

## Resultat

| Kontroll | Utfall |
|---|---|
| `tsc` | grönt |
| vitest, hela sviten | 100 filer gröna; `src/lib/traning` 128 tester inklusive PGlite-integrationen (hemvyn byggs ur motorns riktiga status för betald och gratis) |
| `villkor.test.tsx` (kriterium 14) | grönt med `intent` på `rum_oppnat` |
| `next build` (`NEXT_DIST_DIR=.next-v2`) | grönt |
| `grep-rummen.mjs --vag 2 --noll` | 0 (1b:s grindar plus våg 2: ingen `text-koppar` som text i `src/components/traning`, inga tankstreck i copy, förhandsvisningens spärr), `grep.txt` |
| `kontrast-rummen.mjs` | inga avvikelser, `kontrast.txt` |
| Perf, Pixel 7, 3x CPU, LTE, median av tre (`perf.json`) | tester 888 ms (budget 1000), hemvy 1b 840 ms, tester/alla 776, tester/kurvan 772, installningar 532, dashboard 940. CLS 0,001 överallt (under brusgränsen 0,002) |
| Klicktest, förhandsvisningen | 13 tillstånd på Pixel 7 och 13 på 1280 (W1 till W4 plus T1, 1c, 1e, 1g, 1h, 1i, 1p, X1, L1), F1 på båda, ljust och mörkt: exakt en kopparknapp per vy (1e har ingen, svaren är glas), aldrig på väggen, knappen i bild utan scroll, inga streck eller "0 %", SVG-text 11 till 13 px och axeln 11 px på båda bredderna, inga konsolfel, inga 4xx/5xx |
| Klicktest, ingången | E1, E2, E3 och E3-P på Pixel 7 och 1280, ljust och mörkt: kopparknappen i bild, krysset på varje steg, Hoppa över i steg 2 och 3, planens text. Sparandet mot prod: felet visas, aldrig "sparat" |
| Nätverksfel på `PUT /api/traning/plan` | felet visas, ingen "sparat", kvar på steget (`natfel/`) |

Skärmdumpar: `hem/<tillstånd>-<pixel7|desktop>-<ljust|morkt>.png` (vyn) och `-hela.png` (hela sidan med main utfälld; bottennavet hamnar mitt i bilden där, det är fixerat), `ingang/`, `natfel/`. Resultat per vy i `resultat.json` och `resultat-f1.json`.

## PostHog: tratten och avläsningen

- **Ingången:** `ingang_steg` steg 1, 2, 3 (`forsta: true` för första vyn) → `provdatum_satt` eller `provdatum_hoppat_over`. Avhopp per steg = skillnaden mellan stegen. Mål: 50 procent av nya testregistrerade sätter datum.
- **Hemvyn:** `traning_hem_visad` per `tillstand` ger fördelningen.
- **Efter provet:** `efter_provet_svar` mot `traning_hem_visad` med `tillstand: efter`. Mål 50 procent.
- **Dörren Tester (copywriterns önskemål):** `rum_oppnat` med `rum: tran`, `surface: dorr`, uppdelat på `intent`. Andelen som lämnar rummet inom tio sekunder läses som tiden till nästa `rum_oppnat` i samma session (PostHog-tratt `rum_oppnat` tran följt av `rum_oppnat` annat rum inom 10 s). Står andelen över hälften för cv/brev-registrerade är det copywriterns signal att ordet lovar något annat.
- Alla med `is_internal` uteslutet, antal och inte bara procent (3 till 4 nya konton per dag).

## Det som inte är byggt här

- Passflödet, mätningen, genomgången och uppvärmningen är våg 3b. Hemvyns knappar pekar på `/dashboard/tester/pass?typ=...` och `/dashboard/tester/pass/<id>` i `src/lib/traning/rutter.ts`; ändra där om 3b väljer andra adresser.
- `Resultatvy` för de befintliga testerna och Kom igång-brickornas nya namn (spec våg 2) ingick inte i uppdraget.
- Layouten hämtar inte `getTraningSummary` (spec 2.1): hemvyn gör det själv, layouten delar bara Jobbsökets summering.

## Testkonton

`qa-rummen-vag2-{gratis,hela,mycket}-2026-10-11@jobbcoach-qa.test`, skapade och raderade med `scripts/qa-rummen-vag2-konton.mjs` (bara egna rader via id, räknade före delete).
