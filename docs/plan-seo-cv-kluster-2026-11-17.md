# Byggspec: SEO för CV-klustret, 2026-11-17

Underlag: `docs/rapporter/seo-cv-kluster-2026-11-17.{html,pdf,md}` (SEO-strategen). Ägarens beslut 2026-11-17: hela planen körs i ett svep; 301-sammanslagningarna (cv-mall-gratis-guide, cv-mall-word-gratis, cv-mall-pdf-gratis) och piloten med fem yrkespar är godkända. Saas-lead beslutar i produktfrågor, säljansvarig i säljfrågor (avsnitt 5), SEO-strategen sätter kraven i avsnitt 4 och de är grind. Utgångsläge: main bc1eaca1 (40 mallar, 26 Word, 15 med foto).

Två byggare (Opus 5.5), en per spår, på var sin gren från main: `feat/seo-cv-a` (artiklar, MDX) och `feat/seo-cv-b` (kod och sidor). Spår B mergas först (301:orna och de nya sidorna måste finnas innan artiklarna länkar dit), sedan A, sedan en gemensam grindkörning på main-kandidaten, sedan push till main.

**Rör inte:** texter om datalagring, GDPR, integritet eller villkor. Undantag med ägarens besked 2026-11-17 ("Självklart ska det stå som det fungerar"): FAQ-svaret "Hur sparas mitt CV medan jag bygger det?" och funktionsraden "Utkastet väntar på dig" på /verktyg/skapa-cv skrivs om så att de beskriver hur nya byggaren sparar (verifiera i koden, src/app/dashboard/skapa-cv och /api/cv/strukturerad: CV:t sparas i ditt konto när du sparat första avsnittet, sedan efter varje avsnitt; du fortsätter från Mina CV på vilken enhet som helst). Inget om var data lagras geografiskt, inga GDPR-löften, policy och villkor orörda. Skriv inga andra nya påståenden om var eller hur data sparas. Den ocommittade ändringen i `next.config.ts` (/strumpan-redirecten) i huvudrepots arbetskopia tillhör ett annat spår; ta inte med den i era commits och skriv inte över den.

**Produktfacit för all text i det här svepet (kontrollerat i koden 2026-11-17):**

- Mallar: talen ur `src/lib/cv/template-antal.ts` och `src/lib/cv/mallar/katalog.ts`, aldrig hårdkodade i kod. I MDX skrivs talen som text och ska stämma med katalogen vid push: 40 mallar, 2 gratis (Linne, Björk), 26 med Word (24 utöver gratismallarna), 15 med fotoplats (Björk gratis, 14 Premium), 17 i en spalt (familj `en-spalt`). Alla mallar passar alla yrken; det finns inga yrkesmallar.
- Gratis: en nedladdning per konto, PDF eller Word, i Linne eller Björk, utan kortuppgift, utan vattenstämpel. Två sparade CV på gratiskontot.
- Premium: alla 40 mallar, nedladdning utan tak, Word i alla 26 Word-mallar; pris ur `paketMedPris(SALD_PLAN)` i kod, "149 kr i månaden" i MDX (Black Week-varianter sköts av KampanjVarianter där de finns; skriv inga kampanjpriser för hand).
- Byggaren /dashboard/skapa-cv, "Direkt på arket": startbladet frågar "Vilket jobb söker du?", yrkestiteln styr rubriker, grå exempeltext och Jobbcoachens förslag; två vägar, "Ladda upp ett CV du har" (PDF eller Word, även LinkedIn-PDF, "Vi fyller i avsnitten åt dig") och "Skriv från början"; arket i vald mall är byggaren, man trycker på ett avsnitt för att fylla i; grå text följer inte med i filen; på datorn öppnas avsnittet i en panel till höger om arket, i mobilen som ett blad nerifrån; ordning Erfarenhet, Utbildning, Kompetenser, Profil, Språk, plus "Fler avsnitt" (intyg, projekt, intressen); "Skriv punkter åt mig": Jobbcoachen föreslår punkter, gratis 3 förslag per konto (`FREE_CV_BYGG_AI_PER_ACCOUNT`), Premium 30 per dygn (`PAID_CV_BYGG_AI_PER_DAY`); byte av mall, färg och typsnitt utan att innehållet försvinner; rubrikerna följer yrket (tolv rubrikuppsättningar i `src/lib/cv/rubriker.ts`, egen rubrik per avsnitt går att skriva). Inga "sju steg" någonstans.
- /cv-mallar: uppladdning av eget CV utan konto (ankaret `#ladda-upp`), helskärm med PDF:ens riktiga sidor, svep mellan mallar, Word-avsnittet `#word`. /cv-mallar/prova är noindex och tar mall, namn och titel ur adressen (läs parameternamnen i `ProvaKontext.tsx`, gissa inte).
- ATS: "ATS-säkra mallar, testade för rekryteringssystem" (test:ats grön). Skriv aldrig att mallarna garanterar intervju.
- Svenska facktermer, inga tankstreck (varken långt eller kort, U+2014 och U+2013) i någon text eller metadata, aldrig Sparkles-ikonen, inga påhittade siffror, citat eller fall. Säg "vi", inte "AI:n".

---

## 1. Spår A: artiklar (MDX), gren `feat/seo-cv-a`

Alla ändringar i `content/artiklar/*.mdx`. Metadataändringar görs byte-säkert (bara de avsedda raderna; aldrig gray-matter-stringify på hela filen). Varje artikel som ändras i brödtexten får `updated: "2026-11-17"` i frontmatter (finns fältet redan, byt värdet). Tabeller bara som JSX `<table>` enligt mönstret i bild-i-cv-ja-eller-nej.mdx. FAQ i frontmatter och `<FAQItem>` i texten ska vara lika många och ordagrant samma frågor.

### A1. online-cv-byggare-gratis (fel om produkten)

1. Snabbsvaret (rad 48), sista meningen: ersätt "Hos oss bygger du CV:t i sju steg, och två av 40 mallar och en PDF-nedladdning ingår gratis, utan kortuppgift och utan vattenstämpel." med: "Hos oss skriver du direkt på arket i den mall du valt, och två av 40 mallar och en nedladdning som PDF eller Word ingår gratis, utan kortuppgift och utan vattenstämpel."
2. Under `## Så fungerar vår CV-byggare` (rad 211 och framåt): skriv om stycket som börjar "Här är vår egen modell" så att det beskriver flödet i produktfacit ovan, i den här ordningen: konto gratis utan kortuppgift; frågan om vilket jobb du söker och vad titeln styr; de två vägarna (ladda upp eller skriv från början); arket är byggaren, tryck på ett avsnitt, grå exempeltext följer inte med; panelen till höger på datorn och bladet nerifrån i mobilen; "Skriv punkter åt mig" med tre förslag gratis per konto och 30 per dygn i Premium; byt mall, färg och typsnitt utan att något försvinner. Behåll styckets övriga påståenden om gratisnivån ordagrant. Max 170 ord. Ingen ny mening om var utkastet sparas.
3. FAQ-svaret "Du fyller i CV:t i sju steg med förhandsvisning, väljer en av två gratismallar ..." (frontmatter rad 23 och FAQItem rad 279, båda): byt första satsen till "Du skriver direkt på arket i mallen du valt, eller laddar upp ett CV du har, väljer en av två gratismallar ..." Resten ordagrant.
4. Länkar: `[CV-mall i Word](/artiklar/cv-mall-word-gratis)` blir `[CV-mallar i Word](/cv-mallar/word)`; `/artiklar/cv-mall-pdf-gratis` blir `[våra CV-mallar](/cv-mallar)`; `/artiklar/cv-mall-gratis-guide` blir `[gratis CV-mallar](/cv-mallar)`. Lägg till i avsnittet om vår byggare: "Vill du börja i mallen i stället kan du [ladda upp ditt CV och se det i alla 40 mallar](/cv-mallar#ladda-upp) utan konto."
5. Kontrollera att `grep -n "sju steg\|7 steg" content/artiklar/online-cv-byggare-gratis.mdx` ger 0 rader.

