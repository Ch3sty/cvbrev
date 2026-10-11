# Rummen, slutbranchen klar-3: 19.5, 22.3 (a), våg 4 inmergad, 21.3 (a) och copywriterns våg 4-texter

Branch `design/rummen-klar`, 2026-10-11. Klicktestat i riktig Chrome mot ett produktionsbygge (`NEXT_DIST_DIR=.next-klar3`, `TRANING_FORHANDSVISNING=1`, port 5246). Tre konton med unika adresser för körningen: `qa-klar3-gratis-1791691484111`, `qa-klar3-hela-1791691484111` (Hela paketet via `premium_grants`), `qa-klar3-mycket-1791691484111` (fyra CV, fem brev, fem sökta tjänster, nio testsessioner, en sparad analys), alla `@jobbcoach-qa.test`. Migreringarna är inte körda i prod, så testrummets hemvy och pass är testade mot förhandsvisningarna och ingångens sparande mot prod (felet visas, aldrig "sparat").

## Grindar

| Kontroll | Resultat |
|---|---|
| `npx tsc --noEmit` | Inga fel |
| `npx vitest run` | 107 filer, 1 253 tester, alla gröna |
| `NEXT_DIST_DIR=.next-klar3 npx next build` | Godkänt (två gånger, andra efter rättningen av Brevet klart) |
| `grep-rummen.mjs --vag 1b/2/3b/4 --noll` | Alla fyra noll. Nya importer av `RumIkoner` utanför baslinjen: 0 |
| `kontrast-rummen.mjs` | 240 textpar, inga avvikelser, lägsta 4,5:1 |
| Banken: `validate-v7-questions` och `v7-parallel-check` på alla sex banker, `v7-facit-check`, `berika-v7-banker --kontroll` | Alla godkända |
| `testmotorn-pglite.mjs` | Alla kontroller gick igenom |
| `qa-rummen-knappar-360.mjs`, tre konton, testrummets och våg 4:s routes | 171 routebesök, 142 primärknappar, 0 röda. Texter över 30 tecken: "Köp Hela paketet, 149 kr i månaden" (34), "Tillbaka till Rekryteringstester" (32). `knappar-360.json` |
| `perf-inloggat.ts --forhandsvisning`, alla 48 routes | 44 av 48 i första körningen; de fyra över budget mättes om med tre körningar och ligger inom: dashboard 936 ms, jobbmatchning 652, linkedin steg 2 672, skapa-cv steg 7 1 224 (CLS 0). CLS 0 överallt (0,001 är mätbrus). `perf-inloggat.json` |

## Klicktest

| Del | Skript | Resultat |
|---|---|---|
| Hemvyn i Rekryteringstester, alla tillstånd, ingången, nätfel | `qa-rummen-vag2.mjs --ut docs/qa/rummen/klar-3` | 0 fel i alla tillstånd, Pixel 7 och 1280, ljust och mörkt. W3: Generalrepetitionen-raden spänner två spalter, Fler tester i tredje. 1as: en text. 1a: "Mätningen är gratis" i kortets fot. `hem/`, `ingang/`, `natfel/` |
| Passets ramar och klickflöden | `qa-rummen-vag3b.mjs --email <hela>` | 0 problem. `pass/` |
| Våg 4: vyer, ssr, dörrar, sidomeny, tema, landning, spara | `qa-rummen-4.mjs --prefix qa-klar3` | Alla vyer ok på tre konton. Spara: nätfel ok på båda bredder; lyckat sparande gav raden (letter_id rätt) men skriptets kontroll läste innan sidan visat "ligger redan", därav ANM i `resultat.json`. `vag4/` |
| Återupptagen analys (21.3 punkt 2) | `qa-rummen-klar3.mjs --bara aterupptagning` | Gratis och hela, Pixel 7 och 1280, ljust och mörkt: "Åtgärda i CV:t" landar i "Granska din nya version" (steg 5) utan betalvägg, `cv_analysis_jobs` 1 före och 1 efter, analysräknaren oförändrad. Bakåt tre gånger landar i CV-valet, ingen ny analys. `klar3b/aterupptagning-*` |
| Brevet klart (21.3 punkt 9) | `--bara klart` | Pixel 7 och 1280, ljust och mörkt: eyebrow BREVET KLART i koppar-ljus (#F4B98A), h1 "Ditt brev till Klarna", "Brevet täcker 4 av de 6 krav … Azure saknas.", Lägg till Azure, Spara som sökt tjänst. Rörelsen `upp` på tre steg; ingen animation under prefers-reduced-motion. `klar3b/klart-*` |
| Första raden på dator, tomt Mina CV, hemmet | `--bara tomtcv,forstarad,hem` | Tre lyfta kort med överkant 282, väggens underkant 312 (30 px), ljust och mörkt. Mina CV utan CV: uppladdningen i lyftkortet, ingen kopparknapp, ingen förtroenderad (också 360). Hemmet utan "Det här har du gjort", Nästa handling "Följ upp Region Västra Götaland" till tjänsten. Jobbmatchningen utan `.thread-chain`. `klar3/` |

Fel hittat i QA-skripten under körningen: `sb.auth.verifyOtp` på service-klienten sparar QA-användarens session på klienten, så skriptens räkningar och raderingar efteråt gick som den användaren (RLS) och såg 0 rader. Det förklarar också våg 4:s "rader som försvann". Rättat i alla Rummen-skript (egen klient för inloggningen). Raderna som blev kvar under felet raderades med id efteråt.

Testdata: kontona raderade med id, räknade före varje delete (gratis 248 aktivitetsrader; hela 1 CV, 1 grant, 244 aktiviteter; mycket 6 sökta tjänster, 5 brev, 4 CV, 9 sessioner, 1 grant, 520 aktiviteter; analysraderna följde med CV:na), gratiskontots tillfälliga CV och analys raderade med id (1 + 1 per körning). Kontrollerat efteråt: 0 rader kvar och auth-användarna borta.
