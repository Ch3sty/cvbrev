# Granskning deduktiv slutledning, lagade uppgifter 03

Datum 2026-11-09. Granskare: testansvarig. Underlag: de 27 ersättarna i `src/lib/deduktivV1/bankGrund.json`, `bankAvancerad.json` och `bankExpert.json` (fältet `fran_version: 2`, `ersatter` pekar på originalet) och listan i `laga-v2.json`. Originalen har `pensionerad_fran: 2`. Beslut i `beslut-03.json`. Krav som i granskning-01 och 02, plus de två spärrar som avsnitt 3 i granskning-02 föreslog och som nu finns i `scripts/lib/deduktiv/sparrar.mjs`: DD7 (inget alternativ medför ett annat alternativ utan hjälp av villkoren, i D3 med antagandet) och DD8 (facit kräver alla villkor vid tre, minst alla utom ett vid fyra eller fler).

Så här granskade vi. Alla 27 löstes för hand mot den svenska texten, med originalet bredvid. För varje ersättare kontrollerade vi att pusslet (intro, villkor, antagande, fråga) är orört, att lösningen är exakt en, att facit stämmer och att alla fyra distraktorer är falska i schemat (sanna i schemat för omöjligt-frågorna), att inget par av alternativ medför varandra, att varje misstagstext pekar på ett villkor som verkligen går att bryta ensamt så att distraktorn blir svaret, att lösningsgången låser rätt och slutar i schemat, och att svenskan är entydig. Som stöd körde vi lösaren och spärrarna i `sparrar.mjs` över alla 27 (alla klarar DD1 till DD8 utan anmärkning), men bedömningen nedan är vår egen.

## 1. Uppgift för uppgift

Kolumnen "nytt" anger vad som skiljer från originalet. "Minsta villkor" är den minsta villkorsmängd som ger facit (i D3 tillsammans med antagandet).

### Grund (D2, fyra element, tre villkor)

| id | ersätter | facit | nytt | minsta villkor | beslut |
|---|---|---|---|---|---|
| dd-g-d2-12 | 05 | E Eva på plats 2 | A Eva på plats 3 | alla tre | godkänd |
| dd-g-d2-13 | 08 | B svart direkt till vänster om grön | E grön på plats 1 | alla tre | godkänd |
| dd-g-d2-14 | 09 | C Filip på plats 2 | E Cilla på plats 2 | alla tre | godkänd |
| dd-g-d2-15 | 10 | D röd direkt till vänster om svart | C blå på plats 1 | alla tre | godkänd |
| dd-g-d2-16 | 11 | E Hugo på plats 2 (nytt facit) | D Hugo på plats 1 | alla tre | godkänd |

Alla fem löser sig som förut: ett plats-villkor låser först, sedan följer resten. I 16 är facit bytt från "Karin står inte bredvid Ulla" (som följde ur villkor 1 och 3) till "Hugo står på plats 2", som kräver alla tre: villkor 2 ger Hugo plats 2 eller 4, villkor 3 tar bort 4. Lösningsgången är ombyggd och kopparn står nu på plats 2. De bytta distraktorerna (12 A, 13 E, 14 E, 15 C, 16 D) är alla nära missar som bryter exakt ett villkor, och misstagstexterna pekar på rätt villkor. I 15 föll bägge paren från granskning-02 (B och E medförde C) i och med att C byttes.

### Avancerad (D2, fem eller sex element, fyra eller fem villkor)

| id | ersätter | facit | nytt | minsta villkor | beslut |
|---|---|---|---|---|---|
| dd-a-d2-31 | 02 | B blå inte bredvid grön | C blå på plats 2 | alla fyra | godkänd |
| dd-a-d2-32 | 04 | D Bo på plats 4 (nytt facit) | | alla fem | godkänd |
| dd-a-d2-33 | 08 | C Bo någonstans till vänster om Gustav | A Ida på plats 4 | 2, 3, 4 | godkänd |
| dd-a-d2-34 | 10 | E lila direkt till vänster om svart | A blå på plats 2 | 1, 2, 3 | struken |
| dd-a-d2-35 | 12 | B blå bredvid röd | A blå på plats 2, C lila på plats 2 | 2, 3, 4 | godkänd |
| dd-a-d2-36 | 14 | D Frida på plats 4 (nytt facit) | | alla fem | struken |
| dd-a-d2-37 | 16 | A Ulla på plats 4 | B Cilla på plats 3 | alla fyra | godkänd |
| dd-a-d2-38 | 20 | E grön någonstans till vänster om röd | A blå på plats 1, D blå på plats 4 | alla fyra | godkänd |
| dd-a-d2-39 | 24 | D Jonas på plats 4 (nytt facit) | | alla fem | godkänd |
| dd-a-d2-40 | 28 | C Disa på plats 2 (nytt facit) | | 1, 2, 4 | struken |
| dd-a-d2-41 | 30 | E blå bredvid röd | A blå på plats 2, C blå på plats 4 | alla fyra | godkänd |

