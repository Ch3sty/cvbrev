# Copy, avrundningen av testerna (2026-10-12)

Svensk-ux-copywriterns sista genomläsning av texter som implementatören kortade själv i hemvyn, figurseriernas och den deduktiva slutledningens användarsynliga texter, och räknaren i provskalet. Ingen kod är ändrad; implementatören för in tabellerna.

Regler som gäller alla rader: en rad på mobil (360 px) där raden ligger under en rubrik, naturlig svenska, inga tankstreck, inga engelska ord, inga mittpunkter mellan fakta, tal i löptext som ord. Ordet "mäta" i alla former är borta ur allt som rör Nivåkollen. Orden "familj" och "sikte" är interna och får inte synas för användaren.

## 1. Hemvyn (src/lib/traning/hem-copy.ts)

| Fil | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| hem-copy.ts | `tomt.rad` | Börja med att mäta var du står. Vet du när provet är, så lägger vi upp planen fram till dagen. | Börja med Nivåkollen. Vet du när provet är, så lägger vi upp planen fram till dagen. |
| hem-copy.ts | `ny.rad` | Först kollar vi var du står. | Nivåkollen visar var du står. |
| hem-copy.ts | `ny.planMetaGratis` och `kurva.gratisMeta` | De grå dagarna ingår i Premium. | Grå dagar ingår i Premium. |
| hem-copy.ts | `ny.planMeta` | Ihåliga märken är dagarna som kommer. | Ihåliga märken är kommande dagar. |
| hem-copy.ts | `matning.titel` | Kolla din nivå. Cirka 8 minuter. | Kolla din nivå. Cirka åtta minuter. |
| hem-copy.ts | `matning.text` | Tolv figuruppgifter som följer dina svar. Efteråt vet du din nivå. | Tolv figuruppgifter som anpassar sig efter dina svar. Efteråt vet du din nivå. |
| hem-copy.ts | `matning.smakprovTitel` | Kolla din nivå. Cirka ${m} minuter. | Kolla din nivå. Cirka ${talord(m)} minuter. (talord finns redan i copy.ts) |
| hem-copy.ts | `annatTest.text` | Resultat och genomgång direkt. Testet säger också om passen börjar på grund eller avancerad. | Resultat och genomgång direkt. Testet avgör också om passen börjar på grundnivå eller avancerad nivå. |
| hem-copy.ts | `ommatning.titel` | Kolla din nivå igen. Cirka 8 minuter. | Kolla nivån igen. Cirka åtta minuter. |
| hem-copy.ts | `ommatning.text` | Tolv uppgifter, som första gången. Den visar om passen har flyttat dig. | Tolv uppgifter, som första gången. Du ser om passen har flyttat dig. |
| hem-copy.ts | `ommatning.lastText` | Nya nivåkoller efter den första ingår i Premium. | Första nivåkollen är gratis. Nästa ingår i Premium. |
| hem-copy.ts | `pass.text` | Nio uppgifter på din nivå, ungefär tio minuter. Vi förklarar varje svar. | Nio uppgifter på din nivå, cirka tio minuter. Vi förklarar varje svar. |
| hem-copy.ts | `pass.textGrund` | Nio uppgifter, ungefär tio minuter. Dagens grundpass är gratis. | Nio uppgifter på grundnivå, cirka tio minuter. Gratis i dag. |
| hem-copy.ts | `pass.lastText` (med svagaste) | Nio uppgifter, med extra övning på ${svagaste}. Från dag två ingår passen i Premium. | Nio uppgifter med extra övning på ${svagaste}. Från dag två ingår passen i Premium. |
| hem-copy.ts | `pass.lastText` (utan) | Nio uppgifter på din nivå. Från dag två ingår passen i Premium. | Oförändrad. |
| hem-copy.ts | `tappar.kortPassMeta` | Fem uppgifter, ungefär fem minuter. | Fem uppgifter, cirka fem minuter. |
| hem-copy.ts | `provdag.uppvarmning.titel` | Tre frågor du redan kan, 2 minuter | Tre frågor du redan kan, två minuter |
| hem-copy.ts | `flerTester.figurerEj` | Inte gjort än. Kolla din nivå på 8 minuter. | Inte gjort än. Kolla din nivå på åtta minuter. |

Oförändrat efter granskning: `tomt.boxTitel`, `tomt.boxText`, `pass.lastFot`, `vila`, `klart`, `kurva.*`, `dagsrad.*` ("kollad i dag" är rätt ord), `annatTest.rad`, hela `INGANG`. Knappar med "8 min" och "${m} min" får behålla siffror; en knapp är inte löptext och raden måste rymmas.

