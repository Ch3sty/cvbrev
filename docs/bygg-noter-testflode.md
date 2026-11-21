# Byggnoter: testflödet i sessionsramen

Planen: `docs/plan-testflode-2026-11-20.md`. En rad per push med vad som gick live och hur det backas. Backning är alltid `git revert` av etappens commitserie; de gamla komponenterna står kvar i trädet till och med etapp 4, så en revert saknar aldrig kod.

## Etapp 0, sanningsrättelser (2026-11-20)

- Commit `b9c5699f`, "fix(tester): sanningsrättelser i testflödet, etapp 0".
- Backning: `git revert b9c5699f`.

## Etapp 1, ramen på figurserier (2026-11-20)

- Commits `fe390a12` "feat(tester): sessionsramen, etapp 1 figurserier" och `3c4418a8` (resultatet tonar in utan genomsläpp).
- Live: `src/components/session/` (SessionsRam, Svarskort, Klocka, Startskarm, Resultatskarm, Forklaringen, Uppgiftsarket, lägesflödena och figurseriernas typ) för figurseriernas nivåtest, Nivåkollen, Träna och övningsprov. Övriga typer går kvar i sina gamla komponenter.
- Databas: `profiles.test_installningar` (nullbar jsonb), migreringen `supabase/migrations/20261120200000_profiles_test_installningar.sql`, körd i produktion 2026-11-20. Kolumnen kan stå kvar vid en revert (ingen kod läser den då); ska den bort: `alter table public.profiles drop column if exists test_installningar;`.
- Backning: `git revert 3c4418a8 fe390a12`.

## Etapp 2, ord och text och siffror och tabeller (2026-11-20)

- Commit `fe9d7e4b`, "feat(tester): sessionsramen, etapp 2 ord och text, siffror och tabeller".
- Live i ramen för verbalt och numeriskt: nivåtest på alla nivåer (expert inräknad, samma regler som övriga: fri navigering, mjuk gräns på provets tid ur config, Lämna in med dialog), Nivåkollen, Träna (textpasset, sifferpasset och det riktade) och övningsproven. Typen är `src/components/session/typer/Vn.tsx` (underlaget, uppgiften, tre fasta svar eller rader, diagrammen i `VnDiagram.tsx`), kopplingarna i `src/components/session/vn/`. VerbalTestSession, VerbalExpertSession, NumericalTestSession, VnPassFlode, Startark och OvningsprovFlode (för de två typerna) står kvar oanvända till etapp 5; NivakollFlode används fortfarande av deduktivt.
- Uppgifterna levereras från servern utan facit (`src/lib/tester/vn-nivatest.server.ts`, via `getRunData` och session-routernas reservväg `GET ?id=`, som nu också svarar med `vn`). Urvalet är oförändrat: samma `selectPassagesForSession` med sessionens id och underlagsversion som klienten körde förut; kontrakttestet `src/components/session/__tests__/kontrakt-vn.test.ts` låser både POST-kropparna och urvalet. Genomgången efter nivåtestet byggs på servern i `getResultsData`.
- Ändringar i ramen (minsta möjliga, generella): `TypRitare` fick valfria `underlag` (nyckel och ritning) och `arkGrupper`; `SessionsRam` ritar underlaget i egen spalt på dator och fäst överst på mobil och monterar om det bara när nyckeln byts (texten står kvar medan påståendena byts), och låter det rulla med när Förklaringen står under svaren på mobil. Lägena skickar typens underlag och arkets grupper vidare. `RamFacit` och `Forklaringen` fick en valfri löptext (`text`) för banker som förklarar i stället för att ge en regel. Övningsprovets `tillVarde` och `franVarde` får uppgiften (numeriskt har alternativ-id per fråga). Träna fick `vetInte={false}`: passens rutt tar bara emot ett valt svar, och ett obesvarat svar hade ändrat rättning och nivå, så Ord och text och Siffror och tabeller har ingen "Vet inte" i Träna (som förut). Kryssrutans rad säger nu "Rätt svar och förklaringen direkt efter svaret." (sant för alla typer).
- Ingen databasändring.
- Backning: `git revert fe9d7e4b`.

## Etapp 3, Figurer och mönster och Deduktiv slutledning (2026-11-20)

- Commit `f445750f`, "feat(tester): sessionsramen, etapp 3 figurer och mönster, deduktiv".
- Live i ramen, Figurer och mönster: nivåtest (grundnivå, avancerad nivå, expertnivå), Nivåkollen (mätning och ommätning, adaptiv: Nästa väntar på serverns nästa uppgift med spinnern i knappen, räknaren räknar mot sessionens antal), Träna (dagens träning med kalibreringsfrågan och det riktade träningspasset, startskärm med kryssrutan; utan Nivåkoll visar startskärmen "Gör Nivåkollen" och länken "Träna utan Nivåkollen"), logikens övningsprov med startskärm (fasta format med uppgiftsarket, adaptivt och tid per uppgift, hård gräns) och Uppvärmningen. Matrisen 264 på mobil och 336 på dator, luckan fylls efter facit med rätt figur i bläck och positiv ram, reglaget "Förklarande text" och svårighetsprickarna borta. Typen är `src/components/session/typer/Matris.tsx`, kopplingarna i `src/components/session/matris/`.
- Live i ramen, Deduktiv slutledning: nivåtest, Nivåkollen, Träna och övningsprovet. Villkoren i egen spalt på dator och fästa överst med egen rullning på mobil (42 vh, 38 vh vid fem alternativ), kortet heter alltid Villkor, lösningsgången och schemat i Förklaringen (svarets plats i positiv). Typen är `src/components/session/typer/Deduktiv.tsx`, kopplingarna i `src/components/session/deduktiv/`, startlägena i `src/app/dashboard/tester/pass/start-etapp3.server.ts`.
- Ändringar i ramen (generella, bakåtkompatibla): `RamFacit.detalj` (typens egen förklaring under regeln) och `TypRitare.forklaringIUppgift` (Förklaringen i högerspalten i Bred utan underlag); adaptiv Nivåkoll i `lagen/Nivakoll` (`svaraAdaptivt`, `hamta`, `antal`); `RamLaddar` som laddläge under navigeringen i sessionsrutterna (`loading.tsx` för pass, ovningsprov, `[slug]/test` och uppvarmning, också i appens tvilling) så att Hems skelett inte blinkar fram; under en ram döljs dashboardens huvud och rummets topprad med synligheten i stället för `display: none`, så att sidan under ramen inte hoppar (CLS 0 vid övergången); installationsraden hålls undan under ramen; svaren skickas med `keepalive`. Appen Testklar: felytan följer webbens mörka läge i ramen.
- Oförändrat: rutter och POST-kroppar (kontrakttestet utökat för matrisen, deduktivt och uppvärmningen), kvoter, serverstyrda tider, nivåberäkning, kalibreringen och händelsenamnen. MatrixTestSession, PassFlode, PassFraga, GenomgangVy, MatningResultatVy, OmmatningResultatVy, PassResultatVy, LogikProvFraga, Uppvarmning, DeduktivTestSession, DeduktivPassFlode, Startark (logik och deduktiv) och NivakollFlode (deduktiv) står kvar oanvända till etapp 5. `/pass?typ=general` skickas till övningsprovets startskärm.
- Vaktpunkt: matrisens slutförandegrad i Supabase följs dagligen första veckan (inte under 90 %).
- Ingen databasändring.
- Backning: `git revert f445750f`.

## Etapp 4, talserier, spatial förmåga, ordförråd, I-provet och personlighetstestet (2026-11-20)

- Commits `51ec6be7` "feat(tester): sessionsramen, etapp 4 talserier, spatial, ordförråd, I-provet, personlighet" och `716c8a9a` (träningens sida slår upp passet samtidigt med de andra uppslagen, LCP 1,9 s till 0,67 s), och efter produktionskontrollen `799a0d9a` (ringens tal i sekunder skilde mellan serverns HTML och klienten vid omladdning över tiden, React-fel 418; gäller ramen i alla typer).
- Live i ramen för talserier, spatial förmåga och ordförråd: nivåtest på alla nivåer (startarket på testsidan med Fortsätt, kvotkortet och betalväggen, mjuk gräns, Lämna in med dialog, resultatskärmen och genomgången i ramen) och Träna (startskärmen med kryssrutan, Förklaringen under svaren, "Vet inte", det riktade med grupp). Typen är `src/components/session/typer/Steg2.tsx` (talraden, figurkortet, ordkortet, Svarskort), kopplingarna i `src/components/session/steg2/` och startläget för Träna i `src/app/dashboard/tester/pass/start-steg2.server.ts`. Talseriens Träna byter inte längre hela vyn: korten får rätt och fel och regeln, med bågarna under talraden, kommer i Förklaringen. Steg2TestSession, Steg2PassFlode, Steg2ResultatVy, Steg2Review och Uppgifter står kvar oanvända till etapp 5. Nivåkollen för de tre typerna byggs i etapp 6.
- I-provet i ramen (`src/components/traning/iprov/IprovFlode.tsx`, omskriven på plats, samma export): startskärmen i startskärmens mall med valet halva eller hela provet och deltesten under kortet, mellanskärmen per deltest i den korta mallen, deltestet i ramen med räknaren och arket inom deltestet, ringen med hård gräns per deltest (deltestet avslutas vid noll), "Avsluta deltestet" med dialog och "Lämna in" sist. Svaren skickas i tur och ordning med omförsök (servern skriver provets hela meta per svar). Resultatet i ramens resultatskärm med rätt per deltest, tiden per deltest och genomgången deltest för deltest. Segmentstapeln används inte längre av I-provet.
- Personlighetstestet i ramen (`src/components/personalityTest/TestSessionView.tsx` och `LikertScale.tsx`, omskrivna på plats): skalan som fem Svarskort, ett tryck sparar och går vidare efter 250 ms, ‹ och arket, Nästa bara efter att hon gått tillbaka, Lämna in med ramens dialog när allt är besvarat. framer-motion och gradienterna är borta ur hela `src/components/personalityTest` (resultatets kort i designsystemets färger med avslöjandet `.steg`); den oanvända `TestHeader.tsx` är raderad. Profilens beräkning är orörd.
- Ändringar i ramen (minsta möjliga, generella): `RamFacit.data` och `UppgiftProps.facitData` (typens egen facitdata efter facit, till exempel talseriens bågar och spatialens uppvikning), som Träna och Genomgång skickar vidare. `Genomgang` fick valfria `sista` (knappen på sista uppgiften, I-provet: "Nästa deltest") och `undertitel`. `SessionsRam.lamnaIn` fick valfria `titel`, `text` och `bekrafta` (I-provet: "Avsluta deltestet?"). `Startskarm` fick valfri `onAvbryt` (mellanskärmen mitt i provet: krysset frågar först och ingen `test_start_viewed`).
- Rättelser från etapp 2: efter att avbryt-dialogen stängts med Fortsätt eller Esc går fokus till uppgiftens rubrik i stället för krysset, så att Enter trycker på primärknappen i stället för att öppna dialogen igen (`SessionsRam`, `main` har `tabIndex -1` som reserv). Ordlistan i delade texter: `sakord` säger "uppgift" i stället för "fråga" (matris, siffror och tabeller, ord och text expert, proven), resultatets texter ("Uppgift för uppgift", "står vid varje uppgift", testsidans faktarad "uppgifter") och passets resultat- och Nivåkoll-texter i `src/lib/traning/pass-copy.ts` ("Uppgift 4 och 7", "Uppgift 3, fel", tempots axel och aria). Knappen "Nästa fråga" i matrisens gamla passflöde lämnas till etapp 3.
- Personlighetstestets sidor (`personlighet-grund|avancerad/test/[sessionId]/page.tsx`) är serverkomponenter som läser de sparade svaren (`src/lib/personalityTest/sparade.server.ts`, samma rad och ägarkontroll som GET `/api/personalityTest/answer`), så att första påståendet målas ur första HTML utan skelett; utan svar hämtar vyn själv som förut.
- CSS i `globals.css` (sessionsramens avsnitt): ingen fokusring på uppgiftens rubrik och `main` (rummets ring gällde där), och i appen Testklar i mörkt läge gäller webbens mörka `--fel`, `--fel-mjuk` och `--ton` i ramen (appens rot satte ljusa värden, så fel-kortet och Förklaringen blev ljusa med ljus text).
- Kontrakttestet `src/components/session/__tests__/kontrakt-steg2.test.ts` låser POST-kropparna för nivåtestet (`/api/steg2/<typ>`), Träna (`/api/traning/steg2pass`), I-provet (`/api/traning/iprov/*`) och personlighetstestet (`/api/personalityTest/*`). `scripts/perf-inloggat.ts` mäter de nya vyerna.
- Ingen databasändring.
- Mätt med `scripts/perf-inloggat.ts` (Pixel 7, 3x CPU, LTE): talseriernas uppgift 0,60 s, resultat 0,80 s, Träna startskärm 0,64 s och uppgift 0,67 s, I-provets startskärm 0,44 s och deltest 0,32 s, personlighetens påstående 0,58 s, testsidorna 0,42 till 0,64 s, CLS 0 överallt.
- Backning: `git revert 799a0d9a 716c8a9a 51ec6be7` (`799a0d9a` kan stå kvar ensam, den rör bara ringen).

