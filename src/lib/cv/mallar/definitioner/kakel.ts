/** 38. Kakel: Premium, bara PDF. IBM Plex Sans, profilen och kompetenser, intyg och språk i tonade rutor (utbud 2, 3.38). */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'
import { EN_SIDA, PUNKT, STANDARD_ORDNING } from './gemensamt'

export const kakel: MallDef = {
  ...franKatalog('kakel'),
  typsnitt: { brod: 'ibm-plex-sans' },
  grad: { brod: 9.5, namn: 26, titel: 11, kontakt: 9, rubrik: 9.5, posttitel: 9.5, period: 8.5 },
  radavstand: 1.4,
  sida: { topp: 16, hoger: 16, botten: 16, vanster: 16 },
  farger: { text: '#222222', dampad: '#555555', linje: '#D5D9DE', arbetsgivare: '#555555' },
  huvud: {
    form: 'vanster',
    namn: { vikt: 600, farg: '#111111' },
    titel: { farg: 'accent' },
    kontakt: 'rad',
    luftTitel: 1,
    luftKontakt: 2,
    luftUnder: 6,
  },
  rubrik: { vikt: 600, versaler: true, sparrning: 0.08, farg: 'accent', luftOver: 5.5, luftUnder: 2.5 },
  layout: { typ: 'enspalt' },
  post: { arbetsgivare: { farg: '#555555' }, luftMellan: 3.8 },
  punkt: PUNKT,
  // Kompetenserna i rutan som grupper (granskningsvarv 1); intyg och språk som listor.
  kompetenser: 'grupp',
  intyg: 'lista',
  sprak: 'lista',
  foto: { form: 'kvadrat', storlek: 32, plats: 'huvud-vanster', luft: 7, forval: true },
  ordning: STANDARD_ORDNING,
  enSida: EN_SIDA,
  rutor: { ruta: ['profil'], rutnat: [['kompetenser', 'intyg'], ['intressen', 'sprak']], bakgrund: 'ton', luft: 5, mellanrum: 5 },
  // Intygen i rutan tätare (radavstånd 1,3 och 1 mm mellan), så att första rutraden ryms på sida 1 (granskningsvarv 1).
  extraCss: `.posttitel{font-weight:600}
.ruta .intyglista li+li{margin-top:1mm}
.ruta .intyglista li{line-height:1.3}`,
}
