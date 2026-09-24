# Innehållsplan oktober till december 2026

Skriven 2026-09-23 av SEO-strategen efter ägarens beslut samma dag: sex till tio nya sidor i månaden, testklustret först, intervjuprovet byggs. Underlag: `docs/rapporter/analys-seo-tillvaxt-2026-09-23` (Search Console 12 juni till 21 september, PostHog, Supabase, URL-inspektion av hela sajtkartan). Alla visningar och positioner nedan är ur Search Console. "21 d" betyder 1 till 21 september, "100 d" betyder 12 juni till 21 september.

Pågår redan och ingår inte i den här planen: åtgärd 1 (mätfixar), 2 (cover-letter-sverige), 3 (testklustrets länkar, sajtkartan, rekryteringstester-guide), 5 (styrkor-svagheter-listor), 9 (bakgrundskontroll-vid-anstallning). Startar efter dem: åtgärd 6 (snippetpass, avslutningsartiklarna) och åtgärd 7 (de tre testsidorna, som är sida 1 till 3 här).

## 1. Läge och mål

Utgångsläge 8 till 21 september: 21,1 klick per dag, alltså cirka 630 i månaden, på 1 207 visningar per dag och snittposition 15,7. 32 nya konton på 14 dagar, alltså cirka 69 i månaden (Supabase, interna konton borttagna). Testsidor ger 3,8 konton per 100 sessioner, artiklar 0,4, yrkesexempel 0,7. Ingen ny artikel sedan 23 juli.

| Månad | Klick/mån, mål | Konton/mån, mål | Vad som driver det |
|---|---:|---:|---|
| Oktober | 700 | 70 | Åtgärdslistan (cover letter, styrkor-svagheter, snippetpass) börjar synas. Oktobers nya sidor hinner knappt ranka. |
| November | 850 | 85 | Omskrivningarna i avsnitt 3, oktobers testsidor på plats, intervjuprovet live |
| December | 850 till 900 | 80 till 90 | Novembers sidor. Jobbsökandet brukar dämpas i slutet av december. Vi har ingen egen december att jämföra med, så målet är att hålla nivån. |

Målen förutsätter att åtgärdslistan levereras enligt plan. Konton räknas ur Supabase. Landningssidan läses ur `profiles.acquisition_source`, som fungerar sedan 21 sep 21:54.

## 2. Nya sidor, i prioritetsordning

Sidtyp: A = artikel, E = yrkesexempel (alltid par, CV plus brev), V = verktygssida. CTA följer klusterregeln i `src/lib/cta/clusters.ts`: test leder till provet `/verktyg/rekryteringstester/prova` och Testveckan, intervju till intervjuprovet när det är live, brev till `/skapa-brev/start`, CV till mallarna eller analysen.

Klickuppskattningen gäller månad tre efter publicering, vid normal CTR på den position som liknande sidor hos oss når. Kontouppskattningen bygger på vår faktiska omvandling per ingångstyp. Alla slugs är kontrollerade mot `content/artiklar/`, `content/rekryterare/`, exempeldatan och den publicerade sajtkartan 23 sep. Ingen av dem finns.

