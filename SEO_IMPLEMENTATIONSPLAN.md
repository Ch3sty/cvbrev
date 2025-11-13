# 🚀 SEO-IMPLEMENTATIONSPLAN: VERKTYGSSIDOR

**Skapad:** 2025-01-13
**Status:** Klar för implementation
**Estimerad total tid:** 24 timmar (3 arbetsdagar)

---

## 📋 ÖVERSIKT

Vi fokuserar på de 4 högst prioriterade förbättringarna som ger störst SEO-impact utan att riskera konvertering:

1. ✅ **Breadcrumb-navigation** (Alla 7 verktyg)
2. ✅ **De-duplicera FAQ-innehåll** (4 verktyg)
3. ✅ **Förbättra value propositions** (3 verktyg)
4. ✅ **Alt-text SEO-optimering** (Alla bilder)

**VIKTIG ÄNDRING från original-audit:**
- ❌ Vi lägger INTE till interna artikellänkar på verktygssidor (konvertering > SEO)
- ✅ Vi skapar istället hub-pages och förbättrar befintlig footer

---

## 🎯 STEG 1: BREADCRUMB-NAVIGATION (Dag 1 - 8 timmar)

**Varför:** Förbättrar UX, hjälper SEO crawlability, visar hierarki för Google

### A. Skapa återanvändbar Breadcrumb-komponent (2h)

**Fil:** `src/components/Breadcrumb.tsx`

```tsx
'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Script from 'next/script'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://jobbcoach.ai${item.href}`
    }))
  }

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      <nav
        className="mb-6 text-sm text-gray-600"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 flex-wrap">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight size={14} className="text-gray-400" />
              )}
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
```

### B. Implementera i alla 7 verktyg (6h)

**Exempel implementation (CV-Mallar):**

```tsx
import Breadcrumb from '@/components/Breadcrumb'

export default function CVMallarPage() {
  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'CV-Mallar', href: '/verktyg/cv-mallar' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      {/* Resten av sidan */}
    </div>
  )
}
```

**Checklista per verktyg:**
- [ ] CV-Mallar: Importera och lägg till breadcrumb
- [ ] CV-Analys: Importera och lägg till breadcrumb
- [ ] Personligt brev: Importera och lägg till breadcrumb
- [ ] Jobbcoachen: Importera och lägg till breadcrumb
- [ ] LinkedIn-optimering: Importera och lägg till breadcrumb
- [ ] Jobbmatchning: Importera och lägg till breadcrumb
- [ ] Rekryteringstester: Importera och lägg till breadcrumb

---

## 🎯 STEG 2: DE-DUPLICERA FAQ-INNEHÅLL (Dag 2 - 6 timmar)

**Varför:** Undvik keyword cannibalization, varje sida ska ha unikt värde

### Verktyg att uppdatera:

**1. CV-Mallar** - Skapa 10 unika frågor om mallar (nedladdning, format, anpassning)
**2. CV-Analys** - Skapa 10 unika frågor om analys (ATS-poäng, filformat, sparande)
**3. Personligt brev** - Skapa 8 unika frågor om brevgenerering (anpassning, längd, tone)
**4. Jobbcoachen** - Skapa 10 unika frågor om coaching (vilka frågor, svarstid, sparande)

### Princip för unika FAQs:

Varje FAQ-fråga ska vara **specifik för verktyget**:
- ❌ "Vad är ATS?" (för generisk, finns på flera sidor)
- ✅ "Hur vet jag om en CV-mall är ATS-kompatibel?" (specifik för CV-Mallar)
- ✅ "Vad betyder ATS-poängen i analysen?" (specifik för CV-Analys)

**Checklista per verktyg:**
- [ ] Skriv 8-10 unika FAQs specifika för verktyget
- [ ] Verifiera att INGA frågor överlappar med andra verktyg
- [ ] Uppdatera FAQ schema markup
- [ ] Uppdatera visuella FAQ-sektionen

---

## 🎯 STEG 3: FÖRBÄTTRA VALUE PROPOSITIONS (Dag 2-3 - 6 timmar)

**Varför:** Above-the-fold text avgör om användare stannar eller lämnar

### A. CV-Analys (2h)

**Nuvarande:**
```tsx
<h1>Få professionell feedback på ditt CV på 60 sekunder</h1>
```

**Förbättrad:**
```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-6">
  Gratis CV-analys – Få konkreta förbättringsförslag på 60 sekunder
