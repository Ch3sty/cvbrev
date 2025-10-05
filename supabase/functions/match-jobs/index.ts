import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Max-Age': '86400'
};

// Närliggande yrken-databas för fuzzy matching
const RELATED_OCCUPATIONS: Record<string, string[]> = {
  "butikschef": ["restaurangchef", "caféchef", "försäljningschef", "avdelningschef", "regionchef", "vice butikschef", "butiksbiträde"],
  "restaurangchef": ["butikschef", "caféchef", "kökschef", "hotelchef", "verksamhetschef"],
  "systemutvecklare": ["fullstack-utvecklare", "backend-utvecklare", "frontend-utvecklare", "systemvetare", "it-konsult", "mjukvaruutvecklare"],
  "fullstack-utvecklare": ["systemutvecklare", "backend-utvecklare", "frontend-utvecklare", "webbutvecklare"],
  "projektledare": ["produktägare", "scrum master", "verksamhetschef", "avdelningschef"],
  "säljare": ["butiksbiträde", "kundtjänst", "försäljningschef", "account manager"],
  "kundtjänst": ["receptionist", "kundsupport", "customer success manager", "säljare"],
  "lärare": ["gymnasielärare", "förskollärare", "fritidspedagog", "utbildare"],
  "sjuksköterska": ["undersköterska", "specialist sjuksköterska", "medicinskt ansvarig sjuksköterska"],
  "redovisningsekonom": ["controller", "ekonomiassistent", "ekonomichef", "revisor"],
  "vd": ["verksamhetschef", "direktör", "chef", "regionchef"],
};

// Distansarbete-keywords
const REMOTE_KEYWORDS = ["distans", "remote", "hemarbete", "hemifrån", "var som helst", "anywhere"];

// Extrahera geografi från CV
function extractGeography(cvData: any) {
  const locations: string[] = [];

  // Primär: personalInfo.address
  if (cvData.personalInfo?.address) {
    locations.push(cvData.personalInfo.address);
  }

  // Sekundär: Senaste 2 arbetsplatser
  if (cvData.experience) {
    cvData.experience.slice(0, 2).forEach((exp: any) => {
      if (exp.location) locations.push(exp.location);
    });
  }

  return locations.filter(Boolean);
}

// Enkel geografisk parser (Svenska städer/regioner)
function parseLocation(location: string): { city?: string; region?: string } {
  const normalized = location.toLowerCase().trim();

  // Vanliga svenska städer
  const cities: Record<string, string> = {
    "stockholm": "Stockholm",
    "göteborg": "Göteborg",
    "malmö": "Malmö",
    "uppsala": "Uppsala",
    "västerås": "Västerås",
    "örebro": "Örebro",
    "linköping": "Linköping",
    "helsingborg": "Helsingborg",
    "jönköping": "Jönköping",
    "norrköping": "Norrköping",
    "lund": "Lund",
    "umeå": "Umeå",
    "gävle": "Gävle",
    "borås": "Borås",
    "södertälje": "Södertälje",
    "eskilstuna": "Eskilstuna",
    "karlstad": "Karlstad",
    "täby": "Täby",
    "växjö": "Växjö",
    "halmstad": "Halmstad"
  };

  for (const [key, value] of Object.entries(cities)) {
    if (normalized.includes(key)) {
      return { city: value };
    }
  }

  return {};
}

// Beräkna geografisk score
function calculateGeographyScore(cvLocations: string[], job: any): number {
  const jobText = `${job.headline} ${job.description?.text || ''} ${job.workplace_address?.municipality || ''}`.toLowerCase();

  // Kolla om jobbet är distansarbete
  const isRemote = REMOTE_KEYWORDS.some(keyword => jobText.includes(keyword));
  if (isRemote) return 25; // Full poäng för distansjobb

  if (cvLocations.length === 0) return 10; // Neutral score om ingen location

  // Kolla om någon CV-location matchar jobbets kommun/stad
  for (const cvLoc of cvLocations) {
    const parsed = parseLocation(cvLoc);
    if (!parsed.city) continue;

    const cityLower = parsed.city.toLowerCase();

    // Exakt stadsmatchning
    if (jobText.includes(cityLower)) {
      return 25; // Samma stad
    }

    // Närliggande städer (kan utökas med regions-databas)
    if (job.workplace_address?.municipality?.toLowerCase().includes(cityLower)) {
      return 20;
    }
  }

  // Ingen geografisk matchning
  return 3;
}

