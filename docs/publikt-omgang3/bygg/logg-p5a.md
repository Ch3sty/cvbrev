# Logg P5a, efterarbetet (2026-11-22)

P5a knyter ihop det som blev över efter P0 till P4, för in SEO:s slutbesked och saas-leads godkända förslag, och bygger det som skalades ner. Arbetet är gjort på `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3` och utgår från `ebe3ee0c`. Det är committat och inte pushat. Ingen server, inget bygge, ingen webbläsare, ingen SEO-diff och inga anrop mot produktionen.

Två gafflar delade arbetet, i olika filer:
- **Gaffel A:** Sökta tjänster, Jobbcoachen, artikelreklamen och ART-17/18.
- **Gaffel B:** /for-rekryterare, /rakna-ut och /jobbkartan.

Huvudagenten gjorde resten, och committade allt.

Brevflödets filer är inte rörda. Det som ska in där står i `kvar-brev.md`.

## Före push

- Inga migreringar.
- Inga nya rader i `scripts/seo-baslinje/publikt-omgang3-undantag.json`. Inget byte nedan tar bort eller byter en rubrik, en FAQ-fråga, ett schemablock eller ett länkmål, och slutbeskedet avsnitt 6 säger detsamma.
- Två saker grinden kommer att visa som nya länkar, och båda är avsiktliga:
  - fotens `/cv-mallar#yrken`
  - reklamens `/verktyg/cv-analys#mini-analys` (K8)

## 1. Grunden (`src/components/publikt/v3/`)

### Felet med kort på ett färgblock
- **Felet:** öns regler `.p3-o :is(.p3-h2, .p3-h3)` och `.p3-o :is(.p3-varde, .p3-liten)` hade samma specificitet som pappersreglerna men stod efter dem. Premiums regler betedde sig likadant. Därför fick ett kort på en ö, eller ett papper på Premium, ljus text på vitt.
- **Rättningen:** pappersreglerna står nu efter öns och Premiums regler i `v3.css`, i blocket "Papper vinner". De har också fått regler för `.p3-gratisrad`, `.p3-lank` och `.p3-bockar li` på papper.
- **Sidornas lokala nödlösningar är borttagna:**
  - `bli-upptackt.css`: två regler
  - `jobbcoachen.css`: en regel
  - `sokta-tjanster.css`: gratiskortet på Premium
  - /verktyg/linkedin-optimering: "Varför du inte syns i dag" är tillbaka som `.p3-o`, i stället för `.p3-vagg`
- **Kvar i brevflödets fil:** `personligt-brev.css` rad 194 och 195 (se `kvar-brev.md`).

### Byggt ur önskemålen
- **`CvArk` med nålar per del.**
  - `ArkDel.nal` och den nya propen `namnNal` tar ett tal, en lista med tal eller `null`. Flera nålar på samma del ritas i en stapel (`.p3-nalar`).
  - `vald` matchar delens nålnummer.
  - Perioderna i Saras ark är "2021 till nu", "2018 till 2021" och "2013 till 2018" (punkt 43). Förut stod de med tankstreck.
- **`ByggarArk` (ny), arket som byggare enligt `delar/skapa-cv-ark.html`.**
  - Innehållet: ett öppet avsnitt med kopparram, riktiga punkter, Jobbcoachens förslag markerat, "Skriv punkter åt mig", grå exempeltext, "+ Lägg till utbildning" och verktygsraden (typsnitt, mallens färger, Byt mall, PDF eller Word).
  - Numrerade nålar per del, per punkt och på verktygsraden.
  - Saras meriter följer `Brevpar` utan belopp: "Ledde en ombyggnad inom budget och två veckor före plan." och "Drev fyra upphandlingar enligt LOU, från förfrågningsunderlag till tilldelning." Skissens "42 miljoner" och "ställverket i Kungälv" är inte med.
- **`Testram` tar egna figurer.**
  - Brädets rutor och `svar.figur` kan vara ReactNode: bankernas ritare (`FigurV7`, `SpatialSvg`, `MatrisFigur` med fyllning) eller tal.
  - Nya props: `referens` (referensfiguren i spatial förmåga) och `styckeFritt` (stycket utan vit ruta).
  - Grundens figurnamn fungerar som förut.
