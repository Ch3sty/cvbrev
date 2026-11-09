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

## D. Kräver ägaren (sist)

14. **Vercel Web Analytics.** Vi lägger in komponenten i `src/app/(public)/layout.tsx` och en rad om berättigat intresse i integritetspolicyn. Ägaren slår på det i Vercel-projektet.
15. **Mejl till kunden som slutar 2 december.** Vi skriver utkastet: tack, fråga vad som saknades, erbjud tre månaders paus. Ingen rabatt (beslut 6). Ägaren skickar.
16. **Indexering i Search Console och Bing** av de omskrivna sidorna efter punkt 7–12. Det går bara att göra i deras webbgränssnitt.
17. **Ägarens fråga: påminnelser till den som testat en gång.** Ett mejl eller en notis om nästa pass. Ingen gratisanvändare har gjort pass två olika dagar, och mobilanvändare återkommer hälften så ofta. Hänger ihop med avläsningen av dag 2-väggen.
18. **Ägarens fråga: test.se-kontot.** Det fångas inte av undantagsmönstret. Ska det in?
19. **Sammanslagningarna M1 och M8** i docs/plan-huvudord-2026-12.md. Ska de göras?
20. **Numeriska testet visar tabellen före frågan**, så att frågan hamnar under skärmkanten på mobil. Nivåkollens nedersta svarsrad slutar 4 px under kanten på desktop. Båda är designbeslut.
21. **Namnfältet i kontosteget**: behålla eller ta bort? Färre fält kan ge fler konton.
22. **Tre raderade konton från september** med riktig webbläsare är inte markerade som interna, eftersom de kan vara riktiga användare. Ägaren bedömer.
23. **Testa riktig Google-inloggning** från provet hela vägen. Det kan bara ägaren göra.
24. **Provsidan och kontosidan har den gamla designen** (/verktyg/rekryteringstester/prova och /register). De är vår viktigaste konverteringsväg men omfattades inte av publikt v2. Förslag: art-director tar fram en skiss i samma linje.
25. **Ett vitest-test faller redan på main** (kandidater.test för /for-rekryterare). Det påverkar inte sajten men bör rättas i nästa omgång.

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
