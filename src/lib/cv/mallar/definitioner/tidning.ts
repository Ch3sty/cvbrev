/** 18. Tidning: Premium, bara PDF. Georgia, namnet som tidningshuvud, profilen i två spalter med anfang (spec 3.18). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, STANDARD_ORDNING } from './gemensamt'

export const tidning: MallDef = {
  ...franKatalog('tidning'),
  typsnitt: { brod: 'georgia' },
  grad: { brod: 10.5, namn: 36, titel: 10, kontakt: 9, rubrik: 10, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 16, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1A1A1A', dampad: '#444444', linje: '#1A1A1A', arbetsgivare: '#333333' },
  huvud: {
    form: 'tidningshuvud',
    namn: { vikt: 400, farg: '#1A1A1A' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 0,
    luftKontakt: 0,
    luftUnder: 6,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.06,
    farg: '#1A1A1A',
    linje: { var: 'over', pt: 0.5, farg: '#1A1A1A', luft: 2 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { kursiv: true, farg: '#333333' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'text', indrag: 4.5 },
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  profilSpalter: true,
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
