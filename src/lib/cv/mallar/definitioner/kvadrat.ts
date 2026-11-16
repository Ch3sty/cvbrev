/** 15. Kvadrat: Premium, bara PDF. Poppins i rutnät, namnet i färgad kvadrat, vänsterkolumn med hårlinje (spec 3.15). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, HUVUDSPALT } from './gemensamt'

export const kvadrat: MallDef = {
  ...franKatalog('kvadrat'),
  typsnitt: { brod: 'poppins' },
  grad: { brod: 9.5, namn: 20, titel: 13, kontakt: 9, rubrik: 9.5, posttitel: 9.5, period: 8.5, sidospalt: 9 },
  radavstand: 1.4,
  sida: { topp: 14, hoger: 18, botten: 18, vanster: 14 },
  farger: { text: '#222222', dampad: '#666666', linje: '#C8C8CC', arbetsgivare: '#555555' },
  huvud: {
    form: 'block-vanster',
    namn: { vikt: 600, farg: 'vit', radavstand: 1.15 },
    titel: { vikt: 600, farg: '#222222' },
    kontakt: 'lista',
    luftTitel: 0,
    luftKontakt: 2,
    block: { storlek: 56, bakgrund: 'accent', text: 'vit', luft: 5 },
    luftUnder: 7,
  },
  rubrik: { vikt: 600, versaler: true, sparrning: 0.06, farg: 'accent', luftOver: 5.5, luftUnder: 2 },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'vanster',
      bredd: 70,
      luft: { topp: 0, inre: 5 },
      mellanrum: 8,
      kontakt: false,
      sektioner: ['kompetenser', 'intyg', 'sprak', 'intressen'],
    },
  },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'accent', indrag: 4 },
  kompetenser: 'grupp',
  kompetenserISpalt: 'lista',
  intyg: 'rad',
  sprak: 'rad',
  ordning: HUVUDSPALT,
  enSida: EN_SIDA,
  extraCss: `
.spalt-sido{border-right:0.5pt solid #C8C8CC}
.huvud-block .kontakt{display:block}
.posttitel{font-weight:600}`,
}
