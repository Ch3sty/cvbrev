# Plan: CV som Word-fil (.docx)

Skriven av saas-lead 2026-11-15 på ägarens beställning: "Vi hade tidigare cv mallar som fungerade som word ... klart man ska kunna ha några mallar som kan laddas ned som word." Skissen som ägaren godkänner före bygge: `docs/design/skiss-cv-word-2026-11-15.html`. Inget är byggt. Säljansvarig (inlånad), SEO-strategen och art-director har lämnat underlag; besluten nedan är mina.

## 1. Läget i koden (räknat, inte gissat)

| Vad | Var | Läge |
|---|---|---|
| CV-export | `src/app/api/cv/generate-formatted/route.ts` (2 540 rader) | Bara PDF via Puppeteer. `format` läses ur begäran men används inte; svaret är alltid `application/pdf`. Spärrar: premiummall kräver featuren `cv_templates_all` (rad 2304), en gratis export per konto via `profiles.free_cv_exports_used` och `FREE_CV_EXPORTS = 1` (rad 2330), bekräftad e-post (B1), namnkrav 422. Loggar `formatted_cv_downloads`, Kom igång-brickan `mall`, `logPremiumUsage('cv_export')`. |
| CV-data | `CVMetadata` i `src/lib/cv/cv-metadata.ts`, normaliserad av `normalizeStructuredData` | personalInfo, summary, experience[], education[], skills[{category, skills[]}], languages[], certifications[], projects[]. Samma data som mallmotorn får; en Word-byggare får exakt samma objekt. |
| Mallmotorn | `src/lib/cv/templates/<id>/generator.ts`, 41 mallar, register i `simple-templates.ts` | HTML plus CSS per mall. 29 mallar är enkolumniga eller ATS-säkra utan foto, 11 Plus-mallar har foto och två kolumner. Gratis: Norrsken, Sidopanel (två kolumner), Student. |
| Brevens Word | `src/app/api/letters/download/route.ts`, `src/lib/letters/docx-templates.ts` | Riktig .docx med biblioteket `docx` 9.5 (`Packer.toBuffer`), sex mallar som bygger `Paragraph`/`TextRun`, kolumner som tabeller utan kantlinjer, typsnitt via `getFontNameForDocx`. Kräver `letter_download`. Det här mönstret återanvänds. |
| Läsa Word | `mammoth` 1.9 i CV-uppladdningen | Vår egen CV-analys tar emot .docx. Den blir ATS-testet: filen vi skapar ska läsas rätt av vår egen läsare. |
| Publik copy | se avsnitt 8 | Lovar redan "PDF och Word" för CV på fem ytor, fast Word inte finns. Rättas i samma släpp. |
| Historik | commit `a11b9bba` (sep 2025) hade `format: 'pdf' | 'docx' | 'both'` i typen men ingen docx-generering; borta i `133db2da`. | Ingen gammal kod att återuppliva. |

### Prototyp 2026-11-15

`scratchpad/proto/norrsken-docx.cjs` bygger Norrsken med Erik Lindberg (SHOWCASE_CV) med `docx` 9.5: `styles.paragraphStyles` med id `Heading1`/`Heading2` (Word visar dem som Rubrik 1/Rubrik 2), egna stilar Posttitel och Arbetsgivare, punktlistor via `numbering`, period högerställd med tabbstopp (ingen tabell), hårlinjer som styckekanter, Norrskens orange som vänsterkant på Rubrik 2. Öppnad i Word 2016 via COM: 2 sidor, stilar i bruk Rubrik 1, Normal, Rubrik 2, Posttitel, Arbetsgivare, Liststycke, 12 listpunkter, 0 tabeller, exporterad till PDF utan fel och ser ut som mallen. Läst med mammoth: 1 834 tecken, alla å/ä/ö, 0 varningar, rubrikerna i rätt ordning. Det räcker som bevis för att vägen håller. LibreOffice och Google Docs är inte testade (LibreOffice saknas på maskinen), se avsnitt 7.

## 2. Beslut

