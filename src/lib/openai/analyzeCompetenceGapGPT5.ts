// GPT-5 Competence Analysis using Responses API
import {
  createGPT5Response,
  extractJSONFromGPT5Response,
  calculateGPT5Cost,
  type GPT5ResponseInput
} from './gpt5-client';

// Import shared types
import type {
  IdentifiedSkill,
  MissingSkill,
  CompetenceAnalysisResult
} from './analyzeCompetenceGap';

type CompetenceAnalysisInput =
  | { mode: 'role'; cvText: string; targetRole: string; targetCountry: string; }
  | { mode: 'jobAd'; cvText: string; jobAdText: string; };

export async function analyzeCompetenceGapGPT5(
  input: CompetenceAnalysisInput
): Promise<CompetenceAnalysisResult> {

  const { mode, cvText } = input;
  const truncatedCV = cvText.substring(0, 6000); // Reduce input to speed up
  const modelToUse = "gpt-5-mini"; // Using mini for better speed/quality balance

  // Build target information
  let targetInfoPrompt: string;
  let targetDescriptionForOutput: string;

  if (mode === 'role') {
    targetInfoPrompt = `Målet är yrkesrollen "${input.targetRole}" specifikt i Sverige.
    Fokusera på de typiska svenska kompetenskraven, ansvarsområdena och obligatoriska svenska
    certifieringar, licenser eller formella utbildningskrav som är vanliga för denna roll i Sverige.`;
    targetDescriptionForOutput = `Yrkesroll: ${input.targetRole} i ${input.targetCountry}`;
  } else {
    const truncatedJobAd = input.jobAdText.substring(0, 4000);
    targetInfoPrompt = `Målet är att matcha mot följande specifika jobbannons från den svenska marknaden:

    """
    ${truncatedJobAd}
    """

    Analysera annonsen noggrant. Identifiera först de absolut nödvändiga kraven ("ska"-krav),
    sedan starkt önskvärda ("bör"-krav). Notera även eventuella krav på specifika svenska certifikat/utbildningar.`;
    targetDescriptionForOutput = `Jobbannons (förkortad)`;
  }

  // Build the comprehensive prompt with clear instructions
  const systemPrompt = `Du är en SVENSK rekryteringsexpert som specialiserat dig på den svenska arbetsmarknaden.

  ${targetInfoPrompt}

  Analysera följande CV noggrant:
  """
  ${truncatedCV}
  """

  KRITISKT VIKTIGT för svenska yrken:

  För MÅLARE måste du kontrollera:
  - Målargesäll-certifikat (branschstandard)
  - YH-utbildning inom måleri
  - Heta Arbeten-certifikat (för vissa jobb)
  - Asbestutbildning (för renovering)
  - Ställningsbyggnad-certifikat
  - B-körkort (ofta krav)
  - ADR-certifikat (för hantering av farliga ämnen)

  För FRONTEND UTVECKLARE måste du kontrollera:
  - Formell högskoleutbildning inom IT/datateknik (ofta krav i Sverige)
  - Kunskap om React, Angular eller Vue (branschstandard)
  - TypeScript (nästan alltid krav idag)
  - Git versionshantering
  - Agile/Scrum-erfarenhet
  - CI/CD pipeline-kunskap
  - Testning (Jest, Cypress etc)

  För andra yrken, identifiera BRANSCHSPECIFIKA certifikat och formella krav!

  Returnera JSON med följande struktur:

  1. matchScore: 0-100 (var REALISTISK - om personen saknar grundläggande formell utbildning/certifikat ska poängen vara LÅG)

  2. cvSummaryForTarget: KRITISK bedömning av vad som saknas för svensk arbetsmarknad

  3. identifiedRelevantSkills: Max 7 relevanta färdigheter med:
     - skill: Exakt färdighet
     - source_in_cv: Var den nämns i CV:t
     - relevance_to_target: "high"/"medium"/"low"

  4. identifiedSkillGaps: MINST 5-8 gap där du MÅSTE inkludera:
     a) ALLA formella utbildningar/certifikat som saknas (importance: "essential")
     b) Tekniska färdigheter som saknas (importance: "essential" eller "desirable")
     c) Branschspecifika krav som saknas

     Format:
     - skill: "Saknar [SPECIFIKT CERTIFIKAT/UTBILDNING]"
     - importance: "essential" för formella krav, "desirable" för önskvärda
     - reasoning: Förklara VARFÖR detta krävs i Sverige

  Exempel på gap för målare:
  {"skill": "Saknar Målargesäll-certifikat", "importance": "essential", "reasoning": "Branschstandard i Sverige för kvalificerade målare"}
  {"skill": "Saknar YH-utbildning måleri", "importance": "essential", "reasoning": "Formell utbildning som ofta krävs av svenska arbetsgivare"}
  {"skill": "Saknar Heta Arbeten-certifikat", "importance": "essential", "reasoning": "Lagkrav för många målerijobb i Sverige"}

  KRITISKT: Returnera ENDAST ren JSON utan kodblock eller förklaringar!
  Starta direkt med { och sluta med }
  Ingen kodblock-markup eller annan text!`;

  try {
    console.log(`Starting GPT-5 competence analysis for target: ${targetDescriptionForOutput}`);

    // Create timeout promise - 40s to give GPT-5 enough time for comprehensive analysis
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GPT-5 request timeout after 40s')), 40000)
    );

    // Make GPT-5 API call using instructions + input pattern
    const responsePromise = createGPT5Response({
      model: modelToUse,
      instructions: systemPrompt, // System instructions go here
      input: `Analysera detta CV och returnera JSON enligt instruktionerna:\n\n${truncatedCV}`,
      reasoning: {
        effort: 'low' // Low effort for faster response
      },
      text: {
        verbosity: 'low', // Low verbosity for faster response
        format: {
          type: 'json_schema',
          name: 'competence_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              matchScore: { type: 'number', minimum: 0, maximum: 100 },
              cvSummaryForTarget: { type: 'string' },
              identifiedRelevantSkills: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    skill: { type: 'string' },
                    source_in_cv: { type: 'string' },
                    relevance_to_target: { type: 'string', enum: ['high', 'medium', 'low'] }
                  },
                  required: ['skill', 'source_in_cv', 'relevance_to_target'],
                  additionalProperties: false
                }
              },
              identifiedSkillGaps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    skill: { type: 'string' },
                    importance: { type: 'string', enum: ['essential', 'desirable'] },
                    reasoning: { type: 'string' }
                  },
                  required: ['skill', 'importance', 'reasoning'],
                  additionalProperties: false
                }
              }
            },
            required: ['matchScore', 'cvSummaryForTarget', 'identifiedRelevantSkills', 'identifiedSkillGaps'],
            additionalProperties: false
          }
        }
      },
      max_output_tokens: 2500, // Increased to prevent JSON cutoff
      store: false // Don't store for privacy
    });

    // Race between request and timeout
    const response = await Promise.race([
      responsePromise,
      timeoutPromise
    ]) as Awaited<ReturnType<typeof createGPT5Response>>;

    console.log(`GPT-5 Response received. Output length: ${response.output_text?.length || 0}`);

    // Debug: Log the actual response text
    if (response.output_text) {
      console.log('GPT-5 raw text (first 500 chars):', response.output_text.substring(0, 500));
    }

    // Extract JSON from response
    const parsedResult = extractJSONFromGPT5Response(response);

    if (!parsedResult) {
      console.error("Failed to extract JSON from GPT-5 response. Raw text length:", response.output_text?.length);
      console.error("Full raw text:", response.output_text);
      throw new Error("Invalid JSON response from GPT-5");
    }

    // Additional logging to debug the parsed result
    console.log('Parsed result keys:', Object.keys(parsedResult));
    console.log('identifiedSkillGaps count:', parsedResult.identifiedSkillGaps?.length || 0);

    // Calculate cost
    const usage = response.usage;
    const calculatedCost = calculateGPT5Cost(
      modelToUse,
      usage.input_tokens,
      usage.output_tokens
    );

    console.log(`GPT-5 Usage: Input=${usage.input_tokens}, Output=${usage.output_tokens}, Cost=$${calculatedCost.toFixed(4)}`);

    // Build result with better error handling
    const finalResult: CompetenceAnalysisResult = {
      analysisType: 'competence',
      targetDescription: targetDescriptionForOutput,
      matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : null,
      cvSummaryForTarget: parsedResult.cvSummaryForTarget || "Sammanfattning kunde inte genereras.",
      identifiedRelevantSkills: Array.isArray(parsedResult.identifiedRelevantSkills) ? parsedResult.identifiedRelevantSkills : [],
      identifiedSkillGaps: Array.isArray(parsedResult.identifiedSkillGaps) ? parsedResult.identifiedSkillGaps : [],
      model: modelToUse,
      tokens: {
        prompt: usage.input_tokens,
        completion: usage.output_tokens,
        total: usage.total_tokens
      },
      cost: calculatedCost
    };

    // Log if we're missing critical data
    if (!Array.isArray(parsedResult.identifiedSkillGaps) || parsedResult.identifiedSkillGaps.length === 0) {
      console.warn('WARNING: No skill gaps identified in GPT-5 response. Check if response format is correct.');
      console.warn('Parsed result structure:', JSON.stringify(parsedResult, null, 2).substring(0, 500));
    }

    console.log(`GPT-5 analysis successful. Score: ${finalResult.matchScore}%. Gaps: ${finalResult.identifiedSkillGaps.length}`);

    // Log essential gaps for debugging
    const essentialGaps = finalResult.identifiedSkillGaps.filter(g => g.importance === 'essential');
    if (essentialGaps.length > 0) {
      console.log('Essential gaps identified:', essentialGaps.map(g => g.skill).join(', '));
    }

    return finalResult;

  } catch (error: any) {
    console.error(`GPT-5 competence analysis error: ${error.message}`);
    throw new Error(`GPT-5 analysis failed: ${error.message}`);
  }
}