</h1>

<p className="text-xl text-gray-600 mb-4">
  Vi analyserar ditt CV och visar exakt vad som behöver förbättras:
  ATS-kompatibilitet, nyckelord, struktur och design.
</p>

<div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600 mb-8">
  <span className="flex items-center gap-2">
    ✓ <strong>Komplett analys på 60 sekunder</strong>
  </span>
  <span className="flex items-center gap-2">
    ✓ <strong>ATS-kompatibilitetspoäng</strong>
  </span>
  <span className="flex items-center gap-2">
    ✓ <strong>Konkreta förbättringsförslag</strong>
  </span>
</div>
```

### B. Jobbcoachen (2h)

**Nuvarande:**
```tsx
<h1>Din personliga jobbcoach - gratis och alltid tillgänglig</h1>
```

**Förbättrad:**
```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-6">
  Jobbcoachen – Få råd om CV, intervjuer och karriär
</h1>

<p className="text-xl text-gray-600 mb-4">
  Ställ frågor om CV-skrivning, personliga brev, intervjuförberedelse,
  löneförhandling eller karriärval. Vi ger skräddarsydda svar baserat
  på svensk arbetsmarknad.
</p>

<div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
  <p className="text-sm text-gray-700 mb-3">
    <strong>Exempel på frågor du kan ställa:</strong>
  </p>
  <ul className="text-sm text-gray-700 space-y-2">
    <li>💼 "Hur formulerar jag karriärbyte från lärare till HR i mitt CV?"</li>
    <li>💰 "Vad är rimlig lön för Account Manager med 5 års erfarenhet?"</li>
    <li>🎯 "Vilka intervjufrågor är vanligast för chefsroller?"</li>
  </ul>
</div>
```

### C. LinkedIn-optimering (2h)

**Nuvarande:**
```tsx
<h1>LinkedIn-optimering - Förbättra din profil för rekryterare</h1>
```

**Förbättrad:**
```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-6">
  LinkedIn-optimering – Få en professionell profil på 5 minuter
</h1>

<p className="text-xl text-gray-600 mb-4">
  Vi hjälper dig optimera din LinkedIn-profil för att synas i rekryterarnas
  sökningar. Få konkreta förbättringsförslag på rubrik, sammanfattning och
  nyckelord – helt gratis.
</p>

<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
  <p className="text-sm text-gray-700 mb-3">
    <strong>Vad vi hjälper dig med:</strong>
  </p>
  <div className="grid md:grid-cols-2 gap-3 text-sm">
    <div className="flex items-start gap-2">
      ✓ <span><strong>Rubrik:</strong> Lägg till sökbara keywords</span>
    </div>
    <div className="flex items-start gap-2">
      ✓ <span><strong>Sammanfattning:</strong> Struktur med achievements</span>
    </div>
    <div className="flex items-start gap-2">
      ✓ <span><strong>Keywords:</strong> Vilka ord rekryterare söker</span>
    </div>
    <div className="flex items-start gap-2">
      ✓ <span><strong>Before/After:</strong> Se skillnaden direkt</span>
    </div>
  </div>
</div>
```

**Viktiga ändringar genomgående:**
- ✅ "förbättringsförslag" (inte "förbättringstips")
- ✅ "Vi analyserar" / "Vi hjälper" (inte "AI")
- ✅ "Få en professionell profil" (inte "Få professionell profil")
- ✅ Inga påhittade siffror eller claims
- ✅ Tog bort "Ingen registrering krävs" (eftersom man måste registrera sig)

---

## 🎯 STEG 4: ALT-TEXT SEO-OPTIMERING (Dag 3 - 4 timmar)

**Varför:** Google Images driver 10-15% extra trafik, alt-text hjälper SEO och tillgänglighet

### Formel för bra alt-text:
```
[Typ av bild] + [Primärt keyword] + [Kontext]
```

### Exempel per verktyg:

**CV-Mallar:**
```tsx
<Image
  src="/mallar/klassisk-cv-mall.png"
  alt="Klassisk CV-mall gratis - Traditionell design för alla yrken"
/>
```

**CV-Analys:**
```tsx
<Image
  src="/screenshots/cv-analys-resultat.png"
  alt="CV-analys resultat visar ATS-poäng och förbättringsförslag"