### A2. skapa-cv-med-ai (sälj Jobbcoachens punkter)

1. `## Snabbaste vägen: CV-verktyg med inbyggt skrivstöd`: ersätt stycket på rad 105 med ett stycke (högst 130 ord) som säger: i vår [CV-byggare](/verktyg/skapa-cv) skriver du direkt på arket i en färdig mall; när du kommer till ett jobb trycker du på "Skriv punkter åt mig" och Jobbcoachen föreslår punkter utifrån yrkestiteln och det du skrivit; du väljer, ändrar eller hoppar över; tre förslag är gratis per konto och Premium ger 30 per dygn; har du redan ett CV laddar du upp det så fylls avsnitten i. Avsluta med de två befintliga länkarna (CV-analys och gratis CV-byggare) ordagrant. Artikelns poäng står kvar: läs, ändra till din egen röst, inget påhittat.
2. FAQ "Är det gratis att skapa CV med AI?" (frontmatter och FAQItem): efter "kan du bygga ett komplett CV och ladda ner det en gång gratis" lägg till ", och Jobbcoachen skriver tre förslag på punkter utan kostnad".
3. Lägg till en textlänk i `## Så skapar du ett CV med AI, steg för steg`, sist i avsnittet: "Vill du se resultatet i en riktig mall direkt kan du [ladda upp ditt CV och se det i våra mallar](/cv-mallar#ladda-upp)."
4. Metadata oförändrad (description 144 tecken är inom ramen).

### A3. Länkar till mallarna och byggaren

Exakt en ny mening per punkt, sist i angivet avsnitt (före eventuell FAQ-del), med exakt den länktext som står. Inga andra ändringar i texten. Länkmålen är kanoniska (`/cv-mallar`, `/cv-mallar#ladda-upp`, `/verktyg/skapa-cv`); aldrig `/verktyg/cv-mallar`, aldrig `/skapa-cv`.

| Artikel | Avsnitt (H2) | Mening att lägga till |
|---|---|---|
| ljuga-i-cv | De ärliga alternativen till de vanligaste lögnerna | "Det ärliga CV:t behöver inte se tunt ut: [välj en CV-mall](/cv-mallar) som lyfter det du faktiskt har gjort." |
| skriva-cv-guide | Använd verktyg för att optimera ditt CV | "Vill du ha layouten klar direkt kan du [välja bland 40 CV-mallar](/cv-mallar) eller [skriva CV:t direkt på arket i vår byggare](/verktyg/skapa-cv)." |
| ats-vanligt-cv | Formatet: så bygger du ett CV som systemen läser felfritt | "Alla våra [CV-mallar är testade mot rekryteringssystem](/cv-mallar), och du kan [ladda upp ditt CV och se det i mallarna](/cv-mallar#ladda-upp) innan du bestämmer dig." |
| ats-vanligt-cv | Testa innan du skickar | "Börjar du om från grunden går det fortare i [vår CV-byggare](/verktyg/skapa-cv), där rubrikerna följer yrket du söker." |
| datorkunskaper-cv | Var raderna ska stå | "I våra [CV-mallar](/cv-mallar) har kompetenserna en egen sektion, så systemen hamnar där rekryteraren letar." |
| cv-exempel-student-nyexaminerad | Vad du gör om du saknar all arbetslivserfarenhet | "Gratismallarna Linne och Björk fungerar bra med utbildningen först: [se alla CV-mallar](/cv-mallar) eller [bygg CV:t direkt på arket](/verktyg/skapa-cv)." |
| sprak-i-cv | Uppställningen: så ser sektionen ut | "Sektionen Språk finns i alla våra [CV-mallar](/cv-mallar), och i [byggaren](/verktyg/skapa-cv) fyller du i språk och nivå direkt på arket." |
| fardigheter-kompetenser-cv | Säkra att dina kompetenser matchar jobbet | "Vill du se hur listan tar sig ut i en färdig layout kan du [ladda upp ditt CV och se det i våra mallar](/cv-mallar#ladda-upp)." |
| ladda-upp-cv-linkedin | Filen i sig: samma regler som alltid | "Behöver filen en ny layout först kan du [välja en CV-mall](/cv-mallar) och ladda ner den som PDF." |
| nyckelord-i-cv | Var i CV:t nyckelorden gör störst nytta | "I våra [CV-mallar](/cv-mallar) står kompetenser och erfarenhet under standardrubriker, så nyckelorden hamnar där systemen letar. I [byggaren](/verktyg/skapa-cv) följer rubrikerna yrket du söker." |
| exempel-pa-kompetenser-lista | Från lista till färdig ansökan | "Listan blir ett CV snabbast i [vår CV-byggare](/verktyg/skapa-cv), eller [i en färdig CV-mall](/cv-mallar)." |
| utbildning-i-cv | Två exempel: nyexaminerad och erfaren | "Ordningen med utbildningen först väljer du i alla våra [CV-mallar](/cv-mallar); i [byggaren](/verktyg/skapa-cv) flyttar du avsnittet direkt på arket." |
| hur-langt-ska-ett-cv-vara | Testa ditt CV | "När du [laddar upp ditt CV i våra mallar](/cv-mallar#ladda-upp) ser du direkt hur många sidor det blir i varje mall." |
| handlingsord-cv | sista H2 före FAQ | "Orden gör mest nytta i en ren layout: [välj en CV-mall](/cv-mallar)." |
| cv-innehall-struktur | sista H2 före FAQ | "Strukturen finns färdig i våra [CV-mallar](/cv-mallar), med rubriker som följer ditt yrke." |
| europass-cv | sista H2 före FAQ | "Söker du jobb i Sverige räcker oftast ett vanligt svenskt CV: [se våra CV-mallar](/cv-mallar)." |
| prestationer-utmarkelser-cv | sista H2 före FAQ | "Intyg och utmärkelser kan få ett eget avsnitt i alla våra [CV-mallar](/cv-mallar)." |
| hobbyer-intressen-cv, korrekturlasa-cv, ledarskapsformagor-cv, arbetslivserfarenhet-cv, tidshantering-cv | sista H2 före FAQ | "[Välj en CV-mall](/cv-mallar) eller [bygg CV:t direkt på arket](/verktyg/skapa-cv) när innehållet är klart." (ta bort byggarlänken där artikeln redan länkar dit) |
| cv-pa-engelska-resume, cv-format-kronologiskt-funktionellt | sista H2 före FAQ | "[Bygg CV:t direkt på arket](/verktyg/skapa-cv) och välj ordningen på avsnitten själv." |

