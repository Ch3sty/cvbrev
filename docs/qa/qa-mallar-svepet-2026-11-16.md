# QA: mallsvepet, hela grinden (2026-11-16)

Byggagent C, grenen `feat/mallar-komponenter` rebasad på `feat/mallar` 12bfefa1 (alla 20 mallar godkända av art-director, `MallKort.kortUtanFoto` finns och används i merförsäljningen). Allt kördes en gång på resultatet, mot ett produktionsbygge (`next start`) på port 8320. Inget är pushat och inga migreringar är körda.

## Resultat per grind

| Grind | Resultat |
|---|---|
| tsc | Rent. |
| vitest, hela sviten | 2480 gröna, 13 hoppade, 3 röda. De tre röda är de kända på main (logicTestV7/kandidater, admin/fragor ×2). "Gratismallar"-testerna läser katalogen och är gröna. |
| `npm run build` | Grönt (två gånger: efter rebasen och efter SEO-rättelsen). |
| `npm run test:ats` | 160 av 160 gröna, inga mallar med fel. |
| SEO-diff mot live, 97 sidor | **Fel 0**. Före: `docs/qa/seo-diff/mallar-2026-12-fore-live.json`, efter: `docs/qa/seo-diff/mallar-svepet-efter.json`, rapport: `docs/qa/seo-diff/mallar-svepet-diff.md`. |
| perf-publikt, Pixel 7, 3 körningar | /verktyg/cv-mallar 588 ms, /cv-mallar 588 ms, /cv-mallar/prova 532 ms, /cv-mallar/underskoterska 544 ms, /artiklar/cv-mall-gratis-guide 612 ms. CLS 0 på alla, 5 av 5 under 0,7 s. |
| perf-inloggat, /dashboard/cv-mallar, 5 körningar | 824 ms och med vald mall 656 ms, CLS 0, 0 rundturer, 2 av 2 inom 1,5 s. En första körning med 3 körningar gav 2692 ms för "vald mall" (kall server direkt efter start); omkörningen med 5 gav 656. |
| Klicktest i riktig Chrome, nya konton | **117 OK, 0 FEL** (`scripts/klicktest-mallar-komponenter.ts`). |
| /BaseFont i nedladdad PDF | Gelasio-Regular, Carlito-Regular, Carlito-Bold, alla inbäddade (Linne). |

## SEO-diffen

SEO-strategen (seo-content-strategist-se) granskade skillnaderna som tillkommit efter komponentgranskningens rättelser mot D:s godkända ögonblicksbild:

1. **74 yrkessidor:** h2 "Se ditt <yrke>-CV i olika designer", ingressen, ankaret #preview och mallkorten är borta (granskningen B5). Strategen krävde först att schemabilden skulle synas på sidan med alt-text; nu ligger yrkets gratismall som bild under dokumentets iframe (`/mallar/v2/<id>-stor.webp`, alt "Linne CV-mall för läkare (gratis)", samma bild som Product-schemat). Därefter godkänd. 74 daterade poster i `RUBRIK_BORTA`. Ordmängden ligger över live på alla, lägst +2,1 %.
2. **/verktyg/cv-mallar och /cv-mallar:** grupprubrikerna och 17 mallbilder ligger bakom "Visa alla 20 mallar" (P5). De fanns aldrig live. Godkänd.
3. **/cv-mallar:** ingressens sista mening (godkänd tidigare), chipraden och talraden flyttade under arbetsytan. Godkänd.

Skälen står daterade i `scripts/seo-baslinje/mallar-2026-12-undantag.json` (`RUBRIK_BORTA` och `_svepet_2026_11_16`).

## Klicktestet

Pixel 7 (412 × 915, 2x) och 1280 × 900, ljust och mörkt, för varje roll. Skärmdump per steg i scratchpad (aldrig i git).

- **Anonymt:** generate-formatted utan konto svarar 401.
- **Publikt (artikel, yrkessida):** artikelkomponenten byter namnet i exempel-CV:t och "Fortsätt med ditt CV" bär valet. Yrkessidan har dokumentet som hjälte, H1 "CV-mall för Undersköterska", titeln förifylld och yrkets rubriker ("Klinisk erfarenhet").
- **Utloggad:**
  - Uppladdningen före vecket (y 521 på Pixel 7, 238 på dator). PDF tolkad utan konto. Arket 46 px under sidhuvudet efter uppladdningen, med tipsraden ovanför (avvikelse B1, godtagen av samordnaren).
  - Uppladdningsytan ihopfälld till 48 px. Fasta raden 65 px. Ingen sidled och ingen klippt text.
  - Rubrikarket med 327 px dokument synligt ovanför. Typsnittsarket (överkant 439 px). Färgbytet slår igenom (--accent). Helskärmen. Fotoarket i fotomall. Premiumknappen i två rader, 56 px.
  - Konto i arket och sedan PDF direkt (Pixel 7) eller Word gratis i Linne (dator). Jobbkortet klickbart. Utkastet hämtas en gång (andra anspråket återanvänder raden).
- **Gratis:**
  - Valet i adressen. Fasta raden mot navet vid mitten och slutet (underkant 843 = navets överkant, 900 = vyns botten på dator). Rubrikarket markerar det sparade valet.
  - Premiummall: köpet går direkt till köpsteget med retur och mall. Första PDF:en och finalen.
  - Andra nedladdningen: merförsäljningen med tre bilder om 105 till 112 px, korten lovar inget foto utan foto. Knappen går direkt till köpsteget med vald mall.
- **Premium:**
  - PDF och finalen. Köpreturen (`?ladda=1`) laddar ner filen direkt och tar bort parametern. Word laddas ner.
  - Steg 7 med ifyllt CV: remsan, arket och "Spara och ladda ner PDF". Ett tryck på ett avsnitt går till steget och "Granska CV" tillbaka.

## Avvikelser

- **B1:** arket landar 46 px under sidhuvudet (65 px), inte inom 80 px från vyns topp. Tipsraden ovanför arket går före, enligt samordnarens beslut.
- **V4 b:** riktig paginering i förhandsvisningens HTML är inte byggd. Helskärmen visar ett sammanhängande ark med en linje vid varje A4-höjd.
- **Köpet:** testat fram till köpsteget och med köpreturen simulerad. Ingen betalning gjordes; .env.local har en live-nyckel.
- **perf-inloggat:** den första mätningen efter serverstart låg över budget för "vald mall" (2692 ms); omkörningen låg på 656 ms.

## Testkonton

Skapade med service role (`qa-mallar-<roll>-<tid>@jobbcoach-qa.test`): gratis, premium och två konton från kontoarket. Raderade per id efter räkning: 4 cv_texts, 9 formatted_cv_downloads, 52 user_activities och 4 auth-konton. Inga svep.