/>
```

**Personligt brev:**
```tsx
<Image
  src="/examples/personligt-brev-exempel.png"
  alt="Personligt brev exempel - anpassat för säljare"
/>
```

**Jobbcoachen:**
```tsx
<Image
  src="/jobbcoachen-interface.png"
  alt="Jobbcoachen chattgränssnitt - ställ karriärfrågor"
/>
```

**Checklista:**
- [ ] Identifiera alla bilder (~52 st totalt)
- [ ] Skriv SEO-optimerad alt-text (10-15 ord)
- [ ] Döp om bildfiler med keywords (cv-mall-modern.png)
- [ ] Uppdatera alla `<Image>` komponenter

---

## 🎯 STEG 5: UPPDATERA BEFINTLIG FOOTER (Dag 3 - 2 timmar)

**Varför:** Intern länkning från alla sidor utan att röra konverteringssidor

### Hitta och uppdatera befintlig footer

**Fil:** Troligen `src/components/Footer.tsx` eller `src/components/layout/Footer.tsx`

**Lägg till/förbättra dessa sektioner:**

```tsx
{/* Verktyg - om inte redan finns */}
<div>
  <h4 className="font-bold mb-4">Verktyg</h4>
  <ul className="space-y-2 text-sm">
    <li><Link href="/verktyg/cv-mallar">CV-Mallar</Link></li>
    <li><Link href="/verktyg/cv-analys">CV-Analys</Link></li>
    <li><Link href="/verktyg/personligt-brev">Personligt Brev</Link></li>
    <li><Link href="/verktyg/jobbcoachen">Jobbcoachen</Link></li>
    <li><Link href="/verktyg/linkedin-optimering">LinkedIn-optimering</Link></li>
    <li><Link href="/verktyg/jobbmatchning">Jobbmatchning</Link></li>
    <li><Link href="/verktyg/rekryteringstester">Rekryteringstester</Link></li>
  </ul>
</div>

{/* Guider - om inte redan finns */}
<div>
  <h4 className="font-bold mb-4">Guider</h4>
  <ul className="space-y-2 text-sm">
    <li><Link href="/artiklar">Alla artiklar</Link></li>
    {/* Lägg till top 5 populäraste artiklar här */}
  </ul>
</div>
```

**Checklista:**
- [ ] Hitta befintlig footer-komponent
- [ ] Lägg till "Verktyg"-sektion (om den inte finns)
- [ ] Lägg till "Guider"-sektion med länkar till artiklar
- [ ] Verifiera att footer syns på alla sidor

---

## 📅 TIDSLINJE

### **Total tid: 24 timmar (3 arbetsdagar)**

| Steg | Tid | Dag |
|------|-----|-----|
| Breadcrumb-navigation | 8h | Dag 1 |
| De-duplicera FAQ | 6h | Dag 2 |
| Förbättra value props | 6h | Dag 2-3 |
| Alt-text optimering | 4h | Dag 3 |
| Uppdatera footer | 2h | Dag 3 |

---

## ✅ SUCCESS METRICS

### Innan implementation:
- [ ] Mät conversion rate per verktyg
- [ ] Mät bounce rate per verktyg
- [ ] Screenshot av Search Console rankings

### Efter 2 veckor:
- [ ] Conversion rate (bör vara +0% eller bättre)
- [ ] Bounce rate (bör minska 5-10%)
- [ ] Rich snippets visningar (breadcrumbs, FAQ)

### Efter 4-8 veckor (SEO):
- [ ] Organisk trafik +10-20%
- [ ] Impression share +15-25%
- [ ] Rankingsförbättring
- [ ] Google Images trafik ökning

---

## 🚨 VIKTIGA PRINCIPER

### Vi undviker:
❌ Interna artikellänkar på verktygssidor
❌ Påhittade användarsiffror
❌ "AI" buzzwords
❌ "Ingen registrering krävs" (när registrering faktiskt krävs)

### Vi fokuserar på:
✅ Breadcrumbs (SEO + UX)
✅ Unika FAQs per verktyg
✅ Ärliga value propositions
✅ Alt-text för SEO
✅ "Vi analyserar" > "AI analyserar"
✅ "förbättringsförslag" > "förbättringstips"
✅ Korrekt grammatik ("Få en professionell profil")

---

**Skapad av:** SEO Content Strategist
**Version:** 3.0 (korrigerad för ärlighet och korrekt svenska)
