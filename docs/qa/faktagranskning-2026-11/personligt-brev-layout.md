# Faktagranskning: content/artiklar/personligt-brev-layout.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, en lästidssiffra saknar källa och en konkurrentsajt används som auktoritet; resten är formråd.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 41 | "Rekryterare lägger i genomsnitt 6-10 sekunder på att skanna ett personligt brev" | obelagt | Ingen studie om lästid för personliga brev hittad. Den belagda siffran gäller CV: Ladders eye-tracking 2018, i genomsnitt 7,4 sekunder i första genomläsningen av ett CV. Stryk, eller skriv "Rekryterare bestämmer sig snabbt; för CV:t visar Ladders eye-tracking 2018 i snitt 7,4 sekunder i första genomläsningen." | Ladders Eye-Tracking Study 2018 (theladders.com), redan verifierad i omgången |
| 41 | "Karriärsajten cvmall.se anger en lästid på runt 90 sekunder för hela ansökan." | obelagt | cvmall.se är en konkurrent utan redovisad undersökning bakom siffran; inget förstahandsunderlag. Stryk meningen (vi bör inte heller lyfta konkurrentens sajt som auktoritet). | https://cvmall.se/personligt-brev (ingen källa anges för siffran) |
| 151–152 | "Vissa ATS-system (Applicant Tracking System) har problem med färg" | obelagt | Ingen leverantörsdokumentation hittad om att färgad text stör parsning; problemen gäller tabeller, textrutor, bilder och sidhuvuden. Stryk punkten eller skriv "Färg påverkar sällan systemets läsning, men håll dig till mörk text på vit bakgrund för läsbarhetens skull." | – |
| 187, 209 | "Mindre filstorlek" (PDF) / "Större filstorlek" (Word) | obelagt | Stämmer inte generellt; en textbaserad .docx är ofta lika liten eller mindre än motsvarande PDF. Stryk båda punkterna. | – |

## Belagda påståenden
- "Se alla 30+ yrkesexempel" (rad 405): galleriet har 89 brevexempel (src/app/(public)/exempel/components/galleri-data.ts, BREV_GALLERI), så "30+" stämmer men undersäljer; överväg "nästan 90".
- Länkarna /personligt-brev-exempel/ekonomiassistent, /saljare, /student och /verktyg/personligt-brev finns som rutter.
- .pages-filer öppnas inte direkt i Windows utan Apple-program (rad 331): allmänt känt, inget att rätta.

## Rättning (omgång 1, 2026-11-15)
- Rad 41, "6-10 sekunder på att skanna ett personligt brev": struket. Omskrivet till att det saknas mätning för brev, med den belagda CV-siffran från Ladders ögonrörelsestudie 2018 (i snitt 7,4 sekunder i första genomläsningen) och länk till studien.
- Rad 41, cvmall.se och "90 sekunder": struket.
- Rad 151–152, "Vissa ATS-system har problem med färg" och "applicantsystem": omskrivet till "Färg påverkar sällan hur ett rekryteringssystem läser brevet, men mörk text på vit bakgrund är lättast för ögat" och "Lägg aldrig brödtexten i färg, bara namnet eller rubrikerna".
- Rad 187 och 209, "Mindre filstorlek" / "Större filstorlek": strukna.
- Rad 405 (valfritt): "Se alla 30+ yrkesexempel" ändrat till "Se nästan 90 yrkesexempel".
- `updated: "2026-11-15"` tillagt. Rubriker, FAQ, description oförändrade. Bilden inte berörd. Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Den obelagda lästiden 6-10 sekunder och cvmall.se-siffran strukna; Ladders 2018 (7,4 sekunder i första genomläsningen av CV) korrekt avgränsad till CV. ATS-färgpåståendet och filstorlekspunkterna borta. "Nästan 90 yrkesexempel" stämmer med BREV_GALLERI (89 poster). Inga talstreck i ändrade rader.

## Svar till samordnaren
personligt-brev-layout, GODKÄND.
