console.log('[STARTUP] Edge function module loading...');

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

console.log('[STARTUP] Imports loaded');

// API key hantering - använd OPENAI_API_KEY (inte ADMIN)
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_PROJECT_ID = Deno.env.get('OPENAI_PROJECT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('[STARTUP] Environment variables loaded');
console.log(`[STARTUP] OPENAI_API_KEY: ${OPENAI_API_KEY ? 'SET (sk-...' + OPENAI_API_KEY.slice(-4) + ')' : 'NOT SET'}`);
console.log(`[STARTUP] OPENAI_PROJECT_ID: ${OPENAI_PROJECT_ID || 'NOT SET'}`);
console.log(`[STARTUP] SUPABASE_URL: ${SUPABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`[STARTUP] SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET'}`);

// Validera miljövariabler
if (!OPENAI_API_KEY) {
  console.error('[STARTUP ERROR] OPENAI_API_KEY är inte konfigurerad');
}
if (!OPENAI_PROJECT_ID) {
  console.error('[STARTUP WARNING] OPENAI_PROJECT_ID är inte konfigurerad - kan orsaka permissions problem');
}

console.log('[STARTUP] Creating Supabase client...');
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
console.log('[STARTUP] Supabase client initialized');

// ============================================================================
// TAXONOMY ENRICHMENT
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
    console.log(`[TAXONOMY] Fetching taxonomy for "${occupation}"...`);
    // Sök efter yrket i taxonomy
    const searchUrl = `${baseUrl}/specific-concepts/search?q=${encodeURIComponent(occupation)}&type=occupation-name&limit=5`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[TAXONOMY] API error (${response.status}) for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`[TAXONOMY] No results for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    // Ta första (bästa) matchningen
    const bestMatch = data[0];

    // Extrahera data
    const ssykCode = bestMatch.ssyk_code_2012 || bestMatch.ssyk || null;
    const preferredLabel = bestMatch.preferred_label || null;
    const alternativeLabels = bestMatch.alternative_labels || [];

    console.log(`[TAXONOMY] Enrichment for "${occupation}": ${alternativeLabels.length} synonyms, SSYK: ${ssykCode}`);

    return {
      primaryTerm: occupation,
      ssykCode,
      preferredLabel,
      alternativeLabels,
      relatedOccupations: [],
      competencies: []
    };

  } catch (error) {
    console.error(`[TAXONOMY ERROR] "${occupation}":`, error);
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

  console.log(`[TAXONOMY] Using fallback for "${occupation}": ${synonyms.length} manual synonyms`);

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
      console.log(`[TAXONOMY] Cache HIT for "${occupation}"`);
      return cached.data;
    } else {
      taxonomyCache.delete(cacheKey); // Rensa utgången cache
    }
  }

  // Hämta från API
  console.log(`[TAXONOMY] Cache MISS for "${occupation}" - fetching from API`);
  const data = await enrichOccupationWithTaxonomy(occupation);

  // Spara i cache
  taxonomyCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}

// ============================================================================
// GPT-5 CV ANALYSIS
// ============================================================================

/**
 * Analyze CV with GPT-5 using chat/completions endpoint
 */
async function analyzeCV(cvText: string, targetInfo: any, openaiApiKey: string, openaiProjectId?: string) {
  console.log('[GPT5] Starting CV analysis with GPT-5...');
  console.log(`[GPT5] Using project: ${openaiProjectId ? 'cvbrev (proj_WlM3ZDwbSPysgXRdp4m8dEGg)' : 'default'}`);

  const truncatedCV = cvText.substring(0, 8000);
  console.log(`[GPT5] CV length: ${cvText.length} chars (truncated to ${truncatedCV.length})`);

  let targetPrompt = '';
  if (targetInfo.mode === 'role') {
    targetPrompt = `Målet är yrkesrollen "${targetInfo.targetRole}" i Sverige.`;
    console.log(`[GPT5] Analysis mode: role-based (${targetInfo.targetRole})`);
  } else {
    targetPrompt = `Målet är att matcha mot följande jobbannons: ${targetInfo.jobAdText?.substring(0, 4000)}`;
    console.log(`[GPT5] Analysis mode: job ad matching`);
  }

  try {
    console.log('[GPT5] Calling GPT-5 API...');
    console.log(`[GPT5] Headers: Authorization: Bearer sk-...${openaiApiKey?.slice(-4)}, OpenAI-Project: ${openaiProjectId || 'not set'}`);

    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    };

    // Lägg till projekt header om den finns
    if (openaiProjectId) {
      headers['OpenAI-Project'] = openaiProjectId;
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
      console.error(`[GPT5 ERROR] Analysis failed (${response.status}):`, errorText);

      // Logga response headers för debugging
      const headers: any = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.error('[GPT5 ERROR] Response headers:', JSON.stringify(headers, null, 2));

      // Specifik hantering för scope errors
      if (errorText.includes('Missing scopes: model.request')) {
        throw new Error(`GPT-5 permission denied - API key saknar model.request scope för projekt ${openaiProjectId || 'default'}. Kontrollera att din API-nyckel har rätt permissions i projektet cvbrev.`);
      }

      throw new Error(`GPT-5 analysis failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[GPT5] Response received successfully');

    const result = JSON.parse(data.choices[0].message.content);

    // Ensure the result has the expected structure
    const structuredResult = {
      matchScore: result.matchScore || 0,
      cvSummaryForTarget: result.cvSummaryForTarget || '',
      identifiedRelevantSkills: result.identifiedRelevantSkills || [],
      identifiedSkillGaps: result.identifiedSkillGaps || []
    };

    console.log(`[GPT5] Analysis complete: Score=${structuredResult.matchScore}%, Gaps=${structuredResult.identifiedSkillGaps.length}`);
    return structuredResult;

  } catch (error: any) {
    console.error(`[GPT5 ERROR] Request failed:`, error.message);
    console.error(`[GPT5 ERROR] Stack:`, error.stack);
    throw error;
  }
}

