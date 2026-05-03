'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export interface FeatureSlug {
  slug:
    | 'cv-analys'
    | 'jobbmatchning'
    | 'jobbcoachen'
    | 'linkedin-optimizer'
    | 'tester'
    | 'rewards';
}

export interface FeatureSpotlightItem {
  slug: FeatureSlug['slug'];
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}

/**
 * Spotlight-content per feature. Visas i FeatureSpotlight-cardet i sidebaren
 * när användaren INTE har provat tjänsten.
 *
 * Prioritetsordning - första oprovade som matchar visas först. Vi prioriterar
 * tjänster som ger användaren mest nytta först.
 */
const FEATURES: FeatureSpotlightItem[] = [
  {
    slug: 'jobbmatchning',
    href: '/dashboard/jobbmatchning',
    eyebrow: 'Prova nu',
    title: 'Hitta jobb som matchar dig',
    description:
      'Vi matchar din profil mot tusentals annonser. Du får jobb som faktiskt passar dig.',
    cta: 'Hitta matchningar',
  },
  {
    slug: 'cv-analys',
    href: '/dashboard/cv-analys',
    eyebrow: 'Prova nu',
    title: 'Förbättra ditt CV',
    description:
      'Vi pekar ut vad som saknas och ger konkreta förbättringsförslag på sekunder.',
    cta: 'Analysera CV',
  },
  {
    slug: 'linkedin-optimizer',
    href: '/dashboard/linkedin-optimizer',
    eyebrow: 'Prova nu',
    title: 'Optimera din LinkedIn',
    description:
      'Vi skriver en headline och About-text som syns i sökningar och fångar rekryterare.',
    cta: 'Optimera nu',
  },
  {
    slug: 'jobbcoachen',
    href: '/dashboard/jobbcoachen',
    eyebrow: 'Prova nu',
    title: 'Fråga jobbcoachen',
    description:
      'Få personliga råd om karriär, intervjuer och löneförhandling — när du behöver det.',
    cta: 'Starta samtal',
  },
  {
    slug: 'tester',
    href: '/dashboard/tester',
    eyebrow: 'Prova nu',
    title: 'Träna på rekryteringstester',
    description:
      'Logiktest, verbal förmåga, numerisk analys — allt du möter på riktiga tester.',
    cta: 'Börja träna',
  },
  {
    slug: 'rewards',
    href: '/dashboard/rewards',
    eyebrow: 'Prova nu',
    title: 'Samla belöningar',
    description:
      'Tjäna XP genom att använda verktygen. Lås upp premiumdagar och badges.',
    cta: 'Se belöningar',
  },
];

// Activity-typer som indikerar att användaren har provat respektive feature
const FEATURE_ACTIVITY_TYPES: Record<FeatureSlug['slug'], string[]> = {
  'cv-analys': ['cv_analysis_completed', 'cv_analysis_started', 'cv_improvement_started'],
  jobbmatchning: ['jobs_searched'],
  jobbcoachen: ['feature_explored', 'cta_clicked'],
  'linkedin-optimizer': ['linkedin_optimization_started', 'linkedin_optimization_completed'],
  tester: ['feature_explored'],
  rewards: ['feature_explored'],
};

const DISMISS_PREFIX = 'feature-spotlight-dismissed-';

interface UseUnusedFeaturesResult {
  feature: FeatureSpotlightItem | null;
  loading: boolean;
  dismiss: (slug: FeatureSlug['slug']) => void;
}

export function useUnusedFeatures(): UseUnusedFeaturesResult {
  const [feature, setFeature] = useState<FeatureSpotlightItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function findUnusedFeature() {
      try {
        const supabase = getSupabaseClient();
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        if (!userId) {
          if (!cancelled) {
            setFeature(FEATURES[0]); // fallback
            setLoading(false);
          }
          return;
        }

        // Hämta alla activity-typer användaren har
        const { data: activities } = await supabase
          .from('user_activities')
          .select('activity_type, metadata')
          .eq('user_id', userId);

        const usedTypes = new Set<string>();
        const usedTargets = new Set<string>();
        if (activities) {
          for (const a of activities) {
            if (a.activity_type) usedTypes.add(a.activity_type);
            // Försök läsa target ur metadata (jsonb) — fallback om det saknas
            const meta = (a as { metadata?: Record<string, unknown> }).metadata;
            const target =
              meta && typeof meta === 'object'
                ? (meta.target ?? meta.target_id ?? meta.feature)
                : undefined;
            if (typeof target === 'string') usedTargets.add(target);
          }
        }

        // Hitta första feature som inte är dismissed och inte använd
        const dismissed = (slug: string) => {
          if (typeof window === 'undefined') return false;
          return localStorage.getItem(DISMISS_PREFIX + slug) === 'true';
        };

        const isUsed = (slug: FeatureSlug['slug']): boolean => {
          // För jobbcoachen/tester/rewards kollar vi om target i metadata matchar route
          if (slug === 'jobbcoachen') return usedTargets.has('jobbcoachen');
          if (slug === 'tester') return usedTargets.has('tester');
          if (slug === 'rewards') return usedTargets.has('rewards');

          const activityTypes = FEATURE_ACTIVITY_TYPES[slug];
          return activityTypes.some((t) => usedTypes.has(t));
        };

        const next = FEATURES.find((f) => !dismissed(f.slug) && !isUsed(f.slug));

        if (!cancelled) {
          setFeature(next ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.warn('useUnusedFeatures: failed to query', error);
        if (!cancelled) {
          setFeature(FEATURES[0]); // fallback
          setLoading(false);
        }
      }
    }

    findUnusedFeature();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = (slug: FeatureSlug['slug']) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_PREFIX + slug, 'true');
    }
    // Visa nästa oprovade feature
    const dismissed = (s: string) => localStorage.getItem(DISMISS_PREFIX + s) === 'true';
    const next = FEATURES.find((f) => f.slug !== slug && !dismissed(f.slug));
    setFeature(next ?? null);
  };

  return { feature, loading, dismiss };
}
