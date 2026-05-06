'use client';

/**
 * StreakHero
 * ----------
 * Hjalte-kort som lyfter anvandarens dagliga streak.
 * Halsning ligger i headern, sa har visar vi level-pills + sjalva
 * streak-bannern.
 *
 * Datakontrakt:
 *   firstName       — anvands i empty-state ("Bra att se dig igen, Christian.")
 *   dailyStreak     — global_user_stats.daily_streak
 *   longestStreak   — global_user_stats.longest_streak
 *   dailyXpEarned   — beraknat fran xp_history idag
 *   dailyCap        — 100 (fritt) / Infinity (premium)
 *   currentLevel    — global_user_stats.current_level
 *   levelTitle      — level_titles.title joinad
 */

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { IconEld } from './illustrations/DashboardIcons';

interface StreakHeroProps {
  firstName?: string;
  dailyStreak: number;
  longestStreak: number;
  dailyXpEarned?: number;
  dailyCap?: number;
  currentLevel: number;
  levelTitle: string;
}

export default function StreakHero({
  firstName,
  dailyStreak,
  longestStreak,
  dailyXpEarned = 0,
  dailyCap = 100,
  currentLevel,
  levelTitle,
}: StreakHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-3"
    >
      {/* Eyebrow + level/basta-pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            aria-hidden="true"
          />
          Din streak
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.4)',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            Level {currentLevel}
            <span className="opacity-80">·</span>
            <span className="opacity-90 font-semibold">{levelTitle}</span>
          </span>
          {longestStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200">
              <IconEld className="w-3.5 h-3.5" />
              Bästa: {longestStreak} {longestStreak === 1 ? 'dag' : 'dgr'}
            </span>
          )}
        </div>
      </div>

      {/* Streak-banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
        }}
      >
        {/* Bakgrunds-eld */}
        <div className="absolute -right-6 -top-6 opacity-20 pointer-events-none">
          <IconEld className="w-56 h-56 sm:w-64 sm:h-64" />
        </div>

        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-85 mb-3">
            {dailyStreak > 0 ? 'Du har haft' : 'Starta din streak'}
          </div>
          <div className="flex items-end gap-3 mb-1">
            <div className="text-6xl sm:text-7xl font-black leading-none tabular-nums">
              {dailyStreak}
            </div>
            <div className="pb-2">
              <IconEld className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold opacity-95 mb-5">
            {dailyStreak === 1 ? 'dag i rad' : 'dagar i rad'}
            {dailyStreak === 0 && firstName && ` — sätt igång idag, ${firstName}.`}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/20">
            <Stat
              label="Längsta"
              value={`${longestStreak} ${longestStreak === 1 ? 'dag' : 'dagar'}`}
            />
            <Divider />
            <Stat
              label="Idag"
              value={
                dailyCap === Infinity
                  ? `${dailyXpEarned} XP`
                  : `${dailyXpEarned} / ${dailyCap} XP`
              }
            />
            <Divider />
            <Stat label="Level" value={`${currentLevel} · ${levelTitle}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider opacity-70 mb-0.5">
        {label}
      </div>
      <div className="font-black text-base sm:text-lg tabular-nums">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/20 hidden sm:block" />;
}
