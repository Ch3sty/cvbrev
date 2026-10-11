# Riktlinjer: Tester v2. Övningsprov mot klockan på alla testtyper, svårare, fler, återkomst, tydligare

Datum 2026-10-11. Författare: testansvarig. Mottagare: art-director (skisser i artefakt för ägarens godkännande), saas-lead, byggagenterna (Opus) efter godkännande. Ingen kod är ändrad. Underlag: `docs/rapporter/analys-utveckling-2026-10-10.md`, `docs/design/spec-rummen-2026-10-10.md` (särskilt 14, 15, 17 och 19.6), `docs/design/brief-testvy-2026-10-10.md`, `docs/design/granskning-formkurvan-2026-10-10.md` avsnitt 13, `docs/design/tester-lyft-2026-10-11/beslut-*.md`, och koden i `src/app/dashboard/tester/`, `src/components/tests/`, `src/components/traning/`, `src/lib/traning/`, `src/lib/logicTestV7/`, `src/lib/verbalTest*/`, `src/lib/numericalTest*/`. Inga nya siffror är hämtade.

Ordregel i hela dokumentet och i allt som byggs efter det: det heter **övningsprov** eller **Övningsprov mot klockan**. Orden generalrepetition, provläge och provläget försvinner ur gränssnittet, hjälpen, mejlen och copyn. Kodnamnen står kvar (`typ=general`, `test_exam_mode`, `matrislogik-general`, händelsen `generalrepetition_klar`) så att inget historiskt bryts.

Sifferregeln (ägarens): i gränssnittet radas tal aldrig upp i löptext. Ett huvudtal eller en liten visualisering bär budskapet, resten står i title, aria-label eller detaljvy. Tabellerna i det här dokumentet är underlag för byggaren, inte copy.

---

## 0. Vad datan säger och vad jag gissar

Data (rapporten 10 oktober och briefens avsnitt 0, små volymer):
- Medianen är 13 till 14 rätt av 15 på alla tre matrisnivåer. Expert skiljer inte ut sig.
- Grundtestet är klart på fem minuter. Båda veckoköparna sade upp inom tre timmar efter att ha klarat expert.
- Konton med testaktivitet en enda dag: 42 av 51. Dag 2-återkomst 2 av 37.
- Verbalt grund tar 22 minuter, numeriskt 45, och hälften eller fler lämnar på vägen.

Gissning, inte data: användarna slutar därför att produkten tar slut, inte för att den är dålig. Det finns inget ogjort kvar när dagen är över, ingen klocka som liknar provets och inget datum att räkna mot. Rummet (mätning, pass, kurva, plan) är byggt för att lösa det för matriser. De här riktlinjerna gör samma sak för alla testtyper, gör svårigheten verklig och ger dag 1 ett slut som pekar på dag 2.

---

## 1. Övningsprov mot klockan på alla testtyper

### 1.1 Vad det är, ett koncept för alla

Övningsprovet är ett helt prov i ett leverantörsformat, med total tid, fast ordning från lätt till svår (eller adaptivt när leverantören är adaptiv), utan förklaringar, utan "Vet inte, visa regeln", med obesvarade räknade som fel. Resultatet sätter en punkt på kurvan, visar om tiden räckte och ger genomgången efteråt. Det är den enda formen i produkten där klockan räknar ned och där vi gör allt för att det ska kännas som på riktigt. Allt annat (mätning, pass, riktade pass, klassiska nivåtest) är träning, och träning har en lugn tidsrad utan nedräkning.

Ett övningsprov per kognitiv testtyp: logik (matriser), verbalt, numeriskt. Personlighetstestet får inget övningsprov. Det har inga rätta svar, ingen klocka och ska aldrig spelifieras. Det får i stället en rad "Så tolkar rekryteraren profilen" i sitt kort, inget mer.

### 1.2 Format per leverantör, bara där vi kan stå för det

Formaten som får stå på kortet och i övningsprovet. Källa och "cirka" följer `beslut-testansvarig.md` punkt 6 och `tempo.ts`. Allt skrivs "samma format som", aldrig "samma test", och leverantörsnamnet kommer bara ur planens leverantör, aldrig ur en siffermatchning.

