# Utbud 2: avvikelser från specen

Bygget av mallarna 21 till 40 (docs/design/mallar-utbud-2-2026-11-16.md) följer specen utom på punkterna nedan. Varje punkt har skälet och vad som ändrades.

## Mått och värden

| Mall | Specen | Bygget | Skäl |
|---|---|---|---|
| Ek (34) | Spalten 56 mm från papperskanten med sidmarginalen inne i spalten | 16 mm sidmarginal plus 56 mm spalt (72 mm från kanten) | Med 56 mm från kanten blir spaltens innehåll 34 mm brett och rymmer inte det 44 mm stora fotot. Skissen har 56 mm innanför marginalen, och skissen är facit. |
| Loft (29) | Luft ovanför avsnitt 9 mm, under huvudet 10 mm, mellan poster 5 mm | 7 mm, 8 mm och 4,5 mm | Med specens luft blev det korta exempel-CV:t två sidor med foto och det långa fyra, och sidbrytningstestet kräver en respektive två till tre. 7 mm är minsta luften som ger samma sidbrytning i Word som i PDF:en för det långa CV:t. Mallen är fortfarande den luftigaste i utbudet. |
| Pergament (30) | Namnet spärrat 0,08 em | 0,05 em | Med 0,08 em läste CV-läsaren (pdf-parse) "Å S A  Ö B E R G" i det korta exempel-CV:t, och ATS-kontrollen fällde mallen. Vid 0,05 em läses namnet helt i alla tre längderna. |
| Valv (23) | Kortet "Centrerad serif, linje efter rubrik" | "Centrerad serif, rubriklinjer" | Kortet får högst fyra ord (MallKort.kort, testet i mallsystemet.test.ts). |
| Not (32) | Kortet "Kompakt, tre sidor på två" | "Kompakt, rymmer mer" | Samma fyraordsgräns. |
| Ek (34) | Kortet "Spalt med linje, stort foto" | "Spaltlinje och stort foto" | Samma fyraordsgräns. |

## Teknik i Word

- **Remsan i Skylt står före namnet i Word-filen.** Remsan är en tabellrad överst på sidan och bär kontakten, så kontaktraden är dokumentets första text och namnet (Rubrik 1) det första stycket efter den. Det finns inget sätt att lägga namnet först i dokumentordningen utan absolut placering. Testet word-mallar.test.ts godtar det för huvudformen remsa; ATS-kontrollen (namnet inom de första 700 tecknen) är grön.
- **Spårs punkter är förankrade bilder.** Specen föreslog tecknet "●" högerställt i marginalcellen med negativt indrag. Word klipper allt som går utanför cellen, så punkten blev en halv cirkel, och tecknet hade dessutom blivit text som CV-läsaren tar med i jobbet. Punkten är i stället en liten png förankrad i marginalcellens stycke (flyttar med posten, ingen fast plats på sidan, ingen text).
- **Valvs linje efter rubriken** är en understruken tabb till högermarginalen i rubrikens stycke, inte en tabell per rubrik. Resultatet är detsamma i Word och PDF, rubriken förblir ett vanligt Rubrik 2-stycke och inga tabeller smälter ihop med efterföljande tabeller.
- **Korta linjer (Valv under huvudet, Betong över rubrikerna)** är små bilder i egna stycken, inte tomma stycken med styckekant: Word-testet tillåter inga tomma stycken utanför tabeller.
- **Alms linje under huvudet** är nedre cellkant på huvudtabellens celler med cellmarginal som luft, inte en styckekant på ett tomt stycke efter tabellen (samma skäl).
- **Index nummer** står som Georgia-runs i rubrikens stycke enligt specen. Rubrikens text i Word blir då "01 Profil"; testen och ATS-kontrollen jämför rubrikerna utan numret.
- **Exakt radhöjd på namnet** i Alm, Loft och Skylt (nytt fält `exakt` i MallHuvud). Calibri och Arial ger annars Word en högre namnrad än PDF:en (1,22 mot 1,05 och 1,1), och huvudet blev 2 mm högre i Word.

## Gemensamma rättelser som också rör de 20 befintliga

- **Kerning i Word** från 8 pt, som `font-kerning: normal` i PDF:en. Utan den bröt Word raderna tidigare än Chrome, och Alm fick en post på fel sida.
- **Slutgruppen i Word.** PDF:en håller ihop de korta avsnitten sist (intyg, språk, intressen, referenser) och låter aldrig referenser, språk eller intressen stå ensamma överst på en sida. Word gör nu samma sak (håll ihop med nästa, och i spalterna en rad som inte bryts). Alla 26 Word-mallar är gröna i riktig Word efter ändringen.

## Kända begränsningar

- I Sand och Ek fortsätter panelen respektive linjen på sida 2 i Word när innehållet går över två sidor, som Kalkstens panel i dag (Word lägger radens minsta höjd också på fortsättningen). I PDF:en slutar de med innehållet.
- Kakels rutnät flyttas helt till sida 2 när det inte ryms, enligt specen; sida 1 kan då få luft i botten.
- Sockel, Ramverk och Kant ritar sockeln, ramen och remsan som fasta element. I förhandsvisningen hamnar de mot fönstrets kant, i filen på varje sida.
