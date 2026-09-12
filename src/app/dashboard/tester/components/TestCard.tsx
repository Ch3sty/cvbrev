'use client';

/**
 * Kortet för ett enskilt test på hubben.
 *
 * Våg 1 punkt 6: kortet öppnar ALLTID testet. Tidigare skickade ett
 * premiumlåst kort användaren till prenumerationssidan innan hon ens sett
 * testet, alltså spärren före värdet. Nu öppnas testets sida, och betalväggen
 * kommer där kvoten faktiskt tar slut, räknad serverside i quotaService.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import Sparkline from './Sparkline';
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

interface TestCardProps {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  /** Premium krävs. Spärren sitter serverside, kortet öppnar ändå testet. */
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
  index = 0,
}: TestCardProps) {
  const hasProgress = stats.attempts > 0;
  const showBest = isBestOverall && hasProgress;
  const needsPremium = isPremiumLocked && !isUserPremium;
  const trend = stats.history.map((h) => h.percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2), ease: 'easeOut' }}
    >
      {/* Alltid testets egen sida. Aldrig prenumerationssidan. */}
      <Link
        href={testPaths.hub(slug)}
        className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <TestLevelBadge
            kind={KIND_FOR_CATEGORY[categoryLabel]}
            level={LEVEL_KEY[levelLabel]}
          />
          {needsPremium ? (
            <span className="shrink-0 text-xs font-medium text-neutral-500">
              Premium
            </span>
          ) : showBest ? (
            <span className="shrink-0 text-xs font-medium text-emerald-700">
              Ditt bästa
            </span>
          ) : hasProgress ? (
            <span className="shrink-0 text-xs font-medium text-neutral-500">Klar</span>
          ) : isRecommended ? (
            <span className="shrink-0 text-xs font-medium text-orange-700">
              Börja här
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-xs tabular-nums text-neutral-500">
          {questionCount} frågor · ca {timeLabel} min
          {!isUserPremium ? ' · en omgång per dag' : ''}
        </p>

        {hasProgress ? (
          <div className="mt-4 flex items-center gap-3 border-t border-neutral-200 pt-3">
            <span className="text-lg font-semibold tabular-nums text-neutral-900">
              {stats.bestPercentage} %
            </span>
            <span className="text-xs tabular-nums text-neutral-500">
              {stats.bestScore} av {questionCount} bäst
            </span>
            {trend.length > 1 ? (
              <span className="ml-auto min-w-0 flex-1">
                <Sparkline values={trend} height={20} />
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-900">
          {hasProgress ? 'Gör om testet' : 'Starta testet'}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </motion.div>
  );
}