| # | Beslut | Motivering |
|---|---|---|
| B1 | **Sex mallar får Word i våg 1**, alla enkolumniga och ATS-säkra: de fria Norrsken och Student plus fyra premiummallar (avsnitt 3). | Ägaren: hellre få och riktigt bra. Enkolumnigt går att återskapa troget med Words egna medel (stilar, kanter, listor); kolumner kräver tabeller som bryter sämre över sidor och läses sämre av rekryteringssystem. |
| B2 | **Word kräver alltid Premium.** Den enda gratisnedladdningen per konto förblir PDF, även på Norrsken och Student. Ny feature `cv_export_word: ['cv', 'allt']`. | Säljansvarig: en gratis Word-fil tar bort köpögonblicket vid andra exporten (PW5), eftersom filen går att ändra för alltid. Aktiveringen rörs inte, första filen är fortfarande gratis. Samma regel som breven. Avgörs om igen bara om aktiveringsmåttet faller (avsnitt 9). |
| B3 | **Word visas som synligt men låst val** för alla utan Premium; tryck öppnar betalväggen (ny variant `cv-export-word`), aldrig ett fel. På mallar utan Word-version visas valet inte; i stället märks de sex mallarna i galleriet och mallkortet ("Finns också som Word"). | Vi säljer inte vad mallen inte har, men användaren ska upptäcka Word. Formen är art-directorns (skissen). |
| B4 | **Samma rutt**, `POST /api/cv/generate-formatted` med `format: 'docx'`, samma spärrar i samma ordning, nytt Content-Type och filnamn `cv-<mall>.docx`. | Brevens rutt gör exakt så. En sanning per funktion (prestandaomgång 4). |
| B5 | **Ingen reklam i filen.** Word-filen innehåller bara CV:t; dokumentets metadata (`creator`) får "Jobbcoach.ai". Återvägen ligger på bekräftelsen: "Ändrar du i Word? Ladda upp den nya versionen i CV-analysen, så ser du om poängen går upp." | Rekryteraren ser filen; reklam skadar kunden. |
| B6 | **Typsnitt i Word är systemtypsnitt.** Användarens val i verktygsraden mappas som i breven (`getFontNameForDocx`), webbtypsnitt (Inter, Lato, Poppins, Open Sans, Roboto) ersätts med mallens Word-typsnitt enligt avsnitt 3. | En .docx som pekar på ett typsnitt mottagaren saknar faller till Times New Roman och ser trasig ut. |
| B7 | **Våg 2 (eget beslut senare):** Sidopanel och fler tvåkolumniga mallar som tabell utan kantlinjer, foto som inbäddad bild. Tas upp först när Word-nedladdningarna i våg 1 är avlästa (avsnitt 9). | Tabellkolumner i Word är möjliga (breven gör det) men sämre för rekryteringssystem; vi vill se om Word efterfrågas alls innan vi lägger tiden. |
| B8 | **Publika löften rättas i samma släpp** (avsnitt 8): "PDF och Word" blir "PDF, och Word för utvalda mallar", "Helt gratis" om Word stryks. | Sanningskravet. I dag lovar sajten något som inte finns. |

## 3. Mallurvalet och Word-stilen

Art-directorns val, granskat och godkänt av mig. Urvalskriterier: går att återskapa troget med Words egna medel, täcker olika målgrupper, ser ut som något man gärna öppnar i Word.

| Mall | Tier | Word-typsnitt (webben) | Accent i Word | Målgrupp | Varför |
|---|---|---|---|---|---|
| Norrsken | Gratis | Calibri (Inter) | Orange vänsterkant på Rubrik 2 | Alla yrken, tjänstemän | Vår mest använda gratismall; prototypen bevisar vägen. |
| Student | Gratis | Calibri (Inter) | Cyan linje under huvudet | Studenter, nyexaminerade | Enkel struktur, bara styckekanter och listor. |
| Tidlös | Premium | Garamond (samma på webben), Georgia som reserv | Mörkgrön på arbetsgivare, svart hårlinje | Juridik, bank, akademi | Vinner mest på Word: serif i Garamond ser hemma ut i ett dokument, centrerad text och en hårlinje blir identiskt med PDF:en. |
| Myndighet | Premium | Arial (Source Sans) | Marinblå styckekanter, § som punkttecken | Offentlig sektor, handläggare | Offentlig sektor efterfrågar oftast Word; mallen är rakt igenom Word-medel. |
| Stack | Premium | Calibri, Consolas för datum, kontakt och kompetenser (JetBrains Mono) | Teal linje under rubrikerna | Utvecklare, data, tech | Tech-rekryterare klistrar in CV:t i egna system. Kompetenserna i tre spalter blir en tabell utan kantlinjer (brevens grepp), **bara om** mammoth läser spalterna i rätt ordning i testet, annars en vanlig lista. |
| Hantverkare (`bygg`) | Premium | Calibri (Source Sans) | Orange tjock linje under huvudet, tonat block för behörigheter | Bygg, el, VVS, praktiska yrken | Stor grupp som sällan får en egen mall; blocket är ett stycke med bakgrundston och tunn kant, som Word kan. |