## Etapp 6, Nivåkollen för talserier, spatial förmåga och ordförråd (2026-11-20)

- Commit `235f0033`, "feat(tester): Nivåkollen för talserier, spatial och ordförråd, etapp 6".
- Live: Nivåkollen i alla åtta testtyper. `NIVAKOLL_FINNS` är sant för talserier, spatial förmåga och ordförråd, så Tester-korten, typmenyerna (Mät dig och nivåbandet), Hems Nästa steg och Prova något nytt, Din utveckling och appens flikar visar "Nivåkoll, N min" ur `omfang.ts` och leder till `/dashboard/tester/pass?typ=nivakoll&kind=<typ>` (appen via samma tvillingrutt). "Kommer snart" på Nivåkollen och "Nivåtest, 15/20 uppgifter" som omätt rad är borta för de tre typerna.
- Motorn: samma Nivåkoll som de andra typerna (`src/lib/nivakoll/motor.server.ts`, samma rutter `/api/traning/nivakoll/*` och POST-kroppar, samma `test_type`-mönster `talserie-nivakoll`, `spatial-nivakoll`, `ordforrad-nivakoll` i `logic_test_v4_sessions`, avslutet genom `slutfor_traningssession` med nivåpunkt typ matning eller ommatning och frågestatistik typ matning). Urvalet och rättningen ur steg2-motorerna i `src/lib/nivakoll/steg2.server.ts`: talserier 3 + 3 + 3 (olika regelfamiljer inom nivån), spatial 3 + 3 + 3 (vriden figur, vikning, tärningar per nivå), ordförråd 4 + 4 + 4 (synonym och motsatsord om vartannat). Det hon sett inom 30 dagar (nivåtest, Träna, Nivåkollen) väljs sist och räknas inte i nivån.
- Kalibreringen: p ur `fraga_statistik` från 30 svar, annars bankens `p_prior` (talserier, spatial), annars banknivåns prior ur `steg2-niva.server.ts` (ordförrådet saknar p_prior). Nivån med samma `matningsNiva` som övriga. Provets tid per uppgift: talserier 60 s, ordförråd 20 s, spatial per form (30 eller 45 s, sparas per uppgift i `meta.budgetar`, snittet 40 s i `NIVAKOLL_BUDGET_S`). Omfånget räknat ur det: talserier nio uppgifter cirka nio minuter, spatial nio cirka sex (planen skrev sju, men regeln att texten räknas ur provets tid ger sex med formerna 30 + 45 + 45 per nivå), ordförråd tolv cirka fyra.
- Träna efter Nivåkollen: `skapaSteg2Pass` väljer nivå med `passNivaFor` (samma regel som figur-, deduktiv-, text- och sifferpassen) när en Nivåkoll i typen är slutförd, annars som förut ur bästa grundtestet; Nivåkollens uppgifter räknas som sedda i Träna.
- Gratisregeln som de andra: Nivåkollen en gång per typ gratis (`beslutaTillgang` med `matning`), igen med Premium, 402 med `featureRequiredBody` från samma rutt; startskärmen visar `PaywallCard` (plats `ommatning`). En per typ och dag; öppnad igen samma dag visar resultatet med raden om i morgon. Grundnivåkvoten i `quotaService` rör inte Nivåkollerna (som i de andra typerna).
- Ramen: `src/components/session/steg2/Steg2Nivakoll.tsx` (läget `lagen/Nivakoll`, uppgiften ritas av `typer/Steg2` som i nivåtestet och Träna), startläget i `src/app/dashboard/tester/pass/start-nivakoll-steg2.server.ts`. `nivamatning_startad`, `betalvagg_visad` och serverns `nivamatning_klar` och `ommatning_klar` skjuts med typens `test_kind`.
- Tester: `src/lib/nivakoll/__tests__/steg2.test.ts` (urvalet, facit, nivåberäkningen, gratisregeln), `src/components/session/__tests__/kontrakt-steg2-nivakoll.test.ts` (POST-kropparna och händelserna). Testerna som väntade "ingen Nivåkoll" i de tre typerna är uppdaterade.
- Ingen databasändring (kontrollerat 2026-11-20: inga check-constraints på `test_kind` eller `test_type`, RPC:n skriver nivåpunkten för valfri `test_kind`).
- Mätt lokalt i produktionsbygge (Pixel 7, 3x CPU, LTE, median av tre): startskärmarna 0,79 (talserier), 0,90 (spatial) och 0,70 s (ordförråd), första uppgiften ur första HTML 0,67 till 0,78 s, CLS 0 överallt.
- Backning: `git revert 235f0033`. Sessionerna `talserie-nivakoll`, `spatial-nivakoll` och `ordforrad-nivakoll` och deras nivåpunkter kan stå kvar efter en revert: nivåpunkterna läses då som typens nivå (samma tabell som träningens), och sessionerna öppnas inte av någon vy.

## Etapp 5, städning och Testklar (2026-11-20)

