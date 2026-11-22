# Logg P1, hela sajten (2026-11-22)

Paketet: startsidan, /funktioner, /priser, /om-oss, Skapa konto, Logga in och sidorna under `src/app/auth/`, samt de delade copyfilerna `paket-copy.ts` och `gratis-copy.ts`. Byggt på `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Ingen commit, ingen push, ingen server, ingen webbläsare och ingen SEO-diff (byggbriefen, Datorn).

Underlaget har lästs i den här ordningen: byggbriefen, `grunden.md` och komponenternas kod, SEO-beskedet, SEO-baslinjen, `bygglogg-text.md`, `textbeslut.md` och `nytt-innehall.md`. Där `nytt-innehall.md` har en lydelse för ett nytt block har den lydelsen använts. Varje sida har lästs igenom mot skissen sektion för sektion och mot `git show HEAD:` för att kontrollera att rubriker, stycken, FAQ-frågor, länkar och schemablock finns kvar.

## Delade copyfiler

### Byggt
- **`paket-copy.ts`, textbeslut GEM-12 och B-9.** Två nya kort i `FUNKTIONER.kort` mellan Matchade jobb och Jobbcoachen:
  - `sokta-tjanster`: underraden "Gratis för alla med konto. I Premium: ...". Texten är ordagrann GEM-12, och "tolv" läses ur `NO_RESPONSE_NUDGE_DAYS`. Länken "Så fungerar Sökta tjänster" går till `/verktyg/sokta-tjanster`.
  - `infor-intervjun`: underraden "Ingår i Premium. Gratis: ett intervjuprov om dagen." Talet läses ur nya `GRATIS_INTERVJUPROV_PER_DAG`. Texten är ordagrann GEM-12.
  - `FunktionKort.scen` har fått värdena `sokta` och `intervju`. Ingen läsare ritar scenerna längre.
  - Båda korten syns på /priser och /funktioner.
- **`paket-copy.ts`, testkortet:** "Efter varje uppgift får du förklaringen", "med förklaring efter varje uppgift" och "Följ din utveckling, test för test." Grunden är SEO:s JA på /funktioner ("Efter varje uppgift", "test för test") och B4, där "uppgift" är produktens ord.
- **`gratis-copy.ts`:** ny `GRATIS_INTERVJUPROV_PER_DAG = 1`. Den vaktas i `gratis-copy.test.ts` mot `DAILY_LIMIT_INTERVIEW_SAMPLES`. Kvottjänsten får inte dras in i klientens JavaScript, så samma mönster som `GRATIS_CHATTFRAGOR` används.
- **`paket-copy.test.ts`:** sju kort i den nya ordningen. Sökta tjänsters underrad har ett eget mönster, och underraden för Inför intervjun och "tolv tysta dagar" vaktas.
- **`registrering-copy.ts`, testkortet i "Det här ingår gratis":** "Grundnivån i alla åtta testtyperna, ett test om dagen, med förklaring efter varje uppgift." (`nytt-innehall.md`, registrering). Förväntningen i `gratis-copy.test.ts` är ändrad i samma byte.

### Beslut
- **Brevkortets sista steg** står kvar som GEM-9 ("Redigera, ladda ner som PDF eller Word, skicka."). `nytt-innehall.md` säger uttryckligen att GEM-9 gäller före skissens "välj mall och skicka". Ett försök att byta steget gjordes och togs tillbaka.
- **"sju dagar"** i Inför intervjun-kortet är skrivet som ord. `INTERVJU_BESKED_DAGAR` finns bara på `feat/jobbsoket-omgang2`, inte i grenens bas. Kommentaren i koden säger det. Byt till konstanten efter sammanslagningen.

### Ny text utan godkännande
- Inget.

### Återstår
- GEM-4 är fortfarande överhoppad: listan i `plans.ts` delas med kvotväggsmejlet, och mejlmallar rörs inte. Alla sidor läser `HELA_PAKETET_RADER` som i dag.

## Startsidan (`/`, skiss `start`)

### Byggt
- **Filer:**
  - `src/components/publikt/start/Startsidan.tsx` är omskriven på grundens komponenter i `<Sida farg="tran" id="innehall">`.
  - Ny `start.css` med prefixet `st-` och bara tokens.
  - I `src/app/(public)/page.tsx` är `PubliktSida` borttagen. `publikt.css` importeras för den fasta knappraden.
- **Hjälten:** etikett, h1, värdemening och knappar står ordagrant. "Skapa konto gratis" har `data-cta="hero-primary"`.
  - Talbrickorna: konton (ur databasen), "8 testtyper, grundnivån gratis" (ur `ANTAL_TESTTYPER`) och "1 brev gratis, sedan ett i veckan".
  - Telefonen är ersatt av de fyra korten (beslut 3). Korten har namnen som stycken, inga rubriker.
  - Matrisen ritas ur `MATRIS_BRADE`, samma kontrollräknade uppgift som `Testram`.
  - CV-kortet räknas ur `KATEGORIER`: 30 av 35 och 3 av 5 ger 93, "7 poäng kvar till 100".
  - Lydelserna kommer ur `nytt-innehall.md`.
- **Medieraden:** ordagrann.
- **Tre verktyg:** tre öar (`O`) i indigo, petrol och skog med h3 Rekryteringstester, CV-analys och Jobbmatchning. Styckena står som i koden efter textbeslutet.
  - Gratisraden har chipet Gratis, och ordet "gratis" har flyttats till chipet.
  - Bilderna är `Testram`, `CvArk` (93 av 100 i dag) och `MatchadeJobb` med två träffar.
- **Brevet:** en ö i plommon med `Brevpar`. h2, ingress, knapp och gratisrad står ordagrant.
  - Nytt stycke ur `nytt-innehall.md`: "Brevet får samma mall som ditt CV ... Du väljer bland {BREV_MALL_ANTAL} mallar och fem toner."
- **Jobbcoachen:** papper i skog, två spalter.
  - Text, knapp och raden "Tio meddelanden gratis" (ur konstanten) står ordagrant.
  - Samtalet har frågan, svaret och förslagen ur `nytt-innehall.md`, utan källmärke och utan belopp.
- **Medierna:** en ö i grafit med de fyra korten och länkarna ("domän, öppnas i ny flik"). Länken "Så hjälper vi dig komma förbi" till /priser står kvar under korten.
- **Och resten av jobbsöket:** ön Sökta tjänster med etikett, h3 "Håll koll på var varje ansökan står" och värdemeningen ur `nytt-innehall.md` ("tolv" ur `NO_RESPONSE_NUDGE_DAYS`).
  - Veckans mål visas som exempel (`aria-hidden`), och bilden är `Stig` med "2 väntar svar".
  - Knappen "Så fungerar Sökta tjänster" går till `/verktyg/sokta-tjanster` (`LANK_BYTT` finns), med chipet "Gratis för alla med konto".
  - Därunder står de åtta länkbrickorna ordagrant, i delarnas färger. Jobbkartans bricka har kvar `data-matning="jobbkartan-teaser"` för `TeaserMatare`.
- **Premium:** `PremiumO`, rubriken "Allt i Premium" (ur `paketKort()`). Texten står ordagrant, punkterna läses ur `HELA_PAKETET_RADER`, och köpknappen går till /priser med raden om Stripe.
- **Frågorna:** grundens `Faq` med samma fem frågor och svar. Schemat skrivs av sidans egen graf (Organization, WebSite, FAQPage), som är oförändrad.
  - Under frågorna: Skapa konto gratis och "Fler frågor om priset? Se priserna".
- **Kvar:** `FastKnapprad` (observerar `#hjalte`) och `TeaserMatare`.

