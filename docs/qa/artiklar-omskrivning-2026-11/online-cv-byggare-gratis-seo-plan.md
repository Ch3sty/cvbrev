# SEO-plan: online-cv-byggare-gratis (omskrivning från grunden)

Datum: 2026-11-15. Underlag av SEO-strategen för copywritern. Slug behålls: `/artiklar/online-cv-byggare-gratis`.
Bakgrund: docs/qa/faktagranskning-2026-11/online-cv-byggare-gratis.md (gamla texten lovade gratis hela vägen, analys mot annons och LinkedIn-import).

---

## 0. Det viktigaste först

1. **Sidan är okänd för Google.** URL-inspektionen i Search Console (2026-11-15) svarar `coverageState: "URL is unknown to Google"`. Sidan har 0 visningar på 16 månader, fast den finns i sitemap.xml, svarar 200, har `index, follow` och rätt canonical. Tre artiklar länkar redan in (cv-mall-gratis-guide rad 198, cv-pa-engelska-resume rad 535, skriva-cv-guide rad 150), ändå har Google inte upptäckt den, troligen för att länkarna sitter på sidor som själva ligger lågt (pos 65 och 88) och sajten har ca 490 URL:er i sitemap. En omskrivning räcker inte: **ägaren behöver begära indexering i Search Console efter publicering**, och vi lägger till 2 till 3 kontextuella länkar från CV-artiklar som rankar bättre (förslag i avsnitt 6).
2. **Transaktionsfrågorna ägs av verktygssidan.** "cv byggare", "cv-byggare", "skapa cv online", "cv online" landar på `/verktyg/skapa-cv` (pos 26 till 41). Artikeln ska inte jaga dem frontalt. Den tar **utvärderingsavsikten**: "gratis cv-byggare", "bästa gratis cv byggare", "cv byggare utan betalning", alltså läsaren som vill veta vad som faktiskt är gratis och vad en byggare måste klara. Länkar till `/verktyg/skapa-cv` med ankaret "vår CV-byggare".
3. **Vinkeln ingen i SERP:en har:** varje topprankad sida är en verktygssida som säger "gratis" om sig själv. Ingen förklarar *vilka* gratismodeller som finns (gratis bara som TXT, PDF bakom provperiod som förnyas per vecka, engångsavgift, få gratismallar). Vi kan, med Konsumentverkets regler som ryggrad, och vi kan vara ärliga om vår egen gratisnivå (3 av 41 mallar, en nedladdning). Ärligheten är vinkeln.
4. **LinkedIn-import finns inte** (se avsnitt 5.3). Artikeln får inte påstå det. Publika `/verktyg/skapa-cv` påstår det fortfarande (flaggat i avsnitt 8).

---

## 1. Search Console

Källa: Search Console API (servicekontot), egendom sc-domain:jobbcoach.ai. 90 dagar = 2026-08-16 till 2026-11-13. 365 dagar = 2025-11-14 till 2026-11-13. 16 månader kontrollerat för sidan (page contains "online-cv"): 0 rader.

### 1.1 Sidan själv
| Period | Klick | Visningar | Position |
|---|---|---|---|
| 90 dagar | 0 | 0 | – |
| 365 dagar | 0 | 0 | – |
| 16 mån | 0 | 0 | – |

URL-inspektion: "URL is unknown to Google", ingen senaste genomsökning. Jämförelse: `/verktyg/skapa-cv` är "Submitted and indexed", senast genomsökt 2026-11-05.

