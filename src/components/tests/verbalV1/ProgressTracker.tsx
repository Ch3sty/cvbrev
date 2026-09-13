/**
 * Framstegskort i det verbala testet: hur många påståenden som är besvarade.
 * En panel, ett tal och tråden som linje. Ingen färgad ram, ingen rörelse i
 * skelettet.
 */

interface ProgressTrackerProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export function ProgressTracker({ totalQuestions, answeredQuestions }: ProgressTrackerProps) {
  const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
  const isDone = answeredQuestions === totalQuestions;

  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-2">Framsteg</span>
        <span
          className={`text-sm font-medium tabular-nums ${isDone ? 'text-positiv' : 'text-ink-1'}`}
        >
          {answeredQuestions} av {totalQuestions}
        </span>
      </div>

      <div className="h-0.5 w-full bg-kant" aria-hidden="true">
        <div
          className="h-full origin-left bg-accent transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${percentage / 100})` }}
        />
      </div>

      <p className="mt-2 text-center text-meta tabular-nums text-ink-3">
        {percentage} % besvarade
      </p>
    </section>
  );
}
