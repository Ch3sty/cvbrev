# Granskning: matrislogik, parti 05 (2026-11-19, omgång 2)

Testansvarig. Alla 90 kandidater i `src/lib/logicTestV7/kandidater/matris-parti-05.v7.json` är ritade med appens renderare (`render-matris-granskning.tsx --fil=...`, alltså `renderers.v7.tsx`) till 90 PNG och 18 kontaktark. Alla är sedda. Bilderna ligger i scratchpad, inte i git.

Varje fråga är löst oberoende av generatorn och av regeltexten. Ett eget skript läser bara rutnät och alternativ och prövar varje egenskap mot ett bibliotek av regler: konstant, diagonal, motdiagonal, schackmönster, latinsk kvadrat, aritmetisk följd radvis och kolumnvis (vinkel och läge modulo åtta), summa och skillnad, kedjor av speglingar och vridningar på plattor och sektorhjul, och överlagring (union, bara i en, gemensamt, minus) följd av vridning eller spegling. Varje regel som passar de åtta synliga rutorna får förutsäga facit, och alternativen prövas mot alla förutsägelser. Därefter är regeln jämförd med regeltexten, rad för rad och kolumn för kolumn.

Dubbletter är sökta mot alla tio banker och alla kandidatfiler. Jämförelsen gäller hela rutnätet med facit insatt. Egenskaper som är lika i alla nio rutor räknas bort, och frågan räknas som samma även efter global vridning, spegling och transponering (rader blir kolumner). Därtill har jag jämfört regeltexterna efter att ha tagit bort medurs/moturs och vilket värde som står på diagonalen.

`node scripts/validate-v7-questions.mjs src/lib/logicTestV7/kandidater/matris-parti-05.v7.json` är grön: 90 frågor, struktur ok, inga dubbletter enligt validatorn, rätt svar 16,5 till 16,8 procent per position efter blandning.

**Beslut: 57 godkänns, 33 stryks.** Inga textfel. Facit är rätt och entydigt i alla 90, och ingen distraktor följer den angivna regeln. Ingen titel, regel eller misstagstext har "undefined", "null", "NaN", "[object" eller tankstreck. Strykningarna gäller nivå och dubbletter.

## Den kolumnvisa vridningen först (v7e-b6-vrid-01 till -03)

Facit är rätt i alla tre. I vrid-01 går kolumnerna 0, 315, 270 / 90, 135, 180 / 180, 135, ?, alltså 45 grader moturs, medurs och moturs igen, och kolumnerna börjar 0, 90 och 180. Facit blir 90, kort på diagonalen, öppen spets. I vrid-02 är facit 45, fylld på diagonalen och lång, och i vrid-03 är det 90, kort och fylld.

Alla tre stryks ändå. En kolumnvis växling är en radvis växling som har transponerats, och diagonalen från övre vänstra hörnet påverkas inte av transponeringen. E-M4K-pil är alltså avancerads M4-pil (v7a-v3-vrid-31 till -38): samma steg på 45, 90 och 135 grader, samma startförskjutning per linje, en egenskap på diagonalen och en konstant. Den som löser matriser läser både rader och kolumner, så det enda nya är att man måste vrida på huvudet. Det motiverar inte p_prior 0,45. Det är samma fel som vrid-10 till -15 i förra omgången.

vrid-03 är dessutom lätt radvis. Med 90-graderssteg och jämn startförskjutning blir också varje rad en jämn vridning (180, 45, 270 / 90, 135, 180 / 0, 225, ?). Rad 3 räcker då: 135 grader moturs en gång till ger 90. Samma sak gäller vand-02, vand-03 och byte-02 (se tabellen).

Beskrivningens påstående att "ingen fråga i någon bank har rörelse nedåt i kolumnerna" stämmer för regeltexten. Men varje radvis fråga med jämn startförskjutning är också en kolumnvis fråga, med steget och förskjutningen i ombytta roller. Spärren mot samma regeltext ser inte det.

Övrig E-M4K håller nivån. Kolumnvis växling på orbitalen (vand-01, -05, -06) och kolumnvis växling med tre oberoende regler (byte-01, -03, -04) är transponerade expertmallar (E-M4-orbital och E-M4-pil-tre), inte avancerads.

## Stryks (33)

