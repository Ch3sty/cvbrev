# Ordförråd omgång 3: 102 nya uppgifter (bankversion 4, inte aktiverad)

Datum 2026-11-19. Uppgifterna ligger sist i `src/lib/ordforradV1/bankGrund.json`, `bankAvancerad.json` och `bankExpert.json` med `fran_version: 4`. `ORD_VERSION` i `select.ts` står kvar på 3, så ingen session drar dem förrän version 4 aktiveras. Version 1 till 3 är orörda: diffen mot bankfilerna består bara av tillagda rader.

## Antal per nivå och typ

| Nivå | Synonymer | Motsatsord | Nya | Pool i version 3 | Pool i version 4 |
|---|---|---|---|---|---|
| Grund | 18 (substantiv 9, adverb 5, verb 3, adjektiv 1) | 16 (adjektiv 8, adverb 4, substantiv 4) | 34 | 163 | 197 |
| Avancerad | 18 (substantiv 9, verb 5, adjektiv 4) | 16 (adjektiv 9, substantiv 5, adverb 1, verb 1) | 34 | 171 | 205 |
| Expert | 24 (substantiv 12, adjektiv 9, verb 3) | 10 (adjektiv 8, substantiv 1, verb 1) | 34 | 121 | 155 |

Expert får tio nya motsatsord och går från 24 till 34. Fler gick inte att belägga utan att formen avslöjar svaret eller att vi lutar oss mot en enda källa (se punkt 1 under Hur uppgifterna togs fram).

Svårighet: samma frekvensband som tidigare, mätt på uppslagsordet med SO:s popularitetstal (grund minst 30 000, avancerad minst 500, expert mellan 50 och 300 000). Inom banden flyttade vi för hand. Avancerad fick fler arbetslivsord, expert fick fackord från statistik, medicin, ekonomi och språk.

Arbetslivsord och ord som brukar finnas i rekryteringstester: problem, betydelse, fokusera, omfatta, förverkliga, beakta, riktlinje, avtal, tvist, faktura, konkurrent, dagordning, föredrag, attityd, kompetent, rationell, gedigen, förbruka, nedsättande, medelvärde, brutto, relevant, förbud, expert, adekvat, signifikant, prognos, kontext, avhängig, fackman, allokera, kurant, kongruens, sekundär och lovord.

## Hur uppgifterna togs fram

1. **Kärnpar först.** Ungefär 300 par (ord och facit) prövades med `bygg-v4.mjs --karna` mot SO, SAOL, svenska Wiktionary och synonymer.se, och ungefär 170 föll. För att hitta motsatsord på expert läste vi också av SO:s MOTSATS- och SYN-hänvisningar i uppslagscachen och slog upp ett hundratal bildningsord för hand. De flesta föll på samma saker som förra gången:
   * facit som bara synonymer.se har (bistånd, misstag, förpliktelse, veteran, verklighet, sakkunskap, prejudikat)
   * facit som SO bara har som "jämför" utan stöd i Wiktionary (fruktan, energi, gynna, förhindra, utvärdera, antagande)
   * stilmarkering (smart, arkaisk, prosaisk, flegmatisk, habil, kompilera, konvention)
   * frekvens utanför bandet (framsida, artig, belöna, konstant, kontagiös)
   * ord eller facit som redan finns i banken (naturlig, ordning, offentlig, försiktig, blygsam, förbehållsam, expandera, inkludera, anarki, koncis).
