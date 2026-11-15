# Faktagranskning: content/artiklar/cv-och-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln är mest råd men stycket på rad 36 bär en obelagd användarsiffra och en Arbetsförmedlingen-tillskrivning som inte går att belägga, och två produktpåståenden överdriver.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 36 | "På jobbcoach.ai har vi hjälpt över 10 000 arbetssökande att skapa både CV och personligt brev" | obelagt (produkt) | Siffran finns ingen annanstans i koden eller på sajten och kan inte bekräftas. Antingen tar saas-lead fram verkligt antal konton som skapat både CV och brev (exklusive ägare/testkonton enligt admin_undantagna_konton) och skriver det, eller så stryks meningen. Tills dess: stryk. | — |
| 36 | "En rekryterare lägger ofta bara 30 sekunder till en minut på ett CV vid första gallringen, enligt Arbetsförmedlingen" | obelagt | Ingen sådan uppgift hittad hos Arbetsförmedlingen (webbsökningsbudgeten tog slut innan en sista kontroll; AF:s CV-sidor som hämtades nämner ingen tid). Ersätt med den belagda siffran: "Ladders eye-tracking-studie från 2018 visade att rekryterare i snitt lägger 7,4 sekunder på en första genomläsning av ett CV." | Ladders 2018 (verifierat i dag) |
| 36 | "i många fall läses det personliga brevet bara om något i CV:t väcker frågor" | obelagt | Ingen källa. Stryk, eller skriv som erfarenhet utan generalisering ("en del rekryterare läser brevet först när CV:t väckt intresse"). | — |
| 14, 198 | "specialiserade verktyg (som jobbcoach.ai) som är tränade för just detta ändamål" | fel (produkt) | Vi tränar inga egna modeller; all AI kör Gemini (allmänna modeller) med våra egna instruktioner sedan 2026-06-12. Ersätt med "verktyg som är byggda för just detta ändamål". | intern: Gemini-migreringen, src/lib (AI-anrop) |
| 185 | "verktyg ... baserat på forskning och bästa praxis inom rekrytering" | obelagt (produkt) | Vagt men går inte att belägga för brev- och CV-verktygen. Stryk "forskning och", behåll "bästa praxis inom rekrytering". | — |

## Belagda påståenden
- Djupgående CV-analys är Premium; gratisnivån får en CV-analys med poäng och tyngsta fyndet (rad 189): `cv_analysis_full` kräver betald nivå i src/lib/access/features.ts; prissidan "en CV-analys som visar din poäng och det tyngsta fyndet".
- Premium ger CV-analysen fullt ut (rad 228): HELA_PAKETET_RADER i src/lib/plans/plans.ts ("Alla CV-mallar, CV-analysen, personliga brev och LinkedIn"); /priser är rätt länk. "Obegränsad" stämmer i sak (omkörningar obegränsade), ok.
- Brevverktyget tar CV och annons och ger ett utkast (rad 187): /verktyg/personligt-brev.
- Exemplet med 143 %, 450 000 kr och 2,3 miljoner kr (rad 167) är märkt som exempel på en redigerad CV-punkt, inte ett påstått verkligt resultat. OK.
- "Många arbetsgivare använder ATS-system som matchar på nyckelord" (rad 125): i sak förenligt med Arbetsförmedlingen 2026-02-10 om AI-läsning av CV, https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig

## Rättning (omgång 1, 2026-11-15)
- Rad 36 "hjälpt över 10 000 arbetssökande" (obelagt, produkt): struket enligt samordnarens beslut.
- Rad 36 "30 sekunder till en minut ... enligt Arbetsförmedlingen" (obelagt): ersatt med Ladders 2018 (7,4 sekunder i en första genomläsning av ett CV), med länk till studien i texten.
- Rad 36 "i många fall läses det personliga brevet bara om något i CV:t väcker frågor" (obelagt): omskrivet till "En del rekryterare läser brevet först när CV:t har väckt intresse." Stycket avslutas nu med vad det betyder för läsaren (vart dokument måste klara sig självt, ihop ska de berätta samma historia).
- Rad 14, 198 (fel, produkt): "tränade för just detta ändamål" ersatt med "byggda för just detta ändamål" i FAQ-svaret i frontmatter och i FAQ-blocket. I samma rader byttes ett befintligt tankstreck ("anpassa – infoga") mot kolon.
- Rad 185 (obelagt): "forskning och" struket.
- updated: "2026-11-15" tillagt.
- Rubriker/FAQ-frågor/description: oförändrade. Bild: ej omgjord (underlaget berörs inte). Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. 10 000-siffran och Arbetsförmedlingen-tillskrivningen borta, Ladders 2018 (7,4 s) med rätt länk, "tränade" ersatt med "byggda", "forskning och" struket, talstrecket i de ändrade FAQ-raderna bytt mot kolon. Anmärkning utan krav: rad 17/203 kopplar "att rätt nyckelord finns med" till CV-analysen; analysen tar bara emot CV:t, så "tydliga nyckelord för yrket" vore säkrare om raden ändå ska röras.