Kontrollera innan meningen läggs in: "Intyg" och "utbildningen först" finns som val i mallarna (sex val i alla mallar, plan-mallar), "sidantal" syns vid uppladdning (`sidantal_visat`). Finns inte funktionen: stryk den bisatsen, hitta inte på en ersättning.

### A4. cv-mall-word-gratis, cv-mall-gratis-guide, cv-mall-pdf-gratis tas bort (301)

1. `git rm` de tre MDX-filerna (bilderna i public/images/artiklar ligger kvar).
2. Uppdatera alla inkommande länkar till slutmålet, inte via 301:
   - cv-mall-gratis-guide i cv-och-personligt-brev, hur-skriver-man-cv, online-cv-byggare-gratis, skillnad-cv-personligt-brev → `/cv-mallar` (länktext "CV-mallar" eller "gratis CV-mallar" efter meningen).
   - cv-mall-word-gratis i online-cv-byggare-gratis, skriva-cv-guide → `/cv-mallar/word` (länktext "CV-mallar i Word").
   - cv-mall-pdf-gratis i online-cv-byggare-gratis, skriva-cv-guide, soka-jobb-via-mail → `/cv-mallar` (länktext "CV-mallar att ladda ner som PDF").
   - `src/app/(public)/exempel/components/MallarHubGuideSection.tsx` görs i spår B.
3. Efteråt: `grep -rn "cv-mall-gratis-guide\|cv-mall-word-gratis\|cv-mall-pdf-gratis" content src` får bara träffa next.config.ts (redirects) och undantagsfilen.
4. Innehållet flyttas i spår B (B4 och B5).

### A5. Titlar och beskrivningar på plats 5 till 9 (bara seoTitle och description)

| Artikel | seoTitle (tecken) | description (tecken) |
|---|---|---|
| ljuga-i-cv | Är det olagligt att ljuga på CV:t? Lagen och riskerna (53) | Att ljuga på CV:t är sällan ett brott i sig, men falska betyg och intyg är urkundsförfalskning. Så avslöjas lögnerna och därför kan jobbet gå förlorat. (151) |
| meritforteckning-eller-cv | Vad är en meritförteckning? Skillnaden mot ett CV (49) | En meritförteckning är en saklig lista över dina meriter, ett CV berättar mer. Så skiljer de sig åt, vad listan ska innehålla och när du använder vilken. (153) |
| datorkunskaper-cv | Datorkunskaper i CV:t: exempel per yrke och nivå (48) | Skriv system, inte goda datorkunskaper. Exempel på datorkunskaper i CV:t per yrke, hur du anger nivå och var raderna gör störst nytta hos rekryteraren. (151) |
| nyckelord-i-cv | Nyckelord i CV:t: hitta orden i annonsen och placera dem (56) | Nyckelord i CV:t avgör hur rekryteringssystemet sorterar dig. Så hittar du orden i annonsen, var de ska stå i CV:t och misstagen som sänker dig. (144) |
| ladda-upp-cv-linkedin | Ladda upp CV på LinkedIn: tre sätt, steg för steg (49) | Så laddar du upp CV:t på LinkedIn: på profilen, sparat för ansökningar eller som inlägg. Vem som ser filen, inställningarna som styr och fällorna. (146) |

Varje påstående i beskrivningen ska finnas i artikeln (läs innan; ljuga-i-cv: urkundsförfalskning och avslöjandet står i H2:orna; meritforteckning-eller-cv: "lista mot berättelse"). Stämmer något inte: skriv om just den satsen så att den gör det, inom 110 till 158 tecken.

### A6. Engelska CV: cv-pa-engelska-resume tar "cv engelska mall"

1. cv-pa-engelska-resume: description blir "CV-mall på engelska med luckor, ett komplett exempel att kopiera och alla svenska CV-rubriker översatta. Plus skillnaden mellan CV och resume, UK och US." (153). seoTitle oförändrad. I `## Mallar och verktyg för ditt engelska CV`: säg sanningsenligt att våra mallar har svenska rubrikuppsättningar men att du kan skriva en egen rubrik för varje avsnitt, och länka "[CV-mallarna](/cv-mallar)". Lova inte engelska rubrikuppsättningar (se fråga P2).
2. personligt-brev-pa-engelska: lägg till efter första stycket under `## Personligt brev på engelska: ett exempel att kopiera`: "Behöver du CV:t på engelska också finns [mall och exempel för CV på engelska](/artiklar/cv-pa-engelska-resume) i en egen guide." Ta bort taggarna som innehåller "cv" om några finns (inga i dag; kontrollera).

### A7. Mindre fynd

- Om cv-mall-word-gratis av någon anledning inte tas bort i samma push: "ytterligare tio mallar finns som Word-fil i Premium" blir "ytterligare 24 mallar finns som Word-fil i Premium". (Med A4 försvinner filen och punkten bortfaller.)
- `grep -rn "sju steg\|7 steg\|41 mallar\|tjugo mallar\|20 mallar\|bara som PDF\|endast PDF" content/artiklar` ska ge 0 träffar om CV-produkten (tester-hos-myndigheter och personlighetstest-jobb-guide har "sju steg" i annan betydelse och är undantagna).

### A8. Inkommande länkar till stilsidorna (B5)

En mening per rad, sist i angivet avsnitt, exakt länktext:

| Artikel | Avsnitt | Mening |
|---|---|---|
| ats-vanligt-cv | FAQ-svaret "Ska jag skicka CV:t som PDF eller Word?" (frontmatter och FAQItem, samma text) | Lägg till sist: "Ber annonsen om Word finns 26 av våra mallar som Word-fil." Länk bara i FAQItem: "[26 av våra mallar som Word-fil](/cv-mallar/word)" (frontmatter-svaret utan länk). |
| skriva-cv-guide | Använd verktyg för att optimera ditt CV | Länken "[CV-mallar i Word](/cv-mallar/word)" ersätter den gamla Word-artikellänken (A4). |
| cv-bild-guide | det avsnitt som handlar om var bilden placeras i layouten (läs artikeln, välj det H2 som nämner mall eller placering) | "Vill du slippa placera bilden själv har vi [CV-mallar med plats för bild](/cv-mallar/foto)." |
| bild-i-cv-ja-eller-nej | sista H2 före FAQ | "Bestämmer du dig för bild finns [CV-mallar med plats för bild](/cv-mallar/foto)." |
| hur-ska-ett-cv-se-ut | det H2 som handlar om layout eller kolumner | "Vill du ha en lugn layout direkt: [enkla CV-mallar i en spalt](/cv-mallar/enkla)." |
| cv-utan-erfarenhet | sista H2 före FAQ | "En [enkel CV-mall i en spalt](/cv-mallar/enkla) med utbildningen först passar bra när erfarenheten är kort." |
| cv-exempel-student-nyexaminerad | Vad du gör om du saknar all arbetslivserfarenhet | Lägg till efter A3-meningen: "Se också våra [enkla CV-mallar i en spalt](/cv-mallar/enkla)." |

---

## 2. Spår B: kod och sidor, gren `feat/seo-cv-b`

### B1. /verktyg/skapa-cv (`src/app/(public)/verktyg/skapa-cv/`)

