# SEO-agent → Copywriter: Uppdatering Undersköterska CV-exempel

**Datum**: 2025-01-25
**Från**: SEO-agent
**Till**: Copywriter-agent (svensk-ux-copywriter)
**Ärende**: Förbättra Undersköterska CV-exempel enligt CV_KVALITET_STANDARD.md

---

## 📊 KVALITETSVALIDERING (Fas 3.1)

Jag har kört befintligt innehåll på `/cv-exempel/underskoterska` mot [`CV_KVALITET_STANDARD.md`](c:\Users\chris\cvbrev\CV_KVALITET_STANDARD.md).

### ✅ VAD SOM ÄR BRA (behåll detta!)

ExempelCV-data är **utmärkt** på nästan alla områden:

1. **Profiltext (rad 34)**: ⭐⭐⭐⭐⭐ (5/5)
   - ✅ Perfekt struktur med alla 4 komponenter: erfarenhet, specialisering, keywords, drivkrafter
   - ✅ Konkreta certifieringar nämnda: "Certifierad i Akta Ryggen och basala hygienrutiner"
   - ✅ Drivkrafter tydliga: "Stresstålig lagspelare som skapar trygghet för patienter"

2. **Erfarenheter (rad 36-60)**: ⭐⭐⭐⭐⭐ (5/5)
   - ✅ Post 1 har 4 kvantifierbara resultat: "25-30 patienter", "20+ patienter (delegering)", "15% minskade inläggningar", "6 mentorer"
   - ✅ Post 2 har 2 kvantifierbara resultat: "12-15 brukare", "20% reducerade fall"
   - ✅ Branschsystem nämnt: "Cosmic"
   - ✅ Tydlig progression: Hemtjänst (självständigt) → Äldreboende (team + mentorskap)

3. **Certifieringar (rad 90-96)**: ⭐⭐⭐⭐⭐ (5/5)
   - ✅ Alla 5 certifieringar har årtal: (2022), (2023), (2024)
   - ✅ Specifik delegering: "Insulin, PEG, subkutana injektioner"
   - ✅ Förnyelsedatum: "HLR (förnyad 2024)"

4. **Utbildning (rad 62-68)**: ⭐⭐⭐⭐⭐ (5/5)
   - ✅ Årtal angivet: 2014-2017
   - ✅ VFU-platser nämnda: "Karolinska (geriatrik), Sabbatsbergs (akutvård)"

**Sammanfattning**: ExempelCV-data är **nästan perfekt** med kvantifierbara resultat, certifieringar och progression. Det här är solid grund att bygga vidare på!

**Bedömning**: 4.3/5 ⭐⭐⭐⭐

---

## ⚠️ IDENTIFIERADE FÖRBÄTTRINGSMÖJLIGHETER

### PRIORITET 1 (KRITISKT - måste fixas)

#### 1. Kompetenser: Lägg till kompetensnivå på TOP 3 tekniska färdigheter

**Nuvarande kompetenser** (rad 72-79):
```
tekniska: [
  'ADL-stöd och personcentrerad vård',
  'Medicinsk delegering (insulin, PEG, subkutana injektioner)',
  'Demensvård och BPSD-hantering',
  'Palliativ omvårdnad och smärtlindring',
  'Såromläggning och PVK-skötsel',
  'Dokumentationssystem: Cosmic, Procapita',
  'Akta Ryggen-certifierad förflyttningsteknik'
]
```

**Problem**:
Enligt `CV_KVALITET_STANDARD.md` rad 58-60:
> ✅ **Kompetensnivå på TOP 3** (inte alla):
> "SolidWorks (Expert, 7+ år)" - toppkompetens med nivå
> "Python, MATLAB" - övriga utan nivå (undvik upprepning)

**Din uppgift**:
Lägg till kompetensnivå på 3 viktigaste färdigheter för undersköterska. Välj de som har längst erfarenhet enligt arbetsbeskrivningar:

**Förslag på uppdaterad lista**:
```
tekniska: [
  'Cosmic och Procapita (Expert, 6+ år daglig användning)', // NIVÅ TILLAGD
  'Medicinsk delegering - insulin, PEG, subkutana injektioner (Avancerad, 5+ år)', // NIVÅ TILLAGD
  'Demensvård och BPSD-hantering (Expert, 5+ år inom geriatrik)', // NIVÅ TILLAGD
  'ADL-stöd och personcentrerad vård',
  'Palliativ omvårdnad och smärtlindring',
  'Såromläggning och PVK-skötsel',
  'Akta Ryggen-certifierad förflyttningsteknik'
]
```

