# Gap-analys: testtyper vi saknar mot svensk rekrytering

Testansvarig, 2026-11-09. Underlag: koden i `src/lib/*Test*`, `src/lib/logicTestV7`, `figurserierV1`, `deduktivV1`, `src/app/dashboard/tester/testConfig.ts`, Search Console 2026-10-12 till 2026-11-06 (26 dagar, P2 i analysen 2026-11-08) och webbkällor i avsnitt 8. Ingen kod är ändrad.

## 1. Svaret till ägaren

Rotation, spegling och överlagring finns i matrisbanken. Regelfamiljerna i `src/lib/logicTestV7/familjer.json` är elva stycken och fyra av dem är just "figuren vrider sig", "hela mönstret vrider sig", "figuren speglas" och "två rutor läggs ihop" (union, snitt och skillnad). Granskningsraden gällde artiklarnas inbäddade exempel, som är statiska bilder i MDX och aldrig har haft de reglerna. Det är ett innehållsproblem i artiklarna, inte en lucka i testerna.

Den bredare frågan har ett annat svar. Vi täcker det som är vanligast på svensk arbetsmarknad (matriser, figurserier, deduktivt, verbalt, numeriskt, Big Five). Det vi saknar helt är spatial förmåga, talserier, koncentration och mekanisk förståelse. Av dem har bara spatial förmåga mätbar efterfrågan hos oss, och den är dessutom halva I-prov 2025 som både Försvarsmakten och Polisen använder sedan maj 2025. Spatial är luckan värd att täppa till. Mekanisk förståelse och situationsbedömning är det inte.

## 2. Vad vi har i dag

Alla rader är live för användare om inget annat sägs. Grundnivån är fri, nivåerna över kräver `tests_above_base`, provläget `test_exam_mode`.

| Testtyp | Nivåer (frågor per test) | Bank i dag | Pass | Nivåkoll | Övningsprov | Publikt smakprov |
|---|---|---|---|---|---|---|
| Matrislogik | grund, avancerad, expert (15), prov (18, 25 min) | 112 / 104 / 99 valbara, elva regelfamiljer | Dagens pass, riktade pass | Ja (enda testet med Nivåkoll) | Ja, format per leverantör (Matrigma, Alva, SHL, Aon, eget) | 5 frågor anonymt på `/verktyg/rekryteringstester/prova` |
| Figurserier | grund, avancerad, expert (15) | 36 / 30 / 32 plus "bryter mönstret" 16 / 16 och parti 2 | Figurpasset | Nej | Ja, `ovningsprov/figurer` (Aon-tempo) | Nej |
| Deduktivt | grund, avancerad, expert (12, 15 min) | 30 / 30 / 20 | Nej | Nej | Nej | Nej |
| Verbalt | grund, avancerad (40), expert (32), prov (48, 40 min) | 24 texter grund, 24 avancerad, 12 expert, plus parti 02 till 04 | Textpasset, riktade pass per påståendetyp | Nej | Ja | Nej |
| Numeriskt | grund, avancerad, expert (20), prov (36, 40 min) | 12 underlag per nivå plus parti 02 och 03 | Sifferpasset, riktade pass per misstagstyp | Nej | Ja | Nej |
| Personlighet | grund (50), fördjupad (120), Big Five | Egna sidor, ingen poäng | Nej (ska inte ha) | Nej | Nej | 21 påståenden i två artiklar (Personlighetsprov) |
| Intervjuprovet | Skriftligt svar bedöms av Gemini, nivå 1 till 3 | `src/lib/intervju`, `anon_interview_samples` | Nej | Nej | Nej | Inbäddat i två artiklar, hämtas till kontot vid registrering |
| Uppvärmning | Lösa matrisfrågor med regelförklaring | Läser matrisbanken | Egen sida | Nej | Nej | Nej |

Luckor inom det vi har: deduktivt saknar pass och övningsprov, figurserier saknar Nivåkoll, verbalt, numeriskt och figurserier saknar publikt smakprov. Minnesfilerna stämmer med koden på alla punkter jag kontrollerade, med ett undantag: antalet valbara matrisfrågor har växt från 110/95/95 (2026-10-12) till 112/104/99.