| Testtyp | Planens leverantör | Format i övningsprovet | Tidsform | Står med cirka | Anmärkning på raden |
|---|---|---|---|---|---|
| Logik | Matrigma, klassisk | 35 uppgifter på 40 minuter | total | ja (tredjepart) | ingen |
| Logik | Matrigma, adaptiv | 12 uppgifter på 12 minuter, svårare efter rätt svar | total, adaptiv | ja (antalet är vår simulering) | ingen |
| Logik | Alva Logic | 20 uppgifter, två minuter var | per uppgift, adaptiv | nej | ingen |
| Logik | SHL Verify | 18 uppgifter på 25 minuter | total | ja | "SHL Verify G+ blandar siffror, slutledning och figurer. Övningsprovet övar figurdelen." |
| Logik | Aon | 20 uppgifter på 5 minuter | total | nej | "Aon scales ix använder figurserier, inte rutnät. Tempot är detsamma." Flyttas till Figurserier när den testtypen finns (avsnitt 3). |
| Logik | Vet inte, Annat | Vårt format: 18 uppgifter på 25 minuter | total | nej | "Vet du leverantören så byter vi format." |
| Verbalt | SHL Verify | 32 påståenden (8 texter) på 20 minuter | total | nej (vårt tal, SHL:s tempo) | "Svaren sant, falskt eller går inte att avgöra, som i SHL Verify verbal." |
| Verbalt | Aon | Vårt format, se nedan | total | nej | "Aons scales verbal har fler uppgifter än någon hinner och texter i flikar. Svarsformatet är detsamma." |
| Verbalt | Matrigma, Alva, Vet inte, Annat | Vårt format: 32 påståenden (8 texter) på 20 minuter | total | nej | Matrigma och Alva: "Assessio och Alva har inget verbalt test. Får du bara deras logiktest behöver du inte öva det här." |
| Numeriskt | SHL Verify | 20 frågor (5 underlag) på 25 minuter | total | ja | "SHL Verify numerisk finns i flera versioner. Den vanligaste har 18 frågor på 25 minuter." |
| Numeriskt | Aon | Vårt format, se nedan | total | nej | "Aons scales numerical har svaren sant, falskt eller går inte att avgöra och fler uppgifter än någon hinner. Räknandet i tabellerna är detsamma." |
| Numeriskt | Matrigma, Alva, Vet inte, Annat | Vårt format: 20 frågor (5 underlag) på 25 minuter | total | nej | Matrigma och Alva: motsvarande mening som för verbalt. |

Beslut om de egna formaten: verbalt 32 påståenden på 20 minuter (37 sekunder per påstående, 150 per text), numeriskt 20 frågor på 25 minuter (75 sekunder per fråga, 300 per underlag). Dagens prov (48 på 40 och 36 på 40) är för långa för mobilen och liknar inget en kandidat möter. Copyn läser antal och minuter ur konfigurationen, aldrig som fasta tal. Det som står på raden är exakt det provet levererar.

Verbalt och numeriskt får alltså två format var (SHL och vårt), logik sex. Det räcker. Inga fler leverantörer förrän bevakningen har verifierat dem mot leverantörens egen sida eller samstämmiga källor.

### 1.3 Hur övningsprovet skiljer sig från nivåträningen

| | Pass, mätning, klassiska nivåer | Övningsprov mot klockan |
|---|---|---|
| Tid | Lugn tidsrad per fråga, räknar inte ned, byter aldrig färg | Total tid som räknar ned, lugnt. Per uppgift för Alva. |
| Ordning | Nära nivån, blandat | Lätt till svår i fast ordning, eller adaptivt när formatet är det |
| Under tiden | Regel och misstag efter varje svar, "Vet inte, visa regeln" | Ingenting. Nästa fråga. Bakåt tillåtet i fasta format, aldrig i adaptiva. |
| Obesvarat | Finns inte, varje fråga besvaras | Räknas som fel när tiden går ut, provet lämnas in automatiskt |
| Resultat | Rätt av antal, nivån rör sig som glidande medel | Rätt av antal, om tiden räckte, punkt på kurvan med vikt som en ommätning, tempot mot formatets budget |
| Efteråt | Genomgång direkt | Genomgång direkt, med alla frågor |
| Hur ofta | Varje dag | När som helst för Premium, högst ett per testtyp och dag. Planen lägger det två dagar före och dagen före provet. |

Övningsprovet lämnas in automatiskt när tiden är ute. Det går att avbryta; ett avbrutet prov sparas inte som punkt och visas som "Avbrutet" i historiken utan tal.

### 1.4 Vad resultatet visar

Fyra steg som avslöjas (samma rytm som passets resultat, 300 ms, inget vid reducerad rörelse):
1. Ringen fylls till andelen rätt, rubriken "23 av 35 rätt". Procenten står inte i texten, ringen bär den.
2. Två tal bredvid: tiden ("36:10 / av 40 min") och "Tiden räckte" eller "4 obesvarade" (när obesvarade finns är det det talet som visas, det är provets viktigaste besked).
3. Kurvan med den nya punkten, märkt som övningsprov (tyngre märke, samma som ommätning). Nivån får röra sig som efter en ommätning. Sjunker den står ordet om varför, aldrig rött.
4. Genomgången: miniatyrer av missade och obesvarade, "Var du tappade" per familj, tempot "x av y över provets tid" med den streckade budgetlinjen.

Statusraden sist: "I morgon: [enligt planen]" eller på provdagen minus ett: "I morgon är det provet. Tre uppvärmningsfrågor på morgonen, inget mer."

Aldrig: percentil, "du hade klarat", "godkänd", ett omdöme om chansen att gå vidare. Vi har inga belägg för hur leverantörerna poängsätter och säger det inte.

### 1.5 Hur det visas på kortet i Alla tester, samma för alla

