# Implementation Guide: Personligt Brev Exempel Student

## När copy-agenten levererat innehållet

När copy-agenten har skrivit allt innehåll enligt `content-brief-student.md` ska du lägga till det i systemet genom att uppdatera filen:

**Fil att redigera:** `c:/Users/chris/cvbrev/src/app/personligt-brev-exempel/[yrke]/page.tsx`

---

## Steg 1: Lägg till 'student' i exampleData

Öppna `page.tsx` och hitta objektet `exampleData` (börjar på rad 6).

Lägg till följande struktur efter befintliga exempel (t.ex. efter 'underskoterska'):

```typescript
'student': {
  yrke: 'Student',
  sokvolym: 700,
  metaTitle: 'Personligt Brev Student – Exempel Sommarjobb | Jobbcoach.ai',
  metaDescription: 'Se ett professionellt personligt brev-exempel för studenter som söker sommarjobb eller extrajobb. ATS-optimerat, skrivet av experter. Tips för studenter utan erfarenhet.',

  // SEO-rik introduktion (200-300 ord från copy-agenten)
  seoIntro: `
[COPY-AGENTEN SKRIVER DETTA]

Exempel på innehåll:
Söker du sommarjobb eller extrajobb som student och behöver skriva ett personligt brev som sticker ut? Det här exemplet visar hur du skriver ett ATS-optimerat personligt brev som passar svenska arbetsgivare inom retail, restaurang och kundservice. Du får se exakt hur du balanserar akademiska meriter (kurser, projekt, grupparbeten) med praktisk erfarenhet från volontärarbete, studentföreningar och tidigare sommarjobb...
[fortsättning...]
  `,

  intro: 'Ett professionellt personligt brev-exempel för studenter som söker sommarjobb, extrajobb eller traineeprogram. Optimerat för ATS-system och svenska arbetsgivare inom retail, restaurang och kundservice.',

  exempelBrev: {
    namn: 'Erik Johansson',
    adress: 'Vasagatan 45, 411 24 Göteborg',
    telefon: '070-234 56 78',
    epost: 'erik.johansson@student.gu.se',
    arbetsgivare: 'Gekås Ullared',
    roll: 'Sommarjobb som säljare',
    datum: new Date().toLocaleDateString('sv-SE'),
    brevText: `[COPY-AGENTEN SKRIVER BREVTEXTEN HÄR – 350 ord, 5 stycken]

Exempel på struktur:
Hej,

Jag söker sommarjobb som säljare på Gekås Ullared och läser andra året på ekonomiprogrammet vid Göteborgs universitet. [Fortsätter enligt content brief stycke 1...]

[Stycke 2 om erfarenhet från café och festivalen...]

[Stycke 3 om studier och överförbara färdigheter...]

[Stycke 4 om varför Gekås specifikt...]

[Stycke 5 om tillgänglighet och kontaktuppgifter...]

