'use client'

/**
 * Helskärmen är läsläget (skissen yta 3, V4b, ägarens punkt 1): ingen granne,
 * sidorna som egna A4-ark staplade med 12 px glipa och sidnummer, nyp för att
 * zooma (eller zoomknappen), remsan nederst byter mall. Topprad 56 px, arket
 * med 12 px marginal.
 *
 * Sidorna är den riktiga PDF:en (src/lib/cv/mallar/sidbilder.ts): samma kedja
 * som nedladdningen ritar filen och varje sida kommer tillbaka som bild, så
 * att sida 1 slutar exakt där den gör i filen, också i tvåspaltiga mallar där
 * spalterna bryts var för sig. Ingen egen uppskattning i webbläsaren.
 *
 * Medan sidorna hämtas (några sekunder första gången, sedan ur fliken) visas
 * hela CV:t i ett stycke ur förhandsvisningens iframe, utan brytlinjer, och
 * en rad säger att sidorna läggs upp. Går hämtningen inte visas stycket kvar
 * med en rad om det.
 *
 * Datorn (UX 2026-11-16, ägarens punkter): sidan så hög att den ryms i
 * höjd, två sidor bredvid varandra när de ryms, zooma ut och in i tre steg
 * (knappar, plus och minus), piltangenterna byter mall, Esc stänger, fokus
 * stannar i dialogen. Raden under remsan följer enheten.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IkonStang, IkonZoom, IkonZoomUt } from '@/components/illustrations/MallIkoner'
import { A4_KVOT } from './matning'
import { DOK } from './texter'
import { forhamtaSidbilder, useSidbilder, type Kalla } from './hooks'
import { oppnaDialog } from './dialoglager'

interface HelskarmProps {
  html?: string
  src?: string
  titel: string
  rubrik: string
  /** Efter rubriken på datorn, i grått (nivån: "Premium"). */
  rubrikTillagg?: string
  /** Dokumentets höjd i bredder (ur mätningen), för stycket medan sidorna hämtas. */
  hojd?: number
  /** Källan för sidorna ur PDF:en. Utan källa visas bara stycket. */
  kalla?: Kalla | null
  remsa?: ReactNode
  /** Föregående eller nästa mall (piltangenterna på datorn). */
  onByt?: (riktning: 1 | -1) => void
  /** Grannmallarnas källor, förhämtas på datorn när sidorna är klara. */
  grannar?: readonly Kalla[]
  onClose: () => void
}

/** Zoomstegen: plus och minus går ett steg, mobilens knapp växlar mellan första och sista. */
const ZOOM = [1, 1.4, 1.8] as const

/** Mus och tangentbord (inte pekskärm): styr raden under remsan. */
function useFinPekare(): boolean {
  const [fin, setFin] = useState(false)
  useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    } catch {
      return
    }
    const satt = () => setFin(mq.matches)
    satt()
    mq.addEventListener?.('change', satt)
    return () => mq.removeEventListener?.('change', satt)
  }, [])
  return fin
}

/** Tangenter som hör till ett fält eller ett annat lager (Alla-arket) lämnas i fred. */
function iFalt(e: KeyboardEvent, rot: HTMLElement | null): boolean {
  const t = e.target as HTMLElement | null
  if (!t || t === document.body) return false
  if (rot && !rot.contains(t)) return true
  return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
}

const ARK = 'relative overflow-hidden rounded-[4px] bg-white shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]'
const TOPPKNAPP =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-1 transition-colors hover:bg-papper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar-ink disabled:opacity-40 disabled:hover:bg-transparent'
/** Glipan mellan sidorna bredvid varandra och luften runt dem. */
const GLIPA = 24

/**
 * Sidans bredd vid zoom 1 (UX 2026-11-16, ägarens punkt 3). Mobil: ytans
 * bredd minus 24, högst 794. Dator (från 900 px): så hög att en hel sida
 * ryms i höjd med sidnumret under (16 px luft över och under, 26 px för
 * "Sida 1 av 2"), mellan 540 och 1200 px
 * (sidbilderna är 1600 breda). Under 540 rullar sidan i stället.
 */
export function sidbredd(ytaBredd: number, ytaHojd: number): number {
  if (ytaBredd < 900) return Math.max(0, Math.min(794, ytaBredd - 24))
  const iHojd = Math.floor((ytaHojd - 58) / A4_KVOT)
  return Math.max(0, Math.min(ytaBredd - 2 * GLIPA, 1200, Math.max(540, iHojd)))
}

