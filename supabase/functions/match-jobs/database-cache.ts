/**
 * Database Cache Manager
 *
 * Persistent cache i Supabase för enrichment-data.
 * Snabbare än API-anrop och mer skalbart än in-memory cache.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import type { TaxonomyEnrichment } from './taxonomy-enrichment.ts';
import type { EnrichedJobData } from './jobad-enrichments.ts';
import type { HistoricalTrends } from './historical-analysis.ts';

/**
 * Hämta eller skapa Supabase-klient
 */
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// OCCUPATION ENRICHMENT CACHE
// ============================================================================

export interface CachedOccupationEnrichment {
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

/**
 * Hämta enriched occupation från databas-cache
 */
export async function getCachedOccupationEnrichment(
  occupation: string
): Promise<CachedOccupationEnrichment | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('enriched_occupations')
      .select('*')
      .eq('occupation', occupation.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.log(`[DB Cache] MISS for occupation "${occupation}"`);
      return null;
    }

    console.log(`[DB Cache] HIT for occupation "${occupation}"`);
    return data as CachedOccupationEnrichment;

  } catch (error) {
    console.error(`[DB Cache] Error fetching occupation "${occupation}":`, error);
    return null;
  }
}

/**
 * Spara enriched occupation till databas-cache
 */
export async function saveCachedOccupationEnrichment(
  occupation: string,
  taxonomyData: TaxonomyEnrichment,
  historicalTrends: HistoricalTrends | null,
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
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dagar
    };

    // Upsert (insert or update)
    const { error } = await supabase
      .from('enriched_occupations')
      .upsert(cacheData, {
        onConflict: 'occupation'
      });

    if (error) {
      console.error(`[DB Cache] Error saving occupation "${occupation}":`, error);
    } else {
      console.log(`[DB Cache] Saved occupation "${occupation}"`);
    }

  } catch (error) {
    console.error(`[DB Cache] Error in saveCachedOccupationEnrichment:`, error);
  }
}

// ============================================================================
// JOB ENRICHMENT CACHE
// ============================================================================

/**
 * Hämta enriched job från databas-cache
 */
export async function getCachedJobEnrichment(
  jobId: string
): Promise<EnrichedJobData | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('enriched_jobs')
      .select('*')
      .eq('job_id', jobId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Konvertera tillbaka till EnrichedJobData format
    const enrichedData: EnrichedJobData = {
      jobId: data.job_id,
      occupations: data.occupations,
      skills: data.skills,
      competencies: data.competencies,
      experience_required: data.experience_required,
      education_level: data.education_level,
      employment_type: data.employment_type,
      drivers_license: data.drivers_license
    };

    return enrichedData;

  } catch (error) {
    console.error(`[DB Cache] Error fetching job "${jobId}":`, error);
    return null;
  }
}

/**
 * Spara enriched job till databas-cache
 */
export async function saveCachedJobEnrichment(
  enrichedData: EnrichedJobData,
  jobHeadline?: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const cacheData = {
      job_id: enrichedData.jobId,
      job_headline: jobHeadline || null,
      occupations: enrichedData.occupations || null,
      skills: enrichedData.skills || null,
      competencies: enrichedData.competencies || null,
      experience_required: enrichedData.experience_required || null,
      education_level: enrichedData.education_level || null,
      employment_type: enrichedData.employment_type || null,
      drivers_license: enrichedData.drivers_license || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 dag
    };

    // Upsert (insert or update)
    const { error } = await supabase
      .from('enriched_jobs')
      .upsert(cacheData, {
        onConflict: 'job_id'
      });

    if (error) {
      console.error(`[DB Cache] Error saving job "${enrichedData.jobId}":`, error);
    }

  } catch (error) {
    console.error(`[DB Cache] Error in saveCachedJobEnrichment:`, error);
  }
}

/**
 * Batch-spara enriched jobs
 */
export async function saveCachedJobsBatch(
  enrichedJobs: Map<string, EnrichedJobData>,
  jobHeadlines: Map<string, string>
): Promise<void> {
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
      employment_type: enrichedData.employment_type || null,
      drivers_license: enrichedData.drivers_license || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));

    if (cacheDataArray.length === 0) return;

    // Batch upsert
    const { error } = await supabase
      .from('enriched_jobs')
      .upsert(cacheDataArray, {
        onConflict: 'job_id'
      });

    if (error) {
      console.error(`[DB Cache] Error batch saving jobs:`, error);
    } else {
      console.log(`[DB Cache] Batch saved ${cacheDataArray.length} enriched jobs`);
    }

  } catch (error) {
    console.error(`[DB Cache] Error in saveCachedJobsBatch:`, error);
  }
}

// ============================================================================
// BATCH LOOKUP FÖR JOBB
// ============================================================================

/**
 * Batch-hämta enriched jobs från databas
 */
export async function getCachedJobsBatch(
  jobIds: string[]
): Promise<Map<string, EnrichedJobData>> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('enriched_jobs')
      .select('*')
      .in('job_id', jobIds)
      .gt('expires_at', new Date().toISOString());

    const results = new Map<string, EnrichedJobData>();

    if (error || !data) {
      console.warn(`[DB Cache] Batch lookup failed for ${jobIds.length} jobs`);
      return results;
    }

    data.forEach((row: any) => {
      const enrichedData: EnrichedJobData = {
        jobId: row.job_id,
        occupations: row.occupations,
        skills: row.skills,
        competencies: row.competencies,
        experience_required: row.experience_required,
        education_level: row.education_level,
        employment_type: row.employment_type,
        drivers_license: row.drivers_license
      };
      results.set(row.job_id, enrichedData);
    });

    console.log(`[DB Cache] Batch lookup: ${results.size}/${jobIds.length} jobs found in cache`);
    return results;

  } catch (error) {
    console.error(`[DB Cache] Error in getCachedJobsBatch:`, error);
    return new Map();
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Rensa expired cache-entries
 */
export async function cleanupExpiredCache(): Promise<{ occupations: number; jobs: number }> {
  try {
    const supabase = getSupabaseClient();

    // Anropa cleanup-funktionen
    const { error } = await supabase.rpc('cleanup_expired_enrichments');

    if (error) {
      console.error('[DB Cache] Cleanup failed:', error);
      return { occupations: 0, jobs: 0 };
    }

    console.log('[DB Cache] Cleanup completed');
    return { occupations: 0, jobs: 0 }; // RPC returnerar inte count

  } catch (error) {
    console.error('[DB Cache] Error in cleanupExpiredCache:', error);
    return { occupations: 0, jobs: 0 };
  }
}
