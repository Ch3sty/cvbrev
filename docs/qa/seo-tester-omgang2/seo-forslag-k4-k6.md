# SEO-förslag för K4, K5 och K6

SEO-strategen, 2026-11-14. Underlag för Opus på grenen `feat/matning-kampanj` i `.claude/worktrees/publikt-v2`. Granskningen vid bygget görs mot det här dokumentet.

Alla tal är räknade i koden den 14 november: `TEMPLATE_COUNT` 41, `FREE_TEMPLATE_COUNT` 3 (Norrsken, Sidopanel, Student), 30 mallar med `atsSafe: true`, `YRKESMALL_LIST` 74, `CV_GALLERI` 89, `BREV_GALLERI` 89, `KATEGORIER` 10, `FREE_CV_EXPORTS` 1, brevkvoten ett brev per sju dagar, CV-analysen en per konto. Search Console är läst för 16 okt till 12 nov.

**Regel för bygget:** alla tal i title, H1, description, snabbsvar och schema på galleriorna läses ur konstanterna, aldrig hårdkodat. I artiklarnas frontmatter skrivs talet ut (89) och rättas för hand.

---

## 0. Fynd som måste rättas i samma omgång

Det här är fel i dag. Flera av dem gör titlarna nedan osanna om de står kvar.

| # | Fil | Fel | Rättning |
|---|---|---|---|
| F1 | `src/app/(public)/exempel/components/galleri-faq.ts`, CV-frågan "Är CV-exemplen gratis att använda?" | "får en CV-analys var tredje dag" | Gränsen är en CV-analys per konto (`CV_ANALYSIS_LIMIT`). Nytt slut på svaret: "Vill du sedan bygga ditt eget CV med våra verktyg registrerar du dig gratis, och då ingår en CV-analys." |
| F2 | samma fil, brevfrågan "Är brev-exemplen gratis att använda?" | "ett brev om dagen helt gratis" | Gränsen är ett brev per sju dagar. Nytt slut: "Vill du sedan skriva ditt eget brev med våra verktyg ingår ett brev i veckan när du har registrerat dig." |
| F3 | `CvMallarPageContent.tsx`, hjältens ingress | "Alla mallar är ATS-säkra" | 30 av 41 är märkta. Se K6 för ny text. |
| F4 | `CvMallarPageContent.tsx`, korsbandet | "Vi har 74 färdiga CV-exempel" | `{CV_GALLERI.length}` |
| F5 | `exempel/components/ExempelHero.tsx` | "fördelade över sex branscher", "25 CV-mallar" | "fördelade över {KATEGORIER.length} kategorier", "{TEMPLATE_COUNT} CV-mallar" |
| F6 | `exempel/layout.tsx` och `exempel/page.tsx` (WebPage-schemat) | "25 färdiga CV-mallar", "Allt gratis" | Se K4 c, punkt 2. |
| F7 | `exempel/components/MallarHubGuideSection.tsx`, "Är alla mallar verkligen gratis?" | "Alla 151 mallar ... inga premium-versioner" | Se K4 c, punkt 2. |
| F8 | `cv-mallar/yrkesmall-data.ts`, `YRKE_TILL_MALLAR` | 51 av 74 yrkesmallar har en mall i Premium som "free" (Tidlös, Disk, Logistik, Konto, Myndighet, Verkstad, Linje, Stack, Bygg). Yrkessidan märker den "Gratis" och knappen heter "Använd gratis". | Kontrollera i `/cv-mallar/start` om mallen går att ladda ner utan Premium. Gör den inte det: märkningen ska läsa `isTemplateFree(id)` ur registret, och där mallen inte är gratis står "Ingår i Premium". Ändra inte mappningen utan saas-lead. Det här är en sanningsfråga och går före titlarna. |
| F9 | `content/artiklar/cv-mall-pdf-gratis.mdx` rad 46 och 52 | "gratis och utan konto" om nedladdningen | Nedladdningen räknas per konto (`FREE_CV_EXPORTS` 1). Om det stämmer: "gratis med ett konto". Ingen titeländring på sidan (M1 ligger hos ägaren). |
| F10 | Gamla antal i artiklar | "74", "76", "trettio", "30+" | Rättas i de artiklar vi ändå rör i K4 b (listade per sida). Övriga (`hur-ska-ett-cv-se-ut`, `hur-skriver-man-cv`, `inleda-personligt-brev`, `personligt-brev-innehall-checklista`, `personligt-brev-layout`) i en separat MDX-commit, gärna samma vecka. |
| F11 | Ankartext som pekar fel | `cv-mall-gratis-guide` rad 232: "[74 färdiga CV-mallar](/cv-exempel)". `personligt-brev-mall-gratis` rad 301: "[76 färdiga mallar och exempel](/personligt-brev-exempel)". `MallarHubGuideSection` (hubben): "CV-mallar 2026" pekar på en artikel, "Bläddra CV-mallar" pekar på /cv-exempel. | Rättas i K4 b och c. Ordet "CV-mallar" i en ankartext ska bara peka på /cv-mallar. |

---

## K4 a. Titel, H1 och description på de fem målsidorna

Ingen av sidorna har bytt titel sedan juni (git), och ingen står under avläsning i plan H. Bytet sker en gång, 18 till 22 nov, och läses 19 jan. Varumärket stryks där det inte ryms.

### 1. /cv-mallar (huvudord: cv mall, cv mallar, gratis cv mall)

Fil: `src/app/(public)/cv-mallar/page.tsx` (metadata) och `components/CvMallarPageContent.tsx` (H1).

