/**
 * CV Analysis Page - Premium Wizard Experience
 * Direct wizard integration with fast loading and wow-factor design
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// State Management & Hooks
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { useCvQuota } from '@/hooks/useCvQuota';

// Components
import CVAnalysisWizard from './components/CVAnalysisWizard';
import CVAnalysisIntro from './components/CVAnalysisIntro';
import OnboardingNextStep from '@/components/dashboard/OnboardingNextStep';
import QuotaLockCard from '@/components/quota/QuotaLockCard';

// Utility Functions
import { logUserActivity } from '@/lib/activity-logger';

// Constants
const API_ANALYZE_ROUTE = '/api/cv/analyze';

export default function CVAnalysisPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const {
    profile, subscriptionTier, remainingWeeklyAnalyses, nextAnalysisResetDate,
    updateRemainingAnalyses, updateNextAnalysisResetDate,
    refreshProfile,
    loading: profileLoading
  } = useProfile();
  const { cvCount, loading: cvQuotaLoading } = useCvQuota();

  const initialLoadRef = useRef(false);
  const authCheckedRef = useRef(false);
  const refreshedOnMountRef = useRef(false);
  const [showIntro, setShowIntro] = useState(true);
  // Satts nar servern svarar 429 (kvot slut) med exakt tid da kvoten oppnar igen
  const [quotaLockResetAt, setQuotaLockResetAt] = useState<string | null>(null);

  // Refetch profile vid mount sa stale state (t.ex. fran tidigare misslyckad
  // analys eller efter kvot-reset i en annan flik) inte felaktigt blockerar
  // anvandaren med en spärrvy.
  useEffect(() => {
    if (!refreshedOnMountRef.current && !profileLoading && profile) {
      refreshedOnMountRef.current = true;
      refreshProfile();
    }
  }, [profile, profileLoading, refreshProfile]);

  // Hård gating: utan CV → tillbaka till CV-uppladdning
  useEffect(() => {
    if (!cvQuotaLoading && cvCount === 0) {
      router.push('/dashboard/profil/cv?reason=cv-required');
    }
  }, [cvCount, cvQuotaLoading, router]);

  // Authentication Check
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        router.push('/login');
      }
    }
  }, [profile, profileLoading, router]);

  // Fetch CVs AFTER profile is loaded (avoid "Ej autentiserad" error)
  useEffect(() => {
    if (!initialLoadRef.current && profile && !profileLoading) {
      initialLoadRef.current = true;
      fetchCVs();
    }
  }, [profile, profileLoading, fetchCVs]);

  // Poll for background job result
  const pollForJobResult = useCallback(async (jobId: string): Promise<any> => {
    const MAX_POLLS = 60;
    const POLL_INTERVAL_MS = 2000;

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(`/api/cv/jobs/${jobId}`);
      const jobData = await pollResponse.json();

      if (!pollResponse.ok) {
        throw new Error(jobData.message || 'Failed to fetch job status');
      }

      if (jobData.status === 'completed') {
        return {
          id: jobData.id,
          display_name: jobData.display_name,
          ...jobData.result
        };
      } else if (jobData.status === 'failed') {
        throw new Error(jobData.error || 'Analysis failed');
      }
    }

    throw new Error('Analysen tog för lång tid. Försök igen eller kontakta support.');
  }, []);

  const handleAnalysisStart = useCallback(async (selectedCV: string) => {
    if (!selectedCV) {
      throw new Error('Inget CV valt');
    }

    try {
      const response = await fetch(API_ANALYZE_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: selectedCV })
      });

      const result = await response.json();

      if (!response.ok) {
        // Kvoten slut (1 analys per rullande 72h for gratisanvandare):
        // visa spärrvyn med exakt återkomsttid i stället för ett alert.
        if (response.status === 429 && result.limitReached) {
          const resetAt = result.nextResetAt || result.nextResetDate;
          if (resetAt) {
            setQuotaLockResetAt(resetAt);
            updateNextAnalysisResetDate(new Date(resetAt));
          }
          updateRemainingAnalyses(0);
          const quotaError = new Error(
            result.message || 'Du har använt din CV-analys.'
          ) as Error & { quotaExceeded?: boolean };
          quotaError.quotaExceeded = true;
          throw quotaError;
        }
        throw new Error(result.message || 'Kunde inte starta analys');
      }

      if (result.remainingAnalyses !== undefined) {
        updateRemainingAnalyses(result.remainingAnalyses);
      }
      if (result.nextResetDate) {
        updateNextAnalysisResetDate(new Date(result.nextResetDate));
      }

      if (profile?.id) {
        const cvFileName = cvs?.find(cv => cv.id === selectedCV)?.file_name || 'Unknown CV';
        await logUserActivity(
          profile.id,
          'cv_analysis_started',
          `Started CV analysis for: ${cvFileName}`,
          { cv_id: selectedCV, job_id: result.jobId }
        );
      }

      return result.jobId;
    } catch (error: any) {
      throw error;
    }
  }, [updateRemainingAnalyses, updateNextAnalysisResetDate, profile, cvs]);

  const handleWizardComplete = useCallback(() => {
    // Navigate back or refresh
    router.push('/dashboard');
  }, [router]);

  // Show loading state
  if (profileLoading || !profile || cvsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check quota (serverns 429 via quotaLockResetAt, annars profilens räknare)
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedLimit =
    isFreeTier &&
    (quotaLockResetAt !== null ||
      (remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0));

  if (hasReachedLimit) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <QuotaLockCard
          feature="cv_analysis"
          title="Din CV-analys är använd"
          description="Som gratisanvändare analyserar du ett CV var tredje dygn."
          nextResetAt={
            quotaLockResetAt ??
            nextAnalysisResetDate?.toISOString() ??
            new Date().toISOString()
          }
          className="max-w-md w-full"
        />
      </div>
    );
  }

  // Show intro or wizard
  if (showIntro) {
    return (
      <CVAnalysisIntro
        onStartAnalysis={() => setShowIntro(false)}
        remainingAnalyses={remainingWeeklyAnalyses}
        isPremium={subscriptionTier === 'premium'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Onboarding-prompt: pekar mot belogning om analys nyss korts */}
      <OnboardingNextStep stepCompleted="analyze_cv" />

      <CVAnalysisWizard
        cvs={cvs}
        onAnalysisStart={handleAnalysisStart}
        onPollJob={pollForJobResult}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
