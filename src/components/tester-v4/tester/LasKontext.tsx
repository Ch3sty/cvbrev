'use client'

/**
 * Låsen i Tester v4: ett tryck på ett låst val öppnar betalväggen
 * (GraValSheet) med featuren och platsen ur lasning.ts. Arket öppnas bara
 * från ett låschip, en låst rad eller den låsta Träna-knappen, aldrig från en
 * kopparknapp (designsystemet avsnitt 6).
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import GraValSheet from '@/components/paywall/GraValSheet'
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import type { Handling, Paketinfo } from '@/lib/tester/v4/typer'
import { lasFor, type Las } from './lasning'

const Kontext = createContext<(h: Pick<Handling, 'slag' | 'las' | 'zon'>) => void>(() => {})

export const useOppnaLas = () => useContext(Kontext)

const SCOPES: readonly string[] = ['cv', 'tester', 'allt']
const PLANER: readonly string[] = ['cv_week', 'test_week', 'all_day', 'all_week', 'all_month', 'all_quarter']
const somScope = (v: string | null): Scope | null => (v && SCOPES.includes(v) ? (v as Scope) : null)
const somPlan = (v: string | null): PlanKey | null => (v && PLANER.includes(v) ? (v as PlanKey) : null)

export function LasProvider({ paket, children }: { paket: Paketinfo; children: ReactNode }) {
  const [las, setLas] = useState<Las | null>(null)
  const oppna = useCallback((h: Pick<Handling, 'slag' | 'las' | 'zon'>) => setLas(lasFor(h)), [])
  return (
    <Kontext.Provider value={oppna}>
      {children}
      {las ? (
        <GraValSheet
          open
          onClose={() => setLas(null)}
          feature={las.feature}
          variant="testniva"
          plats={las.plats}
          scope={somScope(paket.scope)}
          track={somScope(paket.track)}
          planKey={somPlan(paket.planKey)}
          surface="/dashboard/tester/alla"
        />
      ) : null}
    </Kontext.Provider>
  )
}
