/**
 * Slutbandet på vägg (spec-publikt-v2 del B 2.2): en rubrik, en mening och
 * en knapp. Rubriknivån styrs av sidan, så att baslinjens h2 står kvar.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Rum from '../Rum'
import type { RumNamn } from '../telefon/Telefon'

export default function SlutBand({
  rum,
  rubrik,
  rubrikNiva = 'h2',
  text,
  knapp,
  lank,
  id,
}: {
  rum: RumNamn
  rubrik: ReactNode
  rubrikNiva?: 'h2' | 'p'
  text?: ReactNode
  knapp: { text: string; href: string } | ReactNode
  lank?: { text: string; href: string }
  id?: string
}) {
  const Rubrik = rubrikNiva
  const knappEl =
    knapp && typeof knapp === 'object' && 'href' in (knapp as object) ? (
      <Link className="pub-knapp" href={(knapp as { href: string }).href}>
        {(knapp as { text: string }).text}
      </Link>
    ) : (
      (knapp as ReactNode)
    )
  return (
    <Rum rum={rum} yta="vagg" storlek="tat" id={id} className="ib-slutband">
      <div className="pub-wrap">
        <Rubrik className="pub-h2">{rubrik}</Rubrik>
        {text ? (
          <p className="pub-ingress" style={{ marginTop: 16, marginInline: 'auto' }}>
            {text}
          </p>
        ) : null}
        <div className="pub-handling">
          {knappEl}
          {lank ? (
            <Link className="pub-lank" href={lank.href}>
              {lank.text}
            </Link>
          ) : null}
        </div>
      </div>
    </Rum>
  )
}
