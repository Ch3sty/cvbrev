'use client';

/**
 * Äldre topprad för det verbala testet. Provskalet (TestFlowShell +
 * TestMeterRow) äger numera klocka och räknare, den här raden finns kvar som
 * en fristående variant. Samma toner: ink på panel, varning och fel bara på
 * klockan, tråden som framstegslinje.
 */

interface VerbalTestHeaderProps {
  currentPassage: number;
  totalPassages: number;
  answeredCount: number;
  totalStatements: number;
  timeRemaining: number; // sekunder
}

export default function VerbalTestHeader({
  currentPassage,
  totalPassages,
  answeredCount,
  totalStatements,
  timeRemaining,
}: VerbalTestHeaderProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeLabel = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Tonen byter en gång: ink tills tiden håller på att ta slut, sedan varning
  // och fel den sista minuten.
  const isLowTime = timeRemaining < 5 * 60;
  const isCriticalTime = timeRemaining < 60;
  const timeTone = isCriticalTime ? 'text-fel' : isLowTime ? 'text-varning' : 'text-ink-1';

  const progressPercent = (answeredCount / totalStatements) * 100;

  return (
    <div className="sticky top-0 z-30 border-b border-kant bg-panel">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
          <span
            className={`min-w-[52px] font-medium tabular-nums ${timeTone}`}
            aria-live={isCriticalTime ? 'assertive' : 'off'}
          >
            {timeLabel}
          </span>

          <p className="tabular-nums text-ink-3">
            <span className="text-meta">Passage </span>
            <span className="font-medium text-ink-1">{currentPassage + 1}</span>
            <span> / {totalPassages}</span>
          </p>

          <span className="min-w-[52px] text-right font-medium tabular-nums text-positiv">
            {answeredCount}
            <span className="hidden sm:inline"> / {totalStatements}</span>
          </span>
        </div>

        {/*
          Spåret har alltid sin fulla bredd, så det reserverar sin plats från
          första målningen. Fyllningen skalas med transform i stället för att
          animera bredd: en width-animation räknas om i layouten varje bildruta.
        */}
        <div className="h-0.5 w-full bg-kant" aria-hidden="true">
          <div
            className="h-full origin-left bg-accent transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${Math.max(0, Math.min(100, progressPercent)) / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}