### Beslut
- **Länkmålet för Sökta tjänster:** `/verktyg/sokta-tjanster` direkt, inte `/funktioner#sokta-tjanster`. Grund: SEO villkor 7 och beslut 1. P4 bygger sidan.
- **Gungningen:** kortens vridning går genom `--rot` och förskjutningen genom marginal. Annars skulle `p3-gunga` skriva över `transform`, vilket skissen gör.
- **`fem toner`** är skrivet som ord. Det finns ingen publik konstant för tonerna, de ligger i inloggade `brev3`.

### Ny text utan godkännande
- Inget utöver `nytt-innehall.md`.

### Avvikelser från skissen
- **Testernas stycke** står som i koden, med meningen om personlighetstestet och "Fem frågor provar du utan konto". Skissen hade kortat det, men texten är sidans egen.
- **Jobbcoachens ingress** följer STA-6 ("Lön, intervjufrågor, avtal och avslag ...") och inte skissens.
- **Etiketten "Så hjälper vi dig komma förbi"** över Resten-rubriken är inte med. Den står kvar som länk under medierna, så att länken inte försvinner (`nytt-innehall.md`).
- **FAQ-svaren** står i full längd, inte i skissens kortade form.

### Återstår
- **Ny h3 "Håll koll på var varje ansökan står"** (godkänd i `nytt-innehall.md`). Om SEO-grinden fäller på den ny rubriken på `/`: byt den till `<p className="p3-h2">`, enligt filens anvisning, i stället för att skriva ett undantag.
- **Ordantalet:** gränsen är 20 ord och det är inte mätt. Telefonerna som försvann var bilder. Ny text har kommit till: kortens rader, brevets stycke och den längre värdemeningen för Sökta tjänster.
- **Rendering** i 375, 412 och 1440, framför allt kollaget i 375 och knappen "Så fungerar Sökta tjänster" (26 tecken). Bryter knappen: gör den till textlänk med samma ankartext.

