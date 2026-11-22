# Logg utseende: det byggda mot skisserna (2026-11-22)

Grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Art director har fotograferat det byggda, jämfört det med skissernas bilder och rättat det som avvek. Ingen text, rubriknivå, länkadress i innehållet, metadata eller schema är ändrad. Inget är pushat.

## Före push

1. **Inloggningen och Skapa konto står i indigo, inte grafit.** Skissens not och BRIEF säger grafit, men skissens bilder (`bilder/registrering-*`, `bilder/inloggning-*`, källan har `rum: tran`) är indigo, och det är bilderna ägaren har godkänt. Grafiten (`#26262C`) läses dessutom som svart. Jag följde bilderna. Vill ägaren ha grafit: byt `farg="tran"` mot `farg="neutral"` i `src/app/login/page.tsx`, `src/app/register/page.tsx` och `src/app/auth/_delar/AuthKortSkal.tsx`.
2. **`/for-rekryterare` och `/hjalpcenter` står kvar i grafit**, som beslut 10 säger. Väggen läses nära svart. Det är kitets färg och inget jag har ändrat, men det skaver mot "inget svart" och bör ses av ägaren.
3. **Frågan till Jobbcoachen bärs nu i webbläsarens lagring** (se avsnittet nedan). Klicka igenom med ett riktigt konto: skriv en fråga på `/verktyg/jobbcoachen`, skapa konto, landa på `/dashboard/jobbcoachen?fraga=1` med frågan i fältet. Jag har inte skapat något konto.
4. **Länsraderna på `/jobbkartan` är 44 px i telefonen och på pekskärm, 32 px med mus.** Med mus är raden ingen tryckyta, och 21 rader på 44 px gör diagrammet nästan en skärm högt bredvid ett litet kort. Vill ägaren ha 44 px överallt: sätt `RH` till 44 i `ritaStaplar` i `src/components/jobbkartan/app.ts`.
5. Allt i `logg-p5b.md` under "Före push" gäller fortfarande, utom punkt 3 första stycket (frågan i adressen, rättad här) och punkt 4 (tryckytorna, rättade här).
6. `C:\c\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129` står kvar från P5b (inte tom, inte min). Mina egna tomma mappar där är borttagna.

## Så gjordes granskningen

- Tre byggen (`next build --webpack`, 6 GB heap), en server i taget på port 8300, en webbläsare i taget (headless Chrome via `puppeteer-core`). Bara sidladdningar: inga konton, inga AI-anrop, inga provflöden.
- Bilderna ligger i `docs/design/publikt-omgang3/bilder-byggt/<namn>-<bredd>-NN.png` (gitignorerad mapp), i samma bitar som skissens: 1830 px i telefon, 1600 på dator, animationer av, cookieraden dold genom samtyckescookien, PostHog och förladdning blockerade.
- Bredder: 375 och 1440 för alla 29 sidor, 412 för de fem första. 412 är fotograferad och mätt men inte granskad i bild.
- Jämförelsen: skissens och det byggdas bitar sida vid sida i remsor, och klipp i full skala där något såg fel ut. Därtill en mätning per sida av sidledsrullning, tryckytor under 44 px, kontrast under 4,5:1 och text under 12 px.
- Sista fotograferingen (bygge 3, alla 29 sidor i båda bredderna): ingen sidledsrullning, inga sidfel.

## Tre saker som skulle rättas oavsett

