# Rummen, våg 3b: passet, mätningen och resultaten

Datum 2026-10-11. Branch `design/rummen-3b` (från `design/rummen-klar` a1de6d1a). Byggt av Opus enligt spec-rummen avsnitt 0, 6 (våg 3b), 7, 9 och 12 till 18 och konceptets ramar P1 till P4, S1, M1, K1 och O1.

## Vad som är testat, och hur

Testmotorns migreringar är inte körda i prod, så `/api/traning` går inte mot prod-databasen ännu. Klicktestet är därför gjort mot förhandsvisningen `/dashboard/tester/forhandsvisning-pass?ram=…` (finns bara med `NODE_ENV=development` eller `TRANING_FORHANDSVISNING=1`), som kör exakt samma komponenter (`PassFlode`, resultatskärmarna, `Kvitto`, `Uppvarmning`) mot ett fixtur-API med riktiga V7-frågor ur banken, blandade som i passet och vända till klientens form med motorns egen `sessionsvy()`. Talen är specens exempeltal (bilaga 11).

Det som rör databasen är testat med vitest mot PGlite (`src/lib/traning/__tests__/resultat.pglite.test.ts`: mätning, pass och ommätning genom motorn, sedan resultatskärmarnas funktioner på det motorn svarade). E2E mot riktig data finns som `scripts/qa-rummen-vag3b-prod.mjs` och körs när ägaren kört migreringarna.

Klicktestet: produktionsbygge (`NEXT_DIST_DIR=.next-v3b`, `next start` med `TRANING_FORHANDSVISNING=1`), riktig Chrome via puppeteer, inloggat testkonto `qa-rummen-3b-*@jobbcoach-qa.test` (raderat efteråt med id, 1 profil och 79 rader i `user_activities`). `node scripts/qa-rummen-vag3b.mjs --port <port>`.

- Pixel 7 med adressfältet framme (412 × 859, DPR 2, touch) och dator 1280 × 900.
- Ljust och mörkt systemläge.
- Tumtryck (`touchscreen.tap`) på 412 px i klickflödena.

## Resultat

`resultat.json`: **0 problem.**

| Kontroll | Utfall |
|---|---|
| Kopparknappen inom viewport utan scroll (P2, P3, P4, S1, M1, M1 betalande, O1; P1, M0, K1, uppvärmningen har ingen) | Alla 44 ram-vyer ok |
| Exakt en kopparknapp per vy | Ok |
| Inget rött i passet och resultaten (`--fel` i beräknad färg) | 0 element |
| Kopparfärgad text på väggen bara som koppar-ljus | 0 avvikelser |
| Minsta text 11 px (axlar i DOM) | Ok i alla vyer |
| Horisontell scroll | Ingen |
| Konsolfel, 4xx/5xx | Inga |
| Sidan laddas om mellan frågorna | 0 navigeringar i hela passet, ljust och mörkt |
| Mätningen visar regeln under tiden | Nej |
| Uppvärmningen har tidsrad | Nej |
| prefers-reduced-motion: stegen i sluttillståndet direkt | Ja (opacitet 1 på alla sju steg) |

Prestanda (`npx tsx scripts/perf-inloggat.ts --port <port> --forhandsvisning --filter 3b`, Pixel 7, 3x CPU, LTE, median av tre):

| Vy | LCP | CLS | Budget |
|---|---|---|---|
| Passets fråga (P1) | 956 ms | 0 | 2 000 |
| Resultatet P4 | 1 452 ms | 0 | 2 000 |
| Mätningen M1 | 1 204 ms | 0 | 2 000 |
| Ommätningen O1 | 1 960 ms | 0 | 2 000 |
| Uppvärmningen | 908 ms | 0 | 2 000 |

Resultatskärmarnas LCP inkluderar avslöjandet i fyra steg (sista steget börjar 1 020 ms). O1 ligger nära gränsen; kurvan står i steg 3.

Övrigt: `tsc` grönt, `vitest` 102 filer och 1 193 tester gröna, `next build` grönt, `node scripts/grep-rummen.mjs --vag 3b --noll` och `--vag 1b --noll` noll, `node scripts/kontrast-rummen.mjs` inga avvikelser.

## Skärmdumparna

- `ram-<ram>-<pixel7|desktop>-<ljust|morkt>.png`, och `-botten.png` för resultatskärmarna rullade till slutet. Ramar: P1, P2, P3, P4, S1, M0 (mätningens fråga), M1 (gratis), M1-betalande, O1, K1, uppvarmning.
- `klick-pass-<ljust|morkt>-01..08`: fråga 3, fel svar med regeln, fråga 4, "Vet inte, visa regeln", sista frågan, resultatet, resultatet nertill, genomgången.
- `klick-matning-01..03`: mätningens första och andra fråga (ingen regel), M1.
- `klick-uppvarmning-01..05`: tre frågor, regeln efter varje, klar.
- `reducerad-rorelse-P4.png`.

## Kvar att göra efter migreringarna

1. `node scripts/qa-rummen-vag3b-prod.mjs --bas <server>`: mätning (med ett svar spärrat i nätet och en omladdning mitt i), ett pass, ommätning, kontroll av nivåpunkter och sessioner i databasen, städning med id.
2. `npx tsx scripts/perf-inloggat.ts` mot `/dashboard/tester/pass/<id>` på riktigt.
3. Byt `KurvaTillfallig` mot våg 2:s `Kurva` i `OmmatningResultatVy.tsx` (en import). Den tillfälliga kurvans y-axel är SVG-text och skalas till cirka 8 px på datorns 640 px-kolumn; våg 2:s kurva har texten rätt.
