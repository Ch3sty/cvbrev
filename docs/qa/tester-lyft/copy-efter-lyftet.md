# Copy efter lyftet: familjer, siktet och mätningens brödtext

Svensk UX-copywriter, 2026-10-11. Underlag: ägarens skärmdumpar 5.png och 6.png, punkt 1 och 2 i efter-push-2026-10-11.md, samt läsning av src/lib/traning, src/lib/tester/copy.ts, src/components/traning och src/app/dashboard/tester i worktreen efter-lyftet. Inga kodändringar här. Allt nedan går att byta rakt av.

## 1. Besluten i korthet

**Ordet för "familj" är "mönster".** Ett mönster, mönstret, flera mönster, mönstren. Det är vad användaren faktiskt ser i en matris, och ordet finns redan i gränssnittet ("Figurer och mönster", "Blandade mönster"). "Familj" försvinner ur all användarsynlig text. Verbalt och numeriskt behåller "svarstyper" och "uppgiftstyper" som i dag.

**Ordet för "sikte" är "mål".** Ägarens egen beskrivning är "vårt föreslagna mål". Vi skriver "mål" överallt: "Mål om en vecka: nivå 4", "kvar till målet", "Målet sätts med datumet". "Sikte" försvinner ur all synlig text och ur aria-texterna.

**Mönstrens namn skrivs om till meningar en novis förstår**, till exempel "Figuren flyttar sig runt kanten" i stället för "Vandring runt en ram". Namnen står alltid som rubrik eller efter kolon, aldrig gemena mitt i en mening. Alla `.toLowerCase()` på namnen tas bort.

**Nivåer skrivs utan onödig decimal.** Regel: en nivå skrivs med decimal bara när decimalen inte är noll och bara där tiondelarna är poängen (efter ett pass, på kurvan, i förflyttningar som +0,2). "3,0" skrivs aldrig. Målet skrivs "nivå 4" eller "nivå 6,5". Ny hjälpfunktion föreslås i avsnitt 5.

**"Regeln" behålls** som ordet för förklaringen efter varje fråga ("Vet inte, visa regeln", "Regeln efter varje fråga"). Det är ett vanligt svenskt ord, hjälprutorna B1 och B2 förklarar det, och panelen visar bokstavligen en regel. Men vi räknar inte längre regler i nivåmeningarna. Där skriver vi "en sak ändras i taget" och "två saker ändras samtidigt".

**"Sträckuppgift" försvinner.** Vi skriver "en uppgift över din nivå" eller "svårare än din nivå".

**Målet står aldrig på själva skalan.** Varken som text vid triangeln eller inskrivet i din etikett. Målet får en egen rad under de tre talen, med "Ändra" som länk. Då finns ingen krock att hantera. Triangeln står kvar på skalan.

## 2. Fynd som implementatören behöver veta

1. **Krockregeln är normalfallet i mätningen.** `foreslaSikte` i src/lib/traning/niva.ts ger alltid ett mål 0,5 till 1,5 över nivån. `SIKTE_KROCK_NIVAER` i Nivaskala.tsx är 1,2. Alltså skrivs målet in i din etikett nästan varje gång, och triangeln hamnar ovanpå texten. Det är därför ägaren ser "Du · sikte 4,0, ändra" med markören i vägen. Lösningen är inte att justera gränsen utan att flytta måltexten bort från skalan (avsnitt 4).
2. **"ändra"-länken pekar på ett ankare som inte finns.** MatningResultatVy.tsx rad 80 har `sikteHref = '/dashboard/tester/installningar#sikte'`. Inställningssidan har inget element med id "sikte" och ingen text om målet alls. Länken behöver ett mål innan "Ändra" visas, annars tas länken bort tills vidare.
3. **Två hårdkodade texter utanför copyfilerna.** src/lib/traning/hemvy.ts rad 989 och 990 har 'samma familj, ett steg svårare' och 'ny familj' inskrivna direkt, dubblett av TRANING_COPY.imorgon. De ska läsa från copyn.
4. **Mönstrens namn ligger i src/lib/logicTestV7/familjer.json**, fälten `namn` och `kort`. Id:n ändras inte. docs/tester/matris-familjer.md och testerna i src/lib/traning/__tests__/resultat.test.ts (rad 149) refererar de gamla texterna och behöver följa med.
5. **hjalp-copy.ts behöver inte ändras.** Hjälprutorna innehåller varken "familj" eller "sikte". De förklarar "regel" på ett sätt som stämmer med beslutet ovan. C2 säger redan "högst ett halvt steg", vilket är formen vi går över till överallt.

