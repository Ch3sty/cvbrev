/**
 * Knapparna (kit.css: .knapp, .knapp-vit, .knapp-glas, .knapp-liten,
 * .lank). Koppar är den primära handlingen, exakt en per skärmyta. Klack i
 * stället för skugga. Interna adresser går genom next/link.
 *
 * Övriga attribut (data-cta, data-primar, aria-*) skickas vidare till
 * länken: <Knapp href="/register" data-cta="hjalte">.
 */

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Ikon } from './Ikon'

export type KnappVariant = 'koppar' | 'vit' | 'glas'

type Gemensamt = {
  children: ReactNode
  variant?: KnappVariant
  liten?: boolean
  bred?: boolean
  /** Pilen efter texten (hjältens handling). */
  pil?: boolean
  className?: string
}

type SomLank = Gemensamt & { som?: 'lank'; href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>
type SomKnapp = Gemensamt & { som: 'knapp'; href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>
/** Bara bilden av en knapp (i en ritad skärm), ingen handling. */
type SomBild = Gemensamt & { som: 'bild'; href?: never }

export function knappKlass({ variant = 'koppar', liten, bred, className = '' }: Pick<Gemensamt, 'variant' | 'liten' | 'bred' | 'className'>) {
  return [
    'p3-knapp',
    variant === 'vit' ? 'p3-knapp-vit' : variant === 'glas' ? 'p3-knapp-glas' : '',
    liten ? 'p3-knapp-liten' : '',
    bred ? 'p3-knapp-bred' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function Knapp(props: SomLank | SomKnapp | SomBild) {
  const klass = knappKlass(props)
  const innehall = (
    <>
      {props.children}
      {props.pil ? <Ikon namn="pil" /> : null}
    </>
  )
  if (props.som === 'bild') {
    return (
      <span className={klass} aria-hidden="true">
        {innehall}
      </span>
    )
  }
  if (props.som === 'knapp') {
    const { som, children, variant, liten, bred, pil, className, ...knapp } = props
    void [som, children, variant, liten, bred, pil, className]
    return (
      <button type="button" {...knapp} className={klass}>
        {innehall}
      </button>
    )
  }
  const { som, children, variant, liten, bred, pil, className, href, ...lank } = props
  void [som, children, variant, liten, bred, pil, className]
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={klass} {...lank}>
        {innehall}
      </a>
    )
  }
  return (
    <Link href={href} className={klass} {...lank}>
      {innehall}
    </Link>
  )
}

/** Raden med handlingar: knappen först, sedan en textlänk eller en rad om vad som är gratis. */
export function Knapprad({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p3-knapprad ${className}`.trim()}>{children}</div>
}

/** Den understrukna textlänken bredvid knappen ("Se hur det fungerar"). */
export function TextLank({
  href,
  children,
  className = '',
  ...rest
}: { href: string; children: ReactNode; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  const klass = `p3-lank ${className}`.trim()
  if (/^(https?:|mailto:|tel:)/.test(href) || href.startsWith('#')) {
    return (
      <a href={href} className={klass} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={klass} {...rest}>
      {children}
    </Link>
  )
}

/** Raden bredvid knappen: ett chip och vad som ingår ("Gratis  Tre träffar"). */
export function GratisRad({ chip, children }: { chip?: ReactNode; children?: ReactNode }) {
  return (
    <span className="p3-gratisrad">
      {chip}
      {children}
    </span>
  )
}
