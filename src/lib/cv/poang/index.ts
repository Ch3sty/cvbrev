/**
 * Läsbarhetspoängen i CV-analysen (docs/poangmodell-cv-analys.md).
 * Klientsäker: allt här är rena funktioner utan nätverk och utan AI.
 */
export {
  POANG_VERSION,
  KATEGORIER,
  ROLLER_SOM_RAKNAS,
  raknaPoang,
  poangFor,
  type Poang,
  type Kategori,
  type KategoriId,
  type Kontroll,
} from './modell'
export { kanonisktCv, sprakUrText } from './kanon'
export {
  genomgang,
  delarMedPoangKvar,
  type GenomgangDel,
  type GenomgangKontroll,
  type GenomgangAvsnitt,
  type KontrollStatus,
  type Brist,
} from './genomgang'
export { arkKontakt, kontaktPaArket, PROFIL_KONTAKT_FALT, type ArkKontakt, type KontaktKalla } from './kontakt'
export {
  KOMPLETTERANDE,
  byggForbattratCv,
  poangMedVal,
  allaVal,
  forvaltVal,
  poangSammanfattning,
  poangsattAnalys,
  medSammanfattning,
  poangForRad,
  matchaRoller,
  type Val,
  type Redigeringar,
  type AnalysForPoang,
  type PoangSammanfattning,
  type PoangKategori,
  type CvRad,
} from './forslag'
export { analysForKlient } from './utlamning'
export {
  platshallareKvar,
  platshallareIRad,
  medSiffror,
  plusForSiffror,
  SIFFRA_FOR_PLUS,
  type PlatshallareKvar,
  type SiffrorAvsnitt,
} from './siffror'
export {
  delaKompetens,
  stadaKompetenser,
  kompetenserIcv,
  PLATSHALLARE_TAL,
  harPlatshallare,
  ersattPahittadeTal,
  harTal,
} from './matt'
