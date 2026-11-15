# Faktagranskning: content/rekryterare/lonespann-i-jobbannonsen.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Jobblands siffror, HBR-studien och direktivet stämmer. USA-siffran är uppräknad, och skälen mot lönespann tillskrivs undersökningen utan belägg.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 38 | "andelen annonser med löneuppgift på Indeed vuxit från 18 procent 2020 till omkring 60 procent" | obelagt (uppräknat) | Indeed Hiring Lab: 18 % i februari 2020 och 50 % i augusti 2023 (den senaste uppgift som kunde hämtas). Skriv "från 18 procent i februari 2020 till omkring hälften 2023", eller hämta en senare mätpunkt från Hiring Lab. | https://hiringlab.indeed.com/data/pay-transparency/ |
| 15 | "De vanligaste skälen är oro för att interna löner blir synliga, för att förhandlingsläget försvagas och för att kandidater med höga anspråk skräms bort." | obelagt | Stycket läses som Jobblands resultat. Jobbland redovisar skälen bland dem som vill visa spannet (transparens, motivera kandidater, effektivisering), inte skäl emot. Skriv "Vanliga invändningar är …" så att de inte tillskrivs undersökningen. | https://jobbland.se/arbetsliv/lonespann-i-platsannonser |
| 56 | "Enligt forskarna mildras effekten när annonsen kort förklarar hur lönen sätts." | obelagt | HBR-artikelns tillgängliga del bekräftar att breda spann avskräcker kvinnor, men inte den här modereringen (artikeln ligger bakom betalvägg). Kontrollera mot artikeln eller studien, annars stryk meningen eller gör den till vårt eget råd. | https://hbr.org/2026/02/posting-a-wide-salary-range-can-deter-women-from-applying |

## Belagda påståenden
- Jobbland 2022 (1 009 svarande, juli 2022): 57 % vill se lönen i annonsen, 65 % säger att sannolikheten att söka ökar om lönen anges, 63 % av kvinnorna mot 47 % av männen. Viktigaste faktorer: arbetsbeskrivning 54 %, plats 53 %, lön 45 % (https://jobbland.se/arbetsliv/lonetransparens).
- Jobbland 2023 (1 010 inom rekrytering, HR och företagsledning): 31 % vill ha lönespann i platsannonsen (https://jobbland.se/arbetsliv/lonespann-i-platsannonser). Artikeln säger "rekrytering och HR", men källan inkluderar även företagsledning. Smärre, kan läggas till.
- HBR 24 februari 2026, Alice J. Lee (Cornell ILR), Tae-Youn Park (Sungkyunkwan SKKU) och Sungyong Chang (Cornell Johnson): breda lönespann avskräcker kvinnor från att söka.
- Lönetransparensdirektivet art. 5.1: information om ingångslön eller lönespann, bl.a. genom en offentliggjord platsannons, före intervjun eller på annat sätt. Inget krav på att uppgiften står i annonsen.
- "Sverige stoppade sitt genomförande i mars 2026": regeringen meddelade 26 mars 2026 att den inte lägger fram någon proposition (regeringen.se; DO:s statussida).
- Interna länkar finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 38 (uppräknat): rättat till "från 18 procent i februari 2020 till hälften av annonserna i augusti 2023" (Hiring Lab, kontrollerat; ingen senare mätpunkt på sidan).
- Rad 15 (FAQ, tillskrivning): "De vanligaste skälen är" ändrat till "Vanliga invändningar är", så att skälen inte tillskrivs Jobbland. FAQ saknar motsvarande block i brödtexten.
- Rad 56 (HBR-modereringen): meningen omskriven till vårt eget råd ("Vårt råd är därför att hålla spannet smalt och kort förklara hur lönen sätts inom det ..."), ingen tillskrivning till forskarna.
- Smärre: urvalet i Jobbland 2023 anges nu som "rekrytering, HR och företagsledning" (rad 32 och FAQ).
- Produkt (kandidatpoolen, rad 73 och FAQ rad 21): "rekryterare bara möter kandidater som redan ligger inom rollens spann" stämde inte med poolSearch.ts (budgetfilter, kandidater utan angivet anspråk inkluderas). Omskrivet: kandidaten kan ange löneförväntan, rekryteraren filtrerar på budget, den som begär mer sållas bort, förväntan visas aldrig.
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden inte berörd.

## Andra granskningen (2026-11-15)
UNDERKÄND. Rättningarna stämmer: Hiring Lab (18 % i februari 2020, 50 % i augusti 2023), Jobbland 2023 (1 010 personer inom rekrytering, HR och företagsledning, 31 %), och invändningarna. Jobbland listar själv invändningarna (konkurrenter, nuvarande anställda, att kandidaten kräver spannets topp, att den som vill ha mer inte söker). HBR-meningen är nu vårt eget råd. Kandidatpoolen på rad 22 och 74 stämmer med poolSearch.ts: budgetfiltret är salary_min <= budget, och kandidater utan angivet anspråk inkluderas. Texten "den som begär mer sållas bort" är korrekt, och förväntan visas inte.
- Rad 27: "Bland svenska jobbsökande vill 57 procent se lönen". Jobblands enkät från juli 2022 gick till drygt tusen personer i olika åldrar och skeden av karriären, och 8 av 10 var anställda. De var alltså inte jobbsökande. Krävs: "Bland drygt tusen svarande i Jobblands enkät vill 57 procent ...". Samma sak gäller description på rad 6 ("57 procent av kandidaterna"). Ändra till exempel till "57 procent vill se lönen i annonsen" om description får röras, annars notera det.

## Rättning omgång 2 (2026-11-15)
- Rad 27: "Bland svenska jobbsökande vill 57 procent se lönen direkt i platsannonsen, och 65 procent säger att ..." -> "Bland drygt tusen svarande i Jobblands enkät ville 57 procent se lönen direkt i platsannonsen, och 65 procent sa att ...".
- Rad 39 (samma brist, inte nämnd i fyndet): "sex av tio kandidater vill se det" -> "sex av tio svarande i kandidatenkäten vill se det".
- description (felaktig, ändrad): före "57 procent av kandidaterna vill se lönen i annonsen, bara 31 procent av rekryterarna vill visa den. Så sätter ni ett lönespann som breddar fältet." efter "57 procent vill se lönen i annonsen, bara 31 procent av rekryterarna vill visa den. Så sätter ni ett lönespann som breddar fältet." (135 tecken).
- FAQ (rad 14) säger redan "bland drygt tusen svarande", oförändrad. Rubriker och FAQ-frågor oförändrade. Insiktsartikel utan bildunderlag. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND.
- Bristen från andra granskningen är åtgärdad. Rad 27 lyder nu "Bland drygt tusen svarande i Jobblands enkät ville 57 procent ...". Jobbland (lonetransparens, juli 2022) har 1 009 svarande, 57 % "ja" och 65 % som uppger att sannolikheten att söka ökar. Rad 39 säger "sex av tio svarande i kandidatenkäten", och description säger "57 procent vill se lönen i annonsen". Ingen av dem kallar längre de svarande för jobbsökande.
- FAQ på rad 14 ("bland drygt tusen svarande", 57 och 65 procent, kvinnor 63 procent mot knappt hälften av männen) stämmer med brödtexten och med källan, där männen anges till ungefär hälften.
- Snabbkontroll: inga tankstreck i tillagda rader. Produktstycket på rad 74 och FAQ på rad 22 (budgetfilter, förväntan visas aldrig) är oförändrade sedan andra granskningen och stämmer med facit ("lönespann visas aldrig").
