# Beslut från testansvarig: Tester-lyftet, sammanslagningen

Datum 2026-10-11. Branschen `design/tester-lyft` i worktreen `lyft-grund` efter sammanslagningen av grund, alla, resultat och utveckling. Ägaren har gett testansvarig och art-director mandat; inga frågor går till ägaren. Jag har läst `TestKategori.tsx`, `NivaSegment.tsx`, `ProvCard.tsx`, `AllaTesterVagg.tsx`, `TesterHubClient.tsx`, `alla/page.tsx`, `src/lib/tester/resultat.ts` och `copy.ts`, `TestResultsPage.tsx`, `TestHubPage.tsx`, `getResultsData.ts`, `src/components/traning/utveckling/Nivaerna.tsx` och `copy.ts`, `src/lib/traning/hjalp-copy.ts`, `hjalp.ts`, `tempo.ts`, `gratisniva.ts`, `quotaService.ts`, de verbala bankerna V1 och V2, skissen (avsnitt 1 till 4 och besluten 2 till 5), `hjalp.md` och spec-rummen 19.6. Ingen kod är ändrad av mig. Allt nedan är byggärenden för Opus; strängar står exakt.

Inget av det här vilar på data: volymerna är små och ingen ny siffra är hämtad. Det som är produktlogik står som det, det som är min bedömning står som det.

---

## 1. Logikens Prov-segment: bort. Provraden bär provet.

**Beslut.** Logikkortet får tre nivåsegment (Grund, Avancerad, Expert) och provraden under dem. Segmentet "Prov" tas bort på logikkortet. Verbalt och numeriskt behåller sina fyra segment som i dag, för deras prov är fortfarande ett vanligt test med procent i hubben.

**Varför.** Två vägar till samma mål är inte problemet i sig; problemet är att segmentet ljuger. Generalrepetitionen ger ingen procent i hubben (19.6: resultatet bor på kurvan och i genomgången), så segmentet kan aldrig bli "gjord". Den som gjort tre generalrepetitioner ser fortfarande "25 min, 18 uppgifter" i segmentet och tolkar det som "inte gjord". Provraden har inte det problemet: den säger vad provet är och i vilket format, med leverantörsnamnet ur planen, och det är den meningen som säljer provläget. Ett segment med ett tal kan inte bära "Samma format som Matrigma. Cirka 35 uppgifter, 40 minuter, fast ordning."

**Bygg.** `TestKategori.tsx`: `if (prov)`-blocket lägger inte till segmentet när `prov.general` är sant; `ProvCard` renderas som nu. Rutnätet för tre segment avgör art-director (tre kolumner på logikkortet, eller provraden i fjärde cellen på dator); jag har ingen åsikt så länge raden står under hårlinjen med sin symbol. Testet i `testkort.test.tsx`: logikkortet har tre `data-niva` och en `data-provrad`, verbalkortet fyra `data-niva` och ingen `data-provrad`.

---

## 2. Verbalt tempo: räkna per text, aldrig per påstående.

**Beslut.** För test där påståenden eller frågor hänger på ett underlag (verbalt grund och avancerad: 15 texter med 4 påståenden var; numeriskt: tabeller med flera frågor var; verbala provet) räknas tempot per underlag. Provets tid per underlag är antal påståenden i underlaget gånger tiden per påstående: verbalt grund 4 × 25 s = 100 s per text, avancerad 4 × 30 s = 120 s, numeriskt grund 4 × 56 s. Tiden för ett underlag är summan av dess påståendens mätta tid. Matris och verbalt expert (en fråga per underlag) räknas per fråga som i dag.

**Varför.** Lästiden hör till texten, inte till det första påståendet. Att fördela den jämnt över fyra påståenden är en gissning som gör staplarna till fiktion: ingen vet hur hon fördelade tiden. Per text är sant, går att förklara i en mening och ger 15 staplar i stället för 60, vilket också läses bättre. På riktiga prov är tiden total; det som avgör är om hon hinner texten med sina påståenden, inte varje påstående för sig.

