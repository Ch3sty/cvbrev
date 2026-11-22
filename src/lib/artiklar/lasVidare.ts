// src/lib/artiklar/lasVidare.ts
// Urvalet till Läs vidare under varje artikel: tre andra artiklar.
//
//  1. Flest gemensamma taggar, sedan nyast (som förut).
//  2. Fattas det fylls på ur samma kluster (getCtaVariantForTags), närmast i
//     tid först. Så hamnar en ny artikel inte på sidor där den inte hör hemma,
//     och påfyllnaden byts inte ut vid varje publicering: en ny artikel blir
//     granne i tid bara till de senaste i sitt kluster.
//  3. Bara om klustret har färre än tre andra artiklar tas de nyaste.
//
// SEO:s uppföljning 7.1 (docs/artiklar-2026-11/seo-slutgranskning.md).

import { parseISO } from 'date-fns'
import { getCtaVariantForTags } from '@/lib/cta/clusters'

export interface LasVidareKandidat {
  slug: string
  date?: string
  tags?: string[]
}

/**
 * Fast spridning bland artiklar på samma avstånd i tid (många publicerades
 * samma dag): ett hashvärde av paret, så att inte samma artikel vinner
 * överallt och ordningen är densamma vid varje bygge.
 */
function parHash(a: string, b: string): number {
  let h = 0x811c9dc5
  for (const c of `${a}>${b}`) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

const tid = (p: LasVidareKandidat): number => {
  if (!p.date) return 0
  const t = parseISO(p.date).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Väljer högst `antal` artiklar till Läs vidare för artikeln `slug`. */
export function valjLasVidare<T extends LasVidareKandidat>(alla: T[], slug: string, taggar: string[], antal = 3): T[] {
  const egen = alla.find((p) => p.slug === slug)
  const andra = alla.filter((p) => p.slug !== slug)
  let urval: T[] = []
  if (taggar.length > 0) {
    urval = andra
      .map((p) => ({ p, gemensamma: p.tags?.filter((t) => taggar.includes(t)).length || 0 }))
      .filter((x) => x.gemensamma > 0)
      .sort((a, b) => b.gemensamma - a.gemensamma || tid(b.p) - tid(a.p))
      .slice(0, antal)
      .map((x) => x.p)
  }
  if (urval.length < antal) {
    const kluster = getCtaVariantForTags(taggar)
    const egenTid = egen ? tid(egen) : 0
    const grannar = andra
      .filter((p) => !urval.includes(p) && getCtaVariantForTags(p.tags) === kluster)
      .sort(
        (a, b) =>
          Math.abs(tid(a) - egenTid) - Math.abs(tid(b) - egenTid) ||
          parHash(slug, a.slug) - parHash(slug, b.slug) ||
          a.slug.localeCompare(b.slug)
      )
    urval = [...urval, ...grannar].slice(0, antal)
  }
  if (urval.length < antal) {
    const senaste = andra.filter((p) => !urval.includes(p)).sort((a, b) => tid(b) - tid(a))
    urval = [...urval, ...senaste].slice(0, antal)
  }
  return urval
}
