# Faktagranskning: content/artiklar/cv-exempel-yrken.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, ett fel i Ladders-siffran och en produktbeskrivning av CV-analysen som inte stämmer, resten är råd och platshållarexempel.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 56 | "lägger i snitt sex till sju sekunder på den första genomläsningen av ett CV, enligt ögonrörelsestudien från Ladders (2018)" | fel | Ladders 2018: i genomsnitt 7,4 sekunder (6 sekunder var 2012-versionen). Ersätt med "i snitt 7,4 sekunder ... enligt Ladders ögonrörelsestudie (2018)". | https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf |
| 253 | "låta vår CV-analys jämföra det mot den specifika jobbannonsen. Du får direkt återkoppling på hur väl du matchar, vilka nyckelord från ditt yrke som saknas" | fel (produkt) | CV-analysen tar bara CV:t som indata (createBackgroundJob(userId, cvId)), ingen annons. Den granskar struktur, språk, nyckelord (branschtermer som saknas) och kvantifiering och ger en poäng. Ersätt med "låta vår CV-analys granska det: du får en poäng och ser vilka branschtermer och resultat som saknas". | src/app/api/cv/analyze/route.ts, src/lib/cv/background-jobs.ts, src/app/(public)/verktyg/cv-analys/ |
| 17, 58, 269 | "Många arbetsgivare använder ATS-system som rangordnar CV:n efter hur väl de matchar annonsen" | obelagt | Generellt påstående utan källa; rangordning efter matchning är en funktion i vissa ATS, inte standard. Mjuka upp: "En del rekryteringssystem kan sortera eller söka på nyckelord". Belagd uppgift om utbredning: Experis 2023, 28 % av svenska arbetsgivare använde AI i rekrytering. | – |

## Belagda påståenden
- "CV-exempel för 89 yrken" (rad 15, 47, 265): exampleData i src/app/(public)/cv-exempel/[yrke]/page.tsx har 89 yrken.
- Länkade yrkessidor finns: underskoterska, butikssaljare, lagerarbetare, administrator, larare, ekonom, ingenjor, chef, enhetschef (samma fil).
- Truckbehörigheter A1-A4, B1-B6 enligt TLP10 (branschstandard för truckutbildning).
- Lgr22 och Gy11 är gällande läroplansbeteckningar; dokumentationssystemen Cosmic, Procapita och Lifecare finns i svensk vård och omsorg.
- Prestationsexemplen (10 %, 0,5 %, 15 %) står i tydligt märkta exempelpunkter med platshållare, inte som mätta resultat.

## Rättning (omgång 1, 2026-11-15)
- Rad 56: rättat till "i snitt 7,4 sekunder ... enligt Ladders ögonrörelsestudie (2018)". Källrad skapad sist i artikeln med Ladders-PDF:en (svarar 403 för robotar; samma länk används i andra artiklar).
- Rad 253 (produkt): rättat. CV-analysen "granskar" utkastet: du får en poäng och ser vilka branschtermer och resultat som saknas; matchningen mot annonsen görs för hand med de understrukna nyckelorden. Ingen jämförelse mot annons utlovas längre.
- Rad 17/269 (FAQ, båda) och 58: omskrivet till "En del rekryteringssystem (ATS) kan sortera eller söka på nyckelord". Snabbsvaret (rad 51) också mjukat upp från "passerar ATS-system" till "syns när ett rekryteringssystem söker på nyckelord".
- `updated` tillagt. Rubriker, FAQ-frågor och description oförändrade. Bilden berördes inte.

## Andra granskningen (2026-11-15)
GODKÄND. Ladders 2018 anger i snitt 7,4 sekunder för den första genomläsningen, och källrad finns. CV-analysen beskrivs nu som granskning av CV:t med poäng och saknade branschtermer, utan annonsjämförelse, vilket stämmer med produkten. ATS-påståendena är mjukade till "en del rekryteringssystem kan sortera eller söka på nyckelord" i brödtext, snabbsvar och båda FAQ-ställena, utan motsägelse. Inga talstreck i ändrade rader. Snabbläsning: procentsiffrorna (10 %, 0,5 %, 15 %) står i tydligt märkta exempel.
