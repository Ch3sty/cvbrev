'use client'

/**
 * Lösningspanelen (deduktiv-spec.md 2): rummets ton som regelpanelen,
 * "Lösningen" och utfallet överst, sedan lösningsgången med villkorens
 * nummer i märket ("Om" för antagandet), remsan ur lösaren och misstaget för
 * det valda alternativet sist. Allt ur bankens `losning` (DV1); D1 har ingen
 * remsa. Ingen svg (spec 7).
 *
 * Koppar i remsan bara på svarets plats, aldrig i omöjligt-frågor; antagandet
 * har bläckram (DV5). Återanvänds av genomgången och admin Frågor.
 */

import type { DeduktivLosning as Losning, DeduktivSchema } from '@/lib/deduktivV1/types'
import FragaRapport, { type FragaRapportProps } from '@/components/traning/FragaRapport'

export interface DeduktivLosningProps {
  losning: Losning
  /** "Rätt, 0:48", "Inte den här, 0:52" eller "Inte besvarad". */
  utfall: string
  /** Det valda alternativets misstag, med bokstaven. Null vid rätt svar. */
  misstag?: { bokstav: string; text: string } | null
  rapport?: FragaRapportProps
}

function Markor({ m }: { m: number | 'Om' | 'Kvar' }) {
  return (
    <span
      className={`inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[7px] px-1 text-[12px] font-semibold leading-4 tabular-nums ${
        m === 'Om' ? 'bg-ink-1 text-papper' : 'bg-papper text-ton-ink'
      }`}
      aria-hidden="true"
    >
      {m}
    </span>
  )
}

function markorAria(markor: (number | 'Om' | 'Kvar')[]): string {
  if (markor.includes('Om')) return 'Antagandet i frågan. '
  if (markor.includes('Kvar')) return ''
  const nr = markor.filter((m): m is number => typeof m === 'number')
  if (!nr.length) return ''
  return nr.length === 1 ? `Villkor ${nr[0]}. ` : `Villkor ${nr.slice(0, -1).join(', ')} och ${nr[nr.length - 1]}. `
}

export function Remsa({ schema }: { schema: DeduktivSchema }) {
  const oppen = schema.namn.some((n) => n.length > 1)
  return (
    <>
      <ol
        aria-label="Schemat, plats för plats"
        className="mt-3 grid list-none overflow-hidden rounded-[10px] border border-kant bg-papper p-0"
        style={{ gridTemplateColumns: `repeat(${schema.namn.length}, minmax(0, 1fr))` }}
        data-deduktiv-remsa
      >
        {schema.namn.map((namn, i) => {
          const plats = i + 1
          const koppar = schema.koppar === plats
          const antagande = schema.antagande === plats
          const aria = `Plats ${plats}: ${namn.join(' eller ')}${koppar ? ', rätt svar' : ''}${antagande ? ', antagandet i frågan' : ''}`
          return (
            <li
              key={plats}
              aria-label={aria}
              className={`relative flex min-h-14 flex-col items-center px-[3px] pb-2 pt-[7px] text-center ${i > 0 ? 'border-l border-kant' : ''} ${
                koppar ? 'shadow-[inset_0_0_0_2px_var(--koppar)]' : antagande ? 'shadow-[inset_0_0_0_2px_var(--ink-1)]' : ''
              }`}
              data-plats={plats}
              data-koppar={koppar || undefined}
            >
              <span className="text-[12px] font-semibold leading-4 tabular-nums text-ink-3" aria-hidden="true">
                {plats}
              </span>
              {namn.length > 1 ? (
                <span className="mt-0.5 text-[12px] font-semibold leading-[15px] text-ink-2" aria-hidden="true">
                  {namn.map((n) => (
                    <span key={n} className="block">
                      {n}
                    </span>
                  ))}
                </span>
              ) : (
                <span className={`mt-0.5 text-sm font-semibold leading-[18px] tracking-[-.005em] ${koppar ? 'text-koppar-ink' : 'text-ink-1'}`} aria-hidden="true">
                  {namn[0]}
                </span>
              )}
              {koppar ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-koppar" aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>
      {oppen ? <p className="mt-1.5 text-[12px] leading-4 text-ink-3">Två namn i en ruta betyder att båda är möjliga.</p> : null}
    </>
  )
}

export default function DeduktivLosning({ losning, utfall, misstag, rapport }: DeduktivLosningProps) {
  return (
    <>
      <div role="status" aria-live="polite" className="regelpanel rounded-[14px] bg-ton px-4 pb-4 pt-3.5" data-deduktiv-losning>
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-ey uppercase text-ton-ink">Lösningen</span>
          <span className="text-[12px] leading-4 text-ink-3">{utfall}</span>
        </p>
        <ol className="mt-2 flex list-none flex-col gap-2 p-0">
          {losning.steg.map((s, i) => (
            <li key={i} className="grid grid-cols-[22px_1fr] gap-2.5">
              <span className="flex flex-col gap-1">
                {s.markor.length ? s.markor.map((m, j) => <Markor key={j} m={m} />) : <span className="h-[22px] w-[22px]" aria-hidden="true" />}
              </span>
              <p className="regelpanel-regel text-sm leading-[21px]">
                <span className="sr-only">{markorAria(s.markor)}</span>
                {s.villkor.map((v, j) => (
                  <span key={j} className="font-semibold">
                    {v}{' '}
                  </span>
                ))}
                {s.foljd}
              </p>
            </li>
          ))}
        </ol>
        {losning.schema ? <Remsa schema={losning.schema} /> : null}
        {misstag ? (
          <>
            <p className="mt-3 text-ey uppercase text-ink-3">{`Ditt svar, ${misstag.bokstav}`}</p>
            <p className="mt-1 text-sm leading-[21px] text-ink-1" data-misstag>
              {misstag.text}
            </p>
          </>
        ) : null}
      </div>
      {rapport ? <FragaRapport {...rapport} /> : null}
    </>
  )
}