Med vänliga hälsningar,
Erik Johansson`
  },

  varforDetFungerar: [
    {
      titel: 'Betonar överförbara färdigheter från studier och extrajobb',
      beskrivning: '[COPY-AGENTEN SKRIVER 50-70 ord som förklarar varför detta är en styrka]'
    },
    {
      titel: 'Kvantifierar erfarenhet med konkreta siffror',
      beskrivning: '[50-70 ord]'
    },
    {
      titel: 'Visar tydlig tillgänglighet och flexibilitet',
      beskrivning: '[50-70 ord]'
    },
    {
      titel: 'Kopplar akademiska studier direkt till jobbet',
      beskrivning: '[50-70 ord]'
    },
    {
      titel: 'Ärlig om studentstatus men fokuserar på värde',
      beskrivning: '[50-70 ord]'
    }
  ],

  tips: [
    {
      rubrik: 'Fokusera på överförbara färdigheter från studier',
      text: '[COPY-AGENTEN SKRIVER 80-100 ord med praktiska råd om hur studenter kan lyfta akademiska färdigheter]'
    },
    {
      rubrik: 'Lyft volontärarbete och föreningsengagemang',
      text: '[80-100 ord]'
    },
    {
      rubrik: 'Var tydlig med tillgänglighet och flexibilitet',
      text: '[80-100 ord]'
    },
    {
      rubrik: 'Konkretisera akademiska projekt som arbetslivserfarenhet',
      text: '[80-100 ord]'
    },
    {
      rubrik: 'Visa lärvilja och flexibilitet utan att sälja dig själv kort',
      text: '[80-100 ord]'
    }
  ],

  faq: [
    {
      q: 'Hur skriver jag personligt brev utan arbetslivserfarenhet?',
      a: '[COPY-AGENTEN SKRIVER 60-90 ord svar]'
    },
    {
      q: 'Ska jag nämna mitt gymnasiebetyg eller universitetsbetyg?',
      a: '[60-90 ord]'
    },
    {
      q: 'Hur visar jag att jag kan kombinera jobb och studier?',
      a: '[60-90 ord]'
    },
    {
      q: 'Ska jag nämna att det är sommarjobb/extrajobb jag söker?',
      a: '[60-90 ord]'
    },
    {
      q: 'Hur lång ska ett personligt brev vara för student?',
      a: '[60-90 ord]'
    },
    {
      q: 'Vilka kurser är värda att nämna?',
      a: '[60-90 ord]'
    },
    {
      q: 'Hur skriver jag om studierelaterade projekt?',
      a: '[60-90 ord]'
    },
    {
      q: 'Ska jag nämna studentföreningar och engagemang?',
      a: '[60-90 ord]'
    },
    {
      q: 'Hur visar jag motivation trots tillfällig anställning?',
      a: '[60-90 ord]'
    }
  ],

  // Relaterade artiklar (dessa finns ej ännu – förslag till framtida innehåll)
  relateradeArtiklar: [
    {
      titel: 'Sommarjobb för studenter 2025: så hittar du de bästa tjänsterna',
      slug: 'sommarjobb-studenter-guide'
    },
    {
      titel: 'CV-tips för studenter utan arbetslivserfarenhet',
      slug: 'cv-tips-studenter-utan-erfarenhet'
    },
    {
      titel: 'Extrajobb vid sidan av studier: så lyckas du kombinera jobb och universitet',
      slug: 'extrajobb-kombinera-studier'
    },
    {
      titel: 'Traineeprogram för studenter: komplett guide till ansökan och intervju',
      slug: 'traineeprogram-studenter-guide'
    }
  ],

  // Relaterade verktyg
  relateradeVerktyg: [
    {
      namn: 'CV-Mallar för Studenter',
      slug: '/verktyg/cv-mallar',
      beskrivning: 'Professionella CV-mallar anpassade för studenter med fokus på utbildning, projekt och volontärarbete. ATS-optimerade och enkla att fylla i.'
    },
    {
      namn: 'Personligt Brev-verktyget',
      slug: '/dashboard/skapa-brev',
      beskrivning: 'Skapa ett skräddarsytt personligt brev på 5 minuter. Ladda upp ditt CV, klistra in jobbannonsen – verktyget anpassar innehållet för dig.'
    },
    {
      namn: 'Jobbcoachen – Karriärråd',
      slug: '/dashboard/jobbcoachen',
      beskrivning: 'Få personliga råd om din jobbsökning, intervjuförberedelse och karriärväg från vår AI-coach. Specialiserad på studenter och nyutexaminerade.'
    }
  ],

  relaterade: [
    { yrke: 'Sommarjobbare', slug: 'sommarjobbare' },
    { yrke: 'Butiksmedarbetare', slug: 'butiksmedarbetare' },
    { yrke: 'Serveringspersonal', slug: 'serveringspersonal' }
  ]
}
```

---

