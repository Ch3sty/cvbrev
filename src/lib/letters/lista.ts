/**
 * Listan Dina brev och låsregeln (BYGGSPEC avsnitt 4).
 *
 * Listan: alla användarens brev, senast uppdaterade först. Bland rader med
 * is_saved = false och samma annons (job_description efter trim) visas bara
 * den senaste; sparade rader visas alltid.
 *
 * Låset på gratisnivån: de två senast uppdaterade breven i listan (efter
 * avdubbleringen) är öppna, övriga låsta. Premium: inget är låst. Samma regel
 * i listan, i brevvyn och i alla skrivande rutter (arBrevLast).
 *
 * Klientsäker och ren.
 */
import { FREE_ACTIVE_LETTER_LIMIT } from './letter-quota'

export const OPPNA_BREV_GRATIS = FREE_ACTIVE_LETTER_LIMIT

export interface BrevRadForLista {
  id: string
  is_saved?: boolean | null
  job_description?: string | null
  updated_at?: string | null
  created_at?: string | null
}

export function brevTid(rad: Pick<BrevRadForLista, 'updated_at' | 'created_at'>): number {
  const raw = rad.updated_at || rad.created_at
  const t = raw ? new Date(raw).getTime() : 0
  return Number.isFinite(t) ? t : 0
}

/** Senast uppdaterade först; lika tid ger senast skapade först, sedan id (stabil ordning). */
export function sorteraBrev<T extends BrevRadForLista>(rader: readonly T[]): T[] {
  return [...rader].sort((a, b) => {
    const d = brevTid(b) - brevTid(a)
    if (d !== 0) return d
    const c = (b.created_at ? Date.parse(b.created_at) : 0) - (a.created_at ? Date.parse(a.created_at) : 0)
    if (c !== 0 && Number.isFinite(c)) return c
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}

/**
 * Avdubblingen: sorterad lista där bara den senaste av osparade rader med
 * samma annons står kvar. Rader utan annonstext avdubblas inte.
 */
export function avdubblaBrev<T extends BrevRadForLista>(rader: readonly T[]): T[] {
  const sorterade = sorteraBrev(rader)
  const sedda = new Set<string>()
  const ut: T[] = []
  for (const rad of sorterade) {
    if (rad.is_saved !== true) {
      const annons = (rad.job_description ?? '').trim()
      if (annons) {
        if (sedda.has(annons)) continue
        sedda.add(annons)
      }
    }
    ut.push(rad)
  }
  return ut
}

/** Id:n på de öppna breven. Premium: alla rader. */
export function oppnaBrevIds<T extends BrevRadForLista>(rader: readonly T[], harBetalt: boolean): Set<string> {
  if (harBetalt) return new Set(rader.map((r) => r.id))
  return new Set(avdubblaBrev(rader).slice(0, OPPNA_BREV_GRATIS).map((r) => r.id))
}

/**
 * Är brevet låst? Tar användarens alla rader (inte bara listans), så att en
 * rad som avdubbleringen gömmer räknas som låst på gratisnivån.
 */
export function arBrevLast<T extends BrevRadForLista>(id: string, rader: readonly T[], harBetalt: boolean): boolean {
  if (harBetalt) return false
  return !oppnaBrevIds(rader, false).has(id)
}

/** Listan Dina brev: avdubblad, sorterad, med isLocked per rad. */
export function brevlista<T extends BrevRadForLista>(rader: readonly T[], harBetalt: boolean): Array<T & { isLocked: boolean }> {
  const lista = avdubblaBrev(rader)
  if (harBetalt) return lista.map((r) => ({ ...r, isLocked: false }))
  return lista.map((r, i) => ({ ...r, isLocked: i >= OPPNA_BREV_GRATIS }))
}
