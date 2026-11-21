# Byggnoter: brevrummet, omgång 1

Ett avsnitt per uppdrag (byggspecen avsnitt 1 punkt 15). Filen skapas på flera grenar samtidigt: slå ihop avsnitten vid sammanslagningen.

## Arket (brevmallen), gren `feat/brev-rummet-b`, 2026-11-21

### Vad som byggdes

En brevmall som ritar ett personligt brev i vilken som helst av de 40 CV-mallarna. Brevet läser CV-mallens definition (`MallDef`) och ritar huvudet med CV-renderarens egna delar, så namn, titel, kontakt, typsnitt, färger och linjer blir CV:ts. Under huvudet: datum (med orten), mottagare (företag fet, person under), ärenderad i rubrikernas typsnitt och färg, hälsning, stycken, avslut och namn.

- Huvudformerna: vänster, centrerad, höger, band, namnruta (Kvadrat), tidningshuvud, delat och remsa ritas av CV-renderaren. Monogram (Sigill), ram (Pergament), stapel (Fasad), två namnrader (Affisch) följer med.
- Sidospaltsmallar med kontakten i spalten (Kalksten, Granit, Sand, Ek, Ritning): spalten i hela sidans höjd med kontakten överst, brevet i huvudspalten. Granit: bandet överst, spalten under. Ritning: namnet i spalten. Kvadrat har kontakten i huvudet och ritas utan spalt.
- Hoppas över: foto, tidsaxel (Horisont), rutor (Kakel), profil i spalter (Tidning), spaltens CV-avsnitt. Sockel behåller sockeln med kontakten nederst, Ramverk ramen, Kant färgkanten, Terrakotta sidans färg.
- Under huvudet: har huvudet ingen egen avgränsning (linje, ram, band, tidningshuvud, namnruta) ritas rubrikernas linje (hel eller kort, som Terrakotta och Tusch), annars en hårlinje i mallens linjefärg.
- Brödtexten står en punkt över CV:ts brödtext (10,5 till 12 pt) med radavstånd 1,45 till 1,6. Krympning i två steg innan sida två: steg 1 minus 0,5 pt och 0,1 i radavstånd, steg 2 minus 1 pt och 0,2. Steget väljs genom mätning (skript i dokumentet, `passaBrevet` i BrevArk); Word väljer med en uppskattning (`uppskattatSteg`).
- Mörkrums band är 52 mm i brevet i stället för 72 (byggt för fotot), Panoramas band får egen luft utan foto.
- Ärenderaden tar rubrikernas färg bara om den har minst 4,5:1 mot papperet, annars textfärgen (Skylt har vita rubriker på band).

### Nya filer

- `src/lib/letters/brevmall/render.ts` renderaren (inga Node-moduler, kan laddas dynamiskt i klienten).
- `src/lib/letters/brevmall/word.ts` Word-byggaren (server).
- `src/lib/letters/brevmall/index.ts` serverns ingång.
- `src/lib/letters/brevmall/katalog.ts` `brevMallKatalog()`, `brevMallKort(id)`, klientsäker.
- `src/lib/letters/brevmall/text.ts` fasta rader sv/en, datum, `brevOrd`, `brevSomText` (Kopiera text), `hittaMarkeringar`, klientsäker.
- `src/lib/letters/brevmall/scopa.ts` brevets HTML i sidan utan iframe (`scopaBrevHtml`), `passaBrevet`, klientsäker.
- `src/lib/letters/brevmall/exempel.ts` exempelbrevet till Nordanvind Energi i tre längder (122, 150, 352 ord) och skissens sju krav. Mallar utan brev kan använda `exempelBrev('normal', användarensAvsändare)`.
- `src/components/brev3/ark/BrevArk.tsx`, `BrevMiniatyr.tsx`, `index.ts`.
- `src/app/api/letters/download/brev-data.ts` TILLFÄLLIG `brevDataFranBrev` (se nedan).
- `scripts/brevmallar-kontaktark.ts` kontaktarken.
- Tester: `src/lib/letters/brevmall/__tests__/brevmall.test.ts`, `src/app/api/letters/download/__tests__/route.test.ts`.

### Gränssnittet

