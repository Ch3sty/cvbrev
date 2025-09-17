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
  const modelToUse = "gpt-5"; // Using full gpt-5 for best quality

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

    // Create timeout promise - reduced to 30s to stay within Vercel limits
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GPT-5 request timeout after 30s')), 30000)
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
          type: 'text' // GPT-5 requires format specification
        }
      },
      max_output_tokens: 2000 // Reduced for faster response
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
      console.error("Failed to extract JSON from GPT-5 response. Raw text:", response.output_text);
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

  const prompt = `Du är en svensk utbildningsexpert. Hitta EXAKTA kurser för:

  Gap: ${gap.skill}
  Viktighet: ${gap.importance === 'essential' ? 'OBLIGATORISK' : 'Önskvärd'}
  Målroll: ${targetRole}

  SVENSKA UTBILDNINGSANORDNARE (använd dessa):

  För CERTIFIKAT:
  - Måleriyrkets våtrum (MVK) - våtrumscertifikat
  - Målarmästarna - Målargesäll-certifikat
  - BYN (Byggbranschens Yrkesnämnd) - ID06, APU-handledare
  - Svenska Brand- och Säkerhetscertifiering - Heta Arbeten
  - Prevent - Asbestutbildning
  - TYA - Ställningsbyggnad
  - Transportstyrelsen - ADR-certifikat
  - SSG - SSG Entre Säker

  För YRKESUTBILDNING:
  - Lernia - YH-utbildningar, yrkesutbildningar
  - Hermods - Yrkesutbildningar, distans
  - Arbetsförmedlingen - Yrkesväxling, bristyrkesutbildningar
  - Komvux - Gymnasiala yrkeskurser
  - Folkuniversitetet - Yrkeskurser
  - Medborgarskolan - Korta yrkeskurser

  För IT/TEKNIK:
  - Chas Academy - Fullstack, Frontend bootcamp (12 veckor)
  - </salt> - JavaScript bootcamp (3 månader)
  - Technigo - Frontend bootcamp (24 veckor)
  - KTH Executive School - Kortare IT-kurser
  - Nackademin - YH-utbildningar IT
  - EC Utbildning - .NET utvecklare, Java utvecklare

  ONLINE (för tekniska färdigheter):
  - Pluralsight - Tekniska kurser
  - Frontend Masters - JavaScript/React specialisering
  - Udemy Business - Företagslicenser

  Returnera en JSON-array med EXAKT denna struktur:
  [
    {
      "type": "certification" eller "course",
      "title": "EXAKT kursnamn som finns",
      "provider": "EXAKT anordnare från listan ovan",
      "relevance": "Hur detta löser gapet",
      "search_keywords": ["sökord1", "sökord2"],
      "direct_url": "https://... om du vet",
      "duration": "2 dagar" eller "12 veckor" etc,
      "cost": "3500 kr" eller "Gratis via Arbetsförmedlingen",
      "priority": "essential" eller "recommended",
      "language": "sv" eller "en"
    }
  ]

  Ge 2-3 KONKRETA förslag. Returnera ENDAST JSON-array, ingen annan text!`;

  try {
    const response = await createGPT5Response({
      model: 'gpt-5-mini', // Use mini for better course suggestions
      input: [
        {
          role: 'developer',
          content: prompt
        }
      ],
      reasoning: {
        effort: 'medium' // Medium reasoning is enough for course lookup
      },
      text: {
        verbosity: 'medium',
        format: {
          type: 'text'
        }
      },
      max_output_tokens: 1500
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