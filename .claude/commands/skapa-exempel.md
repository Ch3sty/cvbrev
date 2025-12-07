# Skapa nästa CV-exempel eller Personligt brev-exempel

Du ska skapa nästa saknade sida enligt implementeringsplanen. Följ dessa steg noggrant.

---

## STEG 1: Identifiera nästa sida att skapa

Läs `SAKNADE_SIDOR_IMPLEMENTATION_PLAN.md` och identifiera vilka sidor som ska skapas.

**Kontrollera sedan vilka som redan finns:**

### För CV-exempel:
Läs `src/app/cv-exempel/[yrke]/page.tsx` och hitta alla slugs i `exampleData` objektet.

Jämför med listan över saknade CV-exempel (17 st):
1. kundtjanstmedarbetare
2. loneadministrator
3. enhetschef
4. specialistsjukskoterska
5. teamledare
6. vardadministrator
7. kundradgivare
8. barnmorska
9. produktchef
10. lss-handlaggare
11. hotellvard
12. administrativ-assistent
13. boendestod
14. koksbitrade
15. barista
16. logistikassistent
17. terminalarbetare

### För Personligt brev-exempel:
Läs `src/app/personligt-brev-exempel/[yrke]/page.tsx` och hitta alla slugs i `exampleData` objektet.

Jämför med listan över saknade PB-exempel (20 st):
1. grundskollarare
2. socialsekreterare
3. projektledare-it
4. butikschef
5. fysioterapeut
6. ekonom
7. devops-engineer
8. psykolog
9. logistiker
10. fastighetsskotare
11. hemtjanstpersonal
12. kontorsassistent
13. servicemedarbetare
14. automationsingenior
15. konstruktor
16. bartender
17. kassorska
18. fritidsledare
19. konditor
20. stadare

**Arbetsordning:** Skapa ALLA CV-exempel först (Fas 1), sedan ALLA personligt brev-exempel (Fas 2).

Rapportera till användaren:
```
NÄSTA SIDA ATT SKAPA:
- Typ: [CV-exempel / Personligt brev-exempel]
- Yrke: [Yrke]
- Slug: [slug]
- Prioritet: [1/2/3]
- Progress: [X av 17 CV-exempel klara] eller [X av 20 PB-exempel klara]
```

---

## STEG 2: SEO-AGENT - Research & Direktiv

Använd Task-verktyget med `subagent_type: "seo-content-strategist-se"` för att skapa SEO-direktiv.

**Prompt till SEO-agenten:**

```
## UPPGIFT: Skapa SEO-direktiv för [CV-exempel/Personligt brev-exempel] - [YRKE]

### Steg 1: Läs implementeringsplanen
Läs filen `SAKNADE_SIDOR_IMPLEMENTATION_PLAN.md` och hitta sektionen för [YRKE].

### Steg 2: Extrahera och komplettera information
Från planen, extrahera:
- Branschspecifika nyckelord (primary, secondary, long-tail)
- System/verktyg
- Certifieringar
- Kompetenser (tekniska + mjuka)
- Relaterade yrken
- Kategori

### Steg 3: Skapa SEO-direktiv

Returnera ett komplett SEO-direktiv i följande format:

---
## SEO-DIREKTIV: [YRKE]

### Metadata
- **metaTitle:** "CV Exempel [Yrke] 2025 - Professionell Mall | Jobbcoach.ai" (för CV)
  ELLER "Personligt Brev [Yrke] - Exempel & Mall 2025 | Jobbcoach.ai" (för PB)
- **metaDescription:** [150-160 tecken, inkludera primary keyword, benefit-fokuserad]
- **Kategori:** [kategori]
- **Slug:** [slug]

### Keywords att inkludera
**Primary (MÅSTE finnas i H1, meta, första stycket):**
- [keyword 1]
- [keyword 2]

**Secondary (minst 3 i innehållet):**
- [lista]

**Long-tail (i FAQ):**
- [lista]

**LSI/Branschtermer (sprid i innehållet):**
- [lista system/verktyg]
- [lista certifieringar]
- [lista tekniska termer]

### Innehållskrav

**För CV-exempel:**
- seoIntro: 185+ ord, 3 stycken, keyword density 1-3%
- Profiltext: 3-4 meningar med specialisering + tekniska + mjuka keywords
- Erfarenhet: Kvantifierbara resultat, branschverktyg, progression
- varforDetFungerar: 6 cards (ATS, Kvantifiering, Balans, Certifieringar, Profiltext, Progression)
- Tips: 6 st i imperativ form med branschspecifika råd
- FAQ: 10 frågor (3 generiska + 7 yrkes-specifika med long-tail keywords)

**För Personligt brev-exempel:**
- brevText: 300-400 ord, 4-5 stycken
- seoIntro: 200-300 ord med \n\n mellan stycken
- varforDetFungerar: 3-4 punkter
- Tips: 4-5 st
- FAQ: 5-7 yrkes-specifika frågor

### Relaterade yrken (för intern länkning)
Välj 3 relaterade yrken som FINNS på sajten:
1. [slug] - [Yrke]
2. [slug] - [Yrke]
3. [slug] - [Yrke]

### Tonalitet för branschen
[Beskriv rätt ton: formell/informell, teknisk nivå, etc.]

### VIKTIGT - Kvalitetskrav
- INGA tankstreck (–) mellan fraser
- INGA ord: kraftfull, innovativ, dynamisk, revolutionerande, banbrytande
- Mänskligt språk med varierad meningslängd
- Konkreta exempel, inte vaga påståenden
- Kvantifierbara resultat med kontext
---
```

