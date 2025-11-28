# SEO Uppdateringsplan: Befintliga artiklar om personliga brev

> Skapad: 2025-11-29
> Syfte: Uppdatera befintliga artiklar med länkar till /personligt-brev-exempel och byta ut generella CTAs mot yrkesspecifika exempel

---

## Översikt

Vi har **24 befintliga artiklar** om personliga brev som behöver uppdateras för att:
1. Länka till nya /personligt-brev-exempel-sidor
2. Ersätta generella modaler med `<PersonligtBrevExempel>`-komponenten
3. Förbättra intern länkning för SEO
4. Säkerställa att schema markup är korrekt

---

## Ny komponent: PersonligtBrevExempel

### Syfte
Ersätt generella CTAs med en interaktiv komponent som visar riktiga personliga brev-exempel med design/typsnitt-väljare.

### Props
```typescript
interface PersonligtBrevExempelProps {
  yrke: string;              // t.ex. "student", "lärare", "sjuksköterska"
  showDesignPicker?: boolean; // visa design/typsnitt-väljare
  variant?: 'compact' | 'full'; // kompakt för inline, full för section
  cta?: {
    text: string;
    href: string;
  };
}
```

### Användning i MDX
```mdx
<PersonligtBrevExempel
  yrke="student"
  variant="full"
  showDesignPicker={true}
  cta={{ text: "Skapa ditt personliga brev", href: "/verktyg/personligt-brev" }}
/>
```

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

### Steg 1: Skapa komponenten
1. Skapa `PersonligtBrevExempel.tsx` i /src/components/
2. Implementera design/typsnitt-väljare
3. Hämta data från befintliga yrkessidor

### Steg 2: Uppdatera Våg 1-artiklar
1. personligt-brev-exempel-generella.mdx
2. hur-skriver-man-ett-personligt-brev.mdx
3. personligt-brev-mall-gratis.mdx
4. tips-pa-personligt-brev.mdx
5. skriva-personligt-brev-guide.mdx

### Steg 3: Uppdatera Våg 2-artiklar
6-11 enligt listan ovan

### Steg 4: Uppdatera Våg 3-artiklar
12-24 med grundläggande intern länkning

### Steg 5: Schema markup
- Lägg till HowTo schema på guide-artiklar
- Lägg till Speakable på tips-artiklar

---

## Mätpunkter

Efter implementering, mät:
- Organisk trafik till /personligt-brev-exempel/*
- Klickfrekvens från artiklar till yrkessidor
- Tid på sida för uppdaterade artiklar
- Konverteringar till /verktyg/personligt-brev

---

*Denna plan är framtagen av SEO-agenten baserat på keyword-analys och befintligt innehåll.*
