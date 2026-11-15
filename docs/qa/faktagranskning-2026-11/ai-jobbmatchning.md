# Faktagranskning: content/artiklar/ai-jobbmatchning.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, gratisnivån för jobbmatchningen anges fel på fyra ställen och matchningens takt beskrivs som löpande fast den körs nattligen; i övrigt håller artikeln.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20 (FAQ frontmatter), 118 (FAQ synlig) | "Hos oss får du tio matchade jobb gratis per sökning, utan kortuppgifter." | fel | Gratisnivån ser tre träffar per natt; Premium ger 25 träffar per nattlig körning. Ersätt med "Hos oss ser du dina tre bästa träffar gratis, utan kortuppgifter. Alla träffar varje natt ingår i Jobbcoach Premium." | src/lib/jobmatching/freeLimit.ts (FREE_TIER_JOB_LIMIT = 3, JOB_MATCHES_PER_RUN = 25); src/app/(public)/verktyg/jobbmatchning/page.tsx rad 197, 201, 319 |
| 56 | "Hos oss får du tio matchade jobb gratis per sökning, utan kortuppgifter." | fel | Som ovan: tre träffar gratis, matchningen körs varje natt (ingen "sökning" användaren startar). | freeLimit.ts |
| 96 | "tio matchade jobb per sökning kostar ingenting" | fel | Ersätt med "dina tre bästa träffar kostar ingenting". | freeLimit.ts |
| 88 | "**2. Kör matchningen och triagera.**" | obelagt (produkt) | Användaren kör inte matchningen själv; den nattliga matchningen levererar träffarna. Förslag: "Gå igenom nattens träffar och triagera." | freeLimit.ts ("per natt"), jobbmatchning/page.tsx rad 177 "Dagligen" |
| 76 | "även annonserna med oväntade titlar och de som publicerades för en timme sedan" | fel | Annonsbasen uppdateras dagligen och matchningen körs per natt; en annons från för en timme sedan kommer med först i nästa körning. Ersätt med "de som publicerades i går". | jobbmatchning/page.tsx rad 177, 200 ("Nya annonser in varje dag") |
| 33, 44, 110 | "missar aldrig nya annonser" / "missar inte annonsen som publicerades i går" | belagt med reservation | "i går" stämmer med daglig uppdatering; "aldrig" bör mjukas till "missar inte gårdagens annonser". | som ovan |

## Belagda påståenden
- Fyra steg: aktivera CV, extrahera yrkesdata, sök tusentals annonser, sorterat efter relevans: src/app/(public)/verktyg/jobbmatchning/page.tsx rad 101–124.
- Annonserna kommer från Arbetsförmedlingens annonsbas, Platsbanken är gratis: jobbmatchning/page.tsx rad 52; arbetsformedlingen.se.
- Arbetsförmedlingens råd om AI i jobbsökandet (AI som stöd, du styr innehållet med egna instruktioner, beskriv konkreta situationer): https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2024-10-02-lar-dig-anvanda-ai-i-jobbsokandet (sidan finns, 2024-10-02). Artikelns sammanfattning "behåll ägarskapet över innehållet och besluten" är en rimlig parafras, inte ett citat.
- Kollega-länken finns och handlar om AI i rekrytering: https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju

## Rättning (omgång 1, 2026-11-15)
- Rad 20 och 118 (FAQ "Kostar AI-jobbmatchning något?", frontmatter och synlig): rättat till "Hos oss ser du dina tre bästa träffar gratis, utan kortuppgifter. Alla träffar varje natt ingår i Jobbcoach Premium." Frågan oförändrad.
- Rad 56: rättat till att matchningen körs varje natt mot nya annonser och att de tre bästa träffarna är gratis.
- Rad 96: rättat till "dina tre bästa träffar kostar ingenting".
- Rad 88: omskrivet "Kör matchningen och triagera" till "Gå igenom nattens träffar och triagera" (fetstilt stegnamn i löptext, ingen rubrik).
- Rad 76: rättat "för en timme sedan" till "i går".
- Rad 33: "missar aldrig nya annonser" mjukat till "missar inte gårdagens annonser". Rad 44 ("den tröttnar aldrig", handlar om trötthet, inte annonsflödet) och rad 110 ("missar inte annonsen som publicerades i går") lämnade, de stämmer med daglig uppdatering.
- `updated: "2026-11-15"` tillagt. Description, rubriker och FAQ-frågor oförändrade.
- Bilden gjord om: underlagets grepp "Missar aldrig nya annonser" bytt till "Missar inte gårdagens annonser" (citerade rad 33). Alt oförändrad, imageAlt oförändrad.

## Andra granskningen (2026-11-15)
GODKÄND. Alla fyra gratisnivåfelen och nattlig körning rättade i brödtext, frontmatter-FAQ och synlig FAQ; stämmer med src/lib/jobmatching/freeLimit.ts (FREE_TIER_JOB_LIMIT 3, JOB_MATCHES_PER_RUN 25) och verktygssidan ("Alla 25 träffar varje natt ingår i Jobbcoach Premium"). Inga tio-träffar kvar, inga talstreck i ändrade rader, inga priser eller veckopaket.

## Svar till samordnaren
ai-jobbmatchning, GODKÄND.

## Produktsvep (2026-11-15)
- Steg 4 i flödet: "Hos oss körs matchningen varje natt mot nya annonser" ändrat till att nya annonser hämtas flera gånger per dygn och att matchningen görs när du öppnar sidan.
- FAQ "Vad kostar AI-jobbmatchning?" (frontmatter och FAQ-block): "Alla träffar varje natt ingår i Jobbcoach Premium" ändrat till "Med Jobbcoach Premium ser du dina 25 bästa." Frågan oförändrad.
- Veckoflödet punkt 2 (fetstil i löptext, ingen H2/H3): "Gå igenom nattens träffar och triagera" ändrat till "Gå igenom de nya träffarna och triagera".
- Bildunderlaget berörs inte; bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Produktsvepet stämmer med facit: annonser hämtas flera gånger per dygn och matchningen körs när sidan öppnas (inget "varje natt"/"nattens" kvar), gratis tre träffar och Premium 25 i brödtext, frontmatter-FAQ och FAQ-block (identiska). "Missar inte gårdagens annonser" och "publicerades i går" bärs av synk tre gånger per dygn. Inga talstreck i ändrade rader.
