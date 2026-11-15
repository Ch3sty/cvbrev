# Faktagranskning: content/artiklar/referenser-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, en statistiksiffra saknar källa och citeras från en sajt som inte har den, och ett citat från en namngiven HR-chef ser påhittat ut. Resten av artikeln är råd och går att behålla.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 57, 62, 68 | "87 procent av svenska rekryterare föredrar det upplägget enligt cvmall.se" / "Enligt undersökningar föredrar 87% av svenska rekryterare ..." | obelagt (källan har inte siffran) | cvmall.se:s referenssida innehåller ingen procentsats och ingen undersökning. Ingen annan källa hittades. Stryk siffran på alla tre ställena och behåll rådet utan statistik. | https://cvmall.se/skriva-cv/referenser-cv/ (kontrollerad 2026-11-15, ingen siffra) |
| 255 | "Som Karin Johansson, HR-chef på ett större svenskt företag, uttrycker det: 'När en kandidat har förberett sina referenser väl märks det direkt ...'" | påhittat | En namngiven person utan företag och utan källa, med ett citat som inte går att spåra. Stryk citatet, eller skriv om det som vårt eget råd utan namn. | Ingen källa |
| 76, 107, 270 | "rekryterare värderar vanligtvis referenser i cv från de senaste 3-5 åren högst" | obelagt | Ingen undersökning hittades. Skriv om som råd: "Välj helst referenser från dina senaste anställningar." Stryk "rekryterare värderar ... högst". | Ingen källa |

Notering (ingen åtgärd krävs): rad 57 och 237 säger att listan oftast lämnas ut efter den andra intervjun. cvmall.se säger samma sak ("vanligtvis i slutet av processen, efter den andra intervjun"), men det är en kommersiell sajt och inte en undersökning. Rad 239 i samma artikel säger "efter den första eller andra intervjun", vilket är den försiktigare formuleringen. Överväg att använda den på alla ställen.

Notering 2: exemplet på referenslista (rad 231–232) använder Linköpings universitets riktiga växelnummer (013-28 10 00) och en @liu.se-adress för den påhittade personen "Maria Svensson". Byt till ett uppenbart fiktivt nummer och en fiktiv domän, så att ingen ringer växeln eller mejlar en verklig person.

## Belagda påståenden
- Referenser tas oftast sent i processen, när du är en av slutkandidaterna (rad 23, 73, 237–240): cvmall.se, "kontaktas bara om arbetsgivaren seriöst överväger att anställa dig", https://cvmall.se/skriva-cv/referenser-cv/ (sekundärkälla).
- Länkarna /verktyg/skapa-cv, /verktyg/cv-mallar och /verktyg/cv-analys finns (src/app/(public)/verktyg/). CV-analysen "gratis" (rad 263) stämmer med gratisnivån: en analys med poäng och det tyngsta fyndet.

## Rättning (omgång 1, 2026-11-15)
- Rad 57, 62, 68 (87 procent, cvmall.se): struket på alla tre ställen. Snabbsvaret förklarar i stället varför upplägget är bra (skyddar referenserna, ger kontroll), rad 62 säger att rådet i dag är att använda standardfrasen, rad 68 behåller rådet utan siffra.
- Rad 255 (Karin Johansson-citatet): struket. Omskrivet till vårt eget råd utan namn och citat ("Förarbetet märks i samtalet ...").
- Rad 76, 107, 270 (3-5 år, "rekryterare värderar ... högst"): omskrivet till rådet "Välj dessutom helst referenser i cv från dina senaste anställningar", "som sett dig arbeta i dina senaste anställningar" och "från dina senaste anställningar eller uppdrag" (parentesen om 3-5 år struken).
- Notering 1: "efter den andra intervjun" ändrat till "efter den första eller andra intervjun" i snabbsvaret och under H2 "När ska du lämna ut referenslistan?".
- Notering 2: exempelreferensen Maria Svensson flyttad till fiktiv "Exempelhögskolan", telefon 031-390 06 50 (PTS fiktionsserie), e-post maria.svensson@exempelhogskolan.se.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rättningarna från omgång 1 håller: 87 procent borta på alla tre ställen, Karin Johansson-citatet borta och ersatt med vårt eget råd utan namn, 3-5 år borta på alla ställen, "första eller andra intervjun" konsekvent (rad 58, 238, 240), exempelreferensen flyttad till fiktiv Exempelhögskolan med nummer i PTS fiktionsserie 031-390 06 00–99. Inga talstreck i ändrade rader.
- Rad 264: "Använd vår **[CV-analys](/verktyg/cv-analys)** gratis för att få feedback på innehåll och matchning mot drömjobbet." Problem: produktfel som första granskningen missade. CV-analysen tar bara emot CV:t, ingen jobbannons, och kan inte bedöma matchning mot ett visst jobb. Krav: stryk "och matchning mot drömjobbet", till exempel "gratis för att få en poäng och det viktigaste att åtgärda i ditt CV". Källa: känd produktfakta (CV-analysen tar bara emot CV:t), src/app/(public)/verktyg/cv-analys/page.tsx.

## Svar till samordnaren
referenser-cv, UNDERKÄND, rad 264 lovar att CV-analysen ger "matchning mot drömjobbet", men den tar bara emot CV:t och jämför inte mot något jobb.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Rad 264: "matchning mot drömjobbet" struket.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Rad 264 lyder nu "Använd vår CV-analys gratis för att få feedback på innehållet." "Matchning mot drömjobbet" är struket, och meningen stämmer med facit (CV-analysen läser bara CV:t, gratis en analys per konto).
- Rättningarna från omgång 1 står kvar (87 procent, Karin Johansson-citatet och 3-5 år borta, "första eller andra intervjun", Exempelhögskolan). Inga talstreck i ändrade rader. Inga produktpåståenden om Word-export eller mallantal som motsäger facit.
