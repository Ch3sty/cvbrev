'use client'

/**
 * En fråga i passet (spec-rummen 4.4 PassFraga, konceptets P1 till P3).
 *
 * Grafik v3 (docs/design/tester-v2-2026-10-11/grafik-v3-spec.md):
 * matrisen står i ett papperskort med lyft, cellerna avdelade med hårlinjer.
 * Figuren fyller 80 procent av rutan, i matrisen och i alternativen (en
 * skala). Luckan är en insjunken ruta med streckad ram och ett ritat
 * frågetecken i ram-grått, samma svg-i-full-storlek som de fyllda rutorna
 * (höjdfällan i reference_matrix_test_system). Aldrig koppar före svaret.
 * Efter svaret ritas rätt figur i luckan i koppar-bläck (.ratt-fylld).
 *
 * Sex alternativ i tre kolumner, kvadratiska, bokstaven uppe till vänster
 * och alltid kvar. Svaret väljs med ett tryck. Efter svaret står alla sex
 * kvar: det valda i bläck, det rätta i koppar med en kopparpunkt, valt och
 * rätt med en yttre ring, de andra nedtonade (0,38). Aldrig rött, aldrig
 * dolda, aldrig omsorterade.
 */

import { FigurV7, LuckaV7, type LayeredCell, type VisadFraga } from '@/lib/logicTestV7/layered.v7'
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
          <div key={i} className={`flex aspect-square items-center justify-center ${cell || ratt ? 'bg-papper' : 'bg-papper-2'}`} data-lucka={cell ? undefined : ratt ? 'fylld' : 'tom'}>
            {cell ? (
              <FigurV7 cell={cell} />
            ) : ratt ? (
              <span className="ratt-fylld flex h-full w-full">
                <FigurV7 cell={ratt} />
              </span>
            ) : (
              <LuckaV7 />
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
            ? arVald
              ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar),0_0_0_3px_var(--koppar-mjuk)]'
              : 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
            : arVald
              ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
              : 'border-kant'
          const bokstavFarg = arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'
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
              className={`relative aspect-square min-h-[80px] touch-manipulation rounded-xl border bg-papper transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar motion-reduce:transition-none ${kant} ${
                dim ? 'opacity-[.38]' : ''
              } ${last ? 'cursor-default' : 'active:bg-papper-2'}`}
            >
              <span className={`absolute left-2 top-1.5 z-10 text-[11px] font-semibold ${bokstavFarg}`} aria-hidden="true">
                {bokstav}
              </span>
              {arRatt ? <span className="absolute right-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-koppar" aria-hidden="true" /> : null}
              {/* En div i full storlek med svg:n, så att kvadraten bär höjden. Figuren i 80 procent, som i matrisen. */}
              <div className="flex h-full w-full items-center justify-center">
                <FigurV7 cell={opt} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
