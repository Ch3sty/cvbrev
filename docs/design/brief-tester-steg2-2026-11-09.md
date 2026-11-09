# Brief: Tester steg 2. Rumsuppfattning, talserier, ordförråd, I-prov-övningsprovet och "Mitt test är …"

Testansvarig, 2026-11-09. Till art-director (skissen som ägaren godkänner) och Opus (bygget efteråt). Underlag: `docs/rapporter/gap-testtyper-2026-11-09.md`, koden i `src/lib/logicTestV7`, `figurserierV1`, `deduktivV1`, `src/lib/traning`, `src/lib/ovningsprov`, `src/app/dashboard/tester`, minnesfilerna om matrissystemet, testfokus, data som bild och svenska facktermer, samt webbkällorna i avsnitt 9. Ingen kod är ändrad.

Ordregler i allt som byggs: "samma format som", aldrig "samma test". Svenska facktermer. Inga tankstreck, inga mittpunkter mellan fakta. Tal får hierarki (ett huvudtal eller en liten visualisering, resten i detaljvy). Inga påhittade normer.

---

## 0. Besluten i korthet

1. **En ny testtyp "Rumsuppfattning"** (`kind: 'spatial'`) med tre uppgiftsformer i samma nivåtest: vriden eller speglad figur i 2D, pappersvikning med hål och klipp, kubrotation i 3D. 15 uppgifter per nivå, fem per form, blandade. I I-prov-provet körs formerna som egna deltester. Namnet i produkten är Rumsuppfattning (Pliktverkets ord), artiklarna behåller "spatial förmåga" för söket. Se öppen fråga 6.
2. **Talserier** (`kind: 'talserie'`): ren generator, åtta regelfamiljer, en lucka på grund och två luckor från avancerad (I-provets form). 15 uppgifter per nivå.
3. **Ordförråd** (`kind: 'ordforrad'`): synonymer och motsatsord, ett ord i versaler och fem alternativ. En kuraterad bank, inte en generator. 20 uppgifter per nivå, tio av varje slag.
4. **I-prov-övningsprovet** är ett provpaket med sex deltester i I-provets ordning (synonymer, pappersvikning, talserier, motsatsord, tärningar, pappersvikning med klipp), maxtid per deltest, ingen väg tillbaka mellan deltester. Resultatet visas som antal rätt per deltest, aldrig stanine, eftersom vi saknar normgrupp.
5. **"Mitt test är …"** ersätter dagens "Vet du vem som gör testet?" i ingången och får åtta val i vanligt språk. Valet styr vilka deltester som ingår i planen, passens blandning, övningsprovets format och tempo, och vad Alla tester lyfter överst.
6. **Nivån 1 till 10 och Nivåkollen förblir matrisernas.** De nya typerna får antal rätt, tempo och "var du tappar" per uppgiftsform, som figurserier och deduktivt. Adaptiv nivå för nya typer väntar tills bankerna är kalibrerade.
7. **Bygget går i åtta delar** (avsnitt 8). Generatorer och spärrar kan börja före skissen, eftersom de valideras i skript. Allt som syns väntar på ägarens godkännande av skissen.

---

## 1. Vad källorna säger, och vad som inte går att belägga

| Påstående | Status | Källa |
|---|---|---|
| I-prov 2025 infördes 5 maj 2025, används vid mönstring, polisprövning, officersaspiranter, Tullverket och Kustbevakningen | Verifierat (myndighet och Polistidningen) | pliktverket.se nytt-i-prov, Polistidningen 2025-04 |
| Sex deltester: synonymer, antonymer, talserier, tärningar, pappersvikningar, pappersvikningar med klipp. Pliktverkets övningssida har två uppgifter per kategori | Verifierat (pliktverket.se testa-i-provet) | pliktverket.se/gemensam/testa-i-provet |
| Ordningen i provet: synonymer, pappersvikningar, talserier, motsatsord, tärningar, pappersvikningar med klipp | Tredjepart som citerar Försvarshögskolans manual 2025 | taktisk.se 2026-07-17 |
| Total provtid 70 minuter, snittprövande klar på 35 minuter, provet är linjärt (inte adaptivt), maxtid per deltest, tre eller fyra parallella versioner per deltest | Tredjepart som citerar FHS-manualen. Pliktverket publicerar inte talen | taktisk.se |
| Cirka 12 till 20 uppgifter per deltest | Tredjepart utan källa | testttalent.se |
| Synonymer och motsatsord: ett ord i versaler, fem alternativ. Talserier: en rad tal följs av två tomma rutor, du väljer två tal i rätt ordning. Tärningar: tärningar med sex olika figurer visas från olika håll, avgör om de kan vara samma tärning. Pappersvikning med klipp: arket viks enligt pilar och klipps längs streckade linjer | Tredjepartsbeskrivningar av Pliktverkets övningsuppgifter. Övningssidan är interaktiv och gick inte att läsa maskinellt | logiktester.se/i-provet, rustadsoldat.se |
| Stanine 1 till 9. Krav: polis minst 4, värnplikt minst 3, officersprogrammet minst 6. En fyra på I-provet motsvarar ungefär en trea på UNIQ | Polisens krav verifierat (Polistidningen), övriga krav tredjepart | Polistidningen, testttalent.se |
| SHL Verify G+: 30 frågor på 36 minuter, tio numeriska, tio deduktiva, tio induktiva | Verifierat mot SHL:s svenska faktablad | service.shl.com Verify G plus Fact Sheet Swedish |
| SHL Verify Interactive induktiv: upp till 15 uppgifter på 18 minuter. Deduktiv flerval: 18 på 20 minuter. Deduktiv interaktiv: 12 på 18 | Tredjepart, samstämmig | practiceaptitudetests, jobtestprep.co.uk |
| Aon scales: ix 20 på 5 minuter, cls 12 på 12 minuter, lst 6 minuter "så många som möjligt", e3+ koncentration 2 minuter "så många som möjligt", verbal 49 på 12 minuter | Tredjepart, samstämmig; ix redan belagd i repo | jobtestprep.co.uk, jobtestprep.se lokförare |
| Lokförarskolorna (TCC, ProTrain, Trafikverksskolan, MTR) använder Aon scales cls, ix, e3, nav, rt, verbal plus ordförråd, minne, personlighet | Tredjepart | jobtestprep.se/lokforare-test |
| Matrigma 35 på 40 (klassisk), adaptiv cirka 12 minuter. Alva 20 uppgifter, två minuter var | Redan i repo (`tempo.ts`), Matrigma klassisk flaggad som tredjepart | tempo.ts |

