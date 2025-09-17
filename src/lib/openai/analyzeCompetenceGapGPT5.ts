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
  const truncatedCV = cvText.substring(0, 8000);
  const modelToUse = "gpt-5-mini"; // Using gpt-5-mini for balance of cost and performance

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
  const systemPrompt = `Du är en expert karriärrådgivare och rekryterare med djup kunskap om den svenska arbetsmarknaden.

  ${targetInfoPrompt}

  Analysera följande CV:
  """
  ${truncatedCV}
  """

  Gör följande analys och returnera resultatet som strukturerad JSON:

  1. matchScore: Procentuell matchningspoäng (0-100) baserat på hur väl CV:t uppfyller målets krav

  2. cvSummaryForTarget: En kort (2-3 meningar) bedömning av CV:ts styrkor och svagheter i relation till målet i Sverige

  3. identifiedRelevantSkills: Lista 3-7 färdigheter från CV:t som är relevanta. Varje färdighet ska ha:
     - skill: Färdighetens namn
     - source_in_cv: Var i CV:t den hittades
     - relevance_to_target: "high", "medium" eller "low"

  4. identifiedSkillGaps: VIKTIGASTE STEGET - Lista kompetenser som saknas. Prioritera:
     a) FÖRST: Essentiella svenska krav (formella utbildningar, licenser, certifikat som 1SO, legitimation, körkortsklass)
        Ange dessa med importance: "essential"
     b) SEDAN: Andra viktiga kompetenser som är önskvärda
        Ange dessa med importance: "desirable"

     Varje gap ska ha:
     - skill: Specifik beskrivning (t.ex. "Saknar B-körkort", "Saknar 1SO Behörighet Klass X")
     - importance: "essential" eller "desirable"
     - reasoning: Kort motivering varför det är ett gap för rollen i Sverige

  VIKTIGT: Var MYCKET specifik med svenska formella krav och certifieringar.

  Returnera ENDAST giltig JSON i följande format:
  {
    "matchScore": number,
    "cvSummaryForTarget": string,
    "identifiedRelevantSkills": [
      {
        "skill": string,
        "source_in_cv": string,
        "relevance_to_target": "high" | "medium" | "low"
      }
    ],
    "identifiedSkillGaps": [
      {
        "skill": string,
        "importance": "essential" | "desirable",
        "reasoning": string
      }
    ]
  }`;

  try {
    console.log(`Starting GPT-5 competence analysis for target: ${targetDescriptionForOutput}`);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GPT-5 request timeout after 50s')), 50000)
    );

    // Make GPT-5 API call with high reasoning effort for best quality
    const responsePromise = createGPT5Response({
      model: modelToUse,
      input: [
        {
          role: 'developer',
          content: systemPrompt
        }
      ],
      reasoning: {
        effort: 'high' // Use high reasoning for complex analysis
      },
      text: {
        verbosity: 'high', // Get comprehensive analysis
        format: {
          type: 'json' // Request JSON format
        }
      },
      max_completion_tokens: 3000
    });

    // Race between request and timeout
    const response = await Promise.race([
      responsePromise,
      timeoutPromise
    ]) as Awaited<ReturnType<typeof createGPT5Response>>;

    console.log(`GPT-5 Response received. Output length: ${response.output_text?.length || 0}`);

    // Extract JSON from response
    const parsedResult = extractJSONFromGPT5Response(response);

    if (!parsedResult) {
      console.error("Failed to extract JSON from GPT-5 response");
      throw new Error("Invalid JSON response from GPT-5");
    }

    // Calculate cost
    const usage = response.usage;
    const calculatedCost = calculateGPT5Cost(
      modelToUse,
      usage.input_tokens,
      usage.output_tokens
    );

    console.log(`GPT-5 Usage: Input=${usage.input_tokens}, Output=${usage.output_tokens}, Cost=$${calculatedCost.toFixed(4)}`);

    // Build result
    const finalResult: CompetenceAnalysisResult = {
      analysisType: 'competence',
      targetDescription: targetDescriptionForOutput,
      matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : null,
      cvSummaryForTarget: parsedResult.cvSummaryForTarget || "Sammanfattning kunde inte genereras.",
      identifiedRelevantSkills: parsedResult.identifiedRelevantSkills || [],
      identifiedSkillGaps: parsedResult.identifiedSkillGaps || [],
      model: modelToUse,
      tokens: {
        prompt: usage.input_tokens,
        completion: usage.output_tokens,
        total: usage.total_tokens
      },
      cost: calculatedCost
    };

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

  const prompt = `Du är en svensk utbildningsexpert. Hitta konkreta kurser och utbildningar för följande kompetensgap:

  Gap: ${gap.skill}
  Viktighet: ${gap.importance === 'essential' ? 'ESSENTIELL - obligatorisk för rollen' : 'Önskvärd'}
  Anledning: ${gap.reasoning}
  Målroll: ${targetRole}

  Sök efter RIKTIGA kurser som finns i Sverige. Prioritera:
  1. AMF-kurser, Folkuniversitetet, Lernia för yrkesutbildningar
  2. Coursera, Udemy, LinkedIn Learning för tekniska färdigheter
  3. Svenska universitet och högskolor för formella utbildningar
  4. Branschspecifika certifieringsorganisationer

  För varje förslag, ge:
  - type: "course", "certification", "self-study" eller "project"
  - title: Kursnamn eller certifiering
  - provider: Utbildningsanordnare
  - relevance: Varför detta löser gapet
  - search_keywords: Sökord för att hitta kursen
  - direct_url: Om möjligt, direktlänk (börja söka på kända plattformar)
  - duration: Uppskattad tidsåtgång
  - cost: Uppskattad kostnad (eller "Gratis")
  - priority: "essential" för måste-ha, "recommended" för bör-ha
  - language: "sv" för svenska, "en" för engelska

  Returnera ENDAST en JSON-array med 2-3 konkreta förslag.`;

  try {
    const response = await createGPT5Response({
      model: 'gpt-5-nano', // Use nano for faster, cheaper course suggestions
      input: prompt,
      reasoning: {
        effort: 'medium' // Medium reasoning is enough for course lookup
      },
      text: {
        verbosity: 'medium',
        format: {
          type: 'json'
        }
      },
      max_completion_tokens: 1500
    });

    const suggestions = extractJSONFromGPT5Response(response);

    if (Array.isArray(suggestions)) {
      console.log(`Generated ${suggestions.length} learning suggestions for gap: ${gap.skill}`);
      return suggestions;
    }

    return [];
  } catch (error: any) {
    console.error(`Failed to generate learning suggestions: ${error.message}`);
    return [];
  }
}