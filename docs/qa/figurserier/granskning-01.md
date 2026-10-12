# Figurserier, granskning 01

Datum 2026-10-12. Granskare: testansvarig. Underlag: `docs/qa/figurserier/ATT-GRANSKA.md`, de 96 PNG i `kandidater/`, kandidatfilerna i `src/lib/figurserierV1/kandidater/`, `bestallning-omgang2.md` A3 till A5, `figurserier-spec.md`, G1 till G12. Facit kontrollerat för hand på alla F1 till F3, alla F6 och F7 och på minst tre per mall i F4 och F5; distraktorstrukturen räknad maskinellt per fråga (enstrecksfigurer, värden utanför serien, nära miss, hur många distraktorer som bryter varje dimension).

Beslutet i tre nivåer: **ja** (in i banken oförändrad), **ändra** (raden står och id behålls, bara alternativen byggs om enligt regeln nedan, jag granskar om i granskning-02), **nej** (raden stryks, ersätts med nytt löpnummer). Beslutsfilen `beslut-01.json` har `godkanda`, `andra` och `strukna`; inget i `andra` går in i banken förrän alternativen är ombyggda.

## 1. Utfall

| Nivå | Ja | Ändra | Nej | Efter ändra | Efter ersättning |
|---|---|---|---|---|---|
| Grund | 29 | 5 | 2 | 34 | 36 |
| Avancerad | 22 | 7 | 1 | 29 | 30 |
| Expert | 6 | 15 | 9 | 21 | 30 |

Golv för lansering: 28 per nivå (matrisernas pool för 15 dragna). Grund och avancerad når golvet så fort alternativen i `andra` är ombyggda. Expert når inte golvet utan ersättare: minst 7 nya F6 krävs, och F6-receptet måste ändras (avsnitt 4) innan de byggs. Lansering av de tre nivåtesten väntar alltså på expert; grund och avancerad kan befordras till bank när granskning-02 är klar.

Facit: inget fel funnet i någon av de 96. FS4 håller. Problemen sitter i figurer som inte går att läsa och i alternativ som ger genvägar.

## 2. Fem fynd som gäller flera frågor

**F1. Ett streck med punkt läses som en nål.** Strålprimitiven med ett enda streck är exakt "strecket och punkten" som ägaren underkände i skiss 6: ett sammansatt element. Med två eller fler streck läses punkten som nav. Regel: strålar har minst två streck i raden och i alla alternativ. Fäller `fs-g-vrid-08` (hela raden), `fs-g-antal-07` (raden börjar med ett streck), `fs-a-antal-01` (facit är ett streck) och alternativ i fem grundfrågor och en avancerad.

**F2. Flera prickar längs kanten utan ram går inte att läsa.** Duo-kant har ingen synlig kvadrat. En prick läses mot cellens kanter (topp, hörn, sida). Två eller tre prickar blir ett tärningsmönster runt pilen, och "första pricken" i bågen går inte att peka ut; `fs-e-vand-01` till `03` ser ut som lösa prickar, det som minnet förbjuder sedan orbital skrotades två gånger. Regel: `yantal` är alltid 1, i raden och i alternativen. Fäller sju expertrader och alternativ i `fs-a-flera-01`, `fs-a-flera-03`, `fs-a-vaxl-07`, `fs-e-vaxl-04`.

**F3. Pricken som symbol i kärnan bredvid kantpricken.** Symbolen `prick` (r 5) är samma glyf som kantpricken (r 5). I `fs-e-flera-01` fig 2 står två identiska prickar i cellen med olika roller. Regel: kärnsymbolerna i duo är kryss, plus, minus och ring; aldrig prick. Fäller `fs-e-flera-01`, `fs-e-flera-02`, `fs-e-vaxl-08`.

