# Logg utseende 2: andra granskningen av det byggda (2026-11-22)

Grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Art director har tagit det som första granskningen (`logg-utseende.md`) inte såg och det som fortfarande avvek. Ingen befintlig text, rubriknivå, länkadress, metadata eller schema är ändrad. Inget är pushat.

## Före push

1. **Sidan som inte finns har ny text** (se "Ny text utan godkännande"). Förut visades Nexts engelska standardsida. SEO och copy har inte sett lydelsen.
2. **Allmänna artiklar (klustret generic, etiketten Jobbsökning) står i skog**, inte indigo. Jag valde efter etiketten: Jobbsökning hör till Jobbsöket. Vill ägaren ha indigo: byt `generic: 'jobb'` mot `'tran'` i `src/components/publikt/innehall/artikel-kluster.ts`.
3. **Alla nio kalkylatorer står i skog**, som navet `/rakna-ut`. Förut var de fem rekryterarkalkylatorerna grafit.
4. **`/exempel` och `/hjalpcenter` har fått dekorbilder i hjälten och korten** (riktiga mallbilder, tom alt). I SEO-avtrycket syns det som att sidornas första bild gått från ingen till en mallbild. Grinden fäller inte på det (regeln gäller artiklar), men SEO bör veta.
5. **Kontot har ingen egen färg publikt.** Stoppet "Profilen" i Kom igång på `/priser` är indigo, småmärket heter fortfarande Konto.
6. Allt under "Före push" i `logg-utseende.md` och `logg-p5b.md` gäller fortfarande, utom punkt 1 och 2 i `logg-utseende.md` (grafiten), som är avgjorda här.
7. `C:\c\Users\...` står kvar från tidigare agenter. Inget av mitt ligger där: SEO-skriptet skriver nu med `C:/`-sökvägar.

## Så gjordes granskningen

- Fyra byggen (`next build --webpack`, 6 GB heap), en server i taget på port 8300, en webbläsare i taget (headless Chrome via `puppeteer-core`). Bara sidladdningar: inga konton, inga AI-anrop, inga provflöden. Det enda formuläret som skickades var registreringens, med tomt fält och med för kort lösenord: valideringen stoppar i webbläsaren före varje anrop.
- Bilderna ligger i `docs/design/publikt-omgang3/bilder-byggt/<namn>-<bredd>-NN.png` (gitignorerad mapp), 68 sidtyper i 375 och 1440, de fem viktigaste också i 412. Sista fotograferingen är gjord på sista bygget.
- Jag har tittat på bilderna som översiktsblad (hela sidan i 30 till 50 procents skala) och klippt ut i full skala där något såg fel ut. Det betyder att uppbyggnad, färg, luft och trasiga ytor är sedda, men att enskilda textrader inte är lästa på bladen.
- Mätningen per sida från första granskningen (sidledsrullning, tryckytor, kontrast, liten text) har fått tre nya kontroller: ytor som är beige eller svarta, text som klipps och element som sticker ut till höger.
- Helsidesbilderna togs först med knapprader som fäster i fönstrets nederkant ritade mitt i sidan. Det var fotograferingen, inte sidan: kontrollerat i riktigt fönster, och skriptet lägger nu sådana rader i flödet.

## Del 1: grafiten och det beiga

