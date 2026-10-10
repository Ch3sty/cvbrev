/**
 * Golvet: den ljusa delen under väggen (spec-rummen 4.2, konceptets .golv).
 *
 * 16 px marginal på mobil, 40 px på dator, 16 px mellan korten, innehållet
 * på högst 1120 px. Avståndet till bottennavet ligger på skalets main
 * (.dashboard-main-content räknar mot --bottom-nav-h), så det finns på ett
 * enda ställe även för vyer som saknar golv.
 *
 * I konceptet börjar varje golv med det lyfta kortet, som överlappar
 * väggen 30 px. Vyer utan lyft kort (flöden, Jobbcoachen) börjar 16 px (24 på dator, spec 16.2 fråga 7)
 * under väggen i stället; `lyft` tar bort det avståndet när första kortet
 * är ett LyftKort.
 *
 * Server component.
 */

import type { ReactNode } from 'react'

export interface GolvProps {
  children: ReactNode
  className?: string
  /** Första kortet är ett LyftKort som överlappar väggen. */
  lyft?: boolean
}

export default function Golv({ children, className, lyft }: GolvProps) {
  return (
    <div className={`flex-1 px-4 lg:px-10 ${lyft ? '' : 'pt-4 lg:pt-6'}`}>
      <div className={`mx-auto flex w-full max-w-[1120px] flex-col gap-4 ${className ?? ''}`}>{children}</div>
    </div>
  )
}