**Vänta på SEO-agentens svar innan du fortsätter.**

---

## STEG 3: COPY-AGENT - Innehållsskapande

Använd Task-verktyget med `subagent_type: "svensk-ux-copywriter"` för att skapa innehållet.

**Skicka med SEO-direktivet från Steg 2 i prompten:**

```
## UPPGIFT: Skapa innehåll för [CV-exempel/Personligt brev-exempel] - [YRKE]

### SEO-DIREKTIV (från SEO-agenten):
[KLISTRA IN HELA SEO-DIREKTIVET HÄR]

---

### Din uppgift

Skapa komplett innehåll som följer SEO-direktivet ovan.

**VIKTIGT - Läs först befintlig struktur:**
- För CV-exempel: Läs `src/app/cv-exempel/[yrke]/page.tsx` och studera hur `exampleData` är strukturerat för befintliga yrken (t.ex. 'underskoterska' eller 'sjukskoterska')
- För PB-exempel: Läs `src/app/personligt-brev-exempel/[yrke]/page.tsx` och studera strukturen

**Matcha exakt samma format för:**
- Radbrytningar (`\n\n` mellan stycken i seoIntro, tips med >80 ord)
- Fetstil (`**text**` för "Varför detta fungerar:" i varforDetFungerar)
- Struktur på erfarenhet, kompetenser, etc.

---

### OUTPUT FORMAT

Returnera det kompletta data-objektet som ska läggas till i page.tsx:

**För CV-exempel:**
```typescript
'[slug]': {
  yrke: '[Yrke]',
  slug: '[slug]',
  kategori: '[från SEO-direktiv]',
  metaTitle: '[från SEO-direktiv]',
  metaDescription: '[från SEO-direktiv]',

  seoIntro: `[Stycke 1 - hook med primary keyword]

[Stycke 2 - LSI keywords och branschtermer]

[Stycke 3 - CTA och intern länk]`,

  viktigtAttTankaPa: [
    '[4 konkreta punkter för yrket]'
  ],

  exempelCV: {
    namn: '[Svenskt namn]',
    titel: '[Titel med specialisering]',
    profil: '[3-4 meningar enligt SEO-direktiv]',

    erfarenhet: [
      {
        titel: '[Position]',
        arbetsgivare: '[Företag]',
        period: '[Period]',
        beskrivning: [
          '[Kvantifierbart resultat]',
          '[Teknisk kompetens + verktyg]',
          '[Ansvar/ledarskap]',
          '[Samarbete]'
        ]
      },
      // Minst 2 tjänster
    ],

    utbildning: [
      {
        titel: '[Utbildning]',
        skola: '[Skola]',
        period: '[År]',
        beskrivning: '[Relevant info]'
      }
    ],

    kompetenser: {
      tekniska: [
        // 6-8 tekniska kompetenser från SEO-direktiv
      ],
      personliga: [
        // 5-6 mjuka kompetenser
      ]
    },

    certifieringar: [
      // 3-5 från SEO-direktiv
    ],

    sprak: [
      { sprak: 'Svenska', niva: 'Modersmål' },
      { sprak: 'Engelska', niva: 'Flytande' }
    ]
  },

  varforDetFungerar: [
    {
      rubrik: '[Kort rubrik 4-8 ord]',
      text: `[Observation om CV:t]

**Varför detta fungerar:** [Förklaring ur rekryterarens perspektiv, 80-120 ord totalt]`
    },
    // 6 cards: ATS-optimering, Kvantifiering, Balans, Certifieringar, Profiltext, Progression
  ],

  tips: [
    {
      rubrik: '[Imperativ: Inkludera/Använd/Betona...]',
      text: '[60-85 ord, använd \n\n för längre tips]'
    },
    // 6 tips
  ],

  faq: [
    { q: '[Fråga med long-tail keyword]', a: '[60-120 ord svar]' },
    // 10 frågor (3 generiska + 7 yrkes-specifika)
  ],

  relateradeExempel: ['[slug1]', '[slug2]', '[slug3]']
}
```

**För Personligt brev-exempel:**
```typescript
'[slug]': {
  yrke: '[Yrke]',
  slug: '[slug]',
  kategori: '[kategori]',

  namn: '[Namn]',
  epost: '[fornamn.efternamn@email.se]',
  telefon: '[070-XXX XX XX]',
  stad: '[Stad]',
  datum: '2025-01-15',
  foretag: '[Fiktivt företag passande branschen]',
  jobbtitel: '[Jobbtitel]',

  brevText: `[Stycke 1 - Inledning 50-70 ord]

[Stycke 2 - Erfarenhet 80-100 ord med konkreta exempel]

[Stycke 3 - Kompetenser 70-90 ord]

[Stycke 4 - Varför företaget 60-80 ord]

[Stycke 5 - Avslutning 40-50 ord]`,

  seoIntro: `[Stycke 1]

[Stycke 2]

[Stycke 3 - totalt 200-300 ord]`,

  varforDetFungerar: [
    { titel: '[Tema]', beskrivning: '[40-60 ord]' },
    // 3-4 punkter
  ],

  tips: [
    { titel: '[Imperativ]', text: '[60-100 ord, \n\n för längre]' },
    // 4-5 tips
  ],

  faq: [
    { q: '[Fråga]', a: '[60-100 ord]' },
    // 5-7 frågor
  ],

  relateradeYrken: ['[slug1]', '[slug2]', '[slug3]']
}
```

### KVALITETSKONTROLL innan du returnerar:
- [ ] Inga tankstreck (–) - endast bindestreck (-)
- [ ] Inga förbjudna ord (kraftfull, innovativ, dynamisk, revolutionerande)
- [ ] Alla keywords från SEO-direktivet finns med
- [ ] Mänskligt språk - varierad meningslängd
- [ ] Konkreta exempel, inte vaga påståenden
- [ ] `\n\n` mellan stycken där det behövs
- [ ] `**Varför detta fungerar:**` med fetstil
- [ ] Relaterade yrken har korrekta slugs
```