| # | Månad | Slug | Typ | Målfråga (visningar, position) | Sekundära frågor | Avsikt | Kluster, CTA | Klick/mån | Konton/mån | Insats |
|---|---|---|---|---|---|---|---|---:|---:|---|
| 1 | okt | /artiklar/alva-labs-logiktest | A | "gratis alva test" (15 på 21 d, pos 10,3), "alva logiktest" (5, pos 21,2) | alva labs logiktest öva, alva labs logiktest gratis, alva labs logiktest resultat, alva test gratis | Ska göra Alvas test snart, vill öva | test, provet | 15 till 25 | 1 | M |
| 2 | okt | /artiklar/map-test-personlighetstest | A | "personlighetstest map" (17, pos 17,9) | map test gratis (14, pos 12,1), map personlighetstest (13, pos 23,2), map test exempel (12, pos 25,2) | Förstå och förbereda sig för MAP | test, provet | 10 till 20 | 0,5 till 1 | M |
| 3 | okt | /artiklar/deduktivt-induktivt-test | A | "deduktiv logik" (11, pos 7,6) | deduktiv slutledningsförmåga test gratis (8, pos 8,3), induktiv slutledningsförmåga test gratis (6, pos 9,7) | Vet vilken deltesttyp som väntar, vill öva just den | test, provet | 8 till 15 | 0,5 till 1 | M |
| 4 | okt | /artiklar/matrigma-test | A | "matrigma test" (ingen synlig fråga, bara "map och matrigma test" 1 visning. Bedömning: Assessios test är vanligt hos svenska arbetsgivare, och frågorna döljs som sällsynta) | matrigma öva, matrigma gratis, matrigma resultat | Ska göra Matrigma, vill öva | test, provet | 10 till 20 | 1 | M |
| 5 | okt | /artiklar/arbetspsykologiska-tester | A | "arbetspsykologiska test" (15, pos 68,3) | arbetspsykologiska tester (12, pos 78,8), "vilka verktyg används för arbetspsykologiska tester vid rekrytering?" (25, pos 59,2), tester vid rekrytering (22, pos 62,9), intelligenstest rekrytering (18, pos 57,2), begåvningstest rekrytering (10, pos 61,1) | Översikt över testtyper från kandidatens håll. Navet som länkar till alla testguider. | test, provet | 15 till 30 | 1 | M |
| 6 | okt | /cv-exempel/tandskoterska + /personligt-brev-exempel/tandskoterska | E | ingen synlig fråga, bedömning: vårdkategorin är vår starkaste exempelkategori | tandsköterska cv, personligt brev tandsköterska | Mall att utgå från | cv/letter, skapa-brev och mallarna | 5 till 10 (paret) | under 0,5 | M |
| 7 | nov | /artiklar/logiktest-exempel-med-losningar | A | "logiskt test figurer förklaring" (14, pos 16,1) | logiska tester vid rekrytering exempel (10, pos 19,0), logiktest övning gratis (18, pos 10,4), logiktest övning (6, pos 17,3) | Vill se uppgifter och förstå lösningen | test, provet | 10 till 20 | 1 | M |
| 8 | nov | /artiklar/aon-cut-e-test | A | ingen synlig fråga, bedömning: Aon nämns i logiska-tester och är en av de tre leverantörerna kandidater möter | aon test, cut-e test öva, scales test | Leverantörsspecifik förberedelse | test, provet | 8 till 15 | 0,5 till 1 | M |
| 9 | nov | /artiklar/videointervju-tips | A | ingen synlig fråga, bedömning: intervjuklustret har störst läsarskara (113 läsare på 12 dagar). Digitala förstaintervjuer saknas helt hos oss. | inspelad videointervju, digital intervju tips, teams intervju | Förbereda sig för digital intervju | interview, intervjuprovet | 10 till 20 | 0,5 till 1 med provet | M |
| 10 | nov | /artiklar/uppsagningsbrev-mall | A | "hur man skriver ett uppsägningsbrev" (61 på 100 d, pos 52, idag på saga-upp-sig) | egen uppsägning (60, pos 67), uppsägningsbrev exempel, säga upp sig mall | Mall att kopiera | career, länkrad till räkna ut uppsägningstid | 10 till 20 | 0 | S |
| 11 | nov | /cv-exempel/vvs-montor + /personligt-brev-exempel/vvs-montor | E | ingen synlig fråga, bedömning: hantverkskategorin har bara snickare och elektriker | vvs montör cv, personligt brev vvs | Mall | cv/letter | 5 till 10 | under 0,5 | M |
| 12 | nov | /cv-exempel/byggnadsarbetare + /personligt-brev-exempel/byggnadsarbetare | E | bedömning, samma skäl | byggarbetare cv, personligt brev byggarbetare | Mall | cv/letter | 5 till 10 | under 0,5 | M |
| 13 | dec | /artiklar/soka-sommarjobb | A | "sommarjobb cv" (307 på 100 d, pos 46, idag på /cv-mallar/sommarjobb) | cv för sommarjobb (67, pos 42), cv sommarjobb (68, pos 37), personligt brev sommarjobb | Söka sommarjobb 2027. Publiceras i december så sidan hinner ranka till ansökningstoppen januari till mars. | letter, skapa-brev plus sommarjobbsexemplen | 20 till 40 (jan till mar) | 1 till 2 | M |
| 14 | dec | /artiklar/tolka-testresultat | A | "alva labs logiktest resultat" (3, pos 10,7), bedömning: frågan kommer efter varje test | vad betyder percentil test, logiktest resultat bra, normgrupp test | Förstå sitt resultat | test, provet | 5 till 15 | 0,5 | S |
| 15 | dec | /cv-exempel/frisor + /personligt-brev-exempel/frisor | E | bedömning, servicekategorin | frisör cv, personligt brev frisör | Mall | cv/letter | 5 till 10 | under 0,5 | M |
| 16 | dec | /cv-exempel/malare + /personligt-brev-exempel/malare | E | bedömning, hantverkskategorin | målare cv, personligt brev målare | Mall | cv/letter | 5 till 10 | under 0,5 | M |