// Generate learning suggestions using GPT-5 with web search
export async function generateLearningSuggestionsGPT5(
  gap: MissingSkill,
  targetRole: string
): Promise<any[]> {

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not configured');
    return [];
  }

  try {
    console.log(`Using GPT-5 Responses API with web_search tool for: ${gap.skill} (${targetRole})`);

    // Use GPT-5 Responses API with web_search tool as per documentation
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5', // Use GPT-5 directly
        tools: [
          {
            type: 'web_search' // Enable web search tool
          }
        ],
        input: `Sök på webben och hitta 2 konkreta utbildningar för kompetensen "${gap.skill}" som krävs för att jobba som ${targetRole} i Sverige.

Ge mig VERKLIGA kurser med RIKTIGA länkar från webben.

Returnera som JSON:
{
  "courses": [
    {
      "type": "course" eller "certification",
      "title": "Exakt kursnamn från webben",
      "provider": "Verklig utbildningsanordnare",
      "direct_url": "Faktisk URL till kursen",
      "duration": "Kurslängd",
      "cost": "Kostnad",
      "start_date": "När kursen startar",
      "study_format": "Distans/Campus/Hybrid",
      "priority": "essential",
      "description": "Vad kursen handlar om"
    }
  ]
}`,
        text: {
          format: {
            type: 'json_object'
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`GPT-5 Responses API error: ${response.status}`, errorData);

      // Try GPT-5 with different approach
      console.log('Trying GPT-5 with alternative format...');
      return await tryGPT5Alternative(gap, targetRole, apiKey);
    }

    const data = await response.json();
    console.log('GPT-5 raw response:', JSON.stringify(data).substring(0, 500));

    // Extract output from GPT-5 response
    let outputText = '';
    if (data.output) {
      // GPT-5 Responses API returns output array
      if (Array.isArray(data.output)) {
        data.output.forEach((item: any) => {
          if (item.content) {
            item.content.forEach((content: any) => {
              if (content.text) {
                outputText += content.text;
              }
            });
          }
        });
      } else if (typeof data.output === 'string') {
        outputText = data.output;
      }
    } else if (data.output_text) {
      outputText = data.output_text;
    }

    if (!outputText) {
      console.warn('No content from GPT-5');
      return [];
    }

    try {
      const parsed = JSON.parse(outputText);
      let courses = parsed.courses || [];

      if (!Array.isArray(courses) || courses.length === 0) {
        console.warn('No courses in GPT-5 response');
        return [];
      }

      // Return courses from GPT-5 web search
      courses = courses.map((course: any) => ({
        type: course.type || 'course',
        title: course.title || `Kurs inom ${gap.skill}`,
        provider: course.provider || 'Se kursinformation',
        direct_url: course.direct_url || '#',
        duration: course.duration || 'Se kursinformation',
        cost: course.cost || 'Se kursinformation',
        start_date: course.start_date || 'Se kursinformation',
        study_format: course.study_format || 'Se kursinformation',
        priority: course.priority || 'essential',
        description: course.description || '',
        relevance: `Relevant för ${gap.skill}`,
        search_keywords: [gap.skill, targetRole],
        language: 'sv'
      })).slice(0, 2);

      console.log(`GPT-5 found ${courses.length} real courses via web search`);
      return courses;

    } catch (parseError) {
      console.error('Failed to parse GPT-5 response:', parseError);
      console.error('Raw output:', outputText);
      return [];
    }

  } catch (error: any) {
    console.error(`GPT-5 web search failed: ${error.message}`);
    return [];
  }
}

