'use client'

// Figurer och mönster på resultatskärmen: missarna som små matriser, med
// rätt figur i luckan. Samma i alla lägen (nivåtest, Nivåkollen, Träna,
// övningsprov). Fast storlek, så att kortet inte flyttar sig (CLS 0).

import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import type { MatrisU } from '../typer/Matris'

function MiniMatris({ u, ratt }: { u: MatrisU; ratt: number | null }) {
  const fylld = ratt != null ? u.options[ratt] ?? null : null
  const kolumner = u.grid[0]?.length ?? 3
  return (
    <div className="matrisyta h-[76px] w-[76px] rounded-lg border border-kant bg-papper p-1">
      <div className="grid h-full w-full gap-px overflow-hidden rounded-[4px] bg-kant" style={{ gridTemplateColumns: `repeat(${kolumner}, minmax(0, 1fr))` }}>
        {u.grid.flat().map((c: LayeredCell | null, i) =>
          c ? (
            <span key={i} className="flex items-center justify-center bg-papper">
              <FigurV7 cell={c} />
            </span>
          ) : fylld ? (
            <span key={i} className="flex items-center justify-center bg-papper shadow-[inset_0_0_0_1.5px_var(--positiv)]">
              <FigurV7 cell={fylld} />
            </span>
          ) : (
            <span key={i} className="flex items-center justify-center bg-papper-2">
              <LuckaV7 />
            </span>
          )
        )}
      </div>
    </div>
  )
}

/** Upp till sex missar; tre på mobil. */
export function MatrisMiniatyrer({ poster }: { poster: { u: MatrisU; ratt: number | null }[] }) {
  if (!poster.length) return null
  return (
    <ul className="flex flex-wrap items-start gap-2 lg:gap-3" aria-hidden="true" data-miniatyrer>
      {poster.slice(0, 6).map((p, i) => (
        <li key={p.u.nyckel} className={i >= 3 ? 'hidden lg:block' : undefined}>
          <MiniMatris u={p.u} ratt={p.ratt} />
        </li>
      ))}
    </ul>
  )
}
