'use client'

/**
 * Hennes eget CV i en mall, förminskat (CV-rummet, byggspecen avsnitt 6
 * punkt 1): samma HTML som arket på Mallar, i en iframe som skalar sig själv
 * till rutans bredd. Tills hennes version är hämtad står katalogbilden, så
 * rutan är aldrig tom. A4-ytan är reserverad (CLS 0).
 *
 * Hämtningen begärs när rutan kommer nära bild (eller direkt med `direkt`,
 * för väggens ark) och går genom egnaMallar.ts: en fråga per rad, delat
 * minne med arket.
 *
 * Används av Ditt CV (väggens ark, mallens ruta, Samma CV, annan mall) och
 * är tänkt för Mallar-galleriet i steg 2.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { medSkala } from './matning'
import { useEgenMall, type EgetCv } from './egnaMallar'

export interface EgenMiniatyrProps {
  mall: MallKort
  /** Hennes CV. Null ritar bara katalogbilden (exempel-CV:t). */
  cv: EgetCv | null
  /** Hämta direkt i stället för när rutan kommer i bild. */
  direkt?: boolean
  /** Katalogbildens storlek. */
  bild?: 'liten' | 'stor'
  /** Text för skärmläsare; utelämnad är rutan dekor. */
  alt?: string
  /**
   * Katalogbildens förtur. 'hog' för bilden som blir sidans största element
   * (Ditt CV:s ark på väggen, LCP), 'lag' för arken bakom den, så att de inte
   * tävlar med den om bandbredden. Utelämnad gör webbläsaren som vanligt.
   */
  fortur?: 'hog' | 'lag'
  className?: string
  style?: CSSProperties
}

export default function EgenMiniatyr({ mall, cv, direkt = false, bild = 'stor', alt, fortur, className, style }: EgenMiniatyrProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [synlig, setSynlig] = useState(direkt)

  useEffect(() => {
    if (direkt || synlig || !cv) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSynlig(true)
      return
    }
    const io = new IntersectionObserver(
      (poster) => {
        if (poster.some((p) => p.isIntersecting)) {
          setSynlig(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [direkt, synlig, cv])

  const html = useEgenMall(cv, mall.id, synlig)
  const [laddad, setLaddad] = useState(false)
  useEffect(() => setLaddad(false), [html])

  return (
    <span
      ref={ref}
      className={`cv3-mini ${className ?? ''}`}
      style={style}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      data-egen={html && laddad ? '' : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bild === 'stor' ? mall.bild.stor : mall.bild.liten}
        alt=""
        // Bilden med förtur målas i samma bild som den avkodats, inte en bild senare.
        decoding={fortur === 'hog' ? undefined : 'async'}
        // Förtur gäller bara en bild som laddas direkt; en lat bild med hög förtur vore en motsägelse.
        loading={direkt || fortur === 'hog' ? undefined : 'lazy'}
        fetchPriority={fortur === 'hog' ? 'high' : fortur === 'lag' ? 'low' : undefined}
      />
      {html ? (
        <iframe
          srcDoc={medSkala(html)}
          title=""
          tabIndex={-1}
          scrolling="no"
          aria-hidden="true"
          onLoad={() => setLaddad(true)}
        />
      ) : null}
    </span>
  )
}
