/**
 * Gamla mall-id till sina efterföljare (plan avsnitt 4, spec avsnitt 4
 * punkt 16). Permanent: sparade val i cv_texts och formatted_cv_downloads,
 * länkar med ?mall= på CDN-cachade sidor och yrkesdatan pekar på gamla id,
 * och inget av det får gå sönder när de gamla mallarna är borta.
 *
 * Regeln: en gammal gratismall pekar alltid på en gratismall (ingen förlorar
 * det hon redan haft gratis), övriga på den nya mall som liknar dem mest i
 * form: enspaltiga på Linne, sidopaneler på Kalksten, serif på Antikva eller
 * Folio. `linje` pekar på Stål, aldrig på Linne (saas-lead: namnlikheten
 * förvirrar i support och loggar).
 *
 * Klientsäker och liten. Testet i __tests__/mallsystemet.test.ts fäller om
 * ett gammalt id saknas eller pekar på en mall som inte finns.
 */
import { FORVALD_MALL_ID, getMallKort } from './katalog'

export const MALL_ALIAS: Readonly<Record<string, string>> = {
  // De tre gamla gratismallarna: alltid till en gratismall.
  norrsken: 'linne',
  'student-startup': 'bjork',
  'sidebar-icons': 'bjork',
  // Övriga 38 i registret före 2026-11-16.
  'norrsken-plus': 'koppar',
  'student-plus': 'bjork',
  aurora: 'koppar',
  atlas: 'kolumn',
  galleri: 'siluett',
  pedagog: 'kalksten',
  aspekt: 'raster',
  klinik: 'kalksten',
  skymning: 'morkrum',
  disk: 'raster',
  'disk-plus': 'raster',
  logistik: 'granit',
  'logistik-plus': 'granit',
  verkstad: 'fasad',
  'verkstad-plus': 'fasad',
  myndighet: 'antikva',
  'myndighet-plus': 'antikva',
  konto: 'arsring',
  'konto-plus': 'arsring',
  'tidlos-formell': 'antikva',
  'tidlos-plus': 'antikva',
  'stack-developer': 'stal',
  'stack-plus': 'stal',
  'hantverkare-plus': 'fasad',
  bygg: 'fasad',
  'sidopanel-plus': 'kalksten',
  'varden-omsorg': 'kalksten',
  forskare: 'folio',
  servering: 'terrakotta',
  linje: 'stal',
  spektrum: 'horisont',
  kvist: 'terrakotta',
  magasin: 'tidning',
  karta: 'ritning',
  avtryck: 'tusch',
  'editorial-magazine': 'tidning',
  'konsult-kompakt': 'stal',
  'bold-modern': 'fasad',
  // Äldre id som finns i formatted_cv_downloads men inte i registret 2026-11-16.
  'modern-minimal': 'linne',
  'classic-professional': 'antikva',
  'clean-corporate': 'linne',
  'creative-minimal': 'linne',
  'creative-edge': 'kvadrat',
  'platinum-executive': 'folio',
  'executive-premium': 'folio',
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