Ett enhetligt kort för logik, verbalt och numeriskt:
- Bild, eyebrow (testtypen med i-knapp), frågan, brödtext, faktaraden, därefter **tre nivåsegment** Grund, Avancerad, Expert.
- Under segmenten, efter en hårlinje, **provraden** med provsymbolen: rad 1 "Övningsprov mot klockan", rad 2 formatet ur tabellen i 1.2 enligt planens leverantör, följt av "Ingår i Premium." bara när raden är låst. Höger: pil (öppen) eller lås (låst). Inget tal på raden. Resultatet bor på kurvan.
- Verbalt och numeriskt förlorar sitt fjärde segment "Prov". Logikkortet har redan bara tre. Rutnätet blir tre kolumner på alla kort, på mobil och dator.
- De gamla provsidorna `/dashboard/tester/verbal-resonemang-prov` och `numeriskt-test-prov` står kvar för gamla resultat, ingen rad pekar dit, samma lösning som för `matrislogik-prov` (spec 19.6).

Personlighetskortet: två segment (Grund, Avancerad) och raden "Inga rätta svar, ingen klocka." i stället för provraden.

### 1.6 Var övningsprovet ligger i planen

Planen är oförändrad i struktur (`plan.ts`): pass varje dag, vila söndag, ommätning var sjunde dag, övningsprov två dagar före och dagen före, vila på provdagen. Två tillägg:
- Planen med flera testtyper lägger övningsproven i den ordning testtyperna står i `test_planer.testtyper`, ett per dag när de är fler än två dagar till provet. Tre testtyper: övningsprov dag minus tre, minus två och minus ett. Logik först, för det är det alla har.
- Utan datum visas övningsprovet inte i planen alls; det står på kortet som "När du vill" i stället för ett datum. Ingen söndagsritual, det blir en räknare.

Hemvyn två dagar före provet (tillstånd "Inför provdagen") byter dagens pass mot övningsprovet med formatet i raden, som i dag, med det nya ordet.

### 1.7 Gratis och Premium

Bara Jobbcoach Premium, 149 kr i månaden, säljs. Gratisnivån i Rekryteringstester är ägarens beslut 17.2: smakprovet, nivåmätningen en gång med full genomgång, ett grundpass dag 0, därefter betalvägg på allt.

Övningsprovet är Premium på alla tre testtyper, utan undantag (`provlageGratis: false` står). Men det ska synas före köpet:
- Provraden på kortet visar formatet i klartext även låst, med leverantörens namn ur planen. Det är det som säljer.
- Betalväggen som öppnas från provraden säger datumet och formatet: "Övningsprovet i samma format som Matrigma, cirka 35 uppgifter på 40 minuter. 9 dagar till provet. Månaden täcker hela vägen." Knappen "Köp Jobbcoach Premium, 149 kr i månaden".
- Dagen före provet skickas gratiskontot med datum ett mejl med samma budskap (avsnitt 4.4). Det är det starkaste köpögonblicket vi har och det har i dag ingen utlösare alls.

### 1.8 Mätning

Befintliga händelser räcker: `generalrepetition_klar` (behåller namnet i koden, etikett "Övningsprov klart" i admin) får egenskaperna `test_kind`, `format`, `obesvarade`, `fran` (hubb, hem, plan). Betalväggsexponering från provraden mäts som i dag med `kalla: 'provrad'` per testtyp. Mål att följa upp sex veckor efter lansering: andel Premium-konton med datum som gör minst ett övningsprov (mål 60 procent), andel betalväggsexponeringar från provraden som leder till köp.

### 1.9 Byggnoter för Opus

- Nya `test_type`: `verbal-general`, `numerisk-general` i `logic_test_v4_sessions` med `meta.format`, `meta.budget_s`, `meta.antal`, `meta.obesvarade`. `featureForTestType` ger `test_exam_mode`. `nivapunkter.typ = 'general'` för alla tre.
- `PROVFORMAT` i `tempo.ts` blir per testtyp: `PROVFORMAT.logik`, `PROVFORMAT.verbal`, `PROVFORMAT.numerisk`, med `formatForPlan(kind, leverantor, variant)`. Verbalt och numeriskt har nycklarna `shl` och `eget`, resten mappar till `eget` med anmärkning enligt 1.2.
- Urval: verbalt och numeriskt väljer hela underlag, aldrig lösa påståenden. 8 texter ur grund och avancerad lätt till svår (3 grund, 3 avancerad, 2 expert när expertbanken har passformat, annars 4 och 4). Numeriskt 5 underlag: 2 grund, 2 avancerad, 1 expert.
- Tempot per underlag enligt `beslut-testansvarig.md` punkt 2 (per text, per tabell), per fråga för matriser.
- Allt som i dag heter generalrepetition eller provläge i strängar byter: `hem-copy.ts`, `pass-copy.ts`, `prov-copy.ts`, `hjalp-copy.ts`, `kurvan-copy.ts`, milstolpens etikett ("Övningsprovet" i stället för "Generalrepetitionen", nyckeln `generalrepetitionen` står kvar), sidomenyns "Provläget" blir "Övningsprov", Kom igång-brickan likaså. Grep på "generalrepetition" och "provläge" i `src/` ska ge noll träffar i strängar efter bygget.

