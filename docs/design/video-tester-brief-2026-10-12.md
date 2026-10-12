# Innehållsbrief: 30-sekundersvideo om rekryteringstesterna

Datum 2026-10-12. Författare: testansvarig. Mottagare: art-director (storyboard och motion), svensk-ux-copywriter (slutkoll på raderna), saas-lead (placering och mätning), ägaren (godkänner storyboarden i artefakt före produktion).

Placering: landningssidan `/verktyg/rekryteringstester` (`src/app/(public)/verktyg/rekryteringstester/page.tsx`). Var på sidan den ligger är art-directors och saas-leads beslut, se avsnitt 8.

Underlag, kontrollerat 2026-10-12 mot `main` (det som är live): landningssidan och dess FAQ-data, `src/app/dashboard/tester/testConfig.ts`, `src/app/dashboard/tester/components/testCatalog.ts`, testkörningen (`src/components/tests/matrix`, `verbal-shared`, `numerical-shared`, `prov`, `shared`), resultatsidan (`TestResultsShell.tsx`, `reviews/*`), personlighetstestet (`src/components/personalityTest`, `src/lib/personalityTest`), frågebankerna (`src/lib/logicTestV7/questionBankGrund.v7.json`, `src/lib/numericalTest/questionBank.json`, `src/lib/verbalTestV1/questionBank.json`), samt `docs/design/spec-rummen-2026-10-10.md`, `brief-testvy-2026-10-10.md`, `copy-vag5-publikt-2026-10-11.md` och `tester-lyft-2026-10-11/` (riktning, hjälptexter, illustrationer).

**Viktig avgränsning.** Rum-vågorna (nivå 1 till 10, nivåmätning, dagens pass, provdatum, kurvan med provdatum, serie, milstolpar, Premium-namnet) ligger på `design/rummen-*`-brancher och är inte mergade till `main`. Videon ska visa produkten som den är live i dag. Inget ur den kommande vyn får synas, se avsnitt 6. När rummen släpps gör vi en version 2 av videon; den här ska vara skriven så att den fortfarande är sann då (därför inga antal, inga minuter, inga paketnamn).

---

## 1. Målgrupp och den enda saken

**Vem tittar.** Sara, 29 (persona A i brief-testvy): kallad till ett rekryteringstest i en rekryteringsprocess, provet är om några dagar, hon har sökt på testets namn eller "rekryteringstest öva" och landat på sidan. Hon har sällan eller aldrig gjort ett sådant test, vet inte hur uppgifterna ser ut och är orolig för att bli överraskad av formatet. Sekundärt Amina, 34 (persona C): vet att siffrorna är hennes svaga sida och vill se att det går att träna just på dem.

Hon tittar på mobilen, troligen med ljudet av. Texten i bild måste bära hela budskapet själv; musiken är ett plus för den som har ljud på.

**Den enda saken hon ska ha förstått efter 30 sekunder:**

> Här ser uppgifterna ut precis som på det riktiga testet, jag kan träna på dem nu, och efter varje pass ser jag exakt vad jag missade och varför.

Allt som inte bär den meningen stryks.

---

## 2. Berättelsebåge, sex scener på 30 sekunder

Tumregler som gäller alla scener: högst sex ord per textrad, varje rad står minst 2,5 sekunder, högst två rader i bild samtidigt, högst ett nytt visuellt element per 1,5 sekund. Textraderna nedan är exakta och får inte ändras utan copywriterns ja. Det som står under "Visar" beskriver innehållet; formen är art-directors.

Allt gränssnitt som visas ska vara ritat efter produkten (samma ordning på element, samma etiketter), men förenklat till provbladets kärna enligt `tester-lyft-2026-10-11/riktning.md`: inga maskotar, inga människor, inga metaforer, en accentyta per bild (det rätta svaret, den sökta rutan, markören).

### Scen 1: Kallelsen (0 till 4 s)