Summa: 16 poster och 21 sidor, varav fem yrkespar på tio sidor. Oktober har 7 sidor, november 8 och december 6. Två poster till står under ägarbeslut i avsnitt 7 (intervjufrågor per yrke), och med dem blir det 23 sidor.

Förväntad effekt när alla nått månad tre: 145 till 290 klick i månaden och 8 till 13 konton i månaden. Testsidorna står för två tredjedelar av kontona.

Regler per sida, gäller alla agenter:
- Artiklar skrivs enligt artikel-arbetssättet: SERP-benchmark, källverifiering mot leverantörernas egna sidor, seoTitle högst 60 tecken, description 110 till 158, 5 till 6 faq, snabbsvarsblock, inga talstreck och SVG-bild.
- Testsidorna 1 till 5, 7, 8 och 14 länkas från /artiklar/arbetspsykologiska-tester och /artiklar/logiska-tester, och länkar tillbaka till båda och till provet.
- Hubbtrimning i samma commit som varje ny spoke. Alva, Matrigma och Aon tas ut som korta stycken i logiska-tester och ersätts med en länk. MAP tas ut ur personlighetstest-jobb-guide. Deduktiv och induktiv tas ut ur logiska-tester. Uppsägningsbrevet tas ut ur saga-upp-sig. Sommarjobb tas ut ur cv-exempel-student-nyexaminerad. Rubriker som redan rankar i hubben lämnas kvar som rubrik med en mening och länk.
- Yrkespar enligt paritetsregeln: CV och brev i samma batch med samma persona (namn, ort, arbetsgivartyp, siffror). Registrera i båda `[yrke]/page.tsx`, `sitemap.ts`, `galleri-data.ts`, `yrken-data.ts`, båda `og-yrke-map.ts` och `exempel-data.ts` (KATEGORIER och TOTAL). Diffa slugs i båda exempeldatafilerna före push. Tandsköterska läggs i kategorin vard, VVS-montör, byggnadsarbetare och målare i hantverk, frisör i service. Kör kommandot `/skapa-exempel`.

## 3. Omskrivningar av befintliga sidor

Här står sådant som inte redan ligger i åtgärdslistan. Ordningen följer klick per månad delat med insats.

