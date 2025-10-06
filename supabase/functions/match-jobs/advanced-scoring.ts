/**
 * Advanced Scoring System
 *
 * 10-faktor matchningsalgoritm som kombinerar:
 * - SSYK-koder (Taxonomy)
 * - Enriched job data (AI-extraherade nyckelord)
 * - Historical trends (efterfrågade kompetenser)
 * - Education matching (JobEd Connect)
 * - Traditionella faktorer (geografi, erfarenhet, etc.)
 */

import type { EnrichedJobData } from './jobad-enrichments.ts';
import type { HistoricalTrends } from './historical-analysis.ts';
import type { TaxonomyEnrichment } from './taxonomy-enrichment.ts';

export interface AdvancedScoringInput {
  // CV data
  cvData: any;
  cvOccupations: string[];
  cvLocations: string[];
  analysisData: any;

  // Job data
  job: any;
  enrichedJob: EnrichedJobData | null;

  // Enrichment data
  taxonomyData: TaxonomyEnrichment | null;
  historicalTrends: HistoricalTrends | null;
  educationMatches?: string[]; // Från JobEd Connect

  // Settings
  userPreferredDistance?: number;
  isRemote?: boolean;
}

export interface ScoringBreakdown {
  total: number;
  breakdown: {
    ssykMatch: number;
    occupationMatch: number;
    enrichedSkills: number;
    experienceLevel: number;
    educationMatch: number;
    geography: number;
    trendingSkills: number;
    tools: number;
    responsibilities: number;
    matchKeywords: number;
  };
  explanation: string[];
}

/**
 * Huvudfunktion: Beräkna avancerad relevans-score med 10 faktorer
 */
export function calculateAdvancedRelevance(input: AdvancedScoringInput): ScoringBreakdown {
  const breakdown = {
    ssykMatch: 0,
    occupationMatch: 0,
    enrichedSkills: 0,
    experienceLevel: 0,
    educationMatch: 0,
    geography: 0,
    trendingSkills: 0,
    tools: 0,
    responsibilities: 0,
    matchKeywords: 0
  };

  const explanation: string[] = [];

  // Faktor 1: SSYK-kod exakt matchning (35p - HÖGST!)
  breakdown.ssykMatch = calculateSSYKMatch(input, explanation);

  // Faktor 2: Yrkestitel-matchning med Taxonomy (20p - reducerad pga SSYK)
  breakdown.occupationMatch = calculateOccupationMatch(input, explanation);

  // Faktor 3: Enriched kompetenser från jobbannonsen (15p)
  breakdown.enrichedSkills = calculateEnrichedSkillsMatch(input, explanation);

  // Faktor 4: Erfarenhetsnivå (10p)
  breakdown.experienceLevel = calculateExperienceMatch(input, explanation);

  // Faktor 5: Utbildningsnivå från JobEd Connect (5p)
  breakdown.educationMatch = calculateEducationMatch(input, explanation);

  // Faktor 6: Geografi (10p - reducerat från 25p)
  breakdown.geography = calculateGeographyMatch(input, explanation);

  // Faktor 7: Trending skills bonus (5p)
  breakdown.trendingSkills = calculateTrendingSkillsMatch(input, explanation);

  // Faktor 8: Verktyg/System (3p)
  breakdown.tools = calculateToolsMatch(input, explanation);

  // Faktor 9: Arbetsuppgifter (3p)
  breakdown.responsibilities = calculateResponsibilitiesMatch(input, explanation);

  // Faktor 10: AI-matchKeywords från vår egen analys (4p)
  breakdown.matchKeywords = calculateMatchKeywordsScore(input, explanation);

  const total = Math.min(100, Math.round(
    breakdown.ssykMatch +
    breakdown.occupationMatch +
    breakdown.enrichedSkills +
    breakdown.experienceLevel +
    breakdown.educationMatch +
    breakdown.geography +
    breakdown.trendingSkills +
    breakdown.tools +
    breakdown.responsibilities +
    breakdown.matchKeywords
  ));

  return {
    total,
    breakdown,
    explanation
  };
}

