'use client'

/**
 * Profilmeny i toppraden (docs/plan-inloggat-omdesign.md, avsnitt 3).
 *
 * Samlar kontoåtgärderna på ett ställe. Överst menyhuvudet ur
 * spec-onboarding 2026-09-22 (sektion 3): vilket paket man har, när det
 * förnyas och vad det kostar, med Vad ingår?. Menyn är medvetet inte byggd
 * som en säljyta.
 *
 * Dropdown är ett svävande element, så skugga är tillåten här.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { menyHuvud } from '@/lib/onboarding/paket-rader'
import { useKomIgang } from './KomIgangContext'

interface ProfileMenuProps {
  name: string
  email: string
  avatarUrl: string | null
  /** Kort status: "Aktiv", "3 dagar kvar", "Gratis". */
  premiumLabel: string | null
}

export default function ProfileMenu({ name, email, avatarUrl, premiumLabel }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { summary } = useDashboardData()
  const komIgang = useKomIgang()
  const huvud = summary?.paket ? menyHuvud(summary.paket) : null

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

  const initial = (name || email || 'A').charAt(0).toUpperCase()

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Konto och inställningar"
        className="flex h-11 items-center gap-2 rounded-lg pl-1.5 pr-2 transition-colors hover:bg-insunken"
      >
        <Avatar avatarUrl={avatarUrl} initial={initial} />
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink-1 lg:block">
          {name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Konto"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-kant bg-panel shadow-svav motion-safe:animate-thread-drop"
        >
          <div className="border-b border-kant px-4 py-3">
            <p className="truncate text-sm font-medium text-ink-1">{name}</p>
            <p className="truncate text-meta text-ink-3">{email}</p>
          </div>

          {huvud ? (
            <div className="m-2 flex items-center justify-between gap-3 rounded-lg bg-ink-1 px-3 py-2 text-white">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-5">{huvud.rubrik}</span>
                <span className="block truncate text-xs leading-4 text-ink-1-mjuk">{huvud.under}</span>
              </span>
              <Link
                href={huvud.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs font-medium text-white underline decoration-ink-1-kant underline-offset-[3px] hover:decoration-white"
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
            <MenuLink href="/dashboard/profil/prenumeration" onNavigate={() => setOpen(false)}>
              Köp eller byt paket
            </MenuLink>
            <MenuLink href="/dashboard/profil" onNavigate={() => setOpen(false)}>
              Profil
            </MenuLink>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="min-h-[44px] w-full px-4 py-2 text-left text-sm text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
            >
              Logga ut
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
      className="flex min-h-[44px] items-center px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
    >
      {children}
    </Link>
  )
}

function Avatar({ avatarUrl, initial }: { avatarUrl: string | null; initial: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full border border-kant object-cover"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-kant bg-insunken text-xs font-semibold text-ink-2"
    >
      {initial}
    </span>
  )
}
