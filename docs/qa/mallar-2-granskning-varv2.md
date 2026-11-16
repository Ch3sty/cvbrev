# Utbud 2: granskningsvarv 2

Art-director, 2026-11-17. Underlag: rättelsen 49510322 (Loft och Kakel), avvikelserna i docs/qa/mallar-2-avvikelser.md, materialet i scratchpad\mallar2\bygge\29-loft och 38-kakel (NORMALT_CV med och utan foto, LANGT_CV, sida 1 och 2, Word för Loft), granskningsmappen för alla 40 (scratchpad\mallar2\granskningsmapp-40), miniatyrerna i public/mallar/v2 och ett stickprov på helskärmens sidbilder (sidbilder.ts) för två godkända mallar.

## Resultat

Loft godkänd. Kakel godkänd med en sista rättelse av rad 2 i rutnätet (liten, exakt nedan). Miniatyrerna utan anmärkning. Stickprovet på helskärmens sidbilder hittade ett fynd i Sand (och samma i Ek) på sida 2 som strider mot specen och måste rättas i varv 3: panelen och linjen fortsätter som tomma ytor på sida 2 i PDF:en. Tre rättelser alltså: Kakel rad 2, Sand sida 2, Ek sida 2. Övriga 17 oförändrat godkända.

## 29. Loft: godkänd

- Kompetenser står på sida 1 i NORMALT_CV med och utan foto. Sida 2 bär certifieringar, språk och referenser, som Lind.
- Fotot hänger ned i luften under huvudet (nytt fält `hanger` i MallFoto): toppjusterat med namnet, nederkanten som mest 2 mm ovanför Profil. Det syns inte som en avvikelse, snarare som att fotot sitter i huvudets nedre luft. Godkänt som permanent lösning, inte bara som rättelse: det här är hur Loft ska se ut.
- Luften 7 / 8 / 4,5 mm oförändrad. Långt CV: namnet på två rader, fotot kvar till höger, sida 2 ren.
- Word följer PDF:en (fotot förankrat i huvudtabellens cell, radens minsta höjd). PDF mot Word lika i jämförelsebilden.
- Miniatyren (loft-stor.webp) är renderad ur den rättade definitionen: fotot hänger, Kompetenser på sida 1.

## 38. Kakel: godkänd efter en sista rättelse

Rätt nu:
- Kompetensrutan i grupp-form, omkring 45 mm. Rad 1 (Kompetenser och Certifieringar) står på sida 1 i NORMALT_CV med och utan foto; rutnätet som tabell bryts bara mellan raderna.
- Intygen i rutan med radavstånd 1,3 och 1 mm mellanrum: godkänd avvikelse. Skillnaden mot mallens 1,4 syns inte i rutan, och rad 1 ryms med 1,5 mm marginal.
- Långt CV: rad 1 på sida 2 under utbildningen, rutorna hela, inget bryts inuti.
- Miniatyren (kakel-stor.webp) visar rad 1 på sida 1.

Rätta (varv 3 bara på det här):
- **Rad 2 fylls från vänster.** I NORMALT_CV står Språk ensam i höger cell på sida 2 med tom vänstercell, och Referenser (vanligt avsnitt utan ruta) hamnar i vänstercellen bredvid rutan. I LANGT_CV samma sak: Språk till höger, vänster tom. En ensam ruta till höger med tomrum till vänster ser ofärdig ut i en betald mall.
- Regel: rutorna i rad 2 radas från vänster i ordningen Intressen, Språk; saknas Intressen står Språk i vänster cell och höger cell är tom. Referenser (och Projekt om det står sist) är inte rutor och ska stå efter rutnätet i full bredd, aldrig i en cell. Tom cell i rad 2 får ingen bakgrund.
- Verifiera i NORMALT_CV (Språk vänster, Referenser under rutnätet i full bredd), LANGT_CV (Språk vänster) och KORT_CV; ATS läser rutorna i DOM-ordning som nu.

## Stickprov: miniatyrer och helskärmens sidbilder

Miniatyrer (public/mallar/v2, renderade ur definitionerna med NORMALT_CV, sida 1, foto på, förvald accent): loft-stor, kakel-stor, sand-stor och spar-stor granskade i 300 x 424. Alla fyra visar den aktuella definitionen (Loft med hängande foto och Kompetenser på sida 1, Kakel med rad 1 på sida 1, Sand med fotot i panelen, Spår med punkterna på linjen), skarpa och i rätt beskärning (toppen av sidan, inget huvud klippt).

Helskärmens sidbilder (renderaSidbilder i sidbilder.ts, PDF ritad med pdf.js i 1600 px bredd, NORMALT_CV, Sand med foto): Spår utan anmärkning på båda sidorna (prickade linjen, punkterna, perioden, sida 2 med certifieringar, språk och referenser). Sand sida 1 utan anmärkning. **Sand sida 2 har ett fynd**, se nedan; sidbilden visar samma sak som PDF:en i bygget, så helskärmen i sig fungerar.

