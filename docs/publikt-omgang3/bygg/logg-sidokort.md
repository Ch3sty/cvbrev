# Sidokortets knapp syns alltid (2026-11-22)

Gren `design/publikt-omgang3`, arbetskopian `cvbrev-publikt3`. Ingen push.

## Orsaken

Sidospalten i artiklarna (`.ib-sido` i `ArtikelRam.tsx`) var ett rutnät med förteckningen och säljkortet efter varandra, `position: sticky` med `max-height: calc(100vh - 100px)` och `overflow-y: auto`. När förteckningen och kortet tillsammans var högre än fönstret rullade hela spalten, och kortet hamnade sist. På `/artiklar/soka-jobb-via-mail` (åtta rubriker) var innehållet 908 px mot 800 px i ett 900 px högt fönster, så knappen "Skapa konto gratis" syntes aldrig utan att besökaren rullade själva spalten. Kortet är artiklarnas säljyta.

## Lösningen

1. **Kortet tar sin höjd, förteckningen tar resten.** Spalten är en flexkolumn: förteckningen `flex: 0 1 auto; min-height: 0`, kortet `flex: none`. Det är samma sak som raderna `minmax(0, 1fr) auto` i beslutet, men en flexkolumn klarar också spalten utan kort (karriärartiklar utan paket) och spalten utan rubriker, utan tomma rader och mellanrum. Rubriken "Innehåll" står stilla och listan `.ib-toc` rullar i sig själv (tunn rullist, `overscroll-behavior: contain`). Ryms allt är spalten exakt så hög som innehållet, som förut.
2. **Den aktiva länken hålls synlig.** `ArtikelKlient` sätter listans egen `scrollTop` (via `scrollTo` på listan, mjukt, eller direkt med `prefers-reduced-motion: reduce`) när länken byts, aldrig `scrollIntoView`. En `ResizeObserver` på listan håller den aktiva länken synlig även när listan blir lägre (fönstret ändras, cookieraden försvinner).
3. **Kortet blir kortare i steg**, med `@media (max-height: ...)` och bara inne i `.ib-sido`. Krokarna är `data-sido-steg` i `SidoPaketKort`; ingen text, ordning eller länk i HTML:en är ändrad.
   - Gratiskortet: steg 1 döljer glyfrutan ("Åtta testtyper och personlighetstestet"), steg 2 bocklistan. Kvar: överraden, rubriken och knappen.
   - Premiumkortet (test, CV, Allt) har ingen glyfruta eller bocklista. Där döljer steg 1 gratisraden under knappen, steg 2 beskrivningen och steg 3 priset, så att det kortaste premiumkortet blir överraden, rubriken och knappen, precis som gratiskortet. Knappen "Se vad som ingår" leder till `/priser`. Utan steg 3 hamnade premiumkortet i reservläget redan vid 560 px fönsterhöjd (mätning 2), och då syntes inte knappen.
4. **Reservläget.** Ryms inte ens det kortaste kortet (188 px) bredvid 170 px förteckning rullar spalten som förut och listan står i full höjd.
5. **Cookieraden.** Regeln som håller spalten ovanför raden står kvar. Varje brytpunkt finns i två varianter: utan raden och 56 px högre medan raden visas.
6. **Kortets klack.** Spalten har `padding-bottom: 8px` och `max-height` 8 px större, så att kortets `box-shadow: 0 6px 0` inte klipps av spaltens `overflow` (den klipptes förut också, men syntes sällan eftersom kortet sällan syntes). Innehållet slutar på samma ställe som förut.
7. Under 1024 px är ingenting ändrat: spalten är `display: none` där, och alla nya regler ligger i `min-width: 1024px`.

Rubriklinjen i den rullande listan ritas med `box-shadow: inset 2px 0 0` i stället för `border-left`, och länkarnas `margin-left: -2px` är noll inne i spalten. Annars klipper listans overflow den aktiva länkens kopparkant.

## Brytpunkterna och varför

Spalten behöver 84 px topp, 16 px luft nedtill, minst 170 px förteckning (rubriken och tre till fyra rader) och 28 px mellanrum: 298 px plus kortet. Kortens höjder är uppmätta i Chrome vid 1440 och 1024 px bredd (samma på båda), premiumkorten med kampanjpriset (Black Week och Cyber Monday ger 13 till 14 px mer, priset står i två rader).

| Kort | Helt | Steg 1 | Steg 2 | Steg 3 |
|---|---|---|---|---|
| Gratis | 497 | 417 (utan glyfrutan) | 188 (utan bockarna) | - |
| Test | 400, 413 med kampanjpris | 308, 322 | 258, 271 | 188 (utan priset) |
| CV och brev | 359, 372 | 308, 322 | 258, 271 | 188 |
| Allt (intervju, karriär om lön) | 308, 322 (ingen gratisrad) | 308, 322 | 258, 271 | 188 |

