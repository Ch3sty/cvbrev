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
import {
  deriveWorkStyle,
  deriveInterviewGuide,
  deriveWorkStyleReport,
  WORKSTYLE_DISCLAIMER,
  type WorkStyle,
  type WorkStyleReport,
  type DomainScores,
} from './workStyle';

/** Disclaimer som UI:t visar ovanför arbetsstilsrapporten, ordagrant. */
export { WORKSTYLE_DISCLAIMER, CONTEXT_TAG_MICROCOPY } from './workStyle';
export type { WorkStyleReport, InterviewQuestion, SpectrumView, ThrivesCard } from './workStyle';

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

export const LEVEL_LABELS: Record<Level, string> = {
  grund: 'Grundnivå',
  avancerad: 'Avancerad nivå',
  expert: 'Expertnivå',
};

/** Personlighetsresultat äldre än 24 månader flaggas som gamla. */
const PERSONALITY_STALE_MONTHS = 24;

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
  /**
   * Nivå 2-samtycke: fullständig arbetsstilsrapport. Kolumnen saknas i de
   * genererade DB-typerna — hämtas kompletterande om anroparen inte valt den.
   */
  show_full_workstyle?: boolean | null;
  /** Kandidatens självvalda kontexttaggar (max 2), valideras vid skrivning. */
  context_tags?: string[] | null;
  /** För färskhetssignalen "aktiv i poolen sedan ...". */
  consent_given_at?: string | null;
  created_at?: string | null;
  // salary_min/salary_max kan finnas på raden men läses aldrig här.
}

export interface TestBadge {
  family: FamilyKey;
  /** Färdigformaterad etikett, t.ex. "Matrislogik · Expertnivå · topp 12 %". */
  label: string;
  /** Nivån badgen avser = HÖGSTA slutförda nivån i familjen. */
  level: Level | null;
  /**
   * Verifierat resultat: score från FÖRSTA slutförda sessionen på nivån
   * (aldrig best-of-N). Fältnamnet behålls för bakåtkompatibilitet.
   */
  bestScore: number | null;
  percentile: number | null;
  /** Antal testade i underlaget ("topp 12 % av 340 testade"). */
  sampleSize: number | null;
  /** När det verifierade resultatet slutfördes. */
  testDate: string | null;
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
  /** Klassificerad utbildningsnivå för filtret, härledd ur educationLevel. */
  educationLevelBucket: EducationLevelBucket | null;
  /** Kandidatens egenskrivna pitch, visas även på träffkortet. */
  pitch: string | null;
  /**
   * Samtliga rolltitlar ur arbetshistoriken (utan arbetsgivare). Driver
   * fritextsökningen: "redovisningsekonom" ska träffa även tidigare roller.
   */
  historyTitles: string[];
  /**
   * Arketyp-titeln ur arbetsstilen (t.ex. "Drivande genomförare").
   * ENDAST ifylld när kandidaten valt show_personality och har facetter.
   */
  workStyleArchetype: string | null;
  /** Färskhetssignal: consent_given_at, annars created_at. */
  activeSince: string | null;
  /** Kandidatens självvalda kontexttaggar ("Söker mig till"), max 2. */
  contextTags: string[];
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
  /**
   * Verifierat resultat = FÖRSTA slutförda sessionen på nivån (aldrig
   * best-of-N). Fältnamnet behålls för bakåtkompatibilitet.
   */
  bestScore: number;
  percentile: number | null;
  /** Antal testade i underlaget ("topp X % av N testade"). */
  sampleSize: number | null;
  completedAt: string | null;
  /** Totalt antal slutförda försök på nivån. */
  attempts: number;
}