**Visar.** Ett tomt, lugnt blad. En rad glider in som en kallelse: en kalenderrad med en markerad dag några dagar fram och ordet "Test" på raden. Inget mejlprogram, inga logotyper, inget avsändarnamn. Bladet vänds eller zoomas till ett provblad med tre tomma rutor i rad (de blir scen 2).

**Text på skärmen.**
- 0,5 till 3,5 s: `Kallad till ett rekryteringstest?`

**Varför.** Hennes exakta situation, i en fråga. Inget om oss än.

### Scen 2: Så ser uppgifterna ut (4 till 14 s)

Tre uppgifter i följd, en per testtyp, tecknade efter riktiga frågor ur bankerna (exakta uppgifter i avsnitt 3). Varje uppgift visas ungefär 3,3 sekunder: uppgiften byggs upp, svarsalternativen landar, det rätta svaret markeras med accentfärgen sist. Inget rätt-eller-fel-ljud, ingen bock som exploderar; markeringen tonar in.

**2a Logiktest (4 till 7,3 s).** 3×3-matrisen med pilen som vrider sig 45 grader medurs ruta för ruta, nionde rutan tom med streckad ram. Sex svarsalternativ i två rader om tre under matrisen, som i produkten. Pilen som pekar rakt upp markeras.

**2b Verbalt resonemang (7,3 till 10,6 s).** Ett textstycke på fyra till fem rader till vänster eller ovanför, ett påstående under, och tre svarsknappar i rad: Sant, Falskt, Kan ej avgöras. Knappen Falskt markeras.

**2c Numeriskt test (10,6 till 14 s).** En tabell med fem rader och sex kolumner (Kategori, Q1 till Q4, Totalt), en liten klocka i hörnet som räknar uppåt. Frågan under tabellen, fyra alternativ, den sökta cellen (Sport, Totalt) och svaret "Cirka 15 %" markeras.

**Text på skärmen.** En rad per uppgift, som rubrik över eller under bilden, i exakt den form namnen har i produkten:
- 4 till 7,3 s: `Logiktest`
- 7,3 till 10,6 s: `Verbalt resonemang`
- 10,6 till 14 s: `Numeriskt test`

Och en rad som ligger kvar genom hela scenen, i mindre grad, längst ner:
- 4,5 till 14 s: `Samma format som det riktiga testet`

**Varför.** Det här är scenen som gör jobbet. Den som gjort ett sådant test ska känna igen varje uppgift på en sekund; den som aldrig gjort det ska förstå vad som väntar.

### Scen 3: Resultat och genomgång (14 till 20 s)

**Visar.** Resultatsidan som den ser ut i dag, förenklad: stort tal "12" med "av 15" i mindre grad, bredvid "80" med "procent" i mindre grad, och under en linje två små fält: "Tid" med ett klockvärde och "Per fråga" med sekunder. Talen är gränssnittsdata i bild, inte textrader, och skrivs aldrig i undertexten. Efter cirka 2,5 sekunder scrollar vyn ner till genomgången: en rad "Fråga 9" med etiketten "Fel", under den matrisen från scen 2a i liten storlek med det rätta alternativet markerat, och regeln i en mening: "Pilen vrider sig 45 grader medurs för varje ruta."

**Text på skärmen.**
- 14 till 17 s: `Rätt och fel direkt`
- 17 till 20 s: `Och regeln bakom varje fråga`

**Varför.** Det konkurrenterna oftast saknar och det landningssidan lovar i steg 3 och 4 ("Se resultat och tid direkt", "Se vad du missade"). Talen 12 av 15 ligger nära den verkliga medianen på grundnivån (13 av 15), så det ser inte orealistiskt bra ut.

### Scen 4: Nivåer och provläge (20 till 24,5 s)

**Visar.** Tre nivåmärken i rad, i produktens ordning och med produktens etiketter: Grund, Avancerad, Expert. Grund är markerad först, markeringen flyttar till Avancerad och Expert. Sedan klipp till provbladet: tio små rutor i rad där de tre första är ifyllda, en klocka som räknar nedåt (till exempel 24:59 → 24:58, det är den enda klockan i videon som räknar ner) och knappen "Lämna in". Inga förklaringar i bild under provet, det är poängen.

