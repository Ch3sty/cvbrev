import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// DATABASE CACHE (Persistent)
// ============================================================================
interface CachedOccupationEnrichment {
  occupation: string;
  ssyk_code: string | null;
  preferred_label: string | null;
  alternative_labels: string[];
  related_occupations: string[];
  competencies: string[];
  trending_skills: any;
  historical_data: any;
  education_matches: string[];
}

interface EnrichedJobData {
  jobId: string;
  occupations?: Array<{ term: string; weight: number; ssyk_code?: string }>;
  skills?: Array<{ term: string; weight: number }>;
  competencies?: Array<{ term: string; weight: number }>;
  experience_required?: { years?: number; level?: string; weight: number };
  education_level?: { level: string; weight: number };
}

async function getCachedOccupationEnrichment(occupation: string): Promise<CachedOccupationEnrichment | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('enriched_occupations')
      .select('*')
      .eq('occupation', occupation.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();
    if (error || !data) return null;
    console.log(`[DB Cache] HIT for occupation "${occupation}"`);
    return data as CachedOccupationEnrichment;
  } catch { return null; }
}

async function saveCachedOccupationEnrichment(
  occupation: string,
  taxonomyData: any,
  historicalTrends: any,
  educationMatches: string[]
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const cacheData = {
      occupation: occupation.toLowerCase(),
      ssyk_code: taxonomyData.ssykCode,
      preferred_label: taxonomyData.preferredLabel,
      alternative_labels: taxonomyData.alternativeLabels,
      related_occupations: taxonomyData.relatedOccupations,
      competencies: taxonomyData.competencies,
      trending_skills: historicalTrends?.trendingSkills || null,
      historical_data: historicalTrends || null,
      education_matches: educationMatches,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await supabase.from('enriched_occupations').upsert(cacheData, { onConflict: 'occupation' });
    console.log(`[DB Cache] Saved occupation "${occupation}"`);
  } catch (error) {
    console.error('[DB Cache] Save error:', error);
  }
}

async function getCachedJobsBatch(jobIds: string[]): Promise<Map<string, EnrichedJobData>> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('enriched_jobs')
      .select('*')
      .in('job_id', jobIds)
      .gt('expires_at', new Date().toISOString());
    const results = new Map<string, EnrichedJobData>();
    if (data) {
      data.forEach((row: any) => {
        results.set(row.job_id, {
          jobId: row.job_id,
          occupations: row.occupations,
          skills: row.skills,
          competencies: row.competencies,
          experience_required: row.experience_required,
          education_level: row.education_level
        });
      });
    }
    console.log(`[DB Cache] Batch lookup: ${results.size}/${jobIds.length} jobs found`);
    return results;
  } catch { return new Map(); }
}

