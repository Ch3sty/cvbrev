'use client'

/**
 * Arbetsläget äger hela skärmen (Skriv brev, Brevet, Målgången): ramen
 * ligger över dashboardens skal, sidomenyn och dörrnavet, och rullar själv.
 * data-flow-active håller undan dörrnavet, e-post- och kakbannern och
 * installationsraden, som i övriga flöden (useFlodeLage).
 *
 * Ramen ritas på servern med sidan, så den står på plats från första bilden.
 */
import { useRef, type ReactNode } from 'react'
import { useFlodeLage } from '@/components/traning/useFlodeLage'

export default function ArbetsRam({ children }: { children: ReactNode }) {
  const ingen = useRef<HTMLElement | null>(null)
  useFlodeLage(ingen, false)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[color:var(--vagg)]" data-arbetsram="">
      {children}
    </div>
  )
}
