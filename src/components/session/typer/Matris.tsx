'use client'

/**
 * Figurer och mönster i ramen (plan-testflode-2026-11-20 avsnitt 3.2, omgång 3
 * steg 2a: skissens Test-matris, Test-matris-expert, Mobil-matris och
 * Mobil-matris-facit), samma uppgift i alla lägen: brädet, frågan och sex svar.
 *
 *   Brädet  mörk yta med vita brickor och luckan som streckad kopparruta med
 *           ett frågetecken. Efter facit står rätt figur i luckan på grön
 *           bricka med grön ring.
 *   Mobil   brädet över hela bredden, frågan under och sex klossar 3 × 2 à
 *           86 px. Domen glider upp nedifrån, inget ovanför byter plats.
 *   Dator   brädet till vänster (420, 500 från xl), frågan, svaren och domen
 *           i spalten till höger (data-brade-layout="sida", globals.css), så
 *           att allt ryms på 1440 × 900 utan rullning.
 *
 * Utanför ramen (Uppgiftslistans utfällda rad, artikelns provruta) står allt
 * i en spalt med brädet högst 420 brett.
 *
 * Figurerna är V7-renderarna: på brickan i väggfärg (.sess-fig-ruta), i
 * klossarna i figurens bläck (.sess-fig), med tjock linje. Alla rutor har
 * aspect-ratio eller fast höjd (CLS 0).
 */

import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import { SvarRuta, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'

export interface MatrisU extends RamUppgift {
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

export const MATRIS_FRAGA = 'Vilken figur passar i den tomma rutan?'

/** Luckan på brädet: streckad kopparruta med frågetecknet. */
export function BradeLucka({ className = '' }: { className?: string }) {
  return (
    <div className={`sess-lucka ${className}`} data-lucka="tom">
      <span aria-hidden="true">?</span>
    </div>
  )
}

/** Brädet med luckan; efter facit står rätt figur i luckan. */
export function Matrisen({ grid, fylld = null }: { grid: (LayeredCell | null)[][]; fylld?: LayeredCell | null }) {
  const kolumner = grid[0]?.length ?? 3
  const antal = grid.flat().filter(Boolean).length
  return (
    <div
      role="img"
      aria-label={fylld ? `Matris med ${antal + 1} figurer, rätt figur i den tomma rutan` : `Matris med ${antal} figurer och en tom ruta`}
      className="matrisyta sess-brade sess-matrisbrade"
      style={{ gridTemplateColumns: `repeat(${kolumner}, minmax(0, 1fr))` }}
      data-matris
      data-kolumner={kolumner}
      data-brade-sida
    >
      {grid.flat().map((cell, i) =>
        cell ? (
          <div key={i} className="sess-brade-ruta sess-fig-ruta">
            <FigurV7 cell={cell} />
          </div>
        ) : fylld ? (
          <div key={i} className="sess-brade-ruta sess-fig-ruta" data-fylld="" data-lucka="fylld">
            <FigurV7 cell={fylld} />
          </div>
        ) : (
          <BradeLucka key={i} />
        )
      )}
    </div>
  )
}

export function MatrisUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<MatrisU>) {
  const fylld = facit != null ? u.options[facit] ?? null : null
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  return (
    <div className="flex flex-col gap-3.5 lg:gap-5" data-matris-uppgift data-brade-layout="sida">
      <Matrisen grid={u.grid} fylld={fylld} />
      <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none lg:pt-1">
        {MATRIS_FRAGA}
      </Rubrik>
      <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta sess-fig sess-alt sess-alt-matris sess-alt-brade" data-matris-alt>
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

/**
 * Uppgiftslistans miniatyr (omgång 2 B1): matrisens rad med luckan i
 * remsans 24 px-rutor (samma .minifig som figurserierna), så att raden
 * känns igen utan att figurerna blir för små att läsa.
 */
function MatrisMiniatyr({ u }: { u: MatrisU }) {
  const rad = u.grid.find((r) => r.some((c) => c == null)) ?? u.grid[u.grid.length - 1] ?? []
  return (
    <span className="matrisyta minifig" style={{ gridTemplateColumns: `repeat(${rad.length}, 24px)` }} aria-hidden="true" data-mini="matris">
      {rad.map((c, i) =>
        c ? (
          <i key={i}>
            <FigurV7 cell={c} />
          </i>
        ) : (
          <i key={i} className="lucka">
            <LuckaV7 />
          </i>
        )
      )}
    </span>
  )
}

export const MATRIS: TypRitare<MatrisU> = {
  kind: 'matris',
  namn: 'Figurer och mönster',
  form: 'smal',
  antalAlternativ: (u) => u.options.length,
  Uppgift: MatrisUppgift,
  Miniatyr: MatrisMiniatyr,
}