**Vänta på Copy-agentens svar.**

---

## STEG 4: SEO-AGENT - Validering, Implementation & Publicering

Använd Task-verktyget med `subagent_type: "seo-content-strategist-se"` för att validera, implementera och publicera.

**Skicka med Copy-agentens innehåll i prompten:**

```
## UPPGIFT: Validera, implementera och publicera [CV-exempel/Personligt brev-exempel] - [YRKE]

### INNEHÅLL FRÅN COPY-AGENTEN:
[KLISTRA IN HELA INNEHÅLLET HÄR]

### URSPRUNGLIGT SEO-DIREKTIV:
[KLISTRA IN SEO-DIREKTIVET HÄR]

---

## DEL 1: VALIDERA INNEHÅLLET

Kontrollera att Copy-agentens innehåll uppfyller alla krav:

### SEO-validering:
- [ ] metaTitle följer exakt format: "CV Exempel [Yrke] 2025 - Professionell Mall | Jobbcoach.ai"
- [ ] metaDescription är 150-160 tecken
- [ ] Alla PRIMARY keywords finns i: H1, meta, första stycket av seoIntro
- [ ] Minst 3 SECONDARY keywords finns i innehållet
- [ ] LSI/branschtermer är naturligt integrerade
- [ ] seoIntro har rätt längd (185+ ord för CV, 200-300 för PB)
- [ ] Keyword density är 1-3% (ej keyword stuffing)

### Kvalitetsvalidering:
- [ ] INGA tankstreck (–) mellan fraser - endast bindestreck (-)
- [ ] INGA förbjudna ord: kraftfull, innovativ, dynamisk, revolutionerande, banbrytande
- [ ] Mänskligt språk med varierad meningslängd (5-25 ord)
- [ ] Konkreta exempel, inte vaga påståenden
- [ ] Kvantifierbara resultat har kontext
- [ ] `\n\n` mellan stycken i seoIntro och längre tips
- [ ] `**Varför detta fungerar:**` har fetstil-markdown

### Strukturvalidering:
- [ ] Alla obligatoriska fält finns
- [ ] Relaterade yrken har korrekta slugs som existerar på sajten
- [ ] FAQ har rätt antal frågor (10 för CV, 5-7 för PB)
- [ ] Tips har rätt antal (6 för CV, 4-5 för PB)
- [ ] varforDetFungerar har rätt antal (6 för CV, 3-4 för PB)

**Om något saknas eller är fel:** Korrigera det innan du fortsätter.

---

## DEL 2: IMPLEMENTERA I KODFILER

### 2.1 Lägg till i page.tsx

**För CV-exempel:**
Läs `src/app/cv-exempel/[yrke]/page.tsx` och lägg till det nya objektet i `exampleData` (i alfabetisk ordning efter slug).

**För Personligt brev-exempel:**
Läs `src/app/personligt-brev-exempel/[yrke]/page.tsx` och lägg till det nya objektet i `exampleData`.

### 2.2 Uppdatera sitemap

Läs `src/app/sitemap.ts`:

**För CV-exempel**, hitta `CV_EXEMPEL` array och lägg till (alfabetisk ordning):
```typescript
'[slug]',
```

**För Personligt brev**, hitta `PERSONLIGT_BREV_EXEMPEL` array och lägg till:
```typescript
'[slug]',
```

### 2.3 Uppdatera galleri-sidan

**För CV-exempel** - läs `src/app/cv-exempel/page.tsx`:
Hitta rätt kategori-sektion och lägg till ett nytt kort för yrket.

**För Personligt brev** - läs `src/app/personligt-brev-exempel/page.tsx`:
Hitta rätt kategori-sektion och lägg till ett nytt kort.

---

## DEL 3: BYGGA OCH PUBLICERA

### 3.1 Kör build
```bash
npm run build
```

**Om build misslyckas:** Identifiera felet, fixa det, och kör build igen.

### 3.2 Git commit och push
```bash
git add .
git commit -m "[CV-EXEMPEL/PB-EXEMPEL]: Lägg till [Yrke]

