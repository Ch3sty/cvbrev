# Innehållsbrief: 30-sekundersvideo om rekryteringstesterna

Datum 2026-10-13. Författare: testansvarig, med art-director. Ersätter `video-tester-brief-2026-10-12.md`. Mottagare: art-director (storyboard och motion), svensk-ux-copywriter (slutkoll på raderna), saas-lead (placering och mätning), ägaren (godkänner storyboarden i artefakt före produktion).

Placering: landningssidan `/verktyg/rekryteringstester` (`src/app/(public)/verktyg/rekryteringstester/page.tsx`). Var på sidan den ligger är art-directors och saas-leads beslut, se avsnitt 8.

Underlag, kontrollerat 2026-10-13 mot `main`: landningssidan (publikt v2, `src/components/publikt/publikt.css`), `src/app/dashboard/tester/testConfig.ts` (`KIND_LABEL`), Träningens komponenter i `src/components/traning/` (`PassShell`, `PassFraga`, `Regelpanel`, `PassResultatVy`, `GenomgangVy`, `Nivaskala`, `Kurva`, `Hemvy`, `ovningsprov/Klocka`, `ovningsprov/Segmentstapel`, `vnpass/VnUppgift`), texterna i `src/lib/traning/pass-copy.ts`, `hem-copy.ts`, `rubrik.ts`, `src/lib/ovningsprov/copy.ts`, `src/lib/tester/pass-copy.ts`, personlighetstestet (`src/lib/personalityTest/insights.ts`), frågebankerna (`src/lib/logicTestV7/questionBankGrund.v7.json`, `src/lib/numericalTest/questionBank.json`, `src/lib/verbalTestV1/questionBank.json`), tokens i `src/app/globals.css` (PUBLIKT V2 och rummen) och `docs/designsystem.md`.

**Vad som ändrats sedan 12 oktober.** Rummen är live på `main`. Ägarens beslut 2026-10-13: nivån 1 till 10, kurvan dag för dag, provdatum och dagens pass ska visas; scen 3 blir passets resultat följt av genomgången med Regelpanelen; scen 4 blir hemvyn (nivåskala, kurva fram till provdagen, dagens pass) och övningsprovet mot klockan. Förbudslistan i avsnitt 6 är uppdaterad: rummen är tillåtna, priser, paketnamn, leverantörsnamn, effektlöften och AI-påståenden är fortfarande förbjudna. Provdatum visas som "14 dagar till provet", aldrig med leverantörsnamn. Testnamnen och personlighetsdimensionerna följer produkten.

---

## 1. Målgrupp och den enda saken

**Vem tittar.** Sara, 29 (persona A i brief-testvy): kallad till ett rekryteringstest i en rekryteringsprocess, provet är om ett par veckor, hon har sökt på testets namn eller "rekryteringstest öva" och landat på sidan. Hon har sällan eller aldrig gjort ett sådant test, vet inte hur uppgifterna ser ut och är orolig för att bli överraskad av formatet. Sekundärt Amina, 34 (persona C): vet att siffrorna är hennes svaga sida och vill se att det går att träna just på dem, och att det går att se om träningen ger något.

Hon tittar på mobilen, troligen med ljudet av. Texten i bild måste bära hela budskapet själv; musiken är ett plus för den som har ljud på.

**Den enda saken hon ska ha förstått efter 30 sekunder:**

> Här ser uppgifterna ut precis som på det riktiga testet, jag kan träna på dem nu, efter varje pass ser jag exakt vad jag missade och varför, och jag ser min nivå röra sig fram till provdagen.

Allt som inte bär den meningen stryks.

---

## 2. Berättelsebåge, sex scener på 30 sekunder

Tumregler som gäller alla scener: högst sex ord per textrad, varje rad står minst 2,5 sekunder, högst två rader i bild samtidigt, högst ett nytt visuellt element per 1,5 sekund. Textraderna nedan är exakta och får inte ändras utan copywriterns ja. Det som står under "Visar" beskriver innehållet; formen är art-directors.

Allt gränssnitt som visas ska vara ritat efter produkten på `main` (samma komponenter, samma ordning på element, samma etiketter), förenklat till bladets kärna: inga maskotar, inga människor, inga metaforer. En kopparyta per bild där produkten tillåter det; där produkten själv ritar två (rätt svar med kant, punkt och figur i luckan; kurvans linje och kopparknappen) följer videon produkten.

### Scen 1: Kallelsen (0 till 3 s)