- **`IntervjuKort` (ny), bilden för Inför intervjun.**
  - Visar en sökt tjänst med bokad intervju och intervjuprovets frågor med betyg.
  - Frågornas namn läses ur intervjuprovets bank (`FRAGOR`) och antalet ur `FRAGA_ORDNING`. Arbetsgivaren är påhittad (Polhem Ombyggnad).
  - Byggd ur P4:s kort på Sökta tjänster.
- **`Filterchips`, `SokFalt`, `Situationsrad` och `SokIkon` i nya `Val.tsx`.** Klasserna är `.p3-filter`, `.p3-sok`, `.p3-sok-falt` och `.p3-situation`. Alla är serverkomponenter och fungerar utan JavaScript. Situationsraden har också ett pappersläge.
- **`MallMiniatyr`:**
  - alt-texten är "CV-mallen X" eller "Brevmallen X" (förut "Mallen X")
  - ny prop `alt`, med tom sträng för dekor
  - `chip="gratis"` visar chipet bara på gratismallarna
- **`LankBricka`:** ny prop `rubrikNiva: 'b' | 'h3'`. Namnet har klassen `.p3-lb-namn`.
- Hjälpklassen `.p3-dold`.

### Sidornas kopior utbytta mot grundens
| Sida | Före | Nu |
|---|---|---|
| /cv-mallar | `fieldset.cvm-filter` med egna chip | `Filterchips`, med samma id `cvm-f-*` så att filtret med `:has` fungerar som förut |
| /cv-mallar | `.cvm-situation` | `Situationsrad` i pappersläge |
| /cv-exempel | `.cve-sok`, `.cve-sok-falt`, `.cve-sr` | grundens klasser i `CvSok.tsx`; filtret i klienten är orört |
| /cv-exempel | `.cve-situation` | `Situationsrad` |
| /verktyg/sokta-tjanster | `.st-ivkort` med egen `Betyg` | `IntervjuKort` |
| /verktyg/jobbmatchning | Saras ark utan nålar | `CvArk` med nålarna 1 till 6 på samma delar som korten: Plats på kontaktraden, Yrkesroller och Erfarenhetsnivå i erfarenheten, Kompetenser, Utbildning, Språk |
| /verktyg/skapa-cv | `CvArk` och egen `.skc-verktygsrad` | `ByggarArk` i hjälten, och `ByggarArk` med nålarna 1 till 4 och verktygsraden på plattan; nålarna är plattans fyra punkter |
| /verktyg/rekryteringstester | `Talrad`, `FigurUppgift`, `.rt-fritt` och `:has`-hacket | `Testram` med talen, `FigurV7` och `SpatialSvg` direkt i brädet och klossarna; ordförrådet med `styckeFritt` |
| Artikelreklamen, provkortet | `ProvMatris` på ett papper | den riktiga expertuppgiften (v7e-plus-p2-17) i `Testram`, med fyllning, nivån Expertnivå och antalet ur `TESTTAL.matrisExpert` |
| /verktyg/linkedin-optimering | egen `lnk-steg5` | `VagSteg` (fem steg blir tre plus två, bilden överst på dator); HowTo och h3 är oförändrade |
| /for-rekryterare | egna `fr-insikt`-kort | `LankBricka rubrikNiva="h3"`; h3 står som i baslinjen |
| /priser, kortet Inför intervjun | ingen bild | `IntervjuKort` |

## 2. Menyn och foten

- **`LandingNavbarMega.tsx`, underraderna:**
  - LinkedIn: "Rubrik och sammanfattning som hittas"
  - Jobbcoachen: "Intervju, avtal och avslag"
  - Sökta tjänster: "Håll koll på dina sökta jobb"
  - Personligt brev: "Skrivet mot annonsens krav"

  Gäller punkt 26 och 28.
