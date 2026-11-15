# Faktagranskning: content/artiklar/cv-mall-gratis-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Ett fel om amerikanska CV, en uppåtrundad Jobscan-siffra, ett gratislöfte som är för brett och flera påståenden om andra sajter utan källa.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 109 | "Amerikanska resumes ... listar referenser direkt på CV:t, och har personnummer-fält" | fel | Det är tvärtom. Amerikanska resumes ska inte innehålla referenser, foto eller personuppgifter som ålder och kön, och personnummer (SSN) står aldrig där. Stryk meningen eller skriv "Amerikanska resumes är kortare och mer säljande, och mallar översatta därifrån saknar ofta svenska rubriker som Arbetslivserfarenhet". | Harvard Office of Career Services, "Create a strong resume" (DON'T: list references, include a picture, include age or gender): https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/ |
| 47 | "Enligt ... Jobscan använder runt 99 procent av Fortune 500-bolagen ett ATS" | fel (uppåtrundat) | Jobscans rapport för 2026: 97,4 % (487 av 500), och mellan cirka 97 och 99 % varje år sedan 2018. Skriv "närmare 98 procent". | https://www.jobscan.co/blog/fortune-500-use-applicant-tracking-systems/ |
| 47 | "bland svenska storarbetsgivare är det numera standard" | obelagt | Ingen svensk källa. Den närmaste belagda svenska siffran gäller AI i rekryteringen och inte ATS: Experis 2023, 28 % av arbetsgivarna. Mjuka upp till "vanligt hos större arbetsgivare även i Sverige", eller stryk. | – |
| 20, 235, 259 | "bygga ditt CV med vårt verktyg och ladda ner det som färdig PDF" / "vårt CV-verktyg som genererar ett komplett CV ... Båda är gratis" | fel (produkt, ofullständigt) | Gratisnivån ger tre CV-mallar och en nedladdning (`FREE_TEMPLATE_COUNT = 3`, `FREE_CV_EXPORTS = 1`). Fler nedladdningar och alla mallar ingår i Premium (149 kr/mån). Skriv "gratis att bygga, med en nedladdning på gratiskontot". | src/lib/cv/template-antal.ts rad 17 och 27; src/lib/access/features.ts (`cv_export`, `cv_templates_all`) |
| 18, 255 | "Premium-mallar på sajter som Canva eller LinkedIn" | obelagt | LinkedIn säljer inga CV-mallar. Stryk "eller LinkedIn". | – |
| 119 | "LinkedIn Resume Builder. Genererar ett CV automatiskt från din LinkedIn-profil" | obelagt | Kunde inte bekräfta att funktionen finns kvar 2026. Kontrollera innan den rekommenderas, annars stryk. | – |
| 123 | "KTH, Linköpings universitet, Lund, Göteborgs universitet och flera andra erbjuder mallar gratis" | obelagt | Inte kontrollerat per lärosäte. Länka till de faktiska mallsidorna eller skriv "flera universitet". | – |
| 41 | "på svenska sajter som cvmall.se och cv-mallar.net" | obelagt | Kontrollera att båda sajterna finns och ger mallar gratis. Annars stryk namnen. | – |
| 33 | "får 47 miljoner träffar" | obelagt | Siffran går inte att belägga och ändras hela tiden. Stryk siffran. | – |
| 59, 67 | "ungefär trettio mallar" / mallarna som "heter 'Modern' eller 'Professional'" | obelagt | Inte kontrollerat mot nuvarande Word. Formulera utan antal och mallnamn. | – |

## Belagda påståenden
- 89 CV-exempel i 10 kategorier (vård, industri, student, utbildning, service, ekonomi, offentlig sektor, teknik, logistik, hantverk). Källa: `CV_GALLERI` i src/app/(public)/exempel/components/galleri-data.ts.
- "de tre som är gratis tydligt märkta" (mallsidan). Källa: `FREE_TEMPLATE_COUNT = 3`.
- Arbetsförmedlingen har CV-mallar (tre gratis Word-mallar) och en kompetensprofil på Mina sidor som kan exporteras som CV. Källa: https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-cv
- ATS = Applicant Tracking System, och de allra flesta stora bolag i USA använder det. Källa: Jobscan (se ovan).

## Rättning (omgång 1, 2026-11-15)
- Rad 109 (fel): meningen om referenser och personnummer-fält i amerikanska resumes struken. Ersatt med "Amerikanska resumes är kortare och mer säljande, och mallar översatta därifrån saknar ofta svenska rubriker som Arbetslivserfarenhet" plus en följdmening.
- Rad 47 (fel): "runt 99 procent" rättat till "närmare 98 procent" (Jobscan 2026: 97,4 %, kontrollerat 2026-11-15). Jobscan-rapporten länkad i meningen.
- Rad 47 (obelagt): "bland svenska storarbetsgivare är det numera standard" mjukat upp till "även i Sverige är det vanligt hos större arbetsgivare".
- Rad 20, 235, 259 (produkt): FAQ (frontmatter och FAQItem) har fått "Det är gratis att bygga, och på gratiskontot ingår en nedladdning." Rad 235: "Båda är gratis" ersatt med "Exemplen är gratis utan konto, och i verktyget bygger du gratis med en nedladdning på gratiskontot."
- Rad 18, 255 (obelagt): "eller LinkedIn" struket i båda FAQ-svaren.
- Rad 119 (obelagt): kontrollerat. LinkedIns CV-byggare är nedlagd (hjälpsidan ger 404, flera källor anger 2024). Stycket omskrivet till "LinkedIn-profilen som PDF" (spara profilen som PDF), utan påstående om datum för nedläggningen.
- Rad 123 (obelagt): lärosätesnamnen strukna, nu "Flera universitet och högskolor har egna CV-mallar och CV-råd".
- Rad 41 (obelagt): kontrollerat. cvmall.se och cv-mallar.net finns båda och erbjuder gratis CV-mallar (startsidorna, 2026-11-15). Lämnat orört.
- Rad 33 (obelagt): "47 miljoner träffar" ersatt med "fler träffar än du hinner klicka dig igenom".
- Rad 59, 67 (obelagt): "ungefär trettio mallar" ersatt med "en lång rad mallar"; mallnamnen "Modern"/"Professional" strukna, undantaget beskrivs nu med egenskaperna (en kolumn, standardrubriker, utan textboxar).
- `updated: "2026-11-15"` tillagd. Inga rubriker, FAQ-frågor eller description ändrade. Underlaget för artikelbilden citerar inga ändrade meningar, bilden inte omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: Jobscan 2026 anger 97,4 % (487 av 500 Fortune 500-bolag), så "närmare 98 procent" stämmer. LinkedIn har ingen egen CV-byggare kvar och erbjuder "Save to PDF" på profilen (flera oberoende källor 2026; de oenas om nedläggningsåret, men artikeln anger inget år). Gratisnivån: FREE_TEMPLATE_COUNT = 3 och FREE_CV_EXPORTS = 1 per konto (template-antal.ts), vilket matchar "en nedladdning på gratiskontot" i frontmatter-FAQ, FAQItem och slutstycket. Amerikanska resumes-meningen påstår inget som strider mot Harvards råd. Ingen motsägelse mellan FAQ och FAQ-block. Inga tankstreck i ändrade rader.

Anmärkning, ej underkännande: "även i Sverige är det vanligt hos större arbetsgivare" (rad 48) saknar svensk källa. Det är en försiktig formulering och följer första granskningens förslag, men hittas en svensk siffra på ATS-användning bör den in.

## Svar till samordnaren
cv-mall-gratis-guide, GODKÄND, inga brister.
