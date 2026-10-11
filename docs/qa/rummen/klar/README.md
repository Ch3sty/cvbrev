# Rummen, slutbranchen design/rummen-klar (2026-10-11)

Riktig Chrome (puppeteer-core) mot ett lokalt produktionsbygge (NEXT_DIST_DIR=.next-klar, next start -p 5241).

## Klassisk grundsession, Pixel 7 (klicktest/test-grund-*)
scripts/qa-rummen-3.mjs: meta.bank_version 2 och alternativ_blandade, 3c-frågor i urvalet, blandningen står kvar efter omladdning, 14 av 15 rättat, genomgången har samma bokstäver och familjens namn på varje rad. Resultatet visas i 1b:s vy ("Ditt resultat", lyft talkort). Mönstertypen kommer ur familjen (commit 7408b819, före den hamnade 3c-frågorna i "Övrigt"). Inga konsolfel och inga 4xx/5xx.

## Smakprovet, Pixel 7 (klicktest/smakprov-*)
bank_version 2, 3 av 5 rätt, answers lagras som originalindex. Inga konsolfel och inga 4xx/5xx.

## Dörrarna (dorrar/)
Pixel 7 och 360 px, ljust och mörkt, fyra rum: dörrnavet 72 px, en rad per etikett, ingen klippt, "Tester" på dörren. Rumsbytet ger rätt data-rum och theme-color.

## Vyer (vyer/), Pixel 7 och 1280, ljust och mörkt
Konton gratis (hemmet A), hela med ett CV och inga brev (hemmet B) och mycket (hemmet C, brevredigeringen, testsidan, resultatet). h1 i bild, ingen horisontell scroll, inga vita ytor eller låg kontrast i mörkt läge, högst en kopparknapp, inga konsolfel eller nätverksfel. edit-fot-* visar brevredigeringens fot (Spara och Avbryt efter brevet, inget lyftkort).

## Testdata
Konton qa-rummen-1b-{gratis,hela,mycket}-1791680271079 och qa-rummen-3-klar-a-1791679750 @jobbcoach-qa.test plus en anonym token. Allt raderat via id, räknat före delete.