- Commit `604cd61d`, "chore(tester): städning efter sessionsramen, etapp 5" (ombaserad på etapp 6).
- Raderat: 85 filer, 16 000 rader borta (688 nya). De gamla skalen (`TestFlowShell`, `TestMeterRow`, `QuestionNavigation`, `PassShell` med `Tidsrad`, `ResultatSkal`), de sju gamla nivåtestvyerna, legacy-proven (`MatrisProvSession`, `VerbalProvSession`, `NumeriskProvSession`, `useRobustAnswerSaving`), lägesflödena i `src/components/traning` (`PassFlode`, `NivakollFlode`, `NivakollResultatVy`, `OvningsprovFlode`, `Startark`, `Segmentstapel`, `FigurPassFlode`, `VnPassFlode`, `DeduktivPassFlode`, `Steg2PassFlode`, `Uppvarmning`, `GenomgangVy`, `PassFraga`, `LogikProvFraga` och resultatvyerna), `logicV4`-, `logicV6`- och `logicV7`-komponenterna, `verbalV1`, de oanvända delarna i `numerical-shared` och `verbal-shared`, renderarna i `src/lib/logicTestV4` till `V6` (bankerna står kvar), `use-test-hint-mode`, `lib/tester/bekrafta.ts` och förhandsvisningen `/dashboard/tester/forhandsvisning-pass`. Radantalet utan tester: `src/components/tests` 12 927 till 5 535, `src/components/traning` 12 207 till 6 045, `src/components/session` 10 674 till 10 733. Kvar och i bruk: `NivakollUppgift` och `VnUppgift` (de publika proven och prov-sidan), `Regelpanel` (figurseriernas gamla genomgång), `TestResultsPage` (gamla resultatlänkar).
- Flyttat i stället för raderat: `useFlodeLage` (kvittot) till `src/components/traning/useFlodeLage.ts`, `imorgonFranStatus` och `MilstolpeKortVy` till `src/components/traning/resultatDelar.tsx`, uppvärmningens API till `src/components/session/matris/uppvarmningApi.ts`, förhandsvisningens fixturer till `src/lib/traning/__tests__/fixturer.ts` (resultat.test läser dem).
- Avvikelse från planen: `testConfig`-posterna för `matrislogik-prov`, `verbal-resonemang-prov` och `numeriskt-test-prov` står kvar. Svarsrutterna (`/api/*Prov/answer`) läser tidsgränsen och funktionskravet ur dem, och rutterna rörs inte. Sidorna svarar 301 som förut, och en gammal sessionslänk `/<slug>/test/<id>` skickas till övningsprovets startskärm.
- Appens onboarding: Nivåkollen går i ramen (`MatrisNivakoll` med `sessionAdress={null}`, adressen står kvar i onboardingen) i stället för `PassFlode`. Samma rutter, kroppar och händelser; krysset leder som förut tillbaka till Nivåkollens steg.
- Personlighetstestet: startskärmen i `Startskarm` (inline i rummet, läget läst på servern i `lasPersonlighetStart`: försöken, Fortsätt testet för en påbörjad session från senaste veckan, betalväggen) och resultatet i `Resultatskarm` (huvudtalet "Din profil", påståenden och tid, en mening om högsta och lägsta dimensionen, profilen i det lyfta kortet, dimensionerna, intervjutipsen och facetterna som förut, Nästa steg till avancerad nivå eller Gör om testet). `Resultatskarm` har valfri `genomgang` och platserna `lyft` och `innehall`. Facetterna läses nu på servern (`facet_scores`, GET-rutten valde dem aldrig). Beräkningen är orörd.
- Uppvärmningen: ingen startskärm (planens tabell 4.1 har inget läge för den och den startar ingen session). X stänger direkt utan dialog eftersom inget sparas.
- CLS vid övergången från testsidan till ramen: e-postraden avmonterades på flödesrutter, så att sidan under ramen hoppade upp (produktion före: 0,0255 dator och 0,0481 mobil). Nu står raden kvar osynlig (`invisible`, `inert`) när ett flöde öppnas från en sida där den syntes; på ett flöde man landar direkt på ritas den inte. Efter: 0 i figurserier, talserier, ord och text och figurer och mönster på båda enheterna. Kampanjraden styrs exakt som förut (samma villkor, inga extra `kampanj_rad_visad`), så under Black Week kan samma hopp finnas kvar för konton som ser kampanjraden.
- CLS i Träna: Vet inte-länken försvann när uppgiften var besvarad och Nästa växte åt vänster (0,0024 per uppgift, 0,012 till 0,045 per träning). Platsen står nu kvar osynlig (`dold`).
- `test_start_viewed` skjuts på alla startskärmar, Träna inräknad (kontrollerat i koden, i `capture`-anropen i alla tolv startskärmar och i PostHog: `trana`, `talserie`, `sparrad none` kom in 06:45). Att den inte syntes i etapp 4 berodde på QA-miljön: posthog-js skickar ingenting när `navigator.webdriver` är sant (puppeteer), och omladdningen nollade fångsten.
- Ordlistan: "Nästa fråga" och "Vet inte, visa regeln/lösningen" borta ur passens copy, "Fråga för fråga" och "Passage för passage" i de gamla genomgångarna heter "Uppgift för uppgift" och "Text för text", Din utvecklings tempostaplar säger uppgift, mittpunkten i personlighetens profilkort borta. Kvar och inte rört: `KVOT_TEXT` i `/api/traning/pass/session` ("Dagens grundpass är gjort") eftersom API-rutterna inte rörs, registreringens och de publika provens texter.
- Logikens övningsprov klicktestat i Alva-formatet (20 uppgifter, två minuter var, ringen börjar om per uppgift, ingen väg tillbaka, Lämna in med dialog, resultat och genomgång) och Matrigma adaptivt (12 uppgifter på 12 minuter, Nästa väntar på servern, resultat och genomgång).
- Testklar: emulatorn Pixel_8 (Android 16, appens WebView mot den lokala servern, styrd via devtools och adb): Träna och nivåtest i alla åtta typer öppnade, svaren syns utan rullning, Förklaringen och haptiken (ett anrop till Haptics vid svar i Träna), Android-tillbaka öppnar avbryt-dialogen i alla 16 flöden. Dessutom app-UA i Chrome på Pixel 7, ljust och mörkt.
- `docs/designsystem.md`: sessionsramens regler under avsnitt 6.
- Mätt med `scripts/perf-inloggat.ts` (Pixel 7, 3x CPU, LTE, median av tre, lokalt produktionsbygge): 73 av 73 mätta vyer inom budget (de sju som först låg över mättes om på tyst maskin: 0,35 till 1,09 s), CLS 0 på alla testvyer.
- Ingen databasändring.
- Backning: `git revert 604cd61d`. Etapp 6 påverkas inte av en revert (konflikten i passidorna gällde bara reservraden till `NivakollFlode`).

## Etapp 7, betalväggarna i sessionsramen och mätningen (2026-11-20)

- Commit `1e3652b1`, "feat(tester): betalväggar i sessionsramen och mätning, etapp 7".
- Betalväggsöversynen: varje yta i planens tabell 9.2 genomgången mot läget före ramen (`fe390a12^`). Alla testväggar skickar `betalvagg_visad` och `paywall_cta_clicked` med samma namn och egenskaper som förut plus `test_kind` och `lage` (`PaywallCard` fick valfri `matning`; övningsprovets, I-provets och statusradens egna väggar likaså). `paywall_shown` får `test_kind`. Platserna som förut: `dag2` och `riktat` (Träna), `ommatning` (Nivåkollen gjord), `testniva` (avancerad och expert, personlighetstestet), `test_tak` (dagens grundnivåtest gjort), `provlage` (övningsprov och I-provet), `testresultat` (resultatets statusrad), `matning` (Nivåkollens resultat). Planens `pass` för Träna finns inte i `BetalvaggPlats`; `dag2` behålls som före ramen.
- Mobil: väggens köpknapp står i fotens plats (planen 9.2). På startskärmarna i ramen delas väggen: kortet utan knapp och knappen i ramens fot (`PaywallCard` och `OvningsprovBetalvagg` med `del`, `Startskarm` känner igen dem på `fotDel`). På nivåtestets och personlighetstestets startsida i rummet står knappen i en fast fot ovanför bottennavigeringen. Från lg står knappen i kortet som förut. En visning mäts en gång, foten mäter bara klicket.
- Nivåkollens resultat har köpet igen (statusraden, plats `matning`, `NivakollKop`): före ramen bar resultatet en köpknapp (ett köp kom därifrån 2026-11-15), ramen hade bara prisraden kvar och mätte en visning utan något att trycka på.
- 402 vid start: Träna och Nivåkollen visar väggen på startskärmen (`betalvagg` i lägenas start) i stället för ett felmeddelande, och den manuella `betalvagg_visad` vid 402 är borta (väggen mäter sig själv). Övningsproven läser om sidan vid 402. Matrisens övningsprov skickade `generalrepetition` utan vägg vid 402; nu visas övningsprovets vägg (`provlage`).
- I-provets vägg mäts (förut ingen händelse alls), resultatets statusrad och övningsprovets vägg visar kampanjpriset i knappen och skickar `kampanj`.
- Övrigt: "Gör Nivåkollen först" på Träna-startskärmen i talserier, spatial och ordförråd (som matrisen, bara utan spärr och utan Nivåkoll i typen), dag 2-mejlet känner Nivåkollen i alla åtta typer (`NIVAKOLL_KIND` ur `niva.ts`), kvottexten i `/api/traning/pass/session` säger "Dagens träning på grundnivå är gjord" (bara texten), kommentarer om raderade komponenter i `src/components/session` uppdaterade, matrisens kvotkort i Träna skjuter `test_start_viewed` med `sparrad: 'quota'`.
- Mätningen: `docs/rapporter/testflode-matning-2026-11-20.md` (baslinjen, första dygnet, avläsning 4 och 18 dec) och PostHog-dashboarden "Testflödet" (`docs/rapporter/posthog-dashboard-testflodet.md`).
- Tester: `src/components/session/__tests__/betalvaggar.test.tsx` (platserna, händelserna, foten, kampanjpriset, ingen vägg inne i en session), dag 2-mejlets typer i `traningsmejl.test.ts`, de två gamla källkodstesterna uppdaterade.
- Ingen databasändring. Inga ändringar i `src/lib/kampanj`, `src/app/api/stripe`, `src/components/kampanj`, `src/lib/plans`.
- Backning: `git revert 1e3652b1`.

## Omgång 2, steg A: grunden i ramen (2026-11-20)

- Commit `4337be3e`, "feat(tester): grunden i ramen, omgång 2 steg A", pushad 2026-11-20 före Black Weeks frysning.
- Backning: `git revert 4337be3e` (ingen databasändring; de nya händelserna slutar bara komma).

Skissen (artefakten KtViRMpthysT8t34isdnPK, godkänd av ägaren), `docs/design/feedback-testflode-ux-2026-11-21.md` och `docs/design/feedback-testflode-saas-lead-2026-11-21.md`. Allt i `src/components/session/`; inga rutter, POST-kroppar, kvoter, motorer, banker, priser eller kampanjfiler rörda. Ingen databasändring.

### Vad som gick live

