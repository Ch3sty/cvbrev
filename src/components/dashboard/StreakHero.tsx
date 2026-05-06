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
              <FlameMini className="w-3.5 h-3.5" />
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
            'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
          boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
        }}
      >
        {/* Bakgrundseld - stylisk stroke-eld i hogra hornet, samma teknik som BackgroundDocStack */}
        <BackgroundFlame />

        {/* Subtila floating prickar (matchar CvHeroBanner-DNA) */}
        <FloatingDots />

        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-85 mb-3">
            {dailyStreak > 0 ? 'Du har haft' : 'Starta din streak'}
          </div>

          <div className="flex items-end gap-3 mb-1">
            <div className="text-6xl sm:text-7xl font-black leading-none tabular-nums">
              {dailyStreak}
            </div>
            <div className="pb-2">
              <FlameInline className="w-11 h-11 sm:w-12 sm:h-12" />
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

/**
 * BackgroundFlame - stor stylisk stroke-eld i hogra hornet.
 * Samma DNA som BackgroundDocStack pa CvHeroBanner: bara stroke,
 * ingen fyllning, opacity for att blanda in i gradient-bakgrunden.
 */
function BackgroundFlame() {
  return (
    <svg
      className="absolute pointer-events-none -right-12 -top-10 sm:-right-16 sm:-top-12"
      width={360}
      height={400}
      viewBox="0 0 360 400"
      fill="none"
      aria-hidden="true"
    >
      {/* Yttre flamma - stor stroke */}
      <path
        d="M 180 360 C 90 360 40 290 40 220 C 40 160 90 130 100 80 C 120 110 140 130 150 110 C 170 60 150 25 180 0 C 200 40 240 70 260 130 C 270 110 290 100 300 80 C 310 130 350 160 350 220 C 350 290 270 360 180 360 Z"
        stroke="white"
        strokeWidth="2.5"
        opacity="0.28"
      />
      {/* Inre flamma - mindre stroke */}
      <path
        d="M 180 320 C 110 320 70 270 70 220 C 70 180 100 160 110 130 C 130 150 140 160 150 150 C 170 110 170 80 180 60 C 200 100 220 130 230 160 C 240 150 250 140 260 130 C 270 170 290 190 290 230 C 290 280 250 320 180 320 Z"
        stroke="white"
        strokeWidth="2"
        opacity="0.2"
      />
      {/* Innersta gnista - liten stroke */}
      <path
        d="M 180 280 C 150 280 130 250 130 220 C 130 200 150 190 160 170 C 170 190 180 200 190 190 C 200 200 220 220 220 240 C 220 260 210 280 180 280 Z"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.18"
      />
    </svg>
  );
}

/**
 * FloatingDots - matchar CvHeroBanner-DNA i nedre vanstra hornet.
 */
function FloatingDots() {
  return (
    <div
      className="absolute pointer-events-none bottom-4 left-4 sm:bottom-6 sm:left-6 hidden sm:block"
      aria-hidden="true"
    >
      <svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <circle cx="20" cy="60" r="3" fill="white" opacity="0.18" />
        <circle cx="42" cy="68" r="2" fill="white" opacity="0.14" />
        <circle cx="10" cy="38" r="2" fill="white" opacity="0.12" />
      </svg>
    </div>
  );
}

/**
 * FlameInline - vit, ren eld som star bredvid streak-siffran.
 * Stylisk solidt vit istallet for IconEld:s gradient (sticker ut for mycket
 * mot orange-bakgrunden).
 */
function FlameInline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="streak-flame-inline" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="1" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Outline-flamma */}
      <path
        d="M 24 44 C 13 44 7 36 7 28 C 7 21 13 18 14 12 C 16 15 18 17 19 15 C 21 10 19 7 22 4 C 24 8 28 12 30 18 C 31 16 33 15 34 13 C 35 18 39 21 39 28 C 39 36 35 44 24 44 Z"
        fill="url(#streak-flame-inline)"
      />
      {/* Inre detalj som ger djup */}
      <path
        d="M 24 38 C 17 38 13 33 13 28 C 13 24 16 22 17 19 C 19 21 20 22 21 21 C 22 17 22 14 24 12 C 26 16 28 19 29 22 C 30 21 31 20 32 19 C 33 23 35 25 35 29 C 35 34 31 38 24 38 Z"
        fill="#F97316"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * FlameMini - liten eld for "Basta"-pillen.
 */
function FlameMini({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 8 14.5 C 4.5 14.5 2.5 12 2.5 9.5 C 2.5 7.5 4.5 6.5 4.5 4.5 C 5.5 5.5 6 6 6.5 5.5 C 7 4 6.5 3 7.5 1.5 C 8 3 9.5 4.5 10 6 C 10.5 5.5 11 5 11.5 4.5 C 11.5 6.5 13.5 7.5 13.5 9.5 C 13.5 12 11.5 14.5 8 14.5 Z"
        fill="#DC2626"
      />
    </svg>
  );
}
