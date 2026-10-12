/**
 * Läs vidare (spec-publikt-v2 del B 3.1, rad 4): tre relaterade artiklar
 * med tumnagel, Verktyg och Mest lästa. Länkarna är desamma som i dagens
 * ram och syns på alla bredder. Inga rubrikelement.
 */

import Link from 'next/link'
import Rum from '../Rum'
import ArtikelKort, { type ArtikelKortData } from './ArtikelKort'

export default function LasVidare({
  relaterade,
  verktyg,
  mestLasta,
}: {
  relaterade: readonly ArtikelKortData[]
  verktyg: readonly { label: string; href: string }[]
  mestLasta: readonly { title: string; href: string }[]
}) {
  return (
    <Rum yta="panel" id="las-vidare" aria-label="Läs vidare">
      <div className="pub-wrap">
        {relaterade.length ? (
          <>
            <div className="ib-rubrikrad">
              <p className="pub-h3 ib-rub">Läs vidare</p>
              <Link className="pub-lank" href="/artiklar">
                Visa alla artiklar
              </Link>
            </div>
            <ul className="ib-rel">
              {relaterade.map((r) => (
                <ArtikelKort key={r.slug} artikel={r} />
              ))}
            </ul>
          </>
        ) : null}
        <div className="ib-lankkol">
          <div>
            <p className="ib-sidorub">Verktyg</p>
            <ul className="ib-sidolista">
              {verktyg.map((v) => (
                <li key={v.href}>
                  <Link href={v.href}>{v.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {mestLasta.length ? (
            <div>
              <p className="ib-sidorub">Mest lästa</p>
              <ul className="ib-sidolista">
                {mestLasta.map((g) => (
                  <li key={g.href}>
                    <Link href={g.href}>{g.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </Rum>
  )
}
