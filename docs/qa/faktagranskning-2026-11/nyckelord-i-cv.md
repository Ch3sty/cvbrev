# Faktagranskning: content/artiklar/nyckelord-i-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Arbetsförmedlingens råd återges korrekt. Det enda felet gäller vår egen CV-analys, som beskrivs göra något den inte gör.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 126 | "vår CV-analys ... jämför mot annonsen och visar vilka begrepp som saknas" | fel (produkt) | CV-analysen tar inte emot någon annons. Stegen är Välj CV, Analys, Översikt, Förbättringar, Granska, Mall och spara. Analysen tar fram kompetenstermer som svenska jobbannonser brukar efterfråga för yrket och jämför med dem. Ersätt med: "läser ditt CV som ett rekryteringssystem, jämför med de begrepp som annonser för ditt yrke brukar efterfråga och visar vad som saknas eller är för vagt beskrivet". | src/app/dashboard/cv-analys/components/steps.config.ts; supabase/functions/analyze-cv-background/index.ts rad 235–287 |

## Belagda påståenden
- Arbetsförmedlingen beskriver systemen som en "avancerad sökmotor" som jämför CV:t med kravprofilen, säger att systemen "prioriterar ansökningar som använder samma begrepp" och råder dig att "Identifiera centrala ord och formuleringar i annonsen" och att placera nyckelkompetenser tidigt. Arbetsförmedlingen 2026-02-10: https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig
- Varningen "det är viktigt att inte bara lägga in nyckelorden som finns i annonsen, för det kan uppfattas som oärligt" är ordagrann från Arbetsförmedlingen 2024-10-02: https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2024-10-02-lar-dig-anvanda-ai-i-jobbsokandet. Den står i 2024-artikeln, inte i 2026-artikeln. Båda finns i källistan, så det är OK.
- Exemplet "Ur en verklig annonstyp för en ekonomiassistent" påstår inte att annonsen är verklig och är tydligt illustrativt.

## Rättning (omgång 1, 2026-11-15)
- Rad 126 (fel, produkt): rättat. CV-analysen beskrivs nu som en kontroll mot de begrepp som annonser för yrket brukar efterfråga, inte mot en enskild annons; "exakt den här kontrollen" ändrat till "en liknande kontroll ... fast mot ditt yrke snarare än en enskild annons", och läsaren hänvisas till de tre frågorna för jämförelsen mot den egna annonsen. Länken till /verktyg/cv-analys kvar.
- Rubriker, FAQ och description oförändrade. `updated: "2026-11-15"` tillagt. Bilden berördes inte, inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Rad 127 stämmer med koden: analysen tar fram termer som svenska jobbannonser söker efter för yrket (analyze-cv-background/index.ts rad 235 ff.) och tar ingen annons. Inga andra påståenden om att CV-analysen jämför mot en annons finns i artikeln.
