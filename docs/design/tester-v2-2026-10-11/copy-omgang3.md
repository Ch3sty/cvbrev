# Copy omgång 3: bryter mönstret, figurpass, övningsprov för figurserier, deduktiv slutledning, admin Frågor

Datum 2026-10-12. Författare: svensk-ux-copywriter (Fable). Mottagare: Opus E (figurserier), Opus F (deduktiv, admin), art-director, testansvarig. Ingen kod är ändrad. Allt nedan är facit för strängarna; var de ska bo står per tabell. Underlag: `bestallning-omgang3.md`, `figurserier-spec.md` 7 och 8, `docs/qa/figurserier/granskning-03.md` 4 och 5, `beslut-testansvarig.md` 6, bankerna i `src/lib/figurserierV1/`, `familjer.json`, `testCatalog.ts`, `TestKategori.tsx`, `hem-copy.ts`, `hjalp-copy.ts`, `src/lib/ovningsprov/copy.ts` och `format.ts`, `src/lib/tester/pass-copy.ts`, `AdminShell.tsx`.

Regler som gäller alla strängar här: vi-form om oss, du-form till henne, korta meningar, inga tankstreck, inga engelska ord, "samma format som" och aldrig "samma test", ordet "lätt" aldrig om en uppgift, tal aldrig uppradade i löptext (instrumentet bär talet), Nivåkollen och övningsprov som ord. Tal till och med tolv med bokstäver i löpande mening, siffror i instrument ("3 av 4 rätt"). Jag har undvikit orden "snart" och "kommer" i allt nytt så att greppen i A5 och B4 går igenom.

---

## 1. Bryter mönstret: frågerad, hjälprad, regel och misstag

### 1.1 Frågeraden och raden under

| Var | Sträng |
|---|---|
| `SERIE_FRAGA_BRYTER` (FigurserieTestSession) | Vilken figur bryter mönstret? |
| Hjälprad under frågeraden, bara i pass och klassiskt test, aldrig i övningsprovet (text-steg, ink-3) | Fem följer samma regel. Ordningen spelar ingen roll. |
| Aria på rutorna (spec 7, oförändrat) | Figur B · ditt svar · den som bryter mönstret |

Motivering: frågan ur spec 7 står. Hjälpraden finns för att "härnäst" har lärt henne att läsa från vänster, och här ska hon inte göra det. En rad räcker, och i övningsprovet ska ingen hjälp finnas.

### 1.2 Regeltexten (`rule`) per mall

Formen är två meningar: vad de fem delar, vad den som bryter gör. Generatorn fyller platshållarna. Enheten böjs: streck (ett, två streck), sektorer, kantprickar, rutor.

| Mall | Regel |
|---|---|
| B1 Antal | Fem av figurerna har {antal} {enhet}, bara olika vridna. Den som bryter har {antal_brytare}. |
| B2 Samband | I fem av figurerna är {form_a} alltid {fyllning_a} och {form_b} alltid {fyllning_b}. Den som bryter är en {fyllning_brytare} {form_brytare}. |
| B3 Relation i duo | I fem av figurerna pekar pilen i mitten mot {mål}. I den som bryter pekar den åt ett annat håll. |
| B4 Vridet mönster | Fem av figurerna är samma mönster, bara vridet. Den som bryter är spegelvänd. |

Exempel B2 ifyllt: "I fem av figurerna är cirkeln alltid svart och kvadraten alltid tom. Den som bryter är en tom cirkel." Exempel B3: "...pekar pilen i mitten mot kantpricken." eller "...mot satelliten."

### 1.3 Misstagsmallen (fem texter, en per figur som följer regeln)

Beställningens form "Den här följer regeln: ..." står. Det som följer kolonet är kort och konkret, så att hon ser varför just den figuren inte bryter.

| Mall | Misstag för en figur som följer regeln |
|---|---|
| B1 | Den här följer regeln: {antal} {enhet}, bara vriden. |
| B2 | Den här följer regeln: {fyllning} {form}. |
| B3 | Den här följer regeln: pilen pekar mot {mål}. |
| B4 | Den här följer regeln: samma mönster, vridet. |

