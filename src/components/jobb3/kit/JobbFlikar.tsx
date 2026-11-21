'use client'

/**
 * Jobbsökets fyra flikar i väggen (BYGGSPEC F1). Riktiga länkar till de fyra
 * rutterna; den aktiva läses ur sökvägen och bär aria-current="page". På
 * telefon delar de bredden med korta etiketter (höjd 44), på dator står namn
 * och rad (höjd 52).
 *
 * `aktiv` skriver över sökvägen (kitsidan, eller en vy som vet bättre).
 * `aktiv={null}` ritar flikarna utan aktiv flik (sidor utan flik).
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { JOBB_FLIKAR, jobbFlikForPath, type JobbFlik } from './flikar'

export interface JobbFlikarProps {
  aktiv?: JobbFlik | null
  /** Byt en fliks adress, t.ex. med vy-parametrar. */
  hrefs?: Partial<Record<JobbFlik, string>>
}

export default function JobbFlikar({ aktiv, hrefs }: JobbFlikarProps) {
  const pathname = usePathname()
  const vald = aktiv === undefined ? jobbFlikForPath(pathname) : aktiv
  return (
    <nav className="j3-flikar" aria-label="Jobbsöket">
      {JOBB_FLIKAR.map((f) => {
        const ar = f.id === vald
        return (
          <Link key={f.id} href={hrefs?.[f.id] ?? f.href} className="j3-flik" aria-current={ar ? 'page' : undefined} prefetch={ar ? false : undefined}>
            <b>
              <span className="lang">{f.namn}</span>
              <span className="kort">{f.kort}</span>
            </b>
            <small>{f.rad}</small>
          </Link>
        )
      })}
    </nav>
  )
}