### 1.2 Frågorna i klustret och vilka sidor som får dem (365 dagar)
| Fråga | Sida | Visn. | Pos. |
|---|---|---|---|
| cv byggare | /verktyg/skapa-cv | 108 | 40,9 |
| cv byggare | /artiklar/skriva-cv-guide | 17 | 87,5 |
| cv-byggare | /verktyg/skapa-cv | 49 | 35,6 |
| gratis cv-byggare | /artiklar/cv-mall-gratis-guide | 56 | 41,6 |
| gratis cv-byggare | /verktyg/skapa-cv | 37 | 34,1 |
| gratis cv-byggare | /cv-mallar/konstruktor | 19 | 51,8 |
| cv online gratis | /artiklar/cv-mall-gratis-guide | 118 | 51,8 |
| cv online gratis | /verktyg/skapa-cv | 57 | 31,0 |
| gratis cv online | /artiklar/cv-mall-gratis-guide | 116 | 66,5 |
| gratis cv online | /verktyg/skapa-cv | 56 | 33,5 |
| cv online | /verktyg/skapa-cv | 71 | 25,6 |
| cv-online | /verktyg/skapa-cv | 58 | 27,7 |
| skapa cv online | /verktyg/skapa-cv | 49 | 34,5 |
| skapa cv online gratis | /verktyg/skapa-cv | 34 | 33,2 |
| skapa cv gratis | /artiklar/cv-mall-gratis-guide | 88 | 78,0 |
| skapa cv gratis | /verktyg/skapa-cv | 58 | 38,0 |
| cv mall online | /artiklar/cv-mall-gratis-guide | 290 | 59,4 |
| cv mall online | /verktyg/cv-mallar | 64 | 79,9 |
| cv-skapare | /verktyg/skapa-cv (90 d) | 64 | 59,1 |
| cv maker gratis | /verktyg/skapa-cv (90 d) | 3 | 44,7 |
| skapa cv från linkedin | /artiklar/ladda-upp-cv-linkedin | 3 | 20,0 |

Klick i hela klustret: 0. Allt ligger på sida 3 till 8. Visningarna är därför ett golv, den verkliga volymen är större.

Totalt 365 dagar för konkurrerande egna sidor: `/verktyg/skapa-cv` 1 368 visn./9 klick/pos 39,5; `/artiklar/cv-mall-gratis-guide` 9 897/8/64,6; `/verktyg/cv-mallar` 4 395/12/50,2; `/cv-mallar` 888/2/30,0; `/artiklar/cv-mall-pdf-gratis` 3/0; `/artiklar/skapa-cv-med-ai` 272/4/13,5.

### 1.3 Kannibalisering och avgränsning
- **/verktyg/skapa-cv** äger transaktionen ("cv byggare", "skapa cv online", "cv online"). Artikeln stöttar den med länk, aldrig med samma huvudrubrik. Använd inte "Skapa CV online" som H1.
- **/artiklar/cv-mall-gratis-guide** får "gratis cv online"/"cv mall online" och har H2 "Mall i Word, PDF eller online?". Avgränsning: den artikeln handlar om *mallen* (var du hittar en gratis mall). Vår handlar om *byggaren* och dess villkor. Länka dit för "vill du hellre ha en mall att fylla i själv".
- **/artiklar/cv-mall-pdf-gratis** och **cv-mall-word-gratis**: filformatssidor, ingen krock om vi inte skriver om PDF kontra Word i djup. Ett stycke räcker, med länk.
- **/artiklar/skapa-cv-med-ai**: AI-skrivstödet. Nämn inte AI som huvudsak här, länka dit.
- **/artiklar/ladda-upp-cv-linkedin** äger "skapa cv från linkedin". LinkedIn-avsnittet här blir kort och länkar dit.
- **/cv-mallar/konstruktor** får "gratis cv-byggare" på grund av ordet "byggare" (yrket). Ingen åtgärd.

### 1.4 Sökavsikt
Blandad, med tyngdpunkt på transaktion: SERP:en för "cv byggare gratis" och "skapa cv online gratis" är nästan bara verktyg. Den informativa nischen är "vad är gratis på riktigt" och "vilken byggare ska jag välja". Det är den artikeln kan vinna, plus GEO (AI-svar på "finns det en helt gratis CV-byggare?").

---

## 2. SERP-benchmark (hämtat 2026-11-15)

