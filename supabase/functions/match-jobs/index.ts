import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Max-Age': '86400'
};

// Svenska städer med koordinater (top 60)
const SWEDISH_CITIES: Record<string, { lat: number; lon: number }> = {
  "stockholm": { lat: 59.3293, lon: 18.0686 },
  "göteborg": { lat: 57.7089, lon: 11.9746 },
  "malmö": { lat: 55.6050, lon: 13.0038 },
  "uppsala": { lat: 59.8586, lon: 17.6389 },
  "västerås": { lat: 59.6099, lon: 16.5448 },
  "örebro": { lat: 59.2753, lon: 15.2134 },
  "linköping": { lat: 58.4108, lon: 15.6214 },
  "helsingborg": { lat: 56.0465, lon: 12.6945 },
  "jönköping": { lat: 57.7826, lon: 14.1618 },
  "norrköping": { lat: 58.5877, lon: 16.1924 },
  "lund": { lat: 55.7047, lon: 13.1910 },
  "umeå": { lat: 63.8258, lon: 20.2630 },
  "gävle": { lat: 60.6749, lon: 17.1413 },
  "borås": { lat: 57.7210, lon: 12.9401 },
  "södertälje": { lat: 59.1959, lon: 17.6255 },
  "eskilstuna": { lat: 59.3710, lon: 16.5077 },
  "karlstad": { lat: 59.3793, lon: 13.5036 },
  "täby": { lat: 59.4439, lon: 18.0687 },
  "växjö": { lat: 56.8787, lon: 14.8059 },
  "halmstad": { lat: 56.6745, lon: 12.8577 },
  "sundsvall": { lat: 62.3908, lon: 17.3069 },
  "luleå": { lat: 65.5848, lon: 22.1547 },
  "trollhättan": { lat: 58.2836, lon: 12.2886 },
  "östersund": { lat: 63.1792, lon: 14.6357 },
  "borlänge": { lat: 60.4858, lon: 15.4378 },
  "kalmar": { lat: 56.6634, lon: 16.3567 },
  "kristianstad": { lat: 56.0294, lon: 14.1567 },
  "karlskrona": { lat: 56.1621, lon: 15.5866 },
  "skellefteå": { lat: 64.7507, lon: 20.9527 },
  "uddevalla": { lat: 58.3480, lon: 11.9424 },
  "skövde": { lat: 58.3910, lon: 13.8455 },
  "varberg": { lat: 57.1057, lon: 12.2502 },
  "åkersberga": { lat: 59.4797, lon: 18.2978 },
  "falun": { lat: 60.6066, lon: 15.6265 },
  "lidingö": { lat: 59.3667, lon: 18.1333 },
  "örnsköldsvik": { lat: 63.2909, lon: 18.7155 },
  "nyköping": { lat: 58.7530, lon: 17.0086 },
  "karlskoga": { lat: 59.3267, lon: 14.5233 },
  "sollefteå": { lat: 63.1686, lon: 17.2657 },
  "trelleborg": { lat: 55.3754, lon: 13.1567 },
  "solna": { lat: 59.3599, lon: 18.0000 },
  "motala": { lat: 58.5370, lon: 15.0364 },
  "kiruna": { lat: 67.8558, lon: 20.2253 },
  "landskrona": { lat: 55.8708, lon: 12.8301 },
  "ystad": { lat: 55.4296, lon: 13.8206 },
  "enköping": { lat: 59.6357, lon: 17.0777 },
  "ängelholm": { lat: 56.2428, lon: 12.8622 },
  "visby": { lat: 57.6348, lon: 18.2948 },
  "nässjö": { lat: 57.6531, lon: 14.6968 },
  "sandviken": { lat: 60.6167, lon: 16.7667 },
  "falkenberg": { lat: 56.9054, lon: 12.4915 },
  "kungsbacka": { lat: 57.4870, lon: 12.0772 },
  "lidköping": { lat: 58.5052, lon: 13.1577 },
  "lerum": { lat: 57.7704, lon: 12.2694 },
  "märsta": { lat: 59.6167, lon: 17.8500 },
  "oskarshamn": { lat: 57.2644, lon: 16.4486 },
  "katrineholm": { lat: 58.9959, lon: 16.2073 },
  "huskvarna": { lat: 57.7858, lon: 14.3014 },
  "piteå": { lat: 65.3197, lon: 21.4758 },
  "vetlanda": { lat: 57.4289, lon: 15.0776 }
};

// Närliggande yrken-databas
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