Bortvalda i våg 1 med skäl: Atlas (dubbellinjen under namnet går inte som styckekant), Konto (tabellayout blir stel), Linje (tvådelat huvud kräver tabell), Kvist, Skymning, Avtryck, Karta, Aspekt, Bold, Galleri (helfärgade band, foto, tidslinjer eller ramar). Disk, Logistik och Verkstad liknar Myndighet och Hantverkare i uppbyggnad och kan tas i våg 2 utan nytt tänk.

Typsnittsvalet i steget: i Word-läget visas bara de typsnitt som finns i Word på Windows och Mac (Calibri, Arial, Verdana, Georgia, Garamond, Times New Roman), så filen aldrig pekar på ett typsnitt mottagaren saknar. Webbtypsnitten (Lato, Poppins, Roboto, Open Sans) gäller PDF:en.

Gemensamt för alla sex Word-versioner:

- A4, marginaler 25 mm sidor, 25 mm topp och botten (justeras per mall).
- Normal 11 pt, radavstånd 1,15, styckeavstånd 4 pt. Rubrik 1 = namnet. Rubrik 2 = sektionerna i den ordning mallen har dem (Profil, Arbetslivserfarenhet, Utbildning, Kompetenser, Certifieringar, Språk, Projekt). Egna stilar Posttitel och Arbetsgivare så användaren kan ändra alla jobbtitlar på en gång.
- Period högerställd med tabbstopp, aldrig tabell. Punkter som riktig lista (`numbering`). Hårlinjer som styckekanter. En accentfärg per mall, aldrig bakgrundsplattor över sidan.
- Kontakt som en rad med punktavskiljare. LinkedIn som text, inte länkobjekt (rekryteringssystem läser texten).
- Inga ikoner, inga bilder, inga textrutor, inga sektionsbrytningar. Foto ingår inte i våg 1 (ingen av de sex mallarna har foto).
- `keepNext` på rubriker och posttitlar så en rubrik aldrig blir ensam längst ned på sidan.
- Raden "Referenser lämnas på begäran" sist, som i PDF:en.

## 4. Gratis och Premium

| | Gratis | Premium (Jobbcoach Premium, 149 kr i månaden) |
|---|---|---|
| Förhandsvisa alla 41 mallar | Ja | Ja |
| PDF | En nedladdning per konto, mallarna Norrsken, Sidopanel, Student | Obegränsat, alla mallar |
| Word | Nej, visas som låst val på de sex Word-mallarna | Obegränsat, de sex Word-mallarna |
| Betalväggen (ny variant `cv-export-word`) | "Word-filen ingår i Premium, med obegränsade nedladdningar och alla 41 mallar." Knapp `kopKnapp()`: "Köp Premium, 149 kr i månaden". Kampanjpriset visas av samma komponent som i dag under Black Week. | |

Texterna är utkast; `svensk-ux-copywriter` slutjusterar i bygget. Reglerna: aldrig "Lås upp", handling plus paket med pris, paketnamnet ur `PLANS` (bara `all_month` säljs; Dagspasset och "Hela paketet" finns inte publikt).

## 5. API och kod

Allt byggs av en Opus-agent på grenen `feat/cv-word` med strikt filägarskap. Skissen är specen för utseendet.

### 5.1 Nya filer

