# Faktagranskning: content/artiklar/hur-skriver-man-ett-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, en felaktigt tillskriven källa (Academic Work), ett sakfel om BREEAM och en exempelberättelse som knyter påhittade projekt till ett verkligt företag.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 55 (snabbsvar) | "runt 250 till 400 ord enligt Academic Work" | fel (felaktig källtillskrivning) | Academic Work anger inget ordantal, bara "max en A4-sida, gärna kortare" och att innehållet är viktigare än längden. Ersätt med "max en A4-sida, gärna kortare, enligt Academic Work" eller stryk tillskrivningen och behåll 250-400 ord som vår egen tumregel. | https://www.academicwork.se/jobbsokande/personligt-brev |
| 181, 217 | "drev jag certifieringsprocessen från start till godkänd silver-nivå" (BREEAM) | fel | BREEAM och BREEAM-SE har nivåerna Pass, Good, Very Good, Excellent och Outstanding; "Silver" finns i Miljöbyggnad och LEED, inte i BREEAM. Ersätt med "till betyget Very Good". Notera också att BREEAM gäller byggnader; för ett anläggningsprojekt vore CEEQUAL/BREEAM Infrastructure rimligare, eller byt Hagaprojektet till ett husprojekt. | https://www.sgbc.se/app/uploads/2018/06/BREEAM-SE-2017-1.1-Swedish-version.pdf |
| 71, 120, 169, 213 | "Hon hittar att Skanska nyligen vunnit ett kontrakt på ny tunnelbanedelsträcka i Stockholm" | obelagt | Exempelberättelsen är märkt som walkthrough med fiktiv person, men påståendet om Skanskas aktuella kontrakt läses som en verklig, tidsbunden uppgift och kan inte knytas till ett datum. Byt till ett fiktivt bolag ("Byggbolaget AB") eller formulera det som hypotetiskt ("säg att hon hittar ..."). | – |
| 79-83, 177, 181, 215-217 | "Var Skanska-internt utbildad i BREEAM 2022" / "Det blev sedan standard på fyra andra Skanska-projekt" | påhittat (i exempel) | Påhittade projektresultat knutna till ett verkligt företag. Dessutom motsägelsefullt: Anna söker externt till Skanska men beskrivs som redan Skanska-anställd. Byt till fiktivt bolag eller gör Anna till anställd hos en annan (fiktiv) entreprenör. "Vasaleden" är en verklig gata i Göteborg; använd ett fiktivt projektnamn. | – |
| 20, 305 (FAQ) | "De flesta ATS-system och rekryterare förväntar sig PDF" | obelagt | Ingen källa; flera rekryteringssystem tolkar Word-filer lika bra eller bättre. Ersätt med "PDF är säkrast om annonsen inte anger annat format". | – |

## Belagda påståenden
- "Vi har samlat exempel för 89 yrken" (rad 234, 281): exampleData i src/app/(public)/personligt-brev-exempel/[yrke]/exempel-data.ts har 89 yrken, och länkade sidor student, sjukskoterska, underskoterska och saljare finns.
- Rad 281: brevverktyget utgår från CV och annons (src/app/(public)/verktyg/personligt-brev/).
- Interna länkar (/artiklar/hur-skriver-man-cv, /artiklar/skriva-personligt-brev-guide, /artiklar/personligt-brev-utbildning) går till befintliga artiklar.

