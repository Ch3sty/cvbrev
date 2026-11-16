'use client'

/**
 * Remsan under arket (skissen, "Så växer utbudet utan att gränssnittet
 * växer"): högst tolv. "Föreslagna för dig" (tre, gratismallen först) med
 * skälet, "Gratis" och sist brickan "Alla N" som öppnar Alla-arket. Samma
 * vid 18 som vid 50. Låst medan filen skapas (villkor d).
 *
 * Helskärmens remsa (kompakt) på datorn, från 900 px (UX 2026-11-16, ägarens
 * punkt 3): hela katalogen i Alla-listans ordning med avdelare per grupp,
 * 80 px miniatyrer, centrerad när den ryms och annars rullbar med pilknappar
 * och mushjul. "Alla N" står sist för sök och filter. Mobil oförändrad.
 */
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonTillbaka } from '@/components/illustrations/MallIkoner'
import Miniatyr from './Miniatyr'
import { grupperaMallar } from './grupper'
import { REMSA } from './texter'

export interface RemsaProps {
  katalog: readonly MallKort[]
  vald: string
  foreslagna: readonly string[]
  skal?: string
  onValj: (id: string) => void
  onAlla: () => void
  last?: boolean
  /** Utan rubrik och skäl (helskärmens fot). */
  kompakt?: boolean
}

const MAX = 12

export function remsansMallar(katalog: readonly MallKort[], foreslagna: readonly string[]): { foreslagna: MallKort[]; gratis: MallKort[] } {
  const f = foreslagna.map((id) => katalog.find((m) => m.id === id)).filter((m): m is MallKort => Boolean(m))
  const gratis = katalog.filter((m) => m.niva === 'gratis' && !foreslagna.includes(m.id))
  return { foreslagna: f, gratis: gratis.slice(0, Math.max(0, MAX - f.length)) }
}

/** Datorns bredd (helskärmens remsa): från 900 px, som mallytans brytpunkt. */
function useDator(): boolean {
  const [dator, setDator] = useState(false)
  useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia('(min-width: 900px)')
    } catch {
      return
    }
    const satt = () => setDator(mq.matches)
    satt()
    mq.addEventListener?.('change', satt)
    return () => mq.removeEventListener?.('change', satt)
  }, [])
  return dator
}

