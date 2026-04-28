'use client';

import { useState } from 'react';
import { Flame, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyXp {
  date: string; // YYYY-MM-DD
  xp: number;
}

interface ThisWeekStreakProps {
  /** 28 element, äldsta först. Index 27 = idag. */
  dailyXp: DailyXp[];
}

/**
 * "Den här veckan" — visar 7 stora rutor (M T O T F L S) för innevarande vecka.
 * Expander fäller ut 4-veckors-heatmap (GitHub-style intensitetsfärger).
 *
 * Filnamnet är kvar (Streak14Days) för minimal diff i page.tsx, men komponenten
 * heter nu ThisWeekStreak och visar antingen 7 eller 28 dagar.
 */
export default function ThisWeekStreak({ dailyXp }: ThisWeekStreakProps) {
  const [expanded, setExpanded] = useState(false);

  // Padda till 28 element om callern skickar färre
  const days = dailyXp.length === 28
    ? dailyXp
    : [
        ...new Array(Math.max(0, 28 - dailyXp.length)).fill(null).map((_, i) => ({
          date: '',
          xp: 0,
        })),
        ...dailyXp,
      ].slice(-28);

  // Måndag-baserad veckostart i Stockholm-tid
  const todayLocal = new Date();
  const dayOfWeekMonBased = (todayLocal.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const startOfWeekIndex = 27 - dayOfWeekMonBased;

  // 7 element för innevarande vecka (Mån..Sön), null = framtida dag
  const thisWeek: (DailyXp | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = startOfWeekIndex + i;
    if (idx <= 27 && idx >= 0) {
      thisWeek.push(days[idx]);
    } else {
      thisWeek.push(null);
    }
  }

  const activeDaysThisWeek = thisWeek.filter(d => d && d.xp > 0).length;
  const todayDayIndex = dayOfWeekMonBased; // 0..6 (Mon..Sun)

  // För heatmap: gruppera 28 dagar i 4 veckor (måndag-söndag)
  // Räkna antal aktiva dagar totalt
  const activeDays28 = days.filter(d => d.xp > 0).length;

  const dayLabelsShort = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  const dayLabelsLong = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  function intensityClass(xp: number): string {
    if (xp <= 0) return 'bg-slate-100';
    if (xp < 50) return 'bg-orange-200';
    if (xp < 100) return 'bg-orange-400';
    return 'bg-red-500';
  }

  // Bygg heatmap-grid: 4 veckor × 7 dagar
  // Beräkna måndag-baserad start för 4-veckorsfönstret
  const weeks: { weekNumber: number; days: ({ xp: number; date: string; isToday: boolean } | null)[] }[] = [];
  // Dagens datum (Stockholm)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMon = (today.getDay() + 6) % 7;
  const startMonday = new Date(today);
  startMonday.setDate(startMonday.getDate() - todayMon - 21); // 4 veckor bakåt

  for (let w = 0; w < 4; w++) {
    const weekDays: ({ xp: number; date: string; isToday: boolean } | null)[] = [];
    const monday = new Date(startMonday);
    monday.setDate(startMonday.getDate() + w * 7);
    // ISO-veckonummer
    const weekNumber = getISOWeekNumber(monday);

    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + d);
      const dayKey = day.toISOString().slice(0, 10);
      const todayKey = today.toISOString().slice(0, 10);
      // Hitta motsvarande XP-värde i days[]
      const match = days.find(x => x.date === dayKey);

      // Framtida dag = null
      if (day > today) {
        weekDays.push(null);
      } else {
        weekDays.push({
          xp: match?.xp ?? 0,
          date: dayKey,
          isToday: dayKey === todayKey,
        });
      }
    }

    weeks.push({ weekNumber, days: weekDays });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 p-5"
    >
      {/* Rubrik */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Den här veckan</h3>
          <p className="text-xs text-slate-500 mt-0.5">En streak byggs en dag i taget</p>
        </div>
        <span className="text-sm font-bold text-orange-600 tabular-nums whitespace-nowrap">
          {activeDaysThisWeek} av 7 dagar
        </span>
      </div>

      {/* Veckodagar */}
      <div className="grid gap-1.5 sm:gap-2 mb-2" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
        {dayLabelsShort.map((label, i) => (
          <div
            key={i}
            className={`text-center text-[11px] font-semibold ${
              i === todayDayIndex ? 'text-orange-600' : 'text-slate-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 7 stora rutor */}
      <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
        {thisWeek.map((day, i) => {
          const isToday = i === todayDayIndex;
          const isFuture = i > todayDayIndex;
          const isActive = day && day.xp > 0;

          if (isActive) {
            return (
              <div
                key={i}
                className={`w-full h-12 sm:h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm ${
                  isToday ? 'ring-2 ring-offset-2 ring-orange-500' : ''
                }`}
              >
                <Flame className="w-5 h-5" strokeWidth={2.5} />
              </div>
            );
          }

          if (isToday) {
            // Idag, ingen aktivitet ännu — streckad ring + plus
            return (
              <div
                key={i}
                className="w-full h-12 sm:h-14 rounded-lg flex items-center justify-center border-2 border-dashed border-orange-400 text-orange-500"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </div>
            );
          }

          // Tidigare dag utan aktivitet eller framtida dag
          return (
            <div
              key={i}
              className={`w-full h-12 sm:h-14 rounded-lg ${
                isFuture ? 'bg-slate-50' : 'bg-slate-100'
              }`}
            />
          );
        })}
      </div>

      {/* Expander-knapp */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Flame className="w-4 h-4" strokeWidth={2.5} />
          {expanded ? 'Dölj historik' : 'Visa senaste 4 veckorna'}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Heatmap (expanderad) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Senaste 4 veckorna · {activeDays28} aktiva dagar
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span>Mindre</span>
                  <div className="w-3 h-3 rounded bg-slate-100" />
                  <div className="w-3 h-3 rounded bg-orange-200" />
                  <div className="w-3 h-3 rounded bg-orange-400" />
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>Mer</span>
                </div>
              </div>

              {/* Heatmap-grid: 4 kolumner (veckor) × 7 rader (dagar) */}
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'auto repeat(4, minmax(0, 1fr))' }}>
                {/* Header-rad: tom + veckonummer */}
                <div />
                {weeks.map((w, wi) => (
                  <div
                    key={`wh-${wi}`}
                    className="text-[10px] font-semibold text-slate-400 text-center"
                  >
                    v.{w.weekNumber}
                  </div>
                ))}

                {/* 7 rader (Mån..Sön) */}
                {dayLabelsLong.map((label, di) => (
                  <div key={`row-${di}`} className="contents">
                    <div className="text-[10px] font-semibold text-slate-400 pr-1 flex items-center">
                      {label[0]}
                    </div>
                    {weeks.map((w, wi) => {
                      const cell = w.days[di];
                      if (!cell) {
                        return (
                          <div
                            key={`cell-${wi}-${di}`}
                            className="h-5 rounded bg-transparent"
                          />
                        );
                      }
                      return (
                        <div
                          key={`cell-${wi}-${di}`}
                          className={`h-5 rounded ${intensityClass(cell.xp)} ${
                            cell.isToday ? 'ring-2 ring-orange-500 ring-offset-1' : ''
                          }`}
                          title={`${cell.date}: ${cell.xp} XP`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Hjälpare: ISO-veckonummer (måndag-baserat, samma som Sverige använder)
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
