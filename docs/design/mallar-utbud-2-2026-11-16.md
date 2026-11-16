# Mallutbud 2: 20 nya CV-mallar (21 till 40), spec för bygget

Art-director, 2026-11-16, kväll. Facit i bild: `docs/design/skiss-mallutbud-2-2026-11-16.html` (20 A4-ark 1:1 med ett nytt exempel-CV, Amanda Sjöberg, redovisningsekonom, påhittad). Skissen är granskad i Chrome på 1700 px och 390 px och mot kontaktarket över de befintliga 20 (`C:\Users\chris\OneDrive\Skrivbord\CV-mallar-granskning\kontaktark.png`). Utbud 1 står i `docs/design/mallar-utbud-2026-11-16.md`; dess avsnitt 2 (gemensamma regler) gäller oförändrat för alla mallar nedan.

Ägarens ord (2026-11-16): "20 st mallar till, många får gärna fungera både som word/pdf, flera får gärna ha stöd för foto, kör allt i ett svep, ta fram dem på samma sätt som tidigare."

## 0. Beslut

1. **20 nya mallar, alla Premium.** Totalt 40. Ingen ny gratismall: gratisbasen förblir Linne och Björk (2 av 40, 5 procent, inom saas-leads regel om högst 10 procent och högst 5). Skäl: första avläsningen av gratisvägen (målet 1,3 till 5 procent nedladdning) är 14 december och bytesregeln för gratismall gäller efter åtta veckor; en tredje gratismall nu skulle göra avläsningen omöjlig att tolka. Om Linne faller i avläsningen är **Lind** (21) första kandidaten att byta in (serif, utan foto, Word), eftersom gratisparet då fortfarande täcker "klassisk" och "med foto".
2. **14 i PDF och Word** (21 till 34), likadana i båda formaten, bara med Word-typsnitten Calibri, Arial, Verdana, Georgia, Garamond och Times New Roman. **6 bara PDF** (35 till 40) med tre nya fritt licensierade typsnitt.
3. **8 med fotoplats**, varav 5 i Word: Alm (rundad kvadrat), Sand (rund i panel), Loft (rund höger), Betong (kvadrat i ljust band), Ek (kvadrat i spalt); bara PDF: Panorama (stående), Kakel (kvadrat), Kant (rund ovanför namnet). Word-byggaren klarar bilder (ImageRun, förbeskuren png), men saknar i dag placeringen "överst i spalten" och formerna rundad kvadrat och stående; se avsnitt 4.
4. **Inga omfärgningar.** Varje ny mall skiljer sig från alla befintliga i minst två av: huvudets form, rubrikens form, avsnittens layout, periodens plats, fotots form eller plats, typsnittspar. Avsnitt 1 har en kolumn "Skiljer sig från" med den närmaste befintliga mallen och vad som skiljer.
5. **Nya namn efter stil**, inga yrken, inga krockar med de 20, de gamla aliasen i `src/lib/cv/mallar/alias.ts` eller de strukna namnen i utbud 1 avsnitt 5. Index är ett vanligt svenskt ord men inget kodbegrepp i mallsystemet (katalog, register och alias är det, därför inte de).
6. **Byggordning**: Word-mallarna i den ordning de står (21 till 34), sedan 35 till 40. Grinden är densamma som i utbud 1: ATS-kontrollen grön i PDF och Word, sidbrytningstestet, Word öppnat i riktig Word mot PDF-sidan, miniatyrer renderade ur definitionen, varje godkänd mall sparad i granskningsmappen med PDF, Word och bild.

## 1. Utbudet i en tabell

