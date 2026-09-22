// src/lib/tests/sessionGate.ts
// ============================================================================
// Serverside-spärren för testnivåerna
// (docs/plan-paket-och-onboarding.md, avsnitt 4 och 5).
//
// Grundnivån per testtyp är fri. Allt över den kräver tests_above_base, och
// provläget kräver test_exam_mode. Gaten måste sitta här och inte bara i
// hubbens kort: kortet stoppar ett klick, inte en direktnavigering till
// startsidan eller ett POST från konsolen.
//
// Svaret är 402 med feature och suggestedPlan, samma form som mallarna och
// brevnedladdningen, så klientens betalvägg ritas likadant överallt.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { userHasAccess } from '@/lib/supabase/premiumAccess';
import { suggestPlan, type Feature, type Scope } from '@/lib/access/features';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { TEST_CONFIGS, examLimitMs } from '@/app/dashboard/tester/testConfig';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

/**
 * Testtypen till den feature den kräver. Nycklarna är test_type-värdena som
 * sessionsrutterna skriver, alltså samma strängar som slugarna utom där de
 * historiskt skiljer sig.
 */
const FEATURE_BY_TEST_TYPE: Record<string, Feature> = Object.fromEntries(
  TEST_CONFIGS.filter((c) => c.requiresFeature).map((c) => [c.slug, c.requiresFeature as Feature])
);

/**
 * Rutternas egna test_type-strängar som inte är identiska med slugen.
 * Hellre en liten tabell här än femton olika gissningar i rutterna.
 */
const ALIAS: Record<string, string> = {
  'numerical-reasoning': 'numeriskt-test',
  'numerical-reasoning-v2': 'numeriskt-test-v2',
  'numerical-reasoning-expert': 'numeriskt-test-expert',
  'numerical-reasoning-prov': 'numeriskt-test-prov',
  'verbal-reasoning': 'verbal-resonemang',
  'verbal-reasoning-v2': 'verbal-resonemang-v2',
  'verbal-reasoning-expert': 'verbal-resonemang-expert',
  'verbal-reasoning-prov': 'verbal-resonemang-prov',
  matrislogik: 'matrislogik-grund',
};

/** Featuren testtypen kräver, eller null när nivån är fri. */
export function featureForTestType(testType: string): Feature | null {
  const nyckel = ALIAS[testType] ?? testType;
  return FEATURE_BY_TEST_TYPE[nyckel] ?? null;
}

export interface SessionGateResult {
  /** Sann när sessionen får starta. */
  allowed: boolean;
  /** Svarskroppen vid 402. Null när sessionen får starta. */
  body: ReturnType<typeof featureRequiredBody> | null;
  feature: Feature | null;
}

/**
 * Får den här användaren starta den här testtypen?
 *
 * Är nivån fri svarar vi ja utan en enda fråga till databasen: grundnivån är
 * landningsytan för SEO-trafiken och ska aldrig kosta en rundtur.
 */
export async function checkTestSessionAccess(
  supabase: AnySupabase,
  userId: string,
  testType: string
): Promise<SessionGateResult> {
  const feature = featureForTestType(testType);
  if (!feature) return { allowed: true, body: null, feature: null };

  if (await userHasAccess(supabase, userId, feature)) {
    return { allowed: true, body: null, feature };
  }

  const { data: profil } = await supabase
    .from('profiles')
    .select('onboarding_track')
    .eq('id', userId)
    .maybeSingle();

  const varde = (profil as { onboarding_track?: unknown } | null)?.onboarding_track;
  const track: Scope | null =
    varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;

  return {
    allowed: false,
    feature,
    body: featureRequiredBody(feature, suggestPlan(feature, track), { testType }),
  };
}

/* ---------------------------- Provets tidsgräns --------------------------- */


/**
 * Har provets tid gått ut?
 *
 * Klientens klocka lämnar in provet när tiden tar slut, men en klient går att
 * stänga av. Den här används i svarsrutterna så att ett svar efter utgången
 * tid aldrig sparas: utan den är tidsgränsen en rekommendation, inte en
 * gräns (docs/plan-paket-och-onboarding.md, ägarens beslut 12).
 *
 * Marginalen på tio sekunder finns för att ett svar som skickades precis före
 * utgången inte ska falla på nätverkets latens.
 */
export function examDeadlinePassed(
  slug: string,
  startedAt: string | null | undefined,
  marginalMs = 10_000
): boolean {
  const limit = examLimitMs(slug);
  if (!limit || !startedAt) return false;
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return false;
  return Date.now() > start + limit + marginalMs;
}
