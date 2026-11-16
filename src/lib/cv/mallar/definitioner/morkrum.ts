/** 13. Mörkrum: Premium, bara PDF. Nästan svart huvudblock med rund fotoplats, accentkvadrater vid rubrikerna (spec 3.13). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, STANDARD_ORDNING } from './gemensamt'

export const morkrum: MallDef = {
  ...franKatalog('morkrum'),
  typsnitt: { brod: 'poppins' },
  grad: { brod: 9.5, namn: 34, titel: 13, kontakt: 9, rubrik: 10, posttitel: 9.5, period: 8.5 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 20, botten: 18, vanster: 20 },
  farger: { text: '#222222', dampad: '#666666', linje: '#D9D9DC', arbetsgivare: '#555555' },
  huvud: {
    form: 'band',
    namn: { vikt: 600, sparrning: -0.01, farg: 'vit' },
    titel: { vikt: 300, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 3,
    band: { bakgrund: '#141416', text: 'vit', luft: { topp: 18, sidor: 20, botten: 12 }, minHojd: 72 },
    luftUnder: 8,
  },
  rubrik: { vikt: 600, versaler: true, sparrning: 0.04, farg: '#141416', kvadrat: { mm: 2.2, farg: 'accent', luft: 2.5 }, luftOver: 5.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'text', indrag: 4.5 },
  kompetenser: 'grupp',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 40, plats: 'huvud-hoger', forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  extraCss: `
.huvud-band .titel{color:var(--accent)}
.huvud-band .kontakt,.huvud-band .prick{color:rgba(255,255,255,0.75)}
.huvud-band{align-items:flex-start}
.posttitel{font-weight:600}`,
}