- **Ytan (`SessionsRam`).** Foten ligger i main: på mobil en rad över hela bredden längst ned (sticky, `mt-auto`), från lg i kolumnen 24 px under innehållet och sticky nedtill när innehållet är längre. Nästa högst 360 px och högerställd, ‹ eller Vet inte till vänster. I Bred ritas kolumnen som rutnät (560 + 40 + 400, från xl 640 + 40 + 440); med underlag står foten under högerspalten, utan underlag (deduktivt) har foten ett eget rutnät så att knapparna står under typens högerspalt. Kolumnerna från xl: Smal 496, Mellan 600, Remsa 816, Bred 1120 (`FORM_BREDD_XL`). Toppluften från lg `clamp(40px, (100dvh − 920px) / 2, 120px)` (`TOPPLUFT`), också för de fästa villkoren. Nya props: `scen` (typens id för scenen på golvet). Nya data-attribut för QA: `data-ram-kolumn`, `data-ram-uppgift`, `data-ram-fot`, `data-ram-vakt`, `data-form`.
- **Klockan (`Klocka`).** Kapsel med ring och tal, alltid m:ss, alla lägen enligt artboarden. Props oförändrade. `data-klocka` är `lugn`, `sista`, `over` eller `referens` (`over` är nytt; tidigare `sista` även över tiden). `klockText(kvar, mjuk)` exporteras.
- **Rätt/fel-systemet.** `Marke.tsx` (märkena `ratt`, `fel`, `ton`, varianten `fylld` för listans rader, `pop`, och `Las` för det publika låset). `Svarskort`: vit yta och 1 px ring efter facit, märket i brickans plats, `Pill` och ny prop `ditt` på `SvarRad` och `SvarRuta` (alla typer skickar `ditt={facit != null && vald === i}`). Pillen på figurrutor döljs under 110 px rutbredd (container query). Rörelserna `sess-pop`, `sess-pill` i `globals.css`, av under prefers-reduced-motion.
- **Förklaringen (`Forklaringen`).** Kortet med rubrikrad, kropp och fotrad; "Något ser fel ut" är `FragaRapport` med ny prop `liten`. Nya props `innehall` (typens plats, `detalj` finns kvar som alias) och `matning`.
- **Scenen på golvet (`ScenGolv`).** I ramen från 1440 px, tonas ut när vakten efter foten når ner till scenen.
- **Uppgiftslistan (`Uppgiftslistan`).** Ersätter genomgångskortet i `Resultatskarm` i alla lägen (`genomgang.lista`); kortet med miniatyrer och "Visa alla" ritas bara om en vy inte skickar `lista`. Alla lägen och resultatvyer skickar den: Träna, Nivåkollen och övningsproven via lägets `ctrl.lista`, nivåtestens resultat (`KlassiskNivatestResultat`, `FigurserieNivatestResultat`, `Steg2NivatestResultat`, `VnNivatestResultat`), matrisens övningsprov och I-provet (alla deltest med mellanrubriker).
- **Publikt läge.** `lagesregler('publikt')`: ingen klocka, linjär, inget hopp, `facit: false`; `Lagesregler` fick flaggan `facit`. Avbryt-dialogen "Avbryta provet? Inget sparas.", sista knappen Visa resultatet, `LAGESNAMN.publikt` "Prova gratis", `KLART.publikt` "Provet klart". Räknaren saknar chevron när ramen inte får `ark`.
- **Mätningen (saas-leads prio 1).** Nya händelser i `handelser.ts` och `AnalyticsEvents`: `genomgang_oppnad` (`kalla` ga_igenom, rad eller direkt, `start_index`, `antal`, `fel`), `genomgang_rad_utfalld` (`index`, `utfall`, bara tryck), `genomgang_steg` (`index`, `riktning`, `tid_ms` på förra uppgiften), `genomgang_klar` (`sett`, `elapsed_ms`) och `forklaring_tid` (`tid_ms`, `utfall`, `plats` svar, genomgang eller lista). Alla bär `SessionHandelseBas`; i genomgången och listan utan egen bas är `niva` och `format` null. Inga gamla namn eller egenskaper ändrade; grep-testet täcker de nya.
- **Talraden (`Talrad.tsx`).** Gemensam, ritas på servern, krymper likformigt med behållaren via `min(px, cqw)`. Används av talserierna i ramen (`typer/Steg2`) och av artiklarnas `TalserieUppgift`. Stegens etiketter under raden har nu sin plats reserverad från start (CLS 0 vid facit), utom de varvade seriernas andra rad.

### Prov och mätning

- tsc rent, `npx vitest run --dir src` 263 filer och 3431 test gröna (nya: `__tests__/omgang2.test.tsx`), `next build` grönt.
- Klicktest i Chrome mot produktionsbygget och utvecklingsservern, 1440×900, 2560×1300 och Pixel 7: Träna (talserier, figurserier, deduktivt, ord och text), nivåtest (talserier, deduktivt, figurserier, personlighet), övningsprov (deduktivt, logik, figurer) och resultatsidan; app-UA ljust och mörkt på Pixel 7. Svaren syns utan rullning i alla vyer, knappen 24 px under sista svaret från lg, rubriken på samma y genom sessionen (102 px på 1440×900, 182 px på 2560×1300), ingen horisontell rullning. Talraden ryms i ramen på 412 px och i artikelrutan på 300 px.
- `scripts/perf-inloggat.ts` (Pixel 7, 3x CPU, LTE, median av tre, `--samtycke`): uppgiftssidorna 264 till 624 ms, resultaten 340 och 424 ms, startskärmarna 460 till 752 ms (en körning av matrisens startskärm låg på 5,9 s och mättes om till 752 ms), CLS 0 överallt.
- Produktion efter push: Träna deduktivt på Pixel 7 från start till resultat och Uppgiftslistan.
- QA-kontot `qa-ram-a-1795176686116@jobbcoach-qa.test` raderat per id: 21 sessioner, 2 personlighetssessioner, 126 aktivitetsrader, 1 profil.

### Kontraktet för steg B (typerna)

- **Förklaringens innehåll:** sätt `TypRitare.Forklaring: ComponentType<ForklaringInnehallProps<U>>` (`{ u, facit, valt, plats }`). Lägena, genomgången och listan ritar den i Förklaringens kropp under regeln och löptexten via `forklaringInnehall(ritare, u, facit, valt, plats)`. Utan den används `RamFacit.detalj` som förut (deduktivens lösningsgång ligger kvar där tills den flyttas). Regel, löptext och misstag kommer fortfarande ur `RamFacit`.
- **Uppgiftslistans miniatyr:** `TypRitare.Miniatyr: ComponentType<{ u }>`, 22 till 32 px hög, aria-hidden. Finns för talserier, spatial och ordförråd (`ListMiniatyr` i `typer/Steg2`) och figurserier (`SerieMiniatyr`); matris, deduktiv, verbal och numerisk saknar och raden står då utan miniatyr.
- **Svarets namn i raden:** `TypRitare.svarEtikett(u, i)`; utan den bokstaven. Ord och text och Siffror och tabeller ger de tre fastas ord.
- **Utfälld rad:** listan ritar typens `Uppgift` med `last`, facit och den nya propen `kompakt` (smal behållare utanför ramen: stapla, inga fästa underlag, inga negativa marginaler). Deduktivt hanterar `kompakt`; övriga typer staplar redan. Har typen `underlag` ritas dess `Ritare` med `genomgang` ovanför uppgiften.
- **Svarskort:** skicka `ditt` (se ovan). Egna kort ska använda `Marke` och `Pill` för rätt och fel, aldrig `IkonCheck` eller `IkonKryss`.
- **Talraden:** bågar och felsteg ritas i `Talrad`s `overlay` (SVG i radens designmått, `geometri(n, ovan)` ger `cx(i)`), med `ovan` och `under` reserverade från start; klasserna `talrad-bage` och `talrad-in` finns i `globals.css`. Etiketterna i `efter` kan tas bort när bågarna finns.
- **Måtten från xl:** kolumnen är bredare (se ovan); typer med fasta mått (matrisen 336, talradens rutor, spatialens figurkort) får sina xl-steg i steg B. Deduktivets högerspalt är 440 från xl så att den följer foten.

### Kontraktet för steg C (publika vyerna)

- Ramen i det publika provet: `SessionsRam` med `lage="publikt"`, utan `klocka` och `ark`, `bekraftaAvbryt`, `scen` med typens id. `lagesregler('publikt').facit` är falskt: typens `Uppgift` får `facit={null}` hela vägen.
- Resultatet: `Uppgiftslistan` med `last` (och valfritt `lasText`) direkt, eller via `Resultatskarm` `genomgang.lista` med `last: true`. Raderna visar nummer, miniatyr, ritat märke, "Rätt" eller "Fel" och låset; obesvarade räknas som fel; inga händelser skjuts. Rubriken "Fem uppgifter, två fel" räknas ut (`SESSION.lista.titelLast`).
- `Talrad` (utan 'use client') används i artikelns ruta och i provet; den ryms på 300 px.
- Märken och lås: `Marke` och `Las` ur `src/components/session/Marke.tsx`.

### Avvikelser från skissen

- Skissens scen på golvet har egna motiv i generatorn; ramen använder typens scen ur `scener/` (som startskärmen) i vagg-2-kontur.
- Rubriken "Vilket tal kommer härnäst?" ovanför talradens kort, bågarna, villkorskortets nya typografi och de övriga typspecifika facit-bilderna är steg B.
- Från lg står foten 24 px under sista svaret (skissen och UX-beslutet 1a), så dess höjd följer uppgiftens längd: fyra eller fem svar, och i Träna under Förklaringen efter svaret. Den flyttar aldrig i sidled och aldrig inom en uppgift före svaret (Vet inte står kvar osynlig). På mobil står den fast längst ned som förut.

## Omgång 2, steg B2: talserier, spatial förmåga, ordförråd och personlighetstestet (2026-11-20)

- Commit `bb092446`, "feat(tester): talserier, spatial, ordförråd och personlighet, omgång 2 steg B2". Backning: `git revert bb092446` (ingen databasändring).
- Underlag: skissens artboards Talserier-uppgift, -facit, -bildrutor och -former, Spatial-vridning-facit, Spatial-vikning, Ordforrad-facit och -motsats, Personlighet-1440 och -412, och UX-noternas punkt 6 till 10.
- **Talserier** (`typer/Steg2.tsx`, `Talrad.tsx`): frågan står som `.text-fraga` ovanför kortet, kortet bär bara talraden. Talraden reserverar 52 px över och 80 px under raden från start (`TALRAD_BAGAR`), så att facit inte flyttar något. `TalradBagar` i `Talrad.tsx` ritar bågarna i Talrads `overlay`: kubiska kurvor med pilspets och steget i en pill, två höjder när bågarna är fler än fem eller etiketterna breda, klammer för summaserier (växelvis över och under, "summa" bara på det första), varvade serier med serie 0 över raden i ton-ink och serie 1 under i ink-2. Bågarna ritas in vänster till höger (pathLength 1, 200 ms, 100 ms förskjutning), luckan fylls 160 ms efter sista bågen (`TalradRuta.fordrojning`) och hennes fel ritas 200 ms därefter som ett rött streckat steg till hennes tal med "ditt svar: −8" (`hennesSteg`: differens, kvot när regelns steg är × eller ÷, "summa +4" i summaserier). Etiketterna under raden är borta. Reduced motion: allt står direkt.
- **Spatial förmåga**: den vridna figuren (form A, inte speglingen) vrids i figurkortet till rätt svars läge, 600 ms, med etiketten "90° medurs", "180°" eller "90° moturs" (`kvartsVarv` räknar ur rutorna). Hennes spegelvända val får en lodrät streckad linje och "spegelvänd" (`arSpegelvand`, annars bankens misstag). Vikning (B) och hålslag (D): stegen ersätter frågans ark i figurkortet, ett i taget 400 ms isär, sista med positiv ram och hennes svar sist med extra hål prickade och saknade hål streckade i fel (`halAvvikelse`: "ett hål för mycket", "ett hål för lite", "hålen på fel ställe"). Frågans ark står kvar osynligt och håller kortets höjd; stegens storlek kommer ur platsen (container query). Figurkortet 200 px från xl.
- **Ordförråd**: ordkortet med relationsglyfen i en tonruta (överlappande cirklar för synonym, isär för motsatsord), ordet 44/48 på dator och 34/38 på mobil, alternativen i display 18/600. Facit är en ordboksartikel i Förklaringen via `TypRitare.Forklaring` (`OrdForklaring`): uppslagsraden, "synonym till …" och betydelsen, exemplet kursivt och hennes ord med "inte en synonym" eller "inte en motsats" och dess betydelse ur misstagstexten. `steg2Facit` lämnar löptext och misstag tomma när artikeln kan ritas (kontrakttestet uppdaterat).
- **Personlighetstestet** (`LikertScale.tsx`, `TestSessionView.tsx`): fem kort i rad också på mobil, 104 px (siffran 18 px i 34 px bricka, etiketten 11/14) och 112 px från lg (22 i 40, 13/17). Påståendet direkt på golvet i 22/28, 26/32 från lg, och raden "Ett tryck svarar (och går vidare)" och "Inga rätt eller fel" under skalan.
- **Miniatyrerna** (fanns sedan steg A): ordförrådet får glyfen framför ordet, spatialens figur 32 px.
- Ramen är inte ändrad. Inga rutter, POST-kroppar, händelser, nivå- eller profilberäkningar rörda.
- Prov: tsc rent, `npx vitest run --dir src` 259 filer och 3303 test gröna (nya: `__tests__/omgang2-b2.test.tsx`), `next build` grönt. Klicktest mot produktionsbygget på 1440×900 och Pixel 7: Träna med facit i talserier, spatial och ordförråd, nivåtest i alla tre med resultat och Uppgiftslistan, personlighetstestet. Talraden ryms i rutan överallt, ingen horisontell rullning, CLS 0 i uppgifterna. Resultatsidorna på mobil visar 0,0001 från ramens "Lämna in"-text (ramens fot, inte typerna).
- Perf (`scripts/perf-inloggat.ts --samtycke`, Pixel 7, 3x CPU, LTE, median av tre): talserier uppgift 472 ms, talserier resultat 780 ms, Träna uppgift 324 ms, spatial Träna startskärm 764 ms, personlighet påstående 732 ms, CLS 0.

