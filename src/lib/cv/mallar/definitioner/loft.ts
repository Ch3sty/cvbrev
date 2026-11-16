/** 29. Loft: Premium, PDF och Word. Breda marginaler, namn 36 pt, runt foto höger, små grå versala rubriker (utbud 2, 3.29). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const loft: MallDef = {
  ...franKatalog('loft'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 11, namn: 36, titel: 12, kontakt: 9.5, rubrik: 9.5, posttitel: 11, period: 9.5 },
  radavstand: 1.34,
  sida: { topp: 26, hoger: 26, botten: 22, vanster: 26 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444', period: 'accent' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, sparrning: -0.01, farg: '#111111', radavstand: 1.05, exakt: true },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 2,
    luftKontakt: 2.5,
    luftUnder: 8,
  },
  rubrik: { vikt: 700, versaler: true, sparrning: 0.14, farg: '#777777', luftOver: 7, luftUnder: 3 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 4.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 32, plats: 'huvud-hoger', luft: 8, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