2. **Handskrivna kandidater**, `src/lib/ordforradV1/kandidater/hand-2026-11-19-omg3.json`: ord, ordklass, facit, fyra distraktorer och en exempelmening. Inga distraktorer fylls i automatiskt.
3. **Bygget**, `scripts/ordforrad/bygg-v4.mjs`, en kopia av `bygg-v3.mjs` med samma regler: inga motsats- eller synonymdistraktorer, ingen distraktor får vara synonym, motsats eller SO "jämför" till ordet i någon av de fyra källorna, ingen får vara synonym eller motsats till facit, facit och distraktorer ska finnas i SO eller SAOL i rätt ordklass utan stilmarkering och med en definition, och OF7 räknas på hela banken. Två tillägg:
   * **Formkontroll på expert.** Delar facit för- eller efterled med uppslagsordet (minst tre bokstäver) måste minst två distraktorer dela ett lika långt led. Annars avvisas uppgiften. Samma kontroll står i `version4.test.ts`.
   * `--fil=<sökväg>` prövar en annan kandidatfil utan att skriva något, så att kärnpar kan testas i omgångar.

   I första körningen med distraktorer föll 43 av 102 kandidater, mest på distraktorer som saknar definition eller ordklass i SO (nyköpt, försenad, asfalterad, momsfri), på OF7 och på distraktorpar som SO räknar som synonymer (intyg och betyg, roman och novell, slutligen och äntligen). Alla skrevs om. Tredje körningen: 102 av 102.
4. **Läst för hand**: varje uppgift lästes med facit, facittext, misstagstexter och exempel. 20 facittexter och 49 misstagstexter är handskrivna. De står i `HANDSKRIVET` och `MISSTAG` i `bygg-v4.mjs`, och skälen står nedan.

## Granskningens fynd från omgång 2 och vad vi gjorde

* **Distraktorer som kan läsas som motsats eller synonym, också i en bibetydelse.** Utöver byggets kontroll strök vi för hand ord som ligger nära i någon betydelse: mjuk och blank vid len (båda kan läsas som synonymer), gammal, torr och rökt vid färsk (färskt bröd mot gammalt, färsk lax mot rökt), smal och tunn vid grov, lös vid spänd, ute och inne vid hemma, prioritera vid fokusera, offert vid avtal, kvitto vid faktura, median vid medelvärde, partner vid konkurrent, nybörjare, amatör och lärling vid expert, festlig, påkostad och spontan vid högtidlig, festlig och avspänd vid stel, ärftlig vid kongenital, fet vid eterisk (fet olja är motsatsen till eterisk olja), tvetydig vid adekvat, investera vid allokera, efterfrågad vid kurant, stark, skarp och matt vid mild, kastrerad vid fertil, synlig vid dominant. Behållna distraktorer som ligger i samma fält, till exempel öster och väster vid söder, är inga motsatser.
* **Könsstereotyper och politisk laddning.** Inga distraktorer om kön, religion eller politik. Vi valde bort par som immigrant och utvandrare, sekulär och religiös, progressiv och reaktionär samt protektionism och frihandel, och uppgifter om kön (kvinnlig och manlig finns redan). Exemplen växlar mellan han och hon.
* **Exempel som är fel i sak.** Vårt första exempel för dominant gällde bruna ögon, men ögonfärg ärvs inte enkelt dominant. Nu står det: "Anlaget är dominant, så det räcker att ärva det från en av föräldrarna." Latitud-exemplet nämner en ort som faktiskt ligger på Oslos breddgrad (Uppsala, 59,9 grader). Övriga exempel är lästa mot SO:s betydelse och mot fakta (zenit-felet från omgång 2 var vägledande).
* **Facittexter som förklarar ordet med sig självt.** Fyra SO-texter gjorde det: "det att vara tvetydig" (ambiguitet), "det att överensstämma" (kongruens), "få (någon) att bli förvånad" (förvåna) och, för recessiv, uppslagsordets egen definition (bygget föll tillbaka på dominant). Alla är handskrivna. Samma sak gällde 26 misstagstexter av typen "Nyfikenhet betyder det att vara nyfiken", "Lottning betyder det att lotta" och "Kopiera betyder göra kopia av". De är omskrivna.
* **Norvagismer.** SO:s text för även är "i tillägg". Den är bytt mot "likaså, på samma sätt". Vi sökte igenom alla facit- och misstagstexter efter "i tillägg", "i forhold" och liknande: inga träffar.
* **Fel betydelse i exemplet.** Elva facittexter hämtade fel betydelse ur SO och är handskrivna: tema ("beståndsdel som föremål kan vara uppbyggda av"), räkning ("det att hålla kontroll på antal"), rival ("tävlar om någons kärlek"), hållning ("sätt att hålla kroppen"), solid ("saknar håligheter"), tillstånd ("omständigheter som något befinner sig i"), rätt ("i någorlunda hög grad"), upptagen (om en person, exemplet gäller en stol), steril ("fri från mikroorganismer"), samt idé och svårighet. Fyra till är handskrivna för att SO:s text var stel eller för allmän: fokusera, agenda, vardaglig och gångbar. Samma sak med misstagstexter (17 stycken): lova ("styra segelbåt upp mot vinden"), långrandig ("randig på längden"), böjd ("benägen"), negativ ("egenskaper motsatta de naturliga"), domare ("ordförande i domstol"), medicin, behandling, kalender, ritning, bakgrund, presentera, revidera, isolera (två uppgifter, två olika texter), frysa, tålig och välbyggd. Sex till fick en text som passar sammanhanget: ekologisk tre gånger (matvaror och oljor, inte "som har att göra med ekologi"), svensk (SO:s text har liten bokstav på Sverige), ihop och kronologisk.
* **Motsatsord på expert som går att lösa på formen.** Nio av tio delar inget för- eller efterled med facit (lovord och klander, dominant och recessiv, försynt och framfusig, sekundär och huvudsaklig, mild och gräll, stel och otvungen, fertil och steril, nomadisk och bofast, singular och plural). Attrahera och repellera delar -era, och alla fyra distraktorer är också verb på -era (isolera, oxidera, polera, kalibrera). Vi strök par där formen avslöjar: progressiv och regressiv, benign och malign, dysfori och eufori, heterodox och ortodox, altruist och egoist, aerob och anaerob, legato och stackato.

