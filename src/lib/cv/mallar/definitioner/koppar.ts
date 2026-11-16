/** 3. Koppar: Premium, PDF och Word. Färgat huvudband med vit text och rund fotoplats (spec 3.3). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const koppar: MallDef = {
  ...franKatalog('koppar'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 28, titel: 12, kontakt: 9.5, rubrik: 10.5, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'band',
    namn: { vikt: 700, farg: 'vit' },
    titel: { farg: 'vit' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2.5,
    band: { bakgrund: 'accent', text: 'vit', luft: { topp: 14, sidor: 20, botten: 12 }, minHojd: 48 },
    luftUnder: 8,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.04,
    farg: 'accent',
    linje: { var: 'under', pt: 0.75, farg: 'accent', luft: 0.8 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 30, plats: 'huvud-hoger', forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
