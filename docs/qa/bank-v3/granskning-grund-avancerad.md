# Granskning bank_version 3: grund och avancerad

Datum 2026-10-12. Granskare: testansvarig. Underlag: `docs/qa/bank-v3/grund-v3-parti-01/` (88 PNG) och `avancerad-v3-parti-01/` (68 PNG), kandidatfilerna i `src/lib/logicTestV7/kandidater/`, `recept-v3.mjs`, `generera-v3.mjs`, `generera.mjs` (urvalet i `bygg()`), `sparrar.mjs`. Beslut per fråga i `beslut-grund-avancerad.json`. Expert och plus, verbalt och numeriskt granskas av en annan instans och berörs inte här.

Hur jag gjort: alla 156 frågor genom ett eget läsande skript (facit mot rutnätet per dimension, kopior bland synliga rutor, vilka dimensioner alternativen faktiskt skiljer sig i, majoritets- och unikhetsgenvägar, dubbletter, misstagstexternas placering, tankstreck, läsordning, spärrarna S1 till S10). Facit för alla 54 M1/M2/M4 på varje nivå räknat om oberoende ur rad 3 (0 fel). Visuellt: minst en tredjedel av varje malls frågor, alla flaggade, alla med samma första rad som en annan fråga.

## Summering

| Nivå | Nya | Godkända | Strukna |
|---|---|---|---|
| Grund | 88 | 80 | 8 |
| Avancerad | 68 | 23 | 45 |

Det som är rätt: inget facit är en kopia av en synlig ruta utanför latin-antal och latin-form (blindtestet ur planen 5.3 är därmed meningslöst att köra: det finns ingen ruta att peka på). Facit stämmer i samtliga 156. Inga tankstreck, ingen läsordning i texterna, misstagstexterna sitter rätt. M1-texterna ("för varje steg åt höger i raden", "varje rad har sitt eget startläge") är begripliga. Grafiken följer G1 till G12 i allt jag sett: inga tomma alternativ, inga krockar, orbital med streckad ram, strålar högst fyra.

Det som inte håller: **den andra regeln i M2 och M4 testas aldrig.** Det är ett generatorfel, inte ett frågefel, och det fäller 46 frågor (6 på grund, 40 på avancerad).

## Felet i M2 och M4

I alla 46 frågor med `andra: [{ dim, regel: 'schack' | 'diagonal' }]` har samtliga sex alternativ facits värde i den dimension regeln gäller. Exempel `v7a-v3-vrid-01`: regeln säger att spetsen är öppen på diagonalen, och alla sex pilar har öppen spets. Kandidaten behöver bara läsa rotationen i rad 3. Misstagstexterna bekräftar det: alla fem börjar "Spetsen stämmer, men ...". Frågan är en M1 med dekoration, och p_prior 0,55 (M2) eller 0,50 (M4) är satt för en svårighet som inte finns.

Orsak (`generera-v3.mjs` rad 149 till 152 och `generera.mjs` rad 1090 till 1092): byggaren lägger de 13 rörelsefelen först i kandidatlistan och fliparna i den andra egenskapen efter, och `bygg()` tar de första fem med olika misstagstext i byggarens ordning. Fliparna kommer aldrig med. Kontrollen "varje regel bruten av minst en nära miss" (`brutna`/`obrutna`) körs bara för band plus.

Varför spärrarna inte fångade det: S4 (`arEnrad`) jämför rad 3-förutsägelsen per dimension mot alternativen och säger "inte enrad" så snart förutsägelsen i någon dimension inte stämmer med facit. Den tar inte hänsyn till att alternativen inte skiljer sig i den dimensionen. S4b-kvoten på avancerad (17 procent) är därför missvisande: räknat på de dimensioner där alternativen faktiskt varierar är 56 av 68 nya avancerade frågor lösbara ur rad 3 ensam.

Vad generatorn ska ändra, i den här ordningen:

1. `bygg()`: för varje fråga med två eller fler regler (regellistan R ur tolkningen) ska minst två distraktorer bryta varje regel, varav minst en bryter bara den regeln (rätt rörelse, fel spets). Kravet som i dag bara gäller plus (`obrutna.length === 0`) blir ett fel för alla `fran_version` 3. Urvalet tar då först en nära miss per regel, sedan fyller det med rörelsefel.
2. `sparrar.mjs` S4: räkna enrad på de dimensioner där alternativen varierar. Definition: facit är det enda alternativet som stämmer med rad 3-förutsägelsen i varje dimension där minst två alternativ skiljer sig. Lägg till en spärr S11 `otestad`: en regel i R vars dimension är konstant över alla sex alternativ är ett fel för alla nya frågor.
3. Enhetstest: en M2-pil-diagonal med sex öppna spetsar fälls av S11 och räknas som enrad av S4; samma fråga med två fyllda distraktorer klarar båda.
4. Kör om de 46 med samma recept och nya löpnummer. Rutnäten får gärna vara samma, men id-regeln står: nytt löpnummer.

## Per mall

### Grund

| Mall | Antal | Beslut | Anmärkning |
|---|---|---|---|
| M1-pil-linjar | 4 | godkända | Facit, distraktorer och text rätt. Alla fem distraktorer är vinkelfel, vilket är avsikten på grund |
| M1-pil-fri | 5 | godkända | "Varje rad har sitt eget startläge" fungerar |
| M1-stralar-linjar | 3 | godkända | |
| M1-stralar-fri | 10 | 9 godkända, vrid-21 struken | vrid-15 och vrid-21: rad 1 och rad 3 identiska, samma facit, bara mittraden skiljer. S10 ser bara utseende och struktur, inte delade rader |
| M1-orbital-linjar | 4 | godkända | |
| M1-orbital-fri | 9 | 8 godkända, vand-12 struken | Samma fel som vrid-21, mot vand-06 |
| M1-block-fri | 3 | godkända | Tre olika block per fråga, rotationen syns |
| M1-sektor-linjar | 2 | godkända | |
| M1-sektor-fri | 8 | godkända | Sektormönstren utan rotationssymmetri, bra |
| M2-pil-schack | 4 | strukna | Andra regeln otestad (ovan) |
| M2-orbital-schack | 2 | strukna | Samma |
| M3-balans | 4 | godkända | Läses som en bild, inte två: formerna delar linje och fack. Alternativen är hela produkten kvadrat × cirkel, bra |
| antal-summa | 2 | godkända | Se anmärkning om riktningsdistraktorer nedan |
| antal-egen-riktning | 3 | godkända | Samma anmärkning |
| latin-form | 9 | godkända | diag växlar olika/konstant som planerat; facit på ruta 1/3 respektive 0/4. lform-05 har en eliminerbar distraktor (grå yttre ring), inom taket |
| latin-antal | 8 | godkända | |
| spegling | 3 | godkända | speg-02 (lattice) har en eliminerbar distraktor, inom taket |
| overlagring | 4 | godkända | |
| latin-flera | 1 | godkänd | |

Anmärkning antal-andras (gäller båda nivåerna, ändras i generatorn till parti 03, frågorna står på grund): tre av fem distraktorer har stående streck när rutnätet bara har liggande (eller omvänt). De stryks utan att regeln lästs, så frågan har i praktiken tre alternativ. Bygg i stället tre distraktorer med rätt riktning (facit ±1, ±2 inom 1 till 4) och högst två riktningsflippar, med rätt antal. På avancerad antal-egen-riktning är riktningen en regel (diagonalen) och flipparna legitima; de två godkänns.

### Avancerad

