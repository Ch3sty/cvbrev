# Faktagranskning: content/artiklar/europass-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, grundfakta om Europass och UHR stämmer, men bärande argument om att mallen är "låst" motsägs av Europass egen plattform och en produktuppgift om vårt CV-verktyg stämmer inte.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20, 130 (FAQ) | "Europass är ett låst standardformat med förbestämda sektioner och layout" | fel | Europass CV-editor låter dig välja vilka avsnitt som ska med och välja layout ur flera mallar, och skapa flera CV-versioner. Ersätt med t.ex. "Europass bygger på en standardiserad profil med fasta fält; du väljer avsnitt och kan välja mellan några mallar, men upplägget följer formulärets logik". | https://europass.europa.eu/en/create-europass-cv |
| 60 | "Mallen är låst: förbestämda sektioner i förbestämd ordning ... en mall som behandlar alla meriter lika" | fel | Samma som ovan: avsnitt kan väljas bort och mall kan bytas. Argumentet kan behållas i mildare form (strukturen styrs av fälten, inte av dig). | https://europass.europa.eu/en/create-europass-cv |
| 33 (snabbsvar) | "det säljer dig bättre än Europass låsta mall" | fel | Stryk "låsta", t.ex. "än Europass standardiserade upplägg". | som ovan |
| 108 | "vårt CV-verktyg, där ... innehållet anpassas mot varje annons" | fel (produkt) | CV-verktyget (/verktyg/skapa-cv) tar ingen annons som indata; det är brevverktyget som läser annonsen. Stryk "och innehållet anpassas mot varje annons" eller skriv "och du anpassar innehållet mot varje annons". | src/app/(public)/verktyg/skapa-cv/ (annons nämns bara om filformat), src/lib/cv/background-jobs.ts |
| 50 | "I delar av Syd- och Centraleuropa är Europass ett normalt inslag i vanliga jobbansökningar, särskilt i offentlig sektor" | obelagt | Ingen källa hittad. Mjuka upp till "I vissa länder är formatet vanligare, kolla platsannonsen" eller stryk landsangivelsen. | – |
| 46 | "Söker du tjänst ... inom EU:s organ är Europass ofta uttryckligen begärt" | obelagt | EPSO-ansökningar görs i eget formulär; vissa EU-byråers platsannonser ber om CV i Europassformat. Skriv "begärs ibland, t.ex. i vissa EU-byråers annonser; följ alltid annonsen". | – |

## Belagda påståenden
- UHR är samordnare och utsett nationellt Europass-center i Sverige: https://www.uhr.se/internationella-mojligheter/europass/det-har-ar-europass/
- Europass är EU-kommissionens initiativ, omfattar profil och CV, mobilitetsdokument m.m.: samma UHR-sida.
- CV och ansökningsbrev skapas på europass.europa.eu, exporteras som PDF, flera CV ur samma profil: https://europass.europa.eu/en/create-europass-cv
- Språknivå enligt GERS A1-C2: Europass självbedömningsskala (allmänt känd, samma plattform).
- Externa länkar i källraden (UHR x2, europass.europa.eu) svarar 200 och säger det som påstås.

## Rättning (omgång 1, 2026-11-15)
- Rad 20/130 (FAQ, båda ställena): rättat. "låst standardformat med förbestämda sektioner och layout" ersatt med standardiserad profil med fasta fält, där du väljer avsnitt och kan välja mellan några mallar men upplägget följer formulärets logik.
- Rad 60: rättat i mildare form: strukturen styrs av fälten, avsnitt kan väljas bort och mall bytas, men innehållet hamnar i formulärets ordning. "en mall som behandlar" blev "ett upplägg som behandlar".
- Rad 33 (snabbsvar): "låsta mall" blev "standardiserade upplägg". Även rad 106: "formatet är låst" blev "formatet är standardiserat".
- Rad 108 (produkt): rättat till "och du anpassar innehållet mot varje annons".
- Rad 50: obelagd landsangivelse struken, nu "I vissa länder är Europass ett vanligare inslag i jobbansökningar än i Sverige". Samma uppgift i FAQ "När ska jag använda Europass CV?" (frontmatter och brödtext): "som delar av Syd- och Centraleuropa" blev "länder där formatet är vanligare än hos oss".
- Rad 46: omskrivet till "kan vara uttryckligen begärt, till exempel i en del EU-byråers platsannonser, medan andra rekryteringar sker i egna ansökningsformulär".
- `updated` tillagt. Rubriker, FAQ-frågor och description oförändrade. Underlagets rader finns kvar ordagrant, bilden gjordes inte om.

