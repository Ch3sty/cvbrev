# Granskning av mallutbudet, 2026-11-16

Art-director, mot facit i `docs/design/skiss-mallutbud-2026-11-16.html` och specen `docs/design/mallar-utbud-2026-11-16.md`. Grenen feat/mallar i `C:\Users\chris\cvbrev-qa-b` (59ec1703). Ägarens krav: de tolv kärnmallarna ser likadana ut i Word och PDF, de åtta konstnärliga är sådana att någon vill använda dem. Ägarens mandat: "Det är fritt att ta bort de som felar."

## Underlag

Alla bilder ligger i scratchpad, aldrig i git: `C:\Users\chris\AppData\Local\Temp\claude\c--Users-chris-cvbrev\10a91959-c28a-429d-98a1-476a4f616a98\scratchpad\` (nedan kallad `S\`).

- `S\word-qa\<mall>-<längd>-jamforelse.png`: Chrome-PDF (vänster) mot Word-PDF (höger), sida för sida, tolv mallar i tre längder (byggagentens underlag).
- `S\granskning-mallar\pdf\<mall>-<fall>.pdf` och `-s<n>.png`: egen rendering av alla 20 genom nedladdningens kedja i nio fall per mall: kort, normalt, langt, accent1 till accent3 (accent 2 till 4), intyg (intyg först), ensida (få plats på en sida), utanfoto (mallar med fotoplats). Foto på i alla längder. Sidantal i `pdf\sidor.json`.
- `S\granskning-mallar\ark\<mall>-langder.png`: kort s1, normalt s1 och s2, långt s1 till s3 på en rad. `<mall>-val.png`: accent 2, 3, 4, utan foto, intyg först, en sida. `zoom-*.png`: urklipp i full skala.
- `S\granskning-mallar\facit\<mall>.png`: skissens ark per mall.
- `S\granskning-mallar\miniatyrer\remsa-412-liten.png` (112 x 158 i 412 px bredd) och `rutnat-stor.png` (300 x 424).
- Skripten som gjorde bilderna: `S\granskning-mallar\rendera.ts`, `facit.ts`, `ark.ts`, `montage.ts` (körs från cvbrev-qa-b med `npx tsx`).

UX-designern (mobile-ux-designer) har granskat samma bilder som motpart; hennes bedömning står i avsnitt 5.

## 1. Sammanfattning

| Nr | Mall | Status | Kärnan i fyndet |
|---|---|---|---|
| 1 | Linne | GODKÄND | Word och PDF lika. Bara G2. |
| 2 | Björk | GODKÄND | Lika. G3 (mittpunkten hamnar först på raden). |
| 3 | Koppar | RÄTTAS | Word-bandet 74 mm mot Chrome 56 mm, texten börjar 31 mm ner i Word mot 14 mm. |
| 4 | Kalksten | RÄTTAS | Sidospalten spiller till sida 2 med bara Språk medan huvudspalten slutar halvvägs (G1). Word-punkter fyrkantiga (G4), listan glesare (G5). |
| 5 | Granit | RÄTTAS | Samma som Kalksten plus ord som bryts mitt i ("Läkemedelsdelegerin g") i båda formaten; Word sida 3 har tom mörk spalt. |
| 6 | Kolumn | RÄTTAS | Word: första posten börjar 4 mm under rubrikcellen, luften mellan poster 6 mm i stället för 3,5. |
| 7 | Årsring | RÄTTAS | PDF: den lodräta linjen har 3,5 mm glipor mellan posterna. Word: perioden står 3 mm högre än titeln. |
| 8 | Antikva | GODKÄND | Lika. G2 (kompetensblocket delas över sidbrytning i långt CV). |
| 9 | Fasad | GODKÄND | Lika. G2, G3. |
| 10 | Raster | GODKÄND | Lika. G4 (fyrkantiga punkter i Word-spalterna). Tonen ur accenten 86 till 80 procent mot vitt så accent 2 och 4 går att skilja åt. |
| 11 | Folio | GODKÄND | Lika. G2. |
| 12 | Stål | GODKÄND | Lika så när som på G4 och G5 (Word lägger "Referenser" ensamt på sida 2 i normalt CV). |
| 13 | Mörkrum | GODKÄND | Som facit i alla längder och accenter. |
| 14 | Terrakotta | GODKÄND | Som facit. G2 (gruppnamnet "Personliga" ensamt sist på sidan vid intyg först). |
| 15 | Kvadrat | GODKÄND | Som facit. Normalt CV ger en sida 2 med sex rader; "en sida" löser det. Anmärkning, inte fel. |
| 16 | Siluett | RÄTTAS | KORT_CV med foto blir två sidor (sida 2: Språk och Referenser). |
| 17 | Ritning | RÄTTAS | Den blå spalten slutar cirka 50 mm över nederkanten på varje sida, med en synlig skarv. |
| 18 | Tidning | RÄTTAS (litet) | Som facit, men marginaljusteringen ger gluggar i korta profiler: två spalter bara från fyra rader. G2. |
| 19 | Tusch | RÄTTAS (litet) | Som facit, men årtalen i #B5B5B5 ger 2,0:1 mot vitt; AA för stor text kräver 3:1. #8A8A8A (3,4:1). G2. |
| 20 | Horisont | RÄTTAS, annars STRYKS | Etiketterna på tidsaxeln ligger på varandra i långt CV. |

Ingen mall stryks i dag. Horisont stryks om axeln inte går att få ren på LANGT_CV; den bär hela mallens idé.

Allt som inte står här stämmer med specen: typsnitt, grader, marginaler, accenternas fyra värden och roller, fotoformer, huvudets form, rubrikernas form, sektionsordning, "intyg först", "en sida", foto av utan hål. De fyra accenterna fungerar i alla 20. Namnet "Märta Söderström-Ångström" bryts rätt (på bindestrecket eller mellanslaget) i Koppar, Granit, Mörkrum, Kvadrat, Fasad och Ritning.

## 2. Generella rättelser (byggs i renderaren och Word-byggaren, inte per mall)

**G1. Sidospalterna: samma panel i båda formaten, och spalten får inte bli längre än huvudspalten.** Gäller Kalksten och Granit (Word och PDF), Stål (högerspalten), Kvadrat och Ritning (bara PDF).

Fyndet: i `S\word-qa\granit-normalt-jamforelse.png` och `kalksten-normalt-jamforelse.png` slutar huvudspalten vid 60 procent av sida 1, men kompetenserna som lodrät punktlista (15 rader) i 37 mm textbredd trycker ner Språk till sida 2, så sida 2 består av ett ensamt språkblock. I `granit-langt-jamforelse.png` har Word en tom mörk spalt över hela sida 3. I `S\granskning-mallar\ark\zoom-granit-spalt.png` och `granit-kort` bryts "Läkemedelsdelegering" mitt i ordet, i båda formaten: `body` har `overflow-wrap: break-word` (html.ts rad 295), som bryter varje ord som inte ryms på raden, och 37 mm textbredd minus 3,5 mm indrag räcker inte för 20 tecken i Arial 9,5 pt fet; Word gör samma sak med ett ord bredare än cellen.

Regeln:
1. Kompetenser i en sidospalt eller högerspalt (`kompetenserISpalt`) renderas som `mittpunkt`, inte `lista`: gruppnamnet fett på egen rad, därunder kompetenserna skilda med " · ", varje kompetens som eget `span` (PDF) och egen run (Word), 9 pt i Kalksten och Granit, 9 pt i Stål, 9 pt i Kvadrat och Ritning. Det tar ner spalten från 15 till cirka 6 rader och tar bort ordbrytningen. Specen avsnitt 3.4, 3.5, 3.12, 3.15, 3.17 ändras i motsvarande rad; `kompetenserISpalt: 'mittpunkt'` i de fem definitionerna.
2. `overflow-wrap: anywhere` bara på `.kontakt-lista li`. Kompetenser, intyg och språk i spalten får `overflow-wrap: normal` (ett för långt ord sticker hellre ut 2 mm än bryts).
3. Panelen fyller hela spaltraden i båda formaten. PDF: spalterna är redan en `table` (html.ts rad 516 och 521) så cellen sträcks med raden; ge `tr` i `.spalter` `height: calc(297mm - <huvudets höjd> - <sidmarginal upp och ner>)` (tabellrader tolkar height som minsta höjd) så att panelen alltid når nederkanten på sida 1 även i ett kort CV (i dag slutar den vid 60 procent av sidan i `kalksten-kort` och `granit-kort`, i båda formaten). Word: tabellraden `height: { rule: 'atLeast' }` med samma mått. På följande sidor fortsätter panelen så långt tabellraden går, i båda formaten (Word gör det redan; PDF ska göra likadant). Detta ersätter specens regel "bakgrunden fortsätter inte" i avsnitt 2 Sidbrytningar; jag skriver om den raden i specen. Skälet: Word kan inte avsluta en cells skuggning mitt i raden, och en panel som slutar mitt på sidan ser ofärdig ut.
4. Grind: NORMALT_CV i Kalksten och Granit ska ge två sidor där sida 2 börjar med huvudspaltens innehåll (Utbildning eller Referenser), aldrig med spaltens. KORT_CV ska ge en sida med panel till nederkanten.

**G2. Hålla ihop i PDF det Word redan håller ihop.** Fynd: `S\word-qa\antikva-langt-jamforelse.png` och `folio-langt-jamforelse.png` (kompetensgruppen "Ledarskap" ensam på sida 3), `S\granskning-mallar\ark\terrakotta-val.png` bild 4 (gruppnamnet "Personliga" ensamt sist på sida 1, brickorna på sida 2), `S\granskning-mallar\ark\tusch-langder.png` (Styrning på sida 3), samt intygslistan som delas 1 + 3 i `antikva-normalt`, `fasad-normalt`, `tidning-normalt` och 2 + 2 i `linne-normalt`. Word håller ihop det (keepNext), Chrome inte.

Regeln i CSS: varje kompetensgrupp (`.grupp`, `.grupp-mitt`, gruppnamn plus innehåll) `break-inside: avoid`; hela kompetensblocket `break-inside: avoid` när det är kortare än 45 mm (mät i renderaren: färre än fyra grupper); `.gruppnamn { break-after: avoid }`. Intyg i formen `rad`: hela listan `break-inside: avoid` när den har högst sex rader; annars minst två rader med rubriken (`orphans`-regeln går inte på flex-rader, så lägg `break-inside: avoid` på rubrik plus de två första raderna i ett omslutande element). Samma för språk.

**G3. Mittpunktsraden får aldrig börja med punkten.** Fynd: `S\granskning-mallar\ark\zoom-bjork-mittpunkt.png` ("· Riskhantering och kvalitetssäkring" börjar raden), samma i Fasad och Siluett. Separatorn ska sitta fast vid föregående kompetens: `<span class="prick">&nbsp;·</span> ` (fast mellanslag före punkten, vanligt efter), i Word en run "&nbsp;·" före det vanliga mellanslaget. Efter G1 gäller det också sidospalterna.

**G4. Word: punkttecknet.** Fynd: fyrkantiga punkter i Word i Kalksten och Granit (sidospalten), Raster (kompetensspalterna) och Stål (högerspalten), runda i Linne och Björk, se `S\word-qa\raster-normalt-jamforelse.png` och `stal-normalt-jamforelse.png` höger sida. Numreringen `punkter` i bygg.ts saknar `run.font`; Word faller tillbaka på Symbol i celler. Sätt `font: <mallens brödtypsnitt>` på nivån (och på punktens run), så blir det "•" överallt.

**G5. Word: listornas radavstånd i spalter.** Fynd: Word-listorna i spalter är 8 till 10 procent glesare än Chrome (`stal-normalt`: 15 rader 205 px mot 192 px; `kalksten-normalt` sidospalten), vilket ger Stål en sida 2 med bara "Referenser". Listpunkter i celler ska ha samma `line` som brödtexten (multipel 1,15 för Calibri enligt specen) och `after: 0,6 mm`, `contextualSpacing: true`. Grind: Stål NORMALT_CV på en sida i Word, som i Chrome.

**G7. "Få plats på en sida" ska ge en sida.** Fynd (UX-designern, bekräftat i `pdf\sidor.json`): 14 av 20 `-ensida` ger två sidor med NORMALT_CV; bara Kalksten, Granit, Kolumn, Stål, Kvadrat och Ritning når en. Specens fasta steg (marginal minus 4 mm, grad minus 0,5 pt, luft 4 mm) räcker inte för ett CV på 1,2 sidor. Regeln: valet kör stegen i ordning tills sidan försvinner, högst fyra steg, och ger upp (två sidor, utan varning i filen) när gränsen är nådd: steg 1 specens värden; steg 2 grad minus ytterligare 0,5 pt och radavstånd minus 0,06; steg 3 luft ovanför avsnitt 3 mm och luft mellan poster 2,5 mm; steg 4 marginaler minus ytterligare 2 mm. Samma steg i Word (byggaren får `val.enSida` som i dag men med det steg renderaren landade på, så att båda formaten får samma mått). Grind: alla 20 `-ensida` ger 1 i `sidor.json` för NORMALT_CV; KORT_CV orört.

**G6. Word: kortare "sista sida".** Följer av G5 och Koppar-bandet; grinden "sista sidan har minst tre rader" i word-mallar-granska står kvar men ska också fälla när sista sidan bara innehåller ett avsnitt (Referenser) som fick plats på föregående sida i Chrome.

## 3. Per mall

### 1. Linne: GODKÄND
`S\word-qa\linne-normalt-jamforelse.png`, `linne-kort`, `linne-langt`. Word och Chrome är lika i huvud, rubriker, linjer, perioder och sidbrytning. Enda skillnaden: Chrome delar certifieringarna 2 + 2 över sidbrytningen, Word flyttar hela listan (G2). Facit stämmer.

### 2. Björk: GODKÄND
`S\word-qa\bjork-normalt-jamforelse.png`, `bjork-langt`. Lika i båda formaten: fotot, det centrerade huvudet, linjen, stapeln vid rubrikerna, arbetsgivaren i accent. `S\granskning-mallar\ark\bjork-val.png`: utan foto börjar namnet vid övre marginalen utan hål. G3 (`zoom-bjork-mittpunkt.png`).

### 3. Koppar: RÄTTAS (Word)
Fynd: `S\word-qa\koppar-normalt-jamforelse.png` och `koppar-kort-jamforelse.png`: Chrome-bandet är 56 mm högt i normalt CV (50 mm i kort) och namnet börjar 14 mm från papperskanten; Word-bandet är 74 mm i båda och namnet börjar 31 mm ner. I långt CV (`koppar-langt`) är bandet 58 mm i Word mot 57 i Chrome, så felet beror på radhöjden, inte innehållet: bygg.ts rad 869 sätter `height: { value: mm(48), rule: 'atLeast' }` på raden, och Word lägger cellmarginalerna 14 + 12 mm ovanpå (74 mm), med texten lodrätt centrerad (rad 693).
Rättelse: radhöjden "atLeast" ska vara 48 mm inklusive cellmarginalerna (sätt värdet till `mm(48 - 14 - 12)` eller ta bort radhöjden när innehållet redan överstiger 22 mm), och `verticalAlign: TOP` på textcellen (fotocellen får vara CENTER). Grind: bandets höjd i Word inom 2 mm från Chrome i alla tre längder (50, 56, 57 mm) och namnets överkant på 14 mm.
PDF: som facit i alla fall (`S\granskning-mallar\ark\koppar-val.png`): accenterna, bandet behåller höjden utan foto, intyg först, en sida.

### 4. Kalksten: RÄTTAS (G1, G4, G5)
Fynd: `S\word-qa\kalksten-normalt-jamforelse.png`: sida 2 har bara Språk i panelen (Chrome) respektive Personliga och Språk (Word), huvudspalten slutade halvvägs på sida 1. `kalksten-kort`: panelen slutar vid 60 procent av sidan i båda formaten. `kalksten-langt`: Word har tom grå panel på sida 3; Chrome har panel till sidans slut på sida 2 men inte på sida 3, alltså olika. Word-punkterna fyrkantiga, listan glesare. Kontaktlistan bryter e-posten "exempel.s / e" i Chrome och "exemp / el.se" i Word; godtagbart båda, men lägg gärna `<wbr>` efter "@" så brytningen hamnar där.
Rättelse: G1 (mittpunkt i spalten, panel till nederkanten på sida 1 och lika i båda formaten), G4, G5. Intygsfältet, fotot, huvudet och rubrikerna är rätt och lika.

### 5. Granit: RÄTTAS (G1, G4, G5)
Fynd: `S\word-qa\granit-normalt-jamforelse.png` (sida 2 bara språkblock), `granit-kort-jamforelse.png` ("Läkemedelsdelegerin g" bruten mitt i, i båda), `granit-langt-jamforelse.png` (Word: tom mörk spalt hela sida 3; Chrome: spalt till sidans slut på sida 2, ingen på 3). Bandet och spalten bildar ett sammanhängande L i båda, bra. `S\granskning-mallar\ark\granit-val.png`: accenterna, utan foto och en sida är rätt.
Rättelse: G1 punkt 1 och 2 tar bort ordbrytningen och tömmer sida 2; G1 punkt 3 gör sida 3 lika. G4, G5.

### 6. Kolumn: RÄTTAS (Word)
Fynd: `S\word-qa\kolumn-normalt-jamforelse.png` och `kolumn-kort-jamforelse.png`: i Chrome står första postens titel på samma höjd som rubriken i marginalkolumnen; i Word börjar titeln 4 mm lägre (Posttitel-stilen har `before: luftMellan` och det slår igenom på cellens första stycke). Luften mellan poster är 6 mm i Word mot 3,5 i Chrome (punktens `after` plus postens `before` adderas). Kompetensgrupperna får 4 pt luft mellan sig i Word, 0 i Chrome.
Rättelse: första stycket i innehållscellen `spacing.before: 0`; `contextualSpacing` eller `after: 0` på sista punkten i en post så att avståndet blir 3,5 mm; gruppstyckena `after: 0`. Grind: samma sidbrytning som Chrome i normalt (Certifieringar på sida 1) och långt CV.
PDF: som facit.

### 7. Årsring: RÄTTAS (PDF och Word)
Fynd PDF: `S\granskning-mallar\ark\zoom-arsring-linje.png`: den lodräta accentlinjen är bruten med 3,5 mm glipa mellan varje post, för linjen sitter på `.post-innehall` per post och postens `margin-top` ligger utanför. Specen: obruten genom hela avsnittet. Word har den obruten (cellkant).
Rättelse PDF: linjen som `border-left` på avsnittets innehållskolumn (ett element per avsnitt, som Word-tabellen), eller flytta luften mellan poster till `padding-top` inne i `.post-innehall`.
Fynd Word: `S\word-qa\arsring-normalt-jamforelse.png` och `arsring-kort`: perioden i marginalcellen står 3 mm högre än titeln (titeln har `before`, perioden inte).
Rättelse Word: samma `spacing.before` på periodstycket som på Posttitel, eller 0 på båda i avsnittets första rad. Grind: periodens och titelns baslinjer inom 0,5 mm.

### 8. Antikva: GODKÄND
`S\word-qa\antikva-normalt-jamforelse.png`, `antikva-kort`, `antikva-langt`. Dubbellinjen, det centrerade huvudet, rubrikerna: lika. G2 (`antikva-langt`: kompetensgruppen Ledarskap ensam på sida 3; `antikva-normalt`: certifieringar 1 + 3).

### 9. Fasad: GODKÄND
`S\word-qa\fasad-normalt-jamforelse.png`, `fasad-langt` (det långa namnet i versaler bryts på bindestrecket i båda, titeln på två rader i båda). `S\granskning-mallar\ark\fasad-val.png`: utan foto tar texten hela bredden. G2 (certifieringar 1 + 3), G3.

### 10. Raster: GODKÄND (med en siffra)
`S\word-qa\raster-normalt-jamforelse.png`, `raster-langt`. Banden, kompetensspalterna, ordningen med kompetenser före utbildning: lika. `S\granskning-mallar\ark\raster-val.png`: tonerna ur accenterna räknas rätt, men marin (bild 1) och oliv (bild 3) blir båda ljusgrå vid 86 procent vitt. Rättelse: `tonAndel` 0,80 i definitionen (teal ger då #CFE2E2), specen 3.10 ändras från 86 till 80 procent. G4 (fyrkanter i Word-spalterna).

### 11. Folio: GODKÄND
`S\word-qa\folio-normalt-jamforelse.png`, `folio-kort`, `folio-langt`. Högerställt huvud, kursiva rubriker, hårlinjer: lika. G2 (`folio-langt`: Redovisning på sida 2, resten på 3).

### 12. Stål: GODKÄND (G4, G5)
`S\word-qa\stal-normalt-jamforelse.png`: Chrome en sida, Word två där sida 2 bara har Referenser; det är G5. `stal-langt`: lika sida för sida. `stal-kort`: lika. G4.

### 13. Mörkrum: GODKÄND
`S\granskning-mallar\ark\morkrum-langder.png` och `morkrum-val.png` mot `facit\morkrum.png`: blocket, namnet 34 pt, fotot, accentkvadraterna, de ljusa accenterna bara i titeln. Blocket behåller höjden utan foto. Det långa namnet bryts på bindestrecket.

### 14. Terrakotta: GODKÄND
`S\granskning-mallar\ark\terrakotta-langder.png` och `terrakotta-val.png` mot `facit\terrakotta.png`: sidbakgrunden, de korta rubriklinjerna, brickorna. G2 (bild 4 i `terrakotta-val.png`).

### 15. Kvadrat: GODKÄND
`S\granskning-mallar\ark\kvadrat-langder.png`, `kvadrat-val.png` mot `facit\kvadrat.png`: namnrutan, hårlinjen, läsordningen. Anmärkning: NORMALT_CV ger en sida 2 med bara Utbildning och Referenser (sex rader), för huvudspalten är 60 procent bred i 9,5 pt; "en sida" ger en sida. Godtagbart för en mall som föreslås för korta och normala CV.

### 16. Siluett: RÄTTAS (PDF)
Fynd: `S\granskning-mallar\ark\siluett-langder.png` bild 1 och 2: KORT_CV med foto blir två sidor, sida 2 har bara Språk och Referenser. Huvudet tar 80 mm (foto 40 mm, namn 30 pt, titel, kontakt, linje) och avsnittsluften 5,5 mm gör resten.
Rättelse: `sida.topp` 14 till 12 mm, foto 40 till 36 mm, `rubrik.luftOver` 5,5 till 4,5 mm, `post.luftMellan` 3,5 mm. Grind: KORT_CV med foto på en sida, NORMALT_CV på två. Utan foto (`siluett-val.png` bild 4) börjar namnet överst utan hål, bra.

### 17. Ritning: RÄTTAS (PDF)
Fynd: `S\granskning-mallar\ark\ritning-langder.png` och `zoom-ritning-botten.png`: den blå spalten slutar cirka 50 mm över nederkanten på varje sida (normalt, kort, långt, alla accenter) och har en synlig skarv vid cirka 250 mm. `extraCss` i ritning.ts: `.cv::before { position: fixed; top: -30mm; bottom: -30mm }` täcker inte sidan i Chrome-PDF, och spaltcellens egna bakgrund slutar vid innehållet (skarven).
Rättelse: `.cv::before { content: ""; position: fixed; top: 0; left: 0; width: 66mm; height: 297mm; background: var(--accent); z-index: -1 }` i utskrift (eller `html { background: linear-gradient(to right, var(--accent) 66mm, var(--sida) 66mm) }` med `print-color-adjust: exact`), och ingen egen bakgrund på `.spalt-sido` i utskrift. Grind: alla tre sidor i LANGT_CV har spalten från 0 till 297 mm utan skarv. Allt annat är som facit: namnet bryts på mellanslag, vita linjer, rubrikerna.

### 18. Tidning: RÄTTAS (litet)
`S\granskning-mallar\ark\tidning-langder.png` mot `facit\tidning.png`: tidningshuvudet, dateraden, profilen i två spalter med anfang, marginaljustering utan avstavning. Fynd (UX-designern): i KORT_CV (bild 1) är profilen två rader, och två spalter av två rader med marginaljustering ger ordmellanrum på tre teckenbredder. Rättelse: profilen sätts i två spalter bara när den är minst 280 tecken (cirka fyra rader i full bredd); kortare profil i en spalt med anfang, vänsterställd. G2 (certifieringar 2 + 2 i normalt).

### 19. Tusch: RÄTTAS (litet)
`S\granskning-mallar\ark\tusch-langder.png` mot `facit\tusch.png`: de stora ljusgrå årtalen med "Pågående" eller "till 2021" under, de korta rubriklinjerna. Fynd (UX-designern, räknat): årtalen i #B5B5B5 ger 2,05:1 mot vitt och är den enda platsen perioden står; stor text kräver 3:1 (hårda ramar: AA). Rättelse: `stortAr.farg` #8A8A8A (3,45:1) i definitionen och i specen; "till 2021" i #888 (3,5:1) står kvar. G2 (Styrning på sida 3 i långt CV).

### 20. Horisont: RÄTTAS, annars STRYKS
Fynd: `S\granskning-mallar\ark\zoom-horisont-langt-axel.png`: med sju anställningar och tre utbildningar 2002 till 2021 ligger etiketterna på varandra ("2006 Göteborgs Energi" över "2008 Öhrlings", två "2011" ihop, "2002 Handelshögskolan" över "2003 ICA Maxi"). `zoom-horisont-normalt-axel.png`: fyra punkter går bra. Etiketterna är 7,5 pt och axeln 18 mm hög.
Rättelse: riktig kollisionslayout i stället för treårsregeln: räkna varje etiketts bredd (0,55 x grad x antal tecken, i mm), lägg etiketten på första raden av tre (0, 11, 22 mm) där den inte överlappar föregående etikett på den raden med minst 2 mm marginal, hjälplinje till rad 2 och 3. Fler än sex punkter: bara årtal. Arbetsgivare kortas till 18 tecken med tre punkter. Axelns höjd växer med antalet rader. Grind: LANGT_CV utan överlapp, mätt i renderaren (inga två etiketter med överlappande x-intervall på samma rad). Om det inte går att få rent stryks mallen, för axeln är hela idén; resten av mallen är en vanlig enspaltig.

## 4. Miniatyrerna

`S\granskning-mallar\miniatyrer\rutnat-stor.png`: de 20 stora miniatyrerna skiljer sig åt i form och är rätt (samma CV, sida 1, foto på, förvald accent). `remsa-412-liten.png`: i 112 x 158 är tio mallar "vit sida med grå text" och går inte att skilja åt (Linne, Kolumn, Årsring, Folio, Raster, Stål, Tusch, Horisont, i praktiken också Antikva och Tidning); band, paneler, foto, namnruta och sidfärg syns.

UX-designern föreslår att den lilla miniatyren visar sidans övre 45 procent större. Jag avgör: beskärningen ändras inte. Ramen 112 x 158 har A4:s proportion, så en större övre del kräver att också sidorna skärs bort, och då försvinner just det som bär formen i liten storlek (Granits högerspalt, Kopparns foto, Ritnings vänsterspalt). I stället får varje miniatyr i remsan en textrad under sig: mallnamnet och formfamiljen ur katalogen ("Linne · Enspaltig klassisk", "Årsring · Tidslinje"), 12 px, två rader tillåtna. Det är en komponentändring i mallväljaren, inte i bilderna. Den stora miniatyren (300 x 424) står kvar som hela sidan och är den som bär valet; remsan är ett register.

## 5. UX-designerns bedömning och mina avgöranden

Hon läste alla 40 ark, miniatyrerna och facit (egna utsnitt i `S\horisont-etiketter.png`, `tidning-huvud.png`, `kalksten-panel.png`, `tusch-ar.png`, `sida2-problem.png`, `remsa-zoom1.png`, `remsa-zoom2.png`). Hennes helhetsbetyg: formerna är tydligt olika i stor vy och skiljer sig på riktigt från det gamla; problemet är sidekonomin. Punkt för punkt:

| Hennes fynd | Mitt avgörande |
|---|---|
| A. 16 av 20 ger med NORMALT_CV en sida 2 fylld till 10 till 35 procent; rubriker med en rad sist på sidan; lösryckta gruppnamn. | De lösryckta rubrikerna och gruppnamnen är G2 och rättas. Att Erik Lindbergs CV blir 1,2 sidor är fixturens egenskap (specen kallar den "två sidor"), inte mallens fel; en automatisk krympning till föregående sida vill jag inte ha som förval, användaren ska känna igen sitt CV. Det är vad "få plats på en sida" är till för, och den ska fungera: G7. |
| B. "Få plats på en sida" ger två sidor i 14 av 20. | Rätt och allvarligt. G7 med grind. |
| C. Platshållarsiluetten syns i PDF:erna. | Mitt renderingsskript matade in en testbild (`FOTO` i `rendera.ts`), så det är inte platshållaren. `*-utanfoto` visar inget hål och ingen gubbe. Ett test som renderar NORMALT_CV utan `profilePhotoUrl` i alla sju fotomallar och fäller på `<img` i HTML och på bild i docx läggs i grinden (byggagenten). |
| Kalksten, Granit: panel ensam på sida 2, tom panel sida 3, ord brutna. | G1, samma slutsats. Hennes alternativ (flytta Språk till huvudspalten när panelen bryter, sidor utan panelinnehåll i full bredd) avslås: det gör Word och PDF olika och mallens form beroende av CV:t. |
| Siluett: kort CV på två sidor, facit har samma sjuka. | Rättas (3.16): foto 36 mm, topp 12 mm, luft 4,5 mm. Jag uppdaterar skissen. |
| Mörkrum: block 72 mm är 24 procent av sidan; accenterna syns inte. | Blocket står kvar, det är mallens idé och normalt CV blir två sidor även med 56 mm. Accentens roll (titeln och kvadraterna) står kvar: den är en detalj på ett svart block, inte en bandfärg, och mallväljaren visar stor förhandsvisning där den syns. |
| Tusch: årtal 2,0:1. | Rättas (3.19), #8A8A8A. |
| Raster: accent 2 och 4 ser lika ut. | Rättas (3.10), tonen 80 procent. |
| Horisont: axeln kollapsar. | Samma fynd, 3.20. Hennes gräns "fler än sex punkter bara årtal" och 18 tecken tas in i rättelsen. |
| Tidning: gluggar i korta profiler. | Rättas (3.18). |
| Fasad, Ritning, Mörkrum, Kvadrat: dubbelnamn på två eller tre rader. | Avsiktligt enligt spec avsnitt 2 (bryts på bindestreck eller mellanslag, aldrig under 22 pt). Facit för Ritning har namnet på två rader. Står kvar. |
| Kvadrat och Stål: tom vänster- eller högerspalt på sida 2 och 3. | Tvåspaltiga mallars natur; Kvadrat föreslås för korta och normala CV, Stål håller två sidor för normalt. Står kvar. |
| Miniatyrerna: övre 45 procent, namn och formfamilj under. | Namn och formfamilj ja, beskärning nej (avsnitt 4). |
| Renderingsmiljön: PDF:erna bäddar in Windows-typsnitt (Garamond, Calibri, Georgia, Times New Roman). | Viktigt och utanför min granskning: samordnaren ska bekräfta att produktionens PDF-kedja har samma typsnitt eller metriskt kompatibla ersättare (Carlito för Calibri, EB Garamond, Gelasio för Georgia, Liberation Serif för Times) och att arken i den här granskningen kommer från samma renderare som kunden får. Annars gäller inte granskningen. |

## 6. Svar till samordnaren om sidospalterna

Risken "spalten längre än huvudspalten" finns i Kalksten, Granit (båda formaten), Stål (högerspalten), Kvadrat och Ritning (bara PDF). Mörkrum har ingen spalt. Orsaken är kompetenser som lodrät punktlista i 33 till 40 mm textbredd. Den generella regeln är G1: kompetenser i spalt som mittpunktsrad, panel som fyller raden i båda formaten, och grinden att sida 2 aldrig börjar med spaltinnehåll. Att flytta avsnitt till huvudspalten när spalten är längre vill jag inte göra: det ändrar mallens form per CV och gör Word och PDF olika. Om G1 inte räcker för ett CV med 30 kompetenser är nästa steg att spaltens kompetenser visar högst 16 och resten går till huvudspalten under rubriken "Fler kompetenser", lika i båda formaten.
