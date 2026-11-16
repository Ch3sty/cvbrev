/**
 * Premiumpriset som text för mallytorna: ordinarie och de kampanjer som är
 * kvar. Publika sidor cachas ett dygn, så klienten väljer kampanjen ur
 * html[data-kampanj] (samma källa som kampanjraden), aldrig serverns klocka.
 * Priset skrivs aldrig för hand (plans.ts och kampanj.ts).
 */
import 'server-only'
import { SALD_PLAN, prisPeriod } from '@/lib/plans/plans'
import { kampanjerKvar } from '@/lib/kampanj/kampanj'

export interface PrisInfo {
  ordinarie: string
  kampanjer: { nyckel: string; text: string; ordinarieText: string }[]
}

export function prisInfo(nu: Date = new Date()): PrisInfo {
  const ordinarie = prisPeriod(SALD_PLAN)
  return {
    ordinarie,
    kampanjer: kampanjerKvar(nu).map((k) => ({
      nyckel: k.nyckel,
      text: `${k.pris} kr första månaden`,
      ordinarieText: ordinarie,
    })),
  }
}