### Tryckytor under 44 px
- **CV-arkets verktygsrad** (`src/components/cv/Dokument/Verktygsrad.tsx`, `FastRad.tsx`, `Dokument.tsx`): typsnitt, ordning och färgraden 40 till 44 px, färgrutorna 32 till 44 px breda, PDF och Word 40 till 44 px. Sidbrickan ("2") är 28 px hög som förut men har en osynlig träffyta på 44 x 56 px (`after:-inset-2`); en större bricka täcker arkets hörn. Samma komponent används inloggat: raden är 4 px högre där också.
- **"Ladda upp" på yrkessidorna** (`/cv-mallar/<yrke>`): var en bar länk på 25 px, eftersom knappens stil bara gällde under `.cvm-stilnat`. Nu samma knapp som på stilsidorna, 44 px.
- **Länsraderna på `/jobbkartan`**: 17 px i telefonen och 21 px på dator. Nu 44 px i telefonen och på pekskärm, 32 px med mus (se Före push 4). I telefonen ritas diagrammet i skärmens egna mått, så texten är 12 px i stället för 9.
- Därtill, eftersom mätningen hittade dem: brödsmulans länkar i grunden (29 px) och i `Breadcrumb` (26 px), artikelns brödsmula, innehållsförteckning, ämnesbrickor (40), "Läs guiden" och "Visa alla artiklar" (25), frågebubblorna på `/verktyg/jobbcoachen` (40), Jobbkartans spelknapp (40), tidsreglage (28) och kommunnamnen i Lägst och Högst (22). Alla 44 px.
- **Kvar under 44 px:** länen på själva kartan (Blekinge 68 x 37, Gotland 36 x 67: ytan är länets form, raderna i diagrammet är vägen för små län), kryssrutorna i registreringen (26 px) och i kalkylatorn (22 px) där hela raden med etiketten är tryckytan, och länken "Linne" i löptext på `/verktyg/skapa-cv` (38 px bred).

### Frågan till Jobbcoachen
- Ny fil `src/lib/jobbsok/provaFraga.ts`, samma mönster som `provaSokt.ts`: frågan ligger i `localStorage` under `jc_coach_fraga` i 24 timmar, städad och högst 500 tecken. Adressen bär bara flaggan: `/register?redirect=/dashboard/jobbcoachen?fraga=1`.
- `CoachFraga` sparar frågan när formuläret skickas. De föreslagna frågorna på sidan (fyra i ön, sex i områdena) är nu `FragaLank`, en liten klientlänk som sparar frågan vid trycket; utan JavaScript öppnas Jobbcoachen med tomt fält.
- `src/app/dashboard/jobbcoachen/page.tsx` läser inte längre någon text ur adressen, bara att flaggan finns. `CoachVy` hämtar frågan ur lagringen en gång, ställer den i fältet och tar bort den. Den skickas först när användaren trycker.
- `coach-href.ts` är borttagen. Tester: `src/lib/jobbsok/__tests__/provaFraga.test.ts` (sex tester: flaggan i adressen och aldrig frågan, städning och längd, tom fråga, engångshämtning, 24 timmar, trasig lagring).
- Inga texter om datalagring är rörda.

### Jobbkartans färgskala
- Uppmätt: de fem stegen låg på L* 67, 61, 53, 42, 28. Steg 1 och 2 skilde 5,6 enheter och 1,20:1 och gick knappt att skilja åt på kartan.
- Ny skala i jämna steg, L* 72, 61, 51, 40, 28 (`#EE9F65 #DF7A2F #BF5F1E #9A4515 #742A0C`). Grannsteg skiljer nu 10 till 12 enheter och minst 1,41:1. Sidoytorna följer med. Samma skala i yrkeskartan (`yrkeskarta.css`), där nollsteget dessutom var beige (`#D8D1C4`) och nu är sval grå.
- Ingen text står på skalans färger: etiketterna på kartan står på vita brickor, och staplarnas tal står bredvid stapeln.
- Hittat på vägen: knappen "Se mina träffar gratis" på de mörka ytorna hade ljus text på koppar (2,3:1), eftersom `.jk a { color: inherit }` vägde över grundens knapp. Rättat. Staplarna i länsdiagrammet var nästan vita på vitt och står nu i skalans nollsteg. Gröna "+20 %" i yrkesrutan höll 4,0:1 och är mörkare.
- **Kvar:** kodraden i inbäddningsrutan (12 px) håller 4,4:1.

## Sida för sida

Domen är ett ord: **håller** (ser ut som skissen), **nära** (små avvikelser kvar), **avviker**.

### Sidor med skiss

