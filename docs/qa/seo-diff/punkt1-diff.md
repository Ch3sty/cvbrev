# SEO-diff

Före: docs/qa/seo-diff/punkt1-fore-live.json  
Efter: docs/qa/seo-diff/punkt1-efter.json  
Sidor: 22  
Fel: 0

### /
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-15: 2026-10-12: Publikt v2 våg 2: startsidan får Organization, WebSite och FAQPage (del A 5.1). Live saknar JSON-LD. 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaret om dataskydd lovade EU-lagring och radering med ett klick, och jobbmatchningen "varje natt". Frågorna oförändrade.
- ok: ord i main 1014 → 1028 (+1.4 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12 och 2026-11-15): Organization+WebSite+FAQPage

### /priser
- tillåten JSON-LD-skillnad 2026-10-12: SEO-granskningen våg 1–3, punkt 3: Nivåkollen skrivs som produktnamn i FAQ-svaret om att börja gratis. Frågorna oförändrade.
- ok: ord i main 1183 → 1224 (+3.5 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage

### /funktioner
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-15: 2026-10-12: Ägarbeslut 8 i del A avsnitt 10: /funktioner får FAQPage ur samma fem frågor som syns på sidan. 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaren om dataskydd (EU-lagring) och jobbmatchningen (varje natt) rättade. Frågorna oförändrade.
- ok: ord i main 1019 → 1059 (+3.9 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12 och 2026-11-15): FAQPage

### /om-oss
- ok: description bytt (2026-11-15): "Vi bygger jobbverktyg för svensk arbetsmarknad sedan 2023. Källor från Arbetsförmedlingen, SCB och fackförbund. Data i EU, och vi loggar aldrig in åt dig." → "Vi bygger jobbverktyg för svensk arbetsmarknad sedan 2023. Källor från Arbetsförmedlingen, SCB och fackförbund. Vi loggar aldrig in åt dig.". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). "Data i EU" stämde inte: databasen ligger i USA. Resten av beskrivningen oförändrad.
- ok: ord i main 300 → 300 (+0.0 %)

### /exempel
- tillåten JSON-LD-skillnad 2026-11-14: Huvudordsplanen steg 1 till 4 (docs/plan-huvudord-2026-12.md) och SEO-förslaget K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md). K4 c: /exempel är hubb, inte målsida; WebPage-schemat följer ny title och description, 41 mallar ur konstanten i stället för 25.
- ok: ord i main 1372 → 1375 (+0.2 %)

### /integritetspolicy
- ok: ord i main 1375 → 1584 (+15.2 %)

### /anvandarvillkor
- ok: ord i main 1627 → 1633 (+0.4 %)

### /for-rekryterare
- tillåten JSON-LD-skillnad 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaret lovade "All data lagras i EU"; databasen ligger i USA. Frågorna oförändrade.
- ok: ord i main 2119 → 2123 (+0.2 %)
- ok: JSON-LD ändrad i tillåten typ (2026-11-15): FAQPage

### /verktyg/bli-upptackt
- baslinjen omtagen 2026-09-23: Ägarbeslut: synligheten för rekryterare ingår i Allt, och texten ska säga det. Service-schemat (price 0, "Gratis att synas") och FAQPage-schemat fick en fråga om vad det kostar. h1, title, description och canonical oförändrade.
- tillåten JSON-LD-skillnad 2026-11-15: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Bli upptäckt är gratis för alla (saas-lead): kostnadssvaret och Service-beskrivningen sa att synligheten ingår i Premium, och Service hade ett Offer på 149 kr som tas bort. Frågorna oförändrade.
- ok: description bytt (2026-11-15): "Skapa en profil så kan rekryterare som söker din bakgrund hitta dig. Anonym tills du själv tackar ja. Ingår i Jobbcoach Premium, 149 kr i månaden." → "Skapa en profil så kan rekryterare som söker din bakgrund hitta dig. Anonym tills du själv tackar ja. Kostar inget, ingen kortuppgift.". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Bli upptäckt är gratis för alla (saas-lead): "Ingår i Jobbcoach Premium, 149 kr i månaden" blir "Kostar inget, ingen kortuppgift."
- ok: ord i main 1068 → 1077 (+0.8 %)
- ok: JSON-LD ändrad i tillåten typ (2026-11-15): FAQPage, Service

