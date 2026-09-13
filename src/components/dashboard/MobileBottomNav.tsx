'use client'

/**
 * MobileBottomNav (docs/designsystem.md, "Informationsarkitektur").
 *
 * Fyra slots, ingen FAB: Hem, Ansökningar, Skapa, Profil. 48 px hög
 * träffyta per slot, 12 px etiketter, safe-area under. Aktiv flik i ink-1
 * med stroke 2,25, inaktiv i ink-3. Prick vid Profil i ink-1 (inte orange)
 * vid mindre än två dagar kvar eller betalningsfel. Skapa öppnar ett
 * bottenark med tre rader på 56 px.
 *
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
import dynamic from 'next/dynamic'
import {
  IkonHem,
  IkonAnsokningar,
  IkonSkapa,
  IkonProfil,
  type IkonProps,
} from '@/components/illustrations/Ikoner'

// Arket öppnas först vid tryck på Skapa. Laddas inte med skalet.
const CreateSheet = dynamic(() => import('./CreateSheet'), { ssr: false })

interface MobileBottomNavProps {
  cvCount: number
  applicationCount: number
}

interface TabItem {
  id: string
  label: string
  href: string
  Ikon: (props: IkonProps) => React.ReactElement
  matchPaths: string[]
}

/** Dygn kvar då Profil-sloten börjar bära prick. */
const DOT_THRESHOLD_DAYS = 2

const TABS: TabItem[] = [
  { id: 'hem', label: 'Hem', href: '/dashboard', Ikon: IkonHem, matchPaths: ['/dashboard'] },
  {
    id: 'ansokningar',
    label: 'Ansökningar',
    href: '/dashboard/sokta-tjanster',
    Ikon: IkonAnsokningar,
    matchPaths: ['/dashboard/sokta-tjanster'],
  },
  {
    id: 'profil',
    label: 'Profil',
    href: '/dashboard/profil',
    Ikon: IkonProfil,
    matchPaths: ['/dashboard/profil'],
  },
]

const SLOT =
  'flex min-h-[48px] w-full flex-col items-center justify-center gap-0.5 rounded-lg touch-manipulation transition-colors'

export default function MobileBottomNav({ cvCount, applicationCount }: MobileBottomNavProps) {
  const pathname = usePathname() ?? '/dashboard'
  const { premiumUntil, subscriptionTier, subscriptionStatus } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)
  // Arket laddas först vid första öppningen och avmonteras inte igen, så att
  // nästa öppning går direkt.
  const [sheetMounted, setSheetMounted] = useState(false)

  const openSheet = () => {
    setSheetMounted(true)
    setSheetOpen(true)
  }

  // Pricken är en notis om något som faktiskt händer, inte en permanent
  // säljknapp: premium tar slut inom kort eller en betalning behöver åtgärdas.
  const paymentNeedsAction = ['past_due', 'unpaid'].includes(subscriptionStatus ?? '')
  const daysLeft =
    premiumUntil && subscriptionTier === 'premium'
      ? Math.ceil((premiumUntil.getTime() - Date.now()) / 86400000)
      : null
  const showPremiumDot =
    paymentNeedsAction || (daysLeft !== null && daysLeft >= 0 && daysLeft <= DOT_THRESHOLD_DAYS)

  const isActive = (item: TabItem) => {
    if (item.id === 'hem') return pathname === '/dashboard'
    return item.matchPaths.some((p) => pathname.startsWith(p))
  }

  const [hem, ansokningar, profil] = TABS

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-kant bg-panel pt-1 pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
        aria-label="Huvudnavigation"
      >
        <ul className="mx-auto flex max-w-md items-stretch px-2">
          <NavTab tab={hem} active={isActive(hem)} />
          <NavTab tab={ansokningar} active={isActive(ansokningar)} />

          <li className="flex-1">
            <button
              type="button"
              onClick={openSheet}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className={`${SLOT} ${sheetOpen ? 'text-ink-1' : 'text-ink-3'}`}
            >
              <IkonSkapa size={24} strokeWidth={sheetOpen ? 2.25 : 1.75} />
              <span className="text-xs font-medium leading-4">Skapa</span>
            </button>
          </li>

          <NavTab tab={profil} active={isActive(profil)} dot={showPremiumDot} />
        </ul>
      </nav>

      {sheetMounted ? (
        <CreateSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          applicationCount={applicationCount}
          cvCount={cvCount}
        />
      ) : null}
    </>
  )
}

function NavTab({ tab, active, dot }: { tab: TabItem; active: boolean; dot?: boolean }) {
  const { Ikon } = tab
  return (
    <li className="flex-1">
      <Link
        href={tab.href}
        // Explicit prefetch: navmålen ska kännas omedelbara.
        prefetch
        aria-current={active ? 'page' : undefined}
        className={`${SLOT} ${active ? 'text-ink-1' : 'text-ink-3'}`}
      >
        <span className="relative">
          <Ikon size={24} strokeWidth={active ? 2.25 : 1.75} />
          {dot ? (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-ink-1 ring-2 ring-panel"
            />
          ) : null}
        </span>
        <span className="text-xs font-medium leading-4">{tab.label}</span>
      </Link>
    </li>
  )
}