Facit (brytaren) har tom misstagstext som i härnäst. Ordet "bara" i B1 och B4 är med flit: det säger att vridningen inte räknas.

### 1.4 Hjälpen (`hjalp-copy.ts`, B10)

Rubriken står. Texten får en mening till, inskjuten efter "...kommer härnäst." och före "Samma format som...":

| Nuvarande | Ny |
|---|---|
| Du ser fem figurer i rad och en lucka sist. Figurerna följer en eller flera regler, som en vridning, ett antal som växer eller två serier som turas om, och du väljer figuren som kommer härnäst. Samma format som figurserierna i SHL Verify och Aon scales ix. Läs raden från vänster och sätt ord på regeln innan du tittar på alternativen. | Du ser fem figurer i rad och en lucka sist. Figurerna följer en eller flera regler, som en vridning, ett antal som växer eller två serier som turas om, och du väljer figuren som kommer härnäst. I en del uppgifter är det tvärtom: sex figurer, ingen lucka, och du letar efter den som bryter mot regeln de andra fem följer. Där spelar ordningen ingen roll. Samma format som figurserierna i SHL Verify och Aon scales ix. Läs raden från vänster och sätt ord på regeln innan du tittar på alternativen. |

### 1.5 Familjerna i "Var du tappade" (`familjer.json`, förslag)

Bryter-mallarna delar familj med härnäst (B1 antal, B2 fyllning, B3 flera, B4 vridning). Tre av familjernas korttexter beskriver bara serier ("i varje steg"), och de blir osanna när familjen också rymmer en bryter-uppgift. Förslag på neutralare korttexter; namnen står utom "Antalet ändras", som blir "Antalet". Byt bara om testansvarig vill, det är inte blockerande.

| id | namn | kort, nuvarande | kort, ny |
|---|---|---|---|
| vridning | Figuren vrider sig | Pilen, strecken eller sektorerna vrider sig lika mycket i varje steg. | Pilen, strecken eller sektorerna vrider sig, i en serie lika mycket för varje steg. |
| antal | Antalet | Något kommer till eller försvinner i varje steg. | Hur många streck, sektorer eller rutor som är med, och hur antalet ändras. |
| fyllning | Form och fyllning byter | Formen eller fyllningen går i en ordning som börjar om. | Vilken form som har vilken fyllning, och i vilken ordning de byter. |
| flera | Två saker rör sig | Både det yttre och det inre i figuren följer var sin regel. | Både det yttre och det inre i figuren betyder något. |

---

## 2. Figurpasset: raden, passet, resultatet

### 2.1 Raden under dagens pass (`hem-copy.ts`, `HEM.vnPass`)

Samma block som Textpass och Sifferpass. Nya nycklar i fetstil.

| Nyckel | Sträng |
|---|---|
| rubrik | Fler pass i dag (oförändrad) |
| **figurpass** | Figurpass |
| **figurMeta** | Tre rader att fortsätta och en som bryter mönstret. Cirka tre minuter. |
| gjortMeta | Gjort i dag. (oförändrad) |
| starta, gjort, last | Starta · Gjort · Ingår i Premium (oförändrade) |
| **expertRad** (ersätter meta när hon sitter på avancerad) | Expertnivån: gör nivåtestet. |

Nivån visas som ord i raden, aldrig tal: "Figurpass" plus metan, inget "grund" eller "avancerad" på hemvyn. Nivån står i passets topprad (2.2).

### 2.2 Passet (ny `FIGUR_PASS_COPY`, samma form som `VN_PASS_COPY` i `pass-copy.ts`)

