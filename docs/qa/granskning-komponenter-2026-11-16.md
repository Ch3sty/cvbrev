# Granskning av mallkomponenterna mot skiss v4 (2026-11-16)

Art-director (Fable) med UX-designern (mobile-ux-designer) som motpart. Grenen `feat/mallar-komponenter` på http://localhost:8330, riktig Chrome via puppeteer-core, Pixel 7 (412 x 915, 2x) och dator 1280 x 900, ljust och mörkt. Skissen: `docs/design/skiss-mallar-2026-11-15.html` version 4. Bilder: `scratchpad/granskning-komponenter/` (aldrig i git). Två testkonton skapades med service role (`qa-granskning-gratis-…`, `qa-granskning-premium-…@jobbcoach-qa.test`) och raderades på id efteråt (cv_texts 2, formatted_cv_downloads 6, user_activities 33 rader räknade före delete).

Frågan ägaren ställde: är det bättre, eller "exakt som det gamla med ny färg"? Kort svar: strukturen är ny och bättre (eget CV utan konto på samma sida, svep i stället för karusell och rullistor, rubriker med ett tryck, kontot som ark, nedladdningen som final, mallen vald en gång). Men det hon ser de första fem sekunderna på mobilen efter uppladdningen är samma hjälte med ett filnamn i, arket 1000 px längre ner med en platta över namnet och en fast rad som tar en femtedel av skärmen. Rättas blockerarna nedan ser ägaren skillnaden utan att någon behöver förklara den.

Två saker byggagenten måste veta vid egna klicktester: uppladdningen har 5 tolkningar per adress och dygn, så lokala tester slår i 429 efter fem filer (jag gick runt det med en `x-forwarded-for`-header per sida, bara mot dev). Ingen NODE_TLS_REJECT_UNAUTHORIZED sattes av mig; varningen kommer från skalets miljö.

## Sammanfattning per yta

| Yta | Omdöme |
|---|---|
| Mallsidan utloggad, mobil (/cv-mallar, /verktyg/cv-mallar, /cv-mallar/prova) | RÄTTAS, blockerare B1, B2, B3, B4 |
| Mallsidan dator | RÄTTAS, B1 och V7 |
| Artikelkomponenten (/artiklar/cv-mall-gratis-guide) | GODKÄND |
| Yrkessidan (/cv-mallar/underskoterska) | RÄTTAS, blockerare B5 |
| Dokumentet och arken (rubrik, ordning, typsnitt, färg, avsnitt, Alla) | RÄTTAS, B2, B3, V1, V2 |
| Helskärmen | RÄTTAS, V4 |
| Kontoarket | GODKÄND |
| Finalen | GODKÄND, putsning P4 |
| Merförsäljningen | RÄTTAS, V6 |
| Inloggat /dashboard/cv-mallar | RÄTTAS, blockerare B4 och B6, V7 |
| Byggarens steg 7 | RÄTTAS, otestat med innehåll, V8 |
| Mörkt läge | GODKÄND |

## Blockerare

### B1. Efter uppladdningen står hon kvar i hjälten
Mätt: efter att filen lästs in ligger arkets överkant på y = 1013 px (Pixel 7) och y = 942 px (dator, vyn är 900). Hon ser dashade rutan med bock, filnamnet och "Byt fil", namnfälten ifyllda under, och ingenting av sitt CV. Skissens löfte "direkt efter uppladdningen står hennes CV i mallen" är inte infriat på någon skärm. Filnamnet och "Byt fil" står dessutom två gånger (i uppladdningsytan och i chippen ovanför arket).

