# Faktagranskning: content/rekryterare/bakgrundskontroller.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: OK med en liten rättning. Rättsläget från 1 mars 2026, utredningen 2027 och kontrollernas form stämmer med källorna. Ett påstående saknar källa, och en händelse från 2025 bör nämnas.

Granskningen omfattar också komponenten BakgrundsKollen (src/components/mdx/BakgrundsKollen.tsx), som återger samma påståenden.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 38 | "två tidigare utredningar har föreslagit förbud utan att det blivit lag" | obelagt | Fondia skriver bara att förfarandet "har varit föremål för kritik och lagförslag om att framöver förbjuda detta". Antalet två gick inte att belägga i de källor som nåddes (känt exempel: SOU 2014:48 "Registerutdrag i arbetslivet"). Skriv "tidigare utredningar har föreslagit förbud" eller ange vilka utredningar det gäller. | https://fondia.com/se/sv/aktuellt/artiklar/bakgrundskontroller-vid-rekrytering-vad-ar-tillatet-och-hur-gor-man-ratt |
| 38 (komplettering) | "inte uttryckligen förbjuden idag" | komplettering, inget fel | Högsta domstolens beslut i februari 2025 underkände i praktiken frivilliga utgivningsbevis för bakgrundskontrollföretag. Företagen behöver nu särskilt tillstånd från IMY för att behandla brottsuppgifter. Det gäller inte arbetsgivare som ber kandidaten visa sitt eget utdrag, men det hör till "rättsläget i rörelse" och bör nämnas i en mening. | https://www.jpinfonet.se/kunskap/nyheter4/2026/mars/mojligheterna-till-bakgrundskontroller-av-anstallda-och-arbetssokande/ |

## Belagda påståenden
- Sedan 1 mars 2026 utökad registerkontroll i kommun: arbete i hemmet hos äldre och vuxna med funktionsnedsättning (SoL, LSS, 12 kap. HSL), roller som rör barn och vissa ledande befattningar, för vissa roller även misstankeregistret. Den sökande visar själv upp ett begränsat utdrag, och arbetsgivaren får bara anteckna att utdraget visats: riksdagens betänkande. https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/utokade-registerkontroller-vid-anstallning-i_hd01juu22/html/ ; JP Infonet mars 2026 (ovan)
- Skolväsendets kontroller har utökats (misstankeregistret ingår, och utdraget får vara högst sex månader gammalt i stället för ett år): samma betänkande.
- Statlig utredning redovisas 2027: dir. 2025:83 "Ett ändamålsenligt regelverk för bakgrundskontroller", ska redovisas senast 11 mars 2027. https://www.regeringen.se/rattsliga-dokument/kommittedirektiv/2025/09/dir.-202583
- Att be kandidaten frivilligt visa utdrag är en kritiserad gråzon som inte är uttryckligen förbjuden: Fondia (ovan).
- Kreditupplysning kräver legitimt behov och kandidaten får en omfrågandekopia: kreditupplysningslagen (1973:1173) 9 § och 10 §. Fondia nämner roller med högre position och stora belopp, t.ex. ekonomichef.
- Missgynnande som har samband med graviditet räknas som könsdiskriminering: diskrimineringslagen (2008:567) 1 kap. 4 §.
- Hälsouppgifter är känsliga personuppgifter: GDPR art. 9. Uppgifter om lagöverträdelser får som huvudregel bara behandlas med stöd i lag: GDPR art. 10 och svensk dataskyddslag.
- Registerkontroll med lagstöd inom skola/förskola och LSS-verksamhet med barn: skollagen 2 kap. 31 § samt lag (2010:479) om registerkontroll av personal som ska arbeta med barn med funktionsnedsättning.

## Rättning (omgång 1, 2026-11-15)
- Rad 38 (obelagt): "två tidigare utredningar" -> "tidigare utredningar".
- Rad 38 (komplettering): en mening om HD:s beslut i februari 2025 (frivilliga utgivningsbevis underkända i praktiken, bakgrundskontrollföretag behöver tillstånd från IMY) tillagd, med förtydligandet att det gäller företagen och inte arbetsgivare som ber kandidaten visa sitt eget utdrag. Källa: JP Infonet mars 2026, som redan finns i källraden (kontrollerad 2026-11-15).
- BakgrundsKollen.tsx innehåller inte "två utredningar"; ingen ändring där.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Ingen artikelbild berörd (insiktsartikel). Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. HD-meningen bärs av JP Infonet (mars 2026, i källraden): HD:s två beslut 2025-02-25 (Ä 3169-24 och Ä 3457-24) "underkänner i praktiken behandling av personuppgifter genom frivilliga utgivningsbevis", och bakgrundskontrollföretagen hänvisas till särskilt tillstånd från IMY. "Tidigare utredningar har föreslagit förbud" stämmer i plural: SOU 2009:44 Integritetsskydd i arbetslivet och SOU 2014:48 Registerutdrag i arbetslivet föreslog båda förbud för arbetsgivare att utan lagstöd begära registerutdrag. Rekommendation utan krav: lägg gärna till de två SOU:erna i källraden. Inga talstreck i ändrade rader.

## Svar till samordnaren
rekryterare-bakgrundskontroller, GODKÄND, inga brister (rekommendation: SOU 2009:44 och SOU 2014:48 kan läggas i källraden).
