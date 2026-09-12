'use client';

import { Clock, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Timer */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-full border border-orange-200/60 [animation:fadeInPlace_0.3s_ease-out]">
            <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-mono font-bold text-orange-700 tabular-nums">
              {elapsedTime}
            </span>
          </div>

          {/* Question number (center) */}
          <div className="text-center [animation:fadeInPlace_0.3s_ease-out]">
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold leading-none mb-0.5">
              Fråga
            </p>
            <p className="text-base sm:text-lg font-bold text-neutral-900 tabular-nums leading-none">
              {currentQuestion + 1}
              <span className="text-neutral-400 font-medium"> / {totalQuestions}</span>
            </p>
          </div>

          {/* Answered count */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-200/60 [animation:fadeInPlace_0.3s_ease-out]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
              {answeredCount}
              <span className="hidden sm:inline"> / {totalQuestions}</span>
            </span>
          </div>
        </div>

        {/*
          Progressraden. Spåret har alltid sin fulla höjd och bredd, så den
          reserverar sin plats från första målningen. Fyllningen skalas med
          transform i stället för att animera `width`: en width-animation
          räknas om i layouten varje bildruta, en transform gör det inte.
        */}
        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full w-full origin-left rounded-full bg-orange-600 transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${progressPercent / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}