Logiken håller i alla elva. De tre nya facit som ersätter DD8-fall kräver nu alla fem villkor: i 32 måste Gun, Rut och Jonas ta måndagen (villkor 1, 4, 5), Olga plats 6 (villkor 3) och Bo före Vera (villkor 2) ger Bo plats 4; i 36 ger villkor 2, 4 och 5 Alva och Ulf plats 1 och 2, och Frida före Tom med Tom inte på 6 ger Frida plats 4; i 39 ger Carl på 2 med Leo samma dag och Frida före Leo måndagen, och Jonas före Åsa före Olle ger Jonas plats 4. I 40 följer Disa på plats 2 ur villkor 1, 2 och 4 (tre av fyra, inom DD8). Inget par av alternativ medför varandra i någon av de elva. Misstagstexterna stämmer i alla 44 fall.

Tre stryks ändå, se punkt 3 nedan om udda facit. I 34 handlar alla fyra distraktorer om den blå pärmen och facit är det enda alternativet som inte gör det. I 36 handlar alla fyra distraktorer om Rut och facit är det enda om Frida. I 40 är facit det enda platspåståendet och det enda som nämner Disa; de fyra distraktorerna är alla relationer mellan Ulla, Eva och Jenny. I 34 och 36 fanns mönstret redan i originalet, i 40 uppstod det när facit byttes.

### Expert (D3, omöjligt-frågor med antagande)

| id | ersätter | facit | nytt | minsta villkor | beslut |
|---|---|---|---|---|---|
| dd-e-d3-25 | 02 | B Cilla och Sven går samma dag | E Cilla på plats 2 | 4, 5 | struken |
| dd-e-d3-26 | 03 | C grön någonstans till vänster om vit | B blå på plats 4 | 1, 2, 3, 5 | godkänd |
| dd-e-d3-27 | 08 | C Lisa på plats 5 | B Gun på plats 2 | 3, 5 | godkänd |
| dd-e-d3-28 | 09 | D vit på plats 1 | A blå på plats 1 | 1, 2, 3 | godkänd |
| dd-e-d3-29 | 12 | B svart någonstans till vänster om lila | D blå på plats 3, E röd på plats 6 | 1, 2, 4, 5 | godkänd |
| dd-e-d3-30 | 13 | C Maja bredvid Åsa | B Anna på plats 5, D Maja på plats 2 | 3, 4, 5 | godkänd |
| dd-e-d3-31 | 15 | E lila direkt till vänster om vit | A lila på plats 5 | 2, 3, 5 | godkänd |
| dd-e-d3-32 | 17 | B Rut på plats 2 | A Jonas på plats 3 | 2, 3, 4, 5 | godkänd |
| dd-e-d3-33 | 18 | C lila någonstans till vänster om vit | B röd på plats 4, D svart på plats 5 | alla fem | godkänd |
| dd-e-d3-34 | 19 | D Maja på plats 3 | C Lisa på plats 3 | 4, 5 | godkänd |
| dd-e-d3-35 | 23 | C Gun på plats 1 | A Erik på plats 6 | 1, 2 | godkänd |

Facit är oförändrat i alla elva och är omöjligt under antagandet i alla elva; alla distraktorer går ihop med villkoren. De fem paren i gamla 12 och de tre i gamla 13 och 18 är borta. I 29 blir A "grön bredvid lila" med antagandet grön på plats 1 detsamma som "lila på plats 2", men det medför inget annat alternativ, så DD7 håller. I 33 är C och E varandras motsatser (lila till vänster om vit, vit till vänster om lila); det ger ingen strykning eftersom högst ett av dem kan vara omöjligt och kandidaten inte vet vilket utan att lösa. Misstagstexterna "I schemat står X på plats k. Det går ihop med villkoren" stämmer mot schemat i alla 44 fall.

En stryks: i 25 är alla fyra distraktorer platspåståenden (Mats på 5, Sven på 4, Dan på 3, Cilla på 2) och facit är det enda samma-dag-påståendet. Originalet hade ett relationspåstående bland distraktorerna; lagningen bytte det mot ett platspåstående och gjorde facit udda.

## 2. Beslut

23 godkänns: alla fem på grund, åtta av elva på avancerad, tio av elva på expert. Fyra stryks: dd-a-d2-34, dd-a-d2-36, dd-a-d2-40 och dd-e-d3-25, alla av samma skäl, udda facit (punkt 3). Spärrarna DD7 och DD8 gör det de ska: inget alternativ medför ett annat i någon av de 27, och alla fem nya facit kräver alla villkor. Inga nya villkor för de 23.

