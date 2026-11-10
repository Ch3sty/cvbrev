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
    Status: klar 2026-11-09 (vyagenten, feat/tester-steg2-vyer). Talserier, spatial förmåga och ordförråd har nivåtest (grund fri, avancerad och expert tests_above_base), pass (test_daily_pass, genomgången efter varje svar) och genomgång på en gemensam motorväg (src/lib/tester/steg2, /api/steg2/[kind], /api/traning/steg2pass). Passen räknas i dagsringen, serien och Pass per testtyp; nivåtesten i korten och historiken. Ordförrådet körs bara när ordforradRedo() är sant. Övningsprovet för I-prov 2025 (/dashboard/tester/iprov, test_exam_mode): halva provet förvalt, servern äger klockan och ett avslutat deltest går inte att öppna igen, resultatet är antal rätt per deltest, aldrig stanine. Polisen eller Försvarsmakten syns i Mitt test. Klicktest i docs/qa/tester-steg2-vyer-2026-11-09/klicktest-slut.json. Kvar: SHL G+-paketet, Nivåkoll och kurva för de nya typerna (väntar på kalibrering), CLS 0,018 från cookiebannern på /dashboard/tester/installningar.
37. **Steg 2, motorerna: talserier, spatial förmåga och ordförråd.**
    Status: klara 2026-11-09 på main (motoragenten, feat/tester-steg2-motorer). Inget syns för användare; vyerna (punkt 36) byggs på API:erna nedan.
    - Talserier: `src/lib/talserierV1` (bank 72 per nivå, 216). Åtta regelfamiljer, en lucka på grund och två från avancerad, facit ur regeln, typade distraktorer. Spärrar TS1 till TS10 i `scripts/lib/talserie/sparrar.mjs` (TS1 prövar hela regelbiblioteket plus polynom av grad 2, TS9 och TS10 stänger ledtrådar i de sorterade alternativen). API: `valjTalserier`, `talserieInnehall`, `bedomTalserieSvar`, `rattaTalserieSvar`, `talserieStatistik`, `TALRAD` (radens mått). Geometrisk på grund har taket 400 (granskningen).
    - Spatial förmåga: `src/lib/spatialV1` (24 per form och nivå, 216). Form A brickfigur (SP-A1 till A7), B pappersvikning med hål och klipp (SP-B0 till B7, facit baklänges och framlänges), C tärningar (SP-C1 till C7, lösare i öppen värld, 24 vridningar). Ritare `SpatialSvg`, geometrin i riktig SVG via `scripts/spatial-geometri-check.mjs`. API: `valjSpatial` (fem per form, aldrig samma form i följd), `valjForm` (pass, I-prov-deltest, `klipp`-filter), `spatialInnehall`, `bedomSpatialSvar`, `spatialPerForm`. Avvikelser från briefen: grund A har 4×4-ram och 5 till 6 rutor, B expert ligger på 4×4 (hål i 6×6 rör konturen), krysset i C är en åttaarmad stjärna.
    - Ordförråd: `src/lib/ordforradV1`, 251 uppgifter (grund 48 synonymer och 43 motsatsord, avancerad 55 och 44, expert 54 och 7). `ordforradRedo()` är sann. Ägarens beslut 2026-11-09: nya kandidater skrivs för hand, inte av Gemini (`scripts/ordforrad/handskrivna.mjs`, 66 i banken; de 185 från första omgången står kvar, granskade), och expert kräver 40 uppgifter totalt och minst 5 motsatsord, resten svåra synonymer (`nivaRedo` i status.ts; `valjOrd` fyller testet med synonymer när motsatsorden inte räcker). Facit verifierat mot SO och SAOL via svenska.se:s sök-API; där de saknar uppgiften krävs Wiktionary och synonymer.se båda och raden märks så (43 rader). OF1 till OF8 i `scripts/validate-ordforrad.mjs`. Testansvarig granskade de 66 handskrivna: 62 godkända, underkännandena (en exempelmening, alternativ som kan försvaras) är rättade. Kvar: några avancerade motsatsord (import, inkomst, ankomst) är vardagsord, följs upp i kalibreringen.
    - Testansvarig har granskat alla tre typerna. Underkännandena (distraktorer, misstagstexter, variation, krysset, ord på fel nivå) är rättade i generatorerna, ordbankens strykningar står i `src/lib/ordforradV1/kandidater/granskning-2026-11-09.json`. Kvar enligt granskningen: ifyllda distraktorer i ordbanken är ibland slumpmässiga (kräv minst en ur samma fält i nästa omgång), grund C kan hamna under 70 procent (kalibreras efter avläsningen).

## G. SEO-planen för de nya testerna, produktdelen (saas-leads slutliga beslut 2026-11-10)

Del 1, live på main (4c2e5b45, Vercel Ready):

