# Granskning: matrislogik, parti 06 (2026-11-19, omgång 3)

Testansvarig. Alla 93 kandidater i `src/lib/logicTestV7/kandidater/matris-parti-06.v7.json` är ritade med appens renderare (`render-matris-granskning.tsx --fil=...`, alltså `renderers.v7.tsx` via `cellSvg`) i Pixel 7-mått: kolumnen 328 px, rutan 102 px, figuren i 80 procent, bilden i dubbel upplösning. Det blev 93 PNG och 16 kontaktark med sex frågor per ark. Alla är sedda. Bilderna ligger i scratchpad, inte i git.

Varje fråga är löst oberoende av generatorn, regeltexten och `tolka.mjs`. Ett eget skript läser bara rutnät och alternativ och prövar varje egenskap (lång och kort visare, antal, form, fyllning, streckmängd) mot ett eget regelbibliotek: konstant, rad, kolumn, schackmönster, diagonal, motdiagonal, latinsk kvadrat, period i läsordning, jämna steg radvis och kolumnvis (modulo åtta för visarna) med och utan växlande riktning, summa, skillnad åt båda håll, absolut skillnad och produkt, summa och skillnad av vinklar, union, snitt, XOR och minus åt båda håll per rad och kolumn, och samma tillägg och borttagning i varje rad eller kolumn. Varje regel som passar de åtta synliga rutorna får förutsäga facit. Ett andra skript jämför regeltexten med rutnätet: grader, riktning, axel, växling, startförskjutning, riktningsnamn i mönstren, räknesätt, steg, form och fyllning. Det kontrollerar också att visarna aldrig pekar åt samma håll (K1) och att inget steg är ett halvt varv. Motprov: med facit flyttat ett steg föll alla 93 i lösaren och alla 73 klockor och grupper i textkontrollen. Streckfigurernas text är jämförd för hand med lösarens tillägg och mängdoperationer.

Dubbletter är sökta på två sätt. Först hela rutnätet med facit insatt efter global vridning, spegling och transponering, med visarna vridna eller speglade tillsammans och ombytta, formerna permuterade, fyllningen ombytt och streckfigurerna vridna och speglade. Sedan regeln, som i granskningen av parti 05: samma regel när bara startlägen, konstanter eller värdena i mönstret skiljer, medurs och moturs ombytta, ökar och minskar ombytta, och läsriktningen vänd. Klocka, grupp och streckfigur finns inte i någon matrisbank, så rutnät kan bara krocka inom partiet. Regler är jämförda också mot bankerna.

`node scripts/validate-v7-questions.mjs src/lib/logicTestV7/kandidater/matris-parti-06.v7.json` är grön: 93 frågor, struktur ok, inga dubbletter enligt validatorn, inga triviala frågor, rätt svar 16,5 till 16,8 procent per position efter blandning.

**Beslut: 50 godkänns, 43 stryks.** Facit är rätt och entydigt i alla 93, och ingen distraktor följer den angivna regeln. Regeltexten stämmer med bilden i alla 93. Ingen titel, regel eller misstagstext har "undefined", "null", "NaN", "[object" eller tankstreck. En misstagstext är fel (v7e-b7-grupp-08), och den frågan stryks hellre än att generatorn rättas i en ny runda. Övriga strykningar gäller nivå och dubbletter.

## Skribentens fyra frågor

**1. Sju och åtta tecken i gruppen på mobil.** Går att läsa. Sex är två kolumner, sju är samma med en prick i mitten (ett H), åtta är en ring och nio är fullt. De fyra har olika form, så man behöver inte räkna. Sett i 102 px på v7a-b7-grupp-12 (alternativen 6, 7 och 8 svarta trianglar och cirklar) och v7e-b7-grupp-08 (nio ofyllda cirklar, åtta ofyllda kvadrater, sju svarta kvadrater). Ofyllda trianglar i nio är det trängsta, men konturen håller. Inget att ändra.

**2. Klockan på grund.** Klockan i sig passar grund: den långa smala och den korta breda visaren går att skilja åt i 102 px, också när de står 45 grader isär. Men mallen avgör. `K-schack` (vridning och schackmönster) är grundens M2-pil-schack och får stå. `K-diagonal` (vridning och diagonal) är avancerads M2-pil-diagonal. Ingen grundbank har en enda diagonalregel. Alla sex stryks. Av de fem `K-schack` är fyra samma fråga (se tabellen), så grunden får två klockor.

