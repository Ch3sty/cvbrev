# Faktagranskning: content/artiklar/personligt-brev-jobbansokan.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Analysen av "det fullständiga exemplet" beskriver ett annat brev än det som visas, och artikeln påstår en erfarenhet ("granskat tusentals brev", "tips från erfarna rekryterare") och ett produktutfall som inte går att belägga.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 171–177 | "Inledningen visar direkt att sökanden förstår företagets situation (expansion) ... två konkreta exempel med mätbara resultat (40% ökning, 25 nya kunder)" | fel | Brevet som visas (`<PersonligtBrevPreview yrke="saljare" />`, Marcus Lindqvist till Telia) börjar med "Jag söker tjänsten som Account Manager B2B på Telia", alltså den öppning artikeln själv avråder från på rad 98. Det nämner ingen expansion och har ett enda tal (23 % ökning, kundportfölj på 45 MSEK). Antingen skrivs analysen om efter brevet som faktiskt visas, eller så byts brevet ut så att det följer artikelns råd. | src/components/mdx/PersonligtBrevPreview.tsx rad 88–106 |
| 255 | "Efter att ha granskat tusentals personliga brev ser vi samma misstag" | obelagt (produkt) | Det är ett erfarenhetspåstående som inte går att belägga. Skriv "De vanligaste misstagen vi ser" utan antal. | – |
| 47 | "praktiska tips från erfarna rekryterare" | obelagt | Ingen rekryterare citeras eller hänvisas till i artikeln. Stryk eller skriv "tips utifrån hur rekryterare läser". | – |
| 363, 365 | "få ett färdigt personligt brev på 60 sekunder" / "börja få fler intervjuer redan denna vecka" | obelagt (produkt) | Verktygets egen FAQ säger "Från start till färdig PDF tar det två till fyra minuter" (själva genereringen tar några sekunder). Fler intervjuer är ett utfall utan mätning. Gratisnivån ger ett brev att läsa men inte ladda ner. Skriv "ett första utkast på några minuter" och stryk intervjulöftet. | src/app/(public)/verktyg/personligt-brev/ (FAQ: "två till fyra minuter"); quotaService.ts `FREE_LETTERS_PER_ACCOUNT = 1` |
| 18, 345 | "Om du uppfyller 70-80% av kraven – sök ändå" | obelagt | Ingen källa. Formulera som ett råd utan procent ("uppfyller du skallkraven, sök"). | – |
| 329 | "Skicka på vardagar mellan 08:00-17:00 ... Din ansökan hamnar högre upp i inkorgen" | obelagt | Ingen källa, och de flesta ansökningar går via rekryteringssystem som inte sorterar som en inkorg. Stryk eller mjuka upp. | – |
| 90, 92 | "ökade återkommande köp med 30%", "från 78% till 91%" | OK | Tydligt märkta som formuleringsexempel, inte verkliga utfall. Ingen åtgärd. | – |

## Belagda påståenden
- Personligt brev-exempel för 89 yrken. Källa: `BREV_GALLERI` (89) i galleri-data.ts.
- Max en A4-sida. Arbetsförmedlingen: "Max en A4-sida är en bra längd". Källa: https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev
- Grammarly stöder svenska (ett av 24 språk utöver engelska). Källa: https://support.grammarly.com/hc/en-us/articles/115000090971
- Statistikmyndigheten (SCB) och fackförbundens lönestatistik är rimliga källor för löneanspråk.
- Verktyget matchar brevet mot annonsens krav. Källa: priser/page.tsx rad 259.

## Rättning (omgång 1, 2026-11-15)
- Rad 171–177 (fel): analysen "Varför fungerar det här exemplet?" omskriven efter brevet som faktiskt visas (Marcus Lindqvist, Telia): inledningen börjar med "Jag söker tjänsten som...", vilket nu sägs öppet med råd att byta mot en öppning från steg 3; mittdelen beskrivs med brevets egna siffror (kundportfölj 45 MSEK, 23 % ökning 2024); Telia-stycket (5G-lösningar för företag) och avslutningen beskrivs som de är. Introt "Observera hur varje del följer principerna ovan" ändrat till "det mesta sitter, men inte allt". Komponenten PersonligtBrevPreview är inte ändrad (delas av andra artiklar).
- Rad 255 (obelagt): "Efter att ha granskat tusentals personliga brev" ersatt med "Det här är de vanligaste misstagen vi ser".
- Rad 47 (obelagt): "tips från erfarna rekryterare" ändrat till "tips utifrån hur rekryterare läser".
- Rad 363, 365 (produkt): "färdigt personligt brev på 60 sekunder" ändrat till "ett första utkast på några minuter" (verktygets FAQ: två till fyra minuter), beskrivningen följer verktyget (CV + annons, svarar på annonsens krav med exempel ur CV:t). "börja få fler intervjuer redan denna vecka" struket; länken till /verktyg/personligt-brev kvar.
- Rad 18, 345 (obelagt): "70-80% av kraven – sök ändå" ersatt med "Uppfyller du skallkraven men inte allt det meriterande, sök ändå." i frontmatter-FAQ och FAQItem (tankstrecket försvann samtidigt).
- Rad 329 (obelagt): påståendet om 08:00-17:00 och "högre upp i inkorgen" ersatt med att tidpunkten spelar mindre roll när ansökan går via rekryteringssystem, och ett mjukt råd för direktmejl.
- Rad 90, 92: OK enligt granskaren, orörda.
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Underlagets rader för artikelbilden är oförändrade, bilden inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat mot PersonligtBrevPreview.tsx rad 88–107 (Marcus Lindqvist, Telia): brevet börjar med "Jag söker tjänsten som Account Manager B2B på Telia", andra meningen nämner sex års B2B-försäljning inom telekom och IT, mittstycket har kundportföljen på 45 MSEK och 23 % ökning 2024, Telia-stycket nämner 5G-lösningar för företag. Analysen beskriver nu exakt det brevet, och hänvisningen till steg 3 stämmer (steg 3 avråder från "söker härmed tjänsten som..."). Verktygsstycket stämmer med verktygssidan: välj eller ladda upp CV, klistra in annons, "Klart på några minuter". Erfarenhetspåståendena ("tusentals brev", "erfarna rekryterare"), procentsatsen 70–80 %, klockslagsrådet och intervjulöftet är borta. Frontmatter-FAQ och FAQItem säger samma sak. Inga tankstreck i ändrade rader.

Anmärkning: oändrade rader har kvar tankstreck med mellanslag: rad 13 och 334 ("När du är osäker – skicka alltid med") och rubriken på rad 224.

## Svar till samordnaren
personligt-brev-jobbansokan, GODKÄND, inga brister.

## Rättning omgång 2 (2026-11-15)
Artikeln var GODKÄND; bara tankstrecken från anmärkningen åtgärdade på samordnarens uppdrag.
- Rad 13 (frontmatter-FAQ) och rad 334 (FAQ-blocket): "När du är osäker – skicka alltid med." ändrat till "När du är osäker: skicka alltid med."
- Rubrik rad 224 före "## Personligt brev vs. CV i jobbansökan – Skillnaden", efter "## Personligt brev vs. CV i jobbansökan: skillnaden". Ingen intern länk pekar på ankaret.
- Underlaget för artikelbilden citerar inga ändrade rader; bilden inte omgjord. Inga " – " eller "—" kvar i filen.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 13 och 334 "När du är osäker: skicka alltid med." och rubriken rad 224 utan tankstreck; inga " – " eller "—" kvar i filen. FAQ lika.
