/** 23. Valv: Premium, PDF och Word. Georgia, centrerat huvud med kort accentlinje, rubriker med hårlinje efter texten (utbud 2, 3.23). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const valv: MallDef = {
  ...franKatalog('valv'),
  typsnitt: { brod: 'georgia' },
  grad: { brod: 10.5, namn: 28, titel: 11.5, kontakt: 9.5, rubrik: 12.5, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#C9C4CC', arbetsgivare: '#333333' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 400, farg: '#111111' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2,
    linjeUnder: { pt: 1, farg: 'accent', luft: 4, langd: 18 },
    luftUnder: 7,
  },
  rubrik: { vikt: 400, farg: 'accent', linjeEfter: { pt: 0.5, farg: '#C9C4CC', luft: 3, hojd: 1 }, luftOver: 6, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#333333' }, periodKursiv: true, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
