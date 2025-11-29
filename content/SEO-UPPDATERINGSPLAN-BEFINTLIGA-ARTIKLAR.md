# SEO Uppdateringsplan: Befintliga artiklar om personliga brev

> Skapad: 2025-11-29
> Uppdaterad: 2025-11-29
> Syfte: Uppdatera befintliga artiklar med länkar till /personligt-brev-exempel och byta ut generella CTAs mot yrkesspecifika exempel

---

## ✅ Genomfört

### Komponenten `PersonligtBrevPreview`
- [x] Skapad och implementerad i `/src/components/mdx/PersonligtBrevPreview.tsx`
- [x] Registrerad i artikelsidans MDX-components (`/src/app/artiklar/[slug]/page.tsx`)
- [x] Stöd för 6 yrken: student, undersköterska, säljare, ekonomiassistent, lagerarbetare, butikssäljare
- [x] Integrerar `InteractiveLetterPreview` med mall- och typsnittsväljare
- [x] `not-prose` klass för korrekt styling i artikelkontext

### Våg 1 artiklar - delvis klara
- [x] **personligt-brev-exempel-generella.mdx** - Komponent tillagd (student) + snippets-sektion omskriven
- [x] **hur-skriver-man-ett-personligt-brev.mdx** - Komponent tillagd (säljare)
- [x] **personligt-brev-mall-gratis.mdx** - Komponent tillagd (undersköterska)
- [ ] tips-pa-personligt-brev.mdx
- [ ] skriva-personligt-brev-guide.mdx

---

## Översikt

Vi har **24 befintliga artiklar** om personliga brev som behöver uppdateras för att:
1. Länka till nya /personligt-brev-exempel-sidor
2. ✅ Ersätta generella modaler med `<PersonligtBrevPreview>`-komponenten
3. Förbättra intern länkning för SEO
4. Säkerställa att schema markup är korrekt

---

## Komponent: PersonligtBrevPreview ✅ IMPLEMENTERAD

### Syfte
Interaktiv komponent som visar riktiga personliga brev-exempel med design/typsnitt-väljare. Ersätter generella CTAs och statiska exempeltexter.

### Props
```typescript
interface PersonligtBrevPreviewProps {
  yrke?: 'student' | 'underskoterska' | 'saljare' | 'ekonomiassistent' | 'lagerarbetare' | 'butikssaljare'
}
```

### Användning i MDX
```mdx
<PersonligtBrevPreview yrke="student" />
```

### Funktioner
- Interaktiv mallväljare (4 mallar: Klassisk, Modern, Minimalistisk, Kreativ)
- Typsnittsväljare (4 typsnitt: Georgia, Arial, Helvetica, Times)
- CTA-footer med länk till /dashboard/skapa-brev
- Info-box om förhandsvisningen
- Responsiv design
- Isolerad från prose-styling med `not-prose`

### Placering i artiklar
Komponenten ska placeras:
1. Efter en introduktionstext som förklarar vad läsaren kommer se
2. Före listor/punkter som refererar till exemplet ("Genom att analysera exemplet ovan kan du...")
3. Naturligt integrerat med omgivande text - inte bara "dumpad" mitt i

---

## Prioriteringsordning

### Våg 1: Högsta prioritet (5 artiklar)
Dessa har högst trafik och störst SEO-potential.

| # | Artikel | Fil | Primära sökord | Uppdateringar |
|---|---------|-----|----------------|---------------|
| 1 | Personligt brev exempel | `personligt-brev-exempel-generella.mdx` | personligt brev exempel (4400), exempel personligt brev (2900) | Länka till alla 30 yrkessidor, lägg till yrkesväljare, uppdatera intro |
| 2 | Hur skriver man ett personligt brev? | `hur-skriver-man-ett-personligt-brev.mdx` | hur skriver man ett personligt brev (2400), skriva personligt brev (720) | Lägg till 3-5 `<PersonligtBrevExempel>` för populära yrken, intern länkning |
| 3 | Personligt brev mall gratis | `personligt-brev-mall-gratis.mdx` | personligt brev mall (2400), personligt brev mall gratis (390) | Länka till yrkesspecifika mallar, visa exempel-komponent |
| 4 | Tips på personligt brev | `tips-pa-personligt-brev.mdx` | tips personligt brev (480), bra personligt brev tips (170) | Komplettera tips med konkreta exempel från /personligt-brev-exempel |
| 5 | Skriva personligt brev guide | `skriva-personligt-brev-guide.mdx` | skriva personligt brev (720), personligt brev guide (110) | Integrera 2-3 yrkesexempel som visar principerna i praktiken |

