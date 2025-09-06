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

// Universell design-baserad template rekommendation - alla mallar är tillgängliga för alla
const DESIGN_PREFERENCE_MAPPING = {
  // Alla mallar får höga base scores - val baseras på designpreferens, inte yrke
  'universal': {
    'klassisk': 85,     // Elegant, traditionell design
    'modern': 85,       // Balanserad, nutida design  
    'kreativ': 85,      // Visuellt uttrycksfull design
    'ats-optimerad': 85, // Strukturerad, systemoptimerad design
    'akademisk': 85,    // Sofistikerad, forskningsorienterad design
    'modern-tech': 85   // Tekniskt avancerad, minimal design
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
  
  // Base score från universell design-mapping - alla templates är tillgängliga
  const designMapping = DESIGN_PREFERENCE_MAPPING.universal;
  let baseScore = designMapping[templateId] || 85;
  
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
      industryMatch: 90, // Alla templates passar alla branscher
      experienceLevel: Math.round(experienceModifier * 100),
      roleType: 90, // Alla templates passar alla roller  
      atsOptimization: templateId === 'ats-optimerad' ? 95 : 85,
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
  
  // Universell innehållsanalys - inga yrkesbegränsningar
  // Alla templates är tillgängliga för alla, justeringar baseras på designpreferens
  
  // Ge små bonusar baserat på innehåll men utan att begränsa tillgång
  if (content.includes('utvecklar') || content.includes('programmerare') || 
      content.includes('tech') || content.includes('systemutvecklare')) {
    // Tech-innehåll - alla templates fortfarande tillgängliga, liten bonus för tech-vänliga
    if (templateId === 'modern' || templateId === 'modern-tech') adjustment += 3;
  }
  
  if (content.includes('chef') || content.includes('ledare') || 
      content.includes('director') || content.includes('vd')) {
    // Ledarskapserfarenhet - liten bonus för strukturerade designs
    if (templateId === 'klassisk' || templateId === 'ats-optimerad') adjustment += 3;
  }
  
  // VIKTIGT: Alla andra yrkesgrupper (städare, lastbilschaufför, etc) får samma tillgång
  // Inga negativa justeringar eller begränsningar för någon yrkesgrupp
  
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
  
  // Universell design-baserad motivering - ingen yrkesbegränsning
  if (templateId === 'klassisk') {
    reasoning += `med sin eleganta, traditionella design som bygger förtroende hos alla typer av arbetsgivare. `;
  } else if (templateId === 'modern') {
    reasoning += `med sin balanserade, nutida design som fungerar perfekt för alla branscher. `;
  } else if (templateId === 'kreativ') {
    reasoning += `med sin visuellt uttrycksfulla design som hjälper dig att sticka ut, oavsett yrke. `;
  } else if (templateId === 'ats-optimerad') {
    reasoning += `med sin strukturerade design som fungerar optimalt med svenska ATS-system. `;
  } else if (templateId === 'akademisk') {
    reasoning += `med sin sofistikerade design som förmedlar seriositet och djupgående expertis. `;
  } else if (templateId === 'modern-tech') {
    reasoning += `med sin tekniskt avancerade, minimala design som signalerar innovation. `;
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
function analyzeDesignPreference(detectedIndustry: string, cvContent: string): string {
  // Analysera användares designpreferens utan yrkesbegränsningar
  // Alla bransch-detektioner leder till universell tillgång
  return 'universal'; // Alla användare får tillgång till alla templates
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
 * Analyserar CV-innehåll för designpreferenser (ersätter branschbegränsningar)
 */
function detectIndustryFromText(cvText: string): string {
  // UNIVERSELL FUNKTION: Alla användare får samma tillgång oavsett innehåll
  // Returnerar 'universal' för att säkerställa att alla templates är tillgängliga
  // Detta inkluderar lastbilschaufförer, städare, VD:ar, forskare - alla får samma rättigheter
  
  return 'universal';
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
  
  // Universell rekommendationslogik - alla mallar tillgängliga för alla
  // Rotera rekommendationer baserat på popularitet och diversitet istället för yrke
  
  // Ge alla användare tillgång till alla mallar, oavsett bakgrund
  const allTemplates: CVTemplateType[] = ['klassisk', 'modern', 'kreativ', 'ats-optimerad', 'akademisk', 'modern-tech'];
  
  // Välj 3 mallar baserat på usage diversity istället för yrkesbegränsningar
  const sortedByUsage = allTemplates.sort((a, b) => {
    const usageA = templateUsage[a] || 0;
    const usageB = templateUsage[b] || 0;
    return usageA - usageB; // Sortera med minst använda först
  });
  
  // Rekommendera de 3 minst använda mallarna för att uppmuntra diversitet
  recommendations.push(...sortedByUsage.slice(0, 3));
  
  // Om ingen usage-data finns, ge balanserade rekommendationer
  if (recommendations.length === 0) {
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