| Fil | Innehåll | Insats |
|---|---|---|
| `src/lib/cv/word/base.ts` | Gemensamt: `WordMallDef` (id, typsnitt, accent, marginaler, rubrikordning), `byggDokument(cvData, def, fontName?)` som gör `Document` med stilar (`Heading1`, `Heading2`, `Posttitel`, `Arbetsgivare`), numbering, sektionsbyggare (huvud, profil, erfarenhet, utbildning, kompetenser, certifieringar, språk, projekt), tabbstopp för period, `formatSwedishAddress` återanvänd. HTML-escape behövs inte (docx skriver text, inte markup), men `&nbsp;` och HTML-rester i beskrivningar strippas som i brevens `splitIntoParagraphs`. | M |
| `src/lib/cv/word/mallar/<id>.ts` × 6 | En `WordMallDef` per mall: avvikelser från basen (serif, versalrubriker, kantlinjer, accent). Små filer. | S per mall |
| `src/lib/cv/word/index.ts` | `WORD_MALLAR: Record<WordMallId, WordMallDef>`, `harWordVersion(id)`. Importeras bara på servern. | S |
| `src/lib/cv/template-antal.ts` | `WORD_TEMPLATE_IDS` (sex id) och `WORD_TEMPLATE_COUNT = 6`, klientsäkra tal och id utan registret (samma skäl som filen finns). Testet `template-count.test.ts` fäller om id saknas i registret. | S |
| `supabase/migrations/2026MMDD_cv_downloads_format.sql` | `alter table formatted_cv_downloads add column format text not null default 'pdf'`. Additiv. | S |
| `src/lib/cv/word/__tests__/word-mallar.test.ts` | Se avsnitt 7. | M |

### 5.2 Ändrade filer

| Fil | Ändring |
|---|---|
| `src/lib/access/features.ts` | `cv_export_word: ['cv', 'allt']`. |
| `src/app/api/cv/generate-formatted/route.ts` | Efter mallkontrollen: om `format === 'docx'` kräv `harWordVersion(template)` (400 annars) och `userHasAccess('cv_export_word')` (402 med `featureRequiredBody('cv_export_word', …)`), hoppa över gratisräknaren. Efter datan: `Packer.toBuffer(byggDokument(extractedCVData, WORD_MALLAR[template], getFontNameForDocx(fontId)))`, Content-Type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, filnamn `cv-<mall>.docx`. `formatted_cv_downloads.format`, `logPremiumUsage('cv_export', { template, format })`. Typsnittsmappningen flyttas från brevens rutt till `src/lib/documents/typsnitt.ts` så båda rutterna läser samma tabell. |
| `src/components/paywall/paywall-copy.ts`, `PaywallCard.tsx` | Variant `cv-export-word` → feature `cv_export_word`, texten i avsnitt 4. |
| `src/app/dashboard/cv-mallar/CvMallarClient.tsx` | `handleGenerateCV` får `format`, filnamn `.docx`, bekräftelsen "Ditt CV är klart som Word-fil, <Mall>.docx" plus återvägsraden, låst Word öppnar `cv-export-word`. |
| `src/app/dashboard/cv-mallar/components/MallToolbar.tsx` eller ny `FormatVal.tsx` | Formatvalet enligt skissen. Visas bara när mallen har Word-version. 44 px, en primärknapp per vy. |
| `MallGrid.tsx`, `MallInfoCard.tsx`, `CompactCvPicker.tsx` | Märkningen "Finns också som Word" ur `WORD_TEMPLATE_IDS`. |
| `src/app/dashboard/skapa-cv/components/CVCreatorWizard.tsx` (rad 477) | Exportsteget i byggaren får samma formatval. |
| `src/app/(public)/verktyg/cv-mallar/components/CVMallarLiveDemo.tsx`, `page.tsx` | Märkning i mallväljaren, texter i avsnitt 8. |
| `src/app/admin/tratt/berakning.ts` | Etikett för `cv_export_word` så Word blir egen rad i Tratt och Köpväg. |
| `src/lib/cta/clusters.ts` | Oförändrad, artiklarna i avsnitt 8 behåller sina kluster. |

### 5.3 Vad som inte görs

Ingen ny Vercel-cron, inget nytt bibliotek (`docx` och `mammoth` finns), ingen ändring i `quotaService`, inga priser. Puppeteer rörs inte; Word-vägen är ren Node och snabbare än PDF-vägen (ingen Chromium-start), vilket också sänker funktionstiden på Vercel för de exporterna.

## 6. Gränssnittet

Skissen `docs/design/skiss-cv-word-2026-11-15.html` är specen. Sammanfattat:

- **Formatvalet** i steg 3 på `/dashboard/cv-mallar` (och i byggarens exportsteg): två segment PDF | Word direkt ovanför den enda kopparknappen, PDF förvalt. Knappens text följer valet: "Ladda ner som PDF" eller "Ladda ner som Word". Valt segment markeras med mörk kant och bock, aldrig med koppar. Utan Premium är Word synligt men låst (lås i stället för bock), trycket öppnar betalväggen som ark; knappen blir då "Köp Premium, 149 kr i månaden". När gratisnedladdningen är använd är båda segmenten låsta och raden säger "Din gratisnedladdning är använd. Fler nedladdningar, i PDF och Word, ingår i Premium." Mallar utan Word-version visar inget formatval, bara raden "<Mall> laddas ner som PDF". Under laddning: "Skapar Word-fil" med snurra, som PDF:en i dag.
- **Upptäckten** sker i galleriet och mallinfon, inte i exportsteget: en liten konturetikett "Word" högerställd på raden under mallnamnet i galleriet (samma rad som Gratis/Premium), och brickan "Finns också som Word" i mallinfons rad med ATS-säker och Premium. Högst tre brickor på rad; ingen ny färg.
- **Betalväggen** (variant `cv-export-word`): rubrik "Word-filen ingår i Premium", text enligt avsnitt 4, prisrad "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.", knapp `kopKnapp()`, länk "Se vad som ingår".
- **Bekräftelsen**: "Ditt CV är klart som Word-fil: cv-norrsken-erik-lindberg.docx" (samma filnamnsmönster som PDF:en: mall och CV-namn, små bokstäver, bindestreck) plus raden "Öppna den i Word, Google Docs eller LibreOffice och ändra fritt" och återvägen "Ändrar du i Word? Ladda upp den nya versionen i CV-analysen, så ser du om poängen går upp."
- **Felläget**: "Word-filen kunde inte skapas. Ditt CV och dina val finns kvar." med "Försök igen" (primär i överlägget) och "Ladda ner som PDF i stället" utan att byta mall eller typsnitt.
- **Publikt** `/verktyg/cv-mallar`: "PDF och Word" som tillägg i rullistans alternativ och "Word" på raden under dokumentet, inget nytt element. Avsnittet "CV-mallar för Word" med ankaret `#word` (avsnitt 8).

Mobil först: 44 px träffytor på segmenten, 12 px minsta text, en kopparknapp per vy.

## 7. Tester och kvalitetsgrind

| Test | Hur | Grind |
|---|---|---|
| Enhetstest, sex mallar | `word-mallar.test.ts`: bygg varje mall med SHOWCASE_CV (konverterad till `CVMetadata`) och med ett CV som saknar valfria fält. Packa, packa upp `word/document.xml` (JSZip finns via docx) och kontrollera: `w:pStyle w:val="Heading1"` en gång, `Heading2` per sektion i mallens ordning, inga `<w:tbl>`, `w:numPr` på varje punkt, inga tomma `<w:t>` med bara mellanslag i rubriker. Läs tillbaka med `mammoth.extractRawText`: alla sektionsrubriker i ordning, alla å/ä/ö/Å/Ä/Ö, inga `&amp;`/`&nbsp;`-rester, 0 varningar. | Vitest i CI, fäller bygget. |
| ATS via vår egen analys | Ladda upp Erik Lindbergs .docx (Norrsken och Tidlös) i CV-analysen på ett QA-konto och jämför poäng och fynd mot PDF:en av samma mall. Samma text ska ge samma poäng. | Dokumenteras i `docs/qa/qa-cv-word-<datum>.md`. |
| Word | `scripts/word-mallar-render.ps1` (Windows, Word via COM som prototypen): öppnar alla sex, listar stilar, sidantal, tabeller (ska vara 0), exporterar PDF. PDF:erna granskas av art-director mot skissen. | Sex skärmdumpar i QA-mappen, aldrig i git. |
| LibreOffice | LibreOffice installeras på byggmaskinen (gratis, 10 minuter) och kör `soffice --headless --convert-to pdf` på de sex. Känd risk: LibreOffice renderar `characterSpacing`, styckekanter och tabbstopp aningen annorlunda; godkänt är "ser ut som mallen", inte pixellikhet. | Sex skärmdumpar. |
| Google Docs | Ägaren eller jag öppnar de sex filerna i Google Docs (Importera). Känd risk: egna stilar (Posttitel, Arbetsgivare) blir "Normal text med direkt formatering", vilket är acceptabelt; rubrikerna Rubrik 1/2 följer med. | Checklista i QA-filen. |
| Svenska tecken | Ingår i enhetstestet (mammoth) och i Word-körningen. Filnamnet saneras som i dag (`cv-tidlos-formell.docx`), dokumenttiteln får behålla å/ä/ö. | |
| Spärrar | Vitest på rutten: gratis + docx → 402 `cv_export_word`; premium + mall utan Word → 400; premium + Word-mall → 200 med rätt Content-Type och att `free_cv_exports_used` är orörd. | CI. |
| Riktig webbläsare | Klicktest som ny användare på Pixel 7 och desktop: gratis ser låst Word, tryck ger betalväggen med rätt pris, premium (QA-konto med `premium_scope`) laddar ner .docx som öppnas. Skärmdump per steg. En gång på allt ändrat före push. | `docs/qa/`. |
| Publikt | `scripts/seo-diff` före och efter på `/verktyg/cv-mallar` och `/verktyg/skapa-cv`: 0 fel. | Grind före push. |

