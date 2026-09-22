'use client';

/**
 * Raden för ett personlighetstest på hubben.
 *
 * Grundnivån öppnar alltid testets sida. Tolkningen (avancerad nivå) ingår
 * i Testveckan och Allt; i andra paket är raden grå med lås och paketets
 * namn, och trycket öppnar betalväggen (spec-onboarding 2026-09-22,
 * sektion 3).
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import { testPaths } from '../testConfig';
import { HUB_ROW, HUB_ROW_LOCKED, LasIkon, type TestLevelLabel } from './TestCard';

export type PersonalityCardVariant = 'personality-grund' | 'personality-avancerad';

export interface PersonalityCardStats {
  hasProfile: boolean;
  lastCompletedAt: string | null;
  attempts: number;
}

interface Props {
  slug: 'personlighet-grund' | 'personlighet-avancerad';
  variant: PersonalityCardVariant;
  title: string;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PersonalityCardStats;
  index?: number;
  /** Nivån ingår inte i paketet: etiketten säger var den finns. */
  locked?: string | null;
  onLocked?: () => void;
  /** Underraden på grundnivån utanför Testveckan: "Resultatet utan tolkning". */
  dagRad?: string | null;
}

export default function PersonalityTestCard({
  slug,
  title,
  levelLabel,
  questionCount,
  timeLabel,
  stats,
  locked,
  onLocked,
  dagRad,
}: Props) {
  const hasProfile = stats.hasProfile;
  const level = levelLabel === 'Avancerad' ? 'avancerad' : 'grund';
  const titel = level === 'avancerad' ? 'Personlighetstestet, med tolkning' : `${title}, ${levelLabel.toLowerCase()}`;

  if (locked) {
    return (
      <li>
        <button
          type="button"
          onClick={onLocked}
          aria-label={`${titel}. Ingår inte. ${locked}`}
          className={HUB_ROW_LOCKED}
        >
          <span className="text-kant-stark">
            <TestLevelBadge kind="personlighet" level={level} iconOnly />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-3">{titel}</span>
            <span className="mt-0.5 block text-meta text-ink-3">{locked}</span>
          </span>
          <LasIkon />
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={testPaths.hub(slug)} className={HUB_ROW}>
        <TestLevelBadge kind="personlighet" level={level} iconOnly />

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">{titel}</span>
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
            {questionCount} påståenden · ca {timeLabel} min
            {dagRad ? ` · ${dagRad}` : ''}
          </span>
        </span>

        {hasProfile && stats.lastCompletedAt ? (
          <span className="shrink-0 text-right">
            <span className="block text-sm font-medium text-positiv">Klar</span>
            <span className="block text-meta tabular-nums text-ink-3">
              {new Date(stats.lastCompletedAt).toLocaleDateString('sv-SE')}
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
