'use client';

/**
 * Raden för ett personlighetstest på hubben.
 *
 * Våg 1 punkt 6: raden öppnar alltid testets sida, aldrig prenumerationssidan.
 * Premiumkravet på avancerad nivå står som meta och avgörs serverside.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import { testPaths } from '../testConfig';
import { HUB_ROW, type TestLevelLabel } from './TestCard';

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
}

export default function PersonalityTestCard({
  slug,
  title,
  levelLabel,
  questionCount,
  timeLabel,
  isPremiumLocked,
  isUserPremium,
  stats,
}: Props) {
  const needsPremium = isPremiumLocked && !isUserPremium;
  const hasProfile = stats.hasProfile;

  return (
    <li>
      <Link href={testPaths.hub(slug)} className={HUB_ROW}>
        <TestLevelBadge
          kind="personlighet"
          level={levelLabel === 'Avancerad' ? 'avancerad' : 'grund'}
          iconOnly
        />

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">
            {title}, {levelLabel.toLowerCase()}
          </span>
          <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
            {questionCount} påståenden · ca {timeLabel} min
            {needsPremium ? ' · Premium' : ''}
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
