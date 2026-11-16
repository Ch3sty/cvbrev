/** 22. Alm: Premium, PDF och Word. Delat huvud med rundat foto, kontakten högerställd, understrukna rubriker (utbud 2, 3.22). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const alm: MallDef = {
  ...franKatalog('alm'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 26, titel: 11.5, kontakt: 9, rubrik: 11, posttitel: 10.5, period: 9.5 },
  radavstand: 1.32,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'delad',
    namn: { vikt: 700, farg: '#111111', radavstand: 1.1, exakt: true },
    titel: { farg: 'accent' },
    kontakt: 'lista',
    luftTitel: 1,
    luftKontakt: 0,
    linjeUnder: { pt: 1.5, farg: 'accent', luft: 5 },
    luftUnder: 6,
  },
  rubrik: { vikt: 700, farg: '#111111', understruken: { pt: 1, farg: 'accent', avstand: 1.2 }, luftOver: 6, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rundad', storlek: 30, plats: 'huvud-vanster', luft: 6, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
}
