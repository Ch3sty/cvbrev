/** 27. Index: Premium, PDF och Word. Numrerade avsnitt med Georgia-siffra, Georgia-namn med linje under huvudet (utbud 2, 3.27). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const index: MallDef = {
  ...franKatalog('index'),
  typsnitt: { brod: 'calibri', namn: 'georgia' },
  grad: { brod: 10.5, namn: 28, titel: 12, kontakt: 9.5, rubrik: 10.5, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.5, farg: '#1F2328', luft: 4 },
    luftUnder: 6.5,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.06,
    farg: '#111111',
    linje: { var: 'under', pt: 0.5, farg: '#D5D9DE', luft: 1.5 },
    nummer: { typsnitt: 'georgia', pt: 18, farg: 'accent', luft: 3 },
    luftOver: 6.5,
    luftUnder: 3,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
