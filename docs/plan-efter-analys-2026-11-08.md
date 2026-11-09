# Plan efter analysen 8 november 2026

Underlag: `docs/rapporter/analys-2026-11-08.{html,md,pdf}`. Den 8 november godkände ägaren saas-leads beslut ("Jättebra förslag") och sa åt oss att arbeta med relevanta agenter tills ägaren är tillbaka. Statusraden under varje punkt uppdateras av den som gör jobbet.

Ordningen nedan är genomförandeordningen. Det som kräver ägaren ligger sist.

## A. Rätta tratten (Opus, worktree .claude/worktrees/publikt-v2)

1. **Provets resultat leder till Nivåkollen och första passet**, inte till det gamla matrislogiktestet. I P2 hamnade 16 av 29 konton från provet i det gamla testet.
   Status: klar 2026-11-09, b83626f8, live. Provets resultatsida har Nästa steg: Nivåkollen ("Kolla min nivå, 5 min", räknar in provets svar), dagens pass om Nivåkollen är gjord. Kom igång-brickan för matrislogik leder också till Nivåkollen. Kvar: avläsning, andel provkonton med Nivåkollen som första test, omkring 23 nov.
2. **Laga kontosteget efter provet.** 143 klick på provets kontoknapp gav 29 konton. Klicktesta vägen på Pixel 7 och desktop, mät varje steg med felkod och rätta där användarna faller bort.
   Status: klar 2026-11-09, 8ff9acd1, live. Klicktest Pixel 7 och desktop (docs/qa/tratten-2026-11-08). Tappet sker före första tangenttrycket (158 såg kontosteget, 30 började). Rättat: Tillbaka startade om provet (nu står resultatet kvar), samtycket täckte provets svar, köpstegets villkorsruta och testets bekräftelse. Nya händelser sample_restored och draft_claim_failed med felkod. Kvar: namnfältet behölls (kräver beslut), riktig Google-inloggning testas av ägaren.
3. **Köpknapp i spärren över grundnivån.** 27 personer stoppades där och knappen fick 0 klick. Ge spärren en direkt väg till kassan för Premium, 149 kr i månaden, och mät klick.
   Status: klar 2026-11-09, 24952967, live. Statusraden på testresultatet har Köp Premium, 149 kr i månaden (pris ur plans) direkt till köpsteget, plats testresultat, mätt med betalvagg_visad och paywall_cta_clicked. Kvar: avläsning av klick och köp, omkring 23 nov.
4. **Fråga 1 i registreringen tas bort.** Kill-regeln slog till med 61–65 % tapp. Utan förvalt intent går /register direkt till kontosteget, och valet görs i valj-spar efteråt. **HBO-varianten stryks** ur plan och minne.
   Status: klar 2026-11-09, 233ae609, live. Bar /register går direkt till kontot, frågan ställs i spårvalet. HBO-regeln struken i beslutsdokumentet och minnet. Kvar: avläsning fyra veckor efter deploy enligt C.
5. **Mätningen rättas:**
   - grant execute på `admin_undantagna_konton()` till `supabase_read_only_user` (additiv, beslut 5)
   - raderade QA-konton ut ur PostHog-filtret
   - `acquisition_source` på alla nya konton
   Status: klar 2026-11-09, 18fba2e7, live. (a) grant körd mot Jobbcoach och som migration, läsrollen har rätten, anon och authenticated inte. (b) 198 raderade QA-konton markerade, kohort 248676 räknas om, nivamatning_klar har 13 personer utanför kohorten, alla befintliga konton (var 108). (c) jc_attr var dubbelkodad och lästes fel i klienten: 0 av 35 e-postkonton hade källa. Rättat, och kontot får källan direkt när cookien saknas. Kvar: tre raderade konton med riktig webbläsare i september är inte markerade (kan vara riktiga användare).
