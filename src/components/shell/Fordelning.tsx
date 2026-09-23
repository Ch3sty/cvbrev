/**
 * Fordelning: ett tal med sin fördelning (docs/designsystem.md avsnitt 6,
 * regel 5 i docs/design/analys-visuell-linje-2026-09-22.html).
 *
 * Ett stort tal står aldrig ensamt. Komponenten ritar talet, en mening som
 * säger vad det betyder, och under det en segmentrad där varje segment har
 * sin förklaring i legenden. Färg är aldrig ensam informationsbärare:
 * legenden skriver ut talet och vad det står för.
 *
 * Tonerna: ink (det som kräver handling), stark (kant-stark), mjuk
 * (insunken med kant), positiv (svar, intervju) och accent (räknas mot
 * taket på tre orange per skärm, använd högst en gång).
 *
 * Inga hooks och ingen 'use client'.
 */

import type { ReactNode } from 'react'

export type FordelningTon = 'ink' | 'stark' | 'mjuk' | 'positiv' | 'accent'

export interface FordelningSegment {
  /** Legendens text efter talet: "tysta över två veckor". */
  label: string
  value: number
  tone?: FordelningTon
  /**
   * Talet som legenden skriver ut, när värdet behöver format: "8 088 kr".
   * Utan det skrivs value ut som det är. Tillagt för Räkna ut (2026-09-23).
   */
  visa?: string
}

export interface FordelningProps {
  /** Det stora talet. En sträng när talet behöver format: "26 912 kr". */
  total: number | string
  /** Raden direkt under talet: "sökta i september". */
  unit: string
  /** Meningen som säger vad talet betyder. Obligatorisk. */
  mening: ReactNode
  segments: readonly FordelningSegment[]
  /** Handling under legenden, normalt en textlänk. */
  action?: ReactNode
  className?: string
}

const TON: Record<FordelningTon, string> = {
  ink: 'bg-ink-1',
  stark: 'bg-kant-stark',
  mjuk: 'bg-insunken shadow-[inset_0_0_0_1px_var(--kant-stark)]',
  positiv: 'bg-positiv',
  accent: 'bg-accent',
}

export default function Fordelning({
  total,
  unit,
  mening,
  segments,
  action,
  className,
}: FordelningProps) {
  const synliga = segments.filter((s) => s.value > 0)
  const summa = synliga.reduce((a, s) => a + s.value, 0)

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="whitespace-nowrap text-tal-display text-ink-1">{total}</span>
        <span className="text-sm font-medium text-ink-2">{unit}</span>
      </div>
      <p className="mt-2 text-sm leading-[22px] text-ink-2">{mening}</p>

      {summa > 0 ? (
        <>
          <div
            className="mt-4 flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={synliga.map((s) => `${s.visa ?? s.value} ${s.label}`).join(', ')}
          >
            {synliga.map((s) => (
              <span
                key={s.label}
                className={`h-full first:rounded-l-full last:rounded-r-full ${TON[s.tone ?? 'ink']}`}
                style={{ flexGrow: s.value, flexBasis: 0 }}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-meta text-ink-2">
            {synliga.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${TON[s.tone ?? 'ink']}`}
                />
                <span>
                  <span className="font-semibold tabular-nums text-ink-1">{s.visa ?? s.value}</span> {s.label}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
