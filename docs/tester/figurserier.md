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