| Id | Skäl |
|---|---|
| v7e-b6-vrid-01, -02, -03 | Avancerads M4-pil transponerad, se ovan. vrid-03 går dessutom att lösa ur rad 3 ensam. |
| v7e-b6-vand-02 | 90-graderssteg med jämn startförskjutning (7, 2, 5, alltså 135 grader medurs, fast texten säger "eget startläge"). Varje rad är då en jämn vridning (7, 2, 5 / 1, 0, 7 / 3, 6, ?), och rad 3 ger facit 1 utan att man ser kolumnerna. |
| v7e-b6-vand-03 | Samma svaghet som vand-02, och dessutom vand-02:s spegelbild: 90 grader åt andra hållet och start 135 grader åt andra hållet, samma mittpunkt på diagonalen. |
| v7e-b6-vand-04 | Spegelbild av vand-01 (45 grader, start 90 grader, båda åt andra hållet) där fylld och ofylld har bytt plats på diagonalen. Samma fråga. |
| v7e-b6-byte-02 | 90-graderssteg med jämn startförskjutning: raderna vrider sig jämnt (135 medurs, 45 moturs, 135 medurs), och rad 3 (90, 225, ?) ger facit 0 direkt. Den kolumnvisa växlingen behövs inte. |
| v7e-b6-byte-08 | Spegelbild av byte-07: 90 grader medurs i stället för moturs, spetsen i schackmönster, korta på diagonalen. Eget startläge, så bara startlägena skiljer. |
| v7a-b6-antal-01 | Samma regel som v7a-v3-antal-02 (minskar, ökar, minskar, riktningen på diagonalen). Bara liggande och stående har bytt plats. Rutnätet är dessutom v7a-v3-antal-05 med antalet spegelvänt (x blir 5 minus x). |
| v7a-b6-byte-01 | Samma regel som v7e-b5-byte-02 på expert (90 grader moturs, eget startläge, längden i schackmönster, spetsen på diagonalen). Bara fylld och öppen på diagonalen har bytt plats. Spegelbild av v7a-b5-byte-07. |
| v7a-b6-byte-02 | Samma regel som v7e-b5-byte-03 (135 grader medurs, eget startläge, spetsen i schackmönster, längden på diagonalen). Bara kort och lång har bytt plats. |
| v7a-b6-byte-03 | Samma regel som v7a-b5-byte-06 och v7e-b5-byte-08 (45 grader moturs, eget startläge, längden i schackmönster). Bara spetsen på diagonalen har bytt värde. |
| v7a-b6-byte-04 | Samma regel som v7e-b5-byte-01 (90 grader medurs, eget startläge, spetsen i schackmönster). Bara kort och lång på diagonalen har bytt plats. |
| v7a-b6-byte-06 | Spegelbild av v7a-v3-byte-23 (135 grader, start 45, åt andra hållet), där lång och kort har bytt plats på diagonalen. |
| v7a-b6-rot-02 | Samma bild som v7g-b6-rot-03 på grund i samma parti. Rutnätet transponerat och vridet ger det andra. Radvis går den 135 grader, kolumnvis 45, så den är grundnivå. |
| v7a-b6-vand-02 | Spegelbild av v7a-v3-vand-23, med fylld och ofylld ombytta på diagonalen. |
| v7a-b6-vand-03, -04, -05, -06, v7a-b6-vrid-05, -06 | Varje rad börjar 180 grader från raden ovanför. Då är rad 3 samma vinkel som rad 1 (vand-03: 4, 6, 0 / 0, 2, 4 / 4, 6, ?), och facit är vinkeln i övre högra rutan med diagonalens fyllning eller spets. Varje kolumn är ett halvt varv fram och tillbaka, det generatorn annars utesluter. Ingen bank har den startförskjutningen. Det är för lätt för avancerad. vand-04 är dessutom vand-03:s spegelbild. |
| v7a-b6-vrid-01 | Spegelbild av v7a-v3-vrid-22 (45 grader, start 45) med öppen och fylld ombytta på diagonalen. Samma som v7a-v3-vrid-30 med ombytta värden. Bara konstanten skiljer i övrigt. |
| v7a-b6-vrid-04 | Transponerad spegelbild av v7a-v3-vrid-27 (steg 45 och start 90 i ombytta roller), med lång och kort ombytta på diagonalen. |
| v7g-b6-byte-01 | Spegelbild av v7g-v3-byte-08 (45 grader, start 45, längden i schackmönster). Bara den konstanta spetsen skiljer. |
| v7g-b6-byte-03 | Samma bild som v7a-b5-byte-03 på avancerad (transponerad och spegelvänd): radvis 135 grader med start 45 är kolumnvis 45 grader med start 135. Mittpunkten i schackmönster i båda. |
| v7g-b6-byte-04 | Transponerad spegelbild av v7g-b5-byte-06 (steg 90, start 135). Bara den konstanta längden och spetsen skiljer. |
| v7g-b6-byte-09 | Spegelbild av v7g-v3-byte-10 (135 grader, start 45). Bara den konstanta spetsen skiljer. |
| v7g-b6-byte-11 | Transponerad spegelbild av v7g-v3-byte-12 (steg 45 och start 90 i ombytta roller). |
| v7g-b6-byte-12 | Spegelbild av v7g-v3-byte-11 (135 grader, start 90). |
| v7g-b6-rot-01 | Samma rutnät (två intilliggande svarta sektorer) som v7a-v3-rot-08 och v7g-v3-rot-06, vridet, spegelvänt och transponerat. |
| v7g-b6-lform-01 | Samma latinska kvadrat som v7g-3c-lform-07: tre lägen med samma inbördes avstånd i samma ordning. Bara den konstanta mittpunkten (ofylld i stället för fylld) skiljer. |
| v7g-b6-lform-03 | Samma latinska kvadrat som v7g-v3-lform-06 och v7a-v3-lform-03, vriden eller spegelvänd. Bara den konstanta mittpunkten skiljer från lform-03. |

