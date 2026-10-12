/**
 * Bläck-ytan för Premium (spec-publikt-v2 del A avsnitt 3). Namnet, priset
 * och perioden läses ur plans.ts, aldrig som fasta tal. Gradientordet
 * "Premium" finns bara här. Med bild (telefoner) blir det två spalter och
 * telefonsolfjädern, utan bild en centrerad spalt.
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { PLAN_BY_KEY, SALD_PLAN, paketKort } from '@/lib/plans/plans'
import Rum from './Rum'

/** "Premium" med gradienten. Bara på bläck. */
export function PremiumOrd() {
  return <span className="pub-gradord">{paketKort()}</span>
}

/** Priset stort: "149 kr" och perioden med uppsägningen i liten text. */
export function PrisRad({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const plan = PLAN_BY_KEY[SALD_PLAN]
  return (
    <p className={`pub-pris ${className}`.trim()} style={style}>
      {plan.amount} kr<small>{plan.suffix}, säg upp när du vill</small>
    </p>
  )
}

export default function PremiumBlock({
  id,
  kick,
  rubrik,
  rubrikNiva = 'h2',
  text,
  punkter,
  pris,
  knapp,
  lank,
  not,
  bild,
  vag,
  children,
}: {
  id?: string
  kick?: ReactNode
  rubrik: ReactNode
  rubrikNiva?: 'h1' | 'h2' | 'h3' | 'p'
  text?: ReactNode
  punkter?: readonly string[]
  /** Visa priset stort. */
  pris?: boolean
  knapp: ReactNode | { text: string; href: string }
  lank?: { text: string; href: string }
  /** Raden bredvid knappen. */
  not?: string
  /** Telefonerna till höger (solfjädern). */
  bild?: ReactNode
  vag?: 'mark' | 'panel'
  children?: ReactNode
}) {
  const Rubrik = rubrikNiva
  const knappEl =
    knapp && typeof knapp === 'object' && 'href' in knapp ? (
      <Link className="pub-knapp" href={knapp.href}>
        {knapp.text}
      </Link>
    ) : (
      knapp
    )
  const innehall = (
    <>
      {kick ? <p className="pub-kick">{kick}</p> : null}
      <Rubrik className="pub-h2">{rubrik}</Rubrik>
      {text ? (
        <p className="pub-ingress" style={{ marginTop: 16, marginInline: bild ? undefined : 'auto' }}>
          {text}
        </p>
      ) : null}
      {punkter?.length ? (
        <ul className="pub-bock" style={{ marginTop: 28 }}>
          {punkter.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
      {pris ? <PrisRad style={{ marginTop: 32 }} /> : null}
      <div className={`pub-handling ${bild ? '' : 'pub-handling-mitt'}`.trim()}>
        {knappEl}
        {lank ? (
          <Link className="pub-lank" href={lank.href}>
            {lank.text}
          </Link>
        ) : null}
        {not ? <span className="pub-liten">{not}</span> : null}
      </div>
      {children}
    </>
  )
  return (
    <Rum yta="premium" id={id} vag={vag}>
      {bild ? (
        <div className="pub-wrap pub-tva">
          <div className="pub-tva-text">{innehall}</div>
          <div className="pub-solfjader">{bild}</div>
        </div>
      ) : (
        <div className="pub-wrap" style={{ textAlign: 'center', maxWidth: 720 }}>
          {innehall}
        </div>
      )}
    </Rum>
  )
}
