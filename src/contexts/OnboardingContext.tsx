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
        { count: applicationCount }
      ] = await Promise.all([
        supabase.from('user_cvs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
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

      // Step 5: Apply to job
      if (completedStepsArray.includes('apply_job') || (applicationCount || 0) > 0) {
        validatedSteps.push('apply_job');
      }

      // Step 6: Complete profile (experience OR education)
      const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;
      const hasEducation = Array.isArray(profile.education) && profile.education.length > 0;
      if (completedStepsArray.includes('complete_profile') || hasExperience || hasEducation) {
        validatedSteps.push('complete_profile');
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

    // Subscribe to profile changes for real-time updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      const channel = supabase
        .channel('onboarding_profile_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            // When profile updates, refetch with full hybrid validation
            // This ensures we always have accurate counts from all feature tables
            fetchOnboardingStatus();
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      channelPromise.then((channel) => {
        if (channel) {
          supabase.removeChannel(channel);
        }
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
