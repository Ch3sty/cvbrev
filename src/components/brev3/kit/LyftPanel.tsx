/**
 * Golvet under väggen och den lyfta panelen som överlappar väggens nederkant
 * (skissens .golv och .panel: 60 px på dator, 28 px på telefonen), plus
 * rubrikraderna som återkommer på golvet ("Dina brev", "Jobb att skriva till").
 *
 * Serverkomponenter.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

/** Golvet: sidans ljusa yta under väggen, med 1120 px innehåll på dator. Bär golvets färg. */
export function Golv({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className ? `b3-golv ${className}` : 'b3-golv'}>
      <div className="b3-golv-inre">{children}</div>
    </div>
  )
}

/** Den lyfta vita panelen. Ska stå först i Golv, direkt under väggen. */
export function LyftPanel({ children, etikett, className }: { children: ReactNode; etikett?: string; className?: string }) {
  return (
    <section className={className ? `b3-panel ${className}` : 'b3-panel'} aria-label={etikett}>
      {children}
    </section>
  )
}

/**
 * Panelens rubrikrad: orange överrad, rubriken och en länk till höger (bara
 * på dator, som i skissen). Rubriken är en h2.
 */
export function PanelHuvud({ ogon, rubrik, lank, rubrikMobil }: { ogon: string; rubrik: string; rubrikMobil?: string; lank?: { href: string; text: string } }) {
  return (
    <div className="b3-panel-huvud">
      <div>
        <p className="b3-ogon-golv">{ogon}</p>
        <h2 className="b3-h2">
          {rubrikMobil ? (
            <>
              <span className="hidden xl:inline">{rubrik}</span>
              <span className="xl:hidden">{rubrikMobil}</span>
            </>
          ) : (
            rubrik
          )}
        </h2>
      </div>
      {lank ? (
        <Link href={lank.href} className="b3-lank">
          {lank.text}
        </Link>
      ) : null}
    </div>
  )
}

/** Rubrikraden för ett avsnitt på golvet: h2, en rad under och en länk till höger (dator). */
export function SektionsHuvud({ rubrik, under, underMobil, lank, id }: { rubrik: string; under?: string; underMobil?: string; lank?: { href: string; text: string }; id?: string }) {
  return (
    <div className="b3-sektion-huvud">
      <div>
        <h2 className="b3-h2" id={id}>
          {rubrik}
        </h2>
        {under ? (
          <p className="b3-under">
            {underMobil ? (
              <>
                <span className="hidden xl:inline">{under}</span>
                <span className="xl:hidden">{underMobil}</span>
              </>
            ) : (
              under
            )}
          </p>
        ) : null}
      </div>
      {lank ? (
        <Link href={lank.href} className="b3-lank">
          {lank.text}
        </Link>
      ) : null}
    </div>
  )
}
