// src/lib/gemini/competence-analysis.ts
// Kompetensanalys med gemini-3.1-pro + grounded kurssökning via Google Search.
// Ersätter analyzeCompetenceGapGPT5.ts och gpt5-client.ts (OpenAI Responses API).
import { generateJSON } from './generate';
import { searchGrounded, structureGroundedResult, type GroundingSource } from './grounded-search';
import { GEMINI_MODELS } from './models';

// Delade typer från den ursprungliga analysen
import type {
  MissingSkill,
  CompetenceAnalysisResult,
} from '@/lib/openai/analyzeCompetenceGap';

type CompetenceAnalysisInput =
  | { mode: 'role'; cvText: string; targetRole: string; targetCountry: string; }
  | { mode: 'jobAd'; cvText: string; jobAdText: string; };

/**
 * Djupare kompetensanalys med gemini-3.1-pro (ersätter GPT-5-varianten).
 * Samma returform som analyzeCompetenceGap så route-koden är oförändrad.
 */
export async function analyzeCompetenceGapPro(
  input: CompetenceAnalysisInput
): Promise<CompetenceAnalysisResult> {

  const { mode, cvText } = input;
  const truncatedCV = cvText.substring(0, 6000);
  const modelToUse = GEMINI_MODELS.reasoning;

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

  const systemPrompt = `Du är en SVENSK rekryteringsexpert som specialiserat dig på den svenska arbetsmarknaden.

  ${targetInfoPrompt}

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
  {"skill": "Saknar Heta Arbeten-certifikat", "importance": "essential", "reasoning": "Lagkrav för många målerijobb i Sverige"}`;

  const schema = {
    type: 'object',
    properties: {
      matchScore: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Overall match percentage between CV and target role',
      },
      cvSummaryForTarget: {
        type: 'string',
        description: "Critical assessment of what's missing for Swedish job market",
      },
      identifiedRelevantSkills: {
        type: 'array',
        minItems: 3,
        maxItems: 7,
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string', description: 'Exact skill from CV' },
            source_in_cv: { type: 'string', description: 'Where this skill is mentioned in CV' },
            relevance_to_target: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'How relevant this skill is to target role',
            },
          },
          required: ['skill', 'source_in_cv', 'relevance_to_target'],
        },
      },
      identifiedSkillGaps: {
        type: 'array',
        minItems: 5,
        maxItems: 8,
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string', description: 'Specific missing skill, certification, or education' },
            importance: {
              type: 'string',
              enum: ['essential', 'desirable'],
              description: 'How critical this gap is for the role',
            },
            reasoning: { type: 'string', description: 'Why this is required in Sweden for this role' },
          },
          required: ['skill', 'importance', 'reasoning'],
        },
      },
    },
    required: ['matchScore', 'cvSummaryForTarget', 'identifiedRelevantSkills', 'identifiedSkillGaps'],
  };

  try {
    console.log(`Starting Gemini Pro competence analysis for target: ${targetDescriptionForOutput}`);

    // Timeout på 40s, samma som tidigare GPT-5-flöde
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini Pro request timeout after 40s')), 40000)
    );

    const resultPromise = generateJSON<any>({
      model: modelToUse,
      systemInstruction: systemPrompt,
      prompt: `Analysera detta CV och returnera JSON enligt instruktionerna:\n\n${truncatedCV}`,
      maxOutputTokens: 6000, // Inkluderar thinking-tokens
      thinkingBudget: 2048,
      schema,
    });

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const parsedResult = result.data;

    console.log('identifiedSkillGaps count:', parsedResult.identifiedSkillGaps?.length || 0);

    const finalResult: CompetenceAnalysisResult = {
      analysisType: 'competence',
      targetDescription: targetDescriptionForOutput,
      matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : null,
      cvSummaryForTarget: parsedResult.cvSummaryForTarget || 'Sammanfattning kunde inte genereras.',
      identifiedRelevantSkills: Array.isArray(parsedResult.identifiedRelevantSkills) ? parsedResult.identifiedRelevantSkills : [],
      identifiedSkillGaps: Array.isArray(parsedResult.identifiedSkillGaps) ? parsedResult.identifiedSkillGaps : [],
      model: modelToUse,
      tokens: result.usage
        ? { prompt: result.usage.prompt, completion: result.usage.completion, total: result.usage.total }
        : null,
      cost: result.cost,
    };

    console.log(`Gemini Pro analysis successful. Score: ${finalResult.matchScore}%. Gaps: ${finalResult.identifiedSkillGaps.length}`);
    return finalResult;

  } catch (error: any) {
    console.error(`Gemini Pro competence analysis error: ${error.message}`);
    throw new Error(`Gemini Pro analysis failed: ${error.message}`);
  }
}

