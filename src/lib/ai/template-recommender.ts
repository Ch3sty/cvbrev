// src/lib/ai/template-recommender.ts
// AI-driven template recommendation engine för CV-mallar

import type { CVTemplateType, CVMetadata } from '@/lib/cv/cv-metadata';
import { parseCVWithAI } from '@/lib/openai/cv-parser-ai';

// Interface för rekommendationsresultat
export interface TemplateRecommendation {
  templateId: CVTemplateType;
  score: number; // 0-100
  reasoning: string;
  suitabilityFactors: {
    industryMatch: number;
    experienceLevel: number;
    roleType: number;
    atsOptimization: number;
    visualPreference: number;
  };
  swedishMarketFit: number;
}

// Bransch-till-mall mapping baserad på svenska marknaden
const INDUSTRY_TEMPLATE_MAPPING = {
  'teknologi': {
    'modern': 85,
    'kreativ': 70,
    'klassisk': 60,
    'ats-optimerad': 90,
    'akademisk': 45,
    'modern-tech': 95
  },
  'finansiering': {
    'klassisk': 95,
    'modern': 75,
    'kreativ': 30,
    'ats-optimerad': 85,
    'akademisk': 40,
    'modern-tech': 60
  },
  'kreativ': {
    'kreativ': 95,
    'modern': 80,
    'klassisk': 45,
    'ats-optimerad': 65,
    'akademisk': 35,
    'modern-tech': 70
  },
  'akademisk': {
    'akademisk': 95,
    'klassisk': 80,
    'modern': 60,
    'ats-optimerad': 75,
    'kreativ': 40,
    'modern-tech': 50
  },
  'konsulting': {
    'klassisk': 85,
    'modern': 80,
    'ats-optimerad': 90,
    'kreativ': 50,
    'akademisk': 60,
    'modern-tech': 75
  },
  'sjukvård': {
    'klassisk': 90,
    'ats-optimerad': 85,
    'modern': 70,
    'akademisk': 75,
    'kreativ': 35,
    'modern-tech': 45
  },
  'ingenjörsvetenskap': {
    'modern': 80,
    'klassisk': 85,
    'ats-optimerad': 90,
    'akademisk': 70,
    'kreativ': 45,
    'modern-tech': 85
  },
  'marknadsföring': {
    'modern': 85,
    'kreativ': 90,
    'klassisk': 60,
    'ats-optimerad': 80,
    'akademisk': 40,
    'modern-tech': 70
  },
  'försäljning': {
    'modern': 80,
    'klassisk': 75,
    'ats-optimerad': 85,
    'kreativ': 65,
    'akademisk': 35,
    'modern-tech': 60
  },
  'default': {
    'klassisk': 70,
    'modern': 75,
    'ats-optimerad': 80,
    'kreativ': 60,
    'akademisk': 55,
    'modern-tech': 65
  }
} as const;

// Erfarenhetsnivå-modifieringar
const EXPERIENCE_MODIFIERS = {
  'junior': {
    'modern': 1.1,
    'kreativ': 1.15,
    'klassisk': 0.9,
    'ats-optimerad': 1.2,
    'akademisk': 0.8,
    'modern-tech': 1.25
  },
  'mid': {
    'modern': 1.0,
    'kreativ': 1.0,
    'klassisk': 1.0,
    'ats-optimerad': 1.1,
    'akademisk': 0.95,
    'modern-tech': 1.15
  },
  'senior': {
    'modern': 0.95,
    'kreativ': 0.9,
    'klassisk': 1.1,
    'ats-optimerad': 1.0,
    'akademisk': 1.05,
    'modern-tech': 1.1
  },
  'executive': {
    'modern': 0.9,
    'kreativ': 0.8,
    'klassisk': 1.2,
    'ats-optimerad': 0.9,
    'akademisk': 1.1,
    'modern-tech': 1.0
  }
} as const;

// Svenska företagsstorlek och kultur preferenser
const SWEDISH_COMPANY_PREFERENCES = {
  'startup': ['modern', 'kreativ'],
  'scale-up': ['modern', 'ats-optimerad'],
  'enterprise': ['klassisk', 'ats-optimerad'],
  'consulting': ['klassisk', 'modern'],
  'government': ['klassisk', 'ats-optimerad'],
  'academia': ['akademisk', 'klassisk'],
  'creative-agency': ['kreativ', 'modern']
};

/**
 * Huvudfunktion för AI-driven template rekommendationer
 */
