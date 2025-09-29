/**
 * CV Parser - Intelligent parsing of CV content to identify roles, companies, and periods
 * Uses AI to extract structured data from unstructured CV text
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
export async function parseCV(cvText: string): Promise<ParsedCV> {
  try {
    console.log('🔍 Parsing CV with AI to identify roles and structure...');

    const prompt = `Analysera följande CV och extrahera strukturerad data.

CV-text:
${cvText}

Returnera en JSON-struktur med följande format:
{
  "name": "Personens namn",
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
  "skills": ["färdighet1", "färdighet2"]
}

VIKTIGA REGLER:
1. För varje roll, inkludera EXAKT företagsnamn och period
2. Om period saknas, skriv "Period ej angiven"
3. Extrahera alla ansvarsområden som lista
4. Behåll originaltext exakt som den står i CV:t
5. Om något inte finns, lämna tomt eller null

Exempel på korrekt rollextraktion:
{
  "title": "Platschef",
  "company": "Fitnessworld Skärholmen",
  "period": "2014 - pågående",
  "description": "Platschef för Fitnessworlds största anläggning, administrativt arbete med influenser av HR och personalansvar",
  "responsibilities": ["inköp", "drift", "personal", "webbsidan", "medlemssystem", "statistik"],
  "originalText": "Platschef, Fitnessworld Skärholmen Stockholm, 2014-pågående. Platschef för Fitnessworlds största anläggning..."
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en expert på att analysera och strukturera CV-information. Svara alltid med giltig JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent parsing
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsedData = JSON.parse(content) as ParsedCV;

    // Validate and clean the parsed data
    parsedData.roles = (parsedData.roles || []).map(role => ({
      ...role,
      title: role.title || 'Okänd titel',
      company: role.company || 'Okänt företag',
      period: role.period || 'Period ej angiven',
      description: role.description || '',
      responsibilities: role.responsibilities || [],
      originalText: role.originalText || role.description || '',
    }));

    parsedData.education = (parsedData.education || []).map(edu => ({
      ...edu,
      degree: edu.degree || 'Okänd utbildning',
      institution: edu.institution || 'Okänd institution',
      period: edu.period || 'Period ej angiven',
    }));

    parsedData.skills = parsedData.skills || [];

    console.log('✅ CV parsed successfully:', {
      rolesFound: parsedData.roles.length,
      educationFound: parsedData.education.length,
      skillsFound: parsedData.skills.length,
    });

    return parsedData;

  } catch (error) {
    console.error('❌ Error parsing CV:', error);
    // Return a fallback structure if AI parsing fails
    return fallbackParse(cvText);
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