## /funktioner (skiss `funktioner`)

### Byggt
- **Filer:** `FunktionerSida.tsx` är omskriven på grundens komponenter i `<Sida farg="tran" id="innehall">`. Ny `funktioner.css` (prefix `fn-`). I `page.tsx` är `PubliktSida` borttagen.
- **Hjälten:** h1 och FUN-11 står. Ankarraden är fyra dörrar (Rekryteringstester, Personliga brev, CV, Jobbsöket) med alla åtta ankare. Märket Nyhet står utanför ankartexten.
- **`#tester`:** en ö med `Testram`, raderna Gratis och Premium, kortets text och steg, och knappraden.
  - Två kort med nya h3: "{TESTTYPER_ORD} testtyper, tre nivåer" och "Resultatet, uppgift för uppgift". Uppgiftslistan är märkt Exempel.
- **`#brev`:** en ö med `Brevpar`, Gratis och Premium, de fem tonerna och "Se personligt brev-exempel".
- **`#cv-analys`:** en ö med `CvArk`, stapeln med de sju delarna ur `KATEGORIER` och raden under ur `nytt-innehall.md`.
- **`#cv-skapa-mallar`:** de fyra korten ordagrant och mallväggen med åtta riktiga mallar ur katalogen. Brickorna läses ur `FREE_TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT` och antalet mallar med foto.
- **Jobbsöket på grön vägg** (`#premium-funktioner` står): etiketten och ingressen enligt FUN-3, ordagrant.
  - `#jobbmatchning` med `MatchadeJobb`.
  - **Ny h2 "Sökta tjänster"** (`#sokta-tjanster`) med `Stig`, GEM-12-texten och länken "Så fungerar Sökta tjänster" till `/verktyg/sokta-tjanster`.
  - `#jobbcoachen` med `Samtal`.
  - Korten Inför intervjun (h3, GEM-12) och Bli upptäckt (h3).
- **`#linkedin`:** texten och Premiumraden står ordagrant. Profilkortet med Sara Lindström och Nordanvind Energi är `role="img"` och märkt Exempel.
- **Alla verktyg, samlade:** tolv länkbrickor. Elva står som i dag, och Sökta tjänster är ny med ankartexten "Sökta tjänster" och Nyhet i `::after`.
- **Premium:** `PremiumO` med `HELA_PAKETET_RADER`, utan "Allt på den här sidan, utan tak."
- **Frågorna:** samma fem ordagrant, FAQPage ur samma lista.
- **Den fasta knappraden** står kvar.
- **OG-beskrivningen (FUN-10, överhoppad i push 2):** "Alla verktyg på en plattform: rekryteringstester, CV-analys, {TEMPLATE_COUNT} CV-mallar, personliga brev, jobbmatchning, sökta tjänster, Jobbcoachen, LinkedIn-optimering."
  - 156 tecken med 40 mallar. Det enda bytet mot textforslag.md är att "och" före LinkedIn-optimering blev ett kommatecken. Alla sökord står kvar.
  - Titel, description, canonical och twitter är orörda.