De fyra strukna pusslen är i sig bra och bör inte slängas. Kör om lagningen för dem med en regel mot udda facit, så kommer de tillbaka med nya id.

## 3. Till nästa omgång

**Udda facit.** En provvan kandidat läser alternativen mot varandra innan hen löser. Om fyra alternativ har något gemensamt som det femte saknar gissar hen på det femte. Det är samma sorts genväg som DD7, bara på ytan i stället för i logiken. Två former förekommer: alla fyra distraktorer har samma form (bara platspåståenden, eller bara relationer) och facit en annan; eller alla fyra distraktorer nämner samma element och facit nämner det inte. Förslag till DD9: inget drag av det slaget får förena alla fyra distraktorer och saknas i facit. Vi räknade över hela den aktiva banken (41 måste- och omöjligt-uppgifter): utöver de fyra strukna här finns mönstret i fyra redan godkända uppgifter, dd-g-d2-07 (Viktor i alla fyra distraktorer), dd-a-d2-18 (Gun), dd-a-d2-22 (fyra relationer, facit ett platspåstående) och dd-e-d3-05 (fyra platspåståenden). De bör gå i samma körning som de fyra strukna, inte lagas en och en.

**Lagningen fyller på med platspåståenden.** Alla 22 nya distraktorer i den här omgången är av formen "X står på plats k", och alla fem nya facit likaså. Det är väntat, eftersom ett platspåstående aldrig medför något annat alternativ, men det driver banken åt ett håll: dd-e-d3-35 har nu fem platspåståenden och dd-a-d2-32 fyra. Platspåståenden är lätta att pröva mot schemat och gör uppgiften lite lättare än en relation. Föreslår att generatorn vid lagning först prövar relationspåståenden (bredvid, inte bredvid, någonstans till vänster om) som klarar DD7, och tar platspåståenden i andra hand. Det löser också de flesta fallen av udda form.

**Facit ur två villkor i D3.** DD8 gäller bara D2. I fyra av expertuppgifterna följer facit ur antagandet och två villkor: 25 (villkor 4 och 5), 27 (3 och 5), 34 (4 och 5) och 35 (1 och 2). I 35 räcker det att se att Vera måste ta måndagen med Dan och inte får stå på 2, så står hon på 1 och Gun kan inte göra det. DD6 godtar två villkor, och facit är oförändrade från originalen, så vi stryker inte. Men p_prior 0,4 är nog för lågt för de fyra. Föreslår ett golv på tre villkor för D3 i nästa omgång, över hela banken på en gång, och att kalibreringen får visa om de fyra sticker ut.

**Lösningsgången.** De fem ombyggda gångarna (16, 32, 36, 39, 40) låser rätt och kopparn står på facitets plats. Steg med tre villkor står kvar i dd-a-d2-31, 32 och 41 samt dd-e-d3-25, 31 och 32, oförändrade från originalen och godtagbara på de nivåerna enligt granskning-01. På grund har 12 och 16 fortfarande ett avslutande steg med två villkor, samma anmärkning som punkt 3 i granskning-02; i 16 går det att dela i "villkor 2 ger Hugo plats 2 eller 4" och "villkor 3 tar bort 4".

**Svenskan.** Entydig och oförändrad i intro, villkor och fråga. "Står på plats" i turordningstemat är bankens konvention och vi behåller den. Begynnelsebokstäverna är olika i alla 27. Inga talstreck i texterna.

## 4. Utfall

| Nivå | Aktiva före version 2 | Pensionerade | Ersättare | Godkända | Strukna | Aktiva efter |
|---|---|---|---|---|---|---|
| Grund | 30 (24 D1, 6 D2) | 5 | 5 | 5 | 0 | 30 (24 D1, 6 D2) |
| Avancerad | 30 | 11 | 11 | 8 | 3 | 27 |
| Expert | 20 | 11 | 11 | 10 | 1 | 19 |

Avancerad och expert ligger under sina gamla tal tills de fyra strukna pusslen lagats om med DD9. Nästa steg: lägg DD9 i `sparrar.mjs`, låt `laga-deduktiv-v2.mjs` föredra relationspåståenden, kör om de fyra strukna och de fyra gamla med samma mönster, och granska de åtta i granskning-04.

## 5. Andra vändan samma dag, nio nya ersättare

