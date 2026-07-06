// src/lib/recruiter/candidateData.ts
// Delade serverfunktioner för rekryterarportalen: bygger träffkort och
// detaljprofiler ur kandidatdata. Körs ALLTID med admin-klienten efter att
// anroparen verifierat att rekryteraren är inloggad och godkänd —
// candidate_profiles med flera tabeller har ägare-endast-RLS.
//
// MASKERINGSREGEL (gäller all data som lämnar servern):
//   - contactUnlocked = intresse med status 'accepted' ELLER profilens
//     visibility = 'open'. Först då visas namn och arbetsgivarnamn — en
//     komplett arbetshistorik med företagsnamn identifierar en person lika
//     säkert som namnet.
//   - E-post kräver ALLTID accepterat intresse (emailUnlocked), även för
//     öppna profiler. Öppen profil visar alltså namn + arbetsgivare, men
//     kontaktvägen låses upp först när kandidaten själv sagt ja.
//   - salary_min/salary_max får ALDRIG lämna servern, oavsett upplåsning.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type Admin = SupabaseClient<Database>;

export type Level = 'grund' | 'avancerad' | 'expert';
export type FamilyKey = 'matrislogik' | 'verbal' | 'numerisk';

const MIN_PERCENTILE_SAMPLE = 25;

// Samma familje-/test_type-mappning som /api/candidate/summary — exakta
// test_type-värden verifierade mot session-routes. Prov-typerna ingår
// medvetet inte (träningsläge, inte verifierat resultat).
const FAMILIES: Record<FamilyKey, { types: [string, string, string] }> = {
  matrislogik: {
    types: ['matrislogik', 'matrislogik-avancerad', 'matrislogik-expert'],
  },
  verbal: {
    types: ['verbal-resonemang', 'verbal-resonemang-v2', 'verbal-resonemang-expert'],
  },
  numerisk: {
    types: ['numerical-reasoning', 'numerical-reasoning-v2', 'numerical-reasoning-expert'],
  },
};

const LEVELS: Level[] = ['grund', 'avancerad', 'expert'];
const FAMILY_ORDER: FamilyKey[] = ['matrislogik', 'verbal', 'numerisk'];

export const FAMILY_LABELS: Record<FamilyKey, string> = {
  matrislogik: 'Matrislogik',
  verbal: 'Verbalt',
  numerisk: 'Numeriskt',
};

// Big Five → styrkeetiketter, samma härledning som /api/candidate/summary.
// Neuroticism inverteras: låg neuroticism är styrkan "Stresstålig".
const STRENGTH_MAP: Array<{ column: string; label: string; invert: boolean }> = [
  { column: 'conscientiousness', label: 'Strukturerad', invert: false },
  { column: 'agreeableness', label: 'Samarbetsvillig', invert: false },
  { column: 'extraversion', label: 'Utåtriktad', invert: false },
  { column: 'openness', label: 'Nyfiken', invert: false },
  { column: 'neuroticism', label: 'Stresstålig', invert: true },
];

export const STRENGTH_LABELS = STRENGTH_MAP.map((s) => s.label);

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

/** Raden ur candidate_profiles som funktionerna behöver. */
export interface CandidateProfileRow {
  user_id: string;
  cv_id: string | null;
  visibility: 'anonymous' | 'open';
  show_personality: boolean | null;
  availability: string | null;
  workplace: string[] | null;
  extent: string[] | null;
  employment_types: string[] | null;
  regions: string[] | null;
  drivers_license: boolean | null;
  /** Kandidatens egenskrivna pitch (max 300 tecken, fas 3.5). */
  pitch?: string | null;
  // salary_min/salary_max kan finnas på raden men läses aldrig här.
}

export interface TestBadge {
  family: FamilyKey;
  /** Färdigformaterad etikett, t.ex. "Matrislogik · topp 12 %". */
  label: string;
  level: Level | null;
  bestScore: number | null;
  percentile: number | null;
  /** Antal testade i underlaget ("topp 12 % av 340 testade"). */
  sampleSize: number | null;
}

export interface CandidateCard {
  userId: string;
  role: string | null;
  skills: string[];
  regions: string[];
  availability: string | null;
  workplace: string[];
  extent: string[];
  driversLicense: boolean;
  testBadges: TestBadge[];
  /** Endast ifylld när kandidaten aktivt valt show_personality. */
  personalityStrengths: string[];
  visibility: 'anonymous' | 'open';
  /** Total yrkeserfarenhet i hela år, härledd ur arbetshistorikens perioder. */
  yearsOfExperience: number | null;
  /** Senaste rollen: titel + hur länge (arbetsgivaren alltid maskerad här). */
  latestRole: { title: string; years: number | null } | null;
  /** Högsta/senaste examen ur CV:t. */
  educationLevel: string | null;
  /** Kandidatens egenskrivna pitch, visas även på träffkortet. */
  pitch: string | null;
}

