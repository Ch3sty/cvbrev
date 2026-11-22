/**
 * Stegen som en väg (kit.css: .vagsteg): numrerade kort med en prickad
 * linje mellan dem på dator. Tre eller fyra på en rad, fem blir tre plus
 * två, sex eller fler tre per rad.
 *
 * HowTo: sidan bygger schemat själv ur samma lista som den skickar hit,
 * så att stegen i JSON-LD och på sidan är ordagrant lika.
 */

import type { CSSProperties, ReactNode } from 'react'
import { Nr } from './Bitar'

export interface VagStegRad {
  rubrik: ReactNode
  text?: ReactNode
  /** Bild i stegets kort (ovanför rubriken på dator, under i telefonen). */
  bild?: ReactNode
  /** Kopparbricka för steget som är viktigast. */
  koppar?: boolean
}

export function VagSteg({
  steg,
  rubrikNiva = 'h3',
  className = '',
}: {
  steg: readonly VagStegRad[]
  rubrikNiva?: 'h3' | 'h4'
  className?: string
}) {
  const Rubrik = rubrikNiva
  return (
    <ol className={`p3-vagsteg ${className}`.trim()} data-n={steg.length} style={{ ['--n' as string]: Math.min(steg.length, 4) } as CSSProperties}>
      {steg.map((s, i) => (
        <li key={i}>
          <Nr typ={s.koppar ? 'koppar' : 'ton'}>{i + 1}</Nr>
          <Rubrik className="p3-h3">{s.rubrik}</Rubrik>
          {s.text ? <p>{s.text}</p> : null}
          {s.bild ? (
            <div className="p3-steg-bild" aria-hidden="true">
              {s.bild}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
