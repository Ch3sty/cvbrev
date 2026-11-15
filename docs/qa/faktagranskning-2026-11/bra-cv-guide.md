# Faktagranskning: content/artiklar/bra-cv-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, två statistiksiffror är fel eller överdrivna, mallantalet är fel och en kommaregel är otydlig. Strukturen och råden håller.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 56, 261 | "58% av rekryterare avvisar CV med grammatikfel direkt" / "58% av rekryterare avvisar CV med uppenbara stavfel eller grammatikfel direkt" | fel (generaliserar) | Siffran kommer från CareerBuilders undersökning bland 2 076 amerikanska anställande chefer, maj–juni 2013. 58 % nämnde CV med stavfel (typos) bland misstagen som får dem att direkt sortera bort en kandidat. Grammatikfel ingår inte, och det är inte "rekryterare" i allmänhet. Ersätt med: "I en amerikansk undersökning från CareerBuilder (2013) svarade 58 % av de anställande cheferna att stavfel i CV:t kan räcka för att de sorterar bort en kandidat direkt." Eller stryk siffran. | https://www.prnewswire.com/news-releases/careerbuilder-releases-study-of-common-and-not-so-common-resume-mistakes-that-can-cost-you-the-job-223251611.html |
| 215 | "75% av större företag använder ATS-system som scannar CV:n efter nyckelord innan en människa läser dem" | obelagt | Ingen källa för 75 %, och siffran liknar myten om att 75 % av CV:n sorteras bort av ATS (Preptel 2012, ingen källa). Belagd ersättning: "97,8 % av Fortune 500-bolagen använde ett rekryteringssystem 2025 (Jobscan)". För Sverige: "28 % av svenska arbetsgivare använde AI i rekryteringen 2023 (Experis)". Stryk också "scannar ... innan en människa läser dem": de flesta system sorterar och söker men avvisar inte automatiskt på nyckelord. | https://www.jobscan.co/blog/fortune-500-use-applicant-tracking-systems/ |
| 118 | "erbjuder jobbcoach.ai 8 professionella CV-mallar" | fel (produkt) | Vi har 41 CV-mallar, varav 3 gratis. Ersätt med "41 CV-mallar, tre av dem gratis". | src/lib/cv/template-antal.ts (TEMPLATE_COUNT = 41, FREE_TEMPLATE_COUNT = 3) |
| 266 | "Kommafel: 'Jag arbetade med försäljning, marknadsföring och kundservice' (komma före 'och' i uppräkningar)" | fel (otydligt) | Exemplet är rätt, men parentesen läses som en regel om att man ska sätta komma före "och". På svenska sätts normalt inget kommatecken före "och" i en uppräkning (Språkrådet, Svenska skrivregler). Föreslagen text: "(inget komma före 'och' i uppräkningar)". | Språkrådet, Svenska skrivregler, https://www.isof.se/sprakradet |
| 101–102 | "Civilekonom, Handelshögskolan / Stockholms Universitet" | fel (i exempel) | Handelshögskolan i Stockholm är en egen högskola, inte en del av Stockholms universitet. Exemplet är illustrativt, men kombinationen ser fel ut för svenska läsare. Skriv "Civilekonom, Handelshögskolan i Stockholm" eller "Civilekonom, Stockholms universitet". | https://www.hhs.se |
| 257 | "Ladda ner gratis CV-mallar här" | obelagt (produkt, oprecist) | Gratisnivån har 3 mallar och en nedladdning. Föreslagen text: "Börja med en av våra gratis CV-mallar". | src/lib/cv/template-antal.ts (FREE_CV_EXPORTS = 1), src/app/(public)/priser/page.tsx |

## Belagda påståenden
- Ladders eye-tracking 2018: 7,4 sekunder i första granskningen (rad 54): Ladders Eye-Tracking Study 2018 (verifierad i dag av samordnaren).
- CV-analysen ger svar på 60 sekunder och bedömer struktur, innehåll, nyckelord och ATS (rad 394): src/app/(public)/verktyg/cv-analys/page.tsx och cv-analys-faq-data.ts ("mellan 30 och 60 sekunder"). Den fullständiga analysen är Premium, gratisnivån ger poäng och det tyngsta fyndet. Texten "detaljerad analys" kan läsas som att allt ingår gratis. Överväg "poäng och det viktigaste att åtgärda direkt, hela analysen i Premium".
- Exempel-CV:na (Sofia Bergström, Anna Svensson, RetailChain m.fl.) är märkta som exempel.

