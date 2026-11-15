# Faktagranskning: content/rekryterare/vad-kostar-en-rekrytering.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, källorna stämmer i stort men LinkedIns gratisannons pausas efter 14 dagar, inte 21, och tidsposterna saknar källa.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 40 | "LinkedIn tillåter en kostnadsfri annons i taget (pausas efter 21 dagar)" | fel | En kostnadsfri annons är aktiv i upp till 14 dagar och pausas sedan; marknadsförs den inte stängs den automatiskt efter 30 dagar. Ersätt med "(pausas efter 14 dagar och stängs efter 30 om den inte marknadsförs)". | https://www.linkedin.com/help/linkedin/answer/a516864/lagg-upp-ett-gratis-jobb-pa-linkedin?lang=sv |
| 5, 13, 17, 42, 76 | "50-150 timmar internt", "i branschkalkyler" | obelagt | Ingen branschkalkyl hittad eller angiven. Ange källan eller skriv om som egen uppskattning ("vår uppskattning: 50–150 timmar"). | Ingen |
| 17, 105 | "ett par till nästan sex tusen kronor per dag", "i branschkalkyler" | obelagt | Ingen källa i artikeln; hänvisar till insikten om vakanskostnad. Ange källan där eller markera som räkneexempel. | Ingen |
| 107 | "landar för en vanlig tjänstemannaroll på drygt 700 000 kr" | obelagt | Egen kalkyl i en annan insikt; inte granskad i denna omgång. Kontrollera när vad-kostar-en-felrekrytering granskas. | Ingen |

## Belagda påståenden
- Byråarvode 15–30 % av bruttoårslönen, exempel 500 000 kr ger 75 000–150 000 kr (rad 5, 11, 32): https://www.rekryteringsbolag.se/artiklar/vad-kostar-det-att-anlita-en-rekryteringsbyra-1106 (branschsajt, sekundärkälla; formuleringen "i branschöversikter" är rimlig).
- Platsbanken kostar inget och annonsen visas även i Eures och jobbsöktjänster (rad 13, 40): https://arbetsformedlingen.se/for-arbetsgivare/kom-igang-med-din-rekrytering/annonsera-i-platsbanken
- LinkedIn: högst en kostnadsfri annons aktiv åt gången (rad 13, 40): LinkedIn hjälpsida ovan.
- Svenskt Näringslivs rekryteringsenkät 2025/2026: 66 % upplever det som svårt att rekrytera, en av fyra rekryteringar (25 %) misslyckas helt (rad 17, 107): https://www.svensktnaringsliv.se/sakomraden/utbildning/rekryteringsenkaten-var-fjarde-rekrytering-misslyckas_1249139.html
- Vår kandidatpool visar verifierade testresultat och kandidatens villkor (rad 50): rekryterarsidans FAQ (src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts): "verifierade testresultat med percentiler ... villkor som tillträde, arbetsplats och omfattning". Lönespann visas inte, vilket texten inte heller påstår.

## Rättning (omgång 1, 2026-11-15)
- Rad 40 (fel): LinkedIns gratisannons rättad till "pausas efter 14 dagar och stängs efter 30 om den inte marknadsförs". Källan finns redan i källraden.
- Rad 5, 13, 17, 42, 76 (obelagt): 50-150 timmar markerat som vår egen uppskattning ("enligt vår uppskattning", tabellen "Uppskattningsvis 50-150 timmar"). "i branschkalkyler" struket på rad 42.
- Rad 17, 105 (obelagt): "i branschkalkyler ... ett par till nästan sex tusen kronor per dag" ersatt med ett öppet räkneexempel (omsättning per anställd delat med arbetsdagar, 1,5 Mkr ger knappt 7 000 kr per arbetsdag, halverat flera tusen). FAQ-svaret rad 17 säger samma sak i kortform. Länken till vakanskostnadsinsikten kvar.
- Rad 107 (obelagt, 700 000 kr): lämnad oförändrad enligt granskarens anvisning, siffran är en hänvisning till vår egen felrekryteringskalkyl som kontrolleras när den insikten granskas.
- description ändrad (innehöll den obelagda tidsuppgiften som fakta):
  - före: "Byråarvode på 15-30 procent av årslönen, annonsvägen med 50-150 timmar intern tid, eller egen sourcing. Verkliga prisspann och när varje väg är rätt val."
  - efter: "Byråarvode på 15-30 procent av årslönen, annonsvägen med uppskattningsvis 50-150 timmar intern tid, eller egen sourcing. Prisspann och när varje väg passar." (156 tecken)
