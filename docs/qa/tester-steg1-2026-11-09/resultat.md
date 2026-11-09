# Testplanen steg 1, kontroller före push

2026-11-09. Gren `feat/tester-steg1` (worktree `.claude/worktrees/publikt-v2`). Ägaren borta; byggt och kontrollerat självständigt.

## Commits

| Uppgift | Commit |
|---|---|
| Deduktivt: pass, övningsprov, bankversion 2 (DD7 till DD9) | 61096067 |
| Nivåkollen för figurserier, deduktivt, verbalt och numeriskt | c29a938b |
| Spec för provet utan konto i fler typer (byggs efter 23 nov) | 5d87ff2b |
| Klicktestets rättelse: Din utveckling visar Pass per testtyp även utan klassiskt test, klicktest och resultat | se planens avsnitt F |

## Statiska kontroller

- `npx tsc --noEmit`: grönt.
- vitest på berörda kataloger (traning, tester, ovningsprov, nivakoll, deduktivV1, dashboard/tester, email, onboarding, components/traning): 485 gröna, 10 överhoppade, 0 röda.
- `node scripts/validate-deduktiv.mjs`: grönt. DD1 till DD6 över kandidater och banker, DD7 till DD9 över bankens aktiva uppgifter.
- `npm run build`: grönt (två gånger, andra gången efter rättelsen i Din utveckling).

## Deduktiva banken

DD7 (ett alternativ medför ett annat, i D3 med antagandet), DD8 (D2: facit kräver alla villkor vid tre, alla utom ett vid fyra eller fler) och DD9 (udda facit: alla fyra distraktorer delar form eller element som facit saknar) infördes efter testansvarigs granskning 02 och 03. 31 uppgifter pensionerades från bankversion 2 (`pensionerad_fran: 2`) och ersattes av lagade kopior med nytt id, samma pussel, omvalda distraktorer (sex med nytt facit). De kända fallen dd-g-d2-09, 10 och 11 är bland dem. Testansvarig löste alla ersättare för hand: 31 godkända, 5 strukna och omlagade (granskning-03.md, beslut-03.json). Golvet håller: 30, 30 och 20 i version 2. Gamla sessioner läser version 1 oförändrat.

Kvar från testansvarig: dd-a-d2-22 klarar DD9 men har fyra relationsdistraktorer mot ett platsfacit (förslag: pröva plats mot relation i DD9), och de lagade distraktorerna är oftast platspåståenden.

## Kalibreringen av Nivåkollen

Samma modell som matrisens Nivåkoll, inga egna normer. Varje uppgift ligger på nivå b = 1 + 9 × (1 − p), där p är bankens p_prior (uppmätt i fraga_statistik från 30 svar). Nivån är den θ där väntat antal rätt är lika med faktiskt, med stödet på 5,5 och taket 7,5. Kontrollerat mot bankerna (snitt p och b per banknivå, `src/lib/nivakoll/__tests__/nivakoll.test.ts`):

| Typ | Grund | Avancerad | Expert | Avancerat pass från | Nivå vid 0 rätt / alla rätt |
|---|---|---|---|---|---|
| Figurserier (9 uppg.) | b 3,4 | b 5,3 | b 6,6 | 5,2 | 1,7 / 7,5 |
| Deduktivt (6 uppg.) | b 3,6 | b 5,0 | b 6,4 | 5,6 | 1,8 / 7,5 |
| Verbalt (8 påst.) | b 3,6 | b 4,3 | ingen passform | 5,6 | 1 / 7,1 |
| Numeriskt (8 frågor) | b 3,6 | b 4,9 | b 5,0 | 5,4 | 1 / 7,5 |

Banknivåerna ligger i rätt ordning på skalan i alla typer, och nivån växer strikt med antal rätt. Dagens pass blir avancerat när väntad andel rätt på typens grundbank är minst 85 (samma gräns som "sitter" i de klassiska testen). Svagheten: verbalt avancerad ligger nära grund (p 0,63 mot 0,71), så verbala skalan skiljer sämre i toppen, och priorerna är bankens egna tills fraga_statistik har 30 svar per uppgift.

## Perf (Pixel 7, 3x CPU, LTE, `--samtycke`, Premium-QA-konto)

Nya sidor: deduktivpasset 840 ms, deduktivens startark 948 ms, deduktivprovet 504 ms, Nivåkollen 1020 ms, kurvan 980 ms, Alla tester 1036 ms. Alla inom budget, CLS 0. Två sidor över budget i första körningen (hemvyn 1964 ms och deduktiv testsida 5072 ms) mättes om med tre körningar: 956 och 932 ms, inom budget. Rådata: `perf.json`.

## Klicktest (riktig Chrome, puppeteer-core)

`scripts/qa-tester-steg1-2026-11-09.mjs`, resultat i `klicktest-lokal.json`. 111 av 112 kontroller gröna; den enda röda var en förväntad 403 i konsolen när gratis öppnar deduktivpasset (betalväggen), filtret rättat och omkört grönt för övriga genomgångar.

- Gratis, Pixel 7 ljust och 1280 mörkt, nya konton via /register: raden Nivåkollen på testkorten, deduktivts provrad lever, Nivåkollen i alla fyra typerna med nivå, skala, dagens pass och genomgång med förklaring, fyra nivåpunkter (en per typ), deduktivpasset spärrat med Premium, 149 kr i månaden, hemvyn och Fler kurvor visar nivån per typ.
- Premium (premium_grants), Pixel 7 mörkt och 1280 ljust: Nivåkollen deduktivt med "Starta deduktivpasset" i foten, deduktivpasset med lösningen efter svaret och resultatet, övningsprovet i deduktivt (startark, uppgift, inlämning, resultat och genomgång med lösningen), hemvyn bockar passet, kurvan visar nivån, Din utveckling räknar deduktivpasset.
- Hittat och rättat under testet: Din utveckling visade det tomma läget för den som bara gjort pass och Nivåkoll (ingen kurva i matris, inget klassiskt test), så Pass per testtyp syntes aldrig. Nu räknas passen.
- Kvar som designbeslut (inte nytt): på Pixel 7 står numeriska underlaget före frågan, så alternativ C och D ligger under kanten på första skärmen i Nivåkollen (planens punkt 20).

Skärmdumparna och index.md ligger utanför git: `scratchpad/verifiering-2026-11-09/tester-steg1/`.

## Testdata

Sex QA-konton, alla skrivna med id till kontofilen. Räknat före radering och raderat per id med `scripts/qa-registrering-stada.mjs`: 20 testsessioner, 12 nivåpunkter, 4 premium_grants, 6 email_confirmations, 12 email_schedule, 114 user_activities, 6 profiler, 6 auth-konton. Kontrollfrågan efteråt: 0 kvar. Loggar: `stadning-torrkorning.json`, `stadning-kord.json`.
