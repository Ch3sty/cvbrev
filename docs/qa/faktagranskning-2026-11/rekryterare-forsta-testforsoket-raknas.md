# Faktagranskning: content/rekryterare/forsta-testforsoket-raknas.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK med en liten rättning. Båda metaanalyserna och produktpåståendena håller, men FAQ:n och beskrivningen generaliserar Scharfens siffra till "metaanalyserna".

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 11, 5 | "Metaanalyserna är samstämmiga: i genomsnitt ungefär en tredjedels standardavvikelse" (FAQ) samt "en tredjedels standardavvikelse" i description | fel (mindre) | Hausknecht 2007 fick d = .26, alltså ungefär en fjärdedel, mellan första och andra försöket. Scharfen 2018 fick en tredjedel. Brödtexten säger detta rätt, men FAQ:n och beskrivningen gör en tredjedel till en gemensam slutsats. Skriv "mellan en fjärdedel och en tredjedel av en standardavvikelse, enligt två metaanalyser". | Hausknecht m.fl. 2007, JAP 92(2):373–385, https://pubmed.ncbi.nlm.nih.gov/17371085/; Scharfen m.fl. 2018, Intelligence 67:44–66 |

## Belagda påståenden
- Hausknecht m.fl. 2007: 107 urval, 134 436 deltagare och justerad effekt .26. Effekten var större med coachning och identiska testversioner, och ytterligare omtag gav fortsatta höjningar (ungefär .51 från första till tredje försöket). Källa: PubMed-abstract och sekundär återgivning av tabellerna (ResearchGate, ecommons.cornell.edu).
- Scharfen, Peters & Holling 2018: en tredjedels SD, ungefär 5 IQ-poäng, till andra försöket och en halv SD till tredje, med platå efter tredje. Källa: Intelligence 67 (sammanfattning via Semantic Scholar och ResearchGate, eftersom ScienceDirect gav 403).
- Percentil 50 + 0,33 SD ≈ percentil 63, och + 0,5 SD ≈ percentil 69. Beräkningen stämmer.
- Validitet 0,31 för kognitiv förmåga. Källa: Sackett m.fl. 2022, JAP.
- Produkt: första slutförda försöket räknas ("aldrig best-of-N"), och antalet försök redovisas för rekryteraren (`attempts`). Källa: src/lib/recruiter/candidateData.ts rad 363–370, 962–972 och 207–208.

## Rättning (omgång 1, 2026-11-15)
- Rad 11 (FAQ, fel mindre): "Metaanalyserna är samstämmiga: i genomsnitt ungefär en tredjedels standardavvikelse" rättat till "Två metaanalyser pekar åt samma håll: mellan en fjärdedel och en tredjedel av en standardavvikelse ... (den nyare analysen anger en tredjedel, motsvarande cirka 5 IQ-poäng)". Brödtexten var redan rätt och är orörd.
- Rad 5 (description, fel mindre): ändrad.
  - Före: "Omtag höjer testpoäng en tredjedels standardavvikelse utan att förmågan ändrats. Forskningen bakom, och varför verifierade förstagångsresultat bör vara krav."
  - Efter: "Omtag höjer testpoäng en fjärdedel till en tredjedel standardavvikelse utan att förmågan ändrats. Forskningen bakom, och varför första försöket ska räknas." (155 tecken)
- `updated: "2026-11-15"` tillagd. Inga rubriker eller FAQ-frågor ändrade. Ingen bild. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. FAQ och description stämmer nu med brödtexten och med båda metaanalyserna (Hausknecht m.fl. 2007 d ≈ .26 till andra försöket, Scharfen m.fl. 2018 ungefär en tredjedel, cirka 5 IQ-poäng). Ingen motsägelse mellan description, frontmatter-FAQ och brödtext. Produktuppgifterna stämmer: första slutförda försöket räknas (firstCompleted, candidateData.ts rad 363–370) och antalet försök syns för rekryteraren i profilen (attempts, ProfileSections.tsx rad 387). Description 155 tecken. Inga tankstreck i ändrade rader.

Anmärkningar, ej underkännande: (1) Description rad 6 läses bättre som "en fjärdedels till en tredjedels standardavvikelse". (2) Rad 59 och slutstycket förutsätter att normgruppen består av förstagångsresultat. Vår percentil räknas mot alla slutförda sessioner på samma testtyp, omtag inräknade (createPercentileContext i candidateData.ts). Det är inte fel i artikeln, men samordnaren bör veta det inför formuleringen "förutsättningen för att percentilerna ni ser ska betyda det psykometrin lovar".

## Svar till samordnaren
forsta-testforsoket-raknas, GODKÄND, inga brister.

## Rättning omgång 2 (2026-11-15)
Artikeln var GODKÄND; ändrad på samordnarens uppdrag efter anmärkning (2) om normgruppen.
- Frontmatter-FAQ "Varför är omtag ett problem om alla kan göra dem?": "Percentiler räknas mot normgrupper som består av förstagångsresultat: ..." ersatt med att percentilen ska visa var förmågan ligger i normgruppen och att ett omtag bär en övningseffekt som förstagångsresultaten i gruppen saknar. Frågan oförändrad. (Artikeln har inget FAQ-block i brödtexten.)
- Rad 43 (Normjämförelsen): påståendet att normgrupper består av förstagångsresultat är nu villkorat ("bygger normgruppen på förstagångsresultat jämförs ett övat försök med en oövad grupp"). Länken till percentiler-och-normgrupper kvar.
- Slutstycket: lagt till vår normgrupp (alla slutförda försök på samma test och nivå, omtag inräknade, percentil först vid minst 25 försök, därför snarare försiktig än uppblåst för ett förstagångsresultat), kontrollerat mot createPercentileContext i candidateData.ts och MIN_PERCENTILE_SAMPLE = 25. "förutsättningen för att percentilerna ni ser ska betyda det psykometrin lovar" ändrat till "... ska spegla förmåga och inte övning".
- Ingen rubrik, FAQ-fråga eller description ändrad. Ingen bild berörd.

## Tredje kontrollen (2026-11-15)
GODKÄND. Inga brister.
- Frontmatter-FAQ "Varför är omtag ett problem...": påstår inte längre att normgrupper består av förstagångsresultat; resonemanget håller och motsäger inte slutstycket.
- Rad 43: villkorat ("bygger normgruppen på förstagångsresultat"), säger inte mer än tidigare belagt.
- Rad 64: "alla slutförda försök på samma test och nivå hos oss, omtag inräknade" och "minst 25 försök" stämmer med koden: createPercentileContext räknar slutförda sessioner i logic_test_v4_sessions per test_type (nivån ingår i testtypen, t.ex. matrislogik-avancerad) och bankversion, golv MIN_PERCENTILE_SAMPLE = 25 (src/lib/recruiter/candidateData.ts, src/lib/logicTestV7/percentilUnderlag.ts). Slutsatsen "snarare försiktig än uppblåst" följer logiskt.
- Inga tankstreck i ändrade rader; inget FAQ-block i brödtexten.
- Anmärkning, ej underkännande (oförändrad text): "kandidaten övar fritt på övningsuppgifter före" kan läsas som gratis och obegränsat, medan gratisnivån enligt produktfacit är en nivåmätning och ett träningspass samma dag. Överväg "kandidaten kan öva före".

## Rättning omgång 3 (samordnaren, 2026-11-15)
Efter tredje kontrollens anmärkning: "övar fritt" blev "kan öva", så att det inte läses som obegränsad gratisövning.
