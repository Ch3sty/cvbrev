/**
 * Utility functions for intelligent grouping of CV improvements
 * Groups related improvements that affect the same text section
 * Combines quantification and keywords into unified suggestions
 */

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
 */
export function groupRelatedImprovements(
  improvements: ImprovementToGroup[],
  cvText: string,
  detailedAnalysis?: any
): GroupedImprovement[] {
  const groups = new Map<string, GroupedImprovement>();
  const processedIds = new Set<string>();

  // First pass: identify text sections and create initial groups
  improvements.forEach(improvement => {
    if (!improvement.selected || processedIds.has(improvement.id)) {
      return;
    }

    // Extract the text section this improvement refers to
    const textSection = extractTextSection(improvement, cvText, detailedAnalysis);

    if (!textSection || textSection === 'unknown') {
      console.warn('Could not extract text section for improvement:', improvement.id);
      return;
    }

    // Check if we already have a group for this text section
    const groupKey = generateGroupKey(textSection);

    if (!groups.has(groupKey)) {
      // Create new group
      groups.set(groupKey, {
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
        roleContext: extractRoleContext(textSection, cvText)
      });
    }

    const group = groups.get(groupKey)!;

    // Add improvement to appropriate category
    if (improvement.type === 'quantification') {
      group.improvements.quantification = improvement.description;
    } else if (improvement.type === 'keywords') {
      group.improvements.keywords = extractKeywords(improvement.description);
    } else {
      group.improvements.other = group.improvements.other || [];
      group.improvements.other.push(improvement.description);
    }

    group.sourceImprovements.push(improvement.id);
    processedIds.add(improvement.id);
  });

  // Second pass: generate combined suggestions for each group
  groups.forEach(group => {
    group.combinedSuggestion = generateCombinedSuggestion(group);
    group.aiExample = generateAIExample(group);
  });

  return Array.from(groups.values());
}

/**
 * Extracts the text section from CV that an improvement refers to
 */
function extractTextSection(
  improvement: ImprovementToGroup,
  cvText: string,
  detailedAnalysis?: any
): string {
  // Try to find matching text based on improvement description
  const description = improvement.description.toLowerCase();
  const cvLines = cvText.split('\n');

  // Look for role-specific mentions
  if (description.includes('platschef')) {
    const platschefLine = cvLines.find(line =>
      line.toLowerCase().includes('platschef') ||
      line.toLowerCase().includes('fitnessworld')
    );
    if (platschefLine) return platschefLine.trim();
  }

  if (description.includes('vårbergsskolan')) {
    const schoolLine = cvLines.find(line =>
      line.toLowerCase().includes('vårbergsskolan') ||
      line.toLowerCase().includes('projekt')
    );
    if (schoolLine) return schoolLine.trim();
  }

  if (description.includes('webbdesign') || description.includes('webdesign')) {
    const webLine = cvLines.find(line =>
      line.toLowerCase().includes('webbdesign') ||
      line.toLowerCase().includes('webdesign') ||
      line.toLowerCase().includes('egen företagare')
    );
    if (webLine) return webLine.trim();
  }

  if (description.includes('renovering')) {
    const renovLine = cvLines.find(line =>
      line.toLowerCase().includes('renovering') ||
      line.toLowerCase().includes('snickare')
    );
    if (renovLine) return renovLine.trim();
  }

  // Look for mentions in the improvement example
  if (improvement.example) {
    const exampleMatch = improvement.example.match(/["']([^"']+)["']/);
    if (exampleMatch) {
      const searchText = exampleMatch[1].toLowerCase();
      const matchingLine = cvLines.find(line =>
        line.toLowerCase().includes(searchText)
      );
      if (matchingLine) return matchingLine.trim();
    }
  }

  // Fallback: look for area-specific text
  if (improvement.area === 'Arbetslivserfarenhet') {
    // Find work experience related text
    const workLine = cvLines.find(line =>
      line.toLowerCase().includes('ansvarig') ||
      line.toLowerCase().includes('chef') ||
      line.toLowerCase().includes('ledare')
    );
    if (workLine) return workLine.trim();
  }

  return 'unknown';
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
 * Extracts role/position context from text section
 */
function extractRoleContext(textSection: string, cvText: string): string {
  // Look for role identifiers
  const rolePatterns = [
    /platschef/i,
    /projektledare/i,
    /webbdesigner/i,
    /webdesigner/i,
    /snickare/i,
    /egen företagare/i,
    /ansvarig/i
  ];

  for (const pattern of rolePatterns) {
    const match = textSection.match(pattern);
    if (match) {
      // Try to find company/context
      if (textSection.toLowerCase().includes('fitnessworld')) {
        return `Platschef - Fitnessworld`;
      }
      if (textSection.toLowerCase().includes('vårbergsskolan')) {
        return `Projektledare - Vårbergsskolan`;
      }
      if (textSection.toLowerCase().includes('webbdesign')) {
        return `Webbdesigner - Egen företagare`;
      }
      return match[0];
    }
  }

  return '';
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

  return [...new Set(foundKeywords)]; // Remove duplicates
}

/**
 * Generates a combined suggestion incorporating all improvements
 */
function generateCombinedSuggestion(group: GroupedImprovement): string {
  let suggestion = '';

  // Start with the text section context
  if (group.roleContext) {
    suggestion += `För rollen ${group.roleContext}: `;
  }

  // Add quantification if present
  if (group.improvements.quantification) {
    suggestion += group.improvements.quantification;
  }

  // Add keywords integration
  if (group.improvements.keywords && group.improvements.keywords.length > 0) {
    if (suggestion) suggestion += ' ';
    suggestion += `Inkludera nyckelord som ${group.improvements.keywords.join(', ')}.`;
  }

  // Add other improvements
  if (group.improvements.other && group.improvements.other.length > 0) {
    suggestion += ` ${group.improvements.other.join(' ')}`;
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