```ts
renderBrevHtml(mallId: string, data: BrevData, val?: BrevVal, opt?: BrevRenderVal & { steg?: 0 | 1 | 2 }): string
byggBrevDocx(mallId: string, data: BrevData, val?: BrevVal): Promise<Buffer>   // kastar för mallar utan Word
brevOrd(data: BrevData): number                                              // bara styckena
brevMallKatalog(): BrevMallKort[]                                            // katalog.ts, klientsäker
brevSomText(data: BrevData): string                                          // text.ts, hälsning + stycken + avslut och namn
```

- `BrevVal.accent` är en hex bland mallens fyra accenter; en färg utanför dem ignoreras. `BrevVal.typsnitt` ersätter brödtexten (som i CV:t), namn och rubriker behåller mallens.
- Markeringar: kravets citat söks i styckena med normaliserade blanksteg (skiftläge först exakt, sedan inte). Ett citat som överlappar ett tidigare märkt hoppas över. `data-krav` är kravets plats i listan, 1-baserad, så att siffran stämmer med listan i bladet även när ett krav saknar svar.
- Dokumentet bär `data-steg` och `data-grans` (mm) på `.cv.brev`. `opt.steg` låser steget (`data-last`).
- Kontraktet `typer.ts` är oförändrat.

### BrevArk och BrevMiniatyr

- `BrevArk { html, bredd?, lage?: 'arbete' | 'golv', saknatKrav?: { nr, stycke }, onStycke?, ariaLabel?, className? }`. Ge `bredd` (480 i arbetsläget på dator) så ritas arket i rätt skala vid serverrenderingen. Utan `bredd` mäts behållaren och platsen hålls med A4:ans proportioner.
- Kravens siffror mäts i klienten och läggs 30 px till vänster om styckets text; två krav på samma rad staplas. Saknat krav: pulserande plats sist i stycket (nästa rad om raden är full), streckad siffra och etiketten "Här hamnar meningen" som hänger ut över arkets högra kant. Aktivt stycke (`opt.aktivtStycke` i renderaren): orange ram i HTML:en och etiketten "Du ändrar här" vid kanten. Med `onStycke` blir styckena knappar (Enter och mellanslag fungerar, synligt fokus).
- `BrevMiniatyr { html, bredd, hojd?, className? }` serverrenderbar, utan mätning.
- Båda scopar CSS:en till en egen klass per instans (`useId`), så olika mallar på samma sida inte påverkar varandra.

### Nedladdningen

- Ny väg: `POST /api/letters/download` med `{ id, format: 'pdf' | 'docx' }`. Raden läses med id och `user_id`. Har den `mall_id`: PDF av `renderBrevHtml` (typsnitten inbäddade, typsnittet ur `font_id`, fynd 8) eller Word av `byggBrevDocx` (400 om mallen saknar Word), och `forberett_at` sätts om den är tom (fel där stoppar aldrig filen). 404 om brevet inte finns.
- Gamla vägen: brev utan `mall_id`, eller anrop utan `id`, går som förut. Skickas `id` utan `content` hämtas `content` ur raden. Inloggningen, 402-spärren (`letter_download`), 422 `name_required` och loggningen är som förut och ligger före den nya vägen.
- Avsändaren: `kontaktIBrev(profil, user)`, samma som gamla vägen. Profilen har ingen yrkestitel; titeln under namnet kommer med motorns `brevDataFranBrev` (troligen ur CV:t).

### Sammankoppling med motorn

`src/app/api/letters/download/brev-data.ts` har `brevDataFranBrev(letter, profil)` med samma signatur som motorns. Vid sammanslagningen: byt importen i `route.ts` (märkt `TODO(motorn)`) mot motorns funktion i `src/lib/letters/` och ta bort `brev-data.ts`. Stäm av att motorns `profil` har fälten `namn, epost, telefon, ort` (och gärna `titel`), annars anpassa anropet. `forberett_at` skrivs direkt i rutten; används motorns `POST /api/letters/[id]/forberett` i stället, ta bort det blocket. Kolumnerna läses otypat tills `database.types.ts` har dem.

### Exporter i `src/lib/cv/**` (bara exporter, inga ändringar i sak)

Varje fil fick en exportrad sist i filen (en rad tillagd, inget annat rört, minsta konfliktyta mot CV-rummets session):

