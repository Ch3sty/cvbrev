# Att granska, omgång 2 (Opus D)

Datum 2026-10-12. Branch `feat/passform-rester`. Allt nedan klarar de automatiska kontrollerna. Inget av det är importerat av appen förrän testansvarig har beslutat; befordran sker i en egen commit efter beslutet.

## 1. Parti 03, verbalt och numeriskt

| Del | Fil | Sida | Kontroll |
|---|---|---|---|
| Numeriskt grund, 16 underlag (ng-17 till ng-32, 10 tabeller, 3 stapel, 3 linje) | `src/lib/numericalTestV2/kandidater/parti-03-grund.json` | `numeriskt-parti-03.html` | `validate-numerisk-bank.mjs --niva=grund`: inga fel, inga varningar |
| Numeriskt avancerad, 8 underlag (na-17 till na-24, 5 tabeller, 2 stapel, 1 linje) | `src/lib/numericalTestV2/kandidater/parti-03.json` | `numeriskt-parti-03.html` | `--niva=avancerad`: inga fel, inga varningar |
| Verbalt expert, 8 argumentationsanalyser (verbexp-p13 till p20) | `src/lib/verbalTestExpert/kandidater/parti-03.json` | `verbalt-expert-parti-03.html` | `validate-verbal-bank.mjs --niva=expert` (nytt läge): inga fel, inga varningar |

Att titta extra på:

- Numeriskt, minsta tillåtna avstånd mellan alternativ: ng-23 q01 (138 och 140 kg), ng-27 q04 (60 och 62), ng-31 q02 (16,7 och 16,0 %), na-21 q01 (4,0 och 3,8 %), na-22 q01 (29,9 och 29,5 %), na-18 q04 (3 148 och 3 076 kr). ng-28 q02 (21,739 visas 21,7 %) ligger 0,11 från halvan.
- Numeriskt, typetiketter som är bedömningar: ng-21 q04 (8 kr i stället för 8 % som fel_operation), ng-31 q03 (platser i stället för inskrivna barn som fel_bas), na-17 q02 (medel av andelar som fel_operation). I na-20, na-22 och na-23 betyder fel_kolumn "fel år".
- Verbalt expert, lockande fel alternativ nära det rätta: p14 q4, p19 q3, p20 q2. Rätt bokstav a, b, c, d åtta gånger var; rätt alternativ är längst i 3 av 32.

Banker efter befordran: verbalt 36 / 40 / 20, numeriskt 36 / 36 / 12 (na-04 ingår, linjediagrammet skriver värdet vid varje punkt sedan c5ba464f).

## 2. Bank 3.1, de 15 strukna matrisfrågorna



Ersättarna ligger i `src/lib/logicTestV7/kandidater/bank-3-1.v7.json` (`fran_version: 4`, byggs med `node scripts/gen-bank-v3.mjs 3.1`, deterministiskt). Sidan: `bank-3-1/index.html`, en PNG per fråga, märkt med vad som ska granskas.

| Struken | Ersättare | Granska |
|---|---|---|
| v7a-v3-byte-12 till 17 (M2-pil-tre) | v7a-v3-byte-18 till 23 | alternativen, samma rutnät |
| v7a-v3-tva-05, 06 (M3-balans-sida) | v7a-v3-tva-07, 08 | alternativen, samma rutnät |
| v7e-v3-over-15 | v7e-v3-over-16 | alternativen (ny enskild ruta) |
| v7e-v3-over-02 | v7e-v3-over-17 | alternativen, samma rutnät (beslutsfilen sa ny seed, beställningen samma rutnät) |
| v7e-plus-over-18, 20 | v7e-plus-over-21, 22 | alternativen, samma rutnät |
| v7g-v3-vand-03, vand-13 | v7g-v3-vand-15, vand-16 | hela frågan, nytt rutnät |
| v7g-v3-antal-05 | v7g-v3-antal-06 | hela frågan; med konstant riktning finns bara åtta rutnät och alla delar rader, så riktningen ligger på diagonalen (som avancerads antal-02, 03). Granska nivån. |

Kedjan: validate-v7-questions, v7-parallel-check, v7-facit-check (också alla banker), v7-distraktor-check (`--krav=v3` och `--krav=plus`), v7-geometri-check, S1 till S13 och delade rader mot alla banker och kandidater: grönt. S11 per egenskap i de åtta avancerade: facit 3 mot 3 i varje regelstyrd egenskap; i en egenskap (vinkel respektive cirkelläge) fördelar sig de övriga 2+1, upplysning på avancerad. `GODKANDA_FORE_S11` var redan tom: S12 räknar antalet i latin-antal, så de fem lant klarar sig utan undantag. Efter beslutet: befordran till bankerna och `TRANINGSVERSION = 4` (klassiska test kvar på bank_version 3).
