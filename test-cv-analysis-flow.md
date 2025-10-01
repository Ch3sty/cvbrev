# CV-Analys Flöde - Test Guide

## Vad som har implementerats

### 1. AI-Prompt Uppdatering (cv-analysis.ts)
- ✅ `analyzeCvPremium()` accepterar nu `parsedCV` som parameter
- ✅ AI genererar roll-baserade förbättringar direkt i analysen
- ✅ Varje roll får EN komplett förbättrad text (minst 80 ord)
- ✅ Kombinerar alla förbättringstyper (ATS, kvantifiering, grammatik) i samma text

### 2. API Route Fix (analyze/route.ts)
- ✅ Kör `parseCV` först för att identifiera roller
- ✅ Skickar `parsedCV` till `analyzeCvPremium()`
- ✅ Tar bort duplicerad roll-baserad generering
- ✅ Loggar AI-genererade roll-förbättringar

### 3. Nya UI-Komponenter
- ✅ `CVSectionAnalysisOverview` - Huvudkomponent för sektion-baserad analys
- ✅ `SectionCard` - Kort för varje arbetsplats/roll med expanderbar före/efter-jämförelse
- ✅ `BeforeAfterComparison` - Visuell jämförelse med markerade nyckelord och siffror

### 4. Integration i CvAnalysisResults
- ✅ Visar ny sektion-baserad vy för premium-användare med roll-förbättringar
- ✅ Fallback till gammal vy om inga roll-förbättringar finns
- ✅ "Generera AI-förbättringar"-knapp i översikten

## Testplan

### Steg 1: Starta utvecklingsmiljön
```bash
npm run dev
```

### Steg 2: Logga in som premium-användare
1. Gå till https://jobbcoach.ai/dashboard/cv-analys
2. Logga in med ett premium-konto

### Steg 3: Ladda upp test-CV
Använd Christian Karlssons CV (finns redan i systemet) eller skapa ett nytt med minst 3 arbetsroller.

### Steg 4: Kör analys
1. Klicka på "Analysera CV"
2. Vänta på analysen att slutföras

### Steg 5: Verifiera resultat

#### Förväntat resultat (FÖRSTA ANALYSEN):

**Översikt:**
- ✅ ATS-poäng visas (cirkulär progress bar)
- ✅ Antal förbättringar visas (t.ex. "12 förbättringar identifierade")
- ✅ Antal sektioner visas (t.ex. "3 sektioner att förbättra")

**Prioriterade Förbättringar:**
- ✅ Röd badge för "kritiska" förbättringar (saknar kvantifiering + högt ATS-impact)
- ✅ Orange badge för "högt prioriterade" förbättringar

**Sektion-kort:**
- ✅ Varje arbetsplats/roll visas som separat kort
- ✅ Visar: "Platschef - Fitnessworld Skärholmen"
- ✅ Visar period: "2014 - pågående"
- ✅ Visar förbättrings-badges: "Behöver kvantifiering", "3 nyckelord", etc.
- ✅ Visar ATS-impact: "+15 ATS"

**Expanderat kort:**
- ✅ Klicka "Visa förbättring" öppnar före/efter-jämförelse
- ✅ "Nuvarande text" visas i grått kort
- ✅ "AI-förbättrad text" visas i grönt kort med ✨ Sparkles-ikon
- ✅ Nyckelord markerade i lila
- ✅ Siffror markerade i blått
- ✅ Badges: "Kvantifierat", "3 nyckelord tillagda"

**Allmänna förbättringar:**
- ✅ Sektion för "Profilsammanfattning", "Färdigheter", etc.
- ✅ Varje förbättring i lila kort med förslag och exempel

### Steg 6: Klicka "Generera AI-förbättringar"
1. Klicka på knappen i översikten
2. Observera vad som händer

#### Förväntat resultat (ANDRA STEGET):
Detta är där det gamla flödet failade med "0 av 0 roller valda". Nu ska det fungera:

- ✅ AI-förbättrade exempel visas automatiskt (inga tomma kort)
- ✅ Varje roll har `suggestedText` med minst 80 ord
- ✅ Text innehåller konkreta siffror och nyckelord
- ✅ Användaren kan välja, redigera eller skippa per roll

## Felsökning

### Problem: "0 av 0 roller valda"
**Orsak:** AI genererade inte `roleBasedImprovements`
**Lösning:**
1. Öppna browser console (F12)
2. Leta efter logg: "✅ AI generated X role-based improvements"
3. Om X = 0, kolla AI-response i Network-tab

### Problem: Sektion-baserad vy visas inte
**Orsak:** `roleBasedImprovements` array är tom eller undefined
**Lösning:**
1. Kontrollera i console: `📊 Role-based improvements from AI:`
2. Om "SAKNAS" visas i textPreview, kolla AI-prompten i `cv-analysis.ts`

### Problem: suggestedText är för kort
**Orsak:** AI följde inte instruktionen om minst 80 ord
**Lösning:**
1. Öppna `src/lib/openai/cv-analysis.ts`
2. Kolla att systemPrompt innehåller: "minst 80 ord"
3. Öka `max_tokens` från 3000 till 4000 om nödvändigt

## Console-loggar att leta efter

### Lyckad analys:
```
🚀 Starting sequential analysis (parseCV → analyzeCv)...
✓ CV parsing completed, found 3 roles
⏱️ Analysis completed in 8500ms
✅ AI generated 3 role-based improvements
📊 Role-based improvements from AI: [
  {
    role: 'Platschef - Fitnessworld Skärholmen',
    hasSuggestedText: true,
    textLength: 156,
    textPreview: 'Ledde Stockholms största träningsanläggning (Fitnessworld Skärholmen) med 3500...'
  },
  ...
]
```

### Misslyckad analys (inget genererat):
```
✅ AI generated 0 role-based improvements
```
→ Detta betyder att AI inte returnerade `roleBasedImprovements` i JSON-response

## Nästa steg efter lyckad test

1. ✅ Verifiera att alla 3 roller har förbättrad text
2. ✅ Kontrollera att texten innehåller konkreta siffror
3. ✅ Verifiera att nyckelord är relevanta för rollen
4. ✅ Testa att expandera/kollapsera sektion-kort fungerar
5. ✅ Testa hela improvement-workflow från start till slut

## Kända begränsningar

- AI kan ibland generera kortare text än 80 ord (justeras genom prompt-tuning)
- Vissa roller kan få generisk text om CV-beskrivningen är för kort
- ATS-impact-poäng är estimerade (0-20) baserat på förbättringar

## Success Criteria

✅ **Första analysen:**
- Roll-baserade förbättringar visas per sektion
- Varje roll har komplett före/efter-text
- Prioritering fungerar (kritisk/hög/mellan/låg)

✅ **Andra analysen (workflow):**
- Inga "0 av 0 roller valda"-meddelanden
- AI-genererade exempel visas direkt
- Användaren kan applicera förbättringar

✅ **Tekniskt:**
- Inga TypeScript-fel
- Inga console-errors
- API-anrop slutförs på < 15 sekunder