- **Märket Nyhet** är `::after` på länkens namn (`.p3-med-nyhet` i `ram.css`), både i datormenyn och i telefonmenyn. Ankartexten är exakt "Sökta tjänster". Kommentaren i `nav-data.ts` säger att märket tas bort 2027-01-12 (punkt 24).
- **Foten:** "CV-mallar per yrke" pekar på `/cv-mallar#yrken` (`nav-data.ts`). `id="yrken"` sitter på `<Sektion>` med rubriken "CV-mallar för ditt yrke" i `CvMallarPageContent.tsx`. Länken "CV-mallar" till `/cv-mallar` står kvar.

## 3. SEO:s slutbesked, punkt för punkt

"Står" betyder att koden redan följer beskedet; det är kontrollerat. Filer med ett sökbart citat anges med fil och, där det går, rad.

### Avsnitt 1, listan Stämmer inte (71 punkter)

| Punkt | Besked | Var |
|---|---|---|
| 1 till 5, 8, 9 | Står | `sokta-tjanster/page.tsx`, `sokta-tjanster-data.ts` (gaffel A kontrollerade) |
| 6, 7 | JA MED ÄNDRING, införd | Regelrutan ordagrant: `sokta-tjanster/page.tsx` rad cirka 678 till 681 (gaffel A) |
| 10 | Införd | Sökta tjänster: `STATUS_META.test_invited.label` (tre ställen) och `BESKED_DAGAR` (gaffel A). `paket-copy.ts`, kortet Inför intervjun: `ord(INTERVJU_BESKED_DAGAR)`. Förväntan i `paket-copy.test.ts` |
| 11 till 14 | Står | `Startsidan.tsx`; h3 "Håll koll på var varje ansökan står" står som h3 |
| 15, 17 till 20 | Står | `FunktionerSida.tsx` |
| 16 | JA, införd | `paket-copy.ts` rad 225: "Redigera, välj mall och skicka. Nedladdning ingår i Premium.". `priser/page.tsx` rad 441: stegets rubrik "Redigera, välj mall och skicka". Löptexten på `paket-copy.ts:219` står. Ny förväntan i `paket-copy.test.ts` |
| 21 till 23 | Står | `priser/page.tsx`, `priser-data.ts` |
| 24 | JA, står | Etiketten "Gratis för alla med konto" på kortet (`priser/page.tsx`); märket i menyn har en kommentar med datumet |
| 25 | JA, står | `priser-data.ts:192` |
| 26 | JA MED ÄNDRING, införd | Se avsnitt 2 ovan |
| 27 | Står | Menyn och foten |
| 28 | JA, införd | `LandingNavbarMega.tsx` (`UNDER`) |
| 29 | Står | |
| 30 | Ägarens | Citatet och "100% krypterat" och "24 h" står |
| 31 | JA, står | `LoginFlode.tsx` rad 199 till 210 har inget `aria-hidden` på de fyra blocken (P1 hade redan tagit bort det) |
| 32 | Står | `OmOssSida.tsx` |
| 33, 36, 37, 38 | Står | |
| 34 | JA, införd | `rekryteringstester/page.tsx`, brickan: "Upp till 20 %" |
| 35 | JA, införd | `rekryteringstester/page.tsx`, ingressen till Så fungerar det, enligt `nytt-innehall.md` rad 2095: "Från första uppgiften till färdig rapport. ... Alla tester går till på samma sätt: en startskärm som säger vad som gäller, uppgifterna med klocka och framstegsstapel, och ett resultat där varje uppgift går att öppna." |
| 39 | JA, står | `CVAnalysMini.tsx:89`, `cv-analys/page.tsx:216` |
| 40 | JA, införd | "Släpp din CV-fil här" står bara på den riktiga släppytan (`CVAnalysMini.tsx:183`). Vägen till 100: "Förslagen gör jobbet åt dig" är bytt mot lydelsen i `nytt-innehall.md`: "**Poängen och genomgången är gratis.** Jobbcoachens förslag tar dig en bit på vägen, resten fyller du i själv." (`cv-analys/page.tsx` rad cirka 301) |
| 41, 42, 44 | Står | |
| 43 | JA, införd | `CvArk.tsx` (`SARA_DELAR` och förvalet), `ByggarArk.tsx`, `jobbmatchning/page.tsx` (`JM_ARK`), `linkedin-optimering/page.tsx` (profilarket, tre perioder). Befintlig exempeldata i `cv-mallar/[yrke]/YrkesmallExempelData.ts` är inte rörd (avsnitt 5 regel 6) |
| 45 | Införd | `linkedin-optimering/page.tsx`: etiketten är "Fem steg" (förut "Fem steg, fem minuter") |
| 46 | JA, införd | `personlighetstest/page.tsx:136`: "Inget krav i den här profilen". Sjätte kravprofilen heter redan "Lager, produktion och drift" (`smakprov-tolkning.ts:236`) |
| 47 | Står | |
| 48 | Ägarens | Fotnoten står |
| 49 till 58 | Brevflödets filer | Se `kvar-brev.md`. 52, 54, 56, 57 och 58 står redan i koden |
| 59 | JA MED ÄNDRING, införd i P5a:s filer | `CvExempelKategori.tsx` (meningen och länken), `CvExempelNav.tsx`, `exempel/components/GalleriPageContent.tsx`. `KategoriPageContent.tsx` hade samma rader men används inte och är borttagen. Brevsidornas tre ställen står i `kvar-brev.md` |
| 60 till 62, 64, 66, 67 | Står | |
| 63 | JA MED ÄNDRING, står | Träffkortet visar grundens Nordhaga Bygg, Göteborg och Västlänken Konsult, Mölndal (gaffel A kontrollerade). Annonslappen på /verktyg/personligt-brev hör till brevflödet |
| 65 | JA MED ÄNDRING, införd | `jobbcoachen/page.tsx`: etiketten rad cirka 220, brickorna rad cirka 238 och 239 (talet ur `KALLOR.length`), lyftets rubrikrad rad cirka 275. Varken "Källa till varje svar" eller "Sekunder till första svaret" finns kvar i src eller content (gaffel A) |
| 68 | JA, införd | `reklam-copy.ts`, `JOBB_KORT.sokta` (gaffel A) |
| 69 | JA MED ÄNDRING, införd | `ArtikelReklam.tsx`, `BREVKORT_STYCKEN` (gaffel A) |
| 70 | Står | |
| 71 | JA, inget att föra in | Lydelsen hör till beskrivningen "CV som Word, lång" i `nya-funktioner.md` och `nytt-innehall.md`, som är underlag för nya artiklar. Ingen sida visar beskrivningen |