| Steg | Gäller | Utan cookierad | Med cookierad | Uträkning |
|---|---|---|---|---|
| 1 | Gratis | max-height 794 | 850 | 298 + 497 = 795 |
| 2 | Gratis | 714 | 770 | 298 + 417 = 715 |
| 1 | Premium | 710 | 766 | 298 + 413 = 711 |
| 2 | Premium | 618 | 674 | 298 + 322 = 620 (vid 619 får förteckningen 169 px) |
| 3 | Premium | 568 | 624 | 298 + 271 = 569 |
| Reserv | Alla | 485 | 541 | 298 + 188 = 486 |

Överslagen i beslutet (steg 1 vid cirka 860, steg 2 vid cirka 775) räknade med mer luft. De uppmätta talen ger förteckningen minst 170 px och knappen hel i alla fönster från 486 px (542 med cookieraden). Premiumkortet får egna, lägre brytpunkter, eftersom det ryms helt längre ned än gratiskortet; det döljer inget i onödan.

## Mätningen

Produktionsbygge (`next build --webpack`), `next start`, en Chrome via puppeteer-core, en flik. Alla anrop utanför den lokala servern spärrades (ingen analys, inga tredjepartsanrop). Cookieraden mättes som ny besökare (kakorna rensade) och efter klick på Acceptera. Kampanjpriset sattes med `data-kampanj` på `<html>`, som kampanjskriptet gör.

Artiklar: `soka-jobb-via-mail` och `mjuka-harda-kompetenser` (gratis, lång förteckning), `ai-jobbmatchning` (gratis, kort förteckning), `logiktest-exempel-med-losningar` (test), `bra-cv-guide` och `cv-exempel-yrken` (CV), `hur-langt-ska-personligt-brev-vara` (brev, CV-kortet), `arbetsintervju-guide` (Allt), `karriarbyte-olika-aldrar` (inget kort). Bredd 1440 och 1024, fönsterhöjd 1100, 900, 800, 720, 650, 560 och dessutom 520 och 480 för att se reservläget.

Per fall: knappens `getBoundingClientRect` helt inom fönstret, ovanför cookieraden och inom spalten; `elementFromPoint` i knappens mitt är knappen; förteckningens synliga höjd minst cirka 170 px utanför reservläget; ingen rullning i sidled; kortets klack inom spalten. Vid 900, 720 och 560 px rullades artikeln också till mitten och slutet: den aktiva länken ska synas inne i listan, och spalten ska släppa vid ramens slut utan att gå in i avsnittet efter.

### Sammandrag per fönsterhöjd

Alla nio artiklar, båda bredderna och kampanjpriset sammanräknade (21 fall per höjd och cookieläge, 19 med kort). Minsta förteckning är den minsta synliga höjden med rubriken, eller hela förteckningen när den är kortare.

| Höjd | Cookierad | Fall med kort | Knappen synlig | Minsta förteckning px (utom reserv) | Reservläge | Kortets höjd (gratis / premium) |
|---|---|---|---|---|---|---|
| 1100 | på | 19 | 19 av 19 | 250 | nej | 497 / 308, 322, 359, 372, 400, 413 |
| 1100 | av | 19 | 19 av 19 | 250 | nej | 497 / 308, 322, 359, 372, 400, 413 |
| 900 | på | 19 | 19 av 19 | 219 | nej | 497 / 308, 322, 359, 372, 400, 413 |
| 900 | av | 19 | 19 av 19 | 250 | nej | 497 / 308, 322, 359, 372, 400, 413 |
| 800 | på | 19 | 19 av 19 | 199 | nej | 417 / 308, 322, 359, 372, 400, 413 |
| 800 | av | 19 | 19 av 19 | 175 | nej | 497 / 308, 322, 359, 372, 400, 413 |
| 720 | på | 19 | 19 av 19 | 214 | nej | 188 / 308, 322 |
| 720 | av | 19 | 19 av 19 | 175 | nej | 417 / 308, 322, 359, 372, 400, 413 |
| 650 | på | 19 | 19 av 19 | 195 | nej | 188 / 258, 271 |
| 650 | av | 19 | 19 av 19 | 200 | nej | 188 / 308, 322 |
| 560 | på | 19 | 19 av 19 | 188 | nej | 188 / 188 |
| 560 | av | 19 | 19 av 19 | 244 | nej | 188 / 188 |
| 520 | på | 19 | 0 av 19 | - | ja, 21 av 21 | 188 / 188 |
| 520 | av | 19 | 19 av 19 | 204 | nej | 188 / 188 |
| 480 | på | 19 | 0 av 19 | - | ja, 21 av 21 | 188 / 188 |
| 480 | av | 19 | 0 av 19 | - | ja, 21 av 21 | 188 / 188 |