WebSearch "cv byggare gratis", "skapa cv online gratis", "bästa gratis cv byggare utan betalning". Topp: cvkungen.se, itqantools.com, cvresumefree.com, aithor.com, cv-mallen.se, resumemaker.online, canva.com, talea.se, cvfixaren.se, flowcv.com, nobsresume.com, mojcv.com. En listartikel (googiehost.com) rankar men leder i dag om till en webbhotellsida.

| Sida | Typ | Ord (ca) | H2:or (urval) |
|---|---|---|---|
| cvkungen.se | verktyg + mallgalleri | 4 500 till 5 000 (mest malllistor) | Enkel cv-byggare, Snygga cv-mallar, Beprövade cv-mallar, Professionella cv:n för effektiva ansökningsintervjuer, Vanliga frågor |
| cv-mallen.se | verktyg | 2 800 till 3 200 | Skapa ditt CV online, Vad du får i CV-byggaren, Så gör du ett CV på några minuter, Skapa CV online utan Word-krångel, Byt design utan att börja om, Vanliga frågor |
| cvfixaren.se | verktyg | ca 2 100 | Varför CVfixaren, Så skapar du ett CV i fyra steg, Allt du behöver för att göra ett proffsigt CV, Våra populäraste CV-mallar, Vanliga frågor om att skapa CV |
| talea.se/cv | verktyg | 1 200 till 1 400 | CV-mallar gratis – välj design, CV-exempel per yrke, Så skapar du ditt CV online, Vanliga frågor, Guider |

**Vad de missar:** ingen förklarar vad "gratis" betyder hos andra eller hur en provperiod blir en prenumeration; ingen hänvisar till Konsumentverket; ATS nämns som säljord ("läsbart för rekryteringssystem") utan förklaring eller källa; ingen säger något om var utkastet sparas eller om personuppgifter; ingen ärlig jämförelse byggare kontra mall i Word.

**Mål-längd:** 2 000 till 2 400 ord synlig brödtext (exkl. FAQ-block). Det matchar cv-mallen/cvfixaren och slår dem på substans; cvkungens längd är malllistor, inte text. Inte längre än så: SERP:en är verktygsdominerad, och avsikten är att få svar och sedan bygga.

### 2.1 Konkurrenternas gratisvillkor (kontrollerat 2026-11-15 på deras egna sidor)
| Tjänst | Sida | Vad som står |
|---|---|---|
| Resume.io | resume.io/pricing | Gratis: "Downloads only in TXT format", "Only one resume and cover letter". Provperiod "$2.95", "7-day Trial", "After 7 days, auto-renews to $29.95 billed every 4 weeks". |
| Kickresume | kickresume.com/en/pricing | Gratis: "4 basic resume templates", "Unlimited downloads". Premium €24/mån månadsvis, €18/mån kvartalsvis, €8/mån årsvis. |
| CVfixaren | cvfixaren.se | "Det är gratis att skapa och redigera ditt CV". PDF-nedladdning startar provperiod: "0 kr i 7 dagar, därefter 69 kr/vecka", "Du kan avsluta när du vill". |
| CV-mallen | cv-mallen.se | "Gratis att skapa och dela", "Vill du ladda ner det som PDF krävs ett konto. Du ser priset innan du börjar". |
| Talea | talea.se/cv | "Alla 58 mallar är gratis från början", gratisversionen har "en liten rad längst ner i dokumentfoten om var det är gjort"; "Ett privatkonto kostar 49 kr för 30 dagar, inklusive moms. Det betalas en gång och är ingen prenumeration". |
| CVkungen | cvkungen.se | "Vår gratis cv-byggare har Vancouver-mallen"; "betalda funktioner låser upp professionella mallar ...". Inga priser på startsidan. |
| Zety | zety.com/pricing | **Ej kontrollerat**: sidan svarade inte (timeout två gånger). |
| Canva | canva.com/create/cv | **Ej kontrollerat**: 403. |

**Rekommendation: jämför utan namn.** Villkoren ändras ofta, två av de största gick inte att kontrollera, och artikeln åldras sämre med namn. Bygg i stället en tabell över *gratismodellerna* (avsnitt 3.6), där varje rad bygger på minst en kontrollerad tjänst ovan. Copywritern får skriva "en av de stora internationella byggarna" om Resume.io-modellen. Nämn inte Zety eller Canva alls.