| Fält | Nuvarande | Nytt |
|---|---|---|
| title | `CV-mallar 2026 — gratis och premium-mallar att ladda ner \| Jobbcoach.ai` (73 tecken, talstreck) | `CV-mall: ${TEMPLATE_COUNT} mallar att fylla i och ladda ner, ${FREE_TEMPLATE_COUNT} gratis` (54) |
| H1 | `CV-mallar för svenska yrken` + gradient `gratis eller i Premium` | `CV-mallar att fylla i och ladda ner.` + gradient `{TEMPLATE_COUNT} mallar, {FREE_TEMPLATE_COUNT} gratis.` |
| description | `Välj bland färdiga ATS-säkra CV-mallar ... Modern, traditionell, kreativ — välj din stil.` (talstreck, påstår att alla är ATS-säkra) | `CV-mallar för svenska jobb: ${TEMPLATE_COUNT} mallar att fylla i direkt och ladda ner som PDF, ${FREE_TEMPLATE_COUNT} av dem gratis. Se vilken mall som passar ditt yrke och din erfarenhet.` (152) |
| OG/Twitter title | med talstreck | samma som title |
| OG/Twitter description | "Helt gratis" | samma som description |
| ItemList `description` | "... ATS-säkra, gratis och anpassade för svenska arbetsgivare." | `CV-mallar för ${YRKESMALL_LIST.length} svenska yrken, med rätt sektioner och rekryterarens tips per yrke.` |

Varför: "CV-mall" i singular har störst efterfrågan (157 visningar mot 96), sidan ligger på 31 och visas inte alls på gratisvarianten. Vi lovar bara det sidan håller: 41 mallar, 3 gratis, PDF. Inget "Word" (FAQ:n säger själv att Word-export saknas).

### 2. /cv-exempel (huvudord: cv exempel)

Fil: `src/app/(public)/cv-exempel/page.tsx` och H1 i `exempel/components/GalleriPageContent.tsx`.

| Fält | Nuvarande | Nytt |
|---|---|---|
| title | `89 CV-exempel för svenska yrken 2026 — gratis och ATS-optimerade \| Jobbcoach.ai` (talstreck, för lång, siffran först) | `CV-exempel: ${ANTAL_CV} färdiga CV för svenska yrken \| Jobbcoach.ai` (58) |
| H1 | `89 CV-exempel.` + span `Ett för ditt yrke.` | `CV-exempel för {yrken.length} yrken.` + span `Börja med ditt.` |
| description | `Se färdiga CV-exempel för 89 svenska yrken — vård, ...` (talstreck) | `CV-exempel för ${ANTAL_CV} svenska yrken, från undersköterska till systemutvecklare. Se hur profil, erfarenhet och kompetenser formuleras och använd exemplet som mall.` (158) |
| OG/Twitter | "Helt gratis" | samma som title och description |
| Kommentaren rad 2 | "galleri-sida med 74 CV-exempel" | ta bort talet |

Inget årtal: titeln ska inte behöva bytas i januari mitt i avläsningsfönstret.

### 3. /personligt-brev-exempel (huvudord: personligt brev exempel, exempel på personligt brev)

Fil: `src/app/(public)/personligt-brev-exempel/page.tsx` och H1 i `GalleriPageContent.tsx`.

| Fält | Nuvarande | Nytt |
|---|---|---|
| title | `Personligt brev-mallar: 89 färdiga exempel för svenska jobb \| Jobbcoach.ai` | `Personligt brev exempel: ${ANTAL_BREV} färdiga brev för svenska yrken` (58) |
| H1 | `Personligt brev-mallar och exempel:` + span `89 yrken (gratis)` | `Personligt brev-exempel för {yrken.length} yrken.` + span `Börja med ditt.` |
| description | `89 färdiga mallar för personligt brev inom ...` | `Personligt brev exempel för ${ANTAL_BREV} yrken, skrivna för svenska rekryterare. Se inledning, koppling till annonsen och avslutning, och använd brevet som mall.` (151) |
| OG/Twitter title och description | "mallar för personligt brev", "Helt gratis" | samma som title och description |
| ItemList | `name: 'Mallar för personligt brev till svenska yrken'`, poster `Mall för personligt brev: {namn}` | `name: 'Personligt brev-exempel för svenska yrken'`, `description: \`${ANTAL_BREV} exempel på personligt brev för yrken i ${KATEGORIER.length} kategorier.\``, poster `Personligt brev-exempel: {namn}` |
| keywords | börjar med "personligt brev mall" | börja med `personligt brev exempel, exempel på personligt brev`; ta bort mall-orden |
| Kommentaren rad 2 | "76 personliga brev-exempel" | ta bort talet |

Varför: sidan riktade titeln mot "mall" och syns där bara 5 gånger. "Mall" ägs av artikeln personligt-brev-mall-gratis (pos 16,4). Galleriet tar exempelorden.

### 4. /artiklar/skriva-personligt-brev-guide (huvudord: personligt brev)

Fil: `content/artiklar/skriva-personligt-brev-guide.mdx`, frontmatter.

| Fält | Nuvarande | Nytt |
|---|---|---|
| seoTitle | `Skriva personligt brev: guide, mall och 3 exempel 2026` | `Personligt brev: så skriver du det, med 3 färdiga exempel` (57) |
| title (H1) | `Skriva personligt brev: så får du rekryteraren att läsa hela` | `Personligt brev: så skriver du ett som rekryteraren läser hela` |
| description | `Skriva personligt brev som rekryteraren läser hela: struktur, 3 färdiga mallar och exemplet som visar skillnaden mot ett AI-brev. Allt på en sida.` | `Personligt brev som rekryteraren läser hela: strukturen i fyra delar, 3 färdiga brev för olika lägen och exemplet som visar skillnaden mot ett AI-brev.` (151) |

Ordet "mall" går ur titel och description, så att guiden slutar konkurrera med mall-gratis-artikeln om "personligt brev mall" (guiden 25,5 mot mall-artikeln 16,4). "Skriver" står kvar i H1, så "skriva personligt brev" behåller sin träff.

**Backningsregel:** guiden ligger på 17,7 för "personligt brev". Är snittpositionen på den frågan sämre än 25 för de 14 dagarna före avläsningen 7 dec, återställs seoTitle (H1 och description står kvar).

### 5. /artiklar/personligt-brev-mall-gratis (huvudord: personligt brev mall)

Fil: `content/artiklar/personligt-brev-mall-gratis.mdx`, frontmatter.