| Sida | Vad jag såg | Vad jag rättade | Dom | Återstår |
|---|---|---|---|---|
| `/` (start) | Följer skissen sektion för sektion. Priset i Premium-ön var grått | Priset vitt (grunden) | håller | Raden med medierna har mer luft än skissen |
| `/verktyg/rekryteringstester` | Resultatpanelens "3 av 5 rätt" mörkt på mörkt (1,8:1) och låsraden 1,4:1. Figurseriernas pilar ritades som prickar. Talseriens tal sprack ur rutorna i 375. Kravbrickan såg ut som en knapp. Pappren under profilen gick dikt mot öns kant. Guidernas glyfer mörka på mörk bricka | Alla sex | nära | H1 är fyra rader på dator (texten är längre än skissens och står kvar). Filmen och 412 inte granskade i bild |
| `/priser` | Jämförelsen var bruten: Gratis och Premium staplade under varandra i båda bredderna. Premiums huvud i ljus koppar utan klack | Tabellen står bredvid varandra (två kolumner i telefon, tre på dator), Premiums huvud koppar med klack, rutorna ljus koppar, radnamnen feta. Sidan blev 2 000 px kortare på dator | håller | Inget jag såg |
| `/verktyg/cv-analys` | Följer skissen. Rubriken har etiketten inuti h1 (beslut 4) | Inget eget | håller | Inget jag såg |
| `/verktyg/personligt-brev` | Siffrorna 1 till 3 syntes inte på de mörka brickorna. Hjältens brev var en kort remsa där kravkortet täckte de utmärkta kraven. Läs mer stod på tonad botten direkt efter en tonad sektion | Siffrorna (grunden), arket som helt ark med kravkortet nedanför texten, Läs mer på golvet som i skissen | nära | Mallväggen och tonerna bara genomrullade |
| `/personligt-brev-exempel/projektledare` | Hjältens ark var en liggande remsa med tre stycken. "Brevets tre delar" hade osynliga siffror | Stående A4 med hela brevet och mallarna bakom (arket är `aria-hidden`, ordantalet oförändrat). Siffrorna | nära | Visaren i öppet läge inte fotograferad. Skissen är längre eftersom den har skissblad |
| `/verktyg/sokta-tjanster` | Följer skissen. Arkets knapp är vit på dator (saas-lead K3, medvetet) | Inget eget | håller | Inget jag såg |
| `/verktyg/jobbmatchning` | Nålarna på arket och siffrorna på korten var bleka (skissen: mörkgröna med vit siffra). Länkbrickan Jobbcoachen i grafit bland gröna | Båda | håller | Inget jag såg |
| `/cv-mallar` | Arbetsytan i det lyfta kortet var ett vitt ark på vit botten. Verktygsradens tryckytor | Arbetsytan står på ett tonat bord. Tryckytorna | nära | Skissen visar lyftet utan arbetsyta; det byggda visar exempel-CV:t direkt (funktionen, medvetet). Mallkortens bricka står under namnet, i skissen bredvid |
| `/funktioner` | Testöns två papper låg utanför ön. Bladet i dörren Personliga brev låg över namnet | Pappren ligger i ön (ny plats `efter` i grundens `O`). Bladet | nära | Remsa 3 och 4 (Jobbsökets nedre del, Premium, frågorna) inte granskade |
| `/register`, `/login` | Grafit i stället för skissbildernas indigo. En kopparlinje under toppraden (framstegstråden ritad full) | Indigo (Före push 1). Tråden syns bara när det finns steg | håller | Fellägen, `?borja=` och övriga auth-sidor inte fotograferade |
| Menyn | Megamenyn på dator och telefonmenyn följer skissen | Inget | håller | Bara sedd på startsidan (indigo) |
| Artikel med reklam (`matrigma-test`) | Uppgiftens fråga låg dikt mot brädet i rutan. Tryckytor i skalet | Båda | nära | Författarrutan är varmgrå (`--papper-2`, kitets värde). Bara remsa 1 och 6 av 7 granskade på dator, telefonen inte, och bara testernas ruta |
| `/skapa-brev/start?mall=koppar&yrke=projektledare` | Följer skissen. Tonvalet står i formuläret | Inget | håller | Knappen är blek tills fälten är ifyllda (avstängd, som i skissen) |
| `/personligt-brev-exempel` | Följer skissen | Inget | håller | Bara första remsan granskad |
| `/verktyg/jobbcoachen` | Brickan "10 meddelanden" sprack ur sin ruta. Frågebubblorna 40 px | Talet 10 för sig med "meddelanden gratis per konto" under (samma ord i samma ordning). Bubblorna | håller | Inget jag såg |
| `/verktyg/skapa-cv` | Ikonen i förslagsbrickan ritades 156 px bred. Bilden i steg 3 hade fallit ihop till en smal remsa | Båda | håller | Inget jag såg |
| `/verktyg/personlighetstest` | Stegens bilder låg sist och på olika höjd (skissen: överst). Kravbrickan som knapp | Båda | nära | Provet i lyftet har produktens form, inte skissens (`onskemal.md`) |
| `/verktyg/linkedin-optimering` | Före och efter-talet litet och till vänster. Efter-profilen utan kopparram. Sökorden bleka. Raden utan träff 3,9:1. Rubriken i lyftet grå | Alla fem | nära | Rubriken i lyftet bryter på två rader |
| `/verktyg/bli-upptackt` | Följer skissen | Inget | håller | Bara första remsan granskad |
| `/om-oss` | Följer skissen. Grön text på grön platta 4,2:1 | Texten | håller | Inget jag såg |