// Branschspecifika krav (för straff om saknas i CV)
const INDUSTRY_SPECIFIC_REQUIREMENTS: Record<string, { keywords: string[]; cvIndicators: string[] }> = {
  medical: {
    keywords: ["läkarlegitimation", "sjuksköterska legitimation", "läkare", "medicin", "leg. läkare", "leg. sjuksköterska"],
    cvIndicators: ["läkare", "sjuksköterska", "medicin", "karolinska", "läkarprogrammet", "vårdutbildning", "legitimerad"]
  },
  maritime: {
    keywords: ["sjöfartsnäringen", "sjökapten", "sjöbefäl", "stcw", "nautisk", "certifikat iv"],
    cvIndicators: ["sjökapten", "sjöfart", "nautisk", "maritimt", "kustbevakningen", "rederi", "fartyg", "marin"]
  },
  engineering: {
    keywords: ["civilingenjör", "teknisk fysik", "teknologie master", "teknisk högskola", "civilingenjörsexamen"],
    cvIndicators: ["civilingenjör", "kth", "chalmers", "lth", "ingenjör", "teknisk", "maskinteknik", "elektroteknik"]
  },
  law: {
    keywords: ["juristexamen", "jur.kand", "advokat", "juris kandidat", "juridisk examen"],
    cvIndicators: ["juridik", "jurist", "jur.kand", "advokatbyrå", "domstol", "rättsvetenskap", "juridisk fakultet"]
  },
  aviation: {
    keywords: ["flygcertifikat", "pilotlicens", "atpl", "cpl", "flygutbildning", "certifierad pilot"],
    cvIndicators: ["pilot", "flygplan", "sas", "luftfart", "flygutbildning", "flyg", "aviation"]
  }
};

// Haversine-formel för distansberäkning
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Jordens radie i km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Extrahera geografi från CV
function extractGeography(cvData: any) {
  const locations: string[] = [];

  if (cvData.personalInfo?.address) {
    locations.push(cvData.personalInfo.address);
  }

  if (cvData.experience) {
    cvData.experience.slice(0, 2).forEach((exp: any) => {
      if (exp.location) locations.push(exp.location);
    });
  }

  return locations.filter(Boolean);
}

// Parsa location till stad med koordinater
function parseLocation(location: string): { city?: string; lat?: number; lon?: number } | null {
  if (!location) return null;

  const normalized = location.toLowerCase().trim();

  for (const [cityKey, coords] of Object.entries(SWEDISH_CITIES)) {
    if (normalized.includes(cityKey)) {
      return {
        city: cityKey.charAt(0).toUpperCase() + cityKey.slice(1),
        ...coords
      };
    }
  }

  return null;
}

// Kolla om jobb är distansarbete
function checkIfRemote(job: any): boolean {
  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
  return REMOTE_KEYWORDS.some(keyword => jobText.includes(keyword));
}

// Beräkna distans mellan CV-location och jobb
function calculateDistanceForJob(cvLocations: string[], job: any): number | null {
  if (cvLocations.length === 0) return null;

  const cvLoc = parseLocation(cvLocations[0]);
  if (!cvLoc || !cvLoc.lat) return null;

  const jobMunicipality = job.workplace_address?.municipality;
  if (!jobMunicipality) return null;

  const jobLoc = parseLocation(jobMunicipality);
  if (!jobLoc || !jobLoc.lat) return null;

  return calculateDistance(cvLoc.lat, cvLoc.lon, jobLoc.lat, jobLoc.lon);
}

// Beräkna geografisk score MED distansbaserad viktning
function calculateGeographyScore(cvLocations: string[], job: any, distance: number | null, isRemote: boolean): number {
  if (isRemote) return 25; // Full poäng för distansjobb

  if (distance === null || cvLocations.length === 0) return 10; // Neutral om location saknas

  // Distansbaserad viktning
  if (distance <= 15) return 25;   // Samma stad/grannkommun
  if (distance <= 50) return 20;   // Pendlingsavstånd (<1h)
  if (distance <= 100) return 12;  // Regionalt (1-2h)
  if (distance <= 200) return 5;   // Landsdel (2-3h)
  if (distance <= 350) return 2;   // Långt bort (3-5h)
  return 0;                        // Extremt långt (>5h)
}

// Extrahera kravsektion från jobbannons
function extractRequirements(jobText: string): string {
  const patterns = [
    /(?:du måste ha|krav|kvalifikationer|requirements)[:\s]+(.*?)(?=\n\n|vi erbjuder|vi söker|meriterande|om rollen|ansök|we offer|responsibilities)/si,
  ];

  for (const pattern of patterns) {
    const match = jobText.match(pattern);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
  }

  return '';
}

// Extrahera ALLT text från CV
function extractAllCVText(cvData: any): string {
  const parts: string[] = [];

  // Utbildningar
  if (cvData.education) {
    cvData.education.forEach((edu: any) => {
      parts.push(edu.degree || '', edu.institution || '', edu.description || '');
    });
  }

  // Erfarenheter
  if (cvData.experience) {
    cvData.experience.forEach((exp: any) => {
      parts.push(exp.position || '', exp.company || '');
      if (Array.isArray(exp.description)) {
        parts.push(...exp.description);
      } else if (exp.description) {
        parts.push(exp.description);
      }
    });
  }

  // Kompetenser
  if (cvData.skills) {
    cvData.skills.forEach((skillGroup: any) => {
      if (Array.isArray(skillGroup.skills)) {
        parts.push(...skillGroup.skills);
      }
    });
  }

  // Certifieringar
  if (cvData.certifications) {
    cvData.certifications.forEach((cert: any) => {
      parts.push(cert.name || '', cert.issuer || '');
    });
  }

  return parts.join(' ').toLowerCase();
}