**3. "Ökar med två" på avancerad.** Påståendet stämmer inte med filen. På avancerad har bara v7a-b7-grupp-09 (med fyllningen på diagonalen) och v7a-b7-grupp-14 (med formen i latinsk kvadrat) den regeln. De är olika mallar, M2-pil-diagonal respektive M2-2x2-latin på en ny primitiv, och får stå. Dubbletterna med två finns på expert: v7e-b7-grupp-05 och -09 är samma fråga spegelvänd (ökar och minskar ombytta, schackmönstret med ombytta värden), och likadant -06 och -10 (diagonalen). -09 och -10 stryks.

Det som är för likt på avancerad är något annat: **skillnad är summa läst baklänges.** "Den tredje är den första minus den andra" betyder att den första är summan av de två andra. Vänd läsriktningen (180 grader, så att diagonalen och schackmönstret står kvar) och en skillnadsfråga är en summafråga med luckan i första rutan. Varje skillnadsfråga i partiet har en summafråga med samma andra regler. Skillnaden stryks i alla sju par: v7g-b7-grupp-02, v7a-b7-grupp-02, -05, -08, -13, v7e-b7-grupp-03 och -04.

**4. Streckfigurens överlagring har bara fyra frågor.** Fyra räcker. Union, snitt och XOR finns redan på grund och avancerad i bankerna (v7g-v3-over, v7g-3c-over, v7a-3c-over, v7a-v3-over), så streckfiguren är en ny yta på en känd regel, inte en ny regel. Det nya är minus på avancerad (v7a-b7-streck-02). Alla fyra godkänns. Fler överlagringar på streckfiguren ger dubbletter av bankernas regler.

## Klockan på avancerad

Två av tre klockmallar på avancerad är grundnivå.

- **`K-tva-radvis`** (båda visarna vrider sig radvis, varje rad med fast startförskjutning) är grundens M3-balans: två former som flyttar sig radvis med fast förskjutning (v7g-v3-tva-01, p_prior 0,62). Avancerad lägger en tredje regel på den mallen (M3-balans-sida, M3-balans-fyll). Rad 3 ger båda visarna, vilket generatorn också flaggade (S4).
- **`K-rad-kolumn`** (en visare radvis med fast förskjutning, den andra kolumnvis med eget startläge) går att lösa ur kolumn 3 ensam. En radvis vridning med fast startförskjutning är också en kolumnvis vridning, med steget och förskjutningen i ombytta roller. Exempel v7a-b7-klocka-02: kolumn 3 är 7/3, 5/2, ?. Den långa går 90 grader moturs och den korta 45 grader moturs, så facit är 3/1. Det är M3-balans igen, transponerad. Granskningen av parti 05 underkände transponering som svårighet.

`K-latin` (vridning och latinsk kvadrat) är avancerads M2-2x2-latin och står kvar.

Expertklockorna godkänns. Växlingen per rad med en kolumnvis visare (E-K-vaxla-kolumn), två växlingar på var sin axel och växling med latinsk kvadrat har samma tyngd som bankens E-M4-orbital (växling och diagonal, p_prior 0,45). Texten i omg3.md, "ingen av dem syns i rad 3 ensam", stämmer inte. Visaren som växlar per rad går åt samma håll i rad 3 som i rad 1, och rad 3 ger den visaren. Så är det med all växling, också med M4 i bankerna, men den andra visaren kräver kolumnen.

## Stryks (43)

