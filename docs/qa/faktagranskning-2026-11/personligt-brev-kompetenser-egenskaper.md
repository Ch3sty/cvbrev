# Faktagranskning: content/artiklar/personligt-brev-kompetenser-egenskaper.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Arbetsförmedlingens citat stämmer, men artikeln beskriver två gånger en funktion i CV-analysen som inte finns.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 107 | "vår CV-analys (gratis att testa) jämföra ditt CV mot annonsen och visa vilka nyckelkompetenser som matchar och vilka som saknas" | fel (produkt) | CV-analysen tar bara emot CV:t, ingen annons (API:t /api/cv/analyze läser bara cvId). Den ger ATS-poäng och förslag i sex kategorier: ATS, struktur, språk, nyckelord, kvantifiering, profil. Gratisnivån ger en analys med poäng och det tyngsta fyndet. Ersätt med "vår CV-analys (en gratis analys) går igenom struktur, språk, nyckelord och kvantifiering och visar var CV:t är svagast". Ska det handla om matchning mot annonsen, länka till brevverktyget, som faktiskt läser annonsen. | src/app/api/cv/analyze/route.ts, src/app/(public)/verktyg/cv-analys/layout.tsx |
| 245 | "vår CV-analys (gratis att testa) jämföra ditt CV och annonsen och ge dig en lista på nyckelkompetenser att fokusera på" | fel (produkt) | Samma som ovan. | samma |

## Belagda påståenden
- "Arbetsförmedlingen påminner om att det inte finns några bra eller dåliga egenskaper i sig, allt beror på när och hur du använder dem" (rad 29): Arbetsförmedlingen, "Your personal qualities": "There are no good or bad personal qualities — it all depends on when, where and how you use them." https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-personal-letter/your-personal-qualities
- "undvika ord som låter som rena CV-ord och i stället förklara mer i detalj vad du är bra på" (rad 48): samma sida: "Avoid writing the words so that they could be perceived as 'CV words'. Instead, try to explain and describe in a more detailed way what you are good at."
- Brevverktyget "ger dig formuleringar att utgå från baserat på ditt CV och annonsen" (rad 245), gratis att testa: verktyget läser annons och CV, första brevet är gratis (src/app/(public)/verktyg/personligt-brev/layout.tsx, brev-faq-data.ts).
- STAR-metoden (Situation, Task, Action, Result): vedertagen intervjumetod, inget sakfel.

## Rättning (omgång 1, 2026-11-15)
- Rad 107 (fel, produkt): omskrivet. Matchningen mot annonsen läggs på läsaren och på brevverktyget (ny intern länk /verktyg/personligt-brev, som läser annons och CV). CV-analysen beskrivs som "en gratis analys" som går igenom struktur, språk, nyckelord och kvantifiering och visar var CV:t är svagast. Länkarna /verktyg/cv-analys och /artiklar/skriva-personligt-brev-med-ai kvar.
- Rad 245 (fel, produkt): omskrivet till att CV-analysen går igenom språk, nyckelord och kvantifiering och visar var formuleringarna är svagast. Ingen annonsjämförelse.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden inte berörd. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. CV-analysen beskrivs inte längre som en jämförelse mot annonsen (rad 108 och 246). Beskrivningen "går igenom struktur, språk, nyckelord och kvantifiering" och "en gratis analys" stämmer med verktygssidan ("Vi kontrollerar struktur, språk, nyckelord och kvantifiering ... En analys gratis per konto", src/app/(public)/verktyg/cv-analys/layout.tsx) och API:t tar bara emot cvId. Att brevverktyget läser både annonsen och CV:t stämmer med brev-faq-data.ts. Arbetsförmedlingen-citaten är oförändrade och belagda sedan omgång 1. Inga talstreck i ändrade rader.

## Svar till samordnaren
personligt-brev-kompetenser-egenskaper, GODKÄND, inga brister.