**F4. Värden utanför serien.** När en stegdimension har period 4 (k = 2 eller 6) når raden bara fyra värden. Alternativ med värden utanför dem är genvägar: i `fs-a-vaxl-03` har fyra av fem alternativ en vågrät eller lodrät pil medan raden bara har diagonala; kandidaten stryker fyra utan att se regeln. Samma sak för startsektor och startstreck vid kvartsvarv (`fs-a-antal-02`, `04`, `05`) och för pilen i `fs-e-vand-01`, `03`. S12 räknar i dag bara cykeldimensioner; den ska räkna varje dimension vars nåbara mängd är mindre än primitivens, med noll tillåtna på alla nivåer.

**F5. En regel löser expertfrågan.** I 17 av 30 expertfrågor bryter alla fem distraktorer samma regeldimension (oftast vinkel eller läge). Den som räknar ut den dimensionen är klar; de två andra reglerna behövs inte. Tio expertfrågor saknar dessutom nära miss (ett alternativ som bryter exakt en regel), vilket A5 kräver. Regel för frågor med minst två regeldimensioner: ingen dimension bryts av alla fem; expert har minst en nära miss och två som bryter alla regler med olika värden. Avancerad F4 klarar redan regeln i alla 20. Fäller inga rader, men 15 expertfrågor får nya alternativ.

Mindre, inte fällande: i F1, F3 och F5 med en regeldimension finns oftast två rena distraktorer (bara regeln fel, ingen kopia) men generatorn tar bara en och låter fyra bryta en konstant (`fs-g-vrid-01`, `fs-a-vaxl-02` med flera). Rätt på grund, tunt på avancerad. Regel: alla rena tas innan någon bryter en konstant, och de som bryter konstanter sprids över olika konstanter när primitiven har flera. Tillämpas på ersättare och i omgång 3, inte retroaktivt.

## 3. Beslut per id

### Grund (36)

| Id | Beslut | Skäl |
|---|---|---|
| fs-g-vrid-01 | ja | |
| fs-g-vrid-02 | ja | |
| fs-g-vrid-03 | ja | |
| fs-g-vrid-04 | ja | |
| fs-g-vrid-05 | ja | |
| fs-g-vrid-06 | ja | D bryter bara antalet, bra distraktor |
| fs-g-vrid-07 | ja | |
| fs-g-vrid-08 | nej | Hela raden är ett streck med punkt (F1) |
| fs-g-vrid-09 | ja | |
| fs-g-vrid-10 | ja | |
| fs-g-vand-01 | ja | |
| fs-g-vand-02 | ja | |
| fs-g-vand-03 | ja | |
| fs-g-vand-04 | ja | |
| fs-g-vand-05 | ja | |
| fs-g-vand-06 | ja | två rena distraktorer, så ska det se ut |
| fs-g-antal-01 | ändra | C är ett streck (F1); ersätt med två streck på annan start |
| fs-g-antal-02 | ja | |
| fs-g-antal-03 | ja | |
| fs-g-antal-04 | ändra | D och F är ett streck (F1); ersätt med två streck på annan start och tre streck på annan start |
| fs-g-antal-05 | ja | |
| fs-g-antal-06 | ja | |
| fs-g-antal-07 | nej | Raden börjar med ett streck (F1); växande strålserie startar på två |
| fs-g-antal-08 | ja | |
| fs-g-antal-09 | ja | |
| fs-g-antal-10 | ändra | B, C, D är ett streck (F1) |
| fs-g-antal-11 | ja | |
| fs-g-antal-12 | ja | |
| fs-g-vax-01 | ja | |
| fs-g-vax-02 | ja | |
| fs-g-vax-03 | ändra | A, C, D är ett streck (F1) |
| fs-g-vax-04 | ja | |
| fs-g-vax-05 | ja | |
| fs-g-vax-06 | ändra | B, C, F är ett streck (F1) |
| fs-g-vax-07 | ja | |
| fs-g-vax-08 | ja | |

Vid avtagande antal i F2 finns ingen ren antalsdistraktor utan enstreck eller kopia; där räknas "rätt antal, fel plats" som nära miss (som D i `fs-g-antal-03`).

### Avancerad (30)