**Bygg, `src/lib/tester/resultat.ts`.** `analysera` tar en lista `ResultatFraga` som i dag; ny hjälpare `perUnderlag(fragor)` slår ihop frågor med samma `kalla`-id (adaptern `fragorUnderlag` får sätta ett nytt fält `underlagId: p.id` på varje fråga) till en enhet med `nr` = underlagets ordningstal, `tid` = summan av mätta tider (null om ingen mätt), `utfall` = 'ratt' om alla påståenden rätt, annars 'fel', `grupp` = null. Tempot räknas på enheterna med budget = `budgetPerFraga × antal påståenden i underlaget`. `missar`, `grupper` och `svagast` räknas som i dag på påståendena. `Tempo` får ett fält `enhet: 'fraga' | 'underlag'` så att texten vet vad den talar om. Villkoret "minst hälften mätta" gäller enheterna.

**Copy, `src/lib/tester/copy.ts`.** När `enhet === 'underlag'`:
- rubrikens tredje tal: etikett `över ${budget} s per text` (verbalt) respektive `per tabell` (numeriskt). Lägg `text: { en: 'text', flera: 'texter' }` och `tabell` i `Sakord`-familjen eller som ett nytt `enhetsord(kind)`.
- `tempo.titel`: "Tre av femton texter över 100 sekunder", samma ordregel som i dag (ord upp till tjugo).
- `tempo.langsam`: "Text 7 tog 2:40 och alla fyra blev rätt. På provet hade den tiden saknats till en annan text."
- axlar: "text 1" och "text 15".
- `tempo.aria`: "Tid per text. 3 av 15 tog längre än provets 100 sekunder."

Teckenförklaringen är oförändrad (rätt, fel, över provets tid). "Fel" för en text betyder minst ett påstående fel; det får stå i `title` på stapeln: "Text 7: 2:40, 3 av 4 rätt".

Vitest: 15 texter à 4 påståenden med tid bara på första påståendet ger 15 enheter med rätt summor, och 25 s-budgeten blir 100 s; en text med 2 av 4 rätt är 'fel'; matris påverkas inte (snapshot av dagens test).

---

## 3. Tröskeln 85 procent och de låga resultaten: godkänt med två justeringar.

**Tröskeln.** 85 procent är rätt nivå: det är 13 av 15 på logik, 51 av 60 på verbalt och 28 av 32 på numeriskt, alltså högst två missar på de korta testen. Lägre än så och "sitter" lovar för mycket inför ett riktigt prov; högre och vi kräver felfritt, vilket inte ens banken tål (enstaka frågor har tvetydigheter). Godkänd.

**Justering A: underlaget är inte bästa försöket.** `nivaRubrik` i `Nivaerna.tsx` jämför `bestPercentage`, och ett enda 13 av 15 bland tjugo försök är inte "sitter". Räkna i stället på medianen av de upp till tre senaste försöken på nivån (`s.history.slice(-3)`, median av `percentage`). Medianen tål en dålig dag (det är C2:s löfte: en dålig dag raderar inte en bra vecka) men inte en trend nedåt. För den utan historik (gratis, `history` trimmad till senaste) blir det senaste försöket, vilket är rätt för henne. Brickans display-tal fortsätter visa bästa procenten; det är rubriken som byter underlag. Konstanten `SITTER` blir en exporterad `SITTER_PROCENT = 85` i `src/lib/tester/resultat.ts` så att resultatsidan (nedan) läser samma tal.

**Justering B: resultatsidans statusrad ska veta om nivån sitter.** Skissens "ingen nästa nivå-knapp" står fast: vyns enda kopparknapp är genomgången. Men "Samma nivå igen i morgon." är fel råd till den som fick 14 av 15. `RESULTAT.status.rytm` blir en funktion av tre saker: procenten i den här sessionen mot `SITTER_PROCENT`, om det finns en nästa nivå, och om den ingår i paketet. Exakta strängar:
- under tröskeln: "Samma nivå igen i morgon."
- över tröskeln, nästa nivå finns och är öppen: "Nästa nivå väntar i Alla tester."
- över tröskeln, nästa nivå finns men är låst: `Nästa nivå ingår i ${paketKort()}.`
- över tröskeln på expert, provläget öppet: "Provläget väntar i Alla tester."
- över tröskeln på expert, provläget låst: `Provläget ingår i ${paketKort()}.`
- provläge (level 'prov'): ingen rytmrad, som i dag.