// Extrahera yrken från CV
function extractOccupations(cvData: any): string[] {
  const occupations: string[] = [];

  if (cvData.experience) {
    cvData.experience.forEach((exp: any) => {
      if (exp.position) {
        occupations.push(exp.position.toLowerCase());
      }
    });
  }

  return [...new Set(occupations)];
}

// Hitta närliggande yrken
function getRelatedOccupations(occupation: string): string[] {
  const normalized = occupation.toLowerCase().trim();

  // Exakt match
  if (RELATED_OCCUPATIONS[normalized]) {
    return RELATED_OCCUPATIONS[normalized];
  }

  // Partiell match (t.ex. "senior systemutvecklare" → "systemutvecklare")
  for (const [key, related] of Object.entries(RELATED_OCCUPATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return related;
    }
  }

  return [];
}

// Beräkna yrkestitelmatchning
function calculateOccupationScore(cvOccupations: string[], job: any): number {
  const jobText = `${job.headline} ${job.occupation?.label || ''}`.toLowerCase();

  if (cvOccupations.length === 0) return 0;

  const primaryOccupation = cvOccupations[0]; // Senaste yrkestiteln

  // Exakt match
  if (jobText.includes(primaryOccupation)) {
    return 20;
  }

  // Närliggande yrken
  const relatedOccupations = getRelatedOccupations(primaryOccupation);
  for (const related of relatedOccupations) {
    if (jobText.includes(related.toLowerCase())) {
      return 15;
    }
  }

  // Kolla andra yrken från CV
  for (let i = 1; i < Math.min(cvOccupations.length, 3); i++) {
    if (jobText.includes(cvOccupations[i])) {
      return 12;
    }
  }

  return 0;
}

// Extrahera nyckelfraser från rollbeskrivningar
function extractExperienceText(cvData: any): string {
  if (!cvData.experience) return '';

  return cvData.experience
    .flatMap((exp: any) => {
      if (Array.isArray(exp.description)) {
        return exp.description.join(' ');
      }
      return exp.description || '';
    })
    .join(' ')
    .toLowerCase();
}

// Beräkna erfarenhetsbaserad matchning
function calculateExperienceScore(cvData: any, job: any): number {
  const experienceText = extractExperienceText(cvData);
  if (!experienceText) return 0;

  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();

  // Viktiga nyckelfraser (viktade)
  const keyPhrases: Record<string, number> = {
    "personalansvar": 3,
    "budgetansvar": 3,
    "ökat försäljningen": 4,
    "förbättrat": 2,
    "ledde team": 3,
    "leda team": 3,
    "rekrytering": 2,
    "kundservice": 2,
    "projektledning": 3,
    "agil": 2,
    "scrum": 2,
    "ledarskap": 2,
    "motivera medarbetare": 3,
    "utveckling": 1,
    "strategi": 2,
    "analys": 1,
    "förbättrade": 2,
    "implementera": 2,
    "optimera": 2,
    "effektivisera": 2,
  };

  let score = 0;

  for (const [phrase, weight] of Object.entries(keyPhrases)) {
    // Kolla om frasen finns både i CV OCH i jobbannonsen
    if (experienceText.includes(phrase) && jobText.includes(phrase)) {
      score += weight;
    }
  }

  return Math.min(20, score);
}

// Extrahera färdigheter från CV
function extractSkills(cvData: any): string[] {
  const skills: string[] = [];

  if (cvData.skills) {
    cvData.skills.forEach((skillGroup: any) => {
      if (Array.isArray(skillGroup.skills)) {
        skills.push(...skillGroup.skills);
      }
    });
  }

  return [...new Set(skills.map(s => s.toLowerCase()))];
}

// Bygg smart söksträng med AI-data från CV-analys
function buildSmartQuery(cvData: any, analysisData: any, cvOccupations: string[]): string {
  const queryParts: string[] = [];

  // 1. Primärt yrke (viktigast)
  if (cvOccupations.length > 0) {
    queryParts.push(cvOccupations[0]);
  }

  // 2. Top AI-identifierade skills med hög relevans
  if (analysisData.skillSuggestions) {
    const topSkills = analysisData.skillSuggestions
      .filter((s: any) => s.relevance === 'high')
      .map((s: any) => s.skill)
      .slice(0, 2);
    queryParts.push(...topSkills);
  }

  // 3. Keywords från CV-analys
  if (analysisData.keywords) {
    const topKeywords = analysisData.keywords.slice(0, 2);
    queryParts.push(...topKeywords);
  }

  return queryParts.filter(Boolean).slice(0, 6).join(' ');
}

