import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * sync-global-jobs
 *
 * Hämtar två GENERISKA (icke-användarspecifika) jobbpooler från
 * Arbetsförmedlingens JobSearch-API och cachar dem globalt:
 *   - 'remote'        → remote=true   (distansjobb, ~500 st i landet)
 *   - 'no_experience' → experience=false (jobb utan erfarenhetskrav, ~350 st)
 *
 * Dessa pooler är SAMMA för alla användare, så de hämtas av cron några gånger
 * per dag i stället för att varje användares sökning gör om dem. Frontend läser
 * sedan ur global_job_cache och rankar mot användarens CV klientsidigt — ingen
 * personlig server-omsökning, ingen påverkan på gratisanvändarnas sökkvot.
 *
 * Auth: kräver CRON_SECRET (Bearer) så endast vår cron kan trigga den.
 */

const JOBSEARCH_API = 'https://jobsearch.api.jobtechdev.se/search';
const FETCH_TIMEOUT = 10000;
const PAGE_LIMIT = 100;
const MAX_PAGES = 8; // 800 jobb tak — räcker väl för pooler på ~350-520

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

// Vilken JobSearch-parameter varje pool-typ använder.
const POOLS: Record<string, Record<string, string>> = {
  remote: { remote: 'true' },
  no_experience: { experience: 'false' },
};

async function fetchPool(params: Record<string, string>) {
  const all: any[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_LIMIT;
    const qs = new URLSearchParams({ ...params, limit: String(PAGE_LIMIT), offset: String(offset) });
    let res: Response;
    try {
      res = await fetch(`${JOBSEARCH_API}?${qs.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
    } catch (err) {
      console.error(`[sync-global-jobs] fetch error page ${page + 1}:`, err);
      break;
    }
    if (!res.ok) {
      console.error(`[sync-global-jobs] API ${res.status} page ${page + 1}`);
      break;
    }
    const data = await res.json();
    const hits = data.hits || [];
    if (hits.length === 0) break;
    all.push(...hits);
    if (hits.length < PAGE_LIMIT) break; // sista sidan
    await new Promise((r) => setTimeout(r, 100));
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Auth: bara vår cron (eller en admin med secret) får trigga.
  const cronSecret = Deno.env.get('CRON_SECRET');
  const auth = req.headers.get('authorization');
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    // type = 'remote' | 'no_experience' | 'all' (default: all)
    const requested = body.type && body.type !== 'all' ? [body.type] : Object.keys(POOLS);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results: Record<string, number> = {};
    for (const type of requested) {
      const params = POOLS[type];
      if (!params) continue;
      const jobs = await fetchPool(params);
      const { error } = await supabase.from('global_job_cache').upsert(
        {
          cache_key: type,
          jobs,
          total_found: jobs.length,
          // 12h TTL — cron refreshar oftare, men ger marginal om en körning hoppas över.
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'cache_key' }
      );
      if (error) {
        console.error(`[sync-global-jobs] upsert error (${type}):`, error);
      } else {
        results[type] = jobs.length;
        console.log(`[sync-global-jobs] ✅ ${type}: ${jobs.length} jobb cachade`);
      }
    }

    return new Response(JSON.stringify({ success: true, synced: results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[sync-global-jobs] error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