6. **Början av Nivåkollen och passen.** De flesta avbrott sker på fråga 0–1. I numeriskt har 8 av 12 avbrutna inte svarat på en enda fråga. Se över första skärmen, instruktionen och tempot, särskilt på mobil.
   Status: klar 2026-11-09, a698e6d9, live. Samtycket täckte svarsalternativ i numeriska testet på Pixel 7 (8 av 12 avbröt utan svar) och Avsluta-knappen i testets bekräftelse. Nu hålls samtycket undan från svarslistor och ark. Nivåkollens första fråga laddar på 1,1 till 1,5 s. "smakprovet" ersatt med "provet". Kräver designbeslut: numeriska testet visar underlaget före frågan, så frågan ligger under skärmkanten på första skärmen.

## B. SEO (Opus skriver, SEO-agenten granskar; huvudcheckouten C:\Users\chris\cvbrev på egen gren)

7. **Titlar och beskrivningar på åtta sidor** med bra position men låg CTR:
   - /rakna-ut/timlon-till-manadslon
   - styrkor-svagheter-intervju
   - kompetensbaserad-intervju-star-metoden
   - cover-letter-sverige
   - personligt-brev-avslutning-exempel
   - ljuga-i-cv
   - soka-jobb-via-mail
   - rekommendationsbrev-exempel-mall
   Status: klar 2026-11-09, 03a7d39f och 5b70fbbe, live. Ny seoTitle och description på alla åtta (timlön: title och description), SEO-granskningen godkände alla. Kvar: avläsning av CTR omkring 7 december.
8. **Logiska tester tillbaka till plats 9.** Sidan föll från 9,5 till 11 och tappade 42 klick. Fördjupa texten, svara bättre på sökfrågorna och se över titeln.
   Status: klar 2026-11-09, 2170cca5, live. Fyra nya avsnitt mot frågorna sidan tappat (logiktest, logiktest rekrytering, gratis, begåvningstest, logiska frågor), ny seoTitle, inget borttaget. Kvar: avläsning av position omkring 7 december.
9. **Länk till testsidan i artiklarna om tester**, vid sidan av provet. Testsidan gav 41 konton i P1 och 5 i P2.
   Status: klar 2026-11-09, 1338a0b6, live. Provkortet i alla testartiklar har "Se alla tester och nivåer" till /verktyg/rekryteringstester; article_cta_clicked med slug, variant och target, hjältens knapp mäts som hero.
10. **Konverteringsvägar från de tre största artiklarna**: styrkor-svagheter, alva-labs, logiska-tester. Tydlig väg till provet och testsidan, med mätning.
    Status: klar 2026-11-09, 1338a0b6 och 5b70fbbe, live. Styrkor-svagheter har <TestKort /> (variant testkort), alva-labs och logiska-tester provkortet med testsidelänk. Kvar: läs article_cta_clicked per slug och target efter två veckor.
11. **Räkna ut leder vidare** till Jobbcoachen och testerna. Kalkylatorerna själva rörs inte.
    Status: klar 2026-11-09, 035efa8d, live. Lönesidornas Jobbcoachen-block och hubben har länk till provet och testsidan, klick mäts som article_cta_clicked med slug rakna-ut/<sida>. Kalkylatorerna orörda, vitest grönt.
12. **Innehållstakten tillbaka till 6–10 nya sidor i månaden**, testklustret först. Det har inte kommit någon ny sida sedan 13 oktober. Ämnen från växande frågor: spatial förmåga, logiktest exempel, arbetspsykologiska tester exempel, vanliga intervjufrågor, bakgrundskontroll. Följ artikelflödet i minnet och `docs/plan-content-2026-q4.md`. Varje sida ska ha både CV- och brevexempel där det är relevant.
    Status: 4 nya sidor 2026-11-09, 548bb2a3, live: arbetspsykologiska-tester, logiktest-exempel-med-losningar, matrigma-test, aon-cut-e-test (SEO-granskningen grön). Spatial förmåga som nytt avsnitt i rotation-test-guide i stället för ny sida; vanliga intervjufrågor och bakgrundskontroll har redan sidor (förbättras där). Kvar: 2 till 6 sidor till i november enligt plan-content-2026-q4.md, ägaren begär indexering.
