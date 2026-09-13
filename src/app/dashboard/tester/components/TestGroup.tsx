'use client';

/**
 * En testgrupp på hubben: sektionsetikett, en mening om vad typen mäter och
 * EN panel med testen som rader. Provet ligger sist i samma panel.
 */

import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import PersonalityResultCard from './PersonalityResultCard';
import ProvCard from './ProvCard';
import type { TestGroup as TestGroupType } from './testCatalog';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';

interface Props {
  group: TestGroupType;
  /** Löpande index över alla grupper. Behålls för anropskompatibilitet. */
  startIndex: number;
  isPremium: boolean;
  perTest: Record<TestSlug, PerTestStats>;
  personality: PersonalityTestStats;
  bestTest?: TestSlug;
  /** Bästa provresultat i procent för gruppens prov, null om inget gjorts. */
  provBestPercent?: number | null;
  recommendSlug?: TestSlug;
}

export default function TestGroup({
  group,
  startIndex,
  isPremium,
  perTest,
  personality,
  bestTest,
  provBestPercent = null,
  recommendSlug,
}: Props) {
  const isPersonality = group.key === 'personlighet';

  return (
    <section className="space-y-2" aria-labelledby={`testgrupp-${group.key}`}>
      <div>
        <h2 id={`testgrupp-${group.key}`} className="text-sm font-medium text-ink-3">
          {group.heading}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{group.blurb}</p>
        <p className="mt-0.5 text-meta text-ink-3">{group.searchHint}</p>
      </div>

      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
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
        {/* Sista raden i personlighetspanelen: användarens faktiska profil. */}
        {isPersonality ? (
          <PersonalityResultCard
            personality={personality}
            index={startIndex + group.personality.length}
          />
        ) : null}

        {/* Provet sist i samma panel: "träna ovan, pröva här". */}
        {group.prov ? (
          <ProvCard
            href={group.prov.href}
            totalQuestions={group.prov.totalQuestions}
            minutes={group.prov.minutes}
            bestPercent={provBestPercent}
          />
        ) : null}
      </ul>
    </section>
  );
}
