// Delade typer och konstanter för "Bli upptäckt"-sidan.

export type Visibility = 'off' | 'anonymous' | 'open';
export type Availability = 'immediate' | 'one_month' | 'three_months' | 'by_agreement';
export type Level = 'grund' | 'avancerad' | 'expert';
export type FamilyKey = 'matrislogik' | 'verbal' | 'numerisk';

export interface CandidateProfileState {
  cv_id: string | null;
  visibility: Visibility;
  show_personality: boolean;
  availability: Availability | null;
  workplace: string[];
  extent: string[];
  employment_types: string[];
  regions: string[];
  drivers_license: boolean;
  salary_min: number | null;
  salary_max: number | null;
  pitch: string | null;
  consent_given_at: string | null;
}

export const EMPTY_PROFILE: CandidateProfileState = {
  cv_id: null,
  visibility: 'off',
  show_personality: false,
  availability: null,
  workplace: [],
  extent: [],
  employment_types: [],
  regions: [],
  drivers_license: false,
  salary_min: null,
  salary_max: null,
  pitch: null,
  consent_given_at: null,
};

export interface FamilyResult {
  done: boolean;
  bestScore: number | null;
  level: Level | null;
  percentile: number | null;
  completedAt: string | null;
}

export interface SummaryData {
  results: Record<FamilyKey, FamilyResult>;
  personality: {
    done: boolean;
    strengths: string[];
    /**
     * Arbetsstilsprofil ur det avancerade testets facetter (120 frågor).
     * null/undefined för grundtestare.
     */
    workStyle?: {
      archetype: { title: string; description: string };
      statements: string[];
    } | null;
  };
  skills: { skills: string[]; occupation: string | null; location: string | null };
  /** Senioritet härledd ur CV:ts arbetshistorik (fas 3.5). */
  seniority?: {
    yearsOfExperience: number | null;
    latestRole: { title: string; years: number | null } | null;
    educationLevel: string | null;
  };
}

export interface CvOption {
  id: string;
  file_name: string;
  created_at: string;
  updated_at: string | null;
  isLocked: boolean;
}

export const FAMILY_LABELS: Record<FamilyKey, string> = {
  matrislogik: 'Matrislogik',
  verbal: 'Verbalt',
  numerisk: 'Numeriskt',
};

export const LEVEL_LABELS: Record<Level, string> = {
  grund: 'Grundnivå',
  avancerad: 'Avancerad nivå',
  expert: 'Expertnivå',
};

export const AVAILABILITY_OPTIONS: Array<{ value: Availability; label: string }> = [
  { value: 'immediate', label: 'Omgående' },
  { value: 'one_month', label: '1 månad' },
  { value: 'three_months', label: '3 månader' },
  { value: 'by_agreement', label: 'Enligt överenskommelse' },
];

export const WORKPLACE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'onsite', label: 'På plats' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Distans' },
];

export const EXTENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'full_time', label: 'Heltid' },
  { value: 'part_time', label: 'Deltid' },
  { value: 'hourly', label: 'Extra och timmar' },
];

export const EMPLOYMENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'permanent', label: 'Tillsvidare' },
  { value: 'temporary', label: 'Visstid' },
  { value: 'consultant', label: 'Konsult' },
];

/** Sveriges 21 län. */
export const REGIONS: string[] = [
  'Blekinge län',
  'Dalarnas län',
  'Gotlands län',
  'Gävleborgs län',
  'Hallands län',
  'Jämtlands län',
  'Jönköpings län',
  'Kalmar län',
  'Kronobergs län',
  'Norrbottens län',
  'Skåne län',
  'Stockholms län',
  'Södermanlands län',
  'Uppsala län',
  'Värmlands län',
  'Västerbottens län',
  'Västernorrlands län',
  'Västmanlands län',
  'Västra Götalands län',
  'Örebro län',
  'Östergötlands län',
];

export function labelFor(
  options: Array<{ value: string; label: string }>,
  value: string | null
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}
