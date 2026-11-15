# Faktagranskning: content/rekryterare/lonehistorik.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Förbudet och läget i Sverige stämmer. Återgivningen av Sinha (2022) lägger till detaljer som inte står i studiens sammanfattning.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 44, 17 | "De med stark löneutveckling berättar självmant, övriga avstår" | obelagt | Sinhas sammanfattning säger att benägenheten att frivilligt berätta om lönehistoriken minskade, och med 2 procentenheter mer bland kvinnor. Att det är "de med stark löneutveckling" som berättar står inte där. Det är möjligen modellens förutsägelse, men det är inte verifierat. Skriv "färre berättade frivilligt, och kvinnor avstod i högre grad än män", eller kontrollera i fulltexten. | https://arxiv.org/abs/2202.03602 |
| 42, 13 | "minskade könslönegapet bland jobbytare med omkring två procentenheter" | obelagt (precision) | Sammanfattningen anger att gapet minskade med 2 procentenheter, drivet nästan helt av att kvinnors löner steg, men utan att begränsa det till jobbytare. Jobbytare nämns bara i samband med att kopplingen mellan nuvarande och framtida lön försvagades. Stryk "bland jobbytare", eller belägg det med fulltexten. | Samma |
| 42 | "Flera andra amerikanska studier ... störst effekter för just jobbytare, kvinnor och minoriteter" | obelagt | Ingen källa anges. Lägg till en (till exempel Bessen, Meng & Denk 2020, som inte kontrollerades i dag) eller stryk meningen. | – |
| 26, 40 | "redan förbjuden i stora delar av USA" / "sedan 2017 ... en lång rad delstater" | obelagt (ej kontrollerat) | Sannolikt korrekt (de första förbuden trädde i kraft 2017), men artikeln anger ingen källa. Lägg till en källa eller ett antal delstater med datum. | – |

## Belagda påståenden
- Art. 5.2 i direktiv 2023/970 förbjuder arbetsgivaren att fråga om lönehistorik från nuvarande eller tidigare anställningar, utan storlekströskel. DO: "Du som arbetsgivare får inte fråga en arbetssökande om vilken lön den har från en anställning hos en annan arbetsgivare." Källa: https://www.do.se/for-arbetsgivare-och-utbildningsanordnare/lonetransparens-och-jamstallda-loner/de-kommande-reglerna-om-lonetransparens-for-arbetsgivare
- Sverige stoppade genomförandet i mars 2026, och förbudet är inte svensk lag. Källa: regeringen 26 mars 2026 och DO (se granskningen av lonetransparensdirektivet-rekrytering).
- Sinha 2022: gapet minskade med 2 procentenheter, nästan helt genom högre löner för kvinnor, och kvinnor minskade sitt frivilliga berättande 2 procentenheter mer än män. Källa: arXiv 2202.03602.
- Kandidatpoolen samlar ingen lönehistorik, och löneförväntan används bara som filter och visas aldrig. Källa: src/lib/recruiter/candidateData.ts rad 15 och 991, poolSearch.ts rad 253–255. Kandidater utan angiven förväntan inkluderas också, se nyansen i granskningen av lonetransparensdirektivet-rekrytering.

