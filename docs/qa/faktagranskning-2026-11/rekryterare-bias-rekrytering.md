# Faktagranskning: content/rekryterare/bias-rekrytering.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Huvudkällan (Forscher 2019) och Sackett stämmer, men två påståenden går längre än källan och ett påstående om vår egen kandidatpool stämmer inte med koden.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 32 | "identiska meriter, olika namn, hälften så många svar" | fel | Artikelns egen källa (DO:s forskningsöversikt) redovisar Carlsson & Rooth 2007: svenskklingande namn fick 50 % fler kallelser, alltså tre intervjuer per tio ansökningar mot två. Det är två tredjedelar, inte hälften. Ersätt med "identiska meriter, olika namn, en tredjedel färre kallelser till intervju". (Bursell 2007 fick en kvot på 1,8, som ligger nära hälften, men det är en enskild studie.) | DO/Oxford Research 2012, s. 190 och 212: https://www.do.se/download/18.277ff225178022473141e2b/1618941270328/rapport-forskningsoversikt-diskriminering-rekrytering.pdf |
| 17 | "svenska fältförsök visar att det ökar chansen till intervju för grupper som annars väljs bort" | obelagt (överdrivet) | Den svenska evidensen är i praktiken en studie: Åslund & Nordström Skans, försöket i Göteborgs stadsdelar. Enligt DO:s översikt ökade kvinnornas chans till intervju, medan utfallet för sökande med icke-västerländsk bakgrund var "nästintill identiskt". Skriv i stället "ett svenskt försök i Göteborg visade att kvinnors chans till intervju ökade med avidentifierade ansökningar". Pluralformen "fältförsök" och "grupper" täcks inte av källan. | DO-översikten s. 459–460 (samma URL) |
| 19, 85 | "strukturerade intervjuer ger mindre skillnader mellan grupper än ostrukturerade" | obelagt i angiven källa | Sackett m.fl. (2022/2023) visar att strukturerad intervju har högst validitet (.42) och en mycket mindre svart–vit skillnad (d ≈ .23) än kognitiva test (d ≈ .79). Jämförelsen med ostrukturerade intervjuer går inte att belägga i den länkade källan. Skriv "mindre skillnader mellan grupper än kognitiva test" eller lägg till en källa för jämförelsen (Huffcutt & Roth 1998). | Sackett, Zhang, Berry & Lievens (IOP 2023), länken på rad 91 |
| 87 | "styrkor i ord i stället för sorterbara poäng" | fel (produkt) | Rekryterarsidan visar testresultat som exakta percentiler ("topp 8 %"), har sorteringen `testScore` som rangordnar på bästa percentil och ett filter för lägsta percentil. Arbetsstilen redovisas i ord, men testresultaten går att sortera. Skriv "arbetsstil i ord, testresultat som verifierade förstagångsresultat" eller ändra produkten. | src/lib/recruiter/poolSearch.ts (rad 31, 43, 206–213), src/lib/recruiter/candidateData.ts (rad 359) |

## Belagda påståenden
- Forscher m.fl. 2019: 492 studier, 87 418 deltagare. Svaga effekter på implicita mått (|d| < .30) och "trivial changes in behavior", och förändrade implicita mått förklarade inte förändrat beteende. Källa: https://pmc.ncbi.nlm.nih.gov/articles/PMC6687518/
- Strukturerad intervju är den enskilda urvalsmetod som har högst validitet (.42). Källa: Sackett m.fl. 2023, länken på rad 91.
- AI-förordningen klassar rekrytering och urval som högrisk (bilaga III punkt 4), med krav på transparens och mänsklig tillsyn. Källa: förordning (EU) 2024/1689. Artikeln anger inget datum, så uppskjutningen till december 2027 påverkar inte texten.
- Kandidatpoolen är anonym tills kandidaten själv väljer att visa sig. Källa: src/lib/recruiter/candidateData.ts (maskeringsregeln).
- DO:s forskningsöversikt finns och går att ladda ner (Oxford Research för DO, 2012).

## Rättning (omgång 1, 2026-11-15)
- Rad 32 (fel): "hälften så många svar" rättat till "en tredjedel färre kallelser till intervju" (Carlsson & Rooth 2007 via DO-översikten, som redan står i källraden). Länktexten ändrad, länkmålet kvar.
- Rad 17 (FAQ, obelagt): pluralen "svenska fältförsök ... grupper" ersatt med det enda belagda försöket: "Ett svenskt försök i Göteborg visade att kvinnors chans till intervju ökade när ansökningarna var avidentifierade."
- Rad 19 och 85 (obelagt i källan): jämförelsen "än ostrukturerade" ändrad till "betydligt mindre skillnader mellan grupper än kognitiva test", som Sackett m.fl. (redan i källraden) bär.
- Rad 87 (fel, produkt): texten följer nu koden enligt samordnarens beslut: arbetsstil och styrkor i ord, testresultat som verifierade förstagångsresultat som visas som percentil och går att sortera och filtrera på. Rådet att aldrig låta en percentil ensam avgöra står kvar som råd, inte som påstående om att verktyget hindrar det.
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Ingen bild (rekryterarartikel). Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: "en tredjedel färre kallelser" stämmer med Carlsson & Rooth (50 % fler kallelser för svenskklingande namn, 3 mot 2) och med länkmålet anonymiserad-rekrytering ("omkring 50 procent fler"). Göteborgsförsöket påstår nu bara det som gäller kvinnor. "Betydligt mindre skillnader mellan grupper än kognitiva test" bärs av Sackett m.fl. 2023 (d ≈ .23 mot .79). Produktmeningen stämmer med koden: förstagångsresultat (firstCompleted i candidateData.ts), percentil visad som "topp X %", sortering testScore och percentilfilter (poolSearch.ts rad 31, 43, 206–213; FilterPanel.tsx "Testresultat" Topp 50/25/10 %). Inga tankstreck i ändrade rader.

## Svar till samordnaren
bias-rekrytering, GODKÄND, inga brister.

## Produktsvep (2026-11-15)
- "Testresultaten visas som percentil" blev placering ("topp X %") när minst 25 gjort testet, annars andel rätt.
- Inga rubriker, FAQ-frågor eller description ändrade.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Rad 88 efter produktsvepet: "Testresultaten visas som placering ("topp X %") när minst 25 har gjort testet, annars som andel rätt, och de går att sortera och filtrera på". Stämmer ordagrant med facit (topp X % vid minst 25, annars X % rätt; sortering och filter på testresultat). "Anonymt först" och "arbetsstil och styrkor i ord" motsäger inte facit.
- Andra granskningen var godkänd; inga andra ändringar sedan dess. Inga talstreck i ändrade rader. Inga påståenden om att Premium krävs för att synas eller om "aldrig råpoäng" för testresultat.