| Id | Beslut | Skäl |
|---|---|---|
| fs-a-vrid-01 | ja | |
| fs-a-vrid-02 | ja | |
| fs-a-vrid-03 | ja | |
| fs-a-vrid-04 | ja | |
| fs-a-vand-01 | ja | |
| fs-a-vand-02 | ja | |
| fs-a-antal-01 | nej | Facit är ett streck (F1) |
| fs-a-antal-02 | ändra | B, C, D, F har start utanför kvartsvarvens mängd (F4) |
| fs-a-antal-03 | ja | cykeln två, fyra, ett är läsbar med fem visade |
| fs-a-antal-04 | ändra | C är ett streck (F1); B, D, E, F start utanför (F4) |
| fs-a-antal-05 | ändra | B, E, F start utanför (F4) |
| fs-a-antal-06 | ja | |
| fs-a-fyll-01 | ja | regeltext: "Fyllningen följer ordningen", inte "Grundformen" |
| fs-a-fyll-02 | ja | samma textfix |
| fs-a-flera-01 | ändra | A, B har tre prickar (F2) |
| fs-a-flera-02 | ja | |
| fs-a-flera-03 | ändra | F har två prickar (F2) |
| fs-a-flera-04 | ja | |
| fs-a-vax-01 | ja | |
| fs-a-vax-02 | ja | |
| fs-a-vaxl-01 | ja | |
| fs-a-vaxl-02 | ja | tunt: bara en av två rena, se avsnitt 2 |
| fs-a-vaxl-03 | ändra | A, D, E, F har vågrät eller lodrät pil, raden bara diagonala (F4) |
| fs-a-vaxl-04 | ja | |
| fs-a-vaxl-05 | ja | tunt, som vaxl-02 |
| fs-a-vaxl-06 | ja | |
| fs-a-vaxl-07 | ändra | A, C, D ortogonal pil (F4); D, F två prickar (F2) |
| fs-a-vaxl-08 | ja | |
| fs-a-vaxl-09 | ja | |
| fs-a-vaxl-10 | ja | |

### Expert (30)

| Id | Beslut | Skäl |
|---|---|---|
| fs-e-vrid-01 | ändra | vinkel bryts av alla fem (F5); fig 3 och 4 med samma vinkel är i sin ordning |
| fs-e-vrid-02 | ändra | vinkel av alla fem, ingen nära miss (F5) |
| fs-e-vrid-03 | ja | |
| fs-e-vrid-04 | ja | |
| fs-e-vax-01 | ändra | vinkel av alla fem (F5) |
| fs-e-vax-02 | ändra | vinkel av alla fem (F5) |
| fs-e-vax-03 | ändra | ingen nära miss (F5) |
| fs-e-vand-01 | nej | tre och två prickar längs kanten utan ram (F2); B, E pil utanför serien |
| fs-e-vand-02 | nej | ett till tre prickar längs kanten (F2) |
| fs-e-vand-03 | nej | tre prickar längs kanten (F2) |
| fs-e-fyll-01 | ändra | läge av alla fem, ingen nära miss (F5) |
| fs-e-fyll-02 | ändra | ingen nära miss (F5) |
| fs-e-fyll-03 | ändra | läge av alla fem, ingen nära miss (F5) |
| fs-e-fyll-04 | ja | |
| fs-e-fyll-05 | ja | |
| fs-e-fyll-06 | nej | samma rad som fyll-01 (läge 7, 6, 4, 1, 5 och romb, cirkel, kvadrat), bara fyllningens fas skiljer; variera regeln, inte startläget |
| fs-e-flera-01 | nej | prick som kärnsymbol bredvid kantprick (F3) |
| fs-e-flera-02 | nej | prick som kärnsymbol (F3) |
| fs-e-antal-01 | nej | läget följer "ordningen 4, 5, 2": en siffercykel över lägen är ingen regel en kandidat kan läsa, och sex prickar runt pilen är gröt; receptet duo-kant-antal utgår |
| fs-e-antal-02 | nej | som antal-01 |
| fs-e-vaxl-01 | ändra | vinkel av alla fem (F5) |
| fs-e-vaxl-02 | ja | tre nära missar, bra balans |
| fs-e-vaxl-03 | ändra | läge av alla fem (F5) |
| fs-e-vaxl-04 | ändra | B, D, F har två prickar (F2) |
| fs-e-vaxl-05 | ändra | vinkel av alla fem (F5) |
| fs-e-vaxl-06 | ändra | satellit av alla fem (F5) |
| fs-e-vaxl-07 | ändra | läge av alla fem (F5) |
| fs-e-vaxl-08 | nej | prick som kärnsymbol (F3) |
| fs-e-vaxl-09 | ja | |
| fs-e-vaxl-10 | ändra | satellit av alla fem (F5) |