### Beslut
- **Kortens text delas:** första meningen blir värdemening, resten blir stycke. Inga ord försvinner.
- **Raden "Ingår i Premium. Gratis: ..." vänds** till två rader, Gratis och Premium (SEO JA).
- **FUN-3 går före skissens etikett "Jobbsöket"**, eftersom posten är ordagrann.
- **Länken till personlighetstestet** behåller dagens text ("Personlighetstestet, {n} påståenden utan konto"), enligt regeln om ordagrann text. `nytt-innehall.md` nämner `tester.lank`, som sidan aldrig har visat.
- **Förklaringsrutan för uppgift 9 visas inte**, eftersom Testrams uppgift inte kommer ur banken (`nytt-innehall.md`).
- **Textlänken "Skapa konto gratis" i Sökta tjänster-raden** är borttagen enligt `nytt-innehall.md`. /register länkas från hjälten och frågorna.

### Ny text utan godkännande
- Inget. Alla nya rader följer `nytt-innehall.md`.

### Avvikelser från skissen
- **Kortens steg och text** är `paket-copy.ts`-text, inte skissens kortare versioner.
- **Hjältens ingress** står som i dag.
- **Inför intervjun är inget länkkort**, eftersom det inte finns någon publik sida för det.

### Återstår
- **Rendering** i 375, 412 och 1440, och klick på ankarna.
- **Ordantalet** är inte mätt, uppskattningen är att det ökar.
- **`opengraph-image.tsx`** är orörd. Dess undertext har ett &-tecken, och inget beslut täcker den.
- **Önskemål till grunden:** alt-texten i `MallMiniatyr` bör vara "CV-mallen X" för CV-mallar. Gratis- och Premiumraderna och den korta steglistan på färgad yta bör flyttas in i v3, eftersom /priser har samma behov.

## /priser (skiss `priser`)

### Byggt
- **Filer:** `page.tsx` är omskriven på grundens komponenter i `<Sida farg="tran">`. Ny `priser.css` (prefix `pr-`).
- **Hjälten:** etiketten "Priser", h1 `paketMedPris(SALD_PLAN)` och titeln är orörda. Fetraden och ingressen står ordagrant, och de fyra delarna står som brickor (namnen ur `RUM_NAMN`) med ankarlänkarna.
  - **Prislappen till höger:** `PrisRad paPapper`. Kampanjpriset följer med av sig självt, bara här och i kampanjraden.
  - Under priset: köpknappen och "Allt i Premium" med `PAKET_KORT.allt.ingar`. GEM-4 är överhoppad, se copyfilerna.
- **Lyft `#gratis`:** h2 "Vill du se först?" och fyra kort, ett per del, med huvudtal ur konstanterna. Varje fakta i den långa gratismeningen finns i något kort.
- **Funktion för funktion:**
  - **h3 Rekryteringstester:** `Testram`, bankraden `bankTal(BANK_VISAT)`+ och kortet om intervjufrågorna efter personlighetstestet.
  - **CV-analysen** (`CvArk`), **Personliga brev** (`Brevpar`), **Matchade jobb** (`Traff`) och **Jobbcoachen** (`Samtal`).
  - **Nya h3:** Sökta tjänster (`Stig`, länken "Så fungerar Sökta tjänster" till `/verktyg/sokta-tjanster`) och Inför intervjun (B-9). Båda kommer ur de nya korten i `FUNKTIONER.kort`.
  - Raderna Gratis och Premium per block följer `nytt-innehall.md`.
- **Kom igång:** en väg med de tolv stegen ur `GUIDE.listor.allt.steg` och etiketten `GUIDE.listor.allt.etikett` (`${KOM_IGANG_LISTA.allt.length} steg`). H2 och ingress ur `GUIDE`, och villkoren som tre kort.
- **Jämförelsen:** kvar som `<table>` med caption och `th scope`. Radetiketterna står.
  - Gratis står i grönt och Premium i ljus koppar. "Ingår inte" är en streckad ruta, och inget är svart.
  - Rapporten på gratisnivån: "Antalen per månad".