- `layout.tsx` metadata: title "Skapa CV gratis: skriv direkt på arket, PDF eller Word" (54, utan suffix); description "Skapa CV gratis i en färdig mall: skriv direkt på arket eller ladda upp ett CV du har. Jobbcoachen föreslår punkter och du laddar ner som PDF eller Word." (153); OG- och Twitter-titel "Skapa CV gratis: skriv direkt på arket i en färdig mall" (55), OG- och Twitter-description samma som description. Keywords: lägg till "cv byggare", "skriv cv online", "cv online gratis". Canonical oförändrad.
- `page.tsx`: eyebrow "Skapa CV, direkt på arket"; h1 oförändrad ("Skapa ditt CV gratis på minuter", rankingsignal); ingress: "Skriv direkt på arket i den mall du valt, eller ladda upp ett CV du har så fyller vi i avsnitten. Jobbcoachen föreslår punkterna och du laddar ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna." Löftena (tre): `{ tal: 'På arket', text: 'du ser CV:t i mallen medan du skriver' }`, `{ tal: String(FREE_CV_BYGG_AI_PER_ACCOUNT), text: 'förslag på punkter från Jobbcoachen, gratis' }`, `{ tal: String(TEMPLATE_COUNT), text: \`mallar, ${FREE_TEMPLATE_COUNT} gratis\` }` (importera konstanten, skriv inte 3).
- FUNKTIONER: byt "Förhandsvisning medan du skriver" mot rubrik "Arket är byggaren", text "Du skriver direkt i mallen. Tryck på ett avsnitt, fyll i och se raden landa där den ska stå. Grå exempeltext visar vad som brukar stå där och följer inte med i filen."; lägg till rubrik "Jobbcoachen skriver punkterna", text med `FREE_CV_BYGG_AI_PER_ACCOUNT` och `PAID_CV_BYGG_AI_PER_DAY`: "Tryck på Skriv punkter åt mig så föreslår Jobbcoachen punkter utifrån yrket och det du skrivit. Du väljer, ändrar eller hoppar över. Tre förslag ingår gratis, Premium ger 30 per dygn." (talen ur konstanterna); lägg till rubrik "Rubriker som följer yrket", text "Skriv vilket jobb du söker så får avsnitten rubriker för din bransch, till exempel Klinisk erfarenhet i vården. Du kan också skriva en egen rubrik." "Utkastet väntar på dig": skriv om enligt undantaget överst (sparas i kontot efter varje avsnitt, fortsätt från Mina CV). "Börja från ett CV du redan har" och "Fungerar lika bra i mobilen" står kvar. Rubriken på kontrollblocket blir "Det här gör CV-byggandet enkelt" (talet sex stämmer inte längre).
- HowTo-schemat och stegblocket (`howToSchema.step`): fyra steg: 1 "Skriv vilket jobb du söker" (titeln styr rubriker och förslag), 2 "Ladda upp ett CV eller skriv från början", 3 "Fyll i direkt på arket" (tryck på ett avsnitt, Skriv punkter åt mig), 4 "Välj mall och ladda ner" (PDF, eller Word i Word-mallarna). Ingen totalTime om den inte är mätt; ta bort "10 min" ur löftena och "Tio minuters arbete" ur resultatblocket om de inte går att belägga (de går inte att belägga i dag: ta bort, ersätt rubriken med "Gör skillnad i varje ansökan" och raden "10 minuter till färdigt CV" med "Ladda upp ditt gamla CV och börja där det slutade").
- Slutrutan: text "Skriv direkt på arket, låt Jobbcoachen föreslå punkterna och ladda ner i en mall som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, full CV-analys och nedladdning av allt du skriver ingår i ${paketKort()}."
- `skapa-cv-faq-data.ts`: frågan "Hur skapar jag ett professionellt CV?" får svaret: skriv vilket jobb du söker, ladda upp eller skriv från början, fyll i direkt på arket med Jobbcoachens förslag, välj mall och ladda ner som PDF eller Word i Word-mallarna (talen ur konstanterna). "Hur lång tid tar det att skapa ett CV?": ta bort "sju steg" och "Tio till femton minuter"; svar: "Det beror på hur mycket du har att skriva. Har du ett CV sedan tidigare laddar du upp det, så fyller vi i avsnitten och du putsar bara. Börjar du från början leder byggaren dig avsnitt för avsnitt, och Jobbcoachen kan föreslå punkterna." "Hur sparas mitt CV medan jag bygger det?": skriv om enligt undantaget överst. Övriga frågor oförändrade.
- `SkapaCvLiveDemo.tsx` och `SkarmSkapaCv`: om demon visar sju steg eller en stegräknare, byt mot ett stillbild-ark av nya byggaren eller ta bort stegräknaren; fråga saas-lead (P6) om demon ska bytas helt. Ingen ny funktion i demon.
- Sekundär knapp: se S1.
- Mätning: behåll `data-cta-klick` på alla knappar.

### B2. Omdirigeringar (`next.config.ts`, `redirects()`)

Permanenta (308), läggs direkt efter `/verktyg/cv-mallar`-raden, med kommentar som hänvisar hit:

| Från | Till |
|---|---|
| /artiklar/cv-mall-gratis-guide | /cv-mallar |
| /artiklar/cv-mall-word-gratis | /cv-mallar/word |
| /artiklar/cv-mall-pdf-gratis | /cv-mallar |
| /cv-mall-gratis-guide | /cv-mallar |
| /cv-mall-word-gratis | /cv-mallar/word |
| /cv-mallar/saljare | /cv-exempel/saljare |
| /cv-mallar/butikssaljare | /cv-exempel/butikssaljare |
| /cv-mallar/barnskotare | /cv-exempel/barnskotare |
| /cv-mallar/ingenjor | /cv-exempel/ingenjor |
| /cv-mallar/larare | /cv-exempel/larare |

De två prefixlösa raderna ersätter posterna 'cv-mall-gratis-guide' och 'cv-mall-word-gratis' i listan "Gamla prefix-lösa artikel-URL:er" (ta bort dem därifrån, annars blir det en kedja). Kontrollera att `src/proxy.ts` inte skriver om någon av adresserna före next.config. Test: `curl -sI` mot dev-servern ger 308 och rätt Location för alla tio, och ingen kedja (en hopp).

### B3. Piloten: fem yrkespar slås ihop till /cv-exempel

Slugs: `saljare`, `butikssaljare`, `barnskotare`, `ingenjor`, `larare` (exempelsidan rankar bättre på de delade frågorna i alla fem: 11,3 mot 23,7; 23,4 mot 37,7; 15,1 mot 23,6; 21,4 mot 37,2; 19,6 mot 33,1). Kontrollgrupp som INTE slås ihop: `underskoterska`, `forskollarare`, `sjukskoterska`, `lagerarbetare`, `it-konsult`.