- `src/lib/cv/mallar/render/html.ts`: `export { css as mallCss, huvud as mallHuvud }`, `export type { Ctx as MallCtx }`.
- `src/lib/cv/word/bygg.ts`: `export { huvudInnehall, huvudStycken, bandCell, remsaTabell, stilar, wordTypsnitt, skapaLinjer, linjerSomBehovs, rubrik2, iSpaltcell, stycke, tabell, tabellCell }`, `export type { B as WordSammanhang, Ruta as WordRuta }`.

Kopierat i stället för exporterat: kontaktavsnittets markup i spalten (fem rader, `kontaktAvsnitt` i render.ts) och enheterna i Word (`mm`, `pt`, `hp`, `ord`, A4). Byter CV-rummets session namn på något av de exporterade fäller `tsc` vid sammanslagningen; då pekas exportraden om.

### Fynd 7: Sidofält

`src/lib/letters/docx-templates.ts`: HTML-mallens spalt hade `word-break: break-all`, som bröt e-postadressen vid sista tecknet. Nu `word-break: normal; overflow-wrap: anywhere` och spalten växer med adressen (23 till 36 procent). Word-filen ger en lång adress lägre grad (lägst 8 pt) i stället för att bryta den. Inget annat i mallen är ändrat.

### Beslut jag tog

- Brödtexten en punkt över CV:ts: med CV:ts egen grad blev brevet tydligt mindre än förlagorna (Calibri och Garamond är små i grad 10,5).
- Sidospalten i hela sidans höjd (förlagan Kalksten), inte under huvudet som i CV:t.
- Datumraden har orten först när profilen har en ort ("Stockholm, 21 november 2026"), som förlagorna. Datumet i filen är nedladdningsdagen.
- Förvald hälsning: "Hej {förnamn}," med namngiven mottagare, annars "Hej,". Engelska: "Dear {namn}," eller "Dear Hiring Manager,".
- `brevOrd` räknar bara styckena.

### Testat

- `npx vitest run src/lib/letters/brevmall src/app/api/letters/download`: 23 tester gröna (alla 40 mallar ritar, markeringar, aktivt stycke, skrivläget, engelska, typsnitt, accent, ordräkning, datum, katalogen, scopningen, Word för alla 26 Word-mallar, rutten med mockad databas: 401, 402, 404, Word, mall utan Word, gamla vägen).
- `npx tsc --noEmit` rent för mina filer.
- Kontaktarken (puppeteer direkt från renderaren): alla 40 mallar med 122 och 352 ord ryms på en sida.
- PDF som i nedladdningen för tio mallar (långa brevet): en sida var, ritade till bild och granskade.
- Word: åtta mallar öppnade i Microsoft Word, sparade som PDF och ritade till bild (vanligt och långt brev): en sida var efter rättningen av spaltradens höjd.
- BrevArk och BrevMiniatyr ritade i Chrome med en liten esbuild-sida (siffror, saknat krav, aktivt stycke, tryck på stycke).

### Inte testat

- Nedladdningsrutten mot riktig databas och i Vercels Chromium (`@sparticuz/chromium`). PDF-vägen är inte körd genom rutten, bara samma HTML och utskriftsinställningar i lokal puppeteer.
- BrevArk i den riktiga appen (Next, kitets CSS, mörkt läge, telefonbredd). Etiketterna hänger ut över arkets högra kant som i skissen; behållaren måste tillåta det (inte `overflow: hidden`).
- Brev som går över en sida (längre än cirka 420 ord): sida två är inte granskad i någon mall, varken i PDF eller Word.

### Det som återstår

- Koppla in motorns `brevDataFranBrev` (se ovan).
- Etapp 2 ska skicka `id` till nedladdningen för nya brev.

### Hur man backar

Ta bort `src/lib/letters/brevmall/` utom `typer.ts`, `src/components/brev3/ark/`, `brev-data.ts` och den nya vägen i `download/route.ts` (blocket efter JSON-tolkningen och funktionerna `filnamn`, `brevmallPdf`, `nyttBrevSomFil`), och de två exportraderna sist i `html.ts` och `bygg.ts`. Sidofält: återställ `.sidebar`-reglerna och e-postradens grad i `docx-templates.ts`.