| Vad | Före | Efter | Var |
|---|---|---|---|
| Färgen `neutral` | femte färgen, grafit `#26262C` | finns inte. `Farg` har fyra värden, så typkontrollen fäller varje kvarglömd användning | `v3/farg.ts` |
| Förvalet | `fargForSokvag` gav `neutral`, och sidorna skrev `farg="neutral"` | `FARG_OVRIGT` (indigo) är förvalet i `<Sida>` och i menyns gissning. Sidor utan egen del skriver bara `<Sida>` | `v3/farg.ts`, `v3/Sida.tsx` |
| Grundblocket i CSS | grafitens värden för allt utan färg | indigons värden. Väljarna för `neutral` är borta | `globals.css`, PUBLIKT OMGÅNG 3 |
| `/for-rekryterare`, insikterna, de fem rekryterarkalkylatorerna | grafit | skog | sidornas `Sida`, `KalkylatorSida.tsx`, regeln i `farg.ts` |
| `/hjalpcenter`, `/kontakt`, `/press`, `/karriar`, `/integrationer`, `/exempel`, `/authors/*`, `/artiklar` | grafit | indigo | förvalet |
| Artikelkluster utan egen del (generic) | grafit | skog (Före push 2) | `artikel-kluster.ts` |
| `.pub-rum-neu` (artikellistans hjälte, profilkortet, yrkeskortens etikett) | grafit, hårdkodat | följer färgen den står i | `globals.css` |
| Foten på sidor utan sidfärg (till exempel 404) | `#1A1A1F`, svart | indigons mörkaste ton | `v3/ram.css` |
| Medieön på startsidan | grafit | indigo | `Startsidan.tsx` |
| Formatmärket "PDF · Word" på mallminiatyrerna | svart, 82 procent | sidans mörkaste ton | `v3/v3.css` |
| Tidslinjens steg på `/om-oss`, länkbrickan Räkna ut på `/funktioner`, gruppernas förval och stoppet Profilen på `/priser` | grafit | indigo, skog, indigo, indigo | sidornas filer |
| `--papper-2`, den nedsänkta ytan (fält, spår, signaturer) | `#F4F3F0`, varmgrå | sidans ton: `#F3F4FB` indigo, `#F0F7F6` petrol, `#F9F2F6` plommon, `#F1F6F1` skog | `globals.css` |
| `--golv-skarm`, `--kant-skarm` | `#F4F3F0`, `#E3E1DC` | `--papper-2`, `--kant` | `globals.css` |
| Författarrutan i artiklarna | `--insunken`, varmgrå | sidans ton (`--rum-ton`) | `innehall.css` |
| Provkomponenten i artiklar (`.prov-rum`) | varmgrå kant och nedsänkt yta | indigons | `publikt.css` |
| Streck på ark och blad (CV-arket, brevarket, menyns blad, startflödets ark, exempelbunten) | varmgrå `#DCDAD5`, `#C9C6BF`, `#D8D5CE`, `#E4E1DB`, `#CFC8BC` | svala grå | `v3.css`, `ram.css`, `skapa-brev-start.css`, `brev-exempel.css`, `exempel.css` |
| Rutan "Mer" i megamenyn | `#F4F3F0` | sidans ton | `ram.css` |
| Arkets tokens under `.pub-sida` | varm bläck och varm kant | grundens | `innehall.css` |

Mätningen efter sista bygget, 68 sidtyper: **ingen yta är beige eller svart**, utom en: `div.pub-sida` på `/verktyg/rekryteringstester/prova` har den gamla beiga bottnen (`#EDE8DF`). Den syns inte (sessionsramen täcker hela ytan), och sidan ska inte ha grundens färger, så jag har inte rört den.

Kvar som är mörkt men inte grafit: Premium-öarna och foten står i sidans mörkaste ton (`--vagg-3`, till exempel `#121737` i indigo). Det är skissens Premium. Text är fortfarande bläck (`#1A1A1F`).

## Sida för sida

Domen är ett ord: **håller**, **nära** eller **avviker**.

### Det som inte var sett

