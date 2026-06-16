import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Import our modules
import { MultiSourceAggregator } from './multi-source-aggregator.ts';
import { AIEnrichmentService } from './ai-enrichment.ts';
import { TaxonomyEnhanced } from './taxonomy-enhanced.ts';
import { ScoringEngineV3 } from './scoring-engine-v3.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey'
};

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ── Filter: normalisering + hash ──────────────────────────────────────────
// Plockar bara ut kända filterfält i en STABIL ordning så hashen blir
// deterministisk oavsett vilken ordning klienten skickar nycklarna i.
// Tomma/falska värden utelämnas → tomt filter ger tomt objekt → hash ''.
function normalizeFilters(filters) {
  if (!filters || typeof filters !== 'object') return {};
  const out = {};
  if (filters.remote === true) out.remote = true;
  if (filters.noExperience === true) out.noExperience = true;
  if (typeof filters.worktimeExtent === 'string' && filters.worktimeExtent) {
    out.worktimeExtent = filters.worktimeExtent;
  }
  if (typeof filters.sort === 'string' && filters.sort) out.sort = filters.sort;
  if (Number.isFinite(filters.publishedAfterMinutes) && filters.publishedAfterMinutes > 0) {
    out.publishedAfterMinutes = filters.publishedAfterMinutes;
  }
  if (typeof filters.position === 'string' && filters.position &&
      Number.isFinite(filters.positionRadius) && filters.positionRadius > 0) {
    out.position = filters.position;
    out.positionRadius = filters.positionRadius;
  }
  if (filters.municipality) {
    const munis = (Array.isArray(filters.municipality) ? filters.municipality : [filters.municipality])
      .filter((m)=> typeof m === 'string' && m).sort();
    if (munis.length) out.municipality = munis;
  }
  return out;
}

