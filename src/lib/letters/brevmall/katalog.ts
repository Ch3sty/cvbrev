/**
 * Brevmallarna som vyerna ser dem: samma id, namn och nivå som CV-mallarna,
 * i CV-katalogens ordning (gratismallarna först). Klientsäker: läser bara
 * CV-katalogen (ren data), aldrig registret med definitionerna.
 */
import { MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import type { BrevMallKort } from './typer'

/** Brevet har inget foto, så kortet utan foto gäller när mallen har ett. */
function tillKort(k: (typeof MALL_KATALOG)[number]): BrevMallKort {
  return { id: k.id, namn: k.namn, niva: k.niva, word: k.word, kort: k.kortUtanFoto ?? k.kort, familj: k.familj }
}

export function brevMallKatalog(): BrevMallKort[] {
  return MALL_KATALOG.map(tillKort)
}

/** Kortet för ett id, eller undefined. Alias löses inte här. */
export function brevMallKort(id: unknown): BrevMallKort | undefined {
  const k = getMallKort(id)
  return k ? tillKort(k) : undefined
}

/** Brevets förvalda mall när inget annat går att läsa ut (byggspecen avsnitt 4). */
export const BREV_FORVALD_MALL = 'linne'