---

## 2. Svårare, utan att skrämma bort nybörjaren

### 2.1 Diagnosen

Expertbanken har `svarighet_prior: 4` på 40 av 62 nya frågor, vilket betyder att vi antar att 40 procent klarar dem. Datan säger 13,4 rätt av 15 på expert, alltså närmare 90 procent. Priorerna är fel i den riktning som gör nivån för hög och produkten för kort. Verbalt och numeriskt saknar p-värden helt. Svårigheten måste bli uppmätt, inte antagen, och tills dess ska banken ha frågor som faktiskt är svåra enligt mekanismer vi vet skiljer åt.

### 2.2 Vad som ska bli svårare, per testtyp

**Matriser.** Grund rörs inte: en regel, tydlig referensram, det är nybörjarens hem. Avancerad får två regler i alla frågor (i dag har 16 av 62 prior 2, de flyttas till grund eller pensioneras). Expert får ett nytt band "svår plus" med dessa mekanismer, var och en kontrollerbar i valideringen:
1. Tre regler samtidigt varav minst en är kopplad över hela rutnätet (latin square eller diagonal), aldrig tre parallella.
2. Distraktorer som stämmer på två av tre regler: minst tre av fem distraktorer uppfyller exakt alla regler utom en. Validatorn räknar det (`v7-distraktor-check`, nytt skript i samma kedja).
3. Överlagring (XOR eller skillnad) kombinerad med vridning i samma cell, 45-gradersmultipler.
4. Två rörelser med olika stegländ (en flyttar ett steg, en två) i samma figur.
5. Antal som ändras med en regel (plus ett per kolumn) samtidigt som formen följer latin square.
Alla V7-regler i `reference_matrix_test_system.md` gäller oförändrade: inga parallella rader, synlig referensram, inga glyfer, symmetrifilter, max fyra streck, varierade alternativ, variera regeln. Svårare betyder fler kopplade regler och bättre distraktorer, aldrig mindre läsbarhet, mindre figurer eller fler alternativ (sex står).

**Verbalt.** Grund rörs inte. Avancerad: texter på 180 till 220 ord med två ståndpunkter, påståenden som byter kvantor ("alla" mot "många", "ofta" mot "alltid") och minst ett "går inte att avgöra" per text. I dag är 42 av 192 påståenden "går inte att avgöra" (22 procent); i avancerad ska det vara en tredjedel, för det är där poängen tappas (nivåtexten säger det redan). Expert (argumentationsanalys) är rätt nivå och behöver bara volym.

**Numeriskt.** Grund rörs inte, men felet att 1 av 9 slutför utreds på egen branch före allt annat. Avancerad: två eller tre räknesteg, minst en rad eller kolumn i underlaget som inte ska användas, ett enhetsbyte (tkr till mkr, kvartal till år). Expert: nuvärde, marginal, viktat snitt, prognos ur tillväxttakt, det som redan finns, plus diagram med två axlar. Distraktorerna är alltid "rätt räknat på fel siffra" eller "ett steg för lite", aldrig slumptal.

**Tidspress** är bara övningsprovets verktyg. Passen och nivåtesten får ingen nedräkning. Tempot rapporteras efteråt mot provets budget, som i dag.

### 2.3 Så undviker vi att nybörjaren skräms bort

- Ingången är nivåmätningen, inte expert. Mätningen börjar i mellanbandet och går neråt vid fel. Den som får 4 rätt av 12 får nivå runt 3 och ett pass nära den nivån, aldrig en expertfråga.
- Nivån 1 till 10 är sanningen i rummet. Etiketterna Grund, Avancerad, Expert finns kvar i Alla tester men beskrivs som "en regel", "två regler", "tre regler", aldrig som rang. Ordet "lätt" används inte om någon fråga.
- Passet blandar 60 procent nära nivån, 20 under, 20 över (som i dag). Det garanterar några rätt varje dag även på dåliga dagar.
- Nivån har tak 7,5 tills banken är kalibrerad över det (`BANK_KALIBRERAD_OVER_7_5`). Ingen får "10 av 10" på antagna priorer.

### 2.4 Kalibreringen måste gå fortare: kalibreringsfrågan

Trettio svar per fråga med fyra nya konton om dagen tar månader. Beslut: varje pass och varje övningsprov för Premium får **en kalibreringsfråga**: en fråga med färre än 30 svar, vald bland de minst besvarade, placerad slumpmässigt bland de andra, som räknas i genomgången men inte i nivån eller i tempot. Användaren ser den inte märkt som något särskilt; i genomgången står den som alla andra. Det är så riktiga testleverantörer kalibrerar nya uppgifter, och det är rätt att säga det i hjälpen med en mening ("En fråga i varje pass är ny och räknas inte i nivån. Så håller vi svårigheten rätt."). Mätning: `kalibreringsfraga_svarad` med `fraga_id`.

