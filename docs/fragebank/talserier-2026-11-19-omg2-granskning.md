# Granskning: talserier omgång 2, bankversion 3 (2026-11-19)

Testansvarig. Alla 100 rader med `fran_version: 3` lösta för hand: rad, facit, alternativ, regeltext och misstagstexter. `node scripts/talserier-verifiera.mjs --version 3` ger 100 uppgifter, 0 fel, 0 varningar, och hela banken 416 uppgifter, 0 fel, 0 varningar. Utöver generatorns spärr (fyra gemensamma tal) gjorde vi en egen sökning efter rader med samma stegföljd, alltså samma serie flyttad uppåt eller nedåt. Bankerna och skripten är orörda.

**Beslut: godkänt med villkor.** En rad byts ut och två regeltexter skrivs om före aktiveringen. Övriga 97 godkänns som de står. Varje facit är entydigt: vi hittade ingen rimlig alternativ regel som pekar på ett annat alternativ. Där två läsningar passar ger de samma svar, till exempel tre steg i tur mot "var tredje tal ökar med summan" (ts-g-vaxel-42, ts-g-vaxel-48) och två räknesätt i tur mot två varvade delserier (ts-a-affin-33, ts-e-affin-31, ts-e-affin-33). Inga tankstreck i texterna, minustecknet är −.

## Rättas före aktivering

| # | Id | Fynd | Åtgärd |
|---|---|---|---|
| 1 | ts-e-andra-32 | Samma stegföljd som ts-a-andra-02 på avancerad, alla sju steg: −3, −1, +3, +9, +17, +27, +39. Raden är avancerads rad minus 84 (42, 39, 38, 41 … mot −42, −45, −46, −43 …). Samma uppgift i förklädnad på två nivåer, samma fel som punkt 5 i omgång 1. | Nya parametrar i samma familj, till exempel krympande skillnad eller annat steg i skillnaden. |
| 2 | ts-a-andra-01 | Regeltexten "Stegen är +2, +2, +4, +8 och så vidare" läses som att steget dubblas. Raden visar själv +14 som femte steg, och facit bygger på +22 och +32. | Skriv ut alla fem visade steg: "Stegen är +2, +2, +4, +8, +14 och så vidare." |
| 3 | ts-a-andra-05 | Samma sak: "+1, +1, +2, +4 och så vidare" ser ut som dubblering, femte steget är +7. | "Stegen är +1, +1, +2, +4, +7 och så vidare." |

Bytet görs som i omgång 1 (`scripts/talserier-v2-granskning.mjs`): samma id och familj, nya parametrar, aldrig visad. Kör V7 och den egna sökningen på samma stegföljd igen efter bytet.

## Anmärkningar, inget hinder

4. **Samma regel två gånger på en nivå** ger rader som bara är flyttade: ts-a-geod-17/18 (+128 i start), ts-a-geod-20/21 (+12), ts-a-andra-03/06 (+56), ts-g-andra-40/41 (+5). TS8 tillåter det och det var känt i omgång 1. Men en elev som får båda i samma pass känner igen stegen direkt. Generatorn bör nästa gång kräva olika stegföljd även när regeln är samma.
5. **ts-a-geod-19 är ts-g-geom-04 plus 24** (280, 152, 88 … mot 256, 128, 64 …). Det följer av familjen (halvering plus konstant) och ligger på olika nivåer med olika svårighet. Får stå.
6. **Tredje ordningen på avancerad.** Alla sex nya andra-ordningen-rader på avancerad är i själva verket tredje ordningen med två luckor, det vill säga svårare än expertens gamla andra ordningen (konstant ändring i steget). Nivåskillnaden håller ändå, eftersom expert nu får negativa tal och krympande skillnad. p_prior 0,46 är rimligt lågt. Statistiken får avgöra. Om lösningsandelen blir under 0,35 flyttar vi typen till expert.
7. **Grunds fördelning.** Av 34 nya grundrader är 14 tre steg i tur, med svårighet 3 och sex visade tal. Det är rätt nivå för de svåraste grunduppgifterna, men växelvis har nu 48 av 138 i grundpoolen. Nästa omgång bör vikta mot geometrisk.
8. **Distraktorer på grund** ligger nu inom två steg från facit. Punkt 7 i omgång 1 är löst.

## De två öppna frågorna

**Taket 400 och "en tredjedel" och "en och en halv gånger" på grund: höj inte taket.** Under 400 ryms bara en rad av varje: 243, 81, 27, 9, 3 med facit 1, och 32, 48, 72, 108, 162 med facit 243. Med högre tak blir det fler rader, men då kommer tal som 486 och 729 och huvudräkning med ×1,5, och det mäter räknefärdighet, inte mönsterseende. Det hör inte hemma på grund. Om grund behöver en tredje geometrisk regel får 243 → 1 komma in under nuvarande tak. ×1,5 passar bättre på avancerad.

**Tredje ordningen på expert (till exempel ts-e-andra-36, −105 −104 −106 −110 −115 −120): ja, rimlig.** Fem visade steg ger fyra skillnader (−3, −2, −1, 0), så regeln syns och går att kontrollera. De två lika stegen −5, −5 lockar till "konstant −5", men −125/−130 finns inte bland alternativen, så den som läser fel tvingas tänka om och svaret −124/−126 blir entydigt. Raden är den svåraste i omgången, och p_prior 0,30 stämmer med det. Godkänd. Villkoret för typen på expert: minst fem visade steg och inget alternativ som stämmer med en enklare läsning av de sista stegen.

## Godkända utan anmärkning

Grund: ts-g-vaxel-36 till 49, ts-g-andra-35 till 45, ts-g-arit-35 till 41, ts-g-geom-04 och 05.
Avancerad: ts-a-vaxel-30 till 36, ts-a-varv-31 till 37, ts-a-geod-17 till 22, ts-a-affin-31 till 37, ts-a-andra-02 till 04 och 06.
Expert: ts-e-andra-28 till 31, 33 till 36, ts-e-varv-29 till 36, ts-e-affin-29 till 37, ts-e-summa-23 till 29.

(Anmärkningarna i punkt 4 till 6 gäller rader i listan ovan och kräver ingen ändring.)

Aktivering: nej, rätta ts-e-andra-32 (ny stegföljd) och regeltexterna i ts-a-andra-01 och ts-a-andra-05, sedan ja utan ny granskning om verifieraren ger 0 fel och 0 varningar.
