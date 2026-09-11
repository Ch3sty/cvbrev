'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useNotification } from '@/context/notificationcontext';
import {
  REQUIRED_STEPS,
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

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();
  const { success } = useNotification();

  // Auto-claim: en gång per session, bara för konton skapade efter utrullningen.
  const autoClaimAttempted = useRef(false);
  const autoClaimEligible = useRef(false);

  const fetchOnboardingStatus = useCallback(async () => {
    try {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }


      // Fetch profile data with proper error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Handle profile fetch errors
      if (profileError) {
        console.error('[OnboardingContext] ❌ Profile query error:', profileError);
        console.error('[OnboardingContext] Error code:', profileError.code);
        console.error('[OnboardingContext] Error message:', profileError.message);

        // Only return if it's a real error, not just "no rows found"
        if (profileError.code !== 'PGRST116') {
          console.error('[OnboardingContext] Critical database error - aborting');
          setIsLoading(false);
          return;
        }

        // If PGRST116 (no rows), profile doesn't exist yet
      }

      if (!profile) {
        setIsLoading(false);
        return;
      }


      // Fetch actual counts from feature tables for hybrid validation
      const [
        { count: cvCount },
        { count: letterCount },
        { count: analysisCount },
        { count: linkedinCount },
        { count: templateDownloadCount },
        { count: jobMatchCount }
      ] = await Promise.all([
        supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('formatted_cv_downloads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('job_matchings_cache').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);


      // Hybrid validation: Check both onboarding_steps_completed array AND actual feature usage
      const completedStepsArray = profile.onboarding_steps_completed || [];
      const validatedSteps: string[] = [];

      // Step 1: Upload CV
      if (completedStepsArray.includes('upload_cv') || (cvCount || 0) > 0) {
        validatedSteps.push('upload_cv');
      }

      // Step 2: Create letter
      if (completedStepsArray.includes('create_letter') || (letterCount || 0) > 0) {
        validatedSteps.push('create_letter');
      }

      // Step 3: Analyze CV
      if (completedStepsArray.includes('analyze_cv') || (analysisCount || 0) > 0) {
        validatedSteps.push('analyze_cv');
      }

      // Step 4: Optimize LinkedIn
      if (completedStepsArray.includes('optimize_linkedin') || (linkedinCount || 0) > 0) {
        validatedSteps.push('optimize_linkedin');
      }

      // Step 5: Download CV template
      if (completedStepsArray.includes('download_cv_template') || (templateDownloadCount || 0) > 0) {
        validatedSteps.push('download_cv_template');
      }

      // Step 6: Match jobs
      if (completedStepsArray.includes('match_jobs') || (jobMatchCount || 0) > 0) {
        validatedSteps.push('match_jobs');
      }

      // Ett enda obligatoriskt steg sedan B5: CV uppladdat.
      const completed = isOnboardingComplete(validatedSteps);

      setCompletedSteps(validatedSteps);
      setOnboardingCompleted(completed);
      setRewardClaimed(profile.onboarding_reward_claimed || false);
      autoClaimEligible.current = isEligibleForAutoClaim(profile.created_at);
    } catch (error) {
      console.error('[OnboardingContext] ❌ CRITICAL ERROR in fetchOnboardingStatus:', error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error('[OnboardingContext] Error name:', error.name);
        console.error('[OnboardingContext] Error message:', error.message);
        console.error('[OnboardingContext] Error stack:', error.stack);
      } else {
        console.error('[OnboardingContext] Error details:', JSON.stringify(error, null, 2));
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOnboardingStatus();

    // Subscribe to profile and feature table changes for real-time updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      // Subscribe to profiles table
      const profileChannel = supabase
        .channel('onboarding_profile_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to cv_texts table (matchar tabellen som faktiskt querryas)
      const cvChannel = supabase
        .channel('onboarding_cv_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cv_texts',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to letters table
      const letterChannel = supabase
        .channel('onboarding_letter_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'letters',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to cv_analysis_jobs table
      const analysisChannel = supabase
        .channel('onboarding_analysis_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cv_analysis_jobs',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to linkedin_optimizations table
      const linkedinChannel = supabase
        .channel('onboarding_linkedin_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'linkedin_optimizations',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to formatted_cv_downloads table
      const downloadChannel = supabase
        .channel('onboarding_download_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'formatted_cv_downloads',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      // Subscribe to job_matchings_cache table
      const matchChannel = supabase
        .channel('onboarding_match_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_matchings_cache',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchOnboardingStatus()
        )
        .subscribe();

      return [profileChannel, cvChannel, letterChannel, analysisChannel, linkedinChannel, downloadChannel, matchChannel];
    };

    const channelsPromise = setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      channelsPromise.then((channels) => {
        channels.forEach(channel => {
          supabase.removeChannel(channel);
        });
      });
    };
  }, [supabase, fetchOnboardingStatus]);

  // Optimistic update when step is completed
  const markStepComplete = useCallback((stepName: string) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepName)) return prev;
      const newSteps = [...prev, stepName];
      if (isOnboardingComplete(newSteps)) {
        setOnboardingCompleted(true);
      }
      return newSteps;
    });
  }, []);

  // Mark reward as claimed (optimistic update)
  const markRewardClaimed = useCallback(() => {
    setRewardClaimed(true);
  }, []);

  // Auto-claim (B5): när det enda steget är klart hämtas belöningen åt
  // användaren. Ref-vakten skyddar mot dubbelanrop när realtime triggar en
  // ny hämtning mitt i, och routen är dessutom idempotent (400 vid dubbel).
  useEffect(() => {
    if (isLoading || rewardClaimed || !onboardingCompleted) return;
    if (!autoClaimEligible.current || autoClaimAttempted.current) return;

    autoClaimAttempted.current = true;

    (async () => {
      try {
        const res = await fetch('/api/onboarding/claim-reward', { method: 'POST' });
        if (!res.ok) {
          // 400 betyder oftast redan hämtad. Synka state och gå vidare.
          if (res.status === 400) setRewardClaimed(true);
          return;
        }
        setRewardClaimed(true);
        success('Din belöning är upplåst');
      } catch (error) {
        console.warn('[OnboardingContext] Auto-claim misslyckades:', error);
      }
    })();
  }, [isLoading, rewardClaimed, onboardingCompleted, success]);

  return (
    <OnboardingContext.Provider
      value={{
        completedSteps,
        completedCount: completedSteps.length,
        requiredCompletedCount: countRequiredCompleted(completedSteps),
        onboardingCompleted,
        rewardClaimed,
        isLoading,
        markStepComplete,
        markRewardClaimed,
        refetch: fetchOnboardingStatus
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