| Mall | Antal | Beslut | Anmärkning |
|---|---|---|---|
| M2-pil-diagonal | 7 | strukna | Andra regeln otestad |
| M2-pil-fri-diagonal | 4 | strukna | Samma |
| M4-pil | 8 | strukna | Samma. Mekanismen i sig håller: facit räknat om ur rad 3 för alla åtta, texten "åt samma håll som i mittraden" stämmer mot distraktorn |
| M2-pil-tre | 6 | strukna | Samma. Både längd och spets otestade; tre regler på papperet, en i praktiken |
| M2-orbital-schack | 5 | strukna | Samma, och dessutom enrad av konstruktion (schack längs raden är en växling, läsbar ur rad 3). Byggs om som M2-orbital-diagonal eller med mittpunkten i latinsk kvadrat, inte schack |
| M2-orbital-diagonal | 10 | strukna | Andra regeln otestad. vand-03 och vand-06 delar fem av åtta celler |
| M2-2x2-latin | 1 | godkänd | Svart ruta radvis, prick i latinsk kvadrat; en eliminerbar distraktor (prick nere till vänster), inom taket. Regeltexten är lång men entydig |
| M1-block-fri | 5 | godkända | En regel, p_prior 0,6. Godkänns som nivåns enradskvot (S4b högst 40 procent). Två har fyra eller fem svarta rutor, vilket ger antalsdistraktorer |
| M1-sektor | 5 | godkända | Samma. rot-03 och rot-05 delar första raden men har olika fortsättning och olika facit |
| M3-balans | 4 | strukna | Identiska med grundreceptet: samma BAL-par 0 till 3, samma sidor, ordagrant samma regeltext som v7g-v3-tva-01 till -04. Planen 2.5 kräver sida (eller fyllning) i schack som tredje element på avancerad; `fill: 'gray'/'none'` finns redan i renderaren (P6) |
| antal-summa | 1 | struken | Planen: riktning som växlar per rad. Byggd utan; tre riktningsdistraktorer utanför rutnätet |
| antal-egen-riktning | 2 | godkända | Stående på diagonalen är en riktig andra regel |
| latin-form | 4 | godkända | |
| latin-antal | 1 | godkänd | |
| spegling | 1 | godkänd | Lodrät och sedan diagonal spegling på 3×3-block, svår nog |
| overlagring | 3 | godkända | diff-ab, snitt, xor; texterna rätt |
| latin-flera | 1 | godkänd | |

## Opus avvikelser som rör grund och avancerad

1. **2×2 i M1 och M3 ersatta.** Godtas. Räkningen håller: med fyra lägen täcker varje rad tre av fyra, och facit undviker rad 0 och rad 1 bara om de har samma startläge, vilket ger identiska rader. Volymen i orbital och sektorhjul är rimlig. Följd: familjen vandring har ingen 2×2-fråga på grund; 2×2 finns bara i spegling, överlagring och latin. Noteras, inget krav.
2. **Mönsterrotation med antal i latinsk kvadrat ersatt av M1 på avancerad.** Godtas provisoriskt som enradskvoten. Det betyder att avancerad får 10 enradsfrågor av konstruktion plus 2×2-latin; efter ombyggnaden av M2 hamnar kvoten runt 16 procent av de nya. Om tolkningen senare klarar antal plus vridning ska de tio ersättas.
3. **M3 på balanslinjen i stället för 2×2.** Godtas på grund. På avancerad byggdes den utan den tredje regeln och blev en kopia av grund, se ovan.
4. **Pensionslistan 157.** Stämmer med planen 2.5: 60+4, 43+3, 46+2 ger 158 med `v7a-3c-lform-03` räknad två gånger. Godtas.
5. **Facit per ruta** (ATT-GRANSKA 3): ruta 0 på 8 respektive 3 procent, ingen ruta över 18 procent. Under S1b-taket. Godtas.

## Vad som krävs före befordran av grund och avancerad

1. Generatorändringarna 1 till 3 ovan, med `v7-facit-check` som visar S11 noll och den nya S4-räkningen på hela version 3-poolen.
2. Omkörning: grund 6 (M2-pil-schack 4, M2-orbital-schack 2), vrid-21 och vand-12 med nya seeds; avancerad 40 M2/M4 (orbital-schack som diagonal eller latin), 4 M3-balans med sida eller fyllning i schack, 1 antal-summa med växlande riktning. Nya löpnummer.
3. En spärr mot delade rader: två frågor i samma recept får inte dela mer än en rad, och aldrig facit plus en rad.
4. Jag granskar de nya på samma sida. Grund kan gå ut med de 80 godkända om tidsplanen kräver det (113 minus 8 ger 105 valbara, över målet 93), avancerad kan inte: 35 plus 23 är 58, under gränsen 80.

## Data och bedömning

Data: alla räkningar ovan (kopior, otestade dimensioner, facit ur rad 3, dubbletter, per mall), kodraderna som orsakar urvalet. Bedömning: att M1 på avancerad är acceptabelt som enradskvot, att p_prior per mall håller tills kalibreringen säger annat, att riktningsdistraktorerna i antal-andras kan stå på grund.