| Sida | Vad jag såg | Vad jag rättade | Dom |
|---|---|---|---|
| `/skapa-brev/start` utan parametrar | Följer skissens form: formuläret till vänster, arket i Linne till höger. Knappen blek tills fälten är ifyllda | Inget | håller |
| Mallväljaren ("Byt mall") | 40 mallar, fem filter, vald mall med kopparram, foten med "Använd Linne". I telefonen tre kolumner och knappen i full bredd | Inget | håller |
| `/cv-mallar/word` (stilsida) | Hjälten, lyftet och rutnätet håller. Textavsnitten var bara text på tonad botten, platt. Premium-radens rubrik grå | Texten på papper med klack, stegen som numrerade brickor (samma `ol`), rubriken vit | håller |
| `/cv-mallar/sjukskoterska`, `/cv-mallar/systemutvecklare` | Fotograferade och mätta utan fynd. Inte sedda i bild (samma mall som `/cv-mallar/lakare`, som är sedd) | Inget | nära |
| `/cv-exempel/kategori/vard` | Navets form: brickorna med vald bransch, yrkeskorten, två öar | Inget | håller |
| `/personligt-brev-exempel/kategori/tech` | Samma, med brevparet i slutön | Inget | håller |
| `/personligt-brev-exempel/underskoterska` | Hela sidan sedd på dator: arket, kommentarerna, de numrerade korten, öarna | "Se hela kartan" 44 px (mätningen, på lärarsidan) | håller |
| `/personligt-brev-exempel/larare`, `/saljare` | Fotograferade och mätta. Inte sedda i bild | Tryckytan ovan | nära |
| `/cv-exempel/underskoterska` | Hela sidan sedd på dator: arket på papper, före och efter-korten, slutön med arket | Inget | håller |
| `/cv-exempel/civilingenjor` | Fotograferad och mätt. Inte sedd i bild | Inget | nära |
| `/artiklar` | Hjälten var grafit. Listan, filtren och reklamkortet håller. Siffran i filtren höll 4,47:1 | Indigo, siffran ljusare | håller |
| Artikel, CV (`arbetslivserfarenhet-cv`) | Sedd i telefon hela vägen ned: mallkortet, mallprovet i texten, författarrutan, Premium-ön, Läs vidare, foten | Författarrutan i sidans ton | håller |
| Artikel, brev (`bra-personligt-brev`) | Mallvisaren öppen, bytt till Koppar, i båda bredderna: arket byter, miniatyren får kopparram. Resten av artikeln inte sedd i bild | Inget | nära |
| Artikel, `soka-jobb-via-mail` | Sedd på dator hela vägen: skog, mallkortet, kortet om Sökta tjänster med vägen, gratiskortet | Författarrutan | håller |
| `/kontakt` | Hjälten utan bild, formuläret i lyftet, tre kontaktvägar med färgad kant | Indigo. Hjälten har en bild på dator (ett meddelande och ett svar, dekor) | håller |
| `/press` | Platt: ett kort med fyra rader, två tonade kort, en tonad rad | Ombyggd: märket i hjälten, snabbfakta som lyft kort med fyra stora värden, två kort i petrol och plommon, presskontakten som ö | håller |
| `/karriar` | Platt: två vita kort. Ordet "Karriärmöjligheter" gick ut i kanten i telefonen | Ombyggd: testets ram i hjälten, korten i indigo och skog med ikonplatta, kontaktvägen på tonad platta, rubriken i grundens mindre storlek | håller |
| `/integrationer` | Avvek: ingen vägg, rubriken på golvet, emoji som bilder, klientkomponent med framer-motion | Ombyggd som serverkomponent: hjälte med kopplingsbild, läget som lyft kort, fyra kort i delarnas färger, tre numrerade vinster, förslaget som ö. Inga emoji | håller |
| `/exempel` | Hjältens bild var en liten rund ikon. Resten (tre vägar, populära, branscher, guide, FAQ, slutband) står på äldre komponenter men i grundens färger | Tre riktiga ark i hjälten. Indigo | nära |
| `/for-rekryterare/insikter/kravprofil` | Grafit. Artikelns form håller. Tabellen rullar i sidled i sin egen ruta i telefonen | Skog. Brödsmulan 44 px | håller |
| `/for-rekryterare/insikter` | Grafit | Skog | håller |
| `/authors/helena` | Grafit. Porträttet, brickorna och artikelkorten håller | Indigo | håller |
| `/rakna-ut/vad-kostar-en-anstalld` | Grafit. Kalkylatorn i hjälten håller | Skog. Brödsmulan 44 px | håller |
| `/rakna-ut/traffsakerhet` | **Trasig på dator:** två av fyra val hade fallit ihop till noll bredd, resultatytan slutade mitt i kortet, prickarna gick ut ur ytan och rubriken bröts mitt i ordet. Prickarna och den valda stapeln var mörka på mörkt | Alla fem (se Största rättningarna) | håller |
| `/rakna-ut/uppsagningstid` | Fotograferad och mätt. Inte sedd i bild | Samma regler som ovan | nära |
| `/auth/forgot-password`, `/reset-password`, `/verify-email`, `/error`, `/epost-bytt` | Alla fem i indigo, kortet i skissens form, panelen med brickor på de två första | Inget | håller |
| Registreringens fellägen | Tomt fält: röd ruta med "Skriv en e-postadress...", fältet rödmarkerat. Kort lösenord: "Lösenordet måste vara minst 8 tecken." | Inget | håller |
| Inloggningens felläge | `/login?error=oauth_failed`: röd ruta med rubrik och text. Fel lösenord kräver ett anrop mot produktionen och är inte provat | Inget | håller |
| `/verktyg/rekryteringstester/prova` | Startskärmen i sessionsramens färger, egen topprad utan meny och fot (som skissen och P5b) | Inget | håller |
| Menyn öppen på `/verktyg/cv-analys`, `/verktyg/personligt-brev`, `/verktyg/jobbmatchning` | Menyraden, Premium-raden och rutan Mer tar sidans färg (petrol, plommon, skog). De fyra blocken behåller sina egna. Samma i telefonmenyn | Rutan Mer i sidans ton | håller |
| Sidan som inte finns | Nexts engelska standardsida, vit, med svart fot | Egen sida i grundens skal | håller |
| Hovring och fokus | Start, `/hjalpcenter` och `/cv-mallar`: menyval, Skapa konto, kopparknapp, vit knapp, textlänk, länkbricka, FAQ-rad, fotens länk, mallkort, filterchip, brödsmula. Fokusringen är 3 px: ljus koppar på mörk botten, koppar på ljus. Hovring syns på alla utom textlänkar i ön | Inget | håller |

