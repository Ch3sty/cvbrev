/**
 * Den minimala väggen (spec-rummen våg 1b): Topprad och Rubrik med sidans
 * nuvarande rubrik och beskrivning. Resten av sidan står på golvet som i
 * dag. Samma props som PageHeader, så en sida byter komponent utan att
 * skriva om sitt innehåll; scenen faller bort i rummen (avsnitt 2.1:
 * instrumenten är bilden, scenerna används inte i inloggat).
 *
 * Vyns primära handling (action) står under rubriken på väggen, som
 * kopparknapp. Där sidan redan har ett lyft kort bär kortet handlingen i
 * stället.
 *
 * Server component (Topprad är klient).
 */

import type { ReactNode } from 'react'
import Vagg from './Vagg'
import Topprad, { type ToppradProps } from './Topprad'
import Rubrik from './Rubrik'

export interface RumHuvudProps {
  /** Sidans h1. Exakt en per sida. */
  title: ReactNode
  /** Raden under rubriken. */
  description?: ReactNode
  /** Etikett ovanför rubriken, versaler i vagg-mjuk. */
  eyebrow?: ReactNode
  /** Vyns primära handling, normalt en länk eller knapp med KNAPP_PRIMAR. */
  action?: ReactNode
  /** Innehåll under rubriken på väggen, till exempel flikar. */
  children?: ReactNode
  /** Rubriken i .text-h1-liten. */
  liten?: boolean
  /** padding-bottom 24 i stället för 44 (inget lyft kort under). */
  tat?: boolean
  /** Toppradens kontextlänk och brand. */
  topprad?: Omit<ToppradProps, 'pa'>
  className?: string
}

export default function RumHuvud({
  title,
  description,
  eyebrow,
  action,
  children,
  liten,
  tat = true,
  topprad,
  className,
}: RumHuvudProps) {
  return (
    <Vagg tat={tat} className={className}>
      <Topprad {...topprad} />
      {eyebrow ? <p className="mt-2 text-ey text-vagg-mjuk">{eyebrow}</p> : null}
      <Rubrik titel={title} rad={description} liten={liten} />
      {action ? (
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:[&>a]:w-auto sm:[&>button]:w-auto">
          {action}
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </Vagg>
  )
}