| Id | Skäl |
|---|---|
| v7g-b7-klocka-01, -03, -05, -07, -09, -11 | `K-diagonal`: vridning och diagonal är avancerads M2-pil-diagonal. Grunden har ingen diagonalregel. Dessutom är -05 och -09 samma regel (vridning med steget och förskjutningen 45 och 90 grader i ombytta roller, transponerad), och likaså -03 och -07 (90 och 135 grader). |
| v7g-b7-klocka-04, -06, -08 | Samma fråga som v7g-b7-klocka-02: en visare vrider sig 90 grader per steg med startförskjutning 135 grader (eller tvärtom efter transponering), den andra i schackmönster mellan två grannriktningar. -06 och -08 är -02 respektive -04 i hela rutnätet efter spegling och vridning. -04 är -02 transponerad med visarna ombytta. |
| v7g-b7-grupp-02 | Skillnaden är v7g-b7-grupp-01:s summa med läsriktningen vänd, se fråga 3. |
| v7g-b7-grupp-04 | Spegelbild av v7g-b7-grupp-03 (minskar med två i stället för ökar). Bara fyllningen, som är konstant, skiljer. |
| v7g-b7-grupp-06 | Spegelbild av v7g-b7-grupp-05 (minskar med tre i stället för ökar). Rutnätet är -05:s med antalet speglat (x blir 10 minus x). |
| v7g-b7-streck-04 | Ett streck bort per steg. Det är v7g-b7-streck-03 (ett streck till per steg) läst baklänges och transponerat. Bara strecken skiljer. |
| v7g-b7-streck-05 | Två streck till, sedan ett. Det är v7g-b7-streck-08 (ett bort, sedan två) läst baklänges. |
| v7g-b7-streck-07 | Två streck bort, sedan ett. Det är v7g-b7-streck-06 (ett till, sedan två) läst baklänges och transponerat. |
| v7g-b7-streck-09 | Två till, sedan två till. Det är v7g-b7-streck-10 (två bort, sedan två bort) läst baklänges. |
| v7a-b7-klocka-01, -04, -06, -09, -14, -16 | `K-tva-radvis` är grundens M3-balans, se ovan. -09 är dessutom samma rutnät som v7a-b7-klocka-03 efter transponering och spegling. |
| v7a-b7-klocka-02, -03, -05, -07, -08, -10, -11, -12, -13, -15 | `K-rad-kolumn` går att lösa ur kolumn 3 ensam och är M3-balans transponerad, se ovan. |
| v7a-b7-klocka-18 | Samma fråga som v7a-b7-klocka-17: en visare vrider sig 90 grader med startförskjutning 135 grader, den andra i latinsk kvadrat. Transponerad, med visarna ombytta. |
| v7a-b7-grupp-02 | Skillnad per kolumn med fyllningen i schackmönster, alltså v7a-b7-grupp-07 (summa per rad, fyllningen i schackmönster) vänd och transponerad. |
| v7a-b7-grupp-05 | Skillnad med formen i latinsk kvadrat, alltså v7a-b7-grupp-01 vänd. |
| v7a-b7-grupp-08 | Skillnad per kolumn med formen på diagonalen, alltså v7a-b7-grupp-12 vänd (180 grader) och transponerad. |
| v7a-b7-grupp-13 | Skillnad per kolumn med fyllningen på diagonalen, alltså v7a-b7-grupp-03 vänd (180 grader). |
| v7a-b7-streck-06 | Ett bort, sedan ett byte per kolumn. Det är v7a-b7-streck-05 (ett byte, sedan ett till per rad) läst baklänges och transponerat. |
| v7e-b7-grupp-03 | Skillnad, latinsk form, fyllningen på diagonalen. Det är v7e-b7-grupp-02 vänd. |
| v7e-b7-grupp-04 | Skillnad, latinsk form, fyllningen i schackmönster. Det är v7e-b7-grupp-01 vänd och transponerad. |
| v7e-b7-grupp-08 | Misstagstexterna för E och F säger "har ändrats åt samma håll som i mittraden. Raderna växlar riktning", men antalet växlar per kolumn ("minskar med ett för varje steg nedåt i den första och den tredje kolumnen"). Rätt är mittkolumnen och "Kolumnerna växlar riktning". Felet kommer från `misstag.mjs`, som saknar kolumnfallet för gruppens antal (klockans kolumnväxling i v7e-b7-klocka-12 har rätt text). Stryks hellre än att generatorn rättas och partiet byggs om. |
| v7e-b7-grupp-09 | Spegelbild av v7e-b7-grupp-05: minskar och ökar ombytta, schackmönstret med ombytta värden. |
| v7e-b7-grupp-10 | Spegelbild av v7e-b7-grupp-06 (180 grader): minskar och ökar ombytta, diagonalen med ombytta värden. |

## Godkända (50)

- **Grund (11):** v7g-b7-klocka-02, -10, v7g-b7-grupp-01, -03, -05, v7g-b7-streck-01, -02, -03, -06, -08, -10.
- **Avancerad (22):** v7a-b7-klocka-17, -19, -20, v7a-b7-grupp-01, -03, -04, -06, -07, -09, -10, -11, -12, -14, v7a-b7-streck-01, -02, -03, -04, -05, -07, -08, -09, -10.
- **Expert (17):** v7e-b7-klocka-01 till -12, v7e-b7-grupp-01, -02, -05, -06, -07.

De godkända är lösta och entydiga. Regeltexten stämmer med bilden, också riktningsnamnen i mönstren (v7g-b7-klocka-02: åt höger i hörnen, snett uppåt höger i övriga) och de tre riktningarna i de latinska kvadraterna. Ingen godkänd delar rutnät eller regel med någon annan i partiet. Regeln för v7a-b7-grupp-07 (summa per rad, fyllningen i schackmönster) är densamma som bankens antal-summa-radvis på räknestreck (v7a-v3-antal-04, v7a-b5-antal-01), men primitiven och egenskapen är andra och summan går till nio. Samma sak gäller v7g-b7-grupp-01 mot v7g-v3-antal-01. Granskningen av parti 05 räknade inte samma regel på en annan primitiv som en dubblett, och det gör inte jag heller.

