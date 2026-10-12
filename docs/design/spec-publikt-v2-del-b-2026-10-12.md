# Byggspec: publika sidorna v2, del B (innehållssidorna)

Datum 2026-10-12. Gäller artiklarna och artikelarkivet, CV- och brevexemplen med hubbarna, Räkna ut (hubben och kalkylatorerna), Om oss, För rekryterare, Kontakt, och sidhuvud och sidfot på juridik- och hjälpcentersidorna. Byggs efter del A (`docs/design/spec-publikt-v2-del-a-2026-10-12.md`) och återanvänder dess tokens, rumsklasser och delade komponenter. Läs del A avsnitt 1 till 4 först; det som står där gäller här också och upprepas inte.

Skissen: `publikt-v2/preview-b.html` i sessionens scratchpad, byggd av `build-b.js` ur `parts/00-head.html`, `parts/07-css-innehall.html`, `parts/70-artikel.html`, `71-exempel.html`, `72-raknaut.html`, `73-foretag.html`, `parts/90-skript.html` och snuttarna i `innehall-snuttar.js` (artikelbilder, CV- och brevpapper, rekryterarportalen, träffkort) plus `skattedata.js`. Kopiera dessa till `docs/design/publikt-v2/` tillsammans med del A:s filer innan scratchpaden städas. Skissen har knappen "Mall och innehåll" i verktygsraden: streckade etiketter är mall (kod), heldragna orange etiketter är innehåll (frontmatter, MDX eller exempeldata).

Innehållssidorna bär nästan all organisk trafik (139 artiklar, 89 + 89 exempel, nio kalkylatorer). Därför är regeln här hårdare än i del A: **brödtexten, rubrikträdet, de interna länkarna, schemat och metadata ändras inte. Det som ritas om är ramen runt innehållet och de komponenter som innehållet redan använder.**

---

## 1. Idén i tre meningar

Läsrummet: början och slutet av varje innehållssida är färgblock med produkten i bild (artikelbilden, arket, kalkylatorn, träffkortet), och mitten är ett lugnt läsrum på ljus mark där texten får vara text. Komponenterna som redan finns i innehållet (snabbsvaret, tabellen, provkortet, länklistan, källorna, FAQ) lyfts till egna ytor så att den som skummar ser strukturen. Varje sida har en primär handling som hör till ämnet: en testartikel säger "Prova fem frågor", ett CV-exempel säger "Använd som mall", en kalkylator räknar direkt.

Rumsfärgen följer ämnet, inte sidtypen: testklustret indigo (tran), CV teal (cv), brev plommon (brev), lön och jobb grön (jobb), rekryterare och arkiv grafit (neu). Premium är alltid Bläck med gradientordet.

---

## 2. Komponenter

### 2.1 Från del A (samma namn, samma filer)

`Rum`, `Hjalte`, `Telefon` och skärmarna (`SkarmMatris`, `SkarmPersonlighet`, `SkarmIntervjufragor`, `SkarmCvAnalys`, `SkarmMatchning`, `SkarmCoach`, `SkarmBana`), `Vag`, `SvavandeObjekt`, `Objekt`, `PremiumBlock`, `Faq`, `ProvaKort`, `Steg`, `TalRad`, `LankLista`, `FastKnapprad`. Två tillägg i del A:s komponenter, som del B behöver:

| Komponent | Tillägg | Varför |
|---|---|---|
| `ProvaKort` | `rubrikNiva?: 'h2' \| 'p'` (standard h2), `bild?: ReactNode`, `not?: string` | Inne i en artikel får reklamkort inte ha h2/h3 (spärrlistan punkt 3, `TILLATNA_RUBRIKER` i seo-diff-skriptet). |
| `PremiumBlock` | `rubrikNiva` tillåter `'p'` | Slutkortet i artiklar och arkivet får ingen ny H2 på 139 sidor. |
| `Hjalte` | `bild` får vara artikelbild, ark, kalkylator eller kort; `ljus?: boolean` för hjälte på mark (Om oss) | Samma hjälte på alla innehållssidor. |

Expertfrågan (v7e-plus-p2-17, facit C) ska finnas som egen komponent `MatrisExpert` i `src/components/publikt/MatrisExpert.tsx` (rutnät plus sex alternativ, statisk SVG), så att `SkarmMatris`, matrisbrickan och artikelns provkort ritar samma fråga ur samma data.

### 2.2 Nya komponenter för del B

Alla serverkomponenter utom där det står klient. Sökväg `src/components/publikt/innehall/`.