- **Frågorna:** `Faq` med `PRISER_FAQ_ITEMS`. Schemat skrivs av `priser-schema.ts` och är oförändrat (Product och FAQPage).
- **Kvar:** Premiumytan sist, den fasta köpraden och `PriserMatning`.
- **`priser-data.ts`:** gruppen "CV och personliga brev" är delad i "CV" och "Personliga brev". Det ger fyra grupper, och gruppnamnen är `th`, inga rubriker.
  - Nya rader enligt `nytt-innehall.md`: Ton, Nedladdning av brev och Brevmallar, plus underrader på CV-mallar. Övriga rader står ordagrant.
- **`PriserKopKnapp.tsx`:** ny prop `klass` (standard `pub-knapp`) för grundens kopparform. Logiken är orörd.

### Beslut
- **Löptext och steg står ordagrant som i koden** (`nytt-innehall.md`, priser): "förklaring på varje fråga", "Session för session." och brevets "Redigera, ladda ner som PDF eller Word, skicka" (GEM-9). En mellanversion med skissens lydelser är återställd.
- **Stegens rubriker** var h4 och är nu `<b>` som i skissen. Grinden jämför bara h2 och h3.
- **Köpknappen i Jobbcoachens station och under frågorna** är borta. Köpknappen står i hjälten, i Premiumytan och i den fasta raden. Det var knappar, så inget länkmål försvinner.
- **Personlighetslänken** behåller talet ("Gör personlighetstestet, {n} påståenden utan konto"), enligt prisavsnittet i `nytt-innehall.md`.
- **Raderna Gratis och Premium** står som en konstant `NIVA` i `page.tsx`. /funktioner har motsvarande rader i sin fil. Att flytta båda till `paket-copy.ts` (till exempel `FUNKTIONER.niva`) är en städning för P5 eller nästa omgång.

### Ny text utan godkännande
- Inget. Allt nytt följer `nytt-innehall.md`.

### Avvikelser från skissen
- **Hjältens fetstil och Premiumlistan** är sidans egna, eftersom GEM-4 är överhoppad.
- **Kom igång** har tolv steg och etiketten "12 steg".
- **Tabellcellerna** har inga mätstaplar.
- **Inför intervjun** har ingen bild. Grunden saknar en, se önskemål.

### Återstår
- **Rendering** i 360, 375, 412 och 1440: prislappens höjd, tabellen på `<table>` i Safari och `Stig` i den breda ön.
- **Ordantalet** är inte mätt.
- **Önskemål till grunden:**
  - en jämförelsekomponent
  - en grön texttoken för gratis (i dag `color-mix` av `--positiv`)
  - en storleksvariant av `PrisRad`
  - en bild för Inför intervjun

## /om-oss (skiss `om-oss`)

### Byggt
- **Filer:** `OmOssSida.tsx` är omskriven på grundens komponenter i `<Sida farg="tran">` med `<main>` som förut. Ny `om-oss.css` med prefixet `oo-`. I `page.tsx` är `PubliktSida` och `foretag.css` borttagna. Talen och JSON-LD (Organization, AboutPage med BreadcrumbList) är orörda.
- **Hjälten:** brödsmulorna Hem och Om oss står synligt. Schemat skrivs inte en gång till (`brodsmulorSchema={false}`), eftersom AboutPage redan bär det.
  - Etikett, h1, värdemening, "Se våra verktyg" (`data-primar`) och "Så började det" står ordagrant.
  - Bilden är de fyra delarna som växer uppåt, som vanlig text och inte `role="img"` (`nytt-innehall.md`). Ordet "Åtta" läses ur `TESTTYPER_ORD`.
- **Historien (`#vart-team`):** fyra steg på grundens väg (`p3-vagsteg`). Varje steg har årtal, h3, text och en bild (`aria-hidden`): brevet, två ark, namnbytet och de fyra dörrarna. Steg fyra är märkt "nu".
  - Text 4 följer INF-2 och text 1 följer INF-4.
- **Löftena:** sektionen på jobbtonen med den nya etiketten "Så arbetar vi". De tre korten har h3, text och en bild under (flödet, de sex källorna, 0 kr mot priset ur `PLANS`).
  - Löfte 2 slutar med SEO:s mening.
  - Löfte 3 börjar "Du provar det mesta utan kortuppgifter."