## 3. Vad svenska arbetsgivare och leverantörer använder

Hur vanligt: TRR-mätningen (via Ingenjören 2025-11-12) säger att andelen jobbsökande som fått göra test gick från 58 procent 2019 till 67 procent 2022. Chef.se:s "sju av tio företag" är en cut-e-undersökning från 2011 och ska inte citeras som färsk.

| Leverantör | Testtyper | Hur vanlig i Sverige, roller | Vi har |
|---|---|---|---|
| Assessio | Matrigma (klassisk 35 uppgifter 40 min, adaptiv 12 min), MAP (Big Five, 200 påståenden) | Beskrivs av flera källor som det vanligaste enskilda testet i Sverige. Volvo, IKEA, Scania, Tele2, offentlig sektor, Svevias traineeprogram 2026 använder MAP plus Matrigma | Ja (matris, personlighet). Assessios egna sidor nämner i dag bara Matrigma och MAP, jag hittar inget belägg för separata verbala och numeriska test från Assessio |
| Alva Labs | Logiktest (matriser, 20 uppgifter, adaptivt) och personlighetstest (Big Five, 120 påståenden) | Mycket vanligt i tech, startups och tjänsteföretag. Vår mest klickade testartikel | Ja |
| SHL Verify | Inductive (figurer), Deductive, Numerical, Verbal, G+ (blandat), Checking, Mechanical, OPQ, SJT | Internationella koncerner och konsultbolag. SHL:s svenska exempelsida visar bara induktivt, verbalt, numeriskt, personlighet och motivation. Checking, Mechanical och SJT finns inte på svenska där | Ja för induktivt, deduktivt, numeriskt, verbalt. Nej för Checking, Mechanical, SJT |
| Aon (cut-e) scales | numerical, verbal, ix/clx/cls (induktivt), lst/sx och switchChallenge/gapChallenge (deduktivt), e3+ (koncentration), MTU (mekanisk), NDB/NAV (orientering), BLO (minne) | Lokförarskolorna (TCC, ProTrain, Trafikverksskolan, MTR) kör till stor del Aon, cirka 5 000 sökande per år varav bara 750 blev behöriga 2023. Piloter, tekniska roller | Ja för numerisk, verbal, induktiv, deduktiv. Nej för koncentration, mekanisk, orientering, minne |
| Talent Q / Korn Ferry | Elements (verbalt, numeriskt, logiskt, adaptivt), Dimensions (personlighet) | Finns i Sverige men lågt i våra sökdata, inga egna frågor | Ja i format |
| Clevry (f.d. Psycruit) | Abstrakt, numeriskt, verbalt, mekanisk-teknisk | Svensk leverantör mot bemanning och industri | Nej för mekanisk |
| Hogrefe | NEO-PI-3 (Big Five), kliniska test | Personlighet i rekrytering och ledarutveckling | Big Five ja |
| Psykologifabriken | Säljer i dag Habitud (psykologisk träning), inga rekryteringstest på sajten | Ingen relevans för oss | |
| Försvarsmakten, Plikt- och prövningsverket | I-prov 2025: synonymer, motsatsord, pappersvikning, pappersvikning med klipp, tärningar, talserier. 70 min. Tekniskt förståelseprov är borttaget | Alla som mönstrar | Nej för spatial och talserier, delvis för verbalt (vi har läsförståelse, inte ordförråd) |
| Polisen | Samma I-prov 2025 sedan 5 maj 2025, krav minst 4 på niogradig skala, plus personlighetstest. Riksrevisionen 2025:13: 57 till 83 procent godkända beroende på grupp, stora kullar | Flera tusen prövande per år | Nej för spatial och talserier |
| Trainee och tekniska roller | Matrigma plus MAP (Svevia), logik plus personlighet (3Talent), programmeringstest (Ericsson). Spatial och mekanisk förståelse mest i industri, pilot, lokförare | | Ja för logik och personlighet |

