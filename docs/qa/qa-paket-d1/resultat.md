# QA D1: prissidan, spårvalet, köpsteget och kontosidan

Klicktest i riktig Chrome (puppeteer-core), produktionsbygge i `.next-d1` på port 3108, 2026-09-22. Pixel 7 (412 × 915, 2x) och desktop 1280 × 900. Skript: `scripts/qa-paket-d1.mjs`, konton via `scripts/qa-paket-d1-konton.mjs` (skapade och raderade i samma omgång). Resultat: 62 kontroller, 0 fel (`resultat.json`).

## Skärmdumpar

| Nr | Vad | Konto |
|---|---|---|
| 01 | /priser desktop, hero | utloggad |
| 02 | /priser desktop, hela sidan | utloggad |
| 03 | /registrera?paket=cv_week efter "Börja CV-veckan" | utloggad |
| 04 | /priser Pixel 7, toppen | utloggad |
| 05 | /priser Pixel 7, hela sidan | utloggad |
| 06 | Spårvalet 1.1, CV-veckan förvald | gratis |
| 07 | Spårvalet 1.1, Allt valt | gratis |
| 08, 09 | Köpsteget 1.2 CV-veckan, topp och hela | gratis |
| 10 | Köpsteget 1.2 med samtycke kryssat, knappen öppen | gratis |
| 11 | Köpsteget 1.2 efter byte till Allt-månaden | gratis |
| 12 | Köpsteget 1.2 Testveckan, "Första steget: matrislogik, grundnivå" | gratis |
| 13, 14 | Kontosidan gratis, Pixel 7 | gratis |
| 15 | Kontosidan gratis, desktop, sidomenyn "Profil och prenumeration" | gratis |
| 16 | Profilmenyn med "Köp eller byt paket" | gratis |
| 17, 18 | Spårvalet och köpsteget på desktop | gratis |
| 19, 20, 21 | Kontosidan CV-veckan, Pixel 7 och desktop | cv |
| 22 | Köpsteget för löpande kund, dagläget spärrat | cv |
| 23, 24, 26 | Kontosidan Allt-veckan, Pixel 7 och desktop | allt |
| 25 | Kontosidan Allt, månad vald, "Byt till Allt-månaden" | allt |

## Sida vid sida mot specen

**Sektion 1, desktop.** Hero med eyebrow, H1 i Schibsted Grotesk 800 på 60 px, ingress med fetad mening, tre löften, hero-scenen med tråd, bockar och "Poäng 74". "Tre paket" med tre kort, Allt i ink-1 med etikett, Rekommenderas, längdval 49/99/149/299. Gratisraden streckad med papperet. Fem funktionskort med scener, steg och piller, testkortet brett. Hjälpredan i tre kort. Förtroendekorten med klick, lås och kr. Tabellen med ord och färgade kolumnhuvuden. FAQ i två kolumner, första öppen. Stämmer.

**Sektion 2, vänstra telefonen.** Kortare ingress, scenen under texten, eyebrow "Tre paket, välj det som matchar var du är", numrerade kort "Paket 1 av 3", tre rader per spårkort utan etikett, Allt med sin etikett och tre rader, ankarraden under. Stämmer.

**Sektion 2, mittersta telefonen.** "Vad ska du göra den här veckan?", tre kort med scen på insunken platta, värderubrik, fyra "du får"-rader, prisrad, Allt mörkt med Rekommenderas. Primär "Fortsätt med CV-veckan", sekundär "Börja gratis i stället", fotnot. Stämmer.

**Sektion 2, högra telefonen.** "CV-veckan, från i kväll", kvittot med fyra rader, Förnyas/Uppsägning/Ångerrätt, "Första steget: ladda upp CV:t" (Test: "matrislogik, grundnivå"), "Vill du ha allt i stället?" med längdvalet, samtyckestexten, "Till betalning, 79 kr" spärrad tills rutan är kryssad, "Kortbetalning via Stripe. Kvitto på mejl." Stämmer.

## Avvikelser mot specen

1. Spacing och radier följer designsystemet (12 px-radie, 4/8/12/16/24-steg) i stället för specens 16 px och 18/22/28 px.
2. "Ingår inte" i tabellen står i ink-3 i stället för kant-stark, för AA-kontrast.
3. Ingressen under "Allt är öppet från första minuten" talar om hjälpredan Kom igång i stället för veckoprogrammet, och FAQ-svaret säger "dagen innan" i stället för "dag 7".
4. Flödets topprad är FlowShell (tillbaka, titel "Kom igång", 1 / 2, kryss) i stället för specens "✕ · Steg 1 av 2". Stegetiketten står i stället överst i innehållet.
5. Kortens knapp visar pil från Lucide (ArrowRight) i stället för tecknet →.
6. Cookie-bannern kan ligga över samtyckesrutan i köpsteget innan besökaren svarat på den. Befintligt beteende i alla flöden.

Övriga frågor och förslag står under "D1 frågor" i docs/bygg-noter-paket.md.
