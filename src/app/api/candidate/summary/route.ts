import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/candidate/summary?cv_id=<uuid>
//
// Samlar underlaget till kandidatprofilen ("Bli upptäckt") i ett svar:
//   - results:     bästa slutförda session per kognitiv testfamilj
//                  (matrislogik / verbal / numerisk) över alla nivåer,
//                  med percentil beräknad som i /api/logicTestV4/percentile.
//   - personality: om användaren har en personlighetsprofil + de två
//                  främsta styrkorna härledda ur Big Five-poängen.
//   - skills:      extraherade kompetenser/roll/ort ur active_cv_for_matching.
//
// Percentilen räknas med admin-klienten (RLS begränsar användaren till egna
// rader) — endast aggregat (antal) lämnar servern, aldrig andra användares
// data. Vid för litet underlag (< 25 sessioner) sätts percentilen till null.

const MIN_PERCENTILE_SAMPLE = 25;

type Level = 'grund' | 'avancerad' | 'expert';
type FamilyKey = 'matrislogik' | 'verbal' | 'numerisk';

// Exakta test_type-värden, verifierade mot session-routes:
//   logicTestV4 (grund, kolumn-default 'matrislogik') / logicTestV6 / logicTestV4 expert,
//   verbalTestV1 / verbalTestV2 / verbalTestExpert,
//   numericalTest / numericalTestV2 / numericalTestExpert.
// Prov-typerna ('matrislogik-prov' m.fl.) ingår medvetet inte — prov är
// träningsläge och ska inte visas som verifierat resultat.
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

interface SessionRow {
  test_type: string | null;
  score: number | null;
  completed_at: string | null;
}

interface FamilyResult {
  done: boolean;
  bestScore: number | null;
  level: Level | null;
  percentile: number | null;
  completedAt: string | null;
}

const EMPTY_FAMILY: FamilyResult = {
  done: false,
  bestScore: null,
  level: null,
  percentile: null,
  completedAt: null,
};

