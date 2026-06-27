// CV Improvement Prompts - Optimized for Swedish CV Standards
// This module provides sophisticated prompt engineering for CV improvements

export interface ImprovementContext {
  originalContent: string;
  selectedSuggestions: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    impact?: string;
    example?: string;
    area?: string;
  }>;
  analysisDetails?: {
    atsFriendliness?: {
      score: number;
      feedback: string;
      missingKeywords?: string[];
    };
    quantificationSuggestions?: string[];
    detailedImprovements?: Array<{
      area: string;
      suggestion: string;
      example?: string;
    }>;
    keywords?: string[];
  };
}

export function generateImprovementPrompt(context: ImprovementContext): string {
  const { originalContent, selectedSuggestions, analysisDetails } = context;

  // Group suggestions by category/area for better organization
  const suggestionsByArea = selectedSuggestions.reduce((acc, sugg) => {
    const area = sugg.area || sugg.category || 'general';
    if (!acc[area]) acc[area] = [];
    acc[area].push(sugg);
    return acc;
  }, {} as Record<string, typeof selectedSuggestions>);

  // Build specific instructions based on selected improvements
  let specificInstructions = '';

  // Add ATS optimization if relevant
  const hasATSImprovement = selectedSuggestions.some(s =>
    s.category === 'ats' || s.category === 'keywords' ||
    s.title.toLowerCase().includes('ats') || s.title.toLowerCase().includes('nyckelord')
  );

  if (hasATSImprovement && analysisDetails?.atsFriendliness?.missingKeywords) {
    specificInstructions += `
### ATS-optimering:
- Inkludera följande nyckelord naturligt i texten: ${analysisDetails.atsFriendliness.missingKeywords.join(', ')}
- Använd standardrubriker (Sammanfattning, Arbetslivserfarenhet, Utbildning, Kompetenser)
- Undvik tabeller, kolumner eller komplex formatering
`;
  }

  // Add quantification improvements
  const hasQuantification = selectedSuggestions.some(s =>
    s.title.toLowerCase().includes('kvantifi') ||
    s.description.toLowerCase().includes('siffror') ||
    s.description.toLowerCase().includes('mätbar')
  );

  if (hasQuantification && analysisDetails?.quantificationSuggestions) {
    specificInstructions += `
### Kvantifiering:
Lägg till konkreta siffror och mätbara resultat särskilt i följande områden:
${analysisDetails.quantificationSuggestions.map(q => `- ${q}`).join('\n')}
`;
  }

  // Build examples from detailed improvements
  let examplesSection = '';
  if (analysisDetails?.detailedImprovements && analysisDetails.detailedImprovements.length > 0) {
    const relevantExamples = analysisDetails.detailedImprovements
      .filter(imp => selectedSuggestions.some(s =>
        s.area === imp.area ||
        s.description.includes(imp.area) ||
        imp.suggestion.toLowerCase().includes(s.title.toLowerCase())
      ))
      .filter(imp => imp.example)
      .slice(0, 3); // Limit to 3 examples to keep prompt manageable

    if (relevantExamples.length > 0) {
      examplesSection = `
### Konkreta exempel på förbättringar:
${relevantExamples.map(imp => `
**${imp.area}:**
Förslag: ${imp.suggestion}
Exempel: ${imp.example}
`).join('\n')}
`;
    }
  }

  // Main prompt
  return `Du är en expert på svenska CV:n och rekrytering. Din uppgift är att förbättra följande CV baserat på specifika förbättringsförslag samtidigt som du behåller all viktig information och personens unika röst.

## ORIGINAL CV:
${originalContent}

## VALDA FÖRBÄTTRINGSFÖRSLAG:
${selectedSuggestions.map(s => `
**${s.title}** (${s.category})
${s.description}
${s.example ? `Exempel: ${s.example}` : ''}
`).join('\n')}

${specificInstructions}

${examplesSection}

## INSTRUKTIONER FÖR FÖRBÄTTRING:

### 1. STRUKTUR OCH FORMAT:
- Behåll CV:ts grundläggande struktur men förbättra organiseringen
- Använd tydliga sektionsrubriker: Sammanfattning/Profil, Arbetslivserfarenhet, Utbildning, Kompetenser, etc.
- Säkerställ konsekvent formatering genom hela dokumentet
- Behåll kontaktinformation exakt som i originalet

### 2. SPRÅK OCH TON:
- Använd professionell men personlig ton. Skriv som en kompetent människa, inte som en mall.
- Skriv i tredje person eller undvik pronomen i beskrivningar
- Använd starka, aktiva verb (ledde, utvecklade, implementerade, optimerade, etc.)
- Var konkret och specifik. Varje påstående ska ha ett belägg: en siffra, ett verktyg, ett resultat. Skriv hellre "Kortade leveranstiden med 18%" än "Bidrog till effektivare processer".
- Variera meningslängd och formulering. Inled inte varje punkt på samma sätt.

**FÖRBJUDET (får CV:t att låta AI-genererat):**
- ALDRIG tankstreck/em-dash (—) någonstans. Använd punkt, komma eller kolon.
- Inga tomma klyschor utan belägg: "dokumenterad förmåga att", "högpresterande team", "passionerad/driven/motiverad individ", "resultatinriktad", "i dagens digitala värld", "tänka utanför boxen".
- Stapla inte adjektiv ("engagerad, noggrann och flexibel"). Visa egenskapen genom en konkret prestation istället.
- Inga inledningsfraser som "Erfaren X med över Y års erfarenhet". Gå rakt på det specifika.

**FORMATKRAV (annars går CV-mallarna sönder):**
- Returnera REN TEXT. Ingen HTML, ingen markdown (**, *, #, <, >, &).
- Skriv en punkt/mening per rad. Använd ALDRIG bullet-tecken (• eller ·) inuti en mening.
- Behåll alltid kvantifierade resultat (siffror, procent, belopp). Flera CV-mallar visar resultatpaneler bara om punkten innehåller en siffra.

### 3. INNEHÅLLSFÖRBÄTTRINGAR:
${selectedSuggestions.map(s => {
  if (s.category === 'content' || s.category === 'structure') {
    return `- ${s.title}: ${s.description}`;
  }
  return null;
}).filter(Boolean).join('\n')}

### 4. SEKTIONSSPECIFIKA RIKTLINJER:

**Sammanfattning/Profil:**
- Skriv en konkret sammanfattning på 3-4 meningar med varierad meningslängd
- Inkludera: yrkestitel, det personen faktiskt gör, och ett eller två belägg (siffror, område, resultat)
- Gör den specifik för PERSONEN, inte en generisk roll. Undvik klyschor och adjektiv-stapling.
- Exempel (rätt ton, ren text, konkret): "Projektledare inom IT med tio års erfarenhet av agila leveranser. Har drivit ett tjugotal projekt från idé till lansering, senast en plattformsmigration som kortade driftkostnaden med 30%. Bygger team som levererar i tid utan att tappa kvalitet."

**Arbetslivserfarenhet:**
- Lista i omvänd kronologisk ordning (senaste först)
- Format: Titel | Företag | Ort | Period
- Använd punktlistor med 2-5 punkter per roll
- Börja varje punkt med ett starkt verb
- Inkludera konkreta resultat och prestationer
- Kvantifiera när möjligt (ökade försäljningen med X%, ledde team om Y personer)

**Utbildning:**
- Lista i omvänd kronologisk ordning
- Inkludera: Examen/Program | Lärosäte | År
- Ta med relevanta kurser eller projekt om nyexaminerad

**Kompetenser:**
- Gruppera kompetenser logiskt (Tekniska färdigheter, Språk, Certifieringar, etc.)
- Prioritera mest relevanta färdigheter först
- Var specifik med verktyg och teknologier

### 5. KRITISKA KRAV:
✓ Behåll ALL faktainformation från originalet (datum, företagsnamn, titlar, etc.)
✓ Korrigera uppenbara stavfel och grammatiska fel
✓ Säkerställ att förbättrat CV är på svenska
✓ Implementera ENDAST de valda förbättringsförslagen
✓ Behåll personens unika erfarenheter och prestationer
✓ Gör texten mer kraftfull utan att överdriva eller ljuga

### 6. VANLIGA SVENSKA CV-STANDARDER:
- Håll CV:t till max 2 sidor (idealt)
- Använd enkelt, läsbart format
- Inkludera språkkunskaper med nivå (Modersmål, Flytande, Goda kunskaper, Grundläggande)
- Lista körkort om relevant för tjänsten
- Ange "Referenser lämnas på begäran" sist om inte redan inkluderat

## OUTPUT:
Returnera ENDAST det förbättrade CV:t. Ingen förklaring, ingen kommentar, ingen metadata.
Börja direkt med personens namn och kontaktinformation.
Formatera professionellt med tydliga sektioner.`;
}