**Konsekvens:** Allt som gäller I-provets antal och tid skrivs med "cirka" och med meningen "Pliktverket publicerar inte provets antal och tider, vårt övningsprov följer deltesternas ordning och uppgiftstyper." Innan bygget ska Opus eller art-director själv göra de tolv övningsuppgifterna på pliktverket.se i webbläsare och skriva ner svarsformatet per kategori i `docs/tester/i-prov-format.md` (öppen fråga 1).

Rättelsen i `content/artiklar/rotation-test-guide.mdx` är redan gjord (FAQ säger nu "Något eget rotationstest har vi inte"). När Rumsuppfattning är live skrivs den om igen och får ett smakprov.

---

## 2. Rumsuppfattning (`kind: 'spatial'`)

Slugar `rumsuppfattning-grund`, `-avancerad`, `-expert`. 15 uppgifter per nivå, fem per uppgiftsform, blandade men aldrig två av samma form i följd. Ungefärlig tid 12, 15 och 18 minuter. Grund fri, övriga `tests_above_base`. Sessioner i `logic_test_v4_sessions` med `test_type` = slugen och `meta.spatial_version: 1`. Urval 15 av poolen seedat på sessions-id som figurserierna (`select.ts`-mönstret). Rättning på servern.

Gemensamt för de tre formerna: fyra svarsalternativ A till D (Neurobics och I-provets tärningar använder fyra till fem, matriserna sex). Alternativen blandas per session (`blanda.ts`). Varje alternativ har en misstagstext som genomgången visar. Alla figurer ritas med V7:s färgroller (bläck, papper, ram-grått, koppar för rätt svar) och grafik v3:s måttregler (yttermått 58 till 64, inget målat utanför [14, 86], kontur 3, ram 2,5).

### 2.1 Form A: vriden eller speglad figur (2D)

**Uppgift.** En referensfigur till vänster (eller överst på mobil) och fyra alternativ. Frågan: "Vilken figur är samma som den första, bara vriden?" Ett alternativ är referensen vriden 90, 180 eller 270 grader. De tre andra är speglade (och sedan vridna), eller har en ruta flyttad.

**Figuren.** En brickfigur: fyllda rutor i ett rutnät, som `tile` (3×3, bitmask) men större. Ny primitiv `brick` med `n: 3 | 4 | 5` och `pattern: number` (n² bitar). Tomma rutor ritas inte (ingen ram), bara de fyllda som bläckrutor med 1 enhets luft mellan rutorna, så att figuren läses som en sammanhängande form (polyomino) och inte som ett rutnät. Figurens omskrivna kvadrat skalas till 60 enheter oavsett n. Expert får dessutom en markerad ruta (grå fyllning med bläckkontur) så att en vridning som råkar likna en spegling ändå går att skilja.

**Nivåer.**

| Nivå | Rutnät och rutor | Facit | Distraktorer |
|---|---|---|---|
| Grund | 3×3, 4 till 5 fyllda rutor, sammanhängande | vridning 90 eller 180 | en spegling (lodrät axel) ovriden, en spegling vriden, en med en ruta flyttad |
| Avancerad | 4×4, 5 till 7 rutor | alla tre vridningar | tre speglingar (lodrät, vågrät, diagonal) var och en vriden olika |
| Expert | 5×5, 7 till 9 rutor, en grå ruta | alla tre vridningar | tre speglingar vridna så att varje distraktor delar minst 80 procent av rutorna med facit vid bästa överlagring |

Vad som gör det svårare: fler rutor att hålla i huvudet, 270 grader i stället för 90, spegling som dessutom är vriden (då går det inte att avfärda genom "det ser bakvänt ut"), och distraktorer som överlappar facit nästan helt.

**Generering.** Slumpa (seedat) en sammanhängande polyomino i n×n. Beräkna de åtta symmetrioperationerna (fyra vridningar, fyra speglingar). Facit = en vridning. Distraktorer dras ur speglingarna och ur "en ruta flyttad". Facit är deterministiskt eftersom det är en ren operation på bitmasken.

**Spärrar (SP-A).**

| Nr | Regel | Kontroll |
|---|---|---|
| SP-A1 | Figuren har ingen rotationssymmetri: de fyra vridningarna är fyra olika bitmasker (G6-motsvarighet) | kanonisk nyckel per vridning, alla fyra unika |
| SP-A2 | Figuren har ingen spegelsymmetri: ingen av de fyra speglingarna är lika med någon vridning. Annars är "speglad" också "vriden" och frågan tvetydig | mängden speglingar och mängden vridningar är disjunkta |
| SP-A3 | Alla fyra alternativ olika som bitmasker, och inget alternativ lika med referensen (ingen "ovriden kopia") | kanonisk nyckel |
| SP-A4 | "En ruta flyttad" får inte råka bli en spegling eller vridning av referensen | jämför mot alla åtta operationer |
| SP-A5 | Facit på grund är aldrig 180 grader när figuren är nära punktsymmetrisk (minst två rutor skiljer mellan figuren och dess 180-gradersvridning) | Hammingavstånd ≥ 2 |
| SP-A6 | Expert: varje distraktor delar 80 till 95 procent av rutorna med facit vid bästa överlagring (annars för lätt eller för lik) | räknas per distraktor |
| SP-A7 | Ingen figur som blir en känd symbol (bokstav L, T, kors, pil) på grund: de läses semantiskt, inte spatialt | lista över förbjudna bitmasker per n |

**Mäts i riktig SVG** (samma kedja som `v7-geometri-check.mjs`, körs på renderarens utdata via `svgMatt.tsx`): ruta minst 8 px på 360 (5×5 i 60 enheter ger 12 enheter per ruta, 9,8 px, godkänt), luft mellan rutor 1 enhet men aldrig 0 (G1 undantas som rutnät av avsikt, men luften mäts), G2, G10, V11 (noder och kB), V12.

**Befintligt:** `tile`-renderaren (3×3) är mallen, bitmask-logiken i `kontroll.mjs` (symmetri) återanvänds. **Nytt:** primitiven `brick` med n upp till 5, den grå markören, åtta-operationers-biblioteket i `scripts/lib/spatial/`.

### 2.2 Form B: pappersvikning med hål och klipp (I-prov)

**Uppgift.** En sekvens med tre till fyra rutor överst: arket, en eller flera vikningar (streckad viklinje i ram-grått och en pil som visar vilken halva som viks över), och sist det vikta arket med hål eller klipp. Under: "Hur ser arket ut när det viks upp?" och fyra alternativ som visar det utvikta arket med alla hål.

**Arket.** Ny primitiv `ark`: kvadratiskt ark 60 enheter, kontur 3, ett rutnät 4×4 (grund och avancerad) eller 6×6 (expert) som är osynligt men styr var hål kan sitta. Hål ritas som bläckskivor r 4,5 i rutans mitt; klipp ritas som en bortskuren ruta i arkets kant (hörn eller kantmitt). Vikta lager ritas som arket med halva ytan i grå fyllning och bläckkontur, så att det syns vad som ligger ovanpå. Viklinjen är `kontur.ram` streckad. Pilen är `vector`-primitiven.

