// src/hooks/useNextBestAction.ts
// EN källa till sanning för "vad ska dashboarden rekommendera härnäst".
// Ersätter de tidigare parallella systemen (OnboardingDag2:s statiska tre kort
// och DiscoverByRecruitersCard) med en rankad kedja. Körs EFTER onboarding
// (OnboardingHero äger flödet fram till hämtad belöning).
//
// Rankning:
//   1. Uppföljningsnudge: pågående ansökningar med 14+ dagars tystnad
//   2. AF-rapportfönstret: den 1:a till 14:e, om något söktes förra månaden
//   3. En (1) oprövad nyckelfunktion från useUnusedFeatures (Bli upptäckt först)
//   4. Ingenting: etablerade användare får ytan till Snabbåtgärder i stället
//
// Varje typ har egen avfärdning med vettig livslängd (nudge 7 dagar,
// AF-påminnelsen till nästa fönster, features via useUnusedFeatures egna).

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useUnusedFeatures, type FeatureSpotlightItem, type FeatureSlug } from '@/hooks/useUnusedFeatures';
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary';

export type NextBestAction =
  | { kind: 'follow-up'; count: number }
  | { kind: 'af-report'; monthLabel: string; count: number }
  | { kind: 'feature'; feature: FeatureSpotlightItem }
  | null;

const DISMISS_FOLLOW_UP = 'nasta-steg-follow-up-until';
const DISMISS_AF = 'nasta-steg-af-until';
const FOLLOW_UP_SNOOZE_DAYS = 7;

function isSnoozed(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const until = localStorage.getItem(key);
  return Boolean(until && Date.now() < Number(until));
}

/** AF-rapporten lämnas den 1:a till 14:e och avser föregående månad. */
function inAfWindow(now: Date): boolean {
  return now.getDate() <= 14;
}

function prevMonthLabel(now: Date): string {
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const label = new Intl.DateTimeFormat('sv-SE', { month: 'long' }).format(prev);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface UseNextBestActionResult {
  action: NextBestAction;
  loading: boolean;
  /** Avfärda den visade handlingen; nästa i rankningen tar över. */
  dismiss: () => void;
}

export function useNextBestAction(appSummary: ApplicationsSummary): UseNextBestActionResult {
  const { feature, loading: featuresLoading, dismiss: dismissFeature } = useUnusedFeatures();
  // Bump för att räkna om efter en dismiss (localStorage är inte reaktivt).
  const [, setVersion] = useState(0);

  const action = useMemo<NextBestAction>(() => {
    if (!appSummary.loaded) return null;
    const now = new Date();

    if (appSummary.followUpCount > 0 && !isSnoozed(DISMISS_FOLLOW_UP)) {
      return { kind: 'follow-up', count: appSummary.followUpCount };
    }
    if (inAfWindow(now) && appSummary.prevMonthCount > 0 && !isSnoozed(DISMISS_AF)) {
      return { kind: 'af-report', monthLabel: prevMonthLabel(now), count: appSummary.prevMonthCount };
    }
    if (feature) {
      return { kind: 'feature', feature };
    }
    return null;
  }, [appSummary, feature]);

  const dismiss = useCallback(() => {
    if (!action) return;
    if (action.kind === 'follow-up') {
      localStorage.setItem(
        DISMISS_FOLLOW_UP,
        String(Date.now() + FOLLOW_UP_SNOOZE_DAYS * 24 * 60 * 60 * 1000)
      );
      setVersion((v) => v + 1);
    } else if (action.kind === 'af-report') {
      // Snooza till den 15:e (fönstret stängt), så nästa månads fönster syns igen.
      const now = new Date();
      const endOfWindow = new Date(now.getFullYear(), now.getMonth(), 15);
      localStorage.setItem(DISMISS_AF, String(endOfWindow.getTime()));
      setVersion((v) => v + 1);
    } else {
      dismissFeature(action.feature.slug as FeatureSlug['slug']);
    }
  }, [action, dismissFeature]);

  return {
    action,
    loading: featuresLoading || !appSummary.loaded,
    dismiss,
  };
}