## Steg 2: Verifiera att URL:en fungerar

Efter att du lagt till koden:

1. Spara filen
2. Starta dev-servern: `npm run dev`
3. Navigera till: `http://localhost:3000/personligt-brev-exempel/student`
4. Kontrollera att:
   - Sidan laddas utan fel
   - Brevexemplet visas korrekt i InteractiveLetterPreview
   - Alla sektioner renderas (Tips, Analys, FAQ, Relaterade artiklar, Verktyg)
   - Metadata är korrekt (kolla sidans title och meta description i HTML)

---

## Steg 3: SEO-verifiering

Kontrollera att SEO-elementen fungerar:

### Schema Markup
Öppna sidans källkod (högerklicka → Visa sidkälla) och verifiera att det finns 4 script-taggar med JSON-LD schema:

1. **Article Schema** – innehåller brevtexten som `articleBody`
2. **FAQPage Schema** – innehåller alla FAQ-frågor som `Question` och `Answer`
3. **HowTo Schema** – innehåller alla tips som `HowToStep`
4. **BreadcrumbList Schema** – innehåller navigation (Hem → Personligt brev exempel → Student)

### Metadata
Verifiera i `<head>`:
- `<title>` är "Personligt Brev Student – Exempel Sommarjobb | Jobbcoach.ai"
- `<meta name="description">` innehåller rätt meta description
- `<link rel="canonical">` pekar på `https://jobbcoach.ai/personligt-brev-exempel/student`
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`)
- Twitter Card tags

---

## Steg 4: Innehållskvalitet – Slutkontroll

Innan du godkänner innehållet från copy-agenten, kontrollera:

### Brevexempel (350 ord)
- [ ] Exakt 5 stycken enligt content brief
- [ ] Innehåller minst 5 kvantifieringar (siffror: "200+ kunder", "15 personer", etc.)
- [ ] Nämner specifika företag/platser (Café Lilla Paris, Gekås, Way Out West)
- [ ] Konkreta kurser (Marknadsföring A, Företagsekonomi B)
- [ ] Tydlig tillgänglighet (juni-augusti)
- [ ] Ingen användning av buzzwords ("kraftfull", "innovativ", "passionerad")
- [ ] Låter som en riktig student skrev det (inte AI-genererat fluff)

### Tips (5 st, 400-500 ord totalt)
- [ ] Varje tips är praktiskt och användbart
- [ ] Konkreta exempel i varje tips
- [ ] Inga vaga påståenden utan bevis
- [ ] Tonen är uppmuntrande men realistisk

### FAQ (7-9 frågor, 500-700 ord totalt)
- [ ] Frågorna är verkliga frågor studenter faktiskt har
- [ ] Svaren är konkreta och praktiska (inte generiska)
- [ ] Varje svar är 60-90 ord
- [ ] Inga buzzwords eller AI-fluff

### "Varför det fungerar" (5 punkter, 250-350 ord)
- [ ] Analytisk ton (inte säljande)
- [ ] Förklarar VARFÖR brevet är bra (inte bara VAD det innehåller)
- [ ] Varje punkt 50-70 ord

### seoIntro (200-300 ord)
- [ ] Innehåller primärt keyword "personligt brev student" tidigt
- [ ] Inkluderar sekundära keywords naturligt
- [ ] Läsbar och engagerande (inte keyword-stuffing)
- [ ] Förklarar värdet av sidan för användaren

---

## Steg 5: Test i produktion

När allt är klart och verifierat lokalt:

### A. Deployment
1. Commit ändringarna:
   ```bash
   git add src/app/personligt-brev-exempel/[yrke]/page.tsx
   git commit -m "CONTENT: Lägg till personligt brev-exempel för student

   - Sommarjobb-fokuserat exempel (Gekås Ullared)
   - 5 studentspecifika tips
   - 9 FAQ för studenter utan arbetslivserfarenhet
   - SEO-optimerat för 'personligt brev student' (700 sökningar/månad)
   - Relaterade artiklar och verktyg för studenter

   🤖 Generated with Claude Code https://claude.com/claude-code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. Push till main (eller skapa PR om ni kör feature branches)