**Nivåer.**

| Nivå | Vikningar | Hål och klipp | Distraktorer |
|---|---|---|---|
| Grund | 1 (halv, lodrät eller vågrät) | 1 hål | arket med bara hålet som stansades (glömde vika upp), hålet speglat på fel axel, ett hål för mycket |
| Avancerad | 2 (två halvor, eller halv plus diagonal) | 1 till 2 hål | vek upp bara sista vikningen, fel axel, rätt antal hål men ett på fel plats |
| Expert | 3 (varav minst en diagonal eller en kvartsvikning) | 1 hål plus 1 klipp i kant (I-provets "med klipp") | varje distraktor är rätt utvikning av en annan vikningsordning eller av ett vikningssteg utelämnat |

Vad som gör det svårare: fler vikningar att vända tillbaka, diagonal (speglar över en annan axel än ögat förväntar), kvartsvikning (lagret ligger på en fjärdedel), och klipp i kant som bara blir ett hål i mitten när det viks upp.

**Generering.** Arket är en mängd rutor med koordinater. En vikning är en spegling av halva mängden över viklinjen in på den andra halvan; stansning sker i det vikta tillståndet och träffar alla lager under punkten. Uppvikning = tillämpa speglingarna baklänges på varje hål. Allt är heltalsgeometri (4×4 eller 6×6 med halvkoordinater för diagonalerna) och därför deterministiskt. Distraktorer byggs av samma funktion med ett steg fel (inte med handplacerade hål), så varje distraktor har en misstagstext som säger exakt vilket steg som hoppades över.

**Spärrar (SP-B).**

| Nr | Regel | Kontroll |
|---|---|---|
| SP-B1 | Hålet stansas aldrig på en viklinje eller i en ruta som en viklinje delar (hålet skulle delas och ge halva hål) | koordinatkontroll |
| SP-B2 | Facit har 2 till 8 hål (grund 2, avancerad 2 till 4, expert 4 till 8) och alla hål har minst 4 enheters fritt mellan målade kanter (G1) | räknas på utvikt ark |
| SP-B3 | Alla fyra alternativ är olika hålmängder, och inget alternativ är lika med det stansade (vikta) arket när det inte är en avsedd distraktor | kanonisk mängdjämförelse |
| SP-B4 | Facit är inte symmetriskt under någon av de axlar som inte vikts (annars kan "fel axel"-distraktorn råka bli facit) | jämför facit mot sina speglingar |
| SP-B5 | Pilen pekar alltid från den halva som viks mot den som ligger kvar, och viklinjen går alltid från kant till kant | geometri |
| SP-B6 | Expert: klipp bara i kant eller hörn, högst ett per uppgift, och klippet syns i det vikta arket som en bortskuren ruta minst 8 px | geometri på 360 |
| SP-B7 | Sekvensen har högst fyra rutor (ark, vik, vik, stansat), annars ryms den inte på 360 | strukturkontroll |

**Mäts i riktig SVG:** hål diameter minst 6 px på 360 (r 4,5 enheter i ett alternativ på 102 px ger 7,4 px), lagrets gråa fält har bläckkontur (G10), viklinjens streck minst 2,5 enheter, V11, V12.

**Befintligt:** `vector` (pilen), färgroller, `kontur.ram`. **Nytt:** primitiven `ark` med lager, hål, klipp, viklinje; vikningsmotorn i `scripts/lib/spatial/vikning.mjs`. Det är M-delen i form B.

### 2.3 Form C: kubrotation i 3D (I-provets "tärningar")

**Uppgift.** En referenskub med tre synliga sidor och fyra alternativ. "Vilken kub kan vara samma kub som den första, sedd från ett annat håll?" Ett alternativ är samma kub vriden. De tre andra går att avfärda med vad referensen visar: två sidor som är motstående i referensen syns bredvid varandra, två sidor har bytt plats, eller en symbol pekar fel.

I-provets tärningar frågar enligt källorna "kan de två vara samma tärning". Svarsformatet där är inte belagt (öppen fråga 1). Vi bygger referens plus fyra alternativ, som Neurobics och JobTestPrep, och skriver i I-prov-provet "samma uppgiftstyp, svarsformatet kan skilja".

**Kuben.** Ny primitiv `kub`: isometrisk projektion, kantlängd 36 enheter (total höjd 72, bredd 62, ryms i [14, 86]), tre romber: ovansida, vänster, höger. Konturer 3 i bläck. Ovansidan papper, vänster sida grå (`--m-gra`) med bläckkontur, höger sida papper. Symbolerna är sex olika av V7:s former, affint projicerade på sin sida: prick, ring, kryss, kvadrat, triangel, pil. Prick, ring och kvadrat saknar riktning; kryss har 90 graders symmetri; triangel och pil har riktning och används från avancerad.

**Nivåer.**

| Nivå | Symboler | Facit delar med referensen | Distraktorer |
|---|---|---|---|
| Grund | sex utan riktning (prick, ring, kryss, kvadrat, två ringar, fylld kvadrat) | 2 synliga sidor | två sidor som är motstående i referensen syns ihop; två sidor bytta; en sida visar en symbol som inte finns på kuben (fem av sex plus en främmande) |
| Avancerad | fyra utan riktning plus triangel och pil | 2 synliga sidor | spegelvänd kub (samma tre sidor, bytt kiralitet); en riktad symbol vriden 90 grader fel; motstående sidor ihop |
| Expert | två riktade symboler | 1 synlig sida (löses genom att avfärda de tre andra) | tre distraktorer som alla har rätt sidor och rätt grannskap men en riktning fel var |

Vad som gör det svårare: färre gemensamma sidor att verifiera på, kiralitet (en spegelvänd kub har samma grannar men fel ordning), och riktade symboler som måste följas genom vridningen.

**Generering.** En kub är en tilldelning av sex symboler (med riktning 0 till 3) till sex sidor. De 24 vridningarna av kuben är en fast tabell (permutation av sidor plus riktningsändring per symbol). Referensvyn är en vridning; facit en annan. Distraktorer byggs av regler (byt två sidor, spegla, vrid en symbol) och visas i en vy som syns tre sidor. Facit är deterministiskt eftersom vridningstabellen är exakt.

**Spärrar (SP-C).**

