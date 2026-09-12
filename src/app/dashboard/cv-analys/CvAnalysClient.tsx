'use client';

/**
 * CV-analysens interaktiva del.
 *
 * All data kommer färdig som props från page.tsx, som läste den på servern.
 * Ingen spinner, ingen hämtningskedja: första HTML innehåller introt med rätt
 * kvotsiffra, eller spärrvyn om kvoten faktiskt är slut.
 *
 * KVOTEN OCH BETALVÄGGEN ÄR OFÖRÄNDRADE. Serverns 429 från
 * POST /api/cv/analyze styr fortfarande allt som betyder något: den bär
 * limitReached och exakt återkomsttid, och den svarar likadant vad klienten än
 * tror. Siffran som visas kommer nu från servern i stället för från en
 * klientkedja, vilket bara gör den mer rätt. De tre gratisfynden i analysen
 * ligger kvar i wizarden och i analyssvaret och rörs inte här.
 */

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import CVAnalysisIntro from './components/CVAnalysisIntro';
import OnboardingNextStep from '@/components/dashboard/OnboardingNextStep';
import PaywallCard from '@/components/paywall/PaywallCard';

import { logUserActivity } from '@/lib/activity-logger';
import { lockedCvIds, type CvAnalysData } from './getCvAnalysData';

/**
 * Wizarden syns aldrig i första vyn: sidan öppnar alltid på introt, och
 * wizarden monteras först när användaren klickat igång analysen. Den drar in
 * sju steg, jämförelsevyer och mallväljaren, så den laddas då i stället för i
 * sidans första paket. Höjden reserveras så inget hoppar när den landar.
 */
const CVAnalysisWizard = dynamic(() => import('./components/CVAnalysisWizard'), {
  loading: () => <div className="min-h-[560px]" aria-hidden="true" />,
});

const API_ANALYZE_ROUTE = '/api/cv/analyze';

export default function CvAnalysClient({ data }: { data: CvAnalysData }) {
  const router = useRouter();

  const [showIntro, setShowIntro] = useState(true);

  /* Kvotläget. Startvärdena är serverns, och uppdateras av analyssvaret precis
     som förut: 429 med limitReached låser vyn med exakt återkomsttid, ett
     lyckat svar räknar ner kvarvarande. */
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(
    data.remainingAnalyses
  );
  const [quotaLockResetAt, setQuotaLockResetAt] = useState<string | null>(
    data.nextResetAt
  );

  const locked = useMemo(
    () => lockedCvIds(data.cvs, data.isPremium),
    [data.cvs, data.isPremium]
  );

  // Poll for background job result
  const pollForJobResult = useCallback(async (jobId: string): Promise<any> => {
    const MAX_POLLS = 60;
    const POLL_INTERVAL_MS = 2000;

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(`/api/cv/jobs/${jobId}`);
      const jobData = await pollResponse.json();

      if (!pollResponse.ok) {
        throw new Error(jobData.message || 'Failed to fetch job status');
      }

      if (jobData.status === 'completed') {
        return {
          id: jobData.id,
          display_name: jobData.display_name,
          ...jobData.result,
        };
      } else if (jobData.status === 'failed') {
        throw new Error(jobData.error || 'Analysis failed');
      }
    }

    throw new Error('Analysen tog för lång tid. Försök igen eller kontakta support.');
  }, []);

  const handleAnalysisStart = useCallback(
    async (selectedCV: string) => {
      if (!selectedCV) {
        throw new Error('Inget CV valt');
      }

      const response = await fetch(API_ANALYZE_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: selectedCV }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Kvoten slut (1 analys per rullande 72h for gratisanvandare):
        // visa spärrvyn med exakt återkomsttid i stället för ett alert.
        if (response.status === 429 && result.limitReached) {
          const resetAt = result.nextResetAt || result.nextResetDate;
          if (resetAt) setQuotaLockResetAt(resetAt);
          setRemainingAnalyses(0);
          const quotaError = new Error(
            result.message || 'Du har använt din CV-analys.'
          ) as Error & { quotaExceeded?: boolean };
          quotaError.quotaExceeded = true;
          throw quotaError;
        }
        throw new Error(result.message || 'Kunde inte starta analys');
      }

      if (result.remainingAnalyses !== undefined) {
        setRemainingAnalyses(result.remainingAnalyses);
      }

      if (data.userId) {
        const cvFileName =
          data.cvs.find((cv) => cv.id === selectedCV)?.file_name || 'Unknown CV';
        await logUserActivity(
          data.userId,
          'cv_analysis_started',
          `Started CV analysis for: ${cvFileName}`,
          { cv_id: selectedCV, job_id: result.jobId }
        );
      }

      return result.jobId;
    },
    [data.cvs, data.userId]
  );

  const handleWizardComplete = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // Spärrvyn. Samma villkor som förut: gratisnivå och antingen ett 429 från
  // servern eller en räknare som gått i noll.
  const hasReachedLimit =
    !data.isPremium &&
    (quotaLockResetAt !== null ||
      (remainingAnalyses !== null && remainingAnalyses <= 0));

  if (hasReachedLimit) {
    return (
      <div className="min-h-[calc(100dvh-200px)] flex items-center justify-center px-4 py-12">
        <PaywallCard
          variant="kvot"
          quota={{
            feature: 'cv_analysis',
            nextResetAt: quotaLockResetAt ?? new Date().toISOString(),
          }}
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (showIntro) {
    return (
      <CVAnalysisIntro
        onStartAnalysis={() => setShowIntro(false)}
        remainingAnalyses={remainingAnalyses}
        isPremium={data.isPremium}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Onboarding-prompt: pekar mot belöning om analys nyss körts */}
      <OnboardingNextStep stepCompleted="analyze_cv" />

      <CVAnalysisWizard
        cvs={data.cvs}
        lockedCvIds={locked}
        onAnalysisStart={handleAnalysisStart}
        onPollJob={pollForJobResult}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