### Avsnitt 2, saas-leads förslag
| Förslag | Var |
|---|---|
| K1 | `SOKT_KONTO_HREF` i `src/lib/jobbsok/provaSokt.ts`, använd av hjälten, arket, Premiumytan, slutblocket och den fasta knappraden (gaffel A) |
| K2 | `sokta-tjanster/page.tsx` rad cirka 793 (gaffel A) |
| K3 | Hjältens knapp är koppar. Arkets knapp är `.st-arkknapp`, koppar i telefonen och vit från 1000 px (gaffel A) |
| K4, JA MED ÄNDRING | `Startsidan.tsx`, brevblocket: "Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland {BREV_MALL_ANTAL} mallar, där {BREV_GRATIS_NAMN} är gratis, och fem toner." |
| K5 | `Startsidan.tsx`, matchningens gratisrad: "{Tre} träffar, med skälen utskrivna" (talet ur `FREE_TIER_JOB_LIMIT`) |
| K6 | Ägarens. Raden under köpknappen står |
| K7 | `FunktionerSida.tsx`, Premiumytan. Köpknappen är `PriserKopKnapp` med `PAKET_KORT.allt.knapp`, alltså `kopKnapp()`, med kampanjpriset som på /priser. "Se vad som ingår" står som `TextLank` till `/priser`. `PriserKopKnapp.tsx` har fått två props, `yta` och `plats` (standard `public_pricing` och `priser`), så att köpet från /funktioner mäts som `public_features` och platsen `funktioner`. Logiken i övrigt är orörd |
| K8 | `reklam-copy.ts`, `INLINE.analys.href` = `/verktyg/cv-analys#mini-analys`. Ankaret finns i `CVAnalysMini.tsx:79` (gaffel A) |
| Arket på Sökta tjänster | Se avsnitt 4 |
| `data-cta-variant` | `jobb-matchning` och `jobb-sokta` med `data-cta-klick` fanns redan (gaffel A kontrollerade) |
| Del 3 punkt 3 | `priser/page.tsx`, Premiumytan: "Ingen bindningstid." Meningen om förnyelsemejlet är struken. Kom igång (`paket-copy.ts:297`) står |

