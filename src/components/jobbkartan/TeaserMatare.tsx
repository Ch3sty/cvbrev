'use client'

/**
 * Mäter Jobbkartans teaser på andra sidor (startsidans rad i "Och resten av jobbsöket"):
 * jobbkartan_teaser_shown första gången raden syns, jobbkartan_teaser_clicked vid klick.
 * Raden själv är serverrenderad och hittas på data-matning="jobbkartan-teaser"; den här
 * komponenten ritar inget och drar inte in något av kartans kod.
 */
import { useEffect } from 'react'
import { jobbkartanEvent } from '@/lib/analytics/publikt'

const TEASER_MATNING = 'jobbkartan-teaser'

export default function TeaserMatare({ page }: { page: string }) {
  useEffect(() => {
    const rader = Array.from(document.querySelectorAll<HTMLElement>(`[data-matning="${TEASER_MATNING}"]`))
    if (!rader.length) return
    const klick = () => jobbkartanEvent('jobbkartan_teaser_clicked', { page })
    for (const r of rader) r.addEventListener('click', klick)
    let obs: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver(
        (poster) => {
          if (!poster.some((p) => p.isIntersecting)) return
          jobbkartanEvent('jobbkartan_teaser_shown', { page })
          obs?.disconnect()
        },
        { threshold: 0.5 }
      )
      for (const r of rader) obs.observe(r)
    }
    return () => {
      obs?.disconnect()
      for (const r of rader) r.removeEventListener('click', klick)
    }
  }, [page])
  return null
}
