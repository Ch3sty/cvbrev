# Faktagranskning: content/rekryterare/hitta-kandidater-sourcing.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, ett enda statistiskt påstående (LinkedIns passiva kandidater) är överdrivet och dåligt källbelagt; resten är resonemang och produktuppgifter som stämmer.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 30 | "LinkedIns återkommande talangundersökningar landar år efter år i samma storleksordning: bara omkring en fjärdedel till en tredjedel ... söker aktivt ..., medan en stor majoritet, ofta kring 70 procent, är öppen för rätt erbjudande utan att leta" | fel | 70-procentsiffran kommer från LinkedIns Talent Trends 2015 och avser alla passiva kandidater, inklusive de "super passive" som inte vill bli kontaktade. Andelen som är passiv men öppen för kontakt är lägre (i LinkedIns segmentering är "explorers" knappt hälften). Tidigare LinkedIn-material (2012) angav 80/20. Ersätt med: "I LinkedIns Talent Trends 2015 sökte ungefär 30 procent aktivt. Resten var passiva, och de flesta av dem var öppna för att prata om rätt erbjudande." Ange år. | LinkedIn 2012: https://www.linkedin.com/business/talent/blog/talent-acquisition/passive-talent-infographic ; 2015-siffran via sekundära källor (sökbudgeten slut, originalrapporten ej öppnad) |
| 13 | "i storleksordningen två tredjedelar till tre fjärdedelar av arbetskraften" (passiva) | obelagt | Samma som ovan: ange en mätning med år i stället för ett spann som inte finns i någon enskild källa. | Som ovan |
| 70 | Källrad: "LinkedIn Talent Solutions undersökningar om aktiva och passiva kandidater" → https://business.linkedin.com/talent-solutions | fel (länk) | Länken går till LinkedIns säljsida, som inte innehåller siffrorna. Länka till den faktiska rapporten eller infografiken. | – |

## Belagda påståenden
- Egen kandidatpool: verifierade resultat, villkor synliga, anonymt tills kandidaten tackar ja, kandidaten har själv valt att synas (rad 17, 44): src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts.
- TNG beskriver hur rekryterare söker fram kandidater på LinkedIn, även de som inte söker aktivt (källrad 70). https://www.tng.se/soka-jobb/linkedinprofil-tips/
- Samtycke krävs för att spara kandidatprofiler för framtida roller (rad 19, 40) är förenligt med GDPR (rättslig grund krävs, samtycke är den normala vid kandidatpool). Detaljerna hänvisas till insikten om GDPR.

## Rättning (omgång 1, 2026-11-15)
- Rad 30: "återkommande talangundersökningar ... en fjärdedel till en tredjedel ... ofta kring 70 procent är öppen" rättat till en daterad mätning: LinkedIn Global Talent Trends 2015, 30 procent aktiva, 70 procent passiva, med LinkedIns tre passiva grupper (eget nätverk, öppen för rekryterare, vill inte byta) och 2014 års 25/75. Kontrollerat själv i rapporten på SlideShare. Påståendet att en stor majoritet är öppen för erbjudanden struket; tillagt att mätningen är över tio år gammal.
- Rad 13 (FAQ-svaret): "två tredjedelar till tre fjärdedelar" ersatt med 2015 års 70/30 och "många av de passiva var öppna för att prata med en rekryterare". Brödtexten har inget FAQ-block.
- Rad 70 (källraden): länken till LinkedIns säljsida bytt mot Global Talent Trends 2015-rapporten (slideshare.net/slideshow/linkedins-2015-global-talent-trends-report/56753405). 2012-infografiken som granskaren nämnde används inte, eftersom artikeln nu bara citerar 2015.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Ingen artikelbild med underlag.

## Andra granskningen (2026-11-15)
GODKÄND. LinkedIn Global Talent Trends 2015 kontrollerad på SlideShare: 70 procent passiva och 30 procent aktiva 2015, 75/25 2014, de tre passiva grupperna (Reaching out to personal network, Open to talking to a recruiter, Completely satisfied) stämmer med texten. "Många av de passiva var öppna för att prata med en rekryterare" saknar totalsiffra i huvudrapporten men landsversionerna av samma undersökning ligger kring 40 procent av alla tillfrågade, så "många" håller. Källlänken byttes rätt. Inga talstreck.

## Svar till samordnaren
hitta-kandidater-sourcing, GODKÄND.
