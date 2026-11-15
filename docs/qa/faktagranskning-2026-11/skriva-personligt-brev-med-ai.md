# Faktagranskning: content/artiklar/skriva-personligt-brev-med-ai.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Kriminalvårdsexemplet och citatet stämmer, men motiveringen tillskrivs fel och två generaliseringar saknar källa.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 36 | "motiverade det tydligt: med 150 000 ansökningar per år gick det inte längre att lita på brevet som urvalsverktyg" | fel (felaktig tillskrivning) | Kriminalvården motiverade beslutet med att brevet kan vara AI-skrivet, att brevet ibland innehåller irrelevant information som ökar risken för bias, och med kortare ledtider och mindre administration. Siffran är "fler än 150 000 ansökningar förra året" (2025). Den är inte myndighetens motivering. Skriv: "Kriminalvården, som fick över 150 000 ansökningar förra året, slopade brevet vid årsskiftet 2025/2026 och ersatte det med urvalsfrågor. Skälen: brevet kan vara skrivet av AI, det innehåller ofta irrelevant information som ökar risken för bias, och det förlänger processen." | https://www.publikt.se/nyhet/personligt-brev-slopas-vid-jobbansokan-27585 ; https://nyheter24.se/nyheter/inrikes/1452124-kriminalvarden-slopar-personligt-brev-pa-grund-av-ai |
| 38 | "Majoriteten av privata företag och många offentliga verksamheter ber fortfarande om ett personligt brev." | obelagt | Ingen mätning hittad. Mjuka upp: "Många arbetsgivare ber fortfarande om ett personligt brev." | – |
| 75 | "missar att spegla annonsens exakta formuleringar, vilket kan sänka poängen i ATS-system innan en människa ens läst brevet" | obelagt | Det finns inget belägg för att svenska ATS poängsätter personliga brev automatiskt. Mjuka upp till "gör det svårare för den som söker på nyckelord i ansökningarna", eller stryk. | – |
| 67, 73 | "på under en minut" | obelagt (produkt) | Generationstiden är inte bekräftad i koden. Skriv "på någon minut". | – |

## Belagda påståenden
- Kriminalvården slopade kravet på personligt brev vid årsskiftet 2025/2026 och ersatte det med urvalsfrågor (publikt.se, nyheter24, kriminalvardsmagasinet.se).
- Hanna Frummerin, enhetschef för verksamhetsnära HR. Citatet "Vi kan inte längre, utifrån utveckling av AI och språkmodeller, utesluta att det personliga brevet skrivs av AI, och vi ser framåt att brevet på det sättet tappar sitt värde" återges korrekt (publikt.se).
- "Flera statliga myndigheter har gjort samma sak": Kriminalvården uppger att många andra statliga arbetsgivare redan har gjort ändringen (publikt.se). Inga myndigheter namnges.
- Interna länkar (/verktyg/personligt-brev, personligt-brev-innehall-checklista, hur-langt-ska-personligt-brev-vara, hur-skriver-man-ett-personligt-brev) finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 36 (fel tillskrivning): rättat. Siffran står nu som bakgrund ("som fick över 150 000 ansökningar under 2025", publikt.se 15 jan 2026 säger "förra året") och Kriminalvårdens tre faktiska skäl anges: AI-risken, irrelevant information som ökar risken för bias, längre process. Att brevet ersattes med urvalsfrågor är tillagt. Kontrollerat mot publikt.se.
- Rad 38 (obelagt): mjukat upp till "Många arbetsgivare, både privata och offentliga, ber fortfarande om ett personligt brev."
- Rad 75 (obelagt, ATS-poäng): omskrivet till att brevet blir svårare att hitta för den rekryterare som söker på nyckelord bland ansökningarna.
- Rad 67, 73 (obelagt, produkt): "på under en minut" ändrat till "på någon minut" på båda ställena.
- Källrad tillagd sist: Publikt (2026).
- `updated: "2026-11-15"` tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget citerar inga ändrade meningar, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND. Rättningen av rad 37 är i övrigt korrekt: över 150 000 ansökningar förra året, urvalsfrågor, AI-skälet, kortare ledtider och citatet stämmer ordagrant (publikt.se 15 jan 2026). Att det skedde vid årsskiftet bekräftas av TT, 13 jan 2026. Rad 38, 68, 74 och 76 samt källraden är OK.
- Rad 37: "det innehåller ofta irrelevant information som ökar risken för bias". Publikt skriver "brevet ibland innehåller irrelevant information, vilket enligt Kriminalvården kan öka risken för partiskhet". "Ofta" och "ökar" säger mer än källan. Krävs: "det kan innehålla irrelevant information som kan öka risken för partiskhet".

## Rättning omgång 2 (2026-11-15)
- Rad 37: "det innehåller ofta irrelevant information som ökar risken för bias" -> "det kan innehålla irrelevant information som kan öka risken för partiskhet", i linje med Publikt ("ibland ... kan öka risken för partiskhet"). Inga andra förekomster av "bias" i artikeln.
- Rubriker, FAQ, description oförändrade. Raden citeras inte i underlaget; bilden inte omgjord. Inga talstreck.

## Produktsvep (2026-11-15)
- "Du laddar upp ditt CV eller beskriver din bakgrund" blev "Du väljer ett av dina sparade CV eller laddar upp ett nytt" (brevverktyget utgår från ett CV, det finns inget fritextläge för bakgrund).
- Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 37 lyder nu "det kan innehålla irrelevant information som kan öka risken för partiskhet", i linje med Publikt. Produktsvepet ("Du väljer ett av dina sparade CV eller laddar upp ett nytt") stämmer med koden: CvPickerGrid.tsx i skapa-brev har både val av sparat CV och "Ladda upp ett nytt CV". Inga talstreck i ändrade rader.
