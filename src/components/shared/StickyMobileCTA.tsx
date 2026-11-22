'use client'

/**
 * Sticky CTA på mobil (docs/plan-konvertering.md, C5).
 *
 * Visas först när läsaren har kommit en bit ner och bara vid nedåtscroll,
 * så den inte står i vägen för den som backar upp i texten. Animeras med
 * transform, aldrig height, så layouten inte hoppar (CLS 0).
 *
 * Karriärartiklar får ingen sticky alls: ingen produkt att föreslå.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IkonX } from '@/components/illustrations/RumSymboler'
import type { CtaCluster } from '@/lib/cta/clusters'
import { capture } from '@/lib/analytics/events'

/** Label och mål per kluster. Career saknas med flit. */
const CLUSTER_CTA: Record<Exclude<CtaCluster, 'career'>, { label: string; href: string }> = {
  // Intervjuklustret leder till provet (S6, beslut 2026-11-15).
  // "uppgifter", produktens ord (SEO-beskedet avsnitt 20, samma som artiklarnas hjälteknapp).
  interview: { label: 'Prova fem uppgifter gratis', href: '/verktyg/rekryteringstester/prova' },
  test: { label: 'Prova fem uppgifter gratis', href: '/verktyg/rekryteringstester/prova' },
  letter: { label: 'Skriv mitt personliga brev', href: '/skapa-brev/start' },
  cv: { label: 'Välj en mall', href: '/cv-mallar' },
  generic: { label: 'Välj en mall', href: '/cv-mallar' },
}

const DISMISS_PREFIX = 'jc_sticky_dismissed:'

/** Uppåtscroll som krävs för att gömma baren igen. */
const HIDE_AFTER_UP_PX = 80

interface StickyMobileCTAProps {
  cluster: CtaCluster
  /** Identifierar sidan i dismiss-nyckeln och i eventet. */
  slug?: string
  /** Överstyr label och mål, till exempel på exempelsidorna. */
  label?: string
  href?: string
}

export default function StickyMobileCTA({
  cluster,
  slug,
  label,
  href,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true) // pessimistiskt tills vi läst sessionStorage
  const [reducedMotion, setReducedMotion] = useState(false)
  const lastY = useRef(0)
  const lowestY = useRef(0)
  const shownLogged = useRef(false)

  const dismissKey = `${DISMISS_PREFIX}${slug ?? cluster}`

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(dismissKey) === '1')
    } catch {
      setDismissed(false)
    }
  }, [dismissKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (cluster === 'career' || dismissed) return

    lastY.current = window.scrollY
    lowestY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const pageHeight = document.documentElement.scrollHeight
      const threshold = Math.max(600, pageHeight * 0.25)
      const scrollingDown = y > lastY.current

      if (scrollingDown) {
        lowestY.current = y
        if (y > threshold) setVisible(true)
      } else if (lowestY.current - y > HIDE_AFTER_UP_PX) {
        setVisible(false)
        lowestY.current = y
      }

      lastY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [cluster, dismissed])

  useEffect(() => {
    if (visible && !shownLogged.current) {
      shownLogged.current = true
      capture('article_cta_shown', { cluster, position: 'sticky', slug })
    }
  }, [visible, cluster, slug])

  if (cluster === 'career' || dismissed) return null

  const copy = CLUSTER_CTA[cluster]
  const ctaLabel = label ?? copy.label
  const ctaHref = href ?? copy.href

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(dismissKey, '1')
    } catch {
      // Privat läge: baren kommer tillbaka nästa laddning, acceptabelt.
    }
  }

  return (
    <div
      data-sticky-mobil
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-kant bg-panel"
      style={{
        height: 72,
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: reducedMotion ? 'none' : 'transform 200ms ease-out',
        // Husets lyft i stället för en egen skugga (art-director A2).
        boxShadow: 'var(--lyft)',
      }}
      aria-hidden={!visible}
    >
      <div className="flex h-[72px] items-center gap-3 px-4">
        <Link
          href={ctaHref}
          data-cta={`sticky-${cluster}`}
          tabIndex={visible ? undefined : -1}
          onClick={() =>
            capture('article_cta_clicked', {
              cluster,
              position: 'sticky',
              slug,
              target: ctaHref,
            })
          }
          // Husets pillerknapp (publikt.css), 48 px hög i baren.
          className="pub-knapp flex-1 px-4 text-[15px]"
          style={{ minHeight: 48 }}
        >
          {ctaLabel}
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          tabIndex={visible ? undefined : -1}
          aria-label="Dölj"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-insunken"
        >
          <IkonX size={20} />
        </button>
      </div>
    </div>
  )
}