## 3. Mönstrens namn (src/lib/logicTestV7/familjer.json)

Bedömning: fyra av elva namn förstås av en novis utan hjälp ("Vridning", "Speglingar", "Överlagring" i viss mån, "Antal som ändras" nästan). Resten är kategoribeteckningar ur taxonomin. Alla skrivs om till samma form: en kort mening om vad som händer i rutnätet. `kort` behålls där den redan är begriplig och putsas där den inte är det.

| id | Gammalt namn | Nytt namn | Ny kort (eller oförändrad) |
|---|---|---|---|
| vridning | Vridning | Figuren vrider sig | Figuren vrider sig lika mycket för varje ruta. |
| monsterrotation | Mönster som roterar | Hela mönstret vrider sig | Ett mönster av flera delar vrider sig som en helhet. (oförändrad) |
| vandring | Vandring runt en ram | Figuren flyttar sig runt kanten | En markering flyttar sig steg för steg mellan fasta platser. |
| rotation-med-byte | Rotation med byte | Vrider sig och byter utseende | Figuren vrider sig och byter samtidigt fyllning, längd eller spets. (oförändrad) |
| tva-rorelser | Två rörelser samtidigt | Två saker rör sig samtidigt | Två delar flyttar sig var för sig, och du måste följa båda. |
| latin-antal | Antal i rad och kolumn | Varje antal en gång per rad | Varje antal finns en gång i varje rad och en gång i varje kolumn. |
| latin-form | Form och fyllning i rad och kolumn | Varje form en gång per rad | Varje form, fyllning eller symbol finns en gång i varje rad och kolumn. (oförändrad) |
| latin-flera | Flera egenskaper i rad och kolumn | Form och antal, en gång var per rad | Två eller tre saker, som form och antal, varieras var för sig i raderna och kolumnerna. |
| overlagring | Överlagring | Två rutor läggs ihop | Den tredje rutan bildas av de två första: allt, bara det gemensamma eller bara det som skiljer. |
| spegling | Speglingar | Figuren speglas | Rutan speglas i en linje, ibland två gånger i rad. |
| antal-andras | Antal som ändras | Antalet ökar eller minskar | Antalet växer, minskar eller läggs ihop från ruta till ruta. (oförändrad) |

Skrivregel för namnen i löptext: versal begynnelsebokstav, aldrig `.toLowerCase()`, och alltid som rubrik eller efter kolon. "Riktat pass: Figuren flyttar sig runt kanten." Aldrig "riktat mot figuren flyttar sig runt kanten".

Ställen som i dag gemenar namnet och måste byggas om: pass-copy.ts rad 296 och 310, hem-copy.ts rad 113 och 203, tester/copy.ts rad 132, resultat.ts rad 304 (gemenar `kort`, inte namnet, det är fortfarande rätt).

## 4. Målet (siktet): etikett, rad och tal

### Vad som syns i mätningens resultat (M1), uppifrån och ner

1. Eyebrow "Din nivå", det stora talet "3 av 10", nivåmeningen (avsnitt 6).
2. Skalan: spåret, din punkt, triangeln för målet, axeltalen 1, 5 och 10. **Ingen etikett ovanför punkten, ingen decimal under den, ingen måltext vid triangeln.** Det stora talet bär värdet.
3. De tre talen som i dag.
4. **Ny rad, målet:** `Mål om en vecka: nivå 4` följt av länken `Ändra`. Med provdatum: `Mål till provet: nivå 6,5`. Ändra är enda länken, 44 px träffyta som i dag.
5. Meningen under, omskriven (tabellen nedan).

