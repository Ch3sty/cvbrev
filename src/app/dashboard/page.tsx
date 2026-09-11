'use client';

/**
 * Dashboarden i tre tillstånd (docs/plan-konvertering.md, B4).
 *
 *   A  inget CV        → bara heron med uppladdningen och två textlänkar
 *   B  CV men inget brev → heron pekar mot första brevet, tre kompakta kort
 *   C  aktiv            → statusrad, aktivitet och snabbåtgärder
 *
 * TrialStatusRow och DowngradedNotice (spår A) ligger överst i alla lägen.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion } from 'framer-motion';
import { useNotification } from '@/context/notificationcontext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { logUserActivity } from '@/lib/activity-logger';

// Trial och nedgradering (spår A)
import TrialStatusRow from '@/components/dashboard/TrialStatusRow';
import DowngradedNotice from '@/components/dashboard/DowngradedNotice';
import PurchaseConfirmation from '@/components/dashboard/PurchaseConfirmation';
import QuotaNudgeRow from '@/components/dashboard/QuotaNudgeRow';
import ProfilKomplettering from '@/components/dashboard/ProfilKomplettering';
// Tillstånden
import DashboardHero, { deriveDashboardState } from '@/components/dashboard/DashboardHero';
import DashboardStatusRow from '@/components/dashboard/DashboardStatusRow';
// Status och handlingsytor
import StreakOchStatus from '@/components/dashboard/StreakOchStatus';
import CvStatusCard from '@/components/dashboard/CvStatusCard';
import DashboardSnabbAtgarder from '@/components/dashboard/DashboardSnabbAtgarder';
import DashboardSenasteAktivitet from '@/components/dashboard/DashboardSenasteAktivitet';
import SoktaTjansterStatusRad from '@/components/dashboard/SoktaTjansterStatusRad';
import BliUpptacktStatusRad from '@/components/dashboard/BliUpptacktStatusRad';
import NastaSteg from '@/components/dashboard/NastaSteg';
import { useApplicationsSummary } from '@/hooks/useApplicationsSummary';
import { useNextBestAction } from '@/hooks/useNextBestAction';

interface DashboardStats {
  totalLetters: number;
  totalAnalyses: number;
  subscriptionTier: string;
  recentLetters: any[];
  currentLevel?: number;
  levelTitle?: string;
  availableRewards?: number;
  isPremium?: boolean;
  monthlyLetters?: number;
  weeklyLetterCount?: number;
  weeklyAnalysisCount?: number;
  weeklyLinkedInCount?: number;
  cvCount?: number;
  letterResetDate?: Date;
  analysisResetDate?: Date;
  linkedInResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
  currentPeriodEnd?: string | null;
  onboardingCompleted?: boolean;
  dailyStreak?: number;
  longestStreak?: number;
  dailyXpEarned?: number;
  dailyXp?: { date: string; xp: number }[];
  firstName?: string;
  activeCvName?: string;
  userId?: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { successWithMascotAndActivity } = useNotification();
  const { completedSteps, rewardClaimed } = useOnboarding();

  // Rekommendationskedjan: tidskänsliga nudgar renderas i NastaSteg,
  // funktionsrekommendationer markerar motsvarande snabbåtgärdskort.
  const appSummary = useApplicationsSummary();
  const { action: nextAction, dismiss: dismissNextAction } = useNextBestAction(appSummary);
  const recommendedSlug =
    rewardClaimed && nextAction?.kind === 'feature' ? nextAction.feature.slug : null;

  const [stats, setStats] = useState<DashboardStats>({
    totalLetters: 0,
    totalAnalyses: 0,
    subscriptionTier: 'free',
    recentLetters: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refetch dashboard-data nar onboarding-state andras (efter att t.ex.
  // CV-analys completas pollar OnboardingContext via realtime och uppdaterar
  // completedSteps - vi vill da spegla det i streak-stats m.m.)
  const onboardingSnapshot = `${completedSteps.length}-${rewardClaimed}`;

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Datum-gränser beräknas före anropen så de kan köras parallellt.
        const todayStockholm = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Stockholm',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
        twentyEightDaysAgo.setHours(0, 0, 0, 0);

        // Alla anrop nedan är oberoende (filtrerar bara på user.id) → kör parallellt.
        // Rewards-fetchen har egen felhantering och resolvar till fallback vid fel.
        const fallbackRewards = { currentLevel: 1, levelTitle: 'Novis', availableRewards: 0 };
        const [
          { data: letters },
          { count: cvCount },
          { data: latestCv },
          { data: profile },
          { data: gamStats },
          { data: dailyXpToday },
          { data: xpRows },
          rewardsData,
        ] = await Promise.all([
          supabase
            .from('letters')
            .select('id, user_id, title, company, job_title, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('cv_texts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('cv_texts')
            .select('file_name')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false, nullsFirst: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select(`
              full_name,
              subscription_tier,
              premium_until,
              premium_source,
              current_period_end,
              weekly_letter_count,
              weekly_letter_reset_at,
              weekly_analysis_count,
              weekly_analysis_reset_at,
              weekly_linkedin_count,
              weekly_linkedin_reset_at,
              onboarding_completed,
              onboarding_started_at,
              onboarding_skipped,
              created_at
            `)
            .eq('id', user.id)
            .single(),
          supabase
            .from('global_user_stats')
            .select('daily_streak, longest_streak')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('user_daily_xp')
            .select('daily_xp_earned')
            .eq('user_id', user.id)
            .eq('date', todayStockholm)
            .maybeSingle(),
          supabase
            .from('xp_history')
            .select('created_at, amount')
            .eq('user_id', user.id)
            .gte('created_at', twentyEightDaysAgo.toISOString()),
          fetch('/api/rewards/status')
            .then(async (res) => {
              if (!res.ok) return fallbackRewards;
              const rewards = await res.json();
              return {
                currentLevel: rewards.data.currentLevel || 1,
                levelTitle: rewards.data.levelTitle || 'Novis',
                availableRewards: rewards.data.availableRewards?.length || 0,
              };
            })
            .catch((error) => {
              console.error('Fel vid hämtning av rewards:', error);
              return fallbackRewards;
            }),
        ]);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyLetters = letters?.filter(letter =>
          new Date(letter.created_at) >= startOfMonth
        ) || [];

        const dailyXp: { date: string; xp: number }[] = [];
        for (let i = 27; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          day.setHours(0, 0, 0, 0);
          const next = new Date(day);
          next.setDate(next.getDate() + 1);
          const xp = (xpRows || [])
            .filter(r => {
              const d = new Date(r.created_at);
              return d >= day && d < next;
            })
            .reduce((sum, r) => sum + (r.amount ?? 0), 0);
          dailyXp.push({
            date: day.toISOString().slice(0, 10),
            xp,
          });
        }


        const isPremium = !!(
          profile?.subscription_tier === 'premium' ||
          (profile?.premium_until && new Date(profile.premium_until) > new Date()) ||
          profile?.premium_source
        );

        setStats({
          totalLetters: letters?.length || 0,
          totalAnalyses: profile?.weekly_analysis_count || 0,
          subscriptionTier: profile?.subscription_tier || 'free',
          recentLetters: letters?.slice(0, 3).map(letter => ({
            ...letter,
            company_name: letter.company,
            position: letter.job_title
          })) || [],
          weeklyLetterCount: profile?.weekly_letter_count || 0,
          weeklyAnalysisCount: profile?.weekly_analysis_count || 0,
          weeklyLinkedInCount: profile?.weekly_linkedin_count || 0,
          cvCount: cvCount || 0,
          letterResetDate: profile?.weekly_letter_reset_at ? new Date(profile.weekly_letter_reset_at) : undefined,
          analysisResetDate: profile?.weekly_analysis_reset_at ? new Date(profile.weekly_analysis_reset_at) : undefined,
          linkedInResetDate: profile?.weekly_linkedin_reset_at ? new Date(profile.weekly_linkedin_reset_at) : undefined,
          currentLevel: rewardsData.currentLevel,
          levelTitle: rewardsData.levelTitle,
          availableRewards: rewardsData.availableRewards,
          isPremium,
          monthlyLetters: monthlyLetters.length,
          premiumUntil: profile?.premium_until || null,
          premiumSource: profile?.premium_source || null,
          currentPeriodEnd: profile?.current_period_end || null,
          onboardingCompleted: profile?.onboarding_completed || false,
          dailyStreak: gamStats?.daily_streak || 0,
          longestStreak: gamStats?.longest_streak || 0,
          dailyXpEarned: dailyXpToday?.daily_xp_earned || 0,
          dailyXp,
          firstName: profile?.full_name?.split(' ')[0] || undefined,
          activeCvName: latestCv?.file_name || undefined,
          userId: user.id,
        });
      } catch (error) {
        console.error('Fel vid hämtning av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingSnapshot, refreshKey]);

  // Kvitto efter köp. Kortet visar produkt och slutdatum, så det räcker med
  // att logga aktiviteten här i stället för att också visa en toast.
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const loggedPurchase = useRef(false);

  useEffect(() => {
    const premiumActivated = searchParams.get('premium_activated');
    if (premiumActivated !== 'true' || stats.subscriptionTier !== 'premium') return;
    if (loggedPurchase.current) return;
    loggedPurchase.current = true;

    setPurchasedPlan(searchParams.get('plan'));

    if (stats.userId) {
      void logUserActivity(
        stats.userId,
        'premium_activated',
        'aktiverade Premium',
        { tier: 'premium', plan: searchParams.get('plan') ?? undefined }
      );
    }
  }, [searchParams, stats.subscriptionTier, stats.userId]);

  // Stripe-webhooken kan ligga några sekunder efter att användaren landar
  // tillbaka. Hämta om profilen ett par gånger tills premium syns, annars
  // visas inget kvitto trots lyckat köp.
  const purchasePolls = useRef(0);
  useEffect(() => {
    if (searchParams.get('premium_activated') !== 'true') return;
    if (loading || stats.subscriptionTier === 'premium' || purchasePolls.current >= 4) return;
    purchasePolls.current += 1;
    const t = setTimeout(() => setRefreshKey((k) => k + 1), 2500);
    return () => clearTimeout(t);
  }, [searchParams, loading, stats.subscriptionTier]);

  const cvCount = stats.cvCount || 0;
  const totalLetters = stats.totalLetters || 0;
  const isPremium = stats.isPremium || false;
  const state = deriveDashboardState(cvCount, totalLetters);

  // B7: vilket tillstånd användaren faktiskt mötte. En gång per session.
  const loggedState = useRef<string | null>(null);
  useEffect(() => {
    if (loading || !stats.userId) return;
    if (loggedState.current === state) return;
    loggedState.current = state;
    void logUserActivity(stats.userId, 'activation_state', `Dashboard i tillstånd ${state}`, {
      state,
      cvCount,
      totalLetters,
    });
  }, [loading, stats.userId, state, cvCount, totalLetters]);

  const handleCvUploaded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Sektionsskeleton i stället för blockerande spinner: layouten står still
  // och fylls i, ingen "tom skärm tills långsammaste anropet är klart".
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Laddar dashboard">
        <div className="rounded-lg bg-neutral-100 h-10" />
        <div className="rounded-xl bg-white border border-neutral-200 h-64" />
        <div className="rounded-xl bg-white border border-neutral-200 h-32" />
      </div>
    );
  }

  // Svar = ansökningar som fått någon form av respons.
  const replies = Math.max(0, appSummary.total - appSummary.waitingCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Kvitto efter köp, sedan trial och nedgradering. */}
      {purchasedPlan !== null && (
        <PurchaseConfirmation
          plan={purchasedPlan}
          premiumUntil={stats.premiumUntil}
          currentPeriodEnd={stats.currentPeriodEnd}
          onDismiss={() => setPurchasedPlan(null)}
        />
      )}
      <TrialStatusRow />
      <DowngradedNotice />

      <DashboardHero
        state={state}
        userId={stats.userId}
        firstName={stats.firstName}
        onCvUploaded={handleCvUploaded}
      />

      {state === 'B' && (
        <>
          <ProfilKomplettering />
          <DashboardSnabbAtgarder cvCount={cvCount} recommendedSlug={recommendedSlug} />
        </>
      )}

      {state === 'C' && (
        <>
          <DashboardStatusRow
            letters={totalLetters}
            applications={appSummary.total}
            replies={replies}
            streakDays={stats.dailyStreak || 0}
          />

          {/* Alla gratiskvoter som en rad, alltid synlig (punkt 7). */}
          <QuotaNudgeRow isPremium={isPremium} />

          {/* Saknade kontaktuppgifter, bara när något faktiskt saknas. */}
          <ProfilKomplettering />

          {/* NastaSteg: EN tidskänslig nudge (uppföljning / AF-rapport). */}
          {rewardClaimed && <NastaSteg action={nextAction} onDismiss={dismissNextAction} />}

          {/* Döljer sig själv vid noll rader. */}
          <DashboardSenasteAktivitet />

          <DashboardSnabbAtgarder cvCount={cvCount} recommendedSlug={recommendedSlug} />

          <CvStatusCard cvCount={cvCount} activeCvName={stats.activeCvName} />
          <SoktaTjansterStatusRad summary={appSummary} />
          <BliUpptacktStatusRad />

          <StreakOchStatus
            dailyStreak={stats.dailyStreak || 0}
            longestStreak={stats.longestStreak || 0}
            dailyXpEarned={stats.dailyXpEarned || 0}
            currentLevel={stats.currentLevel || 1}
            levelTitle={stats.levelTitle || 'Novis'}
            dailyXp={stats.dailyXp || []}
            isPremium={isPremium}
            weeklyLetterCount={stats.weeklyLetterCount || 0}
            weeklyAnalysisCount={stats.weeklyAnalysisCount || 0}
            weeklyLinkedInCount={stats.weeklyLinkedInCount || 0}
            letterResetDate={stats.letterResetDate}
            premiumUntil={stats.premiumUntil}
            premiumSource={stats.premiumSource}
          />
        </>
      )}
    </motion.div>
  );
}