// Try alternative GPT-5 approach
async function tryGPT5Alternative(
  gap: MissingSkill,
  targetRole: string,
  apiKey: string
): Promise<any[]> {
  try {
    console.log('Trying GPT-5-mini with web search...');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        tools: [{ type: 'web_search' }],
        input: `Sök på webben efter utbildningar för ${gap.skill} för ${targetRole} i Sverige. Ge 2 konkreta kurser med länkar.`,
        text: {
          verbosity: 'low'
        }
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Try to extract course information from the response
    // Even if not in perfect JSON format
    const text = JSON.stringify(data);
    const courses = [];

    // Basic extraction logic
    if (text.includes('http')) {
      courses.push({
        type: 'course',
        title: `Utbildning inom ${gap.skill}`,
        provider: 'Se information',
        direct_url: '#',
        duration: 'Varierar',
        cost: 'Se information',
        start_date: 'Löpande',
        study_format: 'Varierar',
        priority: 'essential',
        description: `Relevant för ${targetRole}`,
        relevance: `För ${gap.skill}`,
        search_keywords: [gap.skill, targetRole],
        language: 'sv'
      });
    }

    return courses;
  } catch (error) {
    console.error('GPT-5 alternative failed:', error);
    return [];
  }
}

// REMOVED - Only use GPT-5 with web search
/*async function fallbackToGPT4o(
  gap: MissingSkill,
  targetRole: string,
  apiKey: string
): Promise<any[]> {
  console.log('Using GPT-4o fallback...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Du är en expert på svenska yrkesutbildningar. Ge konkreta förslag på verkliga kurser.'
        },
        {
          role: 'user',
          content: `Ge 2 konkreta utbildningar för "${gap.skill}" för ${targetRole} i Sverige. Returnera som JSON med courses array.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.5,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    const courses = (parsed.courses || []).slice(0, 2);
    return courses.map((c: any) => ({
      ...c,
      relevance: `Relevant för ${gap.skill}`,
      search_keywords: [gap.skill, targetRole],
      language: 'sv'
    }));
  } catch {
    return [];
  }
}*/

