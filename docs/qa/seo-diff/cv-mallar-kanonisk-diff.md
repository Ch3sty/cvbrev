# SEO-diff

Före: docs/qa/seo-diff/cv-mallar-kanonisk-fore-live.json  
Efter: docs/qa/seo-diff/cv-mallar-kanonisk-efter.json  
Sidor: 53  
Fel: 0

### /cv-mallar
- tillåten JSON-LD-skillnad 2026-11-14 och 2026-11-16: 2026-11-16: Nya block från /verktyg/cv-mallar: ItemList med en Product per mall (url till #mall-<id> på /cv-mallar) och HowTo ur de synliga stegen; FAQPage har fått de fem frågorna som flyttade med. 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 a: "CV-mall" först, 41 mallar och 3 gratis ur konstanterna; ItemList description utan påståendet att alla är ATS-säkra; FAQ tvättad och tre frågor om chef, karriärbyte och byte av mall (K6).
- ok: description bytt (2026-11-16): "CV-mallar för svenska jobb: 20 mallar att fylla i direkt och ladda ner som PDF, 2 av dem gratis. Se vilken mall som passar ditt yrke och din erfarenhet." → "CV-mallar för svenska jobb: 20 mallar att fylla i och ladda ner som PDF eller Word, 2 av dem gratis. Se vilken mall som passar ditt yrke och din erfarenhet.". SEO-strategen: Word nämns i beskrivningen när Word-avsnittet flyttat hit ("som PDF eller Word"), 153 tecken.
- ok: sektionsrubriker ändrade (omritad yta, tillåtet): borta 0, nya 27
- ok: nya FAQ-frågor: ["Vilka mallar finns som Word?","Vad är skillnaden mellan gratismallarna och mallarna i Premium?","Kan jag redigera CV:t senare?","Kan jag använda mallen för internationella ansökningar?","Är mallarna mobilanpassade när jag bygger CV:t?","ld: Vilka mallar finns som Word?","ld: Vad är skillnaden mellan gratismallarna och mallarna i Premium?","ld: Kan jag redigera CV:t senare?","ld: Kan jag använda mallen för internationella ansökningar?","ld: Är mallarna mobilanpassade när jag bygger CV:t?"]
- ok: ord i main 2849 → 3895 (+36.7 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: JSON-LD: nya block av tillåten typ (2026-11-14 och 2026-11-16): ["FAQPage"] → ["FAQPage","ItemList"]
- ok: nya JSON-LD-block (2026-11-14 och 2026-11-16): HowTo

### /verktyg/cv-mallar
- ok: status bytt (2026-11-16): 200 → 308, omdirigering till /cv-mallar. Permanent omdirigering i next.config.ts; innehållet flyttat till /cv-mallar, posten struken ur sitemapen.

### /
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-15: 2026-10-12: Publikt v2 våg 2: startsidan får Organization, WebSite och FAQPage (del A 5.1). Live saknar JSON-LD. 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaret om dataskydd lovade EU-lagring och radering med ett klick, och jobbmatchningen "varje natt". Frågorna oförändrade.
- ok: ord i main 1034 → 1034 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /funktioner
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-15: 2026-10-12: Ägarbeslut 8 i del A avsnitt 10: /funktioner får FAQPage ur samma fem frågor som syns på sidan. 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaren om dataskydd (EU-lagring) och jobbmatchningen (varje natt) rättade. Frågorna oförändrade.
- ok: ord i main 1065 → 1065 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /verktyg/skapa-cv
- tillåten JSON-LD-skillnad 2026-10-12: 2026-11-15: FAQ, HowTo och WebApplication (featureList, description) följer de rättade Word-texterna. 2026-11-16: FAQ-svaret "Är det gratis att skapa CV online hos er?" sa tre fria mallar; nu gratismallarna ur katalogen. Frågorna oförändrade. ägarkrav korrekta termer: "live-preview" blir "förhandsvisning", "auto-save" och "mobile-friendly" blir svenska.
- ok: ord i main 1027 → 1027 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /exempel
- tillåten JSON-LD-skillnad 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 c: /exempel är hubb, inte målsida; WebPage-schemat följer ny title och description, 41 mallar ur konstanten i stället för 25.
- ok: ord i main 1389 → 1389 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /cv-exempel
- tillåten JSON-LD-skillnad 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 a: huvudordet först, inget årtal; FAQ-svaret om gratis rättat (en CV-analys per konto) och tre frågor om situationer (K6).
- ok: ord i main 2308 → 2308 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel
- tillåten JSON-LD-skillnad 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 a: galleriet tar exempelorden, mallordet ägs av personligt-brev-mall-gratis; ItemList med exempelnamn; FAQ-svaret om gratis rättat (ett brev i veckan) och tre frågor om situationer (K6).
- ok: ord i main 2127 → 2127 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /cv-mallar/underskoterska
- tillåten JSON-LD-skillnad 2026-11-16: Product-schemats bild är yrkets gratismall i det nya utbudet (/mallar/v2/<id>-stor.webp i stället för den gamla mallens svg). FAQ-svar som nämnde gamla mallar eller deras design omskrivna till yrkets nya mallpar; frågorna oförändrade. Mallutbudet 2026-11-16 (docs/design/mallar-utbud-2026-11-16.md): de 41 gamla mallarna ersatta av 20 som heter efter stil; tal och namn läses ur katalogen.
- ok: ord i main 1934 → 1934 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /cv-mallar/student
- tillåten JSON-LD-skillnad 2026-11-16: Product-schemats bild är yrkets gratismall i det nya utbudet (/mallar/v2/<id>-stor.webp i stället för den gamla mallens svg). Mallutbudet 2026-11-16 (docs/design/mallar-utbud-2026-11-16.md): de 41 gamla mallarna ersatta av 20 som heter efter stil; tal och namn läses ur katalogen.
- ok: ord i main 1642 → 1642 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /cv-mallar/chef
- tillåten JSON-LD-skillnad 2026-11-16: Product-schemats bild är yrkets gratismall i det nya utbudet (/mallar/v2/<id>-stor.webp i stället för den gamla mallens svg). FAQ-svar som nämnde gamla mallar eller deras design omskrivna till yrkets nya mallpar; frågorna oförändrade. Mallutbudet 2026-11-16 (docs/design/mallar-utbud-2026-11-16.md): de 41 gamla mallarna ersatta av 20 som heter efter stil; tal och namn läses ur katalogen.
- ok: ord i main 1637 → 1637 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/barista
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1614 → 1614 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/barnskotare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 2028 → 2028 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/bartender
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 2186 → 2186 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/boendestod
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1446 → 1446 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/butikssaljare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 2301 → 2301 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/ekonomiassistent
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 2642 → 2642 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/enhetschef
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1801 → 1801 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/hotellvard
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1532 → 1532 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/koksbitrade
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1549 → 1549 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/kontorsassistent
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 1309 → 1309 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/kundradgivare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1550 → 1550 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/kundtjanstmedarbetare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1496 → 1496 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/larare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 2333 → 2333 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/logistikassistent
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1449 → 1449 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/loneadministrator
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 2687 → 2687 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/lss-handlaggare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1566 → 1566 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/personlig-assistent
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 2238 → 2238 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/produktchef
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1721 → 1721 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/saljare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 2752 → 2752 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/sjukskoterska
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-14: 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade. 2026-11-14: K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md): yrkessidornas BreadcrumbList följer den synliga smulan via /exempel.
- ok: ord i main 2329 → 2329 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/sommarjobb
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade.
- ok: ord i main 1920 → 1920 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/student
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-14 och 2026-11-14: 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 c: BreadcrumbList följer den synliga brödsmulan (Hem, Exempel, galleriet, yrket) med namnen CV-exempel och Personligt brev-exempel. 2026-11-14: K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md): yrkessidornas BreadcrumbList följer den synliga smulan via /exempel.
- ok: ord i main 2141 → 2141 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/teamledare
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1652 → 1652 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/underskoterska
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-14: 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade. 2026-11-14: K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md): yrkessidornas BreadcrumbList följer den synliga smulan via /exempel.
- ok: ord i main 1879 → 1879 (+0.0 %)
- ok: länk bytt (2026-11-16): /verktyg/cv-mallar → /cv-mallar. SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /personligt-brev-exempel/vardadministrator
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna).
- ok: ord i main 1531 → 1531 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []

### /artiklar/ai-rekrytering-sverige
- tillåten JSON-LD-skillnad 2026-11-15: BlogPosting (headline, description, keywords, dateModified via updated), FAQPage och BreadcrumbList (namn = title) följer omskrivningen.
- ok: ny rubrik (2026-11-15): "h2#var-i-rekryteringen-anvands-ai Var i rekryteringen används AI?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#hur-manga-arbetsgivare-anvander-ai-i-rekryteringen Hur många arbetsgivare använder AI i rekryteringen?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#sorterar-ai-bort-ditt-cv-innan-en-manniska-ser-det Sorterar AI bort ditt CV innan en människa ser det?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#vilka-rekryteringssystem-med-ai-anvands-i-sverige Vilka rekryteringssystem med AI används i Sverige?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#vilka-fordelar-och-risker-har-ai-i-rekrytering Vilka fördelar och risker har AI i rekrytering?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#vilka-regler-galler-for-ai-i-rekrytering Vilka regler gäller för AI i rekrytering?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#ai-forordningen-rekrytering-ar-hogrisk AI-förordningen: rekrytering är högrisk". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#gdpr-ett-nej-far-inte-vara-helt-automatiskt GDPR: ett nej får inte vara helt automatiskt". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#diskrimineringslagen-ansvaret-ligger-kvar-hos-arbetsgivaren Diskrimineringslagen: ansvaret ligger kvar hos arbetsgivaren". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#hur-kommer-du-vidare-nar-ai-laser-ditt-cv-forst Hur kommer du vidare när AI läser ditt CV först?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#1-anvand-annonsens-egna-ord 1. Använd annonsens egna ord". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#2-hall-layouten-enkel 2. Håll layouten enkel". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#3-var-konkret 3. Var konkret". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#4-svara-noggrant-pa-urvalsfragorna 4. Svara noggrant på urvalsfrågorna". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#5-anpassa-varje-ansokan 5. Anpassa varje ansökan". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h3#6-hall-profilerna-uppdaterade 6. Håll profilerna uppdaterade". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#marker-rekryteraren-om-du-har-anvant-ai-i-ansokan Märker rekryteraren om du har använt AI i ansökan?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ny rubrik (2026-11-15): "h2#vad-gor-du-om-du-tror-att-ai-sorterade-bort-dig Vad gör du om du tror att AI sorterade bort dig?". Ny frågeformad rubrik i omskrivningen. Artikeln omskriven till dagens artikelstandard (ägarens uppdrag 2026-11-15): källgranskning strök ett påhittat SR-citat, felaktiga siffror och system, titeln utan "(Sveriges Radio)", frågeformade rubriker, ny FAQ. Granskad av SEO-strateg, copywriter och faktagranskare (docs/qa/ai-rekrytering-sverige/).
- ok: ord i main 4182 → 4182 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/ai-rekrytering-sverige-v2.webp

