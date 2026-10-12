/**
 * Figurseriens rad och alternativ (figurserier-spec.md avsnitt 1, 5, 6, 7
 * och 9), en markup för båda bredderna:
 *
 *   Raden (härnäst)  ett kort med .serie: fem figurer och luckan sist, tre
 *                    per remsa på mobil och sex i en remsa i 640-kolumnen.
 *                    Efter svar fylls luckan med facit i koppar-bläck.
 *   Raden (bryter)   sex figurer som radioknappar med bokstav, valet ritas
 *                    innanför rutan (inset) så att ingenting flyttar sig.
 *   Alternativen     sex kort med bokstav, tre i bredd på mobil och sex
 *                    rakt under raden på dator.
 *
 * Figurerna är V7-renderarnas (duo inräknad) inne i .matrisyta, så att de
 * följer bläck och papper i mörkt läge. Luckan är LuckaV7 i samma
 * svg-i-full-storlek som figurerna, så höjden är alltid densamma.
 */

import { cn } from '@/lib/utils'
import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'

const B = (i: number) => String.fromCharCode(65 + i)

export function FigurserieRad({
  rad,
  facit,
}: {
  /** De fem visade figurerna. */
  rad: LayeredCell[]
  /** Facit i luckan efter svaret, annars luckan. */
  facit?: LayeredCell | null
}) {
  return (
    <div className="matrisyta rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft" data-serie-kort>
      <div role="img" aria-label="Raden med fem figurer och en lucka sist" className="serie" data-serie>
        {rad.map((c, i) => (
          <div key={i} className="ruta">
            <FigurV7 cell={c} />
          </div>
        ))}
        {facit ? (
          <div className="ruta" data-lucka="fylld">
            <span className="ratt-fylld flex h-full w-full">
              <FigurV7 cell={facit} />
            </span>
          </div>
        ) : (
          <div className="ruta lucka" data-lucka="tom">
            <LuckaV7 />
          </div>
        )}
      </div>
    </div>
  )
}

/** "Vilken bryter mönstret": figurerna är själva alternativen (spec 7). */
export function FigurserieBryter({
  rad,
  vald,
  ratt,
  onValj,
  disabled,
}: {
  rad: LayeredCell[]
  vald: number | null
  /** Den som bryter, efter svaret. */
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  const avslojad = typeof ratt === 'number'
  return (
    <div className="matrisyta rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft">
      <div role="radiogroup" aria-label="Sex figurer, välj den som bryter mönstret" className="serie">
        {rad.map((c, i) => {
          const arVald = vald === i
          const arRatt = avslojad && ratt === i
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={arVald}
              aria-label={`Figur ${B(i)}${arVald ? ', ditt svar' : ''}${arRatt ? ', den som bryter mönstret' : ''}`}
              disabled={disabled}
              onClick={() => onValj?.(i)}
              className={cn('ruta val', arVald && 'vald', arRatt && 'ratt')}
            >
              <span aria-hidden="true" className={cn('absolute left-2 top-1.5 z-10 text-[11px] font-semibold leading-4', arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3')}>
                {B(i)}
              </span>
              {arRatt ? <span aria-hidden="true" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-koppar" /> : null}
              <FigurV7 cell={c} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FigurserieAlternativ({
  options,
  valt,
  ratt,
  onValj,
  disabled = false,
}: {
  options: LayeredCell[]
  valt: number | null
  /** Rätt svar (visat index) efter svaret, annars utelämnat. */
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  const avslojad = typeof ratt === 'number'
  return (
    <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta serie-alt" data-serie-alt>
      {options.map((o, i) => {
        const arVald = valt === i
        const arRatt = avslojad && ratt === i
        const dim = avslojad && !arVald && !arRatt
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={arVald}
            aria-label={`Svarsalternativ ${B(i)}${arVald ? ', ditt svar' : ''}${arRatt ? ', rätt svar' : ''}`}
            onClick={() => !disabled && onValj?.(i)}
            disabled={disabled}
            className={cn(
              'relative aspect-square touch-manipulation rounded-xl border bg-papper transition-[border-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar motion-reduce:transition-none',
              disabled ? 'cursor-default' : 'active:bg-papper-2',
              arRatt
                ? `border-koppar ${arVald ? 'shadow-[inset_0_0_0_1px_var(--koppar),0_0_0_3px_var(--koppar-mjuk)]' : 'shadow-[inset_0_0_0_1px_var(--koppar)]'}`
                : arVald
                  ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
                  : 'border-kant hover:border-kant-stark',
              dim && 'opacity-[.38]'
            )}
          >
            <span aria-hidden="true" className={cn('absolute left-2 top-1.5 z-10 text-[11px] font-semibold', arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3')}>
              {B(i)}
            </span>
            {arRatt ? <span aria-hidden="true" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-koppar" /> : null}
            <div className="flex h-full w-full items-center justify-center">
              <FigurV7 cell={o} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Miniatyren i resultatets genomgångslista (spec 8 och 15.2): en remsa med sex
 * rutor, aldrig två rader. Härnäst: fem figurer och luckan sist i papper-2.
 * Bryter: sex figurer, brytaren i koppar-bläck med kopparram, inga bokstäver,
 * ingen nedtoning. `fast` ger 24 px-rutorna (.minifig) med lyfta linjer.
 */
export function SerieMiniatyr({
  rad,
  className,
  form = 'harnast',
  ratt = null,
  fast = false,
}: {
  rad: LayeredCell[]
  className?: string
  form?: 'harnast' | 'bryter'
  /** Brytarens index i raden (bryter). */
  ratt?: number | null
  fast?: boolean
}) {
  if (fast) {
    return (
      <span className={cn('matrisyta minifig', className)} aria-hidden="true" data-minifig={form}>
        {rad.map((c, i) =>
          form === 'bryter' && i === ratt ? (
            <i key={i} className="bryter">
              <span className="ratt-fylld">
                <FigurV7 cell={c} />
              </span>
            </i>
          ) : (
            <i key={i}>
              <FigurV7 cell={c} />
            </i>
          )
        )}
        {form === 'harnast' ? (
          <i className="lucka">
            <LuckaV7 />
          </i>
        ) : null}
      </span>
    )
  }
  return (
    <span className={cn('matrisyta grid grid-cols-6 overflow-hidden rounded-md border border-kant bg-papper', className)} aria-hidden="true">
      {rad.map((c, i) => (
        <span key={i} className={cn('flex aspect-square items-center justify-center', i > 0 && 'border-l border-kant')}>
          <FigurV7 cell={c} />
        </span>
      ))}
      <span className="flex aspect-square items-center justify-center border-l border-kant bg-papper-2">
        <LuckaV7 />
      </span>
    </span>
  )
}