## 8. Publika texter och artiklar som uppdateras när Word är klart

### 8.1 Vad SEO kan vinna (GSC 2026-08-16 till 2026-11-13, hämtat 2026-11-15)

Hela word-klustret gav 1 klick på 90 dagar, och det klicket gick till brevartikeln. CV-orden: "cv mall word" 55 visningar, position 41 (61,7 senaste 28 dagarna), "modern cv mall word" 52 visningar position 27, "cv mall word gratis" 3 visningar, "cv mallar word" ingen data. Artikeln `/artiklar/cv-mall-word-gratis` har 557 visningar, 1 klick, position 34 och faller (60,5 senaste 28 dagarna), eftersom den förklarar var man hittar Microsofts mallar i stället för att leverera en fil. Brevartikeln `/artiklar/personligt-brev-mall-word`, som är skriven mot nedladdning, ligger på position 15 för "personligt brev mall word" och 9,6 för "personligt brev mall gratis word" med samma domänstyrka. Det är beviset för att leverans flyttar ranking.

Ärlig bedömning: vinsten i besökare är liten på kort sikt (cirka 150 visningar per 90 dagar på CV-word-orden i dag). Vinsten är att artikeln får en inledning och en uppmaning som matchar sökintentionen, och att fem säljsidor och paketlistan slutar lova något koden inte backar. Sanningskravet är det tyngsta skälet, SEO det andra. Mål på 90 dagar: artikeln från position 34 till under 20 på "cv mall word", visningar 557 till över 1 000, CTR 0,2 till 2 procent.

### 8.2 Artiklarna

| Artikel | Ändring | Regel |
|---|---|---|
| `content/artiklar/cv-mall-word-gratis.mdx` | Behåll alla tio H2 och ordmängden. seoTitle "CV-mall i Word gratis: ladda ner, fyll i, anpassa" (49 tecken), description mot "ladda ner som Word (.docx) eller PDF". Snabbsvaret vänds: först vår nedladdning (sex mallar som Word, alla som PDF), sedan Arkiv > Nytt i Word som gratisalternativ. Enda rubrikbytet: "Testa våra gratis CV-mallar" blir "Ladda ner våra CV-mallar för Word" med ett stycke om de sex. Vi som första punkt under "Var hittar man gratis cv mallar för word?". Två nya FAQ i frontmatter och synlig del: "Kan jag ladda ner en CV-mall från jobbcoach.ai som Word-fil?" och "Vilka av era mallar finns i Word?". Länkmål `/verktyg/cv-mallar#word` och `/cv-mallar/start?mall=<id>`, aldrig `?format=word` (parametervarianter läcker redan in i indexet, CDN-cache ett dygn). | Skydda toppartikel: struktur och ordmängd kvar. |
| `content/artiklar/cv-mall-gratis-guide.mdx` rad 19 till 20 och 189 till 193 | "Vill du jobba i Word, kopiera strukturen ..." blir "Sex av våra mallar laddar du ner direkt som Word, alla som PDF." Artikeln rankar 7,3 på en word-fråga. | En mening. |
| `content/artiklar/personligt-brev-mall-word.mdx` | Oförändrad text; en länk till CV-artikeln i stycket om att skicka CV och brev ihop. Kontrollgrupp i mätningen. | |
| Ingen ny URL | `/verktyg/cv-mallar` ligger på position 70 utan word-sökord; en ny sida startar från noll. I stället ett H2 "CV-mallar för Word" (ankare `#word`) på `/verktyg/cv-mallar` som listar de sex och säger PDF för övriga, plus två FAQ. Artikeln förblir rankingsidan. | |