// ============================================================================
//  Kurssökning med Google Search grounding (tvåstegsmönster)
// ============================================================================

const COURSE_SEARCH_INSTRUCTIONS = `Du är en svensk utbildningsexpert som specialiserar dig på att hitta VERKLIGA utbildningar och certifieringar.
Använd websökning för att hitta exakta kurser med riktiga länkar från svenska utbildningsanordnare.

VIKTIGA SVENSKA UTBILDNINGSANORDNARE att söka efter:
- BYA (Bevakningsbranschens yrkes- och arbetsmiljönämnd) för säkerhet/väktare
- Yrkeshögskolan (YH) för alla yrkesutbildningar
- Arbetsförmedlingen för arbetsmarknadsutbildningar
- Lernia för yrkesutbildningar
- KI (Karolinska Institutet) för hälso/sjukvård
- Sophiahemmet för specialistutbildningar
- Folkuniversitetet för kurser
- Komvux för grundläggande utbildning

Sök specifikt på svenska webbsidor (.se-domäner). För varje kurs: ange exakt kursnamn, anordnare, längd, kostnad och webbadress.`;

const COURSES_SCHEMA = {
  type: 'object',
  properties: {
    courses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['course', 'certification', 'self-study'] },
          title: { type: 'string' },
          provider: { type: 'string' },
          direct_url: { type: 'string' },
          duration: { type: 'string' },
          cost: { type: 'string' },
          start_date: { type: 'string' },
          study_format: { type: 'string' },
          priority: { type: 'string', enum: ['essential', 'recommended', 'optional'] },
          description: { type: 'string' },
          relevance: { type: 'string' },
          search_keywords: { type: 'array', items: { type: 'string' } },
          language: { type: 'string', enum: ['sv', 'en', 'other'] },
        },
        required: ['type', 'title', 'provider', 'direct_url', 'duration', 'cost', 'priority', 'description', 'relevance', 'search_keywords', 'language'],
      },
    },
  },
  required: ['courses'],
};

/**
 * Hittar verkliga kurser för ett kompetensgap via Google Search grounding.
 * Tvåsteg: (1) grounded sökning i fritext, (2) billig strukturering till JSON.
 * (googleSearch-verktyget kan inte kombineras med responseSchema i samma anrop.)
 */