// ============================================================================
// FAKTOR 1: SSYK-KOD MATCHNING (35p)
// ============================================================================
function calculateSSYKMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { taxonomyData, enrichedJob, job } = input;

  // Om vi har SSYK från både CV och jobb
  if (taxonomyData?.ssykCode && enrichedJob?.occupations) {
    for (const jobOcc of enrichedJob.occupations) {
      if (jobOcc.ssyk_code === taxonomyData.ssykCode) {
        explanation.push(`✅ SSYK-match: ${taxonomyData.ssykCode} (35p)`);
        return 35;
      }
    }
  }

  // Alternativ: Extrahera SSYK från job.occupation om det finns
  if (taxonomyData?.ssykCode && job.occupation?.concept_id) {
    // concept_id kan innehålla SSYK-kod
    if (job.occupation.concept_id.includes(taxonomyData.ssykCode)) {
      explanation.push(`✅ SSYK-match via concept_id (35p)`);
      return 35;
    }
  }

  // Ingen SSYK-match
  return 0;
}

// ============================================================================
// FAKTOR 2: YRKESTITEL-MATCHNING (20p)
// ============================================================================
function calculateOccupationMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { cvOccupations, taxonomyData, job, enrichedJob } = input;

  if (cvOccupations.length === 0) return 0;

  const primaryOccupation = cvOccupations[0].toLowerCase();
  const jobText = `${job.headline || ''} ${job.occupation?.label || ''}`.toLowerCase();

  // 1. Exakt matchning av primär yrkestitel = 20p
  if (jobText.includes(primaryOccupation)) {
    explanation.push(`✅ Exakt yrkestitel: "${cvOccupations[0]}" (20p)`);
    return 20;
  }

  // 2. Matchning via Taxonomy-synonymer = 18p
  if (taxonomyData?.alternativeLabels) {
    for (const synonym of taxonomyData.alternativeLabels) {
      if (jobText.includes(synonym.toLowerCase())) {
        explanation.push(`✅ Taxonomy-synonym: "${synonym}" (18p)`);
        return 18;
      }
    }
  }

  // 3. Matchning via enriched job occupations = 16p
  if (enrichedJob?.occupations) {
    for (const occ of enrichedJob.occupations) {
      if (occ.term.toLowerCase().includes(primaryOccupation) ||
          primaryOccupation.includes(occ.term.toLowerCase())) {
        explanation.push(`✅ Enriched occupation: "${occ.term}" (16p)`);
        return 16;
      }
    }
  }

  // 4. Partiell matchning av primär yrkestitel = 12p
  const primaryWords = primaryOccupation.split(/[\s-]+/).filter(word => word.length > 3);
  if (primaryWords.length > 1) {
    for (const word of primaryWords) {
      if (jobText.includes(word)) {
        explanation.push(`✅ Partiell yrkestitel: "${word}" (12p)`);
        return 12;
      }
    }
  }

  // 5. Matchning av sekundära yrkestitlar från CV = 10p
  for (let i = 1; i < Math.min(cvOccupations.length, 3); i++) {
    if (jobText.includes(cvOccupations[i].toLowerCase())) {
      explanation.push(`✅ Sekundär yrkestitel: "${cvOccupations[i]}" (10p)`);
      return 10;
    }
  }

  return 0;
}

// ============================================================================
// FAKTOR 3: ENRICHED SKILLS (15p)
// ============================================================================
function calculateEnrichedSkillsMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { enrichedJob, analysisData } = input;

  if (!enrichedJob?.skills || !analysisData?.skillSuggestions) {
    return 0;
  }

  const cvSkills = analysisData.skillSuggestions.map((s: any) => s.skill.toLowerCase());
  const jobSkills = enrichedJob.skills.map(s => s.term.toLowerCase());

  let matchCount = 0;
  let weightedScore = 0;

  for (const jobSkill of enrichedJob.skills) {
    const skillLower = jobSkill.term.toLowerCase();
    const isMatch = cvSkills.some((cvSkill: string) =>
      cvSkill.includes(skillLower) || skillLower.includes(cvSkill)
    );

    if (isMatch) {
      matchCount++;
      weightedScore += jobSkill.weight * 5; // Max 5p per skill
    }
  }

  const score = Math.min(15, Math.round(weightedScore));

  if (score > 0) {
    explanation.push(`✅ ${matchCount} enriched skills matchar (${score}p)`);
  }

  return score;
}