"Cirka" är nu det enda ordet för ungefärlig tid i rummet. "Ungefär" utgår.

## 2. Passen och resultaten (src/lib/traning/pass-copy.ts, src/lib/tester/pass-copy.ts)

| Fil | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| traning/pass-copy.ts | `resultat.strackRad` | Två pass i rad med nästan allt rätt. Det här var ett steg svårare. | Två pass i rad med nästan allt rätt, så det här var ett steg svårare. |
| traning/pass-copy.ts | `matning.plan.ommatningMeta` | Åtta minuter. Visar om passen har flyttat dig. | Cirka åtta minuter. Du ser om passen har flyttat dig. |
| tester/pass-copy.ts | `knapp.ovaFamiljen` | Öva den här familjen | Öva den här typen |
| tester/pass-copy.ts | `resultat.expertRad` och `vnPass.expertRad` (hem-copy) | Expertnivån: gör nivåtestet. | Du är på expertnivå. Gör nivåtestet i stället. |
| tester/pass-copy.ts | `resultat.ingenNiva` | Figurpasset påverkar inte nivån på skalan. Den mäts i Nivåkollen. | Figurpasset ändrar inte din nivå. Den sätts i Nivåkollen. |

Sökningen efter "mät", "mätning", "ommätning", "sikte" och "familj" i användarsynlig text i src/lib/traning, src/lib/tester, src/components/traning och src/app/dashboard/tester gav i övrigt bara kodnycklar, kommentarer och testfiler. Kvar med avsikt: "Vad mäter logiktestet?" (TestKategori, PersonlighetKort, GrundForhandsvisning) och "det som mäter problemlösning" (testCatalog, testConfig). Där handlar "mäter" om vad ett rekryteringstest prövar, inte om Nivåkollen, och det är normal svenska i sammanhanget.

## 3. Figurserierna

| Fil | Nyckel/rad | Gammal text | Ny text |
|---|---|---|---|
| figurserierV1/familjer.json | vridning, kort | Pilen, strecken eller sektorerna vrider sig, i en serie lika mycket för varje steg. | Pilen, strecken eller sektorerna vrider sig lika mycket för varje steg. |
| figurserierV1/familjer.json | antal, namn | Antalet | Antalet ändras |
| figurserierV1/familjer.json | vaxelvis, kort | Varannan figur hör till samma serie, och luckan hör till den andra. | Varannan figur följer en serie och varannan en annan. Luckan hör till en av dem. |
| FigurserieTestSession.tsx | rad 366, "Uppgift {n}" vänster om frågan | Uppgift 3 | Tas bort. Räknaren i mätraden bär numret (avsnitt 5). Frågan "Vilken figur kommer härnäst?" står kvar ensam, vänsterställd. |
| FigurserieTestSession.tsx | ConfirmDialog description | Du har besvarat 7 av 15 uppgifter. När du avslutar rättas testet och du får din genomgång direkt. Svaren kan inte ändras efteråt. | Du har svarat på ${talord(n)} av ${talord(total)} uppgifter. När du lämnar in rättas testet och du får genomgången direkt. Svaren går inte att ändra efteråt. |
| FigurserieTestSession.tsx | ConfirmDialog title och confirmLabel | Avsluta testet? / Avsluta och se resultat | Lämna in testet? / Lämna in och se resultatet (knappen i foten heter redan Lämna in) |
| FigurserieReview.tsx | Regelpanel rad | Rätt · 0:48 / Inte den här · 0:52 | Rätt, 0:48 / Inte den här, 0:52 |
| FigurserieReview.tsx | listradens högra kolumn | Hoppad | Inget svar (och metaraden "Inte besvarad" under titeln tas bort, så det inte står två gånger) |

Oförändrat: övriga namn och korttexter i familjer.json, `SERIE_FRAGA`, aria-texterna i FigurserieRad, testConfig-raderna för figurserier.

## 4. Deduktiv slutledning