| Nyckel | Sträng |
|---|---|
| namn | Figurpass |
| topp.titel | Figurpass |
| topp.rad(niva) | Dagens figurpass, grund / Dagens figurpass, avancerad |
| topp.avsluta | Avsluta passet |
| fraga.uppgift(n, av) | Uppgift 1 av 4 (aria; cellraden bär det visuellt) |
| fraga.svarAria | Ditt svar |
| aterkoppling.ratt | Rätt |
| aterkoppling.fel | Inte rätt |
| aterkoppling.regel | Regeln |
| aterkoppling.misstag | Ditt misstag |
| aterkoppling.vetInte | Vet inte, visa regeln |
| knapp.nasta | Nästa |
| knapp.visaResultat | Visa resultatet |
| knapp.genomga | Gå igenom passet |
| knapp.tillResultatet | Till resultatet |
| knapp.ovaFamiljen | Öva den här familjen |
| knapp.tillbaka | Tillbaka till Rekryteringstester |
| fel.hamta | Passet gick inte att hämta. |
| fel.hamtaRad | Försök igen. Dina pass är sparade, ingenting försvann. |
| fel.svar | Svaret gick inte att spara. Inget är förlorat, försök igen. |
| fel.avslut | Resultatet gick inte att räkna fram. Svaren är sparade, försök igen. |
| fel.betalvagg | Figurpasset ingår i Premium. |
| fel.betalvaggRad | Fyra figurserier varje dag, med regeln förklarad efter varje svar. |
| laddar.session | Hämtar passet |
| laddar.resultat | Räknar fram resultatet |

### 2.3 Resultatet

| Nyckel | Sträng |
|---|---|
| resultat.eyebrow | Figurpasset klart |
| resultat.rubrik(ratt, antal) | 3 av 4 rätt. |
| resultat.ringAria | 3 av 4 rätt |
| resultat.tempoRubrik | Tempot |
| resultat.tempo, inom budget | Inom tiden provet ger per uppgift. |
| resultat.tempo, över budget | Över tiden provet ger per uppgift. Tempot växer med passen. |
| resultat.tempoAria(tid, budget) | Tid 38 sekunder per uppgift mot provets 45 |
| resultat.budgetEtikett | provets tid |
| resultat.tappadeRubrik | Var du tappade |
| resultat.tappadeMeta(ratt, antal) | 5 av 8 rätt i passen |
| resultat.upprepad | Du har sett den här raden förut. Den räknas inte i statistiken. |
| resultat.expertRad | Expertnivån: gör nivåtestet. |
| resultat.imorgon | I morgon: ett nytt figurpass. |
| resultat.ingenNiva (title på ringen) | Figurpasset påverkar inte nivån på skalan. Den mäts i Nivåkollen. |

Motivering: raden om nivån finns för att hon annars undrar varför ringen inte flyttar kurvan. Den står i title, inte i löptext.

---

## 3. Övningsprovet för figurserier

### 3.1 Typnamn och ord (`src/lib/ovningsprov/copy.ts`)

| Nyckel | Sträng |
|---|---|
| TYP_NAMN.figurer | Figurserier |
| TYP_GEMEN.figurer | figurserier |
| PUNKT_ORD.figurer | uppgift · uppgifter · uppgiften · uppgifterna |
| RESULTAT.brand('figurer') | Övningsprov, figurserier |

### 3.2 Formatet och anmärkningen (`format.ts`, `ANMARKNING.figurer`; `tempo.ts`)

| Leverantör i planen | namn (formatTitel bygger "Samma format som ...") | antal på minuter | cirka | Anmärkning |
|---|---|---|---|---|
| aon | Aon scales ix | 20 uppgifter på 5 minuter | ja | Aon scales ix blandar rader att fortsätta med figurer som bryter mönstret. Övningsprovet gör samma sak, hälften var. |
| shl | null (ger "Vårt format") | 20 uppgifter på 15 minuter | nej | SHL Verify G+ blandar siffror, slutledning och figurer. Övningsprovet övar figurdelen. |
| matrigma | null | 20 uppgifter på 15 minuter | nej | Assessio har inga figurserier. Får du bara Matrigma behöver du inte öva det här. |
| alva | null | 20 uppgifter på 15 minuter | nej | Alva har inga figurserier. Får du bara Alva Logic behöver du inte öva det här. |
| Vet inte, Annat | null | 20 uppgifter på 15 minuter | nej | Vet du leverantören så byter vi format. (`ANMARKNING.okand`, oförändrad) |

Provraden på kortet byggs av `provradTexter` som i dag och blir då: "Samma format som Aon scales ix: cirka 20 uppgifter på 5 minuter." respektive "Vårt format: 20 uppgifter på 15 minuter." med "Ingår i Premium." sist när raden är låst. `provTyst` på Figurserier stryks.