### /artiklar/bra-cv-guide
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/bra-cv-guide.md.
- ok: ord i main 3271 → 3271 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/bra-cv-guide-v2.webp

### /artiklar/cv-format-kronologiskt-funktionellt
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/cv-format-kronologiskt-funktionellt.md.
- ok: ord i main 1887 → 1887 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/cv-format-kronologiskt-funktionellt-v2.webp

### /artiklar/cv-mall-gratis-guide
- tillåten JSON-LD-skillnad 2026-11-14 och 2026-11-15: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/cv-mall-gratis-guide.md. 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 b: stödsidan slutar konkurrera om "cv mall", länk till /cv-mallar högt upp, 74 blir 89 i text och FAQ-svar.
- ok: ord i main 3741 → 3741 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/cv-mall-gratis-guide-v2.webp

### /artiklar/cv-mall-pdf-gratis
- tillåten JSON-LD-skillnad 2026-11-14 och 2026-11-15: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/cv-mall-pdf-gratis.md. 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 b: en mening med länk till målsidan och huvudordet i ankartexten högt upp, gamla antal rättade; BlogPostings wordCount följer texten.
- ok: ord i main 2971 → 2971 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/cv-mall-pdf-gratis-v2.webp

### /artiklar/cv-mall-word-gratis
- tillåten JSON-LD-skillnad 2026-11-14 och 2026-11-15 och 2026-11-16: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/cv-mall-word-gratis.md. 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 b: en mening med länk till målsidan och huvudordet i ankartexten högt upp, gamla antal rättade; BlogPostings wordCount följer texten. 2026-11-16: Ägarens besked 2026-11-16: gratismallarna Linne och Björk laddas ner gratis som PDF eller Word. FAQ-svaret "Var kan jag hitta gratis CV-mallar för Word?" nämner nu våra gratis Word-mallar efter Microsofts råd (copywriter, SEO-strategen granskade). Frågorna oförändrade.
- ok: ord i main 3855 → 3855 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar#word. Bytt mot /cv-mallar#word (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar#word"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/cv-mall-word-gratis-v2.webp

