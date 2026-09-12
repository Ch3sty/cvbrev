'use client';

/**
 * Testhubbens interaktiva del.
 *
 * All data kommer färdig som props från page.tsx, som läste den på servern.
 * Den enda staten här är vilken flik som är vald, och den är rent lokal.
 * Inga fetchanrop, ingen laddningsvy: första HTML innehåller redan korten med
 * användarens riktiga resultat.
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import type { TestSlug } from '@/hooks/use-all-test-stats';
import TestStatsCard from './components/TestStatsCard';
import EmptyTestsCallout from './components/EmptyTestsCallout';
import TesterTabs, { type TesterTab } from './components/TesterTabs';
import TestGroup from './components/TestGroup';
import { TEST_GROUPS } from './components/testCatalog';
import type { TesterHubData } from './getHubData';

/**
 * Utvecklingsfliken syns aldrig i första vyn: sidan öppnar alltid på
 * "Tester". Trendgraferna (Sparkline, TestProgressCard) laddas därför först
 * när fliken faktiskt klickas. Höjden reserveras nedan så bytet inte hoppar.
 */
const DevelopmentView = dynamic(() => import('./components/DevelopmentView'), {
  loading: () => <div className="min-h-[420px]" aria-hidden="true" />,
});

export default function TesterHubClient({ data }: { data: TesterHubData }) {
  const [tab, setTab] = useState<TesterTab>('tester');

  const { perTest, aggregate, personality, provBestPercent, isPremium } = data;

  const bestTest = Object.entries(perTest)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].bestPercentage - a[1].bestPercentage)[0]?.[0] as
    | TestSlug
    | undefined;

  const hasAnyData =
    aggregate.hasAnyData || personality.grund.hasProfile || personality.avancerad.hasProfile;

  // Barnkomponenterna är skrivna mot hookens form, som bär ett isLoading-fält.
  // Serverdatan är per definition färdigladdad.
  const personalityStats = { ...personality, isLoading: false };

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="space-y-6">
        <PageHeader
          title="Rekryteringstester"
          description="Träna på de moment rekryterare faktiskt använder: logik, verbalt resonemang, siffror och personlighet."
        >
          <TesterTabs
            active={tab}
            onChange={setTab}
            completedCount={aggregate.totalCompleted}
          />
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
                    provBestPercent={
                      group.prov ? provBestPercent[group.prov.sessionEndpoint] ?? null : null
                    }
                    recommendSlug={
                      !hasAnyData && group.key === 'logik' ? 'matrislogik-grund' : undefined
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