// SHA-256 (hex) av de normaliserade filtren. Tomt objekt → '' (= standardcache).
async function hashFilters(normalized) {
  if (!normalized || Object.keys(normalized).length === 0) return '';
  // Stabil JSON: sortera nycklar på toppnivå (arrayer redan sorterade ovan).
  const stable = JSON.stringify(normalized, Object.keys(normalized).sort());
  const bytes = new TextEncoder().encode(stable);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b)=> b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });

  // Wall-clock-budget: edge-funktioner dödas vid ~150s (HTTP 546). Vi sätter
  // interna deadlines med god marginal så funktionen ALLTID svarar i tid.
  // Aggregering får max 60s, enrichment fram till 120s; resten (scoring + cache
  // + svar) ryms väl inom kvarvarande ~30s. Det som inte hinns enrichas får
  // quick-score och förfinas vid nästa anrop (varm cache).
  const FUNCTION_START = Date.now();
  const AGGREGATION_DEADLINE = FUNCTION_START + 60000;
  const ENRICHMENT_DEADLINE = FUNCTION_START + 120000;

  try {
    const { userId, customQuery, skipCache, offset, limit, filters } = await req.json();
    // Normalisera filter till ett stabilt objekt så cache-hashen blir deterministisk.
    const activeFilters = normalizeFilters(filters);
    const filterHash = await hashFilters(activeFilters);

    if (!userId) {
      return new Response(JSON.stringify({
        error: 'Missing userId'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const supabase = getSupabaseClient();
    console.log(`[Match-Jobs-V2] Starting for user ${userId}`);

    // ============================================================================
    // STEG 0: Check cache (1 hour validity)
    // ============================================================================
    if (!skipCache && !customQuery) {
      const { data: cachedRows } = await supabase
        .from('job_matchings_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('filter_hash', filterHash)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      const cachedMatching = cachedRows?.[0] || null;

      if (cachedMatching) {
        console.log(`[Match-Jobs-V2] ✅ Cache HIT - returning ${cachedMatching.jobs.length} cached jobs`);

        // Log cache hit activity
        try {
          await supabase.from('user_activities').insert({
            user_id: userId,
            activity_type: 'job_match_searched',
            description: 'Jobbmatchning (från cache)',
            metadata: {
              cached: true,
              jobs_count: cachedMatching.jobs.length,
              cache_expires_at: cachedMatching.expires_at
            }
          });
        } catch (activityError) {
          console.error('[Match-Jobs-V2] Activity logging error (cache hit):', activityError);
          // Non-blocking
        }

        // Hantera offset/limit för progressive loading
        const startIndex = offset || 0;
        const endIndex = limit ? startIndex + limit : cachedMatching.jobs.length;
        const paginatedJobs = cachedMatching.jobs.slice(startIndex, endIndex);

        return new Response(JSON.stringify({
          success: true,
          jobs: paginatedJobs,
          cached: true,
          cacheExpiresAt: cachedMatching.expires_at,
          totalResults: cachedMatching.total_jobs_found || cachedMatching.jobs.length,
          hasMore: endIndex < cachedMatching.jobs.length,
          version: 'v2-jobsearch-cached'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('[Match-Jobs-V2] Cache MISS - proceeding with fresh matching');
    }

    // ============================================================================
    // STEG 1: Hämta aktivt CV från active_cv_for_matching
    // ============================================================================
    const { data: activeCV, error: activeCVError } = await supabase
      .from('active_cv_for_matching')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (activeCVError || !activeCV) {
      return new Response(JSON.stringify({
        error: 'Inget aktivt CV. Aktivera ett CV på jobbmatchning-sidan först.',
        code: 'NO_ACTIVE_CV'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Extrahera parsed data
    const cvOccupations = activeCV.extracted_occupations || [];
    const cvSkills = activeCV.extracted_skills || [];
    const cvEducations = activeCV.extracted_educations || [];
    const cvLocation = activeCV.extracted_location;

    console.log(`[Match-Jobs-V2] Active CV data: ${cvOccupations.length} occupations, ${cvSkills.length} skills, location: ${cvLocation || 'none'}`);

    // Prioritera high-confidence occupations
    const primaryOccupation = cvOccupations.find((occ) => occ.confidence === 'high') || cvOccupations[0];

    if (!primaryOccupation) {
      return new Response(JSON.stringify({
        error: 'Inga yrkesroller hittades i ditt CV. Kontrollera CV-innehållet.',
        code: 'NO_OCCUPATIONS'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`[Match-Jobs-V2] Primary occupation: ${primaryOccupation.normalized} (concept_id: ${primaryOccupation.concept_id}, confidence: ${primaryOccupation.confidence})`);

    // ============================================================================
    // STEG 2: Taxonomy Enrichment (Enhanced) - SKIPPA FÖR REDAN NORMALISERADE OCCUPATIONS
    // ============================================================================
    // VIKTIGT: Vi har redan normaliserade occupations med concept_id från parse-cv-for-matching
    // Taxonomy enrichment behövs endast för related occupations
    const taxonomyService = new TaxonomyEnhanced(supabase);

    let taxonomyData = {
      primaryTerm: primaryOccupation.normalized,
      ssykCode: null,
      preferredLabel: primaryOccupation.normalized,
      alternativeLabels: primaryOccupation.alternative_labels || [],
      relatedOccupations: [],
      competencies: [],
      conceptId: primaryOccupation.concept_id,
      occupationFieldId: null,
      occupationGroupId: null // Will be extracted from first job result
    };

    // Hämta relaterade yrken för bredare sökning
    let relatedOccupations = [];
    if (primaryOccupation.concept_id) {
      relatedOccupations = await taxonomyService.getRelatedOccupations(primaryOccupation.normalized);
      console.log(`[Match-Jobs-V2] Found ${relatedOccupations.length} related occupations`);
    }

    // ============================================================================
    // STEG 3: Multi-Source Job Aggregation
    // ============================================================================
    const aggregator = new MultiSourceAggregator();
    console.log('[Match-Jobs-V2] Aggregating jobs from multiple sources...');

    const allJobs = await aggregator.aggregateJobs({
      primaryOccupation: primaryOccupation.normalized,
      taxonomyData,
      relatedOccupations,
      cvEducations: cvEducations,
      userLocation: cvLocation || '',
      customQuery: customQuery,
      maxJobsPerQuery: 1000,
      maxTotalJobs: 2000,
      deadlineMs: AGGREGATION_DEADLINE,
      filters: activeFilters
    });

    console.log(`[Match-Jobs-V2] Aggregated ${allJobs.length} total jobs from all sources`);

    if (allJobs.length === 0) {
      console.error('[Match-Jobs-V2] No jobs found!');
      return new Response(JSON.stringify({
        success: true,
        jobs: [],
        searchTerms: {
          primaryOccupation: primaryOccupation.normalized,
          allOccupations: cvOccupations.map((o) => o.normalized),
          location: cvLocation
        },
        totalResults: 0,
        version: 'v2-jobsearch'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // ============================================================================
    // STEG 4: Quick Scoring (UTAN AI enrichment) för prioritering
    // ============================================================================
    console.log('[Match-Jobs-V2] Quick scoring all jobs for prioritization...');
    const scoringEngine = new ScoringEngineV3();

    const quickScoredJobs = allJobs.map((job) => ({
      ...job,
      quickScore: scoringEngine.quickScore(
        job,
        cvOccupations,
        taxonomyData.conceptId,
        taxonomyData.occupationGroupId,
        taxonomyData.occupationFieldId
      )
    }));

    // Sortera och ta top 100 för AI enrichment
    quickScoredJobs.sort((a, b) => b.quickScore - a.quickScore);
    const top100Jobs = quickScoredJobs.slice(0, 100);

    console.log(`[Match-Jobs-V2] Quick scored ${allJobs.length} jobs, enriching top 100`);
    console.log(`[Match-Jobs-V2] Quick score range: ${quickScoredJobs[0]?.quickScore || 0} - ${top100Jobs[99]?.quickScore || 0}`);

    // ============================================================================
    // STEG 5: AI-Powered Enrichment (endast top 100!)
    // ============================================================================
    // JobSearch API har redan must_have/nice_to_have, men AI enrichment ger extra kompetenser
    const enrichmentService = new AIEnrichmentService(supabase);
    console.log(`[Match-Jobs-V2] Enriching top 100 jobs with AI...`);

    const enrichedJobsMap = await enrichmentService.enrichJobsBatch(
      top100Jobs.map((job) => ({
        id: job.id,
        headline: job.headline,
        text: job.description?.text || ''
      })),
      ENRICHMENT_DEADLINE
    );

    console.log(`[Match-Jobs-V2] Successfully enriched ${enrichedJobsMap.size} jobs`);

    // ============================================================================
    // STEG 6: Full Scoring för alla jobb (top 100 med enrichment, resten utan)
    // ============================================================================
    console.log('[Match-Jobs-V2] Full scoring with V3 algorithm...');

    const jobsWithScores = quickScoredJobs.map((job) => {
      const enrichedJob = enrichedJobsMap.get(job.id) || null;

      const scoringResult = scoringEngine.calculateScore({
        cvOccupations: cvOccupations,
        cvSkills: cvSkills,
        cvLocation: cvLocation,
        taxonomyData,
        job,
        enrichedJob
      });

      return {
        ...job,
        relevance: scoringResult.total,
        scoringBreakdown: scoringResult.breakdown,
        // Ta BORT scoringExplanation från response (visa endast % i frontend)
        enriched: enrichedJob !== null,
        distance: scoringResult.distance
      };
    });

    // ============================================================================
    // STEG 7: Intelligent Filtering & Sorting
    // ============================================================================
    console.log('[Match-Jobs-V2] Filtering and sorting jobs...');
    console.log(`[Match-Jobs-V2] Jobs before filtering: ${jobsWithScores.length}`);

    // Vid bred erfarenhet-fri sökning saknar jobben CV-yrkesmatch
    // (occupationLevel/titleMatch ≈ 0), så de flesta hamnar under 15 och skulle
    // gallras bort → tom lista. Då tar vi bort yrkesgränsen och låter
    // geografi/skills-rankningen avgöra ORDNINGEN i stället. Övriga filter
    // behåller den vanliga 15-poängströskeln.
    const minRelevance = activeFilters.noExperience === true ? 0 : 15;
    const filteredJobs = jobsWithScores.filter((job) => {
      return job.relevance >= minRelevance;
    });

    const filteredOutCount = jobsWithScores.length - filteredJobs.length;
    const filteredOutPercentage = Math.round(filteredOutCount / jobsWithScores.length * 100);

    console.log(`[Match-Jobs-V2] Filtered to ${filteredJobs.length} relevant jobs`);
    console.log(`[Match-Jobs-V2] Filtered out: ${filteredOutCount} jobs (${filteredOutPercentage}%)`);

    // Sortera efter relevans
    filteredJobs.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    // Ta top 600 för caching. Höjt från 300 så klientsidig filtrering (ort,
    // omfattning, publicerat, sortering) och region→kommun-gruppering har en
    // bredare bas att jobba mot — utan att behöva söka om mot servern.
    const topJobs = filteredJobs.slice(0, 600);

    console.log(`[Match-Jobs-V2] Top ${topJobs.length} jobs selected`);
    console.log(`[Match-Jobs-V2] Score range: ${topJobs[0]?.relevance || 0} - ${topJobs[topJobs.length - 1]?.relevance || 0}`);

    // ============================================================================
    // STEG 8: Cache resultat (1 timme) + Log Activity
    // ============================================================================
    if (!customQuery) {
      try {
        await supabase.from('job_matchings_cache').upsert({
          user_id: userId,
          cv_id: activeCV.cv_id,
          filter_hash: filterHash,
          jobs: topJobs,
          search_params: {
            primaryOccupation: primaryOccupation.normalized,
            location: cvLocation,
            totalOccupations: cvOccupations.length,
            filters: activeFilters
          },
          total_jobs_found: topJobs.length,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h
        }, {
          onConflict: 'user_id,cv_id,filter_hash'
        });

        console.log('[Match-Jobs-V2] ✅ Cached matching for 1 hour');

        // Log fresh job matching activity
        try {
          await supabase.from('user_activities').insert({
            user_id: userId,
            activity_type: 'job_match_searched',
            description: `Jobbmatchning genomförd: ${topJobs.length} jobb hittades`,
            metadata: {
              cached: false,
              total_aggregated: allJobs.length,
              after_filtering: filteredJobs.length,
              returned_jobs: topJobs.length,
              primary_occupation: primaryOccupation.normalized,
              location: cvLocation || null,
              custom_query: customQuery || null
            }
          });
          console.log('[Match-Jobs-V2] ✅ Logged job matching activity');
        } catch (activityError) {
          console.error('[Match-Jobs-V2] Activity logging error:', activityError);
          // Non-blocking
        }

        // Update onboarding progress for job matching
        try {
          await supabase.rpc('update_onboarding_progress', {
            user_id: userId,
            step_name: 'match_jobs'
          });
          console.log('[Match-Jobs-V2] ✅ Updated onboarding progress');
        } catch (onboardingError) {
          console.error('[Match-Jobs-V2] Onboarding progress error:', onboardingError);
          // Non-blocking, continue
        }
      } catch (cacheError) {
        console.error('[Match-Jobs-V2] Cache save error:', cacheError);
        // Non-blocking error, continue
      }
    }

    // ============================================================================
    // STEG 9: Return top 50 initialt (snabb rendering)
    // ============================================================================
    // Respektera offset/limit ÄVEN i det färska svaret (inte bara cache-grenen).
    // Annars returnerar ett offset=50-anrop (progressive loading) samma top-50
    // igen om cachen ännu inte hunnit skrivas → dubbletter med samma id i
    // frontend-listan, vilket bryter Reacts key-baserade rendering.
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : 50;
    const initialJobs = topJobs.slice(startIndex, endIndex);

    console.log(`[Match-Jobs-V2] Returning jobs ${startIndex}-${endIndex} (${initialJobs.length} st)`);

    return new Response(JSON.stringify({
      success: true,
      jobs: initialJobs,
      hasMore: endIndex < topJobs.length,
      totalAvailable: topJobs.length,
      activeCV: {
        cvId: activeCV.cv_id,
        parsedAt: activeCV.parsed_at,
        primaryOccupation: primaryOccupation.normalized,
        totalOccupations: cvOccupations.length,
        totalSkills: cvSkills.length,
        location: cvLocation
      },
      searchTerms: {
        primaryOccupation: primaryOccupation.normalized,
        allOccupations: cvOccupations.map((o) => o.normalized),
        location: cvLocation
      },
      stats: {
        totalAggregated: allJobs.length,
        quickScored: quickScoredJobs.length,
        enrichedTop100: enrichedJobsMap.size,
        afterFiltering: filteredJobs.length,
        topCached: topJobs.length,
        returnedInitially: initialJobs.length
      },
      version: 'v2-jobsearch',
      improvements: [
        'JobSearch API with full descriptions and structured requirements',
        'Quick scoring for prioritization (all jobs)',
        'AI enrichment for top 100 jobs only',
        'must_have/nice_to_have bonus scoring',
        '1-hour caching for instant re-loads',
        'Progressive loading (top 50 initial, 300 total available)',
        'Activity tracking for admin statistics'
      ]
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[Match-Jobs-V2] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});