### Avvikelser från skissen

- Personlighetens etiketter står kvar som förut ("Neutral", "Stämmer bra", "Stämmer perfekt"); skissen skriver "Varken eller", "Stämmer delvis", "Stämmer helt". Byte av skalans ord påverkar svaren och lämnas till ägaren.
- Motsatsordens eyebrow och glyf står i motsatsfärgen (skissen: ton för båda), så att frågetypen fortfarande byter färg mellan blocken.
- Talseriens fråga följer ramens `.text-fraga` (24/30 från lg) som figurserierna; skissens 28/34 får komma i ramens klass för alla typer.
- Tärningen och kroppen (form C) har inte fått rätt svars figur bredvid referensen; de markerade sidorna står som förut.

## Omgång 2, steg C: de publika testvyerna (2026-11-20)

- Commit `cc39b6bc`, "feat(tester): de publika testvyerna i sessionsramen, omgång 2 steg C" (ombaserad på B2).
- Backning: `git revert cc39b6bc` (ingen databasändring; undantagsfilen `scripts/seo-baslinje/omgang2-publikt-2026-11-20-undantag.json` följer med i reverten).

### Vad som gick live

- **Provsidan (`ProvaFlow`).** Startskärmen är ramens `Startskarm` (typens scen, h1 som förut, tre regler, det lyfta kortet med typvalet som länkar `?typ=` och knappen `data-cta="prova-start"`), ritad på servern. Uppgifterna går i `SessionsRam` med `lage="publikt"`: typens komponent ur `session/typer`, ett tryck markerar och Nästa (sista: Visa resultatet) bekräftar, avbryt frågar "Avbryta provet? Inget sparas.". Resultatet är ramens resultatbild: väggen med ringen och "3 av 5 rätt", `Uppgiftslistan` låst och spärren med `data-cta="prova-gate"` till `/register?test=<token>`, Gör om provet och Logga in. Sidan står i `data-rum="tran"`, så rummets tokens gäller som i de inloggade testerna. `storePendingTestSession`, typvalet, `/pedro` (utm i adressen) och alla händelser som förut; `plats: 'prova'` tillagd på `sample_completed` och `signup_gate_shown`.
- **Artikelprovet (16 artiklar).** `ArtikelProvKlient` ritar en inbäddad provruta (ingen helskärm): bandet "Prova själv" med räknaren, uppgiften i typens komponent i kompakt läge (underlaget över uppgiften), foten med "Inget konto behövs." och Svara. Uppgift 1 serverrenderas med artikelns frö som förut, svarets värde är detsamma som de gamla vyerna skickade. Resultatet och spärren (`artikel-prov-gate`) står inne i rutan med låsta rader (`ProvBrickor`). Inga h1 till h6 i rutan: typernas rubriker läser nu `RubrikTagg` (Matris, Figurserie, Deduktiv, Steg2, Vn), rutan sätter `p`. `ArtikelProvRam` raderad.
- **Personlighetsprovet** (verktygssidan och två artiklar): panelen ritas med `LikertScale` (B2:s kort, plus valfria `etiketter`, `ariaLabel` och `ariaDescribedBy`), profilen med fem faktorer och segmentraden och tre låsta block, spärren i ett lyft kort. Serverrenderas som förut (fem radioknappar i HTML:en).
- **Registreringens panel** (`ProvPanel`, `ProvBrickor`): ramens resultatbild med ringen, huvudtalet, Nio-raden på väggen och Uppgiftslistans låsta rader (på mobil märkena i en rad), rubriken som `sr-only` h2 för skärmläsaren. Formuläret till vänster från 900 px.
- **Genomgången efter kontot** (`ProvTypGenomgang`): `Uppgiftslistan` med rätt svar och Förklaringen, Gå igenom öppnar ramens `Genomgang`. `NivakollUppgift`, `VnUppgift`, `TypUppgiftVy` och `Steg2Uppgift` (i `tests/steg2/Uppgifter.tsx`) raderade efter grep.
- **Provrummet utanför ramen:** `.prov-rum` i `publikt.css` sätter rummets tokens (testrummet, ljust och mörkt) på artikelrutan, personlighetspanelen och registreringens panel, eftersom publika sidor saknar `[data-rum]`.
- Delade delar i `src/components/publikt/prov/`: `provPost.tsx` (publika uppgifter till ramens form och svarets värde), `ProvUppgiftVy.tsx`, `prov-copy.ts`.

### Ändringar i ramen (minsta möjliga)

- `Startskarm`: `StartKnapp.cta` ger `data-cta` på knappen (kontraktet `prova-start`).
- Typernas rubriker (`h2`, och underlagets `h3` i Vn) ritas med `useRubrikTagg()`; standardvärdet är `h2`, så inloggat är oförändrat.

### Prov och mätning

- tsc rent; `npx vitest run --dir src` 262 filer gröna, 2 test i `register-flode.test.tsx` rättade genom panelens sr-only-rubrik (förväntningarna orörda); kontraktstesterna 146 av 146. I `prova-kontrakt` och `artikelprov-kontrakt` trycker hjälparen nu svaret och sedan ramens knapp (`svara()`), eftersom gesten är tryck plus bekräfta; förväntningarna är orörda.
- SEO-diffen (21 sidor) och provkontrollen (19 sidor) mot produktionsbygget: Fel 0 båda, före och efter rebasen på B2. Undantaget: provsidans länk till `/` (loggan i flödesskalet) ersatt av `/verktyg/rekryteringstester`. Ord i main på de hårda sidorna högst 0,8 procent ned, personlighetstestet 617 till 621.
- Klicktest i Chrome, utloggad, 1440×900 och Pixel 7 mot produktionsbygget: provsidan (talserier) till spärren och registreringens panel, artikelprovet i talserier till spärren och registreringen, personlighetsprovet till spärren och registreringen; inga konsolfel. Inloggad genomgång med det delade QA-kontot (gratis): deduktivt prov hämtat via claim, fem rader i listan, Gå igenom öppnar ramen.
- `scripts/perf-publikt.ts` (Pixel 7, 3x CPU, LTE, tre körningar): provsidans startskärm 440 och 444 ms, artiklarna 664 och 748 ms (uppgift 1 ur första HTML), personlighetstestet 632 ms, CLS 0 överallt. Första uppgiften på provsidan efter Starta: klientens ritning 110 till 165 ms, men POST `/api/public/test-session` tog 1,7 till 2,7 s lokalt mot produktionsdatabasen (rutten är orörd och samma rundresa som förut), totalt median 2,2 s.
- Ingen databasändring.

## Omgång 2, steg B1: deduktivt, Ord och text, Siffror och tabeller, Figurer och mönster och figurserier (2026-11-21)

- Commit `87e2b515`, "feat(tester): typerna i B1, omgång 2". Backning: `git revert 87e2b515` (ingen databasändring; servern skickar bara ett fält mer, `platser`).
- Skissen KtViRMpthysT8t34isdnPK (artboards Deduktiv-uppgift, Deduktiv-facit, Ord-uppgift, Ord-facit, Ord-412, Siffror-tabell, Siffror-diagram-facit, Siffror-tabell-facit, Matris-1440, Figurserier-1440) och `docs/design/feedback-testflode-ux-2026-11-21.md` punkt 3 till 5. Ramen (`SessionsRam`, `Svarskort`, `Marke`, `Klocka`, `Forklaringen`, `Uppgiftslistan`, `Talrad`, `lagesregler`) är orörd. POST-kroppar, PostHog-händelser och nivåberäkningen är orörda.

### Vad som gick live

