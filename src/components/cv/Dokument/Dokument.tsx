'use client'

/**
 * Dokumentet (plan-mallar 3.2, skissen yta 3): CV:t i en mall som ett ark i
 * A4-proportion, och det enda som behövs för att välja mall.
 *
 * - Iframen har pointer-events: none. Ovanpå ligger träffytor per rubrik och
 *   avsnitt, räknade ur dokumentet när det laddat (matning.ts).
 * - Tre signaler säger att arket går att trycka på: en prickad kopparlinje
 *   under varje rubrik (alltid), heldragen med en penna vid hover och press,
 *   och första gången raden "Tryck på en rubrik för att byta den" i sex
 *   sekunder. Ett valt avsnitt får kopparram och namnchip. Träffytorna är
 *   minst 44 px höga oavsett rubrikens storlek.
 * - Svep i sidled byter mall; grannens miniatyr syns under arket medan hon
 *   drar. Avstängt när ett ark är öppet eller filen skapas.
 * - Sidbricka och brytlinje när CV:t är längre än en sida. Tryck utanför
 *   avsnitten, eller på brickan, öppnar helskärmen.
 * - Arket har fast A4-höjd från första målningen (CLS 0).
 *
 * Storlekar: liten (artikel, yrkessida, utan träffytor), mellan (byggaren),
 * stor (provsidan, mallsidan, inloggat).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { MallKort, Sektion } from '@/lib/cv/mallar/kontrakt'
import { IkonPenna, IkonSida, IkonZoom } from '@/components/illustrations/MallIkoner'
import { matDokument, medSkala, type Matning } from './matning'
import { AVSNITT, DOK } from './texter'
import Helskarm from './Helskarm'
import type { Kalla } from './hooks'

const TIPS_NYCKEL = 'jc_mall_tips_sett'

export interface DokumentProps {
  storlek: 'liten' | 'mellan' | 'stor'
  /** Färdig HTML (srcdoc). */
  html?: string | null
  /** Eller en adress på samma ursprung (exempel-API:t). */
  src?: string | null
  /** Källan, för helskärmens sidor ur PDF:en (useSidbilder). */
  kalla?: Kalla | null
  /** Iframens titel för skärmläsare. */
  titel: string
  /** Mallen som visas; namnet i helskärmens topprad. */
  mall?: MallKort | null
  /** Mallarna i den ordning svepet går. */
  ordning?: readonly MallKort[]
  laddar?: boolean
  /** Lyfter 8 px medan filen skapas. */
  lyft?: boolean
  /** Låst: inga tryck, inget svep (under "Skapar PDF"). */
  last?: boolean
  onRubrik?: (sektion: Sektion, text: string) => void
  onAvsnitt?: (sektion: Sektion) => void
  /** Avsnitt som saknas i CV:t, som "+ Lägg till"-rader längst ner på arket. */
  tommaAvsnitt?: readonly Sektion[]
  valtAvsnitt?: Sektion | null
  onSvep?: (mallId: string) => void
  onMatt?: (m: Matning) => void
  /** Remsan i helskärmens fot. */
  helskarmRemsa?: ReactNode
  /** Visa raden under arket ("Klicka på arket för att läsa i helskärm"). */
  visaHjalprad?: boolean
  className?: string
}

const BREDD: Record<DokumentProps['storlek'], string> = {
  liten: 'max-w-[560px]',
  mellan: 'max-w-[520px]',
  stor: 'max-w-[600px]',
}

