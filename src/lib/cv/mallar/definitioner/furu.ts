/** 25. Furu: Premium, PDF och Word. Arial, perioderna i en 30 mm högerkolumn, rubriker med linje i full bredd (utbud 2, 3.25). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const furu: MallDef = {
  ...franKatalog('furu'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 28, titel: 11, kontakt: 9, rubrik: 11, posttitel: 10, period: 9 },
  radavstand: 1.34,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 5,
  },
  rubrik: { vikt: 700, farg: 'accent', linje: { var: 'under', pt: 0.75, farg: 'accent', luft: 1 }, luftOver: 6, luftUnder: 3 },
  // 34 mm: 4 mm luft och 30 mm periodkolumn.
  layout: { typ: 'marginalperiod', bredd: 34, indragAvsnitt: false, sida: 'hoger' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'marginal',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