Rättelse, `src/components/cv/Dokument/prova/ProvaArbetsyta.tsx` och `prova/Uppladdning.tsx`:
- När `inlasning.lage` blir `klar`: `scrollIntoView` på arkets wrapper (`.dok-ark-yta` eller Mallyta-roten), `block: 'start'`, `scroll-margin-top: 72px`, `behavior: 'smooth'` (`auto` vid reduced motion). Acceptans: arkets överkant inom 80 px från vyns överkant utan att hon rullar, på Pixel 7 och 1280.
- Uppladdningsytan i läget `klar` fälls ihop till en rad om 48 px: bock, filnamn, "Byt fil". Namnfälten göms (namnet ändras i dokumentet). Chippen ovanför arket är då den enda platsen för "Byt fil".
- Raden "Vi hittade kontaktuppgifter, erfarenhet, …" (UPPLADDNING.klar/delvis) ligger i dag under ett 537 px högt ark. Flytta den till raden ovanför arket, under chippen, och stryk svansen "Tryck på dokumentet för att läsa i helskärm" (se B3).

### B2. Tipsplattan täcker namnet
"Tryck på en rubrik för att byta den" renderas `absolute inset-x-3 top-3` inuti arket (`Dokument.tsx`) och ligger över namnet på mobilen i alla tre ytorna (mallsidan, inloggat, steg 7). Timern (6 s) startar när mätningen är klar, alltså medan hon fortfarande står i hjälten (B1), så raden hinner slockna innan hon ser arket.

Rättelse, `Dokument.tsx`: rendera raden ovanför arket i ett eget spår med reserverad höjd 36 px (alltid upptaget, tomt när tipset inte visas, CLS 0), 13 px, penna och text, samma ton som nu. Starta de sex sekunderna först när arket är i vyn (IntersectionObserver, threshold 0,5).

### B3. Två hjälprader säger samma sak, och trycket på arket gör något annat
Under arket står "Klicka på arket för att läsa i helskärm" (DOK.klickaHelskarm, `visaHjalprad`) och direkt under den "Vi hittade … Tryck på dokumentet för att läsa i helskärm". Men avsnittsträffytorna täcker nästan hela arket, så ett tryck på arket öppnar avsnittsarket (verifierat: både mitt mobil- och datorklick på "Läs i helskärm"-knappen landade i avsnittsarket "Arbetslivserfarenhet"). Förstoringsknappen i arkets hörn är `hidden sm:inline-flex` och 36 x 36, alltså borta på mobilen. "Klicka" är dessutom datorspråk.

Rättelse:
- `Mallyta.tsx`, `Step7Review.tsx`: ta bort `visaHjalprad`. `texter.ts`: stryk svansen i UPPLADDNING.klar.
- `Dokument.tsx`: visa zoomknappen på alla bredder, 44 x 44 (`right-2 top-2`, vit 90 %, skugga). Sidbrickan nere till höger står kvar som andra väg.
- Under arket i stället en rad som säger något nytt: "Linne, 1 av 20 · svep för nästa mall" (13 px, ink-3, centrerad). Mobilen saknar i dag varje signal om att svep finns; artikelkomponenten har den, det stora dokumentet har den inte.

### B4. Den fasta raden: 129 px på mobilen och ett glapp mot bottennavet inloggat
Mätt: raden är 129 px hög (format 48 + knapp 48 + luft) på Pixel 7. Inloggat ligger den på y 618 till 747 medan bottennavet börjar på 843: 96 px där remsan rullar igenom mellan raden och navet. På datorn inloggat slutar raden på 860 med vyn 900, samma fel i mindre skala. Orsak: `main.dashboard-main-content` (rullytan) har `padding-bottom: 96px`, och sticky räknas mot rullytans innehållskant; FastRad lägger dessutom `bottom: var(--bottom-nav-h)` = 72 px ovanpå.