Priorerna i 3c-bankerna sätts inte om för hand (beslut 15.6 står). Men när en fråga har 30 svar och uppmätt p avviker mer än 0,25 från priorn flaggas den i admin, så vi ser hur fel vi hade.

### 2.5 Räcker banken?

| Bank | I dag | Behov för en månads träning | Vad som saknas | Prioritet |
|---|---|---|---|---|
| Matriser, valbara | 89 grund, 80 avancerad, 83 expert | 30 pass om 9 plus 4 ommätningar om 12 plus 2 övningsprov om 35: cirka 390 visningar, med återanvändning efter 30 dagar räcker 252 | 40 frågor i bandet "svår plus" (2.2), för att expert ska bli expert | 1, parallellt från dag ett |
| Verbalt grund och avancerad | 24 texter per nivå (96 påståenden) | Passform en text om dagen i 30 dagar plus övningsprov om 8 texter: 40 texter per nivå | 16 texter per nivå | 2 |
| Verbalt expert | 12 texter (48 frågor) | 20 texter | 8 texter | 3 |
| Numeriskt grund, avancerad, expert | 12 underlag per nivå | Passform ett underlag om dagen i 30 dagar plus övningsprov om 5: 36 per nivå | 24 underlag per nivå, 72 totalt | 2, grund och avancerad först (persona C) |

Passformen för verbalt och numeriskt (en text eller ett underlag, fyra frågor, under tio minuter) är det som gör att de testtyperna får en dagsrytm över huvud taget. Den byggs när banken för grund och avancerad når 36 per nivå, inte före. Fram till dess är de klassiska testen kortade: verbalt grund och avancerad 10 texter (40 påståenden) i stället för 15, numeriskt 5 underlag (20 frågor) i stället för 8. Det följer datan (22 och 45 minuter är för långt) och gör att bankerna räcker längre. `totalQuestions` i `testConfig.ts` följer med, och testet `testConfig.totals.test.ts`.

---

## 3. Fler tester: vad som ger mest för svenska jobbsökare

Prioriterat efter hur vanligt formatet är i svenska rekryteringar, om vi kan stå för formatet, och vad det kostar oss. Bygget av nya testtyper börjar först när avsnitt 1 och 2 är klara och bankerna i 2.5 har sin första leverans.

**1. Figurserier (induktiv slutledning).** "Vilken figur kommer härnäst i raden" och "vilken figur bryter mönstret". Det är formatet i SHL Verify G+ induktiv och Aon scales ix, de två leverantörer som i dag hänger löst på matriskortet med tveksam formatlikhet. Artikeln deduktivt-induktivt-test finns redan och väntar på indexering. V7:s renderare och familjer (vridning, vandring, antal, spegling) återanvänds; nytt är raden i stället för rutnätet och generatorn. Eget kort "Figurserier" i Alla tester med tre nivåer och övningsprov "Samma format som Aon scales ix, 20 uppgifter på 5 minuter" respektive SHL. Aon flyttas dit från logikkortet. Störst värde per krona.

**2. Deduktiv slutledning.** Syllogismer, schemapussel ("fem personer, tre villkor, vem sitter var"), regeltillämpning i text. SHL Verify deduktiv och Aon scales lst och cls. Ren text, inga renderare, billigt att författa på svenska, och det saknas helt på svenska i konkurrensbilden. Eget kort med övningsprov i vårt format tills bevakningen verifierat leverantörernas tal.

**3. Noggrannhet och uppmärksamhet.** Jämför två rader, hitta avvikelsen, under hård tid. Aon scales e3+ och många administrativa rekryteringar. Går att generera programmatiskt utan bank, passar mobilen, och är den naturliga uppvärmningen på provdagen. Lägre prioritet än 1 och 2 för att det sällan avgör en process.

**Gör inte:**
- **Situationsbedömning (SJT).** Facit är arbetsgivarens värderingar, inte logik. Vi kan inte stå för ett rätt svar, och att poängsätta det bryter samma princip som gäller personlighetstestet.
- **Mekanisk förståelse.** Få svenska tjänster, kräver fysikillustrationer som kostar mer än de ger.
- **Ordförråd, synonymer, stavning.** Mäter språkbakgrund mer än förmåga, och ingen av de leverantörer våra användare möter använder det i Sverige.
- **Fler personlighetstest eller "MAP-liknande" format.** Vi har Big Five grund och avancerad. Att efterlikna MAP:s normering vore ett påstående om träffsäkerhet vi inte kan belägga.
- **Interaktiva SHL-format (dra och släpp, bygg diagrammet).** Dyrt, byter ofta utseende, och SHL:s egna exempelfrågor täcker gränssnittsvanan.
- **IQ-tal eller percentil mot "befolkningen".** Vi har 25-regeln mot våra egna sessioner och inget mer.

---

## 4. Återkomst: varför de slutar dag 1 och vad som ändras

### 4.1 Varför