13. **Huvudorden** "cv mall", "personligt brev" och "cv exempel" ligger på plats 35–54. Ta fram en egen plan till december. Bara plan nu, inget bygge.
    Status: klar 2026-11-09, 9d2c8852. Plan i docs/plan-huvudord-2026-12.md; sammanslagningarna M1 och M8 kräver ägaren.

## C. Avläsningar (inget bygge)

- Produktfilmen: 17 nov.
- Premium-förnyelser: 19 och 21 nov.
- Dag 2-väggen: senast 22 nov, eller när 40 personer har exponerats. Väggen ligger kvar till dess (beslut 1).
- Fråga 1: fyra veckor efter deploy, minst 60 ingångar.
- Kontosteget utan namnfält: 7 dec. signup_flow_viewed (step konto) till signup_completed, baslinjen 29 av 158.
- Dag 2-mejlet: 7 dec. email_log och email_events (öppning, klick) för pass_dag2, betalvagg_visad plats dag2 och paywall_cta_clicked från mejlets länkar (utm_campaign pass_dag2).

## D. Kräver ägaren (sist)

14. **Vercel Web Analytics.** Vi lägger in komponenten i `src/app/(public)/layout.tsx` och en rad om berättigat intresse i integritetspolicyn. Ägaren slår på det i Vercel-projektet.
15. **Mejl till kunden som slutar 2 december.** Vi skriver utkastet: tack, fråga vad som saknades, erbjud tre månaders paus. Ingen rabatt (beslut 6). Ägaren skickar.
16. **Indexering i Search Console och Bing** av de omskrivna sidorna efter punkt 7–12. Det går bara att göra i deras webbgränssnitt.
17. **Ägarens fråga: påminnelser till den som testat en gång.** Ett mejl eller en notis om nästa pass. Ingen gratisanvändare har gjort pass två olika dagar, och mobilanvändare återkommer hälften så ofta. Hänger ihop med avläsningen av dag 2-väggen.
    Status: dag 2-mejlet klart 2026-11-09 (godkänt av ägaren), 14897c97, live. Kravet på vald passtid (skiss 5) är borta: mejlet går 07:00 svensk tid till alla som gjorde Nivåkollen i går, i morgonslotten 06:00 UTC. Taket på två träningsmejl, quota_emails_opt_out och avregistreringen står kvar. Betalande får dagens pass. Gratis får nivån, länken till Nivåkollens genomgång och raden "Från dag två ingår passen i Premium, 149 kr i månaden" (pris ur plans) med länk till dagens pass, där väggen mäts. Ett riktigt testmejl gick till en egen QA-adress (delivered i email_events), kontot raderat per id. Torrtest `scripts/torrtest-dag2.ts`: 0 mottagare 10 nov (ingen ny Nivåkoll i dag kl. 10), 0 till 2 per dag de senaste två veckorna. Kvar: notis i appen, avläsning 7 dec.
18. **Ägarens fråga: test.se-kontot.** Det fångas inte av undantagsmönstret. Ska det in?
19. **Sammanslagningarna M1 och M8** i docs/plan-huvudord-2026-12.md. Ska de göras?
20. **Numeriska testet visar tabellen före frågan**, så att frågan hamnar under skärmkanten på mobil. Nivåkollens nedersta svarsrad slutar 4 px under kanten på desktop. Båda är designbeslut.
21. **Namnfältet i kontosteget**: behålla eller ta bort? Färre fält kan ge fler konton.
    Status: borttaget 2026-11-09 (godkänt av ägaren), 14897c97, live. /register och kontosteget efter provet har e-post och lösenord. send-confirmation fungerar utan namn ("Hej!"). CV-exporten (cv-mallar, skapa-cv, cv-analys) och brevet (generate och generate-preview) svarar 422 name_required och frågar efter namnet med NameRequiredNotice; brevet stoppas före modellanropet och får aldrig "Namn saknas" eller "Ditt namn". Topprad och sidomeny har reserv, hemvyn tilltalar utan namn, ProfilKomplettering ber om namnet. Klicktest Pixel 7 och desktop, docs/qa/namn-dag2-2026-11-09. Kvar: avläsning 7 dec mot baslinjen 29 av 158.
