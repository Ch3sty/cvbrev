/**
 * Role-based improvements module
 * Generates specific improvement suggestions based on identified roles
 * Ensures each suggestion includes role context and valid AI examples
 */

import OpenAI from 'openai';
import { ParsedRole } from './cv-parser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface RoleBasedImprovement {
  id: string;
  roleTitle: string;      // e.g., "Platschef"
  company: string;        // e.g., "Fitnessworld"
  period: string;         // e.g., "2014 - Pågående"
  originalText: string;   // e.g., "ansvarig för inköp, drift, personal"
  improvementType: 'quantification' | 'keywords' | 'structure' | 'content';
  category: string;       // For UI display
  suggestion: string;     // e.g., "Kvantifiera teamstorlek och budgetansvar"
  aiExample: string;      // e.g., "Ledde team på 12 personer med budgetansvar på 5 MSEK"
  keywords?: string[];    // e.g., ["ledarskap", "budgetansvar", "drift"]
  confidence: number;     // 0-1 confidence in the suggestion
  impact: 'high' | 'medium' | 'low'; // Impact level of improvement
}

/**
 * Frontend format for role-based improvements
 */
export interface FrontendRoleImprovement {
  role: string;           // "Platschef - Fitnessworld"
  period: string;         // "2014-pågående"
  originalText: string;   // Nuvarande CV-text
  improvements: {
    quantification: boolean;
    keywords: string[];
    atsOptimization: boolean;
  };
  suggestedText: string;  // Kombinerat förbättringsförslag
  selected: boolean;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  sourceImprovementIds: string[];
}

/**
 * Format role-based improvements for frontend display
 * Combines multiple improvement types per role into single suggestions
 */
export function formatRoleImprovementsForFrontend(
  improvements: RoleBasedImprovement[]
): FrontendRoleImprovement[] {
  // Group improvements by role
  const roleMap = new Map<string, RoleBasedImprovement[]>();

  for (const improvement of improvements) {
    const roleKey = `${improvement.roleTitle} - ${improvement.company}`;
    if (!roleMap.has(roleKey)) {
      roleMap.set(roleKey, []);
    }
    roleMap.get(roleKey)!.push(improvement);
  }

  // Transform each role group to frontend format
  const frontendImprovements: FrontendRoleImprovement[] = [];

  for (const [roleKey, roleImprovements] of roleMap.entries()) {
    // Find best AI example (longest, most detailed)
    const bestExample = roleImprovements.reduce((best, current) => {
      return current.aiExample.length > best.aiExample.length ? current : best;
    }, roleImprovements[0]);

    // Collect all keywords
    const allKeywords = roleImprovements
      .filter(imp => imp.keywords && imp.keywords.length > 0)
      .flatMap(imp => imp.keywords || []);
    const uniqueKeywords = [...new Set(allKeywords)];

    // Determine improvements
    const hasQuantification = roleImprovements.some(
      imp => imp.improvementType === 'quantification'
    );
    const hasKeywords = uniqueKeywords.length > 0;

    // Get original text (use first improvement's original text)
    const originalText = roleImprovements[0].originalText;

    frontendImprovements.push({
      role: roleKey,
      period: roleImprovements[0].period,
      originalText,
      improvements: {
        quantification: hasQuantification,
        keywords: uniqueKeywords,
        atsOptimization: hasKeywords || hasQuantification // ATS benefits from both
      },
      suggestedText: bestExample.aiExample,
      selected: false,
      confidence: Math.max(...roleImprovements.map(imp => imp.confidence)),
      impact: determineOverallImpact(roleImprovements),
      sourceImprovementIds: roleImprovements.map(imp => imp.id)
    });
  }

  return frontendImprovements;
}

/**
 * Determine overall impact from multiple improvements
 */
function determineOverallImpact(improvements: RoleBasedImprovement[]): 'high' | 'medium' | 'low' {
  const hasHighImpact = improvements.some(imp => imp.impact === 'high');
  if (hasHighImpact) return 'high';

  const hasMediumImpact = improvements.some(imp => imp.impact === 'medium');
  if (hasMediumImpact) return 'medium';

  return 'low';
}