export interface CandidateDetail extends CandidateCard {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  /** Samtliga slutförda familjer+nivåer, inte bara bästa per familj. */
  testResults: TestResultEntry[];
  /** Språk ur CV:t, t.ex. "Svenska (modersmål)". */
  languages: string[];
  /**
   * Arbetsstilsprofil ur det avancerade personlighetstestets facetter
   * (kompakta panelen, fallback). null för grundtestare. Kräver
   * show_personality precis som styrkorna.
   */
  workStyle: WorkStyle | null;
  /** Kompakt intervjuguide (fallback): 3 frågor, ENDAST vid upplåst kontakt. */
  interviewGuide: string[];
  /**
   * Fullständig arbetsstilsrapport. Kräver show_personality OCH
   * show_full_workstyle (nivå 2-samtycke) och att profilen kvalificerar i
   * saliens-motorn. Sektionerna onboarding/interviewGuide är null tills
   * kontakten är upplåst — UI visar dem som låsta rader.
   */
  workStyleReport: WorkStyleReport | null;
  /** När personlighetstestet senast slutfördes (endast om show_personality). */
  personalityTestedAt: string | null;
  /** true när personlighetstestet är äldre än 24 månader. */
  personalityStale: boolean;
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

function badgeLabel(
  family: FamilyKey,
  level: Level,
  percentile: number | null,
  score: number | null
): string {
  // Nivån ingår alltid i etiketten: "Matrislogik · Expertnivå · topp 8 %".
  const base = `${FAMILY_LABELS[family]} · ${LEVEL_LABELS[level]}`;
  return percentile !== null
    ? `${base} · topp ${Math.max(1, 100 - percentile)} %`
    : `${base} · ${score}% rätt`;
}

/**
 * Första slutförda sessionen (verifierat resultat — best-of-N på oövervakat
 * test är psykometriskt värdelöst) inom en lista sessioner av samma test_type.
 */
function firstCompleted(sessions: SessionRow[]): SessionRow {
  return [...sessions].sort(
    (a, b) => new Date(a.completed_at ?? 0).getTime() - new Date(b.completed_at ?? 0).getTime()
  )[0];
}

/**
 * Nivåviktade badges: primär badge per familj = HÖGSTA slutförda nivån
 * (expert > avancerad > grund), aldrig rå-score-jämförelse över nivåer.
 * Resultatet på nivån = första slutförda sessionen, inte bästa av N.
 */
async function buildTestBadges(
  sessions: SessionRow[],
  ctx: PercentileContext
): Promise<TestBadge[]> {
  const badges = await Promise.all(
    FAMILY_ORDER.map(async (family) => {
      const { types } = FAMILIES[family];

      // Högsta slutförda nivån i familjen.
      let levelIndex = -1;
      for (let i = types.length - 1; i >= 0; i--) {
        if (sessions.some((s) => s.test_type === types[i])) {
          levelIndex = i;
          break;
        }
      }
      if (levelIndex === -1) return null;

      const testType = types[levelIndex];
      const level = LEVELS[levelIndex];
      const verified = firstCompleted(sessions.filter((s) => s.test_type === testType));

      const { percentile, sampleSize } = await ctx.getStats(testType, verified.score ?? 0);

      const badge: TestBadge = {
        family,
        level,
        bestScore: verified.score,
        percentile,
        sampleSize,
        testDate: verified.completed_at,
        label: badgeLabel(family, level, percentile, verified.score),
      };
      return badge;
    })
  );
  return badges.filter((b): b is TestBadge => b !== null);
}

/**
 * Full personlighetsläsning för detaljprofilen: domäner + facetter.
 * Facetterna finns bara för det avancerade testet (120 frågor).
 */
async function fetchPersonalityFull(
  admin: Admin,
  userId: string
): Promise<{
  domains: DomainScores;
  facets: Record<string, number> | null;
  testedAt: string | null;
} | null> {
  const { data } = await (admin as any)
    .from('user_personality_profile')
    .select(
      'openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores, updated_at'
    )
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  return {
    domains: {
      openness: data.openness ?? 50,
      conscientiousness: data.conscientiousness ?? 50,
      extraversion: data.extraversion ?? 50,
      agreeableness: data.agreeableness ?? 50,
      neuroticism: data.neuroticism ?? 50,
    },
    facets: (data.facet_scores as Record<string, number> | null) ?? null,
    testedAt: (data.updated_at as string | null) ?? null,
  };
}

function strengthsFromDomains(row: Record<string, number | null>): string[] {
  return STRENGTH_MAP
    .map(({ column, label, invert }) => ({
      label,
      value: invert ? 100 - (row[column] ?? 50) : row[column] ?? 50,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((s) => s.label);
}

/**
 * Kortets personlighetsdata i EN fråga: styrkor + arketyp. Facetterna hämtas
 * i samma query som styrkorna; arketypen exponeras bara när den kompakta
 * panelen kvalificerar (samma härledning som detaljvyn — aldrig divergens).
 */
async function fetchPersonalityCardData(
  admin: Admin,
  userId: string
): Promise<{ strengths: string[]; archetype: string | null }> {
  const { data } = await (admin as any)
    .from('user_personality_profile')
    .select('openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return { strengths: [], archetype: null };
  const row = data as Record<string, number | null> & {
    facet_scores: Record<string, number> | null;
  };
  const domains: DomainScores = {
    openness: row.openness ?? 50,
    conscientiousness: row.conscientiousness ?? 50,
    extraversion: row.extraversion ?? 50,
    agreeableness: row.agreeableness ?? 50,
    neuroticism: row.neuroticism ?? 50,
  };
  const workStyle = deriveWorkStyle(domains, row.facet_scores ?? null);
  return {
    strengths: strengthsFromDomains(row),
    archetype: workStyle?.archetype.title ?? null,
  };
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

export type EducationLevelBucket =
  | 'Gymnasial'
  | 'Eftergymnasial'
  | 'Kandidat'
  | 'Master'
  | 'Forskarnivå';

/**
 * Klassificerar den fria examenssträngen (deriveEducationLevel) till en
 * filtrerbar nivå. Nyckelordsbaserad, högsta nivån testas först.
 */
export function bucketEducationLevel(educationLevel: string | null): EducationLevelBucket | null {
  if (!educationLevel) return null;
  const t = educationLevel.toLowerCase();
  if (/doktor|forskar/.test(t)) return 'Forskarnivå';
  if (/master|civilingenjör|civilekonom|magister|läkare|jurist/.test(t)) return 'Master';
  if (/kandidat|högskoleingenjör|bachelor/.test(t)) return 'Kandidat';
  if (/(^|[^a-zåäö])yh([^a-zåäö]|$)|kvalificerad yrkes|högskoleexamen|eftergymnasial|folkhögskol/.test(t)) {
    return 'Eftergymnasial';
  }
  if (/gymnasi/.test(t)) return 'Gymnasial';
  return null;
}

/**
 * Alla titlar i arbetshistoriken — sökningens haystack behöver hela banan,
 * inte bara senaste rollen. Endast titlar, aldrig arbetsgivarnamn.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveHistoryTitles(sd: any): string[] {
  const rawList: unknown[] = Array.isArray(sd?.experience)
    ? sd.experience
    : Array.isArray(sd?.roles)
      ? sd.roles
      : [];
  return rawList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((raw: any): string | null =>
      (typeof raw?.position === 'string' && raw.position.trim()) ||
      (typeof raw?.title === 'string' && raw.title.trim()) ||
      null
    )
    .filter((t): t is string => t !== null);
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
 * Kompletterar en profilrad med v2-kolumnerna (show_full_workstyle,
 * context_tags, consent_given_at/created_at) när anroparens select inte tagit
 * med dem. Kolumnerna saknas i de genererade DB-typerna, därav casten.
 */
async function ensureProfileV2Columns(
  admin: Admin,
  row: CandidateProfileRow
): Promise<CandidateProfileRow> {
  if (
    row.show_full_workstyle !== undefined &&
    row.context_tags !== undefined &&
    row.consent_given_at !== undefined
  ) {
    return row;
  }
  const { data } = await (admin as any)
    .from('candidate_profiles')
    .select('show_full_workstyle, context_tags, consent_given_at, created_at')
    .eq('user_id', row.user_id)
    .maybeSingle();
  return {
    ...row,
    show_full_workstyle: row.show_full_workstyle ?? data?.show_full_workstyle ?? false,
    context_tags: row.context_tags ?? data?.context_tags ?? [],
    consent_given_at: row.consent_given_at ?? data?.consent_given_at ?? null,
    created_at: row.created_at ?? data?.created_at ?? null,
  };
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
  const row = await ensureProfileV2Columns(admin, profileRow);

  const [roleSkills, sessions, personalityCard] = await Promise.all([
    fetchRoleAndSkills(admin, row.user_id, row.cv_id),
    fetchSessions(admin, row.user_id),
    row.show_personality
      ? fetchPersonalityCardData(admin, row.user_id)
      : Promise.resolve({ strengths: [] as string[], archetype: null as string | null }),
  ]);

  const testBadges = await buildTestBadges(sessions, percentileCtx);
  const seniority = deriveSeniority(roleSkills.sd);
  const educationLevel = deriveEducationLevel(roleSkills.sd);

  return {
    userId: row.user_id,
    role: roleSkills.occupation,
    skills: roleSkills.skills.slice(0, 6),
    regions: row.regions ?? [],
    availability: row.availability,
    workplace: row.workplace ?? [],
    extent: row.extent ?? [],
    driversLicense: Boolean(row.drivers_license),
    testBadges,
    // ENDAST om kandidaten själv valt att visa personlighet.
    personalityStrengths: personalityCard.strengths,
    visibility: row.visibility,
    yearsOfExperience: seniority.yearsOfExperience,
    latestRole: seniority.latestRole,
    educationLevel,
    educationLevelBucket: bucketEducationLevel(educationLevel),
    pitch: row.pitch?.trim() || null,
    historyTitles: deriveHistoryTitles(roleSkills.sd),
    workStyleArchetype: personalityCard.archetype,
    activeSince: row.consent_given_at ?? row.created_at ?? null,
    contextTags: row.context_tags ?? [],
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
      // Verifierat resultat = första slutförda försöket, aldrig best-of-N.
      const verified = firstCompleted(own);
      entries.push(
        ctx.getStats(testType, verified.score ?? 0).then(({ percentile, sampleSize }) => ({
          family,
          level: LEVELS[levelIndex],
          bestScore: verified.score ?? 0,
          percentile,
          sampleSize,
          completedAt: verified.completed_at,
          attempts: own.length,
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
  const row = await ensureProfileV2Columns(admin, profileRow);

  const [card, sessions, sd, personalityFull] = await Promise.all([
    buildCandidateCard(admin, row, ctx),
    fetchSessions(admin, row.user_id),
    fetchStructuredData(admin, row.user_id, row.cv_id),
    // Arbetsstilen kräver kandidatens personlighetssamtycke, precis som styrkorna.
    row.show_personality
      ? fetchPersonalityFull(admin, row.user_id)
      : Promise.resolve(null),
  ]);

  const testResults = await buildAllTestResults(sessions, ctx);

  const workStyle = personalityFull
    ? deriveWorkStyle(personalityFull.domains, personalityFull.facets)
    : null;
  // Intervjuguiden är en del av kontaktupplåsningen — aldrig före accept/öppen.
  const interviewGuide =
    workStyle && contactUnlocked && personalityFull
      ? deriveInterviewGuide(personalityFull.facets)
      : [];

  // Fullrapporten kräver BÅDA samtyckena (nivå 1 + nivå 2). Onboarding och
  // intervjuguide är en del av kontaktupplåsningen och nollas innan svar.
  let workStyleReport =
    personalityFull && row.show_full_workstyle
      ? deriveWorkStyleReport(personalityFull.domains, personalityFull.facets)
      : null;
  if (workStyleReport && !contactUnlocked) {
    workStyleReport = { ...workStyleReport, onboarding: null, interviewGuide: null };
  }

  const personalityTestedAt = personalityFull?.testedAt ?? null;
  const personalityStale = personalityTestedAt
    ? Date.now() - Date.parse(personalityTestedAt) > 2 * YEAR_MS
    : false;

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
    workStyle,
    interviewGuide,
    workStyleReport,
    personalityTestedAt,
    personalityStale,
    fullName,
    email,
  };
}
