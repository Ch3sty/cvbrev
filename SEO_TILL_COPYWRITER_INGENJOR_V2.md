# SEO-agent → Copywriter: Uppdatering Ingenjör CV-exempel

**Datum**: 2025-01-25
**Från**: SEO-agent
**Till**: Copywriter-agent (svensk-ux-copywriter)
**Ärende**: Förbättra Ingenjör CV-exempel enligt CV_KVALITET_STANDARD.md

---

## 📊 KVALITETSVALIDERING (Fas 3.1)

Jag har kört befintligt innehåll på `/cv-exempel/ingenjor` mot [`CV_KVALITET_STANDARD.md`](/CV_KVALITET_STANDARD.md).

### ✅ VAD SOM ÄR BRA (behåll detta!)

ExempelCV-data är **utmärkt**:
- ✅ Alla 3 erfarenhetsposter har kvantifierbara resultat (€2M budget, 30%, 25%, 98%, etc.)
- ✅ Alla 5 certifieringar har årtal (2019-2023)
- ✅ 7+ branschspecifika verktyg nämnda (SolidWorks, MATLAB, Python, Lean Six Sigma)
- ✅ Tydlig progression: Engineer → Senior → Lead
- ✅ Kompetenser är konkreta (inte bara "flexibel, driven")

**Bedömning**: 4.6/5 ⭐⭐⭐⭐ (nästan perfekt!)

---

## ⚠️ IDENTIFIERADE FÖRBÄTTRINGSMÖJLIGHETER

### PRIORITET 1 (KRITISKT - måste fixas)

#### 1. Profiltext: Lägg till drivkrafter/värderingar

**Nuvarande profiltext** (från exempelCV):
> "Civilingenjör Maskinteknik med 7+ års erfarenhet från produktutveckling och projektledning inom fordonsindustri och automation. Expert i CAD-system (SolidWorks, AutoCAD), FEM-analys och designoptimering..."

**Problem**:
Enligt `CV_KVALITET_STANDARD.md` ska profiltext ha struktur:
- [Erfarenhet] ✅
- [Specialisering] ✅
- [3-4 tekniska keywords] ✅
- **[1-2 drivkrafter/mjuka egenskaper] ❌ SAKNAS**

**Din uppgift**:
Lägg till en sista mening i exempelCV:s profiltext som inkluderar:
- Certifiering (t.ex. "Lean Six Sigma Green Belt certifierad")
- Drivkraft/värdering (t.ex. "passion för att kombinera teknisk innovation med effektiv projektledning")

**Referens**: Se `CV_KVALITET_STANDARD.md` → Sektion "Grundkrav → Profiltext"

---

#### 2. "Varför det fungerar" Card 2: Förklara VARFÖR siffror är avgörande

**Nuvarande Card 2** (kvantifierbara resultat):
Text förklarar VAD som finns i CV:t, men inte VARFÖR det är viktigt.

**Problem**:
Enligt `CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx` Fas 2.3 ska vi:
> **Referera till kvalitetsstandarden**: Varför är siffror avgörande?
> **Förklara VARFÖR**: Rekryterare ser mängder av CV:n med vaga påståenden – siffror ger kontext och trovärdighet

**Din uppgift**:
Omarbeta Card 2 för att inkludera VARFÖR-förklaring:

**Struktur** (80-120 ord):
```
[STYCKE 1 - VAD finns i CV:t]
Istället för vaga beskrivningar som "ansvarig för produktutveckling"
visar CV:t konkreta resultat:
- "Ledde produktutvecklingsprojekt med €2M budget, levererat i tid och 10% under budget"
- "Effektiviserade CAD-designprocess med 30% genom Python-automatisering"
- "Reducerade produktionstid 25% genom DFM-optimering"

[STYCKE 2 - VARFÖR detta är viktigt]
**Varför detta fungerar**: Rekryterare ser hundratals CV:n där kandidater
skriver "ansvarade för projekt" eller "förbättrade processer" utan kontext.
Siffror ger omfattning och trovärdighet – skillnaden mellan "ledde projekt"
och "ledde projekt med €2M budget" är enorm. Detta sticker ut i både
ATS-screening och mänsklig granskning. Ingenjörsroller handlar om
mätbara resultat, inte bara teknisk kunskap.
```

**Referens**: Se `CV_KVALITET_STANDARD.md` → Sektion "Anti-patterns → Vaga resultat"

---

#### 3. "Varför det fungerar" Card 3: Nämn anti-pattern "buzzword bingo"

**Nuvarande Card 3** (balans teknisk/mjuk):
Visar bra balans, men nämner inte VARFÖR detta är bättre än bara lista buzzwords.

**Problem**:
Enligt `CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx` Fas 2.3:
> **Referera till anti-pattern**: "Buzzword bingo" (CV_KVALITET_STANDARD.md)
> **Förklara VARFÖR**: "Kommunikativ, flexibel" säger inget – visa hur du varit
> stresstålig genom exempel