Situationsbedömning (SJT) förekommer i kundtjänst, handläggning och chefsroller men är arbetsgivarspecifikt och saknar ett svenskt standardformat att öva mot.

## 4. Konkurrerande övningstjänster

| Tjänst | Testtyper | Pris |
|---|---|---|
| logiktester.se | Matrigma, Alva, SHL G+, Aon, I-provet, talserier, ordförståelse, numeriskt, verbalt, arbetsminne, Big Five, PDF-certifikat | Helt gratis, inget konto |
| Neurobics | Matriser, rumsuppfattning (kubrotation, 12 uppgifter), Stroop, arbetsminne, ordförståelse, läshastighet, yrkesguider för polis, mönstring, pilot, lokförare | Gratis med 3 test per dag, sedan reklam eller app |
| JobTestPrep.se | Matrigma, Alva, Fairsight, Aon scales, I-prov 2025 (synonymer, talserier, pappersvikning), spatial (6 format: pussel, spegelbild, perspektiv, 3D-rotation, kuber, byggnader), mekanisk, lokförare (e3+, NAV, gridChallenge), polis, SJT | Betalpaket vecka, månad, premium, priser bara i kassan. Enstaka gratisexempel |
| Test The Talent (testttalent.se) | Matrigma, SHL, Alva, numeriskt, UNIQ och NEO-PI-R för polis | Betalpaket |
| AssessmentDay (UK) | Numeriskt, verbalt, induktivt, spatialt, mekaniskt, error checking, SJT | Gratis prov, betalpaket |
| 123test (NL) | IQ, DISC, Jung, Big Five, karriärtest, numeriskt, verbalt | Mest gratis, 10 prep-paket 47,99 USD |
| testdag.se | Domänen svarar inte (DNS), ingen träff i sök. Troligen nedlagd eller fel namn | Okänt |

Ingen svensk aktör har talserier och spatial i samma produkt som matriser med progression, pass och provdatum. JobTestPrep har bredden men på engelska formatmallar och utan träning över tid.

## 5. Gap-analys

Sökdata är våra egna visningar i Search Console under 26 dagar, inte marknadsvolym. Vi saknar ett sökordsverktyg.

| Testtyp | Används i Sverige | Vi har | Vad saknas | Våra sökdata (26 dagar) |
|---|---|---|---|---|
| Matrislogik | Ja, vanligast | Ja | Smakprov för fler typer, "alva logiktest" med 125 visningar har 3 klick | "alva logiktest" 125, "logiktest" 59, "matrigma test öva" 32 |
| Figurserier (induktivt) | Ja, Aon och SHL | Ja | Nivåkoll | "induktiv slutledningsförmåga" cirka 30 fördelat på varianter |
| Deduktivt | Ja, Aon och SHL | Delvis | Pass och övningsprov | "deduktiv slutledningsförmåga" cirka 100 fördelat på varianter, 1 klick |
| Verbalt (läsförståelse) | Ja, SHL, Aon, Clevry | Ja | | "verbalt" 28, "verbalt resonemang" 19 |
| Verbalt (ordförråd: synonymer, motsatsord) | Ja, I-prov 2025 | Nej | Två nya deltest i I-prov-format | Inga egna frågor än |
| Numeriskt (tabeller) | Ja, SHL, Aon, Clevry | Ja | | "numeriskt test" 38, "numeriska tester gratis" 21 |
| Talserier | Ja, I-prov 2025, UNIQ tidigare, Aon | Nej | Generator plus ritare för talföljd | Inga egna frågor än, logiktester.se har det gratis |
| Spatial (rotation mot spegling, kubrotation, pappersvikning) | Ja, I-prov 2025 (två av sex deltest), Polisen, pilot, lokförare, tekniska roller | Nej, bara en artikel som lovar testet | Hela testet | "spatial förmåga" 126 visningar pos 8,6 och 0 klick, "hög spatial förmåga" 21, "vad är spatial förmåga" 10, "rotationstest" 5 |
| Koncentration och noggrannhet (Aon e3+, SHL Checking) | Ja för lokförare, pilot, kundtjänst, driftcentraler | Nej | Tidsatt signal- och avvikelsemodul, annan mekanik än frågebank | "lokförare test gratis" 5, inga sök på uppmärksamhet eller koncentration |
| Mekanisk förståelse (Aon MTU, Clevry, SHL Mechanical) | Begränsat, industri och tekniker. Borttaget ur I-prov 2025. Ej på SHL:s svenska sida | Nej | Illustrerade fysikuppgifter | Inga sök alls |
| Situationsbedömning (SJT) | Delvis, arbetsgivarspecifikt | Nej | Saknar standard och facit | "situationsbaserade intervjufrågor" 40, men det är intervjufrågor |
| Arbetsminne, reaktionstid | Pilot, lokförare | Nej | | Inga sök, Neurobics och logiktester.se har det gratis |
| Personlighet Big Five | Ja, MAP, Alva, NEO | Ja | | "map test" 158 med 6 klick, "personlighetstest rekrytering" 111 |

