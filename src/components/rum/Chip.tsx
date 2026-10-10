/**
 * Chip (spec-rummen 4.4, konceptets .chip): 28 px högt, radie 8, papper-2
 * med kant, 12/500. `ton` står i rummets ljusa färg, `las` bär låset.
 * `liten` är sidomenyns 22 px.
 *
 * Server component.
 */

import type { ReactNode } from 'react'
import { IkonLas } from '@/components/illustrations/RumSymboler'

export interface ChipProps {
  children?: ReactNode
  ton?: boolean
  las?: boolean
  liten?: boolean
  /** Tillgängligt namn, till exempel för ett chip som bara är ett lås. */
  label?: string
  className?: string
}

export default function Chip({ children, ton, las, liten, label, className }: ChipProps) {
  return (
    <span
      aria-label={label}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border font-medium ${
        liten ? 'h-[22px] px-2 text-[11px]' : 'h-7 px-2.5 text-xs'
      } ${ton ? 'border-transparent bg-ton text-ton-ink' : 'border-kant bg-papper-2 text-ink-2'} ${className ?? ''}`}
    >
      {las ? <IkonLas size={liten ? 12 : 14} /> : null}
      {children}
    </span>
  )
}
