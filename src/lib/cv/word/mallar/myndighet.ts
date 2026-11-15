import type { WordMallDef } from '../base'
import { RUBRIKER } from './gemensamt'

/** Myndighet: Arial, marinblå styckekanter och § som punkttecken. */
export const myndighet: WordMallDef = {
  id: 'myndighet',
  namn: 'Myndighet',
  typsnitt: 'Arial',
  storlek: 10.5,
  marginal: { topp: 24, sida: 24, botten: 22 },
  farg: { text: '1F2937', rubrik: '0F172A', dampad: '475569', yrkestitel: '1E3A8A', arbetsgivare: '1E3A8A', period: '475569' },
  huvud: { justering: 'vanster', namnPt: 20, yrkestitelPt: 11, yrkestitelFet: true, kontaktPt: 9, linje: { farg: '1E3A8A', pt: 1.5 } },
  rubrik2: { justering: 'vanster', pt: 8.5, sparrning: 1.5, farg: '0F172A', underkant: { farg: '1E3A8A', pt: 0.75 } },
  posttitelPt: 11,
  arbetsgivareFet: true,
  punkt: { tecken: '§', farg: '1E3A8A', typsnitt: 'Arial' },
  sektioner: ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'certifieringar', 'projekt'],
  rubriker: { ...RUBRIKER, erfarenhet: 'Yrkeserfarenhet och ärendetyper', kompetenser: 'Lagstiftning & metoder' },
  kompetensForm: 'grupper',
  utbildningDetaljer: false,
  utbildningPagaende: false,
  sortera: false,
  referenser: null,
}
