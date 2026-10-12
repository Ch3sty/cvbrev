/**
 * Textmallen för juridiksidorna (spec-publikt-v2 del B 2.2 och 3.9): h1 på
 * mark, datum för senaste ändring, innehållsförteckning till vänster från
 * 1024 px och brödtexten i 68 tecken. Inga färgblock, inga bilder och
 * ingen knapp. Texten kommer orörd från sidan; mallen ritar bara om den
 * (.if-jur i foretag.css). Serverkomponent.
 */

import type { ReactNode } from 'react'
import '../innehall/foretag.css'
import Rum from '../Rum'
import Smula from './Smula'

export default function Textmall({
  titel,
  smula,
  andrad,
  rubriker,
  children,
}: {
  titel: string
  /** Namnet på sidan i brödsmulan. */
  smula: string
  /** "Senast uppdaterad", visas under h1. */
  andrad?: string
  /** h2 med id, för innehållsförteckningen. */
  rubriker?: readonly { id: string; text: string }[]
  children: ReactNode
}) {
  return (
    <main>
      <Rum yta="mark" style={{ paddingTop: 'clamp(24px, 4vw, 56px)' }}>
        <div className="pub-wrap">
          <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: smula }]} />
          <h1 className="pub-h1 ib-h1">{titel}</h1>
          {andrad ? <p className="if-jur-meta">Senast uppdaterad: {andrad}</p> : null}
          <div className="if-jur-ram" style={{ marginTop: 40 }}>
            {rubriker?.length ? (
              <nav className="if-jur-toc" aria-label="Innehåll">
                <p>Innehåll</p>
                <ol>
                  {rubriker.map((r) => (
                    <li key={r.id}>
                      <a href={`#${r.id}`}>{r.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            <div className="if-jur">{children}</div>
          </div>
        </div>
      </Rum>
    </main>
  )
}
