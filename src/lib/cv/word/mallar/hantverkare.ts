import type { WordMallDef } from '../base'
import { RUBRIKER } from './gemensamt'

/**
 * Hantverkare (id bygg): tjock orange linje under huvudet, behörigheterna i
 * ett tonat block direkt efter profilen och arbetsplatserna på en rad.
 */
export const hantverkare: WordMallDef = {
  id: 'bygg',
  namn: 'Hantverkare',
  typsnitt: 'Calibri',
  storlek: 11,
  marginal: { topp: 20, sida: 22, botten: 20 },
  farg: { text: '1F2937', rubrik: '0F172A', dampad: '475569', yrkestitel: 'C2410C', arbetsgivare: 'C2410C', period: '64748B' },
  huvud: { justering: 'vanster', namnPt: 22, yrkestitelPt: 12, yrkestitelFet: true, kontaktPt: 9.5, linje: { farg: 'F97316', pt: 2.25 } },
  rubrik2: { justering: 'vanster', pt: 9, sparrning: 1.4, farg: '0F172A', underkant: { farg: 'F97316', pt: 1.5 } },
  posttitelPt: 11.5,
  arbetsgivareFet: true,
  linjeMellanPoster: { farg: 'E5E7EB', pt: 0.5 },
  punkt: { tecken: '•', farg: 'F97316' },
  sektioner: ['profil', 'behorigheter', 'arbetsplatser', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'projekt'],
  rubriker: { ...RUBRIKER, erfarenhet: 'Yrkeserfarenhet' },
  kompetensForm: 'grupper',
  utbildningDetaljer: false,
  utbildningPagaende: false,
  sortera: true,
  referenser: null,
  block: { bakgrund: 'FEF3E8', kant: 'FED7AA', rubrikFarg: 'C2410C' },
}
