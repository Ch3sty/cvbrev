import type { WordMallDef } from '../base'
import { REFERENSER, RUBRIKER } from './gemensamt'

/**
 * Tidlös: Garamond, centrerat huvud och centrerade rubriker, svart hårlinje
 * under huvudet och mörkgrönt på arbetsgivare och period.
 */
export const tidlos: WordMallDef = {
  id: 'tidlos-formell',
  namn: 'Tidlös',
  typsnitt: 'Garamond',
  storlek: 11.5,
  marginal: { topp: 26, sida: 27, botten: 24 },
  farg: { text: '1F2937', rubrik: '111827', dampad: '4B5563', yrkestitel: '4B5563', arbetsgivare: '064E3B', period: '064E3B' },
  huvud: { justering: 'centrerad', namnPt: 24, yrkestitelPt: 13, yrkestitelFet: false, yrkestitelKursiv: true, kontaktPt: 10.5, linje: { farg: '1F2937', pt: 0.75 } },
  rubrik2: { justering: 'centrerad', pt: 9.5, sparrning: 1.8, farg: '1F2937', underkant: { farg: 'D1D5DB', pt: 0.75 } },
  posttitelPt: 12,
  arbetsgivareFet: false,
  arbetsgivareKursiv: true,
  periodKursiv: true,
  punkt: { tecken: '–', farg: '6B7280' },
  sektioner: ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'certifieringar', 'projekt'],
  rubriker: { ...RUBRIKER, sprak: 'Språkkunskaper' },
  kompetensForm: 'rad',
  utbildningDetaljer: false,
  utbildningPagaende: false,
  sortera: true,
  referenser: { text: REFERENSER, justering: 'centrerad', kursiv: true, linje: { farg: 'D1D5DB', pt: 0.75 } },
}