### Våg 2: Medelhög prioritet (6 artiklar)
Bra trafik, tydlig koppling till nya sidor.

| # | Artikel | Fil | Primära sökord | Uppdateringar |
|---|---------|-----|----------------|---------------|
| 6 | Inleda personligt brev | `inleda-personligt-brev.mdx` | inledning personligt brev (720), börja personligt brev (260) | Visa inledningar från 3-4 olika yrkesexempel |
| 7 | Hur avslutar man personligt brev | `hur-avslutar-man-ett-personligt-brev.mdx` | avsluta personligt brev (390), avslutning personligt brev (320) | Visa avslutningar från olika yrkesexempel |
| 8 | Struktur och innehåll | `personligt-brev-struktur-innehall.mdx` | personligt brev struktur (210), personligt brev innehåll (170) | Strukturexempel från faktiska brev |
| 9 | Bra personligt brev | `bra-personligt-brev.mdx` | bra personligt brev (390), perfekt personligt brev (90) | Visa "före/efter" eller bästa exempel |
| 10 | Vad ska finnas med | `personligt-brev-vad-ska-finnas-med.mdx` | vad ska finnas med i personligt brev (110) | Checklista + konkreta exempel |
| 11 | Layout personligt brev | `personligt-brev-layout.mdx` | personligt brev layout (170), utformning personligt brev (90) | Visa designväljaren, länka till mallar |

### Våg 3: Standard prioritet (13 artiklar)
Lägg till grundläggande intern länkning.

| # | Artikel | Fil | Uppdatering |
|---|---------|-----|-------------|
| 12 | Kort personligt brev | `kort-personligt-brev.mdx` | Länka till 2-3 korta exempel |
| 13 | Personligt brev längd | `personligt-brev-langd.mdx` | Länka till exempel med olika längder |
| 14 | Personligt brev rubrik | `personligt-brev-rubrik.mdx` | Visa rubriker från yrkesexempel |
| 15 | Personligt brev utan erfarenhet | `personligt-brev-utan-erfarenhet.mdx` | Länka till student, praktikant-exempel |
| 16 | Personligt brev spontanansökan | `personligt-brev-spontanansökan.mdx` | Relevant yrkesexempel |
| 17 | Personligt brev internt jobb | `personligt-brev-internt-jobb.mdx` | Allmän länkning |
| 18 | Personligt brev karriärbyte | `personligt-brev-karriarbyte.mdx` | Relevanta yrkesexempel |
| 19 | Personligt brev första jobbet | `personligt-brev-forsta-jobbet.mdx` | Länka till student-exempel |
| 20 | Personligt brev deltid | `personligt-brev-deltidsjobb.mdx` | Relevanta exempel |
| 21 | Personligt brev sommarjobb | `personligt-brev-sommarjobb.mdx` | Länka till student, butik-exempel |
| 22 | Personligt brev praktik | `personligt-brev-praktikplats.mdx` | Länka till student-exempel |
| 23 | Personligt brev extrajobb | `personligt-brev-extrajobb.mdx` | Länka till relevanta yrken |
| 24 | Motivation i personligt brev | `motivation-personligt-brev.mdx` | Visa motivationsexempel från brev |

---

## Schema Markup Status

### Befintlig status
Alla nyckelartiklar har redan **FAQPage schema** implementerat via frontmatter.

### Rekommenderade tillägg

#### 1. HowTo Schema (för guide-artiklar)
```json
{
  "@type": "HowTo",
  "name": "Hur skriver man ett personligt brev?",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Researcha företaget",
      "text": "..."
    }
  ]
}
```

**Artiklar att lägga till HowTo:**
- hur-skriver-man-ett-personligt-brev.mdx
- skriva-personligt-brev-guide.mdx
- inleda-personligt-brev.mdx
- hur-avslutar-man-ett-personligt-brev.mdx

#### 2. Article Schema med Speakable
```json
{
  "@type": "Article",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".intro", ".key-points"]
  }
}
```

**Artiklar för Speakable:**
- tips-pa-personligt-brev.mdx
- bra-personligt-brev.mdx

---

## Intern länkstruktur

### Från varje artikel, länka till:
1. **Huvudsidan**: /personligt-brev-exempel
2. **3-5 relevanta yrkessidor**: /personligt-brev-exempel/[yrke]
3. **Verktyget**: /verktyg/personligt-brev

