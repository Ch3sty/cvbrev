'use client';

/**
 * Dashboarden i tre tillstånd (docs/plan-konvertering.md, B4).
 *
 *   A  inget CV        → bara heron med uppladdningen och två textlänkar
 *   B  CV men inget brev → heron pekar mot första brevet, tre kompakta kort
 *   C  aktiv            → jobbsöksöversikt, nästa handling, pipeline,
 *                          kvotrad och senaste aktivitet (fem sektioner)
 *
 * TrialStatusRow och DowngradedNotice (spår A) ligger överst i alla lägen.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { nextAfReportDeadline } from '@/lib/applications/afReport';
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary';
import { logUserActivity } from '@/lib/activity-logger';

// Trial och nedgradering (spår A)
import TrialStatusRow from '@/components/dashboard/TrialStatusRow';
import DowngradedNotice from '@/components/dashboard/DowngradedNotice';
import PurchaseConfirmation from '@/components/dashboard/PurchaseConfirmation';
import QuotaNudgeRow from '@/components/dashboard/QuotaNudgeRow';
import ProfilKomplettering from '@/components/dashboard/ProfilKomplettering';
// Tillstånden
import DashboardHero, { deriveDashboardState } from '@/components/dashboard/DashboardHero';
// Status och handlingsytor
import DashboardSnabbAtgarder from '@/components/dashboard/DashboardSnabbAtgarder';
import JobbsokOversikt from '@/components/dashboard/JobbsokOversikt';
import PagarNu from '@/components/dashboard/PagarNu';
import NastaHandling from '@/components/dashboard/NastaHandling';
import DashboardSenasteAktivitet from '@/components/dashboard/DashboardSenasteAktivitet';
import { useNextBestAction } from '@/hooks/useNextBestAction';

interface DashboardStats {
  totalLetters: number;
  totalAnalyses: number;
  subscriptionTier: string;
  recentLetters: any[];
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
  firstName?: string;
  activeCvName?: string;
  userId?: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { successWithMascotAndActivity } = useNotification();
  const { completedSteps, rewardClaimed } = useOnboarding();
  const { user } = useAuth();

  // Rekommendationskedjan: tidskänsliga nudgar renderas i NastaSteg,
  // funktionsrekommendationer markerar motsvarande snabbåtgärdskort.
  // All data kommer från en enda serverhämtning (/api/dashboard/summary) via
  // DashboardDataContext. Tidigare gjorde den här sidan tio egna rundturer och
  // useApplicationsSummary hämtade dessutom hela ansökningslistan för att räkna
  // i klienten. Se docs/rapporter/perf-inloggat-2026-09-12.md.
  const { summary, isLoading, refresh } = useDashboardData();

  // Ansökningssiffrorna räknas numera på servern. Formen hålls identisk med
  // det konsumenterna redan förväntar sig.
  const appSummary = {
    ...(summary?.applications ?? {
      waitingCount: 0,
      interviewCount: 0,
      followUpCount: 0,
      prevMonthCount: 0,
      weekCount: 0,
      replyCount: 0,
      pipeline: [],
    }),
    total:
      (summary?.applications.waitingCount ?? 0) +
      (summary?.applications.interviewCount ?? 0),
    loaded: summary !== null,
    // Svarsfrekvensen hör hemma på ansökningssidan, inte på hemskärmen.
    replyRate: null,
    // Ren klientberäkning ur dagens datum, ingen rundtur.
    afReport: nextAfReportDeadline(),
    // Hela listan används bara av CV-jämförelsen, som hämtar den själv.
    applications: [],
    pipeline: (summary?.applications.pipeline ?? []) as ApplicationsSummary['pipeline'],
  } satisfies ApplicationsSummary;

  const { action: nextAction, dismiss: dismissNextAction } = useNextBestAction(appSummary);
  const recommendedSlug =
    rewardClaimed && nextAction?.kind === 'feature' ? nextAction.feature.slug : null;

  const profile = summary?.profile as Record<string, any> | null | undefined;

  const isPremiumComputed = !!(
    profile?.subscription_tier === 'premium' ||
    (profile?.premium_until && new Date(profile.premium_until) > new Date()) ||
    profile?.premium_source
  );

  const stats: DashboardStats = {
    totalLetters: summary?.letters.total ?? 0,
    totalAnalyses: profile?.weekly_analysis_count ?? 0,
    subscriptionTier: profile?.subscription_tier ?? 'free',
    recentLetters: (summary?.letters.recent ?? []).map((letter) => ({
      ...letter,
      company_name: letter.company,
      position: letter.job_title,
    })),
    weeklyLetterCount: profile?.weekly_letter_count ?? 0,
    weeklyAnalysisCount: profile?.weekly_analysis_count ?? 0,
    weeklyLinkedInCount: profile?.weekly_linkedin_count ?? 0,
    cvCount: summary?.cv.count ?? 0,
    letterResetDate: profile?.weekly_letter_reset_at ? new Date(profile.weekly_letter_reset_at) : undefined,
    analysisResetDate: profile?.weekly_analysis_reset_at ? new Date(profile.weekly_analysis_reset_at) : undefined,
    linkedInResetDate: profile?.weekly_linkedin_reset_at ? new Date(profile.weekly_linkedin_reset_at) : undefined,
    isPremium: isPremiumComputed,
    monthlyLetters: summary?.letters.monthly ?? 0,
    premiumUntil: (profile?.premium_until as string) ?? null,
    premiumSource: (profile?.premium_source as string) ?? null,
    currentPeriodEnd: (profile?.current_period_end as string) ?? null,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    firstName: (profile?.full_name as string | undefined)?.split(' ')[0] || undefined,
    activeCvName: summary?.cv.activeName || undefined,
    userId: user?.id,
  };

  const loading = isLoading;

  // Onboarding-status som strang: andras den har nagot blivit klart.
  const onboardingSnapshot = `${completedSteps.length}-${rewardClaimed}`;

  // Onboarding-ändringar (t.ex. att en CV-analys blir klar) ska spegla sig i
  // siffrorna. Contexten hämtar om i stället för att sidan gör en egen runda.
  useEffect(() => {
    if (!summary) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingSnapshot]);

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
    const t = setTimeout(() => { void refresh(); }, 2500);
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
    void refresh();
  }, [refresh]);

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

  return (
    <div className="space-y-6 motion-safe:animate-[slideUp_200ms_ease-out]">
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
          {/* Tillstånd C har medvetet ingen hero: statusraden är vyns
              startpunkt. Men sidan måste ändå ha en h1, annars är hela
              dashboarden rubriklös för skärmläsare, och det är den sida
              användaren möter oftast. Dold visuellt, inte för hjälpmedel. */}
          <h1 className="sr-only">Översikt över ditt jobbsök</h1>

          {/* 1. Jobbsöket: fyra beskrivande antal och vyns enda orange knapp. */}
          <JobbsokOversikt summary={appSummary} />

          {/* 2. En rankad handling: uppföljning, AF-fönstret eller en oprövad
                 funktion. Aldrig fler än en åt gången. */}
          <NastaHandling action={nextAction} onDismiss={dismissNextAction} />

          {/* 3. De tre mest tidskänsliga ansökningarna. */}
          <PagarNu
            items={appSummary.pipeline}
            total={appSummary.total}
            letterCount={totalLetters}
          />

          {/* 4. Kvoterna som en rad. Premium får null. */}
          <QuotaNudgeRow isPremium={isPremium} />

          {/* 5. Senaste aktivitet. Döljer sig själv vid noll rader. */}
          <DashboardSenasteAktivitet />

          {/* Utanför de fem: visas bara när kontaktuppgifter faktiskt saknas. */}
          <ProfilKomplettering />
        </>
      )}
    </div>
  );
}
