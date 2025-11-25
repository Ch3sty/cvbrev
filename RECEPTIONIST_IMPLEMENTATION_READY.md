# Receptionist CV-exempel - Redo för Implementation

**Status:** ✅ GODKÄND (4.8/5) - Redo att läggas till i page.tsx

**URL när implementerad:** https://jobbcoach.ai/cv-exempel/receptionist

---

## 📋 IMPLEMENTATION CHECKLIST

### Steg 1: Kopiera ExempelCV-data
Från: `SEO_TILL_COPYWRITER_RECEPTIONIST.md` (rad 26-126)
Till: `src/app/cv-exempel/[yrke]/page.tsx` efter `'forskollarare': { ... },`

### Steg 2: Kopiera Content-data
Från: `COPYWRITER_CONTENT_RECEPTIONIST.md`
- seoIntro (rad 11-15)
- varforDetFungerar cards (rad 21-51)
- tips (rad 57-128)
- faq (rad 132-200)

### Steg 3: Metadata
```typescript
'receptionist': {
  yrke: 'Receptionist',
  sokvolym: 920,
  metaTitle: 'CV Exempel Receptionist 2025 - Professionell Mall | Jobbcoach.ai',
  metaDescription: 'Se ett komplett CV-exempel för receptionist. ATS-optimerat, strukturerat för svenska företag och visar service- och switchboard-kompetens. Inkluderar bokningssystem och flerspråkig kommunikation.',
  kategori: 'service',
  // ... rest of data from handover documents
}
```

---

## ✅ VALIDERING GODKÄND (4.8/5)

**ExempelCV:**
- ✅ Kvantifierbara resultat: "200+ samtal", "150+ besökare", "30% förbättring", "20% reducering"
- ✅ 7 tekniska kompetenser med TOP 3 nivåer
- ✅ 5 mjuka kompetenser med konkreta bevis
- ✅ Alla certifieringar med årtal
- ✅ Progression: Kundtjänst → Hotell → Företag (ansvarig + mentorskap)

**Content:**
- ✅ Card 2: VARFÖR kvantifierbara resultat (128 ord)
- ✅ Card 3: "Buzzword bingo" explicit nämnd (135 ord)
- ✅ 4 tips med ❌→✅ exempel
- ✅ 10 FAQ (3 generiska + 7 yrkes-specifika)

---

## 📊 BRANSCHSPECIFIKA SYSTEM INKLUDERADE

- **Switchboard**: Expert, 6+ år
- **Bokningssystem**: Lime, Simployer, Outlook (Avancerad, 5+ år)
- **Hotellsystem**: Opera PMS (Avancerad, 2+ år)
- **CRM**: Salesforce
- **Besökshantering**: Visitor Management System

---

## 🎯 SEO-OPTIMERING

- **Primary keyword**: "cv receptionist" (920/mån, KD 22)
- **LSI keywords**: switchboard, bokningssystem, Lime, Simployer, besökshantering, flerspråkig
- **Long-tail**: 7 FAQ-keywords

---

## 📁 KÄLLFILER

1. **SEO_TILL_COPYWRITER_RECEPTIONIST.md** (7,800+ ord) - ExempelCV + SEO-analys
2. **COPYWRITER_CONTENT_RECEPTIONIST.md** - Komplett innehåll

---

**Implementation tar ca 10-15 minuter** genom att kopiera data från handover-dokumenten till page.tsx enligt strukturen från förskollärare-exemplet.
