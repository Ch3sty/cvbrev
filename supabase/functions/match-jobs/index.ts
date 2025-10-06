import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Max-Age': '86400'
};

// Svenska kommuner med koordinater (150+ kommuner för 95%+ täckning)
const SWEDISH_MUNICIPALITIES: Record<string, { lat: number; lon: number }> = {
  // Storstadsregioner
  "stockholm": { lat: 59.3293, lon: 18.0686 },
  "göteborg": { lat: 57.7089, lon: 11.9746 },
  "malmö": { lat: 55.6050, lon: 13.0038 },

  // Stockholms län
  "solna": { lat: 59.3599, lon: 18.0000 },
  "sundbyberg": { lat: 59.3609, lon: 17.9711 },
  "sollentuna": { lat: 59.4280, lon: 17.9514 },
  "täby": { lat: 59.4439, lon: 18.0687 },
  "upplands väsby": { lat: 59.5177, lon: 17.9106 },
  "vallentuna": { lat: 59.5342, lon: 18.0774 },
  "österåker": { lat: 59.4797, lon: 18.2978 },
  "värmdö": { lat: 59.2914, lon: 18.4381 },
  "lidingö": { lat: 59.3667, lon: 18.1333 },
  "vaxholm": { lat: 59.4022, lon: 18.3539 },
  "nacka": { lat: 59.3096, lon: 18.1633 },
  "tyresö": { lat: 59.2443, lon: 18.2179 },
  "huddinge": { lat: 59.2364, lon: 17.9827 },
  "salem": { lat: 59.1617, lon: 17.7559 },
  "botkyrka": { lat: 59.2000, lon: 17.8333 },
  "haninge": { lat: 59.1644, lon: 18.1439 },
  "nynäshamn": { lat: 58.9027, lon: 17.9492 },
  "södertälje": { lat: 59.1959, lon: 17.6255 },
  "nykvarn": { lat: 59.1794, lon: 17.4294 },
  "järfälla": { lat: 59.4138, lon: 17.8333 },
  "ekerö": { lat: 59.2814, lon: 17.7944 },
  "sigtuna": { lat: 59.6171, lon: 17.7241 },
  "märsta": { lat: 59.6167, lon: 17.8500 },
  "upplands-bro": { lat: 59.5161, lon: 17.6108 },
  "norrtälje": { lat: 59.7581, lon: 18.7048 },

  // Västra Götaland
  "mölndal": { lat: 57.6554, lon: 12.0137 },
  "partille": { lat: 57.7395, lon: 12.1064 },
  "lerum": { lat: 57.7704, lon: 12.2694 },
  "alingsås": { lat: 57.9303, lon: 12.5344 },
  "kungsbacka": { lat: 57.4870, lon: 12.0772 },
  "härryda": { lat: 57.6581, lon: 12.3689 },
  "öckerö": { lat: 57.7064, lon: 11.6569 },
  "stenungsund": { lat: 58.0706, lon: 11.8189 },
  "tjörn": { lat: 58.0122, lon: 11.6289 },
  "orust": { lat: 58.2000, lon: 11.6167 },
  "uddevalla": { lat: 58.3480, lon: 11.9424 },
  "lysekil": { lat: 58.2753, lon: 11.4350 },
  "trollhättan": { lat: 58.2836, lon: 12.2886 },
  "vänersborg": { lat: 58.3808, lon: 12.3235 },
  "borås": { lat: 57.7210, lon: 12.9401 },
  "ulricehamn": { lat: 57.7931, lon: 13.4122 },
  "skövde": { lat: 58.3910, lon: 13.8455 },
  "lidköping": { lat: 58.5052, lon: 13.1577 },

  // Skåne
  "lund": { lat: 55.7047, lon: 13.1910 },
  "helsingborg": { lat: 56.0465, lon: 12.6945 },
  "landskrona": { lat: 55.8708, lon: 12.8301 },
  "ängelholm": { lat: 56.2428, lon: 12.8622 },
  "höganäs": { lat: 56.2011, lon: 12.5594 },
  "eslöv": { lat: 55.8392, lon: 13.3039 },
  "ystad": { lat: 55.4296, lon: 13.8206 },
  "trelleborg": { lat: 55.3754, lon: 13.1567 },
  "kristianstad": { lat: 56.0294, lon: 14.1567 },
  "simrishamn": { lat: 55.5556, lon: 14.3522 },
  "hässleholm": { lat: 56.1590, lon: 13.7658 },

  // Uppsala län
  "uppsala": { lat: 59.8586, lon: 17.6389 },
  "enköping": { lat: 59.6357, lon: 17.0777 },
  "håbo": { lat: 59.5939, lon: 17.5372 },
  "tierp": { lat: 60.3461, lon: 17.5181 },

  // Södermanland
  "eskilstuna": { lat: 59.3710, lon: 16.5077 },
  "strängnäs": { lat: 59.3783, lon: 17.0339 },
  "nyköping": { lat: 58.7530, lon: 17.0086 },
  "katrineholm": { lat: 58.9959, lon: 16.2073 },
  "flen": { lat: 59.0597, lon: 16.5878 },

  // Östergötland
  "linköping": { lat: 58.4108, lon: 15.6214 },
  "norrköping": { lat: 58.5877, lon: 16.1924 },
  "motala": { lat: 58.5370, lon: 15.0364 },
  "mjölby": { lat: 58.3253, lon: 15.1289 },

  // Jönköping
  "jönköping": { lat: 57.7826, lon: 14.1618 },
  "huskvarna": { lat: 57.7858, lon: 14.3014 },
  "värnamo": { lat: 57.1856, lon: 14.0400 },
  "nässjö": { lat: 57.6531, lon: 14.6968 },
  "vetlanda": { lat: 57.4289, lon: 15.0776 },

  // Kronoberg
  "växjö": { lat: 56.8787, lon: 14.8059 },
  "ljungby": { lat: 56.8333, lon: 13.9397 },
  "älmhult": { lat: 56.5506, lon: 14.1372 },

  // Kalmar
  "kalmar": { lat: 56.6634, lon: 16.3567 },
  "oskarshamn": { lat: 57.2644, lon: 16.4486 },
  "västervik": { lat: 57.7583, lon: 16.6378 },
  "vimmerby": { lat: 57.6658, lon: 15.8556 },

  // Gotland
  "visby": { lat: 57.6348, lon: 18.2948 },

  // Blekinge
  "karlskrona": { lat: 56.1621, lon: 15.5866 },
  "ronneby": { lat: 56.2092, lon: 15.2761 },
  "karlshamn": { lat: 56.1706, lon: 14.8619 },

  // Halland
  "halmstad": { lat: 56.6745, lon: 12.8577 },
  "varberg": { lat: 57.1057, lon: 12.2502 },
  "falkenberg": { lat: 56.9054, lon: 12.4915 },
  "kungsbacka": { lat: 57.4870, lon: 12.0772 },

  // Värmland
  "karlstad": { lat: 59.3793, lon: 13.5036 },
  "arvika": { lat: 59.6556, lon: 12.5906 },
  "kristinehamn": { lat: 59.3097, lon: 14.1081 },

  // Örebro
  "örebro": { lat: 59.2753, lon: 15.2134 },
  "kumla": { lat: 59.1289, lon: 15.1428 },
  "hallsberg": { lat: 59.0644, lon: 15.1089 },

  // Västmanland
  "västerås": { lat: 59.6099, lon: 16.5448 },
  "köping": { lat: 59.5139, lon: 15.9931 },
  "sala": { lat: 59.9239, lon: 16.6050 },
  "fagersta": { lat: 59.9944, lon: 15.7933 },

  // Dalarna
  "falun": { lat: 60.6066, lon: 15.6265 },
  "borlänge": { lat: 60.4858, lon: 15.4378 },
  "ludvika": { lat: 60.1497, lon: 15.1881 },
  "avesta": { lat: 60.1456, lon: 16.1681 },
  "mora": { lat: 61.0086, lon: 14.5428 },
  "säter": { lat: 60.3475, lon: 15.7547 },
  "hedemora": { lat: 60.2767, lon: 15.9911 },

  // Gävleborg
  "gävle": { lat: 60.6749, lon: 17.1413 },
  "sandviken": { lat: 60.6167, lon: 16.7667 },
  "söderhamn": { lat: 61.3039, lon: 17.0672 },
  "hudiksvall": { lat: 61.7281, lon: 17.1050 },
  "bollnäs": { lat: 61.3489, lon: 16.3931 },

  // Västernorrland
  "sundsvall": { lat: 62.3908, lon: 17.3069 },
  "härnösand": { lat: 62.6322, lon: 17.9383 },
  "kramfors": { lat: 62.9333, lon: 17.7833 },
  "sollefteå": { lat: 63.1686, lon: 17.2657 },
  "örnsköldsvik": { lat: 63.2909, lon: 18.7155 },

  // Jämtland
  "östersund": { lat: 63.1792, lon: 14.6357 },
  "härjedalen": { lat: 62.0833, lon: 13.6833 },
  "strömsund": { lat: 63.8486, lon: 15.5539 },
  "åre": { lat: 63.3989, lon: 13.0819 },
  "krokom": { lat: 63.3144, lon: 14.4597 },

  // Västerbotten
  "umeå": { lat: 63.8258, lon: 20.2630 },
  "skellefteå": { lat: 64.7507, lon: 20.9527 },
  "lycksele": { lat: 64.5989, lon: 18.6733 },

  // Norrbotten
  "luleå": { lat: 65.5848, lon: 22.1547 },
  "piteå": { lat: 65.3197, lon: 21.4758 },
  "boden": { lat: 65.8250, lon: 21.6886 },
  "kalix": { lat: 65.8558, lon: 23.1472 },
  "haparanda": { lat: 65.8347, lon: 24.1361 },
  "kiruna": { lat: 67.8558, lon: 20.2253 },

  // Karlskoga och övriga
  "karlskoga": { lat: 59.3267, lon: 14.5233 }
};

