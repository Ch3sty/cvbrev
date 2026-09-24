'use client';

/**
 * Dashboarden i tre tillstånd (docs/plan-konvertering.md, B4).
 *
 *   A  inget CV        → bara heron med uppladdningen och två textlänkar
 *   B  CV men inget brev → heron pekar mot första brevet, tre kompakta kort
 *   C  aktiv            → display-h1 med sammanhangsrad, Nästa handling som
 *                          bläckyta, talet med fördelning, Pågår nu som rader
 *                          på mark och veckan som meningar per dag
 *                          (docs/design/analys-visuell-linje-2026-09-22.html,
 *                          avsnitt 3)
 *
 * DowngradedNotice ligger överst i alla lägen. Hjälpredan Kom igång ligger
 * inte här utan i skalet: en rad ovanför bottennavigeringen och ett ark
 * (docs/design/spec-onboarding-2026-09-22.html, sektion 2).
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { nextAfReportDeadline } from '@/lib/applications/afReport';
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary';
import { logUserActivity } from '@/lib/activity-logger';

// Tråden (docs/design/koncept-2026-09-13.md): sektionerna bor i (oversikt).
import DowngradedNotice from '@/components/dashboard/DowngradedNotice';
import PurchaseConfirmation from './PurchaseConfirmation';
import QuotaNudgeRow from './QuotaNudgeRow';
import ProfilKomplettering from './ProfilKomplettering';
import DashboardHero, { deriveDashboardState } from './DashboardHero';
import SnabbAtgarder from './SnabbAtgarder';
import JobbsokOversikt from './JobbsokOversikt';
import PagarNu from './PagarNu';
import NastaHandling from './NastaHandling';
import HemHuvud, { sammanhangsrad } from './HemHuvud';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
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

export default function DashboardHem({ aktivitet }: { aktivitet?: ReactNode }) {
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

  const { action: nextAction, dismiss: dismissNextAction } = useNextBestAction(appSummary, summary?.intervju);
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

  // Skelettet står stilla i insunken, bara tråden rör sig längs överkanten.
  //
  // Skelettet gissade tidigare på det fullaste tillståndet (statusrad, kort
  // och tre listrader). För en ny användare är tillstånd A mycket kortare, så
  // när datan kom hoppade sidan 498 px uppåt: CLS 0,191 på den vy användaren
  // möter först. Skelettet visar nu bara det som finns i varje tillstånd, och
  // ytan är reserverad med samma min-height i båda grenarna.
  if (loading) {
    return (
      <div className="min-h-[420px] space-y-4 sm:space-y-6" aria-label="Laddar dashboard">
        <LoadingSkeleton variant="statusRow" label="Laddar dashboard" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  return (
    // Ingen entré-animation här. threadEnter börjar på opacity 0 med
    // translateY(8px), och LCP kan inte registreras på ett element som är
    // helt genomskinligt: mätningen sköts fram tills animationen hunnit en
    // bit, och de åtta pixlarna räknas dessutom som rörelse. Sidbytet tonas
    // redan in en gång i DashboardShell (fadeInPlace, bara opacity), så den
    // här var dubbelt arbete på den sida som har hårdast budget.
    <div className="min-h-[420px] space-y-4 sm:space-y-6">
      {/* Kvitto efter köp, sedan trial och nedgradering. */}
      {purchasedPlan !== null && (
        <PurchaseConfirmation
          plan={purchasedPlan}
          premiumUntil={stats.premiumUntil}
          currentPeriodEnd={stats.currentPeriodEnd}
          onDismiss={() => setPurchasedPlan(null)}
        />
      )}
      <DowngradedNotice />

      <DashboardHero
        state={state}
        userId={stats.userId}
        firstName={stats.firstName}
        onCvUploaded={handleCvUploaded}
      />

      {/* Kortet gör en egen rundtur till profiles efter att summeringen kommit,
          så det landar drygt två sekunder in. Låg det över SnabbAtgarder sköt
          det ner 426 px när det dök upp, alltså CLS 0,19 på dashboarden. Sist
          i ordningen, precis som i tillstånd C, syns samma sena ankomst inte:
          det finns inget under det att flytta. */}
      {state === 'B' && (
        <>
          <SnabbAtgarder cvCount={cvCount} recommendedSlug={recommendedSlug} />
          <ProfilKomplettering />
        </>
      )}

      {state === 'C' && (
        <>
          <HemHuvud
            fornamn={stats.firstName}
            rad={sammanhangsrad(
              summary?.hem?.svarSenasteDygnet ?? 0,
              summary?.hem?.nastaIntervju ?? null
            )}
          />

          {/* Mobil: Nästa handling först, sedan talet. Desktop: talet till
              vänster och bläckytan till höger, som i skissen. En bläckyta
              per vy (regel 3). */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="lg:order-2">
              <NastaHandling action={nextAction} onDismiss={dismissNextAction} />
            </div>
            <div className="lg:order-1">
              <JobbsokOversikt summary={appSummary} fordelning={summary?.hem} />
            </div>
          </div>

          {/* Kvoterna som en rad. Premium får null. */}
          <QuotaNudgeRow isPremium={isPremium} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <PagarNu items={appSummary.pipeline} total={appSummary.total} letterCount={totalLetters} />
            {aktivitet}
          </div>

          {/* Utanför de fem: visas bara när kontaktuppgifter faktiskt saknas. */}
          <ProfilKomplettering />
        </>
      )}
    </div>
  );
}
