/** 19. Tusch: Premium, bara PDF. Roboto monokrom, startåren stora och ljusgrå i en 34 mm vänsterkolumn (spec 3.19). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, STANDARD_ORDNING } from './gemensamt'

export const tusch: MallDef = {
  ...franKatalog('tusch'),
  typsnitt: { brod: 'roboto' },
  grad: { brod: 9.5, namn: 32, titel: 11, kontakt: 9, rubrik: 9, posttitel: 9.5, period: 9 },
  radavstand: 1.4,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#222222', dampad: '#666666', linje: '#D5D5D5', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 300, farg: '#1A1A1A' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 6,
  },
  rubrik: {
    vikt: 500,
    versaler: true,
    sparrning: 0.08,
    farg: '#6B6B6B',
    linje: { var: 'under', pt: 1, farg: 'accent', luft: 1.5, langd: 8 },
    luftOver: 6.5,
    luftUnder: 3,
  },
  layout: { typ: 'marginalperiod', bredd: 34, stortAr: { pt: 22, farg: '#B5B5B5', vikt: 300 }, indragAvsnitt: true },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 4 },
  punkt: { tecken: '•', farg: 'text', indrag: 4.5 },
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  extraCss: `.posttitel{font-weight:500}`,
}
