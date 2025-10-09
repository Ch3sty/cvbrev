'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
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
  startedAt
}: TestHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b-2 border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Top row: Stats */}
        <div className="flex items-center justify-between mb-3">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-mono font-semibold text-blue-700">{elapsedTime}</span>
          </motion.div>

          {/* Question number */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-slate-500 font-medium">Fråga</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {currentQuestion + 1} / {totalQuestions}
            </p>
          </motion.div>

          {/* Answered count */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {answeredCount} besvarade
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-2 bg-slate-200 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
}
