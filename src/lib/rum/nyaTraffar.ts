/**
 * "N nya" på Matchade jobb (sidomenyn, Översikt): nya träffar bland de bästa,
 * de som listan visar (högst 25), inte bland alla lästa annonser
 * (rättningsrundan 2026-11-21: "600 nya" var antalet lästa annonser).
 *
 *   - Innan Matchade jobb har visats en gång finns inget "nya" (null).
 *   - När alla de bästa är nya säger vi antalet bästa träffar utan "nya".
 *
 * Klientsäker och ren. Publiceringstiden saknar zon (svensk tid) och läses
 * med `tidpunkt`, så att servern (UTC) och webbläsaren räknar lika.
 */
import { tidpunkt } from '@/lib/jobbsok/datum'

export interface NyaLage {
  /** Antal bästa träffar (högst 25). */
  basta: number
  /** Nya bland de bästa, null när det inte går att säga ("nya" ska inte stå). */
  nya: number | null
}

export function nyaBlandBasta(publiceringar: readonly (string | null)[], seddaAt: string | null | undefined): NyaLage {
  const basta = publiceringar.length
  if (!seddaAt) return { basta, nya: null }
  const sedd = tidpunkt(seddaAt)
  if (sedd === null) return { basta, nya: null }
  const nya = publiceringar.filter((p) => {
    const t = tidpunkt(p)
    return t !== null && t > sedd
  }).length
  if (nya === 0 || nya >= basta) return { basta, nya: null }
  return { basta, nya }
}

/** Rubriken över träffarna på Översikt: "4 nya jobb som passar dig", "25 jobb som passar dig". */
export function traffRubrikNya(l: NyaLage | null): string {
  if (!l || l.basta === 0) return 'Jobb som passar dig'
  if (l.nya) return `${l.nya} ${l.nya === 1 ? 'nytt jobb' : 'nya jobb'} som passar dig`
  return `${l.basta} jobb som passar dig`
}

/** Sidomenyns märke: aldrig fler än de bästa träffarna. */
export function nyaMarke(nya: number | null | undefined, tak = 25): number | null {
  if (nya === null || nya === undefined || !Number.isFinite(nya) || nya <= 0) return null
  return Math.min(nya, tak)
}
