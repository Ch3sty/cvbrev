# Faktagranskning: content/rekryterare/time-to-hire.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, de svenska siffrorna från Level Recruitment stämmer men det internationella riktmärket är ett time-to-fill-tal som presenteras som time-to-hire, i en artikel vars poäng är att hålla isär dem.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 13, 40 | "internationella benchmarks (bland annat SHRM) brukar ange drygt 40 dagar som genomsnittlig time-to-hire" | fel | Drygt 40 dagar är time-to-fill, inte time-to-hire. SHRM:s benchmark (Talent Access) anger cirka 44 dagars median time-to-fill, definierat som tiden från öppnad rekvisition till accepterat erbjudande. Den angivna källan (HRbench) nämner inte SHRM och anger median time-to-hire 24 dagar och median time-to-fill 43 dagar. Ersätt med: "Amerikanska benchmarks anger runt 40-45 dagars time-to-fill (SHRM) och runt 24 dagars time-to-hire (HRbench)". | https://www.hrbench.com/resource/learn/time-to-hire ; https://www.shrm.org/content/dam/en/shrm/executive-network/insights/Talent-Access-Report-TOTAL.pdf (SHRM-siffran via sekundära sammanställningar, PDF:en ej genomläst) |
| 72 | Källrad: "SHRM:s benchmarkdata om time-to-hire (via HRbench)" | fel | HRbench-sidan innehåller HRbench:s egna data, inte SHRM:s. Byt källtext eller länk. | Som ovan |

## Belagda påståenden
- Sök- och urvalsfasen omkring 6-8 veckor (rad 13, 40): Level Recruitment, "omkring 6-8 veckor". https://levelrecruitment.se/blogg/hur-lang-tid-tar-egentligen-en-rekryteringsprocess/
- Uppsägningstid en till tre månader (rad 13, 42): Level Recruitment, samma sida.
- Processtart 5-6 månader före tillträde (rad 13, 42): Level Recruitment, "ca 5-6 månader innan kandidaten ska börja".
- Egen kandidatpool med verifierade testresultat (rad 62): src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts (verifierade resultat, första försöket räknas).
- Svenskt Näringslivs rekryteringsenkät 2025/2026 finns och är rätt länkad (rad 72), men artikeln hämtar inget tal från den.

## Rättning (omgång 1, 2026-11-15)
- Rad 13 (FAQ-svaret) och rad 40: "drygt 40 dagar som genomsnittlig time-to-hire (SHRM)" rättat till HRbench:s medianer, 24 dagars time-to-hire och 43 dagars time-to-fill (kontrollerat direkt på HRbench-sidan 2026-11-15). SHRM-tillskrivningen struken, eftersom SHRM-PDF:en inte är genomläst och HRbench inte nämner SHRM. Rad 40 fick en mening om att jämföra samma mått.
- Rad 72 (källraden): "SHRM:s benchmarkdata om time-to-hire (via HRbench)" bytt till "HRbench om time-to-hire och time-to-fill", samma länk.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Insikten har ingen artikelbild med underlag; inget gjort om.

## Andra granskningen (2026-11-15)
GODKÄND. HRbench-sidan kontrollerad: "The national median sits at 24 days" (time-to-hire) och "Median time to fill is 43 days". "Amerikanska" bärs av sidans dollarbelopp och "national median", sidan säger inte USA uttryckligen men slutsatsen är rimlig. SHRM-tillskrivningen borta, källraden stämmer, FAQ och brödtext säger samma sak. Inga talstreck.

## Svar till samordnaren
time-to-hire, GODKÄND.