| Komponent | Props | Ersätter |
|---|---|---|
| `ArtikelHjalte` | `kluster: CtaCluster`, `kategori: string`, `titel: string` (h1), `ingress: string` (frontmatter.description), `primar: {text, href}` (ur clusters.ts), `forfattare: Author`, `datum: string`, `lasminuter: number`, `bild: {src, alt}` | headern i `ArtikelRam` |
| `ArtikelLasning` | `headings`, `children` (MDX), `sidopaket: ReactNode` | grid och aside i `ArtikelRam` |
| `Innehall` | `headings`, `variant: 'sido' \| 'mobil'` | TOC i `ArtikelRam` (ArtikelKlient sköter den aktiva tråden som i dag) |
| `Faktaruta` | `children` | MDX-diven `my-8 bg-slate-50 border border-slate-200 rounded-lg p-6` (finns i 137 av 139 artiklar) |
| `Tabellram` | `children` | `div.overflow-x-auto` runt tabeller (33 artiklar) och nakna `<table>` (62 artiklar) |
| `Signatur` | `forfattare: Author`, `publicerad: string`, `uppdaterad?: string` | ny; injiceras före `<FAQContainer>` (finns i alla 139) |
| `LasVidare` | `relaterade: RelateradArtikel[]` (med `bild`), `verktyg`, `mestLasta` | relaterat, Verktyg och Mest lästa i `ArtikelRam` |
| `ArtikelKort` | `slug, titel, ingress?, kategori, datum, lasminuter, bild, stor?` | korten i `ArtikelLista` (H2 behålls) |
| `ExempelHjalte` | `typ: 'cv' \| 'brev'`, `yrke` (h1), `intro`, `primar`, `bevis: string[]`, `utdrag: ReactNode`, `lappar: {nr, rubrik, text}[]` (högst två) | `ExempelHero` |
| `ExempelArk` | `typ`, `html: string` (serverrenderad), `noter: Not[]`, `fot: string[]`, `cta` | `CvPreviewShell` + `InteractiveCVPreview` i första rendering |
| `Marginalnoter` | `noter: {nr, rubrik, text}[]`, `cta` | ny |
| `VarforLista` | `punkter: {titel, beskrivning, varfor?, notNr?}[]` | `VarforFungerarSection` |
| `TipsKort` | `tips: {titel, text, fore?, efter?, efterNot?}[]` | `TipsSection` |
| `YrkesKort` | `yrken: {yrke, slug, kategori, text?}[]`, `typ` | `RelateradeYrkenGrid` och hubbens kort |
| `AnsokanPar` | `yrke`, `har: 'cv' \| 'brev'`, `slug` | `CompleteApplicationPackage` |
| `SlutBand` | `rubrik` (h2), `text`, `knapp` | `FinalCTA` |
| `KalkylatorHjalte` | `titel` (h1), `kick`, `ingress`, `bevis`, `kalkylator: ReactNode` | headern i `KalkylatorSida` |
| `KalkylatorPanel` (klient) | `falt: ReactNode`, `resultat: ReactNode`, `action`, `knapp` | `KalkylatorSkal` |
| `Huvudtal` | `tal: string`, `text: string`, `stapel?: {andel: number, etiketter: [string,string]}` | resultatraden i `LonEfterSkatt` m.fl. |
| `Kallkort` | `kallor: {text, href}[]`, `not: string` | källistan i `KalkylatorSida` |
| `Lonebesked` | `lon, kommun, netto, tabell` (räknas på servern) | ny bild i hubbens hjälte |
| `StortalKort` | `href, kalkylator, rubrik (h3), text, tal, talText, stapel?` | toppkorten i `/rakna-ut` |
| `Tidslinje` | `steg: {nar, rubrik (h3), text, objekt}[]` | historien i `OmOssSida` |
| `Loften` | `loften: {rubrik (h3), text}[]` | löftena i `OmOssSida` |
| `Portal` | statisk | `ProductTour` i första rendering (turen kan ligga kvar som klientö under) |
| `Traffkort` | `kandidat` (ur `StaticCandidateCard`-datan) | `StaticCandidateCard` |
| `VerifieradBadge` | `test, niva, percentil, antal, forsok, datum?` | ny bild |
| `Profilkort` | profilexemplet | `RekryterareProfilExempel` |
| `Textmall` | `titel` (h1), `andrad?`, `headings`, `children` | ramen på juridiksidorna |

Gemensamt: knapparna i träffkort, telefoner och portal är `span`/`div`, aldrig länkar eller `.knapp` (en fylld knapp per sektion). Bilderna är `aria-hidden` utom artikelbilden, som har sin alt.

---

## 3. Per sidtyp

För alla: `generateMetadata`/`metadata`, canonical, `revalidate`, `generateStaticParams` och alla JSON-LD-generatorer står kvar oförändrade. Rubrikerna i bilaga B finns kvar med samma text och nivå.

### 3.1 Artikel `/artiklar/[slug]`

Filer: `src/app/(public)/artiklar/[slug]/page.tsx` (bara MDX-komponentkartan och två injektioner ändras), `src/components/artiklar/ArtikelRam.tsx` (skrivs om med komponenterna ovan), `src/components/artiklar/reklam/ArtikelReklam.tsx` (InlineKort, SidoPaketKort, SlutKort, GratisKort, ListaSlutKort ritas om; `reklam-copy.ts` och `clusters.ts` är fortsatt textkällan), artikel-CSS i globals.css (`.artikel-prose`).

| # | Sektion | Yta | Mall eller innehåll |
|---|---|---|---|
| 1 | Hjälte: brödsmula, kategori, H1, ingress, en knapp, författarrad, artikelbilden snett till höger (under texten på mobil) | Vägg i klustrets rum, Vag till mark | Mall. H1 = frontmatter.title, ingress = frontmatter.description, bild = frontmatter.image. Knappen ur `clusters.ts` (test: "Prova fem frågor gratis" till `/verktyg/rekryteringstester/prova`; cv, brev, intervju: klustrets befintliga mål; karriär utan produkt: ingen knapp, bara "Läs guiden"). Författaren ur `getAuthorForArticle`. |
| 2 | Läsrummet: innehållsförteckning (sticky till höger från 1024 px, dragspel överst på mobil), brödtexten i 68 tecken, sidopaketet under förteckningen | Mark | Ram = mall, brödtext = MDX orörd. |
| 2a | Snabbsvaret | Rummets ton, vänsterkant 6 px | Innehåll (MDX-diven). Mallen ritar den via `components.div`: klassen `bg-slate-50` + första barnet `h2` ger `Faktaruta`. H2-texten och id oförändrade. |
| 2b | Provkortet | Rummets ton | Mall. Injiceras där `InlineKort` injiceras i dag (`injectClusterCta`, efter andra stycket). Testklustret: `ProvaKort` med `rubrikNiva='p'` och `MatrisExpert`. Övriga kluster: samma kort med klustrets objekt i stället för matrisen. |
| 2c | Tabeller | Panel, rundad ram, sidledsscroll inne i ramen på mobil | Innehåll. `components.table` och `components.div` (klassen `overflow-x-auto`) ger `Tabellram`. Tabellerna förblir JSX-tabeller i MDX (minnesregeln om tabeller). |
| 2d | "Mer om ..."-listan | Panel, länkrader med pil | Innehåll. Ren CSS: `.artikel-prose p:has(> strong:only-child) + ul`. |
| 2e | Signaturen: författare, specialistområden, publicerad, granskad | Insänkt | Mall, injiceras före `<FAQContainer>`. "Uppdaterad" visas bara om frontmatter får fältet `updated` (se fynd 3). Källraden (`*Källor: ...*`) ligger kvar i MDX där den står. |
| 2f | FAQ | Del A:s `Faq`-utseende | Innehåll. `FAQContainer`/`FAQItem` ritas om; H2 "Vanliga Frågor (FAQ)" står kvar ordagrant; frontmatter.faq ger FAQPage som i dag. |
| 2g | Ämnen | Chips | Mall, taggarna som i dag. |
| 3 | Slutkortet | Bläck, tre telefoner (klustrets skärmar) | Mall: `SlutKort` blir `PremiumBlock` med `rubrikNiva='p'`. Texten ur `reklam-copy.ts`. |
| 4 | Läs vidare: tre relaterade med tumnagel, Verktyg, Mest lästa | Panel | Mall. `relateradeArtiklar` får `bild` ur frontmatter. Verktyg och Mest lästa är i dag länkar i innehållet enligt seo-diff-skriptet; de ligger kvar synliga på alla bredder. |
| 5 | Fast knapprad | | `StickyMobileCTA` står kvar (del A), restylad till del A:s `FastKnapprad`-utseende. |