**Visar.** Ett tomt, lugnt blad. En rad glider in som en kallelse: en kalenderrad med en markerad dag ett par veckor fram (fredag 30 oktober, markerad i koppar med mörk text) och ordet "Test" på raden. Inget mejlprogram, inga logotyper, inget avsändarnamn. Kopparrutan blir tidsraden i scen 2.

**Text på skärmen.**
- 0,5 till 3,0 s: `Kallad till ett rekryteringstest?`

**Varför.** Hennes exakta situation, i en fråga. Inget om oss än. Scenen är en sekund kortare än 12 oktober; sekunden går till scen 4.

### Scen 2: Så ser uppgifterna ut (3 till 13 s)

Tre uppgifter i följd, en per testtyp, tecknade efter riktiga frågor ur bankerna (exakta uppgifter i avsnitt 3) och efter produktens passvy: tidsraden från `PassShell` överst (4 px kopparrad som fylls mot provets tid per uppgift, räknar aldrig ner, byter aldrig färg) med tiden "0:38" till vänster och "provets tid 1:08" till höger under raden. Varje uppgift byggs upp, svarsalternativen landar, rätt svar markeras sist som i produkten: kopparkant och kopparpunkt på rätt alternativ, övriga i 38 procent, i matrisen dessutom rätt figur i luckan i koppar-ink. Inget rätt-eller-fel-ljud, ingen bock som exploderar.

**2a Logiktest (3 till 7 s).** Matrisen i papperskortet (`.matrisyta`): 3×3 med hårlinjer, luckan nere till höger insjunken med streckad ram och frågetecken (`LuckaV7`). Pilen vrider sig 45 grader medurs ruta för ruta. Sex svarsalternativ A till F, kvadratiska, i tre kolumner. Alternativ E (pilen rakt upp) markeras.

**2b Verbalt resonemang (7 till 10 s).** Texten i en ram överst (`VnUppgift`, `Underlag`), etiketten "Påstående 2 av 4", påståendet, och tre lika breda knappar i rad: **Sant**, **Falskt**, **Går inte att avgöra** (så heter knappen i passet, `FRAGA.svar` i `src/lib/ovningsprov/copy.ts`, och i övningsprovet). Falskt markeras.

**2c Numeriskt test (10 till 13 s).** Underlagets rubrik, "Räknare tillåten", tabellen i sin ram med fem rader och sex kolumner (Kategori, Q1 till Q4, Totalt), sista raden markerad. Frågan under, fyra alternativ som rader A till D. Vyn rullar som på telefonen så att alternativen kommer i bild. De sökta cellerna (Sport/Totalt, Totalt/Totalt) får mjuk yta, svaret "Cirka 15 %" markeras. Tidsradens tal räknar uppåt (0:41, 0:42, 0:43).

**Text på skärmen.** En rad per uppgift, som rubrik över bladet, i exakt den form namnen har i produkten (`KIND_LABEL`):
- 3 till 7 s: `Logiktest`
- 7 till 10 s: `Verbalt resonemang`
- 10 till 13 s: `Numeriskt test`

Och en rad som ligger kvar genom hela scenen, i mindre grad, direkt under rubriken (bladet går ut ur bild nedtill, så det finns ingen plats längst ner):
- 3,5 till 13 s: `Samma format som det riktiga testet`

**Varför.** Det här är scenen som gör jobbet. Den som gjort ett sådant test ska känna igen varje uppgift på en sekund; den som aldrig gjort det ska förstå vad som väntar.

### Scen 3: Passets resultat och genomgången (13 till 18 s)

**Visar.** Passets resultat som det ser ut i produkten (`PassResultatVy`, P4), förenklat: bladet får Träningens indigovägg som överdel. Toppraden "Dagens pass sparat" och "9 / 9". Dagsringen fylls i koppar med bocken, eyebrow "Passet klart", rubriken **"7 av 9 rätt. Nivån steg till 5,6."** (produktens `rubrikUpp`), nivåskalan 1 till 10 med punkten på 5,6, ringen "från 5,4" och målet 6,5 som triangel, de tre talen ("7 av 9" rätt, "+0,2" nivå från 5,4 i koppar-ljus, "1 av 9" över provets tid), målraden "Mål till provet: nivå 6,5", och det lyfta tempokortet över väggens kant. Talen är gränssnittsdata i bild, inte textrader, och skrivs aldrig i undertexten.

Efter cirka 2,5 sekunder rullar vyn till genomgången (`GenomgangVy`): toppraden "Genomgången", "Fråga 4 av 9, Figuren vrider sig", matrisen från scen 2a i mindre storlek med rätt figur i luckan i koppar-ink, de sex alternativen i samma ordning där det valda (A, 45 grader) står i bläckkant och det rätta (E) i kopparkant med punkt, och Regelpanelen i rummets ton: **"Regeln"** med bankens regel ordagrant och "Inte den här, 52 s" till höger, **"Ditt misstag"** med bankens misstag för det valda alternativet.

