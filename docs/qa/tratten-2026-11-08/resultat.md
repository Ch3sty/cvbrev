# Tratten efter analysen 8 november, klicktest

Del A punkt 1 till 6 i `docs/plan-efter-analys-2026-11-08.md`. Klicktest med `scripts/qa-tratten-2026-11-08.mjs` i riktig Chrome (puppeteer-core) på Pixel 7 (412 x 915) och desktop (1280 x 800) mot ett produktionsbygge. Resultat per kontroll i `resultat-lokal.json` (59 av 60 godkända) och efter driftsättning i `resultat-live.json` (59 av 60, samma kvarvarande punkt: Nivåkollen 4 px under kanten på desktop). Skärmdumparna ligger utanför git.

## Vad klicktestet hittade

| Fynd | Var | Åtgärd |
|---|---|---|
| Provets resultat ledde till det gamla grundtestet ("Gör grundnivån") | /dashboard/tester/prov/[token] | Nästa steg är Nivåkollen ("Kolla min nivå, 5 min"), som räknar in provets fem svar. Har kontot redan gjort Nivåkollen leder knappen till dagens pass. Kortet står direkt under resultatet. Kom igång-brickan för matrislogik leder också till Nivåkollen. |
| Tillbaka från registreringen startade om provet, med tre prov per IP och dygn | /verktyg/rekryteringstester/prova | Resultatet sparas i fliken och visas igen. 80 av dem som lämnade kontosteget i P2 gick tillbaka till provet. |
| Samtycket täckte svarsalternativen på provets första fråga | provet, Pixel 7 | Samtycket glider undan medan frågan syns (useFriSikt), frågan rullas in i bild. |
| Samtycket täckte "Avsluta och se resultat" i testets bekräftelse | alla ark (Sheet), Pixel 7 | Samtycket ligger aldrig över ett öppet ark. |
| Samtycket täckte svarsalternativ B till D i numeriska testet | numeriskt, verbalt, text- och sifferpass, Nivåkollen | Samma mönster på svarslistorna. |
| Samtycket täckte rutan som måste kryssas före kassan | köpsteget, båda storlekarna | Samtycket glider undan medan villkorsrutan syns. |
| Ingen attribution för konton med e-post (0 av 35 i P2) | jc_attr | Cookien är dubbelkodad och klienten avkodade en gång. Läsaren tål nu båda, och post-signup sparar källan direkt när cookien saknas. |
| Kontostegets underrad talade om "bedömningen" | /register?test= | Egen rad för provet. |
| Mittpunkt mellan två fakta i spärrens fotrad | provets resultat | "Gratis konto, inget kreditkort." |
| "Fem räknas från smakprovet" i Nivåkollens topprad | Nivåkollen | "Fem svar från provet räknas in". |

## Mätning per steg i tratten från provet

sample_started, sample_completed och signup_gate_shown (provet), signup_started med cluster test (kontoknappen), sample_restored (ny: resultatet visas igen efter Tillbaka), signup_flow_viewed step konto entry smakprov, signup_started med metod, signup_failed med steg och felkod, signup_completed, draft_claimed eller draft_claim_failed (ny, felkod http_404, http_401, utan_redirect eller natverk) och signup_landed. Spärren över grundnivån: betalvagg_visad och paywall_cta_clicked med plats testresultat.

## Kvar och kräver beslut

- Numeriska testet på mobil och desktop: underlaget (tabell eller diagram) står före frågan, så frågan och svaren ligger under skärmkanten på första skärmen. Att flytta frågan först eller fälla ihop underlaget är ett designbeslut.
- Nivåkollen på desktop 1280 x 800: nedersta raden svarsalternativ slutar 4 px under skärmkanten. Kräver ingen åtgärd utan designbeslut om täthet.
- Provet på desktop: kortet är högre än skärmen, så svarsalternativen kräver en rullning. Samma sak, designbeslut.
- Namnfältet i kontosteget behölls. Bara 3 personer föll på namnet i P2, och tappet sker innan någon börjar skriva (158 såg steget, 30 började). Att ta bort fältet kräver att bekräftelsemejlet och profilen klarar konton utan namn.
- Riktig Google-inloggning kan inte testas utan ett riktigt konto. Klicktestet följer knappen fram till Supabase och kontrollerar att jc_signup bär provet.

## Testdata

24 QA-konton (`qa-tratten-*@jobbcoach-qa.example.com`, 20 lokalt och 4 live) och 12 anonyma prov raderades per id efter räkning, se `stadning-kord.json` och `stadning-live-kord.json`. 7 egna rader i public_rate_limits (lokala QA-IP:n) raderades per ip_hash. Kontona är markerade som interna i PostHog.
