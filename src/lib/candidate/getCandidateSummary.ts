// src/lib/candidate/getCandidateSummary.ts
//
// Kandidatunderlaget bakom "Bli upptäckt", hämtat en gång och delat mellan
// två anropare: /dashboard/bli-upptackt som server component, och
// GET /api/candidate/summary som klienten använder när kandidaten byter CV
// utan omladdning.
//
// Logiken låg tidigare i routen och en kopia av den i sidans getPageData.
// Kopiorna innehöll samma konstanter (MIN_PERCENTILE_SAMPLE, FAMILIES,
// LEVELS, EMPTY_FAMILY, STRENGTH_MAP) och samma uträkning. Nu finns den på
// ett ställe. Ändras reglerna ändras de här.
//
// Behörigheten är oförändrad: sessioner, personlighetsprofil och CV-rader
// läses med användarens egen klient (RLS begränsar till egna rader).
// Admin-klienten används enbart för percentilräkningen, och därifrån lämnar
// bara aggregat (antal) funktionen, aldrig andra användares data. Vid för
// litet underlag (< MIN_PERCENTILE_SAMPLE sessioner) blir percentilen null.
//
// Projektreglerna för sidan gäller och bryts inte här: styrkor lämnar
// funktionen som etiketter via STRENGTH_MAP och aldrig som råpoäng (Big
// Five-värdena stannar inne i funktionen), profilens synlighet avgörs inte
// här alls utan bara av kandidatens egna sparningar, och lönespannet rör vi
// inte — det ligger i candidate_profiles och går bara till kandidatens egen vy.

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deriveSeniority, deriveEducationLevel } from '@/lib/recruiter/candidateData';
import { MIN_PERCENTILE_SAMPLE, STRENGTH_MAP } from '@/lib/candidate/strengthConstants';

// Re-exporteras så befintliga importörer och tester är oförändrade.
export { MIN_PERCENTILE_SAMPLE, STRENGTH_MAP };
import {
  deriveWorkStyle,
  deriveCardWorkStyle,
  deriveWorkStyleReport,
  deriveCandidateOwnReport,
  deriveContextTagOptions,
} from '@/lib/recruiter/workStyle';
import type {
  FamilyKey,
  FamilyResult,
  Level,
  SummaryData,
} from '@/app/dashboard/bli-upptackt/components/types';

export type { FamilyKey, FamilyResult, Level, SummaryData };

/** Minsta antal sessioner i en test_type innan en percentil får visas. */