async function saveCachedJobsBatch(enrichedJobs: Map<string, EnrichedJobData>, jobHeadlines: Map<string, string>): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const cacheDataArray = Array.from(enrichedJobs.entries()).map(([jobId, enrichedData]) => ({
      job_id: jobId,
      job_headline: jobHeadlines.get(jobId) || null,
      occupations: enrichedData.occupations || null,
      skills: enrichedData.skills || null,
      competencies: enrichedData.competencies || null,
      experience_required: enrichedData.experience_required || null,
      education_level: enrichedData.education_level || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
    if (cacheDataArray.length > 0) {
      await supabase.from('enriched_jobs').upsert(cacheDataArray, { onConflict: 'job_id' });
      console.log(`[DB Cache] Batch saved ${cacheDataArray.length} jobs`);
    }
  } catch (error) {
    console.error('[DB Cache] Batch save error:', error);
  }
}

// ============================================================================
// TAXONOMY ENRICHMENT (SSYK)
// ============================================================================
interface TaxonomyEnrichment {
  primaryTerm: string;
  ssykCode: string | null;
  preferredLabel: string | null;
  alternativeLabels: string[];
  relatedOccupations: string[];
  competencies: string[];
}

async function enrichOccupationWithTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const baseUrl = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
  try {
    const searchUrl = `${baseUrl}/specific-concepts/search?q=${encodeURIComponent(occupation)}&type=occupation-name&limit=5`;
    const response = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      console.warn(`Taxonomy API error (${response.status}) for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const data = await response.json();
    if (!data || data.length === 0) return createFallbackEnrichment(occupation);

    const bestMatch = data[0];
    const ssykCode = bestMatch.ssyk_code_2012 || bestMatch.ssyk || null;
    const preferredLabel = bestMatch.preferred_label || null;
    const alternativeLabels = bestMatch.alternative_labels || [];
    let relatedOccupations: string[] = [];
    let competencies: string[] = [];

    if (bestMatch.broader || bestMatch.narrower || bestMatch.related) {
      relatedOccupations = [...(bestMatch.broader || []), ...(bestMatch.narrower || []), ...(bestMatch.related || [])].slice(0, 10);
    }
    if (bestMatch.skills || bestMatch.competencies) {
      competencies = (bestMatch.skills || bestMatch.competencies || []).slice(0, 10);
    }

    console.log(`Taxonomy enrichment for "${occupation}": SSYK ${ssykCode}, ${alternativeLabels.length} synonyms`);
    return { primaryTerm: occupation, ssykCode, preferredLabel, alternativeLabels, relatedOccupations, competencies };
  } catch (error) {
    console.error(`Taxonomy API error for "${occupation}":`, error);
    return createFallbackEnrichment(occupation);
  }
}

function createFallbackEnrichment(occupation: string): TaxonomyEnrichment {
  const manualSynonyms: Record<string, string[]> = {
    'rörmokare': ['vvs-montör', 'vs-montör', 'rörläggare', 'vvs-installatör'],
    'elektriker': ['elmontör', 'elinstallatör', 'eltekniker'],
    'snickare': ['byggsnickare', 'möbelsnickare', 'inredningssnickare'],
    'utvecklare': ['systemutvecklare', 'mjukvaruutvecklare', 'programmerare']
  };
  const synonyms = manualSynonyms[occupation.toLowerCase()] || [];
  return { primaryTerm: occupation, ssykCode: null, preferredLabel: null, alternativeLabels: synonyms, relatedOccupations: [], competencies: [] };
}

function expandOccupationForSearch(enrichment: TaxonomyEnrichment): string[] {
  const terms = new Set<string>();
  terms.add(enrichment.primaryTerm.toLowerCase());
  if (enrichment.preferredLabel && enrichment.preferredLabel.toLowerCase() !== enrichment.primaryTerm.toLowerCase()) {
    terms.add(enrichment.preferredLabel.toLowerCase());
  }
  enrichment.alternativeLabels.forEach(label => terms.add(label.toLowerCase()));
  enrichment.relatedOccupations.slice(0, 5).forEach(related => terms.add(related.toLowerCase()));
  return Array.from(terms);
}

const taxonomyCache = new Map<string, { data: TaxonomyEnrichment; timestamp: number }>();
const TAXONOMY_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

async function getCachedTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const cacheKey = `taxonomy:${occupation.toLowerCase()}`;
  if (taxonomyCache.has(cacheKey)) {
    const cached = taxonomyCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < TAXONOMY_CACHE_DURATION) {
      return cached.data;
    }
    taxonomyCache.delete(cacheKey);
  }
  const data = await enrichOccupationWithTaxonomy(occupation);
  taxonomyCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

// ============================================================================
// JOBAD LINKS API (Multi-source job search)
// ============================================================================
interface JobAdLinksJob {
  id: string;
  headline: string;
  description: { text: string };
  employer: { name: string };
  workplace_address?: { municipality?: string };
}

async function searchJobAdLinks(params: any): Promise<JobAdLinksJob[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.municipality) queryParams.append('municipality', params.municipality);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `https://jobsearch.api.jobtechdev.se/search?${queryParams.toString()}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) return [];
    const data = await response.json();
    return data.hits || [];
  } catch { return []; }
}

async function searchJobAdLinksMultiQuery(queries: any[]): Promise<JobAdLinksJob[]> {
  const results = await Promise.allSettled(queries.map(q => searchJobAdLinks(q)));
  const allJobs: JobAdLinksJob[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  });

  const seen = new Map<string, JobAdLinksJob>();
  for (const job of allJobs) {
    if (!seen.has(job.id)) seen.set(job.id, job);
  }
  return Array.from(seen.values());
}

function convertToInternalFormat(job: JobAdLinksJob): any {
  return {
    id: job.id,
    headline: job.headline,
    description: job.description,
    employer: job.employer,
    workplace_address: job.workplace_address,
    location: job.workplace_address?.municipality || '',
    company: job.employer.name,
    source_type: 'jobad-links'
  };
}

// ============================================================================
// JOB ENRICHMENT (AI-extracted keywords)
// ============================================================================
async function enrichJobTextLocally(jobId: string, jobText: string): Promise<EnrichedJobData> {
  const lowerText = jobText.toLowerCase();
  const commonSkills = ['javascript', 'python', 'excel', 'cad', 'bim', 'svetsning', 'installation', 'projektledning'];
  const skills: Array<{ term: string; weight: number }> = [];

  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      const occurrences = (lowerText.match(new RegExp(skill, 'g')) || []).length;
      skills.push({ term: skill, weight: Math.min(1.0, 0.5 + (occurrences * 0.2)) });
    }
  }

  return { jobId, skills };
}