| Nr | Regel | Kontroll |
|---|---|---|
| SP-C1 | Varje distraktor går att avfärda enbart med referensens tre synliga sidor och den kända regeln "en kub har sex olika sidor" (motstående par, grannskap, riktning). Ingen distraktor får kräva kunskap om en osynlig sida | lösaren prövar om någon av kubens 24 vridningar kan ge distraktorns vy; då är den inte avfärdbar och uppgiften felar |
| SP-C2 | Facit är verkligen en vridning av referenskuben (en av 24) | tabelluppslag |
| SP-C3 | Exakt ett alternativ klarar SP-C2. På expert får inget annat alternativ vara förenligt med referensen ens via en osynlig sida | lösaren över alla 24 vridningar per alternativ |
| SP-C4 | Symboler utan riktning används aldrig där riktningen är det som skiljer facit från en distraktor. Kryss räknas som riktningslös (90 graders symmetri) | typkontroll |
| SP-C5 | De tre synliga sidorna i varje vy visar tre olika symboler, och ingen vy visar två sidor med samma symbol i olika riktning | kontroll per vy |
| SP-C6 | Riktade symboler har en entydig "upp" i projektionen: triangelns spets och pilens spets ligger aldrig i romberns spetsiga hörn där projektionen plattar till dem (vinkel mot sidans kant minst 20 grader) | geometri i projicerade koordinater |
| SP-C7 | Högst en spegelvänd distraktor per uppgift (två speglingar av samma kub är identiska) | strukturkontroll |

**Mäts i riktig SVG:** projicerad symbol minst 10 px på 360 i sin minsta axel (r 10 enheter ger en ellips cirka 20×12, 9,8 px, så radien sätts till 11), kontrast symbol mot sidfyllning 4,5:1 på alla tre sidor (grå sida kräver bläcksymbol, aldrig vit), kantlinje 3, V11 med tak 120 noder (kuben är tyngre än en matriscell), V12.

**Befintligt:** symbolformerna ur `stack` (plus, kryss, prick, ring), `poly` (triangel), `vector` (pil), färgroller. **Nytt:** den isometriska ritaren `kub` med affin projektion per sida, vridningstabellen (24) och lösaren i `scripts/lib/spatial/kub.mjs`. Det är M-delen i form C och det enskilt största nya ritarbetet i steg 2.

### 2.4 Pass och genomgång för Rumsuppfattning

Passet (`spatial-pass`, `test_daily_pass`) tar sex uppgifter, två per form, i samma skal som figurpasset (`PassShell`, tidsraden mot provets tid per uppgift, ingen nedräkning). Riktade pass per form (`spatial-riktat`, familj A, B eller C) när minst tre osedda uppgifter finns, som `VN_RIKTAT_MINST_OSEDDA`. Genomgången efter svar visar för A referensen och facit sida vid sida med vridningsgraden i text ("vriden 90 grader medurs"), för B varje uppvikningssteg som en egen liten ruta (baklänges), för C referensen med de två sidor som avslöjar distraktorn markerade i koppar. Misstagstexten kommer alltid ur generatorn, aldrig skriven för hand.

Tid per uppgift i provformat: A 30 sekunder, B 45, C 45 (Neurobics ger 35 sekunder på kuber, vi lägger oss något över för de riktade symbolerna). Står i `ovningsformat` som `spatial_eget` och läses av passets tidsrad.

---

## 3. Talserier (`kind: 'talserie'`)

Slugar `talserier-grund`, `-avancerad`, `-expert`. 15 uppgifter per nivå, 12, 15 och 18 minuter. Ingen ritare: raden ritas som rutor med tal i tabulära siffror, luckorna som tomma rutor med koppar-ram när de är besvarade.

**Uppgift och svar.** Grund: fem eller sex tal och en lucka sist, fem alternativ, ett tal var. Avancerad och expert: sex tal och två luckor sist (I-provets form), fem alternativ som vart och ett är ett talpar "17 och 23" i ordning vänster lucka, höger lucka. Alternativen visas sorterade stigande på det första talet, inte blandade (så att listan läses som en tallinje och positionen inte avslöjar något; art-director kan föreslå annat).

**Regelfamiljer och nivåer.**

| Familj | Exempel | Nivå |
|---|---|---|
| Aritmetisk | 4, 9, 14, 19, 24, ? | grund |
| Geometrisk ×2 eller ×3 | 3, 6, 12, 24, 48, ? | grund |
| Växande differens (+1, +2, +3 …) | 2, 3, 5, 8, 12, ? | grund |
| Växelvis +a, −b | 10, 14, 11, 15, 12, ? | grund och avancerad |
| Två varvade serier | 2, 50, 4, 45, 6, 40, ?, ? | avancerad |
| Differensen är geometrisk (+1, +2, +4, +8) | 5, 6, 8, 12, 20, ?, ? | avancerad |
| ×k + c | 1, 3, 7, 15, 31, ?, ? | avancerad och expert |
| Summa av två föregående (Fibonacci-lik, egna startvärden) | 2, 5, 7, 12, 19, ?, ? | expert |
| Två varvade med olika regler, varav en geometrisk | 3, 100, 6, 90, 12, 80, ?, ? | expert |
| Andra ordningens differens med negativa tal | 20, 17, 12, 5, −4, ?, ? | expert |

Gränser: grund tal 0 till 100, avancerad −50 till 500, expert −200 till 2 000, aldrig decimaler, högst fyra tecken per tal inklusive minus (så att åtta rutor ryms på 328 px). Vad som gör det svårare: två luckor där den andra beror på den första, varvade serier (måste se att det är två), negativa tal, regler som kombinerar multiplikation och addition.

**Generering.** Seedad: välj familj (kvot per nivå som figurseriernas ⌈n/3⌉), slumpa parametrar inom gränserna, räkna raden, läs av facit. Distraktorer byggs av fel på regeln, inte slumptal: nästa steg med föregående differens (glömde att differensen växer), rätt regel ett steg för tidigt, tecknet fel, de två varvade serierna blandade (första luckan ur fel serie), ×k utan +c. Varje distraktor får en misstagstext av sin typ.

**Spärrar (TS).**

| Nr | Regel | Kontroll |
|---|---|---|
| TS1 | Entydighet: ingen annan regel i biblioteket (alla familjer, alla parametrar som passar de visade talen) ger ett annat svar. Dessutom: inget polynom av grad högst 2 som går genom alla visade tal ger ett annat svar än facit (om raden råkar vara kvadratisk är det samma svar). Felar raden stryks | lösaren prövar hela biblioteket mot de visade talen |
| TS2 | Minst fem visade tal för en regel, minst sex för två varvade (tre per delserie) | struktur |
| TS3 | Inga två alternativ lika, facit aldrig lika med något visat tal, och ingen distraktor lika med något visat tal (annars eliminerbar) | mängdkontroll |
| TS4 | Ingen konstant eller nästan konstant rad (minst tre olika differenser i differensraden, eller geometrisk kvot ≠ 1) | räknas |
| TS5 | Distraktorerna är fel på regeln (typad), aldrig slumptal inom ±10 | varje distraktor har en typ ur listan |
| TS6 | Talen inom nivåns gräns och högst fyra tecken | struktur |
| TS7 | På två luckor: minst en distraktor har rätt första tal och fel andra (så att den som bara räknar en lucka inte får rätt) | struktur |
| TS8 | Samma familj med samma parametrar högst en gång per nivå; samma familj högst fem gånger per nivå (variera regeln, inte startvärdet, V7-regel 8) | nivåkontroll |

