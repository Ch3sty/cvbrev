/**
 * CV Parser - Intelligent parsing of CV content to identify roles, companies, and periods
 * Uses AI to extract structured data from unstructured CV text
 */

import { generateJSON, GEMINI_MODELS } from '@/lib/gemini';
import { tvattaSprak, type InlastSprak } from './sprak';
import { extractContactLocally, type ExtractedContact } from '@/lib/privacy/extractContact';
import { maskaCvForModel, rensaDjupt } from '@/lib/privacy/cvForModel';

// Interfaces for parsed CV structure
export interface ParsedRole {
  title: string;          // e.g., "Platschef"
  company: string;        // e.g., "Fitnessworld Skärholmen"
  period: string;         // e.g., "2014 - pågående"
  description: string;    // Full text from CV
  responsibilities: string[]; // ["inköp", "drift", "personal"]
  originalText: string;   // Exact text from CV for this role
}

export interface ParsedEducation {
  degree: string;         // e.g., "Byggprogrammet"
  institution: string;    // e.g., "Södertörns Hantverksgymnasium"
  period: string;         // e.g., "2009-2012"
  description?: string;   // Additional details
}

export interface ParsedCV {
  roles: ParsedRole[];
  education: ParsedEducation[];
  skills: string[];
  /**
   * Språk som uttryckligen står i CV:t (src/lib/cv/sprak.ts). Lyckad
   * inläsning sätter alltid listan, tom när inget språk står; saknad nyckel
   * betyder att vi aldrig letat (CV inlästa före 2026-11-21 och reserven).
   */
  languages?: InlastSprak[];
  profile?: string;
  name?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Parse CV text using AI to extract structured data
 */
export async function parseCV(
  cvText: string,
  options: {
    fullName?: string | null;
    phone?: string | null;
    /**
     * Kontaktuppgifter som anroparen redan läst lokalt ur råtexten. Behövs
     * när cvText redan är maskad (uppladdningen sparar bara maskad text):
     * då står det [TEL] och [EMAIL] där uppgifterna fanns. Icke-tomma fält
     * här går före det som hittas i cvText. Skickas aldrig till modellen.
     */
    kontakt?: Partial<ExtractedContact> | null;
  } = {}
): Promise<ParsedCV> {
  // Inga personuppgifter till modellen (ägarens beslut 2026-11-21). Namn och
  // kontaktuppgifter läses lokalt ur texten (eller kommer ur profilen) och
  // sätts in efter svaret; modellen får den maskade texten och ombeds inte
  // längre om namnet.
  const lokal = extractContactLocally(cvText);
  for (const [nyckel, varde] of Object.entries(options.kontakt ?? {})) {
    if (typeof varde === 'string' && varde.trim()) {
      lokal[nyckel as keyof ExtractedContact] = varde.trim();
    }
  }
  const namn = lokal.fullName || (options.fullName ?? '').trim();
  const maskad = maskaCvForModel(cvText, {
    fullName: options.fullName ?? null,
    extraNames: [lokal.fullName],
    knownPhones: [options.phone, lokal.phone],
  });
  try {
    console.log('🔍 Parsing CV with AI to identify roles and structure...');

    const prompt = `Analysera följande CV och extrahera strukturerad data.
Personuppgifter är ersatta med platshållare som [NAMN] och [TELEFON]. Återge dem aldrig.

CV-text:
${maskad}

Returnera en JSON-struktur med följande format:
{
  "profile": "Profilsammanfattning om den finns",
  "roles": [
    {
      "title": "Jobbtitel",
      "company": "Företagsnamn",
      "period": "Tidsperiod (t.ex. '2014 - pågående')",
      "description": "Full beskrivning av rollen från CV:t",
      "responsibilities": ["ansvar1", "ansvar2"],
      "originalText": "Exakt text från CV:t för denna roll"
    }
  ],
  "education": [
    {
      "degree": "Utbildning/Program",
      "institution": "Skola/Universitet",
      "period": "Tidsperiod",
      "description": "Eventuella detaljer"
    }
  ],
  "skills": ["färdighet1", "färdighet2"],
  "languages": [
    { "language": "Språket som det står i CV:t", "proficiency": "Nivån som CV:t anger den, eller tom sträng" }
  ]
}

KRITISKA REGLER FÖR SVENSKA CV:n:
1. Företagsnamn är ALLTID det faktiska företaget, ALDRIG ord som "ansvarig", "ansvar", "text", "arbete"
2. Om texten säger "Platschef, Fitnessworld Skärholmen" → company: "Fitnessworld Skärholmen"
3. Om texten säger "är ansvarig för inköp..." → detta är responsibilities, INTE company
4. Om någon "agerade projektledare" inom annan roll, behåll originaltiteln (t.ex. "Målare")
5. Extrahera EXAKT företagsnamn efter kommatecken i rollbeskrivningar
6. Vid sammmanhängande text, identifiera var varje ny roll börjar

REGLER FÖR SPRÅK (languages):
1. Ta BARA med språk som uttryckligen står i CV-texten: i ett avsnitt som "Språk", "Språkkunskaper" eller "Languages", eller i löptext som "flytande engelska" eller "talar arabiska".
2. Gissa ALDRIG språk utifrån vilket språk CV:t är skrivet på, personens namn, ursprung eller arbetsplatser. Ett svenskt CV utan språkavsnitt ger INTE "Svenska".
3. Skriv språkets namn som det står i CV:t, utan nivån (t.ex. "Engelska", inte "Flytande engelska").
4. proficiency: nivån så som CV:t anger den, översatt till en av "Modersmål", "Tvåspråkig", "Flytande", "Konversation", "Nybörjare" (mycket god eller C1/C2 = Flytande, god eller B1/B2 = Konversation, grundläggande eller A1/A2 = Nybörjare). Anger CV:t ingen nivå: tom sträng "".
5. Står inga språk i CV:t: "languages": [].

VANLIGA FEL ATT UNDVIKA:
- "Ansvarig" är ALDRIG ett företagsnamn
- Om någon är "ansvarig för" något, tillhör det föregående roll
- "Projektledare" som sekundärt ansvar ska inte bli en egen roll

Exempel på KORREKT rollextraktion:
{
  "title": "Platschef",
  "company": "Fitnessworld Skärholmen",  // INTE "ansvarig"!
  "period": "2014 - pågående",
  "description": "Platschef för Fitnessworlds största anläggning, administrativt arbete med influenser av HR och personalansvar. Är i dagsäget ansvarig för inköp, drift, personal...",
  "responsibilities": ["inköp", "drift", "personal", "webbsidan", "medlemssystem", "statistik"],
  "originalText": "Platschef, Fitnessworld Skärholmen Stockholm, 2014-pågående. Platschef för Fitnessworlds största anläggning... Är i dagsäget ansvarig för inköp..."
}

{
  "title": "Målare",  // INTE "Projektledare"!
  "company": "Lingfjords Fasadtvätt AB",
  "period": "2014",
  "description": "Utförde renovering av taket på Vårbergsskolan, eget ansvar över 5.000kvm. Agerade projektledare...",
  "responsibilities": ["renovering", "projektledning", "tid- och kostnadsplanering", "besiktning"],
  "originalText": "Målare, Lingfjords Fasadtvätt AB Stockholm, Vårberg — 2014-2014..."
}`;

    const { data: svar } = await generateJSON<ParsedCV>({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du är en expert på att analysera och strukturera CV-information. Svara alltid med giltig JSON.',
      prompt,
      temperature: 0.1, // Låg temperatur för konsekvent parsning
      // 2600 sedan språken kom med (2026-11-21): ett kapat svar blir
      // ogiltig JSON och faller till reserven.
      maxOutputTokens: 2600,
      thinkingBudget: 0,
    });

    // Platshållarna från maskeringen följer aldrig med in i strukturen.
    // Namn och kontakt sätts lokalt, aldrig ur modellens svar.
    const parsedData = rensaDjupt(svar) as ParsedCV;
    parsedData.name = namn;
    parsedData.contact = {
      email: lokal.email,
      // Bara det som står i CV:t: poängen för kontaktuppgifter räknas på det.
      phone: lokal.phone,
      address: [lokal.address, lokal.postalCode, lokal.city].filter(Boolean).join(', '),
    };

    // Validate and clean the parsed data
    parsedData.roles = (parsedData.roles || []).map(role => {
      // Validera och korrigera företagsnamn
      let company = role.company || 'Okänt företag';
      const invalidCompanies = ['ansvarig', 'ansvar', 'text', 'arbete', 'roll', 'tjänst'];

      if (invalidCompanies.some(invalid => company.toLowerCase() === invalid)) {
        console.warn(`⚠️ Invalid company name detected: "${company}", marking as unknown`);
        company = 'Okänt företag';

        // Försök hitta rätt företag från originaltext
        if (role.originalText) {
          const companyMatch = role.originalText.match(/,\s*([A-ZÅÄÖ][^,]+?)\s*(?:Stockholm|Göteborg|Malmö|Sverige|AB|\d{4})/i);
          if (companyMatch) {
            company = companyMatch[1].trim();
            console.log(`✅ Found correct company from originalText: "${company}"`);
          }
        }
      }

      return {
        ...role,
        title: role.title || 'Okänd titel',
        company: company,
        period: role.period || 'Period ej angiven',
        description: role.description || '',
        responsibilities: role.responsibilities || [],
        originalText: role.originalText || role.description || '',
      };
    });

    parsedData.education = (parsedData.education || []).map(edu => ({
      ...edu,
      degree: edu.degree || 'Okänd utbildning',
      institution: edu.institution || 'Okänd institution',
      period: edu.period || 'Period ej angiven',
    }));

    // En kompetens som bara var en platshållare är tom efter tvätten.
    parsedData.skills = (parsedData.skills || []).filter((s) => typeof s === 'string' && s.trim().length > 0);

    // Alltid en lista vid lyckad inläsning: nyckeln betyder "vi har letat".
    // Bara språk som står i texten följer med (inga gissade modersmål).
    parsedData.languages = tvattaSprak(parsedData.languages, cvText);

    console.log('✅ CV parsed successfully:', {
      rolesFound: parsedData.roles.length,
      educationFound: parsedData.education.length,
      skillsFound: parsedData.skills.length,
      languagesFound: parsedData.languages.length,
    });

    return parsedData;

  } catch (error) {
    console.error('❌ Error parsing CV:', error);
    // Return a fallback structure if AI parsing fails. Reserven letar inte
    // efter språk och får därför ingen languages-nyckel (sprakLage blir
    // 'inte_inlast', inte 'saknas').
    // Reserven körs lokalt (ingen AI) och får samma lokala namn och kontakt.
    return {
      ...fallbackParse(cvText),
      name: namn,
      contact: {
        email: lokal.email,
        phone: lokal.phone,
        address: [lokal.address, lokal.postalCode, lokal.city].filter(Boolean).join(', '),
      },
    };
  }
}

/**
 * Fallback parsing using regex and heuristics if AI fails
 */
function fallbackParse(cvText: string): ParsedCV {
  console.log('⚠️ Using fallback CV parsing...');

  const lines = cvText.split('\n').filter(line => line.trim());
  const roles: ParsedRole[] = [];
  const education: ParsedEducation[] = [];
  const skills: string[] = [];

  // Try to identify work experience section
  const workKeywords = ['erfarenhet', 'arbetslivserfarenhet', 'anställningar', 'tjänster'];
  const eduKeywords = ['utbildning', 'studier', 'examen'];
  const skillKeywords = ['färdigheter', 'kompetenser', 'kunskaper', 'skills'];

  let currentSection = '';
  let currentRole: Partial<ParsedRole> | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for section headers
    if (workKeywords.some(kw => lowerLine.includes(kw))) {
      currentSection = 'work';
      continue;
    }
    if (eduKeywords.some(kw => lowerLine.includes(kw))) {
      currentSection = 'education';
      continue;
    }
    if (skillKeywords.some(kw => lowerLine.includes(kw))) {
      currentSection = 'skills';
      continue;
    }

    // Parse based on current section
    if (currentSection === 'work') {
      // Look for patterns like "Title, Company, Period"
      const rolePattern = /^([^,]+),\s*([^,]+),?\s*([\d]{4}[\s\-–]+[\dpågående]+)?/i;
      const match = line.match(rolePattern);

      if (match) {
        // Save previous role if exists
        if (currentRole && currentRole.title) {
          roles.push(currentRole as ParsedRole);
        }

        currentRole = {
          title: match[1].trim(),
          company: match[2].trim(),
          period: match[3]?.trim() || 'Period ej angiven',
          description: '',
          responsibilities: [],
          originalText: line,
        };
      } else if (currentRole && line.trim()) {
        // Add to current role description
        currentRole.description = (currentRole.description || '') + ' ' + line.trim();

        // Try to extract responsibilities
        if (lowerLine.includes('ansvarig') || lowerLine.includes('ansvar')) {
          const respMatch = line.match(/ansvarig för ([^.]+)/i);
          if (respMatch) {
            currentRole.responsibilities = respMatch[1].split(/[,;]/).map(r => r.trim());
          }
        }
      }
    }

    if (currentSection === 'education') {
      // Look for education patterns
      const eduPattern = /^([^,\d]+),?\s*([\d]{4}[\s\-–]+[\d]{4})?/i;
      const match = line.match(eduPattern);

      if (match && match[1].length > 5) {
        education.push({
          degree: match[1].trim(),
          institution: 'Ej specificerad',
          period: match[2]?.trim() || 'Period ej angiven',
        });
      }
    }

    if (currentSection === 'skills' && line.trim()) {
      // Extract skills (comma or semicolon separated)
      const skillList = line.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
      skills.push(...skillList);
    }
  }

