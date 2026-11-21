/**
 * Brevrummets regler för mall, typsnitt och ton (BYGGSPEC avsnitt 4).
 *
 * Gratis får förhandsvisa alla mallar men bara spara Linne och Björk som
 * brevets mall. Typsnittet Helvetica och tonen auto ingår i Premium. Samma
 * regler gäller i gränssnittet och på servern: rutterna som sparar eller
 * genererar frågar premiumSparr innan något skrivs.
 *
 * Klientsäker: ren data, inga Node-moduler.
 */
import { GRATIS_MALL_IDS, FORVALD_MALL_ID, getMallKort } from '@/lib/cv/mallar/katalog'
import { losMallId } from '@/lib/cv/mallar/alias'

/** Typsnitten brevet kan få (listan i src/lib/letters/typsnitt.ts), samma id som förut. */
export const BREV_TYPSNITT_IDS = [
  'calibri',
  'arial',
  'verdana',
  'lato',
  'open-sans',
  'roboto',
  'poppins',
  'georgia',
  'garamond',
  'times',
  'helvetica',
] as const
export type BrevTypsnittId = (typeof BREV_TYPSNITT_IDS)[number]

/** Typsnitt som bara Premium får spara. */
export const PREMIUM_TYPSNITT_IDS: readonly string[] = ['helvetica']

/** Tonerna: fem valbara och auto (Premium). Samma id som generateCoverLetter. */
export const BREV_TONER_FRI = ['professional', 'enthusiastic', 'creative', 'confident', 'balanced'] as const
export const PREMIUM_TON = 'auto'

/** Mallen ett nytt brev får när inget annat går: Linne. */
export const BREV_FORVALD_MALL: string = FORVALD_MALL_ID

export function arBrevTypsnitt(id: unknown): id is BrevTypsnittId {
  return typeof id === 'string' && (BREV_TYPSNITT_IDS as readonly string[]).includes(id)
}

export function arTon(id: unknown): boolean {
  return typeof id === 'string' && ((BREV_TONER_FRI as readonly string[]).includes(id) || id === PREMIUM_TON)
}

/** Mallens id i katalogen (alias lösta), eller null om id:t är okänt. */
export function brevMallId(id: unknown): string | null {
  return losMallId(id)
}

/** Får en användare med den här behörigheten spara mallen som brevets mall? */
export function farSparaMall(mallId: string, harBetalt: boolean): boolean {
  if (harBetalt) return getMallKort(mallId) !== undefined
  return GRATIS_MALL_IDS.includes(mallId)
}

export type PremiumSparr = 'mall' | 'typsnitt' | 'ton'

/**
 * Vilken del av ett val som kräver Premium, eller null när allt är tillåtet.
 * Fält som inte skickas med (undefined) kontrolleras inte. Okända mallid och
 * typsnitt är valideringsfel, inte spärrar, och hanteras av anroparen.
 */
export function premiumSparr(
  val: { mallId?: string | null; fontId?: string | null; ton?: string | null },
  harBetalt: boolean
): PremiumSparr | null {
  if (harBetalt) return null
  if (val.mallId && !GRATIS_MALL_IDS.includes(val.mallId)) return 'mall'
  if (val.fontId && PREMIUM_TYPSNITT_IDS.includes(val.fontId)) return 'typsnitt'
  if (val.ton === PREMIUM_TON) return 'ton'
  return null
}

/**
 * Brevets mall från start (avsnitt 4): CV:ts mall om den går att läsa ut och
 * användaren får spara den, annars Linne.
 */
export function startmallForBrev(cvMall: unknown, harBetalt: boolean): string {
  const id = losMallId(cvMall)
  if (id && farSparaMall(id, harBetalt)) return id
  return BREV_FORVALD_MALL
}

/** CV-mallen ur ett CV:s structured_data (CV-byggarens bygge.mall), eller null. */
export function cvMallUrStrukturerad(structuredData: unknown): string | null {
  if (!structuredData || typeof structuredData !== 'object') return null
  const bygge = (structuredData as { bygge?: { mall?: unknown } }).bygge
  return typeof bygge?.mall === 'string' ? losMallId(bygge.mall) : null
}