**Text på skärmen.**
- 13 till 15,5 s: `Rätt, fel och nivå direkt`
- 15,5 till 18 s: `Och regeln bakom varje fråga`

**Varför.** Det konkurrenterna oftast saknar: nivån som rör sig efter varje pass, och regeln och misstaget vid varje fråga. 7 av 9 ligger nära det en vanlig dag ger på nivå 5, så det ser inte orealistiskt bra ut. Nivån 5,6 från 5,4 är ett vanligt steg (högst ett halvt steg per pass).

### Scen 4: Nivån fram till provdagen, dagens pass och övningsprovet (18 till 24 s)

**Visar.** Hemvyn (`Hemvy`, ram 1b, mitt i planen) på väggen: lägesraden Min plan / Alla tester, rubriken **"14 dagar till provet"** (produktens rubriktabell i `rubrik.ts`, formen utan leverantör), dagsraden med ringen för dagens pass och nivån "5,6, din nivå, började på 5,0", och kurvan "Din nivå, dag för dag": fyra punkter (mätningen 5,0, sedan 5,2, 5,4, 5,6), siktebandet "Mål 6,5", provlinjen "Prov" vid 30 oktober, planraden med gjorda, kommande, nivåkoller, övningsprovet och söndagar, axeln "16 okt" till "30 okt". Kurvans linje är tråden. Sedan rullar vyn upp till det lyfta kortet **"Dagens pass"**, "Figuren vrider sig", "Nio uppgifter på din nivå, cirka tio minuter. Vi förklarar varje svar." och kopparknappen **"Starta dagens pass"**.

Hårt klipp till övningsprovet (`LogikProvFraga`): toppraden "Övningsprov", "Vårt format", klockringen uppe till höger som töms medurs med minuter kvar som enda tal (`Klocka`), segmentstapeln med sjutton besvarade uppgifter och den sista aktuell (`Segmentstapel`), matrisen "Pricken vandrar runt cirkeln" ur banken, sex alternativ där C är valt i bläckkant (inget facit under provet), och foten med Föregående och kopparknappen **"Lämna in"**. Minuten byter en gång i bild: ringen töms ett steg, talet går från 5 till 4.

**Text på skärmen.**
- 18 till 21,5 s: `Din nivå fram till provdagen`
- 21,5 till 24 s: `Och övningsprov mot klockan`

**Varför.** Det här är ledet "jag ser min nivå röra sig fram till provdagen", och det som motiverar att komma tillbaka: ett pass om dagen, kurvan, målet och provdagen. Vi säger inte vad som är låst eller vad det kostar. Provdatum visas alltid som dagar till provet, aldrig med leverantörsnamn (ägarens beslut 3).

### Scen 5: Personlighetstest (24 till 27 s)

**Visar.** Ett påstående på en rad, under det fem punkter på en linje med ändetiketterna "Stämmer inte alls" och "Stämmer perfekt", en punkt markerad i koppar. Sedan morf till profilen: fem vågräta staplar med dimensionsnamnen till vänster, olika längd, ingen stapel markerad som bättre än någon annan, ingen procent, ingen koppar.

**Text på skärmen.**
- 24,5 till 27 s: `Personlighetsprofil. Inga rätta svar.`

**Varför.** Det fjärde testet och det enda utan facit. Raden säger det rakt ut, för det är så produkten beskriver det. Personlighetstestet får aldrig se ut som något man kan vinna.

### Scen 6: Avslut och uppmaning (27 till 30 s)

**Visar.** Bladet blir rent och får bottenkant. Avslutsraden, under den knappen i samma form och ordalydelse som landningssidans primärknapp (`.pub-knapp`: pillerform, koppar till koppar-djup, mörk text), och längst ner ordmärket jobbcoach.ai. Slutbilden står stilla sista sekunden så att den fungerar som sista frame i en loop.

**Text på skärmen.**
- 27,5 till 30 s: `Träna nu. Kom förberedd sen.`
- 28 till 30 s (knapp): `Starta gratis test`
- 28,5 till 30 s (ordmärke): `jobbcoach.ai`

**Varför.** Avslutsraden är landningssidans egen slutrubrik (`PremiumBlock rubrik`), knappen är landningssidans primärknapp (`primar.text` i hjälten och i avslutet, båda leder till smakprovet `/verktyg/rekryteringstester/prova`). Videon får inte lova något annat än knappen under den gör.

---

