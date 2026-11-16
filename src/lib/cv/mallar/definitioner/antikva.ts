/** 8. Antikva: Premium, PDF och Word. Times New Roman, centrerat huvud med dubbel linje (spec 3.8). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const antikva: MallDef = {
  ...franKatalog('antikva'),
  typsnitt: { brod: 'times' },
  grad: { brod: 11, namn: 26, titel: 12, kontakt: 10, rubrik: 12, posttitel: 11, period: 10 },
  radavstand: 1.3,
  sida: { topp: 20, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#1F2328', dampad: '#444444', linje: '#999999', arbetsgivare: '#333333' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 400, farg: '#111111' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.75, farg: 'accent', luft: 3, dubbel: true },
    luftUnder: 5,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    sparrning: 0.06,
    farg: '#111111',
    justering: 'centrerad',
    linje: { var: 'under', pt: 0.5, farg: 'linje', luft: 1 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { kursiv: true, farg: '#333333' }, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