- [x] 1. `test_kind` på `anon_test_sessions` och `prov_utfall`, standard `matris` (32ce2c07). Körd i prod 10 nov: 166 och 142 rader före och efter, RLS och rättigheter oförändrade.
- [x] 2. "Spatial förmåga" som namn, "Rumsuppfattning: vridna figurer, pappersvikning, tärningar" som underrad (86bdbae9).
- [x] 2b. Ägaren 10 nov: "I-provet" och "I-provet, övningsprov" i stället för "I-prov 2025". Startarket säger en gång att versionen heter I-prov 2025 och används sedan maj 2025 (0e7ec545).
- [x] 3 och 4. `mitt_test` och källan från artikeln (e3628840). Kakan `jc_provkalla` sätts vid klick från en testartikel till testerna, provet eller registreringen, och av `?mitt_test=` på provet och registreringen. Länkar på hubben och i artiklar kan bära `?mitt_test=iprov|matrigma|alva|shl|aon|lokforare`. `acquisition_source.kalla` blir `smakprov:<slug>` eller `artikel:<slug>`, planen får valet tyst på valkommen-sidan, `mitt_test_valt` med surface artikel eller hubb. `betalvagg_visad` och `paywall_cta_clicked` får `konto_kalla` och `mitt_test`, kassans metadata `konto_kalla`, `mitt_test` och `provdatum`.
- [x] 5. Provdatumskärmen `/dashboard/tester/provdatum` efter kontot, bara för iprov och lokforare utan datum, variant och datum, "Jag har inget datum än". Aldrig i kontosteget.
- [x] 6. Dag 2-mejlet för alla typer (61fffdfb). Torrtest 10 nov: 0 mottagare i morgon, 6 de senaste 14 dagarna, alla matris. Inga Nivåkollar i de nya typerna i prod än.
- Klicktest del 1: 46 av 46 i riktig Chrome (Pixel 7 och 1280, ljust och mörkt), namnet 16 av 16. Testkonton raderade per id. Upp till 7 rader i `prov_utfall` från klicktestet går inte att peka ut (anonyma, ingen nyckel) och står kvar.

Del 2, live på main samma dag (ägaren 2026-11-10: allt i ett svep, inte 23 nov). Gren `feat/prov-konto-v2` rebasad och fast-forward till main:

- [x] 7. Provet och kontosteget i ny design (skissen 2026-11-09) live.
- [x] 8. Provet utan konto i alla typer: `/verktyg/rekryteringstester/prova?typ=` figurer, verbal, numerisk, deduktiv, spatial, talserie, ordforrad och iprov (sex uppgifter, en per deltest, utan tid). Urval, rättning och genomgång med testernas motorer (`src/lib/tests/prov-typer.server.ts`), facit lämnar aldrig servern före kontot. Utfallen per `test_kind` i `prov_utfall` (sparas av servern, databasfunktionen orörd). Första Nivåkollen i figurserier, deduktivt, verbalt och numeriskt räknar in provets svar. Steg 2:s typer fortsätter i grundtestet, I-provet i deltestet där hon tappade mest, med övningsprovet i Premium.
- [x] 9. `<ArtikelProv typ=... />`: uppgift 1 i artikelns HTML med alternativen synliga, inga rubriker, ett svar startar provet på sidan. Våg 1: alva-labs-logiktest, matrigma-test, logiska-tester, logiktest-exempel-med-losningar (matris), rotation-test-guide (spatial), deduktivt-induktivt-test. Våg 2: verbalt-test-guide, numeriskt-test-guide, aon-cut-e-test (figurserier), talserier, ordforstaelse-test, i-prov. `/prova` är noindex som förut.
- [x] Sakfelet om pappersvikningen (SEO-agenten 10 nov): texterna säger samma deltester i samma ordning och uppgifter som tränar samma förmåga, och att vår vikning går åt andra hållet. Den omvända riktningen (ark med hål, välj ihopvikt form) kräver ny generator, ny form i banken, nya spärrar och genomgång.
- [x] Pappersvikning i I-provets riktning (ägaren 10 nov: "Gör det, ett svep"). Källorna (logiktester.se, testttalent.se, rustadsoldat.se) säger: deltest 2 pappersvikning visar ett utvikt ark med streckade viklinjer, välj hur det ser ut ihopvikt; deltest 6 med klipp går från vikt till utvikt, alltså vår form B. Ny form D i spatialV1 (`scripts/lib/spatial/hopvikning.mjs`): ark med hål och klipp, facit framlänges och baklänges, regeln att hål och klipp syns bara genom alla lager, distraktorer spegelvänd, fel viklinje, ett hål för mycket eller för lite, klipp på fel kant. Spärrar SP-B2-1 till SP-B2-10, mätning i riktig SVG (pilen fri från hål och klipp). 24 per nivå, grund en vikning, avancerad två, expert tre. SPATIAL_VERSION 2: nivåtestet 4 A, 3 B, 4 C, 4 D (version 1 oförändrad), passet A, D, C, A, D, B, I-provets deltest 2 och provet utan konto drar form D, deltest 6 kvar på B med klipp. Formnamn Pappersvikning (D), Uppvikning (B utan klipp), Pappersvikning med klipp. Testansvarig grönt efter två omgångar, SEO-agenten grönt på i-prov och rotation-test-guide (nya egna exempeluppgifter). Grind: tsc, vitest, valideringen och geometrin, build, SEO-diff 0 fel (undantag i `scripts/seo-baslinje/vikning-ihop-2026-11-10-undantag.json`), LCP 0,42 till 0,64 s, klicktest 92 av 92 i riktig Chrome (Pixel 7 och 1280, ljust och mörkt). Testkonton raderade per id.
- Numeriskt på mobil (specens öppna fråga till art-director): frågan och alternativen först, underlaget under, från 1024 px som i testerna. Art-director kan ändra.
- Grind: tsc, build, vitest (3 kända fel från main: kandidater, admin frågor), SEO-diff 0 fel på 48 sidor, LCP 0,42 till 0,63 s på artiklarna med prov, `/prova` och `/register`, inloggat inom budget. Klicktest 270 av 271 och 216 av 216 i riktig Chrome mot produktionsbygget (alla typer till konto och genomgång, Pixel 7 och 1280, ljust och mörkt, alla tolv artiklar). Testkonton raderade per id, 85 rader i `prov_utfall` från klicktestet raderade per id.
- Förhandsvisningen klicktestades inte: `VERCEL_AUTOMATION_BYPASS_SECRET` saknas i `.env.local`.