Länken "Alla tester" står kvar som enda handling i raden. Ingen knapp, ingen koppar.

**Låga resultat, percentil och rött: godkänt som det är.** Ingen percentil på resultatsidan (jämförelsen bor i Din utveckling med 25-regeln och räknaren, beslut 4 i skissen). Inget rött: fel är ihåligt, långsamt är koppar. Ett resultat på 3 av 15 ger tolv provblad i genomgången, "Var du tappade" och tempot, med samma lugn som 13 av 15. Det är rätt: resultatet läses som resultat, inte som dom. Den enda text som får vara mjukare vid låga resultat finns redan (C6 i hjälpen).

---

## 4. Kvoten på gratisnivån: inte på kortet, men före klicket på testsidan och efter testet.

**Vad som gäller på servern.** `checkDailyTestQuota`: en slutförd session per test_type och dygn på grundnivå för den utan `tests_above_base`. Allt över grund är låst, inte kvoterat. I dag visas betalväggen "test-tak" på testsidan först efter att hon tryckt "Gör om testet" och fått 429.

**Beslut.** Alla tester visar ingen kvot: ett tal bär segmentet, och "1 kvar i dag" var alltid en formulering som gjorde gratisnivån till en räknare. Kvoten ska i stället synas på de två ställen där hon faktiskt möter den:

1. **Testsidan, före klicket.** När kontot saknar `tests_above_base` och har en slutförd session på detta test_type i dag (servern vet: `perTest[slug].lastAttempt` är i dag i svensk tid, eller en egen `checkDailyTestQuota` i `TestHubPage`s serverdel) renderas `PaywallCard variant="test-tak"` med `nextResetAt` direkt vid sidladdning, i stället för knappen. Samma kort som efter 429 i dag, bara tidigare. Ingen ny text.
2. **Resultatsidan, efter grundtestet.** Statusraden i punkt 3 får för gratiskontot (utan `tests_above_base`, nivå grund, under tröskeln) lydelsen: "Grundnivån är öppen en gång om dagen. Samma nivå igen i morgon." Över tröskeln gäller den låsta varianten i punkt 3 ("Nästa nivå ingår i Premium."), som redan säger det hon behöver veta.

Hemvyns dag 0-regel för grundpasset (`gratisniva.ts`, "Grundpasset i dag är gratis") är en annan kvot och rörs inte; den är redan sagd på hemvyn.

---

## 5. Villkoret för "Så går det till" och öppen hjälp: bara "inget test gjort".

**Problemet.** `forsta = !seddAt || !gjortNagot`. `traning_sedd_at` sätts enbart av hemvyn `/dashboard/tester` när motorn har en ny punkt (`markeraTraningSedd` efter mätningen). Den som gör klassiska test men aldrig mätningen får aldrig ett `traning_sedd_at` och ser "Så går det till" och öppen hjälp för alltid, också efter tjugo test. Skissens formulering ("traning_sedd_at finns och minst ett test är gjort") har samma fel; kolumnen mäter inte det vi vill veta.

**Beslut.** `forsta = !gjortNagot`, där `gjortNagot` är som i dag: minst ett slutfört kognitivt test eller en personlighetsprofil. `traning_sedd_at` lämnar villkoret helt (i `alla/page.tsx`; `hjalp.ts` och kommentarerna i `AllaTesterVagg.tsx` och `TesterHubClient.tsx` följer med). Den som besökt sidan tre gånger utan att göra ett test ser rutorna tre gånger: det är rätt, hon har inte gjort det som rutorna förklarar, och "Dölj hjälpen" finns för den som ändå vill slippa. Det hämtade smakprovet räknas när det landar i samma tabeller (då är `totalCompleted > 0`); gör det inte det är det också rätt, för fem anonyma frågor i en artikel är inte ett gjort test i rummet.

---

## 6. Hjälprutorna: verifierade mot leverantörernas egna sidor och tredjepart. Fyra skrivs om, flaggan bort på alla fyra. B2 skrivs också om.

Kontrollerat 2026-10-11: Assessios hjälpcenter (Matrigma), Alvas hjälpcenter (Logic), Aons och SHL:s format via flera samstämmiga tredjepartskällor. Vad som håller och inte:

| Påstående | Håller? | Belägg |
|---|---|---|
| Matrigma klassisk 35 uppgifter på 40 minuter | Ja, 40 minuter; 35 uppgifter bara tredjepart, samstämmigt | Assessios hjälpcenter anger tid, inte antal |
| Matrigma adaptiv cirka 12 minuter, en minut per uppgift | Ja | Assessios hjälpcenter: "up to 12 minutes, with per-item time limits" |
| Alva Logic 20 uppgifter, 2 minuter per uppgift, upp till 40 minuter | Ja | Alvas hjälpcenter |
| Aon scales ix 20 uppgifter på 5 minuter | Ja | samstämmiga tredjepartskällor |
| Aon scales numerical 37 på 12 minuter, scales verbal 49 på 12 minuter, båda sant/falskt/går inte att avgöra mot flikar | Ja | samstämmiga tredjepartskällor |
| SHL Verify verbal: 30 frågor på 19 minuter, sant/falskt/går inte att avgöra | Ja (den klassiska); nyare versioner har 18 på 15 | tredjepart |
| SHL Verify numerisk: 18 frågor, 17 till 25 minuter, tabeller och diagram, flerval | Ja; interaktiva versioner avviker | tredjepart |
| SHL Verify "cirka 90 sekunder per uppgift" (C3) | Nej. Vårt eget SHL-format är 18 på 25 = 83 s, och `tempo.ts` har `budget_s: 90` för samma format. Talet har ingen källa | se byggärende nedan |
| Assessio har en verbal del (B3) | Nej. Utbudet är Matrigma, MAP, MAP-X, MINT, Match-V (värderingar), Service First. Inget verbalt begåvningstest | Assessios hjälpcenter och produktsidor |
| "Aon scales numerisk" har samma format som vårt numeriska (B5) | Nej. scales numerical är sant/falskt/går inte att avgöra mot tabeller i flikar, med fler uppgifter än någon hinner. Vårt är SHL-formatet: räkna fram ett svar, flerval | tredjepart |
| 10 till 40 minuter per test (A4) | Nej i nedre änden: Aons test är 5 och 12 minuter, Matrigma adaptiv 12 | ovan |
| Aon scales och SHL Verify som "samma format" för matriser (B2, oflaggad) | Tveksamt. scales ix och SHL:s induktiva del använder figurserier och regelbrott, inte 3 × 3-rutnät | tredjepart |

**Ny text per ruta.** Rubrikerna är oförändrade. `verifiera` och `verifieraNot` tas bort på A4, B3, B5 och C3. B2 har ingen flagga men byts.

**A4. Hur lång tid tar det?**
"Mellan 5 och 40 minuter per test. Aons test är kortast, 5 till 12 minuter med fler uppgifter än någon hinner. Matrigma tar 12 minuter adaptivt och 40 klassiskt, Alva Logic oftast 15 till 20. Får du flera test i samma utskick kan du räkna med en timme sammanlagt. Personlighetstestet har ingen klocka, logik, verbalt och numeriskt har det alltid."

**B2. Logiktest: vem använder det och hur övar jag?**
"Våra matriser följer samma format som Matrigma och Alva Logic. SHL Verify och Aon scales ix mäter samma sak med figurserier i stället för rutnät, och reglerna du lär dig här är desamma. Ett tips: läs raderna först, sedan kolumnerna. Sätt ord på regeln innan du tittar på svarsalternativen, för de är byggda för att locka den som bara hittat halva regeln."

**B3. Verbalt test: vad mäter det?**
"Du läser en kort text och tar ställning till påståenden om den: sant, falskt eller går inte att avgöra. Det mäter om du håller dig till det som faktiskt står och drar slutsatser av det, inte av vad du råkar veta sedan tidigare. Samma svarsformat som SHL Verify verbal och Aons scales verbal. Alva och Assessio har inget verbalt test, så får du Matrigma eller Alva Logic behöver du inte öva det här."

