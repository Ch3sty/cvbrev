'use client'

/**
 * Figurserier i ramen (plan-testflode-2026-11-20 avsnitt 3.3), samma
 * uppgift i alla lägen: frågan i .text-fraga, remsan och svaren.
 *
 *   Härnäst  fem figurer och luckan sist i en ram, två remsor om tre på
 *            mobil och en remsa med sex rutor i remsans 672 på dator; sex
 *            Svarskort-rutor under (3×2 à 121×96 på mobil, sex i rad på
 *            dator). Efter facit fylls luckan med figuren i bläck och 2 px
 *            positiv ram.
 *   Bryter   de sex figurerna i remsan är själva svaren, med bricka, och
 *            frågan "Vilken figur bryter mönstret?" ovanför.
 *
 * Figurerna är V7-renderarnas inne i .matrisyta, så att de följer bläck och
 * papper i mörkt läge. Alla rutor har aspect-ratio (CLS 0).
 */

import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7'
import type { V7Cell } from '@/lib/logicTestV7/types.v7'
import { FIGUR_PASS_COPY } from '@/lib/tester/pass-copy'
import { Bricka, BOKSTAV, SvarRuta, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'

export interface FigurserieU extends RamUppgift {
  form: 'harnast' | 'bryter'
  rad: V7Cell[]
  options: V7Cell[]
}

const RAM = 'matrisyta rounded-xl border border-kant bg-papper p-2.5'

function Remsa({ u, facit }: { u: FigurserieU; facit: number | null }) {
  const fylld = facit != null ? u.options[facit] : null
  return (
    <div className={RAM} data-serie-kort>
      <div role="img" aria-label="Raden med fem figurer och en lucka sist" className="serie" data-serie>
        {u.rad.map((c, i) => (
          <div key={i} className="ruta">
            <FigurV7 cell={c} />
          </div>
        ))}
        {fylld ? (
          <div className="ruta sess-lucka-fylld" data-lucka="fylld">
            <FigurV7 cell={fylld} />
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

function BryterRemsa({ u, vald, facit, onValj, last }: Pick<UppgiftProps<FigurserieU>, 'u' | 'vald' | 'facit' | 'onValj' | 'last'>) {
  return (
    <div className={RAM}>
      <div role="radiogroup" aria-label="Sex figurer, välj den som bryter mönstret" className="serie">
        {u.rad.map((c, i) => {
          const t = tillstandFor(i, vald, facit)
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={t === 'vald' || t === 'fel'}
              aria-label={`Figur ${BOKSTAV(i)}${t === 'ratt' ? ', den som bryter mönstret' : t === 'fel' ? ', ditt svar, fel' : ''}`}
              disabled={last}
              onClick={() => onValj?.(i)}
              data-tillstand={t}
              data-svar={BOKSTAV(i)}
              className="ruta sess-val"
            >
              <Bricka i={i} tillstand={t === 'dampad' ? 'neutral' : t} className="absolute left-1.5 top-1.5 z-10 scale-[.84]" />
              <span className="sess-fig flex h-full w-full items-center justify-center">
                <FigurV7 cell={c} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FigurserieUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<FigurserieU>) {
  const bryter = u.form === 'bryter'
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-figurserie-uppgift={u.form}>
      <div>
        <h2 tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {bryter ? FIGUR_PASS_COPY.fraga.bryter : FIGUR_PASS_COPY.fraga.harnast}
        </h2>
        {bryter ? <p className="mt-1 text-sm leading-5 text-ink-2">{FIGUR_PASS_COPY.fraga.bryterHjalp}</p> : null}
      </div>
      {bryter ? (
        <BryterRemsa u={u} vald={vald} facit={facit} onValj={onValj} last={last} />
      ) : (
        <>
          <Remsa u={u} facit={facit} />
          <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta sess-alt" data-serie-alt>
            {u.options.map((o, i) => (
              <SvarRuta
                key={i}
                i={i}
                tillstand={tillstandFor(i, vald, facit)}
                efterFel={efterFel}
                disabled={last}
                onValj={onValj}
                className="sess-ruta"
              >
                <FigurV7 cell={o} />
              </SvarRuta>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const FIGURSERIE: TypRitare<FigurserieU> = {
  kind: 'figurserie',
  namn: 'Figurserier',
  form: 'remsa',
  antalAlternativ: (u) => (u.form === 'bryter' ? u.rad.length : u.options.length),
  Uppgift: FigurserieUppgift,
}
