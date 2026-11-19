# Granskning: talserier omgång 3, bankversion 4 (2026-11-19)

Testansvarig. Alla 100 rader med `fran_version: 4` lösta för hand: rad, facit, alternativ, regeltext, bågar och misstagstexter. `node scripts/talserier-verifiera.mjs --version 4` ger 100 uppgifter, 0 fel, 0 varningar, och hela banken 516 uppgifter, 0 fel, 0 varningar. Utöver V7 och V8 gjorde vi två egna sökningar: rader med samma kvotföljd (samma serie i annan skala, alltså den multiplikativa motsvarigheten till en flyttad rad) och rader i andra och tredje ordningen med samma skillnad mellan stegen. Bankerna och skripten är orörda.

**Beslut: godkänt med villkor.** 88 rader godkänns som de står. Åtta geometriska grundrader byts, en expertrad byts och tre misstagstexter skrivs om före aktiveringen. Varje facit är entydigt: vi hittade ingen rimlig alternativ regel som pekar på ett annat alternativ. Där två läsningar passar ger de samma svar, till exempel två räknesätt i tur mot två varvade delserier (ts-g-geom-06, ts-a-affin-39) och tre steg i tur mot "var tredje tal ökar med summan" (ts-g-vaxel-50 till 53). I varvade rader med gånger 1,5 eller gånger −3 har den geometriska delserien bara tre tal, så vi räknade också läsningen "steget växer lika mycket" för den delserien. Den ger inget av alternativen i någon rad. Inga tankstreck i texterna, minustecknet är −.

## Rättas före aktivering

| # | Id | Fynd | Åtgärd |
|---|---|---|---|
| 1 | ts-g-geom-13 | Samma kvotföljd som ts-g-geom-06 (÷3, ×4, ÷3, ×4, ÷3 med facit). Raden är 06 gånger 4: 108 36 144 48 192 mot 27 9 36 12 48. | Nytt räknesättspar, förslag ×5 och ÷4: 16 80 20 100 25 → 125. |
| 2 | ts-g-geom-11 | Samma kvotföljd som ts-g-geom-07 (÷4, ×3 i tur, fem kvoter gemensamma) och som ts-g-geom-19 i annan fas. | Förslag ×4 och ÷5: 25 100 20 80 16 → 64. |
| 3 | ts-g-geom-19 | ×3, ÷4 i tur: fyra kvoter gemensamma med ts-g-geom-07 och fem med 11. Samma par som 07, bara med start på det andra räknesättet. | Förslag ÷2 och ÷5: 200 100 20 10 2 → 1. |
| 4 | ts-g-geom-17 | Samma kvotföljd som ts-g-geom-09, alla sex kvoter (135 270 90 180 60 120 är 09 gånger 5/3), och fem gemensamma med 08. | Förslag ×5 och ÷3: 18 90 30 150 50 → 250. |
| 5 | ts-g-geom-09 | ×2, ÷3 i tur: fem kvoter gemensamma med ts-g-geom-08 (÷3, ×2). Samma par i annan fas. | Förslag ×2 och ÷5: 125 250 50 100 20 → 40. |
| 6 | ts-g-geom-15 | Samma kvotföljd som ts-g-geom-14, alla sex kvoter (64 32 96 48 144 72 är 14 gånger 4/3). | Förslag ×3 och ÷5: 25 75 15 45 9 → 27. |
| 7 | ts-g-geom-16 | Samma kvotföljd som ts-g-geom-10 (×3, ×2 i tur), fem kvoter gemensamma, och fem med 18. | Förslag ×2 och ×5: 1 2 10 20 100 → 200. |
| 8 | ts-g-geom-18 | ×2, ×3 i tur: fyra kvoter gemensamma med ts-g-geom-10 och fem med 16. | Förslag ÷2 och ÷3: 216 108 36 18 6 → 3. |
| 9 | ts-e-andra-43 | Stegen är kvadrattalen +1, +4, +9, +16, +25. Skillnaden mellan stegen (+3, +5, +7, +9) är exakt densamma som i ts-a-andra-03 och 06 på avancerad, och kvadrattalen känns igen direkt. Raden är lättare än avancerads tredje ordning och hör inte hemma på expert. | Ny regel i samma familj med krympande skillnad eller tecken som byts (t < 0 eller s < 0, som de övriga sju), V9 igen. |
| 10 | ts-e-andra-39, 40, 44 | Misstagstexten för `tredje_for_mycket` säger "Skillnaden mellan stegen växer lika mycket varje gång", men i de här raderna minskar skillnaden (med 2, 4 och 1). Eleven som valde fel får en förklaring som säger emot regeltexten. | Byt andra meningen mot "Skillnaden mellan stegen ändras lika mycket varje gång." Samma text finns i ts-e-andra-33 från version 3, rätta den i samma körning. Bäst är att byta mallen i generatorn, så texten blir rätt oavsett riktning. |