Dessutom, från granskningens anmärkningar: kroppsliga tillstånd som distraktorfamilj på grund är borta (inga andfådd, sömnig, förkyld och liknande). Grunddistraktorerna i adjektivuppgifterna är mönster, färger, material och skick.

## Källkontroller

Beläggen står i fältet `kalla` på varje uppgift: källa, beläggstext, SO:s lemma-id och datumet 2026-11-19. Första belägget per uppgift står i id-listan nedan.

| Belagt mot | Uppgifter |
|---|---|
| SO | 38 |
| SAOL | 27 |
| SO och SAOL | 19 |
| SO och Wiktionary (SO "jämför" plus Wiktionary synonym) | 4 |
| Wiktionary och synonymer.se (SO och SAOL saknar uppgiften) | 14 |

84 av 102 facit är alltså belagda direkt i SO eller SAOL (SYN, MOTSATS eller facit i definitionen), mot 74 av 103 i omgång 2. Två motsatsord är belagda i två steg inom SO: triumf och nederlag (triumf förklaras med seger, seger har motsats nederlag) samt inhemsk och utländsk (inhemsk förklaras med inländsk, inländsk har motsats utländsk).

De fyra med SO "jämför" plus Wiktionary: tycka och anse, hemsk och förfärlig, konkurrent och rival samt kontext och sammanhang.

De 14 som vilar på Wiktionary och synonymer.se är nästan alla självklara par där SO saknar MOTSATS-hänvisning: hemma och borta, söder och norr, gäst och värd, vit och svart, succé och fiasko, expert och lekman, kortvarig och långvarig, högtidlig och vardaglig, försynt och framfusig, sekundär och huvudsaklig samt nomadisk och bofast. Dit hör tre synonympar: omfatta och inbegripa, ambiguitet och tvetydighet samt prognos och förutsägelse. (Inhibera och hämma stod här före granskningen och är rättat, se nedan.)

Varje distraktor finns i SO eller SAOL i samma ordklass och har en definition där. Den definitionen är misstagstexten, utom de 49 handskrivna.

## Verifieringen

