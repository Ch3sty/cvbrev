'use client'

/**
 * Ramen kring provet i artikeln: etiketten, uppgiftens nummer och tråden,
 * uppgiften, felet och resultatet med spärren. Rubriker är aldrig h2 eller
 * h3 (spärrlistan för reklamkort: artikelns rubrikträd ska inte ändras).
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'
import { KONTO_PANEL, PROVA, PROV_TYP_PANEL } from '@/components/registrering/registrering-copy'
import { arNyProvTyp, type ProvTyp } from '@/lib/tests/prov-typer'
import type { ProvaResultat } from '@/lib/tests/prova-lokalt'

export function ArtikelProvRam({
  etikett,
  rad,
  nu,
  av,
  children,
  fel,
  registerHref,
  laddar,
}: {
  etikett: string
  rad: string
  nu: number
  av: number
  children: ReactNode
  fel: string | null
  registerHref: string | null
  laddar: boolean
}) {
  return (
    <div className="art-prov-ram" aria-busy={laddar}>
      <div className="art-prov-topp">
        <div>
          <p className="pub-kick">{etikett}</p>
          <p className="art-prov-rad">{rad}</p>
        </div>
        <div className="pub-prov-segment" aria-hidden="true">
          {Array.from({ length: av }, (_, i) => (
            <i key={i} className={i < nu ? 'klar' : undefined} />
          ))}
        </div>
      </div>
      {children}
      {fel ? (
        <p className="art-prov-fel" role="alert">
          {fel}
          {registerHref ? (
            <>
              {' '}
              <Link href={registerHref} className="pub-lank">
                {PROVA.intro.skapaKonto}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <p className="pub-liten art-prov-under" aria-live="polite">
        {laddar ? (nu <= 1 ? 'Startar provet' : PROVA.fraga.rattar) : 'Inget konto, ingen tidtagning. Nästa uppgift kommer när du svarat.'}
      </p>
    </div>
  )
}

export function ArtikelProvResultat({ typ, resultat, token, slug }: { typ: ProvTyp; resultat: ProvaResultat; token: string; slug: string }) {
  const ny = arNyProvTyp(typ) ? typ : null
  const registerHref = `/register?test=${encodeURIComponent(token)}`
  const rader = ny ? PROV_TYP_PANEL.rader(ny, resultat.fel, resultat.total) : KONTO_PANEL.rader(resultat.fel, resultat.total)
  return (
    <div className="art-prov-ram art-prov-resultat" data-prov-resultat>
      <p className="pub-kick">{PROVA.resultat.kick}</p>
      <p className="art-prov-tal">
        {resultat.score}
        <small>{` rätt av ${resultat.total}`}</small>
      </p>
      <div className="art-prov-brickor" aria-hidden="true">
        {Array.from({ length: resultat.total }, (_, i) => (
          <i key={i} className={resultat.fel.includes(i) ? 'fel' : 'ratt'} />
        ))}
      </div>
      <p className="art-prov-sparr">{ny ? PROV_TYP_PANEL.sparr(ny, resultat.fel) : PROVA.resultat.sparr(resultat.fel)}</p>
      <ul className="pub-prov-bock">
        {rader.map((r) => (
          <li key={r.fet}>
            <span>
              <b>{r.fet}</b>
              {r.text}
            </span>
          </li>
        ))}
      </ul>
      <div className="pub-handling">
        <Link
          href={registerHref}
          data-cta="artikel-prov-gate"
          className="pub-knapp"
          onClick={() => capture('signup_started', { cluster: 'test', source_page: `/artiklar/${slug}` })}
        >
          {PROVA.resultat.knapp(resultat.fel)}
        </Link>
      </div>
      <p className="pub-liten">{PROVA.resultat.liten}</p>
    </div>
  )
}
