# Art-director: artikelbilderna i svepet 15 november 2026

Granskat mot `scripts/design-standard.md` och konceptet "På bordet". Sex QA-bilder i scratchpad, underlagen i `docs/qa/artikelbilder/underlag/`, artiklarna i arbetskopian. Skriptets validering är grön på alla sex; det här är ögats och innehållets granskning: visar bilden en riktig bit av det man får efter klicket, sitter orange på exakt rätt sak, håller etikett, alt-text och läsbarhet i 360 px.

Utfall: fyra godkända, två ändras (din-digitala-jobbcoach, online-cv-byggare-gratis). Ändringarna är små fältbyten i underlaget, inget i mallen.

## 1. din-digitala-jobbcoach (Intervju) – ändra

**Lika långa staplar: ja.** Artikeln namnger de fyra delarna utan att väga dem ("be om återkoppling på om svaret har situation, uppgift, handling och resultat"). Lika staplar läses som en checklista, inte som proportioner, och det är precis vad artikeln säger. Behåll `delar` med 0.5 och `delarKalla` som de är.

**Orange på Resultat: nej.** Färg är ett påstående på samma sätt som en proportion. I STAR-artikeln bär Handling orange därför att artikeln säger "Handlingen är den längsta delen". Här säger artikeln ingenting om att resultatet är den viktiga delen av intervjusvaret; betoningen på siffror gäller CV-raderna (steg 3) och brevet, inte svaret på intervjun. Samma invändning gäller Handling. Ingen av delarna har stöd, alltså ska ingen av dem vara orange.

**Lösning: ringen bär orange, delarna står grå.** Mallen tillåter det (`vanster.typ: "ring"`, alla delar `false`). Ringen visar det artikeln faktiskt lovar i intervjusteget: tre frågor en rekryterare troligen ställer. Då läses kortet uppifrån och ner som FAQ-svaret: du frågar "Kan jag öva intervju med AI?", du får tre rekryterarfrågor och återkoppling på S, T, A, R. En stor orange ring med "3" är dessutom en tydligare blickpunkt i 360 px än en 18 px stapel. Priset är att bockkortet med coachens tre uppgifter försvinner; bredden bärs i stället av etiketten "Digital jobbcoach" och frågans "med AI". Det är ett rimligt byte: hellre en sann sak i orange än tre rader och en färg utan stöd.

Ändra i underlaget:

- `fyll.delar`: alla fyra med `false` som fjärde värde (behåll 0.5 och `delarKalla`).
- Ta bort `fyll.vanster` med bockarna och sätt:
  ```json
  "vanster": {
    "typ": "ring",
    "tal": { "text": "3", "kalla": "de tre frågor en rekryterare troligen ställer" },
    "enhet": "frågor",
    "text": "en rekryterare troligen ställer"
  }
  ```
  Källraden står ordagrant i steg 5: "be om de tre frågor en rekryterare troligen ställer utifrån kraven". "frågor" och "en rekryterare troligen ställer" finns i texten och mäts som vanligt (enheten ryms på en rad, texten bryts på två).
- `alt`: "Fråga till en digital jobbcoach om intervjuövning, svarets fyra delar enligt STAR och tre frågor" (14 ord). Nuvarande alt kallar frågan "intervjufråga", vilket den inte är, och säger "resultatet markerat".
- Chip DIN FRÅGA, frågan och etiketten: godkända.

Observation utanför min roll, till SEO-strategen: taggen "intervjuförberedelse" lägger artikeln i intervjuklustret, så hjälten får testkortet och Hela paketet medan artikeln säljer Jobbcoachen. Karriär-mallen (coachkortet med FAQ-frågan och "Ja, och det är en av de bästa användningarna.") hade varit den naturliga bilden. Mallen väljs ur koden, så det avgörs av taggarna, inte av underlaget.

## 2. fardiga-personliga-brev (Personligt brev) – godkänd