### /artiklar/exempel-pa-cv-guide
- tillåten JSON-LD-skillnad 2026-11-14 och 2026-11-15: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/exempel-pa-cv-guide.md. 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 b: en mening med länk till målsidan och huvudordet i ankartexten högt upp, gamla antal rättade; BlogPostings wordCount följer texten.
- ok: ord i main 2836 → 2836 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/exempel-pa-cv-guide-v2.webp

### /artiklar/fardigheter-cv-exempel
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/fardigheter-cv-exempel.md.
- ok: ny rubrik (2026-11-15): "h2#40-exempel-pa-mjuka-fardigheter-personliga 40 exempel på mjuka färdigheter (personliga)". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/fardigheter-cv-exempel.md.
- ok: ord i main 2993 → 2993 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/fardigheter-cv-exempel-v2.webp

### /artiklar/hur-ska-ett-cv-se-ut
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/hur-ska-ett-cv-se-ut.md.
- ok: ord i main 3571 → 3571 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/hur-ska-ett-cv-se-ut-v2.webp

### /artiklar/jobbcoach-online
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h2#fem-skal-att-valja-en-jobbcoach-online Fem skäl att välja en jobbcoach online". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h3#2-kostnad-timpris-mot-0-eller-149-kr-i-manaden 2. Kostnad: timpris mot 0 eller 149 kr i månaden". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h3#3-snabbhet-en-minut-i-stallet-for-en-bokad-tid 3. Snabbhet: en minut i stället för en bokad tid". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h3#4-samma-kriterier-varje-gang 4. Samma kriterier varje gång". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h3#2-personliga-brev-pa-nagra-sekunder 2. Personliga brev på några sekunder". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ny rubrik (2026-11-15): "h3#5-rekryteringstester-och-jobbmatchning 5. Rekryteringstester och jobbmatchning". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/jobbcoach-online.md.
- ok: ord i main 6045 → 6045 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/jobbcoach-online-v2.webp

### /artiklar/kompetenser-cv-guide
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/kompetenser-cv-guide.md.
- ok: ord i main 2750 → 2750 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/kompetenser-cv-guide-v2.webp

