'use client';

/**
 * En testgrupp på hubben: sektionsetikett, en mening om vad typen mäter och
 * EN panel med testen som rader. Provet ligger sist i samma panel.
 *
 * Vilka rader som är gråa avgörs här, ur testConfig och scopet: allt över
 * grundnivån kräver tests_above_base, provläget test_exam_mode
 * (spec-onboarding 2026-09-22, sektion 3). Etiketten säger var nivån
 * finns, och trycket går till betalväggen via onLocked.
 */

import TestCard from './TestCard';
import PersonalityTestCard from './PersonalityTestCard';
import PersonalityResultCard from './PersonalityResultCard';
import ProvCard from './ProvCard';
import type { TestGroup as TestGroupType } from './testCatalog';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';
import { featureForSlug } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';

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
  /** Paketet. Null är gratisnivån. */
  scope?: Scope | null;
  /** Etiketten på gråa rader: "Testveckan 79 kr, eller Allt". */
  graEtikett?: string;
  /** Ett grått val tryckt. Featuren säger vad som spärrade. */
  onLocked?: (feature: Feature) => void;
  /** Dagsrytmen på grundnivån: "1 kvar i dag" per slug. */
  dagRad?: (slug: string) => string | null;
  /** Rader direkt på mark i stället för i en panel (personligheten, regel 4). */
  utanPanel?: boolean;
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
  scope = null,
  graEtikett = '',
  onLocked,
  dagRad,
  utanPanel = false,
}: Props) {
  const isPersonality = group.key === 'personlighet';

  /** Etiketten om nivån inte ingår, annars null. */
  const las = (slug: string): { label: string; feature: Feature } | null => {
    const feature = featureForSlug(slug);
    if (!feature || scopeHasFeature(scope, feature)) return null;
    return { label: graEtikett, feature };
  };
  const provSlug = group.prov?.href.split('/').pop() ?? '';
  const provLas = group.prov ? las(provSlug) : null;

  return (
    <section className="space-y-2" aria-labelledby={`testgrupp-${group.key}`}>
      <div>
        <h2 id={`testgrupp-${group.key}`} className="text-sm font-medium text-ink-3">
          {group.heading}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{group.blurb}</p>
        <p className="mt-0.5 text-meta text-ink-3">{group.searchHint}</p>
      </div>

      <ul
        className={
          utanPanel
            ? 'divide-y divide-kant border-y border-kant [&_a]:px-0 [&_button]:px-0'
            : 'divide-y divide-kant rounded-xl border border-kant bg-panel'
        }
      >
        {group.cognitive.map((test, i) => {
          const l = las(test.slug);
          return (
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
              locked={l?.label ?? null}
              onLocked={l ? () => onLocked?.(l.feature) : undefined}
              dagRad={!l && dagRad ? dagRad(test.slug) : null}
            />
          );
        })}
        {group.personality.map((test, i) => {
          const l = las(test.slug);
          return (
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
              locked={l?.label ?? null}
              onLocked={l ? () => onLocked?.(l.feature) : undefined}
              dagRad={
                !l && test.slug === 'personlighet-grund' && !scopeHasFeature(scope, 'tests_above_base')
                  ? 'Resultatet utan tolkning'
                  : null
              }
            />
          );
        })}
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
            locked={provLas?.label ?? null}
            onLocked={provLas ? () => onLocked?.(provLas.feature) : undefined}
          />
        ) : null}
      </ul>
    </section>
  );
}
