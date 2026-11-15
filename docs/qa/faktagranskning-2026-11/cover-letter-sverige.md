# Faktagranskning: content/artiklar/cover-letter-sverige.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, få kontrollerbara påståenden; ett fel om exempelbrevets längd och ett om hur brevverktyget väljer språk.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 75 | "Brevet är drygt 200 ord långt." | fel | Exempelbrevet har 196 ord inklusive kontaktrader, rubrik och hälsning, och 174 ord i själva brevtexten. Skriv "knappt 200 ord". | egen ordräkning av CVExample-blocket rad 51–71 |
| 391 | "Är annonsen på engelska blir utkastet ett engelskt cover letter, är den på svenska blir det ett personligt brev enligt mallen ovan." | fel (produkt) | Verktyget väljer inte språk efter annonsen. Användaren väljer svenska eller engelska i steget för ton och språk, och svenska är förvalt. Skriv "Välj engelska i steget för ton och språk så blir utkastet ett engelskt cover letter." | src/app/dashboard/skapa-brev/CreateLetterClient.tsx rad 217 (`useState<Language>('sv')`), components/steps/TonalityLanguageStep.tsx; src/app/api/letters/generate/route.ts rad 124 (`language = 'sv'`) |

## Belagda påståenden
- Arbetsförmedlingen: "a maximum of one A4 page"; "Express yourself professionally, but avoid being overly formal or using industry-specific jargon": https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-personal-letter
- Länkarna /skapa-brev/start, /artiklar/personligt-brev-pa-engelska m.fl. finns.
- Exempelbreven (Elin Berg, Nordlast AB, engelska mallar) är tydligt märkta som exempel och ger inga mätta resultat för verkliga personer.
- Brittisk/amerikansk hälsnings- och avslutningspraxis (Yours sincerely/faithfully, Sincerely) och stavning (colour/color) stämmer med vedertagen praxis.

## Rättning (omgång 1, 2026-11-15)
- Rad 75 ("drygt 200 ord"): rättat till "knappt 200 ord".
- Rad 391 (verktyget väljer språk efter annonsen): rättat. Nu: svenska är förvalt och ger ett personligt brev enligt mallen; välj engelska i steget för ton och språk så blir utkastet ett engelskt cover letter. Länken till /skapa-brev/start kvar.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Rad 76 "knappt 200 ord" stämmer med första granskningens ordräkning (196 ord inklusive kontaktrader). Rad 392 stämmer med koden: språket förvalt 'sv' (CreateLetterClient.tsx rad 217), segmentet Svenska/English under "Brevets språk" i TonalityLanguageStep.tsx, API:t default language = 'sv'. Inga talstreck.
