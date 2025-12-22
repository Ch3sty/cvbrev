'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, ArrowRight, Star } from 'lucide-react';

interface ProgressionCardProps {
  currentLevel: number;
  levelTitle: string;
  xpProgress?: number;
  xpNeeded?: number;
}

export default function ProgressionCard({
  currentLevel,
  levelTitle,
  xpProgress = 0,
  xpNeeded = 100
}: ProgressionCardProps) {
  const progressPercentage = xpNeeded > 0 ? Math.min((xpProgress / xpNeeded) * 100, 100) : 0;

  return (
    <Link href="/dashboard/rewards" className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all h-full relative overflow-hidden"
      >
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Din progression</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Level display */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">Level {currentLevel}</span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{levelTitle}</p>

          {/* Progress bar to next level */}
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Till Level {currentLevel + 1}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
