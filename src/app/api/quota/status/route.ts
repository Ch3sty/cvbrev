import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import {
  DAILY_LIMIT_LETTERS,
  FREE_CHAT_MESSAGES_PER_ACCOUNT,
  CV_ANALYSIS_LIMIT,
  checkChatQuota,
  checkCvAnalysisQuota,
  resolveWeeklyLetterCounter,
  nextLetterResetAt,
  startOfTodayStockholm,
  nextMidnightStockholm,
} from '@/lib/quota/quotaService';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';

/**
 * GET /api/quota/status
 *
 * Samlad kvotstatus för dashboardens kvotrad. Återanvänder funktionerna i
 * quotaService så att raden och spärrarna aldrig kan visa olika siffror.
 *
 * Efter paketomgången svarar routen även med scope och onboarding_track
 * (docs/plan-paket-och-onboarding.md avsnitt 5), så klienten kan rita rätt
 * betalvägg och föreslå rätt paket utan en andra rundtur.
 */

export const dynamic = 'force-dynamic';

/** Gratisnivåns tak för antal samtidigt aktiva brev. */
const FREE_MAX_SAVED_LETTERS = 2;

export interface QuotaStatusItem {
  key: 'letters' | 'analysis' | 'chat' | 'tests' | 'savedLetters';
  label: string;
  used: number;
  /** null = ingen fast denominator (tester räknas per testtyp). */
  limit: number | null;
  nextResetAt: string | null;
  /** Featuren som öppnar raden. Null på rader utan paketkoppling. */
  feature?: Feature;
  /** Sann när kvoten inte återkommer av sig själv. */
  perAccount?: boolean;
}

export interface QuotaStatusResponse {
  isPremium: boolean;
  scope: Scope | null;
  onboardingTrack: Scope | null;
  items: QuotaStatusItem[];
}

function lasTrack(varde: unknown): Scope | null {
  return varde === 'cv' || varde === 'tester' || varde === 'allt' ? varde : null;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = await getUserScope(supabase, user.id);

    const todayStart = startOfTodayStockholm().toISOString();
    const nextMidnight = nextMidnightStockholm().toISOString();

    // Alla anrop filtrerar bara på user.id och är oberoende av varandra.
    const [profileRes, chat, analysis, testRes, savedLettersRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('weekly_letter_count, weekly_letter_first_used_at, onboarding_track')
        .eq('id', user.id)
        .single(),
      checkChatQuota(supabase, user.id),
      checkCvAnalysisQuota(supabase, user.id),
      supabase
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', todayStart),
      supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_saved', true),
    ]);

    const onboardingTrack = lasTrack(
      (profileRes.data as { onboarding_track?: unknown } | null)?.onboarding_track
    );

    // Har kontot allt som finns ritas ingen kvotrad alls, precis som förut.
    // Ett spår har däremot kvar sina gränser i det andra spåret, så då måste
    // raderna stå kvar och visa var taket går.
    if (scope === 'allt') {
      return NextResponse.json({
        isPremium: true,
        scope,
        onboardingTrack,
        items: [],
      } satisfies QuotaStatusResponse);
    }

    const forstaBrevet = profileRes.data?.weekly_letter_first_used_at ?? null;
    const { effectiveCount: lettersUsed } = resolveWeeklyLetterCounter(
      profileRes.data?.weekly_letter_count ?? 0,
      forstaBrevet
    );

    /** Har kontot featuren står raden utan tak i stället för att försvinna. */
    const limitOf = (feature: Feature, n: number) =>
      scopeHasFeature(scope, feature) ? null : n;

    const items: QuotaStatusItem[] = [
      {
        key: 'letters',
        label: 'Brev',
        used: lettersUsed,
        limit: limitOf('letter_download', DAILY_LIMIT_LETTERS),
        nextResetAt: nextLetterResetAt(forstaBrevet),
        feature: 'letter_download',
      },
      {
        key: 'analysis',
        label: 'Analys',
        used: analysis.used,
        limit: limitOf('cv_analysis_full', CV_ANALYSIS_LIMIT),
        nextResetAt: analysis.nextResetAt,
        feature: 'cv_analysis_full',
        perAccount: analysis.perAccount === true,
      },
      {
        key: 'chat',
        label: 'Chatt',
        used: chat.used,
        limit: limitOf('chat_unlimited', FREE_CHAT_MESSAGES_PER_ACCOUNT),
        nextResetAt: chat.nextResetAt,
        feature: 'chat_unlimited',
        perAccount: chat.perAccount === true,
      },
      {
        // Testkvoten är en session per testtyp och dygn, inte totalt. Därför
        // saknar raden denominator och visar bara hur många som körts.
        key: 'tests',
        label: 'Tester',
        used: testRes.count ?? 0,
        limit: null,
        nextResetAt: nextMidnight,
        feature: 'tests_above_base',
      },
      {
        key: 'savedLetters',
        label: 'Sparade brev',
        used: savedLettersRes.count ?? 0,
        limit: scopeHasFeature(scope, 'letter_download') ? null : FREE_MAX_SAVED_LETTERS,
        nextResetAt: null,
      },
    ];

    return NextResponse.json({
      isPremium: scope !== null,
      scope,
      onboardingTrack,
      items,
    } satisfies QuotaStatusResponse);
  } catch (error) {
    console.error('quota/status error:', error);
    return NextResponse.json({ error: 'Failed to load quota status' }, { status: 500 });
  }
}
