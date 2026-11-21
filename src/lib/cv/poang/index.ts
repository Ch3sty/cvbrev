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
  KOMPLETTERANDE,
  byggForbattratCv,
  poangMedVal,
  allaVal,
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
export { delaKompetens, stadaKompetenser, kompetenserIcv } from './matt'
