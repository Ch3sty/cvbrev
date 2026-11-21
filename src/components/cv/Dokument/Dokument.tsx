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
import { matDokument, medSkala, type HuvudFalt, type Matning } from './matning'
import { AVSNITT, DOK, HUVUD, REMSA } from './texter'
import Helskarm from './Helskarm'
import type { Kalla } from './hooks'

const TIPS_NYCKEL = 'jc_mall_tips_sett'
/** Pennans plats till höger om texten, inne i träffytan: 4 px luft, 22 px penna, 4 px. */
const PENNA = 30

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
  /** Namnet, titeln eller kontaktraden trycktes (redigeras som avsnitten). */
  onHuvud?: (falt: HuvudFalt) => void
  /** Avsnitt som saknas i CV:t, som "+ Lägg till"-rader längst ner på arket. */
  tommaAvsnitt?: readonly Sektion[]
  valtAvsnitt?: Sektion | null
  /**
   * CV-byggaren (skissen 2026-11-16): avsnitt som bara har grå spöktext.
   * Hela avsnittet med rubriken är träffytan, och "+ Lägg till" står som en
   * diskret pill vid rubriken.
   */
  spokAvsnitt?: readonly Sektion[]
  /** Nyss sparat avsnitt: kopparramen som tonar bort. */
  nyssAvsnitt?: Sektion | null
  /** Inga prickade linjer under rubriker och huvud (byggaren under ifyllandet). */
  utanLinjer?: boolean
  /** "+ Fler avsnitt" under sista innehållet. */
  fler?: { text: string; onClick: () => void }
  /** Egen tipsrad första gången, med egen nyckel. */
  tips?: { text: string; nyckel: string }
  onSvep?: (mallId: string) => void
  onMatt?: (m: Matning) => void
  /** Remsan i helskärmens fot. */
  helskarmRemsa?: ReactNode
  /** Visa raden under arket ("Klicka på arket för att läsa i helskärm"). */
  visaHjalprad?: boolean
  /**
   * Arket på CV-rummets vägg (Mallar, byggspecen avsnitt 5): utan tipsraden
   * ovanför och bandet under (väggen har egna), och avsnittet under pekaren
   * markeras med kopparram och penna. Utelämnat: som förut (publikt, byggaren).
   */
  vagg?: boolean
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
  onHuvud,
  tommaAvsnitt,
  valtAvsnitt,
  spokAvsnitt,
  nyssAvsnitt,
  utanLinjer,
  fler,
  tips: egetTips,
  onSvep,
  onMatt,
  helskarmRemsa,
  visaHjalprad,
  vagg = false,
  className = '',
}: DokumentProps) {
  const ramRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [bredd, setBredd] = useState(0)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [hover, setHover] = useState<number | string | null>(null)
  const [tips, setTips] = useState(false)
  const [helskarm, setHelskarm] = useState(false)
  const [drag, setDrag] = useState(0)
  const startX = useRef<number | null>(null)
  const startY = useRef(0)
  const dragit = useRef(false)

  const interaktiv = storlek !== 'liten' && Boolean(onRubrik || onAvsnitt || onHuvud)
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

  // Serverns HTML (byggarens första målning) kan ha laddat före hydreringen,
  // och då kom onLoad aldrig fram: mät det som redan står i iframen.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (doc?.readyState === 'complete' && doc.body?.childElementCount) {
      const t = window.setTimeout(mat, 60)
      return () => window.clearTimeout(t)
    }
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      sett = window.localStorage.getItem(egetTips?.nyckel ?? TIPS_NYCKEL) === '1'
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
          window.localStorage.setItem(egetTips?.nyckel ?? TIPS_NYCKEL, '1')
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

  const grannKallor = useMemo(() => {
    if (kalla?.typ !== 'exempel' || !ordning || index < 0 || ordning.length < 2) return undefined
    const n = ordning.length
    return [ordning[(index + 1) % n], ordning[(index - 1 + n) % n]].map((m) => ({ ...kalla, mall: m.id }))
  }, [kalla, ordning, index])

  const oppnaHelskarm = () => {
    if (!dragit.current) setHelskarm(true)
  }

  return (
    <div className={`mx-auto w-full ${BREDD[storlek]} ${className}`.trim()}>
      {/* Första besöket: raden ovanför arket, i ett spår med reserverad höjd
          (CLS 0), så att den aldrig täcker namnet. */}
      {interaktiv && !vagg ? (
        <div className="mb-1.5 h-9" aria-live="polite" data-tips-spar>
          {tips ? (
            <p className="flex h-9 items-center gap-2 rounded-xl bg-ton px-3 text-[13px] font-medium text-ton-ink">
              <IkonPenna size={16} />
              {egetTips?.text ?? DOK.tips}
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
                const spok = Boolean(spokAvsnitt?.includes(r.sektion))
                const ram = valt || nyssAvsnitt === r.sektion
                // Ett spöke: träffytan börjar vid rubriken och är minst 44 px.
                const avsTopp = spok ? px(r.y) - 4 : px(r.avsnitt.y)
                const avsHojd = spok
                  ? Math.max(44, Math.min(px(r.avsnitt.y + r.avsnitt.h) - avsTopp, forstaSidan - avsTopp))
                  : Math.min(px(r.avsnitt.h), forstaSidan - px(r.avsnitt.y))
                const linjeY = px(r.y + r.h) + 2
                const traffHojd = Math.max(44, px(r.h) + 12)
                const traffTopp = px(r.y + r.h / 2) - traffHojd / 2
                return (
                  <div key={`${r.sektion}-${i}`}>
                    {onAvsnitt ? (
                      <button
                        type="button"
                        disabled={last}
                        aria-label={spok ? AVSNITT.saknas(r.text || AVSNITT.rubrik[r.sektion]) : `${AVSNITT.rubrik[r.sektion]}: ${r.text}`}
                        data-avsnitt-knapp={r.sektion}
                        onClick={() => onAvsnitt(r.sektion)}
                        className={`absolute rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar ${
                          ram ? '' : 'hover:bg-koppar/5'
                        }${vagg ? ' dok-avsnitt-vagg' : ''}`}
                        style={{
                          left: px(r.avsnitt.x) - 6,
                          top: avsTopp,
                          width: px(r.avsnitt.b) + 12,
                          height: avsHojd,
                        }}
                      >
                        {/* Kopparramen: aktivt avsnitt, eller nyss sparat (tonar bort). */}
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute inset-0 rounded-[4px] border-2 border-koppar ${
                            rorelse ? 'transition-opacity duration-300' : ''
                          } ${ram ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {vagg && !spok ? (
                          <span aria-hidden className="dok-avsnitt-penna">
                            <IkonPenna size={16} />
                          </span>
                        ) : null}
                        {valt ? (
                          <span className="absolute -top-[22px] left-[-2px] whitespace-nowrap rounded-full bg-koppar px-2 py-0.5 text-[10px] font-bold text-koppar-text">
                            {r.text}
                          </span>
                        ) : null}
                      </button>
                    ) : null}
                    {/* "+ Lägg till" vid ett spökes rubrik: bara pekaren, avsnittet är träffytan. */}
                    {spok && onAvsnitt ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inline-flex h-[22px] items-center whitespace-nowrap rounded-full border border-dashed border-[#C9C6BF] bg-white px-2 text-[10.5px] font-semibold leading-none text-[#4A4A55] min-[900px]:h-7 min-[900px]:border-[1.5px] min-[900px]:px-2.5 min-[900px]:text-[12.5px]"
                        style={{ right: Math.max(4, bredd - px(r.x + r.b) - 2), top: px(r.y + r.h / 2) - (bredd >= 500 ? 14 : 11) }}
                        data-lagg-till={r.sektion}
                      >
                        {AVSNITT.laggTillFor(r.sektion, r.text)}
                      </span>
                    ) : null}
                    {/* Den prickade linjen, heldragen med penna vid hover. */}
                    {utanLinjer ? null : (
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute border-t-[1.5px] border-koppar ${
                          hover === i ? 'border-solid opacity-100' : 'border-dotted opacity-60'
                        }`}
                        style={{ left: px(r.x), top: linjeY, width: Math.max(px(r.b), 40) }}
                      />
                    )}
                    {onRubrik && !spok ? (
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
                        // Pennan ligger inne i träffytan (ägaren 2026-11-16): musen kan
                        // gå från rubriken till pennan utan att hovringen släpper.
                        style={{ left: px(r.x) - 6, top: traffTopp, width: Math.max(px(r.b) + PENNA, 120) + 12, height: traffHojd }}
                      >
                        {hover === i ? (
                          <span
                            aria-hidden
                            className="absolute top-1/2 inline-flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full bg-koppar text-koppar-text"
                            style={{ left: px(r.b) + 10 }}
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

          {/* Namnet, titeln och kontaktraden: samma signaler som rubrikerna. */}
          {interaktiv && onHuvud && bredd > 0
            ? (matning?.falt ?? []).map((f, i, alla) => {
                const nyckel = `falt-${f.falt}`
                // Minst 44 px hög träffyta, men aldrig in över grannfältet
                // ovanför eller under (titeln ligger tätt mellan namn och
                // kontakt) eller över en rubrik (första rubriken under huvudet).
                const ideal = Math.max(44, px(f.h) + 8)
                let topp = px(f.y + f.h / 2) - ideal / 2
                let botten = topp + ideal
                for (const g of [...alla, ...rubriker]) {
                  if (g === f || g.x + g.b <= f.x || g.x >= f.x + f.b) continue
                  if (g.y + g.h <= f.y) topp = Math.max(topp, px((g.y + g.h + f.y) / 2))
                  else if (g.y >= f.y + f.h) botten = Math.min(botten, px((f.y + f.h + g.y) / 2))
                }
                const traffHojd = botten - topp
                const traffTopp = topp
                const pennaVanster = Math.min(px(f.b) + 10, bredd - px(f.x) - 22)
                return (
                  <div key={nyckel}>
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute border-t-[1.5px] border-koppar ${
                        hover === nyckel ? 'border-solid opacity-100' : utanLinjer ? 'opacity-0' : 'border-dotted opacity-60'
                      }`}
                      style={{ left: px(f.x), top: px(f.y + f.h) + 2, width: Math.max(px(f.b), 40) }}
                    />
                    <button
                      type="button"
                      disabled={last}
                      aria-label={HUVUD.andra[f.falt]}
                      data-huvud={f.falt}
                      onClick={() => onHuvud(f.falt)}
                      onPointerEnter={() => setHover(nyckel)}
                      onPointerLeave={() => setHover((h) => (h === nyckel ? null : h))}
                      onFocus={() => setHover(nyckel)}
                      onBlur={() => setHover((h) => (h === nyckel ? null : h))}
                      className="absolute rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar"
                      style={{
                        left: px(f.x) - 6,
                        top: traffTopp,
                        width: Math.min(px(f.b) + PENNA + 12, bredd - px(f.x) + 6),
                        height: traffHojd,
                      }}
                    >
                      {hover === nyckel ? (
                        <span
                          aria-hidden
                          className="absolute top-1/2 inline-flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full bg-koppar text-koppar-text"
                          style={{ left: pennaVanster }}
                        >
                          <IkonPenna size={13} />
                        </span>
                      ) : null}
                    </button>
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

          {/* "+ Fler avsnitt" under sista innehållet, när det ryms på första sidan. */}
          {fler && interaktiv && bredd > 0 && matning?.botten !== undefined && sidor === 1 && px(matning.botten) + 64 < forstaSidan ? (
            <button
              type="button"
              disabled={last}
              onClick={fler.onClick}
              data-fler
              className="absolute inset-x-[10%] flex min-h-11 items-center justify-center rounded-[4px] text-[13px] font-medium text-[#65656E] hover:bg-koppar/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-koppar"
              style={{ top: px(matning.botten) + 10 }}
            >
              {fler.text}
            </button>
          ) : null}

          {/* Brytlinjen när CV:t fortsätter på sida 2: vid arkets nederkant,
              utan text i arket. Etiketten hänger som en flik under arket
              (ägaren 2026-11-16: den täckte CV:ts text). */}
          {sidor > 1 ? (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-t-[1.5px] border-dashed border-koppar" data-brytlinje />
          ) : null}

          {/* Sidbrickan, öppnar helskärmen. */}
          {storlek !== 'liten' ? (
            <button
              type="button"
              onClick={() => setHelskarm(true)}
              disabled={last}
              aria-label={`${DOK.sidor(sidor)}. ${DOK.helskarm}`}
              className="absolute bottom-3 right-3 inline-flex h-7 items-center gap-1 rounded-[7px] bg-ink-1 px-2 text-xs font-semibold text-papper"
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
        {/* Fliken under arket, utanför arkets klippning. */}
        {sidor > 1 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-full z-[1] whitespace-nowrap rounded-b-md bg-koppar-mjuk px-2 py-0.5 text-[11px] font-semibold text-koppar-ink"
            data-sidan2
          >
            {DOK.sidan2}
          </span>
        ) : null}
      </div>

      {/* Bandet under arket, alltid reserverat (CLS 0): fliken till vänster,
          raden om var hon är högerställd (granskningen B3; på mobil med svep). */}
      {vagg ? null : <div className={`flex min-h-7 items-start justify-end pt-1 ${sidor > 1 ? 'pl-[136px]' : ''}`} data-band>
        {interaktiv && mall && ordning && index >= 0 ? (
          <p className="min-w-0 truncate text-[13px] text-ink-3">
            <span className="min-[900px]:hidden">{DOK.radMobil(mall.namn, index + 1, ordning.length)}</span>
            <span className="hidden min-[900px]:inline">{DOK.radDator(mall.namn, index + 1, ordning.length)}</span>
          </p>
        ) : visaHjalprad ? (
          <p className="min-w-0 truncate text-meta text-ink-3">{DOK.klickaHelskarm}</p>
        ) : null}
      </div>}

      {/* "+ Fler avsnitt" när arket är fullt: under arket i stället. */}
      {fler && interaktiv && matning && !(sidor === 1 && matning.botten !== undefined && px(matning.botten) + 64 < forstaSidan) ? (
        <button
          type="button"
          disabled={last}
          onClick={fler.onClick}
          data-fler
          className="mt-1 flex min-h-11 w-full items-center justify-center rounded-xl border-[1.5px] border-dashed border-kant-stark text-sm font-semibold text-ink-2 hover:border-ink-1"
        >
          {fler.text}
        </button>
      ) : null}

      {helskarm ? (
        <Helskarm
          html={srcdoc}
          src={srcdoc ? undefined : src ?? undefined}
          titel={titel}
          rubrik={mall && ordning && index >= 0 ? DOK.mallAv(mall.namn, index + 1, ordning.length) : titel}
          rubrikTillagg={mall && ordning && index >= 0 ? REMSA.niva[mall.niva] : undefined}
          hojd={matning?.hojd}
          kalla={kalla}
          remsa={helskarmRemsa}
          onByt={
            kanSvepa
              ? (riktning) => {
                  const ny = granne(riktning)
                  if (ny) onSvep?.(ny.id)
                }
              : undefined
          }
          grannar={grannKallor}
          onClose={() => setHelskarm(false)}
        />
      ) : null}
    </div>
  )
}
