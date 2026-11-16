/** 1. Linne: gratis, PDF och Word. Enspaltig klassisk (spec avsnitt 3.1). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { STANDARD_ORDNING } from './gemensamt'

export const linne: MallDef = {
  ...franKatalog('linne'),
  typsnitt: { brod: 'calibri', rubrik: 'georgia' },
  grad: { brod: 10.5, namn: 26, titel: 12, kontakt: 9.5, rubrik: 13, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#C9CED6', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2.5,
    luftUnder: 4,
  },
  rubrik: { vikt: 400, farg: 'accent', linje: { var: 'under', pt: 0.75, farg: 'linje', luft: 1 }, luftOver: 6, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 4 },
  punkt: { tecken: '•', farg: 'text', indrag: 4.5 },
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: { grad: -0.5, marginal: 4, luftOver: 4 },
}
