# Faktagranskning: content/rekryterare/percentiler-och-normgrupper.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Psykometrin stämmer, men stycket om vår egen kandidatpool beskriver principer som rekryterarsidan inte följer.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 68 | "jämförelser i grova nivåer snarare än utslagsgivande decimaler, och aldrig som ensamt sorteringsverktyg" | fel (produkt) | Rekryterarsidan visar exakta percentiler ("Matrislogik · Expertnivå · topp 8 %", ibland med "av N"). Den har sorteringen `testScore`, som rangordnar hela listan på bästa percentil, och ett filter för lägsta percentil. Det strider mot artikelns egna regler 3 och 4 (tänk i band, respektera spannet). Antingen skrivs meningen om till det som stämmer ("verifierade förstagångsresultat, antal försök synligt") eller så ändras produkten till band, till exempel stanine. | src/lib/recruiter/poolSearch.ts rad 31, 43, 146–173, 206–213; src/lib/recruiter/candidateData.ts rad 355–360; src/app/rekryterare/components/PercentileDots.tsx rad 57 |
| 72 | Källan "Hogrefes termlexikon (normering, stanine, reliabilitet)" | obelagt (delvis) | Sidan finns och definierar stanine (nio skalsteg, femte steget är medelvärdet), men den har ingen definition av percentil. Det går bra att behålla källan för stanine, men percentildefinitionen behöver en annan källa. | https://hogrefe.se/info/termlexikon/ |

## Belagda påståenden
- Stanine har nio band, 5 är mitten och varje steg är en halv standardavvikelse. Stanine 6 motsvarar percentil 60–77 (kumulativt 40/60/77). Källa: Hogrefes termlexikon och standardfördelningen 4-7-12-17-20-17-12-7-4 %.
- Reliabilitet 0,90 ger ett 95-procentigt intervall på tiotals percentilenheter. Beräkning: SEM = 0,32 SD och ±1,96 SEM ≈ ±0,62 SD, vilket kring medianen ger ungefär percentil 27–73. Påståendet stämmer.
- Percentil 68 och 74 skiljer sig med cirka 0,17 SD, vilket ligger inom ett mätfel. Beräkningen stämmer.
- Normgruppen ska spegla arbetsplatsen och vara aktuell och stor. Master rekommenderar normer under 10 år med minst 1 000 svar. Källa: https://www.master.se/insikter/sa-valjer-du-ratt-norm/
- Sackett, Zhang, Berry & Lievens 2022 (Journal of Applied Psychology, doi 10.1037/apl0000994) finns. Sidan kunde inte renderas, men referensen är korrekt.
- Produkten räknar första försöket som det verifierade resultatet. Källa: src/lib/recruiter/candidateData.ts, `firstCompleted`.

