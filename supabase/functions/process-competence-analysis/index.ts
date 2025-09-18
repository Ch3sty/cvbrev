import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); // Using regular API key
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// Step 1: Analyze CV with GPT-4o (without web search)
async function analyzeCV(cvText: string, targetInfo: any) {
  const truncatedCV = cvText.substring(0, 8000);

  let targetPrompt = '';
  if (targetInfo.mode === 'role') {
    targetPrompt = `Målet är yrkesrollen "${targetInfo.targetRole}" i Sverige.`;
  } else {
    targetPrompt = `Målet är att matcha mot följande jobbannons: ${targetInfo.jobAdText?.substring(0, 4000)}`;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du är en svensk rekryteringsexpert. ${targetPrompt}

Analysera detta CV och identifiera:
1. Matchningspoäng (0-100) - var KRITISK och realistisk
2. Sammanfattning av CV:t relaterat till målet
3. Relevanta kompetenser som personen har
4. ALLA kompetensgap som saknas för rollen (var noggrann och identifiera både formella och informella kompetenser)

Returnera ENDAST JSON utan någon annan text.`
        },
        {
          role: 'user',
          content: `CV att analysera:\n${truncatedCV}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GPT-4o analysis failed:', errorText);
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Step 2: Find REAL courses using GPT-4o-search-preview with web_search
async function findRealCoursesWithWebSearch(gap: any, targetRole: string) {
  console.log(`Searching for REAL courses for: ${gap.skill}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
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
            content: `Du är en expert på utbildning och kompetensutveckling. Din uppgift är att hitta RIKTIGA kurser med FUNGERANDE länkar baserat på websökning.

VIKTIGT:
- Använd ENDAST information från websökningen
- Returnera ENDAST kurser med verkliga URL:er från sökresultaten
- Inkludera både svenska och internationella alternativ
- Prioritera aktuella kurser (2024-2025)
- Returnera JSON-format med strukturen nedan`
          },
          {
            role: 'user',
            content: `Sök efter kurser för kompetensen "${gap.skill}" som är relevant för ${targetRole}.

Hitta 3-5 kurser och returnera i denna JSON-struktur:
{
  "courses": [
    {
      "title": "Kursnamn",
      "provider": "Utbildningsanordnare",
      "direct_url": "https://...",
      "duration": "Längd",
      "cost": "Kostnad",
      "start_date": "Startdatum",
      "study_format": "Distans/Campus/Online",
      "location": "Plats",
      "description": "Kort beskrivning"
    }
  ]
}`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      console.error('Web search failed:', response.status);
      return [];
    }

    const data = await response.json();

    // Extrahera kurser och URL:er från svaret
    let courses = [];
    try {
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      // Extrahera annotations/citations om de finns
      const annotations = data.choices[0].message.annotations || [];
      const urlMap = new Map();

      annotations.forEach((annotation: any) => {
        if (annotation.type === 'url_citation' && annotation.url_citation) {
          const citation = annotation.url_citation;
          urlMap.set(citation.title?.toLowerCase(), citation.url);
        }
      });

      if (result.courses && Array.isArray(result.courses)) {
        courses = result.courses.map((course: any) => {
          // Verifiera att URL:en är riktig
          const hasValidUrl = course.direct_url &&
                             course.direct_url.startsWith('http') &&
                             !course.direct_url.includes('example.com');

          return {
            type: course.type || 'course',
            title: course.title || 'Okänd kurs',
            provider: course.provider || 'Okänd anordnare',
            direct_url: hasValidUrl ? course.direct_url : '',
            duration: course.duration || 'Se kurssida',
            cost: course.cost || 'Kontakta anordnare',
            start_date: course.start_date || 'Flexibel start',
            study_format: course.study_format || 'Se kurssida',
            location: course.location || 'Online',
            description: course.description || '',
            priority: gap.importance === 'essential' ? 'essential' : 'recommended',
            relevance: `Direkt relevant för ${gap.skill}`,
            is_verified: hasValidUrl
          };
        });

        // Filtrera endast kurser med verifierade URL:er
        const verifiedCourses = courses.filter((c: any) => c.is_verified);
        if (verifiedCourses.length > 0) {
          courses = verifiedCourses;
        }
      }

      console.log(`Found ${courses.length} courses for ${gap.skill}`);
    } catch (parseError) {
      console.error('Failed to parse course results:', parseError);
    }

    return courses.slice(0, 5);

  } catch (error) {
    console.error(`Failed to get courses for ${gap.skill}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const { jobId } = await req.json();
    console.log('Processing job:', jobId);

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('competence_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
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

    // Get CV text
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', job.cv_id)
      .single();

    if (cvError || !cvData) {
      console.error('CV not found:', cvError);
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
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update progress
    await supabase
      .from('competence_analysis_jobs')
      .update({
        progress: 20,
        current_step: 'Analyserar CV...'
      })
      .eq('id', jobId);

    // Step 1: Analysis with GPT-4o
    console.log('Starting CV analysis...');
    let analysisResult: any;

    try {
      analysisResult = await analyzeCV(cvData.cv_text, {
        mode: job.analysis_mode,
        targetRole: job.target_role,
        jobAdText: job.job_ad_text
      });

      // Ensure the result has the expected structure
      analysisResult = {
        matchScore: analysisResult.matchScore || analysisResult.match_score || 0,
        cvSummaryForTarget: analysisResult.cvSummaryForTarget || analysisResult.summary || '',
        identifiedRelevantSkills: analysisResult.identifiedRelevantSkills || analysisResult.relevant_skills || [],
        identifiedSkillGaps: analysisResult.identifiedSkillGaps || analysisResult.skill_gaps || []
      };

    } catch (analysisError: any) {
      console.error('Analysis failed:', analysisError);
      await supabase
        .from('competence_analysis_jobs')
        .update({
          status: 'failed',
          error_message: `Analys misslyckades: ${analysisError.message}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      throw analysisError;
    }

    console.log(`Analysis complete. Score: ${analysisResult.matchScore}%, Gaps: ${analysisResult.identifiedSkillGaps?.length}`);

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

    // Step 2: Find courses with web search
    const gaps = analysisResult.identifiedSkillGaps || [];
    const allSuggestions: any[] = [];

    // Process max 5 gaps to avoid timeout
    const gapsToProcess = gaps.slice(0, 5);

    for (let i = 0; i < gapsToProcess.length; i++) {
      const gap = gapsToProcess[i];

      // Update progress
      await supabase
        .from('competence_analysis_jobs')
        .update({
          processed_gaps: i + 1,
          progress: 40 + Math.round(((i + 1) / gapsToProcess.length) * 50),
          current_step: `Söker RIKTIGA kurser för: "${gap.skill}" (${i + 1}/${gapsToProcess.length})...`
        })
        .eq('id', jobId);

      // Get courses using web search
      const courses = await findRealCoursesWithWebSearch(
        gap,
        job.target_role || 'yrkesrollen'
      );

      allSuggestions.push({
        skill: gap.skill,
        importance: gap.importance || 'important',
        reasoning: gap.reasoning || '',
        suggestions: courses
      });
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
    const verifiedCourses = allSuggestions.reduce(
      (acc, s) => acc + s.suggestions.filter((c: any) => c.is_verified).length,
      0
    );

    console.log(`Job completed. Found ${totalCoursesFound} courses (${verifiedCourses} verified).`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job processed successfully',
        coursesFound: totalCoursesFound,
        verifiedCourses: verifiedCourses
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Edge function error:', error);

    // Mark job as failed
    if (req.body) {
      try {
        const { jobId } = await req.clone().json();
        if (jobId) {
          await supabase
            .from('competence_analysis_jobs')
            .update({
              status: 'failed',
              error_message: error.message || 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('id', jobId);
        }
      } catch (e) {
        console.error('Could not update job status:', e);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Processing failed',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});