**Text på skärmen.**
- 20 till 22,5 s: `Tre nivåer, grund till expert`
- 22 till 24,5 s: `Och provläge mot klockan`

**Varför.** Progressionen och realismen finns i produkten i dag (`tests_above_base`, `test_exam_mode`) och är det som motiverar att komma tillbaka. Vi säger inte vad som är låst eller vad det kostar.

### Scen 5: Personlighetstest (24,5 till 27,5 s)

**Visar.** Ett påstående på en rad, under det fem punkter på en linje med ändetiketterna "Stämmer inte alls" och "Stämmer perfekt", en punkt markerad. Sedan klipp till profilen: fem vågräta staplar med dimensionsnamnen till vänster, olika längd, ingen stapel markerad som bättre än någon annan, ingen procent.

**Text på skärmen.**
- 24,5 till 27,5 s: `Personlighetsprofil. Inga rätta svar.`

**Varför.** Det fjärde testet och det enda utan facit. Raden säger det rakt ut, för det är så produkten beskriver det och så hjälprutorna (E1) formulerar det. Personlighetstestet får aldrig se ut som något man kan vinna.

### Scen 6: Avslut och uppmaning (27,5 till 30 s)

**Visar.** Bladet blir rent. Avslutsraden, under den knappen i samma form och ordalydelse som landningssidans primärknapp, och längst ner ordmärket jobbcoach.ai. Slutbilden står stilla sista sekunden så att den fungerar som sista frame i en loop.

**Text på skärmen.**
- 27,5 till 30 s: `Träna nu. Kom förberedd sen.`
- 28 till 30 s (knapp): `Starta gratis test`
- 28,5 till 30 s (ordmärke): `jobbcoach.ai`

**Varför.** Avslutsraden är landningssidans egen slutrubrik, knappen är landningssidans primärknapp (`primar.text` och `slut.knapp.text` i `page.tsx`). Videon får inte lova något annat än knappen under den gör.

---

## 3. Testtyper, funktioner och exakta exempel

Namnen nedan är de som står i produkten (`KIND_LABEL` och `LEVEL_LABEL` i `testConfig.ts`, etiketterna i komponenterna). Använd dem exakt så.

| Visas i videon | Namn i produkten | Vad som får synas | Vad som inte får synas |
|---|---|---|---|
| Logiktest | Logiktest (nivåer: Logiktest, grundnivå / avancerad nivå / expertnivå; provet heter Logikprov) | 3×3-matris, tom nionde ruta, sex svarsalternativ, regeln i genomgången | Antal frågor, minuter, leverantörsnamn |
| Verbalt resonemang | Verbalt resonemang (provet: Verbalt prov) | Textstycke, påstående, knapparna Sant / Falskt / Kan ej avgöras | "Går inte att avgöra" (så står det på landningssidan, men knappen i produkten heter Kan ej avgöras; videon följer produkten) |
| Numeriskt test | Numeriskt test (provet: Numeriskt prov) | Tabell med rubrikrad, fråga, fyra alternativ, klocka som räknar uppåt | Diagram (finns i banken men gör bilden rörig på 3 sekunder) |
| Personlighetstest | Personlighetstest (grundnivå / avancerad nivå) | Påstående, femgradig skala, profil med fem staplar | Poäng, procent, "bra" eller "dåligt", jämförelse mot andra |
| Nivåer | Grund, Avancerad, Expert | Tre märken i den ordningen | Lås, paketnamn, pris |
| Provläge | Logikprov / Verbalt prov / Numeriskt prov | Klocka som räknar ner, "Lämna in", inga förklaringar | Antal uppgifter och minuter (står i koden men ändras) |
| Resultat | Resultatsidan ("Din poäng", "Tid", "Per fråga") | Rätt av antal, procent, tid, sekunder per fråga, som gränssnittsdata | Percentil (visas bara från 25 sessioner och behöver förklaring) |
| Genomgången | "Fråga för fråga" med etiketterna Rätt / Fel / Hoppad | En fråga med etiketten Fel och regeln i en mening | Röd färg på det felaktiga; markera det rätta, tona det valda |

