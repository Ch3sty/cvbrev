/** 24. Sand: Premium, PDF och Word. Sandfärgad högerpanel med runt foto överst, rubriker utan linje, hårlinje mellan posterna (utbud 2, 3.24). */
/*
 * Sidospalt: spaltens höjd på sida 1 sätts av minhöjdsskriptet i render/html.ts
 * (flytande spalt, granskningsvarv 2 av utbud 2). När spaltmallens mått ändras
 * körs scripts/mallar-spaltytor.ts i samma steg som scripts/mallbilder.ts.
 */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT } from './gemensamt'

export const sand: MallDef = {
  ...franKatalog('sand'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 28, titel: 11.5, kontakt: 8.5, rubrik: 10.5, posttitel: 10.5, period: 9.5, sidospalt: 9.5 },
  radavstand: 1.32,
  sida: { topp: 15, hoger: 15, botten: 15, vanster: 15 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#DAD4C8', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'lista',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 7,
  },
  rubrik: { vikt: 700, versaler: true, sparrning: 0.05, farg: 'accent', luftOver: 5.5, luftUnder: 2.5 },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'hoger',
      bredd: 60,
      bakgrund: '#F2EDE4',
      rubrik: { vikt: 700, versaler: true, sparrning: 0.05, farg: 'accent', pt: 9.5 },
      luft: { topp: 7, inre: 6 },
      mellanrum: 8,
      kontakt: true,
      sektioner: ['kompetenser', 'sprak', 'intressen'],
    },
  },
  post: { arbetsgivare: { farg: '#444444' }, linjeMellan: { pt: 0.5, farg: '#DAD4C8' }, luftMellan: 3.5 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  kompetenserISpalt: 'lista',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 34, plats: 'sidospalt-topp', justering: 'centrerad', forval: true },
  ordning: ['profil', 'erfarenhet', 'utbildning', 'intyg', 'projekt', 'referenser'],
  enSida: EN_SIDA,
}
