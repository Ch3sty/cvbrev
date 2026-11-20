'use client'

// src/components/session/useRamLage.ts
// =============================================================================
// Ramen äger skärmen (plan-testflode-2026-11-20 avsnitt 1, Lagret):
// data-flow-active håller undan dörrnavet, bottennavigeringen, e-post- och
// kakbannern och installationsraden (useFriSikt läser attributet),
// --flow-footer-h är fotens uppmätta höjd och body låses så att inget
// rullar bakom ramen (lärdomen från 2026-09-14).
// =============================================================================

import { useEffect, useLayoutEffect, type RefObject } from 'react'

const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useRamLage(fotRef: RefObject<HTMLElement | null>, harFot: boolean) {
  useIsoLayout(() => {
    const root = document.documentElement
    const body = document.body
    const forraNav = root.style.getPropertyValue('--bottom-nav-h')
    const forraOverflow = body.style.overflow
    root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    body.style.overflow = 'hidden'
    return () => {
      if (forraNav) root.style.setProperty('--bottom-nav-h', forraNav)
      else root.style.removeProperty('--bottom-nav-h')
      root.removeAttribute('data-flow-active')
      body.style.overflow = forraOverflow
    }
  }, [])

  useIsoLayout(() => {
    const root = document.documentElement
    const el = fotRef.current
    if (!el) {
      root.style.setProperty('--flow-footer-h', '0px')
      return
    }
    const mat = () => root.style.setProperty('--flow-footer-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    mat()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mat) : null
    ro?.observe(el)
    return () => {
      ro?.disconnect()
      root.style.removeProperty('--flow-footer-h')
    }
  }, [harFot])
}
