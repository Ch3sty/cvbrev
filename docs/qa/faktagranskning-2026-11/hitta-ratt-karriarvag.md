# Faktagranskning: content/artiklar/hitta-ratt-karriarvag.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Statistiken saknar källa, en RIASEC-klassning är fel, Framtid.se:s "validerad forskning" är tveksam, och två interna länkar saknar /artiklar/-prefix och ger 404.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 50 | "Hälften av svenska anställda säger sig vara öppna för att byta jobb, enligt återkommande mätningar från bland annat HRnytt och Chef." | obelagt | Ingen mätning hittad. HRnytt och Chef är tidningar som rapporterar andras undersökningar. Stryk eller ersätt med en namngiven undersökning (utgivare och år). | – |
| 83 | RIASEC-tabellen: "Konventionell (C) … jurist" | fel | Advokat och jurist har Holland-koden Enterprising–Investigative (E/I) i O*NET och är inte Konventionell. Flytta jurist till Företagsam eller byt mot ett C-yrke, t.ex. redovisningsekonom eller löneadministratör. | O*NET OnLine 23-1011.00 Lawyers, Interests: Enterprising, Investigative (onetonline.org) |
| 97 | "Framtid.se bygger sitt yrkestest på Enneagrammet med stöd i validerad forskning." | obelagt | Framtid.se gick inte att hämta (403). Enneagrammet saknar stöd som validerat psykometriskt instrument i forskningen, så "med stöd i validerad forskning" ska strykas även om Framtid.se själva skriver så. | – |
| 79, 95, 15, 33 | "Arbetsförmedlingens gratis Intresseguide … bygger på RIASEC" | obelagt (ej nådd förstahandskälla) | Sannolikt korrekt (Intresseguiden bygger på Hollands teori), men Arbetsförmedlingens sida gick inte att nå i den här omgången (404 på testade URL:er). Kontrollera att guiden finns kvar och länka den. | – |
| 98 | "Allastudier … baserat på Hollands matchningsteori" | obelagt | Inte verifierat i den här omgången. | – |
| 52, 150 | Länken `/byta-karriar-jobbsokande-guide` | (länk) fungerar via redirect | Har en permanent redirect till /artiklar/ i next.config.ts. Byt ändå till direktlänk. | next.config.ts |
| 50 | Länken `/angest-jobbet-dags-att-byta` | fel (död länk) | Ingen redirect och ingen route, ger 404. Rätt: `/artiklar/angest-jobbet-dags-att-byta`. | next.config.ts, src/app/(public) |
| 118 | Länken `/utbildning-omskolning-karriarbyte` | fel (död länk) | Ingen redirect, ger 404. Rätt: `/artiklar/utbildning-omskolning-karriarbyte`. | som ovan |

## Belagda påståenden
- Studentum: "Testet har 60 frågor där du svarar ja eller nej." (https://www.studentum.se/yrkestest)
- RIASEC är John Hollands modell med sex intressetyper (Holland 1959/1997). Övriga yrkesexempel i tabellen är rimliga huvudkoder.
- Maria-exemplet (rad 67) är tydligt märkt som en illustration ("Så kan en kartläggning se ut") och har inget mätt resultat. OK.
- SYV på Komvux och högskolor är kostnadsfritt (allmänt känt).
- /verktyg/jobbmatchning, /verktyg/jobbcoachen och /verktyg/cv-analys finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 50 (obelagt, "Hälften av svenska anställda"): siffran och tillskrivningen till HRnytt och Chef strukna, ersatta med ett kvalitativt påstående utan siffra.
- Rad 83 (fel, jurist som Konventionell): jurist flyttad till Företagsam (E), Konventionell (C) fick löneadministratör i stället.
- Rad 97 (obelagt, Framtid.se): "med stöd i validerad forskning" struket. Kontrollerat via sökning att Framtid.se:s yrkestest bygger på Enneagrammet; tillagt att Enneagrammet inte är lika väl prövat i forskningen som RIASEC och bör ses som inspiration.
- Rad 15, 17, 33, 47, 79, 95, 160, 164 (Intresseguiden bygger på RIASEC): Intresseguiden finns kvar (arbetsformedlingen.se/for-arbetssokande/vilket-yrke-passar-dig/intresseguide), men varken Arbetsförmedlingens sidor eller SU-uppsatsen om RIASEC på Arbetsförmedlingen belägger att just Intresseguiden bygger på RIASEC. Omskrivet överallt till att Intresseguiden ger yrkesförslag utifrån intressen, med RIASEC som separat modell. "Ligger till grund för Intresseguiden" (rad 79) ersatt med O*NET som exempel. "De flesta svenska yrkestester" ändrat till "många yrkestester". FAQ i frontmatter, FAQ i brödtexten och HowTo-steget säger samma sak.
- Rad 98 (obelagt, Allastudier och Hollands teori): Allastudiers testsida nämner inte Holland; "det senare baserat på Hollands matchningsteori" struket.
- Rad 50 och 118 (döda länkar): ändrade till /artiklar/angest-jobbet-dags-att-byta och /artiklar/utbildning-omskolning-karriarbyte. Rad 52 och 150: /byta-karriar-jobbsokande-guide ändrad till direktlänk /artiklar/byta-karriar-jobbsokande-guide.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade (HowTo-stegets namn oförändrat). Bildunderlaget berörs inte, bilden inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Intresseguiden: tolv frågor ger yrkesförslag utifrån intressen (arbetsformedlingen.se). Framtid.se bygger testet på Enneagrammet. O*NET använder RIASEC. Juristflytten stämmer. Länkarna har nu prefixet /artiklar/. Inga siffror utan källa finns kvar.
