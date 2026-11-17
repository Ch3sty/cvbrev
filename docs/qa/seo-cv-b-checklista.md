# Spår B, checklista (SEO för CV-klustret, 2026-11-17)

Gren `feat/seo-cv-b`. Sammanställd ur, i prioordning: saas-leads beslut (`docs/plan-seo-cv-kluster-2026-11-17-saas-lead.md`, P1 till P6 och nio ersättningar), säljs svar (`docs/plan-seo-cv-kluster-2026-11-17-salj.md`, S1 till S6 och copyersättningar) och SEO-strategens spec (`docs/plan-seo-cv-kluster-2026-11-17.md`, avsnitt 2 och grindkraven i 4). Där de krockar gäller saas-lead för produkt, sälj för knappar och pris, och SEO-strategens titlar, längder och sökord står alltid.

Bockas av i slutet med utfall och eventuella avvikelser.

## Gemensamma regler

- [x] Tal ur konstanterna (`template-antal.ts`, `katalog.ts`, `quotaService.ts`), aldrig handskrivna i kod
- [x] Inga tankstreck (U+2014, U+2013) i ändrade filer, ingen Sparkles
- [x] Svenska facktermer, vi-form, ingen text som antyder yrkesmallar ("en mall för ${yrke}")
- [x] Inget nytt om datalagring, GDPR, policy eller villkor utöver lagringsundantaget på /verktyg/skapa-cv
- [x] Pris bara via `paketMedPris(SALD_PLAN)` och `MedKampanjPris` (S6)
- [x] `data-cta-klick` på alla nya länkar och knappar (B10)
- [x] Huvudrepots ocommittade `/strumpan`-rad i next.config.ts rörs inte (vi jobbar i worktreen)
- [x] Inga content/artiklar/*.mdx ändras (spår A)

## B1 /verktyg/skapa-cv

- [x] layout.tsx: title "Skapa CV gratis: skriv direkt på arket, PDF eller Word" (54), description (153), OG/Twitter-titel "Skapa CV gratis: skriv direkt på arket i en färdig mall", OG/Twitter-description = description, keywords + "cv byggare", "skriv cv online", "cv online gratis"; canonical oförändrad
- [x] eyebrow "Skapa CV, direkt på arket"; h1 oförändrad
- [x] ingress enligt spec med `WORD_TEMPLATE_COUNT_ORD`
- [x] tre löften: På arket / `FREE_CV_BYGG_AI_PER_ACCOUNT` förslag / `TEMPLATE_COUNT` mallar, `FREE_TEMPLATE_COUNT` gratis; "10 min" och "7 steg" bort
- [x] FUNKTIONER: "Arket är byggaren" ersätter förhandsvisningen; "Jobbcoachen skriver punkterna" med säljs sista mening ("Tre förslag ingår gratis på ditt konto. I Premium får du 30 per dygn.", talen ur konstanterna); "Rubriker som följer yrket"; "Utkastet väntar på dig" omskriven enligt lagringsundantaget (sparas i kontot när första avsnittet sparats, sedan efter varje avsnitt, fortsätt från Mina CV på vilken enhet som helst); "Börja från ett CV du redan har" och "Fungerar lika bra i mobilen" kvar
- [x] kontrollblockets rubrik "Det här gör CV-byggandet enkelt"
- [x] HowTo och stegblocket: fyra nya steg, ingen totalTime
- [x] resultatblocket: rubrik "Gör skillnad i varje ansökan", raden "Ladda upp ditt gamla CV och börja där det slutade"
- [x] slutrutan: säljs text (Word i alla Word-mallar, hela CV-analysen, nedladdning utan tak)
- [x] FAQ: tre svar omskrivna (professionellt CV, hur lång tid, hur sparas); frågorna ordagrant
- [x] P6: SkapaCvLiveDemo bort; handling = stillbild Linne (stora bilden), raden `ARTIKEL.mallrad`, länk /cv-mallar/prova?mall=linne
- [x] P6: SkarmSkapaCv kick "Skapa CV", rubrik "Erfarenhet", sub "Mall: Linne. Tryck på ett avsnitt för att fylla i.", knapp "Spara"; inget "steg 3 av 7"
- [x] S1: sekundär knapp "Ladda upp ditt CV" till /cv-mallar#ladda-upp
- [x] S4: "tre förslag" alltid med "per konto"/"på ditt konto" i samma mening
- [x] WebApplication-schemat utan "sju steg" (produktfacit: inga sju steg någonstans)
- [x] S6: slutrutans eyebrow står med ordinarie pris (VerktygsMall tar string där)

## B2 Omdirigeringar

- [x] tio permanenta rader direkt efter /verktyg/cv-mallar, med kommentar
- [x] 'cv-mall-gratis-guide' och 'cv-mall-word-gratis' ur prefixlistan (ingen kedja)
- [x] src/proxy.ts skriver inte om adresserna
- [x] curl mot dev/prod: 308, rätt Location, ett hopp

## B3 Piloten (fem yrkespar)

- [x] `PILOT_SAMMANSLAGNA` och `YRKESMALL_PUBLIKA` i yrkesmall-data.ts; YRKESMALL_LIST och YRKE_TILL_MALLAR orörda
- [x] PUBLIKA används i generateStaticParams, sitemap, ItemList på /cv-mallar, relaterade, ExempelPopulara
- [x] ExempelMall CV-läge för piloten: mallblock med H2 "CV-mall för ${yrkeLitet}: välj och fyll i", ingress (säljs lydelse med "som PDF eller Word"), tre olika miniatyrer minst en gratis (P1-regeln), länk till /cv-mallar/prova?mall=<id>&yrke=<slug>, nivårad `ARTIKEL.mallrad`
- [x] S3: knapp "Fyll i gratis" på Linne/Björk, "Prova med ditt CV" på Premium
- [x] H3 "Vad rekryterare letar efter hos ${yrkeLitet}" (utan dubbletter mot tipsen)
- [x] H3 "Det här ska synas i CV:t för ${yrkeLitet}" med viktigtAttTankaPa och arbetsuppgifter där de finns (saljare, larare, barnskotare); varforVarMallPassar flyttas inte
- [x] H3 "Så läser rekryteringssystemen ditt CV" med atsInfo
- [x] S5: ordning mallar, "Se alla ${TEMPLATE_COUNT} CV-mallar", sist "Har du redan ett CV? Ladda upp det och se det i mallarna" till /cv-mallar#ladda-upp
- [x] FAQ: yrkesmallens faqItems efter exempelsidans, utan dubbletter; FAQPage-schemat = synliga frågor
- [x] metadata: title `CV för ${yrkeLitet}: exempel och mall att fylla i` (under 60), description 110 till 158
- [x] /cv-mallar/<pilot> 308 till /cv-exempel/<pilot>

## B4 /cv-mallar

- [x] GuideBlock "Var hittar man en gratis CV-mall?" (250 till 350 ord), inga konkurrentnamn utom Microsoft, Google, Apple
- [x] GuideBlock "PDF eller Word?" (150 till 250 ord), länk till /cv-mallar/word
- [x] block "Mallar efter stil" med tre kort (tal ur katalogen)
- [x] guidelänkar i "Vad gör en bra CV-mall ...": hur-ska-ett-cv-se-ut, ats-vanligt-cv, cv-bild-guide, cv-pa-engelska-resume
- [x] högst tre nya FAQ, befintliga ordagrant
- [x] description ny (testet mäter längden); title oförändrad
- [x] MallarHubGuideSection: länken till cv-mall-gratis-guide blir /cv-mallar
- [x] B9: listan "CV-mallar för ditt yrke" = PUBLIKA plus de fem piloterna med länk till /cv-exempel/<slug>

## B5 Stilsidorna /cv-mallar/word, /foto, /enkla

- [x] statiska rutter före [yrke]; ingen yrkesslug heter word, foto eller enkla
- [x] PubliktSida, Hjalte, Rum, pub-klasser, Miniatyr-kortet; ingen ny designkomponent
- [x] P3: Uppladdning och ProvaArbetsyta i ProvaProvider (katalogen filtrerad till sidans mallar)
- [x] P5: RedirectLoggedIn till /dashboard/cv-mallar, från /foto till /dashboard/cv-mallar?mall=bjork
- [x] opengraph-image.tsx per sida
- [x] egen H1, title, description enligt spec (tal ur konstanterna, längder testade)
- [x] minst 450 ord unik brödtext, minst 4 egna FAQ (inte på /cv-mallar eller annan stilsida)
- [x] galleri med bara mallar som har egenskapen
- [x] länk upp till /cv-mallar och till de två andra stilsidorna, minst två artikellänkar
- [x] schema: BreadcrumbList, ItemList (url till /cv-mallar/prova?mall=), FAQPage; canonical självt, index, follow
- [x] S2: Premium-raden under galleriet i `MedKampanjPris`, säljs lydelse per sida
- [x] S3: knapptext på korten
- [x] /word: säljs "samma mall, samma rubriker och samma ordning", FAQ-svaren enligt sälj och P4 (sidospaltsundantaget nämns i FAQ-svaret, inte i ett eget avsnitt); "Kan jag öppna Word-filen i Google Docs eller Pages?" bara om testat
- [x] /foto: tal med Word ur katalogen (10), fotoplatsen tom: initial i förhandsvisningen, borta i filen; foto läggs till i kontot; ATS bara det test:ats bekräftar
- [x] /enkla: familj en-spalt ur katalogen
- [x] H1 och title börjar inte med "gratis"

## B6 Titlar på yrkessidorna

- [x] /cv-mallar/[yrke]: titelregeln med fallbacks, description med fallback, OG/Twitter följer
- [x] Product-schemat: name "CV-mallen <gratismall>", inget annat ändrat
- [x] /cv-exempel/[yrke]: titel genereras, inget "mall" i titeln; description utan "mall"-sats, 110 till 158
- [x] korslänksblocket: text och länktext enligt spec
- [x] yrkesmallsidans länk "Se ett färdigt CV-exempel för ${namnBestamd}"

## B7 /exempel

- [x] title "Exempel för din jobbansökan: CV och personligt brev per yrke" (60), description enligt spec (testad)

## B8 Sitemap

- [x] /cv-mallar/word, /foto, /enkla (priority /cv-mallar minus 0,1, weekly)
- [x] yrkesmallar ur PUBLIKA (69); YRKESMALL_LIST.length i commit-meddelandet
- [x] de tre borttagna artiklarna försvinner när spår A tar bort MDX (kontrolleras på integrationsgrenen)
- [x] /cv-mallar/prova inte i sitemap

## B10 Mätning

- [x] data-cta-klick på nya länkar/knappar
- [x] QA-konton markeras internt (skrivs i QA-filen hur)

## Undantag i förväg

- [x] scripts/seo-baslinje/seo-cv-kluster-2026-11-17-undantag.json med STATUS_BYTT, META_BYTT, FAQ_BYTT, RUBRIK_BYTT, LANK_BYTT/LANK_BORTA, LD_UNDANTAG enligt 4.1

## Tester

- [x] tsc, berörda vitest, nya tester (titelregler och längder, 301-listan, stilsidornas krav)
- [x] next build
- [x] SEO-diff Fel 0 utom förlistade undantag
- [x] stilsidornas krav mätta (ord, FAQ, länkar in och ut, dubblettitlar)
- [x] klicktest i riktig Chrome, Pixel 7 och dator
- [x] perf för /cv-mallar och de nya sidorna, CLS 0

## Utfall och avvikelser (2026-11-17)

Allt ovan är gjort och testat på feat/seo-cv-b, se docs/qa/qa-seo-cv-b-2026-11-17.md. Avvikelser med skäl:

- RUBRIK_BYTT på /verktyg/skapa-cv omfattar också stegens och funktionens h3 (sex poster utöver kontroll- och resultatblocket): de följer direkt av B1:s nya steg och funktioner.
- WebApplication-schemat på /verktyg/skapa-cv i LD_UNDANTAG: det sa "sju steg", vilket produktfacit förbjuder.
- FAQ-svaret "Är det gratis att skapa CV online hos er?" (säljs fynd, "som PDF en gång") är orört: säljansvarig ville vänta på SEO-strategens besked om fyra svar.
- /word: FAQ "Kan jag öppna Word-filen i Google Docs eller Pages?" struken (inte testad); P4-lydelsen (saas-lead) används i "Ser Word-filen likadan ut som PDF:en?" i stället för säljs, enligt prioordningen.
- FAQ-svar på stilsidorna är vanlig text (Faq tar sträng), så priset i "Är CV-mallarna i Word gratis?" sveps inte av MedKampanjPris; Premium-raden under galleriet gör det.
- Slutrutans eyebrow på /verktyg/skapa-cv står med ordinarie pris (VerktygsMall tar text där, S6).
- ItemList på /cv-mallar visar de 69 publika (B3); de fem piloterna finns kvar i den synliga yrkeslistan med länk till /cv-exempel (B9).
- /exempel: WebPage-schemat rördes inte (inget LD-undantag för sidan i specen).
- De 56 exempelbeskrivningar utan ordet mall är orörda även där de ligger utanför 110 till 158 (specen: oförändrad om den inte innehåller mall).
- Sammanslagningen av feat/seo-cv-a nekades av behörighetskontrollen; `git merge-tree` visar inga konflikter.