### 3.1 Matrisuppgiften (scen 2a och 3), ur banken

Fråga `v7g-q3-vector-rotation`, grundnivå, rubrik i banken "Pilen vrider sig". Regel: "Pilen vrider sig 45 grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner. Pilens längd och spets är likadana hela vägen."

Rutnätet (pil med fylld spets, lång, vinkel i grader medurs där 0 pekar rakt upp):

| | Kolumn 1 | Kolumn 2 | Kolumn 3 |
|---|---|---|---|
| Rad 1 | 0 | 45 | 90 |
| Rad 2 | 135 | 180 | 225 |
| Rad 3 | 270 | 315 | tom |

Sex svarsalternativ (produkten blandar ordningen per session, så ordningen i videon är fri):
1. Pil 0 grader, lång, fylld spets. **Rätt.**
2. Pil 45 grader, lång, fylld spets.
3. Pil 315 grader, lång, fylld spets.
4. Pil 0 grader, kort, fylld spets.
5. Pil 0 grader, lång, öppen spets.
6. Pil 180 grader, lång, fylld spets.

Den är vald för att regeln går att se i rörelse (pilen roterar när rutorna byggs upp) och för att distraktorerna är äkta: fel vinkel, fel längd, fel spets. Rita pilarna som i `renderers.v7.tsx` (en ren linje med spets, ingen skugga, ingen 3D).

Reserv om art-director vill ha en stillare bild: `v7g-q6-orbital-walk`, "Pricken vandrar runt cirkeln". Fylld mittpunkt, en liten prick som flyttar sig 90 grader medurs per ruta: positionerna klockan 12, 3, 6 / 9, 12, 3 / 6, 9, tom. Rätt svar: pricken klockan 12. Distraktorer: pricken klockan 3, 6 respektive 9, öppen mittpunkt med pricken klockan 12, fylld mittpunkt utan prick.

Andra reserv, om bilden ska matcha illustrationsstandarden i `tester-lyft-2026-10-11/illustrationer/illu-matris.svg`: en latinsk kvadrat med cirkel, kvadrat och triangel där ingen rad kan läsas av för sig. Den är ärligare mot hur svårare uppgifter fungerar, men svårare att förstå på tre sekunder i rörelse. Ta den bara om scen 2a får mer tid.

### 3.2 Den verbala uppgiften (scen 2b), ur banken

Passage `v1-p01-summer-employment`, grundnivå. Visa ett utdrag, inte hela texten (hela texten är nio meningar och går inte att läsa på tre sekunder; utdraget ska se ut som början på ett längre stycke, gärna med en antydd fortsättning):

> Många företag tycker att det är förmånligt att anställa studenter över sommaren. Den ordinarie personalen vill ofta ta ut semester under denna period. [...] Företagen betalar studenterna utifrån en fast skala utan de vanliga rättigheterna, såsom betald semester och sjuklön.

Påstående (det andra i passagen):

> Studenter har samma rätt till betald semester som den ordinarie personalen när de sommarjobbar.

Knappar i den ordning produkten har dem: **Sant**, **Falskt**, **Kan ej avgöras**. Rätt svar: Falskt (texten säger emot påståendet rakt ut). Markera Falskt.

Om art-director vill visa fällan som skiljer verbala test från vanlig läsförståelse är tredje påståendet bättre: "Studenterna måste följa företagets ordinarie rutiner för disciplin- och klagomålsärenden." med svaret Kan ej avgöras (texten är tyst om saken). Välj ett av dem, aldrig båda.

### 3.3 Den numeriska uppgiften (scen 2c), ur banken

Passage `num-p01`, "Försäljningsanalys per produktkategori", grundnivå. Tabellen exakt så här, med rubriken ovanför:

**Försäljning 2024 per kategori (MSEK)**