1. `src/app/(public)/cv-mallar/yrkesmall-data.ts`: exportera `PILOT_SAMMANSLAGNA = ['saljare','butikssaljare','barnskotare','ingenjor','larare'] as const` och `YRKESMALL_PUBLIKA = YRKESMALL_LIST.filter(y => !PILOT_SAMMANSLAGNA.includes(y.slug))`. YRKESMALL_LIST och YRKE_TILL_MALLAR ändras inte (datan behövs i exempelsidan). `generateStaticParams`, sitemap, ItemList på /cv-mallar, listan "CV-mallar för ditt yrke" på /cv-mallar, `relaterade` på yrkessidorna och `ExempelPopulara` använder YRKESMALL_PUBLIKA.
2. `src/components/publikt/innehall/exempel/ExempelMall.tsx`, CV-läget, när slug finns i PILOT_SAMMANSLAGNA: ersätt korslänksblocket "Letar du efter en CV-mall för ..." med ett mallblock:
   - H2: `CV-mall för ${yrkeLitet}: välj och fyll i`
   - Ingress (en mening): "Alla våra mallar passar ${yrkeLitet}. Välj rubrikerna för din bransch, fyll i direkt och ladda ner gratis i Linne eller Björk."
   - Tre riktiga miniatyrer (`MallMiniatyr`): yrkets `free`- och `premium`-mall ur YRKE_TILL_MALLAR (lös gamla id med `losMallIdEllerForval`) och den andra gratismallen; varje miniatyr länkar till /cv-mallar/prova med mall och yrke i adressen; under varje: mallnamn och nivå ("Gratis, PDF och Word" eller "Premium"), samma rad som `ARTIKEL.mallrad`.
   - H3 `Vad rekryterare letar efter hos ${yrkeLitet}` med yrkesmallens `rekryterarTipsen` (rubrik och text) om exempelsidans "Tips för ..." inte redan har samma rubrik (jämför normaliserad text; dubbletter visas inte).
   - Stycket `atsInfo` ur yrkesmallen under H3 `Så läser rekryteringssystemen ditt CV`.
   - Länkrad: "[Se alla ${TEMPLATE_COUNT} CV-mallar](/cv-mallar)" och "[Ladda upp ditt CV och se det i mallarna](/cv-mallar#ladda-upp)".
   - FAQ: lägg yrkesmallens `faqItems` efter exempelsidans frågor, utan dubbletter (normaliserad fråga). FAQPage-schemat på sidan ska ha samma frågor som de synliga.
3. Metadata för de fem: title `CV för ${yrkeLitet}: exempel och mall att fylla i` (alla fem under 60, testa), description `Färdigt CV-exempel för ${yrkeLitet} och mallar att fylla i. Se vad rekryterare letar efter, välj mall och ladda ner gratis som PDF eller Word.` (testa 110 till 158; är den längre, stryk "färdigt"). H1 oförändrad.
4. Ingen text får säga "en mall för ${yrke}" eller antyda yrkesmallar.

### B4. /cv-mallar tar emot cv-mall-gratis-guide och cv-mall-pdf-gratis

`src/app/(public)/cv-mallar/components/CvMallarPageContent.tsx` får två nya GuideBlock efter "Vad gör en bra CV-mall för svenska arbetsgivare?", skrivna om (inte inklistrade) ur artiklarna, med fakta som går att belägga i källartiklarna eller produktfacit:

1. H2 "Var hittar man en gratis CV-mall?" (250 till 350 ord): de vanliga gratiskällorna (Words egna mallar under Arkiv och Nytt, Google Docs, Pages, designverktyg, oss) och vad de kostar i tid eller lås (ur cv-mall-gratis-guide "Var du hittar bra mallar gratis" och cv-mall-pdf-gratis "Var du hittar gratis CV-mallar du kan exportera till PDF"); tre malltyper att undvika (ur "Mallar du ska undvika", de tre som gäller ATS: textrutor, tabeller för layout, text i sidhuvud); vad du får gratis hos oss (Linne och Björk, en nedladdning som PDF eller Word, utan kort). Inga konkurrentnamn utom Microsoft, Google och Apple.
2. H2 "PDF eller Word?" (150 till 250 ord): skicka PDF om annonsen inte ber om annat (ur cv-mall-pdf-gratis "Varför du ska skicka ditt CV som PDF"), när Word passar, de två vanligaste misstagen när CV:t sparas som PDF; länk till `/cv-mallar/word`.
3. Nytt block "Mallar efter stil" med tre kort som länkar till /cv-mallar/word ("CV-mallar i Word", `${WORD_TEMPLATE_COUNT} mallar`), /cv-mallar/foto ("CV-mallar med bild", antal med foto), /cv-mallar/enkla ("Enkla CV-mallar", antal i en spalt). Talen ur katalogen.
4. Guidelänkar (B9): i "Vad gör en bra CV-mall ..." länka till /artiklar/hur-ska-ett-cv-se-ut ("hur ett CV ska se ut"), /artiklar/ats-vanligt-cv ("ATS-vänligt CV"), /artiklar/cv-bild-guide ("bild i CV:t"), /artiklar/cv-pa-engelska-resume ("CV på engelska").
5. FAQ (`cv-mallar-faq.ts`): lägg till högst tre frågor ur de borttagna artiklarnas FAQ som inte redan besvaras, med svar skrivna mot produktfacit. Förslag: "Var hittar jag en gratis CV-mall?", "Ska jag skicka CV:t som PDF eller Word?", "Kan jag använda Words egna CV-mallar?". Befintliga frågor ordagrant.
6. Metadata: description blir "CV-mallar för svenska jobb: ${TEMPLATE_COUNT} mallar att fylla i och ladda ner som PDF eller Word, ${FREE_TEMPLATE_COUNT} av dem gratis. Ladda upp ditt CV och se det i mallarna direkt." (148 med dagens tal; testet mäter). Title oförändrad.
7. `MallarHubGuideSection.tsx` (exempel): länken till cv-mall-gratis-guide byts till /cv-mallar.

### B5. Nya sidor efter stil: /cv-mallar/word, /cv-mallar/foto, /cv-mallar/enkla

Statiska rutter `src/app/(public)/cv-mallar/word/page.tsx` (och `foto`, `enkla`), som går före `[yrke]`. Kontrollera att ingen yrkesslug heter word, foto eller enkla. Byggs på samma komponenter och ytor som /cv-mallar (PubliktSida, Rum, pub-klasserna, mallkortet och uppladdningen); ingen ny designkomponent utan saas-leads ja. `RedirectLoggedIn` till /dashboard/cv-mallar som på /cv-mallar. Varje sida har en `opengraph-image.tsx` efter /cv-mallar:s mönster.

Gemensamma krav (grind, se 4.3): egen H1, egen title och description, minst 450 ord unik brödtext utöver mallkortens namn och rader (räknat med SEO-diffens ordräkning, minus text som också finns på /cv-mallar), minst 4 egna FAQ som inte finns på /cv-mallar eller någon annan stilsida, galleri med bara de mallar som har egenskapen (filtrerat ur MALL_KATALOG i kod), uppladdningsraden till `#ladda-upp` på /cv-mallar eller samma Uppladdning-komponent, länk upp till /cv-mallar och till de två andra stilsidorna, minst två länkar till relevanta artiklar. Schema: BreadcrumbList (Hem, CV-mallar, sidan), ItemList med de visade mallarna (namn, url till /cv-mallar/prova med mallen), FAQPage. Canonical till sig själv, index, follow. Talen i title, description och text ur konstanterna.

