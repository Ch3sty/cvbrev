'use client';

import { useProfile } from '@/hooks/use-profile';
import { useAllTestStats, type TestSlug } from '@/hooks/use-all-test-stats';
import TesterHubHero from './components/TesterHubHero';
import TestStatsCard from './components/TestStatsCard';
import EmptyTestsCallout from './components/EmptyTestsCallout';
import TestCategorySection from './components/TestCategorySection';
import TestCard, { type TestCardVariant } from './components/TestCard';

interface TestDef {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  description: string;
  questionCount: number;
  timeLabel: string;
  difficultyLabel: string;
  isPremiumLocked: boolean;
}

const MATRIX_TESTS: TestDef[] = [
  {
    slug: 'matrislogik-grund',
    variant: 'matrix-grund',
    title: 'Matrislogik — grund',
    description: 'Mönsterigenkänning och visuella sekvenser för nybörjare.',
    questionCount: 15,
    timeLabel: '~20',
    difficultyLabel: '3',
    isPremiumLocked: false,
  },
  {
    slug: 'matrislogik-avancerad',
    variant: 'matrix-avancerad',
    title: 'Matrislogik — avancerad',
    description: 'Komplexa mönster och flerdimensionell logik på elit-nivå.',
    questionCount: 15,
    timeLabel: '~25',
    difficultyLabel: '4',
    isPremiumLocked: true,
  },
];

const VERBAL_TESTS: TestDef[] = [
  {
    slug: 'verbal-resonemang',
    variant: 'verbal-v1',
    title: 'Verbalt resonemang — grund',
    description: 'Förståelse av text, ordförråd och språkliga samband.',
    questionCount: 15,
    timeLabel: '~20',
    difficultyLabel: '3',
    isPremiumLocked: false,
  },
  {
    slug: 'verbal-resonemang-v2',
    variant: 'verbal-v2',
    title: 'Verbalt resonemang — avancerad',
    description: 'Avancerad textanalys och slutledning från komplexa textstycken.',
    questionCount: 15,
    timeLabel: '~25',
    difficultyLabel: '4',
    isPremiumLocked: true,
  },
];

const NUMERICAL_TESTS: TestDef[] = [
  {
    slug: 'numeriskt-test',
    variant: 'numerical-v1',
    title: 'Numeriskt test — grund',
    description: 'Räkneförmåga, talföljder och grundläggande dataanalys.',
    questionCount: 15,
    timeLabel: '~20',
    difficultyLabel: '3',
    isPremiumLocked: false,
  },
  {
    slug: 'numeriskt-test-v2',
    variant: 'numerical-v2',
    title: 'Numeriskt test — avancerad',
    description: 'Avancerade tabeller, diagram och flerstegs-resonemang med siffror.',
    questionCount: 15,
    timeLabel: '~25',
    difficultyLabel: '4',
    isPremiumLocked: true,
  },
];

export default function TesterHubPage() {
  const { subscriptionTier, loading: profileLoading } = useProfile();
  const { perTest, aggregate, isLoading: statsLoading } = useAllTestStats();

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

        {aggregate.hasAnyData ? (
          <TestStatsCard
            completedTestCount={aggregate.completedTestCount}
            totalTestCount={6}
            averageBestPercentage={aggregate.averageBestPercentage}
            totalTimeSeconds={aggregate.totalTimeSeconds}
          />
        ) : (
          <EmptyTestsCallout />
        )}

        <TestCategorySection
          kind="matrix"
          eyebrow="Matrislogik"
          title="Visuella mönster"
          description="Identifiera logiska samband och relationer i matriser."
          index={0}
        >
          {MATRIX_TESTS.map((test, i) => (
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
        </TestCategorySection>

        <TestCategorySection
          kind="verbal"
          eyebrow="Verbalt resonemang"
          title="Språk och slutledning"
          description="Förståelse, analys och argumentation i text."
          index={1}
        >
          {VERBAL_TESTS.map((test, i) => (
            <TestCard
              key={test.slug}
              {...test}
              isUserPremium={isPremium}
              stats={perTest[test.slug]}
              isBestOverall={bestTest === test.slug}
              index={i}
            />
          ))}
        </TestCategorySection>

        <TestCategorySection
          kind="numerical"
          eyebrow="Numeriskt resonemang"
          title="Räkning och dataanalys"
          description="Talföljder, tabeller och beräkningar under tidspress."
          index={2}
        >
          {NUMERICAL_TESTS.map((test, i) => (
            <TestCard
              key={test.slug}
              {...test}
              isUserPremium={isPremium}
              stats={perTest[test.slug]}
              isBestOverall={bestTest === test.slug}
              index={i}
            />
          ))}
        </TestCategorySection>
      </div>
    </div>
  );
}