## Rättning (omgång 1, 2026-11-15)
- Rad 55 (snabbsvar): rättat till "max en A4-sida, gärna kortare, som Academic Work rekommenderar. Vår tumregel är 250 till 400 ord." Källrad skapad sist med Academic Works aktuella URL (gamla /jobbsokande/personligt-brev omdirigerar till /artiklar/soka-jobb/tips-fr-att-skriva-personligt-brev, som säger "A4-sida, gärna kortare").
- Rad 181/217: BREEAM-nivån rättad till "betyget Very Good". Certifieringen görs nu på ett husprojekt ("kontorsprojektet Kajhuset"), och rad 136 säger "miljöcertifieringen" i stället för att knyta BREEAM till anläggningsprojektet.
- Rad 71 m.fl.: Skanska ersatt med det påhittade "Byggbolaget AB" genom hela artikeln (även filnamnsexemplen i brödtext och FAQ). Tunnelbanekontraktet skrivet hypotetiskt: "Säg att hon hittar att Byggbolaget nyligen vunnit ...". Rad 57 märker nu exemplet: "Både Anna och företaget är påhittade".
- Rad 79-83, 177, 181, 215-217: påhittade resultat inte längre knutna till verkligt företag. Anna är anställd hos en icke namngiven "nuvarande arbetsgivare", "fyra andra Skanska-projekt" blev "fyra andra projekt i företaget", Vasaleden blev påhittade "Norrstråket", Hagaprojektet blev "kontorsprojektet Kajhuset". Motsägelsen (extern sökande men Skanska-anställd) är borta. Grammatikfelet "Jag följt" rättat.
- Rad 20/305 (FAQ, båda): "De flesta ATS-system och rekryterare förväntar sig PDF" ersatt med "PDF är det säkraste valet om annonsen inte anger ett annat format".
- Underlaget: kalla-raden uppdaterad ("hos Byggbolaget"), artikelbild.ts körd utan fel; den renderade bilden blev byte-identisk (bildtexten innehöll inte företagsnamnet), alt oförändrad.
- `updated` tillagt. Rubriker, FAQ-frågor och description oförändrade.

## Andra granskningen (2026-11-15)
UNDERKÄND. Academic Work-rättningen stämmer (källan säger "max en A4-sida, gärna kortare", och den nya URL:en fungerar). BREEAM-nivån Very Good finns i BREEAM-SE. Skanska och de verkliga projektnamnen är borta, och exemplet är märkt som påhittat. Två brister kvar:

- Rad 21 och 306 (FAQ, båda ställena): "PDF. Alltid. ... PDF är det säkraste valet om annonsen inte anger ett annat format." Rättningen har gjort svaret självmotsägande, eftersom "Alltid" och "om annonsen inte anger annat" inte kan stå i samma svar. Samma "PDF, alltid" står på rad 257. Krävs: ändra "PDF. Alltid." till t.ex. "PDF, om annonsen inte anger något annat." på båda FAQ-ställena och "PDF, om inget annat anges" på rad 257.
- Rad 29 och 322 (FAQ, båda ställena, missat i första granskningen): "Det är 90 procent av alla bra brev: konkreta exempel." Det läses som en mätt andel utan källa. Krävs: stryk siffran, t.ex. "Det är kärnan i alla bra brev: konkreta exempel."
- Anmärkning (ej krav): "Byggbolaget AB" finns som registrerat bolagsnamn (bl.a. i Torshälla), men namnet är generiskt och exemplet är uttryckligen märkt som påhittat på rad 59, så det kan stå kvar.

## Rättning omgång 2 (2026-11-15)
- FAQ "Ska jag skicka som PDF eller Word?" (frontmatter och FAQItem, identiskt): "PDF. Alltid." ändrat till "PDF, om annonsen inte anger något annat." Den nu dubblerade slutmeningen "PDF är det säkraste valet om annonsen inte anger ett annat format." ändrad till "Därför är PDF det säkraste valet."
- Rad 257: "PDF, alltid." ändrat till "PDF, om inget annat anges."
- FAQ "kom igång"-svaret (rad 29 och 322): "Det är 90 procent av alla bra brev" ändrat till "Det är kärnan i alla bra brev" på båda ställena.
- Ingen FAQ-fråga, rubrik eller description ändrad. Underlaget docs/qa/artikelbilder/underlag/hur-skriver-man-ett-personligt-brev.json citerar ingen av de ändrade raderna (kontrollerat), bilden ej omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. "PDF, om annonsen inte anger något annat" i båda FAQ-svaren och "PDF, om inget annat anges" på rad 257; "90 procent" ersatt med "kärnan" på båda ställena. Ingen självmotsägelse kvar. FAQ identiska, inga talstreck.
