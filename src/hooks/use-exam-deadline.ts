'use client'

/**
 * Hård tidsgräns i provläget
 * (docs/plan-paket-och-onboarding.md avsnitt 4, ägarens beslut 12).
 *
 * Provlöftet är "öva under samma tidspress", och utan en gräns som faktiskt
 * går ut är det inget löfte. Gränsen räknas från sessionens `started_at`,
 * alltså serverns tid, inte från när fliken öppnades: annars räcker en
 * omladdning för att få nya minuter.
 *
 * Klientens klocka lämnar in provet när tiden går ut. Den skarpa
 * bedömningen ligger ändå i complete-rutten, som räknar samma gräns
 * serverside och rättar det som hunnit sparas.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatClock } from '@/hooks/use-elapsed-clock'

export interface ExamDeadline {
  /** Kvarvarande tid som mm:ss. Null när provet inte är tidsatt. */
  label: string | null
  /** Sekunder kvar. Null när provet inte är tidsatt. */
  secondsLeft: number | null
  /** Sann sista minuten, så vyn kan skärpa klockan. */
  sista: boolean
  /** Sann när tiden gått ut. */
  utgangen: boolean
}

/**
 * @param startedAt sessionens started_at, serverns tid. Null medan sessionen
 *   hämtas, och då tickar ingen klocka.
 * @param limitMs tidsgränsen i millisekunder, eller null för otidsat prov.
 * @param onExpire lämnar in provet. Anropas exakt en gång.
 */
export function useExamDeadline(
  startedAt: string | Date | null,
  limitMs: number | null,
  onExpire: () => void
): ExamDeadline {
  const deadline = useMemo(() => {
    if (!startedAt || !limitMs) return null
    const start = new Date(startedAt)
    if (Number.isNaN(start.getTime())) return null
    return start.getTime() + limitMs
  }, [startedAt, limitMs])

  const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
    deadline === null ? null : Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
  )

  // Inlämningen får ske en gång. En andra POST mot complete efter att
  // sessionen rättats ger ett fel som användaren inte kan göra något åt.
  const inlamnat = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft(null)
      return
    }

    const tick = () => {
      const kvar = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(kvar)
      if (kvar === 0 && !inlamnat.current) {
        inlamnat.current = true
        onExpireRef.current()
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  return {
    label: secondsLeft === null ? null : formatClock(secondsLeft),
    secondsLeft,
    sista: secondsLeft !== null && secondsLeft <= 60 && secondsLeft > 0,
    utgangen: secondsLeft === 0,
  }
}
