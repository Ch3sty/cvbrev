// src/hooks/useCvQuota.ts
/**
 * Hook for checking CV quota limits based on subscription tier
 * Free users: 5 CVs
 * Premium users: 50 CVs
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CvQuota {
  cvCount: number;
  maxCvs: number;
  canSave: boolean;
  loading: boolean;
  subscriptionTier: 'free' | 'premium';
  error: string | null;
}

export function useCvQuota(): CvQuota {
  const [cvCount, setCvCount] = useState(0);
  const [maxCvs, setMaxCvs] = useState(5);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkQuota() {
      try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Kunde inte hämta användarinformation');
          setLoading(false);
          return;
        }

        // Get subscription tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue with free tier as fallback
        }

        const tier = profile?.subscription_tier || 'free';
        const max = tier === 'premium' ? 50 : 5;

        setSubscriptionTier(tier);
        setMaxCvs(max);

        // Get current CV count
        const { count, error: countError } = await supabase
          .from('cv_texts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) {
          console.error('Error fetching CV count:', countError);
          setError('Kunde inte hämta CV-antal');
        } else {
          setCvCount(count || 0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in useCvQuota:', err);
        setError('Ett oväntat fel uppstod');
        setLoading(false);
      }
    }

    checkQuota();
  }, []);

  return {
    cvCount,
    maxCvs,
    canSave: cvCount < maxCvs,
    loading,
    subscriptionTier,
    error
  };
}