22. **Tre raderade konton från september** med riktig webbläsare är inte markerade som interna, eftersom de kan vara riktiga användare. Ägaren bedömer.
23. **Testa riktig Google-inloggning** från provet hela vägen. Det kan bara ägaren göra.
24. **Provsidan och kontosidan har den gamla designen** (/verktyg/rekryteringstester/prova och /register). De är vår viktigaste konverteringsväg men omfattades inte av publikt v2. Förslag: art-director tar fram en skiss i samma linje.
25. **vitest är inte grönt på main:** kandidater.test faller, och vitest i huvudcheckouten räknar in kopior under .claude/worktrees. Sajten påverkas inte. Rättas i nästa omgång: exkludera .claude i vitest-konfigurationen och laga testet.

## E. Omgång 2026-11-09 (saas-leads beslut, godkända av ägaren)

26. **Namnfältet borta ur kontosteget.** Klart och live 14897c97. Brev och CV-export frågar efter namnet när det behövs. Avläses 7 dec mot 29 av 158.
27. **Dag 2-mejlet utan krav på passtid.** Klart och live 14897c97. Går 07:00 (08:00 sommartid) till alla som gjort Nivåkollen dagen innan. Avläses 22 nov med väggen, sedan 20 dec.
28. **Riktiga figurer i testartiklarna**, med testernas egen ritare (`<MatrisUppgift>`). Klart och live 6e6d771e. Gäller logiktest-exempel-med-losningar, matrigma-test, logiska-tester och rotation-test-guide. I rotationsguiden är det falska löftet om rotationstest borta. Position avläses 7 dec.
29. **Provet och kontosteget i ny design** enligt den godkända skissen docs/design/skiss-prov-konto-2026-11-09.html. Byggt och testat på grenen feat/prov-konto-v2 (e57697da), inte på main. Ska gå live tidigast 23 nov enligt saas-lead. Före driftsättning:
    - ägaren ger Vercel-åtkomst eller en bypass-hemlighet så att förhandsvisningen kan klicktestas
    - ägaren testar riktig Google-inloggning
    - rebase mot main
    Målet är att provet till konto går från 18 till 30 %, och det avläses fyra veckor efter driftsättning.
30. **Ägarens beslut: percentilraden på provets resultat.** Den döljs tills minst 200 avslutade prov finns, och i dag finns 132. Cronen rensar ohämtade prov efter sju dagar, så underlaget når kanske aldrig 200. Ska vi föra en egen logg över utfallen, utan personuppgifter?
    Status: ägaren sa ja 2026-11-09. Klart och live på main. Tabellen `prov_utfall` sparar dag, testtyp, antal rätt, antal frågor och bankversion, utan konto, IP eller token. Bara servern når den (RLS utan policyer, anon och authenticated nekas, kontrollerat). Databasfunktionen `spara_prov_utfall` skriver en rad per rättat prov och undantar ägaren och testkontona som percentilen gör. Rättningen anropar den och fälls aldrig av ett fel. Backfillen förde in 135 prov och kan köras igen utan dubbletter. På grenen feat/prov-konto-v2 läser percentilen nu `prov_utfall`, med samma gräns på 200 och raden dold i nedre halvan. 65 prov saknas till 200. Begränsning: ett testkontos första prov från en ny adress räknas, eftersom raden inte går att koppla tillbaka när kontot sedan hämtar provet.
