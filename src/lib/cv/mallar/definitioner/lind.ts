/** 21. Lind: Premium, PDF och Word. Georgia-brödtext, små versala Calibri-rubriker utan linjer, linje ovanför namnet (utbud 2, 3.21). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const lind: MallDef = {
  ...franKatalog('lind'),
  typsnitt: { brod: 'georgia', namn: 'georgia', rubrik: 'calibri', titel: 'calibri', kontakt: 'calibri' },
  grad: { brod: 10.5, namn: 24, titel: 10.5, kontakt: 9.5, rubrik: 9.5, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#333333' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111', radavstand: 1.1 },
    titel: { vikt: 700, versaler: true, sparrning: 0.08, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2,
    linjeOver: { pt: 0.5, farg: '#1F2328', luft: 4 },
    luftUnder: 6.5,
  },
  rubrik: { vikt: 700, versaler: true, sparrning: 0.1, farg: 'accent', luftOver: 6.5, luftUnder: 2 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#333333' }, periodPlats: 'efter-arbetsgivare', luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
