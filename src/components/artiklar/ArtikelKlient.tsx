'use client'

/**
 * Artikelramens enda klientkod (docs/design/analys-artiklar-2026-09-23.html,
 * avsnitt 5 och 7, steg 2 och 4).
 *
 * Renderar ingenting. Den gör fyra saker efter första målningen:
 *   1. article_viewed en gång per sidvisning.
 *   2. article_cta_shown när ett reklamkort (data-cta-position) syns till
 *      40 procent, en gång per kort.
 *   3. article_cta_clicked på klick i ett reklamkort (data-cta-klick), via
 *      en enda lyssnare på dokumentet.
 *   4. Tråden i innehållsförteckningen: länken till avsnittet man läser får
 *      aria-current och .toc-aktiv. Utan skript står första avsnittet
 *      markerat, eftersom servern sätter det.
 *
 * Allt annat i ramen är serverrenderat. Inga beroenden utöver capture().
 */

import { useEffect } from 'react'
import { capture, type CtaPosition } from '@/lib/analytics/events'
import type { CtaCluster } from '@/lib/cta/clusters'

export default function ArtikelKlient({ slug, cluster }: { slug?: string; cluster?: CtaCluster }) {
  useEffect(() => {
    if (slug) capture('article_viewed', { slug, cluster })

    const kort = Array.from(document.querySelectorAll<HTMLElement>('[data-cta-position]'))
    const sedda = new WeakSet<Element>()
    let visning: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined' && kort.length) {
      visning = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting || sedda.has(e.target)) continue
            sedda.add(e.target)
            const el = e.target as HTMLElement
            capture('article_cta_shown', {
              cluster: (el.dataset.ctaCluster as CtaCluster) || cluster,
              position: (el.dataset.ctaPosition as CtaPosition) || 'inline',
              variant: el.dataset.ctaVariant,
              slug: el.dataset.ctaSlug || slug,
            })
            visning?.unobserve(el)
          }
        },
        { threshold: 0.4 }
      )
      kort.forEach((k) => visning!.observe(k))
    }

    const klick = (ev: MouseEvent) => {
      const a = (ev.target as Element | null)?.closest<HTMLElement>('[data-cta-klick]')
      if (!a) return
      const ram = a.closest<HTMLElement>('[data-cta-position]')
      capture('article_cta_clicked', {
        cluster: (ram?.dataset.ctaCluster as CtaCluster) || cluster,
        position: (ram?.dataset.ctaPosition as CtaPosition) || 'inline',
        variant: ram?.dataset.ctaVariant,
        slug: ram?.dataset.ctaSlug || slug,
        target: a.dataset.ctaKlick || '',
      })
    }
    document.addEventListener('click', klick)

    // Innehållsförteckningens tråd.
    const lankar = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]'))
    let avsnitt: IntersectionObserver | null = null
    if (lankar.length && typeof IntersectionObserver !== 'undefined') {
      const markera = (id: string) => {
        for (const l of lankar) {
          const aktiv = l.getAttribute('href') === `#${id}`
          l.classList.toggle('toc-aktiv', aktiv)
          if (aktiv) l.setAttribute('aria-current', 'location')
          else l.removeAttribute('aria-current')
        }
      }
      avsnitt = new IntersectionObserver(
        (entries) => {
          const synlig = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          if (synlig) markera(synlig.target.id)
        },
        { rootMargin: '-80px 0px -70% 0px' }
      )
      for (const l of lankar) {
        const mal = document.getElementById(decodeURIComponent(l.getAttribute('href')!.slice(1)))
        if (mal) avsnitt.observe(mal)
      }
    }

    return () => {
      visning?.disconnect()
      avsnitt?.disconnect()
      document.removeEventListener('click', klick)
    }
  }, [slug, cluster])

  return null
}
