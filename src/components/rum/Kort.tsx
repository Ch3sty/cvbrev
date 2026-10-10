/**
 * Kortet på golvet (spec-rummen 4.4, konceptets .kort): papper, 1 px kant,
 * radie 16, 16 px luft. På väggen (vagg) i väggens glas: vitt 5 procent
 * och väggens kant, som konceptets `.vagg .kort`.
 *
 * Server component.
 */

import type { ReactNode } from 'react'

export interface KortProps {
  children: ReactNode
  /** Tillgängligt namn för sektionen. */
  label?: string
  /** Kortet står på väggen. */
  vagg?: boolean
  /** Utan innerluft, för listor (Rader). */
  tatt?: boolean
  as?: 'section' | 'div'
  className?: string
}

export default function Kort({ children, label, vagg, tatt, as = 'section', className }: KortProps) {
  const Tag = as
  return (
    <Tag
      aria-label={label}
      className={`rounded-2xl border ${
        vagg ? 'border-vagg-kant bg-white/5 text-vagg-ink' : 'border-kant bg-papper text-ink-1'
      } ${tatt ? '' : 'p-4'} ${className ?? ''}`}
    >
      {children}
    </Tag>
  )
}
