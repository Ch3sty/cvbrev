/**
 * Background Enrichment Jobs
 *
 * Pre-enrich populära yrken i databas-cache för snabbare jobbmatchning.
 * Körs periodiskt eller on-demand.
 */

import { getCachedTaxonomy } from './taxonomy-enrichment.ts';
import { getHistoricalTrends } from './historical-analysis.ts';
import { getOccupationsForEducation } from './jobed-connect.ts';
import { saveCachedOccupationEnrichment, getCachedOccupationEnrichment } from './database-cache.ts';

/**
 * Lista över populära yrken att pre-enricha
 * Baserat på vanligaste sökningar i Sverige
 */
export const POPULAR_OCCUPATIONS = [
  // Bygg & Hantverk
  'VVS-montör',
  'Elektriker',
  'Snickare',
  'Målare',
  'Murare',
  'Plåtslagare',
  'Ventilationsmontör',
  'Rörmokare',
  'Byggarbetare',
  'Anläggningsarbetare',

  // IT & Tech
  'Systemutvecklare',
  'Mjukvaruutvecklare',
  'Frontend-utvecklare',
  'Backend-utvecklare',
  'Fullstack-utvecklare',
  'DevOps-ingenjör',
  'IT-tekniker',
  'Nätverkstekniker',
  'Systemadministratör',
  'Webbutvecklare',

  // Vård & Omsorg
  'Sjuksköterska',
  'Undersköterska',
  'Läkare',
  'Sjukgymnast',
  'Fysioterapeut',
  'Biomedicinsk analytiker',
  'Vårdbiträde',
  'Specialistsjuksköterska',

  // Utbildning
  'Lärare',
  'Förskollärare',
  'Grundskollärare',
  'Gymnasielärare',
  'Universitetslektor',
  'Lärare i svenska som andraspråk',

  // Ekonomi & Administration
  'Redovisningsekonom',
  'Controller',
  'Ekonomiassistent',
  'Administratör',
  'HR-specialist',
  'Löneadministratör',
  'Ekonomichef',

  // Försäljning & Service
  'Säljare',
  'Butikssäljare',
  'Försäljningschef',
  'Kundtjänstmedarbetare',
  'Servicetekniker',
  'Fastighetsskötare',

  // Transport & Logistik
  'Lastbilschaufför',
  'Lagerarbetare',
  'Bussförare',
  'Logistiker',
  'Distributionschef',

  // Ingenjörer
  'Civilingenjör',
  'Maskiningenjör',
  'Elektroingenjör',
  'Mjukvaruingenjör',
  'Byggnadsingenjör',

  // Övrigt
  'Projektledare',
  'Kock',
  'Restaurangbiträde',
  'Städare',
  'Receptionist'
];

/**
 * Pre-enricha ett enda yrke
 */
export async function preEnrichOccupation(occupation: string): Promise<boolean> {
  try {
    console.log(`[Pre-Enrich] Starting enrichment for "${occupation}"...`);

    // Kolla om redan finns i cache och är giltig
    const cached = await getCachedOccupationEnrichment(occupation);
    if (cached) {
      console.log(`[Pre-Enrich] "${occupation}" already cached, skipping`);
      return true;
    }

    // Hämta enrichment-data från alla API:er
    const [taxonomyData, historicalTrends] = await Promise.all([
      getCachedTaxonomy(occupation),
      getHistoricalTrends(occupation)
    ]);

    // Försök hämta utbildningsmatchningar (om relevant)
    // För nu: tom array, kan expanderas senare
    const educationMatches: string[] = [];

    // Spara till databas-cache
    await saveCachedOccupationEnrichment(
      occupation,
      taxonomyData,
      historicalTrends,
      educationMatches
    );

    console.log(`[Pre-Enrich] ✅ Successfully enriched "${occupation}"`);
    return true;

  } catch (error) {
    console.error(`[Pre-Enrich] ❌ Error enriching "${occupation}":`, error);
    return false;
  }
}