Samma princip i P4, S1 och O1: måltexten lämnar skalan och står som en egen rad under de tre talen. Triangeln blir kvar. Krockregeln, `siktetKrockar` och sammanslagningen av etiketter i Nivaskala.tsx kan tas bort helt.

### Talens form

- Målet skrivs alltid med ny hjälpfunktion `nivaKort`: heltal när decimalen är noll, annars en decimal. 4 → "4", 6,5 → "6,5". Målet är alltid en halv eller hel nivå, så det blir aldrig fler tecken än så.
- Skalans axel visar 1, 5 och 10. Ingen decimal under punkten i mätningen (`etikettUnder` tas bort i MatningResultatVy).
- Efter ett pass (P4, S1) och i ommätningen (O1) behålls tiondelar i etiketten vid punkten ("Nu 5,6", "från 5,4") eftersom rörelsen är poängen där. Men skrivs med `nivaKort`, så "Nu 5" i stället för "Nu 5,0".
- Förflyttningar (+0,2, ner en tiondel) ändras inte.

### Texterna om målet

| Fil | Nyckel eller rad | Gammal text | Ny text |
|---|---|---|---|
| components/traning/MatningResultatVy.tsx | rad 111, `etikettNu="Du"` | Du | (tas bort, ingen etikett i M1) |
| components/traning/MatningResultatVy.tsx | rad 112, `etikettUnder` | 3,0 | (tas bort) |
| components/traning/MatningResultatVy.tsx | rad 113, `siktLank.etikett` | Sikte 4,0 | (flyttas till egen rad, se nästa) |
| lib/traning/pass-copy.ts | ny nyckel `matning.malRad(sikte, harDatum)` | (ny) | `Mål om en vecka: nivå ${nivaKort(sikte)}` utan datum, `Mål till provet: nivå ${nivaKort(sikte)}` med datum |
| lib/traning/pass-copy.ts | ny nyckel `matning.malAndra` | ändra | Ändra |
| lib/traning/pass-copy.ts | 289 till 292, `matning.siktetMening(dagar)` | Siktet är vårt förslag för 18 dagars träning i det här formatet. Det är ditt mål, inte arbetsgivarens krav, och du kan ändra det. | Nivå 6,5 är vårt förslag efter 18 dagars pass. Ingen arbetsgivare kräver det, och du bestämmer själv. (funktionen får också målet som argument) |
| lib/traning/pass-copy.ts | 292, utan dagar | Siktet är vårt förslag för en veckas träning. Det är ditt mål, inte arbetsgivarens krav, och du kan ändra det. | Nivå 4 är vårt förslag efter en veckas pass. Ingen arbetsgivare kräver det, och du bestämmer själv. |
| lib/traning/pass-copy.ts | 287 till 288, `matning.skalaAria` | Nivåskala 1 till 10. Du: 3,0. Föreslaget sikte: 4,0. | Nivåskala 1 till 10. Din nivå 3. Föreslaget mål: nivå 4. |
| lib/traning/pass-copy.ts | 336 till 337, `ommatning.skalaAria` | ... Sikte 6,5. | ... Mål 6,5. |
| lib/traning/resultat.ts | 240, aria i `passResultat` | ... Sikte 6,5. | ... Mål 6,5. |
| lib/traning/resultat.ts | 238, `etikettNu` | Nu 5,6 | Nu 5,6 (med `nivaKort`, så aldrig "Nu 5,0") |
| components/traning/Nivaskala.tsx | 79 till 80, `sikteText` | Sikte 6,5 | (funktionen tas bort, måltext ritas inte på skalan) |
| components/traning/Nivaskala.tsx | 272 och 288, `aria-label` | Ändra siktet | Ändra målet |
| components/traning/OmmatningResultatVy.tsx | 59, `etikettNu` | Nu 5,8 | Nu 5,8 (med `nivaKort`) |
| lib/traning/hem-copy.ts | 161, `dagsrad.kvarSikte` | kvar till siktet 6,5 | kvar till målet 6,5 |
| lib/traning/hem-copy.ts | 162, `dagsrad.siktetNatt` | siktet, nått | målet, nått |
| lib/traning/hem-copy.ts | 178, `kurva.sikte` | Sikte 6,5 | Mål 6,5 |
| lib/traning/hem-copy.ts | 179, `kurva.sikteDator` | Sikte 6,5 före provet | Mål 6,5 före provet |
| lib/traning/hem-copy.ts | 180, `kurva.siktetSatts` | Siktet sätts med datumet | Målet sätts med datumet |
| lib/traning/hem-copy.ts | 252, `provdag.skala.du` | Du 5,6 | Du 5,6 (med `nivaKort`) |
| lib/traning/hemvy.ts | 290, `kurvansLabel` | Sikte 6,5. | Mål 6,5. |
| lib/traning/hemvy.ts | 1030, aria på provdagen | ... Sikte: 6,5. | ... Mål: 6,5. |
| components/traning/Helkurva.tsx | 88 | Sikte 6,5 den 24 oktober. | Mål 6,5 den 24 oktober. |
| lib/traning/kurvan-copy.ts | 20, `legend.sikte` | Siktet | Målet |
| lib/traning/kurvan-copy.ts | 21, `legend.sikteMeta` | Ditt mål före provdagen. Vårt förslag, ändringsbart. Aldrig arbetsgivarens krav. | Nivån vi föreslår att du når före provdagen. Du kan ändra den. Ingen arbetsgivare kräver den. |
| lib/traning/kurvan-copy.ts | 17, `legend.passMeta` | En punkt per dag. Flyttar nivån högst 0,5. | En punkt per dag. Flyttar nivån högst ett halvt steg. |
| components/traning/utveckling/copy.ts | 15, `stat.sikte` | sikte | mål |
| components/traning/utveckling/copy.ts | 17, `legend.sikte` | sikte | mål |

