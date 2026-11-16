/** 30. Pergament: Premium, PDF och Word. Times New Roman, huvudet i dubbel ram, versalt namn, högerställda rubriker (utbud 2, 3.30). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const pergament: MallDef = {
  ...franKatalog('pergament'),
  typsnitt: { brod: 'times' },
  grad: { brod: 11, namn: 26, titel: 11, kontakt: 10, rubrik: 11.5, posttitel: 11, period: 10 },
  radavstand: 1.3,
  sida: { topp: 20, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#1F2328', dampad: '#444444', linje: '#999999', arbetsgivare: '#333333' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 400, versaler: true, sparrning: 0.05, farg: '#111111' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2,
    ram: { pt: 0.75, farg: 'accent', dubbel: true, luft: { lodratt: 5, sidor: 6 } },
    luftUnder: 7,
  },
  rubrik: {
    vikt: 700,
    farg: '#111111',
    justering: 'hoger',
    linje: { var: 'under', pt: 0.5, farg: '#999999', luft: 0.8 },
    luftOver: 6,
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