## Andra granskningen (2026-11-15)
UNDERKÄND. Fem av sex fynd är rätt åtgärdade (rad 46 belagd: bl.a. EBA:s och HaDEA:s platsannonser begär "a curriculum vitae in Europass format"; rad 50, 33, 106 och 108 korrekta). Rättningen av "låst"-fyndet har däremot fört in ett nytt fel:

- Rad 61: "Strukturen styrs av fälten, inte av dig. Du kan välja bort avsnitt och byta mall, men innehållet hamnar i formulärets ordning". Fel: i Europass CV-editor kan avsnittens ordning ändras med pilarna till vänster, och enskilda poster inom ett avsnitt kan dras till önskad plats. Krävs: stryk "innehållet hamnar i formulärets ordning" och "Strukturen styrs av fälten, inte av dig". Behåll argumentet i belagd form, t.ex. att du arbetar inom fasta fält och en standardmall där formgivning och utrymme inte kan formas fritt efter tjänsten. Källa: Euroguidance-kursen om Europass-plattformen, "You can adjust the order of sections (e.g., Education, Work Experience) by using the arrows located on the left side of the CV Editor", https://www.euroguidance-formation.org/mod/book/view.php?id=903&chapterid=463
- Rad 21 och 131 (FAQ i frontmatter och FAQ-block): "upplägget följer formulärets logik. Ett vanligt CV formar du fritt efter tjänsten: du väljer ordning, betoning och utrymme." Kontrasten säger att du inte väljer ordning i Europass, vilket är fel enligt samma källa. Krävs: låt kontrasten gälla fria rubriker, formgivning och utrymme i stället för ordning, eller nämn att ordningen går att ändra. Samma ändring på båda ställena.
- Anmärkning (ej krav): rad 17/123 "Europass-mallens stela struktur" kan mjukas till "standardiserade struktur" för konsekvens med rad 33.

## Rättning omgång 2 (2026-11-15)
- Rad 61: struket "Strukturen styrs av fälten, inte av dig" och "innehållet hamnar i formulärets ordning". Ny lydelse: "Du arbetar inom fasta fält och en standardmall. Du kan välja bort avsnitt, ändra deras ordning och byta mall, men formgivning och utrymme formar du inte fritt efter tjänsten." Slutet av stycket mjukat från "motarbetas av ett upplägg som behandlar alla meriter lika" till "får mindre spelrum i ett upplägg som är byggt för jämförbarhet snarare än för att sälja dig". Kontrollerat mot Euroguidance-kursen (avsnittsordning med pilar, poster dras inom avsnitt).
- FAQ "Vad är skillnaden mellan Europass och ett vanligt CV?" (frontmatter och block, identiskt): "Du väljer vilka avsnitt som ska med, kan ändra deras ordning och välja mellan några mallar, men fälten och formgivningen är givna. Ett vanligt CV formar du fritt efter tjänsten: du väljer formgivning, betoning och utrymme." Ordning är borttagen ur kontrasten.
- Anmärkningen: "stela struktur" ändrat till "standardiserade struktur" i FAQ (frontmatter och block). Samtidigt rättat "Sök du jobb" till "Söker du jobb" i frontmatter så att båda ställena är lika.
- Ingen rubrik, FAQ-fråga eller description ändrad. Bildunderlaget citerar inte de ändrade raderna, bilden ej omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 61 och FAQ (rad 21/131) stämmer med Euroguidance-kursen: avsnittens ordning ändras med pilar, poster dras inom avsnitt, flera mallar finns och personaliseringen gäller bara logga, sidnumrering och avslutande text, så "fälten och formgivningen är givna" håller. "Stela" ändrat till "standardiserade". FAQ identiska, inga talstreck.
