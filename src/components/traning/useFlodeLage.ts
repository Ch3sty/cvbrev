'use client'

/**
 * Lägger en helskärmsvy över dashboarden (kvittot): navet döljs och foten är
 * vyns egen. Flyttad ur det gamla passkalet när det raderades i etapp 5 av
 * testflödet; sessionsramen har samma regel i SessionsRam.
 */

import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useFlodeLage(footerRef: React.RefObject<HTMLElement | null>, harFot: boolean) {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.style.getPropertyValue('--bottom-nav-h')
    root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    return () => {
      if (previous) root.style.setProperty('--bottom-nav-h', previous)
      else root.style.removeProperty('--bottom-nav-h')
      root.removeAttribute('data-flow-active')
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const el = footerRef.current
    if (!el) {
      root.style.setProperty('--flow-footer-h', '0px')
      return
    }
    const mat = () => root.style.setProperty('--flow-footer-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--flow-footer-h')
    }
  }, [harFot])
}
