'use client'

/**
 * Primärknappen i träningsfokus, med dagens mätpunkter: next_action_shown
 * när den visas och next_action_clicked vid tryck (surface 'hem').
 */

import { useEffect } from 'react'
import { capture } from '@/lib/analytics/events'
import { IkonPil, StorKnapp } from '@/components/jobb3/kit'

export default function TraningsKnapp({ href, kind, children }: { href: string; kind: string; children: string }) {
  useEffect(() => {
    capture('next_action_shown', { kind, surface: 'hem' })
  }, [kind])
  return (
    <StorKnapp golv href={href} onClick={() => capture('next_action_clicked', { kind, surface: 'hem', outside_intent: false })}>
      {children}
      <IkonPil />
    </StorKnapp>
  )
}