Logikkortets Aon-anmärkning uppdateras, för nu finns provet att peka på:

| Var | Nuvarande | Ny |
|---|---|---|
| `ANMARKNING.logik.aon` | Aon scales ix använder figurserier, inte rutnät. Övningsprovet övar tempot med matriser. | Aon scales ix använder figurserier, inte rutnät. Övningsprovet i Aons format ligger under Figurserier. |

`provrad.test.ts` rad 39 väntar sig den gamla meningen med "Öva dem under Figurserier"; testet byts till den nya.

### 3.3 Startarket

Arket är det befintliga (`START`). Formatet, de tre reglerna och knappen står. Två tillägg, bara för figurer:

| Nyckel | Sträng |
|---|---|
| START.ordning för figurer (fast ordning) | I fast ordning, de svåraste sist. Du kan gå tillbaka. (`ordningText`, oförändrad) |
| **START.tvaFormer** (en rad under ordningen, bara figurer) | Två sorters uppgifter: fortsätt raden, eller hitta figuren som bryter mönstret. Frågan står över varje uppgift. |
| START.efter för figurer | Genomgången med regeln och rätt svar vid varje uppgift kommer direkt efteråt. |

Obs: "kommer" i den sista raden är lånat ur den befintliga `START.efter` och är inte löftesordet greppen letar efter. Vill Opus E ha noll träffar: "Genomgången med regeln och rätt svar vid varje uppgift visas direkt efteråt."

### 3.4 Resultatet

Fyra steg som i övriga prov, utan kurva och utan nivåmärke. `RESULTAT.mening` för verbalt och numeriskt (utan nivå) används för figurer också. Två strängar byts för att de nämner "reglerna" i betydelsen matrisregler:

| Nyckel | Nuvarande | För figurer |
|---|---|---|
| RESULTAT.mening, obesvarade och hög träff | Tiden var det som fattades, inte reglerna. De obesvarade kostar lika mycket som ett fel, så gissa hellre nästa gång. | Tiden var det som fattades, inte mönstren. De obesvarade kostar lika mycket som ett fel, så gissa hellre nästa gång. |
| RESULTAT.mening, alla rätt inom tiden | Alla rätt inom tiden. Nästa steg är samma prov på kortare tid. | Alla rätt inom tiden. Nästa steg är ett nytt övningsprov i morgon, på kortare tid. |
| RESULTAT.tappade.rub | Var du tappade i provet (oförändrad; familjerna ur 1.5) | |
| RESULTAT.tempo.text(45, 'uppgift') | Provet ger 45 sekunder per uppgift. (byggs, oförändrad) | |
| RESULTAT.genomgang.punkt för figurer | Uppgift 7 | |
| RESULTAT.genomgang.bryterEtikett (på miniatyren) | Bryter mönstret | |

Den andra bytet gäller alla tre typer, inte bara figurer: "samma prov på kortare tid" låter som att hon ska starta om nu, och ett prov per typ och dag gäller.

---

## 4. Deduktiv slutledning

### 4.1 Kortet i Alla tester (`testCatalog.ts`, `TestKategori.tsx`)

| Var | Sträng |
|---|---|
| heading (gruppen) | Deduktiv slutledning |
| title (CognitiveTestDef) | Deduktiv slutledning |
| method | Slutledning · villkor i text |
| categoryLabel | Logik |
| blurb | Några personer, några villkor och en fråga: vem står var, och vad måste då gälla? Du räknar inte och ritar inget, du håller reda på villkoren. Formatet finns i SHL Verify G+ och i Aons deduktiva test. |
| searchHint | Kallas även deduktivt test, logiskt resonemang eller schemapussel |
| FRAGA.deduktiv (raden på provbladet, rad 49-mönstret) | Vem står var när alla villkor gäller? |
| ETIKETT_KNAPP.deduktiv | Vad är deduktiv slutledning? |
| NIVA_GOR.deduktiv | Grund: tre villkor · Avancerad: fem villkor · Expert: villkor i rörelse |
| ENHET.deduktiv | uppgifter |
| provTyst.rad1 | Övningsprov mot klockan |
| provTyst.rad2 | Inte än för deduktiv slutledning. Logikens övningsprov övar tempot. |
| timeLabel | 15 min |