3. Vänta på deployment (Vercel/Netlify bygger automatiskt)

### B. Post-deployment verifiering

När sidan är live på `https://jobbcoach.ai/personligt-brev-exempel/student`:

#### 1. Google Search Console
- Skicka in URL:en för indexering via "URL Inspection"
- Kontrollera att sidan kan indexeras (inga crawl-fel)

#### 2. Rich Results Test
- Testa på: https://search.google.com/test/rich-results
- Verifiera att Article, FAQPage, HowTo och Breadcrumb schema validerar utan fel

#### 3. PageSpeed Insights
- Testa på: https://pagespeed.web.dev/
- Säkerställ att Core Web Vitals är gröna (särskilt LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### 4. Mobile-Friendly Test
- Testa på: https://search.google.com/test/mobile-friendly
- Verifiera att sidan är mobilanpassad

#### 5. Internal Linking
- Navigera till `/personligt-brev-exempel` (hub-sidan)
- Kontrollera att "Student" finns som ett av de tillgängliga exemplen

---

## Steg 6: Intern länkning och distribution

### Lägg till interna länkar TILL student-sidan från:

1. **Bloggartiklar om studenter** (när de skapas):
   - "Sommarjobb för studenter 2025" → länka till `/personligt-brev-exempel/student`
   - "CV-tips för studenter" → länka till exemplet
   - Använd anchor text: "personligt brev-exempel för studenter"

2. **Relaterade exempel-sidor:**
   - `/personligt-brev-exempel/butiksmedarbetare` → lägg till "Student" i `relaterade`
   - `/personligt-brev-exempel/serveringspersonal` → lägg till "Student" i `relaterade`

3. **Verktyg:**
   - `/dashboard/skapa-brev` → lägg till "Se exempel för studenter" i hjälpsektion
   - `/verktyg/cv-mallar` → länka till personligt brev-exemplet

### Social distribution (valfritt men rekommenderat):

- **LinkedIn:** Dela sidan med text om varför studenter behöver anpassa sitt brev
- **Facebook grupper:** Dela i svenska studentgrupper (med respekt för gruppernas regler)
- **Reddit:** r/sweden, r/universityadmissions (svenska trådar)
- **Nyhetsbrev:** Inkludera i nästa utskick om det finns en student-segment

---

## Steg 7: Tracking och optimering

### Google Analytics
Skapa en event för att tracka engagemang på student-sidan:

- Event: `view_student_example`
- Parametrar: `yrke: 'student'`, `section: 'exempel|tips|faq|analys'`

Tracka också:
- Klick på "Skapa mitt personliga brev" (CTA)
- Tid på sida (bör vara 2-3 minuter för engagerade läsare)
- Scroll depth (>75% = starkt engagemang)

### A/B-testing möjligheter (framtida optimering):

1. **Brevexempel:**
   - Testa Gekås vs ICA vs Café som arbetsgivare (vilket resonerar bäst?)
   - Testa olika kandidatprofiler (ekonomistudent vs ingenjörsstudent)

2. **CTA-placering:**
   - Testa placering av "Skapa mitt personliga brev"-knapp (topp vs efter exempel vs sticky)

3. **seoIntro:**
   - Testa längre (300 ord) vs kortare (200 ord) introduktion

4. **FAQ-expansion:**
   - Testa om alla FAQ ska vara expanderade som standard vs ihopfällda

---

## Vanliga problem och lösningar

### Problem: Sidan visar 404
**Lösning:** Kontrollera att slug:en är exakt `'student'` (gemener, inga mellanslag) i exampleData-objektet.

### Problem: Schema validerar inte
**Lösning:** Kontrollera att alla citationstecken i JSON-LD är escaped korrekt. Använd backticks (`) för brevText istället för dubbelfnuttar.

### Problem: Brevtexten renderas inte korrekt
**Lösning:** Kontrollera att line breaks är preserved i brevText. Använd `\n\n` för styckebrytningar.

### Problem: Related artiklar visar "Kommer snart"
**Lösning:** Detta är förväntat – artiklarna finns inte ännu. Det är OK, de fungerar som "content teasers" för framtida innehåll.

### Problem: Sidan laddar långsamt
**Lösning:** InteractiveLetterPreview är lazy-loaded med SSR disabled. Om problemet kvarstår, kontrollera att Framer Motion inte orsakar re-renders.

---

## SEO Timeline och Förväntningar

### Vecka 1-2: Indexering
- Google indexerar sidan (submitta via Search Console för snabbare indexering)
- Sidan börjar dyka upp för branded searches ("jobbcoach student", "jobbcoach personligt brev student")

### Vecka 3-4: Initial ranking
- Sidan börjar ranka för long-tail keywords ("hur skriver man personligt brev som student")
- Första impressions och klick i GSC

### Månad 2-3: Ranking-förbättring
- Sidan klättrar för primärt keyword "personligt brev student" (mål: topp 10)
- FAQ-snippets börjar dyka upp i featured snippets

### Månad 4-6: Etablering
- Sidan rankar topp 5 för "personligt brev student"
- Genererar 200-400 organiska besök/månad (baserat på CTR 30-40%)
- Featured snippets för minst 2-3 FAQ-frågor

### Månad 6-12: Dominerande position
- Sidan rankar topp 3 för huvudkeyword
- Genererar 400-700 organiska besök/månad
- Backlinks från studentbloggar och karriärsidor

**Kritiska framgångsfaktorer:**
1. Innehållskvalitet (måste vara BÄTTRE än Monster, Indeed, CVmall.se)
2. Interna länkar från bloggar och verktyg
3. Backlinks från relevanta studentsidor
4. User engagement (tid på sida, CTR i SERP)

---

## Checklista innan go-live

- [ ] Copy-agenten levererat allt innehåll enligt content brief
- [ ] Innehållet är kvalitetsgranskad (ingen buzzwords, konkreta exempel, rätt ordantal)
- [ ] Data tillagd i `exampleData` enligt guide ovan
- [ ] Lokal test lyckad (sidan laddar på localhost:3000)
- [ ] Schema markup validerad (Rich Results Test)
- [ ] Metadata korrekt (title, description, canonical)
- [ ] Mobilvänlighet verifierad
- [ ] Internal linking uppdaterad (hub-sida + relaterade exempel)
- [ ] Git commit och push till produktion
- [ ] Sidan live och tillgänglig på jobbcoach.ai
- [ ] Submitta till Google Search Console för indexering
- [ ] Analytics events konfigurerade
- [ ] Social distribution planerad (valfritt)

---

## Nästa steg efter go-live

1. **Övervaka prestanda i Google Search Console:**
   - Veckovis check av impressions, clicks, CTR, average position
   - Identifiera queries som driver trafik

2. **Skapa stödjande innehåll:**
   - Skriv artiklarna i `relateradeArtiklar` (de ger boost till student-sidan via intern länkning)
   - Skapa blogginlägg som länkar till exemplet

3. **Optimera baserat på data:**
   - Om CTR är låg: testa ny meta description
   - Om bounce rate är hög: förbättra seoIntro eller brevexempel
   - Om ranking är svag: bygg fler backlinks

4. **Skala konceptet:**
   - Skapa liknande sidor för andra nischer: "trainee", "graduate", "nyexaminerad"
   - Bygg cluster av student-relaterade sidor för topical authority

---

**Lycka till med implementationen!** 🚀

Om du stöter på problem, kontakta utvecklingsteamet eller SEO-ansvarig.