### Sidor utan skiss, bedömda mot grundens nivå

| Sida | Vad jag såg | Vad jag rättade | Dom | Återstår |
|---|---|---|---|---|
| `/rakna-ut`, `/rakna-ut/lon-efter-skatt` | Hjälte med lönebesked, kort med tal, Premium-ö, kalkylatorn som eget kort. Håller nivån | Brödsmulans tryckytor | håller | Inget jag såg |
| `/jobbkartan` | Se avsnittet om färgskalan | Skalan, staplarna, knapptexten, tryckytorna | nära | Kartans små län, kodradens kontrast |
| `/for-rekryterare` | Håller nivån: kandidatkort i hjälten, portalen i bild, öar | Inget | håller | Grafiten (Före push 2) |
| `/hjalpcenter` | Tunn sida: tre kort utan bild och en ruta om att mer kommer | Inget (innehållet är texten) | nära | Platt jämfört med resten. Kräver nytt innehåll, inte form |
| `/cv-exempel` | Håller nivån, samma form som brevnavet | Inget | håller | Bara första remsan granskad |
| `/cv-exempel/projektledare` | **CV-arket saknade papper: mörk text direkt på den mörka petrolytan, oläsligt (1,3:1).** Arkets färger var bara definierade under `.pub-sida`, och sidan står nu i grundens `Sida`. Gällde alla CV-exempel | Arkets färger och typsnitt står där arket ritas (`exempel.css`) | håller | Bara första skärmarna granskade efter rättningen |
| `/cv-mallar/lakare` | "Ladda upp" en bar länk på 25 px. "Fortsätt med ditt CV" utan klack | Båda | nära | Bara första remsan granskad |

## Rättat i grunden (`src/components/publikt/v3/`)

- `v3.css`: priset vitt på Premium-ön och öarna. Brödsmulans länkar 44 px och sista ledet på samma rad. Sifferbrickan (`Nr`) behåller sin färg när sidan stilar `span` (osynliga siffror på tre sidor). Rubrik satt som stycke (`p.p3-h2`) på papper är bläck, inte textgrå. Liten grå text och kopparetiketten ett steg mörkare (`--ink-3` `#5E5E68`, `--koppar-ink` `#9E4317`), eftersom de höll 4,43:1 på tonad botten i plommon och grafit; nu 4,9:1.
- `O.tsx`: ny valfri plats `efter`, för papper som hör till ön och ska ligga i dess hela bredd under texten och bilden.

## Sidor jag inte tittade på

