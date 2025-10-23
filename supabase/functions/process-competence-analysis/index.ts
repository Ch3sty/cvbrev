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
async function findRealCoursesWithWebSearch(gap: any, targetRole: string) {
  console.log(`🔍 Searching for courses: ${gap.skill}`);

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
          search_context_size: 'high',
          user_location: {
            type: 'approximate',
            approximate: {
              country: 'SE',
              city: 'Stockholm',
              region: 'Stockholm'
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
- Returnera ALLTID valid JSON - ingenting annat`
          },
          {
            role: 'user',
            content: `Sök efter kurser för "${gap.skill}" relevant för ${targetRole}.

Returnera ENDAST denna JSON-struktur (inget annat):
{
  "courses": [
    {
      "title": "Kursnamn",
      "provider": "Anordnare",
      "direct_url": "https://...",
      "duration": "X veckor/månader",
      "cost": "Kostnad eller Gratis",
      "description": "Kort beskrivning"
    }
  ]
}`
          }
        ],
        // REMOVED response_format since it's not supported with web_search
        max_tokens: 2000
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

    // ========================================================================
    // PARALLEL BATCH PROCESSING LOGIC
    // ========================================================================
    const batchStartIndex = requestBody.batchStartIndex || 0;
    const batchSize = requestBody.batchSize || 5; // Default 5 gaps per worker
    const isParallel = requestBody.isParallel || false;
    const workerIndex = requestBody.workerIndex ?? 0;
    const isBatchContinuation = batchStartIndex > 0 && !isParallel;

    console.log(`📦 Processing mode: ${isParallel ? `PARALLEL worker ${workerIndex}` : (isBatchContinuation ? `Sequential continuation from ${batchStartIndex}` : 'Initial run')}`);
    console.log(`📦 Batch: start=${batchStartIndex}, size=${batchSize}`);

    let analysisResult: any;
    let gaps: any[] = [];

    if (isParallel) {
      // Parallel mode - use existing analysis results from job
      console.log(`📋 PARALLEL WORKER ${workerIndex}: Loading existing analysis from job...`);

      if (!job.skill_gaps || job.skill_gaps.length === 0) {
        throw new Error('No skill gaps found in job - parallel workers need pre-analyzed data');
      }

      analysisResult = {
        matchScore: job.match_score,
        cvSummaryForTarget: job.cv_summary,
        identifiedRelevantSkills: job.identified_skills,
        identifiedSkillGaps: job.skill_gaps
      };

      gaps = job.skill_gaps;

      // Register this worker as active
      await supabase.rpc('increment_active_workers', { p_job_id: jobId });

      console.log(`📊 Worker ${workerIndex}: Will process gaps ${batchStartIndex}-${Math.min(batchStartIndex + batchSize, gaps.length)} of ${gaps.length}`);

    } else if (isBatchContinuation) {
      // Sequential batch continuation - use existing analysis results
      console.log('📋 Loading existing analysis results from job...');

      if (!job.skill_gaps || job.skill_gaps.length === 0) {
        throw new Error('No skill gaps found in job - cannot continue batch');
      }

      analysisResult = {
        matchScore: job.match_score,
        cvSummaryForTarget: job.cv_summary,
        identifiedRelevantSkills: job.identified_skills,
        identifiedSkillGaps: job.skill_gaps
      };

      gaps = job.skill_gaps;

      console.log(`📊 Continuing from batch ${batchStartIndex}, Total gaps: ${gaps.length}`);

    } else {
      // Initial run - update status and fetch CV
      await supabase
        .from('competence_analysis_jobs')
        .update({
          status: 'analyzing',
          progress: 10,
          current_step: 'Hämtar CV-text...'
        })
        .eq('id', jobId);

      // Get CV text
      const { data: cvData, error: cvError } = await supabase
        .from('cv_texts')
        .select('cv_text')
        .eq('id', job.cv_id)
        .single();

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

      try {
        analysisResult = await analyzeCV(cvData.cv_text, {
          mode: job.analysis_mode,
          targetRole: job.target_role,
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

      gaps = analysisResult.identifiedSkillGaps || [];

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
          total_gaps: gaps.length,
          processed_gaps: 0,
          current_step: 'Söker kurser med web search...'
        })
        .eq('id', jobId);
    }

    // Step 2: Find courses (PARALLEL/BATCH PROCESSING)
    console.log('🎓 Starting course search with web search...');

    const batchEndIndex = Math.min(batchStartIndex + batchSize, gaps.length);
    const gapsToProcess = gaps.slice(batchStartIndex, batchEndIndex);

    const workerLabel = isParallel ? `Worker ${workerIndex}` : 'Batch';
    console.log(`📦 ${workerLabel}: Processing gaps ${batchStartIndex + 1}-${batchEndIndex} of ${gaps.length}`);

    const newSuggestions: any[] = [];

    for (let i = 0; i < gapsToProcess.length; i++) {
      const gap = gapsToProcess[i];
      const globalIndex = batchStartIndex + i;

      // Update progress using atomic function
      await supabase.rpc('update_worker_progress', {
        p_job_id: jobId,
        p_current_step: `Söker kurser för: "${gap.skill}" (${globalIndex + 1}/${gaps.length})...`,
        p_processed_count: globalIndex + 1
      });

      const courses = await findRealCoursesWithWebSearch(
        gap,
        job.target_role || 'yrkesrollen'
      );

      newSuggestions.push({
        skill: gap.skill,
        importance: gap.importance || 'important',
        reasoning: gap.reasoning || '',
        suggestions: courses
      });
    }

    // Merge suggestions using atomic function
    await supabase.rpc('merge_learning_suggestions', {
      p_job_id: jobId,
      p_new_suggestions: newSuggestions,
      p_processed_count: batchEndIndex
    });

    console.log(`📊 ${workerLabel}: Processed ${newSuggestions.length} gaps (${batchStartIndex + 1}-${batchEndIndex})`);

    // Handle completion based on mode
    if (isParallel) {
      // Parallel mode - mark worker as complete and check if all workers done
      await supabase.rpc('complete_worker', { p_job_id: jobId });
      console.log(`✅ Worker ${workerIndex} completed. Atomic check will set job to 'completed' if all workers done.`);
    } else {
      // Sequential mode - handle next batch or completion
      const hasMoreBatches = batchEndIndex < gaps.length;
      const nextBatchIndex = hasMoreBatches ? batchEndIndex : null;
      const finalStatus = hasMoreBatches ? 'partial_complete' : 'completed';
      const finalProgress = hasMoreBatches
        ? 40 + Math.round((batchEndIndex / gaps.length) * 50)
        : 100;

      console.log(`📦 Next batch: ${nextBatchIndex !== null ? `Start at ${nextBatchIndex}` : 'None (complete)'}`);

      await supabase
        .from('competence_analysis_jobs')
        .update({
          status: finalStatus,
          progress: finalProgress,
          next_batch_index: nextBatchIndex,
          completed_at: hasMoreBatches ? null : new Date().toISOString(),
          current_step: hasMoreBatches
            ? `Batch klar! ${batchEndIndex}/${gaps.length} gaps processade...`
            : 'Analys klar!'
        })
        .eq('id', jobId);
    }

    // Get final count for response
    const { data: finalJob } = await supabase
      .from('competence_analysis_jobs')
      .select('learning_suggestions')
      .eq('id', jobId)
      .single();

    const totalCoursesFound = (finalJob?.learning_suggestions || []).reduce(
      (acc: number, s: any) => acc + (s.suggestions?.length || 0),
      0
    );

    console.log('='.repeat(60));
    console.log(`✅ ${workerLabel} completed with GPT-5!`);
    console.log(`   Project: ${OPENAI_PROJECT_ID ? 'cvbrev' : 'default'}`);
    console.log(`   Model: gpt-5-2025-08-07`);
    console.log(`   Gaps processed in this batch: ${batchEndIndex - batchStartIndex}`);
    console.log(`   Total courses found so far: ${totalCoursesFound}`);
    if (isParallel) {
      console.log(`   Worker ${workerIndex} finished processing gaps ${batchStartIndex}-${batchEndIndex}`);
    }
    console.log('='.repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        message: isParallel
          ? `Worker ${workerIndex} processed gaps ${batchStartIndex + 1}-${batchEndIndex} successfully`
          : `Batch processed successfully`,
        model: 'gpt-5-2025-08-07',
        project: OPENAI_PROJECT_ID ? 'cvbrev' : 'default',
        coursesFound: totalCoursesFound,
        gapsProcessed: batchEndIndex,
        totalGaps: gaps.length,
        workerIndex: isParallel ? workerIndex : null,
        isParallel
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