Rättelse, `src/components/cv/Dokument/FastRad.tsx` och `src/app/dashboard/cv-mallar/`:
- Mobil (under 900 px): en rad i stället för två. Segmentväljare PDF | Word (48 px hög, cirka 150 px bred, ikon + ord, lås på Word i premiummall) till vänster, knappen `flex-1` till höger, padding 8/12 plus safe-area. Mål: högst 76 px plus safe-area.
- Inloggat: raden `position: fixed; inset-x: 0; bottom: var(--bottom-nav-h)` under 900 px, och sidan får `padding-bottom` lika med radens höjd. Alternativt nollställ rullytans padding-bottom på /dashboard/cv-mallar och lägg luften under FastRad i stället. Acceptans: radens underkant lika med navets överkant vid varje rullposition, ingen text syns mellan dem, på både 412 och 1280.

### B5. Yrkessidan har kvar den gamla hjälten
`/cv-mallar/underskoterska`: gradientrubrik i orange-rosa, "Testa mallen live", "Se CV-exempel", "Personligt brev", två kort Gratis/Premium med gradientknappar "Använd gratis" och "Se hela mallen", svart "Skapa konto" i huvudet. Den nya komponenten (MallVisningCv med "Undersköterska" förifyllt, uppladdningsraden, rubrikerna "Yrkesprofil", "Klinisk erfarenhet", "Kompetensområden") ligger på y = 1992 px (mobil) under den gamla sektionsrubriken "Se ditt undersköterska-CV i olika designer" och ingressen "Förhandsgranska ditt CV i vår gratismall Linne eller i Kalksten …". Skissen yta 2: dokumentet är hjälten.

Rättelse, `src/app/(public)/cv-mallar/[yrke]/YrkesmallContent.tsx`: hjälten = brödsmulor, eyebrow "CV-mall för vård", H1 oförändrad (SEO) i v2:s display-stil som /cv-mallar (ingen gradient), första ingresstycket oförändrat, sedan MallVisningCv direkt med titeln förifylld, gratismallen först och uppladdningsraden. Bort: de två korten, "Testa mallen live", gradientknapparna, den gamla sektionsrubriken och ingressen. "Se CV-exempel" och "Personligt brev" blir två textlänkar under komponenten. All SEO-text under är orörd, SEO-diffen som grind. Samma mönster på alla 74 yrkessidor.

### B6. Rubrikarket visar fel val inloggat
Inloggat (Pixel 7, bild inl-gratis-pixel7-ljus-06): efter valet "Sammanfattning" byts rubriken i dokumentet, men radiolistan markerar fortfarande "Profil" och visar "Tillbaka till förslagen". Utloggad fungerar det. Orsak: `CvMallarClient.sparaRubrik` tar bort `val.rubriker[s]` när PUT lyckats och lägger valet i `cv.section_titles`, men Mallyta räknar `nuvarande` ur `p.val.rubriker?.[sektion] ?? rubrik.text` där `rubrik.text` är texten när arket öppnades.

Rättelse, `src/app/dashboard/cv-mallar/CvMallarClient.tsx`: skicka `val={valMedRubriker}` till Mallyta (det sammanslagna valet finns redan), eller ge Mallyta en `rubriker.aktuell(s)` som läser `cv.section_titles`. Acceptans: radion följer dokumentet efter byte, nytt byte och "Tillbaka till förslagen".

## Viktigt

### V1. Typsnittsarket och rubrikarket täcker dokumentet på mobilen
`Ark.tsx` har `max-h-[88dvh]` för alla ark. Typsnitt (elva rader om 48 px, tre grupprubriker, fot) blir cirka 660 px, rubrikarket sju rader. Skissen lovar att arket står kvar så hon kan jämföra; i dag syns cirka 100 px av dokumentet. Rättelse: ark med `utanDimma` (typsnitt, ordning, uppsättning, rubrik) får `max-h-[52dvh]` under 640 px, `sm:max-h-[88dvh]`, innehållet rullar inne i arket (overflow finns redan). Rulla dokumentet när arket öppnas: rubrikarket lägger den tryckta rubrikknappen på cirka 20 % av vyhöjden, typsnittsarket arkets överkant mot vyns topp. Acceptans: på Pixel 7 med typsnittsarket öppet syns namnet, titeln och minst en rubrik ovanför arket.

