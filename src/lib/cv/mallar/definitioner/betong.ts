/** 31. Betong: Premium, PDF och Word. Verdana, ljusgrått band till kant med foto vänster, kort accentlinje ovanför rubrikerna (utbud 2, 3.31). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const betong: MallDef = {
  ...franKatalog('betong'),
  typsnitt: { brod: 'verdana' },
  grad: { brod: 9.5, namn: 24, titel: 11, kontakt: 8.5, rubrik: 10, posttitel: 9.5, period: 8.5 },
  radavstand: 1.36,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'band',
    namn: { vikt: 700, farg: '#111111', radavstand: 1.1 },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2.5,
    // Bandet är alltid ljusgrått med mörk text, aldrig accent.
    band: { bakgrund: '#E6E6E3', luft: { topp: 14, sidor: 20, botten: 12 }, minHojd: 52 },
    luftUnder: 8,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    farg: '#222222',
    linje: { var: 'over', pt: 1.5, farg: 'accent', luft: 2, langd: 12 },
    luftOver: 6,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'kvadrat', storlek: 34, plats: 'band-vanster', luft: 8, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
