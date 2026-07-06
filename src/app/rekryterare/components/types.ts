// Delade klienttyper för rekryterarportalen. Speglar payloaden från
// /api/recruiter/pool, /api/recruiter/candidate/[userId] och projekt-API:erna.
// Server-typerna importeras type-only från lib så kontrakten aldrig glider
// isär; etikettkonstanterna återanvänds från Bli upptäckt-sidan.

import type {
  CandidateCard,
  CandidateDetail,
  TestBadge,
  TestResultEntry,
  ExperienceEntry,
  EducationEntry,
  FamilyKey,
  Level,
  EducationLevelBucket,
  WorkStyleReport,
  InterviewQuestion,
  SpectrumView,
  ThrivesCard,
} from '@/lib/recruiter/candidateData';

export type {
  CandidateCard,
  CandidateDetail,
  TestBadge,
  TestResultEntry,
  ExperienceEntry,
  EducationEntry,
  FamilyKey,
  Level,
  EducationLevelBucket,
  WorkStyleReport,
  InterviewQuestion,
  SpectrumView,
  ThrivesCard,
};

export {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  EMPLOYMENT_OPTIONS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  REGIONS,
  labelFor,
} from '@/app/dashboard/bli-upptackt/components/types';

// Klient-säkra konstanter ur arbetsstilsmotorn (ren data, inga server-beroenden).
export { ARCHETYPE_TITLES, CONTEXT_TAG_MICROCOPY } from '@/lib/recruiter/workStyle';

export type InterestStatus = 'pending' | 'accepted' | 'declined' | null;

/** Poolens träffkort: serverkortet + matchförklaring + intressestatus. */
export type PoolCandidate = CandidateCard & {
  matchReasons: string[];
  interestStatus: InterestStatus;
};

export type PoolSortKey = 'relevance' | 'seniority' | 'recent' | 'testScore';

export const SORT_OPTIONS: Array<{ value: PoolSortKey; label: string }> = [
  { value: 'relevance', label: 'Relevans' },
  { value: 'seniority', label: 'Senioritet' },
  { value: 'recent', label: 'Senast aktiv' },
  { value: 'testScore', label: 'Testresultat' },
];

export const FAMILY_ORDER: FamilyKey[] = ['matrislogik', 'verbal', 'numerisk'];

export const SENIORITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'junior', label: 'Junior (0-2 år)' },
  { value: 'mid', label: 'Mid (3-5 år)' },
  { value: 'senior', label: 'Senior (6-9 år)' },
  { value: 'expert', label: 'Expert (10+ år)' },
];

export const EDUCATION_LEVEL_OPTIONS: EducationLevelBucket[] = [
  'Gymnasial',
  'Eftergymnasial',
  'Kandidat',
  'Master',
  'Forskarnivå',
];

/** Radio-stegen för testresultatfiltret: percentilgolv → etikett. */
export const PERCENTILE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Alla' },
  { value: '50', label: 'Topp 50 %' },
  { value: '75', label: 'Topp 25 %' },
  { value: '90', label: 'Topp 10 %' },
];

/** Kandidatstatus inom ett projekt. */
export const PROJECT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'ny', label: 'Ny' },
  { value: 'kontaktad', label: 'Kontaktad' },
  { value: 'vantar', label: 'Väntar' },
  { value: 'dialog', label: 'Dialog' },
];

/** Personlighetsstyrkorna som kan filtreras på (samma härledning som API:t). */
export const STRENGTH_OPTIONS = [
  'Strukturerad',
  'Samarbetsvillig',
  'Utåtriktad',
  'Nyfiken',
  'Stresstålig',
];

// ---------------------------------------------------------------------------
// Filterpanelens tillstånd + översättning till query-params och sparade
// sökningars filter-JSON (serverns PoolFilters-form).
// ---------------------------------------------------------------------------

export interface PoolFilterState {
  q: string;
  seniority: string[];
  regions: string[];
  availability: string;
  workplace: string[];
  extent: string[];
  employmentTypes: string[];
  /** '' | '50' | '75' | '90' */
  minPercentile: string;
  testFamilies: string[];
  strengths: string[];
  archetypes: string[];
  educationLevels: string[];
  budget: string;
  driversLicense: boolean;
}

export const EMPTY_POOL_FILTERS: PoolFilterState = {
  q: '',
  seniority: [],
  regions: [],
  availability: '',
  workplace: [],
  extent: [],
  employmentTypes: [],
  minPercentile: '',
  testFamilies: [],
  strengths: [],
  archetypes: [],
  educationLevels: [],
  budget: '',
  driversLicense: false,
};

