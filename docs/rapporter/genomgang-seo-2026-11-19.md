# SEO-genomgång efter de nya uppgiftstyperna (2026-11-19)

Uppdrag: undersöka vilka publika sidor som beskriver testernas uppgiftstyper fel eller ofullständigt efter dagens frågebanker (1 651 nya frågor, se docs/lage-2026-11-19.md), om det finns sökbehov för de nya typerna och i vilken ordning vi bör göra något. Inget är ändrat. Den här filen är det enda som skrivits.

## Underlag

- Search Console, egendomen sc-domain:jobbcoach.ai, 2025-07-17 till 2026-11-17 (16 månader, data till och med två dagar bakåt), `dataState: all`. 14 031 rader fråga plus sida och 5 613 rader fråga. Google döljer sällsynta frågor, så summorna är golv.
- Sidnivå för testsidorna, 16 månader och 28 dagar.
- Googles autoförslag (hl=sv, gl=se) som kontroll av om en fras alls söks, eftersom Search Console bara visar frågor där vi redan syns.
- Koden: `src/app/(public)/verktyg/rekryteringstester/page.tsx`, `components/rekryteringstester-faq-data.ts`, `src/lib/tests/prov-typer.ts`, `src/components/artiklar/reklam/TypProvKort.tsx`, `src/lib/tester/copy.ts`, `src/lib/tester/steg2/namn.ts`, `src/lib/plans/gratis-copy.ts`, `src/lib/tester/antal-testtyper.ts`, samt 15 artiklar i `content/artiklar/`.
- Begränsning: inget verktyg för sökvolym. Där Search Console är tom säger autoförslagen bara om frasen finns, inte hur stor den är.

## Fråga 1: sidor som nu är ofullständiga eller fel

### Testsidan och dess delar

| Sökväg / fil | Vad som står | Vad som saknas eller är fel |
|---|---|---|
| /verktyg/rekryteringstester, kortet Spatial förmåga (page.tsx rad 130) och länkkortet (rad 233) | "Rumsuppfattning: vridna figurer, pappersvikning och tärningar." | Kroppar av kuber sedda från pilens håll, snitt och spegling i två linjer saknas. |
| Samma sida, JSON-LD `featureList` (rad 314) | "spatial förmåga med vridna figurer, pappersvikning och tärningar", "deduktiv slutledning med övningsprov i SHL:s antal uppgifter och tid" | Samma lucka i spatial. Deduktivt nämner inga format. Schemat är det AI-motorer läser först. |
| Samma sida, kortet Deduktiv slutledning (rad 112) | "Villkor i text och en fråga om vad som måste gälla." | Stämmer men täcker bara den äldre typen. Villkorskedjor (om–så), syllogismer med alla/några/ingen, sanningssägare och lögnare, tabellpussel och "vad kan inte vara sant" nämns inte. |
| Samma sida, kortet Matrislogik (rad 76) | "en 3×3-matris med abstrakta former" | Klockor, grupper av tecken och streckfigurer finns nu i matrisen. "Abstrakta former" är inte fel men inte heller hela bilden. |
| Samma sida, kortet Figurserier (rad 103) | "En rad figurer som följer en regel" | Klockan med två visare nämns inte. Liten lucka. |
| Samma sida, FAQ (faq-data.ts) | Frågor om matris, verbalt, numeriskt, I-provet | Ingen fråga om spatial förmåga eller deduktiv slutledning, trots att båda är egna testtyper. |
| Samma sida, "Åtta testtyper" (rad 401, 488) | Åtta | Rätt enligt beslutet. |
| /verktyg/rekryteringstester/prova?typ=spatial (prov-typer.ts rad 161) | "vridna figurer, pappersvikning och tärningar" | Samma lucka. Sidan är noindex, så det är en korrekthetsfråga, inte SEO. |
| Reklamkortet i artiklarna, spatial (TypProvKort.tsx rad 72) | Rubrik "Vridna figurer, pappersvikning och tärningar" | Samma lucka, syns på rotation-test-guide och i-prov. |
| Inloggat, testkortens fråga (copy.ts rad 18) | Deduktivt: "Vem står var när alla villkor gäller?" | Beskriver bara ordningsuppgifterna. Inte SEO, men samma fel. |

