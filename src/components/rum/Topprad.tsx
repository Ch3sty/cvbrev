'use client'

/**
 * Toppraden inne på väggen (spec-rummen 4.2, konceptets .topbar).
 *
 * 60 px (72 på dator). Rummets namn till vänster i display 15/700, en
 * valfri kontextlänk, och till höger meddelanden och notiser (bara när det
 * finns något oläst) och profilen som avatar. Alla knappar har 44 px
 * träffyta. På golvet (flöden) samma komponent i ink.
 *
 * data-topprad gör att regeln html[data-flow-active] i globals.css döljer
 * raden under ett flöde, som den förr dolde dashboardheadern.
 *
 * Ersätter DashboardHeader. Profilfälten kommer ur den delade summeringen
 * och användaren ur skalets kontext, så raden kostar inget eget anrop.
 */

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { rumForPath } from '@/lib/rum/rum'
import { RUM_NAMN, TOPPRAD } from '@/lib/rum/copy'
import MessagesHeaderButton from '@/components/dashboard/MessagesHeaderButton'
import NotificationBell from '@/components/dashboard/NotificationBell'
import ProfileMenu from '@/components/dashboard/ProfileMenu'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { useRum } from './RumKontext'

export interface ToppradProps {
  /** Rummets namn. Utelämnat läses det ur sökvägen. */
  brand?: string
  /** Textlänk till höger om namnet, till exempel "Matrigma, 24 okt". */
  kontext?: ReactNode
  /** Ersätter namn och kontext i flöden: en stängknapp. */
  stang?: { href?: string; onClick?: () => void; etikett: string }
  /** Väggen (standard) eller golvet. */
  pa?: 'vagg' | 'golv'
}

/** Triggerns gamla platshållare räknas som saknat namn. */
function saknasNamn(value: string | null | undefined): boolean {
  if (!value) return true
  const t = value.trim()
  return t === '' || t.toLowerCase() === 'ej angivet'
}

export default function Topprad({ brand, kontext, stang, pa = 'vagg' }: ToppradProps) {
  const pathname = usePathname() ?? '/dashboard'
  const { user } = useRum()
  const { summary } = useDashboardData()
  const profil = (summary?.profile ?? null) as {
    full_name?: string | null
    profile_photo_url?: string | null
  } | null

  const metaNamn = (user?.user_metadata?.full_name ?? user?.user_metadata?.name) as string | undefined
  const namn = !saknasNamn(profil?.full_name)
    ? (profil?.full_name as string)
    : !saknasNamn(metaNamn)
      ? (metaNamn as string)
      : user?.email
        ? String(user.email).split('@')[0]
        : 'Användare'
  const avatarUrl = profil?.profile_photo_url || (user?.user_metadata?.avatar_url as string | undefined) || null

  const pavagg = pa === 'vagg'
  const namnText = brand ?? RUM_NAMN[rumForPath(pathname)]

  return (
    <div
      data-topprad
      className={`-mx-1 flex h-[60px] items-center gap-2 lg:h-[72px] ${pavagg ? 'text-vagg-ink' : 'text-ink-1'}`}
    >
      {stang ? (
        stang.href ? (
          <a
            href={stang.href}
            aria-label={stang.etikett}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px]"
          >
            <IkonX />
          </a>
        ) : (
          <button
            type="button"
            onClick={stang.onClick}
            aria-label={stang.etikett || TOPPRAD.stang}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px]"
          >
            <IkonX />
          </button>
        )
      ) : (
        <span
          className={`min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-[-.01em] ${
            pavagg ? 'text-vagg-mjuk' : 'text-ink-3'
          }`}
        >
          <b className={`font-display font-bold ${pavagg ? 'text-vagg-ink' : 'text-ink-1'}`}>{namnText}</b>
        </span>
      )}
      {stang ? <span className="flex-1" /> : null}
      {kontext ? <span className="shrink-0">{kontext}</span> : null}
      <div className="flex shrink-0 items-center">
        <MessagesHeaderButton pa={pa} />
        <NotificationBell pa={pa} />
        <ProfileMenu name={namn} email={user?.email ?? ''} avatarUrl={avatarUrl} pa={pa} />
      </div>
    </div>
  )
}