export interface ExperienceEntry {
  position: string | null;
  /** null tills contactUnlocked — se maskeringsregeln i filhuvudet. */
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

export interface CandidateDetail extends CandidateCard {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  /** Samtliga slutförda familjer+nivåer, inte bara bästa per familj. */
  testResults: TestResultEntry[];
  /** Språk ur CV:t, t.ex. "Svenska (modersmål)". */
  languages: string[];
  /** Namn låses upp av contactUnlocked (accepterat intresse ELLER öppen profil). */
  fullName: string | null;
  /** E-post låses ENBART upp vid accepterat intresse. */
  email: string | null;
}

// ---------------------------------------------------------------------------
// Percentilkontext: cachar aggregatfrågor så poolens kortbygge inte gör om
// samma count-frågor för varje kandidat. Samma beräkning som summary-routen:
// andel sessioner med lägre score inom samma test_type, golv på underlaget.
// ---------------------------------------------------------------------------

export interface PercentileContext {
  getPercentile(testType: string, score: number): Promise<number | null>;
  /** Percentil + underlagets storlek, för "topp X % av N testade"-tolkningen. */
  getStats(
    testType: string,
    score: number
  ): Promise<{ percentile: number | null; sampleSize: number }>;
}

export function createPercentileContext(admin: Admin): PercentileContext {
  const totalCache = new Map<string, Promise<number>>();
  const belowCache = new Map<string, Promise<number>>();

  const totalFor = (testType: string): Promise<number> => {
    let cached = totalCache.get(testType);
    if (!cached) {
      cached = (admin as any)
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .not('score', 'is', null)
        .then((res: { count: number | null }) => res.count ?? 0);
      totalCache.set(testType, cached!);
    }
    return cached!;
  };

  const belowFor = (testType: string, score: number): Promise<number> => {
    const key = `${testType}:${score}`;
    let cached = belowCache.get(key);
    if (!cached) {
      cached = (admin as any)
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .lt('score', score)
        .then((res: { count: number | null }) => res.count ?? 0);
      belowCache.set(key, cached!);
    }
    return cached!;
  };

  const getStats = async (
    testType: string,
    score: number
  ): Promise<{ percentile: number | null; sampleSize: number }> => {
    const total = await totalFor(testType);
    if (total < MIN_PERCENTILE_SAMPLE) return { percentile: null, sampleSize: total };
    const below = await belowFor(testType, score);
    return { percentile: Math.round((100 * below) / total), sampleSize: total };
  };

  return {
    getStats,
    async getPercentile(testType: string, score: number): Promise<number | null> {
      return (await getStats(testType, score)).percentile;
    },
  };
}

// ---------------------------------------------------------------------------
// Träffkortet
// ---------------------------------------------------------------------------

interface SessionRow {
  test_type: string | null;
  score: number | null;
  completed_at: string | null;
}

const ALL_TEST_TYPES = Object.values(FAMILIES).flatMap((f) => f.types);

async function fetchSessions(admin: Admin, userId: string): Promise<SessionRow[]> {
  const { data, error } = await (admin as any)
    .from('logic_test_v4_sessions')
    .select('test_type, score, completed_at')
    .eq('user_id', userId)
    .in('test_type', ALL_TEST_TYPES)
    .not('completed_at', 'is', null)
    .not('score', 'is', null);
  if (error) {
    console.error('candidateData: kunde inte hämta sessioner', error);
    return [];
  }
  return data ?? [];
}

function badgeLabel(family: FamilyKey, percentile: number | null, bestScore: number | null): string {
  // Samma formatering som RecruiterPreviewCard på kandidatens Bli upptäckt-sida.
  return percentile !== null
    ? `${FAMILY_LABELS[family]} · topp ${Math.max(1, 100 - percentile)} %`
    : `${FAMILY_LABELS[family]} · ${bestScore}% rätt`;
}

async function buildTestBadges(
  sessions: SessionRow[],
  ctx: PercentileContext
): Promise<TestBadge[]> {
  const badges = await Promise.all(
    FAMILY_ORDER.map(async (family) => {
      const { types } = FAMILIES[family];
      const own = sessions.filter((s) => s.test_type && types.includes(s.test_type));
      if (own.length === 0) return null;

      // Bästa session över alla nivåer: högst score, vid lika högre nivå,
      // därefter senast slutförd — samma sortering som summary-routen.
      const best = [...own].sort((a, b) => {
        const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        const levelDiff =
          types.indexOf(b.test_type as string) - types.indexOf(a.test_type as string);
        if (levelDiff !== 0) return levelDiff;
        return (
          new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
        );
      })[0];

      const level = LEVELS[types.indexOf(best.test_type as string)];
      const { percentile, sampleSize } = await ctx.getStats(
        best.test_type as string,
        best.score ?? 0
      );

      const badge: TestBadge = {
        family,
        level,
        bestScore: best.score,
        percentile,
        sampleSize,
        label: badgeLabel(family, percentile, best.score),
      };
      return badge;
    })
  );
  return badges.filter((b): b is TestBadge => b !== null);
}

async function fetchPersonalityStrengths(admin: Admin, userId: string): Promise<string[]> {
  const { data } = await (admin as any)
    .from('user_personality_profile')
    .select('openness, conscientiousness, extraversion, agreeableness, neuroticism')
    .eq('user_id', userId)
    .maybeSingle();
  const row = data as Record<string, number> | null;
  if (!row) return [];
  return STRENGTH_MAP
    .map(({ column, label, invert }) => ({
      label,
      value: invert ? 100 - (row[column] ?? 50) : row[column] ?? 50,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((s) => s.label);
}

// ---------------------------------------------------------------------------
// Senioritet, utbildning och språk ur structured_data (fas 3.5).
// Rekryterarens första sorteringsfråga är "hur senior?" — utan år och senaste
// roll ser en nyexad och en ekonomichef identiska ut i poolen.
// ---------------------------------------------------------------------------

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const ONGOING_RE = /\b(nu|nuvarande|pågående|idag|present|current)\b|[-–—]\s*$/i;

/** Tolkar en periodkälla till start/slut i ms. Slut = null betyder pågående. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseInterval(raw: any): { start: number; end: number | null } | null {
  // Format A (CV-byggaren/parsern): startDate/endDate "YYYY(-MM(-DD))".
  const startStr = typeof raw?.startDate === 'string' ? raw.startDate.trim() : '';
  if (/^\d{4}/.test(startStr)) {
    const start = Date.parse(startStr.length === 4 ? `${startStr}-01-01` : startStr);
    if (!Number.isNaN(start)) {
      const endStr = typeof raw?.endDate === 'string' ? raw.endDate.trim() : '';
      if (!endStr || ONGOING_RE.test(endStr)) return { start, end: null };
      const end = Date.parse(endStr.length === 4 ? `${endStr}-12-31` : endStr);
      return { start, end: Number.isNaN(end) ? null : end };
    }
  }
  // Format B (äldre parsade): period-sträng, t.ex. "2019–2023" eller "2021 - nu".
  const period = typeof raw?.period === 'string' ? raw.period : '';
  const years = period.match(/(19|20)\d{2}/g);
  if (!years || years.length === 0) return null;
  const start = Date.parse(`${years[0]}-01-01`);
  if (Number.isNaN(start)) return null;
  if (ONGOING_RE.test(period)) return { start, end: null };
  const lastYear = years[years.length - 1];
  const end = Date.parse(`${lastYear}-12-31`);
  return { start, end: Number.isNaN(end) ? null : end };
}

export interface Seniority {
  yearsOfExperience: number | null;
  latestRole: { title: string; years: number | null } | null;
}

/** Total erfarenhet (överlapp räknas en gång) + senaste roll med varaktighet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveSeniority(sd: any, now: number = Date.now()): Seniority {
  const rawList: unknown[] = Array.isArray(sd?.experience)
    ? sd.experience
    : Array.isArray(sd?.roles)
      ? sd.roles
      : [];

  const entries = rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any) => {
      const title: string | null =
        (typeof raw?.position === 'string' && raw.position.trim()) ||
        (typeof raw?.title === 'string' && raw.title.trim()) ||
        null;
      const interval = parseInterval(raw);
      return title && interval ? { title, ...interval } : null;
    })
    .filter((e): e is { title: string; start: number; end: number | null } => e !== null)
    // Framtida startdatum är datafel — hoppa över.
    .filter((e) => e.start <= now);

  if (entries.length === 0) return { yearsOfExperience: null, latestRole: null };

  // Slå ihop överlappande intervall så parallella anställningar inte dubbelräknas.
  const sorted = [...entries].sort((a, b) => a.start - b.start);
  let totalMs = 0;
  let curStart = sorted[0].start;
  let curEnd = sorted[0].end ?? now;
  for (const e of sorted.slice(1)) {
    const end = e.end ?? now;
    if (e.start <= curEnd) {
      curEnd = Math.max(curEnd, end);
    } else {
      totalMs += curEnd - curStart;
      curStart = e.start;
      curEnd = end;
    }
  }
  totalMs += curEnd - curStart;

  const totalYears = Math.round(totalMs / YEAR_MS);
  const yearsOfExperience = totalMs >= YEAR_MS / 2 ? Math.max(1, totalYears) : null;

  // Senaste roll: pågående vinner, annars senast avslutad.
  const latest = [...entries].sort((a, b) => {
    const aOngoing = a.end === null ? 1 : 0;
    const bOngoing = b.end === null ? 1 : 0;
    if (aOngoing !== bOngoing) return bOngoing - aOngoing;
    return (b.end ?? now) - (a.end ?? now);
  })[0];
  const latestMs = (latest.end ?? now) - latest.start;
  const latestYears = latestMs >= YEAR_MS / 2 ? Math.max(1, Math.round(latestMs / YEAR_MS)) : null;

  return {
    yearsOfExperience,
    latestRole: { title: latest.title, years: latestYears },
  };
}

/** Senaste examen ur utbildningslistan (max graduationYear, fallback första). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveEducationLevel(sd: any): string | null {
  const rawList: unknown[] = Array.isArray(sd?.education) ? sd.education : [];
  const withDegree = rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any) => {
      const degree = (typeof raw?.degree === 'string' && raw.degree.trim()) || null;
      if (!degree) return null;
      const yearSource =
        raw?.graduationYear ?? (typeof raw?.period === 'string' ? raw.period : '');
      const yearMatch = String(yearSource).match(/(19|20)\d{2}/g);
      const year = yearMatch ? parseInt(yearMatch[yearMatch.length - 1], 10) : 0;
      return { degree, year };
    })
    .filter((e): e is { degree: string; year: number } => e !== null);
  if (withDegree.length === 0) return null;
  const best = withDegree.sort((a, b) => b.year - a.year)[0];
  return truncate(best.degree, 48);
}

/** Språk ur CV:t: strängar eller { language, proficiency }. Max 5. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveLanguages(sd: any): string[] {
  const rawList: unknown[] = Array.isArray(sd?.languages) ? sd.languages : [];
  return rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any): string | null => {
      if (typeof raw === 'string' && raw.trim()) return raw.trim();
      const lang = typeof raw?.language === 'string' ? raw.language.trim() : '';
      if (!lang) return null;
      const prof = typeof raw?.proficiency === 'string' ? raw.proficiency.trim() : '';
      return prof ? `${lang} (${prof.toLowerCase()})` : lang;
    })
    .filter((l): l is string => l !== null)
    .slice(0, 5);
}

/**
 * Roll + kompetenser med samma fallback-kedja som /api/candidate/summary:
 * extraktionen i active_cv_for_matching först, annars cv_texts.structured_data.
 * Filnamnet används ALDRIG — det läcker ofta användarens namn i anonymt läge.
 * Returnerar även structured_data så anroparen kan härleda senioritet utan
 * en extra fråga.
 */
async function fetchRoleAndSkills(
  admin: Admin,
  userId: string,
  cvId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ occupation: string | null; skills: string[]; sd: any | null }> {
  let query = (admin as any)
    .from('active_cv_for_matching')
    .select('extracted_skills, extracted_occupations, parsed_at')
    .eq('user_id', userId);
  if (cvId) query = query.eq('cv_id', cvId);

  const { data: extractedRow, error } = await query
    .order('parsed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error('candidateData: active_cv_for_matching-fel', error);

  const firstOccupation = extractedRow?.extracted_occupations?.[0] as
    | { original: string; normalized: string }
    | undefined;
  const extracted = {
    skills: ((extractedRow?.extracted_skills as string[] | null) ?? []).slice(0, 8),
    occupation: firstOccupation
      ? firstOccupation.normalized || firstOccupation.original || null
      : null,
  };

  // Structured data hämtas alltid — senioritet/utbildning behöver den även
  // när extraktionen täcker roll och kompetenser.
  const sd = await fetchStructuredData(admin, userId, cvId);

  if (extracted.occupation && extracted.skills.length > 0) return { ...extracted, sd };
  if (!sd) return { ...extracted, sd: null };

  const occupation: string | null =
    extracted.occupation ||
    (typeof sd?.experience?.[0]?.position === 'string' && sd.experience[0].position) ||
    (typeof sd?.roles?.[0]?.title === 'string' && sd.roles[0].title) ||
    null;

  let skills: string[] = extracted.skills;
  if (skills.length === 0 && Array.isArray(sd?.skills)) {
    if (typeof sd.skills[0] === 'string') {
      skills = sd.skills.filter((s: unknown) => typeof s === 'string');
    } else {
      skills = sd.skills
        .flatMap((group: { skills?: unknown }) =>
          Array.isArray(group?.skills) ? group.skills : []
        )
        .filter((s: unknown) => typeof s === 'string');
    }
    skills = skills.slice(0, 8);
  }

  return { occupation, skills, sd };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchStructuredData(
  admin: Admin,
  userId: string,
  cvId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  let query = (admin as any)
    .from('cv_texts')
    .select('structured_data')
    .eq('user_id', userId)
    .not('structured_data', 'is', null);
  if (cvId) query = query.eq('id', cvId);

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('candidateData: cv_texts-fel', error);
    return null;
  }
  return data?.structured_data ?? null;
}

/**
 * Träffkortet i poolen: kompakt sammanfattning utan identifierande fält.
 * `ctx` kan delas mellan flera anrop så percentil-aggregaten bara räknas en
 * gång per test_type i en pool-förfrågan.
 */
export async function buildCandidateCard(
  admin: Admin,
  profileRow: CandidateProfileRow,
  ctx?: PercentileContext
): Promise<CandidateCard> {
  const percentileCtx = ctx ?? createPercentileContext(admin);

  const [roleSkills, sessions, personalityStrengths] = await Promise.all([
    fetchRoleAndSkills(admin, profileRow.user_id, profileRow.cv_id),
    fetchSessions(admin, profileRow.user_id),
    profileRow.show_personality
      ? fetchPersonalityStrengths(admin, profileRow.user_id)
      : Promise.resolve([]),
  ]);

  const testBadges = await buildTestBadges(sessions, percentileCtx);
  const seniority = deriveSeniority(roleSkills.sd);

  return {
    userId: profileRow.user_id,
    role: roleSkills.occupation,
    skills: roleSkills.skills.slice(0, 6),
    regions: profileRow.regions ?? [],
    availability: profileRow.availability,
    workplace: profileRow.workplace ?? [],
    extent: profileRow.extent ?? [],
    driversLicense: Boolean(profileRow.drivers_license),
    testBadges,
    // ENDAST om kandidaten själv valt att visa personlighet.
    personalityStrengths,
    visibility: profileRow.visibility,
    yearsOfExperience: seniority.yearsOfExperience,
    latestRole: seniority.latestRole,
    educationLevel: deriveEducationLevel(roleSkills.sd),
    pitch: profileRow.pitch?.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// Detaljprofilen
// ---------------------------------------------------------------------------

const DESCRIPTION_MAX = 200;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** "2021-03-01" → "2021-03"; annat lämnas som det är. */
function shortDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const match = value.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : value.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExperience(sd: any, contactUnlocked: boolean): ExperienceEntry[] {
  // Två format i produktion: CV-byggaren/parsern har experience[] med
  // position/company/startDate/endDate, äldre parsade CV:n har roles[] med
  // title/period.
  const rawList: unknown[] = Array.isArray(sd?.experience)
    ? sd.experience
    : Array.isArray(sd?.roles)
      ? sd.roles
      : [];

  return rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any): ExperienceEntry | null => {
      if (!raw || typeof raw !== 'object') return null;

      const position: string | null =
        (typeof raw.position === 'string' && raw.position.trim()) ||
        (typeof raw.title === 'string' && raw.title.trim()) ||
        null;

      // MASKERINGSREGEL: arbetsgivarnamnet lämnar servern ENDAST när
      // contactUnlocked (accepterat intresse eller öppen profil). En komplett
      // historik med företagsnamn identifierar personen lika säkert som namnet.
      const company: string | null = contactUnlocked
        ? (typeof raw.company === 'string' && raw.company.trim()) || null
        : null;

      const start = shortDate(raw.startDate);
      const end = shortDate(raw.endDate);
      const period: string | null = start
        ? `${start} till ${end ?? 'nu'}`
        : (typeof raw.period === 'string' && raw.period.trim()) || null;

      let description: string | null = null;
      if (typeof raw.description === 'string' && raw.description.trim()) {
        description = truncate(raw.description, DESCRIPTION_MAX);
      } else if (Array.isArray(raw.description)) {
        const joined = raw.description
          .filter((d: unknown) => typeof d === 'string')
          .join('. ');
        if (joined.trim()) description = truncate(joined, DESCRIPTION_MAX);
      }

      if (!position && !description) return null;
      return { position, company, period, description };
    })
    .filter((e): e is ExperienceEntry => e !== null);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEducation(sd: any): EducationEntry[] {
  const rawList: unknown[] = Array.isArray(sd?.education) ? sd.education : [];
  return rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any): EducationEntry | null => {
      if (!raw || typeof raw !== 'object') return null;
      const school: string | null =
        (typeof raw.institution === 'string' && raw.institution.trim()) ||
        (typeof raw.school === 'string' && raw.school.trim()) ||
        null;
      const degreeBase: string | null =
        (typeof raw.degree === 'string' && raw.degree.trim()) || null;
      const field: string | null =
        (typeof raw.field === 'string' && raw.field.trim()) || null;
      const degree = degreeBase && field && !degreeBase.includes(field)
        ? `${degreeBase}, ${field}`
        : degreeBase ?? field;
      const year: string | null =
        (typeof raw.graduationYear === 'string' && raw.graduationYear.trim()) ||
        (typeof raw.graduationYear === 'number' && String(raw.graduationYear)) ||
        null;
      if (!school && !degree) return null;
      return { school, degree, year };
    })
    .filter((e): e is EducationEntry => e !== null);
}

async function buildAllTestResults(
  sessions: SessionRow[],
  ctx: PercentileContext
): Promise<TestResultEntry[]> {
  const entries: Array<Promise<TestResultEntry | null>> = [];
  for (const family of FAMILY_ORDER) {
    const { types } = FAMILIES[family];
    types.forEach((testType, levelIndex) => {
      const own = sessions.filter((s) => s.test_type === testType);
      if (own.length === 0) return;
      const best = [...own].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
      entries.push(
        ctx.getStats(testType, best.score ?? 0).then(({ percentile, sampleSize }) => ({
          family,
          level: LEVELS[levelIndex],
          bestScore: best.score ?? 0,
          percentile,
          sampleSize,
          completedAt: best.completed_at,
        }))
      );
    });
  }
  const resolved = await Promise.all(entries);
  return resolved.filter((e): e is TestResultEntry => e !== null);
}

/**
 * Detaljprofilen: träffkortet plus arbetshistorik, utbildning och samtliga
 * testresultat per familj och nivå.
 *
 * MASKERINGSREGEL:
 *   - contactUnlocked (= accepterat intresse ELLER visibility 'open') låser
 *     upp fullName och arbetsgivarnamnen i historiken.
 *   - opts.emailUnlocked (= ENBART accepterat intresse) låser upp email.
 *     En öppen profil visar alltså namn och arbetsgivare, men aldrig
 *     kontaktuppgifter förrän kandidaten accepterat.
 *   - salary_min/salary_max returneras aldrig.
 */
export async function buildCandidateDetail(
  admin: Admin,
  profileRow: CandidateProfileRow,
  contactUnlocked: boolean,
  opts: { emailUnlocked?: boolean } = {}
): Promise<CandidateDetail> {
  const emailUnlocked = opts.emailUnlocked ?? false;
  const ctx = createPercentileContext(admin);

  const [card, sessions, sd] = await Promise.all([
    buildCandidateCard(admin, profileRow, ctx),
    fetchSessions(admin, profileRow.user_id),
    fetchStructuredData(admin, profileRow.user_id, profileRow.cv_id),
  ]);

  const testResults = await buildAllTestResults(sessions, ctx);

  let fullName: string | null = null;
  let email: string | null = null;
  if (contactUnlocked || emailUnlocked) {
    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('full_name, email')
      .eq('id', profileRow.user_id)
      .maybeSingle();
    if (contactUnlocked) fullName = profile?.full_name ?? null;
    // E-post kräver alltid accepterat intresse — aldrig enbart öppen profil.
    if (emailUnlocked) email = profile?.email ?? null;
  }

  return {
    ...card,
    experience: sd ? mapExperience(sd, contactUnlocked) : [],
    education: sd ? mapEducation(sd) : [],
    testResults,
    languages: sd ? deriveLanguages(sd) : [],
    fullName,
    email,
  };
}
