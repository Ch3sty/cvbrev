/**
 * Typsnitten i nedladdade dokument, en tabell för båda rutterna.
 *
 * Brevens rutt (src/app/api/letters/download/route.ts) och CV-exporten
 * (src/app/api/cv/generate-formatted/route.ts) läser härifrån, så att ett
 * typsnitt heter samma sak i PDF:en och i Word-filen
 * (docs/plan-cv-word-2026-11-15.md avsnitt 5.2).
 *
 * Klientsäker: ren data, inga Node-moduler.
 */

/** CSS-stacken för PDF:en, per typsnitts-id i verktygsraden. */
const CSS_STACK: Record<string, string> = {
  calibri: 'Calibri, Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  lato: "'Lato', Arial, sans-serif",
  'open-sans': "'Open Sans', Arial, sans-serif",
  roboto: "'Roboto', Arial, sans-serif",
  poppins: "'Poppins', Arial, sans-serif",
  georgia: 'Georgia, Times, serif',
  garamond: 'Garamond, Georgia, serif',
  times: "'Times New Roman', Times, serif",
  helvetica: 'Helvetica, Arial, sans-serif',
  montserrat: "'Montserrat', Arial, sans-serif",
  lora: "'Lora', Georgia, serif",
  'ibm-plex-sans': "'IBM Plex Sans', Arial, sans-serif",
}

/** Namnet i en .docx, utan reservtypsnitt (Word tar bara ett namn). */
const DOCX_NAMN: Record<string, string> = {
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
  montserrat: 'Montserrat',
  lora: 'Lora',
  'ibm-plex-sans': 'IBM Plex Sans',
}

/**
 * Typsnitten som finns i Word på både Windows och Mac. En CV-fil som pekar
 * på något annat faller till Times New Roman hos mottagaren och ser trasig
 * ut (planens B6), så Word-läget i steg 3 visar bara de här sex.
 */
export const WORD_TYPSNITT_IDS = ['calibri', 'arial', 'verdana', 'georgia', 'garamond', 'times'] as const
export type WordTypsnittId = (typeof WORD_TYPSNITT_IDS)[number]

export function arWordTypsnitt(id: unknown): id is WordTypsnittId {
  return typeof id === 'string' && (WORD_TYPSNITT_IDS as readonly string[]).includes(id)
}

export function getFontFamilyForHTML(fontId: string = 'calibri'): string {
  return CSS_STACK[fontId] ?? CSS_STACK.calibri
}

export function getFontNameForDocx(fontId: string = 'calibri'): string {
  return DOCX_NAMN[fontId] ?? DOCX_NAMN.calibri
}

/**
 * Typsnittet en CV-fil i Word får: användarens val om det finns i Word,
 * annars null, och då gäller mallens eget Word-typsnitt.
 */
export function wordTypsnittForCv(fontId: unknown): string | null {
  return arWordTypsnitt(fontId) ? DOCX_NAMN[fontId] : null
}
