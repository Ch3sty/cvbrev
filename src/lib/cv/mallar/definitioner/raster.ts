/** 10. Raster: Premium, PDF och Word. Verdana, rubriker som tonade band, kompetenser i två spalter (spec 3.10). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, KOMPETENSER_FORE, PUNKT } from './gemensamt'

export const raster: MallDef = {
  ...franKatalog('raster'),
  typsnitt: { brod: 'verdana' },
  grad: { brod: 9.5, namn: 24, titel: 11, kontakt: 8.5, rubrik: 10, posttitel: 9.5, period: 8.5 },
  radavstand: 1.36,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444', tonAndel: 0.8 },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 5,
  },
  rubrik: { vikt: 700, farg: 'accent', band: { bakgrund: 'ton', lodratt: 1.3, sidor: 3 }, luftOver: 5.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'spalter',
  intyg: 'rad',
  sprak: 'rad',
  ordning: KOMPETENSER_FORE,
  enSida: EN_SIDA,
}