### 8.3 Sajttexter som i dag lovar Word (alla ändras i bygget, copywritern formulerar)

Antalet skrivs från `WORD_TEMPLATE_COUNT`, aldrig som siffra i text.

| Fil och rad | I dag | Riktning |
|---|---|---|
| `verktyg/cv-mallar/components/cv-mallar-faq-data.ts:20-21` | "Ja, både PDF och Word" | PDF för alla mallar, Word för sex av dem, i Premium. |
| `verktyg/cv-mallar/page.tsx:61` (STEG, matar HowTo) | "Ladda ner som PDF eller Word" | "Ladda ner som PDF, eller Word i sex av mallarna". |
| `verktyg/cv-mallar/page.tsx:66` | "Ladda ner ditt CV i båda formaten" | PDF i alla mallar, Word i sex. |
| `verktyg/cv-mallar/page.tsx:182` | "PDF + Word / redo att skicka" | tal `WORD_TEMPLATE_COUNT`, "mallar även i Word". |
| `verktyg/cv-mallar/page.tsx:210` | "nedladdning i Word och PDF ingår i Premium" | "PDF-nedladdning och Word i sex av mallarna ingår i Premium" (sant). |
| `verktyg/cv-mallar/layout.tsx:7, 13, 23` | "PDF och Word. Helt gratis att börja." | "PDF, Word i utvalda mallar." Meta ägs av SEO; seo-diff före och efter. |
| `verktyg/skapa-cv/page.tsx:29-30, 61, 71 (featureList), 111 (HowTo), 158` | "PDF eller Word", "PDF- och Word-export" | "PDF, Word i sex av mallarna". |
| `verktyg/skapa-cv/layout.tsx:6, 22, 32` | "export till PDF eller Word. Helt gratis." | "Helt gratis" stryks för Word; "PDF, eller Word i utvalda mallar". |
| `verktyg/skapa-cv/components/skapa-cv-faq-data.ts:24, 48` | "Både PDF och Word (.docx) ingår alltid" | PDF alltid, Word i sex mallar med Premium. |
| `verktyg/skapa-cv/components/SkapaCvLiveDemo.tsx:208` | knappen "Word" i demon | Visas bara när demomallen är en av de sex. |
| `exempel/components/MallarHubGuideSection.tsx:208-212` | "skicka aldrig filen i .docx" | "bara när annonsen ber om det", plus en mening om våra sex Word-mallar. `cv-mall-pdf-gratis` säger redan att bemanningsföretag kräver Word. |
| `src/lib/plans/plans.ts:117` | "Ladda ner CV och personliga brev i Word och PDF" | "PDF för CV och brev, Word för breven och sex CV-mallar". |
| `(public)/cv-mallar/components/cv-mallar-faq.ts:29-30` | "Word-export finns inte" (sant i dag) | Blir falsk vid lansering: "PDF för alla mallar, sex av dem även som Word." |
| `verktyg/cv-analys/page.tsx:94`, `cv-analys-faq-data.ts:44` | "ladda ner som PDF eller Word" efter analys | Kontrolleras i bygget: sant bara om det förbättrade CV:t går genom samma export med Word-mall. Annars "som PDF". |

Brevsidorna och jobbmatchningens FAQ (uppladdning av Word) är sanna och lämnas. Schema: inget `fileFormat` (finns inte på Product, WebApplication eller HowTo och läses inte av Google); STEG och FAQ-filerna matar HowTo och FAQPage automatiskt, så texterna ovan räcker. Enda manuella fältet är `featureList` i skapa-cv.

### 8.4 Spänningen "gratis" i artikelns slug och title

Artikeln heter `cv-mall-word-gratis` och Word ligger i Premium (B2). Artikeln handlar också om Microsofts gratismallar och våra tre fria mallar som PDF, så rubriken är inte osann, men snabbsvaret måste säga rakt ut att Word-filen från oss ingår i Premium och PDF:en är gratis. Slug och title ändras inte (ranking). Vill ägaren hellre ha ett helt sant "gratis" finns alternativet i avsnitt 11.

## 9. Mätning

Från dag 1 (händelser som redan finns får nya egenskaper, inget nytt event):

