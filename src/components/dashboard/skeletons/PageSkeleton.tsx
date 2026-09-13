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
 * Introt till ett flöde: sidhuvud (h1 plus ingress), en statusrad för kvoten,
 * ett handlingskort med marginalplatta och lista, och en panel med rubrik och
 * tre rader. Speglar CVAnalysisIntro så bytet inte flyttar något.
 *
 * Tråden ligger på sidhuvudet, som är det första i vyn.
 */
export function SkeletonIntro() {
  return (
    <>
      {/* Sidhuvud: h1 28/32 plus två ingressrader. Ingen panel, ingen kant. */}
      <div aria-hidden="true" className="loading-thread rounded-xl pt-1">
        <SkeletonLine width="62%" height={28} />
        <div className="mt-3 space-y-1.5">
          <SkeletonLine width="100%" />
          <SkeletonLine width="72%" />
        </div>
      </div>

      {/* Statusrad: kvoten. Samma höjd som StatusRow (min-h-11). */}
      <SkeletonBlock height={44} rounded="rounded-lg" />

      {/* Handlingskortet: platta 56, rubrik och brödtext, lista, knapp. */}
      <div aria-hidden="true" className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-lg bg-insunken" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonLine width="58%" height={16} />
            <SkeletonLine width="100%" />
            <SkeletonLine width="84%" />
          </div>
        </div>

        <div className="mt-4 space-y-4 border-t border-kant pt-3">
          <SkeletonLine width="76%" />
          <SkeletonLine width="68%" />
          <SkeletonLine width="72%" />
        </div>

        <div className="mt-5">
          <SkeletonLine height={44} />
        </div>
      </div>

      {/* Panel med sektionsrubrik och tre rader med ikon. */}
      <div aria-hidden="true" className="rounded-xl border border-kant bg-panel">
        <div className="border-b border-kant px-4 py-3">
          <SkeletonLine width="42%" />
        </div>
        <div className="divide-y divide-kant">
          {['a', 'b', 'c'].map((rad) => (
            <div key={rad} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 h-6 w-6 shrink-0 rounded bg-insunken" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonLine width="46%" height={16} />
                <SkeletonLine width="88%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
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