// Applicera branschstraff (ENDAST om CV saknar kompetens)
function applyIndustryPenalty(cvData: any, job: any): number {
  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
  const requirementSection = extractRequirements(jobText);

  if (!requirementSection) return 0; // Ingen kravsektion = inget straff

  const cvText = extractAllCVText(cvData);
  let penalty = 0;

  for (const [industry, config] of Object.entries(INDUSTRY_SPECIFIC_REQUIREMENTS)) {
    // Kolla om jobbet har branschspecifikt krav
    const hasIndustryRequirement = config.keywords.some(kw =>
      requirementSection.includes(kw)
    );

    if (hasIndustryRequirement) {
      // Kolla om CV:t har matchande branschkompetens
      const hasBranchExperience = config.cvIndicators.some(indicator =>
        cvText.includes(indicator)
      );

      if (!hasBranchExperience) {
        // CV saknar branschkompetens → STRAFF
        penalty += 35;
        console.log(`Industry mismatch: Job requires ${industry}, CV lacks indicators`);
      } else {
        console.log(`Industry match: Job requires ${industry}, CV has experience`);
      }
    }
  }

  return Math.min(50, penalty); // Max -50p straff
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

  if (RELATED_OCCUPATIONS[normalized]) {
    return RELATED_OCCUPATIONS[normalized];
  }

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

  const primaryOccupation = cvOccupations[0];

  if (jobText.includes(primaryOccupation)) {
    return 20;
  }

  const relatedOccupations = getRelatedOccupations(primaryOccupation);
  for (const related of relatedOccupations) {
    if (jobText.includes(related.toLowerCase())) {
      return 15;
    }
  }

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
    if (experienceText.includes(phrase) && jobText.includes(phrase)) {
      score += weight;
    }
  }

  return Math.min(20, score);
}

// Bygg smart söksträng
function buildSmartQuery(cvData: any, analysisData: any, cvOccupations: string[]): string {
  const queryParts: string[] = [];

  if (cvOccupations.length > 0) {
    queryParts.push(cvOccupations[0]);
  }

  if (analysisData.skillSuggestions) {
    const topSkills = analysisData.skillSuggestions
      .filter((s: any) => s.relevance === 'high')
      .map((s: any) => s.skill)
      .slice(0, 2);
    queryParts.push(...topSkills);
  }

  if (analysisData.keywords) {
    const topKeywords = analysisData.keywords.slice(0, 2);
    queryParts.push(...topKeywords);
  }

  return queryParts.filter(Boolean).slice(0, 6).join(' ');
}

// Sök jobb via API
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

// Multi-query sökning
async function searchJobsMultiQuery(
  cvData: any,
  analysisData: any,
  cvOccupations: string[],
  cvLocations: string[],
  customParams?: Record<string, any>
) {
  const allJobs: any[] = [];
  const seenIds = new Set<string>();

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

// FÖRBÄTTRAD: Multi-factor relevansberäkning med distans och branschstraff
function calculateRelevance(
  cvData: any,
  analysisData: any,
  job: any,
  cvOccupations: string[],
  cvLocations: string[],
  distance: number | null,
  isRemote: boolean,
  industryPenalty: number
): number {
  let score = 0;
  const maxScore = 100;

  const jobText = `${job.headline} ${job.description?.text || ''} ${job.occupation?.label || ''}`.toLowerCase();

  // Faktor 1: Geografisk matchning (25 poäng)
  score += calculateGeographyScore(cvLocations, job, distance, isRemote);

  // Faktor 2: Yrkestitelmatchning (20 poäng)
  score += calculateOccupationScore(cvOccupations, job);

  // Faktor 3: Erfarenhetsbaserad matchning (20 poäng)
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

  // Applicera branschstraff
  score -= industryPenalty;

  // Maxtak för långdistansjobb (>200km)
  if (!isRemote && distance !== null && distance > 200) {
    score = Math.min(20, score);
  }

  return Math.max(0, Math.min(maxScore, Math.round(score)));
}

// Extrahera matchningsdetaljer
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

    const jobs = await searchJobsMultiQuery(
      cvData,
      analysisData,
      cvOccupations,
      cvLocations,
      customParams
    );

    console.log(`Found ${jobs.length} jobs via multi-query`);

    // Beräkna relevans med ALLA nya faktorer
    const jobsWithRelevance = jobs.map((job: any) => {
      const distance = calculateDistanceForJob(cvLocations, job);
      const isRemote = checkIfRemote(job);
      const industryPenalty = applyIndustryPenalty(cvData, job);
      const relevance = calculateRelevance(
        cvData,
        analysisData,
        job,
        cvOccupations,
        cvLocations,
        distance,
        isRemote,
        industryPenalty
      );
      const matchDetails = extractMatchDetails(cvData, analysisData, job, cvOccupations);

      return {
        ...job,
        relevance,
        matchDetails,
        distance,           // För UI
        isRemote,           // För UI
        industryPenalty,    // För UI-varning
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
