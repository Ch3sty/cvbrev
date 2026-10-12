# Figurserier, granskning 02

Datum 2026-10-12. Granskare: testansvarig. Underlag: `omgang2/ATT-GRANSKA-omgang2.md`, `omgang2/lista.json`, de 39 PNG i `omgang2/{grund,avancerad,expert}/` och kandidatfilerna i `src/lib/figurserierV1/kandidater/`. Facit räknat för hand på alla 39 (lägen, vinklar, cykler och takter per rad), distraktorstrukturen läst ur kandidatfilen per fråga. Bara de 39 ändrade och nya bedöms; de 57 godkända från granskning 01 står kvar.

Beslut i tre nivåer som i granskning 01: **ja** (in i banken), **ändra** (raden och id står, bara alternativen byggs om), **nej** (raden stryks, ersättare med nytt löpnummer). `beslut-02.json` har `godkanda`, `andra` och `strukna`; `andra` är med för att samma skript som i omgång 2 ska kunna bygga om alternativen utan att raden går förlorad.

## 1. Utfall

| Nivå | Granskade | Ja | Ändra | Nej | Godkända i banken nu | Efter omgång 3 |
|---|---|---|---|---|---|---|
| Grund | 7 | 7 | 0 | 0 | 36 | 36 |
| Avancerad | 8 | 8 | 0 | 0 | 30 | 30 |
| Expert | 24 | 18 | 4 | 2 | 24 | 30 |

Golvet 28 per nivå: **grund och avancerad når det och kan befordras till bank nu.** Expert står på 24 godkända och når inte golvet förrän de fyra i `andra` har fått nya alternativ (28) och de två strukna har ersättare (30). Expert saknar dessutom antal-familjen tills ersättaren för `fs-e-antal-03` finns, så `validate-figurserier` kommer att fälla expertfilen på familjekravet till dess. Lansering av de tre nivåtesten väntar på den omgången; den är liten (fyra alternativombyggnader, två ersättare) och kräver en regeländring i generatorn (avsnitt 4).

Facit: inget fel i någon av de 39. Facit-kontrollen håller.

## 2. De fem fynden från granskning 01

| Fynd | Status | Kontroll |
|---|---|---|
| F1 nål (ett streck med punkt) | **Åtgärdat** | Inga enstreck i rad eller alternativ i någon av de 10 strålfrågorna. Ersättarna `fs-g-vrid-11` (tre streck), `fs-g-antal-13` (sju ned till två), `fs-a-antal-07` (två upp till sju) läses som nav. |
| F2 lösa kantprickar | **Åtgärdat** | Exakt en kantprick i alla duo-kant-figurer, rad och alternativ. De sex nya `fs-e-vand-04` till `09` läses: pricken står mot cellens kant eller hörn, formen i mitten är tydligt större än pricken. |
| F3 prick i kärnan | **Åtgärdat** | Kärnsymboler i de 39 är cirkel, romb, kvadrat, ring, plus och kryss. Ingen prick. Orbitalprimitiven med fylld mittpunkt (`fs-e-vaxl-06`, `10`) står kvar som i granskning 01 (`fs-e-vaxl-02` godkänd där): den prickade banan ger prickarna var sin roll. Bevakas i klicktestet. |
| F4 värden utanför serien | **Åtgärdat** | `fs-a-vaxl-03`, `07`, `fs-a-flera-01`, `03`: bara diagonala pilar. `fs-a-antal-02`, `04`, `05`: alla starter inom kvartsvarvens mängd. Inga ortogonala pilar i expertens duo-kant. |
| F5 en regel löser expertfrågan | **Åtgärdat för regeldimensionerna, men genvägen finns kvar via konstanterna** | I alla 24 expertfrågor bryts ingen regeldimension av alla fem, och alla har minst en nära miss. Men i de fyra F7-frågorna med en konstant dimension (`fs-e-vaxl-01`, `03`, `05`, `07`) bryter tre eller fyra av fem distraktorer konstanten, och bland de som håller konstanten saknas nära miss på en av regeldimensionerna. Den som kollar konstanten (gratis) och en regel är klar. Se F6 nedan. |

## 3. Nya fynd

**F6. Konstanten är en gratis kontroll, och S14 räknar inte med den.** `fs-e-vaxl-01`: fyra av fem alternativ är korta pilar när hela raden är lång; kvar står A och facit, och spetsen behövs aldrig. `fs-e-vaxl-03`: tre av fem är ofyllda i en helsvart rad; bland de två som håller konstanten finns ingen som bryter bara formen, så formcykeln behövs aldrig. `fs-e-vaxl-05`: tre öppna spetsar i en fylld rad; vinkeln behövs aldrig. `fs-e-vaxl-07`: tre svarta i en ofylld rad; läget behövs aldrig. `fs-e-vaxl-09` (godkänd i 01) har också tre konstantbrott men håller, eftersom de två rena är nära missar på var sin regel (A längd, E vinkel). Det är kriteriet. Regel för expert: **bland distraktorer som håller alla konstanter ska varje regeldimension ha en nära miss som bryter bara den**, och högst två av fem får bryta en konstant. De fyra byggs om, raden står.