| Fält | Nuvarande | Nytt |
|---|---|---|
| seoTitle | `Personligt brev mall gratis: ladda ner 76 exempel 2026` | `Personligt brev mall gratis: så ser en mall ut som fungerar` (59) |
| title (H1) | `Personligt brev mall gratis: vad du ska använda` | `Personligt brev mall gratis: den som fungerar och de du ska undvika` |
| description | `Personligt brev mall gratis: ladda ner 76 yrkesexempel utan konto. ...` | `Personligt brev mall gratis: strukturen i fyra delar, vilka gratismallar som fungerar och vilka du ska undvika, plus 89 yrkesexempel att utgå från.` (147) |

"Ladda ner 76 exempel" stryks: talet är fel och exemplen laddas inte ner, de läses. Exemplen är galleriets ord. I samma commit: alla "76" i filen blir "89" (rad 11, 27, 34, 131, 161, 309, 341 och tabellraden), och rad 301 blir `[89 personligt brev-exempel](/personligt-brev-exempel)`.

---

## K4 b. Länkar från stödsidorna

En mening per sida, med huvudordet i ankartexten, högt upp. Länkens mål är målsidan. Där sidan redan har en sådan länk högt upp står "ingen ändring".

### Till /cv-mallar

| Stödsida | Placering | Mening (ankartext i hakparentes) |
|---|---|---|
| `cv-mall-gratis-guide.mdx` | Nytt stycke efter tredje inledningsstycket ("Om du orkar läsa hela ..."), före snabbsvaret | `Vill du se mallarna direkt har vi samlat alla våra [CV-mallar](/cv-mallar) på en sida, med de tre som är gratis tydligt märkta.` |
| samma fil, rättningar | Snabbsvaret rad 38 och rad 112: "74" blir "89", "sex branscher" blir "tio kategorier". Rad 232: `[74 färdiga CV-mallar](/cv-exempel)` blir `[89 färdiga CV-exempel](/cv-exempel)`. | |
| `cv-mall-word-gratis.mdx` | Nytt stycke direkt efter snabbsvarsrutan, före "Att skapa ett CV som fångar ..." | `Vill du jämföra designer innan du öppnar Word kan du bläddra bland alla våra [CV-mallar](/cv-mallar) sida vid sida.` |
| `cv-mall-pdf-gratis.mdx` | Sist i första stycket (efter "... hur du gör rätt"), före "Oavsett väg ..." | `Vill du först se alla designer, och vilka som är gratis, finns de samlade bland våra [CV-mallar](/cv-mallar).` |
| /exempel | Hjältens ingress, `ExempelHero.tsx` | `Vi har {TOTAL_CV_YRKEN} CV-exempel och {TOTAL_BREV_YRKEN} exempel på personligt brev fördelade över {KATEGORIER.length} kategorier. Behöver du en färdig design i stället finns {TEMPLATE_COUNT} [CV-mallar](/cv-mallar) att välja mellan.` (ordet CV-mallar blir länken) |
| /verktyg/cv-mallar | Sist i stycket under "Alla våra mallar. På ett ställe." i `components/CVMallarGalleri.tsx` | `Vill du se vilken mall som passar ditt yrke har vi [CV-mallar per yrke](/cv-mallar) med rekryterarens tips.` (inget tal, så att klientkomponenten inte drar in `YRKESMALL_LIST`) |
| Startsidan | | Ingen ändring före kampanjen. Kortet "CV-mallar" pekar på /verktyg/cv-mallar, som har canonical till /cv-mallar, och ankartexten bär redan ordet. Startsidan är dessutom den yta kampanjen syns mest på. |

### Till /artiklar/skriva-personligt-brev-guide

| Stödsida | Placering | Mening |
|---|---|---|
| `vad-ar-ett-personligt-brev.mdx` | Sist i första stycket ("... och varför skulle du passa?"), före snabbsvaret | `När du vet vad brevet ska göra visar vår guide [hur du skriver ett personligt brev](/artiklar/skriva-personligt-brev-guide) från första meningen till avslutningen.` |
| `cv-och-personligt-brev.mdx` | Sist i stycket "Den här guiden handlar om helheten ..." | `Vill du gå på djupet med brevet för sig har vi en egen guide om att [skriva personligt brev](/artiklar/skriva-personligt-brev-guide).` |
| `personligt-brev-jobbansokan.mdx` | Sist i tredje stycket ("Den här guiden visar dig exakt hur ...") | `Vill du först se strukturen bakom ett [personligt brev](/artiklar/skriva-personligt-brev-guide) som rekryteraren läser hela, har vi en egen guide om just det.` |
| `hur-skriver-man-ett-personligt-brev.mdx` | | Ingen ändring. Rad 58 länkar redan högt upp med "breda guide om att skriva personligt brev". Rad 280: "trettio färdiga" blir "89 färdiga". |
| `tips-pa-personligt-brev.mdx` | Nytt stycke efter "Det här är de tio skillnaderna ...", före snabbsvaret | `Tipsen förutsätter att grunden sitter. Saknas den, börja med vår guide om att [skriva personligt brev](/artiklar/skriva-personligt-brev-guide).` |
| `bra-personligt-brev.mdx` | Sist i stycket "Många tror att ett bra personligt brev handlar om ...", före "I den här guiden får du:" | `Här bedömer vi färdiga brev. Hur du skriver ditt eget från början går vi igenom i guiden om att [skriva personligt brev](/artiklar/skriva-personligt-brev-guide).` |

### Till /artiklar/personligt-brev-mall-gratis

| Stödsida | Placering | Mening |
|---|---|---|
| `skriva-personligt-brev-guide.mdx` | Sist i stycket "Du får tre fullständiga mallar att utgå från ..." | `Letar du bara efter en mall, och vill veta vilka gratismallar på nätet du ska undvika, gå direkt till [Personligt brev mall gratis](/artiklar/personligt-brev-mall-gratis).` |
| samma fil, rättning | Rad 286: `[trettio färdiga exempel för olika yrken](/personligt-brev-exempel)` blir `[personligt brev-exempel för 89 yrken](/personligt-brev-exempel)` | |
| `personligt-brev-mall-word.mdx` | Nytt stycke direkt efter snabbsvarsrutan, före "## Varför använda en Word-mall" | `Vill du jämföra Word-mallarna med andra gratis alternativ har vi gått igenom dem i [Personligt brev mall gratis](/artiklar/personligt-brev-mall-gratis).` |