## 3. Testtyper, funktioner och exakta exempel

Namnen nedan är de som står i produkten (`KIND_LABEL` i `testConfig.ts`, etiketterna i komponenterna och copyfilerna). Använd dem exakt så.

| Visas i videon | Namn i produkten | Vad som får synas | Vad som inte får synas |
|---|---|---|---|
| Logiktest | Logiktest (`KIND_LABEL.matris`) | Matrisen i papperskortet, luckan med streckad ram och frågetecken, sex alternativ A till F i tre kolumner, tidsraden, regeln och misstaget i genomgången | Leverantörsnamn |
| Verbalt resonemang | Verbalt resonemang (`KIND_LABEL.verbal`); passet heter Textpass i toppraden | Texten i en ram, "Påstående n av m", påståendet, knapparna Sant / Falskt / Går inte att avgöra | "Kan ej avgöras" (den gamla testvyns etikett) |
| Numeriskt test | Numeriskt test (`KIND_LABEL.numerisk`); passet heter Sifferpass | Underlagets rubrik, "Räknare tillåten", tabell med rubrikrad, fråga, fyra alternativ som rader, tidsraden | Diagram (finns i banken men gör bilden rörig på 3 sekunder) |
| Personlighetstest | Personlighetstest | Påstående, femgradig skala, profil med fem staplar | Poäng, procent, "bra" eller "dåligt", jämförelse mot andra |
| Nivån | Nivåskalan 1 till 10 (`Nivaskala`), "Nu 5,6", "från 5,4", målet som triangel | Skalan, punkten, ringen, målet, "+0,2" | Percentil, klassnamn, "poäng" |
| Kurvan | "Din nivå, dag för dag" (`HEM.kurva.rubrik`), "Mål 6,5", "Prov", "start" | Punkter per dag, siktebandet, provlinjen, planraden, axeln med datum | Tal vid punkterna (hemvyn ritar utan), leverantörsnamn vid provlinjen |
| Provdatum | "14 dagar till provet" (`rubrikForeProv` utan leverantör) | Rubriken, provlinjen, "30 okt" på axeln | "14 dagar till Matrigma" eller någon annan leverantörsform |
| Dagens pass | "Dagens pass" (`HEM.pass.eyebrow`), temat (familjens namn), `HEM.pass.text`, knappen "Starta dagens pass" | Kortet med eyebrow, titel, text och kopparknapp | Lås, "Ingår i Premium", pris |
| Övningsprovet | "Övningsprov" (`PASS_COPY.topp.general`), "Vårt format" (`FRAGA.undertitel` utan leverantör), "Lämna in", "Föregående" | Klockringen med minuter, segmentstapeln, matrisen, valt svar i bläck, foten | Leverantörens format i undertiteln, antal uppgifter och minuter i text |
| Resultat | `PassResultatVy`: "Dagens pass sparat", "Passet klart", rubriken "7 av 9 rätt. Nivån steg till 5,6.", de tre talen, "Mål till provet: nivå 6,5", tempokortet | Allt som gränssnittsdata | Percentil, milstolpekortet (kräver förklaring), betalväggen |
| Genomgången | "Genomgången", "Fråga 4 av 9, Figuren vrider sig", Regelpanelen "Regeln" / "Ditt misstag", "Inte den här, 52 s" | En fråga med regel och misstag ordagrant ur banken | Röd färg på det felaktiga; det valda i bläck, det rätta i koppar |

### 3.1 Matrisuppgiften (scen 2a och 3), ur banken

Fråga `v7g-q3-vector-rotation`, grundnivå, familj `vridning` ("Figuren vrider sig" i gränssnittet), rubrik i banken "Pilen vrider sig". Regel: "Pilen vrider sig 45 grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner. Pilens längd och spets är likadana hela vägen."

Rutnätet (pil med fylld spets, lång, vinkel i grader medurs där 0 pekar rakt upp):

| | Kolumn 1 | Kolumn 2 | Kolumn 3 |
|---|---|---|---|
| Rad 1 | 0 | 45 | 90 |
| Rad 2 | 135 | 180 | 225 |
| Rad 3 | 270 | 315 | tom |

Sex svarsalternativ (produkten blandar ordningen per session; videons ordning A till F): A 45 lång fylld, B 0 kort fylld, C 180 lång fylld, D 0 lång öppen spets, **E 0 lång fylld (rätt)**, F 315 lång fylld.

Bankens misstag för alternativ A (det valda i genomgången): "Pilen har vridit sig ett steg för långt." Det är texten under "Ditt misstag".

