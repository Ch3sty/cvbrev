'use client';

/**
 * Raden för ett enskilt test på hubben (docs/design/designsystem-v2-utkast.md,
 * "Hubbar och listor").
 *
 * Hubben är en lista i en panel, inte ett rutnät av kort. Varje test är en
 * rad: naken ikon 24 i ink-2, titel, meta och bästa resultatet som tal till
 * höger. Rekommendationen "Börja här" är en stegetikett i accent-ink och står
 * på högst en rad per vy.
 *
 * Våg 1 punkt 6: raden öppnar ALLTID testet. Tidigare skickade ett
 * premiumlåst kort användaren till prenumerationssidan innan hon ens sett
 * testet, alltså spärren före värdet. Nu öppnas testets sida, och betalväggen
 * kommer där kvoten faktiskt tar slut, räknad serverside i quotaService.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import { testPaths, type TestKind, type TestLevel } from '../testConfig';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';

export type TestCardVariant =
  | 'matrix-grund'
  | 'matrix-avancerad'
  | 'matrix-expert'
  | 'verbal-v1'
  | 'verbal-v2'
  | 'numerical-v1'
  | 'numerical-v2';

export type TestCategoryLabel = 'Logik' | 'Språk' | 'Siffror' | 'Personlighet';
export type TestLevelLabel = 'Grund' | 'Avancerad' | 'Expert';

/** Nivåetiketten på hubben mappas till konfigurationens nivåbegrepp. */
const LEVEL_KEY: Record<TestLevelLabel, TestLevel> = {
  Grund: 'grund',
  Avancerad: 'avancerad',
  Expert: 'expert',
};

const KIND_FOR_CATEGORY: Record<TestCategoryLabel, TestKind> = {
  Logik: 'matris',
  Språk: 'verbal',
  Siffror: 'numerisk',
  Personlighet: 'personlighet',
};

/** Radens gemensamma form. Delas med personlighets- och provraden. */
export const HUB_ROW =
  'flex min-h-14 items-center gap-3 px-4 py-3 transition-colors duration-[120ms] hover:bg-insunken';

interface TestCardProps {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  /** Premium krävs. Spärren sitter serverside, raden öppnar ändå testet. */
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PerTestStats;
  /** Ditt bästa test totalt. */
  isBestOverall?: boolean;
  isRecommended?: boolean;
  index?: number;
}

export default function TestCard({
  slug,
  title,
  categoryLabel,
  levelLabel,
  questionCount,
  timeLabel,
  isPremiumLocked,
  isUserPremium,
  stats,
  isBestOverall,
  isRecommended,
}: TestCardProps) {
  const hasProgress = stats.attempts > 0;
  const showBest = isBestOverall && hasProgress;
  const needsPremium = isPremiumLocked && !isUserPremium;

  return (
    <li>
      {/* Alltid testets egen sida. Aldrig prenumerationssidan. */}
      <Link href={testPaths.hub(slug)} className={HUB_ROW}>
        <TestLevelBadge
          kind={KIND_FOR_CATEGORY[categoryLabel]}
          level={LEVEL_KEY[levelLabel]}
          iconOnly
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-medium text-ink-1">
              {title}, {levelLabel.toLowerCase()}
            </span>
            {isRecommended && !hasProgress ? (
              <span className="text-steg uppercase text-accent-ink">Börja här</span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
            {questionCount} frågor · ca {timeLabel} min
            {needsPremium ? ' · Premium' : ''}
            {showBest ? ' · Ditt bästa test' : ''}
          </span>
        </span>

        {hasProgress ? (
          <span className="shrink-0 text-right">
            <span className="block text-base font-medium tabular-nums text-ink-1">
              {stats.bestPercentage} %
            </span>
            <span className="block text-meta tabular-nums text-ink-3">
              {stats.bestScore} av {questionCount}
            </span>
          </span>
        ) : null}

        <ChevronRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ink-3"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  );
}