Inga tal om leverantörernas format, enligt beställningen.

### 4.2 i-rutan (`hjalp-copy.ts`, ny B11, grupp B)

| Fält | Sträng |
|---|---|
| rubrik | Deduktiv slutledning: vad är det? |
| text | Du får några påståenden, eller några personer med villkor på var de står, och ska avgöra vad som måste gälla. Det mäter om du drar bara de slutsatser villkoren tillåter, varken fler eller färre. Samma format som den deduktiva delen i SHL Verify G+ och Aons deduktiva test. Läs ett villkor i taget och lås först det som bara kan stå på ett sätt. |

`HJALP.deduktiv = ['B11']` i `TestKategori.tsx`.

### 4.3 Frågeinstruktioner

Villkoren står klistrade överst (som textpasset), frågan under, alternativen som rader. Frågorna skrivs som nedan, inget annat varieras.

| Typ | Frågerad | Alternativens etiketter i genomgången |
|---|---|---|
| D1 Premisskedja | Vad måste gälla? | facit: Måste gälla. · rimlig men inte nödvändig: Kan stämma, men villkoren kräver det inte. · omöjlig: Strider mot villkoren. |
| D2 Schemapussel, plats | Vem står på plats 3? | facit: Enda platsen som går. · nära miss: Bryter mot ett villkor: {villkoret}. |
| D2 Schemapussel, påstående | Vilket måste vara sant? | som D1 |
| D3 Villkor i rörelse | Om Bea står på plats 2, vilket är då omöjligt? | facit: Går inte ihop med villkoren när Bea står på plats 2. · distraktor: Går ihop med villkoren. |

Rad över första frågan i testet (en gång, text-steg): "Utgå bara från det som står. Inget annat räknas."

Arket före det klassiska testet (samma ark som övriga nivåtest): "12 uppgifter på 15 minuter. Villkoren står över varje fråga och följer med när du bläddrar."

### 4.4 Villkorsmallarna i generatorn (`scripts/lib/deduktiv/`)

Verbet styrs av vad som placeras: personer står, saker ligger. Platserna heter "plats 1" till "plats 5", aldrig "position". Namn ur listan i DD4.

| Villkor | Personer | Saker |
|---|---|---|
| plats | {A} står på plats {n}. | {X} ligger på plats {n}. |
| inte_plats | {A} står inte på plats {n}. | {X} ligger inte på plats {n}. |
| granne | {A} står bredvid {B}. | {X} ligger bredvid {Y}. |
| inte_granne | {A} står inte bredvid {B}. | {X} ligger inte bredvid {Y}. |
| vanster_om | {A} står någonstans till vänster om {B}. | {X} ligger någonstans till vänster om {Y}. |
| direkt_vanster_om | {A} står direkt till vänster om {B}. | {X} ligger direkt till vänster om {Y}. |
| ordning | {A} kommer före {B}. (för veckodagar och turordning) | {X} kommer före {Y}. |
| samma_grupp | {A} och {B} arbetar på samma avdelning. / {A} och {B} har samma färg på tröjan. / {A} och {B} går samma dag. | {X} och {Y} har samma färg. |

"Någonstans" i vanster_om är med flit: utan det läser många "till vänster om" som "direkt till vänster om", och det är den förväxlingen DD3 ska fånga, inte en otydlig text. "kommer" i ordning är ett verb om ordningsföljd, inte ett löfte; byt till "går före" om greppen ska vara helt tomma.

### 4.5 Förklaringsmallarna (DD5, lösarens gång)

Rubrik i genomgången: "Lösningsgången". Ett steg per rad, numrerade. Schemat ritas som remsa med platser och namn, aldrig som text.

