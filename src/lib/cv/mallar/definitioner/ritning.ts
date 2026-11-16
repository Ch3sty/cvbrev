/** 17. Ritning: Premium, bara PDF. Roboto, djupblå vänsterspalt i hela sidans höjd med namnet överst (spec 3.17). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA } from './gemensamt'

export const ritning: MallDef = {
  ...franKatalog('ritning'),
  typsnitt: { brod: 'roboto' },
  grad: { brod: 9.5, namn: 24, titel: 10.5, kontakt: 8.5, rubrik: 10.5, posttitel: 9.5, period: 8.5, sidospalt: 9 },
  radavstand: 1.4,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 14 },
  farger: { text: '#222222', dampad: '#666666', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 500, farg: 'vit', radavstand: 1.15 },
    titel: { vikt: 300, farg: 'vit' },
    kontakt: 'lista',
    luftTitel: 1.5,
    luftKontakt: 2,
    luftUnder: 6,
  },
  rubrik: {
    vikt: 500,
    versaler: true,
    sparrning: 0.06,
    farg: 'accent',
    linje: { var: 'under', pt: 0.5, farg: 'accent', luft: 1 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'vanster',
      bredd: 66,
      bakgrund: 'accent',
      text: 'vit',
      rubrik: { vikt: 500, versaler: true, sparrning: 0.08, farg: 'vit', pt: 9, linje: { pt: 0.5, farg: '#8EA3BF', luft: 1 } },
      luft: { topp: 0, inre: 7 },
      mellanrum: 9,
      kontakt: true,
      sektioner: ['kompetenser', 'sprak', 'intressen'],
      huvudISpalten: true,
    },
  },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: { tecken: '•', farg: 'accent', indrag: 4.5 },
  kompetenser: 'grupp',
  kompetenserISpalt: 'lista',
  intyg: 'rad',
  sprak: 'rad',
  ordning: ['profil', 'erfarenhet', 'utbildning', 'intyg', 'projekt', 'referenser'],
  enSida: EN_SIDA,
  // Spalten i hela sidans höjd på varje sida: en fast bakgrund i utskrift.
  extraCss: `
.spalt-sido .huvud{border-bottom:0.5pt solid rgba(255,255,255,0.5);padding-bottom:5mm}
.spalt-sido .titel{opacity:0.85}
.spalt-sido .huvud .namn{overflow-wrap:normal;word-break:normal}
.spalt-sido .lista li::marker{color:rgba(255,255,255,0.7)}
.posttitel{font-weight:500}
@media screen{.cv{background:linear-gradient(to right,var(--accent) 66mm,var(--sida) 66mm)}}
@media print{.cv::before{content:"";position:fixed;left:0;top:-30mm;bottom:-30mm;width:66mm;background:var(--accent);z-index:-1}}`,
}