31. **Ägarens beslut: nya testtyper.** Se docs/rapporter/gap-testtyper-2026-11-09.md. Testansvarig rekommenderar i den här ordningen: spatial förmåga, talserier, deduktivt som pass och övningsprov, koncentration som egen modul för lokförare och piloter, och Nivåkoll för figurserier.

## F. Testplanen steg 1–3 (godkänd av ägaren 2026-11-09)

32. **Deduktivt får pass och övningsprov.**
    Status: klar 2026-11-09, 61096067, live (5afd0d84). Deduktivpasset (fyra uppgifter, lösningen efter varje svar, test_daily_pass) och övningsprovet (SHL Verify deduktiv 12 uppgifter på 18 minuter, vårt format 16 på 20, test_exam_mode). Räknas i dagsringen, serien och Pass per testtyp. Banken: DD7 till DD9 nya, 31 uppgifter pensionerade från bankversion 2 och ersatta av lagade kopior som testansvarig godkänt (docs/qa/deduktiv/granskning-03.md). Kvar: dd-a-d2-22 och platstyngden (testansvarig, nästa omgång).
33. **Nivåkollen för figurserier, deduktivt, verbalt och numeriskt.**
    Status: klar 2026-11-09, c29a938b och 5afd0d84, live. Samma räkning och skala som matrisens, nivåpunkt per testtyp, dagens pass väljs efter nivån, gratis första gången per typ. Kalibreringen i docs/qa/tester-steg1-2026-11-09/resultat.md. Klicktest 111 av 112 (den röda en förväntad 403), perf inom budget. Kvar: avläsning av nivamatning_klar per test_kind omkring 23 nov; dag 2-mejlet gäller fortfarande bara matrisen (beslut för ägaren).
34. **Provet utan konto för verbalt, numeriskt och figurserier.**
    Status: spec klar 2026-11-09, 5d87ff2b (docs/design/spec-prov-fler-typer-2026-11-09.md). Byggs efter 23 nov på feat/prov-konto-v2. Kräver före bygget: art-directors beslut om numeriskt på mobil (punkt 20), testansvarig om fem uppgifter i verbalt och numeriskt, ägarens ja till en additiv migrering (test_kind på anon_test_sessions och prov_utfall).
35. **Steg 2, vyerna: Mitt test är … och Alla tester.**
    Status: klar 2026-11-09, live (vyagenten, feat/tester-steg2-vyer). Ingången har två steg: "Vad ska du göra för test?" med åtta val (Polisen eller Försvarsmakten syns först när en av I-provets typer är live), varianter som chips, "Så lägger vi upp det", Lokförares anmärkning och kryssrutorna under Annat. Valet sparas i test_planer.mitt_test, mitt_test_variant och extra_typer (additiv migrering 20261109140000, körd i prod, RLS oförändrad: en SELECT-policy, inga skrivrättigheter för anon eller authenticated). Alla tester: raden Mitt test, Ingår i ditt test överst, Fler tester som rader som fäller ut kortet. Hemvyn: passraderna roterar efter valet. Klicktest 76 av 76 (docs/qa/tester-steg2-vyer-2026-11-09/klicktest-del1.json). Kvar: CLS 0,018 på /dashboard/tester/installningar kommer från cookiebannern och finns redan i produktion.
36. **Steg 2, vyerna per ny testtyp och I-prov-provet.**
    Status: väntar på motorerna på main (talserier, spatial förmåga, ordförråd). Flaggor per typ i src/lib/tester/steg2Status.ts.