Ankartexten är artikelns egen rubrik, därför versal och utan böjning.

### Till /personligt-brev-exempel

| Stödsida | Placering | Mening |
|---|---|---|
| `personligt-brev-exempel-generella.mdx` | Rad 53, ersätter de två första meningarna i stycket och pillänken | `Vi har [personligt brev-exempel för 89 yrken](/personligt-brev-exempel), skrivna för svenska rekryterare. Söker du som student, sjuksköterska, säljare eller något annat yrke ser du exakt hur ett starkt brev kan se ut.` (hrefen finns kvar, så ingen länk försvinner) |
| samma fil, rättningar | Rad 20 och 236 "över 30" blir "89". Rad 192: `[Se alla 89 personligt brev-exempel](/personligt-brev-exempel)`. H2 rad 181 "Se kompletta exempel för 30+ yrken" blir "Se kompletta exempel för 89 yrken" (RUBRIK_BYTT-undantag). Rad 210 "30+" blir "89". | |
| `personligt-brev-jobbansokan.mdx` | Sist i stycket som börjar "Skillnaden mot CV:t är enkel." under H2 "Snabbsvar: Vad är ett personligt brev i en jobbansökan?" | `Färdiga brev för 89 yrken hittar du bland våra [personligt brev-exempel](/personligt-brev-exempel).` |
| Yrkessidorna | Se K4 c, punkt 1 | |

### Till /cv-exempel

| Stödsida | Placering | Mening |
|---|---|---|
| /exempel | | Ingen ny mening. Hjälteknappen "Se CV-exempel" bär redan ordet. Rättningen av knappen "Bläddra CV-mallar" står i K4 c. |
| `cv-exempel-yrken.mdx` | Rad 46, sista meningen i andra stycket | `Vill du hellre se kompletta CV:n direkt finns alla roller samlade bland våra [CV-exempel för 89 yrken](/cv-exempel).` Rad 14 (FAQ) och 264: "CV-galleri med 74 yrkesexempel" blir "CV-exempel för 89 yrken". |
| `exempel-pa-cv-guide.mdx` | Rad 54, snabbsvarets sista mening | `Hitta yrkesspecifika exempel bland våra <a href="/cv-exempel">CV-exempel för 89 yrken</a>.` (ersätter den nakna adressen som ankartext) |
| `skriva-cv-guide.mdx` | Sist i tredje stycket ("Målet är enkelt ...") | `Vill du se hur ett färdigt CV ser ut i ditt yrke har vi [CV-exempel för 89 yrken](/cv-exempel).` |

### Skärpta titlar på stödsidor

Bara där sidan syns på huvudordet, ligger långt ner på det (sämre än 50) och har en egen långsvans att ta. Ingen av dem har bytt titel sedan juni och ingen står under avläsning. H1 (`title`) rörs inte.

| Sida | Varför | seoTitle nu | seoTitle ny | description ny |
|---|---|---|---|---|
| `cv-mall-gratis-guide.mdx` | Syns på "gratis cv mall" (73), "cv mall" (75), "cv mall gratis" (76), "cv mallar" (83). Tar visningar från /cv-mallar utan att nå upp. | `CV-mall gratis 2026: vilka funkar (och vilka du ska skippa)` | `Var hittar man en gratis CV-mall? 5 källor jämförda` (51) | `Var hittar man en gratis CV-mall som klarar rekryteringssystemen? Vi jämför fem källor, visar fem malltyper att undvika och hur du anpassar mallen.` (147) |
| `personligt-brev-exempel-generella.mdx` | Syns på "personligt brev exempel" (50) och "exempel på personligt brev" (58), och titeln börjar med huvudordet. Sidans egentliga ämne är hur man använder exempel. | `Personligt brev exempel: Inspiration & färdiga brev` | `Så använder du exempel på personligt brev utan att kopiera` (58) | `Så använder du exempel på personligt brev: vad du ska låna, vad du aldrig kopierar och ett brev som går från svagt till starkt, steg för steg.` (142) |

Talen i `cv-mall-gratis-guide` stämmer mot artikeln: fem källor under "Var du hittar bra mallar gratis" och fem malltyper under "Mallar du ska undvika".

**Rörs inte:** `personligt-brev-jobbansokan` (19,6 på "personligt brev exempel" och 29 på "personligt brev"; för mycket att förlora), `vad-ar-ett-personligt-brev`, `bra-personligt-brev`, `tips-pa-personligt-brev`, `cv-och-personligt-brev`, `cv-mall-word-gratis`, `personligt-brev-mall-word`, `cv-exempel-yrken`, `exempel-pa-cv-guide`, `skriva-cv-guide` (titlarna är redan långsvans), `hur-skriver-man-ett-personligt-brev` och `cv-mall-pdf-gratis` (sammanslagningarna M8 och M1 ligger hos ägaren).

**Utanför tabellen, värd en mening senare:** `personligt-brev-exempel-situationer` ligger på 18 för "personligt brev exempel", bättre än galleriet. Den ska inte ändras nu, men en länk till /personligt-brev-exempel högt upp kan läggas i nästa MDX-omgång.

---

## K4 c. Teknisk grund

1. **Yrkessidornas länk tillbaka till galleriet.** I dag finns bara brödsmulan ("CV-exempel", "Personligt brev-exempel"), vilket är rätt ord. Två rättningar:
   - `src/components/publikt/innehall/exempel/ExempelMall.tsx`, avsnitt 8, ingressen under "Fler CV-exempel" och "Fler personliga brev-exempel". Ny text: CV: `Hitta inspiration från liknande yrken, eller se alla <Link href="/cv-exempel">{CV_GALLERI.length} CV-exempel</Link>. Alla följer samma upplägg.` Brev: `Hitta inspiration från liknande yrken, eller se alla <Link href="/personligt-brev-exempel">{BREV_GALLERI.length} personligt brev-exempel</Link>. Alla följer samma upplägg.` (`CV_GALLERI` och `BREV_GALLERI` är redan importerade.) "ATS-optimerade upplägg" stryks för brevens del, där det inte betyder något.
   - BreadcrumbList på `cv-exempel/[yrke]/page.tsx` (rad cirka 23470) och `personligt-brev-exempel/[yrke]/page.tsx` (rad cirka 144) har tre nivåer med namnen "CV Exempel" och "Personligt Brev Exempel". Den synliga smulan har fyra: Hem, Exempel, CV-exempel, yrket. Schemat ska följa den synliga: lägg till Exempel som nivå 2 och använd namnen "CV-exempel" och "Personligt brev-exempel".
