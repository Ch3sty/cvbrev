'use client';

/**
 * Framstegskort för det numeriska testet: fråga X av Y, förfluten tid och
 * tråden som linje. Skelettet står stilla, bara linjen rör sig.
 */

interface TestProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedSeconds: number;
}

export default function TestProgress({
  currentQuestion,
  totalQuestions,
  elapsedSeconds,
}: TestProgressProps) {
  const percentage = Math.min(100, Math.round(((currentQuestion - 1) / totalQuestions) * 100));
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <section className="rounded-xl border border-kant bg-panel p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <p className="tabular-nums text-ink-3">
          <span className="text-meta">Fråga </span>
          <span className="font-medium text-ink-1">{currentQuestion}</span>
          <span> / {totalQuestions}</span>
        </p>
        <span className="font-medium tabular-nums text-ink-1">{timeLabel}</span>
      </div>

      <div className="h-0.5 w-full bg-kant" aria-hidden="true">
        <div
          className="h-full origin-left bg-accent transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${percentage / 100})` }}
        />
      </div>
    </section>
  );
}