// Sök jobb via Arbetsförmedlingens API
async function searchJobs(params: Record<string, any>) {
  const baseUrl = 'https://jobsearch.api.jobtechdev.se';
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${baseUrl}/search?${queryParams.toString()}`;
  console.log('Searching jobs:', url);

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`JobSearch API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.hits || [];
}

// Multi-query sökning för att få fler relevanta annonser
async function searchJobsMultiQuery(
  cvData: any,
  analysisData: any,
  cvOccupations: string[],
  cvLocations: string[],
  customParams?: Record<string, any>
) {
  const allJobs: any[] = [];
  const seenIds = new Set<string>();

  // Geografisk filter (om tillgänglig)
  const parsedLocation = cvLocations.length > 0 ? parseLocation(cvLocations[0]) : {};

  // Query 1: Primär sökning - Exakt yrkestitel + skills
  const primaryQuery = buildSmartQuery(cvData, analysisData, cvOccupations);
  console.log('Query 1 (Primary):', primaryQuery);
  const primaryJobs = await searchJobs({
    q: primaryQuery,
    limit: 30,
    ...customParams
  });

  primaryJobs.forEach((job: any) => {
    if (!seenIds.has(job.id)) {
      seenIds.add(job.id);
      allJobs.push({ ...job, queryType: 'primary' });
    }
  });

  // Query 2: Närliggande yrken
  if (cvOccupations.length > 0) {
    const relatedOccs = getRelatedOccupations(cvOccupations[0]);
    if (relatedOccs.length > 0) {
      const relatedQuery = relatedOccs.slice(0, 3).join(' OR ');
      console.log('Query 2 (Related):', relatedQuery);

      const relatedJobs = await searchJobs({
        q: relatedQuery,
        limit: 20,
        ...customParams
      });

      relatedJobs.forEach((job: any) => {
        if (!seenIds.has(job.id)) {
          seenIds.add(job.id);
          allJobs.push({ ...job, queryType: 'related' });
        }
      });
    }
  }

  // Query 3: Kompetensbaserad sökning
  if (analysisData.skillSuggestions && analysisData.skillSuggestions.length > 0) {
    const topSkills = analysisData.skillSuggestions
      .filter((s: any) => s.relevance === 'high')
      .map((s: any) => s.skill)
      .slice(0, 3)
      .join(' ');

    if (topSkills) {
      console.log('Query 3 (Skills):', topSkills);

      const skillJobs = await searchJobs({
        q: topSkills,
        limit: 20,
        ...customParams
      });

      skillJobs.forEach((job: any) => {
        if (!seenIds.has(job.id)) {
          seenIds.add(job.id);
          allJobs.push({ ...job, queryType: 'skills' });
        }
      });
    }
  }

  console.log(`Multi-query complete: ${allJobs.length} unique jobs found`);
  return allJobs;
}

// FÖRBÄTTRAD: Multi-factor relevansberäkning
function calculateRelevance(cvData: any, analysisData: any, job: any, cvOccupations: string[], cvLocations: string[]): number {
  let score = 0;
  const maxScore = 100;

  const jobText = `${job.headline} ${job.description?.text || ''} ${job.occupation?.label || ''}`.toLowerCase();

  // Faktor 1: Geografisk matchning (25 poäng) ⭐ NYT!
  score += calculateGeographyScore(cvLocations, job);

  // Faktor 2: Yrkestitelmatchning (20 poäng) - Förbättrad
  score += calculateOccupationScore(cvOccupations, job);

  // Faktor 3: Erfarenhetsbaserad matchning (20 poäng) ⭐ NYT!
  score += calculateExperienceScore(cvData, job);

  // Faktor 4: AI-identifierade kompetenser (15 poäng)
  if (analysisData.skillSuggestions) {
    const aiSkillMatches = analysisData.skillSuggestions.reduce((sum: number, s: any) => {
      const skillLower = s.skill.toLowerCase();
      const matches = jobText.includes(skillLower);

      if (matches) {
        if (s.relevance === 'high') return sum + 10;
        if (s.relevance === 'medium') return sum + 6;
        return sum + 3;
      }
      return sum;
    }, 0);

    score += Math.min(15, aiSkillMatches);
  }

  // Faktor 5: Keywords från CV-analys (10 poäng)
  if (analysisData.keywords) {
    const keywordMatches = analysisData.keywords.filter((kw: string) =>
      jobText.includes(kw.toLowerCase())
    ).length;
    score += Math.min(10, keywordMatches * 2);
  }

  // Faktor 6: ATS-optimerade keywords från roller (10 poäng)
  if (analysisData.roleBasedImprovements) {
    const roleKeywords = analysisData.roleBasedImprovements.flatMap((r: any) =>
      r.improvements.keywords || []
    );
    const roleMatches = roleKeywords.filter((kw: string) =>
      jobText.includes(kw.toLowerCase())
    ).length;
    score += Math.min(10, roleMatches * 2);
  }

  return Math.min(maxScore, Math.round(score));
}

