'use client'

/**
 * Mallvisaren för personliga brev, "Bunten" (byggspecen våg 2 och skissen
 * skiss-mallvisare.html, 2026-11-21). Samma komponent på tre ställen:
 * "Byt mall" på exempelsidorna, mallvisningen i tre artiklar och
 * förhandsvisningen i 19 artiklar.
 *
 * Arket är brevmotorns HTML i en iframe (/api/public/exempel/brev), på
 * brevrummets vägg. Grannmallarna kikar fram bakom arket, fem miniatyrer
 * byter mall, svep på bunten byter till nästa eller föregående och stannar
 * i ändarna. Namn, nivå och miniatyrer kommer färdiga från servern (ur
 * brevets katalog), så klientön är ett index, två pekarhändelser och ett
 * ark som byts. Inga rubriker, inga priser, ingen spärr.
 *
 * Medan en mall laddas: miniatyren, namnraden och de kikande arken byter
 * direkt, det gamla arket ligger kvar nedtonat (två iframes i lager) och
 * en kopparlinje löper i överkanten. Det nya tonas in när det har laddat.
 */
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { capture } from '@/lib/analytics/events'
import { VISARE_TEXT as T } from './texter'
import type { VisarMall } from './visare-data'
import './brevvisare.css'

interface Props {
  mallar: readonly VisarMall[]
  /** Brevets parameter till rutten: "slug=projektledare", "nyckel=saljare" eller tomt (motorns exempelbrev). */
  brev?: string
  /** Yrket i iframens titel, i gemener. */
  yrke?: string
  kontext: 'exempel' | 'artikel'
  handling: { text: string; href: string }
  fot: string
  /** Artiklarna: arket hämtas först när det närmar sig vyn. */
  lazy?: boolean
  /** Exempelsidan: "Visa exemplet igen". */
  onTillbaka?: () => void
  tillbakaRef?: Ref<HTMLButtonElement>
  rotRef?: Ref<HTMLDivElement>
  /** Sist i sockeln: "Läs brevet som text" i förhandsvisningen. */
  children?: ReactNode
}

const PIL_V = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)
const PIL_H = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const sida = () => window.location.pathname

export default function BrevVisare({ mallar, brev = '', yrke, kontext, handling, fot, lazy, onTillbaka, tillbakaRef, rotRef, children }: Props) {
  const [i, setI] = useState(0)
  // Arket som syns nu; skiljer det sig från i laddas i i ett lager ovanpå.
  const [visad, setVisad] = useState(0)
  const [tona, setTona] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const flyttad = useRef(false)

  useEffect(() => {
    capture('mallvisning_visad', { slug: sida(), template: mallar[0].id, typ: 'brev' })
  }, [mallar])

  const byt = (ny: number, hur: 'miniatyr' | 'svep' | 'kant') => {
    if (ny < 0 || ny >= mallar.length || ny === i) return
    setI(ny)
    capture('mallvisning_mall_bytt', { slug: sida(), template: mallar[ny].id, typ: 'brev', hur })
  }

  const src = (k: number) => `/api/public/exempel/brev?mall=${mallar[k].id}${brev ? `&${brev}` : ''}`
  const laddar = i !== visad
  const lager = laddar ? [visad, i] : [i]
  const m = mallar[i]
  const fore = i > 0 ? i - 1 : null
  const efter = i < mallar.length - 1 ? i + 1 : null

  const kik = (k: number | null, sidan: 'v' | 'h') =>
    k === null ? null : (
      <button
        key={sidan}
        type="button"
        className={`mv-kik mv-kik-${sidan}`}
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => {
          if (!flyttad.current) byt(k, 'kant')
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mallar[k].bild} alt="" width={480} height={679} decoding="async" draggable={false} />
      </button>
    )

  return (
    <div className="mv-hall not-prose">
      <div ref={rotRef} className="mv pub-rum-brev" aria-busy={laddar ? 'true' : undefined} data-mv-kontext={kontext}>
        <div className="mv-scen">
          <div className="mv-topp">
            {kontext === 'exempel' ? (
              <button ref={tillbakaRef} type="button" className="mv-tillbaka" onClick={onTillbaka}>
                {PIL_V}
                {T.tillbaka}
              </button>
            ) : (
              <p className="mv-kick">{T.kick}</p>
            )}
          </div>
          <div className="mv-bord">
            <div
              className="mv-bunt"
              onPointerDown={(e) => {
                start.current = { x: e.clientX, y: e.clientY }
                flyttad.current = false
              }}
              onPointerUp={(e) => {
                const s = start.current
                start.current = null
                if (!s) return
                const dx = e.clientX - s.x
                const dy = e.clientY - s.y
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) flyttad.current = true
                // Vänster ger nästa mall, höger föregående; stopp i ändarna.
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) byt(i + (dx < 0 ? 1 : -1), 'svep')
              }}
              onPointerCancel={() => {
                start.current = null
              }}
            >
              {kik(fore, 'v')}
              {kik(efter, 'h')}
              <div className="mv-ark">
                {lager.map((k) => {
                  const ny = laddar && k === i
                  return (
                    <iframe
                      key={mallar[k].id}
                      src={src(k)}
                      title={T.arkTitel(mallar[k].namn, yrke)}
                      loading={lazy && k === 0 && visad === 0 && !laddar ? 'lazy' : undefined}
                      scrolling="no"
                      tabIndex={-1}
                      className={ny ? 'mv-ny' : laddar ? 'mv-gammal' : tona ? 'mv-tona' : undefined}
                      onLoad={
                        ny
                          ? () => {
                              setTona(true)
                              setVisad(k)
                            }
                          : undefined
                      }
                    />
                  )
                })}
                {laddar ? <span className="mv-laddar" aria-hidden="true" /> : null}
              </div>
            </div>
            <div className="mv-rad" role="group" aria-label={T.grupp}>
              {mallar.map((x, k) => (
                <button key={x.id} type="button" className="mv-mini" aria-pressed={k === i} aria-label={T.mall(x.namn)} onClick={() => byt(k, 'miniatyr')}>
                  <span className="mv-mini-bild">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.bild} alt="" width={480} height={679} loading="lazy" decoding="async" />
                  </span>
                  <span className="mv-mini-namn">{x.namn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mv-sockel">
          <p className="mv-namnrad" aria-live="polite">
            <b>{m.namn}.</b> <span>{m.rad}</span>
          </p>
          {kontext === 'exempel' ? (
            <a
              className="pub-knapp"
              href={handling.href}
              data-cta-klick={handling.href}
              onClick={() => capture('mallvisning_klick', { slug: sida(), template: m.id, typ: 'brev' })}
            >
              {handling.text}
            </a>
          ) : (
            <a
              className="mv-lank"
              href={handling.href}
              data-cta-klick={handling.href}
              onClick={() => capture('mallvisning_klick', { slug: sida(), template: m.id, typ: 'brev' })}
            >
              {handling.text}
              {PIL_H}
            </a>
          )}
          <p className="mv-fot">{fot}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
