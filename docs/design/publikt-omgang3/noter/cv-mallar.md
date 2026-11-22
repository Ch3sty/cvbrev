# Not: /cv-mallar

Skiss: `sidor/cv-mallar.html`, byggd till `ut/skiss-cv-mallar.html`, renderad i 375, 412 och 1440 och granskad i bilderna. Rum `cv`. Delar: `delar/cv-mallar-yrken.html` (74 yrken), `delar/cv-mallar-alla.html` (40 mallar), `delar/cv-mallar-word.html` (26 Word-mallar), `delar/cv-mallar-faq.html` (21 frågor) och `delar/skapa-cv-ark.html` (arket).

Löptexten i de långa sektionerna, yrkenas rubriker och texter, Word-mallarnas texter och alla FAQ-svar är lagda in maskinellt och ordagrant ur `underlag/text-live-2026-11-22/cv-mallar.txt`. Ingenting är omskrivet utom det som står under "Bytt" nedan.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Väggen i petrol med åtta riktiga mallminiatyrer som en vägg av ark, Gratis som chip på Linne och Björk. Fyra talbrickor bär facit: 40 mallar, 2 gratis, 26 som Word, 15 med foto. H1 och ingressen som i dag.
2. **Det lyfta kortet är mallväljaren** (finns i dag, `ProvaArbetsyta`): vänster "Ladda upp ditt CV" med släppytan, "eller skriv ditt namn och börja från början" med två fält och raden "Börja från din situation" (Student, Utan erfarenhet, Karriärbyte, Chef). Höger: Saras CV i Linne med valen bredvid (typsnitt, fyra färger, ordning, PDF eller Word, Ladda ner PDF) och "Föreslagna för dig" med tre miniatyrer och länken Visa alla 40 mallar. Allt innehåll är dagens, formen följer Mallar i det inloggade läget.
3. **CV-mallar för ditt yrke.** De 74 yrkena står i dag som en lång rad likadana kort med kategorin som liten etikett. I skissen är de tio grupper (Vård 15, Utbildning 8, Student 2, Service 19, Ekonomi 7, Logistik 6, Hantverk 1, Tech 6, Teknik 3, Offentlig sektor 7), var och en ett pappersblock med gruppens namn, antalet som chip och yrkena som kort (H3, texten, "Gratis eller i Premium" och Se mall). Ett sökfält "Sök ditt yrke" står över. På dator visas åtta per grupp och resten bakom "Visa alla 15 i Vård", på telefon tre.
4. **Alla våra CV-mallar.** Filterchips med antal som i det inloggade läget (Alla 40, Gratis 2, Word 26, Foto 15, En spalt 17, Sidospalt 5, Rubriker i marginalen 4, Konstnärlig 14) och alla 40 mallar som kort med klack: riktig miniatyr, formatmärket PDF och W, namnet, Gratis eller Premium som chip och en rad om stilen. Gratismallarna har grön kant. Åtta per rad på dator, tre på telefon. Under rutnätet en Premium-remsa: 38 mallar till, Word i alla 26, priset.
5. **CV-mallar för Word.** En färgplatta med rubriken, hela ingressen och talet 26 bredvid en .docx-fil. De 26 mallarna som kort med miniatyr, H3 och text; Linne och Björk har chippet Gratis som Word. På telefon sex kort och "Visa alla 26 Word-mallar".
6. **Så fungerar det.** Fyra steg som en väg med bilder: tre mallar, arket med ett öppet avsnitt, samma CV i tre mallar, PDF och Word.
7. **Mer än en snygg layout.** Åtta kort med var sin lilla bild (40 av 40 lästes rätt, PDF + Word, fyra färgprickar, ordningen, fotoplats 15, kontaktraden med LinkedIn, Sparat, telefon och dator).
8. **Vad gör en bra CV-mall för svenska arbetsgivare?** Fyra numrerade artikelkort, vart och ett med etiketten, H3, en liten bild av poängen och hela löptexten med länkarna.
9. **Var hittar man en gratis CV-mall?** Två spalter: löptexten till vänster, de tre malltyperna vi avråder från till höger som små ritade ark med felet utmärkt (textruta, tabell, sidhuvud), och stycket "Hos oss är Linne och Björk gratis" som mörk platta med de två miniatyrerna.
10. **PDF eller Word?** Två kort mot varandra (PDF är förvalet, Word när annonsen ber om det) och de två vanliga misstagen under, med filnamnen som bild (Dokument1.pdf överstruket, Anna-Andersson-CV.pdf).
11. **Mallar efter stil.** Tre mörka kort med stort tal (26, 15, 17), namnet, raden och fyra miniatyrer.
12. **Vanliga frågor.** 21 frågor, svaren ordagrant.
13. **Letar du efter ett färdigt CV-exempel i stället?** En färgplatta med knappen och två tal (89 exempel, 74 yrken).