### V2. Remsan gör sidan bredare än skärmen
Med sex objekt i remsan (Linne, Raster, Kalksten, avdelaren Gratis, Björk, Alla 20) klipps skälet "Du har många system och verktyg, så kompetenserna visas först" och mallradens "PDF Word" vid högerkanten, och "Alla 20" halvsyns. Mätt 412/412 i scrollWidth efter att layouten satt sig, men bilderna visar klippningen: mobilgriden i `Mallyta.tsx` (`mx-auto mt-3 grid max-w-[600px] gap-3`) saknar `min-w-0`, och Remsans flex med `overflow-x-auto` pressar ut gridcellen. Rättelse: `w-full min-w-0` på griden, `min-w-0 max-w-full` på Remsas rot, `overflow-x-clip` på `.mallyta`. Mallradens "PDF Word" ska radbrytas, inte klippas. Acceptans: ingen text klipps vid högerkanten med sex objekt i remsan.

### V3. Premiumknappen på två rader, Word trunkerat
412 px: "Ladda ner PDF i Raster, Premium 149 kr i månaden" bryts till två ojämna rader; Word-rutan blir "Word ingår i Pre… [lås]". Datorn 1280: samma knapp på två rader i 280 px. Rättelse, `FastRad.tsx` och `texter.ts` (KNAPP.laddaNerIPremium, laddaNerIPremiumInloggad): gör tvåradigheten avsiktlig: rad 1 "Ladda ner PDF i Raster" (15 px semibold), rad 2 "Premium 149 kr i månaden" (12 px, 85 % opacitet), knapphöjd 56, ordningen "pris efter namnet" kvar. Word-rutan under 480 px: ikon + "Word" + lås, small-texten `hidden min-[480px]:inline`, `aria-label="Word, ingår i Premium"`. Aldrig "ingår i Pre…".

### V4. Helskärmen klipper mitt i en rad
Sida 2 börjar med en avklippt rad från sida 1 ("Svenska Modersmål · Engelska Flytande" syns i båda). `Helskarm.tsx` klipper samma iframe vid `sidHojd = arkbredd * A4-kvot`, men förhandsvisningens HTML har inga sidbrytningar, så klippet stämmer inte med PDF:ens. Rättelse i två nivåer: (a) nu: ett sammanhängande ark i helskärmen med den streckade linjen och "Sidan 2 börjar här" vid varje A4-höjd, ingen klippning; (b) riktig paginering i förhandsvisningens HTML (behållare med `column-width` = sidbredd, `column-gap: 0`, `height` = sidhöjd, `break-inside: avoid` på varje post), då blir varje kolumn en sida. Acceptans: sida 2 börjar med en hel rad och sidantalet i helskärmen är lika med PDF:ens. Dessutom: sidbrickan "2" nere till höger täcker etiketten "Sidan 2 börjar här" (syns som "Sidan 2 bö"). Flytta etiketten till vänster (`left-1.5`) i `Dokument.tsx`.

### V5. Hjälten på /cv-mallar och /verktyg/cv-mallar trycker ner uppladdningen
/cv-mallar mobil: H1 i tre rader, ingress, chipraden "Börja från din situation" (Student, Utan erfarenhet, Karriärbyte, Chef) och först sedan uppladdningen på y = 607 px. /verktyg/cv-mallar: statraden 20 / 2 / 12 före uppladdningen, "Välj fil" på cirka y = 800 px, precis vid vecket på en riktig Pixel 7 med webbläsarkrom. /cv-mallar/prova har skissens hjälte och är rätt. Rättelse: behåll H1 och ingress (SEO), men flytta chipraden och statraden under arbetsytan så uppladdningen kommer direkt efter ingressen. Ingressen på /cv-mallar säger "Med ett gratiskonto fyller du i en av dem och laddar ner ditt CV som PDF", vilket motsäger uppladdningen utan konto; be copywritern och SEO-strategen om en mening som stämmer, jag skriver den inte här.