## Anmärkningar, inget hinder

1. **v7e-b7-klocka-06.** Den korta visaren (2, 0, 6 / 6, 0, 2 / 0, 6, ?) följer också "den tredje är den andra minus den första" i vinkel (0 − 2 = 6, 0 − 6 = 2), och den regeln ger 6. B (1/6) har rätt lång visare och den korta på 6. Ingen rimlig människa räknar med vinklar så, och facit följer den angivna regeln entydigt. Men B är den enda distraktorn som följer en hel alternativ regel.
2. **Två regler på expertklockorna.** Bankens expert har mest tre regler. Klockorna har två, med E-M4-orbital som förebild. Följ p_prior 0,45 mot utfallet efter aktiveringen.
3. **Generatorns spärrar** bör räkna summa och skillnad som samma relation, bygga upp och plocka isär som samma tillägg baklänges, och jämföra regeln utan startlägen och utan vilka streck som läggs till. Strukturnyckeln missade dessutom de exakta rutnätsdubbletterna v7a-b7-klocka-03/-09 och v7g-b7-klocka-02/-04/-06/-08. Den bör pröva transponering tillsammans med ombytta visare, inte var för sig. En klockmall på avancerad behöver en tredje regel eller en visare som bara går att läsa på andra ledden.
4. **`misstag.mjs`:** gruppens antal med växling per kolumn skriver "mittraden". Rätta före nästa parti. I det här partiet träffar felet bara v7e-b7-grupp-08, som stryks.
5. **Streckfigurens prickade platser** syns tydligt i 102 px, och de tätaste figurerna (sex och sju streck, v7a-b7-streck-07 och -09) går att läsa. Diagonalerna går genom mittstreckens korsning, så ett streck som saknas syns som en prickad bit mellan två hela.

## Bakåtkompatibilitet

Renderarna och `svgMatt.tsx` från HEAD är utpackade (`git archive HEAD src/lib/logicTestV7`) till scratchpad och jämförda med arbetskopian. Varje unik cell i alla JSON-filer under `src/lib/logicTestV7` (banker och kandidatfiler utom parti 06) och `src/lib/figurserierV1` är ritad med `cellSvg` från båda: 76 filer och 1409 unika celler (lattice, tile, sectorwheel, tally, poly, stack, orbital, ray, ring, vector, balanceline, duo, dotsorbit och figurseriernas klocka). Alla 1409 är byte för byte lika, och HEAD:s `allaPrimitiver()` (93) likaså. Motprov: en streckfigur ger 1055 bytes i arbetskopian och en tom svg (89 bytes) i HEAD, så jämförelsen läste verkligen två olika renderare.

## Aktiveringen

Steg och villkor som i `matris-2026-11-19-omg3.md`. Flytta de 43 till `strukna` i `docs/qa/matris-parti-06/beslut.json`, kör om `node scripts/gen-matris-parti-06.mjs` och rätta antalet i `parti06.test.ts` till 50 (grund 11, avancerad 22, expert 17). `traningsversion.test.ts` ska räkna med 50 i stället för 93. Kör sedan befordran och kedjan.

Strukna, exakt:

```
v7g-b7-klocka-01
v7g-b7-klocka-03
v7g-b7-klocka-04
v7g-b7-klocka-05
v7g-b7-klocka-06
v7g-b7-klocka-07
v7g-b7-klocka-08
v7g-b7-klocka-09
v7g-b7-klocka-11
v7g-b7-grupp-02
v7g-b7-grupp-04
v7g-b7-grupp-06
v7g-b7-streck-04
v7g-b7-streck-05
v7g-b7-streck-07
v7g-b7-streck-09
v7a-b7-klocka-01
v7a-b7-klocka-02
v7a-b7-klocka-03
v7a-b7-klocka-04
v7a-b7-klocka-05
v7a-b7-klocka-06
v7a-b7-klocka-07
v7a-b7-klocka-08
v7a-b7-klocka-09
v7a-b7-klocka-10
v7a-b7-klocka-11
v7a-b7-klocka-12
v7a-b7-klocka-13
v7a-b7-klocka-14
v7a-b7-klocka-15
v7a-b7-klocka-16
v7a-b7-klocka-18
v7a-b7-grupp-02
v7a-b7-grupp-05
v7a-b7-grupp-08
v7a-b7-grupp-13
v7a-b7-streck-06
v7e-b7-grupp-03
v7e-b7-grupp-04
v7e-b7-grupp-08
v7e-b7-grupp-09
v7e-b7-grupp-10
```

Skillnaden försvinner som egen regeltyp i det här partiet. Det är rätt, eftersom den är summan med luckan på andra sidan.

Aktivering: ja efter strykningarna
