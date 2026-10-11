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
 *
 * När flödet är klart ska stegen inte ligga kvar i historiken (ägaren fick
 * backa sju, åtta gånger ut ur ett färdigt brev). Varje post bär därför sitt
 * djup, och `klart` krymper historiken till en post: nästa bakåtgest lämnar
 * flödet. Se flodeshistorik.ts.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { avslutaFlodet, lamnaFlodet } from './flodeshistorik'
import { useFlodeshistorik } from './useFlodeshistorik'

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
  /**
   * Flödet är klart (brevet sparat, CV:t skapat, analysen klar). När det
   * slår om till sant krymper historiken till en post, så att nästa
   * bakåtgest lämnar flödet i stället för att gå baklänges genom stegen.
   */
  klart?: boolean
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
  /** Lämnar flödet till rummet man kom från (krysset, Lämna). */
  leave: () => void
  /** Avslutar flödet och ersätter det med `href` i historiken. */
  finish: (href: string) => void
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
  klart = false,
}: UseFlowStepOptions): FlowStepApi {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const ceiling = Math.min(maxReachableStep ?? totalSteps, totalSteps)

  const urlStep = useMemo(() => {
    const fromUrl = parseStep(searchParams?.get(STEP_PARAM) ?? null)
    const candidate = fromUrl ?? initialStep
    return Math.min(Math.max(candidate, 1), Math.max(ceiling, 1))
  }, [searchParams, initialStep, ceiling])

  // Medan ett avslut går bakåt i historiken står flödet still på steget det
  // avslutades från, så att steg 1 aldrig blinkar förbi.
  const stillStep = useRef(urlStep)
  const { fore, stilla } = useFlodeshistorik(searchParams?.toString() ?? '', () => {
    const fromUrl = parseStep(new URLSearchParams(window.location.search).get(STEP_PARAM))
    return fromUrl === stillStep.current
  })
  if (!stilla) stillStep.current = urlStep
  const step = stilla ? stillStep.current : urlStep

  const write = useCallback(
    (target: number, mode: 'push' | 'replace') => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set(STEP_PARAM, String(target))
      const url = `${pathname}?${params.toString()}`
      fore(mode)
      if (mode === 'push') router.push(url, { scroll: false })
      else router.replace(url, { scroll: false })
    },
    [pathname, router, searchParams, fore]
  )

  const goToStep = useCallback(
    (nextStep: number) => {
      if (stilla) return
      const target = Math.min(Math.max(nextStep, 1), Math.max(ceiling, 1))
      if (target === step) return
      write(target, target > step ? 'push' : 'replace')
    },
    [ceiling, step, write, stilla]
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

  // Klart: historiken krymper en gång, när flaggan slår om.
  const avslutat = useRef(false)
  useEffect(() => {
    if (!klart || avslutat.current) return
    avslutat.current = true
    avslutaFlodet(router)
  }, [klart, router])

  const leave = useCallback(() => lamnaFlodet(router), [router])
  const finish = useCallback((href: string) => avslutaFlodet(router, href), [router])

  return {
    step,
    goToStep,
    next: useCallback(() => goToStep(step + 1), [goToStep, step]),
    back: useCallback(() => goToStep(step - 1), [goToStep, step]),
    isFirst: step <= 1,
    isLast: step >= totalSteps,
    leave,
    finish,
  }
}
