'use client'

/**
 * Artikelramens enda klientkod (docs/design/analys-artiklar-2026-09-23.html,
 * avsnitt 5 och 7, steg 2 och 4).
 *
 * Renderar ingenting. Den gör fem saker efter första målningen:
 *   1. article_viewed en gång per sidvisning.
 *   2. article_cta_shown när ett reklamkort (data-cta-position) syns till
 *      40 procent, en gång per kort.
 *   3. article_cta_clicked på klick i ett reklamkort (data-cta-klick), via
 *      en enda lyssnare på dokumentet.
 *   4. Tråden i innehållsförteckningen: länken till avsnittet man läser får
 *      aria-current och .toc-aktiv. Utan skript står första avsnittet
 *      markerat, eftersom servern sätter det.
 *   5. Källan till kontot (provkalla.ts): ett klick härifrån till testerna,
 *      provet eller registreringen sparar artikelns slug och valet "Mitt
 *      test" (länkens ?mitt_test= eller artikelns eget), så att kontot
 *      får källan och valet utan en ny fråga (saas-leads beslut 6).
 *
 * Allt annat i ramen är serverrenderat. Inga beroenden utöver capture() och provkalla.ts.
 */

import { useEffect } from 'react'
import { capture, type CtaPosition } from '@/lib/analytics/events'
import { mittTestForArtikel, sparaProvkalla } from '@/lib/analytics/provkalla'
import type { CtaCluster } from '@/lib/cta/clusters'

/** Länkar som leder till produkten: testerna, provet och registreringen. */
const PRODUKT = /^\/(verktyg\/rekryteringstester|dashboard\/tester|register)(\/|$)/

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

    // Källan till kontot: klick till testerna, provet eller registreringen.
    const produkt = (ev: MouseEvent) => {
      if (!slug) return
      const a = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
      if (!a) return
      try {
        const url = new URL(a.href, window.location.href)
        if (url.origin !== window.location.origin) return
        const val = url.searchParams.get('mitt_test')
        if (!PRODUKT.test(url.pathname) && !val) return
        sparaProvkalla({ slug, mitt_test: mittTestForArtikel(slug, val), via: 'artikel' })
      } catch {
        /* mätning får aldrig fälla sidan */
      }
    }
    document.addEventListener('click', produkt, true)

    // Innehållsförteckningens tråd.
    const lankar = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]'))
    let avsnitt: IntersectionObserver | null = null
    let storlek: ResizeObserver | null = null
    if (lankar.length && typeof IntersectionObserver !== 'undefined') {
      const lugn = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // Listan i sidospalten rullar i sig själv när den inte ryms. Den aktiva
      // länken hålls synlig genom listans egen scrollTop, aldrig
      // scrollIntoView, som kan rulla sidan.
      const visaILista = (l: HTMLAnchorElement, mjukt = true) => {
        const lista = l.closest<HTMLElement>('.ib-toc')
        if (!lista || lista.scrollHeight <= lista.clientHeight + 1) return
        const ram = lista.getBoundingClientRect()
        const r = l.getBoundingClientRect()
        const luft = 24
        let mal: number | null = null
        if (r.top < ram.top + luft) mal = lista.scrollTop + (r.top - ram.top) - luft
        else if (r.bottom > ram.bottom - luft) mal = lista.scrollTop + (r.bottom - ram.bottom) + luft
        if (mal === null) return
        const top = Math.max(0, Math.min(mal, lista.scrollHeight - lista.clientHeight))
        if (lugn || !mjukt || typeof lista.scrollTo !== 'function') lista.scrollTop = top
        else lista.scrollTo({ top, behavior: 'smooth' })
      }
      const markera = (id: string) => {
        for (const l of lankar) {
          const aktiv = l.getAttribute('href') === `#${id}`
          const varAktiv = l.classList.contains('toc-aktiv')
          l.classList.toggle('toc-aktiv', aktiv)
          if (aktiv) l.setAttribute('aria-current', 'location')
          else l.removeAttribute('aria-current')
          if (aktiv && !varAktiv) visaILista(l)
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
      // Blir listan lägre (lägre fönster, cookieraden) står den aktiva
      // länken kvar i synfältet.
      const lista = document.querySelector<HTMLElement>('.ib-sido .ib-toc')
      if (lista && typeof ResizeObserver !== 'undefined') {
        storlek = new ResizeObserver(() => {
          const aktiv = lista.querySelector<HTMLAnchorElement>('a.toc-aktiv')
          if (aktiv) visaILista(aktiv, false)
        })
        storlek.observe(lista)
      }
    }

    return () => {
      visning?.disconnect()
      avsnitt?.disconnect()
      storlek?.disconnect()
      document.removeEventListener('click', klick)
      document.removeEventListener('click', produkt, true)
    }
  }, [slug, cluster])

  return null
}