export async function getAITemplateRecommendations(
  cvText: string,
  currentTemplateUsage?: Record<CVTemplateType, number>
): Promise<TemplateRecommendation[]> {
  
  try {
    // 1. Analysera CV med AI för att få detaljerad bransch/roll information
    const aiAnalysis = await parseCVWithAI(cvText);
    const baseCvData = aiAnalysis.cvData;
    
    // Simulera enhanced data från AI-resultat och text-analys
    const cvData = {
      ...baseCvData,
      detectedIndustry: detectIndustryFromText(cvText),
      experienceLevel: detectExperienceLevelFromText(cvText, baseCvData),
      keyStrengths: [],
      quantifiableAchievements: []
    };
    
    // 2. Detektera svensk arbetsmarknadskontext
    const swedishContext = analyzeSwedishMarketContext(cvText);
    
    // 3. Beräkna rekommendationer för varje template
    const recommendations: TemplateRecommendation[] = [];
    
    const templateTypes: CVTemplateType[] = ['klassisk', 'modern', 'kreativ', 'ats-optimerad', 'akademisk', 'modern-tech'];
    
    for (const templateId of templateTypes) {
      const recommendation = calculateTemplateScore(
        templateId,
        cvData,
        swedishContext,
        currentTemplateUsage
      );
      
      recommendations.push(recommendation);
    }
    
    // 4. Sortera och returnera top rekommendationer
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 rekommendationer
      
  } catch (error) {
    console.error('AI template recommendation error:', error);
    // Fallback till regelbaserade rekommendationer
    return getFallbackRecommendations(cvText);
  }
}

/**
 * Beräknar template-score baserat på AI-analys och svenska marknadsinsikter
 */
function calculateTemplateScore(
  templateId: CVTemplateType,
  cvData: any,
  swedishContext: SwedishMarketContext,
  currentUsage?: Record<CVTemplateType, number>
): TemplateRecommendation {
  
  // Base score från bransch-mapping
  const industry = normalizeIndustry(cvData.detectedIndustry);
  const industryMapping = INDUSTRY_TEMPLATE_MAPPING[industry] || INDUSTRY_TEMPLATE_MAPPING.default;
  let baseScore = industryMapping[templateId] || 50;
  
  // Erfarenhetsnivå-modifiering
  const experienceModifier = (EXPERIENCE_MODIFIERS as any)[cvData.experienceLevel]?.[templateId] || 1.0;
  baseScore *= experienceModifier;
  
  // Svenska marknadsanpassningar
  const swedishBonus = calculateSwedishMarketBonus(templateId, swedishContext);
  baseScore += swedishBonus;
  
  // ATS-optimering bonus för svenska företag
  if (templateId === 'ats-optimerad' && swedishContext.likelyATSCompany) {
    baseScore += 15;
  }
  
  // Personlighets/roll-baserade justeringar
  const roleAdjustment = calculateRoleBasedAdjustment(templateId, cvData);
  baseScore += roleAdjustment;
  
  // Usage diversity bonus (uppmuntra att prova nya mallar)
  const usageBonus = calculateUsageDiversityBonus(templateId, currentUsage);
  baseScore += usageBonus;
  
  // Säkerställ att score är inom 0-100
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)));
  
  // Generera reasoning
  const reasoning = generateRecommendationReasoning(
    templateId, 
    cvData.detectedIndustry, 
    cvData.experienceLevel,
    swedishContext,
    finalScore
  );
  
  return {
    templateId,
    score: finalScore,
    reasoning,
    suitabilityFactors: {
      industryMatch: Math.min(100, industryMapping[templateId] || 50),
      experienceLevel: Math.round(experienceModifier * 100),
      roleType: Math.min(100, Math.max(0, 50 + roleAdjustment)),
      atsOptimization: templateId === 'ats-optimerad' ? 95 : 70,
      visualPreference: getVisualPreferenceScore(templateId, cvData)
    },
    swedishMarketFit: Math.min(100, Math.max(0, 75 + swedishBonus))
  };
}

/**
 * Analyserar svensk arbetsmarknadskontext från CV-text
 */
interface SwedishMarketContext {
  likelyATSCompany: boolean;
  companySize: 'startup' | 'scale-up' | 'enterprise' | 'government' | 'unknown';
  industryCluster: string;
  locationContext: 'stockholm' | 'göteborg' | 'malmö' | 'other' | 'unknown';
}