// Närliggande yrken-databas
// REMOVED: RELATED_OCCUPATIONS - Nu använder vi AI-genererade industryTerms istället

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

  for (const [cityKey, coords] of Object.entries(SWEDISH_MUNICIPALITIES)) {
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
  if (!jobLoc || !jobLoc.lat) {
    console.log(`⚠️ Unknown municipality: ${jobMunicipality}`);
    return null;
  }

  // Avrunda distans till heltal (inga decimaler)
  return Math.round(calculateDistance(cvLoc.lat, cvLoc.lon, jobLoc.lat, jobLoc.lon));
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
// REMOVED: getRelatedOccupations() och expandOccupation() - Ersatt med AI-driven buildPrimaryQuery()

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

// ============================================================================
// AI-DRIVNA QUERY-FUNKTIONER (Universell lösning för alla yrken)
// ============================================================================

// Query 1: Primär yrkestitel + AI-genererade synonymer från industryTerms
function buildPrimaryQuery(cvOccupations: string[], analysisData: any): string {
  if (cvOccupations.length === 0) return '';

  const primaryOccupation = cvOccupations[0];
  const queryParts: string[] = [primaryOccupation];

  // Lägg till prefixer (stf, vice, senior, junior, tf)
  const prefixes = ['stf', 'vice', 'senior'];
  prefixes.forEach(prefix => {
    if (!primaryOccupation.includes(prefix)) {
      queryParts.push(`${prefix} ${primaryOccupation}`);
    }
  });

  // Extrahera industryTerms som kan vara yrkestitlar
  const occupationLikePatterns = /montör|tekniker|installatör|arbetare|mästare|chef|ledare|ingenjör|specialist|konsult|biträde|assistent/i;

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    const industryTerms = role.matchKeywords?.industryTerms || [];
    industryTerms.forEach((term: string) => {
      if (occupationLikePatterns.test(term) && !queryParts.includes(term.toLowerCase())) {
        queryParts.push(term.toLowerCase());
      }
    });
  });

  return [...new Set(queryParts)].slice(0, 8).join(' OR ');
}