2. **/exempel som hubb, inte mål.** Fil: `src/app/(public)/exempel/layout.tsx`, `page.tsx`, `components/ExempelHero.tsx`, `components/MallarHubGuideSection.tsx`.
   - title: `CV-exempel, brev-exempel och CV-mallar för svenska yrken | Jobbcoach.ai` blir `Exempel för jobbansökan: CV, personligt brev och mallar` (55).
   - description: `Vi har 89 CV-exempel, 89 exempel på personligt brev och 41 CV-mallar. Börja med ditt yrke och gå vidare till exemplet, brevet eller mallen du behöver.` (150, talen ur konstanterna).
   - H1: `CV-exempel, brev-exempel och` + span `CV-mallar för svenska yrken.` blir `Exempel för din jobbansökan:` + span `CV, personligt brev och mallar.`
   - OG/Twitter: samma som title och description; "175 färdiga exempel" och "Helt gratis" stryks.
   - WebPage-schemat: `name` som nya title, `description` som nya description.
   - keywords: ta bort `cv exempel, exempel cv, bra cv exempel, personligt brev exempel, cv mall, cv mallar`.
   - Hjälteknappen "Brev-exempel" blir "Personligt brev-exempel".
   - `MallarHubGuideSection`, slutknapparna: "Bläddra CV-mallar" (till /cv-exempel) blir "Bläddra CV-exempel", "Bläddra brev-mallar" blir "Bläddra personligt brev-exempel". Hrefen är densamma.
   - Samma fil, länkarna till artiklarna: ankartexten "CV-mallar 2026" blir "var du hittar en gratis CV-mall". Lägg till efter meningen: ` Alla våra designer finns bland <Link href="/cv-mallar">CV-mallar</Link>.`
   - Samma fil, "Är alla mallar verkligen gratis?": första stycket blir `Ja, alla {TOTAL_EXEMPEL} exempel i biblioteket är gratis att läsa och använda, och du behöver inget konto. CV-mallarna är en annan sak: {FREE_TEMPLATE_COUNT} av {TEMPLATE_COUNT} är gratis, resten ingår i Premium. Vi tar aldrig betalt för att du läser.` (kontrollera att `TOTAL_EXEMPEL` är 178 och inte räknar in mallarna).
3. **ItemList.** /cv-exempel och /personligt-brev-exempel listar alla 89 med url, det räcker. /cv-mallar listar de 74 yrkesmallarna med url, det räcker; de 41 designerna har inga egna adresser och ska inte in. Rättningarna av namn och description står i K4 a.
4. **Canonical.** /verktyg/cv-mallar har canonical till /cv-mallar men syns ändå på "cv mallar" (36 visningar, pos 73). Google följer alltså inte canonical. Inget görs nu; läses 19 jan. Syns sidan då fortfarande på huvudordet tar vi upp noindex eller ny titel med saas-lead.

### SEO-diffen för K4

/cv-mallar och /exempel finns inte i skriptets standardlistor. Kör med `--sidor`:

```
/cv-mallar,/cv-mallar/student,/cv-mallar/chef,/exempel,/cv-exempel,/personligt-brev-exempel,/cv-exempel/projektledare,/personligt-brev-exempel/projektledare,/cv-exempel/student,/personligt-brev-exempel/student,/verktyg/cv-mallar,/artiklar/skriva-personligt-brev-guide,/artiklar/personligt-brev-mall-gratis,/artiklar/cv-mall-gratis-guide,/artiklar/cv-mall-word-gratis,/artiklar/cv-mall-pdf-gratis,/artiklar/vad-ar-ett-personligt-brev,/artiklar/cv-och-personligt-brev,/artiklar/personligt-brev-jobbansokan,/artiklar/hur-skriver-man-ett-personligt-brev,/artiklar/tips-pa-personligt-brev,/artiklar/bra-personligt-brev,/artiklar/personligt-brev-mall-word,/artiklar/personligt-brev-exempel-generella,/artiklar/cv-exempel-yrken,/artiklar/exempel-pa-cv-guide,/artiklar/skriva-cv-guide
```

Fore-avtrycket tas mot live (`--bas https://www.jobbcoach.ai`) före första commit. Undantagen läggs i en ny fil, `scripts/seo-baslinje/huvudord-2026-11-undantag.json`, datum 2026-11-18 till 22, skäl "Huvudordsplanen steg 1, 3 och 4 (docs/plan-huvudord-2026-12.md), SEO-förslaget K4":
- `META_BYTT` title och description: /cv-mallar, /cv-exempel, /personligt-brev-exempel, /exempel, skriva-personligt-brev-guide, personligt-brev-mall-gratis, cv-mall-gratis-guide, personligt-brev-exempel-generella.
- `H1_BYTT`: /cv-mallar, /cv-exempel, /personligt-brev-exempel, /exempel, skriva-personligt-brev-guide, personligt-brev-mall-gratis.
- `LD_UNDANTAG`: ItemList på /cv-mallar och /personligt-brev-exempel, WebPage på /exempel, BlogPosting på de två PB-artiklarna (headline), BreadcrumbList på yrkessidorna, FAQPage på /cv-exempel och /personligt-brev-exempel (F1, F2, svaren ändras, frågorna inte).
- `RUBRIK_BYTT`: H2 i personligt-brev-exempel-generella.
- Inga `LANK_BORTA`. Alla befintliga hrefs finns kvar.

---

## K5. "Inför testet" på /verktyg/rekryteringstester

Fil: `src/app/(public)/verktyg/rekryteringstester/page.tsx`, nytt `<Rum>` direkt efter `id="vilket-test"` (avsnitt 5b). Title och description rörs inte.