export async function generateLearningSuggestions(
  gap: MissingSkill,
  targetRole: string
): Promise<any[]> {
  try {
    console.log(`Grounded course search for: ${gap.skill} (${targetRole})`);

    // Steg 1: Grounded sökning med gemini-3.1-pro
    const grounded = await searchGrounded({
      model: GEMINI_MODELS.reasoning,
      systemInstruction: COURSE_SEARCH_INSTRUCTIONS,
      prompt: `Hitta 2 konkreta utbildningar för kompetensen "${gap.skill}" som behövs för rollen som ${targetRole} i Sverige. Sök på svenska utbildningssidor (t.ex. "${gap.skill} utbildning ${targetRole} Sverige kurs certifiering") och ange exakta kursnamn, anordnare, längd, kostnad och webbadresser.`,
    });

    if (!grounded.text.trim()) {
      console.warn(`Grounded search returned empty text for gap "${gap.skill}"`);
      return [];
    }

    console.log(`Grounded search done: ${grounded.sources.length} sources, ${grounded.text.length} chars`);

    // Steg 2: Strukturera till JSON med flash-lite
    const { data } = await structureGroundedResult<{ courses: any[] }>({
      groundedText: grounded.text,
      sources: grounded.sources,
      instruction: `Du konverterar sökresultat om svenska utbildningar till strukturerad JSON.
Extrahera max 2 kurser. Använd URL:erna från listan med verifierade källor när de matchar en kurs - de är riktiga länkar.
Om ingen verifierad URL matchar: använd URL:en som nämns i texten, eller lämna direct_url tom.
Hitta INTE på kurser som inte nämns i texten.`,
      schema: COURSES_SCHEMA,
    });

    let courses = Array.isArray(data?.courses) ? data.courses : [];
    if (courses.length === 0) {
      console.warn(`No courses extracted for gap "${gap.skill}"`);
      return [];
    }

    courses = courses.map((course: any) => ({
      type: course.type || 'course',
      title: course.title || `Kurs inom ${gap.skill}`,
      provider: course.provider || 'Se kursinformation',
      direct_url: resolveCourseUrl(course, grounded.sources, targetRole),
      duration: course.duration || 'Se kursinformation',
      cost: course.cost || 'Se kursinformation',
      start_date: course.start_date || 'Se kursinformation',
      study_format: course.study_format || 'Se kursinformation',
      priority: course.priority || (gap.importance === 'essential' ? 'essential' : 'recommended'),
      description: course.description || '',
      relevance: course.relevance || `Relevant för ${gap.skill}`,
      search_keywords: Array.isArray(course.search_keywords) && course.search_keywords.length > 0
        ? course.search_keywords
        : [gap.skill, targetRole],
      language: course.language || 'sv',
    })).slice(0, 2);

    console.log(`Grounded search found ${courses.length} courses for "${gap.skill}"`);
    return courses;

  } catch (error: any) {
    console.error(`Grounded course search failed for "${gap.skill}": ${error.message}`);
    return [];
  }
}

/**
 * Väljer bästa URL för en kurs: giltig direct_url > matchande grounding-källa
 * > leverantörsspecifik standardsida.
 */
function resolveCourseUrl(course: any, sources: GroundingSource[], targetRole: string): string {
  const direct = validateUrl(course.direct_url);
  // Vertex AI:s grounding-redirects är giltiga men fula; föredra direkta .se-länkar
  if (direct !== '#' && !direct.includes('vertexaisearch.cloud.google.com')) {
    return direct;
  }

  // Försök matcha en grounding-källa på leverantörs- eller kursnamn
  const haystack = `${course.provider || ''} ${course.title || ''}`.toLowerCase();
  const matchingSource = sources.find((s) => {
    const t = (s.title || '').toLowerCase();
    return t && haystack.split(/\s+/).some((word) => word.length > 4 && t.includes(word));
  });
  if (matchingSource?.uri) {
    return matchingSource.uri;
  }

  if (direct !== '#') return direct; // redirect-URL är bättre än ingenting

  return generateProviderUrl(course.provider || '', targetRole);
}

// Helper function to validate URLs (no fixing, just validation)
function validateUrl(url: string | undefined): string {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url;
  }
  return '#';
}

// Generate provider-specific URLs
function generateProviderUrl(provider: string, targetRole: string): string {
  const providerLower = provider.toLowerCase();

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
    'fmi': 'https://www.fmi.se/registrering/',
  };

  for (const [key, url] of Object.entries(providerUrls)) {
    if (providerLower.includes(key)) {
      return url;
    }
  }

  const roleLower = targetRole.toLowerCase();
  if (roleLower.includes('väktare')) {
    return 'https://bya.se/utbildning/vaktarutbildning/';
  } else if (roleLower.includes('sjuksköterska')) {
    return 'https://education.ki.se/programme-syllabus/2UK21';
  } else if (roleLower.includes('fastighetsmäklare') || roleLower.includes('mäklare')) {
    return 'https://www.hig.se/utbildning/program/fagbyg';
  }

  return 'https://www.yrkeshogskolan.se/hitta-utbildning/';
}
