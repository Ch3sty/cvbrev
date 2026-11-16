/** 32. Not: Premium, PDF och Word. Kompakt Calibri 9,5 pt, namn och kontakt på samma rad, kompetenser i tre spalter (utbud 2, 3.32). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { KOMPETENSER_FORE, PUNKT } from './gemensamt'

export const not: MallDef = {
  ...franKatalog('not'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 9.5, namn: 20, titel: 10.5, kontakt: 9, rubrik: 9, posttitel: 9.5, period: 8.5 },
  radavstand: 1.28,
  sida: { topp: 14, hoger: 16, botten: 14, vanster: 16 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'delad',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'lista',
    kontaktKolumner: 2,
    kontaktLage: 'botten',
    luftTitel: 0.5,
    luftKontakt: 0,
    linjeUnder: { pt: 0.5, farg: '#1F2328', luft: 3 },
    luftUnder: 5,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.06,
    farg: 'accent',
    linje: { var: 'under', pt: 0.5, farg: '#D5D9DE', luft: 0.8 },
    luftOver: 4.5,
    luftUnder: 2,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 2.5 },
  punkt: PUNKT,
  kompetenser: 'spalter',
  kompetensSpalter: 3,
  intyg: 'rad',
  sprak: 'rad',
  ordning: KOMPETENSER_FORE,
  // Redan tät: marginalen minus 2 mm, inte 4.
  enSida: { grad: -0.5, marginal: 2, luftOver: 4 },
}
