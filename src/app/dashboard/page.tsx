'use client';

/**
 * Dashboarden i tre tillstånd (docs/plan-konvertering.md, B4).
 *
 *   A  inget CV        → bara heron med uppladdningen och två textlänkar
 *   B  CV men inget brev → heron pekar mot första brevet, tre kompakta kort
 *   C  aktiv            → jobbsöksöversikt, nästa handling, pipeline,
 *                          kvotrad och senaste aktivitet (fem sektioner)
 *
 * SparRad och DowngradedNotice ligger överst i alla lägen. För den betalande
 * ligger VeckoTrad först i stället: under veckan är veckan nästa handling, så
 * NastaHandling visas inte samtidigt som en oavklarad dag finns
 * (docs/plan-paket-och-onboarding.md, flöde 3).
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

// Tråden (docs/design/koncept-2026-09-13.md): sektionerna bor i (oversikt).
import SparRad from '@/components/dashboard/SparRad';
import SparFragaIgen from '@/components/dashboard/SparFragaIgen';
import VeckoTrad from '@/components/dashboard/VeckoTrad';
import DowngradedNotice from '@/components/dashboard/DowngradedNotice';
import PurchaseConfirmation from './(oversikt)/PurchaseConfirmation';
import QuotaNudgeRow from './(oversikt)/QuotaNudgeRow';
import ProfilKomplettering from './(oversikt)/ProfilKomplettering';
import DashboardHero, { deriveDashboardState } from './(oversikt)/DashboardHero';
import SnabbAtgarder from './(oversikt)/SnabbAtgarder';
import JobbsokOversikt from './(oversikt)/JobbsokOversikt';
import PagarNu from './(oversikt)/PagarNu';
import NastaHandling from './(oversikt)/NastaHandling';
import SenasteAktivitet from './(oversikt)/SenasteAktivitet';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { useNextBestAction } from '@/hooks/useNextBestAction';
import type { PlanKey } from '@/lib/plans/plans';

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

  // Veckoprogrammet (docs/plan-paket-och-onboarding.md, flöde 3). Tillståndet
  // kommer serverrenderat ur /api/dashboard/summary, inte ur ett eget anrop:
  // en veckopanel som hämtar sig själv efter mount ger CLS och bryter
  // hemskärmens LCP-budget på 1,0 s.
  const week = summary?.week;
  const weekScope = week?.scope ?? null;
  const weekTrackValt = week?.track ?? null;
  // Spåret styr veckans innehåll. Har hon betalat utan att ha valt spår följer
  // veckan det betalda scopet.
  const veckoSpar = weekTrackValt ?? weekScope;
  // 'allt' kör ett av spårens veckor. CV är utgångsläget, precis som ordningen
  // på spårvalsskärmen.
  const veckoUnderSpar = veckoSpar === 'tester' ? 'tester' : 'cv';
  const veckoDag = Math.min(7, Math.max(1, week?.progressDay || 1));
  // Panelen visas bara för den som betalar. Gratisnivån får spårraden.
  const visaVeckan = Boolean(weekScope && veckoSpar);
  // Under veckan är veckan nästa handling. Två konkurrerande "gör det här nu"
  // är värre än noll, så NastaHandling står över medan en dag är oavklarad.
  const dagOavklarad = visaVeckan && (week?.progressDay ?? 0) < 7;

  const veckoPlan: PlanKey =
    weekScope === 'cv' ? 'cv_week' : weekScope === 'tester' ? 'test_week' : 'all_week';

  // Fyra tal till dag 7:s sammanställning. Räknar saker användaren gjort,
  // aldrig poäng: brev, CV, mallar och avklarade dagar.
  const veckoTal: [number, number, number, number] = [
    stats.totalLetters,
    stats.cvCount ?? 0,
    stats.weeklyLinkedInCount ?? 0,
    Math.max(0, veckoDag - 1),
  ];

  // Spårfrågan ställs om en gång, efter tre dagars aktivitet, om användaren
  // hoppade över den. Flaggan är onboarding_track_asked_at i profiles, alltså
  // i databasen och inte i localStorage: frågan ska inte komma om bara för att
  // hon bytt telefon.
  const fragaOmSpar =
    !loading &&
    !weekScope &&
    weekTrackValt === null &&
    Boolean(week?.trackAskedAt) &&
    Date.now() - new Date(week!.trackAskedAt!).getTime() > 3 * 24 * 60 * 60 * 1000;

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
      <SparRad track={weekTrackValt} scope={weekScope} />
      <DowngradedNotice />

      {/* Veckan ligger som hemskärmens första element under rubriken, ovanför
          allt annat. Bara för den som betalar: en gratisanvändare har ingen
          vecka att gå igenom. */}
      {visaVeckan && veckoSpar ? (
        <VeckoTrad
          track={veckoSpar}
          weekTrack={veckoUnderSpar}
          progressDay={veckoDag}
          planKey={veckoPlan}
          currentPeriodEnd={stats.currentPeriodEnd ?? null}
          summaryTal={veckoTal}
          onProgress={refresh}
        />
      ) : null}

      {/* Hoppade hon över spårfrågan och har varit aktiv i tre dagar frågar vi
          om, en gång. Aldrig mer än så. */}
      {fragaOmSpar ? (
        <SparFragaIgen />
      ) : null}

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
          {/* Tillstånd C har medvetet ingen hero: statusraden är vyns
              startpunkt. Men sidan måste ändå ha en h1, annars är hela
              dashboarden rubriklös för skärmläsare, och det är den sida
              användaren möter oftast. Dold visuellt, inte för hjälpmedel. */}
          <h1 className="sr-only">Översikt över ditt jobbsök</h1>

          {/* Två kolumner från lg (koncept, avsnitt 10): listorna får
              läsbredd till vänster, den enda handlingen och kvotraden står i
              höger synfält. På mobil följer allt i en kolumn i DOM-ordning.
              Varje komponent renderas exakt en gång: inga dubbla anrop. */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {/* 1. Jobbsöket: fyra beskrivande antal och vyns enda primära knapp. */}
            <div className="lg:col-start-1 lg:row-start-1">
              <JobbsokOversikt summary={appSummary} />
            </div>

            <aside className="space-y-4 sm:space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              {/* 2. En rankad handling: uppföljning, AF-fönstret eller en
                     oprövad funktion. Aldrig fler än en åt gången. */}
              {/* Under veckan är veckan nästa handling. Två konkurrerande
                     "gör det här nu" är värre än noll. */}
              {!dagOavklarad ? (
                <NastaHandling action={nextAction} onDismiss={dismissNextAction} />
              ) : null}

              {/* 4. Kvoterna som en rad. Premium får null. */}
              <QuotaNudgeRow isPremium={isPremium} />
            </aside>

            <div className="space-y-4 sm:space-y-6 lg:col-start-1 lg:row-start-2">
              {/* 3. De tre mest tidskänsliga ansökningarna. */}
              <PagarNu
                items={appSummary.pipeline}
                total={appSummary.total}
                letterCount={totalLetters}
              />

              {/* 5. Senaste aktivitet. Döljer sig själv vid noll rader. */}
              <SenasteAktivitet />

              {/* Utanför de fem: visas bara när kontaktuppgifter faktiskt saknas. */}
              <ProfilKomplettering />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
