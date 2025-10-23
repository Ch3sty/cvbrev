import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// API key hantering - använd OPENAI_API_KEY (inte ADMIN)
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_PROJECT_ID = Deno.env.get('OPENAI_PROJECT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Validera miljövariabler
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY är inte konfigurerad');
}
if (!OPENAI_PROJECT_ID) {
  console.error('⚠️ OPENAI_PROJECT_ID är inte konfigurerad - kan orsaka permissions problem');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// ============================================================================
// TAXONOMY ENRICHMENT (from match-jobs)
// ============================================================================

interface TaxonomyEnrichment {
  primaryTerm: string;
  ssykCode: string | null;
  preferredLabel: string | null;
  alternativeLabels: string[];
  relatedOccupations: string[];
  competencies: string[];
}

const taxonomyCache = new Map<string, { data: TaxonomyEnrichment; timestamp: number }>();
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hämta taxonomy-berikad data för ett yrke
 */
async function enrichOccupationWithTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const baseUrl = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';

  try {
    // Sök efter yrket i taxonomy
    const searchUrl = `${baseUrl}/specific-concepts/search?q=${encodeURIComponent(occupation)}&type=occupation-name&limit=5`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Taxonomy API error (${response.status}) for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No taxonomy results for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    // Ta första (bästa) matchningen
    const bestMatch = data[0];

    // Extrahera data
    const ssykCode = bestMatch.ssyk_code_2012 || bestMatch.ssyk || null;
    const preferredLabel = bestMatch.preferred_label || null;
    const alternativeLabels = bestMatch.alternative_labels || [];

    console.log(`Taxonomy enrichment for "${occupation}": ${alternativeLabels.length} synonyms, SSYK: ${ssykCode}`);

    return {
      primaryTerm: occupation,
      ssykCode,
      preferredLabel,
      alternativeLabels,
      relatedOccupations: [],
      competencies: []
    };

  } catch (error) {
    console.error(`Taxonomy API error for "${occupation}":`, error);
    return createFallbackEnrichment(occupation);
  }
}

/**
 * Skapa fallback enrichment om API failar
 */
function createFallbackEnrichment(occupation: string): TaxonomyEnrichment {
  // Manuell synonym-lista för vanliga yrken
  const manualSynonyms: Record<string, string[]> = {
    'rörmokare': ['vvs-montör', 'vs-montör', 'rörläggare', 'vvs-installatör'],
    'elektriker': ['elmontör', 'elinstallatör', 'eltekniker'],
    'snickare': ['byggsnickare', 'möbelsnickare', 'inredningssnickare'],
    'sjuksköterska': ['legitimerad sjuksköterska', 'spec.sjuksköterska'],
    'lärare': ['grundskollärare', 'gymnasielärare', 'undervisande lärare'],
    'säljare': ['butikssäljare', 'försäljare', 'säljassistent'],
    'utvecklare': ['systemutvecklare', 'mjukvaruutvecklare', 'programmerare']
  };

  const lowerOccupation = occupation.toLowerCase();
  const synonyms = manualSynonyms[lowerOccupation] || [];

  // Om vi har en manuell synonym, använd första som preferredLabel
  const preferredLabel = synonyms.length > 0 ? synonyms[0] : null;

  return {
    primaryTerm: occupation,
    ssykCode: null,
    preferredLabel,
    alternativeLabels: synonyms,
    relatedOccupations: [],
    competencies: []
  };
}

/**
 * Cache för taxonomy-data (7 dagar)
 */
async function getCachedTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const cacheKey = `taxonomy:${occupation.toLowerCase()}`;

  // Kolla cache
  if (taxonomyCache.has(cacheKey)) {
    const cached = taxonomyCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`Taxonomy cache HIT for "${occupation}"`);
      return cached.data;
    } else {
      taxonomyCache.delete(cacheKey); // Rensa utgången cache
    }
  }

  // Hämta från API
  console.log(`Taxonomy cache MISS for "${occupation}" - fetching from API`);
  const data = await enrichOccupationWithTaxonomy(occupation);

  // Spara i cache
  taxonomyCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}