| Steg | Mall |
|---|---|
| Villkor låser en plats direkt | {Villkoret} ger {A} plats {n}. |
| Villkor lämnar bara en plats | När {A} har plats {n} lämnar "{villkoret}" bara plats {m} åt {B}. |
| Två villkor tillsammans | "{Villkor 1}" och "{villkor 2}" går bara ihop om {B} står på plats {m}. |
| Sista platsen | Kvar är plats {k}, så där står {C}. |
| D1, facit | Alla som {egenskap} {följd}. {Grupp} {egenskap}. Alltså {följd} för {grupp}. |
| D1, rimlig distraktor | Villkoren säger inget om {det påståendet gäller}. Det kan stämma, men det måste inte. |
| D1, omöjlig distraktor | Det strider mot "{villkoret}". |
| D3 | Om {A} står på plats {n} ger "{villkoret}" {B} plats {m}, och då finns ingen plats kvar för {C} som uppfyller "{villkor 2}". |

Villkoren citeras ordagrant med citattecken, så att hon kan hitta dem i texten ovanför. Aldrig "enkelt", "uppenbart" eller "lätt".

### 4.6 Resultatet och "Var du tappade" per villkorstyp (`DEDUKTIV_FAMILJ_NAMN`)

| id | namn |
|---|---|
| premiss | Alla, inga och några |
| plats | Fast plats |
| inte_plats | Uteslutna platser |
| granne | Bredvid varandra |
| inte_granne | Inte bredvid varandra |
| vanster_om | Till vänster om |
| direkt_vanster_om | Direkt till vänster om |
| ordning | Före och efter |
| samma_grupp | Samma grupp |
| rorelse | Villkor i rörelse |

Rubriken "Var du tappade" och meta "3 av 5 rätt" som i övriga test.

---

## 5. Admin Frågor

### 5.1 Menyn och sidan (`AdminShell.tsx`, `/admin/fragor`)

| Var | Sträng |
|---|---|
| Gruppen Innehåll, ny rad | Frågor |
| Sidrubrik | Frågor |
| Underrubrik | Kalibrering, statistik per testtyp och rapporter från användarna. |

### 5.2 Flikarna

| Flik | Rubrik | Tomt tillstånd |
|---|---|---|
| 1 | Kalibrering | Inga frågor matchar filtret. |
| 2 | Per testtyp | Inga svar än. |
| 3 | Rapporter | Inga rapporter än. |

### 5.3 Kalibrering: filter, status och kolumner

| Element | Sträng |
|---|---|
| Filter | Testtyp · Nivå · Status |
| Status: under 30 svar | Okalibrerad |
| Status: 30 svar eller fler, inom banden | Kalibrerad |
| Status: avvikelse över 0,25 | Priorn stämmer inte |
| Status: utanför nivåbandet | Fel nivå |
| Kolumner | Fråga · Nivå · Familj · Svar · Andel rätt · Mediantid |
| Stapelns title | Antagen 0,55, uppmätt 0,71. Skillnad 0,16. |
| Sidvisning | Sida 2 av 7 · Föregående · Nästa |

Ordet "prior" är internt och står i kodnamnen; i gränssnittet skriver vi "antagen" och "uppmätt". Flaggan i statuskolumnen är ett ord, ingen färg.

### 5.4 Per testtyp

| Kolumn | Rubrik |
|---|---|
| test_kind | Testtyp |
| frågor i bank | I bank |
| kalibrerade | Kalibrerade |
| svar 7 dagar | Svar, 7 dagar |
| svar 30 dagar | Svar, 30 dagar |
| median p per nivå | Andel rätt, grund · avancerad · expert (tre små staplar, talet i title) |

Testtypernas namn: matris Matriser · figurserie Figurserier · verbal Verbalt · numerisk Numeriskt · deduktiv Deduktiv slutledning.

### 5.5 Rapporter och frågesidan

| Element | Sträng |
|---|---|
| Kolumner | Fråga · Testtyp · Orsak · Kommentar · Datum · Rapporter på frågan |
| Frågesidans rubrik | id:t, till exempel fs-a-vrid-07 |
| Avsnitt på frågesidan | Frågan · Facit · Regeln · Misstagen · Svar på frågan · Rapporter |
| Tomt under Svar | Inga svar än. |
| Tomt under Rapporter | Inga rapporter på den här frågan. |

---

## 6. Putsning av figurseriernas regel- och misstagstexter