Den är vald för att regeln går att se i rörelse (pilen roterar när rutorna byggs upp) och för att distraktorerna är äkta: fel vinkel, fel längd, fel spets. Rita pilarna som i `renderers.v7.tsx` med måtten i `geometri.json` (skaft 76 till 24, spets 9, roterad kring 50/50, figuren fyller 80 procent av rutan).

### 3.2 Provets uppgift (scen 4), ur banken

Fråga `v7g-q6-orbital-walk`, grundnivå, familj `vandring`, "Pricken vandrar runt cirkeln". Fylld mittpunkt, en prick som flyttar sig 90 grader medurs per ruta: positionerna klockan 12, 3, 6 / 9, 12, 3 / 6, 9, tom. Alternativ i videons ordning: A klockan 3, B öppen mittpunkt med pricken klockan 12, **C klockan 12 (rätt)**, D klockan 9, E fylld mittpunkt utan prick, F klockan 6. I provet visas inget facit: C står som valt i bläckkant.

### 3.3 Den verbala uppgiften (scen 2b), ur banken

Passage `v1-p01-summer-employment`, grundnivå, rubrik i ramen "Sommaranställningar" (bankens rubrik inleds med "PASSAGE 1" och ett tankstreck; videon visar bara namnet). Visa ett utdrag, inte hela texten, med antydd fortsättning:

> Många företag tycker att det är förmånligt att anställa studenter över sommaren. Den ordinarie personalen vill ofta ta ut semester under denna period. [...] Företagen betalar studenterna utifrån en fast skala utan de vanliga rättigheterna, såsom betald semester och sjuklön.

Etikett "Påstående 2 av 4". Påstående:

> Studenter har samma rätt till betald semester som den ordinarie personalen när de sommarjobbar.

Knappar i den ordning passet har dem: **Sant**, **Falskt**, **Går inte att avgöra**. Rätt svar: Falskt (texten säger emot påståendet rakt ut). Markera Falskt.

### 3.4 Den numeriska uppgiften (scen 2c), ur banken

Passage `num-p01`, "Försäljningsanalys per produktkategori", grundnivå. Underlagets rubrik och "Räknare tillåten" på raden. Tabellen i sin ram, med rubriken ovanför:

**Försäljning 2024 per kategori (MSEK)**

| Kategori | Q1 | Q2 | Q3 | Q4 | Totalt |
|---|---|---|---|---|---|
| Elektronik | 12,5 | 15,2 | 18,8 | 22,1 | 68,6 |
| Hushåll | 8,2 | 9,5 | 9,8 | 9,8 | 37,3 |
| Kläder | 6,8 | 8,4 | 8,9 | 14,0 | 38,1 |
| Sport | 4,3 | 4,5 | 6,3 | 10,9 | 26,0 |
| Totalt | 31,8 | 37,6 | 43,8 | 56,8 | 170,0 |

Sista raden är markerad (banken har `highlightLastRow: true`; produkten ritar en starkare linje ovanför). Etikett "Fråga 4 av 4". Fråga:

> Hur stor andel utgjorde Sport av total årsförsäljning?

Alternativ som rader: A Cirka 12 %, **B Cirka 15 %**, C Cirka 18 %, D Cirka 22 %. Rätt: 15 % (26,0 av 170,0). Markera cellen Sport/Totalt och cellen Totalt/Totalt med mjuk yta, svaret med kopparkant.

Decimaltecken: banken skriver "12.5" med punkt. I videon skriver vi svenskt decimalkomma, "12,5". Se avsnitt 7, punkt 3.

### 3.5 Personlighetstestet (scen 5), ur banken

Påstående `g-23` ur grundtestet: **"Jag är noggrann med detaljer."**

Skalan har fem steg med etiketterna, i ordning: Stämmer inte alls, Stämmer dåligt, Neutral, Stämmer bra, Stämmer perfekt. I videon räcker ändetiketterna. Markera steg 4.

Profilen visar fem dimensioner med de namn produktens resultatsida använder (`DIMENSION_META` i `src/lib/personalityTest/insights.ts`), i den ordning `BigFiveChart` ritar dem: Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet. Varje stapel har ett band Låg, Medel eller Hög i produkten; i videon utelämnas banden. Staplarna ska ha olika längd och ingen färgskillnad som antyder bra eller dåligt. Se avsnitt 7, punkt 1 och 6.

### 3.6 Resultatet (scen 3)

