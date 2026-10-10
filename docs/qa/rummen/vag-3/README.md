# Våg 3: motorn och banken ihop (design/rummen-3), 2026-10-11

`design/rummen-3` = `design/rummen-3a` (motorn) + `design/rummen-3c` (banken) och testansvarigs beslut i spec-rummen avsnitt 14 och 15.

## Klicktest i riktig Chrome

Produktionsbygget (`.next-3`) på port 3497, puppeteer med systemets Chrome, `scripts/qa-rummen-3.mjs`, ett nytt konto (`qa-rummen-3-a-2026-10-11@jobbcoach-qa.test`, Hela paketet via `premium_grants`, skapat med `scripts/qa-rummen-3-konton.mjs`). Skärmdumpar och `resultat.jsonl` i `klicktest/`.

| Flöde | Vy | Resultat |
|---|---|---|
| Ny klassisk grundsession: start, 15 svar, omladdning mitt i, inlämning, resultat, genomgång | Pixel 7 | Alla steg OK. Sessionen fick `meta.bank_version: 2` och `alternativ_blandade`; 12 av 15 frågor kom ur 3c-banken, ingen pensionerad. Samma ordning efter omladdning, svar på originalindex, 14 av 15. Genomgången visar familjens namn på varje rad ("0:01 · Vridning"), ingen "svårighet". Inga konsol- eller nätverksfel. |
| Gamla sessioner (avslutad och pågående, utan meta) | Desktop 1280 | Resultat och genomgång som förut ur de 28 frusna (A rätt, B fel), pågående session har kvar svaren, nytt svar lagras i bankens ordning. Den pågående innehöll den nu pensionerade v7g-q2, som visas och rättas som förut. |

Testraderna raderade efter körningen, räknade före varje delete och bara på kontots id: 3 sessioner, 16 aktivitetsrader, 1 premium_grant, 1 profil, sedan kontot.

## Granskningsbilder (spec 15.10 och 15.11)

- `../vag-3c/granskning-15/ringar/`: alla 15 frågor med ringceller efter rättelsen av ringrenderaren.
- `../vag-3c/granskning-15/rattade/`: v7g-q25, v7-q5, v7-q8, v7-q11, v7-q13, v7-q15 och två 3c-frågor med rutans plats i misstaget.

## Klicktest före main (2026-10-11, efter merge av origin/main e158144f)

Produktionsbygget (`.next-3m`) på port 3498, samma skript, nytt konto `qa-rummen-3-a-2026-10-11@jobbcoach-qa.test` (Hela paketet via `premium_grants`). Skärmdumpar och `resultat.jsonl` i `klicktest-main/`.

| Flöde | Vy | Resultat |
|---|---|---|
| Ny klassisk grundsession | Pixel 7 | Alla steg OK: `bank_version 2` och `alternativ_blandade`, 12 av 15 ur 3c, samma ordning efter omladdning, 14 av 15, genomgången med familjens namn. Inga konsol- eller nätverksfel. |
| Smakprovet, anonymt | Pixel 7 | OK: 3 av 5 rätt, svaren lagras på originalindex. Första körningen gav FEL i `resultat.jsonl` eftersom skriptet räknade urvalet ur de 28 frusna; nya smakprov har `bank_version 2`. Skriptet läser nu versionen ur raden, andra körningen gick igenom. |

Raderat efteråt, räknat före varje delete och bara på kontots id och de två egna token: 1 session, 9 aktivitetsrader, 1 premium_grant, 1 profil, kontot och 2 rader i anon_test_sessions. Kontrollräknat till 0 efteråt. Rader i public_rate_limits från smakproven (egen QA_IP-nyckel) är inte raderade; de går ut av sig själva.
