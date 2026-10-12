/**
 * Vägg-blocket för ett verktyg: text till vänster, telefon (eller par) till
 * höger, omvänt varannan gång. Rubriknivån styrs av sidan så att
 * baslinjens h2 och h3 står kvar (spec-publikt-v2 del A avsnitt 3).
 * Komponentnamnet är internt; ordet syns aldrig på sidan.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Objekt, { type ObjektTyp } from './Objekt'
import Rum from './Rum'
import Steg, { type StegRad } from './Steg'
import type { RumNamn } from './telefon/Telefon'

export default function Station({
  id,
  rum,
  objekt,
  kick,
  rubrik,
  rubrikNiva,
  gratisRad,
  ingress,
  text,
  steg,
  knapp,
  knappNot,
  lank,
  telefon,
  omvand,
  stor,
  efter,
}: {
  id?: string
  rum: RumNamn
  objekt: ObjektTyp
  kick?: string
  rubrik: string
  rubrikNiva: 'h2' | 'h3'
  /** "Ingår i Premium. Gratis: ..." under rubriken. */
  gratisRad?: string
  /** Ingressen; en fet första mening skickas in som <b>. */
  ingress?: ReactNode
  text?: ReactNode
  steg?: readonly StegRad[]
  knapp?: { text: string; href: string } | ReactNode
  /** Raden bredvid knappen. */
  knappNot?: string
  lank?: { text: string; href: string }
  /** En telefon, eller två i en pub-duo. */
  telefon: ReactNode
  omvand?: boolean
  /** Det största blocket: mer luft och två telefoner. */
  stor?: boolean
  efter?: ReactNode
}) {
  const Rubrik = rubrikNiva
  const knappEl =
    knapp && typeof knapp === 'object' && 'href' in (knapp as { href?: string }) ? (
      <Link className="pub-knapp" href={(knapp as { href: string }).href}>
        {(knapp as { text: string }).text}
      </Link>
    ) : (
      (knapp as ReactNode)
    )
  return (
    <Rum rum={rum} yta="vagg" id={id} storlek={stor ? 'stor' : 'normal'}>
      <div className={`pub-wrap pub-tva ${omvand ? 'pub-omv' : ''}`.trim()}>
        <div className="pub-tva-text">
          <Objekt typ={objekt} />
          {kick ? (
            <p className="pub-kick" style={{ marginTop: 20 }}>
              {kick}
            </p>
          ) : null}
          <Rubrik className="pub-h2" style={kick ? undefined : { marginTop: 20 }}>
            {rubrik}
          </Rubrik>
          {gratisRad ? (
            <p className="pub-liten" style={{ marginTop: 8 }}>
              {gratisRad}
            </p>
          ) : null}
          {ingress ? (
            <p className="pub-ingress" style={{ marginTop: 16 }}>
              {ingress}
            </p>
          ) : null}
          {text ? (
            <p className="pub-brod" style={{ marginTop: ingress ? 14 : 16 }}>
              {text}
            </p>
          ) : null}
          {steg?.length ? (
            <div style={{ marginTop: 24 }}>
              <Steg rader={steg} rubrikNiva="h4" />
            </div>
          ) : null}
          {knappEl || knappNot ? (
            <div className="pub-handling">
              {knappEl}
              {knappNot ? <span className="pub-liten">{knappNot}</span> : null}
            </div>
          ) : null}
          {lank ? (
            <p style={{ marginTop: 22 }}>
              <Link className="pub-lank" href={lank.href}>
                {lank.text}
              </Link>
            </p>
          ) : null}
          {efter}
        </div>
        {stor ? telefon : <div className="pub-mitt">{telefon}</div>}
      </div>
    </Rum>
  )
}
