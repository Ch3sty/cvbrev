'use client';

/**
 * Tidigare resultat i det numeriska testet. Sektionsetikett och en panel med
 * rader, samma mall som TestPreviousResults. Bästa försöket markeras med ordet
 * "Bäst" i positiv ton, aldrig med en krona eller en färgad yta.
 */

import EmptyState from '@/components/shell/EmptyState';
import { IlluPercentil } from '@/components/illustrations/TestIllustrations';

interface SessionResult {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
}

interface NumericalPreviousResultsProps {
  variant: 'v1' | 'v2' | 'expert';
  sessions: SessionResult[];
  bestScore: number;
  totalQuestions: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} min ${secs} sek`;
}

export default function NumericalPreviousResults({
  sessions,
  bestScore,
  totalQuestions,
}: NumericalPreviousResultsProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        illustration={IlluPercentil}
        title="Inga resultat än"
        description="Kör testet en gång, så visar vi utvecklingen här och jämför mot alla andra som gjort det."
      />
    );
  }

  return (
    <section className="space-y-2" aria-labelledby="numeriska-resultat">
      <h2 id="numeriska-resultat" className="text-sm font-medium text-ink-3">
        Dina resultat
      </h2>
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {sessions.slice(0, 5).map((session) => {
          const score = session.score ?? 0;
          const pct = Math.min(100, Math.round((score / totalQuestions) * 100));
          const isBest = bestScore > 0 && score === bestScore;
          const duration = formatDuration(session.time_spent);

          return (
            <li key={session.id} className="flex min-h-14 items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium tabular-nums text-ink-1">
                  {score} av {totalQuestions}
                  <span className="ml-2 font-normal text-ink-2">{pct} procent</span>
                  {isBest ? <span className="ml-2 font-normal text-positiv">Bäst</span> : null}
                </span>
                <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
                  {formatDate(session.completed_at)}
                  {duration ? ` · ${duration}` : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