## 6. Rekommendation i prioritetsordning

1. **Spatial förmåga, bygg (M).** Tre uppgiftstyper: roterad eller spegelvänd figur i 2D, pappersvikning med hål (I-prov 2025), kubrotation i 3D. De två första går att rita med V7:s befintliga primitiver (3×3-block, pil, månghörning, rutnät) och spärrarna G1 till G12 mäter redan riktig SVG. Kubrotation kräver en ny isometrisk ritare, det är M-delen. Motiv: enda luckan med egen efterfrågan (160 visningar på pos 8,6 utan en enda klick, för att vi inte har produkten), två av sex deltest i I-prov 2025 för mönstring och polis, JobTestPrep och Neurobics tar betalt för det, och vår artikel lovar det redan. Konvertering: den som ska göra I-provet eller ett tekniskt urval köper månaden för att öva på just det. Smakprov i rotation-test-guide direkt när banken finns.
2. **Talserier, bygg (S).** Ren generator (aritmetisk, geometrisk, växelvis, två varvade serier, andra ordningens differens) med deterministiskt facit och near-miss-distraktorer. Ingen ritare. Motiv: deltest i I-prov 2025, klassiskt i UNIQ och Aon, logiktester.se har det gratis så vi måste ha det för att vara kompletta mot polis och mönstring. Tillsammans med punkt 1 och ett ordförrådstest (synonymer, motsatsord, S) kan vi erbjuda ett komplett I-prov-övningsprov, vilket ingen svensk aktör gör med progression.
3. **Gör färdigt deduktivt (S till M).** Pass i samma form som textpasset (en uppgift, regel efter svar) och övningsprov med SHL Deductive-tempo. Banken finns (80 uppgifter), motorn finns för de andra typerna. Motiv: Aon och SHL är de två leverantörer som använder deduktivt och cirka 100 visningar i månaden landar redan på logiska-tester utan att vi har en sida att skicka till.
4. **Koncentration och noggrannhet, bygg bara som yrkesmodul (M).** En tidsatt modul där användaren markerar avvikelser mot en regel, i samma format som Aon e3+ och SHL Checking. Noggrannhet låg redan i omgång 4-backloggen. Motiv: lokförare är ett tydligt betalande segment (5 000 sökande, 85 procent underkända) men våra sökdata visar fem visningar. Bygg efter att spatial mätts i sex veckor, och bara om vi vill ha ett lokförar- eller pilotpaket.
5. **Nivåkoll för figurserier och smakprov för verbalt och numeriskt (S).** Ingen ny testtyp, men det är billigaste sättet att få fler från artikel till konto.

**Inte värt att bygga nu:** mekanisk förståelse (L, varje uppgift är en handritad fysikillustration, noll sök, borttaget ur I-prov 2025, saknas på SHL:s svenska sida), situationsbedömning (arbetsgivarspecifikt, inget facit att förklara, bättre som artikel), arbetsminne och reaktionstid (gratis hos Neurobics och logiktester.se, ingen rekryteringsstandard utanför pilot och lokförare), MBTI och DISC (inte Big Five, används inte seriöst i svenskt urval).