---

## 3. SEO-plan

### 3.1 Sökord
- **Huvudsökord:** gratis cv-byggare / cv byggare gratis (båda stavningarna i text, "CV-byggare" med bindestreck i rubriker).
- **Sekundära:** bästa gratis cv-byggare, cv byggare utan betalning, skapa cv online gratis (bara i brödtext, en gång i snabbsvaret), cv online gratis, cv-skapare, ats-vänligt cv, ladda ner cv som pdf gratis.
- **Long tail (FAQ/H2):** finns det en helt gratis cv-byggare, varför kostar det att ladda ner cv, provperiod cv prenumeration, göra cv av linkedin-profil.

### 3.2 Metadata
- **title (H1/OG/schema):** "Gratis CV-byggare: så ser du vad som faktiskt är gratis innan du börjar"
- **seoTitle (50 tecken):** "Gratis CV-byggare 2026: så undviker du betalväggen"
  Alternativ (49): "CV-byggare gratis 2026: vad är gratis på riktigt?"
- **description (151 tecken):** "Gratis CV-byggare finns, men många låser PDF:en bakom en provperiod som blir prenumeration. Så läser du villkoren och väljer en byggare som klarar ATS."
  Alternativ (143): "CV-byggare gratis? Många låser PDF:en bakom en provperiod som förnyas. Så läser du villkoren i förväg och väljer en byggare vars CV klarar ATS."
- **date:** behåll "2025-04-20"; **updated:** publiceringsdagen.
- **image/imageAlt:** befintlig `/images/artiklar/online-cv-byggare-gratis-v2.webp`. imageAlt beskriver bilden, inte sökord (behåll nuvarande om bilden står kvar).

### 3.3 Taggar och CTA-kluster
Förslag: `["gratis cv-byggare", "cv byggare", "skapa cv online", "cv online gratis", "ats-vänligt cv", "cv-mall online", "cv tips"]`
`getCtaVariantForTags` (src/lib/cta/clusters.ts) ger **'cv'**: inga taggar innehåller test/matrigma/begåvning, intervjuord eller brevord, och "cv" träffar i första taggen. Undvik taggar med "test" (t.ex. "testa byggaren") och "personligt brev", de flyttar klustret.

### 3.4 Snabbsvar (GEO), direkt efter ingressen
H2: "Snabbsvar: finns det en CV-byggare som är helt gratis?"
Innehåll (copywritern formulerar): Ja, några, men de flesta tar betalt någonstans, oftast i sista steget när PDF:en ska laddas ner. Vanliga modeller: gratis bara som textfil, PDF som startar en provperiod som förnyas per vecka eller månad, få gratismallar, eller en rad om tjänsten i sidfoten. Kolla tre saker innan du skriver en rad: kan du ladda ner en PDF utan kort, vad händer efter provperioden, hur många mallar ingår. Hos oss: CV:t byggs i sju steg, tre av 41 mallar och en PDF-nedladdning ingår gratis, utan kortuppgift och utan vattenstämpel; mer kräver Jobbcoach Premium, 149 kr i månaden.

