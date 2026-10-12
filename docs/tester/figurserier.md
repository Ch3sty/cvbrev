# Figurserier: kedjan och reglerna

Gäller testtypen `figurserie` (figurserier-grund, -avancerad, -expert) från omgång 2. Beställning: `docs/design/tester-v2-2026-10-11/bestallning-omgang2.md` avsnitt A. Visuellt: `figurserier-spec.md`. Granskningar: `docs/qa/figurserier/granskning-01.md`, `-02.md` (och `-03.md`).

## Kedjan, i ordning

| Steg | Kommando | Vad |
|---|---|---|
| Generator | `node scripts/gen-figurserier.mjs` | 36/30/30 ur mallarna F1 till F7 till `src/lib/figurserierV1/kandidater/generator/`, deterministiskt |
| Granskade kandidater | `node scripts/figurserier-omgang3.mjs` | bygger `kandidater/{grund,avancerad,expert}.json` ur förra omgången och testansvarigs beslut (behåll, nya alternativ, ersättare) |
| Validering | `node scripts/validate-figurserier.mjs` | fält, p_prior per mall, kvoter (primitiv ⌈n/3⌉, struktur ⌈n/2⌉), familjer, unik rad och lägesrad per nivå, alla spärrar |
| Facit och spärrar | `node scripts/v7-facit-check.mjs --serie` | FS1 till FS6, S5, S6, S11 till S15, reglerna återger raden och är den enklaste läsningen |
| Distraktorer | `node scripts/v7-distraktor-check.mjs --serie [--visa]` | kraven i A5 och S14 |
| Geometri | `node scripts/v7-geometri-check.mjs --serie <filer>` | G1 till G12, zonerna S1 till S5 för duo, G3 över alla duo-kombinationer, V11 (120 noder, 14 kB) och V12 |
| Granskningsbilder | `node node_modules/tsx/dist/cli.mjs scripts/render-matris-granskning.tsx <katalog> --serie --fil=<fil> [--bara=id,id]` | en PNG per fråga i 360-mått |
| Befordran | `node scripts/befordra-figurserier.mjs --beslut=<beslut.json>` | bara godkända id till `bank*.json`, golvet 28 per nivå, kedjan körs, `BANK_BEFORDRAD = true` |

Koden: `scripts/lib/serie/` (celler, tolkning, spärrar, distraktorer, misstag, recept, generator, struktur). Appen läser bara bankfilerna; kandidatkatalogen importeras aldrig (`kandidater.test.ts`). Lokalt klicktest före befordran: `befordra-figurserier.mjs --lokalt` och `NEXT_PUBLIC_FIGURSERIER_QA=1`, sedan `git checkout src/lib/figurserierV1/bank*.json`.

## Reglerna som granskningarna lagt till

- Strålar har minst två streck; ett streck med punkt läses som en nål.
- Duo med kant har exakt en prick; kärnsymbolen är aldrig en prick.
- Ingen cykel över lägen eller vinklar; antal på grupprimitiver (strålar, sektorhjul, 3×3-kant) bara i steg (S15).
- S12: inga distraktorvärden utanför regelns nåbara mängd.
- S14: ingen regel bryts av alla fem; på expert en nära miss och två som bryter alla; med en konstant en nära miss per regel bland dem som håller konstanterna. Generatorn håller konstantbrotten till två (tre när raden inte ger fler rena).
- Ingen lägesrad två gånger per nivå.

## I appen

`src/lib/figurserierV1/` (typer, urval 15 av poolen seedat på sessionId, rättning, familjer, status), rutterna `/api/figurserier/{session,answer,complete}`, vyerna i `src/components/tests/serie/`. Sessionerna i `logic_test_v4_sessions` med `meta.serie_version: 1`. Frågestatistiken får `test_kind: figurserie`; rapporterna kräver migreringen `20261012130000_fraga_rapporter_figurserie.sql` (före den sparas de som matris med id fs-...).

## Omgång 3: bryter mönstret, parti 2, figurpasset och övningsprovet

Beställning `bestallning-omgang3.md` A1 till A5, spec `figurserier-spec.md` 7 och 15, granskning `docs/qa/omgang3-e/granskning.md` och `beslut.json`, `beslut-tillagg.json`.

| Steg | Kommando | Vad |
|---|---|---|
| Bryter mönstret | `node scripts/gen-figurserier.mjs --bryter` | B1 till B4, 16 grund och 16 avancerad, till `kandidater/bryter-{grund,avancerad}.json` |
| Parti 2 | `node scripts/gen-figurserier.mjs --parti=2` | 8 grund (F1, F2) och 16 avancerad (F4, F5), `fran_version: 2`, till `kandidater/parti2-*.json` |
| Ersättare | `node scripts/figurserier-omgang3-ersattare.mjs` | samma id, ny rad, för de strukna i parti 2 |
| Bryter-kontroll | `node scripts/v7-facit-check.mjs --bryter` och `v7-geometri-check.mjs --bryter` | struktur, BM1 till BM5, G1, G2, G4, G11, G12, S1 till S5, S8, V11 (70 noder, 8 kB), V12 |
| Befordran | `node scripts/befordra-figurserier-omgang3.mjs` | godkända till `bankBryter*.json` och `bankParti2*.json`, golvet 12 bryter per nivå, kedjan körs |

Regler: BM1 entydig (ingen regel i biblioteket pekar ut en annan figur; regler som håller för alla sex räknas inte; B4 utan symmetri), BM2 olika, BM3 fria egenskaper minst tre värden, BM4 brytaren aldrig ensam om ett värde (B4: granne inom två lägen), BM5 synlig skillnad (antal, tom mot svart, 90 eller 180 grader, spegling). F9 i `sparrar.mjs`: första serien förlängd får inte ge facit (s0 + 3·ke ≠ s1 + 2·ko mod 8). F2: samma primitiv, riktning och startantal högst en gång per nivå. Blocket i B1 påstår ingen vridning.

Banker: de klassiska nivåtesten drar ur `bank{Grund,Avancerad,Expert}.json`. Från `serie_version: 2` väljs pensionerade frågor (`pensionerad_fran: 2`: fs-e-vrid-02, fs-e-antal-04) aldrig; sessioner med version 1 drar som förut och visar sin genomgång. Figurpass och övningsprov läser `harnastPool` (nivåtestets bank utan pensionerade plus parti 2) och `bryterPool` (tom under golvet).

Appen: figurpasset `src/lib/tester/pass-figur*.ts`, `/api/traning/figurpass/*`, `src/components/traning/figurpass/` (`test_type: figurserie-pass`, `test_daily_pass`); övningsprovet `Provtyp figurer` i `src/lib/ovningsprov/` (`test_type: figurserie-prov`, `test_exam_mode`, Aon 20 på 5 minuter med cirka, övriga 20 på 15). Klicktest `scripts/qa-omgang3-e.mjs`, bilder i `docs/qa/omgang3-e/klicktest/`.
