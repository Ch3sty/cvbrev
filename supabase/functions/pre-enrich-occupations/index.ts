import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Import från match-jobs directory (shared modules)
import {
  preEnrichAllPopularOccupations,
  preEnrichFromUserCVs,
  scheduledMaintenance,
  POPULAR_OCCUPATIONS
} from '../match-jobs/background-enrichment.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

Deno.serve(async (req) => {
  // Handle CORS
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
        // Pre-enricha alla populära yrken
        console.log(`[Pre-Enrich] Mode: ALL - Enriching ${POPULAR_OCCUPATIONS.length} popular occupations...`);
        result = await preEnrichAllPopularOccupations(batchSize);
        break;

      case 'user-cvs':
        // Pre-enricha från användares CV:n
        console.log(`[Pre-Enrich] Mode: USER-CVS - Enriching top ${limit} occupations from user data...`);
        result = await preEnrichFromUserCVs(supabase, limit);
        break;

      case 'maintenance':
        // Scheduled maintenance (cleanup + re-enrichment)
        console.log('[Pre-Enrich] Mode: MAINTENANCE - Running scheduled maintenance...');
        await scheduledMaintenance(supabase);
        result = { message: 'Maintenance completed successfully' };
        break;

      default:
        return new Response(
          JSON.stringify({
            error: 'Invalid mode. Use "all", "user-cvs", or "maintenance"'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
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
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Pre-Enrich] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