// Exakta test_type-värden, verifierade mot session-routes:
//   logicTestV4 (grund, kolumn-default 'matrislogik') / logicTestV6 / logicTestV4 expert,
//   verbalTestV1 / verbalTestV2 / verbalTestExpert,
//   numericalTest / numericalTestV2 / numericalTestExpert.
// Prov-typerna ('matrislogik-prov' m.fl.) ingår medvetet inte — prov är
// träningsläge och ska inte visas som verifierat resultat.
export const FAMILIES: Record<FamilyKey, { types: [string, string, string] }> = {
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

export const LEVELS: Level[] = ['grund', 'avancerad', 'expert'];

export const EMPTY_FAMILY: FamilyResult = {
  done: false,
  bestScore: null,
  level: null,
  percentile: null,
  completedAt: null,
};

// Big Five 0-100 (user_personality_profile, se migration 20260511) där högre
// alltid betyder mer av draget. Neuroticism inverteras: låg neuroticism är
// styrkan "Stresstålig". Bara etiketterna lämnar funktionen, aldrig värdena.

interface SessionRow {
  test_type: string | null;
  score: number | null;
  completed_at: string | null;
}

interface SkillsRow {
  extracted_skills: string[] | null;
  extracted_occupations: Array<{ original: string; normalized: string }> | null;
  extracted_location: string | null;
}

interface StructuredFallback {
  skills: string[];
  occupation: string | null;
  location: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sd: any | null;
}

/** Klienttypen är lös eftersom tabellerna saknas i de genererade DB-typerna. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseClient = any;

/**
 * De två främsta styrkorna som etiketter. Råpoängen används bara för
 * sorteringen här inne och returneras aldrig.
 */
export function deriveStrengthLabels(
  profileRow: Record<string, number | null | undefined>
): string[] {
  return STRENGTH_MAP.map(({ column, label, invert }) => ({
    label,
    value: invert ? 100 - (profileRow[column] ?? 50) : profileRow[column] ?? 50,
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((s) => s.label);
}

/**
 * Bästa sessionen i en familj: högst score (score är % rätt och därmed
 * jämförbar mellan nivåerna), vid lika föredras högre nivå, därefter senast
 * slutförd.
 */
export function pickBestSession(
  sessions: SessionRow[],
  types: readonly string[]
): SessionRow | null {
  const own = sessions.filter((s) => s.test_type && types.includes(s.test_type));
  if (own.length === 0) return null;

  return [...own].sort((a, b) => {
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const levelDiff =
      types.indexOf(b.test_type as string) - types.indexOf(a.test_type as string);
    if (levelDiff !== 0) return levelDiff;
    return (
      new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
    );
  })[0];
}

/**
 * Percentil för en test_type: andelen sessioner under användarens score.
 * Samma beräkning som /api/logicTestV4/percentile, men med golv på
 * underlaget. Under golvet returneras null.
 */
export function percentileFrom(total: number | null, below: number | null): number | null {
  const sampleSize = total ?? 0;
  if (sampleSize < MIN_PERCENTILE_SAMPLE) return null;
  return Math.round((100 * (below ?? 0)) / sampleSize);
}

async function fetchSkillsRow(
  supabase: LooseClient,
  userId: string,
  cvId: string | null
): Promise<SkillsRow | null> {
  let query = supabase
    .from('active_cv_for_matching')
    .select('extracted_skills, extracted_occupations, extracted_location, parsed_at')
    .eq('user_id', userId);

  if (cvId) {
    query = query.eq('cv_id', cvId);
  }

  const { data, error } = await query
    .order('parsed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active_cv_for_matching:', error);
    return null;
  }
  return data as SkillsRow | null;
}

/**
 * Fallback när CV:t saknar rad i active_cv_for_matching: plocka roll och
 * kompetenser direkt ur cv_texts.structured_data. Hanterar båda formaten
 * som förekommer i produktion (CV-byggaren och den parsade varianten).
 * Filnamnet används ALDRIG — det läcker ofta användarens namn i anonymt läge.
 */
async function fetchStructuredFallback(
  supabase: LooseClient,
  userId: string,
  cvId: string | null
): Promise<StructuredFallback> {
  const empty: StructuredFallback = {
    skills: [],
    occupation: null,
    location: null,
    sd: null,
  };

  let query = supabase
    .from('cv_texts')
    .select('structured_data')
    .eq('user_id', userId)
    .not('structured_data', 'is', null);
  if (cvId) query = query.eq('id', cvId);

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.structured_data) {
    if (error) console.error('Error fetching cv_texts structured_data:', error);
    return empty;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd = data.structured_data as any;

  // Roll: CV-byggaren har experience[].position, parsade CV:n har roles[].title.
  const occupation: string | null =
    (typeof sd?.experience?.[0]?.position === 'string' && sd.experience[0].position) ||
    (typeof sd?.roles?.[0]?.title === 'string' && sd.roles[0].title) ||
    null;

  // Kompetenser: antingen array av strängar eller kategorigrupper { category, skills[] }.
  let skills: string[] = [];
  if (Array.isArray(sd?.skills)) {
    if (typeof sd.skills[0] === 'string') {
      skills = sd.skills.filter((s: unknown) => typeof s === 'string');
    } else {
      skills = sd.skills
        .flatMap((group: { skills?: unknown }) =>
          Array.isArray(group?.skills) ? group.skills : []
        )
        .filter((s: unknown) => typeof s === 'string');
    }
  }

  const location: string | null =
    (typeof sd?.personalInfo?.city === 'string' && sd.personalInfo.city) ||
    (typeof sd?.personalInfo?.location === 'string' && sd.personalInfo.location) ||
    null;

  return { skills: skills.slice(0, 8), occupation, location, sd };
}

/**
 * Samlar underlaget till kandidatprofilen ("Bli upptäckt") i ett objekt:
 *   - results:     bästa slutförda session per kognitiv testfamilj
 *                  (matrislogik / verbal / numerisk) över alla nivåer,
 *                  med percentil beräknad som i /api/logicTestV4/percentile.
 *   - personality: om användaren har en personlighetsprofil + de två
 *                  främsta styrkorna som etiketter, samt arbetsstilen.
 *   - skills:      extraherade kompetenser/roll/ort ur active_cv_for_matching,
 *                  med cv_texts.structured_data som fallback.
 *   - seniority:   år i yrket, senaste roll och utbildningsnivå ur samma
 *                  structured_data.
 *
 * supabase: användarens egen klient (RLS gäller). Anroparen har autentiserat
 * och skickar in userId.
 */
export async function getCandidateSummary(
  supabase: LooseClient,
  userId: string,
  cvId: string | null = null
): Promise<SummaryData> {
  const allTypes = Object.values(FAMILIES).flatMap((f) => f.types);

  const [sessionsRes, personalityRes, skillsRow, structured] = await Promise.all([
    // Alla slutförda kognitiva sessioner (egna rader via RLS).
    supabase
      .from('logic_test_v4_sessions')
      .select('test_type, score, completed_at')
      .eq('user_id', userId)
      .in('test_type', allTypes)
      .not('completed_at', 'is', null)
      .not('score', 'is', null),
    // Personlighetsprofil (egna rader via RLS). facet_scores finns bara
    // för avancerad-testare och ger arbetsstilsprofilen.
    supabase
      .from('user_personality_profile')
      .select(
        'openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores'
      )
      .eq('user_id', userId)
      .maybeSingle(),
    // CV-extraktion: matcha valt CV om cvId angetts, annars senaste raden.
    fetchSkillsRow(supabase, userId, cvId),
    // Structured data hämtas alltid — senioritet/examen behöver den även när
    // extraktionen täcker roll och kompetenser. Den beror inte på något
    // ovanför och går därför i samma omgång.
    fetchStructuredFallback(supabase, userId, cvId),
  ]);

  // --- Kognitiva resultat per familj ---
  const sessions: SessionRow[] = sessionsRes.data ?? [];
  const admin = getSupabaseAdmin();

  const familyEntries = await Promise.all(
    (Object.keys(FAMILIES) as FamilyKey[]).map(async (key) => {
      const { types } = FAMILIES[key];
      const best = pickBestSession(sessions, types);
      if (!best) return [key, EMPTY_FAMILY] as const;

      const bestType = best.test_type as string;
      const level = LEVELS[types.indexOf(bestType)];

      // Percentil för nivån där bästa resultatet ligger. Endast aggregat
      // (antal) lämnar admin-klienten.
      const [{ count: total }, { count: below }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any)
          .from('logic_test_v4_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('test_type', bestType)
          .not('completed_at', 'is', null)
          .not('score', 'is', null),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any)
          .from('logic_test_v4_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('test_type', bestType)
          .not('completed_at', 'is', null)
          .lt('score', best.score),
      ]);

      const result: FamilyResult = {
        done: true,
        bestScore: best.score,
        level,
        percentile: percentileFrom(total, below),
        completedAt: best.completed_at,
      };
      return [key, result] as const;
    })
  );

  const results = Object.fromEntries(familyEntries) as Record<FamilyKey, FamilyResult>;

  // --- Personlighet: styrkor, arbetsstil och v2-rapporterna ---
  // Grundtestare (facet_scores saknas): workStyle/rapporter blir null och
  // hasAdvancedTest false — UI visar upsell + låst förhandsvisning.
  let personality: SummaryData['personality'] = {
    done: false,
    strengths: [],
    workStyle: null,
    cardWorkStyle: null,
    workStyleReport: null,
    ownReport: null,
    contextTagOptions: [],
    hasAdvancedTest: false,
  };

  const profileRow = personalityRes.data as
    | (Record<string, number> & { facet_scores: Record<string, number> | null })
    | null;

  if (profileRow) {
    // Bara de två främsta etiketterna lämnar funktionen. Råpoängen stannar här.
    const strengths = deriveStrengthLabels(profileRow);

    const domains = {
      openness: profileRow.openness ?? 50,
      conscientiousness: profileRow.conscientiousness ?? 50,
      extraversion: profileRow.extraversion ?? 50,
      agreeableness: profileRow.agreeableness ?? 50,
      neuroticism: profileRow.neuroticism ?? 50,
    };
    const facets = profileRow.facet_scores ?? null;

    personality = {
      done: true,
      strengths,
      workStyle: deriveWorkStyle(domains, facets),
      cardWorkStyle: deriveCardWorkStyle(domains, facets),
      workStyleReport: deriveWorkStyleReport(domains, facets),
      ownReport: deriveCandidateOwnReport(domains, facets),
      contextTagOptions: deriveContextTagOptions(facets),
      hasAdvancedTest: facets !== null && Object.keys(facets).length > 0,
    };
  }

  // --- Kompetenser: extraktion först, CV:ts structured_data som fallback ---
  const firstOccupation = skillsRow?.extracted_occupations?.[0];
  const extractedSkills = (skillsRow?.extracted_skills ?? []).slice(0, 8);
  const extractedOccupation = firstOccupation
    ? firstOccupation.normalized || firstOccupation.original || null
    : null;

  const seniorityData = deriveSeniority(structured.sd);

  return {
    results,
    personality,
    skills: {
      skills: extractedSkills.length > 0 ? extractedSkills : structured.skills,
      occupation: extractedOccupation ?? structured.occupation,
      location: skillsRow?.extracted_location ?? structured.location,
    },
    seniority: {
      yearsOfExperience: seniorityData.yearsOfExperience,
      latestRole: seniorityData.latestRole,
      educationLevel: deriveEducationLevel(structured.sd),
    },
  };
}