| # | Sida | Problem i datan | Ändring | Klick/mån | Insats |
|---|---|---|---|---:|---|
| R1 | /artiklar/cv-profil-sammanfattning | Hämtad men inte indexerad sedan april. Hade 551 visningar på pos 33 före. Frågorna "cv profil" (334 på 100 d), "profil cv" (303), "profil i cv" (274), "cv profil exempel" (177) och "sammanfattning cv" (74) gick tidigare till en taggsida som nu är noindex. Ingen sida tar dem i dag. | Skriv om till en fullständig sida: 15 profiltexter per yrkesgrupp, före/efter-exempel och ett snabbsvar om längden. seoTitle "CV-profil: 15 exempel på profiltext att utgå från". Begär indexering efter publicering. | 20 till 40 | M |
| R2 | /artiklar/personligt-brev-pa-engelska | "personligt brev engelska" (543 på 100 d) och "personligt brev på engelska" (441) går till cover-letter-sverige på pos 17 till 24. Den här sidan rankar i stället för "cv engelska mall" (313), som är fel avsikt. | Titel och H1 "Personligt brev på engelska: mall och exempel (UK och US)". Stryk CV-mallsformuleringarna. Korslänka med cover-letter-sverige: den ena tar svensk mall, den andra engelsk. | 15 till 30 | S |
| R3 | /artiklar/cv-pa-engelska-resume | "cv på engelska" (443, pos 39), "cv mall engelska" (316, pos 32), "cv engelska" (269, pos 42), "skriva cv på engelska" (137). Sidan saknar en färdig engelsk CV-mall. | Ett komplett engelskt CV-exempel högt upp, en ordlista svenska till engelska för rubrikerna, CTA till mallarna. seoTitle "CV på engelska: mall, exempel och översatta rubriker". | 15 till 30 | M |
| R4 | /artiklar/personlighetstest-jobb-guide | "personlighetstest rekrytering exempel" (163, pos 75), "personlighetstest" (pos 22), "personlighetstester" (pos 46). | Avsnitt med tio exempelpåståenden och hur de tolkas, plus en länk till MAP-sidan (sida 2). Trimma MAP-stycket enligt hubbregeln. | 10 till 20 | M |
| R5 | /artiklar/skapa-cv-med-ai | "ai cv" (444, pos 28) och "skriva cv med ai" (62, pos 36) går till startsidan. Artikeln ligger på pos 10 med 59 visningar. | seoTitle "AI CV: så skriver du ditt CV med AI gratis". Snabbsvar om vad AI gör bra och dåligt. CTA till /verktyg/skapa-cv och analysen. Startsidan behåller sitt varumärkesord. | 10 till 20 | S |
| R6 | /artiklar/referenser-cv | 916 visningar på 100 d, pos 55. "cv exempel referenser" (310, pos 65), "cv referenser exempel" (251, pos 59), "referenser exempel" (105, pos 59). | Tre färdiga referensblock att kopiera högt upp, "Referenser lämnas på begäran" förklarat, och hur du frågar en referens. | 10 till 20 | M |
| R7 | /artiklar/saga-upp-sig | 943 på 100 d, pos 37, noll klick i september. "säga upp sig" (74, pos 29). | Snabbsvar om uppsägningstid enligt LAS med länk till /rakna-ut/uppsagningstid. Trimma mallstycket när sida 10 publiceras. | 5 till 15 | S |
| R8 | /artiklar/rotation-test-guide | "spatial förmåga" 154 visningar, pos 11, ett klick | H2 "Vad är spatial förmåga?" med snabbsvar och två övningsuppgifter | 5 till 10 | S |
| R9 | /artiklar/strukturerad-intervju | "strukturerade och standardiserade intervjuer" (92, pos 17), "semistrukturerad intervju" (66, pos 21), 173 visningar i sep, noll klick | H2 "Semistrukturerad intervju: så skiljer den sig", en jämförelsetabell över de tre formerna i JSX (inte markdown-tabell) | 5 till 10 | S |
| R10 | /artiklar/varfor-ska-vi-anstalla-dig-svar | "varför vill du jobba hos oss" (88, pos 59) | H2 med frågan ordagrant och tre exempelsvar. Kontrollera att varfor-soker-du-jobbet-svar inte tar samma fråga; om den gör det, länka i stället för att dubbla. | 5 till 10 | S |