**Mäts:** inget i SVG. Däremot mäts textbredd: åtta rutor med fyra tecken i 20 px tabulära siffror plus luft ryms på 328 px (enhetstest på bredd per ruta ≤ 38 px). Rutor i stället för kommaseparerad text, så att luckorna är tydliga.

**Befintligt:** figurseriernas urvals- och rättningsmönster (`select.ts`, `fragor.server.ts`), sifferpassets alternativrader (`VnUppgift`), `blanda.ts` används inte (sorterade alternativ). **Nytt:** `src/lib/talserierV1/` med typer, bank (genererad), `scripts/gen-talserier.mjs`, `scripts/validate-talserier.mjs` med TS1 till TS8. Insats S.

---

## 4. Ordförråd (`kind: 'ordforrad'`)

Slugar `ordforrad-grund`, `-avancerad`, `-expert`. 20 uppgifter per nivå (tio synonymer, tio motsatsord, blandade i block om fem), 8, 10 och 12 minuter.

**Uppgift och svar.** Ordet i versaler överst, frågan "Vilket ord betyder ungefär detsamma?" eller "Vilket ord betyder motsatsen?", fem alternativ som rader (sifferpassets radmönster). Frågetypen står som eyebrow och byter färg mellan blocken (synonym och motsats), så att den som skummar aldrig svarar på fel fråga. Tid per uppgift i provformat 20 sekunder.

**Nivåer.** Svårigheten ligger i ordens frekvens och abstraktion, inte i formatet.

| Nivå | Uppslagsord | Exempel | Distraktorer |
|---|---|---|---|
| Grund | vanliga ord i vardagsspråk och nyhetsspråk | SNABB, TYDLIG, BÖRJA, MODIG | samma ordklass, tydligt annan betydelse, en i samma semantiska fält (SNABB: stark) |
| Avancerad | mindre vanliga, abstrakta, formella | NOGGRANN, AVSIKTLIG, FÖRSUMMA, GENERÖS | en nära-synonym som inte håller (NOGGRANN: långsam), antonymen som distraktor i synonymuppgiften |
| Expert | lågfrekventa, lånord, kanslispråk | REDUNDANT, KONCILIANT, SUBTIL, PREKÄR | antonym, falsk vän (ljudlikt ord med annan betydelse: KONCILIANT: koncis), två nära-synonymer i samma fält |

**Generering.** Ingen generator kan skriva facit här. Banken kurateras: Gemini får föreslå kandidater per nivå (uppslagsord, facit, fyra typade distraktorer, ordklass, en mening med ordet), svensk-ux-copywriter och testansvarig granskar, och varje facit verifieras mot Svensk ordbok eller SAOL (svenska.se) innan befordran. Frekvensbanden sätts med Språkbankens frekvenslistor om de går att hämta, annars med granskarnas bedömning och sedan kalibrering mot verklig andel rätt (avsnitt 7). Minsta bank före live: 40 uppslagsord per nivå och typ (240), mål 60 (360), så att I-prov-provet kan dra tolv synonymer och tolv motsatsord utan att upprepa på 30 dagar.

**Spärrar (OF).**

| Nr | Regel | Kontroll |
|---|---|---|
| OF1 | Exakt ett alternativ är synonym (eller antonym) till uppslagsordet enligt ordboken. Inget annat alternativ står i ordbokens synonymlista för uppslagsordet eller för facit | granskningsfält `kalla` per uppgift, skript kontrollerar att fältet är ifyllt och att inga två alternativ i banken är varandras facit |
| OF2 | Alla fem alternativ har samma ordklass och samma form (grundform, obestämd singular för substantiv, infinitiv för verb, positiv för adjektiv) | ordklassfält, skript |
| OF3 | Inga två alternativ är synonymer med varandra (då är båda rätt eller båda fel) | parvis kontroll mot bankens egna synonympar |
| OF4 | Alternativens längd inom ±4 bokstäver från facit (ingen längdledtråd), och facit aldrig det längsta eller kortaste i mer än 25 procent av uppgifterna per nivå | skript |
| OF5 | Inga sammansättningar med uppslagsordet som led, inga böjningar av samma stam bland alternativen | strängkontroll |
| OF6 | Inga slangord, dialektord eller fackord som bara en yrkesgrupp kan, inga ålderdomliga ord under expert | granskningsfält |
| OF7 | Samma ord förekommer aldrig som uppslagsord i båda typerna, och aldrig som alternativ i mer än två uppgifter per nivå | skript |
| OF8 | Antonymen som distraktor bara från avancerad, och då alltid med misstagstexten "det är motsatsen" | typfält |

**Mäts:** radbredd. Alternativ upp till 16 bokstäver ryms på en rad i 17 px på 328 px (enhetstest). Inget i SVG.

**Befintligt:** sifferpassets rader, textpassets skal, bankens granskningsflöde från figurserierna (kandidater, beslut, befordran). **Nytt:** `src/lib/ordforradV1/` med bank per nivå, `scripts/validate-ordforrad.mjs`, granskningsmall `docs/tester/ordforrad-granskning.md`. Insats M, men det är innehållsarbete, inte kod.

---

## 5. Övningsprovet för I-prov 2025

### 5.1 Form

Ett provpaket, nytt begrepp i `src/lib/ovningsprov/`: en sekvens av deltester med egen maxtid var, i fast ordning, utan väg tillbaka till ett avslutat deltest. Inom ett deltest går det att hoppa och ändra (segmentstapeln finns). Mellan deltesterna ett mellanblad: "Deltest 3 av 6, Talserier, 12 uppgifter, cirka 10 minuter. Du kan inte gå tillbaka till ett avslutat deltest." med en startknapp. Provet lämnas in när sista deltestet är klart eller när dess tid går ut.

| Nr | Deltest | Uppgiftsform | Antal | Maxtid |
|---|---|---|---|---|
| 1 | Synonymer | ordförråd, synonym | 12 | 6 min |
| 2 | Pappersvikning | rumsuppfattning B utan klipp | 12 | 10 min |
| 3 | Talserier | talserie, två luckor | 12 | 12 min |
| 4 | Motsatsord | ordförråd, antonym | 12 | 6 min |
| 5 | Tärningar | rumsuppfattning C | 12 | 12 min |
| 6 | Pappersvikning med klipp | rumsuppfattning B med klipp | 12 | 12 min |
| | Totalt | | 72 | 58 min |

