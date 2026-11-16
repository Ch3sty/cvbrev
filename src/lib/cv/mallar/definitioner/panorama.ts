/** 36. Panorama: Premium, bara PDF. Tonat band till kant med stående foto i vänsterkanten, Lora-namn, understrukna rubriker (utbud 2, 3.36). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const panorama: MallDef = {
  ...franKatalog('panorama'),
  typsnitt: { brod: 'open-sans', rubrik: 'lora', titel: 'lora' },
  grad: { brod: 9.5, namn: 32, titel: 13, kontakt: 9, rubrik: 11.5, posttitel: 9.5, period: 9 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: 'accent' },
  huvud: {
    form: 'band',
    namn: { vikt: 500, farg: '#111111', radavstand: 1.08 },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2.5,
    band: { bakgrund: 'ton', luft: { topp: 0, sidor: 20, botten: 0 }, minHojd: 48, fotoTillKant: true, utanFotoHojd: 48 },
    luftUnder: 8,
  },
  rubrik: { vikt: 600, farg: '#111111', understruken: { pt: 1, farg: 'accent', avstand: 1.2 }, luftOver: 6, luftUnder: 3 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: 'accent' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'staende', storlek: 44, hojd: 58, plats: 'band-vanster', luft: 10, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  extraCss: `.posttitel{font-weight:600}`,
}