### /verktyg/cv-analys
- tillåten JSON-LD-skillnad 2026-10-12: FAQ-svaret om vad som händer efter analysen sa 'PDF eller Word'; det förbättrade CV:t laddas ner som PDF. Frågorna oförändrade. ägarkrav korrekta termer: "before/after" blir "före och efter".
- ok: description bytt (2026-11-15): "Vi läser ditt CV som ett rekryteringssystem gör och ger dig en läsbarhetspoäng, betyg i sex kategorier och konkreta åtgärder. En analys gratis per konto." → "Vi läser ditt CV som ett rekryteringssystem gör och ger dig en läsbarhetspoäng, poängen du kan nå och konkreta åtgärder. En analys gratis per konto.". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Analysen ger inga betyg i sex kategorier, utan poängen nu och poängen med förslagen.
- ok: FAQ-fråga bytt (2026-11-15, Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Det finns ingen jämförelse av versioner sida vid sida; frågan säger nu det som finns (köra om analysen).): "Kan jag jämföra olika versioner av mitt CV?" → "Kan jag köra analysen igen när jag ändrat i CV:t?"
- ok: FAQ-fråga bytt (2026-11-15, Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Det finns ingen jämförelse av versioner sida vid sida; frågan säger nu det som finns (köra om analysen).): "ld: Kan jag jämföra olika versioner av mitt CV?" → "Kan jag köra analysen igen när jag ändrat i CV:t?"
- ok: nya FAQ-frågor: ["Kan jag köra analysen igen när jag ändrat i CV:t?","ld: Kan jag köra analysen igen när jag ändrat i CV:t?"]
- ok: ord i main 869 → 927 (+6.7 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/cv-mallar
- tillåten JSON-LD-skillnad 2026-10-12: FAQ och HowTo följer de rättade Word-texterna; ny FAQ 'Vilka mallar finns som Word?'. ägarkrav korrekta termer: HowTo läses ur samma data som de synliga stegen; FAQ-frågan "mobile-friendly" blir "mobilanpassade".
- ok: ord i main 1588 → 1605 (+1.1 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): HowTo

### /verktyg/jobbcoachen
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: "Karriärguiden" blir "Jobbcoachen" i namn, steg och FAQ, och "(Källa N) inline" blir "direkt i texten".
- ok: ord i main 968 → 989 (+2.2 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage

### /verktyg/jobbmatchning
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg 4 (del A 5.5): FAQ-svaren läser FREE_TIER_JOB_LIMIT och JOB_MATCHES_PER_RUN, och "feed" blir "lista". Frågorna oförändrade. ägarkrav korrekta termer: "matchnings-procent" blir "matchning i procent".
- ok: ord i main 1031 → 1037 (+0.6 %)

### /verktyg/personligt-brev
- tillåten JSON-LD-skillnad 2026-10-12: Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). FAQ-svaret om dataskydd lovade EU-lagring; WebApplication sa sex tonaliteter (det är fem toner plus automatiskt tonval i Premium). Frågorna oförändrade. ägarkrav korrekta termer: Steget "Välj mall och ton": "Sju mallar och sex tonlägen, från professionellt till entusiastiskt."
- ok: description bytt (2026-11-15): "Vi läser annonsens kravprofil och skriver brevet mot den. Sju mallar, sex tonaliteter, export som PDF eller Word. Första brevet gratis, ingen kortuppgift." → "Vi läser annonsens kravprofil och skriver brevet mot den. Sju mallar, fem toner, export som PDF eller Word. Första brevet gratis, ingen kortuppgift.". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Fem toner, inte sex tonaliteter.
- ok: ord i main 1100 → 1115 (+1.4 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/rekryteringstester
- tillåten JSON-LD-skillnad 2026-10-12: Ägarbeslut 1 i del A avsnitt 10: FAQ-svaren om verbalt och numeriskt läser testConfigs tal för träningspassen och nämner övningsprovet separat. Frågetexterna är oförändrade.
- ok: ord i main 2692 → 2692 (+0.0 %)

### /verktyg/skapa-cv
- tillåten JSON-LD-skillnad 2026-10-12: FAQ, HowTo och WebApplication (featureList, description) följer de rättade Word-texterna. ägarkrav korrekta termer: "live-preview" blir "förhandsvisning", "auto-save" och "mobile-friendly" blir svenska.
- ok: rubrik bytt (2026-11-15): "h3 Sparas automatiskt" → "h3 Utkastet väntar på dig". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Utkastet sparas bara i webbläsaren tills du sparar i sista steget.
- ok: rubrik bytt (2026-11-15): "h3 Hämta uppgifterna från LinkedIn" → "h3 Börja från ett CV du redan har". Punkt 1 i svepet 2026-11-15: produkttexter som inte stämde med koden rättade (docs/qa/produkttexter-2026-11-15.md). Det finns ingen LinkedIn-import.
- ok: nya rubriker: ["h3 Utkastet väntar på dig","h3 Börja från ett CV du redan har"]
- ok: ord i main 899 → 983 (+9.3 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /artiklar/verifierade-testresultat-vs-cv
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/verifierade-testresultat-vs-cv.md.
- ok: ord i main 1902 → 1918 (+0.8 %)
- ok: BlogPosting wordCount 1521 → 1537 (alt-texten i första CustomImage)
- ok: JSON-LD ändrad i tillåten typ (2026-11-15): FAQPage
- ok: artikelbilden syns med imageAlt: /images/artiklar/verifierade-testresultat-vs-cv-v2.webp

### /cv-exempel/sjukskoterska
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken (FAQ-svar, tipsens text och CV:ts text i articleBody). Frågor och rubriker oförändrade.
- ok: ord i main 2294 → 2294 (+0.0 %)

### /personligt-brev-exempel/sjukskoterska
- tillåten JSON-LD-skillnad 2026-10-12 och 2026-11-14: 2026-10-12: Publikt v2 våg B3: datePublished är yrkets publiceringsdatum (publicerad.ts) och dateModified fast, i stället för byggdagen. Exempel-paritet: brevets person heter och nås som i CV-exemplet för samma yrke (namn, e-post och telefon i articleBody, och namnet i beskrivningarna). Talstreck och pilar i exempeldatan ersatta med svenska skiljetecken. Frågor och rubriker oförändrade. 2026-11-14: K4 till K6 (docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md): yrkessidornas BreadcrumbList följer den synliga smulan via /exempel.
- ok: ord i main 2329 → 2329 (+0.0 %)

### /artiklar/logiska-tester
- tillåten JSON-LD-skillnad 2026-11-08 och 2026-11-09 och 2026-11-10 och 2026-11-15: 2026-11-08: analys 2026-11-08, CTR och position: BlogPostings description, keywords, wordCount eller innehållsförteckning följer den nya metadatan och de nya avsnitten. 2026-11-09: riktiga figurer i stället för tecken: BlogPostings wordCount följer den nya texten. 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/logiska-tester.md. 2026-11-10: SEO-plan nya tester (U3, U5): länken med ankartexten deduktivt test i avsnittet om testtyperna. BlogPostings wordCount följer texten.
- ok: ny rubrik (2026-11-08): "h2#logiktest-begavningstest-och-intelligenstest-ar-det-samma-sak Logiktest, begåvningstest och intelligenstest: är det samma sak?". analys 2026-11-08, CTR och position: fördjupning mot de frågor sidan tappat. Befintliga rubriker orörda.
- ok: ny rubrik (2026-11-08): "h2#logiktest-vid-rekrytering-nar-kommer-det-och-hur-gar-det-till Logiktest vid rekrytering: när kommer det och hur går det till?". analys 2026-11-08, CTR och position: fördjupning mot de frågor sidan tappat. Befintliga rubriker orörda.
- ok: ny rubrik (2026-11-08): "h2#exempel-pa-logiska-fragor-med-facit Exempel på logiska frågor med facit". analys 2026-11-08, CTR och position: fördjupning mot de frågor sidan tappat. Befintliga rubriker orörda.
- ok: ny rubrik (2026-11-08): "h2#gratis-logiktest-har-kan-du-ova Gratis logiktest: här kan du öva". analys 2026-11-08, CTR och position: fördjupning mot de frågor sidan tappat. Befintliga rubriker orörda.
- ok: ord i main 3966 → 3966 (+0.0 %)
- ok: artikelbilden syns med imageAlt: /images/artiklar/logiska-tester-v2.webp

### /artiklar/arbetsintervju-guide
- tillåten JSON-LD-skillnad 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/arbetsintervju-guide.md.
- ok: ord i main 2882 → 2884 (+0.1 %)
- ok: artikelbilden syns med imageAlt: /images/artiklar/arbetsintervju-guide-v2.webp

### /artiklar/din-digitala-jobbcoach
- tillåten JSON-LD-skillnad 2026-11-15 och 2026-11-15: 2026-11-15: Faktagranskningen 2026-11-15 (ägarens uppdrag): felaktiga, obelagda och påhittade uppgifter rättade eller strukna, granskade i tre led. Underlag: docs/qa/faktagranskning-2026-11/din-digitala-jobbcoach.md. 2026-11-15: BlogPosting, FAQPage, HowTo och BreadcrumbList följer omskrivningen.
- ok: ny rubrik (2026-11-15): "h2# Vanliga Frågor (FAQ)". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h3# Johan Lindberg". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2# Snabbsvar: hur söker man jobb med AI?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vad-anvander-du-en-ai-jobbcoach-till Vad använder du en AI-jobbcoach till?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#hur-ser-rekryterare-pa-ansokningar-skrivna-med-ai Hur ser rekryterare på ansökningar skrivna med AI?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#sa-anvander-du-en-ai-jobbcoach-steg-for-steg Så använder du en AI-jobbcoach, steg för steg". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vilka-fragor-ger-bra-svar Vilka frågor ger bra svar?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#var-gar-gransen-for-vad-ai-ska-gora Var går gränsen för vad AI ska göra?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vad-skiljer-en-allman-ai-chatt-fran-en-jobbcoach-byggd-for-svensk-arbetsmarknad Vad skiljer en allmän AI-chatt från en jobbcoach byggd för svensk arbetsmarknad?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#nar-behover-du-en-manniska-i-stallet När behöver du en människa i stället?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ny rubrik (2026-11-15): "h2#vad-kostar-det-att-anvanda-jobbcoachen Vad kostar det att använda Jobbcoachen?". Rubrikträdet följer omskrivningen. Omskriven som ny artikel till dagens artikelstandard (ägarens uppdrag 2026-11-15, svepet punkt 2): påhittade och felaktiga uppgifter om produkten borta, källbelagd, frågeformade rubriker, ny FAQ. Granskad och godkänd av SEO-strateg, copywriter, säljansvarig, faktagranskare och art-director (docs/qa/svep-2026-11-15/).
- ok: ord i main 3144 → 3146 (+0.1 %)
- ok: artikelbilden syns med imageAlt: /images/artiklar/din-digitala-jobbcoach-v2.webp