`PassResultatVy` i dag: toppraden "Dagens pass sparat" (`R.sparat.pass`) och "9 / 9"; Dagsring gjord; eyebrow "Passet klart" (`R.passKlart`); rubriken ur `R.rubrikUpp(7, 9, 5.6)`: "7 av 9 rätt. Nivån steg till 5,6."; nivåskalan med `etikettNu` "Nu 5,6" och `etikettFran` "från 5,4"; de tre talen ur `resultat.ts`: "7 av 9" / "rätt", "+0,2" / "nivå, från 5,4" (koppar när nivån steg), "1 av 9" / "över provets tid"; målraden `PASS_COPY.matning.malRad(6.5, true)`: "Mål till provet: nivå 6,5"; tempokortet med eyebrow "Tempo", titeln `R.tempo.over("Fråga 4")`: "Fråga 4 tog över provets tid", texten `R.tempo.snitt(41, 68)` + `gaIgenom`: "Snitt 41 s, provet ger 68. Gå igenom den först." och staplarna per fråga med provets tid som streckad linje.

Genomgången (`GenomgangVy`): toppraden `G.titel` "Genomgången", `G.rad(4, 9)` + familjen: "Fråga 4 av 9, Figuren vrider sig", räknaren "1 / 2" (två missar... en miss och en över tid räknas som två rader i listan). Regelpanelen: `REGELPANEL.regeln` "Regeln", raden `PASS_COPY.regel.fel(52)` "Inte den här, 52 s", regeln ur bankens `rule` (första meningen räcker), `REGELPANEL.misstag` "Ditt misstag", misstaget ur bankens `misstag[valt]`.

### 3.7 Hemvyn (scen 4)

`Hemvy` ram 1b: lägesraden (`LAGESRAD.plan` / `.alla`: "Min plan", "Alla tester"), rubriken `rubrikForeProv({ leverantorNamn: null, testtyper: ['matris', 'numerisk'] }, 14)` som blir "14 dagar till provet" (med en typ hade den blivit "14 dagar till logiktestet"; videon använder formen "provet"), dagsraden med `HEM.dagsrad.nivaFran("5,0")`: "din nivå, började på 5,0", kurvrubriken `HEM.kurva.rubrik` "Din nivå, dag för dag" med länken `HEM.kurva.hela` "Hela kurvan", kurvan med `HEM.kurva.sikte("6,5")` "Mål 6,5", `HEM.kurva.prov` "Prov" och `HEM.kurva.matning` "start", axeln med `kortDatum`. Det lyfta kortet: `HEM.pass.eyebrow` "Dagens pass", titeln = familjens namn "Figuren vrider sig", `HEM.pass.text`, knappen `HEM.pass.knapp` "Starta dagens pass".

Datumen i videon: nivåkollen 13 oktober (dag 1 på kurvan), i dag 16 oktober, provet fredag 30 oktober (samma dag som kallelsen i scen 1). Kurvan har 18 dagar; axeln visar "16 okt" och "30 okt".

### 3.8 Övningsprovet (scen 4)

`LogikProvFraga` med `PassShell`: titeln `PASS_COPY.topp.general` "Övningsprov", undertiteln `FRAGA.undertitel` utan leverantör: "Vårt format", klockan `Klocka` (ring i ink-2 som töms medurs, talet i minuter, koppar först de två sista minuterna), segmentstapeln (besvarade i ton-ink, aktuell i bläck, kvar i kant) med metan `FRAGA.punktMeta("logik", 18)` "uppgift 18", foten med `FRAGA.foregaende` "Föregående" och `FRAGA.lamnaIn` "Lämna in" (kopparknappen, bara på sista uppgiften). Inga förklaringar under provet. Klockan visar 5 och sedan 4 minuter; skriv aldrig provets antal eller längd i text.

### 3.9 Tidsraden i passet

I passet (`PassShell`, `Tidsrad`) finns ingen klocka med visare: en 4 px rad fylls mot provets tid per uppgift, under den står tiden på frågan ("0:38") och "provets tid 1:08". Den räknar aldrig ner och byter aldrig färg; efter budgeten står den full. Text- och sifferpassen (`VnPassFlode`) har samma tidsrad. Bara provets klocka i scen 4 räknar ner, och den räknar i minuter.

---

## 4. Avslutande rad och uppmaning

Avslutsrad: **Träna nu. Kom förberedd sen.**
Knapp: **Starta gratis test**
Ordmärke: **jobbcoach.ai**

Båda texterna är hämtade ur landningssidan (`PremiumBlock rubrik` och `knapp.text`, samma som hjältens `primar.text`). Knappen på sidan leder till smakprovet utan konto. Ändras knappen på sidan ska videons slutbild uppdateras i samma PR; det är ett acceptanskriterium för bygget, inte för videon.

---

## 5. Musik och tempo