Inställningssidan: när ankaret byggs heter avsnittet "Ditt mål" med raden "Nivån du vill nå före provet. Vårt förslag står förifyllt." Tills dess visas måltexten utan länk.

## 5. Ny hjälpfunktion och nivåer i text

Lägg till i src/lib/traning/pass-copy.ts bredvid `nivaText`:

```ts
/** Nivån utan onödig decimal: 4 → "4", 6,5 → "6,5", 5,6 → "5,6". */
export function nivaKort(niva: number): string {
  const n = Math.round(niva * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}
```

Byt `nivaText` mot `nivaKort` på alla ställen som skriver en nivå som värde (inte en förflyttning): pass-copy.ts rad 204, 207, 208, 213, 334, 335, 338, 355, 356, 359, 360; resultat.ts rad 238, 239, 247, 536; hemvy.ts `decimal(...)` på rad 459, 465, 472, 490, 951 till 963 (utom delta-raden 962), 1028; utveckling/Nivavagg.tsx rad 121 till 123 och 136; Helkurva.tsx rad 87 och 88. `nivaText` och `deltaText` behålls för +0,2 och "ner en tiondel".

Två texter där talet självt är problemet:

| Fil | Rad | Gammal text | Ny text |
|---|---|---|---|
| lib/traning/pass-copy.ts | 235 till 238, `resultat.sjonk` | ... och nivån rör sig högst 0,5 per pass. | ... och nivån rör sig högst ett halvt steg per pass. |
| lib/traning/pass-copy.ts | 239, `resultat.grundpass` | Grundpassen flyttar sällan nivån när du redan är över 4. | Grundpassen flyttar sällan nivån när du redan står över nivå 4. |

## 6. Mätningens brödtext (pass-copy.ts rad 105 till 116 och 285 till 286)

Meningen byggs av NIVAMENING[heltal] plus `familjerFel(n)`. Alla varianter skrivs om. Vi räknar inte regler, vi säger vad som ändras i rutnätet. Ett konkret exempel där två saker ändras samtidigt står i nivå 4 och 5, där det gör mest nytta.

### NIVAMENING

