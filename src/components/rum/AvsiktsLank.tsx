'use client'

/**
 * Länk som förladdar på avsikt, inte när den syns.
 *
 * next/link förladdar varje länk som kommer i bild. I inloggat läge är varje
 * förladdning en serverrendering av dashboard-layouten, med inloggningskontroll
 * och profilläsning mot Supabase, så sidomenyn, dörrarna och rummens flikar
 * gav tio till tjugo databasanrop per sidvisning (driftstoppet 2026-11-21,
 * docs/bygg-noter-cv-rummet.md). Här är förladdningen avstängd (prefetch=false,
 * som i Next 16 stänger av både synlighet och hovring) och görs i stället
 * med routerns prefetch första gången pekaren går över länken, länken får
 * fokus eller ett finger landar på den. router.prefetch utan kind är "auto":
 * dynamiska sidor förladdas ner till närmaste loading.tsx, sidans egen data
 * hämtas först vid navigeringen. Det är samma nivå som en vanlig länk utan
 * prefetch-prop, så flikarnas tal blir inte gamla av en hovring.
 *
 * I utvecklingsläget förladdar Next inte alls; komponenten gör likadant.
 * Utan router (enhetstester som ritar komponenten fristående) blir den en
 * vanlig länk.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { forwardRef, useRef, type ComponentPropsWithoutRef, type FocusEvent, type MouseEvent, type TouchEvent } from 'react'

export type AvsiktsLankProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'prefetch' | 'href'> & {
  href: string
}

type Router = ReturnType<typeof useRouter>

/** Routern om den finns. Saknas den (fristående rendering) förladdas inget. */
function useRouterOmDenFinns(): Router | null {
  try {
    return useRouter()
  } catch {
    return null
  }
}

const AvsiktsLank = forwardRef<HTMLAnchorElement, AvsiktsLankProps>(function AvsiktsLank(
  { href, onMouseEnter, onFocus, onTouchStart, ...rest },
  ref
) {
  const router = useRouterOmDenFinns()
  // Adressen som redan förladdats från den här länken: en gång per adress.
  const forladdad = useRef<string | null>(null)

  const forladda = () => {
    if (forladdad.current === href || !router) return
    if (process.env.NODE_ENV === 'development') return
    forladdad.current = href
    router.prefetch(href)
  }

  return (
    <Link
      ref={ref}
      href={href}
      prefetch={false}
      onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(e)
        forladda()
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(e)
        forladda()
      }}
      onTouchStart={(e: TouchEvent<HTMLAnchorElement>) => {
        onTouchStart?.(e)
        forladda()
      }}
      {...rest}
    />
  )
})

export default AvsiktsLank
