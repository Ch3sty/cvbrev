import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Import our modules
import { MultiSourceAggregator } from './multi-source-aggregator.ts';
import { AIEnrichmentService } from './ai-enrichment.ts';
import { TaxonomyEnhanced } from './taxonomy-enhanced.ts';
import { ScoringEngineV2 } from './scoring-engine-v2.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { userId, customQuery } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const supabase = getSupabaseClient();
    console.log(`[Match-Jobs-V2] Starting for user ${userId}`);

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extrahera parsed data
    const cvOccupations = activeCV.extracted_occupations || [];
    const cvSkills = activeCV.extracted_skills || [];
    const cvEducations = activeCV.extracted_educations || [];
    const cvLocation = activeCV.extracted_location;

    console.log(`[Match-Jobs-V2] Active CV data: ${cvOccupations.length} occupations, ${cvSkills.length} skills, location: ${cvLocation || 'none'}`);

    // Prioritera high-confidence occupations
    const primaryOccupation = cvOccupations.find(occ => occ.confidence === 'high') || cvOccupations[0];

    if (!primaryOccupation) {
      return new Response(JSON.stringify({
        error: 'Inga yrkesroller hittades i ditt CV. Kontrollera CV-innehållet.',
        code: 'NO_OCCUPATIONS'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
      ssykCode: null, // Will be fetched if needed
      preferredLabel: primaryOccupation.normalized,
      alternativeLabels: primaryOccupation.alternative_labels || [],
      relatedOccupations: [],
      competencies: [],
      conceptId: primaryOccupation.concept_id,
      occupationFieldId: primaryOccupation.concept_id,
      occupationGroupId: null
    };

    // Hämta relaterade yrken för bredare sökning
    let relatedOccupations: string[] = [];
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
      maxJobsPerQuery: 1000, // 10 pages × 100
      maxTotalJobs: 2000
    });

    console.log(`[Match-Jobs-V2] Aggregated ${allJobs.length} total jobs from all sources`);

    if (allJobs.length === 0) {
      console.error('[Match-Jobs-V2] No jobs found!');
      return new Response(JSON.stringify({
        success: true,
        jobs: [],
        searchTerms: {
          primaryOccupation: primaryOccupation.normalized,
          allOccupations: cvOccupations.map(o => o.normalized),
          location: cvLocation
        },
        totalResults: 0,
        version: 'v2-active-cv'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================================================
    // STEG 4: AI-Powered Enrichment (CONDITIONAL - ENDAST FÖR KOMPETENSER)
    // ============================================================================
    // NYTT: Skippa AI enrichment för occupations - JobAd Links har redan strukturerad occupation data
    // AI enrichment behövs endast för kompetenser/färdigheter
    const enrichmentService = new AIEnrichmentService(supabase);

    console.log(`[Match-Jobs-V2] Enriching ${allJobs.length} jobs with AI (skills/competencies only)...`);

    // OPTIMERING: Filtrera jobb som redan har occupation_field från JobAd Links
    // Dessa behöver INGEN AI enrichment för occupations
    const jobsNeedingEnrichment = allJobs.filter(job => {
      // Om jobbet redan har occupation_field från JobAd Links, skippa occupation enrichment
      const hasOccupationData = job.occupation_field?.concept_id || job.occupation?.concept_id;
      if (hasOccupationData) {
        console.log(`[Match-Jobs-V2] Job ${job.id} already has occupation data from JobAd Links - skipping AI occupation enrichment`);
      }
      // Vi enrichar ALLA jobb för kompetenser, men detta går snabbt
      return true; // För nu enrichar vi alla för kompetenser
    });

    const enrichedJobsMap = await enrichmentService.enrichJobsBatch(
      jobsNeedingEnrichment.map(job => ({
        id: job.id,
        headline: job.headline,
        text: job.description?.text || ''
      }))
    );

    console.log(`[Match-Jobs-V2] Successfully enriched ${enrichedJobsMap.size} jobs`);

    // ============================================================================
    // STEG 5: Advanced Scoring V2
    // ============================================================================
    const scoringEngine = new ScoringEngineV2();

    // Konvertera active CV data till format som scoring engine förväntar
    const cvDataForScoring = {
      structuredCV: {
        occupation: cvOccupations.map(o => o.normalized),
        skills: cvSkills,
        education: cvEducations,
        location: cvLocation ? [cvLocation] : []
      }
    };

    console.log('[Match-Jobs-V2] Scoring jobs with enhanced algorithm...');
    const jobsWithScores = allJobs.map(job => {
      const enrichedJob = enrichedJobsMap.get(job.id) || null;

      const scoringResult = scoringEngine.calculateScore({
        cvData: cvDataForScoring,
        cvOccupations: cvOccupations.map(o => o.normalized),
        cvLocations: cvLocation ? [cvLocation] : [],
        taxonomyData,
        job,
        enrichedJob
      });

      return {
        ...job,
        relevance: scoringResult.total,
        scoringBreakdown: scoringResult.breakdown,
        scoringExplanation: scoringResult.explanation,
        enriched: enrichedJob !== null,
        distance: scoringResult.distance
      };
    });

    // ============================================================================
    // STEG 6: Intelligent Filtering (MJUKARE FILTER FÖR BÄTTRE TÄCKNING)
    // ============================================================================
    console.log('[Match-Jobs-V2] Applying intelligent filters...');
    const filteredJobs = jobsWithScores.filter(job => {
      // SÄNKT minimum relevans: 20 poäng (från 30)
      if (job.relevance < 20) return false;

      const enrichedJob = enrichedJobsMap.get(job.id);

      // Om inte enriched: Sänkt krav från 50 till 35 poäng
      if (!enrichedJob) return job.relevance >= 35;

      // Om enriched: Kolla olika matchningskriterier
      const hasSSYKMatch = enrichedJob.occupations?.some(
        occ => occ.ssyk_code === taxonomyData?.ssykCode
      );
      const hasCompetencyMatch = (enrichedJob.skills?.length || 0) >= 1; // SÄNKT från 2 till 1 kompetens

      // MJUKARE KRAV: Acceptera jobb med:
      // - SSYK-match, ELLER
      // - Minst 1 kompetens-match, ELLER
      // - Relevans >= 40 (sänkt från 60)
      return hasSSYKMatch || hasCompetencyMatch || job.relevance >= 40;
    });

    console.log(`[Match-Jobs-V2] Filtered to ${filteredJobs.length} relevant jobs`);

    // ============================================================================
    // STEG 7: Sortera och begränsa
    // ============================================================================
    filteredJobs.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    const finalJobs = filteredJobs.slice(0, 500); // Top 500

    console.log(`[Match-Jobs-V2] Returning top ${finalJobs.length} jobs`);
    console.log(`[Match-Jobs-V2] Score range: ${finalJobs[0]?.relevance || 0} - ${finalJobs[finalJobs.length - 1]?.relevance || 0}`);

    // ============================================================================
    // RETURN RESPONSE
    // ============================================================================
    return new Response(
      JSON.stringify({
        success: true,
        jobs: finalJobs,
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
          allOccupations: cvOccupations.map(o => o.normalized),
          location: cvLocation
        },
        totalResults: finalJobs.length,
        stats: {
          totalAggregated: allJobs.length,
          enriched: enrichedJobsMap.size,
          afterFiltering: filteredJobs.length,
          returned: finalJobs.length
        },
        version: 'v2-active-cv',
        improvements: [
          'Active CV parsing with AI (GPT-4o-mini)',
          'Taxonomy API normalization with concept_ids',
          'Multi-source aggregation (JobAd Links with occupation-field filtering)',
          'AI-powered enrichment for skills/competencies',
          'Enhanced scoring algorithm (6 factors)',
          'Intelligent filtering based on AI-extracted competencies'
        ]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Match-Jobs-V2] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