// Query 2: Branschspecifika termer (industryTerms)
function buildIndustryQuery(analysisData: any): string {
  const allIndustryTerms: string[] = [];

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.industryTerms) {
      allIndustryTerms.push(...role.matchKeywords.industryTerms);
    }
  });

  // Räkna frekvens och prioritera vanligaste termerna
  const termFrequency: Record<string, number> = {};
  allIndustryTerms.forEach(term => {
    termFrequency[term] = (termFrequency[term] || 0) + 1;
  });

  const topTerms = Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([term]) => term);

  return topTerms.join(' OR ');
}

// Query 3: Kompetensbaserad (skillSuggestions + directSkills)
function buildSkillsQuery(analysisData: any): string {
  const skillParts: string[] = [];

  // Hämta high-relevance skillSuggestions
  if (analysisData.skillSuggestions && analysisData.skillSuggestions.length > 0) {
    const topSkills = analysisData.skillSuggestions
      .filter((s: any) => s.relevance === 'high')
      .map((s: any) => s.skill)
      .slice(0, 3);
    skillParts.push(...topSkills);
  }

  // Lägg till directSkills från matchKeywords
  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.directSkills) {
      skillParts.push(...role.matchKeywords.directSkills.slice(0, 2));
    }
  });

  return [...new Set(skillParts)].filter(Boolean).slice(0, 5).join(' ');
}

