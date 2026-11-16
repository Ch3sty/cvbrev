/**
 * Mallarna i grupper, i Alla-listans ordning: Föreslagna, Gratis och sedan
 * formfamiljerna. Samma ordning i Alla-arket, i mallkolumnen på datorn och
 * i helskärmens remsa på datorn. Varje mall står i högst en grupp och en
 * grupp utan mallar visas aldrig (ägarens påpekande om "EN SPALT" utan mallar, 2026-11-16).
 *
 * Ren funktion, ingen 'use client'.
 */
import type { Familj, MallKort } from '@/lib/cv/mallar/kontrakt'
import { ALLA_ARK, REMSA } from './texter'

export const FAMILJER: readonly Familj[] = ['en-spalt', 'marginal', 'sidospalt', 'konstnarlig']

export interface Mallgrupp {
  namn: string
  mallar: MallKort[]
}

export function grupperaMallar({
  katalog,
  foreslagna,
  traffar = katalog,
  utanSok = true,
  utanForeslagna = false,
}: {
  katalog: readonly MallKort[]
  foreslagna: readonly string[]
  /** Mallarna som passar sök och filter (standard: alla). */
  traffar?: readonly MallKort[]
  /** Inget sökord och filtret Alla: då står Föreslagna och Gratis först. */
  utanSok?: boolean
  /** Föreslagna visas redan ovanför (datorns kolumn): räknas som visade men får ingen egen grupp. */
  utanForeslagna?: boolean
}): Mallgrupp[] {
  const ut: Mallgrupp[] = []
  const visade = new Set<string>()
  if (utanSok) {
    const f = foreslagna.map((id) => katalog.find((m) => m.id === id)).filter((m): m is MallKort => Boolean(m))
    if (!utanForeslagna && f.length) ut.push({ namn: REMSA.foreslagna, mallar: f })
    f.forEach((m) => visade.add(m.id))
    const g = katalog.filter((m) => m.niva === 'gratis' && !visade.has(m.id))
    if (g.length) ut.push({ namn: REMSA.gratis, mallar: g })
    g.forEach((m) => visade.add(m.id))
  }
  for (const fam of FAMILJER) {
    const m = traffar.filter((x) => x.familj === fam && !visade.has(x.id))
    if (m.length) ut.push({ namn: ALLA_ARK.familj[fam], mallar: m })
    m.forEach((x) => visade.add(x.id))
  }
  return ut
}