export default function Helskarm({ html, src, titel, rubrik, rubrikTillagg, hojd, kalla, remsa, onByt, grannar, onClose }: HelskarmProps) {
  const [zoomSteg, setZoomSteg] = useState(0)
  const zoom = ZOOM[zoomSteg]
  const [yta, setYta] = useState({ b: 0, h: 0 })
  const rotRef = useRef<HTMLDivElement>(null)
  const ytaRef = useRef<HTMLDivElement>(null)
  const stangRef = useRef<HTMLButtonElement>(null)
  const hjalpId = useId()
  const { sidbilder, laddar, fel } = useSidbilder(kalla, true)
  const finPekare = useFinPekare()
  // Senaste handlingarna i en ref: lyssnaren läggs en gång och fokus står kvar.
  const handling = useRef({ onClose, onByt })
  handling.current = { onClose, onByt }

  useEffect(() => {
    const forraFokus = document.activeElement as HTMLElement | null
    stangRef.current?.focus({ preventScroll: true })
    const slapp = oppnaDialog()
    const tangent = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const rot = rotRef.current
      // Ett ark ovanpå (Alla-arket) tar Esc själv i fångstfasen.
      if (e.key === 'Escape') {
        e.preventDefault()
        handling.current.onClose()
        return
      }
      if (iFalt(e, rot)) return
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && handling.current.onByt) {
        e.preventDefault()
        handling.current.onByt(e.key === 'ArrowRight' ? 1 : -1)
      } else if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        e.preventDefault()
        setZoomSteg((z) => Math.min(ZOOM.length - 1, z + 1))
      } else if (e.key === '-' || e.key === 'Subtract') {
        e.preventDefault()
        setZoomSteg((z) => Math.max(0, z - 1))
      } else if (e.key === 'Tab' && rot) {
        // Fokus stannar i helskärmen.
        const fokuserbara = [...rot.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])')].filter(
          (el) => el.offsetParent !== null
        )
        if (fokuserbara.length === 0) return
        const forsta = fokuserbara[0]
        const sista = fokuserbara[fokuserbara.length - 1]
        if (e.shiftKey && document.activeElement === forsta) {
          e.preventDefault()
          sista.focus()
        } else if (!e.shiftKey && document.activeElement === sista) {
          e.preventDefault()
          forsta.focus()
        } else if (!rot.contains(document.activeElement)) {
          e.preventDefault()
          forsta.focus()
        }
      }
    }
    document.addEventListener('keydown', tangent)
    const forra = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      slapp()
      document.removeEventListener('keydown', tangent)
      document.body.style.overflow = forra
      forraFokus?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const el = ytaRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setYta({ b: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const dator = yta.b >= 900
  const arkBredd = Math.max(0, sidbredd(yta.b, yta.h) * zoom)
  const stycketsHojd = Math.max(A4_KVOT, hojd ?? A4_KVOT) * arkBredd
  // Två sidor bredvid varandra när CV:t har minst två och de ryms (UX B10).
  const tvaSpalter = Boolean(dator && sidbilder && sidbilder.sidor >= 2 && yta.b >= 2 * arkBredd + 3 * GLIPA)
  const innerBredd = tvaSpalter ? 2 * arkBredd + GLIPA : arkBredd

  // Grannarna förhämtas när den här mallens sidor är klara (bara mus och tangentbord).
  const harSidor = Boolean(sidbilder)
  useEffect(() => {
    if (!finPekare || !harSidor || !grannar) return
    const t = window.setTimeout(() => grannar.forEach(forhamtaSidbilder), 300)
    return () => window.clearTimeout(t)
  }, [finPekare, harSidor, grannar])

  // Zoomad sida: bläddringsytan börjar centrerad i sidled, inte vid vänsterkanten.
  useEffect(() => {
    const el = ytaRef.current
    if (!el) return
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2)
  }, [zoomSteg, tvaSpalter])

  if (typeof document === 'undefined') return null

  const zoomaUt = () => setZoomSteg((z) => Math.max(0, z - 1))
  const zoomaIn = () => setZoomSteg((z) => Math.min(ZOOM.length - 1, z + 1))
  const hjalp = remsa ? (
    finPekare ? (
      <p id={hjalpId} className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-meta text-ink-3" data-hjalp="dator">
        {DOK.tangenter
          .filter((t) => t.typ !== 'byt' || onByt)
          .map((t) => (
            <span key={t.typ} className="inline-flex items-center gap-1.5">
              <span className="inline-flex gap-1">
                {t.tangenter.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-kant bg-papper px-1.5 font-sans text-[11px] font-semibold text-ink-2"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
              {t.text}
            </span>
          ))}
      </p>
    ) : (
      <p id={hjalpId} className="mt-1 text-center text-meta text-ink-3" data-hjalp="peka">
        {DOK.hjalpPeka}
      </p>
    )
  ) : null

  return createPortal(
    <div
      ref={rotRef}
      role="dialog"
      aria-modal="true"
      aria-label={rubrik}
      aria-describedby={remsa ? hjalpId : undefined}
      className="fixed inset-0 z-[80] flex flex-col bg-golv"
      data-helskarm
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-kant bg-papper px-1.5">
        <button ref={stangRef} type="button" onClick={onClose} aria-label={DOK.stangEsc} title={finPekare ? DOK.stangEsc : undefined} className={TOPPKNAPP}>
          <IkonStang size={20} />
        </button>
        <p className="min-w-0 truncate text-[15px] font-semibold text-ink-1" data-helskarm-rubrik>
          {rubrik}
          {rubrikTillagg ? <span className="hidden font-normal text-ink-3 min-[900px]:inline"> · {rubrikTillagg}</span> : null}
        </p>
        {/* Mobil: en knapp som växlar. Dator: zooma ut och in, tre steg. */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={zoomaUt}
            disabled={zoomSteg === 0}
            aria-label={DOK.zoomaUt}
            title={DOK.zoomaUt}
            className={`${TOPPKNAPP} hidden min-[900px]:inline-flex`}
            data-zoom="ut"
          >
            <IkonZoomUt size={20} />
          </button>
          <button
            type="button"
            onClick={zoomaIn}
            disabled={zoomSteg === ZOOM.length - 1}
            aria-label={DOK.zoomaIn}
            title={DOK.zoomaIn}
            className={`${TOPPKNAPP} hidden min-[900px]:inline-flex`}
            data-zoom="in"
          >
            <IkonZoom size={20} />
          </button>
          <button
            type="button"
            onClick={() => setZoomSteg((z) => (z === 0 ? ZOOM.length - 1 : 0))}
            aria-label={DOK.zooma}
            aria-pressed={zoom > 1}
            className={`${TOPPKNAPP} min-[900px]:hidden`}
            data-zoom="vaxla"
          >
            <IkonZoom size={20} />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={ytaRef}
          className={`min-h-0 flex-1 overflow-auto overscroll-contain ${remsa ? '' : 'pb-[env(safe-area-inset-bottom)]'}`}
          style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
        >
          {arkBredd > 0 ? (
            <div className="mx-auto py-3 min-[900px]:py-4" style={{ width: innerBredd }}>
              {sidbilder ? (
                // Sidorna ur PDF:en, ett ark per sida med glipa och sidnummer.
                <ol
                  aria-label={DOK.sidor(sidbilder.sidor)}
                  className={tvaSpalter ? 'grid grid-cols-2 gap-x-6 gap-y-3' : 'grid gap-3'}
                  data-sidor={sidbilder.sidor}
                  data-spalter={tvaSpalter ? 2 : 1}
                >
                  {sidbilder.bilder.map((bild, i) => (
                    <li key={i} className="grid content-start gap-1.5">
                      <div className={ARK} style={{ height: arkBredd * sidbilder.kvot }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bild}
                          alt={`${titel}, ${DOK.sidaAv(i + 1, sidbilder.sidor).toLowerCase()}`}
                          data-sida={i + 1}
                          draggable={false}
                          className="absolute inset-0 block h-full w-full select-none"
                        />
                      </div>
                      <p className="text-center text-meta text-ink-2">{DOK.sidaAv(i + 1, sidbilder.sidor)}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div>
                  {/* Hela CV:t i ett stycke ur förhandsvisningen, utan brytlinjer:
                      var sidorna bryts vet bara PDF:en. Tonat till 80 % (UX:
                      brödtexten håller AA också på mörkt golv). */}
                  <div className={`${ARK} ${laddar ? 'opacity-80' : ''}`} style={{ height: stycketsHojd }} data-stycke>
                    <iframe
                      srcDoc={html}
                      src={html ? undefined : src}
                      title={titel}
                      scrolling="no"
                      tabIndex={-1}
                      className="pointer-events-none absolute inset-0 block h-full w-full border-0 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Brickan som snackbar nederst i bläddringsytan (UX 2026-11-16): utanför
            flödet, så arket står still när sidorna kommer (CLS 0), och aldrig
            över namnet. Syskon till ytan, så den följer inte med skrollen. */}
        {!sidbilder && (laddar || fel) ? (
          <p
            role="status"
            className="pointer-events-none absolute bottom-3 left-1/2 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2 rounded-[14px] border border-kant bg-papper px-3 py-1.5 text-center text-meta text-ink-2 shadow-[0_1px_0_rgba(0,0,0,.08),0_6px_16px_-8px_rgba(0,0,0,.35)]"
            style={{ width: 'max-content' }}
          >
            {laddar ? <span aria-hidden className="h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-kant-stark border-t-ink-1 motion-reduce:animate-none" /> : null}
            {laddar ? DOK.sidorLaddar : DOK.sidorFel}
          </p>
        ) : null}
      </div>

      {remsa ? (
        <div className="shrink-0 border-t border-kant bg-papper px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
          {remsa}
          {hjalp}
        </div>
      ) : null}
    </div>,
    document.body
  )
}