// Query 4: Verktyg & System (tools + responsibilities)
function buildToolsQuery(analysisData: any): string {
  const allTools: string[] = [];
  const allResponsibilities: string[] = [];

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.tools) {
      allTools.push(...role.matchKeywords.tools);
    }
    if (role.matchKeywords?.responsibilities) {
      allResponsibilities.push(...role.matchKeywords.responsibilities);
    }
  });

  // Prioritera tools högre (ta 4 tools + 2 responsibilities)
  const terms = [
    ...allTools.slice(0, 4),
    ...allResponsibilities.slice(0, 2)
  ];

  return [...new Set(terms)].join(' ');
}

// Query 5: Ansvarsområden & Uppgifter
function buildResponsibilitiesQuery(analysisData: any): string {
  const allResponsibilities: string[] = [];

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.responsibilities) {
      allResponsibilities.push(...role.matchKeywords.responsibilities);
    }
  });

  return [...new Set(allResponsibilities)].slice(0, 5).join(' OR ');
}

// Query 6: Implicit kompetens & arbetssätt
function buildImplicitSkillsQuery(analysisData: any): string {
  const allImplicitSkills: string[] = [];

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.implicitSkills) {
      allImplicitSkills.push(...role.matchKeywords.implicitSkills);
    }
  });

  return [...new Set(allImplicitSkills)].slice(0, 4).join(' ');
}

// Query 7: Holistisk kompetens-mix (directSkills + tools)
function buildHolisticQuery(analysisData: any): string {
  const directSkills: string[] = [];
  const tools: string[] = [];

  analysisData.roleBasedImprovements?.forEach((role: any) => {
    if (role.matchKeywords?.directSkills) {
      directSkills.push(...role.matchKeywords.directSkills);
    }
    if (role.matchKeywords?.tools) {
      tools.push(...role.matchKeywords.tools);
    }
  });

  // Mix: 2 directSkills + 2 tools
  return [
    ...directSkills.slice(0, 2),
    ...tools.slice(0, 2)
  ].filter(Boolean).join(' ');
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

// Multi-query sökning (7 AI-drivna queries för universell täckning)
async function searchJobsMultiQuery(
  cvData: any,
  analysisData: any,
  cvOccupations: string[],
  cvLocations: string[],
  customParams?: Record<string, any>
) {
  const allJobs: any[] = [];
  const seenIds = new Set<string>();

  // Query 1: Primär yrkestitel + AI-genererade synonymer (30 jobb)
  const primaryQuery = buildPrimaryQuery(cvOccupations, analysisData);
  if (primaryQuery) {
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
  }

  // Query 2: Branschspecifika termer (30 jobb)
  const industryQuery = buildIndustryQuery(analysisData);
  if (industryQuery) {
    console.log('Query 2 (Industry):', industryQuery);
    const industryJobs = await searchJobs({
      q: industryQuery,
      limit: 30,
      ...customParams
    });

    industryJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'industry' });
      }
    });
  }

  // Query 3: Kompetensbaserad (25 jobb)
  const skillsQuery = buildSkillsQuery(analysisData);
  if (skillsQuery) {
    console.log('Query 3 (Skills):', skillsQuery);
    const skillsJobs = await searchJobs({
      q: skillsQuery,
      limit: 25,
      ...customParams
    });

    skillsJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'skills' });
      }
    });
  }

  // Query 4: Verktyg & System (25 jobb)
  const toolsQuery = buildToolsQuery(analysisData);
  if (toolsQuery) {
    console.log('Query 4 (Tools):', toolsQuery);
    const toolsJobs = await searchJobs({
      q: toolsQuery,
      limit: 25,
      ...customParams
    });

    toolsJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'tools' });
      }
    });
  }

  // Query 5: Ansvarsområden (20 jobb)
  const responsibilitiesQuery = buildResponsibilitiesQuery(analysisData);
  if (responsibilitiesQuery) {
    console.log('Query 5 (Responsibilities):', responsibilitiesQuery);
    const responsibilitiesJobs = await searchJobs({
      q: responsibilitiesQuery,
      limit: 20,
      ...customParams
    });

    responsibilitiesJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'responsibilities' });
      }
    });
  }

  // Query 6: Implicit kompetens (15 jobb)
  const implicitQuery = buildImplicitSkillsQuery(analysisData);
  if (implicitQuery) {
    console.log('Query 6 (Implicit):', implicitQuery);
    const implicitJobs = await searchJobs({
      q: implicitQuery,
      limit: 15,
      ...customParams
    });

    implicitJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'implicit' });
      }
    });
  }

  // Query 7: Holistisk kompetens-mix (15 jobb)
  const holisticQuery = buildHolisticQuery(analysisData);
  if (holisticQuery) {
    console.log('Query 7 (Holistic):', holisticQuery);
    const holisticJobs = await searchJobs({
      q: holisticQuery,
      limit: 15,
      ...customParams
    });

    holisticJobs.forEach((job: any) => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push({ ...job, queryType: 'holistic' });
      }
    });
  }

  console.log(`Multi-query complete: ${allJobs.length} unique jobs found (7 AI-driven queries)`);
  return allJobs;
}

