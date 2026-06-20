'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import { useAllTestStats, type TestSlug } from '@/hooks/use-all-test-stats';
import { usePersonalityTestStats } from '@/hooks/use-personality-test-stats';
import TesterHubHero from './components/TesterHubHero';
import TestStatsCard from './components/TestStatsCard';
import EmptyTestsCallout from './components/EmptyTestsCallout';
import TesterTabs, { type TesterTab } from './components/TesterTabs';
import TestGroup from './components/TestGroup';
import DevelopmentView from './components/DevelopmentView';
import { TEST_GROUPS } from './components/testCatalog';

export default function TesterHubPage() {
  const { subscriptionTier, loading: profileLoading } = useProfile();
  const { perTest, aggregate, isLoading: statsLoading } = useAllTestStats();
  const personalityStats = usePersonalityTestStats();

  const [tab, setTab] = useState<TesterTab>('tester');

  const isPremium = subscriptionTier === 'premium';

  // Hitta vilket test som har högst best-percentage (för crown)
  const bestTest = Object.entries(perTest)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].bestPercentage - a[1].bestPercentage)[0]?.[0] as
    | TestSlug
    | undefined;

  const hasAnyData =
    aggregate.hasAnyData ||
    personalityStats.grund.hasProfile ||
    personalityStats.avancerad.hasProfile;

  // Räknaren på utvecklingsfliken speglar de kognitiva försöken (personlighet
  // bor på Tester-fliken, inte i utvecklingsvyn).
  const completedCount = aggregate.totalCompleted;

  // Loading state
  if (profileLoading || statsLoading) {
    return (
      <div className="mx-auto py-4 sm:py-6 max-w-6xl">
        <div className="space-y-5 sm:space-y-6">
          <div className="rounded-3xl bg-orange-50/40 h-48 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/40 h-24 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/40 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 sm:py-6 max-w-6xl">
      <div className="space-y-5 sm:space-y-6 lg:space-y-7">
        <TesterHubHero
          totalCompleted={aggregate.totalCompleted}
          averageBestPercentage={aggregate.averageBestPercentage}
        />

        <TesterTabs active={tab} onChange={setTab} completedCount={completedCount} />

        {tab === 'tester' ? (
          <motion.div
            key="tester"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 sm:space-y-6 lg:space-y-7"
          >
            {hasAnyData ? (
              <TestStatsCard
                completedTestCount={aggregate.completedTestCount}
                totalTestCount={9}
                averageBestPercentage={aggregate.averageBestPercentage}
                totalTimeSeconds={aggregate.totalTimeSeconds}
              />
            ) : (
              <EmptyTestsCallout />
            )}

            <div className="space-y-6 sm:space-y-7">
              {TEST_GROUPS.map((group, gi) => {
                const startIndex = TEST_GROUPS.slice(0, gi).reduce(
                  (acc, g) => acc + g.cognitive.length + g.personality.length,
                  0
                );
                return (
                  <TestGroup
                    key={group.key}
                    group={group}
                    startIndex={startIndex}
                    isPremium={isPremium}
                    perTest={perTest}
                    personality={personalityStats}
                    bestTest={bestTest}
                    recommendSlug={
                      !hasAnyData && group.key === 'logik'
                        ? 'matrislogik-grund'
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </motion.div>
        ) : (
          <DevelopmentView perTest={perTest} />
        )}
      </div>
    </div>
  );
}
