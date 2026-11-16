/** 12. Stål: Premium, PDF och Word. Profil i full bredd, sedan 60/40-spalter utan panel (spec 3.12). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, HUVUDSPALT, PUNKT } from './gemensamt'

export const stal: MallDef = {
  ...franKatalog('stal'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 28, titel: 12, kontakt: 9.5, rubrik: 11, posttitel: 10.5, period: 9.5, sidospalt: 10 },
  radavstand: 1.32,
  sida: { topp: 18, hoger: 18, botten: 18, vanster: 18 },
  farger: { text: '#1F2328', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#444444' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 700, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 5,
  },
  rubrik: {
    vikt: 700,
    versaler: true,
    farg: '#111111',
    linje: { var: 'over', pt: 2, farg: 'accent', luft: 2 },
    luftOver: 6,
    luftUnder: 2.5,
  },
  layout: {
    typ: 'tvaspalt',
    fullBredd: ['profil'],
    vanster: ['erfarenhet', 'utbildning', 'projekt', 'referenser'],
    hoger: ['kompetenser', 'intyg', 'sprak', 'intressen'],
    vansterAndel: 0.6,
    mellanrum: 8,
  },
  post: { arbetsgivare: { farg: '#444444' }, luftMellan: 3.8 },
  punkt: PUNKT,
  kompetenser: 'grupp',
  kompetenserISpalt: 'lista',
  intyg: 'lista',
  sprak: 'lista',
  ordning: HUVUDSPALT,
  enSida: EN_SIDA,
}