/**
 * Generate role-based improvements for a specific role
 */
export async function generateRoleBasedImprovements(
  role: ParsedRole,
  options?: {
    maxSuggestions?: number;
    focusAreas?: ('quantification' | 'keywords' | 'structure' | 'content')[];
  }
): Promise<RoleBasedImprovement[]> {
  const improvements: RoleBasedImprovement[] = [];
  const maxSuggestions = options?.maxSuggestions || 5;
  const focusAreas = options?.focusAreas || ['quantification', 'keywords'];

  console.log(`🎯 Generating improvements for ${role.title} at ${role.company}`);

  // Generate quantification improvements
  if (focusAreas.includes('quantification')) {
    const quantImprovements = await generateQuantificationImprovements(role);
    improvements.push(...quantImprovements);
  }

  // Generate keyword improvements
  if (focusAreas.includes('keywords')) {
    const keywordImprovements = await generateKeywordImprovements(role);
    improvements.push(...keywordImprovements);
  }

  // Limit to max suggestions
  const finalImprovements = improvements.slice(0, maxSuggestions);

  // Validate all AI examples
  for (const improvement of finalImprovements) {
    if (!validateAIResponse(improvement.aiExample)) {
      console.warn(`⚠️ Invalid AI example for ${improvement.id}, regenerating...`);
      improvement.aiExample = await regenerateAIExample(role, improvement);
    }
  }

  console.log(`✅ Generated ${finalImprovements.length} improvements for ${role.title}`);
  return finalImprovements;
}

/**
 * Generate quantification-focused improvements
 */
async function generateQuantificationImprovements(role: ParsedRole): Promise<RoleBasedImprovement[]> {
  const improvements: RoleBasedImprovement[] = [];

  // Analyze role description for quantifiable areas
  const quantifiableAreas = identifyQuantifiableAreas(role);

  for (const area of quantifiableAreas) {
    const improvement = await generateSingleImprovement(role, area, 'quantification');
    if (improvement) {
      improvements.push(improvement);
    }
  }

  return improvements;
}

/**
 * Generate keyword-focused improvements
 */
