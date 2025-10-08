'use client';

import { useState, useEffect } from 'react';

interface TestTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

export function TestTimer({ totalSeconds, onTimeUp }: TestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft === 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = (secondsLeft / totalSeconds) * 100;

  // Color coding
  const getColorClass = () => {
    if (progressPercent > 50) return 'bg-green-500';
    if (progressPercent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {/* Time display */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Återstående tid</span>
        <span className={`text-2xl font-bold ${progressPercent < 20 ? 'text-red-600' : 'text-gray-900'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${getColorClass()}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Warning message */}
      {progressPercent < 10 && (
        <div className="mt-2 text-sm text-red-600 font-medium animate-pulse">
          ⚠️ Mindre än 2 minuter kvar!
        </div>
      )}
    </div>
  );
}
