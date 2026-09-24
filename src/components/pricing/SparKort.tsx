'use client'

/**
 * Paketkortet i spårvalets form (.vkort i docs/design/spec-prissida-2026-09-22.html,
 * .sk i docs/design/profil-registrering-2026-09-24.html). Delas av spårvalet
 * och registreringens steg 3.
 *
 * Platta med scen, handling som rubrik, namnet under, "du får"-rader och
 * pris med period. Hela paketet är ink. Valbart (role="radio") när onSelect
 * finns, annars ett stilla kort.
 *
 * Val markeras med kant i ink-1 och shadow-val på papper. Det mörka kortet
 * får i stället en ring i ink-1 utanför marken, eftersom en ink-kant är
 * osynlig på en ink-yta.
 */

import type { ComponentType } from 'react'

export interface SparKortProps {
  Scen: ComponentType<{ className?: string }>
  /** Ink-kortet (Hela paketet). */
  ink: boolean
  /** Etiketten över rubriken, till exempel "Rekommenderas" eller "Förslag utifrån ditt val". */
  eyebrow?: string
  /** Etiketten i accent (spårvalets "Rekommenderas") eller dämpad (förslaget). */
  eyebrowTon?: 'accent' | 'dampad'
  rubrik: string
  namn: string
  duFar: readonly { fet: string; text: string }[]
  prisText: string
  pris: string
  selected?: boolean
  onSelect?: () => void
}

export default function SparKort({
  Scen,
  ink,
  eyebrow,
  eyebrowTon = 'accent',
  rubrik,
  namn,
  duFar,
  prisText,
  pris,
  selected = false,
  onSelect,
}: SparKortProps) {
  const damp = ink ? 'text-ink-1-mjuk' : 'text-ink-2'
  const meta = ink ? 'text-ink-1-mjuk' : 'text-ink-3'
  const valbar = Boolean(onSelect)
  const kant = valbar
    ? selected
      ? ink
        ? 'border-ink-1 shadow-[0_0_0_2px_var(--mark),0_0_0_4px_var(--ink-1)]'
        : 'border-ink-1 shadow-val'
      : ink
        ? 'border-ink-1'
        : 'border-kant hover:border-kant-stark'
    : ink
      ? 'border-ink-1'
      : 'border-kant-stark'
  const eyebrowFarg =
    eyebrowTon === 'accent' ? 'text-ink-1-accent' : ink ? 'text-ink-1-mjuk' : 'text-ink-3'

  const innehall = (
    <>
      <span
        className={`grid h-14 w-14 place-items-center rounded-lg ${ink ? 'bg-ink-hover' : 'bg-insunken'}`}
        aria-hidden="true"
      >
        <Scen className="h-11 w-11" />
      </span>
      <span className="min-w-0">
        {eyebrow ? (
          <span className={`mb-0.5 block text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] ${eyebrowFarg}`}>
            {eyebrow}
          </span>
        ) : null}
        <span className="block text-base font-semibold leading-[21px]">{rubrik}</span>
        <span className={`mt-0.5 block text-[13px] leading-[18px] ${damp}`}>{namn}</span>
      </span>

      <ul
        className={`col-span-2 mt-0.5 grid gap-1 border-t pt-2 text-[13px] leading-[18px] ${damp} ${
          ink ? 'border-ink-1-kant' : 'border-kant'
        }`}
      >
        {duFar.map((rad) => (
          <li key={rad.fet} className="flex gap-2">
            <span
              className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${ink ? 'bg-panel' : 'bg-ink-1'}`}
              aria-hidden="true"
            />
            <span>
              <b className={`font-semibold ${ink ? 'text-white' : 'text-ink-1'}`}>{rad.fet}</b>
              {rad.text}
            </span>
          </li>
        ))}
      </ul>

      <span className={`col-span-2 flex items-baseline justify-between gap-3 pt-2 text-[13px] ${meta}`}>
        <span>{prisText}</span>
        <b className={`shrink-0 whitespace-nowrap font-display text-xl font-bold tabular-nums ${ink ? 'text-white' : 'text-ink-1'}`}>
          {pris}
        </b>
      </span>
    </>
  )

  const klass = `grid w-full grid-cols-[56px_1fr] items-start gap-3 rounded-xl border p-4 text-left transition-[border-color,box-shadow] duration-[160ms] ease-out ${
    ink ? 'bg-ink-1 text-white' : 'bg-panel text-ink-1'
  } ${kant}`

  if (valbar) {
    return (
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={klass}>
        {innehall}
      </button>
    )
  }
  return <div className={klass}>{innehall}</div>
}
