/**
 * Hjälten (spec-publikt-v2 del A avsnitt 3): brödsmula, kick, h1, ingress
 * med en fet mening, en fylld knapp och en textlänk, talraden och bilden
 * (telefon med svävande objekt). Knappen bär data-primar för mätskriptet.
 * På 360 px slutar rubrik, ingress och knapp inom 640 px (avsnitt 4).
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Rum, { type Yta } from './Rum'
import TalRad from './TalRad'
import type { RumNamn } from './telefon/Telefon'

export interface Lank {
  text: string
  href: string
  dataCta?: string
}

export default function Hjalte({
  id,
  rum,
  yta,
  brodsmulor,
  kick,
  h1,
  ingress,
  fet,
  fetForst,
  primar,
  sekundar,
  tal,
  bild,
  bildLag,
  vag,
  efterHandling,
  style,
}: {
  id: string
  rum?: RumNamn
  yta: Extract<Yta, 'vagg' | 'mark' | 'premium'>
  brodsmulor?: { name: string; href: string }[]
  kick: ReactNode
  h1: ReactNode
  ingress: ReactNode
  /** Den feta meningen. Sist i ingressen, eller först med fetForst. */
  fet?: ReactNode
  fetForst?: boolean
  /** Länk med data-primar, eller ett eget element (köpknappen). */
  primar: Lank | ReactNode
  sekundar?: Lank
  tal?: readonly { tal: string; text: string }[]
  bild: ReactNode
  /** Bilden har ingen minsta höjd (telefonen ensam, utan objekt runt). */
  bildLag?: boolean
  vag?: 'mark' | 'panel'
  /** Extra innehåll under talraden, till exempel ankarlänkar. */
  efterHandling?: ReactNode
  style?: CSSProperties
}) {
  const primarEl =
    primar && typeof primar === 'object' && 'href' in (primar as Lank) ? (
      <Link className="pub-knapp" href={(primar as Lank).href} data-primar="" data-cta={(primar as Lank).dataCta}>
        {(primar as Lank).text}
      </Link>
    ) : (
      (primar as ReactNode)
    )
  return (
    <Rum
      rum={rum}
      yta={yta}
      id={id}
      vag={vag}
      style={{ paddingTop: 'clamp(24px, 4vw, 56px)', ...style }}
    >
      <div className="pub-wrap pub-tva">
        <div className="pub-tva-text">
          {brodsmulor ? <Breadcrumb items={brodsmulor} /> : null}
          <p className="pub-kick">{kick}</p>
          <h1 className="pub-h1">{h1}</h1>
          <p className="pub-ingress" style={{ marginTop: 20 }}>
            {fet && fetForst ? (
              <>
                <b>{fet}</b>{' '}
              </>
            ) : null}
            {ingress}
            {fet && !fetForst ? (
              <>
                {' '}
                <b>{fet}</b>
              </>
            ) : null}
          </p>
          <div className="pub-handling">
            {primarEl}
            {sekundar ? (
              <Link className="pub-lank" href={sekundar.href}>
                {sekundar.text}
              </Link>
            ) : null}
          </div>
          {tal?.length ? <TalRad tal={tal} /> : null}
          {efterHandling}
        </div>
        <div className={`pub-hero-bild ${bildLag ? 'pub-hero-bild-lag' : ''}`.trim()}>{bild}</div>
      </div>
    </Rum>
  )
}
