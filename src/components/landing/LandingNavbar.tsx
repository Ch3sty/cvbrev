'use client'

/**
 * Publika headern, megamenyn och mobilmenyn
 * (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 5, regel 8).
 *
 * Fem val i Inter 15/500, det aktiva i insunken yta, "Skapa konto" som
 * bläckknapp. Megamenyn är en panel med tre namngivna grupper (samma som
 * sidomenyn i inloggat läge), nakna ikoner i 24 ur Ikoner.tsx och en
 * sidokolumn i insunken med IlluScenAllt och paketets värdemening. Inga
 * beskrivningar per rad: gruppens namn är beskrivningen.
 *
 * Mobilmenyn: fyra huvudval i 16/500, tre grupper med 44 px rader utan
 * ikoner, "Skapa konto" i headern. Ingen blur, ingen gradient, ingen
 * framer-motion: öppning och stängning är CSS.
 *
 * Megamenyns länkar står i HTML även när den är stängd (dold med hidden),
 * så att de finns för sökmotorer och för den som navigerar utan JavaScript
 * via footern.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

import Logo from '@/components/Logo'
import { IlluScenAllt } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY, paketMedPris } from '@/lib/plans/plans'
import NavIkon from './NavIkon'
import { GRUPPER, HEADER_EFTER, HEADER_FORE, type NavLank } from './nav-data'
import { ENTRY_STORAGE_KEY } from '@/components/registrering/intent'

/** Registreringens ingång (profil-registrering 2026-09-24): headern, utan att ändra adressen. */
function markeraIngang(entry: 'header' | 'meny') {
  try {
    sessionStorage.setItem(ENTRY_STORAGE_KEY, entry)
  } catch {
    /* privat läge: ingången blir direkt */
  }
}


/** IlluScenAllt är ritad för bläck. På insunken blir papperen vita och etiketten ink-3. */
const SCEN_PA_PAPPER = {
  '--ink-hover': 'var(--panel)',
  '--ink-1-mjuk': 'var(--ink-3)',
} as CSSProperties

const VAL =
  'inline-flex h-10 items-center rounded-lg px-3 text-[15px] font-medium transition-colors duration-[120ms]'
const VAL_AKTIV = 'bg-insunken text-ink-1'
const VAL_VILA = 'text-ink-2 hover:bg-insunken/60 hover:text-ink-1'

