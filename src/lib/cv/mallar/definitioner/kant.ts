/** 39. Kant: Premium, bara PDF. Open Sans, 10 mm accentremsa längs vänsterkanten, runt foto ovanför namnet (utbud 2, 3.39). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const kant: MallDef = {
  ...franKatalog('kant'),
  typsnitt: { brod: 'open-sans' },
  grad: { brod: 9.5, namn: 28, titel: 11.5, kontakt: 9, rubrik: 10.5, posttitel: 9.5, period: 9 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 24 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 7,
  },
  rubrik: { vikt: 700, farg: 'accent', luftOver: 6, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 36, plats: 'huvud-topp-vanster', luft: 5, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  sidoremsa: { mm: 10, farg: 'accent' },
}
