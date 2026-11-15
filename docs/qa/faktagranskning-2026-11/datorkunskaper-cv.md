# Faktagranskning: content/artiklar/datorkunskaper-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikeln har få kontrollerbara påståenden och Arbetsförmedlingen-hänvisningen stämmer. Felet sitter i hur CV-analysen beskrivs.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 94 | "Testa till sist raderna mot annonsen: täcker ditt CV varje system som nämns i kravlistan ... Vår CV-analys gör kontrollen automatiskt" | fel (produkt) | CV-analysen tar inte emot någon annons, så den kan inte kontrollera CV:t mot annonsens kravlista. Den bedömer CV:t i sex kategorier (ATS, struktur, språk, nyckelord, kvantifiering, profil). Skriv om till "Vår CV-analys går igenom språk och nyckelord och visar var formuleringarna är för vaga" och lägg kontrollen mot annonsen på läsaren själv. | src/app/api/cv/analyze/route.ts (bara cvId), src/app/(public)/verktyg/cv-analys/page.tsx |
| 94 | "och flaggar vaga kompetensrader" | obelagt (produkt) | Analysprompten bedömer språk, nyckelord och starka verb, men det finns ingen särskild kontroll av kompetensraderna. Mjuka upp till "pekar ut vaga formuleringar". | src/lib/openai/cv-analysis.ts |

## Belagda påståenden
- "var specifik med metoder och system, för algoritmer har svårt för vaga formuleringar" (rad 38): Arbetsförmedlingen 2026-02-10: "Beskriv din erfarenhet konkret och tydligt. Algoritmer har svårt för vaga formuleringar." Sidan uppmanar till att vara specifik om arbetsuppgifter, ansvar, metoder och kompetenser. https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig
- Systemnamnen (Fortnox, Visma, SAP, Agresso/Unit4, Hogia, Cosmic, TakeCare, Melior, Lifecare, Ongoing, Astro WMS, AutoCAD, SolidWorks, Salesforce, Lime, Monday, Trello, Jira) är verkliga produkter i respektive bransch. Påståendet är bara att de förekommer i annonser, och det är rimligt.
- CV-verktyget hjälper till med formuleringar: förbättringsprompterna kräver aktiva verb och konkreta formuleringar (src/lib/cv/improvement-prompts.ts).

## Rättning (omgång 1, 2026-11-15)
- Rad 94 (fel, produkt): kontrollen mot annonsens kravlista läggs på läsaren ("Den kontrollen gör du själv med annonsen bredvid dig"). CV-analysen beskrivs som att den går igenom språk och nyckelord.
- Rad 94 (obelagt): "flaggar vaga kompetensrader" mjukat till "pekar ut vaga formuleringar".
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden inte berörd. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Rad 95: kontrollen mot annonsens kravlista ligger nu på läsaren, och CV-analysen beskrivs bara som att den "går igenom språk och nyckelord och pekar ut vaga formuleringar", vilket stämmer med analysprompten (src/lib/openai/cv-analysis.ts) och med att API:t bara tar emot cvId. Inga andra påståenden ändrade, inga talstreck i ändrade rader.

## Svar till samordnaren
datorkunskaper-cv, GODKÄND, inga brister.
