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
      max_output_tokens: 1500, // Keep low for faster response
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

// Generate learning suggestions using GPT-5
export async function generateLearningSuggestionsGPT5(
  gap: MissingSkill,
  targetRole: string
): Promise<any[]> {

  const prompt = `Du är en svensk utbildningsexpert med tillgång till webben. SÖK AKTIVT efter AKTUELLA kurser för:

  Gap: ${gap.skill}
  Viktighet: ${gap.importance === 'essential' ? 'OBLIGATORISK för yrket' : 'Önskvärd kompetens'}
  Målroll: ${targetRole}
  År: 2025

  INSTRUKTIONER:
  1. SÖK PÅ WEBBEN efter kurser som startar 2025
  2. Hitta DIREKTLÄNKAR till ansökningssidor
  3. Prioritera dessa källor:
     - arbetsformedlingen.se/utbildning
     - yrkeshogskolan.se
     - komvux.se
     - Branschspecifika certifieringsorgan

  För varje kurs, INKLUDERA:
  - DIREKTLÄNK till ansökningssidan (inte bara huvudsidan)
  - Nästa startdatum (t.ex. "Mars 2025")
  - Ansökningsdeadline
  - Exakt kostnad eller "Kostnadsfri via Arbetsförmedlingen"
  - Studietakt (heltid/deltid/distans)
  - Kontaktuppgifter till utbildningsanordnaren

  RETURNERA JSON med dessa OBLIGATORISKA fält:
  - type, title, provider, relevance
  - search_keywords (array med sökord)
  - direct_url (VIKTIGAST - hitta faktisk länk!)
  - duration, cost, priority, language

  Lägg gärna till om du hittar (men inte obligatoriskt):
  - start_date, application_deadline
  - study_format, contact

  EXEMPEL:
  {
    "type": "certification",
    "title": "HLR-instruktör",
    "provider": "Svenska HLR-rådet",
    "relevance": "Grundläggande certifikat för vårdpersonal",
    "search_keywords": ["HLR", "instruktör", "certifikat"],
    "direct_url": "https://www.hlr.nu/utbildning/hlr-instruktor",
    "duration": "3 dagar",
    "cost": "7500 kr",
    "priority": "essential",
    "language": "sv"
  }

  SÖK WEBBEN och returnera 2 KONKRETA kurser med DIREKTLÄNKAR!`;

  try {
    // Add timeout for course suggestions - increased for web search
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GPT-5 course suggestion timeout after 20s')), 20000)
    );

    const responsePromise = createGPT5Response({
      model: 'gpt-5-nano', // Use nano for maximum speed
      instructions: prompt,
      input: `Hitta kurser för: ${gap.skill}`,
      reasoning: {
        effort: 'medium' // Medium effort for better web search results
      },
      text: {
        verbosity: 'low', // Low verbosity for faster response
        format: {
          type: 'json_schema',
          name: 'course_suggestions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['course', 'certification', 'self-study', 'project'] },
                    title: { type: 'string' },
                    provider: { type: 'string' },
                    relevance: { type: 'string' },
                    search_keywords: { type: 'array', items: { type: 'string' } },
                    direct_url: { type: 'string' },
                    duration: { type: 'string' },
                    cost: { type: 'string' },
                    priority: { type: 'string', enum: ['essential', 'recommended', 'optional'] },
                    language: { type: 'string', enum: ['sv', 'en', 'other'] }
                  },
                  required: ['type', 'title', 'provider', 'relevance', 'search_keywords', 'direct_url', 'duration', 'cost', 'priority', 'language'],
                  additionalProperties: false
                }
              }
            },
            required: ['suggestions'],
            additionalProperties: false
          }
        }
      },
      max_output_tokens: 2000, // Increased for more detailed results with links
      store: false
    });

    // Race between request and timeout for course suggestions
    const response = await Promise.race([
      responsePromise,
      timeoutPromise
    ]) as Awaited<ReturnType<typeof createGPT5Response>>;

    const suggestions = extractJSONFromGPT5Response(response);

    // Extract suggestions array from response
    if (suggestions && suggestions.suggestions && Array.isArray(suggestions.suggestions)) {
      console.log(`Generated ${suggestions.suggestions.length} learning suggestions for gap: ${gap.skill}`);
      return suggestions.suggestions;
    } else if (Array.isArray(suggestions)) {
      // Fallback if direct array
      console.log(`Generated ${suggestions.length} learning suggestions for gap: ${gap.skill}`);
      return suggestions;
    }

    return [];
  } catch (error: any) {
    console.error(`Failed to generate learning suggestions: ${error.message}`);
    return [];
  }
}