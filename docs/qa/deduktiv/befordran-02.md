# Befordran 02, deduktiv slutledning

Datum 2026-10-12. Opus H1. Beslut: `beslut-02.json` (testansvarig, granskning i `granskning-02.md`). Körning: `node scripts/befordra-deduktiv.mjs --beslut=docs/qa/deduktiv/beslut-01.json --beslut=docs/qa/deduktiv/beslut-02.json`.

| Nivå | I banken | Golv |
|---|---|---|
| Grund | 30 (24 D1, 6 D2: dd-g-d2-05, 07 till 11) | 20 |
| Avancerad | 30 D2 | 20 |
| Expert | 20 D3 | 20 |

De 25 uppgifter som redan låg i grund är oförändrade (diffen i `bankGrund.json` är bara tillägg). Avancerad och expert är byte-identiska. `validate-deduktiv.mjs` grön.

## Kvar till omgång 4 (bygg inte nu)

Iakttagelserna i granskning-02 avsnitt 3. Ingen av dem stoppar befordringen, men de ska inte tappas:

- **Alternativ som medför andra alternativ.** 09 E medför D, 10 B och E medför C, 11 D medför C. Förslag till spärr DD3: inget alternativ får medföra ett annat alternativ utan hjälp av villkoren. Kör kontrollen över hela banken (även de godkända avancerade måste-uppgifterna) innan regeln införs.
- **Facit som inte behöver alla villkor.** I 11 följer facit ur villkor 1 och 3 utan villkor 2. Förslag för D2: minsta villkorsmängd för facit ska vara alla villkor vid tre villkor, minst alla utom ett vid fyra eller fler.
- **Steg med två villkor på grund.** 07 och 11 avslutar med ett steg som citerar två villkor. Föredra enkelsteg när en sådan väg finns, med ett kvar-steg som i V1.