Antal och tider är vår konstruktion: ordningen är belagd, 70 minuter totalt och "12 till 20 per deltest" är tredjepart, och vår total ligger under 70 eftersom snittprövande är klar på 35. Startarket säger: "Samma deltester i samma ordning som I-prov 2025. Pliktverket publicerar inte antal och tider, så de här är våra." Dessutom ett **halvt prov** (6 × 6 uppgifter, halva tiderna, 29 minuter) för pass dagar och mobil. Vilket som är förval avgör ägaren (öppen fråga 2); mitt förslag är halva provet som förval med "Hela provet" som andra knapp, eftersom 58 minuter på mobil sällan fullföljs (jämför verbalt: 22 minuter var för långt).

Blandning per nivå i provet: deltesterna drar ur alla tre nivåerna i ordningen lätt till svår inom deltestet (tredjedelar), som matrisprovet. Frågor sedda de senaste 30 dagarna undviks. `test_type: 'iprov-prov'`, meta med `delprov[]` (typ, antal, tid, start, slut, rätt), kräver `test_exam_mode`. Ett prov per dag som verbalt och numeriskt.

### 5.2 Resultatet

Aldrig stanine och aldrig en siffra på niogradig skala. Vi har ingen normgrupp och Pliktverkets är inte publik. Det står också i resultatet, en gång: "Polisen kräver minst 4 på I-provets niogradiga skala. Den räknas mot Pliktverkets normgrupp och går inte att härleda ur ett övningsprov."

Visas: ett huvudtal (antal rätt av 72, display-snitt) med sex små staplar under, en per deltest, fylld till andelen rätt, deltestets namn som etikett. Tempot som en rad per deltest i detaljvyn (använd tid mot maxtid, som en tunn stapel, inte som text). "Var du tappar": de två deltester med lägst andel rätt får en länk till riktat pass i den uppgiftsformen. Genomgången efter provet visar varje uppgift med facit och misstagstext, deltest för deltest.

Från 50 avslutade prov per version visas "Du hade fler rätt än X procent av dem som gjort vårt prov", samma mekanism som percentilen i matriser (visas från 25 där; här 50, eftersom provet är nytt och gruppen liten). Det är vår grupp, och texten säger det.

### 5.3 Övriga provpaket som följer av samma motor

När provpaketet finns kostar två till lite: **SHL Verify G+** (10 numeriska, 10 deduktiva, 10 figurserier, 36 minuter totalt, en klocka, verifierat mot SHL:s faktablad) och **Aon scales ix och cls** (figurserier 20 på 5, matriser "hitta regeln" saknas, så bara ix). Båda byggs efter I-prov-provet, G+ först.

---

## 6. "Mitt test är …"

### 6.1 Valen

Frågan ställs i vanligt språk först, som ägaren krävde efter runda 1: "Vad ska du göra för test?" Leverantörsnamn står som andra rad. Valen, med vad de ger:

| Val (rad 1, rad 2) | Deltester i planen | Övningsprovet | Tempo i passen | Anmärkning |
|---|---|---|---|---|
| Polisen eller Försvarsmakten, I-prov 2025 (även mönstring, officersprogrammet, Tullverket, Kustbevakningen) | ordförråd, rumsuppfattning B och C, talserier | I-prov-provet (halvt eller helt) | ord 20 s, vikning 45 s, kub 45 s, talserie 60 s | variant: Polisen (krav 4), värnplikt (krav 3), officersprogrammet (krav 6), bara som text i resultatet |
| Matrigma, Assessio | matriser | logik, klassisk 35 på 40 eller adaptiv cirka 12 | som i dag | variant klassisk eller adaptiv finns |
| Alva Logic | matriser | logik 20, två minuter var | som i dag | |
| SHL Verify | numeriskt, deduktivt, figurserier, verbalt | G+ blandat 30 på 36 (nytt), eller per del | som i dag | anmärkning: "G+ blandar tre delar, enskilda Verify-test finns också" |
| Aon scales, cut-e | figurserier, numeriskt, verbalt, deduktivt | figurer 20 på 5 (ix) | som i dag | anmärkning om cls och lst som vi inte har |
| Lokförare (TCC, ProTrain, Trafikverksskolan, MTR) | figurserier, verbalt, numeriskt, deduktivt | figurer 20 på 5 | Aon-tempo | anmärkning: "Koncentration, reaktion och minne ingår också i urvalet. Dem övar vi inte än." Ärligt, och det är en mätpunkt för om en koncentrationsmodul ska byggas |
| Annat eller vet inte | matriser först, sedan de typer användaren kryssar i | vårt format | vårt | som i dag |
| Bara personlighetstest | personlighet | inget | | som i dag |

Namnen är leverantörernas varumärken; varumärkesraden står kvar. Ingen logotyp.

### 6.2 Var valet görs

- **Ingången** (`/dashboard/tester/installningar`, steg 2) är huvudplatsen. Steg 1 "Vilka test?" slås ihop med leverantörsfrågan: den som väljer Polisen eller SHL behöver inte kryssa deltester, de följer med. "Annat eller vet inte" öppnar dagens kryssrutor. Steg 3 provdatum oförändrat.
- **Registreringen** ändras inte (valet "Tester" leder till ingången med `?forsta=1` som i dag).
- **Alla tester** får en rad överst: "Mitt test: Polisen, I-prov 2025. 23 dagar kvar. Ändra." Deltesterna som ingår samlas i ett block överst, resten under "Fler tester". Rad 2 under provkortet bär formatet (`provradTexter` finns).
- **Min plan** (hemvyn och kurvan): passen roterar mellan valets deltester (dag 1 matriser, dag 2 ord, dag 3 rumsuppfattning …), generalrepetitionen två dagar och en dag före provet är valets prov. Planen (`plan.ts`) rör sig inte, bara vilket pass en passdag får (`passgenerator.ts` får en rotation per val).

### 6.3 Data

`test_planer.leverantor` får värdena `iprov` och `lokforare` utöver dagens fem, `variant` får `polis`, `varnplikt`, `officer` för I-prov (och behåller `klassisk`, `adaptiv` för Matrigma). `testtyper` får `spatial`, `talserie`, `ordforrad`, `figurserie`, `deduktiv`. Det är en migration som ändrar två check-villkor och kräver ägarens ja (`reference_prod_migreringar_sakerhet`). `formatForPlan` och `ovningsformat` får de nya nycklarna. Gamla planer läses som i dag.

Provdatum: oförändrat. Dagar kvar styr som i dag när generalrepetitionen läggs, och för I-prov-valet är det provpaketet som läggs där. Testplaner utan datum får rullande plan som i dag.

