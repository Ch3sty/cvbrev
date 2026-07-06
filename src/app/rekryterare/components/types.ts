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
  completedAt: string | null;
}

export interface CandidateDetail extends Omit<PoolCandidate, 'interestStatus'> {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  testResults: TestResultEntry[];
  fullName: string | null;
  email: string | null;
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
