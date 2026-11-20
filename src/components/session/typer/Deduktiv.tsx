'use client'

/**
 * Deduktiv slutledning i ramen (plan-testflode-2026-11-20 avsnitt 3.4),
 * innehållsformen Bred, samma uppgift i alla lägen.
 *
 *   Dator   villkoren i vänsterspalten (högst 560), uppgiften och svaren i
 *           högerspalten (400), 40 px mellan. Villkoren står kvar när
 *           högerspalten rullar (Förklaringen i Träna).
 *   Mobil   villkoren fästa överst med egen rullning, högst 42 vh och 38 vh
 *           när uppgiften har fem alternativ; frågan och raderna under.
 *
 * Kortet heter alltid Villkor, också för premisskedjorna. Hjälpraden "Utgå
 * bara från det som står." står på startskärmen, inte vid varje uppgift.
 * Förklaringen (lösningsgången) står under svaren i högerspalten.
 */

import { SvarRad, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'

export interface DeduktivU extends RamUppgift {
  intro: string | null
  villkor: string[]
  fraga: string
  options: string[]
}

export function VillkorKort({ intro, villkor }: { intro: string | null; villkor: string[] }) {
  return (
    <section aria-label="Villkor" className="rounded-xl border border-kant bg-papper px-4 pb-4 pt-3.5" data-deduktiv-villkor>
      <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">Villkor</p>
      {intro ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{intro}</p> : null}
      <ol className="mt-2 flex list-none flex-col gap-2.5 p-0">
        {villkor.map((v, i) => (
          <li key={i} className="grid grid-cols-[18px_1fr] gap-2.5 text-base leading-6 text-ink-1 lg:text-[17px] lg:leading-[26px]">
            <span className="text-right text-[12px] font-semibold leading-6 tabular-nums text-ink-3 lg:leading-[26px]" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <span className="sr-only">{`${i + 1}. `}</span>
              {v}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function DeduktivUppgift({ u, vald, facit, efterFel, onValj, last, forklaring }: UppgiftProps<DeduktivU>) {
  const fem = u.options.length >= 5
  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:gap-10" data-deduktiv-uppgift>
      <div
        className="sess-villkor -mx-4 -mt-4 bg-golv px-4 pb-3 pt-4 lg:m-0 lg:max-w-[560px] lg:flex-1 lg:bg-transparent lg:p-0"
        data-fem={fem ? '' : undefined}
      >
        <VillkorKort intro={u.intro} villkor={u.villkor} />
      </div>
      <div className="flex min-w-0 flex-col gap-3.5 lg:w-[400px] lg:flex-none">
        <h2 tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {u.fraga}
        </h2>
        <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-deduktiv-alt>
          {u.options.map((text, i) => (
            <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} efterFel={efterFel} disabled={last} onValj={onValj}>
              {text}
            </SvarRad>
          ))}
        </div>
        {forklaring}
      </div>
    </div>
  )
}

export const DEDUKTIV: TypRitare<DeduktivU> = {
  kind: 'deduktiv',
  namn: 'Deduktiv slutledning',
  form: 'bred',
  antalAlternativ: (u) => u.options.length,
  Uppgift: DeduktivUppgift,
  forklaringIUppgift: true,
}
