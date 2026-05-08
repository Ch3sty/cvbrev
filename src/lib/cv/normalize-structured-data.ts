/**
 * Normaliserar `structured_data` från databasen till CVMetadata.
 *
 * Bakgrund: CV:n i Supabase har sparats med tva olika scheman over tid.
 *  - Aldre CV:n (parseCV i cv-parser.ts): ParsedCV-format med roles[], name,
 *    contact, profile, education[]
 *  - Nyare CV:n (parseSwedishCVContent): CVMetadata-format med personalInfo,
 *    experience[], summary, education[], skills[]
 *
 * Vara HTML-mallar forvantar sig CVMetadata. Skickar man in ParsedCV
 * kraschar de pa `personalInfo.fullName`. Den har funktionen detektar
 * och normaliserar bada formaten.
 *
 * Om input ar uppenbart trasig (varken format gar att lasa) returneras null
 * sa anroparen kan falla tillbaka till regex-parsern pa cv_text.
 */

import type { CVMetadata } from './cv-metadata';
import type { ParsedCV } from './cv-parser';

/**
 * Returnerar giltig CVMetadata eller null om input inte gar att normalisera.
 */
export function normalizeStructuredData(input: unknown): CVMetadata | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, any>;

  // Format 1: redan CVMetadata (har personalInfo OCH experience)
  if (
    obj.personalInfo &&
    typeof obj.personalInfo === 'object' &&
    typeof obj.personalInfo.fullName === 'string'
  ) {
    return ensureValidCVMetadata(obj as CVMetadata);
  }

  // Format 2: ParsedCV (har roles + name eller profile)
  if (Array.isArray(obj.roles) && (typeof obj.name === 'string' || typeof obj.profile === 'string')) {
    return parsedCVToCVMetadata(obj as ParsedCV);
  }

  // Okant format - returera null sa anroparen vet att fallback behovs
  return null;
}

/**
 * Garanterar att CVMetadata har minimi-falten satta sa mallarna inte kraschar.
 * Tomma arrayer ar OK; mallarna hanterar det. Men personalInfo.fullName MASTE
 * vara en sang.
 */
function ensureValidCVMetadata(data: CVMetadata): CVMetadata | null {
  if (!data.personalInfo?.fullName || typeof data.personalInfo.fullName !== 'string') {
    return null;
  }
  return {
    ...data,
    personalInfo: {
      fullName: data.personalInfo.fullName,
      email: data.personalInfo.email || '',
      phone: data.personalInfo.phone,
      address: data.personalInfo.address,
      location: data.personalInfo.location,
      linkedIn: data.personalInfo.linkedIn,
      linkedin: data.personalInfo.linkedin,
      website: data.personalInfo.website,
      github: data.personalInfo.github,
      title: data.personalInfo.title,
      profilePhotoUrl: data.personalInfo.profilePhotoUrl,
    },
    summary: data.summary,
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : undefined,
    certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
    languages: Array.isArray(data.languages) ? data.languages : undefined,
    interests: Array.isArray(data.interests) ? data.interests : undefined,
    references: data.references,
  };
}

/**
 * Konverterar gamla ParsedCV (roles[]) till nya CVMetadata (experience[]).
 */
function parsedCVToCVMetadata(parsed: ParsedCV): CVMetadata | null {
  const fullName = (parsed.name || '').trim();
  if (!fullName) return null;

  // Period-strang till start/end. Hanterar bade "-" och "–" + "Pagaende"/"Nuvarande"
  const splitPeriod = (period: string): { start: string; end?: string } => {
    if (!period) return { start: '' };
    const parts = period.split(/\s*[-–]\s*/);
    const start = parts[0]?.trim() || '';
    const rawEnd = parts[1]?.trim();
    if (!rawEnd) return { start };
    const lower = rawEnd.toLowerCase();
    if (lower === 'pagaende' || lower === 'pågående' || lower === 'nuvarande' || lower === 'present') {
      return { start, end: undefined };
    }
    return { start, end: rawEnd };
  };

  return {
    personalInfo: {
      fullName,
      email: parsed.contact?.email || '',
      phone: parsed.contact?.phone,
      address: parsed.contact?.address,
    },
    summary: parsed.profile,
    experience: (parsed.roles || []).map(role => {
      const { start, end } = splitPeriod(role.period || '');
      // Foredra responsibilities[] som description; faller tillbaka till
      // description-stangen split pa nyrad om responsibilities ar tom
      let description: string[] = [];
      if (Array.isArray(role.responsibilities) && role.responsibilities.length > 0) {
        description = role.responsibilities.filter(r => r && r.trim());
      } else if (typeof role.description === 'string' && role.description.trim()) {
        description = role.description
          .split(/[\n•·]/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      return {
        position: role.title || '',
        company: role.company || '',
        startDate: start,
        endDate: end,
        description,
      };
    }),
    education: (parsed.education || []).map(edu => {
      const { start, end } = splitPeriod(edu.period || '');
      return {
        degree: edu.degree || '',
        institution: edu.institution || '',
        startDate: start,
        endDate: end,
        graduationYear: end || start,
        description: edu.description,
      };
    }),
    skills: (parsed.skills && parsed.skills.length > 0)
      ? [{ category: 'Kompetenser', skills: parsed.skills }]
      : [],
  };
}
