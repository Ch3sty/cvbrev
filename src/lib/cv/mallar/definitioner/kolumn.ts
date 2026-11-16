/** 6. Kolumn: Premium, PDF och Word. Garamond, rubrikerna i en 42 mm vänsterkolumn (spec 3.6). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { PUNKT, STANDARD_ORDNING } from './gemensamt'

export const kolumn: MallDef = {
  ...franKatalog('kolumn'),
  typsnitt: { brod: 'garamond' },
  grad: { brod: 11, namn: 30, titel: 13, kontakt: 10, rubrik: 12, posttitel: 11, period: 10 },
  radavstand: 1.3,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#C8C8C8', arbetsgivare: '#333333' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.5, farg: '#1F2328', luft: 4 },
    luftUnder: 6,
  },
  rubrik: { vikt: 700, farg: 'accent', luftOver: 3.5, luftUnder: 0 },
  layout: { typ: 'marginalrubrik', bredd: 42, linjeOver: { pt: 0.5, farg: '#C8C8C8', luft: 2.5 } },
  post: { arbetsgivare: { kursiv: true, farg: '#333333' }, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: { grad: -0.5, marginal: 4, luftOver: 2.5 },
}