| Fil | Nyckel/rad | Gammal text | Ny text |
|---|---|---|---|
| deduktivV1/familjer.ts | `inte_plats` | Uteslutna platser | Utesluten plats |
| deduktivV1/familjer.ts | `rorelse` | Villkor i rörelse | Oförändrad (matchar testConfig). |
| DeduktivFraga.tsx | `Fragerad`, eyebrow | Uppgift 3 av 12 | Under testet tas raden bort; mätraden bär numret. I genomgången har listraden redan numret, så eyebrowen blir `sr-only` med samma text för skärmläsare. |
| DeduktivReview.tsx | `utfallRad` | Rätt · 0:48 / Inte den här · 0:52 | Rätt, 0:48 / Inte den här, 0:52 |
| DeduktivReview.tsx | listradens högra kolumn | Hoppad | Inget svar (metaraden "Inte besvarad" tas bort, som i figurserierna) |
| DeduktivTestSession.tsx | ConfirmDialog description | Du har besvarat 7 av 12 uppgifter. När du avslutar rättas testet och du får lösningsgången direkt. Svaren kan inte ändras efteråt. | Du har svarat på ${talord(n)} av ${talord(total)} uppgifter. När du lämnar in rättas testet och du får lösningsgången direkt. Svaren går inte att ändra efteråt. |
| DeduktivTestSession.tsx | ConfirmDialog title och confirmLabel | Avsluta testet? / Avsluta och se resultat | Lämna in testet? / Lämna in och se resultatet |
| testConfig.ts | deduktiv-avancerad, levelBlurb | Fem personer eller saker och fyra till fem villkor. Inget villkor räcker ensamt; du behöver hålla flera i huvudet samtidigt. | Fem personer eller saker och fyra till fem villkor. Inget villkor räcker ensamt, du behöver hålla flera i huvudet samtidigt. |

Oförändrat: `DEDUKTIV_FORSTA_RAD`, Villkorskortets rubriker Villkor och Premisser (spec), "Två namn i en ruta betyder att båda är möjliga.", "Ditt svar, B", aria-texterna i Remsa och Markor, "Lösningen", felmeddelandena vid laddning och sparning, övriga testConfig-rader.

Mittpunkten i utfallsraden står också i `DeduktivLosningProps.utfall`-kommentaren; byt kommentaren när texten byts.

## 5. Räknaren i mätraden (TestMeterRow i TestFlowShell)

Beslut: den delade räknaren behålls. Mätraden är ett instrument med klocka, räknare och besvarade i tabellsiffror, inte löptext, och den ser likadan ut i alla tester. Två ändringar:

| Fil | Rad | Gammal text | Ny text |
|---|---|---|---|
| DeduktivTestSession.tsx och FigurserieTestSession.tsx | `<TestMeterRow ... />` | Fråga 3 / 12 | Uppgift 3 / 12 (skicka `counterLabel="Uppgift"`; båda testerna säger "uppgift" i allt annat) |
| TestMeterRow.tsx | räknarens `<p>` | ingen aria | `aria-label="Uppgift 3 av 12"` på p-elementet, så skärmläsaren inte läser snedstrecket |

Med räknaren i mätraden försvinner dubbleringen i uppgiftsytan (avsnitt 3 och 4). Numret står då på ett ställe under testet, och den tunna framstegslinjen under mätraden visar hur långt det är kvar.

## 6. Lyftkortet i 1c (inför provet), titeln på högst två rader

Källan är inte hem-copy.ts utan src/lib/traning/hemvy.ts, ramen 1c, lyftkortets `titel`, som sätter ihop `r.titel` och `r.antalTid` ur `provrad()` i rubrik.ts med kolon.

| Fil | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| hemvy.ts (1c) | `lyft.titel` | `${r.titel}: ${r.antalTid}` ("Samma format som Matrigma: cirka 35 uppgifter på 40 minuter") | `r.titel` ("Samma format som Matrigma", "Samma format som Alva Logic", "Samma format som SHL Verify", "Samma format som Aon scales (cut-e)", "Vårt eget format") |
| hemvy.ts (1c) | `lyft.text` | `[r.anmarkning, text2/text1/lastText]` | `[versal(r.antalTid) + '.', r.anmarkning, text2/text1/lastText]` ("Cirka 35 uppgifter på 40 minuter. Som på riktigt: ingen förklaring förrän efteråt och ingen paus. ...") |

Titeln är då högst 35 tecken (Aon), två rader i display-snittet på 360, oftast en. Antal och tid står först i metaraden, där siffror är fakta och inte löptext. Kolonet i titeln försvinner samtidigt.

## 7. Att kontrollera efter införandet

- Raderna under rubriken i 1a och kurvmetan ryms på en rad vid 360 px.
- `talord` i src/lib/traning/copy.ts stannar i dag vid tio och ger siffror över det. Fyll på listan till och med tjugo (elva, tolv, tretton, fjorton, femton, sexton, sjutton, arton, nitton, tjugo), så blir "tolv av femton" ord i bekräftelserutan och i `smakprovTitel`. Rutan skrivs med talord från hem-copyns import.
- Testerna i src/components/tests/serie/__tests__ som söker "Uppgift" i uppgiftsytan uppdateras till mätraden.
