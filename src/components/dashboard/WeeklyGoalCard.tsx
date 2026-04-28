'use client';

import { motion } from 'framer-motion';
import { useWeeklyGoal } from '@/hooks/use-weekly-goal';

interface DailyXp {
  date: string;
  xp: number;
}

interface WeeklyGoalCardProps {
  /** 28 dagar äldsta först. Vi använder de senaste 7 för dagsstaplarna. */
  dailyXp: DailyXp[];
}

/**
 * Veckomål-kort som matchar designerns prototyp:
 * - VECKAN-rubrik
 * - "X / Y XP" (stort) + progressbar
 * - "X dagar kvar till veckoreset"
 * - 7 mini-staplar (Mån..Sön) — höjd proportionell mot XP per dag
 *
 * Återanvänder useWeeklyGoal() för weekly_xp + weekly_goal_xp + daysUntilReset.
 * Dagsstaplarna byggs från dailyXp[] (senaste 7 dagar).
 */
export default function WeeklyGoalCard({ dailyXp }: WeeklyGoalCardProps) {
  const { weekly_xp, weekly_goal_xp, progress, daysUntilReset, loading } = useWeeklyGoal();

  // Senaste 7 dagar för dagsstaplarna (Mån..Sön i veckan)
  // dailyXp är 28 dagar äldsta först. Vi vill ha innevarande veckas Mån..Sön.
  const today = new Date();
  const todayMon = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  // Plocka 7 dagar baserat på måndagen denna vecka
  const startIdx = 27 - todayMon;
  const week7: { xp: number; isToday: boolean; isFuture: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = startIdx + i;
    const d = idx >= 0 && idx <= 27 ? dailyXp[idx] : null;
    const isToday = i === todayMon;
    const isFuture = i > todayMon;
    week7.push({
      xp: d?.xp ?? 0,
      isToday,
      isFuture,
    });
  }

  const maxXp = Math.max(50, ...week7.map(d => d.xp));
  const dayLabels = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col"
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
        Veckan
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
          {loading ? '…' : weekly_xp}
        </span>
        <span className="text-base text-slate-500 font-medium">
          / {weekly_goal_xp} XP
        </span>
      </div>

      {/* Progressbar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-orange-400 to-red-500"
        />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {daysUntilReset === 1
          ? '1 dag kvar till veckoreset'
          : `${daysUntilReset} dagar kvar till veckoreset`}
      </p>

      {/* Dagsstaplar */}
      <div className="mt-auto">
        <div
          className="grid items-end gap-1.5 h-16 mb-1"
          style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
        >
          {week7.map((d, i) => {
            const isActive = d.xp > 0;
            // Aktiva dagar: 60-100% av container baserat pa xp/maxXp.
            // Inaktiva (bara idag-cellen ska visas som streckad mini-stub) eller passé-dagar far en tunn linje.
            let heightPx: number;
            if (d.isFuture) {
              heightPx = 0;
            } else if (isActive) {
              const ratio = Math.min(1, d.xp / maxXp);
              heightPx = Math.round(28 + ratio * 36); // 28-64px
            } else {
              heightPx = 6; // tunn inaktiv linje
            }
            return (
              <div
                key={i}
                className={`w-full rounded-md transition-all ${
                  d.isFuture
                    ? 'bg-transparent'
                    : isActive
                    ? d.isToday
                      ? 'bg-orange-500'
                      : 'bg-orange-300'
                    : d.isToday
                    ? 'bg-orange-200'
                    : 'bg-slate-100'
                }`}
                style={{ height: `${heightPx}px` }}
              />
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-[10px] ${
                week7[i].isToday ? 'font-bold text-orange-600' : 'text-slate-400'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
