'use client'

/**
 * Figurer och mönster i ramen (plan-testflode-2026-11-20 avsnitt 3.2), samma
 * uppgift i alla lägen: matrisen, frågan och sex svar.
 *
 *   Mobil   matrisen 264 × 264 centrerad, frågan under, sex rutor 3 × 2 à
 *           121 × 96. Cirka 510 px, svaren syns utan att rulla på Pixel 7.
 *   Dator   innehållsformen Smal (432): matrisen 336 × 336, sex rutor 3 × 2
 *           à 133 × 104. Cirka 600 px av 766.
 *
 * Efter facit (Träna och genomgången) fylls luckan med rätt figur i bläck och
 * 2 px positiv ram. Ingen svårighetsrad och inget reglage för förklarande
 * text: en uppgift ser ut som i det riktiga testet.
 *
 * Figurerna är V7-renderarna inne i .matrisyta, så att de följer bläck och
 * papper i mörkt läge. Alla rutor har aspect-ratio (CLS 0).
 */

import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import { SvarRuta, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'

export interface MatrisU extends RamUppgift {
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

export const MATRIS_FRAGA = 'Vilken figur passar i den tomma rutan?'

/** Matrisen med luckan; efter facit står rätt figur i luckan. */
export function Matrisen({ grid, fylld = null }: { grid: (LayeredCell | null)[][]; fylld?: LayeredCell | null }) {
  const kolumner = grid[0]?.length ?? 3
  return (
    <div className="matrisyta sess-matris mx-auto rounded-xl border border-kant bg-papper p-2" data-matris>
      <div
        role="img"
        aria-label={fylld ? 'Matris med nio figurer, rätt figur i den tomma rutan' : 'Matris med åtta figurer och en tom ruta'}
        className="grid h-full w-full gap-px overflow-hidden rounded-[6px] bg-kant"
        style={{ gridTemplateColumns: `repeat(${kolumner}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell, i) =>
          cell ? (
            <div key={i} className="flex aspect-square items-center justify-center bg-papper">
              <FigurV7 cell={cell} />
            </div>
          ) : fylld ? (
            <div key={i} className="sess-lucka-matris flex aspect-square items-center justify-center bg-papper" data-lucka="fylld">
              <FigurV7 cell={fylld} />
            </div>
          ) : (
            <div key={i} className="flex aspect-square items-center justify-center bg-papper-2" data-lucka="tom">
              <LuckaV7 />
            </div>
          )
        )}
      </div>
    </div>
  )
}

export function MatrisUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<MatrisU>) {
  const fylld = facit != null ? u.options[facit] ?? null : null
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-matris-uppgift>
      <Matrisen grid={u.grid} fylld={fylld} />
      <h2 tabIndex={-1} data-uppgift-rubrik className="text-fraga text-center text-ink-1 outline-none">
        {MATRIS_FRAGA}
      </h2>
      <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta sess-alt sess-alt-matris" data-matris-alt>
        {u.options.map((o, i) => (
          <SvarRuta
            key={i}
            i={i}
            tillstand={tillstandFor(i, vald, facit)}
            ditt={facit != null && vald === i}
            efterFel={efterFel}
            disabled={last}
            onValj={onValj}
            className="sess-ruta"
          >
            <FigurV7 cell={o} />
          </SvarRuta>
        ))}
      </div>
    </div>
  )
}

export const MATRIS: TypRitare<MatrisU> = {
  kind: 'matris',
  namn: 'Figurer och mönster',
  form: 'smal',
  antalAlternativ: (u) => u.options.length,
  Uppgift: MatrisUppgift,
}