- **Deduktiv slutledning (`typer/Deduktiv.tsx`).** Villkorskortet: flaggan och "Villkor" i en linjerad rubrikrad med antalet till höger, introraden 15/22 i ink-2, villkoren 18/28 från lg (16/26 på mobil) med brickor 22 px linjerade mot första raden. Kvantorer och relationer i semibold via ordlistan `markeraVillkor` i klienten (längsta frasen först: "direkt till vänster om", "inte bredvid", "på plats N", "Alla", "Några" och så vidare); ingen färg, ingen bankändring. Remsan står längst ned i kortet på papper-2 när bankens lösning har ett schema: tom med streckade platser i uppgiften, ifylld i facit plats för plats i lösningsgångens ordning (240 ms per namn, 400 ms mellan stegen, av under prefers-reduced-motion) med villkorstaggen ("villkor 1, 2", "antagandet") ovanför cellen och svarets plats i positiv. Namnet kommer ur introraden: Hyllan, Raden, Turordningen, annars "Platserna 1 till N". Villkorstaggen räknas ur lösningsgångens följdmeningar (`villkorPerPlats`: första meningen med "låser" eller "Alltså" som nämner platsen); alla 1 136 platser i bankernas remsor får en tagg. Lösningsgången står i Förklaringen via `TypRitare.Forklaring` (`Losningsgang` med ny prop `utanRemsa`) med raden "Hyllan i villkorskortet fylls i steg för steg i samma ordning." Facit bär lösningen i `RamFacit.data` i stället för `detalj` i alla fyra lägen och i `TestResultsPage`. Vänsterspalten är sticky som förut. Miniatyren: villkorens brickor och, från sm, remsans tomma platser.
- **Servern.** `visaDeduktiv` skickar `platser` (antal platser i schemat, annars null), och Nivåkollens och övningsprovets motorer för fältet vidare. Bara ett nytt fält i svaren; inga kroppar, ingen databas.
- **Ord och text (`typer/Vn.tsx`).** Texten som dokument: ämnet som eyebrow, rubriken i display 22/28 (20/26 på mobil), metaraden "N stycken, cirka X minut" (200 ord per minut, `lasMeta`), en hårlinje och brödtexten 18/30 med högst 62 tecken per rad och 14 px mellan styckena. Från lg växer rutan med texten under 900 px skärmhöjd och har egen rullning från 900 (`vn.module.css`). Mobil: 42 vh med raden "Texten fortsätter" i skuggan. Påståendet i display 20/28, under de tre knapparna hjälpraden "Går inte att avgöra: texten säger varken det ena eller det andra." Miniatyren: påståendets fyra första ord.
- **Siffror och tabeller.** Datatabellen kant i kant i kortet: rubrikraden på papper-2 med enheten på egen rad (`delaRubrik`, "Yta (kvm)"), första kolumnen som radrubrik i semibold, talen högerställda i tabular-nums 15/22, rader 40 px, varannan rad tonad och rad-hover från lg, summaraden med 2 px kant-stark, första kolumnen fäst vid sidledsrullning på mobil. Kontextens meningar med siffror (utom den första) står ordagrant i sifferfaktaraden under tabellen eller diagrammet (`delaKontext`). Eyebrowen säger Tabell eller Diagram; frågan 24/30 från lg. `VnDiagram`: y-axel med rena skalsteg (`skala`, 1, 2, 2,5 eller 5 gånger en tiopotens, tre till fyra intervall, nollan alltid i stapeldiagram), hårlinjer i kant, 220 px på mobil och 280 px på dator, staplar högst 24 px med 4 px rundad topp, linjen 2 px med 12 px punkter och papperring, munken 140 px med värdet inne i segment från 8 procent och 2 px ytgap. Markeringen i facit finns som form (`markering` på `VnDiagram`, `TabellMarkering` på tabellen: positiv ram, övrigt dämpat till 38 procent, raden på ton), men ingen typ skickar den: banken saknar vilka celler och staplar en uppgift räknar på, så ingen markering visas hellre än en gissning. Miniatyren: underlagets rubrik med en liten tabell- eller stapelsymbol.
- **Figurer och mönster.** Matrisen 400 × 400 från xl, rutorna 158 × 120 och 12 px mellan blocken så att matrisen, frågan, sex svar och knappen ryms på 1440 × 900 (sista svaret 24 px över knappen). Miniatyren: matrisens rad med luckan i remsans 24 px-rutor (`.minifig`).
- **Figurserier.** Remsans rutor och svarsrutorna är redan 128 till 132 px i Remsa 816 från xl, och märkena och pillen står i rutorna sedan steg A. Miniatyren fanns.
- **Pillen i figurrutorna (matris och figurserier, `.sess-alt`).** "Rätt, ditt svar" är för lång för en ruta under 150 px (mobilens 119 px) och lade sig över märket och figuren; den döljs där med en container query i `globals.css`, avgränsad till `.sess-alt` så att spatialens och de andra typernas rutor är orörda. "Rätt svar" och "Ditt svar" står kvar. Det är den enda ändringen nära ramen; `Svarskort.tsx` är orörd.
- Sammanslaget med steg C: rubrikerna i Deduktiv och Vn går genom `useRubrikTagg` (p i artiklarnas provruta), också underlagets titel i Siffror och tabeller.
- Prov: `__tests__/omgang2-b1.test.tsx` (ordlistan, remsans namn, villkorstaggar för alla bankuppgifter med remsa, tom och ifylld remsa, metaraden, hjälpraden, rubrik och enhet, kontextens delning, skalan).

### Prov och mätning

- tsc rent, `npx vitest run --dir src` 264 filer och 3442 test gröna, efter sammanslagningen med B2 och C 265 filer och 3451 test (nytt: `__tests__/omgang2-b1.test.tsx`, 11 test), `next build` grönt (egen distDir, tsconfig.json återställd). En gammal `.next/types/validator.ts` från ett tidigare bygge pekade på den raderade sidan `forhandsvisning-pass` och fällde typkontrollen; mappen flyttades undan (genererad, inte versionerad).
- Klicktest i Chrome mot produktionsbygget, 1440 × 900 och Pixel 7, med det delade premiumkontot: Träna (med facit) för deduktivt, Ord och text, Siffror och tabeller, Figurer och mönster och figurserier, nivåtestet i deduktivt (utan facit) och resultatsidan med Uppgiftslistan och utfälld rad för alla. Svaren syns utan rullning i alla vyer, knappen 24 px under sista svaret från lg (Ord och text 52 px, hjälpraden står emellan), ingen horisontell rullning. Remsan tom i uppgiften och ifylld med villkorstaggar i facit på båda skärmarna. Diagrammen (stapel, linje, munk) granskade i sessionen och i en fristående rendering på 640 och 412 px. Skärmdumpar i scratchpad, mappen `omgang2-bygg/B1`.
- `scripts/perf-inloggat.ts` (Pixel 7, 3x CPU, LTE, median av tre, `--samtycke`): deduktivpass uppgift 376 till 532 ms, deduktiv resultat 404 till 528 ms, verbalt uppgift 456 till 604 ms, numeriskt uppgift 400 till 948 ms, deduktivets startskärmar 556 till 764 ms, CLS 0 överallt. En körning mitt i låg högre för flera sidor samtidigt (även talserier, som B1 inte rör) och mättes om; maskinen delades med två andra byggare.

### Avvikelser från skissen

- Diagrammen har inget hovringslager (dataviz-färdighetens standard): uppgifterna kräver exakta tal, så varje värde står utskrivet och en tooltip skulle bara upprepa etiketten. Munkens fyra ljushetssteg är skissens; validatorn underkänner dem som kategorisk palett (ljushet och kroma), vilket är väntat för en ordnad ramp, och identiteten bärs av legenden med värden och värdena i ringen.
- Enheter längre än två tecken ("MSEK", "kubikmeter") står en gång under diagrammet i stället för vid varje stapel, så att etiketterna inte krockar på 412 px.
- Skissens "Visa som tabell" under diagrammet och stödmeningen i texten kräver bankdata eller ett eget beslut och är inte byggda.

## Omgång 2, slutkontroll (2026-11-20)

- Commit `c8a2ab0f`, "fix(tester): slutkontrollen omgång 2, etiketter utan CLS, fråga 28/34 från xl, snabbare provstart". Backning: `git revert c8a2ab0f` (ingen databasändring).
- Omgång 2 avslutas här. Utseendet ersätts av omgång 3 (skissen WsTzySXM8d4DyHpAwheJs8), så jämförelsen mot skissen typ för typ gjordes inte klart. Layoutreglerna från omgång 2 gäller kvar.

### Vad som gick live

- **Etiketten i svarskorten (`Svarskort.tsx`, `globals.css`).** "Rätt svar" och "Ditt svar" sitter som en flik på kortets överkant, och märket i Sant och Falskt likaså. Svarets text flyttas inte längre efter facit: CLS var upp till 0,004 på mobil och är 0, mätt i deduktivt och i Ord och text på 1440 och Pixel 7. Etiketten täcker inte märket i små rutor.
- **"Lämna in" i foten (`SessionsRam.tsx`).** Inget skifte på sista uppgiften. På resultatsidan på 1440 mättes 0,00004, som kommer från bannern "Skicka igen" och inte från foten.
- **Frågan (`.text-fraga`).** 28/34 från xl. Svaren ryms utan rullning på 1440 × 900.
- **Provsidans start (`api/public/test-session/route.ts`, `provPost.tsx`, `ProvaFlow.tsx`, `ArtikelProvKlient.tsx`).** Rutten skriver en insert i stället för en insert och en eller två uppdateringar, och provet värmer servern med en GET som svarar 204 utan databas. Kontrakten är oförändrade: svar utan facit, IP-gräns, token och händelser. `docs/qa/seo-diff/omgang2-publikt-README.md` säger att rutten inte ska röras; det här är ett medvetet undantag för svarstiden, och sessionerna som skapas är desamma som förut.
- **Kontraktstestet för provservern.** `node:crypto` mockas så att `randomUUID` ger testets fasta token. Rutten väljer frågor med en slumpad token, och testet "uppgifterna utan facit" föll då ibland på ordförrådets ord "regel". Det var en falsk träff, inget facit läckte.

### Prov och mätning

- tsc rent. Berörda mappar 22 filer och 255 test, hela sviten 265 filer och 3451 test, allt grönt. `next build` grönt med egen distDir, tsconfig.json återställd.
- SEO-diffen och provkontrollen för de publika sidorna: Fel: 0.
- Första uppgiften på provsidan, Pixel 7 utan strypning, tre körningar: 299, 283 och 263 ms, varav POST 260, 248 och 225 ms. Inte jämförbart med de 1,7 till 2,7 s som mättes strypt före rättelsen.
- Klicktest i Chrome mot bygget på 1440 × 900 och Pixel 7: Träna med facit i deduktivt och Ord och text, nivåtest till resultat, provsidan och ett artikelprov som utloggad.

### Kvar, inte från den här ändringen

