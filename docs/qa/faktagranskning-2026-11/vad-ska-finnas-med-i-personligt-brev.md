# Faktagranskning: content/artiklar/vad-ska-finnas-med-i-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Två uppgifter tillskrivs Indeed Sverige felaktigt: ordantalet är fel och sekundsiffran går inte att hitta hos Indeed. Resten är råd.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 31, 231 | "ofta 200 till 400 ord enligt Indeed Sverige" / "Indeed Sverige anger 200 till 400 ord som riktmärke, vilket motsvarar ungefär en halv till en hel A4" | fel | Indeed Sverige skriver "Någonstans mellan 250–400 ord är att rekommendera" (sidan om brev på engelska). Indeeds längdsida anger "cirka en halv A4-sida och aldrig mer än en hel A4-sida" och "som mest fem stycken", men inget ordantal. Ersätt med "250 till 400 ord" och "en halv, högst en hel A4-sida". Rad 231 ("Under 200 ord hinner du sällan …") justeras därefter. | https://se.indeed.com/karriarrad/cv-personligt-brev/personligt-brev-engelska ; https://se.indeed.com/karriarrad/cv-personligt-brev/langd-personligt-brev |
| 43 | "enligt Indeed Sverige lägger en rekryterare i snitt 30 till 60 sekunder på första genomläsningen" | obelagt | Varken Indeeds längdsida eller sidan om brev till rekryterare innehåller någon sådan siffra. Det enda som hittas är jobbcoach.ai:s egna artiklar (cirkulär källa). Stryk tillskrivningen och siffran, eller skriv "rekryteraren skummar brevet först". | se ovan |
| 157 | "en logik som de flesta svenska karriärsidor, från Akavia till Vision, är överens om" | obelagt (delvis) | Akavias tredelade struktur (varför du söker, vad du kan bidra med, avslutning) stämmer. Vision har inte verifierats, och "de flesta svenska karriärsidor" generaliserar. Skriv "som Akavia beskriver det". | https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/ |

## Belagda påståenden
- Max en A4-sida och högst fem stycken (Indeed Sverige, längdsidan).
- Akavias tredelning: varför du söker, vad du bidrar med, avslutning (akavia.se).
- "Se 30+ yrkesexempel": brevgalleriet har 89 yrken, så påståendet stämmer (src/app/(public)/exempel/components/galleri-data.ts, BREV_GALLERI).
- Exempelbreven (Klimatbyrån, Ericsson-projektet, Anna Lindgren) är tydligt illustrativa formuleringsexempel och påstås inte vara verkliga.
- Interna länkar finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 31 och 231 (fel, ordantal): rättat till 250 till 400 ord (Indeed Sverige, sidan om brev på engelska, kontrollerat) och längden till "ungefär en halv A4-sida, aldrig mer än en hel" (Indeeds längdsida, kontrollerat). Följdmeningen på rad 231 omskriven ("Med mycket färre ord än så hinner du sällan ...").
- Rad 43 (obelagt, 30 till 60 sekunder): tillskrivningen och siffran strukna, omskrivet till "rekryteraren skummar oftast brevet först och avgör då om det är värt att läsa noga". Kontrollerat att Indeeds längdsida saknar sekunduppgift.
- Rad 157 (delvis obelagt): "de flesta svenska karriärsidor, från Akavia till Vision" ändrat till "en övergripande logik, och Akavia beskriver den väl".
- Källrad tillagd sist: Indeed Sverige (två sidor) och Akavia.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. FAQ-svaret om längd (max en A4, 3–5 stycken) stämmer redan med källan. Bildunderlaget berörs inte, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND. Rättningarna stämmer: Indeed anger 250–400 ord på sidan om brev på engelska och säger att råden är desamma på svenska. Längdsidan anger en halv A4-sida och aldrig mer än en hel. Sekundsiffran och Vision är borta, och Akavias tredelning stämmer.
- Rad 297: "Vi hjälper dig med utkastet på 60 sekunder." Produkttiden är inte belagd i koden. Det är samma fynd som rättades till "på någon minut" i skriva-personligt-brev-med-ai och vad-ar-en-jobbcoach, men här missades det i första granskningen. Krävs: "på någon minut".

## Rättning omgång 2 (2026-11-15)
- Rad 297: "Vi hjälper dig med utkastet på 60 sekunder." -> "Vi hjälper dig med utkastet på någon minut." (samma formulering som i skriva-personligt-brev-med-ai och vad-ar-en-jobbcoach). Inga andra "60 sekunder" i artikeln.
- Rubriker, FAQ, description oförändrade. Raden citeras inte i underlaget; bilden inte omgjord. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 297 lyder "på någon minut", samma som i övriga brevartiklar och förenligt med koden. Inga fler tidsangivelser om produkten, inga talstreck.
