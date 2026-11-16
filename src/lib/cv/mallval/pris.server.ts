/**
 * Premiumpriset som text för mallytorna: ordinarie och de kampanjer som är
 * kvar. Publika sidor cachas ett dygn, så klienten väljer kampanjen ur
 * html[data-kampanj] (samma källa som kampanjraden), aldrig serverns klocka.
 * Priset skrivs aldrig för hand (plans.ts och kampanj.ts).
 */
import 'server-only'
import { SALD_PLAN, prisPeriod } from '@/lib/plans/plans'
import { kampanjPrisPeriod, kampanjerKvar } from '@/lib/kampanj/kampanj'

export interface PrisInfo {
  ordinarie: string
  /** text: kort form för knappen; lang: "99 kr första månaden, sedan 149 kr i månaden" (affärsgranskningen R1). */
  kampanjer: { nyckel: string; text: string; lang: string; ordinarieText: string }[]
}

export function prisInfo(nu: Date = new Date()): PrisInfo {
  const ordinarie = prisPeriod(SALD_PLAN)
  return {
    ordinarie,
    kampanjer: kampanjerKvar(nu).map((k) => ({
      nyckel: k.nyckel,
      text: `${k.pris} kr första månaden`,
      lang: kampanjPrisPeriod(k),
      ordinarieText: ordinarie,
    })),
  }
}
