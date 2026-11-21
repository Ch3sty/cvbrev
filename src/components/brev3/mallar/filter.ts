/**
 * Mallarnas filter i Mallar (skissen: Alla 40, Gratis, Enkla, Med färg,
 * Sidospalt), härledda ur CV-katalogens familj och stil (BYGGSPEC avsnitt 7).
 *
 *   Gratis     nivån gratis (Linne och Björk).
 *   Sidospalt  familjen sidospalt, eller en spalt eller panel längs ena
 *              sidan enligt stilen (Ritning, Sand).
 *   Med färg   huvud, band, spalt, sida eller rubriker fyllda med färg
 *              enligt stilen (Koppar, Granit, Mörkrum, Ritning ...).
 *              Accentlinjer och tunna kanter räknas inte.
 *   Enkla      en spalt utan färgfält.
 *
 * Klientsäker: ren data.
 */
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import type { BrevMallKort } from '@/lib/letters/brevmall/typer'
import { brevMallKatalog } from '@/lib/letters/brevmall/katalog'

export type MallFilter = 'alla' | 'gratis' | 'enkla' | 'farg' | 'sidospalt'

export const MALL_FILTER: readonly { id: MallFilter; etikett: (antal: number) => string }[] = [
  { id: 'alla', etikett: (n) => `Alla ${n}` },
  { id: 'gratis', etikett: () => 'Gratis' },
  { id: 'enkla', etikett: () => 'Enkla' },
  { id: 'farg', etikett: () => 'Med färg' },
  { id: 'sidospalt', etikett: () => 'Sidospalt' },
]

const FARG = /färgat|färgad|färgremsa|huvudband|svart|mörk|tonade|tonat|djupblå|fyllda/i
const SPALT = /(vänster|höger)spalt|högerpanel/i

/** Ett mallkort med det filtren och vyerna behöver utöver brevets kort. */
export interface MallarKort extends BrevMallKort {
  /** Mallens eget typsnitt (katalogens TypsnittId). */
  typsnitt: string
  farg: boolean
  sidospalt: boolean
  enkel: boolean
}

export function mallarKatalog(): MallarKort[] {
  const stil = new Map(MALL_KATALOG.map((m) => [m.id, m]))
  return brevMallKatalog().map((k) => {
    const m = stil.get(k.id)!
    const farg = FARG.test(m.stil)
    const sidospalt = m.familj === 'sidospalt' || SPALT.test(m.stil)
    return { ...k, typsnitt: m.typsnitt ?? 'calibri', farg, sidospalt, enkel: m.familj === 'en-spalt' && !farg && !sidospalt }
  })
}

export function passarFilter(k: MallarKort, f: MallFilter): boolean {
  switch (f) {
    case 'gratis':
      return k.niva === 'gratis'
    case 'enkla':
      return k.enkel
    case 'farg':
      return k.farg
    case 'sidospalt':
      return k.sidospalt
    default:
      return true
  }
}