- **Slutet:** en ö i indigo med talen ur databasen och kontaktrutan. Etikett, h2, text, "Skapa konto gratis" och info@jobbcoach.ai står ordagrant.

### Beslut
- **Sidans färg** är indigo, som skissnoten valde.
- **h2 "Saknar du något, eller har du en fråga?"** har nivå h2 som förut, med `p3-h2` i stället för `pub-h3`.

### Ny text utan godkännande
- Inget utöver `nytt-innehall.md`.

### Avvikelser från skissen
- **Kort 1** följer INF-4 ("De som använde den kom snabbare ...") och inte skissens "Användarna kom snabbare".
- **Kort 4** har sex verktyg (INF-2), inte skissens fyra.
- **Löfte 2** har SEO:s mening, inte skissens "med källor du kan kolla själv".

### Återstår
- **Rendering** i 375, 412 och 1440: blockens bredd i 375 och kolumnhöjderna i vägen.
- **Ordantalet** (gräns 6 ord) är inte mätt. Bytena enligt `nytt-innehall.md`: INF-2 ger plus 3, INF-4 plus 2, löfte 2 plus 1 och löfte 3 noll. Hjältens block och etiketterna "Så arbetar vi" och "I dag: fyra delar" är ny räknad text, och telefonen var bild.

## Skapa konto (`/register`, skiss `registrering`)

### Byggt
- **`/register`** står i `<Sida farg="neutral">` inuti `PubliktSida`, som behålls för provets klasser.
- **`PubliktFlodesskal` är omritat:** mörk topprad utan meny med loggan, "Har du redan ett konto?" och Logga in. Framstegstråden finns kvar, väggen ligger i mitten och foten är vit med kopparknapp.
  - Props, mätningen av fotens höjd, `data-publikt-flode` och 100dvh-reglerna är oförändrade.
- **Kontokortet:** vitt med klack. Google-knappen har klack, fälten är 54 px och kryssrutan 26 px. Skapa konto är `p3-knapp`, och den juridiska raden står under knappen, ordagrant.
  - Fel och smakprovets besked är rader i kortet (`role="alert"` och `role="status"`).
  - Valraden med Ändra för `?borja=` står kvar.
- **"Det här ingår gratis":** fyra färgade kort, ett per del, med små bilder (`aria-hidden`). Premiumraden står under.
  - Lydelserna kommer ur `nytt-innehall.md`: testkortet, Jobbsöket-kortet som slutar "...håller koll på varje jobb du har sökt.", och Premiumraden med "Jobbcoach Premium" ur `paketNamn(SALD_PLAN)` utan "utan tak".
- **Varianten efter provet** (`prov3-reg`) har samma layout och det nya formuläret.
- **Nya filer:** `src/components/registrering/registrering.css` (prefix `rg-`).

### Beslut
- **Beslut 5:** dagens val behålls i den nya formen.
  - Skissens skärm 3 ("Vad vill du börja med?" med fem val och "Jag vet inte än") och köpsteget ligger i `/dashboard/valj-spar` och kassan, som är inloggat och inte får röras.
  - Den publika frågan (`ValSteg`, bara för `?borja=`) har redan fem val som landar rätt via `INTENTS[...].landning`. Valen är omritade som `role="radio"`-knappar i delarnas färger, med samma tangentbordsnavigering och `data-intent`.

### Ny text utan godkännande
- Inget.

### Avvikelser från skissen
- **Skärm 2 och 3 är inte byggda**, eftersom de är inloggade.
- **`ValSteg` har dagens fem val.**

### Återstår
- Rendering och klicktest i 375, 412 och 1440 för bar `/register`, `?borja=`, `?test=` med och utan resultat, `?paket=` och fellägena.
- Testerna i `src/components/registrering/__tests__/` är inte körda. Roller, namn, `data-prov-sedan` och antalet fält är behållna.

## Logga in, Glömt lösenordet och övriga auth-sidor (skiss `inloggning`)

### Byggt
- **`/login`** står i `<Sida farg="neutral">`.
  - Kortet har rubrik, beskedsrader, Google, "eller med e-post", fälten, "Glömt lösenordet?" och knappen.
  - Knappen Logga in ligger nu i formuläret och inte i en klistrad fot. Det är samma formulär och samma logik.
  - Panelen "Allt ligger kvar där du lämnade det" har fyra block ur `nytt-innehall.md` och läses upp.