### 3.5 H2-struktur
1. *(Ingress, 80 till 120 ord: problemet är betalväggen i sista steget, löftet är att visa hur man ser den i förväg.)*
2. **Snabbsvar: finns det en CV-byggare som är helt gratis?**
3. **Vad är en CV-byggare, och när slår den en mall i Word?** (kort: fält, förhandsvisning, layout som håller; när Word eller mall passar bättre, länk cv-mall-gratis-guide, cv-mall-word-gratis)
4. **Vad betyder "gratis" hos en CV-byggare?** (JSX-tabell 3.6, gratismodellerna, utan namn)
5. **Så läser du villkoren innan du lägger ner en timme** (Konsumentverket: provperiod och abonnemang ska framgå tydligt; löptid och uppsägning; konkret: leta efter "provperiod", "förnyas", "per vecka"; testa nedladdningen med ett nästan tomt CV först)
6. **Klarar CV:t rekryteringssystemen?** (ATS enligt Arbetsförmedlingen, rubriker de känner igen, inga tabeller/grafik, ögonblicket hos rekryteraren 7,4 s, skicka som PDF; länk ats-vanligt-cv, nyckelord-i-cv)
7. **Sju saker att kolla hos en CV-byggare** (JSX-checklista 3.7)
8. **Kan du börja från LinkedIn eller ett gammalt CV?** (ärligt, se 5.3; länk ladda-upp-cv-linkedin, optimera-linkedin-profil)
9. **Så fungerar vår CV-byggare** (fakta 5.1 och 5.2, inklusive vad som inte ingår gratis; InteractiveCVShowcase eller CTA hit)
10. **Byggaren gör layouten, du gör innehållet** (profiltext, resultat med siffror, anpassa efter annonsen, korrekturläs; länkar cv-profil-sammanfattning, handlingsord-cv, korrekturlasa-cv, hur-langt-ska-ett-cv-vara)
11. **Vanliga frågor** (FAQContainer)

HowTo-frontmatter: kan behållas om den speglar en äkta sekvens (välj mall, fyll i sju steg, granska, ladda ner PDF). Den får inte innehålla "importera från LinkedIn". Fem till sju steg, dubbelfnuttar, inga tankstreck.

### 3.6 JSX-tabell 1: gratismodellerna (rubrik 4)
Kolumner: Modell | Vad du får gratis | Där tar det stopp | Så upptäcker du det
- Gratis bara som textfil | bygga och spara | PDF kräver betalning (provperiod som förnyas var fjärde vecka) | nedladdningsknappen erbjuder bara TXT, eller priset dyker upp först där *(Resume.io)*
- PDF startar en provperiod | bygga och redigera | provperioden övergår i veckoabonnemang | "0 kr i 7 dagar, därefter ..." i det finstilta *(CVfixaren)*
- Konto och pris vid nedladdning | bygga och dela som länk | PDF kräver konto och betalning | "PDF-export kräver konto" *(CV-mallen)*
- Få gratismallar | obegränsade nedladdningar | bara några enkla mallar | mallar märkta med lås eller "premium" *(Kickresume 4 mallar, CVkungen 1)*
- Gratis med märkning | alla mallar | en rad om tjänsten i sidfoten, bort mot engångsavgift | förhandsvisa PDF:en innan du skickar *(Talea)*
- Gratis med tak (vår modell) | 3 av 41 mallar, en PDF-nedladdning, ingen vattenstämpel | fler nedladdningar och mallar kräver Premium | står på prissidan

Kursiverade namn står bara här som belägg, inte i artikeln. Tabellen ska vara JSX `<table>` (markdown-tabeller renderas som rå text). Mönster: befintliga tabellen i nuvarande artikel.

### 3.7 JSX-tabell 2: sju kontroller (rubrik 7)
Kolumner: Kontroll | Varför det spelar roll | Så testar du på två minuter
1. PDF-nedladdning utan kort
2. Vad som händer efter en provperiod (förnyelse, period, uppsägning)
3. Mallar i en kolumn med vanliga rubriker (ATS)
4. Ingen vattenstämpel eller sidfotsrad, eller att du vet om den
5. Svenska rubriker (Arbetslivserfarenhet, Utbildning, Kompetenser)
6. Var utkastet sparas (konto eller bara webbläsaren) och om du kan radera kontot
7. Att du kan ändra och ladda ner igen nästa gång du söker (och vad det kostar)

### 3.8 FAQ (frontmatter `faq:` och lika många `<FAQItem>`)
1. Finns det en CV-byggare som är helt gratis?
2. Varför kostar det när jag ska ladda ner CV:t?
3. Hur ser jag om en gratis provperiod blir en prenumeration?
4. Är CV från en CV-byggare ATS-vänliga?
5. Kan jag göra ett CV av min LinkedIn-profil?
6. Vad ingår gratis i jobbcoach.ai:s CV-byggare?

