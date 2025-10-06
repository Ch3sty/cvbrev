// ============================================================================
// PRE-ENRICH-OCCUPATIONS SINGLE-FILE VERSION
// Background job för att pre-enricha populära yrken
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

// Populära yrken att pre-enricha
const POPULAR_OCCUPATIONS = [
  'VVS-montör', 'Elektriker', 'Snickare', 'Målare', 'Murare',
  'Systemutvecklare', 'Mjukvaruutvecklare', 'Frontend-utvecklare',
  'Sjuksköterska', 'Undersköterska', 'Läkare',
  'Lärare', 'Förskollärare', 'Grundskollärare',
  'Redovisningsekonom', 'Controller', 'Ekonomiassistent',
  'Säljare', 'Butikssäljare', 'Kundtjänstmedarbetare'
];

// Simplified taxonomy enrichment
async function enrichOccupation(occupation: string): Promise<any> {
  try {
    const baseUrl = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
    const searchUrl = `${baseUrl}/specific-concepts/search?q=${encodeURIComponent(occupation)}&type=occupation-name&limit=5`;
    const response = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;

    const bestMatch = data[0];
    return {
      occupation: occupation.toLowerCase(),
      ssyk_code: bestMatch.ssyk_code_2012 || bestMatch.ssyk || null,
      preferred_label: bestMatch.preferred_label || null,
      alternative_labels: bestMatch.alternative_labels || [],
      related_occupations: bestMatch.related || [],
      competencies: bestMatch.skills || [],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch {
    return null;
  }
}

async function preEnrichOccupation(occupation: string, supabase: any): Promise<boolean> {
  try {
    // Check if already cached
    const { data: cached } = await supabase
      .from('enriched_occupations')
      .select('occupation')
      .eq('occupation', occupation.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      console.log(`[Pre-Enrich] "${occupation}" already cached, skipping`);
      return true;
    }

    // Enrich and save
    const enrichedData = await enrichOccupation(occupation);
    if (!enrichedData) return false;

    await supabase.from('enriched_occupations').upsert(enrichedData, { onConflict: 'occupation' });
    console.log(`[Pre-Enrich] ✅ Successfully enriched "${occupation}"`);
    return true;
  } catch (error) {
    console.error(`[Pre-Enrich] ❌ Error enriching "${occupation}":`, error);
    return false;
  }
}

async function preEnrichAllPopular(supabase: any, batchSize: number = 5): Promise<any> {
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < POPULAR_OCCUPATIONS.length; i += batchSize) {
    const batch = POPULAR_OCCUPATIONS.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(occ => preEnrichOccupation(occ, supabase)));

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value) success++;
        else skipped++;
      } else {
        failed++;
      }
    });

    if (i + batchSize < POPULAR_OCCUPATIONS.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return { success, failed, skipped };
}

async function preEnrichFromUserCVs(supabase: any, limit: number = 50): Promise<any> {
  try {
    const { data } = await supabase
      .from('cv_analysis_jobs')
      .select('result')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data) return { success: 0, failed: 0 };

    const occupationCounts = new Map<string, number>();
    data.forEach((job: any) => {
      const result = job.result;
      if (result?.parsedRoles) {
        result.parsedRoles.forEach((role: any) => {
          const title = role.title?.toLowerCase();
          if (title) occupationCounts.set(title, (occupationCounts.get(title) || 0) + 1);
        });
      }
    });

    const topOccupations = Array.from(occupationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([occ]) => occ);

    let success = 0;
    let failed = 0;

    for (const occupation of topOccupations) {
      const result = await preEnrichOccupation(occupation, supabase);
      if (result) success++;
      else failed++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { success, failed };
  } catch {
    return { success: 0, failed: 0 };
  }
}

async function scheduledMaintenance(supabase: any): Promise<void> {
  console.log('[Pre-Enrich] Starting scheduled maintenance...');

  // Cleanup
  await supabase.rpc('cleanup_expired_enrichments').catch(() => {});

  // Pre-enrich popular
  await preEnrichAllPopular(supabase, 5);

  // Pre-enrich from user CVs
  await preEnrichFromUserCVs(supabase, 30);

  console.log('[Pre-Enrich] ✅ Scheduled maintenance complete');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { mode = 'all', batchSize = 5, limit = 50 } = await req.json();

    console.log(`[Pre-Enrich] Starting with mode: ${mode}`);

    let result: any = {};

    switch (mode) {
      case 'all':
        console.log(`[Pre-Enrich] Mode: ALL - Enriching ${POPULAR_OCCUPATIONS.length} popular occupations...`);
        result = await preEnrichAllPopular(supabase, batchSize);
        break;

      case 'user-cvs':
        console.log(`[Pre-Enrich] Mode: USER-CVS - Enriching top ${limit} occupations from user data...`);
        result = await preEnrichFromUserCVs(supabase, limit);
        break;

      case 'maintenance':
        console.log('[Pre-Enrich] Mode: MAINTENANCE - Running scheduled maintenance...');
        await scheduledMaintenance(supabase);
        result = { message: 'Maintenance completed successfully' };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid mode. Use "all", "user-cvs", or "maintenance"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`[Pre-Enrich] ✅ Completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        result,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Pre-Enrich] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
