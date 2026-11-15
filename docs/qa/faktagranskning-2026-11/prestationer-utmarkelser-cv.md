# Faktagranskning: content/artiklar/prestationer-utmarkelser-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK, källhänvisningarna stämmer och siffrorna står i tydligt märkta exempel; en liten precisering föreslås.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 93 | "Årets säljare, Elgiganten region Mellansverige, högst kundnöjdhet av 120 säljare" | obelagt (illustrativt) | Exemplet är märkt som uppställningsexempel, men använder ett verkligt företag och en specifik utmärkelse som inte går att belägga. Byt till ett fiktivt företagsnamn ("Elkedjan AB") för att inte påstå något om Elgigantens utmärkelser. Samma för "Handelskammarens utbildningsfond" (rad 95), som inte hittas som stipendiegivare. | – |

## Belagda påståenden
- Rad 40: Arbetsförmedlingen råder att beskriva erfarenheter specifikt "med arbetsuppgifter, ansvar, metoder och kompetenser": https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig
- Akavia-länken råder att fokusera på resultat i ansökan ("När du beskriver dina erfarenheter, fokusera på resultat"): https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/
- Rad 82: guiden om handlingsord har 120 verb (content/artiklar/handlingsord-cv.mdx, titel).
- Rad 110: CV-analysen pekar ut svaga punkter (granskar kvantifiering och nyckelord) och CV-verktyget har förbättringsfunktion (src/app/api/cv/generate-improved): stämmer i stort.

## Rättning (omgång 1, 2026-11-15)
- Rad 93/95: verkliga namn i uppställningsexemplet bytta mot påhittade: "Elgiganten" blev "Elkedjan AB", "Handelskammarens utbildningsfond" blev "Elkedjans utbildningsfond".
- `updated` tillagt. Rubriker, FAQ och description oförändrade. Underlaget citerar inte raderna, bilden gjordes inte om.

## Andra granskningen (2026-11-15)
UNDERKÄND.

- Rad 94: "Årets säljare, Elkedjan AB region Mellansverige, högst kundnöjdhet av 120 säljare | 2025". Ersättningsnamnet är ett verkligt företag: Elkedjan (Svenska Elkedjan AB) är Sveriges största rikstäckande kedja av elinstallatörer, grundad 1966. Exemplet tillskriver nu ett verkligt bolag en påhittad utmärkelse, alltså samma problem som med Elgiganten. Krävs: ett namn som uppenbart är fiktivt och inte finns som varumärke (sök namnet före bytet), t.ex. en platshållare som "[Företaget] AB". Källa: https://www.elkedjan.se/om-oss/ , https://sv.wikipedia.org/wiki/Elkedjan
- Rad 96: "Stipendium ur Elkedjans utbildningsfond". Samma problem, följer med namnbytet ovan.

## Rättning omgång 2 (2026-11-15)
- Rad 94 och 96: "Elkedjan AB" och "Elkedjans utbildningsfond" bytt till "Exempelkedjan AB" och "Exempelkedjans utbildningsfond". Sökning på "Exempelkedjan AB" och "Exempelkedjan" mot bolags- och varumärkesuppgifter ger inget bolag eller varumärke; namnet förekommer bara som uttryckligt fiktivt exempel (Livsmedelsverkets kontrollwiki) och som smyckeskedjetyp. Namnet är uppenbart påhittat.
- Ingen rubrik, FAQ eller description ändrad. Bildunderlaget citerar inte raderna, bilden ej omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Rad 94 och 96 säger nu "Exempelkedjan AB" och "Exempelkedjans utbildningsfond"; inga verkliga namn (Elgiganten, Elkedjan, Handelskammaren) kvar i artikeln. Namnet är uppenbart påhittat och i ett märkt uppställningsexempel.
- Inga andra ändrade rader utom updated. Inga talstreck i ändrade rader. Produktmeningen på rad 111 (CV-analysen pekar ut svaga punkter, formuleringshjälp i CV-verktyget) är oförändrad och motsäger inte facit.
