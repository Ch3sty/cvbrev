import type { SektionId } from '../base'

/** Sektionsrubrikerna som mallarnas PDF:er använder. Varje mall byter de egna. */
export const RUBRIKER: Record<SektionId, string> = {
  profil: 'Profil',
  kompetensSpalter: 'Kompetenser',
  behorigheter: 'Behörigheter & körkort',
  arbetsplatser: 'Arbetsplatser',
  erfarenhet: 'Arbetslivserfarenhet',
  utbildning: 'Utbildning',
  projekt: 'Projekt',
  kompetenser: 'Kompetenser',
  sprak: 'Språk',
  certifieringar: 'Certifieringar',
}

export const REFERENSER = 'Referenser lämnas på begäran'
