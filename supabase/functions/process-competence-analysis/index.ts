import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// Step 1: Analyze CV with GPT-5 (without web search)
async function analyzeWithGPT5(cvText: string, targetInfo: any) {
  const truncatedCV = cvText.substring(0, 8000);

  let targetPrompt = '';
  if (targetInfo.mode === 'role') {
    targetPrompt = `Målet är yrkesrollen "${targetInfo.targetRole}" i Sverige.`;
  } else {
    targetPrompt = `Målet är att matcha mot följande jobbannons: ${targetInfo.jobAdText?.substring(0, 4000)}`;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-5',
      reasoning: { effort: 'medium' },
      input: `Du är en svensk rekryteringsexpert. ${targetPrompt}

Analysera detta CV och identifiera:
1. Matchningspoäng (0-100) - var KRITISK
2. Sammanfattning av CV:t relaterat till målet
3. Relevanta kompetenser som personen har
4. ALLA kompetensgap som saknas för rollen (var noggrann!)

CV:
${truncatedCV}

Returnera JSON med följande struktur:
{
  "matchScore": number,
  "cvSummaryForTarget": string,
  "identifiedRelevantSkills": string[],
  "identifiedSkillGaps": [
    {
      "skill": string,
      "importance": "essential" | "important" | "nice-to-have",
      "reasoning": string
    }
  ]
}`,
      output_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GPT-5 analysis failed:', errorText);
    throw new Error(`GPT-5 analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.output_text);
}

// Step 2: Find REAL courses using GPT-5 with web_search
async function findRealCoursesWithWebSearch(gap: any, targetRole: string) {
  console.log(`Searching for REAL courses for: ${gap.skill}`);

  try {
    const searchQuery = `${gap.skill} kurs utbildning certifiering Sverige 2024 2025 online distans`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        reasoning: { effort: 'high' },
        tools: [
          {
            type: 'web_search',
            user_location: {
              type: 'approximate',
              approximate: {
                country: 'SE',
                city: 'Stockholm',
                region: 'Stockholm'
              }
            }
          }
        ],
        tool_choice: 'required',
        include: ['web_search_call.action.sources'],
        input: `Sök efter RIKTIGA kurser och utbildningar för kompetensen "${gap.skill}" som är relevant för ${targetRole}.

VIKTIGT:
1. Hitta ENDAST kurser som FAKTISKT existerar med FUNGERANDE länkar
2. Inkludera både svenska och internationella alternativ
3. Blanda gratis och betalda alternativ
4. Inkludera olika format: traditionella kurser, online-plattformar, certifieringar, YouTube-tutorials
5. Prioritera kurser som startar snart eller är tillgängliga direkt

Sök brett och inkludera:
- YH-utbildningar och Komvux
- Internationella plattformar (Coursera, Udemy, LinkedIn Learning)
- Branschcertifieringar (Microsoft, AWS, Google, etc)
- YouTube och gratis resurser
- Intensivkurser och bootcamps

För varje kurs, extrahera:
- Exakt kursnnamn
- Utbildningsanordnare
- DIREKT LÄNK till kurssidan (KRITISKT!)
- Längd/duration
- Kostnad
- Startdatum eller tillgänglighet
- Studieformat (distans/campus/självstudier)
- Kort beskrivning

Returnera 3-5 av de mest relevanta kurserna i JSON-format.`,
        output_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.error('GPT-5 web search failed:', response.status);
      return [];
    }

    const data = await response.json();

    // Extrahera kurser från svaret
    let courses = [];
    try {
      const result = JSON.parse(data.output_text);

      // Hantera olika möjliga strukturer i svaret
      if (result.courses && Array.isArray(result.courses)) {
        courses = result.courses;
      } else if (result.suggestions && Array.isArray(result.suggestions)) {
        courses = result.suggestions;
      } else if (Array.isArray(result)) {
        courses = result;
      }

      // Extrahera källor och URL:er från web_search
      const sources = data.web_search_call?.action?.sources || [];
      const urlMap = new Map();
      sources.forEach((source: any) => {
        if (source.url && source.title) {
          urlMap.set(source.title.toLowerCase(), source.url);
        }
      });

      // Matcha kurser med verkliga URL:er från källor
      courses = courses.map((course: any) => {
        // Försök hitta matchande URL från källor
        let directUrl = course.direct_url || course.url || '';

        // Om ingen direkt URL, försök matcha via titel
        if (!directUrl && course.provider) {
          const searchKey = `${course.provider} ${course.title}`.toLowerCase();
          for (const [title, url] of urlMap.entries()) {
            if (title.includes(course.provider.toLowerCase()) ||
                searchKey.includes(title)) {
              directUrl = url;
              break;
            }
          }
        }

        return {
          type: course.type || 'course',
          title: course.title || course.name || 'Okänd kurs',
          provider: course.provider || course.organization || 'Okänd anordnare',
          direct_url: directUrl,
          duration: course.duration || course.length || 'Ej angivet',
          cost: course.cost || course.price || 'Kontakta anordnare',
          start_date: course.start_date || course.starts || 'Flexibel start',
          study_format: course.study_format || course.format || 'Se kurssida',
          location: course.location || (course.study_format === 'Campus' ? 'Se kurssida' : 'Online'),
          description: course.description || '',
          priority: gap.importance === 'essential' ? 'essential' : 'recommended',
          relevance: `Direkt relevant för ${gap.skill}`,
          is_verified: !!directUrl && directUrl.startsWith('http')
        };
      });

      // Filtrera bort kurser utan URL om vi har några med URL
      const coursesWithUrls = courses.filter((c: any) => c.is_verified);
      if (coursesWithUrls.length > 0) {
        courses = coursesWithUrls;
      }

      console.log(`Found ${courses.length} courses with${coursesWithUrls.length > 0 ? ' verified' : ''} URLs`);

    } catch (parseError) {
      console.error('Failed to parse course results:', parseError);
      console.log('Raw output:', data.output_text);
    }

    return courses.slice(0, 5); // Max 5 kurser per gap

  } catch (error) {
    console.error(`Failed to get courses for ${gap.skill}:`, error);
  }

  return [];
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
        current_step: 'Analyserar med GPT-5...'
      })
      .eq('id', jobId);

    // Step 1: Analysis with GPT-5
    console.log('Starting GPT-5 analysis...');
    let analysisResult: any;

    try {
      analysisResult = await analyzeWithGPT5(cvData.cv_text, {
        mode: job.analysis_mode,
        targetRole: job.target_role,
        jobAdText: job.job_ad_text
      });
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
        match_score: analysisResult.matchScore || 0,
        cv_summary: analysisResult.cvSummaryForTarget || '',
        identified_skills: analysisResult.identifiedRelevantSkills || [],
        skill_gaps: analysisResult.identifiedSkillGaps || [],
        total_gaps: analysisResult.identifiedSkillGaps?.length || 0,
        processed_gaps: 0,
        current_step: 'Söker kurser med GPT-5 web search...'
      })
      .eq('id', jobId);

    // Step 2: Find courses with web search
    const gaps = analysisResult.identifiedSkillGaps || [];
    const allSuggestions: any[] = [];

    // Process max 5 gaps (to avoid timeout)
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
        importance: gap.importance,
        reasoning: gap.reasoning,
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

    console.log(`Job completed successfully. Found ${totalCoursesFound} real courses.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job processed successfully',
        coursesFound: totalCoursesFound,
        verifiedCourses: allSuggestions.reduce(
          (acc, s) => acc + s.suggestions.filter((c: any) => c.is_verified).length,
          0
        )
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