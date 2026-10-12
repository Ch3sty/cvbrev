/**
 * En sektion i ett publikt rum (spec-publikt-v2 del A avsnitt 3). Sätter
 * rumsklassen (variabler som bara gäller lokalt) och ytan. Ersätter
 * skissens .sek, .yta-* och .vagg.
 *
 * Ytor: vägg (rummets mörka färg), ton (rummets ljusa yta), mark, panel och
 * premium (bläck). Grannar ska inte dela yta.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { RumNamn } from './telefon/Telefon'
import Vag from './Vag'

export type Yta = 'vagg' | 'ton' | 'mark' | 'panel' | 'premium'

export default function Rum({
  rum,
  yta,
  storlek = 'normal',
  id,
  vag,
  className = '',
  style,
  children,
  ...aria
}: {
  rum?: RumNamn
  yta: Yta
  storlek?: 'tat' | 'normal' | 'stor'
  id?: string
  /** Vågkant i botten mot nästa sektions yta. Högst en per sida plus hjältens. */
  vag?: 'mark' | 'panel'
  className?: string
  style?: CSSProperties
  children: ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
}) {
  const klasser = [
    storlek === 'tat' ? 'pub-sek-tat' : storlek === 'stor' ? 'pub-sek pub-sek-stor' : 'pub-sek',
    `pub-yta-${yta}`,
    rum ? `pub-rum-${rum}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section id={id} className={klasser} style={style} {...aria}>
      {children}
      {vag ? <Vag till={vag} /> : null}
    </section>
  )
}
