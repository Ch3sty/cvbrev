/**
 * Serverhämtningen bakom Bli upptäckt.
 *
 * Förut gjorde sidan allt efter hydrering, och varje del hade sin egen kedja:
 *   - page.tsx: auth.getUser(), sedan tre frågor, sedan fetch mot
 *     /api/candidate/summary som gjorde ett eget auth.getUser() först
 *   - useCvQuota: auth.getUser(), profiles, cv_texts, tre seriella steg
 *   - useCollapsedSections: auth.getUser(), sedan user_ui_preferences
 *   - PendingInterestAlert och MessagesShortcut: samma
 *     /api/candidate/interests, hämtad två gånger, var gång med eget getUser
 *   - ProfileStrengthCard: /api/candidate/views med eget getUser
 * Mätningen landade på 24 rundturer och 5056 ms LCP på Pixel 7 över LTE.
 *
 * Nu läses sessionen en gång och allt hämtas i en parallell omgång här.
 *
 * Affärsreglerna är oförändrade och ligger kvar där de låg. Projektreglerna
 * för sidan gäller fortfarande och bryts inte här: profilen är anonym tills
 * kandidaten själv väljer annat (visibility styrs bara av kandidatens egna
 * sparningar), styrkor lämnar servern som etiketter och aldrig som råpoäng
 * (samma STRENGTH_MAP-härledning som API-routen), och lönespannet går bara
 * till kandidatens egen vy, aldrig utåt.
 */
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getProfileViewStats } from '@/lib/recruiter/profileViews';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import { deriveSeniority, deriveEducationLevel } from '@/lib/recruiter/candidateData';
import {
  deriveWorkStyle,
  deriveCardWorkStyle,
  deriveWorkStyleReport,
  deriveCandidateOwnReport,
  deriveContextTagOptions,
} from '@/lib/recruiter/workStyle';
import {
  EMPTY_PROFILE,
  type CandidateProfileState,
  type CvOption,
  type FamilyKey,
  type Level,
  type SummaryData,
} from './components/types';

/** Räknarna bakom larmet och meddelandegenvägen högst upp på sidan. */
export interface InterestCounts {
  /** Obesvarade intressen. */
  pending: number;
  /** Olästa meddelanden över accepterade trådar. */
  unread: number;
  /** Antal intressen totalt, styr om genvägen visas alls. */
  total: number;
}

export interface ViewStats {
  lastWeek: number;
  total: number;
}

export interface BliUpptacktData {
  fullName: string | null;
  profile: CandidateProfileState;
  cvs: CvOption[];
  summary: SummaryData | null;
  interests: InterestCounts;
  /** Profilvisningar, bara när profilen är synlig. Annars null. */
  views: ViewStats | null;
  /** Hopfällda sektioner ur user_ui_preferences, null när raden saknas. */
  collapsedSections: string[] | null;
}

const PREF_KEY = 'bli_upptackt_collapsed';

/* -------------------------------------------------------------------------- */
/* Kandidatunderlaget: speglar GET /api/candidate/summary rad för rad.         */
/* Routen ligger kvar orörd, den behövs fortfarande när kandidaten byter CV    */
/* och sidan hämtar om underlaget utan omladdning.                            */
/* -------------------------------------------------------------------------- */

const MIN_PERCENTILE_SAMPLE = 25;

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

const EMPTY_FAMILY = {
  done: false,
  bestScore: null,
  level: null,
  percentile: null,
  completedAt: null,
} as const;

/**
 * Big Five 0-100 där högre alltid betyder mer av draget. Neuroticism inverteras:
 * låg neuroticism är styrkan "Stresstålig". Identisk med STRENGTH_MAP i
 * src/app/api/candidate/summary/route.ts. Bara etiketterna lämnar funktionen,
 * aldrig värdena.
 */
const STRENGTH_MAP: Array<{ column: string; label: string; invert: boolean }> = [
  { column: 'conscientiousness', label: 'Strukturerad', invert: false },
  { column: 'agreeableness', label: 'Samarbetsvillig', invert: false },
  { column: 'extraversion', label: 'Utåtriktad', invert: false },
  { column: 'openness', label: 'Nyfiken', invert: false },
  { column: 'neuroticism', label: 'Stresstålig', invert: true },
];

