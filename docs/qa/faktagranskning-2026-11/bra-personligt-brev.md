# Faktagranskning: content/artiklar/bra-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK med en produktpunkt, artikeln består av råd och tydligt märkta före/efter-exempel utan statistik eller källhänvisningar.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 362 | "Förslag på förbättringar om du vill skriva själv" | obelagt (produkt) | Verktygssidan beskriver mallar, tonaliteter, ATS-anpassning, export och matchning mot annonsen, men ingen funktion som granskar ett brev du skrivit själv. Stryk punkten, om inte funktionen finns. | src/app/(public)/verktyg/personligt-brev/page.tsx |
| 256, 430 | "Över 30 olika yrken" / "Över 30 yrkesexempel" | obelagt (inaktuellt, inte fel) | Galleriet har 89 brevexempel. Byt till "89 yrken". | src/app/(public)/exempel/components/galleri-data.ts |

Notering (ingen åtgärd krävs): exempelbrevet på rad 233–235 har en person med "fem års erfarenhet från batteriutveckling på Northvolt" i presens ("har lett"). Northvolt AB gick i konkurs i mars 2025, så exemplet känns daterat. Byt gärna till ett fiktivt bolag, som i övriga exempel. Exemplen med Volvo och Spotify är illustrativa och påstår inget om bolagen.

## Belagda påståenden
- "Testa verktyget gratis" (rad 364): gratisnivån ger ett personligt brev skrivet på en annons, och sedan ett i veckan att läsa (src/app/(public)/priser/page.tsx). Artikeln lovar inte gratis nedladdning.
- "Text som fungerar med ATS-system" (rad 361): verktygssidan beskriver brevet som ATS-optimerat (src/app/(public)/verktyg/personligt-brev/page.tsx).
- Personerna i exemplen (Anna Andersson, Erik Nilsson, "Nordic Sales", "Innovate Tech", "Volta Battery Tech") är tydligt illustrativa före/efter-exempel.

## Rättning (omgång 1, 2026-11-15)
- Rad 362 ("Förslag på förbättringar om du vill skriva själv"): struket ur punktlistan om verktyget, funktionen finns inte.
- Rad 256 och 430 ("Över 30 olika yrken" / "Över 30 yrkesexempel"): rättat till "89 yrken" respektive "89 yrkesexempel". Länkarna kvar.
- Notering (Northvolt): exempelbrevet använder nu det fiktiva bolaget "Kraftcell Nord" på båda ställena.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, inte omgjord.

## Andra granskningen (2026-11-15)
GODKÄND. Rättningarna kontrollerade: punkten om förbättringsförslag struken, 89 yrken på båda ställena, Northvolt ersatt med fiktiva Kraftcell Nord på båda ställena (inga Northvolt kvar). Snabbläsning: exemplen är märkta före/efter-exempel, inga citat från namngivna verkliga personer, ingen statistik. Inga talstreck i ändrade rader.

## Svar till samordnaren
bra-personligt-brev, GODKÄND, inga brister.