- **Nytt delat skal** `src/app/auth/_delar/AuthKortSkal.tsx` (topprad, vägg, kort, panel, beskedsrad). Det används av alla fem auth-sidorna.
- **Glömt lösenordet:**
  - `GlomtFormular.tsx` är en ordagrann kopia av logiken i `ForgotPasswordForm` med ny form.
  - Citatet följer AUTH-1. Talen "100%" och "24 h" står kvar i en egen lista i panelen (B-30), trots att skissen stryker dem.
- **Välj nytt lösenord:** `NyttLosenFormular.tsx` är en ordagrann kopia av logiken i `ResetPasswordForm` med ny form. Säkerhetstalen står kvar.
- **Bekräfta e-post, felsidan och Byte av e-postadress** har samma kort, med oförändrad logik och text.
- **Ingen `route.ts` är rörd.** De gamla komponenterna i `src/components/auth/` används inte längre av de här sidorna och står kvar för P5.

### Beslut
- **Citat och tal** som är säkerhetslöften står kvar tills ägaren har svarat (B-30, textbeslut Del 5).
- **Skissens strykningar** av stämplarna "Mottaget" och "Godkänt" och etiketterna "Kontoåtkomst" och "Bekräftelse" är genomförda. De sidorna har `noindex` eller ligger utanför SEO-listan.

### Ny text utan godkännande
- **Tankstreck borttagna i befintlig text:**
  - "Nästan inne. Välj något du faktiskt kommer ihåg." (Välj nytt lösenord)
  - "Nytt mejl skickat, kolla din inkorg" (Bekräfta e-post)

### Avvikelser från skissen
- **Citaten och talen** står kvar i en panel (B-30).
- **Felraden** använder `--fel`-tokens i stället för skissens hexvärden.

### Återstår
- Klicktest av alla lägen: `?confirmed=true`, `?reset=success`, `?error=oauth`, fel lösenord, skickat mejl, giltig och ogiltig återställningslänk, verify-email och `?steg=halvvags`.
- Nya och omskrivna filer har LF-radslut. Git gör om dem till CRLF.

## Rader i undantagsfilen

- Inga nya rader från P1. Inga rubriker, FAQ-frågor, länkar eller schemablock har bytts utöver det som redan står i undantagsfilen. Det gäller till exempel `LANK_BYTT` för `/` och FUN-7 och FUN-8.
- De nya rubrikerna har SEO:s JA eller står i `nytt-innehall.md`:
  - /funktioner: h2 "Sökta tjänster" och h3 "Åtta testtyper, tre nivåer", "Resultatet, uppgift för uppgift", "Inför intervjun" och "Bli upptäckt".
  - /priser: h3 "Sökta tjänster" och "Inför intervjun".
  - `/`: h3 "Håll koll på var varje ansökan står".
- Fäller grinden på någon av dem som ny rubrik, skriv den i `RUBRIK_BYTT` som ny, med skälen SEO-beskedet avsnitt 3 och 4 och GEM-12/B-9. För `/` gäller i stället anvisningen ovan (stycke).

## Kontroller

- `node C:\Users\chris\cvbrev\scripts\arbetsyta.mjs`: 2,3 GB ledigt före typkontrollen.
- Typkontrollen kördes efter alla kodändringar; efteråt ändrades bara loggen.
- `npx tsc --noEmit` kördes en gång i slutet av paketet: inga fel i P1:s filer. Enda felet i hela trädet ligger i P4:s fil `src/app/(public)/verktyg/bli-upptackt/components/BliUpptacktExempel.tsx:53` (TS2367).
- Inte körda: vitest (berörda: `src/lib/plans/__tests__/gratis-copy.test.ts`, `src/components/pricing/__tests__/paket-copy.test.ts`, `src/components/registrering/__tests__/*`, `src/components/publikt/__tests__/registrering-prov-kontrakt.test.tsx`), dev-server, build, webbläsare, SEO-diff. Integrationen (P5) gör dem.
- Inga anrop mot produktionen eller databasen.
