'use client'

/**
 * Deduktivens förklaring i Förklaringen (plan-testflode-2026-11-20 avsnitt
 * 5.1): lösningsgången steg för steg med villkorens nummer i märket ("Om"
 * för antagandet) och schemat plats för plats. Allt ur bankens losning, som
 * förut i DeduktivLosning; panelens yta, utfallsrad och misstaget ritar
 * Förklaringen. Svarets plats i schemat har positiv ram, antagandet bläck,
 * aldrig koppar (koppar är handling i sessionen, avsnitt 7.2).
 */

import type { DeduktivLosning } from '@/lib/deduktivV1/types'

function Markor({ m }: { m: number | 'Om' | 'Kvar' }) {
  return (
    <span
      className={`inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[7px] px-1 text-[12px] font-semibold leading-4 tabular-nums ${
        m === 'Om' ? 'bg-ink-1 text-papper' : 'bg-papper-2 text-ink-2'
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

/** `utanRemsa`: remsan står i villkorskortet (ramen, omgång 2 B1); bara stegen här. */
export default function Losningsgang({ losning, utanRemsa = false }: { losning: DeduktivLosning; utanRemsa?: boolean }) {
  const schema = utanRemsa ? null : losning.schema
  const oppen = schema ? schema.namn.some((n) => n.length > 1) : false
  return (
    <div data-losningsgang>
      <ol className="grid list-none grid-cols-[auto_1fr] gap-x-2.5 gap-y-2 p-0">
        {losning.steg.map((s, i) => (
          <li key={i} className="col-span-2 grid grid-cols-subgrid">
            <span className="flex max-w-[74px] flex-wrap content-start gap-1">
              {s.markor.length ? s.markor.map((m, j) => <Markor key={j} m={m} />) : <span className="h-[22px] w-[22px]" aria-hidden="true" />}
            </span>
            <p className="text-sm leading-[21px] text-ink-1">
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
      {schema ? (
        <>
          <ol
            aria-label="Schemat, plats för plats"
            className="mt-3 grid list-none overflow-hidden rounded-[10px] border border-kant bg-papper p-0"
            style={{ gridTemplateColumns: `repeat(${schema.namn.length}, minmax(0, 1fr))` }}
            data-deduktiv-remsa
          >
            {schema.namn.map((namn, i) => {
              const plats = i + 1
              const svar = schema.koppar === plats
              const antagande = schema.antagande === plats
              return (
                <li
                  key={plats}
                  aria-label={`Plats ${plats}: ${namn.join(' eller ')}${svar ? ', svaret' : ''}${antagande ? ', antagandet i frågan' : ''}`}
                  className={`relative flex min-h-14 flex-col items-center px-[3px] pb-2 pt-[7px] text-center ${i > 0 ? 'border-l border-kant' : ''} ${
                    svar ? 'shadow-[inset_0_0_0_2px_var(--positiv)]' : antagande ? 'shadow-[inset_0_0_0_2px_var(--ink-1)]' : ''
                  }`}
                  data-plats={plats}
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
                    <span className="mt-0.5 text-sm font-semibold leading-[18px] text-ink-1" aria-hidden="true">
                      {namn[0]}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          {oppen ? <p className="mt-1.5 text-[12px] leading-4 text-ink-3">Två namn i en ruta betyder att båda är möjliga.</p> : null}
        </>
      ) : null}
    </div>
  )
}