### De nedre delarna

| Sida | Vad jag såg | Vad jag rättade | Dom |
|---|---|---|---|
| `/funktioner` | Jobbsökets nedre del, länkbrickorna och frågorna följer skissen. Premium-öns rubrik var grå i stället för vit | Rubriken (grunden: rubrik satt som stycke på vägg, ö och Premium) | håller |
| `/personligt-brev-exempel` | Guidebilden "Mall och exempel" var ljus, i skissen mörk plommon. Ön om CV saknade skissens ark | Båda | håller |
| `/verktyg/bli-upptackt` | Kunskapstesterna låg som ett ljust kort under ön, i skissen i ön | Flyttat in i ön (platsen `efter`), glas på väggen | håller |
| `/cv-exempel` | Guiden var en smal spalt med tom yta till höger. Ön om brev utan bild | CV-arket bredvid guiden på dator, ett brevark i ön | håller |
| `/cv-mallar/lakare` | Hela sidan sedd som blad: arbetsytan, mallarna, tipsen, frågorna, öarna | Inget | håller |

### Det som avvek enligt första loggen

| Sida | Vad jag rättade | Dom |
|---|---|---|
| `/hjalpcenter` | Ombyggd: vägen genom jobbsöket i hjälten, tre kort i petrol, plommon och indigo med var sin bild (CV-arket, två brevmallar, kontots två nivåer), ön i skog. Samma ord i samma ordning | håller |
| `/cv-mallar` | Skissens källa har brickan under namnet (`.mall` är ett rutnät med ett barn per rad), inte bredvid. Det byggda blandade: bredvid korta namn, under långa. Nu staplat på alla 40 kort, som skissen. Premium-radens rubrik vit | nära (lyftet visar arbetsytan, medvetet) |
| `/verktyg/rekryteringstester` | Rubriken: 56 px och bredare textspalt på dator ger tre rader (i 1100, 1280 och 1440). I telefonen 38 px på 375 och 40 från 392, och ordet går inte längre ut i kanten | håller |
| `/jobbkartan` | Bäddkoden i ljus text, över 10:1 | nära (kartans små län) |
| `/for-rekryterare` | Skog. Integritetsön var Premiums mörkaste ton med kopparklack: nu sidans vägg med mörk klack, eftersom den inte säljer Premium | håller |
| Artikel med reklam (`matrigma-test`) | Sedd i telefon hela vägen. Författarrutan i sidans ton | håller |
| `/verktyg/personligt-brev` | Hela sidan sedd som blad efter sista bygget: mallväggen och tonerna följer skissens uppbyggnad | håller |
| `/personligt-brev-exempel/projektledare` | Visaren är sedd öppen i artikeln, inte på exempelsidan | nära |
| `/verktyg/personlighetstest`, `/verktyg/linkedin-optimering` | Inte rörda. Det som återstår enligt första loggen kräver produktens form eller ny text | nära |

