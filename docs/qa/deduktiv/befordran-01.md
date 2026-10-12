# Befordran 01, deduktiv slutledning

Datum 2026-10-12. Opus F. Beslut: `beslut-01.json` (testansvarig). Körning: `node scripts/befordra-deduktiv.mjs --beslut=docs/qa/deduktiv/beslut-01.json`.

| Nivå | I banken | Golv |
|---|---|---|
| Grund | 25 (24 D1, dd-g-d2-05) | 20 |
| Avancerad | 30 D2 | 20 |
| Expert | 20 D3 | 20 |

## Villkoren V1 till V5

- **V1, prövningen.** `forklaring.mjs` skriver prövningen i två steg ("Kvar för Lisa: plats 3 eller 5." med de villkor som lämnar två platser, sedan "Med Lisa på plats 3 går villkor 1, 2 och 4 inte ihop. Alltså står Lisa på plats 5.") och fortsätter därefter med ett villkor i taget. Av flera möjliga prövningar väljs den som citerar minst villkor sammanlagt. Spärren `stegFel` räknar om varje steg med lösaren: ett lås ska följa ur stegets villkor plus redan låsta platser, kvar-steget ska lämna exakt två platser och prövningen ska ge motsägelse. Alla 13 uppgifter i V1-listan har nu en prövning i två steg. Kvar-steget får citera fler än tre villkor; i dd-e-d3-10 citerar det alla fem, eftersom inget mindre urval lämnar Eva två platser.
- **V2, måste-misstagen.** Den nära miss vars tilldelning flyttar färst element jämfört med schemat, mallen "I schemat stämmer det inte. För att få det sant måste minst ett villkor brytas, till exempel villkor k: ...". Inget "bara".
- **V3, oförändrade pussel.** Pusslet och lösningslagret är skilda åt i `gen-deduktiv.mjs`: befintliga pussel står kvar och bara lösningslagret byggs om. Diffen före och efter för de 75 godkända id: `intro`, `villkor`, `fraga`, `options`, `correctAnswer`, `etiketter`, `formell`, `niva`, `typ`, `p_prior` och `difficulty` är byte-identiska i alla 75. Ändrat: `losning` i 13 (prövningarna), `misstag` i 16 (måste-uppgifterna) och `family` i 5 (följer av de nya stegen).
- **V4, DD6.** Ny spärr i `sparrar.mjs`: i D3 får facit inte vara omöjligt ur antagandet plus högst ett villkor. Fixturen dd-e-d3-04 (parti 01) fälls. Spärren fäller exakt de fyra strukna D3 och ingen av de godkända.
- **V5, ersättare.** dd-g-d2-07 till 11 är dragna med egen seed: minst två steg, högst två villkor per steg, ett plats-villkor som låser först. De ligger i kandidatfilen, inte i banken, och väntar på granskning 02.

Kedjan efter befordran: `validate-deduktiv.mjs` grön på kandidater och banker, `vitest src/lib/deduktivV1` grön (16 tester).