## 4. Vad generatorn ska ändra

1. **FS6:** strålar 2 till 7 i raden och i alla alternativ; sektorer 1 till 7; kantprickar exakt 1 (`yantal` är inte längre en dimension); hörn 3 till 8.
2. **Duo:** kärnsymbol ur {kryss, plus, minus, ring}. Ny duo-grupp kant + form (ylage, kform, kfyll) så att F6 har tre grupper med tre dimensioner: pil, duo orbital + form, duo kant + form. Receptet duo-kant-antal och duo-kant-pil-tre utgår ur F6; duo-kant-pil stannar i F4 och F5.
3. **Ingen `cykel` över lägen eller vinklar.** Cykel är bara för kategorier (form, fyllning, symbol, längd, spets) och för antal med högst tre värden.
4. **S12 utanför:** räkna varje regeldimension vars nåbara mängd i raden är mindre än primitivens värdemängd (steg med k = 2, 6 eller 4; cykel). Noll tillåtna på alla nivåer.
5. **Ny spärr S14 balans:** när frågan har minst två regeldimensioner bryts ingen av dem av alla fem distraktorer. Expert: minst en nära miss (exakt en regeldimension fel, inga konstanter fel) och minst två som bryter alla regeldimensioner med olika värden. `v7-distraktor-check --serie` ska fälla alla 15 i `andra` på expert i nuvarande skick.
6. **Rena distraktorer först:** alla alternativ som bryter bara regeldimensionen (och inte är kopia) tas före något som bryter en konstant; konstantbrott sprids över olika konstanter. Vid avtagande antal i F2 räknas "rätt antal, fel plats" som nära miss.
7. **Ombyggnad i `andra`:** samma rad, samma id, nya `options`, `correctAnswer`, `misstag`. Ersättare för `strukna` får nya löpnummer; F6-ersättarna fördelas på pil-tre och de två duo-form-grupperna så att alla sju familjer finns kvar på expert.
8. **Regeltexter:** "Fyllningen följer ordningen" i grundform; aldrig siffror för lägen. Copywriter putsar efter befordran.

## 5. Opus avvikelser i ATT-GRANSKA

1. Primitivförbudet enligt specen 3.1: **godkänt.**
2. Månghörning och kantantal ur F2: **godkänt**, och kantantal går nu ur helt (F2 ovan).
3. FS6-gränserna: **godkänt med ändringen** i punkt 1 ovan (strålar minst två).
4. FS4-fixturen: **godkänt.** Steg 3 och växande steg kan inte båda passa fem visade; de två tvetydiga fixturerna täcker det jag ville ha.
5. Duo-kant och duo-orbital som två primitivgrupper: **godkänt**, med kant + form som tredje grupp.
6. "Bryter mönstret": **omgång 3.** Först 25 sessioner per nivå på härnäst, så percentilen och p_prior kalibreras på ett format. Vyn behöver inte rita regelformen nu.

## 6. Data mot bedömning

Data: facit, perioder, takt och strukturen per alternativ är räknade; antalet per utfall ovan. Bedömning: att ett streck med punkt läses som nål, att flera kantprickar utan ram inte går att läsa (jag ser tärningsmönster, inte en vandring), att en regel som löser hela expertfrågan är fel nivå, och att 28 per nivå räcker som golv. De tre första går att pröva på fem kollegor på 360 om ägaren vill ha mer än mitt ord; det sista är matrisernas erfarenhet.
