'use client'

/**
 * Profilen i toppraden (spec-rummen 4.2, beslut 4: "Profilen som avatar i
 * toppraden").
 *
 * 34 px avatar med initialer, på väggen i bg-vagg-kant och text-vagg-ink,
 * på golvet i papper med kant. Menyn (288 px, skiss-installningar-2026-10-12)
 * samlar kontot: namn och e-post, Utseende som tre symboler, paketet och när
 * det förnyas, Kom igång, Profil, Prenumeration, Inställningar och Logga ut.
 * Menyn är ett svävande element, så skugga är tillåten här.
 *
 * Utseendet slår igenom direkt och menyn står kvar öppen, så att man ser
 * skillnaden och kan byta tillbaka. Den stängs först vid val av en rad.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { menyHuvud } from '@/lib/onboarding/paket-rader'
import { TOPPRAD, UNDERSIDA, UTSEENDE } from '@/lib/rum/copy'
import { useTema } from '@/hooks/useTema'
import { TEMAN, type Tema } from '@/lib/tema'
import { IkonEnhet, IkonMane, IkonSol } from '@/components/illustrations/RumSymboler'
import { KONTO_SEKTION } from '@/app/dashboard/profil/profil-copy'
import { useKomIgang } from './KomIgangContext'

const TEMA_IKON: Record<Tema, typeof IkonSol> = {
  system: IkonEnhet,
  ljust: IkonSol,
  morkt: IkonMane,
}

interface ProfileMenuProps {
  name: string
  email: string
  avatarUrl: string | null
  /** Kort status: "Aktiv", "3 dagar kvar", "Gratis". Används när paketet saknas i summeringen. */
  premiumLabel?: string | null
  /** Väggen (standard) eller golvet. */
  pa?: 'vagg' | 'golv'
}

/** Två initialer ur namnet, annars första tecknet i e-posten. */
export function initialer(name: string, email: string): string {
  const delar = (name || '').trim().split(/\s+/).filter(Boolean)
  if (delar.length >= 2) return (delar[0][0] + delar[delar.length - 1][0]).toUpperCase()
  if (delar.length === 1) return delar[0].slice(0, 2).toUpperCase()
  return (email || 'A').charAt(0).toUpperCase()
}

export default function ProfileMenu({ name, email, avatarUrl, premiumLabel = null, pa = 'vagg' }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { summary } = useDashboardData()
  const komIgang = useKomIgang()
  const huvud = summary?.paket ? menyHuvud(summary.paket) : null
  const { tema, valj } = useTema('meny')
  const temaRef = useRef<HTMLButtonElement | null>(null)

  // Segmentet är menyns första interaktiva element: fokus landar på valet.
  useEffect(() => {
    if (open) temaRef.current?.focus({ preventScroll: true })
  }, [open])

  // Stäng vid klick utanför och vid Escape.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const logout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={TOPPRAD.kontoKnapp}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px]"
      >
        <Avatar avatarUrl={avatarUrl} initialer={initialer(name, email)} pa={pa} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Konto"
          className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-kant bg-papper text-ink-1 shadow-svav [--fokus:var(--koppar-ink)] motion-safe:animate-thread-drop"
        >
          <div className="border-b border-kant px-4 py-3">
            <p className="truncate text-sm font-medium text-ink-1">{name}</p>
            <p className="truncate text-meta text-ink-3">{email}</p>
          </div>

          <div className="border-b border-kant px-4 py-3">
            <div role="radiogroup" aria-label={UTSEENDE.rubrik} className="flex gap-2">
              {TEMAN.map((t) => {
                const pa = t === tema
                const Ikon = TEMA_IKON[t]
                return (
                  <button
                    key={t}
                    ref={pa ? temaRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={pa}
                    aria-label={UTSEENDE.val[t]}
                    onClick={() => valj(t)}
                    className={`inline-flex h-11 flex-1 items-center justify-center rounded-lg border bg-papper transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-papper-2 ${
                      pa ? 'border-ink-1 text-ink-1 shadow-val' : 'border-kant text-ink-2'
                    }`}
                  >
                    <Ikon size={22} />
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-meta text-ink-3">
              {UTSEENDE.rad} <span className="font-medium text-ink-1">{UTSEENDE.val[tema]}</span>
            </p>
          </div>

          {huvud ? (
            <div className="flex items-start justify-between gap-3 border-b border-kant px-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5 break-words text-ink-1">{huvud.rubrik}</span>
                <span className="mt-0.5 block text-xs leading-4 text-ink-3">{huvud.under}</span>
              </span>
              <Link
                href={huvud.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs font-medium text-ink-1 underline decoration-kant-stark underline-offset-[3px]"
              >
                {huvud.lank}
              </Link>
            </div>
          ) : premiumLabel ? (
            <div className="flex items-center justify-between gap-3 border-b border-kant px-4 py-2">
              <span className="text-sm text-ink-2">Paket</span>
              <span className="truncate text-sm font-medium text-ink-1">{premiumLabel}</span>
            </div>
          ) : null}

          <nav className="py-1">
            {komIgang.visaRad && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  komIgang.oppna('profilmeny')
                }}
                className="min-h-[44px] w-full px-4 py-2 text-left text-sm text-ink-2 transition-colors hover:bg-papper-2 hover:text-ink-1"
              >
                Kom igång
              </button>
            )}
            {/* Samma tre ord och ordning som sidomenyns Konto
                (profil-registrering 2026-09-24, kriterium 3). */}
            <MenuLink href="/dashboard/profil" onNavigate={() => setOpen(false)}>
              {UNDERSIDA.profil}
            </MenuLink>
            <MenuLink href="/dashboard/profil/prenumeration" onNavigate={() => setOpen(false)}>
              {UNDERSIDA.prenumeration}
            </MenuLink>
            <MenuLink href="/dashboard/installningar" onNavigate={() => setOpen(false)}>
              {UNDERSIDA.installningar}
            </MenuLink>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="min-h-[44px] w-full px-4 py-2 text-left text-sm text-ink-2 transition-colors hover:bg-papper-2 hover:text-ink-1"
            >
              {KONTO_SEKTION.loggaUt}
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  href,
  onNavigate,
  children,
}: {
  href: string
  onNavigate: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex min-h-[44px] items-center px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-papper-2 hover:text-ink-1"
    >
      {children}
    </Link>
  )
}

/** Avataren, 34 px (konceptets .avatar). */
export function Avatar({
  avatarUrl,
  initialer,
  pa = 'vagg',
  storlek = 34,
}: {
  avatarUrl: string | null
  initialer: string
  /** Väggen, golvet (papper) eller sidomenyn (papper-2), som i konceptet. */
  pa?: 'vagg' | 'golv' | 'meny'
  storlek?: 28 | 34
}) {
  const matt = storlek === 28 ? 'h-7 w-7 text-[11px]' : 'h-[34px] w-[34px] text-xs'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${matt} rounded-full border object-cover ${pa === 'vagg' ? 'border-vagg-kant' : 'border-kant-stark'}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${matt} items-center justify-center rounded-full border font-semibold ${
        pa === 'vagg'
          ? 'border-vagg-kant bg-vagg-kant text-vagg-ink'
          : pa === 'meny'
            ? 'border-kant-stark bg-papper-2 text-ink-2'
            : 'border-kant-stark bg-papper text-ink-2'
      }`}
    >
      {initialer}
    </span>
  )
}