* `node scripts/ordforrad/bygg-v4.mjs --torr`: 102 kandidater, 102 godkända, 0 avvisade. Skarp körning gav samma resultat, och `kandidater/avvisade-2026-11-19-omg3.json` är en tom lista.
* `node scripts/ordforrad-verifiera.mjs`: version 4 rapporteras som "102 uppgifter, INTE aktiverad (ORD_VERSION är 3)". Banken klarar V1 till V9. De fem anmärkningarna om falska vänner gäller version 1 och är kända sedan tidigare. Version 4 ger inga.
* `node scripts/ordforrad-verifiera.mjs --natet --fran 4`: "Uppslag från version 4: 0 fel."
* `node scripts/validate-ordforrad.mjs`: OF1 till OF8 gröna.
* `node scripts/artikel-steg2-check.mjs`: grön (49 artikeluppgifter, ingen krock med bankerna).
* vitest med `--exclude ".claude/**"` är grön i `src/lib/ordforradV1` (spärrarna, version2, version3 och nya `version4.test.ts`), `src/lib/tester`, `src/lib/figurserierV1`, `src/lib/traningsmejl` och `src/components`: 55 filer.
* `npx tsc --noEmit -p .`: inga fel i ordförrådets filer.
* Aktiveringen är provkörd: med `ORD_VERSION = 4` och testraderna i steg 3 nedan gick samma vitest-körning grön och `--natet` gav 0 fel. Ändringarna är återställda, `ORD_VERSION` står på 3.

En testrad ändrades. `version3.test.ts` krävde att allt efter första version 3-raden var version 3. Nu krävs version 3 eller senare, eftersom version 4 ligger sist.

## Anmärkningar till granskningen

* **Facit under nivåns frekvens på grund.** Banden mäter uppslagsordet. Förfärlig (9 384), sträv (4 513), trubbig (4 262), slak (12 672) och åkomma (20 874) är ovanligare än sina uppslagsord. Alla är vardagsord som de flesta vuxna känner igen, och uppgifterna går att lösa genom uteslutning. Läs av andel rätt på of-g-s-99 och of-g-s-104 efter 30 dagar.
* **Vanliga uppslagsord på expert.** Mild (84 296) och stel (62 137) ligger högt i bandet. Det är facit som prövas: gräll och otvungen är svåra ord, och SO har dem som MOTSATS. Flytta till avancerad om andelen rätt blir hög.
* **Fackord på expert.** Kongenital, latitud, ambiguitet, inhibera, recessiv och singular hör hemma i medicin, geografi, språk och biologi. Exemplen förklarar sammanhanget utan att avslöja svaret. Ambiguitet har låg frekvens (89) men är det ord som används i juridiska och språkvetenskapliga texter.
* **Lätta par.** Vit och svart, uppe och nere samt söder och norr på grund är medvetet lätta. Avtal och kontrakt samt faktura och räkning är lättare än avancerad brukar vara, men vanliga i arbetslivet.
* **Fysisk och psykisk** (avancerad) och **fertil och steril** (expert) har ett tredje ord som ofta nämns i samma andetag (social, kastrerad). Inget av dem står bland alternativen.
* **Samma fält i flera uppgifter.** Expert (avancerad, motsatsord) och fackman (expert, synonym) ligger på olika nivåer och har olika facit. Berömma och lovorda (avancerad) strök vi, eftersom lovord redan är uppslagsord på expert.

## Åtgärdat efter granskningen (2026-11-19)

Testansvarig godkände med villkor (`ordforrad-2026-11-19-omg3-granskning.md`). Alla 28 rättelser är gjorda i kandidatfilen och i `HANDSKRIVET` och `MISSTAG` i `bygg-v4.mjs`. Ingen uppgift ströks, och alla 102 id är desamma som före rättelserna (kontrollerat ord för ord mot förra körningen).