**Villkor:** ingen av de tre artiklarna finns på main eller på `feat/matning-kampanj` i dag (de ligger på `feat/seo-tester-omgang2`). Varje kort och FAQ-länken renderas därför bara om artikeln finns i bygget: en server-hjälpare som läser `getPostBySlug(slug)` ur `src/lib/blog.ts` (eller `fs.existsSync('content/artiklar/<slug>.mdx')`) och filtrerar listan. Finns inget kort renderas inte blocket. Då kan komponenten byggas före 23 nov och korten tänds av sig själva när artiklarna når main, utan komponentändring under frysen. FAQ-frågan om myndigheterna visas också bara när myndighetssidan finns, så att schemat aldrig svarar med en sida som saknas.

**Texten**

- kick (`pub-kick`): `Tre guider`
- H2 (`pub-h2`): `Inför testet`
- ingress (`pub-ingress`): `Vet du vilket test som väntar, eller står det bara test i inbjudan? De här tre guiderna tar dig från inbjudan till resultatet.`
- Tre kort i `pub-raster pub-raster-3` (två på mobil blir en kolumn), samma kortform som "Vilket test ska du göra?". Rubriken är h3 (`pub-h4`), länken är `MattLank` med `handelse="article_cta_clicked"` och `egenskaper={{ cluster: 'test', position: 'inline', variant: 'hub-infor-<tips|resultat|myndigheter>', target: href }}`.

| Kort | h3 | Korttext | Länktext (ankartext) | href |
|---|---|---|---|---|
| 1 | Tips inför testet | `Vad forskningen säger om övning, en plan för veckan före och sju saker att tänka på på testdagen.` | `Tips inför testet` | `/artiklar/logiktest-tips` |
| 2 | Så läser du resultatet | `Stanine 4, C 6 eller 7 av 10? Vi går igenom stanineskalan steg för steg, hur den förhåller sig till percentil och C-skala och vad 4 på I-provet betyder.` | `Så läser du resultatet` | `/artiklar/stanine-testresultat` |
| 3 | Tester hos myndigheter | `Vad nio statliga myndigheter själva skriver om sina tester, från Skatteverket till Säkerhetspolisen, och hur du förbereder dig när du inte vet vilket test det är.` | `Tester hos myndigheter` | `/artiklar/tester-hos-myndigheter` |

Varje rad är kontrollerad mot sidan: tipssidan har H2 "Vad säger forskningen om övning?", "Veckan före: en plan dag för dag" och "Testdagen: sju saker att tänka på". Stanine-sidan har "Stanineskalan steg för steg", jämförelsen med percentil, C-skala och Sten, och "Vad betyder 4 på I-provet?". Myndighetssidan har nio myndigheter i tabellen (Skatteverket, Kronofogden, Försäkringskassan, Arbetsförmedlingen, Migrationsverket, Säkerhetspolisen, Tullverket, Kustbevakningen, Kriminalvården) och avsnittet "Så förbereder du dig när du inte vet testet". Kortet nämner ingen leverantör.

**FAQ-frågan**

Fil: `components/rekryteringstester-faq-data.ts`, ny post direkt efter "Kan jag öva på I-provet?". Schemat byggs ur samma lista i `page.tsx`, så frågan hamnar i FAQPage automatiskt.

- q: `Vilka tester använder myndigheterna?`
- a: `Det skiljer sig mellan myndigheterna, och ingen av dem skriver vilket test du får i en viss rekrytering. Skatteverket, Kronofogden, Försäkringskassan och Arbetsförmedlingen skriver att de ofta använder webbaserade tester av personliga egenskaper och problemlösningsförmåga i urvalet, oftast före intervjun. Säkerhetspolisen har begåvningstest, personlighetstester och en psykologbedömning. Tullaspiranter gör ett databaserat begåvningstest hos Plikt- och prövningsverket. Kriminalvården beskriver inget teststeg. Vilket test det blir står i inbjudan.`
- länk efter svaret: text `Tester hos myndigheter`, href `/artiklar/tester-hos-myndigheter`.

Varje påstående finns i myndighetssidans tabell och avsnitt, med myndigheternas egna sidor som källa (lästa 14 nov 2026). Inget om Polisen här: I-provet har redan sin fråga.

**Komponentändring som behövs:** `src/components/publikt/Faq.tsx` renderar bara text. Lägg till ett valfritt fält i `FaqFraga`: `lank?: { text: string; href: string }`, som ritas som `<a className="pub-lank">` efter svaret i samma `<details>`. Schemat läser bara `a`. Fältet används också i K6. Frågor utan `lank` ser ut som i dag.

**SEO-diffen:** `/verktyg/rekryteringstester` ligger i PUBLIKT_V2. Undantag i samma fil som K4: `RUBRIK_NY` för H2 "Inför testet" och de tre h3, `LD_UNDANTAG` för FAQPage (en fråga till). Ord stiger, inget försvinner.

---

## K6. Innehåll ovanför vecket på de tre galleriorna (1 till 3 dec)

Gemensamt: inget tas bort. Den befintliga ingressen flyttas ner, den tas inte bort. Situationsraden är länkar, inte ett klientfilter, så att den syns i HTML och inte skapar nya adresser. Inga nya sidor.

### /cv-mallar

Fil: `src/app/(public)/cv-mallar/components/CvMallarPageContent.tsx`.

**1. Snabbsvar** direkt under H1, på ingressens plats (`text-base sm:text-lg`), 58 ord. Namnen läses ur `FREE_TEMPLATE_IDS` via registret, talen ur konstanterna:

`En CV-mall är en färdig layout som du fyller med dina egna uppgifter. Vi har 41 mallar, och 3 av dem är gratis: Norrsken, Sidopanel och Student. Alla tre är märkta ATS-säkra, alltså byggda så att rekryteringssystemen läser texten i rätt ordning. Med ett gratiskonto fyller du i en av dem och laddar ner ditt CV som PDF.`

Kontrollera före push i `api/cv/generate-formatted` att en gratismall faktiskt går att ladda ner en gång med gratiskonto. Gör den inte det, stryk sista meningen och skriv `Fyll i direkt och ladda ner som PDF.`