// ============================================================================
// FAKTOR 4: ERFARENHET (10p)
// ============================================================================
function calculateExperienceMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { cvData, enrichedJob } = input;

  if (!enrichedJob?.experience_required?.years) {
    // Inget erfarenhetskrav specificerat = ge baseline 5p
    return 5;
  }

  // Beräkna total erfarenhet från CV
  const experiences = cvData.structuredCV?.experience || cvData.experience || [];
  let totalYears = 0;

  for (const exp of experiences) {
    const startYear = parseInt(exp.startDate) || 0;
    const endYear = exp.endDate && exp.endDate !== 'Nuvarande'
      ? parseInt(exp.endDate)
      : new Date().getFullYear();

    if (startYear > 0 && endYear > 0) {
      totalYears += (endYear - startYear);
    }
  }

  const requiredYears = enrichedJob.experience_required.years;

  if (totalYears >= requiredYears) {
    explanation.push(`✅ ${totalYears}+ år erfarenhet (krav: ${requiredYears}) (10p)`);
    return 10;
  } else if (totalYears >= requiredYears * 0.7) {
    explanation.push(`⚠️  ${totalYears} år erfarenhet (krav: ${requiredYears}) (7p)`);
    return 7;
  } else {
    explanation.push(`❌ ${totalYears} år erfarenhet (krav: ${requiredYears}) (3p)`);
    return 3;
  }
}

// ============================================================================
// FAKTOR 5: UTBILDNING (5p)
// ============================================================================
function calculateEducationMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { educationMatches, job } = input;

  if (!educationMatches || educationMatches.length === 0) {
    return 0;
  }

  const jobText = `${job.headline || ''} ${job.description?.text || ''}`.toLowerCase();

  // Kolla om någon av education-matchade yrken finns i jobbet
  for (const matchedOcc of educationMatches) {
    if (jobText.includes(matchedOcc.toLowerCase())) {
      explanation.push(`✅ Utbildning matchar yrke: "${matchedOcc}" (5p)`);
      return 5;
    }
  }

  return 0;
}

// ============================================================================
// FAKTOR 6: GEOGRAFI (10p)
// ============================================================================
function calculateGeographyMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { cvLocations, job, userPreferredDistance, isRemote } = input;

  if (isRemote) {
    explanation.push(`✅ Remote-jobb (10p)`);
    return 10;
  }

  if (cvLocations.length === 0 || !job.workplace_address?.municipality) {
    return 5; // Neutral score om ingen data
  }

  const cvLocation = cvLocations[0].toLowerCase();
  const jobLocation = (job.workplace_address.municipality || '').toLowerCase();

  // Exakt match
  if (cvLocation === jobLocation) {
    explanation.push(`✅ Exakt plats: ${job.workplace_address.municipality} (10p)`);
    return 10;
  }

  // Samma region
  const jobRegion = (job.workplace_address.region || '').toLowerCase();
  if (cvLocation.includes(jobRegion) || jobRegion.includes(cvLocation)) {
    explanation.push(`⚠️  Samma region: ${job.workplace_address.region} (7p)`);
    return 7;
  }

  // Närliggande (om vi har koordinater)
  if (userPreferredDistance && job.workplace_address.coordinates) {
    // Implementera avståndsberäkning här om nödvändigt
    // För nu: ge 5p som baseline
    return 5;
  }

  return 3;
}

