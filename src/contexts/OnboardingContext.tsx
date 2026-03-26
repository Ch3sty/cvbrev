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
      console.log('[OnboardingContext] 🔄 Fetching onboarding status...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[OnboardingContext] ❌ No user found');
        setIsLoading(false);
        return;
      }

      console.log('[OnboardingContext] 👤 User ID:', user.id);

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
        console.log('[OnboardingContext] Profile not found (PGRST116) - this is OK for new users');
      }

      if (!profile) {
        console.log('[OnboardingContext] ❌ No profile data available');
        setIsLoading(false);
        return;
      }

      console.log('[OnboardingContext] ✅ Profile found successfully');
      console.log('[OnboardingContext] 📋 Profile onboarding_steps_completed:', profile.onboarding_steps_completed);

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

      console.log('[OnboardingContext] 📊 Feature table counts:', {
        cvCount,
        letterCount,
        analysisCount,
        linkedinCount,
        templateDownloadCount,
        jobMatchCount
      });

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

      // The 3 required steps for onboarding completion
      const REQUIRED_STEPS = ['upload_cv', 'create_letter', 'analyze_cv'];
      const requiredCompleted = REQUIRED_STEPS.filter(s => validatedSteps.includes(s)).length;

      console.log('[OnboardingContext] Validated steps:', validatedSteps);
      console.log('[OnboardingContext] Required completed:', requiredCompleted, '/ 3');

      // Update state with validated steps
      setCompletedSteps(validatedSteps);
      setOnboardingCompleted(requiredCompleted >= 3);
      setRewardClaimed(profile.onboarding_reward_claimed || false);
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
      const REQUIRED_STEPS = ['upload_cv', 'create_letter', 'analyze_cv'];
      const requiredCompleted = REQUIRED_STEPS.filter(s => newSteps.includes(s)).length;
      if (requiredCompleted >= 3) {
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