**Varför detta är viktigt**:
- Visar djupkunskap i kritiska områden (Cosmic, delegering, demensvård)
- Ger rekryterare konkret bild av erfarenhetsnivå
- Sticker ut från kandidater som bara listar kompetenser utan kontext

**Referens**: `CV_KVALITET_STANDARD.md` → Sektion "Kompetenser → Hårda/tekniska kompetenser" (rad 53-68)

---

#### 2. "Varför det fungerar" Card 2: Förklara VARFÖR siffror är avgörande

**Nuvarande Card 2** (Kvantifierbara resultat, rad 114-120):
> "Istället för vaga beskrivningar som 'ansvarig för patientvård' visar CV:t konkreta resultat som kan mätas: 'minskade akuta inläggningar med 15%', 'reducerade fall med 20%', 'omvårdnad av 25-30 patienter dagligen', 'medicinsk delegering för 20+ patienter'.
>
> Siffror gör din kompetens trovärdigt och jämförbar. Rekryterare kan direkt se omfattningen av ditt ansvar och vilken effekt du haft på vårdkvalitet. Detta skiljer dig från kandidater som bara listar arbetsuppgifter utan kontext..."

**Problem**:
Texten förklarar VAD som finns i CV:t, men inte VARFÖR detta är avgörande.

Enligt `CV_KVALITET_STANDARD.md` rad 200-207 (Exempel: Bra vs Dåligt):
> **Problem**: Vagt, inga siffror, buzzwords, inget konkret ansvar eller resultat.

Och enligt `CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx` Fas 2.3:
> **Referera till kvalitetsstandarden**: Varför är siffror avgörande för vårdyrken?

**Din uppgift**:
Omarbeta Card 2 för att inkludera tydlig VARFÖR-förklaring som refererar till anti-pattern.

**Föreslagen struktur** (100-130 ord):
```
Istället för vaga beskrivningar som "ansvarig för patientvård" visar CV:t konkreta resultat:
- "Omvårdnad av 25-30 patienter dagligen"
- "Minskade akuta inläggningar med 15%"
- "Reducerade fall med 20%"
- "Medicinsk delegering för 20+ patienter"

**Varför detta fungerar**: Rekryterare inom vård ser hundratals CV:n där undersköterskor
skriver "ansvarig för patientvård" eller "hanterade medicindelegering" utan kontext.
Vad betyder "ansvarig för patientvård"? 10 patienter eller 40? En timme per dag eller
hela skiftet?

Siffror ger omfattning och trovärdighet. Skillnaden mellan "omvårdnad av patienter" och
"omvårdnad av 25-30 patienter dagligen" är enorm – det visar att du kan hantera hög
arbetsbelastning i stressiga miljöer. Kvantifierbara resultat visar också initiativförmåga
och klinisk blick. Att du uppmärksammade tidiga sjukdomstecken och faktiskt mätte effekten
(15% minskade inläggningar) demonstrerar att du tänker bortom rutinuppgifter och bidrar
aktivt till patientsäkerhet.
```

**Referens**:
- `CV_KVALITET_STANDARD.md` → Sektion "Anti-patterns → Vaga resultat" (rad 200-207)
- `CV_KVALITET_STANDARD.md` → Sektion "Arbetslivserfarenhet → Kvantifierbara resultat" (rad 26-37)

---

#### 3. "Varför det fungerar" Card 3: Nämn anti-pattern "buzzword bingo"

**Nuvarande Card 3** (Balans teknisk/mjuk, rad 122-128):
> "CV:t kombinerar teknisk kompetens (medicinsk delegering, förflyttningsteknik, Cosmic/Procapita)
> med empatiska egenskaper (relationsskapande, lyhördhet, kommunikation). Denna balans är
> avgörande eftersom vårdyrket kräver både praktiska färdigheter och förmågan att skapa trygghet.
>
> Båda delarna backas upp med konkreta exempel från arbetserfarenheten. Du säger inte bara
> 'empatisk' utan visar det genom 'byggde förtroendefulla relationer med brukare och anhöriga
> genom lyhördhet och respektfull kommunikation'..."

**Problem**:
Card 3 visar bra balans, men nämner inte explicit VARFÖR detta är bättre än bara lista buzzwords.

Enligt `CV_KVALITET_STANDARD.md` rad 209-211:
> ### Buzzword bingo
> - ❌ "Driven, flexibel, kreativ problemlösare, god kommunikationsförmåga" (lista utan kontext)
> - ✅ Visa genom exempel: "Löste kritisk produktionsbug under tidspress (3h) vilket räddade kundleverans"

**Din uppgift**:
Omarbeta Card 3 för att inkludera anti-pattern referens och förklara VARFÖR bevis är bättre än bara ord.

