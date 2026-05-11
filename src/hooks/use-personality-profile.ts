'use client';

import { useEffect, useState } from 'react';
import type {
  BigFiveScores,
  FacetScores,
  PersonalityTestType,
} from '@/lib/personalityTest/types';

export interface UserPersonalityProfile {
  userId: string;
  sourceSessionId: string | null;
  sourceTestType: PersonalityTestType;
  scores: BigFiveScores;
  facetScores: FacetScores | null;
  aiAnalysis: Record<string, unknown> | null;
  computedAt: string;
  updatedAt: string;
}

interface UsePersonalityProfileReturn {
  profile: UserPersonalityProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Hook som läser användarens aktiva personlighetsprofil. Tänkt att användas
// av CV-byggaren, personligt brev-verktyget och AI-coachen för att anpassa
// innehåll efter användarens profil.
export function usePersonalityProfile(): UsePersonalityProfileReturn {
  const [profile, setProfile] = useState<UserPersonalityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/personalityTest/profile');
      if (!res.ok) {
        setProfile(null);
        return;
      }
      const data = await res.json();
      if (!data.profile) {
        setProfile(null);
        return;
      }
      const row = data.profile;
      setProfile({
        userId: row.user_id,
        sourceSessionId: row.source_session_id,
        sourceTestType: row.source_test_type,
        scores: {
          openness: row.openness,
          conscientiousness: row.conscientiousness,
          extraversion: row.extraversion,
          agreeableness: row.agreeableness,
          neuroticism: row.neuroticism,
        },
        facetScores: row.facet_scores ?? null,
        aiAnalysis: row.ai_analysis ?? null,
        computedAt: row.computed_at,
        updatedAt: row.updated_at,
      });
    } catch (e) {
      console.error('Failed to load personality profile:', e);
      setError('Kunde inte hämta profilen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { profile, isLoading, error, refresh: load };
}