Knappen syns hel i alla 228 fall med kort från 560 till 1100 px, med och utan cookieraden. Reservläget börjar under 542 px med cookieraden och under 486 px utan, och där syns knappen inte förrän besökaren rullar spalten, som förut. Ingen rullning i sidled i något fall. Kortets klack klipps inte i något fall utanför reservläget.

Aktiv länk synlig inne i listan när artikeln rullats till mitten och slutet: 126 av 126 fall (900, 720 och 560 px). Spalten släpper vid ramens slut utan överlapp med avsnittet efter: 126 av 126.

Under 1024 px: spalten är dold (`display: none`) vid 412 x 915, 820 x 1180 och 1023 x 800, dragspelet `.ib-toc-m` visas, ingen rullning i sidled.

Förhandsvisningen `/forhandsvisning-publikt/innehall` (med `PUBLIKT_FORHANDSVISNING=1`): 200, spalten utan kort, förteckningen hel (161 px), spalten 169 px med de 8 px för klacken, ingen rullning.

### Alla fall, 1440 px

| Artikel | Kort | Höjd | Cookierad | Kortet px | Dolda steg | Knappen synlig | Förteckningen | Spalten rullar |
|---|---|---|---|---|---|---|---|---|
| soka-jobb-via-mail | gratis | 1100 | på | 497 | inga | ja | 384 / 356 | nej |
| soka-jobb-via-mail | gratis | 900 | på | 497 | inga | ja | 219 / 352 | nej |
| soka-jobb-via-mail | gratis | 800 | på | 417 | 1 | ja | 199 / 352 | nej |
| soka-jobb-via-mail | gratis | 720 | på | 188 | 1+2 | ja | 348 / 352 | nej |
| soka-jobb-via-mail | gratis | 650 | på | 188 | 1+2 | ja | 278 / 352 | nej |
| soka-jobb-via-mail | gratis | 560 | på | 188 | 1+2 | ja | 188 / 352 | nej |
| soka-jobb-via-mail | gratis | 520 | på | 188 | 1+2 | nej | 372 / 356 | ja (reserv) |
| soka-jobb-via-mail | gratis | 480 | på | 188 | 1+2 | nej | 332 / 356 | ja (reserv) |
| soka-jobb-via-mail | gratis | 1100 | av | 497 | inga | ja | 384 / 356 | nej |
| soka-jobb-via-mail | gratis | 900 | av | 497 | inga | ja | 275 / 352 | nej |
| soka-jobb-via-mail | gratis | 800 | av | 497 | inga | ja | 175 / 352 | nej |
| soka-jobb-via-mail | gratis | 720 | av | 417 | 1 | ja | 175 / 352 | nej |
| soka-jobb-via-mail | gratis | 650 | av | 188 | 1+2 | ja | 334 / 352 | nej |
| soka-jobb-via-mail | gratis | 560 | av | 188 | 1+2 | ja | 244 / 352 | nej |
| soka-jobb-via-mail | gratis | 520 | av | 188 | 1+2 | ja | 204 / 352 | nej |
| soka-jobb-via-mail | gratis | 480 | av | 188 | 1+2 | nej | 384 / 356 | ja (reserv) |
| ai-jobbmatchning | gratis | 1100 | på | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 900 | på | 497 | inga | ja | 219 / 220 | nej |
| ai-jobbmatchning | gratis | 800 | på | 417 | 1 | ja | 199 / 220 | nej |
| ai-jobbmatchning | gratis | 720 | på | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 650 | på | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 560 | på | 188 | 1+2 | ja | 188 / 220 | nej |
| ai-jobbmatchning | gratis | 520 | på | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| ai-jobbmatchning | gratis | 480 | på | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| ai-jobbmatchning | gratis | 1100 | av | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 900 | av | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 800 | av | 497 | inga | ja | 175 / 220 | nej |
| ai-jobbmatchning | gratis | 720 | av | 417 | 1 | ja | 175 / 220 | nej |
| ai-jobbmatchning | gratis | 650 | av | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 560 | av | 188 | 1+2 | ja | 244 / 220 | nej |
| ai-jobbmatchning | gratis | 520 | av | 188 | 1+2 | ja | 204 / 220 | nej |
| ai-jobbmatchning | gratis | 480 | av | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 1100 | på | 400 | inga | ja | 516 / 572 | nej |
| logiktest-exempel-med-losningar | test | 900 | på | 400 | inga | ja | 316 / 572 | nej |
| logiktest-exempel-med-losningar | test | 800 | på | 400 | inga | ja | 216 / 572 | nej |
| logiktest-exempel-med-losningar | test | 720 | på | 308 | 1 | ja | 228 / 572 | nej |
| logiktest-exempel-med-losningar | test | 650 | på | 258 | 1+2 | ja | 208 / 572 | nej |
| logiktest-exempel-med-losningar | test | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| logiktest-exempel-med-losningar | test | 520 | på | 188 | 1+2+3 | nej | 372 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 480 | på | 188 | 1+2+3 | nej | 332 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 1100 | av | 400 | inga | ja | 572 / 572 | nej |
| logiktest-exempel-med-losningar | test | 900 | av | 400 | inga | ja | 372 / 572 | nej |
| logiktest-exempel-med-losningar | test | 800 | av | 400 | inga | ja | 272 / 572 | nej |
| logiktest-exempel-med-losningar | test | 720 | av | 400 | inga | ja | 192 / 572 | nej |
| logiktest-exempel-med-losningar | test | 650 | av | 308 | 1 | ja | 214 / 572 | nej |
| logiktest-exempel-med-losningar | test | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| logiktest-exempel-med-losningar | test | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| logiktest-exempel-med-losningar | test | 480 | av | 188 | 1+2+3 | nej | 388 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test (kampanjpris) | 1100 | på | 413 | inga | ja | 503 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 900 | på | 413 | inga | ja | 303 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 800 | på | 413 | inga | ja | 203 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 720 | på | 322 | 1 | ja | 214 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 650 | på | 271 | 1+2 | ja | 195 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 520 | på | 188 | 1+2+3 | nej | 372 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test (kampanjpris) | 480 | på | 188 | 1+2+3 | nej | 332 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test (kampanjpris) | 1100 | av | 413 | inga | ja | 559 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 900 | av | 413 | inga | ja | 359 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 800 | av | 413 | inga | ja | 259 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 720 | av | 413 | inga | ja | 179 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 650 | av | 322 | 1 | ja | 200 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| logiktest-exempel-med-losningar | test (kampanjpris) | 480 | av | 188 | 1+2+3 | nej | 388 / 579 | ja (reserv) |
| bra-cv-guide | cv | 1100 | på | 359 | inga | ja | 557 / 572 | nej |
| bra-cv-guide | cv | 900 | på | 359 | inga | ja | 357 / 572 | nej |
| bra-cv-guide | cv | 800 | på | 359 | inga | ja | 257 / 572 | nej |
| bra-cv-guide | cv | 720 | på | 308 | 1 | ja | 228 / 572 | nej |
| bra-cv-guide | cv | 650 | på | 258 | 1+2 | ja | 208 / 572 | nej |
| bra-cv-guide | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| bra-cv-guide | cv | 520 | på | 188 | 1+2+3 | nej | 372 / 572 | ja (reserv) |
| bra-cv-guide | cv | 480 | på | 188 | 1+2+3 | nej | 332 / 572 | ja (reserv) |
| bra-cv-guide | cv | 1100 | av | 359 | inga | ja | 601 / 572 | nej |
| bra-cv-guide | cv | 900 | av | 359 | inga | ja | 413 / 572 | nej |
| bra-cv-guide | cv | 800 | av | 359 | inga | ja | 313 / 572 | nej |
| bra-cv-guide | cv | 720 | av | 359 | inga | ja | 233 / 572 | nej |
| bra-cv-guide | cv | 650 | av | 308 | 1 | ja | 214 / 572 | nej |
| bra-cv-guide | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| bra-cv-guide | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| bra-cv-guide | cv | 480 | av | 188 | 1+2+3 | nej | 388 / 572 | ja (reserv) |
| bra-cv-guide | cv (kampanjpris) | 1100 | på | 372 | inga | ja | 544 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 900 | på | 372 | inga | ja | 344 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 800 | på | 372 | inga | ja | 244 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 720 | på | 322 | 1 | ja | 214 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 650 | på | 271 | 1+2 | ja | 195 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 520 | på | 188 | 1+2+3 | nej | 372 / 572 | ja (reserv) |
| bra-cv-guide | cv (kampanjpris) | 480 | på | 188 | 1+2+3 | nej | 332 / 572 | ja (reserv) |
| bra-cv-guide | cv (kampanjpris) | 1100 | av | 372 | inga | ja | 600 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 900 | av | 372 | inga | ja | 400 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 800 | av | 372 | inga | ja | 300 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 720 | av | 372 | inga | ja | 220 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 650 | av | 322 | 1 | ja | 200 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| bra-cv-guide | cv (kampanjpris) | 480 | av | 188 | 1+2+3 | nej | 388 / 572 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 1100 | på | 359 | inga | ja | 557 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 900 | på | 359 | inga | ja | 357 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 800 | på | 359 | inga | ja | 257 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 720 | på | 308 | 1 | ja | 228 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 650 | på | 258 | 1+2 | ja | 208 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 520 | på | 188 | 1+2+3 | nej | 372 / 530 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 480 | på | 188 | 1+2+3 | nej | 332 / 530 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 1100 | av | 359 | inga | ja | 558 / 530 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 900 | av | 359 | inga | ja | 413 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 800 | av | 359 | inga | ja | 313 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 720 | av | 359 | inga | ja | 233 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 650 | av | 308 | 1 | ja | 214 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 480 | av | 188 | 1+2+3 | nej | 388 / 530 | ja (reserv) |
| arbetsintervju-guide | allt | 1100 | på | 308 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt | 900 | på | 308 | inga | ja | 408 / 440 | nej |
| arbetsintervju-guide | allt | 800 | på | 308 | inga | ja | 308 / 440 | nej |
| arbetsintervju-guide | allt | 720 | på | 308 | inga | ja | 228 / 440 | nej |
| arbetsintervju-guide | allt | 650 | på | 258 | 2 | ja | 208 / 440 | nej |
| arbetsintervju-guide | allt | 560 | på | 188 | 2+3 | ja | 188 / 440 | nej |
| arbetsintervju-guide | allt | 520 | på | 188 | 2+3 | nej | 372 / 449 | ja (reserv) |
| arbetsintervju-guide | allt | 480 | på | 188 | 2+3 | nej | 332 / 449 | ja (reserv) |
| arbetsintervju-guide | allt | 1100 | av | 308 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt | 900 | av | 308 | inga | ja | 464 / 440 | nej |
| arbetsintervju-guide | allt | 800 | av | 308 | inga | ja | 364 / 440 | nej |
| arbetsintervju-guide | allt | 720 | av | 308 | inga | ja | 284 / 440 | nej |
| arbetsintervju-guide | allt | 650 | av | 308 | inga | ja | 214 / 440 | nej |
| arbetsintervju-guide | allt | 560 | av | 188 | 2+3 | ja | 244 / 440 | nej |
| arbetsintervju-guide | allt | 520 | av | 188 | 2+3 | ja | 204 / 440 | nej |
| arbetsintervju-guide | allt | 480 | av | 188 | 2+3 | nej | 388 / 449 | ja (reserv) |
| arbetsintervju-guide | allt (kampanjpris) | 1100 | på | 322 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 900 | på | 322 | inga | ja | 394 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 800 | på | 322 | inga | ja | 294 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 720 | på | 322 | inga | ja | 214 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 650 | på | 271 | 2 | ja | 195 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 560 | på | 188 | 2+3 | ja | 188 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 520 | på | 188 | 2+3 | nej | 372 / 449 | ja (reserv) |
| arbetsintervju-guide | allt (kampanjpris) | 480 | på | 188 | 2+3 | nej | 332 / 449 | ja (reserv) |
| arbetsintervju-guide | allt (kampanjpris) | 1100 | av | 322 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 900 | av | 322 | inga | ja | 450 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 800 | av | 322 | inga | ja | 350 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 720 | av | 322 | inga | ja | 270 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 650 | av | 322 | inga | ja | 200 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 560 | av | 188 | 2+3 | ja | 244 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 520 | av | 188 | 2+3 | ja | 204 / 440 | nej |
| arbetsintervju-guide | allt (kampanjpris) | 480 | av | 188 | 2+3 | nej | 388 / 449 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 1100 | på | 497 | inga | ja | 419 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 900 | på | 497 | inga | ja | 219 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 800 | på | 417 | 1 | ja | 199 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 720 | på | 188 | 1+2 | ja | 348 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 650 | på | 188 | 1+2 | ja | 278 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 560 | på | 188 | 1+2 | ja | 188 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 520 | på | 188 | 1+2 | nej | 372 / 572 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 480 | på | 188 | 1+2 | nej | 332 / 572 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 1100 | av | 497 | inga | ja | 475 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 900 | av | 497 | inga | ja | 275 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 800 | av | 497 | inga | ja | 175 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 720 | av | 417 | 1 | ja | 175 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 650 | av | 188 | 1+2 | ja | 334 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 560 | av | 188 | 1+2 | ja | 244 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 520 | av | 188 | 1+2 | ja | 204 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 480 | av | 188 | 1+2 | nej | 388 / 572 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 1100 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 900 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 800 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 720 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 650 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 560 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 520 | på | - | - | - | 372 / 359 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 480 | på | - | - | - | 332 / 359 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 1100 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 900 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 800 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 720 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 650 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 560 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 520 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 480 | av | - | - | - | 388 / 359 | ja (reserv) |
| cv-exempel-yrken | cv | 1100 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 900 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 800 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 720 | på | 308 | 1 | ja | 228 / 220 | nej |
| cv-exempel-yrken | cv | 650 | på | 258 | 1+2 | ja | 208 / 220 | nej |
| cv-exempel-yrken | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 220 | nej |
| cv-exempel-yrken | cv | 520 | på | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |
| cv-exempel-yrken | cv | 480 | på | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |
| cv-exempel-yrken | cv | 1100 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 900 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 800 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 720 | av | 359 | inga | ja | 233 / 220 | nej |
| cv-exempel-yrken | cv | 650 | av | 308 | 1 | ja | 214 / 220 | nej |
| cv-exempel-yrken | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 220 | nej |
| cv-exempel-yrken | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 220 | nej |
| cv-exempel-yrken | cv | 480 | av | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |

### Alla fall, 1024 px

| Artikel | Kort | Höjd | Cookierad | Kortet px | Dolda steg | Knappen synlig | Förteckningen | Spalten rullar |
|---|---|---|---|---|---|---|---|---|
| soka-jobb-via-mail | gratis | 1100 | på | 497 | inga | ja | 384 / 356 | nej |
| soka-jobb-via-mail | gratis | 900 | på | 497 | inga | ja | 219 / 352 | nej |
| soka-jobb-via-mail | gratis | 800 | på | 417 | 1 | ja | 199 / 352 | nej |
| soka-jobb-via-mail | gratis | 720 | på | 188 | 1+2 | ja | 348 / 352 | nej |
| soka-jobb-via-mail | gratis | 650 | på | 188 | 1+2 | ja | 278 / 352 | nej |
| soka-jobb-via-mail | gratis | 560 | på | 188 | 1+2 | ja | 188 / 352 | nej |
| soka-jobb-via-mail | gratis | 520 | på | 188 | 1+2 | nej | 372 / 356 | ja (reserv) |
| soka-jobb-via-mail | gratis | 480 | på | 188 | 1+2 | nej | 332 / 356 | ja (reserv) |
| soka-jobb-via-mail | gratis | 1100 | av | 497 | inga | ja | 384 / 356 | nej |
| soka-jobb-via-mail | gratis | 900 | av | 497 | inga | ja | 275 / 352 | nej |
| soka-jobb-via-mail | gratis | 800 | av | 497 | inga | ja | 175 / 352 | nej |
| soka-jobb-via-mail | gratis | 720 | av | 417 | 1 | ja | 175 / 352 | nej |
| soka-jobb-via-mail | gratis | 650 | av | 188 | 1+2 | ja | 334 / 352 | nej |
| soka-jobb-via-mail | gratis | 560 | av | 188 | 1+2 | ja | 244 / 352 | nej |
| soka-jobb-via-mail | gratis | 520 | av | 188 | 1+2 | ja | 204 / 352 | nej |
| soka-jobb-via-mail | gratis | 480 | av | 188 | 1+2 | nej | 384 / 356 | ja (reserv) |
| ai-jobbmatchning | gratis | 1100 | på | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 900 | på | 497 | inga | ja | 219 / 220 | nej |
| ai-jobbmatchning | gratis | 800 | på | 417 | 1 | ja | 199 / 220 | nej |
| ai-jobbmatchning | gratis | 720 | på | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 650 | på | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 560 | på | 188 | 1+2 | ja | 188 / 220 | nej |
| ai-jobbmatchning | gratis | 520 | på | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| ai-jobbmatchning | gratis | 480 | på | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| ai-jobbmatchning | gratis | 1100 | av | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 900 | av | 497 | inga | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 800 | av | 497 | inga | ja | 175 / 220 | nej |
| ai-jobbmatchning | gratis | 720 | av | 417 | 1 | ja | 175 / 220 | nej |
| ai-jobbmatchning | gratis | 650 | av | 188 | 1+2 | ja | 252 / 224 | nej |
| ai-jobbmatchning | gratis | 560 | av | 188 | 1+2 | ja | 244 / 220 | nej |
| ai-jobbmatchning | gratis | 520 | av | 188 | 1+2 | ja | 204 / 220 | nej |
| ai-jobbmatchning | gratis | 480 | av | 188 | 1+2 | nej | 252 / 224 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 1100 | på | 400 | inga | ja | 516 / 572 | nej |
| logiktest-exempel-med-losningar | test | 900 | på | 400 | inga | ja | 316 / 572 | nej |
| logiktest-exempel-med-losningar | test | 800 | på | 400 | inga | ja | 216 / 572 | nej |
| logiktest-exempel-med-losningar | test | 720 | på | 308 | 1 | ja | 228 / 572 | nej |
| logiktest-exempel-med-losningar | test | 650 | på | 258 | 1+2 | ja | 208 / 572 | nej |
| logiktest-exempel-med-losningar | test | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| logiktest-exempel-med-losningar | test | 520 | på | 188 | 1+2+3 | nej | 372 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 480 | på | 188 | 1+2+3 | nej | 332 / 579 | ja (reserv) |
| logiktest-exempel-med-losningar | test | 1100 | av | 400 | inga | ja | 572 / 572 | nej |
| logiktest-exempel-med-losningar | test | 900 | av | 400 | inga | ja | 372 / 572 | nej |
| logiktest-exempel-med-losningar | test | 800 | av | 400 | inga | ja | 272 / 572 | nej |
| logiktest-exempel-med-losningar | test | 720 | av | 400 | inga | ja | 192 / 572 | nej |
| logiktest-exempel-med-losningar | test | 650 | av | 308 | 1 | ja | 214 / 572 | nej |
| logiktest-exempel-med-losningar | test | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| logiktest-exempel-med-losningar | test | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| logiktest-exempel-med-losningar | test | 480 | av | 188 | 1+2+3 | nej | 388 / 579 | ja (reserv) |
| bra-cv-guide | cv | 1100 | på | 359 | inga | ja | 557 / 572 | nej |
| bra-cv-guide | cv | 900 | på | 359 | inga | ja | 357 / 572 | nej |
| bra-cv-guide | cv | 800 | på | 359 | inga | ja | 257 / 572 | nej |
| bra-cv-guide | cv | 720 | på | 308 | 1 | ja | 228 / 572 | nej |
| bra-cv-guide | cv | 650 | på | 258 | 1+2 | ja | 208 / 572 | nej |
| bra-cv-guide | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 572 | nej |
| bra-cv-guide | cv | 520 | på | 188 | 1+2+3 | nej | 372 / 572 | ja (reserv) |
| bra-cv-guide | cv | 480 | på | 188 | 1+2+3 | nej | 332 / 572 | ja (reserv) |
| bra-cv-guide | cv | 1100 | av | 359 | inga | ja | 601 / 572 | nej |
| bra-cv-guide | cv | 900 | av | 359 | inga | ja | 413 / 572 | nej |
| bra-cv-guide | cv | 800 | av | 359 | inga | ja | 313 / 572 | nej |
| bra-cv-guide | cv | 720 | av | 359 | inga | ja | 233 / 572 | nej |
| bra-cv-guide | cv | 650 | av | 308 | 1 | ja | 214 / 572 | nej |
| bra-cv-guide | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 572 | nej |
| bra-cv-guide | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 572 | nej |
| bra-cv-guide | cv | 480 | av | 188 | 1+2+3 | nej | 388 / 572 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 1100 | på | 359 | inga | ja | 557 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 900 | på | 359 | inga | ja | 357 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 800 | på | 359 | inga | ja | 257 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 720 | på | 308 | 1 | ja | 228 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 650 | på | 258 | 1+2 | ja | 208 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 520 | på | 188 | 1+2+3 | nej | 372 / 530 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 480 | på | 188 | 1+2+3 | nej | 332 / 530 | ja (reserv) |
| hur-langt-ska-personligt-brev-vara | cv | 1100 | av | 359 | inga | ja | 558 / 530 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 900 | av | 359 | inga | ja | 413 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 800 | av | 359 | inga | ja | 313 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 720 | av | 359 | inga | ja | 233 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 650 | av | 308 | 1 | ja | 214 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 528 | nej |
| hur-langt-ska-personligt-brev-vara | cv | 480 | av | 188 | 1+2+3 | nej | 388 / 530 | ja (reserv) |
| arbetsintervju-guide | allt | 1100 | på | 308 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt | 900 | på | 308 | inga | ja | 408 / 440 | nej |
| arbetsintervju-guide | allt | 800 | på | 308 | inga | ja | 308 / 440 | nej |
| arbetsintervju-guide | allt | 720 | på | 308 | inga | ja | 228 / 440 | nej |
| arbetsintervju-guide | allt | 650 | på | 258 | 2 | ja | 208 / 440 | nej |
| arbetsintervju-guide | allt | 560 | på | 188 | 2+3 | ja | 188 / 440 | nej |
| arbetsintervju-guide | allt | 520 | på | 188 | 2+3 | nej | 372 / 449 | ja (reserv) |
| arbetsintervju-guide | allt | 480 | på | 188 | 2+3 | nej | 332 / 449 | ja (reserv) |
| arbetsintervju-guide | allt | 1100 | av | 308 | inga | ja | 478 / 449 | nej |
| arbetsintervju-guide | allt | 900 | av | 308 | inga | ja | 464 / 440 | nej |
| arbetsintervju-guide | allt | 800 | av | 308 | inga | ja | 364 / 440 | nej |
| arbetsintervju-guide | allt | 720 | av | 308 | inga | ja | 284 / 440 | nej |
| arbetsintervju-guide | allt | 650 | av | 308 | inga | ja | 214 / 440 | nej |
| arbetsintervju-guide | allt | 560 | av | 188 | 2+3 | ja | 244 / 440 | nej |
| arbetsintervju-guide | allt | 520 | av | 188 | 2+3 | ja | 204 / 440 | nej |
| arbetsintervju-guide | allt | 480 | av | 188 | 2+3 | nej | 388 / 449 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 1100 | på | 497 | inga | ja | 419 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 900 | på | 497 | inga | ja | 219 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 800 | på | 417 | 1 | ja | 199 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 720 | på | 188 | 1+2 | ja | 348 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 650 | på | 188 | 1+2 | ja | 278 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 560 | på | 188 | 1+2 | ja | 188 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 520 | på | 188 | 1+2 | nej | 372 / 572 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 480 | på | 188 | 1+2 | nej | 332 / 572 | ja (reserv) |
| mjuka-harda-kompetenser | gratis | 1100 | av | 497 | inga | ja | 475 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 900 | av | 497 | inga | ja | 275 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 800 | av | 497 | inga | ja | 175 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 720 | av | 417 | 1 | ja | 175 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 650 | av | 188 | 1+2 | ja | 334 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 560 | av | 188 | 1+2 | ja | 244 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 520 | av | 188 | 1+2 | ja | 204 / 572 | nej |
| mjuka-harda-kompetenser | gratis | 480 | av | 188 | 1+2 | nej | 388 / 572 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 1100 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 900 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 800 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 720 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 650 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 560 | på | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 520 | på | - | - | - | 372 / 359 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 480 | på | - | - | - | 332 / 359 | ja (reserv) |
| karriarbyte-olika-aldrar | inget | 1100 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 900 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 800 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 720 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 650 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 560 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 520 | av | - | - | - | 388 / 359 | nej |
| karriarbyte-olika-aldrar | inget | 480 | av | - | - | - | 388 / 359 | ja (reserv) |
| cv-exempel-yrken | cv | 1100 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 900 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 800 | på | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 720 | på | 308 | 1 | ja | 228 / 220 | nej |
| cv-exempel-yrken | cv | 650 | på | 258 | 1+2 | ja | 208 / 220 | nej |
| cv-exempel-yrken | cv | 560 | på | 188 | 1+2+3 | ja | 188 / 220 | nej |
| cv-exempel-yrken | cv | 520 | på | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |
| cv-exempel-yrken | cv | 480 | på | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |
| cv-exempel-yrken | cv | 1100 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 900 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 800 | av | 359 | inga | ja | 250 / 222 | nej |
| cv-exempel-yrken | cv | 720 | av | 359 | inga | ja | 233 / 220 | nej |
| cv-exempel-yrken | cv | 650 | av | 308 | 1 | ja | 214 / 220 | nej |
| cv-exempel-yrken | cv | 560 | av | 188 | 1+2+3 | ja | 244 / 220 | nej |
| cv-exempel-yrken | cv | 520 | av | 188 | 1+2+3 | ja | 204 / 220 | nej |
| cv-exempel-yrken | cv | 480 | av | 188 | 1+2+3 | nej | 250 / 222 | ja (reserv) |


