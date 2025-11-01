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

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_steps_completed, onboarding_completed, onboarding_reward_claimed')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCompletedSteps(profile.onboarding_steps_completed || []);
        setOnboardingCompleted(profile.onboarding_completed || false);
        setRewardClaimed(profile.onboarding_reward_claimed || false);
      }
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
            // Update state with new data from realtime event
            const newData = payload.new as any;
            if (newData.onboarding_steps_completed !== undefined) {
              setCompletedSteps(newData.onboarding_steps_completed || []);
            }
            if (newData.onboarding_completed !== undefined) {
              setOnboardingCompleted(newData.onboarding_completed || false);
            }
            if (newData.onboarding_reward_claimed !== undefined) {
              setRewardClaimed(newData.onboarding_reward_claimed || false);
            }
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