### /artiklar/online-cv-byggare-gratis
- tillåten JSON-LD-skillnad 2026-11-15 och 2026-11-15: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/online-cv-byggare-gratis.md. 2026-11-15: BlogPosting, FAQPage, HowTo och BreadcrumbList följer omskrivningen.
- ok: ny rubrik (2026-11-15): "h3# Helena Andersson". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2# Vanliga Frågor (FAQ)". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2# Snabbsvar: finns det en CV-byggare som är helt gratis?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vad-ar-en-cv-byggare-och-nar-slar-den-en-mall-i-word Vad är en CV-byggare, och när slår den en mall i Word?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vad-betyder-gratis-hos-en-cv-byggare Vad betyder "gratis" hos en CV-byggare?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#sa-laser-du-villkoren-innan-du-lagger-ner-en-timme Så läser du villkoren innan du lägger ner en timme". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#klarar-cvt-rekryteringssystemen Klarar CV:t rekryteringssystemen?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#sju-kontroller-innan-du-valjer-cv-byggare Sju kontroller innan du väljer CV-byggare". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#kan-du-borja-fran-linkedin-eller-ett-gammalt-cv Kan du börja från LinkedIn eller ett gammalt CV?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#sa-fungerar-var-cv-byggare Så fungerar vår CV-byggare". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#byggaren-gor-layouten-du-gor-innehallet Byggaren gör layouten, du gör innehållet". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ord i main 3746 → 3746 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/online-cv-byggare-gratis-v2.webp

### /artiklar/personligt-brev-layout
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/personligt-brev-layout.md.
- ok: ord i main 3183 → 3183 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/personligt-brev-layout-v2.webp

### /artiklar/personligt-brev-utbildning
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/personligt-brev-utbildning.md.
- ok: ny rubrik (2026-11-15): "h2#nar-spelar-det-personliga-brevet-roll-for-utbildningsansokningar När spelar det personliga brevet roll för utbildningsansökningar?". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/personligt-brev-utbildning.md.
- ok: ord i main 3719 → 3719 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/personligt-brev-utbildning-v2.webp

### /artiklar/referenser-cv
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/referenser-cv.md.
- ok: ord i main 3111 → 3111 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/referenser-cv-v2.webp

### /artiklar/vad-ar-en-jobbcoach
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#innan-generiskt-brev INNAN: Generiskt brev". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#efter-skraddarsytt-och-vardefokuserat EFTER: Skräddarsytt och värdefokuserat". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-1-cv-analys Verktyg 1: CV-analys". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-2-personliga-brev Verktyg 2: Personliga brev". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-4-cv-mallar Verktyg 4: CV-mallar". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-5-jobbmatchning Verktyg 5: Jobbmatchning". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-6-rekryteringstester-och-intervjutraning Verktyg 6: Rekryteringstester och intervjuträning". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h3#verktyg-7-jobbcoachen Verktyg 7: Jobbcoachen". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ny rubrik (2026-11-15): "h2#ett-konstruerat-exempel-samma-erfarenhet-nya-ord Ett konstruerat exempel: samma erfarenhet, nya ord". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-en-jobbcoach.md.
- ok: ord i main 5695 → 5695 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/vad-ar-en-jobbcoach-v2.webp

### /artiklar/vad-ar-ett-cv
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-ett-cv.md.
- ok: ny rubrik (2026-11-15): "h2#syftet-med-ett-cv-varfor-behovs-det Syftet med ett CV: varför behövs det?". Ny eller omskriven rubrik. Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/vad-ar-ett-cv.md.
- ok: ord i main 2788 → 2788 (+0.0 %)
- ok: länk ur Läs vidare (2026-11-16): /verktyg/cv-mallar. Bytt mot /cv-mallar (samma ställe i texten, bara href). SEO-strategens beslut 2026-11-16 ur Search Console: /cv-mallar är kanonisk, /verktyg/cv-mallar 308:ar dit och alla interna länkar pekar direkt på /cv-mallar (Word-ankaret #word står nu på /cv-mallar).
- ok: nya interna länkar i innehållet: ["/cv-mallar"]
- ok: ramen (header och footer, omritad enligt analysen): borta ["/verktyg/cv-mallar"], nya []
- ok: artikelbilden syns med imageAlt: /images/artiklar/vad-ar-ett-cv-v2.webp