## G. SEO-planen för de nya testerna, innehållsdelen (ägarens beslut 2026-11-10)

Plan: docs/plan-seo-nya-tester-2026-11-10.md, avsnitt 3 och 5. Grind per push: tsc, build, SEO-diffen (undantag i scripts/seo-baslinje/seo-nya-tester-2026-11-10-undantag.json), perf på mobil under 1,0 s, SEO-agenten mot tre svenska konkurrenter och testansvarig. Skärmdumpar utanför git.

- [x] U3. deduktivt-induktivt-test: provkort med Nivåkollen, nivåer, pass och övningsprov; länkar med "deduktivt test" från logiska-tester, aon-cut-e-test och arbetspsykologiska-tester. Sajtkartan har sidan, två klick från startsidan (1485283c, 14b711ce). Indexering: ägaren.
- [x] U1. rotation-test-guide: seoTitle, description, Spatial förmåga (rumsuppfattning), pappersvikning och tärningar med egna lösta uppgifter, FAQ om testet (38a28b29).
- [x] N2. /artiklar/talserier och U4 länken från logiktest-exempel (07454b68).
- [x] N3. /artiklar/ordforstaelse-test (f494a316).
- [x] N1. /artiklar/i-prov, säljsidan (c2e45952).
- [x] U2. /verktyg/rekryteringstester: åtta testtyper, "Vilket test ska du göra?", FAQ om I-provet, featureList (a4e7e652). Korten 2026-11-10: provlänkarna bär ?typ= och ?mitt_test= enligt 5.2 (Polisen till I-provet, SHL deduktivt, Aon och Lokförare figurserier, övriga matrisprovet), artikellänkarna rena eftersom artikeln sätter sitt eget val, klicken mäts med variant hub-val-artikel/prov-<val> och target, källan förblir 'hubb' genom provet. Klicktestat Polisen till konto på Pixel 7 och 1280: mitt_test iprov, acquisition_source kalla hubb (2c7496c1).
- [x] U5, U6, U7, U9. Länkarna, "Aon-testet för lokförare", navet, /funktioner (751cae7a).
- [ ] U8. Matrigma-ägarskapet: efter avläsningen 7 dec.
- [ ] U10. Inbäddade prov i numeriskt- och verbalt-guide: produktsidan, efter 23 nov.
- Gemensamt beslut 2026-11-10 (saas-lead, säljansvarig, SEO): hubbens title "Rekryteringstester: gratis logiktest, I-provet och mer" (54 tecken) prövas inte nu utan vid avläsningen 7 dec, och tidigast efter baslinjen 18 dec. Saas-lead: titeln ändrades just i U2 och planens regel är att inte ändra titlar under avläsningsfönstret, annars går effekten inte att läsa av. Sälj: ordet logiktest drar delvis den som aldrig betalar (logiktester.se är gratis utan konto), så bytet ska vägas mot konton per källa, inte bara klick. SEO: logiktester.se är starkast på "logiktest gratis" och vår title saknar ordet, så det är rätt nästa test, men ett byte i taget. Ingen säger emot att vänta.
- Gemensamt beslut 2026-11-10: tabellen med lokförarmodulerna (Aon e3+, NAV, rt med flera) läggs i aon-cut-e-test först när N5 är beslutad 9 feb. Saas-lead: modulen och N5 avgörs av räknaren för valet Lokförare (minst 15 konton), och innehållet ska följa produktbeslutet. Sälj: en tabell full av moduler vi saknar skickar den köpbenägna besökaren till konkurrenten innan vi har något att sälja. SEO: JobTestPrep vinner på modulnamnen, men H2:n tar söket på ärlighet och källa tills dess. Ingen säger emot.
- Fynd till ägaren: produktens texter för pappersvikning (iprov.ts, copy.ts) sade "viks upp". Rättat 10 nov med form D; tärningarnas svarsformat (lika eller olika) skiljer sig fortfarande från vårt.

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