// Helper function to validate URLs (no fixing, just validation)
function validateUrl(url: string | undefined): string {
  // Return URL as-is if valid, otherwise empty string
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url;
  }
  return '#';
}

// Generate provider-specific URLs
function generateProviderUrl(provider: string, targetRole: string): string {
  const providerLower = provider.toLowerCase();

  // Map of known providers to their URLs
  const providerUrls: Record<string, string> = {
    'bya': 'https://bya.se/utbildning/vaktarutbildning/',
    'bevakningsbranschens': 'https://bya.se/utbildning/',
    'karolinska': 'https://education.ki.se/',
    'ki': 'https://education.ki.se/',
    'yrkeshögskolan': 'https://www.yrkeshogskolan.se/hitta-utbildning/',
    'yh': 'https://www.yrkeshogskolan.se/hitta-utbildning/',
    'arbetsförmedlingen': 'https://arbetsformedlingen.se/for-arbetssokande/yrken-och-studier/hitta-utbildningar',
    'folkuniversitetet': 'https://www.folkuniversitetet.se/kurser-utbildningar/',
    'kth': 'https://www.kth.se/utbildning',
    'stockholms universitet': 'https://www.su.se/utbildning',
    'högskolan i gävle': 'https://www.hig.se/utbildning',
    'hig': 'https://www.hig.se/utbildning',
    'sophiahemmet': 'https://www.shh.se/utbildning',
    'mäklarsamfundet': 'https://www.maklarsamfundet.se/utbildning',
    'fastighetsinspektionen': 'https://www.fmi.se/',
    'fmi': 'https://www.fmi.se/registrering/'
  };

  // Check if provider matches any known provider
  for (const [key, url] of Object.entries(providerUrls)) {
    if (providerLower.includes(key)) {
      return url;
    }
  }

  // Role-specific defaults
  const roleLower = targetRole.toLowerCase();
  if (roleLower.includes('väktare')) {
    return 'https://bya.se/utbildning/vaktarutbildning/';
  } else if (roleLower.includes('sjuksköterska')) {
    return 'https://education.ki.se/programme-syllabus/2UK21';
  } else if (roleLower.includes('fastighetsmäklare') || roleLower.includes('mäklare')) {
    return 'https://www.hig.se/utbildning/program/fagbyg';
  }

  // Default to YH search
  return 'https://www.yrkeshogskolan.se/hitta-utbildning/';
}