Svaren håller sig till fakta i avsnitt 4 och 5. FAQ 5: "Det finns ingen direktimport från LinkedIn hos oss. Du kan ladda upp ett befintligt CV som PDF eller Word ... LinkedIns egen funktion Spara som PDF fungerar bara för profiler på engelska ..." (se 5.3).

### 3.9 Interna länkar (alla verifierade att filen/rutten finns 2026-11-15)
Konvertering: `/verktyg/skapa-cv` (huvud-CTA, 2 till 3 gånger), `/verktyg/cv-mallar` ("se alla 41 mallar"), `/verktyg/cv-analys` (CV-analysen läser bara CV:t, en gratis analys per konto), `/priser`.
Artiklar: `/artiklar/ats-vanligt-cv`, `/artiklar/nyckelord-i-cv`, `/artiklar/cv-mall-gratis-guide`, `/artiklar/cv-mall-word-gratis`, `/artiklar/cv-mall-pdf-gratis`, `/artiklar/skapa-cv-med-ai`, `/artiklar/ladda-upp-cv-linkedin`, `/artiklar/optimera-linkedin-profil`, `/artiklar/cv-profil-sammanfattning`, `/artiklar/handlingsord-cv`, `/artiklar/korrekturlasa-cv`, `/artiklar/hur-langt-ska-ett-cv-vara`, `/artiklar/hur-ska-ett-cv-se-ut`.
Länka inte `/kompetensutveckling`. `/verktyg/linkedin-optimering` bara om LinkedIn-optimeringen nämns, och då med att den ingår i Premium.

---

## 4. Research: verifierade fakta (sett i källtexten 2026-11-15)

**Arbetsförmedlingen, "Så skriver du ett cv som får AI att välja dig"**, publicerad 2026-02-10
https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig
- Om ATS: "Det letar efter relevanta kompetenser, erfarenheter och nyckelord och jämför dem med kravprofilen i annonsen."
- "Håll layouten enkel och lättläst. Undvik tabeller, grafik, symboler och specialtecken."
- "Välj ett vanligt typsnitt."
- "Använd rubriker som systemen känner igen. Standardrubriker som 'Arbetslivserfarenhet', 'Utbildning' och 'Kompetenser'"
- "Utgå från jobbannonsens språk. Identifiera centrala ord och formuleringar i annonsen"
- "Det som står högt upp i cv:t väger ofta tyngre i den automatiska bedömningen"
- "Sök på ATS-granskare så får du upp flera olika gratisförslag."

**Arbetsförmedlingen, "Writing a CV"** (engelskspråkig sida)
https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-cv
- "1–2 pages is sufficient for a CV."
- "Do not forget to adapt your CV to the job you are applying for."
- "When sending in your CV and personal letter by email, always send them as PDFs."

**Konsumentverket, "Abonnemang - regler för företag"**, uppdaterad 2025-12-17
https://www.konsumentverket.se/marknadsratt-foretag/abonnemang-regler-for-foretag/
- "Om företaget har för avsikt att kombinera ett gratis- eller prova på-erbjudande med en abonnemangstjänst måste det framgå på ett klart och tydligt sätt"
- "information om abonnemangstjänsten inte får ges en mindre framträdande plats i marknadsföringen än lockerbjudandet"
- "Företag måste informera konsumenten om tjänstens löptid och villkoren för att säga upp avtalet"
- "Det finns även särskilda regler om automatisk avtalsförlängning"
(Siffran "Uppsägningstiden ska inte överstiga 30 dagar" står också på sidan men utan sammanhang i hämtningen; använd den inte utan att copywritern läser stycket själv.)

**Ladders eye-tracking-studie 2018**, refererad av HR Dive 2018-11-08 (Ladders egen PDF gav 403)
https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/
- "Today's recruiters skim resumes for an average of 7.4 seconds."
- "Resumes that succeeded in capturing recruiters' attention featured simple layouts, with clear sections and heading titles."
- "Resumes did not fare well when hindered by cluttered layouts, a lack of white space on the page, multiple columns and long sentences."
Skriv "en amerikansk studie från 2018", inte som svensk sanning.

