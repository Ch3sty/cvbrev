# Not: /verktyg/skapa-cv

Skiss: `sidor/skapa-cv.html`, byggd till `ut/skiss-skapa-cv.html`, renderad i 375, 412 och 1440 och granskad i bilderna. Rum `cv`. Arket ligger i `delar/skapa-cv-ark.html` och används två gånger.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Telefonen med den gamla byggaren är borta. I dess ställe står arket i stor skala, som nya byggaren ser ut: Saras CV i Linne med riktig text, avsnittet Arbetslivserfarenhet öppet (kopparram), knappen "Skriv punkter åt mig" inne i avsnittet, den föreslagna punkten markerad, och Utbildning med grå exempeltext och "+ Lägg till utbildning". En bricka svävar över: "Jobbcoachen föreslår" med tre punkter att kryssa för. Märket "Mallen Linne, gratis" sitter på arket.
2. **Startbladet är det lyfta kortet** och sidans första handling: frågan "Vilket jobb söker du?" med fältet, de två ingångarna (Ladda upp ett CV du har, Skriv från början) och knappen Bygg mitt CV gratis. Det är byggarens egen start. Till höger: blocket om Linne ("Så ser arket ut") med den riktiga miniatyren, märkena Gratis och Även som Word och fältet "Prova Linne med ditt namn".
3. **Så fungerar det.** De fyra HowTo-stegen som en väg, vart och ett med en bild: titeln och rubrikerna den ger, de två ingångarna, arket med ett öppet avsnitt, tre riktiga mallminiatyrer.
4. **Det här gör CV-byggandet enkelt.** En färgplatta med arket och fyra numrerade nålar: 1 arket är byggaren, 2 Jobbcoachen skriver punkterna, 3 rubriker som följer yrket, 4 PDF eller Word (nålen sitter på verktygsraden under arket: typsnitt, färg, byt mall, PDF och Word). De fyra punkterna står som numrerad lista bredvid. De övriga fyra fördelarna är kort med var sin lilla bild under plattan. I dag: åtta likadana textkort.
5. **Mallar som passar din bransch.** Linne, Björk och Koppar som kort med riktiga miniatyrer och märken (Gratis, Premium, Word, Foto). Under dem en rad med sju miniatyrer till, talet "37 mallar till" och knappen Se alla mallar.
6. **Gör skillnad i varje ansökan.** En färgplatta med tre stora tal (1 fil, 0 kr, Alla 40), vart och ett med sin H3 och text.
7. **Skapa ditt CV gratis på minuter.** Premium-plattan med priset och fem bockar.
8. **Vanliga frågor.** Åtta frågor.

## Oförändrat för SEO

- H1 och de sex H2 ordagrant och i samma ordning. Alla H3 kvar (fyra steg, åtta fördelar, tre mallar, tre under Gör skillnad).
- Texterna i steg, fördelar, mallar och FAQ är dagens.
- Länkar kvar: Ladda upp ditt CV, Linne (till mallen), Skapa mitt CV gratis, Se alla mallar, Se CV-exempel först, Hör av dig.
- Schema: WebApplication, Offer, HowTo (fyra steg, läsbara), FAQPage (åtta frågor). FAQ-svar som inte ändras är märkta "Svaret står kvar som i dag" i skissen.

## Bytt för att det var osant eller oprecist

| Var | I dag | I skissen |
|---|---|---|
| Premium-plattan | "hela CV-analysen ... ingår i Premium" | "CV-analysens alla förslag" (poängen och genomgången är gratis för varje CV) |
| Hjältens tredje bricka | "3 förslag på punkter från Jobbcoachen, gratis" | "3 förslag på punkter, gratis" (bara kortat för 375 px) |
| Kampanjpriser | 99 kr och 49 kr första månaden | inte ritade |

Inget annat påstående avvek från facit: 40 mallar, 2 gratis, 26 som Word, 3 förslag gratis per konto och 30 per dygn i Premium stämmer med `katalog.ts` och `quotaService.ts`.

## Kräver beslut

- **"Vilket jobb söker du?" står som stor text i det lyfta kortet men är ingen rubrik** (sidan har ingen H2 där i dag, och jag har inte lagt till någon). Vill SEO ha en H2 på startbladet får den en egen lydelse.
- **Startbladet på sidan**: ska fältet och de två ingångarna fungera direkt här (titeln följer med till registreringen), eller är det en bild med en knapp?
- **FAQ-svaret "laddar ner det som PDF en gång"** står kvar ordagrant. Jag har inte kunnat belägga "en gång" i koden och har inte ändrat det.
- **Mallminiatyrerna är 112 px breda.** I korten visas de i 112 till 150 px. Större bilder kräver nya exporter.
- **Exemplet på arket** (ställverket i Kungälv, 42 miljoner, fyra upphandlingar) är Saras påhittade CV, som i övriga skisser.

## Filer bygget rör, så långt det syns

- `src/app/(public)/verktyg/skapa-cv/page.tsx`, `components/skapa-cv-faq-data.ts` (inga svar ändras).
- `src/components/publikt/VerktygsMall.tsx` (sidan behöver platser för arket, startbladet och plattan med nålar) och `telefon/skarmar/SkarmSkapaCv.tsx` (utgår här).
- `src/components/cv/MallMiniatyr.tsx` (används redan), `src/components/cv/Dokument/` (arket bör ritas med byggarens riktiga komponenter i ett låst läge, inte som en kopia).
- `src/lib/cv/mallar/katalog.ts` och `src/lib/cv/template-antal.ts` (läses, ändras inte).

## Förslag till grunden

- `delar/cv-ark.html` är analysens ark (grå rader, numrerade nålar). Byggarens ark med riktig text, öppet avsnitt och exempeltext finns nu i `delar/skapa-cv-ark.html` med stilen `.bark` i sidans `<style>`. Flyttas stilen till kit kan funktionssidan och startsidan använda samma ark.
- En klass för mallminiatyr med klack (`.mini` här: vit yta, 2 px kant, 5 px klack, 112:158) behövs på flera sidor.
