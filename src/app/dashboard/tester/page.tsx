'use client';

/**
 * Hubben för rekryteringstester.
 *
 * Sidhuvud enligt sidmallen i stället för TesterHubHero (avsnitt 5, "Tester").
 * Korten öppnar alltid testet, aldrig prenumerationssidan (våg 1 punkt 6).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import { useProfile } from '@/hooks/use-profile';
import { useAllTestStats, type TestSlug } from '@/hooks/use-all-test-stats';
import { usePersonalityTestStats } from '@/hooks/use-personality-test-stats';
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

  const bestTest = Object.entries(perTest)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].bestPercentage - a[1].bestPercentage)[0]?.[0] as
    | TestSlug
    | undefined;

  const hasAnyData =
    aggregate.hasAnyData ||
    personalityStats.grund.hasProfile ||
    personalityStats.avancerad.hasProfile;

  const completedCount = aggregate.totalCompleted;

  if (profileLoading || statsLoading) {
    return (
      <div className="mx-auto max-w-6xl py-6">
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
          <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="space-y-6">
        <PageHeader
          title="Rekryteringstester"
          description="Träna på de moment rekryterare faktiskt använder: logik, verbalt resonemang, siffror och personlighet."
        >
          <TesterTabs active={tab} onChange={setTab} completedCount={completedCount} />
        </PageHeader>

        {/* Gratisrytmen sägs en gång, som rad, inte i varje kort. */}
        {!isPremium ? (
          <StatusRow tone="neutral">
            Du gör varje test en gång per dag på gratisnivån.
          </StatusRow>
        ) : null}

        {tab === 'tester' ? (
          <motion.div
            key="tester"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-6"
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

            <div className="space-y-6">
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
