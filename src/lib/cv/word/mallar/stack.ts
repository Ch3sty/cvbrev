import type { WordMallDef } from '../base'
import { RUBRIKER } from './gemensamt'

/**
 * Stack: kompetenserna först i tre spalter, Consolas för datum, kontakt och
 * kompetenslistan, teal linje under rubrikerna.
 */
export const stack: WordMallDef = {
  id: 'stack-developer',
  namn: 'Stack',
  typsnitt: 'Calibri',
  mono: 'Consolas',
  storlek: 11,
  marginal: { topp: 24, sida: 24, botten: 22 },
  farg: { text: '1F2937', rubrik: '0F172A', dampad: '475569', yrkestitel: '0E7490', arbetsgivare: '475569', period: '0E7490' },
  huvud: { justering: 'vanster', namnPt: 22, yrkestitelPt: 12, yrkestitelFet: true, kontaktPt: 9, linje: { farg: 'E5E7EB', pt: 0.75 } },
  rubrik2: { justering: 'vanster', pt: 8.5, sparrning: 1.2, farg: '0F172A', underkant: { farg: '0E7490', pt: 1 } },
  posttitelPt: 11,
  arbetsgivareFet: false,
  punkt: { tecken: '–', farg: '94A3B8' },
  sektioner: ['profil', 'kompetensSpalter', 'erfarenhet', 'utbildning', 'sprak', 'certifieringar', 'projekt'],
  rubriker: RUBRIKER,
  kompetensForm: 'grupper',
  utbildningDetaljer: false,
  utbildningPagaende: false,
  sortera: true,
  referenser: { text: '// Referenser lämnas på begäran', justering: 'vanster', kursiv: false, linje: { farg: 'E5E7EB', pt: 0.75 } },
}
