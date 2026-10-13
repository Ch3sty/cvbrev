'use client'

/**
 * Produktfilmen om rekryteringstesterna (video/src/v3/Sajt.tsx, 19,5 s).
 *
 * Ljudlös som grund. Filen hämtas först när filmen är till hälften i bild
 * (preload none, ingen källa i HTML), spelar då tyst i loop och pausas när
 * den lämnar bilden. 16:9 på dator, 9:16 under 640 px. Affischbilden ligger
 * i en <picture> under videon så att ytan är reserverad (CLS 0) och aldrig
 * blir LCP. Ljudet är en egen fil som hämtas först när besökaren trycker på
 * Slå på ljud och följer videons tid. Med reducerad rörelse spelar inget
 * förrän besökaren trycker på Spela.
 *
 * start='klick' (artiklarna): inget spelar och ingen fil hämtas förrän
 * besökaren trycker på Spela filmen, så att filmen inte konkurrerar med
 * artikelns text och knappar.
 *
 * Mäts med videoMatare (src/lib/analytics/publikt.ts).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { videoMatare } from '@/lib/analytics/publikt'

const SMAL = '(max-width: 640px)'
const FILER = {
  '169': { video: '/videos/tester-v3-169.mp4', affisch: '/videos/tester-v3-169-affisch.webp' },
  '916': { video: '/videos/tester-v3-916.mp4', affisch: '/videos/tester-v3-916-affisch.webp' },
} as const
const LJUD = '/videos/tester-v3-ljud.m4a'
// Avslutet börjar 15,6 s in, knappen i bild från 16,9 s.
const KNAPP_FRAN = 16.9

export default function Produktfilm({
  page,
  position,
  knappHref,
  start = 'synlig',
}: {
  page: string
  position: string
  knappHref: string
  start?: 'synlig' | 'klick'
}) {
  const ram = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const ljud = useRef<HTMLAudioElement | null>(null)
  const [variant, setVariant] = useState<'169' | '916'>('169')
  const [laddad, setLaddad] = useState(false)
  const [spelar, setSpelar] = useState(false)
  const [ljudPa, setLjudPa] = useState(false)
  const [visaKnapp, setVisaKnapp] = useState(false)
  const [lugn, setLugn] = useState(false)

  useEffect(() => {
    try {
      setVariant(window.matchMedia(SMAL).matches ? '916' : '169')
      setLugn(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } catch {
      // standardläget räcker
    }
  }, [])

  const matare = useMemo(() => videoMatare({ page, position, variant }), [page, position, variant])

  // Starta när filmen är till hälften i bild, pausa när den lämnar bilden.
  useEffect(() => {
    const el = ram.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([post]) => {
        const v = video.current
        if (post.isIntersecting && post.intersectionRatio >= 0.5) {
          matare.visad()
          if (lugn || start === 'klick') return
          setLaddad(true)
          if (v) v.play().catch(() => setSpelar(false))
        } else if (v && !v.paused) {
          v.pause()
          ljud.current?.pause()
        }
      },
      { threshold: [0, 0.5] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [matare, lugn, start])

  // När källan har satts startar vi uppspelningen.
  useEffect(() => {
    const v = video.current
    // laddad blir sann antingen när filmen syns (start synlig, utan reducerad
    // rörelse) eller när besökaren trycker Spela, så då ska den spela.
    if (laddad && v) v.play().catch(() => setSpelar(false))
  }, [laddad, variant])

  const spela = () => {
    setLaddad(true)
    requestAnimationFrame(() => video.current?.play().catch(() => undefined))
  }

  const vaxlaLjud = () => {
    const v = video.current
    if (!v) return
    if (!ljudPa) {
      if (!ljud.current) {
        ljud.current = new Audio(LJUD)
        ljud.current.loop = true
      }
      ljud.current.currentTime = v.currentTime
      ljud.current.play().catch(() => undefined)
      if (v.paused) spela()
      setLjudPa(true)
      matare.ljudPa()
    } else {
      ljud.current?.pause()
      setLjudPa(false)
    }
  }

  const tid = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget
    matare.tid(v.currentTime, v.duration)
    setVisaKnapp(v.currentTime >= KNAPP_FRAN)
    // Ljudet följer videon; rätta om de glider isär (till exempel vid loopen).
    const a = ljud.current
    if (a && ljudPa && Math.abs(a.currentTime - v.currentTime) > 0.2) a.currentTime = v.currentTime
  }

  const filer = FILER[variant]
  return (
    <div ref={ram} className="pub-film" data-variant={variant}>
      <picture>
        <source media={SMAL} srcSet={FILER['916'].affisch} />
        <img className="pub-film-affisch" src={FILER['169'].affisch} alt="" width={1280} height={720} loading="lazy" decoding="async" />
      </picture>
      <video
        ref={video}
        className="pub-film-video"
        src={laddad ? filer.video : undefined}
        muted
        playsInline
        loop
        preload="none"
        aria-label="Film, 20 sekunder: så ser logiktest, verbalt och numeriskt test ut, resultatet med din nivå, regeln bakom varje fråga och nivåkurvan fram till provdagen."
        onPlay={() => {
          setSpelar(true)
          matare.startad()
          if (ljudPa) ljud.current?.play().catch(() => undefined)
        }}
        onPause={() => setSpelar(false)}
        onTimeUpdate={tid}
      />
      {!spelar && (lugn || laddad || start === 'klick') && (
        <button type="button" className="pub-film-spela" onClick={spela}>
          Spela filmen
        </button>
      )}
      <button type="button" className="pub-film-ljud" onClick={vaxlaLjud} aria-pressed={ljudPa}>
        {ljudPa ? 'Stäng av ljud' : 'Slå på ljud'}
      </button>
      {visaKnapp && (
        <Link className="pub-film-knapp" href={knappHref} onClick={() => matare.ctaKlick()}>
          Starta gratis test
        </Link>
      )}
    </div>
  )
}
