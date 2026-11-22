/**
 * Ön (kit.css: .o): ett stort färgblock i valfri färg, text på ena sidan
 * och en bild på den andra. vand byter sida på dator. Utan bild blir ön
 * ett färgat block med bara text (och egna barn).
 *
 *   <O farg="cv" ikon="cv" etikett="Inför ansökan" rubrik="CV-analys"
 *      varde={<><b>Vet exakt ...</b> En läsbarhetspoäng ...</>}
 *      knappar={<Knapp variant="vit" href="/verktyg/cv-analys">Så fungerar det</Knapp>}
 *      bild={<CvArk poang={{ tal: 93, text: 'av 100 i dag' }} />} vand />
 *
 * Papper på ön (Kort, Traff, Svav, .p3-papper) får bläck, inte öns ljusa text.
 */

import type { ElementType, ReactNode } from 'react'
import type { Farg } from './farg'
import { Dorr, type IkonNamn } from './Ikon'

export function O({
  id,
  farg,
  vand,
  ikon,
  etikett,
  rubrik,
  rubrikNiva = 'h3',
  varde,
  children,
  knappar,
  bild,
  som: Som = 'article',
  className = '',
}: {
  id?: string
  farg?: Farg
  vand?: boolean
  /** Dörren i huvudet. Standard: delens ikon om farg är satt och etikett finns. */
  ikon?: IkonNamn | false
  etikett?: ReactNode
  rubrik?: ReactNode
  /** h3 under en sektionsrubrik, h2 när ön själv är sektionen. */
  rubrikNiva?: 'h2' | 'h3'
  varde?: ReactNode
  /** Mer text (<p>) och annat under värdemeningen. */
  children?: ReactNode
  knappar?: ReactNode
  bild?: ReactNode
  som?: ElementType
  className?: string
}) {
  const Rubrik = rubrikNiva
  const dorr: IkonNamn | null = ikon === false ? null : ikon ?? (etikett && farg ? farg : null)
  const klass = ['p3-o', bild ? 'p3-med-bild' : '', vand ? 'p3-vand' : '', className].filter(Boolean).join(' ')
  const text = (
    <div className="p3-o-text">
      {dorr || etikett ? (
        <div className="p3-o-huvud">
          {dorr ? <Dorr ikon={dorr} /> : null}
          {etikett ? <p className="p3-ey">{etikett}</p> : null}
        </div>
      ) : null}
      {rubrik ? <Rubrik className="p3-h2">{rubrik}</Rubrik> : null}
      {varde ? <p className="p3-varde">{varde}</p> : null}
      {children}
      {knappar ? <div className="p3-knapprad">{knappar}</div> : null}
    </div>
  )
  return (
    <Som id={id} className={klass} data-p3-farg={farg}>
      {bild ? (
        <div className="p3-o-rad">
          {text}
          <div className="p3-o-bild">{bild}</div>
        </div>
      ) : (
        text
      )}
    </Som>
  )
}
