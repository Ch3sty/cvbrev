/** 9. Fasad: Premium, PDF och Word. Namnet i versaler bakom en 4 pt accentkant, kvadratiskt foto (spec 3.9). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const fasad: MallDef = {
  ...franKatalog('fasad'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 30, titel: 11, kontakt: 9.5, rubrik: 11, posttitel: 10, period: 9 },
  radavstand: 1.34,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, versaler: true, farg: '#111111', radavstand: 1.0 },
    titel: { vikt: 700, versaler: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 2.5,
    luftKontakt: 2,
    stapel: { pt: 4, farg: 'accent', indrag: 5 },
    luftUnder: 6,
  },
  rubrik: { vikt: 700, versaler: true, farg: 'accent', luftOver: 6.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'mittpunkt',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'kvadrat', storlek: 32, plats: 'huvud-hoger', forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