// REMOVED - No hardcoded courses! GPT-4o must search the web
function generateRoleSpecificCourses(gap: MissingSkill, targetRole: string): any[] {
  // Return empty array - no hardcoded data!
  return [];
  /*const roleLower = targetRole.toLowerCase();
  const skillLower = gap.skill.toLowerCase();

  // Väktare-specific courses
  if (roleLower.includes('väktare') || roleLower.includes('bevakn')) {
    return [
      {
        type: 'certification',
        title: 'Grundutbildning Väktare',
        provider: 'BYA - Bevakningsbranschens yrkes- och arbetsmiljönämnd',
        direct_url: 'https://bya.se/utbildning/vaktarutbildning/',
        duration: '2-3 veckor',
        cost: 'ca 15 000 kr',
        start_date: 'Löpande starter',
        study_format: 'Campus + Distans',
        priority: 'essential',
        description: 'Grundutbildning för att arbeta som väktare. Inkluderar juridik, konflikthantering och första hjälpen.',
        relevance: 'Obligatorisk certifiering för väktare',
        search_keywords: ['väktare', 'BYA', 'bevakningsutbildning'],
        language: 'sv'
      },
      {
        type: 'course',
        title: 'Fördjupning i konflikthantering',
        provider: 'Folkuniversitetet',
        direct_url: 'https://www.folkuniversitetet.se/kurser-utbildningar/arbete-naringsliv/ledarskap-kommunikation/konflikthantering/',
        duration: '2 dagar',
        cost: '4 900 kr',
        start_date: 'Se schema',
        study_format: 'Campus',
        priority: 'recommended',
        description: 'Lär dig hantera konflikter professionellt i yrkeslivet',
        relevance: 'Viktig komplettering för väktare',
        search_keywords: ['konflikthantering', 'väktare'],
        language: 'sv'
      }
    ];
  }

  // Sjuksköterska-specific courses
  if (roleLower.includes('sjuksköterska') || roleLower.includes('nurse')) {
    return [
      {
        type: 'education',
        title: 'Sjuksköterskeprogrammet',
        provider: 'Karolinska Institutet',
        direct_url: 'https://education.ki.se/programme-syllabus/2UK21',
        duration: '3 år',
        cost: 'CSN-berättigad',
        start_date: 'HT 2025',
        study_format: 'Campus',
        priority: 'essential',
        description: 'Legitimationsgrundande sjuksköterskeutbildning',
        relevance: 'Krävs för legitimation som sjuksköterska',
        search_keywords: ['sjuksköterska', 'KI', 'legitimation'],
        language: 'sv'
      },
      {
        type: 'course',
        title: 'Specialistutbildning - Akutsjukvård',
        provider: 'Sophiahemmet Högskola',
        direct_url: 'https://www.shh.se/utbildning/specialistutbildning-for-sjukskoterskor',
        duration: '1 år',
        cost: 'CSN-berättigad',
        start_date: 'HT 2025',
        study_format: 'Campus + VFU',
        priority: 'recommended',
        description: 'Specialisering inom akutsjukvård för legitimerade sjuksköterskor',
        relevance: 'Ger specialistkompetens inom akutsjukvård',
        search_keywords: ['specialistsjuksköterska', 'akutsjukvård'],
        language: 'sv'
      }
    ];
  }

  // Fastighetsmäklare-specific courses
  if (roleLower.includes('fastighetsmäklare') || roleLower.includes('mäklare')) {
    return [
      {
        type: 'education',
        title: 'Fastighetsmäklarprogrammet',
        provider: 'Högskolan i Gävle',
        direct_url: 'https://www.hig.se/utbildning/program/fagbyg',
        duration: '2 år',
        cost: 'CSN-berättigad',
        start_date: 'HT 2025',
        study_format: 'Campus + Distans',
        priority: 'essential',
        description: 'Högskoleprogram för blivande fastighetsmäklare',
        relevance: 'Ger behörighet för registrering som fastighetsmäklare',
        search_keywords: ['fastighetsmäklare', 'mäklarutbildning'],
        language: 'sv'
      },
      {
        type: 'certification',
        title: 'FMI Auktorisation',
        provider: 'Fastighetsmäklarinspektionen',
        direct_url: 'https://www.fmi.se/registrering/',
        duration: 'Efter utbildning',
        cost: '2 800 kr',
        start_date: 'Vid ansökan',
        study_format: 'Examination',
        priority: 'essential',
        description: 'Registrering hos FMI för att få arbeta som mäklare',
        relevance: 'Lagkrav för att arbeta som fastighetsmäklare',
        search_keywords: ['FMI', 'mäklarregistrering'],
        language: 'sv'
      }
    ];
  }

  // IT/Tech specific courses
  if (roleLower.includes('utvecklare') || roleLower.includes('programmerare') || skillLower.includes('programmering')) {
    return [
      {
        type: 'course',
        title: 'Webbutvecklare .NET',
        provider: 'Yrkeshögskolan - EC Utbildning',
        direct_url: 'https://ecutbildning.se/utbildningar/webbutvecklare-net/',
        duration: '2 år',
        cost: 'CSN-berättigad',
        start_date: 'HT 2025',
        study_format: 'Distans',
        priority: 'essential',
        description: 'YH-utbildning inom webbutveckling med .NET och C#',
        relevance: `Direkt relevant för ${gap.skill}`,
        search_keywords: ['webbutvecklare', '.NET', 'YH'],
        language: 'sv'
      },
      {
        type: 'course',
        title: 'Fullstack JavaScript Developer',
        provider: 'Chas Academy',
        direct_url: 'https://chasacademy.se/program/fullstack-javascript',
        duration: '2 år',
        cost: 'CSN-berättigad',
        start_date: 'VT 2025',
        study_format: 'Hybrid',
        priority: 'essential',
        description: 'YH-utbildning inom fullstack JavaScript utveckling',
        relevance: 'Modern webbutveckling med JavaScript',
        search_keywords: ['JavaScript', 'fullstack', 'YH'],
        language: 'sv'
      }
    ];
  }

  // Generic YH courses as fallback
  const encodedSkill = encodeURIComponent(gap.skill);
  return [
    {
      type: 'course',
      title: `YH-utbildning inom ${gap.skill}`,
      provider: 'Yrkeshögskolan',
      direct_url: `https://www.yrkeshogskolan.se/hitta-utbildning/?q=${encodedSkill}`,
      duration: '1-2 år',
      cost: 'CSN-berättigad',
      start_date: 'Se YH-portalen',
      study_format: 'Varierar',
      priority: 'essential',
      description: `Yrkeshögskoleutbildning för ${gap.skill}`,
      relevance: `Direkt relevant för ${targetRole}`,
      search_keywords: [gap.skill, 'YH', targetRole],
      language: 'sv'
    },
    {
      type: 'course',
      title: `Arbetsmarknadsutbildning - ${gap.skill}`,
      provider: 'Arbetsförmedlingen',
      direct_url: 'https://arbetsformedlingen.se/for-arbetssokande/yrken-och-studier/hitta-utbildningar',
      duration: '3-6 månader',
      cost: 'Kostnadsfri',
      start_date: 'Kontakta AF',
      study_format: 'Varierar',
      priority: 'recommended',
      description: `Arbetsmarknadsutbildning inom ${gap.skill}`,
      relevance: `För omställning till ${targetRole}`,
      search_keywords: [gap.skill, 'arbetsförmedlingen'],
      language: 'sv'
    }
  ];*/
}

