'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import PersonalityResultCard from './PersonalityResultCard';
import {
  MatrixCategoryIllustration,
  VerbalCategoryIllustration,
  NumericalCategoryIllustration,
  PersonalityCategoryIllustration,
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
  const isPersonality = group.key === 'personlighet';
  // Personlighetsraden får tre kort (Grund, Avancerad, Resultat) → 3-kol på lg.
  const useThreeCols = group.cognitive.length === 3 || isPersonality;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      {/* Pedagogisk sektionsrubrik: ikon + vad det är + vad man söker efter */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div
          className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center"
          style={{ boxShadow: '0 4px 12px -6px rgba(249, 115, 22, 0.2)' }}
        >
          <Illustration className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {group.heading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
            {group.blurb}
          </p>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
            <Search className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
            {group.searchHint}
          </p>
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
    </motion.section>
  );
}