**F7. Samma rad två gånger.** `fs-e-flera-04` har exakt samma prickrad som `fs-e-flera-03` (7, 5, 2, 6, 1 moturs med växande steg) och samma cykliska formordning (romb, cirkel, kvadrat), bara förskjuten en fas. Samma skäl som för `fs-e-fyll-06` i granskning 01: variera regeln, inte fasen. `fs-e-flera-04` stryks. Ersättaren ska ha annan lägesregel eller annan start och riktning, och får inte dela prickrad med `fs-e-flera-03`, `fs-e-fyll-01` eller `fs-e-fyll-03`.

**F8. Antal i cykel på ett sektorhjul går inte att läsa entydigt.** `fs-e-antal-03` (F7, start växelvis, antal 1, 3, 2) har rätt facit enligt generatorns konvention (första svarta sektorn medurs är gruppens läge, nya sektorer läggs medurs). Men en grupp av sektorer med varierande antal har tre lika naturliga lägen: första sektorn, mitten och sista sektorn. När antalet ändras med konstant steg (F4: alltid minus ett) ger de tre läsningarna samma svar, så F4 på avancerad håller. När antalet går 1, 3, 2, 1, 3 skiljer de sig: första-sektorn-läsningen ger 135 och 90 grader, sista-sektorn-läsningen ger 180 och 0 grader, båda är konsekventa i raden, och bara den ena har ett alternativ. Frågan mäter då om kandidaten gissat konventionen, inte om hon ser mönstret. Stryks. **Ställningstagande om antal-familjen på expert:** den ska komma från F7, men med antal som steg (plus eller minus ett per figur, konstant), aldrig cykel, på sektorhjul eller strålar: till exempel start växelvis och antal 7, 6, 5, 4, 3 ned till 2, eller 2 upp till 7. Då sammanfaller alla tre läsningarna och frågan har två riktiga regler (växelvis läge och antal). Regeln i generatorn: antal på en grupprimitiv (sektor, strålar) får bara ha regeln steg, aldrig cykel; cykel för antal reserveras för primitiver där antalet är separata element.

**Mindre, inte fällande.** `fs-g-antal-04`: fyra av fem alternativ är sjustrecksstjärnor med olika start, så kandidaten ser bort från dem i ett svep och står med två. Håller på grund (facit entydigt, inga nålar), men i omgång 3 sprids antalsvärdena som i `fs-g-antal-10` (fem, fyra, fem, fyra, två). F6 med tre regler (`fs-e-vand-04` till `09`, `fs-e-vrid-01`, `02`, `fs-e-vax-01` till `03`, `fs-e-fyll-01` till `03`, `fs-e-flera-03`): de håller S14 och har en till två nära missar, men två av tre regler räcker alltid eftersom bara en regel har en nära miss. För omgång 3: en nära miss per regeldimension (tre på F6-tre), så att alla tre regler behövs. Inte retroaktivt.

## 4. Beslut per id

### Grund (7)

| Id | Beslut | Skäl |
|---|---|---|
| fs-g-vrid-11 | ja | ersätter vrid-08; tre streck, 135 grader, två rena (A, B) före konstantbrotten |
| fs-g-antal-01 | ja | C ersatt med två streck på annan start; B är nära miss (rätt antal, fel plats) |
| fs-g-antal-04 | ja | enstrecken borta; fyra sjustrecksalternativ är tunt, se avsnitt 3 |
| fs-g-antal-10 | ja | bra spridning: fem, fyra, fem, fyra och en nära miss |
| fs-g-antal-13 | ja | ersätter antal-07; raden startar på sju, facit två streck, B och E och F "har inte minskat" på olika starter |
| fs-g-vax-03 | ja | A ren, F tre streck (läses som tre) |
| fs-g-vax-06 | ja | B och C rena, tre konstantbrott |

### Avancerad (8)

| Id | Beslut | Skäl |
|---|---|---|
| fs-a-antal-02 | ja | starter inom kvartsvarvet; B nära miss på antal, C nära miss på start |
| fs-a-antal-04 | ja | alla alternativ två eller tre streck; B och D nära miss på start, F på antal |
| fs-a-antal-05 | ja | A nära miss på antal, C på start |
| fs-a-antal-07 | ja | ersätter antal-01; två upp till sju streck, 90 grader moturs; sju bara i facit och E |
| fs-a-flera-01 | ja | en prick, bara diagonala pilar; A, B, C nära missar |
| fs-a-flera-03 | ja | som flera-01 |
| fs-a-vaxl-03 | ja | bara diagonala pilar; B, D, E nära missar |
| fs-a-vaxl-07 | ja | en prick, diagonala pilar; D och E nära missar |