// Big Five 0-100 (user_personality_profile, se migration 20260511) där högre
// alltid betyder mer av draget. Neuroticism inverteras: låg neuroticism är
// styrkan "Stresstålig".
const STRENGTH_MAP: Array<{ column: string; label: string; invert: boolean }> = [
  { column: 'conscientiousness', label: 'Strukturerad', invert: false },
  { column: 'agreeableness', label: 'Samarbetsvillig', invert: false },
  { column: 'extraversion', label: 'Utåtriktad', invert: false },
  { column: 'openness', label: 'Nyfiken', invert: false },
  { column: 'neuroticism', label: 'Stresstålig', invert: true },
];

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cvId = new URL(request.url).searchParams.get('cv_id');

    const allTypes = Object.values(FAMILIES).flatMap((f) => f.types);

    const [sessionsRes, personalityRes, skillsRes] = await Promise.all([
      // Alla slutförda kognitiva sessioner (egna rader via RLS).
      (supabase as any)
        .from('logic_test_v4_sessions')
        .select('test_type, score, completed_at')
        .eq('user_id', user.id)
        .in('test_type', allTypes)
        .not('completed_at', 'is', null)
        .not('score', 'is', null),
      // Personlighetsprofil (egna rader via RLS).
      (supabase as any)
        .from('user_personality_profile')
        .select('openness, conscientiousness, extraversion, agreeableness, neuroticism')
        .eq('user_id', user.id)
        .maybeSingle(),
      // CV-extraktion: matcha valt CV om cv_id angetts, annars senaste raden.
      fetchSkillsRow(supabase, user.id, cvId),
    ]);

    // --- Kognitiva resultat per familj ---
    const sessions: SessionRow[] = sessionsRes.data ?? [];
    const admin = getSupabaseAdmin();

    const familyEntries = await Promise.all(
      (Object.keys(FAMILIES) as FamilyKey[]).map(async (key) => {
        const { types } = FAMILIES[key];
        const own = sessions.filter(
          (s) => s.test_type && types.includes(s.test_type)
        );
        if (own.length === 0) {
          return [key, EMPTY_FAMILY] as const;
        }

        // Bästa session över alla nivåer: högst score (score är % rätt och
        // därmed jämförbar mellan nivåerna), vid lika föredras högre nivå,
        // därefter senast slutförd.
        const best = [...own].sort((a, b) => {
          const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
          if (scoreDiff !== 0) return scoreDiff;
          const levelDiff =
            types.indexOf(b.test_type as string) - types.indexOf(a.test_type as string);
          if (levelDiff !== 0) return levelDiff;
          return (
            new Date(b.completed_at ?? 0).getTime() -
            new Date(a.completed_at ?? 0).getTime()
          );
        })[0];

        const bestType = best.test_type as string;
        const level = LEVELS[types.indexOf(bestType)];

        // Percentil för nivån där bästa resultatet ligger — samma beräkning
        // som /api/logicTestV4/percentile (count score < användarens inom
        // samma test_type), men med golv på underlaget.
        const [{ count: total }, { count: below }] = await Promise.all([
          (admin as any)
            .from('logic_test_v4_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('test_type', bestType)
            .not('completed_at', 'is', null)
            .not('score', 'is', null),
          (admin as any)
            .from('logic_test_v4_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('test_type', bestType)
            .not('completed_at', 'is', null)
            .lt('score', best.score),
        ]);

        const sampleSize = total ?? 0;
        const percentile =
          sampleSize >= MIN_PERCENTILE_SAMPLE
            ? Math.round((100 * (below ?? 0)) / sampleSize)
            : null;

        const result: FamilyResult = {
          done: true,
          bestScore: best.score,
          level,
          percentile,
          completedAt: best.completed_at,
        };
        return [key, result] as const;
      })
    );

    const results = Object.fromEntries(familyEntries) as Record<FamilyKey, FamilyResult>;

    // --- Personlighet: de två högsta härledda styrkorna ---
    let personality: { done: boolean; strengths: string[] } = {
      done: false,
      strengths: [],
    };
    const profileRow = personalityRes.data as Record<string, number> | null;
    if (profileRow) {
      const strengths = STRENGTH_MAP
        .map(({ column, label, invert }) => ({
          label,
          value: invert ? 100 - (profileRow[column] ?? 50) : profileRow[column] ?? 50,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
        .map((s) => s.label);
      personality = { done: true, strengths };
    }

    // --- Kompetenser: extraktion först, CV:ts structured_data som fallback ---
    // active_cv_for_matching finns bara för CV:t som aktiverats i jobbmatchningen.
    // För övriga CV:n läser vi cv_texts.structured_data (två format i produktion:
    // CV-byggarens experience/position + parsade roles/title, och skills som
    // strängar eller kategorigrupper). Filnamnet används ALDRIG — det läcker
    // ofta användarens namn i anonymt läge.
    const skillsRow = skillsRes as {
      extracted_skills: string[] | null;
      extracted_occupations: Array<{ original: string; normalized: string }> | null;
      extracted_location: string | null;
    } | null;

    const firstOccupation = skillsRow?.extracted_occupations?.[0];
    const extracted = {
      skills: (skillsRow?.extracted_skills ?? []).slice(0, 8),
      occupation: firstOccupation
        ? firstOccupation.normalized || firstOccupation.original || null
        : null,
      location: skillsRow?.extracted_location ?? null,
    };

    let structured: { skills: string[]; occupation: string | null; location: string | null } = {
      skills: [],
      occupation: null,
      location: null,
    };
    if (!extracted.occupation || extracted.skills.length === 0) {
      structured = await fetchStructuredFallback(supabase, user.id, cvId);
    }

    const skills = {
      skills: extracted.skills.length > 0 ? extracted.skills : structured.skills,
      occupation: extracted.occupation ?? structured.occupation,
      location: extracted.location ?? structured.location,
    };

    return NextResponse.json({ results, personality, skills });
  } catch (error) {
    console.error('Candidate summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function fetchSkillsRow(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  cvId: string | null
) {
  let query = (supabase as any)
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
  return data;
}

/**
 * Fallback när CV:t saknar rad i active_cv_for_matching: plocka roll och
 * kompetenser direkt ur cv_texts.structured_data. Hanterar båda formaten
 * som förekommer i produktion (CV-byggaren och den parsade varianten).
 */
async function fetchStructuredFallback(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  cvId: string | null
): Promise<{ skills: string[]; occupation: string | null; location: string | null }> {
  const empty = { skills: [] as string[], occupation: null, location: null };

  let query = (supabase as any)
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

  return { skills: skills.slice(0, 8), occupation, location };
}
