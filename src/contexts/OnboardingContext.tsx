'use client';

/**
 * Onboardingens state utan egen hämtningskedja.
 *
 * Tidigare körde denna provider ett eget auth.getUser(), en egen
 * "profiles select *", sex count-frågor och sju realtidskanaler vid varje
 * sidladdning i det inloggade läget. Allt det betalades på varje dashboard-sida
 * eftersom providern ligger i dashboardens layout.
 *
 * Nu kommer stegen ur den aggregerade routen /api/dashboard/summary via
 * DashboardDataContext, som redan hämtas en gång per sidladdning. Kvar här
 * finns bara det som är genuint klientstate: optimistiska markeringar och
 * auto-claim.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useNotification } from '@/context/notificationcontext';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import {
  countRequiredCompleted,
  isOnboardingComplete,
  isEligibleForAutoClaim,
} from '@/lib/onboarding/steps';

interface OnboardingContextType {
  completedSteps: string[];
  completedCount: number;
  requiredCompletedCount: number;
  onboardingCompleted: boolean;
  rewardClaimed: boolean;
  isLoading: boolean;
  markStepComplete: (stepName: string) => void;
  markRewardClaimed: () => void;
  refetch: () => Promise<void>;
}

/**
 * Formen på data.onboarding i /api/dashboard/summary. Deklareras lokalt så att
 * hooken tål att fältet saknas i ett äldre cachat svar från sessionStorage.
 */
interface OnboardingSummary {
  completedSteps?: string[];
  rewardClaimed?: boolean;
  createdAt?: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { summary, isLoading: summaryLoading, refresh } = useDashboardData();
  const { success } = useNotification();

  // Optimistiska markeringar lever vid sidan av serverdatan i stället för att
  // skriva över den. Ett steg som markerats klart lokalt ligger kvar i denna
  // mängd tills summaryn har hunnit bekräfta det, så en revalidering mitt i
  // kan aldrig få steget att försvinna ur gränssnittet.
  const [localSteps, setLocalSteps] = useState<string[]>([]);
  const [localRewardClaimed, setLocalRewardClaimed] = useState(false);

  // Auto-claim: en gång per session, bara för konton skapade efter utrullningen.
  const autoClaimAttempted = useRef(false);

  const onboarding = ((summary as unknown as { onboarding?: OnboardingSummary } | null)
    ?.onboarding ?? null);

  const completedSteps = useMemo(() => {
    const fromServer = onboarding?.completedSteps ?? [];
    if (localSteps.length === 0) return fromServer;
    const merged = [...fromServer];
    for (const step of localSteps) {
      if (!merged.includes(step)) merged.push(step);
    }
    return merged;
  }, [onboarding?.completedSteps, localSteps]);

  const onboardingCompleted = isOnboardingComplete(completedSteps);
  const rewardClaimed = Boolean(onboarding?.rewardClaimed) || localRewardClaimed;

  // Laddar bara så länge vi saknar data helt. Cachat svar visas direkt.
  const isLoading = summaryLoading && onboarding === null;

  const markStepComplete = useCallback((stepName: string) => {
    setLocalSteps((prev) => (prev.includes(stepName) ? prev : [...prev, stepName]));
  }, []);

  const markRewardClaimed = useCallback(() => {
    setLocalRewardClaimed(true);
  }, []);

  const refetch = useCallback(async () => {
    await refresh();
  }, [refresh]);

  /**
   * Realtiden är borta. De sju kanalerna gjorde bara en sak: anropa om
   * hämtningen när något ändrats. Eftersom stegen numera kommer ur summaryn
   * räcker det att hämta om den, och de förändringar som spelar roll sker
   * antingen i denna flik (då anropar komponenten markStepComplete direkt) eller
   * medan fliken legat i bakgrunden. En hämtning när fliken blir synlig igen
   * täcker det senare fallet till priset av noll öppna WebSocket-kanaler.
   */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  // Auto-claim: när CV:t är uppladdat markeras steget klart åt användaren.
  // Sedan våg 2 punkt 21 finns ingen belöning att hämta, bara en flagga och
  // en bekräftelse. Ref-vakten skyddar mot dubbelanrop när en revalidering
  // triggar en omrendering mitt i, och routen är dessutom idempotent
  // (400 vid dubbel).
  useEffect(() => {
    if (isLoading || rewardClaimed || !onboardingCompleted) return;
    if (!isEligibleForAutoClaim(onboarding?.createdAt)) return;
    if (autoClaimAttempted.current) return;

    autoClaimAttempted.current = true;

    (async () => {
      try {
        const res = await fetch('/api/onboarding/claim-reward', { method: 'POST' });
        if (!res.ok) {
          // 400 betyder oftast redan hämtad. Synka state och gå vidare.
          if (res.status === 400) setLocalRewardClaimed(true);
          return;
        }
        setLocalRewardClaimed(true);
        success('Ditt CV är på plats');
      } catch (error) {
        console.error('[OnboardingContext] Auto-claim misslyckades:', error);
      }
    })();
  }, [isLoading, rewardClaimed, onboardingCompleted, onboarding?.createdAt, success]);

  const value = useMemo<OnboardingContextType>(
    () => ({
      completedSteps,
      completedCount: completedSteps.length,
      requiredCompletedCount: countRequiredCompleted(completedSteps),
      onboardingCompleted,
      rewardClaimed,
      isLoading,
      markStepComplete,
      markRewardClaimed,
      refetch,
    }),
    [
      completedSteps,
      onboardingCompleted,
      rewardClaimed,
      isLoading,
      markStepComplete,
      markRewardClaimed,
      refetch,
    ]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
