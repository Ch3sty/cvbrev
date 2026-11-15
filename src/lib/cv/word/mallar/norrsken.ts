import type { WordMallDef } from '../base'
import { REFERENSER, RUBRIKER } from './gemensamt'

/** Norrsken: orange vänsterkant på rubrikerna, hårlinjer mellan jobben. */
export const norrsken: WordMallDef = {
  id: 'norrsken',
  namn: 'Norrsken',
  typsnitt: 'Calibri',
  storlek: 11,
  marginal: { topp: 24, sida: 24, botten: 22 },
  farg: { text: '1F2937', rubrik: '0F172A', dampad: '64748B', yrkestitel: '475569', arbetsgivare: '475569', period: '64748B' },
  huvud: { justering: 'vanster', namnPt: 22, yrkestitelPt: 12, yrkestitelFet: false, kontaktPt: 9.5, linje: { farg: 'E5E7EB', pt: 0.75 } },
  rubrik2: { justering: 'vanster', pt: 8.5, sparrning: 1.3, farg: '0F172A', vansterkant: { farg: 'F97316', pt: 2.25 } },
  posttitelPt: 11.5,
  arbetsgivareFet: false,
  linjeMellanPoster: { farg: 'E5E7EB', pt: 0.5 },
  punkt: { tecken: '•', farg: 'F97316' },
  sektioner: ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'certifieringar', 'sprak', 'projekt'],
  rubriker: RUBRIKER,
  kompetensForm: 'grupper',
  utbildningDetaljer: false,
  utbildningPagaende: false,
  sortera: true,
  referenser: { text: REFERENSER, justering: 'vanster', kursiv: true, linje: { farg: 'E5E7EB', pt: 0.75 } },
}