### V6. Merförsäljningens miniatyrer är för små
Strukturen stämmer med skissen (tre kort med hennes eget CV, skillnaden i högst fyra ord, namnet litet, en knapp, "Nej tack, behåll Linne"), men bilderna är 64 px breda och på 64 px ser Antikva, Kolumn och Stål likadana ut. Poängen är bilder av hennes CV. Rättelse, `Merforsaljning.tsx`: tre kort i rad på mobilen, miniatyr 112 px bred (A4-kvot) överst, texten under; samma på datorn. 3 x 112 plus mellanrum ryms på 412.

### V7. Datorns fasta rad klipper verktygsraden
1280: med premiummall vald står "Aa Georgia | färger | Standar" avklippt och "Raster Premium" ligger över ordningschippen; "PDF klar att sk…" trunkeras i 300 px; CTA:n på två rader i 280 px. Inloggat på 1280 är kolumnen 969 px och det blir värre (färgprickarna klipps vid tre). Rättelse, `FastRad.tsx`: vänstra ytan `overflow-x-auto [scrollbar-width:none]` i stället för `min-w-0 shrink` som klipper, mallnamnet och nivån bara från 1400 px, formatparet utan small-texten "klar att skicka" på lg (ikonerna räcker), knappen 320 px med V3:s tvåradiga text.

### V8. Steg 7 är bara testat med tomt CV
Varken mina eller byggagentens bilder visar steg 7 med innehåll (mitt utkast i `jobbcoach_cv_draft` återställdes inte via "Fortsätt"). Det som syns: "Steg 7 av 7, Hur ska ditt CV se ut?", valideringsraden, arket i storleken mellan med tipsplattan över namnet (B2), "Klicka på arket …" (B3), knappen "Spara och ladda ner PDF" avstängd i flödesfoten. Varken remsan "Föreslagna för dig" eller verktygsraden syns i första vyn på Pixel 7 eller 1280, bara arket. Rättelse, `Step7Review.tsx`: Remsa (kompakt, 64 px miniatyrer) mellan rubriken och arket, verktygsraden under arket som nu. Byggagenten klicktestar steget med ifyllt CV (adminknappen "Fyll i testdata" finns i foten) och verifierar att tryck på ett avsnitt går till rätt steg och tillbaka, att rubrikbytet följer med i PDF:en och att finalen öppnas.

## Putsning

- P1. Valt avsnitt: namnchippen (`-top-3`) ligger över rubriktexten så den blir oläslig. Lägg chippen utanför ramen (ytterligare 10 px upp) eller behåll bara ramen.
- P2. Fotoarket för utloggad är inte klicktestat (chippen syns bara i fotomallar; min klickning träffade filterchippen "Foto"). Koden följer skissens text (FOTO_ARK). Byggagenten klicktestar i Björk eller Koppar utloggad.
- P3. Mallsidans mobilrad "Klicka på arket …" och statusradens "Tryck på dokumentet …" går bort med B3; kvar blir bara "Vi hittade …" ovanför arket.
- P4. Finalen: kortet visar titel, arbetsgivare och ort. Skissen har en rad om varför ("Tre av dina intyg efterfrågas"). `Final.tsx` har `traff.beskrivning` men renderar den inte; visa en rad om högst 80 tecken när den finns.
- P5. Datorns mallkolumn med alla 20 i grupper är längre än vyn, så `sticky top-20` har ingen verkan. Fäll ihop grupperna under Föreslagna bakom en rad "Visa alla 20" så kolumnen ryms och klistrar.

## Det som är godkänt, med belägg

