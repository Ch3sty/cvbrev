/**
 * Brevmallarna på de publika sidorna (byggspecen våg 1, 2026-11-21): talen
 * och namnen läses ur brevets katalog (samma 40 mallar som CV:t), aldrig
 * skrivna för hand. Säljsidans mallsektion och dekoren på /funktioner visar
 * brevets egna miniatyrer: statiska webp ritade av brevmotorn med
 * scripts/brevmallar-miniatyrer.ts ur exempelBrev('kort').
 *
 * Klientsäker: ren data.
 */
import { brevMallKatalog, brevMallKort, BREV_FORVALD_MALL } from '@/lib/letters/brevmall/katalog'
import type { BrevMallKort } from '@/lib/letters/brevmall/typer'

const KATALOG = brevMallKatalog()

/** "Linne och Björk", "Linne, Björk och Koppar". */
export function namnLista(namn: readonly string[]): string {
  return namn.length < 2 ? namn.join('') : `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}

export const BREV_MALL_ANTAL = KATALOG.length
export const BREV_GRATIS_ANTAL = KATALOG.filter((k) => k.niva === 'gratis').length
export const BREV_PREMIUM_ANTAL = BREV_MALL_ANTAL - BREV_GRATIS_ANTAL
export const BREV_WORD_ANTAL = KATALOG.filter((k) => k.word).length
/** Gratismallarnas namn ur katalogen: "Linne och Björk". */
export const BREV_GRATIS_NAMN = namnLista(KATALOG.filter((k) => k.niva === 'gratis').map((k) => k.namn))
/** Den förvalda mallens namn (Linne). */
export const BREV_FORVALD_NAMN = brevMallKort(BREV_FORVALD_MALL)?.namn ?? BREV_FORVALD_MALL

/** Säljsidans sju mallar, i den här ordningen (UX:s urval). */
export const SALJ_MALL_IDS = ['linne', 'bjork', 'koppar', 'kalksten', 'granit', 'kolumn', 'terrakotta'] as const

/** Dekoren på /funktioner: tre av säljsidans miniatyrer. */
export const FUNKTIONER_MALL_IDS = ['linne', 'bjork', 'koppar'] as const

/** Miniatyrens mått i px (A4:ans proportioner). Samma i filen och i HTML, så att CLS är 0. */
export const MINIATYR_BREDD = 480
export const MINIATYR_HOJD = 679

/** Var miniatyren ligger under public/. */
export function brevMiniatyrSrc(id: string): string {
  return `/mallar/brev/${id}.webp`
}

/** Formatmärket ur katalogens word: "PDF · Word" eller "PDF". */
export function formatMarke(word: boolean): string {
  return word ? 'PDF · Word' : 'PDF'
}

/** Korten för ett urval ur katalogen, i urvalets ordning. Okända id kastar (fångas av testet). */
export function brevMallKortFor(ids: readonly string[]): BrevMallKort[] {
  return ids.map((id) => {
    const k = brevMallKort(id)
    if (!k) throw new Error(`Brevmallen ${id} finns inte i katalogen`)
    return k
  })
}