**Föreslagen struktur** (110-140 ord):
```
CV:t kombinerar teknisk kompetens (medicinsk delegering, förflyttningsteknik, Cosmic/Procapita)
med empatiska egenskaper (relationsskapande, lyhördhet, kommunikation). Denna balans är
avgörande eftersom vårdyrket kräver både praktiska färdigheter och förmågan att skapa trygghet.

Båda delarna backas upp med konkreta exempel från arbetserfarenheten. Du säger inte bara
"empatisk" utan visar det genom "byggde förtroendefulla relationer med brukare och anhöriga
genom lyhördhet och respektfull kommunikation".

**Varför inte bara buzzwords**: Istället för att lista "empatisk, kommunikativ, flexibel,
stresstålig" (klassisk buzzword bingo utan substans), visar CV:t dessa egenskaper genom
konkreta exempel. Detta är avgörande – rekryterare läser "empatisk och kommunikativ" i
90% av alla undersköterske-CV:n, men konkreta bevis sticker ut.

Att skriva "stresstålig" betyder inget. Att skriva "hanterade 25-30 patienter dagligen
i högt tempo med samtidiga medicineringar, måltider och akuta försämringar" VISAR att
du faktiskt arbetat i stressiga miljöer. Vårdgivare söker undersköterskor som både kan
utföra medicinska arbetsuppgifter OCH hantera den relationella dimensionen av vård.
```

**Referens**:
- `CV_KVALITET_STANDARD.md` → Sektion "Anti-patterns → Buzzword bingo" (rad 209-211)
- `CV_KVALITET_STANDARD.md` → Sektion "Anti-patterns → Mjuka kompetenser utan bevis" (rad 221-223)

---

### PRIORITET 2 (BRA ATT HA - om tid finns)

#### 4. Lägg till explicit före/efter-exempel i Tips-sektionen

Enligt `CV_KVALITET_STANDARD.md` rad 237-262 finns tydliga exempel på före/efter-format.

I minst **2 tips**, lägg till konkret "❌ UNDVIK → ✅ BRA" enligt kvalitetsstandarden.

**Exempel för Tip 2 (Kvantifiera erfarenhet, rad 165-174)**:

**Nuvarande text**:
> "Konkreta siffror gör ditt CV mer trovärdigt och jämförbart. Transformera vaga påståenden
> till mätbara fakta genom att alltid fråga dig: hur många, hur länge, hur ofta?
>
> **UNDVIK:** 'Ansvarig för patientvård'
> **BRA:** 'Omvårdnad av 25-30 patienter dagligen inom geriatrisk avdelning'"

**Problem**: Detta är redan bra! Men kan förbättras med fler exempel enligt standarden.

**Föreslagen tillägg**:
```
[... befintlig text ...]

**Fler exempel på före/efter**:

❌ "Hanterade medicindelegering"
✅ "Medicinsk delegering för 20+ patienter dagligen (insulin, PEG, subkutana injektioner)
    vilket säkerställde korrekt medicinering utan avvikelser under 18 månader"

❌ "Bidrog till förbättrad vårdkvalitet"
✅ "Uppmärksammade tidiga sjukdomstecken (UVI, dehydrering) vilket minskade akuta inläggningar
    med 15% på avdelningen"

❌ "Arbetade i hemtjänst med äldre"
✅ "Självständigt hembesök hos 12-15 brukare dagligen med ADL-stöd, matlagning och
    medicinhantering. Implementerade fallpreventionsåtgärder som reducerade antalet fall
    med 20% i mitt distrikt"
```

**Referens**: `CV_KVALITET_STANDARD.md` → Sektion "Exempel: Bra vs Dåligt" (rad 237-262)

---

#### 5. Förtydliga Tip 6 (Balansera tekniska och mjuka färdigheter) med konkret exempel

**Nuvarande Tip 6** (rad 203-213):
Text är bra men kan förstärkas med fler konkreta exempel från just detta CV.

**Föreslagen tillägg**:
```
[... befintlig text ...]

**Exempel från detta CV**:
Istället för bara lista "Tvärprofessionellt samarbete" under personliga egenskaper,
backar CV:t upp det med: "Deltar aktivt i tvärprofessionella vårdplaneringsmöten med
sjuksköterskor och läkare" och "Mentor för 6 nya undersköterskor".

Istället för bara "Problemlösning", visa det genom: "Implementerade fallpreventionsåtgärder
som reducerade antalet fall med 20%" – detta BEVISAR problemlösningsförmåga genom konkret
resultat.
```

---