| Nivå | Gammal text | Ny text |
|---|---|---|
| 1 | Du står längst ner på skalan. Uppgifter med en regel i taget är inom räckhåll, och det är där passen börjar. | Du står längst ner på skalan. Passen börjar med de enklaste uppgifterna, där bara en sak ändras från ruta till ruta. |
| 2 | Du klarar en del av de enklaste uppgifterna, de med en regel i taget. Passen börjar där. | Du klarar en del av de enklaste uppgifterna, där bara en sak ändras från ruta till ruta. Passen börjar där. |
| 3 | Du klarar de flesta uppgifter med en regel i taget. Två regler samtidigt går oftast fel än. | Du klarar de flesta uppgifter där en sak ändras i taget. När två saker ändras samtidigt blir det oftast fel än så länge. |
| 4 | Du klarar uppgifter med en regel i taget. Två regler samtidigt, som rotation med byte, går oftast fel än. | Du klarar uppgifter där en sak ändras i taget. När två saker ändras samtidigt, som en figur som både vrider sig och byter fyllning, blir det oftast fel än så länge. |
| 5 | Du klarar de flesta uppgifter på grundnivå. Två regler samtidigt, som rotation med byte, går ungefär varannan gång. | Du klarar det mesta på grundnivå. När två saker ändras samtidigt, som en figur som både vrider sig och byter fyllning, blir det rätt ungefär varannan gång. |
| 6 | Du klarar grundnivån, och oftare rätt än fel när två regler ska följas samtidigt. De svåraste uppgifterna går ungefär varannan gång. | Grundnivån sitter. När två saker ändras samtidigt får du oftare rätt än fel. De svåraste uppgifterna blir rätt ungefär varannan gång. |
| 7 | Du klarar de flesta uppgifter, också de med två regler samtidigt. De svåraste, med tre saker att följa, går oftare rätt än fel. | Du klarar de flesta uppgifter, också de där två saker ändras samtidigt. De svåraste, med tre saker att hålla reda på, får du oftare rätt än fel. |
| 8 | Du klarar nästan allt, också de svåraste uppgifterna. Det som skiljer nu är tempot. | Du klarar nästan allt, också de svåraste uppgifterna. Det som skiljer nu är tempot. (oförändrad) |
| 9 | Du klarar nästan alla uppgifter, också de svåraste. Det som finns kvar att träna är tempot under provets tid. | Du klarar nästan alla uppgifter, också de svåraste. Det som är kvar att träna är tempot på provets tid. |
| 10 | Du klarar hela skalan. Det som finns kvar att träna är tempot under provets tid. | Du klarar hela skalan. Det som är kvar att träna är tempot på provets tid. |

### familjerFel (rad 285 till 286)

| n | Gammal text | Ny text |
|---|---|---|
| 1 | En familj drar ner mest, den står under Var du tappar. | Mest tappar du på ett enda mönster. Det står under Var du tappar. |
| 2 | Två familjer drar ner mest, de står under Var du tappar. | Mest tappar du på två mönster. De står under Var du tappar. |

Exempel på hela meningen för ägarens skärmdump (nivå 3, två mönster): "Du klarar de flesta uppgifter där en sak ändras i taget. När två saker ändras samtidigt blir det oftast fel än så länge. Mest tappar du på två mönster. De står under Var du tappar."

## 7. Alla övriga "familj"-texter

