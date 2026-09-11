'use client'

/**
 * Profilmeny i headern (docs/plan-inloggat-saljflode.md, punkt 9).
 *
 * Samlar kontoåtgärderna på ett ställe i stället för att sprida dem över
 * header, sidebar och mobilnav. Premium-status står som en rad, men menyn är
 * medvetet INTE byggd som en säljyta: tre parallella ytor för samma
 * erbjudande lär användaren att filtrera bort dem (avvikelse i planen).
 *
 * Dropdown är ett svävande element, så skugga är tillåten här.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client-manager'

interface ProfileMenuProps {
  name: string
  email: string
  avatarUrl: string | null
  /** Kort status: "Aktiv", "3 dagar kvar", "Gratis". */
  premiumLabel: string | null
}

export default function ProfileMenu({
  name,
  email,
  avatarUrl,
  premiumLabel,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

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
        className="flex items-center gap-2 h-11 pl-1 pr-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Avatar avatarUrl={avatarUrl} initial={initial} />
        <span className="hidden lg:block max-w-[140px] truncate text-sm font-medium text-neutral-900">
          {name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Konto"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
            <p className="text-xs text-neutral-500 truncate">{email}</p>
          </div>

          {premiumLabel && (
            <div className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between gap-3">
              <span className="text-sm text-neutral-600">Premium</span>
              <span className="text-sm font-medium text-neutral-900 truncate">
                {premiumLabel}
              </span>
            </div>
          )}

          <nav className="py-1">
            <MenuLink href="/dashboard/profil/prenumeration" onNavigate={() => setOpen(false)}>
              Prenumeration
            </MenuLink>
            <MenuLink href="/dashboard/profil" onNavigate={() => setOpen(false)}>
              Profil
            </MenuLink>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="w-full text-left min-h-[44px] px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
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
      className="flex items-center min-h-[44px] px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
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
        className="w-8 h-8 rounded-full object-cover border border-neutral-200"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700"
    >
      {initial}
    </span>
  )
}