## 📝 SAMMANFATTNING AV DINA UPPGIFTER

**MÅSTE göras (Prioritet 1)**:
1. ✏️ Uppdatera exempelCV tekniska kompetenser (+kompetensnivå på TOP 3: Cosmic, Delegering, Demensvård)
2. ✏️ Omarbeta "Varför det fungerar" Card 2 (lägg till VARFÖR-stycke om siffrors betydelse inom vård)
3. ✏️ Omarbeta "Varför det fungerar" Card 3 (nämn buzzword bingo anti-pattern + förklara VARFÖR bevis > ord)

**Bra att ha (Prioritet 2)**:
4. ✏️ Lägg till fler ❌→✅ exempel i Tip 2 (Kvantifiera erfarenhet)
5. ✏️ Förstärk Tip 6 med konkreta exempel från detta CV

---

## 🎯 LEVERANSFORMAT

Returnera uppdaterad content i samma format som källfilen (TypeScript):

```typescript
{
  // UPPDATERAD exempelCV kompetenser
  exempelCV: {
    kompetenser: {
      tekniska: [
        'Cosmic och Procapita (Expert, 6+ år daglig användning)',
        'Medicinsk delegering - insulin, PEG, subkutana injektioner (Avancerad, 5+ år)',
        'Demensvård och BPSD-hantering (Expert, 5+ år inom geriatrik)',
        'ADL-stöd och personcentrerad vård',
        'Palliativ omvårdnad och smärtlindring',
        'Såromläggning och PVK-skötsel',
        'Akta Ryggen-certifierad förflyttningsteknik'
      ],
      personliga: [
        // Behåll som de är
      ]
    }
  },

  // UPPDATERADE cards (bara de som ändrats)
  varforDetFungerar: [
    {
      rubrik: "Kvantifierbara resultat istället för ansvarsområden",
      text: "[ny text med VARFÖR-stycke som förklarar värdet av siffror inom vård]"
    },
    {
      rubrik: "Balans mellan tekniska och mjuka färdigheter",
      text: "[ny text med buzzword bingo-referens och förklaring varför bevis > ord]"
    }
  ],

  // UPPDATERADE tips (om du gör Prioritet 2)
  tips: [
    {
      rubrik: "Kvantifiera din erfarenhet för ökad trovärdighet",
      text: "[befintlig text]\n\n**Fler exempel på före/efter**:\n❌ ...\n✅ ..."
    }
  ]
}
```

---

## ⏱️ ESTIMERAD TID

- Prioritet 1: **20-25 minuter** (3 uppgifter)
- Prioritet 2: **10-15 minuter** (2 tips-uppdateringar, om tid finns)
- **Total**: 30-40 minuter

---

## ✅ KVALITETSKONTROLL (jag kommer verifiera)

När du är klar kommer jag köra Fas 3.2-validering:
- ✅ Tekniska kompetenser har TOP 3 med nivå (Expert/Avancerad + år)
- ✅ Card 2 förklarar VARFÖR kvantifierbara resultat är avgörande inom vård
- ✅ Card 3 nämner buzzword bingo anti-pattern explicit
- ✅ Före/efter-exempel i minst 2 tips (om Prioritet 2 görs)
- ✅ Brand voice: AI-fri, svensk svenska, konkreta vårdexempel

**Referensdokument du MÅSTE läsa**:
- [`CV_KVALITET_STANDARD.md`](c:\Users\chris\cvbrev\CV_KVALITET_STANDARD.md) → Grundkrav, Anti-patterns, Exempel
- [`CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx`](c:\Users\chris\cvbrev\CV_EXEMPEL_GALLERI_IMPLEMENTATION_V2.mdx) → Fas 2.3

---

## 💡 EXTRA TIPS

**Ton och stil för "Varför det fungerar"-cards**:
- Använd "Varför detta fungerar:" som inledning till VARFÖR-stycket
- Var pedagogisk men inte nedlåtande
- Konkreta exempel från vårdbranschen (inte generiska fraser)
- Visa empati för undersköterskor som söker jobb: "Rekryterare ser hundratals CV:n där..."

**Exempel på bra VARFÖR-formulering**:
> "Rekryterare inom vård ser hundratals CV:n där undersköterskor skriver 'ansvarig för
> patientvård' utan kontext. Vad betyder det? 10 patienter eller 40? Detta CV sticker
> ut genom att ge exakt omfattning: 25-30 patienter dagligen. Det visar att du kan
> hantera hög arbetsbelastning, vilket är kritiskt i svenska vårdmiljöer."

---

Lycka till! Tagga mig när du är klar med Prioritet 1 (minst). 🚀

/SEO-agent
