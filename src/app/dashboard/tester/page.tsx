'use client';

import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import { useAllTestStats, type TestSlug } from '@/hooks/use-all-test-stats';
import { usePersonalityTestStats } from '@/hooks/use-personality-test-stats';
import TesterHubHero from './components/TesterHubHero';
import TestStatsCard from './components/TestStatsCard';
import EmptyTestsCallout from './components/EmptyTestsCallout';
import TestCard, {
  type TestCardVariant,
  type TestCategoryLabel,
  type TestLevelLabel,
} from './components/TestCard';
import PersonalityTestCard from './components/PersonalityTestCard';

interface TestDef {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
}

interface PersonalityDef {
  slug: 'personlighet-grund' | 'personlighet-avancerad';
  variant: 'personality-grund' | 'personality-avancerad';
  title: string;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
}

const COGNITIVE_TESTS: TestDef[] = [
  {
    slug: 'matrislogik-grund',
    variant: 'matrix-grund',
    title: 'Matrislogik',
    categoryLabel: 'Logik',
    levelLabel: 'Grund',
    questionCount: 15,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'matrislogik-avancerad',
    variant: 'matrix-avancerad',
    title: 'Matrislogik',
    categoryLabel: 'Logik',
    levelLabel: 'Avancerad',
    questionCount: 15,
    timeLabel: '25',
    isPremiumLocked: true,
  },
  {
    slug: 'matrislogik-expert',
    variant: 'matrix-expert',
    title: 'Matrislogik',
    categoryLabel: 'Logik',
    levelLabel: 'Expert',
    questionCount: 15,
    timeLabel: '30',
    isPremiumLocked: true,
  },
  {
    slug: 'verbal-resonemang',
    variant: 'verbal-v1',
    title: 'Verbalt resonemang',
    categoryLabel: 'Språk',
    levelLabel: 'Grund',
    questionCount: 15,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'verbal-resonemang-v2',
    variant: 'verbal-v2',
    title: 'Verbalt resonemang',
    categoryLabel: 'Språk',
    levelLabel: 'Avancerad',
    questionCount: 15,
    timeLabel: '25',
    isPremiumLocked: true,
  },
  {
    slug: 'numeriskt-test',
    variant: 'numerical-v1',
    title: 'Numeriskt test',
    categoryLabel: 'Siffror',
    levelLabel: 'Grund',
    questionCount: 15,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'numeriskt-test-v2',
    variant: 'numerical-v2',
    title: 'Numeriskt test',
    categoryLabel: 'Siffror',
    levelLabel: 'Avancerad',
    questionCount: 15,
    timeLabel: '25',
    isPremiumLocked: true,
  },
];

const PERSONALITY_TESTS: PersonalityDef[] = [
  {
    slug: 'personlighet-grund',
    variant: 'personality-grund',
    title: 'Personlighetsprofil',
    levelLabel: 'Grund',
    questionCount: 50,
    timeLabel: '10',
    isPremiumLocked: false,
  },
  {
    slug: 'personlighet-avancerad',
    variant: 'personality-avancerad',
    title: 'Personlighetsprofil',
    levelLabel: 'Avancerad',
    questionCount: 120,
    timeLabel: '25',
    isPremiumLocked: true,
  },
];

export default function TesterHubPage() {
  const { subscriptionTier, loading: profileLoading } = useProfile();
  const { perTest, aggregate, isLoading: statsLoading } = useAllTestStats();
  const personalityStats = usePersonalityTestStats();

  const isPremium = subscriptionTier === 'premium';

  // Hitta vilket test som har högst best-percentage (för crown)
  const bestTest = Object.entries(perTest)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].bestPercentage - a[1].bestPercentage)[0]?.[0] as
    | TestSlug
    | undefined;

  // Loading state
  if (profileLoading || statsLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-4xl">
        <div className="space-y-5 sm:space-y-6">
          <div className="rounded-3xl bg-orange-50/40 h-48 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/40 h-24 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/40 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-4xl">
      <div className="space-y-5 sm:space-y-6 lg:space-y-7">
        <TesterHubHero
          totalCompleted={aggregate.totalCompleted}
          averageBestPercentage={aggregate.averageBestPercentage}
        />

        {aggregate.hasAnyData || personalityStats.grund.hasProfile || personalityStats.avancerad.hasProfile ? (
          <TestStatsCard
            completedTestCount={aggregate.completedTestCount}
            totalTestCount={8}
            averageBestPercentage={aggregate.averageBestPercentage}
            totalTimeSeconds={aggregate.totalTimeSeconds}
          />
        ) : (
          <EmptyTestsCallout />
        )}

        {/* En enda sektion: alla test i ett rutnät */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="mb-4 sm:mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
              Alla tester
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Träna och förbered dig
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Sex kognitiva test som mäter logik, språk och siffror. Plus personlighetsprofiler för intervjuförberedelse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {COGNITIVE_TESTS.map((test, i) => (
              <TestCard
                key={test.slug}
                {...test}
                isUserPremium={isPremium}
                stats={perTest[test.slug]}
                isBestOverall={bestTest === test.slug}
                isRecommended={!aggregate.hasAnyData && test.slug === 'matrislogik-grund'}
                index={i}
              />
            ))}
            {PERSONALITY_TESTS.map((test, i) => (
              <PersonalityTestCard
                key={test.slug}
                {...test}
                isUserPremium={isPremium}
                stats={
                  test.slug === 'personlighet-grund'
                    ? personalityStats.grund
                    : personalityStats.avancerad
                }
                index={COGNITIVE_TESTS.length + i}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