**Din uppgift**:
Omarbeta Card 3 för att inkludera anti-pattern referens:

**Struktur** (90-110 ord):
```
[STYCKE 1 - VAD finns i CV:t]
CV:t kombinerar teknisk kompetens (SolidWorks, FEM-analys, Python, MATLAB)
med projektlednings- och samarbetsförmåga (Agile, stakeholder management,
tvärfunktionella team).

[STYCKE 2 - HUR det backas upp]
Båda delarna backas upp med exempel från arbetserfarenheten:
"Samordnade tvärfunktionella team (R&D, produktion, kvalitet, inköp)
för produktlansering" visar både tekniskt ledarskap OCH samarbetsförmåga.

[STYCKE 3 - VARFÖR detta är bättre än buzzwords]
**Varför inte bara buzzwords**: Istället för att lista "problemlösare,
kommunikativ, flexibel" (klassisk buzzword bingo utan substans), visar
CV:t dessa egenskaper genom konkreta exempel. Detta är avgörande –
rekryterare läser "driven och flexibel" i 90% av alla CV:n, men konkreta
bevis sticker ut. Moderna ingenjörsroller kräver både teknisk expertis
OCH samarbete.
```

**Referens**: Se `CV_KVALITET_STANDARD.md` → Sektion "Anti-patterns → Buzzword bingo"

---

### PRIORITET 2 (BRA ATT HA - om tid finns)

#### 4. Lägg till explicit före/efter-exempel i Tips-sektionen

I minst **2 tips**, lägg till konkret "❌ Istället för X → ✅ Skriv Y" enligt kvalitetsstandarden.

**Exempel för Tip 2 (Kvantifiera erfarenhet)**:
```
[... befintlig text ...]

**Exempel på före/efter**:
❌ "Ansvarig för produktutveckling och CAD-design"
✅ "Ledde produktutvecklingsprojekt med €2M budget, 12 månaders tidslinje,
    levererat i tid och 10% under budget. Designade 50+ komponenter i
    SolidWorks med 98% tillverkningsbarhet."
```

**Referens**: Se `CV_KVALITET_STANDARD.md` → Sektion "Exempel: Bra vs Dåligt"

---

## 📝 SAMMANFATTNING AV DINA UPPGIFTER

**MÅSTE göras (Prioritet 1)**:
1. ✏️ Uppdatera exempelCV profiltext (+1 mening om drivkrafter)
2. ✏️ Omarbeta "Varför det fungerar" Card 2 (lägg till VARFÖR-stycke om siffrors betydelse)
3. ✏️ Omarbeta "Varför det fungerar" Card 3 (nämn buzzword bingo anti-pattern)

**Bra att ha (Prioritet 2)**:
4. ✏️ Lägg till ❌→✅ exempel i 2 tips

---

## 🎯 LEVERANSFORMAT

Returnera uppdaterad content i samma format som tidigare:

```typescript
{
  // UPPDATERAD exempelCV profiltext
  exempelCV: {
    profiltext: "[ny text med drivkrafter]"
  },

  // UPPDATERADE cards (bara de som ändrats)
  varforDetFungerar: [
    {
      rubrik: "Kvantifierbara resultat istället för ansvarsområden",
      text: "[ny text med VARFÖR-stycke]"
    },
    {
      rubrik: "Balans mellan tekniska och mjuka färdigheter",
      text: "[ny text med buzzword bingo-referens]"
    }
  ],

  // UPPDATERADE tips (om du gör Prioritet 2)
  tips: [
    {
      rubrik: "Kvantifiera din erfarenhet för ökad trovärdighet",
      text: "[befintlig text]\n\n**Exempel på före/efter**:\n❌ ...\n✅ ..."
    }
  ]
}
```

---

## ⏱️ ESTIMERAD TID

- Prioritet 1: **15-20 minuter**
- Prioritet 2: **5-10 minuter** (om tid finns)

---

## ✅ KVALITETSKONTROLL (jag kommer verifiera)

När du är klar kommer jag köra Fas 3-validering:
- ✅ Profiltext har alla 4 komponenter (erfarenhet, specialisering, keywords, drivkrafter)
- ✅ Card 2 förklarar VARFÖR kvantifierbara resultat är avgörande
- ✅ Card 3 nämner buzzword bingo anti-pattern
- ✅ Brand voice: AI-fri, svensk svenska, konkreta exempel

**Referensdokument du MÅSTE läsa**:
- [`CV_KVALITET_STANDARD.md`](/CV_KVALITET_STANDARD.md) → Grundkrav, Anti-patterns, Exempel
- [`CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx`](/CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx) → Fas 2.3

---

Lycka till! Tagga mig när du är klar. 🚀

/SEO-agent
