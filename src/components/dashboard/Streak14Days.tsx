'use client';

import { Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Streak14DaysProps {
  /** 14 element, äldsta först. true = aktiv dag, false = miss. Index 13 = idag. */
  history: boolean[];
}

/**
 * 14-dagars streak-rutnät. Visar en flamma per aktiv dag, idag highlightas
 * med en orange ring. Matchar prototypen i
 * prototypes/dashboard/variant-streak.jsx (komponenten StreakHistory).
 */
export default function Streak14Days({ history }: Streak14DaysProps) {
  // Defensivt: padda till exakt 14 element om kallaren skickar färre
  const days = history.length === 14
    ? history
    : [...new Array(Math.max(0, 14 - history.length)).fill(false), ...history].slice(-14);

  const activeCount = days.filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Senaste 14 dagarna</h3>
        <span className="text-xs text-slate-500 tabular-nums">
          {activeCount} aktiva dagar
        </span>
      </div>

      <div className="flex gap-1.5">
        {days.map((active, i) => {
          const isToday = i === days.length - 1;
          const daysAgo = days.length - 1 - i;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                  active
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-300'
                } ${isToday ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
              >
                {active && <Flame className="w-4 h-4" strokeWidth={2.5} />}
              </div>
              <div
                className={`text-[10px] tabular-nums ${
                  isToday ? 'font-bold text-orange-600' : 'text-slate-400'
                }`}
              >
                {isToday ? 'Idag' : `-${daysAgo}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2.5} />
        <span>Skapa ett brev eller analys idag för att hålla streaken vid liv.</span>
      </div>
    </motion.div>
  );
}