export function countActiveFilters(f: PoolFilterState): number {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.seniority.length) n++;
  if (f.regions.length) n++;
  if (f.availability) n++;
  if (f.workplace.length) n++;
  if (f.extent.length) n++;
  if (f.employmentTypes.length) n++;
  if (f.minPercentile) n++;
  if (f.strengths.length) n++;
  if (f.archetypes.length) n++;
  if (f.educationLevels.length) n++;
  if (f.budget.trim()) n++;
  if (f.driversLicense) n++;
  return n;
}

/** Query-params till GET /api/recruiter/pool. Listor kommaseparerade. */
export function buildPoolParams(
  f: PoolFilterState,
  sort: PoolSortKey,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.seniority.length) params.set('seniority', f.seniority.join(','));
  if (f.regions.length) params.set('regions', f.regions.join(','));
  if (f.availability) params.set('availability', f.availability);
  if (f.workplace.length) params.set('workplace', f.workplace.join(','));
  if (f.extent.length) params.set('extent', f.extent.join(','));
  if (f.employmentTypes.length) params.set('employmentTypes', f.employmentTypes.join(','));
  if (f.minPercentile) params.set('minPercentile', f.minPercentile);
  if (f.testFamilies.length) params.set('testFamilies', f.testFamilies.join(','));
  if (f.strengths.length) params.set('strengths', f.strengths.join(','));
  if (f.archetypes.length) params.set('archetypes', f.archetypes.join(','));
  if (f.educationLevels.length) params.set('educationLevels', f.educationLevels.join(','));
  const budget = Number.parseInt(f.budget, 10);
  if (Number.isFinite(budget) && budget > 0) params.set('budget', String(budget));
  if (f.driversLicense) params.set('driversLicense', 'true');
  if (sort !== 'relevance') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  return params;
}

/** Filterpanelens tillstånd → sparad söknings filter-JSON (serverform). */
export function filterStateToSaved(f: PoolFilterState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (f.q.trim()) out.q = f.q.trim();
  if (f.seniority.length) out.seniority = f.seniority;
  if (f.regions.length) out.regions = f.regions;
  if (f.availability) out.availability = f.availability;
  if (f.workplace.length) out.workplace = f.workplace;
  if (f.extent.length) out.extent = f.extent;
  if (f.employmentTypes.length) out.employmentTypes = f.employmentTypes;
  if (f.minPercentile) out.minPercentile = Number.parseInt(f.minPercentile, 10);
  if (f.testFamilies.length) out.testFamilies = f.testFamilies;
  if (f.strengths.length) out.strengths = f.strengths;
  if (f.archetypes.length) out.archetypes = f.archetypes;
  if (f.educationLevels.length) out.educationLevels = f.educationLevels;
  const budget = Number.parseInt(f.budget, 10);
  if (Number.isFinite(budget) && budget > 0) out.budget = budget;
  if (f.driversLicense) out.driversLicense = true;
  return out;
}

/** Sparad söknings filter-JSON → filterpanelens tillstånd. Defensiv parsing. */
export function savedToFilterState(filters: Record<string, unknown>): PoolFilterState {
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  const num = (v: unknown): string =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? String(v) : '';
  return {
    q: str(filters.q),
    seniority: list(filters.seniority),
    regions: list(filters.regions),
    availability: str(filters.availability),
    workplace: list(filters.workplace),
    extent: list(filters.extent),
    employmentTypes: list(filters.employmentTypes),
    minPercentile: num(filters.minPercentile),
    testFamilies: list(filters.testFamilies),
    strengths: list(filters.strengths),
    archetypes: list(filters.archetypes),
    educationLevels: list(filters.educationLevels),
    budget: num(filters.budget),
    driversLicense: filters.driversLicense === true,
  };
}

// ---------------------------------------------------------------------------
// Övriga API-former
// ---------------------------------------------------------------------------

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  candidateCount: number;
  recentInitials: string[];
}

export interface ProjectCandidate {
  candidateUserId: string;
  status: string;
  addedAt: string;
  card: CandidateCard;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  notify: boolean;
  lastNotifiedAt: string | null;
  createdAt: string;
}

export interface InterestItem {
  interestId: string;
  candidateUserId: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  message: string | null;
  card: CandidateCard | null;
}

// ---------------------------------------------------------------------------
// Delade hjälpare
// ---------------------------------------------------------------------------

/**
 * Senioritetsraden: samma fakta på träffkortet och detaljsidan, t.ex.
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

/** "2026-06-12T…" → "12 juni". null vid oparsbart datum. */
export function formatShortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long' }).format(
    new Date(time)
  );
}

/** "2026-06-12T…" → "12 juni 2026". */
export function formatLongDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(time));
}

/** Primär CTA-gradient (designregeln: orange → röd → mörkrosa). */
export const CTA_GRADIENT = 'linear-gradient(135deg, #F97316 0%, #DC2626 55%, #BE185D 100%)';

/**
 * Enkel klientspegel av serverns tokenisering, för näst-bästa-åtgärden
 * "Sök bara på X" i tomma läget.
 */
export function tokenizePreview(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}
