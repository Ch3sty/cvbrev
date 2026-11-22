# Not: en artikel med mallvisaren (skiss `brev-artikel`)

Källa: `sidor/brev-artikel.html`, med `delar/brev-exempel-visare-stil.html`, `delar/brev-exempel-minirad.html` och `delar/brev-artikel-a4.html` (brevet för säljare på arket). Bilder: `bilder/brev-artikel-375-*.png`, `-412-*`, `-1440-*`.
Artikeln: `content/artiklar/hur-skriver-man-ett-personligt-brev.mdx`, som har `<PersonligtBrevPreview yrke="saljare" />`. Kod: `src/components/publikt/brevvisare/BrevVisareArtikel.tsx`, `BrevVisare.tsx`, `brevvisare.css`, `src/components/mdx/personligt-brev-preview-data.ts`, `src/components/artiklar/reklam/ArtikelReklam.tsx` (InlineKort) och `reklam-copy.ts` (INLINE.brev).

Skissen gäller tre saker: visaren i spalten, "Läs brevet som text" och reklamrutan för personliga brev. **Artikelns ram (huvudet, sidokolumnen, bilden, slutkortet) är förenklad och ska inte läsas som ett förslag.** Den ritas av den som ritar artiklarna. Skissbladen (streckad kopparram) markerar var artikelns text hoppas över. Annas brev i citatet är avkortat i skissen, inte i artikeln.

## Vad som ändras mot i dag

1. **Visaren i artikelspalten** har samma form som på exempelsidorna: plommonyta med klack, arket med grannmallen bakom, fem miniatyrer. I spaltens bredd på dator (760 px) står miniatyrerna som lodrät remsa till höger, på telefon som rad **över** arket (i dag under). Överst etiketten "Samma brev i fem mallar".
2. **Sockeln**: namnraden "Linne. Gratis, även som Word.", textlänken "Skriv ditt eget brev" med pil (ingen fylld knapp i artiklarna, som i dag), fotraden ordagrant och efter den länken "Se alla 40 mallar".
3. **Läs brevet som text** är en utfälld `details` sist i sockeln, i samma kort som visaren, med plus och minus i en liten ruta som i frågorna. Huvudraden (namn, företag, ärende) i grått, brevet i läsbar storlek. På telefon är det här brevet går att läsa, så den ska vara utfälld från start som i dag.
4. **Reklamrutan för personliga brev** (efter andra stycket) är ett plommonkort med klack: etiketten Personliga brev, rubriken som stycke, texten, kopparknappen och paketraden. Bilden är ett riktigt brevark med två markerade krav och märket "3 av 4 krav har fått svar", i stället för ett objekt eller en telefon. På telefon ligger arket under texten, beskuret.

## Visaren: det som gäller i skissen

Inga rubriker, inga kronor, ingen spärr. Linne står i HTML från start (arket, namnraden, fotraden och brevet som text). Fem miniatyrer i ordningen Linne, Björk, Koppar, Ritning, Terrakotta. Samma komponent i alla tre sammanhangen: de tre artiklarna med motorns exempelbrev har ingen "Läs brevet som text", i övrigt är de lika.

## Oförändrat för SEO

- Artikelns text, rubriker (H1, H2, H3), FAQ, HowTo-data, bild och interna länkar är orörda. Skissen ändrar ingenting i mdx-filen.
- Visaren lägger inte till några rubriker. "Läs brevet som text" är en `summary`, inte en rubrik.
- Brevets text står i HTML som i dag, ur samma data som arket.
- Reklamrutans rubrik är ett stycke (p), aldrig h2 eller h3, som i dag.
- Ny länk: /cv-mallar från fotraden ("Se alla 40 mallar"). Gäller 22 artiklar.

## Påståenden att se över (inte ändrade i skissen)

- Reklamrutans paketrad: "Personliga brev utan tak, som PDF, ingår i Premium, 149 kr i månaden." Sant, men Word finns också (26 av 40 mallar). Säljsidan säger "PDF och Word". Den som ritar `artikelreklam` och textspåret avgör.
- Reklamrutans text "Ett personligt brev var sjunde dag att läsa på skärmen, gratis" stämmer med facit (första brevet gratis, sedan ett per rullande sju dagar).
- Brevet för säljare har "23%" och "45 MSEK". Det är artikelns data och orört.

## Det som kräver beslut

1. **Länkens mål.** I skissen bär länken "Skriv ditt eget brev" med sig mallen som är vald (`/skapa-brev/start?mall=<id>`), om startflödet byggs för det. Länktexten är densamma som i dag.
2. **"Se alla 40 mallar"** i fotraden: en ny intern länk till /cv-mallar på 22 artiklar. SEO tar ställning.
3. **Reklamrutans bild.** Skissen visar ett ark. Den andra agenten ritar alla varianter. Blir deras brevvariant en annan gäller deras.
4. **Arkets storlek på telefon.** Brevet på arket går inte att läsa på 375 px, och ska inte behöva det: texten står under. Vill ägaren ha ett läsbart ark på telefon måste arket gå att förstora, och det är en ny funktion.

## Filer bygget rör

- `src/components/publikt/brevvisare/BrevVisare.tsx`, `brevvisare.css`, `BrevVisareArtikel.tsx` (details-rutans form), `visare-data.ts` (fotradens länk).
- `src/components/artiklar/reklam/ArtikelReklam.tsx` (InlineKort för brev) och dess CSS.
- Inga mdx-filer.

## Förslag till grunden

- Artikelspaltens typografi (stycke, rubriker, citat, lista) finns inte i kit.css. Jag har en enkel `.art` i sidan. Den som ritar artiklarna bör lägga den i grunden, så att inbäddade komponenter (visaren, reklamrutan, proven) kan ritas mot samma spalt. Tänk på att stilen ska gälla spaltens egna stycken (`.art > p`) och inte läcka in i komponenterna: det var mitt första fel här.
