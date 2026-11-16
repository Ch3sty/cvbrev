/**
 * Mallarnas typsnitt som egna filer (public/fonts/cv, woff2 ur Fontsource,
 * licenser i public/fonts/cv/LICENSER.txt).
 *
 * Produktionens Chromium (@sparticuz/chromium) har inga Windows-typsnitt, så
 * en PDF med "Calibri" blev Open Sans i prod men Calibri lokalt. Renderaren
 * deklarerar därför @font-face under Word-namnen ('Calibri', 'Arial' ...)
 * med fritt licensierade, metriskt kompatibla typsnitt, så att samma CSS ger
 * samma typsnitt överallt: lokalt, i förhandsvisningen och i lambdan.
 *
 *   Calibri          Carlito (metrisk tvilling)
 *   Arial, Helvetica Arimo (Liberation Sans, metrisk tvilling)
 *   Times New Roman  Tinos (Liberation Serif, metrisk tvilling)
 *   Georgia          Gelasio (metriskt kompatibel)
 *   Garamond         EB Garamond (inte metrisk; närmaste fria Garamond)
 *   Verdana          DejaVu Sans (ingen fri metrisk tvilling finns; något smalare)
 *   Lato, Open Sans, Roboto, Poppins  sig själva
 *
 * Word-filen behåller Word-namnen: mottagaren har Calibri.
 *
 * Klientsäker: ren data.
 */
import type { TypsnittId } from './kontrakt'

export interface TypsnittFil {
  /** Namnet i CSS (samma som i Word). */
  familj: string
  /** Filnamnets början i public/fonts/cv. */
  fil: string
  /** Varianterna som finns: vikt och stil. */
  varianter: readonly { vikt: number; stil: 'normal' | 'italic' }[]
  /** Finns latin-ext (polska, tjeckiska namn)? */
  latinExt: boolean
}

const FYRA = [
  { vikt: 400, stil: 'normal' },
  { vikt: 700, stil: 'normal' },
  { vikt: 400, stil: 'italic' },
  { vikt: 700, stil: 'italic' },
] as const

export const TYPSNITT_FILER: Readonly<Record<TypsnittId, TypsnittFil>> = {
  calibri: { familj: 'Calibri', fil: 'carlito', varianter: FYRA, latinExt: true },
  arial: { familj: 'Arial', fil: 'arimo', varianter: FYRA, latinExt: true },
  helvetica: { familj: 'Helvetica', fil: 'arimo', varianter: FYRA, latinExt: true },
  times: { familj: 'Times New Roman', fil: 'tinos', varianter: FYRA, latinExt: true },
  georgia: { familj: 'Georgia', fil: 'gelasio', varianter: FYRA, latinExt: true },
  garamond: { familj: 'Garamond', fil: 'eb-garamond', varianter: FYRA, latinExt: true },
  verdana: {
    familj: 'Verdana',
    fil: 'dejavu-sans',
    varianter: [
      { vikt: 400, stil: 'normal' },
      { vikt: 700, stil: 'normal' },
    ],
    latinExt: false,
  },
  lato: {
    familj: 'Lato',
    fil: 'lato',
    varianter: [
      { vikt: 300, stil: 'normal' },
      { vikt: 400, stil: 'normal' },
      { vikt: 700, stil: 'normal' },
      { vikt: 400, stil: 'italic' },
      { vikt: 700, stil: 'italic' },
    ],
    latinExt: true,
  },
  'open-sans': {
    familj: 'Open Sans',
    fil: 'open-sans',
    varianter: [
      { vikt: 400, stil: 'normal' },
      { vikt: 600, stil: 'normal' },
      { vikt: 700, stil: 'normal' },
      { vikt: 400, stil: 'italic' },
    ],
    latinExt: true,
  },
  roboto: {
    familj: 'Roboto',
    fil: 'roboto',
    varianter: [
      { vikt: 300, stil: 'normal' },
      { vikt: 400, stil: 'normal' },
      { vikt: 500, stil: 'normal' },
      { vikt: 700, stil: 'normal' },
      { vikt: 400, stil: 'italic' },
    ],
    latinExt: true,
  },
  poppins: {
    familj: 'Poppins',
    fil: 'poppins',
    varianter: [
      { vikt: 300, stil: 'normal' },
      { vikt: 400, stil: 'normal' },
      { vikt: 500, stil: 'normal' },
      { vikt: 600, stil: 'normal' },
      { vikt: 400, stil: 'italic' },
    ],
    latinExt: true,
  },
}

/** Sökvägen som HTML:en pekar på (samma ursprung, cachebar). */
export const TYPSNITT_URL = '/fonts/cv/'

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'

/** @font-face-reglerna för ett antal typsnitt, med url:er till public/fonts/cv. */
export function fontFace(ids: readonly TypsnittId[]): string {
  const ut: string[] = []
  for (const id of new Set(ids)) {
    const t = TYPSNITT_FILER[id]
    for (const v of t.varianter) {
      for (const [sub, range] of [['latin', LATIN], ...(t.latinExt ? [['latin-ext', LATIN_EXT]] : [])] as const) {
        ut.push(
          `@font-face{font-family:'${t.familj}';font-style:${v.stil};font-weight:${v.vikt};font-display:block;src:url(${TYPSNITT_URL}${t.fil}-${sub}-${v.vikt}-${v.stil}.woff2) format('woff2');unicode-range:${range}}`
        )
      }
    }
  }
  return ut.join('\n')
}