### Artiklarna

| Sökväg | Vad som saknas eller är fel |
|---|---|
| /artiklar/rotation-test-guide (spatial förmåga) | Description, FAQ (rad 21 och 316), "Vanliga uppgiftstyper" (rad 99), "Så tränar du" (rad 247 och 257) och avslutningen (rad 285) räknar upp "vridna figurer, pappersvikning och tärningar". Kroppar av kuber, vy från pilen, snitt och spegling i två linjer saknas helt som uppgiftstyper hos oss. "Perspektiv" (rad 97) beskrivs allmänt men inte kopplat till vårt test. Ingen löst uppgift med kroppar eller dubbel spegling. |
| /artiklar/deduktivt-induktivt-test | Nämner syllogismer, ordningsuppgifter och "kan inte vara sant" (rad 40), men inte sanningssägare och lögnare, villkorskedjor eller tabellpussel. De tre lösta deduktiva uppgifterna är syllogism, ordning och en vänd regel. FAQ-svaret (rad 21 och 250) säger "Hos oss provar du fem matrisfrågor i induktiv logik utan konto" fast sidan har det deduktiva provet utan konto inbäddat (`<ArtikelProv typ="deduktiv" />`). |
| /artiklar/talserier | De åtta regeltyperna stämmer med produktens åtta familjer. Två små avvikelser: H3 "Samma kvot varje gång" heter nu "Gånger och delat" i produkten (rubriken bör stå kvar för SEO-diffen, men brödtexten kan använda produktens namn), och tredje ordningens differenser på expert (godkänd i talserier omgång 2) nämns inte under "Expert". |
| /artiklar/logiska-tester | "Öva gratis hos oss" (rad 194) säger "matrislogik och andra vanliga testformat", och "Gratis logiktest" (rad 204) erbjuder bara fem matrisfrågor, fast provet utan konto finns i alla typer. Inga felaktiga påståenden om de nya typerna, men ingenting om dem heller. |
| /artiklar/logiktest-exempel-med-losningar | Rad 704: "Övningstesterna finns i matrislogik, verbalt och numeriskt". Fel: det är åtta testtyper. Deduktiva exemplen (uppgift 10 till 12) täcker inte de nya formaten. |
| /artiklar/aon-cut-e-test | Rad 344 säger "övningstester i matrislogik, verbalt och numeriskt", rad 380 säger rätt (figurserier, matriser, deduktivt, numeriskt, verbalt, spatial). Sidan motsäger sig själv. Spatial-raden på 380 saknar kroppar och spegling. |
| /artiklar/arbetspsykologiska-tester | Rad 368: "matrislogik, verbala och numeriska test". Ofullständigt. Avsnitten Deduktiv logik och Spatialt test är allmänna och fortfarande riktiga. |
| /artiklar/matrigma-test | Rad 309: "träna matrislogik, verbalt och numeriskt". Ofullständigt. Klockor och streckfigurer ska inte in här, Matrigma använder abstrakta figurer. |
| /artiklar/matrislogik-test-guide | "Sju mönster" i regeltabellen är leverantörernas regler och stämmer. Klocka, grupp och streckfigur kan nämnas i en mening om vårt test, inte som regeltyper hos Assessio eller Alva. |
| /artiklar/alva-labs-logiktest | Ingenting fel om uppgiftstyper. Rör inte (U11, säljsidan, avläses 2 dec). |
| /artiklar/i-prov | Rätt. Deltestet tärningar filtrerar bort kroppar (lage-loggen). En mening om att spatial grundnivå hos oss nu också har kroppar och spegling, som inte finns i I-provet, skulle göra texten exakt. Låg prioritet. |
| SHL | Ingen egen sida finns. SHL nämns i deduktivt-induktivt-test, logiska-tester och på testsidan. N4 /artiklar/shl-test är planerad till januari (plan-seo-nya-tester-2026-11-10.md). |
| /artiklar/vad-ar-en-jobbcoach | Rad 655: "matrislogik, verbalt och numeriskt resonemang". Ofullständigt. |