Inledningen ur ekonomiassistentbrevet inringad är exakt den rad artikeln säger att du måste skriva om ("Det är här kopior syns först"). Orange på rätt sak. De tre stegen är steg 2, 4 och 5 ur metoden, ordagrant, och två av dem bryts på två rader utan att kortet blir trångt. Etiketten "Färdiga personliga brev" (3 ord, 23 tecken) är sökordet självt. Alt 14 ord med sökordet en gång. Läsbar i 360 px: inringningen och "Hej," syns, raderna i bockkortet går att läsa.

## 3. online-cv-byggare-gratis (CV) – ändra (två små fält)

Resultatraden under ERFARENHET, med PROFIL som grå rader ovanför, är rätt placering och rätt sak i orange: artikelns slutsats är att byggaren gör layouten och du gör innehållet, och raden är dess eget exempel. De tre kontrollerna är steg 1, 2 och 4 ur howto. Etiketten "CV-byggare online" godkänd.

- `fyll.namn`: "Emma Karlsson". Standarden säger att personen ska vara samma som på exempelsidorna där yrket finns, och butikssäljaren på /cv-exempel och /personligt-brev-exempel heter Emma Karlsson (Emma Svensson är personlig assistent). Båda namnen passerar valideringen, så det är bara konsekvensen som styr.
- `alt`: "CV i en CV-byggare online med en resultatrad för en butikssäljare och tre kontroller" (14 ord). "online CV-byggare" är engelsk ordföljd; etiketten och sökorden säger "CV-byggare online".

## 4. angest-jobbet-dags-att-byta (Karriär) – godkänd

De tre nya raderna är de fetade inledningarna i avsnittet om att hantera ångesten under tiden, ordagrant, och alla ryms på en rad var, vilket ger ett lugnare kort än livebilden med en tvåradig första rad. Frågan och svarets första mening är FAQ:ns. Orange bara på Jobbcoachens avatar, som mallen föreskriver. Alt oförändrad och korrekt.

## 5. personligt-brev-utbildning (Personligt brev) – godkänd

Bytet från kandidatexemplet till "Jag söker masterprogrammet i interaktionsdesign vid Norrviks högskola." är bättre än livebilden, inte bara ordagrant: artikeln säger själv att brevet spelar roll på masterprogram men inte på grundnivå, och att kandidatexemplet förutsätter ett påhittat urval. Bilden visar nu ett brev där brevet faktiskt läses. Ansökansraden "masterprogrammet" följer med. De tre tipsen är rubrik 1 till 3 i tipslistan. Alt 14 ord, nämner masterprogrammet, stämmer med bilden.

## 6. skriva-personligt-brev-med-ai (Personligt brev) – godkänd

Den inringade meningen är första meningen i det redigerade brevet ("Efter redigering: konkret, personligt och bevisat"), alltså resultatet av det artikeln lär ut, inte utkastet. Rätt sak i orange. De tre nya raderna är ordagranna delar av checklistans tre punkter och ersätter livebildens omskrivningar; första raden bryts på två utan trängsel. Etiketten "Brevet med AI" godkänd, alt oförändrad.

## Gemensamt innan push

- Frontmatterns `imageAlt` och första `<CustomImage>` i de tre omskrivna artiklarna har fortfarande gamla alt-texter (din-digitala-jobbcoach: "Utkast från en digital jobbcoach till en säljroll...", online-cv-byggare-gratis: "...för en säljare och tre steg", fardiga-personliga-brev: "...första meningen inringad, med tre steg"). Kör `byt-artiklar.mjs` efter att underlagen är rättade så att alt i artikeln är underlagets alt.
- Läsbarheten i 360 px är god på alla sex: etiketten, inringningen eller bubblorna och bockraderna håller; inget kort trängs mot ljusskivan eller säkra zonen.

**Runda 2 (15 november):** din-digitala-jobbcoach omritad med ringen "3 frågor / en rekryterare troligen ställer" som enda orange och alla fyra STAR-delar grå; online-cv-byggare-gratis med Emma Karlsson; båda alt-texterna enligt ovan och synkade i frontmatter och första CustomImage för alla tre omskrivna artiklar. Validering 6 av 6 grön. Alla sex bilder godkända, ingenting återstår på bildsidan. Att intervjuklustret nu ger coachkortet inline gör bilden och hjälten eniga om vad man får efter klicket; mallen Intervju står kvar och är rätt för den bild som nu ritats.