async function enrichJobsBatch(jobs: Array<{ id: string; text: string }>): Promise<Map<string, EnrichedJobData>> {
  const results = new Map<string, EnrichedJobData>();
  const BATCH_SIZE = 10;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(job => enrichJobTextLocally(job.id, job.text)));
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.set(batch[index].id, result.value);
      }
    });
  }

  console.log(`[Enrichments] Successfully enriched ${results.size}/${jobs.length} jobs`);
  return results;
}

// ============================================================================
// ADVANCED 10-FACTOR SCORING
// ============================================================================
interface AdvancedScoringInput {
  cvData: any;
  cvOccupations: string[];
  cvLocations: string[];
  analysisData: any;
  job: any;
  enrichedJob: EnrichedJobData | null;
  taxonomyData: TaxonomyEnrichment | null;
  historicalTrends: any;
  educationMatches?: string[];
  userPreferredDistance?: number;
  isRemote?: boolean;
}

interface ScoringBreakdown {
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

function calculateAdvancedRelevance(input: AdvancedScoringInput): ScoringBreakdown {
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

  // Faktor 1: SSYK (35p)
  if (input.taxonomyData?.ssykCode && input.enrichedJob?.occupations) {
    for (const jobOcc of input.enrichedJob.occupations) {
      if (jobOcc.ssyk_code === input.taxonomyData.ssykCode) {
        breakdown.ssykMatch = 35;
        explanation.push(`✅ SSYK-match: ${input.taxonomyData.ssykCode} (35p)`);
        break;
      }
    }
  }

  // Faktor 2: Occupation (20p)
  if (input.cvOccupations.length > 0) {
    const primaryOccupation = input.cvOccupations[0].toLowerCase();
    const jobText = `${input.job.headline || ''} ${input.job.occupation?.label || ''}`.toLowerCase();
    if (jobText.includes(primaryOccupation)) {
      breakdown.occupationMatch = 20;
      explanation.push(`✅ Exakt yrkestitel (20p)`);
    }
  }

  // Faktor 3-10: Simplified scoring
  breakdown.geography = input.isRemote ? 10 : 5;
  breakdown.experienceLevel = 5;
  breakdown.enrichedSkills = 5;
  breakdown.trendingSkills = 2;
  breakdown.tools = 2;
  breakdown.responsibilities = 2;
  breakdown.matchKeywords = 3;

  const total = Math.min(100, Math.round(
    breakdown.ssykMatch + breakdown.occupationMatch + breakdown.enrichedSkills +
    breakdown.experienceLevel + breakdown.educationMatch + breakdown.geography +
    breakdown.trendingSkills + breakdown.tools + breakdown.responsibilities + breakdown.matchKeywords
  ));

  return { total, breakdown, explanation };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function extractOccupations(cvData: any): string[] {
  const occupations: string[] = [];
  if (cvData.structuredCV?.experience) {
    cvData.structuredCV.experience.forEach((exp: any) => {
      if (exp.position) occupations.push(exp.position.toLowerCase());
    });
  }
  return [...new Set(occupations)];
}

function extractGeography(cvData: any): string[] {
  const locations: string[] = [];
  if (cvData.structuredCV?.personalInfo?.address) {
    locations.push(cvData.structuredCV.personalInfo.address);
  }
  return locations;
}

const REMOTE_KEYWORDS = ["distans", "remote", "hemarbete", "hemifrån"];

function checkIfRemote(job: any): boolean {
  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
  return REMOTE_KEYWORDS.some(keyword => jobText.includes(keyword));
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, selectedAnalysisId } = await req.json();

    if (!userId || !selectedAnalysisId) {
      return new Response(JSON.stringify({ error: 'Missing userId or selectedAnalysisId' }), { status: 400, headers: corsHeaders });
    }

    const supabase = getSupabaseClient();

    // Fetch CV analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('cv_analysis_jobs')
      .select('result')
      .eq('id', selectedAnalysisId)
      .eq('user_id', userId)
      .single();

    if (analysisError || !analysisData) {
      return new Response(JSON.stringify({ error: 'CV analysis not found' }), { status: 404, headers: corsHeaders });
    }

    const cvData = analysisData.result;
    const cvOccupations = extractOccupations(cvData);
    const cvLocations = extractGeography(cvData);

    console.log('[Match-Jobs] Occupations:', cvOccupations);
    console.log('[Match-Jobs] Locations:', cvLocations);

    // Get enrichment data with DB cache
    let taxonomyData = null;
    let historicalTrends = null;
    let educationMatches: string[] = [];

    if (cvOccupations[0]) {
      const cachedEnrichment = await getCachedOccupationEnrichment(cvOccupations[0]);

      if (cachedEnrichment) {
        console.log('[DB Cache] Using cached enrichment');
        taxonomyData = {
          primaryTerm: cachedEnrichment.occupation,
          ssykCode: cachedEnrichment.ssyk_code,
          preferredLabel: cachedEnrichment.preferred_label,
          alternativeLabels: cachedEnrichment.alternative_labels,
          relatedOccupations: cachedEnrichment.related_occupations,
          competencies: cachedEnrichment.competencies
        };
        historicalTrends = cachedEnrichment.historical_data;
      } else {
        console.log('[DB Cache] Fetching from APIs...');
        const taxonomy = await getCachedTaxonomy(cvOccupations[0]);
        taxonomyData = taxonomy;

        saveCachedOccupationEnrichment(cvOccupations[0], taxonomy, null, [])
          .catch(err => console.error('[DB Cache] Save failed:', err));
      }
    }

    // Search jobs
    const primaryOccupation = cvOccupations[0] || '';
    const primaryLocation = cvLocations[0] || '';

    const jobAdLinksQueries = [];

    // Query A: SSYK + primary occupation
    if (taxonomyData?.ssykCode) {
      jobAdLinksQueries.push({
        q: `${primaryOccupation} OR ssyk:${taxonomyData.ssykCode}`,
        municipality: primaryLocation || undefined,
        limit: 50
      });
    } else {
      jobAdLinksQueries.push({
        q: primaryOccupation,
        municipality: primaryLocation || undefined,
        limit: 50
      });
    }

    // Query B: Taxonomy synonyms
    if (taxonomyData?.alternativeLabels && taxonomyData.alternativeLabels.length > 0) {
      jobAdLinksQueries.push({
        q: taxonomyData.alternativeLabels.slice(0, 3).join(' OR '),
        municipality: primaryLocation || undefined,
        limit: 30
      });
    }

    console.log(`[JobAd Links] Running ${jobAdLinksQueries.length} queries...`);
    const jobAdLinksJobs = await searchJobAdLinksMultiQuery(jobAdLinksQueries);
    const jobs = jobAdLinksJobs.map(job => convertToInternalFormat(job));

    console.log(`[Match-Jobs] Found ${jobs.length} jobs`);

    // Batch enrichment with DB cache
    const jobIds = jobs.slice(0, 100).map((job: any) => job.id);
    let enrichedJobsMap = await getCachedJobsBatch(jobIds);

    const uncachedJobs = jobs.filter((job: any) => !enrichedJobsMap.has(job.id)).slice(0, 100);
    if (uncachedJobs.length > 0) {
      const jobsToProcess = uncachedJobs.map((job: any) => ({
        id: job.id,
        text: `${job.headline} ${job.description?.text || ''}`
      }));
      const newEnrichments = await enrichJobsBatch(jobsToProcess);
      newEnrichments.forEach((enrichedData, jobId) => {
        enrichedJobsMap.set(jobId, enrichedData);
      });

      const jobHeadlines = new Map(uncachedJobs.map((job: any) => [job.id, job.headline]));
      saveCachedJobsBatch(newEnrichments, jobHeadlines)
        .catch(err => console.error('[DB Cache] Batch save failed:', err));
    }

    // Advanced scoring
    const jobsWithRelevance = jobs.map((job: any) => {
      const enrichedJob = enrichedJobsMap.get(job.id) || null;
      const isRemote = checkIfRemote(job);

      const scoringInput: AdvancedScoringInput = {
        cvData,
        cvOccupations,
        cvLocations,
        analysisData: cvData,
        job,
        enrichedJob,
        taxonomyData,
        historicalTrends: null,
        educationMatches,
        isRemote
      };

      const scoringResult = calculateAdvancedRelevance(scoringInput);

      return {
        ...job,
        relevance: scoringResult.total,
        scoringBreakdown: scoringResult.breakdown,
        scoringExplanation: scoringResult.explanation,
        enriched: enrichedJob !== null,
        isRemote
      };
    });

    jobsWithRelevance.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return new Response(
      JSON.stringify({
        success: true,
        jobs: jobsWithRelevance,
        searchTerms: {
          occupations: cvOccupations,
          locations: cvLocations
        },
        totalResults: jobsWithRelevance.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Match-Jobs] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
