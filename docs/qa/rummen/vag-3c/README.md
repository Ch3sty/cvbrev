# Våg 3c: matrisbanken, QA

Branch `design/rummen-3c` (från `fix/samlad-2026-10-10`), 2026-10-10.

## Valideringskedjan, alla sex banker

| Kontroll | Resultat |
|---|---|
| `node scripts/validate-v7-questions.mjs <bank>` (struktur, anti-trivial, läsbarhet, family/difficulty/misstag, identiska alternativ, rätt svar jämnt fördelat efter blandning över 1 000 sessioner) | 6 av 6 godkända. Fördelningen A-F ligger mellan 16,1 och 17,2 procent i alla banker. |
| `node scripts/v7-parallel-check.mjs <bank>` | 6 av 6 godkända |
| `node scripts/v7-facit-check.mjs` (facit ur de synliga rutorna, tvetydighet, latinska kvadrater, family och misstag i takt med generatorn, unika id och rutnät; strikt kontroll av 3c-frågorna) | 270 frågor, inga fel. 35 upplysningar om de frusna bankerna (se rapporten). |
| `node scripts/berika-v7-banker.mjs --kontroll` | De frusna bankerna är aktuella |
| `npx tsc --noEmit` | Inga fel |
| `npx vitest run` | 89 filer, 1 047 tester, alla gröna (nytt: `bank3c.test.ts`) |
| `NEXT_DIST_DIR=.next-3c npx next build` | Godkänt |

## Klicktest i riktig Chrome

Produktionsbygget (`.next-3c`) på port 3493, puppeteer med systemets Chrome, skriptet `scripts/qa-matris-blandning.mjs` med två nya konton (`qa-matris-3c-{a,b}-2026-10-10@jobbcoach-qa.test`, Hela paketet via `premium_grants`, skapade med `scripts/qa-rummen-3c-konton.mjs`). Skärmdumpar och `resultat.jsonl` i `klicktest/`.

| Flöde | Vy | Resultat |
|---|---|---|
| Grund: start, 15 svar, omladdning mitt i, inlämning, resultat, genomgång | Pixel 7 | Alla steg OK. Samma ordning efter omladdning, svar lagras på originalindex, 14 av 15, genomgången visar samma bokstäver. Inga konsol- eller nätverksfel. |
| Expert: samma flöde | Desktop 1280 | Alla steg OK, inga fel. |
| Gamla sessioner (avslutad och pågående, skapade i formatet före blandningen) | Pixel 7 | Resultat och genomgång som förut, pågående session har kvar svaren, nytt svar lagras i bankens ordning. |

Testraderna är raderade efter körningen, räknade före varje delete och bara på de egna kontonas id: per konto 3 sessioner, 16 respektive 9 aktivitetsrader, 1 premium_grant, 1 profil, sedan kontot.

## Granskningsbilder

`granskning/`: 87 PNG (två eller fler per familj och nivå, plus de frusna frågor som väntar på manuell granskning) och `index.html` med alla. Ritade med appens egna renderare i Pixel 7-storlek, facit markerat, regeln och misstag per alternativ under.