## Fynd i stickprovet: Sand och Ek på sida 2

Specen (avsnitt 2, "Sida 2 och framåt") säger att panelen i Sand och linjen i Ek slutar med innehållet och att sida 2 är enspaltig i full bredd, som Kalksten. Avvikelselistan tar upp det bara för Word. I PDF:en gör bygget så här:

- **Sand, NORMALT_CV med foto, sida 2:** ett tomt sandfärgat block 60 mm brett och omkring 25 mm högt uppe till höger (tabellcellens bakgrund fortsätter på sidan där raden fortsätter), bredvid certifieringarna som står i huvudspaltens bredd. I LANGT_CV fyller blocket hela sida 2 till bottenmarginalen utan innehåll. Det ser trasigt ut och är det första en mottagare ser på sida 2.
- **Ek, NORMALT_CV med foto, sida 2:** den lodräta accentlinjen fortsätter 25 mm och certifieringarna står kvar i huvudspaltens bredd med tom vänsterspalt.

Rätta (varv 3, tillsammans med Kakels rad 2):
- I PDF:en ska panelens bakgrund (Sand) och spaltlinjen (Ek) sluta med spaltens innehåll på sida 1, och huvudspalten på sida 2 och framåt ska gå i full textbredd (15 respektive 16 mm sidmarginaler), som specen säger. Teknik som i Kalksten om Kalksten gör rätt (se nedan); annars spalten som `grid` med `align-self: start` och utan `min-height`, och tabellraden får inte bära bakgrunden på fortsättningssidor. Alternativet "panelen i full höjd bara på sida 1" (absolut placerat bakgrundsblock 297 mm på sida 1) är tillåtet om det inte påverkar läsordningen i ATS-kontrollen.
- Word: den kända begränsningen (panelen och linjen fortsätter på sida 2 med radens minsta höjd) står kvar som godkänd, men det tomma blocket får inte vara högre än det som Kalksten redan har i Word.
- Verifiera med NORMALT_CV med och utan foto och LANGT_CV, sida 2 och 3, i PDF och i helskärmens sidbilder; ATS och sidbrytningsgrinden om för Sand och Ek.

**Kalksten gör samma sak (kontrollerat).** Jag renderade Kalksten med LANGT_CV genom samma sidbildskedja: på sida 2 fortsätter den grå panelen i full höjd (överst med Språk, sedan tom), och på sida 3 står en tom grå panel bredvid Projekt och Referenser. Det är alltså inte ett fel i Sand och Ek utan i sidospaltslayouten i renderaren (tabellcellens bakgrund och kant följer raden på varje sida där huvudspalten fortsätter). Granit har med all sannolikhet samma beteende; Kalksten och Granit är live sedan 2026-11-16 och godkändes i utbud 1 utan att sida 3 granskades. Rättelsen ska därför göras en gång i renderaren för layouten `sidospalt` och verifieras för alla fyra (Kalksten, Granit, Sand, Ek) med LANGT_CV sida 2 och 3: panelens bakgrund och kant slutar där spaltens innehåll slutar, och huvudspalten tar full textbredd på sidor utan spaltinnehåll. Om spaltens innehåll självt går över till sida 2 (Kalksten LANGT_CV: Språk) får panelen fortsätta där, men bara så långt innehållet räcker. Stål (tvåspalt utan panel) och Ritning (helSida, avsiktligt) berörs inte. Rapportera till saas-lead att två live-mallar rättas i samma släpp.

## Avvikelserna efter varv 2

| Avvikelse | Dom |
|---|---|
| Loft: fotot hänger ned i luften under huvudet (`hanger`) | Godkänd, blir mallens definition. |
| Kakel: intygen i rutan radavstånd 1,3 och 1 mm mellanrum | Godkänd. |
| Kakel: rutnätet som tabell som bryts mellan rader | Godkänd. Den kända begränsningen "flyttas helt" är struken. |

## Nästa varv

Varv 3 granskar Kakels rad 2 (NORMALT_CV, LANGT_CV, KORT_CV) och Sand och Ek på sida 2 och 3 (NORMALT_CV med och utan foto, LANGT_CV, PDF, Word och helskärmens sidbilder). Miniatyrerna påverkas inte (sida 1). Övriga 17 är godkända sedan varv 1 och 2 och behöver inte granskas igen om deras definitioner inte ändras. Lärdom till grinden: sidbrytningstestet räknar sidor men ser inte tomma bakgrundsytor; lägg till en bildkontroll av sida 2 för sidospaltsmallarna (andel färgade pixlar i spaltens yta utan text) så att det här fångas automatiskt för alla sex sidospaltsmallar.
