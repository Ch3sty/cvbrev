/**
 * Det lyfta kortet (spec-rummen 4.4, konceptets .kort.lyft): vyns
 * viktigaste handling, på papper, som överlappar väggen 30 px med en mjuk
 * skugga. I mörkt läge får det kant (--lyft-kant), eftersom skuggan inte
 * syns mot mörkt golv.
 *
 * Ersätter InkPanels roll i rummen. Handlingen är KNAPP_PRIMAR, det
 * sekundära LANK.
 *
 * Server component.
 */

import type { ReactNode } from 'react'
import { KNAPPRAD } from '@/components/shell/knappar'

export interface LyftKortProps {
  eyebrow?: string
  eyebrowTon?: 'koppar' | 'neutral'
  titel: ReactNode
  text?: ReactNode
  /** KNAPP_PRIMAR */
  handling?: ReactNode
  /** LANK */
  sekundar?: ReactNode
  /** Meta-rad under en linje. */
  fot?: ReactNode
  children?: ReactNode
  /** aria-label */
  label: string
  /** Rubrikens element. */
  titelAs?: 'h2' | 'p'
  /** Utan överlappet, när kortet inte står direkt under väggen. */
  utanOverlapp?: boolean
  className?: string
}

export default function LyftKort({
  eyebrow,
  eyebrowTon = 'koppar',
  titel,
  text,
  handling,
  sekundar,
  fot,
  children,
  label,
  titelAs = 'h2',
  utanOverlapp,
  className,
}: LyftKortProps) {
  const Titel = titelAs
  return (
    <section
      aria-label={label}
      className={`relative z-[2] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft ${
        utanOverlapp ? '' : '-mt-[30px]'
      } ${className ?? ''}`}
    >
      {eyebrow ? (
        <p className={`text-ey ${eyebrowTon === 'koppar' ? 'text-koppar-ink' : 'text-ink-3'}`}>{eyebrow}</p>
      ) : null}
      <Titel className="mt-1 text-kort-t text-ink-1">{titel}</Titel>
      {text ? <div className="mt-1.5 text-sm leading-[21px] text-ink-2">{text}</div> : null}
      {children}
      {handling || sekundar ? (
        <div className={KNAPPRAD}>
          {handling}
          {sekundar}
        </div>
      ) : null}
      {fot ? <div className="mt-3.5 border-t border-kant pt-3 text-meta text-ink-3">{fot}</div> : null}
    </section>
  )
}