// Extrahera matchningsdetaljer per jobb
function extractMatchDetails(cvData: any, analysisData: any, job: any, cvOccupations: string[]) {
  const jobText = `${job.headline} ${job.description?.text || ''} ${job.occupation?.label || ''}`.toLowerCase();

  const matchedOccupations = cvOccupations.filter(occ => jobText.includes(occ));
  const matchedSkills = (analysisData.skillSuggestions || []).filter((s: any) =>
    jobText.includes(s.skill.toLowerCase())
  );
  const matchedKeywords = (analysisData.keywords || []).filter((kw: string) =>
    jobText.includes(kw.toLowerCase())
  );
  const matchedRoleKeywords = (analysisData.roleBasedImprovements || [])
    .flatMap((r: any) => (r.improvements.keywords || []).filter((kw: string) =>
      jobText.includes(kw.toLowerCase())
    ));

  return {
    matchedOccupations,
    matchedSkills,
    matchedKeywords,
    matchedRoleKeywords
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    const { analysisId, customParams } = requestData;

    let cvData = null;
    let analysisData: any = {
      skillSuggestions: [],
      keywords: [],
      roleBasedImprovements: []
    };
    let selectedAnalysisId = null;

    if (analysisId) {
      // Hämta från specifik CV-analys
      const { data: analysisJob, error: jobError } = await supabase
        .from('cv_analysis_jobs')
        .select('id, result, display_name')
        .eq('id', analysisId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

      if (!jobError && analysisJob?.result) {
        selectedAnalysisId = analysisJob.id;
        cvData = analysisJob.result.structuredCV;
        analysisData = {
          skillSuggestions: analysisJob.result.skillSuggestions || [],
          keywords: analysisJob.result.keywords || [],
          roleBasedImprovements: analysisJob.result.roleBasedImprovements || [],
          atsFriendliness: analysisJob.result.atsFriendliness,
          displayName: analysisJob.display_name
        };
      }
    } else {
      // Hämta senaste analysen
      const { data: latestJob, error: latestError } = await supabase
        .from('cv_analysis_jobs')
        .select('id, result, display_name')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestError && latestJob?.result) {
        selectedAnalysisId = latestJob.id;
        cvData = latestJob.result.structuredCV;
        analysisData = {
          skillSuggestions: latestJob.result.skillSuggestions || [],
          keywords: latestJob.result.keywords || [],
          roleBasedImprovements: latestJob.result.roleBasedImprovements || [],
          atsFriendliness: latestJob.result.atsFriendliness,
          displayName: latestJob.display_name
        };
      }
    }

    if (!cvData) {
      return new Response(
        JSON.stringify({
          error: 'No CV data found. Please upload and analyze your CV first.',
          hint: 'You need to complete a CV analysis before searching for jobs.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('CV data found, extracting occupations and locations...');

    const cvOccupations = extractOccupations(cvData);
    const cvLocations = extractGeography(cvData);

    console.log('Occupations:', cvOccupations);
    console.log('Locations:', cvLocations);

    // Multi-query sökning
    const jobs = await searchJobsMultiQuery(
      cvData,
      analysisData,
      cvOccupations,
      cvLocations,
      customParams
    );

    console.log(`Found ${jobs.length} jobs via multi-query`);

    // Beräkna relevans OCH extrahera matchningsdetaljer
    const jobsWithRelevance = jobs.map((job: any) => {
      const relevance = calculateRelevance(cvData, analysisData, job, cvOccupations, cvLocations);
      const matchDetails = extractMatchDetails(cvData, analysisData, job, cvOccupations);

      return {
        ...job,
        relevance,
        matchDetails
      };
    });

    // Sortera efter relevans
    jobsWithRelevance.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return new Response(
      JSON.stringify({
        success: true,
        jobs: jobsWithRelevance,
        searchTerms: {
          occupations: cvOccupations,
          locations: cvLocations,
          aiSkills: analysisData.skillSuggestions.slice(0, 5).map((s: any) => s.skill),
          aiKeywords: analysisData.keywords.slice(0, 5)
        },
        selectedAnalysis: {
          id: selectedAnalysisId,
          displayName: analysisData.displayName,
          atsScore: analysisData.atsFriendliness?.score
        },
        totalResults: jobsWithRelevance.length,
        params: customParams
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in match-jobs function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
