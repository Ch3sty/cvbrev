'use client'

// Figurseriernas delar på resultatskärmen: miniatyrerna av missarna och
// tempostapeln mot provets tid. Samma i alla fyra lägen.

import { SerieMiniatyr } from '@/components/tests/serie/FigurserieRad'
import type { FigurserieU } from '../typer/Figurserie'

/** Upp till sex missar som små remsor; tre på mobil. */
export function Miniatyrer({ poster }: { poster: { u: FigurserieU; ratt: number | null }[] }) {
  if (!poster.length) return null
  return (
    <ul className="flex flex-col items-start gap-2 lg:flex-row lg:flex-wrap lg:gap-3" aria-hidden="true" data-miniatyrer>
      {poster.slice(0, 6).map((p, i) => (
        <li key={p.u.nyckel} className={i >= 3 ? 'hidden lg:block' : undefined}>
          <SerieMiniatyr rad={p.u.rad} form={p.u.form} ratt={p.u.form === 'bryter' ? p.ratt : null} fast />
        </li>
      ))}
    </ul>
  )
}

/** Tid per uppgift mot provets tid: stapeln med budgetlinjen (som i den raderade FigurResultatVy). */
export function TempoStapel({ tidPer, budgetPer }: { tidPer: number; budgetPer: number }) {
  const max = Math.max(tidPer, budgetPer) * 1.15
  const andel = max > 0 ? tidPer / max : 0
  const linje = max > 0 ? budgetPer / max : 0
  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full rounded-full bg-papper-2" role="img" aria-label={`Tid ${tidPer} sekunder per uppgift mot provets ${budgetPer}`}>
        <i className="absolute inset-y-0 left-0 block rounded-full bg-koppar" style={{ width: `${(andel * 100).toFixed(1)}%` }} />
        <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: `calc(${(linje * 100).toFixed(1)}% - 1px)` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] leading-4 tabular-nums text-ink-3">
        <span>{tidPer} s per uppgift</span>
        <span>provets tid {budgetPer} s</span>
      </p>
    </div>
  )
}