- Instrumentalt, 30 sekunder exakt, syntetiserat i kod på samma tidslinje som animationen (ägarens beslut 2026-10-12 och 2026-10-13), ingen licensmusik. Lugnt driv, musiken i specen: 120 BPM i halvtidskänsla (hörd puls 60), 4/4, 15 takter, D-dur.
- Klipp mellan scener på slag 1 eller 3. Inom scen 2 landar de tre uppgifterna på var sin takt.
- En lätt höjning in i scen 3 (resultatet), ingen "drop", inget crescendo, inga ljudeffekter som säger rätt eller fel. Vuxet och sakligt, som ett provrum, inte som ett spel.
- Ljudeffekter synkade till det som händer i bild: varje ljud hör till något som syns (tidsraden, kopparkanten, ringen som fylls, kurvan som ritas, klockan som byter minut). Text har inget ljud.
- Tydligt slut på sista slaget, inte en uttoning, så att loopen känns avsiktlig.
- Videon ska fungera helt utan ljud. Om ljud krävs för att förstå den är storyboarden fel.

---

## 6. Vad som ska undvikas

**Tillåtet sedan 2026-10-13 (ägarens beslut 1).** Nivån 1 till 10, nivåmätningen, dagens pass, provdatum som dagar till provet, kurvan med mål och provlinje, planraden, övningsprovet. Allt detta är live på `main` och ritas efter produkten.

**Pris och paket.** Inga belopp, inga paketnamn (Premium, Hela paketet, Dagspasset, Träningspaketet), inget "i veckan" eller "i månaden", inget "lås upp", inga låsikoner, inget "Ingår i Premium", inget "obegränsat". Ordet gratis förekommer bara i knappen, för att den heter så på sidan.

**Leverantörer.** Inga leverantörsnamn (Matrigma, Assessio, Alva, SHL, Aon, cut-e), inga logotyper, inga ordmärken som liknar deras, ingen formulering som antyder samarbete. Provdatum alltid som "14 dagar till provet", aldrig "till Matrigma". Övningsprovets undertitel alltid "Vårt format". "Samma format som det riktiga testet" är tillåtet; "samma test" eller "samma frågor" är det inte.

**Antal och tider i textraderna.** Inga antal frågor och inga minuter i videons textrader. Gränssnittsdata i bild (7 av 9, 0:38, provets tid 1:08, "Nio uppgifter på din nivå, cirka tio minuter" som är produktens egen copy) är okej eftersom det är ett exempel, inte ett löfte.

**Löften om effekt.** Ingen "höj ditt resultat med 20 procent", ingen percentil, inget "klara testet", inget "garanterat", inga kundcitat, inga betyg, inga stjärnor. Inga påståenden om AI, ordet AI förekommer inte.

**Personlighetstestet.** Aldrig poäng, procent, rätt eller fel, "förbättra din profil", "gör om". Aldrig en stapel i en färg som läser som bättre. Aldrig "testa om du passar".

**Form och ton.** Inga Sparkles, ingen gnista, ingen konfetti, inga stjärnor, inga raketer, trofér, medaljer, glödlampor, hjärnor, kugghjul eller måltavlor. Inga människor, ansikten eller händer. Inga engelska gränssnittsord (score, level, test mode, streak, unlock, progress). Inget tankstreck i någon textrad. Inget rött på fel svar: det valda i bläck, det rätta i koppar, de andra tonas. Ingen klocka som blinkar eller byter till rött. Ingen text som rullar eller studsar in; text tonar och står stilla.

**Övrigt.** Inte mer än en kopparyta per bild utöver det produkten själv ritar som en markering. Inga påhittade gränssnittselement som inte finns i produkten (notiser, chatt, poängtavla). Inga QR-koder. Inget som visar en annan URL än jobbcoach.ai.

---

## 7. Fynd att ta ställning till (ägaren, copywritern)

Dessa påverkar inte om videon kan göras, men videon tvingar fram beslut som behöver tas innan den publiceras.

1. **Dimensionsnamnen skiljer sig mellan landningssidan och produkten.** Sidan säger Öppenhet, Noggrannhet, Extraversion, Vänlighet, Känslostabilitet (med noten "Heter samvetsgrannhet i testet"). Resultatsidan i produkten (`insights.ts`) säger Öppenhet, Samvetsgrannhet, Utåtriktning, Vänlighet, Känslomässig särbarhet. Videon följer produkten (ägarens beslut 2). Copywritern bör besluta om en uppsättning namn och ändra det andra stället. "Känslostabilitet" vänder dessutom skalan, så det är inte bara ett ordbyte.