### Avsnitt 3, byggarnas nya text
- **P0 och P1:** står som beskedet säger. Underraderna och märket är införda (avsnitt 2 ovan), "sju" läses ur konstanten och brevkortets sista steg följer punkt 16.
- **P3:** står i `kvar-brev.md`.

### Avsnitt 4, /verktyg/sokta-tjanster
- Ändringarna 1 till 4 är införda av gaffel A, se punkt 7, K2, K1 och punkt 10.

**Datavillkoret för arket**
- **Hur PostHog sätts upp:** i `src/components/PostHogProvider.tsx`, med autocapture och sidvisningar påslagna och utan `before_send` eller `sanitize_properties`. Varje `$pageview` bär alltså hela `$current_url` med frågesträngen.
- **Villkoret höll inte i P4:s version.** Redirecten bar tjänst, arbetsgivare och sista dag i adressen, så värdena skulle ha nått PostHog.
- **Nu håller det.** Adresserna bär bara `?logga=1` eller `?logga=ska-soka`, också vid svar 400 i `claimPendingSokt`. Förifyllningen går bara genom webbläsarens lagring (`jc_sokt_prova`, 24 timmar), som PostHog inte läser:
  - Efter registreringen skapar valkommen-kedjan tjänsten som förut.
  - Loggar besökaren in i stället, fyller kontots ark i sig ur utkastet. Det sköter `soktUtkastSomForifyllt()` i `provaSokt.ts`, med en liten ändring i `src/components/jobb3/sokta/SoktaVy.tsx`, och utkastet tas bort efteråt.
- **Inga händelser bär värdena.** Arket skickar inga egna händelser, autocapture tar inte fältvärden och knappens adress är fast.
- **Arket i övrigt:** riktiga fält med synlig `<label>`, inga h-taggar, `aria-label="Logga sökt tjänst"`, tomma fält med platshållarna "Till exempel projektledare" och "Arbetsgivarens namn", och knappen är en vanlig `<a href>` med K1:s adress, som fungerar utan JavaScript.
- **Utanför omgången:** kontots äldre förifyllning från Matchade jobb (`soktaHref`) har fortfarande tjänst och arbetsgivare i adressen. Den är inloggad och inte rörd. Ägaren bör veta om det (datalagring).

### Avsnitt 5, regeln för tal i exempel
- `linkedin-optimering/page.tsx`, rubriken i bilden: "Projektchef energi | Offentlig upphandling enligt LOU | Ombyggnader i tid och inom budget".
- `LinkedinOptimeringLiveDemo.tsx`: "De senaste tre åren har jag drivit fyra upphandlingar enligt LOU och hållit ihop tidplan, budget och underentreprenörer i varje projekt."
- `FunktionerSida.tsx`, LinkedIn-kortet: "Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar".
- `skapa-cv/page.tsx`, Jobbcoachens förslag i hjälten: "Ledde ett team på tolv personer" var en ny merit som inte finns i Saras brev. Den är bytt mot "Höll ihop tidplan och underentreprenörer", ur SEO:s LinkedIn-lydelse.
- `ByggarArk` och `CvArk` har inga belopp.
- De gamla telefonskärmarna med beloppen (`SkarmBrev`, `SkarmSkapaCv`, `SkarmLinkedin`) är borttagna.
- **Kvar:** "42 miljoner" står kvar på två ställen i `verktyg/personligt-brev/page.tsx` (rad 126 och 150), som hör till brevflödet. Se `kvar-brev.md` punkt 5.

### Avsnitt 6, undantagsfilen
- Inte ändrad. Inga nya rader behövs (se Före push).

## 4. Det som skalats ner eller blev över, byggt

