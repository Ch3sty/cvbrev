/**
 * Provets fem brickor (skissen docs/design/skiss-prov-konto-2026-11-09.html):
 * besökarens egna frågor i miniatyr, i ordning. Den missade får kopparring
 * och lås, de rätta grön bock. Saknas rutnätet (kontosteget i en ny flik)
 * står brickan som ett tomt rutnät med numret, aldrig som en mall.
 *
 * Bara rutnätet ritas, aldrig alternativen eller svaret.
 */

import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7'
import type { Rutnat } from '@/lib/tests/prova-lokalt'
import { brickorText } from '@/components/registrering/registrering-copy'

const BOCK = (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
const LAS = (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export function ProvBricka({ rutnat, className = '' }: { rutnat?: Rutnat | null; className?: string }) {
  const celler = rutnat ? rutnat.flat() : new Array<null>(9).fill(null)
  return (
    <span className={`pub-bricka-g matrisyta ${className}`.trim()} aria-hidden="true">
      {celler.slice(0, 9).map((c, i) => (
        <i key={i}>{c ? <FigurV7 cell={c} /> : rutnat ? <LuckaV7 /> : null}</i>
      ))}
    </span>
  )
}

export default function ProvBrickor({
  totalt,
  fel,
  rutnat,
  numrerade = true,
}: {
  totalt: number
  fel: readonly number[]
  rutnat: readonly Rutnat[]
  numrerade?: boolean
}) {
  const felSet = new Set(fel)
  return (
    <div className="pub-brickor" role="img" aria-label={brickorText(fel, totalt)}>
      {Array.from({ length: totalt }, (_, i) => {
        const arFel = felSet.has(i)
        return (
          <div key={i} className={`pub-bricka${arFel ? ' pub-bricka-fel' : ''}`}>
            <ProvBricka rutnat={rutnat[i] ?? null} />
            <i className="pub-bricka-mark">{arFel ? LAS : BOCK}</i>
            {numrerade ? <span className="pub-bricka-nr">{i + 1}</span> : null}
          </div>
        )
      })}
    </div>
  )
}