- Nytt [CV-exempel/personligt brev-exempel] för [yrke]
- SEO-optimerat med branschspecifika nyckelord
- Uppdaterad sitemap och galleri

🤖 Generated with Claude Code"
git push
```

---

## DEL 4: RAPPORTERA RESULTAT

Returnera en sammanfattning:

```
## SIDAN SKAPAD OCH PUBLICERAD!

### Detaljer
- **Typ:** [CV-exempel / Personligt brev-exempel]
- **Yrke:** [Yrke]
- **Slug:** [slug]
- **URL:** https://jobbcoach.ai/[cv-exempel/personligt-brev-exempel]/[slug]

### SEO-validering
- metaTitle: ✅
- metaDescription: ✅ ([X] tecken)
- Keywords: ✅ (alla inkluderade)
- Inga förbjudna ord: ✅

### Filer uppdaterade
- [x] page.tsx (exampleData)
- [x] sitemap.ts
- [x] galleri-sida

### Build & Deploy
- Build: ✅ PASSED
- Git push: ✅ PUSHED

### Progress
- CV-exempel: [X av 17 klara]
- PB-exempel: [X av 20 klara]

### Nästa sida
- **Yrke:** [Nästa yrke]
- **Slug:** [slug]

Skriv "/skapa-exempel" för att fortsätta med nästa sida.
```
```

---

## SNABBREFERENS - Ordning

### Fas 1: CV-exempel (i prioritetsordning)
1. kundtjanstmedarbetare
2. loneadministrator
3. enhetschef
4. specialistsjukskoterska
5. teamledare
6. vardadministrator
7. kundradgivare
8. barnmorska
9. produktchef
10. lss-handlaggare
11. hotellvard
12. administrativ-assistent
13. boendestod
14. koksbitrade
15. barista
16. logistikassistent
17. terminalarbetare

### Fas 2: Personligt brev-exempel (i prioritetsordning)
1. grundskollarare
2. socialsekreterare
3. projektledare-it
4. butikschef
5. fysioterapeut
6. ekonom
7. devops-engineer
8. psykolog
9. logistiker
10. fastighetsskotare
11. hemtjanstpersonal
12. kontorsassistent
13. servicemedarbetare
14. automationsingenior
15. konstruktor
16. bartender
17. kassorska
18. fritidsledare
19. konditor
20. stadare
