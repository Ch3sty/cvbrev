# Mallsvepets efterarbete, 2026-11-16

Två punkter ur slutrapporten för mallsvepet (live sedan ce8c2bc9).

## 1. /verktyg/cv-mallar i sitemapen fast canonical pekade på /cv-mallar

SEO-strategens beslut, med underlag ur Search Console (servicekontot, data till 2026-11-14):

| Period | URL | Visningar | Klick | Snittposition |
|---|---|---|---|---|
| 90 dagar | /cv-mallar | 637 | 2 | 28,5 |
| 90 dagar | /verktyg/cv-mallar | 232 | 2 | 70,3 |
| 16 månader | /cv-mallar | 901 | 2 | 29,9 |
| 16 månader | /verktyg/cv-mallar | 4 396 | 12 | 50,2 |

"cv mallar" 90 dagar: /cv-mallar 119 visningar pos 26,2, /verktyg/cv-mallar 53 visningar pos 74,6. "cv mall": 83 visningar pos 31,7 mot 2. URL-inspektionen: Google valde /verktyg/cv-mallar som sin egen canonical trots vår tagg, så sidorna konkurrerade.

Beslut: /cv-mallar är kanonisk. /verktyg/cv-mallar 308:ar dit (next.config.ts, frågesträngen följer med) och är struken ur sitemapen. Innehållet med SEO-värde flyttade först, ordagrant: Word-avsnittet med ankaret #word (artiklarna om Word-mallar länkar dit), "Så fungerar det" med HowTo, "Mer än en snygg layout", Product-listan (ItemList, en Product per mall) och de fem unika FAQ-frågorna. Inloggade skickas till /dashboard/cv-mallar som förut. Alla interna länkar (meny, startsida, Funktioner, reklamkort, 17 artiklar, 25 brevexempel, yrkessidornas slut-CTA) pekar på /cv-mallar. I cv-mall-pdf-gratis togs den dubbla länken i samma stycke bort (texten orörd), och vad-ar-ett-cv sa "tre av dem är gratis", nu två.

SEO-diff mot live, 53 sidor: **Fel 0**. Före: docs/qa/seo-diff/cv-mallar-kanonisk-fore-live.json, efter: docs/qa/seo-diff/cv-mallar-kanonisk-efter.json, rapport: docs/qa/seo-diff/cv-mallar-kanonisk-diff.md. Undantagen daterade i scripts/seo-baslinje/cv-mallar-kanonisk-2026-11-16-undantag.json. /cv-mallar: ord i main 2849 till 3895, h1, title och canonical oförändrade, description nämner Word (156 tecken).

Avläsning 2026-12-14 (SEO-strategen): /verktyg/cv-mallar ur indexet, "cv mallar" och "cv mall" samlade på /cv-mallar.

## 2. Riktig sidindelning i helskärmen (skissen V4b)

Helskärmen visar den riktiga PDF:en: CV:t går genom nedladdningens kedja på servern (renderaMallPdf med createSwedishCVPDF, flyttad till src/lib/cv/mallar/pdf-kedja.ts och delad med generate-formatted) och varje sida ritas med pdf.js till webp (src/lib/cv/mallar/sidbilder.ts). Bilder, aldrig filen, så att helskärmen inte blir en väg runt kontot och spärrarna. Tre rutter med samma indata som arket: /api/public/exempel/cv/sidor (CDN-cachad), /api/public/cv/sidor (100 per adress och dygn, fotoadresser når aldrig Chrome) och /api/cv/sidor (inloggad, samma tolkning som preview-html via src/lib/cv/forbered-inloggat-cv.ts). Arken staplas med 12 px glipa och "Sida i av n" under varje ark. Medan sidorna hämtas visas CV:t i ett stycke tonat till 80 % med en statusbricka nederst (UX-designerns krav, arket står stilla, CLS 0). Vanliga vyn har kvar linjen "Sidan 2 börjar här". Gäller mallsidan, provsidan, Mina mallar och byggaren (galleriet på /verktyg/cv-mallar finns inte längre).

Jämförelse mot den nedladdade filen (scripts/klicktest-helskarm-sidor.ts jamfor, Premium-testkonto, filen ur /api/cv/generate-formatted, foto på): 32 av 32, samma sidantal och varje sida pixel för pixel lika filens.

