# Brevrummet, slutkontrollen 2026-11-21

Etapp 3 (BYGGSPEC avsnitt 12 D). Gren `feat/brev-rummet-omgang1`, arbetskopia `brev-a`. Skärmdumparna ligger utanför repot: `UNDERLAG\qa\slut\` (UNDERLAG = scratchpad-mappen `brev` i art directorns session).

## Bygget

- `npm run build` (Turbopack) går inte i arbetskopian: "Symlink node_modules is invalid, it points out of the filesystem root". `node_modules` är en länk till huvudrepot och Turbopack godtar ingen länk som pekar utanför projektroten. Det är miljön, inte koden.
- Webpack-vägen (`npx next build --webpack`) kompilerar. Den faller sedan på Nexts typkontroll av rutternas exporter för `src/app/api/jobs/redact/route.ts` (exporterar `FREE_TIER_JOB_LIMIT`), en fil som är oförändrad mot `origin/main`. Turbopack-vägen (den Vercel kör) gör inte den kontrollen på samma sätt. Bygget kördes därför med `typescript.ignoreBuildErrors: true` tillfälligt i `next.config.ts` (återställd efter varje bygge, aldrig commitad). Vår egen `npx tsc --noEmit` är ren.
- Bygget måste köras från en sökväg med versalt `C:\`. Från `c:\` (VS Code-terminalens form) buntade webpack Nexts interna moduler två gånger ("multiple modules with names that only differ in casing") och varje sida kraschade i klienten. Från PowerShell med `C:\` försvann felet (0 sådana varningar).
- Rutterna finns i bygget. `/brev3-kit` ger 404 i produktionsbygget (kontrollerat med curl).

## Vitest

Hela sviten från PowerShell: 300 filer, 3 868 gröna, 1 röd, 13 överhoppade. Den röda är `src/components/session/__tests__/FigurserieTrana.test.tsx` ("svara" var avstängd): grön när den körs ensam, filen är orörd mot main. Den faller under last, inte av oss. Brevrummets tester (`src/components/brev3`, `src/lib/letters`, `src/app/api/letters`, köpreturen, namnkravet): 106 gröna.

## Klicktestet

Riktig Chrome (puppeteer-core, headless) mot produktionsbygget på port 3210, 1440×900 och Pixel 7 (412×915, DPR 2). Konton: `gratis-ny`, `gratis-brev`, `premium`, återställda med `scripts/qa-brev-konton.mjs` före testet. Tre riktiga genereringar (av högst fyra): gratis-ny skriver brevet i Björk, premium skriver om med tonen Självsäker, premium skriver i Sand ur mallväljaren.

Per steg kontrollerat av skriptet: sidledsrullning (ingen), konsolfel (inga), 4xx/5xx från vår server (bara den låtsade 422:an för namnkravet), primär knapp inom synfältet på telefon ("Skriv brevet" 843 till 899 px av 915, "Ladda ner i {mall}" 779 till 831 px). Skärmdumparna är granskade en och en.

| Konto, skärm | Prövat | Utfall |
|---|---|---|
| gratis-ny, 1440 | Dina brev utan brev (ljust, mörkt), jobbets "Skriv brev" (förifyllning), `?cv=`, utkastet efter omladdning, mallväljaren (Premiummall nekas med raden, Björk väljs), namnkravet (422, låtsat svar), skriva på riktigt i Björk, väntan utan Avbryt, uppspelningen, Brevet klart, Lägg till i brevet, Kopiera text, nedladdningsspärren och "Kopiera texten i stället", Markera som sökt, Målgången (ljust, mörkt), tillbaka till Dina brev | Allt fungerar. Brevet skrevs i Björk (mallen följde med `mall_id`). Kravet lades till: 6 av 6. Urklippet har hälsning, stycken och avslut. |
| gratis-ny, Pixel 7 | Dina brev med ett brev, "Byt" i CV-raden, Brevet (kraven), spärren, Målgången, Skriv utan kvot, Mallar med fast rad | Fungerar. Fasta raden ligger mot navet, flikarna står hela. |
| gratis-brev, 1440 | Dina brev (första raden: tre brev plus Skriv nytt brev), mörkt, låst brev (raden, kopiering), låst brev i Mallar (prova Björk), Premiummall provas (Koppar), Mallar mörkt, spärren, Byt brev, Folio i rutnätet, Brevet med saknat krav (ljust, mörkt), veckospärren från Ton och språk, Skriv | Fungerar. |
| gratis-brev, Pixel 7 | Dina brev (ljust, mörkt), Mallar, låst brev, Brevet med saknat krav, veckospärren i Skriv (annonsen kvar efter stängning: 160 tecken) | Fungerar. |
| premium, 1440 | Typsnitt Georgia (sparas, står kvar efter omladdning), PDF (typsnittet Gelasio, Georgias fil, är inbäddat) och Word nedladdade, mallbyte till Kalksten i Mallar ("Brevet står nu i Kalksten"), Skriv om brevet i tonen Självsäker, gammalt brev (Klassisk): öppna, ändra text (flyttas till Koppar, CV:ts mall), mallbyte till Kalksten, PDF nedladdad; Skriv i Sand ur mallväljaren, Titel och företag med kontaktraden, Ta bort brevet (tillbaka till Dina brev), Mallar mörkt | Fungerar. PDF och Word bara prövade lokalt (se nedan). |
| premium, Pixel 7 | Dina brev, Brevet med saknat krav, mörkt, Mallar | Fungerar efter rättningarna av arket (se nedan). |
| Laddvyerna | Klientnavigering med serverns svar fördröjt 4 s, mått före och efter: Dina brev, Mallar, Brevet på 1440 och Pixel 7 | Väggen, panelen, bladet och arket står på samma plats i laddvyn och i den färdiga sidan. Skrivs laddvy gick inte att fånga (rutten kom ur förhämtningen) men delar komponent med Brevet. |

Data som klicktestet ändrade på QA-kontona (kontona är inte raderade): gratis-ny har ett brev (Björk, sökt 21 nov) och veckokvoten är använd. premium: Nordanvind är omskrivet i tonen Självsäker, står i Kalksten med Georgia; det gamla brevet (Tallbacka) är flyttat till det nya formatet och står i Kalksten (testmeningen är bortstädad); ett tredje brev (Sand) skrevs och togs bort.

## Prestanda

`scripts/perf-inloggat.ts` mot produktionsbygget, Pixel 7 med 3x CPU-strypning och LTE, kontot `gratis-brev`. Skriptets brevrutter är uppdaterade (Mallar tillagd, Brevet med flödesbudget, de borttagna stegrutterna strukna).

| Rutt | Mål | Före rättningarna av arket (3 körningar, samtycke) | Slutligt (3 körningar, samtycke) | Slutligt (1 körning, utan samtycke) |
|---|---|---|---|---|
| `/dashboard/mina-brev` | 1,5 s | LCP 1 048 ms, CLS 0 | LCP 936 ms, CLS 0 | LCP 1 256 ms, CLS 0 |
| `/dashboard/mina-brev/mallar` | 2,0 s | LCP 1 164 ms, CLS 0 | LCP 1 048 ms, CLS 0 | LCP 1 088 ms, CLS 0 |
| `/dashboard/mina-brev/<id>` | 2,0 s | LCP 1 184 ms, **CLS 0,003** | LCP 880 ms, CLS 0 | LCP 892 ms, CLS 0 |
| `/dashboard/skapa-brev` | 2,0 s | LCP 740 ms, CLS 0 | LCP 708 ms, CLS 0 | LCP 492 ms, CLS 0 |

Rundturer före första innehåll: 0 på alla fyra.

## Fel jag hittade och rättade

1. **Arkets siffror och platsen för ett saknat krav på fel rad** (Brevet på telefon, premium; samma fel låg bakom art directorns B4-bild). Orsak: React 19 jämför `dangerouslySetInnerHTML` som objekt, och `BrevArk` skapade ett nytt objekt vid varje omritning. Arkets innerHTML sattes då om efter mätningen, krympsteget (`data-steg`) och luften föll bort, och siffrorna och platsen stod kvar från det krympta läget, upp till ett stycke för högt och över text. Rättat: objektet memoreras; arket mäter också om när innehållet byts (MutationObserver), när ett typsnitt laddats och i egna koordinater; styckets sista rad mäts som den synliga nedersta raden. Samma rättning tog bort Brevets CLS 0,003.
2. **Laddvyn för Brevet** stod 4 till 5 px fel (flikraden var en tom ruta med annan höjd). Rättat: laddvyn ritar Brevets flikrad.
3. **Laddvyn för Mallar på telefon** ritade ett rutnät där sidan har en remsa. Rättat.
4. **Bygget kraschade i klienten** när det byggdes från `c:\` (se Bygget). Miljö, inte kod; byggt om från `C:\`.

## Det som inte är sett eller gjort

- **PDF och Word bara prövade lokalt.** Vercel kör en annan Chromium (`@sparticuz/chromium`). Lokalt: PDF med Georgia (Gelasio inbäddad), PDF av det gamla brevet i Kalksten, Word i Kalksten, alla nedladdade och öppnade som filer (typsnitten lästa ur PDF:en, Word-filen inte öppnad i Word).
- **B4, fallet med full sista rad**: koden finns (platsen blir en egen rad med luft under stycket) men inget av testbreven hade ett stycke vars sista rad var full där kravet hamnade, så just det fallet är inte sett i webbläsare.
- **Laddvyn för Dina brev utan brev** är inte sedd (inget konto utan brev fanns efter testet; gratis-ny skrev sitt brev). Laddvyn för Skriv gick inte att fånga (rutten kom ur förhämtningen); den delar komponent med Brevets laddvy, som är sedd.
- **Köpreturen till Brevet** (`?ladda=1&format=`) är inte prövad med ett riktigt köp. Koden är densamma som Mallar använder.
- **Hydreringsvarningen från `CookieBanner`** (B8): `CookieBanner.tsx`, rotlayouten och `client-layout.tsx` är oförändrade mot `origin/main`, och varningen gäller bannerns serverrenderade HTML mot klientens tomma, alltså inte brevrummet. Inte rörd. Produktionsbygget loggade inga konsolfel i något pass.
- Skärmdumparna jämfördes mot skissen för de rättade punkterna, inte en ny full genomgång av alla vyer mot alla skissbilder.