| Nr | Mall | Familj | Format | Foto | Stil i en rad | Merförsäljning | Skiljer sig från |
|---|---|---|---|---|---|---|---|
| 21 | Lind | Enspaltig klassisk | PDF + Word | Nej | Georgia-brödtext, små versala Calibri-rubriker utan linjer, linje ovanför namnet, perioden efter arbetsgivaren | Serif, utan linjer | Linne: serif i brödtexten (inte bara namnet), inga rubriklinjer, linjen ovanför, perioden inline |
| 22 | Alm | Enspaltig med karaktär | PDF + Word | Rundad kvadrat 30 mm, vänster | Delat huvud: foto och namn vänster, kontakten högerställd lista, 1,5 pt accentlinje under, rubriker understrukna bara under texten | Delat huvud, foto | Fasad: regular namn, kontakt som högerställd lista, understrukna rubriker, rundat foto |
| 23 | Valv | Serif formell | PDF + Word | Nej | Georgia, centrerat huvud med kort accentlinje, rubriker med hårlinje som fortsätter efter texten, kursiv period | Centrerad serif, linje efter rubrik | Antikva: Georgia, kort linje i stället för dubbel, vänsterställda rubriker med linje efter |
| 24 | Sand | Sidospalt | PDF + Word | Rund 34 mm, överst i panelen | Sandfärgad högerpanel med foto överst, versala accentrubriker utan linje, hårlinje mellan posterna | Ljus högerpanel, foto | Kalksten: panel höger, fotot i panelen, inga rubriklinjer, hårlinjer mellan poster; Granit: ljus panel utan band |
| 25 | Furu | Marginalperioder | PDF + Word | Nej | Arial, perioderna i en 30 mm högerkolumn, rubriker i accent med linje under över hela bredden | Årtalen till höger | Årsring: kolumnen till höger, ingen lodrät linje, perioden grå regular |
| 26 | Ramverk | Serif formell | PDF + Word | Nej | Garamond, 0,5 pt ram runt sidan 8 mm innanför kanten på varje sida, centrerat namn, spärrade versala rubriker | Ram runt sidan | Kolumn och Folio: ramen, centrerat huvud, inga linjer i texten |
| 27 | Index | Enspaltig med karaktär | PDF + Word | Nej | Numrerade avsnitt: Georgia-siffra i accent före versal rubrik, hårlinje under; Georgia-namn med linje under huvudet | Numrerade avsnitt | Linne: siffrorna, versala sans-rubriker, linjen under huvudet |
| 28 | Skylt | Färgat huvud | PDF + Word | Nej | Smal accentremsa överst med kontakten i vitt, stort namn på vitt, rubriker som fyllda accentband med vit text | Färgremsa och fyllda rubriker | Koppar: namnet på vitt, remsan 12 mm; Raster: fyllda band med vit text, inte tonade |
| 29 | Loft | Enspaltig klassisk | PDF + Word | Rund 32 mm, höger | 26 mm marginaler, namn 36 pt regular, runt foto höger, små grå versala rubriker utan linjer, perioden i accent | Luftig, stort namn, foto | Koppar: inget band; Siluett: vänsterställt, fotot höger, grå rubriker |
| 30 | Pergament | Serif formell | PDF + Word | Nej | Times New Roman, huvudet i dubbel ram, namnet i versaler, högerställda rubriker med hårlinje | Inramat huvud, serif | Antikva: ram runt hela huvudet, versalt namn, högerställda rubriker |
| 31 | Betong | Färgat huvud | PDF + Word | Kvadrat 34 mm, vänster i bandet | Verdana, ljusgrått band till kant med foto vänster och mörk text, rubriker med kort accentlinje ovanför | Grått band, foto vänster | Koppar och Granit: ljust band med mörk text, fotot vänster; Terrakotta: linjen ovanför |
| 32 | Not | Enspaltig kompakt | PDF + Word | Nej | Calibri 9,5 pt, 14 mm marginaler, namn och kontakt på samma rad, kompetenser i tre spalter | Kompakt, tre sidor på två | Linne: täthet, huvudet på en rad, tre spalter; Raster: inga band |
| 33 | Spår | Marginalperioder | PDF + Word | Nej | Prickad accentlinje längs erfarenhet och utbildning med fylld punkt på linjen vid varje post, perioden till höger | Prickad tidslinje | Årsring: prickad, perioden till höger, bara i två avsnitt; Horisont: lodrät, inte vågrät |
| 34 | Ek | Sidospalt | PDF + Word | Kvadrat 44 mm, överst i spalten | Arial, vänsterspalt utan bakgrund skild med lodrät accentlinje, stort foto överst i spalten | Spalt med linje, stort foto | Kalksten: ingen panelbakgrund, fotot i spalten; Kvadrat: Arial, ingen namnruta, accentlinje |
| 35 | Sockel | Konstnärlig | Bara PDF | Nej | Montserrat-namn, Lato, mörk sockel 26 mm nederst på varje sida med kontakt och språk i vitt | Mörk sockel nederst | Mörkrum: färgen nederst, inte överst; Ritning: vågrät, inte lodrät |
| 36 | Panorama | Konstnärlig | Bara PDF | Stående 44 x 58 mm, till kant i bandet | Tonat band 58 mm till kant, stående foto som går ut i vänsterkanten, Lora-namn, understrukna rubriker | Stående foto i bandet | Koppar: tonat band med mörk text, stående foto vänster, serif |
| 37 | Sigill | Konstnärlig | Bara PDF | Nej (monogram) | Lora, monogramring med initialerna vänster om namnet, hårlinje under huvudet, spärrade versala accentrubriker | Monogram, serif | Folio: monogram, vänsterställt huvud, versala rubriker |
| 38 | Kakel | Konstnärlig | Bara PDF | Kvadrat 32 mm, vänster i huvudet | IBM Plex Sans, profilen i tonad ruta, kompetenser, intyg och språk i tonade rutor i två spalter under erfarenheten | Tonade rutor | Raster: rutor runt avsnitt, inte band bakom rubriker; Terrakotta: vit sida |
| 39 | Kant | Konstnärlig | Bara PDF | Rund 36 mm, ovanför namnet, vänster | Open Sans, 10 mm accentremsa längs vänsterkanten på varje sida, fotot ovanför namnet, accentrubriker utan linjer | Färgkant, foto över namnet | Ritning: remsa utan text, vit kropp; Björk och Siluett: fotot vänsterställt |
| 40 | Affisch | Konstnärlig | Bara PDF | Nej | Montserrat 44 pt versalt namn på två rader, 3 pt accentlinje, rubrikerna i en 40 mm vänsterkolumn i spärrade versaler | Namnet som affisch | Fasad: namnet 44 pt på två rader utan stapel; Kolumn: sans, inga linjer över avsnitten |

Räkning: Word 14 (21 till 34), foto 8 (22, 24, 29, 31, 34, 36, 38, 39), serif 5 (Lind, Valv, Ramverk, Pergament, Sigill) plus Georgia i Index namn, sidospalt 2 (Sand, Ek), marginal 2 (Furu, Spår), färg till kant 5 (Skylt, Betong, Sockel, Panorama, Kant). Huvudformer som är nya: delat huvud (Alm, Not), remsa (Skylt), ljust band med foto vänster (Betong), inramat huvud (Pergament), linje ovanför namnet (Lind), monogram (Sigill), tonat band med stående foto (Panorama), foto ovanför namnet vänsterställt (Kant), namn på två rader (Affisch). Rubrikformer som är nya: understruken (Alm, Panorama), linje efter texten (Valv), högerställd (Pergament), numrerad (Index), fylld (Skylt), kort linje ovanför (Betong). Layouter som är nya: period i högermarginal (Furu), prickad tidslinje (Spår), spalt med linje utan bakgrund (Ek), rutor (Kakel), sockel (Sockel), sidram (Ramverk), sidoremsa (Kant).

## 2. Gemensamma regler, tillägg till utbud 1 avsnitt 2

Allt i utbud 1 avsnitt 2 gäller (rubriker ur rubrikmodellen, grader, Garamond i PDF, huvudet läses först, sidbrytningar, fyra accenter per mall, foto utan hål, få plats på en sida, Word-regler, testmatris). Tillägg:

**Accenter.** Alla hexvärden i avsnitt 3 är räknade med kontrast.mjs (WCAG 2): accent som text på vitt lägst 5,9:1 (lägst i utbudet: Kakel #556B2F 5,95), vit text på accent lägst 6,7:1 (Skylt 9,59, Sockel 14,42, Kant har ingen text på remsan), accent som text på Sands panel #F2EDE4 lägst 5,7:1 (alla fyra). Förvalet är nytt per mall och delas inte med någon befintlig mall; alternativen får vara gemensamma med utbudet (#1F3A5F, #1E5A3C, #7A1F2B, #2B2F36, #3A3A3A med flera), så att användaren känner igen färgvalet mellan mallar.

**Nya typsnitt, bara PDF.** Montserrat (500, 600, 700), Lora (400, 500, 600, 400 kursiv) och IBM Plex Sans (400, 500, 600, 400 kursiv), alla SIL Open Font License 1.1, som woff2 ur Fontsource, latin och latin-ext, i `public/fonts/cv` med rad i LICENSER.txt och i `TYPSNITT_FILER`. De läggs till i `TypsnittId` och syns i verktygsradens typsnittsval som alla andra; `WORD_TYPSNITT` ändras inte, så Word-filen faller tillbaka till mallens brödtext som i dag. Perf: tre typsnitt till i `public/fonts/cv` påverkar bara PDF-kedjan och förhandsvisningen av dessa mallar (fontFace tar bara med mallens egna).

**Foto, nya former och platser.** `rundad` (kvadrat med 3 mm radie; servern beskär till png med genomskinliga hörn på samma sätt som rund), `staende` (bredd x höjd 3:4, servern beskär med fit cover i höjdled), plats `sidospalt-topp` (överst i spalten, centrerad i Sand, vänsterställd i Ek), `band-vanster` (Betong, Panorama), `huvud-topp-vanster` (Kant). Utan foto: Alm, Loft, Kakel, Kant och Betong låter huvudtexten ta bredden eller flytta upp; Sand och Ek börjar spalten med Kontakt; Panorama börjar texten vid 20 mm och bandet behåller 48 mm. Fotoknappen syns bara i mallar med fotoplats, som i dag.

**Perioden.** Två nya platser: `efter-arbetsgivare` (Lind: "Arbetsgivare · 2018 – 2021" på raden under titeln, period i dämpad färg) och `marginal-hoger` (Furu: egen kolumn till höger, högerställd). Spår har perioden till höger som standard och pricken i en egen marginalkolumn.

**Sida 2 och framåt.** Lind, Alm, Valv, Index, Loft, Pergament, Not, Spår, Sigill, Affisch: vanliga sidmarginaler, inget huvud. Sand och Ek: panelen och linjen slutar med innehållet; sida 2 enspaltig i full bredd (som Kalksten). Skylt och Betong: remsan och bandet bara på sida 1 (Word: sidhuvudet bär marginalen från sida 2, som Koppar). Ramverk: ramen på varje sida (Word: sidkant; PDF: `position: fixed`). Sockel: sockeln på varje sida (`position: fixed`, bottenmarginal 44 mm på alla sidor). Kant: remsan på varje sida (`position: fixed`). Panorama: bandet bara på sida 1. Kakel: rutorna bryts inte (`break-inside: avoid`), ett rutnät som inte får plats flyttas helt.

**Miniatyrer.** Som utbud 1 krav 15: NORMALT_CV (Erik Lindberg), sida 1, foto på i mallar med fotoplats, förvald accent. Skissen använder Amanda Sjöberg bara för att utbudet ska kunna bedömas bredvid de befintliga utan att förväxlas; i produkten är exempel-CV:t detsamma i alla 40.

## 3. Spec per mall

Mått i mm och pt, färger i hex. Där inget annat sägs gäller utbud 1 avsnitt 3:s standarder: punkttecken "•", indrag 4,5 mm, 0,6 mm mellan punkter; post som "titel fet vänster, period höger på samma rad, arbetsgivare på raden under"; kompetenser "grupp"; certifieringar "rad"; språk "rad"; kontaktrad med " · ". Radavstånd per typsnitt enligt utbud 1 avsnitt 2. Komponentmönstret i `render/html.ts` anges per mall ("återanvänder").

### 21. Lind (Premium, PDF + Word, enspaltig klassisk)
- Typsnitt: Georgia brödtext 10,5 pt och namn; Calibri titel, kontakt och rubriker. Radavstånd 1,32, text #1F2328.
- Accenter: #3E5C3A lövgrön (förval), #1F3A5F, #7A1F2B, #3A3A3A. Roll: titel, rubriker.
- Marginaler: 20 / 20 / 18 / 20.
- Huvud: vänsterställt. 0,5 pt linje #1F2328 i full textbredd ovanför, 4 mm luft, namn Georgia 24 pt regular #111 radavstånd 1,1, titel Calibri 10,5 pt fet versaler spärrning 0,08 i accent 1,5 mm under, kontaktrad Calibri 9,5 pt #555 2 mm under. 6,5 mm under huvudet.
- Rubrik: Calibri 9,5 pt fet versaler spärrning 0,10 i accent, ingen linje, 6,5 mm ovanför avsnittet, 2 mm under.
- Post: titel Georgia fet 10,5, därunder "Arbetsgivare · Period" med arbetsgivare #333 och period 9,5 pt #555 (periodPlats efter-arbetsgivare). 3,8 mm mellan poster.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: huvud `vanster` med nytt `linjeOver`, enspalt, rubrik `ingen`. Word: styckekant upp på namnstycket; perioden som run i arbetsgivarstycket; allCaps på titel och rubriker.

### 22. Alm (Premium, PDF + Word, enspaltig med karaktär)
- Typsnitt: Calibri allt, 10,5 pt, radavstånd 1,32.
- Accenter: #1A5A80 blå (förval), #1E5A3C, #8A4B2A, #2B2F36. Roll: titel, huvudlinjen, understrykningen.
- Marginaler: 18 runt om.
- Huvud `delad`: rundad kvadrat 30 mm (radie 3 mm) vänster, 6 mm luft, namn Calibri 26 pt fet #111 radavstånd 1,1, titel 11,5 pt i accent 1 mm under; till höger kontakten som högerställd lista 9 pt #555 (fyra rader, 0,4 mm mellan), lodrätt centrerad mot namnblocket. 5 mm under huvudtexten en 1,5 pt linje i accent i full textbredd, 6 mm luft under.
- Rubrik: Calibri 11 pt fet #111, understrykning 1 pt i accent bara under texten, 1,2 mm under baslinjen (CSS `text-decoration` med `text-underline-offset`; Word: run `underline` single i accent). 6 mm ovanför, 2,5 mm under.
- Post standard. Kompetenser grupp, intyg rad, språk rad.
- Foto: rundad 30 mm, plats huvud-vänster. Utan foto börjar namnet vid vänstermarginalen, kontakten står kvar till höger.
- Återanvänder: huvudtabellen i Word (Kalksten/Fasad) med tre celler (36 mm, rest, 50 mm); linjen som styckekant upp på profilrubriken? Nej: som styckekant ner på ett tomt stycke 0 pt hög direkt efter tabellen, så att linjen hamnar 5 mm under huvudet oavsett fotots höjd.

### 23. Valv (Premium, PDF + Word, serif formell)
- Typsnitt: Georgia allt, 10,5 pt, radavstånd 1,32.
- Accenter: #5B2A4E plommon (förval), #1F3A5F, #1E5A3C, #3A3A3A. Roll: titel, korta linjen, rubriker.
- Marginaler: 20 / 22 / 18 / 22.
- Huvud: centrerat. Namn Georgia 28 pt regular #111, titel 11,5 pt kursiv i accent 1,5 mm under, kontaktrad 9,5 pt #555 2 mm under; 4 mm under kontakten en centrerad 18 mm lång 1 pt linje i accent (Word: tomt stycke med styckekant ner, indrag vänster och höger lika (textbredd minus 18 mm) delat på två). 7 mm under.
- Rubrik `linje-efter`: Georgia 12,5 pt regular i accent, vänsterställd, följd av 3 mm luft och en 0,5 pt hårlinje #C9C4CC som fyller raden till högermarginalen, 1 mm ovanför baslinjen. 6 mm ovanför, 2,5 under. Word: tabell per rubrik med två celler utan kanter (textcellen autobredd, linjecellen rest med cellkant ner 0,5 pt #C9C4CC och cellmarginal ner 1 mm), `cantSplit`, rubriken `keepNext` via tabellradens efterföljande stycke.
- Post: titel fet, period kursiv #555 till höger, arbetsgivare #333. 3,8 mm.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: huvud `centrerad` (Antikva) utan dubbellinje.

### 24. Sand (Premium, PDF + Word, sidospalt)
- Typsnitt: Calibri allt, 10,5 pt (9,5 i panelen), radavstånd 1,32.
- Accenter: #7A4A1F nöt (förval), #1F3A5F, #1E5A3C, #4A5561. Roll: titel, rubriker i båda spalterna.
- Marginaler: 15 runt om; huvudspalten 8 mm från panelen.
- Huvud i full bredd ovanför spalterna: vänsterställt, namn Calibri 28 pt regular #111, titel 11,5 pt i accent, ingen kontakt (står i panelen). 7 mm under huvudet börjar spalterna.
- Sidospalt: höger, 60 mm, bakgrund #F2EDE4, padding 7 mm upp, 15 mm höger (sidmarginalen inne i panelen), 6 mm vänster. Ordning: rund fotoplats 34 mm centrerad överst med 5 mm luft under, Kontakt (lista 8,5 pt), Kompetenser (lista med gruppnamn fet), Språk (lista: språk vänster fet, nivå höger), Intressen. Rubriker i panelen Calibri 9,5 pt fet versaler spärrning 0,05 i accent utan linje.
- Huvudspalt: Profil, Arbetslivserfarenhet, Utbildning, Certifieringar (rad), Projekt, Referenser. Rubrik Calibri 10,5 pt fet versaler spärrning 0,05 i accent, ingen linje, 5,5 mm ovanför, 2,5 under.
- Post: standard; 0,5 pt hårlinje #DAD4C8 under varje post utom den sista i avsnittet (linjeMellan), 3,5 mm luft på var sida av linjen.
- Foto: rund 34 mm, plats sidospalt-topp. Utan foto börjar panelen med Kontakt.
- Återanvänder: layout `sidospalt` (Kalksten speglad till höger, Granit utan band), `linjeMellan` i post. Word: panelcellen börjar med ett centrerat stycke med ImageRun (nytt i spaltcellen), hårlinje som styckekant ner på postens sista stycke.

### 25. Furu (Premium, PDF + Word, marginalperioder)
- Typsnitt: Arial allt, 10 pt, radavstånd 1,34.
- Accenter: #355E3B skogsgrön (förval), #1F3A5F, #8A4B2A, #2B2F36. Roll: titel, rubriker, rubriklinjen.
- Marginaler: 18 runt om.
- Huvud: vänsterställt. Namn Arial 28 pt fet #111, titel 11 pt i accent 1 mm under, kontaktrad 9 pt #555 2 mm under. 5 mm under.
- Rubrik: Arial 11 pt fet i accent, 0,75 pt linje under i accent över hela textbredden (inklusive periodkolumnen), 1 mm luft, 6 mm ovanför avsnittet, 3 mm under.
- Layout `marginalperiod` med `sida: 'hoger'`: innehållskolumn först, 4 mm luft, 30 mm periodkolumn till höger med perioden 9 pt #555 högerställd på titelns rad. Profil och kompetenser i full bredd (ingen tom kolumn). Certifieringar `marginal`: året i högerkolumnen, namn och utgivare till vänster. Språk rad i full bredd.
- Post: titel fet, arbetsgivare #444, punkter. 3,8 mm.
- Inget foto.
- Återanvänder: Årsrings tabell per avsnitt, speglad (innehållscell, 30 mm-cell högerställd), ingen lodrät linje.

### 26. Ramverk (Premium, PDF + Word, serif formell)
- Typsnitt: Garamond allt, 11 pt, radavstånd 1,30.
- Accenter: #4B3F72 dov lila (förval), #7A1F2B, #1E5A3C, #1F3A5F. Roll: ramen, rubriker.
- Ram: 0,5 pt linje i accent 8 mm innanför papperskanten på alla fyra sidor, på varje sida. PDF: `position: fixed; inset: 8mm; border` (utskrift upprepar den på alla sidor, samma teknik som Ritnings spalt). Word: `page.borders` på alla fyra sidor, 0,5 pt (size 4), `offsetFrom: page`, `space` 22,7 pt (8 mm), i accent.
- Marginaler: 20 / 22 / 18 / 22 (12 mm från ramen till texten).
- Huvud: centrerat. Namn Garamond 32 pt regular #111, titel 13 pt kursiv #555 1 mm under, kontaktrad 10 pt #555 2 mm under. 3 mm extra under huvudet, ingen linje.
- Rubrik: Garamond 11,5 pt regular versaler spärrning 0,12 i accent, vänsterställd, ingen linje, 6,5 mm ovanför, 2,5 under.
- Post: titel fet, period #555 höger, arbetsgivare kursiv #333. 3,5 mm.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: huvud `centrerad`, enspalt. Nytt: `sidram` i MallDef (pt, färg, avstånd).

### 27. Index (Premium, PDF + Word, enspaltig med karaktär)
- Typsnitt: Calibri brödtext och rubriktext 10,5 pt; Georgia namn och siffror. Radavstånd 1,32.
- Accenter: #0B525B djup teal (förval), #1F3A5F, #7A1F2B, #3A3A3A. Roll: titel, siffrorna.
- Marginaler: 20 / 20 / 18 / 20.
- Huvud: vänsterställt. Namn Georgia 28 pt regular #111, titel Calibri 12 pt i accent 1 mm under, kontaktrad 9,5 pt #555 2 mm under; 4 mm under kontakten en 0,5 pt linje #1F2328 i full textbredd. 6,5 mm under.
- Rubrik `numrerad`: siffran (01, 02 ... i den slutliga avsnittsordningen, två siffror) Georgia 18 pt regular i accent radavstånd 1, 3 mm luft, rubriktexten Calibri 10,5 pt fet versaler spärrning 0,06 #111, baslinjejusterade; 0,5 pt linje #D5D9DE under i full bredd 1,5 mm under; 6,5 mm ovanför avsnittet, 3 mm under. Numreringen följer sektionsordningens val.
- Post standard. Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: rubrik `linje-under`; nytt fält `nummer: true` i MallRubrik (siffrans typsnitt, grad, färg). Word: två runs i samma stycke (Georgia 18 pt + Calibri 10,5 pt), styckekant ner.

### 28. Skylt (Premium, PDF + Word, färgat huvud)
- Typsnitt: Arial allt, 10 pt, radavstånd 1,34.
- Accenter: #2F4858 skiffer (förval), #7A1F2B, #1F3A5F, #1E5A3C. Roll: remsan, titeln, rubrikbanden. Vit text på accent (lägst 9,59:1).
- Marginaler: remsan till kant (0 upp, 0 sidor); kroppen 20 mm sidor, 18 mm ner.
- Remsa: 12 mm hög i accent, full bredd, kontaktraden Arial 9 pt vit lodrätt centrerad, 20 mm sidopadding. Word: tabell i full sidbredd med cellbakgrund (Koppars teknik, negativt indrag), radhöjd exakt 12 mm, sidhuvudet bär marginalen från sida 2.
- Huvud: 10 mm under remsan, vänsterställt: namn Arial 30 pt fet #111 radavstånd 1,05, titel 11,5 pt fet versaler spärrning 0,04 i accent 2 mm under. 7 mm under.
- Rubrik `band` fylld: bakgrund accent, text Arial 10 pt fet versaler spärrning 0,06 vit, padding 1,2 mm upp och ner, 3 mm sidor, full textbredd; 6 mm ovanför, 3 mm under. Word: styckebakgrund (Rasters teknik) med vita runs.
- Post standard, period 9 pt. Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: huvud `band` (ny variant `remsa` med bara kontakt), rubrik `band` med `text: 'vit'`.

### 29. Loft (Premium, PDF + Word, enspaltig klassisk)
- Typsnitt: Calibri allt, 11 pt, radavstånd 1,34.
- Accenter: #704214 sepia (förval), #1F3A5F, #3A3A3A, #1E5A3C. Roll: titel, perioden.
- Marginaler: 26 / 26 / 22 / 26.
- Huvud: vänsterställt med fotot till höger, toppjusterat. Namn Calibri 36 pt regular #111 radavstånd 1,05 spärrning minus 0,01, titel 12 pt i accent 2 mm under, kontaktrad 9,5 pt #555 2,5 mm under. Rund fotoplats 32 mm, 8 mm från texten. 10 mm under huvudet.
- Rubrik: Calibri 9,5 pt fet versaler spärrning 0,14 #777, ingen linje, 9 mm ovanför avsnittet, 3 mm under.
- Post: titel fet 11 pt, period 9,5 pt i accent höger, arbetsgivare #444. 5 mm mellan poster.
- Kompetenser grupp, intyg rad, språk rad.
- Foto: rund 32 mm, plats huvud-hoger. Utan foto tar texten hela bredden.
- Återanvänder: Fasads huvudtabell (text, fotocell) utan stapel; rubrik `ingen`.

### 30. Pergament (Premium, PDF + Word, serif formell)
- Typsnitt: Times New Roman allt, 11 pt, radavstånd 1,30.
- Accenter: #6B5B2E ockra (förval), #1F3A5F, #3A3A3A, #5B2A4E. Roll: ramen kring huvudet, titeln.
- Marginaler: 20 / 22 / 18 / 22.
- Huvud `inramat`: dubbel linje 0,75 pt i accent (2 pt glipa) runt hela huvudet, padding 5 mm upp och ner, 6 mm sidor; innehåll centrerat: namn Times 26 pt regular versaler spärrning 0,08 #111, titel 11 pt kursiv i accent 1,5 mm under, kontaktrad 10 pt #444 2 mm under. 7 mm under ramen. Word: styckekanter `double` på alla fyra sidor på huvudets tre stycken med samma inställningar, så att Word ritar en gemensam ram; indrag 6 mm.
- Rubrik: högerställd, Times 11,5 pt fet #111, 0,5 pt linje under #999 i full bredd, 0,8 mm luft; 6 mm ovanför, 2,5 under.
- Post: titel fet, period #444 höger, arbetsgivare kursiv #333. 3,5 mm.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: Antikvas dubbellinje som ram; nytt `justering: 'hoger'` i MallRubrik.

### 31. Betong (Premium, PDF + Word, färgat huvud)
- Typsnitt: Verdana allt, 9,5 pt, radavstånd 1,36.
- Accenter: #4A5561 skiffergrå (förval), #1F3A5F, #556B2F, #8A4B2A. Roll: titel, de korta linjerna. Bandet är alltid #E6E6E3 (inte accent); mörk text på bandet.
- Marginaler: bandet till kant; kroppen 8 mm under bandet, 20 mm sidor, 18 mm ner.
- Huvud `band` ljust: bakgrund #E6E6E3, minst 52 mm, padding 14 mm upp, 20 mm sidor, 12 mm ner. Kvadratisk fotoplats 34 mm till vänster, lodrätt centrerad, 8 mm luft; namn Verdana 24 pt fet #111 radavstånd 1,1, titel 11 pt i accent 1,5 mm under, kontaktrad 8,5 pt #555 2,5 mm under. Utan foto börjar texten vid 20 mm; bandet behåller höjden.
- Rubrik: Verdana 10 pt fet versaler #222 med en 12 mm lång 1,5 pt linje i accent ovanför (2 mm luft), 6 mm ovanför avsnittet, 2,5 under. Word: ett tomt stycke 1 pt högt med styckekant upp 1,5 pt i accent och högerindrag lika textbredd minus 12 mm, följt av rubrikstycket (`keepNext` på båda).
- Post standard, period 8,5 pt. Kompetenser grupp, intyg rad, språk rad.
- Foto: kvadrat 34 mm, plats band-vanster.
- Återanvänder: Koppars bandtabell med cellerna i omvänd ordning (foto, text) och ljus fyllning; rubrik `kort-linje` med `var: 'over'`.

### 32. Not (Premium, PDF + Word, enspaltig kompakt)
- Typsnitt: Calibri allt, 9,5 pt, radavstånd 1,28.
- Accenter: #1A4D6E (förval), #1E5A3C, #7A1F2B, #2B2F36. Roll: titel, rubriker.
- Marginaler: 14 / 16 / 14 / 16.
- Huvud `delad` utan foto: namn Calibri 20 pt fet #111 och titel 10,5 pt i accent till vänster; kontakten till höger som högerställd lista i två kolumner (e-post, telefon på rad 1; ort, LinkedIn på rad 2) 9 pt #555, bottenjusterad mot titeln. 3 mm under: 0,5 pt linje #1F2328 i full bredd. 5 mm under linjen.
- Rubrik: Calibri 9 pt fet versaler spärrning 0,06 i accent, 0,5 pt linje under #D5D9DE, 0,8 mm luft, 4,5 mm ovanför avsnittet, 2 mm under.
- Post: titel fet 9,5, period 8,5 pt #555 höger, arbetsgivare #444; 2,5 mm mellan poster; 0,4 mm mellan punkter.
- Kompetenser `spalter` med `antal: 3` (5 mm mellanrum; två grupper fyller två spalter, tre eller fler fyller tre och radas). Intyg rad, språk rad.
- Ordning: Profil, Arbetslivserfarenhet, Kompetenser, Utbildning, Certifieringar, Språk (mallens förval; sektionsordningens val skriver över).
- Inget foto. Få plats på en sida: marginal minus 2 mm (inte 4), grad minus 0,5.
- Återanvänder: Rasters `kompetensSpalter` med tre celler; huvudet som tabell med två celler (rest, 70 mm).

### 33. Spår (Premium, PDF + Word, marginalperioder)
- Typsnitt: Calibri allt, 10,5 pt, radavstånd 1,32.
- Accenter: #1B6478 petrol (förval), #1F3A5F, #3A3A3A, #1E5A3C. Roll: titel, rubriker, linjen och punkterna.
- Marginaler: 20 / 20 / 18 / 20.
- Huvud: vänsterställt. Namn Calibri 28 pt fet #111, titel 12 pt i accent 1 mm under, kontaktrad 9,5 pt #555 2 mm under. 6 mm under.
- Layout `marginalprick`: alla avsnitt indragna 14 mm (9 mm marginalkolumn plus 5 mm). I Arbetslivserfarenhet och Utbildning (avsnitt med poster) löper en 1 pt prickad linje i accent lodrätt vid 9 mm från rubrikens underkant till sista postens slut; vid varje post en fylld 2,6 mm cirkel i accent centrerad på linjen, i höjd med titelns x-höjd (1,6 mm under titelradens överkant). Profil, kompetenser, certifieringar och språk har samma indrag utan linje.
- Rubrik: Calibri 11 pt fet versaler i accent, indragen till innehållskolumnen, ingen linje, 6 mm ovanför, 2,5 under.
- Post: standard (titel fet, period höger, arbetsgivare #444). 4 mm.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: Årsrings tabell per avsnitt (9 mm-cell, innehållscell) där innehållscellen har vänsterkant `dotted` 1 pt i accent och 5 mm vänster cellmarginal; punkten som ett "●"-tecken 9 pt i accent högerställt i marginalcellen med negativt högerindrag 1,3 mm så att det hamnar på linjen (Opus kalibrerar en gång mot PDF:en). Rader med `cantSplit`.

### 34. Ek (Premium, PDF + Word, sidospalt)
- Typsnitt: Arial allt, 10 pt (9,5 i spalten), radavstånd 1,34.
- Accenter: #2E5A4A granskog (förval), #1F3A5F, #7A1F2B, #2B2F36. Roll: titel, rubriker, den lodräta linjen.
- Marginaler: 16 runt om; huvudspalten 8 mm från linjen.
- Huvud i full bredd ovanför spalterna: namn Arial 26 pt fet #111, titel 11 pt i accent, ingen kontakt. 7 mm under.
- Sidospalt: vänster, 56 mm från papperskanten (sidmarginalen inne i spalten), ingen bakgrund, 0,75 pt linje i accent längs högerkanten från spaltens början till sidans bottenmarginal på sida 1, 6 mm inre padding. Ordning: kvadratisk fotoplats 44 mm vänsterställd överst, 5 mm luft, Kontakt (8,5 pt), Kompetenser (lista), Språk (lista), Intressen. Rubriker i spalten Arial 10 pt fet i accent, ingen linje.
- Huvudspalt: Profil, Arbetslivserfarenhet, Utbildning, Certifieringar (rad), Projekt, Referenser. Rubrik Arial 11 pt fet i accent, ingen linje, 5,5 mm ovanför, 2,5 under.
- Post standard, period 9 pt. 3,8 mm.
- Foto: kvadrat 44 mm, plats sidospalt-topp. Utan foto börjar spalten med Kontakt.
- Återanvänder: layout `sidospalt` (Kalksten) utan bakgrund, med ny `linje` på spaltens innerkant (cellkant höger i Word; radens minsta höjd gör att linjen når bottenmarginalen som panelen gör i Kalksten). ImageRun överst i spaltcellen (samma tillägg som Sand).

### 35. Sockel (Premium, bara PDF, konstnärlig)
- Typsnitt: Montserrat 600 namn och rubriker (nytt), Lato 10 pt brödtext, radavstånd 1,40, text #222.
- Accenter: #1C2B3A blåsvart (förval), #123B6D, #1E5A3C, #5B2A4E. Roll: sockeln, titeln, rubriker. Vit text på sockeln (lägst 9,6:1).
- Marginaler: 22 / 20 / 44 / 20 på alla sidor (bottenmarginalen rymmer sockeln).
- Huvud: vänsterställt. Namn Montserrat 600 32 pt #111 spärrning minus 0,01 radavstånd 1,05, titel Lato 12 pt i accent 2 mm under, ingen kontakt i huvudet. 8 mm under.
- Sockel: 26 mm hög i accent, full bredd till kant, nederst på varje sida (`position: fixed; bottom: 0`), padding 5 mm upp och ner, 20 mm sidor; tre kolumner (två för Kontakt, en för Språk) 8 mm mellanrum: rubriker Montserrat 600 8 pt versaler spärrning 0,10 vita med 0,5 pt linje vit 40 procent under; Kontakt som lista i två kolumner 9 pt vit; Språk som lista (språk fet, nivå) 9 pt vit. Kontakt och språk står sist i DOM:en (efter kropparna) och renderas en gång; ATS läser dem som sista avsnitt, vilket CV-läsaren klarar (kontaktfälten känns igen var de än står; testa i grinden).
- Rubrik: Montserrat 600 9,5 pt versaler spärrning 0,10 i accent, 0,75 pt linje under #D5D9DE, 1 mm luft; 6 mm ovanför, 3 under.
- Post standard, period 9 pt #555. Kompetenser grupp, intyg rad. Språk står i sockeln (sektionsordningens val flyttar inte den). Inget foto.
- Återanvänder: Ritnings `position: fixed`-teknik; nytt `sockel` i MallDef (höjd, padding, vilka avsnitt).

### 36. Panorama (Premium, bara PDF, konstnärlig)
- Typsnitt: Lora 500 namn, Lora 600 rubriker, Lora kursiv titel (nytt); Open Sans 9,5 pt brödtext, radavstånd 1,40, text #222.
- Accenter: #8C2F39 vinbär (förval), #1F3A5F, #1E5A3C, #4B3F72. Roll: titel, understrykningen, arbetsgivaren; bandet i mallens ton (accent 14 procent mot vitt, text #111 på tonen lägst 14,7:1).
- Marginaler: bandet till kant; kroppen 8 mm under bandet, 20 mm sidor, 18 mm ner.
- Huvud `band` tonat: höjd 58 mm, bakgrund ton. Stående fotoplats 44 x 58 mm som fyller bandets höjd, flush mot vänster papperskant (går till kant upp, vänster och ner i bandet), 10 mm luft; namn Lora 500 32 pt #111 radavstånd 1,08, titel Lora 13 pt kursiv i accent 1,5 mm under, kontaktrad Open Sans 9 pt #555 2,5 mm under, lodrätt centrerat. Utan foto börjar texten vid 20 mm och bandet är 48 mm.
- Rubrik: Lora 600 11,5 pt #111, understrykning 1 pt i accent bara under texten, 1,2 mm under baslinjen; 6 mm ovanför, 3 under.
- Post: titel 600, period 9 pt #555 höger, arbetsgivare i accent. 3,8 mm.
- Kompetenser grupp, intyg rad, språk rad.
- Foto: `staende` 44 x 58, plats band-vanster, servern beskär 3:4 med fit cover.
- Återanvänder: huvud `band` med `bakgrund: 'ton'` och foto vänster (samma tillägg som Betong).

### 37. Sigill (Premium, bara PDF, konstnärlig)
- Typsnitt: Lora allt (400, 500, 600, kursiv), 10,5 pt, radavstånd 1,36, text #222.
- Accenter: #8A2F4A hallon (förval), #1F3A5F, #1E5A3C, #3A3A3A. Roll: monogrammet, titeln, rubriker.
- Marginaler: 20 / 22 / 18 / 22.
- Huvud: monogramring 18 mm (0,75 pt linje i accent, cirkel) till vänster, lodrätt centrerad, med initialerna (första bokstaven i första och sista ordet i namnet, versaler) Lora 600 11 pt spärrning 0,08 i accent centrerade; 6 mm luft; namn Lora 500 28 pt #111, titel 11,5 pt kursiv i accent 1 mm under, kontaktrad 9,5 pt #555 2 mm under. 4 mm under huvudet en 0,5 pt linje #D8D3CC i full bredd, 7 mm luft under. Monogrammet står efter h1 i DOM:en (flyttas med `order`) och är `aria-hidden`; namn med ett ord ger en bokstav.
- Rubrik: Lora 600 10 pt versaler spärrning 0,12 i accent, 0,5 pt linje under #D8D3CC i full bredd, 1 mm luft; 6 mm ovanför, 2,5 under.
- Post: titel 600, period kursiv #555 höger, arbetsgivare #333. 3,8 mm.
- Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: huvud `vanster` med nytt `monogram` (mm, linje, grad).

### 38. Kakel (Premium, bara PDF, konstnärlig)
- Typsnitt: IBM Plex Sans allt (400, 500, 600, kursiv; nytt), 9,5 pt, radavstånd 1,40, text #222.
- Accenter: #556B2F oliv (förval), #1F3A5F, #7A1F2B, #2B2F36. Roll: titel, rubriker; rutorna i tonen (accent 14 procent mot vitt).
- Marginaler: 16 runt om.
- Huvud: kvadratisk fotoplats 32 mm vänster, lodrätt centrerad, 7 mm luft; namn Plex 600 26 pt #111, titel 11 pt i accent 1 mm under, kontaktrad 9 pt #555 2 mm under. 6 mm under.
- Rutor: Profil i en ruta i full bredd (bakgrund ton, padding 5 mm, inga hörnradier). Arbetslivserfarenhet och Utbildning (och Projekt, Referenser) som vanliga avsnitt. Därefter ett rutnät i två spalter med 5 mm mellanrum: Kompetenser (lista med gruppnamn) i vänster ruta; Certifieringar (lista) och Språk (lista) i var sin ruta staplade i höger spalt med 5 mm mellan. Rutor bryts inte över sidor; rutnätet bryts mellan rutor.
- Rubrik: Plex 600 9,5 pt versaler spärrning 0,08 i accent, ingen linje, 5,5 mm ovanför, 2,5 under; samma i rutorna.
- Post: titel 600, period 8,5 pt #555 höger, arbetsgivare #555. 3,8 mm.
- Foto: kvadrat 32 mm, plats huvud-vanster. Utan foto börjar namnet vid marginalen.
- Återanvänder: Kalkstens huvudtabell (foto, text); nytt `rutor` i MallDef: vilka avsnitt som är rutor och vilka som står i rutnätet.

### 39. Kant (Premium, bara PDF, konstnärlig)
- Typsnitt: Open Sans allt (400, 600, 700), 9,5 pt, radavstånd 1,40, text #222.
- Accenter: #6B4A1F brun (förval), #1F3A5F, #5B2A4E, #2B2F36. Roll: remsan, titeln, rubriker.
- Remsa: 10 mm bred i accent längs vänster papperskant i hela sidans höjd på varje sida (`position: fixed`), ingen text.
- Marginaler: 18 / 20 / 18 / 24 (14 mm från remsan).
- Huvud: rund fotoplats 36 mm vänsterställd ovanför namnet, 5 mm luft; namn Open Sans 700 28 pt #111, titel 11,5 pt i accent 1 mm under, kontaktrad 9 pt #555 2 mm under. 7 mm under. Utan foto börjar namnet vid toppmarginalen.
- Rubrik: Open Sans 700 10,5 pt i accent, ingen linje, 6 mm ovanför, 2,5 under.
- Post standard, period 9 pt. Kompetenser grupp, intyg rad, språk rad.
- Foto: rund 36 mm, plats huvud-topp-vanster.
- Återanvänder: Björks `huvud-topp` med vänsterställning; Ritnings fasta bakgrund som `sidoremsa` (mm, färg).

### 40. Affisch (Premium, bara PDF, konstnärlig)
- Typsnitt: Montserrat 700 namn, Montserrat 600 rubriker (nytt); Lato 9,5 pt brödtext, radavstånd 1,40, text #222.
- Accenter: #6E2C00 mörk rost (förval), #1F3A5F, #1E5A3C, #2B2F36. Roll: titel, linjen under huvudet, rubriker.
- Marginaler: 18 / 20 / 18 / 20.
- Huvud: namnet Montserrat 700 44 pt versaler spärrning minus 0,02 radavstånd 0,95 #111 på två rader (brytning på sista mellanslaget: förnamn på rad 1, efternamn på rad 2; namn med ett ord på en rad; namn som inte får plats krymps till lägst 30 pt, aldrig radbryts mitt i ett ord); titel Lato 12 pt versaler spärrning 0,12 i accent 4 mm under; kontaktrad 9 pt #555 2 mm under. 5 mm under kontakten en 3 pt linje i accent i full bredd, 8 mm luft under.
- Layout `marginalrubrik` 40 mm, 6 mm mellanrum, inga linjer över avsnitten: rubrik Montserrat 600 8,5 pt versaler spärrning 0,14 i accent i vänsterkolumnen, toppjusterad med innehållets första rad; 7 mm mellan avsnitt.
- Post standard, period 9 pt #555. Kompetenser grupp, intyg rad, språk rad. Inget foto.
- Återanvänder: Kolumns `marginalrubrik` utan `linjeOver`; nytt `namnRader: 2` i MallHuvud.

## 4. Vad Opus måste lägga till i mallsystemet

Utöver det som redan finns (utbud 1 avsnitt 4) behöver `MallDef`, renderaren och Word-byggaren:

1. **Typsnitt**: `montserrat`, `lora`, `ibm-plex-sans` i `TypsnittId`, `TYPSNITT_FILER` (Fontsource woff2, latin + latin-ext, varianter enligt avsnitt 2), `public/fonts/cv` och LICENSER.txt. Google Fonts-namnen i skissen är desamma. `WORD_TYPSNITT` oförändrad.
2. **Foto**: former `rundad` (radie 3 mm, png med genomskinliga hörn via sharp-mask med `rx`) och `staende` (bredd x höjd 3:4; `fotoSomPng` får ta bredd och höjd); platser `sidospalt-topp`, `band-vanster`, `huvud-topp-vanster`. Word: ImageRun överst i spaltcellen (Sand, Ek), i bandets första cell (Betong), i huvudtabellens första cell med 30 x 30 (Alm). Miniatyrens platshållare i alla tre formerna.
3. **Huvud**: `linjeOver` (Lind), form `delad` med kontakten som högerställd lista och valfri tvåkolumnig kontakt (Alm, Not), form `remsa` (Skylt: höjd, bara kontakt), `band.bakgrund` som hex eller `ton` med mörk text och `fotoSida: 'vanster'` (Betong, Panorama), `ram` (Pergament: linje, dubbel, padding), `monogram` (Sigill), `namnRader: 2` (Affisch), kort centrerad linje under huvudet (Valv: `linjeUnder` med `langd`).
4. **Rubrik**: `understruken` (Alm, Panorama: tjocklek, färg, avstånd), `linjeEfter` (Valv), `justering: 'hoger'` (Pergament), `nummer` (Index: typsnitt, grad, färg), `band.text: 'vit'` med bakgrund accent (Skylt), `linje.var: 'over'` med `langd` (Betong).
5. **Layout**: `marginalperiod` med `sida: 'hoger'` (Furu, intyg och språk följer), `marginalprick` (Spår: kolumnbredd, prickad linje, punkt, vilka avsnitt), `sidospalt.linje` på innerkanten utan bakgrund (Ek), `sidram` (Ramverk), `sidoremsa` (Kant), `sockel` (Sockel), `rutor` (Kakel).
6. **Post**: `periodPlats: 'efter-arbetsgivare'` (Lind). `kompetenser: 'spalter'` med `antal` (Not: 3).
7. **Word**: sidkanter (`page.borders`, Ramverk), styckekant med indrag för korta linjer (Betong, Valv), tabell per rubrik för linje efter texten (Valv), tre celler i huvudtabellen (Alm), dubbel ram runt flera stycken (Pergament), ImageRun i spaltcell (Sand, Ek), prickad cellkant och punkttecken (Spår), tre spalter i kompetenstabellen (Not), remsa med exakt radhöjd (Skylt), ljust band med foto vänster (Betong), run-understrykning (Alm), siffra och text i samma stycke (Index). Ingen av dessa kräver absolut placering.
8. **Katalog och register**: 20 rader i `katalog.ts` i ordningen 21 till 40 med `kort`, `kortUtanFoto` (Alm "Delat huvud", Sand "Ljus högerpanel", Loft "Luftig, stort namn", Betong "Grått band", Ek "Spalt med linje", Panorama saknas, Kakel "Tonade rutor", Kant "Färgkant"), `stil` och accenterna i avsnitt 3; 20 definitioner i `definitioner/`; `MALL_ANTAL` blir 40 och texterna som räknar mallar följer med via template-antal.ts. Inga nya alias.
9. **Merförsäljning och Föreslagna för dig** (utbud 1 avsnitt 6) uppdateras av saas-lead efter bygget; de nya fotomallarna i Word (Alm, Sand, Loft, Betong, Ek) är kandidater till merförsäljningens tre platser för en Björk-användare med foto. Ingen konstnärlig i merförsäljningen, som förut.

## 5. Granskning av skissen

Kontrollerat i skärmdumpar (Chrome, 1700 px, arken 1:1): inga två nya mallar har samma huvud och rubrikform; ingen ny mall har samma kombination av huvud, rubrik, layout och typsnitt som någon av de 20 befintliga (tabellens kolumn "Skiljer sig från"); alla tjugo rymmer exempel-CV:t på en sida utom Panorama, Sand, Ek, Loft, Skylt och Sockel där språken går till sida 2 med ett CV av den här längden (NORMALT_CV ger två sidor i alla mallar). Rättat under granskningen: Spår saknade perioden i första utkastet. Inga talstreck i skiss eller spec.