Dag 1 slutar med ett resultat och ingenting ogjort. Grundtestet ger 13 av 15, nästa nivå ger 14 av 15, expert ger samma, och sedan finns inget kvar. Ingen klocka har liknat provets, inget datum räknar, ingen har sagt vad som händer i morgon och ingen påminner. Rummet löser mycket av det för Premium (plan, pass, kurva). Det som saknas är att dag 1 pekar på dag 2, för alla konton.

### 4.2 Dag 1 ska sluta med något daterat och ogjort

Efter nivåmätningens resultat (och efter varje pass) står alltid ett kort "I morgon": temat (familjen hon tappade mest på), formen ("9 uppgifter, cirka 10 minuter") och tidpunkten. Tidpunkten väljer hon själv första gången med tre val, "Morgon", "Lunch", "Kväll", sparad i `test_planer.pass_tid` (`morgon|lunch|kvall`). Valet styr påminnelsen (4.4). Det är det enda nya hon behöver göra dag 1, och det tar ett tryck.

För gratiskontot är morgondagens pass låst. Kortet visar ändå temat och formen, med lås och "Ingår i Premium", så hon ser vad hon missar. Det är 17.2 i praktiken: vi visar värdet, inte bara låset.

### 4.3 Dag 2 ska ge ett synligt spår

- Serien visas från två dagar: "2 dagar i rad" är det första synliga beviset, dag 1 visar ingen serie. Söndag är frizon, som i dag.
- Nivån rör sig efter varje pass (glidande medel, tak plus minus 0,5). Punkten på kurvan ritar sig bara när den är ny; dag 2 är första gången hon ser rörelsen.
- Dagsringen fylls när passet sparats, veckoöversikten med sju celler får sin andra cell.
- "Första veckan" är första milstolpen efter mätningen, sju dagar och alla planerade pass. Den står som nästa mål i hemvyn från dag 2: "Första veckan: 5 pass kvar."

### 4.4 Påminnelser utan push-beslut: mejl via hjälpredan

Push är inte beslutat och ingår inte. Mejlen går genom hjälpredans befintliga schema (`src/lib/email/lifecycle`, ett mejl om dagen, aldrig två), så ingen ny cron behövs (max två Vercel-crons gäller). Fyra mallar, alla med avregistrering och alla tysta när passet redan är gjort:

| Mall | Till vem | När | Innehåll |
|---|---|---|---|
| `pass_imorgon` | Premium med plan, dag 2 till provdagen | vald tidpunkt (morgon 07:00, lunch 11:30, kväll 18:00, svensk tid) | Dagens pass: temat, antalet, en länk. Nivån i dag som ett tal. Inget annat. |
| `veckan` | Premium med minst fyra pass senaste sju dagarna | söndag 17:00 | Veckans kurva som bild (serverrenderad SVG), ommätningen i morgon, ett formord. |
| `dagen_fore_provet` | Alla med datum, även gratis | provdatum minus ett, 08:00 | Övningsprovet i leverantörens format. Premium: länk till provet. Gratis: betalväggens text ur 1.7. |
| `efter_provet` | Alla med datum | provdatum plus ett | "Hur gick det?" med tre svar (finns som tillstånd 1e, får ett mejl). |

Hjälpredans `komigang`-mejl för konton utan plan står kvar. Gratiskonton utan datum får inga träningsmejl, det finns inget att påminna om.

### 4.5 Inga återvändsgränder

Varje resultatvy slutar i en handling som pekar framåt: "I morgon"-kortet eller, över tröskeln, nästa nivå (statusradens fem varianter i `beslut-testansvarig.md` punkt 3). Alla tester är en katalog, inte ett slut: en rad längst ner "Till träningen" med dagens pass. Ingen vy får sluta i enbart "Till rekryteringstesterna".

### 4.6 Mått

Dag 2-återkomst delas i tre: Premium med datum, Premium utan datum, gratis med datum. Mål efter sex veckor: 60, 40 och 25 procent (gratis med datum kommer tillbaka för köpet, inte för passet). Mejlens öppning och klick per mall. Andel som väljer tidpunkt dag 1.

---

## 5. Snyggare och tydligare: riktlinjer att rita efter

Rummets ram gäller (granskning-formkurvan avsnitt 13): eget påkostat rum, egna SVG:er, djup, vuxet. Nedan är det som ska bli tydligare i tre vyer. Allt i både ljust och mörkt läge, Pixel 7 och 1280.

### 5.1 Frågevyn under testet

Gemensamt för pass och övningsprov:
- En fråga per skärm. Toppraden visar var hon är som en rad celler (nio celler för passet, fyllda för besvarade, den aktuella markerad), aldrig som text "7 av 9" annat än i aria-label. I övningsprovet med 35 frågor blir cellraden en tunn stapel med segment; texten "fråga 12" står under i meta.
- Figurerna fyller bredden: matrisen minst 300 px på 360, alternativen tre i bredd med bokstav uppe till vänster, kvadratiska. Figurerna ritas i bläck på papper, rätt svar i koppar.
- Verbalt: texten står överst och följer med (klistrad) medan påståendena byts ett i taget under den. Tre knappar i rad: Sant, Falskt, Går inte att avgöra, lika breda, aldrig färgade före svaret.
- Numeriskt: underlaget överst, frågan under, fyra alternativ som rader. Raden "Räknare tillåten" i meta vid första frågan. På mobil får tabellen rulla i sidled i sin egen ram, aldrig sidan.
- Aldrig rött. Aldrig en nedräkning i passet.