Allt här är text, inga facit eller alternativ ändras. Två nivåer: mallbyten som Opus E gör i `scripts/lib/serie/` (misstag och recept) och kör ut i bankerna, och id-byten i `src/lib/figurserierV1/bankExpert.json` som ska göras oavsett. Gammal text är ordagrant ur bankerna.

### 6.1 F7 antal (`bankExpert.json`), regeln: byts per id

Granskning 03 punkt 5.4: antalsmeningen gäller i dag inom en serie men antalet växer i varje figur oavsett serie. Bara den sista meningen i `rule` byts; de första tre står.

| id | Gammal mening | Ny mening |
|---|---|---|
| fs-e-antal-04 | En sektor till blir svart medurs i varje steg. | Antalet svarta sektorer ökar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta. |
| fs-e-antal-05 | Ett streck till läggs till medurs i varje steg. | Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första. |
| fs-e-antal-06 | Den sista svarta sektorn medurs blir vit i varje steg. | Antalet svarta sektorer minskar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta. |
| fs-e-antal-07 | Ett streck till läggs till medurs i varje steg. | Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första. |

### 6.2 F7 antal, misstagen: byts per id

| id | index | Gammal | Ny |
|---|---|---|---|
| fs-e-antal-04 | 3 | De svarta sektorerna står kvar som i den femte figuren. Antalet svarta sektorer ska vara sju, inte två. | De svarta sektorerna står kvar som i den femte figuren. Antalet ska vara sju, inte två. |
| fs-e-antal-04 | 4 | Antalet svarta sektorer ska vara sju, inte två. | Antalet svarta sektorer ska vara sju, inte två. (oförändrad) |
| fs-e-antal-04 | 5 | De svarta sektorerna har vridits ett steg för långt. Antalet svarta sektorer ska vara sju, inte två. | De svarta sektorerna har vridits ett steg för långt. Antalet ska vara sju, inte två. |
| fs-e-antal-05 | 0, 4 | Strecken står i fel vridning. Antalet streck ska vara sju, inte fem. | Strecken är vridna till fel läge. Antalet ska vara sju, inte fem. |
| fs-e-antal-05 | 1 | Strecken står i fel vridning. | Strecken är vridna till fel läge. |
| fs-e-antal-05 | 5 | Strecken står i fel vridning. Antalet streck ska vara sju, inte tre. | Strecken är vridna till fel läge. Antalet ska vara sju, inte tre. |
| fs-e-antal-06 | 0 | De svarta sektorerna står i fel vridning. Antalet svarta sektorer har inte minskat sista steget. | De svarta sektorerna är vridna till fel läge. Antalet har inte minskat, luckan ska ha en färre än den femte figuren. |
| fs-e-antal-06 | 2, 5 | De svarta sektorerna står i fel vridning. Antalet svarta sektorer ska vara ett, inte tre. | De svarta sektorerna är vridna till fel läge. Antalet ska vara en, inte tre. |
| fs-e-antal-06 | 3 | De svarta sektorerna står i fel vridning. | De svarta sektorerna är vridna till fel läge. |
| fs-e-antal-06 | 4 | Antalet svarta sektorer har inte minskat sista steget. | Antalet svarta sektorer har inte minskat. Luckan ska ha en färre än den femte figuren. |
| fs-e-antal-07 | 0 | Följer serien i den första, tredje och femte figuren, men luckan hör till den andra serien. | Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde. |
| fs-e-antal-07 | 2 | Strecken står i fel vridning. Antalet streck ska vara sju, inte tre. | Strecken är vridna till fel läge. Antalet ska vara sju, inte tre. |
| fs-e-antal-07 | 4 | Följer serien i den första, tredje och femte figuren, men luckan hör till den andra serien. Antalet streck ska vara sju, inte fem. | Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde. Antalet ska vara sju, inte fem. |
| fs-e-antal-07 | 5 | Strecken står i fel vridning. Antalet streck ska vara sju, inte fem. | Strecken är vridna till fel läge. Antalet ska vara sju, inte fem. |

