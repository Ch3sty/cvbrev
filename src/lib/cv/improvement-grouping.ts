import { extractOriginalTextWithAI, type ExtractionContext } from './cv-text-extraction';

/**
 * Utility functions for intelligent grouping of CV improvements
 * Groups related improvements that affect the same text section
 * Combines quantification and keywords into unified suggestions
 * Uses AI-powered text extraction for precise matching
 * Includes fuzzy matching to prevent text duplication
 */

/**
 * Calculate text similarity using Levenshtein distance
 * Returns a similarity score between 0 and 1
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const a = text1.toLowerCase().trim();
  const b = text2.toLowerCase().trim();

  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Use simplified Levenshtein distance
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[bLen][aLen];
  const maxLength = Math.max(aLen, bLen);
  return 1 - (distance / maxLength);
}

/**
 * Check if two texts are similar based on a threshold
 */
function areTextsSimilar(text1: string, text2: string, threshold = 0.8): boolean {
  return calculateTextSimilarity(text1, text2) > threshold;
}

export interface GroupedImprovement {
  id: string;
  textSection: string; // The unique text section from CV
  originalText: string; // Original text from the CV
  improvements: {
    quantification?: string; // Quantification suggestion
    keywords?: string[]; // Keywords to include
    other?: string[]; // Other improvement types
  };
  combinedSuggestion: string; // Combined suggestion with both quantification AND keywords
  aiExample: string; // AI-generated example incorporating all improvements
  userChoice: 'ai' | 'custom';
  customText?: string;
  confidence: number; // Confidence level for text matching (0-1)
  sourceImprovements: string[]; // IDs of original improvements that were grouped
  area?: string; // Area/section in CV (e.g., "Arbetslivserfarenhet")
  roleContext?: string; // Role/position context
}

export interface ParsedRole {
  title: string;
  company: string;
  period?: string;
  description?: string;
  originalText?: string;
}

export interface ImprovementToGroup {
  id: string;
  category: string;
  area?: string;
  description: string;
  example?: string;
  type: 'quantification' | 'keywords' | 'structure' | 'content' | 'other';
  selected: boolean;
}

/**
 * Groups improvements that affect the same text section
 * Intelligently combines quantification and keyword improvements
 * Uses AI-powered text extraction for precise matching
 */
export async function groupRelatedImprovements(
  improvements: ImprovementToGroup[],
  cvText: string,
  detailedAnalysis?: any,
  parsedRoles?: any[]
): Promise<GroupedImprovement[]> {
  const groups = new Map<string, GroupedImprovement>();
  const processedIds = new Set<string>();

  console.log('🔍 Starting intelligent grouping with AI text extraction...');

  // First pass: identify text sections using AI and create initial groups with fuzzy matching
  for (const improvement of improvements) {
    if (!improvement.selected || processedIds.has(improvement.id)) {
      continue;
    }

    try {
      // Use AI to extract the precise text section
      const textSection = await extractTextSectionWithAI(improvement, cvText, detailedAnalysis);

      if (!textSection || textSection.includes('kunde inte identifieras')) {
        console.warn('Could not extract text section for improvement:', improvement.id);
        continue;
      }

      // Validate that extracted text is reasonable (not whole CV)
      if (textSection.length > 300) {
        console.warn('Extracted text too long, truncating:', textSection.substring(0, 100), '...');
        const truncated = truncateToRelevantPart(textSection, improvement);
        if (!truncated || truncated.length > 300) {
          continue;
        }
      }

      // Check for similar existing groups using fuzzy matching
      let existingGroup: GroupedImprovement | null = null;

      for (const [_, group] of groups) {
        // Use a lower threshold (0.7) to catch more similar texts while avoiding false positives
        if (areTextsSimilar(textSection, group.originalText, 0.7)) {
          console.log(`🔗 Found similar text (${(calculateTextSimilarity(textSection, group.originalText) * 100).toFixed(1)}% match), grouping with existing: "${group.originalText.substring(0, 50)}..."`);
          existingGroup = group;
          break;
        }
      }

      if (!existingGroup) {
        // Create new group with enhanced role context
        const roleContext = extractEnhancedRoleContext(textSection, cvText, parsedRoles);
        const groupKey = generateGroupKey(textSection);

        existingGroup = {
          id: `group_${groups.size + 1}`,
          textSection: groupKey,
          originalText: textSection,
          improvements: {},
          combinedSuggestion: '',
          aiExample: '',
          userChoice: 'ai',
          confidence: 0.8,
          sourceImprovements: [],
          area: improvement.area,
          roleContext: roleContext
        };

        groups.set(groupKey, existingGroup);
        console.log(`✨ Created new group for: "${textSection.substring(0, 50)}..." with role: ${roleContext}`);
      }

      // Add improvement to appropriate category
      if (improvement.type === 'quantification') {
        existingGroup.improvements.quantification = improvement.description;
      } else if (improvement.type === 'keywords') {
        existingGroup.improvements.keywords = extractKeywords(improvement.description);
      } else {
        existingGroup.improvements.other = existingGroup.improvements.other || [];
        existingGroup.improvements.other.push(improvement.description);
      }

      existingGroup.sourceImprovements.push(improvement.id);
      processedIds.add(improvement.id);

    } catch (error) {
      console.error('Error processing improvement:', improvement.id, error);
      // Continue with next improvement instead of failing completely
      continue;
    }
  }

  console.log(`🔗 Created ${groups.size} groups from ${improvements.filter(i => i.selected).length} improvements`);

  // Second pass: generate combined suggestions for each group
  groups.forEach(group => {
    group.combinedSuggestion = generateCombinedSuggestion(group);
    group.aiExample = generateAIExample(group);
  });

  return Array.from(groups.values());
}

