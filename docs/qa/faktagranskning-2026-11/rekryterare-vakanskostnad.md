# Faktagranskning: content/rekryterare/vakanskostnad.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, enkätsiffrorna och tidsuppgifterna stämmer, men dagsintervallet "branschkalkyler 2 000-6 000 kr" saknar källa och en enkätuppgift är lätt omformulerad.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 11, 38 | "Branschkalkyler brukar landa i storleksordningen 2 000-6 000 kr per dag" | obelagt | Ingen källa hittad. Behåll tabellen som räkneexempel men stryk "branschkalkyler brukar landa", skriv "Räknar vi med 2 000-6 000 kr per dag...". Schablonen omsättning per anställd / 220 dagar kan stå kvar som egen modell. | – |
| 32 | "33 procent att de skjutit upp planerad expansion" | fel (formulering) | Enkäten: "Tre av tio företag, 33 procent, får planerad expansion inställd". Skriv "fått ställa in planerad expansion". | https://www.svensktnaringsliv.se/sakomraden/utbildning/rekryteringsenkaten-var-fjarde-rekrytering-misslyckas_1249139.html |
| 42 | "den post som i enkätdatan ovan visar sig störst" (kvalitets- och kundpåverkan) | obelagt | Enkäten jämför inte kalkylposter mot varandra. Stryk. | Som ovan |
| 19, 87 | "drygt 700 000 kr i en vanlig tjänstemannakalkyl" | obelagt (här) | Siffran vilar på kalkylen i insikten vad-kostar-en-felrekrytering (Kollega/Experis som källor). Granskas där; kontrollera att den håller innan den återanvänds. | content/rekryterare/vad-kostar-en-felrekrytering.mdx |

## Belagda påståenden
- 37 procent tackar nej till försäljning/order på grund av kompetensbrist (rad 32): Svenskt Näringsliv, "Fyra av tio företag, 37 procent, får tacka nej till försäljning/ordrar". Länk ovan (publicerad 3 mars 2026).
- Nio av tio påverkas negativt (rad 32): "Nio av tio företag, 93 procent, påverkas negativt av rekryteringssvårigheterna". Samma källa.
- 6-8 veckor sök och urval, 1-3 månaders uppsägningstid, processtart 5-6 månader före tillträde (rad 17, 79): https://levelrecruitment.se/blogg/hur-lang-tid-tar-egentligen-en-rekryteringsprocess/
- Aritmetiken: 1,5 mkr / 220 = 6 818 kr per dag (rad 11, 38); tabellen 2 000/4 000/6 000 kr x 21 dagar x 4 månader stämmer.
- Egen pool med verifierade testresultat och villkor synliga (rad 81): src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts.

## Rättning (omgång 1, 2026-11-15)
- Rad 11 (FAQ-svaret) och rad 38: "Branschkalkyler brukar landa i 2 000-6 000 kr per dag" struket som källpåstående. FAQ-svaret leder nu med att kostnaden beror på rollen och går att räkna fram (schablonen omsättning per anställd / 220 dagar kvar); avslutningen "även halverad" skriven om till "även räknat på 2 000 kr per dag blir några månaders vakans en sexsiffrig post". Rad 38 presenterar intervallet som det vi räknar med i tabellen, inte som branschdata. Tabellen orörd.
- Rad 32: "skjutit upp planerad expansion" rättat till "fått ställa in planerad expansion" enligt enkätens formulering.
- Rad 42: "den post som i enkätdatan ovan visar sig störst" struket, ersatt med att det är här enkätens förlorade affärer hamnar (ingen jämförelse mellan poster).
- Rad 19 och 87: 700 000 kr anpassat till rättningen i vad-kostar-en-felrekrytering (snittsiffran för alla roller, inte "tjänstemannakalkyl"): "i snitt omkring 700 000 kr enligt den svenska standardsiffran". Den interna länken på rad 87 kvar.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Ingen artikelbild med underlag.

## Andra granskningen (2026-11-15)
GODKÄND. Svenskt Näringsliv kontrollerat: "Tre av tio företag, 33 procent, får planerad expansion inställd", 37 procent tackar nej till försäljning/ordrar, 93 procent påverkas negativt. "Branschkalkyler brukar landa" struket, intervallet nu uttryckligen vårt räkneexempel. 700 000 kr formulerat likadant som i vad-kostar-en-felrekrytering ("i snitt omkring 700 000 kronor", standardsiffran). Inga talstreck.

## Svar till samordnaren
vakanskostnad, GODKÄND.