**2. Den gamla ingressen** flyttas till stycket under H2 "Alla våra CV-mallar" (före "Filtrera efter typ ..."), med rättning: `Välj rätt design för din ansökan. {ATS_ANTAL} av mallarna är märkta ATS-säkra och anpassade för svenska arbetsgivare. Yrkesmallarna hjälper dig välja det som passar din bransch.` (`ATS_ANTAL` räknas ur registret.)

**3. Situationsraden** under sökfältet, `<nav aria-label="Välj efter situation">`, rubrik i liten versal: `Börja från din situation`.

| Knapp | Leder till | Varför |
|---|---|---|
| Student | `/cv-mallar/student` | Yrkesmallen för student (Student och Student Plus) |
| Utan erfarenhet | `/artiklar/cv-utan-erfarenhet` | Guiden med exempeltexter; ingen mall är märkt för just detta |
| Karriärbyte | `/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte` | H2 "CV vid karriärbyte" får id `cv-vid-karriarbyte` av artikelsidans h2-funktion |
| Chef | `/cv-mallar/chef` | Yrkesmallen för chef |

**4. Guiden** (fyra block, cirka 400 ord) räcker i längd. Den ska tvättas, utan att ord försvinner: talstrecken i "ATS-säkerhet" och "Branschmatchning" blir komma eller punkt; "mall-DNA" blir "olika upplägg"; "C-suite" blir "ledningsgrupp"; "cramad" blir "trång"; "12.5px body istället för 13.5px" blir "en mindre brödtext". Rubrikerna står kvar.

**5. FAQ.** Svaren på befintliga frågor tvättas på samma sätt (talstreck och pilar i "Vilken CV-mall är bäst ...", "Vad är skillnaden ...", "Hur väljer jag rätt ...", "Kan jag använda samma mall ..."; "cyan accent som signalerar utbildning snarare än corporate" och "Funkar perfekt" i studentfrågan blir `Student-mallen lyfter utbildning först och ger plats för projekt och praktik. Den passar sommarjobb och första jobbet.`). Frågorna står kvar. Tre nya frågor efter "Hur väljer jag rätt CV-mall för mitt yrke?":

- q: `Vilken CV-mall passar en chef?`
  a: `Det beror på nivån. Atlas är gjord för vd, ledningsgrupp och styrelseuppdrag. Tidlös Plus passar seniora chefer i traditionella branscher, Norrsken Plus chefer på mellannivå och Myndighet Plus enhetschefer i offentlig sektor. Har du många uppdrag att redovisa rymmer Konsulten mer på samma yta. Alla fem ingår i Premium.`
  (Underlag: `suitableFor` och `tier` i `simple-templates.ts`.)
- q: `Vilken CV-mall passar vid karriärbyte?`
  a: `En mall i en kolumn med plats för en profiltext högst upp, till exempel gratismallen Norrsken. Profilen förklarar bytet innan rekryteraren läser din erfarenhet, och de kompetenser du tar med dig till det nya yrket hamnar högt. Undvik mallar där tidigare titlar tar mest plats.`
- q: `Kan jag byta CV-mall efter att jag fyllt i mitt CV?`
  a: `Ja. Du fyller i dina uppgifter en gång och kan sedan byta mall och typsnitt utan att något av innehållet försvinner. Då är det lätt att pröva en traditionell och en modern mall mot varandra innan du laddar ner.`
  (Underlag: texten på /verktyg/cv-mallar, "Du kan byta mall efter att du fyllt i ditt CV utan att förlora något av innehållet".)

**6. Korsbandet:** "74" blir `{CV_GALLERI.length}` (F4); talstrecket i "perfekta att inspireras av" finns inte, men "istället" blir "i stället".

### /cv-exempel och /personligt-brev-exempel

Fil: `src/app/(public)/exempel/components/GalleriPageContent.tsx` (delad), `MallarGuideSection.tsx`, `galleri-faq.ts`.

**1. Snabbsvar** direkt under H1 som `pub-ingress`. Den nuvarande ingressen flyttas till ett stycke under H2 "{n} yrken" (före korten), oförändrad i ord.

CV, 55 ord:
`Ett CV-exempel är ett färdigt CV för ett visst yrke, skrivet som en riktig ansökan. Vi har 89, från undersköterska till systemutvecklare. Välj ditt yrke eller det som ligger närmast, se hur profilen, erfarenheten och kompetenserna är formulerade och skriv sedan ditt eget med samma upplägg. Att läsa exemplen är gratis och kräver inget konto.`

Brev, 51 ord:
`Ett exempel på personligt brev är ett färdigt brev för ett visst yrke. Vi har 89, skrivna för svenska rekryterare. Varje brev har en inledning, ett mittparti och en avslutning, och vi förklarar varför styckena fungerar. Låna upplägget, byt ut innehållet mot dina egna erfarenheter och håll brevet till en A4-sida.`

(89 ur `yrken.length`. "Vi förklarar varför styckena fungerar" motsvarar avsnittet "Det här gör brevet starkt" på varje brevsida.)

**2. Situationsraden** mellan sökfältet och branschfiltret, samma form som `ib-filter` men egen `<nav aria-label="Välj efter situation">` med rubriken `Din situation`. Branschfiltret står kvar under.

| Knapp | /cv-exempel | /personligt-brev-exempel |
|---|---|---|
| Student | `/cv-exempel/kategori/student` (student, gymnasieelev, sommarjobb) | `/personligt-brev-exempel/kategori/student` |
| Utan erfarenhet | `/artiklar/cv-utan-erfarenhet` | `/artiklar/personligt-brev-utan-erfarenhet` |
| Karriärbyte | `/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte` | `/artiklar/personligt-brev-exempel-situationer#personligt-brev-vid-karriarbyte` |
| Chef | `/cv-exempel/chef` | `/personligt-brev-exempel/chef` |

Mobil: raden bryts på två rader, ingen sidledsrullning.

