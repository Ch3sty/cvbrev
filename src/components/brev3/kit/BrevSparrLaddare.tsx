'use client'

/**
 * Spärren laddas först när den öppnas: vyerna importerar den här, inte
 * BrevSparr direkt. Stängd ritas ingenting och ingen kod hämtas.
 *
 *   <BrevSparrLaddare open={visa} variant="nedladdning" onClose={...} onKopiera={...}>
 *     <BrevMiniatyr ... />
 *   </BrevSparrLaddare>
 */

import dynamic from 'next/dynamic'
import type { BrevSparrProps } from './BrevSparr'

const BrevSparr = dynamic(() => import('./BrevSparr'), { ssr: false })

export type { BrevSparrProps, BrevSparrVariant } from './BrevSparr'

export default function BrevSparrLaddare({ open, ...props }: BrevSparrProps & { open: boolean }) {
  if (!open) return null
  return <BrevSparr {...props} />
}
