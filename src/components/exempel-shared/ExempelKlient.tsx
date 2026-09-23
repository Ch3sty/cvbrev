'use client'

/**
 * Mätningen på yrkesexemplen, /cv-exempel/[yrke] och
 * /personligt-brev-exempel/[yrke] (docs/rapporter/analys-seo-tillvaxt-2026-09-23,
 * åtgärd 1). Samma upplägg som ArtikelKlient på artikelsidorna.
 *
 * Renderar ingenting. Den gör två saker efter första målningen:
 *   1. example_viewed en gång per sidvisning.
 *   2. example_cta_clicked på klick i en länk som leder vidare mot ett
 *      verktyg, via en enda lyssnare på dokumentet. Då behöver varken
 *      hjälten, slutrutan eller korspaketet egna onClick.
 *
 * Länkar till andra yrkesexempel av samma sort (relaterade yrken,
 * brödsmulor) räknas inte som CTA. Korslänken till samma yrkes andra
 * exempel (CV till brev eller tvärtom) gör det.
 */

import { useEffect } from 'react'
import { capture } from '@/lib/analytics/events'

/** Sökvägar som räknas som ett steg mot verktygen. */
const CTA_PREFIX = ['/cv-mallar', '/skapa-brev', '/skapa-cv', '/dashboard', '/verktyg', '/register', '/priser']

function arCta(path: string, kind: 'letter' | 'cv', slug: string): boolean {
  if (CTA_PREFIX.some((p) => path === p || path.startsWith(`${p}/`))) return true
  const andra = kind === 'cv' ? `/personligt-brev-exempel/${slug}` : `/cv-exempel/${slug}`
  return path === andra
}

export default function ExempelKlient({ kind, slug }: { kind: 'letter' | 'cv'; slug: string }) {
  useEffect(() => {
    if (!slug) return
    capture('example_viewed', { kind, yrke_slug: slug })

    const klick = (ev: MouseEvent) => {
      const a = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
      if (!a) return
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (!arCta(url.pathname, kind, slug)) return
      capture('example_cta_clicked', { kind, yrke_slug: slug, target: url.pathname + url.search })
    }
    document.addEventListener('click', klick)
    return () => document.removeEventListener('click', klick)
  }, [kind, slug])

  return null
}