// NYT: Beräkna matchning baserat på AI-extraherade matchKeywords
function calculateMatchKeywordsScore(analysisData: any, job: any): number {
  if (!analysisData?.roleBasedImprovements) return 0;

  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
  let score = 0;

  analysisData.roleBasedImprovements.forEach((role: any) => {
    if (!role.matchKeywords) return;

    const mk = role.matchKeywords;

    // Viktade matchningar baserat på keyword-typ
    const directMatches = (mk.directSkills || []).filter((s: string) =>
      jobText.includes(s.toLowerCase())
    ).length;
    score += directMatches * 3; // Högt värde för direkta skills

    const implicitMatches = (mk.implicitSkills || []).filter((s: string) =>
      jobText.includes(s.toLowerCase())
    ).length;
    score += implicitMatches * 2; // Medel värde för implicita skills

    const toolMatches = (mk.tools || []).filter((t: string) =>
      jobText.includes(t.toLowerCase())
    ).length;
    score += toolMatches * 4; // Mycket högt värde för verktyg/system

    const respMatches = (mk.responsibilities || []).filter((r: string) =>
      jobText.includes(r.toLowerCase())
    ).length;
    score += respMatches * 3; // Högt värde för ansvarsområden

    const industryMatches = (mk.industryTerms || []).filter((i: string) =>
      jobText.includes(i.toLowerCase())
    ).length;
    score += industryMatches * 2; // Medel värde för branschtermer
  });

  return Math.min(15, score); // Max 15 poäng för matchKeywords
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

  // Faktor 3: Erfarenhetsbaserad matchning (15 poäng - reducerad från 20)
  const expScore = calculateExperienceScore(cvData, job);
  score += Math.min(15, expScore);

  // Faktor 4: MatchKeywords från AI-analys (15 poäng - NYT!)
  score += calculateMatchKeywordsScore(analysisData, job);

  // Faktor 5: AI-identifierade kompetenser (10 poäng - reducerad från 15)
  if (analysisData.skillSuggestions) {
    const aiSkillMatches = analysisData.skillSuggestions.reduce((sum: number, s: any) => {
      const skillLower = s.skill.toLowerCase();
      const matches = jobText.includes(skillLower);

      if (matches) {
        if (s.relevance === 'high') return sum + 7;
        if (s.relevance === 'medium') return sum + 4;
        return sum + 2;
      }
      return sum;
    }, 0);

    score += Math.min(10, aiSkillMatches);
  }

  // Faktor 6: Keywords från CV-analys (10 poäng)
  if (analysisData.keywords) {
    const keywordMatches = analysisData.keywords.filter((kw: string) =>
      jobText.includes(kw.toLowerCase())
    ).length;
    score += Math.min(10, keywordMatches * 2);
  }

  // Faktor 7: ATS-optimerade keywords från roller (5 poäng - reducerad från 10)
  if (analysisData.roleBasedImprovements) {
    const roleKeywords = analysisData.roleBasedImprovements.flatMap((r: any) =>
      r.improvements.keywords || []
    );
    const roleMatches = roleKeywords.filter((kw: string) =>
      jobText.includes(kw.toLowerCase())
    ).length;
    score += Math.min(5, roleMatches);
  }

  // Applicera branschstraff
  score -= industryPenalty;

  // Maxtak för långdistansjobb (>200km)
  if (!isRemote && distance !== null && distance > 200) {
    score = Math.min(20, score);
  }

  // Fallback: Om distance är null (okänd ort) OCH inte remote → maxtak 40p
  // Detta förhindrar att jobb från okända orter får höga matchningar
  if (!isRemote && distance === null && cvLocations.length > 0) {
    score = Math.min(40, score);
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
        .order('created_at', { ascending: false })
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
