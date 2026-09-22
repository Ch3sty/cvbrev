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
 * Nivåer som inte ingår i paketet är gråa med lås och paketets namn
 * (spec-onboarding 2026-09-22, sektion 3): raden går då inte till testet
 * utan öppnar betalväggen för rätt paket. Nivåer som ingår öppnar alltid
 * testets sida, aldrig prenumerationssidan.
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

/** Det gråa läget: streckad kant, dämpad text, lås till höger. */
export const HUB_ROW_LOCKED =
  'flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left opacity-75 transition-colors duration-[120ms] hover:bg-insunken';

/** Låset i 16 px, samma symbol som specens. */
export function LasIkon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-insunken text-ink-3"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="6" y="11" width="12" height="9" rx="2" />
        <path d="M9 11V8a3 3 0 0 1 6 0v3" />
      </svg>
    </span>
  );
}

interface TestCardProps {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  /** Behålls för anropskompatibilitet; låset avgörs av `locked`. */
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PerTestStats;
  /** Ditt bästa test totalt. */
  isBestOverall?: boolean;
  isRecommended?: boolean;
  index?: number;
  /** Nivån ingår inte i paketet: etiketten säger var den finns. */
  locked?: string | null;
  onLocked?: () => void;
  /** Dagsrytmen på gratisnivån: "1 kvar i dag". */
  dagRad?: string | null;
}

export default function TestCard({
  slug,
  title,
  categoryLabel,
  levelLabel,
  questionCount,
  timeLabel,
  stats,
  isBestOverall,
  isRecommended,
  locked,
  onLocked,
  dagRad,
}: TestCardProps) {
  const hasProgress = stats.attempts > 0;
  const showBest = isBestOverall && hasProgress;

  const badge = (
    <TestLevelBadge kind={KIND_FOR_CATEGORY[categoryLabel]} level={LEVEL_KEY[levelLabel]} iconOnly />
  );

  if (locked) {
    return (
      <li>
        <button
          type="button"
          onClick={onLocked}
          aria-label={`${title}, ${levelLabel.toLowerCase()}. Ingår inte. ${locked}`}
          className={HUB_ROW_LOCKED}
        >
          <span className="text-kant-stark">{badge}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-3">
              {title}, {levelLabel.toLowerCase()}
            </span>
            <span className="mt-0.5 block text-meta text-ink-3">{locked}</span>
          </span>
          <LasIkon />
        </button>
      </li>
    );
  }

  return (
    <li>
      {/* Alltid testets egen sida. Aldrig prenumerationssidan. */}
      <Link href={testPaths.hub(slug)} className={HUB_ROW}>
        {badge}

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
            {dagRad ? ` · ${dagRad}` : ''}
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
