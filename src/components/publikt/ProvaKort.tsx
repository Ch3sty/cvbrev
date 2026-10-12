/**
 * Kortet direkt under hjälten: det du kan göra utan konto. Först i
 * mobilordningen, vänsterkant 6 px i rummets färg. I artiklar (del B) får
 * rubriken vara p, så att reklamkort inte hamnar i rubrikträdet.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { RumNamn } from './telefon/Telefon'

export default function ProvaKort({
  rum,
  rubrik,
  rubrikNiva = 'h2',
  text,
  punkter,
  knapp,
  not,
  bild,
  knappData,
  knappElement,
}: {
  rum: RumNamn
  rubrik: string
  rubrikNiva?: 'h2' | 'p'
  text: ReactNode
  punkter: readonly string[]
  knapp: { text: string; href: string }
  /** Raden under knappen. */
  not?: ReactNode
  bild?: ReactNode
  /** data-cta på knappen, för mätningen. */
  knappData?: string
  /** Egen knapp i stället för länken, till exempel en som mäter klicket. */
  knappElement?: ReactNode
}) {
  const Rubrik = rubrikNiva
  return (
    <div className={`pub-kort pub-prova-kort pub-rum-${rum}`}>
      <div>
        {bild}
        <Rubrik className="pub-h3">{rubrik}</Rubrik>
        <p className="pub-brod" style={{ marginTop: 10 }}>
          {text}
        </p>
        <ul className="pub-bock" style={{ marginTop: 16 }}>
          {punkter.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="pub-prova-handling">
        {knappElement ?? (
          <Link className="pub-knapp" href={knapp.href} data-cta={knappData}>
            {knapp.text}
          </Link>
        )}
        {not ? <p className="pub-liten">{not}</p> : null}
      </div>
    </div>
  )
}
