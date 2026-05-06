'use client';

/**
 * StreakHero
 * ----------
 * Hjalte-kort som lyfter anvandarens dagliga streak OCH veckans gratiskvotor
 * (eller Premium-status) i samma kort.
 *
 * Layout:
 * - Vanster (60% pa desktop): streak-stats (DU HAR HAFT / siffra / dagar i rad / Langsta · Idag · Level)
 * - Hoger (40% pa desktop): veckokvotor med reset-info eller Premium-status
 * - Mobil: stackas vertikalt
 *
 * Halsning ligger i headern (inte har).
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Flame, Crown, Check, ArrowRight } from 'lucide-react';
import {
  IconKvotorTimer,
  IconKvotorPremium,
} from './illustrations/DashboardIcons';

interface StreakHeroProps {
  firstName?: string;
  dailyStreak: number;
  longestStreak: number;
  dailyXpEarned?: number;
  dailyCap?: number;
  currentLevel: number;
  levelTitle: string;
  // Kvota-data
  isPremium: boolean;
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  weeklyLinkedInCount: number;
  letterResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
}

const FREE_LIMITS = {
  letters: 7,
  analyses: 1,
  linkedin: 1,
};

export default function StreakHero({
  firstName,
  dailyStreak,
  longestStreak,
  dailyXpEarned = 0,
  dailyCap = 100,
  currentLevel,
  levelTitle,
  isPremium,
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  letterResetDate,
  premiumUntil,
  premiumSource,
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
              <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
              Bästa: {longestStreak} {longestStreak === 1 ? 'dag' : 'dgr'}
            </span>
          )}
        </div>
      </div>

      {/* Streak-banner med kvotor */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
        }}
      >
        {/* Bakgrunds-eld bakom streak-stats (vanster kolumn pa desktop) */}
        <div className="absolute left-1/3 -translate-x-1/2 -top-8 opacity-15 pointer-events-none hidden lg:block">
          <Flame className="w-44 h-44" strokeWidth={1} />
        </div>

        {/* Bakgrunds-ikon bakom kvotor (hoger kolumn pa desktop) */}
        <div className="absolute right-2 -bottom-6 opacity-10 pointer-events-none hidden lg:block text-white">
          {isPremium ? (
            <IconKvotorPremium className="w-48 h-48" />
          ) : (
            <IconKvotorTimer className="w-44 h-44" />
          )}
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8">
          {/* Vanster: streak-stats */}
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-85 mb-3">
              {dailyStreak > 0 ? 'Du har haft' : 'Starta din streak'}
            </div>
            <div className="flex items-end gap-3 mb-1">
              <div className="text-6xl sm:text-7xl font-black leading-none tabular-nums">
                {dailyStreak}
              </div>
              <div className="pb-2">
                <Flame className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
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

          {/* Hoger: kvotor (vertikal-divider pa desktop) */}
          <div className="lg:border-l lg:border-white/20 lg:pl-8">
            <StreakKvotor
              isPremium={isPremium}
              weeklyLetterCount={weeklyLetterCount}
              weeklyAnalysisCount={weeklyAnalysisCount}
              weeklyLinkedInCount={weeklyLinkedInCount}
              letterResetDate={letterResetDate}
              premiumUntil={premiumUntil}
              premiumSource={premiumSource}
            />
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

// =============================================================
// Veckokvotor inom streak-bannern
// =============================================================

interface StreakKvotorProps {
  isPremium: boolean;
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  weeklyLinkedInCount: number;
  letterResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
}

function StreakKvotor({
  isPremium,
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  letterResetDate,
  premiumUntil,
  premiumSource,
}: StreakKvotorProps) {
  const isTrialUser =
    premiumSource === 'signup_trial' ||
    premiumSource === 'oauth_signup_trial' ||
    premiumSource === 'onboarding_completion' ||
    premiumSource === 'guest_invitation';
  const daysRemaining = getDaysRemaining(premiumUntil);

  const rows: KvotaRow[] = [
    {
      label: 'Brev',
      used: weeklyLetterCount,
      limit: FREE_LIMITS.letters,
    },
    {
      label: 'CV-analys',
      used: weeklyAnalysisCount,
      limit: FREE_LIMITS.analyses,
    },
    {
      label: 'LinkedIn',
      used: weeklyLinkedInCount,
      limit: FREE_LIMITS.linkedin,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        {isPremium ? (
          <>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] opacity-90 mb-0.5">
              <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
              Premium aktivt
            </div>
            <div className="text-xs opacity-80">
              {isTrialUser && daysRemaining !== null
                ? `${daysRemaining} ${daysRemaining === 1 ? 'dag' : 'dagar'} kvar av provperiod`
                : premiumUntil
                ? `Förnyas ${formatDate(premiumUntil)}`
                : 'Obegränsad åtkomst'}
            </div>
          </>
        ) : (
          <>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] opacity-90 mb-0.5">
              Veckans gratiskvot
            </div>
            {letterResetDate && (
              <div className="text-xs opacity-80">
                Nollställs {relativeDateLabel(letterResetDate)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rader */}
      <div className="flex-1 space-y-3">
        {rows.map((row) => (
          <KvotaRowItem key={row.label} row={row} isPremium={isPremium} />
        ))}
      </div>

      {/* CTA */}
      {!isPremium && (
        <Link
          href="/dashboard/profil/prenumeration"
          className="group mt-5 flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-white text-orange-700 font-black text-xs sm:text-sm hover:bg-orange-50 transition-colors"
          style={{
            boxShadow: '0 6px 16px -4px rgba(0, 0, 0, 0.18)',
          }}
        >
          Lås upp obegränsat med Jobbcoach Premium
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      )}

      {isPremium && isTrialUser && (
        <Link
          href="/dashboard/profil/prenumeration"
          className="mt-5 flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl border border-white/30 text-white/90 font-bold text-xs hover:bg-white/10 transition-colors"
        >
          Hantera prenumeration
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

interface KvotaRow {
  label: string;
  used: number;
  limit: number;
}

function KvotaRowItem({
  row,
  isPremium,
}: {
  row: KvotaRow;
  isPremium: boolean;
}) {
  if (isPremium) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold opacity-95">{row.label}</span>
        <span className="inline-flex items-center gap-1 text-xs font-black opacity-90">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
          Obegränsat
        </span>
      </div>
    );
  }

  const pct =
    row.limit === 0
      ? 0
      : Math.min(100, Math.round((row.used / row.limit) * 100));
  const isFull = row.used >= row.limit;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold opacity-95">{row.label}</span>
        <span className="text-xs font-black tabular-nums">
          <span className={isFull ? 'opacity-100' : 'opacity-95'}>
            {row.used}
          </span>
          <span className="opacity-60">/{row.limit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-white"
        />
      </div>
    </div>
  );
}

function getDaysRemaining(premiumUntil?: string | null): number | null {
  if (!premiumUntil) return null;
  const now = new Date();
  const until = new Date(premiumUntil);
  const diff = until.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  });
}

function relativeDateLabel(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'idag';
  if (days === 1) return 'imorgon';
  if (days < 7) return `om ${days} dagar`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
