'use client';

/**
 * Poängen i det verbala testet. En panel, siffrorna bär vikten, samma mall som
 * TestResultsShell. Ingen medalj, ingen fylld procentbricka.
 */

interface VerbalResultsHeroProps {
  score: number;
  totalStatements: number;
  percentage: number;
  completedDate: string;
  timeSpent: number;
  variant: 'v1' | 'v2';
}

export default function VerbalResultsHero({
  score,
  totalStatements,
  percentage,
  completedDate,
  timeSpent,
  variant,
}: VerbalResultsHeroProps) {
  const versionLabel = variant === 'v2' ? 'Resultat, avancerad' : 'Resultat';
  const mins = Math.floor(timeSpent / 60);
  const secs = timeSpent % 60;

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label="Din poäng">
      <p className="mb-2 text-steg uppercase text-ink-3">{versionLabel}</p>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-tal tabular-nums text-ink-1">{score}</span>
        <span className="text-meta text-ink-3">av {totalStatements}</span>
        <span className="ml-2 text-tal tabular-nums text-ink-1">{percentage}</span>
        <span className="text-meta text-ink-3">procent</span>
      </div>

      <p className="mt-4 border-t border-kant pt-4 text-meta tabular-nums text-ink-3">
        Slutfört på {mins} min {secs} sek · {completedDate}
      </p>
    </section>
  );
}
