'use client';

import { motion } from 'framer-motion';
import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import type { TestGroup as TestGroupType } from './testCatalog';
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

export default function TestGroup({
  group,
  startIndex,
  isPremium,
  perTest,
  personality,
  bestTest,
  recommendSlug,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {group.heading}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{group.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 ${
          group.cognitive.length === 3 ? 'lg:grid-cols-3' : ''
        }`}
      >
        {group.cognitive.map((test, i) => (
          <TestCard
            key={test.slug}
            slug={test.slug}
            variant={test.variant}
            title={test.title}
            method={test.method}
            categoryLabel={test.categoryLabel}
            levelLabel={test.levelLabel}
            hideLevelPill={test.levelInTitle}
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
      </div>
    </motion.section>
  );
}