## Godkända (57)

- **Grund (17):** v7g-b6-rot-02 till -07, v7g-b6-byte-02, -05, -06, -07, -08, -10, -13, v7g-b6-vrid-01, -02, -03, v7g-b6-lform-02.
- **Avancerad (14):** v7a-b6-vrid-02, -03, -07, v7a-b6-vand-01, v7a-b6-rot-01, -03, v7a-b6-byte-05, -07, -08, v7a-b6-speg-01, -02, -03, v7a-b6-lform-01, -02.
- **Expert (26):** v7e-b6-vand-01, -05, -06, v7e-b6-byte-01, -03, -04, -05, -06, -07, -09, v7e-b6-lfler-01 till -08, v7e-b6-over-01 till -08.

De godkända är lösta och entydiga. Regeltexten stämmer med bilden i alla, också läget i orbitalens latinska kvadrater (g-lform-02: uppe till höger, till höger, nere till vänster) och spegelaxlarna i speg-01 till -03. Latin-form har facit lika en synlig ruta, vilket hör till mallen. Det spelar ingen roll, eftersom varje rad och kolumn ändå måste ha alla tre. Ingen godkänd delar rutnät (med vridning, spegling och transponering) eller regel (med medurs och moturs och diagonalens värden ombytta) med någon fråga i bankerna, kandidatfilerna eller partiet.

## Anmärkningar, inget hinder

1. **v7e-b6-over-03** (streck, "bara i en av", 90 grader moturs): båda raderna stämmer också med "bara i en av, speglat upp och ner". Den regeln ger 0, 45, 135 och 270 grader, som inte finns bland alternativen, så facit är entydigt. Men den som hittar speglingen först får leta vidare.
2. **v7e-b6-over-06** (streck, den översta minus den mittersta, 90 grader moturs): alternativ C (streck mot 45 och 270 grader) följer av samma minus följt av en spegling i en axel som går mellan två strålriktningar (22,5 grader från lodrätt). Ingen rimlig regel, och C är samtidigt "inte vridet", men det är den enda distraktorn som följer en hel kedja av symmetrier.
3. **v7e-b6-lfler-04 och -08** har en enda nära miss (de andra bryter två eller tre regler). Kontrollen godkänner det, men expertfrågor brukar ha två.
4. **Jämn startförskjutning lika stor som steget** (v7a-b6-rot-01, v7a-b6-byte-05, v7g-b6-byte-05, -10, -13, v7g-b6-rot-02) ger samma figur längs varje motdiagonal. Facit står ensamt på sin motdiagonal, så det är inte en kopia, och bankerna har samma mönster (v7a-b5-rot-01, v7g-v3-byte-08). På avancerad är det lätt.
5. **Receptnamnen.** E-M4K-orbital och E-M4K-pil-tre är transponerade E-M4-orbital och E-M4-pil-tre. Exponeringsregeln (högst två per recept) räknar dem som olika mallar, så ett pass kan få fyra frågor ur samma mall. Samma anmärkning som punkt 10 i granskningen av parti 04.
6. **Generatorns spärrar** bör jämföra rutnätet efter transponering och spegling och med ombytta värden på diagonalen eller i schackmönstret, och utesluta startförskjutningen 180 grader. Med de spärrarna hade alla strukna utom vrid-01 och vrid-02 fallit redan i generatorn. För E-M4K med 90-graderssteg måste startläget vara eget, annars blir raderna jämna vridningar.

## Aktiveringen

Steg och villkor som i `matris-2026-11-19-omg2.md`. Flytta de 33 till `strukna` i `docs/qa/matris-parti-05/beslut.json`, kör om `node scripts/gen-matris-parti-05.mjs` och rätta antalet i `parti05.test.ts` till 57 (grund 17, avancerad 14, expert 26). Kör sedan befordran och kedjan. `traningsversion.test.ts` ska räkna med de 57 i stället för 90.

Strukna, exakt:

```
v7e-b6-vrid-01
v7e-b6-vrid-02
v7e-b6-vrid-03
v7e-b6-vand-02
v7e-b6-vand-03
v7e-b6-vand-04
v7e-b6-byte-02
v7e-b6-byte-08
v7a-b6-antal-01
v7a-b6-byte-01
v7a-b6-byte-02
v7a-b6-byte-03
v7a-b6-byte-04
v7a-b6-byte-06
v7a-b6-rot-02
v7a-b6-vand-02
v7a-b6-vand-03
v7a-b6-vand-04
v7a-b6-vand-05
v7a-b6-vand-06
v7a-b6-vrid-01
v7a-b6-vrid-04
v7a-b6-vrid-05
v7a-b6-vrid-06
v7g-b6-byte-01
v7g-b6-byte-03
v7g-b6-byte-04
v7g-b6-byte-09
v7g-b6-byte-11
v7g-b6-byte-12
v7g-b6-rot-01
v7g-b6-lform-01
v7g-b6-lform-03
```

Expertens vridning är tom i det här partiet, och det är bättre än vridning på avancerad nivå.

Aktivering: ja efter strykningarna
