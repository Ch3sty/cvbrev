// Delade klienttyper för rekryterarportalen. Speglar payloaden från
// /api/recruiter/pool och /api/recruiter/candidate/[userId].
// Etikettkonstanterna återanvänds från Bli upptäckt-sidan så kandidat- och
// rekryterarsidan aldrig glider isär i benämningar.

export {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  REGIONS,
  labelFor,
} from '@/app/dashboard/bli-upptackt/components/types';

export type FamilyKey = 'matrislogik' | 'verbal' | 'numerisk';
export type Level = 'grund' | 'avancerad' | 'expert';
export type InterestStatus = 'pending' | 'accepted' | 'declined' | null;

export interface TestBadge {
  family: FamilyKey;
  label: string;
  level: Level | null;
  bestScore: number | null;
  percentile: number | null;
  /** Antal testade i underlaget ("topp X % av N testade"). */
  sampleSize: number | null;
}

export interface PoolCandidate {
  userId: string;
  role: string | null;
  skills: string[];
  regions: string[];
  availability: string | null;
  workplace: string[];
  extent: string[];
  driversLicense: boolean;
  testBadges: TestBadge[];
  personalityStrengths: string[];
  visibility: 'anonymous' | 'open';
  /** Total yrkeserfarenhet i hela år, härledd ur arbetshistoriken. */
  yearsOfExperience: number | null;
  /** Senaste rollen: titel + hur länge. */
  latestRole: { title: string; years: number | null } | null;
  /** Högsta/senaste examen ur CV:t. */
  educationLevel: string | null;
  interestStatus: InterestStatus;
}

export interface ExperienceEntry {
  position: string | null;
  company: string | null;
  period: string | null;
  description: string | null;
}

export interface EducationEntry {
  school: string | null;
  degree: string | null;
  year: string | null;
}

export interface TestResultEntry {
  family: FamilyKey;
  level: Level;
  bestScore: number;
  percentile: number | null;
  /** Antal testade i underlaget ("topp X % av N testade"). */
  sampleSize: number | null;
  completedAt: string | null;
}

export interface CandidateDetail extends Omit<PoolCandidate, 'interestStatus'> {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  testResults: TestResultEntry[];
  /** Kandidatens egenskrivna pitch, aldrig CV:ts summary. */
  pitch: string | null;
  /** Språk ur CV:t, t.ex. "Svenska (modersmål)". */
  languages: string[];
  fullName: string | null;
  email: string | null;
}

/**
 * Seniorotetsraden: samma tre fakta på träffkortet och detaljsidan.
 * Returnerar bara de fakta som faktiskt finns, t.ex.
 * ["8 års erfarenhet", "Senast: Redovisningsansvarig (4 år)", "Civilekonom"].
 */
export function seniorityFacts(candidate: {
  yearsOfExperience: number | null;
  latestRole: { title: string; years: number | null } | null;
  educationLevel: string | null;
}): string[] {
  const facts: string[] = [];
  if (candidate.yearsOfExperience !== null) {
    facts.push(`${candidate.yearsOfExperience} års erfarenhet`);
  }
  if (candidate.latestRole) {
    const { title, years } = candidate.latestRole;
    facts.push(years !== null ? `Senast: ${title} (${years} år)` : `Senast: ${title}`);
  }
  if (candidate.educationLevel) facts.push(candidate.educationLevel);
  return facts;
}

/** Personlighetsstyrkorna som kan filtreras på (samma härledning som API:t). */
export const STRENGTH_OPTIONS = [
  'Strukturerad',
  'Samarbetsvillig',
  'Utåtriktad',
  'Nyfiken',
  'Stresstålig',
];

export const PERCENTILE_FLOORS = [50, 70, 90];