### Ordet Nivåkollen i artiklarna

Ordregeln i `src/lib/plans/gratis-copy.ts` säger "grundnivån", aldrig "Nivåkollen" publikt. Ordet står 33 gånger i 15 artiklar (flest i vad-ar-en-jobbcoach 5, cubiks 4, deduktivt-induktivt 4, matrislogik 4). Formuleringen "Nivåkollen och ett första träningspass samma dag gratis" bör också kontrolleras mot gratisregeln i v4 (ett grundnivåtest om dagen, dag 0-passet räknas in i kvoten). Jag har inte avgjort om meningen är fel i sak, bara att ordet bryter regeln.

### Antal testtyper

Beslutet är "åtta testtyperna och personlighetstestet" i text, nio i bilden (TestBredd). Avvikelser i synlig text:

- Inloggat Hem: `antalTesttyper()` i `src/components/tester-v4/hem/hemData.ts` räknar synliga typer plus ett och visar "9 testtyper".
- /priser: "Grundnivån i alla nio" (`priser/page.tsx` rad 171).
- Sidokolumnen i alla artiklar med reklamkort: "Grundnivån gratis i alla nio" (`reklam-copy.ts` rad 260, `nioCaption`).
- /register och artiklarnas kort har "Nio testtyper" som aria-label. Det beskriver bilden och följer beslutet.

/verktyg/rekryteringstester säger åtta och följer beslutet. Det här är en textfråga, inte SEO.

## Fråga 2: sökbehov för de nya uppgiftstyperna

### Det vi syns på i dag (16 månader)

| Fråga | Visningar | Klick | Snittposition | Sida som syns |
|---|---:|---:|---:|---|
| spatial förmåga | 837 | 2 | 9,6 | rotation-test-guide |
| logiskt test figurer förklaring | 413 | 0 | 10,1 | logiska-tester |
| vad är spatial förmåga | 108 | 2 | 7,0 | rotation-test-guide |
| deduktiv slutledningsförmåga | 119 | 1 | 17,7 | logiska-tester |
| deduktiv slutledningsförmåga test gratis | 97 | 1 | 7,6 | logiska-tester |
| hög spatial förmåga | 58 | 0 | 9,1 | rotation-test-guide |
| induktiv slutledningsförmåga test gratis | 58 | 0 | 9,6 | logiska-tester |
| deduktiv slutledningsförmåga test | 55 | 1 | 9,6 | logiska-tester |
| deduktiv logik | 42 | 0 | 7,5 | logiska-tester |
| deduktiv logisk slutledningsförmåga | 33 | 0 | 16,2 | logiska-tester |
| spatial förmåga test | 24 | 0 | 9,0 | rotation-test-guide |
| spatial förmåga övningar | 14 | 0 | 10,9 | rotation-test-guide |
| rotationstest | 12 | 0 | 1,8 | rotation-test-guide |

Grupperat: spatial 31 frågor, 1 567 visningar, 6 klick. Deduktiv och slutledning 27 frågor, 578 visningar, 6 klick. Två saker sticker ut:

1. "spatial förmåga" är den största frågan i hela gruppen och ligger på sida 1 utan att få klick (CTR 0,2 %). Sidan heter "Rotationstest och spatial förmåga" och beskriver tre uppgiftsformer, fast vi nu har fem.
2. De deduktiva frågorna landar på logiska-tester, inte på den deduktiva artikeln. Den deduktiva artikeln har 463 visningar totalt och sin bästa deduktiva fråga på 48 visningar. seoTitle "Deduktiv och induktiv logik: test med exempel 2026" saknar ordet som söks, "slutledningsförmåga".

Sidnivå, 28 dagar till 17 nov: rotation-test-guide 1 333 visningar och 19 klick (position 8,2), deduktivt-induktivt-test 463 och 9 (7,3), talserier 657 och 7 (6,6), logiska-tester 7 667 och 80 (9,6), /verktyg/rekryteringstester 679 och 14 (28,6).