## Oförändrat för SEO

- H1 och alla 11 H2 ordagrant och i samma ordning.
- Alla H3 kvar: 74 yrken, 26 Word-mallar, fyra steg, åtta fördelar, fyra i guiden. Samma ordning.
- Alla interna länkar kvar: Linne och Björk i ingresserna, 74 "Se mall", de 40 mallkorten, Alla Word-mallar, guiderna (ett ATS-vänligt CV, hur ett CV ska se ut, bild i CV:t, CV på engelska, CV-exempel, CV-mallar i Word), de tre stilsidorna, Se CV-exempel, och de fyra situationerna.
- Schema: ItemList, BreadcrumbList, FAQPage, Product med Offer, Organization, HowTo (fyra steg, läsbara).
- Brödsmulorna Hem, Exempel, CV-mallar som i dag.

## Bytt för att det var osant

| Var | I dag | I skissen |
|---|---|---|
| Så fungerar det, steg 2 | "Formuläret leder dig genom varje avsnitt." | "Du skriver direkt på arket, avsnitt för avsnitt." (nya byggaren har inget formulär) |

Allt annat stämmer med facit och `katalog.ts`: 40 mallar, Linne och Björk gratis, 26 som Word, 15 med foto, 17 i en spalt.

## Kräver beslut

- **Dolda yrken och Word-mallar.** I skissen står alla 74 yrken och alla 26 Word-mallar i HTML:en, men bara en del visas innan man trycker på "Visa alla". Det kortar sidan märkbart (skissen är ändå cirka 21 000 px hög på dator). SEO behöver säga om H3 bakom en knapp är godtagbart, eller om allt ska stå utfällt. Utfällt fungerar formen också, sidan blir bara längre.
- **Sökfältet "Sök ditt yrke"** är nytt. Det kräver en liten klientkomponent.
- **Premium-remsan under de 40 mallarna** är ny text: "38 mallar till, och Word i alla 26 Word-mallar. Du ser ditt CV i varje mall innan du bestämmer dig. Du betalar först när du laddar ner en Premiummall." Behöver läsas mot betalväggen i mallväljaren.
- **Talen 74 och 89.** "74 yrken i tio grupper" och "74 yrken med egen mallsida" är räknade ur sidan i dag. Ändras antalet yrkessidor ska talen komma ur datan.
- **Miniatyrerna visar Erik Lindberg**, inte Sara Lindström, eftersom de riktiga mallbilderna har honom som exempel. Arket i mallväljaren visar Sara. Antingen byts exempelpersonen i miniatyrerna eller så får det stå.
- **Miniatyrernas storlek.** Filerna är 112 px breda och visas upp till cirka 140 px i rutnätet. Skarpare kort kräver större exporter.
- **"40 av 40 lästes rätt"** i kortet Byggda för rekryteringssystem är en bild av dagens mening ("kom ut rätt i alla 40"). Sant enligt texten, men det är ett tal som nu syns stort.

## Filer bygget rör, så långt det syns

- `src/app/(public)/cv-mallar/page.tsx`, `components/CvMallarPageContent.tsx` (hela sidans form), `components/mallar-produkt.ts` (steg 2), `components/cv-mallar-faq.ts` (orörd), `yrkesmall-data.ts` (läses, grupperna finns redan som kategori).
- `components/StilSida.tsx` (stilsidorna word, foto och enkla delar kort med huvudsidan och bör få samma mallkort).
- `src/components/cv/Dokument/prova/` (`Uppladdning`, `ProvaArbetsyta`, `ProvaKontext`): mallväljaren i det lyfta kortet. `src/components/cv/Dokument/Miniatyr.tsx`.
- `src/lib/cv/mallval/katalog.ts`, `src/lib/seo/cv-kluster.ts` (antalen per familj och stil).
- SEO-diffen: en ändrad mening i steg 2, annars oförändrat rubrikträd.

## Förslag till grunden

- **Mallkortet** (`.mall`: miniatyr, formatmärke, namn, chip, stilrad) och **filterchipsen** (`.filter`) behövs också på brevsidorna och i skapa-cv. De bör ligga i kit.
- **`.mini`** (miniatyr med klack) samma sak.
- `.brickor` med fyra brickor bryter 3 + 1 på telefon. Här har hjälten ett eget rutnät 2 × 2. En variant `.brickor.fyra` i grunden hade räckt.
- `loading="lazy"` på bilder gör att `rendera.mjs` fotograferar tomma rutor längre ned på sidan. Använd det inte i skisserna.