function analyzeSwedishMarketContext(cvText: string): SwedishMarketContext {
  const text = cvText.toLowerCase();
  
  // ATS-sannolika företag (stora svenska företag som använder ATS)
  const atsKeywords = [
    'h&m', 'spotify', 'klarna', 'volvo', 'ericsson', 'scania', 'skf',
    'electrolux', 'sandvik', 'atlas copco', 'handelsbanken', 'seb',
    'nordea', 'swedbank', 'telia', 'tng', 'manpower', 'academic work'
  ];
  
  const likelyATSCompany = atsKeywords.some(keyword => text.includes(keyword));
  
  // Företagsstorlek indikatorer
  let companySize: SwedishMarketContext['companySize'] = 'unknown';
  if (text.includes('startup') || text.includes('scale-up')) {
    companySize = 'startup';
  } else if (text.includes('kommun') || text.includes('myndighet') || text.includes('region')) {
    companySize = 'government';
  } else if (likelyATSCompany) {
    companySize = 'enterprise';
  }
  
  // Geografisk kontext
  let locationContext: SwedishMarketContext['locationContext'] = 'unknown';
  if (text.includes('stockholm')) locationContext = 'stockholm';
  else if (text.includes('göteborg') || text.includes('gothenburg')) locationContext = 'göteborg';
  else if (text.includes('malmö') || text.includes('malmo')) locationContext = 'malmö';
  else locationContext = 'other';
  
  return {
    likelyATSCompany,
    companySize,
    industryCluster: '', // Kan utvecklas vidare
    locationContext
  };
}

/**
 * Beräknar svensk marknadsbonus för specifik template
 */
function calculateSwedishMarketBonus(templateId: CVTemplateType, context: SwedishMarketContext): number {
  let bonus = 0;
  
  // Geografiska bonusar
  if (context.locationContext === 'stockholm') {
    // Stockholm = mer modern/tech-fokuserat
    if (templateId === 'modern' || templateId === 'kreativ') bonus += 5;
  } else if (context.locationContext === 'göteborg') {
    // Göteborg = industri/ingenjör-fokus
    if (templateId === 'klassisk' || templateId === 'modern') bonus += 5;
  }
  
  // Företagsstorlek-baserade bonusar
  const preferredTemplates = (SWEDISH_COMPANY_PREFERENCES as any)[context.companySize];
  if (preferredTemplates?.includes(templateId)) {
    bonus += 8;
  }
  
  return bonus;
}

/**
 * Rollbaserade justeringar baserat på CV-innehåll
 */
function calculateRoleBasedAdjustment(templateId: CVTemplateType, cvData: any): number {
  let adjustment = 0;
  
  // Analysera nyckelord i CV för att identifiera rolltyp
  const cvContent = (cvData.summary || '') + ' ' + 
                    (cvData.experience?.map((exp: any) => exp.description?.join(' ')).join(' ') || '');
  
  const content = cvContent.toLowerCase();
  
  // Tech/IT roller
  if (content.includes('utvecklar') || content.includes('programmerare') || 
      content.includes('tech') || content.includes('systemutvecklare')) {
    if (templateId === 'modern' || templateId === 'ats-optimerad') adjustment += 8;
  }
  
  // Kreativa roller
  if (content.includes('designer') || content.includes('marknadsförare') || 
      content.includes('kreativ') || content.includes('reklam')) {
    if (templateId === 'kreativ' || templateId === 'modern') adjustment += 10;
  }
  
  // Ledningsroller
  if (content.includes('chef') || content.includes('ledare') || 
      content.includes('director') || content.includes('vd')) {
    if (templateId === 'klassisk') adjustment += 12;
  }
  
  // Akademiska roller
  if (content.includes('forskare') || content.includes('doktor') || 
      content.includes('professor') || content.includes('forskning')) {
    if (templateId === 'akademisk') adjustment += 15;
  }
  
  return adjustment;
}

/**
 * Beräknar usage diversity bonus
 */
function calculateUsageDiversityBonus(
  templateId: CVTemplateType, 
  currentUsage?: Record<CVTemplateType, number>
): number {
  if (!currentUsage) return 0;
  
  const totalUsage = Object.values(currentUsage).reduce((sum, count) => sum + count, 0);
  if (totalUsage === 0) return 0;
  
  const templateUsage = currentUsage[templateId] || 0;
  const usagePercentage = templateUsage / totalUsage;
  
  // Ge bonus till mindre använda mallar (uppmuntra diversitet)
  if (usagePercentage < 0.1) return 5;
  if (usagePercentage < 0.2) return 3;
  if (usagePercentage > 0.5) return -3;
  
  return 0;
}

/**
 * Beräknar visuell preferens-score
 */
