'use client'

/**
 * Låsen i Tester v4: ett tryck på ett låst val öppnar betalväggen
 * (GraValSheet) med featuren och platsen ur lasning.ts. Arket öppnas bara
 * från ett låschip, en låst rad eller den låsta Träna-knappen, aldrig från en
 * kopparknapp (designsystemet avsnitt 6).
 *
 * Omgång 3 (steg 4): anroparen kan skicka typen, och spärren får hennes
 * siffror ur sidans data (nivån i typen, provet, formatet, dagar kvar) via
 * sparrDataFor. Ingen hämtning; saknas en siffra faller raden bort.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import GraValSheet from '@/components/paywall/GraValSheet'
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import type { Handling, Paketinfo, TestTypId } from '@/lib/tester/v4/typer'
import { sparrDataFor, type SparrUnderlag } from '@/lib/tester/v4/sparrData'
import { lasFor, type Las } from './lasning'

type Oppna = (h: Pick<Handling, 'slag' | 'las' | 'zon'>, typ?: TestTypId | null) => void

const Kontext = createContext<Oppna>(() => {})

export const useOppnaLas = () => useContext(Kontext)

const SCOPES: readonly string[] = ['cv', 'tester', 'allt']
const PLANER: readonly string[] = ['cv_week', 'test_week', 'all_day', 'all_week', 'all_month', 'all_quarter']
const somScope = (v: string | null): Scope | null => (v && SCOPES.includes(v) ? (v as Scope) : null)
const somPlan = (v: string | null): PlanKey | null => (v && PLANER.includes(v) ? (v as PlanKey) : null)

export function LasProvider({
  paket,
  grundKvarIdag = null,
  underlag = null,
  children,
}: {
  paket: Paketinfo
  /** Gratislage.grundKvarIdag: 0 ger väggen "I morgon" i stället för ett nytt grundtest. */
  grundKvarIdag?: number | null
  /** Planen och typernas nivåer ur sidans data, för spärrens siffror. */
  underlag?: SparrUnderlag | null
  children: ReactNode
}) {
  const [las, setLas] = useState<(Las & { typ: TestTypId | null }) | null>(null)
  const oppna = useCallback<Oppna>((h, typ = null) => setLas({ ...lasFor(h), typ }), [])
  const siffror = las && underlag ? sparrDataFor(underlag, las.typ) : null
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
          grundKvarIdag={grundKvarIdag}
          dagarKvar={siffror?.dagarKvar ?? null}
          sparrData={siffror?.data ?? null}
        />
      ) : null}
    </Kontext.Provider>
  )
}
