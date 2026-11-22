'use client'

/**
 * Publika menyn, "Vad vi erbjuder" och telefonmenyn i publikt omgång 3
 * (skissen docs/design/publikt-omgang3/sidor/meny.html, byggbriefens beslut 1).
 *
 * Menyn står i sidans mörkaste ton (--vagg-3) och tar sidans färg: sidan
 * sätter den med <Sida farg>, annars gissar menyn ur adressen
 * (data-p3-sokvag, fargForSokvag). Skapa konto är den enda kopparknappen.
 *
 * Dator: logga, fem val, Logga in, Skapa konto. "Vad vi erbjuder" öppnar
 * de fyra delarna i sina färger över en nedtonad sida.
 * Telefon: menyn öppnas över hela skärmen med en egen topprad (Stäng i
 * stället för Skapa konto, så att skärmen bara har en kopparknapp) och
 * Skapa konto gratis och Logga in fast i nederkanten.
 *
 * Innehållet i båda menyerna ritas på servern (LandingNavbarMega.tsx) och
 * kommer hit som props, så att alla länkar står i HTML:en även när menyn är
 * stängd (dold med hidden). Ingen framer-motion: öppning och stängning är
 * ett attribut.
 */

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ENTRY_STORAGE_KEY } from '@/components/registrering/intent'
import { PROVA_PATH } from '@/lib/flodessidor'
import { fargForSokvag } from '@/components/publikt/v3/farg'
import { Ikon } from '@/components/publikt/v3/Ikon'
import { HEADER_EFTER, HEADER_FORE, type NavLank } from './nav-data'
import '@/components/publikt/v3/v3.css'
import '@/components/publikt/v3/ram.css'

/** Registreringens ingång (profil-registrering 2026-09-24): headern, utan att ändra adressen. */
function markeraIngang(entry: 'header' | 'meny') {
  try {
    sessionStorage.setItem(ENTRY_STORAGE_KEY, entry)
  } catch {
    /* privat läge: ingången blir direkt */
  }
}

function Logga() {
  return (
    <Link className="p3-logga" href="/" aria-label="Jobbcoach.ai, till startsidan">
      <i aria-hidden="true">J</i>
      <b>
        Jobbcoach<span>.ai</span>
      </b>
    </Link>
  )
}

