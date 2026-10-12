'use client'

/**
 * Deduktiv slutledning, frågevyn (deduktiv-spec.md 1 och 3).
 *
 * - Villkorskortet: klistrat under toppraden på mobil (textpassets
 *   Underlag-mekanism: sticky, högst 42 vh, egen rullning), vänsterspalt på
 *   400 px från 1024 px. Numren är dem lösningsgången pekar på.
 * - Frågan och alternativen som rader (sifferpassets rader): bokstav,
 *   valt i bläck, rätt i koppar med punkt, övriga tonade efter svar.
 * - Ingen svg: allt är text (spec 7).
 *
 * Komponenten ritar och tar emot val; flödet (spara, nästa, klocka) ligger i
 * DeduktivTestSession. Genomgången och admin använder samma komponent med
 * `ratt` satt och DeduktivLosning under.
 */

import type { ReactNode } from 'react'

export const BOKSTAV = 'ABCDE'

/** Raden över första frågan i testet (copy 4.3), en gång. */
export const DEDUKTIV_FORSTA_RAD = 'Utgå bara från det som står. Inget annat räknas.'

export function Villkorskort({ intro, villkor, premisser, fast = false }: { intro: string | null; villkor: string[]; premisser: boolean; fast?: boolean }) {
  const rubrik = premisser ? 'Premisser' : 'Villkor'
  return (
    <section
      aria-label={rubrik}
      className={
        fast
          ? ''
          : 'sticky top-0 z-10 -mx-4 max-h-[42vh] overflow-y-auto border-b border-kant bg-golv px-4 pb-3 pt-1 lg:top-0 lg:mx-0 lg:max-h-none lg:self-start lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0'
      }
      data-deduktiv-villkor
    >
      <div className="rounded-xl border border-kant bg-papper px-4 pb-4 pt-3.5">
        <p className="text-ey uppercase text-ink-3">{rubrik}</p>
        {intro ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{intro}</p> : null}
        <ol className="mt-2.5 flex list-none flex-col gap-[7px] p-0">
          {villkor.map((v, i) => (
            <li key={i} className="grid grid-cols-[16px_1fr] gap-2.5 text-[15px] leading-[22px] text-ink-1">
              <span className="text-right text-[12px] font-semibold leading-[22px] tabular-nums text-ink-3" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <span className="sr-only">{`${i + 1}. `}</span>
                {v}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export interface AlternativProps {
  options: string[]
  /** Valt alternativ (visat index), eller null. */
  valt: number | null
  /** Rätt alternativ (visat index) efter svar, annars null. */
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}

export function DeduktivAlternativ({ options, valt, ratt = null, onValj, disabled }: AlternativProps) {
  const avslojad = ratt != null
  return (
    <div role="radiogroup" aria-label="Ditt svar" className="flex flex-col gap-2" data-deduktiv-alternativ>
      {options.map((text, i) => {
        const arVald = valt === i
        const arRatt = avslojad && ratt === i
        const dim = avslojad && !arVald && !arRatt
        const kant = arRatt
          ? arVald
            ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar),0_0_0_3px_var(--koppar-mjuk)]'
            : 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
          : arVald
            ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
            : 'border-kant'
        const tillagg = arVald && arRatt ? ', ditt svar, rätt svar' : arVald ? ', ditt svar' : arRatt ? ', rätt svar' : ''
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={arVald}
            aria-label={`${BOKSTAV[i]}. ${text}${tillagg}`}
            disabled={disabled || avslojad}
            onClick={() => onValj?.(i)}
            className={`relative flex min-h-[52px] touch-manipulation items-center gap-3 rounded-xl border bg-papper px-3.5 py-2.5 text-left text-[15px] leading-5 text-ink-1 transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar-ink motion-reduce:transition-none ${kant} ${
              dim ? 'opacity-[.38]' : ''
            } ${avslojad ? 'cursor-default' : 'active:bg-papper-2'}`}
          >
            <span className={`w-4 shrink-0 text-[12px] font-semibold ${arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'}`} aria-hidden="true">
              {BOKSTAV[i]}
            </span>
            <span className="min-w-0 flex-1">{text}</span>
            {arRatt ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-koppar" aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Två spalter från 1024 px (villkor 400, luft 40, fråga 480), en kolumn
 * under. `hoger` är frågan, alternativen och det som står under dem.
 */
export function DeduktivLayout({ villkor, hoger, fast = false }: { villkor: ReactNode; hoger: ReactNode; fast?: boolean }) {
  return (
    <div className={`flex flex-col gap-3.5 lg:flex-row lg:items-start lg:justify-center ${fast ? 'lg:gap-6' : 'lg:gap-10'}`} data-deduktiv>
      {/* I genomgången och admin (fast) delar spalterna på den bredd som finns. */}
      <div className={fast ? 'lg:min-w-0 lg:basis-[42%] lg:flex-none' : 'lg:sticky lg:top-0 lg:w-[400px] lg:flex-none'}>{villkor}</div>
      <div className={`flex min-w-0 flex-col gap-3 ${fast ? 'lg:flex-1' : 'lg:w-[480px] lg:flex-none'}`}>{hoger}</div>
    </div>
  )
}

export function Fragerad({ nr, antal, fraga, forsta }: { nr: number; antal: number; fraga: string; forsta?: boolean }) {
  return (
    <div>
      {forsta ? <p className="mb-2 text-[13px] leading-[18px] text-ink-3">{DEDUKTIV_FORSTA_RAD}</p> : null}
      <p className="text-ey uppercase text-ink-3">{`Uppgift ${nr} av ${antal}`}</p>
      <h2 className="mt-1 font-display text-[19px] font-bold leading-[26px] tracking-[-.01em] text-ink-1">{fraga}</h2>
    </div>
  )
}