Omskrivningarna ger sammantaget 100 till 200 klick i månaden. R1 till R3 görs i oktober och resten i november.

## 4. Sammanslagningar och borttagningar

Varje sammanslagning görs likadant: flytta det som är unikt till målsidan, lägg 301 i `next.config.ts` under `redirects()`, uppdatera interna länkar med grep, ta bort ur sajtkartan och begär omhämtning av målsidan. Ingen sida tas bort utan 301.

| # | Från | Till | Motivering |
|---|---|---|---|
| M1 | /artiklar/cv-mall-pdf-gratis | /cv-mallar | Indexerad men noll visningar på 100 dagar |
| M2 | /artiklar/online-cv-byggare-gratis | /verktyg/skapa-cv | Okänd för Google, samma avsikt som verktygssidan |
| M3 | /artiklar/fardiga-personliga-brev | /personligt-brev-exempel | Hämtad men inte indexerad sedan maj. Exempelhubben äger avsikten. |
| M4 | /artiklar/mjuka-harda-kompetenser | /artiklar/olika-kompetenser-typer | Okänd för Google. Målsidan är bäst placerad i kompetensklustret (pos 32 i sep). |
| M5 | /artiklar/fardigheter-cv-exempel | /artiklar/fardigheter-kompetenser-cv | 13 visningar på 100 dagar, samma ämne |
| M6 | /artiklar/cv-bild-guide | /artiklar/bild-i-cv-ja-eller-nej | Båda tar "cv med bild" (482, pos 69) och "cv bild"; sju sidor delar frågan. Målsidan har bäst position (28). |
| M7 | /artiklar/olika-intervjutyper-tekniker | /artiklar/olika-intervjutyper-tips | Två sidor om samma sak, "intervjutyper" 84 på pos 12 |
| M8 | /artiklar/hur-skriver-man-ett-personligt-brev, /artiklar/tips-pa-personligt-brev, /artiklar/bra-personligt-brev | /artiklar/skriva-personligt-brev-guide | Fyra "så skriver du"-sidor, alla på position 50 till 66 och noll klick. Samla styrkan på en. |
| M9 | /artiklar/personligt-brev-innehall-checklista, /artiklar/vad-ska-finnas-med-i-personligt-brev | /artiklar/personligt-brev-struktur-innehall | 11 och 6 visningar på 100 dagar, samma avsikt |
| M10 | /artiklar/skriva-cv-guide | /artiklar/hur-skriver-man-cv | 27 visningar, pos 66, samma avsikt som målsidan |
| M11 | /artiklar/din-digitala-jobbcoach | /artiklar/vad-ar-en-jobbcoach | Två visningar på 100 dagar |
| M12 | Exempelparet hemtjanstpersonal (CV, brev, cv-mall) | hemtjanst (CV, brev, cv-mall) | "hemtjänst personligt brev" har 641 visningar på pos 52 och tio sidor delar frågan. Tre sidor ligger på pos 13 till 22 men ingen når upp. Paret slås ihop som par, så pariteten håller (89 blir 88 på båda). |
| M13 | Exempelparet kundtjanstmedarbetare (CV, brev, cv-mall) | kundtjanst | kundtjanstmedarbetare har 27, 3 och 47 visningar och konkurrerar med kundtjanst (102 och 125). Samma regel som M12. |

Kompetensklustret har nio sidor. Efter M4 och M5 är det sju kvar: kompetenser-cv-guide (1 643 visningar, pos 68), olika-kompetenser-typer (953, pos 37), vad-ar-kompetenser-guide, vilka-kompetenser-har-jag, exempel-pa-kompetenser-lista, fardigheter-kompetenser-cv och sociala-kompetenser. Det är för många för att slå ihop på data från ett enda utdrag. seo-content-strategist-se gör en egen genomgång per fråga i november innan fler sammanslagningar beslutas. sociala-kompetenser (pos 8) rörs inte.