## Rättning (omgång 1, 2026-11-15)
- Rad 68 (fel, produkt): stycket om kandidatpoolen skrivet om efter koden enligt samordnarens beslut: första slutförda försöket räknas, resultatet visas med nivå och percentil ("Matrislogik · Expertnivå · topp 8 %"), listan går att sortera och filtrera på percentil. Påståendet om "grova nivåer" och "aldrig som ensamt sorteringsverktyg" är borta; i stället står rådet att använda percentilen som lågt golv eller band och aldrig låta sorteringen ensam avgöra.
- Rad 72 (obelagt delvis): Hogrefe behållen för normering/stanine/reliabilitet. Ny källa för percentildefinitionen tillagd i källraden: Wikipedia, Percentile rank ("the percentage of scores in its frequency distribution that are less than that score"), kontrollerad 2026-11-15.
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Ingen bild. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 73, källraden: "[Wikipedia om percentilrang (Percentile rank)](https://en.wikipedia.org/wiki/Percentile_rank)". Problem: Wikipedia används som källa för percentildefinitionen fast en förstahandskälla från en testutgivare finns. Krävs: byt till ETS Glossary of Standardized Testing Terms, posten "Percentile score (percentile rank)": "the percent of the group with scores no higher than the test taker's score ... compute the percentage of the group with lower scores, plus half the percentage with exactly the same score" (https://archives.marylandpublicschools.org/commissiononassessments/docs/ETSGlossaryStandardizedTestingTerms.pdf). Samma ordlista bär också "Comparisons of percentile scores are meaningful only if those percentile scores refer to the same group of test takers", som stöder artikelns normgruppsresonemang.

Kontrollerat utan anmärkning: produktstycket på rad 69 stämmer med koden (första slutförda försöket via firstCompleted, etiketten "Matrislogik · Expertnivå · topp 8 %" i badgeLabel, sortering testScore och filtret minPercentile i poolSearch.ts, radio-stegen Topp 50/25/10 % i FilterPanel.tsx). Inga tankstreck i ändrade rader.

Anmärkning, ej underkännande: artikeln säger på rad 59 att normgruppen består av förstagångsresultat, och rad 69 säger att checklistan "gäller fullt ut även hos oss". I koden räknas percentilen mot alla slutförda sessioner av samma testtyp på plattformen, omtag inräknade, med golv på 25 sessioner (createPercentileContext i candidateData.ts, MIN_PERCENTILE_SAMPLE = 25). Det gör vår percentil snarare försiktig än uppblåst, men den som följer checklistans punkt 1 hittar inte vår normgrupp i texten. Överväg en mening om vad vi jämför mot.

## Svar till samordnaren
percentiler-och-normgrupper, UNDERKÄND, Wikipedia som källa för percentildefinitionen ska bytas mot ETS Glossary of Standardized Testing Terms (posten Percentile score).

## Rättning omgång 2 (2026-11-15)
- Källraden: Wikipedia om percentilrang bytt mot [ETS Glossary of Standardized Testing Terms, posten Percentile score](https://archives.marylandpublicschools.org/commissiononassessments/docs/ETSGlossaryStandardizedTestingTerms.pdf). Kontrollerat i PDF:en: "the percent of the group with scores no higher than the test taker's score ... compute the percentage of the group with lower scores, plus half the percentage with exactly the same score" och "Comparisons of percentile scores are meaningful only if those percentile scores refer to the same group of test takers tested on the same test". Posten bär också att skillnader i mitten är mindre än i svansarna (90 mot 95 kontra 45 mot 55).
- Anmärkningen om normgruppen (samordnarens uppdrag): rad 59 påstår inte längre att normgruppen består av förstagångsresultat. Nu: percentilen förutsätter att kandidatens resultat är jämförbart med normgruppens; fråga om normgruppen bygger på förstagångsresultat, och gör den det jämför ett omtag ett övat resultat med en oövad grupp. Länken till forsta-testforsoket-raknas står kvar. Produktstycket (rad 69) har fått en mening om vår normgrupp: alla slutförda försök på samma test och nivå hos oss, omtag inräknade, ingen percentil under 25 försök, och att percentilen för ett förstagångsresultat därför blir snarare försiktig än uppblåst. Kontrollerat mot createPercentileContext (candidateData.ts, räknar logic_test_v4_sessions per test_type, test_type innehåller nivån), percentileFrom och MIN_PERCENTILE_SAMPLE = 25 (strengthConstants.ts).
- Ingen rubrik, FAQ-fråga eller description ändrad. Ingen bild berörd (rekryterarartikel).

## Produktsvep (2026-11-15)
- Stycket om vår kandidatpool: tillagt att andelen rätt visas (t.ex. "72 % rätt") när underlaget är under 25; "sortera och filtrera på percentil" blev "på testresultat".
- Inga rubriker, FAQ-frågor eller description ändrade.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Bristen från andra granskningen är åtgärdad: källraden (rad 73) anger ETS Glossary of Standardized Testing Terms, posten Percentile score, och Wikipedia är borta.
- Rad 59 (omskriven): artikeln påstår inte längre att normgruppen består av förstagångsresultat. Uppmaningen att fråga leverantören och påståendet om övade omtag är förankrade i länkade forsta-testforsoket-raknas.
- Rad 69 (omgång 2 och produktsvep) kontrollerad mot koden och facit. Första slutförda försöket räknas (firstCompleted). Percentilen räknas mot alla slutförda sessioner av samma test_type, omtag inräknade, och visas inte under 25 (createPercentileContext, MIN_PERCENTILE_SAMPLE). Etiketten är "Matrislogik · Expertnivå · topp 8 %", och annars "X % rätt" (badgeLabel). Listan går att sortera och filtrera på testresultat. Allt stämmer med facit.
- Anmärkning, ej underkännande: för matrislogik begränsas jämförelsegruppen dessutom till samma frågebanksversion med blandade svarsalternativ (percentilUnderlag/begransaTillUnderlag i src/lib/logicTestV7/percentilUnderlag.ts). "alla slutförda försök på samma test och nivå" kan därför läsas som något bredare än koden, men det är en förenkling och inget sakfel, eftersom samma bankversion är samma test.
- Snabbkontroll: inga tankstreck i tillagda rader. FAQ-svaren berörs inte av rättningarna och motsäger inte produktstycket.