**B5. Numeriskt test: vad mäter det?**
"Du får en tabell eller ett diagram och ska räkna fram ett svar, till exempel en andel, en förändring eller en prognos. Det mäter om du hittar rätt siffra i underlaget och räknar rätt på den med klockan igång. Vanligt för tjänster med budget, analys eller försäljning. Samma format som det numeriska testet i SHL Verify. Aons scales numerical ser annorlunda ut, med fler uppgifter än du hinner och svaren sant, falskt eller går inte att avgöra, men räknandet i tabellerna är detsamma."

**C3. Vad är tempot?**
"Tempot visar hur många uppgifter nära din nivå som tog längre tid än provet ger dig per uppgift. Vilken klocka vi räknar mot beror på vilket prov du angett: vårt eget ger 83 sekunder, Matrigma klassisk cirka 68 sekunder och adaptiv en minut, Alva Logic 2 minuter, Aon scales ix 15 sekunder. SHL Verify finns i flera versioner, så där räknar vi med formatet som står på provraden. Rätt men långsamt är ett lika tydligt besked som fel."

**Byggärende utanför hjälpen, ur samma kontroll.** `src/lib/traning/tempo.ts`, `shl`: `budget_s: 90` stämmer inte med `antal: 18, minuter: 25`. Sätt `budget_s: budget(25, 18)` (83) så att tidsraden, tempot och provraden säger samma sak. Formatet står kvar med `cirka`. Resten av `PROVFORMAT` kan nu märkas `verifierad: true` för `alva`, `aon` och `matrigma_adaptiv` (tiden, inte antalet: antalet 12 är fortfarande vår simulering, så `cirka` står kvar där). `matrigma_klassisk` förblir `cirka` tills Assessio själva skriver antalet; de skriver bara tiden.

---

## 7. "Visa ett exempel på en fråga": inte i den här omgången. Länken tas bort tills arket finns.

**Beslut.** Länken på det lyfta kortet (dator) tas bort. En länk som inte leder någonstans är sämre än ingen. Det kortet behöver finns redan: provbladets bild är exemplet, "Så går det till" säger formatet, i-knappens ruta (B1, B3, B5) förklarar uppgiften, och testsidan en klick bort har frågan som rubrik och förklaring efter varje fråga.

**Backlogg, egen våg.** Ett exempelark inloggat per testtyp: en fråga ur grundbanken med alternativ, facit och regel eller förklaring, i ett ark från det lyfta kortet och från varje testkort. Störst värde för verbalt och numeriskt, där bilden förklarar mindre än för matriser. Samma komponent som smakprovet i artiklarna kan återanvändas för logik; verbalt och numeriskt saknar publikt smakprov och får sitt ark först. Mät med ett event `exempel_oppnat` per testtyp när det byggs, inte nu.

---

## Sammanfattning för byggagenten

1. `TestKategori.tsx`: inget Prov-segment när `prov.general`; provraden kvar. Test uppdateras.
2. `resultat.ts` och `copy.ts`: tempot per underlag för verbalt och numeriskt (summa av påståendenas tid mot antal × budget), per fråga för matris och verbalt expert. Nya strängar enligt punkt 2.
3. `Nivaerna.tsx`: "sitter" på medianen av de tre senaste försöken, `SITTER_PROCENT = 85` exporterad från `resultat.ts`. `RESULTAT.status.rytm` med fem varianter enligt punkt 3.
4. `TestHubPage`: betalväggen "test-tak" vid sidladdning när dagens kvot är använd. Resultatsidans gratisrad enligt punkt 4.
5. `alla/page.tsx`: `forsta = !gjortNagot`; `traning_sedd_at` ut ur villkoret och kommentarerna.
6. `hjalp-copy.ts`: A4, B2, B3, B5, C3 enligt punkt 6; flaggorna bort. `tempo.ts`: SHL-budgeten 83.
7. Lyftkortet: länken "Visa ett exempel på en fråga" tas bort.

Klicktest enligt feedback_riktig_webblasartest efter bygget: gratiskonto utan test (rutorna syns), samma konto efter ett grundtest (rutorna borta, hjälpen hopfälld, statusraden "Grundnivån är öppen en gång om dagen"), andra försöket samma dag (betalväggen före klicket), betalande med 14 av 15 på grund (statusraden "Nästa nivå väntar i Alla tester"), verbalt grund med resultat (tempot "x av femton texter"). Pixel 7 och 1280, ljust och mörkt.
