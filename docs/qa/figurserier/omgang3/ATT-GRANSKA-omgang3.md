# Figurserier, omgång 3 att granska (granskning 03)

Datum 2026-10-12. Från Opus C till testansvarig. Underlag: `../granskning-02.md` och `../beslut-02.json`.

## Vad som är gjort

- Bara expert ändras. Kandidaterna i `src/lib/figurserierV1/kandidater/expert.json` byggs av `node scripts/figurserier-omgang3.mjs` ur omgång 2 (`kandidater/omgang2/`) och beslut-02, deterministiskt. Listan i `lista.json`.
- Bilder för de tio: `expert/` (fyra med nya alternativ, sex nya) plus `index.html`.
- Expertfilen har nu 34 kandidater: 24 godkända, 4 ombyggda, 6 nya. Du väljer de som går in; golvet 28 nås med 24 + 4 när de fyra håller, och de nya ger marginal.

| Id | Vad | Mall och variant |
|---|---|---|
| fs-e-vaxl-01, 03, 05, 07 | nya alternativ, raden och id står | F7 |
| fs-e-flera-05 | ny, ersätter flera-04 | F6 duo orbital + form |
| fs-e-flera-06 | ny | F6 duo kant + form |
| fs-e-antal-04, 06 | ny (04 ersätter antal-03) | F7 sektorhjul: start växelvis, antal i steg |
| fs-e-antal-05, 07 | ny | F7 strålar: start växelvis, antal i steg |

## Generatorn efter granskning 02, avsnitt 5

1. S14 med konstanter: på expert, i frågor med en konstant, har varje regeldimension en nära miss bland dem som håller konstanterna. Spärren fäller omgång 2:s vaxl-01, 03, 05, 07 och släpper vaxl-09. Högst två konstantbrott är generatorns krav i första hand; där raden inte ger fler rena distraktorer tillåts tre, som i vaxl-09. Det gäller fs-e-vaxl-05 (tre konstantbrott, men nära miss på både vinkel och längd bland de rena): med högst två finns ingen kombination av de 20 möjliga distraktorerna som klarar S5 och S6 (räknat uttömmande). På avancerad gäller kravet inte: F5 med en regel och S12:s nåbara mängd har för få rena distraktorer.
2. S15 grupp-antal: antal på strålar, sektorhjul och 3×3-kant bara i steg, aldrig cykel. Varianten sektor-steg-antalcykel i F4 utgår (de godkända står kvar).
3. Lägesraden: två frågor på samma nivå delar aldrig de fem lägena i samma ordning; `validate-figurserier` fäller omgång 2:s flera-04.
4. Rekommendationen i 5.5 (en nära miss per regel på F6 med tre regler) prövas först i varje F6-bygge och används när den går; flera-05 och flera-06 är byggda så.
5. Regeltexten för antal säger "En sektor till blir svart medurs" och "Ett streck till läggs till medurs" (ordet "kommer" står inte i figurseriernas texter, beställningen A7).

## Kedjan

`validate-figurserier` 100 utan fel (upplysning: F6 21 och F7 13 mot mallarnas 20 och 10, för att du ska kunna välja); `v7-facit-check --serie`, `v7-distraktor-check --serie` och `v7-geometri-check --serie` utan fel (störst 117 noder och 10,7 kB); vitest-fixturer för S14 med konstanter och S15.

## Beslut

Per id i `docs/qa/figurserier/granskning-03.md`. Efter ditt ja befordrar jag med `node scripts/befordra-figurserier.mjs --beslut=<fil>` (bara godkända id, felar under golvet) och sätter `BANK_BEFORDRAD`.