**LinkedIn Hjälp, "Save a profile as a PDF"**
https://www.linkedin.com/help/linkedin/answer/a541960
- Väg: Me-ikonen, profilkortet, "More" eller "Resources", "Save to PDF".
- "This feature is not available on the LinkedIn mobile app"
- "available only to members who have profiles and whose profile language is set to English"

**Konkurrentvillkor:** se 2.1 (belägg för gratismodell-tabellen, inte för namn i texten).

Inte verifierat, använd inte: påståenden om att stora byggare "kritiserats", siffror om hur många CV som sorteras bort av ATS ("bara 2 %" som cvkungen och cvfixaren använder saknar källa), Europass "gratis" (sidan säger inte ordet; vill ni nämna Europass, länka /artiklar/europass-cv).

---

## 5. Produktfakta, kontrollerade i koden (worktree publikt-v2, 2026-11-15)

### 5.1 CV-byggaren
- **Sju steg** (src/app/dashboard/skapa-cv/components/steps.config.ts): Kontaktuppgifter, Om dig, Erfarenhet, Utbildning, Kompetenser, Språk, Granska och spara.
- **Förhandsvisning** medan du fyller i (SkapaCvPreview.tsx). Mallen väljs i granskningssteget (Step7Review.tsx); låsta mallar går att förhandsvisa men inte ladda ner.
- **Konto krävs:** byggaren ligger i /dashboard; publika sidans knappar går till `/register?borja=cv`. Gratis konto, ingen kortuppgift.
- **Sparning:** utkastet sparas automatiskt **i webbläsaren** var 30:e sekund och ligger kvar i 7 dagar (hooks/useAutoSave.ts, localStorage). CV:t sparas i kontot när du sparar i sista steget (/api/cv/save-improved). Skriv alltså "utkastet sparas automatiskt medan du skriver, och när du sparar ligger CV:t i ditt konto". Skriv inte att man kan börja i mobilen och fortsätta på datorn innan CV:t sparats.
- **Gratis kan du spara 2 CV** (CV_GRANS_GRATIS = 2 i src/lib/supabase/premiumAccess.ts; betalt 50).

### 5.2 Mallar och nedladdning
- **41 mallar, 3 gratis, 38 i Premium** (src/lib/cv/template-antal.ts: TEMPLATE_COUNT 41, FREE_TEMPLATE_COUNT 3, PREMIUM_TEMPLATE_COUNT 38).
- **FREE_CV_EXPORTS = 1**: en gratis CV-nedladdning per konto. Spärren sitter i src/app/api/cv/generate-formatted/route.ts (räknaren free_cv_exports_used, 402 vid andra försöket).
- **Bekräftad e-post krävs** för att ladda ner (samma route, `email_not_verified`).
- **Format: PDF.** Skriv bara PDF. Inget om Word för CV.
- **Ingen vattenstämpel:** `watermark?: boolean` finns bara som typfält i src/lib/cv/types.ts och används ingenstans.
- **Pris:** Jobbcoach Premium, 149 kr i månaden, ingen bindningstid (src/lib/plans/plans.ts: "bara en säljs: Jobbcoach Premium, 149 kr i månaden"). Första gången: fullt namn "Jobbcoach Premium", sedan "Premium".
- **CV-analysen** läser bara CV:t, ingen annons; en gratis analys per konto (produktfacit). Jämförelse mot lediga jobb = jobbmatchningen.

