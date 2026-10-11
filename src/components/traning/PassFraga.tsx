'use client'

/**
 * En fråga i passet (spec-rummen 4.4 PassFraga, konceptets P1 till P3).
 *
 * Matrisen står i ett papperskort med lyft, cellerna avdelade med hårlinjer.
 * Den tomma rutan är en streckad kopparram med samma höjd-mekanism som de
 * fyllda (en svg med w-full h-full, reference_matrix_test_system: ?-cellens
 * höjdfälla). Efter svaret ritas rätt figur i den tomma rutan i koppar.
 *
 * Sex alternativ i tre kolumner, kvadratiska, bokstaven uppe till vänster.
 * Svaret väljs med ett tryck. Efter svaret står alla sex kvar: det valda i
 * bläck, det rätta i koppar med en kopparpunkt, de andra nedtonade (0,38).
 * Aldrig rött, aldrig dolda, aldrig omsorterade.
 *
 * Figurerna ritas av V7-renderarna inne i .matrisyta, som byter deras fasta
 * färger mot bläck och papper (mörkt läge) och koppar (rätt svar).
 */

import { SvgLayeredCell, type LayeredCell, type VisadFraga } from '@/lib/logicTestV7/layered.v7'
import { PASS_COPY } from '@/lib/traning/pass-copy'

export interface PassFragaProps {
  fraga: Pick<VisadFraga, 'id' | 'grid' | 'options'>
  /** Det valda alternativet (visat index), eller null. */
  vald: number | null
  /** Rätt svar (visat index) när det är avslöjat, annars null. */
  ratt: number | null
  /** Svaren går inte att trycka på (efter svaret, under sparning). */
  last: boolean
  onValj?: (index: number) => void
  /** Frågetexten under matrisen. Utelämnas i genomgången. */
  visaText?: boolean
}

function Figur({ cell, className }: { cell: LayeredCell; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${className ?? ''}`} shapeRendering="geometricPrecision" aria-hidden="true">
      <SvgLayeredCell cell={cell} />
    </svg>
  )
}

export function Matris({ grid, ratt }: { grid: VisadFraga['grid']; ratt: LayeredCell | null }) {
  const kolumner = grid[0]?.length ?? 3
  return (
    <div className="matrisyta rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft" data-matris>
      <div
        role="img"
        aria-label={ratt ? PASS_COPY.fraga.matrisAriaRatt : PASS_COPY.fraga.matrisAria}
        className="grid gap-px overflow-hidden bg-kant"
        style={{ gridTemplateColumns: `repeat(${kolumner}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell, i) => (
          <div key={i} className="flex aspect-square items-center justify-center bg-papper">
            {cell ? (
              <Figur cell={cell} className="p-[14%]" />
            ) : ratt ? (
              <span className="ratt-fylld flex h-full w-full">
                <Figur cell={ratt} className="p-[14%]" />
              </span>
            ) : (
              // Samma höjd-mekanism som de fyllda cellerna: en svg i full storlek.
              <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                <rect x="16" y="16" width="68" height="68" rx="8" fill="none" stroke="var(--koppar)" strokeWidth="1.5" strokeDasharray="4 3" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PassFraga({ fraga, vald, ratt, last, onValj, visaText = true }: PassFragaProps) {
  const avslojad = ratt != null
  return (
    <div className="flex flex-col gap-3.5">
      <Matris grid={fraga.grid} ratt={avslojad ? fraga.options[ratt] : null} />
      {visaText && !avslojad ? <p className="text-center text-meta text-ink-3">{PASS_COPY.fraga.text}</p> : null}
      <div role="radiogroup" aria-label={PASS_COPY.fraga.alternativ} className="matrisyta grid grid-cols-3 gap-2.5">
        {fraga.options.map((opt, i) => {
          const bokstav = String.fromCharCode(65 + i)
          const arVald = vald === i
          const arRatt = avslojad && ratt === i
          const dim = avslojad && !arVald && !arRatt
          const kant = arRatt
            ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
            : arVald
              ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
              : 'border-kant'
          const tillagg = arVald && arRatt ? `, ${PASS_COPY.fraga.vald}, ${PASS_COPY.fraga.ratt}` : arVald ? `, ${PASS_COPY.fraga.vald}` : arRatt ? `, ${PASS_COPY.fraga.ratt}` : ''
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={arVald}
              aria-label={`${PASS_COPY.fraga.alternativAria(bokstav)}${tillagg}`}
              disabled={last}
              onClick={() => onValj?.(i)}
              className={`relative flex aspect-square touch-manipulation items-center justify-center rounded-xl border bg-papper transition-[border-color,opacity] duration-150 motion-reduce:transition-none ${kant} ${
                dim ? 'opacity-[.38]' : ''
              } ${last ? 'cursor-default' : 'active:bg-papper-2'}`}
            >
              <span className="absolute left-2 top-1.5 text-[11px] font-semibold text-ink-3" aria-hidden="true">
                {bokstav}
              </span>
              {arRatt ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-koppar" aria-hidden="true" /> : null}
              <span className="flex h-[62%] w-[62%]">
                <Figur cell={opt} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
