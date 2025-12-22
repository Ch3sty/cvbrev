'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Gift, ArrowRight, Sparkles } from 'lucide-react';

interface RewardsHeroCardProps {
  currentLevel: number;
  levelTitle: string;
  totalXp: number;
  xpToNextLevel: number;
  totalXpForNextLevel: number;
  unlockedRewards: number;
  totalRewards: number;
  hasUnclaimedReward?: boolean;
}

export default function RewardsHeroCard({
  currentLevel,
  levelTitle,
  totalXp,
  xpToNextLevel,
  totalXpForNextLevel,
  unlockedRewards,
  totalRewards,
  hasUnclaimedReward = false
}: RewardsHeroCardProps) {
  // Beräkna progress till nästa level
  const xpProgress = totalXpForNextLevel > 0
    ? Math.min(((totalXpForNextLevel - xpToNextLevel) / totalXpForNextLevel) * 100, 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Belöningar Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
      >
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full translate-y-8 -translate-x-8" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dina Belöningar</h2>
              <p className="text-sm text-emerald-700">Samla XP och lås upp förmåner</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">{unlockedRewards}</span>
            <span className="text-lg text-slate-600">/ {totalRewards}</span>
            <span className="text-sm text-slate-500">upplåsta</span>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            {totalRewards - unlockedRewards} belöningar kvar att låsa upp
          </p>

          {/* Unclaimed reward indicator */}
          {hasUnclaimedReward && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg"
            >
              <Gift className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Du har en belöning att hämta!</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Level Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
      >
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/30 to-purple-200/30 rounded-full translate-y-8 -translate-x-8" />

        <div className="relative z-10">
          {/* Header med Level Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                >
                  {currentLevel}
                </motion.div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Level {currentLevel}</h2>
                <p className="text-sm text-purple-700 font-medium">{levelTitle}</p>
              </div>
            </div>
          </div>

          {/* XP Stats */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalXp.toLocaleString()}</span>
              <span className="text-sm text-slate-500">XP totalt</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Framsteg till Level {currentLevel + 1}</span>
              <span className="font-semibold text-purple-700">{Math.round(xpProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{xpToNextLevel.toLocaleString()} XP kvar</span>
              <span>{totalXpForNextLevel.toLocaleString()} XP behövs</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
