/** 37. Sigill: Premium, bara PDF. Lora, monogramring med initialerna, spärrade versala accentrubriker (utbud 2, 3.37). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const sigill: MallDef = {
  ...franKatalog('sigill'),
  typsnitt: { brod: 'lora' },
  grad: { brod: 10.5, namn: 28, titel: 11.5, kontakt: 9.5, rubrik: 10, posttitel: 10.5, period: 9.5 },
  radavstand: 1.36,
  sida: { topp: 20, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D8D3CC', arbetsgivare: '#333333' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 500, farg: '#111111' },
    titel: { kursiv: true, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    linjeUnder: { pt: 0.5, farg: '#D8D3CC', luft: 4 },
    monogram: { mm: 18, linje: { pt: 0.75, farg: 'accent' }, pt: 11, vikt: 600, sparrning: 0.08, luft: 6 },
    luftUnder: 7,
  },
  rubrik: {
    vikt: 600,
    versaler: true,
    sparrning: 0.12,
    farg: 'accent',
    linje: { var: 'under', pt: 0.5, farg: '#D8D3CC', luft: 1 },
    luftOver: 6,
    luftUnder: 2.5,
  },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#333333' }, periodKursiv: true, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  extraCss: `.posttitel{font-weight:600}`,
}