**Varför de geometriska raderna fälls.** V8 fäller två rader där fyra steg i följd är gemensamma, eftersom den som löst den ena då löser den andra utan att tänka. För en serie som multipliceras är kvoterna stegen. Fjorton nya grundrader fördelar sig på sex räknesättspar: ÷3/×4 (06, 13), ÷4/×3 (07, 11, 19), ÷3/×2 (08, 09, 17), ×3/×2 (10, 16, 18), ÷2/×3 (14, 15) och ×5/÷2 (12). Att börja på det andra räknesättet ger samma par, och i rader med sex visade tal finns båda faserna med. Med 19 geometriska rader av 172 får ungefär var tolfte grundsession två rader med samma par. Vi behåller en rad per par (06, 07, 08, 10, 12, 14) och byter de åtta övriga.

Förslagen ovan är kontrollerade mot hela banken och mot varandra: inga fyra tal, steg eller kvoter i följd gemensamma, alla tal heltal under 400 och inget upprepat tal. Alla har fem visade tal. Skribenten får välja andra par, men varje rad ska ha ett eget räknesättspar. Klarar en rad inte närhetskravet eller TS1 till TS10, pensionera den med `pensionerad_fran: 4` i stället för att behålla en dubblett. Hellre 11 till 13 nya geometriska rader på grund än samma par två gånger. Bytet görs som i omgång 2: samma id och familj, nya parametrar, aldrig visad. Lägg till kvotjämförelsen i V8 för geometrisk innan bytet körs, så att spärren fäller det här själv nästa gång.

## De fyra frågorna

**1. Två räknesätt som turas om: behåll familjen, byt namnet.** Raderna stannar i geometrisk. De multiplicerar och delar, lösaren klassar dem som geometriska, och poängen med omgången var att vikta grund mot den familjen. Växelvis heter "Växelvis plus och minus" och handlar om steg som läggs till, så där blir namnet fel på samma sätt fast åt andra hållet. Affin heter "Gånger och plus" och betyder ×k + c. Beslut: i `src/lib/tester/steg2/namn.ts` byts `geometrisk: 'Gånger samma tal'` mot `geometrisk: 'Gånger och delat'`. Namnet täcker ren dubblering, halvering och två räknesätt i tur, även gånger −2 på högre nivåer, och står tydligt isär från "Gånger och plus". Ingen kod eller test läser texten, nyckeln är familjens id, så bytet påverkar inga sparade resultat. Görs i samma commit som aktiveringen.

**2. Gånger 4 och delat med 4 på grund: får stå.** Att dela med 4 är två halveringar, och alla tal är jämna multiplar under 400 (320 → 80, 384 → 96, 288 → 72). Det svåra i raderna är att se att två räknesätt turas om, inte uträkningen. Efter bytena ovan finns gånger 4 eller delat med 4 kvar i ts-g-geom-06 och 07, och i förslagen för 11 och 13, alltid i par med ett annat räknesätt. Om lösningsandelen för de raderna hamnar klart under de andra två-räknesätt-raderna på grund (mer än 0,10 lägre) byter vi dem mot par utan fyror.

**3. Decimaltal: visas inte, och det är rimligt som det är.** Alla visade tal och alla alternativ i de 100 raderna är heltal, och V4 kräver det fortfarande. Decimalkomma finns bara i regeltexten "gånger 1,5" och bågen ×1,5, i tretton rader på avancerad: ts-a-varv-38 till 45 och ts-a-affin-39, 40, 43, 44 och 46. Gånger 1,5 är "talet plus hälften" och alla starttal är valda så att talen blir hela. Att talet efter luckorna får vara ett decimaltal påverkar bara distraktorn "ett steg för långt", som då faller bort. Det talet visas aldrig. Villkoret för framtiden: friheten får aldrig nå raden eller alternativen, och decimaler i rad eller alternativ hör inte hemma på någon nivå. Frivilligt: regeltexten kan få tillägget "gånger 1,5, alltså talet plus hälften", som hjälper den som inte räknar med decimaler i huvudet.

**4. Tredje ordningen från omgång 2 med fyra steg i regeltexten: ja, rätta alla tolv.** Ingen av dem är fel i sak och ingen läses som dubblering, som 01 och 05 gjorde. Men eleven ser regeltexten efter svaret, bredvid en rad med fem steg, och de nya raderna och 01 och 05 listar alla fem steg och fyra skillnader. Det är bara text, regelnyckel, rad och facit är orörda, så de aktiva raderna kan ändras utan att någon session påverkas. Nya texter:

- ts-a-andra-02: Stegen är −3, −1, +3, +9, +17 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+2, +4, +6, +8).
- ts-a-andra-03: Stegen är +5, +8, +13, +20, +29 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+3, +5, +7, +9).
- ts-a-andra-04: Stegen är −2, −1, +2, +7, +14 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+1, +3, +5, +7).
- ts-a-andra-06: Stegen är +5, +8, +13, +20, +29 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+3, +5, +7, +9).
- ts-e-andra-28: Stegen är +3, +2, +3, +6, +11 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (−1, +1, +3, +5).
- ts-e-andra-29: Stegen är −9, −12, −11, −6, +3 och så vidare. Skillnaden mellan två steg växer med 4 varje gång (−3, +1, +5, +9).
- ts-e-andra-30: Stegen är +4, +8, +10, +10, +8 och så vidare. Skillnaden mellan två steg minskar med 2 varje gång (+4, +2, 0, −2).
- ts-e-andra-31: Stegen är +3, +1, −5, −15, −29 och så vidare. Skillnaden mellan två steg minskar med 4 varje gång (−2, −6, −10, −14).
- ts-e-andra-33: Stegen är −4, −2, −2, −4, −8 och så vidare. Skillnaden mellan två steg minskar med 2 varje gång (+2, 0, −2, −4).
- ts-e-andra-34: Stegen är −2, −4, −7, −11, −16 och så vidare. Skillnaden mellan två steg minskar med 1 varje gång (−2, −3, −4, −5).
- ts-e-andra-35: Stegen är +1, +3, +6, +10, +15 och så vidare. Skillnaden mellan två steg växer med 1 varje gång (+2, +3, +4, +5).
- ts-e-andra-36: Stegen är +1, −2, −4, −5, −5 och så vidare. Skillnaden mellan två steg växer med 1 varje gång (−3, −2, −1, 0).

Kör V6 efter bytet (regeltexten nämner regelns tal).

## Anmärkningar, inget hinder

11. **Samma regel flera gånger på en nivå**, med olika steg så att V8 inte fäller: grund andra ordningen växer med 5 i 48, 51, 52 och 53 (stegen skiljer bara ett, +2/+3/+4/+5 i början) och minskar med 3 i 46, 49 och 50; avancerad andra ordningen −6 i 07 och 08, +6 i 09 och 10; ts-a-affin-40 och 44 (minus 4, gånger 1,5); expert ts-e-andra-39 och 41 (skillnaden −3, −5, −7, −9 i båda, stegen skiljer ett) och ts-e-andra-38 mot ts-e-andra-29 (−3, +1, +5, +9). Samma bedömning som punkt 4 i omgång 2. Generatorn bör nästa gång kräva olika förändring i steget (andra ordningen) och olika skillnadsföljd (tredje ordningen) inom en nivå.
12. **ts-e-andra-37** har samma skillnad mellan stegen (+1, +3, +5, +7) som ts-a-andra-04 på avancerad. Raden går genom negativa tal och stegen byter tecken, så den får stå, men den är troligen lättare än de andra åtta. Om lösningsandelen ligger över 0,45 byter vi den.
13. **Additiva distraktorer i två räknesätt i tur på grund** (ts-g-geom-06: 80 och 84, "fel håll" och "samma steg som sist"). De stämmer med misstagstexten men lockar nog få i en serie som multipliceras. Statistiken får visa om de väljs.
14. **p_prior** för de nya typerna är gissningar enligt skribentens tabell. Läs av efter 200 svar per nivå, särskilt två räknesätt i tur på grund (0,73) och gånger 1,5 på avancerad (0,54 och 0,58).

## Godkända

Grund: ts-g-geom-06, 07, 08, 10, 12 och 14, ts-g-arit-42 till 49, ts-g-andra-46 till 53, ts-g-vaxel-50 till 53.
Avancerad: ts-a-varv-38 till 45, ts-a-affin-38 till 47, ts-a-geod-23 till 26, ts-a-andra-07 till 12, ts-a-vaxel-37 till 41.
Expert: ts-e-andra-37, 38, 41, 42 och 45, ts-e-varv-37 till 44, ts-e-affin-38 till 46, ts-e-summa-30 till 36.

(Anmärkningarna i punkt 11 till 14 gäller rader i listan ovan och kräver ingen ändring. ts-e-andra-39, 40 och 44 godkänns i sak; bara misstagstexten i punkt 10 ändras.)

Aktivering: nej, rätta ts-g-geom-09, 11, 13, 15, 16, 17, 18 och 19 (eget räknesättspar per rad, eller pensionera), ts-e-andra-43 (ny regel med krympande skillnad), misstagstexten i ts-e-andra-33, 39, 40 och 44, de tolv regeltexterna i punkt 4 och familjenamnet i namn.ts, sedan ja utan ny granskning om verifieraren ger 0 fel och 0 varningar och kvotjämförelsen inte hittar några par.
