'use client'

/**
 * Steget i URL:en (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Flödena höll tidigare steget i useState, så webbläsarens bakåtknapp lämnade
 * hela flödet i stället för att gå ett steg tillbaka, och en omladdning
 * började om från noll. På mobil är bakåtgesten den vanligaste navigeringen
 * som finns, så det var i praktiken en fälla.
 *
 * Steget skrivs som ?steg=N (ettbaserat, som användaren räknar). Framåt är
 * push, så bakåtknappen backar ett steg. Hopp bakåt inom flödet är replace,
 * annars byggs en historik där bakåt ibland går framåt.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const STEP_PARAM = 'steg'

interface UseFlowStepOptions {
  /** Antal steg i flödet. Steget klampas alltid in i intervallet. */
  totalSteps: number
  /** Steg att stå på när parametern saknas eller är skräp. */
  initialStep?: number
  /**
   * Spärr: högsta steg användaren får nå just nu. Hindrar att någon
   * handskriver ?steg=5 och hoppar förbi ett obligatoriskt val.
   */
  maxReachableStep?: number
}

export interface FlowStepApi {
  /** Nuvarande steg, ettbaserat och alltid inom intervallet. */
  step: number
  /** Går till ett givet steg. Framåt pushar, bakåt ersätter. */
  goToStep: (next: number) => void
  next: () => void
  back: () => void
  isFirst: boolean
  isLast: boolean
}

function parseStep(raw: string | null): number | null {
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function useFlowStep({
  totalSteps,
  initialStep = 1,
  maxReachableStep,
}: UseFlowStepOptions): FlowStepApi {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const ceiling = Math.min(maxReachableStep ?? totalSteps, totalSteps)

  const step = useMemo(() => {
    const fromUrl = parseStep(searchParams?.get(STEP_PARAM) ?? null)
    const candidate = fromUrl ?? initialStep
    return Math.min(Math.max(candidate, 1), Math.max(ceiling, 1))
  }, [searchParams, initialStep, ceiling])

  const write = useCallback(
    (target: number, mode: 'push' | 'replace') => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set(STEP_PARAM, String(target))
      const url = `${pathname}?${params.toString()}`
      if (mode === 'push') router.push(url, { scroll: false })
      else router.replace(url, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const goToStep = useCallback(
    (nextStep: number) => {
      const target = Math.min(Math.max(nextStep, 1), Math.max(ceiling, 1))
      if (target === step) return
      write(target, target > step ? 'push' : 'replace')
    },
    [ceiling, step, write]
  )

  // Saknas parametern helt skrivs den in en gång, utan ny historikpost, så
  // att en omladdning landar på samma steg som användaren stod på.
  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current) return
    if (searchParams?.get(STEP_PARAM)) {
      seeded.current = true
      return
    }
    seeded.current = true
    write(step, 'replace')
  }, [searchParams, step, write])

  return {
    step,
    goToStep,
    next: useCallback(() => goToStep(step + 1), [goToStep, step]),
    back: useCallback(() => goToStep(step - 1), [goToStep, step]),
    isFirst: step <= 1,
    isLast: step >= totalSteps,
  }
}
