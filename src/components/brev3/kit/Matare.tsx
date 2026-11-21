/**
 * Mätarna i panelen "Tre mått på brevet" (skissens .matare i Main och
 * Mobil-hem): Kraven, Längden och Mallen. Matare är ramen (etikett, bricka,
 * mitten, raden längst ner); KravMitt, LangdMitt och MallMitt är mittdelarna
 * för de tre måtten. Utan kravmått står två mätare i MattRutnat antal={2}.
 *
 * Inga hooks, serverkomponenter. Talen räknas av motorn och vyn.
 */

import type { ReactNode } from 'react'
import { KravBitar } from './delar'

/** Rutnätet: Kraven bredast på dator (1,3 : 1 : 1), Kraven över två spalter på telefonen. */
export function MattRutnat({ antal = 3, children }: { antal?: 2 | 3; children: ReactNode }) {
  return (
    <div className="b3-matt-rutnat" data-antal={antal}>
      {children}
    </div>
  )
}

export interface MatareProps {
  /** Överraden, t.ex. "Kraven i annonsen". */
  etikett: string
  /** Brickan uppe till höger (MatarBricka). */
  bricka?: ReactNode
  /** Mätarens mitt: KravMitt, LangdMitt, MallMitt. */
  children: ReactNode
  /** Raden längst ner. Fet början, sedan vad hon kan göra. */
  rad?: ReactNode
  /** Kortare rad på telefonen, om skissen har en. */
  radMobil?: ReactNode
  /** Brickan bara på dator (Längden och Mallen i Mobil-hem saknar den). */
  brickaBaraDator?: boolean
}

export function Matare({ etikett, bricka, children, rad, radMobil, brickaBaraDator }: MatareProps) {
  return (
    <div className="b3-matare">
      <div className="b3-matare-topp">
        <p className="b3-eyebrow">{etikett}</p>
        {bricka ? <span className={brickaBaraDator ? 'hidden xl:inline-flex' : 'inline-flex'}>{bricka}</span> : null}
      </div>
      {children}
      {rad ? (
        radMobil ? (
          <>
            <p className="b3-matare-rad hidden xl:block">{rad}</p>
            <p className="b3-matare-rad xl:hidden">{radMobil}</p>
          </>
        ) : (
          <p className="b3-matare-rad">{rad}</p>
        )
      ) : null}
    </div>
  )
}

/** Kraven: det stora talet, "av 7 krav får ett svar i brevet" och bitarna. */
export function KravMitt({ besvarade, totalt, etikett }: { besvarade: number; totalt: number; etikett: string }) {
  return (
    <div className="b3-matare-mitt">
      <span className="b3-stortal" aria-hidden="true">
        {besvarade}
      </span>
      <span className="b3-krav-text">
        <span>
          <span className="sr-only">{besvarade} </span>
          av {totalt} krav får ett svar<span className="hidden xl:inline"> i brevet</span>
        </span>
        <KravBitar besvarade={besvarade} totalt={totalt} etikett={etikett} />
      </span>
    </div>
  )
}

/**
 * Längden: ordantalet och hur stor del av en sida brevet fyller. andel är
 * 0 till 1 för en sida; över 1 går brevet över till sida två och stapeln
 * blir orange och full.
 */
export function LangdMitt({ ord, andel, etikett }: { ord: number; andel: number; etikett: string }) {
  const over = andel > 1
  const bredd = Math.round(Math.max(0.04, Math.min(1, andel)) * 274)
  return (
    <>
      <div className="b3-matare-mitt" style={{ gap: 10 }}>
        <span className="b3-medeltal">{ord}</span>
        <span className="b3-matare-enhet">ord</span>
      </div>
      <span className="b3-langd" role="img" aria-label={etikett} data-over={over ? '' : undefined}>
        <span style={{ width: `${Math.round(Math.min(1, andel) * 100)}%` }} />
      </span>
      <svg viewBox="0 0 280 46" className="b3-langd-dator" role="img" aria-label={etikett}>
        <rect x="1" y="1" width="278" height="20" rx="10" style={{ fill: 'var(--b3-papper)', stroke: 'var(--b3-kant)' }} strokeWidth="2" />
        <rect x="3" y="3" width={bredd} height="16" rx="8" style={{ fill: over ? 'var(--koppar)' : 'var(--b3-fyll)' }} />
        <path d="M278 24v8" style={{ stroke: 'var(--b3-ink)' }} strokeWidth="2" strokeLinecap="round" />
        <text x="278" y="44" textAnchor="end" fontSize="11" fontWeight="700" style={{ fill: 'var(--b3-ink-2)' }}>
          sidan är slut
        </text>
        <text x="3" y="44" fontSize="11" fontWeight="700" style={{ fill: 'var(--b3-ink-2)' }}>
          brevet
        </text>
      </svg>
    </>
  )
}

/**
 * Mallen: CV:t och brevet sida vid sida (bilderna som children-props), mallens
 * namn och en rad under (bara dator). cv utelämnat: bara brevet.
 */
export function MallMitt({ namn, cv, brev, rad, etikett }: { namn: string; cv?: ReactNode; brev: ReactNode; rad?: string; etikett: string }) {
  return (
    <div className="b3-matare-mitt" style={{ alignItems: 'center' }}>
      <span className="b3-mallpar" role="img" aria-label={etikett}>
        {cv ? (
          <span className="b3-mallpar-del">
            <span className="b3-mallpar-bild" aria-hidden="true">
              {cv}
            </span>
            <small aria-hidden="true">CV</small>
          </span>
        ) : null}
        <span className="b3-mallpar-del" data-brev="">
          <span className="b3-mallpar-bild" aria-hidden="true">
            {brev}
          </span>
          <small aria-hidden="true">Brev</small>
        </span>
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="b3-mall-namn">{namn}</span>
        {rad ? <span className="b3-mall-rad">{rad}</span> : null}
      </span>
    </div>
  )
}