### Ankarlänkar att använda
```markdown
[Se exempel på personliga brev för 30+ yrken →](/personligt-brev-exempel)
[Personligt brev för student](/personligt-brev-exempel/student)
[Skapa ditt personliga brev gratis →](/verktyg/personligt-brev)
```

---

## Tillgängliga yrken för länkning

Dessa 30 yrkessidor finns på /personligt-brev-exempel/[yrke]:

**Populära (länka ofta):**
- student, lärare, sjuksköterska, säljare, ekonomiassistent
- kundtjänst, administratör, projektledare, marknadsförare

**Övriga:**
- butikssäljare, personlig-assistent, redovisningsekonom, hr-assistent
- lagerarbetare, receptionist, chef, inköpare, systemutvecklare
- undersköterska, elektriker, barnskötare, kock, servitör
- fastighetsskötare, account-manager, eventkoordinator
- copywriter, ux-designer, dataanalytiker

---

## Implementeringsordning

### ✅ Steg 1: Skapa komponenten (KLART)
1. ✅ Skapat `PersonligtBrevPreview.tsx` i /src/components/mdx/
2. ✅ Implementerat design/typsnitt-väljare (via InteractiveLetterPreview)
3. ✅ Brevdata för 6 populära yrken inbäddad i komponenten

### 🔄 Steg 2: Uppdatera Våg 1-artiklar (3/5 KLARA)
1. ✅ personligt-brev-exempel-generella.mdx - Komponent + omskriven snippets-sektion
2. ✅ hur-skriver-man-ett-personligt-brev.mdx - Komponent tillagd
3. ✅ personligt-brev-mall-gratis.mdx - Komponent tillagd
4. ⏳ tips-pa-personligt-brev.mdx
5. ⏳ skriva-personligt-brev-guide.mdx

### ⏳ Steg 3: Uppdatera Våg 2-artiklar
6-11 enligt listan ovan

### ⏳ Steg 4: Uppdatera Våg 3-artiklar
12-24 med grundläggande intern länkning

### ⏳ Steg 5: Schema markup
- Lägg till HowTo schema på guide-artiklar
- Lägg till Speakable på tips-artiklar

---

## Copywriting-riktlinjer för artiklar

### Undvik generiska mallar med platshållare

**Fel (undvik):**
```markdown
*   **(Direkt & kopplad till behov):** "Med min bakgrund inom [område X] och er uttalade satsning på [företagets mål Y]..."
*   **(Resultatfokuserad):** "Att ha lyckats [imponerande resultat, t.ex. öka konverteringen med X %]..."
```

**Problem:**
- Parenteser i listor är svårlästa
- [Platshållare] bryter läsflödet
- Användaren måste dekoda mallen istället för att inspireras

**Rätt (använd):**
```markdown
### Starka inledningar

**Koppla direkt till företagets behov**
> "Med min erfarenhet av att digitalisera kundtjänst och era planer på att bygga om supportflödet ser jag en perfekt matchning i rollen som Customer Success Manager."

**Varför det fungerar:** Du visar att du läst om företaget OCH att du kan lösa deras faktiska problem.
```

### Principer för exempel-sektioner

1. **Konkreta exempel istället för mallar** – Visa riktiga meningar från verkliga branscher
2. **Blockquotes (>) för citat** – Visuellt tydligt vad som är exempel vs förklaring
3. **"Varför det fungerar" efter varje exempel** – Pedagogiskt värde utan att vara nedlåtande
4. **Horisontella linjer (---) mellan exempel** – Tydlig visuell separation
5. **Rubriker istället för parenteser** – "Koppla direkt till företagets behov" istället för "(Direkt & kopplad till behov)"
6. **Appliceringsexempel** – Visa hur läsaren kan använda principen med sin egen erfarenhet

### Implementerat i

- [x] personligt-brev-exempel-generella.mdx (sektion "Inspiration: Så här kan olika delar av brevet se ut")

### Artiklar som behöver samma behandling

Granska och uppdatera liknande sektioner i:
- [ ] hur-skriver-man-ett-personligt-brev.mdx
- [ ] tips-pa-personligt-brev.mdx
- [ ] inleda-personligt-brev.mdx
- [ ] hur-avslutar-man-ett-personligt-brev.mdx
- [ ] bra-personligt-brev.mdx

---

## Mätpunkter

Efter implementering, mät:
- Organisk trafik till /personligt-brev-exempel/*
- Klickfrekvens från artiklar till yrkessidor
- Tid på sida för uppdaterade artiklar
- Konverteringar till /verktyg/personligt-brev

---

*Denna plan är framtagen av SEO-agenten baserat på keyword-analys och befintligt innehåll.*
