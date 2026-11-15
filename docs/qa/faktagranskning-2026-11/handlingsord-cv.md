# Faktagranskning: content/artiklar/handlingsord-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK. Arbetsförmedlingen-hänvisningen stämmer. Det enda fyndet är att en källa i källraden beskrivs som något den inte är.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 174 | "[Akavia om att skriva CV och lyfta resultat](https://www.akavia.se/.../sa-skriver-du-personligt-brev/)" | fel (källhänvisning) | Den länkade sidan handlar om personligt brev, inte CV. Den lyfter däremot konkreta resultat. Ändra länktexten till "Akavia om att lyfta konkreta resultat i ansökan" eller länka till Akavias CV-guide. TSL-länken handlar också om personligt brev och tar inte upp verb eller resultat, så beskrivningen "råd till jobbsökare" är OK men bidrar inte till artikelns påståenden. | https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/ ; https://www.tsl.se/privatperson/inspiration/saa-skriver-du-personligt-brev/ |
| 42 | "En rekryterare läser hundratals punkter som börjar med 'ansvarade för' varje vecka" | obelagt (retorik) | Ingen källa. Mjuka upp: "En rekryterare läser många punkter som börjar med 'ansvarade för'". | – |

## Belagda påståenden
- "var specifik med arbetsuppgifter, ansvar och metoder, för algoritmer har svårt för vaga formuleringar" (rad 40, 18, 158): Arbetsförmedlingen 2026-02-10: "Beskriv din erfarenhet konkret och tydligt. Algoritmer har svårt för vaga formuleringar." https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig
- CV-analysen pekar ut vaga formuleringar (rad 140): analysen bedömer bl.a. språk och "starka verb" (src/lib/openai/cv-analysis.ts, strongVerbs).
- CV-verktyget föreslår aktiva formuleringar (rad 140): förbättringsprompterna kräver starka, aktiva verb (src/lib/cv/improvement-prompts.ts, src/lib/cv/role-based-improvements.ts).
- Exemplen före och efter är tydligt märkta som illustrationer och inga verkliga personer.

## Rättning (omgång 1, 2026-11-15)
- Rad 174 (fel, källhänvisning): länktexten för Akavia ändrad till "Akavia om att lyfta konkreta resultat i ansökan". TSL-länken lämnad (beskrivningen är korrekt).
- Rad 42 (obelagt): "hundratals ... varje vecka" -> "En rekryterare läser många punkter som börjar med \"ansvarade för\"."
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden inte berörd. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Akavia-länken heter nu "Akavia om att lyfta konkreta resultat i ansökan", vilket motsvarar sidan om personligt brev. "Hundratals ... varje vecka" är mjukat till "många". CV-analysen (rad 141) beskrivs som att den pekar ut vaga formuleringar, ingen annonsjämförelse. Inga talstreck i ändrade rader.

## Svar till samordnaren
handlingsord-cv, GODKÄND, inga brister.
