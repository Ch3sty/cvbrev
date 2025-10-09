'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TestTimerProps {
  startedAt: string;
  onTimeUpdate?: (seconds: number) => void;
}

export const TestTimer: React.FC<TestTimerProps> = ({ startedAt, onTimeUpdate }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const seconds = Math.floor((now - start) / 1000);
      setElapsed(seconds);
      onTimeUpdate?.(seconds);
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, onTimeUpdate]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-300 rounded-lg">
      <Clock className="w-5 h-5 text-purple-600" />
      <span className="text-lg font-mono font-semibold text-gray-800">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