37. **Steg 2, motorerna: talserier, spatial förmåga och ordförråd.**
    Status: klara 2026-11-09 på main (motoragenten, feat/tester-steg2-motorer). Inget syns för användare; vyerna (punkt 36) byggs på API:erna nedan.
    - Talserier: `src/lib/talserierV1` (bank 72 per nivå, 216). Åtta regelfamiljer, en lucka på grund och två från avancerad, facit ur regeln, typade distraktorer. Spärrar TS1 till TS10 i `scripts/lib/talserie/sparrar.mjs` (TS1 prövar hela regelbiblioteket plus polynom av grad 2, TS9 och TS10 stänger ledtrådar i de sorterade alternativen). API: `valjTalserier`, `talserieInnehall`, `bedomTalserieSvar`, `rattaTalserieSvar`, `talserieStatistik`, `TALRAD` (radens mått). Geometrisk på grund har taket 400 (granskningen).
    - Spatial förmåga: `src/lib/spatialV1` (24 per form och nivå, 216). Form A brickfigur (SP-A1 till A7), B pappersvikning med hål och klipp (SP-B0 till B7, facit baklänges och framlänges), C tärningar (SP-C1 till C7, lösare i öppen värld, 24 vridningar). Ritare `SpatialSvg`, geometrin i riktig SVG via `scripts/spatial-geometri-check.mjs`. API: `valjSpatial` (fem per form, aldrig samma form i följd), `valjForm` (pass, I-prov-deltest, `klipp`-filter), `spatialInnehall`, `bedomSpatialSvar`, `spatialPerForm`. Avvikelser från briefen: grund A har 4×4-ram och 5 till 6 rutor, B expert ligger på 4×4 (hål i 6×6 rör konturen), krysset i C är en åttaarmad stjärna.
    - Ordförråd: `src/lib/ordforradV1`, 190 uppgifter (grund 38 synonymer och 36 motsatsord, avancerad 45 och 27, expert 39 och 5). Gemini föreslår, facit verifierat mot SO och SAOL via svenska.se:s sök-API; där de saknar uppgiften krävs Wiktionary och synonymer.se båda och raden märks så (33 rader). OF1 till OF8 i `scripts/validate-ordforrad.mjs`. `ordforradRedo()` är falskt tills varje nivå och typ har 40: kvar 2 synonymer och 4 motsatsord på grund, 13 motsatsord på avancerad, 1 synonym och 35 motsatsord på expert (54 uppgifter). Expertmotsatser är knappa i alla källor; förslag: låt expert dra motsatsord ur avancerad tills banken räcker, eller skriv dem för hand.
    - Testansvarig har granskat alla tre typerna. Underkännandena (distraktorer, misstagstexter, variation, krysset, ord på fel nivå) är rättade i generatorerna, ordbankens strykningar står i `src/lib/ordforradV1/kandidater/granskning-2026-11-09.json`. Kvar enligt granskningen: ifyllda distraktorer i ordbanken är ibland slumpmässiga (kräv minst en ur samma fält i nästa omgång), grund C kan hamna under 70 procent (kalibreras efter avläsningen).

## Arbetsregler

- Högst två arbetsplatser: `.claude/worktrees/publikt-v2` för A och huvudcheckouten för B. Inga nya worktrees, ingen `npm ci` per kopia.
- QA-bilder läggs aldrig i git. Bara md- och json-resultat committas.
- Ett fullt bygge per push. Per fix räcker tsc, berörda vitest och en skärmdump.
- SEO-diffen (`scripts/seo-diff-artiklar.ts` med baslinjer i `scripts/seo-baslinje/`) körs före varje push av publika sidor. Den fäller pushen om rubriker, FAQ, länkar eller metadata försvinner, eller om ordantalet sjunker mer än 2 %. Godkända ändringar av titel och description läggs in som undantag med datum och skäl.
- Push till main efter klarad grind. Verifiera Vercel och live.
- Husregler:
  - inga talstreck (—)
  - inga mittpunkter mellan fakta
  - svenska facktermer
  - produktens ord: Nivåkollen, övningsprov, Premium, personliga brev, Jobbcoachen
- Testdata: radera bara egna rader med id, aldrig efter tidsfönster.
