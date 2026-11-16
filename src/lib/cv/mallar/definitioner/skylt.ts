/** 28. Skylt: Premium, PDF och Word. Smal accentremsa med kontakten, stort namn på vitt, rubriker som fyllda band (utbud 2, 3.28). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const skylt: MallDef = {
  ...franKatalog('skylt'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 30, titel: 11.5, kontakt: 9, rubrik: 10, posttitel: 10, period: 9 },
  radavstand: 1.34,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'remsa',
    namn: { vikt: 700, farg: '#111111', radavstand: 1.05, exakt: true },
    titel: { vikt: 700, versaler: true, sparrning: 0.04, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 2,
    luftKontakt: 0,
    remsa: { hojd: 12, bakgrund: 'accent', text: 'vit', sidor: 20, luft: 10 },
    luftUnder: 7,
  },
  rubrik: { vikt: 700, versaler: true, sparrning: 0.06, farg: 'vit', band: { bakgrund: 'accent', lodratt: 1.2, sidor: 3 }, luftOver: 6, luftUnder: 3 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
