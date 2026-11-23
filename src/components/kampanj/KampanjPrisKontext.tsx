'use client'

/**
 * Kampanjpriset i inloggat (K1 och K4, beslut 2026-11-15). Dashboard-layouten
 * läser pågående kampanj och kontots behörighet på servern
 * (kampanjForVisning) och lägger den här, så att betalväggarna i rummen visar
 * samma pris som köpsteget ett klick senare. Ett konto som haft Premium får
 * null och ser alltid ordinarie pris. Utanför dashboard-skalet finns ingen
 * provider, och då gäller också ordinarie pris.
 */

import { createContext, useContext, type ReactNode } from 'react'
import { premiumKnapp, premiumPrisrad, type KampanjVisning } from '@/lib/kampanj/kampanj'
import { KampanjLiten } from './KampanjMarke'

const KampanjPrisKontext = createContext<KampanjVisning | null>(null)

export function KampanjPrisProvider({ kampanj, children }: { kampanj: KampanjVisning | null; children: ReactNode }) {
  return <KampanjPrisKontext.Provider value={kampanj}>{children}</KampanjPrisKontext.Provider>
}

/** Kampanjen kontot kan få just nu, annars null. */
export function useKampanjPris(): KampanjVisning | null {
  return useContext(KampanjPrisKontext)
}

/**
 * Prisraden i testrummets betalväggar, med kampanjpriset när kontot kan få
 * det. Under en kampanj står kampanjmärket (plattan och nedräkningen) på egen
 * rad före texten (spec-kampanjmarke 6.3). Väggarna är papper, därav paPapper.
 */
export function PremiumPrisradText() {
  const k = useKampanjPris()
  return (
    <>
      {k ? (
        <>
          <KampanjLiten k={k} paPapper enheter={2} />
          <br />
        </>
      ) : null}
      {premiumPrisrad(k)}
    </>
  )
}

/** Köpknappens text, med kampanjpriset när kontot kan få det. */
export function PremiumKnappText() {
  return <>{premiumKnapp(useKampanjPris())}</>
}