| Kategori | Q1 | Q2 | Q3 | Q4 | Totalt |
|---|---|---|---|---|---|
| Elektronik | 12,5 | 15,2 | 18,8 | 22,1 | 68,6 |
| Hushåll | 8,2 | 9,5 | 9,8 | 9,8 | 37,3 |
| Kläder | 6,8 | 8,4 | 8,9 | 14,0 | 38,1 |
| Sport | 4,3 | 4,5 | 6,3 | 10,9 | 26,0 |
| Totalt | 31,8 | 37,6 | 43,8 | 56,8 | 170,0 |

Sista raden är markerad (banken har `highlightLastRow: true`). Fråga (den fjärde i passagen):

> Hur stor andel utgjorde Sport av total årsförsäljning?

Alternativ: Cirka 12 %, **Cirka 15 %**, Cirka 18 %, Cirka 22 %. Rätt: 15 % (26,0 av 170,0). Markera cellen Sport/Totalt och cellen Totalt/Totalt med mjuk yta, svaret med accent.

Decimaltecken: banken skriver "12.5" med punkt. I videon skriver vi svenskt decimalkomma, "12,5". Se avsnitt 7, punkt 3.

### 3.4 Personlighetstestet (scen 5), ur banken

Påstående `g-23` ur grundtestet: **"Jag är noggrann med detaljer."**

Skalan har fem steg med etiketterna, i ordning: Stämmer inte alls, Stämmer dåligt, Neutral, Stämmer bra, Stämmer perfekt. I videon räcker ändetiketterna. Markera steg 4.

Profilen visar fem dimensioner med de namn produktens resultatsida använder (`DIMENSION_META` i `src/lib/personalityTest/insights.ts`), i den ordning `BigFiveChart` ritar dem: Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet. Varje stapel har ett band Låg, Medel eller Hög i produkten; i videon kan banden utelämnas. Staplarna ska ha olika längd och ingen färgskillnad som antyder bra eller dåligt. Se avsnitt 7, punkt 1 om namnen.

### 3.5 Resultatet (scen 3)

Resultatsidan i dag (`TestResultsShell.tsx`): stort tal för rätt, "av 15" i metagrad, stort tal för procent, "procent" i metagrad, därunder två fält med etiketterna **Tid** och **Per fråga**, det senare i sekunder. Värden att använda: 12 av 15, 80 procent, Tid 6:48, Per fråga 27 sek. Genomgången har rubriken "Fråga för fråga" och varje rad etiketten Rätt, Fel eller Hoppad.

Regelmeningen i genomgången hämtas ur bankens fält `rule` och är för matrisen i 3.1: "Pilen vrider sig 45 grader medurs för varje ruta." (första meningen räcker).

### 3.6 Provläget (scen 4)

Provet har total tid och räknar ner, lämnas in automatiskt när tiden går ut, visar inga förklaringar under tiden och knappen heter "Lämna in" (`MatrisProvSession.tsx`, `TestFlowShell.tsx`). Visa klockan som räknar ner från ett värde runt 25 minuter, men skriv aldrig provets antal eller längd i text.

### 3.7 Klockan i träningen

I träningen räknar klockan **uppåt** (landningssidan: "Timern räknar uppåt så att du ser tempot, men ingenting bryter mitt i en fråga"). Klockan i scen 2c ska alltså räkna upp, till exempel 0:41 → 0:42. Bara provets klocka i scen 4 räknar ner. Det är en detalj som den som gjort tester lägger märke till.

---

## 4. Avslutande rad och uppmaning

Avslutsrad: **Träna nu. Kom förberedd sen.**
Knapp: **Starta gratis test**
Ordmärke: **jobbcoach.ai**

Båda texterna är hämtade ur landningssidan (`slut.rubrik` och `primar.text`). Ändras knappen på sidan ska videons slutbild uppdateras i samma PR; det är ett acceptanskriterium för bygget, inte för videon.

---

## 5. Musik och tempo