function minsRorelse(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const AVDELARE = 'flex shrink-0 self-stretch items-center border-l border-kant px-1 text-[11px] font-semibold text-ink-3'

export default function Remsa({ katalog, vald, foreslagna, skal, onValj, onAlla, last, kompakt }: RemsaProps) {
  const dator = useDator()
  const bred = Boolean(kompakt && dator)
  const rullRef = useRef<HTMLDivElement>(null)
  const [kanter, setKanter] = useState({ vanster: false, hoger: false, rullar: false })

  const mat = useCallback(() => {
    const el = rullRef.current
    if (!el) return
    const rullar = el.scrollWidth > el.clientWidth + 1
    setKanter({ rullar, vanster: el.scrollLeft > 1, hoger: el.scrollLeft < el.scrollWidth - el.clientWidth - 1 })
  }, [])

  // Pilarna syns bara när remsan inte ryms; hjulet rullar i sidled.
  useEffect(() => {
    const el = rullRef.current
    if (!el || !bred) return
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    const hjul = (e: WheelEvent) => {
      if (e.ctrlKey || e.deltaX !== 0 || e.deltaY === 0) return
      if (el.scrollWidth <= el.clientWidth) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY })
    }
    el.addEventListener('scroll', mat, { passive: true })
    el.addEventListener('wheel', hjul, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', mat)
      el.removeEventListener('wheel', hjul)
    }
  }, [bred, mat])

  // Den valda mallen rullas in i remsan vid varje byte (klick, piltangent,
  // Alla-arket). Bara remsan rullar, aldrig sidan.
  useEffect(() => {
    const el = rullRef.current
    const knapp = el?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!el || !knapp) return
    const k = knapp.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const luft = 48
    if (k.left < r.left + luft) el.scrollBy({ left: k.left - r.left - luft, behavior: minsRorelse() ? 'auto' : 'smooth' })
    else if (k.right > r.right - luft) el.scrollBy({ left: k.right - r.right + luft, behavior: minsRorelse() ? 'auto' : 'smooth' })
  }, [vald, bred])

  // Efter ett val i Alla-arket går fokus tillbaka till "Alla N" (eller
  // body); den valda miniatyren är bättre ställe att stå på (UX A2).
  const forstaVald = useRef(true)
  useEffect(() => {
    if (forstaVald.current) {
      forstaVald.current = false
      return
    }
    const t = window.setTimeout(() => {
      const el = rullRef.current
      const aktiv = document.activeElement as HTMLElement | null
      if (!el || !(aktiv === document.body || aktiv?.hasAttribute('data-alla'))) return
      if (aktiv !== document.body && !el.contains(aktiv)) return
      el.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus({ preventScroll: true })
    }, 60)
    return () => window.clearTimeout(t)
  }, [vald])

  const rulla = (riktning: 1 | -1) => rullRef.current?.scrollBy({ left: riktning * 270, behavior: minsRorelse() ? 'auto' : 'smooth' })

  const allaBricka = (
    <div role="listitem" className={`${bred ? 'w-20' : 'w-16'} shrink-0`}>
      <button
        type="button"
        onClick={onAlla}
        disabled={last}
        data-alla
        className="flex aspect-[210/297] w-full items-center justify-center rounded-md border border-dashed border-kant-stark bg-papper-2 font-display text-[15px] font-extrabold text-ink-1 transition-colors hover:border-ink-1 hover:bg-papper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar-ink disabled:opacity-60"
      >
        {REMSA.alla(katalog.length)}
      </button>
    </div>
  )

  if (bred) {
    const grupper = grupperaMallar({ katalog, foreslagna })
    const pil = (riktning: 1 | -1) => (
      <button
        type="button"
        onClick={() => rulla(riktning)}
        disabled={riktning === -1 ? !kanter.vanster : !kanter.hoger}
        aria-label={riktning === -1 ? REMSA.flerVanster : REMSA.flerHoger}
        className={`absolute top-[calc(50%-10px)] z-[1] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-kant bg-papper text-ink-1 shadow-[0_1px_4px_rgba(0,0,0,.12)] transition-colors hover:border-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar-ink disabled:opacity-0 ${
          riktning === -1 ? 'left-0' : 'right-0'
        }`}
      >
        <IkonTillbaka size={18} className={riktning === 1 ? 'rotate-180' : undefined} />
      </button>
    )
    return (
      <div className="relative min-w-0 max-w-full" data-remsa="dator">
        {kanter.rullar ? pil(-1) : null}
        <div ref={rullRef} className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${kanter.rullar ? 'px-12' : ''}`}>
          <div className="mx-auto flex w-max max-w-none items-start gap-2.5 px-0.5 pb-1.5 pt-1" role="list" aria-label={REMSA.allaMallar}>
            {grupper.map((g, gi) => (
              <Fragment key={g.namn}>
                {gi > 0 ? (
                  <div className={AVDELARE} aria-hidden>
                    {g.namn}
                  </div>
                ) : null}
                {g.mallar.map((m) => (
                  <div role="listitem" key={m.id}>
                    <Miniatyr mall={m} vald={m.id === vald} onValj={onValj} disabled={last} storlek="helskarm" />
                  </div>
                ))}
              </Fragment>
            ))}
            {allaBricka}
          </div>
        </div>
        {kanter.rullar ? pil(1) : null}
      </div>
    )
  }

  const grupper = remsansMallar(katalog, foreslagna)
  return (
    <div className="min-w-0 max-w-full">
      {!kompakt ? (
        <div className="mb-1.5">
          <p className="text-ey uppercase text-ink-3">{REMSA.foreslagna}</p>
          {skal ? <p className="mt-0.5 text-meta text-ink-2">{skal}</p> : null}
        </div>
      ) : null}
      <div
        ref={rullRef}
        className="flex snap-x snap-mandatory items-start gap-2 overflow-x-auto px-0.5 pb-1.5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label={REMSA.foreslagna}
      >
        {grupper.foreslagna.map((m) => (
          <div role="listitem" key={m.id}>
            <Miniatyr mall={m} vald={m.id === vald} onValj={onValj} disabled={last} />
          </div>
        ))}
        {grupper.gratis.length > 0 ? (
          <div className={AVDELARE} aria-hidden>
            {REMSA.gratis}
          </div>
        ) : null}
        {grupper.gratis.map((m) => (
          <div role="listitem" key={m.id}>
            <Miniatyr mall={m} vald={m.id === vald} onValj={onValj} disabled={last} />
          </div>
        ))}
        {allaBricka}
      </div>
    </div>
  )
}
