'use client'

/**
 * Läget för en svävande meny som ritas i body (portal) men hör till en knapp
 * i toppraden: under knappen, högerkanten i linje med knappens, minst 16 px
 * från fönstrets kant. Följer knappen när sidan rullar (main rullar, inte
 * fönstret, därför capture) och när fönstret ändras.
 *
 * Varför portal: rummens väggar är egna staplingssammanhang med
 * overflow: hidden (b3-vagg har z-index 1, golvet under 2). En meny inne i
 * väggen hamnade under panelen som lyfts över väggens nederkant och klipptes
 * av väggens kant (QA live 2026-11-22, Dina brev). I body står menyn i
 * navigationens lager (40, designsystemet) över allt innehåll i alla rum.
 */

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

export interface AnkratLage {
  top: number
  right: number
}

export function beraknaLage(knapp: { bottom: number; right: number }, fonsterBredd: number, avstand = 8): AnkratLage {
  return {
    top: Math.round(knapp.bottom + avstand),
    right: Math.max(16, Math.round(fonsterBredd - knapp.right)),
  }
}

export function useAnkratLage(oppen: boolean, ankare: RefObject<HTMLElement | null>, avstand = 8): AnkratLage | null {
  const [lage, setLage] = useState<AnkratLage | null>(null)

  const mat = useCallback(() => {
    const el = ankare.current
    if (!el) return
    setLage(beraknaLage(el.getBoundingClientRect(), window.innerWidth, avstand))
  }, [ankare, avstand])

  // Mät före första ritningen så att menyn aldrig blinkar på fel plats.
  useLayoutEffect(() => {
    if (!oppen) return
    mat()
    window.addEventListener('resize', mat)
    window.addEventListener('scroll', mat, true)
    return () => {
      window.removeEventListener('resize', mat)
      window.removeEventListener('scroll', mat, true)
    }
  }, [oppen, mat])

  return oppen ? lage : null
}
