# Beslut: e-postbannern, cookie-samtycket och självhostade typsnitt

Art-director, 2026-10-12. Gäller skalet globalt. Underlag: perf-mätning Pixel 7 strypt, CLS 0,048 på hemvyn och testsidorna, LCP 2,1 s mot 0,8 s för nya besökare.

Princip för alla tre: det som ska synas i första bilden står i server-HTML:en med sin slutliga storlek och plats. Ingenting reserverar yta "för säkerhets skull" och ingenting klonas in senare som kan bli sidans största element.

## 1. E-postverifieringsbannern

**Beslut: servern avgör, klienten gissar aldrig. Platshållaren tas bort.**

- `src/app/dashboard/layout.tsx` har redan `user` och `initialSummary` på servern. Lägg `emailVerified` (profilens `email_verified_at`) i `DashboardSummary` och rendera `EmailVerificationBanner` i `DashboardShell` bara när servern säger overifierad. Är kontot bekräftat finns bannern inte i HTML:en. Då finns ingen 44 px-rad som kan falla ihop, och `answerPending`-grenen med `h-11`-platshållaren stryks helt.
- Avfärdandet flyttar från localStorage till en cookie (`jc_email_banner_dismissed`, 24 h, SameSite=Lax). Då vet servern även det vid första målningen, och en avfärdad banner renderas aldrig. Klickar användaren Stäng tas raden bort direkt; ett skifte inom 500 ms efter klick räknas inte i CLS, så det behöver ingen särbehandling.
- Form och plats är oförändrade: samma rad som StatusRow, 44 px, överst i innehållskolumnen under toppraden, `bg-vagg-2` med hårlinje. Inte överlagd: en overifierad ska se den som en del av väggen, inte som en pop-up, och eftersom den nu står i server-HTML:en från början skiftar den inget.
- Inte i kontomenyn och inte i Kom igång. Där hade den gömt sig för just de som behöver den, och Kom igång visas inte för alla.

Acceptans: CLS 0 på hemvyn och testsidorna för bekräftat konto, bannern synlig i första skärmdumpen för overifierat konto, Pixel 7 och dator.

## 2. Cookie-samtycket

**Beslut: bannern står i första bilden, kompakt, med text som aldrig kan bli sidans största. Klonandet vid idle avskaffas.**

- Rendera `#jc-samtycke` direkt i body i server-HTML:en i stället för i `<template>`. Skriptet behåller cookie-logiken men gör bara två saker: tar bort elementet om `cvBrevCookieConsent` redan finns (innan första målningen, skriptet ligger kvar inline direkt efter markeringen) och sparar svaret vid klick. Ett element som målas i första bilden får LCP-tid lika med första målningen och kan inte flytta LCP till 2,1 s.
- Positionen får bara bero på sådant servern vet. Dagens offset-regler i `globals.css` som läser `html:has([data-publikt-flode])` fungerar redan från server-HTML. Reglerna för `data-flow-active` och `data-flow-dorrar` sätts idag vid hydrering; flytta attributet till det serverrenderade `<html>`/`<body>` (rutten är känd på servern, FLOW_ROUTES och TESTFLODE är statiska mönster) så bannern står på rätt höjd från start. Fixed-element som flyttar sig efter första bilden är fortfarande förbjudet.
- Form, mobil 360: två rader, fast höjd 94 px plus safe-area. Rad 1: en enda `<p>`, 12 px/18 px, `--ink-2`, "Vi använder cookies för att göra tjänsten bättre. Läs mer" med Läs mer som understruken länk i `--ink-1`. Max två rader på 320 px textbredd. Rubriken "Vi använder cookies" (13 px 600) stryks; den var den största textytan i bannern och sa samma sak som texten. Rad 2: två knappar, lika breda (flex 1 1 0), 44 px höga, 14 px 600, 8 px radie. Avvisa: `--panel` med 1 px `--kant-stark` och `--ink-1`-text. Acceptera: fylld `--ink-1` med vit text. Lika stora, lika läsbara, samma höjd. Ingen gradient, ingen ikon.
- Dator (≥ 640 px): en rad, fast höjd 56 px. Text till vänster (max-width 560 px), knapparna till höger med egen bredd (min 120 px). Samma typografi.
- Yta: panel (`--panel`), hårlinje överst (`--kant`), svävande skugga enligt §12 i designsystemet. Ljust och mörkt följer tokens som idag, inga nya färger.
- Regel som gör beslutet mätbart: ingen textbärande nod i bannern får ha större målad yta än sidans h1 på 360 px. Med 12 px enradstext och 44 px-knappar är det uppfyllt på alla publika sidor; verifiera med `web-vitals` attribution att LCP-elementet är hero-rubriken, inte `#jc-samtycke`.
- Samtyckesfunktionen består oförändrad: samma cookie, samma 180 dygn, samma GTM-uppdatering, Avvisa och Acceptera lika synliga och lika stora. Under `/admin` renderas den inte alls.

Acceptans: LCP-elementet är sidans rubrik på startsidan, /priser och en artikelsida för ny besökare, CLS 0, skärmdump 360 och dator i ljust och mörkt.

## 3. Självhostade typsnitt

**Beslut: `next/font/local`, variabla woff2 i `src/assets/fonts`, identiskt utseende.**

- **Inter:** `InterVariable.woff2`, latin-subset (Google-subsetet `latin` räcker: å, ä, ö ligger i grundlatin). Deklarera `weight: '100 900'`, `style: 'normal'`. Tailwinds `font-medium/semibold/bold` används på över 600 ställen, så en variabel fil är billigare än fyra statiska. Ingen kursiv behövs; vi använder inte italic i produkten. Egenskaper som idag: `display: 'swap'`, `adjustFontFallback: 'Arial'`. Familjenamnet ska fortsätta vara `Inter` så att SVG:er och OG-bilder som skriver `Inter` i `fontFamily` inte byter snitt.
- **Schibsted Grotesk:** `SchibstedGrotesk-Variable.woff2` (wght 400 till 900), latin-subset, `weight: '400 900'`, `variable: '--font-display'`, `display: 'swap'`, `adjustFontFallback: 'Arial'`. Används i 600, 700 och 800; variabel fil ger exakt samma glyfer som Google serverade (Google levererar också variabelsnittet). OG-rutten `rakna-ut` behåller sina egna TTF-filer, de rör inte webbsidan.
- Fallback-namnet måste förbli `Schibsted Grotesk Fallback`, annars tappar `globals.css` rad 1787 till 1814 sin viktjustering och rubrikerna hoppar vid intoning. Kontrollera det genererade namnet efter bytet; byt i CSS:en om Next döper det annorlunda.
- Ingen `preload` utöver Nexts standard (den förladdar bara de subsets som deklareras). Inga fler vikter, inga fler familjer.

Acceptans: pixeldiff av /priser-hero (Schibsted 800), startsidans h1 och en knapp i Inter 600 före och efter, identiskt utseende på Pixel 7 och dator. Byggd deploy utan nätverkshämtning av typsnitt. CLS 0 på de sidor som tidigare mätte skift av typsnittsbyte.

## Ordning

1. Typsnitten (berör alla sidor och deployen).
2. Cookie-samtycket (nya besökare, LCP).
3. E-postbannern (inloggat, CLS).

Varje steg mäts med `scripts/perf-inloggat.ts` respektive Lighthouse Pixel 7 strypt innan nästa påbörjas.