**Ombyggda sidor (gaffel B)**
- **/for-rekryterare:**
  - Byggd på grunden: `Hjalte`, `SektionHuvud`, `Kort`, `VagSteg`, `PremiumO`, v3 `Faq`, `LankBricka` med h3.
  - `PubliktSida` och `Rum` är borta.
  - Rubrikerna har samma text, nivå och ordning, och Service och FAQPage är oförändrade.
  - `Traffkort` och `Profilkort` är portalbilder och har fått grundens kanter i `for-rekryterare.css`.
- **/rakna-ut och de nio kalkylatorsidorna (`KalkylatorSida.tsx`):**
  - Grundens skal. `SkarmCoach` är ersatt av grundens `Samtal`, och den gamla `Breadcrumb` står kvar, eftersom den skriver BreadcrumbList.
  - Kalkylatorerna själva är orörda, eftersom artiklarna och /embed använder dem. Justeringarna står i nya `rakna-v3.css`.
- **/jobbkartan:**
  - Grundens skal och v3 `Faq` med samma id och FAQPage.
  - Kartan står på en ljus yta på väggen.
  - `jobbkartan.css` delas med /embed och är orörd. Justeringarna står i nya `jobbkartan-sida.css`.

**/priser**
- Kortet Inför intervjun har nu en bild (`IntervjuKort`).

**Gratisraden och knapparna för provet**
- `rekryteringstester/page.tsx` läser gratisraden ur `GRATIS_TESTRAD_PROV`, som nu säger "Fem uppgifter gratis här." (gaffel A, i `gratis-copy.ts`, med test). Ingen mejlmall läser konstanten.
- `artikel-kluster.ts`: "Prova fem uppgifter gratis".
- `StickyMobileCTA.tsx`: "Prova fem uppgifter gratis", i båda klustren.

**/exempel**
- `ExempelIcons.tsx` har grundens tokens i stället för orange, röd och slate hex (önskemål från P4).

**Intervjurådet bakom kontot**
- Testet `personlighetsprov-resultat.test.tsx` låser att intervjuråden (`INTERVJU`) inte står på /verktyg/personlighetstest, eftersom de hör till tolkningen i gratiskontot. P2:s ö "Frågor rekryteraren lär ställa" visade dem.
- **Beslut:**
  - Frågorna står kvar.
  - Under "Så svarar du" står: "Rådet för just den här frågan står i tolkningen när du har sparat profilen med ett gratiskonto."
  - Samma sak gäller personlighetsplattan på /verktyg/rekryteringstester: "Så kan du svara: rådet står i tolkningen när du har sparat profilen med ett gratiskonto."
  - Ny text utan godkännande, båda raderna.
- **Ordantal:** blocket är nytt i den här omgången, så baslinjen tappar inget.

**Testet för REK-4**
- `regel-r1.test.ts` låste CV-raden från före REK-4 (push 2). Förväntan är nu textbeslutets lydelse "Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn".

**Inte byggt, med skäl**
- **Skärm 2 och 3 i registreringen och köpsteget.** De är inloggade, och slutbeskedet punkt 29 säger att de inte byggs.
- **Gratis- och Premiumraderna (`NIVA`)** på /priser och /funktioner står kvar som konstanter i sidorna. Att flytta dem till `paket-copy.ts` är en ren städning utan synlig verkan, och den lämnas till nästa omgång.
- **`opengraph-image.tsx` på /funktioner** (&-tecknet). Inget beslut täcker den.
- **B6, raden `analys` i `komigang.ts`.** Citatet i textbeslutet pekar på två olika rader (bygglogg-text). Jag gissar inte vilken som avses.
- **LinkedIn-profilytan och kandidatkortet** till grunden. Bara en sida använder var och en, och regeln säger att något flyttas till grunden först när fler än en sida har det.
- **`PremiumO` med bild och `Hjalte` med egen schemabrödsmula** (gaffel B:s önskemål). Sidorna löser det med egen markup på grundens klasser.

## 5. Borttaget (efter sökning i src och scripts, också testerna)

Ett skript listade varje fil i mapparna som ingen annan fil importerar. Varje fil kontrollerades också med namnsökning: bara kommentarer nämner dem.

