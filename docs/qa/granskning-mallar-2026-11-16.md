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

---

# Andra granskningen, 2026-11-16

Art-director, efter byggagent A:s rättelser G1 till G7 och per mall (9950f226), typsnittsinbäddningen (54fb4627) och miniatyrerna (f9dabaaf). Samma facit och spec som i första granskningen. Ägarens krav står kvar: kärnmallarna likadana i Word och PDF, de konstnärliga sådana att någon vill använda dem, fritt att ta bort det som felar.

## Underlag

- `S\word-qa\<mall>-<längd>-jamforelse.png` (Chrome vänster, Word höger, 36 par) och sidorna var för sig som `-chrome-s<n>.png` och `-s<n>.png`.
- `S\sidbrytning\<mall>-<kort|normalt|langt|ensida>-s<n>.png` (alla 20, PDF) och `sidbrytning.json`: 80 av 80 utan fel, alla 20 `-ensida` ger en sida.
- `S\ats\ats-resultat.json`: 160 av 160 utan fel.
- Egna renderingar i `S\ad2\` (skripten `prova.ts`, `prova2.ts`, `prova3.ts`, körs från cvbrev-qa-b med `npx tsx`, patchar HTML:en i minnet och rör ingen kod): `pdf\kalksten-normalt-ref` (orörd), `pdf\kalksten-normalt-col`, `kalksten-kort-col`, `granit-normalt-col`, `granit-langt-col` (med `<colgroup>`), `pdf\siluett-kort-foto` (KORT_CV med foto, som sidbrytningsskriptet inte renderar), `pdf\ritning-langt-ref`, `-fixed`, `-fixed2`, `-html100` (fyra CSS-varianter som inte hjälper), `pdf\ritning-*-thead` och `ritning-*-grad` (varianten som fungerar), `ritning-grad-trio.png`, `miniatyrer-stor.png`, urklipp `*-botten.png`, `granit-spalt.png`, `ritning-spalt.png`, `ritning-topp-idag.png`.
- Mått i mm är mätta i pixlar på sidbilderna (595 x 841 px per A4-sida), inte uppskattade.

## 1. Sammanfattning

| Nr | Mall | Status | Kärnan |
|---|---|---|---|
| 1 | Linne | GODKÄND | Lika sida för sida i alla tre längder. |
| 2 | Björk | RÄTTAS (litet) | NORMALT_CV: Chrome flyttar Tekniska kompetenser (35 mm) till sida 2 fast 75 mm är ledigt på sida 1; Word har det på sida 1. R7. |
| 3 | Koppar | GODKÄND | Bandet nu 56 mm i båda, namnet på samma höjd. LANGT_CV skiljer sig på sida 2 och 3 (R8, Word kortare). |
| 4 | Kalksten | RÄTTAS | PDF-spalten har blivit 105 mm bred (halva sidan) i stället för 58 mm, i alla längder och i miniatyren. Orsaken är hittad och rättelsen bevisad (R1). Word-panelen slutar 7 till 10 mm högre än Chromes (R3). |
| 5 | Granit | RÄTTAS | Samma spaltbredd i PDF (R1). Word: sida 1 i NORMALT_CV och LANGT_CV innehåller bara bandet, allt innehåll börjar på sida 2 (R2). Mittpunkterna syns inte på den mörka panelen i PDF (R4). |
| 6 | Kolumn | GODKÄND | Första posten i höjd med rubriken i Word, luften mellan poster lika. EB Garamond bryter rader något annorlunda än Monotype Garamond men sidorna är desamma. |
| 7 | Årsring | GODKÄND | Linjen obruten i PDF, perioden i höjd med titeln i Word. LANGT_CV: kompetensgruppen ensam på sida 3 i båda (R6). |
| 8 | Antikva | GODKÄND | Lika i kort och normalt. LANGT_CV: Ledarskap-gruppen ensam på sida 3 i Chrome (R6). |
| 9 | Fasad | GODKÄND | Lika i alla tre längder. |
| 10 | Raster | GODKÄND | DejaVu Sans duger som Verdana (se avsnitt 2). Tonen 80 procent skiljer accenterna. LANGT_CV: Word en post längre per sida (R8). |
| 11 | Folio | GODKÄND | Lika i kort och normalt. LANGT_CV: Kunskaper och verktyg delas 1 + 3 i Chrome (R6). |
| 12 | Stål | GODKÄND | NORMALT_CV en sida i båda (G5 löst), runda punkter. LANGT_CV sida 2 skiljer sig (R8). |
| 13 | Mörkrum | GODKÄND | Oförändrad, som facit. |
| 14 | Terrakotta | GODKÄND | Oförändrad, som facit. |
| 15 | Kvadrat | GODKÄND | Mittpunkt i spalten läsbar, sida 2 med Utbildning och Referenser som förut (anmärkning, inte fel). |
| 16 | Siluett | GODKÄND | KORT_CV med foto på en sida (`S\ad2\pdf\siluett-kort-foto-s1.png`), NORMALT_CV två. |
| 17 | Ritning | RÄTTAS | Spalten slutar fortfarande 18 mm över nederkanten och börjar 18 mm under överkanten på varje sida (det är @page-marginalerna). A:s CSS kan inte lösa det; den väg som fungerar är bevisad (R5). |
| 18 | Tidning | GODKÄND | Kort profil i en spalt med anfang, lång i två. |
| 19 | Tusch | GODKÄND | Årtalen i #8A8A8A, läsbara. |
| 20 | Horisont | GODKÄND | Axeln ren i LANGT_CV (bara årtal, två rader) och i NORMALT_CV (etiketter kortade, kollisionsrad). Mallen står kvar. |

Ingen mall stryks. Tre mallar är RÄTTAS på riktigt (Kalksten, Granit, Ritning), en har ett litet fel (Björk), och två generella rättelser (R6, R8) gäller de långa CV:na i kärnmallarna.

## 2. Typsnitten i PDF:en

Bedömning av de inbäddade typsnitten mot Word-sidorna (riktiga Word-typsnitt) i de 36 paren:

- Carlito som Calibri (Linne, Koppar, Kalksten, Årsring, Stål): metrisk tvilling, radbrytningarna är identiska i alla par jag jämfört rad för rad. Godkänt.
- Arimo som Arial (Björk, Fasad, Granit): identiska radbrytningar. Godkänt.
- Tinos som Times New Roman (Antikva): identiska. Godkänt.
- Gelasio som Georgia (Linne och Kalksten rubriker, Tidning): rubrikerna ser likadana ut, Tidning är bara PDF. Godkänt.
- EB Garamond som Garamond (Kolumn, Folio): inte metrisk. EB Garamond är något bredare och mörkare än Monotype Garamond, så profilen i Kolumn blir fem rader i PDF mot fyra i Word (`S\word-qa\kolumn-normalt-jamforelse.png`) och Folio får enstaka rader till. Sidbrytningarna är ändå desamma i kort och normalt. Godkänt, med noteringen att EB Garamond är den bättre läsbara av de två.
- DejaVu Sans som Verdana (Raster): DejaVu är lite smalare än Verdana, inte bredare, och ser i Raster ut som ett släktskap, inte som ett byte. Banden, kompetensspalterna och kontrasten är desamma. Godkänt. Verdana finns inte som fri tvilling, så det här är den enda kärnmallen där rader kan brytas olika; R8:s grind mäter det.
- Lato, Open Sans, Roboto, Poppins (de konstnärliga): sig själva, som i första granskningen.

Miniatyrerna är omgjorda med samma typsnitt; `S\ad2\miniatyrer-stor.png` visar att Kalksten och Granit ärvt spaltfelet (R1), de andra är rätt.

## 3. A:s avvikelser, avgöranden

**Word-panelen slutar ca 10 mm före nederkanten.** Mätt: Kalksten Word 275,5 mm (normalt) och 272,6 mm (kort) från överkanten, Chrome 282,2 och 280,4 mm, alltså Word 7 till 10 mm högre. Chrome slutar vid bottenmarginalen (15 mm), vilket är rätt. Det är inte "likadant" men orsaken är känd (R3) och enkel. Rättas tillsammans med R1 och R2.

**Kalksten normalt: en sida i Word mot två i Chrome.** Det är inte en skillnad mellan formaten utan spaltfelet: Chromes huvudspalt är 90 mm bred i stället för 137 och texten spiller. Med rätt spaltbredd ger NORMALT_CV en sida i Chrome också (`S\ad2\pdf\kalksten-normalt-col-s1.png`, identisk med Word-sidan). Duger alltså, när R1 är gjord.

**"En sida" steg 4 tar mer luft än föreslaget.** Steg 4 är sista utvägen och används bara när steg 1 till 3 inte räckt. Jag godkänner steg 4 som det är byggt, med ett golv: brödtexten får aldrig gå under 8,5 pt och radavståndet aldrig under 1,15 (`matt` i farg.ts har golvet 6 pt, det är för lågt). Mallarna med 9,5 pt brödtext (Horisont, Kvadrat, Mörkrum, Raster, Ritning, Tusch) når 8,5 pt redan i steg 2 och ska inte gå lägre. Se UX-designerns bedömning i avsnitt 6 för vilka `-ensida` som är täta.

**Långa poster i smala spalter får brytas mellan punkterna.** Godkänt. Regeln (titeln och två punkter ihop, de två sista ihop, bara över fem punkter) är rätt avvägd; en hel post på halva sidan i en 60-procentsspalt ger värre hål. I underlaget slog den inte till någonstans, så den är orörd i praktiken.

## 4. Per mall, fynd med fil

### Kalksten och Granit: spaltbredden (R1)
`S\word-qa\kalksten-normalt-jamforelse.png`, `kalksten-kort`, `kalksten-langt`, `granit-normalt`, `granit-kort`, `granit-langt`, samt alla `S\sidbrytning\kalksten-*` och `granit-*`: panelen är 105,2 mm bred i Chrome (uppmätt) mot 57,9 mm i Word. Huvudspalten blir 90 mm och allt bryts tidigare: Kalksten normalt två sidor, Granit normalt tre sidor i Chrome mot två i Word. Orsak: G1 gjorde huvudet till tabellens första rad (`<tr class="huvudrad"><td colspan="2">`, html.ts rad 605) i en tabell med `table-layout: fixed` (rad 501). Med fast tabellayout tas kolumnbredderna från första raden, och en cell med colspan ger ingen bredd, så Chrome delar lika. `width: 58mm` på `.spalt-sido` i andra raden ignoreras. Bevis: `S\ad2\pdf\kalksten-normalt-col-s1.png` och `granit-normalt-col-s1.png` är renderade från samma HTML med `<colgroup><col style="width:58mm"><col></colgroup>` insatt direkt efter `<table class="spalter" ...>`: spalten 58,2 mm, panelen till 280,4 mm, Kalksten normalt en sida (som Word), Granit normalt en sida, Granit långt tre sidor med panelen till 282 mm på sida 2 och så långt raden går på sida 3 (48,7 mm), vilket är regeln vi satte i G1.

### Granit: tom sida 1 i Word (R2)
`S\word-qa\granit-normalt-jamforelse.png` höger och `granit-langt-jamforelse.png` höger: sida 1 innehåller bara bandet (färg till 54,0 mm, sedan vitt), hela innehållet börjar på sida 2 med panelen. `granit-kort` är rätt. Orsak: spaltradens minsta höjd (bygg.ts rad 927) räknas på `huvudHojdMm`, som för ett band tar `max(minHojd, luft.topp + text + luft.botten)` = 42 mm, men bandet är 54 mm när fotot (30 mm plus 15 + 9 mm luft) bestämmer höjden. Raden blir då 12 mm för hög för att få plats under bandet och Word flyttar hela raden till nästa sida. I kort CV räddas det av att innehållet är kort.

### Granit och Ritning: mittpunkterna syns inte (R4)
`S\ad2\granit-spalt.png` (urklipp ur Chrome-sidan): "Scrum  Kanban  SAFe" utan synlig punkt, för `.prick` har färgen `dampad` (#666666) på panelen #2B2F36. `S\ad2\ritning-spalt.png`: punkterna svagt synliga på blått. I Word syns de (vit text). Kvadrat och Kalksten (ljus panel) är rätt.

### Björk (R7)
`S\word-qa\bjork-normalt-jamforelse.png`: Chrome sida 1 slutar efter Utbildning vid 72 procent av sidan (75 mm ledigt), Tekniska kompetenser (två grupper, 35 mm) står på sida 2; Word har den på sida 1 och sida 2 börjar med Certifieringar. Blocket ryms. Troligen kedjan av `break-inside: avoid` på `.avsnitt.hall` följt av `.slutgrupp` (Certifieringar, Språk, Referenser) med `break-before: avoid` på Språk och Referenser inuti; Chrome backar då till närmaste tillåtna brytpunkt före hela kedjan. Byggagenten hittar den exakta orsaken; grinden i R7 avgör.

### Ritning (R5)
`S\sidbrytning\ritning-langt-s1.png` till `s3`, mätt vid x = 7 mm: blått från 17,9 till 278,8 mm på varje sida, aldrig från 0 till 297. `S\ad2\ritning-topp-idag.png` visar överkanten. Orsaken är inte A:s CSS: Chromium målar aldrig rotbakgrunden eller ett `position: fixed`-element i @page-marginalen, och Ritning har `@page{margin:18mm 0}`. Jag provade fyra varianter (`.cv::before` fixed 0 till 297 mm, fixed från -20 mm till 340 mm, `html{height:100%}` och A:s gradient): alla slutar vid 278,8 eller 279,1 mm. Det som fungerar (`S\ad2\pdf\ritning-langt-grad-s1.png` till `s3`, `ritning-kort-grad-s1.png`, `ritning-normalt-grad-s1.png`, montage `S\ad2\ritning-grad-trio.png`): sidmarginalen 0 och topp- och bottenmarginalen som repeterande `<thead>`- och `<tfoot>`-rader i spalttabellen (Chromium upprepar dem på varje sida). Mätt: blått 0,0 till 296,7 mm på alla sidor utan avbrott, också sista sidan och kort CV; texten börjar 18 mm ner på varje sida.

### Siluett
`S\ad2\pdf\siluett-kort-foto-s1.png`: KORT_CV med foto (36 mm) på en sida med 25 mm över. Sidbrytningsskriptet ger KORT_CV inget foto (`langd !== 'kort'`), så grinden från första granskningen testades inte där; den är nu verifierad. Lägg fotot på också i kort i `scripts/mallar-sidbrytning.ts` så att grinden står kvar.

### Horisont
`S\sidbrytning\horisont-langt-s1.png`: tio punkter, bara årtal, två rader, 2011 står en gång per rad och inget överlappar. `horisont-normalt-s1.png`: fyra punkter med etiketter, "Kungliga Tekniska..." kortad, "2018 Klarna" på rad två. Rent. Mallen står kvar.

### Koppar, Kolumn, Årsring, Stål, Raster, Antikva, Folio, Linne, Fasad
Koppar: bandet 56 mm i båda (`koppar-normalt`), 50 mm i kort, namnet på 14 mm. Kolumn: `kolumn-normalt`, första postens titel i höjd med Arbetslivserfarenhet i Word. Årsring: `arsring-normalt`, linjen obruten genom Arbetslivserfarenhet i Chrome, perioden i nivå med titeln i Word. Stål: `stal-normalt`, en sida i båda, runda punkter, mittpunkt i högerspalten. Raster: `raster-normalt`, banden och kompetensspalterna lika, samma sidbrytning. Antikva, Folio, Linne, Fasad: lika i kort och normalt. De långa CV:na: se R6 och R8.

## 5. Rättelser i byggbar form

**R1. Spaltbredden i PDF (Kalksten, Granit, och allt som har `huvudrad`).** I html.ts, sidospaltsgrenen (rad 605 till 607): sätt `<colgroup><col style="width:${s.bredd}mm"><col></colgroup>` direkt efter `<table class="spalter" ...>`, före `<tbody>`. Kolumnordningen är cellordningen (sido först) oavsett `direction`, så samma colgroup gäller vänster- och högerspalt. Behåll `table-layout: fixed`. Generera om miniatyrerna (`scripts/mallbilder.ts`). Grind: i `sidbrytning` är panelens bredd 58 mm ±1 i Kalksten och Granit (mät första vita pixeln vid 55 procent av sidhöjden, eller rendera `S\ad2\prova.ts` och jämför); Kalksten NORMALT_CV en sida i Chrome och Word; Granit NORMALT_CV en sida i Chrome; Kvadrat (66 mm) och Ritning (66 mm) oförändrade.

**R2. Granit i Word: bandets höjd i spaltradens minsta höjd.** bygg.ts `huvudHojdMm`: för band `max(minHojd, luft.topp + max(text, fotoMm om foto) + luft.botten) + luftUnder`, där fotoMm är `m.fotoMm` (30 mm i Granit, det värde `bild()` använder); bandet blir då 15 + 30 + 9 = 54 mm, vilket är det uppmätta. Grind: Granit NORMALT_CV och LANGT_CV i Word har text på sida 1 (word-mallar-granska fäller när sida 1 saknar brödtext), och Granit NORMALT_CV ger samma sidantal i Word som i Chrome.

**R3. Word-panelens nederkant lika med Chromes.** Samma rad (bygg.ts 927): minska påslaget `+ 10 + s.luft.topp + 4` tills panelen slutar vid bottenmarginalen. Mätt mål: Chrome 282,2 mm (normalt) och 280,4 mm (kort) i Kalksten, Word ligger på 275,5 och 272,6. Grind: panelens sista färgade rad i Word inom 3 mm från Chromes i Kalksten och Granit, kort och normalt, och R2:s grind håller samtidigt (ett för stort värde ger tom sida 1 igen).

**R4. Mittpunkten i mörk panel.** html.ts: `.spalt-sido .prick{color:inherit;opacity:.6}` (provat i `S\ad2\pdf\ritning-langt-grad-s1.png`: synlig, inte skrikig). Word är redan rätt (`r.text ?? dampad`). Grind: skärmdump av Granit och Ritning spalt.

**R5. Ritning: spalten från papperskant till papperskant.** Bara Ritning (PDF-mall, `def.word` falskt), i `extraCss` eller som en flagga på layouten (`spalt.helSida: true`) som renderaren tolkar:
1. `@page{margin:0}` för mallen och `.cv{padding-top:0;padding-bottom:0}` i utskrift (sidomarginalerna står kvar som padding).
2. I spalttabellen: `<thead><tr class="marg"><td></td><td></td></tr></thead>` och `<tfoot>` likadant, med `.marg td{height:18mm;padding:0}` (värdet är `sida.topp` respektive `sida.botten`). Chromium upprepar thead och tfoot överst och underst på varje sida, så texten får sina marginaler på alla sidor.
3. Behåll A:s `html{background:linear-gradient(...)}` i utskrift (den täcker nu hela arket eftersom marginalen är 0) och `.spalter{height:calc(297mm - 1.5mm)}` så att ett kort CV också får panel till nederkanten.
4. `<colgroup>` från R1 (66 mm).
Bevis: `S\ad2\prova3.ts` gör exakt detta i minnet; resultatet i `ritning-grad-trio.png`. Grind: i `sidbrytning` har Ritning blått från 0 till 297 mm (±0,5) vid x = 7 mm på varje sida i kort, normalt och långt, och huvudspaltens första textrad ligger 18 mm ±1 från överkanten på sida 2 och 3.

**R6. Kompetensblock hålls ihop upp till sex grupper, i båda formaten.** Fynd: `antikva-langt` (Ledarskap ensam på sida 3 i Chrome), `folio-langt` (Redovisning ensam på sida 2), `arsring-langt` (Ledarskap ensam på sida 3 i Word, Redovisning ensam på sida 2 i Chrome). G2:s gräns "färre än fyra grupper" är för snäv: fyra grupper om en till två rader är 25 mm. html.ts: `hall` när `grupper.length <= 6`. bygg.ts: `keepNext: true` på alla gruppstycken utom det sista när grupperna är högst sex (i dag `hallIhopRad`). Grind: i `antikva-langt`, `folio-langt`, `arsring-langt` står Kunskaper och verktyg helt på en sida i Chrome och Word.

**R7. Björk: Tekniska kompetenser stannar på sida 1.** Hitta vad som flyttar blocket (se avsnitt 4). Om det är kedjan av avoid: ta bort `break-before: avoid` på `.cv-kropp>.avsnitt-sprak` och `.avsnitt-referenser` när de ligger i `.slutgrupp` (gruppen är redan odelbar). Grind: `bjork-normalt` har samma avsnitt på samma sida i Chrome och Word.

**R8. Word är 4 till 7 procent kortare än Chrome i brödtext.** Mätt från Profil-rubriken till sista rubriken på sida 1: Björk 0,93, Koppar 0,94, Raster 0,94, Linne 0,96 (Word delat med Chrome). Följd: `koppar-langt` sida 2 och 3, `stal-langt` sida 2, `raster-langt` sida 1 och 2, `antikva-langt` sida 2 får olika avsnitt i de två formaten. `WORD_RADFAKTOR = 0.96` (bygg.ts rad 76) ligger på hela dokumentets radhöjd, men första granskningens fynd (G5) gällde bara listorna i spaltceller. Rättelse: faktorn 1,0 i `stilar` (dokumentet), kvar i `spaltInnehall` bara om mätningen kräver det, och i stället `contextualSpacing` och `after: 0,6 mm` på punkterna som G5 sade. Grind (ersätter G6): i `word-mallar-granska`, för alla 36 par, samma avsnitt på samma sida i Chrome och Word, och avståndet Profil till sista rubrik på sida 1 inom 3 procent. Den grinden är ägarens "likadant" i mätbar form.

**R9. Golv för "en sida".** farg.ts `matt`: `grad: (pt) => Math.max(8.5, pt + grad)` för brödtext (periodens och kontaktens grad får gå till 7,5), och `radavstand` aldrig under 1,15. Grind: alla 20 `-ensida` ger fortfarande en sida; de som inte gör det efter golvet får två sidor utan varning, som G7 säger.

**R10. Sidbrytningsskriptet ger foto också i KORT_CV** (`scripts/mallar-sidbrytning.ts` rad 62), så att Siluetts grind ligger i skriptet.

## 6. UX-designerns bedömning av läsbarheten

UX-designern (mobile-ux-designer) fick samma underlag och sex frågor: täthet i alla 20 `-ensida`, mittpunkt i 9 pt i sidospalterna, Raster med DejaVu Sans, radbrytningar PDF mot Word med de inbäddade typsnitten, långa poster brutna mellan punkter, och Kalksten en sida mot två. Hennes rapport hade inte kommit när den här granskningen lämnades; samordnaren tar in den när den kommer. Mina egna avgöranden i avsnitt 3 (steg 4 godkänt med golvet i R9) och avsnitt 2 (typsnitten) står oavsett; det hon kan ändra är listan över vilka `-ensida` som är för täta, och då justeras R9:s golv, inte stegen.

## 7. Beslut: vad som får levereras till ägaren

Levereras nu (16): Linne, Koppar, Kolumn, Årsring, Antikva, Fasad, Raster, Folio, Stål, Mörkrum, Terrakotta, Kvadrat, Siluett, Tidning, Tusch, Horisont. I kort och normalt CV är kärnmallarna bland dessa lika i Word och PDF; i långt CV skiljer sig sidbrytningen i Koppar, Stål, Raster, Antikva, Folio och Årsring (R6, R8), vilket rättas i samma omgång som nedan men inte hindrar leverans.

Hålls tillbaka tills rättade: Kalksten (R1, R3, R4), Granit (R1, R2, R3, R4), Ritning (R4, R5), Björk (R7). Efter R1 till R8 vill jag se de nya `jamforelse`-bilderna för Kalksten, Granit och Björk i alla tre längder samt Ritning i `sidbrytning`, inte hela omgången igen.

---

# Slutkontroll, 2026-11-16

Art-director, efter byggagent A:s R1 till R10 och UX-designerns U4 till U7 (ddadbada, bf29adbe på feat/mallar). Underlag: `S\word-qa\{kalksten,granit,bjork}-{kort,normalt,langt}-jamforelse.png` med sidorna var för sig, `S\sidbrytning\ritning-*-s*.png`, A:s `sidbrytning.json` (80 av 80) och `ats-resultat.json` (160 av 160). Egna mått och urklipp i `S\ad3\` (`matt.mts`, `skarv.mts`, `klipp*.mts`, `diff.mts`, körs från cvbrev-qa-b med `npx tsx`; mått i mm räknade ur pixlar på 595 x 841-sidorna). Ingen kod rörd.

## 1. De fyra som hölls tillbaka

| Mall | Beslut | Mätt |
|---|---|---|
| Kalksten | GODKÄND | Spalten 57,9 mm i Chrome och Word (R1). Panelen slutar 280,4 mm (Chrome) mot 279,3 mm (Word) i kort och normalt, 1,1 mm (R3, grind 3 mm). KORT_CV och NORMALT_CV en sida i båda formaten med samma avsnitt i samma ordning; spaltens mittpunktsrader bryts på samma ställen rad för rad (`S\ad3\zoom-kalksten-spalt-*.png`). LANGT_CV: sida 1 lika, sida 2 och 3 skiljer sig i panelens längd (Chrome fyller sida 2, Word slutar med innehållet vid 253 mm; sida 3 omvänt). Det är A:s avvikelse och Word-tabellens natur; jag godtar den, se avsnitt 3. |
| Granit | GODKÄND i kort och normalt | Spalten 58,3 mm i båda. Panelen från bandets underkant (54,0 mm med foto, 42,4 mm utan) till 280,4 mot 279,3 mm. Word har text på sida 1 i alla längder (R2 löst). Mittpunkterna syns på den mörka panelen i Chrome, som i Word (`S\ad3\zoom-granit-spalt-chrome.png` och `-word.png`, R4). KORT_CV och NORMALT_CV en sida i båda formaten med samma innehåll. LANGT_CV bedöms när A:s rättning av sida 2 och 3 är klar (Chrome delar Projekt över sida 2 och 3, Word håller ihop det på sida 3); grinden är R8:s, samma avsnitt på samma sida. |
| Björk | GODKÄND | Samma avsnitt på samma sida i kort, normalt och långt. I NORMALT_CV står Tekniska kompetenser överst på sida 2 i både Chrome och Word: blocket (rubrik plus två grupper, cirka 46 mm med avsnittsluften) ryms inte i de 46 mm som är kvar ovanför bottenmarginalen när det hålls ihop (R6), och R7:s grind var att formaten är lika, inte att blocket står på sida 1. Godtaget. Mittpunktsraderna börjar aldrig med punkten (G3). |
| Ritning | GODKÄND | Blått från 0,0 till 296,6 mm vid x = 7 mm på alla sidor i kort, normalt, långt och en sida, 0 avvikande rader i färgen (ingen skarv, `S\ad3\skarv.mts`). Spalten 66,4 mm. Huvudspaltens första textrad 18 mm från överkanten på sida 2 och 3 (`S\ad3\zoom-ritning-s2-topp.png`). Mittpunkterna syns på blått (`S\ad3\zoom-ritning-spalt.png`). "En sida" ger en sida, tät men läsbar. |

## 2. De 16 redan godkända

Kört själv på bf29adbe från cvbrev-qa-b: `npm run test:ats -- --ut S\ad3\ats` ger 160 av 160 gröna (alla 20 mallar, PDF och Word, kort, normalt, långt, intyg först, utbildning först). `scripts/mallar-sidbrytning.ts --png` för Linne, Koppar, Stål, Raster, Horisont, Mörkrum, Kvadrat och Siluett ger 32 av 32 gröna, och de 55 sidbilderna är identiska pixel för pixel med A:s i `S\sidbrytning\` (`S\ad3\diff.mts`, 0 avvikande pixlar i varje). Stål normalt på en sida med runda punkter och mittpunkt i högerspalten, Siluett kort med foto på en sida, Horisonts axel ren i långt CV: som vid andra granskningen. Inget har försämrats.

## 3. A:s avvikelser, avgöranden

- **Word-panelen på sida 2 och 3 i långt CV slutar med innehållet.** Godtaget. En Word-tabellrad kan inte skuggas längre än den går, och Chrome gör samma sak på sista sidan. Skillnaden syns bara i LANGT_CV i Kalksten och Granit på sidor efter den första, och sida 1 är lika i båda. Specens rad om sidbrytningar får lydelsen: panelen når nederkanten på sida 1 i båda formaten; på följande sidor går den så långt innehållet går i Word och så långt tabellraden går i Chrome.
- **Björks Tekniska kompetenser på sida 2 i båda.** Godtaget, se tabellen.
- **Rasters ton 82 procent.** Godtaget; accent 2 och 4 skiljer sig i `S\ad3\sb\raster-*`.
- **Golvet 9,0/8,0 pt räckte för alla "en sida".** Godtaget; alla 20 `-ensida` ger en sida i A:s `sidbrytning.json` och i mina åtta.

En reservation som inte ändrar besluten: Word-bilderna i `S\word-qa\` är stämplade 06:49 till 06:52 och bf29adbe är committad 07:00:55. Hunken "tvåspaltens luft" ligger i tvåspaltsgrenen (Stål), inte i sidospaltsgrenen, och hunken om långa poster slår bara in när en post med minst fyra punkter korsar en sidbrytning, så Kalksten, Granit och Björk i kort och normalt är opåverkade. A bekräftar i sin rapport att `word-mallar-granska` är körd på bf29adbe för Stål och de långa CV:na, annars körs den om innan leveransen.

## 4. Levereras till ägaren

Alla 20: Linne, Björk, Koppar, Kalksten, Granit, Kolumn, Årsring, Antikva, Fasad, Raster, Folio, Stål, Mörkrum, Terrakotta, Kvadrat, Siluett, Ritning, Tidning, Tusch, Horisont. Granit med förbehållet att LANGT_CV i Word ska ha samma avsnitt på samma sida som i Chrome när A:s pågående rättning är klar (R8:s grind), vilket A verifierar med `granit-langt-jamforelse.png`; ingen ny granskning behövs för det.