**3. Guiden.** `MallarGuideSection` har cirka 500 ord och räcker i längd. Men den är skriven för mallorden: kick "Guide till CV-mallar" och H2 "Allt du behöver veta om CV-mallar" på /cv-exempel, och samma för brevmallar på /personligt-brev-exempel. Det är en del av kannibaliseringen. Ändringar (RUBRIK_BYTT-undantag med skäl):
- kick: `Guide till exemplen`
- H2 CV: `Så använder du ett CV-exempel som mall`. H2 brev: `Så använder du ett exempel på personligt brev som mall`.
- H3:orna står kvar.
- Sist i första artikeln (efter "... en konkret förlaga att utgå från."), en ny mening. CV: `Vill du ha en tom design att fylla i finns alla våra <Link href="/cv-mallar">CV-mallar</Link> på en egen sida.` Brev: `Letar du efter en tom mall har vi gått igenom vilka som fungerar i <Link href="/artiklar/personligt-brev-mall-gratis">Personligt brev mall gratis</Link>.`
- Slutknappen "Bläddra alla {nounMallar}" blir CV: `Bläddra alla CV-exempel`, brev: `Bläddra alla personligt brev-exempel`.
- Inget nytt avsnitt: situationerna får sitt innehåll i FAQ:n nedan, så att guiden håller sig under 600 ord.

**4. FAQ.** F1 och F2 rättas. Tre nya frågor per sida, sist i listan, med `lank` från K5.

/cv-exempel:
- q: `Finns det CV-exempel för den som saknar arbetslivserfarenhet?`
  a: `Ja. Exemplen för gymnasieelev, student och sommarjobb visar hur ett CV ser ut när arbetslivserfarenheten är kort. Gymnasieelevens CV fylls till exempel med prao och föreningsuppdrag. Alla tre finns under kategorin Student.`
  lank: `CV utan erfarenhet`, `/artiklar/cv-utan-erfarenhet`
- q: `Finns det CV-exempel för chefer?`
  a: `Ja, för flera nivåer: chef, enhetschef, butikschef, lagerchef, produktchef och teamledare. Välj det som ligger närmast din roll och din bransch, och läs hur ansvaret för personal och resultat är beskrivet.`
  lank: `CV-exempel för chef`, `/cv-exempel/chef`
- q: `Hur skriver jag CV vid ett karriärbyte?`
  a: `Börja med en profiltext som förklarar bytet och vad du tar med dig. Lyft de kompetenser som gäller i det nya yrket före titlarna från det gamla, och välj ett exempel från yrket du söker dig till, inte det du lämnar.`
  lank: `CV vid karriärbyte`, `/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte`

/personligt-brev-exempel:
- q: `Hur skriver jag ett personligt brev utan erfarenhet?`
  a: `Skriv om det du faktiskt har gjort, som skolprojekt, föreningsuppdrag, extrajobb eller praktik, och koppla varje exempel till ett krav i annonsen. Exemplen för student, gymnasieelev och sommarjobb visar hur det kan se ut.`
  lank: `Personligt brev utan erfarenhet`, `/artiklar/personligt-brev-utan-erfarenhet`
- q: `Vad skriver jag i ett personligt brev vid karriärbyte?`
  a: `Förklara bytet tidigt, i en eller två meningar, och lägg resten av brevet på det du tar med dig. Utgå från ett exempel i yrket du söker dig till och använd dess ord för din egen erfarenhet.`
  lank: `Personligt brev vid karriärbyte`, `/artiklar/personligt-brev-exempel-situationer#personligt-brev-vid-karriarbyte`
- q: `Finns det exempel på personligt brev för chefstjänster?`
  a: `Ja, för chef, enhetschef, butikschef, lagerchef, produktchef och teamledare. Välj det som ligger närmast din roll och läs hur brevet kopplar ledarerfarenheten till annonsens krav.`
  lank: `Personligt brev för chef`, `/personligt-brev-exempel/chef`

### SEO-diffen för K6

Samma `--sidor`-lista som K4 plus `/cv-exempel/kategori/student` och `/personligt-brev-exempel/kategori/student`. Fore-avtrycket tas efter att K4 är live. Undantag i en ny fil `scripts/seo-baslinje/huvudord-k6-2026-12-undantag.json`: `RUBRIK_BYTT` för de två H2 i guiden, `LD_UNDANTAG` FAQPage på alla tre (nya frågor, tvättade svar). Ordantalet stiger på alla tre; kontrollera att det inte sjunker på /cv-mallar efter tvätten av guiden.

---

## Kontroller före push (K4, K5 och K6)

1. Tecken: `(seoTitle || title).length <= 60` och description 110 till 158 på de ändrade artiklarna; title och description på galleriorna räknade med konstanternas nuvarande värden.
2. Inga talstreck (—, –), inga mittpunkter (·) och inga kampanjord (Black Week, Cyber Monday, 99 kr, 49 kr, rabatt) i title, description, H1, snabbsvar, FAQ eller schema. `rg "—|–|·" <ändrade filer>` ska ge noll i synlig text.
3. `faq.length === antal <FAQItem` i varje ändrad MDX (ingen FAQ ändras i artiklarna, men kontrollen körs).
4. Ankarna `#cv-vid-karriarbyte` och `#personligt-brev-vid-karriarbyte` landar på rubriken (klicka i webbläsaren).
5. K5-blocket: bygg utan de tre artiklarna och kontrollera att blocket och FAQ-frågan inte syns; bygg med dem och kontrollera att alla tre kort och frågan syns.
6. Skärmdump på Pixel 7 och desktop av hjälten på /cv-mallar, /cv-exempel och /personligt-brev-exempel: snabbsvaret och situationsraden ska synas utan att rulla på desktop och i första skärmen på mobil efter H1.
7. SEO-diffen grön med undantagen ovan.

## Avläsning

- 7 dec: backningsregeln för skriva-personligt-brev-guide (avsnitt K4 a, punkt 4). Kontroll att de nya titlarna syns i Search Console.
- 19 jan (planens fönster): de sju frågorna i huvudordsplanen avsnitt 1. Mål: en sida per huvudord, och de ska vara målsidorna i avsnitt 2. Position under 20 på minst två av "cv mall", "personligt brev" och "cv exempel". /verktyg/cv-mallar och /exempel ska inte längre synas på huvudorden.
