# Faktagranskning: content/artiklar/exempel-pa-cv-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Ladders-studien återges med den gamla siffran och en ofullständig lista. Allt annat är råd eller tydligt illustrativa exempel.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20, 86, 398 | "I rekryteringsföretaget The Ladders ögonrörelsestudie tog det i snitt sex sekunder … Omkring 80 procent av den tiden gick till namn, nuvarande titel, datum och utbildning." | fel (inaktuellt och ofullständigt) | Sex sekunder kommer från 2012-studien. Uppföljningen 2018 visar i snitt 7,4 sekunder. I 2012-studien gick 80 % av tiden till sex uppgifter: namn, nuvarande titel och företag, föregående titel och företag, start- och slutdatum för nuvarande och föregående tjänst, samt utbildning. TheLadders är en jobbsajt och inte ett rekryteringsföretag. Ersätt med "Jobbsajten TheLadders ögonrörelsestudie (2018) visar att rekryteraren i snitt tittar 7,4 sekunder på ett CV i första genomläsningen". Om 80 %-uppgiften behålls ska den anges som 2012 och med hela listan. | TheLadders Eye-Tracking Study 2012 och 2018 (theladders.com). 7,4 s redan verifierat av samordnaren. |

## Belagda påståenden
- "CV-exempel för 89 yrken": CV-galleriet har 89 yrken (src/app/(public)/exempel/components/galleri-data.ts, CV_GALLERI).
- Länkade exempel (säljare, sjuksköterska, ekonomiassistent, projektledare, butikssäljare) finns, både som CV och som brev.
- /verktyg/skapa-cv, /verktyg/cv-mallar, /verktyg/cv-analys och de länkade artiklarna finns.
- Exempel-CV:n (Handelshögskolan, Coop Nära Kungsholmen, SASSE, TechCorp) är tydligt illustrativa och påstås inte vara verkliga personer.
- "[CV-mallar] ger dig gratis mallar att utgå från" stämmer: 3 gratis mallar (src/lib/cv/template-antal.ts).

## Rättning (omgång 1, 2026-11-15)
- Rad 20, 86, 398 (fel, inaktuellt): rättat till "Jobbsajten TheLadders ögonrörelsestudie från 2018 ... i snitt 7,4 sekunder". 80-procentsuppgiften behållen men angiven som 2012 års studie och med hela listan över de sex uppgifterna. "Rekryteringsföretaget" ändrat till "jobbsajten". FAQ i frontmatter och FAQ-blocket i brödtexten säger samma sak.
- Källrad tillagd sist: TheLadders 2018 (samma PDF-länk som övriga artiklar använder) och HR Dive (länken svarar 200).
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget citerar inga ändrade meningar, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND. Siffrorna stämmer: 7,4 sekunder 2018 (HR Dive, 8 nov 2018), och i 2012 års studie gick nästan 80 % av tiden till sex uppgifter, med den lista som står i artikeln (TheLadders pressmeddelande 2012).
- Rad 21, 87 och 399 med källraden rad 408: 2012-uppgiften (80 procent, sex uppgifter) står i FAQ och brödtext men har ingen källa i källraden, som bara anger 2018-studien och HR Dive. Ingen av dem belägger 80-procentsuppgiften. Krävs: lägg till 2012-källan, till exempel https://www.prnewswire.com/news-releases/theladders-reveals-that-job-seekers-have-six-seconds-to-succeed-143629046.html. Obs: theladders.com-PDF:en svarar 403 för automatiska hämtningar. En spegel finns på https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf.

## Rättning omgång 2 (2026-11-15)
- Källraden (rad 408): lagt till 2012-källan, [TheLadders om studien från 2012 (pressmeddelande)](https://www.prnewswire.com/news-releases/theladders-reveals-that-job-seekers-have-six-seconds-to-succeed-143629046.html). Kontrollerad: sidan svarar 200, 21 mars 2012, "recruiters spent almost 80% of their resume-review time" på namn, nuvarande titel/företag, föregående titel/företag, start- och slutdatum för båda tjänsterna och utbildning. Brödtext och FAQ (rad 21, 87, 399) oförändrade, de stämmer med källan.
- Rubriker, FAQ, description oförändrade; ingen citerad rad ändrad, bilden inte omgjord. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND. 2012-källan (prnewswire, 21 mars 2012) finns i källraden och svarar; den bär 80-procentsuppgiften och de sex uppgifterna i FAQ och brödtext. FAQ identiska, inga talstreck.
