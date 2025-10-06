/**
 * JobEd Connect API Integration
 *
 * Integrerar med Arbetsförmedlingens JobEd Connect API för att matcha
 * utbildningar mot yrken baserat på kompetenser.
 *
 * API Docs: https://jobed-connect-api.jobtechdev.se
 */

export interface EducationToOccupationMatch {
  occupation: string;
  ssyk_code?: string;
  relevance: number; // 0-1
  competencies: string[];
  description?: string;
}

export interface OccupationToEducationMatch {
  education: string;
  education_code?: string;
  relevance: number; // 0-1
  competencies: string[];
  level: 'gymnasial' | 'eftergymnasial' | 'universitet';
}

const BASE_URL = 'https://jobed-connect-api.jobtechdev.se';

// Cache för utbildning-till-yrke-matchningar (7 dagar)
const educationCache = new Map<string, { data: EducationToOccupationMatch[]; timestamp: number }>();
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagar

/**
 * Hitta yrken som matchar en given utbildning
 */
export async function getOccupationsForEducation(
  education: string
): Promise<EducationToOccupationMatch[]> {
  // Check cache
  const cacheKey = `education:${education.toLowerCase()}`;
  if (educationCache.has(cacheKey)) {
    const cached = educationCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[JobEd Connect] Cache HIT for "${education}"`);
      return cached.data;
    } else {
      educationCache.delete(cacheKey);
    }
  }

  console.log(`[JobEd Connect] Cache MISS for "${education}" - fetching from API`);

  try {
    // OBS: API-endpoint kan variera, detta är en gissning baserat på dokumentation
    const url = `${BASE_URL}/related/occupations?education=${encodeURIComponent(education)}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`[JobEd Connect] API error (${response.status})`);
      return getFallbackOccupationsForEducation(education);
    }

    const data = await response.json();
    const matches: EducationToOccupationMatch[] = data.matches || data.occupations || [];

    console.log(`[JobEd Connect] Found ${matches.length} occupation matches for "${education}"`);

    // Cache resultatet
    educationCache.set(cacheKey, { data: matches, timestamp: Date.now() });

    return matches;

  } catch (error) {
    console.error(`[JobEd Connect] Error for "${education}":`, error);
    return getFallbackOccupationsForEducation(education);
  }
}

/**
 * Fallback: Manuell matchning om API failar
 */
function getFallbackOccupationsForEducation(education: string): EducationToOccupationMatch[] {
  const lowerEd = education.toLowerCase();

  // Manuella matchningar för vanliga utbildningar
  const educationMap: Record<string, EducationToOccupationMatch[]> = {
    'vvs': [
      { occupation: 'VVS-montör', ssyk_code: '7126', relevance: 0.95, competencies: ['installation', 'reparation', 'service'] },
      { occupation: 'Rörmokare', ssyk_code: '7126', relevance: 0.90, competencies: ['rörinstallation', 'sanitet'] },
      { occupation: 'Ventilationsmontör', ssyk_code: '7125', relevance: 0.75, competencies: ['ventilation', 'klimat'] }
    ],
    'el': [
      { occupation: 'Elektriker', ssyk_code: '7411', relevance: 0.95, competencies: ['elinstallation', 'felsökning'] },
      { occupation: 'Elmontör', ssyk_code: '7411', relevance: 0.90, competencies: ['elmontage', 'service'] }
    ],
    'bygg': [
      { occupation: 'Snickare', ssyk_code: '7115', relevance: 0.90, competencies: ['byggarbete', 'renovering'] },
      { occupation: 'Byggarbetare', ssyk_code: '7119', relevance: 0.85, competencies: ['byggproduktion'] }
    ],
    'data': [
      { occupation: 'Systemutvecklare', ssyk_code: '2512', relevance: 0.95, competencies: ['programmering', 'systemdesign'] },
      { occupation: 'Webbutvecklare', ssyk_code: '2513', relevance: 0.90, competencies: ['webbutveckling', 'frontend'] }
    ],
    'ekonomi': [
      { occupation: 'Redovisningsekonom', ssyk_code: '3313', relevance: 0.95, competencies: ['redovisning', 'bokföring'] },
      { occupation: 'Controller', ssyk_code: '2411', relevance: 0.85, competencies: ['ekonomistyrning', 'analys'] }
    ],
    'vård': [
      { occupation: 'Sjuksköterska', ssyk_code: '2223', relevance: 0.95, competencies: ['omvårdnad', 'läkemedelshantering'] },
      { occupation: 'Undersköterska', ssyk_code: '5321', relevance: 0.90, competencies: ['patientvård', 'omsorg'] }
    ]
  };

  // Sök efter matchande utbildning
  for (const [key, matches] of Object.entries(educationMap)) {
    if (lowerEd.includes(key)) {
      console.log(`[JobEd Connect] Using fallback matches for "${education}"`);
      return matches;
    }
  }

  console.warn(`[JobEd Connect] No fallback matches found for "${education}"`);
  return [];
}

/**
 * Hitta utbildningar som leder till ett givet yrke
 */
export async function getEducationsForOccupation(
  occupation: string
): Promise<OccupationToEducationMatch[]> {
  try {
    const url = `${BASE_URL}/related/educations?occupation=${encodeURIComponent(occupation)}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.warn(`[JobEd Connect] API error (${response.status})`);
      return [];
    }

    const data = await response.json();
    const matches: OccupationToEducationMatch[] = data.matches || data.educations || [];

    console.log(`[JobEd Connect] Found ${matches.length} education matches for "${occupation}"`);
    return matches;

  } catch (error) {
    console.error(`[JobEd Connect] Error for "${occupation}":`, error);
    return [];
  }
}

/**
 * Expandera CV-data med utbildningsmatchningar
 */
export async function enrichCVWithEducationMatching(cvData: any): Promise<{
  matchedOccupations: EducationToOccupationMatch[];
  additionalSearchTerms: string[];
}> {
  const allMatches: EducationToOccupationMatch[] = [];
  const searchTerms = new Set<string>();

  // Hämta utbildningar från CV
  const educations = cvData.structuredCV?.education || [];

  if (educations.length === 0) {
    console.log('[JobEd Connect] No educations found in CV');
    return { matchedOccupations: [], additionalSearchTerms: [] };
  }

  console.log(`[JobEd Connect] Enriching CV with ${educations.length} educations...`);

  // Processa varje utbildning
  for (const edu of educations) {
    const educationName = edu.degree || edu.institution || '';
    if (!educationName) continue;

    const matches = await getOccupationsForEducation(educationName);
    allMatches.push(...matches);

    // Lägg till yrkestitlar som söktermer
    matches.forEach(match => {
      if (match.relevance >= 0.7) {
        searchTerms.add(match.occupation);
      }
    });
  }

  console.log(`[JobEd Connect] Found ${allMatches.length} total occupation matches from educations`);

  return {
    matchedOccupations: allMatches,
    additionalSearchTerms: Array.from(searchTerms)
  };
}