* **Inhibera (of-e-s-121):** facit är nu annullera (SAOL inhibera: "ställa in, annullera"), med exemplet "Arrangören inhiberade konserten med kort varsel." och facittexten "ställa in eller förklara ogiltig". Frysa är bytt mot inventera. Mäta föll på OF4 mot det längre facit och är bytt mot kartlägga, med handskriven misstagstext (SO:s "göra karta över" förklarar ordet med sig självt). Regeln vi tar med oss: ett Wiktionary-belägg räcker bara när SO och SAOL inte har en annan betydelse för samma ord.
* **Exempel:** signifikant ("Hon spelade en signifikant roll i förhandlingarna.", ny facittext "som har stor vikt eller verkan"), allmän ("Kommunen ska ta hänsyn till allmänna intressen."), sekundär ("Exporten är företagets sekundära inkomstkälla.") och alternera ("Regn och sol alternerade under hela veckan.").
* **Facittexter:** kontradiktion, ihålig, adekvat, beakta, rationell, animositet, perception och tvist enligt granskningen. Slak fick också den frivilliga texten "som hänger löst och inte är sträckt".
* **Misstagstexter:** alla 18 enligt granskningens tabell.
* **Ny kontroll i bygget:** `sjalvforklarad` i `bygg-v4.mjs` fäller en uppgift när en misstagstext eller facittexten förklarar ordet med ett ord av samma stam (minst fem gemensamma första bokstäver, fyra om förklaringsordet är längre, eller samma tre första konsonanter). Klart kortare grundord räknas inte (rost i rostig). Kontrollen fångar alla 18 misstagstexter och de tre facittexter (betydelsefull, uppmärksamma, förnuftig) som granskningen av omgång 3 hittade, bland dem irritera och irritation, oxidera och oxidation, kunnig och kunnande samt mogna och mogen. 37 träffar som granskningen godkänt (smärtsam och smärta, kommunal och kommun, blank och bland med flera) står i `GODKAND_SJALV`. Nya träffar läggs dit bara efter granskning.
* **Kontroller efter rättelserna:** bygget 102 av 102 godkända med samma id, verifieraren med `--natet --fran 4` 0 fel, validate-ordforrad grön, artikel-steg2-check grön och vitest grön (55 filer, 505 tester) i ordförrådet, tester, figurserier, träningsmejl och komponenter. `ORD_VERSION` står kvar på 3.

## Så aktiveras version 4

1. Rätta eller stryk enligt granskningen. Ändra raden i `kandidater/hand-2026-11-19-omg3.json`, lägg handskrivna texter i `HANDSKRIVET` eller `MISSTAG` i `bygg-v4.mjs` och kör `node scripts/ordforrad/bygg-v4.mjs --torr`, sedan utan `--torr`. Bygget ersätter bara version 4-raderna. Id-numren läggs om i följd vid varje körning, så stryk före aktivering och inte efter.
2. I `src/lib/ordforradV1/select.ts`: byt `export const ORD_VERSION = 3;` mot `export const ORD_VERSION = 4;`. Nya sessioner får `ord_version: 4` i meta. Sessioner med version 1 till 3 drar samma uppgifter som förut, eftersom `poolFor` filtrerar på `fran_version`.
3. Testerna.
   * `src/lib/ordforradV1/__tests__/version4.test.ts`: lägg till `import { ordforradAntal } from '../status'` under importen från `'../select'`, och byt hela blocket `it('inlagd men inte aktiverad', ...)` mot:

     ```ts
     it('version 4 är aktiverad', () => {
       expect(ORD_VERSION).toBe(4)
       for (const n of NIVAER) {
         expect(poolFor(n).some((q) => q.fran_version === 4)).toBe(true)
         expect(poolFor(n, 4).length).toBe(poolFor(n, 3).length + v4.filter((q) => q.niva === n).length)
         for (const q of valjOrd(n, 'session-v3', 3)) expect(q.fran_version).toBeLessThanOrEqual(3)
       }
       expect(ordforradAntal()).toEqual({
         grund: { synonym: 104, antonym: 93 },
         avancerad: { synonym: 113, antonym: 92 },
         expert: { synonym: 121, antonym: 34 },
       })
     })
     ```

   * `src/lib/ordforradV1/__tests__/version3.test.ts`: ta bort `import { ordforradAntal } from '../status'` och byt hela blocket `it('version 3 är aktiverad', ...)` mot:

     ```ts
     it('version 3 finns kvar för sina sessioner', () => {
       expect(ORD_VERSION).toBeGreaterThanOrEqual(3)
       for (const n of NIVAER) {
         expect(poolFor(n, 3).length).toBe(poolFor(n, 2).length + v3.filter((q) => q.niva === n).length)
         for (const q of valjOrd(n, 'session-v2', 2)) expect(q.fran_version).toBeLessThanOrEqual(2)
       }
     })
     ```

   * `version2.test.ts` behöver inga ändringar (den kräver redan `ORD_VERSION` 2 eller högre).
