'use client';

/**
 * Streak14Days
 * ------------
 * 14-dagars streak-rutnät. Senaste dagen (idag) markeras med ring.
 * Aktiva dagar = orange/röd gradient med flamm-ikon.
 *
 * Datakontrakt:
 *   history — boolean[14], äldsta först, idag sist.
 *             Kan byggas från xp_history-tabellen genom att gruppera
 *             på dag och kolla om totalXp > 0.
 *
 *             SQL-skiss:
 *               select date_trunc('day', created_at) as day, sum(xp) as xp
 *               from xp_history
 *               where user_id = $1
 *                 and created_at >= now() - interval '14 days'
 *               group by 1 order by 1;
 *             Mappa sen till 14-element-array.
 */

import { Flame, Zap } from 'lucide-react';

interface Streak14DaysProps {
  history: boolean[];
}

export default function Streak14Days({ history }: Streak14DaysProps) {
  const safe = history.length === 14 ? history : padTo14(history);
  const activeCount = safe.filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Senaste 14 dagarna</h3>
        <span className="text-xs text-slate-500">{activeCount} aktiva dagar</span>
      </div>
      <div className="flex gap-1.5">
        {safe.map((active, i) => {
          const isToday = i === safe.length - 1;
          const daysAgo = safe.length - 1 - i;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                  active
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-300'
                } ${isToday ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
              >
                {active && <Flame className="w-4 h-4" strokeWidth={2.5} />}
              </div>
              <div className={`text-[10px] tabular-nums ${isToday ? 'font-bold text-orange-600' : 'text-slate-400'}`}>
                {daysAgo === 0 ? 'Idag' : `-${daysAgo}`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
        <Zap className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
        <span>Skapa ett brev eller analys idag för att hålla streaken vid liv.</span>
      </div>
    </div>
  );
}

function padTo14(arr: boolean[]): boolean[] {
  const result = new Array(14).fill(false);
  const start = Math.max(0, 14 - arr.length);
  for (let i = 0; i < arr.length && i < 14; i++) result[start + i] = arr[i];
  return result;
}