// Parse web search content with citations
function parseWebSearchContent(
  content: string,
  annotations: any[],
  gap: MissingSkill,
  targetRole: string
): any[] {
  const suggestions = [];

  // Build URL map from annotations
  const urlsByIndex = new Map<number, { url: string; title: string }>();
  annotations.forEach(ann => {
    if (ann.type === 'url_citation' && ann.url_citation) {
      const { url, title, start_index, end_index } = ann.url_citation;
      // Store by start index for easier lookup
      urlsByIndex.set(start_index, { url, title });
    }
  });

  console.log(`Found ${urlsByIndex.size} URL citations in web search results`);

  // Look for numbered course listings (1., 2., etc.)
  const coursePattern = /\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/g;
  const courseMatches = Array.from(content.matchAll(coursePattern));

  for (let i = 0; i < Math.min(2, courseMatches.length); i++) {
    const courseBlock = courseMatches[i][1];

    // Extract course title and provider
    let title = '';
    let provider = '';
    let courseUrl = '';

    // Try to extract provider and course name from patterns like:
    // "Karolinska Institutet – Sjuksköterskeprogrammet"
    // "BYA - Väktarutbildning"
    const titleMatch = courseBlock.match(/^(.+?)\s*[–\-]\s*(.+)/m);
    if (titleMatch) {
      provider = titleMatch[1].trim();
      title = titleMatch[2].trim();
    } else {
      // Fallback: use first line as title
      const firstLine = courseBlock.split('\n')[0];
      title = firstLine.replace(/^[\s\*\-]+/, '').trim();
      provider = 'Se utbildningsportal';
    }

    // Find URL that appears in this course block
    const blockStartIndex = content.indexOf(courseBlock);
    let closestUrl = '';
    let closestDistance = Infinity;

    // Find the URL citation closest to this course block
    for (const [index, urlInfo] of urlsByIndex) {
      if (index >= blockStartIndex && index < blockStartIndex + courseBlock.length + 100) {
        const distance = index - blockStartIndex;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestUrl = urlInfo.url;
        }
      }
    }

    courseUrl = closestUrl || '';

    // Extract duration if mentioned
    const durationMatch = courseBlock.match(/Längd:\s*([^\n]+)/i) ||
                         courseBlock.match(/(\d+\s*(?:år|månader|veckor|dagar))/i);
    const duration = durationMatch ? durationMatch[1].trim() : '6-12 månader';

    // Extract cost if mentioned
    const costMatch = courseBlock.match(/Kostnad:\s*([^\n]+)/i) ||
                     courseBlock.match(/Pris:\s*([^\n]+)/i);
    const cost = costMatch ? costMatch[1].trim() : 'Se anordnare';

    // Only add if we have meaningful content
    if (title && title !== '') {
      suggestions.push({
        type: i === 0 ? 'course' : 'certification',
        title: title.substring(0, 100), // Limit length
        provider: provider,
        relevance: `Utvecklar kompetens inom ${gap.skill}`,
        search_keywords: [gap.skill, targetRole],
        direct_url: courseUrl || generateSearchUrl(title, provider),
        duration: duration,
        cost: cost,
        priority: gap.importance === 'essential' ? 'essential' : 'recommended',
        language: 'sv'
      });
    }
  }

  // If no structured courses found, but we have URLs, use them
  if (suggestions.length === 0 && urlsByIndex.size > 0) {
    let count = 0;
    for (const [, urlInfo] of urlsByIndex) {
      if (count >= 2) break;

      // Skip generic domains
      if (urlInfo.url.includes('google.') || urlInfo.url.includes('bing.')) continue;

      suggestions.push({
        type: count === 0 ? 'course' : 'certification',
        title: urlInfo.title || `Utbildning inom ${gap.skill}`,
        provider: extractProviderFromUrl(urlInfo.url),
        relevance: `Relevant utbildning för ${targetRole}`,
        search_keywords: [gap.skill, targetRole],
        direct_url: urlInfo.url,
        duration: '6-12 månader',
        cost: 'Se anordnare',
        priority: gap.importance === 'essential' ? 'essential' : 'recommended',
        language: 'sv'
      });
      count++;
    }
  }

  return suggestions;
}