Artikelbilden. Den första `<CustomImage>` i MDX (finns först i 60 artiklar, med `priority`) är i dag LCP-elementet och den bild seo-diffen kallar `forstaBild`. Regel: om innehållets första block är en `CustomImage` med samma `src` som frontmatter.image tas den bort ur brödtexten och ritas i hjälten med samma `src`, `alt`, `width={1536} height={1024}` och `priority`. Annars ritar hjälten frontmatter.image med alt = frontmatter.imageAlt om fältet finns, annars titeln, och MDX-bilderna står kvar där de står. På mobil hamnar bilden under författarraden, så LCP blir H1; på dator blir LCP bilden som i dag.

MDX-taggarnas Tailwind-klasser (`bg-slate-50`, `border-slate-300` med flera, 815 celler) lämnas i filerna; utseendet styrs av `.artikel-prose`-reglerna och komponentkartan, så att ingen av de 139 filerna behöver röras.

Schema: BlogPosting (med hasPart och speakable), FAQPage, HowTo (34 artiklar med `howto:`), BreadcrumbList. Oförändrade.

### 3.2 Artikelarkivet `/artiklar`

Filer: `src/app/(public)/artiklar/page.tsx`, `src/components/artiklar/lista/ArtikelLista.tsx`.

Hjälte på grafitvägg: H1 "Artiklar som förbättrar din jobbsökning", ingress, antalet som ett tal (räknat ur `getAllPostsMeta()`, aldrig hårdkodat), tre tumnaglar i solfjäder (dator), ämnesfiltret som länkar (`?tag=`) med antal. Listan: första kortet stort (bild och ingress), sedan tre per rad; varje kort behåller sin H2 och sin länk. `GratisKort` efter fjärde kortet. Sidnavigeringen som länkar. `ListaSlutKort` blir `PremiumBlock` (rubrikNiva 'p') med CV- och matchningstelefon. Schema CollectionPage, ItemList, BreadcrumbList oförändrat.

### 3.3 CV-exempel `/cv-exempel/[yrke]` och brevexempel `/personligt-brev-exempel/[yrke]`

Filer: `src/app/(public)/cv-exempel/[yrke]/CVExempelPage.tsx` och `page.tsx` (bara renderingen av arket), `src/app/(public)/personligt-brev-exempel/[yrke]/PersonligtBrevExempelPage.tsx`, `src/components/exempel-shared/*` (ritas om), `CompleteApplicationPackage.tsx`. Datan (`exampleData` i page.tsx, `exempel-data.ts`) är innehållet.

| # | Sektion | Yta | Rubrik (oförändrad) | Mall eller innehåll |
|---|---|---|---|---|
| 1 | Hjälte: brödsmula, kick "CV-exempel" / "Personligt brev-exempel", H1, intro, "Använd som mall", tre bevis, ett utdrag ur arket snett med en eller två lappar | Vägg cv / brev | H1 = `yrke` | Utdrag och lappar ur `exempelCV`/`exempelBrev` och de två första noterna. |
| 2 | Arket med marginalnoter | Mark | H2 "Komplett CV-exempel som inspirerar" / "Komplett exempel på 60 sek" | Arket serverrenderat (se nedan). Noterna = `varforDetFungerar`-punkter med fältet `ankare`; numren står i arket vid ankaret. Kortet "Använd som mall" sist i marginalen. |
| 3 | Varför det fungerar | Rummets ton | H2 "Det här gör CV:t starkt" / "Det här gör brevet starkt", alla H3 | Innehåll. Punkter med ankare visar sitt notnummer. |
| 4 | Tips | Mark | H2 "Tips för {yrke}", alla H3 | Innehåll, före och efter som två rutor. |
| 5 | Skrivguiden och mallkortet | Panel | H2 "Så bygger du ett CV som {yrke}" / "Så skriver du ett personligt brev som {yrke}", H2 "Letar du efter en CV-mall för {yrke}?" | seoIntro som i dag. |
| 6 | FAQ | Mark | H2 "CV för {yrke}" / "personligt brev för {yrke}" | Innehåll, alla svar i DOM. |
| 7 | Hela ansökan | Panel | H2 "Skapa hela ansökan", H3 "CV-exempel", H3 "Personligt brev" | Paret, länk till syskonsidan. |
| 8 | Fler yrken | Mark | H2 "Fler CV-exempel" / "Fler personliga brev-exempel", H3 per yrke | `relaterade` ur datan. |
| 9 | Slut | Vägg | H2 "Imponerad? Skapa ditt nu" | `SlutBand` (brev) eller med `SkarmCvAnalys` (CV). |

Arket. CV-sidan renderar i dag förhandsvisningen med `next/dynamic(..., { ssr: false })`, så CV-texten finns bara i RSC-datan och inte som synlig HTML (kontrollerat i live-HTML 2026-10-12). I del B renderas `norrskenTemplate.generate(cvMetadata)` (som redan körs i page.tsx som `initialHTML`) direkt i en serverkomponent. Det är ett tillägg av synlig text (cirka 350 till 450 ord per CV-exempel) och ska redovisas i SEO-grinden som tillåten skillnad; rubriker inne i mallens HTML får inte bli h2/h3 (byt till `p` med klass i generatorns exempelläge om de är det). Mallväljaren (`InteractiveCVPreview`) laddas först när användaren trycker "Byt mall" under arket. Brevet görs på samma sätt med brevmallens serverrendering.

Ankare. Nytt valfritt fält på varje `varforDetFungerar`-punkt: `ankare?: 'profil' | 'erfarenhet' | 'certifieringar' | 'kompetenser' | 'utbildning' | 'stycke-1' ... 'stycke-5'`. Högst fyra per exempel. Saknas ankare visas punkterna utan nummer och marginalen visar de fyra första titlarna. Fältet fylls först för de 20 mest besökta yrkena per typ (GSC), resten i en senare innehållsomgång.

Schema: Article med Occupation, FAQPage, HowTo, BreadcrumbList i page.tsx, oförändrade.

### 3.4 Hubbarna `/cv-exempel` och `/personligt-brev-exempel`

