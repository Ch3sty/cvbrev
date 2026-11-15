# Granskning av artikelbilderna "På bordet" (15 november 2026)

155 bilder, en per artikel, ritade av `scripts/artikelbild/artikelbild.ts` ur underlaget i `underlag/`. Kontaktark och skärmdumpar ligger utanför git.

## Art-director, varv 1

Mallen håller: bottnen, högen av kort, etiketten och ljusskivan ger 155 bilder som uppenbart hör ihop utan logotyp, och i 360 px på både mörk och ljus botten läses ämnet i varje bild. Karriär och Lön godkänns utan anmärkning. De nya kortvarianterna i Tester (talserie, ordförråd, spatial, figurserie, textuppgift, påstående, stanine) och intervjukorten med artikelns egna delar följer konceptet och ser ut som produkten.

Det som underkänns är inte form utan sanning i kortet: i CV-mallen stod PROFIL över 43 ringar men bara 9 var profiler. Rättelsen är en ifyllbar sektion i CV-arket (ERFARENHET, KOMPETENSER, UTBILDNING, SPRÅK, INTRESSEN, REFERENSER) och riktiga CV-rader där ringen bar ett råd. Samma princip fällde tre brevbilder där ringen var ett råd och två intervjukort där chippen INTERVJUFRÅGA satt på en FAQ eller en avhuggen fråga. I Tester var bild-m-08 och bild-m-09 samma motiv i två artiklar, två etiketter var sökord i stället för användarens ord, och korten med påstående och talserie behövde mallens minsta höjd 440 px.

## SEO-strategen, varv 1

GODKÄND med villkor. Alla 155 artiklar har nytt filnamn `<slug>-v2.webp` i 1536 × 1024 och högst 54 kB, och `imageAlt` och första CustomImage stämmer. De gamla filerna ligger kvar. `max-image-preview:large` i generateMetadata följer briefens punkt 9 och skriver inte över något noindex. Tio alt-texter skrivs om: fem för att de påstod koppling till leverantör eller myndighet, fem för att huvudsökordet saknades. Inga fler leverantörsnamn i etiketterna: undantaget gäller bara Alva, och Matrigma, Cubiks och Aon står som testtyp. SEO-diffens BILD_BYTT är tillräckligt smal för og:image, JSON-LD och robots; den kompletterades med en kontroll av att artikelbilden syns med ny src och rätt alt på varje sida, eftersom baslinjens första bild är författarens porträtt. Knappen "Fråga Jobbcoachen" i karriärhjälten har ingen SEO-invändning. Kravet är Fel 0 mot live på alla 155 sidor.

## Art-director, varv 2

Tester och CV godkända utan anmärkning, Personligt brev och Intervju godkända med varsitt villkor, båda gjorda före push: personligt-brev-layout har avslutningen inringad sist i brevet (`lage: "avslut"`), och frågekortets chip är nu INTERVJUFRÅGA, DIN FRÅGA eller STAR så att läsarens egen fråga inte kallas intervjufråga (fem kort). hitta-ratt-karriarvag har chippen DRIVKRAFT ur artikelns egen tabell. arbetsintervju-guide och strukturerad-intervju går live med artikelns egen formulering av beteendefrågan.

Sex artiklar saknar materialet (ingen CV-rad respektive brevrad i texten) och behåller den gamla bilden tills artikeln har det: bild-i-cv-ja-eller-nej, europass-cv, korrekturlasa-cv, ladda-upp-cv-linkedin, cv-och-personligt-brev och ai-rekrytering-sverige. Deras underlag ligger i `vantar/`. De två sista hör i CV-mallen med sina egna CV-rader den dag taggarna ses över.

## Resultat

149 bilder live, 149 utan valideringsfel, 26 till 54 kB (snitt 40), minsta luft 24 px. Uppgiftsregistret `uppgifter.json` har 56 uppgifter utan dubbletter.