// Analyze CV with GPT-5 using chat/completions endpoint
async function analyzeCV(cvText: string, targetInfo: any) {
  console.log('🤖 Starting CV analysis with GPT-5...');
  console.log(`🔑 Using project: ${OPENAI_PROJECT_ID ? 'cvbrev (proj_WlM3ZDwbSPysgXRdp4m8dEGg)' : 'default'}`);

  const truncatedCV = cvText.substring(0, 8000);
  console.log(`📄 CV length: ${cvText.length} chars (truncated to ${truncatedCV.length})`);

  let targetPrompt = '';
  if (targetInfo.mode === 'role') {
    targetPrompt = `Målet är yrkesrollen "${targetInfo.targetRole}" i Sverige.`;
    console.log(`🎯 Analysis mode: role-based (${targetInfo.targetRole})`);
  } else {
    targetPrompt = `Målet är att matcha mot följande jobbannons: ${targetInfo.jobAdText?.substring(0, 4000)}`;
    console.log(`🎯 Analysis mode: job ad matching`);
  }

  try {
    console.log('🚀 Calling GPT-5 API...');
    console.log(`🔨 Headers: Authorization: Bearer sk-...${OPENAI_API_KEY?.slice(-4)}, OpenAI-Project: ${OPENAI_PROJECT_ID || 'not set'}`);

    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    // Lägg till projekt header om den finns
    if (OPENAI_PROJECT_ID) {
      headers['OpenAI-Project'] = OPENAI_PROJECT_ID;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Du är en svensk rekryteringsexpert. ${targetPrompt}

Analysera detta CV och identifiera:
1. Matchningspoäng (0-100) - var KRITISK och realistisk
2. Sammanfattning av CV:t relaterat till målet
3. Relevanta kompetenser som personen har
4. ALLA kompetensgap som saknas för rollen (var noggrann och identifiera både formella och informella kompetenser)

Returnera ENDAST ett JSON-objekt med följande struktur:
{
  "matchScore": number,
  "cvSummaryForTarget": string,
  "identifiedRelevantSkills": [{"skill": string, "source_in_cv": string, "relevance_to_target": "high"|"medium"|"low"}],
  "identifiedSkillGaps": [{"skill": string, "importance": "essential"|"desirable", "reasoning": string}]
}`
          },
          {
            role: 'user',
            content: `CV att analysera:\n${truncatedCV}`
          }
        ],
        max_completion_tokens: 20000,
        store: true,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GPT-5 analysis failed (${response.status}):`, errorText);

      // Logga response headers för debugging
      const headers: any = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.error('🔍 Response headers:', JSON.stringify(headers, null, 2));

      // Specifik hantering för scope errors
      if (errorText.includes('Missing scopes: model.request')) {
        throw new Error(`GPT-5 permission denied - API key saknar model.request scope för projekt ${OPENAI_PROJECT_ID || 'default'}. Kontrollera att din API-nyckel har rätt permissions i projektet cvbrev.`);
      }

      throw new Error(`GPT-5 analysis failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ GPT-5 response received successfully');

    const result = JSON.parse(data.choices[0].message.content);

    // Ensure the result has the expected structure
    const structuredResult = {
      matchScore: result.matchScore || 0,
      cvSummaryForTarget: result.cvSummaryForTarget || '',
      identifiedRelevantSkills: result.identifiedRelevantSkills || [],
      identifiedSkillGaps: result.identifiedSkillGaps || []
    };

    console.log(`✅ GPT-5 Analysis complete: Score=${structuredResult.matchScore}%, Gaps=${structuredResult.identifiedSkillGaps.length}`);
    return structuredResult;

  } catch (error: any) {
    console.error(`🔥 GPT-5 request failed:`, error.message);
    throw error;
  }
}

// Find courses using gpt-4o-search-preview with web search
async function findRealCoursesWithWebSearch(gap: any, targetRole: string, userLocation?: string) {
  console.log(`🔍 Searching for courses: ${gap.skill}${userLocation ? ` (region: ${userLocation})` : ''}`);

  try {
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    // Lägg till projekt header för web search också
    if (OPENAI_PROJECT_ID) {
      headers['OpenAI-Project'] = OPENAI_PROJECT_ID;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        web_search_options: {
          search_context_size: 'medium', // Changed from 'high' to 'medium' for faster responses
          user_location: {
            type: 'approximate',
            approximate: {
              country: 'SE',
              city: userLocation || 'Stockholm',
              region: userLocation || 'Stockholm'
            }
          }
        },
        messages: [
          {
            role: 'system',
            content: `Du är en expert på utbildning. Hitta RIKTIGA kurser med FUNGERANDE länkar från websökning.

VIKTIGT:
- Använd ENDAST information från websökningen
- Returnera ENDAST kurser med verkliga URL:er
- Prioritera svenska utbildningsanordnare
- Returnera ALLTID valid JSON - ingenting annat

REGIONAL PRIORITERING:
- Användaren bor i ${userLocation || 'Stockholm'}
- PRIORITERA kurser i ${userLocation || 'Stockholm'} eller närliggande områden
- Distans/Online-kurser är alltid OK och HÖGT prioriterade
- För platskurser: inkludera endast inom rimligt avstånd från ${userLocation || 'Stockholm'}
- UNDVIK kurser i avlägsna regioner om de inte är distans/online`
          },
          {
            role: 'user',
            content: `Sök efter kurser för "${gap.skill}" relevant för ${targetRole}.

REGIONAL BEGRÄNSNING: Användaren bor i ${userLocation || 'Stockholm'}.

Returnera ENDAST denna JSON-struktur (inget annat):
{
  "courses": [
    {
      "title": "Kursnamn",
      "provider": "Anordnare",
      "direct_url": "https://...",
      "duration": "X veckor/månader",
      "cost": "Kostnad eller Gratis",
      "description": "Kort beskrivning",
      "location": "Plats eller Distans/Online",
      "delivery_method": "Distans eller Plats"
    }
  ]
}`
          }
        ],
        // REMOVED response_format since it's not supported with web_search
        max_tokens: 1500 // Reduced from 2000 for faster responses
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Web search failed (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON från web search response
    let parsed: any = { courses: [] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (parseError: any) {
      console.error(`⚠️ Failed to parse web search response for ${gap.skill}:`, parseError.message);
      console.log('Raw response:', content.substring(0, 500));
      return [];
    }

    const courses = (parsed.courses || []).map((course: any) => ({
      type: 'course',
      title: course.title || 'Okänd kurs',
      provider: course.provider || 'Okänd anordnare',
      direct_url: course.direct_url || '',
      duration: course.duration || 'Se kurssida',
      cost: course.cost || 'Kontakta anordnare',
      description: course.description || '',
      priority: gap.importance === 'essential' ? 'essential' : 'recommended',
      relevance: `För ${gap.skill}`,
      is_verified: course.direct_url?.startsWith('http'),
      search_source: 'gpt4o_web_search'
    }));

    const verifiedCourses = courses.filter((c: any) => c.is_verified);
    console.log(`✅ Found ${verifiedCourses.length} verified courses for "${gap.skill}"`);

    return verifiedCourses.slice(0, 3);

  } catch (error: any) {
    console.error(`❌ Web search failed for ${gap.skill}:`, error.message);
    return [];
  }
}

Deno.serve(async (req) => {
  console.log('='.repeat(60));
  console.log(`📥 Request received: ${req.method} ${req.url}`);
  console.log('='.repeat(60));

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  let requestBody: any = null;
  let jobId: string | null = null;

  try {
    // Parse request body
    try {
      const bodyText = await req.text();
      console.log(`📦 Request body received, length: ${bodyText.length}`);

      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ Empty request body');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      requestBody = JSON.parse(bodyText);
      jobId = requestBody.jobId;
      console.log('🚀 Processing competence analysis job:', jobId);

    } catch (parseError: any) {
      console.error('❌ Failed to parse request body:', parseError.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key
    if (!OPENAI_API_KEY) {
      console.error('❌ No OpenAI API key configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔑 API key configured: sk-...${OPENAI_API_KEY.slice(-4)}`);
    console.log(`🎯 Project ID: ${OPENAI_PROJECT_ID || 'not configured (will use default)'}`);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('competence_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('❌ Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update status
    await supabase
      .from('competence_analysis_jobs')
      .update({
        status: 'analyzing',
        progress: 10,
        current_step: 'Hämtar CV-text...'
      })
      .eq('id', jobId);

    // Get CV text and location data
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', job.cv_id)
      .single();

    // Try to get user location from parsed CV data
    const { data: cvParsed } = await supabase
      .from('parsed_cv_data')
      .select('location, municipalities')
      .eq('cv_id', job.cv_id)
      .maybeSingle();

    const userLocation = cvParsed?.location || cvParsed?.municipalities?.[0] || 'Stockholm';
    const userRegion = cvParsed?.location || 'Stockholms län';

    console.log(`📍 User location: ${userLocation}, Region: ${userRegion}`);

    // Normalize target role with Taxonomy API (before GPT-5 analysis)
    let normalizedRole = job.target_role;
    if (job.target_role) {
      console.log(`🏷️ Normalizing occupation: "${job.target_role}"`);
      try {
        const taxonomy = await getCachedTaxonomy(job.target_role);
        if (taxonomy.preferredLabel) {
          normalizedRole = taxonomy.preferredLabel;
          console.log(`✅ Normalized: "${job.target_role}" → "${normalizedRole}"`);
        } else {
          console.log(`⚠️ No preferred label found for "${job.target_role}", using original`);
        }
      } catch (taxonomyError: any) {
        console.warn(`⚠️ Taxonomy normalization failed for "${job.target_role}":`, taxonomyError.message);
        // Continue with original role on error
      }
    }

    if (cvError || !cvData) {
      console.error('❌ CV not found:', cvError);
      await supabase
        .from('competence_analysis_jobs')
        .update({
          status: 'failed',
          error_message: 'CV kunde inte hittas',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({ error: 'CV not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update progress
    await supabase
      .from('competence_analysis_jobs')
      .update({
        progress: 20,
        current_step: 'Analyserar CV med GPT-5...'
      })
      .eq('id', jobId);

    // Step 1: Analysis with GPT-5
    console.log('📋 Starting CV analysis with GPT-5...');
    let analysisResult: any;

    try {
      analysisResult = await analyzeCV(cvData.cv_text, {
        mode: job.analysis_mode,
        targetRole: normalizedRole, // Use taxonomy-normalized occupation
        jobAdText: job.job_ad_text
      });

    } catch (analysisError: any) {
      console.error('❌ GPT-5 Analysis failed:', analysisError);
      await supabase
        .from('competence_analysis_jobs')
        .update({
          status: 'failed',
          error_message: `GPT-5 analys misslyckades: ${analysisError.message}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      throw analysisError;
    }

    console.log(`📊 GPT-5 Analysis complete. Score: ${analysisResult.matchScore}%, Gaps: ${analysisResult.identifiedSkillGaps?.length}`);

    // Update with initial results
    await supabase
      .from('competence_analysis_jobs')
      .update({
        status: 'processing_gaps',
        progress: 40,
        match_score: analysisResult.matchScore,
        cv_summary: analysisResult.cvSummaryForTarget,
        identified_skills: analysisResult.identifiedRelevantSkills,
        skill_gaps: analysisResult.identifiedSkillGaps,
        total_gaps: analysisResult.identifiedSkillGaps?.length || 0,
        processed_gaps: 0,
        current_step: 'Söker kurser med web search...'
      })
      .eq('id', jobId);

    // Step 2: Find courses IN PARALLEL
    console.log('🎓 Starting PARALLEL course search with web search...');
    const gaps = analysisResult.identifiedSkillGaps || [];
    const allSuggestions: any[] = [];

    // Process ALL gaps in parallel batches
    const BATCH_SIZE = 5; // 5 web searches simultaneously
    const totalBatches = Math.ceil(gaps.length / BATCH_SIZE);

    console.log(`📦 Processing ${gaps.length} gaps in ${totalBatches} parallel batches...`);

    for (let i = 0; i < gaps.length; i += BATCH_SIZE) {
      const batch = gaps.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`📦 Batch ${batchIndex}/${totalBatches}: Processing ${batch.length} gaps (${i + 1}-${Math.min(i + BATCH_SIZE, gaps.length)} of ${gaps.length})`);

      // Update progress before batch
      await supabase
        .from('competence_analysis_jobs')
        .update({
          progress: 40 + Math.round((i / gaps.length) * 50),
          current_step: `Söker kurser batch ${batchIndex}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, gaps.length)} av ${gaps.length})...`
        })
        .eq('id', jobId);

      // PARALLEL PROCESSING with Promise.allSettled
      const batchStartTime = Date.now();
      const batchResults = await Promise.allSettled(
        batch.map((gap, batchGapIndex) => {
          const globalIndex = i + batchGapIndex;
          console.log(`  🔍 [${globalIndex + 1}/${gaps.length}] Searching for: "${gap.skill}"`);

          return findRealCoursesWithWebSearch(gap, normalizedRole || 'yrkesrollen', userLocation)
            .then(courses => ({ gap, courses }));
        })
      );

      const batchDuration = Date.now() - batchStartTime;
      console.log(`✅ Batch ${batchIndex} completed in ${batchDuration}ms`);

      // Collect results
      batchResults.forEach((result, batchIndex) => {
        const globalIndex = i + batchIndex;
        if (result.status === 'fulfilled') {
          const { gap, courses } = result.value;
          console.log(`  ✅ [${globalIndex + 1}/${gaps.length}] Found ${courses.length} courses for "${gap.skill}"`);
          allSuggestions.push({
            skill: gap.skill,
            importance: gap.importance || 'important',
            reasoning: gap.reasoning || '',
            suggestions: courses
          });
        } else {
          console.error(`  ❌ [${globalIndex + 1}/${gaps.length}] Failed to find courses for "${batch[batchIndex].skill}":`, result.reason?.message || result.reason);
          // Add empty suggestion for failed searches
          allSuggestions.push({
            skill: batch[batchIndex].skill,
            importance: batch[batchIndex].importance || 'important',
            reasoning: batch[batchIndex].reasoning || '',
            suggestions: []
          });
        }
      });

      // Update processed count after batch
      await supabase
        .from('competence_analysis_jobs')
        .update({
          processed_gaps: Math.min(i + BATCH_SIZE, gaps.length)
        })
        .eq('id', jobId);
    }

    // Complete the job
    await supabase
      .from('competence_analysis_jobs')
      .update({
        status: 'completed',
        progress: 100,
        learning_suggestions: allSuggestions,
        completed_at: new Date().toISOString(),
        current_step: 'Analys klar!'
      })
      .eq('id', jobId);

    const totalCoursesFound = allSuggestions.reduce(
      (acc, s) => acc + s.suggestions.length,
      0
    );

    console.log('='.repeat(60));
    console.log(`✅ Job completed successfully with GPT-5!`);
    console.log(`   Project: ${OPENAI_PROJECT_ID ? 'cvbrev' : 'default'}`);
    console.log(`   Model: gpt-5-2025-08-07`);
    console.log(`   Courses found: ${totalCoursesFound}`);
    console.log('='.repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job processed successfully with GPT-5',
        model: 'gpt-5-2025-08-07',
        project: OPENAI_PROJECT_ID ? 'cvbrev' : 'default',
        coursesFound: totalCoursesFound
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Edge function error:', error);

    // Mark job as failed if we have a jobId
    if (jobId) {
      try {
        await supabase
          .from('competence_analysis_jobs')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
      } catch (e) {
        console.error('Could not update job status:', e);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Processing failed',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