// ============================================================================
// COURSE SEARCH WITH WEB SEARCH + CACHE
// ============================================================================

const COURSE_CACHE_TTL_DAYS = 365; // Cache for 1 year

/**
 * Infer course level from title and description using pattern matching
 */
function inferCourseLevel(title: string, description: string, targetRole: string): 'foundation' | 'intermediate' | 'advanced' {
  const text = (title + ' ' + description).toLowerCase();

  console.log(`[COURSE_LEVEL] Inferring level for: "${title}"`);

  // Foundation: Grundutbildningar för att BÖRJA i yrket
  // YH-program, Högskoleprogram, Komvux, Förberedande kurser
  if (text.match(/yrkeshögskol|högskoleprogram|universitetsutbildning|komvux|förberedande|grundutbildning|grundkurs(?!.*erfaren)/)) {
    console.log(`[COURSE_LEVEL] → foundation (grundutbildning match)`);
    return 'foundation';
  }

  // Check for specific program names that are foundation
  if (text.match(/sjuksköterskeprogrammet|lärarprogrammet|ingenjörsprogram|ekonomprogrammet/)) {
    console.log(`[COURSE_LEVEL] → foundation (program name match)`);
    return 'foundation';
  }

  // Advanced: För erfarna med erfarenhet
  // Handledarutbildning, För chefer, Arbetsplatsspecifikt, För erfarna
  if (text.match(/för erfarna|erfarna\s+(sjuksköterskor|yrkesverksamma)|handledarutbildning|handledar\s+|för chefer|ledningskurs|arbetsplatsspecifik|verksamhetsförlagd\s+utbildning|vfu\s+handledar/)) {
    console.log(`[COURSE_LEVEL] → advanced (erfarna/handledar match)`);
    return 'advanced';
  }

  // Specialist-kurser: intermediate OM det är "Specialistsjuksköterskeprogrammet", annars advanced
  if (text.includes('specialist')) {
    if (text.includes('program')) {
      console.log(`[COURSE_LEVEL] → intermediate (specialist program)`);
      return 'intermediate';
    } else {
      console.log(`[COURSE_LEVEL] → advanced (specialist course)`);
      return 'advanced';
    }
  }

  // Kompletterande utbildning för utländsk examen: intermediate/advanced
  if (text.match(/kompletterande\s+utbildning|för\s+(läkare|sjuksköterskor).*utländsk/)) {
    console.log(`[COURSE_LEVEL] → advanced (kompletterande)`);
    return 'advanced';
  }

  // Default: intermediate (vidareutbildning, certifiering, kortare kurser)
  console.log(`[COURSE_LEVEL] → intermediate (default)`);
  return 'intermediate';
}

/**
 * Check cache for existing course search results
 */