**Den gamla förhandsvisningen**
- `src/app/forhandsvisning-publikt/page.tsx`, förhandsvisningen av v2: 404 i produktion, och den enda som importerade de gamla skärmarna. `/forhandsvisning-publikt/v3` och `/forhandsvisning-publikt/innehall` står kvar.
- De gamla klicktesten `scripts/klicktest-publikt-v2*.ts` pekar på den borttagna sidan.

**Telefonskärmarna** (`src/components/publikt/telefon/skarmar/`)
- `SkarmAktivera`, `SkarmAnnons`, `SkarmBana`, `SkarmBliUpptackt`, `SkarmBrev`, `SkarmCoach`, `SkarmIntervjufragor`, `SkarmLinkedin`, `SkarmMallar`, `SkarmMatchning`, `SkarmMatris`, `SkarmNivakoll`, `SkarmPersonlighet`, `SkarmSkapaCv`, `exempelprofil.ts`.
- `SkarmCvAnalys` står kvar, eftersom `ExempelMall.tsx` (i brevflödets mapp) fortfarande importerar den (`kvar-brev.md` punkt 15).

**v2-komponenter utan användare**
- `src/components/publikt/`: `LankLista`, `PrisTabell`, `ProvaKort`, `Station`, `SvavandeObjekt`, `VerktygsMall`, `Objekt`, `Steg`.

**Menyn**
- `src/components/landing/NavIkon.tsx`.

**De gamla auth-komponenterna** (P1:s nya formulär har ersatt dem)
- `src/components/auth/`: `AuthShell`, `forgot-password-form`, `reset-password-form`, `AuthCvPaper`, `AuthInput`, `AuthLeftPanel`, `AuthSubmitButton`, `SuccessStamp`, `TypewriterQuote`.

**/exempel**
- `src/app/(public)/exempel/components/KategoriPageContent.tsx`: ingen sida använder den sedan P2 och P3.

**Lokal CSS som grunden nu bär**
- `.cvm-filter` (chipen) och `.cvm-situation` i `mallar-v3.css`.
- `.cve-sok*` och `.cve-situation` i `exempel-v3.css`.
- `.st-iv*`, `.st-fragarad` och `.st-betyg` i `sokta-tjanster.css`.
- `.skc-verktygsrad` i `skapa-cv.css`.
- `.rt-fritt`, `.rt-ref` och `.rt-figkloss` i `rekryteringstester.css`.
- `.ar-matris` i `reklam.css`.
- `.lnk-steg5` och `.lnk-b` i `linkedin.css`.
- `.fr-insikt` i `for-rekryterare.css`.

**Inte borttaget**
- **I brevflödets mappar:** `ExempelMall.tsx` och `StartFlowIllustrations.tsx` (`kvar-brev.md`).
- **Redan döda före omgången, utanför uppdraget:** `src/components/illustrations/ClusterIcons.tsx`, `JobbmatchningIllustrations.tsx`, `ProfileIllustrations.tsx`, `SubscriptionIllustrations.tsx`. Ingen importerade dem på `ebe3ee0c` heller.
- **Döda klasser** i delade CSS-filer (`publikt.css`, `rakna.css`): filerna delas med artiklarna och /embed, och klasserna påverkar inget.

## 6. Artiklarna (ART-17 och ART-18, gaffel A)

**`content/artiklar/soka-jobb-via-mail.mdx`**, sex rader:
- rad 5: `updated: "2026-11-22"`
- FAQ i frontmatter (rad 21) och synligt (rad 202): bara tidsuttrycket "efter en till två veckor"
- snabbsvaret, rad 34
- rad 160: B-23:s lydelse med länken till `/verktyg/sokta-tjanster`
- rad 162: exemplets etikett, som är ett `<p>` och ingen rubrik

**`content/artiklar/uppfoljning-efter-intervju.mdx`**, två rader:
- rad 5: `updated`
- rad 206: meningen sist i första stycket under "När och hur gör man en ytterligare uppföljning?", med länken till `/verktyg/sokta-tjanster`