function getVisualPreferenceScore(templateId: CVTemplateType, cvData: any): number {
  // Baserat på bransch och roll, ge visuella preferenspoäng
  const baseScores = {
    'klassisk': 60,
    'modern': 80,
    'kreativ': 95,
    'ats-optimerad': 70,
    'akademisk': 65,
    'modern-tech': 90
  };
  
  return baseScores[templateId] || 60;
}

/**
 * Genererar human-readable reasoning för rekommendationen
 */
function generateRecommendationReasoning(
  templateId: CVTemplateType,
  industry: string,
  experienceLevel: string,
  swedishContext: SwedishMarketContext,
  score: number
): string {
  const templateNames = {
    'klassisk': 'Klassiska mallen',
    'modern': 'Moderna mallen',
    'kreativ': 'Kreativa mallen',
    'ats-optimerad': 'ATS-optimerade mallen',
    'akademisk': 'Akademiska mallen',
    'modern-tech': 'Modern Tech-mallen'
  };
  
  const templateName = templateNames[templateId];
  
  let reasoning = `${templateName} passar dig väl `;
  
  // Branschspecifik motivering
  if (industry === 'teknologi' && (templateId === 'modern' || templateId === 'ats-optimerad')) {
    reasoning += `eftersom du arbetar inom tech-sektorn där moderna, ATS-vänliga CV:n är standard. `;
  } else if (industry === 'kreativ' && templateId === 'kreativ') {
    reasoning += `eftersom din kreativa bakgrund kräver ett CV som visar din designkänsla. `;
  } else if (templateId === 'klassisk') {
    reasoning += `eftersom den traditionella layouten bygger förtroende hos svenska rekryterare. `;
  }
  
  // Erfarenhetsnivå-motivering
  if (experienceLevel === 'junior' && (templateId === 'modern' || templateId === 'ats-optimerad')) {
    reasoning += `Som ${experienceLevel} får du bäst genomslagskraft med denna moderna approach. `;
  } else if (experienceLevel === 'senior' && templateId === 'klassisk') {
    reasoning += `Din seniora erfarenhet framhävs bäst i en professionell, klassisk design. `;
  }
  
  // Svenska marknadskontext
  if (swedishContext.likelyATSCompany && templateId === 'ats-optimerad') {
    reasoning += `Perfekt för stora svenska företag som använder ATS-system. `;
  }
  
  // Score-baserad slutsats
  if (score >= 85) {
    reasoning += `Stark rekommendation för dina mål.`;
  } else if (score >= 70) {
    reasoning += `Bra val för din profil.`;
  } else {
    reasoning += `Kan fungera, men överväg andra alternativ.`;
  }
  
  return reasoning;
}

/**
 * Normaliserar branschnamn till våra kategorier
 */
function normalizeIndustry(detectedIndustry: string): keyof typeof INDUSTRY_TEMPLATE_MAPPING {
  const industry = detectedIndustry?.toLowerCase() || '';
  
  if (industry.includes('tech') || industry.includes('it') || industry.includes('software')) {
    return 'teknologi';
  } else if (industry.includes('finans') || industry.includes('bank') || industry.includes('försäkring')) {
    return 'finansiering';
  } else if (industry.includes('kreativ') || industry.includes('design') || industry.includes('marknadsför')) {
    return 'kreativ';
  } else if (industry.includes('akademisk') || industry.includes('forskning') || industry.includes('universitet')) {
    return 'akademisk';
  } else if (industry.includes('konsult') || industry.includes('rådgivning')) {
    return 'konsulting';
  } else if (industry.includes('sjukvård') || industry.includes('vård') || industry.includes('medicin')) {
    return 'sjukvård';
  } else if (industry.includes('ingenjör') || industry.includes('teknik') || industry.includes('industri')) {
    return 'ingenjörsvetenskap';
  } else if (industry.includes('försäljning') || industry.includes('sales')) {
    return 'försäljning';
  }
  
  return 'default';
}

/**
 * Fallback-rekommendationer om AI-analys misslyckas
 */
