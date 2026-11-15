# Faktagranskning: content/artiklar/hur-skriver-man-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, nästan alla Arbetsförmedlingen- och Unionen-hänvisningar stämmer ordagrant, men ett AF-råd om luckor är påhittat i sin skärpa, CV-analysen beskrivs med en funktion den saknar och antalet yrkesexempel är inaktuellt.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 275 | "Arbetsförmedlingens råd är entydigt: försök inte dölja den. Tomrum och kreativ datumhantering väcker mer misstanke än luckan i sig." | obelagt | Den angivna AF-artikeln om luckor säger inget om att dölja luckor, kreativ datumhantering eller misstanke. Den säger att man inte ska överdriva sina kvalifikationer och ska lyfta det man har. Stryk tillskrivningen till AF, behåll rådet som eget. | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2022-11-23-sa-kan-du-fa-jobbet-trots-luckor-i-cvt |
| 255 | "jämför vårt verktyg för CV-analys de två [CV och annons] och visar vad du bör skärpa" | fel (produkt) | CV-analysen tar bara emot CV:t, ingen annons. Jämförelse mot annonser görs i jobbmatchningen. Byt länk/verktyg eller formulering. | src/app/api/cv/analyze/route.ts (bara cvId) |
| 241, 331 | "74 yrkesexempel" | fel | Det finns 89 publicerade CV-exempel. Skriv "89" eller "fler än 80" så att siffran inte åldras. | src/app/(public)/cv-exempel/[yrke]/publicerad.ts (89 poster) |
| 331 | "CV-verktyg ... och ... yrkesexempel ... Båda är gratis." | fel (ofullständigt) | CV-verktyget och mallarna är gratis att använda men med begränsad nedladdning; full export ingår i Premium. Skriv "gratis att börja i". | src/lib/access/features.ts (`cv_export`); priser/page.tsx rad 158 |
| 66 | "ATS ... som många större arbetsgivare använder" | obelagt (detalj) | AF skriver "många arbetsgivare", inte "större". Mindre sak, stryk "större" eller ange källa. | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig |
| 16, 53, 226 | "En A4-sida om du har under fem års erfarenhet, två sidor om du har mer" | (inkonsekvens) | Inte belagt eller fel i sig, men vanliga-cv-misstag säger "upp till cirka tio år" för en sida. Samordna. | content/artiklar/vanliga-cv-misstag.mdx rad 21, 109 |

## Belagda påståenden
- Unionen: 3-5 sekunder att fånga en erfaren rekryterares uppmärksamhet (rad 62). https://www.unionen.se/student/jobbguiden/ett-cv-som-fixar-jobbet
- Unionen: CV:t ska inte ta upp allt du gjort i hela livet (rad 16, 347). Samma.
- Unionen: redovisa inte varenda högskolepoäng (rad 172). Samma.
- Unionen: skriv alltid en ny ansökan så att den känns relevant (rad 245). Samma.
- AF: "Enkelt slår avancerat", undvik tabeller, grafik, symboler och specialtecken (rad 66). AF 2026-02-10, länk ovan.
- AF: utgå från jobbannonsens språk och spegla centrala ord (rad 72). Samma.
- AF: standardrubriker Arbetslivserfarenhet, Utbildning, Kompetenser som ATS känner igen (rad 14, 343). Samma.
- AF: algoritmer har svårt för vaga formuleringar (rad 146). Samma.
- AF: ett generellt CV rankas oftast lägre (rad 53, 245). Samma: "ett generellt cv rankas oftast lägre".
- AF: förtroendeuppdrag, föreningsliv, projekt med studiekompisar, skoltidningen, podd, där du fått vara flexibel och lösa problem (rad 263). https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2025-12-17-sa-kan-du-fa-jobbet-fast-du-saknar-erfarenhet
- CVExample-raderna (Acme AB, KTH, Läkare Utan Gränser m.fl.) är tydligt illustrativa exempel.

## Rättning (omgång 1, 2026-11-15)
- Rad 275: tillskrivningen "Arbetsförmedlingens råd är entydigt: försök inte dölja den" struken; rådet står kvar som vårt eget ("väcker lätt fler frågor än luckan i sig"). Tillagt det AF-artikeln faktiskt säger (kontrollerat själv): överdriv inte dina kvalifikationer, men var inte för blygsam. Källraden orörd.
- Rad 255: CV-analysen beskrivs inte längre som att den jämför CV:t mot annonsen. Jämförelsen görs med listan ovan; CV-analysen går igenom struktur, språk och nyckelord i CV:t. Länken /verktyg/cv-analys kvar.
- Rad 241, 331: "74 yrkesexempel" ändrat till "fler än 80 yrkesexempel" (89 publicerade). Länkarna /cv-exempel kvar.
- Rad 331: "Båda är gratis" ändrat till "Exemplen är fria att läsa, och CV-verktyget är gratis att börja i" (full export ingår i Premium).
- Rad 66: "många större arbetsgivare" ändrat till "många arbetsgivare" enligt AF.
- Rad 16, 53, 226 (inkonsekvensen med vanliga-cv-misstag): lämnat här; vanliga-cv-misstag har samordnats till "under fem års erfarenhet en sida".
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte (underlagets citat finns kvar).

## Andra granskningen (2026-11-15)
GODKÄND. AF-artikeln om luckor kontrollerad: "Överdriv inte dina kvalifikationer ..." och "... inte det samma som att vara för blygsam och försiktig" bär den nya meningen; rådet om att inte dölja luckan står nu som vårt eget. CV-analysen beskrivs inte längre som att den jämför mot annonsen. 89 poster i publicerad.ts bär "fler än 80". "Gratis att börja i" stämmer med att full export ligger i Premium. "Många arbetsgivare" enligt AF. Inga talstreck i ändrade rader.

## Svar till samordnaren
hur-skriver-man-cv, GODKÄND.
