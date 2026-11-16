/** 7. Årsring: Premium, PDF och Word. Årtalen i en 30 mm vänsterkolumn med lodrät accentlinje (spec 3.7). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const arsring: MallDef = {
  ...franKatalog('arsring'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 28, titel: 12, kontakt: 9.5, rubrik: 11, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444', period: 'accent' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 4,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    farg: 'accent',
    linje: { var: 'over', pt: 0.75, farg: 'accent', luft: 2 },
    indrag: 30,
    luftOver: 6,
    luftUnder: 2.5,
  },
  layout: { typ: 'marginalperiod', bredd: 30, lodrat: { pt: 0.75, farg: 'accent', luft: 4 }, indragAvsnitt: true },
  post: { arbetsgivare: { farg: '#444444' }, periodFet: true, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'marginal',
  intyg: 'marginal',
  sprak: 'marginal',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
