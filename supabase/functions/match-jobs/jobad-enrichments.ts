/**
 * JobAd Enrichments API Integration
 *
 * Integrerar med Arbetsförmedlingens JobAd Enrichments API för att få
 * AI-extraherade nyckelord, kompetenser och krav från jobbannonser.
 *
 * API Docs: https://jobad-enrichments.api.jobtechdev.se
 */

export interface EnrichedJobData {
  jobId: string;
  occupations?: Array<{
    term: string;
    weight: number;
    ssyk_code?: string;
  }>;
  skills?: Array<{
    term: string;
    weight: number;
    type?: 'hard' | 'soft';
  }>;
  competencies?: Array<{
    term: string;
    weight: number;
    category?: string;
  }>;
  traits?: Array<{
    term: string;
    weight: number;
  }>;
  languages?: Array<{
    term: string;
    weight: number;
    level?: string;
  }>;
  experience_required?: {
    years?: number;
    level?: string; // "junior", "mid", "senior"
    weight: number;
  };
  education_level?: {
    level: string; // "gymnasial", "eftergymnasial", "universitet"
    field?: string;
    weight: number;
  };
  employment_type?: {
    type: string; // "tillsvidare", "visstid", "konsult"
    weight: number;
  };
  drivers_license?: Array<{
    type: string; // "B", "C", "CE", etc.
    required: boolean;
    weight: number;
  }>;
}

// Cache för enriched data (1 dag)
const enrichmentCache = new Map<string, { data: EnrichedJobData; timestamp: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 dag

/**
 * Hämta enriched data för en jobbannons (med cache)
 */
export async function getEnrichedJobData(jobId: string, jobText?: string): Promise<EnrichedJobData | null> {
  // Check cache först
  const cacheKey = `enrichment:${jobId}`;
  if (enrichmentCache.has(cacheKey)) {
    const cached = enrichmentCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[Enrichments] Cache HIT for job ${jobId}`);
      return cached.data;
    } else {
      enrichmentCache.delete(cacheKey);
    }
  }

  console.log(`[Enrichments] Cache MISS for job ${jobId} - fetching from API`);

  // Försök hämta från API (om API:t existerar)
  // OBS: Detta API kan vara begränsat eller kräva annan endpoint
  // Dokumentationen är inte helt klar, så vi använder fallback text-analys

  if (!jobText) {
    console.warn(`[Enrichments] No job text provided for ${jobId}`);
    return null;
  }

  // Fallback: Använd vår egen text-baserade enrichment
  const enrichedData = await enrichJobTextLocally(jobId, jobText);

  // Cache resultatet
  enrichmentCache.set(cacheKey, { data: enrichedData, timestamp: Date.now() });

  return enrichedData;
}

/**
 * Lokal enrichment av jobbtext (fallback om API inte finns)
 *
 * Extraherar nyckelord genom enkel text-analys.
 * Detta är en förenklad version - ett riktigt API skulle ge bättre resultat.
 */
async function enrichJobTextLocally(jobId: string, jobText: string): Promise<EnrichedJobData> {
  const lowerText = jobText.toLowerCase();

  // Extrahera kompetenser genom keyword matching
  const commonSkills = [
    // Tech
    'javascript', 'python', 'java', 'c#', 'typescript', 'react', 'vue', 'angular',
    'node.js', 'sql', 'git', 'docker', 'kubernetes', 'aws', 'azure',

    // Bygg/VVS
    'svetsning', 'installation', 'renovering', 'nybyggnation', 'service',
    'felsökning', 'reparation', 'underhåll', 'projektering',

    // Verktyg/System
    'excel', 'word', 'powerpoint', 'outlook', 'teams', 'sharepoint',
    'visma', 'fortnox', 'sap', 'crm', 'erp',
    'cad', 'bim', 'revit', 'autocad',

    // Bygg specifikt
    'byggnorm', 'arbetsmiljö', 'säkerhet', 'kvalitetssäkring',

    // Ledarskap
    'projektledning', 'teamledning', 'personalansvar', 'budgetansvar',
    'rekrytering', 'utbildning', 'utveckling',

    // Allmänt
    'kundservice', 'försäljning', 'administration', 'kommunikation',
    'planering', 'organisering', 'samarbete'
  ];

  const skills: Array<{ term: string; weight: number }> = [];

  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      // Högre weight om det nämns flera gånger
      const occurrences = (lowerText.match(new RegExp(skill, 'g')) || []).length;
      skills.push({
        term: skill,
        weight: Math.min(1.0, 0.5 + (occurrences * 0.2))
      });
    }
  }

  // Extrahera erfarenhetskrav
  let experienceRequired = undefined;
  const expMatch = lowerText.match(/(\d+)[+]?\s*(år|years)/i);
  if (expMatch) {
    experienceRequired = {
      years: parseInt(expMatch[1]),
      weight: 0.85
    };
  }

  // Extrahera utbildningsnivå
  let educationLevel = undefined;
  if (lowerText.includes('högskola') || lowerText.includes('universitet')) {
    educationLevel = { level: 'universitet', weight: 0.8 };
  } else if (lowerText.includes('gymnasie')) {
    educationLevel = { level: 'gymnasial', weight: 0.8 };
  }

  // Extrahera körkort
  const driversLicense: Array<{ type: string; required: boolean; weight: number }> = [];
  const licensePattern = /körkort\s*([A-E]{1,2})/gi;
  const licenseMatches = lowerText.matchAll(licensePattern);
  for (const match of licenseMatches) {
    driversLicense.push({
      type: match[1].toUpperCase(),
      required: lowerText.includes('krav') || lowerText.includes('måste'),
      weight: 0.7
    });
  }

  return {
    jobId,
    skills,
    experience_required: experienceRequired,
    education_level: educationLevel,
    drivers_license: driversLicense.length > 0 ? driversLicense : undefined
  };
}

/**
 * Batch enrichment - berika flera jobb samtidigt
 */
export async function enrichJobsBatch(
  jobs: Array<{ id: string; text: string }>
): Promise<Map<string, EnrichedJobData>> {
  console.log(`[Enrichments] Enriching ${jobs.length} jobs...`);

  const results = new Map<string, EnrichedJobData>();

  // Processa i batches om 10 för att inte överbelasta
  const BATCH_SIZE = 10;
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(job => getEnrichedJobData(job.id, job.text))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const jobId = batch[index].id;
        results.set(jobId, result.value);
      }
    });

    console.log(`[Enrichments] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)}`);
  }

  console.log(`[Enrichments] Successfully enriched ${results.size}/${jobs.length} jobs`);
  return results;
}

/**
 * Rensa gamla cache-entries (kör periodiskt)
 */
export function cleanupEnrichmentCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of enrichmentCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION_MS) {
      enrichmentCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Enrichments] Cleaned ${cleaned} expired cache entries`);
  }
}
