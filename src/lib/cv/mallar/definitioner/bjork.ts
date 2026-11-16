/** 2. Björk: gratis, PDF och Word. Centrerat huvud med rund fotoplats (spec 3.2). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const bjork: MallDef = {
  ...franKatalog('bjork'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 24, titel: 11, kontakt: 9, rubrik: 11, posttitel: 10, period: 9 },
  radavstand: 1.34,
  sida: { topp: 16, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: 'accent' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 700, farg: '#111111' },
    titel: { vikt: 700, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.75, farg: 'linje', luft: 5 },
    luftUnder: 5,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    farg: '#111111',
    linje: { var: 'vanster', pt: 3, farg: 'accent', luft: 3 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: 'accent' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'mittpunkt',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 26, plats: 'huvud-topp', forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