Bara passet:
- Efter svaret står alla sex alternativ kvar, det valda i bläck, det rätta i koppar, resten nedtonade. Regelpanelen glider in under: "Regeln" (en mening ur `rule`), "Ditt misstag" (en mening ur `misstag` för det valda), knappen "Nästa". Vid rätt bara regeln.
- "Vet inte, visa regeln" som textlänk i foten, räknas som fel, går till samma panel.

Bara övningsprovet:
- Klockan är en lugn ring uppe till höger med minuter kvar som enda tal, uppdaterad per minut, de sista två minuterna per tio sekunder och i koppar. Ingen blinkning, inget ljud, ingen varningstext. Vid noll lämnas provet in och resultatet visas.
- Alva-formatet: ringen gäller uppgiften (två minuter), fylls om per fråga.
- Ingen återkoppling efter svar. Nästa fråga direkt. Fasta format har "Föregående" som textlänk och en cellrad som går att trycka på för att hoppa; adaptiva har ingen väg bakåt och säger det på startsidan.
- Startsida före provet (ett ark): formatet i en rad, tre regler i tre rader (tiden, ingen hjälp, obesvarade räknas som fel), "Starta övningsprovet" som enda knapp. Ingen annan vy i produkten har en startsida med regler; här hör den hemma.

### 5.2 Resultatet

Enligt art-directors beslut 2 och fyrstegsavslöjandet: rubriken "12 av 15 rätt", ringen bär procenten, två tal bredvid (tid och tempo, eller tid och obesvarade i övningsprovet), bästa-raden som hel mening, genomgången med miniatyrer, statusraden sist med "I morgon". Tillägg:
- Kurvan visas på resultatsidan när punkten är ny (mätning, ommätning, övningsprov), inte efter vanliga pass (där rör sig nivån för lite för att en kurva ska säga något; nivåskalan med din punkt räcker).
- "Var du tappade" som två rader med familjens namn och en liten stapel per familj, aldrig procent i text.
- Tempot som staplar per fråga (per text, per underlag) med den streckade budgetlinjen märkt med formatets tid.
- Genomgången: varje missad fråga är ett provblad med miniatyr, regeln, misstaget och "Öva den här familjen" (riktat pass, Premium) som textlänk.

### 5.3 Korten i Alla tester

- Ett enhetligt kort (1.5): bild, eyebrow, fråga, brödtext, fakta, tre segment, provrad. Samma höjd på segmenten i alla tre tillstånd (gjord, ny, låst).
- Segmentet "gjord" visar bästa procenten i display och en stapel; "14 av 15, 3 försök" i title och aria. Segmentet "ny" visar minuterna. Segmentet "låst" visar låset och "Premium".
- Ett segment per kort får etiketten "Nästa" när något är gjort och nivån under tröskeln sitter (medianen av tre senaste över 85 procent, `SITTER_PROCENT`). Ingen "Börja här" när något är gjort.
- Provraden: symbol, två rader, pil eller lås. Inget tal. Låst rad är dämpad men läsbar, formatet står kvar i klartext.
- Personlighetskortet skiljer sig synligt: inget provrad, ingen procent, en profilbild (spektrum) i stället för provbladet, raden "Inga rätta svar, ingen klocka."

### 5.4 Ord som ska bytas överallt

| Bort | In |
|---|---|
| generalrepetition, generalrepetitionen | övningsprov, övningsprovet |
| provläge, provläget, Provläge mot klockan | Övningsprov mot klockan, övningsprovet |
| Prov (segment) | tas bort |
| test, testet (om ett pass) | pass, passet |
| nästa nivå (som knapp) | finns inte; statusradens text |

---

## 6. Skisser art-director ska rita (högst sex vyer) och vad som byggs när

Varje skiss i artefakt, Pixel 7 och 1280, ljust och mörkt, med riktiga exempeltal som går ihop (inga nivåer över 7,5). Ägaren godkänner före bygge.

