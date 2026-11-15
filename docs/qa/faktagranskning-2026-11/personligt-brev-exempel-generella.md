# Faktagranskning: content/artiklar/personligt-brev-exempel-generella.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, ett påstående om vad Arbetsförmedlingen och Unionen rekommenderar säger mer än källorna, resten är råd och tydligt märkta exempel.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 19 (frontmatter) och 233 (FAQ) | "Arbetsförmedlingen och fackförbund som Unionen rekommenderar att brevet hålls kort och lättläst, runt en halv till en hel sida" | fel (AF-delen) / obelagt (Unionen-delen) | Arbetsförmedlingen skriver "Max en A4-sida är en bra längd på ett personligt brev", inget om en halv sida. Unionen har ingen rådgivningssida om brevlängd, bara nedladdningsbara brevmallar. Ersätt med: "Arbetsförmedlingen rekommenderar max en A4-sida." och stryk Unionen. | https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev |
| 182 | "Se kompletta exempel för 30+ yrken" | obelagt (inkonsekvent, inte fel) | Galleriet har 89 brevexempel, och samma artikel säger 89 på fyra ställen. Byt rubriken till "89 yrken" för att vara konsekvent. | src/app/(public)/exempel/components/galleri-data.ts (BREV_GALLERI, 89 poster) |

## Belagda påståenden
- 89 yrkesexempel på personligt brev (rad 21, 54, 193, 211, 237): BREV_GALLERI har 89 poster, src/app/(public)/exempel/components/galleri-data.ts.
- Arbetsförmedlingen: ge exempel som styrker i stället för tomma ord (rad 94): "Ge exempel som lyfter fram dina egenskaper", https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev
- Skapa personligt brev "gratis" (rad 212): gratisnivån ger ett brev och sedan ett i veckan att läsa (src/app/(public)/priser/page.tsx). Formuleringen säger inget om nedladdning och håller.
- Exempelbreven (Anna, koordinator, konverteringsprocenten) är tydligt märkta som illustrativa.

## Rättning (omgång 1, 2026-11-15)
- Rad 19/233 (FAQ i frontmatter och FAQ-blocket i brödtexten): rättat. Unionen och "en halv till en hel sida" struket. Ny text i båda: "Sikta på max en A4-sida, som Arbetsförmedlingen rekommenderar. Det blir ungefär 250 till 400 ord, och kort och lättläst vinner." FAQ-frågan oförändrad.
- Rad 182: rättat till 89 yrken. H2 före: "## Se kompletta exempel för 30+ yrken", efter: "## Se kompletta exempel för 89 yrken".
- `updated: "2026-11-15"` tillagt. Description oförändrad. Bilden berörs inte (underlaget citerar ingen ändrad mening), inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Rättningarna kontrollerade: Arbetsförmedlingen skriver "Max en A4-sida är en bra längd på ett personligt brev" (https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev), Unionen och halvsidan strukna, frontmatter-FAQ och FAQ-block är identiska, rubriken säger 89 yrken som resten av artikeln. Inga nya fel, inga talstreck i ändrade rader.

## Svar till samordnaren
personligt-brev-exempel-generella, GODKÄND, inga brister.
