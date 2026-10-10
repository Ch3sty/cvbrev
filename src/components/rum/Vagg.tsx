/**
 * Väggen: rummets mörka del högst upp (spec-rummen 4.2, konceptets .vagg).
 *
 * Toningen, ljuskanten och de rundade nedre hörnen bor i .vagg i
 * globals.css (det enda stället toning får finnas). Här: marginalerna,
 * 16 px på mobil och 40 px på dator, och innehållets maxbredd 1120 px.
 * Botten 44 px, eller 24 px med `tat` när inget lyft kort överlappar.
 *
 * Server component.
 */

import type { ReactNode } from 'react'

export interface VaggProps {
  children: ReactNode
  className?: string
  /** padding-bottom 24 i stället för 44 */
  tat?: boolean
}

export default function Vagg({ children, className, tat }: VaggProps) {
  return (
    <div className={`vagg px-4 lg:px-10 ${tat ? 'pb-6' : 'pb-11'} ${className ?? ''}`}>
      <div className="mx-auto w-full max-w-[1120px]">{children}</div>
    </div>
  )
}
