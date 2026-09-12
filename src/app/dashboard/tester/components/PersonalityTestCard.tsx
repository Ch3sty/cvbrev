'use client';

/**
 * Kortet för ett personlighetstest på hubben.
 *
 * Våg 1 punkt 6: kortet öppnar alltid testets sida, aldrig prenumerationssidan.
 * Premiumkravet på avancerad nivå står som en etikett och avgörs serverside.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import { testPaths } from '../testConfig';
import type { TestLevelLabel } from './TestCard';

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
  index = 0,
}: Props) {
  const needsPremium = isPremiumLocked && !isUserPremium;
  const hasProfile = stats.hasProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2), ease: 'easeOut' }}
    >
      <Link
        href={testPaths.hub(slug)}
        className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <TestLevelBadge
            kind="personlighet"
            level={levelLabel === 'Avancerad' ? 'avancerad' : 'grund'}
          />
          {needsPremium ? (
            <span className="shrink-0 text-xs font-medium text-neutral-500">
              Premium
            </span>
          ) : hasProfile ? (
            <span className="shrink-0 text-xs font-medium text-emerald-700">Klar</span>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-xs tabular-nums text-neutral-500">
          {questionCount} påståenden · ca {timeLabel} min
        </p>

        {hasProfile && stats.lastCompletedAt ? (
          <p className="mt-4 border-t border-neutral-200 pt-3 text-xs tabular-nums text-neutral-600">
            Profilen är klar sedan{' '}
            {new Date(stats.lastCompletedAt).toLocaleDateString('sv-SE')}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-900">
          {hasProfile ? 'Gör om testet' : 'Starta testet'}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </motion.div>
  );
}
