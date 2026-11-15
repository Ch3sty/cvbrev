# Faktagranskning: content/artiklar/skillnad-cv-personligt-brev.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, inga statistiska påståenden, men två produktlöften om oss som inte stämmer med koden och en formulering som gör våra exempel till verkliga kandidater.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 23, 293 (FAQ) | "Med vår tjänst ... kan du skapa både ett anpassat CV och personligt brev på cirka 20-30 minuter totalt, eftersom den utgår från jobbannonsen och ditt CV samtidigt" | obelagt (produkt) | Brevverktyget utgår från CV och annons (belagt), men CV-verktyget anpassar inte CV:t mot annonsen och tidsåtgången är inte mätt. Ersätt med "Med vårt brevverktyg får du ett första utkast som utgår från ditt CV och annonsen, så du lägger tiden på att finslipa i stället för att börja från noll". | src/app/(public)/verktyg/personligt-brev/, src/app/(public)/verktyg/skapa-cv/ |
| 23, 293 (FAQ) | "Att skriva ett CV från grunden tar ofta 2-4 timmar ... anpassning 15-30 minuter ... brev 1-2 timmar" | obelagt | Ingen källa. Formulera som uppskattning ("räkna med ungefär") eller stryk siffrorna. | – |
| 242 | "Se exempel på framgångsrika ansökningar: Utforska våra CV-exempel för att se hur andra kandidater har strukturerat sina dokument" | påhittat | CV-exemplen är konstruerade exempel, inte verkliga kandidaters ansökningar och inte belagt "framgångsrika". Ersätt med "Se exempel per yrke: våra CV-exempel visar hur ett färdigt CV kan se ut för 89 yrken". | src/app/(public)/cv-exempel/[yrke]/page.tsx |

## Belagda påståenden
- Brevverktyget tar både CV och annons som indata (rad 234, 240): src/app/(public)/verktyg/personligt-brev/ ("Du laddar upp ditt CV ... klistrar in jobbannonsen").
- "Gratis att testa" (rad 240) och CV-analys "gratis" (rad 241): gratisnivån ger ett personligt brev (att läsa) och en CV-analys med poäng och tyngsta fynd. Stämmer så länge det inte utlovas nedladdning eller full analys.
- Exempelpersonerna (Anna Svensson, TechRetail AB, StyleShop AB) är tydligt märkta exempel med fiktiva företagsnamn.

## Rättning (omgång 1, 2026-11-15)
- Rad 23/293 (FAQ, båda), produkt: löftet om anpassat CV + brev på 20-30 minuter struket. Nu: "Med vårt brevverktyg får du ett första utkast som utgår från ditt CV och annonsen, så du lägger tiden på att finslipa i stället för att börja från noll." Länken till /verktyg/personligt-brev kvar (länktext "jobbcoach.ai" blev "brevverktyg").
- Rad 23/293 (FAQ, båda), tider: omskrivna som uppskattning ("Det varierar, men räkna med ungefär 2–4 timmar ... ungefär 15–30 minuter ... ungefär 1–2 timmar").
- Rad 242: "framgångsrika ansökningar" och "andra kandidater" struket, nu "Se exempel per yrke: Våra CV-exempel visar hur ett färdigt CV kan se ut för 89 yrken".
- Rad 241 (utan fynd, produktfakta): meningen antydde att CV-analysen går igenom både CV och annons; förtydligat att analysen granskar själva CV:t.
- `updated` tillagt. Rubriker, FAQ-frågor och description oförändrade. Underlagets rader finns kvar, bilden gjordes inte om.

## Andra granskningen (2026-11-15)
GODKÄND. Produktlöftet om anpassat CV och brev på 20-30 minuter är borta, och brevverktyget beskrivs som ett utkast utifrån CV och annons, vilket stämmer. Tidsuppgifterna står som uppskattning. CV-analysen beskrivs som granskning av själva CV:t, utan annonsjämförelse. CV-exemplen beskrivs som exempel för 89 yrken, inte som verkliga kandidater. FAQ i frontmatter och FAQ-block är identiska. Tidsintervallen använder kort tankstreck (–), inget talstreck (—).
