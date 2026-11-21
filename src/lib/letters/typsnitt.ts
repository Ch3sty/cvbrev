/**
 * Brevets typsnitt som vyerna visar dem (Mallar, Brevet, Skriv): "Mallens
 * eget" plus de elva i FontSelector, i samma ordning och med samma id. En
 * lista, så att Mallar och arbetsläget inte bär var sin kopia.
 *
 * id:      samma som letters.font_id och BREV_TYPSNITT_IDS (brevRegler.ts).
 * familj:  CSS-stacken för förhandsvisningen av namnet (samma som PDF:en).
 * grupp:   FontSelectors kategorier.
 * premium: får bara sparas med Premium (PREMIUM_TYPSNITT_IDS).
 *
 * Klientsäker: ren data.
 */
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'
import { fontFace } from '@/lib/cv/mallar/typsnitt-filer'
import { BREV_TYPSNITT_IDS, PREMIUM_TYPSNITT_IDS, type BrevTypsnittId } from './brevRegler'

export type BrevTypsnittGrupp = 'klassiker' | 'moderna' | 'formella' | 'premium'

export interface BrevTypsnitt {
  id: BrevTypsnittId
  namn: string
  /** CSS-stacken; första namnet är det som typsnittFontFace() deklarerar. */
  familj: string
  grupp: BrevTypsnittGrupp
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

const GRUPP: Record<BrevTypsnittId, BrevTypsnittGrupp> = {
  calibri: 'klassiker',
  arial: 'klassiker',
  verdana: 'klassiker',
  lato: 'moderna',
  'open-sans': 'moderna',
  roboto: 'moderna',
  poppins: 'moderna',
  georgia: 'formella',
  garamond: 'formella',
  times: 'formella',
  helvetica: 'premium',
}

/** De elva typsnitten, i FontSelectors ordning. */
export const BREV_TYPSNITT: readonly BrevTypsnitt[] = BREV_TYPSNITT_IDS.map((id) => ({
  id,
  namn: NAMN[id],
  familj: getFontFamilyForHTML(id),
  grupp: GRUPP[id],
  premium: PREMIUM_TYPSNITT_IDS.includes(id),
  modern: GRUPP[id] === 'moderna',
}))

/**
 * @font-face för alla elva ur CV-mallarnas egna filer (public/fonts/cv), för
 * listorna där varje namn står i sitt eget typsnitt.
 */
export function typsnittFontFace(): string {
  return fontFace(BREV_TYPSNITT_IDS)
}

/** Raden för brevets eget typsnitt (font_id null). */
export const MALLENS_EGET = 'Mallens eget'

/** Typsnittet för ett id, eller undefined (null och okända id = mallens eget). */
export function brevTypsnitt(id: unknown): BrevTypsnitt | undefined {
  return typeof id === 'string' ? BREV_TYPSNITT.find((t) => t.id === id) : undefined
}

/** Namnet som visas: null och okända id blir "Mallens eget". */
export function typsnittNamn(id: unknown): string {
  return brevTypsnitt(id)?.namn ?? MALLENS_EGET
}

/** Namnen på mallarnas egna typsnitt (katalogens TypsnittId), för "Typsnitt: Calibri". */
const MALLTYPSNITT_NAMN: Record<string, string> = {
  ...NAMN,
  montserrat: 'Montserrat',
  lora: 'Lora',
  'ibm-plex-sans': 'IBM Plex Sans',
}

export function malltypsnittNamn(typsnittId: string | null | undefined): string {
  return (typsnittId && MALLTYPSNITT_NAMN[typsnittId]) || MALLENS_EGET
}
