'use client'

/**
 * ChoiceCard: ett valbart kort (docs/designsystem.md, "Komponenter").
 *
 * Val markeras utan tråd: kant ink-1 (1 px plus 1 px inset) och en fylld
 * bock i ink-1 i övre högra hörnet. Tråden betyder position, aldrig val.
 *
 * Två varianter:
 *   featured  marginalplatta 56 till vänster, för det rekommenderade valet.
 *             En per vy.
 *   plain     naken ikon 24 i ink-2, för de manuella alternativen.
 *
 * role="radio" och aria-checked, så gruppen fungerar som en radiogrupp när
 * föräldern sätter role="radiogroup". Rörelsen är CSS: kant 160 ms, hover
 * 120 ms, tryck 80 ms. Inget animeringsbibliotek.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react'

export interface ChoiceCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'onSelect'> {
  selected: boolean
  onSelect: () => void
  /** Kortrubrik. */
  title: string
  /** En mening under rubriken. */
  description?: ReactNode
  /** Metadata under beskrivningen, 13 px i ink-3. */
  meta?: ReactNode
  /** Etikett ovanför rubriken, till exempel "Rekommenderas" (i accent-ink). */
  eyebrow?: string
  /**
   * Ikonen eller plattan. I featured-läge ska det vara en MarginPlate,
   * i plain-läge en naken ikon i 24.
   */
  leading?: ReactNode
  variant?: 'featured' | 'plain'
  /** Extra innehåll under texten, till exempel en lista eller ett tillstånd. */
  children?: ReactNode
}

export default function ChoiceCard({
  selected,
  onSelect,
  title,
  description,
  meta,
  eyebrow,
  leading,
  variant = 'plain',
  children,
  className,
  disabled,
  ...rest
}: ChoiceCardProps) {
  const pad = variant === 'featured' ? 'p-4 pr-11' : 'p-3 pr-11'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      disabled={disabled}
      className={`relative flex w-full items-start gap-3 rounded-xl border bg-panel text-left transition-[border-color,background-color] duration-[160ms] ease-out hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${pad} ${
        selected ? 'border-ink-1 shadow-val' : 'border-kant'
      } ${className ?? ''}`}
      {...rest}
    >
      {leading ? (
        <span
          className={
            variant === 'featured'
              ? 'shrink-0'
              : 'mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center text-ink-2'
          }
          aria-hidden="true"
        >
          {leading}
        </span>
      ) : null}

      <span className="flex min-w-0 flex-1 flex-col">
        {eyebrow ? (
          <span className="text-steg uppercase text-accent-ink">{eyebrow}</span>
        ) : null}
        <span
          className={
            variant === 'featured'
              ? 'text-kort text-ink-1'
              : 'text-sm font-semibold leading-5 tracking-tight text-ink-1'
          }
        >
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 text-sm leading-[22px] text-ink-2">{description}</span>
        ) : null}
        {meta ? <span className="mt-1 text-meta text-ink-3">{meta}</span> : null}
        {children}
      </span>

      <span
        aria-hidden="true"
        className={`absolute right-3 top-3 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink-1 text-white transition-opacity duration-[160ms] ease-out ${
          selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      </span>
    </button>
  )
}
