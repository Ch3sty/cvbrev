/** 14. Terrakotta: Premium, bara PDF. Lato på krämfärgad sida, roströda rubriker med kort linje, kompetenser som brickor (spec 3.14). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, KOMPETENSER_FORE } from './gemensamt'

export const terrakotta: MallDef = {
  ...franKatalog('terrakotta'),
  typsnitt: { brod: 'lato' },
  grad: { brod: 10, namn: 30, titel: 12, kontakt: 9.5, rubrik: 10.5, posttitel: 10, period: 9 },
  radavstand: 1.4,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#3B2A20', dampad: '#6E5A4C', linje: '#D9CBBB', arbetsgivare: '#6E5A4C', sida: '#F6EFE6' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#3B2A20' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2.5,
    luftUnder: 6,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.06,
    farg: 'accent',
    linje: { var: 'under', pt: 1, farg: 'accent', luft: 1, langd: 18 },
    luftOver: 6,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#6E5A4C' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'accent', indrag: 4.5 },
  kompetenser: 'brickor',
  intyg: 'rad',
  sprak: 'rad',
  ordning: KOMPETENSER_FORE,
  enSida: EN_SIDA,
}