- Personlighetstestet som utloggad har CLS 0,40 på 1440 och 0,86 på mobil när profilen växer fram. Finns i produktion sedan tidigare.
- Artikelprovet har CLS 0,038 när start-anropet tar över 500 ms, eftersom rutans höjd ändras mellan uppgift 1 och 2. Finns i produktion sedan tidigare.
- Siffror och tabeller på mobil, uppgift 3: sista svaret hamnade 14 px under foten i den stora matrisen.
- Den stora matrisen på 2560 avbröts av belastning mot Supabase och kördes inte om. App-läget kontrollerades inte i den här omgången.
- Testkontona i `qa-konton.json` ligger kvar.

## Omgång 3 (2026-11-20/21)

Skissen "Testerna, omgång 3: upplevelsen" (artefakten WsTzySXM8d4DyHpAwheJs8), byggd på grenen `feat/tester-omgang3` från `4d7347dd`. Byggspecen låg utanför repot. Inga rutter, POST-kroppar, händelsenamn, kvoter, priser, kampanjfiler eller juridiska texter ändrade; inga databasmigreringar.

### Vad som byggdes per steg

- **Bankinnehållet** (gren `innehall/tester-omgang3`, sammanslagen i `effc4cf3`): strukturerat facit för numeriskt (`losning.steg`, `anvander`, `slutsats`, 333 av 336 frågor) och verbalt (`stod`, `narmast`), namn på leden i deduktiva premisskedjor (`formell.termnamn`, `atomnamn`), rättade `facit_betyder` i ordförrådet och fyra rättade misstagstexter för tärningar. Commits `23d8ad41`, `cab1166f`, `5d3c1753`, `29cce3b2`, `c4a0d207`, `124b8cd0`, `d51c8ac9`, `3fed83b5`, `7961975d`, `0c167cb6`. Tolv verbala facit (falskt till "går inte att avgöra") väntar på ägaren och är inte rörda.
- **Steg 1, grunden** (`673093ce`): formspråkets tokens och klasser, huvudet med stapeln i bitar och uppgiftens nivå (Träna), klossarna, domen och foten i sessionsramen.
- **Steg 2a, brädets typer** (`ef1a986d`, sammanslagen i `efacbc1d`): figurbrickorna, matrisen, figurserier (två rader på telefon), talserier, spatial, ordförråd, personlighet och I-provets mellanblad.
- **Steg 2b, underlagets typer** (`dc169442`, `f469b12a`, `e7c53509`): tabell, diagrammen, textuppgift, ord och text, deduktiv med villkorens bilder, remsan och kladdytorna. Facit för underlagets typer skickas bara med rättningen.
- **Steg 3a, sidorna** (`d9bfbc4f`, `3f12bac8`): Hem, Tester och Din utveckling med samma vägg, startarket, Vägen till provet och Dagens träning (`lib/tester/v4/vagen.ts`), tomma lägen som brädets lucka.
- **Steg 3b, målgången, resultatet och spärrarna** (`82c2f4d3`, `7eb4adc5`, sammanslagen i `a83ce755`): målgången i Träna med nivån före och efter, resultatsidan för test med genomgången, spärrarna (`TestSparr.tsx`) runt dagens texter och pris.
- **Steg 4, integration och slutkontroll** (den här):
  - `c5593d04` tre rubriker i mönsternamnen ("Öva på villkor med om och så", "Öva på villkoret inte bredvid varandra", "Öva på villkoret direkt till vänster om").
  - `2795629d` mönsternamnen ur `lib/tester/v4/monsterNamn.ts` på målgången ("Det du missade: ..." med länk till riktad träning för matris, ord och text, siffror och tabeller, talserier, spatial och ordförråd), i genomgångens tagg per rad (Träna i alla typer utom ord och siffror, där mönstret per uppgift saknas i datan; övningsprov i matris, deduktivt och figurserier) och i Var du tappade. Nytt prop `monsterRader` på `Resultatskarm`, hjälparen `session/resultat/monster.ts`. Inget id når användaren: okänt mönster ger ingen rad.
  - `d0c33725` spärrens siffror: `lib/tester/v4/sparrData.ts` tar nivån i typen, provet med dagen, formatet och dagar kvar ur `TesterV4Data`. Tester (`LasProvider` med `underlag`, låsen i "Välj hur du vill öva" skickar typen), Hem och Din utveckling (`Betalvagg`, utan typ) och övningsprovets startskärm (provet ur planraden som sidan redan läser). Provet och formatet bara när typen ingår i planen; eget urval heter "Provet". `betalvagg_visad.dagar_kvar` fylls nu också från arket på Tester och Hem (samma händelse och egenskap).
  - `7f2da198` delar som skulle döljas syntes i fel bredd (klasser i globals.css utanför Tailwinds lager vinner över `hidden`): "3 rätt i rad" i huvudet på telefon tryckte ihop stapeln, periodvalet i Din utveckling ritades två gånger, "Texten fortsätter" och sidledspilen syntes på dator. Mätaren i Tre mått flödade ut ur panelen på 1440 med sidomenyn. Filtret Missarna och Alla 44 px.
  - `3b266b78` spärrens ark ritades bakom startarket (z 51 mot 50), med köpknappen skuren på dator och dold på telefon. Startarket har nu z 50.
  - `d8f7408f` räknevägen i domen och spärrens siffror var mörkt på mörkt i mörkt läge; tryckytan för "7 dagar kvar" och sidledspilen 44 px.
- **Steg 4, sista rättningarna efter samordnarens granskning:**
  - `bfab957f` genomgångens utfällda rad: talserier, spatial och ordförråd står med uppgiften över domen, så att fyra eller fem svar får hela bredden och etiketterna inte ligger över grannklossarna.
  - `6b72e28e` övningsprovets mening: "Flest missar: <grupp>. De står i genomgången."
  - `c86a8f87` raden "Nästa steg" på telefon säger mönstrets rubrik ("Öva på växande steg.") eller bara "Träna det du missade" (`nastaSteg.monster.ova`, `tranaMissatSteg({ typ })`).
  - `af85c9a0` raden "Nästa steg" visar radens ikon (`RadIkon ?? Miniatyr`), inte en beskuren textbit.
  - `e34b60d7` planens övningsprov i typens meny leder till typens eget prov (ord och text i SHL Verify till ord och text), med "I provets format, utan förklaringar." när formatet är en annan typs.
  - `869ad6ce` och `b8962f54` tooltipen "Din första punkt" ritas över "i dag"-linjen och hålls inom grafen; "din nivå när du började" i målgångens kurva står där markörerna inte krockar, annars inte alls.
  - `92eadb45` personlighetstestets påstående var mörk text på mörk yta: steg 2a och 2b hade gett två kort samma klass `.sess-pastaende`. Personlighetens kort heter nu `.sess-personlighet-kort`.

### Nya fält i API-svaren (alla valfria, inga namn ändrade)

- Svaren i Träna (pass, riktat, ord och siffror, steg 2, figur, deduktiv): `uppgift_niva`, `nasta_niva`.
- Slutför i Träna (`/api/traning/{deduktivpass,figurpass,steg2pass,vnpass}/slutfor`): `niva_fore`, `niva_efter`.
- Återkopplingen efter svar och genomgången efter rättning: `vnFacit` (`losning`, `stod`, `narmast`), deduktivt `ledNamn`; uppgiften i deduktivt `struktur` (villkorens form, utan facit).
- Övningsprovets genomgång: `monster` (mönstrets namn) för deduktivt och figurserier.
- Facit når aldrig den utloggade: provsidans och artikelns svar före claim granskades i nätverket (inga `losning`, `stod`, `narmast`, `slutsats`, `anvander`, `vnFacit`, `ledNamn`, `formell`, rätt svar eller förklaring).

### Prov och mätning (slutkontrollen)

- tsc rent. Hela vitest-sviten 277 filer och 3560 test gröna (13 hoppade över), berörda mappar 51 filer och 490 test efter rättningarna. `next build` grönt tre gånger (efter integrationen och efter varje rättning).
- SEO-diffen mot produktion (21 sidor, `scripts/seo-diff-artiklar.ts`, avtryck taget mot www.jobbcoach.ai samma kväll) och provkontrollen (19 sidor, `scripts/qa-omgang2-publikt-prov.ts`): Fel: 0 båda. Ord i main oförändrade på de hårda sidorna (personlighetstestet 621, provsidan 111).
- Utloggat mot bygget: provsidans startskärm för alla nio typer, talserier från start till spärren och `/register?test=`, artikelprovet i numeriskt-test-guide (ingen 500 i det byggda) till spärren, personlighetsprovet till `/register?personlighet=`. Ingen facitnyckel i HTML eller nätverkssvar. IP-gränsen (tre prov per dygn) nåddes; provsidan på telefon kontrollerades därför bara till startskärmen och gränsens meddelande.
- Klicktest i Chrome mot bygget (skärmdumpar i scratchpad `omgang3-bygg/steg4/bilder`): Träna i alla åtta typer från startskärm till målgång på 1440 och 412 (412 som bredd i samma session), deduktivt, ord och text och spatial också som Pixel 7; nivåtest i deduktivt, talserier och ord och text till resultat och genomgång (sessionssidan `/test/<id>` svarar i bygget, ingen 404); Nivåkollens resultat i tre typer; övningsprov i ord och text från start till resultat på Pixel 7 och resultaten i deduktivt och figurserier; Hem, Tester, Din utveckling och startarket med premiumkontot, gratiskontot och premiumkontot med plan (SHL Verify, provdag 27 nov, lagd via "Välj prov"); spärrarna med gratiskontot (kvoten i arket och på nivåtestets sida, låst nivå, låst övningsprov, Träna, övningsprovets startskärm); mörkt läge; app-UA (`JobbcoachApp/`) med appens start, en träning och målgången; 768 och 1024.
- Köpknappens mål är oförändrat: `/dashboard/valj-spar?paket=all_month&steg=kop&plats=<plats>` med samma platser som i dag (`kvot`, `test_tak`, `testniva`, `generalrepetition`, `dag2`, `provlage`). Inget köp gjordes.
- Tangentbord: Enter startar, bokstaven väljer, Enter svarar och domen kommer, Esc stänger startarket, fokusringen syns (2 px). Kontrast i klossar och dom över 4,5:1 i ljust och mörkt i stickprovet (talserier).
- `scripts/perf-inloggat.ts` (Pixel 7, 3x CPU, LTE, median av tre, `--samtycke`, premiumkontot): Hem 952 ms, Tester 772 ms, Din utveckling 772 ms, resultat deduktivt 392 och talserier 504 ms, första uppgiften deduktivt nivåtest 364, deduktiv Träna 404 och steg 2 Träna 552 ms, startskärmar 680 till 740 ms, CLS 0 överallt. Flikbytet Hem, Tester, Din utveckling, Hem: CLS 0 på 1440 och Pixel 7.