**/cv-mallar/word**
- Sökintention: transaktionell, "cv mall word", "modern cv mall word", "word mallar", "mallar word", "wordmall", "cv mall word gratis" (cirka 330 visningar i dag, plats 20 till 79).
- Title: `CV-mall i Word: ${WORD_TEMPLATE_COUNT} mallar att fylla i och ladda ner` (51). Description: "CV-mallar i Word med dina uppgifter redan på plats: ${WORD_TEMPLATE_COUNT} mallar som .docx, Linne och Björk gratis. Fyll i online, ladda ner Word-filen och ändra vidare." (150). H1: "CV-mallar i Word att fylla i och ladda ner".
- Innehåll: vad Word-filen är (riktig .docx, dina uppgifter på plats, samma utseende som PDF:en, typsnittet i filen); när Word är rätt (annonsen ber om redigerbart format, bemanningsföretag, du vill ändra själv) och när PDF är bättre; hur du gör (fyll i online eller ladda upp, välj Word vid nedladdning); gratis i Linne och Björk, övriga Word-mallar i Premium; om du hellre vill börja i Word själv: Words egna mallar under Arkiv och Nytt och vad du ska kontrollera (ur cv-mall-word-gratis "Var hittar man gratis cv mallar för word?" och "Tips för att använda och anpassa din word-mall", omskrivet). Ett avsnitt "Undantag i Word" om det finns kända skillnader mot PDF (fråga saas-lead P4, undantaget för långt CV i sidospaltsmallar, bc1eaca1).
- Länkar in: /cv-mallar#word ("Alla Word-mallar"), skriva-cv-guide och online-cv-byggare-gratis (A4), ats-vanligt-cv (FAQ-svaret om PDF eller Word, spår A lägger länken "CV-mallar i Word" där svaret nämner Word). Länkar ut: /artiklar/ats-vanligt-cv, /artiklar/hur-ska-ett-cv-se-ut.
- FAQ (minst): "Är CV-mallarna i Word gratis?", "Ser Word-filen likadan ut som PDF:en?", "Kan jag öppna Word-filen i Google Docs eller Pages?" (svara bara om det är testat, annars stryk frågan), "Läser rekryteringssystemen Word-filer?".

**/cv-mallar/foto**
- Sökintention: transaktionell, "cv mall med bild", "cv-mall med foto", "cv med bild mall". Frågan om man ska ha bild ägs av /artiklar/bild-i-cv-ja-eller-nej och utförandet av /artiklar/cv-bild-guide; sidan svarar inte på dem utan länkar dit.
- Title: `CV-mall med bild: ${antalFoto} mallar med plats för foto` (46). Description: "CV-mallar med bild: ${antalFoto} mallar med fotoplats, Björk gratis. Fyll i CV:t online, lägg till ditt foto i kontot och ladda ner som PDF eller Word." (testa längden; "eller Word" bara om minst en fotomall har Word, i dag 9). H1: "CV-mallar med plats för bild".
- Innehåll: var fotot sitter i mallarna (rund, fyrkantig, i huvudet, i sidospalten, ur katalogens stil-fält); fotot läggs till i kontot (produktfacit: foto vid kontot, inte utloggad); vad mallarna gör när du inte har foto (kontrollera i koden vad fotoplatsen visar tom; skriv bara det som stämmer); kort om när bild är vanligt i Sverige med länk till bild-i-cv-ja-eller-nej och tekniska krav på bilden med länk till cv-bild-guide; ATS: bilden läses inte av systemen och påverkar inte texten (bara om test:ats bekräftar det för fotomallarna).
- Länkar in: cv-bild-guide och bild-i-cv-ja-eller-nej (spår A, en mening i respektive artikels avsnitt om mallar eller layout: "[CV-mallar med plats för bild](/cv-mallar/foto)"). Länkar ut: de två artiklarna.

**/cv-mallar/enkla**
- Sökintention: "enkel cv mall", "cv mall enkel", "enkel cv-mall", "enkelt cv" (203 visningar, plats 69 till 78).
- Title: `Enkel CV-mall: ${antalEnSpalt} lugna mallar i en spalt, ${FREE_TEMPLATE_COUNT} gratis` (51). Description: "Enkla CV-mallar i en spalt som rekryteringssystemen läser rätt: ${antalEnSpalt} mallar med standardrubriker, Linne och Björk gratis som PDF eller Word." (138). H1: "Enkla CV-mallar i en spalt".
- Urval: familj `en-spalt` ur katalogen (i dag 17). 
- Innehåll: varför en spalt läses rätt och fungerar i konservativa branscher (offentlig sektor, vård, bank, juridik, ur cv-mallar-faq); när enkelt är fel val (mycket att få plats med: sidospalt); hur du gör en enkel mall personlig utan att bryta läsbarheten (färg, typsnitt, rubriker efter yrke); utbildningen först för den som har lite erfarenhet.
- Länkar in: hur-ska-ett-cv-se-ut, cv-utan-erfarenhet, cv-exempel-student-nyexaminerad (spår A, en mening var: "[Enkla CV-mallar i en spalt](/cv-mallar/enkla)"). Länkar ut: samma tre artiklar.

### B6. Yrkessidornas titlar (båda sidtyperna)

- `/cv-mallar/[yrke]/page.tsx` (de publika 69): title `CV-mall för ${namnBestamd}: välj mall och fyll i, ${FREE_TEMPLATE_COUNT} gratis`; om längre än 60: `CV-mall för ${namnBestamd}, ${FREE_TEMPLATE_COUNT} gratis`; om fortfarande längre: `CV-mall för ${namnBestamd}`. Inget tankstreck, inget versalt yrke, inget "2026", inget "gratis nedladdning". Description: `CV-mall för ${namnBestamd} med rubriker för yrket: ${TEMPLATE_COUNT} mallar som läses rätt av rekryteringssystem, ${FREE_TEMPLATE_COUNT} gratis som PDF eller Word. Se vad rekryterare letar efter.`; om över 158, stryk sista meningen. OG/Twitter följer. Product-schemat: `name` blir gratismallens namn (t.ex. "CV-mallen Linne"), `offers.price` 0 gäller den mallen; inga andra ändringar i schemat.
- `/cv-exempel/[yrke]/page.tsx` (alla 89 CV-exempel utom de fem i piloten som har egen titel, B3): title genereras i generateMetadata i stället för `metaTitle`: `CV-exempel ${yrkeLitet}: färdigt CV att utgå från`; om över 60: `CV-exempel ${yrkeLitet}: färdigt CV`; ordet "mall" får inte förekomma i titeln. Description oförändrad om den inte innehåller "mall"; innehåller den "mall", ta bort den satsen och kontrollera 110 till 158. Brevexemplen rörs inte.
- Korslänksblocket i ExempelMall för de publika paren: rubrik "Letar du efter en CV-mall för ${yrkeLitet}?" står kvar; texten blir "Se mallarna med rubriker för ${yrkeLitet} och vad rekryterare letar efter."; länktext "Se CV-mallarna för ${yrkeLitet}". Ingen text får säga att det finns en mall för yrket.
- Yrkesmallsidan länkar tillbaka till exemplet med länktext "Se ett färdigt CV-exempel för ${namnBestamd}" (kontrollera att länken finns; finns den med annan text, byt texten).

### B7. /exempel slutar konkurrera om mallorden