4. Kör `node scripts/ordforrad-verifiera.mjs --natet`, `node scripts/validate-ordforrad.mjs`, `node scripts/artikel-steg2-check.mjs` och `npx vitest run src/lib/ordforradV1 src/lib/tester --exclude ".claude/**"`.
5. Till changelogen: percentilen i "Var du står" blandar version 1 till 4. Artiklarnas uppgift 1 kan i upp till ett dygn (CDN-cache) skilja sig från det nystartade provet, precis som vid version 2 och 3.

## Filer

* `scripts/ordforrad/bygg-v4.mjs` (nytt)
* `src/lib/ordforradV1/kandidater/hand-2026-11-19-omg3.json` (nytt, kandidaterna)
* `src/lib/ordforradV1/kandidater/avvisade-2026-11-19-omg3.json` (nytt, tom lista efter sista körningen)
* `src/lib/ordforradV1/bankGrund.json`, `bankAvancerad.json`, `bankExpert.json` (version 4-raderna sist)
* `src/lib/ordforradV1/__tests__/version4.test.ts` (nytt) och `version3.test.ts` (en rad ändrad)
* `docs/fragebank/ordforrad-2026-11-19-omg3.md` (det här dokumentet)

## Id-lista

**Grund, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-s-87 | bara | endast | SO bara: synonym endast |
| of-g-s-88 | också | även | SO också: synonym även |
| of-g-s-89 | igen | åter | SAOL igen: förklaras med åter ("än en gång, åter") |
| of-g-s-90 | verkligen | sannerligen | SO sannerligen: synonym verkligen |
| of-g-s-91 | fortfarande | alltjämt | SO fortfarande: synonym alltjämt |
| of-g-s-92 | betydelse | innebörd | SO innebörd: förklaras med betydelse ("(egentlig) betydelse eller mening") |
| of-g-s-93 | ämne | tema | SAOL ämne: förklaras med tema ("tema, fråga") |
| of-g-s-94 | tanke | idé | SAOL idé: förklaras med tanke ("tanke, föreställning; infall, uppslag") |
| of-g-s-95 | problem | svårighet | SAOL problem: förklaras med svårighet ("vansklig fråga, spörsmål; svårighet") |
| of-g-s-96 | omgivning | miljö | SAOL miljö: förklaras med omgivning ("yttre förhållanden som påverkar allt liv; omgivning") |
| of-g-s-97 | avstånd | distans | SAOL avstånd: förklaras med distans ("distans; äv. bildl.") |
| of-g-s-98 | fart | hastighet | SO fart: synonym hastighet |
| of-g-s-99 | sjukdom | åkomma | SO åkomma: förklaras med sjukdom ("besvärande, inte alltför allvarlig, sjukdom eller skada") |
| of-g-s-100 | verktyg | redskap | SAOL redskap: förklaras med verktyg ("verktyg; hjälpmedel; person som okritiskt biträder ngn") |
| of-g-s-101 | tycka | anse | SO tycka: jämför anse |
| of-g-s-102 | gömma | dölja | SO gömma: förklaras med dölja ("") |
| of-g-s-103 | förvåna | överraska | SAOL förvåna: förklaras med överraska ("förundra, överraska") |
| of-g-s-104 | hemsk | förfärlig | SO hemsk: jämför förfärlig |

**Grund, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-g-m-78 | uppe | nere | SO uppe: motsats nere |
| of-g-m-79 | hemma | borta | Wiktionary: hemma och borta listas som motsatsord |
| of-g-m-80 | söder | norr | Wiktionary: söder och norr listas som motsatsord |
| of-g-m-81 | gäst | värd | Wiktionary: gäst och värd listas som motsatsord |
| of-g-m-82 | vit | svart | Wiktionary: vit och svart listas som motsatsord |
| of-g-m-83 | ledig | upptagen | SO upptagen: motsats ledig |
| of-g-m-84 | len | sträv | SO len: motsats sträv |
| of-g-m-85 | vass | trubbig | SO vass: motsats trubbig |
| of-g-m-86 | spänd | slak | SO spänd: motsats slak |
| of-g-m-87 | ensamhet | gemenskap | SO ensamhet: motsats gemenskap |
| of-g-m-88 | kyla | värme | SO kyla: motsats värme |
| of-g-m-89 | jämn | udda | SO jämn: motsats udda |
| of-g-m-90 | färsk | fryst | SO färsk: motsats fryst |
| of-g-m-91 | grov | klen | SO grov: motsats klen |
| of-g-m-92 | fel | rätt | SO fel: motsats rätt |
| of-g-m-93 | tidigare | senare | SO tidigare: motsats senare |

