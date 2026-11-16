/** 40. Affisch: Premium, bara PDF. Montserrat-namn 44 pt i versaler på två rader, rubrikerna i en 40 mm vänsterkolumn (utbud 2, 3.40). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const affisch: MallDef = {
  ...franKatalog('affisch'),
  typsnitt: { brod: 'lato', rubrik: 'montserrat' },
  grad: { brod: 9.5, namn: 44, titel: 12, kontakt: 9, rubrik: 8.5, posttitel: 9.5, period: 9 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, versaler: true, sparrning: -0.02, farg: '#111111', radavstand: 0.95 },
    titel: { versaler: true, sparrning: 0.12, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 4,
    luftKontakt: 2,
    linjeUnder: { pt: 3, farg: 'accent', luft: 5 },
    namnRader: { antal: 2, minPt: 30 },
    luftUnder: 8,
  },
  rubrik: { vikt: 600, versaler: true, sparrning: 0.14, farg: 'accent', luftOver: 7, luftUnder: 0 },
  // 40 mm rubrikkolumn och 6 mm luft.
  layout: { typ: 'marginalrubrik', bredd: 46, mellanrum: 6 },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