### src/lib/traning/pass-copy.ts

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 183 | `fel.familj` | Den familjen har inte tillräckligt många uppgifter än. | Det mönstret har för få uppgifter än så länge. |
| 184 | `fel.familjRad` | Välj ett annat riktat pass, eller gör dagens pass. | Välj ett annat riktat pass, eller gör dagens pass. (oförändrad) |
| 210 | `resultat.riktatRad` | Riktade pass räknas i familjen, inte i nivån. | Ett riktat pass räknas på mönstret du övar, inte på din nivå. |
| 224 till 227 | `resultat.familjIdag` | Rotation med byte: fem av sex rätt i dag, mot två av tre förra gången. | Vrider sig och byter utseende: fem av sex rätt i dag, mot två av tre förra gången. (mallen oförändrad, namnet nytt; `versal()` kan vara kvar, namnen börjar redan med versal) |
| 257 till 262 | `resultat.vadHande.titel` | Tre missar, två i samma familj / Tre missar, ingen familj sticker ut | Tre missar, två på samma mönster / Tre missar, inget mönster sticker ut |
| 264 | `resultat.vadHande.familjOvas` | Familjen går att öva med riktade pass. | Mönstret går att öva i ett riktat pass. |
| 265 | `resultat.vadHande.ingenFamilj` | Gå igenom dem, regeln och misstaget står på varje. | Gå igenom dem. Regeln och misstaget står vid varje fråga. |
| 296 | `matning.langsam` | Rätt men långsamma: vandring runt en ram | Rätt men långsamt: Figuren flyttar sig runt kanten (inget `.toLowerCase()`) |
| 297 | `matning.langsamMeta` | 2 av 3 över provets tid. Tempot tränas med egna pass. | 2 av 3 över provets tid. Tempot tränas i egna pass. |
| 298 | `matning.ingaFamiljer` | Inga familjer där du tappar i mätningen. Passen börjar på din nivå. | Inget mönster du tappade på i mätningen. Passen börjar på din nivå. |
| 309 till 310 | `matning.plan.passNivaMeta` | Riktat mot vandring runt en ram, nivå 3. / Nio uppgifter nära nivå 3. | Nio uppgifter nära nivå 3. Extra övning på mönstret du tappar mest på. / Nio uppgifter nära nivå 3. (namnet tas bort här, det står redan i kortet ovanför) |
| 345 | `ommatning.familjMot` | 1 av 3 rätt, mot 2 av 4 den 6 okt. | 1 av 3 rätt, mot 2 av 4 den 6 okt. (oförändrad) |
| 347 | `ommatning.familjHittills` | 1 av 3 rätt hittills. | 1 av 3 rätt hittills. (oförändrad) |

Raden efter regeln, "sträckuppgift" (pass-copy.ts rad 157 till 160 och 233 till 238):

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 157 | `regel.strackRatt` | Sträckuppgift över din nivå, klarad inom provets tid. | Svårare än din nivå, och du klarade den inom provets tid. |
| 158 | `regel.strackRattOverTid` | Sträckuppgift över din nivå. Rätt, men över provets tid. | Svårare än din nivå. Rätt, men över provets tid. |
| 159 | `regel.rattOverTid` | Rätt, men över provets tid. Tempot räknas i resultatet. | Rätt, men över provets tid. Tempot räknas med i resultatet. |
| 160 | `regel.strackFel` | Sträckuppgift över din nivå. | Den här var svårare än din nivå. |
| 235 | `resultat.sjonk` (två eller fler) | Två av missarna var sträckuppgifter över din nivå. De räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass. | Två av missarna var uppgifter över din nivå. De väger lätt när de blir fel och tungt när de blir rätt. Nivån rör sig högst ett halvt steg per pass. |
| 237 | `resultat.sjonk` (en) | En av missarna var en sträckuppgift över din nivå. Den räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass. | En av missarna var en uppgift över din nivå. Den väger lätt när den blir fel och tungt när den blir rätt. Nivån rör sig högst ett halvt steg per pass. |
| 238 | `resultat.sjonk` (ingen) | En dag säger lite. Nivån rör sig högst 0,5 per pass, och genomgången säger mer än talet. | En dag säger lite. Nivån rör sig högst ett halvt steg per pass, och genomgången säger mer än talet. |

### src/lib/traning/copy.ts

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 11 | `imorgon.familjUpp` | samma familj, ett steg svårare | samma mönster, ett steg svårare |
| 12 | `imorgon.nyFamilj` | ny familj | nytt mönster |
| 55 | `fel.familjSaknas` | Den familjen har inte tillräckligt många uppgifter än. | Det mönstret har för få uppgifter än så länge. |

### src/lib/traning/hemvy.ts (hårdkodat, ska läsa copyn)

| Rad | Gammal text | Ny text |
|---|---|---|
| 989 | 'samma familj, ett steg svårare' | TRANING_COPY.imorgon.familjUpp |
| 990 | 'ny familj' | TRANING_COPY.imorgon.nyFamilj |

