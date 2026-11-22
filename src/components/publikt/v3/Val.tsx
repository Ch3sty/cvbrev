/**
 * Valen ovanför en lista: filterchips, sökfältet på väggen och
 * situationsraden (onskemal.md: CV-mallarna, CV-exemplen och brevnavet
 * ritade var sin). Serverkomponenter utan JavaScript:
 *
 * - Filterchips är radioknappar med etiketter. Sidan döljer korten i CSS med
 *   :has på chipens id (`${idPrefix}${val.id}`), så att filtret fungerar utan
 *   JavaScript och alla kort står i serverns HTML.
 * - SokFalt är ett vanligt GET-formulär. En sida som filtrerar medan man
 *   skriver ritar sin klientkomponent med samma klasser (p3-sok, p3-sok-falt).
 * - Situationsrad är vanliga länkar i en nav.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

export interface FilterVal {
  id: string
  namn: ReactNode
  /** Antalet i chipet, ur datan. */
  antal?: number
}

export function Filterchips({
  namn,
  idPrefix,
  val,
  forval,
  legend = 'Filtrera',
  className = '',
}: {
  /** Radiogruppens namn. */
  namn: string
  /** Prefix för chipens id, som sidans CSS läser. */
  idPrefix: string
  val: readonly FilterVal[]
  /** Valt från början (standard: första). */
  forval?: string
  /** Gruppens namn för skärmläsare. */
  legend?: string
  className?: string
}) {
  const valt = forval ?? val[0]?.id
  return (
    <fieldset className={`p3-filter ${className}`.trim()}>
      <legend className="p3-dold">{legend}</legend>
      {val.map((v) => (
        <span key={v.id}>
          <input type="radio" name={namn} id={`${idPrefix}${v.id}`} defaultChecked={v.id === valt} />
          <label htmlFor={`${idPrefix}${v.id}`}>
            {v.namn}
            {v.antal !== undefined ? (
              <>
                {' '}
                <b>{v.antal}</b>
              </>
            ) : null}
          </label>
        </span>
      ))}
    </fieldset>
  )
}

/** Förstoringsglaset i sökfältet. */
export function SokIkon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  )
}

export function SokFalt({
  action,
  id,
  etikett,
  placeholder,
  namn = 'q',
  knapp = 'Sök',
  className = '',
}: {
  action: string
  id: string
  /** Fältets etikett (dold, läses upp). */
  etikett: string
  placeholder?: string
  namn?: string
  knapp?: string
  className?: string
}) {
  return (
    <form className={`p3-sok ${className}`.trim()} action={action} method="get" role="search">
      <span className="p3-sok-falt">
        <SokIkon />
        <label htmlFor={id} className="p3-dold">
          {etikett}
        </label>
        <input id={id} type="search" name={namn} placeholder={placeholder} autoComplete="off" />
      </span>
      <button type="submit" className="p3-knapp">
        {knapp}
      </button>
    </form>
  )
}

export function Situationsrad({
  etikett = 'Din situation',
  ariaLabel = 'Välj efter situation',
  lankar,
  className = '',
}: {
  etikett?: ReactNode
  ariaLabel?: string
  lankar: readonly { href: string; text: ReactNode }[]
  className?: string
}) {
  return (
    <nav className={`p3-situation ${className}`.trim()} aria-label={ariaLabel}>
      {etikett ? <span>{etikett}</span> : null}
      {lankar.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.text}
        </Link>
      ))}
    </nav>
  )
}