- Instrumentalt, 30 sekunder exakt, licensierat spår utan sång. Lugnt driv, cirka 100 till 110 slag i minuten, så att klipp kan läggas på slag utan att det blir hetsigt. Reddit-förebildens krav "inte för snabbt, folk ska förstå vad videon handlar om" gäller: hellre ett klipp för lite än ett för mycket.
- Klipp mellan scener på slag. Inom scen 2 landar de tre uppgifterna på var sin takt.
- En lätt höjning in i scen 3 (resultatet), ingen "drop", inget crescendo, inga ljudeffekter för rätt svar. Vuxet och sakligt, som ett provrum, inte som ett spel.
- Tydligt slut på sista slaget vid 30 s, inte en uttoning, så att loopen känns avsiktlig.
- Videon ska fungera helt utan ljud. Om ljud krävs för att förstå den är storyboarden fel.

---

## 6. Vad som ska undvikas

**Påståenden produkten inte håller i dag.** Ingen nivå 1 till 10, ingen nivåmätning, inget "dagens pass", inget provdatum eller nedräkning till provet, ingen kurva med provdatum, ingen serie, inga milstolpar, inga riktade pass, inget leverantörsformat per leverantör. Allt detta är byggt på brancher men inte live. Ingen "procentenheter mot tidigare snitt" eller utvecklingskurva heller; Din utveckling finns i dag men visar bara en punkt per test för gratiskonton och behöver för mycket förklaring för tre sekunder.

**Pris och paket.** Inga belopp, inga paketnamn (Träningspaketet, Hela paketet, Premium, Dagspasset), inget "i veckan" eller "i månaden", inget "lås upp", inga låsikoner, inget "obegränsat". Ordet gratis förekommer bara i knappen, för att den heter så på sidan.

**Leverantörer.** Inga leverantörsnamn (Matrigma, Assessio, Alva, SHL, Aon, cut-e), inga logotyper, inga ordmärken som liknar deras, ingen formulering som antyder samarbete. "Samma format som det riktiga testet" är tillåtet; "samma test" eller "samma frågor" är det inte.

**Antal och tider.** Inga antal frågor och inga minuter i text. De står i koden i dag (15, 60, 32, 18 på 25 och så vidare) men har ändrats två gånger på en månad och videon ska överleva nästa ändring. Gränssnittsdata i bild (12 av 15, klockvärdet) är okej eftersom det är ett exempel, inte ett löfte.

**Löften om effekt.** Ingen "höj ditt resultat med 20 procent", ingen percentil, inget "klara testet", inget "garanterat", inga kundcitat, inga betyg, inga stjärnor. Inga påståenden om AI.

**Personlighetstestet.** Aldrig poäng, procent, rätt eller fel, "förbättra din profil", "gör om". Aldrig en stapel i en färg som läser som bättre. Aldrig "testa om du passar".

**Form och ton.** Inga Sparkles, ingen gnista, ingen konfetti, inga stjärnor, inga raketer, trofér, medaljer, glödlampor, hjärnor, kugghjul eller måltavlor. Inga människor, ansikten eller händer. Inga engelska gränssnittsord (score, level, test mode, streak, unlock). Inget tankstreck i någon textrad. Inget rött på fel svar: det valda tonas ner, det rätta markeras. Ingen klocka som blinkar eller byter till rött. Ingen text som rullar eller studsar in; text tonar och står stilla.

**Övrigt.** Inte mer än en accentfärgad yta per bild. Inga påhittade gränssnittselement som inte finns i produkten (notiser, chatt, poängtavla). Inga QR-koder. Inget som visar en annan URL än jobbcoach.ai.

---

## 7. Fynd att ta ställning till (ägaren, copywritern)

Dessa påverkar inte om videon kan göras, men videon tvingar fram beslut som behöver tas innan den publiceras.

1. **Dimensionsnamnen skiljer sig mellan landningssidan och produkten.** Sidan säger Öppenhet, Noggrannhet, Extraversion, Vänlighet, Känslostabilitet. Resultatsidan i produkten (`insights.ts`) säger Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet. Videon följer produkten, eftersom det är den vyn hon möter efter klicket. Copywritern bör besluta om en uppsättning namn och ändra det andra stället. "Känslomässig särbarhet" är tungt i en stapeletikett; "Känslostabilitet" vänder dessutom skalan (hög särbarhet är låg stabilitet), så det är inte bara ett ordbyte.

