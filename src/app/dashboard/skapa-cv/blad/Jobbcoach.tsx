'use client'

/**
 * Jobbcoachen i bladen. Arbetsläget (byggspecen avsnitt 7) ger den ett kort:
 * rubriken, knappen med dagens texter och, för gratiskonton, kvoten som tre
 * brickor ("2 av 3 gratis förslag kvar") med Premium-etiketten på samma rad.
 * Premium har ingen kvotrad; dygnstaket (ett missbruksskydd) ger bara en
 * textrad, aldrig en köpvägg mot någon som redan betalar. När gratisförslagen
 * är slut står dagens PaywallCard i kortet och knappen är spärrad.
 *
 * Väntan: knappen byter till "Skriver" och fylls, fältet låses med tre
 * rader, högst åtta sekunder, sedan felraden. Resultatet är hennes att
 * ändra; den gröna raden säger vad som hände och ger Ångra.
 *
 * Kvoten är densamma som förut (3 per konto gratis, 30 per dygn Premium,
 * checkCvByggAiQuota). Servern läser läget när sidan öppnas, och kortet
 * räknar ned efter varje lyckat förslag ur svarets kvar.
 * Aldrig gnistikonen, aldrig ordet AI.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { IkonBock, IkonLas, IkonPenna } from '@/components/illustrations/MallIkoner'
import { capture } from '@/lib/analytics/events'
import { BLAD, COACH } from '../texter'
import s from '../arbetslage.module.css'

export type CoachTyp = 'punkter' | 'profil' | 'kompetenser'
type Lage = 'vila' | 'skriver' | 'tid' | 'fel' | 'kvot' | 'tak'

const GRANS_MS = 8000

/* ----------------------------------------------------------- kvoten */

export interface CoachKvot {
  premium: boolean
  /** Gratisförslag kvar på kontot; null för Premium. */
  kvar: number | null
  /** Gratisnivåns tak (tre per konto). */
  av: number
}

const KvotKontext = createContext<{ kvot: CoachKvot; satt: (kvar: number | null) => void } | null>(null)

export function CoachKvotProvider({ start, children }: { start: CoachKvot; children: ReactNode }) {
  const [kvot, setKvot] = useState<CoachKvot>(start)
  const satt = useCallback((kvar: number | null) => setKvot((k) => (k.premium ? k : { ...k, kvar: kvar ?? k.kvar })), [])
  return <KvotKontext.Provider value={{ kvot, satt }}>{children}</KvotKontext.Provider>
}

function useKvot() {
  return useContext(KvotKontext) ?? { kvot: { premium: false, kvar: null, av: 3 }, satt: () => undefined }
}

/* ------------------------------------------------------------ anropet */

export function useJobbcoach(namn: string) {
  const { kvot, satt } = useKvot()
  const [lage, setLage] = useState<Lage>(() => (!kvot.premium && kvot.kvar === 0 ? 'kvot' : 'vila'))
  const [framsteg, setFramsteg] = useState(0)
  const timer = useRef<number | null>(null)
  const ac = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      ac.current?.abort()
      if (timer.current) window.clearInterval(timer.current)
    },
    []
  )

  // Kvoten slut i ett annat blad: kortet här visar väggen också.
  useEffect(() => {
    if (!kvot.premium && kvot.kvar === 0 && lage === 'vila') setLage('kvot')
  }, [kvot, lage])

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
          const j = (await res.json().catch(() => ({}))) as { isPremium?: boolean }
          if (j.isPremium) {
            setLage('tak')
            return null
          }
          satt(0)
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
        const j = (await res.json()) as T & { kvar?: number | null }
        if (typeof j.kvar === 'number') satt(j.kvar)
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
    [lage, namn, satt]
  )

  return { lage, framsteg, kor, skriver: lage === 'skriver' }
}

/* --------------------------------------------------------------- kortet */

function Brickor({ kvar, av }: { kvar: number; av: number }) {
  const anvanda = Math.max(0, av - kvar)
  return (
    <span className={s.pips} role="img" aria-label={COACH.kvotBild(anvanda, av)}>
      {Array.from({ length: av }, (_, i) => (
        <i key={i} data-av={i < anvanda ? '' : undefined} />
      ))}
    </span>
  )
}

