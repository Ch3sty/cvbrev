'use client'

/**
 * Förslagskortet i registreringens steg 3 (docs/design/profil-registrering-2026-09-24.html,
 * .sk), i rummens material sedan våg 5.
 *
 * Platta med scen, handling som rubrik, namnet under, "du får"-rader och
 * pris med period. Papper, kant, radie 16. Det sålda kortet (Jobbcoach
 * Premium) har kopparkant; något bläckkort med vit text finns inte längre.
 * Valbart (role="radio") när onSelect finns, annars ett stilla kort. Val
 * markeras med kant i ink-1, aldrig med koppar.
 */

import type { ComponentType } from 'react'

export interface SparKortProps {
  Scen: ComponentType<{ className?: string }>
  /** Kopparkanten: kortet är det som säljs. */
  markerad?: boolean
  /** Etiketten över rubriken, till exempel "Förslag utifrån ditt val". */
  eyebrow?: string
  /** Etiketten i koppar-ink eller dämpad. */
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
  markerad = false,
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
  const valbar = Boolean(onSelect)
  const kant = valbar
    ? selected
      ? 'border-ink-1 shadow-val'
      : 'border-kant hover:border-kant-stark'
    : markerad
      ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
      : 'border-kant'
  const eyebrowFarg = eyebrowTon === 'accent' ? 'text-koppar-ink' : 'text-ink-3'

  const innehall = (
    <>
      <span className="grid h-14 w-14 place-items-center rounded-lg bg-papper-2" aria-hidden="true">
        <Scen className="h-11 w-11" />
      </span>
      <span className="min-w-0">
        {eyebrow ? <span className={`mb-0.5 block text-ey ${eyebrowFarg}`}>{eyebrow}</span> : null}
        <span className="block text-base font-semibold leading-[21px]">{rubrik}</span>
        <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-2">{namn}</span>
      </span>

      <ul className="col-span-2 mt-0.5 grid gap-1 border-t border-kant pt-2 text-[13px] leading-[18px] text-ink-2">
        {duFar.map((rad) => (
          <li key={rad.fet} className="flex gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-1" aria-hidden="true" />
            <span>
              <b className="font-semibold text-ink-1">{rad.fet}</b>
              {rad.text}
            </span>
          </li>
        ))}
      </ul>

      <span className="col-span-2 flex items-baseline justify-between gap-3 pt-2 text-[13px] text-ink-3">
        <span>{prisText}</span>
        <b className="shrink-0 whitespace-nowrap font-display text-xl font-bold tabular-nums text-ink-1">{pris}</b>
      </span>
    </>
  )

  const klass = `grid w-full grid-cols-[56px_1fr] items-start gap-3 rounded-2xl border bg-papper p-4 text-left text-ink-1 transition-[border-color,box-shadow] duration-[160ms] ease-out ${kant}`

  if (valbar) {
    return (
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={klass}>
        {innehall}
      </button>
    )
  }
  return <div className={klass}>{innehall}</div>
}