## Rättning (omgång 1, 2026-11-15)
- Rad 261 (58 %): rättat till CareerBuilder-undersökningen: "I en amerikansk undersökning från CareerBuilder (2013) svarade 58 % av de anställande cheferna att stavfel i CV:t kan räcka för att de sorterar bort en kandidat direkt." Rad 56: siffran struken, ersatt med "Redan ett stavfel kan räcka för att ett CV sorteras bort, mer om det längre ner."
- Rad 215 (75 % ATS): struket. Ersatt med Jobscans aktuella siffra, kontrollerad mot källan i dag: 97,4 % av Fortune 500-bolagen 2026 (granskarens 97,8 % gällde 2025, sidan är uppdaterad). "Scannar ... innan en människa läser dem" struket; ny text säger att rekryteraren kan söka och sortera på nyckelord.
- Rad 118: rättat till "41 CV-mallar ..., tre av dem gratis" (src/lib/cv/template-antal.ts).
- Rad 266: rättat till "(inget komma före "och" i uppräkningar)".
- Rad 101–102: exemplet ändrat till "Civilekonom" / "Handelshögskolan i Stockholm | 2012 – 2016".
- Rad 257: omskrivet till "Börja med en av våra [gratis CV-mallar](/verktyg/cv-mallar), som är byggda för läsbarhet." Länken kvar.
- Belagt-notering rad 394 (CV-analysen): förtydligat att gratis ger poäng och det viktigaste att åtgärda, hela analysen i Premium, svar inom en minut.
- FAQ "Hur vet jag om mitt CV är bra nog?" (frontmatter och FAQ-block): "analysera CV:t mot jobbannonsen" ändrat till "jämföra CV:t med jobbannonsen", eftersom CV-analysen inte tar emot någon annons. Frågan oförändrad.
- Källrad skapad sist i artikeln: Ladders 2018, CareerBuilder 2013, Jobscan.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget citerar inga ändrade meningar, bilden inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rättningarna från omgång 1 håller mot källorna: Jobscan "In 2026, we detected an ATS for 97.4% of Fortune 500 companies" och sidan säger inte att systemen avvisar automatiskt (https://www.jobscan.co/blog/fortune-500-use-applicant-tracking-systems/); CareerBuilder/Harris 2013, 2 076 amerikanska anställande chefer och HR-personer, "Resumes that have typos – 58 percent" bland misstag som får dem att direkt sortera bort (prnewswire-länken); 41 mallar varav 3 gratis (src/lib/cv/template-antal.ts); kommaregeln, Handelshögskolan i Stockholm, gratismallarna och CV-analysens gratis/Premium-uppdelning rättade; FAQ identisk i frontmatter och block; källraden finns. Inga talstreck i ändrade rader.
- Rad 159: "[Använd vår CV-analys](/verktyg/cv-analys) som jämför ditt CV mot jobbannonsen och visar exakt vad du ska lägga till." Problem: produktfel, CV-analysen tar bara emot CV:t och jämför inte mot någon annons. Omgång 1 rättade samma fel i FAQ:n men missade brödtexten. Krav: skriv om utan annonsjämförelse eller stryk meningen. Källa: känd produktfakta, src/app/(public)/verktyg/cv-analys/page.tsx.
- Rad 236: "[Analysera ditt CV mot en jobbannons här](/verktyg/cv-analys) så ser du exakt vilka termer du behöver lägga till." Problem: samma produktfel. Krav: stryk "mot en jobbannons" och löftet om vilka termer som saknas mot annonsen, till exempel "jämför själv CV:t med annonsens ord" eller länka utan annonslöfte. Källa: som ovan.
- Rad 380: "Använd [vår CV-analys](/verktyg/cv-analys) för att se hur väl ditt CV matchar jobbannonsen. Du får konkreta förslag på vilka nyckelord som saknas ..." Problem: samma produktfel. Krav: stryk matchningen mot jobbannonsen och nyckelord som saknas mot annonsen. Källa: som ovan.

## Svar till samordnaren
bra-cv-guide, UNDERKÄND, rad 159, 236 och 380 säger fortfarande att CV-analysen jämför CV:t mot jobbannonsen, vilket den inte gör.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Rad 159, 236, 380: CV-analysen beskrivs utan annonsjämförelse.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 159, 236 och 380 beskriver nu CV-analysen utan annonsjämförelse; annonsens ord stäms av av läsaren själv. Rad 395 (poäng och det viktigaste gratis, hela analysen i Premium, svar inom en minut) stämmer med facit. FAQ identiska, inga talstreck.
