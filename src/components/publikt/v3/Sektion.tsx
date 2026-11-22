/**
 * Sektionen på golvet och dess huvud (kit.css: .sekt, .sekt-ton,
 * .sekt-papper, .sekt-huvud). Grannar ska inte dela botten om det går:
 * golv, ton och papper växlar.
 */

import type { ReactNode } from 'react'
import type { Farg } from './farg'

export type SektionBotten = 'golv' | 'ton' | 'papper' | 'vagg'

export function Sektion({
  id,
  botten = 'golv',
  farg,
  luft = 'normal',
  utanBredd,
  className = '',
  children,
  ...aria
}: {
  id?: string
  /** golv (standard), ton (rummets ljusa ton), papper (vitt) eller vagg (mörk). */
  botten?: SektionBotten
  /** En annan färg än sidans, bara för den här sektionen. */
  farg?: Farg
  /** normal, utan-topp (fortsätter föregående sektion) eller tat. */
  luft?: 'normal' | 'utan-topp' | 'tat'
  /** Innehållet styr bredden själv (fullbredd). */
  utanBredd?: boolean
  className?: string
  children: ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
}) {
  const klass = [
    'p3-sekt',
    botten === 'ton' ? 'p3-sekt-ton' : botten === 'papper' ? 'p3-sekt-papper' : botten === 'vagg' ? 'p3-vagg' : '',
    luft === 'utan-topp' ? 'p3-utan-topp' : luft === 'tat' ? 'p3-tat' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section id={id} className={klass} data-p3-farg={farg} {...aria}>
      {utanBredd ? children : <div className="p3-bredd">{children}</div>}
    </section>
  )
}

/**
 * Etikett, rubrik, värdemening. Rubriken är h2 som standard. Behåll
 * sidans befintliga rubriker ordagrant (byggbriefen, Texten).
 */
export function SektionHuvud({
  etikett,
  rubrik,
  rubrikNiva = 'h2',
  rubrikId,
  varde,
  mitt,
  children,
  className = '',
}: {
  etikett?: ReactNode
  rubrik: ReactNode
  rubrikNiva?: 'h1' | 'h2' | 'h3'
  rubrikId?: string
  varde?: ReactNode
  mitt?: boolean
  children?: ReactNode
  className?: string
}) {
  const Rubrik = rubrikNiva
  return (
    <div className={`p3-sekt-huvud ${mitt ? 'p3-mitt' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      {etikett ? <p className="p3-ey">{etikett}</p> : null}
      <Rubrik id={rubrikId} className="p3-h2">
        {rubrik}
      </Rubrik>
      {varde ? <p className="p3-varde">{varde}</p> : null}
      {children}
    </div>
  )
}
