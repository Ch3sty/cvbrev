# Spår B, checklista (SEO för CV-klustret, 2026-11-17)

Gren `feat/seo-cv-b`. Sammanställd ur, i prioordning: saas-leads beslut (`docs/plan-seo-cv-kluster-2026-11-17-saas-lead.md`, P1 till P6 och nio ersättningar), säljs svar (`docs/plan-seo-cv-kluster-2026-11-17-salj.md`, S1 till S6 och copyersättningar) och SEO-strategens spec (`docs/plan-seo-cv-kluster-2026-11-17.md`, avsnitt 2 och grindkraven i 4). Där de krockar gäller saas-lead för produkt, sälj för knappar och pris, och SEO-strategens titlar, längder och sökord står alltid.

Bockas av i slutet med utfall och eventuella avvikelser.

## Gemensamma regler

- [ ] Tal ur konstanterna (`template-antal.ts`, `katalog.ts`, `quotaService.ts`), aldrig handskrivna i kod
- [ ] Inga tankstreck (U+2014, U+2013) i ändrade filer, ingen Sparkles
- [ ] Svenska facktermer, vi-form, ingen text som antyder yrkesmallar ("en mall för ${yrke}")
- [ ] Inget nytt om datalagring, GDPR, policy eller villkor utöver lagringsundantaget på /verktyg/skapa-cv
- [ ] Pris bara via `paketMedPris(SALD_PLAN)` och `MedKampanjPris` (S6)
- [ ] `data-cta-klick` på alla nya länkar och knappar (B10)
- [ ] Huvudrepots ocommittade `/strumpan`-rad i next.config.ts rörs inte (vi jobbar i worktreen)
- [ ] Inga content/artiklar/*.mdx ändras (spår A)

## B1 /verktyg/skapa-cv

- [ ] layout.tsx: title "Skapa CV gratis: skriv direkt på arket, PDF eller Word" (54), description (153), OG/Twitter-titel "Skapa CV gratis: skriv direkt på arket i en färdig mall", OG/Twitter-description = description, keywords + "cv byggare", "skriv cv online", "cv online gratis"; canonical oförändrad
- [ ] eyebrow "Skapa CV, direkt på arket"; h1 oförändrad
- [ ] ingress enligt spec med `WORD_TEMPLATE_COUNT_ORD`
- [ ] tre löften: På arket / `FREE_CV_BYGG_AI_PER_ACCOUNT` förslag / `TEMPLATE_COUNT` mallar, `FREE_TEMPLATE_COUNT` gratis; "10 min" och "7 steg" bort
- [ ] FUNKTIONER: "Arket är byggaren" ersätter förhandsvisningen; "Jobbcoachen skriver punkterna" med säljs sista mening ("Tre förslag ingår gratis på ditt konto. I Premium får du 30 per dygn.", talen ur konstanterna); "Rubriker som följer yrket"; "Utkastet väntar på dig" omskriven enligt lagringsundantaget (sparas i kontot när första avsnittet sparats, sedan efter varje avsnitt, fortsätt från Mina CV på vilken enhet som helst); "Börja från ett CV du redan har" och "Fungerar lika bra i mobilen" kvar
- [ ] kontrollblockets rubrik "Det här gör CV-byggandet enkelt"
- [ ] HowTo och stegblocket: fyra nya steg, ingen totalTime
- [ ] resultatblocket: rubrik "Gör skillnad i varje ansökan", raden "Ladda upp ditt gamla CV och börja där det slutade"
- [ ] slutrutan: säljs text (Word i alla Word-mallar, hela CV-analysen, nedladdning utan tak)
- [ ] FAQ: tre svar omskrivna (professionellt CV, hur lång tid, hur sparas); frågorna ordagrant
- [ ] P6: SkapaCvLiveDemo bort; handling = stillbild Linne (stora bilden), raden `ARTIKEL.mallrad`, länk /cv-mallar/prova?mall=linne
- [ ] P6: SkarmSkapaCv kick "Skapa CV", rubrik "Erfarenhet", sub "Mall: Linne. Tryck på ett avsnitt för att fylla i.", knapp "Spara"; inget "steg 3 av 7"
- [ ] S1: sekundär knapp "Ladda upp ditt CV" till /cv-mallar#ladda-upp
- [ ] S4: "tre förslag" alltid med "per konto"/"på ditt konto" i samma mening
- [ ] WebApplication-schemat utan "sju steg" (produktfacit: inga sju steg någonstans)
- [ ] S6: slutrutans eyebrow står med ordinarie pris (VerktygsMall tar string där)

## B2 Omdirigeringar

- [ ] tio permanenta rader direkt efter /verktyg/cv-mallar, med kommentar
- [ ] 'cv-mall-gratis-guide' och 'cv-mall-word-gratis' ur prefixlistan (ingen kedja)
- [ ] src/proxy.ts skriver inte om adresserna
- [ ] curl mot dev/prod: 308, rätt Location, ett hopp

## B3 Piloten (fem yrkespar)

- [ ] `PILOT_SAMMANSLAGNA` och `YRKESMALL_PUBLIKA` i yrkesmall-data.ts; YRKESMALL_LIST och YRKE_TILL_MALLAR orörda
- [ ] PUBLIKA används i generateStaticParams, sitemap, ItemList på /cv-mallar, relaterade, ExempelPopulara
- [ ] ExempelMall CV-läge för piloten: mallblock med H2 "CV-mall för ${yrkeLitet}: välj och fyll i", ingress (säljs lydelse med "som PDF eller Word"), tre olika miniatyrer minst en gratis (P1-regeln), länk till /cv-mallar/prova?mall=<id>&yrke=<slug>, nivårad `ARTIKEL.mallrad`
- [ ] S3: knapp "Fyll i gratis" på Linne/Björk, "Prova med ditt CV" på Premium
- [ ] H3 "Vad rekryterare letar efter hos ${yrkeLitet}" (utan dubbletter mot tipsen)
- [ ] H3 "Det här ska synas i CV:t för ${yrkeLitet}" med viktigtAttTankaPa och arbetsuppgifter där de finns (saljare, larare, barnskotare); varforVarMallPassar flyttas inte
- [ ] H3 "Så läser rekryteringssystemen ditt CV" med atsInfo
- [ ] S5: ordning mallar, "Se alla ${TEMPLATE_COUNT} CV-mallar", sist "Har du redan ett CV? Ladda upp det och se det i mallarna" till /cv-mallar#ladda-upp
- [ ] FAQ: yrkesmallens faqItems efter exempelsidans, utan dubbletter; FAQPage-schemat = synliga frågor
- [ ] metadata: title `CV för ${yrkeLitet}: exempel och mall att fylla i` (under 60), description 110 till 158
- [ ] /cv-mallar/<pilot> 308 till /cv-exempel/<pilot>

## B4 /cv-mallar

- [ ] GuideBlock "Var hittar man en gratis CV-mall?" (250 till 350 ord), inga konkurrentnamn utom Microsoft, Google, Apple
- [ ] GuideBlock "PDF eller Word?" (150 till 250 ord), länk till /cv-mallar/word
- [ ] block "Mallar efter stil" med tre kort (tal ur katalogen)
- [ ] guidelänkar i "Vad gör en bra CV-mall ...": hur-ska-ett-cv-se-ut, ats-vanligt-cv, cv-bild-guide, cv-pa-engelska-resume
- [ ] högst tre nya FAQ, befintliga ordagrant
- [ ] description ny (testet mäter längden); title oförändrad
- [ ] MallarHubGuideSection: länken till cv-mall-gratis-guide blir /cv-mallar
- [ ] B9: listan "CV-mallar för ditt yrke" = PUBLIKA plus de fem piloterna med länk till /cv-exempel/<slug>

## B5 Stilsidorna /cv-mallar/word, /foto, /enkla

- [ ] statiska rutter före [yrke]; ingen yrkesslug heter word, foto eller enkla
- [ ] PubliktSida, Hjalte, Rum, pub-klasser, Miniatyr-kortet; ingen ny designkomponent
- [ ] P3: Uppladdning och ProvaArbetsyta i ProvaProvider (katalogen filtrerad till sidans mallar)
- [ ] P5: RedirectLoggedIn till /dashboard/cv-mallar, från /foto till /dashboard/cv-mallar?mall=bjork
- [ ] opengraph-image.tsx per sida
- [ ] egen H1, title, description enligt spec (tal ur konstanterna, längder testade)
- [ ] minst 450 ord unik brödtext, minst 4 egna FAQ (inte på /cv-mallar eller annan stilsida)
- [ ] galleri med bara mallar som har egenskapen
- [ ] länk upp till /cv-mallar och till de två andra stilsidorna, minst två artikellänkar
- [ ] schema: BreadcrumbList, ItemList (url till /cv-mallar/prova?mall=), FAQPage; canonical självt, index, follow
- [ ] S2: Premium-raden under galleriet i `MedKampanjPris`, säljs lydelse per sida
- [ ] S3: knapptext på korten
- [ ] /word: säljs "samma mall, samma rubriker och samma ordning", FAQ-svaren enligt sälj och P4 (sidospaltsundantaget nämns i FAQ-svaret, inte i ett eget avsnitt); "Kan jag öppna Word-filen i Google Docs eller Pages?" bara om testat
- [ ] /foto: tal med Word ur katalogen (10), fotoplatsen tom: initial i förhandsvisningen, borta i filen; foto läggs till i kontot; ATS bara det test:ats bekräftar
- [ ] /enkla: familj en-spalt ur katalogen
- [ ] H1 och title börjar inte med "gratis"

## B6 Titlar på yrkessidorna

- [ ] /cv-mallar/[yrke]: titelregeln med fallbacks, description med fallback, OG/Twitter följer
- [ ] Product-schemat: name "CV-mallen <gratismall>", inget annat ändrat
- [ ] /cv-exempel/[yrke]: titel genereras, inget "mall" i titeln; description utan "mall"-sats, 110 till 158
- [ ] korslänksblocket: text och länktext enligt spec
- [ ] yrkesmallsidans länk "Se ett färdigt CV-exempel för ${namnBestamd}"

## B7 /exempel

- [ ] title "Exempel för din jobbansökan: CV och personligt brev per yrke" (60), description enligt spec (testad)

## B8 Sitemap

- [ ] /cv-mallar/word, /foto, /enkla (priority /cv-mallar minus 0,1, weekly)
- [ ] yrkesmallar ur PUBLIKA (69); YRKESMALL_LIST.length i commit-meddelandet
- [ ] de tre borttagna artiklarna försvinner när spår A tar bort MDX (kontrolleras på integrationsgrenen)
- [ ] /cv-mallar/prova inte i sitemap

## B10 Mätning

- [ ] data-cta-klick på nya länkar/knappar
- [ ] QA-konton markeras internt (skrivs i QA-filen hur)

## Undantag i förväg

- [ ] scripts/seo-baslinje/seo-cv-kluster-2026-11-17-undantag.json med STATUS_BYTT, META_BYTT, FAQ_BYTT, RUBRIK_BYTT, LANK_BYTT/LANK_BORTA, LD_UNDANTAG enligt 4.1

## Tester

- [ ] tsc, berörda vitest, nya tester (titelregler och längder, 301-listan, stilsidornas krav)
- [ ] next build
- [ ] SEO-diff Fel 0 utom förlistade undantag
- [ ] stilsidornas krav mätta (ord, FAQ, länkar in och ut, dubblettitlar)
- [ ] klicktest i riktig Chrome, Pixel 7 och dator
- [ ] perf för /cv-mallar och de nya sidorna, CLS 0