// Generate a search URL based on course title and provider
function generateSearchUrl(title: string, provider: string): string {
  const lowerProvider = provider.toLowerCase();

  if (lowerProvider.includes('karolinska')) {
    return 'https://utbildning.ki.se/program';
  } else if (lowerProvider.includes('bya') || lowerProvider.includes('bevakningsbranschens')) {
    return 'https://www.bya.se/utbildning';
  } else if (lowerProvider.includes('arbetsförmedling')) {
    return 'https://arbetsformedlingen.se/for-arbetssokande/utbildning';
  } else if (lowerProvider.includes('yh') || lowerProvider.includes('yrkeshög')) {
    return 'https://www.yrkeshogskolan.se/hitta-utbildning';
  } else if (lowerProvider.includes('sophiahemmet')) {
    return 'https://www.sophiahemmethogskola.se/utbildningar';
  }

  // Default: search for the course
  const searchTerm = encodeURIComponent(title);
  return `https://www.yrkeshogskolan.se/hitta-utbildning?q=${searchTerm}`;
}

// Extract provider name from URL
function extractProviderFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    if (domain.includes('ki.se')) return 'Karolinska Institutet';
    if (domain.includes('bya.se')) return 'BYA';
    if (domain.includes('arbetsformedlingen')) return 'Arbetsförmedlingen';
    if (domain.includes('yrkeshogskolan')) return 'Yrkeshögskolan';
    if (domain.includes('sophiahemmet')) return 'Sophiahemmet Högskola';
    return 'Svensk utbildningsanordnare';
  } catch {
    return 'Utbildningsanordnare';
  }
}

// Fallback suggestions when web search fails
function generateFallbackSuggestions(gap: MissingSkill, targetRole: string): any[] {
  // Return empty array - no hardcoded courses!
  console.log('No fallback courses - GPT-4o must search the web');
  return [];
}