`src/app/(public)/exempel/page.tsx`: title "Exempel för din jobbansökan: CV och personligt brev per yrke" (60). Description: "Vi har ${TOTAL_CV_YRKEN} CV-exempel och ${TOTAL_BREV_YRKEN} exempel på personligt brev för svenska yrken. Börja med ditt yrke och se exemplet, brevet eller mallen du behöver." (testa 110 till 158). H1 rörs inte. Länken till /cv-mallar på sidan står kvar.

### B8. Sitemap (`src/app/sitemap.ts`)

- Lägg till /cv-mallar/word, /cv-mallar/foto, /cv-mallar/enkla (priority som /cv-mallar minus 0,1, changeFrequency weekly).
- Yrkesmallarna från YRKESMALL_PUBLIKA (69 i stället för 74). Kontrollera varför listan har 75 och sitemap 74 i dag och skriv orsaken i commit-meddelandet; ändra inte beteendet om det är avsiktligt.
- De tre borttagna artiklarna försvinner automatiskt (MDX borta); kontrollera.
- /cv-mallar/prova finns inte i sitemap.

### B9. Hubbens länkar

Se B4 punkt 3 och 4. Dessutom: listan "CV-mallar för ditt yrke" på /cv-mallar visar YRKESMALL_PUBLIKA plus de fem pilotyrkena med länk till /cv-exempel/<slug> (så att hubben fortfarande länkar till alla yrken).

### B10. Mätning

- QA-konton som skapas i klicktesterna i det här svepet får `is_internal` satt i PostHog när de skapas (eller e-post som matchar kohort 248676:s mönster). Skriv i QA-filen hur.
- `data-cta-klick` på alla nya länkar och knappar på stilsidorna och i pilotens mallblock.

---

## 3. Ordning och grind

1. Spår B bygger B2 till B9, kör grinden (4) mot sin gren, mergas till en integrationsgren `feat/seo-cv`.
2. Spår A bygger A1 till A7 ovanpå integrationsgrenen (länkmålen /cv-mallar/word, /foto, /enkla finns), kör grinden.
3. Hela grinden en gång på integrationsgrenen (memory: testa en gång före push), sedan push till main och IndexNow (`npx tsx scripts/indexnow.ts`). Ingen push före full grön grind.
4. QA-rapport: `docs/qa/qa-seo-cv-kluster-2026-11-17.md` med varje grindpunkt, siffror och skärmdumpar (skärmdumpar utanför git).

## 4. SEO-strategens villkor (grindkrav, alla måste vara gröna)

### 4.1 SEO-diff fel 0

- Före: `npx tsx scripts/seo-diff-artiklar.ts ta --bas https://www.jobbcoach.ai --sidor <lista> --ut docs/qa/seo-diff/seo-cv-kluster-fore.json` med listan: alla artiklar som ändras i spår A, de tre som tas bort, /cv-mallar, /verktyg/skapa-cv, /exempel, /cv-exempel, alla 74 /cv-mallar/<yrke>, alla 89 /cv-exempel/<yrke>.
- Efter: samma lista lokalt plus de tre nya sidorna. Jämför. Fel 0 utöver undantagen nedan, som läggs i förväg i `scripts/seo-baslinje/seo-cv-kluster-2026-11-17-undantag.json` med datum 2026-11-17 och skäl "SEO-strategens plan, docs/plan-seo-cv-kluster-2026-11-17.md":
  - STATUS_BYTT: de tio adresserna i B2 (200 till 308, mål enligt tabellen).
  - META_BYTT (title och/eller description): /verktyg/skapa-cv, /cv-mallar (description), /exempel, de 69 publika /cv-mallar/<yrke>, de 89 /cv-exempel/<yrke>, de fem artiklarna i A5, cv-pa-engelska-resume (description).
  - FAQ_BYTT: /verktyg/skapa-cv (två svar), /cv-mallar (högst tre nya frågor), online-cv-byggare-gratis (ett svar), skapa-cv-med-ai (ett svar), de fem piloternas /cv-exempel-sidor (frågor tillagda).
  - RUBRIK_BYTT / rubriker tillagda: /verktyg/skapa-cv (kontrollblockets rubrik, resultatblockets rubrik), /cv-mallar (tre nya H2), de fem piloternas exempelsidor (mallblocket ersätter korslänksblocket; H2 "Letar du efter en CV-mall för ..." byts mot "CV-mall för ...: välj och fyll i").
  - LANK_BYTT: alla länkar till de tre borttagna artiklarna byts mot slutmålen i A4; länkarna till /cv-mallar/<pilotslug> byts mot /cv-exempel/<pilotslug>.
  - LD_UNDANTAG: HowTo på /verktyg/skapa-cv, Product-namnet på /cv-mallar/<yrke>, ItemList på /cv-mallar (fem poster byter url), FAQPage på sidorna under FAQ_BYTT.
  - Inga andra undantag. Försvinner en rubrik, en FAQ eller en innehållslänk som inte står här: rätta, lägg inte till undantag i efterhand utan SEO-strategens ja.

### 4.2 On-page-standarden (reference_onpage_seo_standard)

- Varje title (seoTitle eller sidans title) högst 60 tecken, sökordet först, svensk versalisering; varje description 110 till 158 tecken, sökord i första halvan, inga generiska öppningar, inget utropstecken. Skriptkontroll över alla ändrade och nya sidor (artiklar via gray-matter, sidor via renderad HTML).
- FAQ: frontmatter och synliga `<FAQItem>` lika många i alla artiklar som rörts; på sidorna samma frågor i schema och synligt.
- 0 tankstreck (U+2014 och U+2013) i ändrade filer: `git diff main --stat` och grep på varje ändrad fil.
- 0 Sparkles.

### 4.3 Inga tunna sidor, ingen kannibalisering

