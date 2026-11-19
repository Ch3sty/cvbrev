# Granskning: talserier, bankversion 2 (2026-11-19)

Testansvarig. Alla 100 nya rader lästa med regeltext, bågar, alternativ och misstagstexter. Verifieraren och validatorn körda på nytt (316 uppgifter, 0 fel, 0 varningar, TS1 till TS10 klara). Dessutom en egen sökning efter rader som är samma serie förskjuten ett steg, vilket generatorn inte prövar. Bankerna är orörda.

**Beslut: godkänt med villkor.** Fyra nya rader byts ut (punkt 1 till 4) och två gamla pensioneras i samma aktivering (punkt 5). Övriga 96 nya godkänns som de står: varje serie har en regel en människa hittar inom provets tid på sin nivå, inga distraktorer bär en annan rimlig regel (där två regler passar, som ×2 + c och dubblat steg, ger de samma svar), och regeltexterna är begriplig svenska.

## Byts ut före aktivering

| # | Id | Problem | Rättelse |
|---|---|---|---|
| 1 | ts-a-affin-24 | Samma serie som ts-a-affin-07 (och ts-e-affin-11) förskjuten ett steg: 3, 4, 6, 10, 18, 34 mot 4, 6, 10, 18, 34, 66. Facit 66 står synligt i den gamla raden. Sju gemensamma tal. | Nytt starttal eller annan c i ×2 + c. |
| 2 | ts-a-affin-29 | Samma serie som ts-a-affin-21 (och ts-e-affin-08) förskjuten: 8, 9, 11, 15, 23, 39 mot 9, 11, 15, 23, 39, 71. Sju gemensamma tal. | Byt ut. |
| 3 | ts-g-vaxel-32 | Är ts-g-vaxel-23 utan första talet: 22, 34, 27, 39, 32 mot 29, 22, 34, 27, 39, 32. Sex gemensamma tal, facit 44 följer direkt. | Byt starttal. |
| 4 | ts-e-affin-21 | Fortsätter ts-e-affin-18 två steg: 11, 23, 47, 95, 191, 383 mot 2, 5, 11, 23, 47, 95. Sex gemensamma tal. | Byt starttal. |

Gränsfall som får stå men bör få nytt starttal om det är billigt: ts-g-andra-24 delar fyra tal med ts-g-andra-15, ts-g-vaxel-26 fyra med ts-g-vaxel-15.

## Fel i version 1 som rättas i samma aktivering

5. **Identiska rader på två nivåer:** ts-a-affin-07 = ts-e-affin-11 (4, 6, 10, 18, 34, 66) och ts-a-affin-21 = ts-e-affin-08 (9, 11, 15, 23, 39, 71). Samma uppgift kan alltså stå i både avancerad och expert, vilket gör nivåskillnaden falsk. Sätt `pensionerad_fran: 2` på ts-e-affin-11 och ts-e-affin-08. Version 1-poolen behålls, så `version2.test.ts` håller.
6. Förskjutna par i version 1 (a-affin-02/e-affin-16, a-affin-03/a-affin-08, a-geod-04/a-affin-06, a-affin-11/e-affin-14, a-affin-13/a-affin-16, e-affin-01/e-affin-06, g-andra-07/09, g-vaxel-08/09) tas i nästa omgång. Generatorn bör pröva förskjutning med minst fyra gemensamma tal, inte bara identisk rad.

## Anmärkningar, inget hinder

7. **Svaga distraktorer på grund.** Nästan varje växelvis rad har ett alternativ långt utanför allt rimligt (83 efter 54, 1 efter 26, 6 efter 32), typen "kvadratisk tolkning". Det blir fyra alternativ i praktiken. Låt generatorn hålla distraktorer inom två steg från facit.
8. **Negativt svar på avancerad.** Geometrisk differens 09, 11 och 14 slutar på −39, −23 och −43 fast alla visade tal är positiva. Rätt och entydigt, men en överraskning i 60 sekunder; p_prior 0,56 är i överkant. Låt statistiken avgöra.
9. **Expertens affina med ×(−2) och ×(−3)** ligger över det riktiga I-provets svårighet. Bra som expert, men säljtexten får fortsätta säga "samma format", inte "samma svårighet".
10. **Regeltext.** "Steget blir 2 gånger större för varje tal (−4, −8, −16 ...)" läses lätt som att talen växer. Skriv "Steget dubblas för varje tal". "Det förra gånger minus 2, minus 8" är klumpigt; skriv "Multiplicera det förra med −2 och dra bort 8."
11. ts-e-summa-19 visar −15 två gånger och ts-e-summa-21 börjar 25, 4, 25, 25. Korrekt, men ovant. Får stå på expert.
12. Fördelningen: grund utan nya geometriska är motiverat (TS8 och taket 400), men grund har då 3 geometriska mot 30 i de andra familjerna. Nästa omgång bör lyfta taket för just den familjen eller tillåta "hälften" med handskrivna distraktorer.

## Säkert att höja TALSERIE_VERSION till 2

Ja, efter punkt 1 till 5. `talserie_version` har skrivits i meta sedan första incheckningen (93f6b22d), så inga sessioner saknar fältet och faller tillbaka på konstanten. Nivåtesten räknar urvalet ur `poolFor(niva, talserieVersion(meta))`; pass och I-provet sparar id i `meta.fragor`. Inget test låser konstanten till 1. Pass och I-prov får de nya raderna direkt, nivåtesten från nästa start.