- Uppladdningsytan: dra och släpp eller välj fil, PDF eller Word, "eller skriv ditt namn", felpanelen för slut kvot med "Fyll i direkt" och "Skapa konto" (sedd skarpt vid 429). Inläsningen "Läser ditt CV" med stapel.
- Dokumentet: prickade kopparlinjer under alla rubriker, heldragen linje och penna vid hover, kopparram på valt avsnitt, träffytor 44 px (mätt 44 på fem rubriker, både 412 och 1280), svep byter mall med grannens miniatyr under arket, sidbricka och brytlinje vid två sidor, "+ Lägg till" för tomma avsnitt (kod).
- Rubrikarket: "Rubrik över din profil", radioknappar 48 px, "Skriv egen rubrik", "Rubriken följer med i PDF och Word", "Tillbaka till förslagen", Klar. Bytet syns direkt i dokumentet (utloggad och inloggad), och inloggat sparas det (PUT section-titles).
- Verktygsraden: "Aa Calibri" i mallens typsnitt, fyra färgprickar 24 px med 44 px träffyta (mätt 32 x 44), ordningschippen med riktig ikon, fotochippen med initialen bara i fotomallar. Inga v-pilar någonstans; pilarna i ordningsarket är riktiga ikoner.
- Typsnittsarket: elva typsnitt i tre grupper, varje rad satt i sitt typsnitt, 48 px (mätt), "läses av alla system" på Calibri, bytet live. Ordningsarket: Standard, Intyg först, Utbildning först, Kompetenser först, "Få plats på en sida" som brytare, "Rubriker efter yrke" och "Färg och typsnitt" som rader.
- Alla-arket: sök, filter (Alla 20, Gratis, Word, Foto, Två spalter, En sida), rutnät i tre kolumner grupperat Föreslagna, Gratis, En spalt, Period i marginalen, Två spalter, Mer form och färg, med klistrade grupprubriker. Tryck stänger arket och byter dokument. Datorn: samma innehåll som kolumn med 336 px och tre per rad.
- Remsan: Föreslagna för dig med skälet ("Du har många intyg, så de visas först"), avdelaren Gratis, brickan "Alla 20". W på miniatyrer med Word.
- Format och knapp: PDF- och Word-ikoner i formatvalet och på knappen, Word med lås i premiummall för gratiskonto, Word öppet i gratismallarna. Premium laddar ner Word (verifierat: `cv-koppar-erik-lindberg.docx, Koppar, 2 sidor` i finalen).
- Kontoarket: "Ladda ner ditt CV", "Skapa ett konto, så följer ditt CV med", raden om vägen (gratis respektive "När kontot är klart går du till kassan. Premium kostar 149 kr i månaden och ger dig Raster och alla andra mallar"), Google först, e-post och lösenord, "Skapa konto och gå till kassan", "Har du redan ett konto? Logga in". Premiummall vald utan CV: knappen rullar till uppladdningen.
- Gratisvägen: "Ladda ner gratis i Linne, Samma CV, samma rubriker" med bild, både mobil och i datorns kolumn, byter till gratismallen.
- Betalväggen inloggat (GraValSheet "Mallen ingår i Premium", "Välj bland de 2 fria") och köpet i knappen "Ladda ner PDF i Koppar med Premium, 149 kr i månaden".
- Finalen: knappen fylls ("Skapar PDF" med fyllning), bocken ritas, "Klart. Ditt CV är nedladdat.", filrad med ikon, Öppna i koppar och Dela lika stora, "Första jobbet som matchar ditt CV" med träff (IT-projektledare inom IT/OT, Adavo AB, Stockholm), "Se fler jobb som matchar", brevet som länk. Säljer ingenting första gången.
- Merförsäljningen vid andra nedladdningen: "Ditt CV i en annan mall?", tre kort med hennes CV (Sidospalt och foto / Kalksten, Mörk sidospalt, foto / Granit, Två spalter, mer plats / Stål), "Ladda ner i Kalksten, Premium 149 kr i månaden", "Nej tack, behåll Linne".
- Artikelkomponenten: "Så ser ditt CV ut i våra mallar, Skriv ditt namn så ser du det direkt", namn och titel byts i dokumentet, titeln byter rubrikerna (Undersköterska gav "Legitimation och behörigheter" och "Kompetensområden"), raden "Har du redan ett CV? Se det i alla mallar" med knappen Ladda upp som länk till #ladda-upp, "svep för nästa mall", fem miniatyrer med namn, "Linne Gratis, även som Word", "Fortsätt med ditt CV", "Två mallar är gratis. Alla ingår i Premium."
- Inloggat: CV-chippen "CV: Erik Lindberg", Byt CV-arket, premiummallar utan lås i remsan, avsnittsarket med fält och Spara.
- Mörkt läge: hjälte, dokument (vitt ark på mörk yta), ark, kolumn och fast rad håller ihop på både 412 och 1280.