- `updated: "2026-11-15"` tillagt. Inga rubriker eller FAQ-frågor ändrade. Insiktsbilden ligger utanför artikelbildsunderlaget och berördes inte.

## Andra granskningen (2026-11-15)
UNDERKÄND. Rättningarna stämmer mot källorna: LinkedIn "En kostnadsfri platsannons är aktiv i upp till 14 dagar ... Om jobbet inte marknadsförs stängs det automatiskt efter 30 dagar"; Svenskt Näringsliv 2025/2026 "Två av tre företag, 66 procent, upplever att det är svårt att rekrytera" och "En av fyra rekryteringar, 25 procent, misslyckas helt"; 1,5 Mkr delat på ca 220 arbetsdagar ger ca 6 800 kr, så "knappt 7 000" håller; 50-150 timmar är nu märkt som vår uppskattning överallt, även i description. Två brister:
- Rad 43 och FAQ rad 14, "Med en chefstimkostnad på ett par-tre hundra kronor blir bara tidsposten 15 000-45 000 kr": uppenbart för lågt antagande som första granskningen missade. Redan en månadslön på 45 000 kr ger med arbetsgivaravgift 31,42 % ca 360 kr i timmen före semester och pension, och en chefslön ligger normalt högre. Kalkylen underskattar därmed tidsposten. Krävs: ange antagandet öppet (lön plus påslag) och räkna om, till exempel 500-700 kr i timmen ger 25 000-105 000 kr för 50-150 timmar, eller stryk kronbeloppet. Källa: Skatteverket, arbetsgivaravgifter 31,42 %, https://www.skatteverket.se/foretag/arbetsgivare/arbetsgivaravgifterochskatteavdrag/arbetsgivaravgifter.4.233f91f71260075abe8800020817.html
- FAQ rad 18 (frontmatter och FAQ-block), "räknat på omsättning per anställd lätt flera tusen kronor per arbetsdag": "lätt" utan villkor säger mer än räkneexemplet på rad 106, som bara gäller ett bolag med 1,5 Mkr i omsättning per anställd. Krävs: "räknat på omsättning per anställd ofta flera tusen kronor per arbetsdag" eller samma villkor som i brödtexten.

## Svar till samordnaren
rekryterare-vad-kostar-en-rekrytering, UNDERKÄND, chefstimkostnaden "ett par-tre hundra kronor" (och därmed 15 000-45 000 kr) är uppenbart för låg och FAQ:ns "lätt flera tusen kronor per arbetsdag" säger mer än räkneexemplet.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Chefstimkostnaden och 15 000-45 000 kr strukna (brödtext och FAQ), nu kvalitativt "lätt flera tiotusentals kronor" räknat på timkostnad inkl. arbetsgivaravgifter; FAQ:ns "flera tusen kronor per arbetsdag" ersatt med hänvisning till räkneexemplet i vakanskostnad.

## Tredje kontrollen (2026-11-15)
GODKÄND. Chefstimkostnaden och 15 000-45 000 kr är strukna i brödtext (rad 43) och FAQ (rad 14), som nu säger samma sak. FAQ rad 18 hänvisar till räkneexemplet i vakanskostnad i stället för det obetingade "lätt flera tusen kronor". Inga talstreck i ändrade rader.

Anmärkning, ej underkännande: "lätt flera tiotusentals kronor" (rad 14 och 43) är en egen kvalitativ uppskattning. Vid 50 timmar och 400-500 kr i timmen blir det 20 000-25 000 kr, alltså i underkant av "flera tiotusentals". "ofta tiotusentals kronor" vore säkrare.
