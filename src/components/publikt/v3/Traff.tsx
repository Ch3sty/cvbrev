/**
 * Träffen i Matchade jobb (delar/traffar.html och delar/jobbmatchning-skarm.html):
 * matchgraden som ring, sista ansökningsdag som egen rad, "Därför passar
 * du" och handlingarna Skriv brev, Spara till Ska sökas, Markera som sökt.
 * Handlingarna är en bild av knapparna, inga riktiga knappar.
 *
 * Arbetsgivarna i förvalet är påhittade (Nordhaga Bygg och så vidare),
 * aldrig riktiga företag. Lön skrivs aldrig ut.
 */

import type { CSSProperties, ReactNode } from 'react'

/** Matchgraden som ring, 0 till 100. */
export function Matchgrad({ varde, liten }: { varde: number; liten?: boolean }) {
  const p = Math.max(0, Math.min(100, Math.round(varde)))
  return (
    <span
      className={`p3-ring ${liten ? 'p3-liten-ring' : ''}`.trim()}
      style={{ ['--p' as string]: p } as CSSProperties}
      role="img"
      aria-label={`${p} procent matchgrad mot ditt CV`}
    >
      {p}
    </span>
  )
}

export interface TraffSkal {
  rubrik: ReactNode
  text?: ReactNode
  kompetenser?: readonly string[]
}

export const SARA_SKAL: readonly TraffSkal[] = [
  { rubrik: '1 av dina 3 roller', text: 'Projektledare stämmer med en roll i ditt CV.' },
  { rubrik: 'Fyra av dina kompetenser nämns i annonsen', kompetenser: ['projektledning', 'LOU', 'budgetansvar', 'AMA'] },
  { rubrik: 'Göteborg', text: 'En av orterna du har valt.' },
]

export const TRAFF_HANDLINGAR = ['Skriv brev', 'Spara till Ska sökas', 'Markera som sökt'] as const

export function Traff({
  titel = 'Projektledare, bygg',
  arbetsgivare = 'Nordhaga Bygg',
  ort = 'Göteborg',
  matchgrad = 91,
  sistaDag = 'Sista ansökningsdag 28 nov, 6 dagar kvar',
  skal = SARA_SKAL,
  kompetenser,
  handlingar = TRAFF_HANDLINGAR,
  className = '',
}: {
  titel?: string
  arbetsgivare?: string
  ort?: string
  /** null för ingen ring. */
  matchgrad?: number | null
  sistaDag?: ReactNode
  /** "Därför passar du". Tom lista för inga skäl. */
  skal?: readonly TraffSkal[]
  /** Kompetenschips direkt under rubriken (den korta träffen, utan skäl). */
  kompetenser?: readonly string[]
  /** Tom lista för inga handlingar. */
  handlingar?: readonly string[]
  className?: string
}) {
  return (
    <div className={`p3-traff ${className}`.trim()}>
      <div className={`p3-traff-huvud ${matchgrad != null ? 'p3-med-ring' : ''}`.trim()}>
        {matchgrad != null ? <Matchgrad varde={matchgrad} /> : null}
        <div>
          <b>{titel}</b>
          <small>
            {arbetsgivare}, {ort}
          </small>
        </div>
      </div>
      {sistaDag ? <span className="p3-traff-sista">{sistaDag}</span> : null}
      {kompetenser?.length ? (
        <div className="p3-traff-komp">
          {kompetenser.map((k) => (
            <i key={k}>{k}</i>
          ))}
        </div>
      ) : null}
      {skal.length ? (
        <div className="p3-traff-darfor">
          <b>Därför passar du</b>
          <ul>
            {skal.map((s, i) => (
              <li key={i}>
                <div>
                  {s.rubrik}
                  {s.text ? <small>{s.text}</small> : null}
                  {s.kompetenser?.length ? (
                    <span className="p3-traff-komp">
                      {s.kompetenser.map((k) => (
                        <i key={k}>{k}</i>
                      ))}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {handlingar.length ? (
        <div className="p3-traff-gor" aria-hidden="true">
          {handlingar.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** En kortare träff i listan under den valda. */
export function TraffRad({ titel, arbetsgivare, ort, matchgrad, sistaDag }: { titel: string; arbetsgivare: string; ort: string; matchgrad: number; sistaDag?: string }) {
  return (
    <div className="p3-traffrad">
      <Matchgrad varde={matchgrad} liten />
      <div>
        <b>{titel}</b>
        <small>
          {arbetsgivare}, {ort}
          {sistaDag ? `, sista dag ${sistaDag}` : ''}
        </small>
      </div>
    </div>
  )
}

export const SARA_FLER_TRAFFAR = [
  { titel: 'Uppdragsledare, infrastruktur', arbetsgivare: 'Västlänken Konsult', ort: 'Mölndal', matchgrad: 86, sistaDag: '3 dec' },
  { titel: 'Byggprojektledare', arbetsgivare: 'Kustbyggarna', ort: 'Kungälv', matchgrad: 82, sistaDag: '11 dec' },
] as const

/**
 * Matchade jobb som vyn ser ut: rubriken, när det söktes senast, den valda
 * träffen och listan under. Står på mörk botten (vägg eller ö).
 */
export function MatchadeJobb({
  topp = true,
  senast = 'Senast sökt för 2 timmar sedan.',
  traff,
  fler = SARA_FLER_TRAFFAR,
  ariaLabel = 'Exempel: Matchade jobb med en vald träff',
}: {
  topp?: boolean
  senast?: string
  /** Props till den valda träffen. */
  traff?: Parameters<typeof Traff>[0]
  fler?: readonly { titel: string; arbetsgivare: string; ort: string; matchgrad: number; sistaDag?: string }[]
  ariaLabel?: string
}) {
  return (
    <div className="p3-mj" role="group" aria-label={ariaLabel}>
      {topp ? (
        <div className="p3-mj-topp">
          <b>Matchade jobb</b>
          <span>
            {senast} <u>Sök igen</u>
          </span>
        </div>
      ) : null}
      <Traff {...traff} />
      {fler.map((f) => (
        <TraffRad key={f.titel} {...f} />
      ))}
    </div>
  )
}
