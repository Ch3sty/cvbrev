/** 33. Spår: Premium, PDF och Word. Prickad tidslinje med en punkt per post i erfarenhet och utbildning (utbud 2, 3.33). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const spar: MallDef = {
  ...franKatalog('spar'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 28, titel: 12, kontakt: 9.5, rubrik: 11, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 20, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 6,
  },
  rubrik: { vikt: 700, versaler: true, farg: 'accent', luftOver: 6, luftUnder: 2.5 },
  layout: { typ: 'marginalprick', kolumn: 9, indrag: 14, linje: { pt: 1, farg: 'accent' }, punkt: 2.6, sektioner: ['erfarenhet', 'utbildning'] },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 4 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
