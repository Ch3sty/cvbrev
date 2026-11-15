# Faktagranskning: content/artiklar/ats-vanligt-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, Teamtailors kundantal är fel och ett Arbetsförmedlingen-råd samt systemens sektorsplacering saknar stöd i de angivna källorna.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 14 (frontmatter), 82, 165 (FAQ) | "uppemot 10 000 svenska kundföretag" / "Svenskt, uppemot 10 000 svenska kundbolag" | fel | Teamtailor anger "fler än 13 000 företag världen över", inte 10 000 svenska. Skriv "Svenskt system med fler än 13 000 kundföretag världen över". (Kollega 2025 skrev "mer än 10 000 arbetsgivare" globalt.) | https://www.teamtailor.com/en-us/about |
| 20 (frontmatter), 177 (FAQ) | "Arbetsförmedlingens linje är dessutom att nyckelord du inte kan backa upp med konkreta situationer uppfattas som oärliga" | obelagt | Den citerade AF-artikeln säger inte det. Den skriver: "Det handlar inte om att överdriva eller hitta på – utan om att beskriva din erfarenhet och kompetens på ett tydligt, konkret och relevant sätt." Citera det i stället (och gör om tankstrecket enligt skrivreglerna). | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig |
| 14 (frontmatter), 84–98 (tabell), 165 | "Visma Recruit är vanligast i kommuner och offentlig sektor", "Varbi ... myndigheter, regioner, universitet", "ReachMee ... Del av Talentech, brett spritt i offentlig verksamhet" | obelagt | Den angivna källan BusinessWith säger inget om vilka sektorer systemen används i och nämner inte ReachMee (den anger dessutom Teamtailor till "8000st företag världen över", inaktuellt). Mjuka upp till "vanligt i offentlig sektor" eller hitta leverantörernas egna kundsidor; stryk BusinessWith som källa för sektorsuppgifterna. | https://businesswith.se/ats-system/ |

## Belagda påståenden
- Arbetsförmedlingen 2026-02-10: ATS som "avancerad sökmotor" som jämför kompetenser och nyckelord mot kravprofilen; undvik tabeller, grafik, symboler och specialtecken; algoritmer har svårt för vaga formuleringar; standardrubriker; skriv ut förkortningar; nyckelkompetenser tidigt.
- Kollega 28 augusti 2025: "omkring 40 procent" av Teamtailors kunder har aktiverat AI-funktionerna (Teamtailors David Wennergren); TRR:s Jesper Olsson kallar arbetsgivarnas tystnad om AI-användningen "ganska kontroversiellt": https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju
- AI-förordningen (EU) 2024/1689 klassar AI för rekrytering och urval som högrisk (bilaga III punkt 4).
- "75 procent sorteras bort" behandlas korrekt som amerikansk mytbild (Preptel 2012, ingen källa).
- Produkt: /verktyg/cv-analys finns; gratisnivån ger poäng och det tyngsta fyndet, de fullständiga förbättringsförslagen kräver Premium (cv_analysis_full i src/lib/access/features.ts). Meningen på rad 153 lovar inte uttryckligen gratis, så den håller.

## Rättning (omgång 1, 2026-11-15)
- Rad 14, 82, 165 (Teamtailor "uppemot 10 000 svenska kundföretag"): rättat till "fler än 13 000 kundföretag världen över" (kontrollerat på teamtailor.com/en-us/about 2026-11-15: "Used by 13,000+ companies around the world"). "dominerar" mjukat till "är stort". Teamtailor-sidan tillagd i källraden.
- Rad 20, 177 (Arbetsförmedlingens linje om oärliga nyckelord): ersatt med AF:s faktiska formulering som referat, utan tankstreck: det handlar inte om att överdriva eller hitta på, utan om att beskriva erfarenhet och kompetens tydligt, konkret och relevant.
- Rad 14, 84–98, 165 (sektorsplacering): mjukat till "vanligt" (Visma Recruit "Vanligt i kommunsektorn", Varbi "Vanligt i offentlig sektor och vid akademiska tjänster", ReachMee "vanligt i offentlig verksamhet"); FAQ-svaret säger att systemen är vanliga i offentlig sektor. BusinessWith struken ur källraden.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Teamtailor: "Used by 13,000+ companies around the world" (teamtailor.com/en-us/about) bär rad 15, 83 och 166. Arbetsförmedlingens ord ("Det handlar inte om att överdriva eller hitta på – utan om att beskriva din erfarenhet och kompetens på ett tydligt, konkret och relevant sätt") återges korrekt som referat utan tankstreck på rad 21 och 178. Sektorsuppgifterna är mjukade till "vanligt" och BusinessWith är borta ur källraden. CV-analysen (rad 154) beskrivs inte som en jämförelse mot en annons. Inga talstreck i ändrade rader.
