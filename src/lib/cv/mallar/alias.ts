/**
 * Gamla mall-id till sina efterföljare (plan avsnitt 4). Permanent: sparade
 * val i cv_texts och formatted_cv_downloads, länkar med ?mall= på
 * CDN-cachade sidor och yrkesdatan pekar på gamla id, och inget av det får
 * gå sönder när de gamla mallarna tas bort.
 *
 * Regeln: en gammal gratismall pekar alltid på en gratismall (ingen förlorar
 * det hon redan haft gratis), en premiummall på den nya mall som liknar den
 * mest i form.
 *
 * Klientsäker och liten. Testet i __tests__/mallsystemet.test.ts fäller om
 * ett gammalt id saknas eller pekar på en mall som inte finns.
 *
 * PROVISORISK KARTA: tills art-directorns utbud är byggt pekar alla på de två
 * provmallarna. Den slutliga kartan sätts när utbudet finns.
 */
import { FORVALD_MALL_ID, getMallKort } from './katalog'

const ENSPALT = 'prov-enspalt'
const SIDOSPALT = 'prov-sidospalt'

export const MALL_ALIAS: Readonly<Record<string, string>> = {
  // De 41 mallarna i registret före 2026-11-16.
  norrsken: ENSPALT,
  'student-startup': ENSPALT,
  'sidebar-icons': ENSPALT,
  aurora: SIDOSPALT,
  atlas: SIDOSPALT,
  galleri: SIDOSPALT,
  pedagog: SIDOSPALT,
  aspekt: SIDOSPALT,
  klinik: SIDOSPALT,
  skymning: SIDOSPALT,
  disk: SIDOSPALT,
  logistik: SIDOSPALT,
  verkstad: SIDOSPALT,
  myndighet: SIDOSPALT,
  konto: SIDOSPALT,
  'disk-plus': SIDOSPALT,
  'logistik-plus': SIDOSPALT,
  'verkstad-plus': SIDOSPALT,
  'myndighet-plus': SIDOSPALT,
  'konto-plus': SIDOSPALT,
  'norrsken-plus': SIDOSPALT,
  'tidlos-plus': SIDOSPALT,
  'stack-plus': SIDOSPALT,
  'hantverkare-plus': SIDOSPALT,
  'student-plus': SIDOSPALT,
  'sidopanel-plus': SIDOSPALT,
  bygg: SIDOSPALT,
  forskare: SIDOSPALT,
  servering: SIDOSPALT,
  linje: SIDOSPALT,
  spektrum: SIDOSPALT,
  kvist: SIDOSPALT,
  magasin: SIDOSPALT,
  karta: SIDOSPALT,
  avtryck: SIDOSPALT,
  'editorial-magazine': SIDOSPALT,
  'tidlos-formell': SIDOSPALT,
  'konsult-kompakt': SIDOSPALT,
  'stack-developer': SIDOSPALT,
  'bold-modern': SIDOSPALT,
  'varden-omsorg': SIDOSPALT,
  // Äldre id som finns i formatted_cv_downloads men inte i registret 2026-11-16.
  'modern-minimal': ENSPALT,
  'classic-professional': ENSPALT,
  'clean-corporate': ENSPALT,
  'creative-minimal': ENSPALT,
  'creative-edge': ENSPALT,
  'platinum-executive': ENSPALT,
  'executive-premium': ENSPALT,
}

/**
 * Mallens id efter alias, eller null om id:t är okänt. Ett id som redan finns
 * i katalogen returneras som det är.
 */
export function losMallId(id: unknown): string | null {
  if (typeof id !== 'string' || !id) return null
  if (getMallKort(id)) return id
  const ny = MALL_ALIAS[id]
  return ny && getMallKort(ny) ? ny : null
}

/** Som losMallId, men ett okänt id ger förvalsmallen. */
export function losMallIdEllerForval(id: unknown): string {
  return losMallId(id) ?? FORVALD_MALL_ID
}
