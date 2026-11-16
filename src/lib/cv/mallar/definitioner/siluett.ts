/** 16. Siluett: Premium, bara PDF. Lato light, rund fotoplats centrerad, centrerade rubriker (spec 3.16). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, STANDARD_ORDNING } from './gemensamt'

export const siluett: MallDef = {
  ...franKatalog('siluett'),
  typsnitt: { brod: 'lato' },
  grad: { brod: 10, namn: 30, titel: 10.5, kontakt: 9.5, rubrik: 10, posttitel: 10, period: 9 },
  radavstand: 1.4,
  sida: { topp: 12, hoger: 22, botten: 18, vanster: 22 },
  farger: { text: '#2A2A2A', dampad: '#666666', linje: '#D0D0D0', arbetsgivare: '#555555' },
  huvud: {
    form: 'centrerad',
    namn: { vikt: 300, farg: '#1A1A1A' },
    titel: { vikt: 700, versaler: true, sparrning: 0.1, farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1.5,
    luftKontakt: 2,
    linjeUnder: { pt: 0.5, farg: 'linje', luft: 5 },
    luftUnder: 5,
  },
  rubrik: { vikt: 700, versaler: true, sparrning: 0.1, farg: 'accent', justering: 'centrerad', luftOver: 4.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.5 },
  punkt: { tecken: '•', farg: 'accent', indrag: 4.5 },
  kompetenser: 'mittpunkt',
  intyg: 'rad',
  sprak: 'rad',
  foto: { form: 'rund', storlek: 36, plats: 'huvud-topp', forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  extraCss: `
.typ-kompetenser .grupp-mitt,.sprakrad,.avsnitt-profil .text,.avsnitt-intressen .rad{text-align:center}`,
}