  // Add last role if exists
  if (currentRole && currentRole.title) {
    roles.push(currentRole as ParsedRole);
  }

  // If no roles found, create a generic one
  if (roles.length === 0) {
    console.warn('⚠️ No roles found in fallback parsing, creating generic role');
    roles.push({
      title: 'Yrkesroll',
      company: 'Arbetsgivare',
      period: 'Period ej angiven',
      description: cvText.substring(0, 500),
      responsibilities: [],
      originalText: cvText.substring(0, 500),
    });
  }

  return {
    roles,
    education,
    skills: [...new Set(skills)], // Remove duplicates
    profile: undefined,
  };
}

/**
 * Extract specific role information for improvement generation
 */
export function extractRoleContext(role: ParsedRole): string {
  return `${role.title} på ${role.company} (${role.period})`;
}

/**
 * Validate parsed CV data
 */
export function validateParsedCV(parsedCV: ParsedCV): boolean {
  // Check that we have at least one role
  if (!parsedCV.roles || parsedCV.roles.length === 0) {
    console.error('❌ No roles found in parsed CV');
    return false;
  }

  // Check that roles have required fields
  for (const role of parsedCV.roles) {
    if (!role.title || !role.company) {
      console.error('❌ Role missing required fields:', role);
      return false;
    }
  }

  return true;
}

/**
 * Get a summary of the parsed CV for logging
 */
export function getParsedCVSummary(parsedCV: ParsedCV): string {
  const rolesSummary = parsedCV.roles
    .map(r => `${r.title} at ${r.company}`)
    .join(', ');

  return `CV with ${parsedCV.roles.length} roles (${rolesSummary}), ${parsedCV.education.length} education entries, and ${parsedCV.skills.length} skills`;
}