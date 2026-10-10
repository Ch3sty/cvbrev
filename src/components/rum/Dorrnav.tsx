'use client'

/**
 * Dörrnavet (spec-rummen 4.3, beslut 4, konceptets .bnav, ramarna N1 och N2).
 *
 * Fyra dörrar: Tester, CV, Personliga brev, Jobbsöket (DORR_ETIKETT.mobil). Den aktiva
 * dörren står i rummets ton bakom ikonen och etiketten i ink-1 600, så man
 * ser vilket rum man står i innan man läst ett ord. Jobbsöket är aktiv på
 * /dashboard och alla rum-jobb-routes; på kontots sidor är ingen dörr aktiv.
 *
 * 72 px plus safe area, en enda sanning i --bottom-nav-h. På 360 px får
 * "Personliga brev" gå på två rader (text-balance), aldrig förkortas.
 * Ersätter MobileBottomNav: Skapa försvinner som egen plats.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { DORRAR, rumForPath, type Rum } from '@/lib/rum/rum'
import { NAV } from '@/lib/rum/copy'
import { DorrBrev, DorrCv, DorrJobb, DorrTran, type IkonProps24 } from '@/components/illustrations/RumSymboler'
import { markeraRumYta } from './rumMatning'

export const DORR_IKON: Record<Exclude<Rum, 'neutral'>, ComponentType<IkonProps24>> = {
  tran: DorrTran,
  cv: DorrCv,
  brev: DorrBrev,
  jobb: DorrJobb,
}

export default function Dorrnav() {
  const pathname = usePathname() ?? '/dashboard'
  const aktivt = rumForPath(pathname)

  return (
    <nav
      aria-label={NAV.dorrar}
      className="fixed inset-x-0 bottom-0 z-40 grid h-[var(--bottom-nav-h)] grid-cols-4 border-t border-kant bg-papper px-1.5 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden"
    >
      {DORRAR.map((d) => {
        const aktiv = d.rum === aktivt
        const Ikon = DORR_IKON[d.rum]
        return (
          <Link
            key={d.rum}
            href={d.href}
            prefetch
            onClick={() => markeraRumYta('dorr')}
            aria-current={aktiv ? 'page' : undefined}
            className={`flex min-h-12 touch-manipulation flex-col items-center justify-start gap-[3px] rounded-xl px-0.5 text-center text-[11px] leading-[13px] [text-wrap:balance] ${
              aktiv ? 'font-semibold text-ink-1' : 'font-medium text-ink-3'
            }`}
          >
            <span
              className={`inline-flex h-[30px] w-14 shrink-0 items-center justify-center rounded-full ${
                aktiv ? 'bg-ton text-ton-ink' : 'text-ink-3'
              }`}
            >
              <Ikon size={22} />
            </span>
            {d.etikett}
          </Link>
        )
      })}
    </nav>
  )
}
