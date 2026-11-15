# Faktagranskning: content/artiklar/cv-mall-word-gratis.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, en statistikuppgift tillskrivs konkurrenter som inte har den, och två påståenden om våra egna verktyg stämmer inte med koden.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 97 | "Enligt sammanställningar från svenska CV-tjänster som cvkungen.se och cvmall.se föredrar runt 68 procent av rekryterarna enkla, ATS-kompatibla mallar" | obelagt (källan saknar uppgiften) | cvmall.se:s ATS-sida nämner ingen procentsiffra; siffran hittas bara i vår egen artikel. Stryk meningen om 68 procent och konkurrenterna som källa. Behåll rådet om enkla mallar utan siffra. Påståendet om tvåkolumnslayout finns hos cvmall.se men utan källa ("ATS-systems största fiende"); skriv det som råd, inte som belagd uppgift. | https://cvmall.se/cv-mallar/ats-cv |
| 160 | "Alla mallar är ATS-testade" | fel (produkt) | Mallverktyget märker vissa mallar "Mindre ATS-vänlig" (atsSafe=false), så alla är inte ATS-säkra. Ersätt med "Mallarna är märkta med hur ATS-vänliga de är" eller "De flesta mallar är ATS-säkra". | src/app/dashboard/cv-mallar/components/MallInfoCard.tsx |
| 259 | "kan du ladda upp ditt CV och jobbannonsen för att få direkt feedback på hur väl de matchar" | fel (produkt) | CV-analysen tar bara emot CV:t (cvId) och bedömer mot målroll, inte mot en inklistrad jobbannons. Ersätt med "ladda upp ditt CV och få poäng och konkret feedback på vad som drar ner intrycket". | src/app/api/cv/analyze/route.ts |
| 261 | "laddar ner ett färdigt, ATS-testat CV" | fel (produkt) | Samma som rad 160. Stryk "ATS-testat" eller skriv "med en ATS-säker mall". Notera också att gratisnivån har begränsad nedladdning. | MallInfoCard.tsx; src/lib/access/features.ts |

## Belagda påståenden
- Gratis CV-mallar finns i Word via Arkiv > Nytt och sök (rad 15, 57, 227–233): Microsofts mallgalleri i Word.
- Microsoft Create är Microsofts mallwebbplats, tidigare templates.office.com (rad 234): https://create.microsoft.com
- Gratis CV-analys (rad 259, 320): gratisnivån innehåller en CV-analys med poäng och det tyngsta fyndet (produktunderlag).
- Exempel-CV:n (rad 168–223, t.ex. "340%") är tydligt märkta illustrativa exempel med påhittade personer och företag, inte påstådda verkliga fall. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 97 (obelagt): 68-procentsuppgiften och cvkungen.se/cvmall.se som källa strukna. Rådet behållet utan siffra: enkel mall oftast säkrare, var försiktig med tvåkolumnslayout eftersom texten kan läsas i fel ordning (skrivet som råd).
- Rad 160 (fel, produkt): "Alla mallar är ATS-testade" ersatt med att mallarna är märkta med hur ATS-vänliga de är (MallInfoCard: "ATS-säker" / "Mindre ATS-vänlig").
- Rad 259 (fel, produkt): CV-analysen beskrivs nu som uppladdning av bara CV:t med poäng och feedback på vad som drar ner intrycket, ingen jobbannons.
- Rad 261 (fel, produkt): "ATS-testat" struket; rådet att välja en mall märkt ATS-säker tillagt, samt gratisnivån (tre mallar och en nedladdning, FREE_TEMPLATE_COUNT/FREE_CV_EXPORTS) och Jobbcoach Premium 149 kr i månaden för alla mallar.
- Utöver fynden, samma produktfel: rad 320 "förbättra matchningen mot jobben du söker" (CV-analysen) ändrat till "se exakt var ditt CV kan bli starkare innan du söker". Länken kvar.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget berördes inte, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND. 68-procentsuppgiften och konkurrenterna som källa är borta, CV-analysen beskrivs utan jobbannons överallt, och gratisnivån stämmer med koden (FREE_TEMPLATE_COUNT = 3, FREE_CV_EXPORTS = 1 i src/lib/cv/template-antal.ts; bara Jobbcoach Premium 149 kr/mån nämns). En ny produktbrist:
- Rad 161, "testa våra ... CV-mallar direkt här. Mallarna är ... märkta med hur ATS-vänliga de är, så du ser direkt vilka som är säkrast att skicka": mallvisningen i artikeln (InteractiveCVShowcase, som pekar på src/components/artiklar/MallVisning.tsx och MallVisningar.tsx) visar bara mallnamn, typsnitt och gratis/premium, ingen ATS-märkning. Märkningen finns på /cv-mallar (ATS-badge) och i mallverktyget (MallInfoCard: "ATS-säker" / "Mindre ATS-vänlig"), inte "direkt här". Krävs: till exempel "Mallarna är gjorda för svenska arbetsmarknaden, och i mallverktyget och på sidan med alla CV-mallar ser du vilka som är märkta ATS-säkra." Källa: src/app/dashboard/cv-mallar/components/MallInfoCard.tsx; src/app/(public)/cv-mallar/components/CvMallarPageContent.tsx.

## Svar till samordnaren
cv-mall-word-gratis, UNDERKÄND, raden före mallvisningen säger att man "direkt här" ser ATS-märkningen men artikelns mallvisning har ingen ATS-märkning.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Rad 161: ATS-märkningen sägs nu finnas i CV-verktyget (MallInfoCard), inte i mallvisningen i artikeln.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 161 säger nu att ATS-märkningen syns i CV-verktyget, vilket stämmer med MallInfoCard.tsx ("ATS-säker" / "Mindre ATS-vänlig"). Ingen Word-export av CV utlovas; vårt verktyg beskrivs som nedladdning av färdigt CV, gratis tre mallar och en nedladdning. CV-analysen utan annons. FAQ identiska, inga talstreck.