1. **Alla tester, det enhetliga kortet.** Logik-, verbal- och numeriskkortet med tre segment och provraden, i tre tillstånd: inget gjort (gratis, allt utom grund låst), mitt i (Premium, två segment gjorda, "Nästa" på det tredje), och med leverantör i planen (provraden med Matrigma respektive SHL). Personlighetskortet bredvid för kontrast.
2. **Övningsprovets startsida och frågevy.** Arket med formatet och de tre reglerna, därefter frågevyn i övningsprov för matris (total tid, ring med minuter), verbalt (klistrad text, tre knappar) och numeriskt (tabell, fyra rader), plus Alva-varianten med ring per uppgift och de sista två minuterna i koppar.
3. **Övningsprovets resultat.** Fyra steg: ring och rubrik, tid och obesvarade, kurvan med det tyngre märket, genomgången med "Var du tappade" och tempot mot budgetlinjen. Tillståndet "nivån sjönk" med ordet om varför.
4. **Passets frågevy efter svar.** Matris med regelpanelen (regeln, misstaget, Nästa) och "Vet inte, visa regeln" i foten, samt verbalt pass efter svar (rätt svar markerat, förklaringen under påståendet).
5. **Dag 1-slutet.** Mätningens resultat med "I morgon"-kortet och tidpunktsvalet (Morgon, Lunch, Kväll), i två varianter: Premium (öppet pass) och gratis (låst pass med tema och form synliga, betalväggens text med datumet).
6. **Figurserier, en fråga och kortet.** En skiss som visar hur raden med fem figurer och den sjätte tomma ser ut i passet, och kortet i Alla tester. Ritas sist och bara som riktning; bygget ligger i omgång 2.

**Omgång 1 (bygge efter godkännande, Opus):**
- Övningsprov mot klockan på verbalt och numeriskt i formaten i 1.2, logikens befintliga pass byter ord, enhetligt kort med tre segment och provrad, gamla provsidor arkiverade utan länkar (skiss 1, 2, 3).
- Ordbytet i 5.4 i hela `src/`, hjälpen och mejlen.
- Passets regelpanel och övningsprovets klocka enligt 5.1 (skiss 2, 4).
- "I morgon"-kortet med tidpunkt, `test_planer.pass_tid`, mallarna `pass_imorgon` och `dagen_fore_provet` (skiss 5). `veckan` och `efter_provet` om tiden räcker, annars omgång 2.
- Kalibreringsfrågan i pass och övningsprov (2.4).
- Kortade klassiska test: verbalt 10 texter, numeriskt 5 underlag (2.5).
- Innehåll, parallellt från dag ett (testansvarig): 40 matrisfrågor "svår plus" med distraktorvalideringen, 24 numeriska underlag grund och avancerad.

**Omgång 2:**
- Passform för verbalt och numeriskt (en text eller ett underlag om dagen) när bankerna når 36 per nivå; 16 verbala texter per nivå, 8 expert.
- Figurserier som ny testtyp med Aon och SHL som format (skiss 6), Aon flyttas från logikkortet.
- Mallarna `veckan` och `efter_provet` om de inte hann med.
- Riktade pass per familj för verbalt och numeriskt.

**Omgång 3:**
- Deduktiv slutledning.
- Noggrannhet och uppmärksamhet, som uppvärmning på provdagen och eget kort.
- Admin: flaggan när uppmätt p avviker mer än 0,25 från priorn, lista över okalibrerade frågor.

Klicktest enligt `feedback_riktig_webblasartest` före varje omgång kallas klar: gratiskonto med datum (provraden låst med format, mejlet dagen före), Premium med Matrigma klassisk (övningsprovet startar i rätt format, punkt på kurvan), Premium med SHL och alla tre testtyper (planen lägger tre övningsprov), ett övningsprov som lämnas in av klockan (obesvarade räknas, resultatet visar talet). Pixel 7 och 1280, ljust och mörkt, skärmdump per steg.

---

## Ägarbeslut 2026-10-11 kväll (ersätter 4.4 och ordvalet "mätning")

**Namnet.** Mätning, nivåmätning, ommätning och "mät igen" heter **Nivåkollen** i allt användaren ser. Första gången "Nivåkollen" (knapp "Kolla min nivå, 8 min", resultat "Nivåkollen klar"), efter en vecka "Ny nivåkoll" (knapp "Kolla igen, 8 min"). Kodnamnen står kvar.

**Mejlen: högst två per användare**, båda med avregistrering, via hjälpredans schema (ett mejl om dagen, ingen ny cron):

| Mall | Till vem | När | Innehåll |
|---|---|---|---|
| `pass_dag2` | Alla som gjort Nivåkollen | dag 2, vald tidpunkt; tyst om dagens pass är gjort | Dagens pass och en länk. Nivån som ett tal. |
| `dagen_fore_provet` | Med provdatum, även gratis | provdatum minus ett, 08:00 | Övningsprovet i leverantörens format. Premium: länk. Gratis: betalväggens text ur 1.7. |
| `vecka_utan_datum` | Utan provdatum | dag 7; tyst om ny nivåkoll gjorts eller datum lagts in | "En vecka sedan din nivåkoll. Kolla igen och se om du har klättrat. Har du fått ett datum för testet?" Länk till ny nivåkoll och till att lägga in datum. |

Den som lägger in datum efter dag 2 får `dagen_fore_provet` i stället för `vecka_utan_datum`. Ingen får fler än två. `pass_imorgon` (dagligen), `veckan` och `efter_provet` utgår; "Hur gick det?" finns kvar i appen (tillstånd 1e).
