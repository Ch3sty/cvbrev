/**
 * PROVISORISK mall för att prova systemet: tonad sidospalt till vänster med
 * runt foto, kontakt, kompetenser, språk och intyg; huvudet med namnet
 * ovanför huvudspalten. Ersätts av art-directorns utbud och når aldrig main.
 */
import { franKatalog } from '../katalog'
import type { MallDef } from '../typer'

export const provSidospalt: MallDef = {
  ...franKatalog('prov-sidospalt'),
  typsnitt: { brod: 'arial', rubrik: 'georgia', rubrikFast: true },
  grad: { brod: 10, namn: 26, titel: 12, rubrik: 11, posttitel: 10.5, liten: 9 },
  radavstand: 1.3,
  sida: { topp: 16, botten: 14, sida: 14 },
  farger: { text: '#1d2430', dampad: '#5e6878', linje: '#d8dde3', namn: 'accent', titel: 'text', arbetsgivare: 'accent' },
  huvud: { layout: 'vanster', kontakt: 'lista', luftUnder: 4 },
  rubrik: {
    placering: 'ovanfor',
    versaler: false,
    sparrning: 0,
    farg: 'accent',
    linje: { var: 'vanster', farg: 'accent', pt: 2.25 },
    luftOver: 5,
    luftUnder: 2,
  },
  post: { period: 'under', arbetsgivare: 'egen-rad', luftMellan: 3.5, linjeMellan: { farg: 'linje', pt: 0.5 } },
  punkt: { tecken: '–', farg: 'accent' },
  kompetenser: 'grupper',
  sprak: 'lista',
  sidospalt: {
    sida: 'vanster',
    bredd: 62,
    bakgrund: 'ton',
    luft: 6,
    mellanrum: 8,
    kontakt: true,
    kontaktRubrik: 'Kontakt',
    sektioner: ['kompetenser', 'sprak', 'intyg', 'intressen'],
    kompetenser: 'lista',
  },
  foto: { form: 'rund', plats: 'sidospalt', storlek: 34, forval: true },
  ordning: ['profil', 'erfarenhet', 'utbildning', 'projekt', 'referenser'],
  enSida: { grad: -0.5, marginal: 0.85, luft: 0.7 },
}
