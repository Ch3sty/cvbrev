'use client'

/**
 * Klockan i ett pågående prov, som mm:ss.
 *
 * Låg tidigare inne i varje testtyps header. När provet flyttade in i
 * TestFlowShell behövde själva tiden finnas ett steg högre upp, hos den
 * komponent som äger skalet, så den bor i en egen hook i stället för att
 * dupliceras på fyra ställen.
 */

import { useEffect, useState } from 'react'

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Räknar upp från `startedAt` och tickar varje sekund. */
export function useElapsedClock(startedAt: Date): string {
  const [label, setLabel] = useState(() =>
    formatClock((Date.now() - startedAt.getTime()) / 1000)
  )

  useEffect(() => {
    const tick = () => setLabel(formatClock((Date.now() - startedAt.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return label
}
