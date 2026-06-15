/**
 * Delade skeleton-byggstenar för route-nivå loading.tsx.
 * Next.js visar dessa OMEDELBART vid navigering (innan målsidans JS laddats),
 * vilket tar bort den första blanka glipan innan sidans egna in-page-skeleton
 * hinner monteras. Matchar app-stilen (rundade kort, orange/slate).
 *
 * Server-komponent (ingen 'use client') - rena divar, ingen interaktivitet.
 */

export function SkeletonBlock({
  height,
  className = '',
  rounded = 'rounded-3xl',
}: {
  height: number
  className?: string
  rounded?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`${rounded} animate-pulse bg-white border border-slate-200/70 ${className}`}
      style={{ height }}
    />
  )
}

export function SkeletonHero() {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-rose-50 animate-pulse"
      style={{ height: 200 }}
    />
  )
}

/**
 * Wrapper som matchar dashboard-content-ytans spacing.
 * (Layouten ger redan padding + max-width, så detta är bara vertikal rytm.)
 */
export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 sm:space-y-6" role="status" aria-label="Laddar sida">
      {children}
    </div>
  )
}