| Mall | Längd | Sidor i filen | Sidor i helskärmen | Största avvikelse per sida | Sida 1 slutar i filen med |
|---|---|---|---|---|---|
| linne | kort | 1 | 1 | 0.00 % | en sida |
| linne | normalt | 2 | 2 | 0.00 % | "strategiskt tänkande" / "2011 – 2016" |
| linne | langt | 3 | 3 | 0.00 % | "• samordnade budgetprocessen för hela " / "2015 – 2020" |
| linne | ensida | 1 | 1 | 0.00 % | en sida |
| bjork | kort | 1 | 1 | 0.00 % | en sida |
| bjork | normalt | 2 | 2 | 0.00 % | "strategiskt tänkande" / "2011 – 2016" |
| bjork | langt | 3 | 3 | 0.00 % | "• föreläste om ekonomistyrning för che" / "2011 – 2015" |
| bjork | ensida | 1 | 1 | 0.00 % | en sida |
| kalksten | kort | 1 | 1 | 0.00 % | en sida |
| kalksten | normalt | 1 | 1 | 0.00 % | en sida |
| kalksten | langt | 3 | 3 | 0.00 % | "tyska" / "2015 – 2020" |
| kalksten | ensida | 1 | 1 | 0.00 % | en sida |
| granit | kort | 1 | 1 | 0.00 % | en sida |
| granit | normalt | 1 | 1 | 0.00 % | en sida |
| granit | langt | 3 | 3 | 0.00 % | "• samordnade budgetprocessen för hela " / "tyska" |
| granit | ensida | 1 | 1 | 0.00 % | en sida |
| stal | kort | 1 | 1 | 0.00 % | en sida |
| stal | normalt | 1 | 1 | 0.00 % | en sida |
| stal | langt | 3 | 3 | 0.00 % | "• tog fram beslutsunderlag inför etabl" / "tyska" |
| stal | ensida | 1 | 1 | 0.00 % | en sida |
| kolumn | kort | 1 | 1 | 0.00 % | en sida |
| kolumn | normalt | 2 | 2 | 0.00 % | "förhandling och konflikthantering, str" / "2011 – 2016" |
| kolumn | langt | 3 | 3 | 0.00 % | "• samordnade budgetprocessen för hela " / "2015 – 2020" |
| kolumn | ensida | 1 | 1 | 0.00 % | en sida |
| arsring | kort | 1 | 1 | 0.00 % | en sida |
| arsring | normalt | 2 | 2 | 0.00 % | "konflikthantering, strategiskt tänkand" / "-" |
| arsring | langt | 3 | 3 | 0.00 % | "• samordnade budgetprocessen för hela " / "-" |
| arsring | ensida | 1 | 1 | 0.00 % | en sida |
| horisont | kort | 1 | 1 | 0.00 % | en sida |
| horisont | normalt | 2 | 2 | 0.00 % | "konflikthantering, strategiskt tänkand" / "2011 – 2016" |
| horisont | langt | 3 | 3 | 0.00 % | "• samordnade budgetprocessen för hela " / "2015 – 2020" |
| horisont | ensida | 1 | 1 | 0.00 % | en sida |

Klicktest i riktig Chrome, Pixel 7 och 1280, ljust och mörkt, utloggad (mallsidans exempel, uppladdat långt CV, provsidan i Stål) och inloggad (Mina mallar i Kalksten mot filens sidantal, byggarens steg 7): **196 av 196**. UX-designern godkände efter två ändringar (brickan som snackbar nederst, tonen 80 %).

Öppet ägarbeslut (UX-designern): vanliga vyn visar initialen i en tom fotoplats, filen och helskärmen gör det inte (initialens ruta flyttar brytningarna, Granit: Språk hamnar på sida 2). Alternativ A: vanliga vyn släpper initialen (rekommenderas, filen är sanningen). Alternativ B: filen får initialen, med flyttade brytningar.

## Grinden

| Kontroll | Resultat |
|---|---|
| tsc | 0 fel |
| vitest src/lib/cv, src/components, src/app/api/cv, nya /api/public/cv/sidor | 555 av 555 (en träff i template-count på en kommentar med datum rättad) |
| npm run build | grön |
| npm run test:ats | 160 av 160 |
| SEO-diff mot live, 53 sidor | Fel 0 |
| perf-publikt Pixel 7 | /cv-mallar 524, /cv-mallar/prova 744, /cv-mallar/underskoterska 780 ms, CLS 0 |
| perf-publikt dator | /cv-mallar 236, /cv-mallar/prova 196 ms |
| perf-inloggat, 5 körningar | /dashboard/cv-mallar 1492 ms, med samtycke 1276 och vald mall 1288, skapa-cv 828, CLS 0. Inom 1,5 s men högre än svepets 824 ms; kontot hade det långa CV:t (tre sidor) i stället för det normala. |
| Klicktest helskärmen | 196 av 196 |

Testkontot qa-helskarm-premium-1794818562984 (eba9e0cc-9d13-4b8f-a9b4-0d8c0e6d4735) raderat per id med sina rader.
