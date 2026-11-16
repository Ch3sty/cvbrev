/** 11. Folio: Premium, PDF och Word. Garamond, högerställt huvud, kursiva rubriker, hårlinjer (spec 3.11). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const folio: MallDef = {
  ...franKatalog('folio'),
  typsnitt: { brod: 'garamond' },
  grad: { brod: 11.5, namn: 34, titel: 14, kontakt: 10, rubrik: 14, posttitel: 11.5, period: 10.5 },
  radavstand: 1.3,
  sida: { topp: 22, hoger: 22, botten: 20, vanster: 22 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#B0B0B0', arbetsgivare: '#333333' },
  huvud: {
    form: 'hoger',
    namn: { vikt: 400, farg: '#111111' },
    titel: { kursiv: true, farg: '#555555' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.5, farg: 'linje', luft: 4 },
    luftUnder: 5,
  },
  rubrik: { vikt: 400, kursiv: true, farg: 'accent', linje: { var: 'under', pt: 0.5, farg: 'linje', luft: 1 }, luftOver: 5.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { kursiv: true, farg: '#333333' }, periodKursiv: true, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