Förteckningen i tabellerna: synlig höjd med rubriken / listans fulla höjd utan rubriken. I reservläget rullar spalten och den synliga höjden gäller spaltens överkant.

## Grindarna

- `npx tsc --noEmit`: inga fel.
- `npx vitest run`: 4877 godkända, 13 överhoppade, 1 fel i `src/components/session/__tests__/FigurserieTrana.test.tsx` (svarsknappen var inte aktiv i tid). Filen är orörd av den här ändringen och gick igenom ensam direkt efteråt (3 av 3), så felet är tidsberoende under full last.
- `next build --webpack`: grönt (fyra byggen under arbetet, det sista på den slutliga koden).
- SEO-grinden för de nio mätta artiklarna mot `docs/qa/seo-diff/publikt-omgang3-efter-live-3.json` (avtrycket filtrerat till samma nio sidor): `Sidor: 9`, `Fel: 0`. Ordantal i `main` oförändrat på alla nio.

## Det som inte är kontrollerat

- Safari och Firefox. Mätningen är gjord i Chrome. `:has()` och `overscroll-behavior` finns i båda sedan länge, och cookieregeln med `:has()` fanns redan.
- Det verkliga kampanjskriptet. Kampanjpriset är simulerat med `data-kampanj` på `<html>`, inte med datum.
- Hur det känns att rulla listan med mushjul och pekplatta. Rullningen är mätt med `scrollTop`, inte med riktig inmatning.

## Filerna

- `src/components/publikt/innehall/innehall.css`: spalten som flexkolumn, listan som rullar, stegen och reservläget.
- `src/components/artiklar/reklam/ArtikelReklam.tsx`: `data-sido-steg` på glyfrutan, bocklistan, beskrivningen, priset och gratisraden.
- `src/components/artiklar/ArtikelKlient.tsx`: den aktiva länken hålls synlig i listan.
