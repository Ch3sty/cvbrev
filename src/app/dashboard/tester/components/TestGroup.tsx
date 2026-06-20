'use client';

import { motion } from 'framer-motion';
import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import PersonalityResultCard from './PersonalityResultCard';
import ProvCard from './ProvCard';
import {
  MatrixCategoryIllustration,
  VerbalCategoryIllustration,
  NumericalCategoryIllustration,
  PersonalityCategoryIllustration,
  ExampleLogik,
  ExampleVerbal,
  ExampleNumerisk,
  ExamplePersonlighet,
} from './illustrations/TesterHubIcons';
import type { TestGroup as TestGroupType, TestGroupKey } from './testCatalog';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';

interface Props {
  group: TestGroupType;
  /** Löpande index för stagger-animation över alla grupper. */
  startIndex: number;
  isPremium: boolean;
  perTest: Record<TestSlug, PerTestStats>;
  personality: PersonalityTestStats;
  bestTest?: TestSlug;
  recommendSlug?: TestSlug;
}

const GROUP_ILLUSTRATION: Record<
  TestGroupKey,
  (props: { className?: string }) => React.ReactElement
> = {
  logik: MatrixCategoryIllustration,
  verbal: VerbalCategoryIllustration,
  numerisk: NumericalCategoryIllustration,
  personlighet: PersonalityCategoryIllustration,
};

// Liggande exempel-illustration som visar VAD testet är (ersätter beskrivande text).
const GROUP_EXAMPLE: Record<
  TestGroupKey,
  (props: { className?: string }) => React.ReactElement
> = {
  logik: ExampleLogik,
  verbal: ExampleVerbal,
  numerisk: ExampleNumerisk,
  personlighet: ExamplePersonlighet,
};

export default function TestGroup({
  group,
  startIndex,
  isPremium,
  perTest,
  personality,
  bestTest,
  recommendSlug,
}: Props) {
  const Illustration = GROUP_ILLUSTRATION[group.key];
  const Example = GROUP_EXAMPLE[group.key];
  const isPersonality = group.key === 'personlighet';
  // Träningskorten + ev. resultatkort. Provet ligger som balk under gridet, så
  // raden består av 2-3 kort → 3-kol på lg ger jämn rytm utan att provet stör.
  const cardCount = group.cognitive.length + group.personality.length + (isPersonality ? 1 : 0);
  const useThreeCols = cardCount >= 3;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="relative rounded-3xl border border-orange-100/80 bg-gradient-to-b from-orange-50/40 to-transparent p-4 sm:p-5"
    >
      {/* Sektionsrubrik: ikon + namn + kort mening, med exempel-illustration till höger. */}
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div
          className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center"
          style={{ boxShadow: '0 4px 12px -6px rgba(249, 115, 22, 0.2)' }}
        >
          <Illustration className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {group.heading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug truncate">
            {group.blurb}
          </p>
        </div>
        {/* Exempel: visar vad testet är, ersätter beskrivande text. */}
        <div className="hidden sm:block flex-shrink-0 w-28 h-14 rounded-xl bg-white border border-orange-100 p-1">
          <Example className="w-full h-full" />
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 ${
          useThreeCols ? 'lg:grid-cols-3' : ''
        }`}
      >
        {group.cognitive.map((test, i) => (
          <TestCard
            key={test.slug}
            slug={test.slug}
            variant={test.variant}
            title={test.title}
            categoryLabel={test.categoryLabel}
            levelLabel={test.levelLabel}
            questionCount={test.questionCount}
            timeLabel={test.timeLabel}
            isPremiumLocked={test.isPremiumLocked}
            isUserPremium={isPremium}
            stats={perTest[test.slug]}
            isBestOverall={bestTest === test.slug}
            isRecommended={recommendSlug === test.slug}
            index={startIndex + i}
          />
        ))}
        {group.personality.map((test, i) => (
          <PersonalityTestCard
            key={test.slug}
            slug={test.slug}
            variant={test.variant}
            title={test.title}
            levelLabel={test.levelLabel}
            questionCount={test.questionCount}
            timeLabel={test.timeLabel}
            isPremiumLocked={test.isPremiumLocked}
            isUserPremium={isPremium}
            stats={
              test.slug === 'personlighet-grund'
                ? personality.grund
                : personality.avancerad
            }
            index={startIndex + group.cognitive.length + i}
          />
        ))}
        {/* Tredje kort på personlighetsraden: användarens faktiska resultat. */}
        {isPersonality && (
          <PersonalityResultCard
            personality={personality}
            index={startIndex + group.personality.length}
          />
        )}
      </div>

      {/* Standout prov-balk under träningskorten: "träna ovan, pröva här". */}
      {group.prov && (
        <div className="mt-3 sm:mt-4">
          <ProvCard
            href={group.prov.href}
            sessionEndpoint={group.prov.sessionEndpoint}
            totalQuestions={group.prov.totalQuestions}
            minutes={group.prov.minutes}
          />
        </div>
      )}
    </motion.section>
  );
}