// ============================================================================
// FAKTOR 7: TRENDING SKILLS (5p)
// ============================================================================
function calculateTrendingSkillsMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { historicalTrends, analysisData } = input;

  if (!historicalTrends?.trendingSkills || !analysisData?.skillSuggestions) {
    return 0;
  }

  const cvSkills = analysisData.skillSuggestions.map((s: any) => s.skill.toLowerCase());
  let matchCount = 0;

  for (const trend of historicalTrends.trendingSkills) {
    const trendLower = trend.skill.toLowerCase();
    const hasSkill = cvSkills.some((cvSkill: string) =>
      cvSkill.includes(trendLower) || trendLower.includes(cvSkill)
    );

    if (hasSkill && trend.growthRate > 100) {
      matchCount++;
    }
  }

  const score = Math.min(5, matchCount * 2);

  if (score > 0) {
    explanation.push(`✅ ${matchCount} trending skills (${score}p)`);
  }

  return score;
}

// ============================================================================
// FAKTOR 8: VERKTYG/SYSTEM (3p)
// ============================================================================
function calculateToolsMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { analysisData, job } = input;

  const jobText = `${job.headline || ''} ${job.description?.text || ''}`.toLowerCase();

  // Hämta alla tools från roleBasedImprovements
  const allTools: string[] = [];
  if (analysisData.roleBasedImprovements) {
    analysisData.roleBasedImprovements.forEach((role: any) => {
      if (role.matchKeywords?.tools) {
        allTools.push(...role.matchKeywords.tools);
      }
    });
  }

  let matchCount = 0;
  for (const tool of allTools) {
    if (jobText.includes(tool.toLowerCase())) {
      matchCount++;
    }
  }

  const score = Math.min(3, matchCount);

  if (score > 0) {
    explanation.push(`✅ ${matchCount} verktyg matchar (${score}p)`);
  }

  return score;
}

// ============================================================================
// FAKTOR 9: ARBETSUPPGIFTER (3p)
// ============================================================================
function calculateResponsibilitiesMatch(input: AdvancedScoringInput, explanation: string[]): number {
  const { analysisData, job } = input;

  const jobText = `${job.headline || ''} ${job.description?.text || ''}`.toLowerCase();

  // Hämta alla responsibilities
  const allResponsibilities: string[] = [];
  if (analysisData.roleBasedImprovements) {
    analysisData.roleBasedImprovements.forEach((role: any) => {
      if (role.matchKeywords?.responsibilities) {
        allResponsibilities.push(...role.matchKeywords.responsibilities);
      }
    });
  }

  let matchCount = 0;
  for (const resp of allResponsibilities) {
    if (jobText.includes(resp.toLowerCase())) {
      matchCount++;
    }
  }

  const score = Math.min(3, matchCount);

  if (score > 0) {
    explanation.push(`✅ ${matchCount} arbetsuppgifter matchar (${score}p)`);
  }

  return score;
}

// ============================================================================
// FAKTOR 10: MATCHKEYWORDS (4p)
// ============================================================================
function calculateMatchKeywordsScore(input: AdvancedScoringInput, explanation: string[]): number {
  const { analysisData, job } = input;

  const jobText = `${job.headline || ''} ${job.description?.text || ''}`.toLowerCase();

  let totalMatches = 0;

  if (analysisData.roleBasedImprovements) {
    analysisData.roleBasedImprovements.forEach((role: any) => {
      const mk = role.matchKeywords;
      if (!mk) return;

      // Räkna alla typer av matchKeywords
      const allKeywords = [
        ...(mk.directSkills || []),
        ...(mk.implicitSkills || []),
        ...(mk.industryTerms || [])
      ];

      for (const keyword of allKeywords) {
        if (jobText.includes(keyword.toLowerCase())) {
          totalMatches++;
        }
      }
    });
  }

  const score = Math.min(4, Math.floor(totalMatches / 3));

  if (score > 0) {
    explanation.push(`✅ ${totalMatches} matchKeywords (${score}p)`);
  }

  return score;
}
