'use client';

/**
 * Äldre topprad för logiktestet. Provskalet (TestFlowShell + TestMeterRow)
 * äger numera klocka och räknare, den här raden finns kvar som en fristående
 * variant med samma toner.
 */

import { useEffect, useState } from 'react';

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  startedAt: Date;
}

export function TestHeader({
  currentQuestion,
  totalQuestions,
  answeredCount,
  startedAt,
}: TestHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="sticky top-0 z-30 border-b border-kant bg-panel">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
          <span className="min-w-[52px] font-medium tabular-nums text-ink-1">{elapsedTime}</span>

          <p className="tabular-nums text-ink-3">
            <span className="text-meta">Fråga </span>
            <span className="font-medium text-ink-1">{currentQuestion + 1}</span>
            <span> / {totalQuestions}</span>
          </p>

          <span className="min-w-[52px] text-right font-medium tabular-nums text-positiv">
            {answeredCount}
            <span className="hidden sm:inline"> / {totalQuestions}</span>
          </span>
        </div>

        {/*
          Progressraden. Spåret har alltid sin fulla höjd och bredd, så den
          reserverar sin plats från första målningen. Fyllningen skalas med
          transform i stället för att animera `width`: en width-animation
          räknas om i layouten varje bildruta, en transform gör det inte.
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
