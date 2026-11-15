# Faktagranskning: content/artiklar/aon-cut-e-test.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Modultider, poängsättning, rapportmått och företagshistorik stämmer mot Aons egna sidor; enda svagheten är att lokförarsektionen kopplar urvalet till Aon utan källa.

## Fynd att åtgärda

1. **Rad 375 till 379.** Rubriken "Aon-testet för lokförare" och "Koncentration och reaktion, till exempel Aons e3+ med signaler att reagera på under tidspress". **Obelagt.** Den enda källan, Järnvägar.nu (https://jarnvagar.nu/fa-klarar-test-for-att-bli-lokforare/), nämner varken Aon eller något testbolag, bara Transportstyrelsens krav på yrkespsykologisk kompetens. Ingen källa hittad för att lokförarutbildningarna (TCC, ProTrain, Trafikverksskolan, MTR) använder Aon, eller för att e3+ ingår. Förslag: byt rubriken till "Testet för lokförare", och skriv "Vilka tester just din utbildning använder, och om det är Aon, står i kallelsen". Stryk "Aons e3+" eller ersätt med "uppgifter med signaler att reagera på under tidspress". Om teamet har en förstahandskälla för Aon i lokförarurvalet: lägg den i källraden.

Anmärkning, inget krav: rad 377 "det är där de flesta faller" är en tolkning. Järnvägar.nu skriver att många inte uppfyller Transportstyrelsens krav och att "Det handlar främst om kravet på yrkespsykologisk kompetens". Tolkningen är rimlig.

## Belagda påståenden

- cut-e grundat 2002 i Hamburg, Aon köpte bolaget 4 maj 2017, 12 miljoner bedömningar per år i över 70 länder och 40 språk: Aons pressmeddelande (https://aon.mediaroom.com/news-releases?item=137577).
- Modultider: scales numerical 12 min/37, scales verbal 12 min/49, switchChallenge 6, gapChallenge 6, scales ix 5 min/20, scales clx 6, scales cls 12 min/12, digitChallenge 6, scales eql 5, gridChallenge 9 min/9, motionChallenge 6, scales verbal instruct 8 min/24, chatAssess 20, ADEPT-15 cirka 30 min/100 påståenden utan tidsgräns: https://www.aon.com/en/capabilities/talent-and-rewards/prepare-for-your-online-assessment
- "points are usually added for each correct answer and deducted for every incorrect answer", oftast under en kvart, går inte att avbryta, tiden mellan testerna räknas inte, dator rekommenderas, "shouldn't try to work faster than you did at school", nervositet kan fokusera, inte efter lång arbetsdag, kontrolltest senare, återkopplingsrapport: samma sida.
- Chrome eller Edge, dator starkt rekommenderad: https://www.aonassessment.com/kandidatsida
- Över 40 tester, över 10 problemlösningstest, över 30 färdighetstest, logiktest under 6 minuter, adaptiva, stora frågebanker som minimerar inlärningseffekten: https://www.aonassessment.com/aons-testutbud/logiktest
- Råpoäng, percentil och T-värde, Aon rekommenderar T-värdet; T-värde medel 50 sd 10; snabbhet och träffsäkerhet på skala 1 till 9 med 5 som medel; svårare uppgifter ger fler poäng: Aon Assessments kunskapsbas (rapporter och tolkning av jämförelserapporter).
- Järnvägar.nu: 5 000 sökte till YH-programmet med start 2023, 750 behöriga; koncentration, reaktion och simultankapacitet.
- Lösta exempel (switchChallenge-koderna, gapChallenge, ix, digitChallenge, procent) räknade och korrekta.
- Produkt: Lokförare i Mitt test ger figurserie, verbal, numerisk och deduktiv i Aons tempo (mittTest.ts rad 67 och 165); grundnivån gratis med konto (sessionGate).

## Rättning (omgång 1, 2026-11-15)
1. Rättat (obelagt): H2 ändrad, före "Aon-testet för lokförare", efter "Testet för lokförare" (ankaret #aon-testet-for-lokforare försvinner, inga interna länkar pekade dit). Lagt till att Järnvägar.nu inte nämner något testbolag och att vilka tester utbildningen använder, och om det är Aon, står i kallelsen. "Aons e3+" ersatt med "uppgifter med signaler att reagera på under tidspress". Ingen förstahandskälla för Aon i lokförarurvalet hittad, så ingen källa tillagd.
- Anmärkningen "det är där de flesta faller" lämnad (rimlig tolkning enligt granskaren).
- updated: "2026-11-15" tillagt. Inga FAQ-frågor eller description ändrade. Bilden berördes inte. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND (felet ligger utanför artikeln men orsakas av rättningen).

1. **src/app/(public)/verktyg/rekryteringstester/page.tsx rad 201.** `artikel: { text: 'Aon-testet för lokförare', href: '/artiklar/aon-cut-e-test#aon-testet-for-lokforare' }`. **Trasig länk.** Rättningsloggen säger "inga interna länkar pekade dit", men den här gör det; ankaret försvann när H2 byttes till "Testet för lokförare". Samma rad har texten "Lokförartestet bygger ofta på Aons moduler", alltså det obelagda påståendet som ströks ur artikeln (Järnvägar.nu nämner inget testbolag, ingen förstahandskälla hittad). Krav: peka länken på det nya ankaret (troligen #testet-for-lokforare, kontrollera mot hur rubrik-id genereras), byt länktexten till till exempel "Testet för lokförare", och skriv om "Lokförartestet bygger ofta på Aons moduler" så att det inte påstår Aon, till exempel "Lokförartestet mäter mer än logik." Källa: https://jarnvagar.nu/fa-klarar-test-for-att-bli-lokforare/

Kontrollerat och godtaget i artikeln: rubriken, "Järnvägar.nu nämner inget testbolag" (stämmer, sidan nämner SCB, Transportstyrelsen, MYH och tågoperatörer men inget testbolag), "e3+" struket, "av de 5 000 ... var enbart 750 behöriga" står ordagrant hos Järnvägar.nu, och "Det handlar främst om kravet på yrkespsykologisk kompetens" bär "det är där de flesta faller" som tolkning. Inga talstreck i ändrade rader.

## Svar till samordnaren
aon-cut-e-test, UNDERKÄND, rekryteringstester/page.tsx rad 201 länkar till det borttagna ankaret #aon-testet-for-lokforare och upprepar det strukna obelagda påståendet "Lokförartestet bygger ofta på Aons moduler".

## Rättning omgång 2 (samordnaren, 2026-11-15)
rekryteringstester/page.tsx: länken till ankaret #testet-for-lokforare och det obelagda "Lokförartestet bygger ofta på Aons moduler" struket. Artikeln: "Grundnivån i varje testtyp är gratis" rättat till Nivåkollen och ett första träningspass.

## Tredje kontrollen (2026-11-15)
GODKÄND. rekryteringstester/page.tsx rad 201 pekar nu på #testet-for-lokforare (rubriken "## Testet för lokförare" rad 376) med länktexten "Testet för lokförare", och "bygger ofta på Aons moduler" är borta. Rad 382 och 344 ("Nivåkollen och ett första träningspass är gratis med konto, resten ingår i Premium") stämmer med facit. FAQ identiska, inga talstreck.