async function getCachedCourses(skillName: string, targetRole: string, userLocation: string) {
  const cacheKey = `${skillName.toLowerCase()}|${targetRole.toLowerCase()}|${userLocation.toLowerCase()}`;

  console.log(`[CACHE] Checking cache for "${skillName}" | ${targetRole} | ${userLocation}...`);

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - COURSE_CACHE_TTL_DAYS);

    console.log(`[CACHE] Querying database for "${skillName}"...`);
    const { data, error } = await supabase
      .from('course_search_cache')
      .select('courses_json, created_at')
      .eq('skill_name', skillName.toLowerCase())
      .eq('target_role', targetRole.toLowerCase())
      .eq('user_location', userLocation.toLowerCase())
      .gte('created_at', cutoffDate.toISOString())
      .maybeSingle();

    if (error) {
      console.error(`[CACHE ERROR] Lookup error for "${skillName}":`, error.message);
      console.error(`[CACHE ERROR] Error code:`, error.code);
      console.error(`[CACHE ERROR] Error details:`, error.details);
      return null;
    }

    if (data) {
      console.log(`[CACHE] ✓ Cache HIT for "${skillName}" (age: ${Math.round((Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24))} days)`);
      return data.courses_json;
    }

    console.log(`[CACHE] ✗ Cache MISS for "${skillName}"`);
    return null;

  } catch (error: any) {
    console.error(`[CACHE ERROR] Cache lookup failed for "${skillName}":`, error.message);
    console.error(`[CACHE ERROR] Stack:`, error.stack);
    return null;
  }
}

/**
 * Save course search results to cache
 */
async function saveCourseCache(skillName: string, targetRole: string, userLocation: string, courses: any[]) {
  console.log(`[CACHE] Saving ${courses.length} courses for "${skillName}"...`);

  try {
    const { error } = await supabase
      .from('course_search_cache')
      .upsert({
        skill_name: skillName.toLowerCase(),
        target_role: targetRole.toLowerCase(),
        user_location: userLocation.toLowerCase(),
        courses_json: courses,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'skill_name,target_role,user_location'
      });

    if (error) {
      console.error(`[CACHE ERROR] Failed to save cache for "${skillName}":`, error.message);
      console.error(`[CACHE ERROR] Error code:`, error.code);
      console.error(`[CACHE ERROR] Error details:`, error.details);
    } else {
      console.log(`[CACHE] ✓ Saved to cache: "${skillName}"`);
    }
  } catch (error: any) {
    console.error(`[CACHE ERROR] Cache save failed for "${skillName}":`, error.message);
    console.error(`[CACHE ERROR] Stack:`, error.stack);
  }
}

/**
 * Find courses using gpt-4o-search-preview with web search (with cache)
 */
