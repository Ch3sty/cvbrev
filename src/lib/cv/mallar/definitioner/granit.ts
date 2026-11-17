/** 5. Granit: Premium, PDF och Word. Mörkt huvudband som fortsätter i mörk högerspalt (spec 3.5). */
/*
 * Sidospalt: spaltens höjd på sida 1 sätts av minhöjdsskriptet i render/html.ts
 * (flytande spalt, granskningsvarv 2 av utbud 2). När spaltmallens mått ändras
 * körs scripts/mallar-spaltytor.ts i samma steg som scripts/mallbilder.ts.
 */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, HUVUDSPALT, PUNKT } from './gemensamt'

export const granit: MallDef = {
  ...franKatalog('granit'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 26, titel: 11, kontakt: 8.5, rubrik: 10.5, posttitel: 10, period: 9, sidospalt: 9.5 },
  radavstand: 1.34,
  sida: { topp: 15, hoger: 15, botten: 15, vanster: 15 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#333333' },
  huvud: {
    form: 'band',
    namn: { vikt: 700, farg: 'vit' },
    titel: { farg: 'vit' },
    kontakt: 'lista',
    luftTitel: 1,
    luftKontakt: 2,
    band: { bakgrund: 'accent', text: 'vit', luft: { topp: 15, sidor: 15, botten: 9 }, minHojd: 42 },
    luftUnder: 0,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    farg: 'accent',
    linje: { var: 'under', pt: 0.75, farg: 'accent', luft: 1 },
    luftOver: 5.5,
    luftUnder: 2.5,
  },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'hoger',
      bredd: 58,
      bakgrund: 'accent',
      text: 'vit',
      rubrik: { vikt: 700, versaler: true, farg: 'vit', pt: 9, linje: { pt: 0.5, farg: '#8A8D93', luft: 1 } },
      luft: { topp: 7, inre: 6 },
      mellanrum: 8,
      kontakt: true,
      sektioner: ['intyg', 'kompetenser', 'sprak', 'intressen'],
      intygsfalt: { kant: { pt: 0.5, farg: '#8A8D93' }, luft: 2.5 },
    },
  },
  post: { arbetsgivare: { farg: '#333333' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  kompetenserISpalt: 'mittpunkt',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 30, plats: 'huvud-hoger', forval: true },
  ordning: HUVUDSPALT,
  enSida: EN_SIDA,
}