### Det som efterfrågades, frasen för frasen

| Fras | Search Console | Autoförslag | Bedömning |
|---|---|---|---|
| sanningssägare och lögnare logiktest | 0 visningar, ingen närliggande fråga | "sanningssägare" ger bara korsordsförslag. "sanningssägare och lögnare" och "riddare och knektar" ger inget. | Inget sökbehov att bygga en sida på. |
| syllogism test | 0 | "syllogism", "syllogismer exempel", "syllogismer betydelse" | Litet och mest filosofiskt. Passar som avsnitt i den deduktiva artikeln. |
| kubpussel rekryteringstest | 0 | "kubpussel" är leksaker (barn, Bamse, Pippi) | Fel avsikt. Ingen sida. |
| mentala rotationer | 0 | Inga svenska förslag. "mental rotation test" finns på engelska | Ingen svensk efterfrågan. Engelska ligger utanför vår ram. |
| spegling test | 0 | Inget ("spegelbild test" ger "spegel test") | Inget sökbehov. |
| klocka logiktest | 0 | Inget, inte heller "klockor logiskt test" | Inget sökbehov. |
| tabellpussel, "vad kan inte vara sant" | 0 | Inget. "logikpussel" finns men leder till pussel för nöjes skull | Inget sökbehov. |

Närliggande fraser med efterfrågan där vi inte syns alls: "pappersvikning test" och "pappersvikning iq test", "tärningar iq test", "spatial förmåga test gratis", "deduktiv slutledning exempel", "iq test figurer förklaring", "logiktest med figurer" samt "shl tester" och "shl test svenska". Alla finns i autoförslagen och har noll visningar för oss.

Slutsats: de nya uppgiftstyperna har inget eget sökbehov på svenska. Värdet ligger i att de gör två befintliga sidor, spatial och deduktivt, bättre på frågor som redan har visningar. Det gör också den planerade figursidan (N10) bättre.

## Fråga 3: förslag i rangordning

Regler att följa:

- **Hubbtrimningsregeln:** en ny undersida trimmar hubben i samma commit. Ägarens regel från 2026-11-08 gäller: inget innehåll tas bort, och en rubrik som rankar står kvar med en mening och en länk.
- **SEO-diffgrinden** (`scripts/seo-diff-artiklar.ts`): inga rubriker eller interna länkar får försvinna. Ändrad title, description, h2 eller h3 och JSON-LD (featureList och FAQ-schema) kräver en undantagsfil i `scripts/seo-baslinje/`.
- **Black Week-frysen 23–30 nov:** den gäller komponenter, inte MDX. page.tsx, prov-typer.ts och TypProvKort.tsx görs alltså före 23 nov eller efter 30 nov.