- `/skapa-brev/start` utan mall och yrke, och väljaren med 40 mallar.
- Stilsidorna `/cv-mallar/word`, `/foto`, `/enkla`, kategorisidorna för CV och brev, och alla yrkessidor utom projektledare (brev och CV) och läkare (mall).
- `/artiklar` (listan), alla artiklar utom `matrigma-test`, och reklamrutorna för CV, personliga brev och Jobbsöket.
- `/kontakt`, `/press`, `/karriar`, `/integrationer`, `/exempel`, insikterna under `/for-rekryterare`, de åtta övriga kalkylatorerna.
- `/auth/*` (Glömt lösenordet med flera; de bytte färg till indigo genom det delade skalet men är inte fotograferade), registreringens och inloggningens fellägen.
- `/verktyg/rekryteringstester/prova`.
- Menyn i de fyra andra färgerna och i öppet läge på andra sidor än startsidan.
- Bredden 412 i bild (fotograferad och mätt för de fem första sidorna). Mellanbredder (768, 1024) inte alls.
- Hovring, fokusringar och animationer. Inloggat läge: verktygsraden i CV-rummet är 4 px högre efter rättningen och är inte fotograferad där.

## Grindarna efter ändringarna

| Grind | Kommando | Resultat |
|---|---|---|
| Typkontroll | `npx tsc --noEmit` | exit 0 |
| Vitest, berörda | `npx vitest run src/lib/jobbsok src/components/registrering src/components/publikt "src/app/(public)" src/components/cv src/components/artiklar src/components/jobbkartan src/components/jobb3 src/app/dashboard src/app/login src/app/register src/app/auth --maxWorkers=2 --minWorkers=1` | 63 filer, 799 tester gröna. Hela sviten (4 707) är inte körd om |
| Bygge | `NODE_OPTIONS=--max-old-space-size=6144 npx next build --webpack`, tre gånger | exit 0 alla tre |
| SEO-grinden | avtryck på bygge 3, 498 sidor i nio delar, `jamfor` mot `publikt-omgang3-fore-live.json` | 498 av 498 svarade 200. **Fel: 2**, samma två som före (`og:image` på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`). Rapporten och avtrycket blev byte för byte lika med P5b:s, så filerna i `docs/qa/seo-diff/` är oförändrade i git |
| `/verktyg/sokta-tjanster` | eget avtryck | oförändrat mot P5b:s |
| Städning | | Servern och webbläsaren stängda, `.next` borttagen, `arbetsyta.mjs` visar ingen server, inga headless Chrome och inga node-processer mot arbetskopian. `.env.local` ligger kvar |

Minnet ur `arbetsyta.mjs`: 3,9 GB före första bygget, 6,9 GB före första servern, 3,5 GB före andra bygget, 4,6 GB före typkontrollen, 4,9 GB efter städningen.

Avtrycket skrevs först till `C:\c\Users\...` (samma fälla som i `logg-p5b.md`: `MSYS_NO_PATHCONV=1` gör att `--ut` med en Git Bash-sökväg hamnar där). Filerna är flyttade och mina tomma mappar borttagna.

## Ny text utan godkännande

Ingen. Brickan på `/verktyg/jobbcoachen` har samma ord i samma ordning, delade på talet och raden under.

## Commits

| Hash | Vad |
|---|---|
| `ac0eb58a` | Bara borttagningen av `coach-href.ts`. `git add` föll på den redan borttagna filen, så resten av ändringen kom inte med. Grenen bygger inte vid just den här commiten |
| `8ee8cb49` | Jobbkartan: färgskalan, länsraderna, knapptexten, staplarna |
| `d6b98585` | Tryckytor: CV-arkets verktygsrad, Ladda upp, brödsmulor, artikelns skal |
| `6d1f1fe6` | Resten av `ac0eb58a`: frågan till Jobbcoachen i webbläsarens lagring |
| `b443104c` | Det byggda mot skisserna: grunden och sexton sidor |
| `83e230b2` | Skapa konto och Logga in i indigo, ingen kopparlinje |
| `114c110b` | Den här loggen |