/**
 * Extracts the specific text section from CV using AI for precise matching
 */
async function extractTextSectionWithAI(
  improvement: ImprovementToGroup,
  cvText: string,
  detailedAnalysis?: any
): Promise<string> {
  try {
    // First try AI extraction
    const context: ExtractionContext = {
      cvContent: cvText,
      improvementSuggestion: improvement.description,
      improvementArea: improvement.area || '',
      improvementExample: improvement.example
    };

    const result = await extractOriginalTextWithAI(context);

    if (result.improvementMatch && result.confidence > 0.4) {
      // Validate length to avoid whole CV being returned
      if (result.originalText.length <= 250) {
        return result.originalText;
      } else {
        // Truncate to relevant part if too long
        return truncateToRelevantPart(result.originalText, improvement);
      }
    }

    // Fallback to rule-based extraction if AI fails or has low confidence
    return extractTextSection(improvement, cvText, detailedAnalysis);

  } catch (error) {
    console.warn('AI text extraction failed, using fallback:', error);
    return extractTextSection(improvement, cvText, detailedAnalysis);
  }
}

/**
 * Truncates long text to the most relevant part based on improvement context
 */
function truncateToRelevantPart(longText: string, improvement: ImprovementToGroup): string {
  // Split into sentences
  const sentences = longText.split(/[.!?]+/);
  if (sentences.length <= 1) {
    // If no sentence breaks, truncate to first 200 chars
    return longText.substring(0, 200).trim() + (longText.length > 200 ? '...' : '');
  }

  // Find the most relevant sentence based on improvement keywords
  const keywords = improvement.description.toLowerCase()
    .split(/[\s,.:;!?]+/)
    .filter(word => word.length > 3 && !['för', 'och', 'att', 'med', 'som', 'den', 'det'].includes(word));

  let bestSentence = sentences[0];
  let bestScore = 0;

  for (const sentence of sentences) {
    if (sentence.trim().length < 10) continue;

    const lowerSentence = sentence.toLowerCase();
    const matchCount = keywords.filter(keyword => lowerSentence.includes(keyword)).length;
    const score = matchCount / Math.max(keywords.length, 1);

    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  return bestSentence.trim() || longText.substring(0, 200) + '...';
}

/**
 * Legacy text extraction function - now used as fallback
 * Uses intelligent pattern matching and semantic analysis to avoid returning whole CV
 */
function extractTextSection(
  improvement: ImprovementToGroup,
  cvText: string,
  detailedAnalysis?: any
): string {
  // Step 1: Try direct keyword matching from improvement description/example
  const extractedText = extractByKeywordMatching(improvement, cvText);
  if (extractedText && extractedText !== 'unknown') {
    // Validate length - never return more than 200 characters
    if (extractedText.length <= 200) {
      return extractedText;
    } else {
      // If too long, try to extract just the relevant sentence
      return extractRelevantSentence(extractedText, improvement);
    }
  }

  // Step 2: Try semantic matching using improvement context
  const semanticMatch = extractBySemanticMatching(improvement, cvText);
  if (semanticMatch && semanticMatch !== 'unknown') {
    return semanticMatch;
  }

  // Step 3: Extract from detailed analysis if available
  if (detailedAnalysis) {
    const analysisMatch = extractFromDetailedAnalysis(improvement, detailedAnalysis);
    if (analysisMatch && analysisMatch !== 'unknown') {
      return analysisMatch;
    }
  }

  // Step 4: Last resort - return descriptive placeholder instead of 'unknown'
  return generateDescriptivePlaceholder(improvement);
}

/**
 * Extract text using keyword matching from improvement description and example
 */
function extractByKeywordMatching(
  improvement: ImprovementToGroup,
  cvText: string
): string {
  const description = improvement.description.toLowerCase();
  const cvLines = cvText.split('\n').filter(line => line.trim().length > 5);

  // Look for direct quotes in the improvement example first
  if (improvement.example) {
    const quoteMatches = improvement.example.match(/["']([^"']{10,150})["']/g);
    if (quoteMatches) {
      for (const quote of quoteMatches) {
        const cleanQuote = quote.slice(1, -1); // Remove quotes
        const matchingLine = cvLines.find(line =>
          line.toLowerCase().includes(cleanQuote.toLowerCase())
        );
        if (matchingLine && matchingLine.length <= 200) {
          return matchingLine.trim();
        }
      }
    }
  }

  // Role-specific keyword matching with better precision
  const roleKeywords = {
    'platschef': ['platschef', 'fitnessworld', 'gym', 'träning'],
    'projektledare': ['projekt', 'ledare', 'vårbergsskolan', 'byggprojekt'],
    'webbdesign': ['webbdesign', 'webdesign', 'hemsida', 'wordpress'],
    'snickare': ['snickare', 'renovering', 'byggarbete', 'konstruktion']
  };

  for (const [role, keywords] of Object.entries(roleKeywords)) {
    if (description.includes(role)) {
      for (const keyword of keywords) {
        const matchingLine = cvLines.find(line => {
          const lowerLine = line.toLowerCase();
          return lowerLine.includes(keyword) && line.length <= 200;
        });
        if (matchingLine) {
          return matchingLine.trim();
        }
      }
    }
  }

  return 'unknown';
}

/**
 * Extract using semantic matching - find sentences with multiple relevant keywords
 */
function extractBySemanticMatching(
  improvement: ImprovementToGroup,
  cvText: string
): string {
  const description = improvement.description.toLowerCase();

  // Extract meaningful keywords from the improvement description
  const keywords = description
    .split(/[\s,.:;!?]+/)
    .filter(word =>
      word.length > 3 &&
      !['för', 'och', 'att', 'med', 'som', 'den', 'det', 'till', 'från', 'under', 'över', 'inkludera', 'lägg', 'skriv', 'förbättra', 'använd', 'beskriv'].includes(word)
    );

  if (keywords.length === 0) return 'unknown';

  // Split CV into sentences
  const sentences = cvText.split(/[.!?]+/).filter(s => s.trim().length > 10);

  let bestMatch = '';
  let bestScore = 0;

  for (const sentence of sentences) {
    if (sentence.length > 200) continue; // Skip sentences that are too long

    const lowerSentence = sentence.toLowerCase();
    const matchCount = keywords.filter(keyword =>
      lowerSentence.includes(keyword)
    ).length;

    const score = matchCount / keywords.length;

    if (score > bestScore && matchCount >= 2) {
      bestScore = score;
      bestMatch = sentence.trim();
    }
  }

  return bestScore > 0.3 ? bestMatch : 'unknown';
}

/**
 * Extract from detailed analysis data if available
 */
function extractFromDetailedAnalysis(
  improvement: ImprovementToGroup,
  detailedAnalysis: any
): string {
  try {
    if (detailedAnalysis.sections) {
      for (const section of detailedAnalysis.sections) {
        if (section.area === improvement.area && section.content) {
          // Look for specific content chunks in the section
          if (Array.isArray(section.content)) {
            for (const item of section.content) {
              if (typeof item === 'string' && item.length <= 200) {
                return item.trim();
              }
            }
          } else if (typeof section.content === 'string' && section.content.length <= 200) {
            return section.content.trim();
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not extract from detailed analysis:', error);
  }

  return 'unknown';
}

/**
 * Extract only the relevant sentence from a longer text
 */
function extractRelevantSentence(longText: string, improvement: ImprovementToGroup): string {
  const sentences = longText.split(/[.!?]+/);
  const description = improvement.description.toLowerCase();

  // Find the sentence that contains most keywords from the improvement
  const keywords = description
    .split(/[\s,.:;!?]+/)
    .filter(word => word.length > 3);

  let bestSentence = sentences[0] || longText.substring(0, 150);
  let bestScore = 0;

  for (const sentence of sentences) {
    if (sentence.length > 200) continue;

    const lowerSentence = sentence.toLowerCase();
    const matchCount = keywords.filter(keyword =>
      lowerSentence.includes(keyword)
    ).length;

    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestSentence = sentence;
    }
  }

  return bestSentence.trim() || longText.substring(0, 150) + '...';
}

/**
 * Generate a descriptive placeholder when no text can be extracted
 */
function generateDescriptivePlaceholder(improvement: ImprovementToGroup): string {
  const area = improvement.area || 'okänt område';
  const type = improvement.type === 'quantification' ? 'kvantifiering' : 'förbättring';

  return `Text för ${type} inom ${area} (specifik text behöver identifieras manuellt)`;
}

/**
 * Generates a unique key for grouping based on text section
 */
function generateGroupKey(textSection: string): string {
  // Normalize text for consistent grouping
  return textSection
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50); // Limit length for key
}

/**
 * Enhanced role context extraction with consistent formatting
 * Always returns format: "Roll - Företag (Period)" when possible
 */
function extractEnhancedRoleContext(
  textSection: string,
  cvText: string,
  parsedRoles?: ParsedRole[]
): string {
  // Om vi har parsedRoles, använd dem för exakt matchning
  if (parsedRoles && parsedRoles.length > 0) {
    // Specialhantering för "ansvarig för" texter
    const isResponsibilityText = textSection.toLowerCase().includes('är ansvarig för') ||
                                 textSection.toLowerCase().includes('är i dagsäget ansvarig') ||
                                 textSection.toLowerCase().includes('ansvarig för');

    // Försök olika matchningsstrategier
    for (const role of parsedRoles) {
      let matches = false;

      // Validera företagsnamn
      const invalidCompanies = ['ansvarig', 'ansvar', 'text', 'arbete', 'okänt företag'];
      const hasValidCompany = role.company &&
                             !invalidCompanies.includes(role.company.toLowerCase());

      // Specialhantering för Fitnessworld/Platschef och "ansvarig för" texter
      if (isResponsibilityText && role.title?.toLowerCase().includes('platschef')) {
        matches = true;
        console.log(`🎯 Matched responsibility text to Platschef role`);
      }
      // 1. Kontrollera om textSection matchar originaltext
      else if (role.originalText &&
          areTextsSimilar(textSection, role.originalText, 0.6)) {
        matches = true;
      }
      // 2. Kontrollera om textSection innehåller företag OCH titel
      else if (hasValidCompany && role.title) {
        const hasCompany = textSection.toLowerCase().includes(role.company.toLowerCase());
        const hasTitle = textSection.toLowerCase().includes(role.title.toLowerCase());
        if (hasCompany || hasTitle) {
          matches = true;
        }
      }
      // 3. Kontrollera keyword-matchning i beskrivning
      else if (role.description) {
        const textWords = textSection.toLowerCase().split(/\s+/);
        const descWords = role.description.toLowerCase().split(/\s+/);
        const commonWords = textWords.filter(word =>
          word.length > 3 && descWords.includes(word)
        );
        if (commonWords.length >= 3) { // Ökat från 2 till 3 för bättre precision
          matches = true;
        }
      }

      if (matches) {
        // Formatera konsekvent: "Roll - Företag (Period)"
        const title = role.title || 'Okänd roll';
        const company = hasValidCompany ? role.company : 'Okänt företag';
        const period = role.period || '';

        // Om företag är okänt, försök hitta från roll-beskrivningen
        let finalCompany = company;
        if (company === 'Okänt företag' && role.originalText) {
          const companyMatch = role.originalText.match(/,\s*([A-ZÅÄÖ][^,]+?)\s*(?:Stockholm|Göteborg|Malmö|\d{4})/i);
          if (companyMatch) {
            finalCompany = companyMatch[1].trim();
          }
        }

        return period ?
          `${title} - ${finalCompany} (${period})` :
          `${title} - ${finalCompany}`;
      }
    }
  }

  // Fallback till förbättrad pattern-matchning
  const rolePatterns = [
    { pattern: /platschef/i, title: 'Platschef', company: 'Fitnessworld' },
    { pattern: /målare/i, title: 'Målare', company: '' }, // Lagt till Målare
    { pattern: /webbdesigner|webdesigner/i, title: 'Webbdesigner', company: 'Egen företagare' },
    { pattern: /snickare/i, title: 'Snickare', company: '' },
    // Undvik att matcha "ansvarig" som roll om det är del av ansvarsområde
    { pattern: /^(?!.*är ansvarig).*ansvarig/i, title: 'Ansvarig', company: '' }
  ];

  for (const { pattern, title, company } of rolePatterns) {
    if (pattern.test(textSection)) {
      return company ? `${title} - ${company}` : title;
    }
  }

  // Sista utväg: försök extrahera roll från kontexten
  const contextMatch = textSection.match(/([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)*(?:chef|ledare|ansvarig|specialist))/i);
  if (contextMatch) {
    return contextMatch[1];
  }

  return '';
}

/**
 * Legacy function for backward compatibility
 */
function extractRoleContext(textSection: string, cvText: string, parsedRoles?: any[]): string {
  return extractEnhancedRoleContext(textSection, cvText, parsedRoles);
}

/**
 * Extracts keywords from improvement description
 */
function extractKeywords(description: string): string[] {
  const keywordPatterns = [
    'projektledning',
    'budgetansvar',
    'teamledning',
    'kundservice',
    'försäljningsansvar',
    'personalansvar',
    'drift',
    'administration',
    'webbdesign',
    'WordPress',
    'HTML/CSS'
  ];

  const foundKeywords: string[] = [];
  const lowerDesc = description.toLowerCase();

  keywordPatterns.forEach(keyword => {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });

  // Also extract keywords mentioned explicitly in the description
  const explicitMatch = description.match(/nyckelord[:\s]+([^.]+)/i);
  if (explicitMatch) {
    const keywords = explicitMatch[1].split(/[,;]/).map(k => k.trim());
    foundKeywords.push(...keywords);
  }

  return Array.from(new Set(foundKeywords)); // Remove duplicates
}

/**
 * Generates a combined suggestion that clearly shows what is being combined
 */
function generateCombinedSuggestion(group: GroupedImprovement): string {
  const types = [];
  let suggestion = '';

  // Identify what types are being combined
  if (group.improvements.quantification) types.push('Kvantifiering');
  if (group.improvements.keywords && group.improvements.keywords.length > 0) types.push('Nyckelord');
  if (group.improvements.other && group.improvements.other.length > 0) types.push('ATS-optimering');

  // Create header showing combination
  if (types.length > 1) {
    suggestion += `Kombinerad förbättring: ${types.join(' + ')}\n\n`;
  } else if (types.length === 1) {
    suggestion += `${types[0]}:\n\n`;
  }

  // Add role context if available
  if (group.roleContext) {
    suggestion += `För: ${group.roleContext}\n`;
  }

  suggestion += `Originaltext: "${group.originalText}"\n\n`;

  // Add specific improvements
  if (group.improvements.quantification) {
    suggestion += `📊 Kvantifiering: ${group.improvements.quantification}\n`;
  }

  if (group.improvements.keywords && group.improvements.keywords.length > 0) {
    suggestion += `🔑 Nyckelord: ${group.improvements.keywords.join(', ')}\n`;
  }

  if (group.improvements.other && group.improvements.other.length > 0) {
    suggestion += `⚡ ATS-optimering: ${group.improvements.other.join('; ')}\n`;
  }

  return suggestion.trim();
}

/**
 * Generates an AI example that incorporates all improvements
 */
function generateAIExample(group: GroupedImprovement): string {
  let example = '';

  // Create context-specific examples
  if (group.roleContext?.includes('Platschef')) {
    example = 'Ansvarade för drift och personalledning av träningsanläggning med ';

    if (group.improvements.quantification) {
      example += '12 anställda och 3000+ medlemmar, ökade medlemsantalet med 15% ';
    }

    if (group.improvements.keywords?.length) {
      example += `genom strategisk ${group.improvements.keywords.includes('projektledning') ? 'projektledning' : 'ledning'} `;
      example += `och ${group.improvements.keywords.includes('budgetansvar') ? 'budgetansvar på 5 MSEK' : 'effektiv drift'}`;
    }
  } else if (group.roleContext?.includes('Projektledare')) {
    example = 'Ledde renoverings- och byggprojekt på Vårbergsskolan ';

    if (group.improvements.quantification) {
      example += 'med team på 8 personer, slutfört inom budget på 2.5 MSEK och 3 veckor före deadline ';
    }

    if (group.improvements.keywords?.length) {
      example += `med ansvar för ${group.improvements.keywords.join(', ')}`;
    }
  } else if (group.roleContext?.includes('Webbdesigner')) {
    example = 'Drev egen webbdesignbyrå ';

    if (group.improvements.quantification) {
      example += 'med 25+ kunder och årlig omsättning på 800 000 kr ';
    }

    if (group.improvements.keywords?.length) {
      example += `specialiserad på ${group.improvements.keywords.filter(k =>
        k.toLowerCase().includes('webb') ||
        k.toLowerCase().includes('word') ||
        k.toLowerCase().includes('html')
      ).join(', ')}`;
    }
  } else {
    // Generic example
    example = 'Ansvarade för ';

    if (group.originalText) {
      example += group.originalText.toLowerCase() + ' ';
    }

    if (group.improvements.quantification) {
      example += 'med mätbara resultat och påvisad framgång ';
    }

    if (group.improvements.keywords?.length) {
      example += `inom ${group.improvements.keywords.slice(0, 3).join(', ')}`;
    }
  }

  return example.trim();
}

/**
 * Validates that grouped improvements don't overlap
 */
export function validateGroupedImprovements(groups: GroupedImprovement[]): boolean {
  const seenTexts = new Set<string>();

  for (const group of groups) {
    const key = generateGroupKey(group.originalText);
    if (seenTexts.has(key)) {
      console.warn('Duplicate text section found:', group.originalText);
      return false;
    }
    seenTexts.add(key);
  }

  return true;
}

/**
 * Filters out structural improvements that should be handled by templates
 */
export function filterStructuralImprovements(improvements: ImprovementToGroup[]): ImprovementToGroup[] {
  const structuralKeywords = [
    'struktur',
    'formatering',
    'layout',
    'punktlista',
    'rubrik',
    'sektion',
    'ordning',
    'uppställning'
  ];

  return improvements.filter(imp => {
    const desc = imp.description.toLowerCase();
    const isStructural = structuralKeywords.some(keyword => desc.includes(keyword));

    if (isStructural) {
      console.log('Filtering out structural improvement:', imp.description);
    }

    return !isStructural;
  });
}