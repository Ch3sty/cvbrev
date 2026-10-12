/**
 * Länklistan: två kolumner från 760 px, varje rad är en länk. Rubriken är
 * h3 där baslinjen har h3 (guiderna på testsidan), annars fet text.
 */

import Link from 'next/link'
import Objekt, { type ObjektTyp } from './Objekt'
import type { RumNamn } from './telefon/Telefon'

export interface LankRad {
  href: string
  rubrik: string
  text: string
  objekt?: ObjektTyp
  rum?: RumNamn
}

export default function LankLista({
  lankar,
  rubrikNiva = 'b',
  className = '',
}: {
  lankar: readonly LankRad[]
  rubrikNiva?: 'h3' | 'b'
  className?: string
}) {
  return (
    <div className={`pub-lanklista ${className}`.trim()}>
      {lankar.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={[l.rum ? `pub-rum-${l.rum}` : '', l.objekt ? '' : 'pub-utan-objekt'].filter(Boolean).join(' ') || undefined}
        >
          {l.objekt ? <Objekt typ={l.objekt} storlek={52} /> : null}
          <div>
            {rubrikNiva === 'h3' ? <h3>{l.rubrik}</h3> : <b>{l.rubrik}</b>}
            <span>{l.text}</span>
          </div>
          <svg className="pub-pil" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      ))}
    </div>
  )
}