## 7. Rätta direkt

`content/artiklar/rotation-test-guide.mdx` säger på fyra ställen (FAQ rad 19, rad 91, 169, 197) att vårt verktyg har rotationstest att öva på gratis under tidspress. Det stämmer inte. Antingen byggs punkt 1 inom kort, eller så skrivs påståendena om till vad som finns. Sidan har pos 8,6 på "spatial förmåga" och noll klick, så ett brutet löfte där kostar förtroende hos just de besökare vi vill ha.

## 8. Källor

- Kod: `src/app/dashboard/tester/testConfig.ts`, `src/app/dashboard/tester/ovningsprov/[typ]/page.tsx`, `src/lib/tester/pass-typer.ts`, `src/lib/tester/pass-figur.ts`, `src/lib/logicTestV7/familjer.json`, `src/lib/figurserierV1/familjer.json`, `src/lib/deduktivV1/status.ts`, `src/app/api/public/test-session/route.ts`, `src/components/artiklar/intervjuprov`, `src/lib/personlighet/smakprov-pastaenden.ts`
- Search Console: `scratchpad/analys-2026-11-08/gsc/raw.json` (queryP2, 2026-10-12 till 2026-11-06)
- Ingenjören 2025-11-12, företagens rekryteringstest: https://ingenjoren.se/2025/11/12/foretagens-rekryteringstest-det-vinner-du-pa-att-ova/
- Chef.se, sju av tio (cut-e 2011): https://chef.se/artiklar/psykologiska-tester-allt-vanligare/
- Assessio Matrigma: https://assessio.com/aptitude/ och https://www.practiceaptitudetests.com/testing-publishers/matrigma/
- Alva Labs: https://www.alvalabs.io/psychometrics
- SHL svenska exempelfrågor: https://www.shl.com/shldirect/se/example-questions/
- SHL Verify G+ faktablad: https://www.shl.com/assets/documents/product-factsheet-verify-g-plus.pdf
- Aon scales e3+, MTU, NDB: https://www.aon-assessment-solutions.com/nc/details/scales-ndb-spatial-orientation/ och https://www.jobtestprep.co.uk/aon-assessment
- I-prov 2025, taktisk.se: https://www.taktisk.se/2026/07/17/i-prov-2025-det-linjara-provet/
- Polistidningen om I-prov 2025 från 5 maj 2025: https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/
- Riksrevisionen 2025:13: https://www.riksrevisionen.se/granskningar/granskningsrapporter/2025/antagningen-till-polisutbildningen.html
- Lokförare, jarnvagar.nu: https://jarnvagar.nu/fa-klarar-test-for-att-bli-lokforare/ och https://www.jobtestprep.se/lokforare-test
- Clevry begåvningstester: https://www.clevry.com/sv/plattform/assessments/begavningstester/
- Hogrefe Sverige: https://hogrefe.se/
- Psykologifabriken: https://psykologifabriken.se/
- Svevia trainee 2026 (MAP och Matrigma): https://jobb.svevia.se/jobs/6694556-trainee-anlaggning
- 3Talent trainee: https://www.traineeguiden.se/trainee-program/3talent-management-trainee-program/
- Vinnova, situationsbaserat bedömningstest: https://www.vinnova.se/p/situationsbaserat-bedomningstest-for-rekrytering
- logiktester.se: https://logiktester.se/
- Neurobics: https://www.neurobics.se/tester/ och https://www.neurobics.se/tester/spatial-formaga/
- JobTestPrep.se: https://www.jobtestprep.se/spatial-formaga-test och https://www.jobtestprep.se/gratis-lamplighetstest
- Test The Talent: https://testttalent.se/
- AssessmentDay: https://www.assessmentday.co.uk/
- 123test: https://www.123test.com/assessment-tests/
