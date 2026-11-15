import type { WordMallDef } from '../base'
import { REFERENSER, RUBRIKER } from './gemensamt'

/** Student: utbildning och projekt först, cyan linje under huvudet. */
export const student: WordMallDef = {
  id: 'student-startup',
  namn: 'Student',
  typsnitt: 'Calibri',
  storlek: 11,
  marginal: { topp: 24, sida: 24, botten: 22 },
  farg: { text: '1F2937', rubrik: '0F172A', dampad: '475569', yrkestitel: '0891B2', arbetsgivare: '475569', period: '0891B2' },
  huvud: { justering: 'vanster', namnPt: 21, yrkestitelPt: 11, yrkestitelFet: true, kontaktPt: 9.5, linje: { farg: '0891B2', pt: 1.5 } },
  rubrik2: { justering: 'vanster', pt: 8.5, sparrning: 1.3, farg: '0F172A', underkant: { farg: 'E5E7EB', pt: 0.75 } },
  posttitelPt: 11,
  arbetsgivareFet: false,
  punkt: { tecken: '•', farg: '0891B2' },
  sektioner: ['profil', 'utbildning', 'projekt', 'erfarenhet', 'kompetenser', 'sprak', 'certifieringar'],
  rubriker: { ...RUBRIKER, erfarenhet: 'Praktik & arbetslivserfarenhet' },
  kompetensForm: 'rad',
  utbildningDetaljer: true,
  utbildningPagaende: true,
  sortera: true,
  referenser: { text: REFERENSER, justering: 'centrerad', kursiv: false, linje: { farg: 'E5E7EB', pt: 0.75 } },
}