Utanför sammanslagningarna: 15 brevexempel visar kort med "Kommer snart" för artiklar som inte finns (ats-optimerat-cv-underskoterska, intervjufragor-sjukskoterska, karriarvagar-larare och 52 till i `exempel-data.ts`). Korten länkar inte, men de lovar innehåll som aldrig kommer. Se ägarbeslut.

## 5. Ordning per vecka

Sammanslagningar görs på tisdagar. Nya sidor publiceras onsdag till torsdag, så att CDN-cachen på ett dygn och omhämtningen landar före helgen. Ingen mallomläggning på publika sidor före 7 oktober.

| Vecka | Nytt | Omskrivning och sammanslagning | Anmärkning |
|---|---|---|---|
| v40 (28 sep till 4 okt) | 1 alva-labs-logiktest, 2 map-test-personlighetstest | M1, M2, M3 | Åtgärd 7 startar. Hubbtrimning i logiska-tester och personlighetstest-jobb-guide i samma commit. |
| v41 (5 till 11 okt) | 3 deduktivt-induktivt-test | R1 cv-profil-sammanfattning, M4, M5 | Linjens avläsning 7 okt före nya mallar |
| v42 (12 till 18 okt) | 4 matrigma-test | R2, R3 | Avläsning av oktobers första sidor startar (indexerade?) |
| v43 (19 till 25 okt) | 5 arbetspsykologiska-tester | M6, M7 | Navet publiceras sist så det kan länka till 1 till 4 |
| v44 (26 okt till 1 nov) | 6 tandsköterska, paret | M12 hemtjanst | Paritetsdiff före push: 89 yrken, minus hemtjanstpersonal, plus tandsköterska, blir 89 |
| v45 (2 till 8 nov) | 7 logiktest-exempel-med-losningar | R4, R5 | Avläsning 4 veckor för v40-sidorna |
| v46 (9 till 15 nov) | 8 aon-cut-e-test | M8, M9 | |
| v47 (16 till 22 nov) | 9 videointervju-tips | R6, M10, M11 | Kräver att intervjuprovet är live, annars CTA till kompetensbaserade-intervjufragor |
| v48 (23 till 29 nov) | 10 uppsagningsbrev-mall, 11 vvs-montor-paret | R7, M13 kundtjanst | Trimma saga-upp-sig i samma commit som sida 10 |
| v49 (30 nov till 6 dec) | 12 byggnadsarbetare-paret | R8, R9 | Kompetensklustrets genomgång levereras |
| v50 (7 till 13 dec) | 13 soka-sommarjobb | R10 | Trimma sommarjobb i cv-exempel-student-nyexaminerad |
| v51 (14 till 20 dec) | 14 tolka-testresultat, 15 frisor-paret | | |
| v52 (21 till 27 dec) | 16 malare-paret | | Kvartalsavläsning förbereds till v1 |

Paritet efter kvartalet: 89 yrken i dag, minus 2 sammanslagna par, plus 5 nya par, ger 92 yrken med både CV och brev.

## 6. Mätpunkter

Varje månads sidor läses av två gånger, fyra och åtta veckor efter publicering, med `npx tsx scripts/analys-seo-tillvaxt.ts` och URL-inspektion. Konton läses ur `profiles.acquisition_source.landing_path`.

| Sidor | Första avläsning | Andra avläsning | Lyckat |
|---|---|---|---|
| Oktobers (1 till 6, R1 till R3) | 9 november | 7 december | Alla indexerade inom 14 dagar. Testsidorna har minst 150 visningar per månad och position under 20 på målfrågan efter 8 veckor. R1 är tillbaka i indexet. R2 och R3 har klättrat minst 5 positioner på sina målfrågor. Minst 40 procent CTA-klick på testsidorna, samma nivå som testklustret i dag. |
| Novembers (7 till 12, R4 till R7) | 7 december | 4 januari | Samma krav. videointervju-tips ger provstarter i intervjuprovet. |
| Decembers (13 till 16, R8 till R10) | 4 januari | 1 februari | soka-sommarjobb på sida ett för "cv för sommarjobb" eller "sommarjobb cv" före 1 februari |
| Sammanslagningarna | 4 veckor efter varje | | Målsidan har minst summan av källsidornas visningar och bättre position. Ingen 404 i Search Console. |
| Kvartalet | v1 2027 | | 850 klick i månaden i december och minst 80 konton i månaden. Testklustret står för minst 30 procent av klicken. Konton från testsidor är minst 25 procent av de spårbara kontona. |