2. **Knappen i det verbala testet heter "Kan ej avgöras"**, landningssidan skriver "går inte att avgöra" (tre ställen). Videon följer knappen. Copywritern avgör vilket som ska gälla; "går inte att avgöra" är bättre svenska men knappen får inte bli längre än den är på 360 px.

3. **Decimaltecknet i den numeriska banken är punkt** ("12.5"), i hela `questionBank.json` och i förklaringarna. På svenska skriver vi komma, och den som gjort ett svenskt test reagerar på punkten. Videon använder komma. Banken bör rättas (ren textersättning i ett JSON-fält, Opus, inklusive förklaringarna), och det ska testas att parsningen inte läser talen som tal någonstans.

4. **Landningssidan säljer fortfarande Träningspaketet för 79 kr i veckan** (tre ställen plus FAQ) och FAQ säger "Du kan när som helst pausa eller göra om testet", trots att grundnivån har en session per dygn. Ägarens beslut 2026-10-10 är månad 149 kr och Dagspasset, och våg 5-copyn byter till Premium. Videon undviker allt detta, men sidan videon ligger på bör vara rättad när videon publiceras, annars motsäger sidan sig själv runt den.

5. **Smakprovet utan konto** ("Prova fem frågor", `/verktyg/rekryteringstester/prova`) är sidans bästa ingång och nämns inte i videon, eftersom knappen under videon går till registreringen. Om saas-lead vill att videon ska peka på smakprovet i stället byter scen 6 knapp till "Prova fem frågor" och ingenting annat ändras.

---

## 8. Leverans, placering och acceptans

**Format.** Master 1920×1080, 30,0 sekunder, 30 bilder per sekund. All text och alla viktiga element inom en central säkerhetszon på 4:5 (så att samma master kan beskäras till mobil och till inlägg utan omredigering). Exporter: MP4 (H.264) och WebM (VP9) under 3 MB vardera, utan ljudspår för sidan (musiken i en separat MP4 för sociala kanaler). En stillbild som affisch (poster): bilden i scen 2a med matrisen fylld och svaret markerat.

**Placering (saas-lead och art-director beslutar).** Två rimliga platser på sidan: i stället för scenen `IlluScenMatris` i sidhuvudet, eller som egen rad under "Så fungerar det". Oavsett plats: videon spelas automatiskt utan ljud och loopar, laddas lat om den inte ligger i första vyn, och får inte flytta LCP över budgeten för publika sidor; mäts före och efter med skärmdump och Lighthouse på Pixel 7, och blir en rad i SEO-diffen (ingen ändring av h1, metadata eller schema). Videon mäts: `video_started`, `video_watched_75`, klick på knappen inom 10 sekunder efter 75 procent, med ägaren och testkontona undantagna.

**Acceptans för storyboarden (jag granskar mot detta).**
1. Alla textrader är exakt de i avsnitt 2, högst sex ord, minst 2,5 sekunder, högst två samtidigt.
2. De tre uppgifterna i scen 2 är ritade efter avsnitt 3.1 till 3.3 och går att lösa av den som pausar bilden. Svarsalternativen är de i banken, inte påhittade.
3. Klockan i scen 2c räknar upp, klockan i scen 4 räknar ner. Inga andra klockor.
4. Resultattalen står som gränssnitt, aldrig i textraderna.
5. Personlighetsscenen har inga tal och ingen färgskillnad mellan staplarna.
6. Ingenting i avsnitt 6 förekommer. Grep på storyboardens textlager: inga tankstreck, inga engelska gränssnittsord, inga belopp, inga leverantörsnamn.
7. Slutbilden har exakt landningssidans knapptext.
8. Videon är begriplig med ljudet av, kontrollerat genom att någon som inte läst briefen ser den utan ljud och återger den enda saken i avsnitt 1 med egna ord.
9. Storyboarden levereras som artefakt med alla sex scener som stillbilder i 16:9 och i 4:5-beskärning, för ägarens godkännande före produktion.
