'use client'

/**
 * MobileBottomNav (docs/plan-inloggat-omdesign.md, avsnitt 3, våg 1 punkt 9).
 *
 * Fyra slots, ingen FAB. Den gamla mitt-FAB:en betydde olika saker på olika
 * sidor och visade ett hänglås för den som ännu inte laddat upp ett CV, alltså
 * en spärr på den mest framträdande ytan i hela det inloggade läget. Skapa är
 * numera en vanlig slot som öppnar ett bottenark, och varje sida behåller sin
 * egen primära handling i innehållet där designsystemet placerar den.
 *
 * Mått: 48 px hög träffyta per slot, 12 px etiketter, safe-area under.
 * Höjden deklareras en gång som --bottom-nav-h i globals.css och allt annat
 * sticky på mobil räknar mot den variabeln.
 *
 * Datakontrakt:
 *   cvCount           styr Skapa-arkets brevrad (utan CV går den till uppladdning)
 *   applicationCount  styr Skapa-arkets radordning
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import CreateSheet from './CreateSheet'
import {
  NavHemIllu,
  NavAnsokningarIllu,
  NavSkapaIllu,
  NavProfilIllu,
} from './illustrations/NavIllustrations'

interface MobileBottomNavProps {
  cvCount: number
  applicationCount: number
}

interface TabItem {
  id: string
  label: string
  href: string
  Illu: (props: { className?: string }) => React.ReactElement
  matchPaths: string[]
}

/** Dygn kvar då Profil-sloten börjar bära prick. */
const DOT_THRESHOLD_DAYS = 2

const TABS: TabItem[] = [
  {
    id: 'hem',
    label: 'Hem',
    href: '/dashboard',
    Illu: NavHemIllu,
    matchPaths: ['/dashboard'],
  },
  {
    id: 'ansokningar',
    label: 'Ansökningar',
    href: '/dashboard/sokta-tjanster',
    Illu: NavAnsokningarIllu,
    matchPaths: ['/dashboard/sokta-tjanster'],
  },
  {
    id: 'profil',
    label: 'Profil',
    href: '/dashboard/profil',
    Illu: NavProfilIllu,
    matchPaths: ['/dashboard/profil'],
  },
]

export default function MobileBottomNav({
  cvCount,
  applicationCount,
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? '/dashboard'
  const { premiumUntil, subscriptionTier, subscriptionStatus } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Pricken är en notis om något som faktiskt händer, inte en permanent
  // säljknapp. Den tänds när premium tar slut inom kort eller när en
  // betalning behöver åtgärdas.
  const paymentNeedsAction = ['past_due', 'unpaid'].includes(
    subscriptionStatus ?? ''
  )
  const daysLeft =
    premiumUntil && subscriptionTier === 'premium'
      ? Math.ceil((premiumUntil.getTime() - Date.now()) / 86400000)
      : null
  const showPremiumDot =
    paymentNeedsAction ||
    (daysLeft !== null && daysLeft >= 0 && daysLeft <= DOT_THRESHOLD_DAYS)

  const isActive = (item: TabItem) => {
    if (item.id === 'hem') return pathname === '/dashboard'
    return item.matchPaths.some((p) => pathname.startsWith(p))
  }

  const [hem, ansokningar, profil] = TABS

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 pt-2 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Huvudnavigation"
      >
        <ul className="flex items-stretch max-w-md mx-auto px-2">
          <NavTab tab={hem} active={isActive(hem)} />
          <NavTab tab={ansokningar} active={isActive(ansokningar)} />

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-lg touch-manipulation transition-colors ${
                sheetOpen ? 'text-orange-600' : 'text-neutral-500'
              }`}
            >
              <NavSkapaIllu className="w-6 h-6" />
              <span className="text-xs font-medium leading-none">Skapa</span>
            </button>
          </li>

          <NavTab tab={profil} active={isActive(profil)} dot={showPremiumDot} />
        </ul>
      </nav>

      <CreateSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        applicationCount={applicationCount}
        cvCount={cvCount}
      />
    </>
  )
}

function NavTab({
  tab,
  active,
  dot,
}: {
  tab: TabItem
  active: boolean
  dot?: boolean
}) {
  const { Illu } = tab
  return (
    <li className="flex-1">
      <Link
        href={tab.href}
        aria-current={active ? 'page' : undefined}
        className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-lg touch-manipulation transition-colors ${
          active ? 'text-orange-600' : 'text-neutral-500'
        }`}
      >
        <span className="relative">
          <Illu className="w-6 h-6" />
          {dot && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white"
            />
          )}
        </span>
        <span className="text-xs font-medium leading-none">{tab.label}</span>
      </Link>
    </li>
  )
}