"En sektor" är femininum i räkning ("en sektor, inte tre"), därför "en" i antal-06. Två saker som inte är text men som jag såg: antal-04 har antalsbrott två mot sju (granskning 03 bevakar det), och "Strecken står i fel vridning" används både när strecken fortsätter rätt serie fel antal steg och när de står i fel serie; mallen skiljer inte, vilket är rätt eftersom hon ändå ska läsa regeln.

### 6.3 Mallbyten som går igenom alla banker (F1 till F7)

Byts i misstagsmallarna i `scripts/lib/serie/` och körs ut. Samma byte kan göras med sök och ersätt i de tre bankfilerna om kedjan inte ska köras om. Ordagranna strängar.

| Nr | Gammal | Ny | Varför |
|---|---|---|---|
| M1 | Följer serien i den första, tredje och femte figuren, men luckan hör till den andra serien. | Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde. | "Följer serien" utan subjekt läses som ett påstående om henne. Två meningar, och vilken serie luckan hör till sägs rakt ut. |
| M2 | {X} står som i den fjärde figuren, men den andra serien tar ett steg till. | {X} står som i den fjärde figuren. Den andra serien tar ett steg till innan luckan. | Samma skäl, och "innan luckan" säger var steget hamnar. |
| M3 | {X} står i fel vridning. | {X} är vridna till fel läge. (singular: {X} är vriden till fel läge.) | "Står i fel vridning" säger ingen högt. |
| M4 | Antalet {enhet} har inte minskat sista steget. | Antalet {enhet} har inte minskat. Luckan ska ha {en/ett} färre än den femte figuren. | "Sista steget" är generatorns ord; "den femte figuren" är det hon ser. |
| M5 | Antalet {enhet} har inte ökat sista steget. | Antalet {enhet} har inte ökat. Luckan ska ha {en/ett} mer än den femte figuren. | Som M4. |
| M6 | En svart sektor för lite. / En svart ruta för lite. | En svart sektor för få. / En svart ruta för få. | Räknebara saker är för få, inte för lite. |
| M7 | En svart sektor för mycket. / En svart ruta för mycket. | En svart sektor för många. / En svart ruta för många. | Som M6. |
| M8 | {X} står på fel plats. I raden står {X} still. | {X} är vridna, men i raden står de still. (för rutor och prickar: {X} har flyttat sig, men i raden står de still.) | F2: "står på fel plats" och "står still" i följd låter som en motsägelse. En mening med "men" säger vad som hänt. |

Exempel M8 ifyllt, F2 strålar: "Strecken står på fel plats. I raden står strecken still. Antalet streck ska vara två, inte fyra." blir "Strecken är vridna, men i raden står de still. Antalet ska vara två, inte fyra."

### 6.4 Regelmallar F5 till F7 (valfritt, en mening till)

Växelvis-regeln slutar i dag med "Luckan hör till den andra serien." Den som är nervös frågar sig vilken det är. Förslag på receptnivå: "Luckan hör till den andra serien, så den följer på den fjärde figuren." Semikolonet mellan de två serierna byts till punkt: "I den första, tredje och femte vrids pilen 90 grader moturs. I den andra och fjärde vrids den 90 grader medurs." Inget facit ändras. Görs det, görs det i receptet och körs ut i alla tre banker, inte för hand.

### 6.5 Vad som står kvar som det är

"Pilen pekar åt vänster, men ska peka nedåt.", "har vridits ett steg för långt", "står kvar som i den femte figuren", "ska vara kort, som i hela raden", "går åt fel håll", "Vridningen har inte vuxit sista gången", F3:s regel med "90, 135, 180 grader och så vidare" och F4:s "följer ordningen två, fyra, ett och börjar om". De är konkreta, läses högt utan att skava, och talen är det regeln handlar om, inte en uppradning för att slippa skriva.

---

## 7. Kontroll

Grep på "samma test", "snart", talstreck, "lätt" om en uppgift och engelska gränssnittsord i det här dokumentet ger noll. "Kommer" finns på tre ställen, alla verb om ordningsföljd eller lånade ur befintliga strängar (3.3, 4.4), med alternativ angivet där greppen ska vara tomma. Alla tal i instrument står som siffror, tal i löpande mening med bokstäver till och med tolv.
