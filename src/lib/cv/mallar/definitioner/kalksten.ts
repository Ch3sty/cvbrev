/** 4. Kalksten: Premium, PDF och Word. Ljusgrå vänsterspalt med intygsfält och kvadratiskt foto (spec 3.4). */
/*
 * Sidospalt: spaltens höjd på sida 1 sätts av minhöjdsskriptet i render/html.ts
 * (flytande spalt, granskningsvarv 2 av utbud 2). När spaltmallens mått ändras
 * körs scripts/mallar-spaltytor.ts i samma steg som scripts/mallbilder.ts.
 */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, HUVUDSPALT, PUNKT } from './gemensamt'

export const kalksten: MallDef = {
  ...franKatalog('kalksten'),
  typsnitt: { brod: 'calibri', rubrik: 'georgia' },
  grad: { brod: 10.5, namn: 28, titel: 11.5, kontakt: 8.5, rubrik: 13, posttitel: 10.5, period: 9.5, sidospalt: 9.5 },
  radavstand: 1.32,
  sida: { topp: 15, hoger: 15, botten: 15, vanster: 15 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#BFC5CC', arbetsgivare: '#333333' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 400, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'lista',
    luftTitel: 1.5,
    luftKontakt: 2,
    luftUnder: 7,
  },
  rubrik: { vikt: 400, farg: 'accent', linje: { var: 'under', pt: 0.5, farg: 'linje', luft: 1 }, luftOver: 5.5, luftUnder: 2.5 },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'vanster',
      bredd: 58,
      bakgrund: '#EEF0F2',
      rubrik: { vikt: 400, farg: 'accent', pt: 11, linje: { pt: 0.5, farg: '#BFC5CC', luft: 1 } },
      luft: { topp: 7, inre: 6 },
      mellanrum: 8,
      kontakt: true,
      sektioner: ['intyg', 'kompetenser', 'sprak', 'intressen'],
      intygsfalt: { kant: { pt: 0.5, farg: '#C9CED6' }, bakgrund: '#FFFFFF', luft: 2.5 },
    },
  },
  post: { arbetsgivare: { farg: '#333333' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  kompetenserISpalt: 'mittpunkt',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'kvadrat', storlek: 38, plats: 'huvud-vanster', forval: true },
  ordning: HUVUDSPALT,
  enSida: EN_SIDA,
}
