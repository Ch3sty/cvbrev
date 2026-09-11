import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import {
  DAILY_LIMIT_LETTERS,
  DAILY_LIMIT_CHAT_MESSAGES,
  CV_ANALYSIS_LIMIT,
  checkChatQuota,
  checkCvAnalysisQuota,
  resolveDailyLetterCounter,
  startOfTodayStockholm,
  nextMidnightStockholm,
} from '@/lib/quota/quotaService';
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';

/**
 * GET /api/quota/status
 *
 * Samlad kvotstatus för dashboardens kvotrad (docs/plan-inloggat-saljflode.md,
 * punkt 7). Återanvänder funktionerna i quotaService så att raden och
 * spärrarna aldrig kan visa olika siffror.
 *
 * Premium får isPremium: true och inga kvoter att rendera.
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

    if (await userHasPremiumAccess(supabase, user.id)) {
      return NextResponse.json({ isPremium: true, items: [] });
    }

    const todayStart = startOfTodayStockholm().toISOString();
    const nextMidnight = nextMidnightStockholm().toISOString();

    // Alla anrop filtrerar bara på user.id och är oberoende av varandra.
    const [profileRes, chat, analysis, testRes, savedLettersRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('weekly_letter_count, weekly_letter_first_used_at')
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

    const { effectiveCount: lettersToday } = resolveDailyLetterCounter(
      profileRes.data?.weekly_letter_count ?? 0,
      profileRes.data?.weekly_letter_first_used_at ?? null
    );

    const items: QuotaStatusItem[] = [
      {
        key: 'letters',
        label: 'Brev',
        used: lettersToday,
        limit: DAILY_LIMIT_LETTERS,
        nextResetAt: nextMidnight,
      },
      {
        key: 'analysis',
        label: 'Analys',
        used: analysis.used,
        limit: CV_ANALYSIS_LIMIT,
        nextResetAt: analysis.nextResetAt,
      },
      {
        key: 'chat',
        label: 'Chatt',
        used: chat.used,
        limit: DAILY_LIMIT_CHAT_MESSAGES,
        nextResetAt: chat.nextResetAt,
      },
      {
        // Testkvoten är DAILY_LIMIT_TEST_SESSIONS per testtyp, inte totalt.
        // Därför saknar raden denominator och visar bara hur många som körts.
        key: 'tests',
        label: 'Tester',
        used: testRes.count ?? 0,
        limit: null,
        nextResetAt: nextMidnight,
      },
      {
        key: 'savedLetters',
        label: 'Sparade brev',
        used: savedLettersRes.count ?? 0,
        limit: FREE_MAX_SAVED_LETTERS,
        nextResetAt: null,
      },
    ];

    return NextResponse.json({ isPremium: false, items });
  } catch (error) {
    console.error('quota/status error:', error);
    return NextResponse.json({ error: 'Failed to load quota status' }, { status: 500 });
  }
}
