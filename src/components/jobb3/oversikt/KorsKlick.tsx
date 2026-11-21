'use client'

/**
 * Mätpunkten korsreferens_klick (fran jobb, till tran) på raden till
 * Rekryteringstester i "Mer i Jobbsöket", som på dagens hem. Raden själv är
 * en serverkomponent; klicket fångas här runt listan.
 */

import type { ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'

export default function KorsKlick({ variant, children }: { variant: 'niva' | 'aldrig_matt'; children: ReactNode }) {
  return (
    <div
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest('a')
        if (a?.getAttribute('href') === '/dashboard/tester') capture('korsreferens_klick', { fran: 'jobb', till: 'tran', variant })
      }}
    >
      {children}
    </div>
  )
}