Övriga sidor med domen håller i första loggen är fotograferade om på sista bygget och mätta. Av dem är start, cv-analys (412), priser och om-oss inte sedda om i bild efter färgbytet av `--papper-2`.

## Största rättningarna

1. **Träffsäkerhetssimulatorn på dator** (`rakna.css`, `rakna-v3.css`, `globals.css`). En rad med `sm:col-span-2` öppnade en osynlig andra kolumn i en grupp som på dator ska ha en, så vartannat val blev noll pixlar brett och bara två av fyra metoder syntes. Resultatytan låg i en omslutande `div` och fyllde inte kortet. De tio prickarna var 352 px i en yta på 292. Prickarna och den valda stapeln var `bg-ink-1`, som på publika sidor är sidans mörkaste ton: mörkt på mörkt. Gäller alla kalkylatorer med samma delar.
2. **Rubrik satt som stycke på mörk botten** (`v3.css`). `p.p3-h2` på vägg, ö och Premium fick styckenas dämpade färg. Syntes på `/funktioner` och `/cv-mallar`.
3. **Fyra sidor utan form**: `/hjalpcenter`, `/press`, `/karriar`, `/integrationer`.
4. **Sidan som inte finns.**
5. **Rekryteringstesternas rubrik.**

## Rättat i grunden (`src/components/publikt/v3/`)

- `farg.ts`: fyra färger, `FARG_OVRIGT`, reglerna för `/for-rekryterare` och `/rakna-ut`. Test: `__tests__/farg.test.ts` (fem tester).
- `Sida.tsx`: `farg` är valfri, förvalet indigo.
- `v3.css`: rubrik som stycke på mörk botten, formatmärket, svala streck på arken.
- `ram.css`: foten utan sidfärg, rutan Mer, bladets streck.
- `grunden.md` är uppdaterad: fyra färger, förvalet och `--papper-2`.

## Det som fortfarande avviker eller inte är sett

- **Inte sedda i bild** (fotograferade och mätta): `/cv-mallar/sjukskoterska`, `/cv-mallar/systemutvecklare`, `/personligt-brev-exempel/larare` och `/saljare`, `/cv-exempel/civilingenjor`, `/rakna-ut/uppsagningstid`, artikeln `bra-personligt-brev` utanför visaren, artikeln `soka-jobb-via-mail` i telefon, `/for-rekryterare/insikter` under första skärmarna.
- **412**: start och cv-analys är sedda som blad. Rekryteringstester bara hjälten. Priser och Sökta tjänster är fotograferade och mätta men inte sedda.
- **Bladen är förminskade.** Enskilda textrader, små ikoner och avstånd under några pixlar är inte granskade utom där jag klippte ut i full skala.
- Mellanbredder (768, 1024) bara för rekryteringstesternas hjälte (1100 och 1280). Animationer inte alls. Inloggat läge inte alls.
- Inloggningens fel vid fel lösenord, och registreringens fel "kontot finns redan": båda kräver anrop mot produktionen.
- Visaren i öppet läge på en exempelsida. Filmen på testsidan.
- `/exempel` under hjälten står kvar på äldre komponenter (framer-motion, egna kort). Färgerna är grundens, formen är inte ombyggd.
- `/verktyg/personlighetstest` (provet i lyftet) och `/verktyg/linkedin-optimering` (rubriken i lyftet på två rader): som i första loggen.
- Kartans små län på `/jobbkartan`, kryssrutorna i registreringen och kalkylatorn (22 till 26 px, hela raden är tryckytan), sidbrickan på CV-arket (28 px med osynlig träffyta): som i första loggen.
- Avstängda knappar ("Skriv mitt brev", "Återställ lösenord") håller 3,0 till 3,4:1 tills fälten är ifyllda. Avstängt läge, som i skissen.

## Grindarna efter ändringarna

