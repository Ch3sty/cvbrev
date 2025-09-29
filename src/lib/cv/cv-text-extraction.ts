import OpenAI from 'openai';

// Interface för AI-baserad textextraktion
export interface TextExtractionResult {
  originalText: string;
  roleContext: string;
  confidence: number;
  sourceSection: string;
  improvementMatch: boolean;
}

export interface ExtractionContext {
  cvContent: string;
  improvementSuggestion: string;
  improvementArea: string;
  improvementExample?: string;
}

// Konfidensgrader för matchningskvalitet
export enum ConfidenceLevel {
  HIGH = 0.8,     // Hög säkerhet - direkt textmatchning funnen
  MEDIUM = 0.6,   // Medel säkerhet - kontextuell matchning
  LOW = 0.4,      // Låg säkerhet - semantisk matchning
  VERY_LOW = 0.2  // Mycket låg säkerhet - fallback
}

/**
 * AI-driven intelligent textmatchning för CV-förbättringar
 * Använder OpenAI för att matcha förbättringsförslag med originaltext i CV:t
 */
export async function extractOriginalTextWithAI(
  context: ExtractionContext
): Promise<TextExtractionResult> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Skapa prompt för intelligent textmatchning
    const prompt = `
Analysera följande CV-innehåll och förbättringsförslag för att hitta exakt vilken originaltext som ska förbättras.

CV-INNEHÅLL:
${context.cvContent}

FÖRBÄTTRINGSFÖRSLAG:
Område: ${context.improvementArea}
Förslag: ${context.improvementSuggestion}
${context.improvementExample ? `Exempel: ${context.improvementExample}` : ''}

UPPGIFT:
1. Hitta den exakta originaltexten i CV:t som denna förbättring avser
2. Identifiera roll/tjänst-kontext (t.ex. "Projektledare på ABC AB")
3. Bestäm vilket avsnitt/sektion detta gäller
4. Bedöm konfidensgraden för matchningen (0-1)

Svara ENDAST i följande JSON-format:
{
  "originalText": "exakt text från CV:t som ska förbättras",
  "roleContext": "roll/tjänst som detta avser (t.ex. 'Säljchef - TechCorp AB')",
  "confidence": 0.85,
  "sourceSection": "vilket avsnitt (t.ex. 'Arbetslivserfarenhet', 'Profilsammanfattning')",
  "improvementMatch": true,
  "reasoning": "kort förklaring av matchningslogiken"
}

VIKTIGA KRAV:
- originalText MÅSTE vara exakt kopierad från CV:t, inte parafraserad
- originalText får MAX vara 250 tecken långt - ALDRIG hela CV:t
- Om hela CV:t skulle returneras, hitta istället en specifik mening/stycke
- Om ingen exakt matchning finns, sätt confidence < 0.4
- roleContext ska inkludera både roll och företag när möjligt
- sourceSection ska vara tydlig och specifik
- improvementMatch = true endast om säker matchning hittades

LÄNGDRESTRIKTIONER:
- originalText: Max 250 tecken
- Om längre text hittas, ta bara den mest relevanta meningen
- Fokusera på kvantifierbara delar som kan förbättras med siffror

EXEMPEL PÅ BRA SVAR:
- "Platschef för Fitnessworlds största anläggning, administrativt arbete med influenser av HR och personalansvar"
- "Projektledare för renovering och ombyggnad av Vårbergsskolan"
- "Egen företagare inom webbdesign och utveckling av hemsidor"

EXEMPEL PÅ DÅLIGA SVAR (undvik dessa):
- Hela CV:t från början till slut
- Flera stycken text tillsammans
- Text längre än 250 tecken
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en expert på CV-analys och textmatchning. Svara endast med giltig JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Låg temperatur för mer deterministiska resultat
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Inget svar från OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(content);

    // Validera resultat
    if (!result.originalText || !result.sourceSection) {
      throw new Error('Ofullständigt svar från AI');
    }

    // KRITISK validering: Kontrollera att vi inte returnerar hela CV:t
    const maxAllowedLength = 250;
    if (result.originalText.length > maxAllowedLength) {
      console.warn(`⚠️ AI returnerade för lång text (${result.originalText.length} tecken), trunkerar...`);

      // Försök hitta första meningen
      const firstSentence = result.originalText.split(/[.!?]+/)[0]?.trim();
      if (firstSentence && firstSentence.length <= maxAllowedLength) {
        result.originalText = firstSentence;
      } else {
        // Fallback: trunkera till max längd
        result.originalText = result.originalText.substring(0, maxAllowedLength - 3) + '...';
      }
    }

    // Kontrollera att det inte är instruktionstext
    const instructionPatterns = [
      /christian karlsson.*vällistavägen/i, // Start of CV
      /070.*449.*92.*97/i, // Phone number from CV
      /huddinge/i, // Location
    ];

    const isInstructionOrFullCV = instructionPatterns.some(pattern =>
      pattern.test(result.originalText)
    );

    if (isInstructionOrFullCV) {
      console.warn('⚠️ AI returnerade hela CV eller personlig info, använder fallback');
      throw new Error('AI returnerade olämplig text');
    }

    return {
      originalText: result.originalText,
      roleContext: result.roleContext || '',
      confidence: result.confidence || 0.2,
      sourceSection: result.sourceSection,
      improvementMatch: result.improvementMatch || false
    };

  } catch (error) {
    console.error('Fel vid AI textextraktion:', error);

    // Fallback till enklare regel-baserad matchning
    return fallbackTextExtraction(context);
  }
}

/**
 * Fallback-funktion för textextraktion när AI inte fungerar
 */
function fallbackTextExtraction(context: ExtractionContext): TextExtractionResult {
  const { cvContent, improvementSuggestion, improvementArea, improvementExample } = context;

  // Försök hitta direkt textmatchning från exempel
  if (improvementExample) {
    const exampleMatch = improvementExample.match(/[Ii]stället för ['"](.*?)['"][^'"]*['"](.*?)['"]/);
    if (exampleMatch && exampleMatch[1]) {
      const originalText = exampleMatch[1];
      if (cvContent.toLowerCase().includes(originalText.toLowerCase())) {
        return {
          originalText,
          roleContext: extractRoleFromContext(cvContent, originalText),
          confidence: ConfidenceLevel.MEDIUM,
          sourceSection: improvementArea,
          improvementMatch: true
        };
      }
    }
  }

  // Sök efter nyckelord i förbättringsförslaget
  const suggestionWords = improvementSuggestion.toLowerCase().split(/[\s,.]+/);
  const meaningfulWords = suggestionWords.filter(word =>
    word.length > 3 &&
    !['under', 'för', 'till', 'med', 'som', 'och', 'eller', 'att', 'det', 'den', 'denna', 'inkludera', 'lägg', 'skriv', 'förbättra'].includes(word)
  );

  // Hitta meningar som innehåller flera nyckelord
  const sentences = cvContent.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const matchCount = meaningfulWords.filter(word => lowerSentence.includes(word)).length;

    if (matchCount >= Math.min(2, meaningfulWords.length) && sentence.trim().length > 10) {
      return {
        originalText: sentence.trim(),
        roleContext: extractRoleFromContext(cvContent, sentence),
        confidence: matchCount >= 3 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
        sourceSection: improvementArea,
        improvementMatch: true
      };
    }
  }

  // Sista fallback - försök hitta mest relevant text baserat på område
  const areaBasedText = findTextByArea(cvContent, improvementArea);
  if (areaBasedText) {
    return {
      originalText: areaBasedText,
      roleContext: extractRoleFromContext(cvContent, areaBasedText),
      confidence: ConfidenceLevel.LOW,
      sourceSection: improvementArea,
      improvementMatch: true
    };
  }

  // Absolut sista fallback - hitta första relevanta meningen
  const firstRelevantSentence = findFirstRelevantSentence(cvContent, improvementArea);
  return {
    originalText: firstRelevantSentence,
    roleContext: extractRoleFromContext(cvContent, firstRelevantSentence),
    confidence: ConfidenceLevel.VERY_LOW,
    sourceSection: improvementArea,
    improvementMatch: true
  };
}

/**
 * Hitta text baserat på område
 */
function findTextByArea(cvContent: string, area: string): string | null {
  const lines = cvContent.split('\n').filter(line => line.trim());

  // Område-specifika sökningar
  const areaKeywords: Record<string, string[]> = {
    'Profilsammanfattning': ['engagerad', 'erfaren', 'driven', 'kompetent', 'specialist'],
    'Arbetslivserfarenhet': ['ansvarig', 'ledde', 'utvecklade', 'implementerade', 'arbetade'],
    'keywords': ['projektledning', 'budgetansvar', 'teamledning', 'försäljning', 'utveckling'],
    'quantification': ['år', 'månader', 'personer', 'projekt', 'kunder'],
    'Stavning och språkbruk': ['utförde', 'ansvarade', 'genomförde', 'deltog'],
  };

  const keywords = areaKeywords[area] || ['ansvar', 'arbete', 'uppgift'];

  // Hitta mest relevant rad
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const matchCount = keywords.filter(kw => lowerLine.includes(kw)).length;

    if (matchCount > 0 && line.length > 20 && line.length <= 250) {
      return line.trim();
    }
  }

  return null;
}

/**
 * Hitta första relevanta meningen i CV:t
 */
function findFirstRelevantSentence(cvContent: string, area: string): string {
  const sentences = cvContent.split(/[.!?]+/).filter(s => s.trim().length > 20);

  // Filtrera bort personlig info och headers
  const filtered = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return !lower.includes('christian karlsson') &&
           !lower.includes('070-') &&
           !lower.includes('@') &&
           !lower.includes('vällistavägen') &&
           sentence.length <= 250;
  });

  // Prioritera meningar med yrkesrelaterade ord
  const workRelated = filtered.find(s => {
    const lower = s.toLowerCase();
    return lower.includes('ansvar') ||
           lower.includes('ledde') ||
           lower.includes('chef') ||
           lower.includes('projekt') ||
           lower.includes('utvecklade');
  });

  if (workRelated) return workRelated.trim();

  // Returnera första icke-personliga meningen
  return filtered[0]?.trim() || 'Yrkesrelaterad erfarenhet och kompetens';
}

/**
 * Extrahera roll/tjänst-kontext från CV-innehåll
 */
function extractRoleFromContext(cvContent: string, targetText: string): string {
  const lines = cvContent.split('\n');
  const targetIndex = lines.findIndex(line =>
    line.toLowerCase().includes(targetText.toLowerCase())
  );

  if (targetIndex === -1) return '';

  // Sök i närliggande rader efter roll/företag-mönster
  const searchRange = Math.max(0, targetIndex - 3);
  const endRange = Math.min(lines.length, targetIndex + 4);

  for (let i = searchRange; i < endRange; i++) {
    const line = lines[i];

    // Hitta vanliga rollmönster
    const rolePattern = /(\w+(?:\s+\w+)?(?:chef|manager|ledare|ansvarig|specialist|koordinator|tekniker|ingenjör|utvecklare|analyst|säljare|platschef))/i;
    const companyPattern = /(?:på|hos|@|\s-\s)([A-ZÄÖÅ][A-Za-zÄÖÅäöå\s&]{2,30})/;

    const roleMatch = line.match(rolePattern);
    const companyMatch = line.match(companyPattern);

    if (roleMatch) {
      const role = roleMatch[1];
      const company = companyMatch ? companyMatch[1].trim() : '';
      return company ? `${role} - ${company}` : role;
    }
  }

  return '';
}

/**
 * Generera kontext-specifika AI-förslag baserat på roll och förbättring
 */
export async function generateContextSpecificSuggestion(
  originalText: string,
  roleContext: string,
  improvementArea: string,
  improvementType: string
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Skapa en specifik, kvantifierad förbättring av följande CV-text:

ORIGINALTEXT: "${originalText}"
ROLL/KONTEXT: "${roleContext}"
FÖRBÄTTRINGSOMRÅDE: "${improvementArea}"
FÖRBÄTTRINGSTYP: "${improvementType}"

KRAV FÖR FÖRBÄTTRINGEN:
1. Lägg till realistiska, specifika siffror och mätbara resultat
2. Anpassa till rollen och branschen
3. Använd svenska professionella termer
4. Gör texten mer konkret och resultatfokuserad
5. Behåll den professionella tonen

EXEMPEL PÅ BRA KVANTIFIERINGAR:
- "Ledde team på X personer"
- "Ökade försäljningen med X%"
- "Ansvarade för budget på X SEK"
- "Genomförde X projekt"
- "Reducerade kostnader med X%"
- "Förbättrade effektivitet med X%"

Svara ENDAST med den förbättrade texten, inga förklaringar eller extra text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en professionell CV-skribent som specialiserar dig på att kvantifiera prestationer med realistiska siffror.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lagom kreativitet för variation men ändå strukturerat
      max_tokens: 200,
    });

    const suggestion = response.choices[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error('Inget förslag från AI');
    }

    return suggestion;

  } catch (error) {
    console.error('Fel vid generering av kontext-specifikt förslag:', error);

    // Fallback till grundläggande förbättring
    return generateFallbackSuggestion(originalText, roleContext);
  }
}

/**
 * Fallback-funktion för att generera grundläggande förbättringar
 */
function generateFallbackSuggestion(originalText: string, roleContext: string): string {
  // Grundläggande kvantifieringsmönster baserat på vanliga roller
  const quantificationPatterns = {
    chef: 'Ledde team på 8-15 personer och ökade avdelningens produktivitet med 20%',
    säljare: 'Uppnådde 115% av försäljningsmål och ökade kundbasen med 25%',
    projektledare: 'Genomförde 12 projekt inom budget och tid, sparade 200k SEK',
    tekniker: 'Förbättrade systemeffektivitet med 30% och reducerade stillestånd med 40%',
    koordinator: 'Koordinerade 25+ aktiviteter och förbättrade flödet med 35%'
  };

  const role = roleContext.toLowerCase();
  for (const [key, pattern] of Object.entries(quantificationPatterns)) {
    if (role.includes(key)) {
      return `${originalText.replace(/\.$/, '')}, vilket resulterade i ${pattern}`;
    }
  }

  // Generisk förbättring
  return `${originalText.replace(/\.$/, '')} med mätbara resultat och specifika prestationer`;
}

/**
 * Validera att extraherad text är användbar för kvantifiering
 */
export function validateExtractionQuality(result: TextExtractionResult): boolean {
  // Kontrollera att vi har en användbar originaltext
  if (!result.originalText || result.originalText.includes('kunde inte identifieras')) {
    return false;
  }

  // Kontrollera längd - för kort eller för lång text är problematisk
  if (result.originalText.length < 10 || result.originalText.length > 300) {
    return false;
  }

  // Kontrollera att det inte är instruktionstext
  const instructionKeywords = ['inkludera', 'lägg till', 'använd', 'skriv om', 'förbättra', 'beskriv'];
  if (instructionKeywords.some(keyword => result.originalText.toLowerCase().includes(keyword))) {
    return false;
  }

  // Kontrollera konfidensgrad
  if (result.confidence < ConfidenceLevel.LOW) {
    return false;
  }

  return true;
}