export default function LandingNavbar({ mega, mobil }: { mega?: ReactNode; mobil?: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [menyOppen, setMenyOppen] = useState(false)
  const [mobilOppen, setMobilOppen] = useState(false)
  const stangTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menyRef = useRef<HTMLDivElement>(null)
  const menyKnapp = useRef<HTMLButtonElement>(null)
  const stangKnapp = useRef<HTMLButtonElement>(null)
  // Musen öppnar menyn innan klicket kommer. Ett klick strax efter en
  // hovring ska inte stänga den igen.
  const oppnadVid = useRef(0)

  const aktiv = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname]
  )
  const erbjuderAktiv = pathname.startsWith('/verktyg') || pathname.startsWith('/rakna-ut')

  // Stäng allt vid sidbyte.
  useEffect(() => {
    setMenyOppen(false)
    setMobilOppen(false)
  }, [pathname])

  // Telefonmenyn: lås sidan bakom, flytta fokus till Stäng, Escape stänger.
  useEffect(() => {
    if (!mobilOppen) return
    const forr = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    stangKnapp.current?.focus()
    const tangent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobilOppen(false)
    }
    document.addEventListener('keydown', tangent)
    const knapp = menyKnapp.current
    return () => {
      document.body.style.overflow = forr
      document.removeEventListener('keydown', tangent)
      knapp?.focus()
    }
  }, [mobilOppen])

  // Escape och klick utanför stänger menyn på datorn.
  useEffect(() => {
    if (!menyOppen) return
    const tangent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenyOppen(false)
    }
    const klick = (e: MouseEvent) => {
      if (menyRef.current && !menyRef.current.contains(e.target as Node)) setMenyOppen(false)
    }
    document.addEventListener('keydown', tangent)
    document.addEventListener('mousedown', klick)
    return () => {
      document.removeEventListener('keydown', tangent)
      document.removeEventListener('mousedown', klick)
    }
  }, [menyOppen])

  const oppna = () => {
    if (stangTimer.current) clearTimeout(stangTimer.current)
    setMenyOppen((v) => {
      if (!v) oppnadVid.current = Date.now()
      return true
    })
  }
  const stangSnart = () => {
    if (stangTimer.current) clearTimeout(stangTimer.current)
    stangTimer.current = setTimeout(() => setMenyOppen(false), 120)
  }

  /** En länk i en öppen meny stänger den, också när den leder till sidan man står på. */
  const stangVidLank = (e: ReactMouseEvent<HTMLElement>, stang: () => void) => {
    if ((e.target as HTMLElement).closest('a')) stang()
  }

  const valLank = (l: NavLank) => (
    <Link key={l.href} href={l.href} aria-current={aktiv(l.href) ? 'page' : undefined}>
      {l.label}
    </Link>
  )

  // Provet ligger i flödesskalet med egen topprad (skissen 2026-11-09).
  if (pathname === PROVA_PATH) return null

  return (
    <header data-site-chrome="header" className="p3-nav" data-p3-sokvag={fargForSokvag(pathname)}>
      <div ref={menyRef} className="p3-nav-bredd p3-nav-rad">
        <Logga />

        {/* Dator: fem val. */}
        <nav aria-label="Huvudmeny" className="p3-nav-val">
          {HEADER_FORE.map(valLank)}
          <button
            type="button"
            onMouseEnter={oppna}
            onMouseLeave={stangSnart}
            aria-expanded={menyOppen}
            aria-controls="megameny"
            className={erbjuderAktiv && !menyOppen ? 'p3-aktiv' : undefined}
            onClick={() => setMenyOppen((v) => (v && Date.now() - oppnadVid.current < 400 ? true : !v))}
          >
            Vad vi erbjuder
            <Ikon namn="ner" />
          </button>
          {HEADER_EFTER.map(valLank)}
        </nav>

        <Link className="p3-nav-in" href="/login">
          Logga in
        </Link>
        <Link
          href="/register"
          data-cta="navbar-signup"
          onClick={() => markeraIngang('header')}
          className="p3-knapp p3-knapp-liten"
        >
          Skapa konto
        </Link>
        <button
          ref={menyKnapp}
          type="button"
          className="p3-nav-meny"
          onClick={() => setMobilOppen(true)}
          aria-expanded={mobilOppen}
          aria-controls="mobilmeny"
          aria-label="Öppna menyn"
        >
          <Ikon namn="meny" />
        </button>

        <div
          id="megameny"
          className="p3-mega-plats"
          hidden={!menyOppen}
          onMouseEnter={oppna}
          onMouseLeave={stangSnart}
          onClick={(e) => stangVidLank(e, () => setMenyOppen(false))}
        >
          {mega}
        </div>
      </div>

      {menyOppen ? <div className="p3-skym" aria-hidden="true" onClick={() => setMenyOppen(false)} /> : null}

      {/* Telefonen: hela skärmen, egen topprad, handlingarna fast i nederkanten. */}
      <nav
        id="mobilmeny"
        aria-label="Meny"
        className="p3-tm"
        hidden={!mobilOppen}
        onClick={(e) => stangVidLank(e, () => setMobilOppen(false))}
      >
        <div className="p3-tm-topp">
          <Logga />
          <button ref={stangKnapp} type="button" className="p3-tm-stang" onClick={() => setMobilOppen(false)} aria-label="Stäng menyn">
            <Ikon namn="x" />
            Stäng
          </button>
        </div>
        <div className="p3-tm-kropp">{mobil}</div>
        <div className="p3-tm-fot">
          <Link href="/register" className="p3-knapp" data-cta="navbar-signup" onClick={() => markeraIngang('meny')}>
            Skapa konto gratis
          </Link>
          <Link href="/login" className="p3-knapp p3-knapp-vit">
            Logga in
          </Link>
        </div>
      </nav>
    </header>
  )
}
