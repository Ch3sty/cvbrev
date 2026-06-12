/**
 * Role-based improvements module
 * Generates specific improvement suggestions based on identified roles
 * Ensures each suggestion includes role context and valid AI examples
 */

import { generateJSON, generateText, GEMINI_MODELS } from '@/lib/gemini';
import { ParsedRole } from './cv-parser';

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

    // Generate fallback if AI example is empty or too short
    const suggestedText = bestExample.aiExample && bestExample.aiExample.length > 20
      ? bestExample.aiExample
      : generateQuickFallbackText(roleKey, originalText, hasQuantification, uniqueKeywords);

    frontendImprovements.push({
      role: roleKey,
      period: roleImprovements[0].period,
      originalText,
      improvements: {
        quantification: hasQuantification,
        keywords: uniqueKeywords,
        atsOptimization: hasKeywords || hasQuantification // ATS benefits from both
      },
      suggestedText, // Use fallback if AI failed
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
 * Generate quick fallback text if AI fails
 */
function generateQuickFallbackText(
  roleKey: string,
  originalText: string,
  hasQuantification: boolean,
  keywords: string[]
): string {
  const [title] = roleKey.split(' - ');

  if (hasQuantification && keywords.length > 0) {
    return `Förbättrad version för ${title} kommer att inkludera kvantifierade resultat och nyckelord som ${keywords.slice(0, 3).join(', ')}.`;
  } else if (hasQuantification) {
    return `Förbättrad version för ${title} kommer att inkludera konkreta siffror och mätbara resultat.`;
  } else if (keywords.length > 0) {
    return `Förbättrad version för ${title} kommer att optimeras med nyckelord: ${keywords.slice(0, 3).join(', ')}.`;
  } else {
    return `Professionell omformulering av din erfarenhet som ${title} för att stärka CV:t.`;
  }
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

    const { data: result } = await generateJSON<any>({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du är en svensk CV-expert som hjälper till att förbättra CV:n med konkreta, mätbara förbättringar.',
      prompt,
      temperature: 0.3, // OPTIMERING: Lägre temperatur för snabbare svar
      maxOutputTokens: 600,
      thinkingBudget: 0,
    });

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
 * Build improvement prompt for AI with variation strategies
 */
function buildImprovementPrompt(role: ParsedRole, context: any, type: string): string {
  // Infer seniority from role and period
  const seniority = inferSeniority(role);
  const industry = inferIndustry(role);

  const basePrompt = `
Analysera följande roll och generera en specifik förbättring:

Roll: ${role.title}
Företag: ${role.company}
Period: ${role.period}
Senioritet: ${seniority}
Bransch: ${industry}
Beskrivning: ${role.description}
Ansvarsområden: ${role.responsibilities?.join(', ') || 'Ej specificerade'}
`;

  if (type === 'quantification') {
    return basePrompt + `
Fokus: Kvantifiering av prestationer och resultat

VIKTIGT: Variera meningsstrukturen baserat på senioritet och roll!

STRUKTURMALLAR (välj EN lämplig för ${seniority} ${role.title}):

A. RESULTATFOKUS (bäst för Senior/Lead):
   "Ökade/Minskade/Förbättrade [metrik] med [X]% genom [konkret handling]"
   Exempel: "Ökade medlemsretention med 35% genom att implementera lojalitetsprogram och personliga träningserbjudanden"

B. PROJEKT/LEVERANS (bäst för projektroller):
   "Levererade [projekt] värt [belopp] [före tid/under budget] med [resultat]"
   Exempel: "Levererade renoveringsprojekt på 5000 kvm värt 3,5 MSEK två veckor före deadline och 10% under budget"

C. LEDARSKAP (bäst för chefsroller):
   "Ledde team på [X] personer som [uppnådde resultat]"
   Exempel: "Ledde team på 15 träningsexperter som ökade kundnöjdheten från 7,2 till 9,1 på 12 månader"

D. UTVECKLING (bäst för tech/skapande):
   "Utvecklade/Skapade [produkt/tjänst] som resulterade i [mätbart resultat]"
   Exempel: "Utvecklade 40+ responsiva företagswebbplatser som ökade kundernas online-konvertering med genomsnitt 45%"

E. ANSVAR/SCOPE (fallback):
   "Ansvarade för [område] med [omfattning], uppnådde [resultat]"
   Exempel: "Ansvarade för drift av Stockholms största träningsanläggning med 3500 medlemmar, ökade årsomsättningen med 2,8 MSEK"

Returnera JSON:
{
  "originalText": "Exakt text från CV:t som ska förbättras (max 100 tecken)",
  "suggestion": "Beskriv vad som ska kvantifieras",
  "aiExample": "ANVÄND EN AV STRUKTURMALLARNA OVAN - minst 25 ord med 2-3 specifika siffror",
  "confidence": 0.9
}

KRAV för aiExample:
- MÅSTE använda EN strukturmall ovan (variera mellan anrop!)
- MÅSTE innehålla minst 2-3 specifika siffror
- MÅSTE vara minst 25 ord långt
- MÅSTE vara relevant för ${role.title} på ${role.company}
- MÅSTE vara realistiskt och trovärdigt
- MÅSTE anpassa tonstil efter senioritet (${seniority})

SENIORITETSSTIL:
- Junior: "Bidrog till", "Assisterade", "Utvecklade färdigheter i"
- Mid: "Ansvarade för", "Levererade", "Ökade", "Implementerade"
- Senior: "Ledde", "Transformerade", "Skalade", "Etablerade"
- Lead: "Drev strategisk", "Byggde organisation", "Levererade affärsvärde"

EXEMPEL på DÅLIGT aiExample (undvik):
"t" eller "Ansvarade för christian karlsson" eller "Förbättrade resultat" eller text utan siffror
`;
  }

  if (type === 'keywords') {
    const keywords = Array.isArray(context) ? context : [];
    return basePrompt + `
Fokus: Inkludera relevanta nyckelord

Nyckelord att inkludera: ${keywords.join(', ')}

VIKTIGT: Variera meningsstrukturen!

STRUKTURMALLAR med nyckelord (välj EN lämplig):

1. KOMPETENSFOKUS:
   "Specialist på [nyckelord] med fokus på [resultat]"

2. ANSVARSOMRÅDE:
   "Ansvarade för [nyckelord] och uppnådde [mätbart resultat]"

3. UTVECKLING:
   "Utvecklade kompetens inom [nyckelord] som resulterade i [resultat]"

4. BRED ERFARENHET:
   "Omfattande erfarenhet av [nyckelord] med dokumenterade resultat i [område]"

Returnera JSON:
{
  "originalText": "Exakt text från CV:t som ska förbättras (max 100 tecken)",
  "suggestion": "Förklara vilka nyckelord som ska läggas till",
  "aiExample": "ANVÄND EN STRUKTURMALL - naturligt inkludera nyckelorden (minst 25 ord)",
  "keywords": ["nyckelord1", "nyckelord2"],
  "confidence": 0.85
}

KRAV för aiExample:
- MÅSTE naturligt inkludera nyckelorden ${keywords.join(', ')}
- MÅSTE vara minst 25 ord långt
- MÅSTE vara relevant för ${role.title} på ${role.company}
- Får INTE bara vara en lista av nyckelord
- MÅSTE variera struktur mellan olika anrop
`;
  }

  return basePrompt;
}

/**
 * Infer seniority level from role and period
 */
function inferSeniority(role: ParsedRole): 'junior' | 'mid' | 'senior' | 'lead' {
  const title = role.title.toLowerCase();

  // Calculate years of experience from period
  const yearsOfExperience = calculateYearsOfExperience(role.period);

  // Check for leadership indicators
  if (title.includes('chef') || title.includes('manager') || title.includes('lead') || title.includes('vd')) {
    return 'lead';
  }

  // Check for senior indicators
  if (title.includes('senior') || title.includes('specialist') || yearsOfExperience > 5) {
    return 'senior';
  }

  // Mid-level
  if (yearsOfExperience > 2) {
    return 'mid';
  }

  // Junior by default
  return 'junior';
}

/**
 * Calculate years of experience from period string
 */
function calculateYearsOfExperience(period: string): number {
  if (!period) return 0;

  // Extract years from period (e.g., "2014 - Pågående" or "2018-2020")
  const yearMatch = period.match(/(\d{4})/g);
  if (!yearMatch || yearMatch.length === 0) return 0;

  const startYear = parseInt(yearMatch[0]);
  const endYear = period.toLowerCase().includes('pågående') || period.toLowerCase().includes('nuvarande')
    ? new Date().getFullYear()
    : (yearMatch.length > 1 ? parseInt(yearMatch[1]) : new Date().getFullYear());

  return Math.max(0, endYear - startYear);
}

/**
 * Infer industry from role title, company, and description
 */
function inferIndustry(role: ParsedRole): string {
  const combined = (role.title + ' ' + role.company + ' ' + role.description).toLowerCase();

  if (combined.includes('bygg') || combined.includes('snickare') || combined.includes('renovering')) {
    return 'construction';
  }
  if (combined.includes('träning') || combined.includes('fitness') || combined.includes('gym')) {
    return 'fitness';
  }
  if (combined.includes('webb') || combined.includes('design') || combined.includes('utveckl')) {
    return 'tech';
  }
  if (combined.includes('sälj') || combined.includes('försälj')) {
    return 'sales';
  }

  return 'general';
}

/**
 * Validate AI response to ensure quality
 */
export function validateAIResponse(response: string): boolean {
  if (!response || typeof response !== 'string') {
    return false;
  }

  // Check minimum length - CV text should be substantial
  if (response.length < 50) {
    console.warn(`⚠️ AI response too short (${response.length} chars): "${response}"`);
    return false;
  }

  // Check for invalid single character responses
  if (response.trim().length === 1) {
    console.warn(`⚠️ AI response is single character: "${response}"`);
    return false;
  }

  // NYTT: Blockera personlig info och malformed starts
  const personalInfoPatterns = [
    /^ansvarade för\s+(christian|egen företagare|innefattar|agerade)/i,
    /\b\d{2,4}\s*år\s+(från|i)\b/i, // "25 år från"
    /christian\s+karlsson/i,
  ];

  for (const pattern of personalInfoPatterns) {
    if (pattern.test(response.trim())) {
      console.warn(`⚠️ AI response contains personal info or malformed start: "${response.substring(0, 50)}..."`);
      return false;
    }
  }

  // Check for repetitive/generic starts that indicate low quality
  const genericStarts = [
    'ansvarade för christian karlsson',
    'ansvarade för agerade projektledare',
    'text för',
    'exempel på',
    'förbättring av'
  ];

  const lowerResponse = response.trim().toLowerCase();
  for (const genericStart of genericStarts) {
    if (lowerResponse.startsWith(genericStart)) {
      console.warn(`⚠️ AI response has generic/malformed start: "${response.substring(0, 50)}..."`);
      return false;
    }
  }

  // Check for numbers (quantification should have numbers)
  const hasNumbers = /\d+/.test(response);
  if (!hasNumbers) {
    console.warn(`⚠️ AI response lacks numbers: "${response}"`);
    // Don't reject entirely, but prefer responses with numbers
  }

  // Check for sufficient words - CV text should be detailed
  const wordCount = response.split(/\s+/).length;
  if (wordCount < 15) {
    console.warn(`⚠️ AI response has too few words (${wordCount}): "${response}"`);
    return false;
  }

  // Check for Swedish action verbs (must have at least one)
  const hasActionVerb = /\b(ledde|utvecklade|implementerade|ökade|minskade|skapade|genomförde|optimerade|förbättrade|hanterade|koordinerade|etablerade|drev|byggde|ansvarade|administrerade|levererade)\b/i.test(response);
  if (!hasActionVerb) {
    console.warn(`⚠️ AI response lacks action verb: "${response}"`);
    return false; // Reject if no action verb - critical for CV quality
  }

  // Check for placeholder text
  const invalidPhrases = ['[', ']', 'exempel här', 'text här', 'TODO', 'kunde inte'];
  if (invalidPhrases.some(phrase => response.toLowerCase().includes(phrase))) {
    console.warn(`⚠️ AI response contains placeholder text: "${response}"`);
    return false;
  }

  // Check that it's not just a copy of input
  if (response.includes('originaltext:') || response.includes('förbättring:')) {
    console.warn(`⚠️ AI response contains prompt artifacts: "${response.substring(0, 50)}..."`);
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

    const response = await generateText({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Generera konkreta CV-förbättringar med siffror och mätbara resultat. Svara endast med förbättringsexemplet.',
      prompt,
      temperature: 0.3, // OPTIMERING: Lägre temperatur för snabbare svar
      maxOutputTokens: 200,
      thinkingBudget: 0,
    });

    const aiExample = response.text.trim();

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
 * Create contextual fallback example if AI fails
 */
function createFallbackExample(role: ParsedRole, type: string): string {
  const seniority = inferSeniority(role);
  const industry = inferIndustry(role);
  const yearsExp = calculateYearsOfExperience(role.period);

  // Bransch- och senioritetspecifika mallar med variation
  const fallbackExamples: Record<string, Record<string, string[]>> = {
    fitness: {
      lead: [
        `Ledde träningsanläggning med ${Math.max(3000, Math.floor(yearsExp * 500))} medlemmar och team på ${10 + yearsExp} personer, ökade årsomsättningen med ${1 + yearsExp * 0.3} MSEK genom förbättrad kundservice och nya tjänster`,
        `Drev strategisk utveckling av fitnesscenter med fokus på medlemsretention och lönsamhet, uppnådde ${75 + yearsExp * 2}% kundnöjdhet och ${15 + yearsExp}% årlig tillväxt`
      ],
      mid: [
        `Ansvarade för personalschema och medlemsservice för ${1500 + yearsExp * 200}+ medlemmar, ökade retention med ${20 + yearsExp * 3}% på 12 månader`,
        `Koordinerade träningsverksamhet och kundservice, implementerade rutiner som förbättrade medlemsnöjdheten från ${6.5 + yearsExp * 0.2} till ${8.0 + yearsExp * 0.3} i betyg`
      ],
      junior: [
        `Bidrog till daglig drift av träningsanläggning med ${800 + yearsExp * 100} medlemmar, assisterade i utveckling av kundservicerutiner`,
        `Stöttade gymverksamhet genom schemaläggning och kundservice, utvecklade färdigheter inom träningsrådgivning och medlemsvård`
      ]
    },
    construction: {
      lead: [
        `Ledde ${10 + yearsExp * 3} byggprojekt värda totalt ${5 + yearsExp * 2} MSEK med team på ${8 + yearsExp} hantverkare, slutförde samtliga inom tid och budget`,
        `Drev renoveringsprojekt i Stockholmsområdet med budgetansvar på ${3 + yearsExp} MSEK, uppnådde ${95 + yearsExp}% kundnöjdhet och ${20 + yearsExp * 2}% återkommande uppdrag`
      ],
      mid: [
        `Ansvarade för renovering av ${15 + yearsExp * 5} objekt i Stockholmsområdet, genomförde projekt värt ${2 + yearsExp * 0.5} MSEK med 98% kundnöjdhet`,
        `Levererade ${20 + yearsExp * 3} renoveringsprojekt med fokus på kvalitet och tidseffektivitet, minskade materialspill med ${15 + yearsExp * 3}%`
      ],
      junior: [
        `Bidrog till ${5 + yearsExp * 2} renoveringsprojekt med fokus på kvalitetsarbete och säkerhet, utvecklade kompetens inom byggstandarder`,
        `Assisterade i byggprojekt värt totalt ${1 + yearsExp * 0.3} MSEK, lärde mig professionella metoder för renovering och nyproduktion`
      ]
    },
    tech: {
      lead: [
        `Utvecklade ${30 + yearsExp * 10}+ företagswebbplatser med fokus på UX och konvertering, ökade kunders online-försäljning med genomsnitt ${35 + yearsExp * 5}%`,
        `Drev webbdesignbyrå med ${15 + yearsExp * 3} projekt årligen, specialiserad på responsiv design och CMS-lösningar, uppnådde ${90 + yearsExp}% kundnöjdhet`
      ],
      mid: [
        `Designade och implementerade ${20 + yearsExp * 5} webbprojekt i WordPress/HTML/CSS, levererade samtliga projekt i tid med ${85 + yearsExp * 2}% kundnöjdhet`,
        `Utvecklade ${15 + yearsExp * 4} responsiva webbplatser för SME-kunder, ökade deras konverteringsgrad med genomsnitt ${25 + yearsExp * 3}%`
      ],
      junior: [
        `Bidrog till utveckling av ${8 + yearsExp * 2} webbprojekt med fokus på front-end och användarupplevelse`,
        `Assisterade i design och implementation av företagswebbplatser, utvecklade färdigheter i WordPress, HTML och CSS`
      ]
    },
    sales: {
      lead: [
        `Ledde säljteam på ${8 + yearsExp} personer som genererade ${10 + yearsExp * 3} MSEK i försäljning, ökade teamets genomsnitt med ${30 + yearsExp * 5}%`,
        `Drev försäljningsstrategi som resulterade i ${15 + yearsExp * 4} nya nyckelkunder och ${20 + yearsExp * 3}% årlig tillväxt`
      ],
      mid: [
        `Ansvarade för försäljning till ${30 + yearsExp * 10} kunder, genererade ${5 + yearsExp * 2} MSEK årligen med ${75 + yearsExp * 3}% måluppfyllelse`,
        `Utvecklade ${20 + yearsExp * 5} nya kundrelationer som bidrog till ${3 + yearsExp}% marknadsandelsökning`
      ],
      junior: [
        `Bidrog till försäljning genom prospektering och kundvård, uppnådde ${80 + yearsExp * 5}% av personligt försäljningsmål`,
        `Assisterade säljteam med kundkontakter och erbjudanden, utvecklade färdigheter inom B2B-försäljning`
      ]
    },
    general: {
      lead: [
        `Ledde verksamhetsområde med team på ${10 + yearsExp} personer och budget på ${3 + yearsExp} MSEK, implementerade förbättringar som ökade effektiviteten med ${25 + yearsExp * 3}%`,
        `Drev strategisk utveckling av affärsområde, uppnådde ${15 + yearsExp * 2}% årlig tillväxt och ${85 + yearsExp}% kundnöjdhet`
      ],
      mid: [
        `Ansvarade för verksamhet med ${5 + yearsExp} medarbetare, genomförde förbättringar som ökade produktiviteten med ${20 + yearsExp * 2}%`,
        `Koordinerade arbetsområde med budget på ${2 + yearsExp} MSEK, uppnådde uppsatta mål med ${110 + yearsExp * 3}% måluppfyllelse`
      ],
      junior: [
        `Bidrog till verksamhet genom ${3 + yearsExp} projekt med dokumenterade resultat, utvecklade kompetens inom ${type === 'quantification' ? 'processförbättring' : 'operativ verksamhet'}`,
        `Assisterade i ${5 + yearsExp * 2} förbättringsprojekt, lärde mig professionella metoder för ${type === 'quantification' ? 'resultatmätning' : 'verksamhetsutveckling'}`
      ]
    }
  };

  // Välj rätt bransch och senioritet
  const industryExamples = fallbackExamples[industry] || fallbackExamples.general;
  const seniorityExamples = industryExamples[seniority] || industryExamples.mid;

  // Välj slumpmässigt exempel för variation
  const randomIndex = Math.floor(Math.random() * seniorityExamples.length);
  return seniorityExamples[randomIndex];
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