## Rättning (omgång 1, 2026-11-15)
- Rad 44 och 17 (obelagt): "De med stark löneutveckling berättar självmant, övriga avstår" struket i brödtext och FAQ. Ersatt med det Sinhas sammanfattning säger (kontrollerad 2026-11-15): frivilligt berättande minskade, och 2 procentenheter mer bland kvinnor; slutsatsen formulerad som att den som berättar är ett urval. "systematiskt vinklad" ändrat till "vinklad".
- Rad 42 och 13 (obelagt, precision): "bland jobbytare" struket ur gapsiffran i brödtext och FAQ. Jobbytare nämns nu bara där sammanfattningen gör det (svagare koppling mellan nuvarande och framtida lön).
- Rad 42 (obelagt): "Flera andra amerikanska studier ..." ersatt med en namngiven studie, Bessen, Meng & Denk (2020), kontrollerad via Boston Universitys sammanfattning: högre löneökningar för jobbytare under förbud, störst för kvinnor och afroamerikaner. "minoriteter" ändrat till "afroamerikaner". Källan tillagd i källraden.
- Rad 26, 40 (obelagt): "sedan 2017 ... en lång rad delstater" ersatt med "Massachusetts antog det första förbudet 2016, och i maj 2024 hade 22 delstater och 23 städer och kommuner infört någon form av salary history ban" (Wikipedia, Salary history bans, tillagd i källraden). Rad 26 ("stora delar av USA") behållen, nu belagd av samma källa.
- Rad 64 (produktnyans från granskningen av lonetransparensdirektivet-rekrytering): "rekryterare möter bara kandidater vars förväntan ligger inom rollens spann" ändrat till "budgetfiltret sållar bort kandidater vars förväntan ligger över rollens spann".
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Ingen bild. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 41 och källraden rad 69: "Massachusetts antog det första förbudet 2016, och i maj 2024 hade 22 delstater och 23 städer och kommuner infört någon form av salary history ban" med källan "[Wikipedia om salary history bans i USA](https://en.wikipedia.org/wiki/Salary_history_bans)". Uppgifterna stämmer med Wikipedia, men det finns bättre källor. Krävs: (1) Massachusetts-delen beläggs med lagen själv, Acts of 2016 Chapter 177 "An Act to Establish Pay Equity", godkänd 1 augusti 2016 (https://malegislature.gov/Laws/SessionLaws/Acts/2016/Chapter177). (2) Antalet beläggs med en löpande juridisk förteckning, till exempel HR Dive "A running list of states and localities that have outlawed pay history questions" (https://www.hrdive.com/news/salary-history-ban-states-list/516662/), som i dag anger 22 delstatsförbud och 24 lokala förbud. Uppdatera talen och datumet efter den källan och ta bort Wikipedia ur källraden.

Kontrollerat utan anmärkning: Sinhas sammanfattning (arXiv 2202.03602) bär gapet på 2 procentenheter "driven almost entirely by an increase in female earnings", den försvagade kopplingen "especially among job-changers", och att frivilligt berättande minskade "by 2 p.p. more among women". Bessen, Meng & Denk (BU, 2020): jobbytares lön steg 5–6 % mer, kvinnors 8–9 % och afroamerikaners 13–16 % mer, så "störst för kvinnor och afroamerikaner" stämmer. Produktmeningen om budgetfiltret stämmer med poolSearch.ts. Inga tankstreck i ändrade rader.

## Svar till samordnaren
lonehistorik, UNDERKÄND, Wikipedia som källa för de amerikanska förbuden ska bytas mot Massachusetts lag (Acts of 2016 ch. 177) och HR Dives löpande förteckning, med talen uppdaterade efter den.

## Rättning omgång 2 (2026-11-15)
- Rad 41: "Massachusetts antog det första förbudet 2016, och i maj 2024 hade 22 delstater och 23 städer och kommuner infört ..." ändrat till "Massachusetts antog det första delstatsförbudet i sin lag om lika lön i augusti 2016, och enligt HR Dives löpande förteckning (uppdaterad april 2026) har 22 delstater och 24 lokala myndigheter, som städer och countyn, infört ...". Kontrollerat: HR Dive anger "State-wide Bans: 22", "Local Bans: 24", "UPDATED: April 28, 2026". Acts of 2016 ch. 177 "An Act to Establish Pay Equity" godkänd 1 augusti 2016 och förbjuder att efterfråga lönehistorik (malegislature.gov svarade inte vid hämtning; uppgifterna bekräftade via sökresultat och Massachusetts AG:s vägledning).
- Källraden: Wikipedia borttagen; Massachusetts Acts of 2016, Chapter 177 och HR Dives förteckning tillagda.
- Ingen rubrik, FAQ-fråga eller description ändrad. Ingen bild berörd.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Bristen från andra granskningen är åtgärdad: Wikipedia är borta ur källraden (rad 69), och Massachusetts lag (Acts of 2016 ch. 177) och HR Dives förteckning står där i stället.
- Rad 41 kontrollerad: HR Dive anger "State-wide Bans: 22", "Local Bans: 24" och "UPDATED: April 28, 2026", vilket stämmer med "22 delstater och 24 lokala myndigheter ... (uppdaterad april 2026)". Lagen undertecknades 1 augusti 2016 (mass.gov, "The new Massachusetts equal pay law"), och flera juridiska källor (Holland & Knight, Lexology, CNN Money 2 augusti 2016) beskriver den som den första delstatslagen mot frågan. "det första delstatsförbudet ... i augusti 2016" håller. Ikraftträdandet var 1 juli 2018, men artikeln säger "antog" och inte "trädde i kraft", så formuleringen säger inte mer än källorna.
- Snabbkontroll: inga tankstreck i tillagda rader. FAQ (rad 14 och 18) stämmer med brödtexten om Sinha. Produktmeningen på rad 65 är oförändrad sedan andra granskningen.