| Grind | Kommando | Resultat |
|---|---|---|
| Typkontroll | `npx tsc --noEmit`, sista gången efter sista ändringen | exit 0 |
| Vitest, berörda (före sista ändringen, som bara rör `/kontakt` utan tester) | `npx vitest run src/components/publikt "src/app/(public)" src/components/artiklar src/components/rakna src/components/landing src/components/registrering src/components/jobbkartan src/lib/rakna src/app/login src/app/register src/app/auth` och `src/components/publikt/v3 src/lib/cta src/components/cv/Dokument` | 25 filer, 379 tester gröna, och 3 filer, 39 tester gröna (med det nya `farg.test.ts`). Hela sviten är inte körd om |
| Bygge | `NODE_OPTIONS=--max-old-space-size=6144 npx next build --webpack`, fyra gånger | exit 0 alla fyra, 804 statiska sidor |
| SEO-grinden | avtryck på sista bygget (bygge 4), 498 sidor i nio delar, `jamfor` mot `publikt-omgang3-fore-live.json` | 498 av 498 svarade 200. **Fel: 2**, samma två som före (`og:image` på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`, byggmiljön). Inga nya, inga nya undantag |
| `/verktyg/sokta-tjanster` | eget avtryck | byte för byte lika med P5b:s |
| Städning | | Servern och webbläsaren stängda, `.next` borttagen, `arbetsyta.mjs` visar ingen server, ingen headless Chrome och ingen node-process mot arbetskopian. `.env.local` ligger kvar |

Avtrycket `docs/qa/seo-diff/publikt-omgang3-efter.json` är uppdaterat. Mot P5b:s avtryck skiljer tre sidor, inget annat: `/exempel` och `/hjalpcenter` har fått en första bild (dekorbilderna, tom alt, Före push 4), och `/jobbkartan` räknas till 1 079 ord i sista körningen och 1 085 i den före (baslinjen 1 085, alltså högst 0,6 procent; sidans text är inte rörd, bara kodradens färg). Rapporten `publikt-omgang3-diff.md` är oförändrad utom raden med filnamnet och är inte skriven om.

Minnet ur `arbetsyta.mjs` före varje tung körning: 4,3 GB (typkontroll), 4,6 (bygge 1), 6,9 (server 1), 4,0 (typkontroll), 5,0 (bygge 2), 6,6 (server 2), 5,1 (typkontroll och vitest), 5,0 (bygge 3), 6,4 (server 3).  Därefter 5,5 (bygge 4), 7,0 (server 4) och 5,9 efter städningen. Grinden kördes en gång på bygge 3 och en gång på bygge 4, med samma resultat.

## Ny text utan godkännande

- **Sidan som inte finns** (`src/components/publikt/SidanFinnsInte.tsx`), ny i sin helhet: etiketten "Fel 404", rubriken "Sidan finns inte", meningen "Adressen kan vara felskriven, eller så har sidan flyttat. Härifrån kommer du vidare.", knappen "Till startsidan" och länken "Alla artiklar". De fyra länkbrickorna har menyns namn. Sidan svarar 404 och indexeras inte.
- Ingen annan ny text. Alla nya bilder är `aria-hidden` eller har tom alt. Brickorna "Gratis" och "Premium" i hjälpcentrets kontobild ligger i en `aria-hidden` yta.

## Commits

| Hash | Vad |
|---|---|
| `fafbcfd3` | Grafiten och det varmgrå bort: grunden, färgförvalet, `globals.css`, och de fyra ombyggda sidorna `/hjalpcenter`, `/press`, `/karriar`, `/integrationer` (de måste ligga i samma commit, eftersom de använder det nya förvalet) |
| `67d5ba23` | Det byggda mot skisserna på elva sidor: rekryteringstester, mallarna, kalkylatorerna, Bli upptäckt, de två naven, `/exempel`, Jobbkartan |
| `d95dc212` | Sidan som inte finns |
| `db454702` | Hjältens bild på `/kontakt` |
| (denna) | Loggen, `grunden.md` och SEO-avtrycket |

Varje commit är kontrollerad mot nästa: ingen tar bort eller hänvisar till en fil som kommer först i en senare commit. Typkontrollen är körd på sista läget.