2. **Knappen i det verbala passet och provet heter "Går inte att avgöra"** (`FRAGA.svar`, `VnPassFlode`), medan den gamla testvyn (`verbal-shared/StatementList.tsx`) och resultatkroppen säger "Kan ej avgöras". Videon följer passet. Copywritern bör ena de två.

3. **Decimaltecknet i den numeriska banken är punkt** ("12.5"), i hela `questionBank.json` och i förklaringarna. På svenska skriver vi komma, och den som gjort ett svenskt test reagerar på punkten. Videon använder komma. Banken bör rättas (ren textersättning i ett JSON-fält, Opus, inklusive förklaringarna), och det ska testas att parsningen inte läser talen som tal någonstans. Kvarstår sedan 12 oktober.

4. **Landningssidan nämner Premium och priset** i avslutsblocket ("Jobbcoach Premium, 149 kr i månaden" som kicker) och i Premium-sektionen. Videon undviker allt detta. Sidan videon ligger på är ägarens; videon motsäger den inte.

5. **Smakprovet utan konto** ("Prova fem frågor", `/verktyg/rekryteringstester/prova`) är dit knappen "Starta gratis test" leder, i hjälten och i avslutet. Videons knapp säger därför precis vad som händer.

6. **Personlighetstestets resultatsida (`BigFiveChart`) ligger utanför designsystemet**: staplarna i en orange till röd toning (`#FB923C` till `#BE185D`) med gula band (`bg-amber-50`) och poängtal till höger. Videon ritar profilen som briefen kräver (samma ton på alla staplar, inga tal, inga band). Resultatsidan bör ritas om på Rummens linje innan videon publiceras, annars möter hon något annat än videon lovar efter klicket.

7. **Rubriktabellens form med en testtyp** ("14 dagar till logiktestet") är bättre svenska än "14 dagar till provet" men kräver att videon väljer en typ. Videon visar formen utan typ (hon har valt flera), som produkten gör vid två eller fler typer.

---

## 8. Leverans, placering och acceptans

**Format.** Master 1920×1080, 30,0 sekunder, 30 bilder per sekund. All text och alla viktiga element inom en central säkerhetszon på 4:5 (så att samma master kan beskäras till mobil och till inlägg utan omredigering). Exporter: MP4 (H.264) och WebM (VP9) under 3 MB vardera, utan ljudspår för sidan (musiken i en separat MP4 för sociala kanaler). En stillbild som affisch (poster): bilden i scen 2a med matrisen fylld och svaret markerat.

**Placering (saas-lead och art-director beslutar).** Två rimliga platser på sidan: i hjälten i stället för telefonen med expertfrågan, eller som egen rad under "Så fungerar det". Oavsett plats: videon spelas automatiskt utan ljud och loopar, laddas lat om den inte ligger i första vyn, och får inte flytta LCP över budgeten för publika sidor; mäts före och efter med skärmdump och Lighthouse på Pixel 7, och blir en rad i SEO-diffen (ingen ändring av h1, metadata eller schema). Videon mäts: `video_started`, `video_watched_75`, klick på knappen inom 10 sekunder efter 75 procent, med ägaren och testkontona undantagna.

**Acceptans för storyboarden (jag granskar mot detta).**
1. Alla textrader är exakt de i avsnitt 2, högst sex ord, minst 2,5 sekunder, högst två samtidigt.
2. De tre uppgifterna i scen 2 och provets uppgift i scen 4 är ritade efter avsnitt 3.1 till 3.4 och går att lösa av den som pausar bilden. Svarsalternativen är de i banken, inte påhittade.
3. Tidsraden i scen 2 fylls och räknar upp, klockringen i scen 4 töms och räknar i minuter. Inga andra klockor.
4. Resultat- och nivåtalen står som gränssnitt, aldrig i textraderna.
5. Personlighetsscenen har inga tal och ingen färgskillnad mellan staplarna.
6. Ingenting i avsnitt 6 förekommer. Grep på storyboardens textlager: inga tankstreck, inga engelska gränssnittsord, inga belopp, inga leverantörsnamn, inga paketnamn.
7. Slutbilden har exakt landningssidans knapptext.
8. Nivån, kurvan, provdatum och dagens pass visas som produkten ritar dem (`Nivaskala`, `Kurva`, `Hemvy`), med produktens etiketter.
9. Videon är begriplig med ljudet av, kontrollerat genom att någon som inte läst briefen ser den utan ljud och återger den enda saken i avsnitt 1 med egna ord.
10. Storyboarden levereras som artefakt med alla scener som stillbilder i 16:9 med säkerhetszonen 4:5 markerad, för ägarens godkännande före produktion.