### Kvar efter slutkontrollen

- Sista kontrollen i bygget (bilder `slut-*`): räknevägen i mörkt läge läsbar på 1440 och 412, personlighetstestet inloggat på 1440 och Pixel 7, I-provets mellanblad inloggat på 1440 och Pixel 7, Enter från domen till nästa uppgift (uppgift 2 till 3), den utfällda raden i talserier, ordförråd (fem svar), spatial (fyra) och siffror och tabeller på 1440 och 412. Hela vitest-sviten 277 filer och 3560 test, tsc rent, bygget grönt.
- Kosmetiskt: på 1024 kortas typens namn och undertiteln i sessionens huvud ("Deduktiv slutl..."); "Något ser fel ut" och provsidans typval (omgång 2) har 32 och 40 px tryckyta; "Skicka igen" i e-postbannern 20 px (inte tester); "Du har gjort tre prov idag" (provsidans meddelande) skriver "idag".
- Spärrens rader om provet (provets namn, dag, dagar kvar) är prövade i enhetstest och på premiumkontots plan i datan, men inte sedda i webbläsaren: inget gratiskonto har en plan.
- Mönstertaggen per rad saknas i ord och text och siffror och tabeller (Träna och övningsprov) och i nivåtesten: mönstret per uppgift finns inte i deras data.
- QA-raderna från slutkontrollen ligger kvar (se nedan).

### QA-rader från slutkontrollen

Premiumkontot `…+jobbcoach-qa-omg2-premium@gmail.com`: en plan i `test_planer` (SHL Verify, provdag 2026-11-27, ett test om dagen) lagd via gränssnittet, träningssessioner i alla åtta typer (flera återupptogs), sex nivåtestsessioner (tre avbrutna av testskriptet, tre avslutade), ett övningsprov i ord och text. I den sista kontrollen dessutom: en personlighetssession (tio av femtio påståenden, inte avslutad), en I-provssession (öppnad till mellanbladet, inte startad), en ny träning i deduktivt (avslutad), en i siffror och tabeller (en uppgift, inte avslutad) och en i talserier som återupptogs. Gratiskontot: inga nya sessioner (bara spärrarna). Utloggat: tre provsessioner i `anon_test_sessions` och en i `anon_personality_samples`. Inget raderat.

### Backning

- Hela omgången: `git revert -m 1 <merge-commit på main>` om grenen slås ihop med en merge, annars `git revert --no-edit 4d7347dd..<sista commit>` i ett svep. Ingen databasändring finns att backa; planraden och sessionerna ovan är vanliga användardata.
- Bara gränssnittet: revertera commits från `673093ce` och framåt utom bankinnehållets (`23d8ad41` till `0c167cb6`, `effc4cf3`). Bankfälten (`losning`, `stod`, `narmast`, `formell`, `ledNamn`) är valfria i typerna och läses bara av det nya gränssnittet, så bankerna kan stå kvar när gränssnittet backas. De rättade definitionerna och misstagstexterna är rättelser och bör stå kvar.
- En enskild rättning i steg 4 backas med `git revert <hash>` (listan ovan); de är oberoende av varandra utom att `d0c33725` använder `session/resultat/monster.ts` från `2795629d`.

## Publika proven, omgång 3 (2026-11-21)

Provsidan (`/verktyg/rekryteringstester/prova`), provet i artiklarna, registreringens provpanel och personlighetsprovet i omgång 3:s formspråk. Ägarens beslut A till G i byggspecen för de publika proven. Gren `feat/publika-prov-omgang3`, inte pushad vid slutkontrollen.

### Commits

- `ac53488a` servern: ett öppet facit per prov, valt av servern; mätningens nya egenskaper och händelser; kontrakttester.
- `a24fc818` provsidans resultat och spärren i tre varianter, Google-knappen med token, startskärmens typval.
- `d059cdea` provet i artiklarna: resultatet utan rubriker, kontoraden på telefon, provtexten.
- `3422f883` registreringens provpanel och det konkreta löftet.
- `f367ff6c` (via merge `1e28bea7`) personlighetsprovet, byggt på egen gren.
- Rättningar efter granskningen: `e3fc92d6` typvalet som rutnät, `6af7f44b` typens symbol i stället för beskurna miniatyrer, `9b1d0b56` typraden i personlighetsprovet en gång i DOM, `cb723874` och `054e4f3e` mörkt läge, `f7ea6e3f` artikelrutans höjd medan resultatet laddas (CLS 0), `6dee5590` tryckytan för Logga in, `ea44cb8e` fem sifferklossar i det öppna kortet (märket i klossen och raden Ditt svar / Rätt svar, som på telefon).
- `16c4a5a7` SEO: baslinjen omtagen för /verktyg/personlighetstest (`scripts/seo-baslinje/publika-prov-omgang3-2026-11-21-undantag.json`, SEO-godkänd). SEO-diffen mot bygget på 21 sidor: Fel 0. Facitkontrollen (`qa-omgang2-publikt-prov.ts`, 19 sidor): Fel 0.

### Kontraktet: `oppet_facit`

Rättningen i `POST /api/public/test-session` (`{ token, answers }`) svarar som förut med `{ score, total, fel, percentile }` och dessutom:

- `variant`: `'noll' | 'en' | 'flera'` ur antal missar.
- `antal_fel`: antal fel eller obesvarade.
- `oppet_facit`: `{ index, correct, uppgift }` eller null. `index` är 0-baserat som `fel`. Regeln (`src/lib/tests/oppet-facit.ts`, `valjOppetFacit`): två eller fler missar ger första missen, en miss ger första uppgiften hon klarade, noll missar ger första uppgiften. `uppgift` är genomgångens form, samma som sidan efter kontot: typerna `GenomgangUppgift` ur `genomgaProv`, matrisen `{ kind: 'matris', nyckel, data: GenomgangsFraga, valt, correct, misstag }`.
- Ett rättat prov rättas inte om: samma token ger samma svar, nya svar ignoreras. Startsvaret är oförändrat och bär inget facit.
- Klienten sparar `oppet_facit` och uppgifterna (utan facit) i fliken (`jc_prova_resultat_v2`), så att resultatet efter Tillbaka från registreringen är detsamma.

### Mätningen

- `signup_gate_shown` får `antal_fel`, `variant` och `facit_oppet` (utöver `plats` och `test_kind`, som fanns).
- Nya händelser: `gate_cta_clicked` med `position` (`ark`, `kort`, `google`) och `facit_viewed` (en gång per token när det öppna kortet syns). Hjälpare i `src/lib/analytics/sparren.ts`.
- Kontrollerat i webbläsaren mot bygget med en fångare i stället för PostHog (inget skickades): alla tre egenskaperna i båda ytorna, `gate_cta_clicked` med `kort`, `ark` och `google`, `facit_viewed` en gång per prov.

### Mätvärden (bygget, Pixel 7, 3x CPU, LTE, median av tre, `scripts/perf-publikt.ts`)

| Sida | LCP bygget | LCP www | CLS bygget | CLS www |
| --- | --- | --- | --- | --- |
| /verktyg/rekryteringstester/prova | 476 ms | 736 ms | 0 | 0,018 |
| /verktyg/personlighetstest | 580 ms | 640 ms | 0 | 0 |
| /artiklar/numeriskt-test-guide | 492 ms | 524 ms | 0 | 0 |

CLS när resultatet laddas in (Pixel 7, riktiga tryck, rättningen fördröjd 1,2 s, bara skiften utan nylig inmatning): provsidan 0 (matris, talserier), artikelrutan 0 (matrigma-test tre gånger, numeriskt-test-guide). Före `f7ea6e3f` var artikelrutan 0,24 till 0,28.

### Kvar

- **Logga in från resultatet hämtar inte provet till ett befintligt konto** (kört med QA-gratiskontot från omgång 2, Pixel 7, bygget). Kedjan: resultatet, "Logga in" till `/login?redirect=/dashboard/valkommen`, inloggningen lyckas, `/dashboard/valkommen`, `/dashboard`. Ingen `jc_signup`-cookie (inloggningen skriver ingen), ingen `?test=` i adressen, så servern på valkommen-sidan (`page.tsx`, "Inget pågående registreringsflöde") skickar ett befintligt konto till `/dashboard` innan hämtkedjan i klienten körs. `jc_pending_test` står kvar i fliken, inget claim-anrop görs, provet är ohämtat. Fanns före omgången (`loggaInHref` i `RegisterKontoSteg.tsx` är orörd). Möjlig rättning, inte gjord: `loggaInHref` med smakprov skickar `redirect=/dashboard/valkommen?test=<token>`, som valkommen-sidan redan läser (`smakprovUrParams`).
- `FigurserieTrana.test.tsx` (inte rörd i den här omgången) föll med 2 test i hela sviten under full last och är grön ensam; noteras, testet är inte ändrat.
- Startskärmen följer den delade `Startskarm` (knappen i kortet, inte i hjälten som i förlagan); matrisens öppna kort står i en kolumn; domen är `Forklaringen`, inte förlagans tvåspaltsruta.
- Facittexter finns i fyra JS-filer som bara laddas av den inloggade resultatsidans genomgång (`TestResultsPage`, `NumericalReview` med flera, dynamiskt). Fanns före den här omgången och laddas inte av de publika proven.

### Backning

- Hela omgången: `git revert -m 1 <merge-commit på main>`, eller commitsarna ovan i omvänd ordning. Ingen databasändring finns.
- Bara gränssnittet: revertera `a24fc818`, `d059cdea`, `3422f883` och rättningarna. Serverns fält är valfria och läses bara av det nya gränssnittet.
- Stänga det öppna facit för en miss (saas-leads backningsregel): i `valjOppetFacit` i `src/lib/tests/oppet-facit.ts`, returnera `index: -1` när `variant === 'en'`. Servern skickar då `oppet_facit: null` för en miss, gränssnittet visar remsan, de låsta raderna och spärren utan öppet kort, och mätningen skickar `facit_oppet: false`. Varianten och rubriken ("Se regeln bakom uppgiften du missade") står kvar. Kontrakttestet `oppet-facit-kontrakt.test.ts` behöver då ändras för fallet en miss.
- Stänga det öppna facit helt: samma ändring för alla varianter (`index: -1`).
