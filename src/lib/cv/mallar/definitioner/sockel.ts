/** 35. Sockel: Premium, bara PDF. Montserrat-namn, Lato, mörk sockel nederst på varje sida med kontakt och språk (utbud 2, 3.35). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const sockel: MallDef = {
  ...franKatalog('sockel'),
  typsnitt: { brod: 'lato', rubrik: 'montserrat' },
  grad: { brod: 10, namn: 32, titel: 12, kontakt: 9, rubrik: 9.5, posttitel: 10, period: 9 },
  radavstand: 1.4,
  // Bottenmarginalen rymmer sockeln på varje sida.
  sida: { topp: 22, hoger: 20, botten: 44, vanster: 20 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 600, sparrning: -0.01, farg: '#111111', radavstand: 1.05 },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 2,
    luftKontakt: 0,
    luftUnder: 8,
  },
  rubrik: {
    vikt: 600,
    versaler: true,
    sparrning: 0.1,
    farg: 'accent',
    linje: { var: 'under', pt: 0.75, farg: '#D5D9DE', luft: 1 },
    luftOver: 6,
    luftUnder: 3,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  sockel: { hojd: 26, bakgrund: 'accent', text: 'vit', luft: { lodratt: 5, sidor: 20 }, sektioner: ['sprak'] },
}