---

## 7. Mätning och avläsning

**Händelser (PostHog, `events.ts`):**

- `mitt_test_valt { val, variant, surface: 'ingang' | 'alla_tester' | 'hem', forsta }` ersätter inte `ingang_steg` utan läggs till.
- `pass_startat` och `generalrepetition_klar` får `test_kind` ifyllt för de nya typerna (`spatial`, `talserie`, `ordforrad`), med `form` (A, B, C eller synonym, antonym) i ett nytt fält.
- `provpaket_klart { paket: 'iprov' | 'shl_gplus', halvt: boolean, ratt_per_del: number[], tid_per_del_s: number[], obesvarade }`.
- `fraga_rapporterad` tar de nya `test_kind`-värdena (check-villkoret på `fraga_rapporter` utökas i samma migration som ovan).

**Supabase:** sessioner i `logic_test_v4_sessions` per `test_type`; `fraga_statistik` per fråga (andel rätt, snittid) med `test_kind` så att kalibreringen kan köras per nivå. Ägaren och testkontona undantas som i dag (`admin_undantagna_konton`).

**Vad som avläses, per testtyp och nivå, sex veckor efter live (två avläsningar: två veckor och sex veckor):**

| Mått | Mål | Åtgärd om det inte nås |
|---|---|---|
| Start till klart | minst 70 procent på grund, 60 på avancerad och expert | korta testet eller tiden |
| Andel rätt, median per nivå | grund 70 till 85, avancerad 50 till 65, expert 35 till 50 procent (samma band som matrisernas `PRIOR_P`) | flytta uppgifter mellan nivåer efter uppmätt p, aldrig ändra facit |
| Uppgifter med p under 0,15 på grund eller över 0,95 på expert | noll | pensionera eller flytta |
| Tid per uppgift mot budget | median under budget, högst 20 procent över | justera budget eller uppgiften |
| Rapporterade frågor | under 1 procent av visningar | granska varje rapport |
| Per uppgiftsform i Rumsuppfattning | A, B och C skiljer sig i p; om B och C har samma p är kuben för lätt | se över distraktorerna |
| Dag 2-återkomst för konton med valet Polisen, mot övriga testkonton | högre än övriga | om inte: passrotationen är fel |
| Köp per konto med valet Polisen | följs, inget mål första sex veckorna (volymen är liten) | |
| Search Console: klick från "spatial förmåga" och "rotationstest" till rotation-test-guide efter smakprovet | fler än noll (i dag noll på 126 visningar) | |
| Lokförare-valet: antal | mätpunkt för koncentrationsmodulen (gap-rapportens punkt 4) | |

Nyheter läses av testansvarig, siffror hämtas med `scripts/posthog-query` och Supabase enligt `reference_gsc_posthog`.

---

## 8. Vad skissen ska visa

Mobil först, allt på Pixel 7 (412 px) och kontrollerat på 360 px med knappkontrollen (`qa-rummen-knappar-360.mjs`). Dator är en kolumn 420 px för frågorna som i matriserna, två spalter bara där deduktivt har det. Samma skal som finns (`PassShell`, topprad 56, tidsrad 4 px, segmentstapel i prov). Grafik v3:s färgroller. Inga leverantörsnamn i figurerna.

1. **Rumsuppfattning, fråga, tre varianter (A, B, C).** A: referens överst i egen ruta, fyra alternativ 2×2 (159 px på 360) eller fyra i rad (figuren minst 48 px enligt G5, 4 i rad ger 59 px, går men tätt; art-director väljer). B: sekvensen överst som tre till fyra små rutor med pil mellan, frågan, fyra alternativ 2×2. C: referenskuben överst 160 px, fyra kuber 2×2. Visa att kuben, hålen och viklinjerna håller måtten på 360.
2. **Rumsuppfattning, genomgång** (efter svar i pass, och i resultatets lista): A referens och facit sida vid sida med vridningstexten, B uppvikningsstegen baklänges som tre små rutor, C kuben med de två avslöjande sidorna i koppar. Misstagsraden ur `misstag`.
3. **Rumsuppfattning, resultat** (nivåtest och pass): ringen med andel rätt, tre små staplar för A, B, C ("Var du tappar"), tempo, länk till riktat pass. Ingen nivåskala, ingen kurva (som figurserier).
4. **Talserier, fråga**: raden som rutor, två luckor med koppar-ram, fem alternativ som rader med talpar. Visa åtta rutor med fyrsiffriga tal på 360.
5. **Talserier, genomgång**: raden med differensraden under (den dolda regeln ritad som små tal mellan rutorna), och för varvade serier två färger på varannan ruta.
6. **Ordförråd, fråga**: ordet i versaler i display-snitt, eyebrow Synonym eller Motsatsord med färgbyte, fem rader.
7. **Ordförråd, genomgång**: facit markerat, en exempelmening, och vid antonym-distraktor raden "det är motsatsen".
8. **"Mitt test är …", ingångens steg 2**: åtta val som kort i vanligt språk med leverantören som andra rad, varianten för Polisen (Polisen, värnplikt, officersprogrammet), varumärkesraden. Hur "Annat eller vet inte" fäller ut kryssrutorna.
9. **Alla tester med valet satt**: raden "Mitt test", blocket med valets deltester överst, "Fler tester" under, provraden med formatet.
10. **I-prov-provet, startark**: formatet i klartext med cirka-meningen, halvt eller helt, de sex deltesterna i ordning som en lista med antal och tid, "Du kan inte gå tillbaka till ett avslutat deltest", startknapp. Låst läge med paketraden.
11. **I-prov-provet, mellanblad** mellan två deltester och **klockan** per deltest (ring uppe till höger, som `Klocka`).
12. **I-prov-provet, resultat**: huvudtalet, sex små staplar, detaljvyn med tempo per deltest, meningen om stanine, "Var du tappar" med två länkar, genomgången deltest för deltest.
13. **Hemvyn med I-prov-valet**: planens rotation synlig (dagens pass "Rumsuppfattning"), generalrepetitionen heter "I-prov-provet".

Bedömningen art-director äger: 2×2 eller 4 i rad för A, sidfärgerna i kuben (inom G10), om talseriernas alternativ ska vara sorterade, hur mellanbladet ser ut. Allt annat ovan är krav.

---

## 9. Ordning, insats och vad som väntar