export default function LandingNavbar() {
  const pathname = usePathname() ?? '/'
  const [menyOppen, setMenyOppen] = useState(false)
  const [mobilOppen, setMobilOppen] = useState(false)
  const stangTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menyRef = useRef<HTMLDivElement>(null)
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

  // Lås sidan bakom mobilmenyn.
  useEffect(() => {
    if (!mobilOppen) return
    const forr = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = forr
    }
  }, [mobilOppen])

  // Escape och klick utanför stänger megamenyn.
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

  const valLank = (l: NavLank) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={aktiv(l.href) ? 'page' : undefined}
      className={`${VAL} ${aktiv(l.href) ? VAL_AKTIV : VAL_VILA}`}
    >
      {l.label}
    </Link>
  )

  return (
    <header data-site-chrome="header" className="sticky top-0 z-40 border-b border-kant bg-panel">
      <div
        ref={menyRef}
        className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-12"
      >
        <Logo href="/" variant="compact" height={30} />

        {/* Desktop: fem val. */}
        <nav aria-label="Huvudmeny" className="hidden items-center gap-1 lg:flex">
          {HEADER_FORE.map(valLank)}

          <div onMouseEnter={oppna} onMouseLeave={stangSnart}>
            <button
              type="button"
              aria-expanded={menyOppen}
              aria-controls="megameny"
              onClick={() =>
                setMenyOppen((v) => (v && Date.now() - oppnadVid.current < 400 ? true : !v))
              }
              className={`${VAL} gap-1 ${menyOppen || erbjuderAktiv ? VAL_AKTIV : VAL_VILA}`}
            >
              Vad vi erbjuder
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-[120ms] ${menyOppen ? 'rotate-180' : ''}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>

          </div>

          {HEADER_EFTER.map(valLank)}
        </nav>

            <div
              id="megameny"
              onMouseEnter={oppna}
              onMouseLeave={stangSnart}
              className={`absolute right-4 top-full z-50 w-[880px] max-w-[calc(100vw-32px)] pt-2 sm:right-6 lg:right-12 ${
                menyOppen ? 'block animate-thread-drop' : 'hidden'
              }`}
            >
              <div className="overflow-hidden rounded-xl border border-kant bg-panel shadow-svav">
                <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr_220px]">
                  {GRUPPER.map((g) => (
                    <div key={g.rubrik} className="border-r border-kant p-5">
                      <p className="text-steg uppercase text-ink-3">{g.rubrik}</p>
                      <ul className="mt-3 space-y-1">
                        {g.lankar.map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className="-mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 text-[15px] font-medium text-ink-1 transition-colors duration-[120ms] hover:bg-insunken"
                            >
                              {l.ikon ? <NavIkon namn={l.ikon} className="shrink-0 text-ink-2" /> : null}
                              <span>{l.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="bg-insunken p-5">
                    <div className="w-[120px] text-ink-1" style={SCEN_PA_PAPPER}>
                      <IlluScenAllt className="h-auto w-full" />
                    </div>
                    <p className="mt-3 text-varde text-ink-1">{paketMedPris('all_week')}</p>
                    <p className="mt-2 text-sm leading-[22px] text-ink-2">
                      {PLAN_BY_KEY.all_week.beskrivning}. Säg upp med ett klick.
                    </p>
                    <Link
                      href="/priser"
                      className="mt-3 inline-block text-sm font-semibold text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                    >
                      Se alla tre paketen
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-kant px-5 py-3 text-sm">
                  <Link href="/funktioner" className="text-ink-2 hover:text-ink-1">
                    Alla funktioner
                  </Link>
                  <Link href="/for-rekryterare" className="text-ink-2 hover:text-ink-1">
                    För rekryterare
                  </Link>
                </div>
              </div>
            </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg px-3 text-[15px] font-medium text-ink-1 hover:bg-insunken/60 lg:inline-flex"
          >
            Logga in
          </Link>
          <Link
            href="/register"
            data-cta="navbar-signup"
            onClick={() => markeraIngang(mobilOppen ? 'meny' : 'header')}
            className="inline-flex h-10 items-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
          >
            Skapa konto
          </Link>
          <button
            type="button"
            onClick={() => setMobilOppen((v) => !v)}
            aria-expanded={mobilOppen}
            aria-controls="mobilmeny"
            aria-label={mobilOppen ? 'Stäng meny' : 'Öppna meny'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-1 hover:bg-insunken lg:hidden"
          >
            {mobilOppen ? (
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobilmenyn: en panel under headern, inget överlägg. */}
      <nav
        id="mobilmeny"
        aria-label="Meny"
        className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-kant bg-panel px-4 pb-[max(env(safe-area-inset-bottom),24px)] lg:hidden ${
          mobilOppen ? 'block animate-thread-drop' : 'hidden'
        }`}
      >
        <ul className="divide-y divide-kant border-b border-kant">
          {[...HEADER_FORE, ...HEADER_EFTER].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={aktiv(l.href) ? 'page' : undefined}
                onClick={() => setMobilOppen(false)}
                className={`flex min-h-12 items-center text-base font-medium ${
                  aktiv(l.href) ? 'thread-row text-ink-1' : 'text-ink-1'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {GRUPPER.map((g) => (
          <div key={g.rubrik} className="pt-4">
            <p className="text-steg uppercase text-ink-3">{g.rubrik}</p>
            <ul className="mt-1 divide-y divide-kant">
              {g.lankar.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMobilOppen(false)}
                    className="flex min-h-11 items-center text-[15px] text-ink-2"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-6 flex items-center gap-6 border-t border-kant pt-4 text-sm font-medium">
          <Link
            href="/login"
            onClick={() => setMobilOppen(false)}
            className="inline-flex min-h-11 items-center text-ink-1 underline decoration-kant-stark underline-offset-4"
          >
            Logga in
          </Link>
          <Link
            href="/for-rekryterare"
            onClick={() => setMobilOppen(false)}
            className="inline-flex min-h-11 items-center text-ink-2 underline decoration-kant-stark underline-offset-4"
          >
            För rekryterare
          </Link>
        </div>
      </nav>
    </header>
  )
}
