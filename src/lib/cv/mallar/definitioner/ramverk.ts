/** 26. Ramverk: Premium, PDF och Word. Garamond, 0,5 pt ram runt sidan 8 mm innanför kanten, centrerat namn (utbud 2, 3.26). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const ramverk: MallDef = {
  ...franKatalog('ramverk'),
  typsnitt: { brod: 'garamond' },
  grad: { brod: 11, namn: 32, titel: 13, kontakt: 10, rubrik: 11.5, posttitel: 11, period: 10 },
  radavstand: 1.3,
  sida: { topp: 20, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#C8C8C8', arbetsgivare: '#333333' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 400, farg: '#111111' },
    titel: { kursiv: true, farg: '#555555' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 7,
  },
  rubrik: { vikt: 400, versaler: true, sparrning: 0.12, farg: 'accent', luftOver: 6.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { kursiv: true, farg: '#333333' }, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  sidram: { pt: 0.5, farg: 'accent', avstand: 8 },
}
