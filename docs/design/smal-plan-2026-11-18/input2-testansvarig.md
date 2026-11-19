# Testansvarig, omgång 2: fri träning, ärlig mätning (2026-11-18)

Beslutet accepterat. Nedan vad som måste gälla för att nivån ska vara sann när användaren väljer själv.

## Nivå och kurva när användaren bestämmer

- **Varje nivåkoll väger 0,5 mot nivån före** (som i dag, `OMMATNING_VIKT`). Ingen enskild körning skriver över kurvan, hur ofta den än görs.
- **Högst en nivåkoll per dag räknas.** Fler går att göra, märks "övning, räknas inte" och ritas inte. Annars går det att slå sig till ett tal.
- **Bara osedda frågor räknas.** Gäller redan passen (`upprepade`); måste gälla nivåkoll och övningsprov också. Passet säger "7 av 9 räknas mot nivån".
- **Dagstak 0,5 på summan** av dagens pass. Fem pass får inte flytta nivån 2,5. Kurvan har redan en passpunkt per dag, så formen håller.
- **Jämförbarhet:** percentilen bygger på de klassiska testerna och påverkas inte. Nivån mellan användare håller så länge bara osedda frågor nära nivån räknas.
- **Övningsprov fritt:** en ringad punkt med vikt 0,5, bara på osedda frågor. Saknas de för formatet säger vi det och erbjuder provet som repetition utan punkt.

## Bankbehovet

Flitig användare: fem pass om dagen i 30 dagar, allt osett.

| Testtyp | Per pass | Visningar/30 dagar | Bank i dag | Behov med 30 dagars karens |
|---|---|---|---|---|
| Matris | 9 | 1 350 (810 nära nivån) | 490 | cirka 2 000, spritt över nivå 1 till 7,5 |
| Figurserier | 4 | 600 | 154 | 600 |
| Deduktivt | 4 | 600 | 111 | 600 |
| Talserier, spatial, ordförråd | 6 | 900 var | 216, 288, 251 | 900 var |

Plus nivåkoll (12 osedda per gång) och övningsprov (20 för Alva). Ren 30-dagarskarens kräver tre till sex gånger dagens banker. Matris, talserier och spatial har generatorer; figurserier och deduktivt är handarbete.

## Karens räknat i visningar

En fråga får komma igen efter N andra visningar i samma testtyp, N = hälften av banken i användarens nivåfönster, lägst 150. Repetitionen räknas mot nivån bara om den tidigare var fel och det gått minst 14 dagar (då mäter den att regeln sitter). Rätt besvarade upprepningar räknas aldrig, men tränar. Så blir träningen obegränsad utan att nivån ljuger, och bankmålet kan bli matris 1 500, övriga dubbla dagens, matris och figurserier först.

## Vad som blir kvar av intensitet

Ett frivilligt dagsmål, ett till tre pass, som bara styr dagsringen och påminnelsen. Plan inför provet föreslår nivåkoll var sjunde dag och övningsprov två dagar före, märkt "föreslaget", och ingenting låser.

## Där jag står fast

Räknande nivåkoll högst en per dag på osedda frågor, upprepningar flyttar inte nivån, dagstak 0,5. Det är inte UX-begränsningar utan det som gör talet sant. Och banken byggs före fritt läge lanseras, annars ser den flitiga användaren samma figurer vecka två.
