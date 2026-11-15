# Faktagranskning: content/artiklar/cv-mall-pdf-gratis.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, programinstruktionerna stämmer men artikeln motsäger sig själv om konto, lovar mer gratis än gratisnivån ger och beskriver CV-analysen som en annonsjämförelse den inte gör.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 77 | "Det är gratis och kräver inget konto." | fel (produkt) | Motsäger rad 47 och 53 ("gratis med ett konto", "du behöver ett konto"). Gratisnivån ger 3 av 41 mallar och en nedladdning per konto; byggarens knappar leder till /register. Ersätt med: "Tre mallar och en nedladdning ingår gratis med ett konto, utan kortuppgift. Alla 41 mallar och fler nedladdningar ingår i Jobbcoach Premium, 149 kr i månaden." | src/lib/cv/template-antal.ts (FREE_TEMPLATE_COUNT = 3, TEMPLATE_COUNT = 41, FREE_CV_EXPORTS = 1); src/app/api/cv/generate-formatted/route.ts; src/app/(public)/priser/page.tsx |
| 47, 53, 232 | "laddar ner den som PDF på några minuter, gratis med ett konto" / "Det kostar inget" | fel (produkt, ofullständigt) | Gratis gäller en nedladdning och tre mallar. Lägg till "en nedladdning ingår gratis" och att övriga mallar kräver Premium. | Som ovan |
| 220 | "analysera ditt CV gratis. Ladda upp CV:t och jobbannonsen, så får du tillbaka hur väl de matchar, vilka nyckelord du saknar och konkreta förslag" | fel (produkt) | CV-analysen tar bara emot CV:t (body: cvId), ingen jobbannons; nyckelorden jämförs mot vanliga söktermer i branschen. Gratis ingår en analys med poäng och det tyngsta fyndet; hela analysen ingår i Premium. Ersätt med: "Ladda upp CV:t i vår CV-analys, så får du gratis en poäng och det viktigaste att åtgärda; hela analysen med saknade branschnyckelord ingår i Premium. Vill du jämföra mot en viss annons, använd jobbmatchningen." | src/app/api/cv/analyze/route.ts; /verktyg/cv-analys ("Vi jämför med vanliga söktermer i din bransch"); priser-sidan |
| 141 | "Rekryterare lägger i snitt runt 6 till 7 sekunder på den första blicken på ett CV, enligt ögonrörelsestudier" | fel (avrundat) | Ladders eye-tracking 2018: i genomsnitt 7,4 sekunder i en första genomläsning (2012-versionen: 6 sekunder). Ersätt med "i snitt 7,4 sekunder vid första genomläsningen, enligt Ladders ögonrörelsestudie från 2018". | Ladders Eye-Tracking Study 2018 (verifierat i dag av samordnaren) |

## Belagda påståenden
- Google Docs: Mallgalleri, CV-sektion, Arkiv → Ladda ner → PDF-dokument (rad 17, 83–86): Googles egna menyer.
- Word: Arkiv → Nytt, sök "CV"; samma mallar gratis på Microsoft Create i webbläsaren (rad 92): create.microsoft.com svarar och leder till Microsoft 365 Create.
- Pages har inbyggda CV-mallar (Resumes) och exporterar via Arkiv → Exportera till → PDF; Pages är gratis på Apple-enheter (rad 21, 98–103).
- Mallarna i CV-galleriet: PDF och Word, live-förhandsvisning, byte av mall och typsnitt (rad 77, 152): src/app/(public)/verktyg/cv-mallar/page.tsx.
- Exempel-CV:t (Erik Andersson, Volvo, ABB) är tydligt illustrativt.

## Rättning (omgång 1, 2026-11-15)
- Rad 77 ("gratis och kräver inget konto"): rättat till tre mallar och en nedladdning gratis med konto, utan kortuppgift; alla 41 mallar och fler nedladdningar i Jobbcoach Premium, 149 kr i månaden.
- Rad 47, 53 och FAQ (rad 13/232): kompletterat med att tre mallar och en nedladdning ingår gratis och att övriga mallar kräver Premium.
- Rad 220 (CV-analysen mot annonsen): rättat; analysen tar bara CV:t, gratis ger poäng och viktigaste fyndet, hela analysen med branschnyckelord i Premium. Jobbmatchningen tillagd (intern länk /verktyg/jobbmatchning) för den som vill se vilka jobb CV:t passar för.
- Rad 141 (6-7 sekunder): rättat till 7,4 sekunder vid första genomläsningen, Ladders ögonrörelsestudie 2018 (källan namngiven i texten; artikeln har ingen källrad och detta är dess enda siffra).
- updated tillagt. Bilden berördes inte. Inga rubriker, FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 142: "Rekryterare lägger i snitt 7,4 sekunder på den första genomläsningen av ett CV, enligt Ladders ögonrörelsestudie från 2018". Siffran stämmer (Ladders 2018: 7,4 sekunder vid första genomläsningen, upp från 6 sekunder 2012), men den är artikelns enda belagda siffra och står helt utan länk eller källrad. Krävs: källrad sist i artikeln, till exempel *Källa: [Ladders ögonrörelsestudie 2018](https://www.theladders.com/career-advice/you-only-get-6-seconds-of-fame-make-it-count).* (alternativt pressmeddelandet https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html).

Övrigt kontrollerat och godkänt: gratisnivån står rätt överallt (3 av 41 mallar och en nedladdning; template-antal.ts FREE_TEMPLATE_COUNT = 3, TEMPLATE_COUNT = 41, FREE_CV_EXPORTS = 1; priser-sidan), motsägelsen om konto är borta, CV-analysen beskrivs utan annons (gratis poäng och tyngsta fyndet enligt priser-sidan), jobbmatchningen ger gratis träffar, frontmatter-FAQ och FAQ-block stämmer överens, inga talstreck.

## Rättning omgång 2 (2026-11-15)
- Rad 142 (7,4 sekunder, Ladders 2018): meningen oförändrad; källrad tillagd sist i artikeln: *Källa: [Ladders ögonrörelsestudie 2018](https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html).* Pressmeddelandet valt eftersom theladders.com-sidan svarar 403; kontrollerat: "The average initial screening time for a candidate's resume clocks in at just 7.4 seconds" (2018, upp från sex sekunder 2012).
- Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden berörs inte, bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Källraden för 7,4 sekunder (Ladders 2018, pressmeddelandet på prnewswire) finns och svarar. Gratisnivån (tre mallar, en nedladdning, 41 mallar i Premium 149 kr) och CV-analysen utan annons stämmer med facit. FAQ-svaren skiljer sig bara i länkformat, inga talstreck.