### 5.3 LinkedIn: vad som finns och vad artikeln får säga
Grep efter linkedin i src/app/dashboard, src/app/api, src/components/cv, src/lib:
- **Ingen OAuth/inloggning med LinkedIn**, ingen hämtning av profilen från LinkedIn, ingen tolkning av LinkedIns "Save to PDF"-export som eget flöde. src/lib/linkedin/ innehåller bara linkedin-to-cv-converter.ts.
- **CV-byggaren** har bara ett textfält för LinkedIn-adressen i steg 1 (Step1Kontakt.tsx).
- **LinkedIn-optimeringen** (/dashboard/linkedin-optimizer) låter dig *klistra in* profilens avsnitt för hand (PasteHelper, Step2Profile "Klistra in din nuvarande profil") eller utgå från ett sparat CV. I sista steget finns "Spara som CV i Jobbcoach" (Step4Done.tsx → /api/cv/create-from-linkedin), som gör ett CV av den inklistrade och omskrivna texten. **Optimeringen ingår i Premium** (src/app/api/linkedin/optimize/route.ts: gratisnivån får 402).
- **Vanlig CV-uppladdning** (Mina CV, InlineCVUpload.tsx): PDF, DOCX eller TXT, max 5 MB. En LinkedIn-PDF går att ladda upp där som vilken PDF som helst, och sedan lägga i en mall (/dashboard/cv-mallar?cv=…). Det är ingen LinkedIn-import, och LinkedIns PDF-funktion fungerar bara för profiler på engelska.

**Får skrivas:** "Det finns ingen direktimport från LinkedIn. Har du ett CV eller en PDF av profilen kan du ladda upp den, så läser vi in texten och du lägger den i en mall. Med Premium kan du också klistra in profilens avsnitt i LinkedIn-optimeringen och spara resultatet som ett CV."
**Får inte skrivas:** "importera från LinkedIn", "hämtar din profil direkt", "LinkedIn-import", "koppla ditt LinkedIn-konto".

---

## 6. Indexering och länkar in (utöver omskrivningen)
1. Ägaren begär indexering av URL:en i Search Console efter deploy (vi har bara läsrätt).
2. Kontextuella länkar in, ankare med huvudsökordet, i samma PR om ägaren godkänner att fler filer rörs:
   - skapa-cv-med-ai (pos 13,5, bäst placerade CV-artikeln i klustret), H2 "Snabbaste vägen: CV-verktyg med inbyggt skrivstöd": en mening med länk.
   - ats-vanligt-cv eller hur-ska-ett-cv-se-ut: en mening om att kolla byggarens villkor.
   - Finns redan: cv-mall-gratis-guide rad 198, cv-pa-engelska-resume rad 535, skriva-cv-guide rad 150. Kontrollera att ankartexten i cv-mall-gratis-guide fortfarande stämmer efter omskrivningen.
3. GSC-avläsning 4 och 8 veckor efter indexering: frågorna i 1.2, särskilt att `/verktyg/skapa-cv` inte tappar på "cv byggare".

## 7. Mekaniska kontroller före push
seoTitle ≤ 60, description 110 till 158, faq.length = antal `<FAQItem>`, 0 tankstreck (—), 0 Sparkles, tabeller som JSX, inga ord: "Word" om vår CV-export, "LinkedIn-import", "analys mot annonsen", "helt gratis" om oss.

## 8. Fynd utanför artikeln (till samordnaren)
`src/app/(public)/verktyg/skapa-cv/page.tsx` och `components/skapa-cv-faq-data.ts` säger fortfarande:
- rad 33 till 34 och 71: "Hämta uppgifterna från LinkedIn ... Importera profil, erfarenhet och kompetenser direkt" och "LinkedIn-import": **fel**, ingen import finns.
- skapa-cv-faq-data.ts rad 39 till 40: "Vi har stöd för LinkedIn-import som hämtar din profil ... direkt": **fel**. Rad 32 nämner också import.
- page.tsx "Sparas automatiskt ... Börja på bussen och fortsätt vid datorn hemma": utkastet ligger bara i webbläsaren tills det sparats; mellan enheter stämmer det först efter sparning.
- Word-raderna där är kända och väntar på Word-spåret enligt ägarbeslutet.
Faktagranskningens "Belagda påståenden" (LinkedIn-import, PDF och Word) byggde på just den sidan och är alltså fel belagda.
