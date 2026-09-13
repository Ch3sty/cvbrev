/**
 * Delade skelettbyggstenar för route-nivå loading.tsx.
 * Next.js visar dessa omedelbart vid navigering (innan målsidans JS laddats),
 * vilket tar bort den första blanka glipan innan sidans eget innehåll hinner
 * monteras.
 *
 * Tråden (docs/designsystem.md, "Tillstånd"): skelettet står stilla, block i
 * insunken inuti paneler, och bara tråden rör sig längs den första panelens
 * överkant. Ingen puls, ingen shimmer.
 *
 * Server-komponent (ingen 'use client'): rena divar, ingen interaktivitet.
 */

export function SkeletonBlock({
  height,
  className = '',
  rounded = 'rounded-xl',
  thread,
}: {
  height: number
  className?: string
  rounded?: string
  /** Tråden längs överkanten. Sätt på det första blocket i vyn. */
  thread?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={`${rounded} border border-kant bg-panel ${thread ? 'loading-thread' : ''} ${className}`}
      style={{ height }}
    />
  )
}

/** Ett block i insunken, för rader inuti en panel. */
export function SkeletonLine({ width = '100%', height = 12 }: { width?: string; height?: number }) {
  return <div aria-hidden="true" className="rounded bg-insunken" style={{ width, height }} />
}

export function SkeletonHero() {
  return (
    <div aria-hidden="true" className="loading-thread rounded-xl border border-kant bg-panel p-4">
      <SkeletonLine width="45%" height={18} />
      <div className="mt-4 grid grid-cols-4 gap-3">
        <div><SkeletonLine width="44px" height={40} /><div className="mt-1.5"><SkeletonLine width="40px" /></div></div>
        <div><SkeletonLine width="28px" height={40} /><div className="mt-1.5"><SkeletonLine width="56px" /></div></div>
        <div><SkeletonLine width="28px" height={40} /><div className="mt-1.5"><SkeletonLine width="48px" /></div></div>
        <div><SkeletonLine width="28px" height={40} /><div className="mt-1.5"><SkeletonLine width="32px" /></div></div>
      </div>
      <div className="mt-4"><SkeletonLine height={44} /></div>
    </div>
  )
}

/**
 * Wrapper som matchar innehållsytans rytm.
 * (Layouten ger redan padding och maxbredd, så detta är bara vertikal rytm.)
 */
export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 sm:space-y-6" role="status" aria-busy="true" aria-label="Laddar sida">
      {children}
    </div>
  )
}
