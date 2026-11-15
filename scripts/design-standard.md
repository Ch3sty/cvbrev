# Designstandard: artikelbilder jobbcoach.ai, "På bordet"

Gäller från 15 november 2026 för alla artikelbilder, nya som befintliga. Ersätter den orange till rosa diagonalen med rubrik i bilden. Facit för designen är `docs/design/koncept-artikelbilder-2026-11-14.md` (godkänt av ägaren) och skissen `docs/design/skiss-artikelbilder-2026-11-14.html`. Bilden ritas av ett skript, aldrig för hand.

## Idé

Bilden lägger det man får efter klicket på bordet: en riktig uppgift ur testet, profilen i CV:t, inledningen i brevet, intervjufrågan med svarets delar, lönesamtalet i siffror, ett samtal med Jobbcoachen om artikelns egen fråga. Bordet har ämnets färg, samma som sidan bilden står på. Den enda texten utanför korten är en etikett med ämnet i högst fyra ord.

## Så gör du en bild

1. Skriv underlaget `docs/qa/artikelbilder/underlag/<slug>.json`: `{ "alt": "...", "fyll": { ... } }`. Fälten per mall står i `scripts/artikelbild/mall.mjs`; de godkända exemplen ligger i samma mapp (`cv-profil-sammanfattning`, `inleda-personligt-brev`, `kompetensbaserad-intervju-star-metoden`, `loneforhandling`, `angest-infor-nytt-jobb`, `tester-hos-myndigheter`, `alva-labs-logiktest`).
2. Kör `npx tsx scripts/artikelbild/artikelbild.ts <slug>`. Skriptet väljer mall och färg ur artikelns taggar, ritar, mäter i Chrome och skriver `public/images/artiklar/<slug>-v2.webp` bara när allt är grönt. Titta på QA-bilden (sökvägen skrivs ut) innan du går vidare. `--ark` ger kontaktark per mall.
3. I artikeln: `image: "/images/artiklar/<slug>-v2.webp"` och `imageAlt: "<alt>"` i frontmatter. Står `<CustomImage>` först i texten ska den peka på samma fil med samma alt (hjälten lyfter den). `node scripts/artikelbild/byt-artiklar.mjs <slug>` gör båda.
4. En uppgift i en testbild används av högst en artikel. Registret är `docs/qa/artikelbilder/uppgifter.json` (`npx tsx scripts/artikelbild/artikelbild.ts --register`). Nya uppgifter byggs av `scripts/artikelbild/gen-uppgifter.mjs` med testernas generatorer; frågor ur de skarpa bankerna används aldrig.

## Mallarna (väljs ur koden, aldrig för hand)

| Kluster (`getCtaVariantForTags`) | Mall | Huvudkort | Litet kort |
|---|---|---|---|
| test | Tester | Artikelns egen testtyp: matris, figurserie, talserie, spatial, ordförråd, textuppgift eller resultatskala, ritad med testernas ritare. Luckan som i produkten | Tre citat med bock, eller tid och skala |
| cv | CV | CV-arket med en hel mening ur artikelns exempel inringad i orange | Tre citat med bock |
| letter | Personligt brev | Brevet med första meningen ur artikelns inledning inringad | Tre citat med bock |
| interview | Intervju | Frågekortet med svarets delar som staplar, en i orange | Ett tal i en hel ring, eller tre citat |
| career med lönetagg (`arLonArtikel`) | Lön | Lönekortet: två staplar och skillnaden i stort | Ett tal med rubrik |
| career övriga, generic | Karriär | Jobbcoachen: en FAQ-fråga och första meningen i svaret | Tre citat med bock |

## Fasta regler (skriptet stoppar annars)

- 1536 × 1024, webp kvalitet 82 med `smartSubsample`, högst 120 kB. Inga gradienter, filter eller inbäddade bilder.
- Platt botten i ämnets ljusa färg, en ljusare skiva bakom huvudkortet, vita raka kort med platt förskjuten skugga. Bara det tomma arket bakom huvudkortet och figuruppgifterna lutar; text står alltid rakt.
- Orange på exakt en sak: det artikeln handlar om.
- Etiketten: 2 till 4 ord, högst 26 tecken, 64 px, ämnets mörka färg. Ingen rubrik, ingen undertext, ingen webbadress, ingen logotyp.
- Läsrader minst 28 px, små versala etiketter och axeltal minst 20 px. Varje rad mäts i Chrome med de riktiga typsnitten (Schibsted Grotesk och Inter, inbäddade) och har minst 24 px luft till sin ruta eller sitt kort.
- Allt ifyllt står ordagrant i artikeln, eller bär en `kalla`-rad som gör det. Mallens fasta ord och de fiktiva personerna undantas.
- Inga myndighetsnamn. Leverantörsnamn bara i etiketten, när namnet står i artikelns title och SEO-strategen gett ett undantag (`undantag: { av, datum, skal }`).
- Inga priser, kampanjord, löften eller betyg. Å, ä och ö bevarade.

## Alt-texten

8 till 15 ord, beskriver motivet, artikelns sökord en gång naturligt. Aldrig "bild av", aldrig titeln, inga citattecken eller tankstreck, inga myndighetsnamn. Uppgifterna är våra: "i samma format som Alva Labs logiktest", aldrig "ur" eller "från" en leverantör. Skrivs i `imageAlt` och i den första `<CustomImage>` när bilden står först.

## Filnamn

Ny bild får nytt namn, `<slug>-v2.webp` (nästa version `-v3`), så att delningar och sök inte visar gammalt och nytt om vartannat. Gamla filer ligger kvar i `public/` så att cachade länkar inte ger 404. Vid byte på en publicerad artikel: lägg sidan i `scripts/seo-baslinje/artikelbilder-v2-<datum>-undantag.json` (nyckeln `BILD_BYTT`) så att SEO-diffen tillåter bytet och bara det.