function minsRorelse(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export default function Dokument({
  storlek,
  html,
  src,
  kalla,
  titel,
  mall,
  ordning,
  laddar,
  lyft,
  last,
  onRubrik,
  onAvsnitt,
  tommaAvsnitt,
  valtAvsnitt,
  onSvep,
  onMatt,
  helskarmRemsa,
  visaHjalprad,
  className = '',
}: DokumentProps) {
  const ramRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [bredd, setBredd] = useState(0)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [tips, setTips] = useState(false)
  const [helskarm, setHelskarm] = useState(false)
  const [drag, setDrag] = useState(0)
  const startX = useRef<number | null>(null)
  const startY = useRef(0)
  const dragit = useRef(false)

  const interaktiv = storlek !== 'liten' && Boolean(onRubrik || onAvsnitt)
  const srcdoc = useMemo(() => (html ? medSkala(html) : undefined), [html])

  // Arkets bredd, för träffytorna.
  useEffect(() => {
    const el = ramRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBredd(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const mat = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc || !doc.body) return
    try {
      const m = matDokument(doc)
      setMatning(m)
      onMatt?.(m)
    } catch {
      // Ett dokument som inte går att mäta visas ändå, utan träffytor.
    }
  }, [onMatt])

  // Ny källa: gamla träffytor bort tills den nya mätningen finns.
  useEffect(() => {
    setMatning(null)
  }, [srcdoc, src])

  // Första besöket: raden om rubrikerna i sex sekunder, en gång. Klockan
  // startar först när arket syns till minst hälften (granskningen B2), så
  // raden inte hinner slockna medan hon står kvar i hjälten.
  const harRubriker = Boolean(matning && matning.rubriker.length > 0)
  useEffect(() => {
    if (!interaktiv || !harRubriker) return
    let sett = true
    try {
      sett = window.localStorage.getItem(TIPS_NYCKEL) === '1'
    } catch {
      sett = true
    }
    if (sett || !ramRef.current) return
    let t: number | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || t !== undefined) return
        setTips(true)
        try {
          window.localStorage.setItem(TIPS_NYCKEL, '1')
        } catch {
          // Lagringen är avstängd: raden visas igen nästa gång, det är allt.
        }
        t = window.setTimeout(() => setTips(false), 6000)
        io.disconnect()
      },
      { threshold: 0.5 }
    )
    io.observe(ramRef.current)
    return () => {
      io.disconnect()
      if (t !== undefined) window.clearTimeout(t)
    }
  }, [interaktiv, harRubriker])

  const index = mall && ordning ? ordning.findIndex((m) => m.id === mall.id) : -1
  const granne = (riktning: 1 | -1): MallKort | null => {
    if (!ordning || index < 0 || ordning.length < 2) return null
    return ordning[(index + riktning + ordning.length) % ordning.length]
  }
  const kanSvepa = Boolean(onSvep && ordning && ordning.length > 1 && !last)

  const onPointerDown = (e: React.PointerEvent) => {
    if (!kanSvepa) return
    startX.current = e.clientX
    startY.current = e.clientY
    dragit.current = false
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (!dragit.current && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) dragit.current = true
    if (dragit.current) setDrag(dx)
  }
  const onPointerUp = () => {
    if (startX.current === null) return
    startX.current = null
    const dx = drag
    setDrag(0)
    if (dragit.current && Math.abs(dx) > 60) {
      const ny = granne(dx < 0 ? 1 : -1)
      if (ny) onSvep?.(ny.id)
    }
  }

  const px = (v: number) => v * bredd
  const forstaSidan = bredd * (1123 / 794)
  const rubriker = (matning?.rubriker ?? []).filter((r) => px(r.y) < forstaSidan - 8)
  const sidor = matning?.sidor ?? 1
  const visadGranne = drag !== 0 ? granne(drag < 0 ? 1 : -1) : null
  const rorelse = !minsRorelse()

  const oppnaHelskarm = () => {
    if (!dragit.current) setHelskarm(true)
  }

  return (
    <div className={`mx-auto w-full ${BREDD[storlek]} ${className}`.trim()}>
      {/* Första besöket: raden ovanför arket, i ett spår med reserverad höjd
          (CLS 0), så att den aldrig täcker namnet. */}
      {interaktiv ? (
        <div className="mb-1.5 h-9" aria-live="polite" data-tips-spar>
          {tips ? (
            <p className="flex h-9 items-center gap-2 rounded-xl bg-ton px-3 text-[13px] font-medium text-ton-ink">
              <IkonPenna size={16} />
              {DOK.tips}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        className="relative touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (dragit.current) {
            e.preventDefault()
            e.stopPropagation()
            dragit.current = false
          }
        }}
      >
        {/* Grannens miniatyr under arket medan hon drar. */}
        {visadGranne ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visadGranne.bild.stor}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full rounded-[4px] bg-white object-cover object-top opacity-90"
          />
        ) : null}

        <div
          ref={ramRef}
          className={`dok-ark-yta relative aspect-[794/1123] w-full overflow-hidden rounded-[4px] bg-white ${
            rorelse ? 'transition-[transform,box-shadow] duration-300 ease-out' : ''
          } ${
            lyft
              ? 'shadow-[0_2px_0_rgba(0,0,0,.08),0_24px_40px_-16px_rgba(0,0,0,.55)]'
              : 'shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]'
          }`}
          style={{
            transform: `translate(${drag}px, ${lyft && rorelse ? -8 : 0}px)`,
            transition: drag !== 0 ? 'none' : undefined,
          }}
        >
          {srcdoc || src ? (
            <iframe
              ref={iframeRef}
              key={srcdoc ? undefined : src ?? undefined}
              srcDoc={srcdoc}
              src={srcdoc ? undefined : src ?? undefined}
              title={titel}
              scrolling="no"
              loading={storlek === 'liten' ? 'lazy' : undefined}
              onLoad={() => window.setTimeout(mat, 60)}
              tabIndex={-1}
              className={`pointer-events-none absolute inset-0 block h-full w-full border-0 bg-white ${
                rorelse ? 'transition-opacity duration-200' : ''
              } ${laddar ? 'opacity-40' : 'opacity-100'}`}
            />
          ) : null}

          {/* Tryck utanför avsnitten: helskärmen. */}
          {storlek !== 'liten' ? (
            <button
              type="button"
              aria-label={DOK.helskarm}
              onClick={oppnaHelskarm}
              disabled={last}
              className="absolute inset-0 cursor-zoom-in"
            />
          ) : null}

          {/* Avsnitten och rubrikerna. */}
          {interaktiv && bredd > 0
            ? rubriker.map((r, i) => {
                const valt = valtAvsnitt === r.sektion
                const linjeY = px(r.y + r.h) + 2
                const traffHojd = Math.max(44, px(r.h) + 12)
                const traffTopp = px(r.y + r.h / 2) - traffHojd / 2
                return (
                  <div key={`${r.sektion}-${i}`}>
                    {onAvsnitt ? (
                      <button
                        type="button"
                        disabled={last}
                        aria-label={`${AVSNITT.rubrik[r.sektion]}: ${r.text}`}
                        onClick={() => onAvsnitt(r.sektion)}
                        className={`absolute rounded-[4px] ${valt ? 'border-2 border-koppar' : 'hover:bg-koppar/5'}`}
                        style={{
                          left: px(r.avsnitt.x) - 6,
                          top: px(r.avsnitt.y),
                          width: px(r.avsnitt.b) + 12,
                          height: Math.min(px(r.avsnitt.h), forstaSidan - px(r.avsnitt.y)),
                        }}
                      >
                        {valt ? (
                          <span className="absolute -top-[22px] left-[-2px] whitespace-nowrap rounded-full bg-koppar px-2 py-0.5 text-[10px] font-bold text-koppar-text">
                            {r.text}
                          </span>
                        ) : null}
                      </button>
                    ) : null}
                    {/* Den prickade linjen, heldragen med penna vid hover. */}
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute border-t-[1.5px] border-koppar ${
                        hover === i ? 'border-solid opacity-100' : 'border-dotted opacity-60'
                      }`}
                      style={{ left: px(r.x), top: linjeY, width: Math.max(px(r.b), 40) }}
                    />
                    {onRubrik ? (
                      <button
                        type="button"
                        disabled={last}
                        aria-label={`Byt rubrik: ${r.text}`}
                        onClick={(e) => {
                          // Rubriken till en femtedel av vyn, så att den syns ovanför arket (granskningen V1).
                          const el = e.currentTarget
                          el.style.scrollMarginTop = '20vh'
                          el.scrollIntoView({ block: 'start', behavior: minsRorelse() ? 'auto' : 'smooth' })
                          onRubrik(r.sektion, r.text)
                        }}
                        onPointerEnter={() => setHover(i)}
                        onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover((h) => (h === i ? null : h))}
                        className="absolute rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar"
                        style={{ left: px(r.x) - 6, top: traffTopp, width: Math.max(px(r.b), 120) + 12, height: traffHojd }}
                      >
                        {hover === i ? (
                          <span
                            aria-hidden
                            className="absolute right-[-26px] top-1/2 inline-flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full bg-koppar text-koppar-text"
                          >
                            <IkonPenna size={13} />
                          </span>
                        ) : null}
                      </button>
                    ) : null}
                  </div>
                )
              })
            : null}

          {/* Tomma avsnitt som "+ Lägg till" längst ner på första sidan. */}
          {interaktiv && onAvsnitt && tommaAvsnitt && tommaAvsnitt.length > 0 && bredd > 0 ? (
            <div className="absolute inset-x-[14%] bottom-[4%] grid gap-2">
              {tommaAvsnitt.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={last}
                  onClick={() => onAvsnitt(s)}
                  className="flex min-h-11 items-center justify-center rounded-[4px] border-[1.5px] border-dashed border-kant-stark bg-white/90 text-xs font-semibold text-[#4A4A55]"
                >
                  {AVSNITT.tomma[s]}
                </button>
              ))}
            </div>
          ) : null}

          {/* Brytlinjen när CV:t fortsätter på sida 2. */}
          {sidor > 1 ? (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[3px] border-t-[1.5px] border-dashed border-koppar">
              <span className="absolute -top-[18px] left-1.5 rounded bg-white px-1.5 py-px text-[10px] text-[#A8491A]">
                {DOK.sidan2}
              </span>
            </div>
          ) : null}

          {/* Sidbrickan, öppnar helskärmen. */}
          {storlek !== 'liten' ? (
            <button
              type="button"
              onClick={() => setHelskarm(true)}
              disabled={last}
              aria-label={`${DOK.sidor(sidor)}. ${DOK.helskarm}`}
              className="absolute bottom-2 right-2 inline-flex h-7 items-center gap-1 rounded-[7px] bg-ink-1 px-2 text-xs font-semibold text-papper"
            >
              <IkonSida size={13} />
              {sidor}
            </button>
          ) : null}

          {storlek !== 'liten' ? (
            <button
              type="button"
              onClick={() => setHelskarm(true)}
              disabled={last}
              aria-label={DOK.helskarm}
              className="absolute right-2 top-2 z-[2] inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-[#1A1A1F] shadow-[0_1px_4px_rgba(0,0,0,.18)]"
            >
              <IkonZoom size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Raden under arket säger var hon är och att svep finns (granskningen
          B3); på datorn bara var hon är. */}
      {interaktiv && mall && ordning && index >= 0 ? (
        <p className="mt-2 text-center text-[13px] text-ink-3">
          <span className="min-[900px]:hidden">{DOK.radMobil(mall.namn, index + 1, ordning.length)}</span>
          <span className="hidden min-[900px]:inline">{DOK.radDator(mall.namn, index + 1, ordning.length)}</span>
        </p>
      ) : visaHjalprad ? (
        <p className="mt-2 text-center text-meta text-ink-3">{DOK.klickaHelskarm}</p>
      ) : null}

      {helskarm ? (
        <Helskarm
          html={srcdoc}
          src={srcdoc ? undefined : src ?? undefined}
          titel={titel}
          rubrik={mall && ordning && index >= 0 ? DOK.mallAv(mall.namn, index + 1, ordning.length) : titel}
          hojd={matning?.hojd}
          kalla={kalla}
          remsa={helskarmRemsa}
          onClose={() => setHelskarm(false)}
        />
      ) : null}
    </div>
  )
}