| # | Typ | Vad | Varför, med siffror | Grind |
|---|---|---|---|---|
| 1 | Uppdatera befintlig sida plus nya avsnitt | **rotation-test-guide:** två nya H2 med en löst uppgift var, "Kroppar av kuber: vy från pilen och snitt" och "Spegling i två linjer" (det senare kan också vara en H3 under "rotation mot spegling"). Rätta uppräkningen på sex ställen och FAQ. Ny description som nämner kroppar och spegling. Överväg "Pappersvikning test"-formulering i befintlig H2. | "spatial förmåga" har 837 visningar på position 9,6 och 2 klick. Sidan hade 1 333 visningar på 28 dagar. Störst volym bland de nya typerna, och sidan beskriver i dag två av fem former fel. | MDX, går under frysen. Undantag för description, två nya h2 och FAQ-schemat. Inga länkar tas bort. |
| 2 | Uppdatera befintlig sida plus nytt avsnitt | **deduktivt-induktivt-test:** ny H2 "Fem format i deduktiva test" med villkorskedjor, syllogismer (alla/några/ingen), sanningssägare och lögnare, tabellpussel och "kan inte vara sant", med en kort löst uppgift per format. Rätta FAQ-svaret om "fem matrisfrågor". Ny seoTitle med "deduktiv slutledningsförmåga" först. | 578 visningar på deduktiva frågor, men de landar på logiska-tester (position 7,5 till 17,7). Den egna sidan har bara 48 visningar på huvudfrågan. Autoförslagen visar "deduktiv slutledning exempel" och "syllogismer exempel". | MDX. Undantag för title och h2. Logiska-tester har redan bara ett stycke med länk om deduktivt, så hubbtrimningen kräver inget. |
| 3 | Uppdatera befintliga sidor (sanning) | **/verktyg/rekryteringstester:** korten Spatial, Deduktiv och Matris, featureList, en FAQ om spatial och en om deduktivt. Samma rättelse i prova-ingressen (prov-typer.ts) och i TypProvKort spatial. | Testsidan ligger på position 28,6 och har 679 visningar på 28 dagar, så SEO-vinsten är liten. Men sidan är produktens egen beskrivning och läses av AI-motorer via schemat. En FAQ om spatial ger också en ingång för "spatial förmåga test gratis". | Komponent: före 23 nov eller efter 30 nov. Undantag för JSON-LD och FAQ. |
| 4 | Uppdatera befintliga sidor (ett MDX-svep) | **Inaktuella uppräkningar:** logiktest-exempel-med-losningar r704, aon-cut-e-test r344 (och spatial-raden r380), arbetspsykologiska-tester r368, matrigma-test r309, logiska-tester r194 och r204, vad-ar-en-jobbcoach r655. "Matrislogik, verbalt och numeriskt" byts mot de åtta testtyperna. "Nivåkollen" (33 ställen i 15 artiklar) byts mot "grundnivån" efter kontroll mot gratisregeln i v4. | Fel om produkten på sidor med 435 till 7 667 visningar. Faktagranskningens regel är att text om produkten ska stämma mot koden. | Bara brödtext. Grinden går igenom om inga länkar rörs. |
| 5 | Ny sida, redan planerad | **N10 /artiklar/logiskt-test-figurer (8–11 dec):** ta med klockan med två visare (figurserier och matris), grupper av tecken och streckfigurer bland figurtyperna, med våra egna ritade uppgifter. | "logiskt test figurer förklaring" har 413 visningar på position 10,1 och 0 klick. Autoförslagen ger också "iq test figurer förklaring" och "logiktest med figurer". | Hubbtrimning i samma commit: logiska-tester, stycket "Figur- och sifferserier", får en länk. Inget tas bort enligt ägarens regel. |
| 6 | Litet avsnitt | **talserier:** en mening om "gånger och delat" under H3 "Samma kvot varje gång" (rubriken står kvar) och tredje ordningens differenser under Expert. | 657 visningar på position 6,6. Små luckor. | MDX, ingen rubrikändring. |
| 7 | Litet avsnitt | **i-prov:** en mening om att kroppar och spegling hör till vårt spatiala test men inte till I-provet. **matrislogik-test-guide:** en mening om klockor och streckfigurer i vårt test, inte som leverantörsregler. | Gör texten exakt. Lågt sökvärde. | MDX. |
| – | Ingen åtgärd | Egna sidor för sanningssägare och lögnare, syllogismer, kubpussel, mentala rotationer, spegling och klocklogik. | Noll visningar och inga eller felriktade autoförslag. Det skulle vara tunna sidor, och de skulle kannibalisera rotation-test-guide och deduktivt-induktivt-test. | – |
| – | Står kvar | N4 /artiklar/shl-test i januari. | "shl tester" och "shl test svenska" finns i autoförslagen men vi har 0 visningar. Beslutet att vänta på G+-provet ligger fast. | – |

Utanför SEO, men upptäckt i samma genomgång: texterna "9 testtyper" på inloggat Hem, "Grundnivån i alla nio" på /priser och "Grundnivån gratis i alla nio" i artiklarnas sidokolumn ska enligt beslutet säga åtta testtyper och personlighetstestet.

Avläsning: rotation-test-guide och deduktivt-induktivt-test 28 dagar efter publicering, CTR och position på "spatial förmåga" och "deduktiv slutledningsförmåga" mot tabellen ovan.
