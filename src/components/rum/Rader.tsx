/**
 * Rader i ett kort (spec-rummen 4.4, konceptets .rader): 56 px höga, 12 px
 * mellan symbol och text, hårlinje mellan raderna. Titeln 15/20 600 i ink-1,
 * metaraden 13/18 i ink-3. Symbolen är 40 px i ton-ink (svag i ink-3), en
 * valfri stapel i ton eller koppar, och till höger en länk, ett chip eller
 * en chevron.
 *
 * Server component. En rad med href blir en länk över hela raden.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

export interface RadProps {
  /** 40 px, text-ton-ink. */
  symbol?: ReactNode
  /** Symbolen i ink-3 i stället för ton-ink. */
  svag?: boolean
  titel: ReactNode
  meta?: ReactNode
  /** Andel 0 till 1. */
  stapel?: { andel: number; ton: 'ton' | 'koppar' }
  /** Länk, chip eller IkonChev. */
  hoger?: ReactNode
  href?: string
  /**
   * I en tredjedelsspalt på dator står högersidan under metan, vänsterställd
   * (beslut-hemvy 2026-10-11, avvikelse 4). Mobil oförändrad.
   */
  hogerUnder?: boolean
  /**
   * Under lg: ett chip till höger står under metan, vänsterställt i textens
   * kolumn (figurserier-spec 15.3), så att metan inte bryts i fem rader.
   */
  chipUnder?: boolean
}

export function Rad({ symbol, svag, titel, meta, stapel, hoger, href, hogerUnder, chipUnder }: RadProps) {
  const innehall = (
    <>
      {symbol ? (
        <span className={`h-10 w-10 shrink-0 ${svag ? 'text-ink-3' : 'text-ton-ink'}`} aria-hidden="true">
          {symbol}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-5 text-ink-1">{titel}</span>
        {meta ? <span className="mt-0.5 block text-meta text-ink-3">{meta}</span> : null}
        {stapel ? (
          <span className="mt-2 block h-1.5 overflow-hidden rounded-[3px] border border-kant bg-papper-2">
            <span
              className={`block h-full rounded-[3px] ${stapel.ton === 'koppar' ? 'bg-koppar' : 'bg-ton-ink'}`}
              style={{ width: `${Math.round(Math.max(0, Math.min(1, stapel.andel)) * 100)}%` }}
            />
          </span>
        ) : null}
      </span>
      {hoger ? (
        <span
          className={`shrink-0${hogerUnder ? ` lg:-mt-2 lg:w-full${symbol ? ' lg:pl-[52px]' : ''}` : ''}${chipUnder ? ` max-lg:-mt-1 max-lg:w-full${symbol ? ' max-lg:pl-[52px]' : ''}` : ''}`}
        >
          {hoger}
        </span>
      ) : null}
    </>
  )
  const klass = `flex min-h-14 items-center gap-3 px-4 py-3${hogerUnder && hoger ? ' lg:flex-wrap' : ''}${chipUnder && hoger ? ' max-lg:flex-wrap' : ''}`
  if (href) {
    return (
      <Link href={href} className={klass}>
        {innehall}
      </Link>
    )
  }
  return <div className={klass}>{innehall}</div>
}

export interface RaderProps {
  children: ReactNode
  label?: string
  className?: string
}

/** Kortet som håller raderna. */
export default function Rader({ children, label, className }: RaderProps) {
  return (
    <section
      aria-label={label}
      className={`rounded-2xl border border-kant bg-papper text-ink-1 [&>*+*]:border-t [&>*+*]:border-kant ${className ?? ''}`}
    >
      {children}
    </section>
  )
}