interface SessionRow {
  test_type: string | null;
  score: number | null;
  completed_at: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSkillsRow(supabase: any, userId: string, cvId: string | null) {
  let query = supabase
    .from('active_cv_for_matching')
    .select('extracted_skills, extracted_occupations, extracted_location, parsed_at')
    .eq('user_id', userId);

  if (cvId) query = query.eq('cv_id', cvId);

  const { data, error } = await query
    .order('parsed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Bli upptäckt: kunde inte läsa active_cv_for_matching', error);
    return null;
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchStructuredFallback(supabase: any, userId: string, cvId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const empty = { skills: [] as string[], occupation: null, location: null, sd: null as any };

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
    if (error) console.error('Bli upptäckt: kunde inte läsa structured_data', error);
    return empty;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd = data.structured_data as any;

  const occupation: string | null =
    (typeof sd?.experience?.[0]?.position === 'string' && sd.experience[0].position) ||
    (typeof sd?.roles?.[0]?.title === 'string' && sd.roles[0].title) ||
    null;

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

/** Samma underlag som GET /api/candidate/summary svarar med. */
export async function getCandidateSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  cvId: string | null
): Promise<SummaryData> {
  const allTypes = Object.values(FAMILIES).flatMap((f) => f.types);

  const [sessionsRes, personalityRes, skillsRes, structured] = await Promise.all([
    supabase
      .from('logic_test_v4_sessions')
      .select('test_type, score, completed_at')
      .eq('user_id', userId)
      .in('test_type', allTypes)
      .not('completed_at', 'is', null)
      .not('score', 'is', null),
    supabase
      .from('user_personality_profile')
      .select(
        'openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores'
      )
      .eq('user_id', userId)
      .maybeSingle(),
    fetchSkillsRow(supabase, userId, cvId),
    // Routen hämtade den här sist och seriellt. Den beror inte på något ovan,
    // så den går i samma omgång.
    fetchStructuredFallback(supabase, userId, cvId),
  ]);

  const sessions: SessionRow[] = sessionsRes.data ?? [];
  const admin = getSupabaseAdmin();

  const familyEntries = await Promise.all(
    (Object.keys(FAMILIES) as FamilyKey[]).map(async (key) => {
      const { types } = FAMILIES[key];
      const own = sessions.filter((s) => s.test_type && types.includes(s.test_type));
      if (own.length === 0) return [key, EMPTY_FAMILY] as const;

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

      const bestType = best.test_type as string;
      const level = LEVELS[types.indexOf(bestType)];

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

      const sampleSize = total ?? 0;
      const percentile =
        sampleSize >= MIN_PERCENTILE_SAMPLE ? Math.round((100 * (below ?? 0)) / sampleSize) : null;

      return [
        key,
        {
          done: true,
          bestScore: best.score,
          level,
          percentile,
          completedAt: best.completed_at,
        },
      ] as const;
    })
  );

  const results = Object.fromEntries(familyEntries) as SummaryData['results'];

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
    const strengths = STRENGTH_MAP.map(({ column, label, invert }) => ({
      label,
      value: invert ? 100 - (profileRow[column] ?? 50) : profileRow[column] ?? 50,
    }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((s) => s.label);

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

  const skillsRow = skillsRes as {
    extracted_skills: string[] | null;
    extracted_occupations: Array<{ original: string; normalized: string }> | null;
    extracted_location: string | null;
  } | null;

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

/* -------------------------------------------------------------------------- */
/* Intresseräknarna: bara siffror, aldrig rekryterarens identitet.            */
/* -------------------------------------------------------------------------- */

async function getInterestCounts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<InterestCounts> {
  const empty: InterestCounts = { pending: 0, unread: 0, total: 0 };

  // Egna rader via RLS. Larmet och genvägen behöver antal, inte innehåll, så
  // vi läser bara id och status i stället för hela intresseraden med meddelande.
  const { data, error } = await supabase
    .from('candidate_interests')
    .select('id, status')
    .eq('candidate_user_id', userId);

  if (error) {
    console.error('Bli upptäckt: kunde inte läsa intressen', error);
    return empty;
  }

  const rows = (data ?? []) as Array<{ id: string; status: string }>;
  if (rows.length === 0) return empty;

  const acceptedIds = rows.filter((r) => r.status === 'accepted').map((r) => r.id);

  let unread = 0;
  if (acceptedIds.length > 0) {
    try {
      const { unreadByInterest } = await import('@/lib/interests/threadUnread');
      const stats = await unreadByInterest(
        getSupabaseAdmin(),
        acceptedIds,
        userId,
        'candidate'
      );
      for (const value of stats.values()) unread += value.unread;
    } catch (error) {
      console.error('Bli upptäckt: kunde inte räkna olästa', error);
    }
  }

  return {
    pending: rows.filter((r) => r.status === 'pending').length,
    unread,
    total: rows.length,
  };
}

/* -------------------------------------------------------------------------- */

/**
 * Allt sidan behöver, i en parallell omgång.
 *
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har autentiserat och skickar in userId.
 */
export async function getBliUpptacktData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<BliUpptacktData> {
  // Första omgången: allt som inte beror på något annat.
  const [profileRes, candidateRes, cvRes, prefRes, interests] = await Promise.all([
    supabase.from('profiles').select('full_name, subscription_tier, premium_until').eq('id', userId).maybeSingle(),
    supabase.from('candidate_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('cv_texts')
      .select('id, file_name, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_ui_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', PREF_KEY)
      .maybeSingle(),
    getInterestCounts(supabase, userId),
  ]);

  const profileRow = profileRes.data as
    | { full_name?: string | null; subscription_tier?: string | null; premium_until?: string | null }
    | null;

  const row = candidateRes.data as Record<string, unknown> | null;
  let profile: CandidateProfileState = EMPTY_PROFILE;
  if (row) {
    profile = {
      cv_id: (row.cv_id as string | null) ?? null,
      visibility: (row.visibility as CandidateProfileState['visibility']) ?? 'off',
      show_personality: Boolean(row.show_personality),
      show_full_workstyle: Boolean(row.show_full_workstyle),
      context_tags: (row.context_tags as string[] | null) ?? [],
      availability: (row.availability as CandidateProfileState['availability']) ?? null,
      workplace: (row.workplace as string[] | null) ?? [],
      extent: (row.extent as string[] | null) ?? [],
      employment_types: (row.employment_types as string[] | null) ?? [],
      regions: (row.regions as string[] | null) ?? [],
      drivers_license: Boolean(row.drivers_license),
      salary_min: (row.salary_min as number | null) ?? null,
      salary_max: (row.salary_max as number | null) ?? null,
      pitch: (row.pitch as string | null) ?? null,
      consent_given_at: (row.consent_given_at as string | null) ?? null,
    };
  }

  // CV-låsen: samma regel som useCvQuota körde på klienten, bara flyttad hit.
  // Free har två aktiva CV, premium femtio. Ingen kvot ändras av flytten.
  const cvRows = (cvRes.data ?? []) as Array<{
    id: string;
    file_name: string;
    created_at: string | null;
    updated_at: string | null;
  }>;
  const untilOk =
    !profileRow?.premium_until || new Date(profileRow.premium_until).getTime() > Date.now();
  const isPremium = profileRow?.subscription_tier === 'premium' && untilOk;
  const activeIds = getActiveCvIds(
    cvRows.map((cv) => ({ id: cv.id, created_at: cv.created_at ?? '' })),
    isPremium ? 50 : 2
  );
  const cvs: CvOption[] = cvRows.map((cv) => ({
    id: cv.id,
    file_name: cv.file_name,
    created_at: cv.created_at ?? '',
    updated_at: cv.updated_at,
    isLocked: !activeIds.has(cv.id),
  }));

  const prefValue = prefRes.data?.value as { sections?: unknown } | null | undefined;
  const collapsedSections = prefRes.data
    ? Array.isArray(prefValue?.sections)
      ? (prefValue.sections as unknown[]).filter((s): s is string => typeof s === 'string')
      : []
    : null;

  // Andra omgången: underlaget beror på vilket CV profilen pekar ut, och
  // visningarna hämtas bara när profilen faktiskt är synlig. Att visa
  // "0 visningar" för någon som inte slagit på synligheten vore att rapportera
  // utfallet av något hon inte gjort.
  const [summary, views] = await Promise.all([
    getCandidateSummary(supabase, userId, profile.cv_id).catch((error) => {
      console.error('Bli upptäckt: kunde inte hämta kandidatunderlaget', error);
      return null;
    }),
    profile.visibility !== 'off'
      ? getProfileViewStats(supabase, userId).catch((error) => {
          console.error('Bli upptäckt: kunde inte läsa profilvisningar', error);
          return null;
        })
      : Promise.resolve(null),
  ]);

  return {
    fullName: profileRow?.full_name ?? null,
    profile,
    cvs,
    summary,
    interests,
    views: views as ViewStats | null,
    collapsedSections,
  };
}
