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

// Components
import CVAnalysisWizard from './components/CVAnalysisWizard';

// Utility Functions
import { logUserActivity } from '@/lib/activity-logger';

// Constants
const API_ANALYZE_ROUTE = '/api/cv/analyze';

export default function CVAnalysisPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const {
    profile, subscriptionTier, remainingWeeklyAnalyses,
    updateRemainingAnalyses, updateNextAnalysisResetDate,
    loading: profileLoading
  } = useProfile();

  const initialLoadRef = useRef(false);
  const authCheckedRef = useRef(false);

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

  // Check quota
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedLimit = isFreeTier && remainingWeeklyAnalyses !== null && remainingWeeklyAnalyses <= 0;

  if (hasReachedLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Veckogräns nådd</h2>
          <p className="text-gray-600 mb-6">Du har använt alla dina CV-analyser denna vecka.</p>
          <button
            onClick={() => router.push('/profile?tab=subscription')}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg"
          >
            Uppgradera till Premium
          </button>
        </div>
      </div>
    );
  }

  // Show wizard
  return (
    <CVAnalysisWizard
      cvs={cvs}
      onAnalysisStart={handleAnalysisStart}
      onPollJob={pollForJobResult}
      onComplete={handleWizardComplete}
    />
  );
}
