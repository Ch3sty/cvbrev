/**
 * PROVISORISK mall för att prova systemet: enspaltig, vänsterställt huvud,
 * rubriker med linje under, perioden högerställd. Ersätts av art-directorns
 * utbud och når aldrig main.
 */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'

export const provEnspalt: MallDef = {
  ...franKatalog('prov-enspalt'),
  typsnitt: { brod: 'calibri' },
  grad: { brod: 10.5, namn: 24, titel: 12, rubrik: 11, posttitel: 11, liten: 9.5 },
  radavstand: 1.3,
  sida: { topp: 18, botten: 16, sida: 20 },
  farger: { text: '#1f2937', dampad: '#5b6472', linje: '#d6dae0', titel: 'accent', arbetsgivare: 'dampad' },
  huvud: { layout: 'vanster', kontakt: 'rad', luftUnder: 6, linjeUnder: { farg: 'linje', pt: 0.75 } },
  rubrik: {
    placering: 'ovanfor',
    versaler: true,
    sparrning: 0.06,
    farg: 'accent',
    linje: { var: 'under', farg: 'linje', pt: 0.75 },
    luftOver: 6,
    luftUnder: 2.5,
  },
  post: { period: 'hoger', arbetsgivare: 'egen-rad', luftMellan: 3.5 },
  punkt: { tecken: '•', farg: 'accent' },
  kompetenser: 'grupper',
  sprak: 'rad',
  ordning: ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'intyg', 'sprak', 'projekt', 'intressen', 'referenser'],
  enSida: { grad: -0.5, marginal: 0.8, luft: 0.7 },
}
