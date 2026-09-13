'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IlluPersonlighet } from '@/components/illustrations/TestIllustrations';
import { DIMENSION_META } from '@/lib/personalityTest/insights';
import type { PersonalityTestStats } from '@/hooks/use-personality-test-stats';
import { HUB_ROW } from './TestCard';

const ORDER = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
] as const;

interface Props {
  personality: PersonalityTestStats;
  index?: number;
}

/**
 * Sista raden i personlighetspanelen: användarens faktiska profil.
 * Speglar den "bästa" profilen (avancerad om den finns, annars grund). Har
 * profil: fem värden och länk till hela analysen. Ingen profil: en rad som
 * leder till grundtestet.
 */
export default function PersonalityResultCard({ personality }: Props) {
  // Avancerad väger tyngst om den finns, annars grund.
  const source = personality.avancerad.hasProfile ? 'avancerad' : 'grund';
  const stat = source === 'avancerad' ? personality.avancerad : personality.grund;
  const hasProfile = stat.hasProfile && !!stat.latestScores;

  const resultsHref =
    hasProfile && stat.latestSessionId
      ? `/dashboard/tester/personlighet-${source}/test/${stat.latestSessionId}/results`
      : null;

  if (hasProfile && resultsHref) {
    return (
      <li className="border-t border-kant-stark">
        <Link href={resultsHref} className={HUB_ROW}>
          <span aria-hidden="true" className="shrink-0 text-ink-2">
            <IlluPersonlighet size={24} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-1">Din profil</span>
            <span className="mt-0.5 block truncate text-meta tabular-nums text-ink-3">
              {ORDER.map((dim, i) => (
                <span key={dim}>
                  {i > 0 ? ' · ' : ''}
                  {DIMENSION_META[dim].name.slice(0, 3)} {stat.latestScores?.[dim] ?? 0}
                </span>
              ))}
            </span>
          </span>

          <span className="shrink-0 text-meta text-ink-3">Hela analysen</span>
          <ChevronRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-ink-3"
            strokeWidth={1.75}
          />
        </Link>
      </li>
    );
  }

  return (
    <li className="border-t border-kant-stark">
      <Link href="/dashboard/tester/personlighet-grund" className={HUB_ROW}>
        <span aria-hidden="true" className="shrink-0 text-ink-2">
          <IlluPersonlighet size={24} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">Ingen profil än</span>
          <span className="mt-0.5 block text-meta text-ink-3">
            Gör grundtestet så visar vi vad dina svar berättar för en rekryterare.
          </span>
        </span>

        <ChevronRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ink-3"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  );
}