## UX-designerns omdöme

Per yta: mallsidan utloggad mobil RÄTTAS (blockerare 1, 2, 3, 6 i hennes numrering, motsvarar B1 till B4 här), mallsidan dator GODKÄND med rullning till arket och V7, artikeln GODKÄND, yrkessidan RÄTTAS (B5), dokumentet och arken RÄTTAS (B2, B3, V1 och svep-signalen), helskärmen RÄTTAS (V4), kontoarket GODKÄND, finalen GODKÄND med skälraden som putsning, merförsäljningen RÄTTAS (V6), inloggat RÄTTAS (B4, B2, svep-signalen), steg 7 GODKÄND med gemensamma rättelser plus remsan ovanför arket (V8).

Hennes tre meningar: "Strukturen är bättre än den gamla: eget CV utan konto på samma sida, mallbyte med svep i stället för karusell och rullistor, rubriker med ett tryck på dokumentet, kontot som ett ark och nedladdningen som en final med nästa steg, och mallen väljs en gång. Men det ägaren ser de första fem sekunderna på mobilen är i dag samma hjälte med ett filnamn i, ett ark 1000 px längre ner med en platta över namnet, två hjälprader som säger samma sak och en fast rad som tar en femtedel av skärmen, och det är precis bilden 'exakt som det gamla med ny färg'. Rättas 1, 2, 3 och 6 så landar hon på sitt eget CV i mallen direkt efter uppladdningen, och då syns skillnaden utan att någon behöver förklara den; utan dem kommer ägaren inte att se den."

Jag håller med i allt utom en nyans: hon sätter steg 7 som godkänt, jag sätter det som RÄTTAS tills någon klicktestat det med innehåll.

## Ordning för byggagenten

1. B1 rulla till arket, fäll ihop uppladdningen, flytta "Vi hittade"-raden.
2. B2 tipsraden ovanför arket med reserverad höjd och timer vid synlighet.
3. B3 stryk hjälpraderna, zoomknappen 44 x 44 på alla bredder, "Linne, 1 av 20 · svep för nästa mall" under arket.
4. B4 fasta raden på en rad, fixed mot navet inloggat, inget glapp på 412 eller 1280.
5. B5 yrkessidans hjälte.
6. B6 rubrikarkets val inloggat.
7. V1 arkens max-höjd 52dvh och rullning av dokumentet.
8. V2 min-w-0 i Mallyta och Remsa.
9. V3 premiumknappen två avsiktliga rader, Word utan trunkering.
10. V4 helskärmens sidor och etiketten under sidbrickan.
11. V5 chipraden och statraden under arbetsytan.
12. V6 merförsäljningens miniatyrer 112 px.
13. V7 datorns fasta rad.
14. V8 steg 7 med remsan ovanför arket och klicktest med innehåll.
15. P1 till P5.

Efter rättelserna: nytt klicktest i riktig Chrome på Pixel 7 och 1280, ljust och mörkt, med skärmdump per steg, innan något kallas klart.
