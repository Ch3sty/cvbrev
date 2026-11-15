# Faktagranskning: content/artiklar/map-test-personlighetstest.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, kärnan (200 påståenden, 25 delskalor, ingen tidsgräns, ingen återanvändning) stämmer med Assessio, men tiden för MAP Essence, antalet språk och en egenskapslista är fel, och en källänk är död.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 14, 22, 104, 201, 217 | "MAP Essence tar enligt Assessio tolv minuter" | fel | Assessios hjälpcenter: "MAP Essence contains 55 items and typically takes less than 10 minutes." Screeningsidan anger ingen tid. "12 minuter" finns bara i ett produktblad som nu ger 404 och hos tredjepartssajter. Ersätt med "55 påståenden, oftast under tio minuter". | https://helpcenter2.assessio.com/map-essence |
| 80 | "Testet finns på 18 språk, svenska inräknat" | fel | Assessios lista har 18 språkversioner men 15 språk (nederländska BE/NL, spanska Chile/Mexiko/Spanien räknas separat). Skriv "18 språkversioner" eller "15 språk". | https://assessio.com/personality-map/ (FAQ) |
| 35 | "Assessio beskriver MAP som ett test av arbetsrelaterade egenskaper som samarbetsförmåga, stresstålighet, drivkraft och noggrannhet" | fel (tillskrivning) | Formuleringen beskriver inte MAP. Närmast är Assessios text om integritetsalgoritmen i MAP Essence: "can describe how cooperative, stress-resistant and accurate the candidate is". "Drivkraft" förekommer inte. Stryk meningen eller skriv "Assessio beskriver MAP som ett test av arbetsrelaterad personlighet" utan listan. | https://assessio.com/screening/ |
| 31, 70–72 | "Social stil (vänlighet)" som femte faktor i MAP | obelagt | I MAP heter den femte skalan Agreeableness; "social style" används om MAP Essence. Assessios svenska skalnamn för MAP kunde inte bekräftas. Skriv "Vänlighet (agreeableness)" för MAP och behåll "social stil" bara i MAP Essence-avsnittet. | https://assessio.com/personality-map/ ; https://assessio.com/screening/ |
| 191 | Källänk "Assessio: Produktblad MAP Essence" (…/assessio-produktblad-map-essence.pdf) | död länk | Ger 404 (2026-11-15). Integritetsformuleringen på rad 120 ("agera regelmedvetet") kan inte längre beläggas på svenska; engelsk motsvarighet: "The integrity factor measures the person's ability to act in accordance with the rules and assesses the risk of harmful behavior at work". Byt länk till https://assessio.com/screening/ . | https://assessio.com/screening/ |
| 170 | "I kontot finns sedan hela testet med femtio påståenden och ett fördjupat med etthundratjugo" | fel (produkt, utelämnande) | Stycket står under "Går det att göra MAP-testet gratis?" och läses som att båda är gratis. Det fördjupade (personlighet-avancerad, 120 påståenden) är Premium-låst. Skriv "... med femtio påståenden, och i Premium ett fördjupat med etthundratjugo". | src/app/api/personalityTest/complete/route.ts (PREMIUM_LOCKED_TEST = 'personlighet-avancerad'); src/app/(public)/priser/page.tsx |

