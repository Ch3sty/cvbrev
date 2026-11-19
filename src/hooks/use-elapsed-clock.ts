'use client'

/**
 * Klockan i ett pågående prov, som mm:ss.
 *
 * Låg tidigare inne i varje testtyps header. När provet flyttade in i
 * TestFlowShell behövde själva tiden finnas ett steg högre upp, hos den
 * komponent som äger skalet, så den bor i en egen hook i stället för att
 * dupliceras på fyra ställen.
 *
 * Klockan räknas från sessionens started_at, alltså serverns tid, samma
 * mönster som useExamDeadline i provläget. Förut startade varje vy sin egen
 * klocka vid mount, så en omladdning mitt i testet nollade tiden
 * (röktestet 2026-11-19, talserier grund).
 */

import { useEffect, useMemo, useState } from 'react'

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** started_at som millisekunder, eller null när den saknas eller är trasig. */
export function startMs(startedAt: string | Date | number | null | undefined): number | null {
  if (startedAt === null || startedAt === undefined || startedAt === '') return null
  const ms = startedAt instanceof Date ? startedAt.getTime() : new Date(startedAt).getTime()
  return Number.isFinite(ms) ? ms : null
}

/** Sekunder sedan starten, aldrig negativt (klientens klocka kan ligga efter servern). */
export function sekunderSedan(startedAt: string | Date | number | null | undefined, now = Date.now()): number {
  const ms = startMs(startedAt)
  if (ms === null) return 0
  return Math.max(0, Math.floor((now - ms) / 1000))
}

/**
 * Räknar upp från `startedAt` och tickar varje sekund.
 *
 * @param startedAt sessionens started_at från servern. Null medan sessionen
 *   hämtas: då står klockan på 00:00 och tickar inte.
 */
export function useElapsedClock(startedAt: string | Date | number | null | undefined): string {
  const ms = useMemo(() => startMs(startedAt), [startedAt])
  const [label, setLabel] = useState(() => formatClock(ms === null ? 0 : sekunderSedan(ms)))

  useEffect(() => {
    if (ms === null) {
      setLabel(formatClock(0))
      return
    }
    const tick = () => setLabel(formatClock(sekunderSedan(ms)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [ms])

  return label
}