### Expert (24)

| Id | Beslut | Skäl |
|---|---|---|
| fs-e-vrid-01 | ja | två nära missar (A vinkel, E längd), två som bryter allt |
| fs-e-vrid-02 | ja | F nära miss på vinkel; vinkel 4, längd 3, spets 4 |
| fs-e-vax-01 | ja | B nära miss på vinkel; spridning 4, 4, 3 |
| fs-e-vax-02 | ja | D nära miss på vinkel |
| fs-e-vax-03 | ja | F nära miss på längd |
| fs-e-vand-04 | ja | ny, duo kant + form; D nära miss på form; växelvis ett och två steg medurs läses |
| fs-e-vand-05 | ja | ny; B nära miss på läge |
| fs-e-vand-06 | ja | ny; F nära miss på form |
| fs-e-vand-07 | ja | ny, växande steg ett till fem; B nära miss på läge |
| fs-e-vand-08 | ja | ny; E nära miss på form |
| fs-e-vand-09 | ja | ny; C nära miss på läge; delar inte rad med vand-08 |
| fs-e-fyll-01 | ja | två nära missar (B läge, C fyllning) |
| fs-e-fyll-02 | ja | B nära miss på läge |
| fs-e-fyll-03 | ja | E nära miss på läge |
| fs-e-flera-03 | ja | ny, duo orbital + form; E nära miss på läge |
| fs-e-flera-04 | nej | samma prickrad och formordning som flera-03, bara fasen skiljer (F7) |
| fs-e-antal-03 | nej | antal i cykel på sektorhjul: gruppens läge är inte entydigt när antalet inte ändras med konstant steg (F8) |
| fs-e-vaxl-01 | ändra | fyra av fem bryter längdkonstanten; ingen nära miss på spets bland de som håller den (F6) |
| fs-e-vaxl-03 | ändra | tre bryter fyllningskonstanten; ingen nära miss på form bland de rena (F6) |
| fs-e-vaxl-04 | ja | två nära missar (A läge, B symbol); ring, plus, kryss skiljer sig från kantpricken |
| fs-e-vaxl-05 | ändra | tre bryter spetskonstanten; ingen nära miss på vinkel bland de rena (F6) |
| fs-e-vaxl-06 | ja | tre nära missar (A, E satellit, C mittpunkt), ingen konstant |
| fs-e-vaxl-07 | ändra | tre bryter fyllningskonstanten; ingen nära miss på läge bland de rena (F6) |
| fs-e-vaxl-10 | ja | tre nära missar (D, E satellit, F mittpunkt) |

## 5. Vad generatorn ska ändra inför omgång 3

1. **S14 med konstanter:** bland distraktorer som håller alla konstanter ska varje regeldimension ha minst en nära miss (bryter bara den). Högst två av fem får bryta en konstant på avancerad och expert. `v7-distraktor-check --serie` ska fälla `fs-e-vaxl-01`, `03`, `05`, `07` i nuvarande skick och släppa `fs-e-vaxl-09`.
2. **Antal på grupprimitiv (sektor, strålar): bara regeln steg med konstant ändring, aldrig cykel.** Ersättaren för `fs-e-antal-03` byggs som F7 med start växelvis och antal steg (till exempel 7 ned till 2 eller 2 upp till 7).
3. **Radunikhet:** två frågor på samma nivå får inte ha samma lägesrad (samma fem lägen i samma ordning) oavsett form- eller fyllningsfas. Fäller `fs-e-flera-04`; ersättaren får annan lägesregel eller annan start och riktning.
4. **Ombyggnad i `andra`:** samma rad, samma id, nya `options`, `correctAnswer`, `misstag`, som i omgång 2.
5. **Rekommendation, inte krav:** på F6 med tre regler en nära miss per regeldimension; i F2 på grund sprids antalsvärdena bland konstantbrotten.
6. **Regeltext för F7 med antal:** säg var nya sektorer eller streck läggs ("ett streck till kommer till medurs"), som i `fs-a-antal-07`. Copywriter putsar efter befordran.

## 6. Data mot bedömning

Data: facit, lägen, takter och vilka dimensioner varje alternativ bryter är räknade ur kandidatfilen; utfallen i avsnitt 1 följer av det. Bedömning: att en konstant är en gratis kontroll (F6), att en sektorgrupps läge är tvetydigt när antalet inte ändras jämnt (F8), att två frågor med samma prickrad känns som en upprepning i ett prov (F7), och att orbitalens fyllda mittpunkt går att skilja från satelliten tack vare banan. F8 går att pröva: visa `fs-e-antal-03` för fem personer och be dem peka ut var gruppen "står" i figur två och fyra.