## Belagda påståenden
- Femfaktormodellen, 5 skalor med 5 delskalor = 25 (rad 12, 31, 35, 98): https://helpcenter2.assessio.com/bloomse/om-map ("5 skalor, 25 underskalor"), https://assessio.com/personality-map/
- 200 påståenden (rad 5, 14, 31, 98): "The web-based self-assessment questionnaire contains 200 statements", https://assessio.com/articles/how-assessios-personality-test-map-works-and-what-the-results-say-about-you/
- Ingen tidsgräns, ca 20–40 min (rad 14, 31, 103): https://helpcenter2.assessio.com/bloomse/om-map
- Tiogradig skala per skala och jämförelse med normgrupp; automatisk återkoppling (rad 80, 158): https://assessio.com/personality-map/
- MAP Essence bygger på ett urval av MAP-frågorna, mäter extroversion, social stil, samvetsgrannhet, stabilitet, öppenhet, används tidigt, för butikspersonal, lager, säljare, montörer, produktion; algoritmer för integritet och serviceförmåga; serviceförmåga jämförs med normgruppen; alla kandidater får en återkopplingsrapport på de fem faktorerna (rad 22, 99, 109, 114, 120, 158): https://assessio.com/screening/
- "There is no advantage in being dishonest or thinking too much about how you might be expected to answer" (rad 16, 142): Assessio-artikeln ovan. Svara utifrån hur du är i arbetsrelaterade situationer (rad 150): https://assessio.com/candidates-students/
- Resultat kan inte delas mellan företag av GDPR-skäl (rad 20, 160): https://assessio.com/candidates-students/
- Matrigma adaptiv, 12 minuter, svårare fråga efter rätt svar; 40-minutersversionen används mer sällan (rad 162): https://assessio.com/candidates-students/
- Produkt: personlighetsprovet utan konto har 20 påståenden, grundtestet 50 (rad 170): src/lib/personlighet/smakprov-pastaenden.ts, src/app/dashboard/tester/testConfig.ts.
- Påståendeexemplen (rad 124–134) är märkta som egna och inte Assessios. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 14, 22, 104, 201, 217 MAP Essence "tolv minuter": rättat till "55 påståenden, oftast under tio minuter" på alla fem ställena (FAQ i frontmatter och brödtext lika, tabellcellen "Tid").
- Rad 80 "18 språk": rättat till "18 språkversioner, svenska inräknad".
- Rad 35 egenskapslistan med "drivkraft": omskrivet till "Assessio beskriver MAP som ett test av arbetsrelaterad personlighet." utan listan.
- Rad 31, 70–72 "Social stil (vänlighet)": MAP-tabellens femte faktor ändrad till "Vänlighet (agreeableness)", snabbsvaret ändrat till "... extraversion och vänlighet", och påståendeexemplen märkta "**Vänlighet:**" i stället för "**Social stil:**". "Social stil" står kvar bara i MAP Essence-svaret.
- Rad 191 död länk (produktblad MAP Essence): bytt mot Assessios hjälpcenter för MAP Essence (https://helpcenter2.assessio.com/map-essence); screeningsidan stod redan i källraden. Rad 120 "Enligt Assessios produktblad ... agera regelmedvetet" omskrivet till "Enligt Assessio ... integritetsfaktorn mäter förmågan att följa regler och bedömer risken för skadligt beteende på jobbet" (screeningsidan).
- Rad 170 produkt: rättat till "... med femtio påståenden, och i Premium ett fördjupat med etthundratjugo".
- updated: "2026-11-15" tillagt. Ingen H2/H3, FAQ-fråga, title eller description ändrad. Bilden berördes inte (underlagets rader "200 påståenden", "Utan tidsgräns" oförändrade). Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 121: "Enligt Assessio visar serviceförmågan hur servicebenägen du är jämfört med normgruppen, och integritetsfaktorn mäter förmågan att följa regler och bedömer risken för skadligt beteende på jobbet." Problem: integritetsdelen kommer från Assessios produktblad om MAP Essence, som ger 404 (både svensk och engelsk version, kontrollerat 2026-11-15; kopian hos hfmtalentindex.com omdirigeras till assessio.com). Ingen av sidorna i källraden säger det: screeningsidan skriver "one algorithm measures the integrity factor and can describe how cooperative, stress-resistant and accurate the candidate is", och hjälpcentrets MAP Essence-sida nämner inte integritet alls. Krävs: skriv om enligt screeningsidan, till exempel "integritetsfaktorn kan enligt Assessio beskriva hur samarbetsvillig, stresstålig och noggrann du är", källa https://assessio.com/screening/ .

Övrigt kontrollerat och OK: MAP Essence "55 items ... typically takes less than 10 minutes" (helpcenter2.assessio.com/map-essence), 18 språkversioner (assessio.com/personality-map), femte skalan Agreeableness, Premium-uppgiften om det fördjupade testet. FAQ i frontmatter och FAQ-block lika.

## Svar till samordnaren
map-test-personlighetstest, UNDERKÄND, rad 121 tillskriver Assessio en integritetsdefinition (följa regler, skadligt beteende) som bara fanns i ett dött produktblad; skriv enligt screeningsidan (samarbetsvillig, stresstålig, noggrann).

## Rättning omgång 2 (2026-11-15)
- Rad 121, integritetsfaktorn: kontrollerat assessio.com/screening/ själv (rå HTML, 2026-11-15). Sidan innehåller ordagrant både "Serviceability shows how service-oriented a candidate is compared to the norm group. The integrity factor measures the person's ability to act in accordance with the rules and assesses the risk of harmful behavior at work." och "one algorithm measures the integrity factor and can describe how cooperative, stress-resistant and accurate the candidate is" (andra granskningen såg bara den senare). Den ursprungliga definitionen är alltså belagd av en sida som redan står i källraden. Skrev om tillskrivningen till "Enligt Assessios sida om screening med MAP Essence", "följa regler" till "agera enligt reglerna" (närmare källan) och lade till granskarens mening: "Samma algoritm kan också beskriva hur samarbetsvillig, stresstålig och noggrann du är."
- Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden citerar inte raden; bilden inte omgjord. Inga interna länkar borttagna. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND. Kontrollerat assessio.com/screening/ (rå HTML, 2026-11-15): sidan har både "Serviceability shows how service-oriented a candidate is compared to the norm group. The integrity factor measures the person's ability to act in accordance with the rules and assesses the risk of harmful behavior at work." och "one algorithm measures the integrity factor and can describe how cooperative, stress-resistant and accurate the candidate is". Rad 121 återger båda korrekt, och sidan står i källraden (rad 192). FAQ lika. Inga talstreck.