Hjälte på vägg cv/brev: H1 oförändrad, ingress, sökfältet (GET `?q=`, knappen "Hitta exemplet" är primär), tre ark i solfjäder (dator). Filtret är länkar till `/kategori/...` med antal. Alla 89 kort ligger i HTML med sin H3; kortens kicker får branschens rumsfärg. Raden till syskonhubben, guiden "Allt du behöver veta om CV-mallar" (fyra H3), FAQ och slutet står kvar i textmallen. Schema ItemList, FAQPage, BreadcrumbList oförändrade.

### 3.5 Kalkylatorerna `/rakna-ut/*` och hubben `/rakna-ut`

Filer: `src/components/rakna/KalkylatorSida.tsx` (ram), `KalkylatorSkal.tsx`, `src/components/rakna/LonEfterSkatt.tsx` och de åtta andra (bara layout, ingen räknelogik), `src/components/rakna/start/*`, `src/app/(public)/rakna-ut/page.tsx`. Räknelogiken i `src/lib/rakna/*` rörs inte.

Kalkylatorsidan:

| # | Sektion | Yta | Rubrik | Innehåll |
|---|---|---|---|---|
| 1 | Hjälte med kalkylatorn: kick, H1, ingress, tre bevis till vänster; fält och resultat till höger. På mobil: H1, fälten, knappen, resultatet, sedan ingressen (CSS-ordning, DOM-ordningen är H1, ingress, kalkylator) | Vägg jobb (lön och jobb) eller neu (rekryterarkalkylatorerna) | H1 oförändrad | Resultatet i Bläck: huvudtal, stapel (netto mot skatt), tre etiketter, källan med tabellnummer och kolumn, Dela och Bädda in. |
| 2 | Så räknar vi + källkortet | Mark | H2 "Så räknar vi" | `metod` och `kallor` som i dag; källorna synliga i ett eget kort. |
| 3 | Jobbcoachen | Bläck, `SkarmCoach` | H2 "Ta siffrorna med in i lönesamtalet" | Texten som i dag (10 meddelanden ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`). |
| 4 | FAQ | Mark | H2 "Vanliga frågor" | Som i dag. |
| 5 | Läs mer | Mark | H2 "Läs mer" | Länkarna som i dag. |

Formuläret: `<form method="get">` med samma parameternamn som `lasLon` läser (`lon`, `kommun`, `kyrka`, `a66`, `jlon`, `jkommun`), så att knappen "Räkna ut" fungerar utan JS och resultatet för standardvärdet (35 000 kr i Stockholm, 28 291 kr) står i serverrenderad HTML som i dag. Med JS räknar panelen direkt vid inmatning. Knappen ligger direkt under kommunvalet så att den slutar inom 640 px på 360 (uppmätt 584 px i skissen); kyrka, 66 år och jämförelsen ligger under knappen. Tal skrivs utan nolla efter decimaltecknet (19,2 % men 20 %).

Hubben: hjälte vägg jobb med `Lonebesked` (räknat på servern ur `beraknaLon(LON_STANDARD)`), `TalRad` (antalet kalkylatorer räknat ur listan, inte 9 hårdkodat), H2 "För dig som söker jobb eller byter" med `StortalKort` för lön efter skatt och tre `KalkylatorKort` (H3 som i dag), Bläck-blocket med H2 "2 000 kr mer i månaden är värt +268 881 kr på tio år" där talet räknas ur `src/lib/rakna/loneforhandling.ts` och `SkarmCoach`, H2 "För dig som anställer" med `StortalKort` för vad en anställd kostar (52 664 kr ur `anstalldKostnad.ts`) och tre kort. Schema WebApplication och FAQPage per kalkylator oförändrade.

### 3.6 Om oss `/om-oss`

Filer: `src/app/(public)/om-oss/OmOssSida.tsx` (page.tsx och layout.tsx med Organization, AboutPage och BreadcrumbList rörs inte).

Hjälte på ljus mark (`Hjalte ljus`) med H1 oförändrad och `SkarmBana` med svävande objekt: banan är det som knyter ihop vad vi gör, så den återanvänds här i stället för en egen bild. H2 "Från cvbrev.se till Jobbcoach.ai" som `Tidslinje` (fyra H3, ett objekt per steg: brevet, CV:t, logotypen, matrisen). H2 "Tre saker vi lovar" som `Loften` på ton jobb. Bläck: talen `konton` och `brev` (props som i dag, ur page.tsx) som huvudtal, och kontaktrutan med H2 "Saknar du något, eller har du en fråga?", knappen "Skapa konto gratis" och mejllänken.

### 3.7 För rekryterare `/for-rekryterare`

Filer: `src/app/(public)/for-rekryterare/page.tsx` (Service, Offer och FAQPage rörs inte) och `components/*`. Ton: kollega till kollega. Kunskapsdelen heter Insikter, aldrig guider.

| # | Sektion | Yta | Rubrik (oförändrad) | Bild |
|---|---|---|---|---|
| 1 | Hjälte, knappen "Skapa rekryterarkonto", tre bevis | Vägg neu | H1 "Kandidater med bevisade färdigheter" | `Traffkort` (redovisningsekonomen) och `VerifieradBadge` |
| 2 | Insidan | Mark | H2 "Från sökning till anställning", fem H3 i steg | `Portal` (sökfält, tre träffrader); `ProductTour` kan ligga kvar som klientö under, men stegen och texten är serverrenderade |
| 3 | Därför funkar det | Panel | H2 "Mindre gissning, mer träff", fyra H3 | |
| 4 | Verifierade resultat | Vägg tran | H2 "Siffror som tål följdfrågor", fyra H3 | två badgar och matrisbrickan, citatet "Vi visar hellre en ärlig siffra än en imponerande." |
| 5 | Så funkar det | Mark | H2 "Från sökning till anställning" (andra gången, se fynd 6), fyra H3 | knappen "Ansök om tidig åtkomst" |
| 6 | Träffkorten | Panel | H2 "Så ser en träff ut" | två `Traffkort` |
| 7 | Hela profilen | Ton neu | H2 "Så ser hela profilen ut", H3 Arbetslivserfarenhet, Utbildning och språk, Verifierade resultat, Arbetsstil, Söker mig till, Villkor | `Profilkort` |
| 8 | Integriteten | Bläck | H2 "Integriteten är inte ett hinder. Den är produkten.", sju H3 | |
| 9 | Insikter | Mark | H2 "Kunskap som förbättrar nästa rekrytering", sex H3-länkar till `/for-rekryterare/insikter/...` | |
| 10 | FAQ | Panel | H2 "Det rekryterare undrar", elva frågor ur `rekryterare-faq-data.ts` | |
| 11 | Slut | Vägg neu, tät | H2 "Var med från början. Poolen växer varje dag." | |

Kandidatdata visas aldrig som råpoäng eller lönespann (minnesregeln om Bli upptäckt). Badgarna visar percentil, nivå, antal testade och första försöket.

### 3.8 Kontakt `/kontakt`

Hjälte vägg brev med H1 "Vi svarar på dina frågor" (i dag står "Vi svarar på dina frågorKontakta oss" i samma h1; behåll den första delen, flytta "Kontakta oss" till kickern), formuläret som lyft kort över väggens kant med en H2 "Skicka ett meddelande" (i dag två), tre kontaktkort som H3 (i dag H4 utan H3 över). Formulärets handling är oförändrad. Sidan saknar huvudknapp i hjälten med flit: handlingen är formuläret, vars första fält syns inom 640 px.

### 3.9 Juridik och hjälpcenter

`/integritetspolicy`, `/anvandarvillkor`, `/cookies` och `/hjalpcenter` får bara del A:s sidhuvud och sidfot och `Textmall`: H1 på mark, datum för senaste ändring, innehållsförteckning till vänster från 1024 px, brödtext 68 tecken, inga färgblock eller knappar. Hjälpcentrets tre kort blir länkkort. Texterna rörs inte.

---

## 4. SEO-grind

### 4.1 Urval

Utöka `scripts/seo-diff-artiklar.ts` (som redan tar de 20 mest klickade artiklarna ur `scripts/.publikt-urval.json`, arkivet, Om oss och alla tio Räkna ut-sidor):

- `EXEMPEL`: de 20 CV-exempel och 20 brevexempel med flest klick i Search Console senaste 90 dagarna (`scripts/gsc-test` eller `analys-seo-tillvaxt.ts`), fallback `sokvolym` i datan. Plus `/cv-exempel`, `/personligt-brev-exempel` och två kategorisidor var.
- `/for-rekryterare`, `/kontakt`, `/hjalpcenter`, `/integritetspolicy`, `/anvandarvillkor`.
- Artiklarna: utöka till 20 klickade plus 10 med `howto:`, 5 med tabell och 5 med `CustomImage` mitt i texten, så att varje komponent i 3.1 prövas.

### 4.2 Avtrycket

Lägg till i `Avtryck`: `ord` (antal ord i `main` utom ramen, efter att skript, stil och `aria-hidden` tagits bort), `faq` (`summary`-texterna och `FAQPage.mainEntity[].name`), och behåll `forstaBild`, `rubriker`, `lankar`, `jsonLd`. Ge `ta` flaggan `--bas <url>` (samma som del A).

### 4.3 Regler (exit 1 om något bryts)

1. H1, title, description, canonical, robots och ogImage identiska.
2. Varje h2/h3 i före-avtrycket finns i efter-avtrycket med samma text, nivå och id. Undantag i `TILLATNA_RUBRIKER` (reklamkort), och de nya rubriker som listas i 4.4.
3. Inga innehållslänkar försvinner. Nya länkar redovisas.
4. JSON-LD: samma typer och samma innehåll efter att `dateModified` nollats.
5. `ord` får inte sjunka mer än 2 % per sida (ramtext som "Läs guiden" kan försvinna; brödtexten får det inte).
6. `faq`: samma frågor.
7. `forstaBild`: samma `src` och `alt` på de 60 artiklar som har bilden först. På övriga får den bli artikelbilden (tillåten skillnad, listas).

### 4.4 Tillåtna skillnader (skrivs i `BASLINJE_OMTAGEN` med datum och skäl)

- CV- och brevexemplen: `ord` stiger när arket serverrenderas.
- Kontakt: en H2 i stället för två, H4 till H3.
- Artiklar utan bild först: `forstaBild` blir frontmatter.image.
- Artikelns författarnamn står i dag som h3 före första h2. Det ligger kvar som h3 i hjälten (rubrikträdet oförändrat), även om det inte är en riktig rubrik; ändras bara med ägarens ja (fråga 5).

### 4.5 När

Före första vågen mot live (`--bas https://www.jobbcoach.ai`), sedan efter varje våg mot lokalt produktionsbygge. Exit 1 fäller pushen.

---

## 5. Prestanda

- Serverkomponenter. Klient-JS bara för `ArtikelKlient` (finns), `FastKnapprad`/`StickyMobileCTA`, `KalkylatorPanel` (finns som klient i dag), mallväljaren efter klick och kontaktformuläret.
- CLS 0: artikelbilden med `width`/`height` 1536 × 1024 och `aspect-ratio` 3/2, tumnaglar med `sizes` och `loading="lazy"`, arket med `min-height` satt per typ innan typsnitten laddat, telefoner 272 × 590.
- LCP: artikel H1 på mobil, artikelbilden på dator (`priority`, som i dag). Exempel: H1. Kalkylator: H1 (resultatet är text). Budget enligt `scripts/perf-publikt.ts`: under 1 500 ms på mobil 4G för alla sidtyper i del B.
- Artikelsidorna väger 650 till 680 kB i dag (kommentaren i page.tsx). Inget nytt får lägga till klient-JS på artiklar; `MatrisExpert` och telefonerna är statisk SVG och HTML.
- Skissens kalkylator bär en tabellbit på 16 kB för förhandsvisningen. I produktionen används befintlig uppslagning (tabellerna skickas som i dag).

---

## 6. Byggordning

Varje våg: tsc, berörda vitest och en skärmdump per ändrad sidtyp under arbetet; en gång per våg före push full build, SEO-grinden (avsnitt 4), `perf:publikt` för vågens sidor och klicktest i riktig webbläsare på Pixel 7 (412 × 915) och desktop 1280 × 800, ljust och mörkt, skärmdump per steg i `docs/qa/publikt-v2-b/vagN/`. Kontroll i varje skärmdump: scrollWidth lika med bredden, hjältens knapp under 640 px på 360, ingen text under 12 px utanför telefoner och ark, inga avklippta telefoner.

| Våg | Innehåll | Klicktest |
|---|---|---|
| B1 | Förutsätter del A våg 1. `MatrisExpert`, tilläggen i `ProvaKort`/`PremiumBlock`/`Hjalte`, komponenterna i 2.2 utan sidbyte. Förhandsvisningssida i `docs/qa`. | Förhandsvisningen på 360 och 1280, ljust och mörkt. |
| B2 | Artiklarna: `ArtikelRam`, `ArtikelReklam`, MDX-kartan (`div`, `table`, `CustomImage`), injektionen av `Signatur`, `.artikel-prose`. Arkivet. | Tre artiklar (testkluster med tabell, CV-kluster med `CVTemplateShowcase`, karriär utan produkt): hjältens knapp, provkortets knapp till `/prova` och ett pass startar utan konto, innehållsförteckningen hoppar rätt och markerar aktiv rubrik, FAQ öppnas, relaterade och Mest lästa öppnar rätt artikel, fasta knappraden. Arkivet: filter, sida 2, ett kort. |
| B3 | Exemplen: arket serverrenderat, noter, alla sektioner, hubbarna. Fältet `ankare` för topp 20 per typ. | Ett CV- och ett brevexempel för samma yrke: "Använd som mall" till skapa-flödet med rätt mall, "Byt mall" laddar väljaren, länken mellan syskonsidorna, ett relaterat yrke, sök i hubben. |
| B4 | Räkna ut: ramen och alla nio kalkylatorer, hubben. | Lön efter skatt: ändra lön och kommun, kryssa kyrka och 66, öppna jämförelsen; samma URL med parametrar utan JS ger samma resultat; Dela-länken. En rekryterarkalkylator. |
| B5 | Om oss, För rekryterare, Kontakt, juridik- och hjälpcentermallen. | Rekryterare: "Skapa rekryterarkonto" till registreringen, insiktslänkarna, FAQ. Kontakt: skicka ett meddelande från ett testkonto och radera raden med dess id efteråt. |

---

## 7. Fynd under skissen (innehåll och kod, inte design)

1. **Exempel-paritet bryts på projektledare:** CV-personan heter Sara Lindström, brevpersonan Lisa Andersson. Minnesregeln säger samma persona; diffa alla 89 par innan B3.
2. **CV-texten syns inte i serverrenderad HTML** på /cv-exempel/[yrke] (`ssr: false`). Del B rättar det; räkna med en positiv förändring i ordantal.
3. **`dateModified` i BlogPosting är alltid byggdagen** (`new Date()` i page.tsx rad 183). Det är inte ett ärligt ändringsdatum. Förslag: frontmatter-fältet `updated`, som både schema och Signaturen läser. Ändrar schemat, därför fråga 3.
4. **/kontakt och /hjalpcenter har startsidans title och description,** och /kontakt har sin H2 två gånger. Rätta metadata i B5.
5. **Talstreck och pilar i mallcopy på exempelsidorna** (till exempel "Skapa ditt eget CV", talstreck, "helt gratis" i hjälten och pilar mellan årtal) bryter husreglerna. Mallens egna texter skrivs om i B3; innehållsfälten med talstreck (cirka tio yrken) rättas i datan.
6. **För rekryterare har H2 "Från sökning till anställning" två gånger.** Rubriken står kvar i båda (grinden), men den andra borde heta något eget (fråga 4).
7. **Engelska ord i rekryterarinnehållet:** "hiring manager", "onboardingtips", "Slack-tråd". Innehåll, inte design; svenska facktermer enligt minnesregeln vore "rekryterande chef" och "introduktionstips".
8. **Sidfotens länkar i del A:s skiss** (`/hjalp`, `/insikter` med flera) är fel enligt del A avsnitt 3; del B:s sidor använder samma sidfot och samma rättelse.

---

## 8. Mätvärden ur skissen (2026-10-12)

| Sidtyp | Hjältens knapp, nederkant på 360 | scrollWidth 360 / 1280 | Ord i main (1280) |
|---|---|---|---|
| Artikel (matrislogik-test-guide) | 577 px | 360 / 1280 | 3 787 (artikel, arkiv och etiketter) |
| Arkivet | ingen knapp, filtret är handlingen | 360 / 1280 | |
| CV-exempel projektledare | 549 px (466 för brevexemplet, 480 för hubben) | 360 / 1280 | 3 511 (alla tre sidorna) |
| Lön efter skatt | 584 px (499 för hubben) | 360 / 1280 | 1 052 |
| Om oss / För rekryterare | 491 / 510 px | 360 / 1280 | 2 250 (alla fyra) |
| Kontakt | formuläret, ingen knapp i hjälten | 360 / 1280 | |

Ljust och mörkt ger samma mått. Kalkylatorn kontrollerad mot Skatteverkets tabell: 35 000 kr i Stockholm ger 28 291 kr (tabell 31), 42 000 kr i Dorotea 32 126 kr (tabell 36).

---

## 9. Öppna frågor till ägaren

1. **Knappen i artikelns hjälte.** Skissen har "Prova fem frågor gratis" redan i hjälten på testartiklar (plus provkortet efter andra stycket och slutkortet). Det är tre handlingar på en lång sida, en per sektion. Ska hjälten i stället bara ha "Läs guiden" så att första erbjudandet kommer efter snabbsvaret?
2. **H1 på exempelsidorna är bara yrket** ("Projektledare"). Titeln bär sökordet i dag. Vill du testa "CV-exempel för projektledare" som H1 på tio sidor och läsa av efter sex veckor, eller ska H1 stå kvar?
3. **Ärligt ändringsdatum** (fynd 3): införa `updated` i frontmatter och låta schemat läsa det? Det ändrar `dateModified` på alla 139 artiklar.
4. **Den andra "Från sökning till anställning"** på /for-rekryterare: byta till "Så går en rekrytering till" (ny rubrik, den gamla finns kvar i den första sektionen)?
5. **Författarnamnet som h3 i artikelns hjälte:** behålla (oförändrat rubrikträd) eller göra till vanlig text (renare struktur, men en rubrik försvinner på 139 sidor)?
6. **Talen på Om oss** (402+ konton, 253+ brev) är små för ett huvudtal. Visa dem stort som i skissen, som i dag i en mening, eller ta bort?
7. **Mallväljaren på CV-exemplen** blir en knapp under arket i stället för den öppna interaktiva förhandsvisningen. Okej, eller ska väljaren synas direkt?

---

## Bilaga B. Baslinje från live 2026-10-12

Indrag visar nivån. Allt här ska finnas kvar med samma text och nivå (sidfotens dolda H2 "Sidfot" och menyns rubriker räknas inte). För artiklarna och exemplen är det här ett exempel per typ; grinden tar baslinjen för hela urvalet i avsnitt 4.

#### /artiklar/matrislogik-test-guide

Title: Matrislogik & abstrakt resonemang: guide + öva gratis 2026. Schema: BlogPosting, Organization, Article, FAQPage, BreadcrumbList.

- H1 Matrislogik och abstrakt resonemang: så klarar du testet
    - H3 Linda Eriksson
  - H2 Snabbsvar: hur klarar man ett matrislogik-test?
  - H2 Vad matrislogik egentligen mäter
  - H2 Vilket matristest möter du i Sverige?
  - H2 Så är en matris uppbyggd
  - H2 De vanligaste regeltyperna
  - H2 Ett exempel, löst steg för steg
  - H2 Ett svårare exempel med två regler
  - H2 Strategin som höjer ditt resultat
  - H2 Så tränar du inför testet
  - H2 Vanliga misstag
  - H2 Vem möter matrislogik, och när?
  - H2 Testet är ett steg, inte hela resan
  - H2 Vanliga Frågor (FAQ)

#### /artiklar

Title: Artiklar och karriärtips | jobbcoach.ai. Schema: BreadcrumbList, CollectionPage, ItemList.

- H1 Artiklar som förbättrar din jobbsökning
  - H2 Alva Labs logiktest: så fungerar testet, så läser du resultatet och så övar du
  - H2 Bakgrundskontroll vid anställning: vad arbetsgivaren får kolla och vad du kan göra
  - H2 Deduktivt och induktivt test: skillnaden, exempel med lösning och hur du övar
  - H2 MAP-test: så fungerar Assessios personlighetstest och så svarar du
  - H2 Verifierade testresultat vs CV-påståenden: vad rekryteraren faktiskt kan lita på
  - H2 AI-jobbmatchning: så fungerar det när jobben hittar dig i stället
  - H2 Arbetslivserfarenhet i CV:t: så beskriver du dina jobb så de säljer
  - H2 ATS-vänligt CV: så fungerar rekryteringssystemen och så klarar du dem
  - H2 Bli hittad av rekryterare: så vänder du på hela jobbsökandet

#### /cv-exempel/projektledare

Title: CV Exempel Projektledare 2026 - Professionell Mall | Jobbcoach.ai. Schema: Article, Organization, Occupation, FAQPage, HowTo, BreadcrumbList.

- H1 Projektledare
  - H2 Komplett CV-exempel som inspirerar
  - H2 Det här gör CV:t starkt
    - H3 ATS-optimerad med projektledartermer
    - H3 Kvantifierade projektresultat som bevisar förmåga
    - H3 Balans mellan teknisk och ledarskapsroll
    - H3 Certifieringar presenterade strategiskt
    - H3 Profiltext som säljer erfarenhet direkt
    - H3 Tydlig karriärprogression mot ledarskap
  - H2 Tips för projektledare
    - H3 Kvantifiera varje projektresultat
    - H3 Specificera projektmetodik och verktyg
    - H3 Visa stakeholder management konkret
    - H3 Placera certifieringar strategiskt
    - H3 Beskriv projektets komplexitet och omfattning
    - H3 Balansera teknisk och ledarskapsroll
  - H2 Så bygger du ett CV som projektledare
  - H2 Letar du efter en CV-mall för projektledare ?
  - H2 CV för projektledare
  - H2 Fler CV-exempel
    - H3 Chef
    - H3 IT-konsult
    - H3 Scrum Master
  - H2 Skapa hela ansökan
    - H3 CV-exempel
    - H3 Personligt brev
  - H2 Imponerad? Skapa ditt nu

#### /personligt-brev-exempel/projektledare

Title: Personligt Brev Projektledare - Färdigt Exempel & Mall (2026). Schema: Article, Organization, Occupation, FAQPage, HowTo, BreadcrumbList.

- H1 Projektledare
  - H2 Komplett exempel på 60 sek
  - H2 Det här gör brevet starkt
    - H3 Kvantifierade projektresultat ökar trovärdigheten
    - H3 Både agila och traditionella metoder täcks in
    - H3 Certifieringar nämns tidigt och naturligt
    - H3 Ledarskap visas genom exempel, inte påståenden
  - H2 Tips för projektledare
    - H3 Lyft fram konkreta projektresultat med siffror
    - H3 Inkludera både agila och traditionella metoder
    - H3 Visa stakeholder management genom konkreta exempel
    - H3 Nämn certifieringar tidigt och med kontext
    - H3 Anpassa till projekttyp och bransch
  - H2 Så skriver du ett personligt brev som projektledare
  - H2 personligt brev för projektledare
  - H2 Fler personliga brev-exempel
    - H3 Scrum Master
    - H3 Produktchef
    - H3 IT-konsult
    - H3 Chef
  - H2 Skapa hela ansökan
    - H3 CV-exempel
    - H3 Personligt brev
  - H2 Imponerad? Skapa ditt nu

#### /cv-exempel

Title: 89 CV-exempel för svenska yrken 2026 [talstreck] gratis och ATS-optimerade | Jobbcoach.ai. Schema: ItemList, BreadcrumbList, FAQPage.

- H1 89 CV-exempel. Ett för ditt yrke.
  - H2 89 yrken
    - H3 Äldreboende
    - H3 Civilingenjör
    - H3 Gymnasieelev
    - H3 Löneadministratör
    - H3 Ingenjör
    - H3 Förskollärare
    - H3 Receptionist
    - H3 Lagerarbetare
    - H3 Administratör
    - H3 Lokalvårdare
    - H3 Handläggare
    - H3 Läkare
    - H3 Undersköterska
    - H3 Vårdadministratör
    - H3 Butiksbiträde
    - H3 IT-konsult
    - H3 Student
    - H3 Lärare
    - H3 Sjuksköterska
    - H3 Specialistsjuksköterska
    - H3 Barnmorska
    - H3 Butikssäljare
    - H3 Säljare
    - H3 Sommarjobb
    - H3 Ekonomiassistent
    - H3 Barnskötare
    - H3 Personlig assistent
    - H3 Kurator
    - H3 Psykolog
    - H3 LSS-handläggare
    - H3 Hotellvärd
    - H3 Administrativ assistent
    - H3 Servitris/Restaurangbiträde
    - H3 Chef
    - H3 Produktchef
    - H3 Projektledare
    - H3 Enhetschef
    - H3 Elevassistent
    - H3 Kundtjänst
    - H3 Kundrådgivare
    - H3 Kundtjänstmedarbetare
    - H3 Vårdbiträde
    - H3 Hemtjänst
    - H3 Kock
    - H3 Fysioterapeut
    - H3 Grundskollärare
    - H3 Specialpedagog
    - H3 Kontorsassistent
    - H3 Automationsingenjör
    - H3 Konstruktör
    - H3 Truckförare
    - H3 Logistiker
    - H3 Lagerchef
    - H3 Fastighetsskötare
    - H3 Hemtjänstpersonal
    - H3 Servicemedarbetare
    - H3 Socialsekreterare
    - H3 HR-specialist
    - H3 Controller
    - H3 Kassörska
    - H3 Butikschef
    - H3 Account Manager
    - H3 Systemutvecklare
    - H3 DevOps Engineer
    - H3 Projektledare IT
    - H3 Fritidspedagog
    - H3 Fritidsledare
    - H3 Redovisningsekonom
    - H3 Bartender
    - H3 Konditor
    - H3 Ekonom
    - H3 Scrum Master
    - H3 Teamledare
    - H3 Boendestöd
    - H3 Köksbiträde
    - H3 Barista
    - H3 Logistikassistent
    - H3 Terminalarbetare
    - H3 Vaktmästare
    - H3 Socionom
    - H3 Stödpedagog
    - H3 Chaufför
    - H3 IT-tekniker
    - H3 Telefonförsäljare
    - H3 Diskare
    - H3 Snickare
    - H3 Elektriker
    - H3 Väktare
    - H3 Städare
  - H2 Behöver du även personliga brev ?
  - H2 Allt du behöver veta om CV-mallar
    - H3 Vad är en CV-mall, och vad är skillnaden mot ett exempel?
    - H3 Hur väljer du rätt CV-mall för ditt yrke?
    - H3 Vad gör en CV-mall ATS-optimerad?
    - H3 Är CV-mallar gratis? Kan jag ladda ner dem?
  - H2 Det du undrar om CV -exemplen
  - H2 Klar att skriva ditt eget CV ?

#### /rakna-ut

Title: Räkna ut: gratis kalkylatorer för lön, jobb och rekrytering. Schema: inget.

- H1 Räkna ut: kalkylatorer för lön, jobb och rekrytering
  - H2 För dig som söker jobb eller byter
    - H3 Se vad som blir kvar i handen
    - H3 Räkna fram din sista anställningsdag
    - H3 Se vad dina sparade semesterdagar är värda
    - H3 Jämför timlön och månadslön rakt av
  - H2 2 000 kr mer i månaden är värt +268 881 kr på tio år
  - H2 För dig som anställer
    - H3 Vet vad en anställning kostar innan ni annonserar
    - H3 Sätt en siffra på en misslyckad rekrytering
    - H3 Se hur många kontakter en anställning kräver
    - H3 Jämför hur ofta urvalsmetoderna träffar rätt

#### /rakna-ut/lon-efter-skatt

Title: Räkna ut lön efter skatt 2026: nettolön i din kommun. Schema: WebApplication, Offer, Organization, FAQPage.

- H1 Räkna ut lön efter skatt 2026
  - H2 Så räknar vi
  - H2 Ta siffrorna med in i lönesamtalet
  - H2 Vanliga frågor
  - H2 Läs mer

#### /om-oss

Title: Om oss: jobbverktyg för svensk arbetsmarknad | Jobbcoach.ai. Schema: Organization, AboutPage, BreadcrumbList.

- H1 Vi hjälper dig att nå dina karriärmål
  - H2 Från cvbrev.se till Jobbcoach.ai
    - H3 Det började som cvbrev.se
    - H3 Användarna ville ha mer
    - H3 cvbrev.se blev Jobbcoach.ai
    - H3 En plattform med fler verktyg
  - H2 Tre saker vi lovar
    - H3 Du behåller kontrollen
    - H3 Svenska källor i botten
    - H3 Du betalar bara när du behöver mer
  - H2 Saknar du något, eller har du en fråga?

#### /for-rekryterare

Title: Hitta kandidater med verifierade testresultat | Jobbcoach.ai för rekryterare. Schema: Service, Organization, Offer, FAQPage.

- H1 Kandidater med bevisade färdigheter
  - H2 Från sökning till anställning
    - H3 Sök på kravprofilen
    - H3 Förhandsgranska utan att öppna
    - H3 Profilen som beslutsunderlag
    - H3 Kandidaten tackade ja
    - H3 Ett arbetsflöde, inte en sökning
  - H2 Mindre gissning, mer träff
    - H3 Svarsvilliga kandidater
    - H3 Verifierat före första kontakt
    - H3 Bevakning på kravprofilen
    - H3 Budgetfilter utan löneexponering
  - H2 Siffror som tål följdfrågor
    - H3 Första försöket räknas
    - H3 Nivån syns alltid
    - H3 Öppen normgrupp
    - H3 Färskhet framgår
  - H2 Från sökning till anställning
    - H3 Sök på kravprofilen
    - H3 Samla i projekt och jämför
    - H3 Visa intresse, kandidaten svarar
    - H3 Dela med din hiring manager
  - H2 Så ser en träff ut
  - H2 Så ser hela profilen ut
    - H3 Arbetslivserfarenhet
    - H3 Utbildning och språk
    - H3 Verifierade resultat
    - H3 Arbetsstil
    - H3 Söker mig till
    - H3 Villkor
  - H2 Integriteten är inte ett hinder. Den är produkten.
    - H3 Uttryckligt samtycke
    - H3 Anonym tills kandidaten säger ja
    - H3 Kandidaten ser samma som du
    - H3 Visning, aldrig filtrering
    - H3 Verifierade rekryterare
    - H3 Inga rå-CV:n eller löneanspråk
    - H3 Tydlig datahantering
  - H2 Kunskap som förbättrar nästa rekrytering
    - H3 AI-förordningen för rekryterare: kraven som gäller från 2 augusti
    - H3 Bakgrundskontroller vid anställning: vad som faktiskt är tillåtet 2026
    - H3 Diskrimineringslagen i urvalet: vad som prövas när någon frågar
    - H3 Lönehistorikfrågan: förbudet som kommer, och vad ni frågar i stället
    - H3 Lönekartläggning: kravet som redan gäller, och vad rekryteringen får gratis
    - H3 Lönerapporteringen: trösklarna, datumen och femprocentsregeln
  - H2 Det rekryterare undrar
  - H2 Var med från början. Poolen växer varje dag.

#### /kontakt

Title: Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester. Schema: inget.

- H1 Vi svarar på dina frågor Kontakta oss
  - H2 Skicka ett meddelande
  - H2 Skicka ett meddelande

#### /hjalpcenter

Title: Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester. Schema: inget.

- H1 Hjälpcenter
    - H3 Komma igång
    - H3 Personliga brev
    - H3 Konto & Fakturering
  - H2 Utbyggd hjälpsektion kommer snart
