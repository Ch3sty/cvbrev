# Figurserier, omgång 2 att granska (granskning 02)

Datum 2026-10-12. Från Opus C till testansvarig. Underlag: `../granskning-01.md` och `../beslut-01.json`. Branch `feat/figurserier`.

## Vad som är gjort

- Kandidaterna i `src/lib/figurserierV1/kandidater/{grund,avancerad,expert}.json` är nu de granskade: 57 godkända oförändrade, 27 med nya alternativ (samma rad och id), 12 nya som ersätter de strukna. Byggs av `node scripts/figurserier-omgang2.mjs` ur omgång 1 (`kandidater/omgang1/`) och beslutsfilen, deterministiskt. Listan står i `lista.json`.
- Bilder bara för de 39 ändrade och nya: `grund/` 7, `avancerad/` 8, `expert/` 24, plus `index.html` per nivå. Samma uppställning som i omgång 1.
- De godkända har bara en ändring: grundformens regeltext och misstag säger "Fyllningen" (fs-a-fyll-01, 02).

## Generatorn efter granskning 01, avsnitt 4

1. FS6: strålar 2 till 7; en kantprick (`yantal` är ingen dimension längre); kärnsymbol ur kryss, plus, minus, ring.
2. Duo kant + form är F6:s tredje grupp; duo-kant-pil-tre, duo-kant-symbol-tre och duo-kant-antal-tre utgår.
3. Ingen cykel över lägen eller vinklar.
4. S12 räknar varje regeldimension vars nåbara mängd är mindre än primitivens, noll tillåtna på alla nivåer.
5. S14 balans: ingen regeldimension bryts av alla fem; expert har en nära miss (exakt en regel fel, inga konstanter) och två som bryter alla med olika värden. `v7-distraktor-check --serie` på omgång 1:s expertfil fäller alla 15 i `andra` (och de strukna).
6. Rena distraktorer först, konstantbrott spridda; antal vid gränsen räknar "rätt antal, fel plats" som nära miss. Avancerad expert-nära miss är nu "exakt en regel fel" även i kontrollen.
7. Godkända i granskning 01 står i `GODKANDA_FORE_OMGANG2`; för dem vore S12 och S14 upplysning, men ingen av dem bryter dem.

## Ersättarna

| Ny | Ersätter | Mall och variant |
|---|---|---|
| fs-g-vrid-11 | fs-g-vrid-08 | F1 strålar, steg |
| fs-g-antal-13 | fs-g-antal-07 | F2 strålar, antal från två |
| fs-a-antal-07 | fs-a-antal-01 | F4 strålar, kvartsvarv och antal |
| fs-e-vand-04 till 09 | fs-e-vand-01 till 03, fyll-06, antal-01, 02 | F6 duo kant + form |
| fs-e-flera-03, 04 | fs-e-flera-01, 02 | F6 duo orbital + form |
| fs-e-antal-03 | fs-e-vaxl-08 | F7 sektorhjul: start växelvis, antalet i tretakt (1, 2, 3) |

F6 har nu pil 7, duo kant 6, duo orbital 7. Expertens familjer: alla sju; antal kommer från F7-ersättaren eftersom ingen F6-grupp har en antalsdimension kvar. Familjen på duo-formfrågorna är satt per variant (vandring för kant + form, flera för de två nya orbital + form).

## Kedjan

`validate-figurserier` 96 utan fel och alla sju familjer på avancerad och expert; `v7-facit-check --serie` utan fel; `v7-distraktor-check --serie` utan fel; `v7-geometri-check --serie` utan fel (störst 115 noder, 11,9 kB); vitest-fixturerna för FS1 till FS6, S5, S6, S11 till S14 gröna.

## Beslut

Per id i `docs/qa/figurserier/granskning-02.md`. Efter ditt ja befordrar jag till `bank*.json` och sätter `BANK_BEFORDRAD`.