async function findRealCoursesWithWebSearch(gap: any, targetRole: string, openaiApiKey: string, openaiProjectId?: string, userLocation?: string, matchScore?: number) {
  const location = userLocation || 'Stockholm';
  console.log(`[WEBSEARCH] Searching for courses: ${gap.skill} (region: ${location}, matchScore: ${matchScore}%)`);

  // Check cache first with timeout protection
  let cachedCourses = null;
  try {
    console.log(`[WEBSEARCH] Attempting cache lookup for "${gap.skill}"...`);
    const cachePromise = getCachedCourses(gap.skill, targetRole, location);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cache timeout after 5000ms')), 5000)
    );

    cachedCourses = await Promise.race([cachePromise, timeoutPromise]);
    console.log(`[WEBSEARCH] Cache lookup completed for "${gap.skill}"`);

    if (cachedCourses && Array.isArray(cachedCourses)) {
      console.log(`[WEBSEARCH] Using ${cachedCourses.length} cached courses for "${gap.skill}"`);
      return cachedCourses;
    }
  } catch (cacheError: any) {
    console.error(`[WEBSEARCH ERROR] Cache lookup failed/timeout for "${gap.skill}":`, cacheError.message);
    console.log(`[WEBSEARCH] Continuing with web search despite cache error...`);
  }

  // Determine context based on matchScore
  let experienceContext = '';
  if (matchScore !== undefined && matchScore < 20) {
    console.log(`[WEBSEARCH] Applying BEGINNER context (matchScore: ${matchScore}%)`);
    experienceContext = `

KRITISKT - ANVÄNDARENS ERFARENHETSNIVÅ:
- Användaren har INGEN eller MYCKET LITE erfarenhet av ${targetRole}
- Du MÅSTE PRIORITERA grundutbildningar (YH-program, Högskoleprogram, Komvux)
- Du MÅSTE UNDVIKA specialistkurser, handledarutbildningar, kurser för erfarna
- course_level MÅSTE vara "foundation" för huvuddelen av kurserna`;
  } else if (matchScore !== undefined && matchScore < 50) {
    console.log(`[WEBSEARCH] Applying INTERMEDIATE context (matchScore: ${matchScore}%)`);
    experienceContext = `

ANVÄNDARENS ERFARENHETSNIVÅ:
- Användaren har viss grundläggande erfarenhet av ${targetRole}
- PRIORITERA vidareutbildningar, certifieringar och specialistkurser
- OK med kurser som bygger på grundutbildning
- Balansera mellan "intermediate" och "advanced"`;
  } else if (matchScore !== undefined) {
    console.log(`[WEBSEARCH] Applying ADVANCED context (matchScore: ${matchScore}%)`);
    experienceContext = `

ANVÄNDARENS ERFARENHETSNIVÅ:
- Användaren har god erfarenhet av ${targetRole}
- PRIORITERA avancerade kurser, specialiseringar och certifieringar
- Fokusera på "intermediate" och "advanced" nivåer`;
  } else {
    console.log(`[WEBSEARCH] No matchScore provided, using generic context`);
  }

  // Cache miss - perform web search
  console.log(`[WEBSEARCH] Performing web search for "${gap.skill}"...`);
  try {
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    };

    // Lägg till projekt header för web search också
    if (openaiProjectId) {
      headers['OpenAI-Project'] = openaiProjectId;
    }

    console.log(`[WEBSEARCH] Calling OpenAI web search API for "${gap.skill}"...`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        web_search_options: {
          search_context_size: 'medium',
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
- UNDVIK kurser i avlägsna regioner om de inte är distans/online

KURS-NIVÅ MÄRKNING (course_level):
- "foundation": Grundutbildningar för att BÖRJA i yrket
  * YH-program (1-2 år), Högskoleprogram (3-5 år), Komvux
  * Vårdförberedande, Förberedande kurser
  * Exempel: "Sjuksköterskeprogrammet", "YH-Fastighetstekniker", "Komvux Naturkunskap"

- "intermediate": Vidareutbildning EFTER grundutbildning
  * Specialistkurser, Certifieringar, Fördjupningskurser (3-12 månader)
  * Kräver ofta tidigare erfarenhet eller grundexamen
  * Exempel: "Specialistsjuksköterska", "Projektledarcertifiering", "Fördjupningskurs i..."

- "advanced": Avancerade specialistkurser och arbetsplatskurser
  * För ERFARNA yrkesverksamma, Handledarutbildning, Arbetsplatsspecifika system
  * Exempel: "För erfarna...", "Handledarutbildning VFU", "TakeCare-journalsystem", "För chefer..."

VIKTIGT: Märk ALLTID varje kurs med rätt nivå baserat på målgrupp och förkunskapskrav!${experienceContext}`
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
      "delivery_method": "Distans eller Plats",
      "course_level": "foundation" | "intermediate" | "advanced"
    }
  ]
}`
          }
        ],
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[WEBSEARCH ERROR] Web search failed (${response.status}) for "${gap.skill}":`, errorText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`[WEBSEARCH] Received response for "${gap.skill}", parsing JSON...`);

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
      console.error(`[WEBSEARCH ERROR] Failed to parse web search response for ${gap.skill}:`, parseError.message);
      console.log('[WEBSEARCH ERROR] Raw response:', content.substring(0, 500));
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
      search_source: 'gpt4o_web_search',
      course_level: course.course_level || inferCourseLevel(course.title || '', course.description || '', targetRole)
    }));

    const verifiedCourses = courses.filter((c: any) => c.is_verified);
    console.log(`[WEBSEARCH] Found ${verifiedCourses.length} verified courses for "${gap.skill}"`);

    const resultCourses = verifiedCourses.slice(0, 3);

    // Save to cache for future use (fire-and-forget with error handling)
    if (resultCourses.length > 0) {
      console.log(`[WEBSEARCH] Saving ${resultCourses.length} courses to cache (background)...`);
      saveCourseCache(gap.skill, targetRole, location, resultCourses).catch(err => {
        console.error(`[WEBSEARCH ERROR] Background cache save failed:`, err);
      });
    }

    return resultCourses;

  } catch (error: any) {
    console.error(`[WEBSEARCH ERROR] Web search failed for ${gap.skill}:`, error.message);
    console.error(`[WEBSEARCH ERROR] Stack:`, error.stack);
    return [];
  }
}

// ============================================================================
// MAIN DENO.SERVE HANDLER
// ============================================================================

console.log('[STARTUP] Functions defined, registering Deno.serve...');

Deno.serve(async (req) => {
  console.log('='.repeat(60));
  console.log(`[MAIN] Request received: ${req.method} ${req.url}`);
  console.log('='.repeat(60));

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('[MAIN] Handling OPTIONS request');
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
      console.log('[MAIN] Parsing request body...');
      const bodyText = await req.text();
      console.log(`[MAIN] Request body received, length: ${bodyText.length}`);

      if (!bodyText || bodyText.trim() === '') {
        console.error('[MAIN ERROR] Empty request body');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      requestBody = JSON.parse(bodyText);
      jobId = requestBody.jobId;
      console.log('[MAIN] Processing competence analysis job:', jobId);

    } catch (parseError: any) {
      console.error('[MAIN ERROR] Failed to parse request body:', parseError.message);
      console.error('[MAIN ERROR] Stack:', parseError.stack);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!jobId) {
      console.error('[MAIN ERROR] Job ID missing in request');
      return new Response(
        JSON.stringify({ error: 'Job ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key
    console.log('[MAIN] Verifying OpenAI API key...');
    if (!OPENAI_API_KEY) {
      console.error('[MAIN ERROR] No OpenAI API key configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[MAIN] API key configured: sk-...${OPENAI_API_KEY.slice(-4)}`);
    console.log(`[MAIN] Project ID: ${OPENAI_PROJECT_ID || 'not configured (will use default)'}`);

    // Get job details
    console.log('[MAIN] Fetching job from database...');
    const { data: job, error: jobError } = await supabase
      .from('competence_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('[MAIN ERROR] Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MAIN] Job fetched successfully:', job.id, 'status:', job.status);

    // EARLY STATUS UPDATE - Update to analyzing IMMEDIATELY
    console.log('[MAIN] Updating job status to analyzing (early update)...');
    try {
      const { error: updateError } = await supabase
        .from('competence_analysis_jobs')
        .update({
          status: 'analyzing',
          progress: 5,
          current_step: 'Initierar system...'
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('[MAIN ERROR] Failed to update job status:', updateError);
        throw updateError;
      }
      console.log('[MAIN] Early status update successful');
    } catch (earlyUpdateError: any) {
      console.error('[MAIN ERROR] Early status update failed:', earlyUpdateError.message);
      console.error('[MAIN ERROR] Stack:', earlyUpdateError.stack);
      throw earlyUpdateError;
    }

    // Continue with actual progress update
    console.log('[MAIN] Updating progress to 10%...');
    await supabase
      .from('competence_analysis_jobs')
      .update({
        progress: 10,
        current_step: 'Hämtar CV-text...'
      })
      .eq('id', jobId);
    console.log('[MAIN] Progress updated to 10%');

    // Get CV text and location data
    console.log('[MAIN] Fetching CV text from database...');
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', job.cv_id)
      .single();

    // Try to get user location from parsed CV data
    console.log('[MAIN] Fetching user location from parsed CV data...');
    const { data: cvParsed } = await supabase
      .from('parsed_cv_data')
      .select('location, municipalities')
      .eq('cv_id', job.cv_id)
      .maybeSingle();

    const userLocation = cvParsed?.location || cvParsed?.municipalities?.[0] || 'Stockholm';
    const userRegion = cvParsed?.location || 'Stockholms län';

    console.log(`[MAIN] User location: ${userLocation}, Region: ${userRegion}`);

    // Normalize target role with Taxonomy API (before GPT-5 analysis)
    let normalizedRole = job.target_role;
    if (job.target_role) {
      console.log(`[MAIN] Normalizing occupation: "${job.target_role}"`);
      try {
        const taxonomy = await getCachedTaxonomy(job.target_role);
        if (taxonomy.preferredLabel) {
          normalizedRole = taxonomy.preferredLabel;
          console.log(`[MAIN] Normalized: "${job.target_role}" -> "${normalizedRole}"`);
        } else {
          console.log(`[MAIN WARNING] No preferred label found for "${job.target_role}", using original`);
        }
      } catch (taxonomyError: any) {
        console.warn(`[MAIN WARNING] Taxonomy normalization failed for "${job.target_role}":`, taxonomyError.message);
        // Continue with original role on error
      }
    }

    if (cvError || !cvData) {
      console.error('[MAIN ERROR] CV not found:', cvError);
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

    console.log('[MAIN] CV text fetched successfully');

    // Update progress
    console.log('[MAIN] Updating progress to 20%...');
    await supabase
      .from('competence_analysis_jobs')
      .update({
        progress: 20,
        current_step: 'Analyserar ditt CV mot målrollen...'
      })
      .eq('id', jobId);
    console.log('[MAIN] Progress updated to 20%');

    // Step 1: Analysis with GPT-5
    console.log('[MAIN] Starting CV analysis with GPT-5...');
    let analysisResult: any;

    try {
      analysisResult = await analyzeCV(
        cvData.cv_text,
        {
          mode: job.analysis_mode,
          targetRole: normalizedRole,
          jobAdText: job.job_ad_text
        },
        OPENAI_API_KEY,
        OPENAI_PROJECT_ID
      );

    } catch (analysisError: any) {
      console.error('[MAIN ERROR] GPT-5 Analysis failed:', analysisError.message);
      console.error('[MAIN ERROR] Stack:', analysisError.stack);
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

    console.log(`[MAIN] GPT-5 Analysis complete. Score: ${analysisResult.matchScore}%, Gaps: ${analysisResult.identifiedSkillGaps?.length}`);

    // Update with initial results
    console.log('[MAIN] Updating job with initial analysis results...');
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
    console.log('[MAIN] Initial results saved to database');

    // Step 2: Find courses IN PARALLEL
    console.log('[MAIN] Starting PARALLEL course search with web search...');
    const gaps = analysisResult.identifiedSkillGaps || [];
    const allSuggestions: any[] = [];

    // Process ALL gaps in parallel batches
    const BATCH_SIZE = 5; // 5 web searches simultaneously
    const totalBatches = Math.ceil(gaps.length / BATCH_SIZE);

    console.log(`[MAIN] Processing ${gaps.length} gaps in ${totalBatches} parallel batches...`);

    for (let i = 0; i < gaps.length; i += BATCH_SIZE) {
      const batch = gaps.slice(i, i + BATCH_SIZE);
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`[BATCH ${batchIndex}/${totalBatches}] Processing ${batch.length} gaps (${i + 1}-${Math.min(i + BATCH_SIZE, gaps.length)} of ${gaps.length})`);

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
          console.log(`  [BATCH ${batchIndex}] [${globalIndex + 1}/${gaps.length}] Searching for: "${gap.skill}"`);

          return findRealCoursesWithWebSearch(
            gap,
            normalizedRole || 'yrkesrollen',
            OPENAI_API_KEY,
            OPENAI_PROJECT_ID,
            userLocation,
            analysisResult.matchScore
          ).then(courses => ({ gap, courses }));
        })
      );

      const batchDuration = Date.now() - batchStartTime;
      console.log(`[BATCH ${batchIndex}/${totalBatches}] Batch completed in ${batchDuration}ms`);

      // Collect results
      batchResults.forEach((result, batchIndex) => {
        const globalIndex = i + batchIndex;
        if (result.status === 'fulfilled') {
          const { gap, courses } = result.value;
          console.log(`  [BATCH] [${globalIndex + 1}/${gaps.length}] Found ${courses.length} courses for "${gap.skill}"`);
          allSuggestions.push({
            skill: gap.skill,
            importance: gap.importance || 'important',
            reasoning: gap.reasoning || '',
            suggestions: courses
          });
        } else {
          console.error(`  [BATCH ERROR] [${globalIndex + 1}/${gaps.length}] Failed to find courses for "${batch[batchIndex].skill}":`, result.reason?.message || result.reason);
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
    console.log('[MAIN] Completing job...');
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
    console.log(`[MAIN] Job completed successfully with GPT-5!`);
    console.log(`[MAIN]   Project: ${OPENAI_PROJECT_ID ? 'cvbrev' : 'default'}`);
    console.log(`[MAIN]   Model: gpt-5-2025-08-07`);
    console.log(`[MAIN]   Courses found: ${totalCoursesFound}`);
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
    console.error('[MAIN ERROR] Edge function error:', error.message);
    console.error('[MAIN ERROR] Stack:', error.stack);

    // Mark job as failed if we have a jobId
    if (jobId) {
      try {
        console.log('[MAIN ERROR] Updating job status to failed...');
        await supabase
          .from('competence_analysis_jobs')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
        console.log('[MAIN ERROR] Job status updated to failed');
      } catch (e) {
        console.error('[MAIN ERROR] Could not update job status:', e);
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

console.log('[STARTUP] Deno.serve registered - function ready to handle requests');