**I båda filerna**
- Radsluten (CRLF) är bevarade, och diffen är kontrollerad: inget annat har ändrats.
- Undantagsfilen täcker redan båda (`LD_UNDANTAG`).
- "tolv" och "sju" står utskrivna, eftersom MDX inte läser konstanter. De stämmer med konstanterna.

## 7. Det som är ägarens och lämnas

- Priser och gränser.
- K6 och förnyelsemejlet till alla betalande (Del 3 punkt 3). "Ingen bindningstid." står tills ägaren har svarat.
- **GEM-4:** listan i `plans.ts` läses av kvotväggsmejlet.
- **B4:** `GRATIS_TESTRAD` läses av ett kampanjmejl.
- Citatet, "100% krypterat" och "24 h" på Glömt lösenordet.
- Fotnoten om sju dagar på personlighetstestet.
- **Sökta tjänster:** frågan "Vem kan se mina sökta tjänster?" och raden "ingen där ser ditt konto".
- **Jobbcoachen:** frågan "Vad vet Jobbcoachen om mig?".
- **Bli upptäckt:** arbetsgivaren efter ett ja, och "percentiler".
- **Integritet och datalagring:** alla FAQ-svar om säkerhet och datalagring, samt /integrationer utöver färgerna.
- **Ny fråga till ägaren:** kontots förifyllning från Matchade jobb bär tjänst och arbetsgivare i adressen (se avsnitt 4).

## 8. Ny text utan godkännande (P5a)

- Under "Så svarar du" och "Så kan du svara" (se avsnitt 4).
- **`IntervjuKort`:** ingressen räknas ("Två av de sju vanligaste frågorna är övade."). Den tredje frågan heter nu bankens "Varför söker du jobbet" i stället för P4:s "Varför vill du ha jobbet?".
- **`ByggarArk`:** Saras profiltext, kompetenser och språk ur skissen, och de två punkterna utan belopp.
- **Artikelreklamens expertuppgift:** "Expertnivå", "1 av {antal}" och grundens fråga "Vilken figur hör hemma i den tomma rutan?". Allt står i `role="img"` med `aria-label` "Exempel: ...".
- **Skapa CV:** förslaget "Höll ihop tidplan och underentreprenörer".

## 9. Kontroller

- **Ledigt minne** (`node C:\Users\chris\cvbrev\scripts\arbetsyta.mjs`): 2,4 GB före första typkontrollen och 3,1 GB före den sista.
- **`npx tsc --noEmit`:** kördes efter grunden och sidbytena, och igen sist efter städningen. Båda gångerna utan fel.
- **vitest, en process i taget:** 31 testfiler, 434 tester, alla gröna i sista körningen. Filerna:
  - `src/components/publikt/__tests__` (alla)
  - `src/components/pricing/__tests__/paket-copy.test.ts`
  - `src/components/artiklar/reklam/__tests__` (alla)
  - `src/app/(public)/verktyg/rekryteringstester/__tests__`
  - `src/lib/plans/__tests__` (alla)
  - `src/lib/jobbsok/__tests__`
  - `src/components/jobb3/sokta/__tests__`
  - `src/components/paywall/__tests__/paywall-copy.render.test.tsx`
  - `src/lib/jobmatching/__tests__` och `src/components/registrering/__tests__`, i första körningen
- **Två fel var äldre än P5a, och båda är rättade:**
  - `personlighetsprov-resultat.test.tsx` (intervjuråden på sidan, se avsnitt 4)
  - `regel-r1.test.ts` (CV-raden efter REK-4)
- **Inte körda:** server, bygge, webbläsare och SEO-diff. Det gör grindagenten.
- **Att titta på i webbläsaren först:**
  - nålarna på jobbmatchningens ark (stapeln på erfarenheten)
  - `ByggarArk` på skapa-cv:s platta, där nålarna står utanför arket i ön
  - expertuppgiften i reklamkortets 272 px-spalt
  - `Filterchips` på /cv-mallar
  - märket Nyhet som `::after` i telefonmenyn
  - de tre ombyggda sidorna (gaffel B:s lista: kartan på den ljusa ytan, kalkylatorernas ordning i telefonen och badgarna på /for-rekryterare i 375 px)