async function generateKeywordImprovements(role: ParsedRole): Promise<RoleBasedImprovement[]> {
  const improvements: RoleBasedImprovement[] = [];

  // Identify missing keywords based on role
  const relevantKeywords = getRelevantKeywords(role.title, role.company);
  const missingKeywords = relevantKeywords.filter(kw =>
    !role.description.toLowerCase().includes(kw.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    const improvement = await generateSingleImprovement(role, missingKeywords, 'keywords');
    if (improvement) {
      improvements.push(improvement);
    }
  }

  return improvements;
}

/**
 * Generate a single improvement suggestion with AI
 */
async function generateSingleImprovement(
  role: ParsedRole,
  context: any,
  type: 'quantification' | 'keywords'
): Promise<RoleBasedImprovement | null> {
  try {
    const prompt = buildImprovementPrompt(role, context, type);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en svensk CV-expert som hjälper till att förbättra CV:n med konkreta, mätbara förbättringar.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // OPTIMERING: Lägre temperatur för snabbare svar
      max_tokens: 300, // OPTIMERING: Minskat för snabbare svar
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    // Validate the AI example
    if (!validateAIResponse(result.aiExample)) {
      console.warn('⚠️ Invalid AI example received, using fallback');
      result.aiExample = createFallbackExample(role, type);
    }

    return {
      id: `${role.title.toLowerCase().replace(/\s+/g, '-')}-${type}-${Date.now()}`,
      roleTitle: role.title,
      company: role.company,
      period: role.period,
      originalText: result.originalText || extractRelevantText(role, context),
      improvementType: type,
      category: type === 'quantification' ? 'Kvantifiering' : 'Nyckelord',
      suggestion: result.suggestion,
      aiExample: result.aiExample,
      keywords: result.keywords || context,
      confidence: result.confidence || 0.8,
      impact: determineImpact(type, context),
    };

  } catch (error) {
    console.error(`❌ Error generating ${type} improvement for ${role.title}:`, error);
    return null;
  }
}

/**
 * Build improvement prompt for AI
 */
function buildImprovementPrompt(role: ParsedRole, context: any, type: string): string {
  const basePrompt = `
Analysera följande roll och generera en specifik förbättring:

Roll: ${role.title}
Företag: ${role.company}
Period: ${role.period}
Beskrivning: ${role.description}
Ansvarsområden: ${role.responsibilities?.join(', ') || 'Ej specificerade'}
`;

  if (type === 'quantification') {
    return basePrompt + `
Fokus: Kvantifiering av prestationer och resultat

Identifiera ETT område som kan kvantifieras bättre och returnera JSON:
{
  "originalText": "Exakt text från CV:t som ska förbättras (max 100 tecken)",
  "suggestion": "Beskriv vad som ska kvantifieras",
  "aiExample": "Konkret exempel med SIFFROR och RESULTAT (minst 20 ord)",
  "confidence": 0.9
}

KRAV för aiExample:
- MÅSTE innehålla minst 2-3 specifika siffror
- MÅSTE vara minst 20 ord långt
- MÅSTE vara relevant för ${role.title} på ${role.company}
- MÅSTE vara realistiskt och trovärdigt

EXEMPEL på bra aiExample för en Platschef:
"Ledde team på 12 personer med budgetansvar på 5 MSEK årligen, ökade medlemsantalet med 18% under 2023 och minskade personalomsättningen från 25% till 12%"

EXEMPEL på DÅLIGT aiExample (undvik):
"t" eller "Förbättrade resultat" eller text utan siffror
`;
  }

  if (type === 'keywords') {
    const keywords = Array.isArray(context) ? context : [];
    return basePrompt + `
Fokus: Inkludera relevanta nyckelord

Nyckelord att inkludera: ${keywords.join(', ')}

Returnera JSON:
{
  "originalText": "Exakt text från CV:t som ska förbättras (max 100 tecken)",
  "suggestion": "Förklara vilka nyckelord som ska läggas till",
  "aiExample": "Konkret exempel som naturligt inkluderar nyckelorden (minst 20 ord)",
  "keywords": ["nyckelord1", "nyckelord2"],
  "confidence": 0.85
}

KRAV för aiExample:
- MÅSTE naturligt inkludera nyckelorden ${keywords.join(', ')}
- MÅSTE vara minst 20 ord långt
- MÅSTE vara relevant för ${role.title} på ${role.company}
- Får INTE bara vara en lista av nyckelord

EXEMPEL på bra aiExample för en Platschef med nyckelord [ledarskap, budgetansvar]:
"Ansvarade för strategisk ledarskap av träningsanläggning med fokus på personalutveckling och operativ excellens, hanterade budgetansvar omfattande både drift och investeringar på totalt 8 MSEK årligen"
`;
  }

  return basePrompt;
}

/**
 * Validate AI response to ensure quality
 */
export function validateAIResponse(response: string): boolean {
  if (!response || typeof response !== 'string') {
    return false;
  }

  // Check minimum length - increased to 50 for better quality
  if (response.length < 50) {
    console.warn(`⚠️ AI response too short (${response.length} chars): "${response}"`);
    return false;
  }

  // Check for invalid single character responses
  if (response.trim().length === 1) {
    console.warn(`⚠️ AI response is single character: "${response}"`);
    return false;
  }

  // VIKTIGT: Blockera "Ansvarade för" som början
  if (response.trim().toLowerCase().startsWith('ansvarade för')) {
    console.warn(`❌ AI response starts with forbidden 'Ansvarade för': "${response}"`);
    return false;
  }

  // Check for numbers (quantification should have numbers)
  const hasNumbers = /\d+/.test(response);
  if (!hasNumbers) {
    console.warn(`⚠️ AI response lacks numbers: "${response}"`);
    // Don't reject, but warn
  }

  // Check for sufficient words - increased to 8 for complete sentences
  const wordCount = response.split(/\s+/).length;
  if (wordCount < 8) {
    console.warn(`⚠️ AI response has too few words (${wordCount}): "${response}"`);
    return false;
  }

  // Check for Swedish action verbs (must have at least one)
  const hasActionVerb = /\b(ledde|utvecklade|implementerade|ökade|minskade|skapade|genomförde|optimerade|förbättrade|hanterade|koordinerade|etablerade|drev|byggde|ansåg|administrerade)\b/i.test(response);
  if (!hasActionVerb) {
    console.warn(`⚠️ AI response lacks action verb: "${response}"`);
    // Don't reject, but could be improved
  }

  // Check for placeholder text
  const invalidPhrases = ['[', ']', 'exempel här', 'text här', 'TODO'];
  if (invalidPhrases.some(phrase => response.toLowerCase().includes(phrase))) {
    console.warn(`⚠️ AI response contains placeholder text: "${response}"`);
    return false;
  }

  return true;
}

/**
 * Regenerate AI example if validation fails
 */
async function regenerateAIExample(
  role: ParsedRole,
  improvement: RoleBasedImprovement
): Promise<string> {
  try {
    const prompt = `
Generera ett konkret förbättringsexempel för:
Roll: ${role.title} på ${role.company}
Originaltext: ${improvement.originalText}
Förbättringstyp: ${improvement.improvementType}

Returnera ENDAST förbättringsexemplet (minst 20 ord med konkreta siffror).
Exempel: "Ledde team på 12 personer med budgetansvar på 5 MSEK, implementerade nya rutiner som ökade effektiviteten med 25%"
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generera konkreta CV-förbättringar med siffror och mätbara resultat. Svara endast med förbättringsexemplet.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // OPTIMERING: Lägre temperatur för snabbare svar
      max_tokens: 100, // OPTIMERING: Minskat för snabbare svar
    });

    const aiExample = response.choices[0].message.content?.trim();

    if (aiExample && validateAIResponse(aiExample)) {
      return aiExample;
    }

    // If regeneration fails, use fallback
    return createFallbackExample(role, improvement.improvementType);

  } catch (error) {
    console.error('❌ Error regenerating AI example:', error);
    return createFallbackExample(role, improvement.improvementType);
  }
}

/**
 * Create fallback example if AI fails
 */
function createFallbackExample(role: ParsedRole, type: string): string {
  const roleExamples: Record<string, Record<string, string>> = {
    platschef: {
      quantification: 'Ledde team på 10-15 personer med ansvar för daglig drift, budget på 3-5 MSEK årligen och verksamhet med 2000+ medlemmar',
      keywords: 'Ansvarade för strategisk ledning, operativ drift och personalutveckling inom träningsbranschen med fokus på medlemstillfredsställelse och lönsamhet',
    },
    projektledare: {
      quantification: 'Ledde projekt med budget på 2-10 MSEK, team på 5-10 personer och levererade inom tidsram med 15% kostnadsbesparingar',
      keywords: 'Projektledning enligt agila metoder med ansvar för planering, genomförande och uppföljning av komplexa byggprojekt',
    },
    snickare: {
      quantification: 'Genomförde 20+ renoveringsprojekt årligen med fokus på kvalitet och tidseffektivitet, minskade materialspill med 30%',
      keywords: 'Erfaren snickare med kompetens inom renovering, nyproduktion och specialsnickeri samt god kännedom om byggstandarder',
    },
    default: {
      quantification: 'Ansvarade för verksamhet med team på 5+ personer, budget på 1+ MSEK och uppnådde uppsatta mål med 20% marginal',
      keywords: 'Bred kompetens inom ledarskap, administration och verksamhetsutveckling med dokumenterade resultat och stark kundorientering',
    },
  };

  const roleLower = role.title.toLowerCase();
  const examples = roleExamples[roleLower] || roleExamples.default;

  return examples[type] || examples.quantification;
}

/**
 * Identify quantifiable areas in role description
 */
function identifyQuantifiableAreas(role: ParsedRole): string[] {
  const areas: string[] = [];
  const description = role.description.toLowerCase();
  const responsibilities = role.responsibilities?.join(' ').toLowerCase() || '';
  const combined = `${description} ${responsibilities}`;

  // Common quantifiable areas
  const quantifiablePatterns = [
    { pattern: /personal|team|medarbetare/, area: 'teamstorlek' },
    { pattern: /budget|ekonomi|kostnad/, area: 'budgetansvar' },
    { pattern: /försäljning|omsättning|intäkt/, area: 'försäljningsresultat' },
    { pattern: /medlem|kund|klient/, area: 'kundantal' },
    { pattern: /projekt|uppdrag/, area: 'projektantal' },
    { pattern: /effektiv|förbättr|optimer/, area: 'effektivitetsförbättring' },
    { pattern: /ansvar|leda|chef/, area: 'ansvarsområde' },
  ];

  for (const { pattern, area } of quantifiablePatterns) {
    if (pattern.test(combined)) {
      areas.push(area);
    }
  }

  // Limit to top 3 areas
  return areas.slice(0, 3);
}

/**
 * Get relevant keywords for a role
 */
function getRelevantKeywords(title: string, company: string): string[] {
  const titleLower = title.toLowerCase();
  const companyLower = company.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    platschef: ['ledarskap', 'budgetansvar', 'personalansvar', 'drift', 'verksamhetsutveckling'],
    projektledare: ['projektledning', 'planering', 'genomförande', 'uppföljning', 'budgetkontroll'],
    chef: ['ledarskap', 'strategisk planering', 'personalansvar', 'resultatansvar'],
    säljare: ['försäljning', 'kundrelationer', 'måluppfyllelse', 'affärsutveckling'],
    utvecklare: ['programmering', 'systemutveckling', 'teknisk kompetens', 'problemlösning'],
    snickare: ['byggarbete', 'renovering', 'kvalitetsarbete', 'säkerhet'],
    default: ['ansvar', 'resultat', 'utveckling', 'samarbete', 'kommunikation'],
  };

  // Find matching keywords
  for (const [role, keywords] of Object.entries(keywordMap)) {
    if (titleLower.includes(role)) {
      return keywords;
    }
  }

  // Industry-specific keywords
  if (companyLower.includes('fitness') || companyLower.includes('gym')) {
    return ['träning', 'hälsa', 'medlemsservice', 'anläggningsdrift', 'kundupplevelse'];
  }

  return keywordMap.default;
}

/**
 * Extract relevant text from role for improvement
 */
function extractRelevantText(role: ParsedRole, context: any): string {
  // Try to find text related to the context
  if (typeof context === 'string') {
    const sentences = role.description.split(/[.!?]/).filter(s => s.trim());
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(context.toLowerCase())) {
        return sentence.trim().substring(0, 100);
      }
    }
  }

  // Default to responsibilities if available
  if (role.responsibilities && role.responsibilities.length > 0) {
    return `Ansvarig för ${role.responsibilities.slice(0, 3).join(', ')}`.substring(0, 100);
  }

  // Fallback to first part of description
  return role.description.substring(0, 100);
}

/**
 * Determine impact level of improvement
 */
function determineImpact(type: string, context: any): 'high' | 'medium' | 'low' {
  if (type === 'quantification') {
    // Quantification usually has high impact
    return 'high';
  }

  if (type === 'keywords') {
    // Keywords impact depends on how many are missing
    const missingCount = Array.isArray(context) ? context.length : 0;
    if (missingCount >= 3) return 'high';
    if (missingCount >= 1) return 'medium';
  }

  return 'low';
}