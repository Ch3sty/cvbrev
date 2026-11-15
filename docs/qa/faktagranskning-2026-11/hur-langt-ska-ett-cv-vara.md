# Faktagranskning: content/artiklar/hur-langt-ska-ett-cv-vara.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, Arbetsförmedlingens riktlinje återges korrekt; ett radantal i exemplet och CV-analysens koppling till annonsen stämmer inte.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 132 | "Elva rader blev två" | fel | Före-exemplet har nio rader (tre rolltitlar och sex punkter). Ändra till "Nio rader blev två". | Räkning i filen, rad 107–123 |
| 148 | "den pekar på sektioner som svällt, innehåll utan koppling till annonsen och rader som kan komprimeras" | fel (produkt) | CV-analysen tar bara emot CV:t och bedömer mot målroll, inte mot en annons. Ersätt "innehåll utan koppling till annonsen" med "innehåll som inte bär mot din målroll". Att analysen pekar ut "sektioner som svällt" och "rader som kan komprimeras" kunde inte bekräftas i koden: obelagt (produkt). | src/app/api/cv/analyze/route.ts |

## Belagda påståenden
- Arbetsförmedlingen: 1–2 sidor räcker, du behöver inte ta med allt du gjort (rad 12, 27, 38, 154): https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-cv
- ATS rankar på matchning mot annonsen (rad 20, 170): Arbetsförmedlingen, "Ju bättre överensstämmelse, desto högre rankning", https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig (att ATS inte räknar sidantal är rimligt men inte uttryckligen belagt).
- "läs det i tio sekunder, som en rekryterare gör första gången" (rad 146): i linje med Ladders 2018 (7,4 sekunder). OK som avrundning.
- Före/efter-exemplet med Telebutiken m.fl. är ett tydligt märkt illustrativt exempel. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 132 (fel): "Elva rader blev två" rättat till "Nio rader blev två".
- Rad 148 (fel, produkt): CV-analysens beskrivning omskriven. Kopplingen till annonsen borta, ersatt med "innehåll som inte bär mot din målroll". De obekräftade funktionerna "sektioner som svällt" och "rader som kan komprimeras" strukna; i stället poäng och vad som drar ner intrycket, och strykningen hänvisas till artikelns egen strykordning. Länken kvar.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget berördes inte, bilden inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Före-exemplet har nio rader (tre rolltitlar, sex punkter), så "Nio rader blev två" stämmer. CV-analysen beskrivs nu med poäng, vad som drar ner intrycket och målroll, utan annons och utan de obekräftade funktionerna; det motsvarar AnalysisOverviewStep. Övriga "annons"-omnämnanden i artikeln gäller kandidatens eget arbete, inte verktyget. Inga talstreck i ändrade rader.

## Svar till samordnaren
hur-langt-ska-ett-cv-vara, GODKÄND, inga brister.
