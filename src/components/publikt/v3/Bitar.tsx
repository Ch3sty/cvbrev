/**
 * Grundens små byggstenar (kit.css): chip, numrerad bricka, talbrickor,
 * bocklistan, kortet, rutnätet och länkbrickan. Serverkomponenter.
 */

import Link from 'next/link'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import type { Farg } from './farg'
import { Dorr, type IkonNamn } from './Ikon'

/* ---------- chip ---------- */

export type ChipTyp = 'ton' | 'gratis' | 'premium' | 'vagg' | 'koppar'

/** Litet märke: "Gratis", "Premium", "Nyhet". vagg på mörk botten, koppar för det som ska synas mest. */
export function Chip({ typ = 'ton', children, className = '' }: { typ?: ChipTyp; children: ReactNode; className?: string }) {
  const k = typ === 'ton' ? '' : `p3-chip-${typ}`
  return <span className={`p3-chip ${k} ${className}`.replace(/\s+/g, ' ').trim()}>{children}</span>
}

/* ---------- numrerad bricka ---------- */

export function Nr({ children, typ = 'ton', className = '' }: { children: ReactNode; typ?: 'ton' | 'koppar' | 'vagg'; className?: string }) {
  const k = typ === 'ton' ? '' : `p3-nr-${typ}`
  return (
    <span className={`p3-nr ${k} ${className}`.replace(/\s+/g, ' ').trim()} aria-hidden="true">
      {children}
    </span>
  )
}

/* ---------- talbrickor ---------- */

export interface Talbricka {
  /** Talet, byggt av en konstant ("8", "0 kr", "Anonym"). */
  tal: ReactNode
  text: ReactNode
  /** Ord i stället för tal: mindre storlek så att ordet ryms. */
  ord?: boolean
}

/**
 * Ett tal står aldrig ensamt. På väggen som standard, paPapper på ljus
 * botten. Fyra brickor bryter två och två i telefonen.
 */
export function Talbrickor({ brickor, paPapper, className = '' }: { brickor: readonly Talbricka[]; paPapper?: boolean; className?: string }) {
  const k = ['p3-brickor', brickor.length === 4 ? 'p3-fyra' : '', paPapper ? 'p3-pa-papper' : '', className].filter(Boolean).join(' ')
  return (
    <ul className={k}>
      {brickor.map((b, i) => (
        <li key={i} className={`p3-bricka ${b.ord ? 'p3-ord' : ''}`.trim()}>
          <b>{b.tal}</b>
          <span>{b.text}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- bocklistan ---------- */

/** Koppar bockar på mörk botten (Premium), paPapper ger tonade bockar på ljus botten. */
export function Bocklista({ punkter, paPapper, className = '' }: { punkter: readonly ReactNode[]; paPapper?: boolean; className?: string }) {
  return (
    <ul className={`p3-bockar ${paPapper ? 'p3-pa-papper' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      {punkter.map((p, i) => (
        <li key={i}>
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- kortet ---------- */

/**
 * Papper med tjock kant och klack. ton ger rummets ljusa ton. farg sätter
 * en annan färg lokalt. Rubriker och stycken på kortet är alltid bläck,
 * även på en vägg eller ö.
 */
export function Kort({
  children,
  ton,
  farg,
  som: Som = 'div',
  id,
  className = '',
  style,
}: {
  children: ReactNode
  ton?: boolean
  farg?: Farg
  som?: ElementType
  id?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <Som id={id} className={`p3-kort ${ton ? 'p3-kort-ton' : ''} ${className}`.replace(/\s+/g, ' ').trim()} data-p3-farg={farg} style={style}>
      {children}
    </Som>
  )
}

/** Bildytan i ett kort (golvets ton, minst 120 px hög). */
export function KortBild({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p3-kort-bild ${className}`.trim()}>{children}</div>
}

/* ---------- rutnätet ---------- */

/** Två, tre eller fyra kolumner på dator, två från 700 px, en i telefonen. */
export function Rutnat({ kolumner = 3, children, som: Som = 'div', className = '', style }: { kolumner?: 2 | 3 | 4; children: ReactNode; som?: ElementType; className?: string; style?: CSSProperties }) {
  return (
    <Som className={`p3-rutnat p3-r${kolumner} ${className}`.trim()} style={style}>
      {children}
    </Som>
  )
}

/* ---------- länkbrickan ---------- */

/**
 * En länk till en annan del: dörr i delens färg, namnet och en rad om vad
 * man får. Ankartexten är rubrik, aldrig "Läs mer".
 */
export function LankBricka({
  href,
  rubrik,
  text,
  farg,
  ikon,
  rubrikNiva = 'b',
  className = '',
}: {
  href: string
  rubrik: ReactNode
  text?: ReactNode
  farg?: Farg
  /** Standard: delens ikon ur farg. */
  ikon?: IkonNamn
  /** 'h3' när länkens namn är en rubrik på sidan sedan tidigare (SEO), annars fet text. */
  rubrikNiva?: 'b' | 'h3'
  className?: string
}) {
  const namn: IkonNamn = ikon ?? farg ?? 'pil'
  const Rubrik = rubrikNiva
  return (
    <Link href={href} className={`p3-lankbricka ${text ? '' : 'p3-utan-text'} ${className}`.replace(/\s+/g, ' ').trim()} data-p3-farg={farg}>
      <Dorr ikon={namn} />
      <Rubrik className="p3-lb-namn">{rubrik}</Rubrik>
      {text ? <span>{text}</span> : null}
    </Link>
  )
}