**Avancerad, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-s-96 | fokusera | koncentrera | SO fokusera: förklaras med koncentrera ("") |
| of-a-s-97 | omfatta | inbegripa | Wiktionary: omfatta och inbegripa listas som synonymer |
| of-a-s-98 | förverkliga | realisera | SO förverkliga: synonym realisera |
| of-a-s-99 | beakta | uppmärksamma | SAOL beakta: förklaras med uppmärksamma ("ta hänsyn till, uppmärksamma") |
| of-a-s-100 | riktlinje | direktiv | SAOL direktiv: förklaras med riktlinje ("riktlinje, anvisning, föreskrift") |
| of-a-s-101 | avtal | kontrakt | SAOL avtal: förklaras med kontrakt ("kontrakt, överenskommelse") |
| of-a-s-102 | tvist | dispyt | SAOL dispyt: förklaras med tvist ("tvist, ordväxling") |
| of-a-s-103 | faktura | räkning | SO faktura: förklaras med räkning ("räkning") |
| of-a-s-104 | konkurrent | rival | SO konkurrent: jämför rival |
| of-a-s-105 | dagordning | agenda | SO dagordning: synonym agenda |
| of-a-s-106 | föredrag | anförande | SAOL anförande: förklaras med föredrag ("tal, föredrag") |
| of-a-s-107 | attityd | hållning | SAOL hållning: förklaras med attityd ("attityd, inställning") |
| of-a-s-108 | kompetent | kvalificerad | SAOL kvalificerad: förklaras med kompetent ("lämplig; behörig; kompetent; som kräver kompetens") |
| of-a-s-109 | rationell | förnuftig | SAOL rationell: förklaras med förnuftig ("förnuftsenlig; förståndsmässig; förnuftig; praktiskt ändamålsenlig, väl planlagd") |
| of-a-s-110 | gedigen | solid | SAOL gedigen: förklaras med solid ("fullödig, solid; ren") |
| of-a-s-111 | förbruka | konsumera | SO förbruka: synonym konsumera |
| of-a-s-112 | nedsättande | förklenande | SO nedsättande: synonym förklenande |
| of-a-s-113 | medelvärde | genomsnitt | SO medelvärde: synonym genomsnitt |

**Avancerad, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-a-m-77 | succé | fiasko | Wiktionary: succé och fiasko listas som motsatsord |
| of-a-m-78 | triumf | nederlag | SO triumf: synonym eller förklaring seger |
| of-a-m-79 | expert | lekman | Wiktionary: expert och lekman listas som motsatsord |
| of-a-m-80 | fysisk | psykisk | SO fysisk: motsats psykisk |
| of-a-m-81 | brutto | netto | SO brutto: motsats netto |
| of-a-m-82 | ihålig | massiv | SO ihålig: motsats massiv |
| of-a-m-83 | stelna | smälta | SO stelna: motsats smälta |
| of-a-m-84 | rymlig | trång | SO rymlig: motsats trång |
| of-a-m-85 | relevant | ovidkommande | SO relevant: motsats ovidkommande |
| of-a-m-86 | förbud | tillstånd | SO förbud: motsats tillstånd |
| of-a-m-87 | allmän | enskild | SO allmän: motsats enskild |
| of-a-m-88 | absolut | relativ | SO absolut: motsats relativ |
| of-a-m-89 | kortvarig | långvarig | Wiktionary: kortvarig och långvarig listas som motsatsord |
| of-a-m-90 | högtidlig | vardaglig | Wiktionary: högtidlig och vardaglig listas som motsatsord |
| of-a-m-91 | tragedi | komedi | SO tragedi: motsats komedi |
| of-a-m-92 | inhemsk | utländsk | SO inhemsk: synonym eller förklaring inländsk |

