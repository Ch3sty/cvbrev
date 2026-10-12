'use client'

/**
 * Den fasta knappraden i botten under 1024 px, när hjälten scrollats förbi
 * (spec-publikt-v2 del A avsnitt 3 och 4). En knapp, 56 px, safe area under.
 * Glider in med transform, aldrig höjd, och ligger utanför flödet (CLS 0).
 * Utan JavaScript syns den aldrig; hjältens knapp finns ändå kvar i sidan.
 *
 * Ersätter StickyMobileCTA på de ombyggda sidorna. Ramen räknas inte som
 * innehåll i SEO-avtrycket (data-site-chrome).
 */

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function FastKnapprad({
  text,
  href,
  observera,
  children,
}: {
  text: string
  href: string
  /** Id på hjälten. Raden syns när hjälten lämnat bilden uppåt. */
  observera: string
  /** Egen knapp i stället för länken, till exempel köpknappen. */
  children?: ReactNode
}) {
  const [syns, setSyns] = useState(false)
  const rad = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hjalte = document.getElementById(observera)
    if (!hjalte || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([post]) => setSyns(!post.isIntersecting && post.boundingClientRect.top < 0),
      { threshold: 0 }
    )
    obs.observe(hjalte)
    return () => obs.disconnect()
  }, [observera])

  return (
    <div ref={rad} className="pub-botten" data-syns={syns ? 'true' : 'false'} data-site-chrome="" aria-hidden={!syns}>
      {children ?? (
        <Link className="pub-knapp" href={href} tabIndex={syns ? undefined : -1}>
          {text}
        </Link>
      )}
    </div>
  )
}
