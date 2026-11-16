'use client'

/**
 * Jobbcoachen i bladen (skissen beslut 6, yta 3): sekundär knapp med
 * pennan under fältet, bara på tryck. Väntan: knappen byter till "Skriver"
 * och fylls, fältet låses med tre rader, högst åtta sekunder, sedan felraden.
 * Resultatet är hennes att ändra; tonraden säger vad som hände och ger Ångra.
 * När dagens förslag är använda står PaywallCard i bladet och knappen kvar
 * som spärrad. Aldrig gnistikonen, aldrig ordet AI.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { IkonPenna } from '@/components/illustrations/MallIkoner'
import { capture } from '@/lib/analytics/events'
import { BLAD, COACH } from '../texter'

export type CoachTyp = 'punkter' | 'profil' | 'kompetenser'
type Lage = 'vila' | 'skriver' | 'tid' | 'fel' | 'kvot'

const GRANS_MS = 8000

export function useJobbcoach(namn: string) {
  const [lage, setLage] = useState<Lage>('vila')
  const [framsteg, setFramsteg] = useState(0)
  const [kvot, setKvot] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  const ac = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      ac.current?.abort()
      if (timer.current) window.clearInterval(timer.current)
    },
    []
  )

  const kor = useCallback(
    async <T,>(typ: CoachTyp, data: Record<string, unknown>): Promise<T | null> => {
      if (lage === 'skriver') return null
      setLage('skriver')
      setFramsteg(0.05)
      const start = Date.now()
      timer.current = window.setInterval(() => {
        const t = (Date.now() - start) / 3500
        setFramsteg((f) => Math.max(f, Math.min(0.92, 1 - Math.exp(-1.6 * t))))
      }, 100)
      const kontroll = new AbortController()
      ac.current = kontroll
      const grans = window.setTimeout(() => kontroll.abort(), GRANS_MS)
      try {
        const res = await fetch('/api/cv/bygg/forslag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ typ, namn, ...data }),
          signal: kontroll.signal,
        })
        if (res.status === 429) {
          const j = (await res.json().catch(() => ({}))) as { nextResetAt?: string }
          setKvot(j.nextResetAt ?? new Date().toISOString())
          setLage('kvot')
          return null
        }
        if (res.status === 504) {
          setLage('tid')
          return null
        }
        if (!res.ok) {
          setLage('fel')
          return null
        }
        const j = (await res.json()) as T
        setFramsteg(1)
        setLage('vila')
        return j
      } catch {
        setLage(kontroll.signal.aborted ? 'tid' : 'fel')
        return null
      } finally {
        window.clearTimeout(grans)
        if (timer.current) window.clearInterval(timer.current)
        timer.current = null
      }
    },
    [lage, namn]
  )

  return { lage, framsteg, kvot, kor, skriver: lage === 'skriver' }
}

export function CoachKnapp({
  text,
  coach,
  onClick,
  kraver,
}: {
  text: string
  coach: ReturnType<typeof useJobbcoach>
  onClick: () => void
  /** Orsaken när knappen inte går att använda än, annars null. */
  kraver: string | null
}) {
  const stangd = Boolean(kraver) || coach.lage === 'kvot'
  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={stangd || coach.skriver}
        aria-busy={coach.skriver}
        data-coach-knapp
        className="relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1 hover:border-ink-1 disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:w-auto"
      >
        {coach.skriver ? (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-ton transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${Math.round(coach.framsteg * 100)}%` }}
          />
        ) : null}
        <span className="relative inline-flex items-center gap-2">
          <IkonPenna size={18} />
          {coach.skriver ? COACH.skriver : text}
        </span>
      </button>
      {kraver ? <p className="text-meta text-ink-3">{kraver}</p> : null}
      <div aria-live="polite">
        {coach.lage === 'tid' ? <p className="text-sm text-fel">{COACH.tid}</p> : null}
        {coach.lage === 'fel' ? <p className="text-sm text-fel">{COACH.fel}</p> : null}
      </div>
      {coach.lage === 'kvot' && coach.kvot ? (
        <PaywallCard variant="kvot" quota={{ feature: 'cv_bygg', nextResetAt: coach.kvot }} className="mt-1" />
      ) : null}
    </div>
  )
}

/** Tonraden efter ett förslag: vad som hände, och Ångra. */
export function CoachRad({ text, onAngra, typ }: { text: string; onAngra: () => void; typ: CoachTyp }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 rounded-xl bg-ton px-3 py-2 text-[13px] leading-5 text-ton-ink" role="status">
      <span>{text}</span>
      <button
        type="button"
        onClick={() => {
          capture('cv_bygg_ai_anvand', { typ, accepterad: false })
          onAngra()
        }}
        className="inline-flex min-h-8 items-center font-semibold underline underline-offset-4"
      >
        {BLAD.angra}
      </button>
    </p>
  )
}

/** Tre rader i väntan, i fältets plats (writing-lines i globals.css). */
export function Skrivrader() {
  return (
    <div aria-hidden className="writing-lines absolute inset-0 rounded-[10px] bg-papper p-3">
      <span />
      <span />
      <span />
    </div>
  )
}
