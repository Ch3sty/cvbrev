# Faktagranskning: content/artiklar/vanliga-cv-misstag.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, källhänvisningarna till Ladders och Arbetsförmedlingen håller, men CV-analysen beskrivs med en funktion den saknar och en Trygghetsstiftelsen-hänvisning gick inte att belägga.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 226 | "ladda upp CV:t och jobbannonsen i vår CV-analys. Den jämför texten mot annonsen, pekar ut saknade nyckelord" | fel (produkt) | CV-analysen tar bara emot CV:t, ingen annons. Jämförelse mot annonser sker i jobbmatchningen. Skriv "ladda upp CV:t i vår CV-analys. Den pekar ut svaga formuleringar, saknade branschord och vanliga misstag". | src/app/api/cv/analyze/route.ts (bara cvId); cv-analys-faq-data.ts rad 24 |
| 23, 256 | "kör det genom vår CV-analys för objektiv feedback på matchning och saknade nyckelord" | fel (produkt) | "Matchning" mot annons görs inte. Stryk "matchning och". | Som ovan |
| 78 | "Trygghetsstiftelsen pekar ut just knapphändiga beskrivningar utan resultat som ett av de tio vanligaste misstagen" | obelagt | Ingen sådan lista från Trygghetsstiftelsen hittad (sökträffar ledde bara tillbaka till den här artikeln). Stryk tillskrivningen. Arbetsförmedlingen har en belagd motsvarighet: deras åtta cv-missar inkluderar att underskatta sina meriter och vaga formuleringar. | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-03-26-atta-cv-missar-att-se-upp-med |
| 44 | "Bland större företag är verktygen i praktiken standard" | obelagt | Ingen svensk källa. Belagt alternativ: Experis 2023, 28 % av svenska arbetsgivare använde AI i rekrytering; Arbetsförmedlingen skriver "många arbetsgivare" använder ATS. | Redan verifierat (Experis 2023); AF-artikeln 2026-02-10 |
| 21, 109, 252 | "1 sida ... upp till cirka tio års erfarenhet" | (inkonsekvens) | Inte belagt eller fel i sig, men hur-skriver-man-cv säger "under fem års erfarenhet en sida". Samordna gränsen mellan artiklarna. | content/artiklar/hur-skriver-man-cv.mdx rad 16, 226 |

## Belagda påståenden
- Ladders ögonspårning, cirka sju sekunder vid första gallringen (rad 36): Ladders 2018, 7,4 sekunder (redan verifierat).
- Arbetsförmedlingen har en lista med åtta cv-missar där ett icke-anpassat CV ingår (rad 65): "Åtta cv-missar att se upp med", punkt 7. Länk ovan.
- Arbetsförmedlingen: arbetsgivare kollar oftast upp uppgifter (rad 125): "Särskilt inte om arbetsgivaren kollar upp dig, vilket de oftast gör." Samma artikel.
- CVExample-raderna är tydligt illustrativa.

## Rättning (omgång 1, 2026-11-15)
- Rad 226: CV-analysen beskrivs inte längre som att den jämför CV:t mot annonsen. Nu: ladda upp CV:t, den pekar ut svaga formuleringar, saknade branschord och vanliga misstag; jämförelsen mot annonsen gör läsaren själv. Länken /verktyg/cv-analys kvar.
- Rad 23, 256 (FAQ-svaret i frontmatter och FAQ-blocket): "feedback på matchning och saknade nyckelord" ändrat till "feedback på formuleringar och saknade branschord". FAQ-frågan oförändrad.
- Rad 78: Trygghetsstiftelsen-tillskrivningen struken. Ersatt med Arbetsförmedlingens belagda råd (var specifik med arbetsuppgifter, ansvar och metoder; algoritmer har svårt för vaga formuleringar, AF 2026-02-10). Kontrollerat själv att AF:s åtta cv-missar inte täcker resultatlösa beskrivningar ("underskatta dina meriter" handlar om meriter utanför arbetslivet), därför används den inte här.
- Rad 44: "Bland större företag är verktygen i praktiken standard" struket; "en stor andel arbetsgivare" ändrat till AF:s "många arbetsgivare", plus en mening om att du sällan vet om ansökan går via ATS.
- Rad 21, 109, 252 (inkonsekvensen): en sida "upp till cirka tio års erfarenhet" samordnat med hur-skriver-man-cv till "under fem års erfarenhet" (frontmatter-FAQ, FAQ-blocket och brödtexten).
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Andra granskningen (2026-11-15)
UNDERKÄND.

1. **Källrad saknas** (artikeln har ingen enda extern länk). Belagda uppgifter står utan källa: rad 37 "cirka sju sekunder per CV vid den första gallringen" (Ladders), rad 66 Arbetsförmedlingens åtta cv-missar, rad 79 Arbetsförmedlingens råd om vaga formuleringar, rad 126 att arbetsgivare oftast kollar upp uppgifter. Krävs: källrad sist med Ladders 2018 (https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf), AF "Åtta cv-missar att se upp med" (https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-03-26-atta-cv-missar-att-se-upp-med) och AF "Så skriver du ett cv som får AI att välja dig" (https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig).

Kontrollerat och godtaget i övrigt: CV-analysen beskrivs inte längre som att den jämför mot annonsen (rad 24, 227, 257), Trygghetsstiftelsen-tillskrivningen borta och AF-citatet på rad 79 stämmer ordagrant, "många arbetsgivare" enligt AF, ensidesgränsen samordnad med hur-skriver-man-cv i frontmatter, FAQ-block och brödtext. Inga talstreck i ändrade rader.

## Svar till samordnaren
vanliga-cv-misstag, UNDERKÄND, källrad saknas för Ladders-sekunderna och de tre Arbetsförmedlingen-hänvisningarna.

## Rättning omgång 2 (2026-11-15)
- Brist 1 (källrad saknas): källrad tillagd sist i artikeln, efter en avgränsare, i samma form som ai-rekrytering-sverige: Ladders Eye-Tracking Study (2018), Arbetsförmedlingen "Åtta cv-missar att se upp med" (2026) och Arbetsförmedlingen "Så skriver du ett cv som får AI att välja dig" (2026). AF-länkarna kontrollerade (200); AF-sidan om cv-missar bär både anpassningen (rad 66) och att arbetsgivaren "oftast" kollar upp uppgifter (rad 126). Ladders-PDF:en svarar 403 mot skript men är samma länk som används i 13 andra artiklar.
- Ingen brödtext ändrad. Rubriker, FAQ-frågor, description oförändrade. Bild inte omgjord. Inga talstreck, MDX kompilerar.

## Tredje kontrollen (2026-11-15)
GODKÄND. Källraden finns sist med Ladders 2018 och båda Arbetsförmedlingen-artiklarna, som bär rad 37, 66, 79 och 126. Ingen brödtext ändrad i omgång 2. Produktuppgifterna stämmer med facit (CV-analysen jämför inte mot annons, rad 227 säger det uttryckligen).
