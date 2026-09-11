'use client'

/**
 * Klusterbaserad artikel-CTA (docs/plan-konvertering.md, C4).
 *
 * Ersätter ArticleToolBanner och ArticleFinalCTA. Artikelns taggar avgör
 * vilken produkt som föreslås. Karriärartiklar får ingen produkt-CTA alls,
 * bara en länkrad, eftersom vi inte har något att sälja dem just där.
 *
 * Design: vit yta, border i stället för skugga, rounded-xl, font-semibold max,
 * en enda orange yta (primärknappen).
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CtaCluster } from '@/lib/cta/clusters'
import { capture, type CtaPosition } from '@/lib/analytics/events'
import {
  IlluKlusterBrev,
  IlluKlusterCv,
  IlluKlusterGenerisk,
  IlluKlusterIntervju,
  IlluKlusterTest,
} from '@/components/illustrations/ClusterIcons'

interface ClusterCopy {
  Icon: typeof IlluKlusterBrev
  heading: string
  body: string
  ctaLabel: string
  href: string
}

/** Copy ordagrant ur planen. Ändras bara med planen. */
const CLUSTER_COPY: Record<Exclude<CtaCluster, 'career'>, ClusterCopy> = {
  interview: {
    Icon: IlluKlusterIntervju,
    heading: 'Träna svaret innan du sitter i rummet',
    body: 'Du kan bolla dina svar med vår jobbcoach och få följdfrågor som en riktig rekryterare hade ställt. Gratis, direkt i webbläsaren.',
    ctaLabel: 'Träna intervjufrågor',
    href: '/verktyg/jobbcoachen',
  },
  test: {
    Icon: IlluKlusterTest,
    heading: 'Gör testet innan arbetsgivaren gör det',
    body: 'Öva på matrislogik, verbalt och numeriskt resonemang med facit och förklaringar. Ett test per dag är gratis.',
    ctaLabel: 'Gör ett övningstest',
    href: '/verktyg/rekryteringstester',
  },
  letter: {
    Icon: IlluKlusterBrev,
    heading: 'Skriv ditt brev på fem minuter',
    body: 'Fyll i tjänsten du söker, så får du ett färdigt utkast du kan redigera. Fem dagar Premium ingår när du skapar konto.',
    ctaLabel: 'Skapa mitt brev',
    href: '/skapa-brev/start',
  },
  cv: {
    Icon: IlluKlusterCv,
    heading: 'Bygg CV:t på en av våra mallar',
    body: 'Tolv mallar gratis, alla granskade mot svenska rekryteringssystem. Du fyller i, vi formaterar.',
    ctaLabel: 'Välj en mall',
    href: '/verktyg/cv-mallar',
  },
  generic: {
    Icon: IlluKlusterGenerisk,
    heading: 'Bygg CV:t på en av våra mallar',
    body: 'Tolv mallar gratis, alla granskade mot svenska rekryteringssystem. Du fyller i, vi formaterar.',
    ctaLabel: 'Välj en mall',
    href: '/verktyg/cv-mallar',
  },
}

/** Länkrad för karriärartiklar. Ingen produkt, bara vidare läsning. */
const CAREER_LINKS = [
  { label: 'Räkna ut din uppsägningstid', href: '/rakna-ut/uppsagningstid' },
  { label: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
]

export function useCtaImpression(
  cluster: CtaCluster,
  position: CtaPosition,
  slug?: string
) {
  const ref = useRef<HTMLElement | null>(null)
  const seen = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || seen.current) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !seen.current) {
            seen.current = true
            capture('article_cta_shown', { cluster, position, slug })
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [cluster, position, slug])

  return ref
}

interface ArticleClusterCTAProps {
  cluster: CtaCluster
  slug?: string
  position?: CtaPosition
}

/** Inline-varianten, injiceras efter intro i artikeln. */
export default function ArticleClusterCTA({
  cluster,
  slug,
  position = 'inline',
}: ArticleClusterCTAProps) {
  const ref = useCtaImpression(cluster, position, slug)

  if (cluster === 'career') {
    return (
      <aside
        ref={ref as React.RefObject<HTMLElement>}
        className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
        aria-label="Relaterade räknare"
      >
        <p className="text-sm text-neutral-600 mb-3">Räkna på det själv:</p>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2">
          {CAREER_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() =>
                  capture('article_cta_clicked', {
                    cluster,
                    position,
                    slug,
                    target: link.href,
                  })
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800 underline decoration-orange-300 hover:decoration-orange-500 min-h-[44px] sm:min-h-0"
              >
                {link.label}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  const copy = CLUSTER_COPY[cluster]
  const { Icon } = copy

  return (
    <aside
      ref={ref as React.RefObject<HTMLElement>}
      className="not-prose my-8 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
      aria-label={copy.heading}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Icon size={24} className="mt-0.5 flex-shrink-0 text-neutral-700" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-neutral-900 leading-snug mb-1.5">
            {copy.heading}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">{copy.body}</p>
          <Link
            href={copy.href}
            data-cta={`article-${position}-${cluster}`}
            onClick={() =>
              capture('article_cta_clicked', {
                cluster,
                position,
                slug,
                target: copy.href,
              })
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            {copy.ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

/**
 * Bottenvarianten. Samma copy, lite mer luft, plus registreringsraden.
 * Ersätter ArticleFinalCTA.
 */
export function ClusterFinalCTA({ cluster, slug }: { cluster: CtaCluster; slug?: string }) {
  const ref = useCtaImpression(cluster, 'final', slug)

  if (cluster === 'career') {
    return null
  }

  const copy = CLUSTER_COPY[cluster]
  const { Icon } = copy

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="not-prose mt-12 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8"
      aria-label={copy.heading}
    >
      <div className="flex items-start gap-4">
        <Icon size={24} className="mt-1 flex-shrink-0 text-neutral-700" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-900 leading-snug mb-2">
            {copy.heading}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-5">{copy.body}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href={copy.href}
              data-cta={`article-final-${cluster}`}
              onClick={() =>
                capture('article_cta_clicked', {
                  cluster,
                  position: 'final',
                  slug,
                  target: copy.href,
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              {copy.ctaLabel}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <p className="text-xs text-neutral-500">
              Inget kreditkort · Avsluta när du vill
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
