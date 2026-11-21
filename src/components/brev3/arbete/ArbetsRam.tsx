'use client'

/**
 * Arbetsläget äger hela skärmen (Skriv brev, Brevet, Målgången): ramen
 * ligger över dashboardens skal och dörrnavet och rullar själv.
 * data-flow-active håller undan dörrnavet, e-post- och kakbannern och
 * installationsraden, som i övriga flöden (useFlodeLage).
 *
 * Sidomenyn: från 1280 px ritas arbetsläget i full bredd som i skissen
 * (Skriv-1440, Brevet-1440, Skickat-1440). Bladet och arket är 1096 px och
 * etiketterna på arket hänger ut till höger; bredvid menyn ryms de inte
 * under 1440 px. Sidomenyn ligger i skalet ovanför ramen (z-20 mot
 * innehållets z-10), så den göms med en regel som bara gäller medan ramen
 * finns. Mellan 1024 och 1280 står menyn kvar och ramen börjar efter den,
 * som FlowShell.
 *
 * Ramen och regeln ritas på servern med sidan, så de står på plats från
 * första bilden.
 */
import { useRef, type ReactNode } from 'react'
import { useFlodeLage } from '@/components/traning/useFlodeLage'
import { NAV } from '@/lib/rum/copy'

const GOM_SIDOMENYN = `@media (min-width:1280px){html:has([data-arbetsram]) div:has(> div > nav[aria-label="${NAV.sidomeny}"]){display:none!important}}`

export default function ArbetsRam({ children }: { children: ReactNode }) {
  const ingen = useRef<HTMLElement | null>(null)
  useFlodeLage(ingen, false)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[color:var(--vagg)] lg:left-[248px] xl:left-0" data-arbetsram="">
      <style>{GOM_SIDOMENYN}</style>
      {children}
    </div>
  )
}
