'use client';

import { motion } from 'framer-motion';
import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import PersonalityResultCard from './PersonalityResultCard';
import ProvCard from './ProvCard';
import {
  IlluMatris,
  IlluVerbal,
  IlluNumerisk,
  IlluPersonlighet,
} from '@/components/illustrations/TestIllustrations';
import type { IlluProps } from '@/components/illustrations/primitives';
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

/** En illustration per testtyp, 48 px bredvid gruppens rubrik. */
const GROUP_ILLUSTRATION: Record<
  TestGroupKey,
  (props: IlluProps) => React.ReactElement
> = {
  logik: IlluMatris,
  verbal: IlluVerbal,
  numerisk: IlluNumerisk,
  personlighet: IlluPersonlighet,
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
  // Träningskorten + ev. resultatkort. Provet ligger som balk under gridet, så
  // raden består av 2-3 kort → 3-kol på lg ger jämn rytm utan att provet stör.
  const cardCount = group.cognitive.length + group.personality.length + (isPersonality ? 1 : 0);
  const useThreeCols = cardCount >= 3;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Sektionsrubrik: testtypens ikon, namn och en mening om vad den mäter. */}
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="shrink-0 text-neutral-900">
          <Illustration size={48} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-900">{group.heading}</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{group.blurb}</p>
          <p className="mt-1 text-xs text-neutral-500">{group.searchHint}</p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
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
        <div>
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
