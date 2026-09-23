'use client'

/**
 * Håller en spärrs knapp fri från de fasta raderna i nederkant: cookie-
 * samtycket och mobilens klistrade knapprad (StickyMobileCTA).
 *
 * Så länge elementet syns i viewporten sätts data-fri-sikt="true" på html,
 * och globals.css skjuter då ut båda raderna nedåt. Samtycket kommer tillbaka
 * så snart spärren scrollats ur bild: det går fortfarande att lämna, det
 * står bara inte ovanpå kontoknappen. Flera spärrar på samma sida räknas
 * var för sig, så attributet tas bort först när ingen av dem syns.
 *
 * Ingen layout ändras, raderna flyttas med transform och visibility, så
 * CLS påverkas inte.
 */

import { useEffect, type RefObject } from 'react'

const synliga = new Set<Element>()

function uppdatera() {
  const root = document.documentElement
  if (synliga.size > 0) root.setAttribute('data-fri-sikt', 'true')
  else root.removeAttribute('data-fri-sikt')
}

export function useFriSikt(ref: RefObject<Element | null>, aktiv: boolean = true): void {
  useEffect(() => {
    const el = ref.current
    if (!aktiv || !el || typeof IntersectionObserver === 'undefined') return

    const obs = new IntersectionObserver((poster) => {
      for (const p of poster) {
        if (p.isIntersecting) synliga.add(p.target)
        else synliga.delete(p.target)
      }
      uppdatera()
    })
    obs.observe(el)

    return () => {
      obs.disconnect()
      synliga.delete(el)
      uppdatera()
    }
  }, [ref, aktiv])
}
