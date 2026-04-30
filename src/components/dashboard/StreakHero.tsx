'use client';

/**
 * StreakHero
 * ----------
 * Hjälte-kort som lyfter användarens daglig-streak. Ersätter WelcomeHero
 * när användaren har påbörjat sin gamification-resa (totalLetters > 0
 * eller daily_streak > 0).
 *
 * Datakontrakt:
 *   firstName       — från profile.full_name (split) eller user.user_metadata
 *   dailyStreak     — global_user_stats.daily_streak
 *   longestStreak   — global_user_stats.longest_streak
 *   dailyXpEarned   — beräknat från xp_history idag
 *   dailyCap        — 100 (fritt) / Infinity (premium) — visas bara för fritt
 *   currentLevel    — global_user_stats.current_level
 *   levelTitle      — level_titles.title joinad
 */

import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';

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
  const greeting = getTimeGreeting();
  const headline = firstName ? `${greeting}, ${firstName}!` : greeting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" aria-hidden="true" />
            Din dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {headline}
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            {dailyStreak > 0 ? (
              <>
                Du har haft{' '}
                <span className="text-orange-600 font-semibold">
                  {dailyStreak} {dailyStreak === 1 ? 'dag' : 'dagar'} i rad
                </span>{' '}
                — fortsätt din streak idag.
              </>
            ) : (
              <>Bra att se dig igen. Skapa ett brev eller analys idag för att starta en streak.</>
            )}
          </p>
        </div>

        {/* Level + streak pillere — ger headern visuell tyngd */}
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
              <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
              Bästa: {longestStreak} {longestStreak === 1 ? 'dag' : 'dgr'}
            </span>
          )}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
        }}
      >
        <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none">
          <Flame className="w-56 h-56 sm:w-64 sm:h-64" strokeWidth={1} />
        </div>
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80 mb-3">Din streak</div>
          <div className="flex items-end gap-3 mb-1">
            <div className="text-6xl sm:text-7xl font-extrabold leading-none tabular-nums">{dailyStreak}</div>
            <div className="pb-2">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-base sm:text-lg font-medium opacity-95 mb-5">
            {dailyStreak === 1 ? 'dag i rad' : 'dagar i rad'}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/20">
            <Stat label="Längsta" value={`${longestStreak} ${longestStreak === 1 ? 'dag' : 'dagar'}`} />
            <Divider />
            <Stat
              label="Idag"
              value={dailyCap === Infinity ? `${dailyXpEarned} XP` : `${dailyXpEarned} / ${dailyCap} XP`}
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
      <div className="text-[11px] uppercase tracking-wider opacity-70 mb-0.5">{label}</div>
      <div className="font-bold text-base sm:text-lg tabular-nums">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/20 hidden sm:block" />;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'God natt';
  if (h < 10) return 'God morgon';
  if (h < 17) return 'Hej';
  if (h < 22) return 'God kväll';
  return 'God natt';
}
