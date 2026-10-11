# Rummen, slutbranchen: våg 2 + 3b efter granskningen (19 och 20)

Branch `design/rummen-klar`, 2026-10-11. Våg 2 och 3b sammanslagna enligt spec 20.6 och rättade enligt testansvarigs avsnitt 19 och art-directors avsnitt 20 (a). Klicktestat i riktig Chrome mot ett produktionsbygge (`NEXT_DIST_DIR=.next-klar2`, `TRANING_FORHANDSVISNING=1`, port 5241). Migreringarna för testmotorn är inte körda i prod, så hemvyn och passet är testade mot förhandsvisningarna (fixturer ur riktiga V7-frågor) och ingången mot prod (sparandet ger felet, aldrig "sparat").

## Grindar

| Kontroll | Resultat |
|---|---|
| `npx tsc --noEmit` | Inga fel |
| `npx vitest run` (PGlite installerat) | 103 filer, 1 226 tester, alla gröna |
| `NEXT_DIST_DIR=.next-klar2 npx next build` | Godkänt |
| `node scripts/grep-rummen.mjs --vag 1b --noll`, `--vag 2 --noll`, `--vag 3b --noll` | Alla tre noll |
| `node scripts/kontrast-rummen.mjs` | Inga avvikelser, lägsta textpar 4,5:1 |
| `validate-v7-questions.mjs` och `v7-parallel-check.mjs` på alla sex banker, `v7-facit-check.mjs`, `berika-v7-banker.mjs --kontroll` | Alla godkända, bankerna aktuella |
| `node scripts/testmotorn-pglite.mjs` | Alla kontroller gick igenom |
| `npx tsx scripts/perf-inloggat.ts --port 5241 --forhandsvisning --filter tester` | 14 av 14 inom budget, CLS 0 (0,001 är mätbrus under gränsen 0,002). Hemvyn 1b 824 ms (budget 1 000), O1 784 ms, P1 748 ms, uppvärmningen 1 180 ms. `perf-inloggat.json` |

## Klicktest

| Del | Skript | Resultat |
|---|---|---|
| Hemvyn, alla tillstånd (T1, T1s, 1a, 1as, 1t, 1b till 1i, 1p, X1, L1, F1; dator W1 till W4) | `scripts/qa-rummen-vag2.mjs --bara hem` | Pixel 7 och 1280, ljust och mörkt. En kopparknapp per vy och aldrig på väggen, inga streck, ingen SVG-text (all text på kurvan och skalan är HTML, 11 px), inga konsol- eller nätverksfel. `hem/` |
| Ingången E1 till E3-P och nätverksfel | `--bara ingang,natfel` | Kopparknappen i bild, Hoppa över i steg 2 och 3, planens text; sparandet mot prod visar felet. `ingang/`, `natfel/` |
| Passets alla ramar (P1, P2, P3, P4, S1, M0, M1, M1 betalande, M1 med grundpasset gjort, O1, O1 utan milstolpe, K1, uppvärmningen) och klickflödena | `scripts/qa-rummen-vag3b.mjs` | 0 problem. Dator: matrisen 400 px, alla sex alternativ i bild på 1280 × 900 i P1 och M0 (sista alternativet slutar på 804 px). Regeln står 12 px ovanför foten efter svaret. M1 gratis: ingen fot, knappen i paketkortet och i bild efter en rullning. Genomgången: "Gå igenom de sju missarna" ger "1 / 7" och sista missen "Fortsätt med de två rätta". Inga omladdningar mellan frågorna. `pass/` |
| Det gamla testflödet i mörkt läge | `scripts/qa-rummen-klar-matrisyta.mjs` | Grundnivån på Pixel 7 och 1280: frågans figurer, alternativen och genomgången ligger i `.matrisyta` och ritas i `--ink-1` (#F3F2F7), inte svart. `gamla-testflodet/` |

Testkontona (`qa-rummen-vag2-*@jobbcoach-qa.test` och `qa-rummen-3b-*`) är raderade med id, räknade före varje delete: 2 sessioner, 1 premium_grant, 116 aktivitetsrader, profilerna och auth-användarna.

## Vad som är ändrat, per punkt

Se rapporten till saas-lead i handoffen och spec 16.4 för (b)-punkterna.
