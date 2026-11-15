# Faktagranskning: content/artiklar/skriva-cv-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikelns två siffror (6–7 sekunder och 75 % ATS) är båda hämtade från en konkurrentsajt (cvmall.se) i stället för förstahandskällor. Den ena ska rättas och den andra strykas.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 36, 12, 210, 222 | "rekryterare skummar varje CV på 6-7 sekunder (cvmall.se)" | fel (källa och precision) | Förstahandskällan är Ladders eye-tracking: 7,4 sekunder i genomsnitt för första genomläsningen (2018). 6 sekunder var 2012-versionen. "Varje CV" generaliserar ett genomsnitt. Skriv "i genomsnitt drygt 7 sekunder på en första genomläsning (Ladders, 2018)" och ta bort hänvisningen till cvmall.se. | Ladders 2018 (verifierad av samordnaren i dag) |
| 44, 16, 230 | "över 75% av de större svenska arbetsgivarna numera använder ATS-system (cvmall.se)" | obelagt | Ingen förstahandskälla, och siffran liknar den kända 75 %-myten (Preptel 2012) om andelen CV som sorteras bort. Belagda uppgifter som kan ersätta den: Jobscan 2026, 97,4 % av Fortune 500 (USA), och Experis 2023, 28 % av svenska arbetsgivare använder AI i rekryteringen. Stryk den svenska procentsiffran. | https://www.jobscan.co/blog/fortune-500-use-applicant-tracking-systems/ |
| 44 | "sorteras bort, ofta innan en människa ens läst det" | obelagt | Det bygger på samma myt. Skriv "kan sorteras och rangordnas av systemet innan en rekryterare läser". | – |
| 169 | "färdiga exempel för 70+ yrken" | obelagt (inaktuellt) | Det är 89 yrken, och artikeln säger själv 89 på rad 40. Skriv 89. | `CV_GALLERI` (89) i galleri-data.ts |

## Belagda påståenden
- CV-analysen ger en ATS-poäng från 0 till 100, och en analys är gratis. Källa: src/app/(public)/verktyg/cv-analys/page.tsx rad 42 och 87, layout.tsx rad 13; `CV_ANALYSIS_LIMIT = 1`.
- Curriculum vitae är latin för "levnadslopp". Detta är allmän etymologi.
- CV-exempel för 89 yrken (rad 40). Källa: galleri-data.ts.
- Länkade sidor finns: /funktioner, /verktyg/cv-analys, /cv-exempel. Källa: src/app/(public).

## Rättning (omgång 1, 2026-11-15)
- Rad 36, 12, 210, 222 (fel, källa och precision): "skummar varje CV på 6-7 sekunder (cvmall.se)" rättat till "i genomsnitt drygt 7 sekunder på en första genomläsning", med Ladders ögonrörelsestudie (2018) länkad på rad 36 och angiven på rad 222. Hänvisningarna till cvmall.se borta. Rad 210 har "på några sekunder". Frontmatter-FAQ och brödtextens svar säger samma sak.
- Rad 44, 16, 230 (obelagt): "över 75% av de större svenska arbetsgivarna" struket. Rad 44 anger nu Jobscan 2026 (närmare 98 % av Fortune 500, länkad) och att ATS är vanligt hos större arbetsgivare även i Sverige; rad 16 och 230 säger samma sak utan procentsiffra.
- Rad 44 (obelagt): "sorteras bort, ofta innan en människa ens läst det" ändrat till "kan ... sorteras och rangordnas av ett ATS-system innan en rekryterare läser det".
- Rad 169 (inaktuellt): "70+ yrken" ändrat till "89 yrken".
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden citerar inga ändrade meningar, bilden inte omgjord. Inga interna länkar försvann.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Svep efter CV-analysens annonsmatchning: "eller matchar jobbannonsen" struket.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: hänvisningarna till cvmall.se och 75 %-siffran är borta överallt; "drygt 7 sekunder" stämmer med Ladders 2018 (7,4 s) och står likadant i frontmatter-FAQ, FAQItem och ingressen; Jobscan 2026 anger 97,4 % av Fortune 500 ("närmare 98 procent"); "89 yrken" stämmer med CV_GALLERI. CV-analysen beskrivs inte längre som att den matchar jobbannonsen (rad 199), vilket stämmer med att analysen bara tar emot CV:t. Ingen motsägelse mellan FAQ och FAQ-block. Inga tankstreck i ändrade rader.

Anmärkning, ej underkännande: "vanligt hos större arbetsgivare även i Sverige" (rad 17, 45, 231) saknar svensk källa, se samma anmärkning i cv-mall-gratis-guide.

## Svar till samordnaren
skriva-cv-guide, GODKÄND, inga brister.

## Tredje kontrollen (2026-11-15)
GODKÄND. Omgång 2 ("eller matchar jobbannonsen" struket, rad 199) stämmer med facit. ATS-poäng 0-100 stämmer. Inga talstreck i ändrade rader, FAQ och FAQ-block lika. Anmärkningen om svensk källa för "vanligt hos större arbetsgivare även i Sverige" står kvar från andra granskningen.