DD9 infördes i `sparrar.mjs` efter avsnitt 3 (alla fyra distraktorer delar villkorstyp eller element som facit saknar, och dessutom: facit ensamt om både sin villkorstyp och ett element). De fyra strukna togs bort och deras original lagades om. Av de gamla uppgifterna med mönstret lagades dd-g-d2-07, dd-a-d2-18 och dd-e-d3-05, och dd-e-d3-06 föll på den nya spärren och lagades också. dd-e-d3-29, godkänd ovan, föll på den skärpta klausulen (facit var ensamt om formen "någonstans till vänster om" och om den svarta pärmen) och togs bort; dd-e-d3-39 ersätter dd-e-d3-12 i stället. Vi granskade de nio nya på samma sätt som de 27: löste för hand mot texten med originalet bredvid, och körde DD1 till DD9 över hela den aktiva banken (56 D2- och D3-uppgifter, inga anmärkningar).

| id | ersätter | facit | nytt | minsta villkor | beslut |
|---|---|---|---|---|---|
| dd-g-d2-17 | dd-g-d2-07 | A Mats direkt till vänster om Olle | C Mats på plats 2 | alla tre | godkänd |
| dd-a-d2-42 | dd-a-d2-10 | E lila direkt till vänster om svart | A lila på plats 2 | 1, 2, 3 | godkänd |
| dd-a-d2-43 | dd-a-d2-14 | D Frida på plats 4 (nytt facit) | B Alva på plats 2 | alla fem | godkänd |
| dd-a-d2-44 | dd-a-d2-18 | C Bea någonstans till vänster om Cilla | B Bea på plats 2 | 1, 2, 3, 4 | godkänd |
| dd-a-d2-45 | dd-a-d2-28 | C Disa på plats 2 (nytt facit) | A Disa på plats 4 | 1, 2, 4 | godkänd |
| dd-e-d3-36 | dd-e-d3-02 | B Cilla och Sven går samma dag | E Cilla och Nora går samma dag | 4, 5 | godkänd |
| dd-e-d3-37 | dd-e-d3-05 | E Per går före Erik | C Cilla går före Per | 1, 2, 4 | godkänd |
| dd-e-d3-38 | dd-e-d3-06 | A vit någonstans till vänster om röd | C vit på plats 6 | 2, 4, 5 | godkänd |
| dd-e-d3-39 | dd-e-d3-12 | B svart någonstans till vänster om lila | C svart på plats 4, D blå på plats 3, E röd på plats 6 | 1, 2, 4, 5 | godkänd |

Alla nio godkänns. Pusslen är orörda, lösningen är exakt en, facit stämmer, distraktorerna är falska i schemat (sanna i schemat i omöjligt-frågorna), inget alternativ medför ett annat, och misstagstexterna pekar på villkor som går att bryta ensamma. De nya distraktorerna bryter udda-mönstret på rätt sätt: i 42 handlar nu bara tre av fyra om den blå pärmen, i 43 bara tre om Rut, i 45 delar facit både form och element (Disa) med A, i 36 är E ett samma-dag-påstående som facit, i 39 nämner C den svarta pärmen. I 44 behövde vi läsa noga: Nora kan bara stå på plats 2, eftersom plats 3 och 4 skulle skjuta Cilla till 5 eller utanför raden, och sedan tvingar "Gun står inte bredvid Nora" Gun till plats 5 och Bea till 1. Lösningsgången skriver det som en prövning av Cilla (plats 3 eller 4), vilket också går. I 37 står Lisa på 3 eller 5 eftersom Per måste gå före henne samma dag; "kvar"-steget citerar fyra villkor, tungt men riktigt, och oförändrat från originalet. I 38 följer facit ur att röd inte får ligga bredvid svart på 5 och måste ha både blå och grön till vänster, så röd hamnar på 3 och vit till höger. Svenskan är entydig och begynnelsebokstäverna olika i alla nio.

Två saker kvarstår. För det första: dd-a-d2-22 är aktiv och har fyra relationer av olika villkorstyp mot ett facit som är ett platspåstående (svart på plats 2). Den införda DD9 jämför villkorstyp, inte platspåstående mot relation, så den släpper igenom 22. Vi föreslår att formklausulen också prövar den grövre indelningen plats mot relation; då faller 22 och bör lagas om. För det andra: alla sju nya distraktorer utom två (36 E, 37 C) är platspåståenden igen, så anmärkningen i avsnitt 3 om platstyngd står kvar.

Slutläge för banken i version 2, efter båda vändorna:

| Nivå | Aktiva | Varav ersättare i version 2 | Pensionerade |
|---|---|---|---|
| Grund | 30 (24 D1, 6 D2) | 6 | 6 |
| Avancerad | 30 | 12 | 12 |
| Expert | 20 | 13 | 13 |

`beslut-03.json` speglar slutläget: 31 godkända (22 från första vändan utan dd-e-d3-29, plus de nio nya) och fem strukna (de fyra från avsnitt 2 och dd-e-d3-29, som föll på den skärpta DD9). Alla fem är borttagna ur banken och ersatta.