- Stilsidorna: minst 450 ord unik brödtext var, minst 4 egna FAQ, galleri bara med mallar som har egenskapen. Mät ordräkningen och dubbletter mot /cv-mallar och varandra (ett stycke som finns ordagrant på två sidor räknas inte).
- Inga två indexerade sidor i CV-klustret får ha samma title eller samma första fem ord i title. Kontroll: lista alla titlar i sitemap under /cv-mallar, /cv-exempel, /artiklar med cv i sluggen, /verktyg/skapa-cv; inga dubbletter, och ordet "mall" i title bara på /cv-mallar, /cv-mallar/* och cv-pa-engelska-resume (seoTitle "CV på engelska: mall, ...").
- Stilsidornas H1 och title innehåller inte "gratis" som första ord (det ordet äger /cv-mallar).

### 4.4 Interna länkar

- Varje ny sida: minst 3 inkommande innehållslänkar (inte bara meny eller footer) och minst 3 utgående till relevanta sidor, enligt B5.
- Inga interna länkar till 308-adresser kvar någonstans (`grep` och SEO-diffens länklista mot listan i B2).
- Alla ankartexter beskriver målet (aldrig "klicka här", "läs mer").

### 4.5 Artikelstandarden (feedback_article_workflow)

- Faktagranskning mot produktfacit ovan och koden för varje mening om produkten; inga påhittade siffror eller citat; källhänvisningar som finns står kvar.
- Copy: vi-form, varierad meningslängd, svenska facktermer, inga slop-fraser ("i en värld", "navigera", "kraftfull", "sammanfattningsvis").
- Inga nya artikelbilder behövs (inga nya artiklar). Om en ändrad artikels bildunderlag (`docs/qa/artikelbilder/underlag/<slug>.json`) citerar en rad som ändras: gör om bilden enligt "På bordet" (`<slug>-v2.webp`, imageAlt ifyllt, raderna ordagrant ur artikeln). Kontrollerat 2026-11-17: inget underlag innehåller "sju steg".
- Tabeller bara som JSX `<table>`.

### 4.6 Övriga grindar

- `tsc`, berörda vitest (template-count-testet, mallsystemet), `npm run build` (med `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`), `npm run test:ats` oförändrat grön.
- Klicktest i riktig webbläsare (Pixel 7 och dator) som ny besökare: /verktyg/skapa-cv, de tre stilsidorna (galleri, uppladdningsraden, mall till /cv-mallar/prova), en pilotsida (mallblocket, miniatyr till prova), en publik yrkesmallsida, alla tio 308:or. Skärmdump per steg, utanför git.
- Perf för de nya sidorna inom budget för publika sidor (samma mätning som /cv-mallar), CLS 0.
- `curl` mot prod efter deploy: tio 308:or, tre nya sidor 200 med rätt title och canonical, sitemap innehåller de tre och inte de fem pilotsluggarna under /cv-mallar.

## 5. Frågor att besvara i dokumentet

Svara direkt under frågan (namn, datum, beslut). Byggarna följer förvalet om svaret inte finns när de når punkten.

### Produkt (saas-lead)

- **P1.** Piloten: mallblocket på de fem exempelsidorna med tre riktiga miniatyrer och länk till /cv-mallar/prova med yrke och mall i adressen. Förval: ja, som B3. Svar:
- **P2.** En trettonde rubrikuppsättning "Engelska" (Work experience, Education, Skills, Profile, Languages) så att vi kan erbjuda CV-mallar på engelska (252 visningar på plats 17 till 23 i dag). Förval: inte i det här svepet; tas upp i nästa mallomgång. Svar:
- **P3.** Stilsidornas galleri: samma mallkort och samma klick som /cv-mallar (till prova med mallen förvald), eller filtrerat galleri i själva mallytan? Förval: mallkort som på /cv-mallar, klick till prova. Svar:
- **P4.** /cv-mallar/word: ska Word-undantaget för långt CV i sidospaltsmallar (bc1eaca1) nämnas på sidan? Förval: ja, en mening i avsnittet om Word mot PDF. Svar:
- **P5.** Inloggade som når en stilsida: RedirectLoggedIn till /dashboard/cv-mallar (som /cv-mallar) eller till dashboardgalleriet med filtret förvalt om det finns? Förval: som /cv-mallar. Svar:
- **P6.** Demon på /verktyg/skapa-cv (SkapaCvLiveDemo, SkarmSkapaCv) speglar sju steg. Byta mot en stillbild av arket, en ny demo, eller bara ta bort stegräknaren? Förval: ta bort stegräknaren och visa arket i Linne; ny demo i senare omgång. Svar:

### Sälj (säljansvarig)

- **S1.** Knapparna på /verktyg/skapa-cv: primär "Bygg mitt CV gratis" (/register?borja=cv) står kvar. Sekundär i dag "Se mallarna" (/cv-mallar). Förslag: "Ladda upp ditt CV" till /cv-mallar#ladda-upp (ingen kontokrav, högre avsikt). Förval: förslaget. Svar:
- **S2.** Var Premium nämns på stilsidorna: en rad under galleriet med `paketMedPris(SALD_PLAN)` och vad som ingår (alla mallar, Word i alla Word-mallar, nedladdning utan tak), inget priskort högre upp. Förval: så. Svar:
- **S3.** Knapptext på mallkorten på stilsidorna och i pilotens mallblock: "Prova med ditt CV" (gratismallar och Premium lika) eller "Fyll i gratis" på Linne och Björk och "Prova med ditt CV" på Premium. Förval: det senare. Svar:
- **S4.** Nämna Jobbcoachens "tre förslag gratis" på publika sidor (/verktyg/skapa-cv, skapa-cv-med-ai, online-cv-byggare-gratis)? Sälj ville tidigare en gratis; beslutet blev tre. Förval: ja, med talet ur konstanten. Svar:
- **S5.** CTA-ordning i pilotens mallblock: mallarna först, sedan "Se alla mallar", sist "Ladda upp ditt CV"; eller uppladdningen först? Förval: mallarna först. Svar:
- **S6.** Under Black Week (23 till 30 november) ligger priset i texterna via KampanjVarianter där de finns. Stilsidorna är nya: ska de få kampanjpriset? Förval: ja om det går med befintlig komponent före frysen, annars ordinarie pris. Svar:

## 6. Preliminär indexeringslista (Search Console, i prioordning)

Begärs av ägaren i Search Console efter push och efter att `curl` mot prod visat rätt svar. Search Console tar runt tio adresser per dag; dela på två dagar om det behövs (rad 1 till 10 första dagen).

1. https://www.jobbcoach.ai/verktyg/skapa-cv: ny huvudtext om nya byggaren, CV-sidan som konverterar bäst (3 konton av 15 sessioner).
2. https://www.jobbcoach.ai/cv-mallar: hubben har tagit över cv-mall-gratis-guide och cv-mall-pdf-gratis, 40 mallar, ny description; ska äga "cv mall".
3. https://www.jobbcoach.ai/cv-mallar/word: ny sida, vår tydligaste fördel (26 mallar som riktig Word-fil), mål för 301 från cv-mall-word-gratis.
4. https://www.jobbcoach.ai/artiklar/online-cv-byggare-gratis: okänd för Google, ny text om byggaren, vår sida för "gratis cv-byggare".
5. https://www.jobbcoach.ai/cv-exempel/saljare: pilot, tar emot 301 och båda sökintentionerna.
6. https://www.jobbcoach.ai/cv-exempel/barnskotare: pilot.
7. https://www.jobbcoach.ai/cv-exempel/ingenjor: pilot.
8. https://www.jobbcoach.ai/cv-exempel/larare: pilot.
9. https://www.jobbcoach.ai/cv-exempel/butikssaljare: pilot.
10. https://www.jobbcoach.ai/cv-mallar/enkla: ny sida.
11. https://www.jobbcoach.ai/cv-mallar/foto: ny sida.
12. https://www.jobbcoach.ai/artiklar/skapa-cv-med-ai: säljer Jobbcoachens punkter; startsidan syns för "ai cv" utan att svara på det.
13. https://www.jobbcoach.ai/artiklar/cv-profil-sammanfattning: okänd för Google sedan minst 90 dagar.
14. https://www.jobbcoach.ai/exempel: ny title, slutar konkurrera om mallorden.
15. https://www.jobbcoach.ai/artiklar/cv-pa-engelska-resume: ska ta "cv engelska mall" från brevartikeln.

De borttagna artiklarnas gamla adresser begärs inte; Google hittar 308:orna själv. Övriga ändrade artiklar och yrkessidor tas av IndexNow och vanlig genomsökning.

**Avläsning:** 8 december (byggarsidan, artikel till /cv-mallar, indexering, CTR i A5), 14 december (/verktyg/cv-mallar ur index), 12 januari (huvudord på /cv-mallar, stilsidorna, piloten mot kontrollgruppen: klick och snittposition på de delade frågorna; beslut om de övriga 69 paren).