export function generateSystemPrompt(): string {
  return `Du är en professionell CV-expert specialiserad på svenska arbetsmarknaden.
Din expertis omfattar:
- Djup förståelse för svenska rekryteringsstandarder och förväntningar
- ATS-optimering och nyckelordsanalys
- Branschspecifika CV-konventioner
- Konkret, trovärdig språkanvändning som låter mänsklig, aldrig mall-aktig
- Kvantifiering av prestationer och resultat

Du hjälper kandidater att lyfta sina CV:n från genomsnittliga till starka genom att:
1. Bevara deras unika erfarenheter och personlighet
2. Förstärka deras prestationer med konkreta exempel och siffror
3. Optimera för både mänskliga rekryterare och ATS-system
4. Säkerställa professionell presentation och struktur

Du skriver som en kunnig människa, inte som en AI: konkret, varierat och utan klyschor. Du använder aldrig tankstreck (—) och staplar aldrig tomma adjektiv. Du är alltid ärlig och överdriver aldrig - du hjälper kandidater att presentera sina faktiska erfarenheter på bästa möjliga sätt.`;
}

export function validateImprovedCV(original: string, improved: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check that key information is preserved
  const originalLower = original.toLowerCase();
  const improvedLower = improved.toLowerCase();

  // Extract key data points from original (simplified check)
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /[\d\s-+()]+/g;

  const originalEmails = original.match(emailRegex) || [];
  const improvedEmails = improved.match(emailRegex) || [];

  if (originalEmails.length > 0 && !originalEmails.every(email =>
    improvedEmails.some(e => e.toLowerCase() === email.toLowerCase())
  )) {
    issues.push('E-postadress saknas eller har ändrats');
  }

  // Check that improved version is not too short
  if (improved.length < original.length * 0.7) {
    issues.push('Förbättrad version verkar för kort - viktig information kan ha förlorats');
  }

  // Check that improved version is not just the original
  if (improved === original) {
    issues.push('Ingen förbättring har gjorts');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}