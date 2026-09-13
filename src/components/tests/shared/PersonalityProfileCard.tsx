'use client';

/**
 * Senaste Big Five-profilen på personlighetstestets startsida: en panel med
 * fem dimensioner som 2 px linjer i ink och en textlänk till hela analysen.
 */

import Link from 'next/link';
import { DIMENSION_META } from '@/lib/personalityTest/insights';
import type { BigFiveScores } from '@/lib/personalityTest/types';

interface ProfileSummaryCardProps {
  scores: BigFiveScores;
  lastCompletedAt: string;
  resultsHref: string;
  attempts: number;
}

const ORDER = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

export default function ProfileSummaryCard({
  scores,
  lastCompletedAt,
  resultsHref,
  attempts,
}: ProfileSummaryCardProps) {
  return (
    <section className="space-y-2" aria-labelledby="senaste-profil">
      <h2 id="senaste-profil" className="text-sm font-medium text-ink-3">
        Din senaste profil
      </h2>

      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <p className="text-meta tabular-nums text-ink-3">
          {new Date(lastCompletedAt).toLocaleDateString('sv-SE')} · {attempts} försök
        </p>

        <ul className="mt-4 space-y-3">
          {ORDER.map((dim) => {
            const meta = DIMENSION_META[dim];
            const score = scores[dim];
            return (
              <li key={dim}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink-2">{meta.name}</span>
                  <span className="font-medium tabular-nums text-ink-1">{score}</span>
                </div>
                <div className="h-0.5 w-full bg-kant" aria-hidden="true">
                  <div className="h-full bg-ink-1" style={{ width: `${score}%` }} />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-kant pt-3">
          <Link
            href={resultsHref}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            Se hela analysen
          </Link>
        </div>
      </div>
    </section>
  );
}