/**
 * Pre-enricha alla populära yrken
 */
export async function preEnrichAllPopularOccupations(
  batchSize: number = 5
): Promise<{ success: number; failed: number; skipped: number }> {
  console.log(`[Pre-Enrich] Starting batch enrichment of ${POPULAR_OCCUPATIONS.length} popular occupations...`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Processa i batches för att inte överbelasta API:erna
  for (let i = 0; i < POPULAR_OCCUPATIONS.length; i += batchSize) {
    const batch = POPULAR_OCCUPATIONS.slice(i, i + batchSize);

    console.log(`[Pre-Enrich] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(POPULAR_OCCUPATIONS.length / batchSize)}...`);

    const results = await Promise.allSettled(
      batch.map(occupation => preEnrichOccupation(occupation))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value) {
          success++;
        } else {
          skipped++;
        }
      } else {
        failed++;
        console.error(`[Pre-Enrich] Failed: ${batch[index]}`);
      }
    });

    // Vänta lite mellan batches för rate limiting
    if (i + batchSize < POPULAR_OCCUPATIONS.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
    }
  }

  console.log(`[Pre-Enrich] Batch enrichment complete: ${success} success, ${failed} failed, ${skipped} skipped`);

  return { success, failed, skipped };
}

/**
 * Pre-enricha baserat på användarnas CV:n (dynamisk lista)
 */
export async function preEnrichFromUserCVs(
  supabaseClient: any,
  limit: number = 50
): Promise<{ success: number; failed: number }> {
  try {
    console.log(`[Pre-Enrich] Fetching top ${limit} occupations from user CVs...`);

    // Hämta mest populära yrken från cv_analysis_jobs
    const { data, error } = await supabaseClient
      .from('cv_analysis_jobs')
      .select('result')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      console.error('[Pre-Enrich] Error fetching user CVs:', error);
      return { success: 0, failed: 0 };
    }

    // Extrahera yrken från CV:n
    const occupationCounts = new Map<string, number>();

    data.forEach((job: any) => {
      const result = job.result;
      if (!result || !result.parsedRoles) return;

      result.parsedRoles.forEach((role: any) => {
        const title = role.title?.toLowerCase();
        if (title) {
          occupationCounts.set(title, (occupationCounts.get(title) || 0) + 1);
        }
      });
    });

    // Sortera efter popularitet
    const topOccupations = Array.from(occupationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([occupation]) => occupation);

    console.log(`[Pre-Enrich] Found ${topOccupations.length} unique occupations from user CVs`);

    // Pre-enricha dessa yrken
    let success = 0;
    let failed = 0;

    for (const occupation of topOccupations) {
      const result = await preEnrichOccupation(occupation);
      if (result) {
        success++;
      } else {
        failed++;
      }

      // Small delay för rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Pre-Enrich] User CV enrichment complete: ${success} success, ${failed} failed`);
    return { success, failed };

  } catch (error) {
    console.error('[Pre-Enrich] Error in preEnrichFromUserCVs:', error);
    return { success: 0, failed: 0 };
  }
}

/**
 * Scheduled cleanup + re-enrichment
 * Körs dagligen för att hålla cache färsk
 */
export async function scheduledMaintenance(supabaseClient: any): Promise<void> {
  console.log('[Pre-Enrich] Starting scheduled maintenance...');

  // Steg 1: Cleanup expired cache
  const { error: cleanupError } = await supabaseClient.rpc('cleanup_expired_enrichments');
  if (cleanupError) {
    console.error('[Pre-Enrich] Cleanup failed:', cleanupError);
  } else {
    console.log('[Pre-Enrich] ✅ Cleanup completed');
  }

  // Steg 2: Pre-enricha populära yrken
  await preEnrichAllPopularOccupations(5);

  // Steg 3: Pre-enricha från användares CV:n
  await preEnrichFromUserCVs(supabaseClient, 30);

  console.log('[Pre-Enrich] ✅ Scheduled maintenance complete');
}