**Expert, synonymer**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-s-98 | adekvat | träffande | SAOL adekvat: förklaras med träffande ("fullt motsvarig, träffande, riktig") |
| of-e-s-99 | signifikant | betydelsefull | SAOL signifikant: förklaras med betydelsefull ("betecknande; betydelsefull") |
| of-e-s-100 | autentisk | äkta | SAOL autentisk: förklaras med äkta ("äkta, tillförlitlig") |
| of-e-s-101 | ambiguitet | tvetydighet | Wiktionary: ambiguitet och tvetydighet listas som synonymer |
| of-e-s-102 | prognos | förutsägelse | Wiktionary: prognos och förutsägelse listas som synonymer |
| of-e-s-103 | animositet | fiendskap | SAOL animositet: förklaras med fiendskap ("ovilja, fiendskap") |
| of-e-s-104 | aversion | motvilja | SO aversion: förklaras med motvilja ("motvilja") |
| of-e-s-105 | melankoli | svårmod | SAOL melankoli: förklaras med svårmod ("svårmod, tungsinthet") |
| of-e-s-106 | perception | varseblivning | SAOL perception: förklaras med varseblivning ("förnimmelse, varseblivning") |
| of-e-s-107 | kontext | sammanhang | SO kontext: jämför sammanhang |
| of-e-s-108 | kongenital | medfödd | SO kongenital: förklaras med medfödd ("medfödd") |
| of-e-s-109 | avhängig | beroende | SO avhängig: synonym beroende |
| of-e-s-110 | latitud | breddgrad | SO latitud: synonym breddgrad |
| of-e-s-111 | egocentrisk | självupptagen | SO egocentrisk: synonym självupptagen |
| of-e-s-112 | eterisk | flyktig | SO eterisk: förklaras med flyktig ("flyktig") |
| of-e-s-113 | alternera | omväxla | SO alternera: förklaras med omväxla ("omväxla") |
| of-e-s-114 | kontradiktion | motsägelse | SO kontradiktion: synonym motsägelse |
| of-e-s-115 | fackman | specialist | SO fackman: synonym specialist |
| of-e-s-116 | ackumulation | anhopning | SO ackumulation: förklaras med anhopning ("anhopning") |
| of-e-s-117 | allokera | fördela | SAOL allokera: förklaras med fördela ("anvisa t.ex. resurser, tilldela, fördela") |
| of-e-s-118 | kurant | gångbar | SAOL kurant: förklaras med gångbar ("gångbar") |
| of-e-s-119 | kongruens | överensstämmelse | SAOL kongruens: förklaras med överensstämmelse ("överensstämmelse, likformighet; fullständig likhet") |
| of-e-s-120 | pittoresk | målerisk | SAOL pittoresk: förklaras med målerisk ("målerisk") |
| of-e-s-121 | inhibera | annullera | SAOL inhibera: förklaras med annullera ("ställa in, annullera") |

**Expert, motsatsord**

| Id | Ord | Facit | Källa |
|---|---|---|---|
| of-e-m-25 | lovord | klander | SO lovord: motsats klander |
| of-e-m-26 | attrahera | repellera | SO attrahera: motsats repellera |
| of-e-m-27 | dominant | recessiv | SO dominant: motsats recessiv |
| of-e-m-28 | försynt | framfusig | Wiktionary: försynt och framfusig listas som motsatsord |
| of-e-m-29 | sekundär | huvudsaklig | Wiktionary: sekundär och huvudsaklig listas som motsatsord |
| of-e-m-30 | mild | gräll | SO mild: motsats gräll |
| of-e-m-31 | stel | otvungen | SO stel: motsats otvungen |
| of-e-m-32 | fertil | steril | SO fertil: motsats steril |
| of-e-m-33 | nomadisk | bofast | Wiktionary: nomadisk och bofast listas som motsatsord |
| of-e-m-34 | singular | plural | SO singular: motsats plural |