### src/lib/traning/hem-copy.ts

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 106 | `pass.text` | Nio uppgifter, tio minuter. Sex nära din nivå, två säkra, en över. Regeln efter varje fråga. | Nio uppgifter, tio minuter. Sex nära din nivå, två lättare och en svårare. Regeln efter varje fråga. |
| 111 till 114 | `pass.lastText(svagaste)` | Nio uppgifter, tio minuter, nära din nivå och riktat mot vandring runt en ram. Från andra dagen ingår passen i Premium. | Nio uppgifter nära din nivå, tio minuter. Extra övning på mönstret du tappar mest på: Figuren flyttar sig runt kanten. Från andra dagen ingår passen i Premium. (inget `.toLowerCase()`) |
| 131 | `klart.riktat` | Riktade pass räknas i familjen, inte i nivån. | Ett riktat pass räknas på mönstret du övar, inte på din nivå. |
| 200 | `tappar.allaFamiljer` | Alla familjer | Alla mönster |
| 203 | `tappar.langsam` | Rätt men långsamma: vandring runt en ram | Rätt men långsamt: Figuren flyttar sig runt kanten (inget `.toLowerCase()`) |
| 208 | `tappar.kortPass` | Vandring runt en ram, kort pass | Kort pass: Figuren flyttar sig runt kanten |

### src/components/traning/utveckling/copy.ts

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 63 | `tappar.bara` | Gäller logiktestet. Verbalt och numeriskt har inga mönsterfamiljer än. | Gäller logiktestet. För text och siffror räknar vi inte mönster än. |
| 64 | `tappar.tomt` | Familjerna räknas när du gjort mätningen eller ett pass i logiktestet. | Mönstren räknas när du gjort mätningen eller ett pass i logiktestet. |
| 65 | `tappar.tomtTitel` | Inga familjer än | Inga mönster än |
| 67 | `tappar.ingetText` | Alla familjer med minst två frågor har gått rätt hittills. | Alla mönster med minst två frågor har gått rätt hittills. |
| 70 | `tappar.riktat` | Riktat pass: vandring runt en ram | Riktat pass: Figuren flyttar sig runt kanten (inget `.toLowerCase()`) |

### src/lib/tester/copy.ts

| Rad | Nyckel | Gammal text | Ny text |
|---|---|---|---|
| 131 till 132 | `genomgang.sammaFamilj` | Två av tre är samma familj: vandring runt en ram. | Två av tre är samma mönster: Figuren flyttar sig runt kanten. (matris: ingen gemening av namnet; verbalt och numeriskt: "samma typ" och gemen som i dag) |
| 149 | `tappade.allaSatt` | Alla familjer satt / Inga tapp i någon typ | Alla mönster satt / Inga tapp i någon typ |
| 150 | `tappade.fot` | Familjer med minst två frågor i testet. Hela bilden finns i Din utveckling. | Mönster med minst två frågor i testet. Hela bilden finns i Din utveckling. (följer av `term`) |
| 151 | `tappade.term.matris` | familjer | mönster |

### Undertitlar med mittpunkt

| Fil | Rad | Gammal text | Ny text |
|---|---|---|---|
| components/traning/GenomgangVy.tsx | 62 | Fråga 3 av 12 · Vandring runt en ram | Fråga 3 av 12, Figuren flyttar sig runt kanten |

PassFlode.tsx rad 116 och 120 visar mönstrets namn som titel i toppraden. Det är rätt plats för ett namn och behöver bara det nya namnet ur familjer.json.

## 8. Kontroll mot reglerna

- Inga talstreck, inga engelska ord, inga tal uppradade med mittpunkter i de nya texterna.
- Ett huvudtal bär mätningen: "3 av 10". Skalan har inga egna tal utöver axeln, målet står som ett tal i sin egen rad.
- "Vi" om oss, "du" till användaren. Modalitet där vi beskriver användarens läge ("blir det oftast fel än så länge"), rakt där vi beskriver vad vi gör ("Nivå 4 är vårt förslag").
- Läst högt: "Mest tappar du på två mönster. De står under Var du tappar." och "När två saker ändras samtidigt blir det oftast fel än så länge." låter som en person som förklarar, inte som ett system.
- Grammatik: "Rätt men långsamt" (adverb om utfallet, ersätter "långsamma" som böjde mot ett underförstått plural), "ett enda mönster" (neutrum), "Det mönstret" (neutrum), "Mönstren räknas" (bestämd plural).
