# Faktagranskning: content/artiklar/alva-labs-logiktest.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK, i stort sett allt om format, poäng, skala, omtest och delning stämmer ordagrant med Alva Labs hjälpsidor och produktsidor; en detalj i tabellen säger mer än källan.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 175 | "en uppgift vardera löst på nivå 9 och 10" | obelagt | Alvas exempel säger att personen löste uppgifter på nivå 9 och 10, inte hur många. Skriv som på rad 114: "men också löste uppgifter på nivå 9 och 10". | https://help.alvalabs.io/en/articles/9128093-how-is-my-logic-test-score-calculated |

## Belagda påståenden
- 20 uppgifter, en i taget, högst 2 minuter per uppgift, varning vid 30 sekunder kvar, de flesta klara på 15–20 minuter, upp till 40 minuter totalt, 3x3-matris, sex alternativ med exakt ett rätt, två övningsuppgifter, går inte att hoppa över, obesvarad räknas som fel, paus tillåten men inte för ofta, extra tid kan inte läggas till, mönster vänster–höger och uppifrån–ned "never diagonal", vid tekniskt fel lämna testet och kontakta support, anpassning tas med organisationen, lugn och ostörd miljö, utvilad, avsätt tid för ett svep (rad 12, 33, 57–86, 92–94, 236–242): https://help.alvalabs.io/en/articles/3135413-how-alva-s-logic-test-work
- Adaptivt, "uniquely selected for each individual to be challenging but not impossible", skala 1–10 standardiserad mot normalfördelning i arbetande befolkning, 5 och 6 vanligast, under 2 och över 9 ovanligt, breda percentilintervall i mitten, logisk förmåga "far from the only thing" (rad 110, 120, 135, 180, 188, 192): https://help.alvalabs.io/en/articles/2474000-how-do-i-interpret-my-logic-test-result
- Poängen speglar "the most likely level of logical ability", exemplet med nivå 8/9/10 och slutresultat 9, graf med gröna och röda cirklar (rad 24, 114): https://help.alvalabs.io/en/articles/9128093-how-is-my-logic-test-score-calculated
- "Adjusts difficulty in real time" utifrån svaren (rad 110, svårare/lättare): https://www.alvalabs.io/hiring-system/assessments/logic-test
- Banden 1–3 under, 4–7 genomsnitt, 8–10 över; kandidaten får samma rapport som rekryteraren direkt (rad 16, 186, 190, 194): https://help.alvalabs.io/en/articles/10541003-how-do-i-give-candidates-feedback-on-the-logic-test
- "No preparation needed", visuella mönster, "same report the recruiter sees", "first instinct is the most accurate" (rad 20, 39, 212, 250): https://www.alvalabs.io/candidates
- Kandidaten ser inte rollmatchningen (role fit), bara rekryteraren (rad 22, 194): sekundärkällor (cogniprep.app, recruitingtechreviews.com) som återger Alvas rapport; Alva själv säger "same report", rollmatchningen syns i rekryterarens vy.
- 24 månader, samma e-post, inte redan delat med företaget, delas automatiskt igen, konton kan inte slås ihop, support kan inte nollställa, företaget måste tillåta omtest (rad 200–202, 234): https://help.alvalabs.io/en/articles/12811224-sharing-and-retaking-alva-tests
- Nollställning: förlorar resultatet i alla jobb, "not reversible", skäl tekniska problem och betydligt ändrade omständigheter, automatiskt omtest efter 24 månader (rad 202, 204): https://help.alvalabs.io/en/articles/9167377-allowing-candidates-to-retake-their-tests
- Omtest kräver goda skäl, exempel störd, stressad, nervös, trött; omtest sällan mer än ett steg ifrån (rad 204, 206): https://help.alvalabs.io/en/articles/5040186-what-if-i-m-not-happy-with-my-test-results
- Personlighetstestet cirka 15 minuter, femgradig skala, antal frågor beror på hur konsekvent du svarar, adaptivt (rad 236, 248): https://help.alvalabs.io/en/articles/2812409-the-candidate-test-experience
- Produkt: fem matrisfrågor utan konto, gratiskonto ger Nivåkollen och ett första pass, avancerad nivå, dagliga pass och övningsprov ingår i Premium (rad 20, 208, 228): src/lib/access/features.ts (tests_above_base, test_daily_pass, test_exam_mode), src/app/(public)/priser/page.tsx. Alva-formatet "20 uppgifter, två minuter var" finns i src/lib/ovningsprov/format.ts (provrad.test.ts).

## Rättning (omgång 1, 2026-11-15)
- Rad 175 "en uppgift vardera löst på nivå 9 och 10": rättat till "och dessutom lösta uppgifter på nivå 9 och 10" (utan antal), som på rad 114 och i Alvas exempel.
- updated: "2026-11-15" tillagt. Ingen rubrik, FAQ, title eller description ändrad. Bilden berördes inte. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Rad 176 stämmer nu med Alvas exempel ("did also manage to complete a question of 9 and 10 respectively", help.alvalabs.io/en/articles/9128093). Produktuppgifterna (fem frågor utan konto, Nivåkollen och första pass gratis, övningsprov och avancerad nivå i Premium) stämmer med första granskningens kodkontroll. "Dagliga pass" avser funktionen, inte Dagspasset. Inga talstreck.

## Svar till samordnaren
alva-labs-logiktest, GODKÄND, inga brister.
