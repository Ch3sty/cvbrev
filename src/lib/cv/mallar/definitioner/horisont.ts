/** 20. Horisont: Premium, bara PDF. Open Sans, horisontell tidsaxel under huvudet (spec 3.20). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, STANDARD_ORDNING } from './gemensamt'

export const horisont: MallDef = {
  ...franKatalog('horisont'),
  typsnitt: { brod: 'open-sans' },
  grad: { brod: 9.5, namn: 28, titel: 11.5, kontakt: 9, rubrik: 10.5, posttitel: 9.5, period: 8.5 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 600, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 4,
  },
  rubrik: { vikt: 700, farg: 'accent', luftOver: 5.5, luftUnder: 2 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'text', indrag: 4.5 },
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  tidsaxel: true,
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
