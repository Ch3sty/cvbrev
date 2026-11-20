// src/lib/tests/oppet-facit.ts
// =============================================================================
// Ett öppet facit i de publika proven (omgång 3, beslut A). När provet rättas
// väljer servern exakt en uppgift vars facit lämnas ut före kontot:
//
//   två eller fler missar   den första missen
//   en miss                 den första uppgift hon klarade (missen förblir låst)
//   noll missar             den första uppgiften
//
// Valet är en ren funktion av vilka positioner som blev fel, så samma prov ger
// alltid samma öppna uppgift (en omladdning öppnar ingen annan). Ren fil utan
// banker: typerna och valet får importeras av klienten och av mätningen.
// Facit byggs bara på servern, i oppet-facit.server.ts.
// =============================================================================

import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import type { GenomgangUppgift } from './prov-typer'

/** Spärrens tre varianter: antal missar noll, en, eller två och fler. */
export type OppetFacitVariant = 'noll' | 'en' | 'flera'

export interface OppetFacitVal {
  /** Uppgiftens position i provet, 0-baserad som `fel`. -1 när ingen uppgift går att öppna. */
  index: number
  variant: OppetFacitVariant
  antal_fel: number
}

/**
 * Matrisens öppna uppgift, i samma form som genomgången i de inloggade
 * matristesterna (genomgaFraga och misstagFor): frågan i provets visade
 * ordning med `rattVisat`, `rule`, `title` och `family`, hennes visade val och
 * misstaget för det valet när det var fel.
 */
export interface MatrisOppenUppgift {
  kind: 'matris'
  nyckel: string
  data: GenomgangsFraga
  /** Hennes val som visat index, null för obesvarad. */
  valt: number | null
  correct: boolean
  /** Misstaget för hennes val när det var fel, annars null. */
  misstag: string | null
}

/**
 * Den enda uppgiften med facit i rättningens svar. Typerna utöver matrisen
 * bär genomgångens form (GenomgangUppgift ur genomgaProv), samma som sidan
 * efter kontot ritar med genomgangPoster.
 */
export interface OppetFacit {
  /** Uppgiftens position i provet, 0-baserad som `fel`. */
  index: number
  correct: boolean
  uppgift: GenomgangUppgift | MatrisOppenUppgift
}

/** Fälten som rättningens svar får utöver { score, total, fel, percentile }. */
export interface OppetFacitSvar {
  variant: OppetFacitVariant
  antal_fel: number
  /** Null bara när uppgiften inte längre finns i banken. */
  oppet_facit: OppetFacit | null
}

export function oppetFacitVariant(antalFel: number): OppetFacitVariant {
  return antalFel <= 0 ? 'noll' : antalFel === 1 ? 'en' : 'flera'
}

/** Regeln A. `fel` är positionerna som blev fel eller lämnades obesvarade. */
export function valjOppetFacit(fel: readonly number[], total: number): OppetFacitVal {
  const missar = new Set(fel.filter((i) => Number.isInteger(i) && i >= 0 && i < total))
  const antal_fel = missar.size
  const variant = oppetFacitVariant(antal_fel)
  let index = -1
  if (variant === 'flera') index = Math.min(...missar)
  else if (variant === 'en') {
    for (let i = 0; i < total; i++) if (!missar.has(i)) {
      index = i
      break
    }
  } else if (total > 0) index = 0
  return { index, variant, antal_fel }
}
