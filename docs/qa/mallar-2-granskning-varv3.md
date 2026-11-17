# Utbud 2: granskningsvarv 3 (sista)

Art-director, 2026-11-17. Underlag: rättelsen c0067d1f (flytande sidospalt i renderaren och Kakels rutnät), materialet i scratchpad\mallar2\bygge för 04-kalksten, 05-granit, 24-sand, 34-ek och 38-kakel (sida 1 till 3 för KORT_CV, NORMALT_CV med och utan foto och LANGT_CV, Word-filer, PDF-mot-Word-bilder) och den omgjorda granskningsmappen för alla 40. Grinden enligt koordinatorn: ATS 330/330, sidbrytning 160/160, ny grind mallar-spaltytor 10/10, build, klicktest 113/113.

## Resultat

Allt godkänt. Inga fler rättelser. Utbud 2 (21 till 40) är klart för push tillsammans med rättelsen av sidospalten i Kalksten, Granit och Kvadrat.

| Mall | Dom | Kontrollerat |
|---|---|---|
| Kakel (38) | Godkänd | KORT_CV: allt på sida 1, rad 1 Kompetensområden och Legitimation, rad 2 Språk till vänster. NORMALT_CV med och utan foto: rad 1 på sida 1, sida 2 börjar med Språk till vänster och Referenser under rutnätet i full bredd. LANGT_CV: rad 1 på sida 2 under utbildningen, Språk till vänster, Projekt och Referenser i full bredd på sida 3. Ingen ruta bruten, ingen tom cell med bakgrund. |
| Sand (24) | Godkänd | Sida 1 som förut i NORMALT_CV och KORT_CV: panelen når bottenmarginalen, fotot överst, inget hopp i huvudspalten. Sida 2 i NORMALT_CV: full textbredd, inget sandfärgat block. LANGT_CV: panelen slutar på sida 1 (spaltens innehåll ryms där), sida 2 och 3 i full bredd. Utan foto börjar panelen med Kontakt. |
| Ek (34) | Godkänd | Sida 1: linjen når bottenmarginalen, fotot 44 mm överst. Sida 2 i NORMALT_CV och sida 2 och 3 i LANGT_CV: full bredd, ingen linje. KORT_CV: allt på sida 1. |
| Kalksten (4, live) | Godkänd | Sida 1 i NORMALT_CV med och utan foto och i KORT_CV som förut (panelen till bottenmarginalen, intygsfältet, fotot i huvudet). LANGT_CV: Språk går över till sida 2 och panelen fortsätter bara så långt (ett litet grått fält överst, huvudspalten i sin bredd på den sidan), sida 3 i full bredd utan panel. Det är regeln från varv 2 och ser avsiktligt ut. |
| Granit (5, live) | Godkänd | Som Kalksten: sida 1 oförändrad (band, mörk panel till bottenmarginalen, intygsfält), LANGT_CV sida 2 med Språk i ett mörkt fält överst och sida 3 i full bredd. |
| Kvadrat (15, live) | Godkänd på koordinatorns ord | Omfattas av samma renderarrättelse och av grinden mallar-spaltytor; inte granskad i bild i det här varvet eftersom inget material lades fram. Ta med i granskningsmappens uppdatering. |

Ritning orörd (helSida är avsiktligt). Stål berörs inte (tvåspalt utan panel).

## Beslutet om Word för långt CV i spaltmallarna: alternativ (a)

Word behåller spalten som tabellrad genom hela dokumentet, så huvudspalten är smal också på sida 2 och 3 och ett avsnitt kan hamna en sida senare än i PDF:en (samma sidantal). Jag väljer **(a)**: Word som i dag för Kalksten och de nya, och ett undantag i Word-mot-PDF-grinden för LANGT_CV i spaltmallarna. Skäl:

1. **Nedladdningen blir inte sämre för användaren.** Word-filen är ren och konsekvent: panelen är en färgad kolumn på varje sida (Sand-jämförelsen visar sandkolumnen på sida 2 och 3), inget tomt block som i PDF-felet från varv 2, samma sidantal, samma avsnittsordning, inga avsnitt delade på annat sätt. Kalksten har levererat så sedan 2026-11-16 utan anmärkning. Den som laddar ner Word gör det för att redigera, och en tabellspalt är det som redigerar bäst i Word.
2. **(b) är en risk utan kund.** Flytande tabeller i Word bryts inte förutsägbart över sidor; text som flyter runt en flytande tabell hamnar olika i Word på Windows, Mac, LibreOffice och Google Docs, och grinden i riktig Word skulle inte längre säga något om de andra. Ett större ingrepp i Word-byggaren dagen före push, för ett fall (tre sidor, spaltmall, Word) som de 151 nedladdningarna i formatted_cv_downloads knappt innehåller, är fel prioritering.
3. **Grindens undantag ska vara smalt.** För LANGT_CV i mallar med layouten sidospalt (Kalksten, Granit, Sand, Ek) jämför grinden sidantal, avsnittsordning och att varje post är hel; exakt sida per avsnitt jämförs inte. För KORT_CV och NORMALT_CV gäller full jämförelse som förut (78/78 gröna). Undantaget skrivs i avvikelselistan och i word-mallar-granska så att det inte tyst vidgas.

Om Word-andelen i spaltmallarna växer i avläsningen 14 december kan (b) prövas som ett eget arbete efter kampanjfrysen, med Kalksten som pilot.

## Avvikelserna efter varv 3

| Avvikelse | Dom |
|---|---|
| Spaltens minhöjd sätts av ett skript så att panelen når bottenmarginalen på sida 1 | Godkänd. Panelen på sida 1 ser ut som förut i alla fyra. Skriptet ska köras i samma steg som miniatyrerna (scripts/mallbilder.ts) när en spaltmalls mått ändras, och det ska stå i definitionens kommentar. |
| Word: spalten som tabellrad genom dokumentet, avsnitt kan hamna en sida senare i LANGT_CV | Godkänd enligt beslutet (a) ovan. |
| Kakel: intygen i rutan radavstånd 1,3 och 1 mm | Godkänd sedan varv 2. |
| Loft: fotot hänger (`hanger`) | Godkänd sedan varv 2. |

## Slutord

Utbud 2 ger 40 mallar: 26 i PDF och Word, 15 med fotoplats, 2 gratis (Linne, Björk). De 20 nya skiljer sig i form från de 20 befintliga enligt kontaktarket, och ingen är en omfärgning. Granskningsmappen för alla 40 (scratchpad\mallar2\granskningsmapp-40) ska kopieras till ägarens granskningsmapp på skrivbordet i samma struktur som utbud 1 (en mapp per mall med PDF, Word där det finns, bild av sida 1, plus index.html och kontaktark.png), med Kalksten, Granit och Kvadrat omgjorda efter sidospaltsrättelsen.

Till saas-leads rapport: två live-mallar (Kalksten, Granit) och Kvadrat rättas i samma släpp (tomma panelytor på sida 2 och 3 i långa CV:n i PDF), grinden mallar-spaltytor fångar det framöver, och Word-undantaget för långt CV i spaltmallar är beslutat av art-director med skälen ovan.
