/**
 * Väggen med topprad och rubrik (spec-rummen våg 1b, beslut efter
 * granskningen i avsnitt 16).
 *
 * Regeln: väggen säger var du är, det lyfta kortet vad du gör. Väggen bär
 * därför aldrig KNAPP_PRIMAR. Vyns primära handling står i ett LyftKort
 * först på golvet (Golv lyft, RumHuvud tat={false}). På väggen får bara en
 * sekundär handling stå, `handling`, som LANK_VAGG eller KNAPP_GLAS i
 * automatisk bredd. scripts/grep-rummen.mjs stoppar KNAPP_PRIMAR på samma
 * rad som handling= eller action=.
 *
 * Eyebrow är bara för data, aldrig kategori (spec 16.3.3): Jobbsökets
 * datumrad och, från våg 2, "Dagens pass · nivå 5".
 *
 * Server component (Topprad är klient).
 */

import type { ReactNode } from 'react'
import Vagg from './Vagg'
import Topprad, { type ToppradProps } from './Topprad'
import Rubrik from './Rubrik'

export interface RumHuvudProps {
  /** Sidans h1, undersidans namn (RUBRIK i copy.ts). Exakt en per sida. */
  title: ReactNode
  /** Raden under rubriken. */
  description?: ReactNode
  /** Data ovanför rubriken (datumraden), aldrig en kategori. */
  eyebrow?: ReactNode
  /** Väggens sekundära handling: LANK_VAGG eller KNAPP_GLAS, aldrig KNAPP_PRIMAR. */
  handling?: ReactNode
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
  handling,
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
      {handling ? <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">{handling}</div> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </Vagg>
  )
}
