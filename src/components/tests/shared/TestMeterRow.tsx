'use client'

/**
 * Mätraden i provskalets toppdel: klocka, fråga X av Y, besvarade.
 *
 * Tidigare låg samma tre värden i varje testtyps egen header, som ett eget
 * sticky block med egen bakgrund och egen progressrad. När provet blev ett
 * helskärmsläge (TestFlowShell) behövdes bara innehållet, inte ännu ett
 * skal. Raden är därför avsiktligt platt: en rad, inga kort, ingen egen
 * kantlinje. Skalet äger ramen.
 *
 * Klockan kan räkna både upp (övningstest) och ner (prov med tidsgräns).
 * `urgent` färgar den när tiden håller på att ta slut.
 */

import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface TestMeterRowProps {
  /** Formaterad tid, till exempel "02:41". */
  time: string
  /** Sista minuten eller liknande: klockan blir röd och varnar. */
  critical?: boolean
  /** Snart slut: klockan blir gul. */
  low?: boolean
  /** Etikett för räknaren i mitten, "Fråga" eller "Passage". */
  counterLabel?: string
  /** Ettbaserat nummer. */
  current: number
  total: number
  /** Antal besvarade. Utelämnas när testet inte räknar det. */
  answered?: number
}

export default function TestMeterRow({
  time,
  critical,
  low,
  counterLabel = 'Fråga',
  current,
  total,
  answered,
}: TestMeterRowProps) {
  const timeTone = critical
    ? 'bg-red-50 border-red-200 text-red-700'
    : low
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : 'bg-orange-50 border-orange-200/60 text-orange-700'

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${timeTone}`}
      >
        {critical ? (
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
        <span className="font-mono text-xs font-bold tabular-nums sm:text-sm">
          {time}
        </span>
      </div>

      <p className="text-xs font-semibold tabular-nums text-neutral-600">
        <span className="uppercase tracking-wider text-neutral-500">
          {counterLabel}{' '}
        </span>
        <span className="text-sm font-bold text-neutral-900">{current}</span>
        <span className="text-neutral-400"> / {total}</span>
      </p>

      {typeof answered === 'number' ? (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
          <span className="text-xs font-bold tabular-nums text-emerald-700 sm:text-sm">
            {answered}
            <span className="hidden sm:inline"> / {total}</span>
          </span>
        </div>
      ) : (
        <span className="w-[52px]" aria-hidden="true" />
      )}
    </div>
  )
}
