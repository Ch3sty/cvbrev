/** 34. Ek: Premium, PDF och Word. Arial, vänsterspalt utan bakgrund skild med lodrät accentlinje, stort foto överst i spalten (utbud 2, 3.34). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT } from './gemensamt'

export const ek: MallDef = {
  ...franKatalog('ek'),
  typsnitt: { brod: 'arial' },
  grad: { brod: 10, namn: 26, titel: 11, kontakt: 8.5, rubrik: 11, posttitel: 10, period: 9, sidospalt: 9.5 },
  radavstand: 1.34,
  sida: { topp: 16, hoger: 16, botten: 16, vanster: 16 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'lista',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 7,
  },
  rubrik: { vikt: 700, farg: 'accent', luftOver: 5.5, luftUnder: 2.5 },
  layout: {
    typ: 'sidospalt',
    spalt: {
      sida: 'vanster',
      // 16 mm sidmarginal och en 56 mm spalt som i skissen (docs/qa/mallar-2-avvikelser.md).
      bredd: 72,
      linje: { pt: 0.75, farg: 'accent' },
      rubrik: { vikt: 700, farg: 'accent', pt: 10 },
      luft: { topp: 0, inre: 6 },
      mellanrum: 8,
      kontakt: true,
      sektioner: ['kompetenser', 'sprak', 'intressen'],
    },
  },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  kompetenserISpalt: 'lista',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'kvadrat', storlek: 44, plats: 'sidospalt-topp', justering: 'vanster', forval: true },
  ordning: ['profil', 'erfarenhet', 'utbildning', 'intyg', 'projekt', 'referenser'],
  enSida: EN_SIDA,
}
