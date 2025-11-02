'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface OnboardingContextType {
  completedSteps: string[];
  completedCount: number;
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

  const fetchOnboardingStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_steps_completed, onboarding_completed, onboarding_reward_claimed, experience, education')
        .eq('id', user.id)
        .single();

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
        supabase.from('user_cvs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('formatted_cv_downloads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('job_matchings_cache').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
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

      // Update state with validated steps
      setCompletedSteps(validatedSteps);
      setOnboardingCompleted(validatedSteps.length >= 6);
      setRewardClaimed(profile.onboarding_reward_claimed || false);
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
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

      // Subscribe to user_cvs table
      const cvChannel = supabase
        .channel('onboarding_cv_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_cvs',
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

      return [profileChannel, cvChannel, letterChannel, downloadChannel, matchChannel];
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
      if (newSteps.length >= 6) {
        setOnboardingCompleted(true);
      }
      return newSteps;
    });
  }, []);

  // Mark reward as claimed (optimistic update)
  const markRewardClaimed = useCallback(() => {
    setRewardClaimed(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        completedSteps,
        completedCount: completedSteps.length,
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