Lyckas inte en sida vid andra avläsningen gör vi en av tre saker: ny titel om positionen är bra men CTR låg, utbyggnad om positionen fastnat på sida två, eller sammanslagning om sidan inte är indexerad efter åtta veckor.

## 7. Ägarbeslut

- **Yrkesspecifika intervjuartiklar.** Pausen på yrkesspecifika CV- och brevartiklar från juli gäller fortfarande. Intervjufrågor per yrke är en annan sorts sida och passar intervjuprovet, och 15 brevexempel har redan kort med "Kommer snart" för dem. Förslaget är två sidor i december, /artiklar/intervjufragor-underskoterska och /artiklar/intervjufragor-sjukskoterska, vård först. Svarar du nej tar vi bort "Kommer snart"-korten i stället, eftersom de lovar något vi inte levererar.
- **Ett publikt personlighetstest som smakprov** på en ny /verktyg/personlighetstest. MAP-sidan och personlighetstest-guiden har efterfrågan, och testprovet visar att smakprov blir konton. Det är en produktändring och kräver design i artefakt.
- **Sammanslagningen av exempelpar (M12, M13)** ändrar antalet yrken i galleriet och i publik copy om texten anger ett antal. Säg till om antalet används någonstans i marknadsföringen.
- **Insikter för rekryterare** får inga nya sidor det här kvartalet. De gav tre klick på 14 dagar och inga konton, och rekryterarsidan väntar på volym enligt tidigare beslut. Ändras det beslutet, finns "lönekartläggning krav" (198 visningar, pos 62) och "kompetensbaserad rekrytering" (245, pos 95) att bygga på.

## Ägarens beslut 2026-09-23

- Yrkesspecifika intervjuartiklar: ja, två i december (undersköterska, sjuksköterska). "Kommer snart"-korten står kvar tills dess.
- Publikt personlighetstest: byggt 2026-09-24 som personlighetsprovet (docs/design/rod-trad-prov-spec-2026-09-24.md), tjugo påståenden i personlighetstest-jobb-guide, map-test-personlighetstest och på /verktyg/personlighetstest. Rättelse: motorn fanns redan (src/lib/personalityTest/, grundtestet med 50 och det fördjupade med 120 påståenden i kontot), och provet poängsätts med den. Provet på /verktyg/rekryteringstester/prova är fortfarande logiktest.
- Sammanslagningarna (M1 till M7 och exempelparen): uppskjutna tills resten av planen är klar. Veckoordningen kör nytt och omskrivningar (R-listan) i stället.
- Rekryterarsidor: beslut väntar på ägarens svar.
- IndexNow-nyckel och Bing Webmaster Tools är på plats 2026-09-23 (importerat från Search Console, sajtkarta uppladdad).
- Rekryterarsidor (beslut 4, 2026-09-24): ja, men först när resten av planen är klar. Kandidatsidorna går före hela kvartalet; rekryterarämnena "lönekartläggning krav" och "kompetensbaserad rekrytering" ligger i kö efter v52.
- Personlighetstest (ändrat 2026-09-24): byggs nu, inte i oktober. Publikt smakprov i artiklarna där det passar (som intervjuprovet) och en röd tråd in i det inloggade läget: besökaren som gjort intervjuprovet eller personlighetstestet ska hitta sina resultat, kunna följa upp och göra om, även som betalande. Design i artefakt först.