export function CoachKort({
  rubrik,
  under,
  text,
  coach,
  onClick,
  kraver,
  mobil,
}: {
  rubrik: string
  under: string
  /** Knappens text (dagens: "Skriv punkter åt mig", "Skriv om punkterna" ...). */
  text: string
  coach: ReturnType<typeof useJobbcoach>
  onClick: () => void
  /** Orsaken när knappen inte går att använda än, annars null. */
  kraver: string | null
  mobil: boolean
}) {
  const { kvot } = useKvot()
  const slut = coach.lage === 'kvot' || (!kvot.premium && kvot.kvar === 0)
  const stangd = Boolean(kraver) || slut || coach.lage === 'tak'
  const vagg = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (coach.lage === 'kvot') vagg.current?.scrollIntoView({ block: 'nearest' })
  }, [coach.lage])

  const knapp = (
    <button
      type="button"
      onClick={onClick}
      disabled={stangd || coach.skriver}
      aria-busy={coach.skriver}
      data-coach-knapp
      className={s.jc}
      style={mobil ? { width: '100%', height: 46, marginTop: 8 } : undefined}
    >
      {coach.skriver ? <span aria-hidden className={s.jcFyll} style={{ width: `${Math.round(coach.framsteg * 100)}%` }} /> : null}
      <span className={s.jcText}>
        <IkonPenna size={17} strokeWidth={2.4} />
        {coach.skriver ? COACH.skriver : text}
      </span>
    </button>
  )

  return (
    <div className={s.jck} data-coach-kort>
      {mobil ? (
        <>
          <b className={s.jckRubrik} style={{ fontSize: 14 }}>
            {rubrik}
          </b>
          {knapp}
        </>
      ) : (
        <div className={s.jckRad}>
          <span className={s.ik} aria-hidden>
            <IkonPenna size={22} strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <b className={s.jckRubrik}>{rubrik}</b>
            <small>{under}</small>
          </span>
          {knapp}
        </div>
      )}
      {kraver ? <p className={s.coachInfo}>{kraver}</p> : null}
      <div aria-live="polite">
        {coach.lage === 'tid' ? <p className={s.coachFel}>{COACH.tid}</p> : null}
        {coach.lage === 'fel' ? <p className={s.coachFel}>{COACH.fel}</p> : null}
        {coach.lage === 'tak' ? <p className={s.coachInfo}>{COACH.tak}</p> : null}
      </div>
      {slut ? (
        <div ref={vagg} style={{ marginTop: 10 }}>
          <PaywallCard variant="kvot" quota={{ feature: 'cv_bygg', nextResetAt: new Date().toISOString() }} />
        </div>
      ) : !kvot.premium && kvot.kvar !== null ? (
        <div className={s.kvot} data-coach-kvot>
          <Brickor kvar={kvot.kvar} av={kvot.av} />
          <span>
            <b>{COACH.kvotRad(kvot.kvar, kvot.av)}</b>{' '}
            <span className={s.prm}>
              <IkonLas size={11} strokeWidth={2.6} />
              {COACH.premium}
            </span>{' '}
            {mobil ? COACH.premiumTextKort : COACH.premiumText}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/** Den gröna raden efter ett förslag: vad som hände, och Ångra. */
export function CoachRad({ text, onAngra, typ }: { text: string; onAngra: () => void; typ: CoachTyp }) {
  const i = text.indexOf('. ')
  const fet = i > 0 ? text.slice(0, i + 1) : text
  const rest = i > 0 ? text.slice(i + 1) : ''
  return (
    <div className={s.dom} role="status" data-coach-rad>
      <IkonBock size={18} strokeWidth={3} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>
        <b>{fet}</b>
        {rest}
      </span>
      <button
        type="button"
        onClick={() => {
          capture('cv_bygg_ai_anvand', { typ, accepterad: false })
          onAngra()
        }}
      >
        {BLAD.angra}
      </button>
    </div>
  )
}

/** Tre rader i väntan, i fältets plats (writing-lines i globals.css). */
export function Skrivrader() {
  return (
    <div aria-hidden className="writing-lines absolute inset-0 rounded-[12px] bg-papper p-3">
      <span />
      <span />
      <span />
    </div>
  )
}