| Steg | Del | Insats | Beroende | Kan börja före skissen |
|---|---|---|---|---|
| 1 | Talserier: generator, spärrar TS1 till TS8, bank, nivåtest, pass | S | inget | ja (generator och skript), vyn efter skiss |
| 2 | Rumsuppfattning A: primitiven `brick`, åtta-operationers-bibliotek, SP-A, bank | S till M | inget | ja (generator), vyn efter skiss |
| 3 | Rumsuppfattning B: `ark`, vikningsmotor, SP-B, bank | M | inget | ja (motor), ritaren efter skiss |
| 4 | Ordförråd: kandidater, granskning, OF1 till OF8, bank, nivåtest | M (innehåll) | ägarens ja till Gemini-kandidater | ja, innehållet kan börja direkt |
| 5 | Rumsuppfattning C: isometrisk ritare `kub`, vridningstabell, lösare, SP-C, bank | M till L | skissen för kuben | lösaren ja, ritaren nej |
| 6 | Rumsuppfattning nivåtest med A, B, C blandat, pass och riktade pass, genomgångar | M | 2, 3, 5 | nej |
| 7 | Provpaketmotorn och I-prov-provet (halvt och helt), resultat | M | 1, 4, 6 | nej |
| 8 | "Mitt test är …": migration, ingång, Alla tester, planrotation, format per val | M | 7 för I-prov-raden, annars inget | nej (migration kräver ägarens ja) |
| 9 | SHL G+-paketet | S | 7 | nej |
| 10 | Smakprov Rumsuppfattning i rotation-test-guide och artikelomskrivning, ny artikel om I-prov 2025 | S | 6 | nej |

Ordningen är vald så att det billigaste och mest självständiga går först (talserier och form A ger två synliga nyheter tidigt), medan kuben, som är den tunga ritaren, byggs när skissen är godkänd och formerna A och B redan satt ritarmönstret. "Mitt test är …" sist bland kärndelarna eftersom det först ger mening när I-prov-provet finns att peka på; migrationen förbereds tidigare.

**Väntar, och varför:**

- Adaptiv nivå 1 till 10 och Nivåkoll för de nya typerna: kräver kalibrerade banker (`KALIBRERING_GRANS` 30 svar per fråga). Tidigast efter första avläsningen.
- Stanine eller någon niogradig skala: aldrig utan normgrupp. Inte ens "ungefärlig".
- Pappersvikning utan hål (I-provets "avgör hur figuren ser ut ihopvikt", om det visar sig vara en egen uppgiftstyp efter kontrollen i öppen fråga 1): egen form D, efter avläsningen.
- Koncentration (Aon e3+, SHL Checking) och "så många som möjligt"-tempo för Aon lst och e3+: annan motor (uppgifter genereras löpande, klocka utan antal). Byggs bara om lokförare-valet får volym (gap-rapportens punkt 4).
- Aon scales cls ("hitta regeln bland rutnät"): egen uppgiftstyp, inte matriser. Inte nu.
- Mekanisk förståelse, situationsbedömning, arbetsminne: enligt gap-rapporten inte värt att bygga.

---

## 10. Öppna frågor till ägaren

1. **Pliktverkets övningsuppgifter** går inte att läsa maskinellt. Får Opus göra dem i webbläsare och dokumentera svarsformatet per kategori (tärningar: ja/nej eller alternativ; talserier: hur de två talen väljs) innan form C och talseriernas tvåluckeform låses? Det påverkar bara svarsformatet, inte genereringen.
2. **Halvt prov (36 uppgifter, 29 minuter) som förval** med hela provet (72, 58 minuter) som andra knapp, eller tvärtom?
3. **Migrationen** av `test_planer` (nya värden i leverantör, variant, testtyper) och `fraga_rapporter` (nya test_kind) kräver ditt ja i manuellt läge.
4. **Ordförrådsbanken**: får Gemini generera kandidater som copywriter och testansvarig sedan granskar mot ordboken, eller ska banken skrivas för hand från början? Gemini-vägen ger 360 uppgifter på en vecka, handvägen tar tre.
5. **Namnet**: "Rumsuppfattning" i produkten (Pliktverkets ord, svensk fackterm) och "spatial förmåga" bara i artiklarna, eller "Spatial förmåga" överallt eftersom det är sökordet?
6. **Lokförare som eget val** trots att vi saknar koncentration, reaktion och minne: med den ärliga anmärkningen, eller vänta tills modulen finns?
7. **Fri grundnivå** för alla tre nya typerna som i dag (grund fri, resten `tests_above_base`, provpaketet `test_exam_mode`)? Det är förvalet i briefen.

---

## 11. Källor

- Pliktverket, Nytt I-prov: https://www.pliktverket.se/om-myndigheten/nytt-i-prov
- Pliktverket, Testa I-provet (två övningsuppgifter per kategori): https://pliktverket.se/gemensam/testa-i-provet
- Polistidningen 2025-04, nytt begåvningstest i polisprövningen: https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/
- taktisk.se 2026-07-17, I-prov 2025 det linjära provet (citerar FHS manual 2025): https://www.taktisk.se/2026/07/17/i-prov-2025-det-linjara-provet/
- logiktester.se om I-provet (beskrivning av övningsuppgifterna): https://logiktester.se/i-provet/
- rustadsoldat.se, mönstring test: https://rustadsoldat.se/artiklar/monstring-test
- testttalent.se, mönstring 2026 (krav per utbildning, "12 till 20 per deltest"): https://testttalent.se/i-prov-monstring/
- SHL Verify G+ faktablad, svenska: https://service.shl.com/docs/Verify%20G%20plus%20Fact%20Sheet%20-%20Swedish.pdf
- SHL Verify Interactive induktiv och deduktiv, tredjepart: https://www.practiceaptitudetests.com/resources/shl-style-verify-interactive-test/ och https://www.jobtestprep.co.uk/free-shl-deductive-test
- Aon scales (ix, cls, lst, e3+), tredjepart: https://www.jobtestprep.co.uk/aon-assessment
- Lokförarurvalet, tredjepart: https://www.jobtestprep.se/lokforare-test
- Neurobics spatialt test (12 kuber, 7 minuter, fyra alternativ, jämförelse från 100 deltagare): https://www.neurobics.se/tester/spatial-formaga/
- Kod: `src/lib/logicTestV7/types.v7.ts`, `renderers.v7.tsx`, `geometri.json`, `scripts/v7-geometri-check.mjs`, `src/lib/figurserierV1/`, `docs/tester/figurserier.md`, `src/lib/traning/tempo.ts`, `testplan.ts`, `plan.ts`, `niva.ts`, `src/lib/ovningsprov/format.ts`, `typer.ts`, `src/app/dashboard/tester/testConfig.ts`, `getHubData.ts`, `src/components/traning/Ingang.tsx`, `src/lib/traning/hem-copy.ts`, `supabase/migrations/20261011100000_test_planer.sql`, `docs/design/tester-v2-2026-10-11/granskning-figurer.md`, `grafik-v3-spec.md`, `deduktiv-spec.md`