- `logPremiumUsage('cv_export', { template, format })` och `formatted_cv_downloads.format`: Word-andel av alla exporter, per mall.
- `paywall_shown`, `paywall_cta_clicked` och `feature_blocked` med `feature: cv_export_word` (PaywallCard gör det automatiskt när varianten finns). Låsta Word-tryck → betalvägg → kassa som egen rad i `/admin/tratt`.
- `subscription_paid` matchas mot senaste `paywall_cta_clicked` inom 24 timmar (fråga i PostHog, ingen kodändring) för att se om Word var sista spärren före köp.
- Skyddsmått: andelen nya konton med CV som gör sin första export, fyra veckor före och fyra veckor efter.
- Återkomst: andel aktiva igen inom 14 dagar efter export, uppdelat på pdf och docx (profiles.last_active mot formatted_cv_downloads).
- GSC: sökorden i avsnitt 8, avläsningsdatum där.

Avgörande om fyra veckor efter deploy: Word räknas som rätt beslut om minst 15 procent av låsta Word-tryck leder till `paywall_cta_clicked` (hypotes, inte belagt tal) och aktiveringsmåttet inte faller. Faller aktiveringen tydligt prövas Word som den enda gratisexporten (B2 omprövas). Antalet köp är för litet för att bära ett beslut ensamt (tre betalande i oktober).

## 10. Tidsplan

Black Week-kampanjen är live sedan 2026-11-13 och komponenterna är frysta 23 till 30 november (Black Week 23 till 29, Cyber Monday 30). Inget mergas till main under frysen.

| När | Vad | Vem | Insats |
|---|---|---|---|
| Vecka 47 (16 till 20 nov) | Ägaren godkänner skissen i artefakt. Copywritern skriver strängarna (betalvägg, formatval, bekräftelse, publika texter, FAQ) i `docs/design/copy-cv-word.md`. | Ägaren, svensk-ux-copywriter | S |
| Vecka 47 till 48 (17 till 29 nov) | Bygget på grenen `feat/cv-word`: basen, sex mallar, rutten, enhetstester, formatvalet, märkningen, betalväggen, publika texter. Grenen rör inte main och påverkar inte kampanjen. Word- och LibreOffice-rendering, ATS-jämförelse, klicktest. | Opus-agent, art-director granskar renderingarna | L (uppskattat 3 till 4 arbetsdagar) |
| 1 dec | Frysen släpper. Full build, perf-inloggat på `/dashboard/cv-mallar`, seo-diff, klickmatris. Merge och deploy efter ägarens ja. Migrationen `format` körs före deploy. | saas-lead | S |
| 1 till 4 dec | Artiklarna i avsnitt 8 (ny version av `cv-mall-word-gratis`, ny länk i `personligt-brev-mall-word`), IndexNow. | SEO-strateg + copywriter | M |
| 15 dec och 5 jan | GSC-avläsning av sökorden i avsnitt 8. | saas-lead | S |
| ca 29 dec | Fyra veckor: mätningen i avsnitt 9, beslut om B2 och om våg 2. | saas-lead | S |

## 11. Vad ägaren godkänner

**Beslut 2026-11-15:** ägaren lämnade punkt 2 till saas-lead och säljansvarig, som båda valt **alternativ A**: Word bara i Premium, gratisexporten förblir PDF. Bygget görs på `feat/cv-word` när arbetskopian är ledig, deploy 1 december enligt avsnitt 10.

1. Mallurvalet: Norrsken, Student och de fyra premiummallarna i avsnitt 3.
2. Word alltid Premium, gratisexporten förblir PDF (B2). Det här är det enda valet mellan pengar och löfte: **alternativ A (rekommenderat)** Word bara i Premium, artikeln säger "PDF gratis, Word i Premium"; **alternativ B** den enda gratisexporten får vara Word på Norrsken och Student, vilket gör "gratis" i artikeln helt sant men tar bort köpögonblicket vid andra exporten (PW5) för dem som fått en redigerbar fil. Jag rekommenderar A: tre betalande i oktober, word-klustret gav 1 klick på 90 dagar, konvertering går före besökare.
3. Formatvalets form och märkningen i skissen (B3).
4. Att de publika löftena ändras till "Word för utvalda mallar" (B8).
5. Tidsplanen: bygge på gren under frysen, deploy 1 december.

Allt annat (filstruktur, tester, mätning) är beslutat här och kräver inget mer från ägaren.
