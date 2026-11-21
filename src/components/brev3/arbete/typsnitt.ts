/**
 * Typsnitten brevet kan få: samma elva som den gamla FontSelector i skapa
 * brev (som är borttagen), med samma id som servern godkänner
 * (BREV_TYPSNITT_IDS i src/lib/letters/brevRegler.ts). Brevet och Mallar
 * läser listan härifrån.
 *
 * Varje typsnitt visas satt i sig självt. @font-face kommer ur CV-mallarnas
 * egna filer (public/fonts/cv), så att det som syns i listan är samma
 * typsnitt som arket och PDF:en får.
 *
 * Klientsäker: ren data.
 */
import { BREV_TYPSNITT_IDS, PREMIUM_TYPSNITT_IDS, type BrevTypsnittId } from '@/lib/letters/brevRegler'
import { fontFace, TYPSNITT_FILER } from '@/lib/cv/mallar/typsnitt-filer'

export interface BrevTypsnitt {
  id: BrevTypsnittId
  /** Namnet som visas. */
  namn: string
  /** CSS-familjen (Word-namnet, deklarerat med @font-face). */
  familj: string
  premium: boolean
  /** Moderna typsnitt: syns i PDF, i Word bara om de finns på datorn. */
  modern: boolean
}

const NAMN: Record<BrevTypsnittId, string> = {
  calibri: 'Calibri',
  arial: 'Arial',
  verdana: 'Verdana',
  lato: 'Lato',
  'open-sans': 'Open Sans',
  roboto: 'Roboto',
  poppins: 'Poppins',
  georgia: 'Georgia',
  garamond: 'Garamond',
  times: 'Times New Roman',
  helvetica: 'Helvetica',
}

const MODERNA: readonly string[] = ['lato', 'open-sans', 'roboto', 'poppins']

export const BREV_TYPSNITT: readonly BrevTypsnitt[] = BREV_TYPSNITT_IDS.map((id) => ({
  id,
  namn: NAMN[id],
  familj: TYPSNITT_FILER[id].familj,
  premium: PREMIUM_TYPSNITT_IDS.includes(id),
  modern: MODERNA.includes(id),
}))

export function brevTypsnitt(id: string | null | undefined): BrevTypsnitt | null {
  return BREV_TYPSNITT.find((t) => t.id === id) ?? null
}

/** @font-face för alla elva, för listan där varje namn står i sitt eget typsnitt. */
export function typsnittFontFace(): string {
  return fontFace(BREV_TYPSNITT_IDS)
}
