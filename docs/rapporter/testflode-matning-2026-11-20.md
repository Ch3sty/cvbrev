# Testflödet: mätkontroll efter sessionsramen

Datum: 2026-11-20, avläst cirka 09:00. Etapp 7 i `docs/plan-testflode-2026-11-20.md` (avsnitt 8 och 9). Källor: PostHog projekt 148688 (`scripts/posthog-query.ts`), Supabase (`logic_test_v4_sessions`, `user_activities`). Ägarens konto (kohort 248676) och QA-konton (`jobbcoach-qa`, raderade QA-konton) är bortfiltrerade.

## När etapperna gick live

| Etapp | Commit | Live (push, svensk tid) |
|---|---|---|
| 1, ramen på figurserier | `fe390a12`, `3c4418a8` | 2026-11-20 03:12 |
| 2, ord och text, siffror och tabeller | `fe9d7e4b` | 04:25 |
| 3, figurer och mönster, deduktiv | `f445750f` | 05:23 |
| 4, talserier, spatial, ordförråd, I-provet, personlighet | `51ec6be7`, `716c8a9a`, `799a0d9a` | 05:33 till 06:01 |
| 6, Nivåkollen i alla åtta typer | `235f0033` | 06:50 |
| 5, städning och Testklar | `604cd61d` | 08:12 |
| 7, betalväggarna och mätningen | se byggnoterna | 2026-11-20 |

## Baslinjen (före ramen)

Slutförande, Supabase 22 aug till 20 nov (saas-leads förslag avsnitt 0): figurer och mönster grundnivå 91 %, Nivåkollen matris 70 %, ord och text grundnivå 63 %, Träna matris 83 %, siffror och tabeller grundnivå 33 % (11 av 27 utan ett svar), figurserier grundnivå 92 %, ord och text expertnivå 0 av 9, deduktiv, talserier, spatial och ordförråd grundnivå 100 %. 18 % av testkontona kom tillbaka en andra dag.

Betalväggarna, PostHog 30 dagar till 2026-11-20: 199 visningar, 20 klick, 10 % per visning; dator 12 %, mobil 7 %. Per plats senaste 60 dagarna (visningar / klick på köpknappen): `test_tak` 46 / 0, `dag2` 46 / 0, `testresultat` 35 / 0, `matning` 27 / 0 (köpknappen på Nivåkollens resultat mättes inte före ramen; ett köp med plats `matning` kom 2026-11-15), `riktat` 16 / 0, `testniva` 6 / 2, `ommatning` 3 / 0, `generalrepetition` 1 / 0. Köp med plats senaste 90 dagarna: `matning` 1, `testniva` 1, `test_tak` 1, `kvot` 1.

De bevarade händelserna, veckan före (13 till 19 nov, riktiga användare): `betalvagg_visad` 52 hos 16, `milstolpe_nadd` 46, `nivamatning_klar` 26 hos 23, `pass_klart` 17 hos 13, `nivamatning_startad` 17 hos 12, `paywall_shown` 14, `feature_blocked` 9, `vet_inte_tryckt` 8, `kalibreringsfraga_svarad` 7, `pass_startat` 6, `paywall_cta_clicked` 5, `generalrepetition_klar` 4. `test_completed` i `user_activities`: 3 till 15 per dag.

## Första dygnets siffror (03:12 till cirka 09:00)

- **Inga riktiga användare har startat en testsession sedan etapp 1.** Supabase: alla sessioner i `logic_test_v4_sessions` sedan 03:12 tillhör QA-konton. Fönstret är natt och tidig fredagsmorgon; samma fönster förra fredagen hade inte heller någon av händelserna i 8.1.
- PostHog: alla `test_*`-händelser (8.2) sedan 03:12 kommer från QA-konton (etapp 5:s premiumkonto och etapp 7:s gratiskonton), och alla serverhändelser (`nivamatning_klar`, `pass_klart`, `ommatning_klar`, `generalrepetition_klar`, `provpaket_klart`, `kalibreringsfraga_svarad`, `milstolpe_nadd`) från QA-konton som är raderade. Ingen gammal händelse har alltså tappat volym; det finns ingen riktig volym att jämföra ännu.
- Händelserna kommer fram med rätt egenskaper. Kontrollerat i riktig Chrome med `navigator.webdriver` avstängt (posthog-js skickar inget annars) och `capture`-anropen fångade, på dator och Pixel 7, mot ett lokalt produktionsbygge med och utan Black Week-klocka:
  - `test_start_viewed` med `test_kind`, `lage`, `niva`, `format`, `fortsatt_tillganglig`, `sparrad` på alla startskärmar (alla åtta typer i Träna, Nivåkollen, nivåtest, övningsprov, I-provet, personlighet).
  - `betalvagg_visad` en gång per vägg med `plats` och, från etapp 7, `test_kind` och `lage`; `paywall_shown` med `price_shown: true` och `kampanj`; `paywall_cta_clicked` med `plats`, `kampanj`, `test_kind` och `lage`.
  - `nivamatning_startad` med `test_kind` och `betalvagg_visad` plats `matning` på Nivåkollens resultat.
- `test_completed` skrivs fortfarande i `user_activities` (13 rader 20 nov, varav 3 från etapp 7:s QA), så adminens Tratt räknar som förut.
- Observation: QA-kontona ligger inte i kohort 248676, så deras händelser hamnar i PostHog. Dashboarden och frågorna ovan filtrerar på e-postens `jobbcoach-qa`; serverhändelser från raderade QA-konton saknar e-post och filtreras bara bort i Supabase-kontrollen. Vid avläsningen: räkna på Supabase för slutförande, som planen säger.

## Dashboarden

"Testflödet" i PostHog: https://eu.posthog.com/project/148688/dashboard/1134121 (beskrivning i `docs/rapporter/posthog-dashboard-testflodet.md`). Tratten startskärm, startad, slutförd per `lage` och per `test_kind`, tabellen per läge och typ, och betalväggarna per plats och enhet och per läge och typ.

## Avläsning

Enligt planen avsnitt 8.3, aldrig tidigare:

| Avläsning | Datum | Vad |
|---|---|---|
| 14 dagar efter sista etappen | **2026-12-04** | Slutförande per dörr mot baslinjen (Supabase, samma fråga), avbrutna utan svar, betalväggen klick per visning per plats och enhet (målet: minst 10 % totalt, mobil i nivå med dator; under 8 % på 100 visningar utreds), återkomst andra dagen |
| Fyra veckor efter | **2026-12-18** | Samma, med större volym |
| Vaktpunkt, dagligen första veckan | 21 till 27 nov | Matrisens slutförandegrad grundnivå, inte under 90 % (etapp 3) |

Black Week (23 till 29 nov) och Cyber Monday (30 nov) ligger i första fönstret och höjer sannolikt klicken per visning; jämför dag för dag och läs december för sig. Black Week-avläsningarna 1 och 20 dec påverkas inte.