function getFallbackRecommendations(cvText: string): TemplateRecommendation[] {
  const text = cvText.toLowerCase();
  
  const fallbackRecommendations: TemplateRecommendation[] = [
    {
      templateId: 'ats-optimerad',
      score: 80,
      reasoning: 'ATS-optimerade mallen är säker för svenska jobbportaler och stora företag.',
      suitabilityFactors: {
        industryMatch: 80,
        experienceLevel: 80,
        roleType: 70,
        atsOptimization: 95,
        visualPreference: 70
      },
      swedishMarketFit: 85
    },
    {
      templateId: 'klassisk',
      score: 75,
      reasoning: 'Klassiska mallen bygger förtroende och fungerar för alla branscher.',
      suitabilityFactors: {
        industryMatch: 70,
        experienceLevel: 75,
        roleType: 70,
        atsOptimization: 70,
        visualPreference: 60
      },
      swedishMarketFit: 80
    },
    {
      templateId: 'modern',
      score: 70,
      reasoning: 'Moderna mallen balanserar professionalism med nutida design.',
      suitabilityFactors: {
        industryMatch: 75,
        experienceLevel: 70,
        roleType: 75,
        atsOptimization: 75,
        visualPreference: 80
      },
      swedishMarketFit: 75
    }
  ];
  
  return fallbackRecommendations;
}

/**
 * Detekterar bransch från CV-text
 */
function detectIndustryFromText(cvText: string): string {
  const text = cvText.toLowerCase();
  
  if (text.includes('utvecklar') || text.includes('programmerare') || text.includes('tech') || text.includes('it') || text.includes('software')) {
    return 'teknologi';
  } else if (text.includes('designer') || text.includes('kreativ') || text.includes('marknadsför') || text.includes('reklam')) {
    return 'kreativ';
  } else if (text.includes('bank') || text.includes('finans') || text.includes('försäkring')) {
    return 'finansiering';
  } else if (text.includes('forskare') || text.includes('universitetet') || text.includes('akademisk')) {
    return 'akademisk';
  } else if (text.includes('konsult') || text.includes('rådgivning')) {
    return 'konsulting';
  } else if (text.includes('sjukvård') || text.includes('medicin') || text.includes('vård')) {
    return 'sjukvård';
  } else if (text.includes('ingenjör') || text.includes('industri') || text.includes('teknik')) {
    return 'ingenjörsvetenskap';
  } else if (text.includes('försäljning') || text.includes('sales')) {
    return 'försäljning';
  }
  
  return 'default';
}

/**
 * Detekterar erfarenhetsnivå från CV-text och data
 */
function detectExperienceLevelFromText(cvText: string, cvData: any): 'junior' | 'mid' | 'senior' | 'executive' {
  const text = cvText.toLowerCase();
  const experienceYears = cvData.experience?.length || 0;
  
  // Kontrollera för senior/executive keywords
  if (text.includes('vd') || text.includes('ceo') || text.includes('chef') || text.includes('director')) {
    return 'executive';
  } else if (text.includes('senior') || text.includes('lead') || text.includes('ledare') || experienceYears >= 5) {
    return 'senior';
  } else if (text.includes('junior') || text.includes('trainee') || experienceYears <= 2) {
    return 'junior';
  } else {
    return 'mid';
  }
}

/**
 * Utility function för att få snabba rekommendationer baserat på existing CV store data
 */
export function getQuickRecommendations(
  selectedCV: any,
  templateUsage: Record<CVTemplateType, number>
): CVTemplateType[] {
  
  if (!selectedCV?.cv_text) {
    return ['ats-optimerad', 'modern', 'klassisk'];
  }
  
  const text = selectedCV.cv_text.toLowerCase();
  const recommendations: CVTemplateType[] = [];
  
  // Snabb branschdetektering
  if (text.includes('utvecklar') || text.includes('tech') || text.includes('it')) {
    recommendations.push('modern', 'ats-optimerad', 'kreativ');
  } else if (text.includes('designer') || text.includes('kreativ') || text.includes('marknadsför')) {
    recommendations.push('kreativ', 'modern', 'ats-optimerad');  
  } else if (text.includes('chef') || text.includes('ledare') || text.includes('bank') || text.includes('finans')) {
    recommendations.push('klassisk', 'modern', 'ats-optimerad');
  } else if (text.includes('forskare') || text.includes('doktor') || text.includes('universitet')) {
    recommendations.push('akademisk', 'klassisk', 'modern');
  } else {
    // Default rekommendationer
    recommendations.push('ats-optimerad', 'klassisk', 'modern');
  }
  
  // Filtrera bort överanvända mallar
  const totalUsage = Object.values(templateUsage).reduce((sum, count) => sum + count, 0);
  if (totalUsage > 0) {
    return recommendations.filter(template => {
      const usage = templateUsage[template] || 0;
      return (usage / totalUsage) < 0.4; // Undvik mallar som används >40% av tiden
    }).slice(0, 3);
  }
  
  return recommendations.slice(0, 3);
}