/**
 * Premium-ön och prisraden (kit.css: .premium, .pris, .bockar). Premium är
 * sidans mörkaste ton med kopparklack, aldrig svart. Namn, pris och period
 * läses ur plans.ts. Kampanjpriset följer med av sig självt genom
 * KampanjVarianter, som i dag.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { PLAN_BY_KEY, SALD_PLAN, paketNamn } from '@/lib/plans/plans'
import { KampanjPris, KampanjVarianter } from '@/components/kampanj/Kampanj'
import { Bocklista } from './Bitar'
import { knappKlass } from './Knapp'

/**
 * "149 kr i månaden" stort. uppsagning lägger till ", säg upp när du vill".
 * paPapper ger bläck i stället för vitt (på ett kort eller golvet).
 */
export function PrisRad({ uppsagning, paPapper, className = '' }: { uppsagning?: boolean; paPapper?: boolean; className?: string }) {
  const plan = PLAN_BY_KEY[SALD_PLAN]
  return (
    <p className={`p3-pris ${paPapper ? 'p3-pa-papper' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      <KampanjVarianter
        ord={
          <>
            {plan.amount} kr<small>{plan.suffix}{uppsagning ? ', säg upp när du vill' : ''}</small>
          </>
        }
        kampanj={(k) => <KampanjPris k={k} />}
      />
    </p>
  )
}

export function PremiumO({
  id,
  etikett = paketNamn(SALD_PLAN),
  rubrik,
  rubrikNiva = 'h2',
  text,
  pris = true,
  uppsagning,
  knapp,
  not,
  punkter,
  children,
  className = '',
}: {
  id?: string
  /** Standard: "Jobbcoach Premium" ur plans.ts. */
  etikett?: ReactNode
  rubrik: ReactNode
  rubrikNiva?: 'h2' | 'h3' | 'p'
  text?: ReactNode
  /** Priset stort (standard). */
  pris?: boolean
  uppsagning?: boolean
  /** En länk ({ text, href }, ritas som kopparknapp) eller ett eget element (köpknappen). */
  knapp?: ReactNode | { text: ReactNode; href: string; dataCta?: string }
  /** Liten rad under knappen ("Kortbetalning via Stripe. Kvitto på mejl."). */
  not?: ReactNode
  /** Bocklistan till höger på dator. */
  punkter?: readonly ReactNode[]
  children?: ReactNode
  className?: string
}) {
  const Rubrik = rubrikNiva
  const knappEl =
    knapp && typeof knapp === 'object' && 'href' in (knapp as object) ? (
      <Link className={knappKlass({})} href={(knapp as { href: string }).href} data-cta={(knapp as { dataCta?: string }).dataCta}>
        {(knapp as { text: ReactNode }).text}
      </Link>
    ) : (
      (knapp as ReactNode)
    )
  return (
    <div id={id} className={`p3-premium ${className}`.trim()}>
      <div className={`p3-premium-rad ${punkter?.length ? 'p3-med-lista' : ''}`.trim()}>
        <div className="p3-premium-text">
          {etikett ? <p className="p3-ey">{etikett}</p> : null}
          <Rubrik className="p3-h2">{rubrik}</Rubrik>
          {text ? <p style={{ fontSize: 17 }}>{text}</p> : null}
          {pris ? <PrisRad uppsagning={uppsagning} /> : null}
          {knappEl ? <div className="p3-knapprad">{knappEl}</div> : null}
          {not ? <p className="p3-liten">{not}</p> : null}
          {children}
        </div>
        {punkter?.length ? <Bocklista punkter={punkter} /> : null}
      </div>
    </div>
  )
}
